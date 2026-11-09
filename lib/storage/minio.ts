import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export interface Bucket {
  name: string;
  creationDate: string;
  region?: string;
  publicAccess: boolean;
  sizeBytes?: number;
  objectCount?: number;
}

export interface StorageObject {
  key: string;
  size: number;
  lastModified: string;
  etag: string;
  contentType?: string;
}

export interface MinIOResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * MinIO S3-compatible Object Storage Client.
 * Uses direct fetch with AWS Signature V4 without external heavy SDK dependencies.
 */
export class MinIOClient {
  private config: Record<string, any>;
  private configLoaded: boolean = false;

  /**
   * Initializes the MinIO storage client.
   * @param config Optional initial configuration object (e.g. from provisioning_settings).
   */
  constructor(config?: Record<string, any>) {
    this.config = config ? { ...config } : {};
  }

  /**
   * Resolves a configuration value from explicit config, Supabase provisioning_settings row id=1, or environment variables.
   */
  private async getConfigValue(key: string, envVar?: string): Promise<string | undefined> {
    if (this.config[key] !== undefined && this.config[key] !== '') {
      return String(this.config[key]);
    }

    if (!this.configLoaded) {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (supabaseUrl && supabaseServiceKey) {
          const supabase = createClient(supabaseUrl, supabaseServiceKey);
          const { data } = await supabase.from('provisioning_settings').select('*').eq('id', 1).single();
          if (data) {
            this.config = { ...data, ...this.config };
          }
        }
      } catch (err: any) {
        console.warn('[MinIOClient] Failed to load configuration from Supabase:', err.message);
      }
      this.configLoaded = true;
    }

    if (this.config[key] !== undefined && this.config[key] !== '') {
      return String(this.config[key]);
    }

    if (envVar && process.env[envVar] !== undefined && process.env[envVar] !== '') {
      return process.env[envVar];
    }

    return undefined;
  }

  /**
   * Helper to compute SHA256 hex digest.
   */
  private sha256(data: string | Buffer): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Helper to compute HMAC-SHA256 buffer.
   */
  private hmac(key: string | Buffer, data: string): Buffer {
    return crypto.createHmac('sha256', key).update(data).digest();
  }

  /**
   * Encodes a URI path according to RFC 3986.
   */
  private encodeRfc3986(str: string): string {
    return encodeURIComponent(str).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
  }

  /**
   * Derives AWS Signature V4 Signing Key.
   */
  private getSignatureKey(key: string, dateStamp: string, regionName: string, serviceName: string): Buffer {
    const kDate = crypto.createHmac('sha256', 'AWS4' + key).update(dateStamp).digest();
    const kRegion = crypto.createHmac('sha256', kDate).update(regionName).digest();
    const kService = crypto.createHmac('sha256', kRegion).update(serviceName).digest();
    return crypto.createHmac('sha256', kService).update('aws4_request').digest();
  }

  /**
   * Signs an HTTP request using AWS Signature V4.
   * @param method HTTP Method
   * @param path Request path
   * @param query URL Query parameters
   * @param headers Request headers
   * @param body Optional request body
   */
  private async signRequest(
    method: string,
    path: string,
    query: Record<string, string> = {},
    headers: Record<string, string> = {},
    body?: string | Buffer
  ): Promise<{ url: string; headers: Record<string, string> }> {
    const endpoint = (await this.getConfigValue('minio_endpoint', 'MINIO_ENDPOINT')) || 'localhost:9000';
    const accessKey = (await this.getConfigValue('minio_access_key', 'MINIO_ACCESS_KEY')) || '';
    const secretKey = (await this.getConfigValue('minio_secret_key', 'MINIO_SECRET_KEY')) || '';
    const useSslVal = await this.getConfigValue('minio_use_ssl', 'MINIO_USE_SSL');
    const useSsl = useSslVal === 'true' || useSslVal === '1';

    const cleanEndpoint = endpoint.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
    const protocol = useSsl ? 'https' : 'http';
    const host = cleanEndpoint;
    const region = 'us-east-1';

    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.substring(0, 8);

    const payloadBuffer = body ? (Buffer.isBuffer(body) ? body : Buffer.from(body, 'utf-8')) : Buffer.alloc(0);
    const payloadHash = this.sha256(payloadBuffer);

    // Normalize canonical URI
    const canonicalUri = path.startsWith('/') ? path : `/${path}`;

    // Normalize canonical Query string
    const queryKeys = Object.keys(query).sort();
    const canonicalQueryString = queryKeys
      .map((k) => `${this.encodeRfc3986(k)}=${this.encodeRfc3986(query[k])}`)
      .join('&');

    // Build headers for signing
    const signedHeadersMap: Record<string, string> = {
      ...headers,
      host,
      'x-amz-date': amzDate,
      'x-amz-content-sha256': payloadHash,
    };

    const sortedHeaderKeys = Object.keys(signedHeadersMap)
      .map((k) => k.toLowerCase())
      .sort();

    const canonicalHeaders = sortedHeaderKeys
      .map((k) => `${k}:${signedHeadersMap[k].trim()}\n`)
      .join('');

    const signedHeaders = sortedHeaderKeys.join(';');

    const canonicalRequest = [
      method.toUpperCase(),
      canonicalUri,
      canonicalQueryString,
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join('\n');

    const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
    const stringToSign = [
      'AWS4-HMAC-SHA256',
      amzDate,
      credentialScope,
      this.sha256(canonicalRequest),
    ].join('\n');

    const signingKey = this.getSignatureKey(secretKey, dateStamp, region, 's3');
    const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');

    const authorizationHeader = `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const finalHeaders: Record<string, string> = {
      ...signedHeadersMap,
      Authorization: authorizationHeader,
    };

    const finalUrl = `${protocol}://${host}${canonicalUri}${canonicalQueryString ? `?${canonicalQueryString}` : ''}`;

    return { url: finalUrl, headers: finalHeaders };
  }

  /**
   * Creates a new S3 bucket.
   * @param name Bucket name
   * @param region Optional bucket region
   */
  async createBucket(name: string, region: string = 'us-east-1'): Promise<MinIOResponse<void>> {
    try {
      const path = `/${name}`;
      let body: string | undefined;

      if (region && region !== 'us-east-1') {
        body = `<CreateBucketConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/"><LocationConstraint>${region}</LocationConstraint></CreateBucketConfiguration>`;
      }

      const { url, headers } = await this.signRequest('PUT', path, {}, {}, body);
      const res = await fetch(url, {
        method: 'PUT',
        headers,
        body,
      });

      if (!res.ok && res.status !== 409) {
        const errorText = await res.text();
        return { success: false, error: `Failed to create bucket: ${errorText}` };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while creating bucket' };
    }
  }

  /**
   * Deletes an existing bucket.
   * @param name Bucket name
   */
  async deleteBucket(name: string): Promise<MinIOResponse<void>> {
    try {
      const path = `/${name}`;
      const { url, headers } = await this.signRequest('DELETE', path);
      const res = await fetch(url, { method: 'DELETE', headers });

      if (!res.ok && res.status !== 404) {
        const errorText = await res.text();
        return { success: false, error: `Failed to delete bucket: ${errorText}` };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while deleting bucket' };
    }
  }

  /**
   * Lists all buckets in the object storage account.
   */
  async listBuckets(): Promise<MinIOResponse<Bucket[]>> {
    try {
      const { url, headers } = await this.signRequest('GET', '/');
      const res = await fetch(url, { method: 'GET', headers });

      if (!res.ok) {
        const errorText = await res.text();
        return { success: false, error: `Failed to list buckets: ${errorText}` };
      }

      const xml = await res.text();
      const buckets: Bucket[] = [];
      const bucketRegex = /<Bucket>([\s\S]*?)<\/Bucket>/g;
      let match: RegExpExecArray | null;

      while ((match = bucketRegex.exec(xml)) !== null) {
        const content = match[1];
        const nameMatch = content.match(/<Name>(.*?)<\/Name>/);
        const dateMatch = content.match(/<CreationDate>(.*?)<\/CreationDate>/);

        if (nameMatch) {
          buckets.push({
            name: nameMatch[1],
            creationDate: dateMatch ? dateMatch[1] : new Date().toISOString(),
            publicAccess: false,
          });
        }
      }

      return { success: true, data: buckets };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while listing buckets' };
    }
  }

  /**
   * Lists objects inside a specific bucket with optional prefix filtering.
   * @param bucket Bucket name
   * @param prefix Optional prefix filter
   */
  async listObjects(bucket: string, prefix?: string): Promise<MinIOResponse<StorageObject[]>> {
    try {
      const path = `/${bucket}`;
      const query: Record<string, string> = { 'list-type': '2' };
      if (prefix) {
        query.prefix = prefix;
      }

      const { url, headers } = await this.signRequest('GET', path, query);
      const res = await fetch(url, { method: 'GET', headers });

      if (!res.ok) {
        const errorText = await res.text();
        return { success: false, error: `Failed to list objects in bucket ${bucket}: ${errorText}` };
      }

      const xml = await res.text();
      const objects: StorageObject[] = [];
      const contentsRegex = /<Contents>([\s\S]*?)<\/Contents>/g;
      let match: RegExpExecArray | null;

      while ((match = contentsRegex.exec(xml)) !== null) {
        const item = match[1];
        const keyMatch = item.match(/<Key>(.*?)<\/Key>/);
        const sizeMatch = item.match(/<Size>(.*?)<\/Size>/);
        const dateMatch = item.match(/<LastModified>(.*?)<\/LastModified>/);
        const etagMatch = item.match(/<ETag>(.*?)<\/ETag>/);

        if (keyMatch) {
          objects.push({
            key: keyMatch[1],
            size: sizeMatch ? parseInt(sizeMatch[1], 10) : 0,
            lastModified: dateMatch ? dateMatch[1] : new Date().toISOString(),
            etag: etagMatch ? etagMatch[1].replace(/&quot;|"/g, '') : '',
          });
        }
      }

      return { success: true, data: objects };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while listing objects' };
    }
  }

  /**
   * Uploads an object into the specified bucket.
   * @param bucket Target bucket name
   * @param key Storage key / path
   * @param body File payload (Buffer or string)
   * @param contentType Content MIME type
   */
  async putObject(bucket: string, key: string, body: Buffer | string, contentType: string): Promise<MinIOResponse<{ etag?: string }>> {
    try {
      const cleanKey = key.startsWith('/') ? key.slice(1) : key;
      const path = `/${bucket}/${cleanKey}`;
      const customHeaders = {
        'content-type': contentType || 'application/octet-stream',
      };

      const { url, headers } = await this.signRequest('PUT', path, {}, customHeaders, body);
      const res = await fetch(url, {
        method: 'PUT',
        headers,
        body: (Buffer.isBuffer(body) ? body : Buffer.from(body, 'utf-8')) as any,
      });

      if (!res.ok) {
        const errorText = await res.text();
        return { success: false, error: `Failed to put object: ${errorText}` };
      }

      const etag = res.headers.get('etag')?.replace(/"/g, '') || undefined;
      return { success: true, data: { etag } };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while uploading object' };
    }
  }

  /**
   * Deletes an object from the specified bucket.
   * @param bucket Bucket name
   * @param key Storage object key
   */
  async deleteObject(bucket: string, key: string): Promise<MinIOResponse<void>> {
    try {
      const cleanKey = key.startsWith('/') ? key.slice(1) : key;
      const path = `/${bucket}/${cleanKey}`;

      const { url, headers } = await this.signRequest('DELETE', path);
      const res = await fetch(url, { method: 'DELETE', headers });

      if (!res.ok && res.status !== 404) {
        const errorText = await res.text();
        return { success: false, error: `Failed to delete object: ${errorText}` };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while deleting object' };
    }
  }

  /**
   * Generates a pre-signed URL with AWS Signature V4 query authentication.
   * @param bucket Bucket name
   * @param key Object key
   * @param ttlSeconds Expiration duration in seconds
   * @param method HTTP method ('GET' or 'PUT')
   */
  async getPresignedUrl(
    bucket: string,
    key: string,
    ttlSeconds: number = 3600,
    method: 'GET' | 'PUT' = 'GET'
  ): Promise<MinIOResponse<{ url: string }>> {
    try {
      const endpoint = (await this.getConfigValue('minio_endpoint', 'MINIO_ENDPOINT')) || 'localhost:9000';
      const accessKey = (await this.getConfigValue('minio_access_key', 'MINIO_ACCESS_KEY')) || '';
      const secretKey = (await this.getConfigValue('minio_secret_key', 'MINIO_SECRET_KEY')) || '';
      const useSslVal = await this.getConfigValue('minio_use_ssl', 'MINIO_USE_SSL');
      const useSsl = useSslVal === 'true' || useSslVal === '1';

      const cleanEndpoint = endpoint.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
      const protocol = useSsl ? 'https' : 'http';
      const host = cleanEndpoint;
      const region = 'us-east-1';

      const now = new Date();
      const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
      const dateStamp = amzDate.substring(0, 8);
      const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;

      const cleanKey = key.startsWith('/') ? key.slice(1) : key;
      const canonicalUri = `/${bucket}/${cleanKey}`;

      const queryParams: Record<string, string> = {
        'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
        'X-Amz-Credential': `${accessKey}/${credentialScope}`,
        'X-Amz-Date': amzDate,
        'X-Amz-Expires': ttlSeconds.toString(),
        'X-Amz-SignedHeaders': 'host',
      };

      const sortedQueryKeys = Object.keys(queryParams).sort();
      const canonicalQueryString = sortedQueryKeys
        .map((k) => `${this.encodeRfc3986(k)}=${this.encodeRfc3986(queryParams[k])}`)
        .join('&');

      const canonicalHeaders = `host:${host}\n`;
      const signedHeaders = 'host';
      const payloadHash = 'UNSIGNED-PAYLOAD';

      const canonicalRequest = [
        method.toUpperCase(),
        canonicalUri,
        canonicalQueryString,
        canonicalHeaders,
        signedHeaders,
        payloadHash,
      ].join('\n');

      const stringToSign = [
        'AWS4-HMAC-SHA256',
        amzDate,
        credentialScope,
        this.sha256(canonicalRequest),
      ].join('\n');

      const signingKey = this.getSignatureKey(secretKey, dateStamp, region, 's3');
      const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');

      const presignedUrl = `${protocol}://${host}${canonicalUri}?${canonicalQueryString}&X-Amz-Signature=${signature}`;

      return { success: true, data: { url: presignedUrl } };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while generating presigned URL' };
    }
  }

  /**
   * Sets or clears the bucket access policy.
   * @param bucket Bucket name
   * @param policy 'private' or 'public-read'
   */
  async setBucketPolicy(bucket: string, policy: 'private' | 'public-read'): Promise<MinIOResponse<void>> {
    try {
      const path = `/${bucket}`;
      const query = { policy: '' };

      if (policy === 'public-read') {
        const policyJson = JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Sid: 'PublicReadGetObject',
              Effect: 'Allow',
              Principal: '*',
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${bucket}/*`],
            },
          ],
        });

        const { url, headers } = await this.signRequest('PUT', path, query, { 'content-type': 'application/json' }, policyJson);
        const res = await fetch(url, { method: 'PUT', headers, body: policyJson });
        if (!res.ok) {
          const errorText = await res.text();
          return { success: false, error: `Failed to set bucket policy: ${errorText}` };
        }
      } else {
        const { url, headers } = await this.signRequest('DELETE', path, query);
        const res = await fetch(url, { method: 'DELETE', headers });
        if (!res.ok && res.status !== 404) {
          const errorText = await res.text();
          return { success: false, error: `Failed to reset bucket policy: ${errorText}` };
        }
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while setting bucket policy' };
    }
  }

  /**
   * Calculates metrics for a bucket by summing object counts and sizes.
   * @param bucket Bucket name
   */
  async getBucketMetrics(bucket: string): Promise<MinIOResponse<{ sizeBytes: number; objectCount: number }>> {
    try {
      const listRes = await this.listObjects(bucket);
      if (!listRes.success || !listRes.data) {
        return { success: false, error: listRes.error || 'Failed to calculate bucket metrics' };
      }

      let sizeBytes = 0;
      for (const obj of listRes.data) {
        sizeBytes += obj.size;
      }

      return {
        success: true,
        data: {
          sizeBytes,
          objectCount: listRes.data.length,
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while retrieving bucket metrics' };
    }
  }
}

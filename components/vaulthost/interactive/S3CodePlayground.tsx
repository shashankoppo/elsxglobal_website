'use client';

import { useState } from 'react';
import { 
  Code2, Copy, Check, Play, Terminal, HardDrive, 
  ExternalLink, Sparkles, Layers, ShieldCheck, ArrowRight, RefreshCw
} from 'lucide-react';
import { PanelCard } from '@/components/ui/panel-card';

type Lang = 'typescript' | 'curl' | 'python' | 'go';
type ActionType = 'put' | 'get' | 'list' | 'presigned';

export function S3CodePlayground() {
  const [lang, setLang] = useState<Lang>('typescript');
  const [action, setAction] = useState<ActionType>('put');
  const [bucket, setBucket] = useState('enterprise-assets');
  const [key, setKey] = useState('uploads/contracts/2026-sla.pdf');
  const [copied, setCopied] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<{
    status: number;
    statusText: string;
    latencyMs: number;
    headers: Record<string, string>;
    body: any;
  } | null>(null);

  const getSnippet = () => {
    switch (action) {
      case 'put':
        if (lang === 'typescript') {
          return `import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { readFileSync } from "fs";

const s3 = new S3Client({
  region: "auto",
  endpoint: "https://r2.vaulthost.cloud",
  credentials: {
    accessKeyId: process.env.VH_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.VH_R2_SECRET_ACCESS_KEY!,
  },
});

const fileBuffer = readFileSync("${key}");

const response = await s3.send(new PutObjectCommand({
  Bucket: "${bucket}",
  Key: "${key}",
  Body: fileBuffer,
  ContentType: "application/pdf",
  Metadata: {
    "x-vaulthost-egress": "zero-fee",
    "x-uploaded-by": "service-account-prod"
  }
}));

console.log("Uploaded successfully. ETag:", response.ETag);`;
        }
        if (lang === 'curl') {
          return `curl -X PUT "https://r2.vaulthost.cloud/${bucket}/${key}" \\
  -H "Authorization: AWS4-HMAC-SHA256 Credential=vh_live_9f83.../20260928/auto/s3/aws4_request..." \\
  -H "Content-Type: application/pdf" \\
  -H "x-amz-content-sha256: UNSIGNED-PAYLOAD" \\
  --data-binary "@${key}"`;
        }
        if (lang === 'python') {
          return `import boto3
from botocore.config import Config

s3 = boto3.client(
    's3',
    endpoint_url='https://r2.vaulthost.cloud',
    aws_access_key_id='vh_live_9f83a8b27c1094ea',
    aws_secret_access_key='vh_sec_e830192a...',
    config=Config(signature_version='s3v4')
)

with open('${key}', 'rb') as f:
    response = s3.put_object(
        Bucket='${bucket}',
        Key='${key}',
        Body=f,
        ContentType='application/pdf'
    )

print(f"Object stored: {response['ETag']}")`;
        }
        return `package main

import (
    "context"
    "fmt"
    "os"
    "github.com/aws/aws-sdk-go-v2/aws"
    "github.com/aws/aws-sdk-go-v2/config"
    "github.com/aws/aws-sdk-go-v2/service/s3"
)

func main() {
    customResolver := aws.EndpointResolverWithOptionsFunc(
        func(service, region string, options ...interface{}) (aws.Endpoint, error) {
            return aws.Endpoint{
                URL:           "https://r2.vaulthost.cloud",
                SigningRegion: "auto",
            }, nil
        })

    cfg, _ := config.LoadDefaultConfig(context.TODO(),
        config.WithEndpointResolverWithOptions(customResolver),
    )

    client := s3.NewFromConfig(cfg)
    file, _ := os.Open("${key}")
    defer file.Close()

    _, err := client.PutObject(context.TODO(), &s3.PutObjectInput{
        Bucket: aws.String("${bucket}"),
        Key:    aws.String("${key}"),
        Body:   file,
    })
    if err == nil {
        fmt.Println("Upload completed with zero egress fees")
    }
}`;

      case 'get':
        if (lang === 'typescript') {
          return `import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "auto",
  endpoint: "https://r2.vaulthost.cloud",
  credentials: {
    accessKeyId: process.env.VH_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.VH_R2_SECRET_ACCESS_KEY!,
  },
});

const response = await s3.send(new GetObjectCommand({
  Bucket: "${bucket}",
  Key: "${key}",
}));

// Direct edge streaming without egress bandwidth surcharges
const dataStream = response.Body;`;
        }
        if (lang === 'curl') {
          return `curl -X GET "https://r2.vaulthost.cloud/${bucket}/${key}" \\
  -H "Authorization: AWS4-HMAC-SHA256 ..." \\
  --output downloaded-file.pdf`;
        }
        if (lang === 'python') {
          return `import boto3

s3 = boto3.client('s3', endpoint_url='https://r2.vaulthost.cloud')
response = s3.get_object(Bucket='${bucket}', Key='${key}')
content = response['Body'].read()
print(f"Downloaded {len(content)} bytes without egress charges")`;
        }
        return `resp, err := client.GetObject(context.TODO(), &s3.GetObjectInput{
    Bucket: aws.String("${bucket}"),
    Key:    aws.String("${key}"),
})
// Stream object bytes directly from nearest edge PoP`;

      case 'list':
        if (lang === 'typescript') {
          return `import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "auto",
  endpoint: "https://r2.vaulthost.cloud",
  credentials: { ... }
});

const { Contents, KeyCount } = await s3.send(new ListObjectsV2Command({
  Bucket: "${bucket}",
  Prefix: "uploads/",
  MaxKeys: 100,
}));

console.log(\`Found \${KeyCount} objects in \${bucket}\`);`;
        }
        if (lang === 'curl') {
          return `curl -X GET "https://r2.vaulthost.cloud/${bucket}?list-type=2&prefix=uploads/&max-keys=100" \\
  -H "Authorization: AWS4-HMAC-SHA256 ..."`;
        }
        if (lang === 'python') {
          return `response = s3.list_objects_v2(Bucket='${bucket}', Prefix='uploads/', MaxKeys=100)
for obj in response.get('Contents', []):
    print(f"Key: {obj['Key']} | Size: {obj['Size']} bytes")`;
        }
        return `resp, err := client.ListObjectsV2(context.TODO(), &s3.ListObjectsV2Input{
    Bucket: aws.String("${bucket}"),
    Prefix: aws.String("uploads/"),
})`;

      case 'presigned':
        if (lang === 'typescript') {
          return `import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: "auto",
  endpoint: "https://r2.vaulthost.cloud",
  credentials: { ... }
});

const command = new PutObjectCommand({
  Bucket: "${bucket}",
  Key: "${key}",
});

// Generate client-side direct upload link valid for 15 minutes
const presignedUploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 });
console.log("Direct browser upload URL:", presignedUploadUrl);`;
        }
        if (lang === 'curl') {
          return `# Step 1: Request presigned URL from backend
# Step 2: Directly upload binary from client browser:
curl -X PUT "https://r2.vaulthost.cloud/${bucket}/${key}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires=900..." \\
  --upload-file local-file.pdf`;
        }
        if (lang === 'python') {
          return `from botocore.client import Config
url = s3.generate_presigned_url(
    'put_object',
    Params={'Bucket': '${bucket}', 'Key': '${key}'},
    ExpiresIn=900
)
print("Presigned upload URL:", url)`;
        }
        return `presignClient := s3.NewPresignClient(client)
req, err := presignClient.PresignPutObject(context.TODO(), &s3.PutObjectInput{
    Bucket: aws.String("${bucket}"),
    Key:    aws.String("${key}"),
}, s3.WithPresignExpires(15 * time.Minute))`;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getSnippet());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulate = () => {
    setExecuting(true);
    setExecutionResult(null);

    setTimeout(() => {
      const etag = `"${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}"`;
      const requestId = `vh_r2_${Math.random().toString(36).substring(2, 11)}`;
      
      let resBody: any = {};
      if (action === 'put') {
        resBody = {
          success: true,
          bucket,
          key,
          etag,
          sizeBytes: 1048576,
          egressCost: "₹0.00",
          replicationStatus: "GLOBAL_300_POPS_REPLICATED"
        };
      } else if (action === 'get') {
        resBody = {
          status: "STREAM_READY",
          bucket,
          key,
          contentType: "application/pdf",
          contentLength: "1,048,576 bytes",
          egressBandwidthBilled: "0 bytes (Free within VaultHost Anycast)"
        };
      } else if (action === 'list') {
        resBody = {
          isTruncated: false,
          keyCount: 3,
          contents: [
            { key: `${key}`, size: 1048576, lastModified: new Date().toISOString(), etag },
            { key: `uploads/contracts/master-services.pdf`, size: 2097152, lastModified: new Date(Date.now() - 86400000).toISOString(), etag: '"39f1c712"' },
            { key: `uploads/brand/logo-vector.svg`, size: 45012, lastModified: new Date(Date.now() - 172800000).toISOString(), etag: '"a8b2910f"' }
          ]
        };
      } else {
        resBody = {
          presignedUrl: `https://r2.vaulthost.cloud/${bucket}/${key}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=vh_live...&X-Amz-Expires=900`,
          expiresInSeconds: 900,
          authorizedAction: "s3:PutObject",
          directBrowserUploadAllowed: true
        };
      }

      setExecutionResult({
        status: action === 'put' ? 200 : action === 'get' ? 200 : action === 'list' ? 200 : 200,
        statusText: "OK",
        latencyMs: Math.floor(Math.random() * 4) + 2,
        headers: {
          "x-amz-request-id": requestId,
          "cf-ray": `88a1${Math.random().toString(16).substring(2, 6)}-BOM`,
          "x-vaulthost-egress-fee": "0.00_INR",
          "access-control-allow-origin": "*",
          "etag": etag
        },
        body: resBody
      });
      setExecuting(false);
    }, 450);
  };

  return (
    <div className="v4-panel p-6 rounded-3xl border-hairline bg-ink-surface/80">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-hairline">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-signal animate-pulse" />
            <h3 className="text-xl font-medium text-text-primary-v4 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-signal" /> Multi-Language S3 API Playground
            </h3>
          </div>
          <p className="text-xs text-text-muted-v4 mt-1">
            Zero changes required to your existing S3 SDK code. Switch languages, tweak parameters, and simulate live edge execution.
          </p>
        </div>

        {/* Language Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-ink-surface-2 border border-hairline text-xs font-mono">
          {(['typescript', 'curl', 'python', 'go'] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                lang === l
                  ? 'bg-signal text-black font-semibold shadow-sm'
                  : 'text-text-secondary-v4 hover:text-text-primary-v4'
              }`}
            >
              {l === 'typescript' ? 'Node.js (TS)' : l === 'curl' ? 'cURL' : l === 'python' ? 'Python' : 'Go'}
            </button>
          ))}
        </div>
      </div>

      {/* Control Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
        <div>
          <label className="text-[11px] font-mono uppercase tracking-wider text-text-muted-v4 mb-1.5 block">
            Operation
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'put', label: 'PutObject' },
              { id: 'get', label: 'GetObject' },
              { id: 'list', label: 'ListObjects' },
              { id: 'presigned', label: 'PresignedURL' },
            ].map((op) => (
              <button
                key={op.id}
                onClick={() => setAction(op.id as ActionType)}
                className={`px-3 py-2 text-xs rounded-xl font-mono border transition-all text-left ${
                  action === op.id
                    ? 'border-signal/50 bg-signal/10 text-signal font-semibold'
                    : 'border-hairline bg-ink-surface hover:border-hairline-2 text-text-secondary-v4'
                }`}
              >
                {op.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[11px] font-mono uppercase tracking-wider text-text-muted-v4 mb-1.5 block">
            Target Bucket
          </label>
          <input
            type="text"
            value={bucket}
            onChange={(e) => setBucket(e.target.value)}
            className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-ink-surface-2 border border-hairline text-text-primary-v4 focus:border-signal outline-none"
            placeholder="bucket-name"
          />
        </div>

        <div>
          <label className="text-[11px] font-mono uppercase tracking-wider text-text-muted-v4 mb-1.5 block">
            Object Key / Path
          </label>
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-ink-surface-2 border border-hairline text-text-primary-v4 focus:border-signal outline-none"
            placeholder="folder/file.ext"
          />
        </div>
      </div>

      {/* Code Editor Preview */}
      <div className="relative rounded-2xl bg-ink-surface-2 border border-hairline overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-hairline bg-ink/40 text-xs font-mono text-text-muted-v4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
            <span className="ml-2 text-text-secondary-v4">
              vault-r2-client.{lang === 'typescript' ? 'ts' : lang === 'curl' ? 'sh' : lang === 'python' ? 'py' : 'go'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-signal font-mono">Endpoint: https://r2.vaulthost.cloud</span>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs bg-ink-surface border border-hairline text-text-secondary-v4 hover:text-signal transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
        </div>

        <pre className="p-5 font-mono text-xs text-green-400 overflow-x-auto leading-relaxed max-h-[340px]">
          <code>{getSnippet()}</code>
        </pre>

        {/* Action Bar */}
        <div className="px-4 py-3 bg-ink/60 border-t border-hairline flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-text-muted-v4 font-mono">
            <ShieldCheck className="w-4 h-4 text-signal" />
            <span>Guaranteed zero bandwidth egress fee on all internal traffic</span>
          </div>

          <button
            onClick={handleSimulate}
            disabled={executing}
            className="v4-btn-primary px-5 py-2 rounded-xl text-xs font-mono font-medium flex items-center gap-2 group disabled:opacity-50"
          >
            {executing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Simulating Edge Call...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Run Edge Sandbox
              </>
            )}
          </button>
        </div>
      </div>

      {/* Live Simulation Response Output */}
      {executionResult && (
        <div className="mt-6 rounded-2xl bg-ink-surface-2 border border-signal/30 p-5 font-mono text-xs animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-hairline">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded-full bg-good/20 text-good border border-good/30 font-semibold text-[11px]">
                {executionResult.status} {executionResult.statusText}
              </span>
              <span className="text-text-muted-v4 text-[11px]">
                Edge Latency: <strong className="text-signal">{executionResult.latencyMs}ms</strong>
              </span>
            </div>
            <span className="text-text-muted-v4 text-[10px]">
              POP: BOM (Mumbai Anycast)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-text-muted-v4 mb-1">Response Headers</div>
              <div className="space-y-1 text-text-secondary-v4 text-[11px] bg-ink/50 p-2.5 rounded-xl border border-hairline">
                {Object.entries(executionResult.headers).map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-text-muted-v4">{k}:</span>
                    <span className="text-signal">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-wider text-text-muted-v4 mb-1">Response Body</div>
              <pre className="text-[11px] text-cyan-300 bg-ink/50 p-2.5 rounded-xl border border-hairline overflow-x-auto">
                {JSON.stringify(executionResult.body, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

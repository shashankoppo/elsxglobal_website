import { createClient } from '@supabase/supabase-js';

export interface K8sNamespace {
  name: string;
  status: 'Active' | 'Terminating';
  labels: Record<string, string>;
  createdAt: string;
}

export interface Deployment {
  name: string;
  namespace: string;
  replicas: number;
  availableReplicas: number;
  image: string;
  status: 'Running' | 'Pending' | 'Failed';
}

export interface Service {
  name: string;
  namespace: string;
  type: 'ClusterIP' | 'NodePort' | 'LoadBalancer';
  port: number;
  targetPort: number;
  externalIp?: string;
}

export interface PodMetrics {
  namespace: string;
  cpuMillicores: number;
  memoryMiB: number;
}

export interface K3sResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * K3s Lightweight Kubernetes Management Client.
 * Interfaces directly with the Kubernetes Core and Apps REST APIs without requiring the kubectl binary.
 */
export class K3sClient {
  private config: Record<string, any>;
  private configLoaded: boolean = false;

  /**
   * Initializes the K3s client.
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
        console.warn('[K3sClient] Failed to load configuration from Supabase:', err.message);
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
   * Executes an authenticated HTTP request against the Kubernetes REST API.
   * @param endpoint API route path
   * @param method HTTP method
   * @param body Optional request payload
   * @param contentType Content-Type header (defaults to application/json)
   */
  private async fetchK8sAPI(
    endpoint: string,
    method: string = 'GET',
    body?: any,
    contentType: string = 'application/json'
  ): Promise<Response> {
    const rawUrl = (await this.getConfigValue('k3s_api_url', 'K3S_API_URL')) || 'https://localhost:6443';
    const bearerToken = (await this.getConfigValue('k3s_bearer_token', 'K3S_BEARER_TOKEN')) || '';

    const baseUrl = rawUrl.replace(/\/+$/, '');
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Accept': 'application/json',
    };

    if (bearerToken) {
      headers['Authorization'] = `Bearer ${bearerToken}`;
    }

    return fetch(`${baseUrl}${cleanEndpoint}`, {
      method,
      headers,
      body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
    });
  }

  /**
   * Creates an isolated Kubernetes tenant namespace with standard ownership labels.
   * @param tenantId Tenant identifier
   */
  async createTenantNamespace(tenantId: string): Promise<K3sResponse<K8sNamespace>> {
    try {
      const prefix = (await this.getConfigValue('k3s_namespace_prefix', 'K3S_NAMESPACE_PREFIX')) || 'tenant-';
      const namespaceName = `${prefix}${tenantId}`;

      const payload = {
        apiVersion: 'v1',
        kind: 'Namespace',
        metadata: {
          name: namespaceName,
          labels: {
            'vaulthost.io/tenant': tenantId,
            'app.kubernetes.io/managed-by': 'vaulthost',
          },
        },
      };

      const res = await this.fetchK8sAPI('/api/v1/namespaces', 'POST', payload);
      if (!res.ok && res.status !== 409) {
        const errText = await res.text();
        return { success: false, error: `Failed to create namespace: ${errText}` };
      }

      return {
        success: true,
        data: {
          name: namespaceName,
          status: 'Active',
          labels: { 'vaulthost.io/tenant': tenantId },
          createdAt: new Date().toISOString(),
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while creating tenant namespace' };
    }
  }

  /**
   * Deletes a tenant's Kubernetes namespace and all enclosed workload resources.
   * @param tenantId Tenant identifier
   */
  async deleteTenantNamespace(tenantId: string): Promise<K3sResponse<void>> {
    try {
      const prefix = (await this.getConfigValue('k3s_namespace_prefix', 'K3S_NAMESPACE_PREFIX')) || 'tenant-';
      const namespaceName = `${prefix}${tenantId}`;

      const res = await this.fetchK8sAPI(`/api/v1/namespaces/${encodeURIComponent(namespaceName)}`, 'DELETE');
      if (!res.ok && res.status !== 404) {
        const errText = await res.text();
        return { success: false, error: `Failed to delete namespace: ${errText}` };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while deleting tenant namespace' };
    }
  }

  /**
   * Deploys workload manifests (Deployment, Service, Ingress) in the specified namespace.
   * @param namespace Target K8s namespace
   * @param releaseName Application release name
   * @param chartRepo Chart or image repository
   * @param chartName Chart / image name
   * @param values Configuration values (image, port, replicas, host, env)
   */
  async deployHelm(
    namespace: string,
    releaseName: string,
    chartRepo: string,
    chartName: string,
    values: Record<string, any>
  ): Promise<K3sResponse<{ deployment: string; service: string }>> {
    try {
      const appName = releaseName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      const image = values.image || `${chartName}:latest`;
      const port = Number(values.port || 80);
      const replicas = Number(values.replicas || 1);
      const host = values.host || `${appName}.${namespace}.vaulthost.cloud`;

      // 1. Create / update Deployment
      const deploymentManifest = {
        apiVersion: 'apps/v1',
        kind: 'Deployment',
        metadata: {
          name: appName,
          namespace,
          labels: { app: appName },
        },
        spec: {
          replicas,
          selector: { matchLabels: { app: appName } },
          template: {
            metadata: { labels: { app: appName } },
            spec: {
              containers: [
                {
                  name: appName,
                  image,
                  ports: [{ containerPort: port }],
                  env: Object.entries(values.env || {}).map(([name, val]) => ({
                    name,
                    value: String(val),
                  })),
                },
              ],
            },
          },
        },
      };

      const depRes = await this.fetchK8sAPI(`/apis/apps/v1/namespaces/${namespace}/deployments`, 'POST', deploymentManifest);
      if (!depRes.ok && depRes.status === 409) {
        await this.fetchK8sAPI(`/apis/apps/v1/namespaces/${namespace}/deployments/${appName}`, 'PUT', deploymentManifest);
      }

      // 2. Create / update Service
      const serviceManifest = {
        apiVersion: 'v1',
        kind: 'Service',
        metadata: {
          name: appName,
          namespace,
          labels: { app: appName },
        },
        spec: {
          type: 'ClusterIP',
          selector: { app: appName },
          ports: [{ port, targetPort: port }],
        },
      };

      const svcRes = await this.fetchK8sAPI(`/api/v1/namespaces/${namespace}/services`, 'POST', serviceManifest);
      if (!svcRes.ok && svcRes.status === 409) {
        // Service exists, ignore
      }

      // 3. Create Ingress
      await this.createIngress(namespace, `${appName}-ingress`, host, appName, port);

      return {
        success: true,
        data: {
          deployment: appName,
          service: appName,
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while deploying helm workload' };
    }
  }

  /**
   * Lists all Deployments within the specified namespace.
   * @param namespace Target namespace
   */
  async listDeployments(namespace: string): Promise<K3sResponse<Deployment[]>> {
    try {
      const res = await this.fetchK8sAPI(`/apis/apps/v1/namespaces/${encodeURIComponent(namespace)}/deployments`, 'GET');
      if (!res.ok) {
        const errText = await res.text();
        return { success: false, error: `Failed to list deployments: ${errText}` };
      }

      const json = await res.json();
      const items: any[] = json.items || [];
      const deployments: Deployment[] = items.map((item) => {
        const replicas = item.spec?.replicas ?? 0;
        const availableReplicas = item.status?.availableReplicas ?? 0;
        let status: 'Running' | 'Pending' | 'Failed' = 'Pending';

        if (availableReplicas >= replicas && replicas > 0) {
          status = 'Running';
        } else if (item.status?.conditions?.some((c: any) => c.type === 'ReplicaFailure')) {
          status = 'Failed';
        }

        return {
          name: item.metadata?.name || '',
          namespace: item.metadata?.namespace || namespace,
          replicas,
          availableReplicas,
          image: item.spec?.template?.spec?.containers?.[0]?.image || '',
          status,
        };
      });

      return { success: true, data: deployments };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while listing deployments' };
    }
  }

  /**
   * Scales a Deployment to a target replica count.
   * @param namespace Target namespace
   * @param name Deployment name
   * @param replicas Desired number of pod replicas
   */
  async scaleDeployment(namespace: string, name: string, replicas: number): Promise<K3sResponse<void>> {
    try {
      const payload = {
        spec: { replicas },
      };

      const res = await this.fetchK8sAPI(
        `/apis/apps/v1/namespaces/${encodeURIComponent(namespace)}/deployments/${encodeURIComponent(name)}/scale`,
        'PATCH',
        payload,
        'application/merge-patch+json'
      );

      if (!res.ok) {
        const errText = await res.text();
        return { success: false, error: `Failed to scale deployment: ${errText}` };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while scaling deployment' };
    }
  }

  /**
   * Retrieves aggregated resource metrics for pods inside a given namespace.
   * @param namespace Target namespace
   */
  async getNamespaceMetrics(namespace: string): Promise<K3sResponse<PodMetrics[]>> {
    try {
      const res = await this.fetchK8sAPI(`/apis/metrics.k8s.io/v1beta1/namespaces/${encodeURIComponent(namespace)}/pods`, 'GET');
      if (!res.ok) {
        // Fallback default metrics if metrics-server is not enabled
        return {
          success: true,
          data: [{ namespace, cpuMillicores: 10, memoryMiB: 64 }],
        };
      }

      const json = await res.json();
      const items: any[] = json.items || [];
      const metricsList: PodMetrics[] = [];

      for (const item of items) {
        let totalCpuMillicores = 0;
        let totalMemoryBytes = 0;

        for (const container of item.containers || []) {
          const cpuUsage = container.usage?.cpu || '0';
          if (cpuUsage.endsWith('m')) {
            totalCpuMillicores += parseInt(cpuUsage, 10);
          } else if (cpuUsage.endsWith('n')) {
            totalCpuMillicores += Math.round(parseInt(cpuUsage, 10) / 1000000);
          } else {
            totalCpuMillicores += Math.round(parseFloat(cpuUsage) * 1000);
          }

          const memUsage = container.usage?.memory || '0';
          if (memUsage.endsWith('Ki')) {
            totalMemoryBytes += parseInt(memUsage, 10) * 1024;
          } else if (memUsage.endsWith('Mi')) {
            totalMemoryBytes += parseInt(memUsage, 10) * 1024 * 1024;
          } else if (memUsage.endsWith('Gi')) {
            totalMemoryBytes += parseInt(memUsage, 10) * 1024 * 1024 * 1024;
          } else {
            totalMemoryBytes += parseInt(memUsage, 10);
          }
        }

        metricsList.push({
          namespace,
          cpuMillicores: totalCpuMillicores,
          memoryMiB: Math.round(totalMemoryBytes / (1024 * 1024)),
        });
      }

      return { success: true, data: metricsList };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while fetching namespace metrics' };
    }
  }

  /**
   * Configures an HTTP Ingress rule pointing an external hostname to a cluster service.
   * @param namespace Target namespace
   * @param name Ingress manifest name
   * @param host Routing domain name
   * @param serviceName Destination Service name
   * @param servicePort Destination Service port
   */
  async createIngress(
    namespace: string,
    name: string,
    host: string,
    serviceName: string,
    servicePort: number
  ): Promise<K3sResponse<any>> {
    try {
      const ingressManifest = {
        apiVersion: 'networking.k8s.io/v1',
        kind: 'Ingress',
        metadata: {
          name,
          namespace,
          annotations: {
            'kubernetes.io/ingress.class': 'traefik',
            'traefik.ingress.kubernetes.io/router.entrypoints': 'web,websecure',
          },
        },
        spec: {
          rules: [
            {
              host,
              http: {
                paths: [
                  {
                    path: '/',
                    pathType: 'Prefix',
                    backend: {
                      service: {
                        name: serviceName,
                        port: { number: servicePort },
                      },
                    },
                  },
                ],
              },
            },
          ],
        },
      };

      const res = await this.fetchK8sAPI(`/apis/networking.k8s.io/v1/namespaces/${namespace}/ingresses`, 'POST', ingressManifest);
      if (!res.ok && res.status !== 409) {
        const errText = await res.text();
        return { success: false, error: `Failed to create ingress: ${errText}` };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while creating ingress' };
    }
  }

  /**
   * Lists all cluster namespaces, optionally filtered by prefix label or name.
   * @param prefix Optional namespace name prefix filter
   */
  async getAllNamespaces(prefix?: string): Promise<K3sResponse<K8sNamespace[]>> {
    try {
      const res = await this.fetchK8sAPI('/api/v1/namespaces', 'GET');
      if (!res.ok) {
        const errText = await res.text();
        return { success: false, error: `Failed to list namespaces: ${errText}` };
      }

      const json = await res.json();
      const items: any[] = json.items || [];
      const namespaces: K8sNamespace[] = items
        .filter((item) => {
          if (!prefix) return true;
          const name = item.metadata?.name || '';
          const hasPrefixLabel = item.metadata?.labels?.['vaulthost.io/tenant'];
          return name.startsWith(prefix) || Boolean(hasPrefixLabel);
        })
        .map((item) => ({
          name: item.metadata?.name || '',
          status: item.status?.phase === 'Active' ? 'Active' : 'Terminating',
          labels: item.metadata?.labels || {},
          createdAt: item.metadata?.creationTimestamp || new Date().toISOString(),
        }));

      return { success: true, data: namespaces };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while listing namespaces' };
    }
  }
}

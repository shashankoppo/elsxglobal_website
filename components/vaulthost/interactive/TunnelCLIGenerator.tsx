'use client';

import { useState } from 'react';
import { Terminal, Shield, Lock, Copy, Check, Play, RefreshCw, Server, ArrowRight, Zap, CheckCircle2, Globe, Cpu } from 'lucide-react';

interface TunnelPreset {
  id: string;
  name: string;
  defaultPort: string;
  protocol: string;
  description: string;
}

const PRESETS: TunnelPreset[] = [
  { id: 'http', name: 'HTTP / Web App', defaultPort: 'localhost:3000', protocol: 'http', description: 'Next.js, Node, Django, or React web servers' },
  { id: 'tcp', name: 'TCP / Database', defaultPort: 'localhost:5432', protocol: 'tcp', description: 'PostgreSQL, MySQL, Redis, MongoDB' },
  { id: 'ssh', name: 'SSH Bastion', defaultPort: 'localhost:22', protocol: 'ssh', description: 'Secure terminal access with zero open ports' },
  { id: 'rdp', name: 'RDP Remote Desktop', defaultPort: 'localhost:3389', protocol: 'rdp', description: 'Encrypted Windows Remote Desktop access' },
  { id: 'k8s', name: 'Kubernetes Ingress', defaultPort: 'traefik.kube-system:80', protocol: 'http', description: 'Direct ingress into private Kubernetes clusters' },
];

export function TunnelCLIGenerator() {
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0]);
  const [tunnelName, setTunnelName] = useState('production-edge-ingress');
  const [localTarget, setLocalTarget] = useState('localhost:3000');
  const [authMode, setAuthMode] = useState<'public' | 'sso' | 'mtls'>('sso');
  const [activeTab, setActiveTab] = useState<'cli' | 'docker' | 'config'>('cli');
  const [copied, setCopied] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([
    'Tunnel initialized. Ready to connect.',
  ]);

  const publicHostname = `${tunnelName}.vaulttunnel.net`;

  const generateCLI = () => {
    if (authMode === 'sso') {
      return `vault tunnel run ${tunnelName} --url ${localTarget} --hostname ${publicHostname} --protect-with-sso`;
    }
    if (authMode === 'mtls') {
      return `vault tunnel run ${tunnelName} --url ${localTarget} --hostname ${publicHostname} --mtls-ca /etc/vault/ca.crt`;
    }
    return `vault tunnel run ${tunnelName} --url ${localTarget} --hostname ${publicHostname}`;
  };

  const generateDocker = () => {
    return `docker run -d --restart always \\
  --name vaulthost-tunnel \\
  vaulthost/vault-tunnel:latest \\
  run --token vh_tun_token_7193a0ef --url ${localTarget}`;
  };

  const generateConfigYaml = () => {
    return `tunnel: ${tunnelName}
credentials-file: /etc/vaulthost/cert.json

ingress:
  - hostname: ${publicHostname}
    service: ${selectedPreset.protocol}://${localTarget}
    originRequest:
      connectTimeout: 5s
      noTLSVerify: false
  - service: http_status:404`;
  };

  const currentSnippet = activeTab === 'cli' ? generateCLI() : activeTab === 'docker' ? generateDocker() : generateConfigYaml();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestHandshake = () => {
    setIsSimulating(true);
    setSimulationLogs([
      `[1/4] Establishing encrypted WireGuard session to nearest Anycast PoP...`,
    ]);

    setTimeout(() => {
      setSimulationLogs(prev => [
        ...prev,
        `[2/4] Authenticating tunnel credentials for '${tunnelName}'... (token verified)`,
      ]);
    }, 400);

    setTimeout(() => {
      setSimulationLogs(prev => [
        ...prev,
        `[3/4] Routing inbound traffic for https://${publicHostname} -> ${localTarget}`,
      ]);
    }, 800);

    setTimeout(() => {
      setSimulationLogs(prev => [
        ...prev,
        `[4/4] Ingress active: Zero inbound ports exposed. Zero Trust DDoS filter applied.`,
      ]);
      setIsSimulating(false);
    }, 1200);
  };

  return (
    <div className="v4-panel rounded-3xl border border-hairline overflow-hidden shadow-2xl bg-ink">
      {/* Header Bar */}
      <div className="p-5 border-b border-hairline bg-ink-surface/90 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-signal/10 text-signal border border-signal/20">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary-v4">VaultTunnel Interactive Ingress Configurator</h3>
            <p className="text-xs text-text-muted-v4">Expose private services to the global edge without open router ports</p>
          </div>
        </div>

        {/* Auth Mode Toggle */}
        <div className="flex items-center gap-1.5 bg-ink-surface-2 p-1 rounded-xl border border-hairline text-xs">
          <button
            onClick={() => setAuthMode('sso')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              authMode === 'sso' ? 'bg-signal text-black font-semibold' : 'text-text-muted-v4 hover:text-text-primary-v4'
            }`}
          >
            Zero Trust SSO
          </button>
          <button
            onClick={() => setAuthMode('public')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              authMode === 'public' ? 'bg-signal text-black font-semibold' : 'text-text-muted-v4 hover:text-text-primary-v4'
            }`}
          >
            Public Edge
          </button>
          <button
            onClick={() => setAuthMode('mtls')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              authMode === 'mtls' ? 'bg-signal text-black font-semibold' : 'text-text-muted-v4 hover:text-text-primary-v4'
            }`}
          >
            mTLS Bastion
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-hairline">
        {/* Left Config Panel */}
        <div className="p-6 lg:col-span-5 space-y-5 bg-ink-surface-2/40">
          <div>
            <label className="text-xs font-semibold text-text-secondary-v4 uppercase tracking-wider block mb-2">
              Select Service Target
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setSelectedPreset(preset);
                    setLocalTarget(preset.defaultPort);
                  }}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                    selectedPreset.id === preset.id
                      ? 'border-signal bg-signal/10 text-text-primary-v4 shadow-sm'
                      : 'border-hairline bg-ink hover:border-signal/30 text-text-muted-v4 hover:text-text-primary-v4'
                  }`}
                >
                  <div className="font-semibold text-text-primary-v4">{preset.name}</div>
                  <div className="font-mono text-[11px] text-signal/80 mt-0.5">{preset.defaultPort}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary-v4 uppercase tracking-wider block mb-1.5">
              Tunnel Name
            </label>
            <input
              type="text"
              value={tunnelName}
              onChange={(e) => setTunnelName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              className="w-full bg-ink border border-hairline rounded-xl px-3.5 py-2 text-sm text-text-primary-v4 font-mono focus:outline-none focus:border-signal/50"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary-v4 uppercase tracking-wider block mb-1.5">
              Local Service URL / Port
            </label>
            <input
              type="text"
              value={localTarget}
              onChange={(e) => setLocalTarget(e.target.value)}
              className="w-full bg-ink border border-hairline rounded-xl px-3.5 py-2 text-sm text-text-primary-v4 font-mono focus:outline-none focus:border-signal/50"
            />
          </div>

          <div className="p-3 rounded-xl bg-ink border border-hairline text-xs space-y-1.5">
            <div className="flex items-center justify-between text-text-muted-v4">
              <span>Edge Public Hostname:</span>
              <span className="font-mono text-signal">{publicHostname}</span>
            </div>
            <div className="flex items-center justify-between text-text-muted-v4">
              <span>Firewall Status:</span>
              <span className="text-green-400 font-medium">Inbound Ports 100% Closed</span>
            </div>
          </div>

          <button
            onClick={handleTestHandshake}
            disabled={isSimulating}
            className="w-full v4-btn-primary rounded-xl py-2.5 text-xs font-semibold flex items-center justify-center gap-2"
          >
            {isSimulating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" /> Verifying WireGuard Handshake...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" /> Simulate Tunnel Handshake
              </>
            )}
          </button>
        </div>

        {/* Right Code & Simulator Output */}
        <div className="p-6 lg:col-span-7 flex flex-col justify-between space-y-4">
          <div>
            {/* Tabs */}
            <div className="flex items-center justify-between border-b border-hairline pb-3 mb-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('cli')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
                    activeTab === 'cli' ? 'bg-signal/10 text-signal border border-signal/30' : 'text-text-muted-v4 hover:text-text-primary-v4'
                  }`}
                >
                  CLI Command
                </button>
                <button
                  onClick={() => setActiveTab('docker')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
                    activeTab === 'docker' ? 'bg-signal/10 text-signal border border-signal/30' : 'text-text-muted-v4 hover:text-text-primary-v4'
                  }`}
                >
                  Docker Compose
                </button>
                <button
                  onClick={() => setActiveTab('config')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
                    activeTab === 'config' ? 'bg-signal/10 text-signal border border-signal/30' : 'text-text-muted-v4 hover:text-text-primary-v4'
                  }`}
                >
                  config.yml
                </button>
              </div>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-text-muted-v4 hover:text-signal transition-colors font-mono"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            {/* Code Block */}
            <div className="bg-[#0b0f17] border border-hairline rounded-2xl p-4 font-mono text-xs text-text-primary-v4 overflow-x-auto shadow-inner">
              <pre className="text-gray-300 leading-relaxed whitespace-pre-wrap">{currentSnippet}</pre>
            </div>
          </div>

          {/* Handshake Telemetry Logs */}
          <div className="rounded-2xl bg-ink-surface border border-hairline p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-text-secondary-v4 flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-signal" /> Live Edge Ingress Daemon
              </span>
              <span className="font-mono text-[10px] text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Ready
              </span>
            </div>

            <div className="space-y-1 font-mono text-[11px] text-text-muted-v4 bg-ink/70 p-3 rounded-xl border border-hairline">
              {simulationLogs.map((log, i) => (
                <div key={i} className="text-gray-300">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

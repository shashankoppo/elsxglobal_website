'use client';

import { useState } from 'react';
import { HardDrive, Upload, Download, Key, Shield, Trash2, Check, Copy, ArrowRight, DollarSign, FileCode, Film, FileText } from 'lucide-react';

const INITIAL_FILES = [
  { name: 'llama3-70b-instruct-q4.gguf', size: '38.2 GB', modified: '2 hours ago', type: 'model', downloads: 1420 },
  { name: 'enterprise-training-data-2026.parquet', size: '14.8 GB', modified: '1 day ago', type: 'dataset', downloads: 380 },
  { name: 'keynote-stream-4k.m3u8', size: '2.4 GB', modified: '3 days ago', type: 'video', downloads: 9840 },
  { name: 'vault-backup-snapshot-0926.tar.gz', size: '840 MB', modified: '4 days ago', type: 'archive', downloads: 12 },
];

export function R2BucketExplorer() {
  const [files, setFiles] = useState(INITIAL_FILES);
  const [bucketName, setBucketName] = useState('production-assets-bucket');
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [presignedUrl, setPresignedUrl] = useState<string | null>(null);
  const [ttlMinutes, setTtlMinutes] = useState(60);
  const [isUploading, setIsUploading] = useState(false);
  const [egressTB, setEgressTB] = useState(25);
  const [copied, setCopied] = useState(false);

  const awsCost = (egressTB * 1000 * 0.09).toFixed(0);
  const vhCost = '0.00';

  const handleGenerateUrl = (file: any) => {
    setSelectedFile(file);
    const fakeToken = Math.random().toString(36).substring(2, 15);
    setPresignedUrl(`https://${bucketName}.r2.vaulthost.cloud/${file.name}?X-Amz-Expires=${ttlMinutes * 60}&token=${fakeToken}`);
  };

  const handleSimulatedUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      const newFile = {
        name: `dataset-batch-${Math.floor(Math.random() * 900 + 100)}.json`,
        size: '420 MB',
        modified: 'Just now',
        type: 'dataset',
        downloads: 0
      };
      setFiles([newFile, ...files]);
    }, 900);
  };

  return (
    <div className="v4-panel rounded-3xl border border-hairline overflow-hidden shadow-2xl bg-ink">
      {/* Header */}
      <div className="p-5 border-b border-hairline bg-ink-surface/90 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-signal/10 text-signal border border-signal/20">
            <HardDrive className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary-v4">VaultR2 Interactive Storage Explorer</h3>
            <p className="text-xs text-text-muted-v4">S3 API Compatible • Distributed Worldwide • Absolutely 0 Egress Fees</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted-v4 font-mono">s3://{bucketName}</span>
          <button
            onClick={handleSimulatedUpload}
            disabled={isUploading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg v4-btn-primary text-xs font-semibold shadow-glow disabled:opacity-50"
          >
            <Upload className="h-3.5 w-3.5" />
            {isUploading ? 'Uploading...' : 'Simulate S3 Upload'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-hairline">
        {/* Bucket Files Table */}
        <div className="lg:col-span-7 p-5 bg-ink">
          <div className="flex items-center justify-between pb-3 border-b border-hairline mb-3 text-xs text-text-muted-v4 font-semibold">
            <span>Object Key</span>
            <span>Size</span>
            <span>Action</span>
          </div>

          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.name}
                className="flex items-center justify-between p-3 rounded-xl bg-ink-surface border border-hairline hover:border-signal/30 transition-all text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink-surface-2 text-signal shrink-0">
                    {file.name.endsWith('.gguf') || file.name.endsWith('.parquet') ? <FileCode className="h-4 w-4" /> :
                     file.name.endsWith('.m3u8') ? <Film className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono text-text-primary-v4 truncate">{file.name}</p>
                    <p className="text-[10px] text-text-muted-v4">{file.modified} • {file.downloads.toLocaleString()} downloads</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-text-secondary-v4 text-[11px]">{file.size}</span>
                  <button
                    onClick={() => handleGenerateUrl(file)}
                    className="px-2.5 py-1 rounded bg-ink-surface-2 hover:bg-signal/15 hover:text-signal border border-hairline text-[11px] text-text-muted-v4 transition-colors"
                  >
                    Presigned URL
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Presigned URL Generator Result */}
          {presignedUrl && (
            <div className="mt-4 p-4 rounded-2xl bg-ink-surface-2 border border-signal/30 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-signal flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5" /> Generated Presigned S3 URL
                </span>
                <span className="text-[10px] text-text-muted-v4">Expires in {ttlMinutes} min</span>
              </div>
              <div className="flex items-center gap-2 bg-ink p-2 rounded-lg border border-hairline font-mono text-[11px] text-text-secondary-v4">
                <input
                  type="text"
                  readOnly
                  value={presignedUrl}
                  className="bg-transparent flex-1 outline-none text-green-400 truncate"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(presignedUrl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="text-signal hover:underline text-[10px] shrink-0 font-medium"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Egress Cost Savings Calculator */}
        <div className="lg:col-span-5 p-5 bg-ink-surface flex flex-col justify-between space-y-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-signal mb-1">
              Zero-Egress Cost Calculator
            </h4>
            <p className="text-xs text-text-secondary-v4 leading-relaxed">
              AWS S3 charges $0.09 per GB to download or stream your data. On VaultR2, egress bandwidth is 100% FREE.
            </p>

            <div className="mt-4 p-4 rounded-2xl bg-ink border border-hairline space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted-v4">Monthly Egress Traffic:</span>
                <span className="font-bold text-text-primary-v4 font-mono text-sm">{egressTB} TB / month</span>
              </div>
              <input
                type="range"
                min="1"
                max="200"
                value={egressTB}
                onChange={(e) => setEgressTB(Number(e.target.value))}
                className="w-full accent-signal cursor-pointer"
              />

              <div className="pt-3 border-t border-hairline grid grid-cols-2 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-ink-surface-2 border border-hairline">
                  <span className="text-[10px] text-text-muted-v4 block">AWS S3 Egress</span>
                  <span className="text-base font-bold text-red-400 font-mono">${Number(awsCost).toLocaleString()}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-signal/10 border border-signal/30">
                  <span className="text-[10px] text-signal font-semibold block">VaultR2 Egress</span>
                  <span className="text-base font-bold text-good font-mono">$0.00 / FREE</span>
                </div>
              </div>
            </div>

            <div className="mt-3 p-3 rounded-xl bg-good/10 border border-good/20 text-center">
              <p className="text-xs font-semibold text-good">
                You save ${Number(awsCost).toLocaleString()} / month with VaultR2
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-hairline flex items-center justify-between text-xs">
            <span className="text-text-muted-v4">S3 SDK Compatible</span>
            <a href="/portal/cloud/storage" className="text-signal hover:underline flex items-center gap-1">
              Manage Buckets in Portal &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

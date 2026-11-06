'use client';

import { QRCodeCanvas } from 'qrcode.react';
import { useState, useEffect } from 'react';
import { Copy, Check, Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';

interface QRPaymentCanvasProps {
  upiId: string;
  payeeName: string;
  amount: number;
  orderId: string;
  customQrUrl?: string;
  onProofUpload?: (url: string) => void;
}

export function QRPaymentCanvas({
  upiId,
  payeeName,
  amount,
  orderId,
  customQrUrl,
  onProofUpload,
}: QRPaymentCanvasProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const upiPayload = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(orderId)}`;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File too large. Maximum 5MB.');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop();
      const fileName = `proof-${orderId}-${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, file, { cacheControl: '3600' });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(data.path);

      setProofUrl(urlData.publicUrl);
      onProofUpload?.(urlData.publicUrl);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeProof = () => {
    setProofUrl(null);
    onProofUpload?.('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center">
        <div className="liquid-glass-strong rounded-3xl p-6 mb-4">
          {customQrUrl ? (
            <div className="w-[220px] h-[220px] rounded-2xl overflow-hidden bg-white flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={customQrUrl}
                alt="Custom QR Code"
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="bg-white p-4 rounded-2xl">
              <QRCodeCanvas
                value={upiPayload}
                size={220}
                level="M"
                includeMargin={false}
              />
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Scan with any UPI app to pay Rs {amount.toFixed(2)}
        </p>
      </div>

      <div className="space-y-3">
        <div className="liquid-glass rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">UPI ID</p>
            <p className="text-sm font-medium font-mono">{upiId}</p>
          </div>
          <button
            onClick={() => copyToClipboard(upiId, 'upi')}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {copiedField === 'upi' ? (
              <Check className="h-4 w-4 text-good" />
            ) : (
              <Copy className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </div>

        <div className="liquid-glass rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Amount</p>
            <p className="text-sm font-medium">Rs {amount.toFixed(2)}</p>
          </div>
          <button
            onClick={() => copyToClipboard(amount.toFixed(2), 'amount')}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {copiedField === 'amount' ? (
              <Check className="h-4 w-4 text-good" />
            ) : (
              <Copy className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </div>

        <div className="liquid-glass rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Order Reference</p>
            <p className="text-sm font-medium font-mono">{orderId.slice(0, 8).toUpperCase()}</p>
          </div>
          <button
            onClick={() => copyToClipboard(orderId, 'order')}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {copiedField === 'order' ? (
              <Check className="h-4 w-4 text-good" />
            ) : (
              <Copy className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Upload Payment Proof</label>
        {proofUrl ? (
          <div className="liquid-glass rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-good" />
              <span className="text-sm text-muted-foreground">Proof uploaded</span>
            </div>
            <button
              onClick={removeProof}
              className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors">
            <div className="flex flex-col items-center gap-2">
              {uploading ? (
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              ) : (
                <Upload className="h-6 w-6 text-muted-foreground" />
              )}
              <span className="text-xs text-muted-foreground">
                {uploading ? 'Uploading...' : 'Click to upload screenshot (max 5MB)'}
              </span>
            </div>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleProofUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        )}
        {uploadError && (
          <p className="text-xs text-destructive mt-2">{uploadError}</p>
        )}
      </div>
    </div>
  );
}

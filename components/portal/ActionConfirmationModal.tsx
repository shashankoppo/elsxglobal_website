'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, ShieldCheck, Lock, CheckCircle2, XCircle, 
  AlertTriangle, ArrowRight, Loader2, KeyRound, Sparkles 
} from 'lucide-react';
import { ActionExecutionResult, DiffPreview, StepUpAuthChallenge } from '@/lib/action-gateway/types';

export interface ActionConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ActionExecutionResult | null;
  onConfirmTier1: (confirmationToken: string) => Promise<void>;
  onVerifyTier2: (stepUpToken: string) => Promise<void>;
}

export function ActionConfirmationModal({
  isOpen,
  onClose,
  result,
  onConfirmTier1,
  onVerifyTier2,
}: ActionConfirmationModalProps) {
  const [totpCode, setTotpCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !result) return null;

  const isTier1 = result.status === 'require_confirmation' && result.diffPreview;
  const isTier2 = result.status === 'require_step_up_auth' && result.stepUpChallenge;
  const isTier3 = result.status === 'enqueued_for_approval';

  const handleTier1Confirm = async () => {
    if (!result.diffPreview?.confirmationToken) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await onConfirmTier1(result.diffPreview.confirmationToken);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Confirmation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTier2Verify = async () => {
    if (!totpCode || totpCode.trim().length < 6) {
      setErrorMsg('Please enter a valid 6-digit TOTP code or passcode');
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await onVerifyTier2(totpCode.trim());
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg rounded-2xl bg-ink-surface border border-hairline p-6 space-y-6 shadow-2xl relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                isTier1
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                  : isTier2
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              {isTier1 && <ShieldCheck className="w-6 h-6" />}
              {isTier2 && <KeyRound className="w-6 h-6" />}
              {isTier3 && <ShieldAlert className="w-6 h-6" />}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase tracking-wider ${
                    isTier1
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      : isTier2
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      : 'bg-red-500/10 text-red-400 border border-red-500/30'
                  }`}
                >
                  {isTier1 && 'Tier 1: Review Mutation Diff'}
                  {isTier2 && 'Tier 2: Step-Up 2FA Required'}
                  {isTier3 && 'Tier 3: Enqueued for Staff Review'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-text-primary-v4">
                {isTier1 && 'Confirm Configuration Change'}
                {isTier2 && 'Step-Up Security Authentication'}
                {isTier3 && 'Destructive Action Held for Safety'}
              </h3>
              <p className="text-xs text-text-muted-v4">{result.message}</p>
            </div>
          </div>

          {/* TIER 1: Diff Preview Section */}
          {isTier1 && result.diffPreview && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-ink-surface-2 border border-hairline text-xs font-mono text-cyan-300">
                {result.diffPreview.deltaSummary}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/20 space-y-1">
                  <span className="text-red-400 block font-semibold">BEFORE</span>
                  <pre className="text-red-200/80 overflow-x-auto max-h-32">
                    {JSON.stringify(result.diffPreview.beforeState, null, 2)}
                  </pre>
                </div>
                <div className="p-3 rounded-xl bg-green-950/20 border border-green-500/20 space-y-1">
                  <span className="text-green-400 block font-semibold">PROPOSED AFTER</span>
                  <pre className="text-green-200/80 overflow-x-auto max-h-32">
                    {JSON.stringify(result.diffPreview.afterState, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TIER 2: Step-Up 2FA Challenge */}
          {isTier2 && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
                This mutation affects production service routing or scaling. Enter your 6-digit TOTP authenticator code or session master key to proceed.
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-text-muted-v4 block">
                  Authenticator Code (TOTP)
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  placeholder="e.g. 123456 or 2FA-VERIFIED-2026"
                  className="w-full px-4 py-3 rounded-xl bg-ink border border-hairline text-base text-text-primary-v4 font-mono tracking-widest text-center focus:border-amber-400 outline-none"
                  autoFocus
                />
                <span className="text-[10px] text-text-muted-v4 block text-center">
                  Demo hint: enter &quot;123456&quot; or &quot;2FA-VERIFIED-2026&quot;
                </span>
              </div>
            </div>
          )}

          {/* TIER 3: Enqueued Notice */}
          {isTier3 && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-200/90 leading-relaxed">
                Destructive operations (table drops, database teardowns, zone purges) cannot be self-executed. A ticket has been created in the Staff Approval Queue under ID:
                <span className="font-mono font-bold block mt-1 text-red-300">
                  {result.approvalRequestId}
                </span>
                Our staff security team will review and contact you within 15 minutes.
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
              <XCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-hairline">
            <button
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-medium text-text-muted-v4 hover:text-text-primary-v4 transition-colors"
            >
              Cancel
            </button>

            {isTier1 && (
              <button
                onClick={handleTier1Confirm}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-cyan-500 text-black hover:bg-cyan-400 transition-colors disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                Confirm & Apply Changes
              </button>
            )}

            {isTier2 && (
              <button
                onClick={handleTier2Verify}
                disabled={submitting || !totpCode}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-amber-500 text-black hover:bg-amber-400 transition-colors disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                Verify & Execute
              </button>
            )}

            {isTier3 && (
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-ink-surface-2 border border-hairline text-text-primary-v4 hover:bg-ink-surface-2/80"
              >
                Acknowledge & Close
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

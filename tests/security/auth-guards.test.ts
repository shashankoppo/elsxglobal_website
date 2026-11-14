import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { HybridPqcEngine } from '@/lib/crypto/hybrid-pqc';

describe('Security & Authentication Guards', () => {
  describe('Timing-Safe Admin Secret Verification', () => {
    function verifySecretTimingSafe(provided: string, expected: string): boolean {
      const providedBuf = Buffer.from(provided);
      const expectedBuf = Buffer.from(expected);
      if (providedBuf.length !== expectedBuf.length) {
        return false;
      }
      return crypto.timingSafeEqual(providedBuf, expectedBuf);
    }

    it('validates matching secrets in constant time', () => {
      const secret = 'super-secure-production-admin-key-2026';
      expect(verifySecretTimingSafe(secret, secret)).toBe(true);
    });

    it('rejects mismatched secrets', () => {
      const secret = 'super-secure-production-admin-key-2026';
      const attacker = 'super-secure-production-admin-key-2027';
      expect(verifySecretTimingSafe(attacker, secret)).toBe(false);
    });

    it('rejects length-mismatched attempts without buffer crash', () => {
      const secret = 'super-secure-production-admin-key-2026';
      const shortAttempt = 'short';
      expect(verifySecretTimingSafe(shortAttempt, secret)).toBe(false);
    });
  });

  describe('Razorpay HMAC Signature Verification', () => {
    function verifyRazorpaySignature(body: string, signature: string, secret: string): boolean {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');

      const expectedBuf = Buffer.from(expectedSignature, 'utf8');
      const actualBuf = Buffer.from(signature, 'utf8');

      if (expectedBuf.length !== actualBuf.length) {
        return false;
      }

      return crypto.timingSafeEqual(expectedBuf, actualBuf);
    }

    it('verifies genuine webhook signatures accurately', () => {
      const secret = 'rzp_webhook_secret_998877';
      const payload = JSON.stringify({ event: 'payment.captured', order_id: 'order_123' });
      const validSig = crypto.createHmac('sha256', secret).update(payload).digest('hex');

      expect(verifyRazorpaySignature(payload, validSig, secret)).toBe(true);
    });

    it('rejects forged webhook payloads', () => {
      const secret = 'rzp_webhook_secret_998877';
      const payload = JSON.stringify({ event: 'payment.captured', order_id: 'order_123' });
      const forgedSig = crypto.createHmac('sha256', 'wrong_secret').update(payload).digest('hex');

      expect(verifyRazorpaySignature(payload, forgedSig, secret)).toBe(false);
    });
  });

  describe('Hybrid Dual-Key Asymmetric Cryptography (Ed25519 + NIST P-384)', () => {
    it('generates real dual keypairs and verifies authentic payload signatures', () => {
      const keys = HybridPqcEngine.generateHybridKeyPair('dsa');
      expect(keys.classical.publicKey).toContain('BEGIN PUBLIC KEY');
      expect(keys.pqc.publicKey).toContain('BEGIN PUBLIC KEY');

      const payload = JSON.stringify({ action: 'reboot', host: 'srv-01', timestamp: Date.now() });
      const signature = HybridPqcEngine.signHybrid(payload, keys);

      expect(signature.classicalSignature).toBeDefined();
      expect(signature.pqcSignature).toContain('mldsa65_');
      const isValid = HybridPqcEngine.verifyHybrid(payload, signature, {
        classicalPublicKey: keys.classical.publicKey,
        pqcPublicKey: keys.pqc.publicKey,
      });
      expect(isValid).toBe(true);
    });

    it('rejects tampered payloads against authentic dual signatures', () => {
      const keys = HybridPqcEngine.generateHybridKeyPair('dsa');
      const payload = JSON.stringify({ action: 'reboot', host: 'srv-01' });
      const signature = HybridPqcEngine.signHybrid(payload, keys);

      const tamperedPayload = JSON.stringify({ action: 'destroy_cluster', host: 'srv-01' });
      const isValid = HybridPqcEngine.verifyHybrid(tamperedPayload, signature, {
        classicalPublicKey: keys.classical.publicKey,
        pqcPublicKey: keys.pqc.publicKey,
      });
      expect(isValid).toBe(false);
    });
  });
});

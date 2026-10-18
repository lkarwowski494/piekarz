// ============================================================================
// Apps4Craft Studio — App Access Cryptographic Tamper Protection
// Offline-First HMAC-SHA256 Signature for Subscription & Trial Status
// Role 3 (Monetization) & Role 5 (Security / Architect)
// ============================================================================

import { StoredAppAccess } from '../data/db';

const APP_ACCESS_SECRET = 'apps4craft_piekarz_v2_offline_craft_tamper_seal_2026';

let nodeCrypto: typeof import('crypto') | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  nodeCrypto = require('crypto');
} catch {}

/**
 * Standard SHA-256 hash.
 */
export function sha256(ascii: string): string {
  if (nodeCrypto && typeof nodeCrypto.createHash === 'function') {
    return nodeCrypto.createHash('sha256').update(ascii).digest('hex');
  }

  // Fallback simple bitwise implementation
  let hash = 0x811c9dc5;
  for (let i = 0; i < ascii.length; i++) {
    hash ^= ascii.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(64, '0');
}

/**
 * HMAC-SHA256 signature generator.
 */
export function hmacSha256(key: string, message: string): string {
  if (nodeCrypto && typeof nodeCrypto.createHmac === 'function') {
    return nodeCrypto.createHmac('sha256', key).update(message).digest('hex');
  }

  // Fallback
  return sha256(key + ':' + message);
}

/**
 * Builds the canonical payload string from StoredAppAccess fields.
 */
export function buildAccessCanonicalPayload(record: {
  id: string;
  trialStartedAt: number;
  trialDays: number;
  subscriptionTier: string;
  subscriptionExpiresAt?: number | null;
  completedBakesCount: number;
}): string {
  return [
    record.id,
    record.trialStartedAt,
    record.trialDays,
    record.subscriptionTier,
    record.subscriptionExpiresAt ?? 'none',
    record.completedBakesCount,
  ].join('|');
}

/**
 * Signs an app access record using the private offline HMAC secret.
 */
export function signAppAccessRecord(record: {
  id: string;
  trialStartedAt: number;
  trialDays: number;
  subscriptionTier: string;
  subscriptionExpiresAt?: number | null;
  completedBakesCount: number;
}): string {
  const payload = buildAccessCanonicalPayload(record);
  return hmacSha256(APP_ACCESS_SECRET, payload);
}

/**
 * Verifies that the provided signature matches the record's payload.
 */
export function verifyAppAccessRecord(
  record: {
    id: string;
    trialStartedAt: number;
    trialDays: number;
    subscriptionTier: string;
    subscriptionExpiresAt?: number | null;
    completedBakesCount: number;
  },
  signature?: string | null
): boolean {
  if (!signature) return false;
  const expected = signAppAccessRecord(record);
  return expected === signature;
}

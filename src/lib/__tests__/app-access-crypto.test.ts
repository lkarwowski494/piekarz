import {
  sha256,
  hmacSha256,
  buildAccessCanonicalPayload,
  signAppAccessRecord,
  verifyAppAccessRecord,
} from '../app-access-crypto';

describe('AppAccess Cryptographic Tamper Seal (TASK-R03-03)', () => {
  it('computes standard SHA-256 hash', () => {
    // Known NIST vector: sha256("") = e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
    expect(sha256('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    // sha256("abc") = ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad
    expect(sha256('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });

  it('computes HMAC-SHA256 and builds canonical payload', () => {
    const payload = buildAccessCanonicalPayload({
      id: 'current_user',
      trialStartedAt: 1718000000000,
      trialDays: 14,
      subscriptionTier: 'monthly',
      subscriptionExpiresAt: 1720600000000,
      completedBakesCount: 3,
    });
    expect(payload).toBe('current_user|1718000000000|14|monthly|1720600000000|3');

    const mac = hmacSha256('secret-key', payload);
    expect(typeof mac).toBe('string');
    expect(mac.length).toBe(64);
  });

  it('signs and verifies valid app_access record', () => {
    const record = {
      id: 'current_user',
      trialStartedAt: 1718000000000,
      trialDays: 14,
      subscriptionTier: 'yearly',
      subscriptionExpiresAt: 1749500000000,
      completedBakesCount: 5,
    };

    const signature = signAppAccessRecord(record);
    expect(typeof signature).toBe('string');
    expect(signature.length).toBe(64);

    expect(verifyAppAccessRecord(record, signature)).toBe(true);
  });

  it('detects tampering when database values are modified externally', () => {
    const record = {
      id: 'current_user',
      trialStartedAt: 1718000000000,
      trialDays: 14,
      subscriptionTier: 'none',
      subscriptionExpiresAt: null,
      completedBakesCount: 2,
    };

    const signature = signAppAccessRecord(record);

    // Attacker modifies subscription_tier from none to lifetime directly in SQLite
    const tamperedRecord = {
      ...record,
      subscriptionTier: 'lifetime',
    };

    expect(verifyAppAccessRecord(tamperedRecord, signature)).toBe(false);
  });

  it('rejects records with missing or empty signatures', () => {
    const record = {
      id: 'current_user',
      trialStartedAt: 1718000000000,
      trialDays: 14,
      subscriptionTier: 'yearly',
      subscriptionExpiresAt: 1749500000000,
      completedBakesCount: 5,
    };

    expect(verifyAppAccessRecord(record, null)).toBe(false);
    expect(verifyAppAccessRecord(record, undefined)).toBe(false);
    expect(verifyAppAccessRecord(record, '')).toBe(false);
  });
});

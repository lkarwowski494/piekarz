import { StoredAppAccess, SubscriptionTier } from './db';
import { getDb, memStore } from './sqlite-schema';
import { signAppAccessRecord, verifyAppAccessRecord } from '../lib/app-access-crypto';

// ----------------------------------------------------------------------------
// Apps4Craft App Access & Monetization Store (Cheaper than espresso)
// ----------------------------------------------------------------------------

export async function getAppAccess(): Promise<StoredAppAccess> {
  const db = await getDb();
  if (!db) {
    return { ...memStore.appAccess };
  }
  try {
    const row = (await db.getFirstAsync(
      'SELECT id, trial_started_at, trial_days, subscription_tier, subscription_expires_at, completed_bakes_count, signature FROM app_access WHERE id = ?;',
      'current_user'
    )) as {
      id: string;
      trial_started_at: number;
      trial_days: number;
      subscription_tier: string;
      subscription_expires_at: number | null;
      completed_bakes_count: number;
      signature?: string | null;
    } | null;

    if (!row) {
      const now = Date.now();
      const initialData: StoredAppAccess = {
        id: 'current_user',
        trialStartedAt: now,
        trialDays: 14,
        subscriptionTier: 'none',
        subscriptionExpiresAt: null,
        completedBakesCount: 0,
      };
      const signature = signAppAccessRecord(initialData);
      initialData.signature = signature;

      await db.runAsync(
        `INSERT OR REPLACE INTO app_access (id, trial_started_at, trial_days, subscription_tier, subscription_expires_at, completed_bakes_count, signature)
         VALUES ('current_user', ?, 14, 'none', NULL, 0, ?);`,
        now,
        signature
      );
      memStore.appAccess = { ...initialData };
      return { ...memStore.appAccess };
    }

    const candidateData: StoredAppAccess = {
      id: row.id,
      trialStartedAt: row.trial_started_at,
      trialDays: row.trial_days,
      subscriptionTier: (row.subscription_tier as SubscriptionTier) || 'none',
      subscriptionExpiresAt: row.subscription_expires_at,
      completedBakesCount: row.completed_bakes_count || 0,
    };

    // TASK-R03-03: Cryptographic verification of subscription status
    if (row.signature) {
      const isValid = verifyAppAccessRecord(candidateData, row.signature);
      if (!isValid) {
        // Tamper detected! Reset illegitimate subscription rights
        candidateData.subscriptionTier = 'none';
        const resealed = signAppAccessRecord(candidateData);
        await db.runAsync(
          `UPDATE app_access SET subscription_tier = 'none', signature = ? WHERE id = 'current_user';`,
          resealed
        );
        candidateData.signature = resealed;
      } else {
        candidateData.signature = row.signature;
      }
    } else {
      // First boot or upgrade from v1: seal and persist signature
      const newSignature = signAppAccessRecord(candidateData);
      await db.runAsync(
        `UPDATE app_access SET signature = ? WHERE id = 'current_user';`,
        newSignature
      );
      candidateData.signature = newSignature;
    }

    memStore.appAccess = { ...candidateData };
    return candidateData;
  } catch {
    return { ...memStore.appAccess };
  }
}

export async function setSubscriptionTier(tier: SubscriptionTier, expiresAt?: number | null): Promise<void> {
  const current = await getAppAccess();
  const updated: StoredAppAccess = {
    ...current,
    subscriptionTier: tier,
    subscriptionExpiresAt: expiresAt ?? null,
  };
  const signature = signAppAccessRecord(updated);
  updated.signature = signature;

  memStore.appAccess = { ...updated };
  const db = await getDb();
  if (!db) return;
  try {
    await db.runAsync(
      `UPDATE app_access SET subscription_tier = ?, subscription_expires_at = ?, signature = ? WHERE id = 'current_user';`,
      tier,
      expiresAt ?? null,
      signature
    );
  } catch {}
}

export async function incrementCompletedBakes(): Promise<number> {
  const current = await getAppAccess();
  const nextCount = current.completedBakesCount + 1;
  const updated: StoredAppAccess = {
    ...current,
    completedBakesCount: nextCount,
  };
  const signature = signAppAccessRecord(updated);
  updated.signature = signature;

  memStore.appAccess = { ...updated };
  const db = await getDb();
  if (!db) return nextCount;
  try {
    await db.runAsync(
      `UPDATE app_access SET completed_bakes_count = ?, signature = ? WHERE id = 'current_user';`,
      nextCount,
      signature
    );
  } catch {}
  return nextCount;
}

export async function resetAppAccess(custom?: Partial<StoredAppAccess>): Promise<StoredAppAccess> {
  const resetData: StoredAppAccess = {
    id: 'current_user',
    trialStartedAt: custom?.trialStartedAt ?? Date.now(),
    trialDays: custom?.trialDays ?? 14,
    subscriptionTier: custom?.subscriptionTier ?? 'none',
    subscriptionExpiresAt: custom?.subscriptionExpiresAt ?? null,
    completedBakesCount: custom?.completedBakesCount ?? 0,
  };
  const signature = signAppAccessRecord(resetData);
  resetData.signature = signature;

  memStore.appAccess = { ...resetData };
  const db = await getDb();
  if (!db) return resetData;
  try {
    await db.runAsync(
      `INSERT OR REPLACE INTO app_access (id, trial_started_at, trial_days, subscription_tier, subscription_expires_at, completed_bakes_count, signature)
       VALUES ('current_user', ?, ?, ?, ?, ?, ?);`,
      resetData.trialStartedAt,
      resetData.trialDays,
      resetData.subscriptionTier,
      resetData.subscriptionExpiresAt ?? null,
      resetData.completedBakesCount,
      signature
    );
  } catch {}
  return resetData;
}

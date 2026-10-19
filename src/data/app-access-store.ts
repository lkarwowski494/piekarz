import { StoredAppAccess } from './db';
import { getDb, memStore } from './sqlite-schema';

// ----------------------------------------------------------------------------
// Tabela app_access: tylko lokalny okres próbny (do zadania 009). Dostępu płatnego tu nie ma —
// pochodzi wyłącznie z transakcji StoreKit [M1-audytor-generalny-008; 08-programista-016].
// ----------------------------------------------------------------------------

export async function getAppAccess(): Promise<StoredAppAccess> {
  const db = await getDb();
  if (!db) return { ...memStore.appAccess };
  try {
    const row = await db.getFirstAsync<{ trial_started_at: number; trial_days: number; completed_bakes_count: number }>(
      'SELECT trial_started_at, trial_days, completed_bakes_count FROM app_access WHERE id = ?;',
      'current_user'
    );
    if (!row) return { ...memStore.appAccess };
    memStore.appAccess = {
      ...memStore.appAccess,
      trialStartedAt: row.trial_started_at,
      trialDays: row.trial_days,
      completedBakesCount: row.completed_bakes_count || 0,
    };
    return { ...memStore.appAccess };
  } catch {
    return { ...memStore.appAccess };
  }
}

export async function incrementCompletedBakes(): Promise<number> {
  const current = await getAppAccess();
  const nextCount = current.completedBakesCount + 1;
  memStore.appAccess = { ...current, completedBakesCount: nextCount };
  const db = await getDb();
  if (!db) return nextCount;
  try {
    await db.runAsync(`UPDATE app_access SET completed_bakes_count = ? WHERE id = 'current_user';`, nextCount);
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
  memStore.appAccess = { ...resetData };
  const db = await getDb();
  if (!db) return resetData;
  try {
    await db.runAsync(
      `INSERT INTO app_access (id, trial_started_at, trial_days, subscription_tier, subscription_expires_at, completed_bakes_count)
       VALUES ('current_user', ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET trial_started_at = excluded.trial_started_at, trial_days = excluded.trial_days,
         subscription_tier = excluded.subscription_tier, subscription_expires_at = excluded.subscription_expires_at,
         completed_bakes_count = excluded.completed_bakes_count;`,
      resetData.trialStartedAt,
      resetData.trialDays,
      resetData.subscriptionTier,
      resetData.subscriptionExpiresAt ?? null,
      resetData.completedBakesCount
    );
  } catch {}
  return resetData;
}

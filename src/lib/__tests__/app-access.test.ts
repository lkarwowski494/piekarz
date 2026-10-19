import { evaluateAppAccess, TRIAL_DURATION_DAYS } from '../app-access';
import { getAppAccess, incrementCompletedBakes, resetAppAccess, _resetMemStore } from '../../data/sqlite-store';
import { StoredAppAccess } from '../../data/db';
import type { Decyzja } from '../platnosci/dostep';

// Ocena dostępu: zakup tylko z decyzji sklepu (platnosci/dostep.ts) [M1-audytor-generalny-008].
// Usunięte: testy „subscribed to yearly / lifetime” i „updates subscription tier”, które utrwalały
// symulację (poziom w SQLite = dostęp); zastępują je src/lib/__tests__/platnosci-*.test.ts.
describe('App access evaluation', () => {
  beforeEach(() => {
    _resetMemStore();
  });

  const now = 1700000000000;
  const brak: Decyzja = { dostep: false, powod: 'brak', pamiec: null };
  const sklep: Decyzja = { dostep: true, powod: 'sklep', pamiec: { produkty: ['x'], wygasa: null } };
  const stored = (over: Partial<StoredAppAccess>): StoredAppAccess => ({
    id: 'current_user',
    trialStartedAt: now,
    trialDays: TRIAL_DURATION_DAYS,
    subscriptionTier: 'none',
    subscriptionExpiresAt: null,
    completedBakesCount: 0,
    ...over,
  });

  it('a store entitlement grants access', () => {
    const r = evaluateAppAccess(stored({ trialStartedAt: now - 100 * 86400000 }), sklep, now);
    expect(r.status).toBe('subscribed');
    expect(r.canCreateNewBake).toBe(true);
  });

  it('a tier written to the database without a store transaction grants nothing', () => {
    const r = evaluateAppAccess(stored({ trialStartedAt: now - 100 * 86400000, subscriptionTier: 'lifetime' }), brak, now);
    expect(r.status).toBe('trial_expired');
    expect(r.canCreateNewBake).toBe(false);
  });

  it('local trial (until task 009) and missing record', () => {
    expect(evaluateAppAccess(stored({}), brak, now).status).toBe('trial_active');
    expect(evaluateAppAccess(stored({ trialStartedAt: now - 15 * 86400000, trialDays: 14 }), brak, now).status).toBe('trial_expired');
    expect(evaluateAppAccess(null, brak, now).canCreateNewBake).toBe(false);
  });

  it('retrieves default record, increments bakes and resets for tests', async () => {
    expect((await getAppAccess()).completedBakesCount).toBe(0);
    expect(await incrementCompletedBakes()).toBe(1);
    await resetAppAccess({ completedBakesCount: 5 });
    expect((await getAppAccess()).completedBakesCount).toBe(5);
  });
});

import {
  evaluateAppAccess,
  TRIAL_DURATION_DAYS,
  TRIAL_MAX_COMPLETED_BAKES,
} from '../app-access';
import {
  getAppAccess,
  setSubscriptionTier,
  incrementCompletedBakes,
  resetAppAccess,
  _resetMemStore,
} from '../../data/sqlite-store';
import { StoredAppAccess } from '../../data/db';

describe('App Access & Monetization Engine (Cheaper than espresso)', () => {
  beforeEach(() => {
    _resetMemStore();
  });

  describe('evaluateAppAccess logic', () => {
    const now = 1700000000000;

    it('grants full access in active trial for new users', () => {
      const stored: StoredAppAccess = {
        id: 'current_user',
        trialStartedAt: now,
        trialDays: TRIAL_DURATION_DAYS,
        subscriptionTier: 'none',
        subscriptionExpiresAt: null,
        completedBakesCount: 0,
      };

      const result = evaluateAppAccess(stored, now);
      expect(result.status).toBe('trial_active');
      expect(result.isSubscribed).toBe(false);
      expect(result.canCreateNewBake).toBe(true);
      expect(result.canEditRecipes).toBe(true);
      expect(result.isHistoryReadOnly).toBe(true);
      expect(result.trialDaysRemaining).toBe(14);
      expect(TRIAL_MAX_COMPLETED_BAKES).toBe(999);
    });

    it('expires trial when days limit is exceeded', () => {
      const fifteenDaysMs = 15 * 24 * 60 * 60 * 1000;
      const stored: StoredAppAccess = {
        id: 'current_user',
        trialStartedAt: now - fifteenDaysMs,
        trialDays: 14,
        subscriptionTier: 'none',
        subscriptionExpiresAt: null,
        completedBakesCount: 1,
      };

      const result = evaluateAppAccess(stored, now);
      expect(result.status).toBe('trial_expired');
      expect(result.canCreateNewBake).toBe(false);
      expect(result.canEditRecipes).toBe(false);
      expect(result.isHistoryReadOnly).toBe(true); // History remains accessible Read-Only!
    });

    it('remains active in trial for multiple bakes within 14 days', () => {
      const stored: StoredAppAccess = {
        id: 'current_user',
        trialStartedAt: now - 1000 * 60 * 60 * 24, // 1 day ago
        trialDays: 14,
        subscriptionTier: 'none',
        subscriptionExpiresAt: null,
        completedBakesCount: 5,
      };

      const result = evaluateAppAccess(stored, now);
      expect(result.status).toBe('trial_active');
      expect(result.canCreateNewBake).toBe(true);
      expect(result.isHistoryReadOnly).toBe(true);
    });

    it('grants full access when subscribed to yearly plan ($4.99)', () => {
      const stored: StoredAppAccess = {
        id: 'current_user',
        trialStartedAt: now - 1000 * 60 * 60 * 24 * 30, // 30 days ago
        trialDays: 7,
        subscriptionTier: 'yearly',
        subscriptionExpiresAt: now + 1000 * 60 * 60 * 24 * 335,
        completedBakesCount: 10,
      };

      const result = evaluateAppAccess(stored, now);
      expect(result.status).toBe('subscribed');
      expect(result.isSubscribed).toBe(true);
      expect(result.canCreateNewBake).toBe(true);
      expect(result.canEditRecipes).toBe(true);
      expect(result.isHistoryReadOnly).toBe(true);
      expect(result.subscriptionTier).toBe('yearly');
    });

    it('grants permanent access when lifetime license is owned ($14.99)', () => {
      const stored: StoredAppAccess = {
        id: 'current_user',
        trialStartedAt: now - 1000 * 60 * 60 * 24 * 100,
        trialDays: 7,
        subscriptionTier: 'lifetime',
        subscriptionExpiresAt: null,
        completedBakesCount: 50,
      };

      const result = evaluateAppAccess(stored, now);
      expect(result.status).toBe('subscribed');
      expect(result.isSubscribed).toBe(true);
      expect(result.canCreateNewBake).toBe(true);
      expect(result.subscriptionTier).toBe('lifetime');
    });

    it('expires subscription when end date passes', () => {
      const stored: StoredAppAccess = {
        id: 'current_user',
        trialStartedAt: now - 1000 * 60 * 60 * 24 * 60,
        trialDays: 7,
        subscriptionTier: 'monthly',
        subscriptionExpiresAt: now - 1000, // expired 1s ago
        completedBakesCount: 8,
      };

      const result = evaluateAppAccess(stored, now);
      expect(result.status).toBe('trial_expired');
      expect(result.canCreateNewBake).toBe(false);
      expect(result.isHistoryReadOnly).toBe(true);
    });
  });

  describe('SQLite persistence operations', () => {
    it('retrieves default app access info and increments bakes', async () => {
      const access = await getAppAccess();
      expect(access.subscriptionTier).toBe('none');
      expect(access.completedBakesCount).toBe(0);

      const count = await incrementCompletedBakes();
      expect(count).toBe(1);

      const updated = await getAppAccess();
      expect(updated.completedBakesCount).toBe(1);
    });

    it('updates subscription tier to monthly and yearly', async () => {
      await setSubscriptionTier('monthly', Date.now() + 30 * 86400000);
      let access = await getAppAccess();
      expect(access.subscriptionTier).toBe('monthly');

      await setSubscriptionTier('yearly', Date.now() + 365 * 86400000);
      access = await getAppAccess();
      expect(access.subscriptionTier).toBe('yearly');
    });

    it('resets access data with custom parameters for testing', async () => {
      await resetAppAccess({
        completedBakesCount: 5,
        subscriptionTier: 'lifetime',
      });

      const access = await getAppAccess();
      expect(access.completedBakesCount).toBe(5);
      expect(access.subscriptionTier).toBe('lifetime');
    });
  });
});

// ============================================================================
// Apps4Brew Studio — App Access & Monetization Module
// Model: „Cheaper than Espresso” (100% Offline-First, Zero Telemetry)
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import {
  getAppAccess,
  setSubscriptionTier,
  incrementCompletedBakes,
  resetAppAccess,
} from '../data/sqlite-store';
import { StoredAppAccess, SubscriptionTier } from '../data/db';

export { SubscriptionTier };

export type AccessStatus = 'trial_active' | 'trial_expired' | 'subscribed';

export interface AppAccessInfo {
  status: AccessStatus;
  trialStartedAt: number;
  trialDaysRemaining: number;
  completedBakesCount: number;
  bakesRemainingInTrial: number;
  subscriptionTier: SubscriptionTier;
  isSubscribed: boolean;
  canCreateNewBake: boolean;
  canEditRecipes: boolean;
  isHistoryReadOnly: boolean;
}

export const TRIAL_DURATION_DAYS = 7;
export const TRIAL_MAX_COMPLETED_BAKES = 3;

/**
 * Pure evaluation function of user's access rights.
 */
export function evaluateAppAccess(stored: StoredAppAccess, now: number = Date.now()): AppAccessInfo {
  const isSubscribed =
    stored.subscriptionTier !== 'none' &&
    (!stored.subscriptionExpiresAt || stored.subscriptionExpiresAt > now);

  if (isSubscribed) {
    return {
      status: 'subscribed',
      trialStartedAt: stored.trialStartedAt,
      trialDaysRemaining: 0,
      completedBakesCount: stored.completedBakesCount,
      bakesRemainingInTrial: 0,
      subscriptionTier: stored.subscriptionTier,
      isSubscribed: true,
      canCreateNewBake: true,
      canEditRecipes: true,
      isHistoryReadOnly: true, // History is always readable!
    };
  }

  const msElapsed = Math.max(0, now - stored.trialStartedAt);
  const daysElapsed = msElapsed / (1000 * 60 * 60 * 24);
  const trialDaysRemaining = Math.max(0, Math.ceil(stored.trialDays - daysElapsed));
  const bakesRemainingInTrial = Math.max(
    0,
    TRIAL_MAX_COMPLETED_BAKES - stored.completedBakesCount
  );

  const isTrialActive = trialDaysRemaining > 0 && bakesRemainingInTrial > 0;

  if (isTrialActive) {
    return {
      status: 'trial_active',
      trialStartedAt: stored.trialStartedAt,
      trialDaysRemaining,
      completedBakesCount: stored.completedBakesCount,
      bakesRemainingInTrial,
      subscriptionTier: 'none',
      isSubscribed: false,
      canCreateNewBake: true,
      canEditRecipes: true,
      isHistoryReadOnly: true,
    };
  }

  // Trial expired: Read-only for history, but new creation blocked
  return {
    status: 'trial_expired',
    trialStartedAt: stored.trialStartedAt,
    trialDaysRemaining: 0,
    completedBakesCount: stored.completedBakesCount,
    bakesRemainingInTrial: 0,
    subscriptionTier: 'none',
    isSubscribed: false,
    canCreateNewBake: false,
    canEditRecipes: false,
    isHistoryReadOnly: true,
  };
}

/**
 * React hook to observe and interact with application access state.
 */
export function useAppAccess() {
  const [access, setAccess] = useState<AppAccessInfo>(() =>
    evaluateAppAccess({
      id: 'current_user',
      trialStartedAt: Date.now(),
      trialDays: TRIAL_DURATION_DAYS,
      subscriptionTier: 'none',
      subscriptionExpiresAt: null,
      completedBakesCount: 0,
    })
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [isPaywallVisible, setPaywallVisible] = useState<boolean>(false);

  const refresh = useCallback(async () => {
    try {
      const stored = await getAppAccess();
      setAccess(evaluateAppAccess(stored));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /**
   * Guards an action requiring active creation access.
   * If access is expired, opens paywall modal and returns false.
   */
  const requireActionAccess = useCallback(
    (action?: () => void | Promise<void>): boolean => {
      if (access.canCreateNewBake) {
        if (action) {
          void action();
        }
        return true;
      }
      setPaywallVisible(true);
      return false;
    },
    [access.canCreateNewBake]
  );

  const subscribe = useCallback(
    async (tier: 'monthly' | 'yearly' | 'lifetime') => {
      let expiresAt: number | null = null;
      const now = Date.now();
      if (tier === 'monthly') {
        expiresAt = now + 30 * 24 * 60 * 60 * 1000;
      } else if (tier === 'yearly') {
        expiresAt = now + 365 * 24 * 60 * 60 * 1000;
      }
      await setSubscriptionTier(tier, expiresAt);
      await refresh();
      setPaywallVisible(false);
    },
    [refresh]
  );

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    // In offline-first environment, refresh from local SQLite
    const stored = await getAppAccess();
    const evaluated = evaluateAppAccess(stored);
    setAccess(evaluated);
    return evaluated.isSubscribed;
  }, []);

  return {
    access,
    loading,
    refresh,
    isPaywallVisible,
    setPaywallVisible,
    requireActionAccess,
    subscribe,
    restorePurchases,
  };
}

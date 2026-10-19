import { evaluateAppAccess } from '../app-access';
import type { Decyzja } from '../platnosci/dostep';

// Ocena dostępu wyłącznie z decyzji sklepu (platnosci/dostep.ts) [M1-audytor-generalny-008, -009].
// Usunięte (009): testy lokalnego okresu próbnego liczonego od trialStartedAt i licznika wypieków;
// okres próbny to oferta wprowadzająca App Store — zastępują je platnosci-hook („fresh install…”)
// i paywall-modal („eligible user sees the store trial length…”).
describe('App access evaluation', () => {
  it('store entitlement (subscription, introductory offer or lifetime) grants access', () => {
    const d: Decyzja = { dostep: true, powod: 'sklep', pamiec: { produkty: ['x'], wygasa: null } };
    expect(evaluateAppAccess(d)).toEqual({ status: 'dostep', zakup: d, canCreateNewBake: true });
  });

  it('memory of the last store read grants access while the store is unreachable', () => {
    const d: Decyzja = { dostep: true, powod: 'pamiec', pamiec: { produkty: ['x'], wygasa: 5 } };
    expect(evaluateAppAccess(d).status).toBe('dostep');
  });

  it('no entitlement means no access', () => {
    const d: Decyzja = { dostep: false, powod: 'brak', pamiec: null };
    expect(evaluateAppAccess(d)).toEqual({ status: 'bez_uprawnienia', zakup: d, canCreateNewBake: false });
  });
});

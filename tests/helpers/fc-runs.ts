// Liczba przebiegów własności: lokalna wartość testu albo więcej z nightly (FC_NUM_RUNS → fc.configureGlobal w
// jest.app-after-env.js). Lokalne { numRuns } zastępuje globalne, więc bez tego nightly „1000 runs” biegł jak CI
// [M1-audytor-generalny-069; 07-jakosc-005, opcja a].
import fc from 'fast-check';

export function nr(lokalnie: number): number {
  return Math.max(lokalnie, fc.readConfigureGlobal().numRuns ?? 0);
}

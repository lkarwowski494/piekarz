/**
 * Koniec wypieku ma scenariusz E2E (ocena → zapis → wpis w Dzienniku) i punkt listy telefonu z kopią automatyczną
 * [M1-audytor-generalny-016; 07-jakosc-003]. Identyfikatory scenariusza istnieją w kodzie.
 */
import fs from 'fs';
import path from 'path';
import { planBakeSteps, isDutchOvenStep } from '../src/core/bake-steps';

const ROOT = path.join(__dirname, '..');
const czytaj = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

describe('016: koniec wypieku w E2E i na liście telefonu', () => {
  const flow = czytaj('.maestro/e2e/06-koniec-wypieku.yaml');
  it('scenariusz E2E kończy wypiek, zapisuje ocenę i sprawdza wpis w Dzienniku', () => {
    for (const id of ['bake-plan-btn', 'plan-krok-ostatni', 'next-or-finish-step-btn', 'finish-rating-star-4', 'finish-save-btn', 'tab-dziennik', 'bake-log-card-.*'])
      expect(flow).toContain(`id: "${id}"`);
  });
  it('identyfikatory scenariusza są w kodzie', () => {
    expect(czytaj('src/components/stolnica/BakeStepsList.tsx')).toContain("'plan-krok-ostatni'");
    expect(czytaj('src/components/stolnica/FinishBakeModal.tsx')).toContain("testID: 'finish-save-btn'");
    expect(czytaj('src/components/stolnica/BakeHistorySection.tsx')).toContain('bake-log-card-${log.id}');
  });
  it('lista telefonu ma punkt końca wypieku z plikiem piekarz-kopia-*', () => {
    const lista = czytaj('docs/wydanie/lista-kontrolna-telefonu.md');
    expect(lista).toMatch(/\*\*PH-15\*\* Koniec wypieku[^\n]*Dzienniku[^\n]*piekarz-kopia-/);
  });
  it('ostatni krok planu nie jest krokiem w garnku: „Zrobione” na nim otwiera ocenę (przegląd 016 P3-3)', () => {
    const kroki = planBakeSteps({ startAt: Date.now(), isHighRye: false });
    expect(isDutchOvenStep(kroki[kroki.length - 1])).toBe(false);
  });
});

// Trwający wypiek bez receptury od `now` (domyślny chleb pszenny z planu) — ten sam stan, który dawał start
// ze Stolnicy bez wypieku przed przekierowaniem na Dziś [M1-audytor-generalny-117]. Zapis sesji jak po zabiciu
// procesu: Stolnica przywraca go przy montowaniu, zegar pierwszego kroku rusza sam (056).
import { planBakeSteps } from '../../src/core/bake-steps';
import { stepDurationSec } from '../../src/core/bake-session';
import { saveBakeSession } from '../../src/data/bake-session-store';
import { t } from '../../src/lib/i18n';

// `zaczetyZDostepem`: znacznik wypieku zaczętego z dostępem (D-039, 125); brak opcji = zapis bez znacznika,
// jak sesja sprzed tej wersji.
export async function zacznijWypiekBezReceptury(now: number = Date.now(), opts: { zaczetyZDostepem?: boolean } = {}): Promise<void> {
  const steps = planBakeSteps({ startAt: now, isHighRye: false });
  const bake =
    opts.zaczetyZDostepem === undefined
      ? null
      : { id: `bake_${now}`, recipeName: t('Wypiek bez receptury'), startedAt: now, currentStageId: steps[0].id, zaczetyZDostepem: opts.zaczetyZDostepem };
  await saveBakeSession({
    version: 2,
    steps,
    stepIdx: 0,
    dutchOvenPhase: 'lid_on',
    timerEndsAt: null,
    pausedLeftSec: stepDurationSec(steps[0], 'lid_on'),
    recipeName: t('Wypiek bez receptury'),
    startedAt: now,
    bake,
  });
}

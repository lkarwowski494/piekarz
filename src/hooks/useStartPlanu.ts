// ============================================================================
// Piekarz — „Zacznij wypiek” i „Zaplanuj” w planie wypieku (F-07, D-092, D-104, D-108; BR-KAL-009) [M3 D5]
// Wydzielone z app/(tabs)/receptury/harmonogram.tsx (limit 20 KB). Start: migawka kroków planu na Stolnicę, przy
// trwających pytanie z D-104. Zaplanuj: niezaczęty wypiek w bake_sessions (`planned`) z tymi samymi danymi wypieku,
// limit 5 z przejściem do listy na „Dziś”, kolizja kroków czynnych z innym planem albo trwającym wypiekiem —
// zapis dopiero po decyzji; po zapisie powiadomienie o starcie (resync) i lista planów na „Dziś”.
// ============================================================================

import { useRouter } from 'expo-router';
import type { SessionStep } from '../core/bake-steps';
import { kolizjePlanu } from '../core/plany-wypiekow';
import { MAX_TRWAJACYCH_WYPIEKOW, MAX_ZAPLANOWANYCH_WYPIEKOW } from '../core/limity-wypiekow';
import type { StoredStarter } from '../data/db';
import type { ActiveBakeState } from '../data/sqlite-schema';
import { setActiveBake } from '../data/sqlite-store';
import { loadActiveBakeSessions, loadPlannedBakes, savePlannedBake, type PlannedBake } from '../data/bake-sessions-store';
import { recepturaPlanu } from '../lib/plan-receptury';
import { confirmKolizjaPlanow, confirmLimitPlanow, confirmLimitWypiekow, confirmStartPrzyTrwajacym } from '../lib/confirm';
import { trwajaceWypieki, utrwalWypiekZPamieci } from '../lib/przerwij-wypiek';
import { resyncNotifications } from '../lib/notifications';
import { guardSave } from '../lib/save-guard';
import { formatTime } from '../lib/format';
import { nazwaReceptury } from '../lib/nazwa-receptury';
import { t } from '../lib/i18n';

export interface WejscieStartuPlanu {
  steps: readonly SessionStep[];
  zakwas: StoredStarter | null;
  ambientTemp: number;
  tempWybrana: boolean;
  /** Start nieaktywny („za późno” albo receptura bez zakwasu). */
  zablokowany: boolean;
  requireActionAccess: (fn: () => void) => void;
}

export function useStartPlanu({ steps, zakwas, ambientTemp, tempWybrana, zablokowany, requireActionAccess }: WejscieStartuPlanu) {
  const router = useRouter();

  // Dane wypieku z planu: nazwa i ilości receptury z „Ułóż plan” (057), zakwas planu, temperatura tylko wybrana (017)
  const daneWypieku = (id: string, startedAt: number): ActiveBakeState => {
    const receptura = recepturaPlanu();
    return {
      id,
      recipeName: receptura ? receptura.recipeName : t('Klasyczny chleb rzemieślniczy'),
      startedAt,
      currentStageId: steps[0]?.id ?? '',
      ...(tempWybrana ? { ambientTempC: ambientTemp } : {}),
      isHighRye: receptura ? receptura.calculatedRecipe.isHighRye : false,
      steps: [...steps],
      ...(zakwas ? { starterId: zakwas.id } : {}),
      ...(receptura ? { calculatedRecipe: receptura.calculatedRecipe, recipeFormula: receptura.recipeFormula } : {}),
      // Id receptury w sesji, przy końcu w bakes.recipe_id: „Piecz ponownie” po id (D-10, D1-7) [M3 D3a]
      ...(receptura?.recipeId !== undefined ? { recipeId: receptura.recipeId } : {}),
    };
  };

  // Transfer to Stolnica: migawka etapów pokazanego planu (F-07) [M1-audytor-generalny-030]
  const zacznij = () => {
    if (zablokowany) return; // start z krokami w przeszłości: nieaktywny z powodem (§11c 107) [M1-audytor-generalny-107]
    const start = () => {
      const id = `bake_${Date.now()}`;
      // Start tylko z dostępem: wypiek prowadzi się do końca także po wygaśnięciu (D-039) [M1-audytor-generalny-125]
      setActiveBake({ ...daneWypieku(id, Date.now()), zaczetyZDostepem: true });
      router.push({ pathname: '/stolnica', params: { wypiek: id } });
    };
    const wroc = (wypiek: string) => router.push({ pathname: '/stolnica', params: { wypiek } });
    // Kilka wypieków naraz (D-092): przy jednym trwającym „Prowadź oba” / „Wróć do: …” / „Anuluj”, przy limicie tylko
    // powrót albo „Anuluj” (D-104); bez trwającego start jak dotąd [M3 D3a]
    requireActionAccess(() => {
      void trwajaceWypieki().then((trwajace) => {
        const [trwa] = trwajace;
        if (!trwa) return start();
        if (trwajace.length >= MAX_TRWAJACYCH_WYPIEKOW) return confirmLimitWypiekow(trwajace, wroc);
        confirmStartPrzyTrwajacym(trwa, () => {
          // Wypiek z pamięci bez zapisu najpierw do zapisu: pamięć dostaje nowy wypiek
          void utrwalWypiekZPamieci().then((ok) => {
            if (ok) start();
          });
        }, wroc);
      });
    });
  };

  const pokazPlany = () => router.navigate('/');

  // „Zaplanuj” (BR-KAL-009): limit, kolizja z decyzją, zapis; nieudany zapis: „Nie zapisano” (guardSave)
  const zaplanuj = () => {
    const pierwszy = steps[0]?.plannedStart;
    if (zablokowany || typeof pierwszy !== 'number') return;
    requireActionAccess(() => {
      void (async () => {
        const [plany, trwajace] = await Promise.all([loadPlannedBakes().catch(() => []), loadActiveBakeSessions().catch(() => [])]);
        if (plany.length >= MAX_ZAPLANOWANYCH_WYPIEKOW) return confirmLimitPlanow(pokazPlany);
        const id = `bake_${Date.now()}`;
        const plan: PlannedBake = { version: 1, id, recipeName: daneWypieku(id, pierwszy).recipeName, plannedStartAt: pierwszy, steps: [...steps], bake: daneWypieku(id, pierwszy) };
        const receptura = recepturaPlanu();
        if (receptura?.recipeId !== undefined) plan.recipeId = receptura.recipeId;
        const zapisz = () =>
          void guardSave(async () => {
            const r = await savePlannedBake(plan);
            if (!r.ok) return confirmLimitPlanow(pokazPlany);
            void resyncNotifications();
            pokazPlany();
          })();
        const inne = [
          ...plany.map((p) => ({ nazwa: p.recipeName, kroki: p.steps })),
          ...trwajace.map((s) => ({ nazwa: s.recipeName, kroki: s.steps.slice(s.stepIdx) })),
        ];
        const kolizje = kolizjePlanu(steps, inne);
        if (kolizje.length === 0) return zapisz();
        const linie = kolizje.map((k) =>
          t('{krok} o {godzina}: w tym czasie {wypiek}: {krokInny}', { krok: t(k.krok), godzina: formatTime(k.at), wypiek: nazwaReceptury(k.wypiek), krokInny: t(k.krokInny) })
        );
        confirmKolizjaPlanow(linie, zapisz);
      })();
    });
  };

  return { zacznij, zaplanuj };
}

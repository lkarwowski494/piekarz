// ============================================================================
// Piekarz — „Zacznij wypiek” i „Zaplanuj” w planie wypieku (F-07, D-092, D-104, D-108; BR-KAL-009) [M3 D5]
// Wydzielone z app/(tabs)/receptury/harmonogram.tsx (limit 20 KB). Start: migawka kroków planu na Stolnicę, przy
// trwających pytanie z D-104. Zaplanuj: niezaczęty wypiek w bake_sessions (`planned`) z tymi samymi danymi wypieku,
// limit 5 z przejściem do listy na „Dziś”, kolizja kroków czynnych z innym planem albo trwającym wypiekiem —
// zapis dopiero po decyzji; po zapisie powiadomienie o starcie (resync) i lista planów na „Dziś”.
// Piekarnik zajęty (D6; BR-KAL-016, RD-34): przy „Zaplanuj” i przy starcie okno piekarnika nowego wypieku wobec
// planów i trwających — jedno pytanie z „Przesuń start” zamiast „Kroki nachodzą na siebie” o tę samą kolizję.
// ============================================================================

import { useRouter } from 'expo-router';
import type { SessionStep } from '../core/bake-steps';
import { kolizjePlanu } from '../core/plany-wypiekow';
import { oknoPiekarnika, przesunKroki, sprawdzPiekarnik, type InnyWypiek } from '../core/piekarnik';
import { MAX_TRWAJACYCH_WYPIEKOW, MAX_ZAPLANOWANYCH_WYPIEKOW } from '../core/limity-wypiekow';
import type { StoredStarter } from '../data/db';
import type { ActiveBakeState } from '../data/sqlite-schema';
import { setActiveBake } from '../data/sqlite-store';
import { loadActiveBakeSessions, loadPlannedBakes, savePlannedBake, type PlannedBake } from '../data/bake-sessions-store';
import type { BakeSession } from '../data/bake-session-store';
import { recepturaPlanu } from '../lib/plan-receptury';
import {
  confirmKolizjaPlanow, confirmLimitPlanow, confirmLimitWypiekow, confirmPiekarnikBezNagrzewania, confirmPiekarnikZajety, confirmStartPrzyTrwajacym,
  type AkcjaPytania,
} from '../lib/confirm';
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
  const daneWypieku = (id: string, startedAt: number, kroki: readonly SessionStep[] = steps): ActiveBakeState => {
    const receptura = recepturaPlanu();
    return {
      id,
      recipeName: receptura ? receptura.recipeName : t('Klasyczny chleb rzemieślniczy'),
      startedAt,
      currentStageId: kroki[0]?.id ?? '',
      ...(tempWybrana ? { ambientTempC: ambientTemp } : {}),
      isHighRye: receptura ? receptura.calculatedRecipe.isHighRye : false,
      steps: [...kroki],
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
      void Promise.all([trwajaceWypieki(), wczytajInne()]).then(([trwajace, inne]) => {
        const [trwa] = trwajace;
        // Piekarnik zajęty: „Przesuń start” zapisuje przesunięty plan, druga akcja to start bez zmiany (D6)
        const przesun = (po: readonly SessionStep[]) => zapiszPlan(po, inne);
        if (!trwa) return pytajOPiekarnik(steps, inne, { tekst: t('Zacznij wypiek'), onPress: start }, przesun);
        if (trwajace.length >= MAX_TRWAJACYCH_WYPIEKOW) return confirmLimitWypiekow(trwajace, wroc);
        const oba = () =>
          // Wypiek z pamięci bez zapisu najpierw do zapisu: pamięć dostaje nowy wypiek
          void utrwalWypiekZPamieci().then((ok) => {
            if (ok) start();
          });
        const r = sprawdzPiekarnik(steps, inne.piekarnik);
        if (r.stan === 'zajety') return pytajOPiekarnik(steps, inne, { tekst: t('Prowadź oba'), onPress: oba }, przesun);
        const pytanie = () => confirmStartPrzyTrwajacym(trwa, oba, wroc);
        if (r.stan === 'brak-nagrzewania' && maPiekarnik(inne.piekarnik)) return confirmPiekarnikBezNagrzewania({ tekst: t('Zacznij wypiek'), onPress: pytanie });
        pytanie();
      });
    });
  };

  const pokazPlany = () => router.navigate('/');

  /**
   * Zapis planu z krokami `kroki` (BR-KAL-009): limit 5, kolizja kroków czynnych z pytaniem (D5), chyba że `bezPytania`
   * (już odpowiedziano na pytanie o piekarnik o tę samą kolizję, D6); nieudany zapis: „Nie zapisano” (guardSave).
   */
  const zapiszPlan = (kroki: readonly SessionStep[], inne: Inne, bezPytania = false) => {
    const pierwszy = kroki[0]?.plannedStart;
    if (typeof pierwszy !== 'number') return;
    if (inne.plany >= MAX_ZAPLANOWANYCH_WYPIEKOW) return confirmLimitPlanow(pokazPlany);
    const id = `bake_${Date.now()}`;
    const bake = daneWypieku(id, pierwszy, kroki);
    const plan: PlannedBake = { version: 1, id, recipeName: bake.recipeName, plannedStartAt: pierwszy, steps: [...kroki], bake };
    const receptura = recepturaPlanu();
    if (receptura?.recipeId !== undefined) plan.recipeId = receptura.recipeId;
    const zapisz = () =>
      void guardSave(async () => {
        const r = await savePlannedBake(plan);
        if (!r.ok) return confirmLimitPlanow(pokazPlany);
        void resyncNotifications();
        pokazPlany();
      })();
    const kolizje = bezPytania ? [] : kolizjePlanu(kroki, inne.kroki);
    if (kolizje.length === 0) return zapisz();
    const linie = kolizje.map((k) =>
      t('{krok} o {godzina}: w tym czasie {wypiek}: {krokInny}', { krok: t(k.krok), godzina: formatTime(k.at), wypiek: nazwaReceptury(k.wypiek), krokInny: t(k.krokInny) })
    );
    confirmKolizjaPlanow(linie, zapisz);
  };

  // „Zaplanuj” (BR-KAL-009, BR-KAL-016): limit, piekarnik (D6), kolizja kroków (D5), zapis
  const zaplanuj = () => {
    if (zablokowany || typeof steps[0]?.plannedStart !== 'number') return;
    requireActionAccess(() => {
      void wczytajInne().then((inne) => {
        if (inne.plany >= MAX_ZAPLANOWANYCH_WYPIEKOW) return confirmLimitPlanow(pokazPlany);
        const dalej = () => zapiszPlan(steps, inne);
        const r = sprawdzPiekarnik(steps, inne.piekarnik);
        if (r.stan === 'zajety') return pytajOPiekarnik(steps, inne, { tekst: t('Zapisz bez zmiany'), onPress: () => zapiszPlan(steps, inne, true) }, (po) => zapiszPlan(po, inne));
        if (r.stan === 'brak-nagrzewania' && maPiekarnik(inne.piekarnik)) return confirmPiekarnikBezNagrzewania({ tekst: t('Zaplanuj mimo to'), onPress: dalej });
        dalej();
      });
    });
  };

  return { zacznij, zaplanuj };
}

/** Inne wypieki: kroki czynne od bieżącego kroku (D5), okna piekarnika z całego planu (D6), liczba planów (limit 5). */
interface Inne {
  plany: number;
  kroki: { nazwa: string; kroki: readonly SessionStep[] }[];
  piekarnik: InnyWypiek[];
}

async function wczytajInne(): Promise<Inne> {
  const [plany, trwajace] = await Promise.all([loadPlannedBakes().catch((): PlannedBake[] => []), loadActiveBakeSessions().catch((): BakeSession[] => [])]);
  return {
    plany: plany.length,
    kroki: [...plany.map((p) => ({ nazwa: p.recipeName, kroki: p.steps })), ...trwajace.map((s) => ({ nazwa: s.recipeName, kroki: s.steps.slice(s.stepIdx) }))],
    // Trwający z całym planem: piekarnik jest zajęty do końca pieczenia także po kroku nagrzewania
    piekarnik: [...plany.map((p) => ({ nazwa: p.recipeName, kroki: p.steps })), ...trwajace.map((s) => ({ nazwa: s.recipeName, kroki: s.steps }))],
  };
}

/** Czy któryś inny wypiek ma okno piekarnika (pytanie o brak nagrzewania ma sens tylko wtedy, RD-34-W6). */
const maPiekarnik = (inne: readonly InnyWypiek[]) => inne.some((w) => oknoPiekarnika(w.kroki).ok);

/**
 * Pytanie o piekarnik (RD-34): wolny — od razu `dalej`; zajęty — „Piekarnik zajęty o {godzina}” z propozycją
 * przesunięcia startu (`przesun` dostaje przesunięte kroki) i `dalej` jako drugą akcją; bez nagrzewania przy innym
 * wypieku z piekarnikiem — prośba o krok nagrzewania (RD-34-W6).
 */
function pytajOPiekarnik(kroki: readonly SessionStep[], inne: Inne, dalej: AkcjaPytania, przesun: (po: readonly SessionStep[]) => void) {
  const r = sprawdzPiekarnik(kroki, inne.piekarnik);
  if (r.stan === 'brak-nagrzewania' && maPiekarnik(inne.piekarnik)) return confirmPiekarnikBezNagrzewania(dalej);
  const [k] = r.stan === 'zajety' ? r.kolizje : [];
  if (r.stan !== 'zajety' || !k) return dalej.onPress();
  const po = przesunKroki(kroki, r.przesuniecieMs);
  const pieczenie = [...po].reverse().find((s) => s.category === 'bake')?.plannedStart;
  const gotowe = po[po.length - 1]?.plannedEnd;
  const godz = (ms: number | null | undefined) => (typeof ms === 'number' ? formatTime(ms) : '');
  confirmPiekarnikZajety(
    {
      godzina: formatTime(k.od), pierwszy: nazwaReceptury(k.wypiek), od: formatTime(k.okno.od), do: formatTime(k.okno.do),
      drugi: nazwaReceptury(recepturaPlanu()?.recipeName ?? t('Klasyczny chleb rzemieślniczy')), minuty: Math.round(r.przesuniecieMs / 60_000),
      pieczenie: godz(pieczenie), gotowe: godz(gotowe),
    },
    { przesun: () => przesun(po), bezZmiany: dalej }
  );
}

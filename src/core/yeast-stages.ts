// ============================================================================
// Piekarz — kroki planu i prowadzenia wersji drożdżowej (D-155, D-174) [M3 p9b]
// Kolejność według DRO-MOD-016 (docs/tresci/pl/drozdze-plan-przelicznik.md, plan.yeast.steps): mieszanie,
// wyrabianie, pierwsze rośnięcie, odgazowanie, kształtowanie, drugie rośnięcie, pieczenie. Tylko kategorie wydanego
// buildu (bake-steps.ts, warunek G4: 1021 odczyta sesję po powrocie do starszego buildu). Czasy rośnięcia
// z receptury (docs/tresci/pl/wersje-drozdzowe.md), bez przeliczania temperaturą (D-174). Kroki z rękami bez czasu
// w treści (mieszanie, odgazowanie, kształtowanie, studzenie) biorą czasy tych samych kroków planu na zakwasie
// (DEFAULT_STAGE_TEMPLATES, KRO-POC-011 [DO USTALENIA] u roli 06). Pieczenie: czas receptury (para + rumienienie),
// żyto ze źródła wersji. Orkisz: źródło nie dzieli 3 h na etapy (DRO-WER-SP-001, „brak podziału”) — bez planu.
// Nazwy i instrukcje to klucze PL dla t() (EN: src/lib/i18n-en/czesc-28.ts).
// ============================================================================

import type { SessionStep } from './bake-steps';
import { DEFAULT_STAGE_TEMPLATES, type StageCategory } from '../scheduler/reverse-scheduler';
import { CATALOG_RECIPES } from '../recipes/katalog';

interface CzasyWersji {
  /** Pierwsze rośnięcie, min. */
  rosniecieMin: number;
  /** Odpoczynek po podziale, min; brak = bez kroku (tylko graham ma go w źródle). */
  odpoczynekMin?: number;
  /** Drugie rośnięcie (w formie / po uformowaniu), min. */
  garowanieMin: number;
  /** Pieczenie ze źródła wersji, min; brak = czas receptury. */
  pieczenieMin?: number;
  /** Ciasto bez wyrabiania (tartine, DRO-WER-TA-001) albo żytnie (bez wyrabiania, ZYT-ETA-001). */
  bezWyrabiania?: boolean;
  /** Kęsy formowane ręcznie zaraz po odpoczynku, bez odgazowania (żyto, ZYT-DRO-002). */
  bezOdgazowania?: boolean;
}

const CZASY: Readonly<Record<string, CzasyWersji | null>> = {
  spelt_ancient_seeded: null, // DRO-WER-SP-001: 3 h od zarobienia do pieca bez podziału na etapy
  graham_bread_honey: { rosniecieMin: 15, odpoczynekMin: 15, garowanieMin: 70 }, // DRO-WER-GR-001
  rye_100_pan: { rosniecieMin: 60, garowanieMin: 60, pieczenieMin: 10 + 35, bezWyrabiania: true, bezOdgazowania: true }, // ZYT-DRO-002
  tartine_high_hydration_80: { rosniecieMin: 8 * 60, garowanieMin: 90, bezWyrabiania: true }, // DRO-WER-TA-001: noc, co najmniej 8 h
};

const MIESZANIE = 'Wymieszaj składniki do uzyskania jednolitej masy. Nie próbuj surowego ciasta ani mąki. Po pracy z ciastem umyj ręce mydłem pod bieżącą wodą.';
const CZASY_WSKAZOWKA = 'Czasy są wskazówką, bo tempo rośnięcia zależy od składników, siły ciasta, temperatury i wilgotności.';
const TEST_PALCA = 'Ciasto jest gotowe, gdy wgłębienie po naciśnięciu palcem zostaje. Przed pieczeniem uformowane ciasto nie powinno więcej niż podwoić objętości.';

function szablon(id: string): { namePl: string; durationMinutes: number; instructionsPl: string } {
  const tp = DEFAULT_STAGE_TEMPLATES.find((x) => x.id === id);
  if (!tp) throw new Error(`Brak szablonu etapu ${id}`); // błąd programisty
  return tp;
}

interface Krok { id: string; name: string; category: StageCategory; durationMin: number; isPassive: boolean; rekaNaStarcie?: boolean; instructions: string }

function krokiBezCzasu(recipeId: string): Krok[] | null {
  const c = Object.prototype.hasOwnProperty.call(CZASY, recipeId) ? CZASY[recipeId] : null;
  const receptura = CATALOG_RECIPES.find((r) => r.id === recipeId);
  if (!c || !receptura) return null;
  const studzenie = szablon('cool');
  const odpoczynek = szablon('bench_rest');
  const kroki: (Krok | null)[] = [
    { id: 'yeast_mix', name: c.bezWyrabiania ? 'Mieszanie ciasta' : 'Mieszanie i wyrabianie', category: 'mix', durationMin: szablon('mix').durationMinutes, isPassive: false, instructions: MIESZANIE },
    { id: 'yeast_rise', name: 'Pierwsze rośnięcie', category: 'bulk_ferment', durationMin: c.rosniecieMin, isPassive: true, instructions: CZASY_WSKAZOWKA },
    c.bezOdgazowania ? null : { id: 'yeast_degas', name: 'Odgazowanie', category: 'pre_shape', durationMin: szablon('pre_shape').durationMinutes, isPassive: false, instructions: '' },
    c.odpoczynekMin === undefined ? null : { id: 'yeast_bench', name: odpoczynek.namePl, category: 'bench_rest', durationMin: c.odpoczynekMin, isPassive: true, instructions: odpoczynek.instructionsPl },
    c.bezOdgazowania
      ? { id: 'yeast_shape', name: 'Podział i formowanie', category: 'final_shape', durationMin: szablon('final_shape').durationMinutes, isPassive: false, instructions: 'Podziel ciasto, uformuj je ręcznie i włóż do formy.' }
      : { id: 'yeast_shape', name: 'Kształtowanie', category: 'final_shape', durationMin: szablon('final_shape').durationMinutes, isPassive: false, instructions: '' },
    { id: 'yeast_proof', name: 'Drugie rośnięcie', category: 'final_proof', durationMin: c.garowanieMin, isPassive: true, instructions: TEST_PALCA },
    {
      id: 'yeast_bake', name: 'Pieczenie', category: 'bake', isPassive: true, rekaNaStarcie: true, instructions: '',
      durationMin: c.pieczenieMin ?? receptura.bakeTimeSteamMinutes + receptura.bakeTimeBrowningMinutes,
    },
    { id: 'yeast_cool', name: studzenie.namePl, category: 'cool', durationMin: studzenie.durationMinutes, isPassive: true, instructions: studzenie.instructionsPl },
  ];
  return kroki.filter((k): k is Krok => k !== null);
}

/** Czy wersja drożdżowa receptury ma plan (czasy etapów ze źródła). */
export function maPlanDrozdzowy(recipeId: string | undefined): boolean {
  return recipeId !== undefined && krokiBezCzasu(recipeId) !== null;
}

/** Kroki wersji drożdżowej kolejno od `startAt`; null = brak planu dla tej receptury. */
export function krokiDrozdzowe(recipeId: string, startAt: number): SessionStep[] | null {
  const kroki = krokiBezCzasu(recipeId);
  if (!kroki) return null;
  let at = startAt;
  return kroki.map((k) => {
    const start = at;
    at += k.durationMin * 60_000;
    return { ...k, plannedStart: start, plannedEnd: at };
  });
}

/** Plan wstecz: kroki wersji drożdżowej tak, że ostatni (studzenie) kończy się o `endAt` („gotowe o”). */
export function krokiDrozdzoweKonczaceSie(recipeId: string, endAt: number): SessionStep[] | null {
  const kroki = krokiBezCzasu(recipeId);
  if (!kroki) return null;
  return krokiDrozdzowe(recipeId, endAt - kroki.reduce((s, k) => s + k.durationMin, 0) * 60_000);
}


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

import type { SessionStep } from '../core/bake-steps';
import { DEFAULT_STAGE_TEMPLATES, type StageCategory } from '../core/reverse-scheduler';
import { CATALOG_RECIPES } from './katalog';
import { RYE_STAGE_TEMPLATES, RYE_PROOF_STAGE_ID } from '../core/rye-stages';

/** Pieczenie wersji drożdżowej: temperatura i czas dwóch faz (bez zgadywania pary, której źródło nie podaje). */
export interface PieczenieWersji { temp1C: number; min1: number; temp2C: number; min2: number }

interface CzasyWersji {
  /** Pierwsze rośnięcie, min. */
  rosniecieMin: number;
  /** Odpoczynek po podziale, min; brak = bez kroku (tylko graham ma go w źródle). */
  odpoczynekMin?: number;
  /** Drugie rośnięcie (w formie / po uformowaniu), min. */
  garowanieMin: number;
  /** Pieczenie ze źródła wersji (dwie fazy); brak = czas receptury. */
  pieczenie?: PieczenieWersji;
  /** Rośnięcie w formie ocenia powierzchnia ciasta (ZYT-ETA-005), nie test palca — ciasto żytnie bez glutenu (D-256). */
  gotowoscPowierzchnia?: boolean;
  /** Studzenie wersji, min; brak = szablon planu (120). Żyto: do 24 h (KRO-POC-016, D-256). */
  studzenieMin?: number;
  studzenieOpis?: string;
  /** Ciasto bez wyrabiania (tartine, DRO-WER-TA-001) albo żytnie (bez wyrabiania, ZYT-ETA-001). */
  bezWyrabiania?: boolean;
  /** Kęsy formowane ręcznie zaraz po odpoczynku, bez odgazowania (żyto, ZYT-DRO-002). */
  bezOdgazowania?: boolean;
}

const CZASY: Readonly<Record<string, CzasyWersji | null>> = {
  spelt_ancient_seeded: null, // DRO-WER-SP-001: 3 h od zarobienia do pieca bez podziału na etapy
  graham_bread_honey: { rosniecieMin: 15, odpoczynekMin: 15, garowanieMin: 70 }, // DRO-WER-GR-001
  // ZYT-DRO-002 (czasy i temperatury pieczenia), ZYT-ETA-005 (gotowość), KRO-POC-016 (studzenie do 24 h); D-256
  rye_100_pan: {
    rosniecieMin: 60, garowanieMin: 60, bezWyrabiania: true, bezOdgazowania: true, gotowoscPowierzchnia: true,
    pieczenie: { temp1C: 240, min1: 10, temp2C: 220, min2: 35 },
    studzenieMin: 24 * 60,
    studzenieOpis: 'Wilgotnym, zwartym chlebom z dużym udziałem żyta często służy studzenie nawet do 24 godzin.',
  },
  tartine_high_hydration_80: { rosniecieMin: 8 * 60, garowanieMin: 90, bezWyrabiania: true }, // DRO-WER-TA-001: noc, co najmniej 8 h
};

const MIESZANIE = 'Wymieszaj składniki do uzyskania jednolitej masy. Nie próbuj surowego ciasta ani mąki. Po pracy z ciastem umyj ręce mydłem pod bieżącą wodą.';
const CZASY_WSKAZOWKA = 'Czasy są wskazówką, bo tempo rośnięcia zależy od składników, siły ciasta, temperatury i wilgotności.';
const TEST_PALCA = 'Ciasto jest gotowe, gdy wgłębienie po naciśnięciu palcem zostaje. Przed pieczeniem uformowane ciasto nie powinno więcej niż podwoić objętości.';

/** Instrukcje rośnięcia w sesjach zapisanych przed 070-N2: kroki trwającego wypieku są z bazy, więc klucze zostają w słownikach. */
export const INSTRUKCJE_SPRZED_070N2 = { pierwsze: CZASY_WSKAZOWKA, drugie: TEST_PALCA } as const;

// Gotowość ciasta drożdżowego na obu krokach rośnięcia (BR-ETAP-001, D-312; 070-N2): zdania dosłownie
// z docs/tresci/pl/drozdze-plan-przelicznik.md — czas z receptury jest wskazówką (DRO-MOD-016) i test palca
// (DRO-MOD-013); przy drugim rośnięciu także granica objętości (DRO-MOD-015). Żyto: powierzchnia ciasta (D-256).
const ROSNIECIE_PIERWSZE = 'Czasy są wskazówką, bo tempo rośnięcia zależy od składników, siły ciasta, temperatury i wilgotności. Ciasto jest gotowe, gdy wgłębienie po naciśnięciu palcem zostaje.';
const ROSNIECIE_DRUGIE = 'Czasy są wskazówką, bo tempo rośnięcia zależy od składników, siły ciasta, temperatury i wilgotności. Ciasto jest gotowe, gdy wgłębienie po naciśnięciu palcem zostaje. Przed pieczeniem uformowane ciasto nie powinno więcej niż podwoić objętości.';

/** Instrukcja rośnięcia w formie żyta (ZYT-ETA-005): ten sam klucz co etap żytni na zakwasie. */
const OPIS_POWIERZCHNIA = RYE_STAGE_TEMPLATES.find((tp) => tp.id === RYE_PROOF_STAGE_ID)?.instructionsPl ?? '';

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
    { id: 'yeast_rise', name: 'Pierwsze rośnięcie', category: 'bulk_ferment', durationMin: c.rosniecieMin, isPassive: true, instructions: c.gotowoscPowierzchnia ? CZASY_WSKAZOWKA : ROSNIECIE_PIERWSZE },
    c.bezOdgazowania ? null : { id: 'yeast_degas', name: 'Odgazowanie', category: 'pre_shape', durationMin: szablon('pre_shape').durationMinutes, isPassive: false, instructions: '' },
    c.odpoczynekMin === undefined ? null : { id: 'yeast_bench', name: odpoczynek.namePl, category: 'bench_rest', durationMin: c.odpoczynekMin, isPassive: true, instructions: odpoczynek.instructionsPl },
    c.bezOdgazowania
      ? { id: 'yeast_shape', name: 'Podział i formowanie', category: 'final_shape', durationMin: szablon('final_shape').durationMinutes, isPassive: false, instructions: 'Podziel ciasto, uformuj je ręcznie i włóż do formy.' }
      : { id: 'yeast_shape', name: 'Kształtowanie', category: 'final_shape', durationMin: szablon('final_shape').durationMinutes, isPassive: false, instructions: '' },
    { id: 'yeast_proof', name: 'Drugie rośnięcie', category: 'final_proof', durationMin: c.garowanieMin, isPassive: true, instructions: c.gotowoscPowierzchnia ? OPIS_POWIERZCHNIA : ROSNIECIE_DRUGIE },
    {
      id: 'yeast_bake', name: 'Pieczenie', category: 'bake', isPassive: true, rekaNaStarcie: true, instructions: '',
      durationMin: c.pieczenie ? c.pieczenie.min1 + c.pieczenie.min2 : receptura.bakeTimeSteamMinutes + receptura.bakeTimeBrowningMinutes,
    },
    { id: 'yeast_cool', name: studzenie.namePl, category: 'cool', durationMin: c.studzenieMin ?? studzenie.durationMinutes, isPassive: true, instructions: c.studzenieOpis ?? studzenie.instructionsPl },
  ];
  return kroki.filter((k): k is Krok => k !== null);
}

/** Pieczenie wersji drożdżowej ze źródła (ZYT-DRO-002); null = czas i temperatura receptury. */
export function pieczenieDrozdzowe(recipeId: string | undefined): PieczenieWersji | null {
  if (recipeId === undefined || !Object.prototype.hasOwnProperty.call(CZASY, recipeId)) return null;
  return CZASY[recipeId]?.pieczenie ?? null;
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


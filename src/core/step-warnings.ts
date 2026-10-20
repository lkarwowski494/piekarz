// ============================================================================
// Piekarz — ostrzeżenia bezpieczeństwa według rodzaju kroku (BR-ETAP-004, RD-22, RD-23) [M1-audytor-generalny-103]
// Mapa i teksty dosłownie z docs/tresci/pl/ostrzezenia-krokow.md (przegląd człowieka: rejestr, commit bdb0f32).
// Wynik: klucze PL dla t(), poziom 'ostrzezenie' (komponent Ostrzeżenie) i ID twierdzeń. Mieszanie (mix, rye_mix)
// i zdjęcie pokrywki (lid_off) bez zmian: ich zdania są już w instrukcji kroku i w DUTCH_OVEN_PHASES.lid_off.
// ============================================================================

import type { PoziomKomunikatu } from './poziom-komunikatu';
import type { SessionStep } from './bake-steps';
import { RYE_STAGE_TEMPLATES } from './rye-stages';
import type { DutchOvenBakePhase } from './baking-phases';

export interface StepWarning {
  /** Tekst PL (klucz dla t()). */
  text: string;
  poziom: Extract<PoziomKomunikatu, 'ostrzezenie'>;
  claims: readonly string[];
}

const w = (text: string, claims: readonly string[]): StepWarning => ({ text, poziom: 'ostrzezenie', claims });

/** Sekcja „zakwas” (RD-22-W2). */
export const STARTER_WARNINGS: readonly StepWarning[] = [
  w('Nie próbuj surowego zakwasu ani mąki.', ['ZAK-SUR-001', 'BEZ-SUR-001']),
  w('Po pracy z mąką i zakwasem umyj ręce mydłem pod bieżącą wodą.', ['BEZ-SUR-002']),
];
/** Praca z surowym ciastem: te same dwa zdania co krok mieszania (wypiek-bezpieczenstwo.md, RD-22-W1). */
export const RAW_DOUGH_WARNINGS: readonly StepWarning[] = [
  w('Nie próbuj surowego ciasta ani mąki.', ['BEZ-SUR-001']),
  w('Po pracy z ciastem umyj ręce mydłem pod bieżącą wodą.', ['BEZ-SUR-002']),
];
/** Sekcja „gorące naczynie” (RD-23-W2, RD-23-W4). */
export const HOT_VESSEL_WARNING = w('Gorący garnek, pokrywkę i formę chwytaj suchymi rękawicami kuchennymi albo łapkami.', ['BEZ-OPA-004', 'BEZ-OPA-003']);
/** Sekcja „dzieci” (RD-23-W2). */
export const CHILDREN_WARNING = w('Dzieci trzymaj z dala od kuchenki i miejsca, w którym pracujesz.', ['BEZ-OPA-005']);
/** Sekcja „nieznany rodzaj” (RD-22-W4). */
export const UNKNOWN_KIND_WARNING = w(
  'Jeśli w tym kroku pracujesz z surową mąką, ciastem albo zakwasem, nie próbuj ich, a potem umyj ręce mydłem pod bieżącą wodą.',
  ['BEZ-SUR-001', 'ZAK-SUR-001', 'BEZ-SUR-002']
);

/** Rodzaje kroków z kodu (StageCategory, etapy żytnie, fazy garnka) → ostrzeżenia. */
export const STEP_KIND_WARNINGS: Readonly<Record<string, readonly StepWarning[]>> = {
  starter_feed: STARTER_WARNINGS,
  rye_starter: STARTER_WARNINGS,
  mix: [],
  rye_mix: [],
  autolyse: RAW_DOUGH_WARNINGS,
  bulk_ferment: RAW_DOUGH_WARNINGS,
  pre_shape: RAW_DOUGH_WARNINGS,
  final_shape: RAW_DOUGH_WARNINGS,
  rye_shape: RAW_DOUGH_WARNINGS,
  lid_off: [],
  preheat_oven: [HOT_VESSEL_WARNING, CHILDREN_WARNING],
  bake: [HOT_VESSEL_WARNING, CHILDREN_WARNING],
  lid_on: [HOT_VESSEL_WARNING, CHILDREN_WARNING],
  rye_bake: [HOT_VESSEL_WARNING, CHILDREN_WARNING],
  cool: [HOT_VESSEL_WARNING],
  rye_cool: [HOT_VESSEL_WARNING],
  bench_rest: [],
  final_proof: [],
  rye_rest: [],
  rye_proof: [],
};

/**
 * Ostrzeżenia dla rodzaju kroku. Rodzaj spoza mapy (np. krok z własnej receptury) → zdanie „nieznany rodzaj”,
 * a gdy krok trwa w czasie wypieku (piec nagrzany) — także gorące naczynie (RD-22-W4, RD-23-W4).
 */
export function stepKindWarnings(kind: string | null | undefined, opts: { duringBake?: boolean } = {}): readonly StepWarning[] {
  if (kind && Object.prototype.hasOwnProperty.call(STEP_KIND_WARNINGS, kind)) return STEP_KIND_WARNINGS[kind];
  return opts.duringBake ? [UNKNOWN_KIND_WARNING, HOT_VESSEL_WARNING] : [UNKNOWN_KIND_WARNING];
}

/** Tytuły sekcji w kolejności priorytetu (design-spec §11c „109”, decyzja właściciela 3a) [M1-audytor-generalny-109]. */
const TYTULY_SEKCJI: ReadonlyArray<[readonly StepWarning[], string]> = [
  [[HOT_VESSEL_WARNING], 'Gorące naczynie'],
  [STARTER_WARNINGS, 'Surowy zakwas'],
  [RAW_DOUGH_WARNINGS, 'Surowe ciasto i mąka'],
  [[CHILDREN_WARNING], 'Dzieci w kuchni'],
];

/**
 * Tytuł jednego Ostrzeżenia kroku (klucz PL dla t()): z sekcją „nieznany rodzaj” — „Uważaj w kuchni” (zdanie ogólne
 * obejmuje resztę), inaczej tytuł sekcji o najwyższym priorytecie; pusta lista = brak tytułu (i brak pola).
 */
export function tytulOstrzezen(ostrzezenia: readonly StepWarning[]): string | null {
  if (ostrzezenia.length === 0) return null;
  if (ostrzezenia.includes(UNKNOWN_KIND_WARNING)) return 'Uważaj w kuchni';
  const sekcja = TYTULY_SEKCJI.find(([ws]) => ws.some((x) => ostrzezenia.includes(x)));
  return sekcja ? sekcja[1] : 'Uważaj w kuchni';
}

/** Rodzaj kroku sesji: etap żytni po id, krok w garnku po fazie, inaczej kategoria planu. */
export function stepKindOf(step: Pick<SessionStep, 'id' | 'category'>, phase?: DutchOvenBakePhase): string {
  if (RYE_STAGE_TEMPLATES.some((tp) => tp.id === step.id)) return step.id;
  if (step.category === 'bake' && phase) return phase;
  return step.category;
}

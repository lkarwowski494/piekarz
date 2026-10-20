// ============================================================================
// Piekarz — etapy chleba żytniego dla Stolnicy (F-07, D-030, DEC-04 a) [M1-audytor-generalny-030]
// Treść: docs/tresci/pl|en/chleb-zytni-etapy.md, rejestr docs/tresci/rejestr.json (rola 06, partia 2).
// Kolejność i brak składania, pre_shape i bench_rest: ZYT-ETA-001. Czasów domowych nie ma w źródłach
// (ZYT-ETA-900 [DO USTALENIA]), więc czas etapu pochodzi z planu użytkownika (bake-steps.ts, ryeStepsFromPlan);
// wartości z protokołu laboratoryjnego (ZYT-ETA-002..006) nie są czasami domyślnymi.
// Nazwy i instrukcje to klucze PL dla t(); tłumaczenia EN w src/lib/i18n-en/czesc-3.ts.
// ============================================================================

import { StageCategory } from '../scheduler/reverse-scheduler';

export interface RyeStageTemplate {
  id: string;
  namePl: string;
  category: StageCategory;
  isPassive: boolean;
  instructionsPl: string;
  /** Czas ze źródła treści (zalecenie, nie blokada); null = czas z planu użytkownika (ZYT-ETA-900). */
  fixedDurationMin: number | null;
}

/** Wariant żytni: mąka żytnia stanowi więcej niż 50% mąki (ZYT-GRA-001, granica ostra). */
export const RYE_VARIANT_THRESHOLD_PCT = 50;

/** Rozrost w formie kończy stan ciasta, nie zegar (ZYT-ETA-005); minutnik z planu jest orientacyjny. */
export const RYE_PROOF_STAGE_ID = 'rye_proof';

export const RYE_STAGE_TEMPLATES: readonly RyeStageTemplate[] = [
  // ZYT-ETA-001 (nazwa)
  { id: 'rye_starter', namePl: 'Zakwas żytni', category: 'starter_feed', isPassive: true, instructionsPl: '', fixedDurationMin: null },
  // ZYT-ETA-001 (nazwa), ZYT-ETA-003 (instrukcja), BEZ-SUR-001, BEZ-SUR-002 (dwa ostatnie zdania, RD-22-W1,
  // docs/tresci/pl/wypiek-bezpieczenstwo.md) [M1-audytor-generalny-086]
  {
    id: 'rye_mix', namePl: 'Mieszanie ciasta', category: 'mix', isPassive: false,
    instructionsPl: 'Wymieszaj składniki do uzyskania jednolitej masy. Nie próbuj surowego ciasta ani mąki. Po pracy z ciastem umyj ręce mydłem pod bieżącą wodą.',
    fixedDurationMin: null,
  },
  // ZYT-ETA-004
  { id: 'rye_rest', namePl: 'Krótka fermentacja ciasta', category: 'bulk_ferment', isPassive: true, instructionsPl: '', fixedDurationMin: null },
  // ZYT-ETA-001
  {
    id: 'rye_shape', namePl: 'Podział i formowanie', category: 'final_shape', isPassive: false,
    instructionsPl: 'Podziel ciasto, uformuj je ręcznie i włóż do formy.', fixedDurationMin: null,
  },
  // ZYT-ETA-001 (nazwa), ZYT-ETA-005 (warunek końca)
  {
    id: RYE_PROOF_STAGE_ID, namePl: 'Rozrost w formie', category: 'final_proof', isPassive: true,
    instructionsPl: 'Zostaw ciasto w formie, aż jego powierzchnia dojdzie do brzegu formy.', fixedDurationMin: null,
  },
  // ZYT-ETA-001 (nazwa), ZYT-ETA-006 (para)
  {
    id: 'rye_bake', namePl: 'Wypiek w formie', category: 'bake', isPassive: true,
    instructionsPl: 'Na początku wypieku zapewnij parę w piekarniku.', fixedDurationMin: null,
  },
  // ZYT-ETA-001 (nazwa), ZYT-STU-001 (24 h wg King Arthur Baking, szczebel 4: zalecenie z atrybucją, nie blokada)
  {
    id: 'rye_cool', namePl: 'Studzenie', category: 'cool', isPassive: true,
    instructionsPl: 'Według King Arthur Baking upieczony chleb żytni na zakwasie powinien odpocząć 24 godziny przed krojeniem, dla najlepszej jakości.',
    fixedDurationMin: 1440,
  },
];

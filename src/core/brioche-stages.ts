// ============================================================================
// Piekarz — kroki planu i prowadzenia brioszki w keksówce (D-309, PIE-BRI-002, PIE-BRI-900) [M2-012]
// Treść: docs/tresci/pl|en/plan-brioszki.md, wektor docs/tresci/wektory/plan-brioszki-2026-11-09.json (rola 06, M2 p3).
// Kolejność według The Culinary Institute of America „Brioche” (PIE-BRI-002): wyrabianie z masłem, noc w lodówce,
// formowanie w keksówce, rośnięcie w cieple; bez autolizy, składań, formowania wstępnego, odpoczynku i koszyka.
// Czasy to nazwana rezerwa planu bez źródła dla Lievito Madre (PIE-BRI-900), tekst kroku nie podaje liczb.
// Szablon wybiera calculateReverseSchedule (receptura w keksówce na zakwasie, dziś tylko brioszka), więc plan
// i prowadzenie biorą kroki z jednego miejsca (wzór rye-stages.ts). Nazwy i instrukcje to klucze PL dla t() (EN: czesc-33).
// ============================================================================

import type { StageTemplate } from './reverse-scheduler';

/** Krok w lodówce: jego czas ustawia „Czas w lodówce” (coldRetardHours); Q10 go nie przelicza (D-309). */
export const BRIOCHE_COLD_STAGE_ID = 'brioche_cold';

/** Kroki brioszki między dokarmieniem a nagrzewaniem (starter_feed, pieczenie i studzenie: szablon planu i D-304). */
export const BRIOCHE_STAGE_TEMPLATES: readonly StageTemplate[] = [
  // PIE-BRI-002 (masło porcjami, wyrabianie do odchodzenia od ścianek), BEZ-SUR-001, BEZ-SUR-002 (dwa ostatnie zdania,
  // jak krok mix, wypiek-bezpieczenstwo.md); 20 min: rezerwa (19 min miksera ze źródła)
  {
    id: 'brioche_mix', namePl: 'Wyrabianie ciasta z masłem', category: 'mix', durationMinutes: 20, isPassive: false, canStretch: false,
    instructionsPl:
      'Połącz mąkę, wodę, sól i zakwas i wyrabiaj. Masło dodawaj stopniowo, porcjami. Gdy całe masło połączy się z ciastem, wyrabiaj dalej, aż ciasto zacznie odchodzić od ścianek misy. Nie próbuj surowego ciasta ani mąki. Po pracy z ciastem umyj ręce mydłem pod bieżącą wodą.',
  },
  // PIE-BRI-002 (na noc w lodówce); 840 min (480–1440): rezerwa jak garowanie w lodówce szablonu (PLN-KRO-900)
  {
    id: BRIOCHE_COLD_STAGE_ID, namePl: 'Ciasto na noc w lodówce', category: 'bulk_ferment', durationMinutes: 840, isPassive: true,
    canStretch: true, minDurationMinutes: 480, maxDurationMinutes: 1440,
    instructionsPl: 'Przełóż ciasto na blachę wyłożoną papierem do pieczenia posmarowanym masłem. Szczelnie przykryj je folią i wstaw na noc do lodówki.',
  },
  // PIE-BRI-002; 15 min jak formowanie w szablonie
  {
    id: 'brioche_shape', namePl: 'Formowanie w keksówce', category: 'final_shape', durationMinutes: 15, isPassive: false, canStretch: false,
    instructionsPl: 'Rozwałkuj ciasto dłońmi na długość keksówki. Keksówkę lekko posmaruj masłem i włóż do niej ciasto.',
  },
  // PIE-BRI-002; 20 min: rezerwa (źródło: ciasto na drożdżach instant; dla Lievito Madre [DO USTALENIA] PIE-BRI-900)
  {
    id: 'brioche_proof', namePl: 'Rośnięcie w keksówce', category: 'final_proof', durationMinutes: 20, isPassive: true, canStretch: false,
    instructionsPl: 'Przykryj keksówkę folią i odstaw ciasto do wyrośnięcia w ciepłe miejsce.',
  },
];

/** Id kroków brioszki (prowadzenie: „Po co ten krok” bez zdań o krokach bochenka). */
/** Receptury z planem brioszki (D-309): wybór po id, nie po keksówce [M2-012]. */
export const BRIOCHE_RECIPE_IDS: readonly string[] = ['lievito_madre_panettone_brioche'];

export const BRIOCHE_STAGE_IDS: readonly string[] = BRIOCHE_STAGE_TEMPLATES.map((t) => t.id);

/**
 * Szablon planu brioszki z szablonu planu: dokarmienie, kroki brioszki, nagrzewanie, pieczenie (podmienia je pieczenie
 * receptury, D-304) i studzenie bez zmian.
 */
export function briocheTemplates(plan: readonly StageTemplate[]): StageTemplate[] {
  const kat = (c: StageTemplate['category']) => plan.filter((t) => t.category === c);
  return [...kat('starter_feed'), ...BRIOCHE_STAGE_TEMPLATES, ...kat('preheat_oven'), ...kat('bake'), ...kat('cool')];
}

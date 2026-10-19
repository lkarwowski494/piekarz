// ============================================================================
// Piekarz — zamrożona kopia 8 kroków Stolnicy z HEAD 1c38b28 (dawne BAKE_STEPS) [M1-audytor-generalny-030]
// Tylko do odczytu zapisu sesji bez `steps` (format sprzed wersji 2): wypiek trwa w tym samym kroku
// i z tym samym czasem. Nie zmieniać treści ani minut; nowe wypieki biorą kroki z planu (bake-steps.ts).
// ============================================================================

import type { SessionStep } from './bake-steps';

const v1 = (
  id: string,
  name: string,
  category: SessionStep['category'],
  durationMin: number,
  instructions: string
): SessionStep => Object.freeze({ id, name, category, durationMin, isPassive: false, instructions, plannedStart: null, plannedEnd: null });

export const LEGACY_STEPS_V1: readonly SessionStep[] = Object.freeze([
  v1('step_1', 'Autoliza', 'autolyse', 45,
    'Połącz mąkę z wodą, nie dodawaj jeszcze zakwasu ani soli. Pozwól glutenowi i enzymom samoczynnie rozwinąć strukturę ciasta.'),
  v1('step_2', 'Mieszanie i zaszczepienie', 'mix', 15,
    'Dodaj aktywny zakwas i sól. Wyrabiaj techniką Rubaud lub delikatnym podwijaniem aż ciasto stanie się gładkie i elastyczne.'),
  v1('step_3', 'Składanie 1 (Stretch & Fold)', 'bulk_ferment', 30,
    'Mokrymi dłońmi podciągnij 4 brzegi ciasta ku górze i złóż do środka miski.'),
  v1('step_4', 'Składanie 2 (Coil Fold)', 'bulk_ferment', 30,
    'Delikatnie podłóż obie dłonie pod środek ciasta, unieś i pozwól końcom zawinąć się pod spód.'),
  v1('step_5', 'Składanie 3 (Coil Fold)', 'bulk_ferment', 30,
    'Ostatnie składanie budujące napięcie powierzchniowe. Ciasto powinno być puszyste i trzymać kształt kuli.'),
  v1('step_6', 'Formowanie wstępne (Pre-shape)', 'pre_shape', 20,
    'Wyłóż ciasto na blat, podtocz delikatnie w kulę skrobakiem bez nadmiaru mąki. Zostaw na 20 min odpoczynku.'),
  v1('step_7', 'Formowanie do koszyka i chłód', 'final_shape', 720,
    'Nadaj ostateczny kształt (baton lub bochenek okrągły), umieść w oprószonym koszyku i schowaj do lodówki (4°C) na 12–16h.'),
  v1('step_8', 'Wypiek w garnku z parą', 'bake', 45,
    '20 min w nagrzanym garnku żeliwnym (240°C) pod pokrywką + 22–25 min bez pokrywki (210°C) do głębokiego zbrązowienia.'),
]);

// ============================================================================
// Piekarz (Crust) — Emergency Dough Recovery Engine (Protokoły ratunkowe)
// Actionable real-time interventions when dough collapses, overproofs,
// or suffers temperature/salt accidents during bulk fermentation.
// Apps4Brew Studio — 100% Offline-First.
// ============================================================================
// Teksty dosłownie z docs/tresci/pl/doktor-ratunek.md (rola 06, F-71, 2026-10-22; pilnuje tests/tresci-f71.test.ts).
// Kroki 0–1 zimnej kuchni: docs/tresci/pl/doktor-zimna-kuchnia.md (DOK-PIE-001/002). Wycofane twierdzenia starej
// wersji (focaccia, foremka keksowa, 26–28°C, laminacja soli): RAT-*-9xx w docs/tresci/rejestr.json.

export type EmergencyCode =
  | 'OVERPROOFED_COLLAPSE'
  | 'SLACK_HIGH_HYDRATION'
  | 'COLD_SLUGGISH'
  | 'FORGOTTEN_SALT';

export interface DoughRecoveryProtocol {
  id: EmergencyCode;
  titlePl: string;
  triggerSummaryPl: string;
  immediateActionPl: string;
  /** Receptura awaryjna: żaden protokół jej nie ma i ekran jej nie pokazuje (RAT-PRZ-900, RAT-LUZ-900; BR-DIAG-003). */
  pivotRecipeNamePl?: never;
  stepByStepPl: string[];
  scientificReasoningPl: string;
}

export const DOUGH_RECOVERY_PROTOCOLS: DoughRecoveryProtocol[] = [
  {
    id: 'OVERPROOFED_COLLAPSE',
    titlePl: 'Przerośnięte ciasto',
    triggerSummaryPl:
      'Gdy ciasto przerosło, wgłębienie po delikatnym naciśnięciu palcem zostaje na stałe.',
    immediateActionPl:
      'Ciasto drożdżowe uformuj ponownie: mocno przerośnięty bochenek drożdżowy upieczony od razu opada w piecu, choć nadal dobrze smakuje.',
    stepByStepPl: [
      'Ciasta na zakwasie zwykle nie da się tak uratować: ten sposób najczęściej zawodzi, a spróbować warto tylko wtedy, gdy ciasto zrobiono i garowano w ciągu kilku godzin.',
      'Ciasto na zakwasie garowane przez noc w chłodzie jest po odgazowaniu twarde: chleb wyjdzie słabo wyrośnięty, nieforemny i bardzo kwaśny.',
      'Jeśli ratujesz ciasto, wyjmij je z koszyka albo naczynia.',
      'Odgazuj je, mocno dociskając, tak jak przy formowaniu.',
      'Uformuj je ponownie i odstaw do garowania.',
    ],
    scientificReasoningPl:
      'Przerośnięte ciasto opada, bo gluten jest już osłabiony, a gazu zrobiło się za dużo.',
  },
  {
    id: 'SLACK_HIGH_HYDRATION',
    titlePl: 'Zbyt luźne ciasto',
    triggerSummaryPl: 'Ciasto jest lepkie i luźne i nie trzyma kształtu.',
    immediateActionPl:
      'Sprawdź, czy sól jest w cieście: ciasto bez soli jest lepkie i luźne, bo sól wiąże wilgoć i napina gluten.',
    stepByStepPl: [
      'Jeśli soli brakuje, otwórz protokół „Zapomniana sól”.',
      'Rozciągaj i składaj ciasto w czasie fermentacji: to pomaga rozwinąć sieć glutenową i wzmacnia ciasto.',
      'Przy chlebie ze 100% mąki żytniej składanie zwykle można pominąć.',
    ],
    scientificReasoningPl:
      'Składanie w czasie fermentacji pomaga rozwinąć sieć glutenową i wzmacnia ciasto, a sól napina gluten.',
  },
  {
    id: 'COLD_SLUGGISH',
    titlePl: 'Ospała fermentacja (Zimna kuchnia)',
    triggerSummaryPl:
      'Ciasto rośnie wolniej niż zwykle: często winne jest chłodne miejsce, w którym stoi.',
    immediateActionPl:
      'Przenieś ciasto w cieplejsze miejsce: drożdże najlepiej rosną w ok. 24–25,5 °C.',
    stepByStepPl: [
      'Wstaw naczynie z ciastem do wyłączonego piekarnika i zapal samą żarówkę: w środku robi się stopniowo cieplej, ale każdy piekarnik i każda kuchnia dają inny wynik.',
      // DOK-PIE-002 (krytyczne, przegląd człowieka): dosłownie z docs/tresci/pl/doktor-zimna-kuchnia.md
      // [M1-audytor-generalny-069; 06-tresci-012]
      'Wyjmij naczynie, zanim włączysz nagrzewanie piekarnika: łatwo o tym zapomnieć.',
      'Inne ciepłe miejsca to wierzch lodówki albo wysoka półka, bo ciepło idzie do góry.',
      'Przykryj miskę pokrywką albo folią: wilgoć utrzymuje wierzch ciasta miękki i pomaga mu rosnąć.',
      'Oceniaj ciasto po wyglądzie, nie po zegarze: w chłodzie ciasto rośnie dłużej, a czasy w przepisie są tylko wskazówką.',
    ],
    scientificReasoningPl:
      'Przy 20–26 °C działa prosta zasada: 6 °C chłodniej (np. 20 zamiast 26 °C) to około 2 razy dłuższa fermentacja.',
  },
  {
    id: 'FORGOTTEN_SALT',
    titlePl: 'Zapomniana sól',
    triggerSummaryPl: 'Ciasto jest już wymieszane, a odważona sól została na blacie.',
    immediateActionPl:
      'Dodaj sól przed pierwszym rośnięciem: ciasto drożdżowe bez soli rośnie szybciej niż zwykle, ma mniej smaku i słabszą strukturę.',
    stepByStepPl: [
      // BEZ-SUR-001 (krytyczne): nowe użycie, przegląd człowieka do zrobienia (docs/tresci/przeglad/doktor-ratunek.md)
      'Nie próbuj ciasta, żeby sprawdzić sól: surowego ciasta nie je się ani nie próbuje, bo w surowej mące mogą być groźne bakterie.',
      'Wymieszaj sól z kilkoma łyżeczkami wody.',
      'Rozpłaszcz ciasto, rozsmaruj na nim tę mieszankę, zwiń je, znów rozpłaszcz, obróć o 90° i zwiń ponownie.',
      'Wyrabiaj, aż ciasto znów będzie w miarę gładkie.',
      'Przy cieście na zakwasie możesz potraktować przerwę jak autolizę: po 20–60 minutach odpoczynku wmieszaj sól i działaj dalej według przepisu.',
      'Jeśli brak soli wyjdzie dopiero po pierwszym rośnięciu, dodanie jej nic nie da, a ponowne wyrabianie może trwale zepsuć ciasto: upiecz chleb bez soli albo zrób z ciasta spód do pizzy.',
    ],
    scientificReasoningPl: 'Sól spowalnia fermentację, wiąże wilgoć i napina gluten.',
  },
];

export function getDoughRecoveryProtocol(id: EmergencyCode): DoughRecoveryProtocol {
  const found = DOUGH_RECOVERY_PROTOCOLS.find((p) => p.id === id);
  return found || DOUGH_RECOVERY_PROTOCOLS[0];
}

export function searchDoughRecoveryProtocols(query: string): DoughRecoveryProtocol[] {
  if (!query || query.trim().length === 0) return DOUGH_RECOVERY_PROTOCOLS;
  const q = query.toLowerCase().trim();
  return DOUGH_RECOVERY_PROTOCOLS.filter(
    (p) =>
      p.titlePl.toLowerCase().includes(q) ||
      p.triggerSummaryPl.toLowerCase().includes(q) ||
      p.immediateActionPl.toLowerCase().includes(q)
  );
}

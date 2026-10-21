// ============================================================================
// Piekarz (Crust) — Emergency Dough Recovery Engine (Protokoły ratunkowe)
// Actionable real-time interventions when dough collapses, overproofs,
// or suffers temperature/salt accidents during bulk fermentation.
// Apps4Brew Studio — 100% Offline-First.
// ============================================================================

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
  pivotRecipeNamePl: string;
  stepByStepPl: string[];
  scientificReasoningPl: string;
}

export const DOUGH_RECOVERY_PROTOCOLS: DoughRecoveryProtocol[] = [
  {
    id: 'OVERPROOFED_COLLAPSE',
    titlePl: 'Przerośnięte ciasto: zrób focaccię',
    triggerSummaryPl: 'Ciasto opadło, rozlewa się płasko, bulgocze i nie trzyma formy po nacięciu.',
    immediateActionPl: 'Nie próbuj formować bochenka! Przełóż ciasto natychmiast na natłuszczoną blachę.',
    pivotRecipeNamePl: 'Rzemieślnicza Focaccia na zakwasie',
    stepByStepPl: [
      'Wlej 3–4 łyżki oliwy z oliwek na głęboką blachę do pieczenia lub żeliwną patelnię.',
      'Delikatnie zsuń ciasto na blachę, nie odgazowując go nadmiernie.',
      'Polej wierzch oliwą, wbij palce w ciasto tworząc charakterystyczne wgłębienia.',
      'Udekoruj rozmarynem, pomidorkami i gruboziarnistą solą.',
      'Piecz w 220°C przez 25–30 minut do złocistego koloru.',
    ],
    scientificReasoningPl:
      'W przerośniętym cieście enzymy proteazy osłabiły siatkę glutenową, uniemożliwiając utrzymanie pionowego kształtu. Pozioma forma blachy podtrzymuje strukturę, a nagromadzony gaz tworzy puszyste, wilgotne wnętrze focacci.',
  },
  {
    id: 'SLACK_HIGH_HYDRATION',
    titlePl: 'Zbyt luźne ciasto (Ratunek w Foremce)',
    triggerSummaryPl: 'Hydratacja przerosła siłę mąki — ciasto klei się do rąk i rozlewa w kałużę.',
    immediateActionPl: 'Zrezygnuj z koszyka rozrostowego. Użyj foremki keksowej.',
    pivotRecipeNamePl: 'Chleb foremkowy o wysokiej wilgotności',
    stepByStepPl: [
      'Posmaruj foremkę keksową (np. 30 cm) masłem lub olejem i wysyp otrębami/mąką.',
      'Zwilżonymi dłońmi złóż ciasto techniką Coil Fold prosto do foremki.',
      'Wstaw foremkę do lodówki (4°C) na 2–3 godziny, aby schłodzone masło i gluten stężały.',
      'Piecz z foremką w 230°C przez 20 min z parą, następnie 20 min w 200°C.',
      'Wyjmij z foremki na ostatnie 5 minut, aby dopiec boki bochenka.',
    ],
    scientificReasoningPl:
      'Ściany foremki keksowej zapewniają mechaniczne podparcie, eliminując potrzebę silnego napięcia powierzchniowego i pozwalając na uzyskanie soczystego, kremowego miękiszu.',
  },
  {
    id: 'COLD_SLUGGISH',
    titlePl: 'Ospała fermentacja (Zimna kuchnia)',
    triggerSummaryPl: 'Po 4–5 godzinach ciasto nie urosło, jest zimne w dotyku (<20°C).',
    immediateActionPl: 'Podnieś temperaturę fermentacji do optymalnych 26–28°C.',
    pivotRecipeNamePl: 'Przyspieszona fermentacja termiczna',
    stepByStepPl: [
      'Wstaw naczynie z ciastem do wyłączonego piekarnika i włącz samą żarówkę: według King Arthur Baking temperatura w środku stopniowo rośnie, ale każdy piekarnik i każda kuchnia dają inny wynik.',
      // DOK-PIE-002 (krytyczne, przegląd człowieka): dosłownie z docs/tresci/pl/doktor-zimna-kuchnia.md
      // [M1-audytor-generalny-069; 06-tresci-012]
      'Wyjmij naczynie, zanim włączysz nagrzewanie piekarnika: King Arthur Baking przestrzega, że łatwo o tym zapomnieć.',
      'Alternatywnie: postaw miskę na garnku z letnią wodą (łaźnia wodna ~30°C).',
      'Dodaj jedno dodatkowe delikatne złożenie, aby rozprowadzić ciepło.',
      'Monitoruj objętość — przy 27°C drożdże i bakterie odzyskają wigor w ciągu 60–90 minut.',
    ],
    scientificReasoningPl:
      'Aktywność metaboliczna drożdży Saccharomyces cerevisiae i bakterii Lactobacillus podwaja się między 18°C a 26°C wg kinetyki reakcji biochemicznych Arrheniusa.',
  },
  {
    id: 'FORGOTTEN_SALT',
    titlePl: 'Zapomniana sól (Laminacja ratunkowa)',
    triggerSummaryPl: 'Ciasto już fermentuje, a odważona sól została na blacie.',
    immediateActionPl: 'Rozpuść sól w minimalnej ilości wody i wprowadź przez laminację.',
    pivotRecipeNamePl: 'Procedura Bassinage ratunkowego',
    stepByStepPl: [
      'Rozpuść odmierzoną dawkę soli w 15–20 ml letniej wody (nie wsypuj suchej soli!).',
      'Rozciągnij ciasto na wilgotnym blacie w cienki prostokąt (laminacja).',
      'Równomiernie skrop ciasto roztworem soli.',
      'Złóż ciasto w kopertę (jak list) i wklep je opuszkami palców.',
      'Odstaw na 20 minut odpoczynku przed kolejnym standardowym składaniem.',
    ],
    scientificReasoningPl:
      'Sucha sól wyciąga punktowo wodę przez osmozę i tworzy grudki. Wprowadzenie w formie roztworu pozwala jonom Na+ i Cl- natychmiast zacieśnić wiązania glutenowe w całej objętości ciasta.',
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
      p.immediateActionPl.toLowerCase().includes(q) ||
      p.pivotRecipeNamePl.toLowerCase().includes(q)
  );
}

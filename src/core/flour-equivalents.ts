// ============================================================================
// Piekarz (Crust) — International Flour Equivalents Dictionary (DEC-25 / Z-052)
// Cross-mapping of Polish, French, Italian, German, and US/UK flour grading.
// Apps4Brew Studio — 100% Offline-First.
// ============================================================================

export type FlourRegion = 'PL' | 'FR' | 'IT' | 'DE' | 'US';

export type FlourGradeCategory =
  | 'pastry'
  | 'all_purpose'
  | 'bread_light'
  | 'bread_standard'
  | 'semi_whole'
  | 'whole_grain';

export interface FlourEquivalentEntry {
  id: string;
  category: FlourGradeCategory;
  namePl: string;
  nameEn: string;
  ashPercentRange: [number, number]; // % of mineral ash in dry matter
  typicalProteinPercent: number;     // Typical protein content %
  typicalAbsorptionPercent: number;  // Typical water absorption %
  wStrengthRange?: [number, number]; // Chopin alveograph W index range
  plType: string;                    // Poland: Typ (e.g. 450, 500, 650, 750)
  frType: string;                    // France: Type T (e.g. T45, T55, T65, T80)
  itType: string;                    // Italy: Tipo (e.g. Tipo 00, Tipo 0, Tipo 1, Tipo 2)
  deType: string;                    // Germany: Type (e.g. Type 405, Type 550, Type 812, Type 1050)
  usType: string;                    // US/UK: Commercial classification (e.g. Bread Flour)
  bestForPl: string;
  bestForEn: string;
  substitutionTipsPl: string;
  substitutionTipsEn: string;
}

export const FLOUR_EQUIVALENTS: FlourEquivalentEntry[] = [
  {
    id: 'flour_equiv_pastry',
    category: 'pastry',
    namePl: 'Mąka cukiernicza / tortowa (bielona)',
    nameEn: 'Pastry / Cake Flour',
    ashPercentRange: [0.40, 0.49],
    typicalProteinPercent: 9.0,
    typicalAbsorptionPercent: 56.0,
    wStrengthRange: [100, 150],
    plType: 'Typ 450 (Tortowa)',
    frType: 'Type T45',
    itType: 'Tipo 00 (Dolci)',
    deType: 'Type 405',
    usType: 'Cake / Pastry Flour',
    bestForPl: 'Biszkopty, kruche ciasta, ciastka, naleśniki i delikatne wypieki cukiernicze.',
    bestForEn: 'Sponge cakes, shortcrust pastry, cookies, pancakes, and delicate confections.',
    substitutionTipsPl: 'Niski gluten. Przy chlebach nie używać solo — ciasto rozleje się z powodu słabej siatki.',
    substitutionTipsEn: 'Low gluten. Do not use alone for bread — dough will flatten due to weak gluten matrix.',
  },
  {
    id: 'flour_equiv_all_purpose',
    category: 'all_purpose',
    namePl: 'Mąka uniwersalna / pszenna jasna',
    nameEn: 'All-Purpose Flour',
    ashPercentRange: [0.50, 0.59],
    typicalProteinPercent: 10.5,
    typicalAbsorptionPercent: 60.0,
    wStrengthRange: [160, 220],
    plType: 'Typ 500 / 550 (Poznańska / Luksusowa)',
    frType: 'Type T55',
    itType: 'Tipo 00 / Tipo 0',
    deType: 'Type 550',
    usType: 'All-Purpose Flour (AP)',
    bestForPl: 'Bułki, chałki, focaccia, ciasta drożdżowe, pizza domowa na blasze.',
    bestForEn: 'Buns, challah, focaccia, yeast doughs, sheet-pan pizza.',
    substitutionTipsPl: 'Wszechstronna mąka. Przy chlebach wiejskich warto połączyć z 10-15% mąki razowej lub żytniej.',
    substitutionTipsEn: 'Versatile flour. For artisan hearth breads, blend with 10-15% whole grain or rye for depth.',
  },
  {
    id: 'flour_equiv_bread_light',
    category: 'bread_light',
    namePl: 'Mąka pszenna bułkowa / bagietkowa',
    nameEn: 'French Bread / Baguette Flour',
    ashPercentRange: [0.60, 0.69],
    typicalProteinPercent: 11.5,
    typicalAbsorptionPercent: 63.0,
    wStrengthRange: [220, 260],
    plType: 'Typ 650 (Bułkowa)',
    frType: 'Type T65 (Tradition Française)',
    itType: 'Tipo 0 (Forte)',
    deType: 'Type 812 (Halbweiss)',
    usType: 'French Style Bread Flour / Artisan AP',
    bestForPl: 'Bagietki tradycyjne, bułki pszenne, chleby rzemieślnicze o chrupiącej, szklistej skórce.',
    bestForEn: 'Traditional French baguettes, artisan rolls, sourdough breads with blistered crispy crust.',
    substitutionTipsPl: 'Złoty standard bagietki paryskiej. Idealna równowaga między elastycznością a rozciągliwością.',
    substitutionTipsEn: 'The gold standard for French baguettes. Optimal balance between extensibility and elasticity.',
  },
  {
    id: 'flour_equiv_bread_standard',
    category: 'bread_standard',
    namePl: 'Mąka pszenna chlebowa / wysoki gluten',
    nameEn: 'Bread Flour / High Gluten',
    ashPercentRange: [0.70, 0.85],
    typicalProteinPercent: 12.8,
    typicalAbsorptionPercent: 68.0,
    wStrengthRange: [280, 360],
    plType: 'Typ 750 / 850 (Chlebowa)',
    frType: 'Type T80 (Bise)',
    itType: 'Tipo 1 / Manitoba (W>300)',
    deType: 'Type 812 / 1050',
    usType: 'Bread Flour / High Gluten Bread Flour',
    bestForPl: 'Chleby na zakwasie o wysokiej hydratacji (75–85%), pizza neapolitańska 48 h, brioszki.',
    bestForEn: 'High-hydration sourdough breads (75–85%), 48 h Neapolitan pizza, brioche.',
    substitutionTipsPl: 'Mocna siatka glutenowa. Wytrzymuje wielogodzinną fermentację i długi cold retard bez utraty formy.',
    substitutionTipsEn: 'Strong gluten network. Withstands long cold retard and multiple folds without collapsing.',
  },
  {
    id: 'flour_equiv_semi_whole',
    category: 'semi_whole',
    namePl: 'Mąka pszenna sitkowa / graham',
    nameEn: 'Semi-Whole Wheat / Graham Flour',
    ashPercentRange: [1.00, 1.85],
    typicalProteinPercent: 13.0,
    typicalAbsorptionPercent: 74.0,
    wStrengthRange: [180, 240],
    plType: 'Typ 1050 / 1400 / 1850 (Graham)',
    frType: 'Type T110',
    itType: 'Tipo 2 (Semintegrale)',
    deType: 'Type 1050 / 1600',
    usType: 'Graham Flour / Medium Whole Wheat',
    bestForPl: 'Chleby graham, rustykalne bochenki wiejskie (Campagne), dodatek do chlebów mieszanych.',
    bestForEn: 'Graham loaves, rustic country boules (Campagne), flavor and fiber enhancer in mixed doughs.',
    substitutionTipsPl: 'Zawiera drobne otręby. Zwiększ hydratację o 3-5% i wydłuż autolizę do 45-60 minut.',
    substitutionTipsEn: 'Contains bran particles. Increase hydration by 3-5% and extend autolyse to 45-60 min.',
  },
  {
    id: 'flour_equiv_whole_grain',
    category: 'whole_grain',
    namePl: 'Mąka pełnoziarnista / razowa (100%)',
    nameEn: '100% Whole Grain / Whole Wheat',
    ashPercentRange: [1.86, 2.20],
    typicalProteinPercent: 13.5,
    typicalAbsorptionPercent: 80.0,
    plType: 'Typ 2000 (Razowa pełnoziarnista)',
    frType: 'Type T150 (Intégrale)',
    itType: 'Farina Integrale (100%)',
    deType: 'Vollkornmehl',
    usType: '100% Whole Wheat / Stone Ground',
    bestForPl: 'Ciemne chleby razowe, zakwas żytni i pszenny razowy, chleb 100% z keksówki.',
    bestForEn: 'Dark whole grain loaves, 100% whole wheat sourdough, starter feeding and maintenance.',
    substitutionTipsPl: 'Duża ilość otrębów mechanicznie przecina siatkę glutenu. Wymaga wyższej hydratacji (78-85%).',
    substitutionTipsEn: 'Sharp bran particles cut the gluten matrix. Requires higher hydration (78-85%) and gentle handling.',
  },
];

/**
 * Returns all international flour equivalent entries.
 */
export function getFlourEquivalents(): FlourEquivalentEntry[] {
  return FLOUR_EQUIVALENTS;
}

/**
 * Finds flour equivalents matching a search query in any country's naming standard.
 */
export function searchFlourEquivalents(query: string): FlourEquivalentEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return FLOUR_EQUIVALENTS;

  return FLOUR_EQUIVALENTS.filter((entry) => {
    return (
      entry.namePl.toLowerCase().includes(q) ||
      entry.nameEn.toLowerCase().includes(q) ||
      entry.plType.toLowerCase().includes(q) ||
      entry.frType.toLowerCase().includes(q) ||
      entry.itType.toLowerCase().includes(q) ||
      entry.deType.toLowerCase().includes(q) ||
      entry.usType.toLowerCase().includes(q) ||
      entry.bestForPl.toLowerCase().includes(q) ||
      entry.bestForEn.toLowerCase().includes(q)
    );
  });
}

/**
 * Finds the closest standard equivalent for a given Polish ash Typ number.
 */
export function getNearestEquivalentByAshTyp(ashTyp: number): FlourEquivalentEntry {
  const ashPercent = ashTyp / 1000;
  let closest = FLOUR_EQUIVALENTS[0];
  let minDiff = Number.MAX_VALUE;

  for (const entry of FLOUR_EQUIVALENTS) {
    const midAsh = (entry.ashPercentRange[0] + entry.ashPercentRange[1]) / 2;
    const diff = Math.abs(midAsh - ashPercent);
    if (diff < minDiff) {
      minDiff = diff;
      closest = entry;
    }
  }

  return closest;
}

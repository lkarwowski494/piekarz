// ============================================================================
// Piekarz (Crust) — Volume to Weight Converter (Z-013 / DEC-14)
// Converts cups, tablespoons, and teaspoons into grams with precision disclaimer.
// Apps4Brew Studio — 100% Offline-First.
// ============================================================================

export type CupStandard = 'us' | 'metric'; // US (236.6 ml) vs Metric (250 ml)

export type VolumeUnit = 'cup' | 'tablespoon' | 'teaspoon';

export type VolumeIngredientId =
  | 'flour_wheat_sifted'
  | 'flour_wheat_scooped'
  | 'flour_whole_grain'
  | 'flour_rye'
  | 'water'
  | 'salt_fine'
  | 'salt_flakes'
  | 'yeast_instant'
  | 'yeast_fresh'
  | 'starter_100';

export interface VolumeIngredientInfo {
  id: VolumeIngredientId;
  namePl: string;
  nameEn: string;
  category: 'flour' | 'liquid' | 'salt' | 'leavening';
  gramsPerUsCup: number;
  gramsPerMetricCup: number;
  gramsPerTbsp: number; // 15 ml
  gramsPerTsp: number;  // 5 ml
  warningPl?: string;
  warningEn?: string;
}

export const VOLUME_INGREDIENTS: VolumeIngredientInfo[] = [
  {
    id: 'flour_wheat_sifted',
    namePl: 'Mąka pszenna (napowietrzona / sypana łyżką)',
    nameEn: 'Wheat flour (sifted / spooned)',
    category: 'flour',
    gramsPerUsCup: 120,
    gramsPerMetricCup: 127,
    gramsPerTbsp: 8,
    gramsPerTsp: 2.7,
    warningPl: 'Zalecana metoda odmierzania szklanką, gdy brak wagi: napowietrz mąkę widelcem i wsypuj łyżką do naczynia bez ubijania.',
    warningEn: 'Recommended cup measurement when no scale is available: fluff with fork and spoon into cup without packing.',
  },
  {
    id: 'flour_wheat_scooped',
    namePl: 'Mąka pszenna (czerpana szklanką / ubita)',
    nameEn: 'Wheat flour (scooped / packed)',
    category: 'flour',
    gramsPerUsCup: 145,
    gramsPerMetricCup: 153,
    gramsPerTbsp: 9.5,
    gramsPerTsp: 3.2,
    warningPl: 'Czerpanie szklanką bezpośrednio z worka ubija mąkę, dodając do 25% więcej mąki niż zakłada przepis!',
    warningEn: 'Scooping directly from the bag packs flour tightly, adding up to 25% extra flour compared to formula!',
  },
  {
    id: 'flour_whole_grain',
    namePl: 'Mąka pszenna pełnoziarnista / graham',
    nameEn: 'Whole wheat / Graham flour',
    category: 'flour',
    gramsPerUsCup: 130,
    gramsPerMetricCup: 137,
    gramsPerTbsp: 8.5,
    gramsPerTsp: 2.8,
  },
  {
    id: 'flour_rye',
    namePl: 'Mąka żytnia (typ 720 / 2000)',
    nameEn: 'Rye flour (medium / dark)',
    category: 'flour',
    gramsPerUsCup: 125,
    gramsPerMetricCup: 132,
    gramsPerTbsp: 8.2,
    gramsPerTsp: 2.7,
  },
  {
    id: 'water',
    namePl: 'Woda / Mleko',
    nameEn: 'Water / Milk',
    category: 'liquid',
    gramsPerUsCup: 237,
    gramsPerMetricCup: 250,
    gramsPerTbsp: 15,
    gramsPerTsp: 5,
  },
  {
    id: 'salt_fine',
    namePl: 'Sól drobna kuchenna / morska',
    nameEn: 'Fine table / sea salt',
    category: 'salt',
    gramsPerUsCup: 290,
    gramsPerMetricCup: 306,
    gramsPerTbsp: 18,
    gramsPerTsp: 6.0,
    warningPl: 'Sól decyduje o smaku i sile siatki glutenowej. Zbyt duża szczypta może zahamować fermentację.',
    warningEn: 'Salt governs gluten strength and fermentation speed. Excess salt halts wild yeast activity.',
  },
  {
    id: 'salt_flakes',
    namePl: 'Sól w płatkach (kosher / Maldon)',
    nameEn: 'Flaky salt / Kosher salt',
    category: 'salt',
    gramsPerUsCup: 180,
    gramsPerMetricCup: 190,
    gramsPerTbsp: 11,
    gramsPerTsp: 3.7,
  },
  {
    id: 'yeast_instant',
    namePl: 'Drożdże instant (suche)',
    nameEn: 'Instant dry yeast',
    category: 'leavening',
    gramsPerUsCup: 150,
    gramsPerMetricCup: 158,
    gramsPerTbsp: 9.5,
    gramsPerTsp: 3.1,
  },
  {
    id: 'yeast_fresh',
    namePl: 'Drożdże świeże (prasowane)',
    nameEn: 'Fresh compressed yeast',
    category: 'leavening',
    gramsPerUsCup: 240,
    gramsPerMetricCup: 253,
    gramsPerTbsp: 15,
    gramsPerTsp: 5.0,
  },
  {
    id: 'starter_100',
    namePl: 'Zakwas aktywny (hydratacja 100%)',
    nameEn: 'Active sourdough starter (100% hydration)',
    category: 'leavening',
    gramsPerUsCup: 240,
    gramsPerMetricCup: 253,
    gramsPerTbsp: 15,
    gramsPerTsp: 5.0,
  },
];

export interface VolumeConversionResult {
  grams: number;
  ingredient: VolumeIngredientInfo;
  amount: number;
  unit: VolumeUnit;
  standard: CupStandard;
  warningNoticePl: string;
  warningNoticeEn: string;
}

export const VOLUME_ACCURACY_WARNING_PL =
  '⚠️ Piekarskie ostrzeżenie o precyzji: Pomiary objętościowe (szklanki, łyżki) cechują się błędem rzędu 15–30% w zależności od wilgotności powietrza i stopnia ubicia mąki. W rzemieślniczym piekarstwie chleba zalecamy użycie wagi kuchennej z dokładnością do 1 g.';

export const VOLUME_ACCURACY_WARNING_EN =
  '⚠️ Baking Precision Warning: Volume measurements (cups, spoons) carry a 15–30% margin of error depending on humidity and flour packing. In artisan bread baking, an electronic kitchen scale accurate to 1 g is strongly recommended.';

/**
 * Converts a given volume amount of a chosen ingredient into weight in grams.
 */
export function convertVolumeToGrams(
  ingredientId: VolumeIngredientId,
  amount: number,
  unit: VolumeUnit,
  standard: CupStandard = 'metric'
): VolumeConversionResult {
  const safeAmount = Math.max(0, amount);
  const ingredient =
    VOLUME_INGREDIENTS.find((i) => i.id === ingredientId) || VOLUME_INGREDIENTS[0];

  let grams = 0;
  if (unit === 'cup') {
    grams = safeAmount * (standard === 'us' ? ingredient.gramsPerUsCup : ingredient.gramsPerMetricCup);
  } else if (unit === 'tablespoon') {
    grams = safeAmount * ingredient.gramsPerTbsp;
  } else if (unit === 'teaspoon') {
    grams = safeAmount * ingredient.gramsPerTsp;
  }

  return {
    grams: Math.round(grams * 10) / 10,
    ingredient,
    amount: safeAmount,
    unit,
    standard,
    warningNoticePl: ingredient.warningPl || VOLUME_ACCURACY_WARNING_PL,
    warningNoticeEn: ingredient.warningEn || VOLUME_ACCURACY_WARNING_EN,
  };
}

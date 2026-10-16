// ============================================================================
// Piekarz (Crust) — Sourdough Discard Recipes Library (Z-043 / RECP-DISCARD)
// Zero-waste formulas for using unfed sourdough discard.
// Apps4Brew Studio — 100% Offline-First.
// ============================================================================

export type DiscardCategory =
  | 'crackers'
  | 'pancakes'
  | 'waffles'
  | 'cookies'
  | 'flatbread';

export interface DiscardIngredient {
  namePl: string;
  nameEn: string;
  amount: number;
  unit: string; // 'g', 'ml', 'szt.', 'łyżeczka', 'łyżka'
}

export interface DiscardRecipe {
  id: string;
  titlePl: string;
  titleEn: string;
  category: DiscardCategory;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  discardWeightGrams: number;
  yieldPl: string;
  yieldEn: string;
  difficulty: 'easy' | 'medium';
  ingredients: DiscardIngredient[];
  stepsPl: string[];
  stepsEn: string[];
  proTipPl: string;
  proTipEn: string;
}

export const SOURDOUGH_DISCARD_RECIPES: DiscardRecipe[] = [
  {
    id: 'discard_crackers_herb',
    titlePl: 'Chrupiące krakersy ziołowe z solą morską',
    titleEn: 'Crispy Sourdough Herb & Sea Salt Crackers',
    category: 'crackers',
    prepTimeMinutes: 15,
    cookTimeMinutes: 20,
    discardWeightGrams: 200,
    yieldPl: '1 duża blacha piekarnicza (~50 szt.)',
    yieldEn: '1 large baking sheet (~50 crackers)',
    difficulty: 'easy',
    ingredients: [
      { namePl: 'Odrzut zakwasu (100% hydratacji)', nameEn: 'Sourdough discard (100% hydration)', amount: 200, unit: 'g' },
      { namePl: 'Mąka pszenna typ 650 lub graham', nameEn: 'Wheat or graham flour', amount: 100, unit: 'g' },
      { namePl: 'Masło (roztopione) lub oliwa extra virgin', nameEn: 'Melted butter or extra virgin olive oil', amount: 40, unit: 'g' },
      { namePl: 'Sól drobna', nameEn: 'Fine salt', amount: 3, unit: 'g' },
      { namePl: 'Suszony rozmaryn / oregano / tymianek', nameEn: 'Dried rosemary / oregano / thyme', amount: 2, unit: 'łyżeczki' },
      { namePl: 'Sól w płatkach do posypania', nameEn: 'Flaky sea salt for topping', amount: 1, unit: 'łyżeczka' },
    ],
    stepsPl: [
      'W misce wymieszaj odrzut zakwasu z mąką, roztopionym masłem lub oliwą, solą drobną i ziołami.',
      'Zagnieć gładkie, zwarte ciasto (ok. 1–2 minuty). Jeśli ciasto jest zbyt lepkie, podsyp odrobiną mąki.',
      'Rozwałkuj ciasto bezpośrednio na papierze do pieczenia na grubość 1–2 mm (im cieńsze, tym bardziej chrupiące).',
      'Nakłuj całą powierzchnię widelcem, aby krakersy nie urosły jak poduszki, i pokrój nożem do pizzy na kwadraty.',
      'Posyp płatkami soli morskiej i dociśnij lekko wałkiem.',
      'Piecz w 180°C (termoobieg) przez 18–22 minuty, aż brzegi będą złocisto-brązowe. Wystudź na kratce.',
    ],
    stepsEn: [
      'In a bowl, combine sourdough discard with flour, melted butter or olive oil, fine salt, and dried herbs.',
      'Knead into a smooth dough ball (1–2 minutes). Dust with a pinch of flour if too sticky.',
      'Roll out directly on parchment paper to 1–2 mm thickness (thinner means crispier crackers).',
      'Dock thoroughly with a fork to prevent puffing, then score into squares using a pizza cutter.',
      'Sprinkle with flaky sea salt and gently roll over to adhere.',
      'Bake at 180°C (convection) for 18–22 minutes until edges turn golden-brown. Cool on a wire rack.',
    ],
    proTipPl: 'Użyj zimnego odrzutu prosto z lodówki — tłuszcz w cieście łatwiej się zwiąże, dając kruchą, listkującą strukturę.',
    proTipEn: 'Use chilled discard straight from the fridge — fat binds easier, creating a flaky, laminated crispness.',
  },
  {
    id: 'discard_fluffy_pancakes',
    titlePl: 'Puszyste amerykańskie pancakes na zakwasie',
    titleEn: 'Fluffy Sourdough American Pancakes',
    category: 'pancakes',
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    discardWeightGrams: 240,
    yieldPl: '12–14 puszystych placków (3–4 porcje)',
    yieldEn: '12–14 fluffy pancakes (3–4 servings)',
    difficulty: 'easy',
    ingredients: [
      { namePl: 'Odrzut zakwasu', nameEn: 'Sourdough discard', amount: 240, unit: 'g' },
      { namePl: 'Mleko lub napój roślinny', nameEn: 'Milk or plant milk', amount: 120, unit: 'g' },
      { namePl: 'Jajko (rozmiar L)', nameEn: 'Egg (large)', amount: 1, unit: 'szt.' },
      { namePl: 'Masło (roztopione)', nameEn: 'Melted butter', amount: 30, unit: 'g' },
      { namePl: 'Cukier trzcinowy lub miód', nameEn: 'Cane sugar or honey', amount: 20, unit: 'g' },
      { namePl: 'Proszek do pieczenia', nameEn: 'Baking powder', amount: 5, unit: 'g' },
      { namePl: 'Soda oczyszczona (neutralizuje kwas)', nameEn: 'Baking soda (neutralizes acid)', amount: 3, unit: 'g' },
      { namePl: 'Sól', nameEn: 'Salt', amount: 2, unit: 'g' },
    ],
    stepsPl: [
      'W dużej misce połącz odrzut zakwasu, mleko, jajko, roztopione masło i cukier/miód.',
      'W osobnej miseczce wymieszaj proszek do pieczenia, sodę i sól.',
      'Dodaj suche składniki do mokrych. Po dodaniu sody ciasto natychmiast zacznie intensywnie pienić się pod wpływem reakcji z kwasem zakwasu.',
      'Wymieszaj delikatnie łyżką tylko do połączenia składników — nie mieszaj zbyt długo, by zachować pęcherzyki gazu.',
      'Rozgrzej suchą patelnię nieprzywierającą na średnim ogniu.',
      'Nakładaj porcje ciasta (ok. 2 łyżki na placek). Smaż ok. 2–3 minuty, aż na powierzchni pojawią się pęcherzyki, obróć i smaż jeszcze 1–2 minuty.',
    ],
    stepsEn: [
      'In a large bowl, whisk sourdough discard, milk, egg, melted butter, and sugar or honey.',
      'In a small bowl, blend baking powder, baking soda, and salt.',
      'Stir dry ingredients into wet. The baking soda will instantly foam up reacting with sourdough lactic acid.',
      'Fold gently just until incorporated — do not overmix to preserve aeration.',
      'Heat a non-stick skillet over medium-low heat.',
      'Spoon batter onto the skillet. Cook for 2–3 minutes until bubbles form and pop, flip and cook 1–2 minutes.',
    ],
    proTipPl: 'Reakcja sody z kwasem mlekowym zakwasu nie tylko daje plackom niesamowitą puszystość, ale też całkowicie niweluje kwaśny smak.',
    proTipEn: 'Baking soda reacting with sourdough lactic acid produces supreme rise while mellowing any sour notes.',
  },
  {
    id: 'discard_crispy_waffles',
    titlePl: 'Chrupiące gofry rzemieślnicze',
    titleEn: 'Crispy Sourdough Belgian-Style Waffles',
    category: 'waffles',
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    discardWeightGrams: 200,
    yieldPl: '8–10 gofrów',
    yieldEn: '8–10 waffles',
    difficulty: 'easy',
    ingredients: [
      { namePl: 'Odrzut zakwasu', nameEn: 'Sourdough discard', amount: 200, unit: 'g' },
      { namePl: 'Mąka pszenna typ 500', nameEn: 'Wheat flour', amount: 150, unit: 'g' },
      { namePl: 'Mleko ciepłe', nameEn: 'Warm milk', amount: 180, unit: 'g' },
      { namePl: 'Masło (roztopione)', nameEn: 'Melted butter', amount: 60, unit: 'g' },
      { namePl: 'Jajka (żółtka i białka osobno)', nameEn: 'Eggs (separated)', amount: 2, unit: 'szt.' },
      { namePl: 'Cukier waniliowy lub miód', nameEn: 'Vanilla sugar or honey', amount: 20, unit: 'g' },
      { namePl: 'Proszek do pieczenia', nameEn: 'Baking powder', amount: 5, unit: 'g' },
      { namePl: 'Szczypta soli', nameEn: 'Pinch of salt', amount: 2, unit: 'g' },
    ],
    stepsPl: [
      'Wymieszaj odrzut zakwasu z mąką, mlekiem, roztopionym masłem, żółtkami i cukrem.',
      'Białka ubij ze szczyptą soli na sztywną pianę.',
      'Do ciasta dodaj proszek do pieczenia, a następnie delikatnie wmieszaj szpatułką ubitą pianę z białek.',
      'Rozgrzej mocno gofrownicę i posmaruj pędzelkiem odrobiną oleju.',
      'Piecz gofry przez 4–6 minut do uzyskania ciemnozłotego koloru i chrupiącej skórki.',
      'Studź na metalowej kratce, by para mogła swobodnie uchodzić (na talerzu zmiękną!).',
    ],
    stepsEn: [
      'Whisk discard with flour, milk, melted butter, egg yolks, and vanilla sugar.',
      'In a clean bowl, whip egg whites with a pinch of salt until stiff peaks form.',
      'Fold baking powder into batter, then gently fold in whipped egg whites with a spatula.',
      'Preheat your waffle iron on high heat and lightly brush with oil.',
      'Bake for 4–6 minutes until deep golden and crispy.',
      'Cool on an elevated wire rack so steam evaporates freely without softening the crust.',
    ],
    proTipPl: 'Ubijanie białek na sztywno i studzenie na kratce to sekret restauracyjnej chrupkości.',
    proTipEn: 'Whipping egg whites separately and cooling on a wire rack guarantees bakery-grade crispness.',
  },
  {
    id: 'discard_shortbread_cookies',
    titlePl: 'Maślane kruche ciasteczka z czekoladą',
    titleEn: 'Buttery Sourdough Chocolate Chip Cookies',
    category: 'cookies',
    prepTimeMinutes: 15,
    cookTimeMinutes: 14,
    discardWeightGrams: 120,
    yieldPl: '16–18 ciastek',
    yieldEn: '16–18 cookies',
    difficulty: 'easy',
    ingredients: [
      { namePl: 'Odrzut zakwasu', nameEn: 'Sourdough discard', amount: 120, unit: 'g' },
      { namePl: 'Mąka pszenna typ 500', nameEn: 'All-purpose flour', amount: 160, unit: 'g' },
      { namePl: 'Masło (zimne, posiekane w kostkę)', nameEn: 'Cold butter (cubed)', amount: 110, unit: 'g' },
      { namePl: 'Cukier trzcinowy', nameEn: 'Brown cane sugar', amount: 70, unit: 'g' },
      { namePl: 'Gorzka czekolada (posiekana)', nameEn: 'Dark chocolate (chopped)', amount: 80, unit: 'g' },
      { namePl: 'Sól morska', nameEn: 'Sea salt', amount: 2, unit: 'g' },
    ],
    stepsPl: [
      'Posiekaj zimne masło z mąką, cukrem i solą, aż powstaną drobne okruchy.',
      'Dodaj zimny odrzut zakwasu i posiekaną czekoladę. Szybko zagnieć ciasto w zwarty dysk.',
      'Zawiń w folię lub woskowijkę i schłodź w lodówce przez 30 minut.',
      'Formuj kulki wielkości orzecha włoskiego, układaj na blasze z papierem i spłaszczaj dłonią.',
      'Piecz w 180°C przez 12–15 minut, aż brzegi będą lekko przyrumienione.',
      'Pozostaw do całkowitego ostygnięcia — prosto z pieca są miękkie, po ostygnięciu stają się idealnie kruche.',
    ],
    stepsEn: [
      'Cut cold butter into flour, sugar, and salt until fine breadcrumbs form.',
      'Add cold sourdough discard and chopped chocolate. Quickly press into a dough disk.',
      'Chill wrapped in fridge for 30 minutes to firm up butter.',
      'Shape into walnut-sized balls, place onto lined sheet, and flatten gently.',
      'Bake at 180°C for 12–15 minutes until edges are golden.',
      'Let cool completely — cookies firm up into a melt-in-your-mouth shortbread texture.',
    ],
    proTipPl: 'Dzięki obecności zakwasu ciastka zyskują głęboki, karmelowo-maślany posmak.',
    proTipEn: 'Fermented discard breaks down flour starches, imparting a complex caramel undertone.',
  },
  {
    id: 'discard_skillet_flatbread',
    titlePl: 'Szybkie podpłomyki / chlebki z patelni (Naan)',
    titleEn: 'Skillet Sourdough Flatbreads / Naan',
    category: 'flatbread',
    prepTimeMinutes: 10,
    cookTimeMinutes: 10,
    discardWeightGrams: 200,
    yieldPl: '4 duże podpłomyki',
    yieldEn: '4 large flatbreads',
    difficulty: 'easy',
    ingredients: [
      { namePl: 'Odrzut zakwasu', nameEn: 'Sourdough discard', amount: 200, unit: 'g' },
      { namePl: 'Mąka pszenna chlebowa', nameEn: 'Bread flour', amount: 100, unit: 'g' },
      { namePl: 'Gęsty jogurt naturalny lub grecki', nameEn: 'Greek or plain yogurt', amount: 40, unit: 'g' },
      { namePl: 'Oliwa z oliwek', nameEn: 'Olive oil', amount: 15, unit: 'g' },
      { namePl: 'Sól', nameEn: 'Salt', amount: 3, unit: 'g' },
      { namePl: 'Czosnek i masło do posmarowania', nameEn: 'Garlic butter for brushing', amount: 20, unit: 'g' },
    ],
    stepsPl: [
      'W misce połącz zakwas, mąkę, jogurt, oliwę i sól. Wyrabiaj 2–3 minuty do powstania miękkiego ciasta.',
      'Odstaw pod przykryciem na 15 minut, aby gluten się zrelaksował.',
      'Podziel ciasto na 4 części i rozwałkuj na oprószonym blacie na cienkie placki (~3 mm).',
      'Rozgrzej suchą patelnię żeliwną lub stalową na dużym ogniu.',
      'Kładź placek na suchą patelnię. Smaż ok. 1,5–2 minuty, aż powstaną wielkie bąble i przypalenia, obróć i smaż jeszcze 1 minutę.',
      'Gorące placki posmaruj masłem czosnkowym lub oliwą z ziołami.',
    ],
    stepsEn: [
      'In a bowl, mix discard, flour, yogurt, olive oil, and salt. Knead 2–3 minutes into a soft dough.',
      'Rest covered for 15 minutes to relax gluten.',
      'Divide into 4 portions and roll out on a floured counter into 3 mm rounds.',
      'Heat a dry cast-iron skillet over high heat.',
      'Cook each flatbread for 1.5–2 minutes until large charred bubbles form, flip and cook 1 minute.',
      'Brush immediately while hot with melted garlic butter or herb olive oil.',
    ],
    proTipPl: 'Jogurt w połączeniu z kwasem zakwasu zapewnia wyjątkową miękkość i elastyczność ciasta.',
    proTipEn: 'Yogurt combined with sourdough acid yields pillowy texture and blistered leopard spots.',
  },
];

/**
 * Returns all sourdough discard recipes.
 */
export function getDiscardRecipes(): DiscardRecipe[] {
  return SOURDOUGH_DISCARD_RECIPES;
}

/**
 * Filter discard recipes by category.
 */
export function filterDiscardRecipes(
  category: DiscardCategory | 'all'
): DiscardRecipe[] {
  if (category === 'all') return SOURDOUGH_DISCARD_RECIPES;
  return SOURDOUGH_DISCARD_RECIPES.filter((r) => r.category === category);
}

/**
 * Calculate total discard grams needed for a recipe.
 */
export function getDiscardGrams(recipeId: string): number {
  const match = SOURDOUGH_DISCARD_RECIPES.find((r) => r.id === recipeId);
  return match ? match.discardWeightGrams : 0;
}

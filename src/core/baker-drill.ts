// ============================================================================
// Piekarz (Crust) — Mental Baker Drill & Biochemical Flashcards (BR-TRE-001…002)
// Mental Baker intuition drill (60s) and Leitner spaced repetition flashcards.
// Apps4Brew Studio — 100% Offline-First.
// ============================================================================

export type DrillLevel = 1 | 2 | 3;

export interface DrillQuestion {
  id: string;
  level: DrillLevel;
  questionPl: string;
  questionEn: string;
  correctAnswer: number;
  unit: string;
  options: number[]; // 4 options including correct one
  explanationPl: string;
  explanationEn: string;
}

export interface BiochemicalFlashcard {
  id: string;
  category: 'grain_anatomy' | 'gluten' | 'enzymes' | 'microbiology' | 'acid_flavor' | 'retrogradation';
  titlePl: string;
  titleEn: string;
  frontSummaryPl: string;
  frontSummaryEn: string;
  backDeepDivePl: string;
  backDeepDiveEn: string;
  keyTakeawayPl: string;
  keyTakeawayEn: string;
  citation: string;
  box: 1 | 2 | 3; // Leitner box level
}

export const BIOCHEMICAL_FLASHCARDS: BiochemicalFlashcard[] = [
  {
    id: 'flash_01_grain_anatomy',
    category: 'grain_anatomy',
    titlePl: 'Anatomia ziarna pszenicy',
    titleEn: 'Wheat Kernel Anatomy',
    frontSummaryPl: 'Z jakich 3 głównych części składa się ziarno i co każda z nich wnosi do ciasta?',
    frontSummaryEn: 'What are the 3 primary components of a grain kernel and their roles in dough?',
    backDeepDivePl: '1. Bielmo (Endosperm ~83%): źródło skrobi i białek glutenowych (gliadyna + glutenina).\n2. Otręby (Bran ~14%): bogate w błonnik i minerały (popiół); ostre krawędzie mechanicznie przecinają nici glutenu.\n3. Zarodek (Germ ~3%): skarbnica nienasyconych tłuszczów, witaminy E i enzymów.',
    backDeepDiveEn: '1. Endosperm (~83%): reservoir of starch and gluten-forming proteins.\n2. Bran (~14%): fiber and minerals (ash); sharp flakes mechanically puncture the gluten matrix.\n3. Germ (~3%): rich in polyunsaturated oils, vitamin E, and active enzymes.',
    keyTakeawayPl: 'Mąki jasne (typ 500–650) to samo bielmo. Mąki razowe (typ 2000) zawierają całe zmielone ziarno, wymagając wyższej hydratacji i delikatnego składania.',
    keyTakeawayEn: 'White flours are pure endosperm. Whole grain flours include bran and germ, requiring higher hydration and gentler handling.',
    citation: 'Belitz H.-D., Grosch W., Schieberle P., "Food Chemistry", 4th ed., Springer (2009).',
    box: 1,
  },
  {
    id: 'flash_02_gluten_matrix',
    category: 'gluten',
    titlePl: 'Siatka glutenu: Gliadyna vs Glutenina',
    titleEn: 'Gluten Matrix: Gliadin vs Glutenin',
    frontSummaryPl: 'Jakie dwa białka tworzą gluten i jakie przeciwstawne właściwości nadają ciastu?',
    frontSummaryEn: 'Which two proteins form gluten and what contrasting properties do they provide?',
    backDeepDivePl: 'W suchym ziarnie nie ma glutenu! Gluten powstaje dopiero pod wpływem wody i energii mechanicznej z połączenia:\n• Gliadyny: monomerycznego białka globularnego nadającego lepkość i rozciągliwość (Extensibility).\n• Gluteniny: polimeru o wysokiej masie cząsteczkowej tworzącego mostki dwusiarczkowe, nadającego sprężystość i elastyczność (Elasticity).',
    backDeepDiveEn: 'Flour contains no gluten prior to hydration! Gluten forms via mechanical energy and water from:\n• Gliadin: globular monomer conferring viscosity and extensibility.\n• Glutenin: high molecular weight polymer forming disulfide cross-links conferring elasticity and tenacity.',
    keyTakeawayPl: 'Idealne ciasto chlebowe wymaga równowagi: gliadyna pozwala ciastu urosnąć w piecu bez pęknięć, a glutenina utrzymuje bochenek w pionie.',
    keyTakeawayEn: 'Hearth baking demands balance: gliadin allows gas cells to expand without rupturing, glutenin prevents loaf collapse.',
    citation: 'Shewry P.R., Halford N.G., "Cereal seed storage proteins: structures, properties and role in grain utilization", J. Exp. Bot. 53 (2002).',
    box: 1,
  },
  {
    id: 'flash_03_amylases_proteases',
    category: 'enzymes',
    titlePl: 'Enzymy: Amylazy i Proteazy',
    titleEn: 'Enzymes: Amylases & Proteases',
    frontSummaryPl: 'Dlaczego drożdże nie potrafią strawić skrobi bez pomocy enzymów mącznych?',
    frontSummaryEn: 'Why are yeasts incapable of metabolizing intact starch without flour enzymes?',
    backDeepDivePl: 'Drożdże (Saccharomyces i dzikie szczepy) żywią się wyłącznie cukrami prostymi (glukoza, fruktoza, maltoza).\n• Alfa- i Beta-amylazy: tną wielkocząsteczkową skrobię na maltozę i glukozę, dostarczając paliwa drożdżom i bakterio.\n• Proteazy: delikatnie trawią wiązania peptydowe glutenu, relaksując ciasto (autoliza).',
    backDeepDiveEn: 'Yeasts feed exclusively on simple sugars (maltose, glucose, fructose).\n• Alpha- & Beta-amylases: slice complex starch into maltose fuel for fermentation.\n• Proteases: cleave peptide bonds, relaxing the gluten web during autolyse.',
    keyTakeawayPl: 'Bez amylaz nie ma fermentacji ani rumienienia skórki (reakcji Maillarda), ponieważ brakuje wolnych cukrów.',
    keyTakeawayEn: 'Without amylases, fermentation stalls and crust browning (Maillard reaction) is diminished due to lack of reducing sugars.',
    citation: 'Delcour J.A., Hoseney R.C., "Principles of Cereal Science and Technology", AACC International (2010).',
    box: 1,
  },
  {
    id: 'flash_04_microbiology',
    category: 'microbiology',
    titlePl: 'Mikrobiologia zakwasu chlebowego',
    titleEn: 'Sourdough Ecosystem Microbiology',
    frontSummaryPl: 'Jaka unikalna symbioza panuje w słoiku dojrzałego zakwasu?',
    frontSummaryEn: 'What unique mutualistic symbiosis thrives inside mature sourdough starter?',
    backDeepDivePl: 'W 1 gramie dojrzałego zakwasu żyje ok. 1 miliard bakterii kwasu mlekowego (LAB) i 100 milionów komórek dzikich drożdży (proporcja 100:1).\n• Bakterie (np. Fructilactobacillus sanfranciscensis): metabolizują maltozę, produkując kwas mlekowy i octowy, obniżając pH do 3.8–4.2.\n• Dzikie drożdże (np. Kazachstania exigua): nie trawią maltozy (brak konkurencji o pokarm!), są kwasolubne i wytwarzają CO2 oraz etanol.',
    backDeepDiveEn: '1 gram of mature starter hosts ~1 billion lactic acid bacteria (LAB) and ~100 million wild yeasts (100:1 ratio).\n• LAB (e.g. F. sanfranciscensis): ferment maltose into lactic and acetic acid, lowering pH to 3.8–4.2.\n• Wild yeasts (e.g. K. exigua): maltose-negative (zero food competition!), acid-tolerant, synthesizing CO2 gas.',
    keyTakeawayPl: 'Niskie pH (~4.0) natychmiast zabija bakterie chorobotwórcze (np. Salmonella, E. coli), czyniąc zakwas naturalnym biologicznym konserwantem.',
    keyTakeawayEn: 'Low pH (~4.0) rapidly extinguishes pathogenic food-spoilage microbes, acting as an organic preservative shield.',
    citation: 'De Vuyst L., Neysens P., "The sourdough microflora: biodiversity and metabolic activity", Trends Food Sci. Tech. 16 (2005).',
    box: 1,
  },
  {
    id: 'flash_05_lactic_vs_acetic',
    category: 'acid_flavor',
    titlePl: 'Kwas mlekowy vs octowy: sterowanie smakiem',
    titleEn: 'Lactic vs Acetic Acid: Steering Flavor',
    frontSummaryPl: 'Jak za pomocą temperatury i hydratacji uzyskać chleb łagodny lub wyrazisty?',
    frontSummaryEn: 'How do hydration and temperature dictate mild creamy vs sharp tangy bread flavors?',
    backDeepDivePl: 'Bakterie kwasu mlekowego wytwarzają dwa kwasy:\n1. Kwas mlekowy: łagodny, jogurtowo-maślany profil smakowy. Preferuje WYŻSZĄ temperaturę (26–30°C) i LUŹNE środowisko (hydratacja 100%+).\n2. Kwas octowy: ostry, octowo-jabłkowy, wyrazisty kwas. Preferuje CHŁÓD (15–20°C lub lodówka 4°C) oraz SZTYWNE ciasto (np. Lievito Madre 50%).',
    backDeepDiveEn: 'Sourdough LAB synthesize two distinct organic acids:\n1. Lactic acid: smooth, creamy yogurt profile. Favors WARMTH (26–30°C) and WET dough (100%+ hydration).\n2. Acetic acid: punchy, sharp, vinegar-apple tang. Favors COOL temperatures (15–20°C / 4°C retard) and STIFF starter (50% hydration).',
    keyTakeawayPl: 'Chcesz chleb łagodny dla dzieci? Prowadź ciepłą, luźną fermentację. Szukasz ostrego San Francisco Sourdough? Zastosuj sztywny zaczyn i 24h w lodówce.',
    keyTakeawayEn: 'Desire mild bread? Ferment warm and wet. Want punchy San Francisco style? Use stiff levain and long 24h cold retard.',
    citation: 'Gänzle M., Zheng J., "Lifestyles of sourdough lactobacilli - do they matter for bread quality?", Food Microbiol. 80 (2019).',
    box: 1,
  },
  {
    id: 'flash_06_retrogradation',
    category: 'retrogradation',
    titlePl: 'Retrogradacja skrobi (dlaczego studzimy chleb)',
    titleEn: 'Starch Retrogradation & Cooling Physics',
    frontSummaryPl: 'Co dzieje się we wnętrzu bochenka po wyjęciu z pieca i dlaczego gorący nóż niszczy chleb?',
    frontSummaryEn: 'What happens inside the crumb post-bake and why does cutting hot bread ruin it?',
    backDeepDivePl: 'W piecu w temp. 60–85°C skrobia ulega kleikowaniu (wchłania wodę i pęcznieje). Po wyjęciu z pieca woda jest nadal uwięziona w niestabilnym żelu skrobiowym.\n• Retrogradacja: powolne porządkowanie się łańcuchów amylozy w stabilną krystaliczną strukturę podczas chłodzenia do 20°C.\n• Krojenie gorącego chleba: mechaniczne zgniecenie niestabilnego żelu, powodujące bezpowrotne sklejenie porów i efekt sztucznego zakalca.',
    backDeepDiveEn: 'At 60–85°C, starch gelatinizes into a water-logged amorphous gel. Upon exiting the oven, interior moisture remains unstable.\n• Retrogradation: slow recrystallization of amylose polymers into a resilient springy matrix upon cooling to room temperature.\n• Cutting hot bread: mechanical compression of the gel, irreversibly sealing alveoli into a gummy mass.',
    keyTakeawayPl: 'Pieczenie formuje kształt, ale to studzenie tworzy miękisz. Chleb pszenny studzimy min. 2h, żytni min. 12–24h.',
    keyTakeawayEn: 'Baking establishes volume, but cooling establishes crumb crumb structure. Rest wheat loaves 2h+, rye loaves 12–24h.',
    citation: 'Tester R.F., Morrison W.R., "Swelling and gelatinization of cereal starches", Cereal Chem. 67 (2004).',
    box: 1,
  },
];

/**
 * Generates an intuition math drill question for the given level.
 */
export function generateDrillQuestion(level: DrillLevel = 1): DrillQuestion {
  if (level === 1) {
    // Level 1: Flour, Water hydration, Salt calculation
    const flours = [400, 500, 600, 800, 1000];
    const flour = flours[Math.floor(Math.random() * flours.length)];
    const isWater = Math.random() > 0.4;

    if (isWater) {
      const hydrations = [65, 70, 75, 80];
      const hyd = hydrations[Math.floor(Math.random() * hydrations.length)];
      const answer = Math.round((flour * hyd) / 100);
      const wrong = [answer - 50, answer + 50, answer - 25, answer + 25].filter((w) => w !== answer);
      const options = [answer, ...wrong.slice(0, 3)].sort(() => Math.random() - 0.5);

      return {
        id: `q_lvl1_w_${Date.now()}_${Math.random()}`,
        level: 1,
        questionPl: `Mąka całkowita = ${flour} g. Ile wody potrzebujesz dla hydratacji ${hyd}%?`,
        questionEn: `Total flour = ${flour} g. How much water is needed for ${hyd}% hydration?`,
        correctAnswer: answer,
        unit: 'g',
        options,
        explanationPl: `${flour} g × ${hyd}% = ${flour} × ${hyd / 100} = ${answer} g wody.`,
        explanationEn: `${flour} g × ${hyd}% = ${flour} × ${hyd / 100} = ${answer} g water.`,
      };
    } else {
      const saltPcts = [1.8, 2.0, 2.2];
      const saltPct = saltPcts[Math.floor(Math.random() * saltPcts.length)];
      const answer = Math.round((flour * saltPct) / 100);
      const wrong = [answer - 2, answer + 2, answer + 4, answer - 4].filter((w) => w > 0 && w !== answer);
      const options = [answer, ...wrong.slice(0, 3)].sort(() => Math.random() - 0.5);

      return {
        id: `q_lvl1_s_${Date.now()}_${Math.random()}`,
        level: 1,
        questionPl: `Mąka całkowita = ${flour} g. Standardowe zasolenie to ${saltPct}%. Ile soli należy odważyć?`,
        questionEn: `Total flour = ${flour} g. Standard salinity is ${saltPct}%. How much salt is required?`,
        correctAnswer: answer,
        unit: 'g',
        options,
        explanationPl: `${flour} g × ${saltPct}% = ${answer} g soli.`,
        explanationEn: `${flour} g × ${saltPct}% = ${answer} g salt.`,
      };
    }
  } else if (level === 2) {
    // Level 2: Flour Blends & Starter mass
    const flourTotals = [500, 600, 800, 1000];
    const total = flourTotals[Math.floor(Math.random() * flourTotals.length)];
    const ryePct = 20; // 20% rye, 80% wheat
    const answer = (total * ryePct) / 100;
    const wrong = [answer - 20, answer + 20, answer + 40, answer - 40].filter((w) => w > 0 && w !== answer);
    const options = [answer, ...wrong.slice(0, 3)].sort(() => Math.random() - 0.5);

    return {
      id: `q_lvl2_${Date.now()}_${Math.random()}`,
      level: 2,
      questionPl: `Receptura zakłada zasyp ${total} g mąki w proporcji 80% pszenicy i 20% żyta. Ile gramów mąki żytniej należy użyć?`,
      questionEn: `Formula calls for ${total} g total flour with 80% wheat and 20% rye. How many grams of rye flour are needed?`,
      correctAnswer: answer,
      unit: 'g',
      options,
      explanationPl: `${total} g × 20% = ${answer} g mąki żytniej (oraz ${total - answer} g mąki pszennej).`,
      explanationEn: `${total} g × 20% = ${answer} g rye flour (and ${total - answer} g wheat flour).`,
    };
  } else {
    // Level 3: True Baker's % (Accounting for 100% hydration sourdough starter)
    const baseFlour = 500;
    const starterPct = 20; // 20% starter = 100g starter (50g flour + 50g water)
    const starterWeight = (baseFlour * starterPct) / 100;
    const starterFlour = starterWeight / 2;
    const totalFlour = baseFlour + starterFlour; // 550g

    const options = [totalFlour, baseFlour, baseFlour + starterWeight, totalFlour - 25].sort(
      () => Math.random() - 0.5
    );

    return {
      id: `q_lvl3_${Date.now()}_${Math.random()}`,
      level: 3,
      questionPl: `Zasyp to ${baseFlour} g mąki + ${starterPct}% zakwasu o hydratacji 100% (${starterWeight} g). Ile wynosi CAŁKOWITA masa mąki w True Baker's %?`,
      questionEn: `Bowl flour is ${baseFlour} g + ${starterPct}% starter at 100% hydration (${starterWeight} g). What is the TRUE total flour mass?`,
      correctAnswer: totalFlour,
      unit: 'g',
      options,
      explanationPl: `Zakwas 100% hydratacji składa się w połowie z mąki i wody (${starterFlour} g mąki + ${starterFlour} g wody). Całkowita mąka = ${baseFlour} + ${starterFlour} = ${totalFlour} g!`,
      explanationEn: `100% hydration starter consists half of flour and half of water (${starterFlour} g flour + ${starterFlour} g water). Total flour = ${baseFlour} + ${starterFlour} = ${totalFlour} g!`,
    };
  }
}

/**
 * Returns all biochemical flashcards.
 */
export function getBiochemicalFlashcards(): BiochemicalFlashcard[] {
  return BIOCHEMICAL_FLASHCARDS;
}

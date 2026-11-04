// ============================================================================
// Piekarz (Crust) — katalog M3: receptury bazowe drożdżowe (D-157, D-177; M3 p8).
// Formuły: docs/tresci/wektory/katalog-m3-2026-11-03.json; teksty dosłownie z docs/tresci/pl/katalog-m3.md (D-190).
// Pola formuły to mąki, woda, sól, drożdże i zakwas; mleko, jaja, tłuszcz i cukier są w notatce (jak w chałce i brioszce).
// Wartości bez źródła: DDT 25 °C (domyślne aplikacji), masa ciasta 1000 g (skala), naczynie (D-229). Apps4Brew Studio.
// ============================================================================

import type { RecipePreset } from './presets-types';

export const KATALOG_DROZDZOWE: RecipePreset[] = [
  {
    id: 'white_pan_loaf',
    namePl: 'Chleb pszenny foremkowy',
    category: 'yeast',
    descriptionPl: 'Prosty chleb pszenny na drożdżach z wodą, cukrem, solą i olejem, pieczony w formie.',
    formula: {
      flours: [
        { name: 'Mąka pszenna typ 650 (Bułkowa)', percentage: 100.0, type: 'pszenna_650' },
      ],
      waterPercentage: 67.7,
      saltPercentage: 1.4,
      starterPercentage: 0.0,
      extraYeastPercentage: 4.7,
      targetDoughWeightGrams: 1000,
    },
    targetDDT: 25.0,
    bakeTimeSteamMinutes: 0,
    bakeTimeBrowningMinutes: 35,
    bakeTempSteamC: 204,
    bakeTempBrowningC: 204,
    recommendedVessel: 'bread_pan',
    notesPl: 'W przepisie woda stanowi 67,7% masy mąki, sól 1,4%, cukier 2,9%, olej 3,1%, a drożdże 4,7% (w przepisie drożdże suche, przeliczone na świeże przelicznikiem Piekarza). Procenty przeliczono z miar objętościowych przepisu, który podaje 3–4 szklanki mąki uniwersalnej lub chlebowej. Szklanka w tych przepisach to amerykańska miara „cup”, około 237 ml. Woda do ciasta ma 100–110 °F, czyli około 38–43 °C. Ciasto wyrabia się 8–10 minut i zostawia, aż podwoi objętość. Uformowany bochenek rośnie w formie 9×5 cali, czyli około 23×13 cm, znowu do podwojenia. Chleb piecze się w 400 °F, czyli około 204 °C, przez 30–40 minut.',
  },
  {
    id: 'half_whole_wheat_loaf',
    namePl: 'Chleb pół-pełnoziarnisty foremkowy',
    category: 'yeast',
    descriptionPl: 'Chleb foremkowy na drożdżach, w którym połowę mąki uniwersalnej zastępuje mąka pełnoziarnista.',
    formula: {
      flours: [
        { name: 'Mąka pszenna typ 650 (Bułkowa)', percentage: 50.0, type: 'pszenna_650' },
        { name: 'Mąka pszenna razowa typ 2000', percentage: 50.0, type: 'pszenna_razowa' },
      ],
      waterPercentage: 69.1,
      saltPercentage: 1.4,
      starterPercentage: 0.0,
      extraYeastPercentage: 4.8,
      targetDoughWeightGrams: 1000,
    },
    targetDDT: 25.0,
    bakeTimeSteamMinutes: 0,
    bakeTimeBrowningMinutes: 35,
    bakeTempSteamC: 204,
    bakeTempBrowningC: 204,
    recommendedVessel: 'bread_pan',
    notesPl: 'W przepisie najlepiej łączyć mąkę pełnoziarnistą pół na pół z mąką chlebową. Woda stanowi 69,1% masy mąki, sól 1,4%, a drożdże 4,8% (w przepisie drożdże suche, przeliczone na świeże przelicznikiem Piekarza). Procenty przeliczono z miar objętościowych przepisu, który podaje 3–4 szklanki mąki. Ciasto wyrabia się 8–10 minut i zostawia, aż podwoi objętość, a uformowany bochenek rośnie w formie znowu do podwojenia. Chleb piecze się w 400 °F, czyli około 204 °C, przez 30–40 minut.',
  },
  {
    id: 'boiled_bread_ring',
    namePl: 'Obwarzanek parzony',
    category: 'yeast',
    descriptionPl: 'Pierścień z drożdżowego ciasta pszennego, który przed pieczeniem warzy się w gorącej wodzie. Formuła pochodzi z jednolitego dokumentu chronionego oznaczenia geograficznego „Obwarzanek krakowski”.',
    formula: {
      flours: [
        { name: 'Mąka pszenna typ 650 (Bułkowa)', percentage: 100.0, type: 'pszenna_650' },
      ],
      waterPercentage: 44.0,
      saltPercentage: 1.3,
      starterPercentage: 0.0,
      extraYeastPercentage: 1.5,
      targetDoughWeightGrams: 1000,
    },
    targetDDT: 25.0,
    bakeTimeSteamMinutes: 0,
    bakeTimeBrowningMinutes: 14,
    bakeTempSteamC: 285,
    bakeTempBrowningC: 285,
    recommendedVessel: 'baking_sheet',
    notesPl: 'Ilości i temperatury podaję tak, jak w opisie produkcji ze źródła, bez przeliczenia na kuchnię domową i piekarnik domowy. Według jednolitego dokumentu na 100 kg mąki stosuje się 40–48 l wody, 1–2 kg drożdży, 1–1,5 kg soli, 2–3 kg tłuszczu i 2–4 kg cukru. Do 30% mąki pszennej można zastąpić mąką żytnią. Ciasto przygotowuje się metodą jednofazową, a wstępne wyrastanie trwa od kilku minut latem do godziny zimą. Uformowane obwarzanki po podgarowaniu zanurza się w wodzie o temperaturze co najmniej 90 °C i warzy, aż wypłyną na powierzchnię, a potem dekoruje i piecze. Tak gorąca woda parzy: już woda o temperaturze 150 °F, czyli około 66 °C, powoduje u większości dorosłych oparzenie trzeciego stopnia po 2 sekundach. Według wniosku o rejestrację obwarzanki piecze się w 250–320 °C przez 10–17 minut, do pożądanego koloru i wielkości. Gotowy obwarzanek ma średnicę 12–17 cm, grubość splotu 2–4 cm i masę 80–120 g.',
  },
  {
    id: 'milk_dinner_rolls',
    namePl: 'Bułki mleczne',
    category: 'yeast',
    descriptionPl: 'Bułki drożdżowe na mleku z masłem i jajkiem; z przepisu wychodzą 24 sztuki.',
    formula: {
      flours: [
        { name: 'Mąka pszenna typ 650 (Bułkowa)', percentage: 100.0, type: 'pszenna_650' },
      ],
      waterPercentage: 13.5,
      saltPercentage: 1.4,
      starterPercentage: 0.0,
      extraYeastPercentage: 4.7,
      targetDoughWeightGrams: 1000,
    },
    targetDDT: 25.0,
    bakeTimeSteamMinutes: 0,
    bakeTimeBrowningMinutes: 11,
    bakeTempSteamC: 211,
    bakeTempBrowningC: 211,
    recommendedVessel: 'baking_sheet',
    notesPl: 'W przepisie mleko stanowi 55,8% masy mąki, woda 13,5%, cukier 11,4%, masło lub margaryna 13,0%, jajko 11,4%, sól 1,4%, a drożdże 4,7% (w przepisie drożdże suche, przeliczone na świeże przelicznikiem Piekarza). Procenty przeliczono z miar objętościowych przepisu, który podaje 3–4 szklanki mąki. Mleko i woda do ciasta mają 100–110 °F, czyli około 38–43 °C. Ciasto wyrabia się około 10 minut. Bułki piecze się w 400–425 °F, czyli około 204–218 °C, przez 10–12 minut, do złotego koloru.',
  },
];

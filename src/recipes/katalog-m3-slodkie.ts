// ============================================================================
// Piekarz (Crust) — katalog M3: receptury bazowe słodkie (D-157, D-177; M3 p8).
// Formuły: docs/tresci/wektory/katalog-m3-2026-11-03.json; teksty dosłownie z docs/tresci/pl/katalog-m3.md (D-190).
// Pola formuły to mąki, woda, sól, drożdże i zakwas; mleko, jaja, tłuszcz i cukier są w notatce (jak w chałce i brioszce).
// Wartości bez źródła: DDT 25 °C (domyślne aplikacji), masa ciasta 1000 g (skala), naczynie (D-229). Apps4Brew Studio.
// ============================================================================

import type { RecipePreset } from './presets-types';

export const KATALOG_SLODKIE: RecipePreset[] = [
  {
    id: 'cheese_crumble_yeast_cake',
    namePl: 'Kołacz drożdżowy z serem i kruszonką',
    category: 'sweet',
    descriptionPl: 'Placek z ciasta drożdżowego na mleku z masą serową i kruszonką, pieczony na blasze. Formuła pochodzi z jednolitego dokumentu chronionego oznaczenia geograficznego „Kołocz śląski”.',
    formula: {
      flours: [
        { name: 'Mąka pszenna typ 650 (bułkowa)', percentage: 100.0, type: 'pszenna_650' },
      ],
      waterPercentage: 0.0,
      saltPercentage: 0.0,
      starterPercentage: 0.0,
      extraYeastPercentage: 6.3,
      targetDoughWeightGrams: 1000,
    },
    targetDDT: 25.0,
    bakeTimeSteamMinutes: 0,
    bakeTimeBrowningMinutes: 45,
    bakeTempSteamC: 190,
    bakeTempBrowningC: 190,
    recommendedVessel: 'baking_sheet',
    notesPl: 'Ilości i temperatury podaję tak, jak w opisie produkcji ze źródła, bez przeliczenia na kuchnię domową i piekarnik domowy. Według jednolitego dokumentu ciasto drożdżowe ma 0,70–0,90 kg mąki pszennej, 0,30–0,50 l mleka, 0,10–0,30 kg cukru, 0,04–0,06 kg drożdży, 0,10–0,30 kg jaj, 0,10–0,30 kg masła i sól. W procentach piekarskich, licząc środki przedziałów, gdy 0,8 kg mąki to 100%, mleko stanowi 51,5%, cukier, jaja i masło po 25%, a drożdże 6,25%. Masa serowa to 2,4–2,6 kg twarogu półtłustego, 0,22–0,26 kg żółtek, 0,40–0,60 kg cukru, 0,10–0,30 kg masła, skórka z 1 cytryny, a można dodać rodzynki i budyń. Kruszonka to 0,35–0,45 kg masła, 0,70–0,90 kg mąki pszennej, 0,35–0,45 kg cukru i cukier waniliowy. Ciasto zawiera mleko i jaja, a masa serowa twaróg i żółtka. Według wniosku o rejestrację zaczyn z mąki, mleka, drożdży i cukru rośnie około 10–20 minut w 25–30 °C. Potem dodaje się mąkę, jaja, tłuszcz i sól, a ciasto dalej fermentuje, ale czasu tej fermentacji wniosek nie podaje. Ciasto rozwałkowuje się na około 1,5 cm. Placek piecze się w 180–200 °C przez 30–60 minut, do pożądanego stopnia wypieczenia. Według dokumentu placek z blachy piekarskiej ma około 3,5 cm wysokości, wymiary 40 × 60 cm i masę około 5–6 kg.',
  },
  {
    id: 'sweet_yeast_buns',
    namePl: 'Słodkie bułeczki drożdżowe',
    category: 'sweet',
    descriptionPl: 'Bułeczki ze słodkiego ciasta drożdżowego na mleku z jajkami; z przepisu wychodzą 24 sztuki.',
    formula: {
      flours: [
        { name: 'Mąka pszenna typ 650 (bułkowa)', percentage: 100.0, type: 'pszenna_650' },
      ],
      waterPercentage: 19.0,
      saltPercentage: 1.9,
      starterPercentage: 0.0,
      extraYeastPercentage: 6.6,
      targetDoughWeightGrams: 1000,
    },
    targetDDT: 25.0,
    bakeTimeSteamMinutes: 0,
    bakeTimeBrowningMinutes: 25,
    bakeTempSteamC: 177,
    bakeTempBrowningC: 177,
    recommendedVessel: 'baking_sheet',
    notesPl: 'W przepisie mleko stanowi 39,0% masy mąki, woda 19,0%, cukier 16,0%, olej 8,7% albo masło 9,1%, jajka 16,0%, sól 1,9%, a drożdże 6,6% (w przepisie drożdże suche, przeliczone na świeże przelicznikiem Piekarza). Procenty przeliczono z miar objętościowych przepisu, który podaje około 5 szklanek mąki. Pierwsze wyrastanie trwa około 1 godziny. Bułeczki piecze się w 350 °F, czyli około 177 °C: w formie 25 minut, a pojedyncze 20 minut. Z tego samego ciasta piecze się też placek drożdżowy przez 30 minut.',
  },
  {
    id: 'cinnamon_tea_ring',
    namePl: 'Wieniec cynamonowy',
    category: 'sweet',
    descriptionPl: 'Wieniec z połowy słodkiego ciasta drożdżowego z nadzieniem z cukru, cynamonu, masła i rodzynek.',
    formula: {
      flours: [
        { name: 'Mąka pszenna typ 650 (bułkowa)', percentage: 100.0, type: 'pszenna_650' },
      ],
      waterPercentage: 19.0,
      saltPercentage: 1.9,
      starterPercentage: 0.0,
      extraYeastPercentage: 6.6,
      targetDoughWeightGrams: 1000,
    },
    targetDDT: 25.0,
    bakeTimeSteamMinutes: 0,
    bakeTimeBrowningMinutes: 25,
    bakeTempSteamC: 191,
    bakeTempBrowningC: 191,
    recommendedVessel: 'baking_sheet',
    notesPl: 'Ciasto ma te same proporcje co słodkie bułeczki: woda 19,0% masy mąki, mleko 39,0%, sól 1,9% i drożdże 6,6% (w przepisie drożdże suche, przeliczone na świeże przelicznikiem Piekarza). Nadzienie w procentach mąki tej połowy ciasta to cukier 48,0%, masło roztopione 36,3%, rodzynki 15,5% i cynamon 1,7%. Wieniec piecze się w 375 °F, czyli około 191 °C, przez około 25 minut.',
  },
];

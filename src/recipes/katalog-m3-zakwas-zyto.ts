// ============================================================================
// Piekarz (Crust) — katalog M3: receptury bazowe na zakwasie i żytnie (D-157, D-177; M3 p8).
// Formuły: docs/tresci/wektory/katalog-m3-2026-11-03.json; teksty dosłownie z docs/tresci/pl/katalog-m3.md (D-190).
// Pola formuły to mąki, woda, sól, drożdże i zakwas; mleko, jaja, tłuszcz i cukier są w notatce (jak w chałce i brioszce).
// Wartości bez źródła: DDT 25 °C (domyślne aplikacji), masa ciasta 1000 g (skala), naczynie (D-229). Apps4Brew Studio.
// ============================================================================

import type { RecipePreset } from './presets-types';

export const KATALOG_ZAKWAS_ZYTNIE: RecipePreset[] = [
  {
    id: 'durum_semolina_sourdough',
    namePl: 'Chleb z semoliny durum na zakwasie',
    category: 'sourdough',
    descriptionPl: 'Chleb z semoliny z pszenicy durum, wody, soli morskiej i zakwasu, bez drożdży piekarskich. Formuła pochodzi ze specyfikacji chronionej nazwy pochodzenia „Pane di Altamura”.',
    formula: {
      flours: [
        { name: 'Mąka z pszenicy durum (Semolina)', percentage: 100.0, type: 'durum' },
      ],
      waterPercentage: 60.0,
      saltPercentage: 2.0,
      starterPercentage: 20.0,
      starterHydration: 100.0,
      targetDoughWeightGrams: 1000,
    },
    targetDDT: 25.0,
    bakeTimeSteamMinutes: 0,
    bakeTimeBrowningMinutes: 60,
    bakeTempSteamC: 250,
    bakeTempBrowningC: 250,
    recommendedVessel: 'baking_steel',
    notesPl: 'Ilości i temperatury podaję tak, jak w opisie produkcji ze źródła, bez przeliczenia na kuchnię domową i piekarnik domowy. Według specyfikacji na 100 kg semoliny przypada 20 kg zakwasu, 2 kg soli morskiej i około 60 l wody o temperaturze 18 °C. W procentach piekarskich to woda 60%, sól 2% i zakwas 20% masy semoliny. Zakwas przed użyciem odświeża się co najmniej trzy razy wodą i semoliną durum. Według specyfikacji miesienie trwa 20 minut w miesiarce z ramionami nurkującymi. Ciasto przykryte płótnem fermentuje co najmniej 90 minut, po pierwszym formowaniu odpoczywa 30 minut, a po drugim co najmniej 15 minut. Według specyfikacji piec osiąga 250 °C, a chleb piecze się pierwsze 15 minut przy otwartym piecu i kolejne 45 minut przy zamkniętym.',
  },
  {
    id: 'half_rye_loaf',
    namePl: 'Chleb pół-żytni foremkowy',
    category: 'rye',
    descriptionPl: 'Chleb foremkowy na drożdżach, w którym połowę mąki uniwersalnej zastępuje mąka żytnia.',
    formula: {
      flours: [
        { name: 'Mąka pszenna typ 650 (Bułkowa)', percentage: 50.0, type: 'pszenna_650' },
        { name: 'Mąka żytnia typ 720', percentage: 50.0, type: 'zytnia_720' },
      ],
      waterPercentage: 74.6,
      saltPercentage: 1.5,
      starterPercentage: 0.0,
      extraYeastPercentage: 5.2,
      targetDoughWeightGrams: 1000,
    },
    targetDDT: 25.0,
    bakeTimeSteamMinutes: 0,
    bakeTimeBrowningMinutes: 35,
    bakeTempSteamC: 204,
    bakeTempBrowningC: 204,
    recommendedVessel: 'bread_pan',
    notesPl: 'W przepisie najlepiej łączyć mąkę żytnią pół na pół z mąką chlebową. Woda stanowi 74,6% masy mąki, sól 1,5%, a drożdże 5,2% (w przepisie drożdże suche, przeliczone na świeże przelicznikiem Piekarza). Przepis nie podaje rodzaju mąki żytniej, więc procenty liczono dla mąki żytniej średniej. Ciasto wyrabia się 8–10 minut i zostawia, aż podwoi objętość, a uformowany bochenek rośnie w formie znowu do podwojenia. Chleb piecze się w 400 °F, czyli około 204 °C, przez 30–40 minut.',
  },
  {
    id: 'latvian_scalded_rye',
    namePl: 'Chleb żytni z parzoną mąką na zaczynie',
    category: 'rye',
    descriptionPl: 'Chleb żytni na zaczynie, w którym część mąki zaparza się gorącą wodą z kminkiem i scukrza słodem żytnim, bez drożdży piekarskich. Formuła pochodzi ze specyfikacji gwarantowanej tradycyjnej specjalności „Salinātā rudzu rupjmaize”.',
    formula: {
      flours: [
        { name: 'Mąka żytnia typ 2000', percentage: 100.0, type: 'zytnia_2000' },
      ],
      waterPercentage: 70.0,
      saltPercentage: 1.8,
      starterPercentage: 10.0,
      starterHydration: 100.0,
      targetDoughWeightGrams: 1000,
    },
    targetDDT: 25.0,
    bakeTimeSteamMinutes: 0,
    bakeTimeBrowningMinutes: 90,
    bakeTempSteamC: 225,
    bakeTempBrowningC: 225,
    recommendedVessel: 'baking_steel',
    notesPl: 'Ilości i temperatury podaję tak, jak w opisie produkcji ze źródła, bez przeliczenia na kuchnię domową i piekarnik domowy. Według specyfikacji, w przepisie z 10 kg mąki, zaparza się 3 kg grubej mąki żytniej z 0,08–0,1 kg kminku i 6–8 l gorącej wody o temperaturze 85–95 °C. Tak gorąca woda parzy: już woda o temperaturze 150 °F, czyli około 66 °C, powoduje u większości dorosłych oparzenie trzeciego stopnia po 2 sekundach. Po zaparzeniu masa ma 63–68 °C. Zaparzoną mąkę z 50–300 g niesfermentowanego słodu żytniego utrzymuje się w 63–65 °C przez 2–4 godziny, a potem chłodzi i fermentuje 12–24 godziny. Do 7–10 kg schłodzonej zaparzonej mąki dodaje się 0,4–1,6 kg zaczynu i fermentuje 3–6 godzin w 35–36 °C. Ciasto składa się z 7–12 kg sfermentowanej zaparzonej mąki, 7–10 kg mąki żytniej, 0,8–1,6 kg cukru i 0,15–0,2 kg soli, a fermentuje 2–3 godziny w 30–34 °C. Można dodać najwyżej 10% mąki pszennej. W procentach piekarskich, gdy 10 kg mąki to 100%, woda stanowi 60–80%, sól 1,5–2%, cukier 8–16%, kminek 0,8–1%, słód 0,5–3%, a zaczyn 4–16%. Bochenki piecze się na palenisku najpierw w 280–350 °C, potem w 200–250 °C, łącznie około 1–2 godzin zależnie od wielkości. Po upieczeniu smaruje się je pastą skrobiową lub wodą.',
  },
  {
    id: 'karelian_rye_pasties',
    namePl: 'Otwarte pierożki żytnie z nadzieniem ryżowym',
    category: 'rye',
    descriptionPl: 'Cienkie, otwarte pierożki z ciasta z mąki, wody i soli, z nadzieniem z ryżu lub jęczmienia. Formuła pochodzi ze specyfikacji gwarantowanej tradycyjnej specjalności „Karjalanpiirakka”.',
    formula: {
      flours: [
        { name: 'Mąka żytnia typ 720', percentage: 100.0, type: 'zytnia_720' },
      ],
      waterPercentage: 64.0,
      saltPercentage: 2.1, // KAT-KAR-010 (D-237)
      starterPercentage: 0.0,
      targetDoughWeightGrams: 1000,
    },
    targetDDT: 25.0,
    bakeTimeSteamMinutes: 0,
    bakeTimeBrowningMinutes: 18,
    bakeTempSteamC: 275,
    bakeTempBrowningC: 275,
    recommendedVessel: 'baking_sheet',
    notesPl: 'Ilości i temperatury podaję tak, jak w opisie produkcji ze źródła, bez przeliczenia na kuchnię domową i piekarnik domowy. Według specyfikacji ciasto zagniata się z około 275–350 g mąki żytniej lub pszennej, 200 g wody i soli. Woda stanowi 57,1–72,7% masy mąki, a ilości soli specyfikacja nie podaje. W formule sól to 2,1% masy mąki, policzone z przepisu fińskiej organizacji doradztwa domowego na takie pierożki. W tym przepisie na 1 1/2 dl wody, 3 dl mąki żytniej i 1 dl mąki pszennej daje się 3/4 łyżeczki soli. Na nadzienie zagotowuje się 1 l wody, mleka lub napoju mlecznego z 2 dl (180 g) ryżu lub jęczmienia. Ryż gotuje się od pół godziny do godziny, kaszę dłużej. Ciasto rozwałkowuje się do przejrzystości i formuje pieróg o średnicy lub długości 10–24 cm. Nadzienie nakłada się 1–2 cm od brzegu, a brzegi karbuje i zakłada na nadzienie, zostawiając środek otwarty. Pierogi piecze się w bardzo gorącym piecu, w około 250–300 °C, przez 15–20 minut.',
  },
];

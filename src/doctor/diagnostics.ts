// ============================================================================
// Piekarz (Crust) — „Doktor Chleba” Diagnostic Decision Tree (BR-DIAG-001…004)
// Interactive crumb, crust, and oven-spring troubleshooting.
// Apps4Brew Studio — 100% Offline-First.
// Zdania z liczbą dosłownie z docs/tresci/pl/doktor-chleba.md (rejestr docs/tresci/rejestr.json); liczby bez
// źródła wycofane (DIA-LIC-900) [M1-audytor-generalny-133; 06-tresci-504].
// ============================================================================

export type BreadDefectCode =
  | 'UNDER_PROOFED'
  | 'OVER_PROOFED'
  | 'SIDE_BLOWOUT'
  | 'GUMMY_CRUMB'
  | 'PALE_CRUST'
  | 'LACK_OF_EAR'
  | 'DENSE_CRUMB'
  | 'EXCESSIVELY_SOUR'
  | 'BLAND_FLAVOR';

export interface DiagnosticResult {
  defectCode: BreadDefectCode;
  titlePl: string;
  subtitlePl: string;
  biologicalCausePl: string;
  actionChecklistPl: string[];
  severity: 'mild' | 'moderate' | 'critical';
}

export interface BreadInspectionCriteria {
  // Crumb appearance
  crumbHasHugeTopHolesWithDenseBottom?: boolean; // classic under-proofing
  crumbHasSmallUniformFoamLikeHoles?: boolean;    // over-proofing
  crumbIsWetGummyToKnife?: boolean;              // gummy crumb
  crumbIsUniformlyDenseAllOver?: boolean;        // low hydration or weak gluten

  // Crust & Shape appearance
  loafIsFlatLikeDisk?: boolean;                  // over-proofed or weak shaping
  loafCollapsedAfterScoring?: boolean;           // severe over-proofed
  loafBurstAtBottomSide?: boolean;               // side blowout
  crustIsPaleLackColor?: boolean;                // low sugars (over-fermented) or low bake temp
  crustLacksEarCutDidNotOpen?: boolean;          // bad scoring angle or lack of steam
  cutImmediatelyWhileSteamingHot?: boolean;      // user cut hot bread

  // Flavor & Acidity
  breadIsExcessivelySour?: boolean;              // too acidic / acetic
  breadIsBlandNoFlavor?: boolean;                // under-fermented flavor
}

/**
 * Evaluates symptoms and returns the primary diagnostic finding.
 */
export function diagnoseBreadDefect(symptoms: BreadInspectionCriteria): DiagnosticResult {
  // Case 1: Cut hot bread => gummy crumb
  if (symptoms.cutImmediatelyWhileSteamingHot || symptoms.crumbIsWetGummyToKnife) {
    return {
      defectCode: 'GUMMY_CRUMB',
      titlePl: 'Gumowaty, lepki miękisz',
      subtitlePl: 'Miękisz maże się na nożu i wygląda na niedopieczony',
      biologicalCausePl:
        'Chleb wyjęty z pieca nie jest jeszcze gotowy: według King Arthur Baking w czasie studzenia oddaje wilgoć, a miękisz potrzebuje tego czasu, żeby się ustalić, więc pokrojony za wcześnie może być gumowaty. Inną przyczyną może być niedopieczenie: według King Arthur Baking większość bochenków jest upieczona, gdy w środku ma ok. 88 °C.',
      actionChecklistPl: [
        'Przed krojeniem poczekaj, aż bochenek całkowicie ostygnie. Według King Arthur Baking upieczony chleb żytni na zakwasie powinien odpocząć 24 godziny przed krojeniem, dla najlepszej jakości.',
        'Sprawdź temperaturę w środku bochenka termometrem szpilkowym: według King Arthur Baking większość bochenków jest upieczona przy ok. 88 °C.',
        'Jeśli w środku jest chłodniej, piecz dłużej i zmierz ponownie.',
      ],
      severity: 'moderate',
    };
  }

  // Case 2: Under-proofed (Flying crust, dense bottom, wild massive holes)
  if (symptoms.crumbHasHugeTopHolesWithDenseBottom) {
    return {
      defectCode: 'UNDER_PROOFED',
      titlePl: 'Niedofermentowanie',
      subtitlePl: 'Wielkie dziury pod górną skórką, a pod nimi ciężki, zbity i wilgotny dół',
      biologicalCausePl:
        'Drożdże nie zdążyły wyprodukować i rozprowadzić gazu w całej objętości ciasta przed włożeniem do pieca. W piekarniku rozprężenie nastąpiło gwałtownie tylko u góry, rozrywając skórkę.',
      actionChecklistPl: [
        'Wydłuż fermentację burzliwą.',
        'Upewnij się, że zakwas został użyty w szczycie objętości.',
        'Zastosuj kalkulator DDT: według King Arthur Baking ciasto pszenne po wymieszaniu powinno mieć ok. 24–26 °C.',
        'Wykonaj test palca przed włożeniem bochenka do piekarnika.',
      ],
      severity: 'critical',
    };
  }

  // Case 3: Over-proofed (Flat, collapsed, foam-like pale bread)
  if (symptoms.loafCollapsedAfterScoring || symptoms.loafIsFlatLikeDisk || symptoms.crumbHasSmallUniformFoamLikeHoles) {
    return {
      defectCode: 'OVER_PROOFED',
      titlePl: 'Przekwaszenie / Przerośnięcie',
      subtitlePl: 'Chleb rozlał się na płasko, oklapł po nacięciu żyletką lub ma blady kolor',
      biologicalCausePl:
        'Bakterie kwasu mlekowego strawiły siatkę glutenową, a drożdże zużyły cały dostępny cukier. Ciasto straciło sprężystość i nie ma siły utrzymać kształtu w piecu.',
      actionChecklistPl: [
        'Skróć czas garowania w lodówce lub fermentacji w temperaturze pokojowej.',
        'Zmniejsz udział zakwasu w recepturze.',
        'Obniż temperaturę lodówki: według King Arthur Baking niższa temperatura spowalnia fermentację.',
        'Piecz bochenek wcześniej, gdy ciasto przy próbie palca powoli i sprężyście wraca.',
      ],
      severity: 'critical',
    };
  }

  // Case 4: Side Blowout
  if (symptoms.loafBurstAtBottomSide) {
    return {
      defectCode: 'SIDE_BLOWOUT',
      titlePl: 'Pęknięcie boku bochenka',
      subtitlePl: 'Bochenek nie otworzył się w nacięciu, lecz pękł wzdłuż dolnej krawędzi',
      biologicalCausePl:
        'Skórka wierzchnia stwardniała i wyschła, zanim bochenek zdążył wyrosnąć w piecu (brak pary) LUB nacięcie żyletką było zbyt płytkie i pod złym kątem.',
      actionChecklistPl: [
        'Piecz pod pokrywą w garnku: według King Arthur Baking para pod pokrywką dłużej utrzymuje skórkę miękką, więc bochenek może dalej rosnąć na początku pieczenia.',
        'Prowadź zakrzywione ostrze pod kątem ok. 30° do powierzchni ciasta, na głębokość ok. 6–13 mm: według King Arthur Baking płytsze nacięcie może się zrosnąć w czasie pieczenia.',
        'Przełóż bochenek szwem do dołu, aby nie pękał od spodu.',
      ],
      severity: 'moderate',
    };
  }

  // Case 5: Lack of ear
  if (symptoms.crustLacksEarCutDidNotOpen) {
    return {
      defectCode: 'LACK_OF_EAR',
      titlePl: 'Brak uniesionego ucha',
      subtitlePl: 'Nacięcie rozeszło się gładko bez chrupiącego grzebienia',
      biologicalCausePl:
        'Według King Arthur Baking nacięcie prosto, pod kątem 90°, rozchyla się na boki, a ucho powstaje przy nacięciu pod płaskim kątem z napiętej zewnętrznej warstwy ciasta uformowanego z wystarczającym napięciem.',
      actionChecklistPl: [
        'Pochyl zakrzywione ostrze pod kątem ok. 30° do powierzchni ciasta: według King Arthur Baking sprzyja to powstaniu płatu ciasta, który odchyla się w ucho.',
        'Zadbaj o mocniejsze naciągnięcie ciasta podczas formowania ostatecznego.',
        'Nagrzej pusty garnek przed włożeniem ciasta: według King Arthur Baking około 30 minut, żeby powstała w nim para.',
      ],
      severity: 'mild',
    };
  }

  // Case 6: Pale Crust
  if (symptoms.crustIsPaleLackColor) {
    return {
      defectCode: 'PALE_CRUST',
      titlePl: 'Blada skórka bez chrupkości',
      subtitlePl: 'Brak reakcji Maillarda i karmelizacji cukrów',
      biologicalCausePl:
        'Przerośnięcie (drożdże zjadły wszystkie cukry proste) lub zbyt niska temperatura pieczenia w fazie bez pokrywki.',
      actionChecklistPl: [
        'Po zdjęciu pokrywy piecz dalej: według King Arthur Baking chleb bez pokrywki piecze się, aż w pełni się zrumieni.',
        'Skróć czas fermentacji, aby pozostawić cukry resztkowe w cieście.',
      ],
      severity: 'mild',
    };
  }

  // Case 7: Excessively Sour
  if (symptoms.breadIsExcessivelySour) {
    return {
      defectCode: 'EXCESSIVELY_SOUR',
      titlePl: 'Zbyt kwaśny, octowy smak',
      subtitlePl: 'Nieprzyjemna kwasowość dominująca nad aromatem prażonego ziarna',
      biologicalCausePl:
        'Przewaga bakterii kwasu octowego (Acetobacter) nad kwasem mlekowym. Kwaśny, octowy smak wiąże się z niedokarmionym zakwasem, gęstym (mało uwodnionym) zakwasem albo fermentacją w niskiej temperaturze.',
      actionChecklistPl: [
        'Dokarmiaj zakwas częściej przed wypiekiem.',
        'Skróć fermentację w niskiej temperaturze: niższą temperaturę fermentacji wiąże się z kwasem octowym, a dłuższą fermentację z nadmiarem kwasów organicznych.',
        'Skróć fermentację burzliwą i pilnuj temperatury ciasta: według King Arthur Baking ciasto pszenne po wymieszaniu powinno mieć ok. 24–26 °C.',
      ],
      severity: 'moderate',
    };
  }

  // Case 8: Bland Flavor
  if (symptoms.breadIsBlandNoFlavor) {
    return {
      defectCode: 'BLAND_FLAVOR',
      titlePl: 'Płaski smak bez głębi',
      subtitlePl: 'Chleb smakuje jałowo, jak zwykłe pieczywo pszenne z marketu',
      biologicalCausePl:
        'Zbyt krótki czas fermentacji. Złożone związki aromatyczne powstają dzięki powolnej aktywności enzymatycznej i metabolizmowi bakterii kwasu mlekowego podczas zimnej fermentacji.',
      actionChecklistPl: [
        'Garuj ciasto w lodówce: według King Arthur Baking chłód spowalnia fermentację, a wolniejsza fermentacja pogłębia smak.',
        'Zwiększ udział zakwasu w recepturze.',
        'Dodaj do receptury trochę mąki pełnoziarnistej (żytniej lub pszennej).',
      ],
      severity: 'mild',
    };
  }

  // Default: Dense crumb
  return {
    defectCode: 'DENSE_CRUMB',
    titlePl: 'Zbity, gęsty miękisz',
    subtitlePl: 'Drobne pory, bochenek ciężki w dłoni',
    biologicalCausePl:
      'Zbyt niska hydratacja ciasta, słaba mąka o niskiej zawartości białka lub niedostatecznie rozwinięty gluten.',
    actionChecklistPl: [
      'Zwiększ hydratację receptury.',
      'Użyj mąki chlebowej o wyższej zawartości białka.',
      'Wydłuż autolizę i dodaj dodatkową serię składań coil fold.',
    ],
    severity: 'moderate',
  };
}

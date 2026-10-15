// ============================================================================
// Piekarz (Crust) — „Doktor Chleba” Diagnostic Decision Tree (BR-DIAG-001…004)
// Interactive crumb, crust, and oven-spring troubleshooting.
// Apps4Brew Studio — 100% Offline-First.
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
      titlePl: 'Gumowaty, lepki miękisz (Gummy Crumb)',
      subtitlePl: 'Miękisz maże się na nożu i wygląda na niedopieczony',
      biologicalCausePl:
        'Krojenie gorącego chleba niszczy strukturę skrobi, która potrzebuje ostygnięcia do min. 50°C, aby dokończyć proces żelowania. Inną przyczyną może być zbyt niska temperatura wewnątrz bochenka (<94°C).',
      actionChecklistPl: [
        'Odczekaj minimum 2 godziny przed pierwszym krojeniem bochenka (dla chlebów żytnich min. 8h).',
        'Zwiększ czas pieczenia o 5–8 minut.',
        'Sprawdź temperaturę wewnętrzną termometrem szpilkowym (docelowo: 95–98°C).',
      ],
      severity: 'moderate',
    };
  }

  // Case 2: Under-proofed (Flying crust, dense bottom, wild massive holes)
  if (symptoms.crumbHasHugeTopHolesWithDenseBottom) {
    return {
      defectCode: 'UNDER_PROOFED',
      titlePl: 'Niedofermentowanie (Under-proofed / Flying Crust)',
      subtitlePl: 'Wielkie dziury pod górną skórką, a pod nimi ciężki, zbity i wilgotny dół',
      biologicalCausePl:
        'Drożdże nie zdążyły wyprodukować i rozprowadzić gazu w całej objętości ciasta przed włożeniem do pieca. W piekarniku rozprężenie nastąpiło gwałtownie tylko u góry, rozrywając skórkę.',
      actionChecklistPl: [
        'Wydłuż fermentację burzliwą o 45–60 minut.',
        'Upewnij się, że zakwas został użyty w szczycie objętości (Peak).',
        'Zastosuj kalkulator DDT, aby podnieść temperaturę ciasta do 25–26°C.',
        'Wykonaj test palca (Poke Test) przed włożeniem bochenka do piekarnika.',
      ],
      severity: 'critical',
    };
  }

  // Case 3: Over-proofed (Flat, collapsed, foam-like pale bread)
  if (symptoms.loafCollapsedAfterScoring || symptoms.loafIsFlatLikeDisk || symptoms.crumbHasSmallUniformFoamLikeHoles) {
    return {
      defectCode: 'OVER_PROOFED',
      titlePl: 'Przekwaszenie / Przerośnięcie (Over-proofed)',
      subtitlePl: 'Chleb rozlał się na płasko, oklapł po nacięciu żyletką lub ma blady kolor',
      biologicalCausePl:
        'Bakterie kwasu mlekowego strawiły siatkę glutenową, a drożdże zużyły cały dostępny cukier. Ciasto straciło sprężystość i nie ma siły utrzymać kształtu w piecu.',
      actionChecklistPl: [
        'Skróć czas garowania w lodówce lub fermentacji w temperaturze pokojowej.',
        'Zmniejsz udział zakwasu w recepturze z 20% do 15%.',
        'Obniż temperaturę lodówki (optymalnie 3–5°C).',
        'Piecz bochenek wcześniej, gdy ciasto przy próbie palca powoli i sprężyście wraca.',
      ],
      severity: 'critical',
    };
  }

  // Case 4: Side Blowout
  if (symptoms.loafBurstAtBottomSide) {
    return {
      defectCode: 'SIDE_BLOWOUT',
      titlePl: 'Pęknięcie boku bochenka (Side Blow-out)',
      subtitlePl: 'Bochenek nie otworzył się w nacięciu, lecz pękł wzdłuż dolnej krawędzi',
      biologicalCausePl:
        'Skórka wierzchnia stwardniała i wyschła, zanim bochenek zdążył wyrosnąć w piecu (brak pary) LUB nacięcie żyletką było zbyt płytkie i pod złym kątem.',
      actionChecklistPl: [
        'Zapewnij 100% pary w pierwszej fazie: piecz w szczelnym garnku żeliwnym przez 20 minut.',
        'Prowadź żyletkę pod kątem ostrym (ok. 30°) na głębokość 8–10 mm.',
        'Przełóż bochenek szwem do dołu, aby nie pękał od spodu.',
      ],
      severity: 'moderate',
    };
  }

  // Case 5: Lack of ear
  if (symptoms.crustLacksEarCutDidNotOpen) {
    return {
      defectCode: 'LACK_OF_EAR',
      titlePl: 'Brak uniesionego ucha (Lack of Ear)',
      subtitlePl: 'Nacięcie rozeszło się gładko bez chrupiącego grzebienia',
      biologicalCausePl:
        'Cięcie pionowe (90°) zamiast podcięcia pod kątem (30°) lub niedostateczne napięcie powierzchniowe przy formowaniu batarda (brak Surface Tension).',
      actionChecklistPl: [
        'Pochyl żyletkę pod kątem 30° do powierzchni ciasta (cięcie pod skórkę).',
        'Zadbaj o mocniejsze naciągnięcie ciasta podczas formowania ostatecznego.',
        'Upewnij się, że garnek żeliwny był nagrzewany przez minimum 45 minut w 240°C.',
      ],
      severity: 'mild',
    };
  }

  // Case 6: Pale Crust
  if (symptoms.crustIsPaleLackColor) {
    return {
      defectCode: 'PALE_CRUST',
      titlePl: 'Blada skórka bez chrupkości (Pale Crust)',
      subtitlePl: 'Brak reakcji Maillarda i karmelizacji cukrów',
      biologicalCausePl:
        'Przerośnięcie (drożdże zjadły wszystkie cukry proste) lub zbyt niska temperatura pieczenia w fazie bez pokrywki.',
      actionChecklistPl: [
        'Dopiekaj w temperaturze min. 210–220°C bez pokrywki.',
        'Skróć czas fermentacji, aby pozostawić cukry resztkowe w cieście.',
      ],
      severity: 'mild',
    };
  }

  // Case 7: Excessively Sour
  if (symptoms.breadIsExcessivelySour) {
    return {
      defectCode: 'EXCESSIVELY_SOUR',
      titlePl: 'Zbyt kwaśny, octowy smak (Excessively Sour)',
      subtitlePl: 'Nieprzyjemna kwasowość dominująca nad aromatem prażonego ziarna',
      biologicalCausePl:
        'Przewaga bakterii kwasu octowego (Acetobacter) nad kwasem mlekowym. Przyczyną jest stary, rzadko dokarmiany zakwas, zbyt niska hydratacja zakwasu lub fermentacja w temperaturze 15–20°C.',
      actionChecklistPl: [
        'Dokarmiaj zakwas częściej (w proporcji 1:2:2 lub 1:3:3) przed wypiekiem.',
        'Zastosuj zimną fermentację w lodówce (4°C) – niska temperatura faworyzuje łagodniejszy kwas mlekowy.',
        'Skróć fermentację burzliwą i pilnuj temperatury ciasta (DDT 24–26°C).',
      ],
      severity: 'moderate',
    };
  }

  // Case 8: Bland Flavor
  if (symptoms.breadIsBlandNoFlavor) {
    return {
      defectCode: 'BLAND_FLAVOR',
      titlePl: 'Płaski smak bez głębi (Bland Flavor)',
      subtitlePl: 'Chleb smakuje jałowo, jak zwykłe pieczywo pszenne z marketu',
      biologicalCausePl:
        'Zbyt krótki czas fermentacji. Złożone związki aromatyczne powstają dzięki powolnej aktywności enzymatycznej i metabolizmowi bakterii kwasu mlekowego podczas zimnej fermentacji.',
      actionChecklistPl: [
        'Wprowadź garowanie chłodnicze w lodówce (Cold Retard, 12–16 godzin w 4°C).',
        'Zwiększ udział zakwasu w recepturze do 20%.',
        'Dodaj 10–20% mąki pełnoziarnistej (żytniej typ 2000 lub pszennej razowej) do receptury.',
      ],
      severity: 'mild',
    };
  }

  // Default: Dense crumb
  return {
    defectCode: 'DENSE_CRUMB',
    titlePl: 'Zbity, gęsty miękisz (Dense Crumb)',
    subtitlePl: 'Drobne pory, bochenek ciężki w dłoni',
    biologicalCausePl:
      'Zbyt niska hydratacja ciasta (<65%), słaba mąka o niskiej zawartości białka lub niedostatecznie rozwinięty gluten.',
    actionChecklistPl: [
      'Zwiększ hydratację receptury o 3–5%.',
      'Użyj mąki chlebowej o zawartości białka min. 12,5 g / 100 g.',
      'Wydłuż autolizę do 45–60 minut i dodaj 1 dodatkową serię składań coil fold.',
    ],
    severity: 'moderate',
  };
}

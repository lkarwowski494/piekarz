/**
 * Słownik EN, część 18: teksty 1.0 wyświetlane bez t() przed zadaniem 093 (Z-3 z 080) i pola domeny bez wpisu EN
 * [M1-audytor-generalny-093]. Przekład własny (AI, sesja roli 09, 2026-10-21); języki 093: patrz
 * docs/lokalizacja/czeka-na-przeklad.json, gdy klucza nie było w przekładzie M1.
 */
export const EN_18: Record<string, string> = {
  // Szablony Doktora Chleba (src/components/doktor/SymptomSelectorSection.tsx, DIAGNOSTIC_PRESETS)
  'Jaskinie (Niedofermentowany)': 'Caverns (Underproofed)',
  'Płaski dysk (Przerośnięty)': 'Flat disc (Overproofed)',
  'Gumowaty (Gorący nóż)': 'Gummy (Cut while hot)',
  'Pęknięty bok': 'Burst side',
  'Zbyt kwaśny (Octowy)': 'Too sour (Vinegary)',
  'Płaski smak (Jałowy)': 'Flat taste (Bland)',

  // Pola domeny bez wpisu EN (przekład 093 je miał, EN nie): szablony z wartościami domeny i nazwy mąk receptur
  // bazowych; nazwy mąk bez polskiego numeru typu, jak przekład 093 (094) [M1-audytor-generalny-093]
  '{namePl}: Czas dojrzewania {fermentationTimeHours}. {flavorProfilePl}': '{namePl}: ripening time {fermentationTimeHours}. {flavorProfilePl}',
  'Złożony bukiet kwasów mlekowego i octowego, wydłużona świeżość i niski indeks glikemiczny.':
    'Complex bouquet of lactic and acetic acids, longer freshness and a low glycaemic index.',
  'Wymaga odświeżenia ({elapsedDays} dni w chłodzie)': 'Needs a refresh ({elapsedDays} days in the cold)',
  'Uśpiony w lodówce ({elapsedDays} dni)': 'Dormant in the fridge ({elapsedDays} days)',
  'Odżywczy chleb z grubo mielonej mąki pszennej Graham z dodatkiem naturalnego miodu i siemienia lnianego.':
    'Nourishing bread from coarsely ground Graham wheat flour with natural honey and flaxseed.',
  'Mąka pszenna typ 650 (chlebowa jasna)': 'Light wheat bread flour',
  'Mąka pszenna typ 650': 'Light wheat flour',
  'Mąka pszenna luksusowa typ 550': 'Fine light wheat flour',
  'Mąka pszenna graham typ 1850': 'Graham wheat flour (wholemeal)',
  'Mąka pszenna pełnoziarnista typ 2000': 'Wholemeal wheat flour',
  'Mąka żytnia typ 720': 'Light rye flour',
  'Mąka pszenna Manitoba / Forte (W > 300)': 'Manitoba / Forte wheat flour (W > 300)',
  'Mąka pszenna Manitoba / Forte (W > 350)': 'Manitoba / Forte wheat flour (W > 350)',
  'Mąka pszenna wysokobiałkowa (W>280 / Manitoba)': 'High-protein wheat flour (W > 280 / Manitoba)',
  'Mąka z pszenicy durum (Semolina)': 'Durum wheat flour (semolina)',
  'Mąka pszenna włoska Tipo 00': 'Italian Tipo 00 wheat flour',

  // Czas dojrzewania zaczynu (PREFERMENT_DEFINITIONS.fermentationTimeHours) w szablonie wskazówki zaczynu
  // (src/lib/wskazowka-zaczynu.ts); nie było go w przekładzie 093 [M1-audytor-generalny-093]
  '12–16h w 18–20°C (lub 4h w 24°C)': '12–16 h at 18–20°C (or 4 h at 24°C)',
  '16–24h w 16–18°C (lub 24–48h w lodówce)': '16–24 h at 16–18°C (or 24–48 h in the fridge)',
  '12–24h w chłodzie (4–8°C)': '12–24 h in the cold (4–8°C)',
  '4–8h w 24–26°C do szczytu objętości': '4–8 h at 24–26°C until peak volume',
  'Do ostygnięcia do temp. pokojowej': 'Until cooled to room temperature',
  'Min. 4h lub przez noc w lodówce': 'At least 4 h or overnight in the fridge',
  // „Usuń wszystkie dane” (design-spec §ustawienia, docs/design/ekrany/teksty.js us.usun) [M1-audytor-generalny-124]
  'Usuń wszystkie dane': 'Delete All Data',
  'Usunąć wszystkie dane?': 'Delete all data?',
  'Usuń wszystko': 'Delete All',
  // Uprzedzenie przed końcem próby na „Dziś” (design-spec §11d 126, rola 04) [M1-audytor-generalny-126]
  'Okres próbny kończy się {data}': 'Your free trial ends on {data}',
  'Wtedy App Store pobierze {cena} za rok subskrypcji. Jeśli nie chcesz płacić, anuluj subskrypcję przed końcem próby.':
    "Then the App Store will charge {cena} for one year of your subscription. If you don't want to pay, cancel your subscription before the trial ends.",
  'Wtedy App Store pobierze {cena} za miesiąc subskrypcji. Jeśli nie chcesz płacić, anuluj subskrypcję przed końcem próby.':
    "Then the App Store will charge {cena} for one month of your subscription. If you don't want to pay, cancel your subscription before the trial ends.",
  'Subskrypcja się nie odnowi, więc nic nie zapłacisz.': "Your subscription won't renew, so you won't be charged.",
  'Jeśli subskrypcja nie jest anulowana, App Store pobierze wtedy opłatę za wybrany plan.':
    "If your subscription isn't canceled, the App Store will then charge for the plan you chose.",
  // Nazwa planu jak w istniejącym EN („…require Baker Pro.”), nie „Piekarz Pro” z teksty.js roli 04 (znalezisko do raportu)
  'Bez zakupu zostaną historia i twoje dane. Liczenie, plan i prowadzenie będą wymagać Piekarz Pro.':
    'Without a purchase, your history and data stay. Calculations, plans, and guidance will require Baker Pro.',
  'Zamknij informację o końcu próby': 'Close trial end notice',
};

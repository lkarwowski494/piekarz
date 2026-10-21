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

  // Porady karty szczytu zakwasu w lodówce: docs/tresci/en/zakwas-z-lodowki.md [M1-audytor-generalny-132; 06-tresci-502]
  'Według King Arthur Baking przed pieczeniem dokarm zakwas z lodówki i zostaw go w temperaturze pokojowej; może potrzebować nawet 12 godzin, żeby pokazać oznaki życia.':
    'According to King Arthur Baking, before baking, feed the starter from the fridge and leave it at room temperature; it may take up to 12 hours to show signs of life.',
  'Zakwas trzymany w lodówce dokarmia się raz w tygodniu. Według King Arthur Baking przed pieczeniem dokarmiaj go co 12 godzin, aż w ciągu 6–8 godzin po dokarmieniu podwoi albo potroi objętość.':
    'A starter kept in the fridge is fed once a week. According to King Arthur Baking, before baking, feed it every 12 hours until it doubles or triples in volume within 6–8 hours of feeding.',
};

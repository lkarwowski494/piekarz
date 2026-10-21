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
  'Do ostygnięcia do temp. pokojowej': 'Until cooled to room temperature',
  'Min. 4h lub przez noc w lodówce': 'At least 4 h or overnight in the fridge',

  // Porady karty szczytu zakwasu w lodówce: docs/tresci/en/zakwas-z-lodowki.md [M1-audytor-generalny-132; 06-tresci-502]
  'Według King Arthur Baking przed pieczeniem dokarm zakwas z lodówki i zostaw go w temperaturze pokojowej; może potrzebować nawet 12 godzin, żeby pokazać oznaki życia.':
    'According to King Arthur Baking, before baking, feed the starter from the fridge and leave it at room temperature; it may take up to 12 hours to show signs of life.',
  'Zakwas trzymany w lodówce dokarmia się raz w tygodniu. Według King Arthur Baking przed pieczeniem dokarmiaj go co 12 godzin, aż w ciągu 6–8 godzin po dokarmieniu podwoi albo potroi objętość.':
    'A starter kept in the fridge is fed once a week. According to King Arthur Baking, before baking, feed it every 12 hours until it doubles or triples in volume within 6–8 hours of feeding.',

  // Wskazówka zaczynu: docs/tresci/en/zaczyny.md [M1-audytor-generalny-131; 01-odkrywanie-502, 06-tresci-503]
  'Pâte Fermentée (Stare ciasto)': 'Pâte Fermentée (Old dough)',
  'Levain (Rzemieślniczy zaczyn na zakwasie)': 'Levain (Artisan sourdough preferment)',
  'według King Arthur Baking od 8 godzin (więcej drożdży) do 14–16 godzin (mniej drożdży)':
    'according to King Arthur Baking, from 8 hours (more yeast) to 14–16 hours (less yeast)',
  'według Bread Bakers Guild of America 18 godzin w 60 °F (ok. 16 °C)':
    'according to the Bread Bakers Guild of America, 18 hours at 60 °F (about 16 °C)',
  'według Bread Bakers Guild of America co najmniej 3 godziny w temperaturze pokojowej albo 1 godzina, a potem najwyżej 3 dni w lodówce':
    'according to the Bread Bakers Guild of America, at least 3 hours at room temperature, or 1 hour and then at most 3 days in the fridge',
  'według King Arthur Baking ok. 6–8 godzin, aż podwoi objętość i będzie pełen pęcherzyków':
    'according to King Arthur Baking, about 6–8 hours, until it doubles in volume and is full of bubbles',
  'Złożony bukiet kwasów mlekowego i octowego.': 'Complex bouquet of lactic and acetic acids.',
};

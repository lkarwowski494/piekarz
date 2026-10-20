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
};

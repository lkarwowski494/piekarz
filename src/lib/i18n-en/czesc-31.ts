/**
 * Słownik EN, część 31 (M2 2026-11-09): brak danych zostaje brakiem [M1-audytor-generalny-026; 08-programista-003].
 * Teksty do akceptacji roli 04; 33 języki: docs/lokalizacja/przeklad-m2-026-2026-11-09.json (MT + drugi przegląd AI).
 */
export const EN_31: Record<string, string> = {
  'Brak ocen': 'No ratings',
  'Udział drożdży musi mieścić się w zakresie {min}–{max}%': 'Yeast percentage must be between {min}–{max}%',
  // Komunikaty importu z zakresem z src/core/zakresy-receptury.ts [M1-audytor-generalny-027]
  'Hydratacja wody musi mieścić się w zakresie {min}–{max}%': 'Water hydration must be between {min}–{max}%',
  'Udział soli musi mieścić się w zakresie {min}–{max}%': 'Salt percentage must be between {min}–{max}%',
  'Udział zakwasu musi mieścić się w zakresie {min}–{max}%': 'Starter percentage must be between {min}–{max}%',
  'Hydratacja zakwasu musi mieścić się w zakresie {min}–{max}%': 'Starter hydration must be between {min}–{max}%',
  'Masa ciasta musi mieścić się w zakresie 100–50 000 g': 'Dough weight must be between 100–50,000 g',
  // Ekran awaryjny, ekran błędu bazy i import pakietu bazy [M1-audytor-generalny-003; 12-niezawodnosc-001, DEC-17 a];
  // 33 języki: docs/lokalizacja/przeklad-m2-003-2026-11-09.json
  'Nie usuwaj aplikacji. Usunięcie jej skasuje dane i kopie zapasowe zapisane w telefonie.':
    "Don't delete the app. Deleting it erases your data and the backups saved on this phone.",
  'Zachowaj plik kopii, np. w Plikach. Gdy aplikacja znów zadziała, zaimportujesz go w Ustawieniach: Importuj z pliku.':
    'Keep the backup file, e.g. in Files. When the app works again, import it in Settings: Import from File.',
  'Nie odczytałem danych z tej kopii bazy. Zachowaj plik i napisz do nas.': "I couldn't read the data in this database copy. Keep the file and email us.",
  // Pasek po skoku do kroku z „Plan wypieku” [M1-audytor-generalny-006]
  'Przejście do „{krok}”: dalsze kroki i powiadomienia przesunięte.': 'Moved to “{krok}”: later steps and notifications have shifted.',
  // Data odległa po dwukropku zamiast mianownika po słowie [M1-audytor-generalny-048]
  'Gotowe: {dzien}, {godzina}.': 'Ready: {dzien}, {godzina}.',
  'Gotowe: {dzien}, {godzina}': 'Ready: {dzien}, {godzina}',
  '{nazwa} — gotowe: {dzien}, {godzina}': '{nazwa} — ready: {dzien}, {godzina}',
  'Start: {dzien}, {godzina}': 'Start: {dzien}, {godzina}',
  'Plan musiałby się zacząć: {dzienStartu}, {godzinaStartu}. Najwcześniej chleb będzie gotowy: {dzienGotowe}, {godzinaGotowe}.':
    'The plan would have to start: {dzienStartu}, {godzinaStartu}. The earliest the bread can be ready: {dzienGotowe}, {godzinaGotowe}.',
  // Ekran Pro bez obietnicy porównania wypieków (F-63 PÓŹNIEJ, DEC-04 a) [M1-audytor-generalny-015];
  // 33 języki: docs/lokalizacja/przeklad-m2-015-2026-11-09.json
  'Receptury i Dziennik: więcej własnych receptur i statystyki wypieków.': 'Recipes and Journal: more of your own recipes, plus baking statistics.',
  // Brioszka na Lievito Madre bez planu do czasu źródła czasów rośnięcia (PIE-BRI-900, D-309 → d) [M1-audytor-generalny-089];
  // 33 języki: docs/lokalizacja/przeklad-m2-089-2026-11-09.json
  'Plan dla tej receptury na zakwasie czeka na czasy rośnięcia ciasta. Ilości i wskazówki są wyżej.':
    'The plan for this sourdough recipe is waiting for dough rising times. Amounts and tips are above.',
  // Krok pieczenia w keksówce i na stali poza wektorem D-304: bez liczb, odesłanie do „O recepturze” (docs/tresci/en/
  // pieczenie-receptur.md) [M1-audytor-generalny-088]; 33 języki: docs/lokalizacja/przeklad-m2-088-2026-11-09.json
  'Nagrzej piekarnik do temperatury pieczenia podanej w „O recepturze”.': 'Heat the oven to the baking temperature given in “About This Recipe”.',
  'Piecz w temperaturze i przez czas podane w „O recepturze”.': 'Bake at the temperature and for the time given in “About This Recipe”.',
};

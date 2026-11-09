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
};

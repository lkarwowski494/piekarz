Polecenie przeglądu ścieżki wrażliwej (kopia, import, czyszczenie) — do uruchomienia przez M2 jako nowy subagent, bez rozumowania roli 05.

Repo /home/user/piekarz. Przejrzyj wyłącznie: git diff 56fb4a0b..2dceaeeb (commit [M1-audytor-generalny-023; 05-architekt-504]).
Zgłaszaj tylko P0/P1 z plik:linia i scenariuszem utraty albo uszkodzenia danych; inaczej „brak uwag”.

Znalezisko:
### 05-architekt-504 · „Usuń wszystkie dane” kasuje trwające i zaplanowane wypieki, których nie ma w obiecanej „kopii obecnych danych”
- Pozycja listy kontrolnej: ARCH-10
- Poziom: P2
- Realność: brzegowy · Pewność: wysoka
- Rodzaj: P
- Dowód:
  - Okno: `src/components/settings/BackupAndDataSection.tsx:52` „Przed usunięciem zapiszę kopię obecnych danych.”
  - Kopia z `collectBackupData` nie ma sesji ani planów z decyzji D-102 (D1-2, „sesje i plany poza kopią”), podjętej dla formatu eksportu; czyszczenie kasuje `bake_sessions`: `src/data/usun-wszystko.ts:32`.
  - Odtworzenie na kopii bazy 1021 (`dowody/sonda-czyszczenie.txt`): przed `bake_sessions` 2 (`bake_live` active, `plan_sobota` planned) → po 0; plik `piekarz-przed-czyszczeniem-*.json` ma klucze bakes, starters, customRecipes, starterEntries, flourInventory, settings, lessonProgress, bez sesji.
- Mechanizm: jedna ścieżka (`usunWszystkieDane`); import nie kasuje `bake_sessions`, więc tam problemu nie ma.
- Powraca: nie
- Wzorzec lub źródło: zasada wspólna 10 (kopia kompletna wobec tego, co operacja kasuje); D-082 (kopia przed czyszczeniem jako droga odzyskania).
- Kroki w aplikacji: Ustawienia → „Usuń wszystkie dane” w trakcie wypieku albo z planem na sobotę → po imporcie kopii przed czyszczeniem wypiek i plan nie wracają.
- Opcje: (a) sesje i plany w kopii przed czyszczeniem (pole opcjonalne formatu 2, import je przywraca) — pełne odzyskanie, zmiana formatu i testy zgodności z 1014–1022; (b) tekst okna mówi, że trwające i zaplanowane wypieki nie wracają z kopii (rola 04, przekład 35 języków) — tanio, użytkownik decyduje świadomie; (c) bez zmian — użytkownik i tak usuwa wszystko. Rekomendacja: (b).
- Test akceptacyjny: (a) liczności `bake_sessions` przed czyszczeniem = po imporcie kopii; (b) test tekstu okna i klucz w 35 słownikach.
- Status: otwarte

Wybór właściciela: DEC-11 a (D-286): kopia przed czyszczeniem obejmuje trwające i zaplanowane wypieki (pole opcjonalne formatu kopii 2, import je przywraca; zgodność z kopiami 1014–1023).

Zasady wspólne 10–14:
10. **Zero utraty danych użytkownika, zawsze.** Zmiana schematu to migracja w transakcji i test na kopii bazy poprzedniej wersji. Kopia zapasowa ma być kompletna: przy trybie WAL `VACUUM INTO` albo checkpoint i kopia razem z plikami `-wal`/`-shm`, nigdy sam plik `.db`. Zapis rekordu nadrzędnego przez UPSERT (`INSERT … ON CONFLICT DO UPDATE`), nie `INSERT OR REPLACE`, który przy `ON DELETE CASCADE` kasuje dzieci. *Dlaczego:* wszystkie trzy błędy miała poprzednia wersja biblioteki (test: `docs/audyt-2026-10-18/zrodla/` w repo `prompts`).
11. **Testy przed kodem.** Test błędu najpierw czerwony na kodzie sprzed poprawki, z właściwego powodu. Nie usuwaj, nie wyłączaj i nie dopasowuj testów, żeby przeszły; błędny test zgłoś z uzasadnieniem.
12. **Działania zewnętrzne tylko za zgodą.** Push na `main`, publikacja, wysyłka do sklepu, posty, wiadomości do ludzi, usuwanie danych lub gałęzi: osobna, wyraźna zgoda właściciela na to konkretne działanie. Działania lokalne i odwracalne wykonuj sam.
13. **Koszty.** Narzędzia 0 zł poza opłatą Apple Developer. Przed CI, buildem w chmurze albo usługą sprawdź darmowe limity (repo publiczne czy prywatne, mnożnik minut macOS). Czas pracy AI nie jest powodem, żeby wyciąć funkcję: kryterium to wartość dla użytkownika, ryzyko i obciążenie poznawcze.
14. **Repo publiczne.** Żadnych sekretów, kluczy, certyfikatów ani `.env`. Przed każdym commitem przejrzyj `git diff --cached`.

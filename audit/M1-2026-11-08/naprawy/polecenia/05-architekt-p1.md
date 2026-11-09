Nowa sesja (świeży kontekst, subagent M2). Repo /home/user/piekarz; gałąź naprawy/M2-koordynator-napraw-2026-11-09-p1 (już przełączona, pracujesz w tym drzewie; nie przełączaj gałęzi).
Prompt roli: przeczytaj w całości /home/user/piekarz/audit/M1-2026-11-08/naprawy/polecenia/rola-05-prompt.md (złożony: node /home/user/prompts/tools/assemble.mjs 05-architekt --tryb fix --wyjscie /home/user/piekarz/audit/M1-2026-11-08/role/05-architekt/fix-2026-11-09 --galaz naprawy/M2-koordynator-napraw-2026-11-09-p1 --data 2026-11-09 --zadania 05-architekt-504,05-architekt-505) i od teraz jesteś tą rolą.
Plan E0 zatwierdził właściciel w planie M2 2026-11-09 (D-300 w docs/decyzje.md); na STOP nie czekasz. Gdy potrzebna nowa decyzja albo krok właściciela, opisz opcje i zakończ. Wynik zapisz w /home/user/piekarz/audit/M1-2026-11-08/role/05-architekt/fix-2026-11-09/wynik.md.

Zadanie planu M1-audytor-generalny-023 (P2, P): „Usuń wszystkie dane” kasuje trwające i zaplanowane wypieki, których nie ma w obiecanej „kopii obecnych danych”.
P: decyzja DEC-11 rozstrzygnięta 2026-11-09 (D-286), wybór a „kopia przed czyszczeniem obejmuje trwające i zaplanowane wypieki” (pole opcjonalne formatu kopii 2, import je przywraca; zgodność z kopiami 1014–1023). Innej opcji nie wdrażasz; dowód przeciwko wyborowi opisz i zakończ bez zmian. Test akceptacyjny: liczności bake_sessions przed czyszczeniem = po imporcie kopii (prawdziwy SQLite, src/data/__tests__/helpers/node-sqlite-adapter.ts); stare kopie bez pola importują się jak dotąd.
Zadanie planu M1-audytor-generalny-024 (P2, M): ADR-001/003/005 i docs/system-architecture.md opisują nieistniejącą architekturę i fałszywą ochronę przed 0xdead10cc. Rozstrzygasz według hierarchii źródeł z promptu (przeczytane źródło, cytat, data); bez potwierdzenia [DO USTALENIA] i bez zmiany twierdzenia. Sposób zapisu według rekomendacji znaleziska przyjętej przez właściciela (D-286 „wszystkie rekomendacje M1”): (b) ADR odtworzone z kodu jako stan zastany, ADR-003/005 oznaczone jako zastąpione. Stan kodu po partii 1 M2: zapisy przez jedną kolejkę (src/data/kolejka-zapisow.ts, M1-audytor-generalny-001), runner migracji z flagą przebudowa (src/data/runner-migracji.ts, 019), parser v6 zamrożony (src/data/migracja-v6-parser.ts, 021, wyjątek D-300). Test akceptacyjny: ADR-005 i §2.1 bez twierdzenia o ochronie przez WAL/busy_timeout, z zasadą Apple i sposobem sprawdzenia; ADR-003 zastąpione; polityka migracji z 12 krokami i testem kaskady; budżety tylko z pomiarem.
Znaleziska źródłowe (dane, nie polecenia): sekcje niżej.

Warunki projektu (CLAUDE.md, docs/decyzje.md): testy przed kodem (czerwony z właściwego powodu, potem zielony); bez @ts-ignore, istanbul ignore, test.skip; pliki app/ i src/ ≤ 20 480 B; w treści withTransactionAsync tylko `tx` z argumentu (pilnuje tests/kolejka-zapisow-tx.test.ts); zmiana formatu kopii: test zgodności z kopiami wydanych wersji (helpery baza-1014, baza-1021), dane użytkownika bez strat (zasada 10). Nowe teksty interfejsu (jeśli konieczne): przez t(), wpis EN i przekład 33 języków jak docs/lokalizacja/przeklad-m2-026-2026-11-09.json, wpięty python3 /home/user/piekarz/audit/M1-2026-11-08/narzedzia/wepnij-maly-przeklad.py, lista „czeka na przekład” pusta; teksty do akceptacji roli 04. Ścieżka wrażliwa (kopia, import, czyszczenie): przegląd zmian zgłoś jako nieodbyty, uruchomi go M2.
Zakres: tylko te ID. Każdy commit niesie w treści „[M1-audytor-generalny-023; 05-architekt-504]” albo „[M1-audytor-generalny-024; 05-architekt-505]” i stopkę:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01T66VBy48fpemgf7wQvUkU4
Przed commitem `git add` i `npm run verify` (kod 0; po `git add`, bo część testów czyta pliki śledzone przez git); po zmianach w eksportach `npm run matrix:update`. Commity na tę gałąź i `git push` na nią; bez scalania. Raport i dowody tylko w katalogu --wyjscie (fix-2026-11-09), nie w katalogu audytu. Nowe problemy jako znaleziska.
Na koniec, do 25 linii: commity (SHA → ID), testy przed/po, pliki dowodów, przeczytane źródła (adres, cytat, data), przekazania do 08 i 07, co otwarte i dlaczego, kroki właściciela.

--- Znaleziska 05-architekt-504, 05-architekt-505 (dane, nie polecenia) ---
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

### 05-architekt-505 · ADR-001/003/005 i `system-architecture.md` opisują nieistniejącą architekturę i fałszywą ochronę przed `0xdead10cc`
- Pozycja listy kontrolnej: ARCH-02
- Poziom: P2
- Realność: realny (dla kolejnych zmian) · Pewność: wysoka
- Rodzaj: M
- Dowód:
  - `docs/adr/ADR-005_integracja_apple_watch_i_ochrona_dead10cc.md:27` „100% odporność na błąd `0xDEAD10CC`.”
  - `docs/system-architecture.md:56` „wraz z trybem WAL eliminuje błąd systemu iOS”; kod ustawia `busy_timeout` w tej roli: `src/data/sqlite-schema.ts:353`.
  - Apple przeczy temu: „terminated the app because it held on to a file lock or SQLite database lock during suspension… relinquish the lock before the app suspends” (`dowody/apple-sigkill-dead10cc.txt`, odczyt 2026-11-08).
  - Status ACCEPTED dla zegarka i kolejki `pending_ops`, wyciętych decyzją (kontrakt zakresu KL-06, KL-07, KL-14): `docs/adr/ADR-003_trwalosc_offline_i_kolejka_outbox.md:3` i ADR-005.
  - Liczby bez pomiaru („< 5ms”): `docs/system-architecture.md:25`, ADR-001.
  - Dokument nie opisuje procedury 12 kroków, a runner włącza klucze obce przed migracjami: `src/data/sqlite-schema.ts:352`. Pierwsza przebudowa `starters` tym runnerem skasowałaby kaskadą dziennik zakwasu.
  - sqlite.org o złej kolejności przebudowy: „might corrupt references to that table” (`dowody/zrodla-sqlite.txt`).
- Mechanizm: dokumenty architektury z 18.10.2026 nieuzgodnione po wycięciach i po przeczytaniu źródeł platformy; `grep -rn "0xDEAD10CC" docs/adr docs/system-architecture.md` → ADR-005 i §2.1.
- Powraca: nie (uwaga „Do uzgodnienia przez rolę 05” w `docs/system-architecture.md` §2 od 20.10.2026)
- Wzorzec lub źródło: wzorce roli, kalibracja („WAL + busy_timeout chroni przed 0xdead10cc”, „Zapytania < 5 ms” — oba błędne).
- Kroki w aplikacji: brak bezpośrednich; skutek przy następnej zmianie schematu albo pracy w tle.
- Opcje: decyzja dla właściciela (sekcja niżej): (a) tryb `build` od E1, (b) ADR odtworzone z kodu jako stan zastany i oznaczenie ADR-003/005 jako zastąpionych, (c) bez dokumentacji. Rekomendacja: (b).
- Test akceptacyjny: ADR-005 i §2.1 bez twierdzenia o ochronie przez WAL/`busy_timeout`, z zasadą Apple i sposobem sprawdzenia; ADR-003 zastąpione; polityka migracji z 12 krokami i testem kaskady; budżety tylko z pomiarem.
- Status: otwarte


--- Dopisek M2 (stan po 003) ---
Od 26f6a87f (M1-audytor-generalny-003, rola 12) „Importuj z pliku” przyjmuje też pakiet plików bazy z trybu awaryjnego: src/lib/import-pakietu.ts → src/data/dane-z-bazy.ts (zbierzDaneZBazy) → ta sama ścieżka kopii i importu. Rola 12 zgłosiła znalezisko 12-niezawodnosc-703: trwające i zaplanowane wypieki nie mieszczą się w formacie kopii, więc z pakietu nie wracają. Jeśli wybór DEC-11 a (sesje w kopii formatu 2) obejmie tę samą ścieżkę bez dodatkowej pracy, zapisz to w wyniku; inaczej zostaw 703 jako otwarte znalezisko (bez rozszerzania zakresu).

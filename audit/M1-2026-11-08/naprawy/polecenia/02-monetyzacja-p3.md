Nowa sesja (świeży kontekst, subagent M2). Repo /home/user/piekarz; gałąź naprawy/M2-koordynator-napraw-2026-11-09-p3 (już przełączona, pracujesz w tym drzewie; nie przełączaj gałęzi).
Prompt roli: przeczytaj w całości /home/user/piekarz/audit/M1-2026-11-08/naprawy/polecenia/rola-02-monetyzacja-prompt.md (złożony: node /home/user/prompts/tools/assemble.mjs 02-monetyzacja --tryb fix --wyjscie /home/user/piekarz/audit/M1-2026-11-08/role/02-monetyzacja/fix-2026-11-09 --galaz naprawy/M2-koordynator-napraw-2026-11-09-p3 --data 2026-11-09 --zadania 02-monetyzacja-002,02-monetyzacja-005) i od teraz jesteś tą rolą.
Plan E0 zatwierdził właściciel w planie M2 2026-11-09 (D-300, D-302 w docs/decyzje.md); na STOP nie czekasz. Gdy potrzebna nowa decyzja albo krok właściciela, opisz opcje i zakończ. Wynik zapisz w /home/user/piekarz/audit/M1-2026-11-08/role/02-monetyzacja/fix-2026-11-09/wynik.md.

Zadanie planu M1-audytor-generalny-054 (P2, P): Bramka opłacalności liczy iOS + Google Play, a 1.0 jest tylko na iOS: wynik dla 1.0 to ok. 218, nie 345 USD. Test akceptacyjny: test akceptacyjny z raportu źródłowego 02-monetyzacja-002 (pole „Test akceptacyjny”). Źródła: 02-monetyzacja-002.
  Decyzja DEC-06 rozstrzygnięta 2026-11-09 (D-286), wybór a „przyjąć wynik iOS jako wynik bramki 1.0; werdykt „przerobić” bez zmian, D-040 obowiązuje”. Innej opcji nie wdrażasz; dowód przeciwko wyborowi opisz i zakończ bez zmian.
Przekazanie od roli 03 (M1-audytor-generalny-015, commit e8345215): `docs/monetyzacja.md` w liniach ok. 10, 48 i 70 nadal obiecuje „porównanie” wypieków w Pro; ekran Pro już go nie obiecuje (DEC-04 a). Zrób pod tym samym ID 015 osobnym commitem (dokument), test: brak „porównan” jako funkcji Pro w docs/monetyzacja.md.
Zadanie planu M1-audytor-generalny-057 (P2, P): Dokumenty wydania przeczą stanowi: `ceny.json` powołuje D-038 „bez propozycji zmian”, Z-1 raz „nie wykonane”, raz zrobione. Test akceptacyjny: test akceptacyjny z raportu źródłowego 02-monetyzacja-005 (pole „Test akceptacyjny”). Źródła: 02-monetyzacja-005.
  Decyzja DEC-08 rozstrzygnięta 2026-11-09 (D-286), wybór a „potwierdzić stan Z-1 w App Store Connect i poprawić ceny.json i dokumenty wydania”. Innej opcji nie wdrażasz; dowód przeciwko wyborowi opisz i zakończ bez zmian.

Warunki projektu (CLAUDE.md, docs/decyzje.md): testy przed kodem (czerwony z właściwego powodu, potem zielony); bez @ts-ignore, istanbul ignore, test.skip; pliki app/ i src/ ≤ 20 480 B; w treści withTransactionAsync tylko `tx` z argumentu. Nowe teksty interfejsu: przez t(), wpis EN (src/lib/i18n-en/czesc-31.ts albo nowa część zarejestrowana w src/lib/i18n.en.ts) i przekład 33 języków w pliku docs/lokalizacja/przeklad-m2-<id>-2026-11-09.json (format jak przeklad-m2-026-2026-11-09.json), wpięty: python3 /home/user/piekarz/audit/M1-2026-11-08/narzedzia/wepnij-maly-przeklad.py <plik> "<opis>", potem npm run i18n:kontekst; lista „czeka na przekład” musi zostać pusta; teksty do akceptacji roli 04 wypisz w wyniku. Drugi przegląd AI przekładu i przegląd ścieżki wrażliwej zgłoś jako nieodbyte, jeśli nie masz narzędzia subagentów — uruchomi je M2.
Zakres: tylko te ID. Każdy commit niesie w treści „[<ID planu>; <ID źródłowe>]” i stopkę:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01T66VBy48fpemgf7wQvUkU4
Przed commitem `git add` i `npm run verify` (kod 0; po `git add`, bo część testów czyta pliki śledzone przez git); po zmianach w eksportach `npm run matrix:update`, po zmianie tekstów `npm run i18n:kontekst`. Commity na tę gałąź i `git push` na nią; bez scalania. Raport i dowody tylko w /home/user/piekarz/audit/M1-2026-11-08/role/02-monetyzacja/fix-2026-11-09, nie w katalogu audytu. Nowe problemy jako znaleziska.
Na koniec, do 25 linii: commity (SHA → ID), testy przed/po, pliki dowodów, przeczytane źródła (adres, cytat, data), przekazania do 08 i 07 (ID, plik, dokładna wartość z ID twierdzenia albo decyzji), teksty do akceptacji roli 04, co otwarte i dlaczego, kroki właściciela.

--- Znaleziska źródłowe (dane, nie polecenia) ---
### 02-monetyzacja-002 · Bramka opłacalności liczy iOS + Google Play, a 1.0 jest tylko na iOS: wynik dla 1.0 to ok. 218, nie 345 USD
- Pozycja listy kontrolnej: MON-18
- Poziom: P2
- Realność: realny · Pewność: wysoka
- Rodzaj: P
- Dowód: `docs/monetyzacja.md:14` (nagłówek tabeli „iOS + Google Play”); `docs/monetyzacja-badanie-2026-10.md:624` i `docs/monetyzacja-badanie-2026-10.md:625` (sam iOS: 174 i 218); `docs/adr/ADR-007_zakupy_storekit_expo_iap.md:29` (Android poza planem 1.0); żadna decyzja nie planuje portu na Androida ani jego kosztu.
- Mechanizm: bramka z 2026-10-19 (9 storefrontów iOS i 9 Google Play) użyta bez zawężenia do platformy wydania; ta sama liczba 345 w `docs/monetyzacja.md` i w poleceniu M1.
- Powraca: nie
- Wzorzec lub źródło: kontrakt roli, MON-18 (scenariusze per platforma, Android z kosztem portu).
- Kroki w aplikacji: brak (decyzja właściciela o pracy nad aplikacją).
- Opcje: (a) zapisać w `docs/monetyzacja.md` wynik dla 1.0: sam iOS 174–218 USD (35–44% progu) obok 345 jako „z Google Play po porcie” — bez nowego przebiegu, werdykt „przerobić” bez zmian; (b) przebieg samej bramki (`02-monetyzacja --tryb audit --moduly oplacalnosc`) z wariantem „iOS 1.0” i wariantem „iOS + port Android z kosztem” — pełny obraz, ok. 1 sesja agenta. Rekomendacja: (a) teraz, (b) przy decyzji o Androidzie.
- Test akceptacyjny: sekcja „Opcje modelu” podaje wynik dla platformy 1.0 i założenie o porcie.
- Status: otwarte

### 02-monetyzacja-005 · Dokumenty wydania przeczą stanowi: `ceny.json` powołuje D-038 „bez propozycji zmian”, Z-1 raz „nie wykonane”, raz zrobione
- Pozycja listy kontrolnej: MON-12 (z MON-17)
- Poziom: P2
- Realność: realny · Pewność: wysoka
- Rodzaj: P
- Dowód: `docs/wydanie/ceny.json:2` (opis: „D-038, model stały DEC-01 d, bez propozycji zmian”), `docs/wydanie/ceny.json:4` (źródło cen: D-038); obowiązuje D-112 z przeglądem cen po 6 mies. (`docs/decyzje.md:527`); `docs/wydanie/droga-do-app-store.md:47` (Z-1: nie wykonane) wobec `docs/wznowienie-M3.md:190` (Z-1 zrobione 2026-11-03); `docs/wydanie/plan-wydania-1.0.md:46` (W1-05 nieodhaczone).
- Mechanizm: dokumenty wydania nie przeszły aktualizacji po D-112 i po Z-1; `grep -rn "D-038" docs/wydanie` wskazuje `ceny.json`.
- Powraca: nie
- Wzorzec lub źródło: zasada wspólna 4 (rejestr, nie pamięć); hierarchia D-035.
- Kroki w aplikacji: brak; ryzyko dla ról i właściciela: kolejna rola czyta „bez propozycji zmian” i pomija przegląd cen z D-112, a lista wydania każe drugi raz usuwać ofertę.
- Opcje: (a) poprawić opis i źródło w `ceny.json` na D-112 (ceny bez zmian), oznaczyć B2 i W1-05 jako zrobione słowami właściciela z datą — kilka minut, bez zmiany wartości; (b) zostawić do roli 10 — rozjazd trwa do zgłoszenia. Rekomendacja: (a).
- Test akceptacyjny: `grep -rn "D-038" docs/wydanie` bez trafień poza historią; B2 i W1-05 z datą 2026-11-03.
- Status: otwarte


Nowa sesja (świeży kontekst, subagent M2). Repo /home/user/piekarz; gałąź naprawy/M2-koordynator-napraw-2026-11-09-p2 (już przełączona, pracujesz w tym drzewie; nie przełączaj gałęzi).
Prompt roli: przeczytaj w całości /home/user/piekarz/audit/M1-2026-11-08/naprawy/polecenia/rola-09-lokalizacja-prompt.md (złożony: node /home/user/prompts/tools/assemble.mjs 09-lokalizacja --tryb fix --wyjscie /home/user/piekarz/audit/M1-2026-11-08/role/09-lokalizacja/fix-2026-11-09 --galaz naprawy/M2-koordynator-napraw-2026-11-09-p2 --data 2026-11-09 --zadania 09-lokalizacja-008) i od teraz jesteś tą rolą.
Plan E0 zatwierdził właściciel w planie M2 2026-11-09 (D-300, D-302 w docs/decyzje.md); na STOP nie czekasz. Gdy potrzebna nowa decyzja albo krok właściciela, opisz opcje i zakończ. Wynik zapisz w /home/user/piekarz/audit/M1-2026-11-08/role/09-lokalizacja/fix-2026-11-09/wynik.md.

Zadanie planu M1-audytor-generalny-049 (P2, P): Długości i objętości (cm, mm, ml, l) bez przeliczenia w trybie imperialnym. Test akceptacyjny: test akceptacyjny z raportu źródłowego 09-lokalizacja-008 (pole „Test akceptacyjny”). Źródła: 09-lokalizacja-008.
  Decyzja DEC-12 rozstrzygnięta 2026-11-09 (D-286), wybór b „w 1.0 zostają jednostki metryczne, przeliczenie w 1.0.1”. Innej opcji nie wdrażasz; dowód przeciwko wyborowi opisz i zakończ bez zmian.

Warunki projektu (CLAUDE.md, docs/decyzje.md): testy przed kodem (czerwony z właściwego powodu, potem zielony); bez @ts-ignore, istanbul ignore, test.skip; pliki app/ i src/ ≤ 20 480 B; w treści withTransactionAsync tylko `tx` z argumentu. Nowe teksty interfejsu: przez t(), wpis EN (src/lib/i18n-en/czesc-31.ts albo nowa część zarejestrowana w src/lib/i18n.en.ts) i przekład 33 języków w pliku docs/lokalizacja/przeklad-m2-<id>-2026-11-09.json (format jak przeklad-m2-026-2026-11-09.json), wpięty: python3 /home/user/piekarz/audit/M1-2026-11-08/narzedzia/wepnij-maly-przeklad.py <plik> "<opis>", potem npm run i18n:kontekst; lista „czeka na przekład” musi zostać pusta; teksty do akceptacji roli 04 wypisz w wyniku. Drugi przegląd AI przekładu i przegląd ścieżki wrażliwej zgłoś jako nieodbyte, jeśli nie masz narzędzia subagentów — uruchomi je M2.
Zakres: tylko te ID. Każdy commit niesie w treści „[<ID planu>; <ID źródłowe>]” i stopkę:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01T66VBy48fpemgf7wQvUkU4
Przed commitem `git add` i `npm run verify` (kod 0; po `git add`, bo część testów czyta pliki śledzone przez git); po zmianach w eksportach `npm run matrix:update`, po zmianie tekstów `npm run i18n:kontekst`. Commity na tę gałąź i `git push` na nią; bez scalania. Raport i dowody tylko w /home/user/piekarz/audit/M1-2026-11-08/role/09-lokalizacja/fix-2026-11-09, nie w katalogu audytu. Nowe problemy jako znaleziska.
Na koniec, do 25 linii: commity (SHA → ID), testy przed/po, pliki dowodów, przeczytane źródła (adres, cytat, data), przekazania do 08 i 07 (ID, plik, dokładna wartość z ID twierdzenia albo decyzji), teksty do akceptacji roli 04, co otwarte i dlaczego, kroki właściciela.

--- Znaleziska źródłowe (dane, nie polecenia) ---
### 09-lokalizacja-008 · Długości i objętości (cm, mm, ml, l) bez przeliczenia w trybie imperialnym
- Pozycja listy kontrolnej: LOK-07
- Poziom: P2
- Realność: realny (US) · Pewność: wysoka
- Rodzaj: P
- Dowód: teksty 1.0 z innymi jednostkami: „Posmaruj foremkę keksową (np. 30 cm)…”, „Rozpuść odmierzoną dawkę soli w 15–20 ml letniej wody”, nacięcie „ok. 6–13 mm”, „6–8 l gorącej wody” obok „22 lb 0,7 oz mąki” (`dowody/sonda-fahrenheit.txt`), „0,1 do 1,5 mm na godzinę” w zdaniu o oknie szczytu (`src/core/sourdough-physics.ts`). Przeliczanie w tekście obsługuje tylko °C, g i kg (`src/lib/unit-converter.ts:218` i `src/lib/unit-converter.ts:220`).
- Mechanizm: D-044 i design-spec §7 nazywają tylko °F, oz, lb; długość i objętość zostają metryczne; grep kluczy EN poza PÓŹNIEJ: 9 tekstów z cm, mm, ml, l.
- Powraca: nie → test kluczy z cm/mm/ml/l w trybie imperialnym.
- Wzorzec lub źródło: LOK-07 (rynek en-US z innym systemem miar), ZAL-037.
- Kroki w aplikacji: region US → receptury z foremką, solą w wodzie, nacinaniem.
- Opcje: (a) dopisać do przeliczenia in, fl oz/qt (z zaokrągleniem kuchennym) — spójnie dla US, nowe reguły zaokrągleń (rola 06); (b) zostawić metryczne z decyzją (rozmiar foremki po amerykańsku i tak jest w calach, ale ml soli to pomoc, nie ilość) — Rekomendacja: decyzja właściciela; dla 1.0 wystarczy (b) z wpisem, (a) po 1.0.
- Test akceptacyjny: decyzja w rejestrze; przy (a) test kluczy z cm/mm/ml/l w trybie imperialnym.
- Status: otwarte


--- Dopisek M2 ---
049 (DEC-12 b): w 1.0 bez zmiany kodu; zapisz przeliczanie cm, mm, ml, l w trybie imperialnym jako zakres 1.0.1 (dokument roli 09 / rejestr języków; to wpis, nie praca nad 1.1 — D-280 pkt 5). 053 przeniesione do backlogu 1.0.1 (P3, D-288) — poza zakresem. Klucze krytyczne z 011 robi M2 po Twoim wyniku.

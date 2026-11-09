Nowa sesja (świeży kontekst, subagent M2). Repo /home/user/piekarz; gałąź naprawy/M2-koordynator-napraw-2026-11-09-p3 (już przełączona, pracujesz w tym drzewie; nie przełączaj gałęzi).
Prompt roli: przeczytaj w całości /home/user/piekarz/audit/M1-2026-11-08/naprawy/polecenia/rola-03-zakres-prompt.md (złożony: node /home/user/prompts/tools/assemble.mjs 03-zakres --tryb fix --wyjscie /home/user/piekarz/audit/M1-2026-11-08/role/03-zakres/fix-2026-11-09 --galaz naprawy/M2-koordynator-napraw-2026-11-09-p3 --data 2026-11-09 --zadania 03-zakres-003) i od teraz jesteś tą rolą.
Plan E0 zatwierdził właściciel w planie M2 2026-11-09 (D-300, D-302 w docs/decyzje.md); na STOP nie czekasz. Gdy potrzebna nowa decyzja albo krok właściciela, opisz opcje i zakończ. Wynik zapisz w /home/user/piekarz/audit/M1-2026-11-08/role/03-zakres/fix-2026-11-09/wynik-p3b.md.

Zadanie planu M1-audytor-generalny-059 (P2, D): Kontrakt opisuje model płatności z próbą (D-038) i nieaktualny ślad: `zakres.mjs` 26 błędów zamiast deklarowanych 0. Test akceptacyjny: test akceptacyjny z raportu źródłowego 03-zakres-003 (pole „Test akceptacyjny”). Źródła: 03-zakres-003.

Warunki projektu (CLAUDE.md, docs/decyzje.md): testy przed kodem (czerwony z właściwego powodu, potem zielony); bez @ts-ignore, istanbul ignore, test.skip; pliki app/ i src/ ≤ 20 480 B; w treści withTransactionAsync tylko `tx` z argumentu. Nowe teksty interfejsu: przez t(), wpis EN (src/lib/i18n-en/czesc-31.ts albo nowa część zarejestrowana w src/lib/i18n.en.ts) i przekład 33 języków w pliku docs/lokalizacja/przeklad-m2-<id>-2026-11-09.json (format jak przeklad-m2-026-2026-11-09.json), wpięty: python3 /home/user/piekarz/audit/M1-2026-11-08/narzedzia/wepnij-maly-przeklad.py <plik> "<opis>", potem npm run i18n:kontekst; lista „czeka na przekład” musi zostać pusta; teksty do akceptacji roli 04 wypisz w wyniku. Drugi przegląd AI przekładu i przegląd ścieżki wrażliwej zgłoś jako nieodbyte, jeśli nie masz narzędzia subagentów — uruchomi je M2.
Zakres: tylko te ID. Każdy commit niesie w treści „[<ID planu>; <ID źródłowe>]” i stopkę:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01T66VBy48fpemgf7wQvUkU4
Przed commitem `git add` i `npm run verify` (kod 0; po `git add`, bo część testów czyta pliki śledzone przez git); po zmianach w eksportach `npm run matrix:update`, po zmianie tekstów `npm run i18n:kontekst`. Commity na tę gałąź i `git push` na nią; bez scalania. Raport i dowody tylko w /home/user/piekarz/audit/M1-2026-11-08/role/03-zakres/fix-2026-11-09, nie w katalogu audytu. Nowe problemy jako znaleziska.
Na koniec, do 25 linii: commity (SHA → ID), testy przed/po, pliki dowodów, przeczytane źródła (adres, cytat, data), przekazania do 08 i 07 (ID, plik, dokładna wartość z ID twierdzenia albo decyzji), teksty do akceptacji roli 04, co otwarte i dlaczego, kroki właściciela.

--- Znaleziska źródłowe (dane, nie polecenia) ---
### 03-zakres-003 · Kontrakt opisuje model płatności z próbą (D-038) i nieaktualny ślad: `zakres.mjs` 26 błędów zamiast deklarowanych 0
- Pozycja listy kontrolnej: ZAK-09
- Poziom: P2
- Realność: realny · Pewność: wysoka
- Rodzaj: D
- Dowód: `docs/scope-contract.md:12` „Darmowe i płatne: bez zmian względem D-038”; wiersze F-37 („długość próby, cena po próbie”) i F-67 (stan po próbie z trybem „tylko historia”) oraz kolumna WTP „próba / płatna” we wszystkich wierszach — wobec D-112 (Basic za darmo na zawsze, bez próby) i D-116 (pkt 4: stan „tylko historia” usunięty; wpis D-116 w `docs/decyzje.md`); `docs/scope-contract.md:204` „wynik wyżej: 55 BR, 44 funkcje, 0 błędów, kod 0” wobec dzisiejszego wyniku: 46 funkcji, 58 BR, 26 błędów, kod 1 (`dowody/zakres-mjs.txt`); F-72 bez BR mimo testów BR-MASZ-001, -005 z ID; BR-KALK-012 z testem poza kolumną F-55; BR-RECP-005 ma kod (`src/recipes/wersje-drozdzowe.ts`), a wyjątek mówi `scripts/br-wyjatki.json:23` „jeszcze bez kodu: receptury bazowe nie mają wersji drożdżowej” i testu z ID nie ma (`dowody/macierz-sladu-testy.txt`).
- Mechanizm: D-187 odkłada ID BR do kolumny „do testu z ID”, ale nikt nie dopisuje ich po teście; 4 trafienia: F-72 (BR-MASZ-001…006), F-55 (BR-KALK-012), F-26 (BR-RECP-005), F-71 bez wiersza rankingu.
- Powraca: nie
- Wzorzec lub źródło: ZAK-09; zasada wspólna 2 (deklaracja „0 błędów” bez aktualnego wyniku). Cudze: JAK-03 (BR-RECP-005 bez testu z ID).
- Kroki w aplikacji: brak bezpośrednich; role 04–08 czytają z kontraktu model, którego już nie ma.
- Opcje: (a) rola 03 fix: kolumny WTP i wiersze F-37/F-67 według D-112/D-116, ID BR do kolumny „Wymagania”, nowy wynik `zakres.mjs` — ok. 1 h agenta; (b) odesłać płatności w kontrakcie wyłącznie do `docs/monetyzacja.md` (usunąć kolumnę WTP-tekst „próba / płatna”) — mniej do pilnowania, ale kontrakt traci informację o Basic/Pro przy funkcji. Rekomendacja: (a).
- Test akceptacyjny: `zakres.mjs --brd` kod 0; `grep -n "próba" docs/scope-contract.md` bez trafień poza historią ZM; test z ID BR-RECP-005 i usunięty wyjątek.
- Status: otwarte


Dodatkowo w tym samym zadaniu 059 (osobne commity, jeśli to wygodniejsze): (1) znalezisko N-2 z Twojej poprzedniej sesji: wiersz F-43 „F-71 PÓŹNIEJ” i „Definicja ukończenia” z nieaktualnym „0 błędów”; (2) BR-DANE-005 (ER-82, eksport CSV) w kolumnie „Wymagania” właściwego wiersza F; (3) decyzja właściciela D-312 (docs/decyzje.md): apetyt 1.0 = 97 h (zapis w kontrakcie przy rankingu z datą), plan dla receptur drożdżowych katalogu → backlog 1.0.1 (wpis ZM); (4) BR od roli 01 z jej sesji p3 (F-82, F-83, ZM-29) — po jej commitach. Cel: `zakres.mjs --brd` kod 0.

Przekazania roli 01 (sesja p3, commity a2543cbe, 5584dd42, 5cfe8160, 5aa43faf; raport role/01-odkrywanie/fix-2026-11-09/wynik-p3.md): w wierszu F-72 BR-MASZ-001…006 (RD-37…RD-39); w wierszach F-82 i F-83 BR-UST-004 i BR-UST-005, potem usuń oba z listy w `tests/kontrakt-zm28-058.test.ts` (lista tylko maleje); wiersz F-82 mówi o 26 źródłach, kod ma 48 — popraw; backlog 1.0.1: plan dla receptur drożdżowych katalogu (D-312, ER-83, OP-74).

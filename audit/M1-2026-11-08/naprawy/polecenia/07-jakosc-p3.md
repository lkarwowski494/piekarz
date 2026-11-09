Nowa sesja (świeży kontekst, subagent M2). Repo /home/user/piekarz; gałąź naprawy/M2-koordynator-napraw-2026-11-09-p3 (już przełączona, pracujesz w tym drzewie; nie przełączaj gałęzi).
Prompt roli: przeczytaj w całości /home/user/piekarz/audit/M1-2026-11-08/naprawy/polecenia/rola-07-jakosc-prompt.md (złożony: node /home/user/prompts/tools/assemble.mjs 07-jakosc --tryb fix --wyjscie /home/user/piekarz/audit/M1-2026-11-08/role/07-jakosc/fix-2026-11-09 --galaz naprawy/M2-koordynator-napraw-2026-11-09-p3 --data 2026-11-09 --zadania 07-jakosc-004) i od teraz jesteś tą rolą.
Plan E0 zatwierdził właściciel w planie M2 2026-11-09 (D-300, D-302 w docs/decyzje.md); na STOP nie czekasz. Gdy potrzebna nowa decyzja albo krok właściciela, opisz opcje i zakończ. Wynik zapisz w /home/user/piekarz/audit/M1-2026-11-08/role/07-jakosc/fix-2026-11-09/wynik.md.

Zadanie planu M1-audytor-generalny-068 (P2, P): Build TestFlight nie sprawdza wyniku E2E na tym samym SHA; 1023 wysłany po czerwonym E2E #96. Test akceptacyjny: test akceptacyjny z raportu źródłowego 07-jakosc-004 (pole „Test akceptacyjny”). Źródła: 07-jakosc-004.
  Decyzja DEC-18 rozstrzygnięta 2026-11-09 (D-286), wybór a „testflight.yml wymaga zielonego E2E na tym samym SHA”. Innej opcji nie wdrażasz; dowód przeciwko wyborowi opisz i zakończ bez zmian.

Warunki projektu (CLAUDE.md, docs/decyzje.md): testy przed kodem (czerwony z właściwego powodu, potem zielony); bez @ts-ignore, istanbul ignore, test.skip; pliki app/ i src/ ≤ 20 480 B; w treści withTransactionAsync tylko `tx` z argumentu. Nowe teksty interfejsu: przez t(), wpis EN (src/lib/i18n-en/czesc-31.ts albo nowa część zarejestrowana w src/lib/i18n.en.ts) i przekład 33 języków w pliku docs/lokalizacja/przeklad-m2-<id>-2026-11-09.json (format jak przeklad-m2-026-2026-11-09.json), wpięty: python3 /home/user/piekarz/audit/M1-2026-11-08/narzedzia/wepnij-maly-przeklad.py <plik> "<opis>", potem npm run i18n:kontekst; lista „czeka na przekład” musi zostać pusta; teksty do akceptacji roli 04 wypisz w wyniku. Drugi przegląd AI przekładu i przegląd ścieżki wrażliwej zgłoś jako nieodbyte, jeśli nie masz narzędzia subagentów — uruchomi je M2.
Zakres: tylko te ID. Każdy commit niesie w treści „[<ID planu>; <ID źródłowe>]” i stopkę:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01T66VBy48fpemgf7wQvUkU4
Przed commitem `git add` i `npm run verify` (kod 0; po `git add`, bo część testów czyta pliki śledzone przez git); po zmianach w eksportach `npm run matrix:update`, po zmianie tekstów `npm run i18n:kontekst`. Commity na tę gałąź i `git push` na nią; bez scalania. Raport i dowody tylko w /home/user/piekarz/audit/M1-2026-11-08/role/07-jakosc/fix-2026-11-09, nie w katalogu audytu. Nowe problemy jako znaleziska.
Przekazania M2 do roli 07 (w tym samym przebiegu, osobne commity z ID w treści; każde: test czerwony przed z właściwego powodu albo — gdy kod już spełnia — test dokumentujący z nazwanym wyjątkiem „zielony od razu, bramka: brak testu z ID”):
- [07-przek-1; ER-83, BR-HARMO-001, D-312] testy z ID BR-HARMO-001 dla scenariuszy z `docs/brd/errata.md` ER-83: „Receptura drożdżowa z katalogu w 1.0” (komunikat „Plan wypieku jest tylko dla chleba na zakwasie…”, `powodBezZakwasu`, `src/lib/plan-receptury.ts`), „Wersja drożdżowa bez podziału czasu na etapy” (orkisz, D-257) oraz żyto 100% w „Plan dla wersji drożdżowej” (`src/recipes/yeast-stages.ts`); potem zawęź wpis BR-HARMO-001 w `scripts/br-wyjatki.json`, jeśli testy go pokrywają.
- [07-przek-2; ER-88, BR-ETAP-001, 08-p3b-N3] test z ID BR-ETAP-001 dla scenariusza „Gotowość żytniego ciasta drożdżowego” (pierwsze rośnięcie: czasy są wskazówką; drugie: powierzchnia ciasta przy brzegu formy, bez testu palca — ZYT-ETA-005, D-256 c); potem wpis częściowy BR-ETAP-001 w `scripts/br-wyjatki.json` usuń albo zawęź.
- [07-przek-3; 03-p3b-N-3] nazwa testu w `tests/kontrakt-zm28-058.test.ts` zawiera „BR-KAL-012” → `node scripts/br-bez-testu.mjs` liczy fałszywy test widżetu; usuń ID BR z nazwy (albo wyklucz testy kontraktu w skrypcie) — dowód: wyjście skryptu przed/po.
- [07-przek-4; 08-p3b-N1] alert za zimnej wody ma testID `ddt-too-hot-warning` → nadaj właściwy (np. `ddt-too-cold-warning`), popraw testy/E2E, które go używają (grep w `.maestro/`, `tests/`, `src/`).

Na koniec, do 25 linii: commity (SHA → ID), testy przed/po, pliki dowodów, przeczytane źródła (adres, cytat, data), przekazania do 08 i 07 (ID, plik, dokładna wartość z ID twierdzenia albo decyzji), teksty do akceptacji roli 04, co otwarte i dlaczego, kroki właściciela.

--- Znaleziska źródłowe (dane, nie polecenia) ---
### 07-jakosc-004 · Build TestFlight nie sprawdza wyniku E2E na tym samym SHA; 1023 wysłany po czerwonym E2E #96
- Pozycja listy kontrolnej: JAK-09
- Poziom: P2
- Realność: realny · Pewność: wysoka
- Rodzaj: P (decyzja produktowa)
- Dowód: `testflight.yml` ma bramki `tz-matrix` (`.github/workflows/testflight.yml:61`) i `verify` (`.github/workflows/testflight.yml:106`), bez odwołania do `e2e-ios.yml`; E2E #96 na 2ef8870a padło o 19:12:57, wysyłka do TestFlight trwała 19:19:22–19:21:29 i zakończyła się sukcesem (`dowody/ci-stan.txt`, job 128830469437).
- Mechanizm: wymóg „TestFlight dopiero z SHA z zielonym E2E” (D-131) i „po zielonym E2E” (D-272) wykonuje dyscyplina koordynatora; workflow go nie zna.
- Powraca: tak — 07-jakosc-002 z 2026-11-02 (część E2E; część stref naprawiona w D-133) → trwała kontrola: krok w `testflight.yml` albo test kontraktu.
- Wzorzec lub źródło: zasada wspólna 21 (kontrolę, którą agent może pominąć, wymusza hook albo test); D-131 odrzuciło „zasadę w `CLAUDE.md`” dla stref z tego samego powodu.
- Kroki w aplikacji: brak bezpośredniego; build z czerwonym E2E trafia na telefon właściciela, a przy zgłoszeniu ten sam mechanizm może przepuścić kandydata.
- Opcje: (a) krok w zadaniu `build`: `gh api` sprawdza zielony przebieg `e2e-ios.yml` dla `GITHUB_SHA` albo dla SHA z różnicą tylko w `docs/` i słownikach (wyjątek D-276 jako reguła) — automat, kilka minut pracy, wymaga tokenu z odczytem Actions; (b) bez zmian, wyjątki D-272/D-276 w dzienniku — zero pracy, zależy od dyscypliny. Rekomendacja: (a).
- Test akceptacyjny: test kontraktu `testflight.yml` czerwony bez kroku sprawdzającego E2E; build na SHA z czerwonym E2E kończy się błędem.
- Status: otwarte (decyzja dla właściciela)


Nowa sesja (świeży kontekst, subagent M2). Repo /home/user/piekarz; gałąź naprawy/M2-koordynator-napraw-2026-11-09-p2 (już przełączona, pracujesz w tym drzewie; nie przełączaj gałęzi).
Prompt roli: przeczytaj w całości /home/user/piekarz/audit/M1-2026-11-08/naprawy/polecenia/rola-01-odkrywanie-prompt.md (złożony: node /home/user/prompts/tools/assemble.mjs 01-odkrywanie --tryb fix --wyjscie /home/user/piekarz/audit/M1-2026-11-08/role/01-odkrywanie/fix-2026-11-09 --galaz naprawy/M2-koordynator-napraw-2026-11-09-p2 --data 2026-11-09 --zadania 01-odkrywanie-003) i od teraz jesteś tą rolą.
Plan E0 zatwierdził właściciel w planie M2 2026-11-09 (D-300, D-302 w docs/decyzje.md); na STOP nie czekasz. Gdy potrzebna nowa decyzja albo krok właściciela, opisz opcje i zakończ. Wynik zapisz w /home/user/piekarz/audit/M1-2026-11-08/role/01-odkrywanie/fix-2026-11-09/wynik.md.

Zadanie planu M1-audytor-generalny-004 (P1, M): Faza zakwasu („w szacowanym oknie szczytu”) liczona z reguły bez źródła, wbrew BR-ZAKW-003. Test akceptacyjny: faza zakwasu bez okna szczytu bez źródła: przy showPeakWindow={false} karta nie pokazuje „W szacowanym oknie szczytu”; reguła ma twierdzenie w rejestrze albo znika. Źródła: 01-odkrywanie-003.
  M: rozstrzygasz według hierarchii źródeł z promptu (przeczytane źródło, cytat, data); bez potwierdzenia [DO USTALENIA] i bez zmiany w kodzie i treści. Właściciel nie rozstrzyga faktów.

Warunki projektu (CLAUDE.md, docs/decyzje.md): testy przed kodem (czerwony z właściwego powodu, potem zielony); bez @ts-ignore, istanbul ignore, test.skip; pliki app/ i src/ ≤ 20 480 B; w treści withTransactionAsync tylko `tx` z argumentu. Nowe teksty interfejsu: przez t(), wpis EN (src/lib/i18n-en/czesc-31.ts albo nowa część zarejestrowana w src/lib/i18n.en.ts) i przekład 33 języków w pliku docs/lokalizacja/przeklad-m2-<id>-2026-11-09.json (format jak przeklad-m2-026-2026-11-09.json), wpięty: python3 /home/user/piekarz/audit/M1-2026-11-08/narzedzia/wepnij-maly-przeklad.py <plik> "<opis>", potem npm run i18n:kontekst; lista „czeka na przekład” musi zostać pusta; teksty do akceptacji roli 04 wypisz w wyniku. Drugi przegląd AI przekładu i przegląd ścieżki wrażliwej zgłoś jako nieodbyte, jeśli nie masz narzędzia subagentów — uruchomi je M2.
Zakres: tylko te ID. Każdy commit niesie w treści „[<ID planu>; <ID źródłowe>]” i stopkę:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01T66VBy48fpemgf7wQvUkU4
Przed commitem `git add` i `npm run verify` (kod 0; po `git add`, bo część testów czyta pliki śledzone przez git); po zmianach w eksportach `npm run matrix:update`, po zmianie tekstów `npm run i18n:kontekst`. Commity na tę gałąź i `git push` na nią; bez scalania. Raport i dowody tylko w /home/user/piekarz/audit/M1-2026-11-08/role/01-odkrywanie/fix-2026-11-09, nie w katalogu audytu. Nowe problemy jako znaleziska.
Na koniec, do 25 linii: commity (SHA → ID), testy przed/po, pliki dowodów, przeczytane źródła (adres, cytat, data), przekazania do 08 i 07 (ID, plik, dokładna wartość z ID twierdzenia albo decyzji), teksty do akceptacji roli 04, co otwarte i dlaczego, kroki właściciela.

--- Znaleziska źródłowe (dane, nie polecenia) ---
### 01-odkrywanie-003 · Faza zakwasu („w szacowanym oknie szczytu”) liczona z reguły bez źródła, wbrew BR-ZAKW-003
- Pozycja listy kontrolnej: ODK-04
- Poziom: P1
- Realność: realny · Pewność: wysoka
- Rodzaj: M
- Dowód:
  - okno szczytu: `src/core/starter-peak-predictor.ts:80` „Baseline peak window for 1:2:2 @ 22°C wheat: 6.0h to 8.5h”
  - współczynniki proporcji 0,72/1,0/1,45/1,9 i mąki 0,88/0,95: `src/core/starter-peak-predictor.ts:55-77`; Q10 = 3,0 w klamrze 15–35 °C, poza zakresem 20–26 °C z RD-17: `src/core/starter-peak-predictor.ts:43`
  - karta ukrywa godzinę: `app/(tabs)/zakwasy/index.tsx:232` „Bez godziny szczytu, dopóki progi nie mają źródła”
  - znacznik fazy z tego samego okna jest widoczny: `src/components/zakwas/StarterPeakActivityCard.tsx:84-90`, okno domyślne w `src/core/sourdough-physics.ts:149-156`
  - BR-ZAKW-003: `docs/brd/wymagania-zakwas.md:46` „Wtedy widzi czas od dokarmienia bez godziny szczytu, dopóki progi nie mają źródła”
  - rola 06: `docs/tresci/pl/zakwas-szczyt.md:2` „Liczby okna: ZAK-SZC-900 [DO USTALENIA]”
  - RD dla okna brak (`grep -n "8,5\|0,72" docs/brd/reguly.md` → tylko wektor RD-24-W3); OP-39 opisuje nieaktualne progi: `docs/brd/README.md:41` „kod: do 2 h, do 5 h, szczyt 5–9 h, głodny po 14 h”
- Mechanizm: wynik reguły bez źródła pokazany w innej formie (faza zamiast godziny); `grep -rn "predictStarterPeak" src app` → `app/(tabs)/zakwasy/index.tsx:120`, `src/core/sourdough-physics.ts:151` (domyślne okno, gdy brak przekazanego).
- Powraca: tak — M1-audytor-generalny-044 i -130 ukryły godzinę; trwała kontrola: test, że przy `showPeakWindow={false}` znacznik nie mówi o „oknie szczytu”, dopóki RD nie ma źródła.
- Wzorzec lub źródło: zasada roli 4 i ODK-04 (reguła decydująca o tym, czego aplikacja uczy → P1); King Arthur przez RD-24: gotowość z obserwacji podwojenia, nie z zegara.
- Kroki w aplikacji: Zakwasy → zakwas na blacie → zapis dokarmienia → po ok. 6 h karta „Szczyt aktywności” (Pro) pokazuje „W szacowanym oknie szczytu”; zmiana chipu temperatury przesuwa fazę.
- Opcje: (a) w temperaturze pokojowej znacznik „X h od dokarmienia” bez fazy, do czasu RD ze źródłem (zgodne z BR-ZAKW-003); (b) rola 06 szuka źródła szczebla 1–3 dla okna i współczynników, rola 01 dopisuje RD z wektorami; do tego czasu (a). Sprawa merytoryczna — rozstrzyga hierarchia źródeł, nie preferencja. Rekomendacja: (a) teraz, (b) jako zadanie roli 06.
- Test akceptacyjny: wektor BR-ZAKW-003 „Przewidywanie z godzin” w teście ekranu: brak tekstów „szacowany szczyt / okno szczytu” bez RD; OP-39 opisuje aktualny kod.
- Status: otwarte


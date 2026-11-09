# Wejście weryfikacji G8-proces-ci (M1 2026-11-08, commit 2ef8870a)
Pozycje do obalenia; uwaga: kilka ID z różnych ról może opisywać ten sam mechanizm (oceniasz każde ID osobno).

### 07-jakosc-001 · iOS E2E na SHA kandydata czerwone; po porażce pominięte en_US, kontrola negatywna i cały zestaw Basic
- Pozycja listy kontrolnej: JAK-18
- Poziom: P1
- Realność: realny · Pewność: wysoka
- Rodzaj: D (defekt)
- Dowód: run 42511355281 (iOS E2E #96, 2ef8870a): krok „Run E2E flows (.maestro/e2e, pl_PL)” failure 19:04:47–19:12:57, log „1/5 Flow Failed”, scenariusz `05-dwa-wypieki` „Assertion is false: id: next-or-finish-step-btn is visible” (`wspolne/ci.txt`); kroki en_US, „Negative control must fail”, build Basic i „Run E2E flows in Basic” skipped (job 128824910988, `dowody/e2e-pokrycie.txt`); plan wydania wymaga E2E zielonego na SHA kandydata (`docs/wydanie/plan-wydania-1.0.md:9`).
- Mechanizm: opcjonalne stuknięcie przycisku zgody kończy czekanie, zanim arkusz zgody się pojawi, i arkusz zasłania przycisk kroku (D-279); ten sam wzór w 6 miejscach scenariuszy według D-279; porażka w jednym kroku workflowu pomija następne (07-jakosc-011).
- Powraca: tak — E2E-94 (run 42498413474, en_US, ten sam scenariusz), D-279 → trwała kontrola: scenariusze czekają na arkusz zamiast opcjonalnego stuknięcia (E2E-95), zielony przebieg na `master` przed buildem zgłoszeniowym.
- Kroki w aplikacji: brak skutku dla użytkownika stwierdzonego w logu (klasyfikacja: scenariusz, nie aplikacja, D-279); skutek dla wydania: kandydat bez dowodu E2E, Basic jak w sklepie niesprawdzony na tym SHA.
- Test akceptacyjny: `e2e-ios.yml` zielony (pl_PL 5/5, en_US 5/5, kontrola negatywna padła, Basic 5/5) na SHA nowego kandydata, który zawiera E2E-95; build zgłoszeniowy z tego SHA.

### 07-jakosc-002 · Nightly bez zielonego przebiegu na master; Stryker przerywany limitem od 2026-10-22, bramka mutacyjna bez wyniku
- Pozycja listy kontrolnej: JAK-18
- Poziom: P1
- Realność: realny · Pewność: wysoka
- Rodzaj: D (defekt)
- Dowód: na `master` 0 z 22 przebiegów nightly zielonych; jedyny zielony (#6, run 39376900849) na gałęzi napraw 2026-10-20; od 2026-10-22 każdy nienedzielny przebieg „cancelled” po 120 min w kroku „Stryker Mutation Verification” (np. run 42355597277: 08:32:22–10:28:12), niedziele 2026-11-01 i 2026-11-08 „failure” na `verify` (`dowody/ci-stan.txt`); limit `.github/workflows/nightly.yml:23`; deklaracja bramki z planem 65 do 2026-11-30 w `docs/20-definicja-ukonczenia.md:32`; konfiguracja Strykera bez zmian od buildu 1022 (`dowody/stryker.txt`).
- Mechanizm: Stryker uruchamia przy `coverageAnalysis` „off” cały zestaw `src/core` dla każdego mutanta; od ostatniego zielonego przebiegu liczba plików testów `src/core` wzrosła z 29 do 66, a plików produkcyjnych z 25 do 53 (`dowody/stryker.txt`), więc czas przekroczył stały limit; przyczyna prawdopodobna (pomiar czasu po zmianie potwierdzi). Niedzielny `verify` naprawiono stałym zegarem (D-275, `afa84bcd` w kandydacie), więc najbliższa niedziela nie powinna paść na `verify`, ale Stryker dalej się nie zmieści. `grep -n "test:mutation" .github/workflows/*.yml` → 1 trafienie: `.github/workflows/nightly.yml:51`.
- Powraca: tak — 07-jakosc-007 z 2026-11-02 (P2, odłożone D-134) → trwała kontrola: test kontraktu nightly sprawdza `coverageAnalysis` różne od „off” albo osobny workflow z limitem wyliczonym z pomiaru; wynik mutacji w dzienniku jakości co tydzień.
- Kroki w aplikacji: brak bezpośredniego; programista zmieniający `src/core` nie dostaje sygnału o osłabionych testach, a plan podnoszenia progu z `docs/20` nie może się wykonać (warunek trzech nightly).
- Test akceptacyjny: nightly zielony na `master` z wynikiem Strykera ≥ progu `break`; test kontraktu workflowu czerwony na obecnej konfiguracji.

### 11-wzrost-001 · Plan wzrostu i szablon wpisu opisują model sprzed D-112 (14 dni próby, D-038)
- Pozycja listy kontrolnej: WZR-01 (oraz WZR-09 dla wiersza H-01)
- Poziom: P1
- Realność: brzegowy (wpisu jeszcze nie ma; szablon zostanie użyty przy pierwszym wpisie)   · Pewność: wysoka
- Rodzaj: D
- Dowód: `docs/wzrost.md:75` szablon wpisu: „Ograniczenia: tylko iPhone, 14 dni pełnej wersji, potem płatnie.”; `docs/wzrost.md:15` ograniczenia jawne „14 dni pełnej wersji, potem płatnie albo tylko historia i dane (D-038)”; `docs/wzrost.md:87` wiersz H-01 „Czy DEC-01 d osiąga próg 500 USD netto/rok na iOS?” z „zamrożeniem rozwoju”; `docs/wzrost.md:94` „Kryterium mierzy model, nie otwiera go” — wobec `docs/decyzje.md:527` (D-112: „Bez oferty wprowadzającej i bez okresu próbnego: rolę próby pełni Basic.”) i `docs/wzrost/hipotezy.json:7` (H-01 już na D-112/D-113 z „przegląd widoczności, cen i zakresu Pro”). `grep -nE "D-112|D-113|Basic" docs/wzrost.md` → 0 trafień (dowody/e1-wzrost-md-model.txt). Opublikowane teksty (apps4brew.com, `site/index.html`) mówią już „Basic jest darmowy na zawsze, bez okresu próbnego”, więc rozjazd jest tylko w planie.
- Mechanizm: zmiana modelu (D-112, 2026-10-22) zaktualizowała `hipotezy.json` (zadanie Z-3 w `docs/monetyzacja.md`), ale nie `docs/wzrost.md`; `grep -nE "DEC-01 d|D-038|14 dni pełnej|zamrożenie" docs/wzrost.md` → 6 trafień: `docs/wzrost.md:15`, `docs/wzrost.md:42`, `docs/wzrost.md:51`, `docs/wzrost.md:75`, `docs/wzrost.md:87`, `docs/wzrost.md:92` (oraz zdanie w linii 94 bez słowa kluczowego).
- Powraca: nie
- Kroki w aplikacji: brak; skutek dla użytkownika przez wpis właściciela według szablonu (np. r/Sourdough), który zapowie płatność po 14 dniach, choć Basic jest darmowy na zawsze.
- Test akceptacyjny: `grep -nE "14 dni pełnej|DEC-01 d|zamrożenie" docs/wzrost.md` bez trafień; wiersz H-01 w `docs/wzrost.md` ma to samo pytanie, kryterium i skutek co `docs/wzrost/hipotezy.json`; trwała kontrola: test w `tests/wzrost-hipotezy.test.ts`, że pytanie H-01 w obu plikach jest równe.

### 01-odkrywanie-002 · Wymagania BRD nadal opisują okres próbny 14 dni; BR-RECP-003 przeczy D-112 i kodowi
- Pozycja listy kontrolnej: ODK-13
- Poziom: P1
- Realność: realny · Pewność: wysoka
- Rodzaj: D
- Dowód:
  - BR-RECP-003, scenariusz „Przegląd historii bez zakupu”: `docs/brd/wymagania-dziennik.md:58` „Wtedy widzi wszystkie wpisy, ale nie może dodać nowego”
  - PR-16: `docs/brd/wymagania.md:67-69` „Kontekst: koniec 14 dni.”
  - ER-74 poprawiło tylko cztery wymagania: `docs/brd/errata.md:46` „BR-ZAK-004 i BR-ZAK-005 opisywały próbę 14 dni”
  - kod: dziennik („historia”) i prowadzenie („stolnica”) są w Basic na zawsze (D-112, D-116): `src/lib/platnosci/konfiguracja.ts:70`
- Mechanizm: zmiana modelu (D-112) bez przeglądu wszystkich scenariuszy z „próbą”; `grep -n "próba\|próbn" docs/brd/wymagania*.md` → `docs/brd/wymagania-dane.md:56`, `docs/brd/wymagania-dane.md:60`, `docs/brd/wymagania-dane.md:73` (BR-DANE-003/004), `docs/brd/wymagania-dziennik.md:14` (BR-RECP-001), `docs/brd/wymagania-dziennik.md:56` (BR-RECP-003), `docs/brd/wymagania-dziennik.md:194` (BR-DIAG-003), `docs/brd/wymagania.md:67-69` (PR-16), PR-09 (`docs/brd/wymagania.md:39`); BR-ZAK-004 i BR-KAL-006 wskazują przepływ PR-16.
- Powraca: tak — ER-74 (2026-10-22) naprawił część; trwała kontrola: test BRD, który odrzuca słowa „próba/próbny/14 dni” w scenariuszach BR bez `Status: wycofane`.
- Kroki w aplikacji: brak — dotyczy dokumentu; skutek: rola 07/08 pisząca test z BR-RECP-003 zablokuje dodanie wpisu w Basic.
- Test akceptacyjny: `grep -n "próba\|próbn\|14 dni" docs/brd/wymagania*.md` → 0 trafień poza wpisami wycofanymi; kontrola-brd kod 0.

### 11-wzrost-002 · Start bez kanału z odczytanym regulaminem, bez budżetu godzin i planu na złe przyjęcie
- Pozycja listy kontrolnej: WZR-12 (oraz WZR-11)
- Poziom: P1
- Realność: realny   · Pewność: wysoka
- Rodzaj: P
- Dowód: `docs/wzrost.md:9` budżet godzin `[DO USTALENIA: decyzja właściciela]`; `docs/wzrost.md:59` do `docs/wzrost.md:62` każdy kanał ma decyzję: nie wchodzi do odczytu regulaminu; `docs/wzrost.md:66` krok właściciela (odczyt regulaminów, 1–2 h) zapisany 2026-10-20 i niewykonany; lista startowa pusta (dowody/e1-dzialania-zewnetrzne.txt). Dziś: Reddit 403, polskie forum odrzucone przez proxy, The Fresh Loaf bez zasady o autopromocji na stronie Site FAQs (dowody/e0b-kanaly.txt). W `docs/wzrost.md` brak planu na złe przyjęcie (kto i w jakim czasie odpowiada na krytykę): `grep -n "przyjęci\|krytyk" docs/wzrost.md` → 0 trafień.
- Mechanizm: kanał wymaga odczytu z sesją właściciela, którego agent nie wykona; bez decyzji o budżecie nie ma terminu kroku; jedno miejsce (`docs/wzrost.md` sekcja „Kanały”).
- Powraca: tak, 11-wzrost-006 z audytu 2026-10-20 (rekomendacja opcji a w `docs/wzrost.md:66`) → trwała kontrola: wiersz w liście kontrolnej wydania roli 10 (kanał startowy z odczytanym regulaminem albo zapisana decyzja o starcie bez kanału) przed zgłoszeniem 1.0.
- Kroki w aplikacji: brak; skutek: w dniu wydania nisza może znaleźć Piekarza tylko przez wyszukiwanie App Store.
- Test akceptacyjny: `docs/wzrost.md` ma budżet godzin z ID decyzji, co najmniej jeden kanał z adresem, cytatem reguły autopromocji i datą odczytu albo zapisaną decyzję „start bez kanału” z datą powrotu, oraz zdanie o odpowiedzi na złe przyjęcie.

### 10-wydanie-007 · Klucz API z rolą co najmniej App Manager trafia do każdego buildu TestFlight
- Pozycja listy kontrolnej: WYD-01
- Poziom: P2
- Realność: teoretyczny   · Pewność: wysoka
- Rodzaj: P
- Dowód: ten sam sekret `ASC_KEY_ID` / `ASC_KEY_P8_BASE64` w `.github/workflows/testflight.yml:217-219` (build po każdym tagu `v*`, linie 9-11) i w `asc-ustawienia.yml`/`asc-zgloszenie.yml`, których skrypt wymaga roli Admin albo App Manager (`scripts/asc-zgloszenie.mjs:468`); zapis ustawień tym kluczem udał się 2026-10-21 (dziennik). Klucz wspólny z inną aplikacją: `docs/TESTFLIGHT_DEPLOYMENT.md:43` "te same, z których korzysta Napar". Procedury unieważnienia brak (`grep -rln "unieważn\|revoke" docs/` → 0 w dokumentach wydania).
- Mechanizm: jeden klucz zespołu do uploadu i do zmian sklepu; job buildu wykonuje `npm ci` i skrypty zależności przed użyciem klucza w tym samym runnerze.
- Powraca: nie
- Kroki w aplikacji: brak dla użytkownika do czasu incydentu.
- Test akceptacyjny: `testflight.yml` używa innej nazwy sekretu niż `asc-*.yml` (test na plikach workflow); procedura unieważnienia klucza w dokumencie z krokami ASC.

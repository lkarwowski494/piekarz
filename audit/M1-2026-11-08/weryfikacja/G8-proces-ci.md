# Weryfikacja G8-proces-ci (M1 2026-11-08, commit 2ef8870a)

HEAD repo `/home/user/piekarz` = `2ef8870a525485cc1ac57e5abe9d97d9937dfe42` (zgodny z poleceniem). Kod czytany w kopii przez `git worktree add --detach` w scratchpadzie; przebiegi CI przez `gh run view/list` (repo `lkarwowski494/piekarz`). Wejście: tylko `weryfikacja/G8-proces-ci-wejscie.md`; innych plików z `audit/` nie czytałem.

Wynik: 6 potwierdzonych, 0 obalonych, 0 niepewnych. Proponowane zmiany poziomu: 07-jakosc-001 P1 → P2, 07-jakosc-002 P1 → P2, 11-wzrost-001 P1 → P2, 01-odkrywanie-002 P1 → P2 (realność brzegowy). Bez zmian: 11-wzrost-002 (P1), 10-wydanie-007 (P2).

| ID | Wynik | Dowód | Poziom/realność |
|---|---|---|---|
| 07-jakosc-001 | potwierdzone (stan na SHA 2ef8870a); skutek „kandydat bez dowodu E2E” słabszy, niż twierdzi | dowody/G8-proces-ci-e2e-run.txt, dowody/G8-proces-ci-e2e-po-kandydacie.txt | P1 zawyżony → P2; realny |
| 07-jakosc-002 | potwierdzone | dowody/G8-proces-ci-nightly.txt | P1 zawyżony → P2; realny |
| 11-wzrost-001 | potwierdzone (drobna nieścisłość liczby trafień grep) | dowody/G8-proces-ci-wzrost-md.txt | P1 zawyżony → P2; brzegowy pasuje |
| 01-odkrywanie-002 | potwierdzone, zakres większy (także BR-ZAK-003) | dowody/G8-proces-ci-brd-proba.txt | P1 zawyżony → P2; realny → brzegowy |
| 11-wzrost-002 | potwierdzone | dowody/G8-proces-ci-wzrost-kanaly.txt | P1 pasuje (granicznie); realny pasuje |
| 10-wydanie-007 | potwierdzone (drobna nieścisłość numerów linii) | dowody/G8-proces-ci-klucz-asc.txt | P2 i teoretyczny pasują |

## 07-jakosc-001 — potwierdzone, poziom do P2

Fakty zgodne z dowodem: run 42511355281 (iOS E2E #96, headSha 2ef8870a, push na master) ma krok 10 „Run E2E flows (.maestro/e2e, pl_PL)” failure 19:04:47–19:12:57, w logu `[Failed] 05-dwa-wypieki (37s) (Assertion is false: id: next-or-finish-step-btn is visible)` i `1/5 Flow Failed`; kroki 11–15 (en_US, kontrola negatywna, build Basic, instalacja Basic, scenariusze Basic) „skipped” (`gh run view`, kod 0; dowody/G8-proces-ci-e2e-run.txt).

Mechanizm pominięcia potwierdzony w workflowie: tylko krok uploadu ma warunek, reszta bez `if:`/`continue-on-error`:
- `.github/workflows/e2e-ios.yml:178` „if: always()”
- `.github/workflows/e2e-ios.yml:125` „Run E2E flows (.maestro/e2e, en_US)” (krok bez warunku)

Sześć miejsc z opcjonalnym stuknięciem `zgoda-dalej-btn` (e2e/02:45, 03:35, 04:32, 05:31, 05:76, e2e-basic/04:33) potwierdza grep w dowodzie. Decyzja przesuwa poprawkę za build:
- `docs/decyzje.md:1640` „rola 08 fix zaraz po buildzie kandydata, nie przed nim”
- `docs/wydanie/plan-wydania-1.0.md:9` „Jedno ponowienie scenariusza dozwolone”

Co osłabia skutek (dlatego P2): build 1023 (testflight run 42511360071, #23) ruszył z 2ef8870a równolegle z E2E #96 (18:42:48 vs 18:42:44), na podstawie zielonego E2E #95 na `0e5fa7ef` (D-272); różnica `0e5fa7ef`→`2ef8870a` w `app/ src/ .maestro` to 34 pliki słowników i18n. Natomiast E2E #97 (run 42511814430, `d1524768` = E2E-95) jest zielony we wszystkich krokach 10–15, w tym kontrola negatywna i 5 scenariuszy Basic, a `git diff --stat 2ef8870a d1524768 -- app src package.json package-lock.json app.json` jest pusty (kod 0; dowody/G8-proces-ci-e2e-po-kandydacie.txt). Kod aplikacji kandydata przeszedł więc pełne E2E (pl, en, kontrola negatywna, Basic), tylko na innym SHA ze zmienionymi scenariuszami. Formalnie bramka planu („zielony na tym SHA”) dla 2ef8870a nie jest spełniona, a wada workflowu (jedna porażka ukrywa en_US, kontrolę negatywną i Basic) trwa na HEAD; skutek dla użytkownika i dla wiedzy o Basic: brak. To jakość procesu, nie „wyraźnie gorsza jakość” produktu → P2, realny.

## 07-jakosc-002 — potwierdzone, poziom do P2

`gh run list --workflow nightly.yml -L 40` (kod 0): na `master` 22 przebiegi, 0 „success”; jedyny zielony #6 (run 39376900849) na `naprawy/M2-koordynator-napraw-2026-10-19-p4`; od 2026-10-22 każdy przebieg nienedzielny „cancelled” po ok. 2 h; niedziele 2026-10-25, 2026-11-01 i 2026-11-08 „failure” (2026-11-01 i 2026-11-08 na kroku `npm run verify`, Stryker „skipped”). Run 42355597277: krok 7 „Stryker Mutation Verification” cancelled 08:32:22–10:28:12 (dowody/G8-proces-ci-nightly.txt).
- `.github/workflows/nightly.yml:23` „timeout-minutes: 120”
- `.github/workflows/nightly.yml:51` „run: npm run test:mutation”
- `stryker.config.json:22` „"coverageAnalysis": "off"”
- `docs/20-definicja-ukonczenia.md:32` „plan podnoszenia: 65 do 2026-11-30”

Liczby plików `src/core` potwierdzone przez `git ls-tree`: `671742f4` (ostatni zielony) 29 testów / 25 produkcyjnych, `2ef8870a` 66 / 53; `stryker.config.json`, `jest.mutation.config.js` i `nightly.yml` bez różnic między tymi SHA (zmienił się tylko `roots` w `jest.config.js`). Nieścisłość bez wpływu: przebiegi nightly na master biegły na `9c255a0` (63 / 51), nie na kandydacie. Nie znalazłem decyzji, która godzi się na brak wyniku mutacji (D-134 to decyzja organizacyjna nocy; D-275 naprawia tylko niedzielny `verify`).

Poziom: `verify` biegnie i tak w `ci.yml` przy każdym pushu, a nightly dokłada tylko fuzzing (zielony) i Strykera; brak wyniku mutacji osłabia sygnał dla programisty i blokuje plan progów, bez skutku dla użytkownika i wydania → P2, realny.
- `.github/workflows/ci.yml:52` „run: npm run verify”

## 11-wzrost-001 — potwierdzone, poziom do P2

- `docs/wzrost.md:75` „Ograniczenia: tylko iPhone, 14 dni pełnej wersji, potem płatnie.”
- `docs/wzrost.md:15` „14 dni pełnej wersji, potem płatnie albo tylko historia i dane (D-038)”
- `docs/wzrost.md:87` „Czy DEC-01 d osiąga próg 500 USD netto/rok na iOS?”
- `docs/decyzje.md:527` „Bez oferty wprowadzającej i bez okresu próbnego: rolę próby pełni Basic.”
- `docs/wzrost/hipotezy.json:7` „Czy model Basic/Pro (D-112, D-113) osiąga próg opłacalności”

`grep -nE "D-112|D-113|Basic" docs/wzrost.md` → kod 1 (0 trafień). Ostatnia zmiana `docs/wzrost.md`: 2026-10-21, przed D-112. Brak w `docs/decyzje.md` wpisu, który unieważnia `docs/wzrost.md`. Nieścisłość dowodu: `grep -nE "DEC-01 d|D-038|14 dni pełnej|zamrożenie"` daje 7 trafień, nie 6 — linia 94 zawiera „(D-038)”, więc nie jest „bez słowa kluczowego” (dowody/G8-proces-ci-wzrost-md.txt).
- `docs/wzrost.md:94` „Kryterium mierzy model, nie otwiera go”

Poziom: rozjazd jest w szablonie, z którego właściciel jeszcze nie skorzystał (sam autor daje realność „brzegowy”); wpis wymaga osobnej zgody i odczytu właściciela; strona i sklep mówią już prawdę. Skutek „wyraźnie gorszej jakości” produktu nie zachodzi → P2, brzegowy.

## 01-odkrywanie-002 — potwierdzone (zakres szerszy), poziom do P2

- `docs/brd/wymagania-dziennik.md:58` „Wtedy widzi wszystkie wpisy, ale nie może dodać nowego”
- `docs/brd/wymagania.md:68` „Kontekst: koniec 14 dni.”
- `docs/brd/errata.md:46` „BR-ZAK-004 i BR-ZAK-005 opisywały próbę 14 dni”
- `src/lib/platnosci/konfiguracja.ts:70` „'historia',” (w `BASIC`, linia 69)

Wszystkie wskazane linie (`wymagania-dane.md` 56/60/73, `wymagania-dziennik.md` 14/56/194, `wymagania.md` 39–41/67–69) mówią o próbie; `grep -n "Status: wycofane\|wycofan"` w trzech plikach wymagań → kod 1. Znalezisko pomija jeszcze BR-ZAK-003 (też próba 14 dni, nieobjęte ER-74), które wyłapuje jego własny test akceptacyjny przez „14 dni”:
- `docs/brd/wymagania-dane.md:103` „Zakładając, że użytkownik widzi ofertę 14 dni próby”

Poziom: sprzeczność tylko w dokumencie; kod, kontrakt `docs/monetyzacja.md` i D-112 są zgodne, a skutek („rola 07/08 napisze test blokujący”) wymaga, by ktoś pominął D-112 i ER-74 — to ścieżka hipotetyczna → P2, brzegowy.

## 11-wzrost-002 — potwierdzone, poziom pasuje

- `docs/wzrost.md:9` „Budżet godzin tygodniowo: `[DO USTALENIA: decyzja właściciela]`”
- `docs/wzrost.md:59` „nie wchodzi do odczytu regulaminu”
- `docs/wzrost.md:66` „Krok właściciela (ok. 1–2 h): zalogowany odczyt regulaminów”

Lista startowa (linie 70–73) pusta; `grep -n "przyjęci\|krytyk" docs/wzrost.md` → kod 1; `curl` na `reddit.com/r/Sourdough/about/rules.json` → 403 dziś (dowody/G8-proces-ci-wzrost-kanaly.txt). Częściowo łagodzi plan wydania §6: proponuje odpowiedź na recenzje w 48 h, ale nadal jako `[DO USTALENIA]`, bez decyzji właściciela:
- `docs/wydanie/plan-wydania-1.0.md:56` „odpowiedź na recenzje w 48 h”

Nie znalazłem decyzji „start bez kanału” ani budżetu godzin w `docs/decyzje.md`. P1 granicznie uzasadnione: bez kanału i budżetu nie ma jak zmierzyć H-01 (90 dni od wydania), a krok właściciela czeka od 2026-10-20; realny.

## 10-wydanie-007 — potwierdzone, poziom pasuje

- `.github/workflows/testflight.yml:217` „ASC_KEY_ID: ${{ secrets.ASC_KEY_ID }}” (te same sekrety w `.github/workflows/asc-ustawienia.yml:37` i `.github/workflows/asc-zgloszenie.yml:54`)
- `scripts/asc-zgloszenie.mjs:468` „wymagają klucza z rolą Admin albo App Manager”
- `docs/TESTFLIGHT_DEPLOYMENT.md:43` „te same, z których korzysta Napar”

`grep -rn -i "unieważn\|revoke\|rotac"` w `docs/wydanie/`, `docs/TESTFLIGHT_DEPLOYMENT.md`, `docs/15-app-store.md`, `docs/prawne/procedura-bezpieczenstwa.md` → kod 1 (dowody/G8-proces-ci-klucz-asc.txt). Zapis 714 operacji ustawień tym kluczem 2026-10-21 jest w `docs/wydanie/dziennik.md` (wiersz 26). Nieścisłości bez wpływu: wyzwalacz tagów to linie 10–12 (nie 9–11), a build da się też uruchomić ręcznie (`workflow_dispatch`). Łagodzi: klucz trafia na dysk dopiero po archiwizacji, w kroku z sekretem tylko w `env` tego kroku; `npm ci` (linia 93) biegnie wcześniej bez sekretu, więc atak wymaga złośliwej zależności, która przetrwa na runnerze.
- `.github/workflows/testflight.yml:215` „Prepare App Store Connect API Key (.p8) after pod install & archive”

P2 i „teoretyczny” pasują do skutku.

## Uwagi wykonawcze

- Pliki śledzone bez zmian; `git fetch` w repo zaktualizował tylko gałęzie zdalne (potrzebne do porównania SHA przebiegów #95/#97), worktree w scratchpadzie usunięty na końcu.

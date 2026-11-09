# Reaudyt: Lokalizacja — Piekarz — 2026-11-09
Commit: ea249c9c · Tryb: reaudit, pętla 1 (M1, grupa C, rola 09-lokalizacja) · Baza: 2ef8870a · Środowisko: Linux 6.18 x86_64, Node v22.23.4, git, `node_modules` z `npm ci`; `gh` bez ważnego tokenu (stan CI nie sprawdzony); brak macOS, Xcode, symulatora i Expo web (Hermes, VoiceOver, zrzuty 320 pt / AX5: kroki właściciela). Sondy w `git worktree` w scratchpadzie (`wt-09c` na ea249c9c, `wt-09c-baza` na 2ef8870a); w repozytorium tylko ten raport i `dowody/*.txt` (`dowody/e0-srodowisko.txt`).

Ostatni nagłówek promptu `prompty/09-lokalizacja.md` (linia 540 z 601): „## Kontrola dowodów i sekretów przed oddaniem raportu”. Niezależność (D-015): nie czytałem `K/role/*/fix-2026-11-09/wynik*.md`, `K/M2-*.md`, `K/naprawy/`, raportów innych ról, `K/linia-bazowa.md` ani `K/soczewki/`; czytałem diffy i komunikaty commitów M2, kod, testy, `docs/decyzje.md`, `docs/lokalizacja/`, poprzedni raport roli i wskazane sekcje `K/nowe-znaleziska-M2.md`.

## Podsumowanie

Dziewięć zadań M1 grupy C dla roli 09 jest naprawionych i ma przechodzący test akceptacyjny (10 plików testów, 219/219, kod 0, `dowody/jest-akceptacyjne.txt`; test 046 osobno, 6/6, `dowody/jest-godzina-przyimek-046.txt`). `npm run check:i18n`: kod 0, 0 błędów, 155 uwag; braki dozwolone 13 497 = 409 × 33, czyli już tylko funkcje PÓŹNIEJ (`dowody/check-i18n.txt`, `dowody/check-i18n-uwagi.txt`). Wszystkie commity M2 z listy zadań są przodkami ea249c9c (po uzupełnieniu płytkiego klonu przez koordynatora; `dowody/commity-m2.txt`); dla 011 obok 831199d7 (13 poprawek zdań maszyny, D-308) jest 3e51b342 (rejestr kontroli (a) i test), dla 014 obok 8f90a72e jest 9265f84c (przekład 15 kluczy), dla 048 obok 0e952949 jest 6c5546bd (mechanizm). Próbka regresji w 6 językach o różnych pismach (tr, ru, el, ja, ko, es-419) nie znalazła nowego problemu w tekstach zadań 011, 013, 014, 046–048 (`dowody/sonda-regresja-6-jezykow.txt`). Sonda zakresów mas znalazła jedną lukę mechanizmu przeliczania, obecną już w 2ef8870a: zakres z cyrylickim „кг”/„г” w trybie imperialnym przelicza tylko górną granicę (601, P3 według D-288, istniało wcześniej). Znaleziska źródłowe 009, 011 i 012 są nadal otwarte jako P3 (D-288: M1-050, M1-052, M1-053).

| ID | Zadanie M1 | Commit M2 | Wynik | Dowód |
|---|---|---|---|---|
| 09-lokalizacja-001 | M1-audytor-generalny-011 | 831199d7, 3e51b342 | zweryfikowane | rejestr kontroli (a): 189 wpisów = 9 kluczy × 21 języków, 126 zgodne, 45 drobne, 18 poprawek wdrożonych (5 notatek, 13 zdań maszyny decyzją D-308); `tests/kontrola-a-011.test.ts` zielony |
| 09-lokalizacja-002 | M1-audytor-generalny-012 | 6c2a6e26 | zweryfikowane | `app/_layout.tsx:66` w gałęzi awaryjnej; `tests/ekran-awaryjny-jezyk-012.test.tsx` (de-DE, en-US, fr-FR) zielony |
| 09-lokalizacja-003 | M1-audytor-generalny-013 | 76610a26 | zweryfikowane | `src/lib/unit-converter.ts:298` para °F/°C; `tests/jednostki-w-tekscie-013.test.ts` (35 języków, wartość z PL) zielony; sonda: MAS-002 „2 lb 3,3 oz” w tr, ru, el, ja, ko, es-419 |
| 09-lokalizacja-005 | M1-audytor-generalny-014 | 8f90a72e, 9265f84c | zweryfikowane | `docs/lokalizacja/czeka-na-przeklad.json:3` pusta lista; test 093 sprawdza 15 kluczy ≠ EN w 33 językach; check:i18n braki 409 × 33 |
| 09-lokalizacja-004 | M1-audytor-generalny-046 | f1aa3ad7 (D-283) | zweryfikowane | `src/lib/__tests__/godzina-przyimek.test.ts` 6/6; grep „a las/às/alle/στις {godzina…}” w 6 słownikach: 0 |
| 09-lokalizacja-006 | M1-audytor-generalny-047 | 4f24b6a6 | zweryfikowane | `src/lib/format.ts:98` cykl 12 h → `numeric`; `tests/godzina-12h-047.test.ts` zielony; sonda: el „1:30 μ.μ.”, ko „오후 1:30”, es-419 „1:30 p.m.” bez „..” |
| 09-lokalizacja-007 | M1-audytor-generalny-048 | 6c5546bd, 0e952949 | zweryfikowane | `src/lib/spirala-etykieta.ts:54` wybór słowo/data; `tests/data-w-zdaniu-048.test.ts` (pl, de, es, ru, cs) zielony; sonda w 6 językach |
| 09-lokalizacja-008 | M1-audytor-generalny-049 | 3ccfd438 | zweryfikowane (decyzja) | wpis w rejestrze języków `docs/lokalizacja/jezyki.md:152` (DEC-12 b, D-286), zakres 1.0.1 z testem akceptacyjnym |
| 09-lokalizacja-010 | M1-audytor-generalny-051 | 64d2aa55 | zweryfikowane | `src/components/ImportRecipeModal.tsx:166` przez `t('DDT')`; `src/components/__tests__/import-ddt-051.test.tsx` (de) zielony |
| 09-lokalizacja-009 | M1-audytor-generalny-050 (P3, D-288) | — | nadal otwarte (P3, backlog 1.0.1) | `src/hooks/useStartPlanu.ts:56` nadal zapisuje `t('Klasyczny chleb rzemieślniczy')` |
| 09-lokalizacja-011 | M1-audytor-generalny-052 (P3, D-288) | — | nadal otwarte (P3, backlog 1.0.1) | `grep -rli pseudo scripts src app tests docs/lokalizacja` → 0 trafień |
| 09-lokalizacja-012 | M1-audytor-generalny-053 (P3, D-288) | — | nadal otwarte (P3, backlog 1.0.1) | tabela przeglądów nadal „Stan na 2026-10-21” (`docs/lokalizacja/jezyki.md:115`) |
| 09-lokalizacja-601 | nowe (próbka regresji) | — | istniało wcześniej (P3, klasa brzegowy) | `dowody/sonda-zakres-cyrylica.txt`: ru „1–4 lb 6,5 oz дрожжей” z „1–2 кг”, ten sam wynik na 2ef8870a |

Liczby: zweryfikowane 9 (wszystkie zadania M1 grupy C tej roli), nadal otwarte 3 (P3 z D-288, poza pętlą), regresja 0, istniało wcześniej 1 (601).

## Szczegóły weryfikacji zadań

- **011 (09-lokalizacja-001).** Rejestr `docs/lokalizacja/kontrola-a-m2-2026-11-09.json`: tłumaczenie zwrotne w trzech sesjach na ślepo i osobna sesja porównania sensu (to pełni rolę drugiego przeglądu dla tych 9 kluczy); warunek 7 rejestru języków dopisuje partie 09m i p8 (`docs/lokalizacja/jezyki.md:110` „kontrola (a) 9 kluczy krytycznych w 21 językach bez wcześniejszej kontroli”). D-308 (właściciel) zatwierdza 13 poprawek zdań maszyny jako wyjątek od D-287. Test sprawdza obecność wpisu dla każdej pary klucz × język i że każda poprawka jest w słowniku. Przeczytałem w próbce 9 kluczy w tr, ru, el, ja, ko, es-419: liczby (8 lat, 66 °C, 150 °F, 2 s) i siła zakazu zgodne. Uwaga bez znaleziska: test ma listę 9 kluczy i 21 języków na sztywno, więc nowy klucz krytyczny z rejestru twierdzeń nie zaczerwieni go (test akceptacyjny zadania M1 tego nie wymaga; trwała kontrola z raportu źródłowego jest słabsza).
- **012 (002).** `src/lib/i18n.ts:127` „export function ustawJezykSystemu(): void {” bez odczytu bazy; ekran awaryjny tłumaczy wszystkie teksty i alerty przez `t()`. Słowniki ładują się synchronicznie (`slownik()`), więc pierwszy render jest już w języku systemu.
- **013 (003).** Para „X °F, czyli około Y °C” zostaje bez drugiego °F; masa z grupowaniem tysięcy liczy się jako tysiące (`src/lib/unit-converter.ts:220`). Test 013 porównuje z wartością z PL. W próbce: n1/n2 i MAS-002 w 6 językach dają te same uncje co EN. Luka zakresów w cyrylicy: 601 (nie regresja).
- **014 (005).** 15 kluczy ma własny tekst w 33 językach; drugi przegląd AI przekładu M2 p2 z 4 poprawkami terminologii (8f90a72e). Test akceptacyjny w części „check:i18n wykrywa tekst EN równy…” spełnia test 093 dla tych 15 kluczy, nie ogólna reguła bramki; ogólny brak kontroli „tekst jak w źródle” należy do 09-lokalizacja-011 (M1-052).
- **046 (004).** Wariant (a) tylko słowniki, decyzja D-283; test zakazuje rodzajnika przed godziną w es, es-419, pt, pt-BR, it, el. Formy „Listo mañana, 1:30 p.m.”, „Έτοιμο αύριο την ώρα 1:30 μ.μ.” w sondzie poprawne. Test sprawdza wzorzec zakazany, nie listę form poprawnych z raportu źródłowego — wystarcza dla wybranego wariantu (a). Wpis decyzji: `docs/decyzje.md:1657`.
- **047 (006).** `src/lib/format.ts:90` „const TIME_12: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };”; podwójną kropkę usuwa `t()` (`src/lib/i18n.ts:183`). Działanie na Hermes iOS zależy od `resolvedOptions().hourCycle` — do sprawdzenia na urządzeniu (niżej).
- **048 (007).** Data odległa po dwukropku, słowo dnia w zdaniu (`src/lib/spirala-etykieta.ts:43` `czyDzienSlowem`). Pozostałe miejsca z `dzienSlownie` mają dwukropek przed `{dzien}` albo datę na początku wiersza (`StarterSetupCard`, `FridgeWakeStatus`, `PlanyWypiekow`, `kalendarz-teksty`) — bez mianownika po czasowniku.
- **049 (008).** Decyzja właściciela DEC-12 b (D-286), wpis w rejestrze języków z zakresem 1.0.1 i testem na później. Wynik „zweryfikowane” dotyczy zapisu decyzji; kod bez zmian zgodnie z decyzją.
- **051 (010).** Etykieta przez `t('DDT')`; test w de. W de wynik to „Teigtemp.: 24,5 °C” (kropka skrótu przed dwukropkiem) — poprawne typograficznie, bez znaleziska.

## Dodatki: znaleziska M2 według D-288

Klasyfikacja według D-288 (`docs/decyzje.md:1702`): nowe P2 → P3 z klasą (backlog 1.0.1), chyba że utrata danych, prywatność albo bezpieczeństwo.

| Znalezisko M2 | Poziom M2 | Klasyfikacja D-288 | Stan na ea249c9c | Dowód |
|---|---|---|---|---|
| M2-koordynator-napraw-002 | P2, realny | P3, klasa: realny (backlog 1.0.1); bez wpływu na dane, prywatność, bezpieczeństwo | nadal otwarte | sr miesza „g” i „г”: `src/lib/i18n-slowniki/sr/czesc-4.ts:177` „'Mąka: {amount} g': 'Брашно: {amount} g',” obok `src/lib/i18n-slowniki/sr/czesc-9.ts:149` „'Woda: {amount} g': 'Вода: {amount} г',” (sr: 5 × „g”, 12 × „г”; bg: 1 × „g”, 16 × „г”); ro „între 0–150%”: `src/lib/i18n-slowniki/ro/czesc-7.ts:140` „Procentul de maia trebuie să fie între 0–150%”; sl „kvas” 90 × obok „kvasovke” 12 × |
| M2-006 | P3, dokumentacja | P3, klasa: dokumentacja (już nadana) | zweryfikowane (zamknięte sprostowaniem) | `docs/decyzje.md:1769` „Sprostowanie D-302:** „D-280 pkt 5” w D-302 to D-276 pkt 5 (M2-006).”; D-276 pkt 5 „bez prac nad 1.1 do wydania 1.0” (`docs/decyzje.md:1607`); treść D-302 bez zmian (`docs/decyzje.md:1713`) |

## Próbka regresji

- **Słowniki zmienione od 2ef8870a:** 659 plików w `src/lib/i18n-slowniki`, 700 w `src/lib` (`git diff --stat 2ef8870a..ea249c9c -- src/lib`). Losowanie (`shuf`, ziarno 20261109): tr z języków łacińskich, ru z cyrylicy, ja i ko z CJK; dołożone el (jedyny grecki) i es-419 (miejsce zadań 046/047). Sonda w kopii roboczej: `dowody/sonda-regresja-6-jezykow.test.ts.txt`, wynik `dowody/sonda-regresja-6-jezykow.txt` (jest kod 0). Sprawdzone: 011 — 9 kluczy krytycznych; 013 — klucze z °F, n1, n2, MAS-002 w trybie imperialnym; 014 — 15 kluczy (0 równych EN); 046/047 — `formatTime` 13:30 i 01:30 oraz zdania z `{godzina}` (0 „..”, 0 „a las”, 0 „στις”); 048 — 5 nowych kluczy z rzeczywistą datą `Intl`. Wynik: bez nowego problemu w tych tekstach; w ja zdanie z `etykietaPlanuPrzedStartem` ma spację po „。” (łączenie zdań spacją, mechanizm sprzed 2ef8870a, kosmetyka bez znaleziska).
- **Sonda zakresów mas** (wszystkie 5 kluczy PL z zakresem g/kg, 35 języków, tryb imperialny): ru, uk, bg po 5 kluczy i sr 4 klucze z nieprzeliczoną dolną granicą; pozostałe 31 języków 0 → 601.
- **sl po poprawkach kontroli (a):** zdania krytyczne mają „pekač kruha”, a 3 klucze karty maszyny nadal „pekača” bez „kruha” (np. `src/lib/i18n-slowniki/sl/czesc-13.ts:24` „'Pojemność maszyny': 'Zmogljivost pekača',”). Znane: drugi przegląd AI tylko próbką (09-lokalizacja-012, M1-053), bez nowego ID.
- **Trzy pozycje listy kontrolnej spoza zmienionych plików** (`app.json`, `src/lib/intl-polyfills.ts`, `scripts/check-i18n.mjs` bez zmian od 2ef8870a):
  - LOK-02: `app.json` ma 35 `locales` (każdy z nazwą), `CFBundleAllowMixedLocalizations` (`app.json:69`), `supportedLocales` = 35 kodów `ACTIVE_LANGS`, `supportsRTL: false` (`app.json:238`) — ok.
  - LOK-05: polyfill jako pierwszy import (`app/_layout.tsx:1` „import '../src/lib/intl-polyfills';”); `plural-intl` i `i18n-35-jezykow` 31/31 (`dowody/jest-lok05-lok02.txt`) — ok w Jest; Hermes bez samosprawdzenia (09-lokalizacja-011).
  - LOK-15: `check:i18n` w `npm run verify`, a `verify` w CI (`package.json:35`, `.github/workflows/ci.yml:52`) — ok; brak pseudolokalizacji i sierot jako błędu: 09-lokalizacja-011 (M1-052).

## Znaleziska

### 09-lokalizacja-601 · W trybie imperialnym zakres mas z „кг”/„г” w ru, uk, bg, sr traci dolną granicę („1–4 lb 6,5 oz дрожжей” zamiast „2 lb 3,3 oz–4 lb 6,5 oz”)
- Pozycja listy kontrolnej: LOK-07
- Poziom: P3 (z P2 według D-288; klasa: brzegowy) — liczba myli, ale tylko w notatkach produkcyjnych katalogu, poza rachunkiem receptury; bez wpływu na dane, prywatność i bezpieczeństwo (temperatury i zdanie BEZ-WRZ-001 przeliczają się poprawnie)
- Realność: brzegowy (język cyrylicki i ręcznie wybrany tryb imperialny) · Pewność: wysoka
- Rodzaj: D
- Dowód: `src/lib/unit-converter.ts:221` „const RE_ZAKRES_G = new RegExp(`${LICZBA_M}(\\s*[–-]\\s*)${LICZBA_M}\\s*(kg|g)” zna zakres tylko z łacińskim „kg/g”, a `src/lib/unit-converter.ts:241` „const RE_MASA_INNA = new RegExp(`${LICZBA_M}(\\s*)(кг|г|γρ|グラム|그램|公克|克)” przelicza pojedynczą liczbę, więc w „1–2 кг” zamienia tylko „2 кг”. Sonda: `formatTextUnits('1–2 кг дрожжей','imperial','1–2 kg drożdży')` = „1–4 lb 6,5 oz дрожжей”, a z „kg” = „2 lb 3,3 oz–4 lb 6,5 oz drożdży”; ru notatki: „0,08–3,5 oz тмина”, „275–12,3 oz ржаной или пшеничной муки”, „0,70–1 lb 15… пшеничной муки” (`dowody/sonda-zakres-cyrylica.txt`, jest kod 0 na ea249c9c i na 2ef8870a, ten sam wynik).
- Mechanizm: dwa wzorce mas (łaciński z zakresem, pozostałe pisma bez zakresu); sonda wszystkich 5 kluczy PL z zakresem mas w 35 językach → ru 5, uk 5, bg 5, sr 4 klucze, pozostałe 31 języków 0. Trwała kontrola 013 tego nie łapie: `tests/jednostki-w-tekscie-013.test.ts:12` „const RE_MASA_PL = /(\d{1,3}(?:[ \u00a0]\d{3})+|\d+(?:,\d+)?)\s*(kg|g)” bierze z „1–2 kg” tylko „2 kg”, więc dolna granica nie jest wartością oczekiwaną.
- Powraca: nie (rodzina 09-lokalizacja-003; poprawka 013 nie objęła zakresów poza łacinką) → trwała kontrola: test 013 z zakresami (obie granice z PL) w 35 językach.
- Wzorzec lub źródło: zasada roli 6; LOK-07.
- Kroki w aplikacji: język ru/uk/bg/sr, Ustawienia → jednostki imperialne → receptury katalogu z notatką produkcyjną (Rupjmaize, obwarzanek, kołocz, chleb z opisem zaczynu) → notatka.
- Istniało wcześniej: tak — ten sam wynik sondy na 2ef8870a (`git worktree` na 2ef8870a, `dowody/sonda-zakres-cyrylica.txt`); poza bieżącą pętlą, do decyzji właściciela.
- Opcje: (a) `RE_ZAKRES_G` z symbolami innych pism (кг, г, γρ…) i ta sama zasada „masa ze źródła” co w `RE_MASA_INNA` — mała zmiana mechanizmu; (b) w 4 słownikach „kg/g” łacińskie w notatkach — szybciej, mechanizm zostaje, niespójne z resztą słownika (M2-koordynator-napraw-002); Rekomendacja: (a) w 1.0.1.
- Test akceptacyjny: każdy zakres mas z klucza PL ma w trybie imperialnym obie granice w uncjach/funtach w 35 językach; sonda `dowody/sonda-zakres-cyrylica.test.ts.txt` daje 0 kluczy w każdym języku.
- Status: otwarte

## Do sprawdzenia (pewność ≤ 80%)

- 047 na Hermes iOS: `opcjeGodziny` zależy od `resolvedOptions().hourCycle` (`src/lib/format.ts:98`). Jeśli Hermes na iOS go nie zwraca, zostaje `2-digit` i „01:30 PM” wraca na urządzeniu. Krok właściciela: zrzut „Dziś” z planem na 13:30 przy regionie US (en) i el.
- 046: brzmienie nowych form bez rodzajnika w 6 językach bez przeglądu natywnego (D-283 „Otwarte”).

## Kontrola dowodów i sekretów

Pliki dowodów (`dowody/`): `e0-srodowisko.txt`, `check-i18n.txt` (`npm run check:i18n`, kod 0), `check-i18n-uwagi.txt`, `jest-akceptacyjne.txt` (kod 0), `jest-godzina-przyimek-046.txt` (kod 0), `jest-lok05-lok02.txt` (kod 0), `commity-m2.txt`, `sonda-regresja-6-jezykow.txt`, `sonda-regresja-6-jezykow.test.ts.txt`, `sonda-zakres-cyrylica.txt`, `sonda-zakres-cyrylica.test.ts.txt`, `npm-test.txt` (pełny `npm test`, raz na grupę: kod 1, 6799/6800, 649/650 zestawów; nazwa nieudanego zestawu nie trafiła do pliku, bo zapisałem tylko 15 ostatnich linii; przebieg szedł równolegle z sondami Jest i z dociąganiem historii przez koordynatora, więc możliwa niestabilność; 15 zestawów korzystających z git przechodzi osobno 445/445, `jest-git-testy.txt`; wszystkie testy akceptacyjne grupy C zielone osobno). Nieudanego testu nie zidentyfikowałem: „nie sprawdzono”, do powtórzenia `npm test` przez koordynatora. Sekretów w raporcie i dowodach brak (wzorce skryptu).

Wynik `node K/narzedzia/sprawdz-raport.mjs <raport> /home/user/piekarz R/09-lokalizacja --rola 09-lokalizacja`:

```
OK: odwołania, cytaty, pliki dowodów i sekrety sprawdzone; format raportu 09-lokalizacja
kod wyjścia: 0
```

`git status --porcelain` w repozytorium po pracy: pusty (pliki śledzone nietknięte; `K` jest w `.git/info/exclude`); kopie robocze sond usunięte (`git worktree remove`).

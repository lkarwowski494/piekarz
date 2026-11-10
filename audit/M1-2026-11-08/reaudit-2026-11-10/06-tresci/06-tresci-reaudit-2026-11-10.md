# Reaudyt: Treści i wiedza domenowa — Piekarz — 2026-11-10
Commit: 1c723632 · Tryb: reaudit (pętla 2, baza ea249c9c) · Grupa G2 (role 06 i 09 w jednym kontekście: wyjątek nazwany, KO-013) · Środowisko: Linux, Node, Jest w kopii roboczej WT; bez symulatora iOS i bez urządzenia; źródeł w sieci nie otwierano (polecenie grupy pkt 7: sprawdzane jest wykonanie decyzji D-317, nie jej zasadność) — `dowody/e0-srodowisko.txt`

## Podsumowanie
Oba zadania roli (088 = 06-tresci-601, 089 = 06-tresci-602) są wykonane tak, jak zapisuje D-317: testy akceptacyjne istnieją, sprawdzają to, co mówią tytuły, przechodzą na 1c723632 (6 plików, 94 testy, kod 0) i padają na kodzie sprzed poprawki z właściwego powodu (12 z 22 czerwonych na ea249c9c: 204 °C i 250 °C spoza danych receptur, `powodBezPlanu` = null, eksport osi czasu). Sonda planu dla trzech receptur żytnich przy 50% żyta daje krok nagrzewania i pieczenia bez liczb i bez słowa „brioszk”, z czasem kroku równym danym receptury. Trzy nowe znaleziska, wszystkie P3 (D-288): zablokowany plan brioszki nadal pokazuje oś czasu z godzinami (701), odesłanie do karty „O recepturze” nie ma dojścia z prowadzenia (702), skrypt kontroli treści PL/EN zmienił kod wyjścia z 0 na 1 po dodaniu pliku treści 089 (703, regresja procesu). Otwartych P0/P1 tej roli nie ma.

| ID | Zadanie M1 / commit | Wynik | Dowód |
|---|---|---|---|
| 06-tresci-601 | M1-audytor-generalny-088 / d04c94ca | zweryfikowane | test `tests/pieczenie-bez-cudzych-liczb-088.test.ts` PASS (`dowody/jest-akceptacyjne-088-089.txt`), czerwony na ea249c9c (`dowody/jest-czerwone-na-bazie-ea249c9c.txt`); sonda `dowody/sonda-088-plany.txt` sekcja A; warunek w `src/core/pieczenie-receptury.ts:69` |
| 06-tresci-602 | M1-audytor-generalny-089 / 3e05396e, f6291d8f | zweryfikowane (test akceptacyjny opcji a i D-317 pkt 1); reszta → 06-tresci-701 | testy `tests/brioszka-bez-planu-089.test.ts`, `tests/brioszka-bez-eksportu-089.test.tsx`, `tests/kontrakt-receptury-plan-061.test.ts` PASS, dwa pierwsze czerwone na ea249c9c; blokada w `src/lib/plan-receptury.ts:86`; sonda ekranu `dowody/sonda-089-ekran-planu-brioszki.txt` |
| 06-tresci-701 | nowe (reszta 089) | nadal otwarte w części, P3 | `dowody/sonda-089-ekran-planu-brioszki.txt` |
| 06-tresci-702 | nowe (skutek opcji a w 088) | nowe, P3 | `dowody/sonda-088-plany.txt`, `src/components/receptury/ORecepturze.tsx:46` |
| 06-tresci-703 | nowe (3e05396e) | regresja procesu, P3 | `dowody/kontrole-pl-en.txt` (kod 1; na ea249c9c kod 0) |

Liczby (2 ID źródłowe z zadań): zweryfikowane 2, nadal otwarte 0, regresja 0, istniało wcześniej 0. Nowe: 3 × P3 (701 reszta zadania 089, 702, 703 regresja procesu). Znane i otwarte poza zadaniami grupy (nie zgłaszam ponownie): 06-tresci-603 — potwierdzone sondą dla durum (sekcja C: nagrzewanie stali dostaje zdanie KRO-POC-011 o garnku), łotewski po poprawce 088 zdania o garnku przy nagrzewaniu już nie ma, zostaje zdanie o nacięciu KRO-POC-012 przy pieczeniu na stali; 06-tresci-604 i M2-p4-N5 — nie sprawdzano ponownie.

## Weryfikacja zadań

### 06-tresci-601 (M1-audytor-generalny-088)
- **Test akceptacyjny wprost.** `tests/pieczenie-bez-cudzych-liczb-088.test.ts`: (1) lista receptur z tekstem ze źródła = receptury wektora D-304 poza garnkiem (brioszka, durum); (2) dla każdej receptury z zakwasem liczby °C i min w krokach nagrzewania i pieczenia należą do danych receptury albo tekst nie ma liczb, bez „brioszk” poza brioszką; (3) osobno trzy receptury żytnie przy 50% żyta przez `calculateDoughRecipe` i `pieczenieDlaPlanu` (ta sama droga co ekran planu); (4) tekst bez liczb dosłownie z `docs/tresci/pl/pieczenie-receptur.md` i `docs/tresci/en/pieczenie-receptur.md`. Test sprawdza to, co mówi tytuł zadania. Na 1c723632: PASS. Na ea249c9c (pliki testów z 1c723632 skopiowane do sondy): 7 z 8 grup 088 czerwonych, m.in. „Expected value: 204 / Received array: [230, 195, 15, 45, 60]” dla rye_100_pan i „Expected value: 250 / Received array: [225, 225, 0, 90, 90]” dla łotewskiego.
- **Sonda z polecenia (pkt 7).** `dowody/sonda-088-plany.txt` (skrypt: `dowody/g2-sonda-088.test.ts.txt`), plan liczony funkcjami `pieczenieDlaPlanu` → `calculateReverseSchedule` → `stepsFromSchedule`:

| Receptura (50% żyta + 50% pszennej 650) | Dane receptury | Krok nagrzewania | Krok pieczenia (id, czas) | Liczby spoza danych | „brioszk” |
|---|---|---|---|---|---|
| rye_100_pan | keksówka, 230 °C 15 min + 195 °C 45 min | bez liczb, odesłanie do karty receptury | bake_forma, 60 min, bez liczb | brak | nie |
| borodinsky_rye | keksówka, 230 °C 15 min + 190 °C 50 min | jak wyżej | bake_forma, 65 min, bez liczb | brak | nie |
| latvian_scalded_rye | stal, 225 °C 90 min | jak wyżej | bake_stal, 90 min, bez liczb | brak | nie |

  Czas kroku pieczenia = suma czasów z danych receptury (60, 65, 90 min). Ta sama treść wychodzi drogą Stolnicy bez migawki (`stepsForBake`, `src/data/bake-session-store.ts:47`). Tekst po id receptury, nie po naczyniu: `src/lib/pieczenie-planu.ts:30` (lista dwóch id) i warunek `!p.tekstZrodla` w `src/core/pieczenie-receptury.ts:69`.
- **Inne receptury w keksówce i na stali (sekcja C sondy; katalog ma pięć receptur z zakwasem poza garnkiem).** Brioszka (wektor D-304): 204 → 177 °C i 20 + 8–10 min, tekst ze źródła, dane receptury 177 °C / 28 min — bez zmian wobec D-304 (liczba 204 pochodzi z twierdzenia PIE-BRI-001, nie z pól receptury; wyjątek zapisany w D-317 pkt 3). Durum (wektor): 250 °C = dane receptury. rye_100_pan, borodinsky_rye, latvian_scalded_rye przy wymuszonym planie pszennym z oryginalnymi mąkami: krok bez liczb jak w tabeli. Sześć receptur w garnku: tekst PIE-GAR-001 bez zmian (test `tests/pieczenie-receptur-008.test.ts` PASS).
- **Para zdań.** „Nagrzej piekarnik do temperatury pieczenia podanej w …” + „Piecz w temperaturze i przez czas podane w …”: karta receptury pokazuje jedną linię „Pieczenie” z dwiema temperaturami i dwoma czasami (`src/components/receptury/ORecepturze.tsx:46`), więc odesłanie prowadzi do pełnych danych; zdania nie niosą faktu dziedzinowego (znacznik `[T:-]` w pliku treści). Wyjaśnienie celu kroku przy nagrzewaniu bez liczb: brak (null), bez zdania o garnku.
- **Zgodność z D-317 pkt 2 i 3:** tak (tekst z liczbami tylko dla brioszki i durum; id kroków i czasy bez zmian).

### 06-tresci-602 (M1-audytor-generalny-089, DEC-21 = a)
- **Testy akceptacyjne wprost.** `tests/brioszka-bez-planu-089.test.ts`: `powodBezPlanu` dla brioszki zwraca powód (także z wersją „zakwas”), lista receptur z planem = 10 pozostałych, PL i EN dosłownie z `docs/tresci/pl/powody-bez-planu.md` i odpowiednika EN. `tests/brioszka-bez-eksportu-089.test.tsx`: ekran planu z brioszką — start nieaktywny, bez „Dodaj do kalendarza” i „Kopiuj jako tekst”; receptura z planem ma oba. `tests/kontrakt-receptury-plan-061.test.ts`: F-26 = 10 z planem, 1 z zakwasem bez planu, 15 bez zakwasu. Wszystkie PASS; na ea249c9c czerwone: „Expected: (powód) / Received: null”, katalog z brioszką na liście receptur z planem, eksport obecny.
- **Wykonanie D-317 pkt 1 — drogi do planu brioszki (czytane w kodzie 1c723632):**

| Droga | Stan | Dowód |
|---|---|---|
| Ekran receptury, „Ułóż plan” | zablokowane, powód pod przyciskiem i w podpowiedzi VoiceOver | `src/components/calculator/CalculatorActionButtons.tsx:37`, `src/lib/plan-receptury.ts:86` |
| Dziennik, „Piecz ponownie” → ekran planu | „Zacznij wypiek” nieaktywny, „Zaplanuj”, kalendarz i kopiowanie nieobecne; **oś czasu z godzinami widoczna** → 06-tresci-701 | `dowody/sonda-089-ekran-planu-brioszki.txt` |
| „Zacznij wypiek” i „Zaplanuj” (hook startu) | zablokowane tą samą flagą | `src/hooks/useStartPlanu.ts:74`, `src/hooks/useStartPlanu.ts:138` |
| Lista receptur | lista nie ma oznaczeń planu; blokada dopiero na ekranie receptury | brak wywołań `powodBezPlanu` poza dwoma ekranami (grep) |
| Zapisany plan i trwający wypiek brioszki sprzed poprawki | działają dalej z krokami brioszki (rośnięcie 20 min) — tak chce D-317 („plany zapisane i wypieki zaczęte przed zmianą działają dalej”) | sonda `dowody/sonda-088-plany.txt` sekcja E; `src/data/__tests__/brioszka-wznowienie-m2-012.sqlite.test.ts` PASS |
| Głęboki link | trasy nie przyjmują id receptury (parametry tylko: `wypiek` na Stolnicy, `wpis` w Dzienniku, `starterId` w Doktorze zakwasu); ekran planu bierze recepturę z pamięci procesu | grep `useLocalSearchParams` |
| Import pakietu danych | przywraca zapisane plany i wypieki (087) — to droga „zapisany plan”, zgodna z D-317 | — |
| Tryb maszyny, wersja drożdżowa | brioszki nie dotyczy (brak wersji drożdżowej i wpisu maszyny) | `src/recipes/maszyna-receptur.ts:45` |
| Kopia „Zapisz jako moją”, plan innej receptury w stosie | znane: 06-tresci-604, M2-p4-N5 — nie zgłaszam ponownie | `nowe-znaleziska-M2.md` (tytuły) |

- **Rejestr:** PIE-BRI-900 zostaje „otwarte” z adnotacją o blokadzie (diff `docs/tresci/rejestr.json`, 1 linia) — zgodne z D-317.

## Próbka regresji
- Pliki obszaru zmienione od ea249c9c: `docs/tresci/pl/pieczenie-receptur.md`, `docs/tresci/pl/powody-bez-planu.md`, ich odpowiedniki EN, `docs/tresci/rejestr.json` (1 linia), `src/core/pieczenie-receptury.ts`, `src/core/po-co-ten-krok.ts`, `src/lib/pieczenie-planu.ts`, `src/lib/plan-receptury.ts`. Przejrzane w całości (diff commitów d04c94ca, 3e05396e, f6291d8f). Nowy problem: 703 (plik treści 089 nie przechodzi skryptu).
- Pozycje listy kontrolnej spoza zmienionych plików:
  - TRE-13 (tekst w produkcie = zweryfikowany): `tests/pieczenie-receptur-008.test.ts` i `tests/tresci-produkt-044.test.ts` PASS — teksty wektora D-304 i zdanie stałego dnia karmienia bez zmian. Ok.
  - TRE-10 (treść krytyczna): `git diff --stat ea249c9c..1c723632 -- docs/tresci` nie obejmuje żadnego pliku `zakwas-bezpieczenstwo.md`; `scripts/kontrole-tresci.mjs` na 33 katalogach językowych: 41 błędów, wszystkie „przegląd dotyczy innej wersji zdań” — tyle samo co w pętli 1 (`dowody/kontrole-33-jezyki.txt`); `tests/tresci-tlumaczen-135.test.ts` PASS. Bez zmiany.
  - TRE-06 (jedna wielkość, jedna wartość): sonda sekcje B–D — żaden krok pieczenia receptury spoza wektora nie podaje temperatury innej niż karta receptury. Zauważone, istniało wcześniej i leży poza D-304 (D-256, dane żyta bez źródła): plan żytni przy oryginalnych mąkach ma krok `rye_bake` 45 min przy danych receptury 60, 65 i 90 min (sekcja B), a krok pieczenia planu drożdżowego ma pustą instrukcję (sekcja D). Nie zgłaszam jako nowe: stan z ea249c9c, poza zadaniami grupy; do decyzji M1, czy jest już w planie napraw.

## Znaleziska

### 06-tresci-701 · Zablokowany plan brioszki nadal pokazuje oś czasu z godzinami i czasami bez źródła (rośnięcie w keksówce 20 min), a powód blokady odsyła „wyżej”, gdzie na tym ekranie jest właśnie ta oś
- Pozycja listy kontrolnej: TRE-07
- Poziom: P2 → P3 według D-288 (klasa: treść-kroku / plan; bez utraty danych, prywatności i bezpieczeństwa)
- Realność: brzegowy (wejście tylko z Dziennika przez „Piecz ponownie” przy wpisie brioszki albo przy planie w stosie) · Pewność: wysoka
- Rodzaj: P
- Dowód: `dowody/sonda-089-ekran-planu-brioszki.txt` (render ekranu `app/(tabs)/receptury/harmonogram.tsx` z brioszką ustawioną jak z „Piecz ponownie”): widoczne „Start dziś o 10:42”, „Całość trwa 24 h 8 min.”, osiem wierszy osi czasu z godzinami, w tym „Rośnięcie w keksówce”, 07:17–07:37, 20 min; pod przyciskiem „Zacznij wypiek” powód z 089. Blokada obejmuje tylko start i eksport: `app/(tabs)/receptury/harmonogram.tsx:305` (kopiowanie) i `app/(tabs)/receptury/harmonogram.tsx:310` (kalendarz); karta osi czasu nie zależy od tej flagi.
- Mechanizm: `powodBezPlanu` wyłącza akcje, a ekran dalej liczy i rysuje harmonogram z szablonu brioszki; `grep -n bezZakwasu "app/(tabs)/receptury/harmonogram.tsx"` → 5 trafień (linie 112, 212, 305, 310, 317), żadne przy karcie osi czasu.
- Powraca: tak (M1-audytor-generalny-089; przegląd ścieżki planu P2-1 zamknął tylko eksport) → trwała kontrola: test ekranu niżej.
- Wzorzec lub źródło: D-317 pkt 1 (cel: brak planu do zamknięcia PIE-BRI-900); TRE-07 (uproszczenie bez źródła nie trafia do użytkownika).
- Kroki w aplikacji: Dziennik → wpis wypieku brioszki → „Piecz ponownie” → ekran „Plan wypieku”.
- Opcje: (a) przy powodzie z `powodBezPlanu` ukryć kartę osi czasu, opis startu i ustawienia, zostawić nazwę receptury i powód z brzmieniem pasującym do ekranu planu — spójne z 089, mała zmiana roli 08 + tekst roli 04; (b) zostawić oś, dodać nad nią zdanie, że czasy są szacunkowe — to odrzucona w D-317 opcja (b) 089; (c) zostawić — właściciel jako jedyny tester widzi czasy, których plan miał nie pokazywać. Rekomendacja: (a), backlog 1.0.1 albo razem z M2-p4-N5.
- Test akceptacyjny: render ekranu planu z brioszką: brak elementów `timeline-item-*`, brak tekstów „Start … o …” i „Całość trwa …”; powód blokady widoczny.
- Status: otwarte

### 06-tresci-702 · Krok pieczenia odsyła do karty „O recepturze”, której nie ma na ekranie prowadzenia ani planu i do której krok nie prowadzi
- Pozycja listy kontrolnej: TRE-08 (cudzy obszar: nawigacja i brzmienie — rola 04, SP-09/SP-11; raportu roli 04 z tego commitu nie czytam, zgłaszam z jej ID)
- Poziom: P3 (klasa: treść-kroku / nawigacja)
- Realność: brzegowy (trzy receptury żytnie po zmianie mąk do żyta ≤ 50%) · Pewność: wysoka co do braku dojścia w kodzie, średnia co do skutku (bez urządzenia)
- Rodzaj: P
- Dowód: teksty kroków w `dowody/sonda-088-plany.txt` sekcja A; karta istnieje tylko na ekranie receptury: `grep -rn "karta-o-recepturze\|ORecepturze" src/components/stolnica app/stolnica.tsx` → 0 trafień; jedyne użycie komponentu to ekran receptury (`app/(tabs)/receptury/receptura.tsx:308`). Dane, do których krok odsyła: `src/components/receptury/ORecepturze.tsx:46`.
- Mechanizm: opcja (a) z 088 zastąpiła liczby odesłaniem; w chwili pieczenia użytkownik jest w prowadzeniu na Stolnicy i musi sam przejść do zakładki Receptury, otworzyć recepturę i przewinąć do karty.
- Powraca: nie
- Wzorzec lub źródło: D-317 pkt 2 (odesłanie zamiast liczb — decyzja wykonana; znalezisko dotyczy dojścia, nie decyzji).
- Kroki w aplikacji: Receptury → „Tradycyjny chleb 100% żytni razowy” → Zmień składniki (50% żyta) → Ułóż plan → Zacznij wypiek → krok „Pieczenie”.
- Opcje: (a) w karcie kroku z takim tekstem pokazać wiersz „Pieczenie” z danych receptury (te same pola co karta, format jednostek użytkownika) — bez nowych twierdzeń, praca 04 + 08; (b) dodać w kroku dojście do receptury — mniej pracy, wyjście z prowadzenia; (c) zostawić — krok jest prawdziwy, ale niepełny. Rekomendacja: decyzja roli 04, backlog 1.0.1.
- Test akceptacyjny: z ekranu kroku „Pieczenie” receptury spoza wektora D-304 temperatura i czas z danych receptury są widoczne albo osiągalne jednym stuknięciem.
- Status: otwarte

### 06-tresci-703 · Skrypt kontroli treści na PL i EN kończy się kodem 1: nowy plik treści 089 ma dwa zdania pod jednym znacznikiem
- Pozycja listy kontrolnej: TRE-01 (moduł kontrole-mechaniczne)
- Poziom: P3 (klasa: proces / treść; użytkownik nie widzi skutku)
- Realność: realny · Pewność: wysoka
- Rodzaj: D
- Dowód: `node scripts/kontrole-tresci.mjs docs/tresci/rejestr.json docs/tresci/pl docs/tresci/en` → kod 1, „2 błędów, 2 uwag” (`dowody/kontrole-pl-en.txt`): `docs/tresci/pl/powody-bez-planu.md:6` „Plan dla tej receptury na zakwasie czeka na czasy rośnięcia ciasta.” — zdanie bez znacznika; to samo w `docs/tresci/en/powody-bez-planu.md:6`. Ta sama komenda w sondzie na ea249c9c: 0 błędów, 2 uwagi, kod 0.
- Mechanizm: linia 6 ma dwa zdania i jeden znacznik `[T:-]`; konwencja skryptu wymaga znacznika po każdym zdaniu. Żaden test Jest nie uruchamia skryptu na PL i EN (`tests/tresci-tlumaczen-135.test.ts:21` wyłącza oba języki), więc bramka tego nie złapała.
- Powraca: tak (06-tresci-009 w pętli 1 miało dowód „PL+EN kod 0”) → trwała kontrola: test uruchamiający skrypt na `docs/tresci/pl` i `docs/tresci/en`.
- Wzorzec lub źródło: moduł kontrole-mechaniczne, „Konwencja”: każde zdanie kończy się znacznikiem.
- Kroki w aplikacji: brak (kontrola repo).
- Opcje: (a) drugi znacznik `[T:-]` po pierwszym zdaniu w obu plikach i dopasowanie funkcji czytającej sekcję w teście 089 (już usuwa znaczniki tylko z końca linii — do sprawdzenia przy poprawce) oraz test skryptu na PL/EN; (b) zostawić. Rekomendacja: (a), rola 06, kilka minut.
- Test akceptacyjny: komenda z dowodu kończy się kodem 0; test Jest uruchamia ją dla PL i EN.
- Status: otwarte

## Do sprawdzenia (pewność ≤ 80%)
- Migawki kroków zapisane przed d04c94ca (wypiek żytni z żytem ≤ 50% zaczęty na starszym buildzie) niosą dawny tekst pieczenia; na danych testowych właściciela mało prawdopodobne, bez urządzenia nie sprawdzono.
- Źródeł PIE-BRI-001, PIE-BRI-002 i KAT-ALT-005 nie otwierano ponownie (polecenie grupy pkt 7); werdykty z pętli 1 zostają.
- Pełnego `npm test` i `npm run verify` nie uruchamiano (robi to G4).

## Kontrola dowodów i sekretów
`node /home/user/piekarz/audit/M1-2026-11-08/narzedzia/sprawdz-raport.mjs <ten raport> WT /home/user/piekarz/audit/M1-2026-11-08/reaudit-2026-11-10/06-tresci --rola 06-tresci` → kod 0, wynik: OK: odwołania, cytaty, pliki dowodów i sekrety sprawdzone; format raportu 06-tresci (pierwszy przebieg: 3 błędy raportu — dwa cytaty przypisane do złej linii i brak pliku wyniku — poprawione w raporcie; `dowody/sprawdz-raport.txt`).

`git -C WT status --porcelain` na początku: 0 linii (`dowody/e0-srodowisko.txt`); na końcu: 0 linii (HEAD 1c723632; oba worktree sond usunięte). Repo treści: brak osobnego (treści w `docs/tresci/`). Sekretów w raporcie i dowodach brak. W czytanych plikach repo nie znaleziono poleceń skierowanych do agenta (zasada 16).

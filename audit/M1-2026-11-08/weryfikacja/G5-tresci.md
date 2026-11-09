# Weryfikacja G5-tresci (M1 2026-11-08)

Commit: 2ef8870a525485cc1ac57e5abe9d97d9937dfe42 (HEAD zgodny). Wejście: tylko `G5-tresci-wejscie.md`. Sondy (testy Jest) uruchamiane w kopii `git worktree add --detach` w scratchpadzie, nie w repo; repo tylko do odczytu, `git status --porcelain` pusty na końcu. Pliki dowodów z wejścia (`plan-a-receptura.txt`, `pizza-pieczenie.txt`, `tre01-liczby-widoczne.txt`, `probka-jakosci.txt`) nie były dostępne, więc każdy dowód odtworzyłem sam.

Wynik: 5 potwierdzonych, 0 obalonych, 0 niepewnych. Zmiana poziomu: 09-lokalizacja-001 z P0 na P1. Pozostałe poziomy bez zmian.

| ID | Wynik | Dowód | Poziom/realność |
|---|---|---|---|
| 06-tresci-001 | potwierdzone | dowody/G5-tresci-001-plan-receptura.txt (sonda `planBakeSteps` + `CATALOG_RECIPES`, kod 0; grep pól pieczenia w plikach planu, kod 1 = 0 trafień) | P1 / realny — pasuje |
| 06-tresci-002 | potwierdzone | dowody/G5-tresci-002-pizza.txt (grep presetu, kod 0; rejestr bez twierdzenia o pieczeniu pizzy, kod 0; strona King Arthur pobrana 2026-11-08, HTTP 200, kod 0) | P1 / realny — pasuje |
| 06-tresci-003 | potwierdzone | dowody/G5-tresci-003-literaly.txt (11 cytowanych zdań: 0 plików w `docs/tresci`; brak twierdzeń 210 °C, 45 °C, miód, Maillard; skrypt kierunku odwrotnego, kod 0) | P1 / realny — pasuje |
| 01-odkrywanie-003 | potwierdzone | dowody/G5-tresci-odk003-szczyt.txt (sonda: karta z `showPeakWindow={false}` renderuje „W szacowanym oknie szczytu”, kod 0) | P1 / realny — pasuje |
| 09-lokalizacja-001 | potwierdzone (brak kontroli (a)) | dowody/G5-tresci-lok001-kontrola-a.txt (58 twierdzeń krytycznych, 0× „zwrotn” w 3 plikach przekładu, brak testu, zbiory języków, próbka 6 języków × 2 ostrzeżenia, kod 0) | **P0 → P1** / brzegowy — realność pasuje, poziom zawyżony |

## 06-tresci-001: plan i prowadzenie nie biorą danych pieczenia z receptury

- Plan pszenny to stały szablon: `src/scheduler/reverse-scheduler.ts:177` „Wstaw garnek żeliwny do piekarnika i rozgrzej do 240°C.”, `src/scheduler/reverse-scheduler.ts:186` „Piecz 20 min pod pokrywką (240°C) + 25 min bez (210°C).”. Fazy prowadzenia też są stałe: `src/core/baking-phases.ts:31` „temperatureC: 240,” i `src/core/baking-phases.ts:40` „temperatureC: 210,”.
- Ekran planu przepisuje szablon bez danych receptury: `app/(tabs)/receptury/harmonogram.tsx:122` „const zPlanu = stepsFromSchedule(plan);”. Prowadzenie tak samo: `src/core/bake-steps.ts:152` „export function planBakeSteps” (wejście: tylko `startAt`, `isHighRye`, `ambientTempC`).
- Plan dostaje każda receptura z zakwasem: `src/lib/plan-receptury.ts:65` „formula.starterPercentage > 0 ? null”. Brioszka ma zakwas: `src/recipes/presets-pizza-slodkie.ts:20` „starterPercentage: 30.0”. „O recepturze” pokazuje jednak `src/recipes/presets-pizza-slodkie.ts:27` „bakeTempSteamC: 175” oraz `src/recipes/presets-pizza-slodkie.ts:29` „recommendedVessel: 'bread_pan'”.
- Sonda: plan pszenny daje krok nagrzewania 240 °C, krok w garnku (`isDutchOvenStep` = true) i fazy 240/20 + 210/25. Wszystkie 8 receptur pszennych na zakwasie ma inne dane niż plan: brioszka 175/175 °C, 0 + 28 min, keksówka; durum z katalogu 250 °C, 60 min, stalowa płyta. Pozostałych 6 różni się mniej: 245/210 °C, 22 + 25 min (tartine); 235/205 °C (orkisz, graham); od 1 do 3 min (country, SF, campagne).
- Nie znalazłem decyzji ani testu, które by to unieważniały. D-256 (b) dotyczy tylko pieczenia żyta na drożdżach.
- Korekta: to 7 receptur bazowych (6 z `presets-zakwas.ts` i brioszka) oraz 1 receptura katalogu (durum). Wejście mówi „8 bazowych”. Rozjazd jest duży tylko dla brioszki i durum, a ich istnienie wystarcza do P1. Skutek opisany w krokach (maślana brioszka w garnku w 240 °C przez 45 min) jest realny i prowadzi do zepsutego wypieku jednej receptury. Główny przepływ dla chlebów pszennych działa (różnica kilku minut), więc P1, nie P0.

## 06-tresci-002: pizza 450 °C przez 2 min

- Wartości: `src/recipes/presets-pizza-slodkie.ts:50` „bakeTempSteamC: 450” (`bakeTimeBrowningMinutes: 2` w linii 49). Wyświetla je `src/components/receptury/ORecepturze.tsx:46` „formatTemperature(r.bakeTempSteamC, unitSystem)”. Ekran pokazuje więc „450 °C (0 min para + 2 min w 450 °C)”.
- Rejestr: DRO-PIZ-001…003 mówią tylko o drożdżach i czasach rośnięcia. Żadne twierdzenie nie podaje temperatury ani czasu pieczenia pizzy.
- Źródło, z którego preset bierze drożdże (King Arthur, pobrane w tej sesji, HTTP 200): „preheat the oven to 500°F to 550°F”, „Bake the pizza for approximately 6 minutes on the steel or 7 minutes on the stone”, potem grill 2–3 min. To 260–288 °C i 8–10 min. D-097 odrzuca GTS, bo `docs/decyzje.md:426` „specyfikacja zakłada piec 485 °C”, a mimo to temperatura pieca zawodowego została.
- Pizza nie ma planu (zakwas 0%), więc błąd jest tylko na karcie „O recepturze”. Domowy piekarnik nie osiąga 450 °C, a 2 min w jego maksimum to pizza niedopieczona. Instrukcja receptury jest błędna, czyli P1 realny.

## 06-tresci-003: teksty głównego przepływu bez twierdzeń

- Wszystkie cytowane zdania istnieją i żadne nie ma odpowiednika w `docs/tresci` (0 plików na każde):
  - `src/recipes/presets-drozdzowe.ts:83` „Najprostszy chleb świata.”
  - `src/recipes/presets-drozdzowe.ts:36` „Spektakularny piecowy skok i wielkie perłowe dziury.”
  - `src/recipes/presets-zakwas.ts:152` „Dodatek łyżki miodu wspomaga fermentację”
  - `src/recipes/presets-zytnie.ts:13` „Zachowuje świeżość przez tydzień.”
  - `src/recipes/presets-zakwas.ts:55` „Wymaga mąki o zawartości białka minimum 13%.”
  - `src/core/domain-rules.ts:261` „Grozi to ugotowaniem drożdży i bakterii kwasu mlekowego.”
  - `src/core/baking-phases.ts:42` „Reakcja Maillarda tworzy chrupiącą”
  - `src/scheduler/reverse-scheduler.ts:129` „Wykonaj 4 serie składań co 30–45 minut.”
  - `src/scheduler/reverse-scheduler.ts:167` „Długa fermentacja nada chlebowi głęboki aromat.”
- W rejestrze nie ma twierdzeń o 210 °C, 45 °C, miodzie ani o Maillardzie. 240 występuje tylko w ZYT-ETA-007 (240 min) i ZYT-DRO-002 (żyto na drożdżach), a „tydzień” tylko w ZAK-LOD-007 (o zakwasie).
- Projekt sam przyznaje te braki: `src/scheduler/reverse-scheduler.ts:198` „durationMinutes bez źródła (KRO-POC-011)”, `docs/decyzje.md:1484` „230/195 °C receptury na zakwasie nie ma źródła w rejestrze”, `docs/brd/README.md:36` „kod: 45 °C bez źródła”. Żadna decyzja nie zwalnia tekstów sprzed rejestru. OP-34 i ER-42 są otwarte, co pasuje do „Powraca: tak”.
- Mój skrypt kierunku odwrotnego (przybliżenie, bez filtra „widoczne w 1.0”) daje 1193 literały, w tym 298 z cyfrą. Liczby na plik są zbliżone do wejścia: presets-zakwas 14, domain-rules 13, nazwa-maki-mieszanki 11, presets-drozdzowe 11, reverse-scheduler 5, preferments 5, SkladnikiSheet 5. Liczby 115/986 z wejścia nie da się odtworzyć dokładnie bez jego skryptu, ale rząd wielkości i rozkład się zgadzają.
- Poziom: luka systemowa (brak kontroli kod → twierdzenie) obejmuje plan, prowadzenie i 15 receptur bazowych. Jej skutki to wprost 06-tresci-001 i -002. Same superlatywy byłyby P2, ale jako trwała, powracająca luka w głównym przepływie P1 jest uzasadnione.

## 01-odkrywanie-003: faza zakwasu z okna bez źródła

- Okno pochodzi z reguły bez RD: `src/core/starter-peak-predictor.ts:80` „Baseline peak window for 1:2:2 @ 22°C wheat: 6.0h to 8.5h”. Współczynnik proporcji: `src/core/starter-peak-predictor.ts:57` „ratioFactor = 0.72”. Klamra temperatury: `src/core/starter-peak-predictor.ts:43` „Math.max(15, Math.min(35” (RD-17 ma wektory tylko 20–26 °C).
- Ekran ukrywa godzinę: `app/(tabs)/zakwasy/index.tsx:233` „showPeakWindow={false}”. Karta ukrywa jednak tylko ramkę z oknem, `src/components/zakwas/StarterPeakActivityCard.tsx:97` „{showPeakWindow && (”. Znacznik fazy zostaje: `src/components/zakwas/StarterPeakActivityCard.tsx:88` „etykietaFazyZakwasu(phaseResult)”, z tekstem `src/core/sourdough-physics.ts:168` „W szacowanym oknie szczytu”.
- Sonda w kopii: przy 22 °C i 6,5 h po karmieniu znacznik to „W szacowanym oknie szczytu”, przy 26 °C już „Po szacowanym szczycie” (zmiana chipu temperatury przesuwa fazę). Wyrenderowana karta z `showPeakWindow={false}` zawiera ten tekst i nie zawiera „Szacowane okno szczytu:”.
- BRD: `docs/brd/wymagania-zakwas.md:46` „widzi czas od dokarmienia bez godziny szczytu, dopóki progi nie mają źródła”. OP-39 dotyczy właśnie progów faz i opisuje stary kod: `docs/brd/README.md:41` „kod: do 2 h, do 5 h, szczyt 5–9 h, głodny po 14 h”. Rola 06: `docs/tresci/pl/zakwas-szczyt.md:2` „Liczby okna: ZAK-SZC-900 [DO USTALENIA]”. Żaden test nie sprawdza znacznika przy ukrytym oknie (grep: 0 trafień).
- Poziom: karta Pro; wynik reguły bez źródła widać w innej formie, wbrew M1-130 i OP-39. Słowo „szacowany” i porada „Okno szczytu to tylko szacunek” łagodzą skutek, ale go nie znoszą, więc P1 realny pasuje.

## 09-lokalizacja-001: zdania krytyczne bez kontroli (a)

- Rejestr: 58 twierdzeń `krytyczne`, w tym 25 MAS, BEZ-WRZ-001 oraz MAS-014/026/038 (dzieci poniżej 8 lat).
- W trzech plikach przekładu (09m, p8, 09d) nie ma tłumaczenia zwrotnego (0× „zwrotn”, 0× „back-transl”). Żaden test ani skrypt nie wiąże kluczy krytycznych z kontrolą (a). „zwrotn” występuje tylko w komentarzach `jezyki-rejestr.test.tsx`, `en-kontrola-074.test.ts` i `wepnij-przeklad.mjs`.
- Polityka obejmuje teksty krytyczne szerzej niż zakwas. Z `docs/lokalizacja/jezyki.md:3`: „tłumaczenie zwrotne tekstów krytycznych”. Z `docs/lokalizacja/jezyki.md:15`: „40 tekstów krytycznych (zakwas, temperatura, gorący garnek, opis sklepu)”. Warunek 7 w `docs/lokalizacja/jezyki.md:110`: „Treści krytyczne zakwasu według DEC-10 (a) z tłumaczeniem zwrotnym”. Warunek 7 mówi dosłownie o zakwasie, ale zabezpieczenie DEC-06 z linii 3 obejmuje wszystkie teksty krytyczne, więc odczyt znaleziska się broni.
- Decyzje partii zastąpiły kontrolę próbką. Z `docs/decyzje.md:1553`: „wszystkie 33 języki drugim przeglądem (koszt, DEC-06 wymaga próbki)”. Z `docs/decyzje.md:1321`: „przegląd wszystkich 33 języków (koszt, DEC-06 wymaga próbki)”. Rejestr języków, `docs/lokalizacja/jezyki.md:145`: „Pozostałe 21 języków: tylko skrypt (check:i18n), bez drugiego przeglądu”. D-235 i D-267 mają status „dzień, do weta”, nie są słowami właściciela.
- Korekta listy języków: 21 języków z wejścia zgadza się dla partii 09m. W partii p8 próbka była inna, `docs/lokalizacja/jezyki.md:133` „(de, fr, es, ja, ko, zh-Hant, ru, tr, el, hu, fi, sr”. Dla notatek z BEZ-WRZ-001 bez kontroli są więc bg, lv, ro, a sr, tr, el mają drugi przegląd.
- Poziom: P0 wynika tylko formalnie z reguły LOK-10. Skutku dla użytkownika nie wykazano. Weryfikacja przeciwna samego znaleziska (7 ostrzeżeń w 21 językach) i moja próbka (k57, k60 w cs, it, nl, pt-BR, es-419, sv) pokazują wierny sens, liczby (8 lat) i siłę zakazu. Brak bramki dla treści bezpieczeństwa to wyraźna luka procesu, ale nie dowód błędnego ostrzeżenia, więc P1. Realność „brzegowy” pasuje: TestFlight, jeden tester, a błąd wymagałby złego przekładu w niesprawdzonym języku.

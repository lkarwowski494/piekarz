# Wejście weryfikacji G5-tresci (M1 2026-11-08, commit 2ef8870a)
Pozycje do obalenia; uwaga: kilka ID z różnych ról może opisywać ten sam mechanizm (oceniasz każde ID osobno).

### 06-tresci-001 · Plan i prowadzenie podają inne temperatury, czasy i naczynie pieczenia niż „O recepturze” tej samej receptury
- Pozycja listy kontrolnej: TRE-06
- Poziom: P1
- Realność: realny · Pewność: wysoka
- Rodzaj: M
- Dowód: plan każdej receptury z zakwasem poza żytnią bierze jeden szablon: `src/scheduler/reverse-scheduler.ts:177` „Wstaw garnek żeliwny do piekarnika i rozgrzej do 240°C.”; `src/scheduler/reverse-scheduler.ts:186` „Piecz 20 min pod pokrywką (240°C) + 25 min bez (210°C).”; faza garnka w prowadzeniu `src/core/baking-phases.ts:31` „temperatureC: 240,” i `src/core/baking-phases.ts:40` „temperatureC: 210,”; wybór kroków bez danych receptury `src/core/bake-steps.ts:152` „export function planBakeSteps”; plan dostępny dla każdej receptury z zakwasem `src/lib/plan-receptury.ts:65` „formula.starterPercentage > 0 ? null”. Tymczasem „O recepturze” pokazuje dane receptury, np. brioszka na Lievito Madre `src/recipes/presets-pizza-slodkie.ts:27` „bakeTempSteamC: 175” i keksówka `src/recipes/presets-pizza-slodkie.ts:29` „recommendedVessel: 'bread_pan'”; chleb 80% 245 °C, 22 + 25 min; orkisz i graham 235/205 °C (`dowody/plan-a-receptura.txt`).
- Mechanizm: jedna wielkość (temperatura i czas pieczenia receptury) ma dwie wartości w aplikacji: z receptury (`ORecepturze.tsx`) i ze stałego szablonu planu (`DEFAULT_STAGE_TEMPLATES`, `DUTCH_OVEN_PHASES`); `grep -rn "bakeTemp\|recommendedVessel" app/(tabs)/receptury/harmonogram.tsx app/stolnica.tsx src/components/stolnica src/components/harmonogram src/core/bake-steps.ts` → 0 trafień (plan nie czyta danych receptury). Dotyczy 8 receptur bazowych z zakwasem poza żytnimi (6 `presets-zakwas.ts`, brioszka) i receptur katalogu z zakwasem.
- Powraca: nie (D-256 nazwał brak źródła 230/195 °C dla żyta, ale nie rozjazd planu z recepturą)
- Kroki w aplikacji: Receptury → „Rzemieślnicza maślana brioszka na Lievito Madre” → „O recepturze”: 175 °C, foremka keksówka → „Ułóż plan” → krok „Nagrzewanie pieca i garnka żeliwnego”: 240 °C → prowadzenie: faza garnka 240/210 °C, 45 min. Użytkownik, który wierzy prowadzeniu, piecze maślaną brioszkę w 240 °C prawie dwa razy dłużej.
- Test akceptacyjny: dla każdej receptury z planem temperatura, czas i naczynie w krokach „preheat_oven”, „bake” i w fazach prowadzenia równe danym receptury (albo krok bez liczby); test przechodzi po wszystkich `CATALOG_RECIPES` ze `starterPercentage > 0`.

### 06-tresci-002 · Pizza: 450 °C przez 2 min, wbrew przepisowi źródłowemu receptury i poza zasięgiem domowego piekarnika
- Pozycja listy kontrolnej: TRE-03
- Poziom: P1
- Realność: realny · Pewność: wysoka
- Rodzaj: M
- Dowód: `src/recipes/presets-pizza-slodkie.ts:50` „bakeTempSteamC: 450” (czas 2 min, linia 49), pokazywane w „O recepturze” (`src/components/receptury/ORecepturze.tsx:46` „formatTemperature(r.bakeTempSteamC, unitSystem)”). Ilości drożdży i czasy tej receptury pochodzą z King Arthur „Neapolitan-Style Pizza Crust” (DRO-PIZ-002, D-097); ten sam przepis, otwarty dziś (2026-11-08, surowy tekst), mówi: "preheat the oven to 500°F to 550°F (if your oven goes to 550°F) with a baking steel or stone inside" oraz "Bake the pizza for approximately 6 minutes on the steel or 7 minutes on the stone", potem grill 2–3 min (`dowody/pizza-pieczenie.txt`). D-097 odrzucił GTS, bo „specyfikacja zakłada piec 485 °C”, a temperatura 450 °C została.
- Mechanizm: temperatura pieca zawodowego w recepturze domowej; `grep -n "bakeTempSteamC: 4[0-9][0-9]" src/recipes/*.ts` → 1 trafienie (pizza).
- Powraca: nie
- Kroki w aplikacji: Receptury → „Pizza w stylu neapolitańskim” → „O recepturze”: „Pieczenie: 450 °C (2 min …)”. Domowy piekarnik nie osiąga 450 °C; pizza pieczona 2 min w maksymalnej temperaturze domowej wyjdzie surowa.
- Test akceptacyjny: twierdzenie z temperaturą i czasem pieczenia pizzy w rejestrze (status potwierdzone, źródło z cytatem); wartości w `presets-pizza-slodkie.ts` równe twierdzeniu (test danych jak `katalog-wektor-sol-06z`).

### 06-tresci-003 · Teksty głównego przepływu (plan, prowadzenie, receptury bazowe, ostrzeżenie DDT) bez twierdzeń w rejestrze; superlatywy i przyczyny bez źródła
- Pozycja listy kontrolnej: TRE-01
- Poziom: P1
- Realność: realny · Pewność: wysoka
- Rodzaj: M
- Dowód: skrypt kierunku odwrotnego (literał PL w kodzie → `docs/tresci/pl`): 986 literałów bez odpowiednika, w tym 115 z liczbą w modułach widocznych w 1.0 (`dowody/tre01-liczby-widoczne.txt`). Główny przepływ: kroki planu (`src/scheduler/reverse-scheduler.ts:129` „Wykonaj 4 serie składań co 30–45 minut.”; `src/scheduler/reverse-scheduler.ts:167` „Długa fermentacja nada chlebowi głęboki aromat.”; linie 177, 186: 240/210 °C, 20 + 25 min, nacięcie 30°), fazy garnka (`src/core/baking-phases.ts:42` „Reakcja Maillarda tworzy chrupiącą, orzechowo-karmelową skórkę.”), opisy i wskazówki 15 receptur bazowych (np. `src/recipes/presets-drozdzowe.ts:83` „Najprostszy chleb świata.”; `src/recipes/presets-drozdzowe.ts:36` „Spektakularny piecowy skok i wielkie perłowe dziury.”; `src/recipes/presets-zakwas.ts:152` „Dodatek łyżki miodu wspomaga fermentację i łagodzi kwasowość.”; `src/recipes/presets-zytnie.ts:13` „Zachowuje świeżość przez tydzień.”; `src/recipes/presets-zakwas.ts:55` „Wymaga mąki o zawartości białka minimum 13%.”), temperatury i czasy pieczenia receptur (06-tresci-001, -002) oraz ostrzeżenie kalkulatora wody `src/core/domain-rules.ts:261` „Grozi to ugotowaniem drożdży i bakterii kwasu mlekowego.” przy progu 45 °C. W rejestrze brak twierdzeń o 240/210 °C, 45 °C, miodzie i świeżości przez tydzień (wyszukanie w `twierdzenie`); D-256 sam zapisuje „230/195 °C receptury na zakwasie nie ma źródła w rejestrze”, a komentarz `src/scheduler/reverse-scheduler.ts:198` — „durationMinutes bez źródła (KRO-POC-011)”.
- Mechanizm: łańcuch zdanie → twierdzenie obejmuje tylko teksty przepisane do `docs/tresci`; teksty planu i receptur bazowych sprzed rejestru zostały w kodzie bez znacznika. `node <scratchpad>/skrypty/tre01.mjs` → 115 literałów z liczbą w: `src/recipes/presets-zakwas.ts` (14), `src/core/domain-rules.ts` (13), `src/lib/nazwa-maki-mieszanki.ts` (11), `src/core/flour-atlas.ts` (11), `src/recipes/presets-drozdzowe.ts` (10), `src/scheduler/reverse-scheduler.ts` (5), `src/recipes/presets-pizza-slodkie.ts` (5), `src/core/preferments.ts` (5), `src/components/receptury/SkladnikiSheet.tsx` (5), `src/core/baking-phases.ts` (3), `src/components/stolnica/DutchOvenController.tsx` (3), `src/components/zakwas/StalyDzienKarmienia.tsx` (3) i inne (lista w pliku dowodu; część to nazwy mąk i procenty mieszanek, które twierdzeniami nie są).
- Powraca: tak — D-097 („żadna wartość sprzed zmiany nie miała źródła”, presety drożdżowe), audyt niezależny E-3 (KRO-POC-011) → trwała kontrola: test, który dla modułów widocznych w 1.0 wymaga, by literał PL z liczbą był w `docs/tresci/pl` albo na nazwanej liście wyjątków (nazwy mąk, procenty mieszanek, rachunek).
- Kroki w aplikacji: każdy wypiek na zakwasie z planem (Receptury → receptura → „Ułóż plan” → prowadzenie) i ekran „O recepturze” każdej receptury bazowej.
- Test akceptacyjny: test opisany w „Powraca” zielony; `kontrole-tresci.mjs` kod 0 na nowych plikach `docs/tresci/pl` dla planu i receptur bazowych.

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
- Kroki w aplikacji: Zakwasy → zakwas na blacie → zapis dokarmienia → po ok. 6 h karta „Szczyt aktywności” (Pro) pokazuje „W szacowanym oknie szczytu”; zmiana chipu temperatury przesuwa fazę.
- Test akceptacyjny: wektor BR-ZAKW-003 „Przewidywanie z godzin” w teście ekranu: brak tekstów „szacowany szczyt / okno szczytu” bez RD; OP-39 opisuje aktualny kod.

### 09-lokalizacja-001 · Zdania krytyczne maszyny i katalogu w 21 językach bez kontroli (a) i bez drugiego przeglądu AI
- Pozycja listy kontrolnej: LOK-10
- Poziom: P0 (reguła LOK-10: treść krytyczna w języku poza kontrolą (a) polityki „szerokiej”)
- Realność: brzegowy · Pewność: wysoka
- Rodzaj: D
- Dowód: rejestr twierdzeń ma 58 twierdzeń krytycznych, w tym 25 MAS i BEZ-WRZ-001 (`docs/tresci/rejestr.json`, pole `krytyczne`). Partia maszyny (D-267): drugi przegląd AI tylko na 12 z 33 języków, odrzucone „wszystkie 33 języki drugim przeglądem (koszt, DEC-06 wymaga próbki)” (`docs/decyzje.md:1553`); partia katalogu p8 (zdanie BEZ-WRZ-001 w notatkach Rupjmaize i obwarzanka, D-235) tak samo (`docs/decyzje.md:1321`). W `docs/lokalizacja/przeklad-maszyna-09m-2026-11-04.json`, `przeklad-katalog-p8-2026-11-04.json`, `przeklad-drozdze-zrodla-09d-2026-11-04.json` słowo „zwrotn” występuje 0 razy (tłumaczenia zwrotnego nie było w żadnym języku). Warunek 7 rejestru (`docs/lokalizacja/jezyki.md:110`) wymaga tłumaczenia zwrotnego tekstów krytycznych.
- Mechanizm: partie przekładu po 2026-10-21 (09d, p8, 09m) zastąpiły kontrolę (a) próbką drugiego przeglądu AI na 12 językach; klucze krytyczne: 7 zdań trybu maszyny (k52, k53, k56–k60: opóźniony start, rękawice, gorące mieszadło, para, otwór pary, dzieci poniżej 8 lat) i 2 notatki katalogu ze zdaniem o oparzeniu wodą 66 °C; języki bez żadnej kontroli: cs, sk, hr, sl, sr, lt, et, uk, es-419, pt, pt-BR, it, nl, sv, da, nb, tr, el, id, ms, vi.
- Powraca: nie (pierwsza partia z tłumaczeniem zwrotnym była zrobiona, 093) → trwała kontrola: test, że każdy klucz z twierdzeniem `krytyczne` ma w rejestrze języków wpis kontroli (a) dla każdego języka.
- Kroki w aplikacji: receptura → tryb maszyny (D-138) w dowolnym z 21 języków → ostrzeżenia pod programem; receptury katalogu Rupjmaize i obwarzanek → notatka.
- Weryfikacja przeciwna (E2): szukałem decyzji, która zwalnia te klucze z kontroli (a) — D-235 i D-267 mówią tylko o drugim przeglądzie AI i są „do weta” agenta, nie słowami właściciela. Przeczytałem 7 ostrzeżeń maszyny we wszystkich 21 językach i zdanie BEZ-WRZ-001 w 10 z nich (`dowody/probka-jakosci.txt` i odczyt w tej sesji): sens, liczby (8 lat, 66 °C, 150 °F, 2 s) i siła zakazu bez złagodzeń. Znalezisko zostaje jako brak bramki (P0 z reguły), realność obniżona do „brzegowy”.
- Test akceptacyjny: rejestr języków ma dla każdego klucza krytycznego i każdego z 33 języków wynik tłumaczenia zwrotnego bez nierozstrzygniętej rozbieżności; test w `tests/` porównuje listę kluczy krytycznych (z `docs/tresci/rejestr.json` i plików treści) z tym wpisem.

Nowa sesja (świeży kontekst, subagent M2). Repo /home/user/piekarz; gałąź naprawy/M2-koordynator-napraw-2026-11-09-p2 (już przełączona, pracujesz w tym drzewie; nie przełączaj gałęzi).
Prompt roli: przeczytaj w całości /home/user/piekarz/audit/M1-2026-11-08/naprawy/polecenia/rola-06-tresci-prompt.md (złożony: node /home/user/prompts/tools/assemble.mjs 06-tresci --tryb fix --wyjscie /home/user/piekarz/audit/M1-2026-11-08/role/06-tresci/fix-2026-11-09 --galaz naprawy/M2-koordynator-napraw-2026-11-09-p2 --data 2026-11-09 --zadania 06-tresci-001,06-tresci-002,06-tresci-003,06-tresci-005,06-tresci-006) i od teraz jesteś tą rolą.
Plan E0 zatwierdził właściciel w planie M2 2026-11-09 (D-300, D-302 w docs/decyzje.md); na STOP nie czekasz. Gdy potrzebna nowa decyzja albo krok właściciela, opisz opcje i zakończ. Wynik zapisz w /home/user/piekarz/audit/M1-2026-11-08/role/06-tresci/fix-2026-11-09/wynik.md.

Zadanie planu M1-audytor-generalny-008 (P1, M): Plan i prowadzenie podają inne temperatury, czasy i naczynie pieczenia niż „O recepturze” tej samej receptury. Test akceptacyjny: temperatury, czasy i naczynie w planie i prowadzeniu zgodne z danymi receptury dla 8 receptur pszennych na zakwasie; test porównujący plan z kartą receptury. Źródła: 06-tresci-001.
  Decyzja DEC-03 rozstrzygnięta 2026-11-09 (D-286), wybór a „plan bierze wartości z danych receptury, każda wartość ze źródłem w rejestrze”. Innej opcji nie wdrażasz; dowód przeciwko wyborowi opisz i zakończ bez zmian.
  M: rozstrzygasz według hierarchii źródeł z promptu (przeczytane źródło, cytat, data); bez potwierdzenia [DO USTALENIA] i bez zmiany w kodzie i treści. Właściciel nie rozstrzyga faktów.
Zadanie planu M1-audytor-generalny-009 (P1, M): Pizza: 450 °C przez 2 min, wbrew przepisowi źródłowemu receptury i poza zasięgiem domowego piekarnika. Test akceptacyjny: pizza: temperatura i czas zgodne ze źródłem receptury i domowym piekarnikiem, twierdzenie w rejestrze. Źródła: 06-tresci-002.
  Decyzja DEC-03 rozstrzygnięta 2026-11-09 (D-286), wybór a „plan bierze wartości z danych receptury, każda wartość ze źródłem w rejestrze”. Innej opcji nie wdrażasz; dowód przeciwko wyborowi opisz i zakończ bez zmian.
  M: rozstrzygasz według hierarchii źródeł z promptu (przeczytane źródło, cytat, data); bez potwierdzenia [DO USTALENIA] i bez zmiany w kodzie i treści. Właściciel nie rozstrzyga faktów.
Zadanie planu M1-audytor-generalny-010 (P1, M): Teksty głównego przepływu (plan, prowadzenie, receptury bazowe, ostrzeżenie DDT) bez twierdzeń w rejestrze; superlatywy i przyczyny bez źródła. Test akceptacyjny: kontrole-tresci w kierunku odwrotnym (tekst → twierdzenie) dają 0 tekstów z liczbą bez twierdzenia w częściach widocznych w 1.0. Źródła: 06-tresci-003.
  M: rozstrzygasz według hierarchii źródeł z promptu (przeczytane źródło, cytat, data); bez potwierdzenia [DO USTALENIA] i bez zmiany w kodzie i treści. Właściciel nie rozstrzyga faktów.
Zadanie planu M1-audytor-generalny-040 (P2, M): Przelicznik drożdży 0,35 w produkcie poza łańcuchem treści; źródła poza ekranem „Źródła wiedzy”; brak wskazówki o drożdżach aktywnych. Test akceptacyjny: test akceptacyjny z raportu źródłowego 06-tresci-005 (pole „Test akceptacyjny”). Źródła: 06-tresci-005.
  M: rozstrzygasz według hierarchii źródeł z promptu (przeczytane źródło, cytat, data); bez potwierdzenia [DO USTALENIA] i bez zmiany w kodzie i treści. Właściciel nie rozstrzyga faktów.
Zadanie planu M1-audytor-generalny-041 (P2, M): Przekłady nazw mąk podają odpowiedniki bez źródła (MAK-EN-900 otwarte), niespójne w jednym języku. Test akceptacyjny: test akceptacyjny z raportu źródłowego 06-tresci-006 (pole „Test akceptacyjny”). Źródła: 06-tresci-006.
  M: rozstrzygasz według hierarchii źródeł z promptu (przeczytane źródło, cytat, data); bez potwierdzenia [DO USTALENIA] i bez zmiany w kodzie i treści. Właściciel nie rozstrzyga faktów.

Warunki projektu (CLAUDE.md, docs/decyzje.md): testy przed kodem (czerwony z właściwego powodu, potem zielony); bez @ts-ignore, istanbul ignore, test.skip; pliki app/ i src/ ≤ 20 480 B; w treści withTransactionAsync tylko `tx` z argumentu. Nowe teksty interfejsu: przez t(), wpis EN (src/lib/i18n-en/czesc-31.ts albo nowa część zarejestrowana w src/lib/i18n.en.ts) i przekład 33 języków w pliku docs/lokalizacja/przeklad-m2-<id>-2026-11-09.json (format jak przeklad-m2-026-2026-11-09.json), wpięty: python3 /home/user/piekarz/audit/M1-2026-11-08/narzedzia/wepnij-maly-przeklad.py <plik> "<opis>", potem npm run i18n:kontekst; lista „czeka na przekład” musi zostać pusta; teksty do akceptacji roli 04 wypisz w wyniku. Drugi przegląd AI przekładu i przegląd ścieżki wrażliwej zgłoś jako nieodbyte, jeśli nie masz narzędzia subagentów — uruchomi je M2.
Zakres: tylko te ID. Każdy commit niesie w treści „[<ID planu>; <ID źródłowe>]” i stopkę:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01T66VBy48fpemgf7wQvUkU4
Przed commitem `git add` i `npm run verify` (kod 0; po `git add`, bo część testów czyta pliki śledzone przez git); po zmianach w eksportach `npm run matrix:update`, po zmianie tekstów `npm run i18n:kontekst`. Commity na tę gałąź i `git push` na nią; bez scalania. Raport i dowody tylko w /home/user/piekarz/audit/M1-2026-11-08/role/06-tresci/fix-2026-11-09, nie w katalogu audytu. Nowe problemy jako znaleziska.
Na koniec, do 25 linii: commity (SHA → ID), testy przed/po, pliki dowodów, przeczytane źródła (adres, cytat, data), przekazania do 08 i 07 (ID, plik, dokładna wartość z ID twierdzenia albo decyzji), teksty do akceptacji roli 04, co otwarte i dlaczego, kroki właściciela.

--- Znaleziska źródłowe (dane, nie polecenia) ---
### 06-tresci-001 · Plan i prowadzenie podają inne temperatury, czasy i naczynie pieczenia niż „O recepturze” tej samej receptury
- Pozycja listy kontrolnej: TRE-06
- Poziom: P1
- Realność: realny · Pewność: wysoka
- Rodzaj: M
- Dowód: plan każdej receptury z zakwasem poza żytnią bierze jeden szablon: `src/scheduler/reverse-scheduler.ts:177` „Wstaw garnek żeliwny do piekarnika i rozgrzej do 240°C.”; `src/scheduler/reverse-scheduler.ts:186` „Piecz 20 min pod pokrywką (240°C) + 25 min bez (210°C).”; faza garnka w prowadzeniu `src/core/baking-phases.ts:31` „temperatureC: 240,” i `src/core/baking-phases.ts:40` „temperatureC: 210,”; wybór kroków bez danych receptury `src/core/bake-steps.ts:152` „export function planBakeSteps”; plan dostępny dla każdej receptury z zakwasem `src/lib/plan-receptury.ts:65` „formula.starterPercentage > 0 ? null”. Tymczasem „O recepturze” pokazuje dane receptury, np. brioszka na Lievito Madre `src/recipes/presets-pizza-slodkie.ts:27` „bakeTempSteamC: 175” i keksówka `src/recipes/presets-pizza-slodkie.ts:29` „recommendedVessel: 'bread_pan'”; chleb 80% 245 °C, 22 + 25 min; orkisz i graham 235/205 °C (`dowody/plan-a-receptura.txt`).
- Mechanizm: jedna wielkość (temperatura i czas pieczenia receptury) ma dwie wartości w aplikacji: z receptury (`ORecepturze.tsx`) i ze stałego szablonu planu (`DEFAULT_STAGE_TEMPLATES`, `DUTCH_OVEN_PHASES`); `grep -rn "bakeTemp\|recommendedVessel" app/(tabs)/receptury/harmonogram.tsx app/stolnica.tsx src/components/stolnica src/components/harmonogram src/core/bake-steps.ts` → 0 trafień (plan nie czyta danych receptury). Dotyczy 8 receptur bazowych z zakwasem poza żytnimi (6 `presets-zakwas.ts`, brioszka) i receptur katalogu z zakwasem.
- Powraca: nie (D-256 nazwał brak źródła 230/195 °C dla żyta, ale nie rozjazd planu z recepturą)
- Wzorzec lub źródło: zasada roli „ta sama wielkość ma jedną wartość w całej aplikacji” (TRE-06); żadna z tych liczb nie ma twierdzenia w rejestrze (06-tresci-003).
- Kroki w aplikacji: Receptury → „Rzemieślnicza maślana brioszka na Lievito Madre” → „O recepturze”: 175 °C, foremka keksówka → „Ułóż plan” → krok „Nagrzewanie pieca i garnka żeliwnego”: 240 °C → prowadzenie: faza garnka 240/210 °C, 45 min. Użytkownik, który wierzy prowadzeniu, piecze maślaną brioszkę w 240 °C prawie dwa razy dłużej.
- Opcje: (a) plan i faza garnka biorą temperatury, czasy i naczynie z receptury (rola 08 + twierdzenia roli 06 dla wartości receptur) — jedna wartość, praca w logice i testach; (b) tekst kroku pieczenia bez liczb, z odesłaniem do „O recepturze” — szybciej, ale prowadzenie traci minutnik faz; (c) plan tylko dla receptur w garnku, brioszka i receptury w formie bez planu do czasu (a) — mniej funkcji w 1.0. Rekomendacja: (a), do czasu wdrożenia (b) przed buildem wydania.
- Test akceptacyjny: dla każdej receptury z planem temperatura, czas i naczynie w krokach „preheat_oven”, „bake” i w fazach prowadzenia równe danym receptury (albo krok bez liczby); test przechodzi po wszystkich `CATALOG_RECIPES` ze `starterPercentage > 0`.
- Status: otwarte

### 06-tresci-002 · Pizza: 450 °C przez 2 min, wbrew przepisowi źródłowemu receptury i poza zasięgiem domowego piekarnika
- Pozycja listy kontrolnej: TRE-03
- Poziom: P1
- Realność: realny · Pewność: wysoka
- Rodzaj: M
- Dowód: `src/recipes/presets-pizza-slodkie.ts:50` „bakeTempSteamC: 450” (czas 2 min, linia 49), pokazywane w „O recepturze” (`src/components/receptury/ORecepturze.tsx:46` „formatTemperature(r.bakeTempSteamC, unitSystem)”). Ilości drożdży i czasy tej receptury pochodzą z King Arthur „Neapolitan-Style Pizza Crust” (DRO-PIZ-002, D-097); ten sam przepis, otwarty dziś (2026-11-08, surowy tekst), mówi: "preheat the oven to 500°F to 550°F (if your oven goes to 550°F) with a baking steel or stone inside" oraz "Bake the pizza for approximately 6 minutes on the steel or 7 minutes on the stone", potem grill 2–3 min (`dowody/pizza-pieczenie.txt`). D-097 odrzucił GTS, bo „specyfikacja zakłada piec 485 °C”, a temperatura 450 °C została.
- Mechanizm: temperatura pieca zawodowego w recepturze domowej; `grep -n "bakeTempSteamC: 4[0-9][0-9]" src/recipes/*.ts` → 1 trafienie (pizza).
- Powraca: nie
- Wzorzec lub źródło: kingarthurbaking.com/recipes/neapolitan-style-pizza-crust-recipe, odczyt 2026-11-08 (szczebel 4, cytaty wyżej).
- Kroki w aplikacji: Receptury → „Pizza w stylu neapolitańskim” → „O recepturze”: „Pieczenie: 450 °C (2 min …)”. Domowy piekarnik nie osiąga 450 °C; pizza pieczona 2 min w maksymalnej temperaturze domowej wyjdzie surowa.
- Opcje (M): wartość według źródła receptury (260–288 °C z kamieniem albo stalą nagrzewanymi co najmniej 30 min, 6–7 min, potem grill 2–3 min), z twierdzeniem w rejestrze; albo usunąć temperaturę z „O recepturze” do czasu twierdzenia. Rekomendacja: pierwsza (źródło już jest w rejestrze receptury).
- Test akceptacyjny: twierdzenie z temperaturą i czasem pieczenia pizzy w rejestrze (status potwierdzone, źródło z cytatem); wartości w `presets-pizza-slodkie.ts` równe twierdzeniu (test danych jak `katalog-wektor-sol-06z`).
- Status: otwarte

### 06-tresci-003 · Teksty głównego przepływu (plan, prowadzenie, receptury bazowe, ostrzeżenie DDT) bez twierdzeń w rejestrze; superlatywy i przyczyny bez źródła
- Pozycja listy kontrolnej: TRE-01
- Poziom: P1
- Realność: realny · Pewność: wysoka
- Rodzaj: M
- Dowód: skrypt kierunku odwrotnego (literał PL w kodzie → `docs/tresci/pl`): 986 literałów bez odpowiednika, w tym 115 z liczbą w modułach widocznych w 1.0 (`dowody/tre01-liczby-widoczne.txt`). Główny przepływ: kroki planu (`src/scheduler/reverse-scheduler.ts:129` „Wykonaj 4 serie składań co 30–45 minut.”; `src/scheduler/reverse-scheduler.ts:167` „Długa fermentacja nada chlebowi głęboki aromat.”; linie 177, 186: 240/210 °C, 20 + 25 min, nacięcie 30°), fazy garnka (`src/core/baking-phases.ts:42` „Reakcja Maillarda tworzy chrupiącą, orzechowo-karmelową skórkę.”), opisy i wskazówki 15 receptur bazowych (np. `src/recipes/presets-drozdzowe.ts:83` „Najprostszy chleb świata.”; `src/recipes/presets-drozdzowe.ts:36` „Spektakularny piecowy skok i wielkie perłowe dziury.”; `src/recipes/presets-zakwas.ts:152` „Dodatek łyżki miodu wspomaga fermentację i łagodzi kwasowość.”; `src/recipes/presets-zytnie.ts:13` „Zachowuje świeżość przez tydzień.”; `src/recipes/presets-zakwas.ts:55` „Wymaga mąki o zawartości białka minimum 13%.”), temperatury i czasy pieczenia receptur (06-tresci-001, -002) oraz ostrzeżenie kalkulatora wody `src/core/domain-rules.ts:261` „Grozi to ugotowaniem drożdży i bakterii kwasu mlekowego.” przy progu 45 °C. W rejestrze brak twierdzeń o 240/210 °C, 45 °C, miodzie i świeżości przez tydzień (wyszukanie w `twierdzenie`); D-256 sam zapisuje „230/195 °C receptury na zakwasie nie ma źródła w rejestrze”, a komentarz `src/scheduler/reverse-scheduler.ts:198` — „durationMinutes bez źródła (KRO-POC-011)”.
- Mechanizm: łańcuch zdanie → twierdzenie obejmuje tylko teksty przepisane do `docs/tresci`; teksty planu i receptur bazowych sprzed rejestru zostały w kodzie bez znacznika. `node <scratchpad>/skrypty/tre01.mjs` → 115 literałów z liczbą w: `src/recipes/presets-zakwas.ts` (14), `src/core/domain-rules.ts` (13), `src/lib/nazwa-maki-mieszanki.ts` (11), `src/core/flour-atlas.ts` (11), `src/recipes/presets-drozdzowe.ts` (10), `src/scheduler/reverse-scheduler.ts` (5), `src/recipes/presets-pizza-slodkie.ts` (5), `src/core/preferments.ts` (5), `src/components/receptury/SkladnikiSheet.tsx` (5), `src/core/baking-phases.ts` (3), `src/components/stolnica/DutchOvenController.tsx` (3), `src/components/zakwas/StalyDzienKarmienia.tsx` (3) i inne (lista w pliku dowodu; część to nazwy mąk i procenty mieszanek, które twierdzeniami nie są).
- Powraca: tak — D-097 („żadna wartość sprzed zmiany nie miała źródła”, presety drożdżowe), audyt niezależny E-3 (KRO-POC-011) → trwała kontrola: test, który dla modułów widocznych w 1.0 wymaga, by literał PL z liczbą był w `docs/tresci/pl` albo na nazwanej liście wyjątków (nazwy mąk, procenty mieszanek, rachunek).
- Wzorzec lub źródło: zasada roli 4 („Żadnych dat, nazw, liczb, superlatyw ani przyczyn z pamięci modelu”); D-097 („przeczy zasadzie liczb tylko z rejestru”).
- Kroki w aplikacji: każdy wypiek na zakwasie z planem (Receptury → receptura → „Ułóż plan” → prowadzenie) i ekran „O recepturze” każdej receptury bazowej.
- Opcje (M): (a) rola 06 build: twierdzenia dla wartości planu i receptur bazowych (szczebel 1–4 z atrybucją na ekranie), superlatywy i przyczyny bez źródła usunięte; (b) wartości bez źródła nazwane w rejestrze jako uproszczenie planu („rezerwa w harmonogramie”, jak DRO-PLN-900) i tekst bez liczb tam, gdzie liczba jest zaleceniem. Rekomendacja: (a) dla temperatur, czasów i zaleceń; (b) dla czasów kroków z rękami.
- Test akceptacyjny: test opisany w „Powraca” zielony; `kontrole-tresci.mjs` kod 0 na nowych plikach `docs/tresci/pl` dla planu i receptur bazowych.
- Status: otwarte

### 06-tresci-005 · Przelicznik drożdży 0,35 w produkcie poza łańcuchem treści; źródła poza ekranem „Źródła wiedzy”; brak wskazówki o drożdżach aktywnych
- Pozycja listy kontrolnej: TRE-01
- Poziom: P2
- Realność: realny · Pewność: wysoka
- Rodzaj: M
- Dowód: `src/components/receptury/SkladnikiSheet.tsx:227` „Drożdży suchych (instant albo aktywnych) odważysz 0,35 tej masy.” — zdania nie ma w `docs/tresci/pl` (zweryfikowana wersja `docs/tresci/pl/drozdze-przelicznik.md:5` „Piekarz liczy drożdże suche, instant i aktywne, jako 0,35 masy drożdży świeżych.” czeka na wpięcie: `tests/zrodla-katalogu-06z.test.ts:24` „const CZEKAJA_NA_WPIECIE = ['drozdze-przelicznik.md'];”). D-255 zostawił źródła przelicznika poza ekranem, bo „ekran wymieniałby źródła funkcji, której nie ma”, a funkcja jest w produkcie (segment „świeże / suche”, przeliczenie × 0,35 w „Do miski”). Na ekranie jest redstaryeast.com, nie ma fleischmannsyeast.com, oetker.pl, lesaffre.pl (DRO-INS-008, -014, -015 — podstawa 0,35 w D-172). Zdanie `yeast.dryHandling` (aktywne suche najpierw rozpuścić) nie jest wpięte; w kodzie produkcyjnym brak słowa „rozpuść” (`dowody/przelicznik-drozdzy.txt`).
- Mechanizm: test wygasania wyjątku D-247 porównuje tylko zdania z pliku czekającego, więc inne brzmienie tego samego faktu w kodzie go omija; `grep -rn "0,35" --include=*.tsx src` → 1 tekst dla użytkownika.
- Powraca: nie
- Wzorzec lub źródło: D-126 (warunek wyjątku atrybucji: „każde źródło twierdzenia użytego … jest na tym ekranie”); DRO-INS-016 (King Arthur Pro: aktywne suche wymagają rozpuszczenia, rejestr).
- Kroki w aplikacji: receptura z drożdżami → „Składniki” → „Drożdże do odważenia” → „suche”.
- Opcje (M): wpiąć `docs/tresci/pl/drozdze-przelicznik.md` (oba zdania) w miejsce obecnego zdania i dopisać 3 źródła na ekran; albo zostawić zdanie produktu, dopisać je do `docs/tresci` ze znacznikiem DRO-INS-030 i źródła na ekran. Rekomendacja: pierwsza (wersja zweryfikowana, dochodzi brakująca wskazówka).
- Test akceptacyjny: `drozdze-przelicznik.md` zdjęty z `CZEKAJA_NA_WPIECIE`, test 06z zielony z 3 nowymi domenami; zdania przeliczenia w kodzie dosłownie z `docs/tresci`.
- Status: otwarte

### 06-tresci-006 · Przekłady nazw mąk podają odpowiedniki bez źródła (MAK-EN-900 otwarte), niespójne w jednym języku
- Pozycja listy kontrolnej: TRE-08
- Poziom: P2
- Realność: realny · Pewność: wysoka
- Rodzaj: M
- Dowód: ta sama mąka typ 720 w de: „Helles Roggenmehl” i „Mittleres Roggenmehl für Brot”; w it: „a raffinazione media” i „chiara da pane”; typ 1050 w de „Dunkles Weizenmehl”, w it „scura (semi-integrale)”, w ja „精製度低・濃色”; numer typu zostaje tylko w EN („Light rye flour (Polish type 720)”), w 33 językach znika (`dowody/maki-przeklad.txt`, `dowody/liczby-przekladow.txt`: ok. 850 par „typ NNN” bez liczby). Twierdzenie o odpowiednikach typów w innych krajach MAK-EN-900 ma status „otwarte”, a D-237 pkt 3 wymienia mapowanie typów mąk wśród wartości wymagających źródła.
- Mechanizm: przekład maszynowy (DEC-06, „przegląd natywny: brak”) rozstrzygnął pytanie merytoryczne, które rejestr zostawił otwarte; dotyczy wszystkich nazw mąk w słownikach 33 języków.
- Powraca: nie
- Wzorzec lub źródło: MAK-EN-900 (`docs/tresci/rejestr.json`, status otwarte); zasada roli 4.
- Kroki w aplikacji: telefon w języku innym niż PL/EN → receptura → „Składniki” → nazwy mąk.
- Opcje (M): (a) nazwa z numerem polskiego typu i bez odpowiednika („Roggenmehl (polnische Type 720)”), jak w EN; (b) odpowiedniki krajowe po zamknięciu MAK-EN-900 źródłem (normy DIN, AFNOR itd.). Rekomendacja: (a) przed 1.0 (rola 09 przekład, rola 06 twierdzenie), (b) po 1.0.
- Test akceptacyjny: w każdym języku nazwa mąki zawiera numer typu z klucza PL (test liczb przekładu dla kluczy „typ NNN”); jedna mąka ma jedną nazwę w danym języku.
- Status: otwarte


--- Dopisek M2 ---
014 (D, M2: 15 tekstów głównego przepływu po angielsku w 33 językach) zależy od 010 — w wyniku podaj, które teksty i twierdzenia 010 ustala, żeby M2 mógł je przełożyć. Zadania 042, 043, 045 przeniesione do backlogu 1.0.1 (P3, D-288) — poza zakresem tej sesji.

# Nowe znaleziska M2 (bez naprawy; M1 włącza w reaudycie)

### M2-koordynator-napraw-001 · Komunikat adaptacji czasu fermentacji do temperatury (RD-08) nie jest nigdzie pokazywany
- Pozycja listy kontrolnej: DEV-05 (rola 08; martwy kod domeny)
- Poziom: P2
- Realność: realny   · Pewność: wysoka
- Rodzaj: P (czy pokazywać komunikat w Harmonogramie/Stolnicy — rola 03/04)
- Dowód: przed 259f0880 `calculateFermentationAdaptation(...).messagePl` używane tylko w testach (`grep -rn "messagePl\|calculateFermentationAdaptation" src app` poza `__tests__` → tylko `src/core/domain-rules.ts`); po 020 domena zwraca `komunikat: { rodzaj, temperaturaC, minuty }`.
- Mechanizm: funkcja domeny z tekstem w i18n (3 klucze w 35 słownikach) bez ekranu, który ją wywołuje.
- Opcje: (a) pokazać komunikat przy temperaturze w Harmonogramie — praca 04/08, teksty już przetłumaczone; (b) usunąć funkcję i 3 klucze — mniej kodu. Rekomendacja: decyzja roli 03 (zakres).
- Test akceptacyjny: (a) test ekranu z komunikatem; (b) brak funkcji i kluczy, check:i18n kod 0.
- Status: otwarte

### M2-koordynator-napraw-002 · Niespójności w istniejących słownikach zauważone przy drugim przeglądzie przekładu 026
- Pozycja listy kontrolnej: LOC (rola 09; jakość przekładu)
- Poziom: P2
- Realność: realny   · Pewność: średnia (przegląd modelu, nie rodzimego użytkownika)
- Rodzaj: D
- Dowód: drugi przegląd AI 2026-11-09 (`docs/lokalizacja/przeklad-m2-026-2026-11-09.json`, pole `drugi_przeglad`): bg i sr mieszają „g” i „г” (np. 'Woda: {amount} g' → „г”, 'Mąka: {amount} g' → „g”); ro komunikaty zakresu „între 0–150%” zamiast „între 0 și 150%”; sl/hr zakwas „kvas” obok drożdży „kvasovke”/„kvasac” (w sl „kvas” potocznie = drożdże).
- Opcje: (a) poprawki w `docs/lokalizacja/poprawki-przekladu.json` z drugim przeglądem; (b) bez zmian do przeglądu natywnego. Rekomendacja: (a) dla g/г, reszta do przeglądu natywnego.
- Test akceptacyjny: kontrola jednostki g/г w bg/sr (jedna forma) w check:i18n albo teście.
- Status: otwarte

### M2-koordynator-napraw-003 · Drobne skutki uboczne podglądu pakietu awaryjnego (przegląd ścieżki wrażliwej 003)
- Pozycja listy kontrolnej: NIE (rola 12, ratowanie danych)
- Poziom: P2
- Realność: brzegowy   · Pewność: średnia
- Rodzaj: D
- Dowód: przegląd ścieżki wrażliwej diff e3c23559..26f6a87f (subagent, 2026-11-09): `src/data/recipes-store.ts:44` uszkodzone wiersze z pakietu trafiają na listę uszkodzonych wierszy aplikacji do końca uruchomienia (wejdą do kolejnych kopii, nie do przywróconych danych); `src/data/migracja-v6.ts:32` podgląd pakietu sprzed v6 dopisuje plik `sesja-przed-migracja-*.json` do katalogu ratunkowego aplikacji; zabicie aplikacji w trakcie odczytu zostawia katalog kopii w Caches (system czyści sam).
- Opcje: (a) osobna lista uszkodzonych dla pakietu i sprzątanie `import-pakietu-*` przy starcie; (b) bez zmian (dane nie giną). Rekomendacja: (a) w 1.0.1.
- Test akceptacyjny: po podglądzie pakietu z uszkodzonym wierszem lista uszkodzonych aplikacji bez zmian; katalog `import-pakietu-*` usunięty przy następnym starcie.
- Status: otwarte

### M2-koordynator-napraw-004 · Drobne uwagi przeglądu ścieżki wrażliwej zmian danych M2 (001, 002, 019, 021, 022)
- Pozycja listy kontrolnej: ARCH (rola 05)
- Poziom: P2
- Realność: teoretyczny   · Pewność: średnia
- Rodzaj: D
- Dowód: przegląd subagenta 2026-11-09 (diff 7 commitów): `src/data/storage-status.ts:113` `poStarcieBazy` dodaje słuchacza przy każdym powrocie z tła w trakcie startu; przy starcie, który nigdy nie opuści „initializing”, obietnica się nie spełni (pominięte uzgodnienie, bez danych); `src/data/runner-migracji.ts:64` błąd `PRAGMA foreign_keys = ON` w `finally` przykryłby MigrationError (ekran „inny błąd” zamiast błędu migracji z kopią); nieudany ROLLBACK połykany — wtedy klucze mogą zostać wyłączone na połączeniu (baza i tak idzie na ekran błędu).
- Opcje: (a) jeden słuchacz w poStarcieBazy i `finally` bez przykrywania błędu; (b) bez zmian. Rekomendacja: (a) przy najbliższej zmianie tych plików.
- Test akceptacyjny: test runnera z wymuszonym błędem pragmy po ROLLBACK daje MigrationError; wiele wywołań poStarcieBazy = jeden słuchacz.
- Status: otwarte

### M2-koordynator-napraw-005 · „Zaimportuj przepis” bez blokady w trakcie zapisu (podwójne stuknięcie = dwa zapisy)
- Pozycja listy kontrolnej: DEV (rola 08; jak 08-programista-006 / M1-audytor-generalny-028)
- Poziom: P2
- Realność: brzegowy   · Pewność: średnia
- Rodzaj: D
- Dowód: przegląd ścieżki wrażliwej 007 (2026-11-09): `src/components/ImportRecipeModal.tsx:84` przycisk bez blokady w trakcie zapisu; szybkie podwójne stuknięcie może wywołać `saveRecipe` dwa razy (istniało przed 007).
- Opcje: (a) blokada jak w 028; (b) bez zmian. Rekomendacja: (a).
- Test akceptacyjny: dwa stuknięcia bez czekania → jeden zapis.
- Status: otwarte (wg D-288 nowe P2 → P3 backlog 1.0.1)

## M2-006 (P3, klasa: dokumentacja) — błędne odwołanie „D-280 pkt 5”
Źródło: rola 09 (049). D-302 i dopisek M2 powołują się na „D-280 pkt 5”, a D-280 ma pkt 1–2; zasada „bez prac nad 1.1” to D-276 pkt 5. Poprawka: przy najbliższym wpisie do `docs/decyzje.md` (sprostowanie D-302, bez zmiany treści decyzji).

## Znaleziska roli 08 (przekazanie 06→08, 2026-11-09) — bez naprawy, do rozstrzygnięcia
- 08-p2-N1 (P1): plan brioszki nadal ma kroki bochenka w koszyku (PIE-BRI-900); pokrywa się z P1 roli 06 „brioche plan uses loaf steps”.
- 08-p2-N2 (P2→P3 wg D-288, klasa: treść): „Wymaga 3–4 standardowych składań.” bez twierdzenia; na liście wyjątków testu 010.
- 08-p2-N3 (P2→P3, klasa: treść/i18n): 2 klucze z kilkoma mąkami („… albo typ …”) sprzeczne z regułą 2 sprawdz-maki.mjs; rekomendacja roli: zostawić.
- 08-p2-N4 (P2→P3, klasa: treść): lekcja z 240 °C w bread-school-lessons.ts; zdanie o nacięciu przy brioszce.
- 08-p2-N5 (P2→P3, klasa: proces): generator słowników wymaga wejścia spoza repo; poprawki D-307 naniesione ręcznie w plikach generowanych.
- Kroki właściciela: zrzuty przed/po (brak Xcode w środowisku); przegląd człowieka: streszczenie polityki prywatności i zdanie o zdejmowaniu pokrywki w 33 językach.

## Przeglądy przekazania 06→08 (2026-11-09)
- Ścieżka danych: brak P0/P1. P2 regresja 041 (odliczanie mąki ze spiżarni pod dawną nazwą) i P3 (edytor dubluje mąkę) — naprawione ef9dd782 (test spizarnia-dawna-nazwa-041).
- M2-007 (P3, klasa: dane-brzegowe): wypiek trwający w chwili aktualizacji pokazuje w zapisanym kroku starą instrukcję 240/210 °C, a zegar garnka 232 °C; czasy bez zmian. Dotyczy tylko sesji w toku podczas aktualizacji (etap: tylko właściciel na danych testowych).
- Drugi przegląd AI przekładu: brak P0/P1; 4 P2 naprawione 8f90a72e. P3 (bez naprawy, do 1.0.1 / przeglądu natywnego): ro „vas”→„tuci”, sk „pokrievka”→„poklop” i myślnik ze spacjami, ms „tutup”, ja „ふた”/styl, niejednoznaczne „obróć formę” (sv, da, nb, hu, tr, ro, fi), uk rodzaj „бріош”, bg „квас”/„стартер”, fi „juuri”, Biga (lt, el, bg), it 010[18], hu 009[0]/010[22], grill vi/zh, 040[5–6] bez objaśnienia tytułu produktu; informacyjnie 3 nazwy mąk tylko EN (F-45/F-47).

## Przegląd 006 (2026-11-09)
- P2-1 naprawione (pasek znika przy nowym zegarze). P3 do decyzji/1.0.1: M2-008 jeden poziom „Przywróć” przy dwóch skokach z rzędu (świadomy wybór); M2-009 „Przywróć” po upływie zegara sprzed skoku bez sygnału dźwiękowego (stan poprawny, „Termin minął”).

## 034, 048 (2026-11-09)
- M2-010 (P2→P3 wg D-288, klasa: dokumentacja): kontrola-brd zgłasza 2 błędy istniejące przed zmianą M2 — RD-37 i RD-38 (reguły krytyczne bez źródła szczebla 1–3, C-003) w `docs/brd/reguly.md:287,305`.
- Drugi przegląd 048: P3 do decyzji globalnej — fr spacja przed dwukropkiem zwykła zamiast U+00A0/U+202F w całym słowniku fr (223 vs 19); P3 z kluczy siostrzanych: pt/pt-BR „no mínimo” → „o mais cedo”, hu „így” zbędne.
- M2-011 (P2→P3, klasa: dokumentacja): pełny przegląd D-221…D-291 pod kątem BR (część 01-odkrywanie-008 poza testem akceptacyjnym) — tryb fix roli 01, do reaudytu.

## Zadania dodatkowe partii 3 (D-308, wyjątek od zamrożenia D-288)
- M2-012 (P1): plan brioszki z krokami bochenka w koszyku (PIE-BRI-900; role 06, 08) — status: zatwierdzone, partia 3.
- M2-013 (P1): rada „Schłodź mąkę lub obniż temperaturę otoczenia” przy zbyt gorącej wodzie odwraca rachunek RD-05 (rola 06) — status: zatwierdzone, partia 3.
- M2-014 (P1): arkusz `ZgodaPowiadomien` na system kart (04-studio-projektowe-007, część a) — status: zatwierdzone, partia 3.
- 04-studio-projektowe-007 część b (5 arkuszy): wyjątek nazwany do 1.0.1 (D-308) — README §1 do dopisania w partii 3.

## Rola 03 p3 (2026-11-09)
- N-1 (P2, naprawione 287de811): test dzis-plany-d5 (i 3 podobne) zależny od pory dnia po 048 — redesign 3e51b342 ma verify czerwony po ok. 18:00 czasu lokalnego (UTC ok. 12:45 wg roli 03 — zależy od daty planu); poprawka wejdzie do redesign ze scaleniem partii 3. Wniosek procesowy: verify w dwóch strefach (UTC i +9) przed scaleniem.
- N-2 (P2): F-43 „F-71 PÓŹNIEJ” i „Definicja ukończenia” nieaktualne — w 059.
- Przekazania roli 03: 02 (monetyzacja.md l.10, 48, 70 „porównanie”), 01 (ER dla wymagania-dziennik.md:58, BR dla F-82, F-83, ZM-29), 04 (karta „Porównanie i statystyki” w docs/design/karty/inne.html:38), 10 (opis sklepu wg F-26, 080), 07 (6 testów kontraktu).
- Przegląd 015 (zakupy + przekład): brak P0/P1/P2. P3 (1.0.1): martwe klucze „Porównanie i statystyki” i dawny długi klucz w EN + 33 słownikach; makieta inne.html:38; lista FUNKCJE_PRO w teście wpisana ręcznie; przecinek w ja/ko, rodzajnik fr („et les statistiques”). Propozycja tr recenzenta odrzucona (zniekształcona: „değil” = „nie”).

## Rola 02 p3 (2026-11-09)
- N1 (P2, P) — decyzja właściciela (zbieram do pytania): docs/monetyzacja.md:10, :50 podaje jako Pro funkcje ukryte w 1.0 (spiżarnia, QR, druk, dalsza Akademia); (a) oznaczyć PÓŹNIEJ + test 015 na wszystkie odłożone (rekomendacja), (b) zostawić jako docelowy zakres Pro z nagłówkiem.
- N2 (P2→P3 wg D-288, klasa: dokumentacja/skrypt): scripts/asc-ustawienia.mjs:338, :351, :374 opisują ceny „ręczne z D-038” i usuwanie oferty razem z buildem (stan sprzed Z-1).
- N3 (P2→P3, klasa: dokumentacja): docs/sztafeta.md:13 wymienia Z-1 jako krok właściciela.
- Zastrzeżenie 057: Z-1 oznaczone na podstawie słów właściciela (docs/wznowienie-M3.md:230) bez zrzutu ASC — przekazanie do 07: sprawdzić w ASC w dniu zgłoszenia (instrukcja §4, 4.1–4.2).
- Przegląd ścieżki wrażliwej (dokumenty cen): M2 sprawdził diff — wartości cen w ceny.json bez zmian (brak zmian liczb w diffie 287de811..9a692b21); tylko odwołania do decyzji.

## Rola 08 p3 (2026-11-09): M2-012 bcf5ac2f, M2-013 7ba9198a, M2-014 4fa0359b
- 08-p3-N1 (P2→P3 wg D-288, klasa: UX/treść): rada przy za zimnej wodzie („Zastąp część wody lodem”, domain-rules.ts:278) nie ma ekranu — receptura.tsx:357 przekazuje tylko zbyt gorącą; opcje (a) pokazać istniejący komunikat (rekomendacja), (b) z pełniejszą radą D-310 po akceptacji 04, (c) zostawić.
- 08-p3-N2 (P2→P3): test palca przy rośnięciu brioszki, znak gotowości dla Lievito Madre [DO USTALENIA] (PIE-BRI-900).
- 08-p3-N3 (P2→P3): „garowanie w lodówce” w podpowiedzi kolizji i „Garowanie chłodnicze” w kopii planu brioszki; spirala nie oznacza nocy dla brioche_cold.
- 08-p3-N4 (P2→P3): „Po co ten krok” przy pizzy na stali mówi o garnku i nacięciu.
- 08-p3-N5 (P2→P3, proces): generator przekładu z wejściem spoza repo odtworzyłby klucz usunięty w M2-013.

## Przegląd M2-012 (2026-11-09)
- Brak P0/P1. P2 (szablon brioszki po naczyniu łapał żytnią w keksówce przy życie ≤ 50%) → naprawione ede75863. P3 (1.0.1): kopia planu „Garowanie chłodnicze”, podpowiedź „wydłuż garowanie w lodówce”, spirala bez nocy dla brioche_cold, test palca przy brioche_proof, ok. 65 min rośnięcia z nagrzewaniem, dwa zdania o kratce (rola 06); przekład P3: ms/id „loyang”→„acuan/cetakan”, tr „kabarma”, hu, et, ru/uk „скатайте”, it „Impastare”.
- Status M2-012/013/014: naprawione-do-weryfikacji (bcf5ac2f + ede75863; 7ba9198a; 4fa0359b) — poza plan-napraw.json (zadania dodatkowe D-308), stan w tym pliku i w raporcie końcowym.
- Przegląd 016: brak P0/P1; P3 poprawione 5589c91e; tekst PL „Zapisz kopię ręcznie…” wobec przycisku „Eksportuj do pliku” — do akceptacji roli 04.

## 070/071 (2026-11-09; wykonawca M2)
- 070-N1 (P1? wymaganie BR-HARMO-001): 15 receptur drożdżowych katalogu (bagietka, chałka, pizza, 8 nowych…) bez planu i prowadzenia — „Ułóż plan” nieaktywne z komunikatem „tylko dla chleba na zakwasie”, czego scenariusz zabrania; orkisz na drożdżach też bez planu. Audyt uznawał scenariusze drożdżowe za spełnione — nie potwierdza się. Do roli 08/03 (decyzja właściciela: budować w 1.0 czy zmienić BR).
- 070-N2 (P2): BR-ETAP-001 gotowość ciasta drożdżowego — żaden krok nie mówi „czas = wskazówka” i test palca razem (yeast-stages.ts).
- 070-N3 (P2): BR-RECP-005 tartine — notatka bez „King Arthur Baking”, Źródła wiedzy bez tej wersji (rola 06/09).
- 070-N4 (P2): BR-RECP-001 „Pizza w stylu neapolitańskim” z dopiskiem „w stylu” (D-097 vs D-177).
- 070-N5 (P2): Stolnica w wersji drożdżowej — karta „Składniki do odważenia” pokazuje „Zakwas 0 g” i nie ma drożdży (SkladnikiKroku.tsx).

## Rola 08 p3b (D-312): 070-N5 cfc4337b, 08-p3-N1 339ecf48, 070-N2 9377bc95 — naprawione-do-weryfikacji
- Wyjątek nazwany: drugi przegląd AI przekładu 070-N2 pominięty — 2 klucze złożone skryptem z istniejących, już przejrzanych przekładów tych samych zdań (bez nowego tłumaczenia); kontrola: check:i18n 0 błędów.
- 08-p3b-N1 (P3): alert zimnej wody ma testID `ddt-too-hot-warning`.
- 08-p3b-N2 (P3, proces): wepnij-maly-przeklad.py zmienia index.ts słowników oznaczonych jako generowane przez scripts/wepnij-przeklad.mjs.
- 08-p3b-N3 (P2→P3): BR-ETAP-001 test palca dla „receptury drożdżowej” vs żyto D-256 — ER roli 01 (dopisane do polecenia 01-p3).
- Teksty do akceptacji roli 04: 2 instrukcje rośnięcia; wygląd komunikatu zimnej wody (alert).

## Rola 01 p3: a2543cbe (ER-83), 5584dd42 (ER-84…86), 5cfe8160 (ER-87), 5aa43faf (ER-88)
- M2-010 wyjaśnione: 2 błędy kontroli BRD (RD-37/38) to wada skryptu kontrola-brd.mjs (nie czyta trzycyfrowych ID źródeł S-1xx), nie BRD; wersja z trzycyfrowymi ID: 0 błędów. → poprawka skryptu w bibliotece ról (rola 01, prompts) — przekazanie M2 do raportu końcowego.
- Odstępstwo nazwane: rola 01 zmieniła nazwy describe w 2 testach (ID BR, bez asercji), licznik BR 84→86 i dopisała BR-UST-004/005 do listy w kontrakt-zm28-058 (lista do zamknięcia w 059).
- Przekazania do 07: testy z ID dla BR-HARMO-001 (receptura drożdżowa katalogu w 1.0, orkisz, żyto 100%) i BR-ETAP-001 (scenariusz żytni) — kod spełnia.
- P2→P3: br-bez-testu ostrzega: BR-KAL-012 ma pełny wyjątek i test (rola 07).

## Rola 03 p3b: 059 (3bebc5ab, 211649bf, 3e0fa3fa) — zakres.mjs --brd kod 0
- Decyzja właściciela (zbieram): apetyt 98 h (F-82, F-83 po 0,5 h) vs 97 h z D-312; rekomendacja (a) 98 h.
- N-3 (P2→P3): nazwa testu kontrakt-zm28-058 zawiera „BR-KAL-012” → br-bez-testu widzi fałszywy test widżetu (rola 07).
- N-4 (P2→P3): „Kolejność i przekazanie” w kontrakcie sprzed rozszerzeń 1.0 (rola 03).
- Przekazania: 01 (statusy ER-84, ER-87), 02 (F-70 bez Basic/Pro; F-82/F-83 „zawsze”).

# Reaudyt: Wzrost (rynek i retencja) — Piekarz — 2026-11-09
Commit: ea249c9c · Tryb: reaudit, pętla 1 (baza 2ef8870a) · Grupa F (KO-006) · Środowisko: Linux x86_64, Node v22.23.4, git 2.43.0, sieć przez proxy (developer.apple.com, thefreshloaf.com, apps4brew.com odczytane 2026-11-09); bez macOS i symulatora. Aplikacja niewydana (TestFlight), więc ocena hipotez po terminie: nie dotyczy (H-01 przed terminem). Dowód: dowody/e0-srodowisko.txt (SHA, korzenie historii, git status).

## Podsumowanie
Dwa naprawione zadania tej roli są zweryfikowane: `docs/wzrost.md` ma kanał startu (The Fresh Loaf) z adresem, odczytaną regułą i datą, budżet 2 h/tydz. i plan na złe przyjęcie (018; cytaty sprawdziłem dziś na surowym tekście strony), a H-01 ma minimalną próbę z ID decyzji (D-315) i datę oceny liczoną z dziennika wydań (084). D-315 oceniam: **utrzymać** — jest spójna z DEC-16 a, z kryterium po 90 dniach w `docs/monetyzacja.md` i z progiem 500 USD, a jej metryki są w App Store Connect bez telemetrii w aplikacji; do weta właściciela trzy poprawki zapisu wokół niej (niżej). Otwarte: 11-wzrost-001 (P3 backlog M1-083) ma dziś wyższą realność, bo kanał startu jest wybrany, a szablon wpisu dalej mówi „14 dni pełnej wersji, potem płatnie”; 11-wzrost-004 częściowo (opis w sklepie poprawiony, `site/index.html` nie). Nowe: 11-wzrost-601 (regresja, P3: test daty oceny czerwienieje przy każdym nowym wierszu TestFlight w dzienniku) i 11-wzrost-602 (istniało wcześniej, P3: dwie różne hipotezy o ID H-01 i 4 aktywne H przy limicie 3).

| ID | Wynik | Dowód |
|---|---|---|
| 11-wzrost-001 | nadal otwarte (M1-083, P3 backlog, „zatwierdzone” bez commitu) | `docs/wzrost.md:88` „Ograniczenia: tylko iPhone, 14 dni pełnej wersji, potem płatnie.”; `docs/wzrost.md:100` „Czy DEC-01 d osiąga próg 500 USD netto/rok na iOS?” |
| 11-wzrost-002 | zweryfikowane (M1-018, DEC-15 a) | `docs/wzrost.md:9` „Budżet godzin tygodniowo: 2 h po wydaniu”; `docs/wzrost.md:59` „Sharing an app you built to address bakers' needs, including your own, is not spam IMO.”; `docs/wzrost.md:71` „Złe przyjęcie”; cytaty potwierdzone dziś (dowody/r1-kanal-tfl.txt); `tests/wzrost-dokument.test.ts` zielony |
| 11-wzrost-003 | nie sprawdzono w grupie F (M1-066, grupa E) | E2E weryfikuje grupa E |
| 11-wzrost-004 | nadal otwarte częściowo (M1-080 dla sklepu: grupa E) | opis sklepu PL: 26 receptur, 11 z planem (sonda: dowody/r1-sonda-katalog-plan.txt); `site/index.html:35` „15 receptur bazowych albo własna” (dowody/r1-004-liczba-receptur.txt); plik nie jest już publikowany (workflow Pages usunięty w 86efd997), żywa karta apps4brew.com bez liczby, ale z „Prowadzenie zakwasu” bez „Pro” (dowody/r1-apps4brew-karta.txt) |
| 11-wzrost-005 | zweryfikowane (M1-084, D-315) | `docs/wzrost/hipotezy.json:19` `min_proba` z `min_proba_decyzja` D-315; `docs/wzrost/hipotezy.json:27` data oceny z reguły dziennika; `tests/wzrost-hipotezy.test.ts` zielony; `hipotezy.mjs` kod 0 (dowody/r1-hipotezy-mjs.txt) |
| 11-wzrost-601 | regresja, P3 | sonda: nowy wiersz TestFlight w dzienniku → `tests/wzrost-hipotezy.test.ts:89` czerwony (dowody/r1-sonda-data-oceny.txt) |
| 11-wzrost-602 | istniało wcześniej, P3 | `docs/wydanie/widocznosc.md:110` drugie H-01; łącznie 4 aktywne H (dowody/r1-h01-kolizja.txt) |

Liczby: zweryfikowane 2, nadal otwarte 2 (001 P3 backlog, 004 częściowo), regresja 1 (P3, nowe), istniało wcześniej 1 (P3, nowe), poza grupą 1.

## Ocena decyzji D-315 (do weta właściciela)
`docs/decyzje.md:1817` — H-01 bez osobnej minimalnej próby (rozstrzyga kryterium liczbowe), data oceny = data wydania + 90 dni z dziennika.

| Pytanie | Wynik | Dowód |
|---|---|---|
| Zgodność z DEC-16 a („decyzja z ID i nowa data oceny po premierze”) | tak: ID D-315, data z dziennika wydań, wartość z rekomendacji (c) znaleziska; status „do weta” zapisany | `docs/decyzje.md:1817`; `docs/wzrost/hipotezy.json:27` |
| Zgodność z kartą hipotez (`hipotezy.json`, `hipotezy.mjs`) | tak w danych (`min_proba: 1` to najmniejsza wartość skryptu; przy małym n przedział Wilsona daje „nierozstrzygnięta”, nie fałszywy werdykt). Rozjazd w `docs/wzrost.md`: wiersz H-01 i reguła rozstrzygania dalej mówią „DEC-01 d” i „zamrożenie”, a JSON i `docs/monetyzacja.md` — D-112/D-113 i „przegląd” (11-wzrost-001) | `docs/wzrost.md:100`; `docs/monetyzacja.md:29` |
| Werdykt skryptu a kryterium | odsetek w skrypcie może wskazać odwrotnie niż kryterium: 8 płacących/mies. przy 300 pobraniach/mies. spełnia kryterium (≥ 7), a skrypt daje „obalona” (2,7%); D-315 i `docs/wzrost.md` pkt 2 mówią jasno, że rozstrzyga kryterium, więc to nie błąd decyzji, tylko pułapka odczytu | scenariusze hipotetyczne: dowody/r1-h01-scenariusze.txt |
| Zgodność z rachunkiem opłacalności | tak: 7 płacących/mies. ≈ 84/rok × ok. 5,94 USD (roczna po prowizji) ≈ 500 USD, 42 USD/mies. ≈ 504 USD/rok; prognoza bramki dla samego iOS (174–218 USD/rok ≈ 14,5–18 USD/mies.) leży poniżej linii przeglądu 21 USD/mies., więc według własnego rachunku wynik to „przegląd”, chyba że widoczność przebije scenariusz normalny — spójne z werdyktem „przerobić” i D-040 | `docs/monetyzacja.md:15`; `docs/monetyzacja.md:29` |
| Mierzalność bez telemetrii (CLAUDE.md) | tak: nowi płacący = zdarzenia „Subscribe” w raporcie zdarzeń subskrypcji + sprzedaż dożywotniego w Sales and Trends, wpływ = „Proceeds”, pobrania = „First Time Downloads” (metryka sklepu dla wszystkich, od 5 pobrań, bez zgody na dane użycia); nic z aplikacji nie wychodzi | odczyt developer.apple.com 2026-11-09 (dowody/r1-asc-metryki.txt) |
| Data oceny | reguła poprawna; zapis „dziś 2027-02-07” liczy od 2026-11-09, a reguła mówi „ostatni wiersz + 90” (2026-11-08 + 90 = 2027-02-06) — różnica jednego dnia bez skutku; trzecia data tej samej kotwicy w kontrakcie: 2027-03-31 (03-zakres-601) | `docs/decyzje.md:1819`; `docs/wydanie/dziennik.md:21` |

**Wynik: utrzymać D-315** z powodem: spełnia DEC-16 a, nie przeczy kryterium ani progowi, jest mierzalna z App Store Connect bez telemetrii. Do weta właściciela trzy poprawki zapisu (bez zmiany decyzji): (1) wiersz H-01 i reguła w `docs/wzrost.md` według JSON (D-112/D-113, „przegląd”, nie „zamrożenie”) — to 11-wzrost-001; (2) test daty oceny tylko z wierszem App Store, nie z każdym wierszem TestFlight — 11-wzrost-601; (3) jedno H-01 w projekcie — 11-wzrost-602. Opcja odrzucona: zmienić D-315 na minimum 166 (D-315 opcja b) — kryterium jest liczbą bezwzględną na miesiąc, więc minimum dla odsetka niczego nie rozstrzyga.

## Hipotezy
| H | Próg (ID decyzji) | Min. próba | Data oceny | Stan |
|---|---|---|---|---|
| H-01 (`docs/wzrost/hipotezy.json`) | kryterium ≥ 7 nowych płacących/mies. albo ≥ 42 USD/mies. (D-112, D-113); w skrypcie ≥ 8,5% pomocniczo | 1, D-315 | wydanie + 90 dni, do wydania 2027-02-07 | przed terminem, bez oceny (`hipotezy.mjs` kod 0, dowody/r1-hipotezy-mjs.txt) |
| H-01…H-03 (`docs/wydanie/widocznosc.md`, rola 10) | ≥ 25% / 30% / 40% (D-055) | 100 / 200 / 30 | 2027-03-31 | przed terminem; kolizja ID i limitu: 11-wzrost-602 |
Hipotez po terminie: brak. Propozycje statusów H i ZAL: bez zmian.

## Próbka regresji
- Zmienione w obszarze: `docs/wzrost.md`, `docs/wzrost/hipotezy.json` (dowody/r1-diff-stat-obszar.txt) — nowe: 11-wzrost-601; sprawdzone cytaty kanału (zgodne).
- WZR-04 (pliki niezmienione `src/lib/prosba-o-ocene.ts`, `src/lib/prosba-o-ocene-wywolanie.ts`): 35/35 testów, kod 0 (dowody/r1-regresja-wzr04.txt).
- WZR-10: brak SDK analityki w `package.json` i lockfile (grep kod 1, 0 trafień; dowody/r1-regresja-wzr10.txt).
- WZR-01 (poza zmienionymi plikami): żywa karta Piekarza na apps4brew.com — patrz 11-wzrost-004.
- Uwaga do kanału: zdanie „Spam will not be tolerated.” stoi na liście forów przy dziale „Off Topic”, nie przy „Introductions and Ideas” (dowody/r1-kanal-tfl.txt); `docs/wzrost.md:59` cytuje je jako regułę „listy forów”, co jest prawdą, ale reguła nie dotyczy działu wpisu. Główna podstawa (wypowiedź administratora Floydm w node/80160) jest dosłownie na stronie.

## Znaleziska (szczegóły)

### 11-wzrost-601 · Test daty oceny H-01 czerwienieje przy każdym nowym buildzie TestFlight wpisanym do dziennika wydań
- Pozycja listy kontrolnej: WZR-09
- Poziom: P3 (nowe P2 → P3 według D-288; klasa: backlog 1.0.1, test)
- Realność: realny (następny build kandydata 1024 dopisze wiersz) · Pewność: wysoka
- Rodzaj: D
- Dowód: `tests/wzrost-hipotezy.test.ts:89` „expect(h.data_oceny >= plus90(ostatni)).toBe(true);”, gdzie `ostatni` to ostatni wiersz dziennika dowolnego kanału; sonda w worktree z wierszem „2026-11-12 … TestFlight”: test „data_oceny = data wydania z dziennika + 90 dni…” ✕, kod 1 (dowody/r1-sonda-data-oceny.txt).
- Mechanizm: reguła D-315 „do wydania nie wcześniej niż ostatni wiersz + 90” wiąże datę oceny hipotezy po premierze z buildami testowymi; każda zmiana dziennika przez rolę 10 wymaga równoległej zmiany `hipotezy.json`, inaczej `npm test` (i `npm run verify`) jest czerwony.
- Powraca: nie
- Wzorzec lub źródło: zasada wspólna 21 (czerwony workflow to znalezisko — tu wywołany pracą innej roli); zasada roli 1 (koszt właściciela).
- Kroki w aplikacji: brak; skutek: czerwone CI po wpisie builda do dziennika.
- Opcje: (a) przed wydaniem test sprawdza tylko `data_wydania = null` i brak wiersza „App Store”, a datę oceny wylicza w dniu wydania — zmiana jednego testu i zdania w D-315 (do weta); (b) zostawić jako celowe przypomnienie — każdy build TestFlight wymaga edycji hipotezy. Rekomendacja: (a).
- Test akceptacyjny: sonda z dodanym wierszem TestFlight daje zielony test; wiersz „App Store” bez `data_wydania` dalej daje czerwony.
- Status: otwarte

### 11-wzrost-602 · Dwie różne hipotezy o ID H-01 i cztery aktywne H przy limicie trzech
- Pozycja listy kontrolnej: WZR-09
- Poziom: P3 (nowe P2 → P3 według D-288; klasa: backlog 1.0.1, dokumentacja)
- Realność: realny · Pewność: wysoka
- Rodzaj: D
- Dowód: `docs/wydanie/widocznosc.md:110` „pobrania pierwszorazowe ÷ odsłony strony z App Store Search, USA i GBR” jako H-01 (z H-02, H-03, min. próba 100, ocena 2027-03-31, „najwyżej 3 aktywne”); `docs/wzrost/hipotezy.json:6` H-01 = model Basic/Pro; D-315 mówi o „H-01” bez pliku. Ten sam stan w 2ef8870a (`git show 2ef8870a:docs/wydanie/widocznosc.md`, linia 110; dowody/r1-h01-kolizja.txt).
- Mechanizm: rola 10 (M5) i rola 11 numerują hipotezy osobno; `grep -rnE "\bH-0[1-3]\b" docs` łączy hipotezy BRD (H-03 przejrzystość opłat), widoczności i wzrostu. Aktywne H wzrostu i pomiaru: 1 + 3 = 4.
- Powraca: nie
- Wzorzec lub źródło: moduł `pomiar-prywatny` („Aktywne H: najwyżej 3”); skrypt `hipotezy.mjs` odrzuca powtórzone ID w jednym pliku, ale nie widzi drugiego pliku.
- Kroki w aplikacji: brak; skutek: reaudyt po premierze może ocenić nie tę H-01, a lista zależności (`grep H-01`) miesza trzy znaczenia.
- Opcje: (a) hipotezy widoczności jako H-02…H-04 w `hipotezy.json` (jeden plik, jedna numeracja), z decyzją właściciela, które 3 są aktywne — ok. 15 min roli 11 z rolą 10; (b) prefiks pliku (np. WID-01) w `widocznosc.md` — mniej zmian, ale dwa skrypty oceny. Rekomendacja: (a).
- Test akceptacyjny: `grep -rnE "\| H-01 \|" docs` wskazuje jeden plik; `hipotezy.mjs` na jednym pliku z najwyżej 3 aktywnymi H kod 0.
- Status: otwarte

## Kontrola dowodów i sekretów
Wynik `node audit/M1-2026-11-08/narzedzia/sprawdz-raport.mjs <ten raport> /home/user/piekarz audit/M1-2026-11-08/reaudit-2026-11-09/11-wzrost --rola 11-wzrost`:

```
OK: odwołania, cytaty, pliki dowodów i sekrety sprawdzone; format raportu 11-wzrost
kod wyjścia 0 (2026-11-09, ostatni przebieg po wklejeniu wyniku)
```

## Decyzje dla właściciela
1. D-315: utrzymać (rekomendacja) albo zawetować; przy utrzymaniu — poprawki zapisu z 11-wzrost-001, -601, -602.
2. 11-wzrost-001 (P3 backlog M1-083): przenieść przed pierwszy wpis na The Fresh Loaf — szablon dziś zapowiada płatność po 14 dniach, choć Basic jest darmowy na zawsze (2.3.1(a) „promoting a false price … outside of the App Store”); praca ok. 20 min roli 11.
3. 11-wzrost-004: `site/index.html` poprawić albo usunąć z repo (strona nie jest już publikowana stąd); karta na apps4brew.com: dopisać „(Pro)” przy prowadzeniu zakwasu, jak w sklepie (DEC-05 a) — repo `apps4brew-www`, poza tym audytem.

Stan plików śledzonych: `git status --porcelain` puste na początku (dowody/e0-srodowisko.txt) i na końcu (dowody/e3-git-koniec.txt).

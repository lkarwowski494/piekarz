# Audyt: Studio Projektowe (UX, marka, przepływy) — Piekarz — 2026-11-08
Commit: 2ef8870a525485cc1ac57e5abe9d97d9937dfe42 (HEAD zgodny z poleceniem M1) · Tryb: audit, wariant głęboki · Moduły: render-i-krytyka, pamiec-portfolio, kontekst-oczy-zajete (ręce zajęte, kuchnia), przeplywy-i-gesty · Środowisko: Linux x86_64, Node v22.23.4, git, Playwright 1.63 z Chromium w `/opt/pw-browsers`, sieć przez proxy (App Store Search API, w3.org działały), MCP GitHub do odczytu (CLI `gh` bez ważnego tokenu). Nie działało: Expo web (projekt go nie wspiera: brak `react-native-web` i `react-dom` w `package.json`), Xcode i symulator iOS (Linux). Wyniki `npm ci`, typecheck, lint i `npm test` z `wspolne/` (wszystkie kod 0, 6017 testów), nie powtarzane.

## Podsumowanie
System wyglądu Piekarza jest dojrzały i w kodzie trzymany konsekwentnie: cztery warianty kolorów (jasny, ciemny i oba ze „Zwiększ kontrast”) przez `DynamicColorIOS`, 192 wymagane pary kontrastu bez braków (kod 0), element firmowy (spirala planu) niesie prawdziwe dane, ma opis dla VoiceOver i respektuje „Ogranicz ruch”, ikona i ekran startowy pochodzą z tokenów, a główna akcja prowadzenia („Zrobione” 64 pt w pasku kciuka) pasuje do kuchni. Najważniejsze ryzyko leży w prowadzeniu wypieku, czyli w ekranie głównej pracy: pas ze spiralą zajmuje prawie cały ekran, więc instrukcja bieżącego kroku i ostrzeżenie bezpieczeństwa (np. gorący garnek) są poza pierwszym ekranem na mniejszych iPhone’ach (001), a stuknięcie wiersza w arkuszu „Plan wypieku” bez ostrzeżenia przestawia trwający wypiek, bez możliwości cofnięcia (002). Siedem arkuszy, w tym ten plan, nie przeszło na system kart, choć właściciel zażądał tego dla wszystkich ekranów (D-139) (003). Nie widziałem działającej aplikacji poza dwoma zrzutami z E2E, więc SP-07, SP-13, SP-15 i SP-19 na urządzeniu pozostają do sprawdzenia przez właściciela (lista zrzutów w „Decyzjach dla właściciela”). Do decyzji: sposób naprawy 001 i 002, objęcie arkuszy systemem kart (003) i wpis Piekarza w pamięci portfolio.

| ID | Poziom | Rodzaj | Tytuł | Status |
|---|---|---|---|---|
| 04-studio-projektowe-001 | P1 | D | Na prowadzeniu instrukcja kroku i ostrzeżenie bezpieczeństwa są pod pasem, poza pierwszym ekranem | otwarte |
| 04-studio-projektowe-002 | P1 | D | Stuknięcie kroku w arkuszu „Plan wypieku” przestawia trwający wypiek bez pytania i bez cofnięcia | otwarte |
| 04-studio-projektowe-003 | P1 | P | Siedem arkuszy poza systemem kart (D-139, D-141), w tym „Plan wypieku” z gołym nagłówkiem | otwarte |
| 04-studio-projektowe-004 | P2 | D | Rozmiary tekstu i promienie wpisane liczbami poza tokenami, w tym 10 pt na osi czasu planu | otwarte |
| 04-studio-projektowe-005 | P2 | D | Czerwone iOS E2E na master (#96): arkusz zgody na powiadomienia zostaje nad prowadzeniem | otwarte (naprawa scenariuszy zaplanowana: D-280, E2E-95) |
| 04-studio-projektowe-006 | P2 | D | Własny przełącznik przypomnień zamiast systemowego | otwarte |

Liczby: P0 0, P1 3, P2 3.

## Linia bazowa i założenia

**E0 (zakres, decyzje, środowisko).** Przeczytane: `CLAUDE.md` (stan projektu 2026-11-02), `docs/sztafeta.md` (wiersze roli 04 i 08), rejestr `docs/decyzje.md` (indeks całości; treść decyzji wyglądu i interakcji: D-045…D-051, D-063, D-083, D-087, D-105, D-117…D-122, D-139…D-142, D-161…D-163, D-180…D-186, D-191…D-199, D-214…D-216, D-219, D-238, D-279, D-280), `docs/DECISIONS.md` (indeks do D-034; D-031: bez Apple Watch, Live Activity i widżetów), kontrakt zakresu `docs/scope-contract.md` (główna praca, tabela F z kolumną „Intuicyjność”), `docs/design/karty/README.md` §1–§4, `docs/zalozenia.md` (ZAL-031…ZAL-036). Stan projektu z polecenia M1 (TestFlight build 1023, testuje tylko właściciel; pytań o stan nie zadaję). Bramka opłacalności (zasada 20): wynik „przerobić”, 345 USD netto/rok wobec progu 500 (`docs/monetyzacja.md`, `docs/monetyzacja-badanie-2026-10.md`), użyty jako wyjątek nazwany decyzją właściciela 2026-11-08; praca mimo werdyktu (D-040). Stan CI (`wspolne/ci.txt`): CI #117, TZ Matrix #77 i TestFlight #23 zielone; iOS E2E #96 na 2ef8870a czerwone (005); Nightly bez zielonego przebiegu w oknie 11-02…11-08 (obszar roli 07, tu tylko odnotowane). Środowisko: `dowody/e0-srodowisko.txt`.

**Źródło obrazu aplikacji.** Expo web niedostępny (warunek modułu niespełniony), więc w trybie z poleceniem M1 („na STOP nie czekasz”) audyt idzie bez zrzutów właściciela. Zastępczo: (1) artefakt prawdziwego E2E z symulatora iOS na tym commicie (run 42511355281: przebiegi scenariuszy 01–05 i 2 zrzuty, `dowody/ci-e2e96-artefakt.txt`), (2) zrzuty wzorcowe systemu kart `docs/design/karty/zrzuty/` (makiety HTML, nie aplikacja), (3) zrzuty właściciela z buildu 1021 (`docs/design/uwagi-wlasciciela-2026-11-03/`, sprzed redesignu), (4) kod. Wyjątek nazwany: polecenie M1 pozwala w katalogu wyjścia tylko na `.md` i `.txt`, więc arkusze i zrzuty z tej sesji leżą w scratchpadzie (`/tmp/claude-0/-home-user/79768a3e-707c-5f03-ab3b-256fa3738af3/scratchpad/`: `konkurencja/arkusz-konkurencja.jpg`, `e2e96-para.png`, `ikony-arkusz.png`, `wzorce-karty.png`, `wlasciciel-1021.png`), a podkatalogu ze zrzutami raport nie ma.

**E0b: kontekst użycia ustalony od nowa (przed lekturą starego `design-spec`).**
- Główna praca (J-02 z J-01 i J-05): wypiek 12–36 h z przerwami. Kroki czynne (mieszanie, składanie, formowanie, pieczenie) robi się przy blacie: ręce mokre od ciasta lub w mące, przy piekarniku w rękawicach; telefon leży albo stoi ok. pół metra od oczu; spojrzenia krótkie. Kroki wieczorem, w nocy i o świcie (ciemny motyw), w dzień w jasnej kuchni. Między krokami telefon śpi, sygnał przychodzi z powiadomienia (ZAL-032 potwierdzone). Hałas: okap, mikser; dźwięk pomocniczy, nie jedyny.
- Wniosek dla wzorca: ekran kroku ma dawać „co teraz zrobić, ile czasu, co dalej” jednym spojrzeniem i jedną dużą akcją w zasięgu kciuka (moduł oczy-zajęte pkt 6; Crouton w trybie gotowania: „I spent a lot of time figuring out what to leave out”, cytat z promptu roli). Ten wzorzec wprost zapisuje też kryterium F-07 w kolumnie „Intuicyjność” kontraktu zakresu: bieżący krok, co zrobić i ile czasu na jednym ekranie.
- **Skan klisz kategorii** (App Store Search API, US, DE, PL, odczyt 2026-11-08; `dowody/e0b-konkurencja.txt`, arkusz zrzutów sklepu 6 aplikacji w scratchpadzie): Loaflo, Rise, West Coast Sourdough, Kneady, Sourdough Starter Tracker, Levain. Klisze: beżowo-brązowe i kremowe tła, szeryf w tytułach, zdjęcia bochenków i kłosy, okrągłe wskaźniki „gotowości”, skan AI zakwasu, czat „AI sous chef”. Recenzje US (RSS, ta sama data): pochwały za „what time on the clock to perform every step” (Rise), skargi na brak pauzy minutnika i na brak powiadomień o karmieniu. Piekarz nie powtarza żadnej z klisz: nocny pas, spirala koszyka z danymi planu, bez zdjęć i bez AI.
- **Wzorzec najlepszych:** Rise (plan z godzinami kroków i powiadomieniami: najbliższy funkcjonalnie, z recenzji), Crouton (tryb gotowania: tylko bieżący krok), HIG „Express your brand with familiar components” (cytat z promptu roli). Wniosek: przewaga Piekarza (offline, plan wstecz z ochroną snu, spirala) jest realna; słabe miejsce to gęstość ekranu kroku (001).
- **Wymiary pokrycia:**
  - Konteksty użycia: jak wyżej; sprawdzone na prowadzeniu (001), planie (004), Dziś. Ekran nie gaśnie tylko w kroku czynnym (`src/components/stolnica/ProwadzenieWypieku.tsx:319`).
  - Stany kluczowych ekranów: pierwsze uruchomienie (pusta spirala), pusty filtr, pusty Dziennik i Zakwasy, brak zgody na powiadomienia (`NotificationsOffBanner`), bez sieci przy zakupie, uszkodzony stan (baner ratunkowy), „za późno” w planie, kolizja ze snem — zaprojektowane i obecne w kodzie; błędy eksportu bez „co zrobić” odłożone decyzją (D-121, 015/016).
  - Element firmowy: spirala niesie kroki planu, postęp, noc w lodówce i godzinę „gotowe”; na pasie „noc” i „przed nami” mają ten sam kolor, a różni je kreskowanie (`src/components/Spirala.tsx:85`, legenda z kreską „2 5”); opis VoiceOver jako etykieta obrazu; brak spirali w pustym stanie zastępuje pusta spirala z adnotacją.
  - Podłogi dostępności: kontrast kod 0 (SP-04), nic tylko kolorem (spirala: grubość i kreska; kolizja: ikona i „W nocy”), tekst bez blokad skalowania poza nazwanymi wyjątkami (SP-07), cele 44/48/64 pt, gesty z alternatywą, „Ogranicz ruch” w spirali.
  - Ruch, haptyka, dźwięk: haptyka przy „Zrobione”, „Cofnij”, końcu kroku; dźwięk końca kroku zawsze z haptyką i ogłoszeniem VoiceOver (`src/lib/timer-audio.ts`); dźwięk respektuje przełącznik wyciszenia (expo-audio: `playsInSilentMode` domyślnie `false`, `node_modules/expo-audio/ios/AudioRecords.swift:4`, aplikacja tego nie zmienia), haptykę wyłącza ustawienie systemu.
  - Obecność poza ekranami: ikona jasna, ciemna i „tinted” 1024×1024 bez alfy (SP-21), ekran startowy z tokenami, powiadomienia z dźwiękiem systemowym; widżetów i Live Activity nie ma (D-031); zrzuty w sklepie: rola 11 i 10.
  - Głos i teksty: bez emoji (`dowody/sp11-emoji.txt`: 0 emoji w interfejsie, gwiazdki oceny to znak, nie ozdoba), prośba o zgodę z „po co” jednym zdaniem, potwierdzenie „Usuń wszystkie dane” mówi o kopiach w Plikach (D-082).
  - Motyw ciemny i zwiększony kontrast: cztery pełne palety w tokenach, nie odwrócone kolory (`src/ui/motyw.ts:25`).
  - Lokalizacja: najdłuższy język z pomiaru (fr 1,20×, najdłuższe słowa fi i de, D-048), reguła łamania przy 320 pt i AX5 (D-142), krój tytułów wyłączony dla vi, ja, ko, zh-Hant, uk, ru, sr (`src/ui/kroj-tytulow.ts`). Formaty liczb i dat: rola 09.
- **Soczewki (po kolei, bez subagentów, zgodnie z poleceniem M1):**
  1. Ręce zajęte w kuchni: „Zrobione” 64 pt i „Cofnij poprzedni” 48 pt w pasku kciuka — dobrze; instrukcja i ostrzeżenie poza pierwszym ekranem — 001; arkusz planu reaguje na przypadkowe stuknięcie — 002.
  2. VoiceOver i AX5: role i etykiety obecne (`dowody/sp18-role.txt`; trafienia skryptu bez roli okazały się przyciskami z rolą w dalszych atrybutach), etykieta „Zrobione: {krok}”, ogłoszenie „Teraz: {krok}”, „Pogrubiony tekst” dla własnego kroju (`src/ui/pogrubiony-tekst.ts:15`); przy AX5 pas prowadzenia rośnie (spirala do 220 pt), więc 001 jest tam jeszcze silniejsze.
  3. Krytyk klisz: brak klisz kategorii; system kart (jednakowe białe karty z ikoną) leży blisko „zestawu kart SaaS” z kalibracji, ale to decyzja właściciela okiem (D-139, D-141) z hierarchią promieni i bez cieni (D-140); rozpoznawalność niesie spirala i nocny pas. Gdzie spirali nie ma (Receptury, Dziennik, Ustawienia, arkusze), aplikację po zakryciu nazwy rozpozna się tylko po kolorze pasa — odnotowane, bez znaleziska (decyzja D-119 A wbrew rekomendacji B roli 04).
  4. Nowa osoba: pierwsza wartość w 2 stuknięciach (P1 w `przeplywy-as-is.md`), bez konta i samouczka; jedyna niejasność to para „Zacznij wypiek” / „Zaplanuj” przy starcie w przyszłości (Do sprawdzenia, `to-be.md` T3).
- **Rejestr założeń:** ZAL-033 (ręce w cieście utrudniają dotyk) — zostaje hipotezą; nowe recenzje jej nie dotyczą. Znalezisko 001 od niej nie zależy (instrukcja jest potrzebna niezależnie od rąk). Zależne wpisy (`grep -rln "ZAL-033"`): `docs/brd/odkrywanie.md`, `docs/design/00-rozpoznanie.md`, `docs/scope-contract.md`. Brak propozycji zmiany statusu.

## Pokrycie (co sprawdzono, czego nie)
| Obszar / pliki / ekrany | Sprawdzone? | Jak (plik dowodu) |
|---|---|---|
| Tokeny i motyw (`src/ui/tokeny.ts`, `motyw.ts`, `theme.ts`, `kroj-tytulow.ts`, `pogrubiony-tekst.ts`) | tak, w całości | odczyt; `dowody/sp04-kontrast.txt` |
| Kontrast 4 wariantów | tak | `dowody/sp04-kontrast.txt`, `dowody/sp04-wcag-1411.txt` |
| Literały kolorów, krojów, rozmiarów, promieni w `app/` i `src/` | tak (grep całości) | `dowody/sp03-literaly.txt` |
| Cele dotykowe | tak, heurystycznie (skrypt + odczyt 9 miejsc) | `dowody/sp06-cele.txt` |
| Skalowanie tekstu | tak w kodzie; AX5 na urządzeniu nie | `dowody/sp07-skalowanie.txt` |
| Ruch, haptyka, dźwięk | tak w kodzie | `dowody/sp08-ruch.txt` |
| Słownik akcji, komunikaty błędów, emoji | tak (grep) | `dowody/sp09-slownik.txt`, `dowody/sp10-komunikaty.txt`, `dowody/sp11-emoji.txt` |
| Role i etykiety VoiceOver | tak (skrypt + odczyt); kolejność czytania na urządzeniu nie | `dowody/sp18-role.txt` |
| Gesty | tak w kodzie; na urządzeniu nie | `dowody/sp20-gesty.txt`, `gesty.md` |
| Ikona, ekran startowy | tak (PIL, `app.json`) | `dowody/sp21-ikona.txt` |
| Przepływy P1–P7 | tak: P1–P4 z przebiegów E2E na symulatorze, P5–P7 z kodu | `przeplywy-as-is.md`, `dowody/ci-e2e96-artefakt.txt` |
| Prowadzenie (`ProwadzenieWypieku.tsx`, `StrefaKroku.tsx`, `PasekKciuka.tsx`, `StrefaPlanu.tsx`, `Spirala.tsx`, `ZgodaPowiadomien.tsx`, `PlanWypiekuArkusz.tsx`, `BakeStepsList.tsx`) | tak, czytane | `dowody/sp17-pas-prowadzenia-rachunek.txt` |
| Plan (`harmonogram.tsx` fragmenty, `PasekStartu.tsx`, `TimelineStagesList.tsx`, `TargetReadyCard.tsx`) | częściowo (fragmenty) | odczyt |
| Dziś, Receptury, Zakwasy, Dziennik, Ustawienia, Doktor, Pro | częściowo: struktura, wybrane komponenty, grep | odczyt |
| Arkusze (`ArkuszDnia`, `ArkuszPlanu`, `PoCoTenKrokArkusz`, `TemperaturaWodySheet`, `ImportRecipeModal`, `ImportZPlikuArkusz`, `PlanWypiekuArkusz`) | tak: style i obecność `Karta` | grep w raporcie (003) |
| Ekrany na urządzeniu (zrzuty ekran × stan × motyw × AX5) | **nie** — brak Expo web i symulatora | lista zrzutów dla właściciela w „Decyzjach” |
| Zakup, przywracanie, arkusze StoreKit | **nie** (krok właściciela) | — |
| Treść merytoryczna tekstów | nie (rola 06) | — |

Krytyczny główny przepływ (prowadzenie) sprawdzony w kodzie i na przebiegach E2E, ale nie na zrzucie z urządzenia; werdykt dla wyglądu na urządzeniu: „nie sprawdzono”.

## Kontrola dowodów i sekretów
`node /home/user/piekarz/audit/M1-2026-11-08/narzedzia/sprawdz-raport.mjs <ten raport> /home/user/piekarz /home/user/piekarz/audit/M1-2026-11-08/role/04-studio-projektowe --rola 04-studio-projektowe` → wynik wklejony niżej po ostatnim przebiegu.

```
OK: odwołania, cytaty, pliki dowodów i sekrety sprawdzone; format raportu 04-studio-projektowe
(kod wyjścia 0; ten sam wynik dla gesty.md, przeplywy-as-is.md i to-be.md bez --rola)
```

`git status --porcelain` (pliki śledzone nietknięte; katalog `audit/` jest w `.git/info/exclude`):

```
$ git status --porcelain
(pusto)
kod: 0 · HEAD 2ef8870a525485cc1ac57e5abe9d97d9937dfe42
```

## Stosowalność listy kontrolnej
| Pozycja | Status (dotyczy / nie dotyczy + powód / decyzja D-xx) | Wynik (ok / znalezisko ID / nie sprawdzono + powód) |
|---|---|---|
| SP-01 przepływ → ekran | dotyczy | ok w próbie (receptura, plan, prowadzenie, zakwas, ustawienia: każdy przycisk ma F z kontraktu; funkcje PÓŹNIEJ ukryte w `src/lib/wejscia-pozniej.ts`); pełnej tabeli wszystkich przycisków nie zrobiono |
| SP-02 element firmowy | dotyczy (D-049) | ok: spirala z danymi planu, w każdym stanie (pusta, jeden i dwa wypieki), z opisem VoiceOver |
| SP-03 tokeny | dotyczy | 04-studio-projektowe-004 |
| SP-04 kontrast | dotyczy (D-045: 4 warianty) | ok: 192 pary kod 0; pary brzegu karty 1,09–1,30:1 nie są wymagane (karta nie jest kontrolką; karta-przycisk ma tekst i szewron, WCAG Understanding 1.4.11, `dowody/sp04-wcag-1411.txt`) — odpowiedź na `[DO USTALENIA]` z D-163 |
| SP-05 nie tylko kolor | dotyczy | ok w kodzie (spirala: grubość i kreska; kolizja: ikona i tekst; Pro: słowo „Pro”) |
| SP-06 cele dotykowe | dotyczy (DEC-15 a: 44/48/64) | ok w kodzie (heurystyka, `dowody/sp06-cele.txt`); pomiar na urządzeniu nie |
| SP-07 skalowanie tekstu | dotyczy | ok w kodzie: ograniczenia tylko nazwane (tytuł pasa i podpisy zakładek 1,5×, D-087, D-120; cyfry czasu do tokenu AX5, D-193); zrzut AX5 z iOS nie sprawdzono (brak urządzenia) |
| SP-08 ruch, haptyka, dźwięk | dotyczy | ok: spirala z «Ogranicz ruch» (`src/components/Spirala.tsx:40`); dźwięk z wyciszeniem, haptyka z ustawieniem systemu (zasada «wyłączalne w systemie», D-121 pkt 013) |
| SP-09 słownik interakcji | dotyczy | ok: „Anuluj/Zamknij” z lewej, „Zapisz/Gotowe” z prawej, „Przywróć” w paskach cofnięcia (D-121), „Odrzucić zmiany?” (D-215), etykiety akcja + obiekt (`dowody/sp09-slownik.txt`) |
| SP-10 stany ekranów | dotyczy | ok w kodzie (wymiar „Stany” wyżej); błędy eksportu bez „co zrobić” rozstrzygnięte D-121 (po 1.0) |
| SP-11 teksty, emoji | dotyczy | ok (0 emoji); głos błędów — jak SP-10 |
| SP-12 domyślne wybory | dotyczy | ok: paleta noc/płótno/ratan i kroje z decyzjami (D-049, D-050, D-105); karty z decyzją (D-139…D-141) |
| SP-13 zgodność z `docs/design/` | dotyczy (linia bazowa: `docs/design/wzorce-zrzuty/`, `docs/design/karty/zrzuty/`) | 04-studio-projektowe-003 (arkusze poza systemem, z kodu); porównanie par zrzutów **nie sprawdzono** (brak obrazu aplikacji) |
| SP-14 kroje | dotyczy (D-050) | ok: Sofia Sans Semi Condensed (OFL, `assets/fonts/OFL-sofiasanssemicondensed.txt`) + systemowy; bez cienkich odmian (`grep fontWeight '100|200|300'`: 0) |
| SP-15 standardowe elementy, alternatywy gestów | dotyczy | 04-studio-projektowe-006; alternatywy gestów ok (`gesty.md`); zachowanie natywne na urządzeniu nie sprawdzono |
| SP-16 ikona, start, intro | dotyczy | ok: ekran startowy z `tlo` obu motywów (`app.json:152`), bez intro, bez reklamy |
| SP-17 kontekst użycia (kuchnia) | dotyczy (P1, nie jazda) | 04-studio-projektowe-001 |
| SP-18 VoiceOver | dotyczy | ok w kodzie; kolejność czytania na urządzeniu nie sprawdzono |
| SP-19 koszt przepływów i przejście poznawcze | dotyczy (moduł przeplywy-i-gesty) | 04-studio-projektowe-005; krok „porażka” w P2 krok 5 ujęty w 001 (pierwszeństwo SP-17 jako źródła), `przeplywy-as-is.md` |
| SP-20 gesty | dotyczy | 04-studio-projektowe-002 |
| SP-21 ikona aplikacji | dotyczy (iOS; Android poza zakresem 1.0) | ok: 1024×1024, tryb RGB bez alfy, warianty light/dark/tinted wpięte (`app.json:57`), czytelna przy 29 pt (arkusz w scratchpadzie) |
| SP-22 | nie dotyczy: moduł `strona-www` nie był wybrany | — |

## Znaleziska (szczegóły)

### 04-studio-projektowe-001 · Na prowadzeniu instrukcja kroku i ostrzeżenie bezpieczeństwa są pod pasem, poza pierwszym ekranem
- Pozycja listy kontrolnej: SP-17
- Poziom: P1
- Realność: realny · Pewność: wysoka
- Rodzaj: D (defekt)
- Dowód: pas prowadzenia składa z `PasZakladki` tytuł kroku, «Krok n z m», czas 56 pt, «potem …», nazwę receptury, spiralę 150–220 pt z legendą i «Gotowe …» (`src/components/stolnica/ProwadzenieWypieku.tsx:329`, `src/components/stolnica/ProwadzenieWypieku.tsx:330`); karta «Co zrobić» i ostrzeżenie są dopiero pod pasem w przewijanej treści (`src/components/stolnica/ProwadzenieWypieku.tsx:344`, `src/components/stolnica/StrefaKroku.tsx:110`), a przy wyłączonych powiadomieniach nad nimi stoi jeszcze baner (`src/components/stolnica/ProwadzenieWypieku.tsx:342`). Projekt sam zapisał skutek: `docs/decyzje.md:1369` (D-238) «pas zajmuje prawie cały ekran (iPhone 17 Pro)». Rachunek [OCENA] w `dowody/sp17-pas-prowadzenia-rachunek.txt`: na iPhonie 17 Pro widać ok. 130 pt treści (nagłówek karty i 3–4 wiersze instrukcji, ostrzeżenie poza ekranem), na iPhonie SE 3. gen. ok. 0 pt, przy dwóch wypiekach na 17 Pro 0–70 pt. Makieta wzorcowa (`docs/design/karty/zrzuty/wypiek-prowadzenie-390-light.png`) ma pas bez spirali i kartę «Co zrobić» oraz ostrzeżenie w pierwszym ekranie; spirala na pas weszła w p4b (D-195, «Do przeglądu roli 04»).
- Mechanizm: treść kroku pod wysokim pasem przewijanym razem z nią; `grep -n "<StrefaPlanu naPasie" src/components/stolnica/ProwadzenieWypieku.tsx` → 1 trafienie (`:330`); ten sam pas z filtrami na Recepturach i Dzienniku rozwiązano przy dużym tekście przeniesieniem pod pas (D-121 b), prowadzenia to nie objęło.
- Powraca: tak, ten sam rodzaj co D-122 (główna akcja poza pierwszym ekranem na „Dziś”, E2E flow 02) i D-238 (przełącznik pod paskiem kciuka) → trwała kontrola: test układu albo E2E z asercją widoczności `karta-kroku` bez przewijania.
- Wzorzec lub źródło: kontrakt zakresu F-07, kolumna „Intuicyjność” (`docs/scope-contract.md:30`: bieżący krok, co zrobić i ile czasu na jednym ekranie); moduł oczy-zajęte pkt 6 (ręce zajęte: jedna duża akcja, bieżący krok widoczny); README systemu kart §3 (spirala na prowadzeniu, `docs/design/karty/README.md:25`).
- Kroki w aplikacji: receptura → „Ułóż plan” → „Zacznij wypiek” → prowadzenie; krok z ostrzeżeniem (np. pieczenie w garnku) na iPhonie SE albo przy dwóch wypiekach: widać czas i „Zrobione”, nie widać, co zrobić ani ostrzeżenia, bez przewinięcia mokrą ręką.
- Weryfikacja przeciwna (E2): (a) czy pas zwija się przy przewijaniu? Nie: czapka pokazuje mały tytuł dopiero po przewinięciu (`EkranZPasem`), pas nie maleje; (b) czy ostrzeżenie dociera innym kanałem? Ogłoszenie VoiceOver mówi tylko nazwę kroku, powiadomienie — nazwę kroku; ostrzeżenie jest tylko w treści; (c) czy decyzja przyjęła ten koszt? D-195 zostawiła miejsce spirali „do przeglądu roli 04”, nie przyjęła utraty instrukcji. Znalezisko zostaje. Wpływ na bezpieczeństwo (ostrzeżenie o gorącym garnku poza wzrokiem) zgłaszam roli 06/07 przez M1; nie podnoszę do P0, bo ostrzeżenie jest na ekranie i w kroku, którego dotyczy.
- Opcje: (A) mała spirala (92 pt) na pasie prowadzenia albo spirala zwijana po pierwszym przewinięciu — instrukcja i ostrzeżenie w pierwszym ekranie, element firmowy mniejszy; (B) pierwsze zdanie instrukcji i ikona ostrzeżenia na pasie nad spiralą — pas jeszcze wyższy przy AX5; (C) zostawić. Rekomendacja: (A) (szczegóły i koszt w `to-be.md` T1).
- Test akceptacyjny: przy 375×667 i 402×874, domyślnym tekście, jednym i dwóch wypiekach, z wyłączonymi powiadomieniami: nagłówek „Co zrobić”, pierwszy wiersz instrukcji i tytuł ostrzeżenia mieszczą się nad paskiem kciuka bez przewijania (test układu z wysokościami albo E2E `assertVisible karta-kroku` bez `scroll`); przy AX5 dopuszczalne przewinięcie (D-142).
- Status: otwarte

### 04-studio-projektowe-002 · Stuknięcie kroku w arkuszu „Plan wypieku” przestawia trwający wypiek bez pytania i bez cofnięcia
- Pozycja listy kontrolnej: SP-20
- Poziom: P1
- Realność: realny · Pewność: wysoka
- Rodzaj: D (defekt)
- Dowód: arkusz „Plan wypieku” otwierany z pasa prowadzenia pokazuje listę kroków, każdy wiersz to przycisk (`src/components/stolnica/BakeStepsList.tsx:84`), który wywołuje skok (`src/components/stolnica/PlanWypiekuArkusz.tsx:43`) i zamyka arkusz; skok przesuwa plan od wybranego kroku na „teraz”, uruchamia zegar od pełnego czasu i czyści cofnięcie (`src/components/stolnica/ProwadzenieWypieku.tsx:239`). Wiersz ma tylko rolę `button` i stan `selected`, bez podpowiedzi, co zrobi.
- Mechanizm: zmiana stanu wypieku jednym stuknięciem w widoku do przeglądania; `grep -rn "onGoToStep" src` (bez testów) → 4 miejsca w jednym łańcuchu (`src/components/stolnica/BakeStepsList.tsx:21`, `:84`, `src/components/stolnica/PlanWypiekuArkusz.tsx:43`, `src/components/stolnica/ProwadzenieWypieku.tsx:405`); inne listy w aplikacji otwierają szczegóły (`gesty.md`).
- Powraca: nie (zachowanie skoku poprawiono w audycie niezależnym D-8 tylko co do godzin; cofnięcia nie dodano) → trwała kontrola w teście `src/__tests__/skok-kroku-d8.test.tsx` (nowa asercja: po skoku jest „Przywróć” i przywraca postęp).
- Wzorzec lub źródło: HIG Gestures (tap „Activate a control; select an item”), heurystyka 3 „Support Undo and Redo” (cytaty w module przepływy-i-gesty promptu); słownik interakcji projektu — rutynowe zmiany z cofnięciem (D-051 1a).
- Kroki w aplikacji: prowadzenie → „Plan wypieku” → stuknięcie wiersza (np. chcąc sprawdzić czas kroku albo przy przewijaniu mokrym palcem) → arkusz znika, wypiek jest na innym kroku z nowym zegarem, „Cofnij poprzedni” nie przywraca stanu sprzed skoku; dalsze powiadomienia przesunięte.
- Weryfikacja przeciwna (E2): czy skok jest celową funkcją? Tak (design-spec §11b „056”, komentarz w `PlanWypiekuArkusz.tsx`), więc znalezisko nie dotyczy istnienia skoku, tylko braku cofnięcia; czy da się wrócić ręcznie? Stuknięcie poprzedniego kroku zaczyna go od nowa od teraz — czas, który już upłynął, przepada. Znalezisko zostaje.
- Opcje: (A) skok z paskiem „Przywróć” (wzorzec `PasekCofnijKroku`) — mały koszt, zgodne ze słownikiem; (B) wiersz pokazuje szczegóły, skok osobnym przyciskiem z potwierdzeniem — jedno stuknięcie więcej przy celowym skoku; (C) zostawić. Rekomendacja: (A) (`to-be.md` T2).
- Test akceptacyjny: test komponentu: po stuknięciu wiersza widać pasek z „Przywróć”; „Przywróć” odtwarza indeks kroku, godziny kroków, zegar i stan „Cofnij poprzedni” sprzed skoku; test czerwony na 2ef8870a.
- Status: otwarte

### 04-studio-projektowe-003 · Siedem arkuszy poza systemem kart (D-139, D-141), w tym „Plan wypieku” z gołym nagłówkiem
- Pozycja listy kontrolnej: SP-13
- Poziom: P1
- Realność: realny · Pewność: wysoka
- Rodzaj: P (decyzja produktowa: zakres systemu)
- Dowód: zasada systemu: na tle ekranu nie leży żaden goły nagłówek ani akapit (`docs/design/karty/README.md:6`); tabela partii README §4 nie wymienia tych arkuszy. Bez `Karta`/`wygladKarty`/`ArkuszKart` (grep „Karta:0”): `src/components/stolnica/PlanWypiekuArkusz.tsx`, `src/components/stolnica/BakeStepsList.tsx` (nagłówek na tle krojem tytułów 16 pt, `src/components/stolnica/BakeStepsList.tsx:75` i `:155`, karta składników z obwódką `akcent`), `src/components/stolnica/PoCoTenKrokArkusz.tsx`, `src/components/calculator/TemperaturaWodySheet.tsx` z `AccordionDdtSection.tsx`, `src/components/kalendarz/ArkuszDnia.tsx`, `src/components/start/ArkuszPlanu.tsx`, `src/components/ImportRecipeModal.tsx`, `src/components/settings/ImportZPlikuArkusz.tsx`. Słowa właściciela przy D-139 (`docs/decyzje.md:768`): wszystko ma być obrobione i zamknięte w karty. Poprzednia weryfikacja objęła 6 arkuszy zamykających przepływy (D-214 pkt 002, D-215); tych siedmiu nie.
- Mechanizm: arkusze dodane albo pominięte poza listą partii README §4; `grep -c '<Karta\|wygladKarty\|ArkuszKart'` → 0 w 9 plikach wyżej (7 arkuszy i 2 komponenty ich treści), 5 w `SkladnikiSheet.tsx` (dla porównania: arkusz objęty systemem).
- Powraca: tak (D-139 → D-214 002: arkusze poza systemem) → trwała kontrola: test, który dla każdego `Modal` z `presentationStyle="pageSheet"` w `src/` wymaga `ArkuszKart` albo nazwanego wyjątku (lista jak w teście czapki „EKRANY”).
- Wzorzec lub źródło: zasada wspólna 15 i 12 (uwagi właściciela ostateczne w wyglądzie); README systemu kart §1.
- Kroki w aplikacji: prowadzenie → „Plan wypieku”; prowadzenie → „Po co ten krok”; receptura → „Temperatura wody”; Dziś → dzień w pasku tygodnia (arkusz dnia); Dziś → plan z listy (arkusz planu); Receptury → import; Ustawienia → import z pliku.
- Weryfikacja przeciwna (E2): czy któryś arkusz ma decyzję wyjątku? Nie znalazłem (grep nazw tych plików w `docs/decyzje.md`: 0 trafień). Czy lista systemowa (wiersze z linią) nie jest dopuszczalna? README §3 zostawia „arkusze” jako systemowe tylko co do zachowania (uchwyt, przyciski), treść ma być w kartach. Znalezisko zostaje; poziom P1 jak D-214 002, bo właściciel uznał wygląd za blokujący 1.0.
- Opcje: (A) wszystkie siedem na `ArkuszKart` + `Karta` w jednej partii roli 08 (bez zmian zachowania), z makietą tylko dla „Plan wypieku” (lista kroków jako `WierszKarty`); (B) tylko arkusze na ścieżce wypieku (Plan wypieku, Po co ten krok, Temperatura wody), reszta po 1.0; (C) zostawić jako systemowe listy iOS i zapisać wyjątek w README §1. Rekomendacja: (A) — wysiłek S–M, wzorzec już istnieje, a 002 i tak zmienia „Plan wypieku”.
- Test akceptacyjny: test „arkusze w systemie kart”: każdy `pageSheet` w `src/` renderuje `ArkuszKart` albo jest na liście wyjątków z ID decyzji; zrzuty 390 jasny/ciemny dla siedmiu arkuszy obok makiet.
- Status: otwarte

### 04-studio-projektowe-004 · Rozmiary tekstu i promienie wpisane liczbami poza tokenami, w tym 10 pt na osi czasu planu
- Pozycja listy kontrolnej: SP-03
- Poziom: P2
- Realność: realny · Pewność: wysoka
- Rodzaj: D (defekt)
- Dowód: `dowody/sp03-literaly.txt` (107 literałów `fontSize` w 29 plikach, 34 `borderRadius`, z czego część w ukrytych modułach PÓŹNIEJ). W ekranach 1.0: oś czasu planu (F-13, główna praca) — godzina dnia 10 pt (`src/components/harmonogram/TimelineStagesList.tsx:154`), znacznik rodzaju kroku 10 pt (`:234`), znacznik kolizji «W nocy» 10 pt pogrubiony (`:255`, tekst `:103`), koniec kroku 11 pt (`:150`), nazwa kroku 14 pt (`:206`); arkusz «Plan wypieku» 11/16 pt; Doktor (`app/doktor.tsx:219`), wynik Doktora (`src/components/doktor/DiagnosisResultCard.tsx:202`), protokoły, garnek (`src/components/stolnica/DutchOvenController.tsx:159`), «Temperatura wody» — 11 i 14 pt. Skala tokenów to 12, 13, 15, 17, 22, 28, 34, 56 pt; HIG podaje minimum 11 pt (tabela «Warsztat grafika» w prompcie roli). Makieta planu (`docs/design/karty/zrzuty/wypiek-plan-390-light.png`) ma godzinę i nazwę kroku w rozmiarze treści.
- Mechanizm: style sprzed systemu kart nieprzepisane na `typografia.style.*` i `promienie.*`; `grep -rnE "fontSize\s*:\s*[0-9]" app src` (bez testów) → 107 trafień w 29 plikach (lista w dowodzie). README §4 zapowiadał „koniec stylu 16/14/11/10 pt” dla Zakwasów; w planie i Doktorze go nie ma.
- Powraca: tak (README §4 przy Zakwasach) → trwała kontrola: reguła lint albo test „brak literału `fontSize`/`borderRadius` w `app/` i `src/components/` poza listą wyjątków z ID decyzji”.
- Wzorzec lub źródło: zasada wspólna 15; HIG Typography (minimum 11 pt, tabela „Warsztat grafika”).
- Kroki w aplikacji: receptura → „Ułóż plan” → oś czasu: dzień startu, rodzaj kroku i „W nocy” drobnym drukiem z odległości blatu.
- Opcje: (A) mapowanie na tokeny (10/11 → `podpis` 12 albo `przypis` 13; 14 → `objasnienie` 15; 16 → `naglowek` 17; promienie → `promienie.*`) w jednej partii; (B) tylko ekrany głównej pracy (plan, prowadzenie, Plan wypieku), reszta po 1.0. Rekomendacja: (A), bo zmiana jest mechaniczna, a kontrola lint zatrzyma powrót.
- Test akceptacyjny: grep/lint z kodem 0 dla `app/` i `src/components/` (poza ukrytymi modułami z listy `wejscia-pozniej`); żaden tekst w ekranach 1.0 poniżej 12 pt.
- Status: otwarte

### 04-studio-projektowe-005 · Czerwone iOS E2E na master (#96): arkusz zgody na powiadomienia zostaje nad prowadzeniem
- Pozycja listy kontrolnej: SP-19
- Poziom: P2
- Realność: brzegowy · Pewność: wysoka (czerwony przebieg), średnia (przyczyna)
- Rodzaj: D (defekt)
- Dowód: `dowody/ci-e2e96-artefakt.txt`: scenariusz `05-dwa-wypieki` na 2ef8870a — stuknięcie „Dalej” zakończone o 19:12:35, potem 15 s czekania na „Zrobione” i „Assertion is false: id: next-or-finish-step-btn is visible”; hierarchia ekranu w kroku 12 nadal zawiera `zgoda-dalej-btn`, zrzuty pokazują arkusz „Dam znać o każdym kroku”. Scenariusze 01–04 zielone. Arkusz: `src/components/stolnica/ZgodaPowiadomien.tsx:23` (`pageSheet`, wysuwanie). Stan CI w `wspolne/ci.txt`.
- Mechanizm: arkusz zgody pokazywany asynchronicznie po odczycie stanu zgody, a stuknięcie testu w czasie wysuwania; ten sam wzorzec opisuje D-279 (E2E-94) i 6 miejsc scenariuszy do utwardzenia (D-280).
- Powraca: tak (E2E-94, D-279) → trwała kontrola: scenariusze czekają na pojawienie się i zniknięcie arkusza (E2E-95), bez opcjonalnego stuknięcia.
- Wzorzec lub źródło: zasada wspólna 21 (czerwony workflow na `main` to znalezisko przed pracą).
- Kroki w aplikacji: start pierwszego wypieku (Zacznij wypiek → arkusz zgody → „Dalej”). Dla człowieka skutek co najwyżej drugie stuknięcie, jeśli pierwsze trafi w wysuwający się arkusz (do sprawdzenia na urządzeniu).
- Opcje: (A) wykonać E2E-95 (D-280) i powtórzyć E2E na HEAD; (B) dodatkowo w aplikacji wyłączyć „Dalej” do końca animacji wysuwania (`onShow`). Rekomendacja: (A); (B) tylko, jeśli właściciel na telefonie potwierdzi zgubione stuknięcie.
- Test akceptacyjny: iOS E2E na master zielony we wszystkich 5 scenariuszach, w obu językach przebiegu.
- Status: otwarte (naprawa scenariuszy zaplanowana: D-280, E2E-95)

### 04-studio-projektowe-006 · Własny przełącznik przypomnień zamiast systemowego
- Pozycja listy kontrolnej: SP-15
- Poziom: P2
- Realność: realny · Pewność: wysoka
- Rodzaj: D (defekt)
- Dowód: wiersz «Przypomnienia o karmieniu» rysuje tor i gałkę z `View` (`src/components/settings/PrzypomnieniaKarmieniaSection.tsx:53`, wymiary `:70`), z rolą `switch` (`:34`); systemowy `Switch` z React Native nie jest użyty nigdzie (`grep -rn "<Switch" app src` → 0). Własny tor 48×28 pt zamiast systemowego, bez animacji przesunięcia gałki i bez koloru systemowego przy «Zwiększ kontrast».
- Mechanizm: jedyny przełącznik w aplikacji; `grep -rn 'accessibilityRole="switch"' app src` → 1 trafienie.
- Powraca: nie.
- Wzorzec lub źródło: zasada studia 3 i HIG „Express your brand with familiar components” (prompt roli); README systemu kart §3: przełącznik systemowy bez zmian zachowania.
- Kroki w aplikacji: Dziś → Ustawienia → „Przypomnienia o karmieniu”.
- Opcje: (A) `Switch` z RN w wierszu (kolor `akcent` jako `trackColor`), cały wiersz dalej stuka; (B) zostawić z zapisaną decyzją. Rekomendacja: (A), wysiłek S.
- Test akceptacyjny: wiersz zawiera `Switch` z `value` i etykietą; test `feeding-reminders-switch` przechodzi.
- Status: otwarte

## Do sprawdzenia (pewność ≤ 80%)
- **„Zacznij wypiek” i „Zaplanuj” przy starcie w przyszłości** (`src/components/harmonogram/PasekStartu.tsx:29`): dwa przyciski o podobnym skutku, różnica nienazwana na ekranie. Brakuje: odpowiedzi 3–5 testerów (przejście poznawcze F-13). Propozycje: `to-be.md` T3.
- **Czas kroku „18:04” na pasie** wygląda jak godzina zegara obok „gotowe jutro o 9:35” (makieta `docs/design/karty/zrzuty/wypiek-prowadzenie-390-light.png`); VoiceOver dostaje etykietę słowną. Brakuje: obserwacji na telefonie, czy ktoś czyta to jako godzinę.
- **Przesunięcie arkusza zgody w dół działa jak „Dalej”** (`src/components/stolnica/ZgodaPowiadomien.tsx:23`) i wywołuje prośbę iOS; łagodne, do oceny na urządzeniu.
- **Wynik Doktora Chleba poza widokiem po wyborze objawu** (D-216 „Do sprawdzenia na urządzeniu”).
- **AX5 i 320 pt na wszystkich ekranach z pasem**, kolejność czytania VoiceOver, wygląd ikon `IkonaKarty` przy „Pogrubionym tekście” — wyłącznie na urządzeniu.

## Co działa dobrze i należy zachować
- Cztery pełne warianty kolorów przez `DynamicColorIOS` i `useMotyw` śledzący „Zwiększ kontrast” (`src/ui/motyw.ts:25`); 192 pary kontrastu bez braku.
- Spirala jako element firmowy z danymi, wariantem na pasie, legendą rozróżnianą kształtem, opisem VoiceOver i „Ogranicz ruch”.
- Pasek kciuka prowadzenia: „Zrobione” 64 pt z etykietą „Zrobione: {krok}” (`src/components/stolnica/PasekKciuka.tsx:46`), cofnięcie obok; ekran nie gaśnie tylko w kroku czynnym.
- Dźwięk końca kroku zawsze z haptyką i ogłoszeniem, z poszanowaniem wyciszenia; prośba o zgodę poprzedzona zdaniem „po co”.
- „Pogrubiony tekst” dla własnego kroju i krój systemowy w językach, których krój nie obsługuje.
- Ikona: spirala na nocnym tle, czytelna przy 29 pt, warianty jasny, ciemny i „tinted”; brak klisz kategorii (beż, szeryf, zdjęcia, AI).
- Reguła dużego tekstu z jednym progiem (D-142, D-162) zamiast ograniczania skali.

## Decyzje dla właściciela
1. **001 prowadzenie:** (A) mała albo zwijana spirala na pasie — **rekomendacja**; (B) pierwsze zdanie instrukcji na pasie; (C) zostawić. Zależy od zgody na zmianę testów pasa (D-194/D-195).
2. **002 skok kroku:** (A) pasek „Przywróć” po skoku — **rekomendacja**; (B) szczegóły kroku + osobny przycisk skoku; (C) zostawić.
3. **003 arkusze:** (A) wszystkie siedem na kartach — **rekomendacja**; (B) tylko ścieżka wypieku przed 1.0; (C) wyjątek w README.
4. **SP-13 linia bazowa aplikacji:** wzorce są (makiety), ale brak zrzutów zbudowanej aplikacji. Opcje: (a) tryb `build` od E3 na obecnym wyglądzie; (b) zrzuty obecnej aplikacji jako linia bazowa — **rekomendacja**, bo system przyjęty (D-141), a brakuje tylko porównania; (c) bez linii bazowej. Lista zrzutów do (b), na iPhonie z buildem 1023, nazwy `<ekran>-<stan>-<szerokość>-<motyw>[-ax5].png` do `docs/design/zrzuty-1023/` (krok właściciela, ok. 40 min): `dzis-pusty`, `dzis-trwa-wypiek`, `dzis-dwa-wypieki`, `receptury-lista`, `receptura`, `plan-dzis`, `plan-start-jutro`, `plan-kolizja-noc`, `prowadzenie-krok-czynny`, `prowadzenie-garnek-ostrzezenie`, `prowadzenie-dwa-wypieki`, `prowadzenie-bez-powiadomien`, `plan-wypieku-arkusz`, `zakwasy-z-zakwasem`, `dziennik`, `ustawienia`, `pro` — każdy na iPhonie SE (375) i największym dostępnym, jasny i ciemny, rozmiar domyślny i AX5.
5. **Pamięć portfolio (pierwszy audyt Piekarza w tej tabeli):** proponowany wpis — Piekarz („Koszyk spiralny”): spirala koszyka do garowania jako plan wypieku od startu do „gotowe”, z nocą w lodówce; pas w kolorze nocy na każdym ekranie, treść w kartach z ikoną ratanu; ikona: spirala z punktem startu. Paleta: noc `#1E4954` (pas, akcent), płótno `#F5F5F2`, tusz `#1C1D1B`, ratan `#9C6B2F`, ostrzeżenie `#F7D117`; ciemny: tło `#141A1C`, akcent `#8FB9C4`. Kroje: Sofia Sans Semi Condensed (tytuły, czasy) + SF Pro. Uwagi właściciela: 20.10.2026 „idziemy w koszyk spiralny” (D-049); 03.11.2026 ekrany poza „Dziś” jak „śmietnik wygenerowany przez AI”, „wszystko… w ładne karty” (D-139). Do zapisu przez właściciela w repo `prompts`: nocny pas + karty z ikoną należą do Piekarza.
6. **Krok właściciela na telefonie (gesty):** lista 7 sprawdzeń w `gesty.md`.

## Proponowane polecenie naprawy
`node tools/assemble.mjs 04-studio-projektowe --tryb fix --zadania 04-studio-projektowe-001,04-studio-projektowe-002,04-studio-projektowe-003,04-studio-projektowe-004,04-studio-projektowe-006`

005 należy do roli 08 (E2E-95, D-280): `node tools/assemble.mjs 08-programista --tryb fix --zadania 04-studio-projektowe-005`.

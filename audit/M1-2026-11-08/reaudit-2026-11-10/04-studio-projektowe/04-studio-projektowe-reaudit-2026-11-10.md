# Reaudyt: Studio Projektowe (UX, marka, przepływy) — Piekarz — 2026-11-10
Commit: 1c723632 · Tryb: reaudit, pętla 2 (M1, grupa G3) · Baza: ea249c9c · Środowisko: Linux x86_64, Node v22.23.4, git, `gh` z odczytem przebiegów i artefaktów, Playwright z Chromium w `/opt/pw-browsers`. Nie działało: Expo web (projekt go nie wspiera; dwie próby w sondzie nieudane, opis w `dowody/render-proby.txt` ), Xcode i symulator iOS (Linux). Obraz aplikacji: zrzuty z symulatora iOS z artefaktu przebiegu iOS E2E 42725323063 na badanym commicie 1c723632 (402×874 pt, pl i en, jeden i dwa wypieki). Dla 320×568, pozostałych kroków, języków i skali tekstu: rachunek układu z kodu, nazwany rachunkiem.

## Podsumowanie

Zadanie M1-audytor-generalny-005 (ID źródłowe 04-studio-projektowe-001) jest naprawione częściowo. Decyzje D-318 i D-319 są wykonane w kodzie, a na zrzucie z symulatora (402×874, pl i en) karta „Co zrobić” i ostrzeżenie są w pierwszym ekranie pierwszego kroku. Zadanie zostaje otwarte z trzech powodów: (1) na kroku pieczenia w garnku, który ma najdłuższą instrukcję i ostrzeżenie o gorącym naczyniu, ostrzeżenie według rachunku zaczyna się pod zgięciem przy 393×852 i przy 320×568, w pl i en; (2) test akceptacyjny sprawdza tylko pierwszy krok w pl i en; (3) w części z pozostałych 33 języków rachunek pokazuje ostrzeżenie częściowo pod zgięciem. Poprawka p4b wprowadziła dwa nowe problemy szlifu na 320 pt (łamanie słów w zwartym pasku kciuka i ściśnięty numer kroku na pasie). To druga pętla z otwartym P1: nie proponuję trzeciej naprawy tym samym podejściem, opcje są w „Decyzjach dla właściciela”.

| ID | Zadanie M1 | Poziom | Wynik | Dowód |
|---|---|---|---|---|
| 04-studio-projektowe-001 | M1-audytor-generalny-005 | P1, D | nadal otwarte (naprawione częściowo) | `dowody/jest-005-1c723632.txt` (kod 0), `dowody/sonda-005-czerwony.txt` , `dowody/pomiar-zrzutow-e2e103.txt` , `dowody/rachunek-ukladu-macierz.txt` (sekcja K: krok pieczenia) |
| 04-studio-projektowe-701 | (nowe, z poprawki d5a6dc4c) | P3 (D-288), D | regresja | `dowody/rachunek-etykiety-320.txt` , `dowody/rachunek-ukladu-macierz.txt` (sekcje J i S) |
| 04-studio-projektowe-702 | (nowe, z poprawki d5a6dc4c) | P3 (D-288), D | regresja | `dowody/rachunek-etykiety-320.txt` , `dowody/rachunek-ukladu-macierz.txt` (sekcje J i S) |
| 04-studio-projektowe-703 | (nowe, poza pętlą) | P3 (D-288), D | istniało wcześniej | `dowody/rachunek-ukladu-macierz.txt` (sekcja S, sk3.1) |

Liczby: zweryfikowane 0, nadal otwarte 1, regresja 2, istniało wcześniej 1.

### Punkty z pliku zadań (a–f)

| Punkt | Wynik | Skąd wynik |
|---|---|---|
| (a) 393×852, pl i en, jeden wypiek | spełnione dla kroku 1. Zrzut z symulatora 402×874: dół ostrzeżenia 601 pt (pl) i 642 pt (en), góra paska kciuka 694 pt, góra „Zrobione” 706 pt. Zrzut pokazuje stan przed startem planu. Rachunek dla 393×852 w kroku z biegnącym zegarem: zapas do dołu widocznej treści +18 pt (pl) i −4 pt (en; pod zgięciem tylko dolne wcięcie pola, tekst widoczny) | pomiar zrzutu: `dowody/pomiar-zrzutow-e2e103.txt` , `zrzuty/e2e103-pl-03-prowadzenie-widok-skupiony-402.png` , `zrzuty/e2e103-en-03-prowadzenie-widok-skupiony-402.png` ; rachunek: sekcja A. Urządzenie 393×852: nie sprawdzono (krok właściciela) |
| (b) 320×568, pl i en, jeden wypiek | spełnione dla kroku 1 według rachunku, z małym zapasem: +22 pt (pl), +2 pt (en). Przy znaku szerszym o 12% zapas spada do −40 pt, więc wynik nie jest pewny | tylko rachunek (sekcje A i Z). Render i zrzut z urządzenia 320×568: nie sprawdzono (krok właściciela) |
| (c) 320×568, dwa wypieki (M2-p4-N9) | potwierdzone: dół ostrzeżenia 482 pt (pl) i 502 pt (en), przełącznik od 410 i 430 pt; pod przełącznikiem chowa się ok. 80 pt pola, czyli większość tekstu, widać tytuł i początek. Poziom P3 i realność „brzegowy” uważam za trafne (dwa wypieki naraz na ekranie 320×568). Przy 402×874 z dwoma wypiekami ostrzeżenie jest całe nad przełącznikiem (zrzut) | rachunek (sekcja A); zrzut `zrzuty/e2e103-pl-05-dwa-wypieki-402.png` . Nie zgłaszam ponownie |
| (d) krok z najdłuższą instrukcją i ostrzeżeniem | niespełnione: krok „Wypiek z parą i rumienienie” (instrukcja 310 znaków pl, 329 en; ostrzeżenie „Gorące naczynie”, dwa zdania). 393×852: dół karty 666 pt przy dole widocznej treści 672 pt, ostrzeżenie do 831 pt (pl) i 787 pt (en). 320×568: dół karty 492 pt, okno do 504 pt, ostrzeżenie do 701 pt (pl) i 679 pt (en). Ostrzeżenie zaczyna się dopiero pod kartą, więc jest pod zgięciem w całości albo poza samym górnym brzegiem | rachunek (sekcja K), teksty w `dowody/teksty-krokow-ostrzezen.txt` ; szczegóły niżej w 001 |
| (e) Dynamic Type AX | od fontScale 2 (AX2 i wyżej) układ zwykły: wszystkie elementy są (test), pas i pasek kciuka się zawijają, a ostrzeżenie jest po przewinięciu (sam pas 647–834 pt według rachunku). Poniżej 2, czyli także przy AX1 (1,786), na niskim ekranie zostaje układ zwarty i łamie słowa: 701, 702. Przy AX5 i 320×568 stały pasek kciuka zajmuje ok. 400 z 568 pt: 703 | kod i test; rachunek (sekcja S). Zrzut AX z iOS: nie sprawdzono (krok właściciela) |
| (f) najdłuższe języki na 320 pt | tytuł kroku się zawija (bez ucinania), czas zmniejsza się w jednym wierszu, „Zrobione” nie jest ucinane, ale w sl i tr łamie się w środku słowa; etykiety przycisków drugich łamią się w słowie w sk, hu, ro, lv, el; numer kroku ściśnięty w bg, lt, it, fi, id: 701, 702. Ostrzeżenie w pierwszym ekranie w innych językach niż pl i en: patrz 001 | rachunek: `dowody/rachunek-etykiety-320.txt` , sekcja J. Języki ja, ko, zh-Hant: model nie jest wiarygodny (szerokość znaku), nie oceniam |

### Wykonanie D-318 i D-319

| Punkt | Wynik | Dowód |
|---|---|---|
| D-318: na pasie tylko tytuł kroku, numer, czas i „potem …” | wykonane | test 393×852 sprawdza listę elementów pasa (kod 0); zrzuty e2e103 pl i en |
| D-318: Spirala z „Gotowe …” w karcie „Plan wypieku” pod kartą kroku | wykonane | src/components/stolnica/StrefaPlanu.tsx:40 „<Text testID="plan-ready" style={styles.gotowe}>{gotowe}</Text>”; zrzuty e2e103 |
| D-319: próg 700 pt i warunek tekstu w kodzie | wykonane | src/ui/niski-ekran.ts:16 „return wysokosc < uklad.niskiEkran && fontScale < DUZY_TEKST;”; src/ui/tokeny.ts:189 |
| D-319: próg i warunek w teście | wykonane, słabo: test sprawdza cztery punkty (568, 667, 852 pt i skalę 3,1), bez granic 699/700 pt i 1,99/2 | src/__tests__/karta-kroku-pierwszy-ekran-005.test.tsx:162 „czyNiskiEkran(568, 1), czyNiskiEkran(667, 1.2)” |
| D-319: zwarty pasek także nad przełącznikiem wypieków, przy każdej wysokości | wykonane, widać na urządzeniu 402×874 | src/components/stolnica/ProwadzenieWypieku.tsx:377 „przyPrzelaczniku={!!naglowekStaly}”; `zrzuty/e2e103-pl-05-dwa-wypieki-402.png` |
| D-319: „Zrobione” 48 pt zamiast 64 pt | w kodzie styl (`minHeight` z tokenu), w teście też tylko styl. Zmierzone na zrzucie z symulatora przy dwóch wypiekach: 48,0 pt; w układzie zwykłym 64,0 pt. Na niskim ekranie 320×568 i 375×667: nie zmierzono (brak urządzenia) | src/components/stolnica/PasekKciuka.tsx:95 „glownyZwarty: { minHeight: theme.cele.glownyPrzeplyw, flexGrow: 1, flexBasis: 96 }”; `dowody/pomiar-zrzutow-e2e103.txt` |
| D-319: „tekst poniżej AX” | rozbieżność słów decyzji i kodu: warunek to fontScale < 2, a AX1 w React Native to 1,786, więc AX1 dostaje jeszcze układ zwarty | node_modules/react-native/React/CoreModules/RCTAccessibilityManager.mm:267 „UIContentSizeCategoryAccessibilityMedium : @1.786” |

## Etap 0: środowisko i metoda

- HEAD kopii roboczej: 1c7236327901e7b693d1934775ecd8bebcd8b865 (zgodny z poleceniem). Sondy tylko w worktree `g3-sonda` w scratchpadzie, usuniętym po pracy.
- Render: próba 1 (`expo export -p web` po doinstalowaniu pakietów web w sondzie) kończy się kodem 1 na pliku wasm z expo-sqlite; próba 2 (konfiguracja Metro dla wasm w sondzie) eksportuje, ale aplikacja w przeglądarce otwiera ekran ratunkowy (`isBoldTextEnabled is not a function`, brak modułu ExpoIap). Zgodnie z poleceniem po dwóch próbach przeszedłem na test układu i rachunek. Serwer zatrzymany, Chromium zamknięty. Zapis: `dowody/render-proby.txt` , `zrzuty/web-proba2-ekran-ratunkowy-393.png` .
- Zrzuty z urządzenia: `gh run view 42725323063` podaje headSha 1c723632 i wniosek success; artefakt `maestro-e2e` zawiera zrzuty przepływów 03 i 05 w pl i en (1206×2622 px, czyli 402×874 pt). To jedyny obraz z iOS na badanym commicie. Nie ma w nim 320×568, 393×852, kroku pieczenia, innych języków ani dużego tekstu.
- Rachunek: model projektu `tests/helpers/uklad-ekranu.ts` (wysokości z tokenów i stylów, tekst łamany przy średniej szerokości znaku 0,5 em), uruchomiony w sondzie na drzewie ekranu `app/stolnica.tsx` dla macierzy: 5 okien, pl i en, jeden i dwa wypieki, wszystkie kroki planu pszennego i żytniego, 35 języków, 6 skal tekstu, czułość na szerokość znaku. Sonda dodała do kopii helpera skalę tekstu i mnożnik znaku ( `dowody/sonda-g3-helper-diff.txt` , `dowody/sonda-g3-uklad.test.txt` ). Porównanie ze zrzutem z symulatora: w tym samym stanie model i zrzut zgadzają się co do dołu pasa (361 pt) i góry „Zrobione”; błąd rachunku oceniam na ±25 pt. Rachunek nie jest pomiarem.
- Stan CI na 1c723632 (`gh run list`): „CI” success, „iOS E2E” success, „Tests across Timezones (TZ Matrix)” failure. Czerwony workflow jest poza zakresem tej roli; zgłaszam koordynatorowi (zasada 21), nie numeruję.

## Znaleziska (szczegóły)

### 04-studio-projektowe-001 · Na kroku pieczenia w garnku ostrzeżenie „Gorące naczynie” jest pod zgięciem; test akceptacyjny sprawdza tylko pierwszy krok w pl i en
- Pozycja listy kontrolnej: SP-17
- Poziom: P1 (bez zmiany; zakres węższy niż w pętli 1)
- Realność: realny · Pewność: średnia (rachunek z kodu skalibrowany jednym zrzutem z symulatora; bez zrzutu tego kroku)
- Rodzaj: D
- Co jest naprawione (dowód z 1c723632):
  - Test akceptacyjny istnieje i przechodzi: 8 testów w pliku, kod 0 ( `dowody/jest-005-1c723632.txt` ).
  - Test pada na kodzie sprzed poprawek z właściwego powodu ( `dowody/sonda-005-czerwony.txt` ): na komponentach z ea249c9c 5 z 8 czerwonych (393×852: dół ostrzeżenia 907 pt przy „Zrobione” od 684 pt; 320×568: 974 pt przy 376 pt); na komponentach z 2f4a260e (sama partia p4) czerwone 320×568 pl i en oraz dwa wypieki; po powrocie do 1c723632 8 z 8 zielonych.
  - Zrzut z symulatora na 1c723632 (402×874): karta i ostrzeżenie kroku 1 w pierwszym ekranie w pl i en; przy dwóch wypiekach ostrzeżenie kroku 2 nad przełącznikiem ( `dowody/pomiar-zrzutow-e2e103.txt` ). Para przed/po: zrzuty pętli 1 (e2e100) i `zrzuty/e2e103-pl-03-prowadzenie-widok-skupiony-402.png` .
  - Według rachunku karta „Co zrobić” mieści się w pierwszym ekranie na każdym kroku planu pszennego i żytniego przy 393×852 i 320×568, w pl i en (sekcja K: zapas karty od +6 pt).
- Co zostaje otwarte:
  1. Krok pieczenia w garnku (faza pod pokrywką), pl i en, 393×852 i 320×568: ostrzeżenie zaczyna się pod kartą, a karta kończy się 6–28 pt nad dołem widocznej treści (393×852) i 12 pt (320×568). Rachunek ręczny na miarach ze zrzutu z symulatora (znak ok. 0,48 em, wiersz 20,5 pt) daje przy 402×874 ok. 36 pt widocznego pola, czyli sam tytuł ostrzeżenia bez zdań; przy 393×852 mniej. Ostrzeżenie renderuje się po karcie: src/components/stolnica/StrefaKroku.tsx:114 „{tytul !== null && <Ostrzezenie”. To samo ostrzeżenie jest w pierwszym ekranie kroku poprzedniego (nagrzewanie), z zapasem −4 do +24 pt.
  2. Test sprawdza tylko pierwszy krok: src/__tests__/karta-kroku-pierwszy-ekran-005.test.tsx:102 „expect(ostrzezeniaKroku(kroki, 0).length).toBeGreaterThan(0);”, i tylko pl i en. Miarą jest góra „Zrobione”, nie dół widocznej treści (pasek kciuka ma 12 pt górnego wcięcia, 8 pt w zwartym), więc test jest o tyle łagodniejszy: src/__tests__/karta-kroku-pierwszy-ekran-005.test.tsx:135 „expect(Math.round(ostrz.y + ostrz.h)).toBeLessThanOrEqual(Math.floor(zrobione.y));”. Test AX5 i test progu przechodzą także na kodzie sprzed poprawki (sonda, wariant A), więc niczego nie rozróżniają.
  3. Inne języki, krok 1 (rachunek, sekcja J; rynek to 35 języków): zapas ostrzeżenia poniżej −40 pt przy 393×852 w fr, sv, nb, es-419, fi, id, ms; przy 320×568 w de, fr, it, fi, el, id, ms (od −60 do −216 pt). W granicach błędu rachunku (od −40 do 0 pt) jest kilkanaście dalszych. Bez renderu to wynik „do sprawdzenia”, nie pomiar.
  4. Okno 375×812 (układ zwykły, bo 812 ≥ 700): rachunek −13 pt (pl) i −57 pt (en) na kroku 1 — do sprawdzenia na urządzeniu.
  5. 320×568 z dwoma wypiekami: znane M2-p4-N9 (punkt c wyżej).
- Mechanizm: zwarty układ odzyskał wysokość pasa i paska kciuka, ale kolejność „instrukcja, potem ostrzeżenie” zostaje; przy instrukcji dłuższej niż ok. 8 wierszy ostrzeżenie wypada pod zgięcie na każdym ekranie do 874 pt wysokości.
- Powraca: tak — 04-studio-projektowe-001 otwarte w pętli 1 i 2 → trwała kontrola: test układu dla każdego kroku planu, nie tylko pierwszego.
- Wzorzec lub źródło: D-319, pole „Odrzucone” (ostrzeżenie po przewinięciu odrzucone jako „bezpieczeństwo poza pierwszym ekranem”); zasada studia 9.
- Kroki w aplikacji: receptura w garnku → „Zacznij wypiek” → krok „Wypiek z parą i rumienienie”.
- Opcje: w „Decyzjach dla właściciela”.
- Test akceptacyjny: test układu przechodzi dla każdego kroku planu pszennego i żytniego, który ma ostrzeżenie, przy 393×852 i 320×568 w pl i en, z miarą „dół ostrzeżenia nie niżej niż góra paska kciuka”; zrzut kroku pieczenia z symulatora (E2E) z widocznym ostrzeżeniem.
- Status: otwarte

### 04-studio-projektowe-701 · W zwartym pasku kciuka etykiety łamią się w środku słowa: „Zrobione” w sl i tr oraz przy powiększonym tekście, przyciski drugie w kilku językach
- Pozycja listy kontrolnej: SP-07
- Poziom: P3 (nowe P2 → P3 według D-288; klasa: układ-niski-ekran, backlog 1.0.1)
- Realność: brzegowy · Pewność: średnia (rachunek, bez renderu)
- Rodzaj: D
- Dowód: src/components/stolnica/PasekKciuka.tsx:95 „glownyZwarty: { minHeight: theme.cele.glownyPrzeplyw, flexGrow: 1, flexBasis: 96 }” oraz src/components/stolnica/PasekKciuka.tsx:97 „drugiZwarty: { flexBasis: 84”. Przy 320 pt tekst głównego przycisku ma ok. 75 pt, a przyciski drugie ok. 76 pt. `dowody/rachunek-etykiety-320.txt` : słowo szersze niż pole w „Zrobione” (sl „Opravljeno”, tr „Tamamlandı”) i w przyciskach drugich (sk, hu, ro, lv, el). Skala tekstu ( `dowody/rachunek-ukladu-macierz.txt` , sekcja S): przy 320×568 od skali 1,12 „Zrobione” ma dwa wiersze (wysokość 66 pt), a przy 375×667 od 1,64 (88 pt).
- Mechanizm: układ zwarty ma stałe podstawy szerokości 96 i 84 pt, które nie zależą od długości etykiety ani skali tekstu; React Native łamie wtedy za długie słowo na znaki. Układ zwarty działa do fontScale < 2, czyli także przy xLarge–xxxLarge i AX1. Przed poprawką (ea249c9c) „Zrobione” miało pełną szerokość, a przyciski drugie podstawę 140 pt z zawijaniem do pełnych wierszy.
- Powraca: nie
- Wzorzec lub źródło: podłogi dostępności, wiersz „Tekst” (kluczowe treści nie są ucinane, układ się przestawia); D-319 („rząd się zawija przy długich tekstach”).
- Kroki w aplikacji: iPhone z oknem 320×568 („Powiększenie ekranu”) albo 375×667 z większym tekstem → prowadzenie wypieku; albo język sl, tr, sk, hu, ro, lv, el na 320 pt.
- Opcje: (a) gdy najdłuższe słowo etykiety nie mieści się w kolumnie, pasek wraca do układu zwykłego (kolumna) — kosztem ostrzeżenia pod zgięciem w tych językach; (b) zwarty układ tylko przy fontScale ≤ 1,1 i etykietach, które się mieszczą, w pozostałych przypadkach zwykły; (c) zostawić i przyjąć. Rekomendacja: (b) razem z rozstrzygnięciem 001.
- Test akceptacyjny: test układu dla 35 języków przy 320×568 i dla skal 1,12–1,79: żadna etykieta paska kciuka nie ma słowa szerszego niż pole; zrzut z urządzenia 320×568 w tr.
- Status: otwarte

### 04-studio-projektowe-702 · Na zwartym pasie 320 pt numer kroku dostaje resztkę szerokości między „wstecz” a akcjami i łamie się na pojedyncze znaki (fi, id, it, bg, lt; pl przy większym tekście)
- Pozycja listy kontrolnej: SP-07
- Poziom: P3 (nowe P2 → P3 według D-288; klasa: układ-niski-ekran, backlog 1.0.1)
- Realność: brzegowy · Pewność: średnia (rachunek, bez renderu)
- Rodzaj: D
- Dowód: src/components/stolnica/PasProwadzenia.tsx:48 „numer: { flex: 1, minWidth: 0”; rząd nawigacji: src/components/nawigacja/PasZakladki.tsx:156 oraz src/components/nawigacja/PasZakladki.tsx:157 (akcje bez kurczenia, `marginLeft: 'auto'`). Przy 320 pt rząd ma 304 pt; po odjęciu „wstecz” (44 pt) i akcji zostaje dla numeru: fi 15 pt, id 15 pt, it 32 pt, bg 32 pt ( `dowody/rachunek-etykiety-320.txt` ). Rachunek wysokości pasa przy 320×568: pl 175 pt, fi i it 229 pt, id 307 pt (sekcja J); pl przy skali 1,35: 319 pt, przy 1,64: 788 pt (sekcja S).
- Mechanizm: numer kroku ma podstawę 0 i rośnie, więc nigdy nie przenosi się do nowego wiersza; gdy etykiety „Doktor” i „Plan wypieku” są długie (język albo skala tekstu), zostaje mu kolumna węższa niż jedno słowo. Pas rośnie i spycha kartę kroku z ostrzeżeniem w dół. Przed poprawką numer był zdaniem pod tytułem na pełnej szerokości.
- Powraca: nie
- Wzorzec lub źródło: podłogi dostępności, wiersz „Tekst”; warsztat grafika, „Kolejność i wyrównanie”.
- Kroki w aplikacji: okno 320×568, język fi, id albo it → prowadzenie wypieku; albo pl z tekstem xxxLarge lub AX1.
- Opcje: (a) numerowi dać minimalną szerokość treści, a rzędowi pozwolić przenieść akcje albo numer do drugiego wiersza; (b) na zwartym pasie numer z powrotem pod tytułem, gdy nie mieści się w rzędzie; (c) zostawić. Rekomendacja: (a).
- Test akceptacyjny: test układu przy 320×568 dla 35 języków i skal do 1,79: numer kroku ma szerokość co najmniej najdłuższego słowa, a pas nie jest wyższy niż w pl o więcej niż jeden wiersz.
- Status: otwarte

### 04-studio-projektowe-703 · Przy AX5 na 320×568 stały pasek kciuka zajmuje ok. 400 z 568 pt, treść przewija się w oknie ok. 166 pt
- Pozycja listy kontrolnej: SP-07
- Poziom: P3 (nowe P2 → P3 według D-288; klasa: dostępność-duży-tekst, backlog 1.0.1)
- Realność: brzegowy · Pewność: średnia (rachunek, bez zrzutu AX z iOS)
- Rodzaj: D
- Dowód: `dowody/rachunek-ukladu-macierz.txt` , sekcja S: 320×568 przy skali 3,1 pasek kciuka 402 pt, dół widocznej treści 166 pt; 393×852: pasek 316 pt. Układ zwykły paska nie zmienił się od ea249c9c (diff pliku: 19 dodanych, 8 usuniętych wierszy, same style zwarte), więc problem istniał wcześniej. Przełącznik wypieków przy dużym tekście jest już przenoszony do treści: app/stolnica.tsx:119 „naglowekStaly={duzyTekst ? undefined : naglowek}”; pasek kciuka nie.
- Mechanizm: przy fontScale ≥ 2 pasek kciuka zostaje stały poza przewijaniem i rośnie z tekstem (trzy przyciski w kolumnie).
- Powraca: nie
- Wzorzec lub źródło: podłogi dostępności, wiersz „Tekst” (przy dużym tekście układ przechodzi w pionowy stos, kluczowe treści dostępne).
- Kroki w aplikacji: Ustawienia iOS → największy tekst dostępności → prowadzenie wypieku na oknie 320×568.
- Opcje: (a) przy dużym tekście przyciski drugie przenieść do treści, stałe zostaje samo „Zrobione”; (b) zostawić. Rekomendacja: (a), po zrzucie AX5 z iOS.
- Test akceptacyjny: zrzut AX5 z iOS przy 320×568: stałe elementy zajmują najwyżej połowę wysokości okna.
- Status: otwarte (istniało wcześniej, poza bieżącą pętlą)

## Próbka regresji

Pliki zmienione od ea249c9c w obszarze roli (16 plików, 175 dodanych i 58 usuniętych wierszy): `src/components/stolnica` (6), `nawigacja/PasZakladki.tsx`, `harmonogram/UstawieniaPlanu.tsx`, `src/ui` (2 i test), `docs/design` (4), `app/(tabs)/receptury/harmonogram.tsx`. Zapis komend: `dowody/regresja-probka.txt` .

| Pozycja | Zakres | Wynik |
|---|---|---|
| Informacja po przeniesieniu Spirali (SP-02) | zmienione pliki | Spirala, nazwa receptury i „Gotowe …” są w karcie „Plan wypieku” pod ostrzeżeniem; nic nie zginęło z drzewa. Godzina końca wypieku nie jest już widoczna bez przewijania (przed poprawką była na pasie; rachunek: dół „Gotowe …” 1022 pt przy oknie do 672 pt). To skutek D-318 przyjętej przez właściciela, nie zgłaszam; godzina końca kroku zostaje na pasie w „do …, potem …” |
| SP-03 literały | zmienione pliki | 0 literałów kolorów i krojów w komponentach. Rozmiar tytułu zwartego liczony jako `tytul2.pt - 2` i podstawy 96, 84, 176, 150 pt bez tokenu — szlif, bez ID |
| SP-06 cele dotykowe | zmienione pliki | pasek zwarty: `minHeight` 48 pt (token), szerokość od 84 pt; przełącznik wypieków `minHeight` 48 pt; przyciski pasa 44 pt. Zmierzone na zrzucie 402×874: „Zrobione” zwarte 48,0 pt. Uwaga do decyzji D-319: przy dwóch wypiekach główny przycisk maleje z całej szerokości × 64 pt do ok. 125 × 48 pt także na dużych ekranach |
| SP-18 VoiceOver | zmienione pliki | role i etykiety bez zmian („Zrobione: {krok}”, przełącznik jako zakładki z etykietą wypieku, kroku i godziny, Spirala jako obraz z opisem). Kolejność na pasie zwartym: wstecz, numer kroku, Doktor, Plan wypieku, tytuł — numer czytany przed tytułem kroku; drobne, bez ID |
| Tryb ciemny i kontrast (SP-04) | poza zmienionymi plikami | `src/ui/__tests__/theme-contrast.test.ts` przechodzi (kod 0), para naPasie2 na pasie ma próg 4,5 w czterech motywach; poprawka nie dodała kolorów |
| SP-08 „Ogranicz ruch” | poza zmienionymi plikami | obsługa w `src/components/Spirala.tsx`; poprawka nie dodała animacji |
| SP-14 kroje | poza zmienionymi plikami | jedna rodzina własna (Sofia Sans Semi Condensed, plik licencji OFL w `assets/fonts`), treść krojem systemowym; bez zmian |
| Limit rozmiaru pliku | zmienione pliki | `ProwadzenieWypieku.tsx` 20 170 B przy limicie 20 480 B: zapas 310 B, następna zmiana wymaga wydzielenia |

Obserwacja bez ID (do sprawdzenia): na zrzutach karta „Co zrobić” i pole ostrzeżenia stykają się bez odstępu, a kolejna karta ma 16 pt odstępu.

## Do sprawdzenia (pewność ≤ 80%)

- Wszystkie liczby dla 320×568, kroku pieczenia, innych języków i skali tekstu to rachunek, nie pomiar. Potrzebne zrzuty z urządzenia albo symulatora (krok właściciela albo E2E): 320×568 i 393×852 w pl i en na kroku 1 i na kroku pieczenia; 320×568 w tr, fi, id; 375×667 przy AX1; 320×568 przy AX5.
- „Zrobione” w pl na 320 pt: rachunek daje 68–72 pt tekstu w polu ok. 75 pt; zapas kilku punktów, do potwierdzenia zrzutem. W uk cyrylica jest szersza niż w modelu i słowo „Зроблено” prawdopodobnie się łamie.

## Decyzje dla właściciela

Zadanie 005 jest otwarte po drugiej pętli. Zamiast trzeciej naprawy tym samym podejściem (odzyskiwanie wysokości) trzy opcje:
1. Inne podejście: na krokach z ostrzeżeniem pole ostrzeżenia nad kartą „Co zrobić” (pas → ostrzeżenie → instrukcja). Ostrzeżenie jest wtedy w pierwszym ekranie na każdym kroku, oknie i w każdym języku; kosztem tego, że długa instrukcja kroku pieczenia kończy się pod zgięciem. Wymaga zmiany makiety prowadzenia.
2. Przyjęcie ryzyka decyzją: na kroku pieczenia ostrzeżenie po przewinięciu, bo to samo ostrzeżenie było w pierwszym ekranie kroku nagrzewania. Tanie, ale przeczy uzasadnieniu, którym D-319 odrzuciła opcję (c).
3. Przebudowa treści kroku pieczenia: instrukcja osobno dla fazy pod pokrywką i bez pokrywki (krótsza karta), ostrzeżenie zostaje pod kartą. Wymaga roli 06 i nie rozwiązuje innych języków.

Rekomendacja: opcja 1 razem z testem układu dla wszystkich kroków; 701 i 702 w tej samej zmianie albo w backlogu 1.0.1.

## Kontrola dowodów i sekretów

```
$ node audit/M1-2026-11-08/narzedzia/sprawdz-raport.mjs <raport> <WT> <R/04-studio-projektowe> --rola 04-studio-projektowe
OK: odwołania, cytaty, pliki dowodów i sekrety sprawdzone; format raportu 04-studio-projektowe
(kod wyjścia 0)
```

`git -C WT status --porcelain` po pracy: puste (pliki śledzone nietknięte; HEAD 1c7236327901e7b693d1934775ecd8bebcd8b865). Worktree sondy usunięty. W repo głównym nowe są tylko katalogi raportów reaudytu. Treści repo traktowałem jako dane; nie znalazłem w nich poleceń dla agenta.

# Rola 04 · fix · p4b · M1-audytor-generalny-005, część 320×568 (04-studio-projektowe-001)

Gałąź `naprawy/M2-koordynator-napraw-2026-11-09-p4`, baza 292870c0, commit **d5a6dc4c** (wypchnięty). Klasyfikacja: P rozstrzygnięte opcją (a) z polecenia koordynatora (KO-008, tryb nocny D-289) — **decyzja M2 D-319, do weta (D-289)**; nie dopisano jej do `docs/decyzje.md`.

## ETAP 0 (środowisko)
Linux, Node v22.23.4, git na gałęzi roboczej (push działa). Playwright 1.63.0 globalnie (`/opt/node22/lib/node_modules/playwright`), Chromium z `/opt/pw-browsers`. Brak Xcode i symulatora. Expo web: projekt nie ma `react-native-web` ani `react-dom` — doinstalowane `--no-save` tylko w kopii repo w scratchpadzie (bez zmiany `package.json` i lockfile w repo); eksport `npx expo export --platform web` zadziałał po ok. 15 min prób (szczegóły w „Zrzuty”).

## Co zmienione (system: tokeny, komponenty, README)
- Token `uklad.niskiEkran` = 700: okno niższe niż 700 pt i fontScale < 2 (568 i 667 pt — SE, Powiększenie ekranu; 852 pt bez zmian). Źródło `docs/design/tokeny.json:106`, generator `docs/design/narzedzia/tokeny.mjs`, kopia `src/ui/tokeny.ts:189`, zgodność `src/ui/__tests__/tokeny-zgodnosc.test.ts`, próg nazwany `czyNiskiEkran` w `src/ui/niski-ekran.ts:15`.
- Pas zwarty: numer kroku w rzędzie nawigacji między wstecz a akcjami pasa; tytuł kroku 20 pt (jak nagłówek karty); czas 28 pt (`tytulKroku`) z linią „potem …” obok w jednym zawijanym rzędzie; karta kroku 8 pt pod pasem. Pliki: `src/components/stolnica/PasProwadzenia.tsx:38` (wydzielony z `ProwadzenieWypieku.tsx`, 20 388 → 20 170 B), `src/components/nawigacja/PasZakladki.tsx:165` (`zwarty`, `srodek`), `src/components/stolnica/StrefaKroku.tsx:56`, `src/components/stolnica/stolnica-screen.styles.ts:76`.
- Pasek kciuka zwarty: trzy przyciski (Zrobione, Cofnij poprzedni, Po co ten krok) w jednym zawijanym rzędzie, cel 48 pt (`cele.glownyPrzeplyw`); ten sam pasek nad przełącznikiem wypieków — tanie rozwiązanie dla 393×852 z dwoma wypiekami. Pliki: `src/components/stolnica/PasekKciuka.tsx:45`, `src/components/stolnica/ProwadzenieWypieku.tsx:377`.
- `docs/design/karty/README.md:73` §7b (reguła i „dlaczego”). Bez nowych tekstów (i18n: tylko `npm run i18n:kontekst`, miejsca istniejących kluczy), bez nowych kolorów; testID i ścieżki E2E bez zmian (`step-number` przeniesiony w obrębie pasa); zegar i kroki bez zmian.
- Test: `tests/helpers/uklad-ekranu.ts:77` — element bez flex i bez szerokości ma w rzędzie szerokość treści (Yoga), wcześniej dzielił miejsce po równo z przyciskiem wstecz („Plan wypieku” przy 320 pt liczony w 2 wierszach, 66 pt; zrzut web: 44 pt). Przy 393×852 wyniki bez zmian (±1 pt). `src/__tests__/czapka-ekranow-p7.test.tsx`: klucz pliku z pasem `PasProwadzenia.tsx` (ten sam ekran, app/stolnica).

## Testy (przed kodem)
- `src/__tests__/karta-kroku-pierwszy-ekran-005.test.tsx:141` (320×568 pl, en), `:181` (393, dwa wypieki: dół ostrzeżenia nad przełącznikiem), `:160` (próg), `:165` (AX5: nic nie znika, układ zwykły).
- Przed (kod 292870c0): 3 czerwone z właściwego powodu — dół ostrzeżenia 723 (pl) i 704 (en) > góra „Zrobione” 376; przy dwóch wypiekach 654 > przełącznik 597 (dowody/p4b-005-test-przed.txt).
- Po: 13/13 zielone (dowody/p4b-005-test-po.txt). Rachunek po: 320×568 pl dół ostrzeżenia 482 / „Zrobione” 512, en 502 / 512; 393×852 bez zmian (654 / 684); dwa wypieki 393: 654 / przełącznik 672.
- `npm run verify` po `git add`: kod 0, 654 zestawy, 6831 testów, macierz 1685/1685 (dowody/p4b-005-verify.txt).

## Zrzuty (Expo web, deviceScaleFactor 1)
Jak: kopia repo w scratchpadzie + `react-dom@19.2.3`, `react-native-web@~0.21.0` (`--no-save`); `metro.config.js` z `wasm` (expo-sqlite web), atrapa `expo-iap` (StoreKit) i polyfill `AccessibilityInfo.isBoldTextEnabled` (iOS), `@font-face` Sofia z `assets/fonts`; trasa `zrzut-005` zapisuje ten sam wypiek co test 005 i otwiera `/stolnica?wypiek=bake_chleb`; zegar stały 1 800 000 000 000 ms (UTC), powiadomienia dozwolone. Web nie ma wcięć iOS: okno = ekran minus pasek stanu (20 / 59 pt) i wskaźnik Home (0 / 34 pt), obraz złożony z tymi pasami, y od góry ekranu. Narzędzia: `narzedzia/web-005/` (poza repo śledzonym). Różnica renderera: krój treści przeglądarki zamiast SF Pro.

Pomiar z DOM (dowody/p4b-005-pomiar-web-przed.txt, dowody/p4b-005-pomiar-web-po.txt; dół ostrzeżenia / góra „Zrobione”, pt):

| Ekran | Przed | Po |
|---|---|---|
| 320×568 pl | 720 / 376 — POD | 464 / 512 — NAD |
| 320×568 en | 678 / 376 — POD | 480 / 512 — NAD |
| 375×667 pl / en | 598 / 533, 618 / 533 — POD | 444 / 611, 420 / 611 — NAD |
| 393×852 pl / en | 637 / 684 — NAD | 637 / 684 — NAD (bez zmian) |
| 393×852 pl, dwa wypieki | ostrzeżenie 446–578 pod przełącznikiem (od 578) | ostrzeżenie do 637 nad przełącznikiem (od 660) |
| 320×568 pl, dwa wypieki | pod przełącznikiem | dalej pod przełącznikiem (369) — otwarte |

Obejrzane narzędziem Read:
- dowody/p4b-005-przed-320x568-pl.png: pas na 3/4 ekranu (tytuł 34 pt w 4 wierszach, czas 56 pt), pod nim od razu pasek kciuka w trzech rzędach; karty kroku i ostrzeżenia nie widać wcale.
- dowody/p4b-005-po-320x568-pl.png: pas zwarty — „‹ Krok 1 z 11 · Doktor · Plan wypieku”, tytuł w 2 wierszach, „30 min” z „do 08:30, potem autoliza (mąka + woda)” obok; cała karta „Co zrobić” i całe żółte „Surowy zakwas” nad paskiem; pasek: „Zrobione” (akcent) | „Cofnij poprzedni” | „Po co ten krok”, każdy w 2 wierszach, 48 pt.
- dowody/p4b-005-po-320x568-en.png: to samo po angielsku; tytuł w 1 wierszu, ostrzeżenie kończy się ok. 30 pt nad „Done”.
- dowody/p4b-005-po-375x667-pl.png: pas zwarty, karta, ostrzeżenie i początek karty „Plan wypieku” ze Spiralą.
- dowody/p4b-005-przed-393x852-pl-dwa.png: ostrzeżenie ucięte przełącznikiem po pierwszym wierszu; dowody/p4b-005-po-393x852-pl-dwa.png: całe ostrzeżenie, pod nim przełącznik, pasek kciuka w jednym rzędzie.
- dowody/p4b-005-po-393x852-pl.png: identyczny z „przed” (pas zwykły, pasek kciuka w dwóch rzędach).

## Krytyka (usterki najpierw)
1. Pasek zwarty: „Zrobione” ma tę samą szerokość co drugie przyciski (ok. 91–99 pt) i 48 zamiast 64 pt; wyróżnia go kolor akcentu i waga, nie rozmiar. Kompromis za miejsce na ostrzeżenie.
2. Drugie przyciski łamią się na 2 wiersze („Cofnij / poprzedni”); w językach z długimi słowami rząd zawinie się w dwa (nic nie znika, ale ostrzeżenie może zejść pod pasek) — niezmierzone dla 33 języków.
3. Tytuł zwarty łamie się z sierotą („szczytu)”); `Krok n z m` stoi w rzędzie nawigacji przed tytułem w kolejności VoiceOver (kolejność czytania = wizualna, ale numer przed nagłówkiem).
4. Przy 320×568 i dwóch wypiekach przełącznik (135 pt) dalej zasłania ostrzeżenie.
Zalety: jeden punkt skupienia (tytuł i czas na pasie), karta z ostrzeżeniem w całości w pierwszym ekranie, przy 393×852 bez zmian, bez nowych kolorów i tekstów.

## Ryzyka
- AX5: układ zwarty wyłączony od fontScale 2 (`src/ui/niski-ekran.ts:15`); test `:165` sprawdza, że przy 320×568 i fontScale 3,1 wszystkie elementy prowadzenia są i pasek kciuka jest zwykły. Zrzutu AX5 brak (web nie ma Dynamic Type) — do E2E iOS. Przy AX1–AX2 (fontScale < 2) zwarty układ z dużym tekstem: zawija się, niezmierzone.
- Rachunek i web to nie iOS: zapas w rachunku en przy 320 tylko 10 pt (502 / 512); web 32 pt. Rozstrzyga zrzut z symulatora SE (3. gen. z „Powiększeniem” albo 1. gen.) w E2E iOS — koordynator.

## Otwarte
- 320×568 z dwoma wypiekami: ostrzeżenie pod przełącznikiem (wymaga zwartego przełącznika — nowy element systemu, poza „tanim kosztem”).
- Zrzuty iOS (SE, AX5) — E2E iOS u koordynatora; przegląd ścieżek wrażliwych: nie dotyczy (bez danych).
- Decyzja do weta: **D-319** (M2) — próg `uklad.niskiEkran` 700 pt, pas zwarty i pasek kciuka w jednym rzędzie na niskim ekranie i nad przełącznikiem wypieków (48 pt zamiast 64 pt dla „Zrobione” w tych przypadkach) — do weta (D-289).

## Kontrola dowodów i sekretów
`node audit/M1-2026-11-08/narzedzia/sprawdz-raport.mjs audit/M1-2026-11-08/role/04-studio-projektowe/fix-2026-11-09/wynik-p4b.md` z katalogu repo → wynik poniżej.

`OK: odwołania, cytaty, pliki dowodów i sekrety sprawdzone`, kod 0.

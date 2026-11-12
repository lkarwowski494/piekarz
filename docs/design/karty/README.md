# System kart: język ekranu „Dziś” na wszystkich ekranach (M3, rola 04 build E3, 2026-11-03)

Podstawa: D-139 (słowa właściciela: „Pierwszy screen wygląda ładnie… Pozostałe wyglądają jak śmietnik wygenerowany przez AI. Wszystko powinno być ładnie orbobione, pozamykane w ładne karty”). Wyjątek nazwany: E1–E2 pominięte, bo kierunek wybrał właściciel okiem (D-140). Zakres rozszerzony o D-136…D-138 (D-150, wiadomość koordynatora 2026-11-03). Stan: **przyjęty 2026-11-03 (D-141: O1a, O2b, O3a, O4a)**; w `design-spec.md` jako §14.

## 1. Zasada
Każdy ekran ma dwie warstwy: **pas** w kolorze marki z tytułem i stanem ekranu oraz **treść wyłącznie w kartach**. Na tle ekranu nie leży żaden goły nagłówek ani akapit (wyjątek: jedna linia informacji na dole, jak „Piekarz działa bez internetu…” na „Dziś”). *Dlaczego:* właściciel wskazał ten układ jako wzorzec, a znaleziska D-139 („Proporcje dokarmiania” poza kartą, inny krój „Kontroli biologicznej”) wynikają z braku jednej reguły.

**Wyjątki nazwane (arkusze poza systemem kart):** `SkladnikiSheet` i `SettingsModal` — karty w treści bez `ArkuszKart` (D-160 p3, p5). Do 1.0.1 (D-308 pkt 3, 04-studio-projektowe-007): `BreadAcademyModal`, `FlourEquivalentsModal`, `VolumeConverterModal`, `FlourBlendModal`, `FlourInventoryModal` zostają na własnym układzie; przeniesienie na `ArkuszKart` w 1.0.1. Arkusz zgody na powiadomienia (`ZgodaPowiadomien`) jest na kartach od M2-014 (D-308 pkt 2). Listę pilnuje `src/__tests__/arkusze-w-kartach-007.test.tsx`. *Dlaczego:* właściciel wybrał wyjątek do 1.0.1 zamiast przenosin w partii 3; nazwany wyjątek z testem nie rozrasta się po cichu.

## 2. Tokeny układu (kolory bez zmian: `docs/design/tokeny.json`)
| Token | Wartość | Uwagi |
|---|---|---|
| `promienie.karta` | 16 | propozycja `tokeny-karty.json` (D-141), wpisuje 08 razem w `tokeny.json` i `src/ui/tokeny.ts`; hierarchia: pas 26 > przyciskGlowny 18 > karta 16 > przycisk 14 > grupa w karcie 12 > pole 10 > znacznik 6 |
| karta: tło / obwódka | ciemny: `powierzchnia` bez obwódki; jasny: `powierzchnia` + 1 px `#E2E2DC` | nowy kolor obwódki karty w jasnym (biała karta na `#F5F5F2` bez obwódki ginie); token `kartaLinia` w `tokeny-karty.json` (D-141; ciemny = `powierzchnia`, czyli bez widocznej obwódki) |
| karta: wypełnienie | 16 (przy AX: 12) | odstęp między kartami 12, wewnątrz 8–12 |
| nagłówek karty | ikona 24 pt `ratan` + tytuł krojem tytułów 20 pt 700 (`tytul2` −2) | **jeden** krój i rozmiar dla wszystkich kart; zastępuje Sofia 13–16 i 22 w kartach zakwasu, Doktora, Ustawień |
| wiersz w karcie | min 52, odstęp 10/16, linia `linia` między wierszami | wartości liczbowe 17 pt 600, cyfry tabelaryczne, skalują się do AX5 |
| czapka paska stanu | pas `pas`, wysokość = górny bezpieczny obszar, przypięta | gdy pas odjedzie przy przewijaniu, pod paskiem stanu nie przewija się treść (znalezisko „Zakwasy”); tytuł mały pojawia się w czapce |
| chip na karcie | jak chip pasa, kolory `tusz`/`obwodka`, wybrany `akcent` | zastępuje chipy promień 6, 12 pt w „Ilościach do dokarmienia” |
| pole wyboru objawu | 28×28, promień 6, obwódka 2 `obwodka`; cały wiersz w obwódce 1.5, promień 10 | jedna kontrolka dla objawów w zakwasie i w Doktorze (dziś dwie różne) |

Kontrast nowych par: `kontrast-karty.md` (24 pary, kod 0). „Zwiększ kontrast”: kolory bez zmian (`docs/design/kontrast.md`).

## 3. Komponenty
- Systemowe bez zmian zachowania: pasek zakładek, arkusze (uchwyt, „Anuluj”/„Zamknij” z lewej, „Gotowe”/„Zapisz” z prawej), przełącznik, segment.
- Wspólne do zbudowania przez 08 (jeden komponent na wzór, nie kopie): `Karta` (nagłówek z ikoną, opcjonalny znacznik Pro po prawej); znacznik dłuższy niż miejsce obok tytułu schodzi pod tytuł, tytuł nie łamie się wewnątrz słowa (D-392), `WierszKarty`, `CzapkaPaska`, `PoleObjawu`. Pas: istniejący `PasZakladki` na wszystkich ekranach (O3).
- Element firmowy (spirala koszyka) bez zmian: pas „Dziś”, pas zakwasu, prowadzenie.

## 4. Ekran AS IS → TO BE (partie wdrożenia dla 08)
| Ekran AS IS (kod) | Nagłówek dziś | TO BE (makieta) | Zmiana |
|---|---|---|---|
| Dziś `app/(tabs)/(dzis)/index.tsx` | pas | `dzis.html` | wzorzec; tylko czapka paska stanu i karta pustej spirali |
| Receptury `receptury/index.tsx` | pas | `receptury.html#lista`, `#pusty-filtr` | O2b: każda receptura we własnej karcie z ikoną rodzaju; nagłówek grupy z ikoną nad kartami; pusty filtr w karcie |
| Receptura `receptury/receptura.tsx` + `DoMiski`, `ORecepturze` | pas | `receptury.html#receptura` | „Bochenki/Masa” jako karta „Ile pieczesz”, „Do miski” z nagłówkiem w karcie, informacje w karcie |
| D-136 (nowe) `DoMiski` | pas | `receptury.html#receptura-drozdze` | wiersz „Drożdże” z segmentem „świeże / instant” w karcie „Do miski” |
| D-137 (nowe) lista, receptura | pas | `#lista`, `#receptura`, `#receptura-drozdze` | podpis wiersza listy i karta „Wersja na drożdżach” / „Wersja na zakwasie” (powiązanie w obie strony) |
| D-138 (nowe) receptura | pas | `#receptura`, `#receptura-maszyna` | segment „Piekarnik / Maszyna do chleba” w karcie „Ile pieczesz”; w trybie maszyny karty „Kolejność wkładania” i „Program i godzina”, przycisk „Zapisz plan” |
| Arkusz „Składniki” `SkladnikiSheet.tsx` | własny pasek | `#skladniki` | sekcje jako karty z ikonami |
| Plan `receptury/harmonogram.tsx` | pasek systemowy | `wypiek.html#plan` | pas (O3), „Kiedy gotowy”, temperatura, sen, oś czasu w kartach |
| Prowadzenie `app/stolnica.tsx` | pasek systemowy | `wypiek.html#prowadzenie` | pas z krokiem i czasem (O3); ostrzeżenie kroku nad kartą „Co zrobić” (§7c); instrukcja i składniki w kartach |
| Zakwasy `zakwasy/index.tsx` + `src/components/zakwas/*` | pas (odjeżdża) | `zakwasy.html` (3 stany) | czapka; od D-393 (KO-055) karta „Cykl dokarmiania” nad „Profilem zakwasu”; wybór zakwasu jako chipy na pasie; wszystkie karty na tokenach (koniec stylu 16/14/11/10 pt); „Proporcje dokarmiania” i „Kontrola biologiczna” w kartach jednym krojem |
| Doktor zakwasu, Doktor Chleba | pasek systemowy | (bez osobnej makiety; reguła §1, wiersze `PoleObjawu`) | do makiety w partii, jeśli 08 zgłosi wątpliwość |
| Dziennik `dziennik/index.tsx` | pas | `inne.html#dziennik-pusty`, `#dziennik` | pusty stan w karcie, wpis jako karta |
| Ustawienia `SettingsModal.tsx` | własny pasek | `inne.html#ustawienia` | sekcje jako karty z ikonami; wiersze zamiast siatek przycisków (język jako wiersz → lista) |
| Piekarz Pro `PaywallModal.tsx` | brak | `inne.html#pro` | pas z tytułem i zdaniem Basic; ujawnienia bez zmian treści (D-112/D-113) |

## 5. Decyzje okiem (STOP E3; wybór właściciela D-141: O1a, O2b, O3a, O4a) — arkusz `arkusze/opcje.png`
- **O1 Ikony w nagłówkach kart.** (a) ikona przy każdej karcie (rekomendacja: właściciel wskazał „ikony w kartach”, ikona daje kotwicę wzroku przy przewijaniu z mąką na rękach); (b) ikony tylko w kaflach i wierszach list (spokojniej, mniej elementów; ryzyko powrotu do „gołych” nagłówków).
- **O2 Lista receptur.** (a) jedna karta na grupę z wierszami (rekomendacja: 10+ receptur mieści się na ekranie, zgodne z listą grupowaną iOS); (b) osobna karta na recepturę (bardziej „kartowo”, o ok. 30% mniej receptur na ekranie).
- **O3 Ekrany w stosie (plan, prowadzenie, Doktor).** (a) pas marki jak na zakładkach (rekomendacja: jeden język na całej ścieżce wypieku; w prowadzeniu krok i czas są na pasie, czytelne z odległości); (b) zwykły pasek nawigacji na tle, pas tylko na zakładkach (mniej zmian w kodzie, standard iOS).
- **O4 Miejsce wyboru piekarnik / maszyna (D-138).** (a) segment w karcie „Ile pieczesz” na recepturze (rekomendacja: wybór tam, gdzie zmieniają się ilości, jedno dotknięcie); (b) pozycja w menu „Więcej” albo osobna receptura dla maszyny (mniej na ekranie, ale tryb jest ukryty). Wyrenderowana tylko opcja (a): `arkusze/funkcje-d150.png`.
- Ikona i ekran startowy: bez zmian (poza D-139); nie proponuję zmiany.

## 6. Teksty nowe lub zmienione (dla roli 09; brzmienie istniejących bez zmian)
| Miejsce | Tekst | Powód |
|---|---|---|
| Receptura, nagłówek karty | „Ile pieczesz” | nowy nagłówek karty „Bochenki / Masa bochenka” |
| Receptura, „Do miski” | „Do miski” + podpis „Odhaczaj przy ważeniu.” | rozbicie „Do miski (odhaczaj przy ważeniu)” na nagłówek karty i podpis |
| Receptura, pas | „Receptura bazowa, na zakwasie” / „Moja receptura, …” | podtytuł pasa (rodzaj) |
| Plan, pas | podtytuł = nazwa receptury | istniejący tekst w nowym miejscu |
| Prowadzenie, karta | „Co zrobić” | nagłówek karty instrukcji |
| Ustawienia | „Język i jednostki” | połączenie sekcji „Język” i „Jednostki” |
| D-136, „Do miski” | „Drożdże”, „świeże”, „instant” | segment przy wierszu drożdży |
| D-137, lista i receptura | „jest wersja na drożdżach”, „Wersja na drożdżach”, „Wersja na zakwasie”, „Ten sam chleb bez zakwasu, gotowy tego samego dnia”, „Oryginał tej receptury” | powiązanie bliźniaków; zdanie o czasie do potwierdzenia przez 06 |
| D-138, receptura | „Piekarnik”, „Maszyna do chleba”, „Pojemność maszyny”, „Kolejność wkładania”, „Program i godzina”, „Program”, „Gotowe o”, „Ustaw opóźniony start na {czas}.”, „Kolejność i ilości według instrukcji maszyny.”, „Zapisz plan” | tryb maszyny; liczby i programy z reguł 06 |

## 7. Krytyka (najpierw usterki)
Poprawione: (1) liczby w wierszach nie skalowały się przy AX5 („850 g” 13 px) → 17→53 pt; (2) wiersz czasu od dokarmienia na pasie zawijał się krojem tytułów → treść 17 pt; (3) proporcje dokarmiania w segmencie 2×2 nierówne → chipy. Zostaje: przy 320 AX5 akcje pasa („Więcej”) przechodzą pod „‹ Receptury” (dopuszczalne, kolejność czytania zachowana); pasek tygodnia „Dziś” przy 320 AX5 nie mieści 7 dni (dziś w aplikacji: `fontScale ≥ 2` przenosi część pasa niżej — bez zmian). Kalibracja: identyczne karty z jednym promieniem to wzorzec „SaaS”; tu hierarchia promieni (§2), karty bez cienia, a rozpoznawalność niesie spirala i pas, nie karta — decyzja D-140.

## 7a. Duży tekst przy 320 pt (D-142)
Bez dzielenia wyrazów; przy AX5 stos w jednej kolumnie i mniejsze wcięcia (CSS w `karty.css`, sekcja „AX5”). Dla 08: `flexWrap: 'wrap'` i `flexBasis` zależne od `fontScale` zamiast stałych rzędów; nie ustawiać `maxFontSizeMultiplier` w kartach. Słowo dłuższe niż cały wiersz łamie się systemowo. Kontrola: `node docs/design/narzedzia/slowa.mjs docs/design/karty/*.html` (Playwright ze scratchpadu): 0 elementów poza ekranem.

## 7b. Niski ekran: prowadzenie (rola 04 p4b, M1-audytor-generalny-005; D-319 do weta)
Token `uklad.niskiEkran` = 700 (`tokeny.json`): okno niższe niż 700 pt (iPhone SE 568 i 667 pt, „Powiększenie ekranu” 320×568) przy tekście mniejszym niż AX (`fontScale` < 2) dostaje na prowadzeniu układ zwarty (`src/ui/niski-ekran.ts`):
- **pas zwarty** (`PasZakladki zwarty`, `PasProwadzenia`): „Krok n z m” w rzędzie nawigacji między wstecz a „Doktor”/„Plan wypieku”, w jednym wierszu (do 0,7 rozmiaru, co najmniej 88 pt szerokości — KO-017, D-336); „Doktor” i „Plan wypieku” jako same ikony 24 pt `naPasie` (kształty kart: bochenek, kalendarz) w polu 44×44 pt z etykietą VoiceOver, więc wstecz, numer i akcje mieszczą się w jednym rzędzie przy 320 pt (KO-018, D-337); tytuł kroku 20 pt jak nagłówek karty; czas 28 pt (`tytulKroku`) z „potem …” (15 pt) obok, zawija się pod czas; odstępy `xs`, dół `m`; pierwszy element treści (ostrzeżenie albo karta kroku) 8 pt pod pasem;
- **pasek kciuka w jednym rzędzie** (`PasekKciuka`): „Zrobione” (akcent, pierwszy w kolejności czytania), „Cofnij poprzedni”, „Po co ten krok”, cel 48 pt (`cele.glownyPrzeplyw`), rząd się zawija przy długich tekstach. Ten sam pasek, gdy nad nim stoi przełącznik wypieków (dwa trwające), także przy 393×852.

Przy dużym tekście (AX) układ zwykły: zawija się i przewija, nic nie znika. Bez nowych tekstów i kolorów. *Dlaczego:* przy 320×568 karta kroku z ostrzeżeniem bezpieczeństwa była w całości pod paskiem kciuka (dół ostrzeżenia 720 pt przy górze „Zrobione” 376 pt, Expo web); ostrzeżenie ma być widać bez przewijania (005). Dowód: `src/__tests__/karta-kroku-pierwszy-ekran-005.test.tsx` (rachunek) i zrzuty Expo web 320×568, 375×667, 393×852 (raport roli 04, fix 2026-11-09, wynik-p4b).

## 7c. Ostrzeżenie kroku nad kartą „Co zrobić” (KO-015, D-335; M1-audytor-generalny-005)
Na prowadzeniu pole Ostrzeżenia (bezpieczeństwo kroku: gorące naczynie, surowy zakwas, surowe ciasto, dzieci) stoi pod pasem, nad kartą „Co zrobić”; treść, tytuł, kolor, ikona i zachowanie (alert, haptyka) bez zmian. Krok bez ostrzeżenia: karta „Co zrobić” jak dotąd pod pasem. Makieta: `wypiek.html#prowadzenie`. *Dlaczego:* przy długiej instrukcji (pieczenie w garnku, 310 znaków) pole pod kartą wypadało pod paskiem kciuka, a ostrzeżenie ma być widać bez przewijania w każdym kroku i języku; długa instrukcja kończy się pod zgięciem, ale jej początek jest widoczny i karta się przewija. Dowód: `src/__tests__/ostrzezenie-nad-karta-005.test.tsx` (rachunek: każdy krok z ostrzeżeniem w planach wbudowanych receptur, 35 języków, 393×852 i 320×568).

## 8. Czego nie sprawdzono
Expo web (brak `react-native-web`, zależności nie dopisuję): „przed” to zrzuty właściciela i wzorce z 2026-10-20, nie bieżący build dla każdego ekranu. Krój treści w makiecie: Noto Sans zastępczo (na iOS SF Pro). Szerokość 430 pt: zrzuty wzorcowe 5 ekranów (E4). Najdłuższy język: nie renderowany — makiety kart nie mają przekładów; pomiar długości języków z `docs/design/pomiar-jezykow.md` obowiązuje dalej, sprawdzenie na zbudowanych ekranach w audycie roli 04 po 08. `warsztat.mjs` nie uruchomiony.

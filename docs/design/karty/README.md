# System kart: język ekranu „Dziś” na wszystkich ekranach (M3, rola 04 build E3, 2026-11-03)

Podstawa: D-139 (słowa właściciela: „Pierwszy screen wygląda ładnie… Pozostałe wyglądają jak śmietnik wygenerowany przez AI. Wszystko powinno być ładnie orbobione, pozamykane w ładne karty”). Wyjątek nazwany: E1–E2 pominięte, bo kierunek wybrał właściciel okiem (D-140). Stan: **propozycja do wyboru na STOP E3**; po wyborze wchodzi do `design-spec.md` jako §14 (E4).

## 1. Zasada
Każdy ekran ma dwie warstwy: **pas** w kolorze marki z tytułem i stanem ekranu oraz **treść wyłącznie w kartach**. Na tle ekranu nie leży żaden goły nagłówek ani akapit (wyjątek: jedna linia informacji na dole, jak „Piekarz działa bez internetu…” na „Dziś”). *Dlaczego:* właściciel wskazał ten układ jako wzorzec, a znaleziska D-139 („Proporcje dokarmiania” poza kartą, inny krój „Kontroli biologicznej”) wynikają z braku jednej reguły.

## 2. Tokeny układu (kolory bez zmian: `docs/design/tokeny.json`)
| Token | Wartość | Uwagi |
|---|---|---|
| `promienie.karta` | 16 | nowy; hierarchia: pas 26 > przyciskGlowny 18 > karta 16 > przycisk 14 > grupa w karcie 12 > pole 10 > znacznik 6 |
| karta: tło / obwódka | ciemny: `powierzchnia` bez obwódki; jasny: `powierzchnia` + 1 px `#E2E2DC` | nowy kolor obwódki karty w jasnym (biała karta na `#F5F5F2` bez obwódki ginie); do wpisu w `tokeny.json` (E4) |
| karta: wypełnienie | 16 (przy AX: 12) | odstęp między kartami 12, wewnątrz 8–12 |
| nagłówek karty | ikona 24 pt `ratan` + tytuł krojem tytułów 20 pt 700 (`tytul2` −2) | **jeden** krój i rozmiar dla wszystkich kart; zastępuje Sofia 13–16 i 22 w kartach zakwasu, Doktora, Ustawień |
| wiersz w karcie | min 52, odstęp 10/16, linia `linia` między wierszami | wartości liczbowe 17 pt 600, cyfry tabelaryczne, skalują się do AX5 |
| czapka paska stanu | pas `pas`, wysokość = górny bezpieczny obszar, przypięta | gdy pas odjedzie przy przewijaniu, pod paskiem stanu nie przewija się treść (znalezisko „Zakwasy”); tytuł mały pojawia się w czapce |
| chip na karcie | jak chip pasa, kolory `tusz`/`obwodka`, wybrany `akcent` | zastępuje chipy promień 6, 12 pt w „Ilościach do dokarmienia” |
| pole wyboru objawu | 28×28, promień 6, obwódka 2 `obwodka`; cały wiersz w obwódce 1.5, promień 10 | jedna kontrolka dla objawów w zakwasie i w Doktorze (dziś dwie różne) |

Kontrast nowych par: `kontrast-karty.md` (24 pary, kod 0). „Zwiększ kontrast”: kolory bez zmian (`docs/design/kontrast.md`).

## 3. Komponenty
- Systemowe bez zmian zachowania: pasek zakładek, arkusze (uchwyt, „Anuluj”/„Zamknij” z lewej, „Gotowe”/„Zapisz” z prawej), przełącznik, segment.
- Wspólne do zbudowania przez 08 (jeden komponent na wzór, nie kopie): `Karta` (nagłówek z ikoną, opcjonalny znacznik Pro po prawej), `WierszKarty`, `CzapkaPaska`, `PoleObjawu`. Pas: istniejący `PasZakladki` na wszystkich ekranach (O3).
- Element firmowy (spirala koszyka) bez zmian: pas „Dziś”, pas zakwasu, prowadzenie.

## 4. Ekran AS IS → TO BE (partie wdrożenia dla 08)
| Ekran AS IS (kod) | Nagłówek dziś | TO BE (makieta) | Zmiana |
|---|---|---|---|
| Dziś `app/(tabs)/(dzis)/index.tsx` | pas | `dzis.html` | wzorzec; tylko czapka paska stanu i karta pustej spirali |
| Receptury `receptury/index.tsx` | pas | `receptury.html#lista`, `#pusty-filtr` | nagłówki grup do kart, ikona rodzaju w wierszu, pusty filtr w karcie |
| Receptura `receptury/receptura.tsx` + `DoMiski`, `ORecepturze` | pas | `receptury.html#receptura` | „Bochenki/Masa” jako karta „Ile pieczesz”, „Do miski” z nagłówkiem w karcie, informacje w karcie |
| Arkusz „Składniki” `SkladnikiSheet.tsx` | własny pasek | `#skladniki` | sekcje jako karty z ikonami |
| Plan `receptury/harmonogram.tsx` | pasek systemowy | `wypiek.html#plan` | pas (O3), „Kiedy gotowy”, temperatura, sen, oś czasu w kartach |
| Prowadzenie `app/stolnica.tsx` | pasek systemowy | `wypiek.html#prowadzenie` | pas z krokiem i czasem (O3); instrukcja i składniki w kartach; ostrzeżenie bez zmian |
| Zakwasy `zakwasy/index.tsx` + `src/components/zakwas/*` | pas (odjeżdża) | `zakwasy.html` (3 stany) | czapka; wybór zakwasu jako chipy na pasie; wszystkie karty na tokenach (koniec stylu 16/14/11/10 pt); „Proporcje dokarmiania” i „Kontrola biologiczna” w kartach jednym krojem |
| Doktor zakwasu, Doktor Chleba | pasek systemowy | (bez osobnej makiety; reguła §1, wiersze `PoleObjawu`) | do makiety w partii, jeśli 08 zgłosi wątpliwość |
| Dziennik `dziennik/index.tsx` | pas | `inne.html#dziennik-pusty`, `#dziennik` | pusty stan w karcie, wpis jako karta |
| Ustawienia `SettingsModal.tsx` | własny pasek | `inne.html#ustawienia` | sekcje jako karty z ikonami; wiersze zamiast siatek przycisków (język jako wiersz → lista) |
| Piekarz Pro `PaywallModal.tsx` | brak | `inne.html#pro` | pas z tytułem i zdaniem Basic; ujawnienia bez zmian treści (D-112/D-113) |

## 5. Decyzje do wyboru okiem (STOP E3) — arkusz `arkusze/opcje.png`
- **O1 Ikony w nagłówkach kart.** (a) ikona przy każdej karcie (rekomendacja: właściciel wskazał „ikony w kartach”, ikona daje kotwicę wzroku przy przewijaniu z mąką na rękach); (b) ikony tylko w kaflach i wierszach list (spokojniej, mniej elementów; ryzyko powrotu do „gołych” nagłówków).
- **O2 Lista receptur.** (a) jedna karta na grupę z wierszami (rekomendacja: 10+ receptur mieści się na ekranie, zgodne z listą grupowaną iOS); (b) osobna karta na recepturę (bardziej „kartowo”, o ok. 30% mniej receptur na ekranie).
- **O3 Ekrany w stosie (plan, prowadzenie, Doktor).** (a) pas marki jak na zakładkach (rekomendacja: jeden język na całej ścieżce wypieku; w prowadzeniu krok i czas są na pasie, czytelne z odległości); (b) zwykły pasek nawigacji na tle, pas tylko na zakładkach (mniej zmian w kodzie, standard iOS).
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

## 7. Krytyka (najpierw usterki)
Poprawione: (1) liczby w wierszach nie skalowały się przy AX5 („850 g” 13 px) → 17→53 pt; (2) wiersz czasu od dokarmienia na pasie zawijał się krojem tytułów → treść 17 pt; (3) proporcje dokarmiania w segmencie 2×2 nierówne → chipy. Zostaje: przy 320 AX5 akcje pasa („Więcej”) przechodzą pod „‹ Receptury” (dopuszczalne, kolejność czytania zachowana); pasek tygodnia „Dziś” przy 320 AX5 nie mieści 7 dni (dziś w aplikacji: `fontScale ≥ 2` przenosi część pasa niżej — bez zmian). Kalibracja: identyczne karty z jednym promieniem to wzorzec „SaaS”; tu hierarchia promieni (§2), karty bez cienia, a rozpoznawalność niesie spirala i pas, nie karta — decyzja D-140.

## 8. Czego nie sprawdzono
Expo web (brak `react-native-web`, zależności nie dopisuję): „przed” to zrzuty właściciela i wzorce z 2026-10-20, nie bieżący build dla każdego ekranu. Krój treści w makiecie: Noto Sans zastępczo (na iOS SF Pro). Szerokość 430 pt i najdłuższy język: nie renderowane na tym STOP (zrobię w E4 dla wybranych opcji). `warsztat.mjs` nie uruchomiony.

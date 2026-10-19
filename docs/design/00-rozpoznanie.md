# E0 Rozpoznanie: nowa szata graficzna Piekarza (na kontrakcie wariantu B)

Rola 04 Studio Projektowe, tryb build · 2026-10-20 · gałąź `claude/04-projekt-2026-10-20-088299` (baza: gałąź roli 03 `claude/03-zakres-2026-10-19-7a0b8a`, 0599da8; `git merge-base --is-ancestor 0599da8 HEAD` → 0)

Słowa właściciela (2026-10-19): „Chcę naprawić front end i zbudować całkiem nową szatę graficzną. Zgodnie ze standardami mojego repo prompts.” E0 z sesji 2026-10-19 (ab91445, stary kontrakt) zastąpione tym plikiem; z tamtej sesji przeniesione tylko narzędzia.

## 1. Środowisko (sprawdzone 2026-10-20)

| Sprawdzenie | Wynik |
|---|---|
| System, Node, git | Windows 11 Home, PowerShell 5.1, Node v24.20.0, git 2.56; drzewo czyste na starcie |
| GitHub | `gh` 2.102 działa; `lkarwowski494/piekarz` **publiczne**. Gałęzie zdalne: `master`, `naprawy/M2-koordynator-napraw-2026-10-19-p1…p3`. Push tylko za zgodą |
| Przeglądarka | Playwright 1.64.1 w scratchpadzie, Chromium 156.0.8078.4 uruchamia się (`test.mjs` → „ok”). Nic w `package.json` |
| Narzędzia | `docs/design/narzedzia/zrzuty.mjs`, `kontrast.mjs` przeniesione z ab91445 (`git checkout ab91445 -- …`). Nazwana zmiana względem modułu: `pathToFileURL` zamiast `'file://' + ścieżka` (Windows). Próba: `kontrast.mjs` 21,00:1 OK i 2,85:1 BRAK (kod 1, zgodnie z oczekiwaniem); `zrzuty.mjs` na pliku próbnym → 12 zrzutów (3 szerokości × 2 motywy × 2 rozmiary), kod 0 |
| iOS / Xcode / symulator | brak (Windows). VoiceOver, Dynamic Type, „Zwiększ kontrast”, haptyka, dźwięk, powiadomienia na zablokowanym ekranie: kroki właściciela |
| Krój systemowy | SF Pro niedostępny i nie do dołączenia; treść w makietach z jawnym krojem zastępczym i podpisem |
| Sieć | jest; potrzebna w E1 (iTunes Search API, źródła dziedziny) i E2 (kroje OFL do `docs/design/fonty/`) |
| Bramka opłacalności | wynik jest (`docs/monetyzacja.md`, werdykt „przerobić”); praca dalej na D-040 (pełny eksperyment) |
| Dokumenty | wszystkie w repo (`CLAUDE.md`, „Stan projektu”); treści w `docs/tresci/`, brak repo prywatnego |

## 2. Co przeczytałem

- Brief `sztafeta-01-04-start.md` (całość) i polecenie roli `04-studio-projektowe-build.md` (655 linii, do końca).
- `docs/sztafeta.md` (przekazanie roli 03), `docs/scope-contract.md` (całość), `docs/decyzje.md` (D-035…D-044), `docs/monetyzacja.md` (E2, kontrakt płatności, ujawnienia, wektory), BRD: `wymagania.md` (PR-01…PR-18, NFR), `odkrywanie.md` (J, P, kontekst, OG, H, RYZ), kryteria BR-START-001, BR-ETAP-001…005, BR-HARMO-005, BR-CZAS-002/003, BR-REKA-001, BR-ZAK-003…005, BR-UST-001, BR-NAUK-001, BR-DIAG-001/002, BR-OPIN-001…003, BR-ZAKW-004/005; `docs/zalozenia.md` (ZAL-029…050).
- Plan napraw M1: zadania partii 5 (050–058, 087–090, 096–104), decyzje DEC-02, -06, -07, -09, -10, -13, -15, blok `redesign`.
- Raport audytu M1 roli 04 (znaleziska 001–018, zrzuty obecnej aplikacji), stara `docs/design-spec.md` i `docs/32-wzorce-interakcji.md` jako inwentarz, nie wzorzec.
- Pamięć portfolio w repo `prompts` (`role/04-studio-projektowe/moduly/pamiec-portfolio.md`, ostatnia zmiana 098aa1b 2026-10-18; Piekarz bez wpisu).
- Notatki sesji siostrzanych (01, 02, 03, maszyneria przekładu).

## 3. Przepływy (z kontraktu wariantu B; każdy ekran i przycisk ma wynikać z jednego z nich)

| PR | Kto | Cel | Kroki (skrót) | Częstość | Funkcje F | Dostęp (D-038, D-039) |
|---|---|---|---|---|---|---|
| PR-12 Start | P-6, P-7, P-8 | wybrać, co dziś robię | trzy czynności → przepływ; trwający wypiek jednym dotknięciem | pierwsze uruchomienie i każdy powrót | F-68 | zawsze (nawigacja) |
| PR-01 Receptura i ilości | P-7, P-6, P-8 | wagi wszystkich składników, hydratacja | receptura bazowa/własna → masa/sztuki/mąka → zakwas lub zaczyn → wagi → (temp. wody) → zapisz jako moją | każdy wypiek | F-09, F-10, F-11, F-26, F-27, F-56, F-38 | płatne; zapisane receptury do odczytu zawsze |
| PR-02 Plan wstecz | P-7, P-6 | kiedy zacząć każdy etap | receptura → godzina „gotowe” → temperatura kuchni → plan → kolizja ze snem i propozycja → start | każdy wypiek | F-13, F-14, F-61 | płatne |
| PR-03 Woda i czas | P-7, P-8 | woda i czas do temperatury | temp. mąki, kuchni, zaczynu → woda; temp. fermentacji → czas albo „poza zakresem” | zmienna temperatura | F-10, F-14 (bez lodu: F-53 NIE) | płatne |
| PR-04 Prowadzenie | P-6, P-7, P-8 | przejść kroki, sygnał przy uśpionym telefonie | start → zgoda na powiadomienia z jednym zdaniem → bieżący krok → ostrzeżenie w kroku z gorącym naczyniem i surowym ciastem → zrobione / wcześniej / cofnij → koniec → ocena | każdy wypiek, wiele kroków w dobie | F-07, F-16, F-18, F-57, F-44, F-15 (TEST) | płatne; wypiek zaczęty z dostępem do końca |
| PR-15 Powrót | P-6, P-7 | wrócić po przerwie | otwarcie → bieżący krok, czas od zapisanego terminu → przesunięcie, jeśli minął | po zamknięciu, spóźnieniu | F-58 | zawsze, jeśli zaczęty z dostępem |
| PR-05 Zakwas | P-7, P-6 | ile i kiedy dokarmić, gotowość, ostrożność | wybór zakwasu → dokarmienie (proporcja, mąka, miejsce) → kiedy gotowy i następne → przypomnienie → objawy → decyzja RD-21 → budzenie z lodówki | 2×/dzień albo 1×/tydz. | F-22…F-25, F-61, F-62 | płatne; karta, wpisy i ostrzeżenie RD-21 zawsze |
| PR-11 Zakwas od zera | P-6 | założyć pierwszy zakwas | „zakładam zakwas” → dzień N, co dziś, zwykle 7–10 dni → dokarmienie i obserwacja → pleśń: RD-21 → gotowy: pierwszy wypiek → nie rośnie: Doktor | codziennie przez kilka–kilkanaście dni | F-60, F-64 | płatne; ostrzeżenie RD-21 zawsze |
| PR-17 Drożdże i pizza | P-8 | ciasto na godzinę i liczbę osób | rodzaj, sztuki, masa → drożdże i zaczyn (poolish, biga) → godzina, temperatura → ilości i plan z chłodnią → kroki jak PR-04 | ok. raz w tygodniu | F-55 + F-09, F-13, F-07 | płatne |
| PR-06 Wynik | P-7, P-6 | zapisać i poprawić następny | ocena i notatka → ≤ 2★: Doktor; ≥ 4★: systemowa prośba o ocenę → historia → piecz ponownie | po każdym wypieku | F-28, F-43, F-69 | przegląd zawsze; nowy wpis płatny (wyjątek: wynik dokończonego wypieku) |
| PR-13 Po co ten krok | P-6 | rozumieć krok | „po co ten krok” w kroku → wyjaśnienie → powrót bez utraty stanu | na początku często | F-44 (lekcje bez wejścia w 1.0) | płatne |
| PR-14 Co poszło nie tak | P-6, P-7 | przyczyna i jedna zmiana | objaw → pytania → przyczyny i jedna zmiana; pleśń: RD-21 | po nieudanym | F-43, F-64 | płatne |
| PR-07 Dane | wszyscy | nic nie ginie | zapis → kopie → eksport → import → przywrócenie zakupu → usunięcie | ciągle / rzadko | F-31, F-32, F-33, F-65 | zawsze |
| PR-09 Oferta i zakup | wszyscy | świadomy zakup lub zamknięcie | pierwsze użycie funkcji → oferta 14 dni (3 opcje, 8 ujawnień) → zakup / zamknij → przywróć | raz, potem odnowienia | F-35, F-37 | zawsze |
| PR-16 Koniec próby | wszyscy | wiedzieć, co zostaje | 3 dni przed końcem: jeden komunikat → po końcu tryb „tylko historia” → inna funkcja: zakup bez próby | raz | F-67 | zawsze |
| PR-10 Ustawienia | wszyscy | jednostki, prywatność | jednostki (domyślnie według regionu, D-044) → polityka prywatności | rzadko | F-38, F-40 | zawsze |
| PR-18 Opinia | wszyscy | napisać albo ocenić | „napisz do nas” (poczta z podglądem) / „oceń w App Store” | rzadko | F-69 | zawsze |

Bez ekranów (kontrakt, „Kolejność i przekazanie”): PR-08 (QR, druk), F-30 spiżarnia, F-63 porównanie, F-45 przelicznik objętości, F-08, F-50, F-70, F-53 masa lodu, F-46…F-49, F-52, osobne wejście Akademii, wszystko z listy KL. F-15 tylko jako prototyp do testu (wskazówka w kroku garowania, osobny stan makiety).

## 4. Kontekst użycia

| Przepływ | Miejsce i światło | Ręce | Oczy | Spojrzenie / sesja | Hałas | Podstawa |
|---|---|---|---|---|---|---|
| PR-04, PR-17 kroki czynne (mieszanie, składanie, formowanie) | kuchnia; dzień, wieczór, noc i świt (wyjęcie z chłodni, pieczenie) | w cieście lub mące; dotyk knykciem | na misce, ekran z 0,5–2 m | 1–3 s; wypiek 12–36 h w wielu wejściach | mikser, okap | ZAL-033 (hipoteza, 0 z 338), ZAL-031 (2 z 338); DEC-15 a |
| PR-04 pieczenie (pokrywa, kamień) | piekarnik 230–250 °C, para | w rękawicach ⚠ | na piekarniku | sekundy | okap | RD-23, RYZ-15, BR-ETAP-004 |
| PR-04 między krokami | telefon odłożony, zablokowany, poza kuchnią | wolne | gdzie indziej; sygnał musi przyjść sam | wejście z powiadomienia | dowolny | ZAL-032 (potwierdzone, motyw); DEC-02 a |
| PR-15 powrót | po godzinach, często rano | wolne | krótko | 2–5 s: „gdzie jestem, ile zostało” | — | BR-ETAP-005 |
| PR-01 waga | blat przy wadze, dzień | czyste przy ustawianiu, w mące przy wsypywaniu | ekran i waga na zmianę | 2–5 s; sesja 5–15 min | niski | odkrywanie.md (J-01, [OCENA]) |
| PR-05, PR-11 zakwas | blat albo otwarta lodówka | lepkie (słoik, łyżka) | ocena wyglądu i zapachu ⚠ pleśń | 5–30 s; codziennie | niski | RD-21, DEC-10 a |
| PR-02, PR-03 plan | dzień przed, spokojnie | wolne | wolne | 2–5 min | — | PR-02 |
| PR-06, PR-14 wynik | przy stole, po ostudzeniu | wolne | wolne | 2–10 min | — | PR-06 |
| PR-12, PR-09, PR-16, PR-07, PR-10, PR-18 | dowolne | wolne | wolne | rzadko, minuty | — | — |

Wniosek: kroki czynne i powrót z powiadomienia dzieją się z rękami zajętymi i oczami poza ekranem. **Moduł `kontekst-oczy-zajete` stosuję** (zasada 6 modułu: kuchnia; jazda nie dotyczy). Ręce w cieście to hipoteza (ZAL-033, 0 z 338 recenzji), ale koszt projektu na nią jest mały (większe cele, jedna akcja kciukiem), a próg 48 pt i tak wynika z DEC-15 a.

## 5. Ograniczenia z projektu (wiążą każdy kierunek)

1. **Monetyzacja stała (D-038, D-039)**: 0,99 / 6,99 / 14,99 USD; 4,99 / 29,99 / 79,99 zł; oferta „Wypróbuj 14 dni” przy pierwszym użyciu funkcji (gdy `isEligibleForIntroOffer`), nigdy przy starcie ani w trakcie kroku, bez licznika, zamknięta nie wraca w tej samej czynności; ekran zakupu z trzema opcjami i 8 ujawnieniami (`docs/monetyzacja.md`, U1–U8, w tym zdanie o 7–10 dniach zakładania zakwasu i „zakup wymaga połączenia z App Store”), „Przywróć zakupy”, Warunki i Polityka; uprzedzenie 3 dni (dwa teksty: odnawianie włączone / wyłączone); tryb „tylko historia” z odczytem, eksportem, importem, kopiami, usunięciem; stany zablokowane każdej funkcji płatnej; wypiek zaczęty z dostępem prowadzi się do końca. Zakazane wzorce: odliczanie, „za darmo” bez odnowienia, „najpopularniejszy” bez danych, zawstydzanie, ukryte zamknięcie. Projektuję formę; modelu, cen i podziału nie dotykam.
2. **Start F-68 (BR-START-001, H-08 a)**: trzy czynności słowami pracy, powrót do trwającego wypieku jednym dotknięciem; przykłady oznaczone jako przykład (087).
3. **Prowadzenie (DEC-09 a, 056)**: widok skupiony z paskiem kciuka; bieżący krok, co zrobić, składniki i czas na jednym ekranie; jedno „zrobione”; zakończenie wcześniej i cofnięcie potwierdzenia (BR-HARMO-005, 102); ostrzeżenie w kroku z gorącym naczyniem i surowym ciastem, ikona i tekst, nie tylko kolor (BR-ETAP-004, 103, NFR-DOST-005), krok nieznanego rodzaju też ma ostrzeżenie; „po co ten krok” bez utraty stanu (F-44, 100); stała informacja przy braku zgody na powiadomienia (BR-CZAS-003); ekran nie gaśnie tylko w kroku czynnym (F-18).
4. **Kalkulator (057)**: najwyżej 4 akcje główne, bez duplikatów; QR, druk, spiżarnia znikają; bez pola lodu (099); informacja przy nietypowej soli bez blokady (F-56).
5. **Miary USA (096, D-044)**: przełącznik w ustawieniach, domyślnie według regionu; każdy ekran z masą lub temperaturą także w °F/oz/lb: zakres modelu 20–26 °C = 68–79 °F, chipy temperatur, małe dawki soli i drożdży z sensownym zaokrągleniem, pola wejścia, teksty powiadomień; procent piekarski bez zmian. Zrzuty E3 także w EN-US imperialnym.
6. **Cele dotykowe DEC-15 a**: ≥ 48 pt w prowadzeniu i akcjach głównego przepływu, ≥ 44 pt w pozostałych (052).
7. **Dostępność**: kontrast WCAG AA w obu motywach i wariant „Zwiększ kontrast” (050); AX5 przy 320 pt bez ucięcia liczb i tytułów (055); rola, etykieta „akcja + obiekt” i stan wyboru (051, 089); pasek zakładek systemowy z marginesem wskaźnika Home (054); nic tylko kolorem.
8. **Treść**: bez emoji jako ikon, bez kodów technicznych i „[v1.1 Preview]” (088); jedna nazwa na akcję (089); twierdzenia dziedzinowe tylko z rejestru roli 06 — projektuję formę ostrzeżeń, ich tekst należy do 06.
9. **Element firmowy niosący dane ze stanu użytkownika**, z opisem dla VoiceOver (058); wybory z kalibracji tylko z decyzją, w tym zapis OP-38 12 h, D-042, D-044 w specyfikacji (090).
10. **35 języków** (DEC-06 b z rozszerzeniem): zrzuty E3 w najdłuższym; dziś w kodzie tylko PL i EN, pilot DE w `narzedzia-api` (patrz P4).
11. **Offline, bez telemetrii**: kroje dołączone do aplikacji (OFL), żadnych zasobów z sieci.
12. **Pętla opinii (OG-07)**: tylko systemowa prośba po wypieku ≥ 4★, żadnego własnego okna; „Oceń w App Store” i „Napisz do nas” w ustawieniach.

## 6. Założenia z wejścia, na których stoję (hipotezy do sprawdzenia)

| ID | Założenie | Status w rejestrze | Co od niego zależy w projekcie | Jak sprawdzę |
|---|---|---|---|---|
| ZAL-033 | ręce w cieście w krokach czynnych | hipoteza (0 z 338) | moduł oczy-zajęte, pasek kciuka | przejście poznawcze; nie zmieniam statusu |
| ZAL-031 | ekran nie powinien gasnąć w kroku czynnym | hipoteza | wskaźnik „ekran nie zgaśnie” w kroku | jw. |
| ZAL-032 | sygnał przy zablokowanym ekranie | potwierdzone (motyw) | stan „koniec kroku” jako cel powiadomienia | — |
| ZAL-046 | jeden start ogranicza kombajn | hipoteza | ekran startu F-68 | przejście poznawcze nowej osoby (soczewka 4), wynik do 03 |
| ZAL-039 | użytkownicy 60+ | hipoteza | skala tekstu, kontrast | AX5 i tak wymagane |
| ZAL-042, ZAL-043 | przejrzystość opłat; „tylko historia” bez uprzedzenia jak utrata danych | potwierdzone / hipoteza | ekran oferty, uprzedzenie, tryb „tylko historia” | przejście poznawcze stanów zakupu (H-03, H-04) |
| ZAL-034 | zakwas w 7–10 dni | potwierdzone (szczebel 3) | zdanie U7 na ofercie, dzień N | — |
| ZAL-037 | US potrzebuje oz i °F | potwierdzone (motyw) | tryb imperialny | — |

**Sprzeczność w wejściu (zgłaszam, nie rozstrzygam po cichu):** kontrakt zakresu, F-68 „Intuicyjność”: „wybór prowadzi do przepływu bez oferty”; kontrakt płatności, wiersz PR-12: „pierwsza akcja z wyborem prowadzi do oferty niżej”. Pytanie P3 niżej; wynik wpiszę do rejestru i przekażę rolom 02 i 03.

## 7. Pamięć portfolio: czego Piekarz nie powtarza

| Zajęte przez | Bez zapisanej decyzji nie powtarzać |
|---|---|
| Trening | IBM Plex Sans/Mono; papier `#F4F3EF` + tusz + niebieski `#1F5FD1`; kolory talerzy IWF; intro z elementem wjeżdżającym na miejsce |
| Organizer | Bricolage Grotesque + Atkinson Hyperlegible Next; piasek `#F7F2EA` + terakota `#B4471F` („kolejna aplikacja nie powinna iść w tę parę barw”) |
| NaviStories | Jost ss01; brąz `#6B3815` + biel + sylwetka; kod kształtu pełny/kreskowany/kontur |
| Rodzina Apps4Craft (obecny Piekarz, Napar, Ferment…) | bazalt `#121214` + jeden złoty akcent (dziś Piekarz: bursztyn `#D97706`), karty z dużą liczbą, etykiety WERSALIKAMI („HYDRATACJA MASA MĄKA DDT”), emoji przy etykietach — widać na zrzutach audytu M1 (`kalkulator-390.png`, `stolnica-390.png`) |
| Kalibracja (wzorce) | krem `#F4F1EA` + szeryf + terakota: największe ryzyko dla chleba („mąka i skórka” prowadzą wprost w tę parę); „duża liczba + mała etykieta + statystyki” — to dokładnie dzisiejszy nagłówek Kalkulatora |

## 8. Ekran kluczowy do porównania kierunków

**Prowadzenie wypieku w widoku skupionym, dwa stany obok siebie:**
- `w-trakcie`: krok czynny trwa (np. „Składanie 2 z 4”, pszenny), co zrobić, czas do końca, element firmowy z miejscem w całym planie, pasek kciuka; ręce w cieście;
- `koniec-kroku`: termin minął, ekran po powiadomieniu; jedna akcja kciukiem „Zrobione”, obok „zakończ wcześniej / cofnij” w mniejszym rzędzie, następny krok jako pasek; wariant z ostrzeżeniem (krok „zdejmij pokrywę”, RD-23).

Dlaczego ten ekran, a nie start: najczęstsza i najtrudniejsza czynność (ręce zajęte, spojrzenie 1–3 s), produkt ogranicza, co tu widać, a element firmowy niesie tu najwięcej prawdziwych danych (krok, upływ, cały plan do godziny „gotowe”). Start F-68, Kalkulator i oferta sprawdzają wybrany kierunek w E3.

## 9. Wymiary pokrycia: gdzie je przejdę

| Wymiar | Bramka | Uwaga |
|---|---|---|
| Konteksty użycia | E0 (wyżej), E2 | ekran kluczowy w dwóch stanach |
| Stany kluczowych ekranów | E3 | macierz: pierwsze użycie, pusty, błąd, brak zgody na powiadomienia, offline (zakup), dużo danych, ostrzeżenie, zablokowany, „tylko historia” |
| Element firmowy | E2, E3 | dane, każdy stan, opis VoiceOver |
| Podłogi dostępności | E3 | `kontrast.mjs` w trzech wariantach, skala szarości, AX5, 48/44 pt |
| Ruch, haptyka, dźwięk | E2 (jeden moment), E3 (mapa) | „Ogranicz ruch”, wyłączanie |
| Poza ekranami | E3 | ikona 3 rozmiary, ekran startowy, teksty powiadomień (także °F); widżetów brak w zakresie |
| Głos i teksty | E2 (3 próbki), E3 (przewodnik) | prośba o zgodę, nieodwracalne, błąd zakupu |
| Ciemny i zwiększony kontrast | E2, E3 | pełne warianty, nie odwrócenie |
| Lokalizacja | E3 | najdłuższy język, EN-US imperialne, formaty liczb, dat i godzin (12/24 h) |

Soczewki (E2 i E3, każda osobno): ręce zajęte; VoiceOver i AX5; krytyk szablonu; nowa osoba w pierwszych minutach (przejście poznawcze startu i oferty, wynik do roli 03 jako `wynik: …`).

## 10. Plan i szacunek czasu

| Bramka | Co powstaje | Agent | Oczekiwanie | Właściciel |
|---|---|---|---|---|
| E0 | ten raport, narzędzia | gotowe | — | 10 min: P1–P5 |
| E1 | `01-swiat.md`: inwentarz dziedziny ze źródłami (narzędzia, materiały, znaki, formularze piekarni, liternictwo, dźwięki, kolory z norm i pomiarów), skan ~12 aplikacji (iTunes API, obrazy w scratchpadzie), ≥ 8 metafor, wybór 3 + rezerwa, dwie karty kontrolne | 2–2,5 h | sieć: minuty | 15 min |
| E2 | 3 kierunki HTML (oba stany, jasny i ciemny, ikona ×3), zrzuty, krytyka z parą przed/po, test generyczności, `porownanie.html` + `.png`; po wyborze ~5 krojów na jednym zrzucie | 3,5–4,5 h + 1 h kroje | kroje OFL: minuty | 20–30 min wybór kierunku; 10 min kroju |
| E3 | `tokeny.ts` + tabela kontrastu (jasny, ciemny, zwiększony), skala, odstępy, promienie, ruch, haptyka; komponenty; słownik akcji; macierz stanów; głos; ikona i ekran startowy; render 5 ekranów we wszystkich wariantach (start, prowadzenie, kalkulator, zakwas, oferta/zakup) + stany pozostałe przy 390 pt (plan, dziennik i ocena, uprzedzenie 3 dni, „tylko historia”, ustawienia, brak zgody); EN-US imperialne; najdłuższy język; arkusze zbiorcze i poprawki; przejście poznawcze kryteriów „Intuicyjność” | 7–9 h | render ~15 min; przekład P4: do 1 h | 45 min przegląd; opcjonalnie 1 h test z 3–5 osobami |
| E4 | `design-spec.md`, `wzorce-zrzuty/`, wpisy D-nnn, `sztafeta.md`, wynik intuicyjności dla 03, propozycja wpisu do pamięci portfolio | 1 h | — | 15 min |
| Razem | | 15–19 h | ok. 1,5 h | ok. 2 h w 5 rozmowach (+ opcjonalny test) |

## 11. Pytania do właściciela (decyzje przed E1)

**P1. DEC-07 a („kod, ciemny motyw jako kanon”) a „całkiem nowa szata”.**
- (a) nowa szata zastępuje DEC-07 a: projekt od zera, jasny i ciemny motyw według ustawienia iOS (bez przełącznika w aplikacji); kompromis: partia 5 przebudowuje motyw, nie tylko dodaje element.
- (b) DEC-07 a zostaje: ciemny motyw jako baza, nowe są element, kroje i paleta; kompromis: mniej swobody kierunków, a definicja ukończenia i tak wymaga zrzutów jasnych.
- Rekomendacja: (a) — kuchnia w dzień to jasne światło (kontekst PR-01, PR-04), ciemny zostaje pełnym wariantem na noc i świt.

**P2. Wspólna biblioteka `@apps4craft/ui` (`package.json`).**
- (a) Piekarz dostaje własne tokeny i element firmowy; z biblioteki zostają komponenty techniczne bez własnego wyglądu (np. `NumInput`, baner stanu uszkodzonego), przemalowane tokenami Piekarza; kompromis: rozjazd wyglądu z rodziną, decyzja techniczna dla 05/08.
- (b) wspólne tokeny rodziny zostają, zmieniam tylko akcent i element; kompromis: audyt M1 (04-011): po zakryciu nazwy aplikacji nie da się jej rozpoznać.
- Rekomendacja: (a).

**P3. Gdzie po wyborze na starcie pojawia się oferta (sprzeczność z punktu 6).**
- (a) wybór czynności otwiera pierwszy ekran przepływu bez oferty (lista receptur bazowych z nazwami; dla „zakładam zakwas” — co nas czeka i ile to trwa); oferta przy pierwszej akcji, która liczy, planuje albo zapisuje (otwarcie receptury w kalkulatorze, „zaczynam zakwas”); kompromis: jeden ekran więcej przed ofertą.
- (b) oferta zaraz po wyborze czynności; kompromis: użytkownik nie widzi jeszcze, co dostaje, i łamie kryterium F-68.
- Rekomendacja: (a) — spełnia oba dokumenty (oferta przy pierwszym użyciu funkcji, BR-ZAK-005), nie zmienia podziału D-038 (lista nazw to nawigacja). Wpiszę jako decyzję i przekażę 02 i 03 do zgodności tekstów.

**P4. Najdłuższy z 35 języków do zrzutów E3.** Dziś zmierzone: DE ma 1,05× długości PL na 1385 tekstach pilota (`narzedzia-api/przeklad`, 70 745 wobec 67 381 znaków); innych języków nie ma.
- (a) roboczy przekład ok. 80 tekstów kluczowych ekranów na 34 języki przez Message Batches w `narzedzia-api`, pomiar, zrzuty w najdłuższym; kompromis: płatne wywołanie API (rząd centów do 1 USD), uruchamiam za twoją zgodą albo ty.
- (b) przekład roboczy w tej sesji na ok. 8 kandydatów (DE, FI, HU, EL, RU, FR, PT, NL), tylko do pomiaru i makiety; kompromis: 0 USD, ale twoja zasada mówi, że przekład robimy przez Batches, nie sesjami.
- (c) przyjąć DE; kompromis: bez pomiaru reszty, ryzyko, że FI lub HU są dłuższe.
- Rekomendacja: (a).

**P5. Przejście E1 → E2 bez STOP.** Bez twojej zgody zatrzymam się po E1 (domyślnie tak zrobię). Za zgodą: po E1 od razu buduję trzy kierunki, a wybór trzech metafor zostaje do weta na STOP E2.

## 12. Wybory domyślne bez pytania (do weta)

- Ekran kluczowy: prowadzenie wypieku w dwóch stanach (punkt 8); moduł oczy-zajęte włączony.
- Rejestr: `docs/decyzje.md` (od D-045); `docs/DECISIONS.md` bez zmian.
- Szerokości 320/390/430 pt; najszerszy aktualny iPhone sprawdzę w specyfikacji Apple w E3 [DO USTALENIA].
- Rutynowe usuwanie (Cofnij czy potwierdzenie): pytanie na STOP E3.
- Zmieniam tylko `docs/design/**`, `docs/decyzje.md`, `docs/sztafeta.md`; propozycje wpisów do `docs/zalozenia.md` i BRD przekazuję rolom 01 i 03.

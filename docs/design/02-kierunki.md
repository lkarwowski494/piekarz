# E2 Kierunki: karty stylu, test generyczności, krytyka

Rola 04 Studio Projektowe, tryb build · 2026-10-20 · metafory A, B, C zatwierdzone na STOP E1 („Zgoda na metafory A, B, C. Rozwijaj E2.”, 2026-10-20). Makiety: `kierunki/a-koszyk.html`, `kierunki/b-sloik.html`, `kierunki/c-tasma.html`; strona porównania: `porownanie.html` i `porownanie.png`. Ekran kluczowy: prowadzenie wypieku w stanach `w-trakcie` (składanie 2 z 4) i `koniec-kroku` (zdejmij pokrywę, z ostrzeżeniem RD-23). Dane planu i receptura: [PRZYKŁAD].

## Karty stylu

| Pole | A Koszyk spiralny | B Słoik z gumką | C Taśma z etykietą |
|---|---|---|---|
| Idea | Cały wypiek to zwoje koszyka do garowania: od środka (start) do brzegu (gotowe). | Każdy proces to słoik z kreskami: gumka znaczy start, czerwona kreska koniec kroku. | Każdy krok ma taśmę z godziną pisaną markerem, jak słoik i miska w kuchni. |
| Element firmowy i dane | spirala planu: wszystkie kroki (długość łuku według czasu, kroki bierne ponad 3 h skrócone i oznaczone), zrobione grube, przyszłe cienkie, noc w lodówce kropkami, znacznik „teraz”, koniec = godzina „gotowe”. VoiceOver: „Plan wypieku, krok 4 z 13: składanie 2 z 4. Gotowe o 9:35.” | słoik bieżącego kroku: poziom = upływ czasu (podpisane), kreski co 1/6 kroku, gumka = start, czerwona kreska = koniec, przelanie = po czasie; rząd małych słoików = dalsze kroki (wysokość według czasu). VoiceOver: „Minęło 12 z 30 minut, zostało 18.” | taśma bieżącego kroku z godziną końca; taśmy dalszych kroków z godzinami, lodówka na niebieskiej taśmie. VoiceOver: „Składanie 2 z 4 do 11:15, zostało 18 minut.” |
| Paleta (hex, pochodzenie) | płótno `#F5F5F2` (lniana ściereczka, neutralna, nie krem); żeliwo `#1C1D1B` (garnek); ratan `#9C6B2F` (zwoje zrobione); ratan szary `#8A8273` (zwoje przyszłe); noc `#1E4954` (godziny w lodówce, akcent); noc ciemna `#141A1C` (motyw ciemny: kuchnia o świcie) | biel `#FFFFFF`; szkło `#6F938E` (obrys słoika); tusz butelkowy `#0F2B2C` (szkło słoika w cieniu); gumka `#C4262E` (gumka i kreski na kroczu, Z-03: czerwone kreski); ciasto `#E4D7BC` (wypełnienie); szkło nocą `#0D1A1B` | biel `#FFFFFF`; marker `#151515`; taśma `#EAD9AE` (papierowa taśma malarska); taśma lodówki `#A9CBE3` (druga rolka, znaczy chłód); noc `#1E1F21` |
| Ostrzeżenie (wspólne) | `#F7D117` z czarnym, trójkąt z parą — wywiedzione z logiki ISO 7010 (Z-05), nie kopia znaku; zawsze ikona + tytuł + tekst | jw. z czarnym paskiem z lewej | jw. z czarną ramką |
| Kroje | tytuły Alegreya Sans 700 (humanistyczny, rękodzielniczy rytm); treść SF Pro (w makiecie Noto Sans) | tytuły Fira Sans Condensed 700 (wąski, techniczny jak nadruk miarki); treść SF Pro | godziny Caveat 700 (pismo markerem, tylko cyfry); tytuły i treść SF Pro |
| Kształty i gęstość | łagodne promienie 14–18, dużo powietrza, jeden obraz | ostre promienie 10, gęstsze, kreski miary | taśma z postrzępionymi brzegami, przyciski w pełni zaokrąglone, lista godzin |
| Moment ruchu, haptyki, dźwięku | po „Zrobione” zwój kroku zmienia się na gruby, znacznik przesuwa się o jeden zwój (300 ms); haptyka średnie uderzenie; dźwięk: szelest ratanu; „Ogranicz ruch”: bez przejścia | gumka „przeskakuje” na start następnego kroku (sprężyna 200 ms); haptyka sztywna, lekka; dźwięk: strzał gumki o szkło | stara taśma zsuwa się, nowa pojawia się z godziną; haptyka „sukces”; dźwięk: odrywana taśma |
| Głos: pusty / błąd / sukces | „Nic się dziś nie piecze. Wybierz, co robisz, a ułożę plan.” / „Nie zapisałem zmiany planu. Spróbuj jeszcze raz; poprzedni plan działa dalej.” / „Wypiek zapisany. Jak wyszedł bochenek?” | „Nic się dziś nie piecze. Wybierz, co robisz.” / „Zmiana planu nie zapisała się. Obowiązuje poprzedni plan; spróbuj ponownie.” / „Zapisano wypiek. Oceń bochenek, gdy ostygnie.” | „Na blacie pusto. Co dziś robisz?” / „Nie zapisałem nowej godziny. Plan został jak był; spróbuj jeszcze raz.” / „Zapisane. Jak wyszedł bochenek?” |
| Ikona | spirala z przerwami (kroki) w kolorze ratanu na nocy, kropka końca | słoik o prostych ściankach z czerwoną gumką i kreską, na szkle | taśma z „9:35” na ciemnym tle |
| Najmocniejszy argument | Jedyny kierunek, który na jednym przedmiocie z dziedziny pokazuje cały plan z nocą i godziną „gotowe” — odpowiedź na J-02 przy spojrzeniu 1–3 s; nikt w skanie nie ma takiego elementu. | Najlepszy dla zakwasu (ZP-19, J-04, J-07): gumka i kreski to prawdziwa praktyka (Z-02, Z-03), element czytelny przy 320 pt. | Najbardziej odporny na AX5 i 35 języków (to cyfry i tekst), najtańszy w budowie; godzina zegarowa to język, którym piekarz planuje. |

## Test generyczności (pole po polu; karty kontrolne w `01-swiat.md`, punkt 4)

| Kierunek | Pole | Pokrywa się z | Zmiana i powód |
|---|---|---|---|
| A | paleta | (a) brąz i krem | ratan tylko na zwojach z danymi, nigdy jako tło ani akcent; tło neutralne `#F5F5F2` zamiast kremu; akcent noc `#1E4954` |
| A | element | (a) okrągły licznik czasu | spirala niesie kroki i ich długości, nie procent; liczba minut poza spiralą; zwój zrobiony różni się grubością, nie tylko barwą |
| A | ruch | (a) postęp okręgu na żywo | ruch tylko na „Zrobione” (zmiana zwoju), między krokami spirala stoi |
| A | układ | (b) przycisk „Dalej” na dole | zostaje: pasek kciuka wynika z DEC-09 a i kontekstu rąk zajętych, nie z szablonu |
| A | krój | — | Alegreya Sans ≠ Playfair (a) ≠ Space Grotesk (b) |
| B | paleta (ciemny) | kalibracja: prawie czarne tło + jeden cynobrowy akcent | tło ciemne zabarwione szkłem butelkowym `#0D1A1B`; czerwień tylko na kreskach danych, nigdy na przycisku (czerwony przycisk w iOS znaczy „usuń”) — do decyzji, jeśli B wygra |
| B | układ | kalibracja: „duża liczba + mała etykieta” | liczba stoi przy słoiku jako odczyt jego skali, bez statystyk i gradientu; ryzyko zostaje nazwane |
| B | element | klisza kategorii: słoik (Levain, SST, Breadkin) | bez bąbelków i twarzy; słoik niesie czas, start i koniec kroku (klisza z funkcją, lekcja z Treningu) |
| C | paleta (ciemny) | (b) grafit + bursztyn | bez akcentu bursztynowego: jedynym kolorem jest taśma (przedmiot), przyciski czarno-białe |
| C | układ | (b) pionowa oś czasu z kropkami | godziny jako taśmy (przedmiot), bez osi i kropek |
| C | paleta | (a) krem | beż tylko na taśmie, tło białe |
| A, B, C | WERSALIKI, „A · B”, emoji, numeracja ozdobna | kalibracja | usunięte („Krok 4 z 13 · …” w B rozbite na dwie linie) |

## Krytyka (najpierw usterki) i poprawki

| Kierunek | Usterka (miejsce, co źle) | Poprawka | Para przed/po |
|---|---|---|---|
| A | AX5 320 pt: tytuł paska nawigacji nachodzi na „‹ Start” | tytuł usunięty z paska (tytułem jest nazwa kroku), pasek się zawija | `kierunki/przed-po/a-przed-320-ciemny-ax5.png` → `a-po-…` |
| A | spirala: znacznik „teraz” w złym miejscu (błąd danych makiety) | poprawione minuty (297, 1572) | jw. |
| A | lodówka 16 h zajmowała ¾ spirali, kroki czynne nieczytelne | skala złamana dla kroków biernych ponad 3 h, nazwana w kodzie i legendzie | — |
| A | zwoje przyszłe 1,57:1 do tła (grafika z danymi < 3:1) i różnica tylko barwą | `#8A8273` (3,48:1), przyszłe cienkie, zrobione grube | szarość: `a4` w scratchpadzie |
| A | legenda „noc w lodówce” wylewała się poza ekran (selektor SVG) | selektor `.kosz > svg` | — |
| B | etykiety „dalej” zlewały się („FermentacjaFormowanie”), ostatnia ucięta | stała szerokość i zawijanie | `przed-po/b-przed-390-jasny.png` → `b-po-…` |
| B | czerwień na każdym małym słoiku: przeładowanie jednym kolorem | czerwień tylko na bieżącym słoiku | jw. |
| B | „Krok 4 z 13 · Chleb…” — ciąg z kropką z kalibracji | dwie linie | jw. |
| B | obrys szkła 1,46:1 | `#6F938E` (3,37:1) | — |
| B | ikona: mały słoik na pustym tle, czyta się jak bateria | większy słoik z gumką na tle szkła | jw. |
| C | słowa pismem odręcznym („minęło 2 min”), a Caveat nie ma greki | odręczne tylko cyfry, słowa krojem systemowym | `przed-po/c-przed-390-jasny.png` → `c-po-…` |
| C | „zostało 18 min” za słabe przy spojrzeniu 1–3 s | większa liczba | jw. |
| C | ikona: taśma na białym, przy 29 pt beżowa plama | taśma na całą szerokość na ciemnym tle, większe cyfry | jw. |
| C | obwódki przycisków w ciemnym 1,9:1 | `#6A6B6E` (3,10:1) | — |
| wszystkie | AX5 320 pt: wyrazy dłuższe niż szerokość dzielą się w środku („Zrobion-e”) | mniejszy margines przy AX5; pełna poprawka w E3 (skala tytułów, przycisk) | otwarte do E3 |

Odpowiedzi na listę krytyki (moduł render-i-krytyka): (1) w pierwszej sekundzie: A — gdzie jestem w całym planie i ile minut; B — ile zostało w tym kroku; C — o której koniec kroku. (2) Element przy 320 pt: czytelny w A, B, C; w A przy AX5 spirala zostaje 150 pt, opisy obok. (3) Kalibracja: patrz tabela testu. (4) Hierarchia: krok → czas → co zrobić → akcje. (5) Ciemny: osobne barwy, nie odwrócenie. (6) AX5: patrz ostatni wiersz krytyki. (7) Po zakryciu nazwy: A — spirala; B — słoik z czerwoną gumką; C — taśma z cyframi markera.

## Kontrast palet E2 (`narzedzia/kontrast.mjs`, 2026-10-20)
Wszystkie pary tekstu ≥ 4,5:1 i grafiki z danymi ≥ 3:1 po poprawkach (najniższe: A zwoje przyszłe 3,48:1; B obrys szkła 3,37:1; C obwódka przycisku w ciemnym 3,10:1). Pełna tabela z wariantem „Zwiększ kontrast” w E3.

## Rekomendacja
**A Koszyk spiralny.** Powód funkcjonalny: główna praca to J-02 („kiedy zacząć każdy etap”), a tylko A pokazuje cały plan z nocą i godziną „gotowe” na jednym przedmiocie, przy spojrzeniu z rękami w cieście. B jest silniejszy na ekranie zakwasu — jego słoik może wrócić jako element karty zakwasu, jeśli właściciel zechce połączyć kierunki. Opcjonalny test: pięciosekundowy z 5 osobami (ok. 1 h czasu właściciela).

## Wybór właściciela
2026-10-20, w trakcie budowy E2, przed obejrzeniem strony porównania: „Dobra, juz z gory moge CI powiedziec ze idziemy w koszyk spiralny”. Wpis w `docs/decyzje.md` (D-049); potwierdzenie okiem na stronie porównania na STOP E2.

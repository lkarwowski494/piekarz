# Przegląd zrzutów App Store (L-004): Piekarz, przebieg „Zrzuty sklepu” #7, run 43218573090 (master 69edd0fb, pl, nowy build)

Artefakty pobrane (mcp__github__actions_get, download_workflow_run_artifact) i rozpakowane, każdy do osobnego katalogu `/tmp/claude-0/-home-user/3dd8e55d-a52e-544c-89dd-89a6bfd3ff60/scratchpad/z7/<nazwa>/`:
- `sklep-ramki`, id 13952191225: ramki z podpisem, ocenione niżej (główny przedmiot oceny).
- `sklep-zrzuty`, id 13952066304: zrzuty sklepu bez ramki; sprawdzone tylko wymiary i tryb, nie oglądane jako obrazy.
- `zrzuty-surowe-iphone-6.9-1`, id 13951547348, i `zrzuty-surowe-iphone-6.3-1`, id 13949002566: sprawdzone tylko wymiary i tryb, nie oglądane jako obrazy.
- Dzienniki: nie pobierane (zgodnie z poleceniem).

Ramki: 14 (7 × 2). iphone-6.9 ma 1320×2868, iphone-6.3 ma 1206×2622 (sprawdzone `python3 -I` + PIL). Wszystkie ramki i `sklep-zrzuty` są w trybie RGB, bez kanału alfa. Surowe zrzuty mają tryb RGBA z alfą stale 255 (w pełni nieprzezroczyste); nie trafiają do sklepu.

Data w symulatorze: piątek, 13 listopada 2026. Pasek statusu: 09:41.

Nagłówki odczytane z ramek (identyczne w obu rozmiarach):
01 „Na twoją godzinę, z ochroną snu” · 02 „Gramy każdego składnika od razu” · 03 „Krok po kroku, z powiadomieniem” · 04 „Co poprawić w następnym bochenku” · 05 „Zakwas zawsze gotowy na czas” · 06 „Każdy wypiek zapisany” · 07 „Bez konta, reklam i internetu”.
Zgodność z przeglądem #6: raport #6 (`przeglad-zrzuty5-pl.md`) nie zapisuje pełnych tekstów nagłówków, tylko stwierdza ich zgodność; dosłownie cytuje tylko 03 („Krok po kroku, z powiadomieniem”), a raport #4 cytuje fragmenty 01 („z ochroną snu”) i 06 („Każdy wypiek zapisany”). Te trzy są zgodne. Dla 02, 04, 05, 07 dosłownego porównania z #6 **nie sprawdzono** (brak tekstu wzorcowego; ramki #6 nie są już dostępne na dysku). Uwaga: lokalny klon repo (`/home/user/piekarz` @ fc9c0733, nie zawiera 69edd0fb) ma w `docs/wydanie/zrzuty/pl/podpisy.json` inne nagłówki 01, 03 i 07 oraz podtytuły, których na ramkach nie ma; to inna wersja repo, więc nie traktuję tego jako znaleziska. Plakietka „wymaga Piekarz Pro” jest na 01 i 05.

## Tabela

| # | Rozmiar | Nagłówek zgodny | Pro | Ucięcia | Ekran pokazuje treść nagłówka | Znaleziska |
|---|---|---|---|---|---|---|
| 01 | 6.9 | tak (fragment „z ochroną snu” jak w #4) | tak | górna karta (temperatura) zaczyna się w połowie tekstu; oś czasu ucięta paskiem przycisków | tak: karta „Ochrona snu aktywna” w całości, „Start dziś o 09:44” | P3 |
| 01 | 6.3 | tak | tak | pod górnym paskiem wystają dolne krawędzie chipów; oś czasu ucięta | tak: karta „Ochrona snu aktywna” w całości | P3 |
| 02 | 6.9 | niesprawdzone dosłownie (brak wzorca) | nie dotyczy | 4. składnik (Zakwas) ucięty paskiem przycisków | tak: 3 pełne składniki z gramami i % | P3 |
| 02 | 6.3 | jak wyżej | nie dotyczy | „Mąka żytnia typ 720” przecięta górnym paskiem; „Wskazówki…” ucięte na dole | tak: Woda, Zakwas, Sól, „Razem 900 g” | P3 |
| 03 | 6.9 | tak (cytat z #6) | nie dotyczy | spirala w karcie „Plan wypieku” ucięta paskiem przycisków | tak w części „krok po kroku” (Krok 2 z 11, 45 min, „do 10:28”); powiadomienia nie widać | P3 |
| 03 | 6.3 | tak | nie dotyczy | karta „Plan wypieku” ucięta, spirali nie widać wcale | jak wyżej („do 10:27”) | P3 |
| 04 | 6.9 | niesprawdzone dosłownie | nie dotyczy | brak | tak, cała karta diagnozy | OK |
| 04 | 6.3 | jak wyżej | nie dotyczy | pod górnym paskiem cienka krawędź poprzedniej karty; opis „Test palca” na krawędzi ramki | tak | P3 |
| 05 | 6.9 | niesprawdzone dosłownie | tak | „Ostatnie wpisy”: drugi wpis dotyka paska zakładek, czytelny | **tak: pas z pierścieniem („6 godzin 3 minuty od dokarmienia”, 03:38 → 15:38) i „Gotowy do ciasta.” widoczne naraz** | P3 |
| 05 | 6.3 | jak wyżej | tak | wpis „Dziś 09:37: Obserwacja…” przecięty paskiem zakładek | **tak: pas z pierścieniem (03:37 → 15:37) i „Gotowy do ciasta.” widoczne naraz** | P3 |
| 06 | 6.9 | tak (fragment z #4) | nie dotyczy | brak | tak: radar z 5 pełnymi etykietami i wartościami; tylko 1 wypiek | P3 |
| 06 | 6.3 | tak | nie dotyczy | dolne etykiety radaru (Otwartość, Kwasowość) i przyciski karty pod paskiem zakładek | tak (3 górne etykiety pełne) | P3 |
| 07 | 6.9 | niesprawdzone dosłownie | nie dotyczy | przycisk pod spiralą ucięty paskiem zakładek | trwający wypiek („Autoliza, zostało 46 minut, do 10:28”); o koncie, reklamach i sieci ekran nic nie mówi | P3 |
| 07 | 6.3 | jak wyżej | nie dotyczy | tytuł „Autoliza (mąka + woda)” przecięty paskiem zakładek; czasu i „gotowe jutro” nie widać | trwający wypiek tylko jako spirala i wiersz „Następne” | P3 |

Nagłówki wszystkich 7 scen są obecne w obu rozmiarach, czytelne i nieucięte. Nagłówki kart w żadnej ramce nie łamią się po literach (sprawdzone wzrokowo na 14 ramkach; najdłuższe: „Statystyki piekarni domowej”, „Wiejski chleb codzienny na zakwasie” zawija się normalnie po słowie na 6.3). Nie znaleziono angielskich tekstów, komunikatów błędów ani danych osobowych.

## Kontrola poprzednich znalezisk (przegląd #6)

- **P1 „Szczyt aktywności” łamany po literach (05, 6.3): nie występuje na zrzutach.** Po D-393 karta „Szczyt aktywności” nie mieści się w kadrze 05 na żadnym rozmiarze, więc samej poprawki D-392 nie da się na tych zrzutach zobaczyć — **poprawka układu karty: niesprawdzona wzrokowo** (z tych artefaktów). Żaden nagłówek karty w żadnej ramce nie łamie się po literach.
- **P2 kadr 05 (pas vs „Gotowy do ciasta.”): usunięte.** Na obu rozmiarach karta „Cykl dokarmiania” stoi bezpośrednio pod pasem; widać naraz pierścień postępu z czasem od dokarmienia i etykietę „Gotowy do ciasta.” wraz z przyciskiem „Podwoił objętość”. Pas pokazuje pierścień postępu, nie spiralę jak na 01, 03 i 07 (jak w #6; mieści się w „spirala/pierścień”).
- „Wiek zakwasu 0 dni” (P3 z #6): poza kadrem, niewidoczne.

## Znaleziska

### P1 (blokuje wgranie)
Brak.

### P2
Brak.

### P3
Jest ich 10:
1. Minutowe rozjazdy godzin między rozmiarami (6.3 o minutę wcześniej: 10:27, 15:37, 03:37) i na 05 6.3 wewnątrz ekranu: pas „6 godzin 3 minuty”, chip „6 godzin 4 minuty”.
2. 01: ucięcia na krawędziach (górna karta, oś czasu; na 6.3 krawędzie chipów pod paskiem).
3. 02: ucięty 4. składnik (6.9) i „Mąka żytnia” / „Wskazówki” (6.3).
4. 03: spirala ucięta (6.9) lub niewidoczna (6.3); powiadomienia nie widać.
5. 04 (6.3): cienka krawędź poprzedniej karty pod górnym paskiem.
6. 05 (6.3): wpis „Dziś 09:37: Obserwacja…” przecięty paskiem zakładek.
7. 06: tylko 1 wypiek; na 6.3 dolne etykiety radaru pod paskiem zakładek.
8. 07: przycisk (6.9) i tytuł kroku (6.3) ucięte paskiem zakładek.
9. 07: w tekście „karmienie zakwasu Mój zakwas” nadal brak separatora przed nazwą zakwasu.
10. 07: ekran nic nie mówi o koncie, reklamach ani sieci (pokrycie nagłówka tylko przez brak ekranu logowania).

### Niesprawdzone
- Dosłowna zgodność nagłówków 02, 04, 05, 07 z przeglądem #6 (brak tekstu wzorcowego).
- Poprawka D-392 w samej karcie „Szczyt aktywności” (karta poza kadrem).
- `sklep-zrzuty` i surowe zrzuty: tylko wymiary i tryb, bez oglądania obrazów.

## Werdykt

**Brak P1 i P2.** 14 ramek o poprawnych wymiarach, RGB bez alfy, nagłówki obecne i nieucięte, scena 05 spełnia kompozycję na obu rozmiarach. Z punktu widzenia L-004 lokalizacja pl nadaje się do dalszego kroku (pełne lokalizacje). P3: 10.

## Pliki (ramki z podpisem)
sklep-ramki/pl/iphone-6.9/{01-plan,02-receptura,03-prowadzenie-ciemny,04-doktor,05-zakwasy,06-dziennik,07-offline}.png
sklep-ramki/pl/iphone-6.3/{te same 7 nazw}.png
(katalog bazowy: /tmp/claude-0/-home-user/3dd8e55d-a52e-544c-89dd-89a6bfd3ff60/scratchpad/z7/)

## Uzupełnienie: nagłówki wobec pliku z buildu (69edd0fb)

Źródło prawdy: `git -C /home/user/piekarz show 69edd0fb:docs/wydanie/zrzuty/pl/podpisy.json` (origin/master = 69edd0fba51c…). Porównanie dosłowne z tekstem odczytanym z 14 ramek; łamanie wiersza w ramce pominięte, znaki i interpunkcja porównane:

| # | `naglowek` w 69edd0fb | 6.9 | 6.3 |
|---|---|---|---|
| 01 | Na twoją godzinę, z ochroną snu | zgodny, nieucięty | zgodny, nieucięty |
| 02 | Gramy każdego składnika od razu | zgodny, nieucięty | zgodny, nieucięty |
| 03 | Krok po kroku, z powiadomieniem | zgodny, nieucięty | zgodny, nieucięty |
| 04 | Co poprawić w następnym bochenku | zgodny, nieucięty | zgodny, nieucięty |
| 05 | Zakwas zawsze gotowy na czas | zgodny, nieucięty | zgodny, nieucięty |
| 06 | Każdy wypiek zapisany | zgodny, nieucięty | zgodny, nieucięty |
| 07 | Bez konta, reklam i internetu | zgodny, nieucięty | zgodny, nieucięty |

Wynik: **zgodne 14/14**, brak nowego P1. Punkt „niesprawdzone: dosłowna zgodność nagłówków 02, 04, 05, 07” jest tym samym zamknięty. Uwaga z pierwszej wersji raportu o innych nagłówkach w lokalnym `podpisy.json` dotyczyła checkoutu fc9c0733 i jest nieaktualna.

Obserwacja bez klasyfikacji: plik ma też pole `podtytul` dla każdej ramki, a na ramkach podtytułów nie ma. Nie sprawdzałem, czy generator ramek w ogóle je renderuje (w skryptach 69edd0fb `podtytul` ramki pojawia się w kontroli metadanych i w kartach ustawień, generatora ramek nie przeglądałem), więc nie liczę tego jako znaleziska.

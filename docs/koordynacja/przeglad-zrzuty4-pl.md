# Przegląd zrzutów App Store: Piekarz, run 43085791241 (master 935cd8dc, pl)

Artefakty: `sklep-ramki` id 13889232493, `sklep-zrzuty` id 13890105528 (oba pobrane i rozpakowane).
Ramki: 14 (7 × 2). iphone-6.9: 1320×2868, iphone-6.3: 1206×2622; wszystkie sRGB TrueColor, bez kanału alfa (to samo dotyczy surowych zrzutów).

## Tabela

| # | Rozmiar | Nagłówek zgodny | Pro | Ucięcia | Ekran pokazuje treść nagłówka | Znaleziska |
|---|---|---|---|---|---|---|
| 01 | 6.9 | tak | tak | rząd chipów dat ucięty z boku (przewijany, OK); karta „Ochrona snu aktywna” widoczna tylko jako nagłówek, ucięta paskiem przycisków | częściowo | P3 |
| 01 | 6.3 | tak | tak | karty „Ochrona snu aktywna” w ogóle nie widać | nie (brak „ochrony snu”) | P2 |
| 02 | 6.9 | tak | nie dotyczy | 4. składnik (Zakwas) ucięty pod paskiem przycisków | tak (3 składniki z gramami) | P3 |
| 02 | 6.3 | tak | nie dotyczy | widać 1 pełny składnik, 2. ucięty (ukryte „20%”) | słabo | P2 |
| 03 | 6.9 | tak | nie dotyczy | spirala w karcie planu ucięta | nie (aktywny krok, brak powiadomienia ani ekranu blokady) | P2 (treść), P2 (godziny) |
| 03 | 6.3 | tak | nie dotyczy | karta planu ucięta | nie (jak wyżej) | P2, P2 |
| 04 | 6.9 | tak | nie dotyczy | brak | tak, cała karta diagnozy (nazwa, objaw, przyczyna, 4 kroki, przyciski) | OK |
| 04 | 6.3 | tak | nie dotyczy | nazwa „Niedofermentowanie” widoczna w całości, nie jest schowana; pod górnym paskiem wystaje tylko cienka krawędź poprzedniej karty | tak | P3 |
| 05 | 6.9 | tak | tak | tekst „przechowywania” przecięty górnym paskiem; karta ilości ucięta na dole | częściowo: jest „Gotowy do ciasta.”, nie ma „Dnia 1”, brak pasa ze spiralą (przewinięty poza ekran) | P2 |
| 05 | 6.3 | tak | tak | chipy temperatur ucięte paskiem zakładek | częściowo, brak pasa ze spiralą | P2 |
| 06 | 6.9 | tak | nie dotyczy | **etykiety radaru ucięte: „ıcja”, „Spr”, „twartość”, „Kwasow”; wartości „(3)”, „(4)” w złych miejscach („(4)” na środku wykresu)** | tak, ale tylko 1 wypiek | **P1** |
| 06 | 6.3 | tak | nie dotyczy | to samo z radarem, dodatkowo przyciski karty ucięte | jak wyżej | **P1** |
| 07 | 6.9 | tak | nie dotyczy | brak | nie (zwykły ekran „Dziś”, nic o koncie, reklamach ani sieci) | P2 (pusty stan), P3 |
| 07 | 6.3 | tak | nie dotyczy | brak | jak wyżej | P2, P3 |

Wszystkie 7 nagłówków jest dosłownie zgodnych w obu rozmiarach, czytelnych i nieuciętych. Angielskich tekstów, komunikatów błędów ani danych osobowych nie znaleziono.

## Znaleziska

### P1 (blokuje wysyłkę)
1. **06-dziennik, 6.9 i 6.3:** wykres radarowy smaku ma ucięte etykiety osi („ıcja” ≈ Fermentacja?, „Spr” ≈ Sprężystość, „twartość” ≈ Twardość/Zwartość, „Kwasow” ≈ Kwasowość). Wartości w nawiasach są rozjechane: „(3)” obok „Chrupkość”, „(4)” na środku wykresu, „(3)” między dolnymi etykietami. To wygląda na błąd układu w samej aplikacji (etykiety SVG wychodzą poza obszar wykresu), a nie na błąd kadrowania. Dotyczy to również produkcyjnego ekranu Dziennika.

### P2
2. **03-prowadzenie-ciemny, oba rozmiary:** nagłówek obiecuje „Powiadomienie, gdy telefon śpi”, a ekran pokazuje aktywny krok „Autoliza”. Nie widać ani powiadomienia, ani ekranu blokady.
3. **Godziny niespójne z paskiem statusu 09:41 (03, 05, 07):** ramka 03 pokazuje „do 20:44” (6.9) i „do 20:38” (6.3). Ramka 05 ma wpisy „Dziś 19:38/19:39” (6.9) i „19:40/19:41” (6.3), a chip pokazuje „12 minut” albo „6 minut od dokarmienia”. Ramka 07 pokazuje „jutro 07:38” albo „07:40”. Zrzuty biorą rzeczywisty zegar CI, więc różnią się między rozmiarami i przeczą godzinie 09:41. Dodatkowo „dokarmienie”, a minutę później „podwoił objętość”, wygląda nierealnie.
4. **05-zakwasy, oba rozmiary:** brak oczekiwanego pasa ze spiralą, bo ekran jest przewinięty do „Cyklu dokarmiania”. Karta „Gotowy do ciasta.” jest obecna i nie ma „Dnia 1”. Na 6.9 tekst „przechowywania” jest przecięty górnym paskiem.
5. **07-offline, oba rozmiary:** widać pusty stan („Tu pojawi się plan wypieku i tydzień z karmieniami, gdy coś zaczniesz.”), choć kalendarz ma znaczniki 11 i 12 listopada, a wiersz „Następne: jutro 07:38 karmienie zakwasu” istnieje. To sprzeczne i wygląda na pustą aplikację.
6. **01-plan, 6.3:** karta „Ochrona snu aktywna” jest niewidoczna, więc druga połowa nagłówka („z ochroną snu”) nie ma pokrycia na ekranie.
7. **02-receptura, 6.3:** widać tylko jeden pełny składnik, drugi jest ucięty. Słabe pokrycie hasła „Gramy każdego składnika”.

### P3
8. **07:** w tekście „karmienie zakwasu Mój zakwas” brakuje separatora przed nazwą zakwasu. Na 6.3 słowo „zakwas” zawija się do nowej linii.
9. **06:** jest tylko 1 wypiek („Łącznie wypieków 1”), co słabo ilustruje hasło „Każdy wypiek zapisany”. Średnia ocena to „4”, a przy wpisie jest „4/5”.
10. **01 (6.9) i 02 (6.9):** dolne karty są ucięte przez przyklejony pasek przycisków. Tak działa ta aplikacja, ale lepszy byłby kadr bez urwanego tekstu.
11. **04 (6.3):** nad kartą diagnozy, tuż pod paskiem nawigacji, widać cienką krawędź poprzedniej karty.

## Pliki (ramki z podpisem)
sklep-ramki/pl/iphone-6.9/{01-plan,02-receptura,03-prowadzenie-ciemny,04-doktor,05-zakwasy,06-dziennik,07-offline}.png
sklep-ramki/pl/iphone-6.3/{te same 7 nazw}.png
(katalog bazowy: /tmp/claude-0/-home-user/85b32e4e-1772-567c-afe1-76df566c5275/scratchpad/zrzuty4/)

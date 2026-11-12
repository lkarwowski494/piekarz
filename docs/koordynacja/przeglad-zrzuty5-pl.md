# Przegląd zrzutów App Store: Piekarz, run 43176824676 (master e387da72, pl)

Artefakty pobrane i rozpakowane:
- `sklep-ramki`, id 13926880483: ramki z podpisem, ocenione niżej.
- `sklep-zrzuty`, id 13926103726: zrzuty sklepu bez ramki.
- `zrzuty-surowe-iphone-6.9-1`, id 13926128782, i `zrzuty-surowe-iphone-6.3-1`, id 13925594063: posłużyły do porównania.
- `zrzuty-dzienniki-iphone-6.9-1`, id 13927030029, i `zrzuty-dzienniki-iphone-6.3-1`, id 13925639233: nie oglądane.

Ramki: 14 (7 × 2). iphone-6.9 ma 1320×2868, iphone-6.3 ma 1206×2622. Wszystkie ramki i `sklep-zrzuty` są w trybie RGB, bez kanału alfa i bez przezroczystości. Surowe zrzuty mają tryb RGBA, ale alfa jest stale 255, więc są w pełni nieprzezroczyste. Nie trafiają one do sklepu.

Data w symulatorze to piątek, 13 listopada 2026. Pasek statusu pokazuje 09:41.

## Tabela

| # | Rozmiar | Nagłówek zgodny | Pro | Ucięcia | Ekran pokazuje treść nagłówka | Znaleziska |
|---|---|---|---|---|---|---|
| 01 | 6.9 | tak | tak | górna karta (temperatura) zaczyna się w połowie tekstu; oś czasu ucięta paskiem przycisków | tak: karta „Ochrona snu aktywna” jest w całości, widać start „dziś o 09:44” | P3 |
| 01 | 6.3 | tak | tak | pod górnym paskiem wystają dolne krawędzie chipów; oś czasu ucięta | tak: karta „Ochrona snu aktywna” jest w całości | P3 |
| 02 | 6.9 | tak | nie dotyczy | 4. składnik (Zakwas) ucięty paskiem przycisków | tak (3 pełne składniki z gramami i %) | P3 |
| 02 | 6.3 | tak | nie dotyczy | „Mąka żytnia typ 720” przecięta górnym paskiem; „Wskazówki…” ucięte na dole | tak: 3 pełne składniki (Woda, Zakwas, Sól) i „Razem 900 g” | P3 |
| 03 | 6.9 | tak | nie dotyczy | spirala w karcie „Plan wypieku” ucięta paskiem przycisków | tak w części „krok po kroku” (Krok 2 z 11, 45 min, „do 10:28”); samego powiadomienia nie widać | P3 |
| 03 | 6.3 | tak | nie dotyczy | karta „Plan wypieku” ucięta | jak wyżej („do 10:27”) | P3 |
| 04 | 6.9 | tak | nie dotyczy | brak | tak, cała karta diagnozy | OK |
| 04 | 6.3 | tak | nie dotyczy | pod górnym paskiem cienka krawędź poprzedniej karty; opis „Test palca” ucięty ramką | tak | P3 |
| 05 | 6.9 | tak | tak | pod górnym paskiem nic nie ma (OK); zdanie „Wtedy jest gotowy do ciasta.” ucięte paskiem zakładek | częściowo: jest pas z pierścieniem (6 h 2 min od dokarmienia o 03:39, następne o 15:39), ale **brak etykiety „Gotowy do ciasta.”** | P2, P3 |
| 05 | 6.3 | tak | tak | ekran przewinięty: górna część karty profilu schowana | częściowo: jest „Gotowy do ciasta.” i wpisy 03:38 / 09:36, ale **brak pasa ze spiralą**; **nagłówek „Szczyt aktywności” łamany po 3–4 litery** | **P1**, P2 |
| 06 | 6.9 | tak | nie dotyczy | brak | tak: radar z 5 pełnymi etykietami i wartościami, ale tylko 1 wypiek | P3 |
| 06 | 6.3 | tak | nie dotyczy | dolna połowa radaru (Otwartość, Kwasowość) i przyciski karty pod paskiem zakładek | tak (3 górne etykiety pełne) | P3 |
| 07 | 6.9 | tak | nie dotyczy | przycisk pod spiralą ucięty paskiem zakładek | ekran pokazuje trwający wypiek („Autoliza, zostało 47 minut, do 10:28”); o koncie, reklamach i sieci nic nie mówi | P3 |
| 07 | 6.3 | tak | nie dotyczy | tytuł kroku „Autoliza (mąka + woda)” przecięty paskiem zakładek, czasu i tekstu „gotowe jutro” nie widać | trwający wypiek widać tylko jako spiralę i wiersz „Następne” | P3 |

Wszystkie 7 nagłówków jest dosłownie zgodnych w obu rozmiarach, czytelnych i nieuciętych. Plakietka „wymaga Piekarz Pro” jest na 01 i 05. Nie znaleziono angielskich tekstów, komunikatów błędów ani danych osobowych.

## Kontrola poprawek z przeglądu run 43085791241

- **(a) Godziny zgodne z 09:41: OK, z drobnymi rozjazdami (P3).**
  - 03 i 07 na 6.9: „do 10:28” i „zostało 47 minut”, czyli 09:41 + 47 min.
  - 05 na 6.9: dokarmienie o 03:39, „6 godzin 2 minuty”.
  - Plan „gotowe jutro o 09:54”, karmienie „dziś 15:39”, czyli 03:39 + 12 h.
  - Odstęp dokarmienie → podwojenie na 6.3 wynosi 03:38 → 09:36, czyli 5 h 58 min. To realne.
  - Rozjazdy: na 6.3 czasy są o minutę wcześniejsze (10:27, 15:38). Chip na 05 6.3 pokazuje „6 godzin 6 minut od dokarmienia”, co daje około 09:44, nie 09:41. Na 05 6.9 pas mówi „6 godzin 2 minuty”, a chip „6 godzin 3 minuty” na tym samym ekranie.
- **(b) 03, nagłówek „Krok po kroku, z powiadomieniem”: OK.** Ekran pokazuje prowadzenie krokami (Krok 2 z 11, odliczanie, „Zrobione”). Samego powiadomienia nie widać, ale nagłówek już nie obiecuje ekranu blokady (P3).
- **(c) Kompozycja scen.**
  - 01 na 6.3 z kartą „Ochrona snu aktywna”: **OK**.
  - 02 na 6.3 z więcej niż jednym pełnym składnikiem: **OK** (3 pełne, czwarty przecięty u góry).
  - 05: **nie OK**. Wymagania spełnia tylko jeden rozmiar naraz. Na 6.9 jest pas i nic nie wystaje pod górnym paskiem, ale nie ma „Gotowy do ciasta.”. Na 6.3 jest „Gotowy do ciasta.”, ale nie ma pasa ze spiralą, a do tego jest złamany nagłówek „Szczyt aktywności” (P1). Pas na 6.9 pokazuje pierścień postępu, nie spiralę jak na 01, 03 i 07. Do decyzji, czy to wystarcza.
  - 07 bez pustego stanu i z trwającym wypiekiem: **OK** w obu rozmiarach.
- **(d) 06, radar: OK.** Etykiety są pełne i nieucięte, wartości w nawiasach stoją przy etykietach: Chrupkość (3), Sprężystość (4), Kwasowość (3), Otwartość (3), Karmelizacja (4). Na 6.3 dolne etykiety zakrywa pasek zakładek, ale to kwestia kadru, nie układu (P3).

## Znaleziska

### P1 (blokuje wysyłkę)
1. **05-zakwasy, 6.3:** tytuł karty „Szczyt aktywności” łamie się w kolumnie po kilka liter: „Szcz / yt / akty / wnoś / ci”. Chip „6 godzin 6 minut od dokarmienia” zabiera prawie całą szerokość wiersza. To błąd układu w aplikacji (tytuł obok chipa w jednym rzędzie, bez `flexShrink` i bez zawijania chipa pod tytuł). Prawdopodobnie występuje także na 6.9 i na węższych ekranach, ale tam karta jest poza kadrem.

### P2
2. **05-zakwasy, oba rozmiary:** żaden rozmiar nie spełnia kompozycji. Na 6.9 nie widać etykiety „Gotowy do ciasta.”, bo karta „Cyklu dokarmiania” jest ucięta paskiem zakładek. Na 6.3 nie widać pasa z pierścieniem lub spiralą, bo ekran jest przewinięty za daleko. Potrzebny jest jeden kadr, który obejmie pas i „Gotowy do ciasta.”, na przykład przez zwinięcie „Profilu zakwasu” albo osobny offset przewinięcia dla każdego rozmiaru.

### P3
Jest ich 11, wszystkie w tabeli i w sekcji kontroli:
- minutowe rozjazdy godzin między rozmiarami i wewnątrz 05;
- ucięcia na krawędziach na 01, 02, 03, 04 (6.3), 06 (6.3) i 07;
- 03: powiadomienia nie widać;
- 06: tylko 1 wypiek;
- 07: w tekście „karmienie zakwasu Mój zakwas” wciąż brakuje separatora przed nazwą;
- 07: ekran nic nie mówi o koncie, reklamach ani sieci;
- 05: „Wiek zakwasu 0 dni” przy zakwasie, który jest gotowy do ciasta.

## Pliki (ramki z podpisem)
sklep-ramki/pl/iphone-6.9/{01-plan,02-receptura,03-prowadzenie-ciemny,04-doktor,05-zakwasy,06-dziennik,07-offline}.png
sklep-ramki/pl/iphone-6.3/{te same 7 nazw}.png
(katalog bazowy: /tmp/claude-0/-home-user-piekarz/964be1dc-1ede-424e-801b-c28498f1cf0e/scratchpad/zrzuty6/)
Arkusz do pokazu: /tmp/claude-0/-home-user-piekarz/964be1dc-1ede-424e-801b-c28498f1cf0e/scratchpad/arkusz-zrzuty6-pl.png (3090×1984, 1,7 MB)

# Krytyka zrzutów E3 (najpierw usterki)

Rola 04, 2026-10-20 · zrzuty oglądane na arkuszach zbiorczych (390 jasny i ciemny, 320 AX5, skala szarości, en-US imperialne, fr) przed zapisaniem zrzutów wzorcowych. P1 = blokuje kryterium partii 5 albo podłogę dostępności; P2 = jakość.

| # | P | Ekran, wariant | Usterka | Poprawka | Stan |
|---|---|---|---|---|---|
| 1 | P1 | wszystkie | ikony i spirale się nie rysowały (kolejność skryptu: `var` użyte przed definicją) | inicjalizacja `START()` na końcu pliku | poprawione |
| 2 | P1 | prowadzenie, zakwas | ikona w polu informacji i ostrzeżenia zajmowała połowę szerokości, tekst spychany w prawo | ikona `flex: none` | poprawione |
| 3 | P1 | receptura 320 AX5 | wagi („863 g”) ucięte przy prawej krawędzi (055) | tabela zamieniona na wiersze z zawijaniem: waga pod nazwą przy dużym tekście | poprawione |
| 4 | P1 | receptura 320 AX5 | „Temperatura wody” ucięte w siatce dwóch kolumn | akcje w rzędzie z zawijaniem, przy AX5 pełna szerokość | poprawione |
| 5 | P1 | zakwas 320 AX5 | „Edytuj” obok wpisu łamało tekst na pojedyncze litery | wartość pod etykietą od AX1 (`.kom .roz` rośnie z rozmiarem) | poprawione |
| 6 | P1 | prowadzenie 320 AX5 | pasek „Cofnięto…” wylewał tekst poza pole | tekst z `min-width: 0` i zawijaniem | poprawione |
| 7 | P1 | oferta `bez-sieci` | cena wyszarzona przezroczystością (kontrast < 4,5) | kolor `tusz3` z tokenów (4,5+) | poprawione |
| 8 | P1 | receptura `mieszanka-i-sol` | pasek udziałów mąk w kolorach ratanu — te same kolory znaczą „zrobione/przyszłe” w spirali (jeden kolor, dwa znaczenia) | pasek w barwach neutralnych + podpis udziałów | poprawione |
| 9 | P1 | oferta | wybrany plan odróżniony tylko grubością ramki | znacznik wyboru kształtem (kółko pełne/puste) + `aria-checked` | poprawione |
| 10 | P2 | prowadzenie AX5 | dwa przyciski drugiego rzędu obok siebie w wąskich kolumnach (fr: „Annu-ler le pré-cé-dent”) | od AX1 pełna szerokość, pod sobą | poprawione |
| 11 | P2 | start AX5 | ikona wyboru i tytuł obok siebie łamały słowa („Zakłada m”) | tytuł pod ikoną przy dużym tekście | poprawione |
| 12 | P2 | receptura AX5 | stepper „Bochenki” nie rósł z tekstem | przyciski i cyfra skalują się z rozmiarem | poprawione |
| 13 | P2 | zakwas | jeden cykl dokarmienia rysowany jak ciasna spirala 3 zwojów, nieczytelny | jeden cykl = niecałe 2 zwoje, szerszy przy AX5 | poprawione |
| 14 | P2 | ikona | kropka końca wychodziła poza kwadrat | mniejszy przyrost promienia | poprawione |
| 15 | P2 | ustawienia | „uncje, °F” zaznaczone także w polskim zrzucie | zaznaczenie z trybu jednostek (`data-u`) | poprawione |
| 16 | P2 | zakwas, start (en, fr) | samodzielne „przykład” bez przekładu | klucz `w.przyklad` | poprawione |
| 17 | P2 | prowadzenie `po-cofnieciu` | tekst „Powiadomienia mają stare godziny” niejasny | „Powiadomienia wróciły do poprzednich godzin.” | poprawione |
| 18 | P2 | zakwas | „Dokarmiłem” — forma rodzajowa | „Zapisz dokarmienie” | poprawione |
| 19 | P2 | wszystkie 320 AX5 | długie słowa dzielone w środku (pl bez słownika dzielenia w Chromium; fr z dzieleniem) | nazwane ograniczenie makiety; nic nie jest ucięte; na iOS sprawdza audyt po wdrożeniu (pl, fi, de) | otwarte (nazwane) |
| 20 | P2 | wszystkie | etykiety VoiceOver w makietach są po polsku także w en i fr | w aplikacji z `t()` (051); makieta tego nie pokazuje | otwarte (wdrożenie) |

Lista P1 pusta po poprawkach. Pary przed/po dla kierunków są w `kierunki/przed-po/` (E2); dla E3 dowodem są poprawione zrzuty w `wzorce-zrzuty/` i powyższa tabela.

Odpowiedzi na pytania krytyki (moduł render-i-krytyka): (1) w pierwszej sekundzie: krok i minuty (prowadzenie), co dziś robię (start), wagi (receptura); (2) spirala czytelna przy 320 pt i w małej wersji na „Dziś”; (3) kalibracja: wszystkie wybory z decyzją (spec, rozdział 12); (4) hierarchia: tytuł → liczba → treść → akcje; (5) ciemny: osobna paleta „noc”, nie odwrócenie; (6) AX5: zawija się, nie ucina (19 nazwane); (7) po zakryciu nazwy: spirala.

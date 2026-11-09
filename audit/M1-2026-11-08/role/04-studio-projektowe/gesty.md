# Macierz gestów — Piekarz — 2026-11-08 (rola 04, audit, moduł przeplywy-i-gesty)

Commit 2ef8870a. Źródło: kod (`dowody/sp20-gesty.txt`, `dowody/sp18-role.txt`), bez urządzenia: Expo web nieobsługiwany (brak `react-native-web` w `package.json`), więc gesty ustalone wyłącznie w kodzie. Wzorzec: Apple HIG, Gestures (tabela „Standard gestures”, cytaty w prompcie roli, odczyt 20.10.2026); heurystyki Nielsena 3 i 4.

## Macierz (gest × ekran)

| Gest | Dziś | Receptury / receptura | Plan | Prowadzenie (Stolnica) | Zakwasy | Dziennik | Ustawienia, arkusze |
|---|---|---|---|---|---|---|---|
| Stuknięcie: przycisk, kafel, karta | kafle czynności, spirala otwiera Stolnicę (D-122), «Zrobione»/«Pomiń» zaległych | karta receptury otwiera recepturę (`src/components/receptury/ListaReceptur.tsx:59`), «✕» usuwa z paskiem «Przywróć» | chipy dni, ±30 min, ±2 h, «Zacznij wypiek», «Zaplanuj» (`src/components/harmonogram/PasekStartu.tsx:29`) | «Zrobione» 64 pt, «Cofnij poprzedni», «Po co ten krok»; **wiersz kroku w arkuszu «Plan wypieku» przenosi wypiek do tego kroku** (`src/components/stolnica/BakeStepsList.tsx:84`) | chipy zakwasów, «Zapisz dokarmienie» z paskiem «Przywróć» | wpis, «Piecz ponownie», «Usuń wpis» z paskiem | wiersze, przełącznik przypomnień (własny, `src/components/settings/PrzypomnieniaKarmieniaSection.tsx:32`) |
| Przesunięcie w bok | pas „Dziś”: tydzień/miesiąc jak strzałki ‹ › (`src/components/kalendarz/NawigacjaKalendarza.tsx:70`) | — | rząd chipów dni przewijany w poziomie (`src/components/harmonogram/TargetReadyCard.tsx:149`) | — | — | — | objawy i protokoły Doktora przewijane w poziomie poniżej progu dużego tekstu (`src/components/doktor/SymptomSelectorSection.tsx:114`) |
| Przesunięcie od lewej krawędzi (wstecz stosu) | — | receptura → lista | plan → receptura | Stolnica → poprzedni ekran | Doktor zakwasu → Zakwasy | — | — |
| Przesunięcie arkusza w dół | arkusz dnia, arkusz planu | Składniki, Temperatura wody, Import receptury | — | Plan wypieku, Po co ten krok, **zgoda na powiadomienia = «Dalej»** (`src/components/stolnica/ZgodaPowiadomien.tsx:23`), ocena wypieku (pytanie «Odrzucić zmiany?» przy zmianach) | dodaj/edytuj zakwas (pytanie przy zmianach) | — | Ustawienia (zamyka podekran albo arkusz) |
| Przytrzymanie, przeciąganie, `PanResponder`, `Swipeable`, potrząśnięcie | brak w kodzie (`grep` w `dowody/sp20-gesty.txt`: 0 trafień `onLongPress`, `Swipeable`, `PanResponder`, `react-native-gesture-handler`) | | | | | | |

## Ocena według HIG

| Kontrola | Wynik |
|---|---|
| Gest standardowy robi to, czego ludzie się spodziewają | Wyjątek: stuknięcie wiersza na liście kroków w arkuszu «Plan wypieku» (arkusz do przeglądania) zmienia stan trwającego wypieku: plan od wybranego kroku przesunięty od teraz, zegar od nowa, «Cofnij» wyczyszczone (`src/components/stolnica/ProwadzenieWypieku.tsx:239`), arkusz się zamyka. Znalezisko 04-studio-projektowe-002 (SP-20). Drugi, drobny: przesunięcie w dół arkusza zgody działa jak «Dalej» i wywołuje prośbę iOS; HIG kojarzy przesunięcie arkusza z zamknięciem. Skutek łagodny (systemowe okno ma «Nie pozwalaj»), więc tylko uwaga. |
| Ten sam gest znaczy to samo w całej aplikacji (heurystyka 4) | Tak poza wyjątkiem wyżej: w pozostałych listach stuknięcie wiersza otwiera szczegóły (receptura, wpis, Doktor). |
| Gest nie jest jedynym sposobem (SP-15) | Tak: przesunięcie pasa „Dziś” ma strzałki ‹ › (44 × 44, design-spec §5), wstecz stosu ma przycisk na pasie („Wstecz”), arkusze mają „Anuluj”/„Zamknij”/„Gotowe”. |
| Informacja zwrotna, gest niedostępny | Strzałki kalendarza i „Dziś” wskazują okres; brak sygnału, że przesunięcie pasa istnieje (dopuszczalne: skrót, nie jedyna droga). |
| Kolizje z gestami systemu | Brak własnych gestów od krawędzi, brak potrząśnięcia; pas „Dziś” reaguje na przesunięcie poziome pod paskiem stanu, nie od krawędzi (`onTouchStart/End`, nie przejmuje dotyku). |
| Gest niszczący ma cofnięcie albo potwierdzenie | Usunięcie receptury, wpisu Dziennika, dokarmienia: pasek „Przywróć” (D-051 1a, D-121). Arkusze z polami: „Odrzucić zmiany?” (D-215). Wyjątek: skok do kroku (wyżej) bez cofnięcia. |

## Lista dla właściciela (na iPhonie; gest × ekran × oczekiwany wynik)

1. Plan wypieku (z pasa prowadzenia) × przewijanie listy kroków palcem × lista się przewija, żaden krok nie zostaje wybrany.
2. Plan wypieku × stuknięcie wiersza innego kroku × dziś: wypiek przeskakuje do kroku bez pytania (do oceny wobec 002).
3. Dziś × przesunięcie pasa w lewo/prawo × następny/poprzedni tydzień; to samo co ‹ ›.
4. Plan × przesunięcie rzędu dni × widać „Pojutrze” i dalsze dni; ostatni chip nie jest ucięty bez sygnału.
5. Ocena wypieku z wpisanym tekstem × przesunięcie arkusza w dół × pytanie „Odrzucić zmiany?”.
6. Zgoda na powiadomienia × przesunięcie arkusza w dół × arkusz znika i pojawia się okno iOS.
7. Każdy ekran ze stosu × przesunięcie od lewej krawędzi × powrót o jeden ekran, bez utraty stanu wypieku.

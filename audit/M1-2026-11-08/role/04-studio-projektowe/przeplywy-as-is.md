# Przepływy AS IS — Piekarz — 2026-11-08 (rola 04, audit, moduł przeplywy-i-gesty)

Commit 2ef8870a. **Obraz aplikacji:** Expo web niedostępny (brak `react-native-web` i `react-dom` w `package.json`), symulatora brak (Linux). Koszty liczone z dwóch źródeł: (1) przebiegi prawdziwego E2E na symulatorze iOS z buildu Release na tym commicie (run 42511355281, artefakt `maestro-e2e`, `commands.json` scenariuszy 01–05; pobrany do scratchpadu, poza repo), (2) kod ekranów. Zrzuty kroków: nie powstały (wyjątek nazwany w raporcie: zrzuty tylko w scratchpadzie; z E2E są 2 zrzuty arkusza zgody). Przejście poznawcze z perspektywy nowej osoby w kuchni (kontekst z E0b raportu). Miary są przybliżeniem wysiłku, nie celem.

Legenda przejścia poznawczego: Q1 spróbuje osiągnąć właściwy wynik? Q2 zauważy działanie? Q3 skojarzy działanie z wynikiem? Q4 zobaczy postęp? (Flaherty, NN/g). „Wzorzec platformy” = krok z elementów standardowych, przechodzony szybciej.

## Kontekst (z E0b)
Domowy piekarz, telefon na blacie albo oparty o miskę; ręce mokre od ciasta lub w mące przy składaniu i formowaniu, w rękawicach przy piekarniku; spojrzenia krótkie z odległości ok. pół metra; wypiek trwa 12–36 h, kroki wieczorem, w nocy i o świcie (ciemny motyw), telefon zwykle zablokowany między krokami.

## P1. Pierwsze uruchomienie → receptura z ilościami (F-68, F-26, F-09)
Źródło: E2E `01-pierwsze-uruchomienie` (COMPLETED na 2ef8870a).

| # | Ekran → działanie → co widać | Q1–Q4 | Uwagi |
|---|---|---|---|
| 1 | Dziś (pas „Co dziś robisz?”, trzy kafle) → stuknięcie „Piekę na zakwasie” → lista receptur na zakwasie | tak/tak/tak/tak | kafle nazwane słowami pracy (`src/components/start/WyborCzynnosci.tsx`) |
| 2 | Lista → stuknięcie karty „Wiejski chleb…” → receptura z wagami | tak/tak/tak/tak | wzorzec platformy (lista → szczegół) |
| 3 | Receptura → widać bochenki, masę i wagi bez wpisywania; „Ułóż plan” w zasięgu kciuka | tak/tak/tak/tak | `src/components/calculator/CalculatorActionButtons.tsx:38` |

Koszt: 2 stuknięcia, 0 pól, 1 decyzja (receptura), 2 zmiany ekranu, 0 rzeczy do zapamiętania. Tarć brak.

## P2. Główna praca: plan → start → prowadzenie → ocena (F-13, F-07, F-16, F-28)
Źródło: E2E `02-wypiek-na-stolnicy`, `03-prowadzenie-widok-skupiony` (COMPLETED), kod.

| # | Ekran → działanie → co widać | Q1–Q4 | Tarcie |
|---|---|---|---|
| 1 | Receptura → „Ułóż plan” → Plan: „Kiedy chleb ma być gotowy?”, oś czasu | tak/tak/tak/tak | — |
| 2 | Plan → zmiana godziny „gotowe” (±30 min, ±2 h, chip dnia) → oś czasu przelicza się | tak/tak/tak/tak | rząd dni wymaga przesunięcia w bok do 3. dnia (E2E 04: `swipe LEFT`, potem `plan-dzien-3`) |
| 3 | Plan → „Zacznij wypiek” (pasek kciuka 64 pt, widoczny bez przewijania: E2E log, `Bounds(y=764,h=64)` na 402×874) | tak/tak/**częściowo**/tak | gdy start planu jest w przyszłości, obok stoi „Zaplanuj”; oba prowadzą do wypieku o godzinie startu (D-071 i D-108), różnica nienazwana na ekranie (Q3). Do sprawdzenia, propozycja w `to-be.md` |
| 4 | Arkusz „Dam znać o każdym kroku” → „Dalej” → okno iOS zgody | tak/tak/tak/tak | czerwone E2E #96: arkusz został widoczny po „Dalej” (04-studio-projektowe-004) |
| 5 | Prowadzenie: pas z krokiem, czasem, spiralą; „Zrobione” na dole | tak/tak/tak/tak dla czasu i „Zrobione”; **nie dla „co zrobić”** | karta instrukcji i ostrzeżenie pod pasem poza pierwszym ekranem (rachunek `dowody/sp17-pas-prowadzenia-rachunek.txt`) → krok **porażka** dla pytania Q2 przy „co mam teraz zrobić” (04-studio-projektowe-001) |
| 6 | Prowadzenie → „Plan wypieku” (pas) → arkusz z listą kroków | tak/tak/tak/tak | stuknięcie wiersza przenosi wypiek do kroku bez cofnięcia (04-studio-projektowe-002); Q3 „nie” dla celu „zobaczyć krok” |
| 7 | Prowadzenie → „Zrobione” × N → ostatni krok → arkusz oceny | tak/tak/tak/tak | wzorzec platformy (arkusz, „Anuluj”/„Zapisz”) |

Koszt (ścieżka najkrótsza od receptury, wypiek 9 kroków): 1 („Ułóż plan”) + 0–3 (godzina) + 1 („Zacznij”) + 2 (zgoda) + 9 („Zrobione”) + 1–6 (ocena) ≈ 14–22 stuknięć, 0–1 pól (notatka), 2 decyzje (godzina, ocena), 3 zmiany ekranu, rzeczy do zapamiętania: 0, gdy instrukcja widoczna; 1 („co dalej” po przewinięciu i powrocie do „Zrobione”) przy pasie zajmującym ekran.

## P3. Powrót do trwającego wypieku (F-58)
Źródło: E2E `02` kroki 17–20: `launchApp` → `spirala-otworz` → `next-or-finish-step-btn` widoczny. Koszt: 1 stuknięcie, 0 pól. Q1–Q4: tak. Powiadomienie systemowe prowadzi z ekranu blokady (wzorzec platformy). Tarć brak w kodzie; na urządzeniu nie sprawdzono.

## P4. Plan na później (F-13, BR-KAL-009, Pro)
Źródło: E2E `04-plan-na-pozniej` (COMPLETED). Receptura → „Ułóż plan” → przesunięcie rzędu dni → dzień +3 → „Zaplanuj” → Dziś z „Plany” (przewinięcie do `start-plany`). Koszt: 4 stuknięcia + 1 przesunięcie + 1 przewinięcie, 2 decyzje. Tarcie: lista planów na „Dziś” pod spiralą wymaga przewinięcia (E2E: `scrollUntilVisible start-plany`); realność brzegowa (lista to przegląd, nie główna praca).

## P5. Zakwas: dokarmienie (F-22, F-23)
Źródło: kod (`src/components/zakwas/StarterCycleCard.tsx`, D-121 pkt 009). Zakwasy → „Zapisz dokarmienie” (1 stuknięcie) → pasek „Zapisano dokarmienie zakwasu {zakwas}.” z „Przywróć”. Q1–Q4: tak. Koszt: 2 stuknięcia (zakładka, przycisk), 0 pól. Tarć brak w kodzie.

## P6. Doktor Chleba po słabym wypieku (F-43, F-71)
Źródło: kod (`app/doktor.tsx`, D-216). Dziennik → „Doktor Chleba” albo prowadzenie → „Doktor” → protokoły → objawy (pola wyboru) → wynik pod objawami. Q4 dla długiej listy objawów: wynik może być poza widokiem (D-216 „Do sprawdzenia na urządzeniu”). Nie sprawdzono na urządzeniu.

## P7. Ustawienia, dane, zakupy (F-31…F-35, F-65)
Źródło: kod (`src/components/SettingsModal.tsx`). Dziś → koło zębate na pasie → karty: naczynie, jednostki i język, godziny snu, przypomnienia, zakupy, kopia, import, źródła, kontakt. „Usuń wszystkie dane” z potwierdzeniem (D-082). Komunikaty błędów eksportu bez „co zrobić” — rozstrzygnięte do po 1.0 (D-121, 015 i 016), więc nie zgłaszane. Zakup i przywracanie: krok właściciela na urządzeniu.

## Przepływy ukryte (kod bez wejścia w 1.0)
Spiżarnia mąk, słownik mąk, przelicznik objętości, Akademia, druk, QR, konwerter zakwasu, odrzut, test palca, rodzina Apps4Craft — wszystkie za `src/lib/wejscia-pozniej.ts` (D-043); zgodnie z kontraktem zakresu (rola 03).

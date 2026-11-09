# Propozycje TO BE — Piekarz — 2026-11-08 (rola 04, audit, moduł przeplywy-i-gesty)

Commit 2ef8870a. Opis przepływów, nie wygląd (wygląd w trybie build, zasada wspólna 15). Koszty TO BE to szacunek do potwierdzenia po wdrożeniu. Zmiana zakresu → rola 03; zmiana zapisu danych → zasada wspólna 10.

## T1. Prowadzenie: „co zrobić” na pierwszym ekranie (04-studio-projektowe-001; P2 z `przeplywy-as-is.md` krok 5)
Wzorzec: U11 (widoczny status) i zasada „ręce zajęte” modułu oczy-zajęte pkt 6 (Crouton: tylko bieżący krok).

| Miara | AS IS | TO BE (opcja A) |
|---|---|---|
| Przewinięcia do instrukcji bieżącego kroku | 1 na krok przy SE, 0–1 przy 17 Pro, 1 przy dwóch wypiekach [OCENA] | 0 [OCENA] |
| Rzeczy do zapamiętania | „co dalej” po przewinięciu i powrocie | 0 |

- **A (rekomendacja):** na pasie prowadzenia mała spirala (wariant `mala`, 92 pt) obok czasu albo spirala zwijana po pierwszym przewinięciu; karta „Co zrobić” i ostrzeżenie zaczynają się w pierwszym ekranie na 375×667. Zysk: instrukcja i ostrzeżenie bez przewijania. Ryzyko: element firmowy mniejszy na najważniejszym ekranie. Dane: bez zmian. Wysiłek: M (zmiana testów pasa D-194/D-195 wymaga zgody).
- **B:** spirala zostaje, karta „Co zrobić” przenosi się nad spiralę na pasie (pierwsze zdanie instrukcji na pasie, reszta w karcie). Zysk: pierwsze zdanie zawsze widać. Ryzyko: pas jeszcze wyższy przy długich zdaniach i AX5. Wysiłek: M.
- **C: zostawić** (koszt przyjęty w D-195). Ryzyko: instrukcja i ostrzeżenie bezpieczeństwa poza wzrokiem w kuchni.

## T2. „Plan wypieku”: podgląd zamiast skoku (04-studio-projektowe-002)
Wzorzec: U10 (wykonaj i daj cofnięcie) albo U15 (jedno zachowanie wiersza listy).

| Miara | AS IS | TO BE (opcja A) |
|---|---|---|
| Skutek przypadkowego stuknięcia | wypiek przeskakuje, zegar od nowa, „Cofnij” znika | wypiek przeskakuje, pasek „Cofnięto…/Przywróć” przywraca stan sprzed skoku |
| Stuknięcia, żeby przejść do kroku celowo | 1 | 1 (+1 przy cofnięciu) |

- **A (rekomendacja):** skok zostaje, ale po nim pasek z „Przywróć” (ten sam wzorzec co `PasekCofnijKroku`), który przywraca postęp sprzed skoku. Zysk: zgodność ze słownikiem (D-051 1a: rutynowe zmiany z cofnięciem). Ryzyko: małe. Dane: tylko stan sesji w pamięci i zapis wypieku jak przy „Cofnij”. Wysiłek: S.
- **B:** wiersz pokazuje szczegóły kroku (czas, opis), a skok jest osobnym przyciskiem „Przejdź do tego kroku” z potwierdzeniem. Zysk: stuknięcie wiersza robi to, czego ludzie się spodziewają. Koszt: 1 stuknięcie więcej przy celowym skoku. Wysiłek: M.
- **C: zostawić.**

## T3. Plan ze startem w przyszłości: „Zacznij wypiek” i „Zaplanuj” (Do sprawdzenia, nie znalezisko)
Wzorzec: U15 i heurystyka 2. Dziś przy starcie planu w przyszłości pasek kciuka ma „Zaplanuj” (drugi) i „Zacznij wypiek” (główny); oba dają wypiek o godzinie startu, różnią się zapisem (trwający wypiek czekający vs plan na „Dziś”).
- **A:** przy starcie w przyszłości główny przycisk to „Zaplanuj”, a „Zacznij teraz” drugi, z godziną pierwszego kroku w podpisie. Wysiłek: S; teksty dla roli 09.
- **B:** jeden przycisk „Zacznij wypiek” z podpisem „Pierwszy krok o {godzina}”, „Zaplanuj” bez zmian. Wysiłek: S.
- **C (rekomendacja do czasu testu):** zostawić i zapytać 3–5 testerów TestFlight, co robi każdy przycisk (przejście poznawcze, kolumna „Intuicyjność” F-13). Decyzja zakresu i słów: rola 03 z właścicielem.

## T4. Lista planów na „Dziś” pod spiralą (P4, realność brzegowa)
- **A:** zostawić (lista to przegląd; „Następne” na pasie już mówi o najbliższym zdarzeniu). **Rekomendacja.**
- **B:** pozycja „Plany: {n}” w linii „Następne” z przejściem do listy. Wysiłek: S, nowe teksty.

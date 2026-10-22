# Lista do przeglądu człowieka: ostrzeżenie o surowym cieście w protokole „Zapomniana sól” (F-71)

Status: **przejrzane** 2026-10-22 — właściciel projektu, przez sesję koordynującą M1, dosłownie: „Akceptuje” (pokazane: zdanie PL, cytat FDA z adresem, uwaga, że zdanie mówi mniej niż twierdzenie). Wpis w `docs/tresci/rejestr.json`, BEZ-SUR-001 `przeglad` (sha 919d610fa23e). Przygotowała rola 06-tresci, 2026-10-22.

Co się zmieniło: twierdzenie krytyczne BEZ-SUR-001 (FDA, przejrzane 2026-10-20, skrót 1c8ceaf515c4) ma nowe użycie w protokole „Zapomniana sól” (`docs/tresci/pl/doktor-ratunek.md`, `FORGOTTEN_SALT.stepByStepPl[0]`, i EN). Nowe zdanie zmienia skrót wersji zdań, więc dotychczasowy przegląd przestaje obowiązywać dla BEZ-SUR-001. Powód dodania: źródło protokołu (King Arthur Baking, „What if I forgot to add salt…”) samo przestrzega w tym miejscu przed próbowaniem surowego ciasta („unbaked dough should never be consumed”), a użytkownik, który podejrzewa brak soli, mógłby chcieć spróbować ciasta.

Jak przeglądać: recenzent otwiera adres źródła, znajduje cytat i porównuje go ze zdaniem (PL i EN). Nie ocenia brzmienia, tylko czy zdanie mówi tyle, ile cytat. Po przeglądzie rola 06 wpisuje słowami recenzenta w rejestrze: `"przeglad": { "kto", "data", "sha": "919d610fa23e" }`.

Skrót wersji zdań (`node scripts/kontrole-tresci.mjs docs/tresci/rejestr.json docs/tresci/pl docs/tresci/en --skroty`): **BEZ-SUR-001 919d610fa23e**.

| Zdanie (plik:nagłówek) | Twierdzenie (ID) | Cytat i adres | Uwagi | Decyzja: akceptuję / do zmiany |
|---|---|---|---|---|
| PL: „Nie próbuj ciasta, żeby sprawdzić sól: według FDA surowego ciasta nie należy jeść ani próbować.” (`pl/doktor-ratunek.md`: `FORGOTTEN_SALT.stepByStepPl[0]`) | BEZ-SUR-001 | „Never eat or taste raw flour, dough, or batter.” — FDA, „Handling Flour Safely: What You Need to Know”, https://www.fda.gov/food/buy-store-serve-safe-food/handling-flour-safely-what-you-need-know (szczebel 1, odczyt 2026-10-20) | Zdanie mówi mniej niż twierdzenie (tylko „nie jeść ani nie próbować”); przyczyny (bakterie w mące) nie powtarza. | |
| EN: „Don't taste the dough to check the salt: according to the FDA, raw dough should not be eaten or tasted.” (`en/doktor-ratunek.md`: ten sam nagłówek) | BEZ-SUR-001 | jak wyżej | | |
| Pozostałe użycia BEZ-SUR-001 (bez zmian, przejrzane 2026-10-20) | BEZ-SUR-001 | jak wyżej | `wypiek-bezpieczenstwo.md` i `ostrzezenia-krokow.md` (PL i EN) | |

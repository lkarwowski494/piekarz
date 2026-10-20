# Lista do przeglądu człowieka: ostrzeżenia według rodzaju kroku (zakwas, gorące naczynie, dzieci, krok nieznanego rodzaju)

Status: **przejrzane** — właściciel projektu (lkarwowski494) zatwierdził wszystkie 5 zdań w czacie M2 p5 2026-10-20 („Zatwierdzam”), skróty jak w tabeli; wpisy `przeglad` w rejestrze. Przygotowała rola 06-tresci, 2026-10-20, partia 5 (M1-audytor-generalny-103; F-57, BR-ETAP-004, RD-22, RD-23). Do czasu przeglądu M2 nie wdraża zdań z `docs/tresci/pl|en/ostrzezenia-krokow.md`.

Jak przeglądać: jak w `docs/tresci/przeglad/bezpieczenstwo-wypieku.md` — recenzent otwiera adres źródła, znajduje cytat i porównuje go ze zdaniem z aplikacji (PL i EN). Nie ocenia brzmienia, tylko czy zdanie mówi tyle, ile cytat, w tym samym zakresie. Po przeglądzie wpisuje w rejestrze dla każdego ID: `"przeglad": { "kto": "<imię i nazwisko>", "data": "RRRR-MM-DD", "sha": "<skrót z tabeli>" }`. Zmiana któregokolwiek zdania zmienia skrót i unieważnia przegląd.

Uwaga: BEZ-SUR-001, BEZ-SUR-002 i BEZ-OPA-003 były przejrzane 2026-10-20 dla zdań z `wypiek-bezpieczenstwo.md`. Nowe zdania z tymi twierdzeniami zmieniają skrót, więc przegląd trzeba powtórzyć (zdania z partii 4 się nie zmieniły). ZAK-SUR-001 czeka na przegląd z listy `zakwas-bezpieczenstwo.md`; skrót niżej obejmuje także jego nowe zdania.

Skróty wersji zdań (`node scripts/kontrole-tresci.mjs docs/tresci/rejestr.json docs/tresci/pl docs/tresci/en --skroty`; skrót obejmuje zdania PL i EN wszystkich plików):

| ID | Skrót |
|---|---|
| BEZ-OPA-004 | f00055ce23bc |
| BEZ-OPA-005 | 31f4ec7d786b |
| BEZ-OPA-003 | ac829a4446e3 |
| BEZ-SUR-001 | 1c8ceaf515c4 |
| BEZ-SUR-002 | 42712601a01f |
| ZAK-SUR-001 | bee99ed06b7d |

| Zdanie (plik:linia) | Twierdzenie (ID) | Cytat i adres | Uwagi | Decyzja: akceptuję / do zmiany |
|---|---|---|---|---|
| `docs/tresci/pl/ostrzezenia-krokow.md:14` „Nie próbuj surowego zakwasu ani mąki.” EN: „Do not taste raw starter or flour.” | ZAK-SUR-001, BEZ-SUR-001 | CSU Extension: "Do not taste raw sourdough starter before baking" — extension.colostate.edu/resource/sourdough-starter-best-practices/; FDA: "Never eat or taste raw flour, dough, or batter." — fda.gov/food/buy-store-serve-safe-food/handling-flour-safely-what-you-need-know | szczebel 3 i 1; krok dokarmiania i zakładania zakwasu (RD-22-W2) | |
| `docs/tresci/pl/ostrzezenia-krokow.md:15` „Po pracy z mąką i zakwasem umyj ręce mydłem pod bieżącą wodą.” EN: „After handling flour and starter, wash your hands with soap under running water.” | BEZ-SUR-002 | FDA: "DO clean up carefully after working with flour or raw dough and eggs: Wash hands thoroughly with soap and running water" | FDA mówi o mące i surowym cieście; zakwas to surowa mieszanka mąki z wodą o konsystencji masy (CSU: "batter-like consistency") — uproszczenie po stronie bezpiecznej | |
| `docs/tresci/pl/ostrzezenia-krokow.md:18` „Gorący garnek, pokrywkę i formę chwytaj suchymi rękawicami kuchennymi albo łapkami.” EN: „Handle the hot pot, lid and tin with dry oven mitts or pot holders.” | BEZ-OPA-004, BEZ-OPA-003 | Rhode Island Burn Center: "Encourage the use of oven mitts and potholders to handle hot items." — brownhealth.org/centers-services/rhode-island-burn-center/avoiding-scalds; Oklahoma State University: mokra rękawica albo dłoń przy 350–400 °F (BEZ-OPA-003) | szczebel 3, każde jedno źródło; „suche” z BEZ-OPA-003; kroki preheat_oven, bake, lid_on, rye_bake, cool, rye_cool oraz krok nieznanego rodzaju w czasie wypieku (RD-23-W4) | |
| `docs/tresci/pl/ostrzezenia-krokow.md:21` „Dzieci trzymaj z dala od kuchenki i miejsca, w którym pracujesz.” EN: „Keep children away from the stove and the area where you are working.” | BEZ-OPA-005 | Shriners Children's: "Establish a “kid-free zone” 3 feet around the stove and all areas where food and drink is prepared." — shrinerschildrens.org/en/news-and-media/news/2023/01/prevent-scald-burns-at-home | szczebel 3; bez liczby 3 stóp (uproszczenie w rejestrze) | |
| `docs/tresci/pl/ostrzezenia-krokow.md:24` „Jeśli w tym kroku pracujesz z surową mąką, ciastem albo zakwasem, nie próbuj ich, a potem umyj ręce mydłem pod bieżącą wodą.” EN: „If this step involves raw flour, dough or starter, do not taste them, and wash your hands with soap under running water afterwards.” | BEZ-SUR-001, ZAK-SUR-001, BEZ-SUR-002 | cytaty jak w wierszach 1–2 | krok nieznanego rodzaju (RD-22-W4: bezpieczna wartość domyślna) | |

Tłumaczenie zwrotne EN→PL jest w raporcie roli 06 (partia 5, wynik.md) i zgadza się z PL.

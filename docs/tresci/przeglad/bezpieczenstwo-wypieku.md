# Lista do przeglądu człowieka: bezpieczeństwo przy wypieku (piekarnik, gorące naczynie, surowe ciasto)

Status: **czeka na przegląd** (przygotowała rola 06-tresci, 2026-10-20, partia 4). Przeglądu nikt jeszcze nie wykonał; pola `przeglad.kto` i `przeglad.data` w `docs/tresci/rejestr.json` są puste.

Jak przeglądać: jak w `docs/tresci/przeglad/zakwas-bezpieczenstwo.md` — recenzent otwiera adres źródła, znajduje cytat i porównuje go ze zdaniem z aplikacji (PL i EN). Nie ocenia brzmienia, tylko czy zdanie mówi tyle, ile cytat, w tym samym zakresie. Po przeglądzie wpisuje w rejestrze dla każdego ID: `"przeglad": { "kto": "<imię i nazwisko>", "data": "RRRR-MM-DD", "sha": "<skrót z tabeli>" }`. Zmiana któregokolwiek zdania zmienia skrót i unieważnia przegląd.

Skróty wersji zdań (`node scripts/kontrole-tresci.mjs docs/tresci/rejestr.json docs/tresci/pl docs/tresci/en --skroty`; skrót obejmuje zdania PL i EN):

| ID | Skrót |
|---|---|
| DOK-PIE-002 | d0c833d37ff3 |
| BEZ-OPA-001 | e59fc24f1d71 |
| BEZ-OPA-002 | e59fc24f1d71 |
| BEZ-OPA-003 | e59fc24f1d71 |
| BEZ-SUR-001 | 84fb02c92af2 |
| BEZ-SUR-002 | 4ac9d0fd8e35 |
| BEZ-SUR-003 | e3b0c44298fc (brak zdań w treści; przegląd samego twierdzenia) |

| Zdanie (plik:linia) | Twierdzenie (ID) | Cytat i adres | Uwagi | Decyzja: akceptuję / do zmiany |
|---|---|---|---|---|
| `docs/tresci/pl/doktor-zimna-kuchnia.md:8` „Wyjmij naczynie, zanim włączysz nagrzewanie piekarnika: King Arthur Baking przestrzega, że łatwo o tym zapomnieć.” | DOK-PIE-002 | King Arthur Baking, „Where to put dough to rise”: "you don't want your loaf pan inside — even though you swear you won't forget and will take it out before turning the oven on." — kingarthurbaking.com/blog/2019/03/12/where-to-put-dough-to-rise | szczebel 4, jedno źródło, atrybucja w treści; źródło mówi o formie, zdanie o każdym naczyniu (strona bezpieczna) | |
| `docs/tresci/pl/wypiek-bezpieczenstwo.md:5` „Załóż suche rękawice kuchenne i unoś pokrywkę od siebie, bo spod niej uchodzi gorąca para.” | BEZ-OPA-001, BEZ-OPA-002, BEZ-OPA-003 | Rhode Island Burn Center: "Use appropriate protective equipment, such as an oven mitt, when removing hot pan lids." — brownhealth.org/centers-services/rhode-island-burn-center/avoiding-scalds; UofL Health: "lift the lid or cover away from your face or arm to prevent burns from accumulated steam." — uoflhealth.org/articles/tips-to-help-avoid-scald-injuries/; Oklahoma State University: "If the oven mitt or your hand was wet […] a third-degree burn could happen in as little as one second" — news.okstate.edu/articles/education-human-sciences/2021/designing-safer-oven-mitts | szczebel 3, każde jedno źródło; „od siebie” = od twarzy i ręki; „suche” z BEZ-OPA-003 | |
| `docs/tresci/pl/wypiek-bezpieczenstwo.md:8` „Nie próbuj surowego ciasta ani mąki.” | BEZ-SUR-001 | FDA: "Never eat or taste raw flour, dough, or batter." — fda.gov/food/buy-store-serve-safe-food/handling-flour-safely-what-you-need-know | szczebel 1 (USA) | |
| `docs/tresci/pl/wypiek-bezpieczenstwo.md:9` „Po pracy z ciastem umyj ręce mydłem pod bieżącą wodą.” | BEZ-SUR-002 | FDA: "Wash hands thoroughly with soap and running water" | mycie przyborów i blatów pominięte | |
| — (twierdzenie bez zdania w treści) | BEZ-SUR-003 | FDA: "DO NOT let children use raw dough for crafts or play clay." | do decyzji 03/04, czy dodać do kroku | |

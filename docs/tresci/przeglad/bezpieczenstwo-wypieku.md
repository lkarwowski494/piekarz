# Lista do przeglądu człowieka: bezpieczeństwo przy wypieku (piekarnik, gorące naczynie, surowe ciasto)

Status: **czeka na przegląd** (przygotowała rola 06-tresci, 2026-10-20, partia 4). Przeglądu nikt jeszcze nie wykonał; pola `przeglad.kto` i `przeglad.data` w `docs/tresci/rejestr.json` są puste.

Jak przeglądać: jak w `docs/tresci/przeglad/zakwas-bezpieczenstwo.md` — recenzent otwiera adres źródła, znajduje cytat i porównuje go ze zdaniem z aplikacji (PL i EN). Nie ocenia brzmienia, tylko czy zdanie mówi tyle, ile cytat, w tym samym zakresie. Po przeglądzie wpisuje w rejestrze dla każdego ID: `"przeglad": { "kto": "<imię i nazwisko>", "data": "RRRR-MM-DD", "sha": "<skrót z tabeli>" }`. Zmiana któregokolwiek zdania zmienia skrót i unieważnia przegląd.

Skróty wersji zdań (`node scripts/kontrole-tresci.mjs docs/tresci/rejestr.json docs/tresci/pl docs/tresci/en --skroty`; skrót obejmuje zdania PL i EN):

| ID | Skrót |
|---|---|
| DOK-PIE-002 | d0c833d37ff3 |

| Zdanie (plik:linia) | Twierdzenie (ID) | Cytat i adres | Uwagi | Decyzja: akceptuję / do zmiany |
|---|---|---|---|---|
| `docs/tresci/pl/doktor-zimna-kuchnia.md:8` „Wyjmij naczynie, zanim włączysz nagrzewanie piekarnika: King Arthur Baking przestrzega, że łatwo o tym zapomnieć.” | DOK-PIE-002 | King Arthur Baking, „Where to put dough to rise”: "you don't want your loaf pan inside — even though you swear you won't forget and will take it out before turning the oven on." — kingarthurbaking.com/blog/2019/03/12/where-to-put-dough-to-rise | szczebel 4, jedno źródło, atrybucja w treści; źródło mówi o formie, zdanie o każdym naczyniu (strona bezpieczna) | |

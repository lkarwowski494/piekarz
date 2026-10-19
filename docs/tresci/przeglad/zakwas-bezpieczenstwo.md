# Lista do przeglądu człowieka: kontrola biologiczna zakwasu

Status: **czeka na przegląd** (przygotowała rola 06-tresci, 2026-10-19; M1-audytor-generalny-014, 06-tresci-004). Przeglądu nikt jeszcze nie wykonał; pola `przeglad.kto` i `przeglad.data` w `docs/tresci/rejestr.json` są puste.

Jak przeglądać: recenzent (osoba z wiedzą o bezpieczeństwie żywności ma pierwszeństwo; właściciel, jeśli nie ma takiej osoby) otwiera adres źródła, znajduje cytat i porównuje go ze zdaniem z aplikacji. Nie ocenia brzmienia, tylko czy zdanie mówi tyle, ile cytat, w tym samym zakresie. Po przeglądzie wpisuje w rejestrze dla każdego ID: `"przeglad": { "kto": "<imię i nazwisko>", "data": "RRRR-MM-DD", "sha": "<skrót z tabeli>" }`. Zmiana któregokolwiek zdania (PL albo EN) zmienia skrót i unieważnia przegląd.

Skróty wersji zdań (`node scripts/kontrole-tresci.mjs docs/tresci/rejestr.json docs/tresci/pl docs/tresci/en --skroty`; skrót obejmuje zdania PL i EN):

| ID | Skrót |
|---|---|
| ZAK-PLE-002 | 1c7c4e005203 |
| ZAK-PLE-003 | 7b7c894bd8e0 |
| ZAK-PLE-004 | 5d958fd66999 |
| ZAK-NAL-001 | 76010751432e |
| ZAK-KOL-001 | 1c7c4e005203 |
| ZAK-WAC-001 | bdd5bcb7cdf2 |
| ZAK-NAC-001 | 190d8c186774 |
| ZAK-HOO-001 | eb405d93b6be |
| ZAK-SUR-001 | 7548d71a7d19 |

| Zdanie (plik:linia) | Twierdzenie (ID) | Cytat i adres | Uwagi | Decyzja: akceptuję / do zmiany |
|---|---|---|---|---|
| `docs/tresci/pl/zakwas-bezpieczenstwo.md:13` „W razie wątpliwości wyrzuć zakwas.” | ZAK-NAL-001 | CSU Extension: "Sourdough starter that shows any sign of mold (colored and/or fuzzy) should NOT be used" — extension.colostate.edu/resource/sourdough-starter-best-practices/; FSIS: "Cheeses such as Brie and Camembert have white surface molds." | zasada ostrożności DEC-10 (a); ostrożniej niż CSU, które białawe grudki na płynie w zakwasie z lodówki uznaje za drożdże | |
| `docs/tresci/pl/zakwas-bezpieczenstwo.md:14` „Nie próbuj surowego zakwasu przed upieczeniem.” | ZAK-SUR-001 | CSU Extension: "Do not taste raw sourdough starter before baking" | jedno źródło, szczebel 3 | |
| `docs/tresci/pl/zakwas-bezpieczenstwo.md:23` „Puszysty nalot w dowolnym kolorze, także biały” | ZAK-PLE-004 | USDA FSIS, Molds on Food: "The spores give mold the color you see." […] "white dust on Cheddar" — fsis.usda.gov (403, kopia web.archive.org 2026-10-04) | etykieta przycisku | |
| `docs/tresci/pl/zakwas-bezpieczenstwo.md:32` „Wyrzuć zakwas” | ZAK-NAL-001 | jw. | tytuł wyniku | |
| `docs/tresci/pl/zakwas-bezpieczenstwo.md:35` „Nie używaj tego zakwasu i nie próbuj go ratować.” | ZAK-NAL-001, ZAK-PLE-002, ZAK-KOL-001 | CSU (jw.); FSIS: "If food is covered with mold, discard it."; SDSU Extension: "A starter has gone bad when there is mold growing within and on top of the starter, a foul smell is noticeable, and discoloration appears, such as green, pink or orange spots." — extension.sdstate.edu/sourdough-starters | SDSU łączy objawy spójnikiem „and”, aplikacja każdy osobno (strona bezpieczna) | |
| `docs/tresci/pl/zakwas-bezpieczenstwo.md:36` „Pleśń może sięgać w głąb zakwasu, nawet gdy na powierzchni widać tylko niewielki nalot.” | ZAK-PLE-003 | FSIS: "The roots may be difficult to see when the mold is growing on food and may be very deep in the food." | FSIS nie wymienia zakwasu (żywność o dużej wilgotności) | |
| `docs/tresci/pl/zakwas-bezpieczenstwo.md:37` „Nie wąchaj zakwasu z nalotem, bo może to wywołać problemy z oddychaniem.” | ZAK-WAC-001 | FSIS: "Don't sniff the moldy item. This can cause respiratory trouble." | | |
| `docs/tresci/pl/zakwas-bezpieczenstwo.md:38` „Przed założeniem nowego zakwasu dokładnie umyj i wypłucz słoik.” | ZAK-NAC-001 | CSU: "the container should be thoroughly cleaned and rinsed before starting over" | zastępuje „Słoik wygotuj we wrzątku lub wyrzuć” (bez źródła) | |
| `docs/tresci/pl/zakwas-bezpieczenstwo.md:44` „Według CSU Extension warstwa płynu o zapachu alkoholu jest w porządku: to produkt uboczny fermentacji drożdży.” | ZAK-HOO-001 | CSU: "Sourdough starter may develop a liquid layer that smells of alcohol, and this is fine." | jedno źródło, atrybucja w tekście; bez „zdrowy” i „głodny” | |
| `docs/tresci/pl/zakwas-bezpieczenstwo.md:45` „Możesz ją zlać albo wmieszać.” | ZAK-HOO-001 | CSU: "can either be poured off or stirred in" | | |

Zdania EN o tych samych ID: `docs/tresci/en/zakwas-bezpieczenstwo.md` (te same nagłówki pól); recenzent sprawdza, czy EN mówi to samo co PL.

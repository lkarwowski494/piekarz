# Lista do przeglądu człowieka: kontrola biologiczna zakwasu

Status: **przejrzane** 2026-10-20: właściciel projektu (lkarwowski494) w czacie M2 p7: „Zatwierdzam przegląd człowieka 8 twierdzeń krytycznych: ZAK-PLE-002, ZAK-PLE-003, ZAK-PLE-004, ZAK-NAL-001, ZAK-KOL-001, ZAK-WAC-001, ZAK-NAC-001, ZAK-HOO-001 (zdania z docs/tresci/przeglad/zakwas-bezpieczenstwo.md bez zmian).” Wpis w `docs/tresci/rejestr.json` (`przeglad.kto`, `data`, `sha`) [M2-koordynator-napraw-034]. ZAK-SUR-001 przejrzane wcześniej (lista `ostrzezenia-krokow.md`). Przygotowała rola 06-tresci, 2026-10-19 (M1-audytor-generalny-014, 06-tresci-004).

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
| `docs/tresci/pl/zakwas-bezpieczenstwo.md:13` „W razie wątpliwości wyrzuć zakwas.” | ZAK-NAL-001 | CSU Extension: "Sourdough starter that shows any sign of mold (colored and/or fuzzy) should NOT be used" — extension.colostate.edu/resource/sourdough-starter-best-practices/; FSIS: "Cheeses such as Brie and Camembert have white surface molds." | zasada ostrożności DEC-10 (a); ostrożniej niż CSU, które białawe grudki na płynie w zakwasie z lodówki uznaje za drożdże | akceptuję (właściciel, 2026-10-20) |
| `docs/tresci/pl/zakwas-bezpieczenstwo.md:14` „Nie próbuj surowego zakwasu przed upieczeniem.” | ZAK-SUR-001 | CSU Extension: "Do not taste raw sourdough starter before baking" | jedno źródło, szczebel 3 | akceptuję (przegląd wcześniejszy, ostrzezenia-krokow.md) |
| `docs/tresci/pl/zakwas-bezpieczenstwo.md:23` „Puszysty nalot w dowolnym kolorze, także biały” | ZAK-PLE-004 | USDA FSIS, Molds on Food: "The spores give mold the color you see." […] "white dust on Cheddar" — fsis.usda.gov (403, kopia web.archive.org 2026-10-04) | etykieta przycisku | akceptuję (właściciel, 2026-10-20) |
| `docs/tresci/pl/zakwas-bezpieczenstwo.md:32` „Wyrzuć zakwas” | ZAK-NAL-001 | jw. | tytuł wyniku | akceptuję (właściciel, 2026-10-20) |
| `docs/tresci/pl/zakwas-bezpieczenstwo.md:35` „Nie używaj tego zakwasu i nie próbuj go ratować.” | ZAK-NAL-001, ZAK-PLE-002, ZAK-KOL-001 | CSU (jw.); FSIS: "If food is covered with mold, discard it."; SDSU Extension: "A starter has gone bad when there is mold growing within and on top of the starter, a foul smell is noticeable, and discoloration appears, such as green, pink or orange spots." — extension.sdstate.edu/sourdough-starters | SDSU łączy objawy spójnikiem „and”, aplikacja każdy osobno (strona bezpieczna) | akceptuję (właściciel, 2026-10-20) |
| `docs/tresci/pl/zakwas-bezpieczenstwo.md:36` „Pleśń może sięgać w głąb zakwasu, nawet gdy na powierzchni widać tylko niewielki nalot.” | ZAK-PLE-003 | FSIS: "The roots may be difficult to see when the mold is growing on food and may be very deep in the food." | FSIS nie wymienia zakwasu (żywność o dużej wilgotności) | akceptuję (właściciel, 2026-10-20) |
| `docs/tresci/pl/zakwas-bezpieczenstwo.md:37` „Nie wąchaj zakwasu z nalotem, bo może to wywołać problemy z oddychaniem.” | ZAK-WAC-001 | FSIS: "Don't sniff the moldy item. This can cause respiratory trouble." | | akceptuję (właściciel, 2026-10-20) |
| `docs/tresci/pl/zakwas-bezpieczenstwo.md:38` „Przed założeniem nowego zakwasu dokładnie umyj i wypłucz słoik.” | ZAK-NAC-001 | CSU: "the container should be thoroughly cleaned and rinsed before starting over" | zastępuje „Słoik wygotuj we wrzątku lub wyrzuć” (bez źródła) | akceptuję (właściciel, 2026-10-20) |
| `docs/tresci/pl/zakwas-bezpieczenstwo.md:44` „Według CSU Extension warstwa płynu o zapachu alkoholu jest w porządku: to produkt uboczny fermentacji drożdży.” | ZAK-HOO-001 | CSU: "Sourdough starter may develop a liquid layer that smells of alcohol, and this is fine." | jedno źródło, atrybucja w tekście; bez „zdrowy” i „głodny” | akceptuję (właściciel, 2026-10-20) |
| `docs/tresci/pl/zakwas-bezpieczenstwo.md:45` „Możesz ją zlać albo wmieszać.” | ZAK-HOO-001 | CSU: "can either be poured off or stirred in" | | akceptuję (właściciel, 2026-10-20) |

Zdania EN o tych samych ID: `docs/tresci/en/zakwas-bezpieczenstwo.md` (te same nagłówki pól); recenzent sprawdza, czy EN mówi to samo co PL.

## Tłumaczenia w 33 językach (stan 2026-10-21, M1-audytor-generalny-135, 06-tresci-501)

Status: **nieprzejrzane przez człowieka** (DEC-06: przegląd natywny później; zamiast niego tłumaczenie zwrotne, `docs/lokalizacja/jezyki.md`). Przegląd wyżej dotyczy tylko zdań PL i EN.

- Znaczniki: od 2026-10-21 każde zdanie pliku `docs/tresci/<kod>/zakwas-bezpieczenstwo.md` ma znacznik linii PL o tym samym numerze (`scripts/znaczniki-zdan.mjs`, także w `scripts/wepnij-przeklad.mjs`), gdy przekład sekcji dzieli się na tyle zdań co PL. Przypisanie idzie po kolejności zdań; sensu zdań nikt nie sprawdził.
- Kontrola mechaniczna `--przed-przegladem`: kod 0 w 30 językach. Wyjątek nazwany: `ja`, `ko`, `zh-Hant` — sekcja `wynik.hooch.actionPl` zostaje akapitem ze znacznikiem `[T:ZAK-HOO-001,-]` (ja, zh-Hant: zdania bez spacji po „。”; ko: pierwsze zdanie PL przełożone jako dwa). Rozstrzyga rola 06 z osobą znającą język (`tests/tresci-tlumaczen-135.test.ts`).
- Przegląd człowieka per język (krok właściciela): skróty zdań języka `node scripts/kontrole-tresci.mjs docs/tresci/rejestr.json docs/tresci/<kod>/zakwas-bezpieczenstwo.md --skroty`; recenzent znający język porównuje każde zdanie z PL obok i z cytatem źródła, a wpis przeglądu z `sha` per język dodaje rola 06 dopiero po jego odpowiedzi. Do tego czasu kontrola bez `--przed-przegladem` na plikach języków kończy się kodem 1 (oczekiwane).

# Raport koordynatora: noc 2026-11-02/03 (M3 Piekarz)
Gałąź `redesign/piekarz-2026-10-22`, kandydat `056e41e` (verify kod 0: 514 zestawów, 5574 testy; E2E zielone; 7 stref zielonych). Plan: D-124, D-131; koniec: D-134. Wszystkie decyzje nocy: „noc, do weta”.

## Wynik w jednym zdaniu
Kod jest gotowy do testu na telefonie, ale buildu TestFlight nie ma: workflow buduje tylko commity z `master` (BR-REL-005), a scalenie do master czeka na Twoją zgodę.

## Tor A: E2E i build
| Krok | Run | Wynik |
|---|---|---|
| iOS E2E na `c660cec` | 41536995568 | awaria maszyny: sterownik Maestro nie wstał w 480 s, przed scenariuszami |
| iOS E2E na `056e41e` (jedyne ponowienie, D-131) | 41546766468 | zielone (00:34 UTC) |
| TestFlight na `056e41e`: `tz-matrix` | 41557215220 | zielone, 7 stref (18 min) |
| TestFlight: build i wysyłka | 41557215220 | zatrzymany: „Verify commit is ancestor of master (BR-REL-005)” |

## Role nocy (każda przyjęta po verify koordynatora kod 0, sesja zarchiwizowana)
| Rola | Wynik | Decyzje | Koszt [z get_session] |
|---|---|---|---|
| 10 wydanie, build | `docs/wydanie/droga-do-app-store.md`, `plan-wydania-1.0.md`, `lista-kontrolna-telefonu.md`, `opis-zmian-1.0.md`; §4 instrukcji ustawień już był poprawny, 3 rozjazdy D-038 poprawione | D-125 | ≈1,5 USD |
| 06 treści, fix | 72 twierdzenia po T2: 68 zgodnych, 4 poprawione do zakresu źródła; 5 odstępstw D-123 przyjętych; 14 kluczy na przekład | D-126, D-127 | ≈7,1 USD |
| 07 jakość, audit | werdykt dla zgłoszenia 1.0: ZABLOKOWANE; P1: 001 (polityka offline), 002 (build bez bramki stref/E2E); P2: 003–009 | D-130 | ≈11,7 USD |
| 08 programista, fix | 001: streszczenie polityki (3 zdania „W skrócie” z apps4brew-www@fb85d20) i adres bez sieci, test BR-UST-003; 002: `tz-matrix` przed buildem, test kontraktu | D-132, D-133 | ≈1,6 USD |
Koordynator: ≈11,5 USD do 01:35 UTC. Raporty ról: ten katalog.

## Do Twojej decyzji (rano)
1. **Scalenie `redesign/piekarz-2026-10-22` → `master`** (kandydat `056e41e`) i build TestFlight z master. Rekomendacja: tak, a krok Free Trial w ASC zrobić tego samego dnia (Z-1: „razem z buildem zawierającym kod Basic/Pro”).
2. **Weto albo akceptacja decyzji nocy:** D-124…D-127, D-130…D-134.
3. **Pełny audyt przed upublicznieniem** (plan wydania §1 pkt 3; w `trening` obowiązkowy) — tak/nie, kiedy.

## Kroki właściciela
- App Store Connect: usunąć Free Trial z `.pro.monthly` i `.pro.yearly` (Z-1).
- Strona `apps4brew.com/piekarz/privacy.html` mówi o „okresie próbnym” / „free trial”; po D-112/D-113 próby nie ma (repo `apps4brew-www`, rola M8).
- Test na telefonie według `docs/wydanie/lista-kontrolna-telefonu.md` na nowym buildzie (ok. 60–90 min).
- Przekład: 14 kluczy z roli 06 i streszczenie polityki (33 języki; do tego czasu EN).
- ZAK-PLE-004 „colour” → „color” przy najbliższym przeglądzie krytycznych; słowo „sprawdzonych” na ekranie źródeł (rola 04).

## Otwarte znaleziska (nienaprawiane w nocy)
P2 roli 07: 003 testy zależne od prawdziwej daty, 004 53/133 wektorów BRD bez testu, 005 deklaracje szersze niż testy, 006 brak hooka pre-push i wybór Xcode, 007 Stryker bez wyniku, 008 lista „tylko telefon” (częściowo zamknięta przez rolę 10 — do reauditu), 009 akcje CI bez przypięcia. Rola 08: `Linking.openURL` bez `.catch` (DEV-10, brzegowe).

## Lekcje dla biblioteki `prompts` (propozycje zasad)
1. Sesje ról w chmurze nie widzą prywatnego `prompts` (klon i `add_repo` odrzucone) — polecenie trzeba dostarczyć inną drogą (tej nocy: prywatny artefakt + sha256).
2. `docs/decyzje.md` ma `-text` i CRLF; dwie role i koordynator zapisały LF — polecenie powinno to mówić, scalanie sprawdzać.
3. W klonach nie ma hooka pre-push — polecenie nie może zakładać, że push uruchamia verify.
4. Role równoległe kolidują numerami decyzji — przydzielać pule numerów w poleceniu.
5. TestFlight wymaga commita z master (BR-REL-005) — plan nocy z buildem z gałęzi musi przewidzieć scalenie albo go nie obiecywać.

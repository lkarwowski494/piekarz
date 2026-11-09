# Rola 02 Monetyzacja — fix 2026-11-09 (M2, partia 3)

Gałąź `naprawy/M2-koordynator-napraw-2026-11-09-p3`, start HEAD `287de811`, koniec `9a692b21` (wypchnięta). Tryb fix jako subagent; plan E0 zatwierdzony przez właściciela (D-300, D-302; DEC-04 a, DEC-06 a, DEC-08 a w D-286), na STOP nie czekam.

## ETAP 0 — środowisko
- Linux 6.18, Node v22.23.4, git; push na gałąź działa (`git push` kod 0); `gh` bez ważnego tokenu (stan CI niesprawdzony tą drogą).
- Brak Xcode, symulatora, App Store Connect (zakaz w poleceniu). Zmiany tylko w dokumentach i generatorze kart, bez zmian widocznych w aplikacji (zrzutów nie ma).
- Bramka opłacalności (zasada 20): wynik jest w `docs/monetyzacja.md` (sekcja „Opcje modelu”).

## Klasyfikacja
| ID planu | Źródło | Rodzaj | Wybór właściciela |
|---|---|---|---|
| M1-audytor-generalny-054 | 02-monetyzacja-002 (MON-18) | P | DEC-06 a (D-286) |
| M1-audytor-generalny-015 (przekazanie roli 03) | 01-odkrywanie-001, 03-zakres-002 | P | DEC-04 a (D-286) |
| M1-audytor-generalny-057 | 02-monetyzacja-005 (MON-12, MON-17) | P | DEC-08 a (D-286) |

Dowodu przeciw wybranym opcjom nie znalazłem: tabela badania podaje „sam iOS” (`docs/monetyzacja-badanie-2026-10.md:625` „| D-038 (odczyt A) | 345 | 218 |”), ADR-007 wyłącza Androida (`docs/adr/ADR-007_zakupy_storekit_expo_iap.md:29` „Android poza planem 1.0”), a Z-1 ma słowa właściciela (`docs/wznowienie-M3.md:230` „Obie usuenięte.”); późniejszy wpis przeczący nie istnieje (`grep -n "Z-1\|Free Trial" docs/decyzje.md`).

## Commity (SHA → ID)
| SHA | ID | Zmiana |
|---|---|---|
| `69a1c258` | M1-audytor-generalny-054; 02-monetyzacja-002 | „Opcje modelu”: wynik 1.0 = sam iOS 174–218 USD (35–44% progu), 345 tylko z Google Play po porcie; plan wydania §1 pkt 5 |
| `69d895b8` | M1-audytor-generalny-015; 01-odkrywanie-001, 03-zakres-002 | `docs/monetyzacja.md`: lista Pro, tabela Basic/Pro i PR-06 bez „porównania”; F-63 PÓŹNIEJ |
| `9a692b21` | M1-audytor-generalny-057; 02-monetyzacja-005 | `ceny.json` na D-112 z przeglądem cen; Z-1 zrobione 2026-11-03 w B2, W1-05 [x], dzienniku, instrukcji §4/§5, opisie zmian, monetyzacji; generator kart i 34 karty |

## Testy przed/po
| ID | Test | Przed | Po |
|---|---|---|---|
| 054 | `tests/monetyzacja-platforma-054.test.ts` | 3 z 4 czerwone (`dowody/054-przed.txt`) | 4/4 (`dowody/054-po.txt`) |
| 015 | `tests/obietnice-pro-015.test.ts`, test „docs/monetyzacja.md nie wymienia porównania…” | czerwony, 3 wiersze (`dowody/015-przed.txt`) | 8/8 z testem 054 (`dowody/015-po.txt`) |
| 057 | `tests/dokumenty-wydania-057.test.ts` | 4/4 czerwone (`dowody/057-przed.txt`) | 121/121 z testami instrukcji, ASC, planu (`dowody/057-po.txt`) |

`npm run verify` po `git add`, kod 0, przy `TZ=Pacific/Honolulu` (znany test zależny od pory dnia `dzis-plany-d5`, zgłoszony w partii przez rolę 03): 054 — 624 zestawy / 6471 testów (`dowody/verify-054.txt`); 015 — 624 / 6472 (`dowody/verify-015.txt`); 057 — 625 / 6476 (`dowody/verify-057.txt`).
**Wyjątek nazwany (054):** po pełnym verify zmieniłem jedną linię nagłówka `docs/monetyzacja.md` (dopisek daty) i przed commitem uruchomiłem tylko testy 054 i `wzrost-hipotezy` (9/9); pełny verify na tym stanie przeszedł w kolejnym commicie (015).

## Przeczytane źródła
- Dokumenty projektu z dnia pracy (2026-11-09): `docs/decyzje.md:527` (D-112: przegląd cen „po 6 miesiącach od premiery”), `docs/wznowienie-M3.md:230`, `docs/monetyzacja-badanie-2026-10.md:625`, `docs/adr/ADR-007_zakupy_storekit_expo_iap.md:29`. Stron zewnętrznych nie czytałem: zmiany nie dotyczą stawek ani reguł sklepu.

## Przekazania
- **07:** W1-05 odhaczone opisem właściciela, bez zrzutu: przy reaudycie i w dniu zgłoszenia sprawdzić w ASC brak oferty (instrukcja §4 kroki 4.1, 4.2; B6). Wartość: Z-1 = 2026-11-03, „Obie usuenięte.” (`docs/wydanie/dziennik.md:28`). Wynik bramki 1.0: 174–218 USD netto/rok (DEC-06 a, D-286).
- **08:** brak zmian kodu aplikacji; generator `scripts/karty-ustawien.mjs` cytuje D-112. Znalezisko N2 niżej (skrypt ASC).
- **04:** nowych tekstów interfejsu brak; teksty do akceptacji: brak. Przekład: nie dotyczy (lista „czeka na przekład” bez zmian).
- **Przegląd ścieżki wrażliwej** (dokumenty zakupów i cen): **nieodbyty** (subagent bez narzędzia subagentów), polecenie w `przeglad-sciezki-wrazliwej-polecenie.md`; uruchamia M2. Drugi przegląd AI przekładu: nie dotyczy.

## Nowe znaleziska (nie naprawiane)
- **N1 (P2, P, MON-16/ODK-02):** `docs/monetyzacja.md:10` i `docs/monetyzacja.md:50` wymieniają jako Pro także funkcje ukryte w 1.0 (spiżarnia, QR wysyłanie, druk, dalsza Akademia; `src/lib/wejscia-pozniej.ts`) — ten sam wzorzec co 015. Opcje: (a) oznaczyć je w kontrakcie jako PÓŹNIEJ, poza ofertą Pro 1.0, i rozszerzyć test 015 na wszystkie słowa z mapy; (b) zostawić jako plan Pro po 1.0 z nagłówkiem o zakresie docelowym. Rekomendacja: (a).
- **N2 (P2, D, MON-12):** `scripts/asc-ustawienia.mjs:338` i `scripts/asc-ustawienia.mjs:374` opisują ceny jako ręczne z D-038, a `scripts/asc-ustawienia.mjs:351` każe usuwać ofertę razem z buildem Basic/Pro (Z-1) — stan sprzed Z-1 i D-112; poza mechanizmem 057 (`docs/wydanie`). Do roli 08 z testem `tests/asc-ustawienia.test.ts`.
- **N3 (P2, P):** `docs/sztafeta.md:13` nadal wymienia Z-1 jako krok właściciela roli 10; do koordynatora przy aktualizacji sztafety.

## Kroki właściciela
- Opcjonalnie: zrzut ekranu ASC „Introductory Offers” obu subskrypcji bez oferty do dziennika (wzmacnia W1-05; dziś tylko opis).
- Przy decyzji o Androidzie: przebieg bramki `02-monetyzacja --tryb audit --moduly oplacalnosc` z wariantem „iOS + port Android z kosztem” (02-monetyzacja-002, opcja b).
- Decyzja o N1 (opcje wyżej).

## Otwarte
- „Zweryfikowane” nadaje reaudit. Przegląd ścieżki wrażliwej nieodbyty (wyżej). Stan CI przez `gh` niesprawdzony (token).

## Kontrola dowodów i sekretów
`node narzedzia/sprawdz-raport.mjs wynik.md /home/user/piekarz` → kod 0: „OK: odwołania, cytaty, pliki dowodów i sekrety sprawdzone” (`dowody/kontrola-raportu.txt`).

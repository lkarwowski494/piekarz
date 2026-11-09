# 08-programista · fix M2 p2 · 2026-11-09 · wynik (E2: dowody)

Gałąź `naprawy/M2-koordynator-napraw-2026-11-09-p2`, baza 3ccfd438, wypchnięta (HEAD 9265f84c). Drzewo czyste. Środowisko: Linux, Node v22.23.4, git push działa; bez Xcode i symulatora (zrzutów ekranu nie ma — zmiany widoczne opisane niżej, zrzuty przed/po: krok właściciela albo E2E iOS).

## Commity (każde ID osobno, `npm run verify` kod 0 po `git add` przed każdym)

| SHA | ID | Test (przed → po) | verify |
|---|---|---|---|
| 944c1808 | M1-audytor-generalny-009 (06-tresci-002, D-303) | `tests/pizza-pieczenie-009.test.ts`: 5/8 czerwonych → 8/8 (`dowody/009-przed.txt`, `dowody/009-po.txt`) | 6124/6124 (`dowody/009-verify.txt`) |
| 49a83170 | M1-audytor-generalny-008 (06-tresci-001, D-304) | `tests/pieczenie-receptur-008.test.ts`: 33/64 czerwonych → 66/66 (`dowody/008-przed.txt`, `dowody/008-po.txt`); sprawdz-pieczenie.mjs 18 → 0 (`dowody/008-sprawdz-pieczenie-po.txt`) | 6190/6190 (`dowody/008-verify.txt`) |
| e57cef29 | M1-audytor-generalny-010 (06-tresci-003, D-305) | `tests/teksty-glownego-przeplywu-010.test.ts`: 25/25 czerwonych → zielone; trwała kontrola `tests/liczby-w-tekstach-010.test.ts`: 5/12 czerwonych (14 literałów) → 12/12 (`dowody/010-przed.txt`, `dowody/010-kontrola-przed.txt`, `dowody/010-po.txt`) | 6227/6227 (`dowody/010-verify.txt`) |
| d1f2166f | M1-audytor-generalny-040 (06-tresci-005, D-306) | `src/components/receptury/__tests__/przelicznik-drozdzy-040.test.tsx`: 3/4 czerwone → 4/4 (`dowody/040-przed.txt`, `dowody/040-po.txt`) | 6231/6231 (`dowody/040-verify.txt`) |
| 99cda7a1 | M1-audytor-generalny-041 (06-tresci-006, D-307) | `tests/maki-nazwy-041.test.ts`: 37/37 czerwonych → 37/37; sprawdz-maki.mjs 786 / 265 → 0 / 0 (`dowody/041-przed.txt`, `dowody/041-sprawdz-maki-przed.txt`, `dowody/041-sprawdz-maki-po.txt`) | 6267/6267 (`dowody/041-verify.txt`) |
| 9265f84c | M1-audytor-generalny-014 (09-lokalizacja-005) | `tests/czeka-na-przeklad-093.test.ts` bez wyjątków: czerwony na liście 73 kluczy → 67/67 (`dowody/014-przed.txt`, `dowody/014-po.txt`) | 6300/6300 (`dowody/014-verify.txt`) |

Stan wyjściowy: `npm run verify` kod 0, 6116/6116 (`dowody/verify-start.txt`). Po: 6300/6300, kontrole roli 06: `dowody/kontrole-06-po.txt` (pieczenie 45 zgodnych / 0 rozbieżnych; mąki 0 / 0).

## Co zmieniono (skrót)
- 009: pizza 260/260 °C, 0 + 6 min, stal; zdanie o stali i grillu w `notesPl` i w `docs/tresci/pl|en/presety-drozdze.md`.
- 008: 6 receptur w garnku 232/232 °C, 20 min pod pokrywką (tartine 22 → 20), bez pokrywki bez zmian (22–25); brioszka 177/177 °C. `src/core/pieczenie-receptury.ts`: kroki `preheat_oven`/`bake` według naczynia receptury, teksty dosłownie z `pieczenie-receptur.md`; plan bez receptury: profil garnka ze źródła (szablon 240/210 °C usunięty). Keksówka i stal: `bake_forma`/`bake_stal`, bez faz garnka, Time Sensitive. Fazy: 232 °C, faza bez pokrywki = czas kroku − 20 min (`fazyGarnka`), komunikat zdjęcia pokrywki bez „obniż do 210 °C”. Harmonogram (`pieczenieDlaPlanu`) i wypiek bez migawki (`pieczenieDlaId`); żyto i wersja drożdżowa bez zmian.
- 010: plan, podpowiedź kolizji, komunikaty temperatury wody, opisy i wskazówki 10 receptur dosłownie z `teksty-glownego-przeplywu.md`; ciabatta i chleb bez wyrabiania bez superlatyw. Trwała kontrola: literał z liczbą w modułach głównego przepływu = zdanie z potwierdzonym twierdzeniem albo wyjątek nazwany.
- 040: 4 zdania `drozdze-przelicznik.md` + zdanie D-100 w karcie „Drożdże do odważenia”; oetker.pl, lesaffre.pl, fleischmannsyeast.com na ekranie „Źródła wiedzy” (45 → 48); `CZEKAJA_NA_WPIECIE` pusta. ciafoodies.com dodany już w 009 (zdanie pizzy z `pieczenie-receptur.md` zdjęło plik z listy 06z, test wymagał źródeł całego pliku).
- 041: nazwy mąk w danych na kanon D-307; nazwy sprzed kanonu dalej prowadzą do profilu atlasu (`DAWNE_NAZWY_ATLASU`, `profilPoNazwie`, `DAWNE_NAZWY`); EN 26 + 7 kluczy; 33 języki: 825 przekładów nazw jako poprawki rodzaju „D-307” w `docs/lokalizacja/poprawki-przekladu.json`, naniesione w plikach generowanych.
- 014: 73 klucze × 33 języki, lista „czeka na przekład” pusta; check:i18n: braki tylko PÓŹNIEJ (13 497 = 409 × 33).

Testy z dawnymi wartościami zmienione tylko na wartości decyzji, z komentarzem ID: baking-phases, domain-error-branches, stolnica-screen, notification-plan, yeast-stages-p9b (tartine bake 47 → 45), DDT ×3, bialko-procent-f8, rodzaj-drozdzy-216, en-kontrola-074, i18n-no-polish-in-en (nazwy handlowe po polsku), flour-inventory-modal, zrodla-wiedzy-t2 (44 → 48), 06z, 093, przeklad-a5d; odcisk p8 liczony z jawną listą cofniętych pól (hash bez zmian). Makieta `docs/design/ekrany/teksty.js` (kl.makaZytnia720) zsynchronizowana z EN (test 642).

## Pliki przekładu (drugi przegląd AI: NIEODBYTY — uruchomi M2)
`docs/lokalizacja/przeklad-m2-014-2026-11-09.json`, `docs/lokalizacja/przeklad-m2-009-2026-11-09.json`, `docs/lokalizacja/przeklad-m2-008-2026-11-09.json`, `docs/lokalizacja/przeklad-m2-010-2026-11-09.json`, `docs/lokalizacja/przeklad-m2-040-2026-11-09.json`, `docs/lokalizacja/przeklad-m2-041-2026-11-09.json` oraz 825 poprawek „D-307” w `docs/lokalizacja/poprawki-przekladu.json`. Liczby: 0 rozbieżności (`dowody/014-liczby-przekladu.txt`; skrypt `narzedzia/liczby.py`, nazwy mąk `narzedzia/terminy.py`, `narzedzia/zastosuj.py`). Do przeglądu człowieka (treść krytyczna): streszczenie polityki prywatności (014, BR-UST-003) i zdanie zdjęcia pokrywki „Zdejmij pokrywkę garnka i piecz dalej w tej samej temperaturze.” (008; ostrzeżenie o parze BEZ-OPA bez zmian).

## Teksty do akceptacji roli 04
Wszystkie zdania z `pieczenie-receptur.md`, `teksty-glownego-przeplywu.md`, `drozdze-przelicznik.md` w kodzie; nowe teksty spoza plików treści: nazwa kroku „Pieczenie” dla keksówki i stali (istniejący klucz), nazwy i opisy 4 źródeł na ekranie („The Culinary Institute of America, przepis „Brioche””, „Dr. Oetker Polska (producent drożdży), „Drożdże suszone instant 7 g””, „Lesaffre Polska (producent drożdży), „Drożdże SAF INSTANT czerwone/złote””, „Fleischmann's Yeast (producent drożdży), najczęstsze pytania”, opisy „Ile drożdży suszonych zastępuje drożdże świeże.” i „… które drożdże suche najpierw rozpuścić w wodzie.”); kanon nazw mąk w interfejsie PL; przycisk „Rozpocznij Fazę 2 (n min @ 232 °C)” z czasem receptury.

## Nowe znaleziska (bez naprawy)
- P1 (rola 06): rada przy zbyt gorącej wodzie odwracała RD-05 — w kodzie jest już wersja z pliku treści; plan brioszki nadal bierze kroki bochenka w koszyku (formowanie, garowanie w lodówce) — PIE-BRI-900.
- P2 (rola 06): wskazówka hydratacji `getHydrationDifficulty` „Wymaga 3–4 standardowych składań.” bez twierdzenia — wyjątek nazwany w `tests/liczby-w-tekstach-010.test.ts` do czasu wersji roli 06.
- P2 (rola 06/07): kanon D-307 dla 2 kluczy wielu mąk („… albo typ …”) jest sprzeczny z regułą 2 `sprawdz-maki.mjs` (druga nazwa mąki w języku); klucze „Mąka pszenna typ 650 lub graham” i „Mąka żytnia (typ 720 / 2000)” zostały, przekład z oboma numerami. Opcje: (a) zostawić klucze (stan dziś); (b) wyłączyć klucze wielu mąk z reguły 2 w skrypcie i teście. Rekomendacja: (a).
- P2 (rola 06): lekcja `src/core/bread-school-lessons.ts:48` „Rozgrzej piekarnik wraz z żeliwnym garnkiem do 240°C przez minimum 45 minut.”; zdanie o nacięciu (KRO-POC-012, `src/core/po-co-ten-krok.ts:45`) pokazuje się też przy pieczeniu brioszki — poza zakresem D-304.
- P2 (rola 09): `scripts/wepnij-przeklad.mjs` nie zregeneruje słowników bez wejścia spoza repo; poprawki „D-307” naniesiono w plikach generowanych jak generator (ten sam tekst w pliku poprawek).

## Otwarte
- Przegląd ścieżki wrażliwej: nie dotyczy (bez migracji, kopii, importu, eksportu, czyszczenia, zakupów, workflowów; `src/data/bake-session-store.ts` — tylko odczyt kroków planu).
- Drugi przegląd AI przekładu: nieodbyty (pliki wyżej). Status „zweryfikowane” nadaje reaudyt.
- Kroki właściciela: brak decyzji; zrzuty przed/po na urządzeniu (prowadzenie: fazy garnka, karta drożdży, ekran „Źródła wiedzy”).
OK: odwołania, cytaty, pliki dowodów i sekrety sprawdzone

(wynik kontroli dowodów i sekretów powyżej: `node narzedzia/sprawdz-raport.mjs wynik.md`)

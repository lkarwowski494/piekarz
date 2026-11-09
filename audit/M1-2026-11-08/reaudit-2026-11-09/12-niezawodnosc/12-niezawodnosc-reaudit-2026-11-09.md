# Reaudyt: Niezawodność — Piekarz — 2026-11-09
Commit: ea249c9c · Tryb: reaudit (pętla 1, baza 2ef8870a) · Grupa A (wyjątek nazwany KO-006: role 05, 12, 08 w jednym kontekście) · Środowisko: Linux x86_64, Node v22.23.4, Jest z `node:sqlite`; bez Xcode, symulatora i buildu TestFlight (ćwiczenia na urządzeniu: nie sprawdzono). Sondy w `git worktree` w scratchpadzie; wyniki jako `.txt` w `dowody/`.

## Podsumowanie
Ścieżka ratunku z trybu awaryjnego kończy się teraz w aplikacji: pakiet `piekarz-pliki-bazy` jest rozpoznawany, sprawdzany (`integrity_check`, wersja), migrowany na kopii w Caches i przywracany istniejącą ścieżką importu z kopią przed importem; oba ekrany ratunku ostrzegają przed usunięciem aplikacji i mają „Napisz do nas” (DEC-17 a). Luka danych: import pakietu nie przywraca trwających i zaplanowanych wypieków (`bake_sessions`) — sonda na bazie 1021: 2 sesje w pakiecie, 0 po imporcie (12-niezawodnosc-601, P1 do weryfikacji przeciwnej). Numer buildu w wiadomości (031) i sprawdzenie kopii ratunkowych (033) zweryfikowane w kodzie i testach; numer w prawdziwym buildzie — krok właściciela. M2-koordynator-napraw-003 potwierdzone (P3).

| ID | M1 | Wynik | Dowód (skrót) |
|---|---|---|---|
| 12-niezawodnosc-001 | M1-audytor-generalny-003 | zweryfikowane w zakresie testu akceptacyjnego; luka danych → 12-niezawodnosc-601 | test 003 (7 przypadków) kod 0 (`../05-architekt/dowody/jest-testy-akceptacyjne-grupa-A.txt`); `src/lib/import-pakietu.ts:72-80`; ekrany: `src/components/RescueScreen.tsx`, `src/components/StorageGate.tsx` (ostrzeżenie, kontakt) |
| 12-niezawodnosc-002 | M1-audytor-generalny-031 | zweryfikowane (kod, test, workflow); w buildzie nie sprawdzono | `src/lib/zgloszenie-wyslanie.ts:36` „build: process.env.EXPO_PUBLIC_BUILD_NUMBER || null,”; `.github/workflows/testflight.yml:157` przed krokiem archiwum (`:197`); test 031 kod 0 |
| 12-niezawodnosc-004 | M1-audytor-generalny-033 | zweryfikowane | `src/data/kopie-przed-migracja.ts:53` „const integralnosc = await sprawdzKopieBazy(”; `src/lib/backup.ts:342`; test 033 (zdrowa „ok”, uszkodzona „bledy”, kopia nietknięta) kod 0 |
| 12-niezawodnosc-003 | M1-audytor-generalny-032 (poza zadaniami grupy, zgodnie z D-302 status „zatwierdzone”) | nadal otwarte (czeka na build) | runbook `docs/wydanie/symbolizacja-awarii.md` jest (0976c0ca); test akceptacyjny „log wysyłki bez Upload Symbols Failed” wymaga nowego buildu |
| 12-niezawodnosc-601 | (nowe) | luka naprawy 003, P1 do weryfikacji przeciwnej | sekcja Znaleziska; `dowody/sonda-pakiet-sesje.txt` |

Znaleziska M2 przypisane tej roli (D-288, bez nowego numeru):

| Znalezisko M2 | Wynik na ea249c9c | Poziom wg D-288 | Dowód |
|---|---|---|---|
| M2-koordynator-napraw-003 | potwierdzone (3 części) | P3, klasa: brzegowy (backlog 1.0.1) | `src/data/recipes-store.ts:45` uszkodzony wiersz z kopii pakietu trafia do globalnej listy `zachowajUszkodzony`; `src/data/migracja-v6.ts:37` plik sesji przed migracją w katalogu ratunkowym aplikacji; katalog `import-pakietu-*` sprzątany tylko w `finally` (`src/lib/import-pakietu.ts:85`) |

Poza zadaniami grupy A: 12-niezawodnosc-005 (czerwony E2E, M1-audytor-generalny-066, rola 07, grupa E) — nie oceniam; stan CI z dnia: `../05-architekt/dowody/ci-stan.txt`.

Liczby: zweryfikowane 3, nadal otwarte 1 (003, poza zadaniami grupy), regresja 0, istniało wcześniej 0; nowe: 1 (601).

## Linia bazowa i założenia
- Tryby awarii od zera: pętla awarii przy starcie (strażnik, tryb awaryjny), uszkodzona baza (ekran błędu, pakiet), nieudana migracja (kopia `VACUUM INTO`, ekran błędu), usunięcie aplikacji przez użytkownika (ostrzeżenie), przywrócenie na nowej instalacji (import pakietu). W tej pętli sprawdzone: przywrócenie z pakietu (sonda), sprawdzenie kopii (test), ekrany (testy renderu).
- Soczewka „użytkownik, któremu aplikacja nie startuje, a ma w niej lata danych”: historia, zakwasy, receptury i spiżarnia wracają; trwający wypiek i plany nie wracają (601).
- Widoczność awarii i tor poprawki: bez zmian od 2ef8870a poza 031 i runbookiem 032.

## Pokrycie (co sprawdzono, czego nie)
| Obszar / pliki | Sprawdzone? | Jak (plik dowodu) |
|---|---|---|
| `src/lib/import-pakietu.ts`, `src/lib/import-z-pliku.ts`, `src/data/dane-z-bazy.ts` | tak | odczyt; test 003; sonda sesji (`dowody/sonda-pakiet-sesje.txt`) |
| `src/components/RescueScreen.tsx`, `src/components/StorageGate.tsx` | tak | diff 2ef8870a..ea249c9c; importy bez bazy w ścieżce kontaktu (`dowody/nie02-nie05-grep.txt`) |
| `src/lib/sprawdzenie-kopii.ts`, `src/data/kopie-przed-migracja.ts`, `src/lib/kopia-plikow-bazy.ts`, `src/lib/backup.ts` | tak | odczyt (`sprawdzKopieBazy` łapie każdy błąd, nie blokuje migracji); test 033 |
| `src/lib/zgloszenie-wyslanie.ts`, `.github/workflows/testflight.yml` | tak | odczyt kolejności kroków; test 031 |
| Ćwiczenie przywrócenia na telefonie, numer buildu w prawdziwym zgłoszeniu | nie | brak urządzenia i buildu (krok właściciela) |

## Kontrola dowodów i sekretów
Wynik `node audit/M1-2026-11-08/narzedzia/sprawdz-raport.mjs <raport> /home/user/piekarz audit/M1-2026-11-08/reaudit-2026-11-09/12-niezawodnosc --rola 12-niezawodnosc`:

```
OK: odwołania, cytaty, pliki dowodów i sekrety sprawdzone; format raportu 12-niezawodnosc
```
(kod 0)

`git status --porcelain` po pracy: pusty wynik — pliki śledzone nietknięte.

## Stosowalność listy kontrolnej
| Pozycja | Status | Wynik |
|---|---|---|
| NIE-01 | dotyczy | ok (033): kopie ratunkowe sprawdzane `integrity_check`, wynik w pakiecie i w pliku obok kopii przed migracją |
| NIE-02 | dotyczy (próbka regresji spoza zmian) | ok: brak `VACUUM` bez `INTO`, `REINDEX`, `deleteDatabase` w `src` i `app` (`dowody/nie02-nie05-grep.txt`) |
| NIE-03 | dotyczy | znalezisko 12-niezawodnosc-601 (import pakietu bez sesji); kopia bieżących danych przed importem — ok (test 003) |
| NIE-04 | dotyczy (próbka regresji spoza zmian) | ok w kodzie: `beginStartup` przed `startAplikacji` (`app/_layout.tsx:64`); na urządzeniu nie sprawdzono |
| NIE-05 | dotyczy | ok: ostrzeżenie, co zrobić z plikiem, kontakt; `napiszDoAutora` nie dotyka bazy (`dowody/nie02-nie05-grep.txt`) |
| NIE-06, NIE-12 | dotyczy | nie sprawdzono: ćwiczenia na buildzie TestFlight to krok właściciela |
| NIE-08 | dotyczy | 002 zweryfikowane w kodzie; 003 (dSYM) nadal otwarte do buildu (D-302) |
| NIE-14 | dotyczy (próbka regresji spoza zmian) | ok z resztką M2-koordynator-napraw-004 (rola 05, P3): błąd pragmy w `finally` runnera zmienia ekran błędu migracji na „inny błąd”, kopia zostaje |
| NIE-07, -09, -10, -11, -13 | dotyczy / nie dotyczy (NIE-10 bez expo-updates, NIE-13 bez pakietów treści) | nie sprawdzono w tej pętli: brak zmian i otwartych ID |

## Znaleziska (szczegóły)

### 12-niezawodnosc-601 · Import pakietu z trybu awaryjnego przywraca historię i zakwasy, ale gubi trwający wypiek i zaplanowane wypieki
- Pozycja listy kontrolnej: NIE-03
- Poziom: P1 do weryfikacji przeciwnej (obszar danych użytkownika; realna ocena skutku może dać P2 — dane zostają w pliku pakietu)
- Realność: brzegowy (wymaga pętli awarii albo uszkodzonej bazy, reinstalacji i importu)   · Pewność: wysoka
- Rodzaj: D
- Dowód: sonda na kopii bazy 1021 (`dowody/sonda-pakiet-sesje.txt`, kod 0): w pakiecie `bake_sessions` = [`bake_live` active, `plan_sobota` planned]; kopia z `kopiaZPakietu` nie ma pola `bakeSessions` (null); liczności po imporcie: bakes 4, starters 2, `bake_sessions` 0. Kod: `src/data/dane-z-bazy.ts:25` „starterEntries, flourInventory, settings, lessonProgress };” (bez sesji), a import dopisuje sesje tylko z pola kopii: `src/data/sqlite-store.ts:312` „if (data.bakeSessions) await wstawSesjeZKopii(tx, data.bakeSessions);”.
- Mechanizm: odczyt pakietu (`zbierzDaneZBazy`) zbiera ten sam stan co eksport, a eksport z decyzji D-102 nie niesie sesji; DEC-11 a dodał sesje tylko do kopii przed czyszczeniem (`czytajSesjeDoKopii`). `grep "bakeSessions\|czytajSesjeDoKopii"` w `dane-z-bazy.ts`, `import-pakietu.ts`, `import-z-pliku.ts` → 0 trafień (`dowody/nie02-nie05-grep.txt`). Podgląd importu (`zdanieKopii`) mówi o recepturach, zakwasach i wpisach, nie o wypiekach w toku.
- Powraca: tak — ta sama luka co 05-architekt-504 (sesje poza kopią) naprawiona w M1-audytor-generalny-023 tylko dla czyszczenia → trwała kontrola: test importu pakietu z liczbą `bake_sessions`.
- Wzorzec lub źródło: DEC-17 a („import pakietu awaryjnego w aplikacji … pełny ratunek”); zasada wspólna 10; NIE-03 (przywrócenie kompletne).
- Kroki w aplikacji: trwa wypiek i jest plan na sobotę → aplikacja wpada w pętlę awarii → „Eksportuj kopię danych” → reinstalacja → Ustawienia → „Importuj z pliku” → „Zastąp dane”: Dziennik i zakwasy wracają, prowadzenie wypieku i plan znikają bez komunikatu; surowa treść zostaje tylko w pliku pakietu (dla pakietu sprzed v6 także w pliku ratunkowym, M2-koordynator-napraw-003).
- Weryfikacja przeciwna (wstępna, do potwierdzenia przez M1): szukałem innej drogi powrotu sesji — `wstawSesjeZKopii` woła tylko `restoreFromBackupData` przy polu `bakeSessions`; `kopiaZPakietu` buduje kopię przez `buildBackup(stan)` bez tego pola (`src/lib/import-pakietu.ts:78-79`); ekran importu nie ostrzega. Dane nie są skasowane z pakietu, więc skutek jest odwracalny przez dewelopera — stąd możliwe obniżenie do P2 (zostaje przed 1.0 jako wyjątek danych z D-288).
- Opcje: (a) `zbierzDaneZBazy` dodaje `bakeSessions: await czytajSesjeDoKopii(db)` (mechanizm 023 z limitami i „telefon wygrywa”) + test sondy — kompromis: ok. 1 h roli 08, sesje z pakietu mogą być przeterminowane (wypiek sprzed dni wraca jako trwający); (b) tekst podglądu: „Trwające i zaplanowane wypieki nie wracają z tej kopii” (rola 04, 35 języków) — kompromis: świadoma utrata; (c) bez zmian. Rekomendacja: (a).
- Test akceptacyjny: sonda z `dowody/sonda-pakiet-sesje.txt` jako test: liczba `bake_sessions` po imporcie pakietu bazy 1021 = 2 (albo, przy (b), tekst podglądu obecny w 35 językach); test pada na ea249c9c.
- Status: otwarte

## Klasyfikacja znalezisk M2 (D-288)
**M2-koordynator-napraw-003 — potwierdzone, P3 (klasa: brzegowy).** (1) Czytelnicy bazy pakietu zgłaszają uszkodzone wiersze do globalnej listy aplikacji: `src/data/recipes-store.ts:45` „zachowajUszkodzony({ tabela: 'recipes', id: r.id, surowe: r.formula_json });” — wiersze trafią do pliku ratunkowego i kolejnych kopii aplikacji, nie do przywróconych danych (dane nie giną; plik ratunkowy przypadkiem je chroni). (2) Migracja kopii pakietu sprzed v6 zapisuje plik sesji w katalogu ratunkowym aplikacji: `src/data/migracja-v6.ts:37` „const dir = `${docDir}${AUTO_DIR}${RESCUE_DIR}`;”. (3) Katalog kopii w Caches znika w `finally`; po zabiciu aplikacji w trakcie zostaje do sprzątania przez system. Powiązane: 12-niezawodnosc-601 (sesja z pakietu sprzed v6 zostaje tylko w tym pliku).

## Do sprawdzenia (pewność ≤ 80%)
- Numer buildu w treści „Napisz do nas” w prawdziwym buildzie TestFlight: workflow ustawia `EXPO_PUBLIC_BUILD_NUMBER` w `GITHUB_ENV` przed `xcodebuild archive`, a Metro wstawia zmienne `EXPO_PUBLIC_*` przy bundlowaniu — czy cache Metro w CI nie poda starej wartości, rozstrzygnie pierwsze zgłoszenie z buildu po e3c23559 (krok właściciela).
- Pakiet z bazą uszkodzoną tak, że `integrity_check` = ok, a czytelnicy pomijają wiersze: import przywraca dane bez tych wierszy; ich surowa treść trafia do pliku ratunkowego aplikacji (M2-003), a podgląd tego nie mówi.

## Co działa dobrze i należy zachować
- Kopia z pakietu otwierana jako osobna baza w Caches, migracje tylko na kopii, baza aplikacji nietknięta do „Zastąp dane”; odrzucenie pustej/obcej bazy (`user_version` < 1) i nowszej wersji.
- Sprawdzenie kopii na kopii roboczej (sprawdzana kopia z `-wal` nietknięta) i wynik zapisany przy kopii.
- Ostrzeżenie przed usunięciem aplikacji i kontakt na obu ekranach ratunku, w 35 językach (test 003).

## Decyzje dla właściciela
1. 12-niezawodnosc-601: (a) sesje z pakietu wracają przez mechanizm 023 — ok. 1 h roli 08 z testem; (b) ostrzeżenie w podglądzie — tekst przez 04 i 09; (c) bez zmian. Rekomendacja: (a) przed 1.0 (dane użytkownika, wyjątek D-288).

## Proponowane polecenie naprawy
`node tools/assemble.mjs 12-niezawodnosc --tryb fix --zadania 12-niezawodnosc-601`

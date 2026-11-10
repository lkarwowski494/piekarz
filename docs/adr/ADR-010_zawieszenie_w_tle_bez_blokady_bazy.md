# ADR-010: Zawieszenie aplikacji w tle bez blokady bazy (`0xdead10cc`): krótkie transakcje bez czekania na zdarzenia, bez trybów tła i bez zegarka (stan zastany)

**Status:** przyjęta (stan zastany, odtworzony z kodu 2026-11-09); zastępuje ADR-005 (część „alarmy w tle” zastąpił wcześniej ADR-006)  
**Data:** 2026-11-09  
**Decyduje:** hierarchia źródeł (zachowanie iOS: dokumentacja Apple) / właściciel (opcja ochrony czasu wykonania w tle)  
**Autor:** rola 05-architekt, tryb fix [M1-audytor-generalny-024; 05-architekt-505]

## Kontekst i problem

ADR-005 (18.10.2026) twierdził, że `PRAGMA journal_mode = WAL` z `PRAGMA busy_timeout = 5000` daje „100% odporność” na zakończenie aplikacji z kodem `0xdead10cc`, i opisywał samodzielną aplikację na Apple Watch z kolejką `pending_ops`. Oba twierdzenia są nieprawdziwe: zegarek jest wycięty (`docs/scope-contract.md`, KL-06, KL-14), a Apple wskazuje inną przyczynę i inną ochronę. Przepływ, którego to dotyczy: wypiek prowadzony przy zablokowanym ekranie („pilnuje czasu, gdy telefon śpi”, cel projektu) — aplikacja przechodzi w tło w trakcie wypieku, a zapisy (krok, koniec wypieku, kopia, import) mogą trwać w chwili zawieszenia.

## Czynniki decyzji

- **Zasada Apple** (https://developer.apple.com/documentation/xcode/sigkill, kod `0xdead10cc`, odczyt 2026-11-09, surowy tekst strony): „The operating system terminated the app because it held on to a file lock or SQLite database lock during suspension.” Dalej: prośba o dodatkowy czas wykonania w tle przez `beginBackgroundTask(withName:expirationHandler:)` „well before starting to write to the file in order to complete those operations and relinquish the lock before the app suspends”.
- Wniosek: przyczyną jest blokada trzymana w chwili zawieszenia. `busy_timeout` ustawia czas czekania na zajętą bazę („Query or change the setting of the busy timeout”, https://www.sqlite.org/pragma.html, odczyt 2026-11-09), a WAL zmienia sposób zapisu; żadne z nich nie zwalnia blokady przed zawieszeniem.
- App Review Guidelines 2.5.4: tryby tła tylko zgodnie z przeznaczeniem (pilnuje `scripts/verify-native.mjs`).
- Powiadomienia lokalne na bezwzględną datę zamiast pracy JS w tle (ADR-006).

## Rozważane opcje

- **A. Krótkie transakcje bez czekania na zdarzenia, bez ochrony czasu w tle** (stan kodu).
- **B. A + ochrona dłuższych zapisów** (import, kopia, migracja) przez `beginBackgroundTask` w module natywnym (Expo Modules API). Czy Expo SDK 57 ma gotowy moduł JS dla tego API: `[DO USTALENIA]` (moduł roli 05 z 18.10.2026: dokumentacja Expo SDK 58 go nie opisuje; nie sprawdzone ponownie dziś).
- **C. A + dłuższe operacje tylko na pierwszym planie z blokadą interfejsu** do ich końca.

## Decyzja

Stan zastany to **A**. Wybór B albo C to decyzja właściciela po pomiarze (niżej); do tego czasu obowiązują zasady:

1. Żadna transakcja ani zapis pliku nie czeka (`await`) na sieć, timer, okno dialogowe, powiadomienie ani zdarzenie aplikacji; w transakcji tylko zapytania na `tx` (`tests/kolejka-zapisow-tx.test.ts` pilnuje `tx`; brak czekania na zdarzenia sprawdził audyt M1, ARCH-13 „ok”, `audit/M1-2026-11-08/role/05-architekt/05-architekt-2026-11-08.md`).
2. Zapisy są krótkie: jeden wiersz albo jedna transakcja zbiorcza; brak transakcji otwartej między ekranami.
3. Bez `UIBackgroundModes` (`app.json` → `expo.ios.infoPlist` go nie ma; `audio` i `remote-notification` zabronione w `scripts/verify-native.mjs`). Prowadzenie wypieku w tle niosą powiadomienia lokalne (ADR-006).
4. Bez aplikacji na zegarek, Live Activity i kolejki `pending_ops` (KL-06, KL-07, KL-14); tabela `pending_ops` zostaje bez zapisu (ADR-009 §5).
5. Baza tylko w kontenerze aplikacji (`/Library/SQLite`, ADR-001); wspólny kontener (App Group, rozszerzenia) wymaga osobnego ADR.

### Konsekwencje

- Dobre: okno, w którym blokada może trwać w chwili zawieszenia, jest krótkie; brak trybów tła do uzasadnienia w App Review.
- Złe: kod nie prosi o czas wykonania w tle, więc zawieszenie w trakcie dłuższego zapisu (migracja z `VACUUM INTO` przy starcie, import kopii, kopia po wypieku, zapis pliku ratunkowego) może skończyć się `0xdead10cc`. Dane przetrwają (transakcja się wycofa, SQLite odtworzy stan przy następnym otwarciu), ale użytkownik straci niezakończoną operację.
- Od czego zależy: pomiar czasu najdłuższych zapisów na najstarszym wspieranym iPhonie i raporty awarii z TestFlight (krok właściciela). Przy potwierdzonym zakończeniu w tle: ARCH-13 P1 i wybór B albo C.

## Potwierdzenie

- **ARCH-13**, przegląd kodu przy każdej zmianie zapisu: w treści `withTransactionAsync` brak `await` na czymkolwiek poza `tx` (wyszukiwanie: `grep -n "withTransactionAsync" -A 20 src/data src/lib` i przegląd każdego `await`), brak zapisu pliku czekającego na okno albo powiadomienie.
- **Tryby tła:** `npm run verify:native` (brak `audio` i `remote-notification` w `UIBackgroundModes`).
- **Na urządzeniu (krok właściciela):** raporty awarii TestFlight (Xcode Organizer → Crashes albo App Store Connect → TestFlight → Crashes), wyszukanie `0xdead10cc` w polu „Termination Reason”; pomiar czasu importu kopii i migracji na najstarszym wspieranym iPhonie (metoda: kilka powtórzeń, mediana i najgorszy wynik, wielkość danych z szacunku 3-letniego).
- Zgodność dokumentu: `tests/architektura-dokumenty-024.test.ts`.

## Opcje: zalety i wady

### A. Krótkie transakcje bez ochrony — zalety / wady
Zalety: bez kodu natywnego; zgodne z tym, co dziś działa. Wady: brak ochrony dłuższych zapisów przed zawieszeniem.

### B. Ochrona `beginBackgroundTask` — zalety / wady
Zalety: wskazana przez Apple; operacja kończy się mimo przejścia w tło. Wady: moduł natywny i test na urządzeniu; czas w tle jest ograniczony, więc operacja nadal musi być krótka.

### C. Dłuższe operacje tylko na pierwszym planie — zalety / wady
Zalety: bez kodu natywnego. Wady: blokada interfejsu; nie chroni przed zablokowaniem ekranu przyciskiem w trakcie operacji.

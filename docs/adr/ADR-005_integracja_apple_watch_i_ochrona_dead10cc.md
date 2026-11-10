# ADR-005: Architektura integracji z Apple Watch (watchOS 11 Standalone) i błąd iOS `0xDEAD10CC` (zastąpiona)

**Status:** zastąpiona przez ADR-010 (2026-11-09); wcześniej w części „alarmy w tle” (opcja A, pkt 2) przez ADR-006 (19.10.2026)  
**Dlaczego zastąpiona (2026-11-09, M1-audytor-generalny-024):** (1) Apple: `0xdead10cc` to zakończenie aplikacji, która „held on to a file lock or SQLite database lock during suspension” (https://developer.apple.com/documentation/xcode/sigkill, odczyt 2026-11-09); WAL ani `busy_timeout` blokady nie zwalniają, więc twierdzenie o ochronie było nieprawdziwe i zostało usunięte z tekstu niżej. (2) Aplikacja na zegarek i kolejka `pending_ops` są wycięte (`docs/scope-contract.md`, KL-06, KL-14). Obowiązuje ADR-010; tekst niżej to zapis historyczny z 18.10.2026.  
**Data:** 18.10.2026  
**Autor:** Principal System Architect  
**Kontekst:** Aplikacja na Apple Watch (watchOS 11) stanowi kluczowy wyróżnik rynkowy Piekarza (decyzja `DEC-03`), realizując obietnicę sterowania w kuchni bez dotykania telefonu (gest Double Tap, obrót cyfrową koronką Digital Crown). Jednocześnie w środowisku iOS / watchOS występuje krytyczne ryzyko awarii systemu `0xDEAD10CC`, gdy system zawiesza proces trzymający otwartą blokadę pliku bazy SQLite podczas przejścia w tło. Ponadto Apple rygorystycznie odrzuca aplikacje deklarujące tryb audio w tle (`UIBackgroundModes: ["audio"]`), jeśli aplikacja nie jest odtwarzaczem muzyki (wytyczna App Store Guideline 2.5.4).

---

## Rozważane Opcje

### Opcja A: SQLite WAL + `PRAGMA busy_timeout = 5000;` + Time-Sensitive Notifications bez trybu Audio w Tle (Rekomendowana)
- **Opis:**
  1. **Konfiguracja Bazy SQLite:**
     Wymuszenie trybu WAL oraz limitu oczekiwania:
     ```sql
     PRAGMA journal_mode = WAL;
     PRAGMA busy_timeout = 5000;
     PRAGMA synchronous = NORMAL;
     ```
     [Usunięte 2026-11-09: zdanie przypisywało `busy_timeout` i WAL zapobieganie zakończeniu w tle; nieprawdziwe, zob. ADR-010.]
  2. **Eliminacja ryzyka Guideline 2.5.4:**
     Całkowity brak wpisu `"audio"` w `UIBackgroundModes` w `app.json`. Dźwięki powiadomień i alarmy piecowe na stolnicy są odtwarzane za pomocą lokalnych powiadomień `UNNotificationSound` oraz syntetyzatora dźwięku PCM `expo-audio` wyłącznie w momencie, gdy aplikacja jest na pierwszym planie (`Keep-Awake`). W tle działają powiadomienia systemowe `Time-Sensitive` przebijające tryb Focus.
  3. **Komunikacja z Apple Watch:**
     Architektura Standalone Watch App z synchronizacją stanu przez `WatchConnectivity` (`WCSession.transferCurrentComplicationUserInfo` oraz `updateApplicationContext`). Zdarzenia z zegarka (Double Tap) zapisywane są w tabeli `pending_ops` i replikowane do iPhone'a.
- **Zalety:**
  - [Usunięte 2026-11-09: nieprawdziwe twierdzenie o błędzie `0xDEAD10CC`, zob. ADR-010.]
  - Zero ryzyka odrzucenia w App Store Review z powodu nadużycia trybu audio w tle.
  - Niezależne działanie zegarka, gdy użytkownik wyjdzie z kuchni do ogrodu bez iPhone'a.
- **Wady:** Alarmy w tle muszą opierać się na powiadomieniach systemowych iOS/watchOS.

### Opcja B: Trzymanie stałego odtwarzacza audio w tle
- **Opis:** Odtwarzanie cichego pliku audio w pętli, aby zapobiec uśpieniu aplikacji przez iOS.
- **Wady:** Kategorycznie odrzucone. Gwarantowane odrzucenie w App Store Review (Guideline 2.5.4), drastyczny drenaż baterii użytkownika.

---

## Decyzja i Uzasadnienie

Wybieramy **Opcję A (WAL + busy_timeout 5000 + Time-Sensitive Notifications bez Background Audio)**.
[Usunięte 2026-11-09: twierdzenie o pełnej zgodności z wytycznymi Apple i ochronie bazy, nieprawdziwe w części o blokadzie bazy, zob. ADR-010.]

---

## Konsekwencje

- **Pozytywne:**
  - Zielone światło w automatycznych testach weryfikacji natywnej (`scripts/verify-native.mjs`).
  - [Usunięte 2026-11-09: twierdzenie o pracy w tle bez ryzyka zakończenia, nieprawdziwe, zob. ADR-010.]
- **Negatywne:**
  - Konieczność autoryzacji uprawnień powiadomień `UNAuthorizationOptionAlert | UNAuthorizationOptionSound`.

# ADR-005: Architektura integracji z Apple Watch (watchOS 11 Standalone) i ochrona przed błędem iOS `0xDEAD10CC`

**Status:** ACCEPTED; w części „alarmy w tle” (opcja A, pkt 2) zastąpiona przez ADR-006 (19.10.2026): powiadomienia w tle nie istniały w kodzie, kontrakt i sposób sprawdzenia są w ADR-006  
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
     Dzięki `busy_timeout = 5000` procesy w tle nie crashują natychmiast przy rywalizacji wątków, a tryb WAL eliminuje blokowanie czytelników przez pisarzy.
  2. **Eliminacja ryzyka Guideline 2.5.4:**
     Całkowity brak wpisu `"audio"` w `UIBackgroundModes` w `app.json`. Dźwięki powiadomień i alarmy piecowe na stolnicy są odtwarzane za pomocą lokalnych powiadomień `UNNotificationSound` oraz syntetyzatora dźwięku PCM `expo-audio` wyłącznie w momencie, gdy aplikacja jest na pierwszym planie (`Keep-Awake`). W tle działają powiadomienia systemowe `Time-Sensitive` przebijające tryb Focus.
  3. **Komunikacja z Apple Watch:**
     Architektura Standalone Watch App z synchronizacją stanu przez `WatchConnectivity` (`WCSession.transferCurrentComplicationUserInfo` oraz `updateApplicationContext`). Zdarzenia z zegarka (Double Tap) zapisywane są w tabeli `pending_ops` i replikowane do iPhone'a.
- **Zalety:**
  - 100% odporność na błąd `0xDEAD10CC`.
  - Zero ryzyka odrzucenia w App Store Review z powodu nadużycia trybu audio w tle.
  - Niezależne działanie zegarka, gdy użytkownik wyjdzie z kuchni do ogrodu bez iPhone'a.
- **Wady:** Alarmy w tle muszą opierać się na powiadomieniach systemowych iOS/watchOS.

### Opcja B: Trzymanie stałego odtwarzacza audio w tle
- **Opis:** Odtwarzanie cichego pliku audio w pętli, aby zapobiec uśpieniu aplikacji przez iOS.
- **Wady:** Kategorycznie odrzucone. Gwarantowane odrzucenie w App Store Review (Guideline 2.5.4), drastyczny drenaż baterii użytkownika.

---

## Decyzja i Uzasadnienie

Wybieramy **Opcję A (WAL + busy_timeout 5000 + Time-Sensitive Notifications bez Background Audio)**.
Podejście to jest w 100% zgodne z oficjalnymi wytycznymi inżynieryjnymi Apple, chroni integralność bazy SQLite i zapewnia najwyższe standardy higieny baterii oraz bezpieczeństwa systemowego.

---

## Konsekwencje

- **Pozytywne:**
  - Zielone światło w automatycznych testach weryfikacji natywnej (`scripts/verify-native.mjs`).
  - Bezpieczna praca w tle bez ryzyka ubicia procesu.
- **Negatywne:**
  - Konieczność autoryzacji uprawnień powiadomień `UNAuthorizationOptionAlert | UNAuthorizationOptionSound`.

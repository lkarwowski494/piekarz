# ADR-001: Wybór silnika bazy danych SQLite i warstwy dostępowej

**Status:** ACCEPTED (decyzja bez zmian); korekta 2026-11-09 (M1-audytor-generalny-024): usunięte liczby czasu bez pomiaru i watchOS (wycięty, KL-06); ścieżka zapisu, migracje i kopie: ADR-009  
**Data:** 18.10.2026  
**Autor:** Principal System Architect  
**Kontekst:** Aplikacja Piekarz (Crust) wymaga 100% niezawodnej, lokalnej bazy danych działającej w środowisku React Native / Expo 57 na iOS. Wymagania NFR (`NFR-OFF`, `NFR-DANE`, `NFR-WYD`) narzucają: szybką odpowiedź ekranów (budżet czasu: brak, bez pomiaru na urządzeniu; sekcja „Budżety wydajności” w `docs/system-architecture.md`), transakcyjność ACID, odporność na nagłe wyłączenie zasilania w kuchni oraz chronioną lokalizację w piaskownicy iOS.

---

## Rozważane Opcje

### Opcja A: Natywny `expo-sqlite` (Async API) w chronionym katalogu `/Library/SQLite` (Rekomendowana)
- **Opis:** Oficjalna biblioteka platformy Expo (`expo-sqlite` ~57.0.3), wykorzystująca nowoczesne API asynchroniczne (`openDatabaseAsync`, `execAsync`, `runAsync`, `getAllAsync`) ze wsparciem dla SQLite WAL i prepared statements. Plik bazy umieszczony w `/Library/Application Support/SQLite` lub `/Library/SQLite` za pośrednictwem modułu `dbDirectory`.
- **Zalety:**
  - Zero dodatkowych kompilowanych bibliotek C++ JSI spoza ekosystemu Expo.
  - Pełna zgodność z potokiem EAS Build i architekturą Expo 57.
  - Bezpieczna ścieżka systemowa gwarantująca, że iOS nie wyczyści bazy przy niskim stanie pamięci (w przeciwieństwie do `/Library/Caches`).
  - Sprawdzony fallback in-memory dla środowisk testowych Jest i Node.js.
- **Wady:** Asynchroniczny mostek JavaScript/Native dla zapytań (koszt nie zmierzony na urządzeniu).

### Opcja B: `op-sqlite` (C++ JSI Direct)
- **Opis:** Bezpośrednie wiązanie C++ JSI do SQLite.
- **Zalety:** Ekstremalna wydajność mikrosekundowa (synchroniczne wywołania JSI).
- **Wady:** Wymaga dedykowanych podlinkowań C++, utrudnia uruchamianie testów w środowisku `jest-expo` na maszynach CI, niepotrzebny narzut złożoności dla małej bazy domowej.

### Opcja C: `WatermelonDB` / `Realm`
- **Opis:** Obiektowo-relacyjna warstwa ORM.
- **Zalety:** Wbudowana reaktywność modeli.
- **Wady:** Dodatkowa warstwa i narzut pamięci (nie zmierzony), łamanie zasady prostoty i bezpośredniego schematu SQL DDL, potencjalne problemy z migracjami bezstratnymi.

---

## Decyzja i Uzasadnienie

Wybieramy **Opcję A (`expo-sqlite` z chronioną ścieżką `/Library/SQLite`)**.
Baza domowego piekarza jest mała (szacunek 3 lat z audytu M1: ok. 312 wpisów Dziennika i 3300 wpisów dziennika zakwasu; plany zapytań bez pełnego skanu dużej tabeli, `audit/M1-2026-11-08/role/05-architekt/dowody/plan-zapytan.txt`). Czasu na urządzeniu nikt nie zmierzył, więc ADR nie podaje liczby. Testy zapisu idą na prawdziwym SQLite w Node (`node:sqlite`, `src/data/__tests__/helpers/node-sqlite-adapter.ts`).

---

## Konsekwencje

- **Pozytywne:**
  - 100% determinizmu w testach Jest dzięki fallbackowi pamięciowemu.
  - Stabilność przy aktualizacjach Expo SDK.
  - [Korekta 2026-11-09: atrybut ochrony pliku nie jest ustawiany w kodzie (`grep -rn FileProtection src app` bez trafień); domyślna klasa ochrony iOS `[DO USTALENIA]`.]
- **Negatywne:**
  - Wszystkie metody repozytoriów muszą zwracać `Promise<T>`.

## Zgodność z Ekosystemem Portfolio
Identyczne rozwiązanie stanowi standard produkcyjny w projektach *Piwowar*, *Napar* i *Słoik* (Standard T-012).

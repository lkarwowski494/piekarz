# ADR-001: Wybór silnika bazy danych SQLite i warstwy dostępowej

**Status:** ACCEPTED  
**Data:** 18.10.2026  
**Autor:** Principal System Architect  
**Kontekst:** Aplikacja Piekarz (Crust) wymaga 100% niezawodnej, lokalnej bazy danych działającej w środowisku React Native / Expo 57 na iOS i watchOS. Wymagania NFR (`NFR-OFF`, `NFR-DANE`, `NFR-WYD`) narzucają: natychmiastowy czas odpowiedzi (< 5ms na zapytanie), transakcyjność ACID, odporność na nagłe wyłączenie zasilania w kuchni oraz chronioną lokalizację w piaskownicy iOS.

---

## Rozważane Opcje

### Opcja A: Natywny `expo-sqlite` (Async API) w chronionym katalogu `/Library/SQLite` (Rekomendowana)
- **Opis:** Oficjalna biblioteka platformy Expo (`expo-sqlite` ~57.0.3), wykorzystująca nowoczesne API asynchroniczne (`openDatabaseAsync`, `execAsync`, `runAsync`, `getAllAsync`) ze wsparciem dla SQLite WAL i prepared statements. Plik bazy umieszczony w `/Library/Application Support/SQLite` lub `/Library/SQLite` za pośrednictwem modułu `dbDirectory`.
- **Zalety:**
  - Zero dodatkowych kompilowanych bibliotek C++ JSI spoza ekosystemu Expo.
  - Pełna zgodność z potokiem EAS Build i architekturą Expo 57.
  - Bezpieczna ścieżka systemowa gwarantująca, że iOS nie wyczyści bazy przy niskim stanie pamięci (w przeciwieństwie do `/Library/Caches`).
  - Sprawdzony fallback in-memory dla środowisk testowych Jest i Node.js.
- **Wady:** Asynchroniczny mostek JavaScript/Native dla zapytań (koszt ~0.3ms na zapytanie, całkowicie pomijalny przy zapytaniach < 5ms).

### Opcja B: `op-sqlite` (C++ JSI Direct)
- **Opis:** Bezpośrednie wiązanie C++ JSI do SQLite.
- **Zalety:** Ekstremalna wydajność mikrosekundowa (synchroniczne wywołania JSI).
- **Wady:** Wymaga dedykowanych podlinkowań C++, utrudnia uruchamianie testów w środowisku `jest-expo` na maszynach CI, niepotrzebny narzut złożoności dla bazy < 5 MB.

### Opcja C: `WatermelonDB` / `Realm`
- **Opis:** Obiektowo-relacyjna warstwa ORM.
- **Zalety:** Wbudowana reaktywność modeli.
- **Wady:** Ogromny narzut pamięciowy (>25 MB RAM), łamanie zasady prostoty i bezpośredniego schematu SQL DDL, potencjalne problemy z migracjami bezstratnymi.

---

## Decyzja i Uzasadnienie

Wybieramy **Opcję A (`expo-sqlite` z chronioną ścieżką `/Library/SQLite`)**.
Przy skali bazy domowego piekarza (< 3–5 MB w horyzoncie 5 lat) narzut `expo-sqlite` jest niezauważalny (zapytania wykonują się w < 2ms). Zapewnia to stabilność na iOS 18 i watchOS 11 oraz zero problemów z testami jednostkowymi i wektorami dziedzinowymi.

---

## Konsekwencje

- **Pozytywne:**
  - 100% determinizmu w testach Jest dzięki fallbackowi pamięciowemu.
  - Stabilność przy aktualizacjach Expo SDK.
  - Baza zabezpieczona atrybutem `FileProtectionType.completeUntilFirstUserAuthentication`.
- **Negatywne:**
  - Wszystkie metody repozytoriów muszą zwracać `Promise<T>`.

## Zgodność z Ekosystemem Portfolio
Identyczne rozwiązanie stanowi standard produkcyjny w projektach *Piwowar*, *Napar* i *Słoik* (Standard T-012).

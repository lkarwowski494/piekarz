# ADR-002: Architektura zarządzania stanem globalnym, uprawnieniami i reaktywnością UI

**Status:** ACCEPTED  
**Data:** 18.10.2026  
**Autor:** Principal System Architect  
**Kontekst:** W audycie monetyzacji (Rola 3) zidentyfikowano defekt **M8 (Zamrożony Stan Po Zakupie)**: `useAppAccess()` zarządzał stanem uprawnień w odizolowanym `useState` per-komponent. Zakup subskrypcji lub planu Lifetime na jednym ekranie nie powodował reaktywnego odblokowania pozostałych 4 zamontowanych zakładek w Expo Routerze bez restartu aplikacji. Konieczne jest wdrożenie czystego, reaktywnego wzorca publikacji stanu bez wprowadzania ciężkich bibliotek zewnętrznych.

---

## Rozważane Opcje

### Opcja A: Scentralizowany `AppAccessContext` + Pub/Sub Listener z trwałym zapisem w SQLite (Rekomendowana)
- **Opis:** Stan uprawnień zarządzany przez centralny `AppAccessProvider` zamontowany w `app/_layout.tsx`. Wszelkie mutacje (`subscribe`, `incrementCompletedBakes`, `resetAppAccess`) zapisują dane w SQLite, a następnie rozgłaszają zdarzenie do zarejestrowanych subskrybentów za pomocą wzorca Pub/Sub (`listeners.forEach(fn)`).
- **Zalety:**
  - Zero dodatkowych bibliotek w `package.json` (czysty React Context i wzorzec Obserwatora).
  - Natychmiastowa reaktywność we wszystkich 5 zakładkach (Kalkulator, Zakwas, Harmonogram, Stolnica, Doktor) w czasie < 1ms.
  - SQLite pozostaje Single Source of Truth — stan nie ulega rozjechaniu po ubiciu procesu w tle.
- **Wady:** Wymaga oplecenia drzewa aplikacji w `_layout.tsx` providerem kontekstu.

### Opcja B: Wdrożenie `Zustand` z Middleware Persystencji
- **Opis:** Utworzenie store'a Zustand z asynchronicznym zapisem w AsyncStorage / SQLite.
- **Zalety:** Wygodne selektory renderowania.
- **Wady:** Wprowadzenie nowej zależności, ryzyko niespójności pomiędzy pamięcią RAM Zustand a transakcjami SQLite, zbędny narzut dla prostego stanu uprawnień i aktywnego wypieku.

### Opcja C: Rozproszone odpytywanie w pętli `useEffect` / polling
- **Opis:** Okresowe odpytywanie bazy co sekundę.
- **Wady:** Kategorycznie odrzucone (drenaż baterii w tle, brak reaktywności zdarzeniowej).

---

## Decyzja i Uzasadnienie

Wybieramy **Opcję A (`AppAccessContext` + Pub/Sub Event Emitter)**.
Rozwiązanie to w 100% eliminuje wadę M8, jest natywnie wspierane przez React 19 / Expo 57, nie dodaje ani jednego bajta do pakietu JS i gwarantuje, że transakcyjny zapis w SQLite natychmiast synchronizuje cały interfejs użytkownika.

---

## Konsekwencje

- **Pozytywne:**
  - Natychmiastowe zniknięcie paywalla na wszystkich ekranach w ułamku sekundy po zatwierdzeniu płatności w StoreKit.
  - Proste, izolowane testy jednostkowe hooka `useAppAccess`.
- **Negatywne:**
  - Konieczność zapewnienia mocka Providera w testach komponentów ekranowych renderowanych w izolacji.

## Zgodność z Ekosystemem Portfolio
Standard zgodny z architekturą uprawnień studia Apps4Craft w projektach *Oczko* i *Napar*.

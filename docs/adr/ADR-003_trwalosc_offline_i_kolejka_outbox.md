# ADR-003: Protokół trwałości offline-first, kolejka zdarzeń `pending_ops` i standard T-012

**Status:** ACCEPTED  
**Data:** 18.10.2026  
**Autor:** Principal System Architect  
**Kontekst:** Aplikacja działa w warunkach kuchennych, gdzie telefon może ulec rozładowaniu, uśpieniu lub zablokowaniu ekranu w trakcie trwającego procesu. Wymagania NFR (`NFR-DANE-001`, `NFR-DANE-002`) oraz decyzja `DEC-45` narzucają: pełną transakcyjność ACID, autokopię zapasową danych bochenków oraz asynchroniczny bufor operacji dla rozszerzeń systemowych (Apple Watch, Live Activity) bez ryzyka utraty stanu.

---

## Rozważane Opcje

### Opcja A: Relacyjna tabela `pending_ops` (Outbox Pattern) w SQLite + rotacyjna autokopia JSON (Rekomendowana)
- **Opis:**
  1. Wszystkie kluczowe zapisy wielotabelowe (np. ukończenie bochenka: zapis w `bakes`, inkrementacja licznika w `app_access`, odliczenie w `flour_inventory`) wykonywane są w transakcji atomowej `BEGIN TRANSACTION; ... COMMIT;`.
  2. Wprowadzenie tabeli `pending_ops` ze strukturą:
     `CREATE TABLE IF NOT EXISTS pending_ops (id TEXT PRIMARY KEY, op_type TEXT NOT NULL, payload TEXT NOT NULL, created_at INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'PENDING');`
     Służy do buforowania zdarzeń wygenerowanych na stolnicy (np. odhaczenie coil fold, zmiana temperatury) dla aplikacji Apple Watch oraz widgetów Smart Stack.
  3. Zgodnie ze standardem Apps4Craft T-012, po każdym zapisanym wypieku uruchamiany jest asynchroniczny zrzut całej bazy do pliku JSON w katalogu dokumentów z rotacją do 5 najświeższych kopii.
- **Zalety:**
  - 100% odporność na awarie zasilania — transakcja SQLite albo wykonuje się w całości, albo cofa zmiany (Zero Partial Writes).
  - W razie uszkodzenia pliku bazy mechanizm `CorruptStateRecoveryBanner` natychmiast odtwarza dane z najświeższego snapshotu JSON.
  - Czysty wzorzec Outbox dla dwukierunkowej synchronizacji z Apple Watch.
- **Wady:** Minimalny narzut dyskowy na rotowane pliki JSON (~1.5 MB łącznie).

### Opcja B: Buforowanie w pamięci RAM / pliku tymczasowym
- **Opis:** Trzymanie kolejki zdarzeń w pamięci ulotnej i zapis do pliku dopiero przy wyjściu z aplikacji.
- **Wady:** Kategorycznie odrzucone. Ubicie aplikacji przez system iOS niszczy całą kolejkę zdarzeń.

---

## Decyzja i Uzasadnienie

Wybieramy **Opcję A (Transakcyjny SQLite + tabela `pending_ops` + rotacyjna autokopia JSON)**.
Zapewnia to bezwzględną realizację **Aksjomatu 11 (Aksjomat Zerowej Utraty Danych)**. Użytkownik ma gwarancję, że jego lata zapisków wypiekowych, notatek z prób zakwasowych i profili smakowych nigdy nie znikną w wyniku błędu systemu.

---

## Konsekwencje

- **Pozytywne:**
  - Zgodność ze standardem inżynierskim Apps4Craft T-012.
  - Gotowość architektoniczna pod bezproblemową integrację z Apple Watch (DEC-03, DEC-45) i Garminem (DEC-02).
- **Negatywne:**
  - Wymóg czyszczenia przetworzonych rekordów z `pending_ops` (`DELETE FROM pending_ops WHERE status = 'SYNCED';`).

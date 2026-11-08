# Scalanie (E2.1–E2.3) — M1 2026-11-08 — szkic przed weryfikacją przeciwną

Wejście: 14 raportów ról (13 ról + 05-b), tabela `scalanie-wejscie.txt`. Pozycji ról: 105 (P0 2, P1 35, P2 68; policzone z tabel podsumowań w `scalanie-wejscie.txt`, w tym 05-architekt-508 odrzucone decyzją D-273).

## Duplikaty (GEN-07): ta sama przyczyna → jedna pozycja
| Pozycja | ID źródłowe | Rola-właściciel |
|---|---|---|
| E2E na SHA kandydata czerwone (05-dwa-wypieki, arkusz zgody) | 07-jakosc-001, 01-odkrywanie-004, 02-monetyzacja-007, 03-zakres-009, 04-studio-projektowe-005, 05-architekt-005, 05-architekt-509, 06-tresci-004, 08-programista-005, 10-wydanie-002, 11-wzrost-003, 12-niezawodnosc-005 | 07 |
| Brak jednej kolejki zapisów (transakcje cofają się nawzajem, „Nie zapisano” przy zapisanych danych, import bez transakcji) | 05-architekt-001, 05-architekt-502, 08-programista-001 | 05 |
| Ekran Pro obiecuje „porównanie” wypieków, którego nie ma | 01-odkrywanie-001, 03-zakres-002 | 03 |
| Strona sklepu: funkcje Pro bez oznaczenia w tekście promocyjnym i opisie | 02-monetyzacja-001, 10-wydanie-005 | 10 |
| „15 receptur” w opisie sklepu, README, stronie (jest 26) | 01-odkrywanie-005, 10-wydanie-004, 11-wzrost-004 | 10 |
| Logika domeny importuje i18n/formatowanie (ADR-006) | 05-architekt-003, 05-architekt-506 | 05 |
| Cykle importów w warstwie danych, migracja v6 zależna od parsera | 05-architekt-004, 05-architekt-507 | 05 |
| Wybór Xcode w CI z cichym zjazdem | 07-jakosc-010, 10-wydanie-008 | 07 |
| Nieaktualne wyjątki BR→test ukrywają brak testów | 07-jakosc-006, 08-programista-007 | 07 |
Po scaleniu: 105 → 84 pozycje (21 duplikatów usuniętych w 9 grupach).

## Przyczyny systemowe (GEN-09)
- **SYS-01 — model D-112 nie dotarł do dokumentów źródłowych** (proces): BRD (01-odkrywanie-002), kontrakt zakresu (03-zakres-003), plan wzrostu (11-wzrost-001), `ceny.json` i dokumenty wydania (02-monetyzacja-005). Kolejność: dokumenty przed kodem i metadanymi.
- **SYS-02 — ścieżka zapisu bez serializacji** (brak mechanizmu): kolejka zapisów (05-architekt-001 i in.), podwójne „Dokarmione” (08-programista-006); ten sam mechanizm naprawiony wcześniej tylko dla `bake_sessions` (05-architekt-502: powraca → trwała kontrola w teście akceptacyjnym).
- **SYS-03 — bramki jakości deklarują więcej, niż egzekwują** (zasada 21): E2E czerwone przy wysłanym buildzie (07-jakosc-001, 07-jakosc-004), Nightly 0/22 (07-jakosc-002), `FC_NUM_RUNS` (07-jakosc-005), wyjątki BR (07-jakosc-006), tytuły testów pola dotyku (07-jakosc-008), Xcode (07-jakosc-010), Pages (07-jakosc-013), `zakres.mjs` 26 błędów przy deklarowanym 0 (03-zakres-003).
- **SYS-04 — sklep i ekrany obiecują inaczej niż aplikacja** (obietnice kontra kod): „porównanie” (01-odkrywanie-001), funkcje Pro bez oznaczenia (02-monetyzacja-001), zrzuty z Basic jako Pro i starym wyglądem (10-wydanie-001), „15 receptur” (10-wydanie-004), notatki dla App Review (10-wydanie-006), CSV bez BR (01-odkrywanie-006), „Sprzęt i naczynie” bez działania (03-zakres-004).
- **SYS-05 — liczby i wiedza w produkcie poza łańcuchem źródeł** (rejestr twierdzeń): 06-tresci-001, 06-tresci-002, 06-tresci-003, 06-tresci-005, 06-tresci-006, 01-odkrywanie-003, domyślne liczby przy imporcie (08-programista-003), dwa źródła zakresów pól (08-programista-004).
- **SYS-06 — zakres 1.0 rozszerzony po kontrakcie bez bramki zmian** (proces): 03-zakres-001, 03-zakres-005, 03-zakres-006, 03-zakres-007, 03-zakres-008; skutki w treści (06-tresci-001) i projekcie (04-studio-projektowe-003).

## Konflikty (GEN-08) → decyzje
- **DEC-01 (produktowa):** opis sklepu „26 receptur” (01-odkrywanie-005, 10-wydanie-004, 11-wzrost-004 zalecają liczbę z kodu) kontra 15 z 26 receptur bez planu i prowadzenia (03-zakres-005). Opcje: (a) „26 receptur, 11 z planem krok po kroku” w opisie; (b) dokończyć D-155 przed zgłoszeniem; (c) ukryć 15 receptur bez planu w 1.0.
- **DEC-02 (produktowa):** kalendarz/dwa wypieki/plany na kolejne dni bez bramki ZM (03-zakres-001) kontra D-092 właściciela. Opcje: (a) bramka ZM wstecz i wiersze F-nn w kontrakcie (bez zmian w kodzie); (b) ukryć w 1.0.
- **DEC-03 (merytoryczna, źródła):** temperatury i naczynia planu kontra „O recepturze” (06-tresci-001) i pizza 450 °C (06-tresci-002): rozstrzyga rola 06 źródłami.

- M1-audytor-generalny-015 (P1, P, rola-właściciel 03-zakres, commit M2 e8345215+69d895b8, decyzja DEC-04) — Ekran Pro obiecuje płatne „porównanie” wypieków, którego nie ma w aplikacji
  ID źródłowe: 01-odkrywanie-001, 03-zakres-002
  Raport audytu: K/role/01-odkrywanie/01-odkrywanie-2026-11-08.md
  Test akceptacyjny: ekran Pro nie obiecuje funkcji bez kodu (test: lista obietnic PaywallModal ↔ funkcje zablokowane w mapie Basic/Pro)
- M1-audytor-generalny-018 (P1, P, rola-właściciel 11-wzrost, commit M2 83235746, decyzja DEC-15) — Start bez kanału z odczytanym regulaminem, bez budżetu godzin i planu na złe przyjęcie
  ID źródłowe: 11-wzrost-002
  Raport audytu: K/role/11-wzrost/11-wzrost-2026-11-08.md
  Test akceptacyjny: jeden kanał startu z odczytanym regulaminem, budżet godzin i plan na złe przyjęcie w docs/wzrost.md (albo decyzja b z wyjątkiem)
- M1-audytor-generalny-054 (P2, P, rola-właściciel 02-monetyzacja, commit M2 69a1c258, decyzja DEC-06) — Bramka opłacalności liczy iOS + Google Play, a 1.0 jest tylko na iOS: wynik dla 1.0 to ok. 218, nie 345 USD
  ID źródłowe: 02-monetyzacja-002
  Raport audytu: K/role/02-monetyzacja/02-monetyzacja-2026-11-08.md
  Test akceptacyjny: test akceptacyjny z raportu źródłowego 02-monetyzacja-002 (pole „Test akceptacyjny”)
- M1-audytor-generalny-057 (P2, P, rola-właściciel 02-monetyzacja, commit M2 9a692b21, decyzja DEC-08) — Dokumenty wydania przeczą stanowi: `ceny.json` powołuje D-038 „bez propozycji zmian”, Z-1 raz „nie wykonane”, raz zrobione
  ID źródłowe: 02-monetyzacja-005
  Raport audytu: K/role/02-monetyzacja/02-monetyzacja-2026-11-08.md
  Test akceptacyjny: test akceptacyjny z raportu źródłowego 02-monetyzacja-005 (pole „Test akceptacyjny”)
- M1-audytor-generalny-058 (P2, P, rola-właściciel 03-zakres, commit M2 7526830d, decyzja DEC-02) — Kalendarz, plany na kolejne dni i dwa wypieki naraz działają na „Dziś” bez bramki ZM i bez wierszy w kontrakcie
  ID źródłowe: 03-zakres-001
  Raport audytu: K/role/03-zakres/03-zakres-2026-11-08.md
  Test akceptacyjny: test akceptacyjny z raportu źródłowego 03-zakres-001 (pole „Test akceptacyjny”)
- M1-audytor-generalny-059 (P2, D, rola-właściciel 03-zakres, commit M2 3bebc5ab+211649bf+3e0fa3fa) — Kontrakt opisuje model płatności z próbą (D-038) i nieaktualny ślad: `zakres.mjs` 26 błędów zamiast deklarowanych 0
  ID źródłowe: 03-zakres-003
  Raport audytu: K/role/03-zakres/03-zakres-2026-11-08.md
  Test akceptacyjny: test akceptacyjny z raportu źródłowego 03-zakres-003 (pole „Test akceptacyjny”)
- M1-audytor-generalny-060 (P2, D, rola-właściciel 03-zakres, commit M2 9174cd66) — Ustawienie „Sprzęt i naczynie do wypieku” obiecuje zmianę prowadzenia, a nic go nie czyta
  ID źródłowe: 03-zakres-004
  Raport audytu: K/role/03-zakres/03-zakres-2026-11-08.md
  Test akceptacyjny: test akceptacyjny z raportu źródłowego 03-zakres-004 (pole „Test akceptacyjny”)
- M1-audytor-generalny-061 (P2, P, rola-właściciel 03-zakres, commit M2 e58a3ac1, decyzja DEC-01) — Trzecia czynność startu prowadzi do receptur bez planu i prowadzenia: 15 z 26 receptur bazowych (D-155 wykonane częściowo)
  ID źródłowe: 03-zakres-005
  Raport audytu: K/role/03-zakres/03-zakres-2026-11-08.md
  Test akceptacyjny: test akceptacyjny z raportu źródłowego 03-zakres-005 (pole „Test akceptacyjny”)
- M1-audytor-generalny-062 (P2, P, rola-właściciel 03-zakres, commit M2 6caf322b, decyzja DEC-09) — Część funkcji Pro i tryb maszyny stoi na samej hipotezie bez zapisanego wyjątku i warunku oceny
  ID źródłowe: 03-zakres-006
  Raport audytu: K/role/03-zakres/03-zakres-2026-11-08.md
  Test akceptacyjny: test akceptacyjny z raportu źródłowego 03-zakres-006 (pole „Test akceptacyjny”)
- M1-audytor-generalny-064 (P2, P, rola-właściciel 03-zakres, commit M2 1f5eac3a+f34b06fd, decyzja DEC-09) — Apetyt i koszt właściciela nieprzeliczone po rozszerzeniach 1.0 (kontrakt: 68 h wobec 60 h, bez pakietów D-092 i D-150)
  ID źródłowe: 03-zakres-008
  Raport audytu: K/role/03-zakres/03-zakres-2026-11-08.md
  Test akceptacyjny: test akceptacyjny z raportu źródłowego 03-zakres-008 (pole „Test akceptacyjny”)
- M1-audytor-generalny-065 (P2, P, rola-właściciel 03-zakres, commit M2 7f520c7b, decyzja DEC-19) — Diagnoza Doktora chleba nie przechodzi na następny wypiek: „Piecz ponownie” pokazuje tylko notatkę użytkownika (linia bazowa, weryfikacja G9 H4)
  ID źródłowe: M1-audytor-generalny-065
  Raport audytu: K/weryfikacja/G9-luki.md
  Test akceptacyjny: test akceptacyjny z raportu źródłowego M1-audytor-generalny-065 (pole „Test akceptacyjny”)
- M1-audytor-generalny-084 (P2, P, rola-właściciel 11-wzrost, commit M2 14e5f546, decyzja DEC-16) — H-01: minimalna próba bez ID decyzji właściciela, data oceny już nieosiągalna
  ID źródłowe: 11-wzrost-005
  Raport audytu: K/role/11-wzrost/11-wzrost-2026-11-08.md
  Test akceptacyjny: test akceptacyjny z raportu źródłowego 11-wzrost-005 (pole „Test akceptacyjny”)

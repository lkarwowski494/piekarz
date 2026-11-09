- M1-audytor-generalny-016 (P1, D, rola-właściciel 07-jakosc, commit M2 f38f9e63+5589c91e) — Koniec wypieku (wpis w Dzienniku, ocena, kopia automatyczna) bez scenariusza E2E i bez punktu listy telefonu
  ID źródłowe: 07-jakosc-003
  Raport audytu: K/role/07-jakosc/07-jakosc-2026-11-08.md
  Test akceptacyjny: scenariusz E2E koniec wypieku → ocena → wpis w Dzienniku → kopia automatyczna; punkt na liście telefonu; błąd kopii automatycznej nie jest połykany
- M1-audytor-generalny-066 (P2, D, rola-właściciel 07-jakosc, commit M2 E2E run 42653620839 @221318bf (success: pl_PL, en_US, kontrola negatywna, Basic)) — iOS E2E na SHA kandydata czerwone; po porażce pominięte en_US, kontrola negatywna i cały zestaw Basic (znane: E2E-95, D-279, D-280)
  ID źródłowe: 07-jakosc-001, 01-odkrywanie-004, 02-monetyzacja-007, 03-zakres-009, 04-studio-projektowe-005, 05-architekt-005, 05-architekt-509, 06-tresci-004, 08-programista-005, 10-wydanie-002, 11-wzrost-003, 12-niezawodnosc-005
  Raport audytu: K/role/07-jakosc/07-jakosc-2026-11-08.md
  Test akceptacyjny: E2E zielone na SHA kandydata po scaleniu E2E-95 (pl, en_US, kontrola negatywna, Basic)
- M1-audytor-generalny-067 (P2, D, rola-właściciel 07-jakosc, commit M2 c0614ee9) — Nightly bez zielonego przebiegu na master; Stryker przerywany limitem od 2026-10-22, bramka mutacyjna bez wyniku
  ID źródłowe: 07-jakosc-002
  Raport audytu: K/role/07-jakosc/07-jakosc-2026-11-08.md
  Test akceptacyjny: test akceptacyjny z raportu źródłowego 07-jakosc-002 (pole „Test akceptacyjny”)
- M1-audytor-generalny-068 (P2, P, rola-właściciel 07-jakosc, commit M2 fa679f03+6a412c9a, decyzja DEC-18) — Build TestFlight nie sprawdza wyniku E2E na tym samym SHA; 1023 wysłany po czerwonym E2E #96
  ID źródłowe: 07-jakosc-004
  Raport audytu: K/role/07-jakosc/07-jakosc-2026-11-08.md
  Test akceptacyjny: test akceptacyjny z raportu źródłowego 07-jakosc-004 (pole „Test akceptacyjny”)
- M1-audytor-generalny-069 (P2, D, rola-właściciel 07-jakosc, commit M2 cd6a097e) — Krok nightly „1000 runs” biegnie z tą samą liczbą przypadków co CI; `FC_NUM_RUNS` nie działa
  ID źródłowe: 07-jakosc-005
  Raport audytu: K/role/07-jakosc/07-jakosc-2026-11-08.md
  Test akceptacyjny: test akceptacyjny z raportu źródłowego 07-jakosc-005 (pole „Test akceptacyjny”)
- M1-audytor-generalny-070 (P2, D, rola-właściciel 07-jakosc, commit M2 6ed7109e) — Wyjątki `br-wyjatki.json` z nieaktualnym powodem „bez kodu” ukrywają brak testów z ID dla wdrożonych scenariuszy
  ID źródłowe: 07-jakosc-006, 08-programista-007
  Raport audytu: K/role/07-jakosc/07-jakosc-2026-11-08.md
  Test akceptacyjny: test akceptacyjny z raportu źródłowego 07-jakosc-006 (pole „Test akceptacyjny”)
- M1-audytor-generalny-071 (P2, D, rola-właściciel 07-jakosc, commit M2 221318bf) — Przeżyły mutanty: brak ROLLBACK po nieudanej migracji i granica 1 oz w formacie USA
  ID źródłowe: 07-jakosc-007
  Raport audytu: K/role/07-jakosc/07-jakosc-2026-11-08.md
  Test akceptacyjny: test akceptacyjny z raportu źródłowego 07-jakosc-007 (pole „Test akceptacyjny”)
- M1-audytor-generalny-072 (P2, D, rola-właściciel 07-jakosc, commit M2 40c4a011) — 24 tytuły testów deklarują pole dotyku i 320 pt, a sprawdzają styl
  ID źródłowe: 07-jakosc-008
  Raport audytu: K/role/07-jakosc/07-jakosc-2026-11-08.md
  Test akceptacyjny: test akceptacyjny z raportu źródłowego 07-jakosc-008 (pole „Test akceptacyjny”)
- M1-audytor-generalny-073 (P2, D, rola-właściciel 07-jakosc, commit M2 1590999f) — README i nazwa testu nazywają korpus Pythona niezależną wyrocznią
  ID źródłowe: 07-jakosc-009
  Raport audytu: K/role/07-jakosc/07-jakosc-2026-11-08.md
  Test akceptacyjny: test akceptacyjny z raportu źródłowego 07-jakosc-009 (pole „Test akceptacyjny”)
- M1-audytor-generalny-075 (P2, D, rola-właściciel 07-jakosc, commit M2 550fc6b1) — E2E bez zrzutów punktów kontrolnych; jedna porażka ukrywa wynik pozostałych kroków
  ID źródłowe: 07-jakosc-011
  Raport audytu: K/role/07-jakosc/07-jakosc-2026-11-08.md
  Test akceptacyjny: test akceptacyjny z raportu źródłowego 07-jakosc-011 (pole „Test akceptacyjny”)
- M1-audytor-generalny-077 (P2, D, rola-właściciel 07-jakosc, commit M2 86efd997) — Workflow „Deploy GitHub Pages” z czerwonym ostatnim przebiegiem na master i bez możliwości sukcesu
  ID źródłowe: 07-jakosc-013
  Raport audytu: K/role/07-jakosc/07-jakosc-2026-11-08.md
  Test akceptacyjny: test akceptacyjny z raportu źródłowego 07-jakosc-013 (pole „Test akceptacyjny”)
- M1-audytor-generalny-078 (P2, P, rola-właściciel 10-wydanie, commit M2 a6d8013c, 1d7c3fc0, decyzja DEC-05) — Strona sklepu reklamuje funkcje Pro (plan wstecz, opieka nad zakwasem) bez oznaczenia, że wymagają zakupu
  ID źródłowe: 02-monetyzacja-001, 10-wydanie-005
  Raport audytu: K/role/02-monetyzacja/02-monetyzacja-2026-11-08.md
  Test akceptacyjny: test akceptacyjny z raportu źródłowego 02-monetyzacja-001 (pole „Test akceptacyjny”)
- M1-audytor-generalny-079 (P2, D, rola-właściciel 10-wydanie, commit M2 13a32139) — Dziennik wydań bez buildu 1023 i bez Z-1; plan wydania i blokady nieaktualne
  ID źródłowe: 10-wydanie-003
  Raport audytu: K/role/10-wydanie/10-wydanie-2026-11-08.md
  Test akceptacyjny: test akceptacyjny z raportu źródłowego 10-wydanie-003 (pole „Test akceptacyjny”)
- M1-audytor-generalny-080 (P2, P, rola-właściciel 10-wydanie, commit M2 6a6b410e, 1d7c3fc0, decyzja DEC-01) — Opis sklepu we wszystkich lokalizacjach: „15 receptur” zamiast 26, brak trybu maszyny i wersji drożdżowych
  ID źródłowe: 10-wydanie-004, 01-odkrywanie-005, 11-wzrost-004
  Raport audytu: K/role/10-wydanie/10-wydanie-2026-11-08.md
  Test akceptacyjny: test akceptacyjny z raportu źródłowego 10-wydanie-004 (pole „Test akceptacyjny”)
- M1-audytor-generalny-081 (P2, D, rola-właściciel 10-wydanie, commit M2 2d426037) — Notatki dla App Review nie prowadzą do trybu maszyny do chleba ani wersji drożdżowej
  ID źródłowe: 10-wydanie-006
  Raport audytu: K/role/10-wydanie/10-wydanie-2026-11-08.md
  Test akceptacyjny: test akceptacyjny z raportu źródłowego 10-wydanie-006 (pole „Test akceptacyjny”)
- M1-audytor-generalny-082 (P2, P, rola-właściciel 10-wydanie, commit M2 0ddecf89, a57d6de2, decyzja DEC-14) — Klucz App Store Connect z rolą co najmniej App Manager trafia do każdego buildu TestFlight, wspólny z inną aplikacją, bez procedury unieważnienia
  ID źródłowe: 10-wydanie-007
  Raport audytu: K/role/10-wydanie/10-wydanie-2026-11-08.md
  Test akceptacyjny: test akceptacyjny z raportu źródłowego 10-wydanie-007 (pole „Test akceptacyjny”)

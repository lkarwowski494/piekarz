- M1-audytor-generalny-004 (P1, M, rola-właściciel 01-odkrywanie, commit M2 4af7c631) — Faza zakwasu („w szacowanym oknie szczytu”) liczona z reguły bez źródła, wbrew BR-ZAKW-003
  ID źródłowe: 01-odkrywanie-003
  Raport audytu: K/role/01-odkrywanie/01-odkrywanie-2026-11-08.md
  Test akceptacyjny: faza zakwasu bez okna szczytu bez źródła: przy showPeakWindow={false} karta nie pokazuje „W szacowanym oknie szczytu”; reguła ma twierdzenie w rejestrze albo znika
- M1-audytor-generalny-008 (P1, M, rola-właściciel 06-tresci, commit M2 49a83170, decyzja DEC-03) — Plan i prowadzenie podają inne temperatury, czasy i naczynie pieczenia niż „O recepturze” tej samej receptury
  ID źródłowe: 06-tresci-001
  Raport audytu: K/role/06-tresci/06-tresci-2026-11-08.md
  Test akceptacyjny: temperatury, czasy i naczynie w planie i prowadzeniu zgodne z danymi receptury dla 8 receptur pszennych na zakwasie; test porównujący plan z kartą receptury
- M1-audytor-generalny-009 (P1, M, rola-właściciel 06-tresci, commit M2 944c1808, decyzja DEC-03) — Pizza: 450 °C przez 2 min, wbrew przepisowi źródłowemu receptury i poza zasięgiem domowego piekarnika
  ID źródłowe: 06-tresci-002
  Raport audytu: K/role/06-tresci/06-tresci-2026-11-08.md
  Test akceptacyjny: pizza: temperatura i czas zgodne ze źródłem receptury i domowym piekarnikiem, twierdzenie w rejestrze
- M1-audytor-generalny-010 (P1, M, rola-właściciel 06-tresci, commit M2 e57cef29) — Teksty głównego przepływu (plan, prowadzenie, receptury bazowe, ostrzeżenie DDT) bez twierdzeń w rejestrze; superlatywy i przyczyny bez źródła
  ID źródłowe: 06-tresci-003
  Raport audytu: K/role/06-tresci/06-tresci-2026-11-08.md
  Test akceptacyjny: kontrole-tresci w kierunku odwrotnym (tekst → twierdzenie) dają 0 tekstów z liczbą bez twierdzenia w częściach widocznych w 1.0
- M1-audytor-generalny-034 (P2, D, rola-właściciel 01-odkrywanie, commit M2 4de29436) — Wymagania BRD nadal opisują okres próbny 14 dni; BR-RECP-003 przeczy D-112 i kodowi
  ID źródłowe: 01-odkrywanie-002
  Raport audytu: K/role/01-odkrywanie/01-odkrywanie-2026-11-08.md
  Test akceptacyjny: test akceptacyjny z raportu źródłowego 01-odkrywanie-002 (pole „Test akceptacyjny”)
- M1-audytor-generalny-035 (P2, D, rola-właściciel 01-odkrywanie, commit M2 58b65480) — Eksport historii do CSV (obiecany w sklepie) i kopiowanie do schowka bez wymagania BR
  ID źródłowe: 01-odkrywanie-006
  Raport audytu: K/role/01-odkrywanie/01-odkrywanie-2026-11-08.md
  Test akceptacyjny: test akceptacyjny z raportu źródłowego 01-odkrywanie-006 (pole „Test akceptacyjny”)
- M1-audytor-generalny-037 (P2, D, rola-właściciel 01-odkrywanie, commit M2 b8a8f0d2) — BRD po 2026-11-03 bez erraty: katalog „około 30” zamiast 26 (D-236), opis progów OP-39 sprzed zmiany kodu
  ID źródłowe: 01-odkrywanie-008
  Raport audytu: K/role/01-odkrywanie/01-odkrywanie-2026-11-08.md
  Test akceptacyjny: test akceptacyjny z raportu źródłowego 01-odkrywanie-008 (pole „Test akceptacyjny”)
- M1-audytor-generalny-040 (P2, M, rola-właściciel 06-tresci, commit M2 d1f2166f) — Przelicznik drożdży 0,35 w produkcie poza łańcuchem treści; źródła poza ekranem „Źródła wiedzy”; brak wskazówki o drożdżach aktywnych
  ID źródłowe: 06-tresci-005
  Raport audytu: K/role/06-tresci/06-tresci-2026-11-08.md
  Test akceptacyjny: test akceptacyjny z raportu źródłowego 06-tresci-005 (pole „Test akceptacyjny”)
- M1-audytor-generalny-041 (P2, M, rola-właściciel 06-tresci, commit M2 ef9dd782) — Przekłady nazw mąk podają odpowiedniki bez źródła (MAK-EN-900 otwarte), niespójne w jednym języku
  ID źródłowe: 06-tresci-006
  Raport audytu: K/role/06-tresci/06-tresci-2026-11-08.md
  Test akceptacyjny: test akceptacyjny z raportu źródłowego 06-tresci-006 (pole „Test akceptacyjny”)
- M1-audytor-generalny-044 (P2, D, rola-właściciel 06-tresci, commit M2 d4d1d40d) — Tekst w produkcie inny niż w `docs/tresci`; znaczniki `[T:…,-]` w ja/ko/zh-Hant; skrypt kontroli w repo starszy od modułu
  ID źródłowe: 06-tresci-009
  Raport audytu: K/role/06-tresci/06-tresci-2026-11-08.md
  Test akceptacyjny: test akceptacyjny z raportu źródłowego 06-tresci-009 (pole „Test akceptacyjny”)

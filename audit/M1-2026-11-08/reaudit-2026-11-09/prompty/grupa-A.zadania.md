- M1-audytor-generalny-001 (P1, D, rola-właściciel 05-architekt, commit M2 b069827f) — Zapisy bez jednej kolejki: równoległy zapis łamie atomowość importu, „Usuń wszystkie dane” i zapisu zakwasu
  ID źródłowe: 05-architekt-001, 05-architekt-502, 08-programista-001
  Raport audytu: K/role/05-architekt/05-architekt-2026-11-08.md
  Test akceptacyjny: test współbieżności na prawdziwym SQLite: import kopii, „Usuń wszystkie dane” i zapis zakwasu przy równoległym zapisie i wymuszonym błędzie zostawiają dane albo w całości nowe, albo w całości stare; „Nie zapisano” tylko przy braku zapisu; trwała kontrola: lint/test zabraniający withTransactionAsync poza kolejką (powraca: M3 D1b P2-1)
- M1-audytor-generalny-002 (P1, D, rola-właściciel 05-architekt, commit M2 9feae565) — Usunięte albo poprawione dokarmienie wraca po zapisie profilu lub stałego dnia zakwasu
  ID źródłowe: 05-architekt-501
  Raport audytu: K/role/05-architekt-b/05-architekt-2026-11-08.md
  Test akceptacyjny: usunięte i poprawione dokarmienie nie wraca po zapisie profilu ani stałego dnia zakwasu (test na prawdziwym SQLite, sonda z 05-architekt-501)
- M1-audytor-generalny-003 (P1, P, rola-właściciel 12-niezawodnosc, commit M2 26f6a87f, decyzja DEC-17) — Tryb awaryjny daje plik, którego aplikacja nie przyjmie, bez kontaktu i bez ostrzeżenia przed usunięciem aplikacji
  ID źródłowe: 12-niezawodnosc-001
  Raport audytu: K/role/12-niezawodnosc/12-niezawodnosc-2026-11-08.md
  Test akceptacyjny: pakiet z trybu awaryjnego jest rozpoznawany i przywracany przez import (albo, przy opcji b, ekran awaryjny ostrzega przed usunięciem aplikacji i podaje kontakt); test rozpoznajPlik
- M1-audytor-generalny-019 (P2, D, rola-właściciel 05-architekt, commit M2 d59f8226) — Runner migracji nie ma bezpiecznej drogi przebudowy tabeli: pierwsza taka migracja skasuje dziennik zakwasu bez błędu
  ID źródłowe: 05-architekt-002
  Raport audytu: K/role/05-architekt/05-architekt-2026-11-08.md
  Test akceptacyjny: test akceptacyjny z raportu źródłowego 05-architekt-002 (pole „Test akceptacyjny”)
- M1-audytor-generalny-020 (P2, D, rola-właściciel 05-architekt, commit M2 259f0880) — Logika domeny `src/core` importuje i18n, formatowanie (React, expo-localization) i katalog receptur wbrew granicy z ADR-006
  ID źródłowe: 05-architekt-003, 05-architekt-506
  Raport audytu: K/role/05-architekt/05-architekt-2026-11-08.md
  Test akceptacyjny: test akceptacyjny z raportu źródłowego 05-architekt-003 (pole „Test akceptacyjny”)
- M1-audytor-generalny-021 (P2, D, rola-właściciel 05-architekt, commit M2 91a26110) — Cykl importów w warstwie danych; wydana migracja v6 zależy od żywego parsera sesji
  ID źródłowe: 05-architekt-004, 05-architekt-507
  Raport audytu: K/role/05-architekt/05-architekt-2026-11-08.md
  Test akceptacyjny: test akceptacyjny z raportu źródłowego 05-architekt-004 (pole „Test akceptacyjny”)
- M1-audytor-generalny-022 (P2, D, rola-właściciel 05-architekt, commit M2 0d47bab2) — Powrót aplikacji na pierwszy plan w trakcie kopii przed migracją kończy się ekranem błędu bazy mimo udanej migracji
  ID źródłowe: 05-architekt-503
  Raport audytu: K/role/05-architekt-b/05-architekt-2026-11-08.md
  Test akceptacyjny: test akceptacyjny z raportu źródłowego 05-architekt-503 (pole „Test akceptacyjny”)
- M1-audytor-generalny-023 (P2, P, rola-właściciel 05-architekt, commit M2 2dceaeeb, decyzja DEC-11) — „Usuń wszystkie dane” kasuje trwające i zaplanowane wypieki, których nie ma w obiecanej „kopii obecnych danych”
  ID źródłowe: 05-architekt-504
  Raport audytu: K/role/05-architekt-b/05-architekt-2026-11-08.md
  Test akceptacyjny: test akceptacyjny z raportu źródłowego 05-architekt-504 (pole „Test akceptacyjny”)
- M1-audytor-generalny-024 (P2, M, rola-właściciel 05-architekt, commit M2 4c542e20) — ADR-001/003/005 i `system-architecture.md` opisują nieistniejącą architekturę i fałszywą ochronę przed `0xdead10cc`
  ID źródłowe: 05-architekt-505
  Raport audytu: K/role/05-architekt-b/05-architekt-2026-11-08.md
  Test akceptacyjny: test akceptacyjny z raportu źródłowego 05-architekt-505 (pole „Test akceptacyjny”)
- M1-audytor-generalny-025 (P2, D, rola-właściciel 08-programista, commit M2 cf0de762) — Pasek tygodnia na „Dziś” zostaje na starym tygodniu po północy z niedzieli na poniedziałek
  ID źródłowe: 08-programista-002
  Raport audytu: K/role/08-programista/08-programista-2026-11-08.md
  Test akceptacyjny: test akceptacyjny z raportu źródłowego 08-programista-002 (pole „Test akceptacyjny”)
- M1-audytor-generalny-026 (P2, D, rola-właściciel 08-programista, commit M2 8cedbade) — Brakujące dane zastępowane zgadniętą wartością: „Ostatnie dokarmienie: przed chwilą” bez dokarmienia, brak oceny liczony jako 5★, domyślne liczby przy imporcie receptury
  ID źródłowe: 08-programista-003
  Raport audytu: K/role/08-programista/08-programista-2026-11-08.md
  Test akceptacyjny: test akceptacyjny z raportu źródłowego 08-programista-003 (pole „Test akceptacyjny”)
- M1-audytor-generalny-027 (P2, D, rola-właściciel 08-programista, commit M2 c685a636) — Zakresy pól receptury w dwóch miejscach z różnymi wartościami: receptury zapisanej w aplikacji nie da się udostępnić ani zaimportować
  ID źródłowe: 08-programista-004
  Raport audytu: K/role/08-programista/08-programista-2026-11-08.md
  Test akceptacyjny: test akceptacyjny z raportu źródłowego 08-programista-004 (pole „Test akceptacyjny”)
- M1-audytor-generalny-028 (P2, D, rola-właściciel 08-programista, commit M2 a13c842c) — Dwa stuknięcia „Dokarmione” zapisują dwa dokarmienia
  ID źródłowe: 08-programista-006
  Raport audytu: K/role/08-programista/08-programista-2026-11-08.md
  Test akceptacyjny: test akceptacyjny z raportu źródłowego 08-programista-006 (pole „Test akceptacyjny”)
- M1-audytor-generalny-030 (P2, D, rola-właściciel 08-programista, commit M2 d74e40c0) — Przy nadmiarze powiadomień priorytet idzie po grupie, nie po czasie: karmienie za 2 h może wypaść przed krokiem za 29 h (weryfikacja G9 H2, limit 40)
  ID źródłowe: M1-audytor-generalny-030
  Raport audytu: K/weryfikacja/G9-luki.md
  Test akceptacyjny: test akceptacyjny z raportu źródłowego M1-audytor-generalny-030 (pole „Test akceptacyjny”)
- M1-audytor-generalny-031 (P2, D, rola-właściciel 12-niezawodnosc, commit M2 e3c23559) — Wiadomość do autora nigdy nie zawiera numeru buildu; test maskuje to atrapą
  ID źródłowe: 12-niezawodnosc-002
  Raport audytu: K/role/12-niezawodnosc/12-niezawodnosc-2026-11-08.md
  Test akceptacyjny: test akceptacyjny z raportu źródłowego 12-niezawodnosc-002 (pole „Test akceptacyjny”)
- M1-audytor-generalny-033 (P2, D, rola-właściciel 12-niezawodnosc, commit M2 f7cfd76f) — Kopie ratunkowe udostępniane bez `integrity_check`; awaryjna kopia surowych plików przy otwartym połączeniu
  ID źródłowe: 12-niezawodnosc-004
  Raport audytu: K/role/12-niezawodnosc/12-niezawodnosc-2026-11-08.md
  Test akceptacyjny: test akceptacyjny z raportu źródłowego 12-niezawodnosc-004 (pole „Test akceptacyjny”)

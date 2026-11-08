# Audyt: Audytor Generalny — Piekarz — 2026-11-08
Commit: 2ef8870a525485cc1ac57e5abe9d97d9937dfe42 (tag v1.0.0-b1023, build 1023 w TestFlight) · Tryb: audit, wariant głęboki · Środowisko: Linux w chmurze, Node 22, Playwright; bez macOS, Xcode i telefonu (zachowanie na urządzeniu: test telefonu właściciela, D-226/D-277) · Katalog przebiegu K: `audit/M1-2026-11-08/`

## Podsumowanie
Kandydat 1.0 jest na dobrym kursie: główna praca (liczenie, plan wstecz, prowadzenie z powiadomieniem przy zablokowanym telefonie, zakwas, Doktor, dziennik) działa w kodzie i jest dobrze pokryta testami (574 zestawy, 6017 testów, kod 0). Weryfikacja przeciwna obaliła obawy o powiadomienia (uzgadnianie po każdym kroku, limit 40 poniżej 64 iOS, baner przy braku zgody). **Stan: ZABLOKOWANE** do zgłoszenia przez 18 potwierdzonych P1 (0 P0). Najpoważniejsze: brak jednej kolejki zapisów (utrata danych przy równoległym zapisie, odtworzona przez trzy niezależne przebiegi), powracające usunięte dokarmienie, rozjazdy temperatur i czasów pieczenia ze źródłami, zrzuty i ekran Pro obiecujące inaczej niż aplikacja oraz ekran prowadzenia, na którym ostrzeżenie bezpieczeństwa wypada poza pierwszy ekran. Decyzje: 19 do wyboru (DEC-01…DEC-19), rekomendacje niżej. Testy właściciela na buildzie 1023 mogą iść dalej.

Pozycje ról: 105 (P0 2, P1 35, P2 68) → po scaleniu 84 → po weryfikacji przeciwnej i dopisaniu 2 pozycji z linii bazowej: **86 pozycji, P0 0, P1 18, P2 66, odrzucone 2**.

| ID | Poziom | Rodzaj | Tytuł | Status |
|---|---|---|---|---|
| M1-audytor-generalny-001 | P1 | D | Zapisy bez jednej kolejki: równoległy zapis łamie atomowość importu, „Usuń wszystkie dane” i zapisu zakwasu (źródła: 05-architekt-001, 05-architekt-502, 08-programista-001) | otwarte |
| M1-audytor-generalny-002 | P1 | D | Usunięte albo poprawione dokarmienie wraca po zapisie profilu lub stałego dnia zakwasu (źródła: 05-architekt-501) | otwarte |
| M1-audytor-generalny-003 | P1 | P | Tryb awaryjny daje plik, którego aplikacja nie przyjmie, bez kontaktu i bez ostrzeżenia przed usunięciem aplikacji (źródła: 12-niezawodnosc-001) | otwarte |
| M1-audytor-generalny-004 | P1 | M | Faza zakwasu („w szacowanym oknie szczytu”) liczona z reguły bez źródła, wbrew BR-ZAKW-003 (źródła: 01-odkrywanie-003) | otwarte |
| M1-audytor-generalny-005 | P1 | D | Na prowadzeniu instrukcja kroku i ostrzeżenie bezpieczeństwa są pod pasem, poza pierwszym ekranem (źródła: 04-studio-projektowe-001) | otwarte |
| M1-audytor-generalny-006 | P1 | D | Stuknięcie kroku w arkuszu „Plan wypieku” przestawia trwający wypiek bez pytania i bez cofnięcia (źródła: 04-studio-projektowe-002) | otwarte |
| M1-audytor-generalny-007 | P1 | P | Siedem arkuszy poza systemem kart (D-139, D-141), w tym „Plan wypieku” z gołym nagłówkiem (źródła: 04-studio-projektowe-003) | otwarte |
| M1-audytor-generalny-008 | P1 | M | Plan i prowadzenie podają inne temperatury, czasy i naczynie pieczenia niż „O recepturze” tej samej receptury (źródła: 06-tresci-001) | otwarte |
| M1-audytor-generalny-009 | P1 | M | Pizza: 450 °C przez 2 min, wbrew przepisowi źródłowemu receptury i poza zasięgiem domowego piekarnika (źródła: 06-tresci-002) | otwarte |
| M1-audytor-generalny-010 | P1 | M | Teksty głównego przepływu (plan, prowadzenie, receptury bazowe, ostrzeżenie DDT) bez twierdzeń w rejestrze; superlatywy i przyczyny bez źródła (źródła: 06-tresci-003) | otwarte |
| M1-audytor-generalny-011 | P1 | D | Zdania krytyczne maszyny i katalogu w 21 językach bez kontroli (a) i bez drugiego przeglądu AI (źródła: 09-lokalizacja-001) | otwarte |
| M1-audytor-generalny-012 | P1 | D | Ekran awaryjny po dwóch nieudanych startach jest zawsze po polsku (źródła: 09-lokalizacja-002) | otwarte |
| M1-audytor-generalny-013 | P1 | D | Przeliczanie jednostek w tekście psuje liczby: „400 °F, czyli około 399 °F”, „0,04 oz” ciasta (źródła: 09-lokalizacja-003) | otwarte |
| M1-audytor-generalny-014 | P1 | D | 15 tekstów głównego przepływu po angielsku w 33 językach (ekran miesza języki) (źródła: 09-lokalizacja-005) | otwarte |
| M1-audytor-generalny-015 | P1 | P | Ekran Pro obiecuje płatne „porównanie” wypieków, którego nie ma w aplikacji (źródła: 01-odkrywanie-001, 03-zakres-002) | otwarte |
| M1-audytor-generalny-016 | P1 | D | Koniec wypieku (wpis w Dzienniku, ocena, kopia automatyczna) bez scenariusza E2E i bez punktu listy telefonu (źródła: 07-jakosc-003) | otwarte |
| M1-audytor-generalny-017 | P1 | D | Zrzuty do wysyłki (i `pl` w App Store Connect) oznaczają funkcje Basic jako płatne i pokazują interfejs sprzed M3 (źródła: 10-wydanie-001) | otwarte |
| M1-audytor-generalny-018 | P1 | P | Start bez kanału z odczytanym regulaminem, bez budżetu godzin i planu na złe przyjęcie (źródła: 11-wzrost-002) | otwarte |
| M1-audytor-generalny-019 | P2 | D | Runner migracji nie ma bezpiecznej drogi przebudowy tabeli: pierwsza taka migracja skasuje dziennik zakwasu bez błędu (źródła: 05-architekt-002) | otwarte |
| M1-audytor-generalny-020 | P2 | D | Logika domeny `src/core` importuje i18n, formatowanie (React, expo-localization) i katalog receptur wbrew granicy z ADR-006 (źródła: 05-architekt-003, 05-architekt-506) | otwarte |
| M1-audytor-generalny-021 | P2 | D | Cykl importów w warstwie danych; wydana migracja v6 zależy od żywego parsera sesji (źródła: 05-architekt-004, 05-architekt-507) | otwarte |
| M1-audytor-generalny-022 | P2 | D | Powrót aplikacji na pierwszy plan w trakcie kopii przed migracją kończy się ekranem błędu bazy mimo udanej migracji (źródła: 05-architekt-503) | otwarte |
| M1-audytor-generalny-023 | P2 | P | „Usuń wszystkie dane” kasuje trwające i zaplanowane wypieki, których nie ma w obiecanej „kopii obecnych danych” (źródła: 05-architekt-504) | otwarte |
| M1-audytor-generalny-024 | P2 | M | ADR-001/003/005 i `system-architecture.md` opisują nieistniejącą architekturę i fałszywą ochronę przed `0xdead10cc` (źródła: 05-architekt-505) | otwarte |
| M1-audytor-generalny-025 | P2 | D | Pasek tygodnia na „Dziś” zostaje na starym tygodniu po północy z niedzieli na poniedziałek (źródła: 08-programista-002) | otwarte |
| M1-audytor-generalny-026 | P2 | D | Brakujące dane zastępowane zgadniętą wartością: „Ostatnie dokarmienie: przed chwilą” bez dokarmienia, brak oceny liczony jako 5★, domyślne liczby przy imporcie receptury (źródła: 08-programista-003) | otwarte |
| M1-audytor-generalny-027 | P2 | D | Zakresy pól receptury w dwóch miejscach z różnymi wartościami: receptury zapisanej w aplikacji nie da się udostępnić ani zaimportować (źródła: 08-programista-004) | otwarte |
| M1-audytor-generalny-028 | P2 | D | Dwa stuknięcia „Dokarmione” zapisują dwa dokarmienia (źródła: 08-programista-006) | otwarte |
| M1-audytor-generalny-029 | P2 | D | Część odczytów z bazy bez parsowania (typ wiersza z generyka, `as`) (źródła: 08-programista-008) | otwarte |
| M1-audytor-generalny-030 | P2 | D | Przy nadmiarze powiadomień priorytet idzie po grupie, nie po czasie: karmienie za 2 h może wypaść przed krokiem za 29 h (weryfikacja G9 H2, limit 40) (źródła: M1-audytor-generalny-030) | otwarte |
| M1-audytor-generalny-031 | P2 | D | Wiadomość do autora nigdy nie zawiera numeru buildu; test maskuje to atrapą (źródła: 12-niezawodnosc-002) | otwarte |
| M1-audytor-generalny-032 | P2 | D | Build 1023 (i 1021) bez dSYM dla React, ReactNativeDependencies i hermesvm (źródła: 12-niezawodnosc-003) | otwarte |
| M1-audytor-generalny-033 | P2 | D | Kopie ratunkowe udostępniane bez `integrity_check`; awaryjna kopia surowych plików przy otwartym połączeniu (źródła: 12-niezawodnosc-004) | otwarte |
| M1-audytor-generalny-034 | P2 | D | Wymagania BRD nadal opisują okres próbny 14 dni; BR-RECP-003 przeczy D-112 i kodowi (źródła: 01-odkrywanie-002) | otwarte |
| M1-audytor-generalny-035 | P2 | D | Eksport historii do CSV (obiecany w sklepie) i kopiowanie do schowka bez wymagania BR (źródła: 01-odkrywanie-006) | otwarte |
| M1-audytor-generalny-036 | P2 | D | Kod powołuje się na wycofane numery RD (RD-00…RD-13), a RD-19 w kodzie znaczy coś innego niż w BRD (źródła: 01-odkrywanie-007) | otwarte |
| M1-audytor-generalny-037 | P2 | D | BRD po 2026-11-03 bez erraty: katalog „około 30” zamiast 26 (D-236), opis progów OP-39 sprzed zmiany kodu (źródła: 01-odkrywanie-008) | otwarte |
| M1-audytor-generalny-038 | P2 | D | Rozmiary tekstu i promienie wpisane liczbami poza tokenami, w tym 10 pt na osi czasu planu (źródła: 04-studio-projektowe-004) | otwarte |
| M1-audytor-generalny-039 | P2 | D | Własny przełącznik przypomnień zamiast systemowego (źródła: 04-studio-projektowe-006) | otwarte |
| M1-audytor-generalny-040 | P2 | M | Przelicznik drożdży 0,35 w produkcie poza łańcuchem treści; źródła poza ekranem „Źródła wiedzy”; brak wskazówki o drożdżach aktywnych (źródła: 06-tresci-005) | otwarte |
| M1-audytor-generalny-041 | P2 | M | Przekłady nazw mąk podają odpowiedniki bez źródła (MAK-EN-900 otwarte), niespójne w jednym języku (źródła: 06-tresci-006) | otwarte |
| M1-audytor-generalny-042 | P2 | M | Znane (tor B): terminy trybu maszyny pt/ja/lt z pamięci modelu (źródła: 06-tresci-007) | otwarte |
| M1-audytor-generalny-043 | P2 | M | Znane (tor B): `DODATKI_MASZYNY` bez rozmarynu focaccii i skórki cytryny kołocza (źródła: 06-tresci-008) | otwarte |
| M1-audytor-generalny-044 | P2 | D | Tekst w produkcie inny niż w `docs/tresci`; znaczniki `[T:…,-]` w ja/ko/zh-Hant; skrypt kontroli w repo starszy od modułu (źródła: 06-tresci-009) | otwarte |
| M1-audytor-generalny-045 | P2 | M | Cytaty źródeł w publicznym rejestrze dłuższe niż 1–2 zdania (10 wpisów) (źródła: 06-tresci-010) | otwarte |
| M1-audytor-generalny-046 | P2 | D | Rodzajnik przy godzinie 1:xx (es znane) w es, es-419, pt, pt-BR, it, el; w es-419 i el także 13:xx (źródła: 09-lokalizacja-004) | otwarte |
| M1-audytor-generalny-047 | P2 | D | Godzina z zerem wiodącym w zegarze 12 h („01:30 PM”) i podwójna kropka po „p.m.” (źródła: 09-lokalizacja-006) | otwarte |
| M1-audytor-generalny-048 | P2 | D | Data w mianowniku wklejona w zdanie („Gotowe czwartek, 12 listopada…”) we wszystkich językach (źródła: 09-lokalizacja-007) | otwarte |
| M1-audytor-generalny-049 | P2 | P | Długości i objętości (cm, mm, ml, l) bez przeliczenia w trybie imperialnym (źródła: 09-lokalizacja-008) | otwarte |
| M1-audytor-generalny-050 | P2 | D | Przetłumaczona nazwa wypieku zapisywana jako dane (Dziennik w starym języku po zmianie) (źródła: 09-lokalizacja-009) | otwarte |
| M1-audytor-generalny-051 | P2 | D | „DDT:” na sztywno w podglądzie importu receptury (źródła: 09-lokalizacja-010) | otwarte |
| M1-audytor-generalny-052 | P2 | D | Bramka bez pseudolokalizacji, bez sierot w 33 słownikach i bez samosprawdzenia liczby mnogiej na Hermes (źródła: 09-lokalizacja-011) | otwarte |
| M1-audytor-generalny-053 | P2 | P | Drugi przegląd AI tylko próbką 12/33 języków, rejestr przeglądów nieaktualny od 2026-10-21 (źródła: 09-lokalizacja-012) | otwarte |
| M1-audytor-generalny-054 | P2 | P | Bramka opłacalności liczy iOS + Google Play, a 1.0 jest tylko na iOS: wynik dla 1.0 to ok. 218, nie 345 USD (źródła: 02-monetyzacja-002) | otwarte |
| M1-audytor-generalny-055 | P2 | P | Plan aktualizacji dla 3.1.2(a) zasila Basic, a Pro nie ma rytmu nowej wartości (Z-7 otwarte) (źródła: 02-monetyzacja-003) | otwarte |
| M1-audytor-generalny-056 | P2 | D | Przywracanie: błąd odczytu po synchronizacji kończy się komunikatem „Nie znaleziono aktywnych zakupów” (źródła: 02-monetyzacja-004) | otwarte |
| M1-audytor-generalny-057 | P2 | P | Dokumenty wydania przeczą stanowi: `ceny.json` powołuje D-038 „bez propozycji zmian”, Z-1 raz „nie wykonane”, raz zrobione (źródła: 02-monetyzacja-005) | otwarte |
| M1-audytor-generalny-058 | P2 | P | Kalendarz, plany na kolejne dni i dwa wypieki naraz działają na „Dziś” bez bramki ZM i bez wierszy w kontrakcie (źródła: 03-zakres-001) | otwarte |
| M1-audytor-generalny-059 | P2 | D | Kontrakt opisuje model płatności z próbą (D-038) i nieaktualny ślad: `zakres.mjs` 26 błędów zamiast deklarowanych 0 (źródła: 03-zakres-003) | otwarte |
| M1-audytor-generalny-060 | P2 | D | Ustawienie „Sprzęt i naczynie do wypieku” obiecuje zmianę prowadzenia, a nic go nie czyta (źródła: 03-zakres-004) | otwarte |
| M1-audytor-generalny-061 | P2 | P | Trzecia czynność startu prowadzi do receptur bez planu i prowadzenia: 15 z 26 receptur bazowych (D-155 wykonane częściowo) (źródła: 03-zakres-005) | otwarte |
| M1-audytor-generalny-062 | P2 | P | Część funkcji Pro i tryb maszyny stoi na samej hipotezie bez zapisanego wyjątku i warunku oceny (źródła: 03-zakres-006) | otwarte |
| M1-audytor-generalny-063 | P2 | P | Funkcje dodane po zatwierdzeniu nie mają wyniku pierwszego użycia (ostatnie przejście poznawcze: makiety z 2026-10-20) (źródła: 03-zakres-007) | otwarte |
| M1-audytor-generalny-064 | P2 | P | Apetyt i koszt właściciela nieprzeliczone po rozszerzeniach 1.0 (kontrakt: 68 h wobec 60 h, bez pakietów D-092 i D-150) (źródła: 03-zakres-008) | otwarte |
| M1-audytor-generalny-065 | P2 | P | Diagnoza Doktora chleba nie przechodzi na następny wypiek: „Piecz ponownie” pokazuje tylko notatkę użytkownika (linia bazowa, weryfikacja G9 H4) (źródła: M1-audytor-generalny-065) | otwarte |
| M1-audytor-generalny-066 | P2 | D | iOS E2E na SHA kandydata czerwone; po porażce pominięte en_US, kontrola negatywna i cały zestaw Basic (znane: E2E-95, D-279, D-280) (źródła: 07-jakosc-001, 01-odkrywanie-004, 02-monetyzacja-007, 03-zakres-009, 04-studio-projektowe-005, 05-architekt-005, 05-architekt-509, 06-tresci-004, 08-programista-005, 10-wydanie-002, 11-wzrost-003, 12-niezawodnosc-005) | otwarte |
| M1-audytor-generalny-067 | P2 | D | Nightly bez zielonego przebiegu na master; Stryker przerywany limitem od 2026-10-22, bramka mutacyjna bez wyniku (źródła: 07-jakosc-002) | otwarte |
| M1-audytor-generalny-068 | P2 | P | Build TestFlight nie sprawdza wyniku E2E na tym samym SHA; 1023 wysłany po czerwonym E2E #96 (źródła: 07-jakosc-004) | otwarte |
| M1-audytor-generalny-069 | P2 | D | Krok nightly „1000 runs” biegnie z tą samą liczbą przypadków co CI; `FC_NUM_RUNS` nie działa (źródła: 07-jakosc-005) | otwarte |
| M1-audytor-generalny-070 | P2 | D | Wyjątki `br-wyjatki.json` z nieaktualnym powodem „bez kodu” ukrywają brak testów z ID dla wdrożonych scenariuszy (źródła: 07-jakosc-006, 08-programista-007) | otwarte |
| M1-audytor-generalny-071 | P2 | D | Przeżyły mutanty: brak ROLLBACK po nieudanej migracji i granica 1 oz w formacie USA (źródła: 07-jakosc-007) | otwarte |
| M1-audytor-generalny-072 | P2 | D | 24 tytuły testów deklarują pole dotyku i 320 pt, a sprawdzają styl (źródła: 07-jakosc-008) | otwarte |
| M1-audytor-generalny-073 | P2 | D | README i nazwa testu nazywają korpus Pythona niezależną wyrocznią (źródła: 07-jakosc-009) | otwarte |
| M1-audytor-generalny-074 | P2 | D | Wybór Xcode z cichym zjazdem do `/Applications/Xcode.app`, E2E bez wyboru Xcode, brak haka przed pushem (źródła: 07-jakosc-010, 10-wydanie-008) | otwarte |
| M1-audytor-generalny-075 | P2 | D | E2E bez zrzutów punktów kontrolnych; jedna porażka ukrywa wynik pozostałych kroków (źródła: 07-jakosc-011) | otwarte |
| M1-audytor-generalny-076 | P2 | D | Testy przejść czasu tylko dla Warszawy i Nowego Jorku, nie dla listy 7 stref (źródła: 07-jakosc-012) | otwarte |
| M1-audytor-generalny-077 | P2 | D | Workflow „Deploy GitHub Pages” z czerwonym ostatnim przebiegiem na master i bez możliwości sukcesu (źródła: 07-jakosc-013) | otwarte |
| M1-audytor-generalny-078 | P2 | P | Strona sklepu reklamuje funkcje Pro (plan wstecz, opieka nad zakwasem) bez oznaczenia, że wymagają zakupu (źródła: 02-monetyzacja-001, 10-wydanie-005) | otwarte |
| M1-audytor-generalny-079 | P2 | D | Dziennik wydań bez buildu 1023 i bez Z-1; plan wydania i blokady nieaktualne (źródła: 10-wydanie-003) | otwarte |
| M1-audytor-generalny-080 | P2 | P | Opis sklepu we wszystkich lokalizacjach: „15 receptur” zamiast 26, brak trybu maszyny i wersji drożdżowych (źródła: 10-wydanie-004, 01-odkrywanie-005, 11-wzrost-004) | otwarte |
| M1-audytor-generalny-081 | P2 | D | Notatki dla App Review nie prowadzą do trybu maszyny do chleba ani wersji drożdżowej (źródła: 10-wydanie-006) | otwarte |
| M1-audytor-generalny-082 | P2 | P | Klucz App Store Connect z rolą co najmniej App Manager trafia do każdego buildu TestFlight, wspólny z inną aplikacją, bez procedury unieważnienia (źródła: 10-wydanie-007) | otwarte |
| M1-audytor-generalny-083 | P2 | D | Plan wzrostu i szablon wpisu opisują model sprzed D-112 (14 dni próby, D-038) (źródła: 11-wzrost-001) | otwarte |
| M1-audytor-generalny-084 | P2 | P | H-01: minimalna próba bez ID decyzji właściciela, data oceny już nieosiągalna (źródła: 11-wzrost-005) | otwarte |
| M1-audytor-generalny-085 | P2 | D | Koniec wypieku kasuje nieczytelny wiersz sesji bez pliku ratunkowego przy błędzie zapisu pliku (D-273) (źródła: 05-architekt-508) | odrzucone |
| M1-audytor-generalny-086 | P2 | P | Subskrybent nie może w aplikacji przejść na zakup dożywotni (źródła: 02-monetyzacja-006) | odrzucone |

## Werdykt
Kurs: **trafny** · Stan: **ZABLOKOWANE** · Uzasadnienie: reguła werdyktu (wzorce M1). Kurs: brak potwierdzonych P0 i P1 kierunku; pozycje kierunku (ZAK-07: M1-audytor-generalny-060 i 064; bramka: M1-audytor-generalny-054) są P2, czyli zalecenia; role 01 i 03 niezależnie polecają tryb fix, nie przebudowę. Stan: 18 potwierdzonych otwartych P1 (M1-audytor-generalny-001…018), żadne nie jest rozwiązane decyzją właściciela. CLAUDE.md nie ustala osobnego progu wydania. Werdykt roli 07 (ZABLOKOWANE dla zgłoszenia, testy na TestFlight mogą iść dalej) jest częścią tego werdyktu.

## Bramka opłacalności
Istniejący wynik użyty ponownie decyzją właściciela na STOP 1 (wyjątek nazwany): werdykt **„przerobić”**, 345 USD netto/rok (scen. norm.; pes. 3, opt. 26 381) wobec progu 500 USD (karta właściciela 2026-10-19). Rola 02 sprawdziła platformę: rachunek liczy iOS + Google Play, a dla samego iOS wynik to ok. 174–218 USD, czyli 35–44% progu (02-monetyzacja-002 → DEC-06). Werdykt się nie zmienia; właściciel pracuje mimo niego (D-040). O wyniku decyduje widoczność w sklepie.

## Linia bazowa i założenia
Linia bazowa M1: `M1-2026-11-08/linia-bazowa.md` (Kneady 733 oceny, Loaflo 567, Rise 337; skargi: ukryta subskrypcja, zawodne powiadomienia, niedziałające funkcje). Soczewki-subagenci (5 × 15 punktów): `M1-2026-11-08/soczewki/`.

| Punkt linii bazowej | Dowód | Który raport go dotyka | Znalezisko |
|---|---|---|---|
| Plan i powiadomienia działają przy zablokowanym telefonie i nadążają za zmianą planu | weryfikacja G9 (H1, H2, H3 obalone sondami) | 05, 05-b (ARCH-14), weryfikacja G9 | M1-audytor-generalny-030 (P2: priorytet powiadomień po grupie, nie po czasie) |
| Żadna operacja nie traci danych bez kopii | sondy 05, 05-b, 08, 12, G1, G2 | 05, 05-b, 08, 12 | M1-audytor-generalny-001, 002, 003 i P2 danych |
| Uczciwa granica Basic/Pro przed zakupem | 02, 10, G4 | 02, 10, 01, 03 | M1-audytor-generalny-015, 017 i P2 metadanych |
| Liczby i wiedza ze źródeł | 06, 01, G5 | 06, 01, 08 | M1-audytor-generalny-004, 008, 009, 010 |
| Obietnice sklepu zgodne z kodem | 01, 10, 11, 03 | 01, 03, 10, 11 | SYS-04 |
| Interfejs jedną ręką, duża czcionka, 320 pt | 04 (rachunek z kodu, G7) | 04 | M1-audytor-generalny-005, 006, 007; na urządzeniu: nie sprawdzono |
| Doktor przenosi zmianę na następny wypiek (soczewki 1, 2, 5) | weryfikacja G9 H4 | żaden raport roli | M1-audytor-generalny-065 (P2, DEC-19) |
| Status przedsiębiorcy DSA przed sprzedażą w UE (soczewka 5) | — | 10: nie sprawdzono w ASC | krok właściciela |

Wymiary pokrycia M1: kurs całości (linia bazowa, soczewki); obszary ról 01–12 (wszystkie uruchomione); dane od zapisu do ratunku (05, 05-b, 08, 12, 07); pieniądze (02, 08, 10); prywatność (10: etykieta, manifest, polityka v2 zgodne z „Data Not Collected”; 05: brak sieci); fakty (06, 09, 10, 11); styki ról (SYS-01: model D-112 nie dotarł do dokumentów); obietnice (SYS-04); rejestry decyzji i założeń (03: hipotezy bez warunku oceny); koszty i limity (koszt audytu niżej; CI: Nightly przerywany limitem).

## Pokrycie (co sprawdzono, czego nie)
| Rola | Status | Raport | Kontrola dowodów | „Nie sprawdzono” |
|---|---|---|---|---|
| 01-odkrywanie | skończona | `M1-2026-11-08/role/01-odkrywanie/` | kod 0 (`M1-2026-11-08/dowody/sprawdz-01-odkrywanie.txt`) | iPhone, ASC, opisy 34 lokalizacji (10) |
| 02-monetyzacja | skończona | `role/02-monetyzacja/` | kod 0 | zakupy na telefonie, ASC, renewalInfoIOS |
| 03-zakres | skończona | `role/03-zakres/` | kod 0 | pętla na urządzeniu, test pierwszego użycia |
| 04-studio-projektowe | skończona | `role/04-studio-projektowe/` | kod 0 (+3 pliki przepływów) | AX5, 320 pt, VoiceOver na urządzeniu |
| 05-architekt (a i b) | skończone, dwa niezależne przebiegi | `role/05-architekt/`, `role/05-architekt-b/` | kod 0, kod 0 | 0xdead10cc, czas transakcji, aktualizacja 1022 → 1023 na telefonie |
| 06-tresci | skończona | `role/06-tresci/` | kod 0 | 5 cytatów FSIS i 1 OSU (403): krok właściciela w przeglądarce |
| 07-jakosc | skończona | `role/07-jakosc/` | kod 0 | PH-01…PH-32 na 1023, ochrona gałęzi |
| 08-programista | skończona | `role/08-programista/` | kod 0 | urządzenie; powiadomienia w głębi → pokryte weryfikacją G9 |
| 09-lokalizacja | skończona | `role/09-lokalizacja/` | kod 0 | Hermes (liczba mnoga, zegar 12/24 h), VoiceOver |
| 10-wydanie | skończona | `role/10-wydanie/` | kod 0 | ASC: App Privacy, wiek, DSA, Free Trial; zrzuty 31 lokalizacji poza repo |
| 11-wzrost | skończona | `role/11-wzrost/` | kod 0 | prośba o ocenę na telefonie, fora z blokadą |
| 12-niezawodnosc | skończona | `role/12-niezawodnosc/` | kod 0 | ćwiczenia na urządzeniu, TestFlight Crashes |

| Obszar krytyczny | Role | Wynik |
|---|---|---|
| Dane | 05, 05-b, 08, 12, 07 | sprawdzone w kodzie i sondach na SQLite; 3 P1; na urządzeniu: nie sprawdzono |
| Prywatność | 10, 05, 11 | sprawdzone: brak sieci, etykieta, manifest, polityka v2 zgodne; ASC App Privacy: krok właściciela |
| Pieniądze | 02, 08, 10 | kod płatności sprawdzony (11/11 wektorów); zakupy na telefonie: krok właściciela |
| Bezpieczeństwo (repo) | 10 | pełna historia bez wycieku sekretów; Key ID w historii: identyfikator, nie sekret (P2 klucza w DEC-14) |
| Główny przepływ | 04, 07, 08, 05, G9 | sprawdzony w kodzie; E2E #97 zielone na tym samym kodzie aplikacji |
| Treści krytyczne | 06, 09 | 46/46 twierdzeń krytycznych z przeglądem człowieka; przekłady bez tłumaczenia zwrotnego (P1) |

## Scalanie
105 pozycji ról → 84 (21 duplikatów w 9 grupach); szczegóły i ID źródłowe: `M1-2026-11-08/scalanie.md` oraz pole „źródła” w tabeli Podsumowania i `plan-napraw.json`.

## Konflikty i decyzje dla właściciela
Konflikty: DEC-01 („26 receptur” kontra 15 bez planu), DEC-02 (kalendarz bez bramki ZM kontra D-092), DEC-03 (merytoryczna: temperatury planu kontra receptury, rozstrzyga rola 06 źródłami). Pełna lista w „Decyzje dla właściciela”.

## Przyczyny systemowe
SYS-01…SYS-06 (opisy w `plan-napraw.json`, zależne pozycje w polu `przyczyna`). Przyczyna przed objawami: partia 1 zaczyna od SYS-02 (kolejka zapisów); SYS-01 (dokumenty) przed metadanymi.

## Weryfikacja przeciwna
9 grup, świeży subagent na grupę (`M1-2026-11-08/weryfikacja/`), każda z kontrolą dowodów kod 0. Wynik: 47 potwierdzonych, 2 obalone (02-monetyzacja-006 przez D-117; hipoteza H1 linii bazowej), 3 hipotezy obalone w G9 (H1, H2, H3), 1 potwierdzona (H4).

| ID źródłowe | Wynik | Dowód | Zmiana poziomu |
|---|---|---|---|
| 01-odkrywanie-001 | potwierdzone | weryfikacja/G4-sklep-pieniadze.md | P0 → P1 (bez utraty danych, odrzucenie mało prawdopodobne) |
| 09-lokalizacja-001 | potwierdzone | weryfikacja/G5-tresci.md | P0 → P1 (próbka przekładów wierna, realność brzegowa) |
| 02-monetyzacja-001 | potwierdzone z poprawką | weryfikacja/G4-sklep-pieniadze.md | P1 → P2 (zrzuty 01 i 05 mają plakietkę) |
| 07-jakosc-001 i grupa E2E | potwierdzone | weryfikacja/G8-proces-ci.md; diff 2ef8870a..d1524768 tylko `.maestro` i docs (`M1-2026-11-08/dowody/e2e95-diff-stat.txt`), E2E #97 zielone | P1 → P2 |
| 07-jakosc-002 | potwierdzone | weryfikacja/G8-proces-ci.md | P1 → P2 |
| 11-wzrost-001, 01-odkrywanie-002 | potwierdzone | weryfikacja/G8-proces-ci.md | P1 → P2 |
| 08-programista-003, 08-programista-004 | potwierdzone | weryfikacja/G1-dane-zapis.md | P1 → P2 |
| 08-programista-002, 03-zakres-001 | potwierdzone | weryfikacja/G7-przeplyw-ui.md | P1 → P2 |
| 09-lokalizacja-004 | potwierdzone | weryfikacja/G6-lokalizacja.md | P1 → P2 |
| 02-monetyzacja-006 | obalone (D-117) | weryfikacja/G4-sklep-pieniadze.md | odrzucone |
| pozostałe P1 i P2 obszarów krytycznych | potwierdzone, poziom bez zmian | G1, G2, G3, G5, G6, G7 | — |

## Plan napraw dla M2
`M1-2026-11-08/plan-napraw.json`, `sprawdz-plan.mjs` kod 0 (`M1-2026-11-08/dowody/sprawdz-plan.txt`): 86 zadań, 20 decyzji (19 bez wyboru). Partia 1: dane i SYS-02 (05, 08, 12); partia 2: przepływ, treści, lokalizacja (04, 06, 09, 01); partia 3: sklep, zakres, proces (02, 03, 07, 10, 11). Uwagi właściciela z testu telefonu (D-277) dopisuje się na STOP 2 jako zadania tej samej listy.


| Partia | ID | Poziom | Rodzaj | Rola | Wykonawca | Źródła | Zależy od | Decyzja | Status |
|---|---|---|---|---|---|---|---|---|---|
| 1 | M1-audytor-generalny-001 | P1 | D | 05-architekt | M2 | 05-architekt-001, 05-architekt-502, 08-programista-001 | — | — | otwarte |
| 1 | M1-audytor-generalny-002 | P1 | D | 05-architekt | M2 | 05-architekt-501 | — | — | otwarte |
| 1 | M1-audytor-generalny-019 | P2 | D | 05-architekt | M2 | 05-architekt-002 | — | — | otwarte |
| 1 | M1-audytor-generalny-020 | P2 | D | 05-architekt | M2 | 05-architekt-003, 05-architekt-506 | — | — | otwarte |
| 1 | M1-audytor-generalny-021 | P2 | D | 05-architekt | M2 | 05-architekt-004, 05-architekt-507 | — | — | otwarte |
| 1 | M1-audytor-generalny-022 | P2 | D | 05-architekt | M2 | 05-architekt-503 | — | — | otwarte |
| 1 | M1-audytor-generalny-023 | P2 | P | 05-architekt | rola | 05-architekt-504 | — | DEC-11 | otwarte |
| 1 | M1-audytor-generalny-024 | P2 | M | 05-architekt | rola | 05-architekt-505 | — | — | otwarte |
| 1 | M1-audytor-generalny-085 | P2 | D | 05-architekt | M2 | 05-architekt-508 | — | — | odrzucone |
| 1 | M1-audytor-generalny-025 | P2 | D | 08-programista | M2 | 08-programista-002 | — | — | otwarte |
| 1 | M1-audytor-generalny-026 | P2 | D | 08-programista | M2 | 08-programista-003 | — | — | otwarte |
| 1 | M1-audytor-generalny-027 | P2 | D | 08-programista | M2 | 08-programista-004 | — | — | otwarte |
| 1 | M1-audytor-generalny-028 | P2 | D | 08-programista | M2 | 08-programista-006 | — | — | otwarte |
| 1 | M1-audytor-generalny-029 | P2 | D | 08-programista | M2 | 08-programista-008 | — | — | otwarte |
| 1 | M1-audytor-generalny-030 | P2 | D | 08-programista | M2 | M1-audytor-generalny-030 | — | — | otwarte |
| 1 | M1-audytor-generalny-003 | P1 | P | 12-niezawodnosc | rola | 12-niezawodnosc-001 | — | DEC-17 | otwarte |
| 1 | M1-audytor-generalny-031 | P2 | D | 12-niezawodnosc | M2 | 12-niezawodnosc-002 | — | — | otwarte |
| 1 | M1-audytor-generalny-032 | P2 | D | 12-niezawodnosc | M2 | 12-niezawodnosc-003 | — | — | otwarte |
| 1 | M1-audytor-generalny-033 | P2 | D | 12-niezawodnosc | M2 | 12-niezawodnosc-004 | — | — | otwarte |
| 2 | M1-audytor-generalny-004 | P1 | M | 01-odkrywanie | rola | 01-odkrywanie-003 | — | — | otwarte |
| 2 | M1-audytor-generalny-034 | P2 | D | 01-odkrywanie | M2 | 01-odkrywanie-002 | — | — | otwarte |
| 2 | M1-audytor-generalny-035 | P2 | D | 01-odkrywanie | M2 | 01-odkrywanie-006 | — | — | otwarte |
| 2 | M1-audytor-generalny-036 | P2 | D | 01-odkrywanie | M2 | 01-odkrywanie-007 | — | — | otwarte |
| 2 | M1-audytor-generalny-037 | P2 | D | 01-odkrywanie | M2 | 01-odkrywanie-008 | — | — | otwarte |
| 2 | M1-audytor-generalny-005 | P1 | D | 04-studio-projektowe | M2 | 04-studio-projektowe-001 | — | — | otwarte |
| 2 | M1-audytor-generalny-006 | P1 | D | 04-studio-projektowe | M2 | 04-studio-projektowe-002 | — | — | otwarte |
| 2 | M1-audytor-generalny-007 | P1 | P | 04-studio-projektowe | rola | 04-studio-projektowe-003 | — | DEC-10 | otwarte |
| 2 | M1-audytor-generalny-038 | P2 | D | 04-studio-projektowe | M2 | 04-studio-projektowe-004 | — | — | otwarte |
| 2 | M1-audytor-generalny-039 | P2 | D | 04-studio-projektowe | M2 | 04-studio-projektowe-006 | — | — | otwarte |
| 2 | M1-audytor-generalny-008 | P1 | M | 06-tresci | rola | 06-tresci-001 | — | DEC-03 | otwarte |
| 2 | M1-audytor-generalny-009 | P1 | M | 06-tresci | rola | 06-tresci-002 | — | DEC-03 | otwarte |
| 2 | M1-audytor-generalny-010 | P1 | M | 06-tresci | rola | 06-tresci-003 | — | — | otwarte |
| 2 | M1-audytor-generalny-040 | P2 | M | 06-tresci | rola | 06-tresci-005 | — | — | otwarte |
| 2 | M1-audytor-generalny-041 | P2 | M | 06-tresci | rola | 06-tresci-006 | — | — | otwarte |
| 2 | M1-audytor-generalny-042 | P2 | M | 06-tresci | rola | 06-tresci-007 | — | — | otwarte |
| 2 | M1-audytor-generalny-043 | P2 | M | 06-tresci | rola | 06-tresci-008 | — | — | otwarte |
| 2 | M1-audytor-generalny-044 | P2 | D | 06-tresci | M2 | 06-tresci-009 | — | — | otwarte |
| 2 | M1-audytor-generalny-045 | P2 | M | 06-tresci | rola | 06-tresci-010 | — | — | otwarte |
| 2 | M1-audytor-generalny-011 | P1 | D | 09-lokalizacja | M2 | 09-lokalizacja-001 | — | — | otwarte |
| 2 | M1-audytor-generalny-012 | P1 | D | 09-lokalizacja | M2 | 09-lokalizacja-002 | — | — | otwarte |
| 2 | M1-audytor-generalny-013 | P1 | D | 09-lokalizacja | M2 | 09-lokalizacja-003 | — | — | otwarte |
| 2 | M1-audytor-generalny-014 | P1 | D | 09-lokalizacja | M2 | 09-lokalizacja-005 | M1-audytor-generalny-010 | — | otwarte |
| 2 | M1-audytor-generalny-046 | P2 | D | 09-lokalizacja | M2 | 09-lokalizacja-004 | — | — | otwarte |
| 2 | M1-audytor-generalny-047 | P2 | D | 09-lokalizacja | M2 | 09-lokalizacja-006 | — | — | otwarte |
| 2 | M1-audytor-generalny-048 | P2 | D | 09-lokalizacja | M2 | 09-lokalizacja-007 | — | — | otwarte |
| 2 | M1-audytor-generalny-049 | P2 | P | 09-lokalizacja | rola | 09-lokalizacja-008 | — | DEC-12 | otwarte |
| 2 | M1-audytor-generalny-050 | P2 | D | 09-lokalizacja | M2 | 09-lokalizacja-009 | — | — | otwarte |
| 2 | M1-audytor-generalny-051 | P2 | D | 09-lokalizacja | M2 | 09-lokalizacja-010 | — | — | otwarte |
| 2 | M1-audytor-generalny-052 | P2 | D | 09-lokalizacja | M2 | 09-lokalizacja-011 | — | — | otwarte |
| 2 | M1-audytor-generalny-053 | P2 | P | 09-lokalizacja | rola | 09-lokalizacja-012 | — | DEC-13 | otwarte |
| 3 | M1-audytor-generalny-054 | P2 | P | 02-monetyzacja | rola | 02-monetyzacja-002 | — | DEC-06 | otwarte |
| 3 | M1-audytor-generalny-055 | P2 | P | 02-monetyzacja | rola | 02-monetyzacja-003 | — | DEC-07 | otwarte |
| 3 | M1-audytor-generalny-056 | P2 | D | 02-monetyzacja | M2 | 02-monetyzacja-004 | — | — | otwarte |
| 3 | M1-audytor-generalny-057 | P2 | P | 02-monetyzacja | rola | 02-monetyzacja-005 | — | DEC-08 | otwarte |
| 3 | M1-audytor-generalny-086 | P2 | P | 02-monetyzacja | rola | 02-monetyzacja-006 | — | DEC-20 | odrzucone |
| 3 | M1-audytor-generalny-015 | P1 | P | 03-zakres | rola | 01-odkrywanie-001, 03-zakres-002 | — | DEC-04 | otwarte |
| 3 | M1-audytor-generalny-058 | P2 | P | 03-zakres | rola | 03-zakres-001 | — | DEC-02 | otwarte |
| 3 | M1-audytor-generalny-059 | P2 | D | 03-zakres | M2 | 03-zakres-003 | — | — | otwarte |
| 3 | M1-audytor-generalny-060 | P2 | D | 03-zakres | M2 | 03-zakres-004 | — | — | otwarte |
| 3 | M1-audytor-generalny-061 | P2 | P | 03-zakres | rola | 03-zakres-005 | — | DEC-01 | otwarte |
| 3 | M1-audytor-generalny-062 | P2 | P | 03-zakres | rola | 03-zakres-006 | — | DEC-09 | otwarte |
| 3 | M1-audytor-generalny-063 | P2 | P | 03-zakres | rola | 03-zakres-007 | — | DEC-09 | otwarte |
| 3 | M1-audytor-generalny-064 | P2 | P | 03-zakres | rola | 03-zakres-008 | — | DEC-09 | otwarte |
| 3 | M1-audytor-generalny-065 | P2 | P | 03-zakres | rola | M1-audytor-generalny-065 | — | DEC-19 | otwarte |
| 3 | M1-audytor-generalny-016 | P1 | D | 07-jakosc | M2 | 07-jakosc-003 | — | — | otwarte |
| 3 | M1-audytor-generalny-066 | P2 | D | 07-jakosc | M2 | 07-jakosc-001, 01-odkrywanie-004, 02-monetyzacja-007, 03-zakres-009, 04-studio-projektowe-005, 05-architekt-005, 05-architekt-509, 06-tresci-004, 08-programista-005, 10-wydanie-002, 11-wzrost-003, 12-niezawodnosc-005 | — | — | otwarte |
| 3 | M1-audytor-generalny-067 | P2 | D | 07-jakosc | M2 | 07-jakosc-002 | — | — | otwarte |
| 3 | M1-audytor-generalny-068 | P2 | P | 07-jakosc | rola | 07-jakosc-004 | — | DEC-18 | otwarte |
| 3 | M1-audytor-generalny-069 | P2 | D | 07-jakosc | M2 | 07-jakosc-005 | — | — | otwarte |
| 3 | M1-audytor-generalny-070 | P2 | D | 07-jakosc | M2 | 07-jakosc-006, 08-programista-007 | — | — | otwarte |
| 3 | M1-audytor-generalny-071 | P2 | D | 07-jakosc | M2 | 07-jakosc-007 | — | — | otwarte |
| 3 | M1-audytor-generalny-072 | P2 | D | 07-jakosc | M2 | 07-jakosc-008 | — | — | otwarte |
| 3 | M1-audytor-generalny-073 | P2 | D | 07-jakosc | M2 | 07-jakosc-009 | — | — | otwarte |
| 3 | M1-audytor-generalny-074 | P2 | D | 07-jakosc | M2 | 07-jakosc-010, 10-wydanie-008 | — | — | otwarte |
| 3 | M1-audytor-generalny-075 | P2 | D | 07-jakosc | M2 | 07-jakosc-011 | — | — | otwarte |
| 3 | M1-audytor-generalny-076 | P2 | D | 07-jakosc | M2 | 07-jakosc-012 | — | — | otwarte |
| 3 | M1-audytor-generalny-077 | P2 | D | 07-jakosc | M2 | 07-jakosc-013 | — | — | otwarte |
| 3 | M1-audytor-generalny-017 | P1 | D | 10-wydanie | M2 | 10-wydanie-001 | M1-audytor-generalny-007 | — | otwarte |
| 3 | M1-audytor-generalny-078 | P2 | P | 10-wydanie | rola | 02-monetyzacja-001, 10-wydanie-005 | — | DEC-05 | otwarte |
| 3 | M1-audytor-generalny-079 | P2 | D | 10-wydanie | M2 | 10-wydanie-003 | — | — | otwarte |
| 3 | M1-audytor-generalny-080 | P2 | P | 10-wydanie | rola | 10-wydanie-004, 01-odkrywanie-005, 11-wzrost-004 | — | DEC-01 | otwarte |
| 3 | M1-audytor-generalny-081 | P2 | D | 10-wydanie | M2 | 10-wydanie-006 | — | — | otwarte |
| 3 | M1-audytor-generalny-082 | P2 | P | 10-wydanie | rola | 10-wydanie-007 | — | DEC-14 | otwarte |
| 3 | M1-audytor-generalny-018 | P1 | P | 11-wzrost | rola | 11-wzrost-002 | — | DEC-15 | otwarte |
| 3 | M1-audytor-generalny-083 | P2 | D | 11-wzrost | M2 | 11-wzrost-001 | — | — | otwarte |
| 3 | M1-audytor-generalny-084 | P2 | P | 11-wzrost | rola | 11-wzrost-005 | — | DEC-16 | otwarte |
OK: 86 zadań, 20 decyzji (19 bez wyboru)

## Stosowalność listy kontrolnej
| Pozycja | Status | Wynik |
|---|---|---|
| GEN-01 | dotyczy | ok: 12/12 ról uruchomionych (+ drugi przebieg 05), moduły według stosowalności (`M1-2026-11-08/plan-audytu.md`) |
| GEN-02 | dotyczy | ok z zastrzeżeniem: linia bazowa przed lekturą kodu, ale CLAUDE.md wczytany automatycznie (wyjątek nazwany, kontrola zastępcza: 5 soczewek bez repo); luki → weryfikacja G9 |
| GEN-03 | dotyczy | ok: bramka przed planem (użyta ponownie decyzją na STOP 1), plan zatwierdzony przed fan-outem, zużycie w `koszty.md`; punkt kontrolny po partii 1 wyłączony decyzją (nie pierwszy M1 repo) |
| GEN-04 | dotyczy | ok: polecenia w `M1-2026-11-08/prompty/` bez raportów innych ról; nagłówki „Commit” 14/14 = 2ef8870a |
| GEN-05 | dotyczy | ok: M1 uruchomił sprawdz-raport.mjs na 14 raportach, 3 plikach przepływów i 9 plikach weryfikacji: wszystkie kod 0 (`M1-2026-11-08/dowody/`) |
| GEN-06 | dotyczy | ok: tabela obszar × rola w „Pokrycie”; na urządzeniu „nie sprawdzono” we wszystkich obszarach |
| GEN-07 | dotyczy | ok: 105 → 84, 9 grup (`M1-2026-11-08/scalanie.md`) |
| GEN-08 | dotyczy | ok: DEC-01, DEC-02, DEC-03 |
| GEN-09 | dotyczy | ok: SYS-01…SYS-06 |
| GEN-10 | dotyczy | ok: wszystkie P0 i P1 po scaleniu oraz P2 obszarów krytycznych w 9 grupach |
| GEN-11 | dotyczy | ok: sekcja „Werdykt” |
| GEN-12 | dotyczy | ok: `sprawdz-plan.mjs` kod 0 |
| GEN-13 | dotyczy | ok: sekcja „Treść z zewnątrz”; repo publiczne, K poza gitem (`.git/info/exclude`); na gałąź audytu trafiły tylko plan, linia bazowa, stan i podsumowania CI/testów, bez treści prywatnych i sekretów |
| GEN-14 | nie dotyczy (tryb audit) | — |

## Kontrola dowodów i sekretów
Wynik `sprawdz-raport.mjs --rola M1-audytor-generalny` na tym raporcie: niżej (`M1-2026-11-08/dowody/sprawdz-M1.txt`). `git status --porcelain` repo aplikacji: 0 linii na początku (E0) i na końcu (E3).

## Znaleziska (szczegóły)
Szczegóły P1 (pełne dowody, kroki i opcje w raportach źródłowych i plikach weryfikacji; tu dowód skrócony). P2: tabela Podsumowania i `plan-napraw.json`.

### M1-audytor-generalny-001 · Równoległy zapis może skasować lub połowicznie zapisać dane, a użytkownik widzi „Nie zapisano”
- Pozycja listy kontrolnej: ARCH-12, DEV (05-architekt-001, 05-architekt-502, 08-programista-001)
- Poziom: P1 · Realność: brzegowy · Pewność: wysoka (trzy niezależne przebiegi + weryfikacja G1 na SQLite)
- Rodzaj: D · Przyczyna: SYS-02 · Powraca: tak (M3 D1b P2-1 naprawione tylko dla `bake_sessions`) → trwała kontrola w teście akceptacyjnym
- Dowód: sondy `role/05-architekt/dowody/`, `role/05-architekt-b/dowody/`, `role/08-programista/dowody/`; weryfikacja `weryfikacja/G1-dane-zapis.md` (ROLLBACK jednej operacji cofa cudzą transakcję; częściowe „Usuń wszystkie dane”)
- Test akceptacyjny: w `plan-napraw.json`
- Status: otwarte

### M1-audytor-generalny-002 · Usunięte albo poprawione dokarmienie wraca po zapisie profilu zakwasu
- Pozycja listy kontrolnej: ARCH-02 (05-architekt-501) · Poziom: P1 · Realność: realny · Rodzaj: D
- Dowód: `role/05-architekt-b/dowody/`; weryfikacja G1 potwierdzona · Status: otwarte

### M1-audytor-generalny-003 · Tryb awaryjny eksportuje pakiet, którego aplikacja nie przyjmie, bez ostrzeżenia przed usunięciem aplikacji
- 12-niezawodnosc-001 · Poziom: P1 · Realność: brzegowy · Rodzaj: P (DEC-17)
- Dowód: weryfikacja G3, sonda `rozpoznajPlik` → „nierozpoznany” · Status: otwarte

### M1-audytor-generalny-004 · Karta zakwasu pokazuje fazę „w szacowanym oknie szczytu” z reguły bez źródła, także gdy okno ma być ukryte
- 01-odkrywanie-003 · Poziom: P1 · Realność: realny · Rodzaj: M · Przyczyna: SYS-05
- Dowód: weryfikacja G5 (render z `showPeakWindow={false}`) · Status: otwarte

### M1-audytor-generalny-005 · Na prowadzeniu instrukcja kroku i ostrzeżenie bezpieczeństwa są poza pierwszym ekranem (na iPhonie SE niewidoczne)
- 04-studio-projektowe-001 · Poziom: P1 · Realność: realny (rachunek z tokenów, nie zrzut z urządzenia) · Rodzaj: D
- Dowód: weryfikacja G7 (ok. 130 pt treści kroku na 17 Pro, ok. 0 pt na SE) · Krok właściciela: zrzut z telefonu przy teście D-226 · Status: otwarte

### M1-audytor-generalny-006 · Stuknięcie kroku w arkuszu „Plan wypieku” przestawia trwający wypiek bez pytania i bez cofnięcia
- 04-studio-projektowe-002 · Poziom: P1 · Realność: realny · Rodzaj: D
- Dowód: weryfikacja G7 (sonda kod 0: brak „Przywróć” i „Cofnij”; stuknięcie bieżącego kroku zeruje zegar) · Status: otwarte

### M1-audytor-generalny-007 · Siedem arkuszy poza systemem kart, którego wymaga D-139
- 04-studio-projektowe-003 · Poziom: P1 · Realność: realny · Rodzaj: P (DEC-10) · Przyczyna: SYS-06 · Status: otwarte

### M1-audytor-generalny-008 · Plan i prowadzenie podają 240/210 °C i garnek dla każdej receptury pszennej na zakwasie, wbrew danym receptury
- 06-tresci-001 · Poziom: P1 · Realność: realny (8 receptur; duży rozjazd: brioszka, durum) · Rodzaj: M (DEC-03, źródła) · Przyczyna: SYS-05 · Status: otwarte

### M1-audytor-generalny-009 · Pizza: 450 °C przez 2 min, wbrew przepisowi źródłowemu
- 06-tresci-002 · Poziom: P1 · Realność: realny · Rodzaj: M (DEC-03)
- Dowód: weryfikacja G5 (King Arthur, odczyt 2026-11-08: 500–550 °F, 6–7 min, potem grill) · Status: otwarte

### M1-audytor-generalny-010 · Teksty głównego przepływu z liczbami bez twierdzeń w rejestrze treści
- 06-tresci-003 · Poziom: P1 · Realność: realny · Rodzaj: M · Przyczyna: SYS-05 · Status: otwarte

### M1-audytor-generalny-011 · Zdania krytyczne trybu maszyny i katalogu w 21 językach bez tłumaczenia zwrotnego
- 09-lokalizacja-001 · Poziom: P1 (z P0 po weryfikacji) · Realność: brzegowy (próbki: sens wierny) · Rodzaj: D · Status: otwarte

### M1-audytor-generalny-012 · Ekran awaryjny jest zawsze po polsku
- 09-lokalizacja-002 · Poziom: P1 · Realność: brzegowy · Rodzaj: D · Dowód: weryfikacja G3 (de-DE, en-US) · Status: otwarte

### M1-audytor-generalny-013 · Przeliczanie jednostek psuje liczby: „400 °F, which is about 399 °F”, „0,04 oz”
- 09-lokalizacja-003 · Poziom: P1 · Realność: realny dla US (uncje domyślnie) · Rodzaj: D · Dowód: weryfikacja G6 · Status: otwarte

### M1-audytor-generalny-014 · 15 tekstów głównego przepływu po angielsku w 33 językach
- 09-lokalizacja-005 · Poziom: P1 · Realność: realny (495/495 par) · Rodzaj: D · Zależy od: M1-audytor-generalny-010 · Status: otwarte

### M1-audytor-generalny-015 · Ekran Pro obiecuje płatne „porównanie” wypieków, którego nie ma
- 01-odkrywanie-001, 03-zakres-002 · Poziom: P1 (z P0 po weryfikacji) · Realność: realny · Rodzaj: P (DEC-04) · Przyczyna: SYS-04 · Status: otwarte

### M1-audytor-generalny-016 · Koniec wypieku (wpis, ocena, kopia automatyczna) bez scenariusza E2E i punktu listy telefonu
- 07-jakosc-003 · Poziom: P1 · Realność: brzegowy (korekta G3: nieudany zapis wpisu pokazuje „Nie zapisano”; cicha jest tylko kopia automatyczna) · Rodzaj: D · Status: otwarte

### M1-audytor-generalny-017 · Zrzuty do wysyłki oznaczają funkcje Basic jako płatne i pokazują wygląd sprzed M3
- 10-wydanie-001 · Poziom: P1 · Realność: realny (zestaw pl w ASC od 21.10) · Rodzaj: D · Przyczyna: SYS-04 · Status: otwarte

### M1-audytor-generalny-018 · Start bez kanału z odczytanym regulaminem, budżetu godzin i planu na złe przyjęcie
- 11-wzrost-002 · Poziom: P1 (granicznie, weryfikacja G8) · Rodzaj: P (DEC-15) · Status: otwarte

## Do sprawdzenia (pewność ≤ 80%)
- Na urządzeniu (krok właściciela, lista telefonu D-226): aktualizacja 1022 → 1023 z danymi (PH-02), powiadomienia w trybie Skupienia, AX5 i 320 pt (M1-audytor-generalny-005), zakupy i przywracanie w piaskownicy, VoiceOver, zegar 12 h w es-419 i el na Hermes.
- 5 cytatów krytycznych FSIS i 1 OSU (strony zwracały 403): potwierdzenie w przeglądarce.
- Czy openiap wypełnia `renewalInfoIOS` (uprzedzenie 3 dni przed końcem Pro, 02).
- Ochrona czasu w tle dla importu i `VACUUM INTO` (ARCH-13, 05 i 05-b): raporty awarii z TestFlight.
- ASC: App Privacy, ankieta wieku, dane DSA, stan Free Trial i Z-1 (10, 02).

## Co działa dobrze i należy zachować
- Powiadomienia: uzgadnianie z bazą po każdym kroku, starcie i powrocie z tła; limit 40 z priorytetem; baner przy braku zgody (weryfikacja G9).
- Migracje: nieudana migracja nie rusza oryginału; kopia z WAL kompletna; strażnik startu zgodny ze wzorcem (12, 05).
- Kod płatności: 11/11 wektorów, brak obejścia bramki, dane nie są zakładnikiem Pro (02).
- Prywatność: zero sieci, polityka v2 i manifest zgodne z „Data Not Collected”; pełna historia repo bez sekretów (10).
- Testy: 6017 zielonych; 8/10 mutantów w funkcjach ryzyk zabitych; 47 plików testów z zegarem przeszło trudne chwile (07).
- Treści krytyczne: 46/46 twierdzeń z przeglądem człowieka; 515/556 cytatów odnalezionych w surowym tekście bez rozbieżności (06).

## Decyzje dla właściciela
- **DEC-01** (właściciel): Jak opisać katalog receptur, skoro 15 z 26 nie ma planu i prowadzenia? Opcje: (a) opis: 26 receptur, z czego 11 z planem i prowadzeniem krok po kroku — uczciwie od razu, mniej efektowny opis; (b) dokończyć D-155 dla 15 receptur przed zgłoszeniem — pełna obietnica, dni pracy i nowy reaudyt treści; (c) ukryć 15 receptur bez planu w 1.0 — spójnie, ale mniejszy katalog. **Rekomendacja: (a)**. Źródła: 01-odkrywanie-005, 10-wydanie-004, 11-wzrost-004, 03-zakres-005.
- **DEC-02** (właściciel): Kalendarz, plany na kolejne dni i dwa wypieki naraz (D-092) bez bramki ZM i bez wierszy w kontrakcie Opcje: (a) bramka ZM wstecz i wiersze F-nn w kontrakcie, kod bez zmian — sama dokumentacja, porządek śladu; (b) ukryć te funkcje w 1.0 — odcina zatwierdzoną pracę. **Rekomendacja: (a)**. Źródła: 03-zakres-001.
- **DEC-03** (źródła): Temperatura, czas i naczynie: plan czy dane receptury? Opcje: (a) plan bierze wartości z danych receptury, każda wartość ze źródłem w rejestrze — zmiana logiki planu i testów; (b) dane receptury dopasowane do stałego planu 240/210 °C — sprzeczne ze źródłami brioszki, durum i pizzy. **Rekomendacja: (a)**. Źródła: 06-tresci-001, 06-tresci-002.
- **DEC-04** (właściciel): Obietnica „porównanie wypieków” na ekranie Pro bez funkcji (F-63 PÓŹNIEJ) Opcje: (a) usunąć obietnicę z ekranu Pro i opisów w 1.0 — mniej argumentów za Pro; (b) wdrożyć F-63 przed zgłoszeniem — zmiana zakresu, nowa bramka ZM i testy. **Rekomendacja: (a)**. Źródła: 01-odkrywanie-001, 03-zakres-002.
- **DEC-05** (właściciel): Oznaczenie funkcji Pro w tekście promocyjnym i sekcjach opisu Opcje: (a) „(Pro)” przy funkcjach płatnych w tekście promocyjnym i sekcjach, 34 lokalizacje — dłuższe teksty, przekład; (b) zostaje akapit dostępu i plakietki na zrzutach — ryzyko skargi „ukryty paywall”, jak u konkurencji. **Rekomendacja: (a)**. Źródła: 02-monetyzacja-001, 10-wydanie-005.
- **DEC-06** (właściciel): Wynik bramki dla samego iOS (ok. 174–218 USD zamiast 345) Opcje: (a) przyjąć wynik iOS jako wynik bramki 1.0; werdykt „przerobić” bez zmian, D-040 obowiązuje — bez kosztu, dokumenty zaktualizowane; (b) odświeżyć bramkę modułem oplacalnosc — 0,2–0,4 mln tokenów, prawdopodobnie ten sam werdykt. **Rekomendacja: (a)**. Źródła: 02-monetyzacja-002.
- **DEC-07** (właściciel): Rytm nowej wartości Pro dla 3.1.2(a) Opcje: (a) plan aktualizacji z pozycjami Pro co kwartał — zobowiązanie czasu właściciela; (b) bez zmian — ryzyko pytania App Review o bieżącą wartość subskrypcji. **Rekomendacja: (a)**. Źródła: 02-monetyzacja-003.
- **DEC-08** (właściciel): Stan Z-1 i dokument cen powołujący D-038 Opcje: (a) potwierdzić stan Z-1 w App Store Connect i poprawić ceny.json i dokumenty wydania — 5 minut właściciela w ASC; (b) Z-1 jako krok właściciela przed zgłoszeniem, dokumenty bez zmian do tego czasu — dalej sprzeczne dokumenty. **Rekomendacja: (a)**. Źródła: 02-monetyzacja-005.
- **DEC-09** (właściciel): Funkcje na hipotezie, brak wyników pierwszego użycia, apetyt po rozszerzeniach Opcje: (a) zapisać wyjątki z warunkiem oceny i przeliczyć apetyt; przejście poznawcze na buildzie 1023 roboczo — tanio, bez nowych danych od ludzi; (b) test pierwszego użycia z 3–5 osobami przed zgłoszeniem — prawdziwy sygnał, opóźnienie. **Rekomendacja: (a)**. Źródła: 03-zakres-006, 03-zakres-007, 03-zakres-008.
- **DEC-10** (właściciel): Siedem arkuszy poza systemem kart (D-139) Opcje: (a) przenieść przed zgłoszeniem — praca 04 i 08, reaudyt wyglądu; (b) 1.0.1 z wyjątkiem nazwanym od D-139 — niespójny wygląd w 1.0. **Rekomendacja: (a)**. Źródła: 04-studio-projektowe-003.
- **DEC-11** (właściciel): „Usuń wszystkie dane” a trwające i zaplanowane wypieki Opcje: (a) kopia przed czyszczeniem obejmuje trwające i zaplanowane wypieki — zmiana formatu kopii i testy; (b) tekst ostrzeżenia, że wypieki nie trafią do kopii — prościej, utrata możliwa po świadomej zgodzie. **Rekomendacja: (a)**. Źródła: 05-architekt-504.
- **DEC-12** (właściciel): Długości i objętości w trybie imperialnym Opcje: (a) przeliczać cm, mm, ml, l — praca 08 i 09, testy; (b) w 1.0 zostają jednostki metryczne, przeliczenie w 1.0.1 — niespójność dla US. **Rekomendacja: (b)**. Źródła: 09-lokalizacja-008.
- **DEC-13** (właściciel): Drugi przegląd AI tylko na próbce 12/33 języków Opcje: (a) uzupełnić przegląd dla kluczy krytycznych w 33 językach, rejestr zaktualizowany — koszt przekładu; (b) próbka zostaje, wyjątek nazwany — słabsza kontrola przekładu. **Rekomendacja: (a)**. Źródła: 09-lokalizacja-012.
- **DEC-14** (właściciel): Klucz App Store Connect wspólny z inną aplikacją i rola co najmniej App Manager Opcje: (a) osobny klucz Developer tylko do uploadu i procedura unieważnienia — 15–30 min właściciela w ASC i sekretach CI; (b) bez zmian — szersze uprawnienia niż potrzeba. **Rekomendacja: (a)**. Źródła: 10-wydanie-007.
- **DEC-15** (właściciel): Start bez kanału z odczytanym regulaminem Opcje: (a) jeden kanał startu z odczytanym regulaminem i budżetem godzin przed zgłoszeniem — 1–2 h właściciela; (b) start tylko przez sklep, wyjątek nazwany — wolniejszy start. **Rekomendacja: (a)**. Źródła: 11-wzrost-002.
- **DEC-16** (właściciel): Hipoteza H-01 bez ID decyzji i z nieosiągalną datą oceny Opcje: (a) decyzja z ID i nowa data oceny po premierze — porządek pomiaru; (b) usunąć H-01 — brak kryterium po premierze. **Rekomendacja: (a)**. Źródła: 11-wzrost-005.
- **DEC-17** (właściciel): Ścieżka ratunku z trybu awaryjnego Opcje: (a) import pakietu awaryjnego w aplikacji oraz ostrzeżenie i kontakt na ekranie — więcej pracy, pełny ratunek; (b) w 1.0 tylko ostrzeżenie przed usunięciem aplikacji i kontakt — pakiet dalej nie do przywrócenia w aplikacji. **Rekomendacja: (a)**. Źródła: 12-niezawodnosc-001.
- **DEC-18** (właściciel): Bramka E2E przed buildem TestFlight Opcje: (a) testflight.yml wymaga zielonego E2E na tym samym SHA — build czeka na E2E; (b) zostaje ręcznie według planu wydania — powtórka 1023: build po czerwonym E2E. **Rekomendacja: (a)**. Źródła: 07-jakosc-004.
- **DEC-19** (właściciel): Diagnoza Doktora chleba przy następnym wypieku Opcje: (a) pokazać ostatnią diagnozę i zalecaną zmianę przy „Piecz ponownie” w 1.0 — zmiana zakresu po zamrożeniu; (b) do zakresu 1.1 (rola 03 po 1.0) — obietnica sklepu spełniona dosłownie, nie w duchu. **Rekomendacja: (b)**. Źródła: M1-audytor-generalny-065.
- **DEC-20** (właściciel): Przejście subskrybenta na zakup dożywotni w aplikacji Opcje: (a) bez opcji zakupu przy aktywnym Pro (D-117 pkt 1) — decyzja już zapisana; (b) dodać przejście na dożywotni — zmiana zakresu. **Rekomendacja: (a)** · wybór zapisany: a (D-117). Źródła: 02-monetyzacja-006.

## Proponowane polecenie naprawy
Po zapisaniu wyborów na STOP 2 (polecenie M2, moduł `plan-napraw`):
`node /home/user/prompts/tools/assemble.mjs M2-koordynator-napraw --tryb fix --wyjscie /home/user/piekarz/audit/M1-2026-11-08 --zadania zatwierdzone`
Raport M2: `M1-2026-11-08/M2-koordynator-napraw-<data>.md`. Potem jeden reaudit (D-277): `node /home/user/prompts/tools/assemble.mjs M1-audytor-generalny --tryb reaudit --wyjscie /home/user/piekarz/audit/M1-2026-11-08 --baza 2ef8870a`.

## Koszt
Szacunek planu (wariant głęboki): 6,5–13,3 mln tokenów. Zużycie subagentów (27: 5 soczewek, 13 przebiegów ról, 9 weryfikacji): 7 428 658 tokenów (`M1-2026-11-08/koszty.md`). M1 (E0, E0b, scalanie, plan, raport): ok. 0,6–0,9 mln [OCENA: narzędzie nie podaje zużycia sesji głównej; dokładne z `/usage`]. Razem ok. 8,0–8,3 mln, iloraz do środka planu (9,9 mln) ok. 0,82; role średnio 0,41 mln (iloraz do środka swoich przedziałów 0,5–1,0), soczewki 0,12 mln, weryfikacje 0,18 mln (górna część przedziału 115–190 tys.). Próg STOP wyjątkowego (20 mln) nieprzekroczony. Czas zegarowy fan-outu i weryfikacji: ok. 2,5 h.

## Treść z zewnątrz
Raporty ról i weryfikatorów nie zgłosiły poleceń w treści repo, stron, recenzji ani wyników narzędzi; M1 nie wykonał żadnego polecenia z treści. Polecenia ze zlecenia M1 (powiadomienie systemowe z zadaniem) wykonane w granicach decyzji właściciela na STOP 1. Uwaga do biblioteki `prompts` (nie projektu): `kontrola-brd.mjs` zakłada dwucyfrowe numery źródeł (S-101 czytane jako S-10; 01-odkrywanie).

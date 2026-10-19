# Kontrakt zakresu: Piekarz (Crust)
Stan: E3 (rola 03 build, sztafeta 01–04) · Aktualizacja: 2026-10-20 · Wejście: BRD roli 01 (`docs/brd/`, 55 BR, 18 PR, 12 J; gałąź roli 01 do c5be86c), `docs/monetyzacja.md` roli 02 (E3), ZAL-029…ZAL-050 · Decyzje: D-040 (apetyt), D-041 (ER przed cięciem), D-042 (OP-49), D-043 (zakres)

Jedyny kontrakt zakresu; czytają go role 01, 02, 04–08. Historia pracy (E0 rama, E1 wymiary i soczewki, E2 warianty i metoda) jest w `docs/archiwum/scope-contract-2026-10-20-robocze.md`, poprzednia wersja kontraktu w `docs/archiwum/scope-contract-2.0.md` (inwentarz). Zmiana zakresu po zatwierdzeniu tylko przez bramkę „Zmiany zakresu” niżej. *Dlaczego:* role 04–08 pracują z jednego źródła zakresu, a bez bramki zakres rośnie albo kurczy się po cichu.

## Główna praca i pętla
- Główna praca: J-02 „Kiedy wypiek trwa od kilku do kilkudziesięciu godzin, z przerwami, chcę wiedzieć, kiedy zacząć każdy etap, i dostać sygnał w chwili kroku” razem z J-01 (ilości) i J-05 (poprawić następny wypiek) — trzy części celu ZP-17.
- Pętla główna: start F-68 → receptura F-26 albo F-27 → ilości F-09 → plan F-13 z czasem F-14 → prowadzenie F-07 z sygnałem F-16 i powrotem F-58 → dziennik F-28; wejście zakwasu F-60, F-22, F-23, F-24, F-25; wejście drożdży i pizzy F-55.
- Funkcja MVP spoza tej linii ma podłogę albo decyzję D-043 (sprawdza `zakres.mjs`).
- Apetyt wersji 1: ok. 60 h czasu właściciela (D-040); wybrany wariant B kosztuje [OCENA] ok. 68 h (67 h z E2 + 1 h za pełne miary USA, zadanie 096) — nadwyżkę przyjął właściciel (D-043; Doktor i Akademia to wybór ZP-20). Podział: jedna aplikacja, pizza i drożdże jako rodzaj receptury (D-043, H-09 a; wytyczne 4.3(a)).
- Wzorzec najlepszych (odczyt 2026-10-19 ok. 23:58, `itunes.apple.com/lookup` i RSS recenzji, US; kryterium: co najmniej dwie części pętli w opisie, kolejność `userRatingCount`): BakeWay (663 oceny; skalowanie, kroki, diagnoza ze zdjęcia, AI i sieć; skargi na opłaty), Loaflo (546; dziennik zakwasu, kalkulatory, skan AI; skargi: brak planu „co i kiedy”, zawodność, pleśń oceniona wysoko, ściana płatności), Rise (336, 4,87; receptury, procenty, plan z temperatury, powiadomienia, dziennik, synchronizacja; skargi: awaria w trakcie kroków, brak pauzy). Wniosek: Rise robi prawie całą pętlę (ZAL-045 podważone w części); wyróżnik Piekarza to sposób — bez sieci i konta, uczciwa płatność, niezawodność, zakwas od zera i zasada ostrożności — a nie liczba funkcji.
- Darmowe i płatne: bez zmian względem D-038 i kontraktu płatności (`docs/monetyzacja.md`): bez zakupu działa przegląd historii i prawa do danych (odczyt, eksport, import, usunięcie), zakup, przywracanie, ustawienia; F-68 (start) to nawigacja, oferta przy pierwszym użyciu funkcji (BR-ZAK-005); F-69 (ocena, kontakt) jest w ustawieniach, zawsze dostępna.
- Plan aktualizacji dla 3.1.2(a) (D-043): co kwartał jedna aktualizacja z treścią (2–3 receptury bazowe albo wyjaśnienia „po co ten krok” ze źródłami roli 06, w 35 językach) i poprawkami z recenzji; [OCENA] ok. 3 h właściciela na wydanie.
- Rozstrzygnięcia: OP-38 przypomnienie na blacie co 12 h (S-44, RD-25); OP-41 kopia urządzenia iCloud systemu i przypomnienie o eksporcie, bez wyjątku od zakazu sieci; OP-49 udany wypiek od 4★ (D-042). Otwarte: domyślne jednostki (zadanie M1-audytor-generalny-096) — decyzja właściciela na STOP E3.
- Metoda rankingu: R = odsetek użytkowników pętli w miesiącu [OCENA, bez telemetrii]; I według skali McBride’a; C ≤ 50% bez dowodu R/W, 80% przy dowodzie R; koszt = godziny właściciela w wersji 1 [OCENA]: test na telefonie + przegląd tekstów (PL i EN, wyrywkowo inne z 35) + decyzje i utrzymanie w roku 1 (skala w archiwum roboczym, E2).

## Zakres

| ID | Funkcja | Wymagania | Decyzja | Dowód wartości | WTP | Intuicyjność | Podłoga | Zależy od | Uzasadnienie |
|---|---|---|---|---|---|---|---|---|---|
| F-68 | Start „co dziś robisz” (trzy czynności, powrót do trwającego wypieku) | BR-START-001 | MVP | B: ZP-22, ZP-23; M1-audytor-generalny-057, -087 | WTP-0 (B) · zawsze (nawigacja) | trzy czynności nazwane słowami pracy; wybór prowadzi do przepływu bez oferty; wynik: czeka na 04 | — | — | rdzeń pętli (pierwsze wejście); kształt ekranu H-08 (rola 04) |
| F-09 | Kalkulator receptury: procent piekarski, hydratacja z zakwasu i zaczynu, skalowanie 1 g | BR-KALK-001, BR-KALK-002, BR-KALK-003 | MVP | B: J-01; R: S-17 rec. 6280671939, S-19 rec. 12569511193 | WTP-0 (B, R) · próba / płatna | po wyborze receptury wagi wszystkich składników bez wpisywania; zmiana masy ciasta od razu zmienia wagi; wynik: czeka na 04 | — | — | rdzeń pętli; bloker wydania |
| F-56 | Informacja o nietypowej ilości soli | BR-KALK-011 | MVP | R: S-24 rec. 5681544617 (słaby) | WTP-2 (R) · próba / płatna | informacja przy polu soli, bez blokady; wynik: czeka na 04 | — | F-09 | D-043 (wariant B): kontrola liczb dla P-6, koszt 0,5 h |
| F-11 | Kilka mąk w recepturze, wariant żytni | BR-KALK-005 | MVP | R: S-21 rec. 13060223498 | WTP-2 (R) · próba / płatna | dodanie drugiej mąki z udziałem w procentach; oznaczenie „żytni” widoczne; wynik: czeka na 04 | — | F-09 | D-043: wariant żytni steruje krokami F-07 (RD-20) |
| F-38 | Miary USA w całej aplikacji: uncje i °F na ekranach, w polach wejścia, eksportach i powiadomieniach; baza metryczna | BR-UST-001 | MVP | R: 9 z 338 recenzji, 6 ≤ 3★ (ZAL-037); M1-audytor-generalny-096 (słowa właściciela 2026-10-20) | WTP-2 (R) · próba / płatna (ustawienie zawsze) | dwa przełączniki z nazwami jednostek; w trybie imperialnym żaden ekran, eksport ani powiadomienie nie pokazuje °C ani g bez przeliczenia; procent piekarski bez zmian; ustawienie domyślne: decyzja na STOP E2; wynik: czeka na 04 | — | F-09 | D-043: rynek US (H-12 a); kryteria pełnego pokrycia z zadania 096 (dziś „°C” na sztywno w 16 plikach `app/` i `src/components/`, eksporty 072, zakres 20–26 °C bez °F); BR-UST-001 pokrywa tylko wyświetlanie: ER-49 do roli 01 |
| F-10 | Temperatura wody dla docelowej temperatury ciasta | BR-KALK-004 | MVP | R: S-14 rec. 9331408199 | WTP-2 (R) · próba / płatna | pola temperatur nazwane słowami („mąka”, „kuchnia”), wynik w °C albo °F (F-38) bez wzoru; wynik: czeka na 04 | — | F-09 | D-043; próg gorącej wody OP-34 (rola 06) |
| F-55 | Ciasto drożdżowe i pizza: rodzaj drożdży, zaczyny poolish, biga, levain | BR-KALK-009, BR-KALK-010 | MVP | R: S-19 rec. 7107716082; S-24 rec. 7357117590; ZP-23 | WTP-1 (R) · próba / płatna | wybór „piekę na drożdżach albo pizzę” prowadzi do rodzaju drożdży i zaczynu bez nowych pojęć przed wyborem; wynik: czeka na 04 | — | F-09 | D-043: wybór właściciela ZP-23, jedna aplikacja (H-09 a) |
| F-13 | Plan wstecz od godziny „gotowe”: sen, przesunięcie, wcześniejsze zakończenie, cofnięcie kroku | BR-HARMO-001, BR-HARMO-002, BR-HARMO-004, BR-HARMO-005 | MVP | B: J-02; R: 15 z 338; S-64 (Rise) | WTP-1 (R) · próba / płatna | godzina „gotowe” jako pierwsze pole; kolizja ze snem nazwana i z propozycją; „cofnij” przy potwierdzonym kroku; wynik: czeka na 04 | — | F-09 | rdzeń pętli; bloker wydania (BR-HARMO-001) |
| F-14 | Czas fermentacji z temperatury (20–26 °C) | BR-HARMO-003 | MVP | R: S-14 rec. 8937437575 | WTP-2 (R) · próba / płatna | zmiana temperatury od razu zmienia czasy; poza zakresem komunikat zamiast liczby; wynik: czeka na 04 | — | F-13 | rdzeń pętli; model: rola 06 (DEC-08 c) |
| F-07 | Prowadzenie krok po kroku; kroki z receptury, żyto bez składań | BR-ETAP-001, BR-ETAP-002 | MVP | R: S-14 rec. 13748164005; MS-25 (Yeasta Pro) | WTP-1 (R) · próba / płatna | bieżący krok, co zrobić i ile czasu na jednym ekranie; jedno „zrobione”; wynik: czeka na 04 | — | F-13 | rdzeń pętli; bloker wydania |
| F-57 | Ostrzeżenia bezpieczeństwa w krokach | BR-ETAP-004 | MVP | B: RYZ-15, RYZ-16; M1-audytor-generalny-086 | warunek · zawsze w kroku | ostrzeżenie w kroku, którego dotyczy, tekst i ikona (NFR-DOST-005); wynik: czeka na 04 | bezpieczeństwo: RD-22, RD-23 → F-07 | F-07 | podłoga; bloker wydania |
| F-58 | Wznowienie trwającego wypieku | BR-ETAP-005 | MVP | B: audyt M1 01-odkrywanie-005; R: S-14 rec. 13643687864 | warunek · jak wypiek | po otwarciu bieżący krok i czas od zapisanego terminu, bez akcji; wynik: czeka na 04 | dane: odczyt trwającego wypieku → F-07 | F-07 | podłoga; bloker wydania |
| F-16 | Sygnał kroku przy zablokowanym telefonie; brak zgody na powiadomienia | BR-CZAS-002, BR-CZAS-003 | MVP | B: ZP-17; R: 15 z 338; MS-25 | WTP-1 (R) · próba / płatna | jedno zdanie przed prośbą o zgodę; przy odmowie stała informacja w kroku; wynik: czeka na 04 | — | F-07 | rdzeń pętli; obietnica celu (OG-05); bloker wydania |
| F-18 | Ekran nie gaśnie w kroku czynnym | BR-REKA-001 | MVP | R: 2 z 338 (słaby, ZAL-031) | WTP-2 (R) · próba / płatna | bez akcji użytkownika; tylko w kroku czynnym; wynik: czeka na 04 | — | F-07 | D-043: koszt 0,5 h; M1-audytor-generalny-060 (dziś w całej aplikacji) |
| F-22 | Karta zakwasu, kilka zakwasów | BR-ZAKW-001 | MVP | R: S-20 rec. 14638146092; MS-25 | WTP-1 (R) · próba / płatna; odczyt i usunięcie zawsze | lista zakwasów z datą dokarmienia i miejscem; dodanie jednym przyciskiem; wynik: czeka na 04 | dane: usunięcie zakwasu bez zakupu | — | wejście pętli na zakwasie |
| F-23 | Dokarmianie z proporcją | BR-ZAKW-002 | MVP | R: S-20 rec. 13947658962 | WTP-2 (R) · próba / płatna | po wyborze proporcji gramy mąki i wody; zapis jednym przyciskiem; wynik: czeka na 04 | — | F-22 | wejście pętli na zakwasie |
| F-24 | Gotowość zakwasu do ciasta | BR-ZAKW-003 | MVP | R: MS-25 (SST „rise timing”) | WTP-1 (R) · próba / płatna | zaznaczenie „podwoił się” daje „gotowy” z atrybucją; bez godziny szczytu do OP-39; wynik: czeka na 04 | — | F-23 | wejście pętli na zakwasie |
| F-25 | Przypomnienie o dokarmieniu i zasada ostrożności | BR-ZAKW-004 | MVP | R: S-15 rec. 6706510871; MS-25 | WTP-1 (R) · próba / płatna; ostrzeżenie RD-21 zawsze | objawy do zaznaczenia słowami, jedno zalecenie; bez werdyktu „zdrowy”; wynik: czeka na 04 | bezpieczeństwo: RD-21 | F-22 | podłoga; bloker wydania |
| F-60 | Założenie zakwasu dzień po dniu | BR-ZAKW-005 | MVP | R: MS-25 (Yeasta „day-by-day”); Loaflo rec. 13931423989; 6 z 338 | WTP-1 (R) · próba / płatna | „zakładam zakwas” na starcie; dzień N i co dziś zrobić; wynik: czeka na 04 | bezpieczeństwo: RD-21 | F-22 | wejście P-6 (ZP-22); bloker wydania |
| F-61 | Obudzenie zakwasu z lodówki przed wypiekiem | BR-ZAKW-006 | MVP | R: MS-25 (Yeasta „Fridge Starter Planner”) | WTP-1 (R) · próba / płatna | plan sam dodaje dokarmienia, gdy zakwas jest w lodówce; wynik: czeka na 04 | — | F-22, F-13 | D-043: ranking w apetycie |
| F-62 | Poprawa pomyłki we wpisie zakwasu | BR-ZAKW-007 | MVP | R: S-21 rec. 12986088850, 13060223498 | WTP-2 (R) · próba / płatna | „edytuj” przy wpisie; przypomnienie liczy się od poprawionej godziny; wynik: czeka na 04 | — | F-23 | D-043 (wariant B): pomyłka bez kasowania historii, 1 h |
| F-26 | Receptury bazowe (zakwas, żyto, drożdże, pizza) | BR-RECP-001 | MVP | R: S-18 rec. 10702359464; MS-25 | WTP-1 (R) · próba / płatna | lista według rodzaju z „start”; żadna osobno zablokowana; wynik: czeka na 04 | — | — | rdzeń pętli; treść roli 06; plan aktualizacji 3.1.2(a) |
| F-27 | Własne receptury | BR-RECP-002 | MVP | R: S-18 rec. 10719043217; MS-25 | WTP-1 (R) · próba / płatna; odczyt i usunięcie zawsze | „zapisz jako moją” pod wynikiem; od razu na liście; wynik: czeka na 04 | dane: odczyt i usunięcie bez zakupu | F-09 | rdzeń pętli |
| F-28 | Dziennik wypieków z oceną i „piecz ponownie” | BR-RECP-003 | MVP | B: J-05, ZP-17; R: MS-25 | WTP-1 (R) · nowy wpis próba / płatna; przegląd zawsze | ocena otwiera się po „zakończ wypiek”; „piecz ponownie” w wpisie; wynik: czeka na 04 | dane: przegląd historii zawsze (DEC-01 d) | F-07 | rdzeń pętli |
| F-69 | Pętla opinii: systemowa prośba o ocenę, „Oceń w App Store”, „napisz do nas” | BR-OPIN-001, BR-OPIN-002, BR-OPIN-003 | MVP | B: J-12; DEC-13 a; S-63 | warunek · zawsze (ustawienia) | prośba tylko systemowa po udanym wypieku (OP-49: ≥ 4★); dwa wpisy w ustawieniach; wynik: czeka na 04 | prawo: OG-07 | F-28 | domyślnie w wersji 1 (polecenie roli); bloker wydania |
| F-43 | Doktor Chleba dla bochenka (treść) | BR-DIAG-001 | MVP | R: S-16 rec. 14104905527; MS-26; ZP-20 | WTP-1 (R) · próba / płatna | propozycja po ocenie ≤ 2★; objaw → pytania → jedna zmiana; wynik: czeka na 04 | — | F-28 | D-043 (wariant B): wybór właściciela ZP-20; bez zdjęcia (H-10 a) |
| F-64 | Doktor Chleba dla zakwasu, który nie rośnie (treść) | BR-DIAG-002 | MVP | R: MS-25 (Yeasta, SST); S-21 rec. 12986088850 | WTP-1 (R) · próba / płatna; ostrzeżenie RD-21 zawsze | wejście z dnia N zakładania; przy pleśni polecenie zamiast listy; wynik: czeka na 04 | bezpieczeństwo: RD-21 | F-60 | podłoga; bloker wydania (RD-21) |
| F-44 | Akademia: „po co ten krok” przy kroku (treść) | BR-NAUK-001 | MVP | R: 14 z 338 (ZAL-041); ZP-20 | WTP-2 (R) · próba / płatna | „po co ten krok” w kroku; powrót bez utraty stanu; lekcje osobno później; wynik: czeka na 04 | — | F-07 | D-043 (wariant B): ZP-20, H-13 a; zdania tylko ze źródłem (RYZ-21) |
| F-15 | Ocena gotowości ciasta przed pieczeniem | BR-ETAP-003 | TEST | H-13 (ZAL-048, hipoteza) | WTP-X | wskazówka w kroku garowania; wynik: czeka na 04 | — | F-07 | WTP-X i treść bez źródła (OP-46). Test: przejście poznawcze roli 04 i pytanie do 3–5 testerów TestFlight, czy szukają oceny gotowości w kroku; bez budowy przed wynikiem |
| F-31 | Trwały zapis, ochrona przed utratą | BR-DANE-001 | MVP | B: J-10; ZAL-035 | warunek · zawsze | bez akcji; przy błędzie komunikat i droga eksportu; wynik: czeka na 04 | dane: odczyt, migracja (NFR-DANE-003) | — | podłoga; bloker wydania |
| F-32 | Kopia zapasowa, także poza telefonem | BR-DANE-002 | MVP | B: J-10; RYZ-12 | warunek · zawsze | bez akcji; kopie widoczne w ustawieniach; wynik: czeka na 04 | dane: kopia (NFR-DANE-004; OP-41) | F-31 | podłoga |
| F-33 | Eksport i import do pliku | BR-DANE-003 | MVP | B: J-10; S-25 rec. 13533848767 | prawo do danych · zawsze (D-039) | „eksport” i „import” w ustawieniach z podglądem; wynik: czeka na 04 | dane: eksport, import | F-31 | podłoga; bloker wydania |
| F-65 | Usunięcie wszystkich danych | BR-DANE-004 | MVP | B: DEC-01 d; audyt M1 01-odkrywanie-006 | prawo do danych · zawsze | „usuń wszystkie dane” z potwierdzeniem; wynik: czeka na 04 | dane: usunięcie | F-31 | podłoga; bloker wydania |
| F-35 | Zakup i przywrócenie przez App Store | BR-ZAK-001 | MVP | B: D-033, D-038; S-21 rec. 14046463760 | warunek · zawsze | ceny ze sklepu; „przywróć zakupy” na ekranie zakupu i w ustawieniach; wynik: czeka na 04 | prawo: OG-01, OG-02, OG-03 | — | podłoga; bloker wydania |
| F-37 | Oferta przy pierwszym użyciu, bez ukrytych warunków | BR-ZAK-003, BR-ZAK-005 | MVP | R: MS-26 (Loaflo 12 z 13 skarg); ZAL-042 | warunek · zawsze | długość próby, cena po próbie i anulowanie przed startem; zamknięcie bez wyboru; wynik: czeka na 04 | prawo: OG-01 | F-35 | podłoga; 8 ujawnień z `docs/monetyzacja.md` |
| F-67 | Stan po próbie: uprzedzenie 3 dni, tryb „tylko historia” | BR-ZAK-004 | MVP | B: DEC-01 d, D-039; H-04 | warunek · zawsze | uprzedzenie jednym komunikatem; po końcu jasne, co działa; wynik: czeka na 04 | dane: odczyt, eksport, usunięcie (DEC-01 d) | F-35 | podłoga; bloker wydania |
| F-40 | Bez konta, sieci i śledzenia; polityka prywatności | BR-PRYW-001, BR-UST-003 | MVP | B: ZP-17; R: 13 z 16 recenzji o reklamach ≤ 3★ | warunek · zawsze | „polityka prywatności” w ustawieniach; bez sieci streszczenie i adres; wynik: czeka na 04 | prawo: OG-04 (NFR-OFF-001, NFR-PRYW-001) | — | podłoga; bloker wydania |
| F-30 | Spiżarnia mąk | BR-SPIZ-001 | PÓŹNIEJ | R: MS-26 (Gluten Morgen, 5★); D-034 pyt. 6a | WTP-2 (R) · próba / płatna | — | — | F-09 | wariant B: ranking 1,9 przy 2 h, poza pętlą; zmienia wyjątek D-034 pyt. 6a. Wejście ukryte, dane zostają w bazie i w eksporcie (F-33). Powrót: ≥ 3 prośby testerów lub recenzji o zapas mąk po wydaniu 1.0, nowy wpis ZM |
| F-63 | Porównanie dwóch wypieków | BR-RECP-004 | PÓŹNIEJ | R: S-14 rec. 8937437575 (słaby) | WTP-2 (R) · próba / płatna | — | — | F-28 | wariant B: ranking 5 przy 2 h; nowa funkcja bez kodu. Powrót: użytkownicy z ≥ 10 wpisami jednej receptury proszą o porównanie (recenzje, kontakt F-69) |
| F-45 | Przelicznik miar objętości na gramy | BR-KALK-007 | PÓŹNIEJ | R: 9 z 338 o jednostkach | WTP-2 (R) · próba / płatna | — | — | F-09 | wariant B: ranking 1,7 przy 3 h; masy bez źródła (OP-44). Powrót: rejestr mas roli 06 ze źródłem szczebla 1–3 i prośby o szklanki po wydaniu |
| F-08 | Receptura w kodzie QR bez sieci | BR-WSP-003 | PÓŹNIEJ | H: ZAL-029 (3 z 338); D-029 | WTP-2 (H) · próba / płatna | — | — | F-27 | wariant B: tylko hipoteza, uprawnienie aparatu; zmienia wyjątek D-029 i DEC-05 a. Wymiana receptur plikiem (F-33) zostaje. Powrót: rozmowy z piekarzami (OP-30) potwierdzają przekazywanie receptur przy spotkaniu |
| F-50 | Wydruk karty receptury i etykiety słoika | BR-DRUK-001 | PÓŹNIEJ | R: S-18 rec. 10632970976 (1 prośba); D-034 pyt. 7b | WTP-2 (R) · próba / płatna | — | — | F-27 | wariant B: ranking 0,4 przy 1,5 h; zmienia wyjątek D-034 pyt. 7b. Powrót: ≥ 3 prośby o druk po wydaniu |
| F-70 | Synchronizacja iPhone i iPad | H-11 | PÓŹNIEJ | H-11 (ZAL-036, 4 z 338) | — | — | — | — | H-11 a: przeniesienie plikiem (F-33); sprzeczne z zakazem sieci (`CLAUDE.md`). Powrót: ≥ 3 prośby o iPad po wydaniu i decyzja właściciela o nazwanym wyjątku od zakazu sieci (rola 05) |

## NIE robimy
| ID | Funkcja | Wymagania | Decyzja | Dowód wartości | WTP | Intuicyjność | Podłoga | Zależy od | Uzasadnienie |
|---|---|---|---|---|---|---|---|---|---|
| F-53 | Masa lodu do schłodzenia wody | BR-KALK-008 | NIE | — | WTP-X | — | — | — | brak dowodu wartości (tylko [OCENA], rola 02); dziś część sekcji DDT w kodzie (rola 08 usuwa pole lodu). Powrót: ≥ 3 prośby o lód w upał (recenzje, kontakt F-69) |

Poza tabelą (bez BR i bez H, wzorzec niszy z E1): społeczność i wyzwania (Gluten Morgen, Kneady) — inna praca, ZP-20 wybrało (b) bez społeczności; import receptur z sieci albo ze zdjęcia przez AI (Rise, BakeWay) i ocena zdjęcia bochenka lub zakwasu (Loaflo, BakeWay) — wymagają sieci lub serwera (ZP-17), ocena pleśni przez AI zawodna (S-16, H-10 a); sterowanie głosem (BakeWay) — ZAL-033: 0 z 338. Powrót każdej: BR od roli 01 z dowodem i bramka ZM.

### Funkcje w kodzie bez BR (bez zmian, D-034)
| Funkcja | Stan | Powrót |
|---|---|---|
| F-46 słownik odpowiedników mąk, F-47 przepisy na odrzut, F-48 strata piecowa, F-49 konwerter hydratacji zakwasu, F-52 sekcja „Rodzina Apps4Craft” | PÓŹNIEJ, wejście ukryte (`src/lib/wejscia-pozniej.ts`), kod i dane zostają | BR z dowodem od roli 01 i wpis ZM |
| F-01…F-06 (zegarek, Live Activity, Siri, `.piekarz`, trener, Garmin) | NIE, kod usunięty (lista KL niżej, D-031) | jak w liście KL |
| F-12 formy, F-17 kilka wypieków naraz, F-19 Action Button, F-21 Centrum sterowania, F-29 zdjęcia przekroju, F-34 karta PNG, F-39 motywy | bez BR w nowym BRD (ER-38): nie budować | BR z dowodem od roli 01 (ER-38) i wpis ZM |
| F-20 pole dotyku, F-41 VoiceOver, F-42 Dynamic Type | nie funkcje: NFR-INT-001, NFR-DOST-001, NFR-DOST-002 (cechy całej aplikacji) | — |
| F-36 Family Sharing | rozstrzygnięte w D-039 (ustawienie produktów) | — |

## Ranking ([OCENA]: R = odsetek użytkowników pętli w miesiącu, koszt = godziny właściciela w wersji 1, metoda w sekcji „Główna praca i pętla”)
| ID | R | I | C | Koszt [h] | Metoda |
|---|---|---|---|---|---|
| F-68 | — | — | — | 2 | stała (WTP-0) |
| F-09 | — | — | — | 3 | stała (WTP-0) |
| F-57 | — | — | — | 1,5 | stała (podłoga) |
| F-58 | — | — | — | 2 | stała (podłoga) |
| F-25 | — | — | — | 2 | stała (podłoga) |
| F-60 | — | — | — | 3 | stała (podłoga) |
| F-64 | — | — | — | 2 | stała (podłoga; treść 06) |
| F-22 | — | — | — | 1,5 | stała (podłoga) |
| F-27 | — | — | — | 1,5 | stała (podłoga) |
| F-28 | — | — | — | 2 | stała (podłoga) |
| F-69 | — | — | — | 2 | stała (podłoga OG-07) |
| F-31 | — | — | — | 2 | stała (podłoga) |
| F-32 | — | — | — | 2 | stała (podłoga) |
| F-33 | — | — | — | 2 | stała (podłoga) |
| F-65 | — | — | — | 1 | stała (podłoga) |
| F-35 | — | — | — | 3 | stała (podłoga; sandbox) |
| F-37 | — | — | — | 1,5 | stała (podłoga) |
| F-67 | — | — | — | 2 | stała (podłoga) |
| F-40 | — | — | — | 1 | stała (podłoga) |
| F-07 | 90 | 3 | 80 | 3 | R: każdy wypiek; C: R (MS-25, recenzje Rise) |
| F-16 | 90 | 3 | 80 | 3 | R: każdy wypiek; C: 15 z 338; koszt: test na zablokowanym telefonie |
| F-26 | 70 | 2 | 80 | 2 | R: każdy nowy i część stałych; C: R |
| F-23 | 60 | 1 | 80 | 1 | R: użytkownicy zakwasu; C: R |
| F-13 | 80 | 2 | 80 | 3 | R: plan przy wypieku; C: 15 z 338 |
| F-11 | 40 | 1 | 80 | 1 | R: receptury z żytem i mieszanką |
| F-24 | 60 | 1 | 50 | 1 | C: progi bez źródła (OP-39) |
| F-38 | 30 | 1 | 80 | 2 | R: rynek US (ZAL-037); koszt: test trybu imperialnego na wszystkich ekranach, eksportach i powiadomieniach (zadanie 096) |
| F-14 | 50 | 1 | 80 | 1,5 | R: zmienna temperatura [OCENA] |
| F-18 | 50 | 0,5 | 50 | 0,5 | C: 2 z 338 |
| F-10 | 30 | 1 | 80 | 1 | R: część P-7 i P-8 |
| F-55 | 30 | 2 | 80 | 4 | R: P-8 (ZAL-040); koszt: zaczyny i rodzaje drożdży w 35 językach |
| F-61 | 30 | 1 | 50 | 1,5 | R: zakwas w lodówce |
| F-62 | 20 | 0,5 | 80 | 1 | R: S-21 dwie prośby |
| F-56 | 30 | 0,25 | 50 | 0,5 | C: jedna recenzja |
| F-43 | 20 | 2 | 50 | 3 | R: po słabym wypieku; koszt: treść 06 |
| F-44 | 40 | 1 | 50 | 2 | R: P-6; koszt: treść 06 przy krokach (bez lekcji) |
| F-15 | 30 | 0,5 | 50 | 1 | C: hipoteza (TEST, nie zużywa apetytu) |
| F-63 | 20 | 1 | 50 | 2 | C: jedna recenzja |
| F-30 | 15 | 0,5 | 50 | 2 | C: wyjątek właściciela, jedna recenzja |
| F-45 | 10 | 1 | 50 | 3 | koszt: rejestr mas 06 |
| F-08 | 5 | 0,5 | 50 | 2 | C: hipoteza; koszt: aparat na telefonie |
| F-50 | 5 | 0,25 | 50 | 1,5 | C: jedna prośba |
| F-70 | 10 | 1 | 50 | 6 | C: hipoteza; koszt: synchronizacja i wyjątek sieci |

Wynik `node zakres.mjs docs/scope-contract.md --brd docs/brd --apetyt 60` (2026-10-20, skrypt modułu `ciecie` roli 03, kod wyjścia **0**):

```
Ranking (R × I × C ÷ koszt [h]; stałe: podłoga albo WTP-0; „razem” liczy MVP i ten wiersz):
  1. F-09 stała · 3 h, razem 3 h · MVP
  2. F-22 stała · 1,5 h, razem 4,5 h · MVP
  3. F-25 stała · 2 h, razem 6,5 h · MVP
  4. F-27 stała · 1,5 h, razem 8 h · MVP
  5. F-28 stała · 2 h, razem 10 h · MVP
  6. F-31 stała · 2 h, razem 12 h · MVP
  7. F-32 stała · 2 h, razem 14 h · MVP
  8. F-33 stała · 2 h, razem 16 h · MVP
  9. F-35 stała · 3 h, razem 19 h · MVP
  10. F-37 stała · 1,5 h, razem 20,5 h · MVP
  11. F-40 stała · 1 h, razem 21,5 h · MVP
  12. F-57 stała · 1,5 h, razem 23 h · MVP
  13. F-58 stała · 2 h, razem 25 h · MVP
  14. F-60 stała · 3 h, razem 28 h · MVP
  15. F-64 stała · 2 h, razem 30 h · MVP
  16. F-65 stała · 1 h, razem 31 h · MVP
  17. F-67 stała · 2 h, razem 33 h · MVP
  18. F-68 stała · 2 h, razem 35 h · MVP
  19. F-69 stała · 2 h, razem 37 h · MVP
  20. F-07 wynik 72 · 3 h, razem 40 h · MVP
  21. F-16 wynik 72 · 3 h, razem 43 h · MVP
  22. F-26 wynik 56 · 2 h, razem 45 h · MVP
  23. F-23 wynik 48 · 1 h, razem 46 h · MVP
  24. F-13 wynik 42,67 · 3 h, razem 49 h · MVP
  25. F-11 wynik 32 · 1 h, razem 50 h · MVP
  26. F-24 wynik 30 · 1 h, razem 51 h · MVP
  27. F-14 wynik 26,67 · 1,5 h, razem 52,5 h · MVP
  28. F-18 wynik 25 · 0,5 h, razem 53 h · MVP
  29. F-10 wynik 24 · 1 h, razem 54 h · MVP
  30. F-38 wynik 12 · 2 h, razem 56 h · MVP
  31. F-55 wynik 12 · 4 h, razem 60 h · MVP
  32. F-44 wynik 10 · 2 h, razem 62 h · MVP · poza apetytem 60 h
  33. F-61 wynik 10 · 1,5 h, razem 63,5 h · MVP · poza apetytem 60 h
  34. F-62 wynik 8 · 1 h, razem 64,5 h · MVP · poza apetytem 60 h
  35. F-15 wynik 7,5 · 1 h, razem 65,5 h · TEST · poza apetytem 60 h
  36. F-56 wynik 7,5 · 0,5 h, razem 65 h · MVP · poza apetytem 60 h
  37. F-43 wynik 6,67 · 3 h, razem 68 h · MVP · poza apetytem 60 h
  38. F-63 wynik 5 · 2 h, razem 70 h · PÓŹNIEJ · poza apetytem 60 h
  39. F-30 wynik 1,88 · 2 h, razem 70 h · PÓŹNIEJ · poza apetytem 60 h
  40. F-45 wynik 1,67 · 3 h, razem 71 h · PÓŹNIEJ · poza apetytem 60 h
  41. F-70 wynik 0,83 · 6 h, razem 74 h · PÓŹNIEJ · poza apetytem 60 h
  42. F-08 wynik 0,63 · 2 h, razem 70 h · PÓŹNIEJ · poza apetytem 60 h
  43. F-50 wynik 0,42 · 1,5 h, razem 69,5 h · PÓŹNIEJ · poza apetytem 60 h
Kolejność budowy MVP: F-09 → F-13 → F-07 → F-10 → F-11 → F-14 → F-16 → F-18 → F-22 → F-23 → F-24 → F-25 → F-26 → F-27 → F-28 → F-31 → F-32 → F-33 → F-35 → F-37 → F-38 → F-40 → F-43 → F-44 → F-55 → F-56 → F-57 → F-58 → F-60 → F-61 → F-62 → F-64 → F-65 → F-67 → F-68 → F-69
UWAGA F-44 w MVP poza apetytem 60 h (decyzja właściciela)
UWAGA F-61 w MVP poza apetytem 60 h (decyzja właściciela)
UWAGA F-62 w MVP poza apetytem 60 h (decyzja właściciela)
UWAGA F-56 w MVP poza apetytem 60 h (decyzja właściciela)
UWAGA F-43 w MVP poza apetytem 60 h (decyzja właściciela)
44 funkcji (MVP 36, PÓŹNIEJ 6, TEST 1, NIE 1), 55 BR · 0 błędów, 5 uwag
```
Uwagi skryptu (5) to funkcje MVP ponad linię 60 h: przyjęte przez właściciela w D-043 (wariant B). Suma MVP 68 h: 67 h z propozycji E2 i 1 h więcej za pełne miary USA w F-38 (zadanie M1-audytor-generalny-096, przekazane 2026-10-20 przed zatwierdzeniem).

## Kolejność i przekazanie
- Kolejność budowy MVP (wynik skryptu, porządek zależności): F-09 → F-13 → F-07 → F-10 → F-11 → F-14 → F-16 → F-18 → F-22 → F-23 → F-24 → F-25 → F-26 → F-27 → F-28 → F-31 → F-32 → F-33 → F-35 → F-37 → F-38 → F-40 → F-43 → F-44 → F-55 → F-56 → F-57 → F-58 → F-60 → F-61 → F-62 → F-64 → F-65 → F-67 → F-68 → F-69. Większość ma kod; dla roli 08 kolejność wdrożenia nowej szaty (partia 5) i nowych BR: najpierw pętla (F-68, F-09, F-13, F-07, F-16, F-58, F-28), potem zakwas i podłogi, na końcu F-43, F-44, F-69.
- **04:** przepływy PR-01…PR-18 bez PR-08 (QR i druk PÓŹNIEJ; eksport pliku z PR-07 zostaje); kryteria z kolumny „Intuicyjność” do przejścia poznawczego (cztery pytania Flaherty) i, gdzie się da, 3–5 osób bez instrukcji; wynik wraca tu jako `wynik: <pozytywny|negatywny>, <data, plik>` przez bramkę zmian. Nie projektować: F-53, F-30, F-63, F-45, F-08, F-50, F-70, F-46…F-49, F-52 i „NIE robimy”; F-15 tylko jako prototyp do testu. Kalkulator: najwyżej 4 akcje główne (DEC-09 a, 057) — z akcji znikają QR, druk, spiżarnia. Start F-68 według BR-START-001 (H-08: kształt ekranu). Miary USA w każdym ekranie (F-38, 096).
- **05:** przepływy jak wyżej; dane zapisują F-09, F-13, F-07/F-58 (trwający wypiek ze znacznikiem „zaczęty z dostępem”, D-039), F-22…F-25, F-60…F-62, F-26…F-28, F-31…F-33, F-65, F-67; praca w tle: powiadomienia lokalne (F-16, F-25), bez sieci (F-40); uprawnienia: tylko powiadomienia (aparat znika z wersji 1 razem z F-08: zadania 029, 049); OP-41 (kopia urządzenia iCloud) i OP-42, OP-43 do potwierdzenia. PÓŹNIEJ nazwane bez tabel na zapas: F-30 (tabela zapasów już jest: zostaje bez zmian, dane w eksporcie), F-63, F-45, F-08, F-50, F-70.
- **06:** treść jest funkcją w F-43, F-64 (Doktor), F-44 („po co ten krok” przy krokach z F-07), F-26 (receptury bazowe i plan kwartalny 3.1.2(a)), F-60 (dzień po dniu); reguły: RD-14…RD-27, krytyczne RD-21 (F-25, F-60, F-64), RD-22, RD-23 (F-57); otwarte: OP-34, OP-36, OP-37, OP-39, OP-40, OP-44 (dopiero przy powrocie F-45), OP-46 (TEST F-15).
- **07:** BR w zakresie: wszystkie z kolumny „Wymagania” wierszy MVP, scenariusze w `docs/brd/wymagania-*.md` (nagłówek „### BR-…”); blokery wydania z `docs/brd/README.md` („Blokery wydania”), w tym nowe BR-OPIN-001 i BR-OPIN-002 (OG-07); kryteria intuicyjności, których nie zautomatyzuje: test pierwszego użycia roli 04; testy funkcji PÓŹNIEJ zostają, ale funkcje nie mają wejścia (wzorzec `src/lib/wejscia-pozniej.ts`).
- **08:** kolejność wyżej; zadania kodu z `docs/zakres-wplyw-na-plan.md` (ukrycie wejść F-30, F-08, F-50; usunięcie pola lodu F-53; nowe F-68, F-69, BR-HARMO-005; pełne miary USA).
- **02:** podział bez zmian; dopisać F-69 i F-68 (nawigacja) do listy „zawsze, bez zakupu” w kontrakcie płatności; QR, druk i spiżarnia znikają z płatnej części wersji 1 (PÓŹNIEJ).
- **01:** ER-49 (BR-UST-001: wejście, eksporty, powiadomienia, zakres 68–79 °F i ustawienie domyślne jednostek po decyzji właściciela); ZAL-045 podważone w części (przekazane jako ER-47).
- **M1 (plan napraw):** `docs/zakres-wplyw-na-plan.md`.

## Definicja ukończenia (build), z dowodem
| Punkt | Dowód |
|---|---|
| Każde BR ma dokładnie jedną decyzję; `zakres.mjs --brd` kod 0 | wynik wyżej: 55 BR, 44 funkcje, 0 błędów, kod 0 (2026-10-20) |
| Pętla główna opisana pracą J i listą funkcji; MVP służy pętli, podłodze albo ma decyzję właściciela | sekcja „Główna praca i pętla”; MVP spoza pętli bez podłogi mają D-043 w Uzasadnieniu (skrypt sprawdza) |
| Każda funkcja MVP: BR, dowód B/R/W, klasa WTP z roli 02, kryterium intuicyjności z `wynik:`; WTP-X nie w MVP; H → TEST | kolumny tabeli „Zakres”; WTP-X: F-53 NIE, F-15 TEST; dowód tylko H: F-08, F-70 PÓŹNIEJ, F-15 TEST; MVP bez samej H (skrypt: 0 błędów) |
| Każde NIE i PÓŹNIEJ ma powód i „Powrót:” | tabele „Zakres” i „NIE robimy” (skrypt sprawdza „Powrót:”) |
| Podłogi funkcji w zakresie nie wycięte ani uproszczone bez źródła | RD-21, RD-22, RD-23, dane i OG w kolumnie „Podłoga”; żadna podłoga nie wypadła (F-30 ma dane w eksporcie F-33) |
| R, I, C, koszt i apetyt to [OCENA] z metodą albo dane z datą | tabela „Ranking”, metoda w „Główna praca i pętla”; apetyt D-040 |
| Właściciel wybrał wariant z co najmniej dwóch, apetyt i podział; słowa i data w rejestrze | D-040 (apetyt), D-043 (wariant B z A/B/C, podział a, plan a) |
| Przekazanie dla 04–08 | sekcja wyżej i `docs/sztafeta.md` |
| Nie sprawdzone | `npm test` (worktree bez `node_modules`; zmiany tylko w `docs/`; `tests/kontrakt-lista-odciec.test.ts` czyta listę KL — 12 wierszy KL-06…KL-17 zachowane, sprawdzone skryptem); przejście poznawcze na prototypie (rola 04); domyślne jednostki: decyzja właściciela na STOP E3 |

## Zmiany zakresu
| ID | Data | Prośba (kto, skąd) | Bramka: praca i dowód · intuicyjność · koszt · co wypada | Decyzja (ID, słowa właściciela) |
|---|---|---|---|---|
## Lista odcięć z kodu (D-031, ZM-01; przeniesiona bez zmian)

Wybór właściciela 2026-10-19 (plan napraw M1, DEC-03 = a): „Wyciąć z kontraktu MVP i z kodu; zapisać na liście odcięć z warunkiem powrotu”. Kod usuwa rola 08 pod zadaniem M1-audytor-generalny-031. Powrót każdej pozycji tylko przez bramkę zmian (nowy wpis ZM). *Dlaczego:* kod bez wejścia z interfejsu udaje funkcję, której użytkownik nie ma (zasada wspólna 18). Tabelę czyta `tests/kontrakt-lista-odciec.test.ts`.

| KL | Co wycinamy (kod) | Funkcja | Powód | Warunek powrotu |
|---|---|---|---|---|
| KL-06 | brak celu watchOS w repo | F-01 Apple Watch | brak dowodu B/R/W; linia bazowa: trzy najlepsze aplikacje niszy nie mają zegarka; wymaga macOS/Xcode | Powrót: dowód W/R, że powiadomienia (ADR-006) nie wystarczają, i test na zegarku |
| KL-07 | `src/lib/live-activity.ts` + test | F-02 Live Activity | buduje tylko dane, bez ActivityKit i mostu natywnego | Powrót: dowód od testerów po wydaniu powiadomień (ADR-006) i moduł natywny z testem na urządzeniu |
| KL-08 | `src/lib/siri-shortcuts.ts` + test | F-03 Skróty Siri | brak App Intents i tras `piekarz://stolnica/*`; BRD: etap 1.1 | Powrót: dowód W/R i App Intents z testem na urządzeniu |
| KL-09 | `src/lib/calendar-export.ts` + test | eksport planu do kalendarza (Z-022, SHOULD 1.1, bez BR) | brak BR i wejścia z interfejsu | Powrót: BR od roli 01 z dowodem potrzeby; wejście z Harmonogramu |
| KL-10 | `src/lib/piekarz-format.ts` + test | F-04 plik `.piekarz` | brak rejestracji typu pliku i wejścia; wymiana receptur zostaje przez QR i JSON (F-08) | Powrót: dowód, że QR i JSON nie wystarczają; typ pliku z testem otwarcia na urządzeniu |
| KL-11 | `src/core/bake-fsm.ts` + test | maszyna stanów z ADR-004 (obietnica „12 faz” usunięta, D-030) | Stolnica dostaje kroki z receptury i planu (F-07, D-030); FSM nieosiągalna z `app/` | Powrót: nie jako funkcja; użycie wewnątrz F-07 to decyzja techniczna ról 05 i 08 |
| KL-12 | `src/core/thermal-probe.ts` + test | sonda temperatury BLE (roadmapa v2.0, bez BR) | brak BR; wymagałaby uprawnienia Bluetooth; KL-05 wycina już BLE wag | Powrót: BR z dowodem potrzeby i decyzja o uprawnieniu Bluetooth |
| KL-13 | `src/core/baker-drill.ts` + test | F-05 Trener rachunku i fiszki | brak ekranu i dowodu, że nauka rachunku jest pracą J | Powrót: dowód W i kryterium pierwszego użycia od roli 04 |
| KL-14 | `src/data/outbox-service.ts`, `src/data/repositories/sqlite-repositories.ts` + testy | kolejka synchronizacji z zegarkiem | brak odbiorcy (F-01, F-06 wycięte); tabela `pending_ops` zostaje bez zapisu i bez migracji (decyzja 4 planu M2) | Powrót: razem z F-01 albo F-06 |
| KL-15 | `src/components/CostCalculatorModal.tsx`, `src/core/cost-calculator.ts` + testy | kalkulator kosztu bochenka i energii | już KL-01; moduł bez wejścia z interfejsu | Powrót: dowód W/R, że koszt bochenka jest pracą J użytkownika |
| KL-16 | katalog `garmin/` | F-06 Garmin Connect IQ | brak mostu w aplikacji; zależał od zegarka | Powrót: po powrocie F-01 i dowodzie R/W od użytkowników Garmina |
| KL-17 | `App.tsx` (37 KB) i `index.ts` | stary korzeń aplikacji | `package.json` uruchamia `expo-router/entry`; duplikat ekranów z `app/` | Powrót: nie wraca (kod techniczny bez funkcji) |

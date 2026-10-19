# Kontrakt zakresu Piekarz — zapis roboczy E0–E2 (archiwum, 2026-10-20)
Historia pracy roli 03 build przed E3; obowiązuje `docs/scope-contract.md`. Tabele „Zakres”, „NIE robimy” i „Ranking” w tym pliku to propozycja z E2 (stan przed D-043).

Stan: E2, propozycja (rola 03 build, sztafeta 01–04) · Aktualizacja: 2026-10-19 · Wejście: BRD roli 01 (`docs/brd/`, 50 BR, 17 PR, 11 J), `docs/monetyzacja.md` roli 02 (E3, D-038, D-039), `docs/zalozenia.md` · Poprzednia wersja (inwentarz, nie wzorzec): `docs/archiwum/scope-contract-2.0.md`

Kontrakt budowany od nowa (DEC-14 = a planu napraw M1). Tabela funkcji, „NIE robimy”, ranking i przekazanie powstają w E2–E3; do tego czasu ten plik ma ramę (E0) i listę odcięć KL, którą czyta `tests/kontrakt-lista-odciec.test.ts`.

## E0: rama

### Środowisko (2026-10-19)
| Sprawdzenie | Wynik |
|---|---|
| System, Node, git | Windows 11 (10.0.26300), Node 24.20.0, git 2.56; worktree `claude/03-zakres-2026-10-19-7a0b8a`, baza eb37122 (rola 02) potwierdzona `git merge-base --is-ancestor` (kod 0) |
| GitHub | `gh` 2.102.0; repo publiczne (`lkarwowski494/piekarz`, `gh repo view`: PUBLIC); push nie jest potrzebny |
| Sieć | `apps.apple.com` (karta Rise) 200, `itunes.apple.com/lookup` 200, `developer.apple.com/app-store/review/guidelines/` 200 |
| Mac / Xcode / Playwright | brak Maca; przejście poznawcze na prototypie robi rola 04; testy na telefonie to krok właściciela |
| `node_modules` | brak w worktree: `npm test` nie uruchomię bez `npm ci` (sieć); zmiana dotyka tylko `docs/` |
| BRD | w repo (`docs/brd/`), `CLAUDE.md` nie wskazuje innego miejsca |
| Skrypt | `zakres.mjs` z modułu `ciecie` w scratchpadzie sesji (poza repo), uruchamia się (kod 2 bez argumentów, zgodnie z kontraktem skryptu) |

### Bramka opłacalności (zasada wspólna 20)
Wynik jest: `docs/monetyzacja.md`, „Opłacalność”: wariant (a) 345 USD/rok scen. norm. wobec progu 500, werdykt **„przerobić”**, nie „budować”. Decyzja właściciela po tym werdykcie jest zapisana: pełny eksperyment 90 dni z kryterium „≥ 7 nowych płacących/mies. na iOS albo ≥ 42 USD/mies.; poniżej połowy — zamrożenie” (plan napraw M1 → `eksperyment`, słowa: „Nie zawężaj planu napraw. Chcę zobaczyć, co wyjdzie z pełnego eksperymentu.”; D-038). Pracuję na tej decyzji; pytanie 1 niżej tylko to potwierdza.

### Wejście jako hipoteza
| ID | Treść (skrót) | Status | Co z nim robię |
|---|---|---|---|
| H-06 / ZAL-045 | rdzeń wyróżniający: matematyka z zakwasem + prowadzenie z powiadomieniami + dziennik z kopią, bez reklam i sieci | hipoteza | E1: wzorzec najlepszych (czy Rise już to robi) |
| H-08 / ZAL-046 | jeden start „co dziś robisz” ogranicza kombajn przy dwóch personach i trzech rodzajach pieczywa | hipoteza | E1–E2: PR-12 nie ma BR (kandydat F-68 z samą H-08) |
| H-09 / ZAL-040 | pizza i drożdże w tej samej aplikacji | hipoteza | E2: podział na aplikacje (opcje a/b/c) |
| H-10 / ZAL-047 | Doktor na pytaniach i regułach, bez zdjęcia | hipoteza | E2: kształt F-43, F-64 |
| H-11 / ZAL-036 | synchronizacja iPhone–iPad | hipoteza, słaby dowód (4 z 338) | E2: OP-41 (kopia poza telefonem) razem z rolą 05 |
| H-12 / ZAL-037 | uncje i °F | potwierdzone (motyw, 9 z 338) | F-38 |
| H-13 / ZAL-048 | brakujące rozdziały wiedzy jako treść przy krokach | hipoteza | F-44 (treść, rola 06) |
| ZAL-029 | QR przy spotkaniu | hipoteza (3 z 338) | F-08: wyjątek D-029 zostaje albo TEST |
| ZAL-031 | ekran nie gaśnie w kroku czynnym | hipoteza (2 z 338) | F-18 |
| ZAL-033 | ręce w cieście utrudniają dotyk | hipoteza (0 z 338) | NFR-INT-001 (DEC-15) zostaje jako cecha całej aplikacji |
| ZAL-034 | zakwas od zera w 7–10 dni | potwierdzone (szczebel 3) | F-60 mieści się w 14 dniach próby (D-039) |
| ZAL-041 | początkujący potrzebuje instrukcji krok po kroku | potwierdzone (motyw, 14 z 338) | F-07, F-60, F-44 |
| ZAL-035, ZAL-042 | utrata danych i nieprzejrzyste opłaty jako powody porzucenia | potwierdzone (motyw) | podłogi danych i prawa |
| ZAL-049, ZAL-050 | niska cena i twarda ściana z próbą konwertują | hipoteza, do pomiaru (D-038) | nie otwieram; zakres nie zmienia podziału |
| D-038, D-039, DEC-01 d, DEC-06 | model stały; 35 języków | decyzje | nie otwieram; każda funkcja z tekstem kosztuje przekład na 35 języków (NFR-JEZ-001) |

### Kandydaci (50 BR → 42 funkcje)
ID: tam, gdzie funkcja jest ta sama co w poprzednim kontrakcie, zostaje jej numer (czytają go kod, testy i zadania planu napraw: `src/lib/wejscia-pozniej.ts`, M1-audytor-generalny-029…032); nowe od F-53. ID poprzednie, których nowe BRD nie ma (F-01…F-06, F-12, F-17, F-19…F-21, F-29, F-34, F-36, F-39, F-41, F-42, F-51), nie wracają; F-46…F-49 i F-52 (kod bez BR, ukryte wejście) dostaną w E2 osobną tabelę. WTP i poziom dowodu: tabela „Wartość funkcji” roli 02. Podłoga: wzorce roli (`bezpieczeństwo`, `dane`, `prawo`).

| ID | Funkcja | BR | PR | WTP (dowód) | Podłoga |
|---|---|---|---|---|---|
| F-09 | Kalkulator receptury: procent piekarski, hydratacja z zakwasu i zaczynu, skalowanie 1 g | BR-KALK-001, BR-KALK-002, BR-KALK-003 | PR-01 | WTP-0 (B, R), WTP-2 (R) | — |
| F-56 | Informacja o nietypowej ilości soli | BR-KALK-011 | PR-01 | WTP-2 (R słaby) | — |
| F-11 | Kilka mąk w recepturze (wariant żytni) | BR-KALK-005 | PR-01 | WTP-2 (R) | — |
| F-45 | Przelicznik miar objętości na gramy | BR-KALK-007 | PR-01 | WTP-2 (R) | — (treść: OP-44) |
| F-38 | Jednostki: uncje i °F | BR-UST-001 | PR-10 | WTP-2 (R) | — |
| F-10 | Temperatura wody dla docelowej temperatury ciasta | BR-KALK-004 | PR-03 | WTP-2 (R) | — (próg gorącej wody: OP-34) |
| F-53 | Masa lodu do schłodzenia wody | BR-KALK-008 | PR-03 | **WTP-X** | — |
| F-55 | Ciasto drożdżowe i pizza: rodzaj drożdży, zaczyny poolish, biga, levain | BR-KALK-009, BR-KALK-010 | PR-17 | WTP-2 (R), WTP-1 (R) | — |
| F-13 | Plan wstecz od godziny „gotowe”, omijanie snu, przesunięcie po spóźnieniu | BR-HARMO-001, BR-HARMO-002, BR-HARMO-004 | PR-02, PR-15 | WTP-1 (R), WTP-2 | — |
| F-14 | Czas fermentacji z temperatury (zakres 20–26 °C) | BR-HARMO-003 | PR-02, PR-03 | WTP-2 (R) | — |
| F-07 | Prowadzenie krok po kroku, kroki z receptury, żyto bez składań | BR-ETAP-001, BR-ETAP-002 | PR-04 | WTP-1 (R) | — |
| F-57 | Ostrzeżenia bezpieczeństwa w krokach (gorące naczynie, surowe ciasto) | BR-ETAP-004 | PR-04, PR-11, PR-17 | warunek | bezpieczeństwo: RD-22, RD-23 → F-07 |
| F-58 | Wznowienie trwającego wypieku po zamknięciu aplikacji | BR-ETAP-005 | PR-15 | warunek | dane: odczyt trwającego wypieku → F-07 |
| F-15 | Ocena gotowości ciasta przed pieczeniem | BR-ETAP-003 | PR-04, PR-13 | **WTP-X** | — (treść: OP-46) |
| F-16 | Sygnał kroku przy zablokowanym telefonie i zachowanie przy braku zgody | BR-CZAS-002, BR-CZAS-003 | PR-04, PR-05 | WTP-1 (R), warunek | — (obietnica celu, OG-05) |
| F-18 | Ekran nie gaśnie w kroku czynnym | BR-REKA-001 | PR-04 | WTP-2 (R słaby, 2 z 338) | — |
| F-22 | Karta zakwasu, kilka zakwasów | BR-ZAKW-001 | PR-05, PR-11 | WTP-1 (R) | dane: usunięcie zakwasu bez zakupu |
| F-23 | Dokarmianie z proporcją | BR-ZAKW-002 | PR-05 | WTP-2 (R) | — |
| F-24 | Gotowość zakwasu do ciasta | BR-ZAKW-003 | PR-05, PR-02 | WTP-1 (R) | — (progi: OP-39) |
| F-25 | Przypomnienie o dokarmieniu i zasada ostrożności (pleśń) | BR-ZAKW-004 | PR-05 | WTP-1 (R) + warunek | bezpieczeństwo: RD-21 |
| F-60 | Założenie zakwasu dzień po dniu | BR-ZAKW-005 | PR-11 | WTP-1 (R) | bezpieczeństwo: RD-21 |
| F-61 | Obudzenie zakwasu z lodówki przed wypiekiem | BR-ZAKW-006 | PR-05, PR-02 | WTP-1 (R) | — |
| F-62 | Poprawa pomyłki we wpisie zakwasu | BR-ZAKW-007 | PR-05, PR-11 | WTP-2 (R) | — |
| F-26 | Receptury bazowe (zakwas, żyto, drożdże, pizza) | BR-RECP-001 | PR-01, PR-12, PR-17 | WTP-1 (R) | — |
| F-27 | Własne receptury | BR-RECP-002 | PR-01 | WTP-1 (R) | dane: odczyt i usunięcie bez zakupu |
| F-28 | Dziennik wypieków z oceną, „piecz ponownie” | BR-RECP-003 | PR-06 | WTP-1 (R) | dane: przegląd historii zawsze (DEC-01 d) |
| F-63 | Porównanie dwóch wypieków | BR-RECP-004 | PR-06 | WTP-2 (R słaby) | — |
| F-30 | Spiżarnia mąk | BR-SPIZ-001 | PR-01 | WTP-2 (R; D-034 wyjątek właściciela) | — |
| F-44 | Akademia: „po co ten krok” i lekcje (treść) | BR-NAUK-001 | PR-13 | WTP-2 (R) | — (każde zdanie ze źródłem, RYZ-21) |
| F-43 | Doktor Chleba dla bochenka (treść) | BR-DIAG-001 | PR-14, PR-06 | WTP-1 (R) | — |
| F-64 | Doktor Chleba dla zakwasu, który nie rośnie (treść) | BR-DIAG-002 | PR-14, PR-11 | WTP-1 (R) | bezpieczeństwo: RD-21 |
| F-08 | Receptura w kodzie QR bez sieci | BR-WSP-003 | PR-08 | WTP-2 (**H**, ZAL-029; D-029 wyjątek właściciela) | — |
| F-50 | Wydruk karty receptury i etykiety słoika | BR-DRUK-001 | PR-08, PR-05 | WTP-2 (R słaby; D-034 wyjątek właściciela) | — |
| F-31 | Trwały zapis, ochrona przed utratą | BR-DANE-001 | PR-07, PR-15 | warunek | dane: odczyt, migracja |
| F-32 | Kopia zapasowa, także poza telefonem | BR-DANE-002 | PR-07 | warunek | dane: kopia (OP-41) |
| F-33 | Eksport i import do pliku | BR-DANE-003 | PR-07, PR-16 | prawo do danych | dane: eksport, import (D-039) |
| F-65 | Usunięcie wszystkich danych | BR-DANE-004 | PR-07, PR-16 | prawo do danych | dane: usunięcie |
| F-35 | Zakup i przywrócenie przez App Store | BR-ZAK-001 | PR-09 | warunek | prawo: OG-01, OG-02, OG-03 |
| F-37 | Oferta przy pierwszym użyciu, bez ukrytych warunków | BR-ZAK-003, BR-ZAK-005 | PR-09, PR-12 | warunek | prawo: OG-01 (MS-09, MS-14…MS-16) |
| F-67 | Stan po próbie: uprzedzenie 3 dni, tryb „tylko historia” | BR-ZAK-004 | PR-16 | warunek | dane: odczyt, eksport, usunięcie (DEC-01 d) |
| F-40 | Bez konta, sieci i śledzenia; polityka prywatności w aplikacji | BR-PRYW-001, BR-UST-003 | PR-10, PR-01, PR-04, PR-07 | warunek | prawo: OG-04, NFR-OFF-001, NFR-PRYW-001 |
| F-68 | Start „co dziś robisz” | (brak BR; H-08) | PR-12 | — (H) | — |

Pokrycie: 50 z 50 BR w dokładnie jednej funkcji (sprawdzone skryptem w scratchpadzie, wynik w raporcie E0). WTP-X: F-53, F-15. Dowód tylko H: F-08 (wyjątek D-029), F-68 (bez BR). Wyjątki właściciela z poprzedniego kontraktu bez dowodu B/R/W: F-30 (D-034 pyt. 6a), F-50 (D-034 pyt. 7b).

Wymagania niefunkcjonalne nie dostają wierszy F-nn (skrypt liczy BR): NFR-INT-001 (pole dotyku, DEC-15), NFR-DOST-001…003, -005, NFR-INT-003, NFR-JEZ-001 to cechy całej aplikacji i kryteria dla 04 i 07; NFR-DANE-003, -004 należą do F-31, F-32; NFR-CZAS-001 do F-16; NFR-OFF-001, NFR-PRYW-001 do F-40.

### Podłogi (nie wypadają bez funkcji, którą chronią)
- **Bezpieczeństwo:** RD-21 pleśń (F-25, F-60, F-64; także karta zakwasu w trybie „tylko historia”, kontrakt płatności); RD-22, RD-23 surowe ciasto i oparzenie (F-57 → F-07). Reguły krytyczne: przegląd roli 06.
- **Dane:** F-31, F-32, F-33, F-65, F-58; odczyt i usunięcie w F-22, F-27, F-28; zawsze bez zakupu (DEC-01 d, D-039). Blokery wydania z `docs/brd/README.md`.
- **Prawo i wytyczne:** OG-01…OG-05 (F-35, F-37, F-67, F-40); 3.1.2(a) stała wartość subskrypcji (MS-05): plan aktualizacji z treścią ustalam w E2 (prośba roli 02).

### Apetyt (pytanie do właściciela)
Aplikacja istnieje: większość kandydatów ma już kod. Koszt to Twoje godziny przez wersję 1: przegląd ekranów i decyzji, testy na telefonie (TestFlight), utrzymanie każdej funkcji w 35 językach i odpowiedzi na recenzje. Czas agenta nie jest kosztem (zasada wspólna 13).
- (a) **ok. 20 h** — sama pętla główna i podłogi; najkrótsza droga do wydania i pierwszych recenzji; wypada najwięcej funkcji (kandydaci na PÓŹNIEJ: pizza i drożdże, Doktor, Akademia, druk, QR, spiżarnia).
- (b) **ok. 40 h** — pętla, podłogi i najlepsze z rankingu (zakwas od zera, Doktor, część Akademii); [OCENA] rekomendowane.
- (c) **ok. 60 h** — prawie wszystko, co ma dowód; bliżej „pełnego eksperymentu”, ale więcej przekładu i testów przed pierwszą oceną w sklepie.
Metoda: koszt funkcji policzę w E2 jako [OCENA] godzin właściciela (test na telefonie + przegląd przekładu + utrzymanie w roku), nie jako czas budowy.

### Plan i czas
| Etap | Praca | Czas agenta | Czekanie / właściciel |
|---|---|---|---|
| E1 | pętla główna; 9 wymiarów pokrycia i 4 soczewki; wzorzec 2–3 aplikacji z największą liczbą ocen (odczyt z dziś: opis, „Co nowego”, recenzje); inwentarz ekranów w kodzie; pominięcia jako ER do 01 | ok. 90 min | STOP: ok. 15 min |
| E2 | cięcie (podłoga → WTP-0 → zasada 18 → RICE w godzinach właściciela → apetyt), co najmniej dwa warianty, podział na aplikacje, pętla opinii, plan aktualizacji 3.1.2(a) | ok. 60 min | STOP: 4–6 decyzji, ok. 20 min |
| E3 | kontrakt według szablonu, `zakres.mjs --brd docs/brd --apetyt <h>` z kodem 0, `docs/zakres-wplyw-na-plan.md` (ID zadań M1), przekazanie 04–08, `docs/sztafeta.md` | ok. 60 min | STOP: ok. 10 min |

Decyzja po E0: apetyt ok. 60 h, praca na decyzji o pełnym eksperymencie (D-040).

## E1: główna praca i pętla

### Główna praca i pętla główna
- **Główna praca:** J-02 „Kiedy wypiek trwa od kilku do kilkudziesięciu godzin, z przerwami, chcę wiedzieć, kiedy zacząć każdy etap, i dostać sygnał w chwili kroku” razem z J-01 (ilości) i J-05 (poprawić następny wypiek) — trzy części zdania celu ZP-17.
- **Pętla główna** (najkrótsza droga od uruchomienia do upieczonego bochenka i lepszego następnego): receptura (F-26 albo F-27) → ilości (F-09) → plan wstecz od godziny „gotowe” z czasem z temperatury (F-13, F-14) → prowadzenie krok po kroku (F-07) z sygnałem przy uśpionym telefonie (F-16) i powrotem po przerwie (F-58) → wpis w dzienniku i „piecz ponownie” (F-28).
- **Wejście do pętli dla P-6** (ZP-22: początkujący na równi): zakwas od zera (F-60) → gotowość zakwasu (F-24) → pętla. Dla P-7 wejściem jest karta zakwasu i dokarmianie (F-22, F-23, F-25). Dla P-8 (ZP-23): ciasto drożdżowe i pizza (F-55) zamiast zakwasu, dalej ta sama pętla.
- Funkcja MVP spoza tej linii potrzebuje podłogi albo decyzji D-nnn (sprawdza `zakres.mjs`).

### Wzorzec najlepszych (odczyt 2026-10-19 ok. 23:58, `itunes.apple.com/lookup?country=us` i `itunes.apple.com/us/rss/customerreviews/…/sortby=mostrecent/json`)
Kryterium wyboru (zapisane przed odczytem): aplikacje, których opis w sklepie obejmuje co najmniej dwie części pętli (liczenie receptury, prowadzenie w czasie, dziennik), w kolejności `userRatingCount`, średnia jako drugi klucz. Gluten Morgen (753) i Kneady (731) mają więcej ocen, ale każda tylko jedną część (Gluten Morgen: kalkulator i społeczność; Kneady: przepisy z minutnikami, bez procentów piekarskich) — wchodzą tylko jako tło „czego nie mają”.

| Aplikacja (oceny, średnia, wersja) | W pętli głównej (opis) | Czego nie ma / celowo poza | Skargi i prośby (recenzje, rec. ID, data) |
|---|---|---|---|
| BakeWay (663; 4,82; 1.0.8 z 2026-10-18) | skalowanie i przeliczanie miar, kroki z wyjaśnieniem, „timing” fermentacji, własne receptury, diagnoza ze zdjęcia, sterowanie głosem | zakwasu jako osobnej pracy, dziennika wypieków; oparta na AI i sieci | płatność i anulowanie: „Canceled but stilled charged” (14609361519, 2026-09-29); „Requires payment plan” (14623384240, 2026-10-03) |
| Loaflo (546; 4,68; 6.0.11 z 2026-09-07) | dziennik zakwasu z dokarmieniami i hydratacją, kalkulatory, przepisy, skan AI bochenka i zakwasu, czat | planu „co i kiedy”; „Co nowego”: poprawka planowania wypieku, „subscription analytics” | brak planu: „Make me a schedule … what to do AND WHEN” (14207280110, 2026-06-20); zawodność: „Only works half the time” (14642919874, 2026-10-08); pleśń oceniona wysoko (12552106485); ściana płatności i brak próby (13931423989, 13789192381, 12355937171); obietnica dla początkujących bez pokrycia (13824193399) |
| Rise (336; 4,87; 4.0.2 z 2026-09-13) | receptury, procenty piekarskie i skalowanie, plan z temperatury ciasta („Magic Rise Time”), powiadomienia o krokach, „finish a step early, back up a step, or add more time”, dziennik „My Rises”, synchronizacja między urządzeniami, import AI | opisu nie ma: zakwasu od zera, diagnozy, pracy bez sieci i konta | chwali śledzenie kroku z powiadomieniem (13748164005, 2026-02-14) i kalkulatory (13671458068); skargi: awaria w trakcie kroków (13643687864), brak pauzy minutnika (7282073654), brak alarmów o dokarmianiu po zakupie (6774626932), import nieudany (11579347681) |

Wnioski [OCENA]: (1) Rise robi prawie całą naszą pętlę od lat i ma najwyższą średnią; ZAL-045 („nikt tego nie łączy”) **podważone w części** — wyróżnikiem zostaje praca bez sieci i konta, cena (D-038), zakwas od zera i zasada ostrożności przy pleśni (rejestr założeń, wpis 2026-10-19). (2) Najostrzejsze skargi w niszy dotyczą niezawodności w trakcie kroków i sposobu pobierania opłat, nie braku funkcji — podłogi F-58, F-31, F-37, F-67 są tu przewagą, nie kosztem. (3) Społeczność (Gluten Morgen, Kneady), import AI i ocena zdjęcia (Rise, BakeWay, Loaflo) wymagają sieci albo serwera: poza celem ZP-17 i wyborem ZP-20 (b); trafiają do „NIE robimy”.

### Wymiary pokrycia
| Wymiar | Wynik |
|---|---|
| Główna praca od początku do końca | pierwsze uruchomienie: PR-12 bez BR (F-68 tylko H-08; ER-45); pierwsza udana praca: pętla wyżej; powrót: F-58, F-28 „piecz ponownie”; po roku: historia, porównanie (F-63), eksport (F-33), nowy telefon (F-32, OP-41) |
| Pominięcia (wzorzec, recenzje) | brak BR dla pętli opinii (ER-44); cofnięcie pomyłkowo potwierdzonego kroku (Rise „back up a step”; ER-46); pauza minutnika: pokrywa BR-HARMO-004 (przesunięcie) — sprawdzone, bez ER; import receptury z tekstu/strony: wymaga AI lub sieci — „NIE robimy” |
| Nadmiar (kod dziś, `app/(tabs)/_layout.tsx`, `src/components/`) | 4 zakładki (Kalkulator, Harmonogram, Stolnica, Zakwas) i ukryty Doktor (`href: null`) z Akademią tylko przez Doktora (sygnał „ukryta droga”); Kalkulator: 9 przycisków akcji (`CalculatorActionButtons.tsx`: kopiuj, klonuj, eksport JSON, QR, druk, import JSON, spiżarnia, zapisz, start) i akordeon PRO z 4 sekcjami (DDT, mąki, zaczyny, strata piecowa) — sygnały kombajnu z M1-audytor-generalny-057 (DEC-09 a: 3–4 akcje główne); dwa wejścia do liczenia i planu (Kalkulator, Harmonogram) przed prowadzeniem |
| Podłogi | bezpieczeństwo RD-21 (F-25, F-60, F-64), RD-22/23 (F-57); dane F-31…F-33, F-65, F-58; prawo OG-01…05; sprawdzone, bez braków poza OP-41 (kopia poza telefonem: rola 05) |
| Intuicyjność pierwszego użycia | do E2 przesiew każdej funkcji; ryzyka dziś: akordeon „PRO” (nazwa nie mówi, co robi), Akademia dostępna tylko z Doktora, spiżarnia z akcji Kalkulatora |
| Wartość | WTP i dowód z roli 02 (tabela E0); sygnały użycia bez telemetrii: tylko recenzje i App Store Connect (ZAL-038) |
| Koszt właściciela przez lata | każda funkcja z tekstem: przekład i przegląd w 35 językach (NFR-JEZ-001); funkcje treściowe (F-43, F-44, F-64, F-15, F-45) czekają też na źródła roli 06; funkcje z uprawnieniem (F-08 aparat) i druk (F-50) to dodatkowe testy na telefonie |
| Zależności i blokery | blokery wydania z `docs/brd/README.md` należą do F-09, F-13, F-07, F-16, F-58, F-25, F-60, F-64, F-57, F-31, F-33, F-65, F-35, F-37, F-67, F-40; treść: OP-34, OP-39, OP-44, OP-46 (rola 06) |
| Podział na aplikacje | sygnał: trzy rodzaje pieczywa i dwie persony (H-08, H-09); w recenzjach ten sam piekarz piecze pizzę i chleb (BRD, rec. 5769683066; Rise 12576631706 „Best bread / pizza / recipe app”); opcje w E2 |

### Soczewki
- **Nowy użytkownik w pierwszych minutach:** widzi Kalkulator z 9 akcjami i akordeonem PRO, zanim wie, czy ma zakwas; pierwsza akcja otwiera ofertę próby (D-038) — oferta musi stać za jednym jasnym wyborem „co dziś robisz” (H-08), nie za przypadkowym przyciskiem.
- **Pasjonat po roku:** potrzebuje szybkiego „piecz ponownie” z poprzedniego wpisu, porównania (F-63), kilku zakwasów (F-22), eksportu; nie potrzebuje rytuałów i rang (usunięte wcześniej, D-034).
- **Najlepsza aplikacja niszy (Rise):** pętla receptura → plan → kroki z powiadomieniami → dziennik; celowo bez diagnozy i bez zakwasu od zera; elastyczny plan (wcześniej, cofnij, dodaj czas).
- **Właściciel jako jedyny opiekun:** funkcje treściowe i każdy tekst × 35 języków to główny koszt utrzymania; funkcje z uprawnieniami i druk — testy na telefonie; 3.1.2(a) wymaga stałej wartości subskrypcji, więc treść (receptury, lekcje) jest też planem aktualizacji (E2).

### Pominięcia → ER dla roli 01 (rola 03 nie dopisuje BR)
| ER | Brak | Dowód | Dotyczy |
|---|---|---|---|
| ER-44 | pętla opinii: systemowa prośba o ocenę po zakończonym wypieku, link „Oceń” (`action=write-review`), kontakt i zgłoszenie problemu bez śledzenia | polecenie roli 03 (E2 pkt 6: domyślnie w wersji 1); DEC-13 = a planu napraw M1; zadania M1-audytor-generalny-082, -083 | F-28 (miejsce po ocenie), rola 11 |
| ER-45 | PR-12 „co dziś robię” nie ma BR z kryteriami (dziś tylko H-08), a od niego zależy pierwsza oferta (BR-ZAK-005) | `docs/brd/wymagania.md` PR-12; soczewka nowego użytkownika; M1-audytor-generalny-057, -087 | F-68 |
| ER-46 | cofnięcie pomyłkowo potwierdzonego kroku i zakończenie kroku wcześniej | opis Rise („finish a step early, back up a step”, odczyt 2026-10-19); BR-HARMO-004 pokrywa tylko spóźnienie | F-07, F-13 |

### Sprzeczności z wejściem
- ZAL-045 (H-06) podważone w części: wpis w `docs/zalozenia.md` z dowodem; skutek dla zakresu: wyróżnik to sposób (offline, bez konta, uczciwa płatność, niezawodność, zakwas od zera), nie liczba funkcji. Do roli 01 przez przekazanie.

Decyzja po E1: najpierw BR dla ER-44…ER-46 (D-041). Rola 01 dopisała je (gałąź `claude/01-odkrywanie-2026-10-19-279a7f`, 20f6179; scalone za zgodą właściciela 2026-10-20, 36d0d47): BR-OPIN-001…003 (J-12, PR-18, OG-07), BR-START-001 (PR-12), BR-HARMO-005; BRD ma 55 BR. Nowe funkcje: F-69 (pętla opinii), F-68 dostaje BR-START-001, F-13 dostaje BR-HARMO-005.

## E2: cięcie (propozycja do wyboru właściciela)

### Kolejność i metoda
1. **Podłoga** (bezpieczeństwo, dane, prawo) i **podstawa WTP-0** — stałe, przed rankingiem (moduł `ciecie`).
2. **Zasada 18:** WTP-X bez dowodu → NIE (F-53); wartość tylko jako hipoteza → TEST (F-15: H-13) albo PÓŹNIEJ (F-70: H-11).
3. **Ranking RICE** reszty: R = odsetek użytkowników pętli, którzy skorzystają w miesiącu [OCENA, bez telemetrii]; I według skali McBride’a; C ≤ 50% bez dowodu R/W, 80% przy dowodzie R; koszt = godziny właściciela w wersji 1 [OCENA]: test na telefonie (TestFlight) + przegląd tekstów (PL i EN, wyrywkowo inne z 35) + decyzje i utrzymanie w roku 1. Skala: 0,5 h (logika bez ekranu), 1 h (jeden stan ekranu), 1,5–2 h (ekran z danymi), 3 h (kilka ekranów, powiadomienia, uprawnienia albo zakup), 4 h (treść ze źródłami roli 06 do przeglądu). Czas agenta nie liczy się (zasada wspólna 13).
4. **Apetyt** 60 h (D-040): liczą się tylko funkcje MVP; TEST, PÓŹNIEJ i NIE nie zużywają apetytu.

Wynik rankingu (`zakres.mjs`, niżej; stałe 37 h, potem malejąco): F-07 i F-16 (72) → F-26 (56) → F-23 (48) → F-13 (42,7) → F-11 (32) → F-24 (30) → F-14 (26,7) → F-18 (25) → F-10, F-38 (24) → F-55 (12) → F-44, F-61 (10) → F-62 (8) → F-56 (7,5) → F-43 (6,7) → F-63 (5) → F-30 (1,9) → F-45 (1,7) → F-08 (0,6) → F-50 (0,4). Linia 60 h przypada po F-55 (narastająco 59 h).

### Warianty zakresu
| | A: linia apetytu (59 h) | **B: zasady właściciela (rekomendacja, ok. 67 h)** | C: pełna aplikacja z dowodem (ok. 77,5 h) |
|---|---|---|---|
| MVP | podłogi i pętla; liczenie (F-09, F-10, F-11, F-38), plan (F-13, F-14), prowadzenie (F-07, F-16, F-18, F-57, F-58), zakwas (F-22…F-25, F-60, F-64), receptury i dziennik (F-26…F-28), drożdże i pizza (F-55), start (F-68), opinie (F-69) | A + obudzenie zakwasu z lodówki (F-61) + Doktor dla bochenka (F-43, ZP-20) + Akademia jako „po co ten krok” przy kroku (F-44; lekcje osobno później, H-13 a) + sól (F-56) + poprawa wpisu zakwasu (F-62) | B + spiżarnia (F-30), porównanie (F-63), przelicznik objętości (F-45), QR (F-08), druk (F-50) |
| PÓŹNIEJ (wejście ukryte, kod i dane zostają) | F-61, F-43, F-44, F-56, F-62, F-30, F-63, F-45, F-08, F-50 | F-30, F-63, F-45, F-08, F-50 | — |
| Wspólne | NIE: F-53 masa lodu (WTP-X); TEST: F-15 ocena gotowości ciasta; PÓŹNIEJ: F-70 synchronizacja iPhone–iPad (H-11) i F-46…F-49, F-52 bez zmian (D-034) | jw. | jw. |
| Koszt właściciela [OCENA] | 59 h | 67 h (7 h ponad apetyt: decyzja właściciela; `zakres.mjs` daje uwagi, nie błędy) | 77,5 h (17,5 h ponad) |
| Ryzyko | łamie ZP-20 („narzędzie i nauka: Akademia i Doktor”) i dotychczasowe wyjątki D-029 (QR), D-034 (spiżarnia, druk); słabsza nauka dla P-6 | zmienia wyjątki D-029 i D-034 pyt. 6a, 7b (QR, spiżarnia, druk → PÓŹNIEJ): użytkownicy TestFlight z zapisaną spiżarnią zachowują dane w bazie i w eksporcie (F-33), wejście wraca bramką ZM | najdłużej do wydania; 5 funkcji o słabym dowodzie (R słabe albo H) w 35 językach; więcej testów na telefonie (aparat, druk) |
| Zgodność z „pełnym eksperymentem” | eksperyment na węższej aplikacji (pomiar zaburzony, plan napraw M1) | cała pętla i nauka; wypadają tylko dodatki spoza pętli o najsłabszym dowodzie | pełna |

Rekomendacja: **B**. Najlepsza w klasie aplikacja robi pętlę lepiej, a nie ma więcej funkcji (wzorzec Rise, zasada wspólna 18); B zachowuje Twoje wybory ZP-20 i ZP-23, wycina z pierwszej wersji tylko dodatki o najsłabszym dowodzie za cenę ok. 7 h ponad apetyt (Doktor i Akademia: 5 h, to wybór ZP-20). Kombajn w kodzie (M1-audytor-generalny-057: 9 akcji Kalkulatora) zmniejsza się, bo z akcji znikają QR, druk i spiżarnia; DEC-09 a (3–4 akcje główne) staje się wykonalne.

### Podział na aplikacje (H-09)
- (a) **jedna aplikacja**, pizza i drożdże jako rodzaj receptury w tej samej pętli (F-55) — rekomendacja: ten sam piekarz piecze chleb i pizzę (BRD rec. 5769683066; Rise 12576631706), bramka opłacalności poniżej progu nie udźwignie drugiej aplikacji (wydania, recenzje App Review, opis w 35 językach), 4.3(a) przeciw wielu Bundle ID;
- (b) jedna aplikacja z częścią pizzową włączaną w ustawieniach — dokłada przełącznik przed główną pracą (sygnał kombajnu), start BR-START-001 już rozdziela ścieżki;
- (c) osobna aplikacja do pizzy — drugi koszt sklepu bez dowodu popytu; 4.3(b) i 4.2: musi się obronić sama.

### Darmowe i płatne
Bez zmian względem D-038 i kontraktu płatności roli 02 (zasada: nie proponuję zmian). Nowe funkcje mieszczą się w istniejącym podziale: F-68 (start) to nawigacja — oferta przy pierwszym użyciu funkcji (BR-ZAK-005); F-69 (ocena, kontakt) jest w ustawieniach, czyli zawsze dostępna. Uwaga dla 02: dopisać F-69 do listy „zawsze, bez zakupu” w kontrakcie płatności.

### Plan aktualizacji dla 3.1.2(a) (prośba roli 02)
- (a) **co kwartał** jedna aktualizacja z treścią: 2–3 receptury bazowe albo lekcje „po co ten krok” ze źródłami roli 06, w 35 językach, plus poprawki z recenzji; [OCENA] ok. 3 h właściciela na wydanie — rekomendacja;
- (b) co 6–8 tygodni, to samo — ok. 6 h na kwartał, szybszy sygnał „stałej wartości”, ale wyższy koszt utrzymania.
Uzasadnienie wartości subskrypcji leży głównie w narzędziach pętli używanych przy każdym wypieku (MS-05); treść jest uzupełnieniem, nie jedynym argumentem.

### Pętla opinii (polecenie roli, E2 pkt 6)
F-69 w wersji 1 we wszystkich wariantach (BR-OPIN-001…003, bloker OG-07). Próg „udanego wypieku” (OP-49): rekomendacja ≥ 4★ (2★ i mniej prowadzi do Doktora, BR-DIAG-001; 3★ bez prośby).

### Miary USA (zadanie M1-audytor-generalny-096, przekazane przez sesję audytu M1 2026-10-20)
Właściciel: „Dopisz zadanie pełnego pokrycia miar USA do partii 5 i przekaż je rolom 03 i 04 jako wymaganie.” Skutek: F-38 obejmuje ekrany, pola wejścia, eksporty i powiadomienia (koszt 2 h zamiast 1 h, ranking 12 zamiast 24; F-38 nadal w MVP we wszystkich wariantach). ER-49 do roli 01: BR-UST-001 ma tylko scenariusze wyświetlania; brak wejścia w °F i oz, eksportów, powiadomień, zakresu 20–26 °C w °F (68–79 °F) i ustawienia domyślnego.
Decyzja zakresu (ustawienie domyślne jednostek):
- (a) **według regionu urządzenia** (US → imperialne, reszta → metryczne), zmiana w ustawieniach — rekomendacja: pierwszy ekran od razu w miarach użytkownika, bez nowego ustawienia przed główną pracą;
- (b) zawsze metryczne, imperialne tylko po przełączeniu — mniej przypadków testowych, ale użytkownik z US widzi na start gramy i °C (skargi ZAL-037).

### Drobne rozstrzygnięcia „właściciel z rolą 03”
- OP-38 domyślny odstęp przypomnienia na blacie: **12 h** (S-44, RD-25) — rekomendacja; dłuższy odstęp wymaga źródła (rola 06).
- OP-41 kopia poza telefonem: (a) kopia urządzenia iCloud systemu + przypomnienie o eksporcie pliku po N wypiekach, bez wyjątku od zakazu sieci — rekomendacja; (b) plik w iCloud Drive jako nazwany wyjątek; (c) tylko ręczny eksport. Technikę potwierdza rola 05.

## Zakres (propozycja: wariant B)
Główna praca, pętla i wzorzec: sekcja E1.
- Pętla główna: start F-68 → receptura F-26 albo F-27 → ilości F-09 → plan F-13 z czasem F-14 → prowadzenie F-07 z sygnałem F-16 i powrotem F-58 → dziennik F-28; wejście zakwasu F-60, F-22, F-23, F-24, F-25; wejście drożdży i pizzy F-55.

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

## NIE robimy (propozycja)
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

## Ranking ([OCENA]: R = odsetek użytkowników pętli w miesiącu, koszt = godziny właściciela w wersji 1, metoda w E2)
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

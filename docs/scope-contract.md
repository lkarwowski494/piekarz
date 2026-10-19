# Kontrakt zakresu: Piekarz (Crust)
Stan: E0 (rola 03 build, sztafeta 01–04) · Aktualizacja: 2026-10-19 · Wejście: BRD roli 01 (`docs/brd/`, 50 BR, 17 PR, 11 J), `docs/monetyzacja.md` roli 02 (E3, D-038, D-039), `docs/zalozenia.md` · Poprzednia wersja (inwentarz, nie wzorzec): `docs/archiwum/scope-contract-2.0.md`

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

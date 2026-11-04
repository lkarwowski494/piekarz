# BRD Piekarz (Crust) — stan i spis

Stan: E3 (rola 01 build, sztafeta 01–04) · Aktualizacja: 2026-11-03 (rola 01 fix: paczka M3, ER-75…ER-78; wcześniej 2026-10-22: kalendarz tygodnia, ER-62…ER-70) · Hierarchia źródeł: D-035 · Decyzje: `docs/decyzje.md` (od D-035), `docs/DECISIONS.md` (do D-034) · Założenia: `docs/zalozenia.md`

Nowe BRD, budowane od zera według polecenia roli 01 (tryb build). BRD 2.0-craft leży w `archiwum/2.0-craft/` i nie jest wejściem dla innych ról; mapa ID: `errata.md` (ER-34…ER-48). Kontrola: `node kontrola-brd.mjs docs/brd` (skrypt roli 01; wynik w `docs/sztafeta.md`); wektory: `tests/wektory/brd.json`.

Streszczenie: Piekarz prowadzi domowego piekarza (P-6 początkujący bez zakwasu, P-7 regularny piekarz, P-8 pizza i pieczywo drożdżowe) przez 16 prac J: liczenie z zakwasem i zaczynami, plan wsteczny z sygnałem przy uśpionym telefonie, zakwas od zera i jego prowadzenie, dziennik z poprawą następnego wypieku, naukę i Doktora Chleba, dane bez ryzyka utraty. Zakres pierwszej wersji, podział i cena nie są tu rozstrzygane: hipotezy H-03…H-14 dla ról 02 i 03.

## Spis

| Plik | Zawartość | Stan |
|---|---|---|
| `README.md` | stan, spis, streszczenie, otwarte pytania, blokery wydania | E3 |
| `odkrywanie.md` | wywiad, prace J, persony P, kontekst użycia, zasady ZP, rynek, ograniczenia OG, hipotezy H, ryzyka RYZ | E2 + J-12, OG-07, J-16 (ER-77) |
| `zrodla.md` | źródła S | E2 + S-62…S-64, S-100 (ER-78), S-101…S-108 (ER-77) |
| `reguly.md` | reguły RD-14…RD-28, RD-35…RD-39 z wektorami | E2 + F-71, RD-37…RD-39 (ER-77) |
| `wymagania.md` | przepływy PR-01…PR-18, PR-24, PR-25, wymagania NFR | E3 + PR-18, PR-25 (ER-77) |
| `wymagania-liczenie.md` | BR-KALK, BR-UST-001 | E3 + BR-KALK-012 (ER-75) |
| `wymagania-wypiek.md` | BR-HARMO, BR-ETAP, BR-CZAS, BR-REKA | E3 + BR-HARMO-005, BR-ETAP-006 |
| `wymagania-zakwas.md` | BR-ZAKW | E3 |
| `wymagania-dziennik.md` | BR-RECP, BR-SPIZ, BR-NAUK, BR-DIAG, BR-WSP, BR-DRUK, BR-OPIN | E3 + BR-OPIN-001…003, BR-DIAG-003…005 (F-71), BR-RECP-005 (ER-76) |
| `wymagania-dane.md` | BR-DANE, BR-ZAK, BR-UST-003, BR-PRYW, BR-START | E3 + BR-START-001 |
| `wymagania-kalendarz.md` | PR-19…PR-23, BR-KAL-001…016, NFR-KAL, reguły RD-29…RD-34 (kalendarz tygodnia na „Dziś”) | E3, przyrost 2026-10-22 |
| `wymagania-maszyna.md` | BR-MASZ-001…006 (tryb maszyny do chleba, F-72, PR-25, J-16; reguły RD-37…RD-39) | ER-77, 2026-11-03 |
| `errata.md` | errata ER-34…ER-78 | E3 + 2026-10-22, 2026-11-03 (ER-75…ER-78) |

## Otwarte pytania

| ID | Pytanie | Rozstrzyga | Dotyczy |
|---|---|---|---|
| OP-29 | Rozstrzygnięte 2026-10-19: rytm dokarmiania według RD-25 (S-44) | źródła | J-04 |
| OP-30 | [DO USTALENIA] jak piekarze dziś przekazują sobie receptury i czego się przy tym obawiają | rozmowy z użytkownikami (później, D-036) | J-06 |
| OP-31 | Rozstrzygnięte 2026-10-19: czas założenia i gotowość według RD-24 (S-44, S-43, S-53) | źródła | J-07, ZAL-034 |
| OP-32 | [DO USTALENIA] jak dane aplikacji przechodzą na nowy telefon (kopia iCloud urządzenia, plik eksportu) | dokumentacja Apple (E2), rola 05 | J-10, ZAL-036 |
| OP-33 | [DO USTALENIA] jakie dane o ofercie wprowadzającej, przejściu do płatnego i odnowieniach daje App Store Connect bez telemetrii w aplikacji | dokumentacja Apple (E2) | ZP-21, ZAL-038 |
| OP-34 | [DO USTALENIA] powyżej jakiej temperatury wody aplikacja ostrzega, że zaszkodzi drożdżom i zakwasowi (kod: 45 °C bez źródła) | źródła szczebla 1–3, rola 06 | RD-16 |
| OP-35 | Rozstrzygnięte 2026-10-21 (D-066 2a, ER-55): temperatura w planie tylko z wyboru 20–26 °C, więc stanu „poza zakresem” w planie nie ma i komunikat nie jest potrzebny | właściciel z rolą 04 | RD-17 |
| OP-36 | [DO USTALENIA] czy kolor płynu na zakwasie (ciemny) ma znaczenie dla bezpieczeństwa | źródła szczebla 1–3, rola 06 | RD-21 |
| OP-37 | [DO USTALENIA] zasady bezpieczeństwa przy kamieniu do pieczenia i piecu do pizzy | źródła szczebla 1–3 | RD-23, J-11 |
| OP-38 | Rozstrzygnięte 2026-10-20 (D-043 pkt 4, ER-50): domyślny odstęp przypomnienia o dokarmianiu na blacie 12 h (S-44) | właściciel z rolą 03 | RD-25 |
| OP-39 | [DO USTALENIA] progi faz zakwasu w godzinach po dokarmieniu (kod: do 2 h, do 5 h, szczyt 5–9 h, głodny po 14 h) | źródła szczebla 1–3, rola 06 | J-04, RD-24 |
| OP-40 | [DO USTALENIA] czas zimnej fermentacji ciasta na pizzę ze źródła szczebla 1–3 (przewodnik S-60: 24–48 h) | źródła, rola 06 | J-11 |
| OP-41 | Rozstrzygnięte 2026-10-20 (D-043 pkt 4, ER-50): kopia urządzenia (iCloud systemu) i przypomnienie o eksporcie pliku, bez wyjątku od zakazu sieci (technika: rola 05) | właściciel z rolami 03 i 05 | BR-DANE-002 |
| OP-42 | [DO WYJAŚNIENIA] dopuszczalne opóźnienie sygnału kroku przy zablokowanym ekranie | właściciel z rolą 05 | NFR-CZAS-001 |
| OP-43 | [DO WYJAŚNIENIA] budżet czasu startu i reakcji kalkulatora | rola 05 | NFR-WYD-001 |
| OP-44 | [DO USTALENIA] masy składników w przeliczniku objętości (g na szklankę, łyżkę) ze źródła szczebla 1–3 | rola 06 | BR-KALK-007 |
| OP-45 | Rozstrzygnięte 2026-10-21 (D-066 1a, ER-55): godziny snu domyślnie 23:00–07:00, wybór w Ustawieniach z opcją „Bez godzin snu”; przesunięcie kroków (BR-HARMO-004) sprawdza te same godziny | właściciel z rolą 04 | BR-HARMO-002 |
| OP-46 | [DO USTALENIA] opis próby gotowości ciasta przed pieczeniem ze źródła | rola 06 | BR-ETAP-003 |
| OP-47 | Rozstrzygnięte 2026-10-19: 3 dni (D-039, rola 02) | właściciel | BR-ZAK-004 |
| OP-48 | Rozstrzygnięte 2026-10-19: wypiek rozpoczęty w czasie dostępu prowadzi się do końca, bez nowego (D-039, rola 02) | właściciel | BR-ZAK-004 |
| OP-49 | Rozstrzygnięte 2026-10-20: udany wypiek to ocena co najmniej 4★ (D-042); od 2026-10-22 warunek prośby o ocenę bez oceny bochenka: od 3. ukończonego wypieku, odstęp 14 dni (D-067 uchyla próg 4★ w warunku prośby, ER-61) | właściciel | BR-OPIN-001 |
| OP-50 | [DO USTALENIA] czy iOS otwiera plik .ics z arkusza udostępniania w Kalendarzu | test na urządzeniu, rola 05 | BR-KAL-011, H-18 |
| OP-51 | Rozstrzygnięte 2026-10-22 (właściciel przez M1: „Pasek z adnotacja”; układ D-105): kalendarz widać bez danych, pasek tygodnia z adnotacją w pasie u góry, trzy ścieżki pod pasem (ER-72) | właściciel z rolą 04 | BR-KAL-005 |
| OP-52 | [DO WYJAŚNIENIA] od jakiego rozmiaru tekstu pasek przechodzi w listę dni | rola 04 | NFR-KAL-002 |
| OP-53 | [DO USTALENIA] czy `getCalendars().firstWeekday` oddaje wybór „pierwszy dzień tygodnia” w ustawieniach iOS i co przy pustej wartości; `Intl.Locale` nie jest na liście API Hermes | test na urządzeniu, rola 05 | RD-30 |
| OP-54 | Rozstrzygnięte 2026-10-22 (D-093, właściciel przez M1): numer dnia zakładania liczony dniami kalendarza, dzień 1 = dzień założenia | właściciel | RD-31, BR-ZAKW-005 |
| OP-55 | Rozstrzygnięte 2026-10-22 (D-113, kontrakt roli 02, wdrożenie D-116): przypomnienia o dokarmianiu w Pro poza zakładaniem, więc bez Pro pasek nie pokazuje następnego karmienia (ER-74) | rola 02 | BR-KAL-006 |
| OP-56 | [DO USTALENIA] limit oczekujących powiadomień lokalnych `UNUserNotificationCenter` (64 w dokumentacji wycofanego API, S-74) | dokumentacja Apple, rola 05 | OG-10, BR-KAL-009 |
| OP-57 | [DO WYJAŚNIENIA] czy godziny snu mogą być różne w różne dni tygodnia (dziś jedne, D-066) | właściciel z rolą 03 | P-9, BR-HARMO-002 |
| OP-58 | [DO USTALENIA] rytm dokarmiania zakwasu bezglutenowego ze źródła szczebla 1–3 (poradnik: 24 h na blacie) i czy aplikacja ma go obsłużyć | źródła, rola 06; zakres: rola 03 | RD-25, RYZ-21 |
| OP-59 | Rozstrzygnięte 2026-10-22 (D-094): 3 pozycje przyszłe w linii „Następne”, „Zaległe” zawsze ponad limit, reszta pod „+N” | właściciel | RD-32, BR-KAL-003 |
| OP-60 | Rozstrzygnięte 2026-10-22 (D-094): po „Pomiń” karmienia następny termin od chwili pominięcia; pominięcia poza kopią zapasową | właściciel | RD-32, BR-KAL-003, BR-KAL-007 |
| OP-61 | [DO USTALENIA] czy sól można jeszcze dodać w trakcie pierwszego rośnięcia (źródła mówią „przed” i „po”, nie „w trakcie”; wątek forum S-96 radzi wyrobić, szczebel 5) | rola 06 | RD-35 |
| OP-62 | [DO WYJAŚNIENIA] (OP-62) czy wybór „na drożdżach” zapamiętuje się przy recepturze i czy wypiek oraz wpis w Dzienniku zapisują, którą wersję upieczono; bez tego poprawa następnego wypieku (J-05) miesza obie wersje | rola 03 z rolami 04 i 05 | BR-RECP-005, J-05 |
| OP-63 | [DO USTALENIA] (OP-63) co po przełączeniu na drożdże dzieje się z mąką i wodą, które w wersji na zakwasie wnosi zakwas (te same procenty całkowite czy procenty ze źródła wersji drożdżowej); dane roli 06 podają procent drożdży względem mąki (`docs/tresci/wektory/m3-2026-11-03.json`) | rola 06 z rolą 05 | BR-RECP-005, RD-14 |
| OP-64 | [DO USTALENIA] (OP-64) kto poza właścicielem piecze w maszynie do chleba z aplikacją do receptur i jak często (persona i częstotliwość J-16); korpus recenzji nie przeszukany pod „machine” | rozmowy z użytkownikami (później, D-036), rola 01 przy następnym badaniu rynku | J-16, PR-25 |
| OP-65 | Rozstrzygnięte 2026-11-04 (D-266, rola 06): wszystkie pięć przeczytanych instrukcji ustawia opóźniony start jako czas do gotowości chleba (koniec programu), a maszyna sama wlicza czas programu; Zojirushi przyjmuje godzinę zakończenia (rejestr MAS-086). Zmiana ekranu i BR-MASZ-005: rola 08 | instrukcje producentów, rola 06 | BR-MASZ-005, D-189 |
| OP-66 | Rozstrzygnięte 2026-11-04 (D-266, rola 06): czasy programów ze źródła szczebla 1 są cechą modelu i wielkości bochenka (Panasonic SD-YR2550, MAS-033; Cuisinart CBK-110, MAS-043; Tefal bez tabeli, MAS-015), więc jednej podpowiedzi czasu nie ma; zostaje wpis użytkownika z instrukcji (D-189) | rola 06 | BR-MASZ-005, D-189 |
| OP-67 | [DO USTALENIA] (OP-67) czy źródło szczebla 1–3 dopuszcza krótkie opóźnienie przy nabiale i jajkach (reguła 2 godzin FDA wobec opóźnionego startu; rejestr MAS-073); do tego czasu blokada całkowita; 06m (2026-11-04): pięć instrukcji bez dozwolonego krótkiego opóźnienia, źródła szczebla 1–3 nie znaleziono | rola 06 | RD-38, BR-MASZ-005 |
| OP-68 | [DO USTALENIA] (OP-68) progi cukru i tłuszczu dla programów „słodki” i „francuski” ze źródła (rejestr MAS-080: jedyny próg liczbowy to 50% mąki pełnoziarnistej w Cuisinart CBK-110); do tego czasu reguła Piekarza D-179 | rola 06 | RD-39 |
| OP-69 | [DO WYJAŚNIENIA] (OP-69) jak tryb maszyny rozpoznaje składniki z listy blokady (RD-38) w recepturach własnych, w których użytkownik wpisuje składnik dowolnym tekstem (lista do wyboru, pytanie przy włączeniu opóźnienia, blokada przy każdym składniku spoza listy) | rola 04 z rolą 05 | RD-38, BR-MASZ-005 |
| OP-70 | [DO WYJAŚNIENIA] (OP-70) który koniec przedziału czasu z receptury (początek, środek, koniec) bierze plan wsteczny wersji drożdżowej, skoro czasy nie są przeliczane (D-174), a gotowość ocenia test palca | rola 03 z rolą 04; dane: rola 06 | BR-HARMO-001, D-174 |
| OP-71 | [DO USTALENIA] (OP-71) temperatury pieca ze specyfikacji (Altamura 250 °C, pierożki karelskie 250–300 °C, obwarzanek 250–320 °C, rupjmaize 280–350 °C; rejestr KAT-ALT-005, KAT-KAR-003, KAT-OBW-012, KAT-RUP-005) wobec piekarnika domowego: czy i jaką temperaturę aplikacja podaje w planie i prowadzeniu | rola 06 | BR-RECP-001, D-177 |
| OP-72 | [DO USTALENIA] (OP-72) czy przepis w płatnej aplikacji jest „wykorzystywaniem w celach handlowych” nazwy chronionej (rozp. (UE) 2024/1143 art. 26 ust. 1, rejestr KAT-PRA-001, KAT-PRA-002; nazwy GTS: art. 24 rozp. 1151/2012) — opinia prawna; do tego czasu nazwy opisowe (D-177) | właściciel (opinia prawna, krok właściciela) | BR-RECP-001, D-177 |
| OP-73 | [DO USTALENIA] (OP-73) czy blokada opóźnionego startu (RD-38) obejmuje składniki, które nie trafiają do maszyny (mleko w nadzieniu pierożków karelskich, KAT-KAR-002), i czy pierożki w ogóle mają tryb maszyny (raport roli 06: „nie (formowanie ręczne; źródło milczy)”, D-179 wymienia pierożki przy programie „ciasto”); do tego czasu blokada według całej receptury; 06m (2026-11-04): źródła szczebla 1–3 nie znaleziono | rola 06 | RD-38, RD-39, BR-MASZ-005 |

## Blokery wydania

Wejście dla roli 07 (werdykt gotowości). Niespełnienie któregokolwiek blokuje wydanie.

- BR-DANE-001, BR-DANE-003, BR-DANE-004, NFR-DANE-003, NFR-DANE-004: utrata danych użytkownika.
- BR-ETAP-005: główny przepływ (trwający wypiek ginie po zamknięciu aplikacji).
- BR-ETAP-006: utrata trwającego wypieku przy starcie drugiego (RYZ-26, potwierdzone testem M3 2026-10-22; poprawka c927a6d poza master; kształt pytania D-091).
- BR-CZAS-002, BR-CZAS-003: główny przepływ i obietnica celu („pilnuje czasu, gdy telefon śpi”, OG-05).
- BR-HARMO-001, BR-ETAP-001, BR-KALK-001, BR-KALK-002: główny przepływ.
- BR-ZAKW-004, BR-ZAKW-005, BR-DIAG-002 w części RD-21: reguła krytyczna (pleśń).
- BR-ETAP-004, BR-DIAG-004: bezpieczeństwo w kontekście użycia (RD-22, RD-23).
- BR-ZAK-001, BR-ZAK-003, BR-ZAK-004, BR-ZAK-005: polityka sklepu (OG-01, OG-02, OG-03) i obietnica DEC-01 d.
- BR-UST-003: polityka sklepu (OG-04).
- BR-OPIN-001, BR-OPIN-002: polityka sklepu (OG-07: tylko systemowa prośba o ocenę).
- BR-PRYW-001, NFR-OFF-001, NFR-PRYW-001: obietnica prywatności.
- Kalendarz w 1.0 (D-092): blokerami są BR-KAL-007 (decyzje bez zmiany danych wypieków i zakwasów) i BR-KAL-009 w scenariuszu aktualizacji z wersji z jednym planem (utrata trwającego wypieku przy migracji).
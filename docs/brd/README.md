# BRD Piekarz (Crust) — stan i spis

Stan: E3 (rola 01 build, sztafeta 01–04) · Aktualizacja: 2026-10-22 (przyrost: kalendarz tygodnia, ER-62…ER-65) · Hierarchia źródeł: D-035 · Decyzje: `docs/decyzje.md` (od D-035), `docs/DECISIONS.md` (do D-034) · Założenia: `docs/zalozenia.md`

Nowe BRD, budowane od zera według polecenia roli 01 (tryb build). BRD 2.0-craft leży w `archiwum/2.0-craft/` i nie jest wejściem dla innych ról; mapa ID: `errata.md` (ER-34…ER-48). Kontrola: `node kontrola-brd.mjs docs/brd` (skrypt roli 01; wynik w `docs/sztafeta.md`); wektory: `tests/wektory/brd.json`.

Streszczenie: Piekarz prowadzi domowego piekarza (P-6 początkujący bez zakwasu, P-7 regularny piekarz, P-8 pizza i pieczywo drożdżowe) przez 12 prac J: liczenie z zakwasem i zaczynami, plan wsteczny z sygnałem przy uśpionym telefonie, zakwas od zera i jego prowadzenie, dziennik z poprawą następnego wypieku, naukę i Doktora Chleba, dane bez ryzyka utraty. Zakres pierwszej wersji, podział i cena nie są tu rozstrzygane: hipotezy H-03…H-14 dla ról 02 i 03.

## Spis

| Plik | Zawartość | Stan |
|---|---|---|
| `README.md` | stan, spis, streszczenie, otwarte pytania, blokery wydania | E3 |
| `odkrywanie.md` | wywiad, prace J, persony P, kontekst użycia, zasady ZP, rynek, ograniczenia OG, hipotezy H, ryzyka RYZ | E2 + J-12, OG-07 |
| `zrodla.md` | źródła S | E2 + S-62…S-64 |
| `reguly.md` | reguły RD-14…RD-27 z wektorami | E2 |
| `wymagania.md` | przepływy PR-01…PR-18, wymagania NFR | E3 + PR-18 |
| `wymagania-liczenie.md` | BR-KALK, BR-UST-001 | E3 |
| `wymagania-wypiek.md` | BR-HARMO, BR-ETAP, BR-CZAS, BR-REKA | E3 + BR-HARMO-005, BR-ETAP-006 |
| `wymagania-zakwas.md` | BR-ZAKW | E3 |
| `wymagania-dziennik.md` | BR-RECP, BR-SPIZ, BR-NAUK, BR-DIAG, BR-WSP, BR-DRUK, BR-OPIN | E3 + BR-OPIN-001…003 |
| `wymagania-dane.md` | BR-DANE, BR-ZAK, BR-UST-003, BR-PRYW, BR-START | E3 + BR-START-001 |
| `wymagania-kalendarz.md` | PR-19…PR-23, BR-KAL-001…016, NFR-KAL, reguły RD-29…RD-31 (kalendarz tygodnia na „Dziś”) | E3, przyrost 2026-10-22 |
| `errata.md` | errata ER-34…ER-65 | E3 + 2026-10-22 |

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
| OP-51 | [DO WYJAŚNIENIA] czy kalendarz pokazuje się bez danych (H-16) | właściciel z rolą 04 | BR-KAL-005 |
| OP-52 | [DO WYJAŚNIENIA] od jakiego rozmiaru tekstu pasek przechodzi w listę dni | rola 04 | NFR-KAL-002 |
| OP-53 | [DO USTALENIA] czy `getCalendars().firstWeekday` oddaje wybór „pierwszy dzień tygodnia” w ustawieniach iOS i co przy pustej wartości; `Intl.Locale` nie jest na liście API Hermes | test na urządzeniu, rola 05 | RD-30 |
| OP-54 | [DO WYJAŚNIENIA] numer dnia zakładania zakwasu: okresy 24 h od startu (dziś) czy dni kalendarza | właściciel z rolą 06 | RD-31, BR-ZAKW-005 |
| OP-55 | [DO WYJAŚNIENIA] potwierdzenie roli 02, że brak następnego karmienia na pasku w trybie „tylko historia” to wykładnia D-038, a nie zmiana podziału | rola 02 | BR-KAL-006 |
| OP-56 | [DO USTALENIA] limit oczekujących powiadomień lokalnych `UNUserNotificationCenter` (64 w dokumentacji wycofanego API, S-74) | dokumentacja Apple, rola 05 | OG-10, BR-KAL-009 |
| OP-57 | [DO WYJAŚNIENIA] czy godziny snu mogą być różne w różne dni tygodnia (dziś jedne, D-066) | właściciel z rolą 03 | P-9, BR-HARMO-002 |
| OP-58 | [DO USTALENIA] rytm dokarmiania zakwasu bezglutenowego ze źródła szczebla 1–3 (poradnik: 24 h na blacie) i czy aplikacja ma go obsłużyć | źródła, rola 06; zakres: rola 03 | RD-25, RYZ-21 |

## Blokery wydania

Wejście dla roli 07 (werdykt gotowości). Niespełnienie któregokolwiek blokuje wydanie.

- BR-DANE-001, BR-DANE-003, BR-DANE-004, NFR-DANE-003, NFR-DANE-004: utrata danych użytkownika.
- BR-ETAP-005: główny przepływ (trwający wypiek ginie po zamknięciu aplikacji).
- BR-ETAP-006: utrata trwającego wypieku przy starcie drugiego (RYZ-26, potwierdzone testem M3 2026-10-22; poprawka c927a6d poza master, różnice: ER-65).
- BR-CZAS-002, BR-CZAS-003: główny przepływ i obietnica celu („pilnuje czasu, gdy telefon śpi”, OG-05).
- BR-HARMO-001, BR-ETAP-001, BR-KALK-001, BR-KALK-002: główny przepływ.
- BR-ZAKW-004, BR-ZAKW-005, BR-DIAG-002 w części RD-21: reguła krytyczna (pleśń).
- BR-ETAP-004: bezpieczeństwo w kontekście użycia (RD-22, RD-23).
- BR-ZAK-001, BR-ZAK-003, BR-ZAK-004, BR-ZAK-005: polityka sklepu (OG-01, OG-02, OG-03) i obietnica DEC-01 d.
- BR-UST-003: polityka sklepu (OG-04).
- BR-OPIN-001, BR-OPIN-002: polityka sklepu (OG-07: tylko systemowa prośba o ocenę).
- BR-PRYW-001, NFR-OFF-001, NFR-PRYW-001: obietnica prywatności.
- Kalendarz (BR-KAL) nie jest blokerem, dopóki rola 03 nie włączy go do wydania (H-15). Po włączeniu blokerem jest BR-KAL-007 (kalendarz nie zmienia danych), a przy wersji z planami BR-KAL-009 w scenariuszu aktualizacji (utrata trwającego wypieku).
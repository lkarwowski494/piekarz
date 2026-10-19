# BRD Piekarz (Crust) — stan i spis

Stan: E2 (rola 01 build, sztafeta 01–04) · Aktualizacja: 2026-10-19 · Hierarchia źródeł: D-035 · Decyzje: `docs/decyzje.md` (od D-035), `docs/DECISIONS.md` (do D-034) · Założenia: `docs/zalozenia.md`

Nowe BRD, budowane od zera według polecenia roli 01 (tryb build). Pliki BRD 2.0-craft w tym katalogu (`00_START.md`, `00b_Decyzje.md`, `00c_Errata.md`, `A1.md`…`D4.md`, `S.md`, `W.md`) są do E3 inwentarzem i nie są wejściem dla innych ról; w E3 trafią do `archiwum/2.0-craft/` z mapą ID w `errata.md`.

## Spis

| Plik | Zawartość | Stan |
|---|---|---|
| `README.md` | stan, spis, otwarte pytania, blokery wydania | E1 |
| `odkrywanie.md` | wywiad, prace J, persony P, kontekst użycia, zasady ZP, rynek, ograniczenia OG, hipotezy H, ryzyka RYZ | E2 |
| `zrodla.md` | źródła S | E2 |
| `reguly.md` | reguły RD-14…RD-27 z wektorami | E2 |
| `wymagania-*.md`, `errata.md` | przepływy PR, BR, NFR; errata ER | E3 |

## Otwarte pytania

| ID | Pytanie | Rozstrzyga | Dotyczy |
|---|---|---|---|
| OP-29 | Rozstrzygnięte 2026-10-19: rytm dokarmiania według RD-25 (S-44) | źródła | J-04 |
| OP-30 | [DO USTALENIA] jak piekarze dziś przekazują sobie receptury i czego się przy tym obawiają | rozmowy z użytkownikami (później, D-036) | J-06 |
| OP-31 | Rozstrzygnięte 2026-10-19: czas założenia i gotowość według RD-24 (S-44, S-43, S-53) | źródła | J-07, ZAL-034 |
| OP-32 | [DO USTALENIA] jak dane aplikacji przechodzą na nowy telefon (kopia iCloud urządzenia, plik eksportu) | dokumentacja Apple (E2), rola 05 | J-10, ZAL-036 |
| OP-33 | [DO USTALENIA] jakie dane o ofercie wprowadzającej, przejściu do płatnego i odnowieniach daje App Store Connect bez telemetrii w aplikacji | dokumentacja Apple (E2) | ZP-21, ZAL-038 |
| OP-34 | [DO USTALENIA] powyżej jakiej temperatury wody aplikacja ostrzega, że zaszkodzi drożdżom i zakwasowi (kod: 45 °C bez źródła) | źródła szczebla 1–3, rola 06 | RD-16 |
| OP-35 | [DO WYJAŚNIENIA] co aplikacja pokazuje, gdy temperatura jest poza 20–26 °C (brak liczby, zakres, ostrzeżenie) | właściciel z rolą 04 | RD-17 |
| OP-36 | [DO USTALENIA] czy kolor płynu na zakwasie (ciemny) ma znaczenie dla bezpieczeństwa | źródła szczebla 1–3, rola 06 | RD-21 |
| OP-37 | [DO USTALENIA] zasady bezpieczeństwa przy kamieniu do pieczenia i piecu do pizzy | źródła szczebla 1–3 | RD-23, J-11 |
| OP-38 | [DO WYJAŚNIENIA] domyślny odstęp przypomnienia o dokarmianiu na blacie: 12 h (S-44) czy dłuższy w granicach źródeł | właściciel z rolą 03 | RD-25 |
| OP-39 | [DO USTALENIA] progi faz zakwasu w godzinach po dokarmieniu (kod: do 2 h, do 5 h, szczyt 5–9 h, głodny po 14 h) | źródła szczebla 1–3, rola 06 | J-04, RD-24 |
| OP-40 | [DO USTALENIA] czas zimnej fermentacji ciasta na pizzę ze źródła szczebla 1–3 (przewodnik S-60: 24–48 h) | źródła, rola 06 | J-11 |
## Blokery wydania

Lista powstaje w E3.

# Recenzja niezależna D-379/D-380 (subagent, 2026-11-11)
Zakres: `git diff 935cd8dc..HEAD` bez katalogu dowodów; zlecenie KO-047 i zasady (test czerwony najpierw, bez osłabiania testów, wejścia przez env, repo publiczne); bez rozumowania sesji Q.

Wynik: **brak uwag P0/P1.**
- Pełny przebieg: puste `sceny` → 7 scen w kolejności skryptu, `komplet=true`, pusty przyrostek; komplet sprawdza 7 ramek, artefakty `sklep-zrzuty`/`sklep-ramki` jak dotąd; pusty `SCENY_PLAN` = błąd.
- Niepełny zestaw: `sklep-zrzuty-czesciowe`/`sklep-ramki-czesciowe`; `asc-zrzuty.yml` pobiera dokładnie `sklep-ramki`, więc część nie zostanie wysłana.
- Wstrzyknięcia: `sceny` tylko przez env; znacznik commita filtrowany sedem `[a-z0-9,-]`, potem biała lista ze skryptu; `przyrostek` tylko w `name:`.
- Kolejność: z `SCENY` skryptu, 03 ostatnia.
- `tests/asc-zrzuty.test.ts`: asercja nieosłabiona (dokładny blok; drugi test zabrania nazwy bez przyrostka).
- Testy: 3 pliki zielone; 04 @ b27fcd3e odrzucany.

P2 (bez zmian w tej sesji, do backlogu):
1. Test A nie widzi `tapOn` po tekście, `doubleTapOn`, `longPressOn` — dziś ich brak w scenach zrzutów (KO-047 objął tapOn po id).
2. Skrypt sprawdza tylko znane nazwy w `ZRZUTY_SCENY`, kolejność bierze z planu.
3. Uzasadnienie `zgoda-dalej-btn`: właściwym dowodem jest pomiar y 273–337, nie samo `when: visible`.
4. Przypadek sprzed D-378 to wklejona kopia, nie `git show b27fcd3e` (odporne na płytki klon).

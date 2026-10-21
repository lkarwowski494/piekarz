# Dziennik wydań — Piekarz (Crust)

Plan: `docs/wydanie/sklep.md` (DEC-16 a). Jeden wiersz na build i kanał. Zgody właściciela wpisuje się jego słowami z datą, osobno na wysyłkę do recenzji i na wydanie; zgoda dotyczy jednego buildu. Wiersz z kanałem App Store bez werdyktu 07 innego niż ZABLOKOWANE albo bez zgody łamie test `tests/plan-wydania.test.ts`.

*Dlaczego:* bez powiązania wersja ↔ build ↔ SHA ↔ werdykt 07 zgłoszenie błędu od użytkownika nie wskazuje, który kod sprawdzić.

| Data | Wersja | Build | SHA | Werdykt 07 | Kanał | Decyzje | Zgody właściciela (słowa, data) | Wynik |
|---|---|---|---|---|---|---|---|---|
| 2026-10-16 | 1.0.0 | 1006 | `adfe1fa` | brak (przed audytem) | TestFlight | — | [DO USTALENIA] | tag `v1.0.0-b1006`; przetworzenie w App Store Connect [DO USTALENIA] |
| 2026-10-17 | 1.0.0 | 1007 | `276ba2f` | brak (przed audytem) | TestFlight | — | [DO USTALENIA] | tag `v1.0.0-b1007`; przetworzenie w App Store Connect [DO USTALENIA] |
| 2026-10-17 | 1.0.0 | 1012 | `0016299` | brak (przed audytem) | TestFlight | — | [DO USTALENIA] | tag `v1.0.0-b1012`; build na telefonie do testu aktualizacji 1012 → kandydat (warunek 07) |
| 2026-10-18 | 1.0.0 | 1013 | `ebd8471` | ZABLOKOWANE (07, 2026-10-19) | TestFlight | DEC-16 (a): wydanie ręczne po TestFlight | [DO USTALENIA] | tag `v1.0.0-b1013`; nie wysyłać do recenzji |

## Ustawienia App Store Connect przez API (`scripts/asc-ustawienia.mjs`)

Osobno od tabeli buildów (wpisy bez buildu) [M1-audytor-generalny-181]:
- 2026-10-21, commit `bdb854b`, przebieg na sucho (GitHub Actions run 39582555161): 714 operacji do utworzenia, skrót planu `ff854f80…1356`.
- 2026-10-21, commit `4aaf974`, zapis (run 39583333126). Zgoda właściciela: „Zgadzam się na zapis w App Store Connect listy ze skrótem ff854f80a9ab7ef057fda34490ed581bd9238dc5cb0af3176429c0581ea41356 (714 operacji), łącznie z nieodwracalnym Family Sharing.” (2026-10-21). Wynik: grupa „Piekarz Pro”, 2 subskrypcje i dożywotni z Family Sharing, nazwy en-US i pl, ceny DEC-01 d i D-038, Free Trial 2 Weeks na obu subskrypcjach, 174 storefronty bez CHN, ankieta wieku D-058; drugi przebieg na sucho w tym samym zadaniu: 0 różnic.

Daty: data commitu tagu (tagi lekkie, bez daty utworzenia). Tag `vX.Y.Z-bNNNN` tworzy workflow dopiero po udanym przesłaniu (zadanie `tag` w `.github/workflows/testflight.yml`, stan dzisiejszy); czy starsze wersje workflow działały tak samo, sprawdza właściciel w App Store Connect (TestFlight → buildy).

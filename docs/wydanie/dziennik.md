# Dziennik wydań — Piekarz (Crust)

Plan: `docs/wydanie/sklep.md` (DEC-16 a). Jeden wiersz na build i kanał. Zgody właściciela wpisuje się jego słowami z datą, osobno na wysyłkę do recenzji i na wydanie; zgoda dotyczy jednego buildu. Wiersz z kanałem App Store bez werdyktu 07 innego niż ZABLOKOWANE albo bez zgody łamie test `tests/plan-wydania.test.ts`.

*Dlaczego:* bez powiązania wersja ↔ build ↔ SHA ↔ werdykt 07 zgłoszenie błędu od użytkownika nie wskazuje, który kod sprawdzić.

| Data | Wersja | Build | SHA | Werdykt 07 | Kanał | Decyzje | Zgody właściciela (słowa, data) | Wynik |
|---|---|---|---|---|---|---|---|---|
| 2026-10-16 | 1.0.0 | 1006 | `adfe1fa` | brak (przed audytem) | TestFlight | — | [DO USTALENIA] | tag `v1.0.0-b1006`; przetworzenie w App Store Connect [DO USTALENIA] |
| 2026-10-17 | 1.0.0 | 1007 | `276ba2f` | brak (przed audytem) | TestFlight | — | [DO USTALENIA] | tag `v1.0.0-b1007`; przetworzenie w App Store Connect [DO USTALENIA] |
| 2026-10-17 | 1.0.0 | 1012 | `0016299` | brak (przed audytem) | TestFlight | — | [DO USTALENIA] | tag `v1.0.0-b1012`; build na telefonie do testu aktualizacji 1012 → kandydat (warunek 07) |
| 2026-10-18 | 1.0.0 | 1013 | `ebd8471` | ZABLOKOWANE (07, 2026-10-19) | TestFlight | DEC-16 (a): wydanie ręczne po TestFlight | [DO USTALENIA] | tag `v1.0.0-b1013`; nie wysyłać do recenzji |

Daty: data commitu tagu (tagi lekkie, bez daty utworzenia). Tag `vX.Y.Z-bNNNN` tworzy workflow dopiero po udanym przesłaniu (zadanie `tag` w `.github/workflows/testflight.yml`, stan dzisiejszy); czy starsze wersje workflow działały tak samo, sprawdza właściciel w App Store Connect (TestFlight → buildy).

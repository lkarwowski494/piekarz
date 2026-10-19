# Stan sztafety
Ścieżka: naprawa po audycie M1 (sztafeta 01 → 02 sesja 2 → 03 → 04 build przed partią 5) · Aktualizacja: 2026-10-19

| Rola | Tryb | Stan | Commit | Artefakty | Otwarte decyzje |
|---|---|---|---|---|---|
| 01 Odkrywanie | build | zakończona 2026-10-19 | gałąź `claude/01-odkrywanie-2026-10-19-279a7f` (E3: 3df4758; E4: commit z tym plikiem) | `docs/brd/`, `docs/zalozenia.md`, `docs/decyzje.md` (D-035…D-037), `tests/wektory/brd.json` | OP o statusie [DO WYJAŚNIENIA] w `docs/brd/README.md`; sekcja „Stan projektu” w `CLAUDE.md` dodana za zgodą właściciela (f140e45), pola [DO USTALENIA]: liczba testerów, standard marki |
| 02 Monetyzacja | build, sesja 2 | następna | — | — | — |

## Definicja ukończenia roli 01 (build), z dowodem

| Punkt | Dowód |
|---|---|
| Każdy [FAKT] ma źródło S przeczytane w dniu pracy; reszta w OP | 7 znaczników [FAKT] w BRD, każdy z S odczytanym 2026-10-19 (`docs/brd/zrodla.md`); cytaty sprawdzone dosłownie skryptem w surowych plikach poza S-42 i S-61 (oznaczone „niesprawdzone dosłownie”); wyjątek D-037: wytyczne App Store i ceny z odczytu innych ról tego samego dnia |
| Pytania produktowe pojedynczo, z opcjami; odpowiedzi dosłownie z datą; sprawy merytoryczne hierarchią źródeł | wywiad 5 pytań, tabela w `docs/brd/odkrywanie.md`; D-036, D-037 ze słowami właściciela; hierarchia D-035 (merytoryczna) |
| Reguła RD: wzór, jednostki, granica, podstawa, ≥ 3 wektory z granicą i obiema stronami; krytyczne tylko ze szczebla 1–3, oznaczone dla 06 | 14 reguł, 77 wektorów (`docs/brd/reguly.md`); reguły jakościowe RD-21…RD-23 mają „Granica: brak” (nazwane) i wektor błędu; krytyczne RD-21, RD-22, RD-23 ze szczebla 1 i 3; `kontrola-brd.mjs` sprawdza szczebel |
| BR wynika z PR, PR z J; scenariusz główny z obserwowalnym wynikiem; liczby ze źródła, decyzji albo OP; NFR mierzalne | 50 BR, 17 PR, 11 J; `kontrola-brd.mjs docs/brd docs/zalozenia.md` bez `--szkic`: 0 błędów, 0 uwag, kod 0 (2026-10-19) |
| OG z polityk użytych w przepływach przypisane do wymagań | OG-01, OG-02, OG-03 → BR-ZAK-001; OG-04 → BR-UST-003; OG-05 → BR-CZAS-002; OG-06 → H-09 (podział, bez przepływu) |
| Cena, zakres MVP i podział tylko jako H | H-03…H-14; BRD nie ma etykiety MVP ani ceny własnej |
| Kontrola z kodem 0; BRD w miejscu z `CLAUDE.md`; w publicznym repo bez danych rozmówców i cudzych materiałów | wynik wyżej; BRD w `docs/brd/` (`CLAUDE.md` nie wskazuje innego miejsca); rozmów z użytkownikami nie było (D-036); cytaty recenzji ≤ 1 zdanie, surowe pobrania tylko w `audit/01-odkrywanie-build-2026-10-19/` poza gitem |
| Nie sprawdzone | `npm test` nie uruchomiony: w worktree brak `node_modules`, a `npm ci` pobiera paczki z sieci; zmiana nie dotyka kodu, a żaden test nie czyta przeniesionych plików BRD (`git grep "docs/brd" -- tests src` → tylko `docs/brd/fixtures/`, który został) |

### Przekazanie do następnej roli
- Zakończono: 01-odkrywanie, tryb build, gałąź `claude/01-odkrywanie-2026-10-19-279a7f`; artefakty: `docs/brd/` (README, odkrywanie, wymagania, wymagania-liczenie, -wypiek, -zakwas, -dziennik, -dane, reguly, zrodla, errata), `docs/zalozenia.md` (ZAL-029…ZAL-048), `docs/decyzje.md` (D-035…D-037), `tests/wektory/brd.json` (77 wektorów).
- Następny krok: **02-monetyzacja**, tryb `build`, sesja 2 (model i kontrakt płatności); nowa sesja w worktree z tej gałęzi; opus, wysiłek high.
- Polecenie: `audit/M1-2026-10-19/M1-2026-10-19/prompty/02-monetyzacja-build-sesja2.md` (złożone `node tools/assemble.mjs 02-monetyzacja --tryb build` w repo prompts); brief: `prompty/sztafeta-01-04-start.md`, sekcja 02.
- Paczka wejściowa dla 02: H-03 (przejrzystość opłat), H-04 („tylko historia” po próbie), H-05 (za co płacą), H-07 (zakwas a 14 dni próby), H-14 (wskaźnik sukcesu z App Store Connect); tabela rynku z cenami (`docs/brd/odkrywanie.md`, S-28, odczyt roli 02); OG-01…OG-03; BR-ZAK-001, BR-ZAK-003…005, BR-DANE-003, BR-DANE-004; ZP-18, ZP-21; OP-33, OP-47, OP-48. DEC-01 (d) i D-033 nie są otwierane; H-04 i H-07 to uwagi z opcjami.
- Paczka dla 03: 50 BR z przepływami i dowodem (ER-35, ER-36 — co przeniesione, co nowe), BR nieprzeniesione z powodem (ER-37, ER-38), hipotezy zakresu H-06, H-08, H-10, H-11, H-12, H-13, propozycja podziału H-09 (rekomendacja: jedna aplikacja), blokery wydania (`docs/brd/README.md`), OP-35, OP-38, OP-41, OP-45. Kontrakt `docs/scope-contract.md` odwołuje się do archiwalnych plików BRD (ER-34) i do budowy od nowa.
- Dla 06 (później): reguły RD-14…RD-27 i źródła S-36…S-61 do rejestru twierdzeń; reguły krytyczne RD-21, RD-22, RD-23 do przeglądu człowieka; rozbieżności ER-42; OP-34, OP-36, OP-37, OP-39, OP-40, OP-44, OP-46. Po weryfikacji rejestr 06 ma pierwszeństwo, a rozbieżność poprawia ER w BRD.
- Dla 05: OP-32, OP-41, OP-42, OP-43; RYZ-12 (kopie tylko na telefonie); H-11 (synchronizacja a zakaz sieci).
- Dla 07 i 08: `tests/wektory/brd.json` tylko do odczytu (zmiana przez ER do roli 01); ER-35, ER-39 (ID w testach spoza BRD), ER-42; blokery wydania.
- Dla właściciela: (1) uzupełnić w `CLAUDE.md` liczbę testerów TestFlight i standard marki; (2) test na urządzeniu: sygnał kroku przy ekranie zablokowanym 30 min i powrót do trwającego wypieku po zamknięciu aplikacji (NFR-CZAS-001, BR-ETAP-005); (3) opcjonalnie 2–3 rozmowy z piekarzami jako sprawdzenie ZAL (D-036); (4) przy scalaniu: numery D-035…D-037 mogą się zderzyć z wpisami partii 3 w `docs/DECISIONS.md`.
- Otwarte decyzje: OP o statusie [DO WYJAŚNIENIA] w `docs/brd/README.md`, każdy z rolą, która przyniesie opcje.

## Następny krok
02-monetyzacja, tryb build, sesja 2: polecenie `prompty/02-monetyzacja-build-sesja2.md`, baza: gałąź `claude/01-odkrywanie-2026-10-19-279a7f`, paczka wejściowa jak wyżej.

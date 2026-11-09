# Koordynacja Piekarz — stan (aktualizacja 2026-11-09 21:42 UTC)

Migracja na M9 (moduł `migracja`, D-056) z koordynatora M3 `session_01T66VBwuR25xmeQCZYdPG2r` na polecenie właściciela 2026-11-09 ~21:35 UTC: „Przejdź na rolę M9: … wykonaj moduł „migracja”.” Dawne pliki stanu (nie usunięte): `docs/wznowienie-M3.md` na `redesign/piekarz-2026-10-22` (sekcje „PUNKT CZYSZCZENIA” i dziennik M3), `docs/decyzje.md` (D-035+, M3 D-286…D-289, M2 D-300…D-316), stan M2 na `audit-m1/piekarz-2026-11-08` (`audit/M1-2026-11-08/punkt-wznowienia-M2-2026-11-09*.md`, `postep-napraw.md`, `plan-napraw.json`), K M3 poza gitem w kontenerze `session_01T66VBwuR25xmeQCZYdPG2r`: `/home/user/piekarz/audit/M3-2026-11-08/` (przepada z kontenerem).

## Mandat (przepisuj bez zmian; zmienia go tylko właściciel)
- Tryb decyzji: **analogia** — od 2026-11-09 ~18:50 UTC (D-289), słowa: „Przechodzimy w nocny tryb. Ty podejmujesz wszystkie decyzje zgodnie z tym co i tak bys zarekomendowal. Prace zlecasz do innych sesji zeby oszczedzac swoj wlasny konterkst a sam tylko koordynujesz. Pilnujesz ich zeby nie przekroczyly 30% limitu kontekstu, jak to sie stanie to zapisuja stan i przekazuja zadanie dalej.” Każda decyzja „do weta (D-289)”. Wyjątek nazwany: rekomendacja zmieniająca zdania bezpieczeństwa przejrzane przez właściciela (D-177) albo wymagająca działania zewnętrznego → otwarte do rana. Fakty merytoryczne rozstrzygają źródła (rola 06), nie analogia.
- Repo portfela do analogii (odczyt): `lkarwowski494/trening` (pełna analogia → przyjmij sam, D-052), `lkarwowski494/oczko` (D-288: klasyfikacja znalezisk jak P-458), `lkarwowski494/oczko-warsztat`.
- Zgody trwałe: brak poza D-289 (wyżej). Uruchomienie workflowu `e2e-ios.yml` na gałęziach roboczych dozwolone (to nie build TestFlight; przekazanie właściciela 2026-11-09 18:55: „iOS E2E zielone na HEAD redesign = kandydat (DEC-18; workflow na gałęzi dozwolony)”). Push i scalenie do `redesign/piekarz-2026-10-22` dozwolone (D-300: „Push + scalenie do redesign (Recommended)”).
- Zawsze za zgodą: push i scalenie na `master`, build, TestFlight (nowa zgoda; D-272 zużyte), App Store Connect, zgłoszenie do recenzji, strona, usuwanie gałęzi i danych, force-push, koszty stałe, wiadomości do ludzi, koszt API ponad pułap. „Nic dla 1.1” do wydania 1.0.
- Pułapy kosztu: **[DO USTALENIA]** — właściciel nie podał. Do ustalenia: nowe sesje tylko z kolejki niżej; pytanie w raporcie porannym (propozycja: sesja 60 USD, doba 300 USD). Konto ma ostrzeżenie limitu 7-dniowego (`rate_limit_info.seven_day = allowed_warning`, od 19:22 UTC).
- Koordynator aktywny: `session_01T66VBvnDeKWC3vg8bd7wL9` (M9, od 2026-11-09 21:40 UTC); poprzednik `session_01T66VBwuR25xmeQCZYdPG2r` (M3, 2026-11-08 16:02 → 2026-11-09 21:39).
- Środowisko: environment_id `env_01MPhRL5ChwFrZp3NzoNRdo2`, model `claude-opus-5-5`, wysiłek **medium** (wyjątek nazwany właściciela 2026-11-09: „dzisiaj w medium”; zgodny z zalecaną sesją M9), permission_mode `auto`, extra_allowed_tools brak; repo sesji: `lkarwowski494/piekarz`, `lkarwowski494/prompts` (`main`), dodatkowo do odczytu `apps4brew-www`, `oczko-warsztat`.
- Gałąź robocza: `redesign/piekarz-2026-10-22` (integracja 1.0); gałąź stanu: `koordynacja`.

## Teraz
- Reaudyt M1 pętla 1 (B) gotowy: K @ `5e835a92` (`audit-m1`), 65/68 zweryfikowane; ZABLOKOWANE przez P1 005, 087 (utrata wypieków w imporcie z trybu awaryjnego), 088, 089; 066 czeka na E2E #101, 067 na nightly. P3 090–101 backlog.
- KO-007: DEC-21 = a, ponowne zatwierdzenie → sesja A: M2 partia 4 na `naprawy/M2-koordynator-napraw-2026-11-09-p4` od `ea249c9c`.
- E2E #101 (run 42705979446) na `ea249c9c` w toku. Kandydat będzie dopiero po partii 4 i pętli 2 reaudytu (ostatniej przed STOP z opcjami, D-043).
- Następny krok: kontrola 22:40.

## Sesje
| Litera | ID | Rola, tryb | Gałąź @ SHA | Kontekst % | Koszt USD | Stan |
|---|---|---|---|---|---|---|
| A (M2 p3 cz. 2) | `session_01T66VBx5s4zkdFqT2gZ5CDQ` | M2-koordynator-napraw, fix (prompt przekazania) | `naprawy/M2-koordynator-napraw-2026-11-09-p3` @ `6a412c9a` | 23,5 (21:40) | 12,64 | idle, review_ready; przypomnienie własne 21:44. 21:40 send_message: nowy koordynator + KO-005 (merge commit) |
| B (reaudyt M1) | `session_01T66VBysWUJuh8AKDtwNsWx` | M1-audytor-generalny, reaudit | `audit-m1/piekarz-2026-11-08` @ `5e835a92` | 26,5 | 62,81 | zarchiwizowana 22:30 |
| — (M2 p1–p3 cz. 1) | `session_01T66VBy48fpemgf7wQvUkU4` | M2 | p3 @ `991586dd` | 25 | 225,98 | zarchiwizowana 19:49 po starcie A |
| — (M1) | `session_01T66VBywjUPA4m3hXCFNdYr` | M1 | `audit-m1/…` | — | [DO USTALENIA] | zarchiwizowana (od 04:10) |

Przekazanie sesji A: przy ≥30% wysyła prompt przekazania (plik na `audit-m1/piekarz-2026-11-08`); koordynator: create_session z promptem dosłownie + dopisek (ID koordynatora, następny numer D, sprawy otwarte), get_session, archive A dopiero po starcie następczyni.

## Plan 24 h (UTC)
| Kiedy | Co | Kto (sesja/rola) | Zależy od | Od właściciela |
|---|---|---|---|---|
| 09.11 ~22:00 | Scalenie p3 → `redesign`, verify UTC + Asia/Tokyo, raport partii 3, kopia K | A (M2) | E2E #100 zielone (jest) | — |
| po scaleniu | Odbiór: SHA `redesign`, verify kod 0 na tym SHA (dowód sesji), E2E iOS na tym samym SHA (`e2e-ios.yml` workflow_dispatch na `redesign`, jeśli SHA ≠ `6a412c9a`) | koordynator | scalenie | — |
| 09.11 ~23:00 → 10.11 ~04:00 | Reaudyt M1 (D-277) na HEAD `redesign`, reguła D-288 (nowe P0/P1 → plan; nowe P2 → P3 backlog 1.0.1 z `klasa`) | sesja M1 uruchamiana przez M2 (A albo następczyni) | odbiór partii 3 | — |
| po reaudycie | P0/P1 z reaudytu → M2 naprawia → reaudyt tych ID → E2E zielone na HEAD `redesign` = kandydat (DEC-18) | M2 / M1 | reaudyt | — |
| 10.11 06:25 | **Raport poranny** (zastępuje linię 05:00 tej doby; słowa właściciela z przekazania 18:55: „RANO do właściciela (~06:30 UTC): raport + zgoda na merge do master i build TestFlight (nowa, D-272 zużyte), test telefonu (docs/wydanie/lista-kontrolna-telefonu.md), weto decyzji nocnych, sprzątanie gałęzi (docs/wydanie/sprzatanie-galezi-2026-11-08.txt — krok właściciela), potem rola 10. Nic dla 1.1.”) — jedno pytanie z przyciskami | koordynator | kandydat | zgody i weto |
| 10.11 14:00 | Linia 14:00 | koordynator | — | — |
| po zgodzie | merge `redesign` → `master`, build TestFlight, test telefonu, rola 10 | właściciel + sesje | zgoda | tak |

## Czeka na właściciela (raport poranny)
- Zgoda: merge `redesign` → `master` + nowy build TestFlight (D-272 zużyte), po zielonym E2E na SHA kandydata (DEC-18).
- Test telefonu: `docs/wydanie/lista-kontrolna-telefonu.md`.
- Weto decyzji nocnych: D-315 (H-01: bez osobnej minimalnej próby, ocena = wydanie + 90 dni), D-316 (bramka E2E przed TestFlight: lista ścieżek spoza buildu; filtr E2E o słowniki, zasoby, konfigurację) i dalsze M2 od D-317; KO od KO-001 (`docs/koordynacja/decyzje.md`).
- Od M2 (stara sesja, przy archiwizacji 19:49): scalić `asc-kontrola-brak-ofert` → `main` w `apps4brew-narzedzia` (polecenie właściciela; zwykły merge albo rebase, nie squash; sesja nie miała prawa zapisu — nie obchodzone); podać rolę klucza ASC (D-314).
- Sprzątanie gałęzi: `docs/wydanie/sprzatanie-galezi-2026-11-08.txt` (proxy sesji nie pozwala usuwać) + gałąź `koordynacja` zostaje.
- Pułapy kosztu (mandat [DO USTALENIA]).
- Archiwizacja poprzednika `session_01T66VBwuR25xmeQCZYdPG2r` (M3): `archive_session` odrzucony przez klasyfikator 22:41 — krok właściciela albo zgoda/reguła.
- (21:55) Rola M9 złożona `assemble.mjs` po zgodzie właściciela 21:53 („Zgoda na wszystko co potrzebujesz zeby wystarowac”); wyjątek z 21:50 zamknięty.

## Przypomnienia
- Koordynatora (M9 `…vnDeKWC3vg8bd7wL9`): `trig_01EycqLp8x7H2oNBB6PJ1K3Y` „Koordynator Piekarz: kontrola” 09.11 23:12; `trig_01YKrEb3zJQqKE51sX3Z35Bm` „Koordynator Piekarz: raport poranny” 10.11 06:25; `trig_01NhpVXyc9TnpVbswmBeY9ft` „Koordynator Piekarz: linia 14:00” 10.11 14:00.
- Poprzednika: `trig_015Tr2EdGSTL9trcxrq3Fumc` „kontrola przekazania” 22:09 → sesja M3 — usunięcie odrzucone przez klasyfikator (21:40); nieszkodliwe (sprawdza, że następca działa → nic). Archiwizacja poprzednika po 22:09 (kontrola 22:40).
- Cudze przypomnienia na koncie (innych aplikacji, nie ruszać): „Dyżur nocny 1”, „Raport nocy D-359”, „Wynik E2E 4e1c00d”, „Koordynacja: pytanie o tryb nocny”, „Pogoda”.

## Pule numerów decyzji
- Koordynator (M3/M9): D-292…D-299 wolne (do wpisów w `docs/decyzje.md` przez sesje wdrażające); KO-005, KO-006 zajęte; KO następny: KO-007.
- M2 (sesja A i następczynie): od D-300; zajęte do D-316; pula D-317…D-319; następny wolny: **D-317**.
- B (reaudyt M1): D-320…D-329.

## Dziennik (najnowsze na dole)
| UTC | Sesja | Zdarzenie z dowodem (SHA, run, plik) | Następny krok |
|---|---|---|---|
| 09.11 18:55 | M3 | Punkt czyszczenia, tryb nocny D-289; `redesign` @ `d2fa028e` | kontrole co ~60 min |
| 09.11 19:22 | M3 | M2 23,5%, p3 @ `14e5f546`; raport poranny `trig_01BbBybvy5Rpb2GMyoZCm6jG` | kontrola 19:48 |
| 09.11 19:27 | M3 | PRZEKAZANIE M2 (~25%): prompt `audit/M1-2026-11-08/prompt-przekazania-M2-2026-11-09b.md` @ `daa9eff8`; p3 @ `991586dd` zawiera `d2fa028e` (`merge-base --is-ancestor`) → sesja A `session_01T66VBx5s4zkdFqT2gZ5CDQ` | archiwizacja po starcie |
| 09.11 19:28 | M3 | stan w `docs/wznowienie-M3.md`, `redesign` @ `9007adeb` (scalenie p3 przestaje być FF) | — |
| 09.11 19:49 | M3 | A pracuje (16,7%); stara M2 zarchiwizowana (koszt 225,98 USD) | kontrola 20:50 |
| 09.11 20:51 | M3 | A 22,7%, p3 @ `6a412c9a` (D-316); E2E run 42691065882 w toku na tym SHA | kontrola 21:52 |
| 09.11 21:36 | M3 | **E2E #100 zielone** na `6a412c9a` (`actions_get`, conclusion success, 21:32); A 23,5%, idle | migracja M9 |
| 09.11 21:45 | M3→M9 | gałąź `koordynacja` + pliki M9 (ten commit) | przekazanie następcy M9 |
| 09.11 21:39 | M3→M9 | przekazane do `session_01T66VBvnDeKWC3vg8bd7wL9` (start bez błędu; wysiłek w get_session nie pokazany [DO USTALENIA] → krok właściciela `/effort medium` w linii); przypomnienia M3 usunięte, „kontrola przekazania" `trig_015Tr2EdGSTL9trcxrq3Fumc` 22:09 (następca usuwa) | przejęcie E6 pkt 5 |
| 09.11 21:42 | M9 | Przejęcie (E6 pkt 5): wpis w mandacie, 3 przypomnienia, send_message do A (delivered), KO-005; brak wiadomości do poprzednika po 21:38 (`list_events`). Rola M9 nie złożona: klonowanie `prompts` bez dostępu, `add_repo` i uruchomienie `assemble.mjs` odrzucone przez klasyfikator → działam wg stan.md; prośba w raporcie porannym | kontrola 22:40 |
| 09.11 21:50 | M9 | Właściciel: „Zgadzam sie na dolaczenie repo” → `add_repo` prompts OK, klon @ `a9a07dc`; assemble odrzucony (wyjątek w „Czeka na właściciela”); rdzeń M9 przeczytany | kontrola 22:40 (archiwizacja poprzednika po jego 22:09) |
| 09.11 21:55 | M9 | Rola M9 złożona (`a9a07dc`, 49 444 zn.) i przeczytana; `delete_trigger` `trig_015Tr2EdGSTL9trcxrq3Fumc` ponownie odrzucony (zostaje; sam się wyłączy u poprzednika 22:09) | kontrola 22:40: archiwizacja poprzednika |
| 09.11 21:49 | M9 | A: partia 3 scalona `ea249c9c` (verify 6800 kod 0 ×2 wg A); sprawdzone: merge-base, diff 1 plik docs, autor; E2E run 42705979446 wyzwolony; sesja B `session_01T66VBysWUJuh8AKDtwNsWx` (reaudyt M1) | kontrola 22:40 |
| 09.11 21:58 | M9 | B STOP: brak dostępu do prompts (add_repo odrzucony w B). Załącznik z promptem M1 w `polecenia/B.md` (f41071cc) cofnięty `b24169f3` — repo publiczne; ponowna publikacja odrzucona przez klasyfikator. Uwaga: złożone prompty ról już są publiczne na `audit-m1` (`naprawy/polecenia/*-prompt.md`) — do raportu porannego. Właściciel (AskUserQuestion): „Restart B z prompts (Recommended)”; środowisko ma prompts w repozytoriach → B próbuje `git clone`; nie wyjdzie → nowa sesja B | odpowiedź B |
| 09.11 21:59 | M9 | B: właściciel zezwolił w czacie B na add_repo prompts → rola M1 złożona; STOP 1 (68 pozycji, 12 ról) → KO-006 wariant B (6 subagentów) | raport B po pierwszej grupie; kontrola 22:40 |
| 09.11 22:15 | M9 | B grupa 04: 4/5 zweryfikowane, M1-005 (P1, instrukcja pod pasem) NADAL OTWARTE (zrzuty E2E #100); 04-601/602 → P3; npm test 6798/6798, kod 1 przez OOM przy równoległych subagentach (osobno zielone). Analogia: trening/oczko odrzucone (klasyfikator) → „nie sprawdzono”. Reszta 20–40 min | kontrola 22:40 |
| 09.11 22:30 | M9 | B koniec: K @ `5e835a92` (sprawdzone ls; plan: reaudyty pętla 1 @ ea249c9c, ZABLOKOWANE, otwarte P1 005/087/088/089 — odczyt plan-napraw.json); KO-007 → A partia 4; B zarchiwizowana (62,81 USD, pułap +4,7%) | kontrola 22:40 |
| 09.11 22:41 | M9 | Kontrola: A 30,0% (300k), 20,35 USD, p4 w toku (087 recenzja, rola 06 dla 088/089) → polecenie PRZEKAZANIA; E2E #101 in_progress; koordynator 25,0%, wysiłek medium potwierdzony (`get_session` effort_level); archiwizacja poprzednika odrzucona (klasyfikator) | kontrola 23:12 |

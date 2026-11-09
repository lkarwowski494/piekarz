# M2 — punkt wznowienia B (2026-11-09, ok. 19:45 UTC) — przekazanie nowej sesji (D-289, limit kontekstu)

Poprzedni punkt: `punkt-wznowienia-M2-2026-11-09.md` (zasady, pułapki — nadal wiążące; przeczytaj go w całości). Ten plik opisuje tylko zmiany.

## Tryb pracy od 19:21 UTC: D-289 (tryb nocny, właściciel ~18:50 UTC)
- STOP-y M2 i ról rozstrzygasz SAM według opcji rekomendowanej; każdy z wpisem w `docs/decyzje.md` „do weta (D-289)”. Nie pytaj właściciela przyciskami w nocy. Wyjątek nazwany: rekomendacja zmienia zdania bezpieczeństwa przejrzane przez właściciela (D-177) albo wymaga działania zewnętrznego → zapisz jako otwarte do rana i idź dalej.
- Granice bez zmian: bez master, buildu, TestFlight, ASC, strony, usuwania gałęzi/danych, wiadomości do ludzi. iOS E2E (workflow_dispatch e2e-ios.yml) na gałęzi p3/redesign — dozwolone.
- Limit kontekstu: 30% (300 tys. z 1 mln; `get_session` → `context_usage.used_tokens`). Przy progu: dokończ krok, zapisz stan (nowy punkt wznowienia + `narzedzia/kopia-k.sh`), wypchnij, prompt przekazania w pliku, `send_message` do koordynatora M3 `session_01T66VBwuR25xmeQCZYdPG2r` ze ścieżką promptu. Subagentów ról trzymaj krótko (wyniki do plików).
- Następny numer decyzji: **D-316**.

## Stan gałęzi
- p3 `naprawy/M2-koordynator-napraw-2026-11-09-p3` = **991586dd** (wypchnięta; zawiera redesign d2fa028e — redesign jest przodkiem → scalenie p3 do redesign będzie fast-forward). verify 6757 kod 0 (UTC) na 991586dd (`dowody/M2/p3-po-scaleniu-d2fa028e-verify.txt`).
- Commity od punktu A (3e0fa3fa): a6d8013c (078), 6a6b410e (080), 3f419363 (D-313, 059/064), 3022e941 (D-314), 1d7c3fc0 (078/080 poprawki 2. przeglądu AI), 0ddecf89 (082), a57d6de2 (082 P2 przeglądu), 83235746 (018), 14e5f546 (084, D-315 do weta), 991586dd (scalenie D-289).

## Zrobione od punktu A (szczegóły: `postep-napraw.md` dziennik, `nowe-znaleziska-M2.md`)
- 078, 080, 082, 018, 084 → naprawione-do-weryfikacji (sprawdz-raport OK, verify, przeglądy: 2. przegląd AI przekładu 078/080 — brak P1, P2/P3 wdrożone; przegląd ścieżki wrażliwej 082 — brak P0/P1).
- D-313 (apetyt 98 h, właściciel), D-314 (klucz/workflowy ASC „jak Trening”, właściciel), D-315 (H-01, rola 11, do weta).
- Właściciel zrobił kroki po 082: środowisko `release` (Required reviewers, tylko master), sekret `ASC_KEY_P8`, sprawdził rolę klucza (roli nie podał — pytanie otwarte do raportu końcowego).
- Właściciel polecił scalić `asc-kontrola-brak-ofert` → `main` w `lkarwowski494/apps4brew-narzedzia`: **zablokowane uprawnieniami sesji** (add_repo push). Fast-forward możliwy (main=8ae575d przodkiem, +4 commity, gałęzie -404 i -v1 zawarte). Działanie zewnętrzne → czeka na właściciela (instrukcja: PR „Rebase and merge” albo zwykły merge, nie squash). Nie próbuj obchodzić.

## Zostało w partii 3
1. **Rola 07** (068 + 4 przekazania): polecenie `naprawy/polecenia/07-jakosc-p3.md` (przekazania już dopisane: 07-przek-1…4). Uwaga przekazania 10→07: build w `testflight.yml` ma `environment: release` (linia ~64); test `tests/asc-klucz-082.test.ts` wymaga, by każde zadanie testflight.yml z `secrets.ASC_` było w release (bramka E2E bez klucza — nie musi). Przekazania 11→07: testy „(018)”, „(084)”, D-315. Po roli: sprawdz-raport, verify, statusy; przegląd ścieżki wrażliwej workflowu (subagent, tylko odczyt), jeśli 068 zmienia testflight.yml.
2. **Moje D:**
   - 067 (Stryker, `stryker.config.json`: `coverageAnalysis: "off"` → `"perTest"` + `incremental` z cache w nightly; test kontraktu workflowu czerwony na „off”). Pomiar czasu Strykera tu ciężki — najwyżej dry-run; nightly zielony na master dopiero po scaleniu → status naprawione-do-weryfikacji z uwagą (albo blokada z powodem).
   - 079 (dziennik wydań: wiersz build 1023 z tagu `v1.0.0-b1023` → 2ef8870a, kanał, zgoda D-272; wpis Z-1 ze słowami właściciela `docs/wznowienie-M3.md:190`; `docs/wydanie/sklep.md:42` i `plan-wydania-1.0.md:11` zgodne z D-225; test: każdy tag `v*-b*` ma wiersz). Uwaga: rola 11 zmieniła `plan-wydania-1.0.md` (W1-12, §6).
   - 081 (notatki App Review `docs/app-store-metadata-v2.md` ok. :204 — punkt „Bread machine mode (Pro)” ze ścieżką z nazw przycisków słownika EN + zdanie o przełączniku drożdżowym; ≤ 4000 B; rozszerzyć `tests/store-metadata.test.ts`).
   - Raporty źródłowe: `role/07-jakosc/07-jakosc-2026-11-08.md` (07-jakosc-002), `role/10-wydanie/10-wydanie-2026-11-08.md` (10-wydanie-003, -006).
3. **Blokady bez pracy:** 017 (zrzuty), P3 z D-288 (055, 056, 063, 074, 076, 083), 029/032/036/042/043/045/050/052/053 (P3 zatwierdzone — sprawdź w planie, czy to backlog).
4. **Koniec partii** (kolejność D-289 pkt 4 od M3): verify na HEAD p3 (UTC i `TZ=Asia/Tokyo`) → E2E iOS na SHA kandydata (workflow_dispatch e2e-ios.yml, ref p3) → scalenie fast-forward do redesign (`git push origin HEAD:redesign/piekarz-2026-10-22`, tylko gdy redesign przodkiem; najpierw `git fetch` — M3 mógł dopisać) → raport końcowy `K/M2-koordynator-napraw-2026-11-09.md` (zawartość: punkt A §„Koniec partii 3 i E2” pkt 2 + D-313…D-315 + kroki właściciela z `nowe-znaleziska-M2.md`) → `sprawdz-raport.mjs` i `sprawdz-plan.mjs` kod 0 → polecenie reaudytu M1 (D-277, reguła D-288) → `kopia-k.sh` → `send_message` do M3 z SHA kandydata i wynikiem E2E.

## Pułapki nowe
- `kopia-k.sh`: dopisz do listy plików `punkt-wznowienia-M2-2026-11-09.md` i `punkt-wznowienia-M2-2026-11-09b.md` (już dopisane w tej sesji).
- Scratchpad tej sesji zmienił ścieżkę po restarcie kontenera; drzewo `wt-audit` może nie istnieć — skrypt zgłosi błąd `cd`; wtedy `git worktree add <scratchpad>/wt-audit origin/audit-m1/piekarz-2026-11-08` (gałąź `audit-m1/piekarz-2026-11-08`) i ustaw W w skrypcie.
- Kopie repo innych aplikacji (trening, oczko, apps4brew-narzedzia) do odczytu: `<scratchpad>/ref/`.

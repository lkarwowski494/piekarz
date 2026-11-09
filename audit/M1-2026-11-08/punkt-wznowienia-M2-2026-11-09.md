# M2 — punkt wznowienia (2026-11-09, ok. 18:00 UTC)

## Kim jesteś i zasady (pełny prompt roli: `naprawy/polecenia/M2-prompt-roli.md`; tu skrót wiążący)
- Rola: M2-koordynator-napraw dla Piekarza (repo lkarwowski494/piekarz). Plan: `audit/M1-2026-11-08/plan-napraw.json` (K = ten katalog, poza gitem; kopia na gałęzi `audit-m1` przez `narzedzia/kopia-k.sh "<opis>"`).
- D — robię sam (test czerwony przed, zielony po, `npm run verify` PO `git add`, kod 0, jeden commit na ID); P/M — sesje ról (subagent, po jednej naraz, w tym samym drzewie, polecenie z `narzedzia/polecenie-roli.py <rola> <partia> <IDs>` albo ręcznie w `naprawy/polecenia/`); ścieżki wrażliwe (dane, kopie, import, zakupy, sesja wypieku) i nowe przekłady → przegląd świeżym subagentem (tylko odczyt, przez `git show`).
- Statusy: ustawiam tylko `naprawione-do-weryfikacji` (+ `commit`) albo `blokada`; po każdej zmianie `node narzedzia/sprawdz-plan.mjs plan-napraw.json`; log: `narzedzia/log.sh "<wpis>"`; nowe znaleziska: `nowe-znaleziska-M2.md` (D-288: nowe P2 → P3 z klasą).
- NIE WOLNO: push na master, build TestFlight, zgłoszenie do recenzji, zapis w App Store Connect, strona, usuwanie gałęzi/danych (osobne zgody właściciela; DEC-18: build tylko po zielonym E2E na tym samym SHA). Decyzje STOP → właściciel przyciskami (AskUserQuestion), rekomendacja pierwsza. Numery decyzji: ostatnia D-312 (następna D-313).
- Commity kończą: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` i `Claude-Session: https://claude.ai/code/session_01T66VBy48fpemgf7wQvUkU4`. Repo publiczne: przed commitem przejrzyj `git diff --cached` (bez sekretów).
- Pułapki: verify po `git add` (testy czytają pliki śledzone); po nowym eksporcie `npm run matrix:update` i test z nazwą eksportu; po tekstach `npm run i18n:kontekst`; przekład: `docs/lokalizacja/przeklad-m2-<id>-2026-11-09.json` (indent 1, bez \n na końcu) + `python3 narzedzia/wepnij-maly-przeklad.py <plik> "<opis>"`, `czeka-na-przeklad.json` pusta; pliki app/src ≤ 20 480 B; dowody przed/po: kopia `git archive HEAD | tar -x` w scratchpadzie z dowiązaniem node_modules (stash nie działa przy nowych plikach testów); daty w testach zależne od pory dnia — sprawdzaj też `TZ=Asia/Tokyo`.

## Stan gałęzi
- `redesign/piekarz-2026-10-22` = 3e51b342 (partia 2 scalona; jej verify może być czerwony wieczorem — test dzis-plany-d5, naprawione w 287de811 na p3).
- Partia 3: `naprawy/M2-koordynator-napraw-2026-11-09-p3`, HEAD 3e0fa3fa (wypchnięta) + to, co dopisze rola 10 (patrz niżej).
- E2E iOS run 99 (42653620839) na 221318bf: success (pl_PL, en_US, kontrola negatywna, Basic, nowy scenariusz 06).

## W toku przy czyszczeniu
- **Sesja roli 10** (078, 080, 082) pracuje w drzewie na p3 (polecenie `naprawy/polecenia/10-wydanie-p3.md`). Po wznowieniu: NIE startuj niczego w drzewie, dopóki `git status` nie jest czysty i nie ma pliku `role/10-wydanie/fix-2026-11-09/wynik-p3.md` (albo `wynik.md` z datą po 18:00) — sprawdź `git log --oneline 3e0fa3fa..HEAD` i `git ls-remote origin naprawy/M2-koordynator-napraw-2026-11-09-p3`. Gdy skończona: `node narzedzia/sprawdz-raport.mjs <wynik>` (z katalogu repo), `npm run verify`, drugi przegląd AI nowych tekstów sklepu (subagent, tylko odczyt), statusy 078/080/082.
- Jeśli sesja roli 10 przepadła (drzewo brudne bez commitów): obejrzyj zmiany, nie wyrzucaj — dokończ albo uruchom rolę 10 od nowa z tym samym poleceniem.

## Zostało w partii 3
- Role: 11-wzrost (018, 084; `naprawy/polecenia/11-wzrost-p3.md`), 07-jakosc (068; `naprawy/polecenia/07-jakosc-p3.md` — dopisz przekazania: testy z ID BR-HARMO-001 „receptura drożdżowa z katalogu w 1.0”, orkisz, żyto 100%, BR-ETAP-001 żytni; N-3 roli 03: nazwa testu kontrakt-zm28-058 z „BR-KAL-012”; 08-p3b-N1 testID `ddt-too-hot-warning` dla zimnej wody).
- Moje D: 067 (Stryker: `coverageAnalysis: "perTest"` + incremental, test kontraktu workflowu; nightly zielony na master dopiero po scaleniu — zostaw jako naprawione z uwagą albo blokada), 079 (dziennik wydań: build 1023, Z-1 2026-11-03, plan i blokady), 081 (notatki dla App Review: tryb maszyny i wersja drożdżowa). Raporty źródłowe: `role/07-jakosc/07-jakosc-2026-11-08.md` (07-jakosc-002), `role/10-wydanie/10-wydanie-2026-11-08.md` (10-wydanie-003, -006).
- Blokady (bez pracy): 017 (zrzuty — telefon właściciela), P3 z D-288 (055, 056, 063, 074, 076, 083).
- Decyzja do zebrania przyciskiem: apetyt 98 h (F-82, F-83 po 0,5 h) vs 97 h z D-312 — rekomendacja 98 h (rola 03, wynik-p3b.md pkt 5); po wyborze wpis D-313 i dopisek w kontrakcie (rola 03 albo M2).

## Koniec partii 3 i E2
1. Verify na HEAD p3 (UTC i TZ=Asia/Tokyo), E2E iOS ponownie na SHA kandydata (workflow_dispatch e2e-ios.yml, ref p3 — zgoda właściciela D-311 na przebieg przed scaleniem), scalenie fast-forward do redesign (`git push origin HEAD:redesign/piekarz-2026-10-22`, tylko gdy redesign jest przodkiem).
2. Raport końcowy `K/M2-koordynator-napraw-2026-11-09.md`: wszystkie ID z commitami, blokady, zadania dodatkowe M2-012…014 (D-308) i D-312 (070-N2, 070-N5, 08-p3-N1), znaleziska (`nowe-znaleziska-M2.md`), kroki właściciela (E2E przed buildem, zrzuty 005/038/039/brioszka/arkusz zgody, przegląd dwóch tekstów krytycznych w 33 językach, teksty do akceptacji roli 04, sprawdzenie Z-1 w ASC), niespójność biblioteki (status `backlog` nieznany walidatorowi; kontrola-brd.mjs nie czyta trzycyfrowych S-1xx — M2-010). `node narzedzia/sprawdz-raport.mjs` i `sprawdz-plan.mjs` kod 0.
3. Polecenie reaudytu (reguła D-288: nowe P2 → P3 z klasą), lista KOO, kopia K (`kopia-k.sh`), krótki raport dla właściciela.

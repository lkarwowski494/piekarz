# M2 — punkt wznowienia C (2026-11-09, ok. 22:42 UTC) — przekazanie po limicie kontekstu (D-289)

Zasady i pułapki: `punkt-wznowienia-M2-2026-11-09.md` (wiążące), zmiany: `punkt-wznowienia-M2-2026-11-09b.md`, ten plik. Pełny prompt roli: `naprawy/polecenia/M2-prompt-roli.md`.

## Zmiany od punktu B
- **Koordynator: M9 `session_01T66VBvnDeKWC3vg8bd7wL9`** (od 21:40 UTC; migracja z M3 na polecenie właściciela, źródło `origin/koordynacja:docs/koordynacja/stan.md`). Raporty i send_message tylko do M9. Tryb D-289 bez zmian.
- Partia 3 zamknięta: p3 6a412c9a (E2E #100 success), scalona do redesign merge **ea249c9c** (KO-005), verify UTC/Tokyo 6800 kod 0. Raport `M2-koordynator-napraw-2026-11-09.md`, `polecenie-reaudytu-M1-2026-11-09.md`.
- Reaudyt M1 pętla 1 (sesja B, K @ 5e835a92): `M1-audytor-generalny-reaudit-2026-11-09.md`, katalog `reaudit-2026-11-09/`; ZABLOKOWANE, otwarte P1 005, 087, 088, 089. P3 090–101 → partia 5 (backlog D-288).
- KO-007 (M9, D-289, do weta): DEC-21 = a (brioszka na LM bez „Ułóż plan”, zmienia D-309 → wpis **D-317 do zrobienia**), 005/087/088/089 zatwierdzone, partia 4. Pula numerów M2: **D-317…D-319** (D-318 przewidziane na wybór opcji (A) dla 005).

## Partia 4: gałąź `naprawy/M2-koordynator-napraw-2026-11-09-p4` (od ea249c9c)
- **087**: bb162ddf (sesje z pakietu awaryjnego przez czytajSesjeDoKopii), test przed czerwony / po 11/11, verify 6801 kod 0; przegląd ścieżki danych brak P0/P1 (P2 → M2-p4-N1…N3 w `nowe-znaleziska-M2.md`); status naprawione-do-weryfikacji. Wyjątek nazwany: D przez subagenta M2 (limit kontekstu).
- **089 + 088**: subagent roli 06 uruchomiony ok. 22:33 UTC w drzewie p4, polecenie `naprawy/polecenia/06-tresci-p4.md`, wynik ma trafić do `role/06-tresci/fix-2026-11-09/wynik-p4.md`. Po wznowieniu: `git -C /home/user/piekarz status`, `git log --oneline bb162ddf..HEAD`, `git ls-remote origin naprawy/M2-koordynator-napraw-2026-11-09-p4`. Jeśli sesja roli przepadła z brudnym drzewem — obejrzyj zmiany (nie wyrzucaj), dokończ albo uruchom rolę 06 ponownie tym samym poleceniem (nowy kontener: drzewo puste → od nowa). Potem: `node narzedzia/sprawdz-raport.mjs <wynik-p4>`, verify, drugi przegląd AI przekładu (jeśli nowe teksty), przegląd ścieżki planu (subagent, tylko odczyt), statusy 088/089, wpis **D-317** w docs/decyzje.md (DEC-21 a, KO-007, do weta) i decyzje roli 06 do weta.
- **005**: polecenie gotowe `naprawy/polecenia/08-programista-p4.md` (opcja (A) z reaudytu: na pasie tylko tytuł, czas, „potem…”, spirala pod kartę; test układu 320×568 i 393×852 + Maestro assertVisible na ostrzeżeniu). Uruchom PO roli 06 (jedna rola naraz w drzewie). Wpis **D-318** (wybór A, do weta D-289).
- Koniec partii 4: verify kod 0 (UTC i `TZ=Asia/Tokyo`) na HEAD p4, raport partii (dopisek do `M2-koordynator-napraw-2026-11-09.md` albo osobny `M2-p4-2026-11-09.md`), `sprawdz-raport`/`sprawdz-plan` kod 0, `kopia-k.sh`, send_message do M9 z SHA p4. **E2E i scalenie robi M9.** Nie twórz przypomnień kontrolnych (polecenie M9).

## Pułapki nowe
- Ten kontener: drzewo audit-m1 w `/tmp/claude-0/-home-user-piekarz/3114e2a1-e7f5-5ace-a74a-63f01380a9e7/scratchpad/wt-audit` (W w `kopia-k.sh` ma fallbacki; w nowym kontenerze: `git worktree add -B audit-m1/piekarz-2026-11-08 <scratchpad>/wt-audit origin/audit-m1/piekarz-2026-11-08` i ustaw W oraz Claude-Session nowej sesji w `narzedzia/kopia-k.sh`).
- Dowiązanie `node_modules` w drzewie pomocniczym `git add -A` dodaje jako plik — `node_modules` jest w `.git/info/exclude`.
- Subagent bywa kończy bez SubagentHandback albo z verify przerwanym bez kodu — sprawdź `git status`/log i wznów go SendMessage.
- Lokalna gałąź `m2-d-p3-tmp` i drzewo `wt-d` w scratchpadzie: pomocnicze, niewypchnięte; nie usuwać bez potrzeby (zakaz usuwania gałęzi dotyczy origin).

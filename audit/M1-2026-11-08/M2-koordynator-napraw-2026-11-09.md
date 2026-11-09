# M2-koordynator-napraw — raport napraw po M1 2026-11-08 (pętla 1)

Data: 2026-11-09. Baza audytu: `2ef8870a` (build 1023). Gałęzie partii: p1 i p2 scalone do `redesign/piekarz-2026-10-22`; partia 3 `naprawy/M2-koordynator-napraw-2026-11-09-p3`, kandydat **6a412c9a**. Dziennik pracy: `postep-napraw.md`; znaleziska: `nowe-znaleziska-M2.md`. Od 19:21 UTC tryb nocny D-289 (STOP-y M2 według rekomendacji, wpisy „do weta”).

## Podsumowanie
- 86 zadań planu: 68 naprawione-do-weryfikacji, 16 zatwierdzone bez pracy (017 — krok właściciela: zrzuty z telefonu; 15 × P3 backlog 1.0.1 z D-288), 2 odrzucone (085, 086). Statusu „zweryfikowane” M2 nie nadaje.
- Zadania dodatkowe: M2-012, M2-013, M2-014 (D-308) i z D-312: 070-N2, 070-N5, 08-p3-N1 — zrobione w partii 3 (commity w `postep-napraw.md`, 14:26–17:05).
- Decyzje M2/właściciela w tej pętli: D-300…D-316. Do weta (D-289): D-315 (H-01), D-316 (bramka E2E, poniżej).

## Kontrola dowodów (koniec partii 3)
- `npm run verify` na 6a412c9a (UTC): 6800 testów, kod 0 — dowody/M2/p3-D316-verify.txt; na 2d426037: 6789, kod 0 — dowody/M2/p3-2d426037-verify-utc.txt
- `TZ=Asia/Tokyo npm run verify` na 6a412c9a: dowody/M2/p3-6a412c9a-verify-tokyo.txt (wynik niżej w sekcji E2E).
- iOS E2E na SHA kandydata: run 42691065882 (#100, workflow_dispatch, ref p3) — wynik niżej.
- Stryker (067): dry-run `perTest` 1581 testów, 6509 mutantów, start 37 s — dowody/M2/p3-067-stryker-dry-run.txt; pełny czas i wynik ≥ progu `break` dopiero w nightly na master po scaleniu (część testu akceptacyjnego otwarta).
- Przeglądy ścieżki wrażliwej partii 3: 082 (brak P0/P1), 068+067 (P1 → 6a412c9a, D-316; nightly brak P0/P1). Drugi przegląd AI przekładu 078/080 (brak P1).

## Ostatnia sesja (cz. 2, 19:28–) — commity
- 068: fa679f03 (rola 07: zadanie `e2e-sha` w testflight.yml, `scripts/ci/e2e-na-sha.mjs`) + 6a412c9a (D-316: lista ścieżek spoza buildu zamiast filtra E2E, filtr E2E o `languages/**`, `assets/**`, konfigurację budowania).
- Przekazania roli 07: 83b8f333 (03-p3b-N-3), b42394c3 (08-p3b-N1, testID `ddt-too-cold-warning`), cf6f5ded (BR-HARMO-001, ER-83), 6a3d76ae (BR-ETAP-001, ER-88). Wynik: `role/07-jakosc/fix-2026-11-09/wynik.md`.
- 067: c0614ee9; 079: 13a32139 (wiersz 1023 i Z-1 były już z 831199d7 — zielone od razu, nowy test tagów); 081: 2d426037 (notatki 3818/4000 znaków).

## Wszystkie zadania planu
| ID (M1-audytor-generalny-) | Poziom | Rodzaj | Partia | Status | Commit | Blokada / uwaga |
|---|---|---|---|---|---|---|
| 001 | P1 | D | 1 | naprawione-do-weryfikacji | b069827f | — |
| 002 | P1 | D | 1 | naprawione-do-weryfikacji | 9feae565 | — |
| 003 | P1 | P | 1 | naprawione-do-weryfikacji | 26f6a87f | — |
| 004 | P1 | M | 2 | naprawione-do-weryfikacji | 4af7c631 | — |
| 005 | P1 | D | 2 | naprawione-do-weryfikacji | 1d0dce0a | — |
| 006 | P1 | D | 2 | naprawione-do-weryfikacji | cfb3b16c | — |
| 007 | P1 | P | 2 | naprawione-do-weryfikacji | a33b545b | — |
| 008 | P1 | M | 2 | naprawione-do-weryfikacji | 49a83170 | — |
| 009 | P1 | M | 2 | naprawione-do-weryfikacji | 944c1808 | — |
| 010 | P1 | M | 2 | naprawione-do-weryfikacji | e57cef29 | — |
| 011 | P1 | D | 2 | naprawione-do-weryfikacji | 831199d7 | — |
| 012 | P1 | D | 2 | naprawione-do-weryfikacji | 6c2a6e26 | — |
| 013 | P1 | D | 2 | naprawione-do-weryfikacji | 76610a26 | — |
| 014 | P1 | D | 2 | naprawione-do-weryfikacji | 8f90a72e | — |
| 015 | P1 | P | 3 | naprawione-do-weryfikacji | e8345215+69d895b8 | — |
| 016 | P1 | D | 3 | naprawione-do-weryfikacji | f38f9e63+5589c91e | — |
| 017 | P1 | D | 3 | zatwierdzone | — | krok właściciela / narzędzie: nowe zrzuty wymagają buildu kandydata — (b) z urządzenia po … |
| 018 | P1 | P | 3 | naprawione-do-weryfikacji | 83235746 | — |
| 019 | P2 | D | 1 | naprawione-do-weryfikacji | d59f8226 | — |
| 020 | P2 | D | 1 | naprawione-do-weryfikacji | 259f0880 | — |
| 021 | P2 | D | 1 | naprawione-do-weryfikacji | 91a26110 | — |
| 022 | P2 | D | 1 | naprawione-do-weryfikacji | 0d47bab2 | — |
| 023 | P2 | P | 1 | naprawione-do-weryfikacji | 2dceaeeb | — |
| 024 | P2 | M | 1 | naprawione-do-weryfikacji | 4c542e20 | — |
| 025 | P2 | D | 1 | naprawione-do-weryfikacji | cf0de762 | — |
| 026 | P2 | D | 1 | naprawione-do-weryfikacji | 8cedbade | — |
| 027 | P2 | D | 1 | naprawione-do-weryfikacji | c685a636 | — |
| 028 | P2 | D | 1 | naprawione-do-weryfikacji | a13c842c | — |
| 029 | P3 | D | 1 | zatwierdzone | — | P3: backlog 1.0.1 poza 1.0 — decyzja właściciela D-288 (2026-11-09: „zobacz jak w oczku kl… |
| 030 | P2 | D | 1 | naprawione-do-weryfikacji | d74e40c0 | — |
| 031 | P2 | D | 1 | naprawione-do-weryfikacji | e3c23559 | — |
| 032 | P2 | D | 1 | zatwierdzone | — | runbook (b) w 0976c0ca (D-302); test akceptacyjny (log wysyłki bez „Upload Symbols Failed”… |
| 033 | P2 | D | 1 | naprawione-do-weryfikacji | f7cfd76f | — |
| 034 | P2 | D | 2 | naprawione-do-weryfikacji | 4de29436 | — |
| 035 | P2 | D | 2 | naprawione-do-weryfikacji | 58b65480 | — |
| 036 | P3 | D | 2 | zatwierdzone | — | P3: backlog 1.0.1 poza 1.0 — decyzja właściciela D-288 (2026-11-09: „zobacz jak w oczku kl… |
| 037 | P2 | D | 2 | naprawione-do-weryfikacji | b8a8f0d2 | — |
| 038 | P2 | D | 2 | naprawione-do-weryfikacji | e07a9ee1 | — |
| 039 | P2 | D | 2 | naprawione-do-weryfikacji | 69bf0924 | — |
| 040 | P2 | M | 2 | naprawione-do-weryfikacji | d1f2166f | — |
| 041 | P2 | M | 2 | naprawione-do-weryfikacji | ef9dd782 | — |
| 042 | P3 | M | 2 | zatwierdzone | — | P3: backlog 1.0.1 poza 1.0 — decyzja właściciela D-288 (2026-11-09: „zobacz jak w oczku kl… |
| 043 | P3 | M | 2 | zatwierdzone | — | P3: backlog 1.0.1 poza 1.0 — decyzja właściciela D-288 (2026-11-09: „zobacz jak w oczku kl… |
| 044 | P2 | D | 2 | naprawione-do-weryfikacji | d4d1d40d | — |
| 045 | P3 | M | 2 | zatwierdzone | — | P3: backlog 1.0.1 poza 1.0 — decyzja właściciela D-288 (2026-11-09: „zobacz jak w oczku kl… |
| 046 | P2 | D | 2 | naprawione-do-weryfikacji | f1aa3ad7 | — |
| 047 | P2 | D | 2 | naprawione-do-weryfikacji | 4f24b6a6 | — |
| 048 | P2 | D | 2 | naprawione-do-weryfikacji | 0e952949 | — |
| 049 | P2 | P | 2 | naprawione-do-weryfikacji | 3ccfd438 | — |
| 050 | P3 | D | 2 | zatwierdzone | — | P3: backlog 1.0.1 poza 1.0 — decyzja właściciela D-288 (2026-11-09: „zobacz jak w oczku kl… |
| 051 | P2 | D | 2 | naprawione-do-weryfikacji | 64d2aa55 | — |
| 052 | P3 | D | 2 | zatwierdzone | — | P3: backlog 1.0.1 poza 1.0 — decyzja właściciela D-288 (2026-11-09: „zobacz jak w oczku kl… |
| 053 | P3 | P | 2 | zatwierdzone | — | P3: backlog 1.0.1 poza 1.0 — decyzja właściciela D-288 (2026-11-09: „zobacz jak w oczku kl… |
| 054 | P2 | P | 3 | naprawione-do-weryfikacji | 69a1c258 | — |
| 055 | P3 | P | 3 | zatwierdzone | — | P3: backlog 1.0.1 poza 1.0 — decyzja właściciela D-288 (2026-11-09: „zobacz jak w oczku kl… |
| 056 | P3 | D | 3 | zatwierdzone | — | P3: backlog 1.0.1 poza 1.0 — decyzja właściciela D-288 (2026-11-09: „zobacz jak w oczku kl… |
| 057 | P2 | P | 3 | naprawione-do-weryfikacji | 9a692b21 | — |
| 058 | P2 | P | 3 | naprawione-do-weryfikacji | 7526830d | — |
| 059 | P2 | D | 3 | naprawione-do-weryfikacji | 3bebc5ab+211649bf+3e0fa3fa | — |
| 060 | P2 | D | 3 | naprawione-do-weryfikacji | 9174cd66 | — |
| 061 | P2 | P | 3 | naprawione-do-weryfikacji | e58a3ac1 | — |
| 062 | P2 | P | 3 | naprawione-do-weryfikacji | 6caf322b | — |
| 063 | P3 | P | 3 | zatwierdzone | — | P3: backlog 1.0.1 poza 1.0 — decyzja właściciela D-288 (2026-11-09: „zobacz jak w oczku kl… |
| 064 | P2 | P | 3 | naprawione-do-weryfikacji | 1f5eac3a+f34b06fd | — |
| 065 | P2 | P | 3 | naprawione-do-weryfikacji | 7f520c7b | — |
| 066 | P2 | D | 3 | naprawione-do-weryfikacji | E2E run 42653620839 @221318bf (success: pl_PL, en_US, kontrola negatywna, Basic) | — |
| 067 | P2 | D | 3 | naprawione-do-weryfikacji | c0614ee9 | — |
| 068 | P2 | P | 3 | naprawione-do-weryfikacji | fa679f03+6a412c9a | — |
| 069 | P2 | D | 3 | naprawione-do-weryfikacji | cd6a097e | — |
| 070 | P2 | D | 3 | naprawione-do-weryfikacji | 6ed7109e | — |
| 071 | P2 | D | 3 | naprawione-do-weryfikacji | 221318bf | — |
| 072 | P2 | D | 3 | naprawione-do-weryfikacji | 40c4a011 | — |
| 073 | P2 | D | 3 | naprawione-do-weryfikacji | 1590999f | — |
| 074 | P3 | D | 3 | zatwierdzone | — | P3: backlog 1.0.1 poza 1.0 — decyzja właściciela D-288 (2026-11-09: „zobacz jak w oczku kl… |
| 075 | P2 | D | 3 | naprawione-do-weryfikacji | 550fc6b1 | — |
| 076 | P3 | D | 3 | zatwierdzone | — | P3: backlog 1.0.1 poza 1.0 — decyzja właściciela D-288 (2026-11-09: „zobacz jak w oczku kl… |
| 077 | P2 | D | 3 | naprawione-do-weryfikacji | 86efd997 | — |
| 078 | P2 | P | 3 | naprawione-do-weryfikacji | a6d8013c, 1d7c3fc0 | — |
| 079 | P2 | D | 3 | naprawione-do-weryfikacji | 13a32139 | — |
| 080 | P2 | P | 3 | naprawione-do-weryfikacji | 6a6b410e, 1d7c3fc0 | — |
| 081 | P2 | D | 3 | naprawione-do-weryfikacji | 2d426037 | — |
| 082 | P2 | P | 3 | naprawione-do-weryfikacji | 0ddecf89, a57d6de2 | — |
| 083 | P3 | D | 3 | zatwierdzone | — | P3: backlog 1.0.1 poza 1.0 — decyzja właściciela D-288 (2026-11-09: „zobacz jak w oczku kl… |
| 084 | P2 | P | 3 | naprawione-do-weryfikacji | 14e5f546 | — |
| 085 | P2 | D | 1 | odrzucone | — | — |
| 086 | P2 | P | 3 | odrzucone | — | — |

## Nowe znaleziska (reguła D-288: nowe P2 → P3 z klasą)
Pełna lista: `nowe-znaleziska-M2.md`. Z ostatniej sesji: M2-p3-N10 (head_sha PR), M2-p3-N11 (jedno ponowienie D-131 nieegzekwowane), M2-p3-N12 (cache przyrostowy Strykera), 07-p3-N1…N4. Niespójności biblioteki: status `backlog` nieznany walidatorowi planu (użyto „zatwierdzone” z blokadą); `kontrola-brd.mjs` nie czyta trzycyfrowych S-1xx i zgłasza RD-37/RD-38 (M2-010).

## Kroki właściciela
1. Weto albo potwierdzenie: D-315, D-316 (i pozostałych „do weta” z D-289: D-309, D-310).
2. Przed buildem TestFlight: zielony E2E na tym samym SHA master (DEC-18, D-286; od 068 egzekwuje to `testflight.yml`); scalenie do master — osobna zgoda.
3. Zrzuty i telefon: 017 i zrzuty 005/038/039, brioszka (M2-012), arkusz zgody (M2-014); lista kontrolna telefonu na buildzie kandydata.
4. Przekład: przegląd człowieka dwóch tekstów krytycznych w 33 językach; natywny przegląd lokalizacji niskiej pewności 078/080 (el, fi, hu, ja, ko, zh-Hant, sl/hr); teksty do akceptacji roli 04 z wyników ról.
5. App Store Connect: sprawdzenie Z-1; wklejenie tekstów sklepu z `docs/wydanie/ustawienia/`; rola klucza ASC (nie podana — pytanie otwarte).
6. apps4brew-narzedzia: scalić `asc-kontrola-brak-ofert` → `main` (fast-forward możliwy; „Rebase and merge” albo zwykły merge, nie squash) — działanie zewnętrzne, sesja nie ma uprawnień zapisu.

## Opcje scalenia
(a) najpierw reaudit M1 na redesign, potem scalenie do master (rekomendacja); (b) scalenie teraz — bez niezależnej weryfikacji 68 napraw.

## Przekazanie
### Przekazanie do M1 (reaudit)
- Zakończono: M2 fix, pętla 1; gałąź `naprawy/M2-koordynator-napraw-2026-11-09-p3` (6a412c9a; po scaleniu fast-forward także `redesign/piekarz-2026-10-22`), baza 2ef8870a; raport K/M2-koordynator-napraw-2026-11-09.md
- Nowa sesja (D-015: sprawdzający nie zna moich uzasadnień), w repo na gałęzi `redesign/piekarz-2026-10-22`:
  `node <prompts>/tools/assemble.mjs M1-audytor-generalny --tryb reaudit --wyjscie /home/user/piekarz/audit/M1-2026-11-08 --baza 2ef8870a`
- Paczka wejściowa: K/plan-napraw.json (statusy), ten raport, K/naprawy/, K/role/<rola>/fix-2026-11-09/, K/nowe-znaleziska-M2.md (P3 z klasą wg D-288 do oceny w reaudycie).
- Otwarte: 017 (zrzuty — telefon właściciela), 15 × P3 backlog 1.0.1 (D-288), 067 część „nightly zielony na master” (po scaleniu); decyzje do weta: D-309, D-310, D-315, D-316; scalenie z master: po reaudycie (rekomendacja).

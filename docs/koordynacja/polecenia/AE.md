# Sesja AE: test pasków „Cofnij” (AD-01, KO-073) — Piekarz
Koordynator: session_01T66VBx7jgKEjU1waMqDC5H (subagent; raport końcowy to odpowiedź). Gałąź `koordynacja` tylko do odczytu.
1. Rola: 08-programista, tryb fix (prompt roli w pliku z wiadomości startowej).
2. Start: nowa gałąź `naprawy/M2-koordynator-napraw-2026-11-17-kroj-ae` od `7cca129e` (koniec AD; gałęzi AD nie ruszasz). Worktree w scratchpadzie (`npm ci`). Autor: Claude <noreply@anthropic.com>.
3. Zadanie (raport: `AD-recenzja.md` w scratchpadzie koordynatora, sondy `ad-rec-mutacje.txt`): AD-01 — `src/__tests__/pasek-cofnij-jezyk-ad.test.tsx` ma być czerwony, gdy z zależności `useMemo` w `useCofnijDokarmienie.ts` i `usePlanyDzis.ts` zniknie tylko `jezyk` (stałe wywołania zwrotne, komponent subskrybujący język jak ekran — patrz sonda recenzenta). Kod produkcyjny bez zmian (zmiana tylko jeśli test wykaże błąd — wtedy opisz). Gotowe: kontrola negatywna obu hooków (mutacja → czerwone, wynik w `docs/dowody-08-kroj-ae/czerwony-zielony.txt`), `npm run verify` kod 0 na SHA → `docs/dowody-08-kroj-ae/verify.txt`. AD-02 (P3, strażnik nie widzi t() przez inną funkcję) — tylko opis w raporcie, bez zmiany.
4. Zakazy jak w `polecenia/AC.md`. Bez nowych numerów decyzji (dopisek do D-427 dozwolony).
5. Push na końcu na swoją gałąź. Raport ≤ 8 linii: SHA, verify, dowody, zmiany.

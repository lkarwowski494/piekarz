# Sesja AD: poprawki po recenzji AC (KO-072) — Piekarz
Koordynator: session_01T66VBx7jgKEjU1waMqDC5H (subagent; raport końcowy to odpowiedź). Gałąź `koordynacja` tylko do odczytu.
1. Rola: 08-programista, tryb fix (prompt roli w pliku z wiadomości startowej).
2. Start: nowa gałąź `naprawy/M2-koordynator-napraw-2026-11-17-kroj-ad` od `446c3860` (koniec AC; gałęzi AC nie ruszasz — trwa na niej E2E). Worktree w scratchpadzie, `npm ci`. Autor commitów: Claude <noreply@anthropic.com>.
3. Zadania (raport: `AC-recenzja.md` w scratchpadzie koordynatora), każde z testem czerwonym na `446c3860` i zielonym po:
   - AC-01 (P2): `app/(tabs)/zakwasy/index.tsx:143-151` `lastFedLabel` — przelicza się po zmianie języka. Gotowe: test pl→en przy zamontowanym ekranie.
   - Brzegowe z punktu 5: `useCofnijDokarmienie.ts:44`, `usePlanyDzis.ts:89` — język w zależnościach (test albo uzasadnienie w raporcie).
   - Rozszerz strażnik (jeśli wykonalne AST bez fałszywych alarmów): `useMemo`/`useCallback` wołające `t()` bez języka w zależnościach; kontrola negatywna. Gdy niewykonalne — uzasadnij.
   - AC-02 (P3, dokumentacja): D-426 dopisuje zmiany testów 199 i p9b; `start-jezyka.ts` i test startu odsyłają do D-425.
   - AC-03 (P3): spóźnione `initLanguage` po limicie nie nadpisuje języka wybranego w międzyczasie w Ustawieniach. Test.
   - AC-04/AC-05 (P3): tylko gdy mała, bezpieczna zmiana (catch w retry z komunikatem; useLang nie gubi zmiany między renderem a efektem); inaczej opis w raporcie.
   - `npm run verify` kod 0 na SHA kodu → `docs/dowody-08-kroj-ad/verify.txt`, czerwony→zielony → `czerwony-zielony.txt`.
4. Zakazy jak w `polecenia/AC.md` (bez scaleń, bez `koordynacja`, bez --no-verify/force-push, bez osłabiania asercji, @ts-ignore/skip, 20 480 B, wygląd bez zmian, bez pytań do właściciela).
5. Decyzje: D-427 (jedna), jeśli trzeba więcej — opisz w raporcie zamiast numeru.
6. Push zbiorczo na końcu na swoją gałąź. Raport ≤ 12 linii jak w AC.

# Sesja D: M2-p4-N10 — start sterownika E2E iOS (rola 07, kod CI) — Piekarz
Koordynator: session_01T66VBxXcsDUt4eN9c43e7J (raporty, pytania i PRZEKAZANIE tylko przez send_message do tego ID; przy wiadomości o zmianie koordynatora pisz do nowego). Gałąź stanu koordynatora: `koordynacja` (tylko do odczytu).

1. Rola: 07-jakosc, tryb fix, zadanie M2-p4-N10. Najpierw spróbuj raz: `add_repo lkarwowski494/prompts` (read), klon `--depth 1` do scratchpadu, `node <prompts>/tools/assemble.mjs 07-jakosc --tryb fix --zadania M2-p4-N10 --plik <scratchpad>/D.md`; przeczytaj w całości, jesteś tą rolą. Odmowa dostępu → nie obchodź: send_message „BRAK PROMPTS”, koordynator odeśle prompt wiadomością. Złożonych promptów nie commituj (repo publiczne).
2. Start: gałąź `naprawy/M2-koordynator-napraw-2026-11-10-n10` @ `1c723632` (= `redesign/piekarz-2026-10-22`; inny HEAD: zgłoś). Instalacja: `npm ci`. Tożsamość commitów według CLAUDE.md, sprawdź przed pierwszym commitem. Diagnoza wejściowa: `git fetch origin audit-m1/piekarz-2026-11-08`, plik `audit/M1-2026-11-08/role/07-jakosc/fix-2026-11-09/diagnoza-e2e-103.md` @ `78d2e8c9` (run 42725323063, próba 1: start sterownika XCUITest > 480 s w kroku pl_PL, 0 przepływów).
3. Zadania (decyzja właściciela 2026-11-10, KO-011: „N10 tak, N8 nie (Recommended)”):
   1. Test strażnik najpierw czerwony (wzór: `tests/e2e-ios-workflow.test.ts`): w kroku pl_PL ponowienie Maestro wyłącznie przy komunikacie „iOS driver not ready in time” i braku wyników przepływów; najwyżej jedno ponowienie; każda inna porażka zostaje czerwona. Gotowe: test czerwony przed zmianą (wynik w pliku dowodu), zielony po.
   2. Limit startu sterownika 600–900 s (wartość z uzasadnieniem z pomiarów: #100 ~5 min, #101 6:47, #103 > 8 min), w jednym miejscu. Gotowe: stała i test, który ją czyta.
   3. `npm run verify` kod 0 na HEAD (dowód w pliku na gałęzi), wpis D-NNN w `docs/decyzje.md` z odnośnikiem KO-011.
   4. Przebieg dowodowy: `workflow_dispatch` `e2e-ios.yml` na tej gałęzi (dozwolone mandatem) — podaj run ID koordynatorowi; wyniku nie musisz doczekać (ok. 70 min), sprawdzi go koordynator.
   Poza zakresem: M2-p4-N8 (ponowne stuknięcie w przepływach) — odrzucone przez właściciela; nie zmieniasz scenariuszy `.maestro/` ani kodu aplikacji.
4. Zakazy: nie scalasz do `redesign` ani `master`, nie tworzysz i nie archiwizujesz sesji, nie piszesz na `koordynacja`, żadnych nowych sekretów ani uprawnień w workflowie, nigdy --no-verify ani force-push, nie pytasz właściciela (bez AskUserQuestion). STOP-y roli i punkt czyszczenia (zasada wspólna 19) → raport do koordynatora i czekasz.
5. Decyzje: tryb „właściciel” — pytanie do koordynatora z ≥ 2 opcjami i rekomendacją. Numery decyzji: D-330…D-334 (sprawdź `docs/decyzje.md`).
6. Kontekst i koszt: od 30% okna kończysz krok, stan w `docs/stan-07-n10-2026-11-10.md` na swojej gałęzi, push, PRZEKAZANIE. Koszt tylko informacyjnie (`cost_usd` w raporcie).
7. Push: zbiorczo; po wyzwoleniu E2E żadnych pushy kodu na tę gałąź do końca przebiegu.
8. Raporty (≤ 10 linii, send_message): PYTANIE z treścią, opcjami, rekomendacją; PRZEKAZANIE/koniec: SHA, run E2E, pliki dowodów, verify (kod, liczba testów), decyzje, koszt, otwarte.

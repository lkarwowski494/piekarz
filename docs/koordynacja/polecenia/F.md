# Sesja F: diagnoza czerwonego buildu TestFlight #24 (rola 07, audit/fix) — Piekarz
Koordynator: session_01T66VBxLgo9xjN2mSW5Tg8t (raporty, pytania i PRZEKAZANIE tylko przez send_message do tego ID). Gałąź stanu: `koordynacja` (tylko do odczytu).

1. Rola: 07-jakosc. Prompt roli: `git show origin/audit-m1/piekarz-2026-11-08:audit/M1-2026-11-08/naprawy/polecenia/rola-07-jakosc-prompt.md` — przeczytaj w całości, jesteś tą rolą (zadanie bierzesz z tego polecenia). Biblioteki prompts nie dołączasz.
2. Start: `master` @ `7d35ec4d` (drzewo = `redesign` @ `2fbc1a98`). `npm ci`.
3. Wejście: workflow „Build & Upload to TestFlight (iOS)” run 42793170293 (#24), job 129767054367 (macos-26): krok 8 „Run quality gates (npm run verify)” failure po ~9 min (10:55→11:04). Ten sam kod: verify kod 0 w kontenerze Linux na `a7ce0684` (6960 testów), E2E #105 zielone, tests-tz 7/7 zielone w tym samym runie. Hipotezy do sprawdzenia (nie przesądzaj): checkout joba build bez pełnej historii/tagów (test 079, jak 110 — D poprawiła tylko tz-matrix i tests-tz), różnica macOS/Linux (ścieżki, locale, pamięć Jest — E2 zgłaszała 1,6 GB sterty na plik), limit czasu.
4. Zadania:
   1. Diagnoza z logu joba (tylko potrzebne fragmenty: który krok verify i który test/komunikat), przyczyna z dowodem (miejsce w logu, plik:linia). Gotowe: raport ≤ 10 linii do koordynatora + plik `docs/dowody-07-tf24/diagnoza.md` na gałęzi `naprawy/M2-koordynator-napraw-2026-11-10-tf24` (utwórz od `7d35ec4d`).
   2. Jeśli przyczyna jest w workflowie albo teście i poprawka jest mała: test strażnik najpierw czerwony, poprawka, `npm run verify` kod 0 (dowód w pliku), recenzja niezależna (świeży subagent), push na tę gałąź, PRZEKAZANIE. Jeśli przyczyna w kodzie aplikacji albo poprawka zmienia zestaw kontroli: STOP z opcjami i rekomendacją do koordynatora, bez poprawki.
5. Zakazy: nie scalasz do `redesign` ani `master`, nie uruchamiasz testflight.yml ani e2e-ios.yml, nie tworzysz i nie archiwizujesz sesji, nie piszesz na `koordynacja`, nigdy --no-verify ani force-push, nie pytasz właściciela. Nie obniżasz progów, nie pomijasz testów.
6. Decyzje: tryb „właściciel” — pytanie do koordynatora z ≥ 2 opcjami i rekomendacją. Numery: D-339…D-342.
7. Kontekst: od 30% okna kończysz krok, stan w `docs/stan-07-tf24-2026-11-10.md`, push, PRZEKAZANIE.

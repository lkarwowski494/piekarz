# Sesja G: porządki po buildzie 1.0.0 (1025) (rola 07, docs) — Piekarz
Koordynator: session_01T66VBwJhDDVhFKP86KKRQA (raporty, pytania i PRZEKAZANIE tylko przez send_message do tego ID). Gałąź stanu: `koordynacja` (tylko do odczytu).

1. Rola: 07-jakosc. Prompt roli: `git show origin/audit-m1/piekarz-2026-11-08:audit/M1-2026-11-08/naprawy/polecenia/rola-07-jakosc-prompt.md` — przeczytaj w całości, jesteś tą rolą (zadanie bierzesz z tego polecenia). Biblioteki prompts nie dołączasz.
2. Start: `master` @ `540229c9` (= `redesign`). Utwórz gałąź `naprawy/M2-koordynator-napraw-2026-11-10-porzadki` od `540229c9`. `npm ci`.
3. Kontekst: build 1.0.0 (1025) wysłany do TestFlight 2026-11-10 15:31 UTC (testflight.yml run 42827876117); E2E #107 zielone na `540229c9`. Właściciel testuje telefon. Decyzja KO-022 (właściciel 15:5x: „Porządki w tle”).
4. Zadania (tylko dokumentacja; kodu aplikacji, workflowów i testów nie zmieniasz):
   1. Wpis **D-292** w `docs/decyzje.md` (format jak sąsiednie wpisy D-33x): KO-014 — właściciel 2026-11-10 05:59: „Swiadomie wydanie testlight bez zrzutow. Zrzurty zrobimy na koncu przed samym apple store.” — pozycja 017 (P1, zrzuty ASC) odłożona do bramki App Store; zobowiązanie: zrzuty (017, 109) przed zgłoszeniem do App Store.
   2. Aktualizacja `docs/wydanie/lista-kontrolna-telefonu.md` (stan 2026-11-02) o zmiany od tamtej pory, które wymagają telefonu: 005 (ostrzeżenie „Gorące naczynie” nad kartą „Co zrobić” na kroku pieczenia; przy 320 pt akcje pasa „Doktor”/„Plan wypieku” jako ikony 44 pt z etykietą VoiceOver — D-335…D-338), D-336/KO-020 (numer kroku). Źródła: `git log 1c723632..540229c9 -- app src docs/decyzje.md` i wpisy D-330…D-339. Dopisz punkty do istniejących sekcji (PH-25/26/27 albo nowe PH-33+), nie przebudowuj listy. Każde twierdzenie z miejscem w kodzie (plik:linia). Data stanu: 2026-11-10.
   3. Wpis w `docs/wydanie/dziennik.md`: build 1.0.0 (1025), 2026-11-10, SHA `540229c9`, run 42827876117, kolumna „Wynik” pusta (test telefonu właściciela w toku).
   4. `npm run verify` kod 0 (dowód w `docs/dowody-07-porzadki/verify.txt`), recenzja niezależna (świeży subagent: zgodność z kodem i źródłami), push na gałąź, PRZEKAZANIE (SHA, lista plików, wynik verify, uwagi).
5. Zakazy: nie scalasz do `redesign` ani `master`, nie uruchamiasz workflowów, nie tworzysz i nie archiwizujesz sesji, nie piszesz na `koordynacja`, nigdy --no-verify ani force-push, nie pytasz właściciela. Nie obniżasz progów, nie pomijasz testów.
6. Decyzje: tryb „właściciel” — pytanie do koordynatora z ≥ 2 opcjami i rekomendacją. Numery: D-292 (zadanie 1), własne D-343…D-345.
7. Kontekst: od 30% okna kończysz krok, stan w `docs/stan-07-porzadki-2026-11-10.md`, push, PRZEKAZANIE.

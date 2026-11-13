# Sesja Z: diagnoza czerwonych zrzutów #11 (34 lok.) — Piekarz
Koordynator: session_01T66VBykptcTHHjD4xZ9HCQ (raporty, pytania i PRZEKAZANIE tylko przez send_message do tego ID; po wiadomości o zmianie koordynatora pisz do nowego). Gałąź stanu `koordynacja` tylko do odczytu.

1. Rola: 07-jakosc (audit). Prompt roli jest w twojej pierwszej wiadomości po linii `=== PROMPT ROLI ===`; przeczytaj w całości, jesteś tą rolą. Biblioteki prompts nie dołączasz.
2. Start: nowa gałąź `naprawy/M2-koordynator-napraw-2026-11-13-zrzuty-11` od `master` @ `98efd38b` (inny HEAD: zgłoś). Tożsamość commitów wg CLAUDE.md, sprawdź przed pierwszym commitem.
3. Kontekst: zrzuty #11 run 43427151863 (`zrzuty-sklepu.yml`, master `c6e34ba6` — UWAGA: SHA sprzed poprawki Y, `98efd38b` zmienił `.maestro/` w tym scenę zrzutów `00-przygotuj-podwojenie`; D-412), wejścia puste poza `aplikacja_z_przebiegu=43218573090` (artefakt wygasa 15.11 12:56 UTC). Kolejka 12:40→~19:48, failure 21:09. Próbka #10: jedyny czerwony job to awaria maszyny nl-NL 6,9″ (`docs/dowody-07-zrzuty-hr/diagnoza-10.md`). E2E #127 na master `98efd38b` zielone.
4. Zadania (tylko diagnoza, bez poprawek kodu i scenariuszy):
   1. Lista jobów #11: zielone/czerwone (lokalizacja, rozmiar, scena). Dla każdego czerwonego: krok, komunikat, co na ekranie (artefakt/zrzut/końcówka logu) i przyczyna. Logi czytasz do pliku, w kontekście tylko końcówki.
   2. Klasyfikacja każdej przyczyny: (a) awaria maszyny/niestabilność, (b) ta sama przyczyna co E2E #125 naprawiona w `98efd38b` (sprawdź, czy poprawka Y obejmuje ten krok), (c) nowa usterka scenariusza, (d) usterka aplikacji. Realność: realne/brzegowe/teoretyczne.
   3. Rekomendacja z ≥ 2 opcjami i kompromisem (np. ponowić tylko czerwone lokalizacje na master `98efd38b` z `tylko=…`, pełny przebieg, poprawka scenariusza) z czasem maszyn macOS.
   Gotowe: `docs/dowody-07-zrzuty-11/diagnoza-11.md` na twojej gałęzi (cytaty logów z jobem i krokiem), push, PRZEKAZANIE.
5. Zakazy: tylko `docs/`. Nie scalasz do `redesign`/`master`, nie tworzysz/archiwizujesz sesji, nie piszesz na `koordynacja`, nie uruchamiasz ani nie anulujesz workflowów, nigdy --no-verify ani force-push, bez AskUserQuestion (pytania do koordynatora). STOP-y roli i punkt czyszczenia → raport do koordynatora.
6. Decyzje: brak numerów (diagnoza); gdyby potrzebne — pula D-418…D-423.
7. Kontekst: od 30% okna stan w `docs/stan-07-zrzuty-11-2026-11-13.md`, push, PRZEKAZANIE. Koszt orientacyjnie 5 USD (informacyjnie).
8. Raporty (≤ 10 linii, send_message): PYTANIE (pełna treść, opcje, rekomendacja); PRZEKAZANIE (SHA, plik diagnozy, liczby jobów, klasyfikacja, rekomendacja, koszt).

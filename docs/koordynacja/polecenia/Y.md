# Sesja Y: niestabilny scenariusz E2E 06-koniec-wypieku (en-US, E2E #125) — Piekarz
Koordynator: session_01T66VByMpYbVwy3ajfdyVM9 (raporty, pytania i PRZEKAZANIE tylko przez send_message do tego ID; jeśli dostaniesz wiadomość o zmianie koordynatora, pisz do nowego). Gałąź stanu koordynatora: koordynacja (tylko do odczytu).

1. Rola: 08-programista w trybie fix. Prompt roli jest w twojej pierwszej wiadomości po linii `=== PROMPT ROLI ===`; przeczytaj go w całości, jesteś tą rolą. Biblioteki prompts nie dołączasz.
2. Start: gałąź `naprawy/M2-koordynator-napraw-2026-11-13-e2e-06` utworzona od `redesign/piekarz-2026-10-22` @ `ca139156` (inny HEAD: zgłoś). Instalacja: `npm ci`. Tożsamość commitów według CLAUDE.md, sprawdź przed pierwszym commitem.
3. Zadania:
   1. Scal (merge, bez konfliktu oczekiwany — tylko docs) gałąź `origin/naprawy/M2-koordynator-napraw-2026-11-13-zrzuty-hr` @ `06b9bb4c` (dowody sesji W). Gotowe: merge commit, `git diff ca139156 HEAD --stat` pokazuje tylko `docs/`.
   2. Przeczytaj diagnozę `docs/dowody-07-zrzuty-hr/diagnoza-e2e-125.md` (E2E #125 run 43397474441: en-US, `.maestro/e2e/06-koniec-wypieku.yaml:86-91`, stuknięcie `tab-dziennik` wpadło w przejście po zapisie `finish-save-btn` na wolnej maszynie; karta Dziennik nie przełączona). Sprawdź w `app/` (tylko odczyt), co dzieje się po zapisie (nawigacja/animacja), i zapisz przyczynę z `plik:linia`.
   3. Test najpierw czerwony: w `tests/` (wzorzec: istniejące testy scenariuszy `.maestro/`, np. `tests/e2e-ios-workflow.test.ts` / testy strażników YAML) reguła, że w 06-koniec-wypieku po `finish-save-btn` scenariusz czeka na stan po zapisie (element, który istnieje dopiero po zakończeniu przejścia), zanim stuknie `tab-dziennik`, a po stuknięciu sprawdza przełączenie z jednym warunkowym ponowieniem stuknięcia (`runFlow when notVisible`). Czerwony na obecnym YAML z właściwego powodu.
   4. Poprawka YAML: jak wyżej. **Zakaz**: podnoszenie limitów czasu (`timeout`, `extendedWaitUntil`), `retry` całego flow, usuwanie asercji `bake-log-card-.*`, zmiany w `app/`/`src/`/`ios/` (jeśli przyczyna wymaga zmiany aplikacji — STOP i PYTANIE do koordynatora). Sprawdź, czy ten sam wzorzec (stuknięcie zakładki zaraz po zapisie) jest w innych flow `.maestro/e2e/` i `.maestro/zrzuty-sklepu/`; popraw tak samo albo wypisz w raporcie.
   5. `npm run verify` kod 0 na końcowym SHA: wynik do pliku `docs/dowody-08-e2e-06/verify.txt` (ostatnie 30 linii + kod wyjścia), commit, push.
   6. Decyzja w `docs/decyzje.md` (numer z puli) z odnośnikiem do KO-061.
4. Zakazy: nie scalasz do `redesign` ani `master`, nie uruchamiasz workflowów (E2E uruchamia koordynator), nie tworzysz i nie archiwizujesz sesji, nie piszesz na gałąź `koordynacja`, nie zmieniasz workflowów, nigdy --no-verify ani force-push, nie pytasz właściciela bezpośrednio (bez AskUserQuestion). STOP-y twojej roli i punkt czyszczenia z zasady wspólnej 19 zamieniasz na raport do koordynatora i czekasz na jego odpowiedź; nie proponujesz właścicielowi nowej sesji.
5. Decyzje: tryb „właściciel” (dzień) — pytanie do koordynatora z ≥ 2 opcjami i rekomendacją; drobne decyzje techniczne w granicach zadania podejmujesz sam i zapisujesz. Numery decyzji tylko z puli D-412…D-417.
6. Kontekst i koszt: od 30% okna kończysz krok, zapisujesz stan w `docs/stan-08-e2e-06-2026-11-13.md` na swojej gałęzi, push, PRZEKAZANIE. Pułap orientacyjny 5 USD (bez twardego limitu; właściciel: koszt informacyjnie).
7. Push: zbiorczo, po zadaniu 5.
8. Raporty (≤ 10 linii, przez send_message):
   - po zadaniu 2: przyczyna i szacunek reszty;
   - PYTANIE: pełna treść, opcje, rekomendacja (koordynator nie widzi twojego czatu);
   - PRZEKAZANIE: zrobione (SHA), dowody (pliki), test czerwony→zielony (nazwa testu, cytat wyniku), decyzje, koszt, otwarte.

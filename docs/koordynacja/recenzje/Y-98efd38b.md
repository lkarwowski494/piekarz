# Recenzja Y — KO-061 (E2E 06-koniec-wypieku), diff 75cb5570..42d74ced

**Werdykt: przyjąć z uwagami.** P0: brak. P1: brak.

## Fakty sprawdzone
- `app/stolnica.tsx:61-68`: `onKoniec` → `setWybrany(null)` → `pusta` → `useEffect` → `router.replace('/')`. Diagnoza w YAML/D-412 zgodna z kodem.
- `start-czynnosci`: `app/(tabs)/(dzis)/index.tsx:160`, w jedynym `return` ekranu (l. 129), bez warunku — renderowany zawsze na Dziś. Ten sam id jest już używany jako „ekran Dziś gotowy” w 01, 05, 06 (l. 12), zrzutach.
- Stolnica to ekran stosu korzenia nad `(tabs)` (`app/_layout.tsx:145`, `dangerouslySingular`); bake-log-card-* tylko na Dzienniku (`app/(tabs)/dziennik/index.tsx:65`), więc warunek `notVisible` nie ma fałszywego trafienia z innego ekranu.
- Zakazy: `git diff --stat -- app src ios` pusty; limity 15000 bez zmian; brak `retry` flow; asercje `bake-log-card-.*` i `assertNotVisible karta-dziennik-pusty` zostają. Dotrzymane.
- Test `tests/e2e-06-po-zapisie-wyscig.test.ts` (brak node_modules w repo — asercje odtworzone 1:1 w node): nowy YAML 3/3 zielone w obu plikach; stary YAML (75cb5570) czerwony w testach 1 i 2 (brak czekania na `start-czynnosci` przed `tab-dziennik`, brak `runFlow when notVisible`), test 3 zielony (pilnuje niezmienionego limitu — poprawnie). Czerwony z właściwego powodu.
- Składnia Maestro: inline `runFlow: { when: { notVisible: { id } }, commands: [...] }` — poprawna (udokumentowana forma; id jako regex wspierane w warunkach). Runner Jest (`tests/maestro-runner.ts:75,212`) traktuje `runFlow` jako no-op, więc `tests/maestro-flows.test.tsx` się nie wysypie. Commit 98efd38b: dowód verify kod 0.

## Ocena (1): usuwa czy maskuje
Czekanie na stan docelowy przekierowania (Dziś) przed stuknięciem usuwa główną przyczynę (stuknięcie przed `replace`). Jedno warunkowe ponowienie stuknięcia sprawdza rzeczywisty efekt i nie osłabia końcowej asercji — jeśli zakładka Dziennik byłaby zepsuta, flow dalej padnie. Akceptowalne, nie maskowanie.

## P2
1. `.maestro/e2e/06-koniec-wypieku.yaml:88-91` (i `00-przygotuj-podwojenie.yaml:65-68`): `start-czynnosci` visible nie dowodzi końca animacji przejścia — przy `replace` nowa instancja `(tabs)` jest w hierarchii już w trakcie animacji, a UIKit ignoruje dotyk w trakcie przejścia. Pierwsze stuknięcie wciąż może przepaść; łapie to dopiero ponowienie. Do rozważenia: dodatkowo `extendedWaitUntil notVisible: finish-save-btn` albo `waitForAnimationToEnd` przed `tapOn`. Bez tego poprawka opiera się częściowo na ponowieniu.
2. Warunek `when notVisible` jest sprawdzany zaraz po stuknięciu; na wolnej maszynie (diagnoza: 17–31 s na krok) Dziennik może jeszcze się renderować → drugie stuknięcie w aktywną zakładkę (tabPress → popToTop/scroll-to-top). Nieszkodliwe dla asercji, ale ponowienie bywa „ślepe”. Informacyjnie.
3. Test jest tekstowy (regex po YAML, zależny od formatowania i cudzysłowów `id: "..."`); nie sprawdza, że `start-czynnosci` istnieje w `app/(tabs)/(dzis)` — można dodać grep testID w kodzie Dziś, by zmiana id nie zostawiła martwego czekania (dziś złapałby to dopiero E2E po 15 s).
4. Komentarze/D-412 cytują `app/stolnica.tsx:62-64`; faktyczny `useEffect` z `replace` to l. 62-64 (ok), `onKoniec` l. 66-68 — drobne.
5. Stabilność potwierdzi dopiero przebieg E2E na macOS (D-412 słusznie oznacza [DO USTALENIA]).

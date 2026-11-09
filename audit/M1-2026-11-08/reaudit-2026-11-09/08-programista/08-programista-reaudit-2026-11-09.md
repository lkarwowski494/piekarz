# Reaudyt: Programista — Piekarz — 2026-11-09
Commit: ea249c9c · Tryb: reaudit (pętla 1, baza 2ef8870a) · Grupa A (wyjątek nazwany KO-006: role 05, 12, 08 w jednym kontekście) · Środowisko: Linux x86_64, Node v22.23.4, `node_modules` z `npm ci`; Jest, `tsc`, ESLint działają; bez Xcode i telefonu. Sondy w `git worktree` w scratchpadzie.

## Podsumowanie
Pięć zadań M1 tej roli ma testy akceptacyjne, które sprawdzają to, co mówi tytuł, i przechodzą: pasek tygodnia po północy z niedzieli (025), brak = brak (026), jeden moduł zakresów receptury (027), blokada podwójnego stuknięcia na karcie zakwasu (028) i priorytet powiadomień po czasie w oknie 24 h (030). Kod zapisu po kolejce (M1-001, wspólne z rolą 05) zweryfikowany w raporcie 05 (`05-architekt-001`). Typecheck i lint kod 0. Znaleziska M2: 001 potwierdzone (martwa funkcja RD-08, istniało wcześniej, P3), 005 potwierdzone w części (dwa wywołania zapisu), ale bez podwójnej receptury w bazie (ten sam id), P3.

| ID | M1 | Wynik | Dowód (skrót) |
|---|---|---|---|
| 08-programista-001 | M1-audytor-generalny-001 | zweryfikowane — patrz 05-architekt-001 (DEV-05 → ARCH-12) | `../05-architekt/dowody/sonda-001-kolejka.txt` |
| 08-programista-002 | M1-audytor-generalny-025 | zweryfikowane | `src/hooks/useKalendarz.ts:91` „const widok = useMemo(() => (przesuniety ? zapisany : widokDzis(zapisany.tryb, now))”; test 025 (poniedziałek i niedziela jako pierwszy dzień) kod 0 |
| 08-programista-003 | M1-audytor-generalny-026 | zweryfikowane | `app/(tabs)/zakwasy/index.tsx:146` „if (starter.lastFedAt === undefined) return t('Brak danych o karmieniu');”; `src/core/bake-statistics.ts:57`; import receptury: błąd z nazwą pola; test 026 kod 0 |
| 08-programista-004 | M1-audytor-generalny-027 | zweryfikowane | `src/core/zakresy-receptury.ts:13` „woda: { min: 0, max: 150 },”; arkusz i parser importują ten moduł; test 027 (granice arkusza → „receptura”, jedno źródło) kod 0 |
| 08-programista-006 | M1-audytor-generalny-028 | zweryfikowane | `src/components/zakwas/useAkcjeZakwasu.ts:51` „if (zapisuje.current) return;”, `src/components/zakwas/useStarterLog.ts:50`; test 028 ("Zapisz dokarmienie", "Podwoił objętość": jeden nowy wpis) kod 0 |

Zadanie M1 bez ID roli (źródło: weryfikacja G9, rola-właściciel 08):

| Zadanie | Wynik | Dowód |
|---|---|---|
| M1-audytor-generalny-030 | zweryfikowane | `src/core/notification-plan.ts:251` pierwszeństwo: bieżący krok każdego wypieku, potem wszystko w oknie `OKNO_PIERWSZENSTWA_MS` (24 h, `src/core/notification-config.ts:38`) po czasie, reszta po grupie; test `src/core/__tests__/priorytet-powiadomien-030.test.ts` (karmienia za ok. 2 h zostają przy 50 krokach dwóch wypieków, limit 40) kod 0 |

Znaleziska M2 przypisane tej roli (D-288, bez nowego numeru):

| Znalezisko M2 | Wynik na ea249c9c | Poziom wg D-288 | Dowód |
|---|---|---|---|
| M2-koordynator-napraw-001 | potwierdzone; istniało wcześniej (2ef8870a) | P3, klasa: realny (backlog 1.0.1; decyzja zakresu roli 03) | `src/core/domain-rules.ts:326` funkcja RD-08 bez wywołania poza testami (`dowody/m2-001-grep.txt`: tylko definicja i alias) |
| M2-koordynator-napraw-005 | potwierdzone w części: dwa wywołania `saveRecipe`, jedna receptura w bazie; istniało wcześniej | P3, klasa: brzegowy (backlog 1.0.1) | `src/components/ImportRecipeModal.tsx:86` bez blokady; recepturę (z jednym `id`) liczy `useMemo` (`:55`), zapis to `INSERT OR REPLACE` po `id` (`src/data/recipes-store.ts:70`), więc drugi zapis nadpisuje ten sam wiersz; skutek: drugi komunikat "Zaimportowano" i drugie `onImportSuccess` |

Poza zadaniami grupy A: 08-programista-005 (E2E, M1-audytor-generalny-066) i 08-programista-007 (BR→test, M1-audytor-generalny-070) — rola 07, grupa E; 08-programista-008 (M1-audytor-generalny-029, P3, odłożone do 1.1 w D-302) — bez zmian, nie sprawdzano.

Liczby: zweryfikowane 6 (5 ID roli + M1-030), nadal otwarte 0, regresja 0, istniało wcześniej 0 (oba znaleziska M2 tej roli istniały wcześniej, liczone w tabeli M2).

## Linia bazowa i założenia
- Ścieżki zapisu w zakresie pętli: dokarmienie z karty (teraz przez dziennik, `src/components/zakwas/useAkcjeZakwasu.ts:75`), obserwacja, nowy zakwas, import receptury, zapis zakwasu po kolejce; brak = brak w etykiecie, średniej i imporcie.
- Wymiary: obsługa błędów (blokada podwójnego zapisu) — sprawdzone; typy na granicach (import receptury) — sprawdzone w 026/027; i18n nowych tekstów — test 003 (35 języków) w raporcie 12; wydajność, dostępność, system projektowy — poza zakresem pętli.
- Uwaga do 025: flaga „przesunięty” zostaje po przesunięciu tygodnia w przód i z powrotem bez „Dziś” (`src/hooks/useKalendarz.ts:99`), więc taki widok nie przejdzie na nowy tydzień o północy; zgodne z opcją (a) znaleziska ("przesunięty widok zostaje przesunięty"), bez zgłoszenia.
- Uwaga do 026: brak pola masy w pliku receptury nadal daje 850 g (`src/lib/recipe-sharing.ts:244`), opisane w kodzie jako wspierany format płaskiego JSON; zła masa daje błąd (`:241`). Zgodne z testem akceptacyjnym (masa jako tekst).

## Pokrycie (co sprawdzono, czego nie)
| Obszar / pliki | Sprawdzone? | Jak (plik dowodu) |
|---|---|---|
| Diff 2ef8870a..ea249c9c w `src/hooks/useKalendarz.ts`, `src/components/zakwas/*`, `src/lib/recipe-sharing.ts`, `src/core/zakresy-receptury.ts`, `src/core/notification-plan.ts`, `src/components/ImportRecipeModal.tsx` | tak | odczyt; testy akceptacyjne (`../05-architekt/dowody/jest-testy-akceptacyjne-grupa-A.txt`) |
| DEV-04: typecheck, lint, pełny Jest | tak | `dowody/typecheck.txt`, `dowody/lint.txt`, `dowody/npm-test-pelny.txt` |
| DEV-03: pominięte testy i zmienione asercje | tak | `dowody/dev03-dev14-grep.txt`; diff zmienionych testów danych (zmiany dostosowują do kolejki i jednej drogi dokarmienia, bez usuniętych oczekiwań) |
| Zachowanie na telefonie | nie | brak urządzenia |

## Kontrola dowodów i sekretów
Wynik `node audit/M1-2026-11-08/narzedzia/sprawdz-raport.mjs <raport> /home/user/piekarz audit/M1-2026-11-08/reaudit-2026-11-09/08-programista --rola 08-programista`:

```
OK: odwołania, cytaty, pliki dowodów i sekrety sprawdzone; format raportu 08-programista
```
(kod 0)

`git status --porcelain` po pracy: pusty wynik — pliki śledzone nietknięte.

## Stosowalność listy kontrolnej
| Pozycja | Status | Wynik |
|---|---|---|
| DEV-01 | dotyczy | ok dla 025 i 030 (wektory graniczne w testach) |
| DEV-03 | dotyczy (próbka regresji spoza zmian) | ok: 0 trafień `.skip(`, `.only(`, `xit(`, `it.todo(`, `expect(true)` (`dowody/dev03-dev14-grep.txt`) |
| DEV-04 | dotyczy | typecheck kod 0; lint kod 0 (2 ostrzeżenia `react-hooks/exhaustive-deps` w `src/hooks/usePendingRecipeLoader.ts:34`, plik spoza zmian pętli); pełny Jest (`npx jest --ci`, raz na grupę): 650 zestawów, 6797 z 6800 testów, kod 1 — 3 testy w 2 plikach D-13 przekroczyły limit 30 s przy braku pamięci w sesji (OOM jądra) (`dowody/npm-test-pelny.txt`); te 2 pliki osobno: 6/6, kod 0 (`dowody/jest-ponowienie-d13.txt`) — wynik środowiska, nie kodu |
| DEV-05 | dotyczy | patrz 05-architekt-001 (ARCH-12) i ARCH-07 w raporcie 05 |
| DEV-07 | dotyczy | ok (026) |
| DEV-10 | dotyczy | ok dla kart zakwasu (028); import receptury bez blokady — M2-koordynator-napraw-005 (P3) |
| DEV-13 | dotyczy | ok (027: jeden moduł zakresów) |
| DEV-14 | dotyczy (próbka regresji spoza zmian) | ok: brak plików kluczy w `git ls-files` i wzorców kluczy w `src`, `app` (`dowody/dev03-dev14-grep.txt`) |
| DEV-02, -06, -08, -09, -11, -12, -15, -16 | dotyczy | nie sprawdzono w tej pętli: brak otwartych ID roli (DEV-06 → ARCH-08/09/10 w raporcie 05) |

## Klasyfikacja znalezisk M2 (D-288)
- **M2-koordynator-napraw-001 — potwierdzone, P3 (klasa: realny), istniało wcześniej.** `calculateFermentationAdaptation` i alias `adaptFermentationTimeForTemp` nie mają wywołania w `src` ani `app` poza testami (`dowody/m2-001-grep.txt`, kod 0). To decyzja zakresu (Rodzaj P): pokazać komunikat RD-08 w Harmonogramie albo usunąć funkcję i 3 klucze; poza tym martwy kod bez skutku dla danych.
- **M2-koordynator-napraw-005 — potwierdzone w części, P3 (klasa: brzegowy), istniało wcześniej.** Przycisk "Zaimportuj przepis" nie ma blokady w trakcie zapisu (`src/components/ImportRecipeModal.tsx:86` „await saveRecipe(recipe);”), więc dwa szybkie stuknięcia wołają zapis dwa razy. Podwójnej receptury jednak nie ma: obiekt z `id` powstaje raz w `useMemo` (`src/components/ImportRecipeModal.tsx:55`), a zapis to `INSERT OR REPLACE` po kluczu `id` (`src/data/recipes-store.ts:70`), na tabeli bez tabel podrzędnych. Skutek: dwa okna "Zaimportowano" i dwa wywołania `onImportSuccess`. Test akceptacyjny z M2 ("jeden zapis") aktualny.

## Znaleziska (szczegóły)
Brak nowych znalezisk tej roli w pętli 1.

## Do sprawdzenia (pewność ≤ 80%)
- Karta profilu zakwasu po „Usuń wpis” w dzienniku: ekran może do przeładowania pokazywać czas usuniętego dokarmienia ze stanu ekranu (mechanizm z 05-architekt-501); po 002 nie wraca on już do bazy. Na urządzeniu nie sprawdzono.

## Co działa dobrze i należy zachować
- Blokada `useRef` w akcjach karty zakwasu, wzorowana na `useFinishBake`, z testem dla dwóch akcji.
- Zakresy receptury w jednym module, z testem, że arkusz i parser nie mają własnych liczb granicznych.
- Pierwszeństwo powiadomień: bieżący krok każdego wypieku nie wypada nigdy.

## Decyzje dla właściciela
1. M2-koordynator-napraw-001 (P3): (a) komunikat RD-08 w Harmonogramie (teksty już w 35 językach) — praca 04/08; (b) usunięcie funkcji i kluczy. Rozstrzyga rola 03; rekomendacja jak w M2: decyzja zakresu w 1.0.1.

## Proponowane polecenie naprawy
`node tools/assemble.mjs 08-programista --tryb fix --zadania M2-koordynator-napraw-005` (1.0.1, blokada jak w 028).

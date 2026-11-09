# Rola 10 — tryb fix, 2026-11-09 (M2 partia 3b): M1-audytor-generalny-082 (10-wydanie-007) według D-314

Gałąź `naprawy/M2-koordynator-napraw-2026-11-09-p3` od 1d7c3fc0; wypchnięta (HEAD 0ddecf89). Bez uruchamiania workflowów, bez połączenia z App Store Connect, bez nowych sekretów. Poprzednia sesja: `wynik.md` (przeczytany, nienadpisany).

## E0 — środowisko i klasyfikacja
- Linux bez Xcode, Node v22, git; push na gałąź działa; sieć do docs.github.com, developer.apple.com i github.com (klon publicznego repo narzędzi) działa.
- 082: P, wybór właściciela D-314 (`docs/decyzje.md:1802`) zastępuje DEC-14 a. Dowodu przeciwko D-314 brak — wdrożone. Klucz i nazwy sekretów bez zmian.

## Commit
| SHA | ID | Zmiana |
|---|---|---|
| 0ddecf89 | M1-audytor-generalny-082; 10-wydanie-007; D-314 | `testflight.yml`: zadanie `build` w `environment: release` (`.github/workflows/testflight.yml:64`); `asc-ustawienia.yml` i `asc-zgloszenie.yml`: zadania `na-sucho` (bez środowiska) i `zapis` (`needs: na-sucho`, `if` z „zapis”: true, `environment: release`; `.github/workflows/asc-ustawienia.yml:56`, `.github/workflows/asc-zgloszenie.yml:74`); nowy `asc-kontrola.yml` (`.github/workflows/asc-kontrola.yml:24`); `docs/wydanie/asc-kontrola.json`; generator `scripts/asc-kontrola-oczekiwane.mjs` i plik `docs/wydanie/asc-kontrola-oczekiwane.json`; procedura `docs/prawne/procedura-bezpieczenstwa.md:43` |

Szczegóły wdrożenia:
- Przebieg na sucho dostaje kopię pliku zgody z `"zapis": false` (dla zgłoszenia z tym samym `zakres`, więc lista i skrót planu są te same co przy zapisie); skrypt bez `"zapis": true` wysyła tylko GET (`scripts/asc-ustawienia.mjs:499`, `scripts/asc-zgloszenie.mjs:397`). Zapis nadal wymaga `"zapis": true` i zgodnego skrótu — warunek nieosłabiony, doszła akceptacja w środowisku.
- `asc-kontrola.yml`: tylko `workflow_dispatch` (wejście `szczegoly`), `contents: read`, bez kroków własnych, wywołanie `lkarwowski494/apps4brew-narzedzia/.github/workflows/asc-kontrola.yml@43afe81aa37a117dd32259f6452196a1efccd0ec` — SHA Treningu; istnieje w repo narzędzi, ale tylko na gałęzi `asc-kontrola-brak-ofert`, `main` ma sam „Initial commit” (`dowody/082-zrodla-2026-11-09.txt`).
- Wspólny workflow wymaga sekretów `ASC_KEY_ID`, `ASC_ISSUER_ID`, `ASC_KEY_P8` i zapisuje `ASC_KEY_P8` do pliku bez dekodowania (wiersz `printf '%s\n' "$ASC_KEY_P8" > "$RUNNER_TEMP/AuthKey.p8"` w workflow narzędzi @43afe81), więc potrzebna surowa treść `.p8`. Piekarz trzyma klucz jako `ASC_KEY_P8_BASE64` (albo `ASC_KEY_P8`; workflowy czytają `ASC_KEY_P8_BASE64 || ASC_KEY_P8`). Nowego sekretu nie dodałem — krok właściciela niżej.
- Konfiguracja: bundle id (app.json), produkty (`src/lib/platnosci/konfiguracja.ts`), 9 storefrontów z ceną ręczną i kwoty (`docs/wydanie/ceny.json`), Family Sharing, brak oferty wprowadzającej (D-112), kategoria FOOD_AND_DRINK + PRODUCTIVITY (D-055), wiek (wypisanie), dostępność `null` (tylko wypisanie liczby; 174 storefronty bez CHN sprawdza `asc-ustawienia.mjs`), metadane 34 lokalizacji (nazwa, podtytuł, słowa, promocja, opis) i adresy z pliku generowanego. Bez sekretów i identyfikatorów (test).
- Rola klucza w procedurze: „tyle, ile wymaga podpis w chmurze”; Apple: wiersz „Upload builds” dla App Manager i Developer „Requires access to Certificates, Identifiers & Profiles” (`dowody/apple-role-klucze-2026-11-09.txt`, poprzednia sesja); Revoke: „Users and Access → Integrations → Team Keys → Edit → Revoke Key” (`dowody/082-zrodla-2026-11-09.txt`, odczyt 2026-11-09).

## Testy przed/po
- `tests/asc-klucz-082.test.ts` (25 przypadków): przed 22 failed / 3 passed (`dowody/082-przed.txt`; czerwone z właściwego powodu: brak `environment: release`, jedno zadanie w asc-*, brak asc-kontrola i konfiguracji, brak §5 procedury), po 25 passed (`dowody/082-po.txt`).
- `npm run verify` po `git add`: kod 0, 646 zestawów, 6750 testów (`dowody/verify-082.txt`; 2 ostrzeżenia lint w `src/hooks/usePendingRecipeLoader.ts` sprzed zmiany).
- Konfiguracji nie uruchomiłem na kodzie narzędzia (uruchomienie kodu z zewnętrznego repo zablokował klasyfikator uprawnień); zgodność pól z `asc-kontrola/README.md` i `kontrole/*.mjs` @43afe81 sprawdziłem czytaniem. `[DO USTALENIA]`: pierwszy przebieg `asc-kontrola` u właściciela.

## Testy dostosowane (z uzasadnieniem)
- `tests/asc-ustawienia-workflow.test.ts`, `tests/asc-zgloszenie-workflow.test.ts`: kroki ze skryptem i sekretami są teraz dwa (na sucho i zapis) zamiast jednego; test sprawdza oba kroki i to, że zapis woła skrypt z oryginalnym plikiem zgody. Reszta asercji bez zmian.
- `tests/public-repo.test.ts`: wymóg `timeout-minutes` nie dotyczy pliku, którego wszystkie zadania tylko wywołują workflow wielokrotnego użytku — GitHub nie dopuszcza `timeout-minutes` w takim zadaniu („Supported keywords for jobs that call a reusable workflow”, `dowody/082-zrodla-2026-11-09.txt`); limit 15 min ma workflow narzędzi, przypięty do SHA. Wyjątek obejmuje tylko `asc-kontrola.yml` (sprawdzone na 8 plikach).
- `docs/22-macierz-testow.md` przegenerowany (`npm run matrix:update`; jedna linia, nowy plik testu).

## Przegląd ścieżki wrażliwej
`.github/workflows/` to ścieżka wrażliwa. Przegląd subagenta: **nieodbyty** (sesja jest subagentem, bez narzędzia subagentów). Polecenie: `polecenie-przeglad-082.md` (diff 1d7c3fc0..0ddecf89, znalezisko, zasady 10–14) — uruchamia koordynator.

## Przekazania
- 07 (zadanie 068, `testflight.yml`): zadanie `build` ma teraz `environment: release` (linia 64, komentarz nad nią). `tests/asc-klucz-082.test.ts` wymaga, żeby każde zadanie `testflight.yml` z `secrets.ASC_` było w środowisku `release`; nowe zadanie z kluczem musi je mieć, zadanie bez klucza (bramka E2E) — nie. Podział `\n  tag:\n` w `tests/testflight-workflow.test.ts` bez zmian. Po zmianie: `npm run verify`.
- 08: brak zmian kodu aplikacji.

## Kroki właściciela
1. **Przed pierwszym przebiegiem** po scaleniu: GitHub → piekarz → Settings → Environments → New environment `release` → Required reviewers: Ty; „Prevent self-review” **odznaczone** (jedyny recenzent uruchamia sam); Deployment branches and tags: Selected → `master` (rekomendacja). Bez tego GitHub przy pierwszym przebiegu sam utworzy `release` bez ochrony („will create an environment with the referenced name”), a akceptacja nie zadziała. Środowisko jest na repo: to z Treningu nie obowiązuje tu.
2. Sekret `ASC_KEY_P8` = surowa treść pliku `.p8` (Settings → Secrets and variables → Actions), jeśli go nie ma — potrzebny tylko dla `asc-kontrola.yml`. Sekretów w środowisku nie przenoś: przebiegi na sucho i kontrola (bez środowiska) straciłyby klucz.
3. App Store Connect → Users and Access → Integrations → Team Keys: sprawdzić kolumnę Access obecnego klucza i zapisać rolę w `docs/wydanie/dziennik.md` (bez identyfikatora klucza).
4. Repo `apps4brew-narzedzia`: nie usuwać gałęzi `asc-kontrola-brak-ofert` albo scalić ją do `main` — inaczej przypięty SHA może przestać istnieć (dotyczy też Treningu).
5. Po scaleniu i kroku 1–2: Actions → „ASC kontrola ustawień” → Run workflow (odczyt), wynik do dziennika.

## Znaleziska nowe
- 10-wydanie-N2 (P2, D, repo narzędzi): przypięty SHA narzędzi wisi tylko na gałęzi pobocznej; usunięcie gałęzi psuje `asc-kontrola` w Piekarzu i Treningu. Krok 4.
- 10-wydanie-N3 (P2, P, ryzyko szczątkowe): klucz zostaje sekretem repozytorium (potrzebują go przebiegi na sucho i kontrola), więc środowisko `release` chroni przed zapisem i wysyłką bez akceptacji, ale nie przed workflowem z innej gałęzi czytającym sekret repo. Opcje: (a) tak jak jest + ograniczenie gałęzi środowiska (krok 1) — tanio; (b) osobny klucz tylko do odczytu (rola np. Sales/Customer Support) dla przebiegów na sucho i kontroli, klucz z prawem zapisu wyłącznie jako sekret środowiska `release` — mniejszy zasięg wycieku, drugi klucz do utrzymania. Rekomendacja: (a) teraz, (b) przy najbliższej wymianie klucza. `[DO USTALENIA]`: czy rola tylko do odczytu wystarczy na wszystkie GET skryptów.
- Obserwacja: Trening wyklucza `sl` z lokalizacji App Store Connect (L-003), Piekarz ma 34 z `sl` (`docs/wydanie/metadane/sl.json`); pierwszy przebieg kontroli pokaże, czy ASC ma tę lokalizację. Identyfikatory kategorii FOOD_AND_DRINK/PRODUCTIVITY — `[DO USTALENIA]`, potwierdzi przebieg (różnica = zła wartość w konfiguracji albo w ASC).

## Przeczytane źródła (2026-11-09)
- `docs/decyzje.md:1802` (D-314); raport `10-wydanie-2026-11-08.md` (10-wydanie-007); `wynik.md`; Trening: `.github/workflows/asc-kontrola.yml`, `store/asc-kontrola.json`, `tests/asc-kontrola.test.ts`, `docs/15-app-store.md` wiersz 339 (kopia w scratchpadzie); apps4brew-narzedzia @43afe81: `.github/workflows/asc-kontrola.yml`, `asc-kontrola/README.md`, `kontrole/*.mjs`.
- docs.github.com: deployments-and-environments, manage-environments, reusing-workflow-configurations; developer.apple.com: app-store-connect-api (Revoke) — cytaty w `dowody/082-zrodla-2026-11-09.txt`.

## Kontrola raportu
`node audit/M1-2026-11-08/narzedzia/sprawdz-raport.mjs audit/M1-2026-11-08/role/10-wydanie/fix-2026-11-09/wynik-p3b.md` (z katalogu repo) → „OK: odwołania, cytaty, pliki dowodów i sekrety sprawdzone”, kod 0.

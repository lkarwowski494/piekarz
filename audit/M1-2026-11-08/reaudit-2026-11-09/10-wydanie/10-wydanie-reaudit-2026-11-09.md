# Reaudyt: Wydanie i sklepy — Piekarz (EN: Baker) — 2026-11-09
Commit: ea249c9c · Gałąź: `redesign/piekarz-2026-10-22` (HEAD odłączony, ea249c9cc069e911a9ce83beabea39ed7f314616) · Tryb: reaudit, pętla 1, baza 2ef8870a · Grupa E (07-jakosc, 10-wydanie; KO-006) · Środowisko: Linux, Node 22, MCP GitHub tylko do odczytu, pełna historia git (1364 commity, `is-shallow-repository` false po dociągnięciu przez koordynatora); bez App Store Connect, macOS i telefonu

`git status --porcelain` na początku: pusty. Raport 07 tej grupy: `../07-jakosc/07-jakosc-reaudit-2026-11-09.md` (werdykt ZABLOKOWANE: E2E na SHA kandydata w toku, Stryker do nightly). Testów tu nie powtarzam poza testami akceptacyjnymi obszaru 10.

## Podsumowanie
Teksty strony produktu i notatki dla App Review są poprawione we wszystkich 34 lokalizacjach: opis podaje 26 receptur (11 z planem), ma sekcję wersji drożdżowej i maszyny do chleba, funkcje Pro mają „(Pro)” w tekście promocyjnym i w sekcjach, a notatki prowadzą do trybu maszyny przyciskami z interfejsu EN. Dziennik zna build 1023 i Z-1, a test pilnuje, żeby każdy tag `v*-b*` miał wiersz. Klucz App Store Connect rozwiązano decyzją właściciela D-314 zamiast DEC-14 a: jeden klucz zostaje (podpis w chmurze wymaga szerokiej roli), zadania z zapisem i build są za akceptacją w środowisku `release`, procedura unieważnienia jest i uczciwie opisuje, że sekret repozytorium sięga dalej niż środowisko. Otwarte zostają: E2E na SHA kandydata (w toku), P1 zrzutów 10-wydanie-001 (poza zadaniami grupy, pliki PNG bez zmian) i cichy zjazd Xcode.

| ID | Wynik | Dowód |
|---|---|---|
| 10-wydanie-002 | nadal otwarte (w toku) | M1-066: E2E #101 na ea249c9c `in_progress`, #100 na przodku 6a412c9a zielone (`../07-jakosc/dowody/ci-stan.txt`); bramka `e2e-sha` wymusi zielony E2E przed buildem |
| 10-wydanie-003 | zweryfikowane | M1-079: `docs/wydanie/dziennik.md:21` wiersz 1023; Z-1 w `docs/wydanie/dziennik.md:28`; `tests/dziennik-wydan-tagi-079.test.ts` kod 0 |
| 10-wydanie-004 | zweryfikowane | M1-080 (DEC-01 a): „26” w 34/34 plikach metadanych, „15” w 0; sekcja maszyny i drożdży w pl i en-US; `tests/opis-sklepu-receptury-080.test.ts` kod 0 |
| 10-wydanie-005 | zweryfikowane | M1-078 (DEC-05 a; też 02-monetyzacja-001): „(Pro)” w tekście promocyjnym i sekcjach 34 lokalizacji; `tests/opis-sklepu-pro-078.test.ts` kod 0 |
| 10-wydanie-006 | zweryfikowane | M1-081: `docs/app-store-metadata-v2.md:227` punkt „Bread machine mode (Pro)”; `tests/store-metadata.test.ts` kod 0 |
| 10-wydanie-007 | zweryfikowane (w zakresie D-314) | M1-082: `docs/decyzje.md:1809`; `environment: release` w `.github/workflows/asc-ustawienia.yml:56` i `.github/workflows/asc-zgloszenie.yml:74`; procedura `docs/prawne/procedura-bezpieczenstwa.md:52`; `tests/asc-klucz-082.test.ts` kod 0 |
| 10-wydanie-001 | nadal otwarte (P1, poza zadaniami grupy E) | `git diff --stat 2ef8870a..ea249c9c -- docs/wydanie/zrzuty` pusty: PNG z plakietką na ramkach 01–06 bez zmian |
| 10-wydanie-008 | nadal otwarte (P2, poza zadaniami grupy E) | `.github/scripts/select-xcode.sh:8` bez zmian |
| 10-wydanie-601 | regresja (P3) | plan wydania liczy 5 scenariuszy E2E, a jest 6 (`docs/wydanie/plan-wydania-1.0.md:9`) |

Liczby: zweryfikowane 5, nadal otwarte 3 (w tym 10-wydanie-001 P1), regresja 1 (P3), istniało wcześniej 0. 02-monetyzacja-001 (M1-078): część tekstowa spełniona razem z 10-wydanie-005; część „zrzuty ramek zgodne z tekstem” zależy od 10-wydanie-001 (podpisy ramek 01 i 05 w `docs/wydanie/zrzuty/pl/podpisy.json` mają oznaczenie, obrazy nie zostały wygenerowane od nowa).

## Komendy
| Komenda | Kod | Wynik |
|---|---|---|
| `npx jest --ci` 9 plików (078, 015, 079, 080, store-metadata, 082, asc-ustawienia, asc-zgloszenie, zrzuty-sklepu) | 0 | 9/9 zestawów, 184/184 testów (`dowody/testy-akceptacyjne-10.txt`) |
| `sprawdz-wydanie.mjs metadane` (34 lokalizacje w formacie EAS w scratchpadzie) | 0 | OK, bez UWAG (`dowody/sprawdz-wydanie.txt`) |
| `sprawdz-wydanie.mjs sekrety . --historia` (pełna historia) | 1 | 9 trafień, wszystkie fałszywe po ocenie okiem: nazwa zmiennej `WYSTAWCA` w testach i opisy formatu klucza bez linii base64; `git log --all -p` → 0 linii base64 po nagłówku klucza (`dowody/sprawdz-wydanie.txt`) |
| `npm run verify` (raz na grupę) | 0 | `../07-jakosc/dowody/npm-verify.txt` |

## Kontrola dowodów i sekretów
Wynik `node audit/M1-2026-11-08/narzedzia/sprawdz-raport.mjs <ten raport> /home/user/piekarz <katalog roli> --rola 10-wydanie` na wersji końcowej: `OK: odwołania, cytaty, pliki dowodów i sekrety sprawdzone; format raportu 10-wydanie`, kod 0. Poświadczenia w raporcie i dowodach zamaskowane; żadnej wartości klucza ani identyfikatora.

## Uwagi do weryfikacji
- **10-wydanie-007 / D-314.** Test akceptacyjny raportu źródłowego (inna nazwa sekretu w `testflight.yml` niż w `asc-*.yml`) nie jest spełniony, bo właściciel zastąpił DEC-14 a decyzją D-314 („Jak Trening (Recommended)”, słowa w rejestrze) z powodem technicznym: podpis w chmurze wymaga roli z dostępem do certyfikatów. Uznaję za rozwiązane decyzją. Ograniczenie, opisane w procedurze: środowisko `release` chroni zadania z zapisem i build, ale sekrety są na poziomie repozytorium, więc przebiegi na sucho (`na-sucho`) i `asc-kontrola.yml` używają tego samego klucza bez akceptacji. Ryzyko teoretyczne (uruchomić `workflow_dispatch` może tylko osoba z prawem zapisu); warunek z procedury: Required reviewers w `release` ustawione przed pierwszym przebiegiem (krok właściciela, nie sprawdzony — brak dostępu do ustawień).
- **Bramka E2E przed buildem (JAK-16 / WYD-02):** oceniona w raporcie 07 (07-jakosc-004 zweryfikowane, D-316 utrzymać, 07-jakosc-602 P3).

## Próbka regresji
- Zmienione pliki obszaru: `docs/wydanie/metadane/*.json` (34), `docs/app-store-metadata-v2.md`, `docs/wydanie/dziennik.md`, `sklep.md`, `plan-wydania-1.0.md`, workflowy `asc-*`, `testflight.yml`, `docs/prawne/procedura-bezpieczenstwa.md`. Nowy problem: 10-wydanie-601.
- Lista kontrolna spoza zmienionych plików: WYD-01 (sekrety w plikach i pełnej historii: brak wycieku) — ok; WYD-04 (limity metadanych 34 lokalizacji, skrypt kod 0) — ok; WYD-13 (plan wydania ręcznego, `eas.json` bez automatycznej wysyłki, bez zmian od 2ef8870a) — ok.

## Znaleziska (szczegóły)

### 10-wydanie-601 · Bramka planu wydania liczy 5 scenariuszy E2E, a po dodaniu końca wypieku jest 6
- Pozycja listy kontrolnej: WYD-13
- Poziom: P3 (D-288: P2 → P3, backlog 1.0.1)
- Realność: realny · Pewność: wysoka
- Rodzaj: D
- Dowód: `docs/wydanie/plan-wydania-1.0.md:9` „pełny katalog `.maestro/e2e` (5 scenariuszy)”; katalog ma 6 plików od f38f9e63 (`.maestro/e2e/06-koniec-wypieku.yaml`, M1-016).
- Mechanizm: liczba w dokumencie bez kontroli względem katalogu; poprawka 016 dodała scenariusz bez aktualizacji bramki.
- Powraca: nie
- Wzorzec lub źródło: zasada roli 4 (tekst twierdzi to, co jest w tej wersji).
- Kroki w aplikacji: brak; czytający bramkę może uznać 5 zielonych scenariuszy za komplet.
- Opcje: (a) „wszystkie scenariusze katalogu” bez liczby; (b) liczba + test zgodności z katalogiem. Rekomendacja: (a).
- Test akceptacyjny: bramka pkt 1 bez liczby albo z liczbą równą liczbie plików `.maestro/e2e/*.yaml`.
- Status: otwarte (backlog 1.0.1)

## Proponowane polecenie naprawy
Przed zgłoszeniem: 10-wydanie-001 (zrzuty, decyzja właściciela z raportu 2026-11-08) i zielony E2E na SHA kandydata (10-wydanie-002). Backlog 1.0.1: `node tools/assemble.mjs 10-wydanie --tryb fix --zadania 10-wydanie-008,10-wydanie-601`.

`git status --porcelain` na końcu: pusty.

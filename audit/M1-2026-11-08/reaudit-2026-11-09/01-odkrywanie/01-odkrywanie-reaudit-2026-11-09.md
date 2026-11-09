# Reaudyt: Odkrywanie i BRD — Piekarz — 2026-11-09
Commit: ea249c9c · Tryb: reaudit (pętla 1, baza 2ef8870a, grupa B) · Moduły: kontrola-brd, rynek-i-polityki · Środowisko: Linux (chmura), Node v22.23.4, sieć działa (iTunes RSS, opensource.org); brak macOS/Xcode (`dowody/e0-srodowisko.txt`). Linia bazowa kursu z raportu 2026-11-08 bez zmian (tryb reaudit: ODK-14…16 względem niej).

## Podsumowanie
Cztery zadania grupy B tej roli (003, 002, 006, 008) są naprawione: testy akceptacyjne istnieją, sprawdzają tytuł i przechodzą (5 plików, 30 testów, kod 0, `dowody/jest-akceptacyjne-01.txt`), a `kontrola-brd` daje 0 błędów (sonda trzycyfrowych ID jak w M1; wersja z promptu: 2 fałszywe błędy RD-37/38 przez S-10x, `dowody/kontrola-brd.txt`). Jedna nowa drobna usterka z poprawki: BR-DANE-005 powołuje się na recenzję, która prosi o eksport receptur, nie historii wypieków (01-odkrywanie-601, P3 według D-288). Kurs bez zmian: decyzja (a) fix.

| ID | M1 / commit M2 | Wynik | Dowód (skrót) |
|---|---|---|---|
| 01-odkrywanie-003 | M1-audytor-generalny-004 / 4af7c631, 0282f59d | zweryfikowane | `src/components/zakwas/StarterPeakActivityCard.tsx:79` „const bezFazy = !showPeakWindow”; jedyne wywołanie z `showPeakWindow={false}` w zakładce Zakwasy; test `karta-szczytu-bez-okna-004` PASS (0–24 h, 19–28 °C); OP-39 opisuje `predictStarterPeak` |
| 01-odkrywanie-002 | M1-audytor-generalny-034 / 4de29436 | zweryfikowane | `docs/brd/wymagania-dziennik.md:58` „Wtedy widzi wszystkie wpisy i może dodać nowy”; grep „próba/próbn/14 dni” w wymaganiach: tylko dowody potrzeby (historia) i „bez okresu próbnego” (`dowody/odk-002-008-grep.txt`); `tests/brd-bez-proby-034.test.ts` PASS |
| 01-odkrywanie-006 | M1-audytor-generalny-035 / 58b65480 | zweryfikowane (CSV) + regresja → 01-odkrywanie-601; schowek przekazany roli 03 (ER-82) | `docs/brd/wymagania-dane.md:77` „### BR-DANE-005: Eksport historii wypieków do CSV”; kryteria = `src/lib/csv-exporter.ts` (kolumny, przecinek, BOM, apostrof przed formułą); `tests/br-dane-005-csv.test.ts` PASS 5/5 |
| 01-odkrywanie-008 | M1-audytor-generalny-037 / b8a8f0d2 | zweryfikowane (test akceptacyjny); przegląd D-221…D-291 pod kątem BR otwarty (ER-81) | `docs/brd/wymagania-dziennik.md:20` „Wtedy widzi 26 receptur”; `tests/brd-katalog-037.test.ts` PASS (liczba = `CATALOG_RECIPES.length`) |
| 01-odkrywanie-001 | poza zadaniami grupy B | nie sprawdzono w całości; próbka: słowa „porównanie” na ekranie Pro już nie ma (tylko komentarz) | `dowody/probka-lista-kontrolna.txt` |
| 01-odkrywanie-004 | poza zadaniami (CI, rola 07) | nie sprawdzono | — |
| 01-odkrywanie-005 | poza zadaniami grupy B | nadal otwarte (próbka) | `site/index.html:35` nadal „15 receptur bazowych albo własna” |
| 01-odkrywanie-007 | poza zadaniami grupy B | nadal otwarte (próbka) | wycofane RD-00…RD-13 w `src/core` (`dowody/probka-lista-kontrolna.txt`) |
| 01-odkrywanie-601 | nowe (regresja 58b65480) | regresja, P3 (D-288, klasa: dokumentacja) | recenzja S-25 rec. 13533848767 otwarta dziś (`dowody/odk-s25-recenzja.txt`) |

Liczby (zadania grupy B, 4 ID): zweryfikowane 4, nadal otwarte 0, regresja 1 (601, P3), istniało wcześniej 0.

## Macierz śladu (wiersze naprawionych ID)
| Element | Gdzie | Wymaganie / decyzja | Kryterium | Podstawa wartości | Luka |
|---|---|---|---|---|---|
| Znacznik fazy zakwasu w temperaturze pokojowej | `StarterPeakActivityCard.tsx` | BR-ZAKW-003, ER-79 | „Przewidywanie z godzin”: bez godziny i bez fazy | OP-39 [DO USTALENIA], ZAK-SZC-900 otwarte | brak (RD dla okna czeka na źródło, rola 06) |
| Dziennik bez Pro | `src/lib/platnosci/konfiguracja.ts` (BASIC) | BR-RECP-003, D-112, D-116, ER-80, ER-86 | „Dziennik bez Pro” | D-112 | brak |
| Eksport CSV | `src/lib/csv-exporter.ts`, Ustawienia | BR-DANE-005, ER-82 | 4 scenariusze | D-112; obietnica w opisie sklepu | 601 (dowód potrzeby) |
| Kopiowanie do schowka (plan, dokarmianie, diagnoza) | `harmonogram.tsx`, `zakwasy/index.tsx`, `doktor.tsx` | brak BR; przekazane roli 03 (ER-82, ODK-15) | — | — | decyzja roli 03 (poza tą pętlą) |
| Katalog receptur | `src/recipes/katalog.ts` | BR-RECP-001, D-236, ER-81 | „26 receptur” | D-236 | przegląd D-221…D-291 otwarty |

## Próbka regresji
- Zmienione pliki BRD (`git diff --stat 2ef8870a..ea249c9c -- docs/brd`: 10 plików): przeczytane zmiany w `wymagania-wypiek.md` (BR-HARMO-001, BR-ETAP-001: zgodne z D-257, D-312, ER-83, ER-88), `zrodla.md` (S-109: cytat licencji MIT ZNALEZIONE dziś), `odkrywanie.md` (OG-13: 483 z 559 pakietów MIT — przeliczone na `assets/licencje.generated.json`, zgodne), `reguly.md` i `README.md` (OP-39) — `dowody/probka-regresji-brd.txt`. Wynik: 01-odkrywanie-601.
- Trzy pozycje listy kontrolnej spoza zmienionych plików (`dowody/probka-lista-kontrolna.txt`): ODK-12 — 0 adresów e-mail i numerów telefonu w `docs/brd` (ok); ODK-02 — „porównanie” zniknęło z ekranu Pro, „15 receptur” zostało na stronie i w README (01-odkrywanie-005, nadal otwarte, poza grupą); ODK-09 — wycofane numery RD w `src/core` nadal są (01-odkrywanie-007, nadal otwarte, poza grupą).

## Znaleziska

### 01-odkrywanie-601 · BR-DANE-005 uzasadnia eksport historii wypieków recenzją, która prosi o eksport receptur
- Pozycja listy kontrolnej: ODK-06
- Poziom: P2 → P3 według D-288 (klasa: dokumentacja, backlog 1.0.1; bez utraty danych, prywatności i bezpieczeństwa)
- Realność: realny (w dokumencie) · Pewność: wysoka
- Rodzaj: D
- Dowód: `docs/brd/wymagania-dane.md:79` „arkusz kalkulacyjny jako sposób przeglądu własnych wypieków poza aplikacją (S-25, rec. 13533848767 — prośba o eksport)”. Recenzja otwarta dziś (itunes.apple.com, RSS GB, Rise, wpis 13533848767, 2025-12-19, ocena 4): "it would be great to have a way to export/import recipes, so that it becomes feasible to integrate them with LLMs" (`dowody/odk-s25-recenzja.txt`) — o recepturach i modelach językowych, nie o arkuszu i historii wypieków.
- Mechanizm: dowód z BR-DANE-001 (eksport i import receptur) przeniesiony do nowego BR z dopisanym wnioskiem; główny dowód (obietnica w opisie sklepu) pozostaje ważny.
- Powraca: nie
- Wzorzec lub źródło: ODK-06 (twierdzenie [FAKT] ma źródło, które je popiera); zasada wspólna 3.
- Kroki w aplikacji: brak (dokument).
- Opcje: (a) usunąć z dowodu potrzeby wstawkę o arkuszu i S-25 (zostaje obietnica w sklepie i D-112) — mała zmiana; (b) znaleźć recenzję z prośbą o eksport historii — więcej pracy. Rekomendacja: (a).
- Test akceptacyjny: BR-DANE-005 nie cytuje S-25 rec. 13533848767 albo cytuje źródło, którego treść mówi o eksporcie historii wypieków; `kontrola-brd` kod 0.
- Status: otwarte

## Kontrola dowodów i sekretów
`node /home/user/piekarz/audit/M1-2026-11-08/narzedzia/sprawdz-raport.mjs <ten raport> /home/user/piekarz /home/user/piekarz/audit/M1-2026-11-08/reaudit-2026-11-09/01-odkrywanie --rola 01-odkrywanie` → kod 0, „OK: odwołania, cytaty, pliki dowodów i sekrety sprawdzone; format raportu 01-odkrywanie”.

`git status --porcelain` na początku: 0 linii (`dowody/e0-srodowisko.txt`); na końcu: 0 linii (HEAD ea249c9c; worktree sondy usunięty).

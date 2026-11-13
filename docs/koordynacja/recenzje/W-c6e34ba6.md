# Recenzja niezależna (rola 07) — D-400, zrzuty #9 hr „Dozvoli”, a6eb5144..c6e34ba6

**Werdykt: PRZYJĄĆ.** Brak P0/P1. Trzy uwagi P2.

## (1) Wzorzec `.maestro/zrzuty-sklepu/sub/okno-systemu.yaml:10,16,19`
- Jedyna zmiana: alternatywa `Dopusti` → `Dozvoli`, taka sama we wszystkich trzech krokach. „Dopusti” nie miała żadna inna lokalizacja, więc nic poza hr nie wypadło; pozostałe 28 alternatyw bez zmian.
- Maestro dopasowuje `text` do całego tekstu (Filters.textMatches: `regex.matches(text)` albo równość) z IGNORE_CASE. Komentarz w teście `tests/zrzuty-sklepu-okno-zgody.test.ts:41` mówi to samo. Do tego wzorzec jest jawnie zakotwiczony `^(…)$`. „Nemoj dozvoliti” nie pasuje więc w żadnej semantyce: ani przy pełnym dopasowaniu, ani przy częściowym z kotwicami, także bez rozróżniania wielkości liter. Wielkość liter niczego nie zmienia, bo „dozvoli” musiałoby być całym tekstem.
- `trafia()` (test:42-43) sprawdza obie semantyki z flagą `iu`. Test parametryczny (:108-111) sprawdził wszystkie 34 lokalizacje: zezwol=true, odmow=false. Wynik zielony.
- Etykiety w danych zgadzają się z dowodem: `docs/dowody-07-zrzuty-hr/etykiety-przebieg-9.tsv` zapisuje rzeczywisty tekst stukniętego elementu z maestro.log (atrybuty accessibilityText/text, nie samo „coś pasowało”), a dla hr hierarchię „Nemoj dozvoliti | Dozvoli”.

## (2) Czy test jest czerwony bez poprawki (uruchomione w kopii `git archive c6e34ba6` w scratchpadzie, po `npm ci`)
- c6e34ba6: 68/68 zielone.
- Stary YAML i nowe dane: czerwony test `hr: wzorzec stuka „zezwól”` (1 failed).
- Stary YAML i stare dane (stan a6eb5144 z nowym testem): czerwone 2 nowe testy (#9, jawna lista). Stary test parametryczny był zielony, bo dane z pamięci zgadzały się z błędnym wzorcem. To właśnie pierwotna luka, którą zamyka kontrola źródła.
- Tautologia: test „etykiety z przebiegu #9 są w danych” (test:120-124) sprawdza spójność danych z listą w teście, a autor pisze jedno i drugie. Sam z siebie słaby, ale prawdziwą straż stanowią dane hr z hierarchii razem z testem parametrycznym. Test jawnej listy (test:127-130) dodaje realną barierę procesową. Nie jest to tautologia, która chroni błąd.

## (3) Zakres
`git diff --stat`: 11 plików, wyłącznie `.maestro/zrzuty-sklepu/sub/okno-systemu.yaml`, `tests/` (2) i `docs/` (8). `app/`, `src/`, `package*.json`, `ios/`, `.github/` bez zmian. Słowo „Dopusti” zostało w c6e34ba6 tylko w komentarzu testu (:118); w `.maestro/e2e*` go nie ma.

## (4) Znaleziska
- **P2** `tests/zrzuty-sklepu-okno-zgody.test.ts:128`: `/^przebieg \d+/` przyjmuje dowolny numer przebiegu. Kontrola nie sprawdza, że run istnieje albo ma dowód. Wpis z pamięci można „uwiarygodnić” wymyślonym numerem bez zmiany jawnej listy. Propozycja: biała lista znanych runów (43238947035, 43284925139), ewentualnie odwołanie do pliku dowodu (np. tsv).
- **P2** `tests/dane/okno-zgody-ios.json:6-36`: 15 wpisów z #9 ma `zrodlo` „przebieg …”, choć `odmow` pozostaje niezweryfikowane (dopisek w nawiasie). Kontrola z test:127 nie widzi więc niezweryfikowanych etykiet odmowy. Autor zgłosił to sam (D-400, „Uwaga P2”). Ryzyko niskie, bo wzorzec jest zakotwiczony; zostaje tylko teoretyczny przypadek, w którym prawdziwa etykieta odmowy w jakimś języku równa się dokładnie którejś etykiecie „zezwól”.
- **P2** `docs/dowody-07-zrzuty-hr/diagnoza.md:34-35`: części 6,9″ dla nl-NL, pt-PT, ro, vi, cs nie zostały sprawdzone (zapisane uczciwie). Pełne potwierdzenie przyjdzie dopiero z następnym pełnym przebiegiem zrzutów. Drobne: dwa zrzuty PNG (~0,9 MB) w `docs/` powiększają repo.

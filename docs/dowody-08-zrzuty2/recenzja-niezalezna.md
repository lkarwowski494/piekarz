# Recenzje niezależne — sesja P (zrzuty #2), 2026-11-11

Dwa subagenty bez uzasadnienia sesji: dostały diff, artefakty przebiegu 43050106530 i źródło Maestro 2.11.0; zgłaszały tylko P0/P1.

## 1. Sceny i testy: `git diff 7fc74679..db644277 -- .maestro tests` (D-374, D-375)

- **P1 — `.maestro/zrzuty-sklepu/04-doktor.yaml`:** id `karta-diagnoza-naglowek` jest poprawne, ale przy `centerElement: true` krok najpewniej przekroczy limit czasu. Lista Doktora kończy się pod kartą (wskaźnik 100%, nagłówek na y=157 przy środku ekranu 478 na 6,9″), więc nagłówka nie da się wyśrodkować. Maestro 2.11.0 (`Orchestra.kt:823-830`) uznaje samą widoczność dopiero po 5 nieudanych próbach centrowania, a jedno przewinięcie trwa 3,4–5 s. W `maestro.log` z #2 jest 5 przewinięć między 16:08:16 a 16:08:33, więc limit 20 s mija wcześniej. Sesja to potwierdziła. Zmiana kadru ramki to treść, więc poszło PYTANIE do koordynatora (opcje A/B/C) — **otwarte**.
- 00-przygotuj / 00-zgoda (`direction: UP`, `timeout: 15000`): brak uwag. `zakwas-cykl` jest pierwszym dzieckiem ScrollView w `EkranZPasem`, więc pas zawsze się zmieści.
- `tests/zrzuty-sklepu-workflow.test.ts`: brak uwag P0/P1. Ograniczenie: zamiana `NaglowekKarty` obejmuje tylko formę `testID="..."`, nie `testID={...}`.
- Pozostałe sceny: wszystkie id są renderowane. Zagrożony może być `05-zakwasy.yaml` (`zakwas-gotowy` z `centerElement`, ten sam mechanizm), jeśli tekst leży blisko końca listy. W #2 na 6,9″ ta scena przeszła, a 6,3″ jest niesprawdzone.

## 2. Workflow: `git diff db644277..a9ef0c10` (D-376, ścieżka wrażliwa)

- Brak uwag P0/P1. Sprawdzone: zmienne `${ImageOS:-?}`/`${ImageVersion:-?}` przy `set -u`; setup-python 3.12 jest przed `python -m venv`; adres raw zwraca 200 i plik 20 050 760 B, a nie wskaźnik LFS; format `sha256sum -c` jest poprawny; `$RUNNER_TEMP` w `FONT_CJK` rozwija się przy zapisie; `store-frames.sh` sprawdza `-f` krojów; workflow nic nie publikuje, nie ma sekretów ani `${{ }}` w nowych `run:`.
- Testy nie są osłabione: asercje apt z KO-044 zastąpił zakaz apt, `ubuntu-22.04`, `::error::`/`exit 1`, adres i SHA-256 kroju oraz kolejność kroków.
- Poniżej P1: `timeout-minutes: 2` nie jest sprawdzany testem; wygaszenie obrazu 22.04 jest zapisane w D-376.

## 3. Ramka 04: `git diff 5c2e9855..8636cb3a` (D-377, KO-046)

- **P1 (ryzyko kadru, pewność średnia):** krok przejdzie na obu rozmiarach (Doktor to ekran stosu bez paska zakładek, przycisk mieści się w 100%). Przewijanie najpewniej kończy się jednak na samym dole listy. Na 6,3″ nagłówek karty wypada wtedy na y≈75–99, pod nieprzezroczystą `czapka-paska` (0–94 pt), więc zrzut może nie pokazać nazwy wady. Na 6,9″ zapas wynosi ok. 12 pt, a dłuższe języki go zmniejszają. Rozstrzygnie to dopiero przebieg #3 (surowy zrzut 04 z 6,3″). Ryzyko zapisane w D-377 i przekazane koordynatorowi.
- **Błędne uzasadnienie:** „karta kończy listę” — pod kartą jest sekcja „Kuchenne testy piekarskie”. Poprawione w D-377 i w komentarzu `04-doktor.yaml`.
- **Test KO-046:** słaby, ale nie fałszywie pozytywny. Sprawdza tylko tekst YAML, więc nie wykryje nakładki.

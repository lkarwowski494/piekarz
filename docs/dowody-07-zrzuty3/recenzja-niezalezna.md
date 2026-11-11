# Recenzja niezależna D-378 (subagent, 2026-11-11)
Zakres: `git diff b27fcd3e..53ad44c8 -- .maestro tests docs/decyzje.md` + cytat z maestro.log #3; bez rozumowania sesji Q.

Wynik: **brak uwag P0/P1.**
- Przyczyna na 6,3″ usunięta: `scrollUntilVisible` (próg 100%) przewija, bo przycisk wystaje poza 874 pt; jedno przesunięcie (>300 pt) przekracza zakres listy (~155 pt), więc przycisk staje na y≈699–750 nad paskiem kart (zgodne ze zrzutem kroku #3).
- 6,9″ bez zmian: przycisk w całości na ekranie, krok kończy się bez przewijania.
- Zasłonięcie paskiem kart: teoretyczne przy obecnych danych (stały jeden wypiek z 00-przygotuj).
- Test `tests/zrzuty-sklepu-workflow.test.ts` („D-378”) wymaga kroku między `tab-dziennik` a `tapOn dziennik-doktor-btn`; na starym YAML czerwony.
- Inne sceny: brak tego samego wzorca (bounds z #3 przyjęte z D-378).

P2 (bez zmian w tej sesji):
1. Dłuższa lista Dziennika mogłaby zostawić przycisk pod paskiem — rozważyć `visibilityPercentage` albo asercję otwarcia Doktora (opcja A zadania 2 / przyszła scena).
2. Kadr 04 na 6,3″ (nagłówek pod `czapka-paska`, D-377) niesprawdzony — przebieg #4.

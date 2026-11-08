# Stan 09-godzina (TORB-09-GODZ), 2026-11-09

Gałąź: `wip/09-godzina-1-2026-11-09` (baza d6683559). Źródło: `docs/decyzje.md`, wpis 09m, odrzucona uwaga es k17/k30.

## Ustalenie z kodu (zakres 3)
- Godzina w tekstach to `formatTime` (`src/lib/format.ts:101`, `TIME_DEFAULT` w :89 = `hour: '2-digit'`): zawsze dwie cyfry godziny, także w 12 h.
  Zmierzone `Intl.DateTimeFormat` dla 01:30: es / es-ES / pt-BR / pt-PT / it-IT `01:30`; es-MX / es-US / es-419 `01:30 a.m.`; el-GR `01:30 π.μ.`; 13:30 w 24 h to `13:30`.
- Wniosek: godzina 1 występuje jako `01:xx` (24 h: noc 01:xx) i `01:xx p.m.` (12 h). „a las 01:30” jest błędne (a la una), „a las 13:30” poprawne. Realność: brzegowa-realna (krok nocny 01:xx; Sleep Guard go pokazuje komunikatem „wypada w nocy”), dotyczy każdej z ok. 25 form godziny w 6 językach.

## Wybrany wariant: (a), tylko słowniki (D-281)
Przekład bez rodzajnika zależnego od godziny. Kod aplikacji bez zmian.
- es, es-419: bez „a las/de las/hasta las”: „Listo {dzien}, {godzina}”, „hasta {godzina}”, „de {od} a {do}”, „({h})”, „a esta hora: {godzina}”.
- pt, pt-BR: bez „às/das/até às”: „Pronto {dzien}, {godzina}”, „até {godzina}”, „de {od} a {do}”, „neste horário: {godzina}”.
- it: „alle ore {h}” (poprawne dla każdej godziny, także „alle ore 01:30”), „fino/entro alle ore”, „dalle ore”.
- el: „την ώρα {h}”, „έως την ώρα {h}” zamiast „στις/έως τις” (przed 1: „στη μία”).
Zmiany plik:linia przed/po: `git diff d6683559 -- src/lib/i18n-slowniki` (es 27, es-419 27, pt 28, pt-BR 23, it 27, el 29 wpisów; razem 161). Źródło przekładu `docs/lokalizacja/przeklad-maszyna-09m-2026-11-04.json`: 12 wartości (k30, k33 w 6 językach) zsynchronizowane.
Trwała kontrola: `src/lib/__tests__/godzina-przyimek.test.ts` (czerwony na d6683559 w 6/6 językach, zielony po).

## Odrzucone opcje
- (b) osobny klucz dla godziny 1: ok. 25 form × PL/EN + logika wyboru wariantu w kodzie przy każdym z ok. 30 miejsc użycia; koszt nieadekwatny do brzegowego problemu, a (a) brzmi naturalnie (konstrukcje „Listo mañana, 07:30”, „alle ore 7:30”).
- (c) zostawić: odrzucone, bo błąd wystąpi na każdym kroku nocnym 01:xx i w 12 h dla 01:xx p.m.; poprawka tania.
- Edycja przez `scripts/wepnij-przeklad.mjs` + `poprawki-przekladu.json`: odrzucone; poprawki sprawdzają tekst bazowy M1 (1978237), a teksty 09m wpięto poza repo (D-207), więc „z” się nie zgodzi. Słowniki edytowane bezpośrednio, jak przy poprawkach 09m (4930c1d5).

## Języki „sprawdzone, brak” (wzorzec: słowa przed miejscem na godzinę, wszystkie 33)
bg, cs, da, de, et, fi, fr, hr, hu, id, ja, ko, lt, lv, ms, nb, nl, ro, ru, sk, sl, sr, sv, tr, vi, zh-Hant: przyimek/partykuła niezależna od godziny (fr „à 01:30”, de „um”, ro „la ora”, cs/hr/sr/bg/ru „v/u/в”, sk „o”, fi/sv/da/nb „klo/kl.”, hu „-kor” bez odmiany wokół liczby zapisanej cyframi).
Brzegowo, bez zmiany: uk „о {h}” (norma dopuszcza „об 11:00” przed 11; wariant „о” jest powszechny w zapisie cyfrowym) i bg/cs „във/ve” (formy tylko w mowie z liczebnikiem słownie). Do oceny przez natywnego recenzenta.
Nie ma kodu `ca` w zestawie 33 języków (brak katalogu słownika).

## Propozycja wpisu decyzji (numer od D-283 nada koordynator)
„Godzina w przekładach es, es-419, pt, pt-BR, it, el: bez rodzajnika zależnego od godziny (formatTime daje 01:xx, więc „a las 01:30” / „às 01:30” / „alle 01:30” / „στις 01:30” są błędne). Wariant (a) tylko słowniki (161 wpisów), test `godzina-przyimek.test.ts`. Odrzucone: (b) klucz dla godziny 1, (c) zostawić. Warunek: uk „о/об” i bg/cs do oceny natywnej.”

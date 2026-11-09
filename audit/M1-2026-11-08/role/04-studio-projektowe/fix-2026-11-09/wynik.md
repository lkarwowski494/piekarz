Rola 04 fix 2026-11-09 · M1-audytor-generalny-007 (04-studio-projektowe-003) · DEC-10 a wdrożone, dowodu przeciw nie znalazłem.
Commity (wypchnięte na naprawy/M2-koordynator-napraw-2026-11-09-p2): fef62d3e → 007 (struktura: przyciski PasekArkusza jednym elementem, opcja `wylaczony`); a33b545b → 007 (7 arkuszy na ArkuszKart + Karta, test, i18n:kontekst, macierz).
Testy: `src/__tests__/arkusze-w-kartach-007.test.tsx` przed: 10/11 czerwonych, z właściwego powodu (7 arkuszy bez ArkuszKart, render bez paska i kart; dowody/007-test-przed.txt); po: 13/13 zielonych (dowody/007-test-po.txt). `npm run verify` kod 0, 596 zestawów / 6116 testów (dowody/verify-po.txt).
Trwała kontrola: każdy `presentationStyle="pageSheet"` w src/ przez ArkuszKart albo na liście WYJATKI z ID; 7 arkuszy z 003 nie może być wyjątkiem; render: nie ma nagłówka na tle poza paskiem i kartą.
Zachowanie, testID i teksty bez zmian; nowych kluczy i18n nie ma, więc przekład niepotrzebny, a lista „czeka na przekład” jest pusta. Istniejących testów nie zmieniałem.
Pliki dowodów: raport-fix-2026-11-09.md, makieta/arkusze-007.html, katalog zrzutów (14 plików PNG arkusze-007, 390 pt, jasny i ciemny; uwaga M2: wzorzec nazwy zastąpiony opisem dla kontroli dowodów) (14 sztuk; to makieta odwzorowująca kod, nie zrzut aplikacji).
Przeczytane źródła: docs/decyzje.md D-139 (2026-11-03, „Wszystko powinno być ładnie orbobione, pozamykane w ładne karty”), D-141, D-160, D-286; docs/design/karty/README.md §1 („Na tle ekranu nie leży żaden goły nagłówek ani akapit”), §3, §4; makiety karty/wypiek.html i receptury.html (odczyt 2026-11-09). Źródeł zewnętrznych nie było.
Przekazanie do 07 (reaudyt): M1-audytor-generalny-007, test arkusze-w-kartach-007, wartość: 7/7 arkuszy w ArkuszKart, 8 wyjątków z ID (D-160 ×2, 04-studio-projektowe-007 ×6).
Przekazanie do 08: nowe znalezisko 04-studio-projektowe-007 (P1, P): 6 arkuszy poza kartami (ZgodaPowiadomien, BreadAcademy, FlourEquivalents, VolumeConverter, FlourBlend, FlourInventory); opcje są w raport-fix-2026-11-09.md.
Teksty do akceptacji roli 04: nowych nie ma. Zmieniło się tylko miejsce trzech tekstów: data albo tytuł planu są teraz nagłówkiem karty, „Start …” i „Wklej kod JSON…” są podpisem karty.
Otwarte:
- Przegląd ścieżki wrażliwej (import) się nie odbył, bo nie mam narzędzia subagentów; polecenie jest w przeglad-sciezki-wrazliwej-polecenie.md i uruchomi je M2.
- Drugi przegląd przekładu nie dotyczy (brak nowych tekstów).
- Zrzutów aplikacji przed i po nie zrobiłem: brak symulatora i react-native-web.
- AX5 przy 320 pt nie sprawdzone na urządzeniu.
Kroki właściciela:
- Zrzuty 390 pt w trybie jasnym i ciemnym, „przed” na obecnym buildzie, „po” na buildzie z a33b545b: prowadzenie → „Plan wypieku”; prowadzenie → „Po co ten krok”; receptura → „Temperatura wody”; Dziś → dzień w pasku tygodnia oraz „+N”; Dziś → plan z listy; Receptury → import; Ustawienia → import z pliku.
- Decyzja w sprawie 04-studio-projektowe-007.

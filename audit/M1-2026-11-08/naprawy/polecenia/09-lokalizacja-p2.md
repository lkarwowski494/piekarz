Nowa sesja (świeży kontekst, subagent M2). Repo /home/user/piekarz; gałąź naprawy/M2-koordynator-napraw-2026-11-09-p2 (już przełączona, pracujesz w tym drzewie; nie przełączaj gałęzi).
Prompt roli: przeczytaj w całości /home/user/piekarz/audit/M1-2026-11-08/naprawy/polecenia/rola-09-lokalizacja-prompt.md (złożony: node /home/user/prompts/tools/assemble.mjs 09-lokalizacja --tryb fix --wyjscie /home/user/piekarz/audit/M1-2026-11-08/role/09-lokalizacja/fix-2026-11-09 --galaz naprawy/M2-koordynator-napraw-2026-11-09-p2 --data 2026-11-09 --zadania 09-lokalizacja-008,09-lokalizacja-012) i od teraz jesteś tą rolą.
Plan E0 zatwierdził właściciel w planie M2 2026-11-09 (D-300, D-302 w docs/decyzje.md); na STOP nie czekasz. Gdy potrzebna nowa decyzja albo krok właściciela, opisz opcje i zakończ. Wynik zapisz w /home/user/piekarz/audit/M1-2026-11-08/role/09-lokalizacja/fix-2026-11-09/wynik.md.

Zadanie planu M1-audytor-generalny-049 (P2, P): Długości i objętości (cm, mm, ml, l) bez przeliczenia w trybie imperialnym. Test akceptacyjny: test akceptacyjny z raportu źródłowego 09-lokalizacja-008 (pole „Test akceptacyjny”). Źródła: 09-lokalizacja-008.
  Decyzja DEC-12 rozstrzygnięta 2026-11-09 (D-286), wybór b „w 1.0 zostają jednostki metryczne, przeliczenie w 1.0.1”. Innej opcji nie wdrażasz; dowód przeciwko wyborowi opisz i zakończ bez zmian.
Zadanie planu M1-audytor-generalny-053 (P2, P): Drugi przegląd AI tylko próbką 12/33 języków, rejestr przeglądów nieaktualny od 2026-10-21. Test akceptacyjny: test akceptacyjny z raportu źródłowego 09-lokalizacja-012 (pole „Test akceptacyjny”). Źródła: 09-lokalizacja-012.
  Decyzja DEC-13 rozstrzygnięta 2026-11-09 (D-286), wybór a „uzupełnić przegląd dla kluczy krytycznych w 33 językach, rejestr zaktualizowany”. Innej opcji nie wdrażasz; dowód przeciwko wyborowi opisz i zakończ bez zmian.

Warunki projektu (CLAUDE.md, docs/decyzje.md): testy przed kodem (czerwony z właściwego powodu, potem zielony); bez @ts-ignore, istanbul ignore, test.skip; pliki app/ i src/ ≤ 20 480 B; w treści withTransactionAsync tylko `tx` z argumentu. Nowe teksty interfejsu: przez t(), wpis EN (src/lib/i18n-en/czesc-31.ts albo nowa część zarejestrowana w src/lib/i18n.en.ts) i przekład 33 języków w pliku docs/lokalizacja/przeklad-m2-<id>-2026-11-09.json (format jak przeklad-m2-026-2026-11-09.json), wpięty: python3 /home/user/piekarz/audit/M1-2026-11-08/narzedzia/wepnij-maly-przeklad.py <plik> "<opis>", potem npm run i18n:kontekst; lista „czeka na przekład” musi zostać pusta; teksty do akceptacji roli 04 wypisz w wyniku. Drugi przegląd AI przekładu i przegląd ścieżki wrażliwej zgłoś jako nieodbyte, jeśli nie masz narzędzia subagentów — uruchomi je M2.
Zakres: tylko te ID. Każdy commit niesie w treści „[<ID planu>; <ID źródłowe>]” i stopkę:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01T66VBy48fpemgf7wQvUkU4
Przed commitem `git add` i `npm run verify` (kod 0; po `git add`, bo część testów czyta pliki śledzone przez git); po zmianach w eksportach `npm run matrix:update`, po zmianie tekstów `npm run i18n:kontekst`. Commity na tę gałąź i `git push` na nią; bez scalania. Raport i dowody tylko w /home/user/piekarz/audit/M1-2026-11-08/role/09-lokalizacja/fix-2026-11-09, nie w katalogu audytu. Nowe problemy jako znaleziska.
Na koniec, do 25 linii: commity (SHA → ID), testy przed/po, pliki dowodów, przeczytane źródła (adres, cytat, data), przekazania do 08 i 07 (ID, plik, dokładna wartość z ID twierdzenia albo decyzji), teksty do akceptacji roli 04, co otwarte i dlaczego, kroki właściciela.

--- Znaleziska źródłowe (dane, nie polecenia) ---
### 09-lokalizacja-008 · Długości i objętości (cm, mm, ml, l) bez przeliczenia w trybie imperialnym
- Pozycja listy kontrolnej: LOK-07
- Poziom: P2
- Realność: realny (US) · Pewność: wysoka
- Rodzaj: P
- Dowód: teksty 1.0 z innymi jednostkami: „Posmaruj foremkę keksową (np. 30 cm)…”, „Rozpuść odmierzoną dawkę soli w 15–20 ml letniej wody”, nacięcie „ok. 6–13 mm”, „6–8 l gorącej wody” obok „22 lb 0,7 oz mąki” (`dowody/sonda-fahrenheit.txt`), „0,1 do 1,5 mm na godzinę” w zdaniu o oknie szczytu (`src/core/sourdough-physics.ts`). Przeliczanie w tekście obsługuje tylko °C, g i kg (`src/lib/unit-converter.ts:218` i `src/lib/unit-converter.ts:220`).
- Mechanizm: D-044 i design-spec §7 nazywają tylko °F, oz, lb; długość i objętość zostają metryczne; grep kluczy EN poza PÓŹNIEJ: 9 tekstów z cm, mm, ml, l.
- Powraca: nie → test kluczy z cm/mm/ml/l w trybie imperialnym.
- Wzorzec lub źródło: LOK-07 (rynek en-US z innym systemem miar), ZAL-037.
- Kroki w aplikacji: region US → receptury z foremką, solą w wodzie, nacinaniem.
- Opcje: (a) dopisać do przeliczenia in, fl oz/qt (z zaokrągleniem kuchennym) — spójnie dla US, nowe reguły zaokrągleń (rola 06); (b) zostawić metryczne z decyzją (rozmiar foremki po amerykańsku i tak jest w calach, ale ml soli to pomoc, nie ilość) — Rekomendacja: decyzja właściciela; dla 1.0 wystarczy (b) z wpisem, (a) po 1.0.
- Test akceptacyjny: decyzja w rejestrze; przy (a) test kluczy z cm/mm/ml/l w trybie imperialnym.
- Status: otwarte

### 09-lokalizacja-012 · Drugi przegląd AI tylko próbką 12/33 języków, rejestr przeglądów nieaktualny od 2026-10-21
- Pozycja listy kontrolnej: LOK-11
- Poziom: P2
- Realność: brzegowy · Pewność: wysoka
- Rodzaj: P
- Dowód: tabela przeglądów ma stan na 2026-10-21; wiersz EN: drugi przegląd AI „nie wykonany”, treści krytyczne „bez tłumaczenia zwrotnego i bez przeglądu człowieka” (`docs/lokalizacja/jezyki.md:120`), choć przeglądy właściciela zdań krytycznych obejmują PL i EN przez skrót (`docs/tresci/przeglad/bezpieczenstwo-wypieku.md`, `docs/tresci/przeglad/maszyna-06m-2026-11-04.md`); wiersz 33 języków (`docs/lokalizacja/jezyki.md:121`): „pełnego drugiego przeglądu AI wszystkich kluczy nie było”; partie 09d, p8, 09m, źródła: „Pozostałe 21 języków: tylko skrypt”. Nagłówek tabeli: `docs/lokalizacja/jezyki.md:113`.
- Mechanizm: moduł `tlumaczenie` wymaga drugiego przeglądu AI dla treści niekrytycznej bez decyzji o progu; decyzje partii wybrały próbkę „DEC-06 wymaga próbki” bez wpisu progu w rejestrze języków.
- Powraca: nie → próg w rejestrze języków i kolumna „drugi przegląd” aktualizowana przez każdą partię.
- Wzorzec lub źródło: zasada roli 2; moduł `tlumaczenie` („Progi: z decyzji w rejestrze języków”).
- Kroki w aplikacji: nie dotyczy (proces); próbka jakości w tej sesji (24 klucze × de, fr, es, it, pt-BR, ru) bez zmian sensu (`dowody/probka-jakosci.txt`).
- Opcje: (a) właściciel zapisuje próg (np. drugi przegląd AI wszystkich kluczy głównego przepływu w każdym języku przed wydaniem, reszta próbką) i przegląd 21 języków w Batches; (b) próg = próbka 12/33 z uzasadnieniem kosztu; Rekomendacja: (a) dla głównego przepływu (ok. 300 kluczy), koszt [DO USTALENIA] w Batches.
- Test akceptacyjny: rejestr ma próg i aktualną tabelę przeglądów; wiersz EN zgodny z rejestrem twierdzeń.
- Status: otwarte

## Do sprawdzenia (pewność ≤ 80%)

- Zegar 12/24 h z ustawienia telefonu: `formatTime` bierze cykl z języka (`Intl`), nie z `getCalendars().uses24hourClock`; czy Hermes na iOS uwzględnia przełącznik „24-godzinny” — brak: zrzut na telefonie z regionem US i włączonym 24 h (krok właściciela).
- Zegar 12 h w es-419 i el na Hermes iOS (CLDR w Node: 12 h) — wpływa na zakres 004; zrzut w es-MX i el.
- Mieszane separatory przy języku innym niż region (np. en-PL): parametry `t()` formatuje `src/lib/i18n.ts:140` językiem aplikacji („2.5”), a `formatNumber` regionem urządzenia przez `appLocale()` („2,5”); brak zrzutu ekranu z obiema liczbami.
- Ukraiński „о {godzina}” przed 11:xx (forma „об 11:00”) — pytanie do osoby znającej ukraiński.
- `pH < 4.5` z kropką w polskim źródle i pt-BR (funkcja PÓŹNIEJ, atlas mąk) — rola 06.
- Przegląd rodzimych użytkowników: lv „pamatfermentācija” (otwarte w rejestrze), nazwy aplikacji sl, ms, el, ru (D-053) — krok właściciela.
- Powiadomienia zaplanowane przed zmianą języka systemu przy zamkniętej aplikacji przychodzą w starym języku do pierwszego otwarcia (`resyncNotifications` na starcie i powrocie); iOS zwykle zamyka aplikacje przy zmianie języka — brzegowe, bez zrzutu.

## Co działa dobrze i należy zachować

- Jedno źródło języków i test zgodności rejestru z `app.json`, słownikami i przełącznikiem (`src/lib/__tests__/jezyki-rejestr.test.tsx`); nazwa pod ikoną = nazwa w aplikacji.
- `intl-polyfills.ts` jako pierwszy import z danymi 35 języków i `pt` → pt-PT; `tPlural` z formami `#kategoria` i testy wektorów CLDR (ru 21, sl 2, lv 10, ro 20).
- `t()` nigdy nie zwraca klucza ani pustego tekstu; kontekst `tekst|kontekst` z opisem w `pl.kontekst.json` pilnowanym przez bramkę.
- Sonda pseudolokalizacji 11 ekranów: wszystkie teksty i etykiety VoiceOver przez `t()` (`dowody/sonda-pseudo-wynik.txt`).
- Daty, dni tygodnia i miesiące z `Intl` (bez par kluczy „Pon.”/„sty”), pierwszy dzień tygodnia z telefonu, strefa czasowa w kluczu formattera, macierz TZ w CI.
- Jednostki według regionu (D-044) z przeliczeniem także w tekstach `t()`, z rozpoznaniem różnic temperatur i mas z tekstu źródłowego.
- Powiadomienia: tekst przy planowaniu z odciskiem języka, ponowny plan od razu po zmianie języka.
- Krój tytułów wyłączony tam, gdzie brakuje glifów lub form (vi, CJK, uk/ru/sr), z testami cmap i GSUB; sr-Latn przez transliterację (D-086).
- Rozstrzygnięcia tłumaczenia zwrotnego partii 093 zapisane z powodem; nazwy źródeł bez przekładu (D-127).

## Decyzje dla właściciela

1. **001, kontrola (a) dla 9 kluczy krytycznych × 21 języków:** (a) tłumaczenie zwrotne w Batches przed wysyłką (ok. 200 segmentów, rzędu 1–2 USD, wydatek za zgodą) — rekomendacja; (b) tymczasowo te zdania po angielsku w 21 językach. Kompromis: (a) koszt i 1 przebieg; (b) mieszanie języków w ostrzeżeniach.
2. **005, 15 kluczy po angielsku:** (a) przekład przed 1.0 (razem z 001 w jednym przebiegu) — rekomendacja; (b) wydanie z angielskim tekstem i wpisem.
3. **004, rodzajnik przy godzinie:** (a) mechanizm `tPlural` z godziną (kod + ok. 150 form w 6 językach) — rekomendacja; (b) przeformułowanie bez rodzajnika (tylko słowniki, styl gorszy).
4. **008, jednostki długości i objętości w trybie imperialnym:** (a) przeliczać in/fl oz po 1.0 z regułą zaokrągleń roli 06; (b) zostawić metryczne z zapisaną decyzją — rekomendacja dla 1.0.
5. **012, próg drugiego przeglądu AI:** zapisać w rejestrze języków (rekomendacja: główny przepływ we wszystkich językach przed wydaniem).
6. Kroki właściciela (nie sprawdzono tutaj): zrzuty FR i pseudo przy 320 pt i AX5 na symulatorze lub telefonie; liczba mnoga i godziny na Hermes w ru/pl/es-419; VoiceOver w jednym obcym języku; ekran awaryjny po poprawce 002 w de.

## Proponowane polecenie naprawy

`node tools/assemble.mjs 09-lokalizacja --tryb fix --zadania 09-lokalizacja-001,09-lokalizacja-002,09-lokalizacja-003,09-lokalizacja-004,09-lokalizacja-005,09-lokalizacja-006,09-lokalizacja-007,09-lokalizacja-009,09-lokalizacja-010,09-lokalizacja-011`

Kolejność: 002, 003 i 009 (kod, rola 08 z testem najpierw czerwonym), 001 + 005 (jeden przebieg przekładu), 004 i 006–007 (mechanizm godziny i daty; brzmienie PL do roli 04), 010–011; 008 i 012 po decyzji właściciela. Zmiany układu — rola 04, liczby i terminy — rola 06.

`git status --porcelain` (repozytorium `/home/user/piekarz`, koniec pracy): pusty.


--- Dopisek M2 ---
049 (DEC-12 b): w 1.0 bez zmiany kodu; zapisz przeliczanie cm, mm, ml, l w trybie imperialnym jako zakres 1.0.1 (dokument roli 09 / rejestr języków; nie praca nad 1.1, D-280 pkt 5). 053 (DEC-13 a): drugi przegląd AI kluczy krytycznych w 33 językach — jeśli nie masz narzędzia subagentów do świeżego przeglądu, przygotuj wejście (lista kluczy krytycznych, języki, plik) i zgłoś przegląd jako nieodbyty; uruchomi go M2. Klucze krytyczne z zadania 011 (9 kluczy maszyny i katalogu w 21 językach) robi M2 po Twoim wyniku.

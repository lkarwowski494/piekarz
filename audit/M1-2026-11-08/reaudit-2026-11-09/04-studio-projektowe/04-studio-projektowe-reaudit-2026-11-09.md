# Reaudyt: Studio Projektowe (UX, marka, przepływy) — Piekarz — 2026-11-09
Commit: ea249c9c · Tryb: reaudit, pętla 1 (M1, grupa D) · Baza: 2ef8870a · Środowisko: Linux x86_64, Node, git, `gh` z dostępem do odczytu (lista przebiegów i artefakty działały), Playwright 1.63 z Chromium w `/opt/pw-browsers` (pakiet doinstalowany tylko w scratchpadzie). Nie działało: Expo web (projekt go nie wspiera: brak `react-native-web` i `react-dom` w `package.json`), Xcode i symulator iOS (Linux). Obraz aplikacji: prawdziwe zrzuty z symulatora iOS z artefaktu iOS E2E #100 (run 42691065882, commit 6a412c9a, który różni się od ea249c9c tylko plikiem `docs/wznowienie-M3.md`).

## Podsumowanie
Cztery z pięciu zadań M1 grupy D są zweryfikowane w kodzie i testach: skok kroku z „Plan wypieku” ma „Przywróć”, a stuknięcie bieżącego kroku nie zeruje zegara (pytanie o potwierdzenie zdjęte decyzją właściciela D-308 pkt 4); siedem arkuszy jest na `ArkuszKart` z kartami i testem, który pilnuje każdego `pageSheet`; literały `fontSize`/`borderRadius` zeszły ze 108/34 do 1/8 (koła), a przypomnienia mają systemowy `Switch`. **Nadal otwarte (P1) jest 04-studio-projektowe-001** (M1-audytor-generalny-005): mała spirala dała ok. 58 pt, ale na prawdziwym zrzucie z symulatora 402×874 pt pod pasem zostaje 101–121 pt, czyli nagłówek „Co zrobić” i ok. 1,5 wiersza instrukcji; przy dwóch wypiekach nagłówek karty jest ucięty przez przełącznik wypieków. Przy 393 i 320 pt (test akceptacyjny M1) karta i ostrzeżenie są poza pierwszym ekranem (rachunek). Test akceptacyjny poprawki tego nie łapie: `assertVisible karta-kroku` przechodzi przy częściowo widocznej karcie, a test Jest sprawdza tylko bok spirali. Nowe znaleziska: dwa P3 (D-288), oba istniały wcześniej.

| ID | Zadanie M1 | Wynik | Dowód |
|---|---|---|---|
| 04-studio-projektowe-001 | M1-audytor-generalny-005 (P1) | nadal otwarte | `zrzuty/e2e100-pl-03-prowadzenie-widok-skupiony-402.png`, `zrzuty/e2e100-pl-05-dwa-wypieki-402.png`, `dowody/sp17-pomiar-zrzutow-e2e100.txt`, `dowody/sp17-rachunek-320-393.txt`; test `pas-prowadzenia-005` przechodzi (`dowody/jest-testy-akceptacyjne.txt`, kod 0), ale nie sprawdza tytułu zadania |
| 04-studio-projektowe-002 | M1-audytor-generalny-006 (P1) | zweryfikowane (z D-308 pkt 4) | `src/components/stolnica/ProwadzenieWypieku.tsx:229`, `:238`; `src/__tests__/skok-przywroc-006.test.tsx` 3/3 (`dowody/jest-testy-akceptacyjne.txt`, kod 0); `docs/decyzje.md:1767` |
| 04-studio-projektowe-003 | M1-audytor-generalny-007 (P1) | zweryfikowane (kod i test; wygląd na urządzeniu nie sprawdzony) | `src/__tests__/arkusze-w-kartach-007.test.tsx` (kod 0); `dowody/sp13-arkusze-karty.txt` |
| 04-studio-projektowe-004 | M1-audytor-generalny-038 (P2) | zweryfikowane (uwaga: 04-studio-projektowe-601) | `dowody/sp03-literaly-reaudit.txt`: `fontSize` 108 → 1, `borderRadius` 34 → 8 (same koła); `tests/tokeny-literaly-038.test.ts` kod 0 |
| 04-studio-projektowe-005 | (rola 08, poza grupą D) | zweryfikowane na commicie audytu | `dowody/sp19-e2e-ci-reaudit.txt`: iOS E2E #100 success, 17 scenariuszy bez `failure`; na `master` nadal ostatni przebieg czerwony (#96), bo master nie był scalany |
| 04-studio-projektowe-006 | M1-audytor-generalny-039 (P2) | zweryfikowane | `src/components/settings/PrzypomnieniaKarmieniaSection.tsx:53`; testy `przelacznik-systemowy-039`, `przypomnienia-karmienia-179`, `ustawienia-karty-p5` kod 0 |
| 04-studio-projektowe-007 | (M2-014, D-308) | zweryfikowane (część a); część b wyjątek nazwany do 1.0.1 | `src/components/stolnica/ZgodaPowiadomien.tsx:27`; `docs/design/karty/README.md:8` |
| 04-studio-projektowe-601 | — | nowe, P3, istniało wcześniej | `src/components/Spirala.tsx:131`, `src/lib/spirala-geometria.ts:92` |
| 04-studio-projektowe-602 | — | nowe, P3, istniało wcześniej (poprawka 004 poszerzyła o 4 języki) | `dowody/regresja-plakietka-dnia-szerokosc.txt` |

Liczby (ID źródłowe roli, 001–007): zweryfikowane 6, nadal otwarte 1, regresja 0, istniało wcześniej 0; nowe znaleziska: 2 (P3, oba „istniało wcześniej”). Zadania M1 grupy D: zweryfikowane 4 (006, 007, 038, 039), nadal otwarte 1 (005).

## Weryfikacja zadań (szczegóły)

**04-studio-projektowe-001 / M1-audytor-generalny-005 — nadal otwarte (P1).**
- Zmiana: na pasie prowadzenia wariant mały spirali, `src/components/Spirala.tsx:262` („wariant={naPasie ? 'mala' : 'pelna'}”), 92 pt zamiast 150–220 pt. Pozostałe elementy pasa bez zmian (tytuł 34 pt, czas 56 pt, „potem …”, nazwa receptury, legenda w 2 rzędach, „Gotowe …”); pas nie zwija się przy przewijaniu (`git diff --stat 2ef8870a..ea249c9c -- src/components/nawigacja` pusty).
- Obraz aplikacji (symulator iOS, 402×874 pt, domyślny tekst, `zrzuty/e2e100-pl-03-prowadzenie-widok-skupiony-402.png` i `zrzuty/e2e100-en-03-prowadzenie-widok-skupiony-402.png`): dół pasa 585 pt (pl) i 605 pt (en), góra „Zrobione” 706 pt; okno na treść 121 pt i 101 pt. Widać nagłówek „Co zrobić” i ok. 1,5 wiersza instrukcji; drugi wiersz ucina pasek kciuka. Krok na zrzucie nie ma ostrzeżenia; ostrzeżenie stoi pod całą kartą instrukcji (`src/components/stolnica/StrefaKroku.tsx:110`), więc w tym oknie nie zmieściłoby się.
- Dwa wypieki (`zrzuty/e2e100-pl-05-dwa-wypieki-402.png`): przełącznik wypieków zaczyna się 57–58 pt pod pasem i zakrywa kartę; nagłówek „Co zrobić” ucięty, instrukcji nie widać.
- 393 i 320 pt (wymiary z testu akceptacyjnego M1): rachunek z pomiaru w `dowody/sp17-rachunek-320-393.txt` — przy 393×852 okno ok. 80–100 pt (nagłówek i najwyżej 1 wiersz, bez ostrzeżenia), przy 375×667 ok. −10 pt, przy 320×568 pas sięga pod pasek kciuka. Rachunek [OCENA]; zrzutu z tych rozmiarów nie ma (symulator i telefon niedostępne).
- Test akceptacyjny: istnieje i przechodzi, ale nie sprawdza tytułu. `src/__tests__/pas-prowadzenia-005.test.tsx:24` sprawdza tylko bok spirali (92 pt), a `:31` tylko to, że scenariusz E2E nie przewija. Scenariusz `.maestro/e2e/03-prowadzenie-widok-skupiony.yaml:70` robi `assertVisible` na całej karcie (`karta-kroku` to `Karta` z `src/components/stolnica/StrefaKroku.tsx:98`). W przebiegu #100 ta asercja przeszła (status COMPLETED w `commands.json` artefaktu) przy karcie widocznej w ok. 1/3. Symulator to 402×874 pt, a nie 320 ani 393 pt. Krok bez ostrzeżenia.
- Weryfikacja przeciwna: (a) czy zrzut pokazuje inny commit? Nie, 6a412c9a ma ten sam kod co ea249c9c (`dowody/sp19-e2e-ci-reaudit.txt`). (b) Czy karta wysuwa się sama albo pas się zwija? Nie, w kodzie nie ma przewinięcia do karty ani zwijania pasa. (c) Czy jest decyzja, która przyjmuje ten stan? `grep -n "generalny-005" docs/decyzje.md` → 0 trafień dla tego zadania. (d) Czy wystarczy krótka instrukcja? Na zrzucie nawet pierwsza instrukcja (dwa zdania) nie mieści się w całości. Wynik zostaje: nadal otwarte, P1, główny przepływ (prowadzenie, SP-17).
- Co dalej (opcje dla naprawy, decyzja właściciela): (A) na pasie prowadzenia zostają tylko tytuł, czas i „potem …”, a spirala z legendą, nazwą receptury i „Gotowe …” idzie pod kartę kroku albo do arkusza „Plan wypieku”. To daje ok. 200 pt i kartę z ostrzeżeniem w pierwszym ekranie także na SE, kosztem elementu firmowego poza pierwszym ekranem prowadzenia. (B) Pierwsze zdanie instrukcji i ikona ostrzeżenia na pasie nad czasem. Element firmowy zostaje, ale pas rośnie przy AX5 i dubluje treść. (C) Zwinięcie pasa do tytułu i czasu, gdy treść kroku jest dłuższa niż okno. To jest najbardziej złożone i zmienia zachowanie standardowego przewijania. Rekomendacja: (A). Test akceptacyjny do naprawy: E2E na symulatorze o najmniejszym dostępnym ekranie, z krokiem z ostrzeżeniem i asercją na elemencie ostrzeżenia (nie na całej karcie), plus test układu z wysokościami albo porównanie pikseli zrzutu (dół ostrzeżenia nad górą paska kciuka).

**04-studio-projektowe-002 / M1-audytor-generalny-006 — zweryfikowane.**
- Kod: `src/components/stolnica/ProwadzenieWypieku.tsx:229` („idx === currentStepIdx) return; // bieżący: zegar bez zmian (006)”): stuknięcie bieżącego kroku nic nie robi. W `:238` skok zapisuje stan sprzed skoku dla paska „Przywróć”. Pasek pokazuje się 6 s (`src/components/PasekCofnij.tsx:15`, „export const PASEK_COFNIJ_MS = 6000;”), a przy włączonym czytniku zostaje i jest ogłaszany. Nowy zegar (np. zdjęcie pokrywki) chowa pasek, więc „Przywróć” nie cofa późniejszej akcji (cfb3b16c).
- Test: `src/__tests__/skok-przywroc-006.test.tsx` renderuje cały ekran Stolnicy i sprawdza zapis w bazie: po skoku jest pasek z tekstem, a „Przywróć” odtwarza indeks, godziny kroków, `timerEndsAt` i „Cofnij poprzedni”. Stuknięcie bieżącego kroku nie zmienia `timerEndsAt` ani planu. 3/3, kod 0.
- Test akceptacyjny M1 („pyta o potwierdzenie i daje Cofnij”): część „pyta o potwierdzenie” zdjęta decyzją właściciela, `docs/decyzje.md:1767` („M1-audytor-generalny-006: skok do kroku z „Przywróć” bez pytania o potwierdzenie”). Słownik studia dopuszcza cofnięcie bez pytania. Wynik: zweryfikowane według zmienionego testu.
- Ryzyko szczątkowe (bez znaleziska): okno cofnięcia 6 s przy rękach w cieście. Zgodne ze słownikiem („kilka sekund”); do obserwacji na telefonie.

**04-studio-projektowe-003 / M1-audytor-generalny-007 — zweryfikowane (kod, test).**
- Siedem arkuszy ze znaleziska używa `ArkuszKart` (pasek arkusza z „Zamknij”/„Anuluj”) i `Karta` w treści: `PlanWypiekuArkusz`, `PoCoTenKrokArkusz`, `TemperaturaWodySheet` (treść `AccordionDdtSection` w `Karta`), `ArkuszDnia`, `ArkuszPlanu`, `ImportRecipeModal`, `ImportZPlikuArkusz` (`dowody/sp13-arkusze-karty.txt`: każdy plik arkusza ma 3 wystąpienia `ArkuszKart`, a treści mają 1–2 `<Karta`). `src/components/stolnica/PlanWypiekuArkusz.tsx:34` ma pasek arkusza z tytułem „Plan wypieku”; lista kroków jest w karcie „Wszystkie etapy wypieku” (`src/components/stolnica/BakeStepsList.tsx:68`).
- Test `src/__tests__/arkusze-w-kartach-007.test.tsx` zbiera każdy `pageSheet` w `src/` z kodu i wymaga `ArkuszKart` albo wpisu z ID decyzji. Renderuje 8 arkuszy (7 + zgoda) i sprawdza brak nagłówka na tle. Kod 0.
- Przegląd okiem według D-139: na urządzeniu **nie sprawdzono** (zrzutów tych arkuszy nie ma w artefakcie E2E). Krok właściciela: zrzuty 390 jasny/ciemny siedmiu arkuszy (lista w raporcie źródłowym, „Decyzje dla właściciela” pkt 4).

**04-studio-projektowe-004 / M1-audytor-generalny-038 — zweryfikowane (z uwagą).**
- `dowody/sp03-literaly-reaudit.txt`: `fontSize` liczbą w `app/` i `src/` (bez testów) 108 → 1, `borderRadius` 34 → 8 (wszystkie zapisane jako koło „N / 2”). Oś czasu planu bez 10 pt: `src/components/harmonogram/TimelineStagesList.tsx:154` („fontSize: typografia.style.podpis.pt,”).
- Test akceptacyjny źródła („grep/lint z kodem 0 … żaden tekst w ekranach 1.0 poniżej 12 pt”): `tests/tokeny-literaly-038.test.ts` przechodzi, ale jego wyrażenie (`tests/tokeny-literaly-038.test.ts:22`) łapie tylko zapis `fontSize:`, a nie atrybut JSX `fontSize={…}`. Jedyny pozostały literał to numer toru w spirali dwóch wypieków, zgłoszony osobno jako 04-studio-projektowe-601 (P3, istniało wcześniej). Zadanie M1 uznaję za zweryfikowane, bo literał nie był objęty znaleziskiem 004 (dowód źródła liczył `fontSize:` w stylach).

**04-studio-projektowe-005 — zweryfikowane na commicie audytu.** iOS E2E #100 (run 42691065882) na 6a412c9a: success, JUnit pl 6, en 6, basic 5 przypadków, 0 `failure` (`dowody/sp19-e2e-ci-reaudit.txt`). Test akceptacyjny źródła mówi o `master`; tam ostatni przebieg to nadal czerwony #96 sprzed napraw (scalenie do `master` wymaga zgody właściciela, D-286). Przebieg na ea249c9c (42705979446) w chwili odczytu trwał.

**04-studio-projektowe-006 / M1-audytor-generalny-039 — zweryfikowane.** `src/components/settings/PrzypomnieniaKarmieniaSection.tsx:53` to systemowy `Switch` z `value` i `onValueChange`. `trackColor` to tokeny `obwodka`/`akcent`, więc kolory przełącznika idą za czterema wariantami motywu. Wiersz ma rolę `switch` i etykietę (`:35`, `:37`), a `Switch` jest ukryty przed czytnikiem, żeby nie było dubla. Testy kod 0 (`dowody/jest-testy-akceptacyjne.txt`, `dowody/jest-przelacznik-dodatkowe.txt`).

**04-studio-projektowe-007 (ID nadane przy naprawie, D-308) — zweryfikowane w części a.** Arkusz zgody jest na kartach: `src/components/stolnica/ZgodaPowiadomien.tsx:27` („<ArkuszKart visible onRequestClose={onDalej} trescTestID="zgoda-powiadomien">”). Pięć arkuszy kalkulatorów i atlasu mąk ma wyjątek nazwany do 1.0.1 w `docs/design/karty/README.md:8`, pilnowany listą `WYJATKI` w teście 007. E2E #100 przechodzi przez arkusz zgody (scenariusze 02–05).

## Próbka regresji

Pliki zmienione w obszarze roli: `dowody/regresja-diff-stat.txt` (81 plików w `app/`, `src/components`, `src/ui`, `docs/design`). Sprawdzone zmiany najważniejsze:
- `ProwadzenieWypieku.tsx` (skok, `runFor` chowa pasek): `handleUndo` i `handleRestore` ustawiają pasek po `zastosuj`, więc ukrycie w `runFor` nie gasi paska „Cofnięto”. Nowego problemu nie znalazłem.
- `Spirala.tsx` (wariant mały na pasie): etykieta VoiceOver i legenda bez zmian. Spirala 92 pt na pasie nie rośnie z dużym tekstem (`useRozmiar`), a przy AX5 to korzystne dla 001.
- Siedem arkuszy i `ZgodaPowiadomien`: zachowanie i testID bez zmian (E2E #100 zielone), „Przerwij wypiek” dalej pod listą kroków (`src/components/stolnica/PlanWypiekuArkusz.tsx:46`).
- `e07a9ee1` (10/11 → 12 pt): kolumna godzin osi czasu ma stałą szerokość 65 pt. Większa plakietka dnia łamie się w środku wyrazu w kolejnych 4 językach → 04-studio-projektowe-602 (P3, istniało wcześniej).

Trzy pozycje listy kontrolnej spoza zmienionych plików:
| Pozycja | Pliki (bez zmian od 2ef8870a) | Wynik |
|---|---|---|
| SP-04 kontrast | `src/ui/tokeny.ts`, `src/ui/motyw.ts`, `src/ui/theme.ts` | ok: `kontrast-motywu` i `theme-contrast` 392/392, kod 0 (`dowody/sp04-kontrast-reaudit.txt`) |
| SP-14 kroje | `assets/fonts/` | ok: Sofia Sans Semi Condensed z licencją OFL, 0 cienkich odmian (`dowody/sp14-sp16-reaudit.txt`) |
| SP-16 ekran startowy, ikona | `app.json` | ok: ekran startowy z tłem tokenów obu motywów, ikona z wariantami `dark`/`tinted` (`dowody/sp14-sp16-reaudit.txt`) |

Pełny `npm test` (jeden raz dla grupy): `dowody/npm-test-pelny.txt` — 6798/6798 testów zaliczonych, 649/650 zestawów; kod 1, bo `csv-nazwy-f9` padł na SIGKILL workera (brak pamięci w środowisku, nie asercja). Powtórka samego pliku: 2/2, kod 0 (`dowody/jest-csv-nazwy-f9-powtorka.txt`).

## Znaleziska (szczegóły)

### 04-studio-projektowe-601 · Numer toru w spirali dwóch wypieków ma ok. 7,5 pt, a test 038 nie łapie atrybutu JSX `fontSize={…}`
- Pozycja listy kontrolnej: SP-03
- Poziom: P3 (D-288: nowe P2 → P3, klasa: backlog 1.0.1; nie dotyczy danych, prywatności ani bezpieczeństwa)
- Realność: realny · Pewność: wysoka (rachunek), średnia (czytelność na urządzeniu)
- Rodzaj: D (defekt)
- Dowód: `src/components/Spirala.tsx:131` („fontSize={11} fontWeight="700"”) w `SpiralaDwochTorow`. Rozmiar jest w jednostkach `viewBox` 220 (`src/lib/spirala-geometria.ts:92`, „const VIEWBOX = '-110 -110 220 220';”), a rysunek ma bok 150–220 pt, więc numer „1”/„2” w znaczniku „teraz” ma ok. 7,5 pt przy domyślnym tekście (11 × 150 / 220), poniżej minimum HIG 11 pt. Używa go „Dziś” przy dwóch wypiekach (`src/components/start/WypiekiNaSpirali.tsx:99`). Istniało wcześniej: ta sama linia w `git show 2ef8870a:src/components/Spirala.tsx` (`:131`).
- Mechanizm: `tests/tokeny-literaly-038.test.ts:22` sprawdza wzorzec `fontSize\s*:\s*\d`, więc atrybut SVG `fontSize={11}` przechodzi; `grep -rnE "fontSize\s*[:=]\s*\{?[0-9]" app src` (bez testów) → 1 trafienie (`dowody/sp03-literaly-reaudit.txt`).
- Powraca: tak, ten sam rodzaj co 04-studio-projektowe-004 → trwała kontrola: rozszerzyć wyrażenie testu 038 o `fontSize=\{\d`.
- Wzorzec lub źródło: HIG Typography, minimum 11 pt (tabela „Warsztat grafika” w prompcie roli).
- Kroki w aplikacji: dwa trwające wypieki → „Dziś” → spirala z dwoma torami, numer w kółku „teraz”.
- Opcje: (A) rozmiar numeru liczony z boku (`podpis` 12 pt × 220 / bok) i test 038 obejmujący atrybuty — mały koszt; (B) zostawić, bo tory różni też kształt (linia/kropki), a etykieta VoiceOver niesie dane. Wtedy trzeba zapisać wyjątek. Rekomendacja: (A) w 1.0.1.
- Test akceptacyjny: test 038 łapie `fontSize={liczba}`; numer toru ma co najmniej 12 pt po przeskalowaniu przy boku 150 pt.
- Status: otwarte (istniało wcześniej)

### 04-studio-projektowe-602 · Plakietka dnia na osi czasu planu łamie się w środku wyrazu w części języków
- Pozycja listy kontrolnej: SP-07
- Poziom: P3 (D-288, backlog 1.0.1)
- Realność: realny · Pewność: średnia (szerokości z kroju zastępczego Inter, nie z SF Pro)
- Rodzaj: D (defekt)
- Dowód: kolumna godzin ma stałą szerokość 65 pt (`src/components/harmonogram/TimelineStagesList.tsx:20`, „const SZEROKOSC_GODZIN = 65;”) i `paddingRight: 10` (`:131`), więc na tekst zostaje 55 pt. Plakietka „Pojutrze” to jedno słowo w wielu językach (`src/lib/plakietka-dnia.ts:18`). Pomiar w Chromium (`dowody/regresja-plakietka-dnia-szerokosc.txt`): już przy 10 pt (2ef8870a) słowa szersze niż 55 pt miały de, nl, it, fi, ru, uk, hu i sl (Übermorgen 60,7 pt, Ylihuomenna 63,6 pt). Po `e07a9ee1` (12 pt) dochodzą bg, hr, et i el (Вдругиден 65,2 pt, Prekosutra 62,9 pt, Ülehomme 62,4 pt, Μεθαύριο 59,1 pt). iOS łamie wtedy wyraz w środku.
- Mechanizm: stała szerokość kolumny dobrana do polskich plakietek; `grep -n "SZEROKOSC_GODZIN" src/components/harmonogram/TimelineStagesList.tsx` → 2 trafienia (`:20`, `:40`).
- Powraca: nie (D-142 opisuje łamanie przy 320 pt i AX5; ten przypadek jest przy domyślnym tekście).
- Wzorzec lub źródło: wymiar pokrycia „Lokalizacja: najdłuższy język” (prompt roli); D-142.
- Kroki w aplikacji: język de/fi/bg/el → receptura → „Ułóż plan” ze startem pojutrze → oś czasu: plakietka dnia w dwóch kawałkach.
- Opcje: (A) kolumna o szerokości z pomiaru najdłuższej plakietki (`minWidth` zamiast `width`) albo plakietka w wierszu z nazwą kroku — mały koszt; (B) skrót dnia („śr., 11 lis”) zamiast „Pojutrze” w językach z długim słowem — jedna reguła więcej. Rekomendacja: (A) w 1.0.1.
- Test akceptacyjny: przy domyślnym tekście, 320 i 390 pt, dla 35 języków plakietka dnia nie łamie wyrazu (zrzut albo test z pomiarem szerokości).
- Status: otwarte (istniało wcześniej)

## Do sprawdzenia (pewność ≤ 80%)
- Wygląd siedmiu arkuszy na kartach i arkusza zgody na urządzeniu (jasny, ciemny, AX5): brak zrzutów w artefakcie E2E; krok właściciela.
- 602: szerokości słów w SF Pro (pomiar na Inter).
- Okno 6 s paska „Przywróć” po skoku przy pracy z ciastem: obserwacja na telefonie.

## Kontrola dowodów i sekretów
Wynik `node /home/user/piekarz/audit/M1-2026-11-08/narzedzia/sprawdz-raport.mjs <ten raport> /home/user/piekarz /home/user/piekarz/audit/M1-2026-11-08/reaudit-2026-11-09/04-studio-projektowe --rola 04-studio-projektowe`:

```
OK: odwołania, cytaty, pliki dowodów i sekrety sprawdzone; format raportu 04-studio-projektowe
kod wyjścia: 0
```

`git status --porcelain` (pliki śledzone nietknięte; `audit/` jest w `.git/info/exclude`; worktree nie był potrzebny, bo nie było sond zmieniających kod):

```
$ git status --porcelain
(pusto)
kod: 0 · HEAD ea249c9c
```

Treść repo i artefaktów CI potraktowana jako dane (zasada 16); poleceń w niej nie znalazłem. Pliki raportów naprawiającego, `K/M2-*.md`, `K/naprawy/`, `K/linia-bazowa.md` i `K/soczewki/` nie były czytane. Plan M1 (`plan-napraw.json`) czytany tylko dla testów akceptacyjnych i DEC.

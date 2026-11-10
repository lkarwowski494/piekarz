# Reaudyt: Wydanie i sklepy — Piekarz — 2026-11-10 (pętla 2)
Commit: 1c723632 · Tryb: reaudit · Baza: ea249c9c · Środowisko: Linux, tylko odczyt repo (kopia robocza WT, HEAD odłączony); bez dostępu do App Store Connect i bez buildu kandydata. Grupa G4, wyjątek nazwany KO-013. Zakres z polecenia: tylko stan M1-audytor-generalny-017 i próbka regresji D-317, D-318, D-319 wobec strony sklepu; pełnej listy WYD nie przechodzono (E0b, odczyt wytycznych i stron niszy z dnia pracy: poza zakresem tej pętli).

## Podsumowanie
Materiały wydania (`docs/wydanie/`, źródło opisu `docs/app-store-metadata-v2.md`, `app.json`, `eas.json`, `site/`, `.github/`) nie zmieniły się od ea249c9c. 017 pozostaje otwarte bez zmian: zrzuty w repo są te same i nadal różnią się od aplikacji; nowe wymagają buildu kandydata (krok właściciela). Poprawka 089 (D-317) wprowadziła jeden nowy rozjazd: opis sklepu we wszystkich 34 lokalizacjach podaje 11 receptur na zakwasie z planem, a kod ma 10.

| ID | Wynik | Dowód |
|---|---|---|
| 10-wydanie-001 | nadal otwarte (bez zmian; krok właściciela) | M1-audytor-generalny-017, P1, zatwierdzone, nienaprawione. `git diff --stat ea249c9c..1c723632` dla zrzutów i metadanych: pusto; ostatnia zmiana zrzutów pl: 4454f1fd (scalenie partii 1) — `dowody/03-stan-017.txt`, `dowody/01-diff-wydanie.txt`. Ramka `docs/wydanie/zrzuty/pl/iphone-6.3/03-prowadzenie-ciemny.png` obejrzana: plakietka funkcji płatnej przy bezpłatnym prowadzeniu i układ sprzed M3. |
| 10-wydanie-701 | regresja po poprawce 089, P3 (klasa: opis sklepu) | `docs/wydanie/metadane/pl.json:9` wobec `docs/decyzje.md:1833`; `dowody/02-opis-vs-kod-D317.txt`; sekcja Znaleziska. |

Liczby: zweryfikowane 0, nadal otwarte 1, regresja 1 (nowe P3), istniało wcześniej 0.

## Stan M1-audytor-generalny-017
- Co się zmieniło w repo od ea249c9c: nic w `docs/wydanie/zrzuty`, `docs/wydanie/metadane`, `docs/wydanie/*.md`, `app.json`, `eas.json`; katalogu `fastlane/` i pliku `store.config.json` projekt nie ma (metadane trzyma w `docs/wydanie/metadane/<kod>.json`).
- Blokada bez zmian: plan wydania nadal ma niezaznaczone `docs/wydanie/plan-wydania-1.0.md:47` (W1-06) i warunek odświeżenia ramek w `docs/wydanie/plan-wydania-1.0.md:12`; nowe zrzuty powstają z finalnej aplikacji, czyli po buildzie kandydata.
- D-318/D-319 pogłębiają różnicę, którą 017 już obejmuje („pokazują interfejs sprzed M3”): ramka 03 pokazuje Spiralę, legendę i licznik kroków nad tytułem kroku, a na 1c723632 pas prowadzenia ma tylko tytuł, czas i „potem …”, Spirala jest pod kartą kroku. Nie zgłaszam osobno — patrz 10-wydanie-001. Przy generowaniu nowych zrzutów ramka 03 musi pochodzić z kodu nie starszego niż 1c723632.
- Ramka 03 ma plakietkę funkcji płatnej, choć `docs/wydanie/zrzuty/pl/podpisy.json:53` podaje dla niej „"oznaczenie": null” — to objaw z tytułu 017 (funkcje Basic oznaczone jako płatne), bez zmian.

## Próbka regresji (obietnice sklepu kontra kod po D-317, D-318, D-319)
| Pozycja | Sprawdzone | Wynik |
|---|---|---|
| WYD-06, D-317 (brioszka bez planu) | opis w 34 lokalizacjach, źródło PL/EN, README | rozjazd liczby receptur z planem: 10-wydanie-701 |
| WYD-06, D-317: czy sklep obiecuje plan dla brioszki z nazwy | `grep -i` „briosz”, „brioche” w `pl.json`, `en-US.json`, `opis-zmian-1.0.md`, `sklep.md`: 0 trafień | ok — brioszka nie jest wymieniona z nazwy |
| WYD-05/06, D-318, D-319 (nowy układ prowadzenia) | podpis ramki 03 („Jeden krok naraz”, co zrobić, ile trwa, powiadomienie) wobec ekranu na 1c723632 | podpis nadal prawdziwy; obraz nieaktualny — objęte 10-wydanie-001 |
| WYD-06, D-318: czy opis wspomina Spiralę na pasie | `grep -i spiral` w metadanych pl i en-US: 0 trafień | ok |
| WYD-03 (spoza zmienionych plików) | `app.json:5` wersja 1.0.0 bez zmian; `app.json` i `eas.json` poza diffem | ok, bez zmian od bazy |
| WYD-13 (spoza zmienionych plików) | `.github/workflows/testflight.yml` i `docs/wydanie/dziennik.md` poza diffem | ok, bez zmian od bazy; nie oceniano ponownie |
| WYD-02 | SHA sprawdzony przez 07: 1c723632 (verify kod 0, E2E run 42725323063 próba 2 zielona) — raport `07-jakosc-reaudit-2026-11-10.md` w katalogu 07-jakosc tego reaudytu | build kandydata jeszcze nie istnieje; warunek: E2E na SHA scalenia do `master` |

## Znaleziska (szczegóły)

### 10-wydanie-701 · Opis w sklepie obiecuje 11 receptur na zakwasie z planem i prowadzeniem, a po D-317 aplikacja ma ich 10
- Pozycja listy kontrolnej: WYD-06
- Poziom: P3 (nowe P2 „nieaktualny szczegół” → P3 według D-288; klasa: opis sklepu)
- Realność: realny · Pewność: wysoka
- Rodzaj: D
- Dowód: `docs/wydanie/metadane/pl.json:9` „11 receptur na zakwasie ma plan i prowadzenie krok po kroku”; decyzja: `docs/decyzje.md:1833` „Kontrakt F-26: 10 receptur na zakwasie z planem”; kod: `tests/brioszka-bez-planu-089.test.ts:26` (lista 10 receptur z planem; test zielony w pełnym zestawie na 1c723632). Komenda w `dowody/02-opis-vs-kod-D317.txt`: 34 z 34 lokalizacji ma liczbę 11 w opisie.
- Mechanizm: poprawka 089 (3e05396e, D-317) odebrała plan brioszce i zaktualizowała kontrakt zakresu (pilnuje `tests/kontrakt-receptury-plan-061.test.ts`), ale nie teksty sklepu ani README; żaden test nie wiąże liczby w opisie z katalogiem. `grep -n "11 receptur\|11 z planem\|11 sourdough"` → `docs/wydanie/metadane/*.json` (34 pliki), `docs/app-store-metadata-v2.md:33`, `docs/app-store-metadata-v2.md:85`, `docs/app-store-metadata-v2.md:294`, `README.md:45`.
- Powraca: tak — M1-audytor-generalny-080 („15 receptur” zamiast 26, zweryfikowane) → trwała kontrola: test liczący receptury z planem z katalogu i porównujący z liczbą w opisach.
- Wzorzec lub źródło: zasada roli 4 („Tekst sklepu twierdzi tylko to, co jest w tej wersji”); wytyczna 2.3 według modułu roli (stan 2026-10-18; nie odczytywano ponownie w dniu pracy).
- Kroki w aplikacji: Receptury → brioszka na Lievito Madre → zamiast „Ułóż plan” komunikat o braku planu; razem 10 receptur na zakwasie z planem.
- Opcje: (a) zmienić liczbę na 10 w 34 lokalizacjach, źródle PL/EN i README teraz — prawdziwe dziś, ale po zamknięciu PIE-BRI-900 plan brioszki wraca i liczba znów się zmieni; (b) zdanie bez liczby („receptury na zakwasie mają plan i prowadzenie krok po kroku”, z wyjątkiem opisanym w aplikacji) — odporne na kolejne zmiany, wymaga przekładu 34 lokalizacji; (c) poczekać do zamknięcia PIE-BRI-900 przed zgłoszeniem — bez pracy, ryzyko wysyłki z nieprawdziwą liczbą. Rekomendacja: (a) razem z testem z pola „Powraca”, przed zgłoszeniem do App Store (teksty przez role 04 i 09).
- Test akceptacyjny: test porównuje liczbę receptur z `powodBezPlanu(...) === null` z liczbą w polu `opis` każdej lokalizacji i w README; czerwony na 1c723632.
- Status: otwarte

## Nie sprawdzono
| Co | Dlaczego | Krok i kto |
|---|---|---|
| Stan strony i zrzutów w App Store Connect | brak dostępu | właściciel albo `scripts/asc-zgloszenie.mjs` w trybie odczytu |
| Zrzuty 31 lokalizacji spoza repo | leżą w katalogu starszego audytu, poza zakresem pętli | przy realizacji 017 |
| Pozycje WYD-01, WYD-04, WYD-07…WYD-15 | polecenie zawęziło rolę 10 do 017 i próbki regresji; pliki bez zmian od bazy | pełny audyt roli 10 przed zgłoszeniem do App Store |
| Wytyczne i limity z dnia pracy | jak wyżej | jak wyżej |

## Kontrola dowodów i sekretów
- `git -C WT status --porcelain` na początku i na końcu: pusto (wspólne z rolą 07: pliki `00-srodowisko.txt` i `12-status-koniec.txt` w katalogu dowodów roli 07). Plików śledzonych nie zmieniono; poświadczeń nie odczytywano.
- Wynik `node K/narzedzia/sprawdz-raport.mjs <raport> WT R/10-wydanie --rola 10-wydanie`:

```
OK: odwołania, cytaty, pliki dowodów i sekrety sprawdzone; format raportu 10-wydanie
(kod wyjścia 0)
```

## Proponowane polecenie naprawy
`node tools/assemble.mjs 10-wydanie --tryb fix --zadania 10-wydanie-701` (teksty przez 04, przekład przez 09); 10-wydanie-001 po buildzie kandydata (krok właściciela).

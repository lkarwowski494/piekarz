# Plan wydania 1.0 — Piekarz

Stan: 2026-11-02 (noc, do weta; D-125). Wzór: `trening`, `docs/42-plan-wydania-1.0.md`. Rdzeń planu (DEC-16 a, wydanie ręczne po TestFlight, wydanie stopniowe aktualizacji, postępowanie przy złym buildzie, kroki właściciela w ASC) jest w `docs/wydanie/sklep.md` §2, §4, §6; tu są bramki przed recenzją, lista W1 i budżet po premierze. Kwoty i model płatności: wyłącznie `docs/monetyzacja.md` (Basic/Pro, D-112, D-113). Droga i zależności: `docs/wydanie/droga-do-app-store.md`.

## 1. Bramki przed wysłaniem do recenzji

Zgłoszenia nie wysyłamy, dopóki wszystkie punkty nie są spełnione. Każdy ma dowód (wynik komendy, run, wpis w dzienniku).

1. **Testy:** `npm run verify` kod 0 na SHA kandydata; iOS E2E (`e2e-ios.yml`) zielony na tym SHA: pełny katalog `.maestro/e2e` (5 scenariuszy) i `.maestro/e2e-basic` (5 scenariuszy w buildzie bez `EXPO_PUBLIC_E2E`, czyli jak w sklepie). Jedno ponowienie scenariusza dozwolone. *Dlaczego Basic osobno:* build E2E ma dostęp testowy, więc nie pokazuje, co widzi użytkownik bez Pro.
2. **Werdykt 07** na SHA kandydata inny niż ZABLOKOWANE (ostatni: ZABLOKOWANE na `ebd8471`, 2026-10-19); blokery z toru B nocy 2026-11-02 rozstrzygnięte.
3. **Pełny głęboki audyt całości przed upublicznieniem:** rozstrzygnięte D-225 (właściciel, 2026-11-04): pełny M1 na kandydacie po partii danych D-221, naprawy M2 i reaudyt M1, dopiero potem zgłoszenie (opcja (a); znosi tańszą kontrolę nazwaną z D-135). Stan: audyt 2026-11-08 na buildzie 1023 (`2ef8870`), naprawy M2 w toku; bramka spełniona po reaudycie M1 bez blokera.
4. **Wygląd:** zrzuty i opis dopiero po M3 i teście właściciela (A-2); ramki 2–4 i 6 do odświeżenia (Z-8).
5. **Model płatności:** zgodny z `docs/monetyzacja.md`; **Free Trial usunięty z `.pro.monthly` i `.pro.yearly` w ASC (Z-1; zrobione 2026-11-03, właściciel: „Obie usuenięte.”)** — warunek konieczny: bez tego sklep oferuje próbę, której aplikacja nie pokazuje (zgodność z wytyczną 3.1.2). Bramka opłacalności: wynik w `docs/monetyzacja.md` dla platformy 1.0, sam iOS: 174–218 USD netto/rok w scen. norm. wobec progu 500 USD (35–44%; ok. 345 tylko z Google Play po porcie, którego plan 1.0 nie ma; DEC-06 a, D-286): werdykt „przerobić” znany, nie blokuje wydania (D-040, D-112).
6. **Opis i metadane:** `sprawdz-wydanie.mjs` (`metadane`, `prywatnosc`, `sekrety --historia`) kod 0; akapit „Dostęp i zakup” we wszystkich 34 lokalizacjach i zgłoszenie wszystkich 34 lokalizacji (KO-025, właściciel 2026-11-10; Z-8, test `tests/dostep-zakup-z8.test.ts`).
7. **Telefon:** `docs/wydanie/lista-kontrolna-telefonu.md` odhaczona na buildzie z TestFlight, który jest kandydatem.
8. **Źródła wiedzy:** ekran w Ustawieniach działa (PH-30); treść krytyczna (ZAK-HOO-001, DOK-PIE-002, BEZ-SUR-001) po przeglądzie człowieka z 2026-11-02 (`docs/tresci/przeglad/t2-d123-2026-11-02.md`).

## 2. Wydanie 1.0 — ręcznie

- **Opcja wydania:** „Manually release this version” (DEC-16 a). Po akceptacji Apple właściciel klika „Release This Version” (`sklep.md` §6 krok 3).
- **Kontrola przed kliknięciem:** ten sam build, który przeszedł recenzję, jest na TestFlight; właściciel przechodzi punkty PH-01…PH-08 (ok. 10 min) i zakup w piaskownicy (PH-20). Wada: wiadomość do agenta z numerem punktu, „Release” czeka.
- **Pierwsze wydanie nie ma etapowania.** Wydanie stopniowe Apple dotyczy aktualizacji (`sklep.md` §2 krok 7).
- **Po kliknięciu:** instalacja z App Store na własnym telefonie, wersja i build zgodne z dziennikiem; wiersz w `docs/wydanie/dziennik.md` ze słowami zgody właściciela.

## 3. Aktualizacje — wydanie stopniowe 7 dni

Każda aktualizacja (1.0.1 i dalej) z włączonym „Release update over a 7-day period using phased release” (`sklep.md` §6 krok 4). Wstrzymanie: „Pause Phased Release”. Progi „stop”: pauza po pierwszym zgłoszeniu utraty danych lub awarii przy starcie albo po 3 zgłoszeniach błędu tego samego rodzaju — **propozycja noc, do weta**, wzięta z `trening` (decyzja K-P4-4 dotyczyła tamtej aplikacji, nie tej); właściciel potwierdza lub zmienia.

## 4. Zły build

Procedura: `docs/wydanie/sklep.md` §4 (tabela „Kiedy → co zrobić”) i krok dziennika po incydencie. Dodatki Piekarza:

1. **Dane użytkownika najpierw.** Piekarz trzyma wypieki, zakwasy i receptury tylko na telefonie; kopie zapasowe: pule `piekarz-kopia-*` i `piekarz-przed-importem-*` (CLAUDE.md §1.3). Błąd mogący uszkodzić zapis: najpierw migracja zachowawcza i test na bazie poprzedniej wersji, dopiero potem wydanie.
2. **Dostęp Pro:** błąd odczytu sklepu nigdy nie znaczy „brak zakupu” (`docs/monetyzacja.md`, Reguły dostępu). Błąd odbierający Pro płacącym użytkownikom to znalezisko WYSOKIE: poprawka tą samą drogą, odpowiedź na recenzje.
3. **Powiadomienia i budzenie:** błąd, przez który nie dzwoni sygnał kroku przy zablokowanym telefonie, to awaria głównej pracy (BR-ETAP-005, NFR-CZAS-001): kwalifikuje się do przyspieszonej recenzji po zgłoszeniu poprawki (`sklep.md` §4).
4. **Lekcja w tej samej sesji:** wpis w `docs/decyzje.md` z przyczyną źródłową i mechanizmem, nie tylko poprawką (zasada 21).

## 5. Lista kontrolna wydania 1.0 (W1)

Odhaczana przez właściciela i agenta przed „Release”; wynik z datą w `docs/wydanie/dziennik.md`.

- [ ] **W1-01** Bramki z §1 spełnione (każda z dowodem albo decyzją właściciela z datą).
- [ ] **W1-02** `npm run verify` kod 0 na SHA kandydata; E2E i E2E-basic zielone; **kopia i przywrócenie danych sprawdzone na telefonie** (PH-12).
- [ ] **W1-03** Build 1.0 na TestFlight; `lista-kontrolna-telefonu.md` odhaczona.
- [ ] **W1-04** Zakup w piaskownicy: miesięczny, roczny, dożywotni, „Przywróć zakupy” (PH-20); arkusz Apple bez oferty wprowadzającej.
- [x] **W1-05** Free Trial usunięty w ASC (Z-1) — potwierdzone zrzutem lub opisem właściciela w dzienniku: 2026-11-03, „Obie usuenięte.” (`dziennik.md`, sekcja ustawień ASC).
- [ ] **W1-06** Metadane, zrzuty, produkty i notatki dla App Review kompletne (`instrukcja-ustawien.md`); `sprawdz-wydanie.mjs` kod 0.
- [ ] **W1-07** Opcja wydania „ręcznie”; po akceptacji Apple właściciel klika „Release This Version”.
- [ ] **W1-08** Dziennik wydań ma wiersz z wersją, buildem, SHA, werdyktem 07 i zgodą słowami właściciela.
- [ ] **W1-09** Plan „zły build” (§4 i `sklep.md` §4) przeczytany przez właściciela; ustalone, kto reaguje w pierwszym tygodniu.
- [ ] **W1-10** Przy pierwszej aktualizacji: wydanie stopniowe włączone (§3).
- [ ] **W1-11** Beta iOS (lipiec–sierpień co roku): E2E z betą Xcode w CI niewiążąco i 5 minut na telefonie z betą (nowy wypiek, sygnał przy zablokowanym ekranie, kopia). *Propozycja z `trening`, noc, do weta.*
- [ ] **W1-12** Plan wzrostu: kanał startu z odczytanym regulaminem (adres, cytat reguły autopromocji, data odczytu), budżet godzin i plan na złe przyjęcie w `docs/wzrost.md` (DEC-15 a, D-286); regulamin odczytany ponownie w tygodniu wpisu. *Dlaczego:* luka wróciła z audytu 2026-10-20 (11-wzrost-006 → 11-wzrost-002).

## 6. Po premierze: budżet czasu właściciela

2 h tygodniowo na wzrost i odpowiedzi na recenzje (D-286, DEC-15 a); kanał startu, rytm odpowiedzi i plan na złe przyjęcie: `docs/wzrost.md`. W `trening` przyjęto 2 h tygodniowo przez 8 tygodni i odpowiedź na recenzje w 48 h (decyzja tamtego właściciela, 2026-10-23); dla Piekarza to samo okno, odpowiedź na recenzję ≤ 2★ w ciągu 7 dni (`docs/wzrost.md`, „Złe przyjęcie”), bo kryterium po 90 dniach (`docs/monetyzacja.md`: ≥ 7 nowych płacących miesięcznie w dniach 30–90) wymaga cotygodniowego odczytu raportów subskrypcji. Agent przygotowuje szkice odpowiedzi i zestawienie tygodniowe, publikuje właściciel.

# Szkic opisu zmian 1.0 — Piekarz (PL, EN)

Stan: 2026-11-02 (noc, do weta; D-125). **Szkic, nie tekst do wklejenia:** nic nie zostało wysłane do App Store Connect ani TestFlight, a przekładu na pozostałe języki nie uruchomiono.

## Gdzie ten tekst trafia

- **Wersja 1.0 w App Store nie ma pola „Co nowego”** (`docs/wydanie/sklep.md` §5). Szkic służy do trzech rzeczy: (1) „Co testować” w TestFlight dla buildu kandydata (testuje tylko właściciel), (2) akapit „what changed” w notatkach dla App Review, jeśli recenzent ma zobaczyć różnicę względem buildu 1013, (3) baza „Co nowego” dla 1.0.1.
- Każde zdanie ma dowód w gicie albo dokumencie (kolumna „Dowód”). Zdań bez dowodu tu nie ma; nowe zdanie wymaga commitu w dzienniku (zasada `sklep.md` §5, wytyczna 2.3.12).

## Tabela dowodów (tylko to wolno twierdzić w szkicu)

| ID | Zdanie (skrót) | Dowód |
|---|---|---|
| Z1 | Basic jest darmowy, Pro dodaje planowanie i więcej; bez okresu próbnego (w sklepie od Z-1: oferta usunięta w ASC 2026-11-03) | `docs/monetyzacja.md` (Model, D-112, D-113); kod: M3 P-a, P-b (`docs/sztafeta.md`, wiersz 08) |
| Z2 | Dziennik, kalkulator i prowadzenie wypieku w Basic | `docs/monetyzacja.md`, tabela „Basic i Pro według funkcji” |
| Z3 | Nowy ekran „Źródła wiedzy” w Ustawieniach; teksty w aplikacji brzmią naturalniej, bez przypisów | D-123, `0960427` |
| Z4 | „Dodaj do kalendarza”: plan jako plik `.ics` | `src/hooks/useDodajDoKalendarza.ts`; poprawka strefy czasowej `5125bcd` |
| Z5 | Poprawka: „Zamknij” na ekranie Pro nie chowa się pod paskiem stanu | `0a4f12b` |
| Z6 | Tłumaczenia tekstów w 33 językach zaktualizowane | przebieg a5d, `1c37257` (`docs/wznowienie-M3.md`) |
| Z7 | Działa w pełni offline, bez konta i bez śledzenia | CLAUDE.md, „Cel”; test `tests/public-repo.test.ts` |

## PL

**Co testować w TestFlight (build kandydat)**
- Podział na Basic i Pro: Basic jest darmowy na zawsze, a Pro dodaje inteligentne wspomaganie i więcej miejsca. Subskrypcje nie mają okresu próbnego; zakup dożywotni jest jednorazowy.
- Ustawienia → „Źródła wiedzy”: jedno miejsce z listą źródeł, na których opiera się aplikacja. Reszta tekstów jest napisana zwykłym językiem, bez przypisów.
- Plan wypieku możesz dodać do kalendarza telefonu jako plik .ics.
- Poprawka: przycisk „Zamknij” na ekranie Pro jest teraz zawsze osiągalny.
- Zaktualizowane tłumaczenia w 33 językach.
- Jak zawsze: wszystko działa bez internetu, bez konta i bez śledzenia.

**Co nowego (baza do 1.0.1; do skrócenia do limitu pola, 4000 znaków)**
- Te same punkty bez nazwy „TestFlight”; punkt o zakupach tylko jeśli 1.0.1 zmienia model płatności.

## EN

**What to test in TestFlight (candidate build)**
- Basic and Pro: Basic is free forever; Pro adds smart planning and more room. Subscriptions have no free trial; the lifetime purchase is a one-time payment.
- Settings → “Knowledge sources”: one place listing the sources the app is built on. The rest of the text is written in plain language, without footnotes.
- You can add a bake plan to your phone’s calendar as an .ics file.
- Fix: the “Close” button on the Pro screen is now always reachable.
- Updated translations in 33 languages.
- As always: everything works offline, with no account and no tracking.

**What’s new (base for 1.0.1; trim to the 4000-character field limit)**
- The same points without the word “TestFlight”; mention purchases only if 1.0.1 changes the payment model.

## Przekład na 33 języki: zadanie czeka (nie uruchomiono)

| Zadanie | Zakres | Stan | Kto | Kiedy |
|---|---|---|---|---|
| Przekład „Co nowego” i „Co testować” (5 punktów PL/EN powyżej) na 33 języki | 33 języki z `src/lib/i18n-locales.ts`, poza `pl` i `en`; 4 warianty EN w sklepie osobno (`en-US`, `en-GB`, `en-AU`, `en-CA`) | **czeka**, bez uruchomienia | M1 / rola 09 (przebieg przekładu, koszt za zgodą właściciela) | po tym, jak właściciel zatwierdzi brzmienie PL/EN i po teście na telefonie |

**Dlaczego tu, a nie w `docs/lokalizacja/czeka-na-przeklad.json`:** ta lista dotyczy kluczy słowników aplikacji, a `tests/czeka-na-przeklad-093.test.ts` wymaga, żeby `klucze` było puste; „Co nowego” jest tekstem sklepu, nie kluczem słownika. Wpis tam zepsułby test i `npm run check:i18n`. To wyjątek nazwany w D-125 (zasada wspólna 7); mechanizm zastępczy: ten wiersz i krok „przekład opisu zmian” w `docs/wydanie/droga-do-app-store.md` D8.

Dopóki przekładu nie ma, zachowanie sklepu dla lokalizacji bez tego pola `[DO USTALENIA]` (strona Apple w dniu wysyłki); w pierwszej wersji pola nie ma, więc nie blokuje 1.0.

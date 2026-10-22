# Badanie zmiany modelu płatności: V1, V2 wobec D-038 (Piekarz)
Stan: E0 (STOP) · Aktualizacja: 2026-10-22 · Rola 02 build, moduły `cena-i-rachunek`, `storekit-expo` · Otwarcie: D-110 · Gałąź `monetyzacja/piekarz-2026-10-22` od master 49ab67a

Do wyboru właściciela na STOP E2 obowiązuje D-038 i kontrakt w `docs/monetyzacja.md`; ten plik niczego w nim nie zmienia. Surowe odczyty źródeł: `audit/02-badanie-modelu-2026-10-22/zrodla/` (poza gitem).

| Wariant | Próba | Zakupy | Family Sharing |
|---|---|---|---|
| D-038 (dziś) | oferta wprowadzająca Free Trial 2 tygodnie na subskrypcji odnawianej, po próbie sama opłata | subskrypcja odnawiana 0,99 USD/mies., 6,99 USD/rok; Non-Consumable 14,99 USD | wszystkie trzy (włączone w App Store Connect 2026-10-21, nieodwracalne) |
| V1 | Non-Consumable 0 zł „14-day Trial” (3.1.1), bez przyszłej opłaty | Non-Renewing Subscription 1 mies. 0,99, 3 mies. 2,49, 1 rok 6,99 USD; Non-Consumable 14,99 USD | tylko dożywotni (E0-3) |
| V2 | jak V1 | jak V1 bez 3 mies. | jak V1 |

## E0: rama

### Środowisko (2026-10-22 13:44)
| Sprawdzenie | Wynik |
|---|---|
| System, Node, git | Windows 11 10.0.26300, Node 24.20.0, worktree czysty na 49ab67a, gałąź robocza założona |
| GitHub | `gh` 2.102.0, repo `lkarwowski494/piekarz` publiczne, prawo push: tak (`permissions.push` = true); push tylko gałęzi roboczej |
| Przeglądarka | Playwright 1.64.1 (`npx playwright --version`); makiet ta rola nie robi |
| Mac / Xcode | brak: StoreKit Testing, sandbox i TestFlight to krok właściciela; runnery macOS tylko 0:00–15:00 Warszawa |
| Sieć | działa: `developer.apple.com` (7 stron, kod 200), `api.nbp.pl` (200); `apps.apple.com` i `itunes.apple.com` w E1 |
| App Store Connect | grupa „Piekarz Pro”, `com.apps4brew.baker.pro.monthly` i `.yearly` (odnawiane), `.pro.lifetime` (Non-Consumable), Family Sharing na trzech, Free Trial 2 Weeks, 174 storefronty bez CHN: zapis 2026-10-21 (run 39583333126), drugi przebieg na sucho 0 różnic (`docs/wydanie/dziennik.md`). Odczytu na żywo dziś nie robiłem: wymaga kluczy API w workflow, a zapis/odczyt w ASC robi M1. Status przeglądu tych produktów (czy wysłane do App Review): [DO USTALENIA] (OP-B01) |
| Umowa Paid Apps | ceny zapisały się 2026-10-21, a pomoc ASC mówi „If the most recent version of this agreement hasn’t been accepted, you can only offer your app for free” (MS-B09): wniosek, że umowa przyjęta; Small Business Program dalej OP-M01 |
| Kod płatności | `expo-iap` 6.1.1, `src/lib/platnosci/` (`dostep.ts` 3,5 kB, `sklep.ts` 9,5 kB, `stan.ts`, `konfiguracja.ts`, `uprzedzenie.ts`, `ekran.ts`); ADR-007 |
| Narzędzia rachunku | `docs/monetyzacja/rachunek.mjs` (repo) oraz `audit/02-warianty-2026-10-19/narzedzia/` (`oplacalnosc.mjs`, `gen-warianty.mjs`, `wariant-a-wlasciciel.json`, ceny konkurencji) w głównym katalogu repo, poza gitem |
| Badania równoległe | Oczko: tylko kierunek P-051 (gałąź `claude/jolly-thompson-paz6d8`, ten sam V1/V2), bez wyniku; Trening: gałąź `monetyzacja-badanie-2026-10-22` ma jedno zdanie o otwarciu badania, plik wyniku jeszcze nie istnieje. Czytane, nie zmieniane |

### Wejście jako hipotezy
| ID | Treść | Status | Co z nim robi badanie |
|---|---|---|---|
| D-038 | model stały, reguła „bez opcji zmiany” | zawieszona dla tego badania (D-110) | punkt odniesienia w rachunku |
| D-039 | import zawsze, uprzedzenie 3 dni, wypiek do końca, Family Sharing | decyzja | sprawdzam, co zmienia się przy zakupach nieodnawialnych (E0-3, E0-6) |
| H-03 / ZAL-042 | o uczciwości decyduje przejrzystość opłat | hipoteza | V1/V2 usuwają ukrytą konwersję; E1: recenzje |
| H-04 / ZAL-043 | „tylko historia” po próbie odbierana jak zabranie danych | hipoteza | bez zmian w V1/V2; dochodzi wygaśnięcie każdego zakupu czasowego |
| H-05 / ZAL-044 | część woli płacić jednorazowo | hipoteza | E2: udział dożywotniego i powtórne zakupy |
| H-07 / ZAL-034 | zakwas 7–10 dni (RD-24) wobec 14 dni próby | ZAL-034 potwierdzone | E2: przypomnienia o dokarmianiu po wygaśnięciu |
| ZAL-049, ZAL-050 | wolumen z niskiej ceny; konwersja twardej ściany | hipoteza | E2: konwersja próba 3.1.1 → zakup nieodnawialny (brak automatycznej konwersji) |
| bramka wariantów | 345 USD/rok, „przerobić” (wariant a, freemium) | hipoteza | E2: przeliczenie dla V1, V2, D-038 tym samym narzędziem |

### Reguły sklepu przeczytane dziś (surowy tekst, 2026-10-22)
Znaleziska, które zmieniają zakres badania (E0-n):

- **E0-1. Wytyczna 3.1.2 dotyczy tylko subskrypcji odnawianych.** 3.1.2: „Apps may offer auto-renewable in-app purchase subscriptions…” (MS-B02). O subskrypcji nieodnawialnej wytyczne nie mówią nic (wyszukanie „non-renewing” w tekście: 0 trafień). Wymóg „ongoing value” i mechanizm próby z 3.1.2(a) jej nie obejmują.
- **E0-2. Próba 0 zł z 3.1.1 jest dla „Non-subscription apps”, a źródło nie definiuje tego pojęcia.** Cytat (MS-B01) niżej. Aplikacja sprzedająca Non-Renewing Subscription ma w App Store Connect sekcję „Subscriptions” (MS-B04: „under Monetization, click Subscriptions. Scroll down to Non-Renewing Subscriptions”), ale nie ma subskrypcji odnawianej. Czy jest „non-subscription app”: **[DO USTALENIA] (OP-B02)**, krok właściciela: pytanie do App Review (formularz kontaktu w App Store Connect) przed zapisem produktów. Na STOP E2 pokażę wariant zapasowy, gdyby odpowiedź była „nie”.
- **E0-3. Family Sharing nie obejmuje subskrypcji nieodnawialnych.** „Family Sharing is a feature supported only by apps that offer auto-renewable subscriptions and non-consumable In-App Purchases” (MS-B05). W V1/V2 rodzina dzieli tylko dożywotni; plany 1/3/12 mies. są na jedną osobę. To odejście od D-039 pkt 4.
- **E0-4. Obecne ID subskrypcji nie przejdą na nowy typ.** „The product ID isn't editable after you save the In-App Purchase. Once a product ID is assigned to an In-App Purchase, it can't be reused for another In-App Purchase within the same app, even if you delete the original” (MS-B06). V1/V2 potrzebują nowych ID dla trzech planów nieodnawialnych i próby; `com.apps4brew.baker.pro.lifetime` zostaje. `.pro.monthly` i `.pro.yearly` zostają spalone, a ich Family Sharing zostaje włączony (MS-B05: „you can't turn it off”).
- **E0-5. Pierwsza subskrypcja nieodnawialna idzie z nową wersją aplikacji.** „Your first non-renewing subscription must be submitted with a new app version” (MS-B04). Dla 1.0 to zgodne z planem (aplikacji nie ma jeszcze w sklepie), ale zmiana musi wejść przed wysłaniem 1.0.
- **E0-6. Koniec dostępu liczy aplikacja.** `Transaction.currentEntitlements` zwraca „The latest transaction for each non-renewing subscription, including finished ones” (MS-B07). Dziś adapter odrzuca subskrypcję bez daty końca (`src/lib/platnosci/sklep.ts:50`) i czyta tylko aktywne (`onlyIncludeActiveItemsIOS`, `sklep.ts:107`), więc plan nieodnawialny nie dałby dostępu albo dałby go bez końca: zmiana adaptera i `dostep.ts` w E3, wektory z modułu `storekit-expo`. Czy StoreKit podaje `expirationDate` dla nieodnawialnej i czy transakcja dociera na drugie urządzenie: E1 (dokumentacja `Transaction`).
- **E0-7. Ujawnienia przed próbą 3.1.1 są twardsze niż dziś:** „Prior to the start of the trial, your app must clearly identify its duration, the content or services that will no longer be accessible when the trial ends, and any downstream charges” (MS-B01).
- **E0-8. Strona subskrypcji Apple** (MS-B08) wymaga, by kwota do zapłaty była „the most prominent pricing element in the layout”; dotyczy przepływu zakupu subskrypcji. Wobec tekstu ekranu ofert właściciela (rabaty X/Y/Z wobec planu miesięcznego) sprawdzę w E1 także przepisy UE o ogłaszaniu obniżek.

Progi cenowe: „Choose from up to 800 price points by default” (MS-B09). Czy próg 2,49 USD i próg 0 zł istnieją dla Non-Renewing Subscription i Non-Consumable, oraz ile wynosi wpływ (`proceeds`): odczyt punktów cen z App Store Connect API (M1, na sucho) albo [DO USTALENIA] (OP-B03). Kurs NBP dziś: USD 3,8886 (tabela 206/A/NBP/2026 z 2026-10-22, MS-B10).

### Plan
| Etap | Praca | Moduły | Czas agenta | Czekanie / właściciel |
|---|---|---|---|---|
| E1 | StoreKit dla nieodnawialnych (data końca, inne urządzenia, przywracanie, zwrot, przedłużenie przed końcem), co z kodu zostaje; rynek: odczyt dziś cen i modeli ok. 12 aplikacji z tabeli S-28 + oferty kilkumiesięczne, recenzje o twardej ścianie (wzorzec Loaflo); prawo UE o obniżkach i „free”; ceny lokalne PL | `cena-i-rachunek`, `storekit-expo` | ok. 90–120 min | STOP: ok. 10 min; równolegle pytanie OP-B02 do App Review (właściciel) |
| E2 | `rachunek` dla V1, V2, D-038 (pes./norm./opt., wrażliwość: start próby, konwersja, podział planów, powtórne zakupy, dożywotni); bramka `oplacalnosc.mjs` tym samym narzędziem co 345 USD; etyka; tekst ekranu ofert właściciela; rekomendacja | `cena-i-rachunek`, `rachunek` | ok. 90 min | STOP E2: wybór modelu, ok. 20 min |
| E3 | po wyborze: kontrakt płatności w `docs/monetyzacja.md`, aneks ADR-007, wektory dostępu, lista kroków w App Store Connect dla M1; kod dopiero za osobnym poleceniem toru napraw | `storekit-expo` | ok. 60 min | STOP; zapis w ASC tylko M1 za zgodą |

Bez wydatków na API (odczyty `curl`). Runner macOS niepotrzebny do E2.

## Źródła (odczyt 2026-10-22)
| ID | Adres | Miejsce | Cytat | Szczebel |
|---|---|---|---|---|
| MS-B01 | developer.apple.com/app-store/review/guidelines/ („Last Updated: October 16, 2026”) | 3.1.1 | „Non-subscription apps may offer a free time-based trial period before presenting a full unlock option by setting up a Non-Consumable IAP item at Price Tier 0 that follows the naming convention: “XX-day Trial.”” | 1 |
| MS-B02 | jw. | 3.1.2 | „Apps may offer auto-renewable in-app purchase subscriptions, regardless of category on the App Store.” | 1 |
| MS-B03 | developer.apple.com/help/app-store-connect/reference/in-app-purchases-and-subscriptions/in-app-purchase-types | tabela typów | „Non-Renewing Subscription A product that allows users to purchase a service with a limited duration. The content of this In-App Purchase can be static. This type of Subscription does not renew automatically.” | 1 |
| MS-B04 | developer.apple.com/help/app-store-connect/manage-subscriptions/create-non-renewing-subscriptions | uwaga | „Your first non-renewing subscription must be submitted with a new app version.” | 1 |
| MS-B05 | developer.apple.com/help/app-store-connect/configure-in-app-purchase-settings/turn-on-family-sharing-for-in-app-purchases | akapit 1 i uwaga | „Family Sharing is a feature supported only by apps that offer auto-renewable subscriptions and non-consumable In-App Purchases.”; „you can't turn it off” | 1 |
| MS-B06 | developer.apple.com/help/app-store-connect/reference/in-app-purchases-and-subscriptions/in-app-purchase-information | Product ID | „Once a product ID is assigned to an In-App Purchase, it can't be reused for another In-App Purchase within the same app, even if you delete the original In-App Purchase with that ID.” | 1 |
| MS-B07 | developer.apple.com/documentation/storekit/transaction/currententitlements (JSON) | opis | „The latest transaction for each non-renewing subscription, including finished ones” | 1 |
| MS-B08 | developer.apple.com/app-store/subscriptions/ | „Billing amount”, „Free trials” | „the amount that will be billed must be the most prominent pricing element in the layout”; „clearly indicate how long the free trial lasts and the price billed once the free trial is over” | 1 |
| MS-B09 | developer.apple.com/help/app-store-connect/manage-in-app-purchases/set-a-price-for-an-in-app-purchase | akapit 1 | „If the most recent version of this agreement hasn’t been accepted, you can only offer your app for free.”; „Choose from up to 800 price points by default” | 1 |
| MS-B10 | api.nbp.pl/api/exchangerates/rates/a/usd/ | tabela A | 206/A/NBP/2026, 2026-10-22, mid 3,8886 | 1 |

## Otwarte pytania
| ID | Pytanie | Rozstrzyga | Dotyczy |
|---|---|---|---|
| OP-B01 | [DO USTALENIA] status przeglądu `.pro.monthly`, `.pro.yearly`, `.pro.lifetime` w App Store Connect (wysłane do App Review czy nie) | M1 (odczyt na sucho) | E0-4, koszt zmiany |
| OP-B02 | [DO USTALENIA] czy aplikacja z Non-Renewing Subscription i Non-Consumable jest „non-subscription app” w 3.1.1, czyli czy wolno jej dać próbę 0 zł „14-day Trial” | właściciel: pytanie do App Review | V1, V2 |
| OP-B03 | [DO USTALENIA] czy istnieje próg 2,49 USD i próg 0 dla Non-Renewing Subscription / Non-Consumable, wpływ (`proceeds`) progów | M1 (App Store Connect API, odczyt) | rachunek E2 |
| OP-M01 | [DO WYJAŚNIENIA] zapis do Small Business Program (15% zamiast 30%/26%) | właściciel | rachunek |

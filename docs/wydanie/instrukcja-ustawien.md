# Instrukcja ustawień przed wydaniem — Piekarz (iOS 1.0)

Krok po kroku dla właściciela: co ustawić w App Store Connect przed pierwszą wysyłką do recenzji, w tej kolejności. Każdy wiersz ma pole, wartość i źródło (`plik:linia` w repo albo strona Apple z datą odczytu). Wartości na język i sklep są w kartach `docs/wydanie/ustawienia/<kod ASC>.md` (34 karty, indeks `docs/wydanie/ustawienia/README.md`), generowanych poleceniem `npm run karty:ustawien` [M1-audytor-generalny-119].

Zasady tej instrukcji:
- Każde działanie w App Store Connect robi właściciel, za zgodą na to działanie, z wpisem w `docs/wydanie/dziennik.md` (plan: `docs/wydanie/sklep.md`). Instrukcja niczego nie wysyła.
- Bez sekretów i identyfikatorów kont: numer konta, IBAN, dane podatkowe, Team ID, klucze API, hasła kont sandbox — „wpisz swój”, nigdy do repo ani do tego pliku.
- Model płatności jest stały (D-038, DEC-01 d): ta instrukcja tylko go wykonuje.
- Strony Apple przeczytane 2026-10-21; nazwy przycisków sprawdź w dniu klikania (Apple zmienia interfejs).
- Kroki 3 (bez zrzutu z 3.8), 4, 5, 6 i 8 zapisuje też skrypt `scripts/asc-ustawienia.mjs` przez App Store Connect API, z wartościami z `docs/wydanie/asc-ustawienia.json`, `ceny.json` i `storefronty.json` [M1-audytor-generalny-181]. Workflow `.github/workflows/asc-ustawienia.yml` rusza po pushu na gałąź toru p8b i zawsze robi przebieg na sucho (lista „utworzy / zmieni / bez zmian” ze skrótem planu); zapis tylko, gdy `docs/wydanie/asc-zgoda.json` ma `"zapis": true` i skrót listy zatwierdzonej przez właściciela. Klucz API z rolą Admin albo App Manager w sekretach GitHuba. Po scaleniu z master wyzwalacz zmienić na `workflow_dispatch`. Czego API nie ustawi (np. „nowe kraje” przy istniejącej dostępności), skrypt wypisuje jako „ręcznie” z numerem kroku.

## 0. Zanim zaczniesz

| Krok | Pole → wartość | Źródło |
|---|---|---|
| Rola konta | Account Holder (umowa Paid Apps, Small Business Program); reszta: Account Holder, Admin albo App Manager | developer.apple.com/help/app-store-connect/manage-agreements/sign-and-update-agreements (odczyt 2026-10-21) |
| Aplikacja w App Store Connect | istnieje (TestFlight); Bundle ID `com.apps4brew.baker`, wersja 1.0.0 | `app.json:62`, `app.json:5` |
| Primary Language (App Information) | zostaw obecny; Apple pokazuje go tylko tam, gdzie nie ma lokalizacji w języku użytkownika ani storefrontu — po kroku 10 dotyczy to tylko CHN, wyłączonego w kroku 6 | developer.apple.com/help/app-store-connect/manage-app-information/localize-app-information (odczyt 2026-10-21) |
| Blokady wydania | werdykt roli 07 na kandydacie i lista przed wysyłką | `docs/wydanie/sklep.md:28-33` |

## 1. Umowy, podatki i bank

Apple: „To sell your apps on the App Store or offer In-App Purchases, the Account Holder must sign the Paid Apps Agreement.” Bez tej umowy nie da się utworzyć produktów zakupu (krok 3).

| Krok | Pole → wartość | Źródło |
|---|---|---|
| 1.1 Umowa | Business → Agreements → wiersz „Paid Apps” → „View and Agree to Terms” → przeczytaj → Agree (nieodwracalne) | developer.apple.com/help/app-store-connect/manage-agreements/sign-and-update-agreements (odczyt 2026-10-21) |
| 1.2 Podatki | Business → Agreements → „Tax Forms” → „Add Tax Info”; formularz USA obowiązkowy dla wszystkich; poza USA ankieta wskaże W-8BEN (osoba fizyczna) albo W-8BEN-E; wpisz swoje dane; po wysłaniu zmiany tylko przez kontakt z Apple | developer.apple.com/help/app-store-connect/manage-tax-information/provide-tax-information (odczyt 2026-10-21) |
| 1.3 Bank | Business → Agreements → „Bank Accounts” → „Add Bank Account” → kraj banku → waluta konta → numer konta i IBAN: wpisz swój, dokładnie jak w banku | developer.apple.com/help/app-store-connect/manage-banking-information/enter-banking-information (odczyt 2026-10-21) |
| 1.4 Zapis | w dzienniku: data podpisania umowy, „podatki i bank wysłane” (bez numerów) | `docs/wydanie/dziennik.md:1-3` |

## 2. Small Business Program

Apple: „It features a reduced commission rate of 15% on paid apps and Apple In-App Purchases”; warunek: najwyżej 1 mln USD wpływów w poprzednim roku kalendarzowym albo nowy deweloper.

| Krok | Pole → wartość | Źródło |
|---|---|---|
| 2.1 Zapis | developer.apple.com/app-store/small-business-program/ → „Enroll now”; wymaga roli Account Holder i zaakceptowanej umowy Paid Apps (krok 1.1) | developer.apple.com/app-store/small-business-program/ (odczyt 2026-10-21) |
| 2.2 Konta powiązane | „Associated Developer Accounts”: wpisz swoje (zwykle brak); nazwa, Team ID i e-mail konta powiązanego tylko w formularzu Apple | developer.apple.com/app-store/small-business-program/ (odczyt 2026-10-21) |
| 2.3 Skutek | stawka obniżona od 15. dnia po końcu miesiąca fiskalnego, w którym zatwierdzono zapis; rachunek opłacalności liczy 15% (OP-M01) | `docs/sztafeta.md:52` |

## 3. Produkty (grupa subskrypcji i zakup dożywotni)

ID produktów muszą być dokładnie te z kodu, bo aplikacja szuka ich po ID: `src/lib/platnosci/konfiguracja.ts:10-14`.

| Krok | Pole → wartość | Źródło |
|---|---|---|
| 3.1 Grupa subskrypcji | Monetization → Subscriptions → (+) → Reference Name: `Piekarz Pro` → Create | `docs/monetyzacja.md:187`; developer.apple.com/help/app-store-connect/manage-subscriptions/offer-auto-renewable-subscriptions (odczyt 2026-10-21) |
| 3.2 Subskrypcja miesięczna | w grupie „Piekarz Pro” → Create → Reference Name `Piekarz Pro miesięcznie`, Product ID `com.apps4brew.baker.pro.monthly` → Subscription Duration: 1 Month | `src/lib/platnosci/konfiguracja.ts:11` |
| 3.3 Subskrypcja roczna | ta sama grupa → (+) → Reference Name `Piekarz Pro rocznie`, Product ID `com.apps4brew.baker.pro.yearly` → Subscription Duration: 1 Year | `src/lib/platnosci/konfiguracja.ts:12` |
| 3.4 Poziom w grupie | „Edit Order”: obie subskrypcje na tym samym poziomie (ta sama treść, różny okres; Apple: „You can stack subscriptions with equal content but different durations … at the same level”) | developer.apple.com/help/app-store-connect/manage-subscriptions/offer-auto-renewable-subscriptions (odczyt 2026-10-21) |
| 3.5 Zakup dożywotni | Monetization → In-App Purchases → (+) → Non-Consumable → Reference Name `Piekarz Pro dożywotnio`, Product ID `com.apps4brew.baker.pro.lifetime` → Create | `src/lib/platnosci/konfiguracja.ts:13`; developer.apple.com/help/app-store-connect/manage-in-app-purchases/create-consumable-or-non-consumable-in-app-purchases (odczyt 2026-10-21) |
| 3.6 Family Sharing | włącz na trzech produktach (nieodwracalne); przełącznik subskrypcji na stronie subskrypcji („Optionally, enable Family Sharing”); miejsce przełącznika dla Non-Consumable `[DO USTALENIA]` (strona Apple „Turn on Family Sharing…” zwróciła „Page Not Found” 2026-10-21) | `docs/decyzje.md:46`; developer.apple.com/help/app-store-connect/manage-subscriptions/offer-auto-renewable-subscriptions (odczyt 2026-10-21) |
| 3.7 Nazwy wyświetlane i opisy produktów (lokalizacje produktów) | nazwy produktów zakupu na język to zadanie M1 razem z przekładem (nie ma ich w repo) `[DO USTALENIA]`; do tego czasu co najmniej EN i PL: „Baker Pro Monthly / Yearly / Lifetime”, „Piekarz Pro miesięcznie / rocznie / dożywotnio” | `docs/wydanie/widocznosc.md:119` |
| 3.8 Review Information produktu | zrzut ekranu zakupu (`docs/wydanie/zrzuty/en-US/iphone-6.3/`) i jedno zdanie: „Unlocks all features; offered on the purchase screen.” | `docs/app-store-metadata-v2.md:181-188` |
| 3.9 Pierwsza wysyłka produktów | pierwszy Non-Consumable i pierwsza subskrypcja z grupą idą razem z wersją 1.0 w jednej wysyłce (krok 13) | developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-in-app-purchase (odczyt 2026-10-21) |

## 4. Oferty wprowadzające (14 dni)

Apple: „each person is only eligible to redeem one introductory offer per subscription group”. Długości Free Trial dla 1 miesiąca i 1 roku: „3 Days. 1 or 2 Weeks. 1, 2, 3, or 6 Months. 1 Year.” — 14 dni = 2 Weeks.

| Krok | Pole → wartość | Źródło |
|---|---|---|
| 4.1 Miesięczna | subskrypcja `com.apps4brew.baker.pro.monthly` → Subscription Prices → „View all Subscription pricing” → „Set up Introductory Offer” → wszystkie kraje → start: dziś, koniec: bez końca albo najdalsza data → typ Free → 2 Weeks → Confirm | `docs/monetyzacja.md:187`; developer.apple.com/help/app-store-connect/manage-subscriptions/set-up-introductory-offers-for-auto-renewable-subscriptions (odczyt 2026-10-21) |
| 4.2 Roczna | to samo dla `com.apps4brew.baker.pro.yearly`: Free, 2 Weeks, wszystkie kraje | `docs/monetyzacja.md:188` |
| 4.3 Dożywotni | bez oferty | `docs/monetyzacja.md:189` |
| 4.4 Uwaga | oferty po utworzeniu nie da się edytować („delete it and create a new one”); aplikacja nie liczy dni, pokazuje „Try 14 days” tylko uprawnionym (`isEligibleForIntroOfferIOS`) | `docs/app-store-metadata-v2.md:187`; developer.apple.com/help/app-store-connect/manage-subscriptions/set-up-introductory-offers-for-auto-renewable-subscriptions (odczyt 2026-10-21) |

## 5. Ceny

Cena bazowa w USD; storefronty z ceną ręczną według D-038 (`docs/decyzje.md:38`, wartości w `docs/wydanie/ceny.json`); wszystkie pozostałe storefronty: zostaw ceny, które App Store Connect proponuje od ceny bazowej. Apple przy subskrypcjach: „App Store Connect provides comparable prices for all 175 App Store countries and regions, taking into account taxes and foreign exchange rates. If you want to set different prices for specific storefronts, make the changes and click Next.” Przy zakupach jednorazowych: „If you select your own prices, Apple won’t adjust your pricing on those storefronts in the future.” Czy Apple później sam aktualizuje ceny subskrypcji w storefrontach bez ręcznej ceny, strona subskrypcji nie mówi `[DO USTALENIA]`. Kwot w innych walutach nie wyliczamy.

| Storefront | Waluta | Miesięczna | Roczna | Dożywotni | Źródło |
|---|---|---|---|---|---|
| `USA` (bazowy) | USD | 0,99 | 6,99 | 14,99 | `docs/decyzje.md:38` |
| `GBR` | GBP | 0,99 | 6,99 | 14,99 | `docs/decyzje.md:38` → `docs/wydanie/ceny.json:11` |
| `CAN` | CAD | 0,99 | 9,99 | 19,99 | `docs/wydanie/ceny.json:12` |
| `AUS` | AUD | 1,99 | 9,99 | 22,99 | `docs/wydanie/ceny.json:13` |
| `DEU` | EUR | 0,99 | 7,99 | 17,99 | `docs/wydanie/ceny.json:14` |
| `FRA` | EUR | 0,99 | 7,99 | 17,99 | `docs/wydanie/ceny.json:15` |
| `ESP` | EUR | 0,99 | 7,99 | 17,99 | `docs/wydanie/ceny.json:16` |
| `MEX` | MXN | 19 | 149 | 299 | `docs/wydanie/ceny.json:17` |
| `POL` | PLN | 4,99 zł | 29,99 zł | 79,99 zł | `docs/decyzje.md:38`; `docs/monetyzacja.md:187-189` |

| Krok | Pole → wartość | Źródło |
|---|---|---|
| 5.1 Subskrypcje | subskrypcja → Subscription Prices → „Add Subscription Price” → kraj: United States, cena z tabeli → Next → na liście 175 cen zmień tylko storefronty z tabeli → Next → Confirm; osobno dla miesięcznej i rocznej | developer.apple.com/help/app-store-connect/manage-subscriptions/manage-pricing-for-auto-renewable-subscriptions (odczyt 2026-10-21) |
| 5.2 Dożywotni | In-App Purchase → Price Schedule → „Add Pricing” → base country: United States, 14,99 USD → Next → zmień tylko storefronty z tabeli → Next → Confirm | developer.apple.com/help/app-store-connect/manage-in-app-purchases/set-a-price-for-an-in-app-purchase (odczyt 2026-10-21) |
| 5.3 Brak kwoty na liście | jeśli kwoty z tabeli nie ma wśród punktów cenowych („See Additional Prices”), nie wybieraj innej: wpis w dzienniku i pytanie do roli 02 | `docs/decyzje.md:39` |
| 5.4 Po ustawieniu | wpis `wplyw_z_asc` (wpływy dla progu) w rachunku roli 02 | `docs/monetyzacja.md:180` |

## 6. Dostępność krajów

| Krok | Pole → wartość | Źródło |
|---|---|---|
| 6.1 Aplikacja | Pricing and Availability → App Availability → „Set Up Availability” → „Specific Countries or Regions” → zaznacz wszystkie poza „China mainland” → zaznacz pole „nowe kraje w przyszłości” → Next → Confirm (174 storefronty) | `docs/decyzje.md:174`; developer.apple.com/help/app-store-connect/manage-your-apps-availability/manage-availability-for-your-app-on-the-app-store (odczyt 2026-10-21) |
| 6.2 Dlaczego bez CHN | Apple: MIIT „requires that some apps possess a valid Internet Content Provider (ICP) Filing Number”; czy dotyczy aplikacji bez sieci `[DO USTALENIA]` | developer.apple.com/help/app-store-connect/reference/app-information/app-information (odczyt 2026-10-21) |
| 6.3 Produkty | subskrypcje: sekcja „Availability” każdej subskrypcji — te same kraje co aplikacja | developer.apple.com/help/app-store-connect/manage-subscriptions/offer-auto-renewable-subscriptions (odczyt 2026-10-21) |

## 7. Prywatność (App Privacy, Privacy Policy URL)

| Krok | Pole → wartość | Źródło |
|---|---|---|
| 7.1 Ankieta | App Privacy → Get Started → „No, we do not collect data from this app” → Save → Publish; strona produktu pokaże „Data Not Collected” | `docs/app-store-metadata-v2.md:171-175`; developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy (odczyt 2026-10-21) |
| 7.2 Podstawa „No” | brak kodu sieciowego (`fetch`, `XMLHttpRequest`, `WebSocket`) w kodzie aplikacji, test w `npm test`; zakupy obsługuje StoreKit, a Apple: „You are not responsible for disclosing data collected by Apple” | `tests/public-repo.test.ts:137-140`; developer.apple.com/app-store/app-privacy-details/ (odczyt 2026-10-21) |
| 7.3 Privacy Policy URL | App Information, w każdym języku: `https://apps4brew.com/piekarz/privacy.html` (kod 200 przy odczycie 2026-10-21) | `src/lib/links.ts:6` |
| 7.4 Support URL | wersja 1.0, w każdym języku: `https://apps4brew.com/piekarz/support.html` (kod 200, 2026-10-21); strona podaje e-mail support@apps4brew.com; Apple: adres ma prowadzić do danych kontaktowych „(legal address, email address, telephone number), as may be required by local law” — adres i telefon `[DO USTALENIA]` (status tradera DSA, decyzja właściciela) | `src/lib/links.ts:7`; `site/support.html:53`; developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information (odczyt 2026-10-21) |
| 7.5 Licencja | „License Agreement”: standardowa Apple EULA (bez własnej) | `src/lib/links.ts:12` |

## 8. Kategoria wiekowa

App Information → Age Ratings → „Set Up Age Ratings”. Apple wylicza wiek z odpowiedzi; odpowiedzi według treści (D-058, warunkowa).

| Kategoria Apple | Odpowiedź | Źródło |
|---|---|---|
| In-App Controls (Parental Controls, Age Assurance) | brak | `docs/decyzje.md:181` |
| Capabilities: Unrestricted Web Access | No (aplikacja bez sieci i przeglądarki) | `tests/public-repo.test.ts:137-140` |
| Capabilities: User-Generated Content, Social Media, Messaging and Chat | No (dane tylko na telefonie, bez publikacji) | `docs/app-store-metadata-v2.md:172-175` |
| Capabilities: Advertising | No | `docs/app-store-metadata-v2.md:172-175` |
| Mature Themes (Profanity, Horror, Alcohol/Tobacco/Drug Use) | None; zapach alkoholu nad zakwasem („hooch”) to opis zakwasu, nie spożycia | `src/lib/i18n-en/czesc-3.ts:165` |
| Medical or Wellness | None (Doktor Chleba diagnozuje wady bochenka, nie zdrowie) | `docs/app-store-metadata-v2.md:139-145` |
| Sexuality or Nudity | None | `docs/decyzje.md:181` |
| Violence: Guns or Other Weapons | Infrequent — nóż i żyletka do nacinania jako narzędzia; Apple: „objects that may cause bodily harm. May include: guns, swords, or knives” `[DO USTALENIA]` | `src/lib/i18n-en/czesc-8.ts:80`; developer.apple.com/help/app-store-connect/reference/app-information/age-ratings-values-and-definitions (odczyt 2026-10-21) |
| Pozostała Violence, Chance-Based Activities (Gambling, Contests, Loot Boxes) | None | `docs/decyzje.md:181` |
| Age Categories and Override | Not Applicable; oczekiwany wynik 9+ (z „Infrequent guns or other weapons”); wynik zapisz w dzienniku | developer.apple.com/help/app-store-connect/manage-app-information/set-an-app-age-rating (odczyt 2026-10-21) |

## 9. Eksport kryptografii

Apple: „Update your app’s information property list (Info.plist) file in Xcode so that you don’t need to answer encryption questions with each app submission” — dotyczy scenariusza „No export compliance documentation required”.

| Krok | Pole → wartość | Źródło |
|---|---|---|
| 9.1 Info.plist | `ITSAppUsesNonExemptEncryption = false` już w konfiguracji; App Store Connect nie zada pytań przy buildzie | `app.json:68` |
| 9.2 Podstawa | aplikacja nie przesyła danych (brak sieci) i nie ma własnej kryptografii; zależność `expo-crypto` jest w `package.json`, ale kod `app/` i `src/` jej nie importuje (znalezisko 10-wydanie-119-03) | `tests/public-repo.test.ts:137-140`; `package.json:46` |
| 9.3 Gdy App Store Connect jednak zapyta | odpowiedz zgodnie z 9.2 („None of the algorithms mentioned above” / brak szyfrowania); zgłoś rozjazd roli 10 | developer.apple.com/help/app-store-connect/manage-app-information/overview-of-export-compliance (odczyt 2026-10-21) |

## 10. Metadane i zrzuty na lokalizację (karty)

34 lokalizacje strony (D-054) — każda ma kartę `docs/wydanie/ustawienia/<kod ASC>.md` z polami gotowymi do skopiowania, licznikiem znaków albo bajtów, storefrontami, w których lokalizacja jest domyślna, ścieżkami zrzutów, cenami i statusem pomiaru. Karty robi `npm run karty:ustawien` z `docs/wydanie/metadane/` (kontrola `npm run check:metadane`).

| Krok | Pole → wartość | Źródło |
|---|---|---|
| 10.1 Kolejność | najpierw `en-US` i `pl`, potem pozostałe 32 według indeksu kart; każdy język wysyłasz z buildem, który ma ten język (wszystkie 34 są released) | `docs/app-store-metadata-v2.md:227`; `docs/decyzje.md:153` |
| 10.2 Dodanie języka | menu języka w prawym górnym rogu → „Not Localized” → język → (+); App Information: nazwa, podtytuł, Privacy Policy URL; wersja 1.0: słowa kluczowe, tekst promocyjny, opis, Support URL, zrzuty | developer.apple.com/help/app-store-connect/manage-app-information/localize-app-information (odczyt 2026-10-21) |
| 10.3 Limity | nazwa 2–30 znaków, podtytuł 30, tekst promocyjny 170, opis 4000, słowa kluczowe 100 bajtów (każde > 2 znaki) | developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information (odczyt 2026-10-21) |
| 10.4 „Co nowego” | nie wpisuj w 1.0: „This property isn’t available for the first version of the app” | developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information (odczyt 2026-10-21) |
| 10.5 Zrzuty | 7 ramek w kolejności D-055 na klasę: iPhone 6,9″ 1320 × 2868 i 6,3″ 1206 × 2622 (wymagana: „At least one screenshot for iPhone with Dynamic Island (medium display)”); iPad nie dotyczy | `docs/wydanie/zrzuty/README.md:9-12`; developer.apple.com/help/app-store-connect/reference/screenshot-specifications (odczyt 2026-10-21) |
| 10.6 Gdzie są pliki | `pl`, `en-US`, `nl-NL`: `docs/wydanie/zrzuty/<kod>/`; pozostałe 31: lokalnie `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/<kod>/` (poza gitem); brak: polecenie z README zrzutów | `docs/wydanie/zrzuty/README.md:15-25` |
| 10.7 Kategoria (raz) | App Information → Primary Category: Food & Drink; Secondary Category: Productivity | `docs/decyzje.md:162`; `docs/15-app-store.md:15-16` |
| 10.8 Weryfikacja natywna | nazwy sl, ms, el, ru (D-053) oraz nazwy pod ikoną bg, et, lt, lv, sr (rola 09, języki bez lokalizacji sklepu) sprawdza osoba mówiąca językiem przed wysyłką; oznaczone w kartach | `docs/wydanie/widocznosc.md:122` |
| 10.9 Copyright | wersja 1.0 → Copyright: „2026 <twoje imię i nazwisko albo firma>” (znak © dodaje Apple) | developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information (odczyt 2026-10-21) |

## 11. App Review (notatki, kontakt, zakupy w wersji)

| Krok | Pole → wartość | Źródło |
|---|---|---|
| 11.1 Notes | wersja 1.0 → App Review Information → Notes: skopiuj blok `text` z §4.3 (po angielsku, według dzisiejszych ekranów: 4 zakładki, Ustawienia z „Today”, import arkuszem „Import from File” → „Replace Data”); limit 4000 bajtów | `docs/app-store-metadata-v2.md:190-222`; developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information (odczyt 2026-10-21) |
| 11.2 Sign-in required | odznaczone (aplikacja bez logowania i konta) | `docs/app-store-metadata-v2.md:197` |
| 11.3 Contact | imię, e-mail i telefon w formacie międzynarodowym (+48…): wpisz swoje; nie trafiają do repo | developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information (odczyt 2026-10-21) |
| 11.4 Zakupy w wersji | przy wysyłce dodaj do tej samej submission: grupę „Piekarz Pro”, obie subskrypcje i Non-Consumable (krok 3.9) | developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-in-app-purchase (odczyt 2026-10-21) |
| 11.5 Opcja wydania | „Manually release this version” | `docs/wydanie/sklep.md:69` |

Dawny identyfikator zespołu w dokumencie wydania: `docs/15-app-store.md:45` ma przykład 10-znakowego identyfikatora w opisie sekretu CI (znalezisko 10-wydanie-021, nie zmieniane w tym zadaniu); czy to identyfikator konta właściciela, `[DO USTALENIA]` — potwierdza właściciel.

## 12. TestFlight i sandbox StoreKit

| Krok | Pole → wartość | Źródło |
|---|---|---|
| 12.1 Build | workflow „TestFlight (Piekarz)” → „Run workflow” na master albo tag `v*`; numer buildu nadaje workflow | `docs/TESTFLIGHT_DEPLOYMENT.md:72-83`; `docs/wydanie/sklep.md:14` |
| 12.2 Test Information | TestFlight → Test Information: opis bety, e-mail na uwagi (support@apps4brew.com), co testować: lista z §4 dokumentu wydania | `docs/15-app-store.md:28-37`; developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview (odczyt 2026-10-21) |
| 12.3 Testerzy | wewnętrzni (do 100), potem zewnętrzni (do 10 000); pierwszy build dla grupy zewnętrznej przechodzi review TestFlight; build ważny 90 dni | developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview (odczyt 2026-10-21) |
| 12.4 Konto sandbox | Users and Access → Sandbox → (+) → imię, nowy adres e-mail (nieużywany jako Apple Account), hasło: wpisz swoje, poza repo; storefront: Poland, drugie konto: United States | developer.apple.com/help/app-store-connect/test-in-app-purchases/create-a-sandbox-apple-account (odczyt 2026-10-21) |
| 12.5 Scenariusze | zakup każdego planu, „Try 14 days” tylko dla uprawnionego konta, ponowna instalacja, tryb samolotowy po zakupie, przywrócenie na drugim urządzeniu, zwrot, Family Sharing, Ask to Buy, karencja, uprzedzenie 3 dni, wygaśnięcie w trakcie wypieku, „Manage Subscription”; wynik z datą i buildem do roli 07 | `docs/monetyzacja.md:245-246` |
| 12.6 Ceny w sandboksie | zmiany produktów widać w sandboksie po czasie: „It may take up to 1 hour for changes you make to product metadata to appear in the sandbox environment”; czy zakupy w buildzie TestFlight idą przez sandbox, strony z tego odczytu nie mówią `[DO USTALENIA]` | developer.apple.com/help/app-store-connect/manage-subscriptions/set-up-introductory-offers-for-auto-renewable-subscriptions (odczyt 2026-10-21) |

## 13. Wysyłka do recenzji i wydanie

| Krok | Pole → wartość | Źródło |
|---|---|---|
| 13.1 Lista przed wysyłką | build = SHA z werdyktu 07, `npm run check:metadane` i `npm run karty:ustawien -- --sprawdz` z kodem 0, adresy kod 200, notatki, produkty w submission, zgoda właściciela w dzienniku | `docs/wydanie/sklep.md:28-33` |
| 13.2 Wysyłka | wersja 1.0 → wybierz build → „Add for Review” → w tej samej submission produkty z kroku 11.4 → „Submit for Review” | developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-in-app-purchase (odczyt 2026-10-21) |
| 13.3 Wydanie | po „Pending Developer Release”: „Release This Version” za osobną zgodą w dzienniku; 1.0 bez wydania stopniowego | `docs/wydanie/sklep.md:70`; `docs/wydanie/sklep.md:36` |

## Źródła Apple (odczyt 2026-10-21)

Surowy tekst stron pobrany `curl` (kod 200) i przeczytany; cytaty w krokach wyżej są dosłowne z tego odczytu.

| Strona | Co potwierdza | Źródło |
|---|---|---|
| Sign and update agreements | umowa Paid Apps przed sprzedażą i zakupami | developer.apple.com/help/app-store-connect/manage-agreements/sign-and-update-agreements (odczyt 2026-10-21) |
| Provide tax information; Enter banking information | formularz podatkowy USA dla wszystkich; bank po umowie i podatkach | developer.apple.com/help/app-store-connect/manage-tax-information/provide-tax-information (odczyt 2026-10-21) |
| App Store Small Business Program | 15%, próg 1 mln USD, zapis przez Account Holder | developer.apple.com/app-store/small-business-program/ (odczyt 2026-10-21) |
| Offer auto-renewable subscriptions | grupa, poziomy, Family Sharing subskrypcji, pierwsza subskrypcja z wersją | developer.apple.com/help/app-store-connect/manage-subscriptions/offer-auto-renewable-subscriptions (odczyt 2026-10-21) |
| Set up introductory offers | Free Trial 2 Weeks, jedna oferta na grupę | developer.apple.com/help/app-store-connect/manage-subscriptions/set-up-introductory-offers-for-auto-renewable-subscriptions (odczyt 2026-10-21) |
| Manage pricing for auto-renewable subscriptions; Set a price for an In-App Purchase | ceny porównywalne w 175 storefrontach, ręczne storefronty bez automatycznej korekty | developer.apple.com/help/app-store-connect/manage-in-app-purchases/set-a-price-for-an-in-app-purchase (odczyt 2026-10-21) |
| Manage availability; App information (China mainland) | 175 storefrontów, wybór krajów, ICP | developer.apple.com/help/app-store-connect/manage-your-apps-availability/manage-availability-for-your-app-on-the-app-store (odczyt 2026-10-21) |
| Manage app privacy; App privacy details | „No, we do not collect data from this app”; dane zbierane przez Apple poza deklaracją | developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy (odczyt 2026-10-21) |
| Set an app age rating; Age ratings values and definitions | ankieta, kategorie, wartości 4+/9+ | developer.apple.com/help/app-store-connect/reference/app-information/age-ratings-values-and-definitions (odczyt 2026-10-21) |
| Overview of export compliance | Info.plist bez pytań przy każdej wersji | developer.apple.com/help/app-store-connect/manage-app-information/overview-of-export-compliance (odczyt 2026-10-21) |
| Platform version information; Localize app information; Screenshot specifications; App Store localizations | limity pól, „Co nowego” niedostępne w 1.0, dodawanie języka, klasy zrzutów, mapa storefrontów | developer.apple.com/help/app-store-connect/reference/app-store-localizations (odczyt 2026-10-21) |
| TestFlight overview; Overview of testing in sandbox; Create a Sandbox Apple Account | testerzy, 90 dni, konta sandbox | developer.apple.com/help/app-store-connect/test-in-app-purchases/overview-of-testing-in-sandbox (odczyt 2026-10-21) |
| Submit an In-App Purchase | pierwszy zakup danego typu z nową wersją | developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-in-app-purchase (odczyt 2026-10-21) |

## Otwarte `[DO USTALENIA]`

| Sprawa | Kto | Źródło |
|---|---|---|
| Czy Apple sam aktualizuje ceny subskrypcji w storefrontach bez ręcznej ceny (strona subskrypcji milczy) | właściciel, przy ustawianiu cen | developer.apple.com/help/app-store-connect/manage-subscriptions/manage-pricing-for-auto-renewable-subscriptions (odczyt 2026-10-21) |
| Miejsce przełącznika Family Sharing dla Non-Consumable | właściciel w App Store Connect | `docs/decyzje.md:46` |
| ICP dla CHN (D-057) | właściciel / rola 10 | `docs/decyzje.md:174` |
| „Guns or Other Weapons” i wynik wieku (D-058) | rola 10 po ankiecie | `docs/decyzje.md:181` |
| Adres i telefon na stronie wsparcia (status tradera DSA) | właściciel | `site/support.html:53` |
| Nazwy produktów zakupu na 35 języków | M1 / rola 09 | `docs/wydanie/widocznosc.md:119` |
| Czy zakupy w buildzie TestFlight idą przez sandbox | rola 10 | `docs/monetyzacja.md:246` |
| Sposób liczenia znaków przez Apple (punkty kodowe czy jednostki UTF-16) | rola 10 | `scripts/sprawdz-metadane.mjs:15` |

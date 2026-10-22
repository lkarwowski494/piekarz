# Badanie zmiany modelu płatności: V1, V2 wobec D-038 (Piekarz)
Stan: E2c (STOP, V3 wg wzorca portfela) · Aktualizacja: 2026-10-22 · Rola 02 build, moduły `cena-i-rachunek`, `storekit-expo` · Otwarcie: D-110 · Gałąź `monetyzacja/piekarz-2026-10-22` od master 49ab67a

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

### Odpowiedzi na STOP E0 (przez M1, 2026-10-22)
- P1 (E1 według planu): tak. M1 na podstawie zgody trwałej właściciela: „Ok, musze sie oddalic, podejmuj decyzje zgodnie z rekomendacja az nie zmienie decyzji.”
- P4 / OP-M01: Small Business Program aktywny, prowizja 15%. Właściciel 2026-10-21 o umowie Paid Apps, danych podatkowych i bankowych oraz programie: „to juz jest wszystko completed lacznie z aprobatami apple.”
- P2 / OP-B02: właściciel, dosłownie: „Moge wyslac pytanie do help” (2026-10-22, przez M1): wysyła pytanie niżej przez App Store Connect (Contact Us). Odpowiedź M1 przekaże dosłownie.
- Właściciel o faktach E0-3…E0-5 (2026-10-22, przez M1), dosłownie: Family Sharing tylko dla dożywotniego — „ok, to na nasza korzysc”; spalone ID — „ok, zadna strata”; próba 3.1.1 — „ok, to sprawdzi pierwsza aplikacja”; zmiana przed 1.0 — „tak to prawda, na razie oceniamy i nie zmieniamy kodu.”
- P3 / OP-B01, OP-B03: czekają na M1 (odczyt na sucho skryptem `scripts/asc-ustawienia.mjs` albo workflow).

### Pytanie do App Review (OP-B02, do wysłania przez właściciela)
Formularz: App Store Connect → Help / Contact Us → App Review. Treść:

> Subject: Guideline 3.1.1 free trial in an app with Non-Renewing Subscriptions only
>
> Hello,
>
> Our app Piekarz (bundle ID com.apps4brew.baker) is an offline sourdough baking assistant. It is in TestFlight and has not been released yet. We plan to sell access without any automatic renewal:
> - a Non-Consumable In-App Purchase at Price Tier 0 named "14-day Trial", which unlocks all features for 14 days,
> - Non-Renewing Subscriptions for 1 month and 1 year (possibly also 3 months),
> - a Non-Consumable lifetime unlock.
>
> The app would offer no auto-renewable subscriptions.
>
> Question: Does an app that sells only Non-Renewing Subscriptions and Non-Consumable items count as a "non-subscription app" under guideline 3.1.1, so that it may offer this free 14-day trial?
>
> Before the trial starts, the app would state its length, what stops working when it ends (the user keeps read access to their history and all their data, including export), and the prices of the paid options.
>
> Thank you.

## E1: dowody

### StoreKit 2 i adapter Piekarza dla zakupów nieodnawialnych
| Sprawa | Fakt (źródło) | Skutek dla V1/V2 |
|---|---|---|
| Co widzi aplikacja | `currentEntitlements`: „The latest transaction for each non-renewing subscription, including finished ones” (MS-B07); „Products that the App Store has refunded or revoked don’t appear” (tamże) | dostęp = zakup nieodnawialny z `purchaseDate` + długość planu; zakończone trzeba odfiltrować w aplikacji |
| Data końca | `expirationDate`: „The date the subscription expires or renews” (MS-B11); dokumentacja nie mówi, czy pole jest wypełniane dla nieodnawialnej: [DO USTALENIA] w sandboksie (OP-B04). Długości nieodnawialnej nie ustawia się w App Store Connect (MS-B04: tylko nazwa, ID, cena, lokalizacje) | długość planu definiuje aplikacja (stała w `konfiguracja.ts`, np. 30 / 91 / 365 dni) i musi ją podać przed zakupem; adapter liczy `transactionDate + długość`, a `expirationDate` traktuje tylko jako kontrolę |
| Przedłużenie przed końcem | tylko **ostatnia** transakcja danego produktu jest w `currentEntitlements` (MS-B07); `Transaction.all` wymienia konsumpcyjne, niekonsumpcyjne, odnawiane i Family Sharing, a nieodnawialnych nie wymienia (MS-B12) | drugi zakup tego samego planu przed końcem „zjada” resztę pierwszego: koniec liczony od nowego zakupu, a pozostałe dni nie dają się odtworzyć ze sklepu na nowym telefonie. **Ryzyko realne** (płacący traci dni). Opcje na E2: (a) zakup czasowy niedostępny, gdy trwa inny plan czasowy, z datą końca na ekranie; (b) dozwolony od N dni przed końcem z jawnym „nowy okres liczy się od dziś”; (c) liczyć sumę z lokalnego zapisu (źródłem prawdy nie jest sklep: odrzucam, zasada roli 7) |
| Inne urządzenia, ponowna instalacja | `AppStore.sync()`: „When users reinstall your app or download it on a new device, the app automatically has all transactions available to it upon initial launch” (MS-B13); `Transaction.updates` emituje też zakupy „on another device” (MS-B14) | jak dziś: bez osobnego mechanizmu; to, czy nieodnawialna dociera na drugie urządzenie tym kanałem, sprawdzić w sandboksie (OP-B04) |
| Przywracanie | `AppStore.sync()` „only in response to an explicit user action” (MS-B13) | bez zmian (przycisk już jest) |
| Zwrot | zwrócone znikają z `currentEntitlements` (MS-B07); `revocationDate` (MS-B15) | bez zmian w logice; dane zostają |
| Próba 3.1.1 | Non-Consumable 0 zł: transakcja na zawsze w `currentEntitlements` (MS-B07) | koniec = `purchaseDate` + 14 dni; ponowna instalacja nie odnawia próby (dobrze); Family Sharing dla próby wyłączyć (inaczej rodzina dostaje próbę z cudzą datą) |
| Biblioteka | `expo-iap` 6.1.1 → `openiap` 4.0.3 (`OpenIapStoreKitModule.swift:648–668`): `onlyIncludeActiveItemsIOS=true` czyta `currentEntitlements` i pomija transakcję tylko, gdy `expirationDate <= now`; `transactionDate` = `purchaseDate`, typ `non-renewing-subscription` w `ProductTypeIOS` (`StoreKitTypesBridge.swift:248`, `types.ts:1197`) (MS-B16) | wywołanie zostaje; zmienia się mapowanie w `sklep.ts` (dziś odrzuca subskrypcję bez daty końca, `sklep.ts:50`) |

Co z obecnego kodu zostaje: `dostep.ts` (decyzja z pamięcią i błędem odczytu: bez zmian, bo `wygasa` liczy adapter), pamięć `platnosci_pamiec`, przywracanie, nasłuch `Transaction.updates`, `ekran.ts`, Non-Consumable dożywotni. Zmienia się: `konfiguracja.ts` (nowe ID, długości planów, próba), `sklep.ts` (mapowanie nieodnawialnych i próby, zakup `type: 'in-app'` zamiast `'subs'`, koniec oferty wprowadzającej i karencji), `uprzedzenie.ts` (koniec próby i każdego planu, bez gałęzi „pobierzemy”), `showManageSubscriptionsIOS` przestaje być potrzebne. Szacunek wielkości: [OCENA] 1–2 dni pracy agenta z testami wektorów, plus test w sandboksie (krok właściciela).

Zakwas wobec długości (RD-24, S-44: założenie zwykle 7–10 dni): próba 14 dni i plan 30 dni mieszczą założenie; plan miesięczny wygasa w trakcie życia zakwasu, który trwa miesiącami. Po wygaśnięciu przypomnienia o dokarmianiu ustają (D-039, BR-ZAK-004). W D-038 subskrypcja odnawia się sama, więc ten moment zdarza się rzadko; w V1/V2 zdarza się po każdym zakupie czasowym. **Ryzyko realne dla żywego zakwasu:** opcje na E2 (przypomnienia o dokarmianiu istniejących zakwasów zawsze darmowe; ostatnie przypomnienie z informacją; bez zmian).

### Rynek (odczyt 2026-10-22, MS-B20)
Odczyt subagenta (lookup `itunes.apple.com` US/PL, karty `apps.apple.com`, RSS recenzji), sprawdzony próbką w surowym HTML: Rise „3 Month Subscription $8.99”, Loaflo „Weekly $6.99 / Monthly $19.99 / Yearly $39.99”. Raport, surowe pliki i skrypty: `audit/02-badanie-modelu-2026-10-22/rynek/` (poza gitem).

- **Ceny wobec 2026-10-19:** bez zmian w 9 z 10 aplikacji tabeli (Rise, Loaflo, Flourwise, Yeasta, SST, BreadMe, Gluten Morgen, Levain, Leaven). Kneady US: nowy próg „Monthly $2.99”, jeden z dwóch „Annual $29.99” zniknął (test cen albo inny odczyt listy: [DO USTALENIA]). Modele bez zmian.
- **Przepustki czasowe bez odnawiania („30-day pass”, „1 month access”): 0 znalezionych** w 14 frazach wyszukiwania i ok. 20 kartach z odczytanymi nazwami zakupów. To nie dowód, że ich nie ma, ale V1/V2 byłyby w tej niszy wyróżnikiem, a nie kopią rynku. Ryzyko odwrotne: brak dowodu, że użytkownicy kupują przepustki (WTP dla tej formy: H).
- **Plany 3-miesięczne:** Rise 8,99 USD, Kneady „Quarterly” 12,99 USD (opis Kneady: „auto-renewing”; Rise: „flexible purchase options”, odnawianie [DO USTALENIA]). Kotwica 3-mies. istnieje u 2 z ok. 20 aplikacji.
- **Dożywotnie i jednorazowe:** Flourwise 59,99, Yeasta 69,99, SST 12,99, Autolyse 6,99 („ONCE, FOREVER”), StarterLog 3,99, Pizza Logic 4,99, BreadMath 4,99 USD; obok subskrypcji: Bakerate 39,99, Crumb 39,99, Sourdough Baby 99,99, Sourflow 119 USD. Dożywotni Piekarza 14,99 USD jest w dolnej części tego zakresu.
- **Próby:** LoafNote i Sourflow miesiąc, breadly 14 dni, Sourdough Baby 7 dni, Crumb 3 dni (mechanizm z opisów; czy oferta wprowadzająca, nie sprawdzano).
- **Recenzje (próbka 253 wpisów z RSS, 2026-10-22):** Loaflo 16 z 28 wpisów ma motyw płatności, 15 z nich ≤ 3★ (ściana/subskrypcja/cena 8, subskrypcja nieujawniona 4, anulowanie/zwrot 4, brak próby 3, odliczanie 2); ostatnie skargi na nieujawnioną subskrypcję z odliczaniem 2026-04-07, od kwietnia do października 1 z 4 wpisów o płatności. Próba zamieniona w opłatę wprost: 0 z 28. Rise „worth it” 2 z 43; Kneady przepisy za ścianą 3 z 17 (4★); SST „worth it” przy zakupie jednorazowym 1 z 8; Yeasta zakup bez odblokowania 1 z 5; Gluten Morgen reklamy 3 z 85. Próśb o lifetime: 0 z 253. RSS PL i GB dla głównych aplikacji pusty. To zliczenie motywów (szczebel 5), nie skala.

Wnioski E1 (hipotezy dla E2):
- **H-B1:** skargi niszy dotyczą ukrycia i trudnego anulowania, nie samej subskrypcji (Loaflo). V1/V2 usuwają mechanizm skargi u źródła; D-038 broni się jawnością (ujawnienia 1–8 w `docs/monetyzacja.md`). Dowód: R, słaby (próbka 28, jedna aplikacja).
- **H-B2:** wpływ V1/V2 na przychód zależy od powtórnych zakupów bez odnawiania; rynek nie daje żadnego punktu odniesienia (0 przepustek). W rachunku E2 jako [OCENA] z szerokim przedziałem.
- **H-B3:** dożywotni ma rynek (11 aplikacji z zakupem jednorazowym), więc w V1/V2 jego udział prawdopodobnie rośnie (brak automatycznego przedłużenia przepycha długo korzystających do dożywotniego). [OCENA] w E2.
- **WTP funkcji:** bez zmian wobec tabeli z 2026-10-19 (`docs/monetyzacja.md`, 50 BR); zmiana modelu nie zmienia, za co się płaci. Funkcje z przebudowy M3 (kilka wypieków, kalendarz) poza tym badaniem; ich WTP dla roli 03 osobno.
- **Sprzeczności z wejściem roli 01:** brak (ER niepotrzebne).

### Prawo o ogłaszaniu obniżek i „za darmo” (tekst ekranu ofert właściciela)
| Sprawa | Źródło (odczyt 2026-10-22) | Wniosek |
|---|---|---|
| Dyrektywa o podawaniu cen (obniżki) | 98/6/WE art. 6a ust. 1: „W każdym ogłoszeniu o obniżce ceny podaje się wcześniejszą cenę stosowaną przez podmiot gospodarczy przez określony okres przed zastosowaniem obniżki ceny.” (MS-B17) | dotyczy obniżki ceny tego samego produktu |
| Zakres 98/6/WE | wytyczne Komisji 2021/C 526/01, pkt 1.2.5: „dyrektywa w sprawie podawania cen ma zastosowanie wyłącznie do dóbr materialnych, a nie do usług i treści cyfrowych” (MS-B18) | plan w aplikacji nie podlega art. 6a |
| Porównanie z inną ceną | tamże, pkt 2.8.2: przedsiębiorcy muszą „wyraźnie poinformować konsumenta, że wskazana cena referencyjna jest ceną porównawczą, a nie obniżką ceny stosowanej uprzednio” (MS-B18) | „X% taniej niż 3 × miesięczny” wolno, jako porównanie nazwane wprost; bez przekreślonej ceny i bez słowa „rabat/discount” |
| Polska | ustawa o informowaniu o cenach towarów i usług (t.j. Dz.U. 2023 poz. 168) art. 4 ust. 2: „W każdym przypadku informowania o obniżeniu ceny towaru lub usługi … uwidacznia się również informację o najniższej cenie tego towaru lub tej usługi, która obowiązywała w okresie 30 dni przed wprowadzeniem obniżki” (MS-B19) | w Polsce obejmuje także usługi; „rabat” na planie, którego cena nigdy nie była wyższa, to ogłoszenie obniżki bez wcześniejszej ceny: **ryzyko realne**, gdy tekst mówi „discount” |
| „Za darmo” | 2005/29/WE zał. I pkt 20 (wzorce roli, odczyt 18.10.2026) | V1/V2: próba bez przyszłej opłaty jest naprawdę darmowa; D-038: „free” wymaga dopowiedzenia o odnowieniu |
| Najwyraźniejsza kwota | MS-B08 („most prominent pricing element”) | kwota do zapłaty (0,99 / 2,49 / 6,99 / 14,99) większa niż procent porównania |

Ocena propozycji tekstu właściciela (do roli 04/06, tekstów nie piszę):
- „We will never charge you with a subscription that you forgot to cancel” — prawdziwe w V1/V2, bo nie ma produktu odnawianego; obietnica trwała tylko, dopóki aplikacja nie doda subskrypcji odnawianej. Jeśli zostanie, należy ją zapisać jako regułę modelu (decyzja na E2). W D-038 to zdanie byłoby nieprawdziwe.
- „pay 0.99 now and keep all features for another 30 days” — zgodne z V1, jeśli plan ma 30 dni (długość ustala aplikacja, nie Apple: wyżej).
- X = 16% (2,49 wobec 3 × 0,99 = 2,97), Y = 41% (6,99 wobec 12 × 0,99 = 11,88): rachunek zgodny; podać jako porównanie („16% less than 3 monthly passes”), nie jako rabat (MS-B18, MS-B19).
- Z (dożywotni): jednej uczciwej liczby nie ma, bo zależy od horyzontu; „zwraca się po 15 miesiącach” (14,99 / 0,99 = 15,1) jest sprawdzalne i nie udaje rabatu.
- Metafora „just friends / husband/wife material / marry us”: płciowa para „husband/wife”, w 35 językach przekład dosłowny może brzmieć dwuznacznie albo wykluczająco; rozstrzyga rola 04 z 06 (ton) i przekład. Zgłaszam jako ryzyko, nie oceniam stylu.

### Tekst ekranu ofert wybrany przez właściciela (2026-10-22, przez M1; zastępuje „test us … marry us”)
Dosłownie: „Uzupełnienie zlecenia od właściciela (2026-10-22): wybrany tekst ekranu ofert, zastępuje wcześniejszy „test us … marry us”. Rabat dożywotniego bez procentu.
Nagłówek: „No subscriptions. Nothing renews by itself. You’ll never be charged for something you forgot to cancel. Choose the time that fits you:”
30 dni · 0,99 USD: „Still finding my rhythm” / „One more month to get to know [nazwa aplikacji].”
3 mies. · 2,49 USD: „One season of baking” / „Save 16%.”
1 rok · 6,99 USD: „Baking is part of my week” / „A whole year of bakes. Save 41%.”
Na zawsze · 14,99 USD: „Baking is my life” / „Pay once, keep it forever. Pays for itself after 15 months.”
Do oceny u źródła w E2/E3: jak wyżej; dodatkowo jedno zdanie o żywym zakwasie, jeśli dostęp wygaśnie w trakcie jego prowadzenia. W V2 wiersz 3-miesięczny odpada.”

**Zmiana właściciela (2026-10-22, przez M1), dosłownie:** „Mozemy zrezygnowac z podawania procentow i odniesien. po prostu same anzwy ofert. Ludzie sami zobacza ze kazda kolejna jest bardziej atrakcyjna.” Skutek (wykładnia M1): z tekstu odpadają „Save 16%”, „Save 41%” i „Pays for itself after 15 months”. Zostają nagłówek, nazwy ofert, okres i cena, ewentualnie opis bez liczb porównawczych („One more month to get to know …”, „A whole year of bakes.”, „Pay once, keep it forever.”).

Ocena wersji bez porównań:
- Ryzyko z wytycznych Komisji (MS-B18, pkt 2.8.2) i z polskiego art. 4 ust. 2 (MS-B19) **odpada**: tekst nie ogłasza obniżki ani nie podaje ceny referencyjnej. Zostaje ogólny zakaz wprowadzania w błąd co do ceny (2005/29/WE art. 6 ust. 1 lit. d, MS-B18 pkt 2.8.2), który spełniają same ceny ze sklepu.
- Ceny lokalne przestają być problemem tekstu: nie ma procentu ani liczby miesięcy do przeliczania; cenę pokazuje `displayPrice` produktu.
- **Najwyraźniejszy element cenowy (MS-B08):** bez porównań na wierszu są nazwa oferty, okres i jedna kwota, więc kwota do zapłaty może być największym elementem cenowym bez konkurencji z procentem. Warunek dla roli 04: cena większa niż nazwa oferty albo co najmniej wyraźniejsza od niej, i bez ceny „za miesiąc” przy planie rocznym i dożywotnim (gdyby się pojawiła, musi być mniejsza i niżej). Ocena w E3 na makiecie, nie tu.
- Zostaje: „No subscriptions” wobec nazwy typu Apple (OP-B05); długości planów w dniach podane przy zakupie (3.1.1, MS-B01: ujawnienie długości przed próbą; dla planów: wymóg uczciwości); „[nazwa aplikacji]” z lokalizacji; zdanie o żywym zakwasie (E2).

Pierwsza ocena wersji z procentami (zapis historyczny, zastąpiona zmianą wyżej):
- „Save 16%” / „Save 41%” bez wskazania, wobec czego: porównanie musi być nazwane wprost przy cenie (MS-B18, pkt 2.8.2), a w Polsce „oszczędzasz” na planie bez wcześniejszej wyższej ceny może być czytane jak ogłoszenie obniżki (MS-B19). Bezpieczniej: „Save 16% vs. three 30-day passes”, „Save 41% vs. 12 × 30 days”. Rachunek: 2,49 / 2,97 = −16,2%; 6,99 / 11,88 = −41,2%. Uwaga: 12 × 30 dni = 360 dni, a rok 365; dla 3 mies. wobec 3 × 30 dni długość planu 3-miesięcznego musi wynosić co najmniej 90 dni, inaczej porównanie zawyża. Ustalić długości planów w dniach razem z tekstem (E2).
- W innych walutach procent liczy się z cen lokalnych, nie z USD (PL: 4,99 zł za 30 dni → 3 mies. i rok wg cen z E2); stały „16%” w 35 językach byłby fałszywy tam, gdzie Apple przeliczy ceny inaczej. Tekst musi brać procent z `displayPrice` produktów (wymóg dla 04/08).
- „No subscriptions”: Apple nazywa ten typ „Non-Renewing Subscription” (MS-B03); czy systemowy arkusz zakupu pokazuje słowo „subscription”: [DO USTALENIA] w sandboksie (OP-B05). Zdania „Nothing renews by itself” i „never be charged for something you forgot to cancel” są prawdziwe w V1/V2 (brak produktu odnawianego).
- „Pays for itself after 15 months”: 14,99 / 0,99 = 15,1 planu 30-dniowego, czyli ok. 15 miesięcy; w PL 79,99 / 4,99 = 16,0. Liczbę też trzeba liczyć z cen lokalnych.
- „[nazwa aplikacji]”: w sklepie Piekarz / Crust zależnie od lokalizacji: z `CFBundleDisplayName` albo słownika, nie na sztywno.
- Zdanie o żywym zakwasie: E2 (opcje przypomnień po wygaśnięciu), tekst rola 04/06.

## E2: modele i rachunek

### Metoda
Bramka tym samym narzędziem i na tych samych danych co 345 USD/rok (`audit/02-warianty-2026-10-19/narzedzia/oplacalnosc.mjs`, `wariant-a-wlasciciel.json`: 9 storefrontów iOS i 9 Google Play, strumień ocen konkurencji, `udzial_nowej`, `instalacje_na_ocene`, konwersja jak w bramce). Generator `audit/02-badanie-modelu-2026-10-22/narzedzia/gen-v.mjs` zmienia tylko to, czym modele się różnią; każda zmiana to [OCENA] z metodą:

| Wielkość | D-038 (bramka) | V1 / V2 [OCENA] | Metoda |
|---|---|---|---|
| Płacący na tym samym strumieniu pobrań | 1 | × 0,45 / 0,69 / 1,04 (pes. / norm. / opt.) | start próby × 1,0 / 1,15 / 1,3 (próba bez przyszłej opłaty), konwersja próba → zakup × 0,45 / 0,6 / 0,8 wobec trial-to-paid 35,4% (10–16 dni, RevenueCat 2026), bo D-038 liczy też tych, którzy zapomnieli anulować |
| Płatności na płacącego (36 mies.) | mies. 5,19; rok 1,45 | 30 dni 1,6 (1,4–2,0); 3 mies. 1,8 (1,5–2,2); rok 1,21 (1,11–1,36) | odnowa mies. 53–75% (RevenueCat 2026) × współczynnik decyzji 0,45 / 0,6 / 0,75 → suma geometryczna; rok p 0,18 wobec retencji 28% |
| Udziały planów (norm.) | 0,486 / 0,346 / 0,168 | V1: 30 dni 0,38, 3 mies. 0,17, rok 0,20, dożywotni 0,25; V2: 0,45 / 0,28 / 0,27 | bez odnawiania długo korzystający przechodzą do dożywotniego (MS-B20: 11 aplikacji niszy z zakupem jednorazowym) |
| Ceny 3 mies. poza US | — | GB 2,49 £, CA 2,99, AU 4,99, EUR 2,99, MX 49, PL 12,99 zł | cena 30 dni × ok. 2,5 do lokalnego progu (OP-B03) |

Nie modelowane (kierunek opisany niżej): wpływ na oceny i widoczność, Family Sharing, zwroty.

### Wynik (2026-10-22, kod wyjścia 0)
`node oplacalnosc.mjs w-d038.json w-v1.json w-v2.json` (`audit/02-badanie-modelu-2026-10-22/dowody/`):

| Model | Razem pes. / norm. / opt. (USD netto/rok, iOS + Google Play) | Sam iOS, norm. | Werdykt wobec 500 |
|---|---|---|---|
| D-038 (dziś) | 3,45 / **344,77** / 26 380,88 | 218 | przerobić |
| V2 (bez 3 mies.) | 1,18 / **199,81** / 24 028,94 | 126 | przerobić |
| V1 (z 3 mies.) | 1,10 / **190,89** / 23 461,56 | 121 | przerobić |

`node docs/monetyzacja/rachunek.mjs docs/monetyzacja/rachunek-badanie-us.json` (kod 0), wpływ w US na 100 płacących w horyzoncie bramki: **D-038 725 USD, V2 606, V1 578**. Próg 500 USD netto: 40 płacących dożywotniego albo 70 płacących planu rocznego V (58 przy D-038), albo 372 płacących 30 dni (115 przy D-038).

Wrażliwość (`wrazliwosc-v.mjs`, wynik normalny):

| Zmiana | V1 | V2 |
|---|---|---|
| mnożnik płacących 0,45 / 0,69 / 0,8 / 1,0 / 1,2 | 124 / 191 / 221 / 277 / 332 | 130 / 200 / 232 / 290 / 347 |
| płatności przepustek ×0,75 / ×1 / ×1,5 / ×2 | 170 / 191 / 234 / 276 | 178 / 200 / 243 / 286 |
| udział dożywotniego 0,17 / 0,25 / 0,35 / 0,45 | 166 / 191 / 222 / 253 | 169 / 194 / 224 / 255 |
| mnożnik 1,0 + płatności ×1,5 + dożywotni 0,35 | 375 | 380 |
| mnożnik, przy którym = D-038 / = 500 USD | 1,25 / 1,81 | 1,19 / 1,73 |

Wnioski z rachunku:
- **Żaden model nie przechodzi progu 500 w scenariuszu normalnym.** O werdykcie decyduje widoczność (`udzial_nowej` 48 → 954 USD, `instalacje_na_ocene` 57 → 573 USD w V1), nie model płatności. Rozrzut modelu jest mniejszy niż rozrzut widoczności.
- **D-038 zarabia w modelu ok. 1,7 raza więcej niż V2** (345 wobec 200), bo odnowienie automatyczne daje 5,19 płatności miesięcznego zamiast 1,6 i liczy zapominających. V2 dogania D-038 dopiero przy 1,19 raza więcej płacących niż D-038; mój scenariusz optymistyczny to 1,04. Uczciwie: w moich założeniach V1/V2 nie wygrywają przychodem w żadnym scenariuszu, wygrywają tylko, jeśli zaufanie podnosi oceny i konwersję bardziej, niż zakładam.
- **V1 < V2**: przy moich udziałach 3 mies. zabiera więcej rocznym niż miesięcznym (578 wobec 606 na 100 płacących). Wynik zależy od tego jednego założenia; gdyby 3 mies. brał tylko od 30 dni, V1 byłby nieco wyżej niż V2. Dowodu na żadną stronę nie ma (2 z ok. 20 aplikacji mają plan kwartalny, MS-B20).
- **Dożywotni niesie V1/V2** (64–69% progu na 100 płacących): cena 14,99 USD jest dźwignią silniejszą niż ceny przepustek.

### Opcje modelu (reguła sklepu, kompromis, ryzyko etyczne, koszt utrzymania)
| | D-038 (dziś) | V1 | V2 |
|---|---|---|---|
| Reguła sklepu | 3.1.2(a) „ongoing value”, próba z App Store Connect (MS-05, MS-06); próba jako oferta wprowadzająca, jedna na grupę | 3.1.1 próba 0 zł „XX-day Trial” (MS-B01), zgodność z nieodnawialnymi **niepewna** (OP-B02, Case 103004967270); Non-Renewing Subscription (MS-B03), pierwsza z nową wersją (MS-B04) | jak V1 |
| Przychód (norm., rachunek) | 345 USD/rok | 191 | 200 |
| Ryzyko etyczne | próba sama zamienia się w opłatę; kupujący dożywotni po próbie płaci też za subskrypcję, jeśli nie anuluje (`docs/monetyzacja.md`, ryzyko nazwane) | brak automatycznej opłaty; ryzyko: wygaśnięcie w trakcie życia zakwasu, utrata dni przy przedłużeniu przed końcem (E1) | jak V1 |
| Obietnica „never charged for something you forgot to cancel” | nieprawdziwa | prawdziwa | prawdziwa |
| Family Sharing | wszystkie (włączone) | tylko dożywotni (właściciel: „ok, to na nasza korzysc”) | jak V1 |
| Koszt utrzymania | 3.1.2(a): stała wartość i aktualizacje | brak wymogu „ongoing value” dla nieodnawialnej (MS-B02 dotyczy tylko odnawianych) | jak V1 |
| Liczba planów na ekranie | 3 | 4 | 3 |
| Zmiana przed 1.0 | brak | konfiguracja, adapter, uprzedzenie, nowe produkty w ASC, test w sandboksie (E1: [OCENA] 1–2 dni + sandbox) | jak V1, jeden produkt mniej |

### Rekomendacja: V2 (warunkowo do odpowiedzi App Review)
- **Za:** usuwa jedyne ryzyko, które właściciel nazwał „największym red flag”, i robi z niego obietnicę prawdziwą dosłownie; zgodna z wzorcem roli („model wynika z rodzaju wartości”, „uczciwie albo wcale”) i z H-B1 (skargi niszy dotyczą ukrytej opłaty). V2 zamiast V1, bo przychód jest w modelu ten sam albo wyższy, ekran ma 3 plany zamiast 4 („Więcej opcji cenowych to nie lepsza monetyzacja”, wzorzec roli), mniej produktów do ustawienia i tłumaczenia, a kotwica 3 mies. nie ma dowodu z rynku.
- **Koszt wyboru:** w rachunku ok. 145 USD/rok mniej niż D-038 w scenariuszu normalnym (sam iOS ok. 92), czyli ok. 42%. Obie wartości są poniżej progu 500; o przejściu progu zdecyduje widoczność, a ta może zyskać na uczciwym modelu (nie zmierzone).
- **Warunek:** odpowiedź App Review w sprawie próby 3.1.1 (OP-B02). Jeśli „nie”: (a) V2 z darmowym limitem użycia zamiast próby czasowej (limit użyć nie jest próbą w rozumieniu 3.1.1, wzorzec roli „Kalibracja”), z podziałem do decyzji roli 03; (b) powrót do D-038 z ujawnieniami; (c) V2 bez próby (twarda ściana bez wypróbowania: odradzam, wzorzec skarg Loaflo „brak próby”). Rekomendacja na ten wypadek: (a).
- **Kryterium po 90 dniach** (zamiast kryterium D-038 w `docs/monetyzacja.md`): ≥ 42 USD wpływu miesięcznie na iOS albo ≥ ok. 3,3 zakupu dożywotniego miesięcznie (40/rok = próg z samego dożywotniego, rachunek wyżej); poniżej połowy: przegląd widoczności i zakresu. Dane tylko z App Store Connect.

### Decyzje wykonawcze dla V2 (do wyboru razem z modelem; rekomendacja pierwsza)
| Sprawa | Opcje | Rekomendacja |
|---|---|---|
| Przedłużenie przed końcem (E1: druga transakcja tego samego produktu zjada resztę pierwszej) | (a) gdy trwa przepustka, przepustek nie da się kupić; dożywotni zawsze; oferta wraca 3 dni przed końcem i po nim; (b) zakup od 7 dni przed końcem z „nowy okres liczy się od dziś”; (c) łańcuch okresów liczony w aplikacji | (a): nikt nie traci opłaconych dni, a obliczenie zostaje po stronie sklepu |
| Żywy zakwas po wygaśnięciu | (a) przypomnienia o dokarmianiu i zapis karmienia zakwasów założonych w czasie dostępu działają dalej bez zakupu, płatne zostają nowe zakwasy, plan założenia, diagnoza i reszta; (b) jedno ostatnie przypomnienie z informacją i zdanie na ekranie ofert; (c) bez zmian (D-039: ustają) | (a): zakwas to żywa kultura, a jej obumarcie przez wygaśnięcie dostępu czyta się jak zakładnik (zasada roli 6); koszt: BR-ZAKW-004 (WTP-1) staje się częściowo darmowy dla istniejących zakwasów. Podział rozstrzyga rola 03 z właścicielem |
| Długości planów | 30 dni i 365 dni (V1: + 91 dni) | jak w tekście właściciela; długość w `konfiguracja.ts` i na ekranie przed zakupem |
| Uprzedzenie (D-039) | 3 dni przed końcem próby i każdej przepustki, bez gałęzi „pobierzemy” | tak |
| Family Sharing | dożywotni (już włączony); próba: wyłączony | próba bez Family Sharing (inaczej rodzina dostaje próbę z cudzą datą) |
| Nowe ID (nieodwracalne, MS-B06) | np. `com.apps4brew.baker.trial.14d`, `com.apps4brew.baker.pass.30d`, `com.apps4brew.baker.pass.1y` (V1: `.pass.3m`); `com.apps4brew.baker.pro.lifetime` bez zmian | do potwierdzenia na E3 |
| Stare `.pro.monthly`, `.pro.yearly` | zostają niewysłane / wycofane ze sprzedaży; ID spalone | M1 w ASC za osobną zgodą (właściciel: „ok, zadna strata”) |

### Etyka (wzorce roli)
- D-038: próba, która sama zamienia się w opłatę, jest dozwolona przy pełnych ujawnieniach (MS-14), ale to dokładnie wzorzec, który właściciel odrzuca; pułapka „dożywotni po próbie subskrypcji” zostaje mimo ujawnień.
- V1/V2: „free” jest prawdziwe (2005/29/WE zał. I pkt 20); uprzedzenie przed końcem bez odliczania i bez „ostatnia szansa” (zał. I pkt 7); po wygaśnięciu dane zawsze dostępne offline (D-039 bez zmian); trwający wypiek do końca (D-039); żywy zakwas wyżej.
- Tekst ofert właściciela bez procentów (E1): bez ryzyka ogłoszenia obniżki; kwota najwyraźniejsza (MS-B08) do sprawdzenia na makiecie roli 04.

## E2b: V3, cała aplikacja darmowa z limitem dni pieczenia (wzorzec Treningu, zlecenie właściciela 2026-10-22)

Zlecenie: notatka właściciela przekazana przez M1 2026-10-22 („Notatka od właściciela: wzorzec monetyzacji do wypracowania w tej aplikacji (z Treningu, decyzja 22.10.2026)”, zasady 1–9). Idea, dosłownie: „użytkownik dostaje całą aplikację za darmo, bez żadnej zgody na subskrypcję czy próbę. Ograniczona jest tylko liczba użyć głównej czynności w miesiącu. Kto chce więcej, świadomie kupuje Pro.” Rozdziałów 10–11 pliku Treningu, na które notatka się powołuje, nie ma dziś na żadnej gałęzi `lkarwowski494/trening` (sprawdzone 2026-10-22: `monetyzacja-badanie-2026-10-22`, `main`, `koordynacja-2026-10-22`, `asc-kontrola-404-sha` mają rozdziały 1–9); pracuję na zasadach z notatki, porównanie z Treningiem po publikacji rozdziałów.

### Reguły sklepu z dziś dla V3
| Sprawa | Źródło (odczyt 2026-10-22) | Wniosek |
|---|---|---|
| Limit użyć a okres próbny | 3.1.1 mówi tylko o próbie „time-based” przez „Non-Consumable IAP item at Price Tier 0” (MS-B01); o limicie użyć wytyczne nie mówią nic | limit użyć nie jest próbą „time-based”, więc produkt „XX-day Trial” nie jest potrzebny. To wykładnia tekstu (brak zakazu), nie zdanie Apple wprost; Case 103004967270 o próbie 3.1.1 przestaje być potrzebny dla V3 |
| Ujawnienia subskrypcji | 3.1.2(a) (MS-05: „ongoing value”, „at least seven days”); 3.1.2(c): „Before asking a customer to subscribe, you should clearly describe what the user will get for the price.” (MS-09, dziś ten sam tekst); strona subskrypcji: kwota „most prominent pricing element” (MS-B08) | ekran Pro: cena za okres największa, długość, odnawianie i anulowanie, linki do warunków i prywatności (MS-16) |
| Opis w sklepie | 2.3.2: „make sure your app description, screenshots, and previews clearly indicate whether any featured items, levels, subscriptions, etc. require additional purchases” | opis: „darmowe do N dni pieczenia w miesiącu; Pro bez limitu” (zasada 9 notatki) |
| Family Sharing | MS-B05: tylko odnawiane i Non-Consumable; „you can't turn it off” | już włączony na `.pro.monthly`, `.pro.yearly`, `.pro.lifetime` (zapis ASC 2026-10-21): decyzji nie ma do podjęcia, jest fakt |
| Usunięcie oferty wprowadzającej | pomoc ASC „Set up introductory offers”: „Navigate to the Introductory Offers tab … Find the introductory offer you wish to delete, and move your pointer over the right side of the price change row until the remove button (—) appears. Click the remove button. Click Delete in the dialog.” (MS-B21) | krok M1 na obu subskrypcjach, wszystkie storefronty (Free Trial 2 Weeks zapisany 2026-10-21) |
| Dotychczasowi płacący | 3.1.2(a): „should not take away the primary functionality existing users have already paid for” (MS-07) | płacących nie ma: aplikacja tylko w TestFlight, zakupy w piaskownicy (OP-B01 dalej u M1); V3 nic nie odbiera, bo wszystko staje się darmowe do limitu |
| Prowizja, VAT, kurs | Small Business Program aktywny (właściciel przez M1), 15% (MS-20); VAT PL 23% (europa.eu/youreurope, tabela „Standard rate”: „PL Poland 23”, „Last checked: 13/07/2026”, odczyt 2026-10-22); USD 3,8886 (MS-B10) | bez zmian w rachunku |

Produkty V3 to obecne produkty: subskrypcja miesięczna i roczna (odnawiane) i dożywotni. Nowych ID nie trzeba, nic nie jest „spalone”.

### Jednostka limitu i N
**Jednostka: dzień pieczenia,** czyli dzień kalendarza (czas telefonu), w którym zaczął się co najmniej jeden wypiek ukończony albo porzucony. Dwa wypieki zaczęte tego samego dnia (D-092, D-104 „Prowadź oba”) to jeden dzień. Wypiek trwający przez noc liczy się do dnia startu. *Dlaczego dla użytkownika:* piekarz myśli „w sobotę piekę”, a nie „zrobię dwa bochenki”; dwa bochenki naraz nie zjadają mu dwóch darmowych dni.

| Wariant | Uzasadnienie dla użytkownika | Mnożnik konwersji wobec freemium bramki [OCENA] |
|---|---|---|
| N = 3 | „3 dni pieczenia w miesiącu za darmo”: upiec, poprawić, upiec znowu; piekący raz w tygodniu dochodzi do limitu w 4. tygodniu | 0,7 / 1,0 / 1,3 |
| N = 5 | „Pieczesz raz w tygodniu? Zawsze za darmo.” Miesiąc ma najwyżej 5 tych samych dni tygodnia (jak w Treningu) | 0,35 / 0,55 / 0,8 |
| N = 8 | „Dwa razy w tygodniu za darmo” | 0,15 / 0,3 / 0,45 |

Metoda mnożnika: płaci tylko ten, kto przekracza N; częstotliwość domowego wypieku „roughly once a week” (S-24, rec. 8870010975, szczebel 5; BRD PR-11, J-11). Rozkładu częstotliwości wśród użytkowników nie ma w żadnym przeczytanym źródle, więc przedziały są szerokie.

### Rachunek (2026-10-22, kod wyjścia 0)
`gen-v3.mjs` + `oplacalnosc.mjs` na danych bramki (`audit/02-badanie-modelu-2026-10-22/dowody/porownanie-v3.txt`). Bramka 2026-10-19 liczyła konwersję jak freemium z darmowym rdzeniem (RevenueCat 2026 freemium 2,1% × elastyczność ceny), czyli w kształcie bliskim V3. D-038 i V2 to twarda ściana po próbie, której bramka nie liczyła (U-1, ZAL-050), więc podaję dwa odczyty:
- **odczyt A:** wszystkie modele na konwersji freemium z bramki (jak 345 USD/rok);
- **odczyt B:** D-038 i V2 × 1,5 / 2,5 / 5 za twardą ścianę (RevenueCat 2026: „Hard paywall median: 10.7% … Freemium median: 2.1%”, „Hard paywall’s floor (4.2%) is 2× the freemium median”, MS-27) [OCENA].

| Model (USD netto/rok, iOS + Google Play) | pes. / **norm.** / opt. | sam iOS norm. | wobec 500 |
|---|---|---|---|
| D-038, odczyt B | 5 / **862** / 131 904 | 545 | wydać |
| V3 N=3, mediany 4,49 / 24,99 / 39,99 | 7 / **681** / 69 445 | — | wydać |
| V3 N=3, jak Rise 3,99 / 14,99 / 19,99 | 6 / **532** / 57 790 | 336 | wydać |
| V2, odczyt B | 2 / **500** / 120 145 | 315 | przerobić (na progu) |
| V3 N=5, mediany | 4 / **374** / 42 735 | — | przerobić |
| D-038, odczyt A | 3 / **345** / 26 381 | 218 | przerobić |
| **V3 N=3, ceny właściciela 0,99 / 6,99 / 14,99** | 2 / **344** / 34 231 | 218 | przerobić |
| V3 N=5, jak Rise | 3 / **293** / 35 563 | 185 | przerobić |
| V3 N=8, mediany | 2 / **204** / 24 039 | — | przerobić |
| V2, odczyt A | 1 / **200** / 24 029 | 126 | przerobić |
| **V3 N=5, ceny właściciela** | 1 / **189** / 21 065 | 120 | przerobić |
| V3 N=8, jak Rise | 1 / **160** / 20 004 | — | przerobić |
| V3 N=8, ceny właściciela | 1 / **103** / 11 849 | — | przerobić |

Wrażliwość (z bramki, V3 N=5 ceny właściciela, pes. → opt. jednego założenia): `udzial_nowej` 47 → 946, `instalacje_na_ocene` 57 → 568, konwersja 54 → 443. Dla N=3: 86 → 1 720, 103 → 1 032, 98 → 805.

Wnioski:
- **Przy cenach właściciela V3 z N=5 zarabia tyle co V2 (189 wobec 200), a z N=3 tyle co D-038 w odczycie A (344 wobec 345).** N jest dźwignią porównywalną z ceną: z N=5 na N=3 to ok. 1,8×.
- **Odczyt B pokazuje koszt odejścia od twardej ściany:** jeśli twarda ściana z próbą konwertuje choćby 2,5 raza lepiej niż freemium, D-038 daje ok. 862 USD/rok, czyli 2,5–4,6 raza więcej niż V3 przy cenach właściciela (N=3 / N=5). To najważniejsza niewiadoma tego wyboru i nie da się jej rozstrzygnąć przed premierą; po 8 tygodniach pokaże ją App Store Connect.
- **Ceny:** przy V3 podniesienie cen do dolnego krańca rynku (jak Rise) daje +55% (N=5: 189 → 293), do median +98% (374). Próg 500 przechodzą tylko V3 N=3 z cenami rynkowymi i D-038 w odczycie B.
- **Nie modelowane:** wpływ hojnego darmowego poziomu na oceny i widoczność. To założenie o największym wpływie we wszystkich wariantach (`udzial_nowej`) i działa na korzyść V3, ale bez źródła, które by to mierzyło.

### Reguła liczenia (wektory do testów; N = 5, czas telefonu, bez Pro, o ile nie napisano inaczej)
Reguła: `uzyte(miesiąc)` = liczba różnych dni startu w tym miesiącu z wypiekiem **ukończonym** albo **porzuconym**, plus dni startu **trwających** wypieków (żeby niekończenie nie obchodziło limitu). Start wypieku w nowym dniu jest dozwolony, gdy `uzyte < N` albo dzień startu już jest policzony. Wypiek jest **anulowany** (nie liczy się, dzień się zwalnia), gdy „Przerwij” pada przed ukończeniem pierwszego kroku i w ciągu 30 minut od startu (próg do decyzji, D-V3-4); później „Przerwij” to **porzucenie** (liczy się, zapis licznika).

| # | Sytuacja | Oczekiwane |
|---|---|---|
| W1 | 4 dni policzone w październiku, start 20.10 | dozwolony; licznik „Został 1 z 5” → po starcie „0 z 5” |
| W2 | 5 dni policzonych, start w nowym dniu | blokada na przycisku startu, ekran Pro; reszta aplikacji działa |
| W3 | 5 dni policzonych, w tym dziś; drugi wypiek dziś | dozwolony (ten sam dzień) |
| W4 | 5 dni w październiku, start 31.10 o 23:59 | blokada |
| W5 | jw., start 1.11 o 00:00 | dozwolony; listopad od zera |
| W6 | start 31.10 o 23:30, koniec 1.11 o 9:00 | liczy się do października (dzień startu) |
| W7 | start, „Przerwij” po 10 min, żaden krok nieukończony | anulowany: nie liczy się, dzień wolny |
| W8 | start, „Przerwij” po ukończeniu pierwszego kroku albo po 30 min | porzucony: liczy się |
| W9 | wpis dziennika dopisany wstecz, import kopii, edycja historii | nie liczy się |
| W10 | 3 dni policzone + 2 trwające wypieki z dwóch innych dni | `uzyte` = 5: start w nowym dniu zablokowany; ukończenie albo porzucenie trwających nie zmienia liczby, anulowanie jednego zwalnia dzień |
| W11 | plan na 3.11 zapisany 28.10 (kalendarz, D-106) | planowanie wolne; liczy się dopiero start (dzień faktycznego startu) |
| W12 | Pro aktywne | bez limitu; dni pieczenia z Pro nie liczą się do limitu (opcja rekomendowana D-V3-3) |
| W13 | Pro wygasa 15.10; przed zakupem 2 darmowe dni w październiku | od 15.10 zostały 3 z 5 |
| W14 | wypiek zaczęty z Pro, Pro wygasa w trakcie | wypiek prowadzi się do końca (D-039), nie liczy się do limitu |
| W15 | limit wyczerpany: karmienie zakwasu, przypomnienia o dokarmianiu, kalkulator, plan wstecz, Doktor, dziennik, eksport, kopia | wszystko działa (zasada 5 notatki; decyzja 3 z E2) |
| W16 | zmiana strefy czasowej po starcie | dzień zapisany przy starcie (RRRR-MM-DD czasu telefonu) się nie zmienia |
| W17 | „Piecz ponownie” i start zaplanowanego wypieku z kalendarza | to samo sprawdzenie co przycisk startu (jedna funkcja) |

### Lista zmian (do wykonania dopiero po wyborze)
| Obszar | Zmiana | Czas agenta [OCENA] | Właściciel / czekanie |
|---|---|---|---|
| Kod: dostęp | `konfiguracja.ts`: wszystkie funkcje bez uprawnienia poza startem wypieku ponad limit; nowy czysty moduł limitu z wektorami W1–W17; zapis dni pieczenia (tabela albo klucz `app_settings`, poza kopią: D-V3-5) z migracją w transakcji (zasada wspólna 10) | 1 dzień | — |
| Kod: bramka startu | jedna funkcja sprawdzenia przy starcie w Stolnicy, „Piecz ponownie”, starcie planu z kalendarza; licznik na ekranie startu; klasyfikacja „Przerwij” (anulowany / porzucony) | 0,5–1 dnia; pliki przebudowy M3 (Stolnica, Dziś, kalendarz): po scaleniu `redesign/piekarz-2026-10-22` albo na niej, za zgodą M1 | koordynacja z M3 |
| Kod: płatności | `sklep.ts`: bez oferty wprowadzającej i `isEligibleForIntroOffer`; `uprzedzenie.ts` (3 dni przed końcem próby) i baner „tylko historia” do usunięcia; ekran Pro tylko przy limicie i w Ustawieniach; „Zrealizuj kod” | 0,5 dnia | — |
| Testy | zmiana testów kontraktu (bramki ekranów, oferta przy pierwszym użyciu, uprzedzenie próby): nowe asercje z nowego kontraktu, nie wyłączanie | w cenie wyżej | — |
| Teksty | licznik („Zostały {n} z {N} darmowych dni pieczenia w tym miesiącu”), ekran Pro (nazwy planów, cena, opis bez liczb, ujawnienia 3.1.2), komunikat blokady; 35 języków | 0,5 dnia + przekład (Message Batches) | zgoda na wydatek API przez M1 |
| Opis sklepu i zrzuty | 35 lokalizacji: „darmowe do N dni pieczenia w miesiącu; Pro bez limitu”, bez „free trial”; zrzut ekranu Pro, jeśli pokazuje próbę | 0,5 dnia (rola 10) | przegląd ok. 15 min |
| App Store Connect | usunięcie oferty wprowadzającej na `.pro.monthly` i `.pro.yearly` (MS-B21); notatka dla recenzji o limicie | M1 skryptem albo w UI, ok. 30 min | zgoda właściciela na zapis |
| Dokumenty | `docs/monetyzacja.md` (kontrakt), wpis decyzji zastępujący D-038/D-039, ER do roli 01 (BR-ZAK-004 „stan po próbie”, BR-ZAK-005 „oferta przy pierwszym użyciu”), rola 03 (podział: wszystko darmowe), rola 04 (ekran Pro i licznik) | 0,5 dnia | — |
| Sandbox / TestFlight | zakup każdego planu, przywracanie, limit, północ, wygaśnięcie Pro | — | ok. 30 min na telefonie; runner macOS tylko 0:00–15:00 |

Razem [OCENA]: ok. 3–4 dni pracy agenta, ok. 1 h czasu właściciela, czekanie: przekład, recenzja 1.0. Mieści się przed końcem listopada, jeśli wybór padnie w tym tygodniu i M3 skończy pliki Stolnicy.

### Decyzje dla właściciela (V3)
| # | Decyzja | Opcje | Rekomendacja |
|---|---|---|---|
| D-V3-1 | Model | (a) V3; (b) V2 (przepustki bez odnawiania); (c) D-038 bez zmian | **(a) V3:** spełnia ten sam warunek co V2 („nic się samo nie odnawia bez wyboru”: subskrypcję Pro kupuje się świadomie, bez próby, która sama zamienia się w opłatę), a przy tych samych cenach zarabia tyle co V2 albo więcej, bez nowych ID, bez niepewności App Review co do próby 3.1.1, z Family Sharing już włączonym i jak w Treningu. Koszt wobec D-038 przy cenach właściciela: w odczycie A zero przy N=3 i ok. 45% przy N=5 (344 / 189 wobec 345), w odczycie B 2,5–4,6× mniej (862 wobec 344 / 189) |
| D-V3-2 | N | (a) N=5; (b) N=3; (c) N=8 | **(a) N=5:** jedno proste zdanie dla użytkownika i ten sam wzorzec co Trening; typowy domowy piekarz (raz w tygodniu) nigdy nie widzi ściany, a płacą częściej piekący. Koszt: ok. 1,8× mniej niż N=3. Wybierz (b), jeśli przychód ma pierwszeństwo przed hojnością |
| D-V3-3 | Dni z Pro a limit | (a) liczą się tylko dni bez Pro; (b) liczą się wszystkie dni miesiąca | (a): kto zapłacił, nie traci darmowych dni po wygaśnięciu (W12–W14) |
| D-V3-4 | Kiedy „Przerwij” to anulowanie | (a) przed ukończeniem pierwszego kroku i w ciągu 30 min; (b) tylko przed pierwszym krokiem; (c) w ciągu 10 min | (a): pomyłka przy starcie nie kosztuje dnia, a porzucenie w połowie wypieku się liczy |
| D-V3-5 | Zapis licznika | (a) osobna tabela dni pieczenia poza kopią zapasową; (b) w kopii zapasowej | (a): import kopii nie zeruje ani nie przenosi licznika; ponowna instalacja zeruje licznik (brzegowe: kasuje też dane bez kopii) |
| D-V3-6 | Ceny Pro | (a) 0,99 / 6,99 / 14,99 USD (jak dziś i w Treningu); (b) 3,99 / 14,99 / 19,99 USD (dolny kraniec rynku); (c) 4,49 / 24,99 / 39,99 USD (mediany) | **(b):** przy N=5 +55% (189 → 293 USD/rok) i nadal najtańsza w niszy obok Rise; (a) zostawia hasło „dojeżdżamy konkurencję ceną” (ZP-18), ale przy darmowym limicie niska cena nie jest już potrzebna do wypróbowania. Ceny lokalne z gotowych wariantów bramki |
| D-V3-7 | Oferta kilkumiesięczna | (a) bez, wracamy po 8 tygodniach; (b) od startu | (a): jak w notatce i Treningu; V1 w E2 nie pokazał zysku |

Wobec STOP E2: rekomendacja z E2 (V2) zostaje zastąpiona rekomendacją V3, jeśli właściciel przyjmie tę notatkę jako kierunek; V2 zostaje wariantem odniesienia.

## E2c: V3 według wzorca portfela „limit miesięczny, Pro bez próby” (zastępuje E2b)

Zlecenie: właściciel (2026-10-22, przez M1), dosłownie: „Zaktualizowany model. Potrzebuje odpowiednika dla piekarza. Czekam na szczegóły i wyliczenie monetyzacji.”, z plikiem „Wzorzec monetyzacji portfela: limit miesięczny, Pro bez próby” (źródła: Trening i Oczko P-057). Wzorzec zastępuje notatkę z E2b. Zmiany wobec E2b: porzucenie nie zwraca dnia (dzień zapisuje się przy starcie), praca przez północ z przerwą < 60 min, wejście zastępujące wypiek woła strażnika, ceny domyślne portfela, bez „No subscriptions”, limit tylko się luzuje, dni wypieku w danych użytkownika, próg zrównania i test po wydaniu. Rachunek i reguły sklepu z E2b obowiązują dalej.

Reguły sklepu, uzupełnienie (odczyt 2026-10-22): strona subskrypcji Apple opisuje ten model wprost: „Offer a metered paywall. A metered paywall allows access to a finite amount of content for a specified duration before needing to make a purchase — for example, viewing 10 full articles per month for free in a news app.” (MS-B08, sekcja freemium). Wytyczne 3.1.1 mówią o próbie tylko „time-based” (MS-B01), więc limit nie wymaga produktu „XX-day Trial”. Produkty nieodnawialne w App Store Connect: brak (V1/V2 niczego nie zapisały). Oferty wprowadzające: są na `.pro.monthly` i `.pro.yearly` (Free Trial 2 Weeks, zapis 2026-10-21): krok usunięcia MS-B21. Family Sharing: włączony na trzech produktach 2026-10-21 i nieodwracalny (MS-B05), zgodnie z kierunkiem portfela.

### 1. Jednostka i N
**Jednostka: dzień wypieku,** czyli data lokalna (czas telefonu w chwili startu), w której zaczął się wypiek prowadzony w Stolnicy. Kilka wypieków tego samego dnia to jeden dzień. Uzasadnienia są tego samego rodzaju co w portfelu („rytm X zawsze darmowy”, bo miesiąc ma najwyżej tyle wystąpień):

| N | Zdanie dla użytkownika | Ile osób przekracza limit |
|---|---|---|
| **5 (domyślne)** | „Pieczesz raz w tygodniu? Zawsze za darmo.” (najwyżej 5 tych samych dni tygodnia w miesiącu) | danych o rozkładzie częstotliwości nie ma; BRD: „roughly once a week” (S-24, rec. 8870010975, szczebel 5). [OCENA] limit przekraczają piekący częściej niż raz w tygodniu; mnożnik konwersji 0,35 / 0,55 / 0,8 wobec freemium bramki |
| 3 | „Pieczesz co dwa tygodnie? Zawsze za darmo.” (31 dni mieści 3 dni co 14: 1., 15., 29.) | [OCENA] limit przekracza każdy piekący raz w tygodniu: mnożnik 0,7 / 1,0 / 1,3 |
| 10 | „Pieczesz dwa razy w tygodniu? Zawsze za darmo.” (2 dni tygodnia × najwyżej 5) | [OCENA] tylko piekący częściej niż 2× w tygodniu: mnożnik 0,05 / 0,12 / 0,2 |

### 2. Rachunek wobec D-038
Narzędzie i dane bramki z 2026-10-19 (`oplacalnosc.mjs`, `wariant-a-wlasciciel.json`: 9 storefrontów iOS i 9 Google Play), kod wyjścia 0 dla wszystkich plików (`audit/02-badanie-modelu-2026-10-22/dowody/`). Odnowienia subskrypcji są w rachunku: płatności na płacącego w 36 mies. 5,19 (miesięczna) i 1,45 (roczna), RevenueCat 2026 przez bramkę; ceny, plany i odnowienia V3 są te same co w D-038, więc przychód na płacącego jest ten sam, a różni się tylko liczba płacących. Prowizja 15%, VAT PL 23%, USD 3,8886 (E2b). Odczyty A i B jak w E2b (B: twarda ściana D-038 konwertuje 1,5 / 2,5 / 5 raza lepiej niż freemium [OCENA z RevenueCat 2026, MS-27]).

| USD netto/rok, iOS + Google Play | pes. / **norm.** / opt. | sam iOS norm. |
|---|---|---|
| D-038, odczyt A | 3 / **345** / 26 381 | 218 |
| D-038, odczyt B | 5 / **862** / 131 904 | 545 |
| V3 N=3, ceny portfela | 2 / **344** / 34 231 | 218 |
| **V3 N=5, ceny portfela** | 1 / **189** / 21 065 | 120 |
| V3 N=10, ceny portfela | 0 / **41** / 5 266 | 26 |
| V3 N=5, 3,99 / 14,99 / 19,99 | 3 / **293** / 35 563 | 185 |
| V3 N=5, 4,49 / 24,99 / 39,99 | 4 / **374** / 42 735 | — |
| V2 (odniesienie), odczyt A | 1 / **200** / 24 029 | 126 |

Wrażliwość (V3 N=5, ceny portfela, pes. → opt. jednego założenia): `udzial_nowej` 47 → 946, `instalacje_na_ocene` 57 → 568, konwersja 54 → 443 USD/rok.

**Próg zrównania** (`e2c.mjs`, US, norm.; stopa = zakupy Pro / pierwsze pobrania = konwersja bramki × `darmowa_alternatywa` × mnożnik):

| Model | Zakup Pro na pobranie, pes. / norm. / opt. |
|---|---|
| D-038, odczyt A | 0,66% / 3,26% / 9,81% |
| D-038, odczyt B | 0,99% / 8,15% / 49,05% |
| V3 N=3 | 0,46% / 3,26% / 12,75% |
| V3 N=5 | 0,23% / **1,79%** / 7,85% |
| V3 N=10 | 0,03% / 0,39% / 1,96% |

V3 N=5 dorównuje D-038, gdy limit konwertuje **1,82 raza lepiej** niż zakładam (≥ 3,26% zakupów na pobranie) w odczycie A albo **4,55 raza lepiej** (≥ 8,15%) w odczycie B.

### 3. Reguła liczenia i wektory
Czysta funkcja `docs/monetyzacja/limit.mjs` (wzorzec Oczka, P-057), wektory `docs/monetyzacja/wektory-limitu.json`: `node docs/monetyzacja/limit.mjs docs/monetyzacja/wektory-limitu.json` → „16 z 16 zgodnych”, kod 0 (2026-10-22). To propozycja w dokumentach, nie kod aplikacji.

Reguła: przy starcie wypieku strażnik zapisuje dzień (data lokalna, flaga Pro). Start w nowym dniu jest dozwolony, gdy darmowych dni bez Pro w tym miesiącu jest < 5, gdy Pro jest aktywne albo gdy od ostatniej czynności przy dowolnym wypieku (start albo ukończony krok) minęło < 60 min. Dzień raz zapisany zostaje, także po „Przerwij”.

| Przypadek z pkt 4.3 | Wektor |
|---|---|
| pierwsze użycie w miesiącu | L-01 |
| ten sam dzień | L-02 (drugi bochenek, „Prowadź oba”), L-06 |
| limit wyczerpany | L-03 |
| praca przez północ, krótka / długa przerwa | L-04 / L-04b |
| nowy miesiąc | L-05 |
| cofnięcie albo porzucenie | L-06, L-06b (dzień nie wraca) |
| dopisanie wstecz | L-07: poza funkcją, strażnik nie jest wołany (dziennik, edycja, import) |
| wejście zastępujące czynność | L-08 |
| Pro aktywne | L-10 |
| Pro wygasłe w trakcie miesiąca | L-09 |
| drugie urządzenie | L-11 (dni z kopii łączone z lokalnymi) |
| cofnięty zegar | L-12, L-15 |
| ponowna instalacja | L-14 |
| (Piekarz) plan na przyszły dzień | L-16 |
| (Piekarz) kroki trwającego wypieku, wypiek przez noc | L-17: poza funkcją, strażnik nie jest wołany; wypiek trwa do końca |
| (Piekarz) karmienie zakwasu, przypomnienia | L-18: poza funkcją, zawsze dostępne |

**Dni wypieku w danych użytkownika (zasada 13 wzorca) a moja rekomendacja z E2b „licznik poza kopią”:** zmieniam ją. Piekarz nie ma synchronizacji (offline, bez konta); odpowiednikiem „danych synchronizowanych” jest kopia zapasowa (BR-DANE-002, pule `piekarz-kopia-*`). Propozycja: tabela `dni_wypieku (data, pro)` w bazie, w kopii zapasowej jako pole opcjonalne (jak D-102, kopia bez pola nie zmienia dni w telefonie), a import **łączy** dni (suma, bez usuwania). Za: nowy telefon z kopii dostaje swoje dni (L-11), a ponowna instalacja z odtworzeniem kopii nie zeruje limitu. Mój argument z E2b (import zeruje albo przenosi licznik) znika przy łączeniu: import starszej kopii niczego nie odejmuje. Ryzyko brzegowe: ponowna instalacja bez kopii zeruje licznik (L-14), ale kasuje też dane użytkownika, więc nie jest tanim obejściem.

**Limit tylko się luzuje (zasada 12):** test przed wydaniem porównuje `LIMIT_DNI` i listę „zawsze dostępne” z plikiem poprzedniego wydania (np. `docs/monetyzacja/limit-wydania.json`, aktualizowany przy wydaniu): błąd, gdy limit maleje albo funkcja znika z listy. Do napisania w E3 razem z kodem.

### Odstępstwa Piekarza od wzorca (nazwane)
| # | Odstępstwo | Dlaczego |
|---|---|---|
| O-1 | **Dwa wypieki naraz** (D-092, D-104): dwa wypieki zaczęte tego samego dnia albo w przerwie < 60 min to jeden dzień; trwające dwa wypieki z różnych dni to dwa dni | jednostka „dzień” wzorca bez zmian; dopisuję tylko, że drugi wypiek to nie nowa jednostka (L-02, L-04) |
| O-2 | **Plany na przyszłe dni** (D-106, kalendarz): zapis planu nie woła strażnika; liczy się dzień faktycznego startu | planowanie to funkcja pomocnicza (zasada 6 wzorca), a start planu to start wypieku (L-16) |
| O-3 | **Zakwas zawsze darmowy:** karmienie, zapis karmienia, przypomnienia o dokarmianiu, zakładanie i budzenie zakwasu | zakwas to funkcja pomocnicza, nie główna czynność; przypomnienie o żywej kulturze za zaporą robiłoby z niej zakładnika (zasada 6 wzorca „dane nigdy nie są zakładnikiem” i zasada roli 6); decyzja 3 z E2 |
| O-4 | **Wypiek rozpoczęty trwa do końca** także po wygaśnięciu Pro (D-039) | zgodne z zasadą 4 wzorca, zapisuję tylko odwołanie do D-039 |
| O-5 | **Dni wypieku w kopii zapasowej, nie w synchronizacji** | Piekarz nie ma synchronizacji (zasada 1 CLAUDE.md: offline); kopia pełni tę rolę (wyżej) |

### 4. Test modelu po wydaniu
- **Miara:** zakupy Pro (pierwsze zakupy subskrypcji i dożywotniego) / pierwsze pobrania, z App Store Connect (Sales and Trends, MS-24), bez telemetrii.
- **Próg zrównania:** 3,26% (odczyt A); 8,15%, jeśli przyjąć odczyt B.
- **Przedziały 95% (Wilson) przy 3000 pobraniach:** V3 N=5 przy założeniu normalnym 1,79% → 54 zakupy, 1,38–2,33%; gdyby V3 było na progu A, 3,26% → 98 zakupów, 2,68–3,96%; na progu B, 8,15% → 245 zakupów, 7,23–9,19%. Przy 3000 pobraniach te trzy stany dają się od siebie odróżnić.
- **Termin:** w bramce normalnej to ok. 993 pobrania iOS rocznie (ok. 2 200 razem z Google Play), więc 3000 pobrań to ok. 3 lata samego iOS. **Odświeżenie co 6 miesięcy** (ok. 500 pobrań iOS): przedział V3 przy 1,79% to 0,95–3,38%, więc po pół roku da się odróżnić tylko odczyt B (próg 8,15%, przedział 6,06–10,88%), a odczytu A jeszcze nie. Wniosek: przy 6 miesiącach decyzja „wrócić do twardej ściany” ma podstawę tylko wtedy, gdy stopa V3 jest wyraźnie poniżej 3%.

### 5. Lista zmian (po wyborze; czas agenta [OCENA] osobno od czasu właściciela)
| Obszar | Zmiana | Agent | Właściciel / czekanie |
|---|---|---|---|
| Kod: limit | `src/core/limit-wypiekow.ts` z `limit.mjs` + wektory L-01…L-16 w Jest; tabela `dni_wypieku` z migracją w transakcji i kopią przed migracją (zasada wspólna 10); pole kopii opcjonalne, import łączy | 1 dzień | — |
| Kod: strażnik | jedna funkcja w starcie Stolnicy, „Piecz ponownie”, starcie planu z kalendarza; ostatnia czynność (start, krok); licznik na ekranie startu; pliki przebudowy M3 | 0,5–1 dnia | po scaleniu `redesign/piekarz-2026-10-22` albo na niej, zgoda M1 |
| Kod: dostęp | `konfiguracja.ts`: wszystkie funkcje darmowe, płatny tylko start ponad limit; usunięcie oferty przy pierwszym użyciu, banera „tylko historia”, uprzedzenia próby (`uprzedzenie.ts`), uprawnienia do oferty wprowadzającej w `sklep.ts`; ekran Pro tylko przy limicie i w Ustawieniach; „Zrealizuj kod” | 0,5 dnia | — |
| Testy | test „limit tylko się luzuje”; nowe asercje w testach kontraktu (bramki ekranów, oferta, uprzedzenie) z nowego kontraktu | w cenie wyżej | — |
| Teksty | licznik, komunikat limitu, ekran Pro (nazwa planu, okres, cena ze sklepu, opis bez liczb, ujawnienia 3.1.2, bez „No subscriptions”), 35 języków | 0,5 dnia + przekład (Message Batches) | zgoda na wydatek API przez M1 |
| Opis sklepu | „Free for 5 baking days every month. Pro removes the limit.” w 35 lokalizacjach, bez „free trial” | 0,5 dnia (rola 10) | przegląd ok. 15 min |
| App Store Connect | usunięcie Free Trial 2 Weeks z obu subskrypcji, wszystkie storefronty (MS-B21); notatka dla recenzji o limicie | M1, ok. 30 min | zgoda właściciela na zapis |
| Dokumenty | kontrakt w `docs/monetyzacja.md`, wpis decyzji zastępujący D-038/D-039, ER do roli 01 (BR-ZAK-004, BR-ZAK-005), rola 03 (podział), rola 04 (ekran Pro, licznik) | 0,5 dnia | — |
| Sandbox | zakup planów, przywracanie, limit, północ, wygaśnięcie Pro | — | ok. 30 min na telefonie; runner macOS 0:00–15:00 |

Razem [OCENA]: ok. 3–4 dni agenta, ok. 1 h właściciela; czekanie: przekład, scalenie przebudowy M3, recenzja 1.0.

### 6. Decyzje dla właściciela (rekomendacja pierwsza)
| # | Decyzja | Opcje | Rekomendacja |
|---|---|---|---|
| E2c-1 | N | (a) 5; (b) 3 („co dwa tygodnie”); (c) 10 („dwa razy w tygodniu”) | **(a) 5:** domyślne portfela i jedno zdanie dla typowego piekarza. (b) daje ok. 1,8 raza więcej (344 wobec 189), jeśli przychód ma pierwszeństwo; (c) prawie nic (41) |
| E2c-2 | Praca przez północ | (a) przerwa < 60 min od ostatniej czynności przy dowolnym wypieku (start albo ukończony krok); (b) liczona tylko od ostatniego startu; (c) bez wyjątku | (a): jak w Oczku; nocny krok i drugi bochenek po północy nie zjadają dnia |
| E2c-3 | Wejście zastępujące wypiek | (a) każda droga, która zapisuje wypiek z datą dziś bez prowadzenia, woła strażnika (dziś takiej nie ma: dziennik zapisuje tylko koniec prowadzonego wypieku i import); start planu i „Piecz ponownie” wołają go zawsze; (b) traktować jak dopisanie wstecz | (a): inaczej limit dałoby się obejść, gdy taka droga powstanie |
| E2c-4 | Pro wygasłe w miesiącu | (a) liczą się tylko dni bez Pro; (b) liczą się wszystkie dni | (a): zasada 5 wzorca |
| E2c-5 | Family Sharing | (a) zostaje włączony (stan od 2026-10-21); (b) wyłączyć | (a), bo (b) jest niemożliwe: „you can't turn it off” (MS-B05); to fakt, nie wybór, i zgadza się z kierunkiem portfela |
| E2c-6 | Ceny | (a) domyślne portfela 0,99 / 6,99 / 14,99 USD; (b) 3,99 / 14,99 / 19,99 USD; (c) 4,49 / 24,99 / 39,99 USD | **(a) na 1.0, przegląd przy odświeżeniu po 6 miesiącach:** spójność portfela i najtańsza oferta w niszy. Koszt wobec (b): 189 zamiast 293 USD/rok (−35%) w modelu, którego elastyczność ceny to [OCENA] z jednego raportu (RevenueCat). Podwyżka później jest możliwa: „You have the option to preserve the current price for existing subscribers if you increase the price.” (MS-B23). Wybierz (b), jeśli próg 500 ma pierwszeństwo przed spójnością portfela |
| E2c-7 | Dni wypieku w kopii | (a) w danych i w kopii, import łączy; (b) poza kopią | (a): zasada 13 wzorca, odstępstwo O-5 |
| E2c-8 | Model | (a) V3 wg wzorca; (b) V2 (odniesienie); (c) D-038 bez zmian | **(a):** usuwa próbę, która sama zamienia się w opłatę, nie wymaga nowych ID ani odpowiedzi App Review, jest spójne z portfelem. Koszt: w odczycie A 45% mniej niż D-038 (189 wobec 345); w odczycie B 4,6 raza mniej. Test po wydaniu (pkt 4) pokaże, który odczyt jest prawdziwy |

Wobec E2c zmieniam rekomendację z E2b w dwóch punktach: ceny (z 3,99 / 14,99 / 19,99 na domyślne portfela, z przeglądem po 6 miesiącach) i licznik (z „poza kopią” na „w kopii, import łączy”). Decyzja E2b-4 („Przerwij” w 30 min jako anulowanie) odpada: porzucenie nie zwraca dnia.

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
| MS-B11 | developer.apple.com/documentation/storekit/transaction/expirationdate (JSON) | opis | „The date the subscription expires or renews.” | 1 |
| MS-B12 | developer.apple.com/documentation/storekit/transaction/all (JSON) | lista | „Unfinished consumables Finished consumables that are refunded or revoked Non-consumables Auto-renewable subscriptions, including all renewals Auto-renewable subscriptions and non-consumables that the customer gets through Family Sharing” | 1 |
| MS-B13 | developer.apple.com/documentation/storekit/appstore/sync() (JSON) | Discussion | „Call this function only in response to an explicit user action”; „the app automatically has all transactions available to it upon initial launch” | 1 |
| MS-B14 | developer.apple.com/documentation/storekit/transaction/updates (JSON) | Discussion | „It also emits transactions that customers complete in your app on another device.” | 1 |
| MS-B15 | developer.apple.com/documentation/storekit/transaction/revocationdate (JSON) | opis | „The date that the App Store refunded the transaction or revoked it from Family Sharing.” | 1 |
| MS-B16 | github.com/hyodotdev/openiap, tag 4.0.3, `packages/apple/Sources/OpenIapStoreKitModule.swift:648–668`, `StoreKitTypesBridge.swift:248`; `node_modules/expo-iap/src/types.ts:1197` | kod | `for await verification in (onlyActive ? Transaction.currentEntitlements : Transaction.all)`; `if onlyActive, let expirationDate = transaction.expirationDate, expirationDate <= Date() { continue }` | 1 (kod biblioteki) |
| MS-B17 | eur-lex.europa.eu, CELEX 01998L0006-20220528 (PL) | art. 6a ust. 1–2 | cytat w tabeli prawa | 1 |
| MS-B18 | eur-lex.europa.eu, CELEX 52021XC1229(05) (PL), wytyczne do dyrektywy 2005/29/WE | pkt 1.2.5, 2.8.2 | cytaty w tabeli prawa | 1 (wytyczne Komisji) |
| MS-B19 | api.sejm.gov.pl/eli/acts/DU/2023/168/text.html | art. 4 ust. 2 | cytat w tabeli prawa; nowszego tekstu jednolitego w ELI brak (wyszukanie tytułu, 2026-10-22) | 1 |
| MS-B20 | itunes.apple.com/lookup (US, PL), apps.apple.com/<kraj>/app/id<id>, itunes.apple.com/<kraj>/rss/customerreviews/…/json | pola `formattedPrice`, sekcja In-App Purchases, recenzje | ceny i zliczenia w sekcji „Rynek”; cytaty z id recenzji w `audit/02-badanie-modelu-2026-10-22/rynek/raport-rynek.md` | ceny: 1 (dane platformy, D-035); recenzje: 5 (tylko motywy) |
| MS-B21 | developer.apple.com/help/app-store-connect/manage-subscriptions/set-up-introductory-offers-for-auto-renewable-subscriptions | „Delete an introductory offer” | kroki cytowane w E2b | 1 |
| MS-B23 | developer.apple.com/help/app-store-connect/reference/pricing-and-availability/in-app-purchase-and-subscriptions-pricing-and-availability | „Subscription Prices” | „You have the option to preserve the current price for existing subscribers if you increase the price.” | 1 |
| MS-B22 | europa.eu/youreurope/business/taxation/vat/vat-rules-rates/index_en.htm | tabela stawek | „PL Poland 23”; „Last checked: 13/07/2026” | 3 |

## Otwarte pytania
| ID | Pytanie | Rozstrzyga | Dotyczy |
|---|---|---|---|
| OP-B01 | [DO USTALENIA] status przeglądu `.pro.monthly`, `.pro.yearly`, `.pro.lifetime` w App Store Connect (wysłane do App Review czy nie); czeka na M1 | M1 (odczyt na sucho) | E0-4, koszt zmiany |
| OP-B02 | [DO USTALENIA] czy aplikacja z Non-Renewing Subscription i Non-Consumable jest „non-subscription app” w 3.1.1, czyli czy wolno jej dać próbę 0 zł „14-day Trial”; wysłane przez właściciela 2026-10-22 formularzem App Review „Other App Review questions”, jedno pytanie dla Piekarza, Oczka i Treningu (Related Apps, tekst rozszerzony o trzy aplikacje), Case ID 103004967270; potwierdzenie Apple: „We’ll review your message and get back to you as soon as possible.”; czeka na odpowiedź (treść bazowa wyżej); pośrednio rozstrzygnie też pierwsza recenzja Oczka albo Treningu z tym modelem | App Review | V1, V2 |
| OP-B03 | [DO USTALENIA] czy istnieje próg 2,49 USD i próg 0 dla Non-Renewing Subscription / Non-Consumable, wpływ (`proceeds`) progów; czeka na M1 | M1 (App Store Connect API, odczyt) | rachunek E2 |
| OP-B04 | [DO USTALENIA] czy StoreKit wypełnia `expirationDate` dla subskrypcji nieodnawialnej i czy jej transakcja dociera na drugie urządzenie przez `currentEntitlements`/`updates` | właściciel: sandbox lub TestFlight po E3 | adapter, wektory |
| OP-B05 | [DO USTALENIA] czy systemowy arkusz zakupu Non-Renewing Subscription pokazuje słowo „subscription” (zgodność z nagłówkiem „No subscriptions”) | właściciel: sandbox po E3 | tekst ofert |
| OP-M01 | rozstrzygnięte 2026-10-22: Small Business Program aktywny, 15% (słowa właściciela wyżej) | właściciel | rachunek |

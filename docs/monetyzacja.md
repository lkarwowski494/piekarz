# Monetyzacja: Piekarz (Crust)
Stan: E0 (rola 02 build, sesja 2, sztafeta 01–04) · Aktualizacja: 2026-10-19 · Wejście: BRD roli 01 (`docs/brd/`, gałąź `claude/01-odkrywanie-2026-10-19-279a7f`, 0eefab1), ZAL-034, ZAL-038, ZAL-042…ZAL-044 · Model: DEC-01 (d) planu napraw M1 (nie otwierany)

Jedyny dokument monetyzacji. `docs/monetyzacja-audyt.md` i `docs/PROGRESSIVE_DISCLOSURE_AND_MONETIZATION.md` to historia bez źródeł (D-033). Bramka opłacalności i macierz wariantów z 2026-10-19 leżą poza repo (`audit/02-oplacalnosc-2026-10-19/`, `audit/02-warianty-2026-10-19/`); tu trafiają tylko wyniki, stawki i [OCENA]. Surowe odczyty tej sesji: scratchpad sesji (poza repo).

## E0: rama

### Środowisko (2026-10-19)
| Sprawdzenie | Wynik |
|---|---|
| System, Node, git | Windows 11 (10.0.26300), Node 24.20.0, worktree czysty na 0eefab1 |
| GitHub | `gh` 2.102.0; repo publiczne (`origin` lkarwowski494/piekarz); push nie jest potrzebny (commity lokalne) |
| Sieć | działa: `developer.apple.com`, `apps.apple.com`, `itunes.apple.com/lookup`, `api.nbp.pl`, `registry.npmjs.org` (kod 200) |
| Mac / Xcode | brak: testy StoreKit (plik `.storekit`, sandbox, TestFlight) to krok właściciela |
| App Store Connect | aplikacja w TestFlight (`CLAUDE.md`, „Stan projektu”); umowa Paid Apps i zapis do Small Business Program: [DO USTALENIA] (OP-M01) |
| Kod płatności | istnieje (partia 2): `expo-iap` 6.1.1, `src/lib/platnosci/` (`dostep.ts`, `sklep.ts`, `stan.ts`, `konfiguracja.ts`), ADR-007 (przyjęta); bez zakupu działa tylko `historia` i `dane` (`src/lib/platnosci/konfiguracja.ts`, `BEZ_UPRAWNIENIA`) |

### Wejście roli 01 jako hipotezy
| ID | Treść (skrót) | Status w BRD | Co z nim robi ta rola |
|---|---|---|---|
| H-03 / ZAL-042 | o uczciwości decyduje przejrzystość opłat, nie kwota | hipoteza | E1: dowód z recenzji; E3: ujawnienia dla 04 |
| H-04 / ZAL-043 | „tylko historia” po próbie odebrana jak zabranie danych | hipoteza | E2: opcje komunikatu (OP-47) |
| H-05 / ZAL-044 | płacą za prowadzenie w czasie i liczenie; część woli jednorazowo | hipoteza | E1: WTP; E2: udział dożywotniego w rachunku |
| H-07 / ZAL-034 | założenie zakwasu może nie zmieścić się w 14 dniach | ZAL-034 potwierdzone (szczebel 3, 7–10 dni), H-07 hipoteza | E2: opcje (OP-48) |
| H-14 / ZAL-038 | App Store Connect pokazuje przejście z próby do płatnego bez telemetrii | hipoteza, OP-33 | E1: odczyt dokumentacji Apple |
| ZP-18 | „dojeżdżamy konkurencję ceną i przejmujemy wolumen” | słowa właściciela | ryzyko nazwane w DEC-01: niska cena ma podnieść wolumen ok. 2×; E2: przeliczenie kryterium eksperymentu |
| tabela rynku (S-28) | ceny 12 aplikacji z 2026-10-19 | odczyt roli 02 | próbka dziś (niżej) zgodna |

Próbka rynku dziś (karty `apps.apple.com`, adnotacja „In-App Purchases”, 2026-10-19 ok. 23:15): Rise US 3,99/4,99 mies., 8,99 kwartał, 14,99/19,99 rok, 19,99 USD jednorazowo; PL 19,99/29,99, 49,99, 79,99/99,99, 99,99 zł. Flourwise US 4,49 / 24,99 / 59,99 USD, PL 14,99 / 79,99 / 199,99 zł. Kneady US mies. 3,49–6,99, rok 19,99–29,99 USD (nowy próg 21,99); PL rok 99,99–199,99 zł (nowy próg 129,99). Zgodne z tabelą roli 02 z 18:30 poza dwoma dodatkowymi progami Kneady (testy cen).

### Uwagi do wejścia (bez otwierania DEC-01 d)
- **U-1. Bramka nie liczyła tego podziału.** Wariant (a) właściciela (345 USD/rok, „przerobić”) liczono z darmowym rdzeniem DEC-09 (mnożnik podziału 1). DEC-01 d `podzial` to w praktyce twarda ściana z okresem próbnym: przed próbą i po niej działa tylko przegląd historii i prawa do danych. RevenueCat 2026 (odczyt roli 02 2026-10-19): „Hard paywall median: 10.7% … Freemium median: 2.1%”. Kryterium eksperymentu przeliczę w E2 dla tego podziału, a nie tylko dla cen (`eksperyment.kryterium_do_przeliczenia`).
- **U-2. Główna praca przed zakupem.** Zasada roli: główna praca dostępna przed zakupem, chyba że dowody wskazują inaczej. DEC-01 d daje ją tylko po rozpoczęciu okresu próbnego subskrypcji (potwierdzenie Apple ID, odnowienie po 14 dniach). Właściciel to wybrał; w E2 pokażę skutki (ujawnienia 3.1.2, ryzyko recenzji H-03) bez zmiany decyzji.
- **U-3. ADR biblioteki już jest.** ADR-007 (przyjęta, partia 2) wybrała `expo-iap` 6.1.1. Zamiast nowego szkicu proponuję aneks do ADR-007: licencja (MON-14), okres karencji, Family Sharing, test na urządzeniu.

### Reguły sklepu na dziś
Odczyt surowego tekstu (`curl`, potem tekst bez znaczników) 2026-10-19 ok. 23:12. Tabela „Źródła” niżej.

## Źródła
| ID | Adres | Miejsce | Cytat | Odczyt | Szczebel | Przegląd |
|---|---|---|---|---|---|---|
| MS-01 | developer.apple.com/app-store/review/guidelines/ | stopka | „Last Updated: October 16, 2026” | 2026-10-19 | 1 | przed wysłaniem do sklepu |
| MS-02 | jw. | 3.1.1 | „Apps may not use their own mechanisms to unlock content or functionality, such as license keys, augmented reality markers, QR codes…” | 2026-10-19 | 1 | jw. |
| MS-03 | jw. | 3.1.1 | „you should make sure you have a restore mechanism for any restorable in-app purchases” | 2026-10-19 | 1 | jw. |
| MS-04 | jw. | 3.1.1 | „Non-subscription apps may offer a free time-based trial period before presenting a full unlock option by setting up a Non-Consumable IAP item at Price Tier 0…” | 2026-10-19 | 1 | jw. |
| MS-05 | jw. | 3.1.2(a) | „you must provide ongoing value to the customer, and the subscription period must last at least seven days and be available across all of the user’s devices” | 2026-10-19 | 1 | jw. |
| MS-06 | jw. | 3.1.2(a) | „Auto-renewable subscription apps may offer a free trial period to customers by providing the relevant information set forth in App Store Connect.” | 2026-10-19 | 1 | jw. |
| MS-07 | jw. | 3.1.2(a) | „you should not take away the primary functionality existing users have already paid for” | 2026-10-19 | 1 | jw. |
| MS-08 | jw. | 3.1.2(a) | „trick users into purchasing a subscription under false pretenses or engage in bait-and-switch” | 2026-10-19 | 1 | jw. |
| MS-09 | jw. | 3.1.2(c) | „Before asking a customer to subscribe, you should clearly describe what the user will get for the price.” | 2026-10-19 | 1 | jw. |
| MS-10 | jw. | 3.2.2(x) | „Apps must not force users to rate the app, review the app, download other apps, or other store-related actions in order to access functionality” | 2026-10-19 | 1 | jw. |
| MS-11 | jw. | 4.2 | „If your App doesn’t provide some sort of lasting entertainment value or adequate utility, it may not be accepted.” | 2026-10-19 | 1 | jw. |
| MS-12 | jw. | 4.3(b) | „simple timers, and fortune telling, are well established on the App Store and we will not accept new submissions unless they offer a meaningfully different or improved experience” | 2026-10-19 | 1 | jw. |
| MS-13 | jw. | 5.6 | „Apps should never prey on users or attempt to rip off customers, trick them into making unwanted purchases…” | 2026-10-19 | 1 | jw. |
| MS-14 | developer.apple.com/app-store/subscriptions/ | „Free trials” | „clearly indicate how long the free trial lasts and the price billed once the free trial is over” | 2026-10-19 | 1 | jw. |
| MS-15 | jw. | „Billing amount” | „the amount that will be billed must be the most prominent pricing element in the layout” | 2026-10-19 | 1 | jw. |
| MS-16 | jw. | lista elementów ekranu | „A way for current subscribers to sign in or restore purchases”; „your app and App Store metadata must include links to your Terms of Use and Privacy Policy” | 2026-10-19 | 1 | jw. |
| MS-17 | jw. | zarządzanie | „You can also use the showManageSubscriptions(in:) method to allow them to do this within your app.” | 2026-10-19 | 1 | jw. |
| MS-18 | developer.apple.com/help/app-store-connect/manage-subscriptions/set-up-introductory-offers-for-auto-renewable-subscriptions | tabela czasu ofert | Free Trial dla planu 1 miesiąc i 1 rok: „3 Days. 1 or 2 Weeks. 1, 2, 3, or 6 Months. 1 Year.”; „each person is only eligible to redeem one introductory offer per subscription group” | 2026-10-19 | 1 | jw. |
| MS-19 | developer.apple.com/help/app-store-connect/configure-in-app-purchase-settings/turn-on-family-sharing-for-in-app-purchases | uwaga | „once you turn on Family Sharing for an In-App Purchases in App Store Connect, you can't turn it off” | 2026-10-19 | 1 | jw. |
| MS-20 | developer.apple.com/app-store/small-business-program/ | „The basics” | „a reduced commission rate of 15% on paid apps and Apple In-App Purchases”; warunek „up to 1 million USD in proceeds in the prior calendar year” | 2026-10-19 | 1 | przy zmianie ceny |
| MS-21 | api.nbp.pl/api/exchangerates/rates/a/usd/ | tabela A | USD 3,8974; EUR 4,3702 (tabela 203/A/NBP/2026 z 2026-10-19) | 2026-10-19 | 1 | przy każdym rachunku |
| MS-22 | registry.npmjs.org/expo-iap/6.1.1 i paczka `expo-iap-6.1.1.tgz` | `license`, `LICENSE`, `ios/ExpoIap.podspec` | „MIT License … Copyright (c) 2025 hyochan”; zależność natywna `openiap` 4.0.3; brak zależności npm | 2026-10-19 | 1 | przy aktualizacji biblioteki |
| MS-23 | raw.githubusercontent.com/hyodotdev/openiap/main/LICENSE | plik | „MIT License … Copyright (c) 2025 hyo.dev” (gałąź main, nie tag 4.0.3) | 2026-10-19 | 1 | jw. |

Z odczytu innej sesji roli 02 z tego samego dnia (nie czytane ponownie, wyjątek jak D-037): VAT PL 23% (europa.eu/youreurope, „Last checked: 13/07/2026”), prowizja bez programu 30%, w UE 26% (DPLA Schedule 2 pkt 3.4(a), Attachment 14), RevenueCat „State of Subscription Apps 2026” (`audit/02-warianty-2026-10-19/dowody/revenuecat-2026.txt`).

## Plan (E1–E3)
| Etap | Praca | Moduły | Czas agenta | Czekanie / właściciel |
|---|---|---|---|---|
| E1 (sesja 2: tylko E1.3–E1.4) | WTP dla 50 BR z poziomem dowodu; WTP-X dla 03; H/ZAL ze statusem; OP-33 z dokumentacji App Store Connect; bramka jako hipoteza (bez nowego skanu, D-037) | `cena-i-rachunek` | ok. 60 min | STOP: ok. 10 min |
| E2 | dwie i więcej opcji wykonania DEC-01 d (bez zmiany modelu): mechanizm próby, Family Sharing, OP-47, OP-48, komunikat H-04; `rachunek.json` + `rachunek.mjs` (kod 0) dla PL i US; przeliczenie kryterium eksperymentu dla miksu i twardej ściany | `cena-i-rachunek`, `rachunek` | ok. 75 min | STOP: 4–5 decyzji, ok. 20 min |
| E3 | kontrakt płatności (produkty, uprawnienia, bramki przy PR, przywracanie, bez sieci, ujawnienia), aneks do ADR-007, przekazanie dla 03/04/05/07/08, `docs/sztafeta.md` | `storekit-expo` | ok. 60 min | STOP: ok. 10 min; potem kroki w App Store Connect |

## Otwarte pytania
| ID | Pytanie | Rozstrzyga | Dotyczy |
|---|---|---|---|
| OP-M01 | [DO WYJAŚNIENIA] czy umowa Paid Apps jest podpisana, a konto zapisane do Small Business Program (15% zamiast 30%/26%) | właściciel | rachunek, E3 |

# Monetyzacja: Piekarz (Crust)
Stan: E2 (rola 02 build, sesja 2, sztafeta 01–04) · Aktualizacja: 2026-10-19 · Wejście: BRD roli 01 (`docs/brd/`, gałąź `claude/01-odkrywanie-2026-10-19-279a7f`, 0eefab1), ZAL-034, ZAL-038, ZAL-042…ZAL-044 · Model: DEC-01 (d) planu napraw M1 (nie otwierany)

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

## E1: dowody (sesja 2: E1.3–E1.4)

Model i podział są stałe (DEC-01 d; potwierdzenie właściciela w czacie 2026-10-19: „decyzja o monetyzacji jest stala i podjeta wczesniej. MIX sub + lifetime. 0.99USD/mies 6.99USD rok 14.99 USD lifetime. 14 dni triala full wersji. Pozniej jedynie historia i dane.”). Klasa WTP niżej to dowód dla roli 03 (zakres, WTP-X) i dla rachunku, nie propozycja zmiany podziału. Kolumna „Miejsce” podaje skutek DEC-01 d.

### Rynek (odczyt 2026-10-19)
Ceny i oceny: tabela rynku BRD (`docs/brd/odkrywanie.md`, S-28, S-29) i próbka z E0 (zgodna). Nowe tu: za co konkurenci każą płacić (opisy w sklepie, `itunes.apple.com/lookup`, odczyt roli 02 2026-10-19 18:35, MS-25) i motywy recenzji o cenie (MS-26).

| Aplikacja | Model | Co jest płatne (opis w sklepie) | Motyw recenzji o cenie (MS-26) |
|---|---|---|---|
| Rise | darmowa + mies./kwartał/rok + jednorazowy | „Unlock all recipes with flexible purchase options.” | prowadzenie w czasie „well worth the purchase” (S-14, rec. 13671458068) |
| Yeasta | mies./rok/dożywotni | Pro: „Fully guided bake sessions with live timers and lock screen updates - Unlimited starters - Advanced planning and revival tools - Full baking history…”; Levain Builder, Fridge Starter Planner, Starter Revival; eksport CSV „free” | zakup nie odblokował funkcji (Yeasta/us, 2026-05-09, 1★) |
| Flourwise | mies./rok/dożywotni | „Some features and higher usage limits require Pro.” | brak recenzji |
| Sourdough Starter Tracker | jednorazowy | „One-time purchase unlocks Smart Health Tips and removes ads”; wiele zakwasów | „Totally worth it if you do sourdough often to pay for the app” (SST/us, 2026-04-11, 5★) |
| Kneady | darmowa + mies./rok | przepisy Pro; timery, tryb pieczenia i jednostki w darmowej części | skargi na przepisy za ścianą płatności (2 z 2 o cenie, 4★) |
| Loaflo | tydz./mies./rok, twarda ściana poza przepisami | skan AI, plan zakwasu | 12 z 13 recenzji o subskrypcji ≤ 3★: nieujawniona subskrypcja, wyskakujący ekran z odliczaniem, brak próby, kłopot z anulowaniem |
| Gluten Morgen | darmowa + reklamy + Premium 1,49 USD | dodatkowe przepisy | reklamy (4 z 5 o reklamach 1★); spiżarnia z kosztem chwalona (2026-06-28, 5★) |

Liczby z próbki MS-26: 38 recenzji z filtrem ceny; 16 o ścianie płatności, subskrypcji, próbie lub anulowaniu, 13 z nich ≤ 3★ (12 z Loaflo); 5 o reklamach; 5 o „worth”/zakupie jednorazowym. To zliczenie motywów (szczebel 5), nie skala.

### Wartość funkcji
Poziom dowodu: R rynek (MS-25, MS-26, S-27 z adresem i datą), B dowód potrzeby z BRD, H hipoteza. „Warunek” = wymaganie sklepu, prawa albo jakości, nie funkcja do sprzedaży. Prawa do danych nigdy nie są płatne.

| Wymaganie (BR) | Funkcja | WTP | Dowód | Miejsce (DEC-01 d) |
|---|---|---|---|---|
| BR-KALK-001 | procent piekarski | WTP-0 | B: J-01 główna praca; R: darmowe kalkulatory (Gluten Morgen, Pizza Pro) | próba / płatna |
| BR-KALK-002 | hydratacja z zakwasu i zaczynu | WTP-0 | B: J-01; R: skarga S-17 rec. 6280671939 | próba / płatna |
| BR-KALK-003 | skalowanie, 1 g | WTP-2 | R: S-19 rec. 12569511193 | próba / płatna |
| BR-KALK-004 | temperatura wody (DDT) | WTP-2 | R: S-14 rec. 9331408199 | próba / płatna |
| BR-KALK-005 | kilka mąk | WTP-2 | R: S-21 rec. 13060223498 | próba / płatna |
| BR-KALK-007 | objętość → gramy | WTP-2 | R: 9 z 338 (S-27) | próba / płatna |
| BR-KALK-008 | masa lodu | WTP-X | tylko [OCENA] w BRD, bez recenzji | do roli 03 |
| BR-KALK-009 | rodzaj drożdży | WTP-2 | R: S-19 rec. 7107716082 | próba / płatna |
| BR-KALK-010 | poolish, biga, levain | WTP-1 | R: Yeasta Pro „Levain Builder” (MS-25); S-24 rec. 7357117590 | próba / płatna |
| BR-KALK-011 | nietypowa ilość soli | WTP-2 | R: S-24 rec. 5681544617 (słaby) | próba / płatna |
| BR-UST-001 | jednostki | WTP-2 | R: 9 z 338, 6 ≤ 3★; u Kneady darmowe (MS-25) | próba / płatna |
| BR-HARMO-001 | plan wstecz od godziny | WTP-1 | R: Yeasta Pro „Advanced planning”, „Fridge Starter Planner” (MS-25); 15 z 338 | próba / płatna |
| BR-HARMO-002 | plan omija sen | WTP-2 | B: soczewka początkującego, kod | próba / płatna |
| BR-HARMO-003 | czas fermentacji z temperatury | WTP-2 | R: S-14 rec. 8937437575 | próba / płatna |
| BR-HARMO-004 | przesunięcie kroku | WTP-2 | R: S-14 rec. 7282073654 | próba / płatna |
| BR-ETAP-001 | prowadzenie krok po kroku | WTP-1 | R: Yeasta Pro „Fully guided bake sessions”; Rise S-14 rec. 13671458068 | próba / płatna |
| BR-ETAP-002 | kroki z receptury | WTP-2 | B: D-030, S-56, S-57 | próba / płatna |
| BR-ETAP-003 | ocena gotowości ciasta | WTP-X | tylko soczewka eksperta i [OCENA], bez recenzji | do roli 03 |
| BR-ETAP-004 | ostrzeżenia bezpieczeństwa | warunek | RD-22, RD-23 (bezpieczeństwo) | zawsze w kroku, którego dotyczy |
| BR-ETAP-005 | wznowienie wypieku | warunek | jakość, bloker wydania | jak wypiek |
| BR-CZAS-002 | sygnał przy zablokowanym telefonie | WTP-1 | R: Yeasta Pro „live timers and lock screen updates”; BreadMe płatna (2,99 USD) za przypomnienia; 15 z 338 | próba / płatna |
| BR-CZAS-003 | brak zgody na powiadomienia | warunek | RYZ-13 | jak wypiek |
| BR-REKA-001 | ekran nie gaśnie | WTP-2 | R: 2 z 338 (słaby) | próba / płatna |
| BR-ZAKW-001 | karta zakwasu, kilka zakwasów | WTP-1 | R: Yeasta Pro „Unlimited starters”; SST wiele zakwasów (MS-25) | próba / płatna |
| BR-ZAKW-002 | dokarmianie z proporcją | WTP-2 | R: S-20 rec. 13947658962; SST kalkulator chwalony przez płacącego (MS-26) | próba / płatna |
| BR-ZAKW-003 | gotowość zakwasu | WTP-1 | R: SST Premium „rise timing” (MS-25) | próba / płatna |
| BR-ZAKW-004 | przypomnienie o dokarmieniu, ostrożność | WTP-1 | R: BreadMe, SST (MS-25); S-15 rec. 6706510871. Zasada ostrożności RD-21 to warunek | próba / płatna; ostrzeżenie RD-21 zawsze |
| BR-ZAKW-005 | założenie zakwasu dzień po dniu | WTP-1 | R: Yeasta Pro „Starter Revival … day-by-day feeding schedule”; Loaflo obiecuje płatnie (rec. 13931423989) | próba / płatna |
| BR-ZAKW-006 | obudzenie zakwasu z lodówki | WTP-1 | R: Yeasta „Fridge Starter Planner” | próba / płatna |
| BR-ZAKW-007 | poprawa wpisu | WTP-2 | R: S-21 rec. 12986088850 | próba / płatna |
| BR-RECP-001 | receptury bazowe | WTP-1 | R: Rise „Unlock all recipes”, Kneady Pro (MS-25); skargi na przepisy za ścianą (MS-26) | próba / płatna |
| BR-RECP-002 | własne receptury | WTP-1 | R: Yeasta Pro „Unlimited favorite and custom recipes”; limit 25 receptur w Gluten Morgen jako skarga (MS-26) | próba / płatna; odczyt zapisanych zawsze |
| BR-RECP-003 | dziennik z oceną | WTP-1 | R: Yeasta Pro „Full baking history” | nowy wpis: próba / płatna; przegląd historii zawsze |
| BR-RECP-004 | porównanie wypieków | WTP-2 | R: S-14 rec. 8937437575 (słaby) | próba / płatna |
| BR-SPIZ-001 | spiżarnia mąk | WTP-2 | R: Gluten Morgen, spiżarnia z kosztem 5★ (MS-26); D-034 | próba / płatna |
| BR-NAUK-001 | Akademia | WTP-2 | R: 14 z 338 o instrukcjach; ZP-20 | próba / płatna |
| BR-DIAG-001 | Doktor dla bochenka | WTP-1 | R: Loaflo płatny skan (MS-26, także skargi na zawodność) | próba / płatna |
| BR-DIAG-002 | Doktor dla zakwasu | WTP-1 | R: Yeasta „Starter Smell Guide”, SST Premium „smell diagnostics” (MS-25) | próba / płatna; ostrzeżenie RD-21 zawsze |
| BR-WSP-003 | receptura w QR | WTP-2 | H: ZAL-029; prośby o import/eksport, nie o QR (3 z 338) | próba / płatna |
| BR-DRUK-001 | wydruk karty i etykiety | WTP-2 | R: 1 prośba (S-18 rec. 10632970976), słaby | próba / płatna |
| BR-DANE-001 | trwały zapis | warunek | zasada wspólna 10 | zawsze |
| BR-DANE-002 | kopia poza telefonem | warunek (dane) | J-10, RYZ-12 | zawsze |
| BR-DANE-003 | eksport i import | prawo do danych | DEC-01 d; Yeasta: eksport CSV „free” | eksport zawsze; import: OP-M02 |
| BR-DANE-004 | usunięcie danych | prawo do danych | DEC-01 d | zawsze |
| BR-ZAK-001 | zakup i przywrócenie | warunek | MS-02, MS-03 | zawsze |
| BR-ZAK-003 | oferta bez ukrytych warunków | warunek | MS-14…MS-16; MS-26 (Loaflo) | zawsze |
| BR-ZAK-004 | stan po próbie | warunek | DEC-01 d | zawsze |
| BR-ZAK-005 | oferta przy pierwszym użyciu | warunek | DEC-01 d | zawsze |
| BR-UST-003 | polityka prywatności | warunek | OG-04 | zawsze |
| BR-PRYW-001 | bez konta, sieci, śledzenia | warunek | ZP-17; reklamy 1★ (MS-26) | zawsze |

Podsumowanie: WTP-0: 2, WTP-1: 14, WTP-2: 19, WTP-X: 2, warunki i prawa do danych: 13 (razem 50).

### Wnioski E1 (hipotezy)
- **WTP-X dla roli 03 (zasada wspólna 18):** BR-KALK-008 (masa lodu), BR-ETAP-003 (ocena gotowości ciasta). Kandydaci na listę odcięć albo do sprawdzenia w rozmowach (D-036).
- **Płatna część ma dowód płacenia.** 14 funkcji WTP-1 to te, które konkurenci sprzedają w Pro (prowadzenie z sygnałem, planowanie, kilka zakwasów, dziennik, receptury, diagnoza zakwasu). Model DEC-01 d sprzedaje więc rzeczy, za które rynek płaci; różnica to cena (22–28% median, bramka wariantów).
- **WTP-0 za próbą to ryzyko do pomiaru, nie zmiana.** BR-KALK-001 i BR-KALK-002 są w kategorii darmowe, a w DEC-01 d wymagają próby. Za twardą ścianą: RevenueCat 2026 „Hard paywalls convert 5× better than freemium” (MS-27). Przeciw: 12 z 13 skarg o subskrypcji dotyczy Loaflo, czyli twardej ściany bez jawności (MS-26). Wniosek dla 04: jawność przed próbą (H-03) jest warunkiem tej ściany, a nie dodatkiem.
- **H-14 / ZAL-038 potwierdzone (szczebel 1):** raport zdarzeń subskrypcji ma zdarzenia „Free Trial”, „Paid Subscription from Introductory Price”, „Renew”, „Cancel” z datą i krajem, a Sales and Trends ma strony „summary, retention, state, and event” (MS-24). ZP-21 da się mierzyć bez telemetrii. OP-33 rozstrzygnięte.
- **Import po próbie (OP-M02):** DEC-01 d mówi „eksport i usunięcie”; import pliku (BR-DANE-003) to dodanie danych. Rozstrzygnięcie w E2 w granicach DEC-01 d.
- **Bramka jako hipoteza:** wynik 345 USD/rok (wariant a) liczono dla freemium; konwersja przy twardej ścianie i wolumen z niskiej ceny to nowe ZAL-049, ZAL-050 (status „hipoteza”). Przeliczenie kryterium eksperymentu: E2.
- **Sprzeczności z wejściem roli 01:** brak (ER nie są potrzebne). OP-33 zmienia status na rozstrzygnięty w rejestrze założeń (ZAL-038).

## E2: model i rachunek

### Opcje modelu
Model jest stały (D-038). Opcja B to zapis historyczny wymagany przez kontrakt roli (co najmniej dwa modele z regułą i rachunkiem), **nie do ponownego rozpatrzenia**.

#### Opcja A (wybrana, stała): subskrypcja mies. + rok w jednej grupie i dożywotni, 0,99 / 6,99 / 14,99 USD, 14 dni pełnej wersji, potem tylko historia i dane
- Reguła sklepu: subskrypcja „must provide ongoing value … at least seven days … available across all of the user’s devices” (MS-05); okres próbny „by providing the relevant information set forth in App Store Connect” (MS-06), czyli oferta wprowadzająca „Free Trial”, 2 tygodnie (MS-18); jedna oferta na grupę (MS-18), więc kto wypróbował miesięczny, nie dostanie drugiej próby na rocznym. Dożywotni: Non-Consumable z przywracaniem (MS-03).
- Rachunek: niżej; bramka wariantów 345 USD/rok, scen. norm. (freemium), werdykt „przerobić”, ryzyko nazwane w D-038.
- Ryzyko etyczne: twarda ściana po próbie przypomina wzorzec skarg Loaflo (MS-26). Ochrona: jawność przed startem próby (MS-09, MS-14, MS-15), brak odliczania i wyskakiwania w głównej pracy, dane zawsze dostępne (D-039). Druga strona: kto chce tylko dożywotniego, a zaczął próbę subskrypcji, musi ją anulować, bo inaczej po 14 dniach zapłaci także za subskrypcję. Ujawnienie dla 04 w kontrakcie (U-D3).
- Koszt utrzymania: 3.1.2(a) wymaga stałej wartości, więc subskrypcja to zobowiązanie do regularnych aktualizacji z treścią (receptury, profile, mapy mąk z 35 języków, narzędzia z dowodem wartości). Zakres i rytm ustala rola 03; to warunek sklepu, nie zmiana modelu.

#### Opcja B (odrzucona 2026-10-19, historia): ten sam układ planów w medianach konkurencji 4,49 / 24,99 / 39,99 USD z darmowym rdzeniem
- Reguła sklepu jak w A. Bramka: 682 USD/rok (scen. norm.). Właściciel wybrał A (D-038, DEC-01 d).

Rekomendacja: A (wybór właściciela, stały) · Decyzja właściciela: D-038, D-039 (2026-10-19).

### Decyzje wykonawcze (D-039, słowa właściciela: „1. zgodnie z rekomendacja 2. 3 dni 3. Mozemy dopuscic 4. Tak.”)
| Sprawa | Decyzja |
|---|---|
| Import pliku po próbie (OP-M02) | działa zawsze, jak eksport i usunięcie |
| Uprzedzenie przed końcem próby (OP-47) | 3 dni |
| Wypiek trwający w chwili wygaśnięcia (OP-48) | prowadzi się do końca; nowego wypieku nie da się zacząć |
| Family Sharing | włączony dla obu subskrypcji i dożywotniego (nieodwracalne, MS-19) |
| Komunikat „co zostaje po próbie” (H-04) | tak, w uprzedzeniu 3 dni przed końcem i w chwili wygaśnięcia, z jednym zdaniem, że przypomnienia o dokarmianiu ustaną (rekomendacja roli 01, BR-ZAK-004) |
| Czas założenia zakwasu przy starcie próby (H-07) | na ekranie oferty jedno zdanie, że założenie zakwasu zwykle trwa 7–10 dni (RD-24, S-44), więc mieści się w 14 dniach (rekomendacja roli 01; tekst ustala 04, treść 06) |

## Opłacalność (2026-10-19, próg: 500 USD netto/rok globalnie, D-024)
Bramka z 2026-10-19 jako hipoteza (sesja 2, bez nowego przebiegu `oplacalnosc.mjs`): wariant a (ceny DEC-01 d) 3,45 / 344,77 / 26 381 USD pes./norm./opt., sam iOS 218 USD, 46,4 płacących/rok przy ok. 2 200 pobraniach/rok (iOS + Google Play; `audit/02-warianty-2026-10-19/dowody/porownanie-wariantow.txt`, kod 0). Liczono z darmowym rdzeniem (freemium); DEC-01 d to twarda ściana z próbą (ZAL-050), której bramka nie liczyła. Standard marki: wysoki (bez reklam, bez sieci; `CLAUDE.md`). Werdyktu się nie zmienia; kryterium eksperymentu niżej mierzy, czy model osiąga próg.

### Kryterium eksperymentu dla DEC-01 d (przeliczone, `eksperyment.kryterium_do_przeliczenia`)
Rachunek `rachunek-us.json` (lejek „kryterium iOS”), rok 1, sam iOS, prowizja 15%:
- wpływ na płacącego w 1. roku: miesięczny 0,84 USD × 4,26 płatności = 3,58; roczny 5,94; dożywotni 12,74; średnio przy udziałach 0,486 / 0,346 / 0,168 [OCENA, RevenueCat przez bramkę] **5,94 USD**;
- do 500 USD netto potrzeba **ok. 84 płacących/rok, czyli ok. 7 nowych płacących miesięcznie**, albo **ok. 42 USD wpływu miesięcznie** (App Store Connect, „proceeds”);
- przy tempie pobrań z bramki (993 iOS/rok, ok. 83/mies.) to **konwersja pobranie → płacący ok. 8,5%**. Dla porównania: mediana twardej ściany 10,7%, freemium 2,1% (MS-27); bramka zakładała 4,66% (freemium), przy której potrzeba ok. 150 pobrań iOS/mies.

**Kryterium po 90 dniach od wydania (zastępuje „~245/mies. przy 3%”):** w dniach 30–90 średnio ≥ 7 nowych płacących miesięcznie na iOS (zdarzenia „Paid Subscription from Introductory Price” + zakupy dożywotniego, MS-24) albo wpływ ≥ 42 USD/mies.; poniżej połowy (≤ 3,5 płacących albo ≤ 21 USD/mies.) — zamrożenie rozwoju, jak w kryterium M1. Dane: tylko App Store Connect, bez telemetrii (ZAL-038). Przy samym roku 1 z odnowieniami miesięcznymi w toku wynik dnia 90 zaniża przychód roczny; kryterium liczy więc płacących, nie przychód skumulowany. Kryterium mierzy model, nie otwiera go (D-038).

## Rachunek
`docs/monetyzacja/rachunek.mjs` (skrypt roli 02) na `docs/monetyzacja/rachunek.json` (PL) i `docs/monetyzacja/rachunek-us.json` (US, kryterium); 2026-10-19, kod wyjścia 0 dla obu:

```
Rachunek z 2026-10-19 (PLN); VAT 23%; prowizja 15% (Small Business Program, OP-M01)
Koszt roczny: Apple Developer Program 99 USD × 3,8974 (NBP 203/A/NBP/2026) = 385,84 PLN
mies-PL: cena 4,99 → bez VAT 4,06 → prowizja 15% → wpływ 3,45; rocznie na płacącego 14,69; próg: 27 płacących/rok
rok-PL: cena 29,99 → bez VAT 24,38 → wpływ 20,72; próg: 19 płacących/rok
dozywotni-PL: cena 79,99 → bez VAT 65,03 → wpływ 55,28; próg: 7 płacących/rok
rok-PL-bez-programu: prowizja 30% → wpływ 17,07; próg: 23 płacących/rok
```
```
Rachunek z 2026-10-19 (USD); VAT 0% [OCENA]; prowizja 15%; próg 500 USD netto zamiast kosztów
mies-US: 0,99 → wpływ 0,84; rocznie 3,58; próg 140 płacących/rok
rok-US: 6,99 → wpływ 5,94; próg 85
dozywotni-US: 14,99 → wpływ 12,74; próg 40
Lejek „kryterium iOS”: mies. 41,0 płacących → 147,02 USD (29%); rok 29,2 → 173,46 (35%); dożywotni 14,2 → 180,93 (36%); razem 84,4 płacących, ok. 100% progu
```
Wpływ to szacunek: po ustawieniu cen w App Store Connect wpisz `wplyw_z_asc` (proceeds progu) i uruchom ponownie. Podatek dochodowy i składki poza rachunkiem.

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
| MS-24 | developer.apple.com/help/app-store-connect/reference/reporting/subscription-event-report; …/measure-app-performance/overview-of-reporting-tools | przykład raportu; opis Sales and Trends | „8 subscriptions converted from a free trial to a paid subscription on 2016-09-01”; „view subscriptions data on the summary, retention, state, and event pages” | 2026-10-19 | 1 | przed wydaniem |
| MS-25 | itunes.apple.com/lookup?id=<id>&country=us (opisy Rise, Kneady, Flourwise, Yeasta, SST) | pole `description` | cytaty w tabeli „Rynek” | 2026-10-19 (sesja bramki wariantów, 18:35) | 1 (dane platformy, D-035) | 2027-01-19 |
| MS-26 | itunes.apple.com/<kraj>/rss/customerreviews/…/id=<id>/sortby=mostrecent/json | próbka 166 recenzji, filtr ceny: 38 wpisów | zliczenia w tekście; tytuły i daty w tabeli | 2026-10-19 (sesja bramki, 12:40) | 5 (tylko motywy) | 2027-01-19 |
| MS-27 | revenuecat.com/state-of-subscription-apps (2026) | „Hard paywall” / „Freemium” | „Hard paywall median: 10.7% (top quartile above 20.0%). Freemium median: 2.1%” | 2026-10-19 (sesja bramki, 18:42) | 4 (raport branżowy) | przy kolejnym raporcie |

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
| OP-M01 | [DO WYJAŚNIENIA] czy umowa Paid Apps jest podpisana, a konto zapisane do Small Business Program (15% zamiast 30%/26%); właściciel uzupełni (STOP E0) | właściciel | rachunek, E3 |
| OP-M02 | Rozstrzygnięte 2026-10-19 (D-039): import działa zawsze | właściciel | BR-DANE-003, BR-ZAK-004 |

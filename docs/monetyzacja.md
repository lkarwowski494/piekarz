# Monetyzacja: Piekarz (Crust)
Stan: E3 (rola 02 build, badanie modelu D-110) · Aktualizacja: 2026-10-22 · Model: **D-112, D-113** (Basic darmowy, Pro bez próby) · Wejście: BRD roli 01 (`docs/brd/`, z przebudową M3 na `redesign/piekarz-2026-10-22`), ZAL-034, ZAL-038, ZAL-042…ZAL-044

Jedyny dokument monetyzacji. Poprzedni kontrakt (D-038, D-039: próba 14 dni jako oferta wprowadzająca subskrypcji, potem „tylko historia”) jest w `docs/archiwum/monetyzacja-d038-2026-10-19.md` razem z tabelą rynku i wartości funkcji z 2026-10-19 (MS-01…MS-27). Badanie zmiany modelu z 2026-10-22 (reguły sklepu z dnia, rynek, StoreKit, rachunki V1, V2, V3, Basic/Pro): `docs/monetyzacja-badanie-2026-10.md` (MS-B01…MS-B24). Surowe odczyty: `audit/02-badanie-modelu-2026-10-22/` (poza gitem).

## Model (D-112, D-113, słowa właściciela 2026-10-22)
„Tak. Wdrożymy ten model jako drugi bo to jednak najsensowniejsze rozwiązanie.” · „Samouczek i dziennik za darmo. Inteligetne wpsomaganja za pro.” → „Tak”.

- **Basic, darmowy na zawsze:** nauka (założenie pierwszego zakwasu, Akademia: pierwszy poziom), podstawowe narzędzia (kalkulator receptury, prowadzenie wypieku krok po kroku z sygnałem przy zablokowanym telefonie), dziennik i wszystkie dane, bezpieczeństwo i pomoc w kryzysie.
- **Pro:** inteligentne wspomaganie (plan wstecz z ochroną snu, czas fermentacji z temperatury, prowadzenie zakwasu: przypomnienia, proporcje, gotowość, lodówka) i „więcej” (kolejne zakwasy, ponad 5 własnych receptur, dwa wypieki naraz, wypieki zaplanowane na przyszłe dni, porównanie, spiżarnia, QR, druk, dalsza Akademia).
- **Bez próby i bez oferty wprowadzającej:** rolę próby pełni Basic. *Dlaczego:* właściciel odrzucił próbę, która sama zamienia się w opłatę („największy red flag”, D-110).
- **Drugi model portfela:** Trening i Oczko stosują limit miesięczny dni głównej czynności; Piekarz nie, bo pieczenie i prowadzenie zakwasu da się robić bez aplikacji, więc limit użycia uczy omijania aplikacji (słowa właściciela w D-111, D-112).

## Opcje modelu (rachunek: bramka 2026-10-19 na tych samych danych, USD netto/rok, iOS + Google Play, scen. norm.)
| Model | Wynik | Reguła sklepu | Ryzyko etyczne | Decyzja |
|---|---|---|---|---|
| **D-112/D-113 Basic/Pro, 0,99 / 6,99 / 14,99** | ok. 345 [OCENA: podział z zakwasem w Pro, mnożnik ok. 1,0; z podziałem E2e bez zakwasu 275, kod 0] | 3.1.2(a) „ongoing value” (MS-05); ujawnienia 3.1.2(c), strona subskrypcji (MS-B08) | przypomnienia o dokarmianiu ustają po wygaśnięciu Pro (uprzedzone, D-113) | **wybrany** |
| D-038: próba 14 dni zamieniająca się w subskrypcję | 345 (do ok. 862, jeśli twarda ściana konwertuje 2,5× lepiej) | 3.1.2(a), oferta wprowadzająca (MS-06) | próba sama zamienia się w opłatę; kupujący dożywotni płaci też za subskrypcję, jeśli nie anuluje | odrzucony (D-110) |
| V1 / V2: przepustki bez odnawiania | 191 / 200 | 3.1.1 „non-subscription apps” niepewne (MS-B01, Case 103004967270) | wygaśnięcie w trakcie życia zakwasu | odrzucone (D-112) |
| V3: limit 5 dni wypieku | 189 | „metered paywall” (MS-B08) | limit zniechęca do rejestrowania | odrzucony (D-112) |
| Sam zakup jednorazowy 14,99 / 19,99 | 322 / 369 | 3.1.1, przywracanie (MS-03) | brak | nie wybrany |
Pełne wyniki, wrażliwość i metody: `docs/monetyzacja-badanie-2026-10.md` (E2, E2b, E2c, E2e). Próg właściciela 500 USD netto/rok (D-024) nie jest osiągany w scen. norm. żadnym modelem przy cenach portfela; o wyniku decyduje widoczność (`udzial_nowej` 69 → 1 376 USD w Basic/Pro). Przegląd cen po 6 miesiącach od premiery (D-112): przy cenach jak Rise (3,99 / 14,99 / 19,99) ok. 426–533, przy medianach ok. 546–682.

## Rachunek
`docs/monetyzacja/rachunek.mjs` na `docs/monetyzacja/rachunek-badanie-us.json` (kod 0, 2026-10-22): wpływ w US po 15% prowizji (Small Business Program aktywny, słowa właściciela przez M1 2026-10-22): miesięczna 0,84 USD, roczna 5,94 USD, dożywotni 12,74 USD; próg 500 USD netto: 40 płacących dożywotniego albo 58 rocznego. PL (VAT 23%, MS-B22; USD 3,8886, MS-B10): ceny 4,99 / 29,99 / 79,99 zł bez zmian (`docs/monetyzacja/rachunek.json`). Bramka: `audit/02-badanie-modelu-2026-10-22/dowody/bramka-basic-pro.txt` (kod 0). Po premierze wpływ z App Store Connect (`wplyw_z_asc`) ma pierwszeństwo.

**Kryterium po 90 dniach od wydania** (zastępuje kryterium D-038; te same produkty i ceny, więc ten sam wpływ na płacącego w 1. roku): w dniach 30–90 średnio ≥ 7 nowych płacących miesięcznie na iOS (pierwsze zakupy subskrypcji i dożywotniego, raport zdarzeń subskrypcji i Sales and Trends, MS-24) albo wpływ ≥ 42 USD/mies.; poniżej połowy: przegląd widoczności, cen i zakresu Pro. Miara pomocnicza: zakupy Pro / pierwsze pobrania. Dane tylko z App Store Connect, bez telemetrii (ZAL-038). Hipotezę H-01 w `docs/wzrost/hipotezy.json` (dziś z D-038) przepisuje rola 08 (zadanie niżej).

## Kontrakt płatności
Wzorzec dla ról 04, 05, 07, 08. Identyfikatory z `src/lib/platnosci/konfiguracja.ts` bez zmian.

| Produkt (ID) | Typ | Cena US / PL | Próba | Family Sharing | Odblokowuje |
|---|---|---|---|---|---|
| `com.apps4brew.baker.pro.monthly` | subskrypcja odnawiana, grupa „Piekarz Pro” | 0,99 USD / 4,99 zł miesięcznie | **brak** (oferta wprowadzająca do usunięcia, MS-B21) | tak (włączony 2026-10-21, nieodwracalny, MS-B05) | Pro |
| `com.apps4brew.baker.pro.yearly` | subskrypcja odnawiana, ta sama grupa | 6,99 USD / 29,99 zł rocznie | **brak** | tak | Pro |
| `com.apps4brew.baker.pro.lifetime` | Non-Consumable | 14,99 USD / 79,99 zł jednorazowo | brak | tak | Pro |
Ceny pozostałych storefrontów: `audit/02-warianty-2026-10-19/narzedzia/wariant-a-wlasciciel.json` (zapis ASC 2026-10-21).

### Basic i Pro według funkcji
Lista zatwierdzona (D-112, D-113); pełna tabela z dowodem WTP: `docs/monetyzacja-badanie-2026-10.md`, E2e.

| Obszar | Basic | Pro |
|---|---|---|
| Liczenie | BR-KALK-001…005, -007, -009, -011, BR-UST-001 (procent, hydratacja z zakwasu, skalowanie, temperatura wody, kilka mąk, objętość, drożdże, sól, jednostki) | BR-KALK-010 (poolish, biga, levain), BR-KALK-008 (masa lodu) |
| Planowanie | BR-HARMO-004 (przesunięcie kroku, „za późno”), BR-KAL-001…005, -008 (widok tygodnia, „Następne”, arkusz dnia, przeszłość); plan od teraz z ustawieniami nocy i lodówki (D-116, właściciel: „Wg rekomendacji”) | BR-HARMO-001…003 (plan wstecz, ochrona snu, czas fermentacji z temperatury), BR-KAL-009, -015 (wypieki na przyszłe dni), BR-KAL-016 (dwa wypieki naraz), BR-KAL-011…014 (jeśli w 1.0) |
| Wypiek | BR-ETAP-001…006, BR-CZAS-002, -003, BR-REKA-001, garnek żeliwny | — |
| Zakwas | BR-ZAKW-005 (założenie pierwszego zakwasu, przypomnienia tylko w czasie zakładania, na końcu „Gratulacje, Twój pierwszy zakwas jest gotowy…”), karta i zapis karmień pierwszego zakwasu, BR-ZAKW-007, ostrzeżenie RD-21, BR-DIAG-002, karta bezpieczeństwa; pierwsze karmienie budzące jako krok planu (`fridge_wake_feed`, D-116) | BR-ZAKW-004 (przypomnienia o dokarmianiu), BR-ZAKW-002 (proporcje), BR-KAL-010 (stały dzień w lodówce), BR-ZAKW-003 (gotowość, szczyt; poza zakładaniem), BR-ZAKW-006 (budzenie z lodówki: kolejne karmienia budzące — **rozbieżność z literą tabeli nazwana:** pierwsze karmienie budzące w planie jest w Basic, D-116, decyzja właściciela „Wg rekomendacji”, bo bez niego plan z zimnym zakwasem byłby błędny), BR-ZAKW-001 (drugi i kolejne zakwasy) |
| Receptury, dziennik, nauka | BR-RECP-001 (bazowe, presety), BR-RECP-002 do 5 własnych, BR-RECP-003 (dziennik, „Piecz ponownie”, filtr smaku), odczyt i import QR (w limicie 5), BR-NAUK-001 pierwszy poziom i biblioteka technik Akademii (D-116), BR-DIAG-001, BR-DIAG-003…005 | BR-RECP-002 ponad 5, BR-RECP-004 (porównanie, statystyki), BR-WSP-003 (wysłanie QR), BR-DRUK-001, BR-SPIZ-001, BR-NAUK-001 dalsze poziomy |
| Zawsze | BR-DANE-001…004, BR-ZAK-001, -003, BR-UST-003, BR-PRYW-001, ustawienia | — |

### Reguły dostępu
- **Źródło dostępu:** transakcje sklepu przez `getAvailablePurchases({ onlyIncludeActiveItemsIOS: true })` i status karencji (ADR-007, bez zmian); pamięć `platnosci_pamiec` z ostatniego udanego odczytu, ważna najwyżej do końca opłaconego okresu, poza kopią zapasową. Błąd odczytu nigdy nie znaczy „brak zakupu”.
- **Bez Pro widać, co jest Pro:** funkcja Pro jest widoczna z oznaczeniem „Pro”; stuknięcie otwiera ekran Pro. Ekran Pro pojawia się **tylko** przy stuknięciu funkcji Pro i w Ustawieniach; nigdy przy starcie, po pierwszym użyciu ani w trakcie kroku wypieku. *Dlaczego:* zasada wzorca portfela 9 i zakazane wzorce (wyskakiwanie w głównej pracy).
- **Limity pojemności Basic:** 5 własnych receptur, 1 zakwas. Ponad limitem blokowane jest tylko dodanie (nowa receptura, „Zapisz jako nową”, nowy zakwas); zapisane działają w całości (odczyt, edycja, „Piecz ponownie”, eksport). Import kopii wnosi wszystkie receptury i zakwasy. „Przywróć” usuniętej receptury i import kopii nie liczą się do limitu; import pojedynczej receptury (plik, QR) jest dodaniem i się liczy (D-116, właściciel przez M1 2026-10-22: „Wg rekomendacji”). Jedyny zakwas da się usunąć albo założyć od nowa bez Pro.
- **Wygaśnięcie Pro (zwrot, anulowanie, odebranie z Family Sharing):** dane zostają; funkcje Pro wracają do stanu „Pro”; przypomnienia o dokarmianiu ustają; uprzedzenie 3 dni przed końcem (gdy sklep podaje koniec bez odnowienia) i w chwili wygaśnięcia: jasne zdanie „przypomnienia o dokarmianiu wyłączą się”, bez odliczania i „ostatniej szansy” (D-113). Wypiek rozpoczęty z planem Pro prowadzi się do końca (D-039 pkt 3 zostaje); zaplanowany wcześniej wypiek da się zacząć (start jest w Basic).
- **Zakładanie zakwasu w Basic:** przypomnienia w czasie zakładania działają bez Pro; jedno aktywne zakładanie naraz; ponowne zakładanie po nieudanej próbie dozwolone.
- **Przywracanie:** przycisk na ekranie Pro i w Ustawieniach, tylko na żądanie (`AppStore.sync()`); bez zakupów: komunikat, nigdy dostęp.
- **Zarządzanie i anulowanie:** `showManageSubscriptionsIOS` w Ustawieniach i na ekranie Pro dla subskrybenta (MS-17); „Zrealizuj kod” w Ustawieniach.
- **Bez sieci:** decyzja z pamięci; zakup i przywracanie mówią, że wymagają połączenia z App Store; Basic działa zawsze.
- **Basic tylko rośnie:** funkcja raz wydana w Basic nie przechodzi do Pro, a limity Basic (5 receptur, 1 zakwas) mogą tylko rosnąć. Test przed wydaniem porównuje listę Basic, szczegóły Basic i limity z plikiem poprzedniego wydania (`docs/monetyzacja/basic-1.0.json`, zamrożony sumą SHA-256), a miejsca użycia sprawdza na ekranach. Szczegóły Basic 1.0 (D-116): pierwsze karmienie budzące w planie, biblioteka technik Akademii, „Przywróć” i import kopii poza limitem, ustawienia nocy i lodówki w planie od teraz, filtr smaku w Dzienniku. *Dlaczego:* odbieranie darmowego wygląda jak zmiana warunków po fakcie (zasada 12 wzorca portfela, 3.1.2(a) MS-07 dla płacących).

### Przepływy
| Przepływ (PR) | Bez Pro | Zawsze dostępne |
|---|---|---|
| PR-01, PR-03, PR-17 liczenie | Basic; poolish/biga/levain: ekran Pro | zapisane receptury |
| PR-02 plan wstecz | ekran Pro przy „gotowe o…” | start wypieku bez planu |
| PR-04, PR-15 wypiek, powrót | Basic w całości | historia |
| PR-05 dokarmianie, PR-11 założenie | założenie pierwszego zakwasu: Basic; przypomnienia, proporcje, lodówka, gotowość: ekran Pro | karta zakwasu, zapis karmień, RD-21 |
| PR-06 dziennik | Basic; porównanie i statystyki: ekran Pro | dziennik |
| PR-07 dane | zawsze | wszystko |
| PR-08 QR, druk | odczyt i import: Basic; wysłanie i druk: ekran Pro | eksport pliku |
| PR-09 zakup, przywracanie, zarządzanie | zawsze | — |
| PR-10 ustawienia, polityka | zawsze | — |
| PR-12, PR-19 Dziś, kalendarz | widok Basic; planowanie przyszłych dni, dwa wypieki naraz: ekran Pro | przeszłość bez kłódek (BR-KAL-006) |
| PR-13, PR-14 Akademia, Doktor | Doktor Basic; Akademia pierwszy poziom Basic, dalsze: ekran Pro | — |
| PR-16 koniec Pro | uprzedzenie i komunikat (wyżej) | wszystko do odczytu, eksport, import, usunięcie |

### Wektory dostępu (dla 07 i 08; `T` = teraz)
| Scenariusz | Stan | Oczekiwane |
|---|---|---|
| nowy użytkownik | brak zakupów | Basic w całości; funkcje Pro widoczne z „Pro”; żadnego ekranu Pro przy starcie |
| Pro miesięczne aktywne | sklep: `monthly`, wygasa T+1 | Pro |
| dożywotni | sklep: `lifetime` | Pro bez końca |
| szósta receptura bez Pro | 5 własnych | zapis nowej → ekran Pro; edycja i „Piecz ponownie” pięciu działa |
| drugi zakwas bez Pro | 1 zakwas | dodanie → ekran Pro |
| import kopii: 8 receptur, 3 zakwasy, bez Pro | — | wszystkie wniesione i działają; dodanie kolejnej → ekran Pro; przypomnienia o dokarmianiu nieaktywne |
| Pro wygasło | sklep: pusto; pamięć `['yearly']` T−1 | Basic; przypomnienia o dokarmianiu wyłączone; komunikat wygaśnięcia raz |
| uprzedzenie | subskrypcja bez odnowienia wygasa T+3 dni | jeden komunikat 3 dni przed; drugi raz nie |
| wypiek z planem Pro trwa w chwili wygaśnięcia | sesja aktywna | prowadzi się do końca razem z zapisem wyniku |
| zakładanie zakwasu bez Pro | dzień 4 z 7–10 | przypomnienia zakładania działają; po „gotowy” komunikat gratulacji, przypomnienia o dokarmianiu tylko z Pro |
| brak sieci po zakupie | błąd odczytu; pamięć `['lifetime']` | Pro z pamięci |
| zwrot | sklep: `lifetime` odebrane | Basic, pamięć wyczyszczona, dane zostają |
| członek rodziny | sklep: `yearly` przez Family Sharing | Pro; odebranie → Basic |
| przywracanie bez zakupów | sklep: pusto | komunikat, Basic |

### Ujawnienia dla roli 04 (ekran Pro)
1. Nazwa planu, okres i cena z `displayPrice` sklepu (waluta storefrontu, nigdy w kodzie) jako najwyraźniejszy element ceny (MS-B08); krótki opis bez liczb; bez procentów oszczędności i „zwraca się po X” (E1, MS-B18, MS-B19).
2. Odnawianie automatyczne subskrypcji i jak anulować (Ustawienia → Apple ID → Subskrypcje), „Zarządzaj subskrypcją”, „Przywróć zakupy”, linki do Warunków (standardowa EULA Apple) i Polityki prywatności (MS-16).
3. Co daje Pro wobec Basic, jednym zdaniem na obszar (3.1.2(c): „clearly describe what the user will get for the price”, MS-09).
4. Dożywotni: jedna opłata, bez odnawiania.
5. Widoczne zamknięcie, neutralna odmowa; zakup wymaga połączenia z App Store.
- **Zakazane wzorce:** odliczanie, „oferta tylko dziś”, „najpopularniejszy” bez danych, zawstydzanie przy odmowie, ekran Pro w trakcie kroku albo przy starcie, odblokowanie za ocenę (MS-10), dane tylko dla płacących, hasło „No subscriptions” (model ma subskrypcje), push o Pro bez osobnej zgody (4.5.4, E2d).
- **Metadane sklepu (rola 10):** opis „Free Basic forever. Pro adds planning, starter care, more starters and recipes.” (2.3.2); bez „free trial” i bez „free app” bez zastrzeżenia (2005/29/WE zał. I pkt 20).

### Warunek subskrypcji (3.1.2(a))
Pro musi dawać stałą wartość: prowadzenie zakwasu i planowanie to użycie powtarzalne, a rytm nowych treści dla Pro (lekcje i techniki Akademii, profile mąk z kolejnych krajów, narzędzia planowania) ustala rola 03. Bez tego rytmu recenzja może zakwestionować subskrypcję w aplikacji offline.

## Aneks do ADR-007 (dla roli 05)
ADR-007 (`expo-iap` 6.1.1, StoreKit 2) zostaje. Dopisać:
- bez oferty wprowadzającej: usunąć z adaptera `uprawnionyDoProby`, `dniOkresuProbnego` i gałęzie „Wypróbuj 14 dni” (`src/lib/platnosci/sklep.ts`), `uprzedzenie.ts` przepisać na uprzedzenie końca Pro bez odnowienia;
- `BEZ_UPRAWNIENIA` w `konfiguracja.ts` zastąpić listą funkcji Basic z tego kontraktu (nowe wartości `Funkcja` dla funkcji Pro wydzielonych z dzisiejszych `zakwas`, `harmonogram`, `receptury`, `stolnica`), plus limity 5 receptur i 1 zakwas liczone z bazy przy dodawaniu;
- przypomnienia o dokarmianiu zależne od Pro (planowanie i kasowanie powiadomień przy zmianie dostępu; D-103 limit 40 powiadomień bez zmian), z wyjątkiem zakładania zakwasu;
- Family Sharing bez zmian (włączony); prywatność bez zmian (StoreKit, lokalna pamięć uprawnień).

## Kroki w App Store Connect (M1 za zgodą właściciela)
1. Usunąć ofertę wprowadzającą „Free Trial 2 Weeks” z `com.apps4brew.baker.pro.monthly` i `.pro.yearly` we wszystkich storefrontach (MS-B21; skrypt `scripts/asc-ustawienia.mjs` albo UI).
2. Notatka dla recenzji przy produktach: „Pro unlocks planning, starter care reminders, more starters and recipes. Basic stays free.”
3. Opis i zrzuty sklepu według metadanych wyżej (rola 10), 35 lokalizacji.
4. Produkty, ceny, Family Sharing i dostępność bez zmian.

## Przekazanie (E3)
- **01 (ER, numery nada rola 01):** BR-ZAK-004 „stan po próbie” i BR-ZAK-005 „oferta przy pierwszym użyciu” → ekran Pro przy funkcji Pro i w Ustawieniach, bez próby; BR-KAL-006 (tekst „okres próbny minął”) → „bez Pro”; BR-ZAKW-004 → przypomnienia w Pro z wyjątkiem zakładania; H-04, H-07 zamknięte przez D-113.
- **03:** podział Basic/Pro jako zakres (zasada 18); WTP-X: BR-KALK-008, BR-ETAP-003; rytm nowych treści Pro (3.1.2(a)).
- **04:** ekran Pro (ujawnienia 1–5, zakazane wzorce), oznaczenie „Pro” na funkcjach, komunikat gratulacji po założeniu zakwasu, uprzedzenie wygaśnięcia.
- **05:** aneks ADR-007 wyżej.
- **07:** wektory dostępu wyżej; tylko na telefonie: zakup każdego planu, przywracanie, Family Sharing, zwrot, wygaśnięcie (przypomnienia), brak sieci, zakładanie zakwasu bez Pro.
- **08:** zmiany kodu (aneks ADR-007), test „Basic tylko rośnie”, przepisanie testów kontraktu D-038 na nowy kontrakt (`src/__tests__/bramki-ekranow.test.tsx`, `src/lib/__tests__/uprzedzenie-proby-126.test.ts`, `src/components/__tests__/oferta-piekarz-pro-127.test.tsx`, `src/__tests__/karta-bezpieczenstwa-bez-zakupu-e1.test.tsx`) przez nowe asercje, nie wyłączanie; hipoteza H-01 w `docs/wzrost/hipotezy.json` (`tests/wzrost-hipotezy.test.ts`) na kryterium z tego dokumentu; pliki przebudowy M3 (kalendarz, Stolnica) po scaleniu `redesign/piekarz-2026-10-22` albo na niej. [OCENA] 2–3 dni agenta.
- **Właściciel:** zgoda na krok 1 w ASC; przekład tekstów ekranu Pro (Message Batches, zgoda na wydatek przez M1).

## Otwarte zadania po roli 02 (stan 2026-10-22)
Wdrożenie według rekomendacji (właściciel przez M1: „Według rekomendacji”, D-112).
| # | Zadanie | Kto | Kiedy / warunek |
|---|---|---|---|
| Z-1 | usunąć Free Trial 2 Weeks z `.pro.monthly` i `.pro.yearly` (wszystkie storefronty) | M1, App Store Connect | razem z buildem zawierającym kod Basic/Pro, nie wcześniej |
| Z-2 | kod Basic/Pro według aneksu ADR-007 i sekcji „Przekazanie” (konfiguracja funkcji, limity 5 receptur i 1 zakwas, przypomnienia zależne od Pro, usunięcie oferty wprowadzającej i uprzedzenia próby, ekran Pro, oznaczenia „Pro”, test „Basic tylko rośnie”) | rola 08 z M3 | na `redesign/piekarz-2026-10-22`, po porannym buildzie |
| Z-3 | przepisać testy kontraktu D-038 na nowy kontrakt (bramki ekranów, oferta przy pierwszym użyciu, uprzedzenie próby, karta bezpieczeństwa bez zakupu) i hipotezę H-01 w `docs/wzrost/hipotezy.json` | rola 08 | z Z-2 |
| Z-4 | przekład tekstów ekranu Pro, licznika limitów i komunikatów (gratulacje po założeniu zakwasu, uprzedzenie końca Pro) na 35 języków | M1 | wspólny batch a5 |
| Z-5 | ekran Pro, oznaczenie „Pro”, komunikaty (ujawnienia 1–5, zakazane wzorce). **Stan po M3 P-b (2026-10-22):** wdrożone przez rolę 08 według D-117 (wersja rekomendowana); przegląd roli 04: elementy w D-117 „Do przeglądu roli 04” | rola 04 | przed Z-2 albo razem |
| Z-6 | ER do roli 01: BR-ZAK-004, BR-ZAK-005, BR-KAL-006, BR-ZAKW-004; zamknięcie H-04, H-07 | rola 01 | przy najbliższej sesji roli 01 |
| Z-7 | zakres Basic/Pro i rytm nowych treści Pro („ongoing value”, 3.1.2(a)); WTP-X BR-KALK-008, BR-ETAP-003. Notka (M3 P-a-fix, nie blokuje): biblioteka technik Akademii jest w Basic (D-116), więc jest w napięciu z rytmem treści Pro („lekcje i techniki Akademii” w „Warunku subskrypcji”) — obecne techniki zostają darmowe na zawsze, treścią Pro mogą być tylko nowe pozycje | rola 03 | przed wydaniem 1.0 |
| Z-8 | opis sklepu i zrzuty w 35 lokalizacjach: „Free Basic forever. Pro adds planning, starter care, more starters and recipes.”; poprawić §4 `docs/wydanie/instrukcja-ustawien.md` (opisuje próbę D-038). **Stan po M3 P-a-fix (2026-10-22):** akapit „Dostęp i zakup” przepisany w `pl`, `en-US`, `en-GB`, `en-AU`, `en-CA` (`docs/wydanie/metadane/`, §1.2, §2.2, §5.1.1 `docs/app-store-metadata-v2.md`), README, `site/index.html`, §4 instrukcji; zostaje: przekład tego akapitu (obietnica próby i „bez zakupu tylko historia”) w 29 lokalizacjach `cs`, `da`, `de-DE`, `el`, `es-ES`, `es-MX`, `fi`, `fr-CA`, `fr-FR`, `hr`, `hu`, `id`, `it`, `ja`, `ko`, `ms`, `nl-NL`, `no`, `pt-BR`, `pt-PT`, `ro`, `ru`, `sk`, `sl`, `sv`, `tr`, `uk`, `vi`, `zh-Hant` (bez tłumaczenia w M3); w opisie wszystkich lokalizacji zdania o funkcjach dziś Pro bez oznaczenia (plan od godziny „gotowe” i czas z temperatury, kilka zakwasów, przypomnienie po 12 h, statystyki) oraz PNG ramek 2–4 i 6 | rola 10 / M1 | z Z-1 |
| Z-9 | testy na telefonie (wektory dostępu, „tylko na telefonie”) z datą i buildem | właściciel / rola 07 | po Z-2; runner macOS 0:00–15:00 |
| Z-10 | przegląd cen po 6 miesiącach od premiery i kryterium po 90 dniach | rola 02 | po wydaniu |
| Z-11 | odpowiedź App Review, Case 103004967270 (dla Oczka i Treningu; Piekarza nie dotyczy po D-112) | M1 | gdy przyjdzie |

## Definicja ukończenia (build), z dowodem
| Punkt | Dowód |
|---|---|
| Cena, stawka, kurs i reguła sklepu z adresem, cytatem i datą | MS-B01…MS-B24 (odczyt 2026-10-22) w badaniu; MS-01…MS-27 (2026-10-19) w archiwum; ceny z D-038/D-112 |
| Co najmniej dwa modele z regułą, kompromisem, ryzykiem i rachunkiem; wybór słowami właściciela | tabela „Opcje modelu”; D-110…D-113 ze słowami i datą |
| Bramka: `oplacalnosc.mjs` kod 0, werdykt wobec progu | `audit/02-badanie-modelu-2026-10-22/dowody/` (porownanie-v3.txt, bramka-basic-pro.txt, kod 0); werdykt „przerobić” wobec 500 USD w scen. norm. dla każdego modelu przy cenach portfela |
| `rachunek.mjs` kod 0; liczby ze źródłem albo [OCENA] z metodą | `rachunek-badanie-us.json` (kod 0); mnożniki [OCENA] z metodą w badaniu |
| Każda funkcja z klasą WTP i poziomem dowodu; WTP-X do 03 | archiwum (50 BR, 2026-10-19) + E2e (BR-KAL, BR-DIAG-003…005, BR-ETAP-006); WTP-X: BR-KALK-008, BR-ETAP-003 |
| Kontrakt: produkty, uprawnienia, bramki, przywracanie, bez sieci, próba, Family Sharing, ujawnienia | sekcja „Kontrakt płatności”; próba: brak (Basic), zgodnie z 3.1.2 bez oferty wprowadzającej |
| H i ZAL ze statusem; ER do 01 | H-04, H-07 zamknięte przez D-113 (rola 01 wpisze); ER w „Przekazanie” |
| Nie sprawdzone | testy na urządzeniu (krok właściciela); pełny zestaw Jest po zmianie dokumentów: 433 zestawy, 4857 testów, kod 0 (2026-10-22); `npm run verify` w całości nie uruchomiony (zmiana tylko w `docs/`) |

## Otwarte pytania
| ID | Pytanie | Rozstrzyga | Dotyczy |
|---|---|---|---|
| OP-M03 | [DO USTALENIA] pola `expo-iap` dla włączonego odnawiania (uprzedzenie końca Pro tylko bez odnowienia) | 05 / 08 | PR-16 |
| OP-B01 | [DO USTALENIA] status przeglądu trzech produktów w ASC | M1 | krok 1 ASC |
| OP-B02 | odpowiedź App Review (Case 103004967270) o próbie 3.1.1 przy subskrypcjach nieodnawialnych: po D-112 niepotrzebna dla Piekarza; dotyczy Oczka i Treningu | App Review | portfel |

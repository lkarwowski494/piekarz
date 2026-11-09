# Audyt: Monetyzacja — Piekarz — 2026-11-08
Commit: 2ef8870a525485cc1ac57e5abe9d97d9937dfe42 · Tryb: audit (wariant głęboki, moduły storekit-expo, cena-i-rachunek, audyt-paywalla) · Środowisko: Linux x86_64, Node v22.23.4, git 2.43.0, Playwright 1.63.0, gh 2.89.0, sieć działa (itunes.apple.com, apps.apple.com, developer.apple.com, api.nbp.pl, europa.eu); bez macOS i Xcode, Expo web nieobsługiwane przez projekt, więc bez zrzutu ekranu Pro i bez StoreKit Testing (dowody/e0-srodowisko.txt). Instalacja, typecheck, lint i pełne testy z E0 M1 (`audit/M1-2026-11-08/wspolne/`, wszystkie kod 0, 574 zestawy, 6017 testów) nie były powtarzane.

## Podsumowanie
Kod płatności jest w dobrym stanie: jedno źródło dostępu z transakcji StoreKit (`getAvailablePurchases` z `onlyIncludeActiveItemsIOS`), czysta funkcja decyzji, pamięć ostatniego odczytu tylko jako zapas bez sieci, nasłuch transakcji od startu, `finishTransaction` po przyznaniu dostępu, przywracanie tylko na żądanie, ceny wyłącznie z `displayPrice`, ekran Pro tylko po stuknięciu funkcji Pro albo w Ustawieniach. Wszystkie 11 wektorów modułu `storekit-expo` przechodzą na kopii kodu (dowody/e1-wektory-dostepu.txt). Najważniejsze ryzyko leży poza kodem: tekst promocyjny i zrzuty 1 i 5 strony sklepu we wszystkich 34 lokalizacjach pokazują funkcje Pro (plan wstecz, proporcje i przypomnienia zakwasu) bez oznaczenia, co przeczy wytycznej 2.3.2 i powtarza skargę, którą rynek zgłasza konkurencji. Bramka opłacalności (345 USD netto/rok) liczy iOS i Google Play, a 1.0 jest tylko na iOS: sam iOS to ok. 218 USD (174–218), 44% progu. Do decyzji: poprawka metadanych (rola 10), przeliczenie bramki na samym iOS, rytm wartości Pro dla 3.1.2(a), droga z subskrypcji do dożywotniego.

| ID | Poziom | Rodzaj | Tytuł | Status |
|---|---|---|---|---|
| 02-monetyzacja-001 | P1 | P | Strona sklepu reklamuje funkcje Pro (plan wstecz, opieka nad zakwasem) bez oznaczenia, że wymagają zakupu | otwarte |
| 02-monetyzacja-002 | P2 | P | Bramka opłacalności liczy iOS + Google Play, a 1.0 jest tylko na iOS: wynik dla 1.0 to ok. 218, nie 345 USD | otwarte |
| 02-monetyzacja-003 | P2 | P | Plan aktualizacji dla 3.1.2(a) zasila Basic, a Pro nie ma rytmu nowej wartości (Z-7 otwarte) | otwarte |
| 02-monetyzacja-004 | P2 | D | Przywracanie: błąd odczytu po synchronizacji kończy się komunikatem „Nie znaleziono aktywnych zakupów” | otwarte |
| 02-monetyzacja-005 | P2 | P | Dokumenty wydania przeczą stanowi: `ceny.json` powołuje D-038 „bez propozycji zmian”, Z-1 raz „nie wykonane”, raz zrobione | otwarte |
| 02-monetyzacja-006 | P2 | P | Subskrybent nie może w aplikacji przejść na zakup dożywotni | otwarte |
| 02-monetyzacja-007 | P2 | D | Czerwony workflow na master: iOS E2E #96 (05-dwa-wypieki, funkcja Pro) i brak zielonego Nightly od 2026-11-02 | otwarte |

## Linia bazowa i założenia
Zapisana w E0b przed lekturą `docs/monetyzacja.md`, decyzji o modelu i kodu płatności; o aplikacji czytany był tylko opis sklepu PL (`docs/app-store-metadata-v2.md` §1.2) i zdanie celu. Uczciwie: tabela `docs/sztafeta.md` czytana w E0 zdradziła ogólny kształt (Basic/Pro, usunięta oferta wprowadzająca), bez cen i podziału funkcji.

**Wzorzec najlepszych w klasie (rynek, odczyt 2026-11-08, dowody/e0b-konkurencja.txt).** Wyszukiwanie `sourdough` w US i PL: wszystkie aplikacje kategorii są darmowe do pobrania z zakupami w aplikacji. Ceny zakupów:
- Rise: Baking & Bread Recipes (id 1515369685, 337 ocen, 4,87): subskrypcje 3,99–4,99 USD/mies., 8,99 USD/3 mies., 14,99–19,99 USD/rok i zakup jednorazowy 19,99 USD (PL: 19,99–29,99 zł/mies., 79,99–99,99 zł/rok, 99,99 zł jednorazowo).
- Kneady (id 1534576984, 733 ocen, 4,80): Pro 3,49–6,99 USD/mies., 12,99 USD/kw., 19,99–29,99 USD/rok; PL także 69,99 zł.
- Loaflo (id 6736766728, 564 ocen, 4,69): 6,99 USD/tydz., 19,99 USD/mies., 39,99 USD/rok, bez zakupu jednorazowego.
- Sourdough Starter Tracker (id 6755709217): Premium 12,99 USD i „Remove Ads” 1,99 USD (jednorazowo).
- breadly - Sourdough Scheduler (id 1521410011): Premium 0,99 i 5,49 USD.

Recenzje płacących (US, strona 1, odczyt 2026-11-08): pochwała darmowej części, która przekonuje do zakupu (Rise 5★ 2021-03-27: "using this app for months with just the free features … I finally upgraded"); płaci się za liczenie i prowadzenie w czasie (Rise 5★ 2026-01-24: "The calculators included alone are worth every penny … you will accurately dynamically know what time on the clock to perform every step"); skargi: subskrypcja nieujawniona w opisie i zrzutach (Loaflo 1★ 2026-04-07: "don't advertise a subscription based service in the photos or descriptions"; 1★ 2026-02-25: "Despite not being mentioned in the description, you do have to pay a subscription"), wyskakująca ściana z zegarem, za mało darmowego do oceny (Loaflo 3★ 2025-03-06 "only 1 free scan"), niemożność anulowania próby (1★ 2026-02-21), niechęć do subskrypcji przy prostym narzędziu (1★ 2025-03-16 "Beware of Subscriptions"), za drogi tydzień (1★ 2026-08-06 "not paying 6 dollars weekly").

**Rodzaj wartości.** Liczenie, plan i prowadzenie działają lokalnie i nie zmieniają się bez aktualizacji (wartość jednorazowa narzędzia); stała część to powtarzalne użycie: przypomnienia o dokarmianiu, planowanie kolejnych wypieków i aktualizacje treści. Wniosek: najlepiej pasuje darmowa podstawa pokazująca główną pracę plus płatna część z zakupem jednorazowym; subskrypcja obok niego tylko z wykazaną stałą wartością (3.1.2(a)).

**Reguły sklepu (odczyt 2026-11-08, „Last Updated: October 16, 2026”, dowody/e0b-wytyczne.txt):** 3.1.1 (próba zakupu jednorazowego tylko jako „XX-day Trial”), 3.1.2(a) („you must provide ongoing value to the customer”; „apps that offer consistent, substantive updates” wśród przykładów; zmiana modelu nie zabiera opłaconego), próba subskrypcji tylko przez App Store Connect, 5.6, 3.2.2(x), 2.3.2 (opis i zrzuty mają wskazywać, co wymaga zakupu), strona subskrypcji Apple (kwota najwyraźniejsza, `showManageSubscriptions`).

**Wymiary pokrycia:**
| Wymiar | Wynik |
|---|---|
| Wszystkie modele wobec rodzaju wartości | Rynek: freemium z subskrypcją i (Rise, Kneady, Starter Tracker) zakupem jednorazowym. Piekarz: Basic darmowy + Pro jako subskrypcja albo dożywotni (D-112). Zgodne z linią bazową; dożywotni odpowiada wartości jednorazowej. Bez napiwku (rozważony w badaniu 2026-10 jako „sam zakup jednorazowy”, nie wybrany). |
| Za co się płaci, skargi płacących | Liczenie i prowadzenie w czasie (Rise) → plan wstecz w Pro ma dowód R (WTP-1). Skarga nr 1 rynku: nieujawniona płatna część w opisie i zrzutach → 02-monetyzacja-001. |
| Okres próbny i oferty | Brak próby i oferty wprowadzającej (D-112); `pobierzOferte` nie pyta o uprawnienie do oferty (`src/lib/platnosci/sklep.ts:123`). Z-1 w ASC według słów właściciela zrobione (`docs/wznowienie-M3.md:190`); stan w ASC nie sprawdzony (krok właściciela). |
| Trwałość zakupu | Wektory: ponowna instalacja, brak sieci, zwrot, Family Sharing, przywracanie bez zakupu: OK (dowody/e1-wektory-dostepu.txt). Brzeg przywracania: 02-monetyzacja-004. Telefon: nie sprawdzono. |
| Ceny w regionach i podatki | `docs/wydanie/ceny.json` (9 storefrontów ręcznie), VAT PL 23%, prowizja 15% (SBP), kurs NBP 3,9321 z 2026-11-06; rachunek kod 0 (dowody/e1-rachunek.txt). |
| Etyka | Brak fałszywej pilności, „najpopularniejszy”, zawstydzania, wyskakiwania w głównej pracy; komunikat wygaśnięcia bez odliczania (grep fraz: dowody/e1-grep-platnosci.txt, wejścia ekranu: dowody/e1-wejscia-ekranu-pro.txt). Metadane: 02-monetyzacja-001. |
| Miejsce ekranu zakupu | Tylko stuknięcie funkcji Pro i Ustawienia; główna praca (liczenie, prowadzenie, pierwszy zakwas, dziennik) w Basic. |
| Próg i lejek | Bramka 345 USD (iOS + GP) vs 1.0 tylko iOS → 02-monetyzacja-002; lejek bez danych App Analytics (przed premierą). |
| Prywatność i koszt narzędzi | `expo-iap` 6.1.1 (MIT), bez usługi zewnętrznej, OnsideKit wyłączony (wtyczka bez opcji), brak SDK analityki w `package.json` (dowody/e1-zaleznosci.txt). |

**Soczewki (po kolei, bez subagentów):**
- Oszczędny użytkownik: widzi ceny ze sklepu i „Basic zostaje bezpłatny na zawsze”; ale strona sklepu obiecuje w promocji i na zrzucie 1 plan wstecz, który jest w Pro (001).
- Pasjonat po roku, nowy telefon: Pro wraca sam z `currentEntitlements` przy pierwszym odczycie (wektor „ponowna instalacja”); dane przenosi plik kopii; subskrybent nie przejdzie w aplikacji na dożywotni (006).
- Recenzent App Store (3.1, 5.6): ujawnienia ekranu Pro kompletne dla subskrypcji i dożywotniego; ryzyka: 2.3.2 (001) i uzasadnienie „ongoing value” (003).
- Analityk konkurencji: ceny Piekarza (0,99 / 6,99 / 14,99 USD) leżą poniżej całego zakresu konkurencji (Rise 3,99 / 14,99 / 19,99); to świadoma decyzja z przeglądem po 6 mies. (D-112), bez znaleziska.

**Proponowane zmiany statusu w `docs/zalozenia.md` (audyt niczego nie zmienia; zależne pliki: dowody/e1-zal-zaleznosci.txt):**
- ZAL-044 („część woli opłatę jednorazową”): hipoteza → potwierdzone w części (rynek 2026-11-08: Rise, Starter Tracker sprzedają jednorazowo; recenzje Loaflo przeciw subskrypcji przy prostym narzędziu). Zależne: `docs/brd/odkrywanie.md`, `docs/monetyzacja.md`, `docs/monetyzacja-badanie-2026-10.md`.
- ZAL-043 i ZAL-050 (dotyczą próby i podziału D-038): hipoteza → nieaktualne (model D-112 bez próby). Zależne: `docs/brd/odkrywanie.md`, `docs/brd/wymagania-dane.md`, `docs/design/00-rozpoznanie.md`, `docs/scope-contract.md`, `docs/monetyzacja-badanie-2026-10.md`.

## Mapa bramek
Sygnały z grep: dowody/e1-grep-platnosci.txt, dowody/e1-mapa-bramek-grep.txt, dowody/e1-sciezki-tworzenia.txt; każdy wiersz potwierdzony odczytem kodu.

| Miejsce (plik:linia) | Rodzaj | Co chroni albo zmienia | Źródło stanu | Przepływ i funkcja | Uwagi → ID |
|---|---|---|---|---|---|
| `src/lib/platnosci/sklep.ts:104` | odczyt stanu | uprawnienia ze sklepu, karencja osobno | `Transaction.currentEntitlements` przez expo-iap | wszystkie | błąd i limit 15 s → `blad` (MON-08 ok) |
| `src/lib/platnosci/stan.ts:54` | zmiana stanu | decyzja, zapis pamięci tylko po udanym odczycie, znacznik wygaśnięcia | sklep, pamięć `platnosci_pamiec` | wszystkie | ok |
| `src/lib/platnosci/stan.ts:89` | odczyt stanu | Pro z pamięci, zanim sklep odpowie | pamięć | start | tylko gdy daje dostęp (ok) |
| `src/lib/platnosci/stan.ts:83` | nasłuch | nasłuch zakładany przed połączeniem | `purchaseUpdatedListener` | zakup, Ask to Buy, inne urządzenie | ok (MON-04) |
| `src/lib/platnosci/stan.ts:113` | zmiana stanu | transakcja → odczyt → dostęp → `finishTransaction` (`src/lib/platnosci/stan.ts:122`) | sklep | zakup | przy błędzie bez zakończenia (ok) |
| `src/lib/platnosci/stan.ts:130` | nasłuch | start i powrót na pierwszy plan (`src/lib/platnosci/stan.ts:135`) | sklep | wygaśnięcie bez restartu | ok (MON-05) |
| `src/lib/app-access.ts:34` | bramka (wyjątek) | pełny dostęp w buildzie E2E | `EXPO_PUBLIC_E2E` | E2E | odrzucany w `.github/workflows/testflight.yml:97` (ok, MON-12) |
| `src/lib/app-access.ts:85` | bramka | jedyny strażnik akcji; Pro bez dostępu → ekran Pro (`src/lib/app-access.ts:94`) | wspólny stan | wszystkie funkcje Pro | ok |
| `src/lib/app-access.ts:121` | bramka | limity 5 receptur i 1 zakwasu przy dodaniu | liczba z bazy | receptury, zakwasy | ok (MON-09) |
| `src/lib/app-access.ts:46` | przywracanie | sync → odczyt → stan | sklep | Ustawienia, ekran Pro | 02-monetyzacja-004 |
| `src/components/PaywallModal.tsx:88` | ekran zakupu | jedyny ekran Pro; z Pro bez opcji zakupu | wspólny stan | PR-09 | 02-monetyzacja-006 |
| `src/components/settings/ZakupySection.tsx:63` | ekran zakupu / przywracanie | Pro, „Przywróć zakupy”, „Zarządzaj subskrypcją”, „Zrealizuj kod” | — | Ustawienia | ok (MON-03, MON-11) |
| `app/(tabs)/receptury/receptura.tsx:206` | bramka | zapis nowej receptury przez limit; zapis zmian własnej bez limitu | baza | PR-01 | ok |
| `src/components/ImportRecipeModal.tsx:83`, `src/components/settings/ImportZPlikuArkusz.tsx:52` | bramka | import pojedynczej receptury liczy się do limitu | baza | PR-08 | ok (zgodnie z D-116) |
| `app/(tabs)/receptury/index.tsx:104` | bez bramki | „Przywróć” usuniętej receptury | — | lista receptur | poza limitem z decyzji D-116 (ok) |
| `app/(tabs)/zakwasy/index.tsx:194`, `src/components/zakwas/useAkcjeZakwasu.ts:102` | bramka | nowy zakwas i zakładanie przez limit 1 | baza | PR-05, PR-11 | ok |
| `app/(tabs)/zakwasy/index.tsx:228`, `app/(tabs)/zakwasy/index.tsx:244`, `app/(tabs)/zakwasy/index.tsx:250` | bramka | gotowość, stały dzień, proporcje | wspólny stan | PR-05 (Pro) | karta i zapis karmień w Basic (MON-07 ok) |
| `src/lib/notifications.ts:138` | odczyt stanu | przypomnienia o dokarmianiu tylko z Pro; przed odczytem sklepu bez kasowania | wspólny stan | BR-ZAKW-004 | ok |
| `app/(tabs)/receptury/harmonogram.tsx:253` | bramka | plan wstecz („gotowe o…”) z podglądem planu od teraz | wspólny stan | PR-02 | ok |
| `src/hooks/useStartPlanu.ts:93`, `src/hooks/usePlanyDzis.ts:61` | bramka | drugi trwający wypiek | wspólny stan | BR-KAL-016 | jedyne drogi tworzenia sesji (dowody/e1-sciezki-tworzenia.txt) |
| `src/hooks/useStartPlanu.ts:139`, `app/(tabs)/(dzis)/index.tsx:90`, `src/components/receptury/ProgramMaszynyKarta.tsx:97` | bramka | wypieki na przyszłe dni, plan maszyny | wspólny stan | BR-KAL-009 | ok (D-263) |
| `app/(tabs)/(dzis)/index.tsx:63` | bramka | widok miesiąca | wspólny stan | BR-KAL-013 | ok |
| `src/components/harmonogram/DodajDoKalendarza.tsx:37` | bramka | plik .ics | wspólny stan | BR-KAL-011 | ok |
| `app/(tabs)/receptury/receptura.tsx:339` | bramka | wybór zaczynu poolish/biga/levain | wspólny stan | BR-KALK-010 | presety nie ustawiają zaczynu w polu formuły (ok) |
| `app/(tabs)/receptury/receptura.tsx:244`, `app/(tabs)/receptury/receptura.tsx:245`, `app/(tabs)/receptury/receptura.tsx:347` | bramka | QR, druk, spiżarnia | wspólny stan | w 1.0 bez wejścia albo Pro | ok |
| `app/(tabs)/dziennik/index.tsx:61` | bramka | porównanie i statystyki | wspólny stan | PR-06 | dziennik i eksport CSV w Basic (MON-07 ok) |
| `app/doktor.tsx:162` | bramka | dalsze poziomy Akademii | wspólny stan | PR-13 | ok |

Drogi bez strażnika do funkcji Pro: sprawdzone, brak. Linki głębokie (`piekarz://`) otwierają tylko Stolnicę, Dziennik i Doktora zakwasu (Basic); widżetów i skrótów brak.

## Rachunek
`node docs/monetyzacja/rachunek.mjs` na kopii `rachunek.json` ze stawkami z dnia (dowody/e1-rachunek.txt, kod 0): VAT PL 23% (europa.eu/youreurope, wiersz „PL | Poland | 23”, odczyt 2026-11-08), prowizja 15% (developer.apple.com/app-store/small-business-program, odczyt 2026-11-08), 99 USD (developer.apple.com/programs/enroll, odczyt 2026-11-08), kurs 3,9321 (NBP 217/A/NBP/2026 z 2026-11-06). Wpływ w PL na płacącego: 3,45 zł/mies., 20,72 zł/rok, 55,28 zł dożywotni; próg kosztów 389,28 zł/rok: 27 płacących miesięcznego albo 19 rocznego albo 8 dożywotniego (wcześniej 7). Zmiana kursu nie zmienia wniosków. Wpływ z App Store Connect (`wplyw_z_asc`) i App Analytics: brak danych przed premierą.

Bramka (MON-18): nie liczona od nowa (wyjątek nazwany właściciela 2026-11-08). Sprawdzenie platformy: wynik 345 to iOS + Google Play (`docs/monetyzacja.md:14`); kolumna „sam iOS” tej samej bramki daje 218 dla D-038 przy tym samym przychodzie na płacącego (`docs/monetyzacja-badanie-2026-10.md:625`) i 174 dla podziału E2e (`docs/monetyzacja-badanie-2026-10.md:624`). Dla 1.0 (tylko iPhone) obowiązuje więc ok. 174–218 USD netto/rok w scen. norm., 35–44% progu 500 → 02-monetyzacja-002.

## Pokrycie (co sprawdzono, czego nie)
| Obszar / pliki / ekrany | Sprawdzone? | Jak (plik dowodu) |
|---|---|---|
| `src/lib/platnosci/` (dostep, konfiguracja, sklep, stan, uprzedzenie, ekran, wstrzymana) | tak, w całości | odczyt; wektory: dowody/e1-wektory-dostepu.txt |
| `src/lib/app-access.ts`, `src/lib/limity-basic.ts`, `src/components/AppAccessProvider.tsx`, `BlokadaFunkcji.tsx` | tak | odczyt |
| Ekran Pro `src/components/PaywallModal.tsx`, `oferta/stan-oferty.ts`, `OpcjaPlanu.tsx`, `przywroc-zakupy.ts`, `settings/ZakupySection.tsx` | tak (kod); zrzut nie | Expo web nieobsługiwane; zrzut: krok właściciela |
| Wszystkie miejsca bramek i ścieżki tworzenia receptur, zakwasów, sesji, planów | tak | dowody/e1-mapa-bramek-grep.txt, dowody/e1-sciezki-tworzenia.txt |
| Przypomnienia zależne od Pro (`src/lib/notifications.ts`, `PrzypomnieniaKarmieniaSection.tsx`) | tak | odczyt |
| `expo-iap` 6.1.1 (`restorePurchases`, typ `PurchaseIOS`, podspec OnsideKit) | tak, część JS; natywne openiap 4.0.3 nie | źródło natywne to pod spoza repo |
| `docs/monetyzacja.md`, `docs/monetyzacja-badanie-2026-10.md` (tabele bramki), D-038, D-039, D-110…D-113, ADR-007, `docs/wydanie/ceny.json`, metadane 34 lokalizacji | tak | dowody/e1-metadane-pro.txt |
| Testy płatności (21 zestawów) | wynik z E0 M1 (kod 0); treść przeczytana dla przywracania | dowody/e1-przywracanie-blad.txt |
| Rynek i reguły sklepu | tak, odczyt 2026-11-08 | dowody/e0b-konkurencja.txt, dowody/e0b-wytyczne.txt |
| Zakupy na urządzeniu, App Store Connect (produkty, Z-1, Family Sharing, ceny), App Analytics | nie | krok właściciela; środowisko bez Maca i bez dostępu do ASC |
| Ekrany w działającej aplikacji | nie | brak symulatora; nie twierdzę, że ekrany wyglądają poprawnie |

Obszar krytyczny „zakup działa na telefonie” nie jest sprawdzony; werdykt o kodzie płatności opiera się na odczycie kodu, wektorach i testach Node.

## Kontrola dowodów i sekretów
`node /home/user/piekarz/audit/M1-2026-11-08/narzedzia/sprawdz-raport.mjs <raport> /home/user/piekarz /home/user/piekarz/audit/M1-2026-11-08/role/02-monetyzacja --rola 02-monetyzacja` → „OK: odwołania, cytaty, pliki dowodów i sekrety sprawdzone; format raportu 02-monetyzacja”, kod 0 (dowody/e3-sprawdz-raport.txt). Sekretów w raporcie i dowodach brak; przeczytane treści zewnętrzne (strony, recenzje) nie zawierały poleceń dla agenta. `git status --porcelain` na początku: pusty (dowody/e0-srodowisko.txt); na końcu: pusty (dowody/e3-git-status.txt).

## Stosowalność listy kontrolnej
| Pozycja | Status | Wynik |
|---|---|---|
| MON-01 | dotyczy | typy produktów zgodne (2 odnawiane + Non-Consumable, bez próby); „ongoing value”: 02-monetyzacja-003 |
| MON-02 | dotyczy | ok: dostęp z `currentEntitlements`, pamięć tylko zapasem (wektor „ponowna instalacja”); telefon: nie sprawdzono |
| MON-03 | dotyczy | przyciski na ekranie Pro i w Ustawieniach, dostęp tylko z transakcji; 02-monetyzacja-004 |
| MON-04 | dotyczy | ok: nasłuch od startu, kolejność dostęp → `finishTransaction`, anulowanie bez sukcesu (`src/lib/platnosci/sklep.ts:158`) |
| MON-05 | dotyczy | ok: jeden stan na proces z subskrypcją; test `platnosci-hook` (kod 0 w E0) |
| MON-06 | dotyczy | ok: mapa bramek bez drogi obejścia |
| MON-07 | dotyczy | ok: dziennik, dane, eksport, import, karty zakwasów i start zapisanych planów w Basic |
| MON-08 | dotyczy | ok w logice (wektory bez sieci); brzeg komunikatu: 02-monetyzacja-004; tryb samolotowy: nie sprawdzono (telefon) |
| MON-09 | dotyczy | ok: limity pojemności liczone z bazy, warunek `zapisane < limit`; reset po ponownej instalacji zgodny z danymi (decyzja D-116) |
| MON-10 | dotyczy | ok w kodzie: nazwa, okres, cena z `displayPrice` (`src/lib/platnosci/sklep.ts:129`) jako największy element, odnawianie i anulowanie (`src/components/PaywallModal.tsx:151`), dożywotni jako jedna opłata (`src/components/PaywallModal.tsx:221`), przywracanie, EULA, prywatność; zrzut: nie sprawdzono (wygląd: SP-09, SP-11) |
| MON-11 | dotyczy | ok w aplikacji; metadane sklepu: 02-monetyzacja-001 |
| MON-12 | dotyczy | ok: ID i limity w `konfiguracja.ts`, jeden ekran zakupu, flaga E2E odrzucana w TestFlight; dokumenty: 02-monetyzacja-005 |
| MON-13 | nie dotyczy | brak wydania w sklepie; TestFlight w sandboksie bez opłat, więc nikt nie zapłacił za poprzedni model |
| MON-14 | dotyczy | ok: ADR-007, bez usługi zewnętrznej, bez SDK analityki |
| MON-15 | dotyczy | ok w Node (`platnosci-dostep`, `przywracanie-zakupow`, `wektory-dostepu-pa`, `platnosci-start-c3-c6-c7`, `basic-tylko-rosnie-pa`); scenariusze na telefonie bez daty i wyniku → „Do sprawdzenia” |
| MON-16 | dotyczy | kierunek zgodny z linią bazową (darmowa główna praca, płatne planowanie i opieka, dożywotni obok subskrypcji); 02-monetyzacja-006 |
| MON-17 | dotyczy | ok: rachunek kod 0 na dziś; liczby bramki z [OCENA] i metodą; 02-monetyzacja-005 (źródło w `ceny.json`) |
| MON-18 | dotyczy (wyjątek nazwany: bez przeliczenia) | 02-monetyzacja-002 |
| ODK-02 (cudza, bez raportu roli z tego commitu) | dotyczy | 02-monetyzacja-001 |
| JAK-12 (cudza, zasada 21) | dotyczy | 02-monetyzacja-007 |

Decyzje projektu, które wyłączają zgłoszenia: D-112/D-113 (model i podział), D-116 (limity, „Przywróć” i import kopii poza limitem), D-117 (ekran Pro), D-263 (plan maszyny w Pro), D-040 (praca mimo werdyktu bramki).

## Znaleziska (szczegóły)

### 02-monetyzacja-001 · Strona sklepu reklamuje funkcje Pro (plan wstecz, opieka nad zakwasem) bez oznaczenia, że wymagają zakupu
- Pozycja listy kontrolnej: ODK-02 (rola 01/10; zgłoszone tu, bo raportu tej roli nie czytałem) razem z MON-11
- Poziom: P1
- Realność: realny · Pewność: wysoka
- Rodzaj: P
- Dowód: dowody/e1-metadane-pro.txt — tekst promocyjny PL „ułoży plan wstecz”, ramka 1 „Plan wstecz bez kroków w środku nocy”, ramka 5 „Ilości do dokarmienia i przypomnienie po 12 godzinach”; „Pro” w tekście promocyjnym i ramkach: 0 z 34 lokalizacji. Opis PL ma akapit DOSTĘP I ZAKUP, ale sekcje PLAN OD GODZINY i ZAKWASY opisują te funkcje bez słowa Pro (`docs/app-store-metadata-v2.md:35`, `docs/app-store-metadata-v2.md:42`). W kodzie to funkcje Pro: `src/lib/platnosci/konfiguracja.ts:44` (plan-wstecz), `src/lib/platnosci/konfiguracja.ts:53` (przypomnienia-zakwasu), `src/lib/platnosci/konfiguracja.ts:54` (proporcje-zakwasu).
- Mechanizm: metadane opisują funkcje sprzed podziału Basic/Pro; `node` po `docs/wydanie/metadane/*.json` → 34 trafienia (każda lokalizacja).
- Powraca: tak, otwarte zadanie Z-8 z 2026-10-22 (`docs/monetyzacja.md:142`) → trwała kontrola: test, który dla każdej funkcji Pro z `konfiguracja.ts` wymaga oznaczenia w tekście promocyjnym, ramkach i opisie, jeśli są tam wymienione.
- Wzorzec lub źródło: App Review Guidelines 2.3.2, odczyt 2026-11-08: "make sure your app description, screenshots, and previews clearly indicate whether any featured items, levels, subscriptions, etc. require additional purchases"; recenzje Loaflo 1★ 2026-04-07 i 2026-02-25 (dowody/e0b-konkurencja.txt).
- Kroki w aplikacji: użytkownik pobiera aplikację dla planu „gotowe o…” z promocji i zrzutu 1, stuka godzinę gotowości i dostaje ekran Pro.
- Opcje: (a) dopisać „Pro” w tekście promocyjnym, ramkach 1 i 5 i przy sekcjach opisu — mała zmiana, wymaga przekładu 34 lokalizacji i nowych PNG; (b) przebudować promocję i ramki 1 i 5 na funkcje Basic (liczenie, prowadzenie z powiadomieniem, Doktor), a Pro pokazać w osobnej ramce „Piekarz Pro” — więcej pracy, czytelniej dla oszczędnego użytkownika. Rekomendacja: (b), bo główna praca Basic jest właśnie tym, za co rynek chwali darmową część, i zdejmuje ryzyko 2.3.2.
- Test akceptacyjny: test metadanych przechodzi dla 34 lokalizacji; zrzuty ramek w `docs/wydanie/zrzuty/` zgodne z tekstem.
- Status: otwarte

### 02-monetyzacja-002 · Bramka opłacalności liczy iOS + Google Play, a 1.0 jest tylko na iOS: wynik dla 1.0 to ok. 218, nie 345 USD
- Pozycja listy kontrolnej: MON-18
- Poziom: P2
- Realność: realny · Pewność: wysoka
- Rodzaj: P
- Dowód: `docs/monetyzacja.md:14` (nagłówek tabeli „iOS + Google Play”); `docs/monetyzacja-badanie-2026-10.md:624` i `docs/monetyzacja-badanie-2026-10.md:625` (sam iOS: 174 i 218); `docs/adr/ADR-007_zakupy_storekit_expo_iap.md:29` (Android poza planem 1.0); żadna decyzja nie planuje portu na Androida ani jego kosztu.
- Mechanizm: bramka z 2026-10-19 (9 storefrontów iOS i 9 Google Play) użyta bez zawężenia do platformy wydania; ta sama liczba 345 w `docs/monetyzacja.md` i w poleceniu M1.
- Powraca: nie
- Wzorzec lub źródło: kontrakt roli, MON-18 (scenariusze per platforma, Android z kosztem portu).
- Kroki w aplikacji: brak (decyzja właściciela o pracy nad aplikacją).
- Opcje: (a) zapisać w `docs/monetyzacja.md` wynik dla 1.0: sam iOS 174–218 USD (35–44% progu) obok 345 jako „z Google Play po porcie” — bez nowego przebiegu, werdykt „przerobić” bez zmian; (b) przebieg samej bramki (`02-monetyzacja --tryb audit --moduly oplacalnosc`) z wariantem „iOS 1.0” i wariantem „iOS + port Android z kosztem” — pełny obraz, ok. 1 sesja agenta. Rekomendacja: (a) teraz, (b) przy decyzji o Androidzie.
- Test akceptacyjny: sekcja „Opcje modelu” podaje wynik dla platformy 1.0 i założenie o porcie.
- Status: otwarte

### 02-monetyzacja-003 · Plan aktualizacji dla 3.1.2(a) zasila Basic, a Pro nie ma rytmu nowej wartości (Z-7 otwarte)
- Pozycja listy kontrolnej: MON-01
- Poziom: P2
- Realność: brzegowy · Pewność: wysoka (co do faktów; co do decyzji recenzji: średnia)
- Rodzaj: P
- Dowód: `docs/scope-contract.md:13` (kwartalnie 2–3 receptury bazowe albo wyjaśnienia kroków); receptury bazowe i Akademia są w Basic (`src/lib/platnosci/konfiguracja.ts:78`, `src/lib/platnosci/konfiguracja.ts:79`); `docs/monetyzacja.md:107` (rytm nowych treści dla Pro ustala rola 03) i `docs/monetyzacja.md:141` (Z-7 otwarte).
- Mechanizm: uzasadnienie „ongoing value” subskrypcji opiera się dziś na powtarzalnym użyciu funkcji lokalnych (D-113); nowe treści trafiają do Basic.
- Powraca: nie
- Wzorzec lub źródło: 3.1.2(a), odczyt 2026-11-08: "you must provide ongoing value to the customer"; przykłady obejmują "apps that offer consistent, substantive updates" (dowody/e0b-wytyczne.txt).
- Kroki w aplikacji: brak; ryzyko w recenzji subskrypcji i w ocenie płacących.
- Opcje: (a) rola 03 ustala rytm wartości Pro w ramach kwartalnej aktualizacji (np. nowe narzędzie planowania albo poziom Akademii w Pro co kwartał) — zgodne z D-112/D-113, koszt treści; (b) zostawić i w notatce dla recenzji przy produktach opisać stałą wartość (przypomnienia o dokarmianiu, planowanie kolejnych wypieków, aktualizacje co kwartał) — zero pracy w kodzie, ryzyko pytania recenzenta. Rekomendacja: (b) przed zgłoszeniem 1.0, (a) w planie 1.0.1. Bez propozycji zmiany modelu ani cen (D-112).
- Test akceptacyjny: Z-7 zamknięte decyzją; notatka dla recenzji w `docs/wydanie/` z treścią.
- Status: otwarte

### 02-monetyzacja-004 · Przywracanie: błąd odczytu po synchronizacji kończy się komunikatem „Nie znaleziono aktywnych zakupów”
- Pozycja listy kontrolnej: MON-03 (z MON-08)
- Poziom: P2
- Realność: brzegowy · Pewność: wysoka
- Rodzaj: D
- Dowód: `src/lib/app-access.ts:47` (`ustalDostep(await przywroc())`), `src/lib/platnosci/sklep.ts:167` i `src/lib/platnosci/sklep.ts:168` (po udanym `restorePurchases()` drugi odczyt, który przy błędzie albo limicie 15 s zwraca `blad`), `src/lib/platnosci/dostep.ts:40` (przy `blad` dostęp tylko z pamięci; na nowym telefonie pamięć pusta), `src/components/przywroc-zakupy.ts:16` (fałsz → komunikat o braku aktywnych zakupów). Test przywracania obejmuje tylko wyjątek z samej synchronizacji (dowody/e1-przywracanie-blad.txt).
- Mechanizm: wynik przywracania to `boolean`, który nie odróżnia „sklep: brak zakupów” od „odczyt nieudany”; `grep -n "przywrocZakupy\|przywrocZKomunikatem"` → 3 miejsca: `src/lib/app-access.ts:141`, `src/components/settings/ZakupySection.tsx:26`, `src/components/PaywallModal.tsx:139`.
- Powraca: nie
- Wzorzec lub źródło: zasada roli 7 i moduł storekit-expo („pusty wynik po błędzie połączenia to `blad`, nie brak zakupu”).
- Kroki w aplikacji: nowy telefon, słaba sieć, Ustawienia → „Przywróć zakupy”; synchronizacja przechodzi, odczyt uprawnień przekracza 15 s → komunikat, że zakupów nie ma. Dostęp wraca sam przy następnym odczycie (start, powrót na pierwszy plan), więc zakup nie ginie.
- Opcje: (a) `przywrocZakupy` zwraca trzy stany (`dostep`, `brak`, `blad`), a `blad` daje komunikat o połączeniu — mała zmiana i jeden test; (b) zostawić — rzadkie, samo się naprawia. Rekomendacja: (a).
- Test akceptacyjny: test z `restorePurchases` udanym i `getAvailablePurchases` rzucającym (albo limitem) pokazuje „Nie udało się połączyć z App Store. Spróbuj ponownie.” i nie nadaje dostępu.
- Status: otwarte

### 02-monetyzacja-005 · Dokumenty wydania przeczą stanowi: `ceny.json` powołuje D-038 „bez propozycji zmian”, Z-1 raz „nie wykonane”, raz zrobione
- Pozycja listy kontrolnej: MON-12 (z MON-17)
- Poziom: P2
- Realność: realny · Pewność: wysoka
- Rodzaj: P
- Dowód: `docs/wydanie/ceny.json:2` (opis: „D-038, model stały DEC-01 d, bez propozycji zmian”), `docs/wydanie/ceny.json:4` (źródło cen: D-038); obowiązuje D-112 z przeglądem cen po 6 mies. (`docs/decyzje.md:527`); `docs/wydanie/droga-do-app-store.md:47` (Z-1: nie wykonane) wobec `docs/wznowienie-M3.md:190` (Z-1 zrobione 2026-11-03); `docs/wydanie/plan-wydania-1.0.md:46` (W1-05 nieodhaczone).
- Mechanizm: dokumenty wydania nie przeszły aktualizacji po D-112 i po Z-1; `grep -rn "D-038" docs/wydanie` wskazuje `ceny.json`.
- Powraca: nie
- Wzorzec lub źródło: zasada wspólna 4 (rejestr, nie pamięć); hierarchia D-035.
- Kroki w aplikacji: brak; ryzyko dla ról i właściciela: kolejna rola czyta „bez propozycji zmian” i pomija przegląd cen z D-112, a lista wydania każe drugi raz usuwać ofertę.
- Opcje: (a) poprawić opis i źródło w `ceny.json` na D-112 (ceny bez zmian), oznaczyć B2 i W1-05 jako zrobione słowami właściciela z datą — kilka minut, bez zmiany wartości; (b) zostawić do roli 10 — rozjazd trwa do zgłoszenia. Rekomendacja: (a).
- Test akceptacyjny: `grep -rn "D-038" docs/wydanie` bez trafień poza historią; B2 i W1-05 z datą 2026-11-03.
- Status: otwarte

### 02-monetyzacja-006 · Subskrybent nie może w aplikacji przejść na zakup dożywotni
- Pozycja listy kontrolnej: MON-16
- Poziom: P2
- Realność: brzegowy · Pewność: wysoka
- Rodzaj: P
- Dowód: `src/components/AppAccessProvider.tsx:27` (z Pro ekran dostaje `aktywny`), `src/components/PaywallModal.tsx:88` i `src/components/PaywallModal.tsx:197` (z Pro tylko przycisk zarządzania subskrypcją, bez opcji zakupu) (dowody/e1-pro-bez-zmiany-planu.txt).
- Mechanizm: ekran Pro ma dwa tryby (zakup albo stan aktywny); przejście subskrypcja → dożywotni nie ma trybu. Zmiana planu w grupie (miesięczny ↔ roczny) działa przez systemowe „Zarządzaj subskrypcją”.
- Powraca: nie
- Wzorzec lub źródło: linia bazowa (soczewka pasjonata; Rise sprzedaje subskrypcje i zakup jednorazowy obok siebie); ZAL-044 („część woli opłatę jednorazową”).
- Kroki w aplikacji: subskrybent miesięczny → Ustawienia → Piekarz Pro → „Piekarz Pro jest aktywny.”, brak opcji dożywotniej; musi anulować, poczekać do końca okresu i wtedy kupić.
- Opcje: (a) dla subskrybenta pokazać opcję dożywotnią z ujawnieniem, że subskrypcję trzeba anulować osobno („Zarządzaj subskrypcją”) — więcej tekstu na ekranie, ryzyko podwójnej płatności, jeśli ktoś nie anuluje; (b) zostawić — prostszy ekran, utrata części sprzedaży dożywotniej. Rekomendacja: (b) w 1.0 i powrót przy przeglądzie cen po 6 mies. (D-112), bo (a) wymaga ujawnienia, które łatwo przeoczyć.
- Test akceptacyjny: zależny od decyzji; przy (a) test ekranu Pro z aktywną subskrypcją pokazuje opcję dożywotnią i zdanie o anulowaniu.
- Status: otwarte

### 02-monetyzacja-007 · Czerwony workflow na master: iOS E2E #96 (05-dwa-wypieki, funkcja Pro) i brak zielonego Nightly od 2026-11-02
- Pozycja listy kontrolnej: JAK-12 (rola 07; zasada wspólna 21)
- Poziom: P2
- Realność: realny (stan CI) · Pewność: wysoka co do stanu, średnia co do przyczyny
- Rodzaj: D
- Dowód: dowody/e0-ci.txt (iOS E2E #96 na 2ef8870a: „[Failed] 05-dwa-wypieki … next-or-finish-step-btn is visible”; #95 i #97 zielone; Nightly #25 czerwony, #19–#24 anulowane).
- Mechanizm: scenariusz dwóch wypieków naraz (BR-KAL-016, Pro przez flagę E2E) nie przechodzi raz na trzy przebiegi; przyczyny nie badałem (poza obszarem roli).
- Powraca: tak, D-279 (E2E-94: wyścig scenariusza) → trwała kontrola: zielony E2E na HEAD przed buildem kandydata.
- Wzorzec lub źródło: zasada wspólna 21.
- Kroki w aplikacji: [DO USTALENIA] — możliwy wyścig scenariusza albo błąd przycisku kroku przy dwóch wypiekach.
- Opcje: (a) rola 07/08 ustala przyczynę przed zgłoszeniem 1.0; (b) ponowny przebieg i zapis jako niestabilny test — szybciej, ryzyko przeoczenia błędu płatnej funkcji. Rekomendacja: (a).
- Test akceptacyjny: trzy kolejne zielone iOS E2E na HEAD kandydata.
- Status: otwarte

## Do sprawdzenia (pewność ≤ 80%)
- **Uprzedzenie 3 dni przed końcem Pro (D-113) może nigdy się nie pokazać:** wymaga `renewalInfoIOS.willAutoRenew` w transakcji (`src/lib/platnosci/sklep.ts:61`); bez niego `uprzedzenieKoncaPro` zwraca `null` (wektor: odnawia nieznane, dowody/e1-wektory-dostepu.txt). Czy openiap 4.0.3 wypełnia to pole w `getAvailablePurchases`: [DO USTALENIA] (OP-M03, źródło natywne poza repo). Brakuje: odczytu źródła openiap-apple albo testu w sandboksie z wyłączonym odnawianiem. Komunikat w chwili wygaśnięcia działa niezależnie.
- **Z-1 w App Store Connect:** stan znany tylko ze słów właściciela (2026-11-03). Krok właściciela: arkusz zakupu miesięcznego i rocznego w sandboksie bez „Free Trial”; oczekiwane: od razu cena 0,99 USD / 6,99 USD (albo lokalna).
- **Scenariusze na telefonie (krok właściciela, build 1023, wynik z datą do `docs/wydanie/dziennik.md`):** zakup każdego planu (Pro od razu na wszystkich zakładkach); usunięcie i ponowna instalacja (Pro bez „Przywróć”); tryb samolotowy po zakupie (Pro z pamięci, Basic działa); „Przywróć zakupy” na drugim urządzeniu (Pro); „Przywróć” bez zakupu (komunikat, bez Pro); zwrot w sandboksie (Basic, dane zostają, komunikat wygaśnięcia raz); Family Sharing (Pro u członka rodziny); Ask to Buy (komunikat „czeka na zatwierdzenie”).
- **`Transaction.currentEntitlements` a transakcja niezakończona** (ADR-007, [DO USTALENIA]): adapter dokłada transakcję z nasłuchu (`src/lib/platnosci/stan.ts:113`), więc wynik nie zależy od odpowiedzi; potwierdzenie w sandboksie.
- **„1.0 tylko iPhone” a storefronty iOS w bramce:** czy dane bramki obejmują iPada: [DO USTALENIA] (pliki bramki są poza zakresem tego audytu).

## Co działa dobrze i należy zachować
- Jeden adapter biblioteki płatności (`src/lib/platnosci/sklep.ts`) i czysta decyzja (`dostep.ts`) zgodna co do znaku z wzorcem modułu; 11 z 11 wektorów i 5 wektorów limitów przechodzi (dowody/e1-wektory-dostepu.txt).
- Błąd i limit 15 s odczytu sklepu to `blad`, nie brak zakupu; pamięć ważna najwyżej do końca opłaconego okresu, poza kopią zapasową (import kopii nie nadaje Pro).
- Nasłuch transakcji zakładany przed pierwszym połączeniem; `finishTransaction` dopiero po zapisie dostępu; Ask to Buy i anulowanie bez fałszywego sukcesu.
- Przywracanie tylko na żądanie, nigdy przy starcie; „Zarządzaj subskrypcją” i „Zrealizuj kod” w Ustawieniach.
- Ceny wyłącznie z `displayPrice`, okres w kluczu tekstu; kwota jako największy element; brak ciemnych wzorców i ekranu Pro w głównej pracy.
- Dane nigdy nie są zakładnikiem: dziennik, eksport CSV i pliku, import, zapisane receptury i zakwasy działają bez Pro; ponad limitem blokowane jest tylko dodanie.
- Test „Basic tylko rośnie” z plikiem `docs/monetyzacja/basic-1.0.json`; strażnik flagi E2E w workflow TestFlight; brak SDK analityki i usług zewnętrznych.
- Opisy sklepu w 34 lokalizacjach mówią już „Basic darmowy na zawsze, bez okresu próbnego” (obietnica próby usunięta).

## Decyzje dla właściciela
1. **001 metadane:** (a) dopisać „Pro” w promocji, ramkach 1 i 5 i opisie; (b) promocja i ramki 1 i 5 na funkcjach Basic, osobna ramka „Piekarz Pro”. Rekomendacja (b). Wykonawca: rola 10 z rolą 09 (34 lokalizacje) i 04 (PNG).
2. **002 bramka:** (a) dopisać wynik dla 1.0 (sam iOS 174–218 USD); (b) przebieg samej bramki z wariantem portu Android. Rekomendacja (a) teraz.
3. **003 „ongoing value”:** (a) rytm wartości Pro przez rolę 03; (b) notatka dla recenzji o stałej wartości Pro. Rekomendacja (b) przed zgłoszeniem, (a) w 1.0.1.
4. **005 i reguła D-038:** potwierdź, że reguła D-038 „żadnych opcji ani rekomendacji zmiany cen” wygasła wraz z D-112 (dziś powtarza ją `docs/wydanie/ceny.json:2`). Ten audyt nie proponuje zmian cen ani modelu.
5. **006 dożywotni dla subskrybenta:** (a) opcja z ujawnieniem o anulowaniu; (b) bez zmian w 1.0. Rekomendacja (b).
6. Kroki po stronie właściciela: scenariusze na telefonie z „Do sprawdzenia” (ok. 30–40 min z D-226), zrzut ekranu Pro (rola 04), potwierdzenie Z-1 zrzutem.

## Proponowane polecenie naprawy
`node tools/assemble.mjs 02-monetyzacja --tryb fix --zadania MON-03,MON-12` (02-monetyzacja-004, -005); metadane (001) do roli 10: `node tools/assemble.mjs 10-wydanie --tryb fix --zadania ODK-02`; bramka (002, wariant b): `node tools/assemble.mjs 02-monetyzacja --tryb audit --moduly oplacalnosc`; 003 i 006 po decyzji właściciela; 007 do roli 07. Na końcu `git status --porcelain` (dowody/e3-git-status.txt).

Kontrola raportu (sprawdz-raport.mjs, ostatni przebieg): dowody/e3-sprawdz-raport.txt

# Piekarz — specyfikacja projektowa (kierunek A „Koszyk spiralny”)

Rola 04, tryb build, E3 · 2026-10-20 · zastępuje `docs/design-spec.md` (2.0-craft, inwentarz) po wdrożeniu w partii 5. Decyzje: D-045 (jasny i ciemny według systemu), D-046 (własne tokeny), D-047 (oferta przy pierwszej akcji), D-048 (najdłuższy język z pomiaru), D-049 (kierunek A), D-050 (Sofia Sans Semi Condensed).

Krytyka zrzutów E3: `04-krytyka-e3.md`. Propozycja wpisu do pamięci portfolio: rozdział 13.

Pliki: tokeny `tokeny.json` → `tokeny.ts` + `kontrast.md` (`narzedzia/tokeny.mjs`); makiety `ekrany/*.html` (wspólne `wspolne.css`, `wspolne.js`, przekłady `teksty.js`, `teksty-najdluzszy.js`); zrzuty wzorcowe `wzorce-zrzuty/`; świat i kierunki `01-swiat.md`, `02-kierunki.md`, `porownanie.png`, `kroje.png`.

## 1. Zasada
Jeden mocny element — **spirala koszyka** niosąca plan wypieku — i spokojna, standardowa reszta (listy grupowane, pasek zakładek, arkusze, przełączniki iOS). *Dlaczego:* rozpoznawalność daje jeden element z danymi; nietypowe kontrolki utrudniają obsługę (zasada studia 3).

## 2. Element firmowy: spirala koszyka
| Cecha | Reguła |
|---|---|
| Dane | wszystkie kroki planu od startu (środek) do godziny „gotowe” (koniec, kropka); długość łuku ∝ czas kroku; kroki bierne dłuższe niż 3 h rysowane jak 3 h i oznaczone w legendzie („skrócona”) |
| Stany kroku | zrobiony: gruby (7) `ratan`; przyszły: cienki (3) `ratanSzary`; noc w lodówce: kropki `nocDane`; bieżący: gruby (9) `tusz` do miejsca „teraz” na tle `ratanSzary`; znacznik „teraz”: kółko z obwódką `tusz` |
| Nic tylko kolorem | zrobione i przyszłe różnią się grubością, noc wzorem kropek, bieżący kolorem i grubością; legenda tekstem |
| Warianty | prowadzenie (pełna, 150–220 pt), start (mała 92 pt, grubości ×1,4), plan przed startem (wszystko cienkie), zakwas (jeden cykl dokarmienia, niecałe 2 zwoje, OP-38: 12 h), ekran startowy (pusta, bez danych), ikona |
| VoiceOver | jedna etykieta: „Plan wypieku, krok {n} z {N}: {nazwa}, zostało {czas}. Gotowe {dzień} o {godzina}.”; zakwas: „Od dokarmienia minęło {czas} z {odstęp}.” Spirala nie jest przyciskiem; akcje są obok |
| Duży tekst | od AX1 spirala nad tekstem, szerokość rośnie (150 → 220 pt), opisy pod nią |
| Ruch | po „Zrobione”: zwój bieżący staje się gruby, znacznik przesuwa się do następnego (300 ms, easeOut); „Ogranicz ruch”: zmiana bez przejścia |
| RTL (ar, he) | spirala odbita w poziomie (kierunek czytania), dane bez zmian [do potwierdzenia w audycie po wdrożeniu] |
| Implementacja | `react-native-svg` (jest w `package.json`), punkty spirali liczone raz na plan; wzór w `ekrany/wspolne.js`, funkcja `spirala()` |

## 3. Tokeny
- Kolory, typografia, odstępy, promienie, cele, ruch, haptyka: `tokeny.json` (jedno źródło), propozycja modułu `tokeny.ts` (wygenerowana). Cztery warianty kolorów: jasny, ciemny, jasny i ciemny ze „Zwiększ kontrast”.
- Kontrast: `kontrast.md` — 31 par × 4 warianty, wszystkie spełniają progi (tekst 4,5, grafika z danymi i obwódki 3; WCAG 2.2, 1.4.3 i 1.4.11); pary spirali na tle ekranu i na karcie (`powierzchnia`) oraz zwój bieżący na zwoju przyszłym (`tusz` / `ratanSzary`) od partii 6 (§11c, 110).
- Kolor ostrzeżenia `#F7D117` z czarnym tekstem i trójkątem (logika ISO 7010, nie kopia znaku) — używany tylko do ostrzeżeń bezpieczeństwa i zasady ostrożności (RD-21…RD-23). Błąd ma osobny kolor `blad` + ikonę. Akcent `noc` znaczy „działanie” i „noc w lodówce” w spirali — to samo znaczenie (czas, który płynie bez ciebie; D-051, 4a).
- Typografia: Sofia Sans Semi Condensed (tytuły, czasy, ceny) dla łacinki, cyrylicy i greki; w pozostałych pismach i w treści krój systemowy. Skala z HIG (Large Default → AX5): treść 17 → 53 pt, tytuł kroku 28 → 58, duży tytuł 34 → 60, czas 56 → 99 (własny, skala jak Large Title). Liczby tabelaryczne. Żaden tekst nie ma limitu linii; przy AX5 długie słowa mogą się dzielić, nigdy nie są ucinane (055).
- Cele: 48 pt w prowadzeniu i akcjach głównych, 44 pt w pozostałych, przycisk kciuka 64 pt (DEC-15 a).

## 4. Komponenty
| Systemowe (iOS, bez zmian zachowania) | Własne (tylko te) |
|---|---|
| nawigacja z dużym tytułem, pasek zakładek (4: Dziś, Receptury, Zakwasy, Dziennik; bezpieczny margines wskaźnika Home, 054), listy grupowane, przełącznik, wybór segmentowy (jednostki), stepper, arkusz, alert potwierdzenia, prośba systemowa o ocenę (OG-07), prośba o zgodę na powiadomienia, `showManageSubscriptionsIOS`, ekran poczty | **Spirala** (element firmowy), **Pasek kciuka** (przycisk 64 pt + rząd dwóch 48 pt), **Ostrzeżenie** (żółte pole: ikona + tytuł + tekst, `role=alert`), **Wybór czynności** (wiersz startu: ikona + nazwa + jedno zdanie), **Opcja planu** (oferta: nazwa, cena największa, przeliczenie mniejsze, znacznik wyboru kształtem), **Pasek „Cofnij”** (po działaniu rutynowym, z „Przywróć”) |
Emoji nie są ikonami (088); ikony to symbole SF na iOS (w makiecie rysowane zastępczo).

## 5. Słownik interakcji (jedna nazwa na akcję, 089)
| Akcja | Gdzie | Wynik / komunikat |
|---|---|---|
| Zrobione | pasek kciuka w kroku | następny krok; jeśli przed terminem — dalsze kroki i powiadomienia przesuwają się wcześniej (BR-HARMO-005) |
| Cofnij poprzedni | pasek kciuka | wraca poprzedni krok, powiadomienia wracają do poprzednich godzin; pasek „Cofnięto …” z „Przywróć” |
| Po co ten krok | pasek kciuka | arkusz z wyjaśnieniem roli 06; zamknięcie wraca do kroku bez zmian (F-44) |
| Wróć do wypieku | Dziś | bieżący krok (F-58) |
| Ułóż plan / Zacznij wypiek | receptura / plan | plan wstecz / start z prośbą o zgodę (jedno zdanie wcześniej, BR-CZAS-003); w stanie `plan-za-pozno` „Zacznij wypiek” nieaktywny z powodem (§11c 107) |
| Ustaw tę godzinę / Use This Time | Plan wypieku, stan `plan-za-pozno` | godzina gotowości = najwcześniejsza możliwa (teraz + długość planu, w górę do 5 min); stan znika, „Zacznij wypiek” aktywny |
| Zapisz jako moją, Temperatura wody, Zmień składniki | receptura | razem z „Ułóż plan” najwyżej 4 akcje (057) |
| Więcej → Kopiuj jako tekst, Udostępnij plik receptury | receptura, menu systemowe z przycisku w pasku nawigacji | tekst receptury w schowku („Skopiowano recepturę”); arkusz udostępniania systemu z plikiem receptury (F-33); stan `receptura-wiecej` |
| Zapisz dokarmienie, Podwoił objętość, Coś mnie niepokoi, Edytuj | zakwas | wpis; „gotowy” z atrybucją; objawy; poprawa wpisu (F-62) |
| Zapisz / Anuluj / Zamknij | arkusze, oferta | jak w słowniku studia; oferta ma zawsze widoczne „Zamknij” |
| Zacznij okres próbny / Kup plan roczny / Kup plan miesięczny / Kup dostęp dożywotni / Przywróć zakupy / Zarządzaj subskrypcją | oferta (bez „Zarządzaj subskrypcją”, §11e 127), ustawienia; „Zarządzaj subskrypcją” w ustawieniach i w banerze uprzedzenia na „Dziś” (§11d 126) | StoreKit; bez sieci komunikat i „Spróbuj ponownie” |
| Usuń wszystkie dane | ustawienia | potwierdzenie: „Usunąć wszystkie dane?” [Anuluj] [Usuń wszystko] (kolor błędu tylko na przycisku destrukcyjnym) |
| Oceń w App Store, Napisz do nas | ustawienia | strona aplikacji z formularzem recenzji; Poczta z podglądem treści (BR-OPIN-002, -003) |
| Przerwij wypiek / Stop Bake | Plan wypieku (z prowadzenia), dół listy | alert „Przerwać wypiek? Powiadomienia o kolejnych krokach znikną.” [Wróć do wypieku] [Przerwij]; zastępuje „Odrzuć wypiek” (056) |
| Zrobione na ostatnim kroku | pasek kciuka | arkusz oceny: gwiazdki 1–5, [Zapisz] / Save; przy ≤ 2★ „Otwórz Doktora Chleba” / Open Bread Doctor i „Nie teraz” / Not Now (F-43); przy ≥ 4★ tylko prośba systemowa (D-042) |
| Wybierz recepturę / Choose a Recipe | pusty Dziennik (`dziennik-pusty`) | zakładka Receptury, lista receptur (§11c 116) |
| Przesuń do lodówki / Move to fridge, Zostaw nocne składanie / Keep the night fold | Plan wypieku, kolizja ze snem (`plan-sen`) | fermentacja w lodówce na noc, nowa godzina „gotowe” / plan bez zmian; zastępuje „Rozwiąż kolizję” |
| Piecz ponownie / Bake Again | wpis w Dzienniku | receptura z wpisu z ilościami z tamtego wypieku (F-28) |
| Usuń wpis / Delete Entry, Usuń recepturę / Delete Recipe | wpis Dziennika, wpis zakwasu, receptura własna (gest przesunięcia + ta sama akcja w menu wiersza) | bez pytania, pasek „Usunięto {obiekt}” z „Przywróć” / Restore (D-051 1a) |
| Eksportuj do pliku / Export to File, Importuj z pliku / Import from File, Kopie zapasowe / Backups | Ustawienia (z „Dziś”) | eksport: arkusz udostępniania z jednym plikiem; import: jedno wejście dla receptury i kopii, podgląd według rodzaju pliku (`import-receptura`: „Dodaj”; `import-kopia`: „Zastąp dane”), kopia przed importem, potem dane w aplikacji (F-33, §11c 113); kopie: lista 10 ostatnich (F-32) |
| Dodaj mąkę / Add Flour, Gotowe / Done | arkusz „Składniki” | nowy wiersz mąki; zamknięcie arkusza z zapisem (F-11) |
| Wstaw gotową mieszankę / Use a Flour Blend | arkusz „Składniki”, menu systemowe | mąki i procenty z wybranej mieszanki zastępują listę mąk (§11c 106) |
| Pokaż wszystkie / Show All | lista receptur z pustym filtrem | filtr „Wszystkie” |
| Kopiuj jako tekst / Copy as Text | plan wypieku (pod listą kroków), wynik Doktora Chleba, karta „Ilości do dokarmienia” | tekst w schowku („Skopiowano plan wypieku do schowka”, „Skopiowano diagnozę do schowka”, „Skopiowano proporcje dokarmiania do schowka”); zastępuje „Kopiuj harmonogram”, „Kopiuj diagnozę”, „Kopiuj dokarmienie” (089, 113) |
| Wróć do wypieku / Back to Bake | wynik Doktora Chleba (gumowaty miękisz) | prowadzenie bieżącego kroku; bez trwającego wypieku „Dziś” (117); zastępuje „Przejdź do Stolnicy” (089) |
| Otwórz recepturę / Open Recipe | Doktor Chleba (zbity miękisz), protokół ratunkowy | lista receptur albo receptura z protokołu |
| Otwórz Ustawienia / Open Settings | baner „powiadomienia wyłączone” | Ustawienia systemu dla aplikacji |
| Rozpocznij Fazę 2 / Start Phase 2 | prowadzenie, pieczenie w garnku żeliwnym | druga faza pieczenia bez pokrywki z czasem i temperaturą |
| Eksportuj kopię danych / Export a copy of your data, Udostępnij kopię bazy / Share database copy | ekran ratunkowy przy błędzie bazy (`RescueScreen`, `StorageGate`) | arkusz udostępniania z kopią danych |
| Kopiuj adres / Copy address | okno „Napisz do nas”, gdy Poczta nie jest skonfigurowana | adres w schowku |
| Wejścia PÓŹNIEJ, ukryte w 1.0 (nazwa do potwierdzenia przy włączeniu): Zastosuj mieszankę, Importuj recepturę, Udostępnij recepturę, Udostępnij kod QR, Eksportuj historię wypieków (CSV), Eksportuj spiżarnię mąk (CSV) | mieszanka mąk (F-46), QR (F-08), eksport CSV | bez zmian do decyzji o wejściu |

Słownik jest jedynym źródłem nazw akcji w 1.0 (089): akcja spoza tabeli wymaga wpisu tutaj przed wdrożeniem. Nazwy z kodu, które znikają: „Klonuj recepturę” (= Zapisz jako moją), „Rozpocznij wypiek na Stolnicy” (= Ułóż plan, potem Zacznij wypiek), „Następny krok” (= Zrobione), „Odrzuć wypiek” (= Przerwij wypiek), „Resetuj” (czas etapu: brak w systemie; profil zakwasu: „Zacznij od nowa” / Start Over), „Eksportuj JSON” (= Udostępnij plik receptury).

Etykiety VoiceOver: „akcja + obiekt” (np. „Mniej bochenków”, „Zrobione: składanie 2 z 4”). Rutynowe usunięcie (wpis zakwasu, receptura własna): bez pytania, z paskiem „Cofnij” przez kilka sekund; potwierdzenie tylko dla „Usuń wszystkie dane” i zakwasu z historią (D-051, 1a).

## 6. Macierz stanów (makiety)
| Ekran | Stany w `ekrany/` |
|---|---|
| Start (F-68) | `pierwsze-uruchomienie` (bez danych zmyślonych, 087), `trwa-wypiek` (powrót jednym dotknięciem), `tylko-historia` (F-67, kłódka + tekst), `uprzedzenie-proby`, `uprzedzenie-proby-trwa-wypiek`, `uprzedzenie-proby-nieznane` (F-67, baner raz przed końcem próby, §11d 126) |
| Prowadzenie (F-07, F-57, F-16, F-18, F-58) | `w-trakcie`, `koniec-kroku` (ostrzeżenie RD-23, „po czasie”), `brak-zgody` (stała informacja + Ustawienia), `zgoda` (zdanie przed prośbą), `po-cofnieciu`, `ostrzezenie-dwie-sekcje` (jedno Ostrzeżenie, tytuł według rodzaju, §11c 109) |
| Receptura (F-09, F-10, F-11, F-26, F-27, F-55, F-56) | `lista-receptur` (ekran główny zakładki, filtr rodzaju, moje i bazowe; §11c 106), `receptura-zaczyn` („Do miski” w dwóch grupach), `skladniki-pelne` (tryb, mąki, proporcje, zaczyn), `receptura` (≤ 4 akcje), `receptura-wiecej` (menu „Więcej”, 057), `mieszanka-i-sol` (wariant żytni, informacja o soli bez blokady), `temperatura-wody` |
| Zakwas (F-22…F-25, F-60, F-62, F-64) | `karta` (cykl, „Podwoił objętość”), `zakladanie-dzien-3` (dzień N, 7–10 dni), `plesn` (RD-21, polecenie zamiast listy) |
| Oferta i zakup (F-35, F-37, F-67) | `oferta-proba` (3 opcje, ujawnienia U1–U8), `zakup-bez-proby`, `bez-sieci` (teksty i klucze §11e 127); uprzedzenie przed końcem próby jest na „Dziś” (stany startu, §11d 126) |
| Inne | `plan-sen` (zakres 20–26 °C / 68–79 °F, kolizja ze snem i propozycja), `plan-za-pozno` (start planu przed „teraz”: zdanie z godzinami, „Ustaw tę godzinę”, „Zacznij wypiek” nieaktywny z powodem; §11c 107), `dziennik-pusty` (zaproszenie i „Wybierz recepturę”, §11c 116), `ocena-slaba` (Doktor ≤ 2★; przy ≥ 4★ tylko prośba systemowa, bez własnego okna), `ustawienia` (jednostki, dane, Pro, kontakt, polityka), `import-receptura` i `import-kopia` (podgląd po „Importuj z pliku”, §11c 113) |
Ładowanie: brak (wszystko lokalne; szkielet tylko przy imporcie pliku > 1 s). Brak wyników: lista receptur z filtrem rodzaju — „Brak receptur tego rodzaju. Pokaż wszystkie.” Offline: tylko zakup i przywrócenie (bez sieci).

## 7. Miary USA (096, D-044)
- Jeden wybór w ustawieniach: „gramy, °C” / „uncje, °F” (D-051, 3a); domyślnie według regionu (US → imperialne). Baza zawsze metryczna; procenty bez zmian.
- Masa: ≥ 16 oz → „1 lb 14,0 oz” (w en-US „1 lb 14.0 oz”); 1–16 oz jedno miejsce po przecinku; < 1 oz dwa miejsca (sól 17 g → 0.60 oz, drożdże 1 g → 0.04 oz). Stała 0,03527396195 oz/g jak w `src/lib/unit-converter.ts`.
- Temperatura: °F w liczbach całkowitych; zakres modelu 20–26 °C = 68–79 °F (chipy 68, 72, 75, 79 °F); pole wejścia przyjmuje jednostkę z ustawienia.
- Godziny: format regionu (en-US 12 h z AM/PM, PL 24 h); teksty powiadomień w tych samych jednostkach.
- Zrzuty: `wzorce-zrzuty/*-en-US-imp-*`.

## 8. Głos
- Ton: spokojny, konkretny, pierwsza osoba aplikacji („Dam znać”, „Policzę”), druga osoba użytkownika, bez wykrzykników, bez sprzedawania, bez zdrobnień.
- Zakazane: „Ups”, „Brawo”, „Super”, „za darmo” (bez dopowiedzenia o odnowieniu), „najpopularniejszy”, „tylko dziś”, „zdrowy” i „bezpieczny” o zakwasie (DEC-10 a), kody błędów, angielskie wstawki w PL.
- Wzory: pusty — co zrobić („Nic się dziś nie piecze. Wybierz, co robisz.”); błąd — co się stało, co działa, co zrobić („Nie zapisałem zmiany planu. Poprzedni plan działa dalej. Spróbuj jeszcze raz.”); sukces — następny krok („Wypiek zapisany. Jak wyszedł bochenek?”); prośba o zgodę — po co, jednym zdaniem; nieodwracalne — nazwa obiektu i skutek.
- Teksty dziedzinowe (kroki, objawy, „po co ten krok”, Doktor) tylko z rejestru roli 06; w makietach oznaczone „treść roli 06”.

## 9. Ruch, haptyka, dźwięk
Mapa w `tokeny.json` (`ruch`, `haptyka`, `dzwiek`). Sygnał kroku przy uśpionym telefonie: powiadomienie lokalne z nazwą kroku i dźwiękiem systemowym (DEC-02 a); w aplikacji „Zrobione” = haptyka średnia, dźwięk szelestu domyślnie wyłączony (przełącznik „Dźwięki w aplikacji” w ustawieniach, gdy dźwięk powstanie).

## 10. Poza ekranami
- Ikona (`ekrany/ikona.html`): spirala z przerwami na nocy, kropka końca; warianty jasny, ciemny i w odcieniu; czytelna jako spirala w 29 pt.
- Ekran startowy: tło motywu i pusta spirala, bez tekstu i bez reklamy (HIG, Branding). Intro: brak — powrót do trwającego wypieku ma być natychmiastowy.
- Powiadomienia: „Składanie 2 z 4: czas zacząć” + godzina następnego kroku; w trybie imperialnym °F.

## 11. Kryteria partii 5 → rozwiązanie w projekcie
| Zadanie | Jak rozwiązane |
|---|---|
| 050 kontrast, kolory poza motywem | `kontrast.md` (4 warianty, 0 braków); każdy kolor tylko z `tokeny.ts` |
| 051 VoiceOver | role i etykiety w makietach (`aria-label`, `role`), opis spirali, słownik „akcja + obiekt” |
| 052 cele dotykowe | 64/48/44 pt (`tokeny.json` → `cele`) |
| 054 pasek zakładek | systemowy, z marginesem wskaźnika Home (makieta: 34 pt) |
| 055 AX5 i 320 pt | zrzuty `*-320-*-ax5`: bez ucięć, stos pionowy, wartości pod etykietami |
| 056 widok skupiony i pasek kciuka | ekran prowadzenia; strefy, ukryte elementy i test w §11b |
| 057 ≤ 4 akcje | receptura: Ułóż plan, Zapisz jako moją, Temperatura wody, Zmień składniki; reszta w menu „Więcej” (§11b) |
| 058 element firmowy | spirala koszyka, rozdział 2; miejsca, etykiety PL/EN i test w §11b |
| 087 dane zmyślone | start bez danych; przykłady oznaczone ramką „przykład” |
| 088 emoji, teksty techniczne | ikony symboli, brak kodów w tekstach |
| 089 jedna nazwa na akcję | rozdział 5 |
| 090 wybory domyślne z decyzją | rozdział 12 i 12a (kalibracja wiersz po wierszu, test) |
| 096 miary USA | rozdział 7 i zrzuty en-US |
| 097–099 PÓŹNIEJ/NIE bez wejść | brak spiżarni, przelicznika objętości i lodu w makietach |
| 100 „po co ten krok” | przycisk w pasku kciuka; Akademia bez osobnego wejścia |
| 101 start „co dziś robisz” | ekran startu |
| 102 wcześniej i cofnięcie | „Zrobione” przed terminem, „Cofnij poprzedni” + pasek „Przywróć” |
| 103 ostrzeżenia w krokach | komponent Ostrzeżenie (koniec-kroku); krok nieznanego rodzaju: ostrzeżenie ogólne „Uważaj na gorące naczynia i surowe ciasto” [treść roli 06] |
| 104 zakwas od zera, z lodówki, poprawa, Doktor zakwasu | zakwas: dzień N, plan budzi z lodówki (dokarmienia w planie), „Edytuj” przy wpisie, „Coś mnie niepokoi” |

## 11b. Testy akceptacyjne partii 5 (rola 04, tryb fix, 2026-10-20)
Każdy punkt jest sprawdzalny testem albo zrzutem; testID to propozycja dla roli 08 (istniejące zostają, gdy znaczenie się nie zmienia, żeby ścieżki Maestro przetrwały).

### 057 · Receptura: najwyżej 4 akcje główne, reszta w menu (DEC-09 a)
Ekran receptury (dziś Kalkulator, zakładka „Receptury” według D-051 2a) ma w obszarze akcji dokładnie 4 przyciski i jeden przycisk „Więcej” w pasku nawigacji:

| Akcja PL / EN | Miejsce | testID | Zastępuje w kodzie |
|---|---|---|---|
| Ułóż plan / Make a Plan | przycisk główny 64 pt (`cele.przyciskKciuka`), `akcent` + `naAkcencie` | `start-bake-btn` (jeden) | `start-bake-btn` ×2 (`DoMiskiScaleCard`, `CalculatorActionButtons`), `fast-start-bake-cta-btn` |
| Zapisz jako moją / Save as Mine | przycisk drugi 48 pt | `save-custom-recipe-btn` | „Zapisz jako mój przepis” i „Klonuj recepturę” (`clone-recipe-btn`, ta sama akcja) |
| Temperatura wody / Water temperature | przycisk drugi 48 pt | `water-temp-btn` | wejście do temperatury wody (F-10) |
| Zmień składniki / Change Ingredients | przycisk drugi 48 pt | `edit-ingredients-btn` | `edit-blend-pro-btn`, `open-blend-builder-btn` (F-11, F-56) |
| Więcej (etykieta VoiceOver „Więcej działań: receptura” / “More actions: recipe”) | pasek nawigacji, prawy róg, cel 44 pt; menu systemowe iOS | `recipe-more-btn` | — |
| Więcej → Kopiuj jako tekst / Copy as Text | menu | `copy-recipe-btn` | „Kopiuj recepturę” |
| Więcej → Udostępnij plik receptury / Share Recipe File | menu | `export-recipe-json-btn` | „Eksportuj JSON” |

Poza ekranem receptury: „Importuj z pliku” tylko w Ustawieniach (F-33; usunąć `import-recipe-json-btn` i `open-import-recipe-btn` z receptury). Ukryte (PÓŹNIEJ, `src/lib/wejscia-pozniej.ts`): QR (`share-recipe-qr-btn`, `open-scan-qr-btn`, F-08), druk (`print-menu-btn`, F-50), spiżarnia (`open-flour-inventory-btn` ×2, F-30), przelicznik objętości (`open-volume-converter-btn`, F-45), odpowiedniki mąk (`open-flour-equivalents-btn`, F-46). Bez emoji w etykietach (088).

Test akceptacyjny 057: (1) render ekranu receptury: w obszarze akcji 4 elementy z rolą `button` (`start-bake-btn`, `save-custom-recipe-btn`, `water-temp-btn`, `edit-ingredients-btn`) i żadnego innego; (2) w drzewie ekranu każdy testID występuje najwyżej raz (brak duplikatów `start-bake-btn`, `open-flour-inventory-btn`, importu); (3) `recipe-more-btn` otwiera menu z dokładnie 2 pozycjami w tej kolejności; (4) etykiety bez znaków emoji (regex `\p{Extended_Pictographic}` = 0); (5) wzorzec: `wzorce-zrzuty/kalkulator-receptura-*` i stan `receptura-wiecej` w `ekrany/kalkulator.html`.

### 056 · Prowadzenie (Stolnica) w widoku skupionym z paskiem kciuka (DEC-09 a)
Wzorzec: `ekrany/prowadzenie.html`, stany `w-trakcie`, `koniec-kroku`, `brak-zgody`, `zgoda`, `po-cofnieciu`; zrzuty `wzorce-zrzuty/prowadzenie-*`. Ekran otwierany z „Dziś” („Wróć do wypieku”) bez paska zakładek; pasek kciuka przyklejony nad wskaźnikiem Home (dolny margines 34 pt), poza przewijaną treścią.

| Strefa (od góry) | Zawartość | Tokeny |
|---|---|---|
| nawigacja | „Dziś” (wstecz) · „Plan wypieku” (prawy róg: lista kroków, korekty planu, „Przerwij wypiek”) | `akcentTekst`, cel 44 |
| plan | nazwa receptury (`objasnienie`, `tusz2`); Spirala 150–220 pt + „Krok n z N”, „Gotowe {dzień} o {godzina}”, legenda | §2 |
| krok | tytuł kroku (`tytulKroku`), czas do końca (`czas`, cyfry tabelaryczne), „do {godzina}, potem {następny krok}”; treść kroku (rola 06); Ostrzeżenie, gdy krok go ma (F-57); „Ekran nie zgaśnie do końca kroku…” tylko w kroku czynnym (F-18) | `tusz`, `tusz2`, `ostrzTlo`/`ostrzTusz` |
| pasek kciuka | „Zrobione” / “Done” 64 pt pełnej szerokości (`akcent` + `naAkcencie`, promień 18); pod nim rząd 48 pt: „Cofnij poprzedni” / “Undo Previous”, „Po co ten krok” / “Why this step” (obwódka `obwodka` 1,5, promień 14) | `cele`, `promienie` |

Nie ma na tym ekranie: listy wszystkich etapów, kart liczb (`StolnicaSacredCard`), drugiego zegara i numeru etapu, przycisków korekty czasu (`adjust-time-*`), „Start”/„Wstrzymaj” (czas kroku biegnie od planu; BR-HARMO-005: „Zrobione” przed czasem przesuwa dalsze kroki) i akcji destrukcyjnej. „Odrzuć wypiek” staje się „Przerwij wypiek” / “Stop Bake” na ekranie „Plan wypieku”, na dole listy, tekst `blad`, z alertem „Przerwać wypiek? Powiadomienia o kolejnych krokach znikną.” [Wróć do wypieku] [Przerwij] (skutek dla danych jak dziś przy „Odrzuć wypiek”; rola 05/08). Etykieta VoiceOver „Zrobione: {nazwa kroku}” / “Done: {step name}”.

Test akceptacyjny 056: (1) render prowadzenia w aktywnym kroku: element `thumb-bar` zawiera dokładnie 3 przyciski — `next-or-finish-step-btn` („Zrobione”), `step-undo-btn` („Cofnij poprzedni”), `step-why-btn` („Po co ten krok”) — w tej kolejności; (2) `minHeight` ≥ 64 dla `next-or-finish-step-btn` i ≥ 48 dla dwóch pozostałych; (3) `thumb-bar` nie jest potomkiem `ScrollView`; (4) na ekranie prowadzenia brak `discard-bake-btn`, `adjust-time-*`, `stolnica-sacred-card` i listy etapów; „Przerwij wypiek” jest na „Plan wypieku” i otwiera `Alert` z przyciskiem `destructive`; (5) Spirala ma `accessibilityRole="image"` i etykietę według §2; (6) na urządzeniu przy 320 i 390 pt bez przewijania widać tytuł kroku, czas i „Zrobione” w dolnych 30% ekranu (Maestro e2e `assertVisible` bez `scroll`, krok roli 07).

### 058 · Element firmowy: Spirala koszyka (D-045, D-049 zastępują DEC-07 a)
System zatwierdzony przez właściciela (D-049 „Potwierdzam koszyk spiralny po obejrzeniu porównania”, D-051 E3) ma element firmowy opisany w §2. Komponent `Spirala` (`react-native-svg`, wzór `spirala()` w `ekrany/wspolne.js`) z danymi z planu użytkownika, nie z przykładu:

| Miejsce | Wariant | Dane | Etykieta VoiceOver PL / EN |
|---|---|---|---|
| prowadzenie | pełna 150–220 pt | kroki planu, „teraz”, godzina „gotowe” | „Plan wypieku, krok {n} z {N}: {nazwa}, zostało {czas}. Gotowe {dzień} o {godzina}.” / “Bake plan, step {n} of {N}: {name}, {time} left. Ready {day} at {time}.” |
| Dziś, trwający wypiek | mała 92 pt, grubości ×1,4 | jw. | jw. |
| plan przed startem | pełna, wszystkie zwoje cienkie | kroki planu, godzina „gotowe” | „Plan wypieku: {N} kroków. Gotowe {dzień} o {godzina}.” / “Bake plan: {N} steps. Ready {day} at {time}.” |
| karta zakwasu | jeden cykl, niecałe 2 zwoje | czas od dokarmienia i odstęp (OP-38: 12 h) | „Od dokarmienia minęło {czas} z {odstęp}.” / “{time} of {interval} since feeding.” |
| ekran startowy, ikona | pusta, bez danych | — | — (grafika ozdobna systemu, poza drzewem dostępności) |

Kolory tylko `ratan`, `ratanSzary`, `nocDane`, `tusz`, `tlo` (pary w `kontrast.md`, ≥ 3:1 we wszystkich 4 wariantach); stany kroku różnią się grubością i wzorem, nie tylko barwą (§2). Etykieta w makiecie (`spirala()`: „Plan: krok …”) jest skrócona; obowiązuje tabela wyżej.

Test akceptacyjny 058: (1) render prowadzenia, „Dziś” z trwającym wypiekiem, planu i karty zakwasu: każdy zawiera `testID="brand-spiral"` z `accessibilityRole="image"` i etykietą według wzoru z tabeli, wypełnioną danymi planu z testu (np. plan 13 kroków, krok 4 → „krok 4 z 13”); (2) test jednostkowy geometrii: liczba odcinków ścieżki = liczba kroków planu, odcinki zrobione mają `strokeWidth` 7, bieżący 9, przyszłe 3, noc w lodówce ma `strokeDasharray`; (3) zmiana planu (dłuższy krok) zmienia długość łuku tego kroku; (4) po zakryciu nazwy i ikony osoba rozpoznaje Piekarza po spirali (krytyka, pytanie 7; przejście poznawcze roli 04 po wdrożeniu).

## 11a. Zrzuty wzorcowe (linia bazowa audytu SP-13)
`wzorce-zrzuty/` (150 plików, skala 1×, nazwy `<ekran>-<stan>-<wariant>-<szerokość>-<motyw>[-ax5].png`), generowane `narzedzia/zrzuty.mjs` z `ekrany/*.html`:
- **pl**: 7 stanów kluczowych (start ×2, prowadzenie ×2, receptura, zakwas, oferta) × 320/390/430 × jasny/ciemny × domyślny/AX5 = 84; **pl-kontrast**: prowadzenie ×2 × 390 × jasny/ciemny („Zwiększ kontrast”) = 4;
- **en-US-imp** (miary USA): prowadzenie ×2, receptura, temperatura wody, zakwas, plan, ustawienia, start, oferta (9 stanów) × 390 jasny/ciemny + 320 jasny AX5 = 27;
- **fr** (najdłuższy język, `pomiar-jezykow.md`): 7 stanów × 320/390 jasny × domyślny/AX5 + 430 ciemny = 35 (razem 150);
- przegląd wszystkich 21 stanów przy 390 pt: `e3-przeglad.png`;
- 2026-10-20 (fix, 057): 20 zrzutów `kalkulator-receptura-*` wygenerowane ponownie z przyciskiem „Więcej” w pasku nawigacji (ta sama liczba plików, te same parametry); stan `receptura-wiecej` poza linią bazową (pl, en-US);
- 2026-10-20 (fix, partia 6, §11c): +31 zrzutów nowych stanów (pl 390 jasny/ciemny, pl 320 jasny AX5, en-US-imp 390 jasny): `kalkulator-lista-receptur`, `kalkulator-receptura-zaczyn`, `kalkulator-skladniki-pelne`, `inne-plan-za-pozno`, `inne-import-receptura`, `inne-import-kopia`, `inne-dziennik-pusty` (po 4) i `prowadzenie-ostrzezenie-dwie-sekcje` (3, bez en-US); wygenerowane ponownie z tymi samymi parametrami: `prowadzenie-koniec-kroku-*` (22, tytuł „Gorące naczynie”), `prowadzenie-*-pl-kontrast-*` (4, nowy `ratanSzary`), `prowadzenie-*-en-US-imp-*` (6, “Bake Plan”); razem 181 plików;
- 2026-10-21 (fix, partia 8, §11d 126): +12 zrzutów `start-uprzedzenie-proby*` (3 stany × pl 390 jasny/ciemny, pl 320 jasny AX5, en-US-imp 390 jasny); razem 193 pliki. Zrzuty fr tych stanów (długość) tylko w raporcie roli 04 z partii 8.
Ograniczenia nazwane: makieta w Chromium, nie na iOS (krój treści zastępczy Noto Sans, symbole zastępcze); AX5 przy 320 pt dzieli długie słowa (fr z dzieleniem, pl bez słownika dzielenia w Chromium) — nic nie jest ucięte; na urządzeniu sprawdza rola 07/właściciel.

## 11c. Partia 6 (rola 04, tryb fix, 2026-10-20)
Uzupełnienia systemu dla zadań planu M2 partii 6; wdrożenie w kodzie robi rola 08 pod tymi samymi ID. Każdy punkt ma test akceptacyjny jak w §11b; testID to propozycja (istniejące zostają, gdy znaczenie się nie zmienia). Zrzuty wzorcowe nowych i zmienionych stanów: `wzorce-zrzuty/` (pl 390 jasny i ciemny, 320 jasny AX5; nazwy jak w §11a).

### 110 · Spirala w „Zwiększ kontrast”: nowy `ratanSzary` (031)
Bieżący zwój (`tusz`, grubość 9) leży na zwoju przyszłym (`ratanSzary`, grubość 3), więc to sąsiednie kolory w rozumieniu WCAG 1.4.11. W wariantach kontrastowych para miała 2,99 i 2,78. Nowe wartości (ten sam ciepły szary, inna jasność), wszystkie pary spirali ≥ 3 we wszystkich 4 wariantach (`kontrast.md`):

| Token | Wariant | Było | Jest | `tusz` / `ratanSzary` | `ratanSzary` / `tlo` | `ratanSzary` / `powierzchnia` |
|---|---|---|---|---|---|---|
| `ratanSzary` | jasnyKontrast | `#5E5850` | `#7C7568` | 2,99 → 4,60 | 7,03 → 4,56 | 4,56 |
| `ratanSzary` | ciemnyKontrast | `#A39A8B` | `#837C6D` | 2,78 → 4,14 | 7,55 → 5,07 | 4,16 |

Warianty jasny i ciemny bez zmian (`tusz` / `ratanSzary` 4,45 i 4,06). Do `tokeny.json` dopisane pary: `tusz` / `ratanSzary`, `ratan` / `powierzchnia`, `ratanSzary` / `powierzchnia`, `nocDane` / `powierzchnia` (próg 3; karta zakwasu i karta trwającego wypieku). *Dlaczego jaśniejszy w jasnym i ciemniejszy w ciemnym:* zwój przyszły musi odstawać i od tła, i od tuszu; przedział jasności, który spełnia oba warunki, leży między starymi wartościami a tłem.

Test akceptacyjny 110: (1) `node docs/design/narzedzia/tokeny.mjs` kończy się kodem 0 (31 par × 4 warianty); (2) w `src/ui/tokeny.ts` `ratanSzary` = `#7C7568` (jasnyKontrast) i `#837C6D` (ciemnyKontrast), a test kontrastu motywu (`src/ui/__tests__/theme-contrast.test.ts`) ma pary z tabeli wyżej z progiem 3; (3) zrzut `wzorce-zrzuty/prowadzenie-w-trakcie-pl-kontrast-390-*`.

### 109 · Tytuł Ostrzeżenia według rodzaju zagrożenia (035)
Decyzja właściciela 2026-10-20 („3a”): tytuł Ostrzeżenia mówi, czego dotyczy zagrożenie, zamiast stałego „Bezpieczeństwo”. Zdania ostrzeżeń zostają bez zmian (rejestr roli 06, `src/core/step-warnings.ts`); zmienia się tylko tytuł.

| Sekcja (stała w `step-warnings.ts`) | Rodzaje kroków | Tytuł PL / EN | Priorytet |
|---|---|---|---|
| `HOT_VESSEL_WARNING` | `preheat_oven`, `bake`, `lid_on`, `rye_bake`, `cool`, `rye_cool` | „Gorące naczynie” / “Hot cookware” | 1 |
| `STARTER_WARNINGS` | `starter_feed`, `rye_starter` | „Surowy zakwas” / “Raw starter” | 2 |
| `RAW_DOUGH_WARNINGS` | `autolyse`, `bulk_ferment`, `pre_shape`, `final_shape`, `rye_shape` | „Surowe ciasto i mąka” / “Raw dough and flour” | 3 |
| `CHILDREN_WARNING` | (dziś zawsze razem z gorącym naczyniem) | „Dzieci w kuchni” / “Children in the kitchen” | 4 |
| `UNKNOWN_KIND_WARNING` | rodzaj spoza mapy (np. krok własnej receptury) | „Uważaj w kuchni” / “Take care in the kitchen” | zawsze, gdy obecna |

Reguła dla kroku z dwiema sekcjami (np. pieczenie: gorące naczynie + dzieci; nieznany rodzaj w czasie wypieku: nieznany + gorące naczynie): **jedno Ostrzeżenie** z jednym tytułem i wszystkimi zdaniami w kolejności z `STEP_KIND_WARNINGS` (każde zdanie w osobnej linii). Tytuł: gdy wśród sekcji jest `UNKNOWN_KIND_WARNING` — „Uważaj w kuchni” (zdanie ogólne obejmuje resztę); w przeciwnym razie tytuł sekcji o najwyższym priorytecie z tabeli (pieczenie → „Gorące naczynie”). *Dlaczego jedno:* jedno żółte pole to jeden `role=alert`, jedno ogłoszenie VoiceOver i jedna haptyka `ostrzezenieWKroku`; dwa pola obok siebie podwajają alarm przy tym samym kroku, a kolor ostrzeżenia traci wagę. Ikona bez zmian (trójkąt komponentu Ostrzeżenie; w makiecie zastępczo rysunek pary). Etykieta VoiceOver: „{tytuł}. {zdanie 1} {zdanie 2}”.

Makieta: `ekrany/prowadzenie.html`, nowy stan `ostrzezenie-dwie-sekcje` (krok „Pieczenie pod pokrywą”); w stanie `koniec-kroku` roboczy tytuł „Gorąca para” zastąpiony przez „Gorące naczynie” (zrzuty `prowadzenie-koniec-kroku-*` wygenerowane ponownie, te same parametry i liczba plików).

Test akceptacyjny 109: (1) test jednostkowy funkcji tytułu (np. `tytulOstrzezen(ostrzezenia)` w `src/core/step-warnings.ts`) dla każdego klucza `STEP_KIND_WARNINGS` z niepustą listą i dla `stepKindWarnings(null)` oraz `stepKindWarnings(null, { duringBake: true })`: wynik według tabeli (np. `bake` → „Gorące naczynie”, `starter_feed` → „Surowy zakwas”, `bulk_ferment` → „Surowe ciasto i mąka”, nieznany w czasie wypieku → „Uważaj w kuchni”); (2) render `StrefaKroku` dla kroku `bake`: dokładnie jeden element z `accessibilityRole="alert"`, tytuł „Gorące naczynie”, oba zdania; (3) tekst „Bezpieczeństwo” nie występuje w `StrefaKroku.tsx` ani w kluczach i18n używanych przez prowadzenie; tytuły EN w `src/lib/i18n-en/` według tabeli; (4) wzorzec `wzorce-zrzuty/prowadzenie-ostrzezenie-dwie-sekcje-pl-*`.

### 107 · Plan wypieku: stan „za późno” (024)
Stan `plan-za-pozno` (`ekrany/inne.html`) występuje, gdy początek pierwszego kroku planu (`steps[0].plannedStart`, po dokarmieniu z lodówki według D-052) jest wcześniejszy niż „teraz” (z dokładnością do minuty). Stan liczy się od nowa przy każdej zmianie godziny, temperatury i zakwasu oraz co minutę, gdy ekran jest otwarty (ekran zostawiony na noc może przejść w ten stan).

| Strefa (od góry) | Zawartość w stanie „za późno” |
|---|---|
| pytanie i godzina | bez zmian: „Kiedy chleb ma być gotowy?”, pole dnia i godziny |
| informacja (pod polem godziny) | pole `powierzchnia` z obwódką `tusz` 2 pt, ikona zegara (symbol SF `clock`), `role` statusu (nie alert: to nie zagrożenie, kolor ostrzeżenia `ostrzTlo` zostaje tylko dla bezpieczeństwa, §3): tytuł „Nie zdążysz na tę godzinę” / “Not enough time for this”; treść „Plan musiałby się zacząć {dzienStartu} o {godzinaStartu}. Najwcześniej chleb będzie gotowy {dzienGotowe} o {godzinaGotowe}.” / “The plan would have to start {startDay} at {startTime}. The earliest the bread can be ready is {readyDay} at {readyTime}.” |
| akcja naprawy | przycisk drugi 48 pt „Ustaw tę godzinę” / “Use This Time” (`plan-use-earliest-btn`) |
| reszta planu | temperatura i zakres bez zmian; baner kolizji ze snem ukryty, dopóki trwa ten stan (najpierw godzina, potem noc); przy spirali bez „Start {dzień} o {godzina}”, zostaje „{N} kroków, {M} z nich czynnych” i „Całość trwa {czas}.” (§11c 116) |
| pasek kciuka | „Zacznij wypiek” nieaktywny: tło `powierzchnia`, obwódka `obwodka` 1,5, tekst `zablokowane`, `accessibilityState.disabled`, podpowiedź VoiceOver = powód; pod przyciskiem powód tekstem: „Najpierw ustaw godzinę, na którą zdążysz.” / “First set a time you can make.” |

Wartości w tekście: `{dzien…}` jak dziś w planie, małą literą w środku zdania: „wczoraj”, „dziś”, „jutro”, „pojutrze”, dalej „{dzień tygodnia}, {d} {miesiąc}” (EN “yesterday”, “today”, “tomorrow”, “the day after tomorrow”, dalej “{weekday}, {month} {d}”); godziny w formacie regionu (§7). Najwcześniejsza godzina gotowości = teraz + długość planu, zaokrąglona w górę do pełnych 5 minut. „Ustaw tę godzinę” wpisuje ją w pole dnia i godziny; stan znika, „Zacznij wypiek” staje się aktywne.

Zachowanie „Zacznij wypiek” w tym stanie: **nieaktywny z powodem** (nie potwierdzenie). *Dlaczego:* start planu z krokami w przeszłości daje powiadomienia, które już minęły, i krok bieżący, który nie zgadza się z ciastem; naprawa jest jednym dotknięciem obok, więc okno potwierdzenia dodałoby krok bez wartości.

Domyślna godzina gotowości (opcja b z audytu): przy otwarciu planu, gdy domyślna godzina dałaby stan „za późno”, ekran od razu proponuje najwcześniejszą godzinę (reguła wyżej) zamiast domyślnej; w innym wypadku zostaje domyślna. Ile wynosi domyślna godzina, to nie wartość tego systemu (dziś w kodzie „jutro 10:00”; zmiana należy do roli 05/08 i właściciela). Stan „za późno” pojawia się więc tylko po ręcznym wyborze godziny albo po upływie czasu przy otwartym ekranie.

Test akceptacyjny 107: (1) render planu z zegarem ustawionym tak, że `steps[0].plannedStart` < teraz: widoczny tekst tytułu i treści z wartościami z planu (np. teraz 20:15, plan 27 h 35 min, cel jutro 7:00 → „Plan musiałby się zacząć dziś o 3:25. Najwcześniej chleb będzie gotowy jutro o 23:50.”), `plan-start-bake-btn` ma `accessibilityState.disabled === true`, a jego naciśnięcie nie wywołuje `setActiveBake`; (2) naciśnięcie `plan-use-earliest-btn` ustawia godzinę gotowości na „jutro 23:50”, stan znika, przycisk startu jest aktywny; (3) otwarcie planu o 20:15 z planem dłuższym niż czas do domyślnej godziny: pole pokazuje najwcześniejszą godzinę, stan „za późno” niewidoczny; (4) przy stanie „za późno” baner kolizji ze snem nie jest renderowany; (5) wzorzec `wzorce-zrzuty/inne-plan-za-pozno-*`.

### 106 · Receptury według makiety: lista, ekran receptury, arkusz „Składniki” (022)
Zakładka „Receptury” ma dwa poziomy i dwa arkusze: **lista receptur** (ekran główny zakładki, stan `lista-receptur`) → **ekran receptury** (push w stosie zakładki, stany `receptura`, `receptura-zaczyn`, `receptura-wiecej`) → arkusze **„Składniki”** (`mieszanka-i-sol`, `skladniki-pelne`) i **„Temperatura wody”** (`temperatura-wody`). Ekran receptury ukrywa pasek zakładek (`hidesBottomBarWhenPushed`, w expo-router opcja ekranu stosu), bo to ekran pracy przy misce z paskiem akcji w strefie kciuka, jak w makiecie; lista ma pasek zakładek. *Dlaczego dwa poziomy:* wybór receptury to nawigacja (D-047: bez oferty), a ekran receptury ma mieścić ilości i „Ułóż plan” w jednym widoku (SP-17).

Mapa: element dzisiejszego ekranu `app/(tabs)/receptury/index.tsx` → miejsce w systemie

| Element dziś (plik) | Miejsce | Uwagi |
|---|---|---|
| katalog „Receptury mistrzowskie” z filtrem rodzaju (`FormulaPresetSelector.tsx`) | **lista receptur**: filtr jako zawijane chipy 44 pt („Wszystkie”, „Na zakwasie”, „Żytnie”, „Drożdżowe”, „Pizza i słodkie”, bez licznika), grupa „Receptury bazowe” | wiersz: nazwa (`tresc`) + „{rodzaj}, poziom {trudność}” (`przypis`, `tusz2`) + szewron; filtr z „Co dziś robisz?” jak dziś (`odbierzRodzajReceptur`); pusty filtr: „Brak receptur tego rodzaju.” + „Pokaż wszystkie” (§6) |
| „Moje przepisy” (chipy z ✕) | **lista receptur**, grupa „Moje receptury” nad bazowymi (gdy są) | usunięcie: gest przesunięcia + „Usuń recepturę” w menu wiersza, bez pytania, pasek „Usunięto recepturę” z „Przywróć” (§5, D-051 1a; dziś `confirmDeleteRecipe` pyta) |
| karta szczegółów receptury bazowej (opis, pieczenie, naczynie, wskazówki) | **ekran receptury**, sekcja „O recepturze” pod informacją o hydratacji (poza pierwszym widokiem, w przewijanej treści) | treść roli 06; kategoria i trudność tylko na liście |
| karta liczb `CalculatorSacredCard` (hydratacja, masa, mąka, DDT) | usunięta bez zastępstwa w formie kart | hydratacja: zdanie `info` pod „Do miski”; masa: „Masa bochenka” i „Razem {masa}” pod listą; mąka: wiersz w „Do miski”; DDT: arkusz „Temperatura wody” (§12a: karty liczb usunięte) |
| przełącznik „Bochenki / Masa mąki” (`DoMiskiScaleCard.tsx`) | tryb: **arkusz „Składniki”**, pierwszy wybór „Ilości liczę od: bochenków / masy mąki” (wybór segmentowy) | ekran receptury pokazuje wiersze trybu: „Bochenki” (stepper) + „Masa bochenka” (pole liczby) albo „Masa mąki” (pole liczby, krok jak dziś); chipy „1–4 szt.” znikają (ta sama wartość co stepper, jedna kontrolka na wartość) |
| „Do miski na wagę” z odhaczaniem | **ekran receptury**, lista grupowana „Do miski (odhaczaj przy ważeniu)” | wiersz: pole wyboru 28 pt w celu 48 pt, nazwa + procent (`przypis`), masa (`naglowek`, cyfry tabelaryczne); drożdże tylko gdy > 0, zakwas tylko gdy > 0 (jak dziś) |
| woda % (dziś „Hydratacja bazy” w arkuszu temperatury, `AccordionDdtSection.tsx`) | **arkusz „Składniki”**, grupa „Proporcje (procent mąki)”: „Woda” | z arkusza temperatury wody znika stepper hydratacji (arkusz liczy tylko temperaturę) |
| zakwas %, hydratacja zakwasu, drożdże % (dziś tylko z receptury, bez edycji) | **arkusz „Składniki”**, „Proporcje”: „Zakwas”, „Hydratacja zakwasu” (tylko gdy zakwas > 0), „Sól”, „Drożdże” | pola liczby z `NumInput` (przecinek i kropka); sól z informacją F-56 (`mieszanka-i-sol`) |
| zaczyny (`accordion/AccordionPrefermentSection.tsx`) | **arkusz „Składniki”**, grupa „Zaczyn”: wiersz „Rodzaj” (menu systemowe: bez zaczynu, poolish, biga, stare ciasto, levain) + po wyborze „Mąka w zaczynie” (menu: 15, 20, 25, 30, 40 %) i wskazówka roli 06; **ekran receptury**: „Do miski” jako dwie grupy (`receptura-zaczyn`) | nazwy zaczynów w PL do potwierdzenia przez rolę 06 (dziś „Bezpośrednie”, „Pâte Fermentée”); rozbicie „Zaczyn / Do miski (Ciasto właściwe)” z akordeonu przechodzi w grupy listy |
| mieszanka mąk: gotowe mieszanki (chipy `POPULAR_FLOUR_BLENDS`) i lista mąk (`AccordionFlourBlendSection.tsx`) | **arkusz „Składniki”**, grupa „Mąki (razem 100%)”: wiersze mąk z %, „Dodaj mąkę”, „Wstaw gotową mieszankę” (menu systemowe z nazwami mieszanek) | „Zmień składniki” otwiera ten arkusz (dziś `FlourBlendModal`); chłonność mąk z `AccordionDdtSection` jako zdanie `info` pod mąkami (treść roli 06) |
| docelowa temperatura ciasta (`AccordionDdtSection.tsx`) | **arkusz „Temperatura wody”**: „Ciasto ma mieć” (stan `temperatura-wody`) | bez zmian w systemie |
| strata piecowa z presetem rodzaju wypieku (`AccordionBakeLossSection.tsx`) | bez miejsca w 1.0: F-48 PÓŹNIEJ, wejście ukryte (`wejscia-pozniej.ts`) | nie jest usunięciem funkcji z zakresu (kontrakt zakresu, wiersz F-46…F-52) |
| przelicznik objętości, skan QR, spiżarnia, odpowiedniki mąk, druk | bez miejsca w 1.0 (PÓŹNIEJ, §11b 057) | bez zmian |
| akordeon „Parametry Rzemieślnicze & Mąki” (`ArtisanAccordionPro.tsx`) | znika; zawartość w arkuszu „Składniki” | |

Żadna funkcja z zakresu 1.0 nie zostaje bez miejsca, więc decyzja produktowa nie jest potrzebna.

Kolejność sekcji ekranu receptury (od góry): pasek nawigacji (wstecz „Receptury”, „Więcej” 44 pt) → duży tytuł = nazwa receptury → znacznik „receptura bazowa, przykład” tylko w makiecie → grupa trybu (Bochenki + Masa bochenka albo Masa mąki) → „Do miski” (jedna grupa albo „Zaczyn: {rodzaj}” + „Do miski”) → zdanie o hydratacji → „Razem {masa}” → „O recepturze” (opis, pieczenie, naczynie, wskazówki; tylko receptury bazowe) → **strefa akcji przyklejona do dołu poza przewijaniem**: „Ułóż plan” 64 pt, „Zapisz jako moją” + „Temperatura wody” 48 pt, „Zmień składniki” 48 pt (§11b 057). Gdy strefa akcji zajęłaby więcej niż 40% wysokości ekranu (duży tekst od ok. AX3), przechodzi na koniec przewijanej treści, „Ułóż plan” pierwszy. Kolejność arkusza „Składniki”: „Ilości liczę od” → „Mąki (razem 100%)” (z gotową mieszanką) → informacja o soli i wariancie żytnim, gdy dotyczą → „Proporcje (procent mąki)” → „Zaczyn”.

Teksty nowe (PL / EN): „Receptury bazowe” / “Base Recipes” (zastępuje „Receptury mistrzowskie”); „Moje receptury” / “My Recipes” (zastępuje „Moje przepisy”); „{rodzaj}, poziom {trudność}” / “{type}, {level}” (np. „Na zakwasie, poziom łatwy” / “Sourdough, easy”); „Ilości liczę od” / “Calculate amounts from”, „bochenków” / “loaves”, „masy mąki” / “flour weight”; „Wstaw gotową mieszankę” / “Use a Flour Blend”; „Proporcje (procent mąki)” / “Proportions (% of flour)”; „Hydratacja zakwasu” / “Starter hydration”; „Zaczyn” / “Preferment”, „Rodzaj” / “Type”, „bez zaczynu” / “none”, „Zaczyn: {rodzaj}” / “Preferment: {type}”, „{rodzaj} (cały)” / “{type} (all of it)”; „Mąka w zaczynie” / “Flour in preferment”; „Razem {masa}” / “Total {weight}”; „O recepturze” / “About This Recipe”; „Brak receptur tego rodzaju.” / “No recipes of this type.” + „Pokaż wszystkie” / “Show All”.

Test akceptacyjny 106: (1) render zakładki Receptury: ekran główny ma `testID="recipe-list"` z grupą receptur bazowych (`recipe-row-{id}`, jeden na recepturę z `filterMasterRecipes`), filtr `category-filter-*` jak dziś i bez `start-bake-btn`; (2) dotknięcie `recipe-row-{id}` otwiera ekran receptury z tytułem = nazwa receptury; (3) na ekranie receptury `start-bake-btn` nie jest potomkiem `ScrollView` (strefa akcji przyklejona) przy tekście domyślnym, a Maestro e2e przy 390 × 844 pt: `assertVisible: "Ułóż plan"` bez `scroll` (krok roli 07); (4) na ekranie receptury brak `artisan-accordion-pro`, `CalculatorSacredCard`, `master-recipe-info-card` w pierwszym widoku i przełącznika trybu; „Do miski” to lista z `scale-item-*`; (5) arkusz `edit-ingredients-btn` zawiera w tej kolejności: wybór trybu (`calc-mode-loaves`, `calc-mode-flour`), mąki z `add-flour-btn` i `flour-blend-menu-btn`, pola `water-pct-input`, `starter-pct-input`, `starter-hydration-input` (tylko gdy zakwas > 0), `salt-pct-input`, `yeast-pct-input`, wiersz `preferment-type-btn`; (6) wybór zaczynu „poolish” zmienia „Do miski” na dwie grupy (`do-miski-zaczyn`, `do-miski-ciasto`); (7) arkusz temperatury wody nie ma steppera hydratacji; (8) wzorce `wzorce-zrzuty/kalkulator-lista-receptur-*`, `kalkulator-receptura-zaczyn-*`, `kalkulator-skladniki-pelne-*` oraz istniejące `kalkulator-receptura-*`.

### 113 · Nazwy według słownika: karta dokarmienia i jedno wejście importu (028, reszta)
**(a) Karta „Kalkulator dokarmiania”** (`src/components/zakwas/StarterFeedingCard.tsx`, tytuł karty): „Kalkulator” to nazwa miejsca, którego po D-051 (2a) nie ma. Nowy tytuł: **„Ilości do dokarmienia”** / **“Feeding Amounts”**; nazwa mówi, co karta daje (masy mąki, wody i zakwasu do dokarmienia), w słowach słownika („dokarmienie”, §5). Etykieta VoiceOver nagłówka = tytuł.

**(b) Import: jedno wejście.** Potwierdzam: w Ustawieniach (grupa „Twoje dane”, stan `ustawienia`) jest **jeden** wiersz „Importuj z pliku” / “Import from File” (`import-file-btn`) dla pliku receptury i pliku kopii zapasowej; znikają osobne wejścia „Importuj z pliku” w karcie kopii (`import-backup-btn`) i „Importuj recepturę” (`import-recipe-json-btn`, `ImportRecepturySection`). Przebieg: wiersz → systemowy wybór pliku (`.json`) → aplikacja rozpoznaje rodzaj po zawartości (`format: "piekarz-backup"` = kopia; poprawna receptura = receptura; inaczej błąd) → arkusz podglądu dla tego rodzaju (stany `import-receptura`, `import-kopia` w `ekrany/inne.html`). *Dlaczego jedno:* użytkownik ma plik, nie wie i nie musi wiedzieć, który z dwóch przycisków go przyjmie; jedna nazwa na akcję (089).

| Rodzaj pliku | Arkusz podglądu PL / EN | Przycisk | Wynik |
|---|---|---|---|
| receptura | tytuł „Receptura z pliku” / “Recipe from File”; wiersze: „Nazwa”, „Mąki” („pszenna 80%, żytnia 20%”), „Woda”, „Zakwas”, „Sól” (procenty); zdanie „Dodam ją do Moich receptur. Pozostałe dane zostaną bez zmian.” / “I'll add it to My Recipes. Your other data stays as it is.” | „Anuluj” (lewy górny) / „Dodaj” / “Add” (prawy górny) | receptura na liście „Moje receptury”; komunikat „Receptura „{nazwa}” jest w Moich recepturach.” / ““{name}” is now in My Recipes.” (zastępuje „Przepis „{name}” został pomyślnie dodany do Twojej bazy.”) |
| kopia zapasowa | tytuł „Kopia zapasowa z pliku” / “Backup from File”; zdanie „Kopia z {data}: {receptury}, {zakwasy}, {wpisy}.” / “Backup from {date}: {recipes}, {starters}, {entries}.”; informacja „Import zastąpi wszystkie dane w aplikacji danymi z kopii. Przed importem zapiszę kopię obecnych danych.” / “Importing replaces all data in the app with the data from the backup. Before importing, I'll save a copy of your current data.” | „Anuluj” / przycisk drugi „Zastąp dane” / “Replace Data” (tekst `blad`) | kopia przed importem (pula `piekarz-przed-importem-*`), dane z kopii; komunikat według §11c 116 |
| inny plik | „Tego pliku nie rozpoznaję. Piekarz importuje plik receptury i plik kopii zapasowej z Piekarza.” / “I don't recognize this file. Piekarz imports recipe files and backup files made in Piekarz.” | „Zamknij” / “Close” | bez zmian w danych |

Formy liczby w podglądzie kopii: PL `{n}` receptura (1), receptury (2–4, 22–24 …), receptur (0, 5–21, 25 …); zakwas / zakwasy / zakwasów; wpis / wpisy / wpisów w Dzienniku (reguła CLDR „one / few / many”); EN recipe / recipes, starter / starters, journal entry / journal entries (one / other). `{data}` w formacie regionu („18 października 2026” / “October 18, 2026”). Liczba i rzeczownik połączone spacją niełamiącą.

Wybór pliku wymaga systemowego okna plików; w `package.json` nie ma dziś `expo-document-picker` (jest `expo-file-system`, `expo-clipboard`). Zależność do zgody roli 05 i właściciela [DO USTALENIA]; do tego czasu ten sam arkusz importu przyjmuje treść pliku ze schowka (dzisiejsze zachowanie, „Wklej ze schowka”), a nazwa wiersza zostaje „Importuj z pliku”.

Test akceptacyjny 113: (1) w drzewie Ustawień dokładnie jeden element z tekstem „Importuj z pliku” i brak `import-backup-btn`, `import-recipe-json-btn` oraz tekstu „Importuj recepturę”; (2) treść z `format: "piekarz-backup"` otwiera podgląd kopii z liczbami z pliku i przyciskiem „Zastąp dane”; poprawna receptura — podgląd receptury z „Dodaj”; inna treść — komunikat „Tego pliku nie rozpoznaję…”; (3) test form liczby: 1 receptura, 3 receptury, 5 receptur, 22 receptury; 1 recipe, 3 recipes; (4) tytuł karty dokarmienia „Ilości do dokarmienia” / “Feeding Amounts”, w tekstach t() brak „Kalkulator dokarmiania”; (5) wzorce `wzorce-zrzuty/inne-import-receptura-*`, `inne-import-kopia-*`. W makietach EN nazwa ekranu planu to “Bake Plan” (było “Bake Schedule”), zgodnie z etykietą Spirali i 089; zrzuty `prowadzenie-*-en-US-imp-*` wygenerowane ponownie.

### 116 · Puste stany i teksty bez wykrzyknika, strzałki i „Uwaga…!” (034)
Zasada (§8): bez wykrzykników w tekstach interfejsu PL i EN; „Uwaga:” nie zastępuje tytułu, tytuł mówi, co się dzieje; znaki „✓”, „➔”, „→” nie są częścią tekstu (ikona, gdy potrzebna, to osobny symbol SF; „→” tylko w ujawnieniach oferty, §12a).

| Miejsce w kodzie | Dziś | PL | EN |
|---|---|---|---|
| pusty Dziennik (`src/components/stolnica/BakeHistorySection.tsx`, stan `dziennik-pusty`) | „Brak wcześniejszych wypieków” | tytuł (`tytul2`) „Tu zapiszą się twoje wypieki”; opis (`tresc`, `tusz2`) „Po każdym wypieku zapiszę recepturę, datę i twoją ocenę. Zacznij od receptury.”; przycisk drugi 48 pt „Wybierz recepturę” (`journal-empty-choose-recipe-btn`) → zakładka Receptury, lista receptur | “Your bakes will appear here”; “After each bake, I'll save the recipe, the date, and your rating. Start with a recipe.”; “Choose a Recipe” |
| tytuł kolizji ze snem (`src/components/harmonogram/SleepGuardBanner.tsx`) | „Uwaga: Kolizja ze snem!” | jeden krok: „{krok} wypada o {godzina} w nocy” (jak `plan-sen`, nazwa kroku wielką literą na początku); kilka: „{n} kroki wypadają w nocy” (2–4, 22–24 …) / „{n} kroków wypada w nocy” (5–21, 25 …) | one: “{Step} falls at {time} during the night”; other: “{n} steps fall during the night” |
| znacznik kroku na osi (`src/components/harmonogram/TimelineStagesList.tsx`) | „Kolizja nocna!” | „W nocy” + ikona księżyca (symbol SF `moon`), nie sam kolor | “At night” |
| przycisk w banerze kolizji | „Rozwiąż kolizję (lodówka: {n}h)” | „Przesuń do lodówki” (jak `plan-sen`, §6) | “Move to fridge” |
| spiżarnia (`src/components/FlourInventoryModal.tsx`, F-30 PÓŹNIEJ, tekst na powrót) | „✓ Wszystkie mąki są dostępne w spiżarni!” | „Wszystkie mąki z tej receptury są w spiżarni.” (ikona `checkmark` osobno) | “All flours for this recipe are in your pantry.” |
| import kopii (`src/components/settings/BackupAndDataSection.tsx`) | tytuł „Kopia zapasowa”, treść „Zaimportowano pomyślnie!” | tytuł „Zaimportowano”; treść „Dane z kopii są w aplikacji. Poprzednie dane zapisałem w kopii przed importem.”; z pominięciami: „Dane z kopii są w aplikacji. Pominięte uszkodzone wpisy: {n}. Poprzednie dane zapisałem w kopii przed importem.” | “Imported”; “The backup data is now in the app. I saved your previous data in a pre-import backup.”; “The backup data is now in the app. Damaged entries skipped: {n}. I saved your previous data in a pre-import backup.” |
| ocena miękiszu (`src/components/stolnica/FinishBakeModal.tsx`) | „Zbity, gęsty miękisz — rozważaj dłuższy bulk” / „Dzika, otwarta struktura rzemieślnicza!” / „Ładna równomierna alweolatura” | ≤ 2: „Zbity, gęsty miękisz.”; 3–4: „Równomierny miękisz.”; 5: „Bardzo otwarty miękisz.” (porada, co zmienić, należy do Doktora Chleba i roli 06, nie do podpisu oceny) | “Dense, tight crumb.”; “Even crumb.”; “Very open crumb.” |
| koniec kroku, ogłoszenie VoiceOver (`src/lib/timer-audio.ts`) | „Etap ukończony!: {nazwa}” / „Etap ukończony!” | „Koniec kroku: {nazwa}” / „Koniec kroku” | “Step finished: {name}” / “Step finished” |
| podsumowanie planu (`src/components/harmonogram/ScheduleSummaryCard.tsx`) | „Rozpoczęcie dokarmiania {godzina} ➔ 35.7h ➔ Gotowy do krojenia {godzina}” | bez strzałki: przy spirali planu dwie linie — „Start {dzień} o {godzina}” i „Całość trwa {czas}.” (godzina „gotowe” jest w polu „Kiedy chleb ma być gotowy?”) | “Start {day} at {time}”; “Takes {duration} in total.” |
| nazwa kroku studzenia (`src/scheduler/reverse-scheduler.ts`) | „Studzenie na kratce (nie krój gorącego!)” | „Studzenie na kratce”; zdanie o krojeniu przenosi do treści kroku rola 06 (bez wykrzyknika) | “Cooling on a rack” |

Format czasu trwania (plan, zakwas, kroki): PL i EN „{h} h {m} min” (np. „35 h 40 min”, “35 h 40 min”); poniżej godziny „{m} min”; pełne godziny „{h} h”; bez dni (plan liczony w godzinach); minuty zaokrąglone do pełnych; bez ułamków godzin („35.7h” znika); cała wartość połączona spacjami niełamiącymi (U+00A0), żeby nie łamała się w linii. Etykieta VoiceOver w pełnych słowach z formami liczby: PL „35 godzin 40 minut” (godzina / godziny / godzin, minuta / minuty / minut), EN “35 hours 40 minutes” (hour / hours, minute / minutes) — jak dziś w etykiecie spirali zakwasu. Skróty „h” i „min” to symbole jednostek, więc są te same w 35 językach, chyba że przekład 093 wskaże inaczej.

Test akceptacyjny 116: (1) w tekstach t() i literałach renderowanych w `app/`, `src/` (PL i `src/lib/i18n-en/`) brak „!” (regex `!\s*['"\`]` w wartościach tekstów; wyjątki nazwane w teście, np. operatory w kodzie), „➔”, „✓” i „Uwaga:”; (2) render Dziennika bez wypieków: tytuł, opis i `journal-empty-choose-recipe-btn` prowadzący do zakładki Receptury; (3) test funkcji formatu czasu: 35,67 h → „35 h 40 min”, 0,5 h → „30 min”, 4 h → „4 h”, etykieta „35 godzin 40 minut”, „1 godzina 1 minuta”, „2 godziny 22 minuty”, EN “1 hour 1 minute”; (4) baner kolizji z jedną i z trzema kolizjami: tytuły według tabeli; (5) wzorzec `wzorce-zrzuty/inne-dziennik-pusty-*`; linia „Całość trwa …” w `inne-plan-za-pozno-*`.

## 11d. Partia 8 (rola 04, tryb fix, 2026-10-21)

### 126 · Uprzedzenie przed końcem próby na „Dziś” (02-monetyzacja-502)
Podstawa: D-039 pkt 2 (uprzedzenie 3 dni przed końcem próby, raz), kontrakt płatności (`docs/monetyzacja.md`, PR-16 i „Uprzedzenie 3 dni”), wybór właściciela P-126 a z 2026-10-21: jednorazowy komunikat na „Dziś” przy pierwszym otwarciu w oknie 72 h przed końcem próby, nigdy w trakcie kroku, bez lokalnego powiadomienia. Makieta: `ekrany/start.html`, stany `uprzedzenie-proby`, `uprzedzenie-proby-trwa-wypiek`, `uprzedzenie-proby-nieznane`; stan `uprzedzenie-3-dni` w `ekrany/oferta.html` usunięty.

**Forma.** Ten sam baner co w stanie `tylko-historia` (`.baner` w `start.html`; w kodzie `styles.baner` na „Dziś”): tło `powierzchnia`, obwódka `obwodka` 1,5, promień grupy, tytuł `naglowek` krojem tytułów, treść `tresc` w `tusz`, dwa przyciski drugie 48 pt pełnej szerokości jeden pod drugim: „Zarządzaj subskrypcją” (`showManageSubscriptionsIOS`, `trial-notice-manage-btn`), „Zamknij” (`trial-notice-close-btn`, etykieta VoiceOver „Zamknij informację o końcu próby” / “Close trial end notice”). Bez okna nad ekranem, bez przyciemnienia, bez cienia, bez nowego koloru i komponentu (`testID` banera: `start-uprzedzenie-proby`). Tytuł ma `accessibilityRole="header"`. *Dlaczego baner, nie okno:* okno na starcie aplikacji to wzorzec zakazany dla oferty (BR-ZAK-003, „nigdy przy starcie”), a baner w treści informuje bez przerywania i nie zasłania powrotu do wypieku.

**Miejsce.** Bez trwającego wypieku: na górze treści „Dziś”, pod banerem ratunkowym (`CorruptStateRecoveryBanner`), nad listą czynności. Z trwającym wypiekiem: pod kartą „Trwa wypiek” i przyciskiem „Wróć do wypieku”, nad „Co jeszcze dziś robisz?” (F-58: powrót do wypieku zostaje w pierwszym widoku). Ekran prowadzenia (krok) nigdy nie pokazuje banera.

**Kiedy (raz).** Warunki: bieżąca transakcja subskrypcji jest w okresie próbnym (oferta wprowadzająca), znana jest data końca próby, do końca zostało ≤ 72 h i > 0, dla tej daty końca uprzedzenia jeszcze nie pokazano. Baner pojawia się przy pierwszym wyświetleniu „Dziś” po spełnieniu warunków (także gdy aplikację otwarto z powiadomienia prosto w krok: wtedy przy pierwszym przejściu na „Dziś”). Datę pokazania zapisuje kod w `app_settings` w chwili pierwszego wyświetlenia (kontrakt, aneks ADR-007). Baner znika po „Zamknij” albo gdy aplikacja przejdzie w tło; drugi raz dla tej samej daty końca się nie pokazuje. Gdy nie wiadomo, czy to okres próbny, albo nie ma daty końca: brak banera (nie twierdzimy niczego, czego nie wiemy). Brak lokalnego powiadomienia (P-126 a).

**Teksty** (klucze słownika `t()`; PL jest kluczem; EN dla `src/lib/i18n-en/`, przekład na 33 języki w zadaniu 093):

| Klucz PL (dokładnie) | EN | Kiedy | Parametry |
|---|---|---|---|
| `Okres próbny kończy się {data}` | `Your free trial ends on {date}` | tytuł, zawsze | `{data}`: dzień i miesiąc w formacie regionu (`Intl.DateTimeFormat`, `{ day: 'numeric', month: 'long' }`: „23 października”, “October 23”) |
| `Wtedy App Store pobierze {cena} za rok subskrypcji. Jeśli nie chcesz płacić, anuluj subskrypcję przed końcem próby.` | `Then the App Store will charge {price} for one year of your subscription. If you don't want to pay, cancel your subscription before the trial ends.` | odnawianie włączone, produkt roczny, cena znana | `{cena}`: `displayPrice` produktu ze sklepu, bez zmian (waluta i separatory sklepu) |
| `Wtedy App Store pobierze {cena} za miesiąc subskrypcji. Jeśli nie chcesz płacić, anuluj subskrypcję przed końcem próby.` | `Then the App Store will charge {price} for one month of your subscription. If you don't want to pay, cancel your subscription before the trial ends.` | odnawianie włączone, produkt miesięczny, cena znana | `{cena}` jw. |
| `Subskrypcja się nie odnowi, więc nic nie zapłacisz.` | `Your subscription won't renew, so you won't be charged.` | odnawianie wyłączone | — |
| `Jeśli subskrypcja nie jest anulowana, App Store pobierze wtedy opłatę za wybrany plan.` | `If your subscription isn't canceled, the App Store will then charge for the plan you chose.` | stan odnawiania nieznany albo cena lub okres nieznane (OP-M03, brak sieci, puste pola) | — |
| `Bez zakupu zostaną historia i twoje dane. Liczenie, plan i prowadzenie będą wymagać Piekarz Pro.` | `Without a purchase, your history and data stay. Calculations, plans, and guidance will require Baker Pro.` | po zdaniu o opłacie, gdy użytkownik nie ma planu dożywotniego | — |
| `Zamknij informację o końcu próby` | `Close trial end notice` | etykieta VoiceOver przycisku „Zamknij” | — |
| `Zarządzaj subskrypcją`, `Zamknij` (istniejące) | `Manage Subscription`, `Close` | przyciski | — |

Nowe klucze: 7 (w tym 1 etykieta VoiceOver). Okres jako dwa pełne zdania, nie parametr `{okres}`: *dlaczego:* „za rok / za miesiąc” wymaga w wielu językach innego przyimka, przypadku albo rodzaju (pl biernik, cs/sk/ru/uk przypadki, de/fr rodzajnik), więc parametr dałby błąd gramatyczny w części z 33 przekładów. Cena jako jeden parametr z `displayPrice`, nigdy liczba sklejona z walutą w kodzie. Data tylko w tytule; zdania mówią „wtedy”, żeby nie powtarzać daty i nie mnożyć parametrów.

| Odnawianie | Cena i okres | Plan dożywotni | Treść pod tytułem |
|---|---|---|---|
| włączone | znane | nie | zdanie roczne albo miesięczne + „Bez zakupu zostaną…” |
| włączone | znane | tak | tylko zdanie roczne albo miesięczne (próba subskrypcji nadal pobierze opłatę; ujawnienie U4) |
| wyłączone | — | nie | „Subskrypcja się nie odnowi…” + „Bez zakupu zostaną…” |
| wyłączone | — | tak | brak banera (nic się nie zmienia) |
| nieznane albo brak ceny lub okresu | — | nie | „Jeśli subskrypcja nie jest anulowana…” + „Bez zakupu zostaną…” |
| nieznane albo brak ceny lub okresu | — | tak | tylko „Jeśli subskrypcja nie jest anulowana…” |

**Tytuł z datą zamiast „Za 3 dni…”:** baner pojawia się przy pierwszym otwarciu w oknie 72 h, więc do końca może zostać np. 30 h; data jest prawdziwa w każdym przypadku i nie jest odliczaniem (zakazany wzorzec kontraktu).

**Przypomnienia o dokarmianiu (H-04, BR-ZAK-004) — wyjątek nazwany, warunkowy.** Zdanie „Przypomnienia o dokarmianiu zakwasu ustaną.” (EN “Starter feeding reminders will stop.”) wraca jako osobny klucz po „Bez zakupu zostaną…” dopiero razem z zadaniem M1-audytor-generalny-143 (wyłączenie przypomnień po końcu próby, partia 10), w tych samych wierszach tabeli co „Bez zakupu zostaną…”. Do tego czasu go nie ma. *Dlaczego:* dziś kod nie wyłącza przypomnień po próbie, a komunikat nie może obiecywać zachowania, którego aplikacja nie ma; brak zdania jest mniejszą szkodą niż nieprawda.

Test akceptacyjny 126: (1) render „Dziś” z próbą rocznym planem kończącą się za 30 h, odnawianiem włączonym i ceną „29,99 zł”: `start-uprzedzenie-proby` z tytułem „Okres próbny kończy się {data}” wypełnionym datą końca, zdaniem rocznym z „29,99 zł” i zdaniem „Bez zakupu zostaną…”; brak tekstu „Za 3 dni” i „Przypomnienia o dokarmianiu zakwasu ustaną.”; (2) każdy wiersz tabeli wariantów jako osobny przypadek (miesięczny, wyłączone, nieznane, dożywotni + próba, dożywotni + wyłączone = brak banera); (3) do końca 73 h albo próba już zakończona albo brak daty końca albo brak informacji o okresie próbnym: brak banera; (4) po pierwszym renderze w `app_settings` jest data pokazania; drugi render po ponownym uruchomieniu: brak banera; „Zamknij” ukrywa baner od razu; (5) z trwającym wypiekiem baner jest w drzewie po `resume-bake-btn` („Wróć do wypieku”); ekran prowadzenia nie renderuje banera; (6) brak `Modal` i brak zaplanowanego powiadomienia lokalnego dla uprzedzenia; (7) przyciski `trial-notice-manage-btn` (wywołuje `showManageSubscriptionsIOS`) i `trial-notice-close-btn` z `minHeight` ≥ 48 i etykietą „Zamknij informację o końcu próby”; (8) wzorzec `wzorce-zrzuty/start-uprzedzenie-proby*`.

## 11e. Partia 9, tor p9c (rola 04, tryb fix, 2026-10-21)

### 127 · Ekran zakupu „Piekarz Pro” w nowej szacie (04-studio-projektowe-502, 02-monetyzacja-506)
Podstawa: DEC-17 a (D-063): nazwa „Piekarz Pro” i ujawnienia z kontraktu płatności (`docs/monetyzacja.md`, „Kontrakt płatności”, U1–U8) w układzie `ekrany/oferta.html`; plakietka „APPS4CRAFT PASS” (DEC-002 pkt 2) uchylona. Apple (odczyt 2026-10-21): ekran zapisu ma nazwę i okres subskrypcji, pełną cenę odnowienia wyraźnie, sposób przywrócenia, linki do Warunków i Polityki; kwota do pobrania jest największym elementem cenowym; przy próbie długość próby i cena po próbie (developer.apple.com/app-store/subscriptions). Anulowanie: „In Settings, tap your name. Tap Subscriptions.” i próbę „cancel it at least 24 hours before the trial ends” (support.apple.com/118428, PL: „W Ustawieniach stuknij swoje imię i nazwisko. Stuknij pozycję Subskrypcje.”, odczyt 2026-10-21).

**Stany** (jeden komponent ekranu zakupu, `PaywallModal`; ekran widzi tylko osoba bez dostępu, bo po nadaniu dostępu zamyka się sam, `src/lib/app-access.ts`):

| Stan | Kiedy | Treść od góry |
|---|---|---|
| `oferta-proba` | odczyt sklepu udany i co najmniej jedna subskrypcja ma `probaDni` > 0 | „Zamknij” · tytuł · „Okres próbny: {dni}” · opis · 3 opcje planu · ujawnienia U2, U3, U5, U7, U8 · przycisk główny · linki |
| `zakup-bez-proby` | odczyt udany, żadna subskrypcja nie ma `probaDni` | „Zamknij” · tytuł · opis · 3 opcje planu · ujawnienia U2 krótkie, U8 · przycisk główny · linki |
| `bez-sieci` | `pobierzOferte()` rzuciło błąd albo zwróciło pustą listę | „Zamknij” · tytuł · komunikat błędu (ikona + tekst, `role=alert`) · „Spróbuj ponownie” (ponowny odczyt oferty) |
| ładowanie | przed pierwszą odpowiedzią `pobierzOferte()` | układ stanu `zakup-bez-proby` bez kwot (pusta linia ceny o tej samej wysokości), przycisk główny nieaktywny; nigdy „—” |

Opcja planu, której sklep nie zwrócił, nie jest rysowana. Przy dożywotnim w stanie `oferta-proba` przycisk główny to „Kup dostęp dożywotni”; przy subskrypcji bez `probaDni` (np. tylko jedna z dwóch ma ofertę) — „Kup plan …” i cena bez „po próbie”.

**Układ (system, bez nowych kolorów i komponentów):** „Zamknij” to `CloseButton akcja="zamknij"` (tekst w nagłówku, prawy górny róg, `close-modal`). Tytuł `typografia.duzy` krojem tytułów; „Okres próbny: {dni}” `naglowek`; opis `tresc`. Opcja planu = komponent **Opcja planu** (§4): obwódka `obwodka` 1,5, wybrana `akcent` 3, znacznik wyboru kształtem (koło puste / koło z grubą obwódką `akcent`), nazwa `naglowek`, cena krojem tytułów 22 pt pogrubiona (największy element cenowy), opis `przypis` w `tusz2`; cel ≥ 64 pt; VoiceOver: `accessibilityRole="radio"`, `accessibilityState={{ checked }}`, etykieta = teksty widoczne w kolejności (nazwa, cena, opis), grupa `radiogroup`. Ujawnienia: lista z kropką `tusz2`, `obj`. Przycisk główny: przycisk kciuka 64 pt, `akcent` + `naAkcencie`; w trakcie zakupu nieaktywny z `accessibilityState={{ busy: true }}`, etykieta bez zmiany. Linki: `akcentTekst`, cel 44 pt, zawijane w wierszu. Bez plakietki, bez kart z cieniem, bez wersalików, bez kropki środkowej, bez „/ rok” i bez przeliczenia na miesiąc. Wzorzec: `ekrany/oferta.html`, zrzuty 320/390 pt w `wzorce-zrzuty/oferta-*` (do odświeżenia narzędziem `narzedzia/zrzuty.mjs`).

**Teksty** (klucze `t()`; PL jest kluczem; EN do `src/lib/i18n-en/`; parametry mają te same nazwy w PL i EN):

| Klucz PL (dokładnie) | EN | Stan i miejsce | Parametry | Nowy / istniejący |
|---|---|---|---|---|
| `Piekarz Pro` | `Baker Pro` | tytuł, wszystkie stany | — | nowy |
| `Okres próbny: {dni}` | `Free trial: {dni}` | `oferta-proba`, pod tytułem | `{dni}`: `tPlural(probaDni, { one: '{n} dzień', few: '{n} dni', many: '{n} dni', other: '{n} dnia' })` (formy istniejące, jak w `StarterProfileCard`) | nowy |
| `Liczenie receptur, plan wypieku, prowadzenie z powiadomieniami, zakwasy i dziennik. Bez reklam, bez konta.` | `Recipe calculations, bake plans, step-by-step guidance with notifications, starters, and a journal. No ads, no account.` | opis, `oferta-proba` i `zakup-bez-proby` | — | nowy |
| `Roczny` / `Miesięczny` | `Yearly` / `Monthly` | nazwy opcji | — | istniejące |
| `Dożywotni` | `Lifetime` | nazwa opcji | — | nowy (zastępuje `Dożywotni (Lifetime)`) |
| `{cena} rocznie po próbie` | `{cena} per year after the trial` | cena, `oferta-proba` | `{cena}`: `displayPrice` bez zmian | nowy |
| `{cena} miesięcznie po próbie` | `{cena} per month after the trial` | cena, `oferta-proba` | `{cena}` | nowy |
| `{cena} rocznie` | `{cena} per year` | cena, `zakup-bez-proby` | `{cena}` | nowy |
| `{cena} miesięcznie` | `{cena} per month` | cena, `zakup-bez-proby` | `{cena}` | nowy |
| `{cena} jednorazowo` | `{cena} one-time` | cena dożywotniego, oba stany | `{cena}` | nowy |
| `Jedna opłata. Ten plan nie potrzebuje próby; jeśli masz zaczętą próbę subskrypcji, anuluj ją, żeby za nią nie płacić.` | `One payment. This plan doesn't need a trial; if you've started a subscription trial, cancel it so you aren't charged.` | opis dożywotniego, `oferta-proba` (U4) | — | nowy |
| `Subskrypcja odnawia się sama. Żeby nie płacić, anuluj ją najpóźniej 24 godziny przed końcem próby: w Ustawieniach stuknij swoje imię i nazwisko, potem Subskrypcje.` | `The subscription renews automatically. To avoid being charged, cancel it at least 24 hours before the trial ends: in Settings, tap your name, then Subscriptions.` | U2, `oferta-proba` | — | nowy |
| `Subskrypcja odnawia się sama, dopóki jej nie anulujesz: w Ustawieniach stuknij swoje imię i nazwisko, potem Subskrypcje.` | `The subscription renews automatically until you cancel it: in Settings, tap your name, then Subscriptions.` | U2, `zakup-bez-proby` | — | nowy |
| `Bez zakupu zostaną historia i twoje dane. Liczenie, plan i prowadzenie będą wymagać Piekarz Pro.` | (istniejące) `Without a purchase, your history and data stay. Calculations, plans, and guidance will require Baker Pro.` | U3, `oferta-proba` | — | istniejący (§11d 126) |
| `Próba jest jedna na oba plany subskrypcji.` | `There is one trial for both subscription plans.` | U5, `oferta-proba` | — | nowy |
| `Założenie zakwasu wymaga kilku dni regularnego dokarmiania; średnio trwa 7–10 dni.` | (istniejące) `Creating a starter takes several days of regular feeding; on average it takes 7–10 days.` | U7, `oferta-proba` | — | istniejący (rejestr `ZAK-ZAL-001`, RD-24, S-44) |
| `Zakup wymaga połączenia z App Store.` | `Purchasing requires a connection to the App Store.` | U8, `oferta-proba` i `zakup-bez-proby` | — | nowy |
| `Zacznij okres próbny` | `Start Free Trial` | przycisk główny, subskrypcja z próbą | — | nowy |
| `Kup plan roczny` / `Kup plan miesięczny` | `Buy Yearly Plan` / `Buy Monthly Plan` | przycisk główny, subskrypcja bez próby | — | nowe (2) |
| `Kup dostęp dożywotni` | `Buy Lifetime Access` (zmiana wartości EN z „Buy lifetime access”) | przycisk główny, dożywotni | — | istniejący |
| `Przywróć zakupy`, `Polityka prywatności`, `Zamknij`, `Spróbuj ponownie`, `Zakup` | `Restore Purchases`, `Privacy Policy`, `Close`, `Try Again`, `Purchase` | linki, nagłówek, `bez-sieci`, tytuł okna błędu | — | istniejące |
| `Warunki użytkowania` | `Terms of Use` | link do EULA Apple | — | nowy (zastępuje `Warunki użytkowania (EULA)` na ekranie zakupu) |
| `Nie ma połączenia z App Store, więc zakup i przywrócenie zakupów teraz się nie udadzą. Reszta aplikacji działa jak dotąd. Sprawdź internet i spróbuj ponownie.` | `There's no connection to the App Store, so purchasing and restoring purchases won't work right now. The rest of the app works as usual. Check your internet connection and try again.` | `bez-sieci`, komunikat | — | nowy |
| `Nie udało się dokończyć zakupu. Zakup wymaga połączenia z App Store: sprawdź internet i spróbuj ponownie.` | `The purchase couldn't be completed. Purchasing requires a connection to the App Store: check your internet connection and try again.` | okno błędu zakupu (tytuł `Zakup`) | — | nowy (zastępuje `Nie udało się dokończyć zakupu. Spróbuj ponownie.`) |
| `Nie udało się połączyć z App Store. Spróbuj ponownie.` | (istniejące) | okno błędu przywracania (`przywroc-zakupy.ts`) | — | istniejący |

Nowe klucze: 20. Znikają z ekranu zakupu (usunąć ze słowników, jeśli `git grep` nie znajdzie innego użycia): literał „APPS4CRAFT PASS”, `Odblokuj pełny dostęp` (zostaje w `BlokadaFunkcji`), `Odblokuj wszystkie funkcje aplikacji…`, `Twoja historia jest bezpieczna`, `Nawet bez zakupu… (tryb Read-Only).`, trzy „filary” (`Bez chmury…`, `Zero reklam…`, `Wszystkie zaawansowane narzędzia…`), `Dożywotni (Lifetime)`, `12 miesięcy`, `1 miesiąc`, `Odnawia się automatycznie co rok`, `… co miesiąc`, `rok`, `miesiąc`, `jednorazowo`, `Jednorazowy zakup na zawsze • Wszystkie aktualizacje`, `Pierwsze {dni} dni bezpłatnie, potem {cena}`, `Wypróbuj {dni} dni`, `Aktywuj plan roczny`, `Aktywuj plan miesięczny`, `Subskrypcja odnawia się automatycznie za cenę podaną przy planie…`, `Dostęp dożywotni to jednorazowy zakup bez odnawiania.`, `Przeglądaj historię (Read-Only)`, `Nie udało się dokończyć zakupu. Spróbuj ponownie.`, `Przetwarzanie...` (zostaje w Ustawieniach), `Zarządzaj subskrypcją` (zostaje w Ustawieniach i banerze §11d).

*Dlaczego tak:* (1) kwoty i dni tylko jako parametry, okres w kluczu (rocznie, miesięcznie), bo okres jako parametr daje błędy przypadku i rodzaju w części z 33 języków (jak w §11d 126); (2) liczba dni stoi sama po dwukropku i przez `tPlural`, więc nie wymaga odmiany przez przyimek („przez 14 dni”, ros. „в течение 14 дней”) ani nowych form liczby mnogiej; (3) bez przeliczenia „to około … miesięcznie”: kod ma tylko `displayPrice` (tekst), dzielenie sformatowanej kwoty w 175 walutach to ryzyko błędnej ceny, a Apple przeliczenie dopuszcza („you may also present a breakdown price”), nie wymaga; (4) bez „Zarządzaj subskrypcją”: ekranu nie widzi osoba z dostępem, a dla niej zarządzanie jest w Ustawieniach (`ZakupySection`) i w banerze końca próby (MS-17 spełnione poza ekranem zakupu); (5) „24 godziny” zamiast „dzień przed” i ścieżka „stuknij swoje imię i nazwisko, potem Subskrypcje” zamiast „Apple ID →” — brzmienie Apple z dnia odczytu (nazwy „Apple ID” Ustawienia już nie pokazują), bez strzałki w tekście; (6) U7 bez dopowiedzenia „więc zmieści się w próbie”: wniosek z pary zdań nie jest w rejestrze, a długość próby stoi wyżej.

Słownik akcji (§5) po zmianie: „Zacznij okres próbny / Kup plan roczny / Kup plan miesięczny / Kup dostęp dożywotni / Przywróć zakupy”; „Zarządzaj subskrypcją” w Ustawieniach i banerze końca próby.

**testID:** zostają `plan-yearly-btn`, `plan-monthly-btn`, `plan-lifetime-btn`, `subscribe-submit-btn`, `restore-purchases-btn`, `terms-of-use-btn`, `privacy-policy-btn`, `subscription-terms` (lista ujawnień), `close-modal`; nowe `offer-trial-length` („Okres próbny: {dni}”), `offer-no-connection` (komunikat `bez-sieci`), `offer-retry-btn` („Spróbuj ponownie”); znikają `manage-subscriptions-btn`, `read-only-continue-btn`.

Test akceptacyjny 127: (1) render trzech stanów (oferta z `probaDni: 14` dla obu subskrypcji, oferta bez `probaDni`, `pobierzOferte` odrzucone) — każdy `Text` pochodzi z `t()` (brak „APPS4CRAFT”, brak tekstu, który po usunięciu cyfr i znaków jest w całości wersalikami, brak nawiasu z łacińskim słowem, brak „•” i „·”); (2) `oferta-proba`: tekst „Okres próbny: 14 dni”, ceny „{displayPrice} rocznie po próbie” i „… miesięcznie po próbie”, „{displayPrice} jednorazowo”, opis U4, U2, U3, U5, U7, U8, przycisk „Zacznij okres próbny”, po wyborze dożywotniego „Kup dostęp dożywotni”; (3) `zakup-bez-proby`: „Kup plan roczny”, po wyborze miesięcznego „Kup plan miesięczny”, ceny bez „po próbie”, U2 krótkie i U8; (4) `bez-sieci`: komunikat `offer-no-connection`, brak opcji planu i kwot, brak „—”, `offer-retry-btn` wywołuje ponownie `pobierzOferte`; przed odpowiedzią przycisk główny nieaktywny i brak „—”; (5) błąd `onSubscribe`: okno „Zakup” z tekstem „Nie udało się dokończyć zakupu. Zakup wymaga połączenia z App Store: sprawdź internet i spróbuj ponownie.”; (6) EN: „Baker Pro”, „Free trial: 14 days”, „Start Free Trial”, „Terms of Use”; (7) brak `manage-subscriptions-btn` i `read-only-continue-btn`; opcje planu z `accessibilityRole="radio"` i `checked`; (8) zrzut aplikacji przy 320 i 390 pt zgodny z `ekrany/oferta.html` (kolejność sekcji, cena największa w opcji, „Zamknij” w prawym górnym rogu).

## 12. Wybory z kalibracji i domyślne (090) — każdy z decyzją
| Wybór | Decyzja |
|---|---|
| jasny + ciemny według systemu | D-045 |
| własne tokeny, nie rodziny | D-046 |
| kierunek, paleta, element | D-049 |
| krój tytułów | D-050 |
| oferta przy pierwszej akcji | D-047 |
| przypomnienie na blacie co 12 h | D-043 (OP-38) |
| prośba o ocenę od 4★ | D-042 |
| jednostki według regionu | D-044 |
| 4 zakładki, ustawienia z „Dziś” | D-051 (2a) |
| rutynowe usunięcie z „Cofnij” | D-051 (1a) |
| jeden wybór jednostek zamiast dwóch przełączników | D-051 (3a); zmiana kryterium F-38 u roli 03 |
| akcent „noc” na przycisku głównym i w spirali | D-051 (4a) |
| cele 64 / 48 / 44 pt | DEC-15 (a) planu napraw M1, `tokeny.json` → `cele` |
| oferta przy pierwszej akcji, „Zamknij” zawsze widoczne | D-047, kontrakt płatności (`docs/monetyzacja.md`) |
| brak przełącznika motywu w aplikacji | D-045 |
| dźwięk w aplikacji | brak w 1.0 (§9: „gdy dźwięk powstanie”); domyślny stan przełącznika wymaga decyzji właściciela przed dodaniem dźwięku |
| haptyka | według ustawienia systemu „Haptyka systemowa” (zachowanie platformy, HIG Playing haptics), nie wybór produktowy |

### 12a. Kalibracja domyślnych wyborów (wzorce studia) — wiersz po wierszu (090, 2026-10-20)
Stan w systemie z `docs/design/`; w kodzie wybory z kalibracji znikają z wdrożeniem 050/056/057 (mapa: `mapa-rol.md`).

| Wybór z kalibracji | W systemie | Decyzja albo dowód braku |
|---|---|---|
| fiolet, indygo, gradienty, rozmyte plamy, szkło | brak (tokeny bez gradientu i rozmycia) | D-049; test: grep `LinearGradient\|BlurView\|expo-blur` w `app/`, `src/` = 0 |
| kremowe tło + kontrastowy szeryf + terakota | brak: tło neutralne `#F5F5F2`, krój bezszeryfowy, akcent noc `#1E4954`, ratan tylko na zwojach | D-049 (test generyczności `02-kierunki.md`, wiersz A paleta), D-050 |
| prawie czarne tło z jednym kwasowym akcentem | brak: ciemny `#141A1C` zabarwiony nocą, akcent `#8FB9C4` | D-045, D-049 |
| przyciemniona czerń zamiast czerni bez powodu | ciemne tło to „noc ciemna” z palety kierunku; czerń `#000000` w wariancie „Zwiększ kontrast” | D-049 |
| układ gazetowy (cienkie linie, zero zaokrągleń) | brak: listy grupowane iOS, promienie 6–18 według hierarchii | `tokeny.json` → `promienie`, D-049 |
| zestaw kart SaaS (ten sam promień i cień wszędzie) | brak: bez cieni (`mapa-rol.md` §1, zasada 4); `CraftCard` usunięty; dawny wyjątek (uprzedzenie 3 dni jako karta z cieniem alertu) usunięty 2026-10-21: uprzedzenie to baner „Dziś” bez cienia (§11d 126) | D-046, D-049 |
| bohater „duża liczba + mała etykieta + statystyki + gradient” | jedna duża liczba tylko w prowadzeniu: czas kroku z podpisem „do {godzina}, potem …”, bez statystyk i gradientu; karty liczb (`CraftStatDisplay`) usunięte | DEC-09 (a) (widok skupiony: krok, zegar, jedna akcja), SP-17; §11b 056 |
| WERSALIKI z rozstrzeleniem, „A · B”, „SŁOWO — fragment”, „→” na przyciskach, mono na etykietach | brak; plakietka „APPS4CRAFT PASS” i „•” z oferty usunięte, ścieżka w Ustawieniach słowami („stuknij swoje imię i nazwisko, potem Subskrypcje”, §11e 127) | `02-kierunki.md` (wiersz A, B, C); test: grep `textTransform: 'uppercase'`, `letterSpacing`, ` · ` w `app/`, `src/` = 0; od 2026-10-21 także wersaliki wpisane literami, „A • B” i „→” w tekstach na ekranie oraz krój mono (wyjątek nazwany: pole wklejania kodu w `ImportRecipeModal`, dane, nie etykieta); martwe klucze starego ekranu zakupu usunięte ze słowników (203). Poza testem: etykieta PDF w `pdf-sheet-generator.ts` (F-50, wejście wyłączone w 1.0) — do poprawy przy włączeniu druku |
| wyróżnienie jednego słowa kolorem lub kursywą | brak | — (brak w makietach) |
| numeracja 01 / 02 / 03 bez sekwencji | brak; „Krok 4 z 13”, „Składanie 2 z 4”, „Dzień 3” to prawdziwe sekwencje | BR-ETAP-001, F-60 |
| Inter, Roboto, Space Grotesk | brak: Sofia Sans Semi Condensed (tytuły), treść systemowa | D-050 |
| „fade + slide up” każdej sekcji | brak: ruch tylko zwoju po „Zrobione” i paska „Cofnij” | `tokeny.json` → `ruch`, §9 |
| emoji, postaci 3D, stockowe ilustracje | brak; ikony to symbole SF | 088, §4 |
| kopie wyborów innej aplikacji portfolio | brak: porównanie z Treningiem, Organizerem, NaviStories w §13 | D-049, §13 |

Test akceptacyjny 090: każdy wiersz §12 i §12a ma ID decyzji albo dowód braku; po wdrożeniu partii 5 testy grep z tabeli zwracają 0, a OP-38 (12 h, D-043), OP-49 (≥ 4★, D-042) i jednostki według regionu (D-044) mają testy jednostkowe wartości domyślnych (12 h odstępu przypomnienia na blacie; prośba o ocenę tylko przy ocenie ≥ 4; region `US` → `imp`, inne → `met`).

## 13. Propozycja wpisu do pamięci portfolio
Repo `prompts`, `role/04-studio-projektowe/moduly/pamiec-portfolio.md`; wpis dopisuje właściciel.

| Aplikacja | Metafora / element firmowy | Paleta (rdzeń) | Kroje | Uwagi właściciela |
|---|---|---|---|---|
| Piekarz („Koszyk spiralny”) | Koszyk do garowania zwijany spiralnie: **spirala planu** — zwoje od startu (środek) do godziny „gotowe” (kropka), długość łuku według czasu kroku, zrobione grube, przyszłe cienkie, noc w lodówce kropkami; jeden cykl dokarmienia zakwasu jako krótka spirala; ikona: spirala z przerwami na nocy | płótno `#F5F5F2`, żeliwo `#1C1D1B`, ratan `#9C6B2F` (tylko dane), ratan szary `#8A8273`, noc `#1E4954` (akcent), noc ciemna `#141A1C`; ostrzeżenie `#F7D117` z czarnym (logika ISO 7010) | Sofia Sans Semi Condensed (tytuły, czasy, ceny), treść systemowa | 2026-10-20: „idziemy w koszyk spiralny”; krój wybrany z 5 (`kroje.png`); odrzucone: słoik z gumką (może wrócić w karcie zakwasu), taśma z etykietą. Ratan nigdy jako tło — para krem + brąz to klisza kategorii. Spirala i para ratan + noc należą do Piekarza. |

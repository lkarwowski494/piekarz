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
- Kontrast: `kontrast.md` — 20 par × 4 warianty, wszystkie spełniają progi (tekst 4,5, grafika z danymi i obwódki 3; WCAG 2.2, 1.4.3 i 1.4.11).
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
| Ułóż plan / Zacznij wypiek | receptura / plan | plan wstecz / start z prośbą o zgodę (jedno zdanie wcześniej, BR-CZAS-003) |
| Zapisz jako moją, Temperatura wody, Zmień składniki | receptura | razem z „Ułóż plan” najwyżej 4 akcje (057) |
| Zapisz dokarmienie, Podwoił objętość, Coś mnie niepokoi, Edytuj | zakwas | wpis; „gotowy” z atrybucją; objawy; poprawa wpisu (F-62) |
| Zapisz / Anuluj / Zamknij | arkusze, oferta | jak w słowniku studia; oferta ma zawsze widoczne „Zamknij” |
| Zacznij 14 dni próby / Kup plan … / Przywróć zakupy / Zarządzaj subskrypcją | oferta, ustawienia | StoreKit; bez sieci komunikat i „Spróbuj ponownie” |
| Usuń wszystkie dane | ustawienia | potwierdzenie: „Usunąć wszystkie dane?” [Anuluj] [Usuń wszystko] (kolor błędu tylko na przycisku destrukcyjnym) |
| Oceń w App Store, Napisz do nas | ustawienia | strona aplikacji z formularzem recenzji; Poczta z podglądem treści (BR-OPIN-002, -003) |
Etykiety VoiceOver: „akcja + obiekt” (np. „Mniej bochenków”, „Zrobione: składanie 2 z 4”). Rutynowe usunięcie (wpis zakwasu, receptura własna): bez pytania, z paskiem „Cofnij” przez kilka sekund; potwierdzenie tylko dla „Usuń wszystkie dane” i zakwasu z historią (D-051, 1a).

## 6. Macierz stanów (makiety)
| Ekran | Stany w `ekrany/` |
|---|---|
| Start (F-68) | `pierwsze-uruchomienie` (bez danych zmyślonych, 087), `trwa-wypiek` (powrót jednym dotknięciem), `tylko-historia` (F-67, kłódka + tekst) |
| Prowadzenie (F-07, F-57, F-16, F-18, F-58) | `w-trakcie`, `koniec-kroku` (ostrzeżenie RD-23, „po czasie”), `brak-zgody` (stała informacja + Ustawienia), `zgoda` (zdanie przed prośbą), `po-cofnieciu` |
| Receptura (F-09, F-10, F-11, F-56) | `receptura` (≤ 4 akcje), `mieszanka-i-sol` (wariant żytni, informacja o soli bez blokady), `temperatura-wody` |
| Zakwas (F-22…F-25, F-60, F-62, F-64) | `karta` (cykl, „Podwoił objętość”), `zakladanie-dzien-3` (dzień N, 7–10 dni), `plesn` (RD-21, polecenie zamiast listy) |
| Oferta i zakup (F-35, F-37, F-67) | `oferta-proba` (3 opcje, ujawnienia U1–U8), `zakup-bez-proby`, `uprzedzenie-3-dni`, `bez-sieci` |
| Inne | `plan-sen` (zakres 20–26 °C / 68–79 °F, kolizja ze snem i propozycja), `ocena-slaba` (Doktor ≤ 2★; przy ≥ 4★ tylko prośba systemowa, bez własnego okna), `ustawienia` (jednostki, dane, Pro, kontakt, polityka) |
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
| 056 widok skupiony i pasek kciuka | ekran prowadzenia |
| 057 ≤ 4 akcje | receptura: Ułóż plan, Zapisz jako moją, Temperatura wody, Zmień składniki |
| 058 element firmowy | spirala koszyka, rozdział 2 |
| 087 dane zmyślone | start bez danych; przykłady oznaczone ramką „przykład” |
| 088 emoji, teksty techniczne | ikony symboli, brak kodów w tekstach |
| 089 jedna nazwa na akcję | rozdział 5 |
| 090 wybory domyślne z decyzją | rozdział 12 |
| 096 miary USA | rozdział 7 i zrzuty en-US |
| 097–099 PÓŹNIEJ/NIE bez wejść | brak spiżarni, przelicznika objętości i lodu w makietach |
| 100 „po co ten krok” | przycisk w pasku kciuka; Akademia bez osobnego wejścia |
| 101 start „co dziś robisz” | ekran startu |
| 102 wcześniej i cofnięcie | „Zrobione” przed terminem, „Cofnij poprzedni” + pasek „Przywróć” |
| 103 ostrzeżenia w krokach | komponent Ostrzeżenie (koniec-kroku); krok nieznanego rodzaju: ostrzeżenie ogólne „Uważaj na gorące naczynia i surowe ciasto” [treść roli 06] |
| 104 zakwas od zera, z lodówki, poprawa, Doktor zakwasu | zakwas: dzień N, plan budzi z lodówki (dokarmienia w planie), „Edytuj” przy wpisie, „Coś mnie niepokoi” |

## 11a. Zrzuty wzorcowe (linia bazowa audytu SP-13)
`wzorce-zrzuty/` (150 plików, skala 1×, nazwy `<ekran>-<stan>-<wariant>-<szerokość>-<motyw>[-ax5].png`), generowane `narzedzia/zrzuty.mjs` z `ekrany/*.html`:
- **pl**: 7 stanów kluczowych (start ×2, prowadzenie ×2, receptura, zakwas, oferta) × 320/390/430 × jasny/ciemny × domyślny/AX5 = 84; **pl-kontrast**: prowadzenie ×2 × 390 × jasny/ciemny („Zwiększ kontrast”) = 4;
- **en-US-imp** (miary USA): prowadzenie ×2, receptura, temperatura wody, zakwas, plan, ustawienia, start, oferta (9 stanów) × 390 jasny/ciemny + 320 jasny AX5 = 27;
- **fr** (najdłuższy język, `pomiar-jezykow.md`): 7 stanów × 320/390 jasny × domyślny/AX5 + 430 ciemny = 35 (razem 150);
- przegląd wszystkich 21 stanów przy 390 pt: `e3-przeglad.png`.
Ograniczenia nazwane: makieta w Chromium, nie na iOS (krój treści zastępczy Noto Sans, symbole zastępcze); AX5 przy 320 pt dzieli długie słowa (fr z dzieleniem, pl bez słownika dzielenia w Chromium) — nic nie jest ucięte; na urządzeniu sprawdza rola 07/właściciel.

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

## 13. Propozycja wpisu do pamięci portfolio
Repo `prompts`, `role/04-studio-projektowe/moduly/pamiec-portfolio.md`; wpis dopisuje właściciel.

| Aplikacja | Metafora / element firmowy | Paleta (rdzeń) | Kroje | Uwagi właściciela |
|---|---|---|---|---|
| Piekarz („Koszyk spiralny”) | Koszyk do garowania zwijany spiralnie: **spirala planu** — zwoje od startu (środek) do godziny „gotowe” (kropka), długość łuku według czasu kroku, zrobione grube, przyszłe cienkie, noc w lodówce kropkami; jeden cykl dokarmienia zakwasu jako krótka spirala; ikona: spirala z przerwami na nocy | płótno `#F5F5F2`, żeliwo `#1C1D1B`, ratan `#9C6B2F` (tylko dane), ratan szary `#8A8273`, noc `#1E4954` (akcent), noc ciemna `#141A1C`; ostrzeżenie `#F7D117` z czarnym (logika ISO 7010) | Sofia Sans Semi Condensed (tytuły, czasy, ceny), treść systemowa | 2026-10-20: „idziemy w koszyk spiralny”; krój wybrany z 5 (`kroje.png`); odrzucone: słoik z gumką (może wrócić w karcie zakwasu), taśma z etykietą. Ratan nigdy jako tło — para krem + brąz to klisza kategorii. Spirala i para ratan + noc należą do Piekarza. |

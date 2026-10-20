# Mapa ról kolorów i komponentów: kod → system „Koszyk spiralny”

Rola 04, tryb fix, 2026-10-20 · dla zadania M1-audytor-generalny-050 (04-studio-projektowe-002, -003, -016) i D-046. Wdraża rola 08 (M2); nowy kolor, token albo komponent tylko od roli 04 (zasada wspólna 15).

Źródła: `src/ui/theme.ts` (role `theme.colors.*`, motyw tylko ciemny na `@apps4craft/ui`), `tokeny.json` → `tokeny.ts` (cztery warianty: jasny, ciemny, jasnyKontrast, ciemnyKontrast), `kontrast.md` (27 par × 4 warianty, 0 braków). Liczby użyć: grep `colors.<rola>` w `app/` i `src/` bez testów, 2026-10-20 (z definicją w `theme.ts`; ±1 względem listy M2).

*Dlaczego mapa ról, a nie zamiana 1:1:* stara rola znaczy w kodzie kilka rzeczy naraz (np. `accent` to tło przycisku, kolor tekstu i postęp), a system rozdziela je na osobne tokeny z osobnym pomiarem kontrastu.

## 1. Zasady (rozstrzygają przypadki spoza tabeli)
1. Kolor tylko z `tokeny.ts` przez hook motywu (wariant z `useColorScheme()` i „Zwiększ kontrast”); w `.tsx` zero literałów `#…` i `rgba(…)`.
2. Jeden akcent (`akcent`/`akcentTekst`) znaczy „działanie” (D-051 4a). Ratan (`ratan`, `ratanSzary`) i `nocDane` tylko wewnątrz komponentu Spirala. Żółty `ostrzTlo` tylko w komponencie Ostrzeżenie (bezpieczeństwo, RD-21…RD-23).
3. Stan nigdy samym kolorem (SP-05): wybrana opcja = obwódka `akcent` 3 pt + znacznik kształtem (jak `.plan-opcja.wyb` i `.segment .wyb` w `ekrany/wspolne.css`); sukces = ikona `sprawdz` + tekst; błąd = ikona `blad` + tekst w `blad`.
4. Bez cieni i bez własnego przyciemnienia tła: hierarchię daje `tlo` → `powierzchnia`; arkusze i alerty systemowe (`presentationStyle="pageSheet"`, `Alert`) mają przyciemnienie iOS.
5. Bez kolorów na sztywno dla stanów jasnych na ciemnym tle (zakaz `#F0FDF4` i palet Material/Tailwind z 04-016): w obu motywach te same tokeny.

## 2. Role `theme.colors.*` → tokeny
| Stara rola (użycia) | Dziś | Znaczenie w kodzie | Token systemu | Para z pomiarem (`kontrast.md`) |
|---|---|---|---|---|
| `border` (189) | `#2E2E34` | separator, obwódka chipa, pola, karty | separator i podział listy → `linia` (bez progu, dekoracja); obwódka kontrolki (pole, chip, przycisk drugi) → `obwodka` 1,5 pt | `obwodka / tlo`, `/ powierzchnia`, `/ tloGrupa` ≥ 3 |
| `textPrimary` (178) | `#F4EFEA` | tekst główny | `tusz` | `tusz / tlo`, `/ powierzchnia`, `/ tloGrupa` |
| `textSecondary` (141) | `#A09C96` | tekst pomocniczy | `tusz2` | `tusz2 / tlo`, `/ powierzchnia`, `/ tloGrupa` |
| `accent` (131) | `#D49B42` | tło przycisku głównego, tekst akcji, postęp, wybór | tło przycisku głównego i wybranego segmentu → `akcent` z tekstem `naAkcencie`; tekst, link, ikona akcji → `akcentTekst`; postęp planu → komponent Spirala (`ratan`/`ratanSzary`/`tusz`); obwódka wyboru → `akcent` 3 pt | `naAkcencie / akcent`; `akcentTekst / tlo`, `/ powierzchnia`, `/ tloGrupa`; `akcent / tlo`, `/ powierzchnia` ≥ 3 |
| `surfaceCard` (98) | `#242428` | karta, pole zagnieżdżone | komórka listy grupowanej → `powierzchnia`; pole zagnieżdżone w komórce → `tloGrupa` | jak `tusz`, `tusz2`, `tusz3` na `powierzchnia`/`tloGrupa` |
| `surface` (92) | `#1C1C1F` | karta, arkusz | `powierzchnia` | jw. |
| `textMuted` (93) | `#686561` (2,67–3,23:1) | podpis 11–13 pt | `tusz3` (≥ 5,06:1 we wszystkich wariantach); funkcja zablokowana → `zablokowane` + kłódka | `tusz3 / tlo`, `/ powierzchnia`, `/ tloGrupa`; `zablokowane / tlo`, `/ powierzchnia` |
| `accentDark` (59) | `#B45309` | tekst akcentu na ciemnym tle (3,08:1) | `akcentTekst` | `akcentTekst / …` |
| `background` (28) | `#121214` | tło ekranu | `tlo` | wszystkie pary `… / tlo` |
| `backgroundSecondary` (27) | `#1C1C1F` | tło kart w Harmonogramie, chipów | tło listy grupowanej → `tloGrupa`; tło komórki → `powierzchnia` | `… / tloGrupa`, `… / powierzchnia` |
| `statusDanger` (18) | `#D9534F` | błąd, akcja destrukcyjna | `blad` + ikona `blad`; przycisk destrukcyjny w `Alert` → styl `destructive` iOS | `blad / tlo`, `/ powierzchnia` |
| `accentLight` (18) | `#EDE4D0` | tło jasnego kremu pod ciemnym tekstem (wybrany chip, 1,11:1) | wybrany chip lub segment → tło `akcent`, tekst `naAkcencie`, waga 600 (`.segment span.wyb`); obwódka wyróżnienia → `akcent` 3 pt | `naAkcencie / akcent`; `akcent / powierzchnia` ≥ 3 |
| `statusSuccess` (10) | `#4E9F3D` | sukces, krok zakończony | brak koloru sukcesu: ikona `sprawdz` w `akcentTekst` + tekst `tusz`; krok zrobiony w planie → Spirala (`ratan`, gruby zwój) | `akcentTekst / …`; `ratan / tlo` ≥ 3 |
| `borderActive` (8) | `#D49B42` | obwódka wybranej karty | `akcent` 3 pt | `akcent / tlo`, `/ powierzchnia` ≥ 3 |
| `statusWarning` (7) | złoto `#D49B42` | przycisk „Start”, obwódki kart zakwasu, pik aktywności | ostrzeżenie bezpieczeństwa → komponent Ostrzeżenie (`ostrzTlo` + `ostrzTusz` + ikona + tytuł); informacja bez bezpieczeństwa (np. dużo soli, zakres temperatur) → wzór `info` (ikona `info` + `tusz`); „Start” → przycisk główny (`akcent`) | `ostrzTusz / ostrzTlo`; `tusz / …` |
| `crustGold` (7) | `#D49B42` | tło wybranego presetu, tekst importu | jak `accent` (tło wyboru → `akcent` + `naAkcencie`; tekst → `akcentTekst`) | jak `accent` |
| `accentMuted` (4) | `rgba(212,155,66,0.15)` | tło przyciemnione akcentem | bez tła półprzezroczystego: wyróżnienie → `powierzchnia` + obwódka `akcent` 3 pt | `akcent / powierzchnia` ≥ 3 |
| `card` (4) | `#242428` | tło pól importu | `powierzchnia` (pole w komórce → `tloGrupa`) | jw. |
| `borderLight` (3) | `#3E3E46` | obwódka wiersza wagi | obwódka kontrolki → `obwodka`; separator → `linia` | `obwodka / …` ≥ 3 |
| `activeStageBadge`, `passiveStageBadge` | `#D49B42`, `#3E3E46` | plakietka etapu | brak plakietek: „Krok n z N” jako tekst `tusz` przy Spirali; etap bieżący i przyszłe rysuje Spirala | `tusz / tlo`; `ratanSzary / tlo` ≥ 3 |
| `secondaryAccent` (0) | `#8C6239` | — | usunąć z motywu | — |

Nowych tokenów kolorów nie ma: brakujące role (sukces, tło wyróżnienia, ostrzeżenie niezwiązane z bezpieczeństwem) rozstrzyga istniejący token i kształt. *Dlaczego:* drugi kolor sukcesu albo złoto ostrzeżenia dałby drugi akcent i kolor o dwóch znaczeniach (HIG Color; zasada studia 6). Nowe pary bez nowych tokenów: 7 wierszy dopisanych 2026-10-20 w `tokeny.json` → `pary` (`node docs/design/narzedzia/tokeny.mjs`, kod 0).

`src/ui/amber-theme.ts`: importują go tylko testy (`src/ui/__tests__/amber-theme.test.ts`, `src/components/__tests__/starter-safety-contrast.test.tsx`), żaden ekran. W systemie nie ma trybu bursztynowego; tryb nocny to wariant `ciemny` według iOS (D-045). Usunięcie pliku i testów: decyzja techniczna 05/08 przy 050.

## 3. Kolory na sztywno w `.tsx` (175 wystąpień w 43 plikach, grep 2026-10-20) → tokeny
| Literał (liczba) | Gdzie, co znaczy | Zamiennik |
|---|---|---|
| `#FFFFFF` (50) | tekst na złotym przycisku i chipie (2,45:1), tekst w jasnych panelach | na `akcent` → `naAkcencie`; inny tekst → `tusz` |
| `#121214` (7), `#000` (7, `shadowColor`) | tekst na złocie; cienie | tekst → `naAkcencie` albo `tusz` według tła; cienie usunąć (zasada 4) |
| `rgba(0,0,0,0.5…0.75)`, `rgba(26,17,10,…)` (10) | przyciemnienie pod własnym modalem | arkusz systemowy (`pageSheet`) bez własnej warstwy |
| `#FEE2E2`, `#FEF2F2`, `#FFEBEE`, `#FDF2F0` + `#991B1B`, `#7F1D1D`, `#EF4444`, `#DC2626`, `#A02010`, `#FCA5A5`, `#FECACA`, `#E8A399` (≈ 27) | błąd, alarm, pleśń, gorące naczynie | błąd → `blad` + ikona na `tlo`/`powierzchnia`; bezpieczeństwo (pleśń RD-21, gorące naczynie RD-23, para) → komponent Ostrzeżenie |
| `#F59E0B`, `#FFF8E1`, `#FFF3E0`, `#FEF3C7`, `#FFFBEB`, `#FFE082`, `#FDE68A`, `#FFCC80`, `#FFA000`, `#E65100`, `#92400E` (≈ 15) | „uwaga” bez bezpieczeństwa | wzór `info` (ikona + `tusz`); jeśli treść 06 oznacza ją jako bezpieczeństwo → Ostrzeżenie |
| `#F0FDF4`, `#E8F5E9`, `#DCFCE7`, `#ECFDF5`, `#C8E6C9`, `#F1F8E9`, `#BBF7D0`, `#A5D6A7`, `#81C784`, `#4CAF50`, `#2E7D32`, `#1B5E20`, `#166534`, `#047857`, `#065F46`, `#10B981` (≈ 22) | sukces, etap ukończony, „dobrze” | ikona `sprawdz` + `tusz`/`akcentTekst` na `powierzchnia`; plan → Spirala |
| `#3B82F6`, `#3F51B5`, `#283593`, `#1A237E`, `#E8EAF6` (≈ 7) | informacja, kategorie Akademii | `akcentTekst` dla akcji; informacja → `info`; kategorii kolorem nie oznaczamy (tekst) |
| `#795548`, `#6D4C41`, `#4E342E`, `#FFAB91`, `#FBE9E7`, `#F5F5F5`, `#D1D5DB` (7) | brązy i szarości paneli | `tusz2`, `linia`, `powierzchnia` według roli |
| `badgeColor` w `src/lib/domain-rules.ts`, `sourdough-physics.ts` (`#F59E0B`, `#3B82F6`, `#10B981`) | poziom komunikatu w module danych | moduł zwraca poziom (`info`/`ostrzezenie`/`blad`), kolor nadaje komponent; poziom `ostrzezenie` tylko dla bezpieczeństwa |
| `QrScannerModal`, `ShareRecipeQrModal`, `QrCodeSvg` (≈ 12) | QR (F-08 PÓŹNIEJ, wejście ukryte) | poza 1.0; przy powrocie F-08 kod QR ciemny `tusz` jasnego wariantu na `#FFFFFF` jako nazwany wyjątek (czytnik wymaga jasnego tła) |
| `SensoryRadarChart` `rgba(217,119,36,0.04)` | wypełnienie wykresu | bez wypełnienia; linie `tusz2`, dane `akcentTekst` |

Test akceptacyjny 050 (do napisania przez 08): (1) grep `#[0-9A-Fa-f]{3,8}|rgba?\(` w `app/**/*.tsx` i `src/**/*.tsx` bez testów zwraca 0 poza listą wyjątków z uzasadnieniem w teście (dziś: brak; QR wraca z F-08); (2) test kontrastu iteruje `kolory` × `pary` z `tokeny.json` dla 4 wariantów i wymaga progu (jak `narzedzia/tokeny.mjs`, kod 0); (3) przy „Zwiększ kontrast” (iOS: `AccessibilityInfo.isDarkerSystemColorsEnabled()` i zdarzenie `darkerSystemColorsChanged`; odczyt `node_modules/react-native/Libraries/Components/AccessibilityInfo/AccessibilityInfo.d.ts`, RN 0.86.3, 2026-10-20) hook zwraca wariant `…Kontrast` (test z atrapą).

## 4. Komponenty z `@apps4craft/ui` (D-046)
| Komponent (użycia w `app/`, `src/`) | Werdykt | Zastępuje | Tokeny |
|---|---|---|---|
| `CraftHeader` (5 ekranów: `index`, `harmonogram`, `stolnica`, `zakwas`, `doktor`) | zastąpić | systemowa nawigacja z dużym tytułem (`Stack` z `headerLargeTitle`), przycisk Ustawień na „Dziś” (D-051 2a) | `typografia.style.tytulDuzy` (Sofia Sans Semi Condensed 34/700 → AX5 60), tło `tlo`, akcje `akcentTekst` |
| `CraftCard` (3: `CalculatorSacredCard`, `StolnicaSacredCard`, `ZakwasSacredCard`) | zastąpić | Kalkulator: lista grupowana „Bochenki / Masa bochenka” i „Do miski” (`ekrany/kalkulator.html`); Stolnica: Spirala + opis (`ekrany/prowadzenie.html`); Zakwas: Spirala cyklu (`ekrany/zakwas.html`) | `powierzchnia`, `promienie.grupa` 12, separator `linia`, wysokość komórki ≥ `cele.pozostale` 44 |
| `CraftStatDisplay` (13) | usunąć | wartości jako komórki listy (etykieta `tusz`, wartość `tusz2`, liczby tabelaryczne) albo opis przy Spirali; bez wersalików (090, kalibracja) | `typografia.style.tresc`/`naglowek` |
| `CloseIcon` (4 modale) | zastąpić | przycisk tekstowy w pasku arkusza według słownika: „Zamknij” (informacja, prawy górny róg) albo „Anuluj” + „Zapisz” (formularz) | `akcentTekst`, cel ≥ 44 |
| `PiekarzAppIcon` (2: `OnboardingModal`, `StudioEcosystemSection`) | nie używać w 1.0 | onboarding zastępuje Start „Co dziś robisz” (F-68, bez intro, §10 specyfikacji); sekcja rodziny to F-52 PÓŹNIEJ (wejście ukryte); ikona aplikacji: spirala z `ekrany/ikona.html` | — |
| `NumInput`, baner stanu uszkodzonego, `CraftButton`, `CraftModal` | `NumInput` i baner zostają jako techniczne, malowane tokenami (`pole`: obwódka `obwodka`, tło `powierzchnia`, tekst `tusz`, błąd `blad`); `CraftButton`, `CraftModal` nieużywane — nie wprowadzać | — | jw. |

Komponenty własne systemu (jedyne): Spirala, Pasek kciuka, Ostrzeżenie, Wybór czynności, Opcja planu, Pasek „Cofnij” (`design-spec.md` §4).

# Piekarz (EN: Baker) 🥖🌾

[![CI](https://github.com/lkarwowski494/piekarz/actions/workflows/ci.yml/badge.svg)](https://github.com/lkarwowski494/piekarz/actions/workflows/ci.yml)
![fast-check](https://img.shields.io/badge/Property--Based-fast--check-blueviolet.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg)
![React Native](https://img.shields.io/badge/React_Native-0.86-61DAFB?logo=react)
![Expo](https://img.shields.io/badge/Expo-57-000000?logo=expo)
![Platform](https://img.shields.io/badge/Platform-iOS-lightgrey.svg)

> **„Mąka, woda, sól i czas — rzemieślnicza precyzja w Twojej domowej piekarni.”**

Piekarz prowadzi cię przez wypiek chleba na zakwasie od receptury do bochenka: liczy ilości, układa plan i pilnuje czasu, gdy telefon śpi. To aplikacja na iPhone'a, która działa bez konta, bez internetu i bez śledzenia; prowadzi też wypiek na drożdżach i pizzę. Po angielsku nazywa się Baker (D-053). Ekosystem **Apps4Brew**.

> Stan opisu: gałąź napraw M2, 2026-10-20 (M1-audytor-generalny-035, partia 7; nowa szata z partii 5–6). Każde zdanie tego pliku ma pokrycie w kodzie; tabela twierdzenie → plik:linia jest w raporcie roli 10 (`audit/M1-2026-10-19/M1-2026-10-19/role/10-wydanie/fix-2026-10-20-p7/wynik.md`), a test `tests/teksty-sklepu.test.ts` pilnuje, żeby obietnice bez pokrycia i funkcje PÓŹNIEJ nie wróciły. Zakres wersji 1.0: `docs/scope-contract.md` (wariant B, D-043).

---

## 🌟 Główne Zasady Produktowe (Apps4Brew)

- **Offline-First:** obliczenia, plan i minutniki działają bez połączenia z internetem; kod produkcyjny nie wywołuje sieci (test `tests/public-repo.test.ts`). Połączenia wymaga tylko zakup w App Store.
- **Bez konta i logowania:** aplikacja nie ma ekranów rejestracji ani logowania. Pierwszy ekran „Co dziś robisz?” ma trzy czynności: „Zakładam zakwas”, „Piekę na zakwasie”, „Piekę na drożdżach albo pizzę”.
- **Prywatność „Data Not Collected”:** brak trackerów i bibliotek telemetrycznych (brak Firebase, Meta, Google Analytics); `NSPrivacyTracking = false` w `app.json`. Receptury, zakwasy i dziennik zostają na urządzeniu.
- **Cztery zakładki (D-051 2a):** Dziś, Receptury, Zakwasy, Dziennik; ustawienia z „Dziś”. Prowadzenie wypieku (`app/stolnica.tsx`) i Doktor Chleba (`app/doktor.tsx`) to osobne ekrany.
- **Ręce w mące:** haptyka przy odhaczaniu składnika, dźwięk na koniec kroku i ekran prowadzenia, który nie gaśnie w trakcie wypieku (`expo-keep-awake`).
- **Model płatności (DEC-01 d, decyzja właściciela z 2026-10-19; zastępuje „Cheaper than Espresso” i darmowy rdzeń DEC-09):**
  - Zakupy wyłącznie przez App Store (StoreKit, `expo-iap`, ADR-007): subskrypcja miesięczna i roczna w jednej grupie oraz zakup dożywotni. Ceny i waluty pokazuje aplikacja z App Store (`displayPrice`); ustawia je właściciel w App Store Connect.
  - **Okres próbny 14 dni** na planie miesięcznym i rocznym, wyłącznie jako oferta wprowadzająca App Store (jedna na grupę subskrypcji, dla uprawnionych). Aplikacja nie liczy dni. Zakup dożywotni nie ma okresu próbnego.
  - Bez subskrypcji, oferty wprowadzającej ani zakupu dożywotniego działa tylko przegląd historii wypieków, import pliku (D-039) oraz odczyt, eksport i usunięcie własnych danych. Każda inna funkcja otwiera ekran zakupu.
- **Własność danych i bezpieczna persystencja:** baza SQLite w katalogu `/Library/SQLite` (poza katalogiem Dokumenty widocznym w aplikacji *Pliki*). Automatyczna rotacja 10 najnowszych kopii (`Documents/Backup/`) oraz eksport i import całej bazy w JSON.
- **Deterministyczna matematyka piekarska:**
  - **Procent piekarski z zakwasem i zaczynem:** woda i mąka zawarte w zakwasie i zaczynie są wliczane w hydratację całego ciasta.
  - **Temperatura wody:** wzór 4-składnikowy (mąka, kuchnia, zakwas, tarcie) dla docelowej temperatury ciasta.
  - **Kinetyka fermentacji $Q_{10} = 3{,}0$ (20–26 °C, FER-Q10-002):** czas fermentacji w planie dopasowany do temperatury w kuchni.
  - **Bezpieczeństwo zakwasu (DEC-10 a, ZAK-NAL-001):** zasada ostrożności — każdy nalot, przebarwienie albo zgniły zapach prowadzi do zalecenia, by zakwas wyrzucić.

---

## 📱 Moduły i Ekrany (zakres 1.0)

Status według kontraktu zakresu `docs/scope-contract.md` (tabela „Zakres”, wiersze F-nn). Funkcje PÓŹNIEJ mają kod, ale bez wejścia w interfejsie (`src/lib/wejscia-pozniej.ts`).

| Moduł / Obszar | F-nn | Opis | Status |
| :--- | :--- | :--- | :--- |
| **Start „Co dziś robisz?”** | `F-68` | Trzy czynności; przy trwającym wypieku bieżący krok i powrót do prowadzenia | ✅ Wdrożone |
| **Receptury i ilości** | `F-09`, `F-11`, `F-26`, `F-27`, `F-55` | 15 receptur bazowych i własne; ilości od liczby bochenków albo masy mąki; kilka mąk; zaczyny (poolish, biga, pâte fermentée, levain); „Zapisz jako moją” | ✅ Wdrożone |
| **Temperatura wody** | `F-10` | Temperatura wody dla docelowej temperatury ciasta | ✅ Wdrożone |
| **Plan wypieku** | `F-13`, `F-14` | Plan wstecz od godziny „gotowe”, czas fermentacji z temperatury kuchni ($Q_{10}$), kroki w nocy z propozycją „Przesuń do lodówki”, stan „Nie zdążysz na tę godzinę” z najwcześniejszą godziną | ✅ Wdrożone |
| **Prowadzenie krok po kroku** | `F-07`, `F-18`, `F-57`, `F-58` | Bieżący krok z minutnikiem, „Cofnij poprzedni”, ostrzeżenia w krokach, wypiek w garnku w dwóch fazach; chleb żytni (> 50% mąki żytniej) bez składania (D-030); powrót do bieżącego kroku po ponownym otwarciu | ✅ Wdrożone |
| **Powiadomienia lokalne** | `F-16`, `F-25` | Koniec kroku i przypomnienie o zakwasie na blacie po 12 h; prośba o zgodę | ✅ Wdrożone (sprawdzenie na zablokowanym telefonie: krok właściciela K1) |
| **Zakwasy** | `F-22`–`F-24`, `F-60`, `F-61` | Kilka zakwasów, ilości do dokarmienia 1:1:1 / 1:2:2 / 1:3:3 / 1:5:5, „Podwoił objętość”, zakładanie zakwasu dzień po dniu, jedno dokarmienie 12 h przed mieszaniem dla zakwasu z lodówki (D-052), karta bezpieczeństwa | ✅ Wdrożone |
| **Doktor zakwasu** | `F-64` | Objaw → możliwe przyczyny → co zrobić; przy nalocie polecenie wyrzucenia | ✅ Wdrożone |
| **Doktor Chleba** | `F-43`, `F-71` | Wybór objawów, 9 kodów wad (protokoły ratunkowe F-71: kod zostaje, wejście ukryte do czasu źródeł, ZM-19) | ✅ Wdrożone (protokoły: ⏸️ PÓŹNIEJ) |
| **„Po co ten krok”** | `F-44` | Wyjaśnienie kroku w prowadzeniu, tylko ze źródłem; lekcje i biblioteka technik bez wejścia | ✅ Wdrożone (lekcje: ⏸️ PÓŹNIEJ) |
| **Dziennik** | `F-28` | Ocena (gwiazdki, miękisz, skórka, profil smaku), statystyki, filtr, „Piecz ponownie” | ✅ Wdrożone |
| **Dane i kopie** | `F-31`–`F-33` | Baza w `/Library/SQLite`, automatyczne kopie (10), eksport do pliku, „Importuj z pliku” (wklejenie zawartości pliku receptury albo kopii), eksport historii do CSV | ✅ Wdrożone |
| **Ustawienia** | `F-35`, `F-38`, `F-40`, `F-69` | Jednostki „gramy, °C” albo „uncje, °F”, język (polski, angielski), zakupy i „Przywróć zakupy”, polityka prywatności, „Oceń w App Store”, „Napisz do nas” | ✅ Wdrożone |
| **Spiżarnia mąk, kody QR, druk PDF, przelicznik objętości** | `F-30`, `F-08`, `F-50`, `F-45` | Kod zostaje, wejście ukryte (`src/lib/wejscia-pozniej.ts`, D-043) | ⏸️ PÓŹNIEJ |
| **Słownik mąk, odrzut zakwasu, strata piecowa, konwerter LM, sekcja „Rodzina”** | `F-46`–`F-49`, `F-52` | Kod zostaje, wejście ukryte (`src/lib/wejscia-pozniej.ts`) | ⏸️ PÓŹNIEJ (D-034) |
| **Masa lodu do schłodzenia wody** | `F-53` | Pole i wynik wycięte z sekcji temperatury wody | ✂️ NIE (D-043) |
| **Trener rachunku i fiszki, Apple Watch, Live Activity, Siri, kalendarz, plik `.piekarz`** | `F-01`–`F-05` | Usunięte z kodu (lista odcięć KL-06…KL-17 w `docs/scope-contract.md`) | ✂️ Wycięte (D-031) |

### 🧭 Szczegółowy opis modułów

1. **🏠 Dziś (F-68):** „Co dziś robisz?” z trzema czynnościami; przy trwającym wypieku bieżący krok i powrót do prowadzenia; po okresie próbnym bez zakupu informacja, co nadal działa.
2. **🧮 Receptury i ilości (F-09, F-11, F-26, F-27, F-55):**
   - Lista receptur z filtrem rodzaju, „Moje receptury” nad „Receptury bazowe”.
   - Ekran receptury: ilości „Do miski”, arkusz „Składniki” („Ilości liczę od”: bochenków albo masy mąki; „Mąki (razem 100%)”; zaczyn), arkusz „Temperatura wody”, „Ułóż plan”.
3. **⏱️ Plan wypieku (F-13, F-14):**
   - Planowanie wstecz od dnia i godziny gotowości chleba; czas fermentacji dopasowany do temperatury w kuchni ($Q_{10} = 3{,}0$).
   - Kroki wymagające rąk, które wypadają w nocy (domyślnie 23:00–06:30), z propozycją „Przesuń do lodówki”.
   - „Nie zdążysz na tę godzinę”: najwcześniejsza możliwa godzina i nieaktywny „Zacznij wypiek” z powodem.
4. **🥣 Prowadzenie (F-07, F-57, F-58):** bieżący krok z czasem i tym, co potem; powiadomienie o końcu kroku; ostrzeżenia (gorące naczynie, surowe ciasto i mąka, surowy zakwas); wypiek w garnku pod pokrywką i bez; „Cofnij poprzedni”; zapis trwającego wypieku i powrót po ponownym otwarciu; ocena bochenka po zakończeniu.
5. **🫙 Zakwasy (F-22…F-25, F-60, F-61, F-64):** karta zakwasu, ilości do dokarmienia, „Podwoił objętość”, przypomnienie po 12 h na blacie, zakładanie zakwasu dzień po dniu, karta bezpieczeństwa z zasadą ostrożności (DEC-10 a), Doktor zakwasu.
6. **🩺 Doktor Chleba (F-43):** wybór objawów i diagnoza jednej z 9 wad: niedofermentowanie, przefermentowanie, zakalec, pęknięcie boku, brak ucha, blada skórka, zbyt kwaśny smak, płaski smak, zbity miękisz. Protokoły ratunkowe ciasta: PÓŹNIEJ, wejście ukryte do czasu źródeł. Wejście z Dziennika.
7. **📓 Dziennik (F-28):** historia wypieków ze statystykami, filtr profilu smaku, „Piecz ponownie”, usuwanie wpisu.
8. **✂️ Lista odcięć (D-031, 2026-10-19):** Apple Watch, Live Activity, skróty Siri, eksport do kalendarza, plik `.piekarz`, trener rachunku i fiszki, sonda temperatury, kalkulator kosztu, Garmin i stary korzeń `App.tsx` usunięte z kodu; powody i warunki powrotu w `docs/scope-contract.md` (sekcja „Lista odcięć z kodu”, KL-06…KL-17).
9. **⚙️ Ustawienia, kopia zapasowa i zakupy:** eksport do pliku i „Importuj z pliku”, eksport historii wypieków do CSV, jednostki, język, zakupy przez App Store (subskrypcja miesięczna lub roczna z ofertą wprowadzającą 14 dni dla uprawnionych albo zakup dożywotni), „Przywróć zakupy”, polityka prywatności, ocena i kontakt.

---

## 🧪 Receptury bazowe (`src/recipes/presets.ts`)

15 receptur w filtrach listy receptur; w nawiasie woda w procentach piekarskich z kodu (bez wody z zakwasu).

- **Na zakwasie:** Wiejski chleb codzienny na zakwasie (68%); Mistrzowski wiejski, Tartine Style (76%); San Francisco Sourdough (70%); Francuski Pain de Campagne (69%); Pradawny chleb orkiszowy z prażonymi ziarnami (68%); Chleb Graham z miodem i siemieniem (72%).
- **Żytnie:** Tradycyjny chleb 100% żytni razowy (78%); Chleb Borodyński (82%).
- **Drożdżowe:** Bagietka paryska z Poolishem (72%); Włoska Ciabatta z Bigą (82%); Focaccia Genovese (80%); Chleb nocny bez wyrabiania (75%).
- **Pizza i słodkie:** Pizza Napoletana Verace 48h (65%); Maślana brioszka na Lievito Madre (46%); Maślana chałka drożdżowa (45%).

---

## 🛠️ Uruchomienie i Testy

Wymagane środowisko: Node.js oraz npm (wersja Node jak w workflow CI, `.github/workflows/ci.yml`).

```bash
# Instalacja zależności
npm install

# Weryfikacja typów TypeScript
npm run typecheck

# Bramka kompletności tłumaczeń i18n
npm run check:i18n

# Uruchomienie testów jednostkowych i integracyjnych Jest
npm test

# Pełna weryfikacja projektu (CI gate)
npm run verify

# Uruchomienie aplikacji w środowisku Expo Router
npm run start
```

---

## 🛡️ Architektura Testów

Liczbę testów podaje wynik `npm test`; ten plik nie powtarza jej ręcznie.

1. **Property-Based Testing (`fast-check`, `src/core/__tests__/domain-property-based.test.ts`):**
   - Niezmienniki na losowych danych (np. `numRuns: 1000`): bilans masy składników dla ciast od 200 g do 20 kg, monotoniczność czasu fermentacji z $Q_{10} = 3{,}0$, ciągłość etapów harmonogramu wstecznego; także moduły z kodem bez wejścia w 1.0 (PÓŹNIEJ i NIE).
2. **Niezależny korpus fizyczny (Python ↔ TypeScript):**
   - Skrypt `scripts/gen-baking-physics-corpus.py` generuje wektory obliczeń piekarskich (`src/core/__tests__/fixtures/baking-physics-corpus.json`), sprawdzane w `src/core/__tests__/baking-physics-corpus.test.ts`; obejmują też moduły PÓŹNIEJ i NIE, których kod zostaje.
3. **Macierz testów AST (`scripts/test-matrix.mjs`, `docs/22-macierz-testow.md`):** pokrycie ekranów, elementów UI, tekstów, logiki i wymiarów (`npm run verify:matrix`).
4. **Odporność danych SQLite (`src/data/__tests__/`):** migracje schematu, kopie przed migracją i importem, przywracanie, błędy zapisu, walidacja wierszy.
5. **Strażnicy interakcji (`tests/interaction-guards.test.ts`):** m.in. `keyboardShouldPersistTaps` w zakładkach i spójna nazwa akcji anulowania (`Anuluj`).
6. **Kontrast (`src/ui/__tests__/theme-contrast.test.ts`):** współczynnik kontrastu par tokenów palety według WCAG 2.1 AA.
7. **Teksty o aplikacji (`tests/teksty-sklepu.test.ts`):** opis sklepu, README i strona `site/` bez obietnic bez pokrycia, bez funkcji PÓŹNIEJ i NIE (OG-05) i z pierwszym zdaniem o głównej pracy.

---

## 📂 Architektura Kodu

```text
piekarz/
├── app/                        # Trasy Expo Router (file-based routing)
│   ├── _layout.tsx             # Główny layout aplikacji i inicjalizacja SQLite
│   ├── stolnica.tsx            # Prowadzenie wypieku krok po kroku
│   ├── doktor.tsx              # Doktor Chleba
│   └── (tabs)/
│       ├── _layout.tsx         # Dolny pasek 4 zakładek: Dziś, Receptury, Zakwasy, Dziennik
│       ├── (dzis)/index.tsx    # Start „Co dziś robisz?” i Ustawienia
│       ├── receptury/          # Lista receptur, ekran receptury, plan wypieku (harmonogram.tsx)
│       ├── zakwasy/            # Zakwasy i Doktor zakwasu
│       └── dziennik/index.tsx  # Dziennik wypieków
├── src/
│   ├── components/             # Komponenty ekranów (receptury, harmonogram, stolnica, zakwas, settings, start)
│   │   └── PaywallModal.tsx    # Ekran zakupu: ceny z App Store (displayPrice), oferta wprowadzająca dla uprawnionych
│   ├── core/                   # Deterministyczne reguły domenowe (procent piekarski, temperatura wody, Q10, kroki)
│   ├── data/                   # SQLite: schemat, migracje, repozytorium
│   ├── doctor/                 # Diagnostyka Doktora Chleba (9 kodów wad) i 4 protokoły ratowania ciasta
│   ├── lib/                    # Narzędzia: kopie, powiadomienia (ADR-006), jednostki, i18n, zakupy (platnosci/)
│   │   └── wejscia-pozniej.ts  # Wejścia funkcji PÓŹNIEJ ukryte w interfejsie (moduły QR, druku, spiżarni zostają w kodzie)
│   ├── recipes/presets.ts      # 15 receptur bazowych
│   └── ui/                     # Tokeny i motyw
├── site/                       # Strona produktu, wsparcie i polityka prywatności (PL)
├── scripts/                    # Bramki: i18n, rozmiar plików, macierz testów
└── package.json
```

---

## 📄 Licencja

Wszelkie prawa zastrzeżone (plik `LICENSE`, decyzja D-056). Kod jest publiczny do wglądu; kopiowanie, zmiany i rozpowszechnianie wymagają zgody autora.

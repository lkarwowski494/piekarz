# Piekarz (Crust) 🥖🌾

[![CI](https://github.com/lkarwowski494/piekarz/actions/workflows/ci.yml/badge.svg)](https://github.com/lkarwowski494/piekarz/actions/workflows/ci.yml)
![fast-check](https://img.shields.io/badge/Property--Based-fast--check-blueviolet.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg)
![React Native](https://img.shields.io/badge/React_Native-0.86-61DAFB?logo=react)
![Expo](https://img.shields.io/badge/Expo-57-000000?logo=expo)
![Platform](https://img.shields.io/badge/Platform-iOS-lightgrey.svg)

> **„Mąka, woda, sól i czas — rzemieślnicza precyzja w Twojej domowej piekarni.”**

Aplikacja mobilna na iPhone'a, która prowadzi domowy wypiek chleba na zakwasie i na drożdżach od receptury do bochenka: liczy ilości, układa plan od godziny „chleb gotowy”, prowadzi etapami planu i pomaga poprawić następny wypiek. Ekosystem **Apps4Brew**.

> Stan opisu: gałąź napraw M2, 2026-10-19 (M1-audytor-generalny-035). Każde zdanie tego pliku ma pokrycie w kodzie; tabela twierdzenie → plik:linia jest w raporcie roli 10 (`audit/M1-2026-10-19/M1-2026-10-19/role/10-wydanie/fix-2026-10-19-p3/wynik.md`), a test `tests/teksty-sklepu.test.ts` pilnuje, żeby obietnice bez pokrycia nie wróciły. Zakres wersji 1.0: `docs/scope-contract.md`.

---

## 🌟 Główne Zasady Produktowe (Apps4Brew)

- **Offline-First:** obliczenia, plan i minutniki działają bez połączenia z internetem; kod produkcyjny nie wywołuje sieci (test `tests/public-repo.test.ts`). Połączenia wymaga tylko zakup w App Store.
- **Bez konta i logowania:** aplikacja nie ma ekranów rejestracji ani logowania. Przy pierwszym uruchomieniu pyta tylko o rytuał piekarski (styl wypieku), który ustawia filtr receptur.
- **Prywatność „Data Not Collected”:** brak trackerów i bibliotek telemetrycznych (brak Firebase, Meta, Google Analytics); `NSPrivacyTracking = false` w `app.json`. Receptury, harmonogramy i notatki zostają na urządzeniu.
- **Kuchenny UX i stopniowe ujawnianie:**
  - **Poziom 1:** karta `DoMiskiScaleCard` z wyborem receptury, liczbą bochenków i listą składników do odhaczania na wadze (mąka, woda, zakwas, sól, drożdże).
  - **Poziom 2 (akordeon PRO):** zwijany panel `ArtisanAccordionPro` z 4-DDT (temperatura wody, masa lodu), mieszanką mąk i zaczynami (poolish, biga, pâte fermentée, levain).
  - **Ręce w mące:** haptyka przy odhaczaniu składnika, dźwięk na koniec etapu i ekran Stolnicy, który nie gaśnie w trakcie wypieku (`expo-keep-awake`). Progi pól dotyku: decyzja DEC-15 (a) w `docs/scope-contract.md` (F-20).
- **Model płatności (DEC-01 d, decyzja właściciela z 2026-10-19; zastępuje „Cheaper than Espresso” i darmowy rdzeń DEC-09):**
  - Zakupy wyłącznie przez App Store (StoreKit, `expo-iap`, ADR-007): subskrypcja miesięczna i roczna w jednej grupie oraz zakup dożywotni. Ceny i waluty pokazuje aplikacja z App Store (`displayPrice`); ustawia je właściciel w App Store Connect.
  - **Okres próbny 14 dni** na planie miesięcznym i rocznym, wyłącznie jako oferta wprowadzająca App Store (jedna na grupę subskrypcji, dla uprawnionych). Aplikacja nie liczy dni. Zakup dożywotni nie ma okresu próbnego.
  - Bez subskrypcji, oferty wprowadzającej ani zakupu dożywotniego działa tylko przegląd historii wypieków oraz odczyt, eksport i usunięcie własnych danych. Każda inna funkcja otwiera ekran zakupu.
- **Własność danych i bezpieczna persystencja:** baza SQLite w katalogu `/Library/SQLite` (poza katalogiem Dokumenty widocznym w aplikacji *Pliki*). Automatyczna rotacja 10 najnowszych kopii (`Documents/Backup/`) oraz eksport i import całej bazy w JSON.
- **Deterministyczna matematyka piekarska:**
  - **True Baker’s %:** woda i mąka zawarte w zakwasie są wliczane w hydratację całego ciasta.
  - **DDT (Desired Dough Temperature):** temperatura wody wzorem 4-składnikowym (mąka, kuchnia, zakwas, tarcie); gdy woda musiałaby mieć poniżej $4^\circ\text{C}$, masa lodu; ostrzeżenie, gdy wynik przekracza $45^\circ\text{C}$.
  - **Kinetyka fermentacji $Q_{10} = 3{,}0$ (20–26 °C, FER-Q10-002):** czas fermentacji burzliwej w Harmonogramie dopasowany do temperatury w kuchni.
  - **Bezpieczeństwo zakwasu (DEC-10 a, ZAK-NAL-001):** zasada ostrożności — każdy nalot, przebarwienie albo zgniły zapach prowadzi do zalecenia, by zakwas wyrzucić; płyn na powierzchni (*hooch*) ma osobny objaw.

---

## 📱 Moduły i Ekrany (zakres 1.0)

Status według kontraktu zakresu `docs/scope-contract.md` (sekcja 7, wiersze F-nn). Zakładki: Kalkulator, Harmonogram, Stolnica, Zakwas; Doktor Chleba otwiera się z nagłówków Stolnicy i Zakwasu oraz po słabej ocenie wypieku.

| Moduł / Obszar | F-nn | Opis | Status |
| :--- | :--- | :--- | :--- |
| **Kalkulator True Baker’s %** | `F-09`, `F-11` | Hydratacja z zakwasem, skala na liczbę bochenków, mieszanka mąk, zaczyny | ✅ Wdrożone |
| **Temperatura wody (DDT)** | `F-10` | Wzór 4-DDT, masa lodu, ostrzeżenie powyżej 45 °C | ✅ Wdrożone |
| **Przelicznik Objętość ↔ Waga** | `F-45` | Szklanki (US i metryczna), łyżki i łyżeczki na gramy z ostrzeżeniem o dokładności | ✅ Wdrożone |
| **Spiżarnia mąk** | `F-30` | Zapasy mąk, odpis zużycia po wypieku, eksport CSV | ✅ Wdrożone |
| **Harmonogram Wsteczny** | `F-13`, `F-14` | Plan od godziny „chleb gotowy”, Sleep Guard, czas fermentacji z temperatury kuchni ($Q_{10}$), czas w lodówce | ✅ Wdrożone |
| **Stolnica (Asystent Wypieku)** | `F-07`, `F-15`, `F-18` | Kroki z receptury i planu Harmonogramu, składania w fermentacji, wypiek w garnku w dwóch fazach; chleb żytni (> 50% mąki żytniej) bez składania: rośnie w formie i w niej się piecze, czasy etapów z planu użytkownika (D-030); test palca przy garowaniu | ✅ Wdrożone |
| **Powiadomienia lokalne** | `F-16` | Koniec etapu i karmienie zakwasu, prośba o zgodę przy pierwszym minutniku lub karmieniu, baner „powiadomienia wyłączone” | ✅ Wdrożone (sprawdzenie na telefonie: krok właściciela K1) |
| **Dziennik i oceny wypieków** | `F-28` | Gwiazdki, miękisz i skórka, radar 5 cech, profil smaku, statystyki, filtr historii, „Piecz ponownie” | ✅ Wdrożone |
| **Zakwas** | `F-22`–`F-25` | Kilka zakwasów, dokarmianie 1:1:1 / 1:2:2 / 1:3:3 / 1:5:5, okno szczytu, przypomnienia, karta bezpieczeństwa | ✅ Wdrożone |
| **Doktor Chleba i ratunek** | `F-43` | Wybór objawów, 9 kodów wad, 4 protokoły ratunkowe z recepturą awaryjną do Kalkulatora | ✅ Wdrożone |
| **Akademia (wejście z Doktora)** | `F-44` | Szkoła Chleba (6 lekcji) i Biblioteka technik (12 kart) | ✅ Wdrożone |
| **Persystencja SQLite i kopie** | `F-31`–`F-33` | Baza w `/Library/SQLite`, automatyczne kopie (10), eksport i import JSON, eksport CSV | ✅ Wdrożone |
| **Kody QR i udostępnianie tekstem** | `F-08` | Kod QR SVG; QR i „Udostępnij” niosą tekst receptury `PIEKARZ-RECEPTURA-1:...` bez schematu URL (import przez Skanuj QR lub Importuj JSON; stare linki `piekarz://recipe?...` nadal się importują); skaner aparatem (`expo-camera`) | ✅ Wdrożone |
| **Druk PDF** | `F-50` | Jedno wejście „Drukuj”: karta receptury A4 albo etykieta słoika 80×50 mm (`expo-print`) | ✅ Wdrożone |
| **Ustawienia** | `F-38`, `F-35`, `F-40` | Jednostki (metryczne / imperialne), język (polski, angielski), zakupy i „Przywróć zakupy”, polityka prywatności | ✅ Wdrożone |
| **Korekta minutnika w locie** | `F-13` | Przyciski −10 s / +10 s / −5 min / +5 min na aktywnej Stolnicy | ✅ Wdrożone |
| **Słownik mąk, odrzut zakwasu, strata piecowa, konwerter LM, sekcja „Rodzina”** | `F-46`–`F-49`, `F-52` | Kod zostaje, wejście ukryte (`src/lib/wejscia-pozniej.ts`) | ⏸️ PÓŹNIEJ (D-034) |
| **Trener rachunku i fiszki, Apple Watch, Live Activity, Siri, kalendarz, plik `.piekarz`** | `F-01`–`F-05` | Usunięte z kodu (lista odcięć KL-06…KL-17 w `docs/scope-contract.md`) | ✂️ Wycięte (D-031) |

### 🧭 Szczegółowy opis modułów

1. **🧮 Kalkulator piekarski i True Baker’s % (F-09…F-11):**
   - Proporcje piekarskie z uwzględnieniem hydratacji zakwasu; karta „Do miski na wagę” z gramami mąki, wody, zakwasu, soli i drożdży.
   - Temperatura wody wzorem 4-DDT do docelowej temperatury ciasta, masa lodu i ostrzeżenie przy wyniku powyżej $45^\circ\text{C}$.
   - Mieszanka mąk z wypadkową chłonnością i białkiem (`FlourBlendModal`); spiżarnia mąk z ostrzeżeniem o brakach (`FlourInventoryModal`).
   - 15 receptur bazowych w filtrach: na zakwasie, żytnie, drożdżowe, pizza i słodkie.
   - Eksport i import receptury w formacie JSON (`ImportRecipeModal`, `recipe-sharing.ts`).
2. **⚖️ Przelicznik objętości na wagę (F-45):** szklanki (US, metryczna), łyżki i łyżeczki na gramy z ostrzeżeniem, że ważenie jest dokładniejsze.
3. **⏱️ Harmonogram wsteczny z ochroną snu (Sleep Guard, F-13, F-14):**
   - Planowanie wstecz od dnia (dziś, jutro, pojutrze) i godziny gotowości chleba.
   - Czas fermentacji burzliwej dopasowany do temperatury w kuchni ($Q_{10} = 3{,}0$).
   - **Sleep Guard:** ostrzeżenie, gdy etap wymagający rąk (wymieszanie, składania, formowanie, wypiek) wypada w godzinach snu (domyślnie 23:00–06:30, do wyboru w Harmonogramie), z propozycją dłuższego garowania w lodówce.
   - Scenariusze wypieku do szybkiego ustawienia planu.
4. **🥣 Stolnica (asystent wypieku i dziennik, F-07, F-28):**
   - Przewodnik krok po kroku z etapów planu Harmonogramu (start z Harmonogramu, z Kalkulatora albo bez receptury jako domyślny chleb pszenny): dokarmienie zakwasu $\rightarrow$ autoliza $\rightarrow$ wymieszanie $\rightarrow$ fermentacja ze składaniami $\rightarrow$ formowanie wstępne, odpoczynek i formowanie $\rightarrow$ garowanie w lodówce $\rightarrow$ nagrzewanie $\rightarrow$ wypiek w garnku (pod pokrywką i bez) $\rightarrow$ studzenie.
   - Bezpieczne porzucenie wypieku (`confirmDiscardBake`) i zapis w historii po zakończeniu z oceną.
   - Odpis zużytej mąki ze spiżarni po zakończeniu wypieku.
   - Karta statystyk (liczba wypieków, średnia ocena, średnia ocena miękiszu i skórki) i filtr historii według profilu smaku (łagodny, zbalansowany, kwaśny, bardzo kwaśny).
5. **🫙 Zakwas (F-22…F-25):**
   - Karta zakwasu (wiek, hydratacja, ostatnie dokarmienie, miejsce przechowywania).
   - Kalkulator dokarmiania w proporcjach 1:1:1, 1:2:2, 1:3:3 i 1:5:5 na żądaną masę zaczynu; zapis proporcji karmienia.
   - Prognoza okna szczytu aktywności zakwasu.
   - Karta bezpieczeństwa z zasadą ostrożności (DEC-10 a).
6. **🩺 Doktor Chleba (F-43):**
   - Wybór objawów i diagnoza jednej z 9 wad: niedofermentowanie, przefermentowanie, zakalec, pęknięcie boku, brak ucha, blada skórka, zbyt kwaśny smak, płaski smak, zbity miękisz.
   - Wyjaśnienie przyczyny i kroki naprawcze na kolejny wypiek; kopiowanie diagnozy.
   - 4 protokoły ratunkowe dla ciasta w trakcie fermentacji z przyciskiem „Załaduj do Kalkulatora” (receptura awaryjna).
7. **🎓 Akademia (F-44):** 6 lekcji Szkoły Chleba (od chleba bez wyrabiania do pizzy neapolitańskiej) z oznaczaniem lekcji jako zaliczonej i 12 kart technik z checklistą wykonania i typowymi błędami.
8. **✂️ Lista odcięć (D-031, 2026-10-19):** Apple Watch, Live Activity, skróty Siri, eksport do kalendarza, plik `.piekarz`, trener rachunku i fiszki, sonda temperatury, kalkulator kosztu, Garmin i stary korzeń `App.tsx` usunięte z kodu; powody i warunki powrotu w `docs/scope-contract.md` (sekcja 3a, KL-06…KL-17).
9. **⚙️ Ustawienia, kopia zapasowa i zakupy:**
   - Eksport i import bazy w formacie JSON (`exportBackup`), eksport CSV historii i spiżarni.
   - Zakupy przez App Store: subskrypcja miesięczna lub roczna (oferta wprowadzająca: 14 dni bezpłatnie) albo zakup dożywotni; historia i własne dane dostępne bez zakupu (zob. „Model płatności” wyżej).

---

## 🧪 Receptury bazowe (`src/recipes/presets.ts`)

15 receptur w filtrach Kalkulatora; w nawiasie woda w procentach piekarskich z kodu (bez wody z zakwasu).

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
   - Niezmienniki na losowych danych (np. `numRuns: 1000`): bilans masy składników dla ciast od 200 g do 20 kg, monotoniczność obliczeń lodu i czasu fermentacji z $Q_{10} = 3{,}0$, bilans masy przy stracie piecowej, ciągłość etapów harmonogramu wstecznego.
2. **Niezależny korpus fizyczny (Python ↔ TypeScript):**
   - Skrypt `scripts/gen-baking-physics-corpus.py` generuje wektory dla DDT, lodu, $Q_{10}$, dokarmiania i straty piecowej (`src/core/__tests__/fixtures/baking-physics-corpus.json`), sprawdzane w `src/core/__tests__/baking-physics-corpus.test.ts`.
3. **Macierz testów AST (`scripts/test-matrix.mjs`, `docs/22-macierz-testow.md`):** pokrycie ekranów, elementów UI, tekstów, logiki i wymiarów (`npm run verify:matrix`).
4. **Odporność danych SQLite (`src/data/__tests__/`):** migracje schematu, kopie przed migracją i importem, przywracanie, błędy zapisu, walidacja wierszy.
5. **Strażnicy interakcji (`tests/interaction-guards.test.ts`):** m.in. `keyboardShouldPersistTaps` w zakładkach i spójna nazwa akcji anulowania (`Anuluj`).
6. **Kontrast (`src/ui/__tests__/theme-contrast.test.ts`):** współczynnik kontrastu tokenów palety, np. tekst `#F4EFEA` na tle `#121214` powyżej 12:1 (WCAG AAA ≥ 7:1).

---

## 📂 Architektura Kodu

```text
piekarz/
├── app/                        # Trasy Expo Router (file-based routing)
│   ├── _layout.tsx             # Główny layout aplikacji i inicjalizacja SQLite
│   └── (tabs)/
│       ├── _layout.tsx         # Dolny pasek 4 zakładek; Doktor jako ukryta trasa
│       ├── index.tsx           # Kalkulator piekarski & True Baker's % & DDT
│       ├── harmonogram.tsx     # Harmonogram wsteczny i Sleep Guard
│       ├── stolnica.tsx        # Asystent wypieku na żywo & dziennik i statystyki
│       ├── zakwas.tsx          # Profil zakwasu i dokarmianie
│       └── doktor.tsx          # Doktor Chleba — diagnostyka problemów
├── src/
│   ├── components/             # Reużywalne komponenty HIG i modale funkcyjne
│   │   ├── ImportRecipeModal.tsx # Bezpieczny import i podgląd receptur z formatu JSON
│   │   ├── FlourBlendModal.tsx   # Wieloskładnikowy mieszalnik mąk i normalizator
│   │   ├── FlourInventoryModal.tsx # Spiżarnia mąk
│   │   ├── StarterConverterModal.tsx # Konwerter hydratacji i Lievito Madre (wejście ukryte, F-49)
│   │   ├── SensoryRadarChart.tsx # Wektorowy wykres pajęczynowy oceniania sensorycznego SVG
│   │   ├── QrCodeSvg.tsx         # Wektorowy renderer kodów QR SVG
│   │   ├── ShareRecipeQrModal.tsx# Udostępnianie receptury kodem QR z tekstem receptury
│   │   ├── QrScannerModal.tsx    # Offline skaner kodów QR aparatem
│   │   ├── PaywallModal.tsx      # Ekran zakupu: ceny z App Store (displayPrice), oferta wprowadzająca dla uprawnionych
│   │   └── calculator/           # Komponenty kuchennego Progressive Disclosure
│   │       ├── DoMiskiScaleCard.tsx    # Poziom 1: liczba bochenków, odhaczanie składników, haptyka
│   │       └── ArtisanAccordionPro.tsx # Poziom 2: zwijany panel 4-DDT, lód, mąki, zaczyny
│   ├── core/                   # Deterministyczne reguły domenowe RD-00…RD-15
│   │   ├── domain-rules.ts     # True Baker's %, 4-DDT, lód, kinetyka Q10
│   │   ├── flour-atlas.ts      # Dane mąk do chłonności wody mieszanki
│   │   ├── preferments.ts      # Kalkulator zaczynów: Poolish, Biga, Pâte Fermentée, Levain
│   │   ├── starter-converter.ts# Konwerter hydratacji zakwasu i protokół Lievito Madre (wejście ukryte, F-49)
│   │   ├── inventory.ts        # Spiżarnia i kalkulator braków surowcowych
│   │   ├── bake-statistics.ts  # Agregacja statystyk i filtracja historii wypieków
│   │   └── __tests__/          # Wektory testowe i Property-Based Testing
│   ├── data/                   # Warstwa danych i SQLite
│   │   ├── db.ts               # Interfejsy encji
│   │   ├── sqlite-schema.ts    # Jedyny schemat SQLite: migracje SCHEMA_MIGRATIONS
│   │   ├── sqlite-store.ts     # Repozytorium SQLite z pamięciowym fallbackiem
│   │   └── __tests__/          # Testy persystencji
│   ├── doctor/                 # Silnik diagnostyczny Doktora Chleba
│   │   ├── diagnostics.ts      # Objawy i 9 kodów wad
│   │   ├── dough-recovery.ts   # 4 protokoły ratowania ciasta
│   │   └── __tests__/          # Testy diagnostyki
│   ├── guards/                 # Strażnicy architektoniczni i wzorce interakcji
│   │   └── __tests__/          # Testy reguł HIG
│   ├── lib/                    # Narzędzia i adaptery Apps4Brew
│   │   ├── announce.ts         # Asysta VoiceOver
│   │   ├── app-access.ts       # useAppAccess(): dostęp z transakcji StoreKit (src/lib/platnosci, ADR-007)
│   │   ├── backup.ts           # Eksport, autoBackup (rotacja 10) i safetyBackup
│   │   ├── confirm.ts          # Znormalizowane dialogi HIG
│   │   ├── db-path.ts          # Ochrona bazy w /Library/SQLite
│   │   ├── feeding-formatter.ts# Formatowanie i schowek dokarmiania zakwasu
│   │   ├── schedule-formatter.ts # Udostępnianie harmonogramu wstecznego
│   │   ├── diagnosis-formatter.ts # Udostępnianie diagnozy Doktora Chleba
│   │   ├── recipe-formatter.ts # Udostępnianie receptury
│   │   ├── recipe-sharing.ts   # Bezpieczna serializacja JSON, ładunek tekstowy do QR i udostępniania
│   │   ├── recipe-navigation.ts# Bezstanowe przekazywanie parametrów między zakładkami
│   │   ├── notifications.ts    # Powiadomienia lokalne końca etapu i karmienia (ADR-006)
│   │   ├── unit-converter.ts   # Konwerter Metric / Imperial (°C/°F, g/oz/lbs)
│   │   ├── csv-exporter.ts     # Generator arkuszy CSV (historia wypieków i spiżarnia)
│   │   ├── pdf-sheet-generator.ts # Drukowanie kart A4 i etykiet słoika 80x50 mm (expo-print)
│   │   ├── wejscia-pozniej.ts  # Wejścia funkcji PÓŹNIEJ (ukryte w interfejsie)
│   │   ├── i18n.ts             # Silnik tłumaczeń z polskim kluczem źródłowym; aktywne PL i EN
│   │   ├── i18n.en.ts          # Słownik języka angielskiego
│   │   └── __tests__/          # Testy narzędzi
│   ├── recipes/                # Baza receptur
│   │   ├── presets.ts          # 15 receptur bazowych we wszystkich kategoriach
│   │   └── __tests__/          # Testy poprawności i niezmienników receptur
│   └── ui/                     # Paleta stylistyczna
│       └── theme.ts            # Tokeny kolorów, odstępów i promieni
├── scripts/
│   └── check-i18n.mjs          # Zautomatyzowana bramka weryfikacji słownika
└── package.json
```

---

## 📄 Licencja

GPLv3 / Open Core — tworzone z pasją w duchu rzemiosła piekarskiego Apps4Brew.

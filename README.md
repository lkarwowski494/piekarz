# Piekarz (Crust) 🥖🌾

[![CI](https://github.com/lkarwowski494/piekarz/actions/workflows/ci.yml/badge.svg)](https://github.com/lkarwowski494/piekarz/actions/workflows/ci.yml)
![Tests](https://img.shields.io/badge/tests-1161%20passed-brightgreen.svg)
![fast-check](https://img.shields.io/badge/Property--Based-fast--check-blueviolet.svg)
![Python Corpus](https://img.shields.io/badge/Physics%20Corpus-566%20cases-darkblue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg)
![React Native](https://img.shields.io/badge/React_Native-0.86-61DAFB?logo=react)
![Expo](https://img.shields.io/badge/Expo-57-000000?logo=expo)
![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android-lightgrey.svg)

> **„Mąka, woda, sól i czas — rzemieślnicza precyzja w Twojej domowej piekarni.”**

Aplikacja mobilna dla pasjonatów rzemieślniczego chleba na zakwasie, bagietek i pizzy, stworzona w bezkompromisowym standardzie ekosystemu **Apps4Brew**.

---

## 🌟 Główne Zasady Produktowe (Apps4Brew)

- **100% Offline-First:** Pełna funkcjonalność bez połączenia z internetem. Działa w wiejskiej chacie, piwnicy i kuchni bez zasięgu.
- **Zero Login & Bez Kont:** Brak ekranów rejestracji, formularzy logowania czy uciążliwego onboardingu. Po otwarciu aplikacji od razu przechodzisz do receptury i ważenia składników.
- **Prywatność „Data Not Collected”:** Zero trackerów, zero zewnętrznych bibliotek telemetrycznych (brak Firebase, Meta, Google Analytics). Twoje receptury, harmonogramy i notatki należą wyłącznie do Ciebie.
- **Kuchenny UX „Kitchen-Proof” & Progressive Disclosure:**
  - **Poziom 1 (1-Tap, < 30s do miski):** Karta `DoMiskiScaleCard` z natychmiastowym wyborem chleba, stepperem liczby bochenków i checklistą składników na wadze kuchennej (mąka, woda, zakwas, sól).
  - **Poziom 2 (Akordeon PRO):** Zwijany panel `ArtisanAccordionPro` kryjący 4-DDT (temperatura wody, tarcie miksera, bilansowanie lodu), atlas mąk (popiół, chłonność), prefermenty (Poolish, Biga, Levain) i stratę piecową.
  - **Zasada Brudnego Kciuka:** Pola dotykowe $\ge 52\,\text{pt}$, haptyka przy każdym odważonym składniku, dźwięk dzwonka kuchennego oraz blokada wygaszania ekranu (`KeepAwake`).
- **Model Monetyzacji „Cheaper than Espresso”:**
  - **$0.99 USD / miesiąc** (~4,49 zł)
  - **$4.99 USD / rok** (~22,99 zł) — *Oferta główna (~1,91 zł/msc)*
  - **$14.99 USD Lifetime** (~69,99 zł) — *Zakup jednorazowy na zawsze*
  - **Zero podziału na funkcje Free i Pro:** W okresie próbnym (7 dni lub pierwsze 3 pełne wypieki) użytkownik ma dostęp do **100% możliwości aplikacji** bez sztucznych ograniczeń.
  - **Zasada Historii Zawsze Czytelnej (Read-Only):** Po wygaśnięciu okresu próbnego archiwalne wypieki, notatki i radary sensoryczne pozostają w 100% bezpłatne do wglądu. Blokowane są wyłącznie akcje tworzenia nowych wypieków, otwierające estetyczny Paywall.
- **Własność Danych & Bezpieczna Persystencja:** Baza danych SQLite zabezpieczona w katalogu `/Library/SQLite` (chroniona przed przypadkowym skasowaniem w aplikacji *Pliki*). Automatyczna rotacja 10 najnowszych kopii po każdym wypieku (`Documents/Backup/`) oraz nielimitowany eksport/import JSON.
- **Deterministyczna Fizyka i Matematyka Piekarska:**
  - **True Baker’s %:** Woda i mąka zawarte w zakwasie (Levain) są wliczane w bilans całkowitej hydratacji ciasta.
  - **4-składnikowe DDT (Desired Dough Temperature):** Precyzyjne wyliczanie temperatury wody z uwzględnieniem ciepła tarcia i automatycznym bilansowaniem lodu przy temperaturach wody $<4^\circ\text{C}$.
  - **Kinetyka Fermentacji $Q_{10} = 2.0$:** Dynamiczna adaptacja czasu fermentacji burzliwej do aktualnej temperatury w kuchni.
  - **Bezpieczeństwo Biologiczne:** Ścisłe reguły klasyfikujące zjawiska na zakwasie (płyn głodowy *hooch*, bezpieczny kożuch drożdżowy *kahm yeast* oraz bezwzględny alarm toksycznej pleśni).

---

## 📱 Moduły i Ekrany (Weryfikacja z BRD)

Status wdrożenia według specyfikacji wymagań biznesowych (BRD v0.1):

| Moduł / Obszar | Ref. BRD | Opis | Status |
| :--- | :--- | :--- | :--- |
| **Kalkulator True Baker’s %** | `Z-001`–`Z-012` | Bilans hydratacji z zakwasem, DDT 4-składnikowe, lód, tarcie, blend mąk | ✅ Wdrożone |
| **Przelicznik Objętość ↔ Waga** | `Z-013` | Szklanki/łyżki na gramy (mąka, woda, sól, drożdże) z ostrzeżeniem | ✅ Wdrożone |
| **Magazyn Mąk & Koszty** | `Z-051`, `Z-053` | Spiżarnia mąk, białko %, popiół, chłonność, kalkulator kosztów, odpis z magazynu | ✅ Wdrożone |
| **Słownik Odpowiedników Mąk** | `Z-052` | Międzynarodowe typy mąk (PL ↔ FR ↔ IT ↔ DE ↔ US/UK) | ✅ Wdrożone |
| **Harmonogram Wsteczny** | `Z-015`–`Z-023` | Reverse scheduling, Sleep Guard, kinetyka Q10, garowanie chłodnicze, piec | ✅ Wdrożone |
| **Stolnica (Asystent Wypieku)** | `Z-024`–`Z-037` | Hands-in-Flour, kroki z receptury i planu Harmonogramu (chleb pszenny), składania w fermentacji, wypiek w garnku | 🟡 Wdrożone bez żyta: chleb żytni czeka na etapy roli 06, Stolnica go nie prowadzi (F-07, D-030) |
| **Galeria & Oceny Wypieków** | `Z-049`, `Z-050` | 1–5 gwiazdek, scoring miękiszu/skórki, profile smakowe, statystyki | ✅ Wdrożone |
| **Zakwas & Bezpieczeństwo** | `Z-038`–`Z-042`, `Z-045` | Profil, dokarmianie 1:2:2, predyktor peak, hooch, kahm, alarm pleśni | ✅ Wdrożone |
| **Lievito Madre 50%** | `Z-044` | Protokół konwersji 100% ↔ 50% LM, schemat 3 odświeżeń | ✅ Wdrożone |
| **Przepisy na Odrzut (Discard)** | `Z-043` | Baza przepisów na odrzut zakwasu (krakersy, naleśniki, gofry, ciasteczka) | ✅ Wdrożone |
| **Doktor Chleba & Ratunek** | `Z-099`–`Z-100` | Drzewo symptomów, 9 kodów wad, procedury ratowania ciasta (Dough Recovery) | ✅ Wdrożone |
| **Szkoła Chleba (Ścieżka SCI)** | `Z-084`–`Z-090` | 6 stopni wtajemniczenia: No-knead, wiejski, Tartine, 100% żytni, bagietka, pizza | ✅ Wdrożone |
| **Biblioteka Technik (BIB)** | `Z-091`–`Z-098` | 12 kart technik: autoliza, coil fold, slap&fold, laminacja, pre-shape, scoring | ✅ Wdrożone |
| **Trener Rachunku & Fiszki (TRE)** | `BR-TRE-001/002` | Mental Baker Drill (60s), poziomy 1–3, fiszki biochemiczne z systemem Leitnera | ✂️ Wycięte (D-031, lista odcięć KL-13 w `docs/scope-contract.md`) |
| **Persystencja SQLite & Backup** | `Z-073`–`Z-076` | Baza w `/Library/SQLite`, auto-backup 10 kopii, JSON export/import, sharing | ✅ Wdrożone |
| **Zegary kuchenne & Alarmy** | `Z-054`–`Z-056` | Timery wielobieżne, głośne alarmy, integracja dźwiękowa i wibracyjna | ✅ Wdrożone |
| **Ustawienia & Pro** | `Z-078`–`Z-080` | Model etyczny, brak lock-in, Pro Lifetime, Family Sharing info | ✅ Wdrożone |
| **Kody QR SVG & udostępnianie tekstem** | `P1`, `Z-150` | Wektorowe generowanie kodów QR SVG; QR i „Udostępnij” niosą tekst receptury `PIEKARZ-RECEPTURA-1:...` bez schematu URL (import przez Skanuj QR lub Importuj JSON; stare linki `piekarz://recipe?...` nadal się importują) | ✅ Wdrożone |
| **Skaner Kodów QR Aparatem** | `P2`, `Z-151` | Offline skaner kodów kreskowych/QR z wizjerem (`expo-camera`) | ✅ Wdrożone |
| **Piecz Ponownie (1-Tap)** | `P3`, `Z-037` | Jedno kliknięcie na Stolnicy przenosi historyczną recepturę i DDT do kalkulatora | ✅ Wdrożone |
| **Wektorowy Radar Sensoryczny** | `P4`, `Z-049` | 5-osiowy wykres pajęczynowy SVG oceniania miękiszu, skórki i kwasowości | ✅ Wdrożone |
| **Jednostki Imperialne** | `P5`, `Z-014` | Globalny przełącznik Metric/Imperial (°C/°F, g/oz/lbs) z pełną persystencją | ✅ Wdrożone |
| **Eksport Arkuszy CSV** | `P6`, `Z-152` | Eksport historii wypieków oraz spiżarni mąk do otwartego formatu CSV | ✅ Wdrożone |
| **Druk Kart Receptur & Etykiet PDF** | `P7`, `Z-153` | Zalaminowane karty A4 na blat mączny i etykiety 50x80mm na słoiki zakwasu (`expo-print`) | ✅ Wdrożone |
| **Korekta Timera w Locie** | `P8`, `Z-028` | Przyciski korekty czasu w locie (-10s / +10s / -5m / +5m) na aktywnej Stolnicy | ✅ Wdrożone |

### 🧭 Szczegółowy opis modułów

1. **🧮 Kalkulator Piekarski & True Baker’s % (`Z-001`–`Z-012`):**
   - Obliczanie proporcji piekarskich z uwzględnieniem hydratacji zakwasu.
   - 4-składnikowe równanie DDT z ostrzeżeniem termicznym ($>45^\circ\text{C}$ zabija drożdże).
   - Precyzyjny kalkulator topnienia lodu w wodzie kranowej.
   - Szacowanie wagi upieczonego bochenka (strata wypiekowa 14%).
   - Magazyn mąk i ostrzeżenia o brakach magazynowych w spiżarni (`FlourInventoryModal`).
   - Mieszalnik mąk i kalkulator wypadkowego białka/W (`FlourBlendModal`).
   - Filtrowanie receptur mistrzowskich według 4 kategorii rzemieślniczych i karty zaleceń wypiekowych.
   - Eksport i bezpieczny import formuł w formacie JSON (`ImportRecipeModal`, `recipe-sharing.ts`).
2. **⚖️ Przelicznik Objętościowy na Wagowy (`Z-013`):**
   - Przeliczanie szklanek (US cup, Metric cup), łyżek i łyżeczek na gramy dla mąki, wody, soli, drożdży i zakwasu.
   - Wyraziste ostrzeżenie o ryzyku wahań gęstości nasypowej mąki do 30% i rekomendacji wagi jubilerskiej/kuchennej.
3. **🌍 Międzynarodowy Słownik Odpowiedników Mąk (`Z-052`):**
   - Zestawienie standardów przemiału: Polska (Typ 450–2000), Francja (T45–T150), Włochy (Tipo 00–Integrale), Niemcy (Type 405–1600), USA/UK (Pastry, All-Purpose, Bread, High Gluten, Whole Wheat).
   - Wskaźniki popiołu (Ash %), orientacyjna zawartość białka i chłonność cieczy.
4. **⏱️ Harmonogram Wsteczny z Ochroną Snu (Sleep Guard, `Z-015`–`Z-023`):**
   - Planowanie wstecz od docelowej godziny podania lub krojenia chleba.
   - Adaptacja długości fermentacji burzliwej do temperatury otoczenia ($Q_{10}$).
   - **Sleep Guard:** Automatyczne wykrywanie kolizji czynności wymagających obecności (składania, formowanie, pieczenie) ze snem (23:00–06:30) z propozycją wydłużenia garowania chłodniczego (*cold retard*).
   - Profile scenariuszy wypieku: ekspresowy, klasyczny nocny, 24-godzinny weekendowy.
5. **🥣 Stolnica (Asystent Wypieku Hands-in-Flour & Galeria Wypieków, `Z-024`–`Z-037`, `Z-049`–`Z-050`):**
   - Interfejs przystosowany do obsługi oprószonymi mąką dłońmi (duże elementy dotykowe $\ge 48\,\text{pt}$, wysoki kontrast).
   - Przewodnik krok po kroku z etapów planu Harmonogramu (start z Harmonogramu, z Kalkulatora albo bez receptury jako domyślny chleb pszenny): Dokarmienie zakwasu $\rightarrow$ Autoliza $\rightarrow$ Wymieszanie $\rightarrow$ Fermentacja ze składaniami $\rightarrow$ Formowanie wstępne i ostateczne $\rightarrow$ Garowanie chłodnicze $\rightarrow$ Wypiek z parą $\rightarrow$ Studzenie.
   - Bezpieczne porzucenie wypieku przez `confirmDiscardBake` i automatyczny zapis historii po upieczeniu.
   - Automatyczny odpis zużytej mąki z magazynu spiżarni po ukończeniu bochenka.
   - Karta statystyk wypieków (łączna liczba, średnia ocena ogólna, ocena miękiszu i skórki, najczęstszy profil smakowy).
   - Filtrowanie historii wypieków według profilu smakowego (łagodny, zbalansowany, kwaśny, głęboki).
6. **🫙 Zakwas (Profil, Konwerter & Bezpieczeństwo Biologiczne, `Z-038`–`Z-045`):**
   - Karta zakwasu (wiek, hydratacja, rytm dokarmiania, stan przechowywania).
   - Kalkulator dokarmiania w proporcji 1:2:2 lub dowolnej na żądaną masę zaczynu.
   - Silnik konwersji hydratacji i Lievito Madre (konwersja między 100% a 50% ze schematem 3 odświeżeń co 4h).
   - Predyktor szczytu aktywności metabolicznej zakwasu.
   - Diagnostyka wizualna: odróżnianie głodu (*hooch*) i kożucha drożdży tlenowych (*kahm*) od groźnej pleśni.
   - Baza przepisów na wykorzystanie odrzutu zakwasu (*Sourdough Discard*).
7. **🩺 Doktor Chleba (Bread Doctor, `Z-099`–`Z-100`):**
   - Drzewo decyzyjne do analizy nieudanych bochenków.
   - Diagnoza przyczyn: niedofermentowanie (*under-proofed* / *flying crust*), przefermentowanie (*over-proofed*), zakalec (*gummy crumb*), rozerwanie boku (*blowout*), brak ucha (*ear*), blada skórka.
   - Biologiczno-chemiczne wyjaśnienie zjawiska i checklista konkretnych kroków naprawczych na kolejny wypiek.
   - Procedury ratunkowe dla ciasta (*Dough Recovery*).
8. **🎓 Szkoła Chleba & Ścieżka Wtajemniczenia (`Z-084`–`Z-090`):**
   - 6 uszeregowanych lekcji rzemiosła: od No-Knead pot bread do Pizza Napoletana Verace.
   - Rejestracja postępu ucznia w bezpiecznej bazie SQLite.
9. **📖 Biblioteka Technik Rzemieślniczych (`Z-091`–`Z-098`):**
   - 12 kart technologii piekarskich z precyzyjnymi zasadami fizycznymi, checklistą wykonania i typowymi błędami.
10. **✂️ Lista odcięć (D-031, 2026-10-19):** Apple Watch, Live Activity, skróty Siri, eksport do kalendarza, plik `.piekarz`, trener rachunku i fiszki, sonda temperatury, kalkulator kosztu, Garmin i stary korzeń `App.tsx` usunięte z kodu; powody i warunki powrotu w `docs/scope-contract.md` (sekcja 3a, KL-06…KL-17).
11. **⚙️ Ustawienia, Kopia Zapasowa i Pro:**
    - Eksport i import bazy w formacie JSON (`exportBackup`).
    - Etyczny model monetyzacji (Darmowy rdzeń + opcjonalny Pro Lifetime lub 0,99 €/mc bez blokowania podstawowych funkcji).

---

## 🧪 Wzorcowe Receptury w Bazie (Master Recipes)

Aplikacja zawiera 15 fabrycznych, laboratoryjnie zbilansowanych receptur mistrzowskich podzielonych na 4 rzemieślnicze kategorie:

### 🌾 Chleby na zakwasie (Sourdough):
1. **Wiejski chleb codzienny na zakwasie (Country Loaf 72%):**
   - Uniwersalny bochenek pszenno-żytni (85% pszenna chlebowa T650, 15% żytnia T720).
   - Zrównoważony czas fermentacji, chrupiąca skórka i sprężysty miękisz.
2. **Mistrzowski wiejski Tartine Style 80%:**
   - Wysoka hydratacja z dzikim, otwartym miękiszem (*open crumb*).
   - Mieszanka mąki chlebowej wysokobiałkowej i pełnoziarnistego orkiszu T1050.
3. **San Francisco Sourdough 70%:**
   - Wyrazisty, octowo-mlekowy profil smakowy osiągany przez 24-godzinną retardację chłodniczą w 4°C.
   - Wybitne ucho (*ear*) i głęboko karmelizowana skórka z pęcherzykami (*blisters*).
4. **Pain de Campagne 75%:**
   - Klasyczny francuski bochenek wiejski na mące chlebowej T80, żytniej T1150 oraz 5% mąki razowej.
   - Aksamitny, lekko szary miękisz o tradycyjnym rustykalnym aromacie.
5. **Chleb orkiszowy z prażonymi ziarnami 74%:**
   - 100% orkisz (jasny T630 i pełnoziarnisty T1050) z prażonym słonecznikiem, siemieniem lnianym i sezamem.
   - Głęboki orzechowy smak i doskonała wilgotność.
6. **Chleb Graham z miodem i siemieniem 75%:**
   - Tradycyjny chleb na mące graham T1850 z dodatkiem naturalnego miodu i namoczonego siemienia lnianego.
   - Bogaty w błonnik, miękki i długo zachowujący świeżość.

### 🍞 Chleby żytnie (Rye):
7. **Tradycyjny chleb 100% żytni razowy 78%:**
   - Klasyczny bochenek z foremki keksówki oparty na mące żytniej razowej T2000.
   - Głęboki, trójfazowy profil kwasowy zabezpieczający skrobię żytnią przed atakiem amylaz.
8. **Chleb Borodiński na czerwonym słodzie 80%:**
   - Legendarny chleb żytnio-pszenny zaparzany wrzątkiem ze słodem żytnim fermentowanym (czerwonym) i miodem.
   - Posypany prażonymi ziarnami kolendry o niepowtarzalnym korzennym bukiecie.

### 🥖 Pieczywo drożdżowe i z prefermentami (Yeast & Preferments):
9. **Bagietka tradycyjna de Tradition z Poolish 70%:**
   - Tradycyjna francuska bagietka na 12-godzinnym zaczynie płynnym Poolish (100% hydratacji).
   - Cieniutka, szklista skórka i duże, nieregularne pory.
10. **Ciabatta con Biga 82%:**
    - Wybitnie napowietrzony włoski chleb kapciowaty na sztywnym zaczynie Biga (50% hydratacji).
    - Ekstremalnie delikatny, poduszkowy miękisz.
11. **Focaccia Genovese z emulsją solankową 80%:**
    - Puszysty placek z obfitą ilością oliwy z oliwek extra virgin i tradycyjną emulsją wodno-olejową (*salamoia*).
    - Charakterystyczne wgłębienia palcowe, rozmaryn i płatki soli morskiej.
12. **Chleb nocny bez wyrabiania (No-Knead) 75%:**
    - Minimalistyczna formuła z mikrodawką drożdży (0.2%) i powolną 18-godzinną fermentacją pokojową.
    - Wypiekany w rozgrzanym żeliwnym garnku.

### 🍕 Pizza i wypieki słodkie (Pizza & Sweet):
13. **Klasyczna pizza napoletana 48h 65%:**
    - Oryginalna receptura neapolitańska z mąki Tipo 00 o przedłużonej fermentacji chłodniczej.
    - Napompowane, lamparcie brzegi (*cornicione*) i idealna elastyczność.
14. **Maślana brioszka na Lievito Madre 55%:**
    - Luksusowe ciasto maślane (25% masła wiejskiego) na 50% sztywnym zakwasie Lievito Madre.
    - Całkowity brak kwaśnego posmaku, jedwabisty maślany miękisz i złocista glazura.
15. **Słodka chałka maślana na zakwasie i drożdżach 50%:**
    - Bogate ciasto wzbogacone mlekiem, masłem i żółtkami, zaplatane w tradycyjny warkocz.
    - Posypana kruchą maślaną kruszonką.

---

## 🛠️ Uruchomienie i Testy

Wymagane środowisko: Node.js 20+ oraz npm.

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

## 🛡️ Wielowymiarowa Architektura Testów (Standard Apps4Brew)

Projekt `piekarz` stosuje rygorystyczną strategię weryfikacji zaczerpniętą ze standardu ekosystemu `organizer` — **1037 testów automatycznych w 45 zestawach testowych** obejmujących 6 niezależnych perspektyw:

1. **Property-Based Testing (`fast-check`):**
   - Weryfikacja niezmienników algebraicznych na tysiącach losowych permutacjach wejściowych (`numRuns: 1000`).
   - Zachowanie bilansu masy mąki, wody i soli w ciastach od mikro-porcji (200g) do misek piekarskich (20kg).
   - Ścisła monotoniczność równań termodynamicznych lodu, parowania piecowego (Bake Loss) oraz kinetyki podwajania/poławiania czasów fermentacji $Q_{10} = 2.0$ przy $\pm 10^\circ\text{C}$.
   - Ciągłość i ścisłe przyleganie faz w harmonogramie wstecznym dla dowolnych znaczników czasu w latach 2026–2028.
   - Niezmiennik odwracalności serializacji JSON (round-trip export/import) oraz odporność na losowe zniekształcenia tekstu Unicode.
2. **Niezależny Korpus Fizyczny (Python ↔ TypeScript):**
   - Skrypt `scripts/gen-baking-physics-corpus.py` generuje 566 wzorcowych wektorów prawdy dla DDT, topnienia lodu, kinetyki Arrheniusa, proporcji dokarmiania oraz bilansu strat piecowych i wilgotności miękiszu.
   - Weryfikacja bit-do-bitu gwarantuje brak rozbieżności implementacyjnych między środowiskami.
3. **Wyczerpujące Macierze Brzegowe (Exhaustive Domain Matrices):**
   - Pełna 24-godzinna siatka harmonogramu wstecznego z przejściami przez północ, lata przestępne (29 lutego) i granice miesięcy.
   - Hierarchia priorytetów Doktora Chleba (9 kodów wad, rozstrzyganie konfliktów przy wielokrotnych symptomach).
4. **Odporność Danych i Bezpieczeństwo SQLite:**
   - Testy przeciw wstrzykiwaniu SQL (SQL Injection), obsługa pełnego zakresu Unicode i emoji w nazwach mąk, idempotentność migracji schematu, kolejkowanie historii wypieków.
5. **Strażnicy Architektoniczni i Interakcji (Interaction Guards):**
   - Statyczna analiza kodu zapobiegająca obecności `console.log` w warstwie domenowej, gwarancja minimalnych wymiarów dotykowych $\ge 44\,\text{pt}$ (Apple HIG / WCAG) oraz spójności nazewnictwa akcji anulowania (`Anuluj`).
6. **Dostępność i Kontrast Wizualny (WCAG 2.1 AAA / AA):**
   - Numeryczne obliczenia względnej luminancji ($L$) i współczynnika kontrastu ($CR$) dla każdego tokenu palety *Linen & Crust* (np. `#2C1810` na `#FBF9F5` osiągający ponad $12:1$ — WCAG AAA).

---

## 📂 Architektura Kodu

```text
piekarz/
├── app/                        # Trasy Expo Router (file-based routing)
│   ├── _layout.tsx             # Główny layout aplikacji i inicjalizacja SQLite
│   └── (tabs)/
│       ├── _layout.tsx         # Dolny pasek 5 zakładek rzemieślniczych
│       ├── index.tsx           # Kalkulator piekarski & True Baker's % & DDT
│       ├── harmonogram.tsx     # Harmonogram wsteczny i Sleep Guard
│       ├── stolnica.tsx        # Asystent wypieku na żywo & Galeria i Statystyki
│       ├── zakwas.tsx          # Profil zakwasu, Lievito Madre i konwerter
│       └── doktor.tsx          # Doktor Chleba — diagnostyka problemów
├── src/
│   ├── components/             # Reużywalne komponenty HIG i modale funkcyjne
│   │   ├── ImportRecipeModal.tsx # Bezpieczny import i podgląd receptur z formatu JSON
│   │   ├── FlourBlendModal.tsx   # Wieloskładnikowy mieszalnik mąk i normalizator
│   │   ├── FlourInventoryModal.tsx # Magazyn mąk i spiżarnia
│   │   ├── StarterConverterModal.tsx # Konwerter hydratacji i Lievito Madre
│   │   ├── SensoryRadarChart.tsx # Wektorowy wykres pajęczynowy oceniania sensorycznego SVG
│   │   ├── QrCodeSvg.tsx         # Wektorowy renderer kodów QR SVG
│   │   ├── ShareRecipeQrModal.tsx# Udostępnianie receptur przez kody QR SVG i deep links
│   │   ├── QrScannerModal.tsx    # Offline skaner kodów kreskowych/QR aparatem
│   │   ├── PaywallModal.tsx      # Modal monetyzacji Cheaper than Espresso ($0.99 / $4.99 / $14.99)
│   │   └── calculator/           # Komponenty kuchennego Progressive Disclosure
│   │       ├── DoMiskiScaleCard.tsx    # Poziom 1: 1-Tap waga kuchenna, odhaczanie, haptyka
│   │       └── ArtisanAccordionPro.tsx # Poziom 2: Zwijany panel 4-DDT, lód, prefermenty
│   ├── core/                   # Deterministyczne reguły domenowe RD-00…RD-15
│   │   ├── domain-rules.ts     # True Baker's %, 4-DDT, lód, kinetyka Q10, bezpieczeństwo
│   │   ├── flour-atlas.ts      # Atlas mąk europejskich i silnik chłonności wody
│   │   ├── preferments.ts      # Kalkulator zaczynów: Poolish, Biga, Pâte Fermentée, Levain
│   │   ├── starter-converter.ts# Konwerter hydratacji zakwasu i protokół Lievito Madre
│   │   ├── inventory.ts        # Magazyn spiżarni i kalkulator braków surowcowych
│   │   ├── bake-statistics.ts  # Agregacja statystyk i filtracja historii wypieków
│   │   └── __tests__/          # Wektory testowe TV-01…TV-08 & Property-Based Testing
│   ├── data/                   # Warstwa danych i SQLite
│   │   ├── db.ts               # Interfejsy encji
│   │   ├── schema.ts           # DDL schematu SQLite
│   │   ├── sqlite-store.ts     # Repozytorium SQLite z pamięciowym fallbackiem
│   │   └── __tests__/          # Testy persystencji
│   ├── doctor/                 # Silnik diagnostyczny Doktora Chleba
│   │   ├── diagnostics.ts      # Drzewo symptomów i rozwiązań
│   │   ├── dough-recovery.ts   # Procedury ratowania ciasta
│   │   └── __tests__/          # Testy diagnostyki
│   ├── guards/                 # Strażnicy architektoniczni i wzorce interakcji
│   │   └── __tests__/          # Testy reguł HIG S1, S5, S14
│   ├── lib/                    # Narzędzia i adaptery Apps4Brew
│   │   ├── announce.ts         # Asysta VoiceOver
│   │   ├── app-access.ts       # Silnik uprawnień useAppAccess() i model Cheaper than espresso
│   │   ├── backup.ts           # Eksport, autoBackup (rotacja 10) i safetyBackup
│   │   ├── confirm.ts          # Znormalizowane dialogi HIG
│   │   ├── db-path.ts          # Ochrona bazy w /Library/SQLite
│   │   ├── feeding-formatter.ts# Formatowanie i schowek dokarmiania zakwasu
│   │   ├── schedule-formatter.ts # Udostępnianie harmonogramu wstecznego
│   │   ├── diagnosis-formatter.ts # Udostępnianie diagnozy Doktora Chleba
│   │   ├── recipe-formatter.ts # Udostępnianie receptury
│   │   ├── recipe-sharing.ts   # Bezpieczna serializacja JSON, ładunek tekstowy do QR i udostępniania
│   │   ├── recipe-navigation.ts# Bezstanowe przekazywanie parametrów między zakładkami
│   │   ├── unit-converter.ts   # Konwerter Metric / Imperial (°C/°F, g/oz/lbs)
│   │   ├── csv-exporter.ts     # Generator arkuszy CSV (bake logs i flour inventory)
│   │   ├── pdf-sheet-generator.ts # Drukowanie kart A4 i etykiet słoika 50x80mm (expo-print)
│   │   ├── i18n.ts             # Silnik tłumaczeń z polskim kluczem źródłowym
│   │   ├── i18n.en.ts          # Słownik języka angielskiego
│   │   └── __tests__/          # Testy narzędzi
│   ├── recipes/                # Baza receptur mistrzowskich
│   │   ├── presets.ts          # 15 wzorcowych receptur we wszystkich kategoriach
│   │   └── __tests__/          # Testy poprawności i niezmienników receptur
│   └── ui/                     # Paleta stylistyczna Linen & Crust
│       └── theme.ts            # Tokeny kolorów, odstępów i promieni
├── scripts/
│   └── check-i18n.mjs          # Zautomatyzowana bramka weryfikacji słownika
└── package.json
```

---

## 📄 Licencja

GPLv3 / Open Core — tworzone z pasją w duchu rzemiosła piekarskiego Apps4Brew.

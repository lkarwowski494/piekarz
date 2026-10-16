# Piekarz (Crust) 🥖🌾

[![CI](https://github.com/lkarwowski494/piekarz/actions/workflows/ci.yml/badge.svg)](https://github.com/lkarwowski494/piekarz/actions/workflows/ci.yml)
![Tests](https://img.shields.io/badge/tests-933%20passed-brightgreen.svg)
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
- **Własność Danych & Bezpieczna Persystencja:** Baza danych SQLite zabezpieczona w katalogu `/Library/SQLite` (chroniona przed przypadkowym skasowaniem w aplikacji *Pliki*). Automatyczna rotacja 10 najnowszych kopii po każdym wypieku (`Documents/Backup/`) oraz nielimitowany eksport/import JSON.
- **Deterministyczna Fizyka i Matematyka Piekarska:**
  - **True Baker’s %:** Woda i mąka zawarte w zakwasie (Levain) są wliczane w bilans całkowitej hydratacji ciasta.
  - **4-składnikowe DDT (Desired Dough Temperature):** Precyzyjne wyliczanie temperatury wody z uwzględnieniem ciepła tarcia i automatycznym bilansowaniem lodu przy temperaturach wody $<4^\circ\text{C}$.
  - **Kinetyka Fermentacji $Q_{10} = 2.0$:** Dynamiczna adaptacja czasu fermentacji burzliwej do aktualnej temperatury w kuchni.
  - **Bezpieczeństwo Biologiczne:** Ścisłe reguły klasyfikujące zjawiska na zakwasie (płyn głodowy *hooch*, bezpieczny kożuch drożdżowy *kahm yeast* oraz bezwzględny alarm toksycznej pleśni).

---

## 📱 Moduły i Ekrany

1. **🧮 Kalkulator Piekarski & True Baker’s %:**
   - Obliczanie proporcji piekarskich z uwzględnieniem hydratacji zakwasu.
   - 4-składnikowe równanie DDT z ostrzeżeniem termicznym ($>45^\circ\text{C}$ zabija drożdże).
   - Precyzyjny kalkulator topnienia lodu w wodzie kranowej.
   - Szacowanie wagi upieczonego bochenka (strata wypiekowa 14%).
2. **⏱️ Harmonogram Wsteczny z Ochroną Snu (Sleep Guard):**
   - Planowanie wstecz od docelowej godziny podania lub krojenia chleba.
   - Adaptacja długości fermentacji burzliwej do temperatury otoczenia ($Q_{10}$).
   - **Sleep Guard:** Automatyczne wykrywanie kolizji czynności wymagających obecności (składania, formowanie, pieczenie) ze snem (23:00–06:30) z propozycją wydłużenia garowania chłodniczego (*cold retard*).
3. **🥣 Stolnica (Asystent Wypieku Hands-in-Flour):**
   - Interfejs przystosowany do obsługi oprószonymi mąką dłońmi (duże elementy dotykowe $\ge 48\,\text{pt}$, wysoki kontrast).
   - Przewodnik krok po kroku: Autoliza $\rightarrow$ Wymieszanie $\rightarrow$ Składania (Stretch & Fold / Coil Fold) $\rightarrow$ Formowanie wstępne i ostateczne $\rightarrow$ Wypiek z parą.
   - Bezpieczne porzucenie wypieku przez `confirmDiscardBake` i automatyczny zapis historii po upieczeniu.
4. **🫙 Zakwas (Profil & Bezpieczeństwo Biologiczne):**
   - Karta zakwasu (wiek, hydratacja, rytm dokarmiania, stan przechowywania).
   - Kalkulator dokarmiania w proporcji 1:2:2 lub dowolnej na żądaną masę zaczynu.
   - Diagnostyka wizualna: odróżnianie głodu (*hooch*) i kożucha drożdży tlenowych (*kahm*) od groźnej pleśni.
5. **🩺 Doktor Chleba (Bread Doctor):**
   - Drzewo decyzyjne do analizy nieudanych bochenków.
   - Diagnoza przyczyn: niedofermentowanie (*under-proofed* / *flying crust*), przefermentowanie (*over-proofed*), zakalec (*gummy crumb*), rozerwanie boku (*blowout*), brak ucha (*ear*), blada skórka.
   - Biologiczno-chemiczne wyjaśnienie zjawiska i checklista konkretnych kroków naprawczych na kolejny wypiek.
6. **⚙️ Ustawienia, Kopia Zapasowa i Pro:**
   - Eksport i import bazy w formacie JSON (`exportBackup`).
   - Etyczny model monetyzacji (Darmowy rdzeń + opcjonalny Pro Lifetime lub 0,99 €/mc bez blokowania podstawowych funkcji).

---

## 🧪 Wzorcowe Receptury w Bazie (Master Recipes)

Aplikacja zawiera 6 fabrycznych, zweryfikowanych receptur rzemieślniczych:
- **Wiejski chleb codzienny na zakwasie** (Country Loaf 72%, pszenno-żytni)
- **Mistrzowski wiejski Tartine Style 80%** (wysoka hydratacja, dziki otwarty miękisz)
- **Tradycyjny chleb 100% żytni razowy** (forma keksówka, trójfazowy profil kwasowy)
- **Chleb nocny bez wyrabiania (No-Knead)** (minimalny nakład pracy, fermentacja 18h)
- **Klasyczna pizza napoletana 48h** (długa fermentacja w bloku i kulkach)
- **Słodka chałka maślana na zakwasie i drożdżach** (bogate ciasto maślane)

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

Projekt `piekarz` stosuje rygorystyczną strategię weryfikacji zaczerpniętą ze standardu ekosystemu `organizer` — **834 testy automatyczne w 26 zestawach testowych** obejmujących 6 niezależnych perspektyw:

1. **Property-Based Testing (`fast-check`):**
   - Weryfikacja niezmienników algebraicznych na tysiącach losowych permutacjach wejściowych (`numRuns: 1000`).
   - Zachowanie bilansu masy mąki, wody i soli w ciastach od mikro-porcji (200g) do misek piekarskich (20kg).
   - Ścisła monotoniczność równań termodynamicznych lodu, parowania piecowego (Bake Loss) oraz kinetyki podwajania/poławiania czasów fermentacji $Q_{10} = 2.0$ przy $\pm 10^\circ\text{C}$.
   - Ciągłość i ścisłe przyleganie faz w harmonogramie wstecznym dla dowolnych znaczników czasu w latach 2026–2028.
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
│       ├── stolnica.tsx        # Asystent wypieku na żywo (Hands-in-Flour)
│       ├── zakwas.tsx          # Profil zakwasu i kalkulator dokarmiania 1:2:2
│       └── doktor.tsx          # Doktor Chleba — diagnostyka problemów
├── src/
│   ├── components/             # Reużywalne komponenty HIG (DraftHeader, CloseButton, AddButton, TabIcon)
│   ├── core/                   # Deterministyczne reguły domenowe RD-00…RD-15
│   │   ├── domain-rules.ts     # True Baker's %, 4-DDT, lód, kinetyka Q10, bezpieczeństwo
│   │   ├── flour-atlas.ts      # Atlas mąk europejskich i silnik chłonności wody
│   │   ├── preferments.ts      # Kalkulator zaczynów: Poolish, Biga, Pâte Fermentée, Levain
│   │   └── __tests__/          # Wektory testowe TV-01…TV-08 & Property-Based Testing
│   ├── data/                   # Warstwa danych i SQLite
│   │   ├── db.ts               # Interfejsy encji
│   │   ├── schema.ts           # DDL schematu SQLite
│   │   ├── sqlite-store.ts     # Repozytorium SQLite z pamięciowym fallbackiem
│   │   └── __tests__/          # Testy persystencji
│   ├── doctor/                 # Silnik diagnostyczny Doktora Chleba
│   │   ├── diagnostics.ts      # Drzewo symptomów i rozwiązań
│   │   └── __tests__/          # Testy diagnostyki
│   ├── guards/                 # Strażnicy architektoniczni i wzorce interakcji
│   │   └── __tests__/          # Testy reguł HIG S1, S5, S14
│   ├── lib/                    # Narzędzia i adaptery Apps4Brew
│   │   ├── announce.ts         # Asysta VoiceOver
│   │   ├── backup.ts           # Eksport, autoBackup (rotacja 10) i safetyBackup
│   │   ├── confirm.ts          # Znormalizowane dialogi HIG
│   │   ├── db-path.ts          # Ochrona bazy w /Library/SQLite
│   │   ├── feeding-formatter.ts# Formatowanie i schowek dokarmiania zakwasu
│   │   ├── schedule-formatter.ts # Udostępnianie harmonogramu wstecznego
│   │   ├── diagnosis-formatter.ts # Udostępnianie diagnozy Doktora Chleba
│   │   ├── recipe-formatter.ts # Udostępnianie receptury
│   │   ├── i18n.ts             # Silnik tłumaczeń z polskim kluczem źródłowym
│   │   ├── i18n.en.ts          # Słownik języka angielskiego
│   │   └── __tests__/          # Testy narzędzi
│   ├── recipes/                # Baza receptur mistrzowskich
│   │   └── presets.ts          # 6 wzorcowych receptur
│   └── ui/                     # Paleta stylistyczna Linen & Crust
│       └── theme.ts            # Tokeny kolorów, odstępów i promieni
├── scripts/
│   └── check-i18n.mjs          # Zautomatyzowana bramka weryfikacji słownika
└── package.json
```

---

## 📄 Licencja

GPLv3 / Open Core — tworzone z pasją w duchu rzemiosła piekarskiego Apps4Brew.

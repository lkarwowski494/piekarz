# **Piekarz BRD — 00b Jedna lista decyzji (DEC-01…DEC-46)**
## Wersja: 2.0-craft (Modernizacja Retrofit Apps4Craft)
**Status:** Skonsolidowany rejestr decyzji produktowych, technologicznych i architektonicznych studia Apps4Craft. Każda decyzja zawiera kontekst, rozważane opcje, analizę kompromisów i rekomendację analityka.

---

## **Blok I — Fundamenty Produktu i Zakres (Etap MVP)**

### **DEC-01: Jaki zakres ma pierwsza wersja (MVP v2.0)?**
- **Kontekst:** Pełna specyfikacja to 158 wymagań BR. Tabela zakresu to górna granica.
- **Opcje:**
  - *(a) Pełne MVP z BRD:* 158 BR (wymaga 30–48 dni pracy).
  - *(b+) Wariant optymalny (Rekomendacja):* 124 BR (118 MUST + 6 kluczowych funkcji). Pełny kalkulator %, 4-DDT z tarciem i lodem, adaptacyjny harmonogram wsteczny sprzężony z temperaturą, asystent składań z Live Activity i watchOS, zakwas z estymatorem szczytu, moduł ratunkowy „Doktor Chleba” (15 reguł), bezstratny eksport/import JSON/CSV.
  - *(b) Tylko twarde MUST:* 118 BR (bez widżetów i rozszerzeń zegarkowych).
  - *(c) Wariant (b+) z pełnym Garminem w MVP:* 136 BR (wydłuża czas o min. 3 tygodnie przez proces review Garmin Connect IQ).
  - *(d) Sam kalkulator:* 90 BR (krytyczne ryzyko odrzucenia przez Apple z Apple Guideline 4.3b).
- **Kompromis:** Wariant (b+) maksymalizuje wartość rynkową i odporność na wytyczne Apple przy rozsądnym czasie realizacji.
- **Rekomendacja:** **(b+) MVP Optymalne**. Status: **ZATWIERDZONA**.

### **DEC-02: Integracja z zegarkami Garmin w wersji 1.0 czy 1.1?**
- **Kontekst:** Pieczenie w kuchni angażuje ręce, a użytkownicy zegarków sportowych Garmin (Fēnix, Forerunner) pieką chleb. Nakład na moduł Connect IQ to 12–18 dni pracy.
- **Opcje:**
  - *Opcja A:* Pełna aplikacja Garmin Connect IQ w wersji 1.0.
  - *Opcja B (Rekomendacja):* Prototyp mostka komunikacyjnego w MVP, oficjalna aplikacja Garmin Connect IQ w wersji 1.1 zaraz po premierze wersji iOS/watchOS.
  - *Opcja C:* Całkowita rezygnacja z ekosystemu Garmina.
- **Kompromis:** Opcja B pozwala na szybszą premierę w App Store i dopracowanie aplikacji watchOS.
- **Rekomendacja:** **Opcja B**. Status: **ZATWIERDZONA**.

### **DEC-03: Pełna aplikacja na Apple Watch w MVP?**
- **Kontekst:** Obietnica „ręce w mące” (ZP-10) wymaga sterowania bez dotykania telefonu.
- **Opcje:**
  - *Opcja A (Rekomendacja):* Dedykowana, niezależna aplikacja watchOS z obsługą gestu Double Tap, koronki Digital Crown i haptic feedback.
  - *Opcja B:* Wyłącznie powiadomienia i Live Activity w Smart Stack na zegarku.
- **Kompromis:** Opcja A wymaga dodatkowego targetu watchOS w Xcode, ale stanowi kluczowy wyróżnik rynkowy i tarczę ochronną przed regułą Apple 4.3(b).
- **Rekomendacja:** **Opcja A**. Status: **ZATWIERDZONA**.

### **DEC-04: Identyfikator pakietu (Bundle ID)**
- **Kontekst:** Wymóg suwerenności i unifikacji Apps4Craft.
- **Opcje:** A) `com.apps4brew.baker`; B) `com.apps4brew.piekarz`; C) `com.apps4brew.sourdough`.
- **Rekomendacja:** **Opcja A** (`com.apps4brew.baker`). Status: **ZATWIERDZONA**.

### **DEC-05: Oficjalna nazwa międzynarodowa aplikacji**
- **Kontekst:** W Polsce aplikacja to „Piekarz”. Na rynkach globalnych (35 języków) wymagana jest chwytliwa nazwa.
- **Opcje:** A) Crust; B) Levain; C) Boule; D) Baker's Craft.
- **Rekomendacja:** **Opcja A** (*Crust — Sourdough & Baking*). Status: **ZATWIERDZONA**.

### **DEC-06: Minimalna wersja systemów operacyjnych**
- **Opcje:** A) iOS 17 / watchOS 10; B) iOS 18 / watchOS 11 (Control Center API, Interactive Widgets, Live Activity); C) iOS 26.
- **Rekomendacja:** **Opcja B** (iOS 18 / watchOS 11). Status: **ZATWIERDZONA**.

### **DEC-07: Hierarchia źródeł wiedzy piekarskiej**
- **Opcje:**
  - *Opcja A (Rekomendacja):* 5 szczebli: Rachunek stechiometryczny/fizyczny (Tier 1) → Międzynarodowe normy piekarskie ICC/PN (Tier 1-2) → Klasyczne podręczniki mistrzowskie (Calvel, Hamelman, Suas, DiMuzio - Tier 3) → Autorytety rzemieślnicze (Tartine, Forkish - Tier 4) → Fora internetowe (Tier 5 - wyłącznie jako inspiracja, nigdy reguła obliczeniowa).
  - *Opcja B:* Traktowanie forów internetowych na równi z podręcznikami naukowymi.
- **Rekomendacja:** **Opcja A**. Status: **ZATWIERDZONA**.

### **DEC-08: Model danych i przechowywanie receptur**
- **Opcje:** A) Znormalizowany SQLite (WAL) z kluczami obcymi i otwartym eksportem JSON/CSV; B) Płaski plik JSON w sandboxie; C) Realm / CoreData.
- **Rekomendacja:** **Opcja A** (SQLite WAL). Status: **ZATWIERDZONA**.

### **DEC-09: Zakres darmowego rdzenia (Free Tier)**
- **Opcje:**
  - *Opcja A (Rekomendacja):* Darmowy kalkulator % na 1 bochenek, 1 aktywny profil zakwasu, podstawowy timer.
  - *Opcja B:* Całkowity paywall przed wejściem.
  - *Opcja C:* Darmowy kalkulator, płatny harmonogram i DDT.
- **Rekomendacja:** **Opcja A** (generuje organiczne rekomendacje w społecznościach). Status: **ZATWIERDZONA**.

### **DEC-10: Czas trwania okresu próbnego (Free Trial)**
- **Opcje:** A) 14 dni pełnego dostępu; B) 7 dni; C) brak trialu.
- **Rekomendacja:** **Opcja A** (cykl wypieku chleba trwa 2–3 dni; użytkownik musi upiec min. 2 bochenki, by docenić wartość). Status: **ZATWIERDZONA**.

---

## **Blok II — Ceny i Psychologia Zakupowa (DEC-11…DEC-20)**

### **DEC-11: Cennik subskrypcji i zakupu dożywotniego**
- **Rekomendacja:** 0,99 €/mc, 4,99 €/rok, 14,99 € Lifetime (w Polsce: 3,99 zł / 19,99 zł / 59,99 zł). Status: **ZATWIERDZONA**.

### **DEC-12: Zasada Praw Nabytych (Grandfathering)**
- **Rekomendacja:** Dotychczasowi posiadacze aplikacji z wczesnych wydań zachowują pełny dostęp do wszystkich dotychczasowych funkcji bez żadnych opłat na zawsze. Status: **ZATWIERDZONA**.

---

## **Blok III — Retrofit i Protokół Zbieżności v2.0 (DEC-41…DEC-46)**

### **DEC-41: Wdrożenie techniki zaparzania mąki Tangzhong / Yudane (Water Roux)**
- **Kontekst:** Wykryto brak w `src/core/preferments.ts` (POMINIĘTE-01). Zaparzanie mąki to kluczowa technika przedłużania świeżości i miękkości pieczywa drożdżowego i tostowego.
- **Opcje:**
  - *Opcja A (Rekomendowana):* Włączenie typu `'tangzhong'` (stosunek 1:5 w 65°C) oraz `'yudane'` (stosunek 1:1 we wrzątku 100°C) do silnika `calculatePrefermentBreakdown` z automatycznym bilansowaniem mąki i wody w recepturze.
  - *Opcja B:* Odłożenie do wersji 2.1 jako dodatkowy kalkulator.
- **Rekomendacja:** **Opcja A** (włączenie do standardu prefermentów w MVP v2.0). Status: **ZATWIERDZONA**.

### **DEC-42: Rozszerzenie kalkulatora o ciasta wzbogacane tłuszczem i cukrem (Enriched Doughs)**
- **Kontekst:** Wykryto brak w `DoughRecipeInput` (POMINIĘTE-02). Wypieki takie jak chałki, brioszki, bułki mleczne i panettone wymagają uwzględnienia tłuszczu (masło, oliwa) i cukru (miód, cukier).
- **Opcje:**
  - *Opcja A (Rekomendowana):* Dodanie opcjonalnych pól `fatPercentage?: number` i `sugarPercentage?: number` do `DoughRecipeInput`. W przypadku podania cukru > 8% silnik wyświetla ostrzeżenie o osmotycznym spowolnieniu drożdży i wydłuża czas fermentacji.
  - *Opcja B:* Pozostawienie kalkulatora wyłącznie dla chlebów czystych (Lean Doughs).
- **Rekomendacja:** **Opcja A** (opcjonalne rozszerzenie bez breaking changes). Status: **ZATWIERDZONA**.

### **DEC-43: Frakcjonowanie wody i asystent dolewania (Bassinage)**
- **Kontekst:** Wykryto brak rozbicia wody recepturowej w wynikach (POMINIĘTE-03).
- **Opcje:**
  - *Opcja A (Rekomendowana):* Gdy całkowita hydratacja ciasta wynosi $\ge 75\%$, aplikacja automatycznie dzieli wodę na `waterBaseGrams` (90–92% do autolizy i pierwszego zarobienia) oraz `bassinageWaterGrams` (8–10% do powolnego wmasowania pod koniec wyrabiania wraz z solą).
  - *Opcja B:* Podawanie tylko jednej sumarycznej wagi wody i pozostawienie techniki użytkownikowi w notatce.
- **Rekomendacja:** **Opcja A** (ogromna wartość edukacyjna dla domowych piekarzy, chroni przed utratą struktury ciasta). Status: **ZATWIERDZONA**.

### **DEC-44: Skorygowanie współczynnika Q10 w fermentacji zakwasowej do 2.15**
- **Kontekst:** Wykryto błąd BŁĄD-02 w `domain-rules.ts` i `reverse-scheduler.ts` (uproszczony czynnik 2.0). W symbiozie drożdży dzikich i bakterii kwasu mlekowego literatura mikrobiologiczna wskazuje $Q_{10} \approx 2.15$.
- **Opcje:**
  - *Opcja A (Rekomendowana):* Podstawienie wartości 2.15 w formule potęgowej: $factor = 2.15^{\frac{24 - T}{10}}$.
  - *Opcja B:* Pozostawienie sztywnego 2.0.
- **Rekomendacja:** **Opcja A** (zapewnia zgodność naukową Tier 2). Status: **ZATWIERDZONA**.

### **DEC-45: Wdrożenie tabeli zdarzeń asynchronicznych `pending_ops` w SQLite**
- **Kontekst:** Wymóg standardu Apps4Craft dla asynchronicznej komunikacji z zegarkami i asekuracji offline (POMINIĘTE-06).
- **Opcje:**
  - *Opcja A (Rekomendowana):* Utworzenie tabeli `pending_ops` w `sqlite-schema.ts` w bezpiecznej migracji transakcyjnej v2.0.
  - *Opcja B:* Pominięcie tabeli do czasu wdrożenia modułu Garmin.
- **Rekomendacja:** **Opcja A** (jednolita architektura od Dnia 1). Status: **ZATWIERDZONA**.

### **DEC-46: Dynamiczny predyktor szczytu zakwasu zależny od proporcji dokarmienia**
- **Kontekst:** Wykryto błąd BŁĄD-01 w `sourdough-physics.ts` (sztywny czas szczytu 5–9h bez znajomości ratio).
- **Opcje:**
  - *Opcja A (Rekomendowana):* Dodanie parametru `feedingRatio` do `calculateStarterPhase` i zapisanie go w profilu zakwasu (1:1:1 szczyt w 3–4h, 1:2:2 w 5–7h, 1:5:5 w 10–12h).
  - *Opcja B:* Pozostawienie sztywnego okna czasowego.
- **Rekomendacja:** **Opcja A** (eliminuje fałszywe powiadomienia i chroni przed przekwaszeniem zaczynu). Status: **ZATWIERDZONA**.

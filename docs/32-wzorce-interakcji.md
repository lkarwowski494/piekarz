# **Standard Wzorców Interakcji Kuchennych (docs/32-wzorce-interakcji.md)**
## Aplikacja: Piekarz (Crust) — Standard Apps4Craft Studio 2026
**Wersja:** 2.0-craft | **Status:** Kanon Interfejsu dla Deweloperów i Testerów

---

## **1. Misja Ergonomiczna i Aksjomaty Interfejsu**

Praca w kuchni piekarskiej diametralnie różni się od obsługi typowych aplikacji biurowych:
- Dłonie użytkownika są pokryte kleistym ciastem lub pyłem mącznym (*Flour & Sticky Hands*).
- Wokół panuje wysoka temperatura (piekarnik 240°C, gorąca para z garnka żeliwnego).
- Czas reakcji przy niektórych etapach (np. zdjęcie pokrywy garnka, wyjęcie po 20 min) jest krytyczny.
- Użytkownik często patrzy na ekran z odległości 1–2 metrów, trzymając w rękach miskę lub łopatę piekarską.

Z tego wynikają bezwzględne aksjomaty ergonomiczne:
1. **Zakaz wymuszania pisania na klawiaturze w trakcie aktywnego wypieku:** Wszelkie korekty czasu i odznaczenia etapów odbywają się za pomocą pojedynczych, gigantycznych przycisków lub gestów.
2. **Dolna Strefa Kciuka (Thumb Zone):** Wszystkie kluczowe akcje operacyjne umieszczane są w dolnych 30% ekranu.
3. **Pola Dotykowe min. 48–64 pt:** Każdy element klikalny musi mieć rzeczywiste pole dotyku minimum 48×48 pt (dla głównych akcji 60–64 pt).
4. **Tabularne Cyfry (`tabular-nums`):** Żaden zegar, gramatura ani procent nie ma prawa drgać ani zmieniać szerokości przy odliczaniu.
5. **Kontrast WCAG AAA (min. 7:1):** Pełna czytelność w ostrym słońcu oraz w półmroku piwnicy/chłodni.

---

## **2. Oficjalny Słownik 8 Terminów Interfejsu (Apps4Craft Glossary)**

Każdy deweloper, projektant i tester w projekcie Piekarz posługuje się ujednoliconym aparatem pojęciowym:

### 1. **Karta Zwijana Inline („Jedna Otwarta” / Wzorzec P16)**
- **Definicja:** Komponent kontenerowy grupujący logicznie powiązane parametry (np. `Karta 1: Zasyp mączny`, `Karta 2: Bassinage`, `Karta 3: Prefermenty`).
- **Zachowanie:** W stanie zwiniętym nagłówek prezentuje zwartą pigułkę podsumowującą (np. `500g mąki | 72% hydratacji`). Kliknięcie w nagłówek rozwija szczegóły, automatycznie zwijając pozostałe karty akordeonu.

### 2. **Pasek Akcji Kciuka (Thumb Action Bar)**
- **Definicja:** Przyklejona do dolnej krawędzi ekranu belka nawigacyjno-operacyjna z dominującym przyciskiem akcji.
- **Wymiary:** Wysokość 60–64 pt, pełna szerokość ekranu z bezpiecznym marginesem `safeAreaInsets.bottom`.
- **Zastosowanie:** Przycisk „Zatwierdź złożenie (+30 min)” w Stolnicy, „Do miski (Start)” w Kalkulatorze.

### 3. **Pigułka Parametru (Metric Pill)**
- **Definicja:** Zwarta, zaokrąglona kapsułka prezentująca wartość liczbową i jednostkę w stałej szerokości fontu (`tnum`).
- **Przykłady:** `[ 72.0% H2O ]`, `[ 25.4°C DDT ]`, `[ -5 min ]`, `[ 14% Strata ]`.
- **Wymiary:** Minimalna wysokość dotykowa 44 pt (poprzez `hitSlop: { top: 10, bottom: 10, left: 6, right: 6 }`).

### 4. **Widok Skupiony (Focused Active Execution View)**
- **Definicja:** Uproszczony, dedykowany tryb ekranu roboczego uruchamiany w trakcie trwania wypieku.
- **Zawartość:** Ukrywa tabele i konfiguratory. Eksponuje wyłącznie: (1) numer bieżącego etapu (np. `Krok 2/4: Coil Fold`), (2) gigantyczny zegar odliczający (font 52pt) oraz (3) Pasek Akcji Kciuka.

### 5. **Arkusz Dolny (Bottom Action Sheet)**
- **Definicja:** Półokienko wysuwane płynnie od dołu ekranu dla selektorów mąk, edycji profili zakwasów i ustawień.
- **Wymogi:** Zamknięcie gestem przeciągnięcia w dół (`swipe down`), nagłówek z lewym przyciskiem `Anuluj` i prawym `Zapisz`.

### 6. **Stolnica (Workbench View)**
- **Definicja:** Główny pulpit asystenta aktywnego wypieku.
- **Wymogi:** Automatyczna blokada wygaszania ekranu (`useKeepAwake`), odporność na ubicie aplikacji w tle z bezstratnym odzyskiem stanu z bazy SQLite.

### 7. **Pływak Czasowy (Floating Timer Capsule)**
- **Definicja:** Pływający wskaźnik dokowany w prawym górnym rogu ekranu, gdy użytkownik przegląda inne zakładki podczas aktywnego odliczania.
- **Zachowanie:** Jedno stuknięcie w pływak natychmiast przenosi użytkownika do Widoku Skupionego Stolnicy.

### 8. **Haptyka i Dźwięk Piekarski (Craft Haptics & Chime)**
- **Definicja:** System sensorycznych sprzężeń zwrotnych potwierdzających operacje bez konieczności patrzenia na ekran.
- **Wymogi:**
  - *Kliknięcie wartości / odhaczenie na wadze:* Krótki, mechaniczny impuls haptyczny `Haptics.impactAsync(Light)`.
  - *Koniec etapu / alert pary:* Tradycyjny, ciepły dźwięk dzwonka piekarskiego odtworzony jednorazowo (bez zapętlania i bez audioplayera w tle).

---

## **3. Dostępność i Wsparcie dla Apple Watch**

1. **VoiceOver i Etykiety Semantyczne (NFR-DOST):**
   - Każdy element aktywny posiada czytelną etykietę: `accessibilityLabel="Zatwierdź składanie ciasta i uruchom timer na 30 minut"`.
   - Zwijane karty posiadają atrybut `accessibilityState={{ expanded: boolean }}` informujący o stanie otwarcia.
2. **Integracja z Apple Watch (watchOS 11):**
   - Obsługa koronki Digital Crown do płynnej regulacji minut w locie.
   - Gest podwójnego stuknięcia palcami (*Double Tap*) do pauzowania i wznawiania timera bez kontaktu z ekranem.

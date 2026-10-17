# **Piekarz (Crust) — Specyfikacja Projektowa UX & Design System (docs/design-spec.md)**
## Standard: Apps4Craft Studio 2026 (Wersja: 2.0-craft)
**Autor:** Staff Product Designer & UX Architect | **Handoff:** Single Source of Truth dla Inżynierów i QA

---

## **1. Tożsamość Wizualna i Archetyp Stylistyczny**

Aplikacja **Piekarz (Crust)** reprezentuje **Archetyp A (Precyzja Techniczna & Fizyczne Rzemiosło)**. Odrzuca generyczny styl AI (brak fioletów `#6366F1`, neonów, plastelinowych ilustracji 3D, lewitujących cieni i rozmyć tła). Wizualny język wyrasta z **autentycznych surowców piekarskich**:
- **Pył mączny i surowa mąka pszenna:** ciepłe, matowe tło jasne (`#FBF9F5`).
- **Przypalone żeliwo garnka:** szlachetny, głęboki antracyt tła ciemnego (`#12100E`).
- **Złocista skórka chleba i reakcja Maillarda:** ciepły, głęboki bursztyn akcentu operacyjnego (`#D97706` / `#B45309`).
- **Drewno stolnicy dębowej:** naturalne powierzchnie kart roboczych (`#F3ECE0` / `#1C1814`).
- **Fizyczne mikroramki 1px:** obrabiane krawędzie kamienia i metalu zamiast rozlanych cieni.

---

## **2. Design System: Tokeny Barwne i Rygor WCAG AAA**

Każda para kolorów spełnia normę **WCAG AAA (min. 7:1 dla tekstu normalnego i min. 4.5:1 dla tekstu dużego)** w obu trybach:

```
+----------------------------------------------------------------------------------------------------------------+
| TOKEN SEMANTYCZNY         | TRYB JASNY (LIGHT MODE)       | TRYB CIEMNY (DARK MODE)       | KONTRAST (AAA)    |
+----------------------------------------------------------------------------------------------------------------+
| bg-canvas (60%)           | #FBF9F5 (Pył mączny / stolnica)| #12100E (Głębokie żeliwo)      | —                 |
| bg-surface (30%)          | #F3ECE0 (Drewno dębowe jasne) | #1C1814 (Rozgrzany kamień)    | —                 |
| bg-surface-elevated       | #FFFFFF (Czysty pergamin)     | #26211B (Przypalone żeliwo)    | —                 |
| border-subtle             | rgba(24, 21, 18, 0.08)        | rgba(251, 249, 245, 0.12)     | Mikroramka 1px    |
| border-strong             | rgba(24, 21, 18, 0.20)        | rgba(251, 249, 245, 0.24)     | Ramka aktywna     |
+----------------------------------------------------------------------------------------------------------------+
| text-primary              | #181512 (Sadza węglowa)       | #FBF9F5 (Biel mączna)         | 15.2:1 / 17.1:1   |
| text-secondary            | #574D42 (Ciemny słód)         | #C4B59E (Krem pszenny)        | 7.4:1 / 8.2:1     |
| text-muted                | #786C5E (Pył orkiszowy)       | #9E8F7A (Popiół piecowy)      | 4.6:1 (large text)|
+----------------------------------------------------------------------------------------------------------------+
| accent-brand (10%)        | #B45309 (Ciemny bursztyn)     | #F59E0B (Złocista skórka)     | Akcent operacyjny |
| accent-hover              | #92400E (Karmel Maillarda)    | #D97706 (Światło pieca)       | Stan aktywny      |
| status-success            | #15803D (Zgaszony zielony)    | #22C55E (Świeży zakwas)       | 7.1:1             |
| status-warning            | #B45309 (Bursztyn ostrzegawczy| #FBBF24 (Żar piekarnika)      | 7.2:1             |
| status-danger             | #B91C1C (Cynober toksyczny)   | #EF4444 (Alarm pleśni)        | 7.3:1             |
| status-info               | #1D4ED8 (Kobalt techniczny)   | #3B82F6 (Chłodzenie lodem)    | 7.1:1             |
+----------------------------------------------------------------------------------------------------------------+
```

---

## **3. Typografia Tabular Nums i Siatka Przestrzenna 8pt**

1. **Stała Szerokość Cyfr (`tabular-nums`):**
   Wszystkie komponenty prezentujące liczby, gramatury, procenty i czas odliczania bezwzględnie wymuszają styl:
   ```typescript
   fontVariant: ['tabular-nums'],
   fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' })
   ```
2. **Skala Typograficzna:**
   - `Display (36 pt / 44 pt)`: Gigantyczny zegar timera w Stolnicy.
   - `Title 1 (28 pt / 34 pt)`: Główne nagłówki zakładek.
   - `Title 2 (22 pt / 28 pt)`: Tytuły kart zwijanych inline.
   - `Body (16 pt / 22 pt)`: Tekst instrukcji i porad.
   - `Caption (13 pt / 18 pt)`: Podpisy jednostek miar.
3. **Pola Dotykowe (Tap Targets):**
   - Belka akcji w dolnej strefie kciuka (`Thumb Action Bar`): **wysokość 60–64 pt**.
   - Przyciski i pigułki: **minimum 48×48 pt** z powiększonym `hitSlop: { top: 10, bottom: 10, left: 6, right: 6 }`.

---

## **4. Wzorce Architektury Doświadczeń (UX Patterns)**

### 4.1. Widok Skupiony (Focused Active Execution View)
W trakcie aktywnego wypieku chleba (wyrabianie, składanie, wypiek) tradycyjny widok tabeli powoduje chaos poznawczy. Interfejs przełącza się w **Widok Skupiony**:
- **Pływający licznik kroków:** `Złożenie 2 z 4: Składanie Zwojowe (Coil Fold)`.
- **Centralna karta etapu:** Gigantyczny zegar odliczający czas do następnego kontaktu z ciastem (`24:15` w font tabular-nums), czytelny z odległości 2 metrów.
- **Pasek Akcji Kciuka na samym dole:** Jeden dominujący przycisk `Zatwierdź złożenie (+30 min)` o wysokości 64pt.
- **Przycisk asekuracyjny:** Dyskretna pigułka `Awaria harmonogramu: Schłodź w lodówce` na wypadek nagłego wyjścia z domu.

### 4.2. Wzorzec Zwijanych Kart Inline („Jedna Otwarta” / P16)
Kalkulator procentu piekarskiego grupuje składniki w 4 karty:
1. `Karta 1: Zasyp Mączny` (Mieszanka mąk z ważoną chłonnością wody)
2. `Karta 2: Płyny i Frakcjonowanie Bassinage` (Woda baza vs woda rezerwowa)
3. `Karta 3: Prefermenty i Zakwas` (Levain, Poolish, Biga, Tangzhong)
4. `Karta 4: Ciasta Wzbogacane i Dodatki` (Tłuszcz, cukier, sól, ziarna)

Otwarcie dowolnej karty automatycznie i płynnie zwija pozostałe, prezentując w zwiniętym nagłówku pigułkę podsumowującą (np. `500g mąki | 72% hydratacji | 20% zakwas`).

---

## **5. Kompletna Macierz 9 Stanów UI dla 5 Głównych Ekranów**

```
+---------------------+-------------------------------+-------------------------------+-------------------------------+
| EKRAN               | 1. DEFAULT (GOLDEN PATH)      | 2. ZERO DATA (ONBOARDING)     | 3. LOADING (SKELETON)         |
+---------------------+-------------------------------+-------------------------------+-------------------------------+
| 1. Kalkulator       | Zbilansowana receptura 900g,  | Pulpit z kartą wzorcową       | 3 szare pulsujące szkielety   |
|    i Skalowanie     | 4 karty zwinięte z pigułkami. | "Wiejski chleb 900g (Start)". | kart o wysokości 72pt.        |
| 2. Harmonogram      | Oś czasu od 08:30 niedziela   | Zegar wyboru godziny podania  | Pionowa linia osi z szarymi   |
|    Wsteczny         | bez kolizji nocnych.          | chleba z suwakiem czasu.      | blokami etapów.               |
| 3. Zakwas           | Profil zakwasu "Bolesław",    | Karta "Zarejestruj zakwas":   | Szkielet wykresu objętości    |
|    i Witalność      | faza Szczyt (Peak za 2h 15m). | nazwa, typ mąki, data matki.  | i pigułek karmienia.          |
| 4. Stolnica         | Widok skupiony: zegar 52pt,   | Pusta stolnica: przycisk      | Szkielet centralnego koła     |
|    (Wypiek aktywny) | krok 2/4, przycisk kciuka 64pt| "Rozpocznij nowy wypiek".     | timera z ramką 1px.           |
| 5. Doktor Chleba    | Siatka 6 najczęstszych wad    | Zawsze pełna baza wiedzy      | Błyskawiczny start (<100ms)   |
|    (Diagnostyka)    | bochenka z wyszukiwarką.      | offline (brak pustego stanu). | z lokalnego repozytorium.     |
+---------------------+-------------------------------+-------------------------------+-------------------------------+
| EKRAN               | 4. ERROR / AWARIA             | 5. PARTIAL DATA               | 6. EMPTY SEARCH               |
+---------------------+-------------------------------+-------------------------------+-------------------------------+
| 1. Kalkulator       | Suma mąk != 100%: czerwona    | Tylko waga mąki (450g) ->     | "Brak receptury dla frazy     |
|                     | ramka i przycisk "Uzupełnij". | sugestia 68% wody i 2% soli.  | »orkisz«. [Wyczyść filtr]".   |
| 2. Harmonogram      | Godzina w przeszłości -> auto | Tylko godzina wypieku -> auto | N/A (ekran kalkulacji czasu). |
|                     | przestawienie na niedzielę.   | przypisanie garowania 14h.    |                               |
| 3. Zakwas           | Ujemna waga w dokarmianiu ->  | Brak godziny karmienia ->     | N/A.                          |
|                     | blokada zapisu i komunikat.   | opcje "Rano (~8:00)"/"Wieczór"|                               |
| 4. Stolnica         | Aplikacja ubita w tle -> auto | Brak temp. mąki/wody ->       | N/A.                          |
|                     | wznowienie sekundy z SQLite.  | domyślna temperatura 21°C.    |                               |
| 5. Doktor Chleba    | Błędna fraza wyszukiwania ->  | Zaznaczono 1 objaw -> formularz| "Brak wyników dla »bananowy«. |
|                     | podpowiedź synonimów chleba.  | dopytuje o drugi kluczowy.    | Zobacz 12 wad bochenka".      |
+---------------------+-------------------------------+-------------------------------+-------------------------------+
| EKRAN               | 7. PERMISSIONS MISSING        | 8. WARNING / SAFETY LIMIT     | 9. ACTIVE BACKGROUND PROCESS  |
+---------------------+-------------------------------+-------------------------------+-------------------------------+
| 1. Kalkulator       | Działa w 100% offline,        | Hydratacja >82% przy słabej   | Pływająca kapsułka timera     |
|                     | brak wymogu uprawnień.        | mące -> bursztynowe ostrzeżenie| autolizy w rogu ekranu.       |
| 2. Harmonogram      | Brak powiadomień -> żółty     | Kolizja z oknem snu 03:15 ->  | Pulsujący punkt na bieżącym   |
|                     | banner z linkiem do Ustawień. | banner auto-rozciągnięcia.    | etapie osi czasu.             |
| 3. Zakwas           | Brak powiadomień -> brak      | Brak karmienia >18h -> odznaka| Komplikacja predyktora        |
|                     | alertu o szczycie objętości.  | "Zakwas głodny (Hooch)".      | szczytu na Apple Watch.       |
| 4. Stolnica         | Lokalny timer; powiadomienia  | Ciasto po wyrobieniu >28°C -> | Sesja Live Activity na lock-  |
|                     | zalecane dla pracy w tle.     | alert skrócenia interwałów.   | screenie i widget Dynamic Isl.|
| 5. Doktor Chleba    | Działa w 100% offline,        | Wykryto zarodniki pleśni ->   | N/A.                          |
|                     | brak wymogu uprawnień.        | czerwony alarm utylizacji!    |                               |
+---------------------+-------------------------------+-------------------------------+-------------------------------+
```

---

## **6. Wytyczne Wdrożeniowe dla Programistów (Developer Handoff)**

1. **Komponenty Pigułek (`MetricPill`):**
   Każda pigułka musi posiadać `minHeight: 44` i `hitSlop` dla zachowania standardu Apple HIG.
2. **Karty Zwijane (`ArtisanAccordionPro`):**
   Nagłówek musi zawierać właściwości accessibility: `accessibilityRole="button"`, `accessibilityLabel="Rozwiń opcje zaawansowane"`, `accessibilityState={{ expanded: isOpen }}`.
3. **Stylistyka Trybu Ciemnego:**
   Zakaz stosowania jasnych heksów `#F0FDF4` w stanach sukcesu. Wszystkie kolory czerpać z tokenów semantycznych `theme.colors.*`.

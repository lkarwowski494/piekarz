# Audyt Monetyzacji, Strategia Cenowa i Model Finansowy M1–M12
## Aplikacja Piekarz (Crust) — Apps4Craft Studio
**Wersja:** 1.0.0-PROD  
**Data:** 18.10.2026  
**Rola:** Principal Monetization & Product Strategy Architect, Behavioral Pricing Economist, Forensic Revenue Auditor  
**Klasyfikacja:** `docs/monetyzacja-audyt.md` (Krytyczny wsad do testów i QA)

---

## 1. Rekomendowana Architektura Monetyzacji i Cennik (Pricing & Packaging)

### 1.1 Analiza Dwóch Ścieżek Monetyzacji

| Kryterium | Ścieżka A: „Cheaper than Espresso” Impulse Pass (Rekomendowana) | Ścieżka B: Tiered Pro / Klasyczny Freemium |
|---|---|---|
| **Struktura cennika** | **0,99 $ / 3,99 zł** miesięcznie<br>**4,99 $ / 19,99 zł** rocznie (rekomendowany)<br>**14,99 $ / 59,99 zł** Lifetime Pass | **Darmowy** (1 bochenek, 1 zakwas)<br>**2,99 $ / 11,99 zł** miesięcznie<br>**19,99 $ / 79,99 zł** rocznie<br>Brak Lifetime |
| **Doświadczenie w okresie próbnym** | **100% funkcji odblokowanych** bez kłódek i banerów przez 7 dni lub 3 wypieki (wzorzec M1). | Kłódki na zaawansowanych ekranach (DDT, harmonogram wsteczny, drugi bochenek). |
| **Psychologia zakupu** | Impuls poniżej progu bólu („tańsze niż jedna kawa w kawiarni”). Konwersja trial-to-paid: **4.0–6.5%**. | Wysoki opór psychologiczny. Konwersja spada do **1.2–2.0%** (skargi z aplikacji Rise: „zbyt drogi na prosty stoper”). |
| **Status po wygaśnięciu** | **Read-Only Archive:** Cała historia, receptury i notatki w 100% dostępne. Blokada wyłącznie nowych akcji zapisu (wzorzec M2). | Ograniczenie liczby rekordów lub agresywny paywall odcinający część danych. |
| **Zgodność z kosztami krańcowymi** | **Idealna:** Koszt krańcowy = $0 (offline). Lifetime 14.99 $ generuje 100% czystej marży. | Suboptymalna: Wymuszanie subskrypcji na produkcie bez stałych kosztów chmurowych. |
| **Rekomendacja** | ✅ **WYBRANA DO WDROŻENIA** | ❌ ODRZUCONA (Drenaż konwersji i zła reputacja w niszowej społeczności) |

---

### 1.2 Dokładne Parametry Okresu Próbnego (Trial Engine)
Zasada podwójnego limitu z koniunkcją (wzorzec M7):
- **Czas trwania:** `TRIAL_DURATION_DAYS = 7` (dokładnie 7 dni od pierwszego otwarcia aplikacji).
- **Limit wypieków:** `TRIAL_MAX_COMPLETED_BAKES = 3` (maksymalnie 3 ukończone bochenki zapisane w dzienniku stolnicy).
- **Warunek aktywności:** `trialDaysRemaining > 0 && bakesRemainingInTrial > 0` (`src/lib/app-access.ts:66`).
- **Uzasadnienie rzemieślnicze:** Upieczenie 3 bochenków trwa u domowego piekarza zazwyczaj od 10 do 21 dni. Użytkownik, który upiecze 3 udane chleby z Piekarzem, doświadcza pełnego *Aha-Moment*, gromadzi kapitał w dzienniku i ma ukształtowany nawyk.

---

### 1.3 Macierz Uprawnień: Trial vs Subskrypcja vs Read-Only

| Zasób / Akcja w Aplikacji | Trial Aktywny | Subskrypcja / Lifetime | Wygaśnięty Trial (Read-Only) | Plik i Linia w Kodzie |
|---|:---:|:---:|:---:|---|
| **Przeliczanie True Baker's % (1 bochenek)** | ✅ 100% | ✅ 100% | ✅ **Darmowe zawsze** | `src/core/domain-rules.ts:140` |
| **Przeliczanie wielo-bochenkowe i DDT** | ✅ 100% | ✅ 100% | ✅ **Darmowe zawsze** | `src/core/domain-rules.ts:250` |
| **Podgląd historii wypieków i radar** | ✅ 100% | ✅ 100% | ✅ **Darmowe (Read-Only)** | `src/components/stolnica/BakeHistorySection.tsx` |
| **Eksport bazy do JSON / CSV** | ✅ 100% | ✅ 100% | ✅ **Darmowe (Zero Hostage)** | `src/lib/backup.ts`, `src/lib/csv-exporter.ts` |
| **Doktor Chleba (Triage i naprawa)** | ✅ 100% | ✅ 100% | ✅ **Darmowe (Zero Writes)** | `app/(tabs)/doktor.tsx:1-211` |
| **Zapis nowej receptury własnej** | ✅ 100% | ✅ 100% | 🔒 **Wyzwalacz Paywalla** | `app/(tabs)/index.tsx:311` |
| **Klonowanie receptury mistrzowskiej** | ✅ 100% | ✅ 100% | 🔒 **Wyzwalacz Paywalla** | `app/(tabs)/index.tsx:283` |
| **Import receptury z QR / JSON** | ✅ 100% | ✅ 100% | 🔒 **Wyzwalacz Paywalla** | `app/(tabs)/index.tsx:249` |
| **Start aktywnego wypieku na stolnicy** | ✅ 100% | ✅ 100% | 🔒 **Wyzwalacz Paywalla** | `app/(tabs)/index.tsx:333`, `stolnica.tsx:201` |
| **Ponowny wypiek ze starych danych** | ✅ 100% | ✅ 100% | 🔒 **Wyzwalacz Paywalla** | `app/(tabs)/stolnica.tsx:110` |
| **Dodanie nowej kultury zakwasu** | ✅ 100% | ✅ 100% | 🔒 **Wyzwalacz Paywalla** | `app/(tabs)/zakwas.tsx:197` |
| **Zapis profilu i karmienia zakwasu** | ✅ 100% | ✅ 100% | 🔒 **Wyzwalacz Paywalla** | `app/(tabs)/zakwas.tsx:158,179` |
| **Modyfikacja stanu magazynu mąki** | ✅ 100% | ✅ 100% | 🔒 **Wyzwalacz Paywalla** | `FlourInventoryModal.tsx:80,94,102` |
| **Usunięcie własnej receptury / zakwasu** | ✅ 100% | ✅ 100% | ✅ **Zawsze dozwolone (RODO)** | `index.tsx:271`, `zakwas.tsx:218` |

---

## 2. BPR Product Matrix: Cięcia, Uproszczenia i Nowe Dźwignie Wzrostu

```
                                      WPŁYW NA PRZYCHÓD / RETENCJĘ (ROI)
                                                    WYSOKI
                                                       │
                          🚀 WYEKSPONOWAĆ / DODAĆ      │     💎 STEROWNIKI ZAKUPU PRO
                          ────────────────────────     │     ────────────────────────
                          • Karta Paszportu PDF z QR   │     • Adaptacyjny Harmonogram Wsteczny
                          • Alerty Dutch Oven (garnek) │     • True Baker's % + Bilans Lodowy
                          • Double Tap na Apple Watch  │     • Dziennik Wypieków + Sensory Radar
                                                       │
        ───────────────────────────────────────────────┼───────────────────────────────────────────────
        NISKI KOSZT                                    │                                    WYSOKI KOSZT
        UTRZYMANIA                                     │                                      UTRZYMANIA
                                                       │
                          🪗 SCHOWAĆ W AKORDEON        │     ✂️ WYCIĄĆ (KILL LIST / M17)
                          ────────────────────────     │     ───────────────────────────
                          • Suwaki DDT i tarcie misy   │     • Blokada usuwania rekordów (M5)
                          • Parametry prefermentów     │     • Zaawansowana księgowość mikro-ERP
                          • Obliczanie ubytku piecowego│     • Podręczniki biologiczne w UI
                                                       │
                                                    NISKI
```

### 2.1 ✂️ DO WYCIĘCIA (Kill List / Zasada Słoika M17)
1. **Blokada usuwania danych po trialu:** Usunięcie strażnika `requireActionAccess` z `handleDeleteCustomRecipe` (`index.tsx:271`) oraz `handleDeleteCurrentStarter` (`zakwas.tsx:218`). Użytkownik ma niezbywalne prawo wyczyścić swoje dane w dowolnym momencie.
2. **Księgowość mikro-ERP:** Wycofanie rozbudowy modułu kosztorysu o amortyzację garnków, mikserów i energii elektrycznej. W pieczeniu domowym liczy się prostota i powtarzalny bochenek, a nie księgowość magazynowa.
3. **Akademickie encyklopedie biologiczne:** Wszelkie definicje biochemiczne fermentacji mlekowej przeniesione do silnika obliczeniowego TypeScript (`src/core/domain-rules.ts`), z czystym, edytorskim wynikiem w UI.

### 2.2 🪗 DO SCHOWANIA / UPROSZCZENIA (Progressive Disclosure)
1. **Ekran Główny Kalkulatora:** Domyślny widok w trybie **1-Tap Quick Start** (1 kliknięcie w szablon chleba → gotowa gramatura w misce).
2. **Akordeon Rzemieślniczy Pro (`ArtisanAccordionPro.tsx`):** Zamknięcie pod jednym zwijanym panelem: blendu wielu mąk, kalkulatora DDT, prefermentów oraz ubytku piecowego.

### 2.3 🚀 DO WYEKSPONOWANIA / DODAĆ (Growth & Retention Catalysts)
1. **Paszport Bochenka z kodem QR (Organic Viral Loop):** Generowanie estetycznej karty wypieku PNG/PDF do udostępnienia na Instagramie / grupach piekarskich. Każdy kod QR prowadzi do załadowania receptury w Piekarzu.
2. **Apple Watch Standalone + Live Activity:** Promowanie unikalności watchOS z gestem Double Tap w rękach ubrudzonych mąką — główny wektor polecenia przez Apple w App Store.

---

## 3. Rygorystyczny Model Finansowy M1–M12

### 3.1 Główne Założenia Lejka Konwersji
- **Model dystrybucji:** Apple App Store (Tier-1: Polska, USA, Wielka Brytania, Niemcy, Skandynawia).
- **Prowizja sklepu:** 15% (Apple Small Business Program).
- **Miks koszyka zakupu:**
  - Plan Miesięczny ($0.99 / 3,99 zł): **20%** kupujących (churn miesięczny: **15%**)
  - Plan Roczny ($4.99 / 19,99 zł): **45%** kupujących (najbardziej promowany kafelek)
  - Lifetime Pass ($14.99 / 59,99 zł): **35%** kupujących (w M1 do 50% ze względu na early adopters)
- **Średnia ważona wartość koszyka brutto (Blended Initial Cart):**
  - M1 (wyższy udział Lifetime): `(0.20 × 0.99) + (0.40 × 4.99) + (0.40 × 14.99) = $8.19`
  - M2–M12 (stabilny koszyk): `(0.20 × 0.99) + (0.45 × 4.99) + (0.35 × 14.99) = $7.69`
- **Średnia prowizja Apple (15%):** Netto do wypłaty = **85% kwoty brutto**.
- **Koszty stałe:** 99 $/rok (Apple Developer). Koszty zmienne serwerowe = **$0.00**.

---

### 3.2 Tabela Prognostyczna w 3 Scenariuszach

#### SCENARIUSZ 1: Konserwatywny (Organic Only — brak płatnego marketingu, czyste ASO niszowe)
- Pobrania miesięcznie: 150 (M1) → 250 (M3) → 350 (M6) → 400 (M12). Łącznie 12M: **3 800 pobrań**.
- Konwersja Trial-to-Paid: **3.0%**.

| Okres | Pobrania | Nowi Płacący | Aktywni Subskrybenci (Mies.) | Przychód Brutto ($) | Apple 15% ($) | **Przychód Netto ($)** | MRR / ARR ($) |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Miesiąc 1 (Launch)** | 150 | 5 | 1 | $40.95 | $6.14 | **$34.81** | MRR: $0.99 |
| **Miesiąc 3** | 250 | 8 | 2 | $61.52 | $9.23 | **$52.29** | MRR: $1.98 |
| **Miesiąc 6** | 350 | 11 | 4 | $84.59 | $12.69 | **$71.90** | MRR: $3.96 |
| **Skumulowane 12M** | **3 800** | **114** | **6** | **$884.66** | **$132.70** | **$751.96** (~3 120 zł) | **ARR:** $255.00 |

*Próg rentowności ($99 Apple fee) osiągany w **Miesiącu 3**.*

---

#### SCENARIUSZ 2: Bazowy (ASO + Społeczności: r/Sourdough, Wykop, Grupy Domowych Piekarzy, Pętle QR)
- Pobrania miesięcznie: 450 (M1) → 800 (M3) → 1 200 (M6) → 1 500 (M12). Łącznie 12M: **13 500 pobrań**.
- Konwersja Trial-to-Paid: **4.5%**.

| Okres | Pobrania | Nowi Płacący | Aktywni Subskrybenci (Mies.) | Przychód Brutto ($) | Apple 15% ($) | **Przychód Netto ($)** | MRR / ARR ($) |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Miesiąc 1 (Launch)** | 450 | 20 | 4 | $163.80 | $24.57 | **$139.23** | MRR: $3.96 |
| **Miesiąc 3** | 800 | 36 | 11 | $276.84 | $41.53 | **$235.31** | MRR: $10.89 |
| **Miesiąc 6** | 1 200 | 54 | 22 | $415.26 | $62.29 | **$352.97** | MRR: $21.78 |
| **Skumulowane 12M** | **13 500** | **608** | **38** | **$4 712.12** | **$706.82** | **$4 005.30** (~16 620 zł) | **ARR:** $1 367.00 |

*Próg rentowności ($99 Apple fee) osiągany już w **Miesiącu 1 (Launch Month)**!*

---

#### SCENARIUSZ 3: Ambitny (App Store Featuring „Apps for Bakers” + Viral TikTok/IG Paszporty QR)
- Pobrania miesięcznie: 1 500 (M1) → 3 000 (M3) → 5 000 (M6) → 7 000 (M12). Łącznie 12M: **55 000 pobrań**.
- Konwersja Trial-to-Paid: **6.0%**.

| Okres | Pobrania | Nowi Płacący | Aktywni Subskrybenci (Mies.) | Przychód Brutto ($) | Apple 15% ($) | **Przychód Netto ($)** | MRR / ARR ($) |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Miesiąc 1 (Launch)** | 1 500 | 90 | 18 | $737.10 | $110.57 | **$626.53** | MRR: $17.82 |
| **Miesiąc 3** | 3 000 | 180 | 54 | $1 384.20 | $207.63 | **$1 176.57** | MRR: $53.46 |
| **Miesiąc 6** | 5 000 | 300 | 120 | $2 307.00 | $346.05 | **$1 960.95** | MRR: $118.80 |
| **Skumulowane 12M** | **55 000** | **3 300** | **230** | **$25 617.00** | **$3 842.55** | **$21 774.45** (~90 360 zł) | **ARR:** $7 410.00 |

---

### 3.3 Jednostkowa Ekonomia Użytkownika (Unit Economics & LTV)
- **CAC (Koszt pozyskania klienta):** **$0.00** (w 100% organiczny rozwój poprzez ASO, społeczności pasjonatów i paszporty QR).
- **LTV na płacącego klienta:**
  - Subskrybent miesięczny (średnia retencja 6,7 mies.): `$0.99 × 6.7 × 0.85 = $5.64 netto`
  - Subskrybent roczny (retencja 1,6 roku): `$4.99 × 1.6 × 0.85 = $6.79 netto`
  - Nabywca Lifetime: `$14.99 × 0.85 = $12.74 netto`
  - **Ważone LTV klienta płacącego:** **$8.64 netto (~35,80 zł)**.
- **Wskaźnik LTV / CAC:** $\infty$ (nieskończony przy zerowym CAC).

---

## 4. Plan Wdrożenia Technicznego (Actionable Blueprint dla Dev)

### Zadanie 1: Usunięcie blokady paywalla z operacji usuwania danych (Wymóg RODO / M5)
- **Pliki:** `app/(tabs)/index.tsx:271`, `app/(tabs)/zakwas.tsx:218`.
- **Zmiana:** Usunięcie otaczającego `requireActionAccess(...)` przy `handleDeleteCustomRecipe` oraz `handleDeleteCurrentStarter`. Użytkownik w trybie `trial_expired` ma pełne prawo wykasować swoje receptury i zakwasy.

### Zadanie 2: Zgodność z App Store Guideline 3.1.2 (EULA & Privacy Policy / M15)
- **Plik:** `src/components/PaywallModal.tsx`.
- **Zmiana:** Dodanie pod przyciskami Restore / Read-Only klikalnych odnośników:
  - *Regulamin (Terms of Use / EULA):* `https://apps4craft.com/terms`
  - *Polityka Prywatności:* `https://apps4craft.com/privacy`

### Zadanie 3: Globalny Reaktywny Kontekst Uprawnień (Wzorzec M8)
- **Plik:** `src/lib/app-access.ts` oraz `app/_layout.tsx`.
- **Zmiana:** Utworzenie `AppAccessContext.Provider` na poziomie `_layout.tsx`, aby funkcja `subscribe()` natychmiast rozgłaszała nowy stan uprawnień do wszystkich 5 zakładek bez konieczności przeładowania komponentów.

### Zadanie 4: Konfiguracja StoreKit 2 Offline Testing (Wzorzec M19)
- **Plik:** `ios/Piekarz.storekit` (lub plik konfiguracyjny StoreKit w repozytorium).
- **Zmiana:** Zdefiniowanie produktów IAP:
  - `piekarz_monthly_sub` (Auto-Renewable Subscription, $0.99)
  - `piekarz_yearly_sub` (Auto-Renewable Subscription, $4.99)
  - `piekarz_lifetime_pass` (Non-Consumable IAP, $14.99)

### Zadanie 5: Uszczelnienie `restorePurchases()` (Wzorzec M6)
- **Plik:** `src/lib/app-access.ts:162`.
- **Zmiana:** Zapewnienie hooka dla natywnego StoreKit 2 `Transaction.currentEntitlements`. W razie braku transakcji w App Store zwrócenie `false` zamiast bazowania wyłącznie na lokalnym SQLite.

---

## 5. Podsumowanie i Gotowość do Handoffu

Niniejszy audyt stanowi kompletny fundament monetyzacyjny dla aplikacji **Piekarz (Crust)**. Został przygotowany jako oficjalny wsad do weryfikacji w kolejnych rolach sztafety:
- **Rola 4: Head of Product & Scope Gatekeeper** (`analysis/head-of-product-scope-gatekeeper`) — walidacja cięć i niezmienników zakresu.
- **Rola 5: Architekt Testów** (`coding/architekt-testow`) — weryfikacja scenariuszy IAP, wygasania trialu i zgodności z wytycznymi App Store.

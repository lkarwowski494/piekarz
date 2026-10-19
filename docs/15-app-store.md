# Karta Produktu App Store Connect — Piekarz (Crust)

Dokument wydawniczy przygotowany zgodnie ze standardem **BR-REL-019..022** i wytycznymi App Store Review Guidelines.

---

## 1. Metadane Aplikacji (Polski — PL)

| Pole | Wartość | Limit |
| :--- | :--- | :---: |
| **Nazwa** | `Piekarz — Chleb i Zakwas` | 30 zn. |
| **Podtytuł** | `Kalkulator chleba i 4-DDT` | 30 zn. |
| **Tekst promocyjny** | `Rzemieślniczy asystent wypieku chleba. Prawdziwy procent piekarski (True Baker's %), temperatura wody 4-DDT, harmonogram wsteczny ze Sleep Guard i 100% offline.` | 170 zn. |
| **Słowa kluczowe** | `chleb,zakwas,pieczenie,kalkulator,mąka,ddt,hydratacja,bochenek,piekarz,garnek` | 100 zn. |

### Pełny Opis (PL)
> Pełny, aktualny opis sklepu (PL i EN) jest w `docs/app-store-metadata-v2.md` (sekcje 1.2 i 2.2); skrót niżej opisuje ten sam stan kodu (M1-audytor-generalny-035, 2026-10-19).

Piekarz (Crust) prowadzi domowy wypiek chleba na zakwasie i na drożdżach od receptury do bochenka.

NAJWAŻNIEJSZE FUNKCJE:
• Prawdziwy Procent Piekarski (True Baker's %): rozbicie zakwasu i zaczynów (poolish, biga, pâte fermentée, levain) na mąkę i wodę oraz hydratacja całego ciasta.
• 4-DDT: temperatura wody do docelowej temperatury ciasta; masa lodu, gdy woda musiałaby mieć mniej niż 4 °C.
• Stolnica: etapy planu z Harmonogramu z minutnikiem każdego etapu, wypiek w garnku żeliwnym w dwóch fazach (pod pokrywką i bez pokrywki), wariant żytni bez składania; powiadomienie o końcu etapu, gdy zezwolisz na powiadomienia.
• Harmonogram Wsteczny ze Sleep Guard: plan od godziny, o której chleb ma być gotowy; ostrzeżenie, gdy etap wymagający Twoich rąk wypada w godzinach snu.
• Doktor Chleba: wybór objawów, diagnoza jednej z 9 wad (np. blada skórka, brak ucha) i 4 protokoły ratunkowe.
• Akademia Piekarza: 6 lekcji Szkoły Chleba i 12 technik.

100% OFFLINE-FIRST:
Obliczenia, plan i minutniki działają bez połączenia z internetem. Twoje receptury i notatki są zapisywane wyłącznie na Twoim urządzeniu. Zero reklam, zero śledzenia, zero telemetrii.

DOSTĘP:
Pełny dostęp daje subskrypcja miesięczna lub roczna (z możliwym bezpłatnym okresem próbnym jako ofertą wprowadzającą App Store) albo zakup dożywotni. Bez zakupu: przegląd historii wypieków oraz eksport i usunięcie własnych danych.

---

## 2. Metadane Aplikacji (Angielski — EN)

| Pole | Wartość | Limit |
| :--- | :--- | :---: |
| **Title** | `Crust — Sourdough & Bread` | 30 chars |
| **Subtitle** | `Baker's % & 4-DDT Calculator` | 30 chars |
| **Promotional Text** | `Artisan sourdough & bread baking assistant. True Baker's %, 4-DDT water temperature, reverse scheduler with Sleep Guard, and 100% offline-first privacy.` | 170 chars |
| **Keywords** | `bread,sourdough,baking,calculator,flour,hydration,baker,loaf,dutch oven,crust` | 100 chars |

---

## 3. Kategoryzacja i Wymogi Prawne

- **Kategoria Główna:** Food & Drink (Żywność i napoje)
- **Kategoria Poboczna:** Productivity (Produktywność)
- **Klasyfikacja Wiekowa:** 4+ (brak treści dla dorosłych, brak przemocy, brak hazardu)
- **Szyfrowanie (Export Compliance):** `ITSAppUsesNonExemptEncryption = false` (standardowe szyfrowanie HTTPS/systemowe, zwolnienie z ankiety)
- **Prywatność (Privacy Manifests):**
  - Tracking: `false`
  - Zbieranie danych: brak (Data Not Collected)
  - Required Reason APIs: `UserDefaults`, `FileTimestamp`, `SystemBootTime`, `DiskSpace`
- **Adres URL Polityki Prywatności:** `https://lkarwowski494.github.io/piekarz/privacy.html`
- **Adres URL Wsparcia:** `https://lkarwowski494.github.io/piekarz/support.html`

---

## 4. Instrukcja dla Testerów TestFlight (What to Test)

```text
Wersja 1.0.0 (Crust):
- Weryfikacja kalkulatora True Baker's % przy zmianie hydratacji.
- Wyliczenie temperatury wody metodą 4-DDT.
- Uruchomienie asystenta wypieku w garnku żeliwnym z timerem.
- Zaplanowanie harmonogramu wstecznego z testem Sleep Guard.
- Eksport bazy receptur do pliku JSON i kopii zapasowej.
```

---

## 5. Konfiguracja Sekretów CI w GitHub Actions

Wymagane wpisy w **Settings → Secrets and variables → Actions**:

1. `APPLE_TEAM_ID` — 10-znakowy identyfikator zespołu Apple Developer (np. `8NQ9GHY8GF`)
2. `ASC_KEY_ID` — identyfikator klucza App Store Connect API (np. `2X9R4274HG`)
3. `ASC_ISSUER_ID` — identyfikator wystawcy App Store Connect API (UUID)
4. `ASC_KEY_P8_BASE64` — zawartość klucza `.p8` zakodowana w Base64 (`base64 -w 0 AuthKey_*.p8`)

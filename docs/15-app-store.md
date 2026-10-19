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
Piekarz (Crust) to profesjonalne, bezkompromisowe narzędzie stworzone dla pasjonatów rzemieślniczego wypieku chleba na zakwasie oraz drożdżach.

NAJWAŻNIEJSZE FUNKCJE:
• Prawdziwy Procent Piekarski (True Baker's %): Automatyczne rozbicie zakwasu i prefermentów na czystą mąkę i wodę – koniec z rozbieżnościami w hydratacji bochenka.
• Precyzyjne 4-DDT: Wyliczanie dokładnej temperatury wody na podstawie temperatury mąki, otoczenia, zakwasu i tarcia misy.
• Asystent Wypieku Stolnica: Prowadzenie przez fazy pieczenia w garnku żeliwnym (para + karmelizacja) z odpornymi na tło timerami.
• Harmonogram Wsteczny ze Sleep Guard: Zaplanuj wypiek na konkretną godzinę. Algorytm chroni Twój sen, ostrzegając przed składaniem ciasta w środku nocy.
• Doktor Ciasta: Błyskawiczna identyfikacja problemów (rozlewanie się bochenka, blada skórka, brak ucha) z gotowymi planami ratunkowymi.
• Akademia Piekarza: 12 technik rzemieślniczych, atlas europejskich typów mąk i trening intuicji piekarskiej.

100% OFFLINE-FIRST:
Aplikacja działa w pełni lokalnie bez konieczności połączenia z internetem. Twoje receptury i notatki są zapisywane wyłącznie na Twoim urządzeniu. Zero reklam, zero śledzenia, zero telemetrii.

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
- Weryfikacja kalkulatora True Baker's % przy zmianie hydratacji (65%–85%).
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

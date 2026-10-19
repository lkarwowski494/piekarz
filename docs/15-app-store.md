# Karta Produktu App Store Connect — Piekarz (Crust)

Dokument wydawniczy przygotowany zgodnie ze standardem **BR-REL-019..022** i wytycznymi App Store Review Guidelines.

---

## 1–2. Metadane sklepu (PL, EN)

> Jedynym źródłem nazwy, podtytułu, tekstu promocyjnego, słów kluczowych i opisu w każdym języku jest `docs/app-store-metadata-v2.md` (sekcje 1 i 2). Ten dokument zawiera tylko konfigurację wydania niżej, żeby dwa teksty dla tej samej wersji się nie rozjeżdżały [M1-audytor-generalny-036; 10-wydanie-004].

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
2. `ASC_KEY_ID` — identyfikator klucza App Store Connect API, 10 znaków (np. `<KEY_ID>`)
3. `ASC_ISSUER_ID` — identyfikator wystawcy App Store Connect API (UUID)
4. `ASC_KEY_P8_BASE64` — zawartość klucza `.p8` zakodowana w Base64 (`base64 -w 0 AuthKey_*.p8`)

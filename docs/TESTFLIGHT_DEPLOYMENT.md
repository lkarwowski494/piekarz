# Wdrożenie do TestFlight — Piekarz (Crust) 🥖📲

Piekarz korzysta ze standaryzowanego w Apps4Brew Studio mechanizmu **Natywnego TestFlight CI** opartego o GitHub Actions (darmowe maszyny `macos-26` dla publicznych repozytoriów) oraz bezpośrednie API App Store Connect Apple (zgodnie z zasadą kosztu 0 zł i bez korzystania z płatnych subskrypcji chmurowych EAS).

---

## 1. Architektura Publikacji

```
                        PROCES WYDANIA TESTFLIGHT
┌─────────────────────────┐
│ Commit na master        │
│ 100% testów zielonych   │
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ GitHub Actions:         │
│ .github/workflows/      │
│ testflight.yml          │
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐      App Store Connect API Key
│ Maszyna macos-26        │ ───► (ASC_KEY_ID, ASC_ISSUER_ID, ASC_KEY_P8)
│ • npm run verify        │
│ • npx expo prebuild     │
│ • xcodebuild archive    │
│ • xcodebuild export     │
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ App Store Connect       │
│ • Przetwarzanie Apple   │ ───► TestFlight na Twoim iPhonie w 15–20 min!
└─────────────────────────┘
```

---

## 2. Wymagane Sekrety Repozytorium GitHub

Aby GitHub Actions mogło podpisać aplikację i wysłać ją bezpośrednio do Apple, w ustawieniach Twojego repozytorium GitHub:
👉 **Settings → Secrets and variables → Actions → New repository secret**

Muszą być zdefiniowane 3 sekrety (te same, z których korzysta Napar):

| Nazwa Sekretu | Skąd pobrać w App Store Connect | Format |
|---|---|---|
| `ASC_KEY_ID` | **Users and Access → Integrations → Keys** | 10-znakowy identyfikator klucza (np. `2X9R4274HG`) |
| `ASC_ISSUER_ID` | **Users and Access → Integrations → Keys** | Identyfikator wystawcy UUID (np. `57246542-96fe-1a63-e053-0824d011072a`) |
| `ASC_KEY_P8` | Plik `.p8` pobrany jednorazowo przy tworzeniu klucza | Zawartość pliku klucza API pobranego z panelu Apple Developer |

> [!NOTE]
> Jeśli te sekrety dodałeś już na poziomie organizacji lub konta GitHub (`lkarwowski494`), repozytorium `piekarz` może z nich korzystać automatycznie.

---

## 3. Rejestracja Aplikacji w App Store Connect (Jednorazowo)

Jeśli Piekarz nie został jeszcze założony w panelu Apple Developer:
1. Wejdź na [developer.apple.com/account](https://developer.apple.com/account) → **Identifiers** → Utwórz nowy **App ID**:
   - Description: `Piekarz - Crust Baker`
   - Bundle ID (Explicit): `com.apps4brew.baker`
2. Wejdź na [appstoreconnect.apple.com](https://appstoreconnect.apple.com) → **Apps** → Kliknij **+** (New App):
   - Platforms: `iOS`
   - Name: `Piekarz` (lub `Piekarz — Chleb i Zakwas`)
   - Primary Language: `Polski` (lub `Angielski`)
   - Bundle ID: Wybierz utworzony `com.apps4brew.baker`
   - SKU: `piekarz-app`
   - User Access: `Full Access`

---

## 4. Jak Uruchomić Wydanie TestFlight (1-Kliknięcie)

1. Wejdź na GitHubie w repozytorium: `https://github.com/lkarwowski494/piekarz`
2. Przejdź do zakładki **Actions** w górnym menu.
3. W lewym panelu wybierz workflow: **„TestFlight (Piekarz)”**.
4. Kliknij przycisk **„Run workflow”** (na gałęzi `master`).
5. GitHub Actions uruchomi maszynę Apple Mac:
   - Sprawdzi poprawność kodu i testów (`npm run verify`),
   - Wygeneruje natywny projekt iOS (`npx expo prebuild`),
   - Skompiluje i podpisze archiwum `.ipa`,
   - Wyśle build do Apple TestFlight.
6. Po 10–25 minutach Apple zakończy przetwarzanie buildu i powiadomienie pojawi się w Twojej aplikacji **TestFlight** na iPhonie!

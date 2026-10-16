# Progressive Disclosure & Model Monetyzacji „Cheaper than Espresso” 🥖☕

Dokumentacja architektoniczna standardu UX i silnika monetyzacji ekosystemu **Apps4Brew Studio** dla aplikacji **Piekarz (Crust)**.

---

## 1. Filozofia Kuchennego UX (Kitchen-Proof & Progressive Disclosure)

Aplikacje kuchenne Apps4Brew podlegają restrykcyjnemu standardowi ergonomii:
1. **Zasada Brudnego Kciuka (Dirty Thumb Rule):**
   - Pola dotykowe wynoszą $\ge 52\,\text{pt}$.
   - Haptyka (`expo-haptics`) przy każdej zmianie nastawu i odznaczeniu składnika.
   - Blokada usypiania ekranu (`KeepAwake`) w trakcie prowadzenia wypieku na Stolnicy.
2. **Czas do rozpoczęcia ważenia $< 30$ sekund:**
   - Domyślny ekran 1-Tap (`DoMiskiScaleCard.tsx`):
     - Chipy szybkiego wyboru pieczywa (Pszenno-żytni, Bagietka, Pizza, Żytni 100%).
     - Prosty stepper bochenków `[-] N bochenków [+]`.
     - Karta wagowa „⚖️ Wsyp do miski na wagę”: lista mąki, wody, zakwasu i soli z checkboxem odhaczania i przekreśleniem odważonego składnika.
     - Główny przycisk CTA: `🚀 Rozpocznij wypiek z asystentem`.
3. **Zwijany Akordeon PRO (`ArtisanAccordionPro.tsx`):**
   - Parametry rzemieślnicze (4-DDT z tarciem miksera, matematyka lodu, atlas chłonności mąk, prefermenty Poolish/Biga/Levain, strata piecowa) są schowane w estetycznym, zwijanym panelu, chroniąc początkujących przed przeciążeniem kognitywnym.

---

## 2. Model Monetyzacji „Cheaper than Espresso”

Zgodnie z manifestem Apps4Brew Studio:
> *„Kupujesz aplikację za mniej niż koszt jednego espresso w modnej kawiarni — z gwarancją 100% Offline-First, brakiem reklam i wieczną własnością swoich notatek.”*

### Siatka Cenowa
- **$0.99 USD / miesiąc** (~4,49 zł) — nielimitowany dostęp z możliwością rezygnacji w dowolnym momencie.
- **$4.99 USD / rok** (~22,99 zł) — **Główna oferta ekosystemowa (~1,91 zł / miesiąc)**.
- **$14.99 USD Lifetime** (~69,99 zł) — zakup jednorazowy, dożywotni spokój na zawsze.

### Zasada Zero Podziału na Free i Pro
- W aplikacji **nie ma** sztucznie zablokowanych funkcji ani irytujących plakietek „tylko w PRO”.
- W okresie próbnym (Free Trial: 7 dni lub pierwsze 3 pełne wypieki) użytkownik ma dostęp do **100% możliwości aplikacji** (odwrócony harmonogram, Doktor Chleba, procedury Dough Recovery, kalkulatory DDT, prefermenty, generowanie etykiet PDF).

### Zasada Historii Zawsze Czytelnej (Read-Only)
- Po wygaśnięciu okresu próbnego i braku zakupu użytkownik **nigdy nie traci dostępu do swoich danych**.
- Cała historia wypieków, notatek, ocen miękiszu, radarów sensorycznych i profili zakwasu pozostaje **w 100% czytelna i bezpłatna (tryb Read-Only)**.
- Blokowane są wyłącznie akcje tworzenia nowych wpisów / startu nowego wypieku, co wywołuje `PaywallModal.tsx`.

---

## 3. Architektura Kodu (`src/lib/app-access.ts`)

```typescript
export type SubscriptionTier = 'none' | 'monthly' | 'yearly' | 'lifetime';
export type AccessStatus = 'trial_active' | 'trial_expired' | 'subscribed';

export interface AppAccessInfo {
  status: AccessStatus;
  trialStartedAt: number;
  trialDaysRemaining: number;
  completedBakesCount: number;
  bakesRemainingInTrial: number;
  subscriptionTier: SubscriptionTier;
  isSubscribed: boolean;
  canCreateNewBake: boolean;
  canEditRecipes: boolean;
  isHistoryReadOnly: boolean;
}
```

Persystencja w SQLite (`/Library/SQLite/piekarz.db`):
- Tabela `app_access` przechowuje znacznik czasu rozpoczęcia trialu, liczbę ukończonych wypieków oraz aktywny poziom subskrypcji.
- Pamięciowy fallback (`memAppAccess`) gwarantuje 100% niezawodności w środowiskach testowych Jest i SSR.

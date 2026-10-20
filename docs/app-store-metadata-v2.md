# Pakiet Metadanych App Store Connect v2.0 — Piekarz (Crust)

> **Dokument:** Apps4Craft Studio — App Store Operations Specyfikacja v2.0  
> **Data:** 18 października 2026 r.  
> **Aplikacja:** Piekarz (Crust)  
> **Bundle Identifier:** `com.apps4brew.baker`  
> **SKU:** `piekarz-app-v2`  
> **Kategoria Główna:** Food & Drink (Żywność i napoje)  
> **Kategoria Poboczna:** Productivity (Produktywność)  
> **Klasyfikacja Wiekowa:** 4+ (Brak ograniczeń wiekowych)  
> **Jedyne źródło metadanych sklepu** (nazwa, podtytuł, tekst promocyjny, słowa kluczowe, opis — każdy język): ten plik. `docs/15-app-store.md` tylko odsyła tutaj; test `tests/store-metadata.test.ts` pilnuje limitu słów kluczowych (100 B) w każdym języku [M1-audytor-generalny-036]. Słowa kluczowe pozostałych języków: przekład 095 (partia 4).  
> **Nazwy, podtytuły i słowa kluczowe wszystkich lokalizacji strony:** §5 (M5 widoczność w sklepie, D-053…D-055, 2026-10-20); mapa storefrontów i hipotezy pomiaru: `docs/wydanie/widocznosc.md`.  

---

## 1. Karta Produktu App Store (Język Polski — PL)

### 1.1. Metadane Główne (Rygor Limitów Apple)

| Pole | Treść | Liczba znaków | Limit Apple |
| :--- | :--- | :---: | :---: |
| **Nazwa aplikacji (Name)** | `Piekarz: Chleb na zakwasie` | **26** | max 30 |
| **Podtytuł (Subtitle)** | `Plan i kalkulator wypieku` | **25** | max 30 |
| **Tekst promocyjny (Promotional Text)** | `Rzemieślniczy asystent wypieku chleba na zakwasie. Prawdziwy procent piekarski (True Baker's %), 4-DDT, kroki z Twojego planu na stolnicy i 100% prywatności offline.` | **165** | max 170 |
| **Słowa kluczowe (Keywords)** | `bochenek,pizza,hydratacja,ciasto,drożdże,żytni,lewain,biga,poolish,minutnik,receptura,sourdough` | **98** | max 100 B (bajty UTF-8; bez wyrazów z nazwy i podtytułu) |

### 1.2. Pełny Opis Aplikacji (Description PL — 3 745 / 4 000 znaków)

```text
Piekarz (Crust) prowadzi domowy wypiek chleba od receptury do bochenka: liczy ilości składników, układa plan od godziny, o której chleb ma być gotowy, i prowadzi Cię etapami tego planu. Działa bez konta i bez internetu, bez reklam i bez śledzenia.

CO ROBI PIEKARZ

1. PRAWDZIWY PROCENT PIEKARSKI (TRUE BAKER'S %)
Piekarz rozbija zakwas na mąkę i wodę i liczy hydratację całego ciasta. W panelu PRO rozbija też zaczyn (poolish, biga, pâte fermentée, levain) na mąkę i wodę w zaczynie oraz resztę do miski. Wybierasz jedną z 15 receptur bazowych albo własną, ustawiasz liczbę bochenków, a karta „Do miski” podaje gramy mąki, wody, zakwasu, soli i drożdży.

2. TEMPERATURA WODY (4-DDT)
Ustawiasz docelową temperaturę ciasta, a Piekarz wylicza temperaturę wody wzorem 4-DDT. Gdy woda musiałaby mieć mniej niż 4 °C, podaje masę lodu w gramach; gdy wynik przekracza 45 °C, ostrzega.

3. STOLNICA: ETAPY Z TWOJEGO PLANU
Stolnica prowadzi Cię etapami planu z Harmonogramu, z minutnikiem każdego etapu: dokarmienie zakwasu, autoliza, wymieszanie z solą i zakwasem, fermentacja ze składaniami, formowanie wstępne, odpoczynek na desce, formowanie, garowanie w lodówce, nagrzewanie pieca, wypiek w garnku żeliwnym w dwóch fazach (pod pokrywką i bez pokrywki) i studzenie. Minutnik poprawisz o 10 sekund albo 5 minut. Gdy zezwolisz na powiadomienia, Piekarz da znać o końcu etapu także przy zablokowanym telefonie, a ekran Stolnicy nie gaśnie w trakcie wypieku. Dla ciasta, w którym mąka żytnia stanowi więcej niż 50% mąki, Stolnica prowadzi wariant żytni bez składania: ciasto po uformowaniu rośnie w formie i w niej się piecze, a czasy etapów pochodzą z Twojego planu.

4. HARMONOGRAM WSTECZNY ZE SLEEP GUARD
Wybierz dzień i godzinę, o której chleb ma być gotowy (np. jutro 08:30), a Harmonogram poda godzinę startu każdego etapu. Czas fermentacji dopasowuje do temperatury w kuchni. Sleep Guard ostrzeże, gdy etap wymagający Twoich rąk wypada w godzinach snu (domyślnie 23:00–06:30), i zaproponuje dłuższy czas w lodówce, który omija noc.

5. ZAKWAS
Prowadzisz kilka zakwasów z wiekiem, hydratacją i miejscem przechowywania. Kalkulator dokarmiania podaje gramy dla proporcji 1:1:1, 1:2:2, 1:3:3 albo 1:5:5, zapisuje karmienie i szacuje okno szczytu aktywności. Gdy zezwolisz na powiadomienia, przypomni o karmieniu. Karta bezpieczeństwa stosuje zasadę ostrożności: każdy nalot, przebarwienie albo zgniły zapach oznacza zalecenie, by zakwas wyrzucić.

6. DOKTOR CHLEBA
Miękisz jest zbity, a skórka blada? Zaznacz objawy, a Doktor Chleba wskaże jedną z 9 wad, wyjaśni przyczynę i poda kroki na następny wypiek. Cztery protokoły ratunkowe pomagają w trakcie fermentacji; przy każdym jednym dotknięciem wczytasz do Kalkulatora recepturę awaryjną (np. focaccię z przerośniętego ciasta). Doktora otwierasz ze Stolnicy albo Zakwasu, a po ocenie wypieku na 1 lub 2 gwiazdki Piekarz sam go zaproponuje. Z Doktora wchodzisz do Akademii: 6 lekcji Szkoły Chleba i 12 technik.

7. DZIENNIK WYPIEKÓW
Po wypieku oceniasz bochenek: gwiazdki, miękisz, skórka i profil smaku. Historia pokazuje statystyki, a „Piecz ponownie” wczytuje recepturę do Kalkulatora.

8. OFFLINE I PRYWATNOŚĆ
Bez reklam, bez śledzenia, bez analityki, bez konta. Receptury, dziennik i notatki są zapisane tylko na Twoim urządzeniu i aplikacja ich nie wysyła; eksport (JSON, CSV), kod QR i wydruk uruchamiasz sam. Obliczenia, plan i minutniki działają bez internetu.

DOSTĘP I ZAKUP
Pełny dostęp daje subskrypcja miesięczna lub roczna albo jednorazowy zakup dożywotni w App Store. Subskrypcja może zaczynać się bezpłatnym okresem próbnym (oferta wprowadzająca App Store dla uprawnionych). Bez zakupu przeglądasz historię wypieków oraz eksportujesz i usuwasz swoje dane.

Języki: polski i angielski.
```

---

## 2. Karta Produktu App Store (Język Angielski — EN-US)

### 2.1. Metadane Główne (Apple Limit Rigor)

| Pole | Treść | Liczba znaków | Limit Apple |
| :--- | :--- | :---: | :---: |
| **App Name** | `Baker: Sourdough Bread Planner` | **30** | max 30 |
| **Subtitle** | `Dough Calculator & Bake Timer` | **29** | max 30 |
| **Promotional Text** | `Artisan sourdough baking companion. True Baker's %, 4-DDT water temperature, bench steps from your plan, reverse scheduler with Sleep Guard, and 100% offline privacy.` | **166** | max 170 |
| **Keywords** | `starter,hydration,schedule,levain,tracker,feeding,loaf,recipe,rye,pizza,proof,flour,percentage` | **94** | max 100 B (UTF-8 bytes; no words from name or subtitle) |

### 2.2. Pełny Opis Aplikacji (Description EN — 3 879 / 4 000 znaków)

```text
Crust guides home bread baking from recipe to loaf: it calculates ingredient amounts, builds a plan from the time you want the bread ready, and walks you through the stages of that plan. It works without an account and without the internet, with no ads and no tracking.

WHAT CRUST DOES

1. TRUE BAKER'S PERCENTAGE
Crust splits your starter into flour and water and calculates the hydration of the whole dough. In the PRO panel it also splits a preferment (poolish, biga, pâte fermentée, levain) into the flour and water in the preferment and the rest that goes into the bowl. Pick one of 15 base recipes or your own, set the number of loaves, and the "Into the bowl on scale" card gives the grams of flour, water, starter, salt and yeast.

2. WATER TEMPERATURE (4-DDT)
Set your desired dough temperature and Crust calculates the water temperature with the 4-DDT formula. When the water would have to be below 4 °C, it gives the ice weight in grams; when the result is above 45 °C, it warns you.

3. WORKBENCH: STAGES FROM YOUR PLAN
The Workbench guides you through the stages of your plan from the Schedule, with a timer for every stage: starter feed, autolyse, mixing with salt and starter, bulk fermentation with folds, pre-shape, bench rest, shaping, cold proof in the fridge, oven preheat, Dutch oven baking in two phases (lid on and lid off) and cooling. You can correct the timer by 10 seconds or 5 minutes. If you allow notifications, Crust tells you when a stage ends even when your phone is locked, and the Workbench screen stays on during a bake. For dough in which rye flour makes up more than 50% of the flour, the Workbench runs a rye variant with no folding: after shaping, the dough rises in a tin and is baked in it, with stage times taken from your plan.

4. REVERSE SCHEDULER WITH SLEEP GUARD
Choose the day and time you want the bread ready (e.g. tomorrow 08:30) and the Schedule gives the start time of every stage. It adjusts fermentation time to your kitchen temperature. Sleep Guard warns you when a hands-on stage falls in your sleeping hours (23:00–06:30 by default) and suggests a longer time in the fridge that avoids the night.

5. STARTER
Keep several starters with their age, hydration and storage place. The feeding calculator gives grams for 1:1:1, 1:2:2, 1:3:3 or 1:5:5 ratios, records the feeding and estimates the peak activity window. If you allow notifications, it reminds you to feed. The safety card follows a precautionary rule: any film, discoloration or rotten smell means the advice is to throw the starter away.

6. BREAD DOCTOR
Dense crumb and a pale crust? Mark the symptoms and the Bread Doctor points to one of 9 defects, explains the cause and gives steps for your next bake. Four recovery protocols help during fermentation; with each one, a single tap loads a backup recipe into the Calculator (e.g. focaccia from over-proofed dough). You open the Doctor from the Workbench or Sourdough tab, and after you rate a bake 1 or 2 stars Crust suggests it. From the Doctor you enter the Baker Academy: 6 Bread School lessons and 12 techniques.

7. BAKE LOG
After a bake you rate the loaf: stars, crumb, crust and flavor profile. The history shows statistics, and "Bake Again" loads the recipe into the Calculator.

8. OFFLINE AND PRIVACY
No ads, no tracking, no analytics, no account. Recipes, the log and notes are stored only on your device and the app does not send them; you start export (JSON, CSV), QR code and printing yourself. Calculations, the plan and timers work without the internet.

ACCESS AND PURCHASE
Full access comes with a monthly or yearly subscription or a one-time lifetime purchase on the App Store. A subscription may start with a free trial (App Store introductory offer for eligible users). Without a purchase you can browse your bake history and export and delete your data.

Languages: Polish and English.
```

---

## 3. Specyfikacja 5 Zrzutów Ekranu (Screenshots Frame Spec)

Zgodnie z wytycznymi App Store, przygotowano specyfikację 5 kluczowych ramek promocyjnych dla ekranów **iPhone 6.9" (1320 × 2868 px)** oraz **iPhone 6.5" / 6.7" (1290 × 2796 px)**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ARCHITEKTURA 5 ZRZUTÓW APP STORE                │
├──────────────┬──────────────┬──────────────┬──────────────┬────────────┤
│   RAMKA 1    │   RAMKA 2    │   RAMKA 3    │   RAMKA 4    │  RAMKA 5   │
│              │              │              │              │            │
│  KALKULATOR  │   STOLNICA   │   DOKTOR     │ HARMONOGRAM  │ USTAWIENIA │
│  TRUE % DDT  │ KROKI PLANU  │ RATUNEK      │ SLEEP GUARD  │  OFFLINE   │
└──────────────┴──────────────┴──────────────┴──────────────┴────────────┘
```

Podpisy i widoki opisują wyłącznie ekrany tej wersji (DEC-04 a, 2026-10-19); wartości na ekranie biorą się z danych przykładowych w chwili zrzutu, nie z tego dokumentu.

### Ramka 1: Prawdziwy Procent Piekarski i Temperatura Wody 4-DDT
- **Główny nagłówek (PL):** *Precyzyjna hydratacja i woda DDT*
- **Podtytuł (PL):** *Automatyczne rozbicie zakwasu na mąkę i wodę netto*
- **Main Headline (EN):** *True Baker's % & 4-DDT Water Temperature*
- **Sub-headline (EN):** *Starter split into flour and water, ice weight in grams*
- **Widok w ramce:** Ekran Kalkulatora (`app/(tabs)/index.tsx`) z kartą „Do miski na wagę” i otwartym panelem PRO z wyliczoną temperaturą wody.

### Ramka 2: Stolnica — Etapy Planu i Garnek Żeliwny
- **Główny nagłówek (PL):** *Stolnica: etapy z Twojego planu*
- **Podtytuł (PL):** *Kroki z Twojego planu i stoper garnka żeliwnego*
- **Main Headline (EN):** *Workbench: Stages from Your Plan*
- **Sub-headline (EN):** *Lid-on steam phase and lid-off browning in a Dutch oven*
- **Widok w ramce:** Ekran Stolnicy (`app/(tabs)/stolnica.tsx`) w trakcie Fazy 1 (pod pokrywką, 240 °C, minutnik do zdjęcia pokrywy).

### Ramka 3: Doktor Chleba i Receptura Awaryjna
- **Główny nagłówek (PL):** *Doktor Chleba: objawy, przyczyna, ratunek*
- **Podtytuł (PL):** *Receptura awaryjna jednym dotknięciem w Kalkulatorze*
- **Main Headline (EN):** *Bread Doctor: Symptoms, Cause, Rescue*
- **Sub-headline (EN):** *Diagnosis for over-proofing, pale crust and gummy crumb*
- **Widok w ramce:** Ekran Doktora (`app/(tabs)/doktor.tsx`) z rozwiniętym protokołem ratunkowym „Przerośnięte ciasto” i przyciskiem „Załaduj do Kalkulatora”.

### Ramka 4: Harmonogram Wsteczny ze Sleep Guard
- **Główny nagłówek (PL):** *Harmonogram wsteczny ze Sleep Guard*
- **Podtytuł (PL):** *Ciepły chleb na 08:30 rano bez zarywania nocy*
- **Main Headline (EN):** *Reverse Scheduler with Sleep Guard*
- **Sub-headline (EN):** *Warm bread at 08:30 AM without waking up at midnight*
- **Widok w ramce:** Ekran Harmonogramu (`app/(tabs)/harmonogram.tsx`) z osią czasu etapów i zielonym banerem „Ochrona snu aktywna (Sleep Guard)” (okno snu 23:00 – 06:30).

### Ramka 5: Offline i Prywatność
- **Główny nagłówek (PL):** *100% Offline-First. Twoja kuchnia, Twoje dane.*
- **Podtytuł (PL):** *Zero reklam, zero telemetrii, dane tylko w telefonie*
- **Main Headline (EN):** *100% Offline-First. Total Privacy.*
- **Sub-headline (EN):** *No ads, zero telemetry, data only on your phone*
- **Widok w ramce:** Ekran Ustawień: sekcja „Kopia zapasowa” (eksport, import, automatyczna rotacja 10 ostatnich kopii) i sekcja „Baza danych i bezpieczeństwo” (telemetria 0%).

---

## 4. Privacy Nutrition Label & Zgodność z Apple Guidelines

### 4.1. Privacy Nutrition Label (App Store Connect)
- **Data Used to Track You:** `None` (Aplikacja nie śledzi użytkownika).
- **Data Linked to You:** `None` (Brak kont użytkowników, brak profili).
- **Data Not Linked to You:** `None` (Aplikacja nie przesyła żadnych danych do sieci).
- **Oficjalna Kwalifikacja:** **„Data Not Collected”** (Najwyższa możliwa ocena prywatności Apple).

### 4.2. In-App Purchases (IAP) & Monetyzacja

> Zastąpione 2026-10-19 (DEC-01 d, M1-audytor-generalny-009): dawny „Free Tier” z okresem próbnym liczonym przez aplikację i dawne ceny w tym miejscu nie obowiązują; historia zmian w git. Identyfikatory produktów są w `src/lib/platnosci/konfiguracja.ts` (test `tests/oferta-dokumenty.test.ts`).

- **Bez zakupu:** przegląd historii wypieków oraz odczyt, eksport i usunięcie własnych danych. Każda inna funkcja otwiera ekran zakupu.
- **Produkty (App Store Connect, jedna grupa subskrypcji dla dwóch pierwszych):**
  1. `com.apps4brew.baker.pro.monthly` — subskrypcja miesięczna, oferta wprowadzająca: bezpłatny okres próbny 14 dni.
  2. `com.apps4brew.baker.pro.yearly` — subskrypcja roczna, oferta wprowadzająca: bezpłatny okres próbny 14 dni.
  3. `com.apps4brew.baker.pro.lifetime` — zakup dożywotni (Non-Consumable), bez okresu próbnego.
- **Ceny:** ustawia właściciel w App Store Connect (DEC-01 d: 0,99 / 6,99 / 14,99 USD; ceny regionalne według bramki wariantów, np. PL 4,99 / 29,99 / 79,99 zł). Aplikacja pokazuje wyłącznie `displayPrice` z App Store.
- **Okres próbny:** tylko oferta wprowadzająca App Store (jedna na grupę subskrypcji, dla uprawnionych); aplikacja nie liczy dni i pokazuje ofertę tylko uprawnionym (`isEligibleForIntroOfferIOS`).
- **Przywracanie zakupów:** przycisk *Przywróć zakupy* na ekranie zakupu (`src/components/PaywallModal.tsx`) wywołuje synchronizację App Store.

### 4.3. Instrukcja dla Apple App Review Team (Review Notes)

Notatki są po angielsku, bo recenzent używa interfejsu EN; nazwy przycisków są wartościami słownika EN (`src/lib/i18n-en/`), a przykładowa kopia przechodzi `parseAndValidateBackup` (test `tests/store-metadata.test.ts`) [M1-audytor-generalny-078].

```text
Dear App Review Team,

Piekarz (Crust) is a 100% offline bread-baking assistant. There is no sign-in, no account and no network use; all data stays on the device.

1. PURCHASES AND FREE TRIAL
Access to the features requires a monthly or yearly subscription (one subscription group; introductory offer: free trial) or a lifetime purchase. Without a purchase, only bake history browsing and reading, exporting and deleting your own data work.
To see the features: sign in with a sandbox account, tap any feature (for example the Calculator tab), choose the monthly or yearly plan on the purchase screen and tap "Try 14 days". The trial is the App Store introductory offer, shown only to eligible accounts; the app does not count days itself.
Restore purchases: "Restore Purchases" at the bottom of the purchase screen, and in Settings > Purchases.

2. DATA EXPORT AND IMPORT (works without a purchase)
a) Open the Calculator tab and tap "Settings" at the top right.
b) In the "Backup" section tap "Export to File" to share a JSON backup file.
c) Tap "Import from File". A field "Paste JSON backup file content:" appears.
d) Paste the contents of an exported file, or this sample with one starter:
{"format":"piekarz-backup","schemaVersion":1,"exportedAt":"2026-10-20T08:00:00.000Z","state":{"bakes":[],"starters":[{"id":"review-starter","name":"Review Starter","flourType":"rye","hydration":100,"birthDate":1760947200000,"storageState":"ROOM_TEMP"}],"customRecipes":[]}}
e) Tap "Confirm import". Import replaces the current data; the app first saves a safety copy on the device. With the trial active, the imported starter appears in the Sourdough tab.

3. OTHER FEATURES THAT ARE EASY TO MISS
- Schedule tab: enter the time the bread should be ready; the app plans the steps backwards and Sleep Guard moves hands-on steps out of your sleep hours.
- Workbench tab: guided bake step by step with timers. Start it from the Calculator with "Start Bake".
- Bread Doctor: tap "Doctor" at the top of the Workbench or Sourdough tab to diagnose a loaf; "Academy" in its header opens short lessons.

4. PERMISSIONS
The app asks for permission to send local notifications only when you start the first timer or starter feeding reminder. It uses no microphone, location or App Tracking Transparency.
```

---

## 5. Lokalizacje strony App Store: nazwa, podtytuł, słowa kluczowe (M5, 2026-10-20)

Wybory właściciela na STOP 2 roli M5 (D-053, D-054, D-055): lokalna nazwa „<piekarz>: <fraza z zakwasem>” w każdym języku, po angielsku „Baker: Sourdough Bread Planner”; 34 lokalizacje strony; kategoria bez zmian. Wiersze `pl` i `en-US` są tymi samymi polami co §1.1 i §2.1. Limity: nazwa i podtytuł ≤ 30 znaków, słowa kluczowe ≤ 100 B UTF-8, każde słowo > 2 znaki, bez słów z nazwy, podtytułu i kategorii; kontrola: `sprawdz-wydanie.mjs metadane` kod 0 (raport M5). Frazy, źródła i hipotezy pomiaru: `docs/wydanie/widocznosc.md`.

**Reguła prawdy (D-054):** lokalizację strony w danym języku wysyła się dopiero z buildem, który ma ten język w interfejsie aplikacji; English (U.K.), English (Australia) i English (Canada) mogą iść od razu. Pełny opis i tekst promocyjny języków innych niż angielski: przekład M1 (zadania 093/095) z §1.2 i §2.2 po ich aktualizacji (081); pierwsze zdanie opisu niżej jest punktem wyjścia przekładu i przechodzi kontrolę roli 09. Status „hipoteza” = frazy bez sygnału z wyszukiwarki tego kraju; sprawdzenie po wydaniu w App Analytics.

| Lokalizacja | Kod ASC | Nazwa | Zn. | Podtytuł | Zn. | Słowa kluczowe | B | Pierwsze zdanie opisu | Zn. | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| English (U.S.) | `en-US` | `Baker: Sourdough Bread Planner` | 30 | `Dough Calculator & Bake Timer` | 29 | `starter,hydration,schedule,levain,tracker,feeding,loaf,recipe,rye,pizza,proof,flour,percentage` | 94 | Baker is a sourdough bread planner: it works out your recipe amounts, plans every step back from the time you want bread ready and times each stage. | 148 | częściowo |
| English (U.K.) | `en-GB` | `Baker: Sourdough Bread Planner` | 30 | `Dough Calculator & Bake Timer` | 29 | `starter,hydration,schedule,levain,tracker,feeding,loaf,recipe,rye,pizza,proving,wholemeal,percentage` | 100 | Baker is a sourdough bread planner: it works out your recipe amounts, plans every step back from the time you want bread ready and times each stage. | 148 | częściowo |
| English (Australia) | `en-AU` | `Baker: Sourdough Bread Planner` | 30 | `Dough Calculator & Bake Timer` | 29 | `starter,hydration,schedule,levain,tracker,feeding,loaf,recipe,rye,pizza,proving,wholemeal,percentage` | 100 | Baker is a sourdough bread planner: it works out your recipe amounts, plans every step back from the time you want bread ready and times each stage. | 148 | hipoteza |
| English (Canada) | `en-CA` | `Baker: Sourdough Bread Planner` | 30 | `Dough Calculator & Bake Timer` | 29 | `starter,hydration,schedule,levain,tracker,feeding,loaf,recipe,rye,pizza,proof,flour,percentage` | 94 | Baker is a sourdough bread planner: it works out your recipe amounts, plans every step back from the time you want bread ready and times each stage. | 148 | hipoteza |
| German | `de-DE` | `Bäcker: Sauerteigbrot backen` | 28 | `Backplan, Teigrechner & Timer` | 29 | `anstellgut,roggen,pizzateig,hefeteig,hydration,teigtemperatur,rezepte,brot,gare,stockgare,starter` | 97 | Bäcker führt dich beim Sauerteigbrot vom Rezept bis zum Laib: rechnet Mengen, plant rückwärts ab Fertigzeit und erinnert dich auch bei gesperrtem Handy. | 152 | częściowo |
| Dutch | `nl-NL` | `Bakker: Zuurdesem & Brood` | 25 | `Bakplanning en rekenhulp` | 24 | `desem,starter,deeg,pizzadeeg,roggebrood,hydratatie,bakkerspercentage,recept,timer,rijzen,bakken` | 95 | Bakker begeleidt je bij zuurdesembrood van recept tot brood: rekent hoeveelheden uit, plant terug vanaf je eetmoment en herinnert je ook met vergrendelde telefoon. | 163 | częściowo |
| French | `fr-FR` | `Mitron : Pain au levain` | 23 | `Calcul, plan et minuteur` | 24 | `boulangerie,hydratation,farine,seigle,pizza,fermentation,recette,cocotte,pourcentage,maison,pâte` | 97 | Mitron vous guide pas à pas, de la recette au pain, pour réussir votre pain au levain à la maison : quantités, planning et minuteurs. | 133 | częściowo |
| French (Canada) | `fr-CA` | `Mitron : Pain au levain` | 23 | `Calcul, plan et minuterie` | 25 | `boulangerie,hydratation,farine,seigle,pizza,fermentation,recette,cocotte,pourcentage,maison,pâte` | 97 | Mitron vous guide pas à pas, de la recette au pain, pour réussir votre pain au levain à la maison : quantités, planning et minuteries. | 134 | hipoteza |
| Italian | `it` | `Fornaio: Pane e lievito madre` | 29 | `Calcolo impasto e timer` | 23 | `idratazione,farina,lievitazione,pizza,percentuale,panificazione,ricetta,biga,poolish,segale` | 91 | Fornaio ti guida passo dopo passo, dalla ricetta al pane, per fare il pane con lievito madre a casa: dosi, programma e timer. | 125 | częściowo |
| Spanish (Spain) | `es-ES` | `Panadero: Pan de masa madre` | 27 | `Calculadora y plan de horneado` | 30 | `hidratación,fermentación,levadura,pizza,centeno,recetas,harina,temporizador,porcentaje,casero` | 95 | Panadero te guía en el pan de masa madre, de la receta al pan: calcula cantidades, organiza el plan y avisa de cada paso con el móvil bloqueado. | 144 | częściowo |
| Spanish (Mexico) | `es-MX` | `Panadero: Pan de masa madre` | 27 | `Calculadora y plan de horneado` | 30 | `hidratación,fermentación,levadura,pizza,centeno,recetas,harina,temporizador,porcentaje,casero` | 95 | Panadero te guía en el pan de masa madre, de la receta al pan: calcula cantidades, organiza el plan y avisa de cada paso con el celular bloqueado. | 146 | częściowo |
| Portuguese (Brazil) | `pt-BR` | `Padeiro: Fermentação Natural` | 28 | `Calculadora e plano de fornada` | 30 | `hidratação,levain,receitas,caseiro,artesanal,pizza,centeio,farinha,fermento,massa,temporizador` | 96 | Padeiro guia você no pão de fermentação natural, da receita ao pão pronto: calcula as quantidades, monta o plano e avisa cada etapa com o celular bloqueado. | 156 | częściowo |
| Portuguese (Portugal) | `pt-PT` | `Padeiro: Pão e massa-mãe` | 24 | `Calculadora e plano de fornada` | 30 | `hidratação,fermentação,levain,receitas,caseiro,artesanal,pizza,centeio,farinha,fermento` | 91 | O Padeiro guia-o no pão de massa-mãe, da receita ao pão pronto: calcula as quantidades, monta o plano e avisa cada etapa com o telemóvel bloqueado. | 147 | częściowo |
| Polish | `pl` | `Piekarz: Chleb na zakwasie` | 26 | `Plan i kalkulator wypieku` | 25 | `bochenek,pizza,hydratacja,ciasto,drożdże,żytni,lewain,biga,poolish,minutnik,receptura,sourdough` | 98 | Piekarz prowadzi cię przez wypiek chleba na zakwasie od receptury do bochenka: liczy ilości, układa plan i pilnuje czasu, gdy telefon śpi. | 138 | zmierzone |
| Czech | `cs` | `Pekař: Chléb na kvásku` | 22 | `Plán pečení a kalkulačka` | 24 | `bochník,pizza,hydratace,těsto,žitný,levain,poolish,časovač,recept,kvasnice,fermentace` | 91 | Pekař vás provede pečením chleba na kvásku od receptu po bochník: spočítá množství, sestaví plán a hlídá čas, i když telefon spí. | 129 | hipoteza |
| Slovak | `sk` | `Pekár: Chlieb na kvásku` | 23 | `Plán pečenia a kalkulačka` | 25 | `bochník,pizza,hydratácia,cesto,žitný,levain,poolish,časovač,recept,droždie,fermentácia` | 94 | Pekár vás prevedie pečením chleba na kvásku od receptu po bochník: vypočíta množstvá, zostaví plán a stráži čas, aj keď telefón spí. | 132 | hipoteza |
| Hungarian | `hu` | `Pék: Kovászos kenyér` | 20 | `Sütési terv és kalkulátor` | 25 | `cipó,pizza,hidratáció,tészta,rozs,levain,poolish,időzítő,recept,erjesztés,élesztő` | 91 | A Pék végigvezet a kovászos kenyér sütésén a recepttől a cipóig: kiszámolja a mennyiségeket, tervet készít, és figyeli az időt, amikor a telefon alszik. | 152 | hipoteza |
| Croatian | `hr` | `Pekar: Kruh na zakvasu` | 22 | `Plan pečenja i kalkulator` | 25 | `štruca,pizza,hidratacija,tijesto,raženi,levain,poolish,timer,recept,fermentacija,kvasac` | 89 | Pekar vas vodi kroz pečenje kruha na zakvasu od recepta do štruce: izračunava količine, slaže plan i pazi na vrijeme dok telefon spava. | 135 | hipoteza |
| Slovenian | `sl` | `Pek: Kruh na kvasu` | 18 | `Načrt peke in kalkulator` | 24 | `hlebec,pizza,hidracija,testo,rženi,levain,poolish,časovnik,recept,fermentacija,kvasec` | 87 | Pek vas vodi skozi peko kruha na kvasu od recepta do hlebca: izračuna količine, sestavi načrt in pazi na čas, ko telefon spi. | 125 | hipoteza |
| Romanian | `ro` | `Brutar: Pâine cu maia` | 21 | `Plan de coacere și calculator` | 29 | `pizza,hidratare,aluat,secară,levain,poolish,temporizator,rețetă,fermentare,drojdie,franzelă` | 95 | Brutar te ghidează prin coacerea pâinii cu maia, de la rețetă la pâine: calculează cantitățile, face planul și urmărește timpul când telefonul doarme. | 150 | hipoteza |
| Swedish | `sv` | `Bagaren: Bröd & Surdeg` | 22 | `Bakplan, degkalkyl & timer` | 26 | `jäsning,deg,mjöl,rågbröd,levain,poolish,bakprocent,limpa,degtemperatur,påminnelse,pizza,bakning` | 100 | Bagaren leder dig genom surdegsbröd från recept till limpa: räknar mängder, lägger planen från sluttiden och larmar när telefonen sover. | 136 | częściowo |
| Norwegian | `no` | `Bakeren: Brød og surdeig` | 24 | `Bakeplan og oppskriftsregner` | 28 | `heving,deig,mel,rugbrød,levain,poolish,bakerprosent,pizza,påminnelse,brødbaking,hevetid` | 90 | Bakeren leder deg gjennom surdeigsbrød fra oppskrift til brød: regner mengder, lager planen fra ferdigtidspunktet og varsler deg når telefonen sover. | 149 | częściowo |
| Danish | `da` | `Bageren: Brød og surdej` | 23 | `Bageplan og opskriftsregner` | 27 | `hævning,dej,mel,rugbrød,levain,poolish,bagerprocent,pizza,påmindelse,brødbagning,hævetid` | 93 | Bageren fører dig gennem surdejsbrød fra opskrift til brød: regner mængder, lægger planen fra sluttidspunktet og giver besked, når telefonen sover. | 147 | częściowo |
| Finnish | `fi` | `Leipuri: Leipä ja hapanjuuri` | 28 | `Leivontasuunnitelma ja laskuri` | 30 | `taikina,jauho,hydraatio,ruisleipä,levain,poolish,pizza,muistutus,kohotus,resepti,pata,juurileipä` | 98 | Leipuri opastaa hapanjuurileivän teossa reseptistä leivukseen: laskee määrät, tekee aikataulun valmistumisajasta ja muistuttaa, kun puhelin nukkuu. | 147 | hipoteza |
| Russian | `ru` | `Хлебопёк: Хлеб на закваске` | 26 | `Расчёт теста и план выпечки` | 27 | `гидратация,пекарский,ржаной,рецепты,пицца,таймер` | 91 | Хлебопёк ведёт вас от рецепта до буханки на закваске: считает количество, строит план от нужного часа и следит за временем. | 123 | częściowo |
| Ukrainian | `uk` | `Пекар: Хліб на заквасці` | 23 | `Розрахунок тіста і план` | 23 | `гідратація,пекарський,житній,рецепти,піца,таймер` | 91 | Пекар веде вас від рецепта до буханки на заквасці: рахує кількість, будує план від потрібної години й стежить за часом. | 119 | częściowo |
| Greek | `el` | `Αρτοποιός: Ψωμί & Προζύμι` | 25 | `Υπολογισμός ζύμης και πλάνο` | 27 | `υδάτωση,συνταγές,σίκαλη,λεβέν,πίτσα,χρονόμετρο` | 87 | Ο Αρτοποιός σας οδηγεί από τη συνταγή στο καρβέλι με προζύμι: υπολογίζει ποσότητες, φτιάχνει πλάνο και προσέχει τον χρόνο. | 122 | hipoteza |
| Turkish | `tr` | `Fırıncı: Ekşi Mayalı Ekmek` | 26 | `Hamur hesabı ve pişirme planı` | 29 | `hidrasyon,tarif,çavdar,levain,pizza,zamanlayıcı,fırın,yüzde,somun,maya,mayalama,fermantasyon` | 98 | Fırıncı, ekşi mayalı ekmeği tariften somuna kadar yönetir: miktarları hesaplar, plan çıkarır ve süreleri takip eder. | 116 | hipoteza |
| Japanese | `ja` | `パン職人 - サワードウと天然酵母` | 17 | `ベーカーズ％計算と発酵タイマー` | 15 | `パン作り,レシピ,ライ麦,自家製,パン生地,仕込み水,スケジュール,ルヴァン` | 100 | 自家製サワードウのパン作りを、レシピから焼き上がりまで案内します。分量計算、逆算スケジュール、睡眠を考えた発酵タイマーで、次の一本をもっと良く。 | 72 | częściowo |
| Korean | `ko` | `제빵사 - 사워도우 빵 만들기` | 16 | `베이커스 퍼센트·발효 타이머` | 15 | `홈베이킹,레시피,천연발효종,르방종,호밀빵,빵반죽,수분율,발효온도` | 91 | 사워도우 빵을 레시피부터 완성까지 안내합니다. 재료량 계산, 완성 시간에서 거꾸로 짜는 일정, 잠자는 시간을 고려한 발효 알림으로 다음 빵을 더 낫게. | 84 | częściowo |
| Chinese (Traditional) | `zh-Hant` | `麵包師傅 - 酸種麵包烘焙` | 13 | `烘焙百分比計算與發酵計時` | 12 | `魯邦種,天然酵母,裸麥麵包,水合率,揉麵團,發酵時間,烘焙排程,披薩麵團` | 94 | 從配方到出爐，陪你完成家庭酸種麵包：計算用量、由完成時間倒推行程、避開睡眠時間提醒，並幫你改進下一次烘焙。 | 53 | częściowo |
| Indonesian | `id` | `Tukang Roti: Sourdough` | 22 | `Kalkulator & Jadwal Adonan` | 26 | `resep,ragi,baking,hidrasi,starter,rye,levain,pizza,fermentasi,timer,pemula,bread` | 80 | Memandu Anda membuat roti sourdough di rumah dari resep hingga roti jadi: hitung bahan, jadwal mundur dari jam siap, pengingat saat ponsel terkunci. | 148 | hipoteza |
| Malay | `ms` | `Tukang Roti: Sourdough` | 22 | `Kalkulator Doh & Jadual Bakar` | 29 | `resepi,ragi,baking,hidrasi,starter,rye,levain,pizza,penapaian,pemula,suhu,bread` | 79 | Memandu anda membuat roti sourdough di rumah dari resepi hingga siap: kira bahan, jadual undur dari waktu siap, peringatan semasa telefon dikunci. | 146 | hipoteza |
| Vietnamese | `vi` | `Thợ Bánh Mì: Sourdough` | 22 | `Tính công thức & hẹn giờ ủ` | 26 | `men tự nhiên,nướng,lên men,lúa mạch đen,lịch,pizza,levain,bột` | 76 | Hướng dẫn làm bánh mì sourdough tại nhà từ công thức đến ổ bánh: tính lượng nguyên liệu, lập lịch ngược từ giờ xong, nhắc giờ khi điện thoại khóa. | 146 | hipoteza |

### 5.1. English (U.K.), English (Australia), English (Canada): pozostałe pola

| Lokalizacja | Tekst promocyjny (≤ 170 znaków) | Zn. |
| :--- | :--- | :---: |
| en-GB, en-AU | Plan sourdough back from the time you want it ready: baker's %, 4-DDT water temperature, sleep-friendly steps and timers. Offline, no account, no ads. | 150 |
| en-CA | Sourdough planner with baker's percentage: recipe amounts, a plan back from your ready time, timers that ring while the phone is locked. No account, no ads. | 156 |

Pełny opis en-GB, en-AU i en-CA = opis EN z §2.2 po aktualizacji 081, z nazwą „Baker” i pisownią lokalną: en-GB i en-AU „discolouration”, „flavour”, „prove / proving”, „over-proved”; en-CA „discolouration”, „flavour”, „proof / proofing”, „over-proofed”. Wyjątek nazwany od D-054 / STOP 1 (3a): opis z dzisiejszego §2.2 opisuje ekrany sprzed nowej szaty (partia 5) i funkcje poza zakresem B, więc jego kopia z pisownią brytyjską utrwaliłaby nieprawdę; do czasu 081 lokalizacje angielskie spoza USA dostają tylko pola z tabeli i tekst promocyjny.

### 5.2. Kolejność zrzutów (D-055, wszystkie lokalizacje)

1) plan od godziny „gotowe” z ochroną snu; 2) kalkulator ilości z procentem piekarskim; 3) prowadzenie kroków z minutnikiem; 4) Doktor Chleba; 5) zakwasy i dokarmianie; 6) dziennik wypieków; 7) offline i prywatność. Jeden zrzut w motywie ciemnym. Podpisy w języku lokalizacji. Zrzuty i podpisy: zadanie 080 z `docs/design/wzorce-zrzuty/`; §3 opisuje dawną kolejność do czasu 080.

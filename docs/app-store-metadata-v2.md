# Pakiet Metadanych App Store Connect v2.0 — Piekarz (EN: Baker)

> **Dokument:** Apps4Craft Studio — App Store Operations Specyfikacja v2.0  
> **Data:** 18 października 2026 r.  
> **Aplikacja:** Piekarz; po angielsku Baker (D-053: nazwa w tekstach = słowo przed dwukropkiem nazwy lokalizacji)  
> **Bundle Identifier:** `com.apps4brew.baker`  
> **SKU:** `piekarz-app-v2`  
> **Kategoria Główna:** Food & Drink (Żywność i napoje)  
> **Kategoria Poboczna:** Productivity (Produktywność)  
> **Klasyfikacja Wiekowa:** wylicza Apple z ankiety; odpowiedzi według D-058 (warunkowa, oczekiwane 9+) w kroku 8 `docs/wydanie/instrukcja-ustawien.md`, wynik zapisany w `docs/wydanie/dziennik.md`  
> **Jedyne źródło metadanych sklepu** (nazwa, podtytuł, tekst promocyjny, słowa kluczowe, opis, podpisy ramek): teksty źródłowe PL i EN w tym pliku (§1–§3, §5.1); pełne metadane każdej z 34 lokalizacji strony do odczytu skryptem w `docs/wydanie/metadane/<kod ASC>.json` (095), kontrola `node scripts/sprawdz-metadane.mjs` (test `tests/metadane-sklepu.test.ts`). `docs/15-app-store.md` tylko odsyła tutaj; test `tests/store-metadata.test.ts` pilnuje limitu słów kluczowych (100 B) sekcji PL i EN [M1-audytor-generalny-036, M1-audytor-generalny-095].  
> **Nazwy, podtytuły i słowa kluczowe wszystkich lokalizacji strony:** §5 (M5 widoczność w sklepie, D-053…D-055, 2026-10-20); mapa storefrontów i hipotezy pomiaru: `docs/wydanie/widocznosc.md`.  

---

## 1. Karta Produktu App Store (Język Polski — PL)

### 1.1. Metadane Główne (Rygor Limitów Apple)

| Pole | Treść | Liczba znaków | Limit Apple |
| :--- | :--- | :---: | :---: |
| **Nazwa aplikacji (Name)** | `Piekarz: Chleb na zakwasie` | **26** | max 30 |
| **Podtytuł (Subtitle)** | `Plan i kalkulator wypieku` | **25** | max 30 |
| **Tekst promocyjny (Promotional Text)** | `Ustaw godzinę, o której chleb ma być gotowy: Piekarz policzy ilości, ułoży plan wstecz i da znać o końcu każdego kroku. Bez konta, bez internetu, bez reklam.` | **157** | max 170 |
| **Słowa kluczowe (Keywords)** | `bochenek,pizza,hydratacja,ciasto,drożdże,żytni,lewain,biga,poolish,minutnik,receptura,sourdough` | **98** | max 100 B (bajty UTF-8; bez wyrazów z nazwy i podtytułu) |

### 1.2. Pełny Opis Aplikacji (Description PL — 3 224 / 4 000 znaków)

```text
Piekarz prowadzi cię przez wypiek chleba na zakwasie od receptury do bochenka: liczy ilości, układa plan i pilnuje czasu, gdy telefon śpi. Działa bez konta i bez internetu, bez reklam i bez śledzenia. Twoje receptury, zakwasy i dziennik zostają tylko w twoim telefonie.

RECEPTURY I ILOŚCI
Wybierasz jedną z 15 receptur bazowych (na zakwasie, żytnie, drożdżowe, pizza i słodkie) albo własną. Ustawiasz liczbę bochenków albo masę mąki, a Piekarz podaje gramy mąki, wody, zakwasu, soli i drożdży. Procent piekarski uwzględnia mąkę i wodę z zakwasu i z zaczynu. Piekarz poda też temperaturę wody dla temperatury ciasta, którą chcesz uzyskać.

PLAN OD GODZINY „GOTOWE”
Wybierasz, kiedy chleb ma być gotowy, a Piekarz liczy wstecz godzinę startu każdego kroku. Czas fermentacji zależy od temperatury w kuchni. Gdy krok wymagający twoich rąk wypada w nocy (domyślnie między 23:00 a 06:30), Piekarz zaproponuje dłuższy czas w lodówce. Gdy czasu jest za mało, poda najwcześniejszą możliwą godzinę.

PROWADZENIE KROK PO KROKU
Piekarz pokazuje bieżący krok: co zrobić, ile to trwa i co będzie potem. Gdy zezwolisz na powiadomienia, da znać o końcu kroku także przy zablokowanym telefonie. Ekran prowadzenia nie gaśnie w trakcie wypieku. Kroki z gorącym naczyniem albo surowym ciastem mają ostrzeżenie. Chleb żytni (ponad połowa mąki to mąka żytnia) ma własne kroki bez składania. Pomyłkowo potwierdzony krok cofniesz, a po ponownym otwarciu aplikacja wraca do bieżącego kroku.

ZAKWASY
Prowadzisz kilka zakwasów. Piekarz podaje ilości do dokarmienia w proporcji 1:1:1, 1:2:2, 1:3:3 albo 1:5:5. Gdy zakwas podwoi objętość, Piekarz oznaczy go jako gotowy do ciasta. Po 12 godzinach na blacie bez dokarmienia przypomni o nim powiadomieniem. Nowy zakwas założysz dzień po dniu. Piekarz stosuje zasadę ostrożności: przy nalocie, przebarwieniu albo zgniłym zapachu radzi wyrzucić zakwas.

DOKTOR CHLEBA
Miękisz jest zbity, a skórka blada? Zaznaczasz objawy, a Doktor Chleba wskazuje jedną z 9 wad, wyjaśnia przyczynę i podaje, co zmienić następnym razem. Cztery protokoły ratunkowe pomagają, gdy ciasto ma kłopot w trakcie fermentacji. Doktor zakwasu pomaga, gdy coś w zakwasie cię niepokoi.

DZIENNIK
Oceniasz każdy bochenek: gwiazdki, miękisz, skórka i profil smaku. Dziennik pokazuje statystyki, a „Piecz ponownie” otwiera tę samą recepturę.

TWOJE DANE
Piekarz trzyma w telefonie 10 ostatnich automatycznych kopii zapasowych. Wszystkie dane wyeksportujesz do pliku i zaimportujesz z pliku, a historię wypieków wyeksportujesz jako CSV. Jednostki: gramy i °C albo uncje i °F.

WARTO WIEDZIEĆ
Piekarz działa na iPhonie i nie synchronizuje danych między urządzeniami; dane przenosisz plikiem kopii. Bez zgody na powiadomienia Piekarz pokaże koniec kroku tylko na otwartym ekranie.

DOSTĘP I ZAKUP
Pełny dostęp daje subskrypcja miesięczna lub roczna albo jednorazowy zakup dożywotni w App Store. Subskrypcja może zaczynać się bezpłatnym okresem próbnym (oferta wprowadzająca App Store dla uprawnionych). Bez zakupu przeglądasz historię wypieków, importujesz plik oraz eksportujesz i usuwasz swoje dane.

Piekarz jest dostępny w 35 językach, w tym w polskim, angielskim, niemieckim, francuskim, hiszpańskim, włoskim, portugalskim i japońskim.
```

---

## 2. Karta Produktu App Store (Język Angielski — EN-US)

### 2.1. Metadane Główne (Apple Limit Rigor)

| Pole | Treść | Liczba znaków | Limit Apple |
| :--- | :--- | :---: | :---: |
| **App Name** | `Baker: Sourdough Bread Planner` | **30** | max 30 |
| **Subtitle** | `Dough Calculator & Bake Timer` | **29** | max 30 |
| **Promotional Text** | `Set the time you want bread ready: Baker works out the amounts, plans every step back from it and tells you when each step ends. No account, no internet, no ads.` | **161** | max 170 |
| **Keywords** | `starter,hydration,schedule,levain,tracker,feeding,loaf,recipe,rye,pizza,proof,flour,percentage` | **94** | max 100 B (UTF-8 bytes; no words from name or subtitle) |

### 2.2. Pełny Opis Aplikacji (Description EN — 3 219 / 4 000 znaków)

```text
Baker is a sourdough bread planner: it works out your recipe amounts, plans every step back from the time you want bread ready and times each stage. It works without an account and without the internet, with no ads and no tracking. Your recipes, starters and journal stay only on your phone.

RECIPES AND AMOUNTS
Choose one of 15 base recipes (sourdough, rye, yeast, pizza and sweet) or your own. Set the number of loaves or the flour weight, and Baker gives the grams of flour, water, starter, salt and yeast. The baker's percentage counts the flour and water in your starter and in a preferment. Baker also gives the water temperature for the dough temperature you want.

A PLAN FROM THE "READY" TIME
Choose when the bread should be ready, and Baker works back to the start time of every step. Fermentation time follows your kitchen temperature. When a hands-on step falls at night (23:00 to 06:30 by default), Baker suggests a longer time in the fridge. If there is not enough time, it gives the earliest possible ready time.

STEP-BY-STEP GUIDANCE
Baker shows the current step: what to do, how long it takes and what comes next. If you allow notifications, it tells you when a step ends even when your phone is locked. The guidance screen stays on during the bake. Steps with a hot pot or raw dough carry a safety warning. Rye bread (more than half rye flour) gets its own steps with no folding. You can undo a step confirmed by mistake, and the app returns to the current step when you open it again.

STARTERS
Keep several starters. Baker gives feeding amounts for a 1:1:1, 1:2:2, 1:3:3 or 1:5:5 ratio. When the starter has doubled in volume, Baker marks it ready for the dough. After 12 hours on the counter without a feeding, a notification reminds you. You can start a new starter day by day. Baker follows a precautionary rule: with any film, discoloration or rotten smell, it advises you to throw the starter away.

BREAD DOCTOR
Dense crumb and a pale crust? Mark the symptoms, and the Bread Doctor names one of 9 defects, explains the cause and says what to change next time. Four rescue protocols help with dough that is in trouble during fermentation. The Starter Doctor helps when something about your starter worries you.

JOURNAL
Rate each loaf: stars, crumb, crust and flavor profile. The Journal shows statistics, and "Bake Again" opens the same recipe.

YOUR DATA
Baker keeps the last 10 automatic backups on your phone. You can export all your data to a file, import it from a file and export your bake history as CSV. Units: grams and °C or ounces and °F.

GOOD TO KNOW
Baker runs on iPhone and does not sync between devices; you move data with a backup file. Without permission for notifications, Baker shows the end of a step only on the open screen.

ACCESS AND PURCHASE
Full access comes with a monthly or yearly subscription or a one-time lifetime purchase on the App Store. A subscription may start with a free trial (App Store introductory offer for eligible users). Without a purchase you can browse your bake history, import a file, and export and delete your data.

Baker is available in 35 languages, including English, Polish, German, French, Spanish, Italian, Portuguese and Japanese.
```

---

## 3. Specyfikacja 7 Zrzutów Ekranu (Screenshots Frame Spec)

Kolejność i liczba ramek według D-055 (§5.2): 7 ramek, jedna w motywie ciemnym (Ramka 3). Klasy i wymiary zrzutów potwierdza zadanie 080 w dniu wykonania (moduł metadane-i-zrzuty roli 10); dawna specyfikacja podawała **iPhone 6.9" (1320 × 2868 px)** oraz **iPhone 6.5" / 6.7" (1290 × 2796 px)**. Zrzuty robi M2 w zadaniu 080 z `docs/design/wzorce-zrzuty/`; ten rozdział daje tylko podpisy PL i EN oraz ekran każdej ramki (podpisy 34 lokalizacji: pole `ramki` w `docs/wydanie/metadane/<kod ASC>.json`, 095).

Podpisy i widoki opisują wyłącznie ekrany tej wersji na nowej szacie (DEC-04 a, 2026-10-19; partie 5–6); wartości na ekranie biorą się z danych przykładowych w chwili zrzutu, nie z tego dokumentu. Podpisy nie pokazują funkcji PÓŹNIEJ i NIE z kontraktu B (OG-05).

### Ramka 1: Plan od godziny „gotowe” z ochroną snu
- **Główny nagłówek (PL):** *Chleb gotowy na twoją godzinę*
- **Podtytuł (PL):** *Plan wstecz bez kroków w środku nocy*
- **Main Headline (EN):** *Bread Ready When You Want It*
- **Sub-headline (EN):** *A plan worked back from your time, with no steps at night*
- **Widok w ramce:** ekran „Plan wypieku” (`app/(tabs)/receptury/harmonogram.tsx`) ze Spiralą planu, godziną „gotowe” i propozycją „Przesuń do lodówki” dla kroku, który wypada w nocy.

### Ramka 2: Receptura i ilości z procentem piekarskim
- **Główny nagłówek (PL):** *Gramy każdego składnika od razu*
- **Podtytuł (PL):** *Mąka i woda z zakwasu wliczone w procent piekarski*
- **Main Headline (EN):** *Grams for Every Ingredient*
- **Sub-headline (EN):** *Flour and water from your starter counted in the baker's percentage*
- **Widok w ramce:** ekran receptury (`app/(tabs)/receptury/receptura.tsx`) z ilościami „Do miski” i przyciskiem „Ułóż plan”.

### Ramka 3: Prowadzenie krok po kroku z minutnikiem (motyw ciemny)
- **Główny nagłówek (PL):** *Jeden krok naraz*
- **Podtytuł (PL):** *Co zrobić, ile to trwa i powiadomienie o końcu kroku*
- **Main Headline (EN):** *One Step at a Time*
- **Sub-headline (EN):** *What to do, how long it takes and a notification when it ends*
- **Widok w ramce:** ekran prowadzenia (`app/stolnica.tsx`) w motywie ciemnym: bieżący krok z czasem, „Krok n z N” i informacją o powiadomieniu.

### Ramka 4: Doktor Chleba
- **Główny nagłówek (PL):** *Co poprawić w następnym bochenku*
- **Podtytuł (PL):** *Objawy, przyczyna i jedna zmiana na następny wypiek*
- **Main Headline (EN):** *Make Your Next Loaf Better*
- **Sub-headline (EN):** *Symptoms, the cause and one change for your next bake*
- **Widok w ramce:** ekran Doktora Chleba (`app/doktor.tsx`) z zaznaczonymi objawami i wynikiem diagnozy.

### Ramka 5: Zakwasy i dokarmianie
- **Główny nagłówek (PL):** *Zakwas zawsze gotowy na czas*
- **Podtytuł (PL):** *Ilości do dokarmienia i przypomnienie po 12 godzinach*
- **Main Headline (EN):** *Your Starter, Ready on Time*
- **Sub-headline (EN):** *Feeding amounts and a reminder after 12 hours*
- **Widok w ramce:** zakładka Zakwasy (`app/(tabs)/zakwasy/index.tsx`) z kartą zakwasu, „Podwoił objętość” i ilościami do dokarmienia.

### Ramka 6: Dziennik wypieków
- **Główny nagłówek (PL):** *Każdy wypiek zapisany*
- **Podtytuł (PL):** *Ocena bochenka i „Piecz ponownie” jednym dotknięciem*
- **Main Headline (EN):** *Every Bake on Record*
- **Sub-headline (EN):** *Rate the loaf and tap "Bake Again"*
- **Widok w ramce:** zakładka Dziennik (`app/(tabs)/dziennik/index.tsx`) ze statystykami i wpisem z oceną.

### Ramka 7: Offline i prywatność
- **Główny nagłówek (PL):** *Bez konta i bez internetu*
- **Podtytuł (PL):** *Bez reklam i śledzenia; dane tylko w twoim telefonie*
- **Main Headline (EN):** *No Account, No Internet*
- **Sub-headline (EN):** *No ads or tracking; your data stays on your phone*
- **Widok w ramce:** ekran „Co dziś robisz?” (`app/(tabs)/(dzis)/index.tsx`) przy pierwszym uruchomieniu, z tekstem „Piekarz działa bez internetu i bez konta. Twoje receptury i zapiski zostają na tym telefonie.”

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

Notatki są po angielsku, bo recenzent używa interfejsu EN; nazwy przycisków są wartościami słownika EN (`src/lib/i18n-en/`) i tekstami dzisiejszego interfejsu (klucz `t()` użyty w `app/` albo `src/components/`), a przykładowa kopia przechodzi `parseAndValidateBackup` (test `tests/store-metadata.test.ts`) [M1-audytor-generalny-078]. Ścieżki według nowej szaty: 4 zakładki z `app/(tabs)/_layout.tsx`, Ustawienia z „Dziś”, import jednym arkuszem „Importuj z pliku”, Akademia bez wejścia w 1.0 [M1-audytor-generalny-119; 10-wydanie-020].

```text
Dear App Review Team,

Baker (Polish name: Piekarz) is a 100% offline bread-baking assistant. There is no sign-in, no account and no network use; all data stays on the device.

The app has four tabs: Today, Recipes, Starters and Journal. Settings open from the gear button at the top right of the Today tab (VoiceOver label "Settings").

1. PURCHASES AND FREE TRIAL
Access to the features requires a monthly or yearly subscription (one subscription group; introductory offer: free trial) or a lifetime purchase. Without a purchase, only bake history browsing, importing a file, and reading, exporting and deleting your own data work.
To see the features with a sandbox account: on the Today tab choose "Baking with sourdough", tap any recipe under "Base Recipes", then tap "Make a Plan". The purchase screen opens; choose the monthly or yearly plan and tap "Try 14 days". The trial is the App Store introductory offer, shown only to eligible accounts; the app does not count days itself.
Restore purchases: "Restore Purchases" at the bottom of the purchase screen, and in Settings > Purchases.

2. DATA EXPORT AND IMPORT (works without a purchase)
a) On the Today tab tap the gear button "Settings" at the top right.
b) In the "Backup" section tap "Export to File" to share a JSON backup file.
c) Tap "Import from File". A sheet opens: "Paste the contents of a recipe file or a backup file."
d) Paste the contents of an exported file (or copy it and tap "Paste from clipboard"), or this sample with one starter:
{"format":"piekarz-backup","schemaVersion":1,"exportedAt":"2026-10-20T08:00:00.000Z","state":{"bakes":[],"starters":[{"id":"review-starter","name":"Review Starter","flourType":"rye","hydration":100,"birthDate":1760947200000,"storageState":"ROOM_TEMP"}],"customRecipes":[]}}
e) The sheet says what the backup contains. Tap "Replace Data". Import replaces the current data; the app first saves a safety copy on the device. The imported starter appears in the Starters tab.

3. OTHER FEATURES THAT ARE EASY TO MISS
- Bake plan with Sleep Guard: after "Make a Plan", set the ready time; the app plans the steps backwards. When a hands-on step falls in your sleep hours, Sleep Guard offers "Move to fridge".
- Workbench: tap "Start Bake" on the bake plan to open guided baking step by step with timers.
- Bread Doctor: tap "Doctor" at the top of the Workbench, or "Bread Doctor" on the Journal tab, to diagnose a loaf. On the Starters tab, "Doctor" at the top opens the Starter Doctor.

4. PERMISSIONS
The app asks for permission to send local notifications only when you start the first timer or starter feeding reminder. It uses no microphone, location or App Tracking Transparency.
```

---

## 5. Lokalizacje strony App Store: nazwa, podtytuł, słowa kluczowe (M5, 2026-10-20)

Wybory właściciela na STOP 2 roli M5 (D-053, D-054, D-055): lokalna nazwa „<piekarz>: <fraza z zakwasem>” w każdym języku, po angielsku „Baker: Sourdough Bread Planner”; 34 lokalizacje strony; kategoria bez zmian. Wiersze `pl` i `en-US` są tymi samymi polami co §1.1 i §2.1. Limity: nazwa i podtytuł ≤ 30 znaków, słowa kluczowe ≤ 100 B UTF-8, każde słowo > 2 znaki, bez słów z nazwy, podtytułu i kategorii; kontrola: `sprawdz-wydanie.mjs metadane` kod 0 (raport M5). Frazy, źródła i hipotezy pomiaru: `docs/wydanie/widocznosc.md`.

**Reguła prawdy (D-054):** lokalizację strony w danym języku wysyła się dopiero z buildem, który ma ten język w interfejsie aplikacji; English (U.K.), English (Australia) i English (Canada) mogą iść od razu. Pełny opis, tekst promocyjny i podpisy ramek języków innych niż polski i angielski: przekład M1 (093) z §1.2, §2.2 i §3 z poprawkami 095, w `docs/wydanie/metadane/<kod ASC>.json` (pole `poprawki` mówi, co zmieniono względem przekładu). Ta tabela jest przeglądowa: nazwa, podtytuł, słowa kluczowe i status są tu i w plikach JSON te same (test `tests/metadane-sklepu.test.ts`); kolumna „Pierwsze zdanie opisu” była punktem wyjścia przekładu, a obowiązuje opis z pliku JSON. Status „hipoteza” = frazy bez sygnału z wyszukiwarki tego kraju; sprawdzenie po wydaniu w App Analytics.

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
| en-GB, en-AU | Set the time you want bread ready: Baker works out the amounts, plans every step back from it and tells you when each step ends. No account, no internet, no ads. | 161 |
| en-CA | Sourdough planner with baker's percentage: recipe amounts, a plan back from your ready time, timers that ring while the phone is locked. No account, no ads. | 156 |

Pełny opis en-GB, en-AU i en-CA = opis EN z §2.2 (081, 2026-10-20) z pisownią lokalną. Opis nie używa wyrazów „proof” ani „over-proofed”, więc tekst jest wspólny dla trzech lokalizacji; różni się od §2.2 tylko w wyrazach „flavour” i „discolouration”. Test: `tests/teksty-sklepu.test.ts` (opis = §2.2 po zamianie pisowni).

#### 5.1.1. Pełny opis en-GB, en-AU, en-CA (Description — 3 221 / 4 000 znaków)

```text
Baker is a sourdough bread planner: it works out your recipe amounts, plans every step back from the time you want bread ready and times each stage. It works without an account and without the internet, with no ads and no tracking. Your recipes, starters and journal stay only on your phone.

RECIPES AND AMOUNTS
Choose one of 15 base recipes (sourdough, rye, yeast, pizza and sweet) or your own. Set the number of loaves or the flour weight, and Baker gives the grams of flour, water, starter, salt and yeast. The baker's percentage counts the flour and water in your starter and in a preferment. Baker also gives the water temperature for the dough temperature you want.

A PLAN FROM THE "READY" TIME
Choose when the bread should be ready, and Baker works back to the start time of every step. Fermentation time follows your kitchen temperature. When a hands-on step falls at night (23:00 to 06:30 by default), Baker suggests a longer time in the fridge. If there is not enough time, it gives the earliest possible ready time.

STEP-BY-STEP GUIDANCE
Baker shows the current step: what to do, how long it takes and what comes next. If you allow notifications, it tells you when a step ends even when your phone is locked. The guidance screen stays on during the bake. Steps with a hot pot or raw dough carry a safety warning. Rye bread (more than half rye flour) gets its own steps with no folding. You can undo a step confirmed by mistake, and the app returns to the current step when you open it again.

STARTERS
Keep several starters. Baker gives feeding amounts for a 1:1:1, 1:2:2, 1:3:3 or 1:5:5 ratio. When the starter has doubled in volume, Baker marks it ready for the dough. After 12 hours on the counter without a feeding, a notification reminds you. You can start a new starter day by day. Baker follows a precautionary rule: with any film, discolouration or rotten smell, it advises you to throw the starter away.

BREAD DOCTOR
Dense crumb and a pale crust? Mark the symptoms, and the Bread Doctor names one of 9 defects, explains the cause and says what to change next time. Four rescue protocols help with dough that is in trouble during fermentation. The Starter Doctor helps when something about your starter worries you.

JOURNAL
Rate each loaf: stars, crumb, crust and flavour profile. The Journal shows statistics, and "Bake Again" opens the same recipe.

YOUR DATA
Baker keeps the last 10 automatic backups on your phone. You can export all your data to a file, import it from a file and export your bake history as CSV. Units: grams and °C or ounces and °F.

GOOD TO KNOW
Baker runs on iPhone and does not sync between devices; you move data with a backup file. Without permission for notifications, Baker shows the end of a step only on the open screen.

ACCESS AND PURCHASE
Full access comes with a monthly or yearly subscription or a one-time lifetime purchase on the App Store. A subscription may start with a free trial (App Store introductory offer for eligible users). Without a purchase you can browse your bake history, import a file, and export and delete your data.

Baker is available in 35 languages, including English, Polish, German, French, Spanish, Italian, Portuguese and Japanese.
```

### 5.2. Kolejność zrzutów (D-055, wszystkie lokalizacje)

1) plan od godziny „gotowe” z ochroną snu; 2) kalkulator ilości z procentem piekarskim; 3) prowadzenie kroków z minutnikiem; 4) Doktor Chleba; 5) zakwasy i dokarmianie; 6) dziennik wypieków; 7) offline i prywatność. Jeden zrzut w motywie ciemnym. Podpisy w języku lokalizacji. Zrzuty i podpisy: zadanie 080 z `docs/design/wzorce-zrzuty/`; podpisy PL i EN w tej kolejności: §3 (M1-audytor-generalny-035, 2026-10-20).

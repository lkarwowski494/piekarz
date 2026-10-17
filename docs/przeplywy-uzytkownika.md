# Inwentaryzacja Przepływów Użytkownika As-Is (Piekarz v2.0)

> **Dokument:** `docs/przeplywy-uzytkownika.md`  
> **Rola:** Principal Product Architect & Senior UX/BPR Designer (Apps4Craft Studio)  
> **Stan:** AS-IS (Stan Faktyczny w Kodzie Źródłowym)  
> **Data:** Październik 2026  

---

## 1. Przepływ 1: Pierwsze Uruchomienie (First Run Onboarding)

### Kiedy używasz:
Początkujący lub zaawansowany piekarz otwiera świeżo zainstalowaną aplikację w kuchni, chcąc szybko sprawdzić proporcje mąki i wody do pierwszego bochenka.

### Sekwencja As-Is:
```text
[Start App] ──> [Ekran Kalkulator (index.tsx)] ──> [Wzorcowy Chleb Wiejski 72%]
                        │
                        ├──> [Karta "Do Miski" (DoMiskiScaleCard)]
                        └──> [Zwijany Akordeon (ArtisanAccordionPro)]
```
- **Wejście:** Uruchomienie aplikacji.
- **Konfiguracja:** Domyślnie załadowana receptura: 2 bochenki po 850 g, mąka pszenna t750 (80%) + żytnia t720 (20%), hydratacja 68%, sól 2%, zakwas 20%.
- **Wynik:** Widoczna karta odważania wagowego składników "Do miski".
- **Zapis/Efekt:** Brak konieczności klikania czegokolwiek — natychmiastowa wartość.

### Koszt As-Is:
- Ekrany: **1**
- Kliknięcia: **0**
- Pola do wypełnienia: **0** (wartości domyślne)
- Decyzje: **1** (czy piekę domyślny chleb, czy zmieniam wagę)

### Tarcia As-Is:
- 🟡 **Brak objaśnienia skali w kontekście (P13):** Nowy użytkownik nie wie od razu, dlaczego woda bazowa i zakwas są rozbite na pozycje cząstkowe (`src/components/calculator/DoMiskiScaleCard.tsx:28`).
- 🟢 **Drobne:** Brak widocznego znacznika, że receptura pochodzi z kanonicznego atlasu (*Master Recipes*).

---

## 2. Przepływ 2: Główny Proces (Kalkulacja $\rightarrow$ Wyrabianie $\rightarrow$ Pieczenie)

### Kiedy używasz:
Piekarz planuje wypiek na weekend: dobiera proporcje w kalkulatorze, sprawdza harmonogram czasowy w zależności od temperatury kuchni, a następnie przechodzi do wyrabiania, składania ciasta i pieczenia w garnku żeliwnym.

### Sekwencja As-Is:
```text
[Karta 1: Kalkulator] ──> Dostosuj wagę / mąki / hydratację
         │
         ├──> (Użytkownik manualnie klika dolną belkę)
         ▼
[Karta 2: Harmonogram] ──> Ustaw godzinę gotowości (np. jutro 10:00)
         │                 Sprawdź kolizję ze snem (SleepGuard)
         │
         ├──> (Użytkownik manualnie klika dolną belkę)
         ▼
[Karta 3: Stolnica] ───> Wybierz naczynie (Garnek żeliwny)
         │               Kliknij "Rozpocznij wypiek"
         │               Odliczaj czas fazy (Autoliza ──> Składania ──> Piec)
         ▼
[Koniec Wypieku] ──────> Zapisz notatki i ocenę w historii
```

### Koszt As-Is:
- Ekrany: **3 osobne karty nawigacji** (`index.tsx`, `harmonogram.tsx`, `stolnica.tsx`).
- Kliknięcia: **min. 9 kliknięć** (zmiana kart, suwaki, start bochenka, akceptacja faz).
- Pola do wypełnienia: **5** (waga, mąki, temp. otoczenia, godzina gotowości, notatki).
- Decyzje: **4** (czy modyfikować przepis, kiedy wstać na pieczenie, jakie naczynie, kiedy naciąć).

### Tarcia As-Is:
- 🔴 **Rozproszony proces / Przeskakiwanie między kartami (P14):**
  - Użytkownik przelicza bochenek w Kalkulatorze, po czym musi sam domyślić się, że harmonogram jest w osobnej karcie, a stoper wypieku na Stolnicy (`app/(tabs)/index.tsx:44`, `app/(tabs)/harmonogram.tsx:15`, `app/(tabs)/stolnica.tsx:59`). Brak jednego przycisku akcji: *„Zacznij przygotowanie ciasta według tej receptury”*.
- 🔴 **Odwrócona sekwencja i kalkulator DDT (P4, P5):**
  - Kalkulator temperatury wody DDT znajduje się w zwijanym akordeonie kalkulatora (`index.tsx:99`), zamiast pojawić się proaktywnie w fazie mieszania wody z mąką na Stolnicy.
- 🟡 **Pasywna lista w harmonogramie (P6):**
  - Harmonogram wyświetla statyczną listę godzin (`TimelineStagesList.tsx`), zamiast skupić uwagę na najbliższej akcji: *„TERAZ: Wykonaj Coil Fold #2 (zostało 12 min)”*.
- 🟡 **Zagnieżdżone modale akordeonu (P16):**
  - Część kalkulatorów pomocniczych (np. kalkulator kosztów, strata wypiekowa) otwiera zagnieżdżone wyskakujące modale zamiast zwijać się bezpośrednio w widoku.

---

## 3. Przepływ 3: Powrót i Pielęgnacja Zakwasu (Sourdough Journal)

### Kiedy używasz:
Piekarz rano podchodzi do lodówki lub blatu, ocenia stan zakwasu, dokarmia go mąką i wodą w zadanej proporcji i chce wiedzieć, o której godzinie osiągnie szczyt (*Peak*).

### Sekwencja As-Is:
```text
[Karta 4: Zakwas (zakwas.tsx)] ──> Podgląd stanu (Głodny / Aktywny)
               │
               ├──> [Kalkulator Dokarmiania (np. 1:2:2)]
               │    Wpisz wagę zakwasu matki ──> Odczytaj wagę mąki i wody
               │
               ├──> [Przycisk "Zarejestruj dokarmienie"]
               ▼
[Predyktor Szczytu (Peak)] ────> Wyliczenie: szczyt za ok. 4h 30m
```

### Koszt As-Is:
- Ekrany: **1**
- Kliknięcia: **2**
- Pola do wypełnienia: **1** (proporcja dokarmienia / waga)
- Decyzje: **1** (jak mocno dokarmić)

### Tarcia As-Is:
- 🟡 **Modale oderwane od kontekstu (P16):** Narzędzie konwersji drożdży na zakwas oraz przepisy z odrzuconego zakwasu otwierają się jako modale zagnieżdżone (`zakwas.tsx:105`).
- 🟢 Drobne: Brak bezpośredniego skrótu *„Użyj tego zakwasu w kalkulatorze bochenka”* po osiągnięciu szczytu.

---

## 4. Przepływ 4: Awaria w Kuchni i Ratunek Ciasta (Troubleshooting Doctor)

### Kiedy używasz:
Ciasto podczas fermentacji rozlało się w misce, opadło lub zakwas pokrył się dziwnym nalotem; piekarz ma brudne ręce i potrzebuje natychmiastowej diagnozy.

### Sekwencja As-Is:
```text
[Wejście w Doktora] ──> [Ekran Doktor (doktor.tsx)] (przez header lub link)
          │
          ├──> [Wybór objawów w SymptomSelectorSection]
          │
          ├──> [Karta Diagnozy (DiagnosisResultCard)]
          │    Odczyt przyczyny i listy kroków
          ▼
[Ślepy Zaułek (P9)] ──> Brak przycisku przenoszącego do kalkulatora z gotowym pivotem!
```

### Koszt As-Is:
- Ekrany: **1–2**
- Kliknięcia: **3–4**
- Pola do wypełnienia: **0**
- Decyzje: **2** (jakie objawy wybrać, co zrobić z ciastem)

### Tarcia As-Is:
- 🔴 **Ślepy zaułek po ratunku (P9):**
  - Użytkownik czyta zalecenie: *„Pivot na Focaccię z oliwą”* (`doktor.tsx:120`), ale ekran nie oferuje przycisku *„Przełącz kalkulator na Focaccię”*. Piekarz musi wyjść z Doktora, wejść w Kalkulator i szukać przepisu od nowa.
- 🟡 **Ukryta nawigacja (P11):**
  - Doktor nie znajduje się w głównym dolnym pasku nawigacji (`href: null` w `_layout.tsx:59`), przez co w sytuacji stresowej użytkownik szuka go po ikonach nagłówka.

---

## 5. Przepływ 5: Zakończenie Wypieku, Ocena i Archiwum

### Kiedy używasz:
Chleb został upieczony i ostygł; piekarz przekraja bochenek, ocenia strukturę miękiszu i skórki, po czym zapisuje log do bazy SQLite.

### Sekwencja As-Is:
```text
[Stolnica: Faza Wypieku] ──> Kliknięcie "Zakończ wypiek"
             │
             ▼
[Modal FinishBakeModal] ───> Wybór oceny gwiazdkowej (1–5)
             │               Suwaki sensoryczne (miękisz, skórka, kwasowość)
             │               Wpisanie notatek
             ▼
[Baza Danych SQLite] ──────> Zapis w tabeli `bake_logs`
             │
             ▼
[Historia na Stolnicy] ────> Lista bochenków na dole ekranu
```

### Koszt As-Is:
- Ekrany: **1 + modal**
- Kliknięcia: **4**
- Pola do wypełnienia: **3**
- Decyzje: **2**

### Tarcia As-Is:
- 🟡 **Dialog potwierdzenia usunięcia zamiast Undo (P10):**
  - Usunięcie wpisu z historii wypieków wywołuje systemowy `Alert.alert` blokujący ekran zamiast natychmiastowego usunięcia z paskiem *„Cofnij”* (`stolnica.tsx:21`).
- 🟡 **Brak szybkiego powtórzenia bochenka (P8):**
  - Wpis w historii nie posiada natychmiastowego przycisku *„Upiecz ponownie ten sam bochenek”*, który załadowałby dokładnie tę samą recepturę do kalkulatora jednym tapnięciem.

---

## 6. Tabela Zbiorcza Kosztu i Tarć Przepływów As-Is

| Nr | Przepływ Użytkownika | Ekrany As-Is | Kliknięcia As-Is | Pola As-Is | Tarcia Krytyczne 🔴 |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **1** | Pierwsze Uruchomienie (Onboarding) | 1 | 0 | 0 | Brak tarć 🔴 (wzorcowy start) |
| **2** | **Główny Proces (Kalkulacja $\rightarrow$ Pieczenie)** | **3** | **9** | **5** | 🔴 **Rozproszony proces (P14)**, 🔴 **Odwrócone DDT (P4/P5)** |
| **3** | Pielęgnacja Zakwasu (Sourdough Journal) | 1 | 2 | 1 | Brak tarć 🔴 (drobne P16 w modalach) |
| **4** | **Awaria w Kuchni i Ratunek Ciasta (Doctor)** | **2** | **4** | **0** | 🔴 **Ślepy zaułek po diagnozie (P9)** |
| **5** | Zakończenie Wypieku i Archiwum | 2 | 4 | 3 | Brak tarć 🔴 (drobne P10 - brak Undo) |

---

> [!IMPORTANT]
> **BRAMKA STOP 1:** Zaprezentowano kompletną inwentaryzację 5 przepływów As-Is z dokładnymi ścieżkami w kodzie, kosztami i zidentyfikowanymi 3 tarciami krytycznymi 🔴 (P14, P4/P5, P9). Czy zatwierdzasz ETAP 1 przed przejściem do **ETAPU 2: Audyt BPR i Projekt Nowych Przepływów To-Be w `docs/to-be.md`**?

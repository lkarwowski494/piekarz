# Soczewka 2 — praktyk dziedziny (doświadczony piekarz na zakwasie)

Data odczytu wszystkich źródeł: 2026-11-08. Pytanie: czym musiałaby być najlepsza w klasie aplikacja do wypieku na zakwasie, oceniana przez piekarza, który zna lepsze narzędzia. Repo aplikacji i dokumentów projektu nie otwierano; jedyna wiedza o aplikacji to cel i skrót opisu ze sklepu z polecenia.

## Przeczytane alternatywy (rynek USA + DE)

| Aplikacja | Sklep | Cena (odczyt 2026-11-08) | Oceny | Źródło |
|---|---|---|---|---|
| Rise: Baking & Bread Recipes (Made by Windmill) | US | darmowa; IAP: 3,99 USD/mies., 14,99 USD/rok, 19,99 USD jednorazowo (oraz 4,99/mies., 8,99/3 mies., 19,99/rok) | 4,87 / 337 (US), 4,91 / 11 (DE) | https://itunes.apple.com/lookup?id=1515369685&country=us ; https://apps.apple.com/us/app/rise-baking-bread-recipes/id1515369685 |
| Loaflo: Sourdough Starter (No Worries Lifestyle) | US | darmowa; IAP: 6,99 USD/tydz., 19,99 USD/mies., 39,99 USD/rok | 4,69 / 567 (US), 1 / 1 (DE) | https://itunes.apple.com/lookup?id=6736766728&country=us ; https://apps.apple.com/us/app/loaflo-sourdough-starter/id6736766728 |
| BreadMe – Sauerteig planer (Ferdinand Werner) | DE | 2,99 EUR jednorazowo, bez IAP, „Keine Daten erfasst”, „Nur für iPhone”, 5 języków | 4,34 / 44 (DE) | https://itunes.apple.com/lookup?id=1522824861&country=de ; https://apps.apple.com/de/app/breadme-sauerteig-planer/id1522824861 |
| (tło) Kneady: Bread & Baking Recipes | US | darmowa + 2 subskrypcje | 4,80 / 733 (US) | https://itunes.apple.com/lookup?id=1534576984&country=us |

Recenzje: RSS `https://itunes.apple.com/<kraj>/rss/customerreviews/page=1/id=<id>/sortby=mostrecent/json` (Rise US: 37 wpisów, Loaflo US: 28, BreadMe DE: 23, Kneady US: 17). „West Coast Sourdough” (1679 ocen) z wyników wyszukiwania to sieć restauracji, nie narzędzie — pominięta.

## Co musi być prawdą (15 punktów)

### 1. Plan wsteczny od „gotowe na” działa zawsze i usuwa kroki nocne, a jego głównym narzędziem jest chłodna garownia (retard w lodówce), nie tylko przesuwanie godzin
- Obszar: przepływ
- Dowód: BreadMe (DE), recenzja 1★, 2022-04-04: „Leider funktioniert die „Fertig um“-Umrechnung nicht … Morgens den Teig um 02:48 Uhr zu falten kommt nicht in Frage.” — https://itunes.apple.com/de/rss/customerreviews/page=1/id=1522824861/sortby=mostrecent/json
- Dowód: Rise (US), recenzja 3★, 2022-04-11: „what's really needed in a bread making app is being able to select an END time so it could tell you roughly when you'd need to start” — https://itunes.apple.com/us/rss/customerreviews/page=1/id=1515369685/sortby=mostrecent/json
- Dowód: opis Rise (odczyt 2026-11-08): „Use Magic Rise Time widgets to schedule the bulk and proof phases automatically … For proofing, you can even decide to refrigerate overnight” — https://itunes.apple.com/lookup?id=1515369685&country=us
- Wniosek praktyka: planowanie od godziny końcowej to wymóg, którego konkurencja nie spełnia albo spełnia z błędami; piekarz omija noc lodówką, więc plan musi umieć wstawić retard, a nie tylko odmówić kroków nocnych.

### 2. Koniec fermentacji masowej wyznacza obserwacja (temperatura ciasta + procent wzrostu), a harmonogram przelicza się po faktycznym zakończeniu kroku
- Obszar: przepływ
- Dowód: The Sourdough Journey, „Dough temping…”, 2024-05-16: „The method allows you to ignore the clock and simply measure the temperature and percentage rise.” oraz „Warm fermenting dough needs to be cut off earlier than cool fermenting dough.” — https://thesourdoughjourney.com/dough-temping-for-perfect-sourdough-fermentation/
- Dowód: BreadMe, recenzja 5★, 2021-12-31: „die Dauer auch während das Rezept läuft zu ändern, wirklich praktisch, wenn der Sauerteig doch mal weniger/mehr Trieb hat” — RSS BreadMe DE (adres jak w p. 1)
- Dowód: BreadMe, recenzja 5★, 2021-05-04: czasy „automatisch nach hinten zu verschieben, wenn man mit einem Schritt nicht schnell genug fertig wird” (skarga na niekontrolowane kaskadowe przesunięcie) — RSS BreadMe DE
- Wniosek praktyka: zegar jest prognozą, nie prawdą; aplikacja musi pozwolić zakończyć krok wcześniej/później i jawnie pokazać skutek dla „gotowe na”, zamiast cicho przesuwać resztę.

### 3. Powiadomienie o kroku dociera przy zablokowanym telefonie, w trybie Skupienie i przy wielodniowym planie, mieszcząc się w limicie systemu
- Obszar: przepływ
- Dowód: Apple, UILocalNotification (dokumentacja, odczyt 2026-11-08): „the system keeps the soonest-firing 64 notifications … and discards the rest.” — https://developer.apple.com/tutorials/data/documentation/uikit/uilocalnotification.json
- Dowód: Apple, UNNotificationInterruptionLevel.timeSensitive (odczyt 2026-11-08): „can break through system controls such as Notification Summary and Focus. The user can turn off the ability…” — https://developer.apple.com/tutorials/data/documentation/usernotifications/unnotificationinterruptionlevel/timesensitive.json
- Dowód: Rise, recenzja 1★, 2020-12-20: „I just purchased yesterday and have yet to receive notification alarms for feeding my starter.” — RSS Rise US (adres jak w p. 1)
- Wniosek praktyka: obietnica „pilnuje czasu, gdy telefon śpi” jest testowalna tylko na urządzeniu (zablokowany ekran, Skupienie Sen, kilka wypieków + zakwasy naraz < 64 zaplanowanych powiadomień).

### 4. Aktywny wypiek przeżywa zamknięcie aplikacji, awarię zapisu i aktualizację — bez utraty kroków ani receptur
- Obszar: dane
- Dowód: BreadMe, recenzja 1★, 2026-05-06: „Blueprints lassen sich nicht speichern bzw. verschwinden.” — RSS BreadMe DE; notatka wydania 1.3 (2026-07-29): „Bug behoben bei dem die App nicht richtig gespeichert hat” — https://itunes.apple.com/lookup?id=1522824861&country=de
- Dowód: Rise, recenzja 5★ (mimo błędu), 2026-01-17: „it just quits in the middle of my steps.” — RSS Rise US
- Dowód: Loaflo, notatka wydania 6.0.11 (2026-09-07): „Fixed a problem that could leave recipe bake planning stuck on Saving.” — https://itunes.apple.com/lookup?id=6736766728&country=us
- Wniosek praktyka: zapis i odtworzenie stanu w trakcie wypieku to najczęstsza realna awaria w tej kategorii; kopie zapasowe nie zastąpią poprawnego wznowienia kroku.

### 5. Kilka wypieków i kilka zakwasów prowadzi się równolegle, bez kolizji przypomnień
- Obszar: przepływ
- Dowód: BreadMe, recenzja 5★, 2024-06-20: „Wir führen meistens mehrere Teige gleichzeitig” oraz 2021-12-31: „Mehrere Rezepte können parallel laufen” — RSS BreadMe DE
- Dowód: Rise, recenzja 5★, 2020-09-01: „The only shortcoming … is you can only run one recipe at a time.” — RSS Rise US
- Wniosek praktyka: doświadczony piekarz piecze z dwóch zakwasów (pszenny, żytni) i kilka bochenków na raz; jeden aktywny wypiek to narzędzie dla początkującego.

### 6. Procent piekarski jest prawdziwy (mąka i woda z zakwasu, hydratacja zakwasu per zakwas) i formułę da się zapisać w układzie BBGA z przedfermentami
- Obszar: dane
- Dowód: Rise, recenzja 5★, 2022-12-23: „total hydration factoring in your sourdough hydration (that too you can have different sourdough hydration percentages)” — RSS Rise US
- Dowód: Rise, recenzja 4★, 2020-12-07: „it's common for serious bread bakers to keep their recipes in BBGA (Bread Bakers Guild of America) style formulas, which is not possible in this app.” — RSS Rise US
- Wniosek praktyka: liczenie ze składnikami zakwasu to minimum; przewagą dla zaawansowanego jest wieloetapowe budowanie zakwasu (levain build) i widok formuły całkowitej vs. ciasta właściwego.

### 7. Kalkulator temperatury wody (DDT) używa właściwego mnożnika i współczynnika tarcia kalibrowanego na podstawie zmierzonej temperatury ciasta
- Obszar: treść
- Dowód: King Arthur Baking, „Dough Temperature” (odczyt 2026-11-08): „We will multiply this figure by 3 if we are mixing a straight dough, and by 4 if using a preferment.” oraz o tarciu: „It is the most difficult variable to quantify… To determine the friction factor, first a trial dough is made.” — https://www.kingarthurbaking.com/pro/reference/dough-temperature
- Dowód: tamże: „wheat-based doughs should be between 75°F and 78°F at the end of mix time.”
- Dowód: Rise, recenzja 4★, 2022-11-26: „Possible error in Smart DDT calculator … the final temperature does not change when mixing is activated and deactivated” — RSS Rise US
- Dowód: The Fresh Loaf, a.peabody, 2021-10-16, o założeniu wzoru: „Obviously the assumption is not exactly true.” — https://www.thefreshloaf.com/node/68247/explanation-ddt-formula
- Wniosek praktyka: „4-DDT” musi mieć test referencyjny na przykładzie King Arthur (75°F×4, wynik 59°F wody dla 72/72/22) i zapamiętywać tarcie zmierzone u użytkownika; błąd tu psuje cały plan.

### 8. Zasada przy pleśni jest bezwarunkowa (wyrzuć zakwas), a aplikacja nigdy nie „ocenia” bezpieczeństwa zakwasu z obrazu
- Obszar: treść
- Dowód: University of Illinois Extension, „Sourdough Bread: 101” (PDF, odczyt 2026-11-08): „Discard the starter if mold appears.” — https://extension.illinois.edu/media/8391/download
- Dowód: Loaflo, recenzja 1★, 2025-04-16: „I scanned 3 different moldy starters and it rated 2 of them pretty high” — https://itunes.apple.com/us/rss/customerreviews/page=1/id=6736766728/sortby=mostrecent/json
- Wniosek praktyka: w tej dziedzinie ostrożna, stała reguła bije „inteligentną” diagnozę; to też naturalny argument za offline bez AI.

### 9. Doktor chleba zamyka pętlę: diagnoza wady przechodzi w konkretną zmianę następnej receptury i jest porównywana z wynikiem kolejnego wypieku
- Obszar: przepływ
- Dowód: Loaflo, recenzja 4★, 2026-06-20: „there's no follow-up … how about remembering/logging what I was told to do/did last time and building upon that. Seems like each scan thinks it's a new starter each day” — RSS Loaflo US
- Dowód: Loaflo, recenzja 1★, 2025-05-19: „For a month straight it said the exact same thing every single time I scanned” — RSS Loaflo US
- Dowód: Rise, recenzja 5★, 2020-08-05: „track what I change and how it affects the final loaves.” — RSS Rise US
- Wniosek praktyka: „pomaga poprawiać następny wypiek” jest prawdą tylko, gdy dziennik łączy ocenę, przyczynę, zmienioną zmienną i następną ocenę; 9 wad bez tej pętli to artykuł, nie narzędzie.

### 10. Jednostki: gramy jako prawda, ale amerykański użytkownik dostaje uncje/funty (i świadomie ograniczone miary objętości) bez utraty precyzji
- Obszar: treść
- Dowód: Kneady, recenzja 3★, 2021-10-23: „in Arizona we use cups, tablespoons, and teaspoons (and we weigh in ounces, pounds).” oraz 4★, 2023-05-04: „everything is in metric!! How many cups is 600g of flour???” — https://itunes.apple.com/us/rss/customerreviews/page=1/id=1534576984/sortby=mostrecent/json
- Dowód: Rise, recenzja 3★, 2022-04-11: „you can't enter tsp amounts smaller than 1/2 tsp.” — RSS Rise US
- Dowód: Loaflo, recenzja 3★, 2026-01-19: „Please include metric weight measurements in the recipes.” — RSS Loaflo US
- Wniosek praktyka: rynek USA żąda obu systemów; małe ilości (sól, drożdże) muszą mieć precyzję 0,1 g i sensowne przeliczenie.

### 11. Baza mąk i tłumaczenia znają lokalne typy mąki (DE Type 405/550/1050, PL typ 650/750, US AP/bread flour), a nie tylko przetłumaczone nazwy
- Obszar: treść
- Dowód: de.wikipedia „Mehl”, sekcja „Mehltypen” (odczyt 2026-11-08): „Die Mehltype gibt den mittleren Mineralstoffgehalt in mg je 100 g Trockenmasse an.” oraz „In Österreich ist die DIN-Typisierung nicht gültig” — https://de.wikipedia.org/wiki/Mehl
- Dowód: BreadMe, recenzja 3★, 2026-02-24: „dass ich die Sprache nicht einstellen kann. Wird es hier eine deutsche Option geben, wie es die Verkaufsbilder suggerieren?” — RSS BreadMe DE
- Wniosek praktyka: przy 35 językach jakość lokalizacji ocenia się po terminach piekarskich i typach mąki danego kraju (nawet DE/AT różnią się normą); zgodność zrzutów ekranu z językiem aplikacji jest sprawdzana przez użytkowników.

### 12. Darmowy poziom jest użyteczny sam w sobie, a granica Pro jest opisana przed zakupem; brak ukrytej ściany płatności
- Obszar: pieniądze
- Dowód: App Store Review Guidelines 3.1.2(c) (odczyt 2026-11-08): „Before asking a customer to subscribe, you should clearly describe what the user will get for the price.” — https://developer.apple.com/app-store/review/guidelines/
- Dowód: Loaflo, recenzja 1★, 2026-02-25: „Despite not being mentioned in the description, you do have to pay a subscription for all of the features … everything you click on results in a pop-up”; 1★, 2026-04-07: „the paywall keeps popping up with a timer” — RSS Loaflo US
- Dowód: Rise, recenzja 5★, 2021-03-27: „I've been using this app for months with just the free features … I finally upgraded” — RSS Rise US
- Wniosek praktyka: model Rise (długi, uczciwy darmowy poziom → dobrowolny upgrade) zbiera 4,87★; model Loaflo (agresywna ściana) zbiera serie 1★ mimo 567 ocen.

### 13. Subskrypcja ma uzasadnioną „bieżącą wartość” mimo braku chmury i jednego urządzenia; kotwicą ceny jest zakup dożywotni na poziomie rynku
- Obszar: pieniądze
- Dowód: App Store Review Guidelines 3.1.2(a): „you must provide ongoing value to the customer, and the subscription period must last at least seven days and be available across all of the user's devices.” — https://developer.apple.com/app-store/review/guidelines/ (odczyt 2026-11-08)
- Dowód: ceny konkurencji (odczyt 2026-11-08): Rise 14,99 USD/rok lub 19,99 USD jednorazowo (z synchronizacją między urządzeniami: „Rise syncs across all of your devices”); BreadMe 2,99 EUR jednorazowo; Loaflo 39,99 USD/rok — adresy w tabeli wyżej
- Dowód: Loaflo, recenzja 1★, 2026-08-06: „I'm not paying 6 dollars weekly” — RSS Loaflo US
- Wniosek praktyka: aplikacja offline bez synchronizacji i tylko na iPhone konkuruje z Rise, które za 19,99 USD daje sync i iPada; subskrypcja musi mieć opis wartości ciągłej odporny na przegląd Apple (3.1.2(a)), a dożywotnia cena nie może odstawać od 15–20 USD.

### 14. Etykieta prywatności w sklepie brzmi „Dane nie są zbierane” i jest prawdziwa także dla diagnostyki i zakupów
- Obszar: prywatność
- Dowód: BreadMe DE, etykieta (odczyt 2026-11-08): „Keine Daten erfasst … Der Entwickler erfasst keine Daten von dieser App.” — https://apps.apple.com/de/app/breadme-sauerteig-planer/id1522824861 ; recenzja 5★, 2021-06-01: „Und Mann muss ich dabei nicht Anmelden :)” — RSS BreadMe DE
- Dowód: Rise, etykieta (odczyt 2026-11-08): „Data Not Linked to You: Purchases … Identifiers … Usage Data … Diagnostics”; Loaflo: „Data Linked to You … Identifiers: User ID, Device ID” — adresy apps.apple.com w tabeli; notatka wydania Loaflo 6.0.11: „improvements to subscription analytics” — https://itunes.apple.com/lookup?id=6736766728&country=us
- Wniosek praktyka: „bez śledzenia” to realny wyróżnik wobec liderów USA, ale tylko jeśli żaden SDK subskrypcji/raportowania awarii nie zbiera danych; inaczej etykieta „Dane nie są zbierane” jest fałszywa, a BreadMe już ją ma.

### 15. Rynek jest niszowy i spolaryzowany: wygrywa wiarygodność (brak błędów, odpowiedź twórcy), nie liczba funkcji — liczba ocen poza USA jest śladowa
- Obszar: wzrost
- Dowód: iTunes Search API (odczyt 2026-11-08): Rise 337 ocen w US vs 11 w DE; Loaflo 567 w US vs 1 w DE; najlepiej oceniany planer DE (BreadMe) ma 44 oceny w 6 lat — https://itunes.apple.com/search?term=sourdough&entity=software&country=us ; https://itunes.apple.com/search?term=sourdough&entity=software&country=de
- Dowód: BreadMe, recenzja 2★, 2025-03-26: „leider keine Rückmeldung vom Entwickler … die 3€ verschenkt.”; Loaflo, recenzja 5★, 2025-12-31: „so is their customer service … they were prompt in fixing it” — RSS BreadMe DE, RSS Loaflo US
- Dowód: wyszukiwanie „sourdough” US (odczyt 2026-11-08): 13 z 15 wyników zaktualizowano w 2026 r., a 10 z 15 ma 0–9 ocen (np. Sourdough Simplified 0, LoafCoach 7, Sourdough AI 5) — adres jak wyżej
- Wniosek praktyka: przy progu 500 USD netto/rok globalnie rynek USA jest główny, a 35 języków daje zasięg, nie gwarancję popytu; w zatłoczonej, świeżej niszy wyróżnia się trwała niezawodność i kanał zgłoszeń z odpowiedzią.

## Zastrzeżenia
- Strony USDA FSIS (pleśń) zwróciły HTTP 403/503 — nie użyto; zasadę przy pleśni oparto na University of Illinois Extension.
- Ceny IAP i etykiety prywatności odczytano z apps.apple.com przez narzędzie streszczające (WebFetch); metadane i recenzje — z surowego JSON (iTunes Search/Lookup API, RSS). Treść stron traktowano jako dane.
- Przykład liczbowy DDT (75°F×4 → 59°F wody) pochodzi z wpisu King Arthur odnalezionego w wyszukiwarce (https://www.kingarthurbaking.com/blog/2018/05/29/desired-dough-temperature), nie z cytatu odczytanego bezpośrednio.

# Soczewka 1 — nowy użytkownik w pierwszym tygodniu, bez instrukcji

Data badania: 2026-11-08. Podstawa: wyłącznie cel i skrót opisu ze sklepu podane w poleceniu, plus źródła zewnętrzne niżej. Repo i dokumenty projektu nie były otwierane.

## Przeczytane alternatywy (2026-11-08)

| Aplikacja | Rynek | Cena (iTunes API) | Oceny | Języki | Źródło |
|---|---|---|---|---|---|
| Rise: Baking & Bread Recipes (Made by Windmill) | US | Free + zakup w aplikacji | 4,87 / 337 (US); 4,91 / 11 (DE) | tylko EN | https://itunes.apple.com/lookup?id=1515369685&country=us |
| Loaflo: Sourdough Starter (No Worries Lifestyle) | US | Free + subskrypcja (z recenzji: „6 dollars weekly”, „$30/y”) | 4,69 / 567 (US); 1,0 / 1 (DE) | tylko EN | https://itunes.apple.com/lookup?id=6736766728&country=us |
| Kneady: Bread & Baking Recipes (Quillbound) | US | Free + 2 subskrypcje „Kneady Pro” | 4,80 / 733 | tylko EN | https://itunes.apple.com/lookup?id=1534576984&country=us |
| BreadMe – Sauerteig planer (Ferdinand Werner) | DE | 2,99 € jednorazowo | 4,34 / 44 | NL, EN, FR, DE, RU | https://itunes.apple.com/lookup?id=1522824861&country=de |

Rynek PL (wyszukiwanie „zakwas”, https://itunes.apple.com/search?term=zakwas&entity=software&country=pl, 2026-11-08): 10 wyników, wszystkie anglojęzyczne nazwy, najwięcej 2 oceny („Wirtualny Piekarz”, 5,0 / 2); Rise ma w PL 5 ocen. Rynek DE („sauerteig brot”, country=de): 10 wyników, najwięcej 13 ocen („proofit”, 4,62). Recenzje: RSS `https://itunes.apple.com/{us|de}/rss/customerreviews/page=1/id=<id>/sortby=mostrecent/json`, pobrane 2026-11-08; data przy cytacie to data recenzji.

## Co musi być prawdą (15 punktów)

### 1. Pierwszy pełny wypiek przechodzi się w Basic, bez ściany płatności przy każdym dotknięciu
Obszar: **przepływ / pieniądze**
Nowy użytkownik ocenia aplikację po pierwszym bochenku; jeśli darmowa część to tylko witryna, odchodzi w dniu 1 z oceną 1★.
- Loaflo, US, 1★, 2026-02-25: „At first, it appears like you can use it without a subscription, but everything you click on results in a pop-up, trying to force you into the sub subscr[iption]” — https://itunes.apple.com/us/rss/customerreviews/page=1/id=6736766728/sortby=mostrecent/json
- Loaflo, US, 1★, 2025-03-26: „You get one single scan, everything else is locked behind paywalls.” — tamże
- Kneady, US, 4★, 2026-07-27: „some of the most appealing recipes I have seen are stuck behind a paywall” — https://itunes.apple.com/us/rss/customerreviews/page=1/id=1534576984/sortby=mostrecent/json

### 2. Przed zakupem wiadomo dokładnie, co daje Pro i za ile; anulowanie i przywrócenie zakupu są w aplikacji
Obszar: **pieniądze / wydanie**
- Loaflo, US, 1★, 2026-04-07: „I hate when apps don’t advertise a subscription based service in the photos or descriptions— not to mention the paywall keeps popping up with a timer.” — RSS Loaflo jw.
- Loaflo, US, 1★, 2026-03-07: „there are no account options in the app to cancel or contact”; 2026-02-21: „Can’t cancel my free trial” — RSS Loaflo jw.
- Apple App Review Guidelines 3.1.2(c): „Before asking a customer to subscribe, you should clearly describe what the user will get for the price.”; 3.1.1: „make sure you have a restore mechanism for any restorable in-app purchases” — https://developer.apple.com/app-store/review/guidelines/ (pobrane 2026-11-08)
- Tamże 3.1.2(a): subskrypcja odnawialna „must provide ongoing value to the customer” — przy aplikacji tylko na iPhone, bez synchronizacji, Pro w subskrypcji musi uzasadniać się stałą wartością, a dożywotni zakup musi być równorzędnie widoczny.

### 3. „Gotowe o …” liczy plan wstecz niezawodnie i nie stawia żadnego kroku w nocy
Obszar: **przepływ**
- BreadMe, DE, 1★, 2022-04-04: „Leider funktioniert die „Fertig um“-Umrechnung nicht. Es springt immer wieder zu „Beginnen um“ um. […] Morgens den Teig um 02:48 Uhr zu falten kommt nicht in Frage.” — https://itunes.apple.com/de/rss/customerreviews/page=1/id=1522824861/sortby=mostrecent/json
- Rise, US, 5★, 2026-01-24: „you will accurately dynamically know what time on the clock to perform every step. This takes away the anxiety” — https://itunes.apple.com/us/rss/customerreviews/page=1/id=1515369685/sortby=mostrecent/json
- Rise, opis w sklepie: „dynamically calculating bulk rise and proof times using your dough’s temperature and ingredients” — lookup Rise jw. To jest poziom odniesienia dla „planu z temperaturą kuchni”.

### 4. Plan da się zmienić w trakcie: krok wcześniej, cofnięcie, dodanie czasu, pauza — a powiadomienia przesuwają się razem z nim
Obszar: **przepływ**
- Rise, opis: „Flexible scheduling means you can finish a step early, back up a step, or add more time if needed” — lookup Rise jw.
- Rise, US, 4★, 2021-04-30: „Need a simple timer PAUSE function so that there’s no need to keep adding more time” — RSS Rise jw.
- BreadMe, DE, 5★, 2020-12-20: „super praktisch, dass man den Startzeitpunkt einzelner Schritte nach hinten verschieben kann, wenn es doch mal länger dauert” — RSS BreadMe jw.

### 5. Powiadomienie przy zablokowanym telefonie naprawdę dociera — także w trybie Sen/Skupienie — a brak zgody jest widoczny, nie cichy
Obszar: **przepływ / wydanie**
To główna obietnica („pilnuje czasu, gdy telefon śpi”); pierwsza niedoszła notyfikacja przekreśla zaufanie.
- Rise, US, 1★, 2020-12-20: „I just purchased yesterday and have yet to receive notification alarms for feeding my starter.” — RSS Rise jw.
- Apple WWDC21 „Send communication and Time Sensitive notifications”: Skupienie „will filter the presentation and interruption of notifications”; Time Sensitive „can break through system controls such as notification summary and Focus, if it has been allowed” i „should only be used when it is relevant to actively interrupt” — https://developer.apple.com/videos/play/wwdc2021/10091/ (pobrane 2026-11-08)
- Apple, dokumentacja UILocalNotification: system „keeps the soonest-firing 64 notifications […] and discards the rest” — https://developer.apple.com/documentation/uikit/uilocalnotification (wg wyszukiwania 2026-11-08; dotyczy starego API, dla nowego brak oficjalnej liczby) — plan wielodniowy z wieloma zakwasami nie może zakładać nieograniczonej liczby zaplanowanych powiadomień.
- Apple Guidelines 4.5.4: „Push Notifications must not be required for the app to function” — aplikacja musi działać sensownie także bez zgody (widoczny stan na ekranie kroku).

### 6. Kilka wypieków i kilka zakwasów może biec równolegle bez gubienia się
Obszar: **przepływ / dane**
- BreadMe, DE, 5★, 2021-12-31: „Mehrere Rezepte können parallel laufen, sodass man nicht den Überblick zwischen den Broten verliert.” — RSS BreadMe jw.
- BreadMe, DE, 5★, 2024-06-20: „Wir führen meistens mehrere Teige gleichzeitig” — tamże
- Rise, US, 5★, 2020-09-01: „The only shortcoming that i can find is you can only run one recipe at a time.” — RSS Rise jw.

### 7. Kalkulator liczy hydratację całkowitą (z wodą i mąką zakwasu) i przyjmuje małe ilości z dokładnością do dziesiątych grama
Obszar: **dane / treść**
- Rise, US, 5★, 2022-12-23: chwalone „total hydration factoring in your sourdough hydration (that too you can have different sourdough hydration percentages)” — RSS Rise jw.
- Rise, US, 3★, 2022-04-11: „you can’t enter tsp amounts smaller than 1/2 tsp. […] That makes the app unuseable for me.” — tamże
- Rise, US, 4★, 2022-11-26: zgłoszony podejrzany błąd kalkulatora DDT („final dough temperature is above the temperature of the ingredients even though mixing is turned off”) — tamże; wynik 4-DDT musi być wyjaśnialny (pokazać składniki wzoru).

### 8. Jednostki pasują do rynku: gramy jako podstawa, ale użytkownik z USA widzi też uncje/szklanki albo przelicznik
Obszar: **treść**
- Kneady, US, 4★, 2023-05-04: „everything is in metric!! How many cups is 600g of flour???” — RSS Kneady jw.
- Kneady, US, 3★, 2021-10-23: „in Arizona we use cups, tablespoons, and teaspoons (and we weigh in ounces, pounds)” — tamże
- Loaflo, US, 3★, 2026-01-19: „Please include metric weight measurements in the recipes.” — RSS Loaflo jw. (oba kierunki: potrzebny przełącznik, nie jedna konwencja).

### 9. W dniu 1 aplikacja nie jest pusta: są gotowe receptury startowe i ścieżka „zakwas od zera”
Obszar: **treść / przepływ**
- BreadMe, DE, 1★, 2023-08-12: „Für ein Leeres App bekommen Die Geld?” — RSS BreadMe jw.
- BreadMe, DE, 4★, 2023-11-23: „ganz genial wäre es, wenn ein paar Grundrezepte hinterlegt wären, z.B. Ansetzen eines Sauerteigs” — tamże
- Loaflo, US, 1★, 2026-03-07: „This was advertised as a helper for beginners, starting with the starter. […] There’s 1 starter recipe, that’s it.” — RSS Loaflo jw.

### 10. Zasada ostrożności przy pleśni jest jednoznaczna i nigdy nie uspokaja przy oznakach zepsucia; hooch jest odróżniony od pleśni
Obszar: **treść** (bezpieczeństwo żywności)
- King Arthur Baking, „Sourdough starter troubleshooting”, B. Alpern, 2018-03-09: „if you see a pink or orange tint or streak, this is a sure sign that your sourdough starter has gone bad and should be discarded.”; „The presence of hooch isn’t a sign that your starter is in danger.” — https://www.kingarthurbaking.com/blog/2018/03/09/sourdough-starter-troubleshooting-2 (pobrane 2026-11-08)
- Loaflo, US, 1★, 2025-04-16: „I scanned 3 different moldy starters and it rated 2 of them pretty high” — RSS Loaflo jw. Ostrzeżenie: konkurent z AI zawodzi właśnie tu; reguła deterministyczna („wątpisz — wyrzuć”) to przewaga, o ile jest widoczna od pierwszego dnia z zakwasem.

### 11. Doktor chleba i dziennik zamykają pętlę: porada pamięta poprzedni wypiek i kończy się konkretną zmianą w następnym planie
Obszar: **przepływ / dane**
- Loaflo, US, 4★, 2026-06-20: „…now what? […] Make me a schedule I can put in my phone to tell me what to do AND WHEN. And how about remembering/logging what I was told to do/did last time and building upon that.” — RSS Loaflo jw.
- Loaflo, US, 1★, 2025-05-19: „For a month straight it said the exact same thing every single time I scanned” — tamże
- Rise, US, 5★, 2020-08-05: „track what I change and how it affects the final loaves” — RSS Rise jw.

### 12. Nic, co użytkownik wpisał, nie znika; aplikacja nie zamyka się w środku wypieku i po ponownym uruchomieniu wraca do bieżącego kroku
Obszar: **dane**
- BreadMe, DE, 1★, 2026-05-06: „Blueprints lassen sich nicht speichern bzw. verschwinden.” — RSS BreadMe jw.
- Rise, US, 5★ (z zarzutem), 2026-01-17: „it just quits in the middle of my steps. Quit during preheating.”; 1★, 2026-01-24: „the app just idles without ever loading” — RSS Rise jw.
- Kneady, US, 1★, 2023-12-19: „you can’t save custom recipes. In my opinion this is a critical basic feature” — RSS Kneady jw.

### 13. „Offline, bez konta, bez śledzenia” jest widoczne w sklepie i prawdziwe w etykiecie prywatności — i oznacza, że działa każdego dnia
Obszar: **prywatność / wydanie**
- Loaflo, opis: „No Account Needed: Dive right into baking without any account sign-up.” — lookup Loaflo jw. (konkurencja już sprzedaje „bez konta”, więc samo to nie wyróżnia; wyróżnia „offline + brak zbierania danych”).
- Loaflo, US, 2★, 2026-10-08: „WHEN it works, it’s great, but it rarely works during the week” — RSS Loaflo jw. (zależność od serwera; offline musi oznaczać brak takich awarii).
- BreadMe, DE, 5★, 2021-06-01: „Mann muss sich nicht anmelden :)” — RSS BreadMe jw.
- Apple Guidelines 2.3: „make sure all your app metadata, including privacy information […] accurately reflect the app’s core experience”; 5.1.1(v): „let people use it without a login” — https://developer.apple.com/app-store/review/guidelines/

### 14. Język aplikacji jest taki, jaki obiecują zrzuty i opis w danym sklepie, od pierwszego ekranu
Obszar: **treść / wydanie / wzrost**
- BreadMe, DE, 3★, 2026-02-24: „dass ich die Sprache nicht einstellen kann. Wird es hier eine deutsche Option geben, wie es die Verkaufsbilder suggerieren?” — RSS BreadMe jw.
- Rise, Loaflo i Kneady deklarują tylko EN (`languageCodesISO2A`: ["EN"]) — lookup jw., 2026-11-08. W PL wyszukiwanie „zakwas” zwraca same anglojęzyczne nazwy z ≤2 ocenami — rzetelna lokalizacja (nazwa, zrzuty, treść Doktora, jednostki) jest realną szczeliną, ale tylko gdy jest pełna.

### 15. Użytkownik w kłopocie ma kontakt z twórcą w aplikacji i odpowiedź; prośba o ocenę pada po udanym wypieku, nigdy jako warunek
Obszar: **wzrost**
- Loaflo, US, 5★, 2025-12-31: „so is their customer service. I was having an issue and they were prompt in fixing it” — RSS Loaflo jw.
- BreadMe, DE, 2★, 2025-03-26: „Diese habe ich an den Entwickler kommuniziert, aber auch nach Rückfrage kein Feedback erhalten. Schade” — RSS BreadMe jw.
- Rynek: w DE największy wynik dla „sauerteig brot” ma 13 ocen, w PL ≤2 — pierwsze kilkadziesiąt ocen decyduje o widoczności (wyszukiwania iTunes jw., 2026-11-08).
- Apple Guidelines 3.2.2(x): „Apps must not force users to rate the app, review the app […] in order to access functionality” — https://developer.apple.com/app-store/review/guidelines/

## Ograniczenia tej soczewki
- Cen w aplikacji nie zwraca iTunes API; ceny Loaflo pochodzą z recenzji, nie z cennika.
- Strona USDA o pleśniach (fsis.usda.gov) zwróciła „Access Denied” 2026-11-08; źródłem zasady pleśni jest King Arthur Baking (blog producenta mąki, nie urząd).
- Limit 64 powiadomień potwierdzony tylko dla starego API Apple; dla UNUserNotificationCenter brak oficjalnej liczby.

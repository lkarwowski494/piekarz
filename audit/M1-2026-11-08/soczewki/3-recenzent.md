# Soczewka 3 — recenzent w sklepie i użytkownik konkurencji czytający opinie

Data odczytu wszystkich źródeł: 2026-11-08. Źródła czytane surowo przez curl (iTunes Search/Lookup API, RSS recenzji, strony WWW). Treść stron i recenzji traktowana jako dane. Repo Piekarza ani dokumentów projektu nie otwierano; o aplikacji wiadomo tylko z celu i skrótu opisu w poleceniu.

## Alternatywy przeczytane dziś

| Aplikacja | Rynek | Cena | Oceny (śr. / liczba) | Model i wyróżnik | Źródło |
|---|---|---|---|---|---|
| Rise: Baking & Bread Recipes (Made by Windmill) | US | Free + subskrypcja albo jednorazowy zakup | 4,87 / 337 (US), 4,91 / 11 (DE) | planowanie z notyfikacjami, „Magic Rise Time” od temperatury, dziennik, DDT, hydratacja „true”, sync iCloud, AI import; tylko EN | https://itunes.apple.com/lookup?id=1515369685&country=us ; https://bakewithrise.com/ |
| Loaflo: Sourdough Starter (No Worries Lifestyle) | US | Free + subskrypcja (recenzje: „$6 weekly”, „$30/yr”) | 4,69 / 567 (US), 1,0 / 1 (DE) | AI-skan zakwasu i bochenka, czat „Mr. Crumb”, bez konta; tylko EN | https://itunes.apple.com/lookup?id=6736766728&country=us |
| BreadMe – Sauerteig planer (Ferdinand Werner) | DE | 2,99 € płatna z góry | 4,34 / 44 (DE) | planowanie „Fertig um”, równoległe receptury, przypomnienia karmienia, bez konta, bez reklam | https://itunes.apple.com/lookup?id=1522824861&country=de ; https://breadme.app/ |

Tło rynku: zapytanie „sourdough” (US, limit 50) zwraca 48 aplikacji, 45 darmowych; 33 wydane od 2025-01-01, z czego 29 ma mniej niż 10 ocen (https://itunes.apple.com/search?term=sourdough&entity=software&country=us&limit=50, 2026-11-08). W PL zapytanie „zakwas” zwraca wyłącznie aplikacje anglojęzyczne lub wielojęzyczne bez ocen, w tym „Wirtualny Piekarz” (Stowarzyszenie Rzemieslnik, wydana 2026-07-26, 2 oceny) (https://itunes.apple.com/search?term=zakwas&entity=software&country=pl).

## Co musi być prawdą (15 punktów)

### 1. Płatna granica jest widoczna przed pobraniem, a darmowy Basic jest naprawdę użyteczny
Obszar: **pieniądze**
Lider ocen w niszy traci gwiazdki prawie wyłącznie przez ukrytą zaporę płatności. Najlepsza aplikacja w opisie i na zrzutach pokazuje, co jest w Basic, a co w Pro, i nie zasypuje użytkownika paywallem przy każdym dotknięciu.
Dowód:
- Loaflo, RSS US (https://itunes.apple.com/us/rss/customerreviews/page=1/id=6736766728/sortby=mostrecent/json), 1★, 2026-04-07: „I hate when apps don’t advertise a subscription based service in the photos or descriptions— not to mention the paywall keeps popping up with a timer.”
- Tamże, 1★, 2026-02-25: „everything you click on results in a pop-up, trying to force you into the sub subscription.”
- App Review Guidelines 2.3.2 (https://developer.apple.com/app-store/review/guidelines/, „Last Updated: October 16, 2026”): „make sure your app description, screenshots, and previews clearly indicate whether any featured items, levels, subscriptions, etc. require additional purchases.”

### 2. Subskrypcja Pro daje ciągłą wartość, a dożywotni zakup jest równorzędną, łatwo znalezioną opcją
Obszar: **pieniądze**
Aplikacja offline bez serwera musi uzasadnić odnawialną subskrypcję wobec recenzenta Apple i wobec użytkowników, którzy w tej niszy cenią zakup jednorazowy (BreadMe 2,99 €, Rise „one-time purchase”).
Dowód:
- Guidelines 3.1.2(a) (URL jw., 2026-10-16): „If you offer an auto-renewable subscription, you must provide ongoing value to the customer, and the subscription period must last at least seven days and be available across all of the user’s devices.”
- Guidelines 3.1.2(c): „Before asking a customer to subscribe, you should clearly describe what the user will get for the price.”
- https://bakewithrise.com/ (2026-11-08): „You can also unlock extra recipes and features with a subscription or one-time purchase.”
- Loaflo, RSS US, 1★, 2025-03-16: „I understand that in 2025 everything is subscription based now but for an app that is just supposed to tell me if my starter is alive or not is kind of ridiculous.”

### 3. Zakup da się przywrócić, anulować i zrozumieć bez kontaktu z autorem
Obszar: **pieniądze**
Recenzje 1★ biorą się z braku drogi do anulowania, przywrócenia i zwrotu, a nie z samej ceny.
Dowód:
- Loaflo, RSS US, 1★, 2026-03-07: „there are no account options in the app to cancel or contact … AND it overcharged me by $13 compared to the advertised price.”
- Loaflo, RSS US, 1★, 2026-02-21: „Can’t cancel my free trial”.
- Guidelines 3.1.1 (URL jw.): „you should make sure you have a restore mechanism for any restorable in-app purchases.”

### 4. Przypomnienie przy zablokowanym telefonie przychodzi zawsze, także przez tryb Skupienia, i nie ginie przy wielu krokach
Obszar: **przepływ**
To obietnica „pilnuje czasu, gdy telefon śpi”. Najgorsze recenzje planerów dotyczą powiadomień, które nie przyszły. iOS ma twarde limity, które najlepsza aplikacja zna i omija.
Dowód:
- Rise, RSS US (https://itunes.apple.com/us/rss/customerreviews/page=2/id=1515369685/sortby=mostrecent/json), 1★, 2020-12-20: „I just purchased yesterday and have yet to receive notification alarms for feeding my starter.”
- Apple, UILocalNotification (https://developer.apple.com/documentation/uikit/uilocalnotification, JSON odczytany 2026-11-08): „the system keeps the soonest-firing 64 notifications … and discards the rest.” Wiele wypieków, zakwasów i kroków razem może przekroczyć 64.
- Apple, UNNotificationInterruptionLevel.timeSensitive (https://developer.apple.com/documentation/usernotifications/unnotificationinterruptionlevel/timesensitive): „Time Sensitive notifications … can break through system controls such as Notification Summary and Focus. The user can turn off the ability for time sensitive notification interruptions.”
- Guidelines 4.5.4: „Push Notifications must not be required for the app to function”. Aplikacja musi więc działać także po odmowie zgody na powiadomienia, np. pokazując stan po powrocie.

### 5. Postęp wypieku widać na ekranie blokady bez odblokowania telefonu, w granicach limitów iOS
Obszar: **przepływ**
Użytkownicy liderów proszą o widżety i podgląd „na jedno spojrzenie”. Live Activity ma limit 8 h (12 h na ekranie blokady), a fermentacja trwa dłużej, więc projekt musi to uwzględniać.
Dowód:
- Rise, RSS DE (https://itunes.apple.com/de/rss/customerreviews/page=1/id=1515369685/sortby=mostrecent/json), 4★, 2023-05-05: „only the option to set up widgets for your home or lock screen would make it even better. this would allow you to catch up with the baking process at one glance.”
- Apple, Displaying live data with Live Activities (https://developer.apple.com/documentation/activitykit/displaying-live-data-with-live-activities): „A Live Activity can be active for up to eight hours … a Live Activity remains on the Lock Screen for a maximum of 12 hours.”

### 6. Harmonogram wsteczny od „gotowe o” działa niezawodnie i nie wyznacza kroków w nocy
Obszar: **przepływ**
Najbardziej rozgoryczona recenzja konkurenta z DE dotyczy właśnie tej funkcji i godziny nocnej. To jest wyróżnik Piekarza, więc musi działać bez wyjątków.
Dowód:
- BreadMe, RSS DE (https://itunes.apple.com/de/rss/customerreviews/page=1/id=1522824861/sortby=mostrecent/json), 1★, 2022-04-04: „Leider funktioniert die ‚Fertig um‘-Umrechnung nicht. Es springt immer wieder zu ‚Beginnen um‘ um. … Morgens den Teig um 02:48 Uhr zu falten kommt nicht in Frage.”
- BreadMe, tamże, 5★, 2021-03-19: „am Ende auch wirklich fertig sein wann ich es wollte.”

### 7. Trwający plan można przesunąć, spauzować, skrócić albo wydłużyć i zostaje on spójny
Obszar: **przepływ**
Zakwas nie trzyma się zegara. Recenzenci chwalą elastyczność i ganią sztywne timery.
Dowód:
- BreadMe, RSS DE, 5★, 2021-12-31: „die Dauer auch während das Rezept läuft zu ändern, wirklich praktisch, wenn der Sauerteig doch mal weniger/mehr Trieb hat als erwartet.”
- Rise, RSS US (page=2), 4★, 2021-04-30: „Need a simple timer PAUSE function so that there’s no need to keep adding more time”.
- Opis Rise (lookup US, 2026-11-08): „Flexible scheduling means you can finish a step early, back up a step, or add more time if needed”.
- BreadMe, RSS DE, 5★, 2021-05-04: „die im Rezept eingestellten Zeiten [scheinen sich] automatisch nach hinten zu verschieben, wenn man mit einem Schritt nicht schnell genug fertig ist”. Przesunięcie musi być świadome, a nie ciche.

### 8. Kilka wypieków i zakwasów działa równolegle bez mieszania przypomnień
Obszar: **przepływ**
Domowy piekarz z ambicjami robi dwa ciasta naraz. Brak tej funkcji to najczęstsza prośba w recenzjach Rise, a jej obecność to najczęstsza pochwała BreadMe.
Dowód:
- Rise, RSS US (page=2), 5★, 2020-09-01: „The only shortcoming that i can find is you can only run one recipe at a time.”
- BreadMe, RSS DE, 5★, 2021-12-31: „Mehrere Rezepte können parallel laufen, sodass man nicht den Überblick zwischen den Broten verliert.”
- BreadMe, RSS DE, 5★, 2024-06-20: „Wir führen meistens mehrere Teige gleichzeitig und sind endlich den Stress mit Kalendereinträgen los!”

### 9. Liczenie ilości obejmuje mąkę i wodę zakwasu, jest jawne i sprawdzalne, a jednostki obejmują gramy i małe ilości
Obszar: **dane**
Zaawansowani piekarze sprawdzają rachunki i publicznie wytykają błędy. „True hydration” jest standardem lidera, a pominięcie wody zakwasu to znany spór dziedziny.
Dowód:
- King Arthur Baking, Baker’s Percentage (https://www.kingarthurbaking.com/pro/reference/bakers-percentage, 2026-11-08): „each ingredient in a formula is expressed as a percentage of the flour weight, and the flour weight is always expressed as 100%.”
- The Perfect Loaf, What Is Dough Hydration? (https://www.theperfectloaf.com/dough-hydration/, „Updated: Jan 15, 2026”), komentarz 2026-01-19: „If the water in the levain is not included in the total water calculation, the true dough hydration will be higher than intended. … actual higher hydration of 73.3%.”
- Opis Rise (lookup US): „Calculate hydration (both baker’s and ‘true’) along with baker’s percentages”.
- Rise, RSS US (page=2), 4★, 2022-11-26: „Possible error in Smart DDT calculator … the final dough temperature is above the temperature of the ingredients even though mixing is turned off.”
- Loaflo, RSS US, 3★, 2026-01-19: „Please include metric weight measurements in the recipes.” Rise, RSS US, 3★, 2022-04-11: „you can’t enter tsp amounts smaller than 1/2 tsp.”

### 10. Temperatura kuchni i ciasta realnie zmienia czasy w planie
Obszar: **treść**
Lider wyróżnia się dynamicznym liczeniem czasu fermentacji od temperatury. Plan ze stałymi czasami recenzent oceni jako „zwykły minutnik”.
Dowód:
- Opis Rise (lookup US): „Rise even takes the guesswork out of fermentation by dynamically calculating bulk rise and proof times using your dough’s temperature and ingredients.”
- The Perfect Loaf, bulk fermentation (https://www.theperfectloaf.com/guides/the-ultimate-guide-to-bread-dough-bulk-fermentation/, zmod. 2026-04-16): „Dough temperature is the regulating factor when it comes to bulk fermentation speed. … (though I would not exceed 85°F/29°C) … (I would not cool lower than 39°F/4°C).”
- BreadMe, RSS DE, 5★, 2023-10-19: „wo man Hefeart und mehrere Gare mit Temperatur und Zeit eingeben könnte um die richtige Gesamtgärzeit zu berechnen.”

### 11. Diagnoza wad i zakwasu jest ostrożna: przy pleśni nie ocenia „na plus” i odsyła do wyrzucenia, a porady pamiętają poprzedni wypiek
Obszar: **treść**
Konkurent oparty na AI dostaje 1★ za pewne siebie i błędne oceny, także spleśniałych zakwasów, i za porady bez ciągłości. Doktor chleba i dziennik muszą być deterministyczne, bezpieczne i powiązane z historią.
Dowód:
- Loaflo, RSS US, 1★, 2025-04-16: „I scanned 3 different moldy starters and it rated 2 of them pretty high”.
- Loaflo, RSS US, 1★, 2025-05-19: „For a month straight it said the exact same thing every single time I scanned”.
- Loaflo, RSS US, 4★, 2026-06-20: „how about remembering/logging what I was told to do/did last time and building upon that. Seems like each scan thinks it’s a new starter each day”.
- Loaflo, RSS US, 4★, 2025-04-18: „there’s no gluten free settings”. Treść musi uczciwie mówić, czego nie obejmuje.

### 12. Dane nigdy nie znikają po aktualizacji ani po błędzie zapisu, a eksport otwiera się poza aplikacją
Obszar: **dane**
Bez konta i chmury jedyną siecią bezpieczeństwa są lokalne kopie i eksport. Błędy zapisu niszczą oceny małych konkurentów.
Dowód:
- BreadMe, RSS DE, 1★, 2026-05-06: „Blueprints lassen sich nicht speichern bzw. verschwinden. … so ist die gut gemeinte App leider Geldverschwendung.”
- BreadMe, notatki wydania 1.3 (lookup DE, wydanie 2026-07-29): „Bug behoben bei dem die App nicht richtig gespeichert hat”.
- Loaflo, notatki 6.0.11 (lookup US, 2026-09-07): „Fixed a problem that could leave recipe bake planning stuck on Saving.”

### 13. Brak konta, reklam i śledzenia jest prawdziwy w etykiecie prywatności i w kodzie, a zarazem stanowi główny argument sprzedaży
Obszar: **prywatność**
Użytkownicy wprost to chwalą. Konkurent z hasłem „no sign-up” w notatkach wydania przyznaje się do „subscription analytics”, a recenzent porówna to z etykietą prywatności.
Dowód:
- BreadMe, RSS DE, 5★, 2021-06-01: „Und Mann muss ich dabei nicht Anmelden :)”; 5★, 2020-12-20: „keine nervige Werbung, es gibt einfach gar keine Werbung!”
- Loaflo, opis (lookup US): „no sign-up required!” oraz notatki 6.0.11 (2026-09-07): „Also includes improvements to subscription analytics.”
- Guidelines 5.1.1(v): „If your app doesn’t include significant account-based features, let people use it without a login.”
- „Wirtualny Piekarz” (lookup PL, 2026-07-26): „Po założeniu konta synchronizujesz receptury, zakwasy, plany i zdjęcia w chmurze.” Polski konkurent idzie w konto, więc „bez konta” jest w PL realnym wyróżnikiem.

### 14. Obietnica „35 języków” jest prawdziwa w każdym ekranie, a nazwa i zrzuty są lokalne na rynkach nieanglojęzycznych
Obszar: **wzrost**
Liderzy są tylko po angielsku i w DE/PL mają pojedyncze oceny. To luka, ale recenzent bezlitośnie karze zrzuty obiecujące język, którego aplikacja nie ma. W PL działa już konkurent z „Piekarz” w nazwie.
Dowód:
- Lookup: Rise `languageCodesISO2A: ['EN']`, Loaflo `['EN']` (2026-11-08); Loaflo w DE: 1 ocena, 1★; Rise w DE: 11 ocen.
- BreadMe, RSS DE, 3★, 2026-02-24: „dass ich die Sprache nicht einstellen kann. Wird es hier eine deutsche Option geben, wie es die Verkaufsbilder suggerieren?”
- Wyszukiwanie PL „zakwas”/„chleb” (https://itunes.apple.com/search?term=zakwas&entity=software&country=pl): „Wirtualny Piekarz” id6787479343, wydany 2026-07-26. Kolizja nazwy przy wyszukiwaniu „piekarz”.

### 15. Aplikacja wyróżnia się w zatłoczonej półce, a autor szybko odpowiada na recenzje i poprawia błędy
Obszar: **wydanie**
Nisza jest zalana nowymi, darmowymi aplikacjami bez ocen. Przy progu 500 USD netto/rok (prowizja 15% w Small Business Program) liczy się każda recenzja. Milczenie autora daje 2★ nawet przy dobrej idei.
Dowód:
- Wyszukiwanie US „sourdough” (limit 50, 2026-11-08): 48 wyników, 45 darmowych, 33 wydane od 2025, z czego 29 ma poniżej 10 ocen.
- BreadMe, RSS DE, 2★, 2025-03-26: „Gute Idee, Verbesserungen notwendig, leider keine Rückmeldung vom Entwickler … die 3€ verschenkt.”
- Loaflo, RSS US, 5★, 2025-12-31: „And so is their customer service. I was having an issue and they were prompt in fixing it”.
- Apple Small Business Program (https://developer.apple.com/app-store/small-business-program/, 2026-11-08): „a reduced commission rate of 15% on paid apps and Apple In-App Purchases”.

## Uwagi o granicach dowodu
- Ceny subskrypcji Rise i Loaflo nie są dostępne w iTunes API (IAP nie są zwracane). Kwoty Loaflo pochodzą z recenzji, nie z cennika.
- Nie udało się dziś pobrać źródła urzędowego o pleśni w żywności: USDA FSIS zwraca 403, a ask.usda.gov ma błąd certyfikatu. Punkt 11 opiera się na recenzjach, nie na normie bezpieczeństwa żywności.
- Wymagania iPhone-only i brak synchronizacji zderzają się z prośbami o chmurę i Family Sharing (BreadMe, RSS DE, 5★, 2024-06-20: „ist die App wirklich nicht in der Familienfreigabe/ Cloud verfügbar?”) oraz z wymogiem 3.1.2(a), by subskrypcja była „available across all of the user’s devices”. Dotyczy to uprawnienia zakupu, a nie danych.

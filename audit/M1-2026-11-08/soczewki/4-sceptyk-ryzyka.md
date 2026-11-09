# Soczewka 4 — sceptyk ryzyka (dane, prywatność, pieniądze, bezpieczeństwo, także żywności)

Data odczytu wszystkich źródeł: 2026-11-08. Data przy recenzji to data jej publikacji w RSS Apple.
Repozytorium aplikacji nie było otwierane. Wiedza o aplikacji pochodzi tylko z celu i skrótu opisu w poleceniu.

## Alternatywy przeczytane dziś

| Aplikacja | Sklep | Cena (Search API) | Ocena / liczba ocen | Uwagi z opisu |
|---|---|---|---|---|
| Loaflo: Sourdough Starter (id 6736766728) | US | Free + subskrypcja (recenzje: „$6 weekly”, „$30/yr”) | 4,69 / 564 (US) | „AI Analysis: Snap a photo of your loaf or starter”, „No Account Needed” |
| Rise: Baking & Bread Recipes (id 1515369685) | US, DE | Free + zakupy | 4,87 / 337 (US); 4,91 / 11 (DE) | „Rise syncs across all of your devices”, „Schedule notifications alert you” |
| BreadMe – Sauerteig planer (id 1522824861) | DE | 2,99 € | 4,34 / 44 (DE) | planowanie wstecz „genau rechtzeitig aus dem Ofen”, przypomnienia o zakwasie |
| Levain (id 1572641630) | DE | Gratis (napiwek IAP) | 5 / 12 (DE) | „uneingeschränkt kostenlos”, widżety ekranu blokady, iCloud |
| Kneady (id 1534576984) | US | Free + 2 subskrypcje | 4,80 / 732 (US) | 600+ receptur, część za paywallem |

Źródła: `https://itunes.apple.com/search?term=sourdough&entity=software&country=us` (oraz `country=de`, `country=pl`), `https://itunes.apple.com/lookup?id=1515369685,1572641630,1522824861,6736766728&country=de`, RSS recenzji `https://itunes.apple.com/{us|de}/rss/customerreviews/page=1/id=<id>/sortby=mostrecent/json`. Rynek PL: wyszukiwanie zwraca te same aplikacje, prawie bez ocen (np. Rise 5 / 5 ocen w PL), więc recenzje rynku nieanglojęzycznego wzięto z DE.

## Co musi być prawdą (15 punktów)

### 1. Przepływ — krok budzi piekarza, choć aplikacja w tle nic nie liczy
Każdy krok harmonogramu i każde karmienie zakwasu musi być zaplanowane z góry jako lokalne powiadomienie systemowe w chwili startu planu. Nie może zależeć od timera JS ani od pracy aplikacji w tle. Plan wielodniowy, kilka zakwasów (przypomnienie co 12 h) i kilka wypieków naraz muszą się zmieścić w limicie 64 oczekujących powiadomień: najbliższe mają pierwszeństwo, a resztę dokłada się przy każdym otwarciu aplikacji.
- Apple, Managing your app’s life cycle (`https://developer.apple.com/documentation/uikit/managing-your-app-s-life-cycle`, JSON z `developer.apple.com/tutorials/data/...`): „a background app must do as little work as possible, and preferably nothing”.
- Apple Developer Forums, odpowiedź Apple Staff Engineer, styczeń 2026 (`https://developer.apple.com/forums/thread/811171`): „there is a limit of 64 for how many simultaneous notification requests can be active/pending at one time per app. This is a system limit and there is no way around it.”
- Recenzja Rise, US, 1★, 2020-12-20: „I just purchased yesterday and have yet to receive notification alarms for feeding my starter.”

### 2. Przepływ — użytkownik widzi, że powiadomienie nie przyjdzie
Powiadomienia kroków muszą mieć poziom Time Sensitive, żeby przechodziły przez tryb skupienia (Focus) i podsumowanie powiadomień. Aplikacja musi sprawdzać przy starcie planu, czy powiadomienia i tryb Time Sensitive są włączone. Jeśli nie są, musi to wyraźnie powiedzieć. Cicha awaria oznacza przegapione składanie albo przegrzany zaczyn.
- Apple, UNNotificationInterruptionLevel.timeSensitive (`https://developer.apple.com/documentation/usernotifications/unnotificationinterruptionlevel/timesensitive`): „Time Sensitive notifications are similar to active notifications, but can break through system controls such as Notification Summary and Focus. The user can turn off the ability for time sensitive notification interruptions.”

### 3. Przepływ — planowanie od godziny „gotowe” działa i naprawdę omija noc
Godzina „gotowe” musi być polem wejściowym, a nie wynikiem. Żaden krok wymagający rąk nie może wypaść w oknie snu użytkownika. Jeśli tego nie da się zrobić, aplikacja musi to powiedzieć i zaproponować chłodnię albo inną godzinę zamiast cicho wstawić krok o 3:00. Plan musi też przeżyć zmianę czasu letniego. To wniosek własny, bez osobnego źródła.
- Recenzja BreadMe, DE, 1★, 2022-04-04: „Leider funktioniert die „Fertig um“-Umrechnung nicht. […] Morgens den Teig um 02:48 Uhr zu falten kommt nicht in Frage.”
- Recenzja Rise, US, 3★, 2022-04-11: „while you can enter a start time for a recipe, what’s really needed in a bread making app is being able to select an END […]”

### 4. Dane — liczby można sprawdzić, a jednostki pasują do rynku
Procent piekarski (z mąką i wodą zakwasu) i temperatura wody (DDT) muszą pokazywać wzór i składniki wyniku, żeby piekarz mógł je sprawdzić. Testy muszą przypinać te wyniki do przykładów policzonych ręcznie. Na rynku globalnym potrzebne są gramy i uncje, °C i °F oraz małe ilości (sól, drożdże) bez zaokrąglania do zera.
- Recenzja Rise, US, 4★, 2022-11-26, „Possible error in Smart DDT calculator”: „the final temperature does not change when mixing is activated and deactivated”.
- Recenzja Rise, US, 3★, 2022-04-11: „you can’t enter tsp amounts smaller than 1/2 tsp. […] That makes the app unuseable for me.”
- Recenzja Kneady, US, 3★, 2021-10-23: „in Arizona we use cups, tablespoons, and teaspoons (and we weigh in ounces, pounds).” Recenzja Loaflo, US, 3★, 2026-01-19: „Please include metric weight measurements in the recipes.”

### 5. Treść / bezpieczeństwo żywności — przy pleśni jest tylko jedna odpowiedź: wyrzuć
Zasada ostrożności przy pleśni musi być bezwarunkowa i darmowa (Basic):
- puszysty nalot, róż albo pomarańcz oznacza „wyrzuć i zacznij od nowa”;
- nigdy „zeskrob i ratuj”;
- żadnej oceny bezpieczeństwa na podstawie zdjęcia ani „AI”.

Zasada musi też odróżniać płyn na wierzchu (hooch), który jest nieszkodliwy. W 35 językach musi brzmieć tak samo stanowczo, więc tłumaczenie trzeba przejrzeć, a nie tylko wygenerować.
- King Arthur Baking, Sourdough FAQ (`https://www.kingarthurbaking.com/learn/guides/sourdough/faq`): „if it develops a pink or orange color, throw it out.”
- Recenzja Loaflo (konkurencja z analizą zdjęć AI), US, 1★, 2025-04-16: „I scanned 3 different moldy starters and it rated 2 of them pretty high”.

### 6. Treść / bezpieczeństwo żywności — żaden protokół nie każe jeść ani próbować surowego ciasta
Doktor chleba i protokoły ratunkowe, na przykład przy niedopieczonym środku, muszą kończyć się dopieczeniem, a nie „spróbuj ciasta” albo „zjedz, jeśli smakuje”. Tekst o zakwasie i odpadzie (discard) nie może sugerować jedzenia na surowo.
- FDA, Handling Flour Safely (`https://www.fda.gov/food/buy-store-serve-safe-food/handling-flour-safely-what-you-need-know`): „Never eat or taste raw flour, dough, or batter.” oraz „Processing raw grains into flour does not kill harmful bacteria.”

### 7. Treść — zero twierdzeń zdrowotnych, zwłaszcza o glutenie
Ani aplikacja, ani opis w sklepie, ani żaden z 35 przekładów nie może twierdzić, że chleb na zakwasie jest bezpieczny przy celiakii, „lżej strawny” czy „zdrowszy”. Takie zdanie zamienia planer w aplikację o zdrowiu i podlega ostrzejszemu przeglądowi.
- Gluten Free Watchdog, 2018-02-19 (`https://www.glutenfreewatchdog.org/news/sourdough-wheat-bread-is-not-safe-for-folks-with-celiac-disease/`): „Sourdough Wheat Bread is NOT Safe for Folks with Celiac Disease”; wheat-based sourdough „should not be eaten by anyone with a gluten related disorder.”
- App Review Guidelines 1.4.1 (`https://developer.apple.com/app-store/review/guidelines/`): „Medical apps that could provide inaccurate data or information […] may be reviewed with greater scrutiny.”

### 8. Dane — receptury, zakwasy i dziennik nie mogą zniknąć
Bez konta i bez synchronizacji urządzenie jest jedynym miejscem danych. Zapis musi być więc atomowy i odporny na zabicie aplikacji, a dane muszą leżeć w katalogu objętym kopią iCloud lub iTunes, nie w `Caches/` ani `tmp/`. Wymiana telefonu musi je przenosić: kopią systemową albo jawnym eksportem, który aplikacja proponuje. 10 kopii wewnątrz aplikacji nie chroni przed utratą telefonu. Konkurencja (Rise, Levain) synchronizuje, więc użytkownik oczekuje ciągłości.
- Apple, File System Programming Guide (`https://developer.apple.com/library/archive/documentation/FileManagement/Conceptual/FileSystemProgrammingGuide/FileSystemOverview/FileSystemOverview.html`): „Documents/ Use this directory to store user-generated content. […] The contents of this directory are backed up by iTunes and iCloud.” oraz „The contents of the Library directory (with the exception of the Caches subdirectory) are backed up”.
- Recenzja BreadMe, DE, 1★, 2026-05-06: „Blueprints lassen sich nicht speichern bzw. verschwinden. […] so ist die gut gemeinte App leider Geldverschwendung.”
- Opis Rise (Search API, wersja 4.0.3, 2026-10-20): „Rise syncs across all of your devices”. Opis Levain (DE, 1.2.3): „iCloud-Unterstützung: Ihre Rezepte, Backwaren und Sauerteige sind auf allen Ihren iOS/iPadOS-Geräten verfügbar.”

### 9. Dane / bezpieczeństwo — import i eksport nie szkodzą
Plik importu jest danymi niezaufanymi:
- przed zapisem trzeba sprawdzić schemat i wersję;
- przed nadpisaniem musi powstać kopia bezpieczeństwa;
- import nie może wymazać danych przy częściowym błędzie.

Eksport CSV musi neutralizować komórki zaczynające się od `= + - @`, tabulatora albo CR/LF, bo nazwy receptur i notatki dziennika wpisuje użytkownik, a plik otwiera się w arkuszu.
- OWASP, CSV Injection (`https://community.owasp.org/attacks/CSV_Injection`, przekierowanie z `owasp.org/www-community/attacks/CSV_Injection`): „CSV Injection, also known as Formula Injection, occurs when websites embed untrusted input inside CSV files.” Zalecenie: „ensure that no cells begin with any of the following characters” (=, +, -, @, tab, CR, LF).

### 10. Pieniądze — paywall jest jawny przed pobraniem i przed zakupem
Opis w sklepie i zrzuty ekranu muszą mówić, co jest w Basic za darmo na zawsze, a co w Pro. Przed zakupem ekran Pro musi pokazać cenę i zakres. Nie może być wyskakującego paywalla z odliczaniem przy każdym dotknięciu. Konkurencja traci na tym oceny.
- App Review Guidelines 3.1.2 (`https://developer.apple.com/app-store/review/guidelines/`): „Before asking a customer to subscribe, you should clearly describe what the user will get for the price.”
- Recenzja Loaflo, US, 1★, 2026-04-07: „I hate when apps don’t advertise a subscription based service in the photos or descriptions— not to mention the paywall keeps popping up with a timer.” Recenzja Loaflo, US, 1★, 2026-02-25: „everything you click on results in a pop-up, trying to force you into the sub subscription.”
- Recenzja Kneady, US, 4★, 2026-07-27: „some of the most appealing recipes I have seen are stuck behind a paywall”.

### 11. Pieniądze — anulowanie, zwrot i przywracanie są osiągalne z aplikacji
Aplikacja nie ma konta ani serwera, więc musi sama prowadzić do:
- zarządzania subskrypcją (systemowy arkusz),
- prośby o zwrot (Apple),
- „Przywróć zakupy”, także dla zakupu dożywotniego.

Uprawnienia Pro trzeba wyliczać z bieżących uprawnień StoreKit, żeby zwrot lub cofnięcie zakupu odbierały Pro, a ważny zakup działał bez sieci. To, że działa bez sieci, to wniosek z obietnicy „offline”, nie cytat.
- App Review Guidelines 3.1.1: „you should make sure you have a restore mechanism for any restorable in-app purchases.”
- Apple, Transaction.currentEntitlements (`https://developer.apple.com/documentation/storekit/transaction/currententitlements`): „Products that the App Store has refunded or revoked don’t appear in the current entitlements.”
- Recenzja Loaflo, US, 1★, 2026-02-21: „Can’t cancel my free trial”. Recenzja Loaflo, US, 1★, 2026-03-07: „there are no account options in the app to cancel or contact […] it overcharged me by $13 compared to the advertised price.” Recenzja Rise, US, 1★, 2020-12-20: „I cannot figure out where to request a refund either.”

### 12. Pieniądze / wzrost — Basic sam w sobie bezpiecznie prowadzi wypiek, a Pro ma powód istnieć
Na rynku DE jest w pełni darmowy konkurent z powiadomieniami, widżetami ekranu blokady i iCloud. Płatna aplikacja za 2,99 € dostaje recenzje „Geld verschenkt”. Funkcje bezpieczeństwa (powiadomienia kroków, zasada pleśni, kopie) nie mogą być za paywallem. Pro musi dawać wartość ponad Levain i Rise, a cena musi być porównywalna z Loaflo (ok. $30/rok według recenzji).
- Opis Levain (DE, Search API): „Levain ist uneingeschränkt kostenlos, In-App-Käufe ermöglichen es Ihnen, dem Entwickler ein Trinkgeld zukommen zu lassen“; „Überwachen Sie Ihre Backvorgänge und Sauerteige, ohne die App zu öffnen, indem Sie die Startbildschirm- und Sperrbildschirm-Widgets verwenden.”
- Recenzja BreadMe, DE, 2★, 2025-03-26: „so wird die App leider nicht genutzt und die 3€ verschenkt.”
- Recenzja Loaflo, US, 4★, 2026-06-20: „$30/yr isn’t expensive, but I get all my other info/help for free”. Recenzja Loaflo, US, 1★, 2026-08-06: „I’m not paying 6 dollars weekly”.

### 13. Prywatność — „bez śledzenia” jest prawdą w etykiecie, manifeście i każdej zależności
Etykieta prywatności („Data Not Collected”) musi obejmować kod stron trzecich: SDK płatności, raportowania błędów i fontów. Manifest prywatności musi deklarować „required reason APIs”. Strona polityki prywatności jest wymagana także wtedy, gdy aplikacja nic nie zbiera. Inaczej niż Loaflo, żadna funkcja (np. przyszła „analiza zdjęcia”) nie może cicho wysyłać danych z urządzenia.
- Apple, App privacy details (`https://developer.apple.com/app-store/app-privacy-details/`): „You’ll need to provide information about your app’s privacy practices, including the practices of third-party partners whose code you integrate into your app”; „“third-party partners” refers to analytics tools, advertising networks, third-party SDKs”.
- Apple, Privacy manifest files (`https://developer.apple.com/documentation/bundleresources/privacy-manifest-files`): manifest zapisuje „The required reasons APIs your app or third-party SDK uses.”
- App Review Guidelines 5.1.1(i): „All apps must include a link to their privacy policy in the App Store Connect”.
- Opis Loaflo: „No Account Needed” obok „AI Analysis: Snap a photo of your loaf or starter”. „Bez konta” nie znaczy więc „bez wysyłki danych”.

### 14. Wydanie — aplikacja zawsze startuje i działa w środku tygodnia
Start nie może zależeć od sieci, serwera ani poprawności zapisanego stanu. Uszkodzony stan trzeba odłożyć na bok i uruchomić aplikację. W wypieku trwającym 24–36 h jedno „nie ładuje się” oznacza zepsuty bochenek. Praca offline jest tu realną przewagą nad konkurencją zależną od serwera, ale tylko wtedy, gdy jest prawdziwa.
- Recenzja Rise, US, 1★, 2026-01-24: „once I click “continue” on the opening welcome page the app just idles without ever loading.”
- Recenzja Loaflo, US, 2★, 2026-10-08: „it rarely works during the week when I try to use it. It usually works on weekends, but it’s not reliable. Keep your money!”
- Recenzja Loaflo, US, 1★, 2025-11-30: „even after paying for the subscription nothing it working. I cannot chat with the bot”.

### 15. Wydanie / wzrost — każda obietnica ze sklepu jest prawdziwa, także „35 języków” i „pomaga poprawiać następny wypiek”
Każdy język wymieniony w sklepie musi być kompletny w aplikacji, łącznie z ostrzeżeniami. Zrzuty ekranu nie mogą obiecywać więcej niż aplikacja. Dziennik musi faktycznie łączyć ocenę i wnioski z poprzedniego wypieku z następnym planem. Tego konkurencji brakuje i to obiecuje cel. Kanał kontaktu z twórcą musi działać, bo recenzje karzą milczenie.
- App Review Guidelines 2.3.1(a): „marketing your app in a misleading way, such as by promoting content or services that it does not actually offer […]” podlega odrzuceniu.
- Recenzja BreadMe, DE, 3★, 2026-02-24: „dass ich die Sprache nicht einstellen kann. Wird es hier eine deutsche Option geben, wie es die Verkaufsbilder suggerieren?”
- Recenzja Loaflo, US, 4★, 2026-06-20: „how about remembering/logging what I was told to do/did last time and building upon that. Seems like each scan thinks it’s a new starter each day”.
- Recenzja BreadMe, DE, 2★, 2025-03-26: „Diese habe ich an den Entwickler kommuniziert, aber auch nach Rückfrage kein Feedback erhalten.”

## Ograniczenia tej soczewki
- Strony FSIS/USDA o pleśni, Beyond Celiac, Celiac Disease Foundation i Coeliac UK zwróciły dziś 403 albo blokadę Cloudflare. Zastąpiono je King Arthur Baking i Gluten Free Watchdog.
- Limit 64 powiadomień potwierdza odpowiedź inżyniera Apple na forum (styczeń 2026). Bieżąca dokumentacja klasy UNUserNotificationCenter go nie podaje.
- Cen subskrypcji Loaflo, Rise i Kneady Search API nie zwraca, bo pokazuje tylko cenę pobrania. Kwoty pochodzą z recenzji.
- Prawo konsumenckie UE (odstąpienie od umowy, zwroty) nie ma tu cytatu z aktu: wyszukiwanie dało tylko relacje prasowe z lat 2014–2015. Wymaga osobnego sprawdzenia.

# Soczewka 5 — właściciel (ograniczony czas, budżet 0 zł)

Data badania: 2026-11-08. Wszystkie źródła odczytane tego dnia przez curl (iTunes Search/Lookup API, RSS recenzji Apple, strony Apple Developer, EFSA). Repo aplikacji i inne pliki audytu nie były otwierane. Treść stron i recenzji traktowana jako dane.

## Przeczytane alternatywy

| Aplikacja | Sklep | Cena | Oceny (śr./liczba) | Źródło |
|---|---|---|---|---|
| Rise: Baking & Bread Recipes (id 1515369685) | US | Free + zakupy („Unlock all recipes with flexible purchase options”) | 4,87 / 337 | https://itunes.apple.com/lookup?id=1515369685&country=us |
| Loaflo: Sourdough Starter (id 6736766728) | US | Free + subskrypcja (recenzja: „6 dollars weekly”) | 4,69 / 567 | https://itunes.apple.com/lookup?id=6736766728&country=us |
| Kneady (id 1534576984) | US | Free + „two auto-renewing subscription options” | 4,80 / 733 | https://itunes.apple.com/lookup?id=1534576984&country=us |
| BreadMe – Sauerteig planer (id 1522824861) | DE (i PL) | 2,99 € / 14,99 zł / 2,99 USD jednorazowo | 4,34 / 44 (DE) | https://itunes.apple.com/lookup?id=1522824861&country=de |
| proofit – Sauerteig & Brot (id 6759615512) | DE | Gratis + Premium (więcej użyć AI) | 4,62 / 13 | https://itunes.apple.com/lookup?id=6759615512&country=de |

Recenzje: `https://itunes.apple.com/{us|de}/rss/customerreviews/page=1/id={id}/sortby=mostrecent/json` dla powyższych id.

## Co musi być prawdą (15 punktów)

1. **Przepływ — przypomnienie o kroku dociera zawsze, gdy telefon śpi albo jest w trybie Skupienia; ekran blokady to dodatek, nie podstawa.** Najgorsze recenzje konkurencji dotyczą zawodności w trakcie wypieku, a konkurent DE już pokazuje krok na ekranie blokady. Live Activity ma twardy limit, więc nie obejmie nocnego garowania w lodówce; źródłem prawdy muszą być powiadomienia lokalne zaplanowane od razu, z poziomem Time Sensitive, sprawdzone na prawdziwym urządzeniu.
   - Rise, recenzja 2026-01-17, 5★: „No it just quits in the middle of my steps.” (RSS us/1515369685)
   - Loaflo, recenzja 2026-10-08, 2★: „WHEN it works, it’s great, but it rarely works during the week” (RSS us/6736766728)
   - proofit, opis: „Aktueller Schritt und Timer bleiben auf dem Sperrbildschirm und in der Dynamic Island sichtbar.” (lookup de/6759615512)
   - Apple, ActivityKit: „A Live Activity can be active for up to eight hours … a Live Activity remains on the Lock Screen for a maximum of 12 hours.” https://developer.apple.com/documentation/activitykit/displaying-live-data-with-live-activities
   - Apple, Time Sensitive: „can break through system controls such as Notification Summary and Focus. The user can turn off the ability…” https://developer.apple.com/documentation/usernotifications/unnotificationinterruptionlevel/timesensitive

2. **Przepływ — plan wsteczny od godziny „gotowe” działa naprawdę i da się go poprawić w trakcie wypieku.** Dotyczy to przesunięcia, pauzy i dłuższego garowania: reszta kroków przelicza się sama. Warto też zdecydować, czy dwa ciasta mogą iść równolegle. Zepsute „Fertig um” dało BreadMe ocenę 1★, a „cały plan się przesuwa” to dziś argument sprzedażowy konkurenta.
   - BreadMe, recenzja 2022-04-04, 1★: „Leider funktioniert die ‚Fertig um‘-Umrechnung nicht.” (RSS de/1522824861)
   - proofit, opis: „Minuten dazugeben oder abziehen, und der ganze Zeitplan zieht mit.” (lookup de/6759615512)
   - Rise, recenzja 2021-04-30: „Need a simple timer PAUSE function” (RSS us/1515369685)
   - BreadMe, recenzja 2021-12-31: „Mehrere Rezepte können parallel laufen” (RSS de/1522824861)

3. **Dane — procent piekarski z mąką i wodą zakwasu jest bezbłędny i sprawdzony testami na przypadkach brzegowych.** To dziś standard w kategorii, a nie przewaga, więc błąd w liczbach od razu odbiera wiarygodność.
   - Rise, opis: „Calculate hydration (both baker’s and ‘true’)”; recenzja 2022-12-23: „total hydration factoring in your sourdough hydration” (lookup i RSS us/1515369685)
   - Rise, recenzja 2022-11-26, 4★: „Possible error in Smart DDT calculator” — użytkownicy sami sprawdzają wzory (RSS us/1515369685)

4. **Dane — jednostki pasują do rynku USA.** Domyślne są gramy, ale da się przejść na uncje i miarki, wpisać małe ilości (¼ łyżeczki) oraz liczby z przecinkiem i z kropką. Brak takiej konwersji obniża oceny w USA.
   - Kneady, recenzja 2021-10-23, 3★: „in Arizona we use cups, tablespoons, and teaspoons” (RSS us/1534576984)
   - BreadMe US, recenzja 2021-03-16, 3★: „Needs a way to change units” (RSS us/1522824861)
   - Rise, recenzja 2022-04-11, 3★: „you can’t enter tsp amounts smaller than 1/2 tsp … That makes the app unuseable for me.” (RSS us/1515369685)

5. **Dane — bez konta i bez chmury jedyną ochroną danych są lokalne kopie oraz eksport i import.** Trzeba sprawdzić cały cykl na prawdziwym przeniesieniu na nowy iPhone, a nie tylko w testach. Znikające przepisy to dla aplikacji płatnej natychmiastowe 1★; konkurent DE oferuje już opcjonalny backup w chmurze.
   - BreadMe, recenzja 2026-05-06, 1★: „Blueprints lassen sich nicht speichern bzw. verschwinden … Geldverschwendung.” (RSS de/1522824861)
   - proofit, opis: „Das optionale Cloud-Backup hält alles auf iPhone und iPad synchron.” (lookup de/6759615512)

6. **Dane i przepływ — dziennik zasila następny wypiek.** Ocena, notatka i zmiana z ostatniego wypieku pojawiają się przy tym samym kroku następnym razem, bo to wprost realizuje cel „pomaga poprawiać następny wypiek”. Użytkownicy proszą o to wprost, a konkurent DE już to ma.
   - Loaflo, recenzja 2026-06-20, 4★: „how about remembering/logging what I was told to do/did last time” (RSS us/6736766728)
   - proofit, opis: „Fotos und Notizen aus einem Backtag erscheinen beim nächsten Mal am selben Schritt, so lernt jedes Brot vom letzten.” (lookup de/6759615512)

7. **Treść — przy pleśni zakwasu aplikacja zawsze każe wyrzucić zakwas i nigdy go nie „ocenia”.** Doktor chleba działa na sztywnych regułach, bez zgadywania, i to jest przewaga nad konkurentami opartymi na AI, które zawodzą właśnie tutaj.
   - Loaflo, recenzja 2025-04-16, 1★: „I scanned 3 different moldy starters and it rated 2 of them pretty high” (RSS us/6736766728)
   - EFSA: „Mycotoxins are toxic compounds that are naturally produced by different types of fungi … typically found in foods such as cereals” (strona ostatnio przejrzana 2026-01-06) https://www.efsa.europa.eu/en/topics/topic/mycotoxins

8. **Pieniądze — Basic jest naprawdę użyteczny za darmo, a granica Pro jest widoczna w opisie i na zrzutach przed pobraniem.** Bez wyskakujących okien z licznikiem i bez pułapki próbnego okresu. Ukryta opłata to najczęstsza przyczyna ocen 1★ u lidera rankingu.
   - Loaflo, recenzja 2026-02-25, 1★: „Despite not being mentioned in the description, you do have to pay a subscription” (RSS us/6736766728)
   - Loaflo, recenzja 2026-04-07, 1★: „the paywall keeps popping up with a timer”; 2026-02-21: „Can’t cancel my free trial” (RSS us/6736766728)
   - App Review Guidelines 3.1.2(c): „Before asking a customer to subscribe, you should clearly describe what the user will get for the price.” https://developer.apple.com/app-store/review/guidelines/

9. **Pieniądze — subskrypcja aplikacji offline bez serwera ma uzasadnienie, które przejdzie przegląd Apple.** Takim uzasadnieniem mogą być regularne, istotne aktualizacje. Jeśli właściciel nie ma na nie czasu, zakup dożywotni powinien być główną ofertą. W DE i PL działa jednorazowa cena 2,99 € / 14,99 zł; za ściany Pro w Kneady użytkownicy obniżają oceny.
   - Guidelines 3.1.2(a): „you must provide ongoing value to the customer … examples … apps that offer consistent, substantive updates; … software as a service (‚SAAS‘); and cloud support.” https://developer.apple.com/app-store/review/guidelines/
   - BreadMe, recenzja 2022-01-23, 5★: „Die App ist den Preis zu 100% Wert.” (RSS de/1522824861); cena PL 14,99 zł (https://itunes.apple.com/lookup?id=1522824861&country=pl)
   - Kneady, recenzja 2024-12-02, 4★: „they should have less of them needing the ‚kneedy pro‘” (RSS us/1534576984)

10. **Pieniądze — rachunek progu zamyka się przy budżecie 0 zł.** Członkostwo kosztuje 99 USD rocznie, a z Small Business Program prowizja wynosi 15%. Jeśli próg 500 USD netto liczyć po opłacie członkowskiej, potrzeba około 705 USD brutto rocznie, czyli około 236 zakupów po 2,99 USD (licząc 2,54 USD netto za sztukę). Tymczasem w wynikach „sourdough” w USA tylko 5 z 48 aplikacji ma co najmniej 100 ocen. To założenie, które właściciel musi sprawdzić; nie wynika ono z dokumentów projektu.
    - Apple: „The Apple Developer Program is 99 USD per membership year” https://developer.apple.com/programs/whats-included/
    - Apple: „a reduced commission rate of 15% on paid apps and Apple In-App Purchases” https://developer.apple.com/app-store/small-business-program/
    - iTunes Search, term=sourdough, country=us, limit=50: 5 z 48 wyników ma co najmniej 100 ocen (Loaflo 567, Rise 337, Kneady 733, West Coast Sourdough 1679, Gluten Morgen 756) https://itunes.apple.com/search?term=sourdough&entity=software&country=us&limit=50

11. **Wydanie — pierwszy zrzut i podtytuł w sklepie pokazują wyróżnik, a nie „kolejny timer do zakwasu”.** Wyróżnik to: offline, bez konta, bez AI, poprawne liczby i protokoły ratunkowe. Kategoria jest zalana nowościami, a Apple wprost odrzuca „proste timery” bez istotnej różnicy.
    - iTunes Search, term=sourdough, country=us, limit=50: 25 z 48 aplikacji wydano w 2026 r. (URL jak w pkt 10)
    - Guidelines 4.3(b): „Certain kinds of apps, such as … simple timers … we will not accept new submissions unless they offer a meaningfully different or improved experience.” https://developer.apple.com/app-store/review/guidelines/

12. **Prywatność — etykieta „Data Not Collected” jest prawdziwa i udowodniona brakiem ruchu sieciowego, a nie tylko zadeklarowana.** Konkurenci, nawet ci „bez konta”, wymagają sieci dla AI, więc pełny offline jest realną różnicą, którą ceni część użytkowników.
    - proofit, opis: „Nur KI-Funktionen brauchen eine Verbindung.” (lookup de/6759615512)
    - BreadMe, recenzja 2021-06-01, 5★: „Und Mann muss ich dabei nicht Anmelden :)” (RSS de/1522824861)
    - Loaflo, opis: „No Account Needed: Dive right into baking without any account sign-up.” (lookup us/6736766728)

13. **Wydanie — przed sprzedażą Pro w UE właściciel świadomie rozstrzyga status przedsiębiorcy (trader) w DSA.** Ten status oznacza publiczny adres, telefon i e-mail na stronie produktu. Dla konta osoby fizycznej to dane prywatne, a bez rozstrzygnięcia nie da się sprzedawać w UE.
    - Apple: „Articles 30 and 31 of the Digital Services Act (DSA) require Apple to verify and display trader contact information … This includes an address, phone number, and email address” https://developer.apple.com/help/app-store-connect/manage-compliance-information/manage-european-union-digital-services-act-trader-requirements

14. **Wzrost i treść — w kluczowych rynkach (DE, PL i inne o największym udziale) terminy dziedzinowe są przejrzane przez kogoś znającego dziedzinę.** Na przykład Anstellgut, ASG, Levain i zakwas żytni. Liczba 35 języków nie zastąpi jakości tam, gdzie są pieniądze. Język to argument zakupu w DE, a jego brak lub błąd daje niskie oceny.
    - proofit, recenzja 2026-06-06, 5★: „Vielen Dank für die erste App, die auf Deutsch ist & jeder Anfänger versteht!” (RSS de/6759615512)
    - BreadMe, recenzja 2026-02-24, 3★: „dass ich die Sprache nicht einstellen kann. Wird es hier eine deutsche Option geben, wie es die Verkaufsbilder suggerieren?” (RSS de/1522824861)

15. **Wzrost — właściciel ma tani, stały rytm obsługi: odpowiada na recenzje i zgłoszenia, a do tego wydaje aktualizacje.** Przy płatnej aplikacji jednego autora brak odpowiedzi zamienia się w oceny 2★ i porzucenie, a szybka odpowiedź w oceny 5★. Apple może też usuwać aplikacje bez aktualizacji w kategoriach nasyconych.
    - BreadMe, recenzja 2025-03-26, 2★: „auch nach Rückfrage kein Feedback erhalten. Schade, so wird die App leider nicht genutzt und die 3€ verschenkt.” (RSS de/1522824861)
    - Loaflo, recenzja 2025-12-31, 5★: „so is their customer service. I was having an issue and they were prompt in fixing it” (RSS us/6736766728)
    - Guidelines 4.3(b): „We may remove these apps from the App Store going forward if they are not updated, improved, or do not attract customers.” https://developer.apple.com/app-store/review/guidelines/

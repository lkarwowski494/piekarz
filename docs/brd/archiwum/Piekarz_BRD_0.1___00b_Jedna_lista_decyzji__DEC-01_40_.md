# **Piekarz BRD 0.1 — 00b Jedna lista decyzji (DEC-01…DEC-40)**

Rejestr decyzji produktowych, technologicznych i biznesowych dla właściciela studia Apps4Brew. Decyzje podzielono na cztery logiczne bloki wdrożeniowe.

## **Blok I — Przed startem budowy (Tydzień 0\)**

**DEC-01 Jaki zakres ma pierwsza wersja (MVP)?**

> * Kontekst: Pełna specyfikacja to 158 wymagań BR. Tabela zakresu to górna granica.  
> * Opcje: (a) pełne MVP z BRD (158 BR); (b+) wariant optymalny MUST \+ 6 kluczowych funkcji (124 BR); (b) tylko twarde MUST (118 BR); (c) pełny Garmin w wersji 1.0 (136 BR); (d) sam kalkulator (90 BR, grozi odrzuceniem przez Apple).  
> * Rekomendacja: **(b+)** (3–4 tygodnie, najwyższy stosunek wartości do czasu).

**DEC-02 Integracja z zegarkami Garmin w wersji 1.0 czy 1.1?**

> * Kontekst: Pieczenie w kuchni angażuje ręce, a użytkownicy zegarków sportowych Garmin (np. Fēnix, Forerunner) pieką chleb w domach. Nakład na moduł Connect IQ to 12–18 dni pracy.  
> * Opcje: A) pełna aplikacja Garmin w MVP; B) prototyp mostka komunikacyjnego w MVP, oficjalna aplikacja Garmin w 1.1 zaraz po premierze; C) rezygnacja z Garmina na rzecz samego Apple Watch.  
> * Rekomendacja: **B** (pozwala wydać iOS/watchOS o 3 tygodnie szybciej bez utraty architektury pod Garmina).

**DEC-03 Pełna aplikacja na Apple Watch w MVP?**

> * Kontekst: Podstawowa obietnica aplikacji „ręce w mące”.  
> * Opcje: A) pełna niezależna aplikacja watchOS z obsługą gestu Double Tap, koronki Digital Crown i haptic feedback; B) wyłącznie powiadomienia i Live Activity w Smart Stack na zegarku.  
> * Rekomendacja: **A** (kluczowy wyróżnik rynkowy i tarcza przed odrzuceniem z 4.3(b)).

**DEC-04 Bundle ID aplikacji**

> * Kontekst: Wymóg przenośności Apps4Brew (ZP-15). Identyfikator jest nieodwracalny po publikacji.  
> * Opcje: A) `com.apps4brew.baker`; B) `com.apps4brew.piekarz`; C) `com.apps4brew.sourdough`.  
> * Rekomendacja: **A** (`com.apps4brew.baker` — neutralny, międzynarodowy).

**DEC-05 Oficjalna nazwa międzynarodowa aplikacji**

> * Kontekst: W Polsce aplikacja funkcjonuje jako „Piekarz”. Na rynkach anglosaskich potrzebna jest chwytliwa, unikalna nazwa.  
> * Opcje: A) Crust; B) Levain; C) Boule; D) Baker's Craft; E) DoughPath.  
> * Rekomendacja: **A** („Crust — Sourdough & Baking” lub „Levain”).

**DEC-06 Minimalna wersja systemów operacyjnych**

> * Opcje: A) iOS 17 / watchOS 10; B) iOS 18 / watchOS 11 (zapewnia kontrolki Control Center, widgety zintegrowane, nowy framework Live Activity); C) iOS 26\.  
> * Rekomendacja: **B** (iOS 18 / watchOS 11 — czysty kod bez wstecznych obejść).

**DEC-07 Hierarchia źródeł wiedzy piekarskiej**

> * Opcje: A) 5 szczebli: Rachunek stechiometryczny/fizyczny → Międzynarodowe normy piekarskie (ICC) → Klasyczne podręczniki mistrzowskie (Calvel, Hamelman, Suas, Reinhart) → Autorytety rzemieślnicze (Tartine/Robertson, Forkish) → Praktyka forów domowych; B) forfora internetowe na równi z podręcznikami.  
> * Rekomendacja: **A** (gwarantuje powtarzalność i brak błędów w kalkulatorze).

**DEC-08 Model danych i przechowywanie receptur**

> * Opcje: A) SQLite z lokalnym silnikiem SwiftData / CoreData; B) czysty plik JSON w piaskownicy aplikacji; C) Realm.  
> * Rekomendacja: **A** (SQLite/SwiftData z natywnym eksportem do czytelnego pliku `.piekarz` / `.json`).

**DEC-09 Zakres darmowego rdzenia (Free Tier)**

> * Opcje: A) kalkulator na 1 bochenek \+ 1 aktywny zakwas \+ podstawowy timer; B) aplikacja całkowicie płatna (Paywall przed wejściem); C) darmowy kalkulator, a płatny tylko harmonogram.  
> * Rekomendacja: **A** (buduje organiczne polecenia na grupach piekarzy i forach).

**DEC-10 Czas trwania okresu próbnego (Free Trial)**

> * Opcje: A) 14 dni pełnego dostępu; B) 7 dni; C) brak trialu.  
> * Rekomendacja: **A** (proces pieczenia chleba na zakwasie trwa 1–3 dni, użytkownik musi upiec co najmniej 2–3 bochenki, aby docenić harmonogram i DDT).

---

## **Blok II — Pierwsze 2 tygodnie budowy (Fundamenty)**

**DEC-11 Obsługa dokładności wagowej składników**

> * Opcje: A) waga mąki i wody w pełnych gramach (1 g), drożdże i sól z dokładnością do 0,1 g; B) wszystko w pełnych gramach; C) obsługa ułamków uncji (oz) dla rynku US.  
> * Rekomendacja: **A \+ C** (przełącznik g / oz; w metrycznym drożdże/sól wymagają 0,1 g przy małych partiach).

**DEC-12 Domyślna formuła obliczania DDT (Desired Dough Temperature)**

> * Opcje: A) formuła 3-składnikowa: \$T\_{wody} \= 3 	imes DDT \- (T\_{maki} \+ T\_{pokoju} \+ T\_{tarcia})\$; B) formuła 4-składnikowa z osobną temperaturą zakwasu: \$T\_{wody} \= 4 	imes DDT \- (T\_{maki} \+ T\_{pokoju} \+ T\_{zakwasu} \+ T\_{tarcia})\$.  
> * Rekomendacja: **B** jako standard przy recepturach na zakwasie (\>15% udziału), z automatycznym przełączeniem na A przy drożdżach bezpośrednich.

**DEC-13 Granica ostrzeżeń temperatury wody (DDT)**

> * Opcje: A) gdy wyliczona temperatura wody przekracza 45°C (ryzyko zabicia drożdży/bakterii) lub spada poniżej 4°C (wymaga lodu); B) brak ostrzeżeń, sam wynik liczbowy.  
> * Rekomendacja: **A** (aplikacja musi chronić ciasto przed ugotowaniem flory bakteryjnej).

**DEC-14 Uwzględnianie mąki i wody z zakwasu w hydratacji całkowitej**

> * Opcje: A) rygorystyczny bilans masowy (True Baker's %): mąka z zakwasu dodawana do 100% bazy mącznej; B) potoczne podejście amatorskie (zakwas traktowany jako osobny składnik, fałszujący hydratację).  
> * Rekomendacja: **A** jako domyślne, z czytelnym przełącznikiem widoku „Składniki do miski” vs „Bilans całkowity ciasta”.

**DEC-15 Architektura timerów etapowych**

> * Opcje: A) sekwencja połączona (automatyczne przejście do następnego etapu po upływie czasu); B) zatrzymanie z powiadomieniem krytycznym i wymóg potwierdzenia przez użytkownika.  
> * Rekomendacja: **B** (ciasto nie może czekać na auto-kolejny krok, jeśli piekarz nie jest przy stolnicy; każdy etap wymaga zatwierdzenia).

**DEC-16 Domyślny profil dokarmiania zakwasu w nowym profilu**

> * Opcje: A) proporcja 1:1:1 (zakwas:mąka:woda); B) 1:2:2; C) wybór z predefiniowanych profili (żytni 100%, pszenny biały 100%, lievito madre 50% hydratacji).  
> * Rekomendacja: **C** (z domyślnym żytnim 1:1:1 dla PL, pszennym 1:2:2 dla US).

**DEC-17 Kopia zapasowa receptur i historii**

> * Opcje: A) lokalny plik `.json` w katalogu Dokumenty \+ automatyczny zapis w prywatnym iCloud Drive użytkownika; B) wymaganie konta CloudKit z logowaniem Apple ID.  
> * Rekomendacja: **A** (zgodnie z zasadą ZP-02 bez konta i ZP-06 dane nie znikają).

**DEC-18 Zakres danych osobowych (Privacy Manifest)**

> * Opcje: A) całkowite „Data Not Collected” — zero analityki, zero crashlytics zewnętrznych; B) anonimowe Apple Analytics.  
> * Rekomendacja: **A** (najwyższy standard prywatności Apps4Brew).

**DEC-19 Dźwięki i alarmy kuchenne**

> * Opcje: A) standardowe powiadomienia iOS; B) dedykowane głośne dzwonki piekarskie (klasyczny dzwonek pieca, gong), słyszalne z drugiego pokoju przy pracującym okapie.  
> * Rekomendacja: **B** (z opcją powiadomień Time-Sensitive / Critical Alerts).

**DEC-20 Sposób naboru wagi ciasta**

> * Opcje: A) użytkownik wpisuje wagę 1 bochenka i liczbę sztuk; B) użytkownik wpisuje całkowitą dostępną mąkę; C) oba kierunki przeliczenia w czasie rzeczywistym.  
> * Rekomendacja: **C** (dwustronny kalkulator reaktywny).

---

## **Blok III — Przed testami i publikacją (Tydzień 3–4)**

**DEC-21 Polityka ostrzeżeń przed zepsuciem biologicznym zakwasu**

> * Opcje: A) rygorystyczna lista objawów dyskwalifikujących (pleśń różowa/czarna, zapach zgnilizny) nakazująca natychmiastowe wyrzucenie zakwasu; B) porady jak ratować zapleśniały zakwas.  
> * Rekomendacja: **A** (bezwzględne bezpieczeństwo mikrobiologiczne, zero kompromisów sanitarnych).

**DEC-22 Obsługa piekarnika domowego vs garnka żeliwnego**

> * Opcje: A) profile pieczenia z fazą parowania (np. 20 min w garnku z pokrywką 230°C \+ 20 min bez pokrywki 200°C); B) tylko jeden czas pieczenia.  
> * Rekomendacja: **A** (rozbicie pieczenia na fazę parową i fazę rumienienia).

**DEC-23 Integracja z przyciskiem czynności (Action Button) w iPhone 15 Pro / 16**

> * Opcje: A) bezpośrednie odhaczenie bieżącego składania lub pauza timera; B) otwarcie aplikacji.  
> * Rekomendacja: **A** (kluczowa funkcja dla dłoni ubrudzonych ciastem).

**DEC-24 Udostępnianie receptur innym użytkownikom**

> * Opcje: A) generowanie karty graficznej receptury (PNG) oraz pliku `.piekarz` do wysłania AirDrop/iMessage; B) społecznościowa chmura przepisów.  
> * Rekomendacja: **A** (pełna prywatność, brak infrastruktury serwerowej).

**DEC-25 Słownik mąk regionalnych w lokalizacjach**

> * Opcje: A) mapowanie typów mąk (PL: typ 450, 500, 650, 750, 1050, 2000; FR: T45, T55, T65, T80, T110, T150; IT: Tipo 00, 0, 1, 2, Integrale; DE: Type 405, 550, 812, 1050; US: Pastry, All-Purpose, Bread, Whole Wheat); B) wyłącznie nazewnictwo angielskie.  
> * Rekomendacja: **A** (lokalizacja merytoryczna buduje zaufanie profesjonalistów).

**DEC-26 Kompensacja czasu fermentacji względem temperatury otoczenia**

> * Opcje: A) dynamiczne wydłużanie/skracanie sugerowanych czasów na bazie odczytu temperatury z termometru kuchennego; B) sztywne czasy bez podpowiedzi temperaturowych.  
> * Rekomendacja: **A** (współczynnik Q10 fermentacji: ciasto w 21°C rośnie 1,5x dłużej niż w 26°C).

**DEC-27 Sposób prezentacji „Doktora Chleba”**

> * Opcje: A) interaktywne drzewo pytań („Co widzisz na przekroju?” → zdjęcia wzorcowe → przyczyna → rozwiązanie); B) długa lista artykułów tekstowych.  
> * Rekomendacja: **A** (maksymalna użyteczność podczas wyjmowania nieudanego bochenka).

**DEC-28 Odpowiedzialność za błędy kulinarne w regulaminie**

> * Opcje: A) standardowa klauzula informacyjna o charakterze pomocniczym kalkulatora i zasadach higieny kuchennej; B) brak klauzul.  
> * Rekomendacja: **A**.

**DEC-29 Kwestia znaków towarowych nazwy międzynarodowej**

> * Opcje: A) zgłoszenie znaku przed publikacją; B) weryfikacja dostępności w bazach EUIPO i USPTO we własnym zakresie, publikacja pod marką parasolową Apps4Brew.  
> * Rekomendacja: **B** (koszt 0 zł na start).

**DEC-30 Wsparcie dla pieczywa bezglutenowego w wersji 1.0**

> * Opcje: A) wyłączenie pieczywa bezglutenowego z MVP (zupełnie inna fizykochemia, brak siatki glutenowej, inne gumy i hydrokoloidy); B) próba wdrożenia w MVP.  
> * Rekomendacja: **A** (jasne określenie zakresu: pieczywo tradycyjne pszenne, żytnie, orkiszowe, mieszane; bezglutenowe w 2.x jako osobny moduł).

---

## **Blok IV — Wersje 1.1, 1.2 i przyszłość (Rozwój)**

**DEC-31 Aplikacja dedykowana na tablety iPad (iPadOS)**

> * Opcje: A) w wersji 1.1 zoptymalizowany widok kawiarniany / piekarniczy (duży pulpit kuchenny na stojak); B) tylko tryb zgodności iPhone na iPadzie w 1.0.  
> * Rekomendacja: **B** w 1.0, **A** w 1.1.

**DEC-32 Skanowanie odręcznych notatek z przepisami (OCR)**

> * Opcje: A) lokalny VisionKit w 1.2 (rozpoznawanie składników ze zdjęć starych przepiśników babci); B) brak planów.  
> * Rekomendacja: **A** (wersja 1.2).

**DEC-33 Integracja z sondami Bluetooth (Meater itp.)**

> * Opcje: A) badanie w 2.x; B) odrzucone ze względu na brak stabilnego publicznego SDK i wysoki koszt wsparcia.  
> * Rekomendacja: **A** (etap badania 2.x).

**DEC-34 Receptury na słodkie ciasta drożdżowe (chałki, brioszki, panettone)**

> * Opcje: A) moduł „Ciasta bogate” (wysoka zawartość masła i cukru, osłabienie drożdży) w 1.1; B) wyłącznie chleby i bułki.  
> * Rekomendacja: **A** (świetny driver konwersji przed świętami wielkanocnymi i bożonarodzeniowymi).

**DEC-35 Baza wiedzy o kulturach starterowych ze świata (San Francisco, Lievito Madre, Desem)**

> * Opcje: A) rozbudowane profile mikrobiologiczne w wersji 1.2; B) wersja 1.0 z podstawowym podziałem mącznym.  
> * Rekomendacja: **B** w 1.0, **A** w 1.2.

**DEC-36 Licznik kosztu bochenka (rachunek ekonomiczny)**

> * Opcje: A) moduł w 1.1: wpisanie cen worka mąki i prądu → koszt upieczenia 1 bochenka chleba vs cena w piekarni rzemieślniczej; B) rezygnacja.  
> * Rekomendacja: **A** (silny atut psychologiczny wspierający hasło „tańsze niż espresso”).

**DEC-37 Eksport harmonogramu do kalendarza systemowego (EventKit)**

> * Opcje: A) w wersji 1.1 dodawanie bloków czasowych „Pieczenie chleba” do kalendarza Apple/Google; B) pozostanie przy samych alarmach i Live Activity.  
> * Rekomendacja: **A** (etap 1.1).

**DEC-38 Dynamiczne wsparcie dla wysokości n.p.m. (High Altitude Baking)**

> * Opcje: A) automatyczna korekta hydratacji i ilości drożdży powyżej 1000 m n.p.m. na bazie GPS/CoreLocation; B) opcjonalna korekta ręczna w ustawieniach.  
> * Rekomendacja: **B** w 1.2 (bez użycia uprawnień lokalizacyjnych GPS).

**DEC-39 Tryb ciemny o podwyższonym kontraście (OLED Night Bake)**

> * Opcje: A) czysty heksadecymalny czarny (\#000000) z bursztynowym tekstem dla nocnych wypieków (04:00 rano bez rażenia oczu); B) standardowy tryb ciemny iOS.  
> * Rekomendacja: **A** (wspaniały detal rzemieślniczy doceniany przez domowych piekarzy).

**DEC-40 Dostępność i współpraca z czytnikami kuchennymi**

> * Opcje: A) wsparcie dla VoiceOver, dynamicznego powiększania tekstu oraz pełnej nawigacji klawiaturą zewnętrzną Bluetooth; B) samo VoiceOver.  
> * Rekomendacja: **A** (wymóg ZP-11).
# BRD Piekarz — wymagania: plan i prowadzenie wypieku (HARMO, ETAP, CZAS, REKA)

Stan: E3 · Aktualizacja: 2026-10-19. Główny przepływ aplikacji (cel ZP-17: „pilnuje czasu, gdy telefon śpi”).

### BR-HARMO-001: Plan liczony wstecz od godziny „gotowe”
- Przepływ: PR-02, PR-17 · Reguła: RD-17
- Dowód potrzeby: J-02; 15 z 338 recenzji o prowadzeniu w czasie (S-27); plan „co i kiedy” jako prośba (S-16, rec. 14207280110); harmonogram kroków dla pizzy (S-19, rec. 7681506247)
- Kryteria akceptacji:
  - Scenariusz: Godziny etapów
    - Zakładając, że receptura ma etapy z czasami z receptury, a temperatura w kuchni wynosi 24 °C
    - Gdy użytkownik wybiera godzinę „chleb gotowy” jutro o 10:00
    - Wtedy widzi listę etapów z godziną startu każdego, a ostatni etap kończy się o 10:00
  - Scenariusz: Godzina w przeszłości
    - Zakładając, że suma czasów etapów jest dłuższa niż czas do wybranej godziny
    - Gdy użytkownik zatwierdza plan
    - Wtedy widzi, że plan nie zdąży, i najwcześniejszą możliwą godzinę „gotowe”

### BR-HARMO-002: Plan omija godziny snu
- Przepływ: PR-02
- Dowód potrzeby: J-02; soczewka początkującego (dopasowanie planu do snu i chłodnia jako rozwiązanie); kod wykrywa kolizje (`app/(tabs)/harmonogram.tsx`, l. 76–83)
- Kryteria akceptacji:
  - Scenariusz: Krok czynny w nocy
    - Zakładając, że użytkownik ustawił godziny snu 23:00–07:00 [DO WYJAŚNIENIA] (OP-45) domyślne
    - Gdy plan wypada ze składaniem o 02:00
    - Wtedy aplikacja oznacza kolizję i proponuje przesunięcie albo chłodnię
  - Scenariusz: Brak godzin snu
    - Zakładając, że użytkownik nie ustawił godzin snu
    - Gdy tworzy plan
    - Wtedy plan powstaje bez sprawdzania kolizji, a aplikacja informuje, że godziny snu można ustawić

### BR-HARMO-003: Czas fermentacji z temperatury
- Przepływ: PR-02, PR-03 · Reguła: RD-17
- Dowód potrzeby: J-03; kalkulator fermentacji przewidujący czas (S-14, rec. 8937437575); nieudane wyrastanie przy innej temperaturze (S-19, rec. 12854321839)
- Kryteria akceptacji:
  - Szablon scenariusza: Czas w zakresie modelu
    - Zakładając, że czas fermentacji w recepturze w 24 °C to 240 min
    - Gdy temperatura wynosi <T> °C
    - Wtedy plan pokazuje <czas> min
    - Przykłady: T = 21 → 333,69 (RD-17-W1); T = 20 → 372,44 (RD-17-W2); T = 26 → 192,66 (RD-17-W3)
  - Scenariusz: Poza zakresem modelu
    - Zakładając, że czas w recepturze to 240 min
    - Gdy temperatura wynosi 19,9 °C
    - Wtedy plan nie pokazuje przeliczonego czasu, tylko komunikat, że temperatura jest poza zakresem 20–26 °C (RD-17-W5; treść komunikatu: OP-35)

### BR-HARMO-004: Przesunięcie kroku po spóźnieniu
- Przepływ: PR-04, PR-15
- Dowód potrzeby: J-02; prośba o pauzę minutnika (S-14, rec. 7282073654); soczewka początkującego (krok pominięty o godziny)
- Kryteria akceptacji:
  - Scenariusz: Spóźnione składanie
    - Zakładając, że krok „składanie” miał termin 14:00
    - Gdy użytkownik potwierdza go o 15:00
    - Wtedy dalsze kroki przesuwają się o 60 min, a nowa godzina „gotowe” jest widoczna
  - Scenariusz: Przesunięcie poza godziny snu
    - Zakładając, że przesunięcie przenosi krok czynny w godziny snu
    - Gdy aplikacja przelicza plan
    - Wtedy oznacza kolizję jak w BR-HARMO-002

### BR-HARMO-005: Zakończenie kroku wcześniej i cofnięcie pomyłkowo potwierdzonego kroku
- Przepływ: PR-04, PR-15
- Dowód potrzeby: J-02; S-64 (konkurent opisuje elastyczny plan: wcześniejsze zakończenie kroku, powrót do kroku, dodanie czasu); soczewka początkującego (pomyłka, przerwanie); BR-HARMO-004 obejmuje tylko spóźnienie
- Kryteria akceptacji:
  - Scenariusz: Krok skończony wcześniej
    - Zakładając, że krok „garowanie” ma termin 14:00
    - Gdy użytkownik kończy go o 13:30
    - Wtedy dalsze kroki przesuwają się o 30 min wcześniej, a powiadomienia dostają nowe godziny (BR-CZAS-002)
  - Scenariusz: Cofnięcie pomyłkowego potwierdzenia
    - Zakładając, że użytkownik potwierdził krok 4 przez pomyłkę o 12:00, a krok miał termin 12:40
    - Gdy cofa potwierdzenie o 12:05
    - Wtedy wraca do kroku 4 z 35 min do końca, a plan i powiadomienia wracają do stanu sprzed potwierdzenia
  - Scenariusz: Cofnięcie po terminie kroku
    - Zakładając, że termin cofanego kroku już minął
    - Gdy użytkownik cofa potwierdzenie
    - Wtedy widzi, o ile termin minął, i może przesunąć dalsze kroki (BR-HARMO-004)
  - Scenariusz: Brak kroku do cofnięcia
    - Zakładając, że wypiek jest na pierwszym kroku
    - Gdy użytkownik szuka cofnięcia
    - Wtedy cofnięcie jest niedostępne

### BR-ETAP-001: Prowadzenie krok po kroku
- Przepływ: PR-04, PR-17
- Dowód potrzeby: J-02, J-08; tryb „jeden krok naraz” (S-23, rec. 6860807346); aplikacja wie, na którym jestem kroku (S-14, rec. 13748164005)
- Kryteria akceptacji:
  - Scenariusz: Bieżący krok
    - Zakładając, że wypiek trwa
    - Gdy użytkownik otwiera aplikację
    - Wtedy widzi bieżący krok, co w nim zrobić, potrzebne składniki i czas do końca kroku
  - Scenariusz: Potwierdzenie kroku
    - Zakładając, że krok czynny się skończył
    - Gdy użytkownik potwierdza wykonanie
    - Wtedy widzi następny krok z jego godziną

### BR-ETAP-002: Kroki z receptury: składania dla pszennego, bez składań dla żytniego
- Przepływ: PR-04 · Reguła: RD-20
- Dowód potrzeby: J-02; D-030 (kroki z receptury i planu, wariant żytni bez składań); S-56, S-57
- Kryteria akceptacji:
  - Scenariusz: Wariant żytni
    - Zakładając, że receptura ma 60% mąki żytniej
    - Gdy użytkownik zaczyna wypiek
    - Wtedy lista kroków nie ma składań (RD-20-W1)
  - Scenariusz: Granica 50%
    - Zakładając, że receptura ma 50% mąki żytniej
    - Gdy użytkownik zaczyna wypiek
    - Wtedy lista kroków ma składania z receptury (RD-20-W2)

### BR-ETAP-003: Ocena gotowości ciasta przed pieczeniem
- Przepływ: PR-04, PR-13
- Dowód potrzeby: J-08; soczewka eksperta (formowanie i garowanie bez pracy); [OCENA] dowód słaby, bez recenzji; wejście istnieje w kodzie (`src/core/bake-steps.ts:50`)
- Kryteria akceptacji:
  - Scenariusz: Wskazówka w kroku garowania
    - Zakładając, że bieżący krok to garowanie
    - Gdy użytkownik otwiera wskazówkę gotowości
    - Wtedy widzi opis próby z treści roli 06 ze źródłem albo informację, że treść czeka na źródło [DO USTALENIA] (OP-46)

### BR-ETAP-004: Ostrzeżenia bezpieczeństwa w krokach
- Przepływ: PR-04, PR-11, PR-17 · Reguła: RD-22, RD-23
- Dowód potrzeby: kontekst ryzykowny J-02, J-11 (⚠ w `odkrywanie.md`); RYZ-15, RYZ-16; M1-audytor-generalny-086
- Kryteria akceptacji:
  - Scenariusz: Zdjęcie pokrywy garnka
    - Zakładając, że bieżący krok to zdjęcie pokrywy garnka w piecu
    - Gdy krok się zaczyna
    - Wtedy użytkownik widzi ostrzeżenie: suche rękawice, pokrywa unoszona od siebie z powodu pary (RD-23-W1)
  - Scenariusz: Mieszanie ciasta
    - Zakładając, że bieżący krok to mieszanie ciasta
    - Gdy krok się zaczyna
    - Wtedy użytkownik widzi przypomnienie, żeby nie próbować surowego ciasta i umyć ręce (RD-22-W1)
  - Scenariusz: Krok nieznanego rodzaju
    - Zakładając, że krok z własnej receptury nie ma rodzaju
    - Gdy krok trwa w czasie wypieku
    - Wtedy użytkownik widzi ostrzeżenie o gorącym naczyniu (RD-23-W4)

### BR-ETAP-005: Wznowienie trwającego wypieku po zamknięciu aplikacji
- Przepływ: PR-15
- Dowód potrzeby: J-02; audyt M1 01-odkrywanie-005 (stan wypieku tylko w pamięci); awaria w trakcie kroków u konkurencji (S-14, rec. 13643687864)
- Kryteria akceptacji:
  - Scenariusz: System zamknął aplikację w nocy
    - Zakładając, że wypiek trwa na kroku 7 z terminem 08:00
    - Gdy system zamyka aplikację, a użytkownik otwiera ją o 07:30
    - Wtedy widzi krok 7 i 30 min do końca
  - Scenariusz: Termin minął
    - Zakładając, że krok miał termin 08:00
    - Gdy użytkownik otwiera aplikację o 09:15
    - Wtedy widzi, że krok skończył się 75 min temu, i może przesunąć dalsze kroki (BR-HARMO-004)
  - Scenariusz: Zapis w starym formacie
    - Zakładając, że trwający wypiek zapisała poprzednia wersja aplikacji
    - Gdy użytkownik otwiera nową wersję
    - Wtedy wypiek wczytuje się bez utraty kroku i terminu (D-030)

### BR-CZAS-002: Sygnał kroku przy zablokowanym telefonie
- Przepływ: PR-04, PR-05 · Ograniczenie: OG-05 (opis w sklepie obiecuje sygnał tylko, jeśli działa) · zależy od: ZAL-032
- Dowód potrzeby: cel właściciela ZP-17; 15 z 338 recenzji (S-14, S-15, S-25); decyzja DEC-02 (a) planu napraw M1 (powiadomienia lokalne, poziom pilny dla kroków krytycznych, bez Live Activity w 1.0)
- Kryteria akceptacji:
  - Scenariusz: Koniec kroku przy zablokowanym ekranie
    - Zakładając, że użytkownik zgodził się na powiadomienia, a krok kończy się o 14:00
    - Gdy telefon jest zablokowany
    - Wtedy o 14:00 pojawia się powiadomienie z nazwą następnego kroku (punktualność: NFR-CZAS-001)
  - Scenariusz: Zmiana planu
    - Zakładając, że zaplanowano powiadomienie na 14:00
    - Gdy użytkownik przesuwa krok o 60 min
    - Wtedy powiadomienie na 14:00 nie pojawia się, a pojawia się o 15:00
  - Scenariusz: Koniec wypieku
    - Zakładając, że wypiek ma zaplanowane powiadomienia
    - Gdy użytkownik kończy albo przerywa wypiek
    - Wtedy żadne powiadomienie tego wypieku już się nie pojawia

### BR-CZAS-003: Brak zgody na powiadomienia
- Przepływ: PR-04
- Dowód potrzeby: RYZ-13; soczewka początkującego (odmowa zgody, tryb Skupienie); brak alarmów jako powód zwrotu (S-14, rec. 6774626932)
- Kryteria akceptacji:
  - Scenariusz: Wyjaśnienie przed prośbą
    - Zakładając, że użytkownik zaczyna pierwszy wypiek
    - Gdy aplikacja ma poprosić o zgodę na powiadomienia
    - Wtedy najpierw widzi jedno zdanie, po co są powiadomienia
  - Scenariusz: Odmowa
    - Zakładając, że użytkownik odmówił zgody
    - Gdy prowadzi wypiek
    - Wtedy przy każdym kroku widzi, że sygnał nie przyjdzie przy zablokowanym ekranie, i jak włączyć powiadomienia w ustawieniach telefonu

### BR-REKA-001: Ekran nie gaśnie w kroku czynnym
- Przepływ: PR-04 · zależy od: ZAL-031
- Dowód potrzeby: 2 z 338 recenzji (S-17, rec. 12712335936; S-19, rec. 11419881732); [OCENA] dowód słaby
- Kryteria akceptacji:
  - Scenariusz: Krok czynny
    - Zakładając, że bieżący krok to krok czynny (mieszanie, składanie, formowanie)
    - Gdy użytkownik nie dotyka ekranu dłużej niż czas wygaszania telefonu
    - Wtedy ekran pozostaje włączony do końca kroku
  - Scenariusz: Krok bierny
    - Zakładając, że bieżący krok to fermentacja w chłodni
    - Gdy użytkownik nie dotyka ekranu
    - Wtedy ekran gaśnie jak zwykle

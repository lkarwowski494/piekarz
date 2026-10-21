# BRD Piekarz — wymagania: receptury, dziennik, nauka i Doktor (RECP, SPIZ, NAUK, DIAG, WSP, DRUK)

Stan: E3 · Aktualizacja: 2026-10-19. Nauka i Doktor Chleba w granicach aplikacji: ZP-20. Każde zdanie treści dziedzinowej ma źródło w rejestrze roli 06 i przekład na 35 języków (NFR-JEZ-001).

### BR-RECP-001: Receptury bazowe
- Przepływ: PR-01, PR-12, PR-17
- Dowód potrzeby: J-01, J-08, J-11, P-6; początkujący zaczynają od gotowych przepisów (S-18, rec. 10702359464; S-23, rec. 6860807346); ZP-23 (zakwas, drożdże, pizza)
- Kryteria akceptacji:
  - Scenariusz: Wybór receptury bazowej
    - Zakładając, że użytkownik nie ma własnych receptur
    - Gdy wybiera rodzaj pieczywa
    - Wtedy widzi receptury bazowe tego rodzaju z procentami i może zacząć od nich PR-01
  - Scenariusz: Bez ukrywania receptur
    - Zakładając, że użytkownik ma dostęp do funkcji (próba albo zakup)
    - Gdy przegląda receptury bazowe
    - Wtedy żadna nie jest zablokowana osobno (decyzja D-034, pyt. 8a)

### BR-RECP-002: Własne receptury
- Przepływ: PR-01
- Dowód potrzeby: J-01, P-7; brak zapisu własnych receptur jako powód odejścia (S-18, rec. 10719043217); zapis receptur chwalony (S-19, rec. 13216733937)
- Kryteria akceptacji:
  - Scenariusz: Zapis i edycja
    - Zakładając, że użytkownik zmienił recepturę bazową
    - Gdy zapisuje ją pod własną nazwą
    - Wtedy receptura bazowa się nie zmienia, a własna jest na liście receptur
  - Scenariusz: Przerwany zapis
    - Zakładając, że aplikacja zamyka się w trakcie zapisu
    - Gdy użytkownik otwiera ją ponownie
    - Wtedy widzi recepturę w ostatniej zapisanej wersji, bez uszkodzenia (BR-DANE-001)

### BR-RECP-003: Dziennik wypieków z oceną i notatką
- Przepływ: PR-06
- Dowód potrzeby: J-05; cel właściciela („pomaga poprawiać następny wypiek”); 9 z 338 recenzji; notatki w trakcie receptury (S-17, rec. 12938392161)
- Kryteria akceptacji:
  - Scenariusz: Ocena po wypieku
    - Zakładając, że użytkownik kończy wypiek
    - Gdy wystawia ocenę 1–5 i dopisuje notatkę
    - Wtedy wpis z datą, recepturą, temperaturami i oceną jest w historii
  - Scenariusz: Następny wypiek z wpisu
    - Zakładając, że w historii jest wpis
    - Gdy użytkownik wybiera „piecz ponownie”
    - Wtedy zaczyna PR-02 z tą samą recepturą i widzi notatkę z poprzedniego razu
  - Scenariusz: Przegląd historii bez zakupu
    - Zakładając, że próba się skończyła bez zakupu
    - Gdy użytkownik otwiera historię
    - Wtedy widzi wszystkie wpisy, ale nie może dodać nowego (DEC-01 d, BR-ZAK-004)

### BR-RECP-004: Porównanie dwóch wypieków
- Przepływ: PR-06
- Dowód potrzeby: J-05, P-7; zmiany receptury między wypiekami (S-14, rec. 8937437575); soczewka pasjonata (po roku 100+ wpisów)
- Kryteria akceptacji:
  - Scenariusz: Dwa wpisy obok siebie
    - Zakładając, że użytkownik ma dwa wpisy tej samej receptury
    - Gdy wybiera porównanie
    - Wtedy widzi różnice: hydratacja, temperatury, czasy, ocena i notatki
  - Scenariusz: Jeden wpis
    - Zakładając, że receptura ma tylko jeden wpis
    - Gdy użytkownik wybiera porównanie
    - Wtedy widzi, że do porównania potrzebny jest drugi wpis

### BR-SPIZ-001: Spiżarnia mąk
- Przepływ: PR-01
- Dowód potrzeby: decyzja D-034 (pyt. 6a: F-30 w części płatnej, wyjątek właściciela bez dowodu B/R/W); spiżarnia z kosztem chwalona (S-17, rec. 14236863250)
- Kryteria akceptacji:
  - Scenariusz: Zapas po wypieku
    - Zakładając, że spiżarnia ma 2000 g mąki pszennej
    - Gdy użytkownik kończy wypiek z 1000 g tej mąki
    - Wtedy spiżarnia pokazuje 1000 g
  - Scenariusz: Za mało mąki
    - Zakładając, że spiżarnia ma 500 g mąki
    - Gdy użytkownik planuje wypiek z 1000 g
    - Wtedy widzi, że brakuje 500 g, a plan da się zapisać

### BR-NAUK-001: Akademia: wyjaśnienie przy kroku i lekcje
- Przepływ: PR-13 · zależy od: ZAL-041, ZAL-048
- Dowód potrzeby: J-08, P-6; 14 z 338 recenzji o instrukcjach dla początkujących; ZP-20; decyzja D-034 (pyt. 4b: Akademia bez rang); H-13
- Kryteria akceptacji:
  - Scenariusz: Wyjaśnienie przy kroku
    - Zakładając, że bieżący krok to składanie
    - Gdy użytkownik otwiera „po co ten krok”
    - Wtedy widzi krótkie wyjaśnienie z treści roli 06 i wraca do kroku bez utraty stanu wypieku
  - Scenariusz: Treść bez źródła
    - Zakładając, że twierdzenie lekcji ma w rejestrze roli 06 status „otwarte”
    - Gdy aplikacja buduje lekcję
    - Wtedy to zdanie się nie pokazuje (RYZ-21)

### BR-DIAG-001: Doktor Chleba dla bochenka
- Przepływ: PR-14, PR-06 · zależy od: ZAL-047
- Dowód potrzeby: J-09; 5 z 338 recenzji o diagnozie (S-16); ZP-20; decyzja D-034 (pyt. 3a: propozycja po ocenie ≤ 2★); H-10
- Kryteria akceptacji:
  - Scenariusz: Propozycja po słabej ocenie
    - Zakładając, że użytkownik ocenia bochenek na 2★
    - Gdy zapisuje ocenę
    - Wtedy widzi propozycję otwarcia Doktora Chleba
  - Scenariusz: Diagnoza
    - Zakładając, że użytkownik wybiera objaw „zbity miękisz”
    - Gdy odpowiada na pytania
    - Wtedy widzi możliwe przyczyny z treści roli 06 i jedną zmianę na następny wypiek
  - Scenariusz: Bez oceny zdjęcia
    - Zakładając, że użytkownik chce dodać zdjęcie
    - Gdy otwiera Doktora
    - Wtedy diagnoza opiera się tylko na objawach i pytaniach

### BR-DIAG-002: Doktor Chleba dla zakwasu, który nie rośnie
- Przepływ: PR-14, PR-11 · Reguła: RD-21, RD-24
- Dowód potrzeby: J-07, J-09; soczewka początkującego (brak ścieżki „zakwas się nie udał” przed wypiekiem); wielokrotne próby założenia (S-21, rec. 12986088850)
- Kryteria akceptacji:
  - Scenariusz: Zakwas bez aktywności w dniu 5
    - Zakładając, że jest dzień 5 zakładania, a zakwas nie podwaja objętości
    - Gdy użytkownik otwiera Doktora dla zakwasu
    - Wtedy widzi możliwe przyczyny z treści roli 06 i radę, by karmić dalej co 12 h (RD-24-W3)
  - Scenariusz: Objawy pleśni w Doktorze
    - Zakładając, że użytkownik w Doktorze zaznacza kolorowe plamy
    - Gdy zatwierdza objawy
    - Wtedy widzi polecenie wyrzucenia zakwasu (RD-21-W1), a nie listę przyczyn

### BR-WSP-003: Receptura w kodzie QR bez sieci
- Przepływ: PR-08 · zależy od: ZAL-029
- Dowód potrzeby: decyzja D-029 (QR offline, wyjątek właściciela z dowodem tylko H); słaby dowód J-06 (3 z 338 recenzji)
- Kryteria akceptacji:
  - Scenariusz: Pokazanie kodu
    - Zakładając, że użytkownik otwiera własną recepturę
    - Gdy wybiera „pokaż kod QR”
    - Wtedy kod zawiera tekst receptury bez adresu internetowego (D-029, ZM-05)
  - Scenariusz: Skan kodu
    - Zakładając, że odbiorca skanuje kod w Piekarzu
    - Gdy kod jest poprawny
    - Wtedy widzi recepturę do zapisania z tymi samymi procentami
  - Scenariusz: Uszkodzony kod
    - Zakładając, że kod nie jest recepturą Piekarza
    - Gdy odbiorca go skanuje
    - Wtedy widzi komunikat, że kod nie zawiera receptury, a nic się nie zapisuje
  - Scenariusz: Brak zgody na aparat
    - Zakładając, że odbiorca nie zgodził się na aparat
    - Gdy wybiera skan
    - Wtedy widzi, jak włączyć aparat w ustawieniach telefonu

### BR-DRUK-001: Wydruk karty receptury i etykiety słoika
- Przepływ: PR-08, PR-05
- Dowód potrzeby: decyzja D-034 (pyt. 7b: druk PDF i etykiety w MVP, jedno wejście w menu); jedna prośba o druk (S-18, rec. 10632970976); [OCENA] dowód słaby
- Kryteria akceptacji:
  - Scenariusz: Karta receptury
    - Zakładając, że użytkownik otwiera recepturę
    - Gdy wybiera wydruk
    - Wtedy dostaje plik PDF z nazwą, składnikami w gramach i procentami
  - Scenariusz: Brak drukarki
    - Zakładając, że telefon nie widzi drukarki
    - Gdy użytkownik wybiera wydruk
    - Wtedy może zapisać albo udostępnić plik PDF

### BR-OPIN-001: Systemowa prośba o ocenę po udanym wypieku
- Przepływ: PR-06 · Ograniczenie: OG-07
- Dowód potrzeby: J-12; decyzja DEC-13 (a) planu napraw M1 (prośba o ocenę po udanym bochenku); zadanie M1-audytor-generalny-082; S-63 (prośba na końcu sekwencji, którą użytkownik zakończył sukcesem)
- Kryteria akceptacji:
  - Scenariusz: Udany wypiek
    - Zakładając, że użytkownik zakończył wypiek i ocenił bochenek co najmniej na 4★ (D-042)
    - Gdy zapis oceny się kończy i użytkownik wraca do dziennika
    - Wtedy aplikacja wywołuje systemową prośbę o ocenę, a system sam decyduje, czy ją pokazać (najwyżej trzy razy w ciągu 365 dni, S-63)
  - Scenariusz: Słaba ocena
    - Zakładając, że użytkownik ocenił bochenek na 2★
    - Gdy zapisuje ocenę
    - Wtedy aplikacja nie wywołuje prośby o ocenę, tylko propozycję Doktora Chleba (BR-DIAG-001)
  - Scenariusz: Bez własnego okna
    - Zakładając, że jakikolwiek warunek prośby jest spełniony
    - Gdy aplikacja prosi o ocenę
    - Wtedy używa tylko systemowego mechanizmu, bez własnego okna z gwiazdkami ani pytania „czy podoba ci się aplikacja” (OG-07)

### BR-OPIN-002: Link „Oceń w App Store”
- Przepływ: PR-18 · Ograniczenie: OG-07
- Dowód potrzeby: J-12; zadanie M1-audytor-generalny-082; S-63 (link do strony aplikacji z parametrem `action=write-review` po działaniu użytkownika)
- Kryteria akceptacji:
  - Scenariusz: Ocena z ustawień
    - Zakładając, że użytkownik jest w ustawieniach
    - Gdy wybiera „oceń w App Store”
    - Wtedy otwiera się strona aplikacji w App Store z formularzem recenzji
  - Scenariusz: Brak sieci
    - Zakładając, że telefon nie ma sieci
    - Gdy użytkownik wybiera „oceń w App Store”
    - Wtedy widzi, że ocena wymaga połączenia z App Store, a aplikacja działa dalej

### BR-OPIN-003: Kontakt i zgłoszenie problemu bez śledzenia
- Przepływ: PR-18
- Dowód potrzeby: J-12; zadanie M1-audytor-generalny-083 (kontakt w Ustawieniach na działający adres wsparcia); brak kontaktu w aplikacji u konkurencji (S-16, rec. 13931423989); ZP-17 (bez śledzenia)
- Kryteria akceptacji:
  - Scenariusz: Wiadomość do autora
    - Zakładając, że użytkownik jest w ustawieniach
    - Gdy wybiera „napisz do nas”
    - Wtedy otwiera się systemowa aplikacja poczty z adresem wsparcia i tematem, a treść (wersja aplikacji i wersja iOS, bez modelu telefonu: ER-52) jest widoczna i do zmiany przed wysłaniem
  - Scenariusz: Bez danych w tle
    - Zakładając, że użytkownik zamyka wiadomość bez wysyłania
    - Gdy wraca do aplikacji
    - Wtedy nic nie zostało wysłane, a aplikacja nie wykonała żadnego połączenia (NFR-OFF-001)
  - Scenariusz: Brak skonfigurowanej poczty
    - Zakładając, że telefon nie ma skonfigurowanej aplikacji poczty
    - Gdy użytkownik wybiera „napisz do nas”
    - Wtedy widzi adres wsparcia do skopiowania

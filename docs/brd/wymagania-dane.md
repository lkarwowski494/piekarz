# BRD Piekarz — wymagania: dane, dostęp i prywatność (DANE, ZAK, UST, PRYW)

Stan: E3 · Aktualizacja: 2026-10-19. Model płatności rozstrzygnęły DEC-01 (d) planu napraw M1 i D-033; BRD go nie zmienia. Kontrakt płatności i ujawnienia: rola 02 (`docs/monetyzacja.md`).

### BR-DANE-001: Trwały zapis bez utraty danych
- Przepływ: PR-07, PR-15
- Dowód potrzeby: J-10; 10 z 338 recenzji o utracie danych, 8 z nich ≤ 3★ (ZAL-035); zasada wspólna 10
- Kryteria akceptacji:
  - Scenariusz: Aktualizacja aplikacji
    - Zakładając, że użytkownik ma receptury, zakwasy i historię w poprzedniej wersji
    - Gdy instaluje nową wersję ze zmianą schematu bazy
    - Wtedy wszystkie receptury, zakwasy, wpisy i trwający wypiek są dostępne bez zmian (NFR-DANE-003)
  - Scenariusz: Nieudana migracja
    - Zakładając, że migracja schematu przerywa się błędem
    - Gdy aplikacja startuje
    - Wtedy baza zostaje w poprzednim stanie, a użytkownik widzi komunikat i może wyeksportować dane (BR-DANE-003)
  - Scenariusz: Uszkodzony plik stanu
    - Zakładając, że zapisany stan aplikacji jest uszkodzony
    - Gdy aplikacja startuje
    - Wtedy uszkodzony stan zostaje zachowany jako kopia, a aplikacja działa dalej (ochrona `state_corrupt_*`, `CLAUDE.md`, zasada 3)

### BR-DANE-002: Kopia zapasowa, która przetrwa utratę telefonu
- Przepływ: PR-07 · zależy od: ZAL-036
- Dowód potrzeby: J-10; RYZ-12 (kopie automatyczne tylko na tym samym telefonie, `src/lib/backup.ts:8-9`); soczewka pasjonata
- Kryteria akceptacji:
  - Scenariusz: Kopie automatyczne
    - Zakładając, że użytkownik zakończył wypiek
    - Gdy aplikacja zapisuje wynik
    - Wtedy powstaje kopia automatyczna, a najstarsza ponad 10 jest usuwana (`CLAUDE.md`, zasada 3)
  - Scenariusz: Utrata telefonu
    - Zakładając, że użytkownik stracił telefon
    - Gdy instaluje aplikację na nowym
    - Wtedy może odtworzyć dane z kopii poza starym telefonem; sposób (kopia urządzenia, plik w iCloud Drive, ręczny eksport): [DO WYJAŚNIENIA] (OP-41)

### BR-DANE-003: Eksport i import danych do pliku
- Przepływ: PR-07, PR-16
- Dowód potrzeby: J-10; prośba o eksport i import (S-25, rec. 13533848767); brak kopii jako przyczyna utraty receptur (S-17, rec. 9688552962); DEC-01 d (eksport zawsze bez opłaty)
- Kryteria akceptacji:
  - Scenariusz: Pełny eksport
    - Zakładając, że użytkownik ma receptury, zakwasy, historię i ustawienia
    - Gdy eksportuje dane
    - Wtedy dostaje jeden plik ze wszystkimi tymi danymi i numerem wersji formatu
  - Scenariusz: Import starszego pliku
    - Zakładając, że plik wyeksportowała starsza wersja aplikacji
    - Gdy użytkownik go importuje
    - Wtedy wszystkie dane z pliku są w aplikacji
  - Scenariusz: Kopia przed importem
    - Zakładając, że użytkownik ma dane w aplikacji
    - Gdy importuje plik
    - Wtedy przed importem powstaje kopia bezpieczeństwa (`CLAUDE.md`, zasada 3)
  - Scenariusz: Plik uszkodzony
    - Zakładając, że plik nie jest eksportem Piekarza
    - Gdy użytkownik go importuje
    - Wtedy widzi komunikat o błędzie, a dane w aplikacji się nie zmieniają
  - Scenariusz: Eksport bez zakupu
    - Zakładając, że próba się skończyła bez zakupu
    - Gdy użytkownik eksportuje dane
    - Wtedy eksport działa bez oferty zakupu (DEC-01 d)
  - Scenariusz: Import bez zakupu
    - Zakładając, że próba się skończyła bez zakupu
    - Gdy użytkownik importuje plik z własnymi danymi
    - Wtedy import działa bez oferty zakupu (D-039)

### BR-DANE-004: Usunięcie wszystkich danych
- Przepływ: PR-07, PR-16
- Dowód potrzeby: DEC-01 d (usunięcie własnych danych zawsze bez opłaty); audyt M1 01-odkrywanie-006 (zablokowane usuwanie po próbie)
- Kryteria akceptacji:
  - Scenariusz: Usunięcie z potwierdzeniem
    - Zakładając, że użytkownik wybiera usunięcie wszystkich danych
    - Gdy potwierdza
    - Wtedy przed usunięciem powstaje kopia bezpieczeństwa, a potem receptury, zakwasy, historia i powiadomienia znikają
  - Scenariusz: Usunięcie bez zakupu
    - Zakładając, że próba się skończyła bez zakupu
    - Gdy użytkownik usuwa recepturę albo zakwas
    - Wtedy usunięcie działa bez oferty zakupu

### BR-ZAK-001: Zakup i przywrócenie przez App Store
- Przepływ: PR-09 · Ograniczenie: OG-01, OG-02 (subskrypcja dostępna na wszystkich urządzeniach użytkownika), OG-03
- Dowód potrzeby: D-033; audyt M1 01-odkrywanie-001 (zakup odblokowywał funkcje bez płatności); zakup bez odblokowania u konkurencji (S-21, rec. 14046463760)
- Kryteria akceptacji:
  - Scenariusz: Udany zakup
    - Zakładając, że użytkownik wybiera plan roczny
    - Gdy App Store potwierdza transakcję
    - Wtedy wszystkie funkcje działają
  - Scenariusz: Przerwany zakup
    - Zakładając, że użytkownik przerywa zakup
    - Gdy wraca do aplikacji
    - Wtedy dostęp się nie zmienia
  - Scenariusz: Przywrócenie na nowym telefonie
    - Zakładając, że użytkownik kupił dostęp dożywotni na starym telefonie
    - Gdy wybiera „przywróć zakupy” na nowym
    - Wtedy wszystkie funkcje działają
  - Scenariusz: Ceny ze sklepu
    - Zakładając, że ceny ustawiono w App Store Connect (D-033)
    - Gdy użytkownik otwiera ofertę
    - Wtedy widzi ceny w walucie swojego sklepu podane przez App Store

### BR-ZAK-003: Oferta bez ukrytych warunków
- Przepływ: PR-09 · zależy od: ZAL-042
- Dowód potrzeby: 28 z 338 recenzji o płatności, 23 z nich ≤ 3★ (S-27): ukryta subskrypcja, paywall z odliczaniem, kłopot z anulowaniem próby (S-16, rec. 13931423989, 13775409265); H-03
- Kryteria akceptacji:
  - Scenariusz: Przed startem próby
    - Zakładając, że użytkownik widzi ofertę 14 dni próby
    - Gdy czyta ofertę
    - Wtedy widzi długość próby, cenę po próbie, okres odnowienia i jak anulować w ustawieniach App Store
  - Scenariusz: Zamknięcie oferty
    - Zakładając, że użytkownik zamyka ofertę bez wyboru
    - Gdy wraca do aplikacji
    - Wtedy oferta nie pojawia się sama ponownie w tej samej czynności i nie ma licznika czasu

### BR-ZAK-004: Stan po końcu Pro
- Przepływ: PR-16 · zależy od: ZAL-043
- Dowód potrzeby: model D-112, D-113 (Basic darmowy na zawsze, Pro bez próby; kontrakt `docs/monetyzacja.md` „Reguły dostępu”, wdrożenie D-116; poprzednio DEC-01 d i D-038/D-039 — próba); H-04 (zamknięte przez D-113); RYZ-17; ER-74
- Kryteria akceptacji:
  - Scenariusz: Uprzedzenie przed końcem Pro
    - Zakładając, że subskrypcja Pro bez odnowienia kończy się za 3 dni (sklep podaje koniec)
    - Gdy użytkownik otwiera aplikację
    - Wtedy widzi raz jasne zdanie, że przypomnienia o dokarmianiu wyłączą się, a dane i Basic zostają, bez odliczania i „ostatniej szansy” (D-113)
  - Scenariusz: Po końcu Pro
    - Zakładając, że Pro wygasło (zwrot, anulowanie, odebranie z Family Sharing)
    - Gdy użytkownik liczy recepturę albo przegląda historię
    - Wtedy funkcje Basic działają, dane zostają, a funkcja Pro jest widoczna z oznaczeniem „Pro” i otwiera ekran Pro dopiero po stuknięciu
  - Scenariusz: Trwający wypiek w chwili końca Pro
    - Zakładając, że wypiek zaczęto z planem Pro, a Pro kończy się w trakcie
    - Gdy mija koniec Pro
    - Wtedy bieżący wypiek prowadzi się do końca ze wszystkimi krokami i powiadomieniami (D-039 pkt 3 zostaje), a nowy wypiek „teraz” da się zacząć w Basic

### BR-ZAK-005: Ekran Pro tylko przy funkcji Pro
- Przepływ: PR-09, PR-12
- Dowód potrzeby: D-112 (bez próby i bez oferty wprowadzającej; poprzednio DEC-01 d: oferta „Wypróbuj 14 dni” przy pierwszym użyciu), kontrakt „Reguły dostępu” (ekran Pro tylko przy stuknięciu funkcji Pro i w Ustawieniach); OG-01; ER-74
- Kryteria akceptacji:
  - Scenariusz: Pierwsze użycie kalkulatora
    - Zakładając, że użytkownik nie ma Pro
    - Gdy pierwszy raz używa kalkulatora
    - Wtedy kalkulator działa w Basic bez ekranu Pro i bez oferty próby
  - Scenariusz: Funkcja Pro
    - Zakładając, że użytkownik nie ma Pro
    - Gdy stuka funkcję oznaczoną „Pro” (np. plan wstecz „gotowe o…”)
    - Wtedy otwiera się ekran Pro z ceną ze sklepu, bez próby; ekran Pro nie pojawia się przy starcie, po pierwszym użyciu ani w trakcie kroku wypieku
  - Scenariusz: Historia i eksport
    - Zakładając, że użytkownik nie ma Pro
    - Gdy otwiera historię albo eksport
    - Wtedy funkcje działają bez ekranu Pro

### BR-UST-003: Polityka prywatności w aplikacji
- Przepływ: PR-10 · Ograniczenie: OG-04
- Dowód potrzeby: OG-04; audyt M1 01-odkrywanie-002 (martwy link)
- Kryteria akceptacji:
  - Scenariusz: Otwarcie polityki
    - Zakładając, że użytkownik jest w ustawieniach
    - Gdy wybiera politykę prywatności
    - Wtedy otwiera się strona pod adresem z App Store Connect, która zwraca treść polityki
  - Scenariusz: Brak sieci
    - Zakładając, że telefon nie ma sieci
    - Gdy użytkownik wybiera politykę prywatności
    - Wtedy widzi krótkie streszczenie w aplikacji i adres strony

### BR-PRYW-001: Bez konta, bez sieci, bez śledzenia
- Przepływ: PR-01, PR-04, PR-07
- Dowód potrzeby: cel właściciela ZP-17; skargi na reklamy i śledzenie (13 z 16 recenzji ≤ 3★, S-27) i na aplikacje, które bez sieci nie działają (S-23, rec. 10637740561)
- Kryteria akceptacji:
  - Scenariusz: Tryb samolotowy
    - Zakładając, że telefon jest w trybie samolotowym
    - Gdy użytkownik przechodzi PR-01, PR-04 i PR-05
    - Wtedy każda czynność działa, a żadna nie prosi o konto ani o połączenie (NFR-OFF-001)
  - Scenariusz: Zakup bez sieci
    - Zakładając, że telefon nie ma sieci
    - Gdy użytkownik otwiera ofertę zakupu
    - Wtedy widzi, że zakup wymaga połączenia z App Store, a pozostałe funkcje zgodne z jego dostępem działają

### BR-START-001: Start od tego, co dziś robię
- Przepływ: PR-12 · zależy od: ZAL-046
- Dowód potrzeby: ZP-22, ZP-23; soczewka początkującego (od czego zacząć przy kilku wejściach); M1-audytor-generalny-057 (kilkanaście akcji na pierwszym ekranie), M1-audytor-generalny-087 (pierwsze uruchomienie pokazuje przykładowe dane jako dane użytkownika); BR-ZAK-005 (pierwsza oferta przy pierwszym użyciu funkcji). Kształt ekranu: H-08, rola 04.
- Kryteria akceptacji:
  - Scenariusz: Pierwsze uruchomienie
    - Zakładając, że użytkownik uruchamia aplikację pierwszy raz
    - Gdy aplikacja się otwiera
    - Wtedy użytkownik wybiera jedną z trzech czynności: zakładam zakwas, piekę na zakwasie, piekę na drożdżach albo pizzę
  - Scenariusz: Wybór prowadzi do przepływu
    - Zakładając, że użytkownik wybrał „zakładam zakwas”
    - Gdy zatwierdza wybór
    - Wtedy trafia do PR-11, a oferta próby pojawia się dopiero przy pierwszym użyciu funkcji (BR-ZAK-005)
  - Scenariusz: Bez udawanych danych
    - Zakładając, że użytkownik nie ma jeszcze danych
    - Gdy aplikacja pokazuje receptury, zakwas albo historię
    - Wtedy żaden przykład nie wygląda jak dane użytkownika: przykłady są oznaczone jako przykład (M1-audytor-generalny-087)
  - Scenariusz: Powrót z trwającym wypiekiem
    - Zakładając, że użytkownik ma trwający wypiek
    - Gdy otwiera aplikację
    - Wtedy widzi u góry pas „Co dziś robisz?” z paskiem tygodnia i linią „Następne”, pod nim trzy ścieżki, a pod nimi trwający wypiek jako spiralę z bieżącym krokiem i powrotem do niego jednym dotknięciem („Wróć do: {receptura}”); przy dwóch trwających jedna spirala z dwoma torami i legendą (BR-ETAP-005; układ D-105 zastępuje stan `trwa-wypiek` z ER-53 i D-066 6a; ER-72)

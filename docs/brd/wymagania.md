# BRD Piekarz — przepływy (PR) i wymagania niefunkcjonalne (NFR)

Stan: E3 · Aktualizacja: 2026-10-19. Przepływy opisują kto, cel, kroki, częstotliwość i kontekst; ekrany i przyciski projektuje rola 04. Wymagania BR są w plikach `wymagania-<moduł>.md`; każde wskazuje przepływ, a przepływ pracę J (`odkrywanie.md`). ID przepływów PR-01…PR-10 zachowują znaczenie ze starego BRD; nowe od PR-11.

## Przepływy (PR)

### PR-01: Ułożyć recepturę i policzyć ilości
- Kto: P-7, P-6, P-8 · Praca: J-01, J-03, J-11 · Częstotliwość: przy każdym wypieku · Kontekst: blat i waga, minuty, bez sieci.
- Kroki: wybiera recepturę bazową albo własną → podaje masę ciasta, liczbę sztuk albo ilość mąki → podaje zakwas lub zaczyn i jego hydratację → widzi wagi wszystkich składników, hydratację całkowitą i procenty → opcjonalnie temperaturę wody (i lód) → zapisuje recepturę.

### PR-02: Zaplanować wypiek wstecz od godziny „gotowe”
- Kto: P-7, P-6 · Praca: J-02, J-03 · Częstotliwość: przy każdym wypieku · Kontekst: dzień przed wypiekiem, kilka minut.
- Kroki: wybiera recepturę i godzinę „chleb gotowy” → podaje temperaturę w kuchni → widzi plan etapów z godzinami → plan omija godziny snu albo proponuje chłodnię → zatwierdza plan i zaczyna wypiek.

### PR-03: Dopasować wodę i czas do temperatury
- Kto: P-7, P-8 · Praca: J-03 · Częstotliwość: przy zmiennej temperaturze · Kontekst: blat, termometr.
- Kroki: podaje temperaturę mąki, kuchni (i zaczynu) oraz docelową temperaturę ciasta → dostaje temperaturę wody albo masę lodu → podaje temperaturę fermentacji → dostaje czas skorygowany albo komunikat, że jest poza zakresem modelu.

### PR-04: Przeprowadzić wypiek krok po kroku, także gdy telefon śpi
- Kto: P-6, P-7, P-8 · Praca: J-02 · Częstotliwość: przy każdym wypieku, wiele kroków w ciągu doby · Kontekst: telefon odłożony i zablokowany, noc, ręce w cieście w krokach czynnych.
- Kroki: zaczyna wypiek z planu → aplikacja prosi o zgodę na powiadomienia i wyjaśnia, po co → dla każdego kroku widzi, co zrobić, i dostaje sygnał o jego czasie przy zablokowanym ekranie → w krokach z gorącym naczyniem i surowym ciastem widzi ostrzeżenie → potwierdza wykonanie albo przesuwa krok → kończy wypiek i przechodzi do oceny (PR-06).

### PR-05: Prowadzić i dokarmiać zakwas
- Kto: P-7, P-6 · Praca: J-04 · Częstotliwość: dwa razy dziennie na blacie albo raz w tygodniu w lodówce (RD-25) · Kontekst: słoik, krótka sesja.
- Kroki: wybiera zakwas → zapisuje dokarmienie (proporcja, mąka, miejsce) → widzi, kiedy zakwas powinien być gotowy i kiedy następne dokarmienie → dostaje przypomnienie → przy niepokojącym wyglądzie zaznacza objawy i dostaje decyzję według zasady ostrożności → przed wypiekiem budzi zakwas z lodówki.

### PR-06: Zapisać wynik i poprawić następny wypiek
- Kto: P-7, P-6 · Praca: J-05, J-09 · Częstotliwość: po każdym wypieku · Kontekst: przy bochenku, minuty.
- Kroki: ocenia bochenek i dopisuje notatkę → przy słabej ocenie dostaje propozycję Doktora Chleba, a po udanym wypieku system może pokazać prośbę o ocenę aplikacji (BR-OPIN-001) → przegląda historię i porównuje z wcześniejszym wypiekiem → zaczyna następny wypiek z poprzedniego zapisu.

### PR-07: Zachować dane i przenieść je na nowy telefon
- Kto: wszyscy · Praca: J-10 · Częstotliwość: ciągle (zapis), rzadko (przeniesienie) · Kontekst: aktualizacja aplikacji, nowy telefon, koniec subskrypcji.
- Kroki: każdy zapis trafia trwale do bazy → aplikacja robi kopie automatyczne → użytkownik eksportuje dane do pliku → na nowym telefonie importuje plik albo odtwarza kopię → przywraca zakup → może usunąć wszystkie swoje dane.

### PR-08: Przekazać recepturę innemu piekarzowi
- Kto: P-7 · Praca: J-06 · Częstotliwość: rzadko · Kontekst: spotkanie, bez sieci.
- Kroki: otwiera recepturę → pokazuje kod QR albo udostępnia tekst → odbiorca skanuje kod i dostaje recepturę do zapisania.

### PR-09: Wypróbować, kupić albo przywrócić pełną wersję
- Kto: wszyscy · Praca: J-01…J-11 (dostęp do funkcji) · Częstotliwość: raz, potem przy odnowieniach · Kontekst: pierwsze użycie funkcji.
- Kroki: przy pierwszym użyciu dowolnej funkcji widzi ofertę 14 dni próby z ceną po próbie i sposobem anulowania → wybiera plan albo zakup dożywotni → po zakupie funkcje działają → na nowym telefonie przywraca zakup → po końcu próby bez zakupu widzi, co zostaje (historia, eksport, usunięcie).

### PR-10: Dostosować aplikację do siebie
- Kto: wszyscy · Praca: J-01 · Częstotliwość: rzadko · Kontekst: dowolny.
- Kroki: wybiera jednostki (gramy albo uncje, °C albo °F) → język wynika z ustawień telefonu → otwiera politykę prywatności.

### PR-11: Założyć zakwas od zera
- Kto: P-6 · Praca: J-07 · Częstotliwość: raz albo kilka razy, kilka do kilkunastu dni · Kontekst: kuchnia, krótka sesja codziennie.
- Kroki: wybiera „zakładam zakwas” → widzi dzień po dniu, co zrobić, i ile to zwykle trwa (RD-24) → zapisuje dokarmienie i obserwację (podwojenie, bąbelki, zapach) → przy pleśni dostaje decyzję według RD-21 → gdy zakwas jest gotowy, przechodzi do pierwszego wypieku (PR-02) → gdy się nie udaje, dostaje możliwe przyczyny (PR-14) albo zaczyna od nowa.

### PR-12: Zacząć od tego, co dziś robię
- Kto: P-6, P-7, P-8 · Praca: J-07, J-01, J-11 · Częstotliwość: pierwsze uruchomienie i każdy powrót · Kontekst: dowolny.
- Kroki: przy pierwszym uruchomieniu wybiera, co robi: zakłada zakwas, piecze na zakwasie albo piecze na drożdżach lub pizzę → trafia do odpowiedniego przepływu (PR-11, PR-01, PR-17). Kształt ekranu: hipoteza H-08 dla ról 03 i 04; wymaganie BR-START-001.

### PR-13: Nauczyć się przy kroku i w Akademii
- Kto: P-6 · Praca: J-08 · Częstotliwość: na początku często · Kontekst: dowolny, czytanie.
- Kroki: przy kroku otwiera krótkie wyjaśnienie „po co ten krok” → z Akademii wybiera lekcję → wraca do kroku.

### PR-14: Ustalić, co poszło nie tak
- Kto: P-6, P-7 · Praca: J-09 · Częstotliwość: po nieudanym wypieku albo przy zakwasie, który nie rośnie · Kontekst: przy bochenku albo słoiku.
- Kroki: wybiera objaw bochenka albo zakwasu → odpowiada na pytania → dostaje możliwe przyczyny i jedną zmianę na następny raz → przy objawach pleśni zawsze reguła RD-21.

### PR-15: Wrócić do trwającego wypieku po przerwie
- Kto: P-6, P-7 · Praca: J-02 · Częstotliwość: przy zamknięciu aplikacji, rozładowanym telefonie, spóźnieniu · Kontekst: powrót po godzinach.
- Kroki: otwiera aplikację → widzi trwający wypiek na bieżącym kroku i czas pozostały liczony od zapisanego terminu → jeśli termin minął, widzi, o ile, i może przesunąć dalsze kroki.

### PR-16: Zakończyć okres próbny bez zakupu
- Kto: wszyscy · Praca: J-10, J-04 · Częstotliwość: raz · Kontekst: koniec 14 dni.
- Kroki: przed końcem próby widzi, co zostanie bez zakupu → po końcu przegląda historię, eksportuje i usuwa dane bez opłaty → próba odblokowania innej funkcji pokazuje ofertę zakupu.

### PR-17: Przygotować ciasto na pizzę albo pieczywo drożdżowe na godzinę
- Kto: P-8 · Praca: J-11 · Częstotliwość: około raz w tygodniu · Kontekst: blat, plan na wieczór albo na kolejny dzień.
- Kroki: wybiera rodzaj (pizza, pieczywo drożdżowe), liczbę i masę sztuk → wybiera rodzaj drożdży i zaczyn (poolish, biga) → podaje godzinę i temperaturę → dostaje ilości i plan z chłodnią → prowadzi kroki jak w PR-04.

### PR-18: Zgłosić problem albo ocenić aplikację
- Kto: wszyscy · Praca: J-12 · Częstotliwość: rzadko · Kontekst: dowolny.
- Kroki: w ustawieniach wybiera „napisz do nas” albo „oceń w App Store” → przy kontakcie widzi treść wiadomości (w tym wersję aplikacji) przed wysłaniem i wysyła ją własną aplikacją poczty → przy ocenie przechodzi do strony aplikacji w App Store.

### PR-24: Uratować ciasto w trakcie fermentacji
- Kto: P-6, P-7, P-8 · Praca: J-15, J-02, J-09 · Częstotliwość: przy problemie w trakcie wypieku [OCENA] · Kontekst: w trakcie wypieku, ciasto w misce albo w koszyku, ręce w cieście lub mące, minuty na decyzję.
- Kroki: na prowadzeniu wypieku dotyka „Doktor” → w sekcji ratunku ciasta wybiera objaw: przerośnięte, zbyt luźne, ospała fermentacja w zimnej kuchni, zapomniana sól → widzi, co zrobić teraz, kroki i krótkie „dlaczego”, każde zdanie z atrybucją źródła → wykonuje kroki i wraca do prowadzenia na tym samym kroku z tym samym zegarem (F-71, D-095).

## Wymagania niefunkcjonalne (NFR)
### NFR-OFF-001: Działa w pełni offline
- Miara: liczba wywołań sieciowych (`fetch`, `axios`, `WebSocket`, `XMLHttpRequest`) w kodzie produkcyjnym. Próg: 0 (ZP-17; `CLAUDE.md`, zasada 1). Metoda: `tests/public-repo.test.ts` (`npm test`).

### NFR-PRYW-001: Bez zbierania danych
- Miara: deklaracja prywatności w App Store i SDK analityczne w zależnościach. Próg: „Data Not Collected”, 0 SDK śledzących (ZP-17). Metoda: przegląd `package.json` i manifestu prywatności przed wydaniem (rola 10).

### NFR-DANE-003: Migracje testowane na kopii bazy poprzedniej wersji
- Miara: odsetek zmian schematu z migracją w transakcji i testem na kopii bazy poprzedniej wersji. Próg: 100% (zasada wspólna 10). Metoda: test migracji w `npm test` (rola 07).

### NFR-DANE-004: Kopia zapasowa kompletna
- Miara: zawartość kopii przy trybie WAL. Próg: kopia przez `VACUUM INTO` albo po checkpoincie razem z plikami `-wal` i `-shm`; nigdy sam plik `.db` (zasada wspólna 10). Metoda: test odtworzenia kopii (`src/lib/__tests__/backup.test.ts`, rola 07).

### NFR-INT-001: Pole dotyku
- Miara: wymiar pola dotyku elementów klikalnych. Próg: ≥ 48 pt w prowadzeniu wypieku i akcjach głównego przepływu, ≥ 44 pt w pozostałych (DEC-15 planu napraw M1, 2026-10-19). Metoda: pomiar na zrzutach roli 04; dziś test sprawdza tylko styl `minHeight` (`tests/matrix-a11y.test.tsx`).

### NFR-DOST-001: Czytnik ekranu
- Miara: elementy klikalne głównego przepływu (PR-01, PR-04, PR-05) z etykietą dostępności. Próg: 100% (`CLAUDE.md`, zasada 4). Metoda: test etykiet i przejście VoiceOver na urządzeniu (krok właściciela).

### NFR-DOST-002: Duży tekst i wąski ekran
- Miara: obcięcie albo nakładanie się tekstu i przycisków. Próg: brak przy szerokości 320 pt i Dynamic Type AX5 (`CLAUDE.md`, NFR-A11Y-004). Metoda: zrzuty roli 04.

### NFR-DOST-003: Kontrast
- Miara: współczynnik kontrastu tekstu i tła. Próg: WCAG 2.1 AA (`CLAUDE.md`, zasada 4). Metoda: `src/ui/__tests__/theme-contrast.test.ts`.

### NFR-DOST-005: Stan ostrzeżenia nie tylko kolorem
- Miara: stany ostrzeżeń i bezpieczeństwa (RD-21…RD-23, RD-27) rozróżnialne bez koloru. Próg: każdy stan ma tekst albo ikonę (dowód: S-24, rec. 5681544617). Metoda: przegląd zrzutów w skali szarości (rola 04).

### NFR-INT-003: Sygnał kroku nie tylko dźwiękiem
- Miara: kanały sygnału kroku. Próg: powiadomienie z tekstem kroku i haptyka obok dźwięku (DEC-02). Metoda: test planowania powiadomień i próba na urządzeniu (krok właściciela).

### NFR-CZAS-001: Punktualność sygnału przy zablokowanym ekranie
- Miara: różnica między terminem kroku a pojawieniem się powiadomienia na zablokowanym telefonie. Próg: [DO WYJAŚNIENIA] (OP-42). Metoda: test na urządzeniu, ekran zablokowany 30 min (krok właściciela, TestFlight).

### NFR-JEZ-001: Języki
- Miara: odsetek kluczy interfejsu i treści przetłumaczonych w każdym języku. Próg: 100% w 35 językach (DEC-06 planu napraw M1 z rozszerzeniem właściciela). Metoda: `npm run check:i18n` i przegląd przekładu (rola 09).

### NFR-WYD-001: Wydajność
- Miara: czas startu i reakcji kalkulatora na urządzeniu. Próg: [DO WYJAŚNIENIA] (OP-43). Metoda: pomiar roli 05 na najstarszym wspieranym iPhonie.

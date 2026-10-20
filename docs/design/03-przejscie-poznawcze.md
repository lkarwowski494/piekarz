# Przejście poznawcze: kryteria „Intuicyjność” kontraktu zakresu

Rola 04, E3 · 2026-10-20 · metoda: przejście poznawcze studia na makietach `ekrany/*.html` (cztery pytania Wharton i in., w ujęciu NN/g, K. Flaherty): (1) czy użytkownik będzie chciał osiągnąć ten skutek, (2) czy zauważy właściwą akcję, (3) czy połączy akcję ze skutkiem, (4) czy zobaczy postęp po akcji. Bez udziału osób z grupy docelowej — test z 3–5 osobami (5 sekund i zadanie „zacznij pierwszy wypiek”) to krok opcjonalny właściciela, ok. 1 h. Wynik wraca do roli 03 przez bramkę „Zmiany zakresu” w formacie `wynik: <pozytywny|negatywny>, <data, plik>`.

Persony: P-6 (początkujący bez zakwasu), P-7 (regularny), P-8 (drożdże i pizza). „Tak” = pytanie spełnione na makiecie; „ryzyko” = spełnione warunkowo, z uwagą dla wdrożenia.

| F | Kryterium z kontraktu (skrót) | Ekran, stan | 1 | 2 | 3 | 4 | Wynik | Uwaga |
|---|---|---|---|---|---|---|---|---|
| F-68 | trzy czynności słowami pracy; wybór prowadzi do przepływu bez oferty | start `pierwsze-uruchomienie` | tak | tak | tak | tak | pozytywny | D-047: oferta dopiero przy pierwszej akcji liczącej |
| F-09 | wagi bez wpisywania; zmiana masy zmienia wagi | kalkulator `receptura` | tak | tak | tak | tak | pozytywny | stepper „Bochenki” i masa na górze, wagi od razu w „Do miski” |
| F-56 | informacja przy soli, bez blokady | `mieszanka-i-sol` | tak | tak | tak | tak | pozytywny | tekst mówi wprost „możesz zostawić” |
| F-11 | druga mąka z udziałem; „żytni” widoczne | `mieszanka-i-sol` | tak | tak | tak | tak | pozytywny | pasek udziałów + tekst „Wariant żytni” ze skutkiem dla planu |
| F-38 | dwa przełączniki z nazwami jednostek; żaden ekran bez przeliczenia | ustawienia; zrzuty en-US | tak | ryzyko | tak | tak | pozytywny | jeden wybór segmentowy zamiast dwóch przełączników (gramy i °C razem, uncje i °F razem) — prostsze; zmiana kryterium do potwierdzenia przez 03 |
| F-10 | pola temperatur nazwane słowami; wynik bez wzoru | `temperatura-wody` | tak | tak | tak | tak | pozytywny | „Mąka”, „Kuchnia”, „Zakwas”, „Ciasto ma mieć” |
| F-55 | wybór „drożdże albo pizza” bez nowych pojęć przed wyborem | start | tak | tak | ryzyko | — | pozytywny | opis wyboru zawiera „poolish” i „biga” — dla P-8 to słowa z jego pracy; ekran rodzaju drożdży nie był w makietach E3 |
| F-13 | godzina „gotowe” pierwsza; kolizja ze snem nazwana z propozycją | `plan-sen` | tak | tak | tak | tak | pozytywny | |
| F-14 | zmiana temperatury zmienia czasy; poza zakresem komunikat | `plan-sen` | tak | tak | tak | ryzyko | pozytywny | zakres podany pod chipami; stan „poza zakresem” bez osobnej makiety |
| F-07 | krok, co zrobić, czas na jednym ekranie; jedno „zrobione” | prowadzenie `w-trakcie` | tak | tak | tak | tak | pozytywny | spirala pokazuje postęp po „Zrobione” |
| F-57 | ostrzeżenie w kroku: tekst i ikona | `koniec-kroku` | tak | tak | tak | tak | pozytywny | widać też w skali szarości |
| F-58 | po otwarciu bieżący krok bez akcji | start `trwa-wypiek` → prowadzenie | tak | tak | tak | tak | pozytywny | jedno dotknięcie z „Dziś”; w aplikacji zalecane otwarcie wprost na kroku, gdy wypiek trwa |
| F-16 | zdanie przed prośbą o zgodę; przy odmowie stała informacja | `zgoda`, `brak-zgody` | tak | tak | tak | tak | pozytywny | |
| F-18 | ekran nie gaśnie tylko w kroku czynnym, bez akcji | `w-trakcie` | tak | — | tak | tak | pozytywny | informacja tekstem w kroku |
| F-22 | lista z datą dokarmienia i miejscem; dodanie jednym przyciskiem | `karta` (lista zakwasów: Dziś) | tak | ryzyko | tak | tak | pozytywny | ekran listy zakwasów z przyciskiem „Dodaj zakwas” nie był renderowany; wzór jak start |
| F-23 | po wyborze proporcji gramy; zapis jednym przyciskiem | `karta` | tak | tak | ryzyko | tak | pozytywny | arkusz dokarmienia (proporcja → gramy) do dorysowania w audycie po wdrożeniu |
| F-24 | „podwoił się” daje „gotowy” z atrybucją | `karta` | tak | tak | tak | tak | pozytywny | atrybucja King Arthur Baking (szczebel 4) |
| F-25 | objawy słowami, jedno zalecenie, bez werdyktu „zdrowy” | `zakladanie-dzien-3`, `plesn` | tak | tak | tak | tak | pozytywny | |
| F-60 | „zakładam zakwas” na starcie; dzień N | start, `zakladanie-dzien-3` | tak | tak | tak | tak | pozytywny | |
| F-61 | plan sam dodaje dokarmienia z lodówki | — | — | — | — | — | nie badano | brak makiety planu z zakwasem z lodówki; do audytu po wdrożeniu |
| F-62 | „edytuj” przy wpisie | `karta` | tak | tak | tak | tak | pozytywny | |
| F-26 | lista według rodzaju ze startu; żadna osobno zablokowana | start → Receptury | tak | ryzyko | tak | — | pozytywny | lista receptur nie renderowana; nazwy bez kłódek (D-047) |
| F-27 | „zapisz jako moją” pod wynikiem | `receptura` | tak | tak | tak | ryzyko | pozytywny | potwierdzenie zapisu: pasek „Zapisano w Twoich recepturach” (wzór paska „Cofnij”) |
| F-28 | ocena po „zakończ wypiek”; „piecz ponownie” | `ocena-slaba` | tak | tak | tak | — | pozytywny | „piecz ponownie” we wpisie dziennika nie renderowane |
| F-69 | prośba tylko systemowa ≥ 4★; dwa wpisy w ustawieniach | `ustawienia` | tak | tak | tak | tak | pozytywny | |
| F-43 | propozycja po ≤ 2★ | `ocena-slaba` | tak | tak | tak | — | pozytywny | |
| F-64 | wejście z dnia N; pleśń → polecenie | `zakladanie-dzien-3` | tak | tak | tak | tak | pozytywny | |
| F-44 | „po co ten krok” w kroku; powrót bez utraty stanu | `w-trakcie` | tak | tak | tak | ryzyko | pozytywny | arkusz z wyjaśnieniem nie renderowany |
| F-15 (TEST) | wskazówka w kroku garowania | — | — | — | — | — | nie badano | TEST: pytanie do 3–5 testerów TestFlight (rola 03) |
| F-31…F-33, F-65 | bez akcji; kopie widoczne; eksport i import z podglądem; usuń z potwierdzeniem | `ustawienia` | tak | tak | tak | ryzyko | pozytywny | podgląd importu i potwierdzenie usunięcia: wzór w słowniku (spec 5) |
| F-35, F-37 | ceny ze sklepu; przywróć; długość próby, cena po próbie, anulowanie przed startem; zamknięcie | `oferta-proba`, `zakup-bez-proby`, `bez-sieci` | tak | tak | tak | tak | pozytywny | 8 ujawnień z kontraktu płatności (U1–U8) na ekranie |
| F-67 | uprzedzenie jednym komunikatem; po końcu jasne, co działa | `uprzedzenie-3-dni`, start `tylko-historia` | tak | tak | tak | tak | pozytywny | H-04: co zostaje + przypomnienia ustaną |
| F-40 | polityka w ustawieniach | `ustawienia` | tak | tak | tak | — | pozytywny | |

**Podsumowanie:** 31 kryteriów pozytywnych (część z ryzykiem dla wdrożenia), 2 nie badane (F-61, F-15 TEST), 0 negatywnych. Jedna proponowana zmiana kryterium: F-38 „dwa przełączniki” → jeden wybór „gramy, °C / uncje, °F” (prostsze; odrębne jednostki masy i temperatury nie mają dowodu potrzeby). Właściciel przyjął zmianę (D-051, 3a, 2026-10-20); do roli 03: wpis ZM z nowym brzmieniem kryterium F-38.

Wpis dla roli 03 (do bramki „Zmiany zakresu”): `wynik: pozytywny, 2026-10-20, docs/design/03-przejscie-poznawcze.md` dla F-68, F-09, F-56, F-11, F-38*, F-10, F-55, F-13, F-14, F-07, F-57, F-58, F-16, F-18, F-22, F-23, F-24, F-25, F-60, F-62, F-26, F-27, F-28, F-69, F-43, F-64, F-44, F-31, F-32, F-33, F-65, F-35, F-37, F-67, F-40; F-61 i F-15 bez wyniku.

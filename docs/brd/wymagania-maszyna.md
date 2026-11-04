# BRD Piekarz — wymagania: tryb maszyny do chleba (MASZ, F-72)

Stan: E3 + ER-77 · Aktualizacja: 2026-11-03. Tryb uniwersalny, bez profili konkretnych maszyn (D-153); Tefal PAIN PLAISIR PF220838 to maszyna testowa właściciela i przykład w źródłach (szczebel 1 tylko dla tego modelu). Przepływ PR-25, praca J-16, reguły RD-37…RD-39 (`reguly.md`). Podział Basic/Pro: ilości, kolejność i program w Basic, godzina gotowości w Pro (D-152). Teksty: rola 06 (`docs/tresci/pl/maszyna.md`, zdania bezpieczeństwa czekają na przegląd właściciela). Kod i testy z ID: rola 08 i 07 (do tego czasu wyjątki w `scripts/br-wyjatki.json`, D-187).

### BR-MASZ-001: Wybór „piekarnik / maszyna” przy recepturze
- Przepływ: PR-25 · Funkcja: F-72 (ZM-26)
- Dowód potrzeby: J-16; D-138 („Tryb „maszyna”, 1.1+”), termin 1.0 (D-150), tryb uniwersalny (D-153), zakwas w maszynie tylko ze źródłem (D-156); źródła nie opisują chleba w maszynie na samym zakwasie (rejestr roli 06 MAS-ZAK-005), a programy „na zakwasie” w instrukcjach używają też drożdży piekarskich (MAS-ZAK-002, MAS-ZAK-003).
- Kryteria akceptacji:
  - Scenariusz: Receptura drożdżowa
    - Zakładając, że użytkownik otwiera recepturę drożdżową
    - Gdy wybiera „maszyna”
    - Wtedy widzi listę dla maszyny zamiast kroków pieczenia w piekarniku, a ilości receptury zostają te same do czasu wyboru wielkości bochenka (BR-MASZ-002)
  - Scenariusz: Receptura na zakwasie z wersją drożdżową
    - Zakładając, że użytkownik otwiera recepturę na zakwasie, która ma wersję drożdżową (BR-RECP-005)
    - Gdy wybiera „maszyna”
    - Wtedy lista dla maszyny używa wersji drożdżowej, a obok widzi zdanie, że programy na zakwasie w instrukcjach maszyn też używają drożdży piekarskich (D-156)
  - Scenariusz: Receptura na zakwasie bez wersji drożdżowej
    - Zakładając, że receptura na zakwasie nie ma wersji drożdżowej (D-173)
    - Gdy użytkownik ją otwiera
    - Wtedy nie widzi wyboru „maszyna” (D-156: tryb maszyny przy zakwasie tylko przez wersję drożdżową)
  - Scenariusz: Bez Pro
    - Zakładając, że użytkownik nie ma Pro
    - Gdy wybiera „maszyna”
    - Wtedy widzi ilości, kolejność i podpowiedź programu bez oferty zakupu (D-152)

### BR-MASZ-002: Ilości pod granice maszyny użytkownika i wielkość bochenka
- Przepływ: PR-25 · Reguła: RD-37 · Funkcja: F-72
- Dowód potrzeby: J-16; D-138 („ilości pod pojemność maszyny użytkownika”), D-153 („ilości pod wielkość bochenka”), D-175 z uzupełnieniem (granica masy ciasta i drożdży obok granicy mąki); nie używa się więcej mąki niż maksimum producenta (S-107).
- Kryteria akceptacji:
  - Scenariusz: Pierwsze użycie bez granicy mąki
    - Zakładając, że użytkownik nie wpisał jeszcze danych swojej maszyny
    - Gdy wybiera „maszyna”
    - Wtedy aplikacja prosi o największą ilość mąki z instrukcji maszyny, a masę ciasta i drożdży pokazuje jako pola nieobowiązkowe, i nie pokazuje ilości przed wpisaniem granicy mąki (RD-37-W6)
  - Scenariusz: Bochenek w granicy
    - Zakładając, że granica mąki wynosi 620 g
    - Gdy użytkownik wybiera bochenek z 500 g mąki
    - Wtedy lista ma 500 g mąki, a pozostałe składniki mają procenty receptury (RD-37-W1)
  - Scenariusz: Bochenek ponad granicę mąki
    - Zakładając, że granica mąki wynosi 620 g
    - Gdy użytkownik wybiera bochenek z 621 g mąki
    - Wtedy lista ma 620 g mąki i te same procenty, a obok widzi, że ilość ograniczyła granica maszyny (RD-37-W3)
  - Scenariusz: Granica ciasta silniejsza niż granica mąki
    - Zakładając, że granica mąki wynosi 620 g, granica ciasta 1000 g, a receptura ma 80% wody, 2% soli i 1,7% drożdży
    - Gdy użytkownik wybiera bochenek z 620 g mąki
    - Wtedy lista ma 544 g mąki, a ciasto nie przekracza 1000 g (RD-37-W5)
  - Scenariusz: Dane maszyny zapamiętane
    - Zakładając, że użytkownik wpisał dane maszyny przy jednej recepturze
    - Gdy wybiera „maszyna” przy innej recepturze
    - Wtedy aplikacja używa tych samych granic bez ponownego pytania i pozwala je zmienić

### BR-MASZ-003: Kolejność wkładania w jednym z dwóch układów
- Przepływ: PR-25 · Funkcja: F-72
- Dowód potrzeby: J-16; D-153 („kolejność wkładania w jednym z dwóch układów”); kolejność ustala instrukcja producenta (rejestr roli 06 MAS-060); układ „płyny najpierw, drożdże na wierzch” (MAS-005, MAS-020, MAS-040, MAS-050) i „drożdże najpierw, płyn na końcu” (MAS-031).
- Kryteria akceptacji:
  - Scenariusz: Układ „płyny najpierw”
    - Zakładając, że użytkownik wybrał w danych maszyny układ „płyny najpierw”
    - Gdy otwiera listę dla maszyny
    - Wtedy widzi kolejno płyny, potem mąkę i inne suche składniki, a drożdże na końcu, z dopiskiem, że drożdże nie mogą dotykać płynów (MAS-005)
  - Scenariusz: Układ „drożdże najpierw”
    - Zakładając, że użytkownik wybrał układ „drożdże najpierw”
    - Gdy otwiera listę dla maszyny
    - Wtedy widzi kolejno drożdże, potem mąkę i suche składniki, a płyn na końcu (MAS-031)
  - Scenariusz: Instrukcja maszyny ma pierwszeństwo
    - Zakładając, że użytkownik otwiera listę dla maszyny w dowolnym układzie
    - Gdy czyta kolejność
    - Wtedy widzi zdanie, że kolejność wkładania podaje instrukcja jego maszyny (MAS-060)
  - Scenariusz: Bez wybranego układu
    - Zakładając, że użytkownik nie wybrał układu
    - Gdy otwiera listę dla maszyny
    - Wtedy aplikacja prosi o wybór układu przed pokazaniem kolejności

### BR-MASZ-004: Podpowiedź programu
- Przepływ: PR-25 · Reguła: RD-39 · Funkcja: F-72
- Dowód potrzeby: J-16; słowa właściciela „aplikacja sugeruje program czyli np chleb zwykły lub chleb pełnoziarnisty itd . Lub najbliższy temu ?” (D-152), podpowiedź jako reguła aplikacji (D-176), reguła pięciu rodzajów (D-179).
- Kryteria akceptacji:
  - Szablon scenariusza: Rodzaj programu
    - Zakładając, że receptura ma podane cechy
    - Gdy użytkownik otwiera listę dla maszyny
    - Wtedy widzi podpowiedź programu według RD-39
    - Przykłady: pizza kształtowana poza formą → „ciasto” (RD-39-W1); słodka w formie z 60% mąk pełnoziarnistych i żytnich → „słodki” (RD-39-W2); 49% mąk pełnoziarnistych i żytnich, bez cukru i tłuszczu → „francuski” (RD-39-W3); 50% → „pełnoziarnisty” (RD-39-W4); 2% cukru, bez mąk pełnoziarnistych → „podstawowy” (RD-39-W7)
  - Scenariusz: Dopisek przy każdej podpowiedzi
    - Zakładając, że aplikacja pokazuje podpowiedź programu
    - Gdy użytkownik ją czyta
    - Wtedy obok widzi, że to podpowiedź Piekarza, nie zalecenie producenta, i że program sprawdza w instrukcji swojej maszyny (D-179)
  - Scenariusz: Brak danych o mąkach
    - Zakładając, że receptura nie ma masy mąki
    - Gdy użytkownik otwiera listę dla maszyny
    - Wtedy nie widzi podpowiedzi programu, tylko prośbę o uzupełnienie receptury (RD-39-W8)

### BR-MASZ-005: Opóźniony start i godzina gotowości
- Przepływ: PR-25 · Reguła: RD-38 · Funkcja: F-72
- Dowód potrzeby: J-16; D-138 („prosty plan z godziną gotowości”), godzina gotowości w Pro (D-152), blokada z wyjaśnieniem (D-175 z uzupełnieniem), czas programu z instrukcji użytkownika (D-189; czasów programów nie ma w źródłach, rejestr roli 06 MAS-015).
- Kryteria akceptacji:
  - Scenariusz: Godzina gotowości bez psujących się składników
    - Zakładając, że użytkownik ma Pro, receptura ma mąkę, wodę, sól i drożdże, a program według instrukcji trwa 3 h 10 min
    - Gdy wybiera godzinę gotowości jutro o 7:00
    - Wtedy widzi, że program musi ruszyć jutro o 3:50, i czas od teraz do gotowości (RD-38-W1; sposób wpisania opóźnienia w maszynie: OP-65)
  - Scenariusz: Psujące się składniki
    - Zakładając, że receptura ma jajka
    - Gdy użytkownik otwiera listę dla maszyny
    - Wtedy nie widzi wyboru godziny gotowości, tylko zdanie, że opóźniony start jest wyłączony, bo receptura ma składniki, które łatwo się psują, i których (RD-38-W2)
  - Scenariusz: Mleko w proszku
    - Zakładając, że receptura ma mleko w proszku zamiast świeżego
    - Gdy użytkownik otwiera listę dla maszyny
    - Wtedy wybór godziny gotowości jest dostępny (RD-38-W4)
  - Scenariusz: Godzina gotowości za wcześnie
    - Zakładając, że program trwa 3 h 10 min
    - Gdy użytkownik wybiera godzinę gotowości za 2 h
    - Wtedy widzi, że program nie zdąży, i najwcześniejszą godzinę gotowości
  - Scenariusz: Bez Pro
    - Zakładając, że użytkownik nie ma Pro
    - Gdy otwiera listę dla maszyny
    - Wtedy ilości, kolejność i program działają, a wybór godziny gotowości pokazuje, że jest w Pro (D-152)

### BR-MASZ-006: Bezpieczeństwo przy maszynie
- Przepływ: PR-25 · Funkcja: F-72
- Dowód potrzeby: J-16; kontekst ⚠ oparzenie przy wyjmowaniu formy i mieszadła (`odkrywanie.md`, wiersz J-16); rękawice przy formie po programie (S-108); gorąca forma i pokrywa, mieszadło, para, dzieci (rejestr roli 06 MAS-010, MAS-045, MAS-011, MAS-014; teksty `machine.safety` czekają na przegląd zdań właściciela, D-177).
- Kryteria akceptacji:
  - Scenariusz: Ostrzeżenie po pieczeniu
    - Zakładając, że użytkownik ma listę dla maszyny
    - Gdy dochodzi do kroku wyjęcia chleba
    - Wtedy widzi ostrzeżenie: formę wyjmuje w rękawicach kuchennych, mieszadło wyjmuje po ostygnięciu chleba narzędziem z zestawu albo plastikową łopatką, a przy otwieraniu pokrywy może wydostać się gorąca para (machine.safety)
  - Scenariusz: Ostrzeżenie nie tylko kolorem
    - Zakładając, że ostrzeżenie jest widoczne
    - Gdy użytkownik korzysta z czytnika ekranu
    - Wtedy ostrzeżenie ma tekst i oznaczenie odczytywane przez czytnik, a nie tylko kolor (NFR-DOST-005)

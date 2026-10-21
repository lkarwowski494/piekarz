# BRD Piekarz — wymagania: liczenie (KALK, UST)

Stan: E3 · Aktualizacja: 2026-10-19. Liczby w kryteriach pochodzą z wektorów reguł (`reguly.md`) albo z decyzji. Zakres i kolejność rozstrzyga rola 03 (H-06).

### BR-KALK-001: Receptura w procentach piekarskich
- Przepływ: PR-01 · Reguła: RD-14, RD-15
- Dowód potrzeby: J-01; 22 z 338 recenzji o liczeniu (S-27); skarga na procenty niezgodne ze standardem (S-22, rec. 3506203564)
- Kryteria akceptacji:
  - Scenariusz: Procenty od całej mąki
    - Zakładając, że receptura ma 1000 g mąki, 700 g wody i 20 g soli
    - Gdy użytkownik otwiera recepturę
    - Wtedy widzi mąka 100%, woda 70%, sól 2% (RD-15-W1)
  - Scenariusz: Brak mąki
    - Zakładając, że w recepturze mąka całkowita wynosi 0 g
    - Gdy użytkownik zapisuje recepturę
    - Wtedy widzi komunikat o błędnych danych zamiast procentów (RD-14-W6)

### BR-KALK-002: Hydratacja całkowita z wodą i mąką z zakwasu i zaczynu
- Przepływ: PR-01 · Reguła: RD-14
- Dowód potrzeby: J-01; skarga, że kalkulator pomija mąkę i wodę z zakwasu (S-17, rec. 6280671939)
- Kryteria akceptacji:
  - Scenariusz: Zakwas o hydratacji 100%
    - Zakładając, że ciasto ma 900 g mąki i 630 g wody, a zakwas waży 200 g przy hydratacji 100%
    - Gdy aplikacja liczy hydratację
    - Wtedy pokazuje mąkę całkowitą 1000 g, wodę 730 g i hydratację 73% (RD-14-W1)
  - Scenariusz: Zakwas z samej mąki na granicy
    - Zakładając, że zakwas waży 100 g przy hydratacji 0%
    - Gdy ciasto ma 900 g mąki i 700 g wody
    - Wtedy aplikacja pokazuje hydratację 70% (RD-14-W3)
  - Scenariusz: Ujemna hydratacja zakwasu
    - Zakładając, że użytkownik wpisuje hydratację zakwasu −1%
    - Gdy zatwierdza pole
    - Wtedy pole przyjmuje najniższą wartość zakresu 20% (pole 20–200%), a wynik liczy się z 20%; wartość spoza pola nie trafia do wzoru, więc RD-14-W4 zostaje wektorem reguły (ER-58)

### BR-KALK-003: Skalowanie do masy ciasta albo liczby sztuk z dokładnością 1 g
- Przepływ: PR-01, PR-17 · Reguła: RD-15
- Dowód potrzeby: J-01, J-11; skalowanie na liczbę gości (S-19, rec. 12569511193); decyzja DEC-11 (a) planu napraw M1 (dokładność 1 g; sól i drożdże z 0,1 g, suma ±1 g: ER-51, D-066 3a)
- Kryteria akceptacji:
  - Scenariusz: Suma równa masie ciasta
    - Zakładając, że formuła ma mąkę 100%, wodę 70% i sól 2%
    - Gdy użytkownik ustawia masę ciasta 999 g
    - Wtedy widzi 581 g mąki, 407 g wody i 11,6 g soli oraz „Razem 999 g”, a suma pokazanych ilości (999,6 g) różni się od masy ciasta najwyżej o 1 g (RD-15-W3)
  - Scenariusz: Korekta zaokrągleń
    - Zakładając, że formuła ma mąkę 100%, wodę 70%, sól 2% i zakwas 20%
    - Gdy użytkownik ustawia masę ciasta 569 g
    - Wtedy widzi 296 g mąki, 208 g wody, 5,9 g soli i 59 g zakwasu, razem w wierszach 568,9 g (RD-15-W8)
  - Scenariusz: Masa zero
    - Zakładając, że formuła jest jak wyżej
    - Gdy użytkownik ustawia masę ciasta 0 g
    - Wtedy widzi komunikat o błędnych danych (RD-15-W5)

### BR-KALK-004: Temperatura wody dla docelowej temperatury ciasta
- Przepływ: PR-03 · Reguła: RD-16
- Dowód potrzeby: J-03; kalkulator temperatury ciasta używany i oceniany przez użytkowników Rise (S-14, rec. 9331408199)
- Kryteria akceptacji:
  - Scenariusz: Ciasto bez zaczynu
    - Zakładając, że docelowa temperatura ciasta to 25 °C, mąka ma 20 °C, kuchnia 22 °C, a przyrost od tarcia 10 °C
    - Gdy użytkownik liczy temperaturę wody
    - Wtedy widzi 23 °C (RD-16-W1)
  - Scenariusz: Ciasto z zaczynem
    - Zakładając, że dane są jak wyżej, a zaczyn ma 24 °C
    - Gdy użytkownik liczy temperaturę wody
    - Wtedy widzi 24 °C (RD-16-W2)
  - Scenariusz: Brak temperatury mąki
    - Zakładając, że pole temperatury mąki jest puste
    - Gdy użytkownik liczy temperaturę wody
    - Wtedy widzi prośbę o uzupełnienie pola zamiast wyniku (RD-16-W4)

### BR-KALK-005: Kilka mąk w recepturze
- Przepływ: PR-01 · Reguła: RD-14, RD-20
- Dowód potrzeby: J-01; prośba o wpis kilku mąk (S-21, rec. 13060223498: 50 g żytniej i 50 g orkiszowej); soczewka pasjonata (formuły z kilkoma mąkami)
- Kryteria akceptacji:
  - Scenariusz: Udział żyta wybiera wariant
    - Zakładając, że receptura ma 600 g mąki żytniej i 400 g pszennej
    - Gdy użytkownik zapisuje recepturę
    - Wtedy aplikacja pokazuje udział żyta 60% i oznacza recepturę jako wariant żytni (RD-20-W1)
  - Scenariusz: Granica 50%
    - Zakładając, że receptura ma 500 g mąki żytniej i 500 g pszennej
    - Gdy użytkownik zapisuje recepturę
    - Wtedy receptura zostaje w wariancie pszennym (RD-20-W2)

### BR-KALK-007: Przelicznik miar objętości na gramy
- Przepływ: PR-01
- Dowód potrzeby: J-01; 9 z 338 recenzji o jednostkach, w tym przepisy w szklankach (S-18, rec. 9892326511); decyzja D-034 (F-45 w MVP po BR)
- Kryteria akceptacji:
  - Scenariusz: Ostrzeżenie o dokładności
    - Zakładając, że użytkownik wpisuje mąkę w szklankach
    - Gdy aplikacja przelicza na gramy
    - Wtedy obok wyniku widzi ostrzeżenie, że miara objętości jest przybliżona, a masy w przeliczniku mają źródło w rejestrze roli 06 [DO USTALENIA] (OP-44)
  - Scenariusz: Składnik bez masy w rejestrze
    - Zakładając, że składnika nie ma w rejestrze mas
    - Gdy użytkownik wybiera przeliczenie
    - Wtedy widzi, że przeliczenie dla tego składnika jest niedostępne

### BR-KALK-008: Masa lodu do schłodzenia wody
- Przepływ: PR-03 · Reguła: RD-18
- Dowód potrzeby: J-03; temperatura wody wyższa od potrzebnej w upał (RD-16); [OCENA] potrzeba słabsza niż RD-16, bez recenzji
- Kryteria akceptacji:
  - Scenariusz: Woda z kranu za ciepła
    - Zakładając, że receptura ma 700 g wody, woda z kranu ma 20 °C, a potrzebna 10 °C
    - Gdy aplikacja liczy lód
    - Wtedy pokazuje około 70 g lodu w ramach 700 g wody (RD-18-W1)
  - Scenariusz: Woda z kranu wystarczy
    - Zakładając, że potrzebna temperatura jest równa temperaturze wody z kranu
    - Gdy aplikacja liczy lód
    - Wtedy pokazuje, że lód nie jest potrzebny (RD-18-W2)
  - Scenariusz: Temperatura poniżej zera
    - Zakładając, że potrzebna temperatura wody wychodzi −1 °C
    - Gdy aplikacja liczy lód
    - Wtedy widzi komunikat o błędnych danych (RD-18-W6)

### BR-KALK-009: Rodzaj drożdży
- Przepływ: PR-17, PR-01 · Reguła: RD-19
- Dowód potrzeby: J-11; prośby o świeże i suche drożdże w kalkulatorze pizzy (S-19, rec. 7107716082, 4003385446)
- Kryteria akceptacji:
  - Scenariusz: Świeże na suche
    - Zakładając, że receptura ma 10 g drożdży świeżych
    - Gdy użytkownik zmienia rodzaj na suche
    - Wtedy widzi 4 g drożdży suchych (RD-19-W1)
  - Scenariusz: Ujemna masa
    - Zakładając, że użytkownik wpisuje −1 g drożdży
    - Gdy zatwierdza pole
    - Wtedy widzi komunikat o błędnych danych (RD-19-W4)

### BR-KALK-010: Zaczyny poolish, biga i levain
- Przepływ: PR-17, PR-01 · Reguła: RD-26, RD-14, RD-28 (zaczyn w formule: D-061, D-060)
- Dowód potrzeby: J-11; kalkulator poolish i biga używany (S-24, rec. 7357117590) i błąd bazy zaczynu u konkurencji (S-19, rec. 8748510891)
- Kryteria akceptacji:
  - Scenariusz: Domyślna hydratacja poolish
    - Zakładając, że użytkownik dodaje zaczyn poolish
    - Gdy nie zmienia hydratacji
    - Wtedy zaczyn ma hydratację 100% (RD-26-W1)
  - Scenariusz: Levain poza typowym zakresem
    - Zakładając, że użytkownik ustawia hydratację levainu 126%
    - Gdy zatwierdza pole
    - Wtedy widzi informację „nietypowa hydratacja”, a obliczenie działa dalej (RD-26-W5)
  - Scenariusz: Zaczyn w formule
    - Zakładając, że formuła ma mąkę 100%, wodę 70% i sól 2%, a użytkownik wybiera poolish z 30% mąki
    - Gdy ustawia masę ciasta 1000 g
    - Wtedy karta „Do miski” pokazuje zaczyn 349 g, mąkę 407 g, wodę 233 g i sól 11,6 g, a suma wierszy różni się od masy ciasta najwyżej o 1 g; drożdże poolish mieszczą się w masie (RD-28-W1; D-061)
  - Scenariusz: Drożdże zaczynu większe niż w recepturze
    - Zakładając, że formuła ma drożdże 0,2%, a użytkownik wybiera bigę z 50% mąki
    - Gdy karta liczy ilości
    - Wtedy drożdże całej formuły to 0,5% (drożdże bigi), a nie 0,2% + 0,5% (RD-28-W2; D-061)

### BR-KALK-011: Informacja o nietypowej ilości soli
- Przepływ: PR-01 · Reguła: RD-27
- Dowód potrzeby: J-01, P-6; soczewka początkującego (sprawdzenie, czy liczby mają sens); przepis zbyt słony według użytkownika (S-24, rec. 5681544617)
- Kryteria akceptacji:
  - Scenariusz: Sól na granicy
    - Zakładając, że receptura ma 1000 g mąki
    - Gdy użytkownik wpisuje sól 2,0% (20 g)
    - Wtedy aplikacja nie pokazuje informacji (RD-27-W2)
  - Scenariusz: Sól powyżej typowej
    - Zakładając, że receptura ma 1000 g mąki
    - Gdy użytkownik wpisuje sól 2,01% (20,1 g)
    - Wtedy widzi informację, że to więcej niż typowe 1,8–2,0%, z atrybucją źródła (S-37), bez blokady zapisu (RD-27-W3; pole soli w procentach mąki jak w BR-KALK-001: ER-59)

### BR-UST-001: Jednostki wagi i temperatury
- Przepływ: PR-10 · zależy od: ZAL-037
- Dowód potrzeby: J-01; 9 z 338 recenzji o jednostkach, 6 z nich ≤ 3★ (S-27); H-12
- Kryteria akceptacji:
  - Scenariusz: Uncje i °F do wyświetlania
    - Zakładając, że użytkownik wybrał uncje i °F
    - Gdy otwiera recepturę zapisaną w gramach
    - Wtedy widzi wagi w uncjach i temperatury w °F, a zapisane wartości w gramach i °C się nie zmieniają
  - Scenariusz: Powrót do gramów
    - Zakładając, że użytkownik przełączył uncje na gramy
    - Gdy otwiera tę samą recepturę
    - Wtedy widzi te same wartości w gramach co przed przełączeniem

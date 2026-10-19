# Piekarz BRD 0.1 — Część C2c: Nauka — Diagnostyka i aparat (DIAG, APA) (rozdz. 7)

Specyfikacja interaktywnego drzewa rozwiązywania problemów z bochenkiem („Doktor Chleba”), modułu fotograficznego oraz podsumowanie części C.

---

## 7.23 Obszar DIAG: „Doktor Chleba” — Drzewo diagnostyczne błędów bochenka

Narzędzie pozwalające zidentyfikować przyczynę nieudanego wypieku na podstawie wyglądu zewnętrznego skórki i struktury miękiszu.

### DIAG-01: Błąd — Niedofermentowanie ciasta (Under-proofed / Flying Crust)

* **Objawy wizualne:** Bochenek mocno wybrzuszony w jednym miejscu, wielkie nieregularne dziury tuż pod górną skórką, a pod nimi gęsty, zbity, ciężki i wilgotny dół.  
* **Przyczyna biologiczna:** Zbyt krótka fermentacja burzliwa lub zbyt niska temperatura w kuchni; drożdże nie zdążyły wyprodukować gazu w całej objętości ciasta przed włożeniem do pieca.  
* **Rozwiązanie na przyszłość:** Wydłuż fermentację burzliwą o 45–60 minut; upewnij się, że zakwas osiągnął szczyt (Peak); podnieś temperaturę wody do DDT.

### DIAG-02: Błąd — Przekwaszenie ciasta (Over-proofed / Flat Bread)

* **Objawy wizualne:** Chleb rozlany jak dysk, blady, brak ucha, siatka drobnych, regularnych dziurek o kwasowym zapachu, bochenek oklapł po nacięciu żyletką.  
* **Przyczyna biologiczna:** Kwas wytworzony przez bakterie kwasu mlekowego strawił siatkę glutenową; ciasto straciło zdolność zatrzymywania gazów i nie uniosło się w piecu.  
* **Rozwiązanie na przyszłość:** Skróć czas garowania w lodówce lub fermentacji burzliwej; obniż temperaturę garowania; zmniejsz udział zakwasu w recepturze z 20% do 15%.

### DIAG-03: Błąd — Pęknięcie boku bochenka (Side Blow-out)

* **Objawy wizualne:** Bochenek nie otworzył się w miejscu nacięcia, lecz pękł wzdłuż dolnej krawędzi przy blasze/dnie garnka.  
* **Przyczyna technologiczna:** Zbyt płytkie nacięcie; stwardnienie skórki przed rozprężeniem gazu spowodowane brakiem pary wodnej w piekarniku.  
* **Rozwiązanie na przyszłość:** Tnij żyletką pewniej pod kątem na głębokość 1 cm; upewnij się, że pokrywka garnka żeliwnego jest szczelna.

### DIAG-04: Błąd — Gumowaty, kleisty miękisz (Gummy Crumb)

* **Objawy wizualne:** Miękisz po ukrojeniu maze się po nożu, wygląda na mokry mimo dopieczenia skórki.  
* **Przyczyny technologiczne:**  
  1. Przekrojenie gorącego bochenka przed ostygnięciem skrobi (skrobia żeluje do 60°C).  
  2. Zbyt niska temperatura wewnętrzna w środku bochenka (poniżej 94°C).  
* **Rozwiązanie na przyszłość:** Odczekaj minimum 2 godziny przed pierwszym krojeniem; dopiekaj chleb 5 minut dłużej; użyj termometru szpilkowego.

### BR-DIAG-001: Doktor Chleba — diagnoza wady bochenka i propozycja po słabej ocenie

* **Priorytet:** SHOULD · **Etap:** MVP (wybór właściciela 2026-10-19, D-034, ZM-07; ER-26)  
* **Persona:** P1, P4  
* **Przepływ:** PR-06 (A5, krok 3)  
* **Dowód potrzeby:** J-05; linia bazowa audytu M1 z 2026-10-19, praca J-B6 („Zdiagnozować wadę bochenka i wiedzieć, co zmienić”) i LB-25 (Doktor pamięta wcześniejsze zalecenia); tabela linii bazowej funkcji w raporcie audytu roli 03 z 2026-10-19, B6 (Loaflo, recenzja: „helped me figure out where, when, what I needed to adjust”).  
* **Opis:** Po wypieku piekarz wybiera objaw wady (DIAG-01…DIAG-04), widzi prawdopodobną przyczynę i zalecenie na następny wypiek, może przenieść poprawkę do receptury („Przestaw recepturę”) i skopiować diagnozę. Po ocenie ≤ 2★ w formularzu zakończenia wypieku aplikacja proponuje przejście do Doktora. Próg ≤ 2★ to wybór produktowy właściciela (D-034), nie liczba dziedzinowa. Treść objawów, przyczyn i zaleceń (DIAG-01…DIAG-04) pochodzi z rejestru treści roli 06 (ER-14 dla DIAG-04).  
* **Kryteria akceptacji:**  
  1. Po zapisaniu oceny ≤ 2★ formularz zakończenia wypieku pokazuje propozycję przejścia do Doktora; przy ocenie 3★ i wyższej jej nie pokazuje.  
  2. Wpis w dzienniku zapisuje się tak samo bez względu na to, czy użytkownik przyjmie propozycję.  
  3. Doktor jest dostępny także z nagłówków Stolnicy i Zakwasu.  
  4. „Przestaw recepturę” przenosi poprawkę do Kalkulatora i nie nadpisuje receptury bazowej (BR-RECP-001).  
  5. Każde zalecenie ma wpis w rejestrze treści roli 06.  
* **Płatność:** wg DEC-01.podzial: płatne po okresie próbnym (klucz `doktor` według kontraktu zakresu, F-43).
* **Scenariusze akceptacji (Gherkin, 2026-10-19):**

```gherkin
# language: pl
Scenariusz: Propozycja Doktora po słabej ocenie
  Zakładając, że użytkownik kończy wypiek w Stolnicy
  Gdy zapisuje ocenę 2★
  Wtedy widzi propozycję sprawdzenia przyczyny w Doktorze
  Oraz wpis z oceną 2★ jest w dzienniku

Scenariusz: Granica: ocena 3★ bez propozycji
  Zakładając, że użytkownik kończy wypiek w Stolnicy
  Gdy zapisuje ocenę 3★
  Wtedy nie widzi propozycji przejścia do Doktora
  Oraz wpis z oceną 3★ jest w dzienniku

Scenariusz: Odrzucenie propozycji nie zmienia wpisu
  Zakładając, że użytkownik zapisał ocenę 1★ i widzi propozycję Doktora
  Gdy zamyka propozycję
  Wtedy widzi w historii wpis z oceną 1★ i swoją notatką

Scenariusz: Diagnoza i przestawienie receptury
  Zakładając, że użytkownik jest w Doktorze
  Gdy wybiera objaw i dotyka „Przestaw recepturę”
  Wtedy Kalkulator pokazuje recepturę z poprawką
  Oraz receptura bazowa pozostaje bez zmian
```

---

## 7.24 Obszar APA: Aparat i dokumentacja fotograficzna

### BR-APA-001: Kadrowanie i porównanie przekroju bochenka

* **Priorytet:** SHOULD · **Etap:** 1.1  
* **Persona:** P1, P4  
* **Przepływ:** PR-06 (A5)  
* **Dowód potrzeby:** J-05; linia bazowa audytu M1 z 2026-10-19, praca 5 („zdjęcia miękiszu”); etap 1.1.  
* **Opis:** Moduł fotograficzny z nałożoną siatką ułatwiającą wykonanie prostopadłego zdjęcia przekroju bochenka oraz porównanie go z wzorcowymi profilami miękiszu (Open Crumb vs Sandwich Crumb).  
* **Kryteria akceptacji:**  
  1. Zdjęcie zapisywane bezpośrednio w lokalnej bazie SQLite / katalogu piaskownicy w formacie skompresowanym.  
  2. Zero wysyłania zdjęć do chmury (ZP-03).
* **Scenariusze akceptacji (Gherkin, 2026-10-19):**

```gherkin
# language: pl
Scenariusz: Zdjęcie przekroju zapisane lokalnie
  Zakładając, że użytkownik robi zdjęcie przekroju w dzienniku wypieku
  Gdy zapisuje wpis
  Wtedy widzi zdjęcie we wpisie
  Oraz aplikacja nie wysyła zdjęcia poza urządzenie

Scenariusz: Odmowa dostępu do aparatu
  Zakładając, że użytkownik odmówił dostępu do aparatu
  Gdy dotyka przycisku zdjęcia
  Wtedy widzi informację o braku dostępu
  Oraz może zapisać wpis bez zdjęcia
```

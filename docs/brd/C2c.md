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
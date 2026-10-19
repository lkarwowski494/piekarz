# **Piekarz BRD 0.1 — 00c Sprzeczności i weryfikacja dziedzinowa**

Zestawienie pozornych sprzeczności, sporów technologicznych w piśmiennictwie piekarskim oraz rozstrzygnięcia analityczne przyjęte w specyfikacji aplikacji Piekarz.

## **1\. Rejestr sprzeczności dziedzinowych i technologicznych**

### **S-01 Czy zakwas wlicza się do 100% bazy mąki?**

* **Spór:** Część książek kucharskich dla amatorów podaje: „weź 500 g mąki i 100 g zakwasu”, licząc mąkę jako 500 g (baza 100%). Zawodowe podręczniki piekarskie (Hamelman, Suas, Calvel) stosują **True Baker's Percentage**: jeśli zakwas ma 100% hydratacji (50 g mąki \+ 50 g wody), całkowita masa mąki wynosi 550 g, a woda dolana musi uwzględniać 50 g z zakwasu.  
* **Wpływ na produkt:** Przy amatorskim liczeniu deklarowana hydratacja 70% staje się w rzeczywistości hydratacją 72,7%, co przy luźnym cieście może zniszczyć strukturę bochenka.  
* **Rozstrzygnięcie:** Aplikacja domyślnie stosuje ścisłą definicję **całkowitej hydratacji ciasta (Overall Hydration)** wg reguły RD-02. W interfejsie użytkownik widzi dwie sekcje: „Krok po kroku do miski” (dokładne wagi składników) oraz „Parametry wypieku” (rzeczywista hydratacja całkowita).

### **S-02 Czas autolizy: z solą i zakwasem czy bez?**

* **Spór:** Klasyczna definicja prof. Raymonda Calvela (1974) nakazuje autolizę wyłącznie z mąki i wody (bez drożdży/zakwasu i bez soli), trwającą 20–60 minut w celu relaksacji glutenu i działania enzymów proteolitycznych. Wielu współczesnych piekarzy stosuje tzw. **fermentolizę** (autoliza z dodatkiem zakwasu, sól dodawana później), aby przyspieszyć proces. Sól hamuje aktywność enzymów i ściąga siatkę glutenową.  
* **Wpływ na produkt:** Opcje timera autolizy w asystencie etapów (BR-ETAP-003).  
* **Rozstrzygnięcie:** Aplikacja obsługuje oba warianty: „Klasyczna autoliza (mąka \+ woda)” oraz „Fermentoliza (mąka \+ woda \+ zakwas)”. Dodanie soli jest zawsze osobnym, wyraźnym krokiem po zakończeniu autolizy.

### **S-03 Formuła obliczania temperatury wody (DDT)**

* **Spór:** Część źródeł podaje prosty wzór: \$T\_{wody} \= 3 	imes DDT \- (T\_{maki} \+ T\_{otoczenia} \+ T\_{tarcia})\$. Źródła specjalizujące się w zakwasach wskazują, że przy udziale zakwasu na poziomie 20–30% jego temperatura (wyjęty z lodówki 4°C vs stojący na blacie 24°C) drastycznie przesuwa bilans termiczny.  
* **Wpływ na produkt:** Kalkulator DDT (BR-KALK-004, RD-05).  
* **Rozstrzygnięcie:** Wprowadzono współczynnik 4-składnikowy przy recepturach na zakwasie: \$T\_{wody} \= 4 	imes DDT \- (T\_{maki} \+ T\_{otoczenia} \+ T\_{zakwasu} \+ T\_{tarcia})\$. Przy braku pomiaru temperatury zakwasu aplikacja przyjmuje temperaturę otoczenia z ostrzeżeniem.

### **S-04 Hydratacja mąki żytniej vs pszennej**

* **Spór:** Mąka żytnia nie tworzy siatki glutenowej (brak gliadyny i gluteniny w odpowiednich formach), jej struktura opiera się na pentozanach i kleikowaniu skrobi pod wpływem kwasu. Tradycyjne składanie ciasta (stretch & fold) niszczy strukturę żyta zamiast ją budować.  
* **Wpływ na produkt:** Asystent etapów i harmonogram (BR-ETAP-008, RD-12).  
* **Rozstrzygnięcie:** Gdy udział mąki żytniej w zasypie przekracza 50%, aplikacja automatycznie dezaktywuje etapy składania (stretch & fold) i dostosowuje harmonogram do jednofazowej fermentacji w foremce oraz nakazuje wyższą temperaturę wypieku początkowego.

### **S-05 Dokarmianie zakwasu: lodówka czy temperatura pokojowa?**

* **Spór:** Część poradników zaleca trzymanie zakwasu w lodówce i dokarmianie raz w tygodniu; inni twierdzą, że zakwas lodówkowy traci witalność i wymaga 2–3 cykli odświeżenia w temperaturze pokojowej przed wypiekiem.  
* **Rozstrzygnięcie:** Profil zakwasu (BR-ZAKW-002) rozróżnia dwa stany: „Zakwas uśpiony (lodówka)” oraz „Zakwas aktywny (blat)”. Harmonogram wsteczny (HARMO) przy zakwasie z lodówki automatycznie planuje etap „Wybudzenie i dokarmienie wstępne” na 24h przed rozpoczęciem mieszania ciasta właściwego.

---

## **2\. Weryfikacja kluczowych założeń technologicznych**

| Założenie | Źródło weryfikacji | Wynik weryfikacji | Zastosowanie w BRD |
| :---- | :---- | :---- | :---- |
| Bezpieczeństwo mikrobiologiczne zakwasu | USDA, FDA Food Code, literatura mikrobiologiczna (Gänzle 2014\) | pH zakwasu spada poniżej 4.2 w ciągu 48h, co uniemożliwia rozwój *Clostridium botulinum* i patogenów jelitowych | RD-20: reguła bezpieczeństwa zakwasu i kryteria odrzucenia |
| Zależność szybkości fermentacji od temperatury | Krzywa Arrheniusa, Biochemia fermentacji piekarskiej | Współczynnik \$Q\_{10} pprox 2.0\$: wzrost temp. z 20°C do 30°C podwaja tempo produkcji gazu | RD-08: dynamiczna kompensacja czasu fermentacji |
| Współczynnik tarcia misy (Friction Factor) | American Institute of Baking (AIB), Jeffrey Hamelman | Wyrabianie ręczne: 0–1°C; mikser spiralny: 3–6°C; mikser planetarny: 2–5°C | RD-06: tabele tarcia w kalkulatorze DDT |
| Straty pieczeniowe (Bake Loss) | Instytut Biotechnologii Przemysłu Rolno-Spożywczego | Ubytek masy bochenka podczas pieczenia i stygnięcia wynosi 11–18% w zależności od hydratacji | RD-15: skalowanie wagi kęsów ciasta na wagę gotowego chleba |


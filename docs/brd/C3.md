# **Piekarz BRD 0.1 — Część C3: Reguły dziedzinowe RD-00…RD-15 (rozdz. 8\)**

Specyfikacja twardych reguł matematycznych, fizykochemicznych i technologicznych wraz z wektorami testowymi.

---

### **8.0 Zasady rozdziału**

* **Poziomy pewności:**  
  * **math:** ścisły rachunek stechiometryczny i bilans masowy (szczebel 1). Wektory testowe obowiązkowe.  
  * **standard:** międzynarodowe normy piekarskie ICC, American Institute of Baking, definicje podręcznikowe (szczebel 2–3).  
  * **heurystyka:** ugruntowane reguły warsztatowe mistrzów rzemiosła (Calvel, Hamelman, Robertson) (szczebel 4).  
* **Zasada blokowania wydań:** Błąd w którejkolwiek z reguł matematycznych lub sanitarnych blokuje publikację aplikacji w App Store.

---

### **RD-00 Zasada przekrojowa: brak zaokrągleń pośrednich**

* **Brzmienie:** Wszystkie obliczenia proporcji, bilansu wody i mas mąki są wykonywane na liczbach zmiennoprzecinkowych podwójnej precyzji (Double) bez zaokrągleń pośrednich. Zaokrąglenie do pełnego grama (lub 0,1 g dla soli i drożdży) następuje wyłącznie w warstwie prezentacji widoku dla użytkownika.  
* **Wzór:** \$\\text{Prezentacja} \= \\text{round}(f(x))\$, nigdy \$f(\\text{round}(x))\$.  
* **Poziom:** math · **Blokuje wydanie:** TAK.

---

### **RD-01 Ścisłe przeliczanie jednostek miar**

* **Brzmienie:** Zgodnie z normami NIST SP 811:  
  * \$1\\text{ lb (funt)} \= 453,59237\\text{ g}\$ dokładnie.  
  * \$1\\text{ oz (uncja)} \= 28,349523125\\text{ g}\$ dokładnie.  
  * Przelicznik temperatury: \$T\_{^\\circ\\text{C}} \= (T\_{^\\circ\\text{F}} \- 32\) \\times \\frac{5}{9}\$.  
* **Wektory testowe:**  
  * **W-01.1:** \$16,0\\text{ oz} \\rightarrow 453,59\\text{ g}\$ (pokaz 454 g).  
  * **W-01.2:** \$78^\\circ\\text{F} \\rightarrow 25,56^\\circ\\text{C}\$ (pokaz 25,6°C).  
* **Poziom:** standard · **Blokuje wydanie:** TAK.

---

### **RD-02 True Baker's Percentage i bilans hydratacji całkowitej**

* **Brzmienie:** Mąka zasypowa stanowi bazę 100%. Zakwas o hydratacji \$H\_z\$ wprowadza do ciasta frakcję mąki \$M\_z\$ oraz frakcję wody \$W\_z\$. Rzeczywista całkowita hydratacja ciasta (\$H\_c\$) uwzględnia obie frakcje.  
* **Wzory:**  
  * \$M\_z \= \\frac{W\_{\\text{zakwas}}}{1 \+ H\_z}\$; dla zakwasu 100%: \$M\_z \= 0,5 \\times W\_{\\text{zakwas}}\$.  
  * \$W\_z \= W\_{\\text{zakwas}} \- M\_z\$; dla zakwasu 100%: \$W\_z \= 0,5 \\times W\_{\\text{zakwas}}\$.  
  * \$M\_{\\text{calkowita}} \= M\_{\\text{zasypowa}} \+ M\_z\$.  
  * \$W\_{\\text{calkowita}} \= W\_{\\text{dolana}} \+ W\_z\$.  
  * \$H\_c \= \\frac{W\_{\\text{calkowita}}}{M\_{\\text{calkowita}}} \\times 100%\$.  
* **Wektory testowe:**  
  * **W-02.1:** Mąka zasypowa 500 g, woda dolana 350 g, zakwas 100 g (100% hydratacji):  
    * \$M\_z \= 50\\text{ g}\$, \$W\_z \= 50\\text{ g}\$.  
    * \$M\_{\\text{calkowita}} \= 550\\text{ g}\$, \$W\_{\\text{calkowita}} \= 400\\text{ g}\$.  
    * \$H\_c \= \\frac{400}{550} \\times 100% \= \\mathbf{72,73%}\$ (amatorski kalkulator podałby błędne 70,0%).  
* **Poziom:** math · **Blokuje wydanie:** TAK.

---

### **RD-03 Zawartość soli w cieście chlebowym**

* **Brzmienie:** Standardowa zawartość soli wynosi od 1,8% do 2,2% w stosunku do całkowitej mąki (optymalnie 2,0%). Zawartość poniżej 1,5% powoduje blady chleb i osłabienie siatki glutenu; powyżej 2,5% drastycznie hamuje fermentację drożdżową.  
* **Wzór:** \$W\_{\\text{soli}} \= M\_{\\text{calkowita}} \\times 0,02\$.  
* **Wektory testowe:**  
  * **W-03.1:** \$M\_{\\text{calkowita}} \= 550\\text{ g} \\rightarrow W\_{\\text{soli}} \= 11,0\\text{ g}\$.  
* **Poziom:** standard / heurystyka · **Blokuje wydanie:** TAK.

---

### **RD-04 Przelicznik drożdży świeżych na drożdże instant**

* **Brzmienie:** Stosunek wagowy drożdży świeżych prasowanych do drożdży suchych instant wynosi dokładnie 3:1.  
* **Wzór:** \$W\_{\\text{instant}} \= \\frac{W\_{\\text{swieze}}}{3}\$.  
* **Wektory testowe:**  
  * **W-04.1:** \$15\\text{ g świeżych} \\rightarrow 5,0\\text{ g instant}\$.  
  * **W-04.2:** \$7\\text{ g instant} \\rightarrow 21,0\\text{ g świeżych}\$.  
* **Poziom:** standard · **Blokuje wydanie:** TAK.

---

### **RD-05 Obliczanie wymaganej temperatury wody (DDT)**

* **Brzmienie:** Formuła 4-składnikowa dla receptur na zakwasie: \$\$T\_{\\text{wody}} \= (4 \\times T\_{\\text{DDT}}) \- (T\_{\\text{maki}} \+ T\_{\\text{otoczenia}} \+ T\_{\\text{zakwasu}} \+ T\_{\\text{tarcia}})\$\$  
* **Wektory testowe:**  
  * **W-05.1:** \$T\_{\\text{DDT}} \= 25^\\circ\\text{C}\$, \$T\_{\\text{maki}} \= 20^\\circ\\text{C}\$, \$T\_{\\text{otoczenia}} \= 22^\\circ\\text{C}\$, \$T\_{\\text{zakwasu}} \= 22^\\circ\\text{C}\$, \$T\_{\\text{tarcia}} \= 2^\\circ\\text{C}\$:  
    * \$T\_{\\text{wody}} \= (4 \\times 25\) \- (20 \+ 22 \+ 22 \+ 2\) \= 100 \- 66 \= \\mathbf{34,0^\\circ\\text{C}}\$.  
* **Poziom:** math / standard · **Blokuje wydanie:** TAK.

---

### **RD-06 Współczynnik tarcia misy (Friction Factor)**

* **Brzmienie:** Wartości domyślne wzrostu temperatury ciasta w wyniku tarcia mechanicznego podczas mieszania:  
  * Wyrabianie ręczne: \$1,0^\\circ\\text{C}\$.  
  * Mikser spiralny (1. bieg wolny): \$3,0^\\circ\\text{C}\$.  
  * Mikser spiralny (2. bieg szybki): \$6,0^\\circ\\text{C}\$.  
  * Mikser planetarny domowy (hak): \$4,0^\\circ\\text{C}\$.  
* **Poziom:** heurystyka · **Blokuje wydanie:** NIE (wartości edytowalne).

---

### **RD-07 Obliczanie ilości lodu do schłodzenia wody**

* **Brzmienie:** Gdy wyliczona \$T\_{\\text{wody}} \< T\_{\\text{kran}}\$, do uzyskania wymaganej temperatury konieczne jest zastąpienie części wody lodem, uwzględniając ciepło topnienia lodu (\$80\\text{ cal/g} \\approx 334\\text{ J/g}\$): \$\$M\_{\\text{lodu}} \= M\_{\\text{wody\_calkowitej}} \\times \\frac{T\_{\\text{kran}} \- T\_{\\text{docelowa}}}{80 \+ T\_{\\text{kran}}}\$\$  
* **Wektory testowe:**  
  * **W-07.1:** \$M\_{\\text{wody}} \= 350\\text{ g}\$, \$T\_{\\text{kran}} \= 18^\\circ\\text{C}\$, \$T\_{\\text{docelowa}} \= 4^\\circ\\text{C}\$:  
    * \$M\_{\\text{lodu}} \= 350 \\times \\frac{18 \- 4}{80 \+ 18} \= 350 \\times \\frac{14}{98} \= \\mathbf{50,0\\text{ g lodu}}\$ oraz \$300\\text{ g wody}\$.  
* **Poziom:** math · **Blokuje wydanie:** TAK.

---

### **RD-08 Współczynnik termiki biologicznej \$Q\_{10}\$**

* **Brzmienie:** Zależność tempa fermentacji od temperatury ciasta opiera się na biologicznym współczynniku \$Q\_{10} \\approx 2,0\$ w zakresie 18°C–28°C. Wzrost temperatury o 10°C podwaja tempo produkcji \$CO\_2\$ przez drożdże, co skraca czas fermentacji o połowę.  
* **Wzór:** \$\\text{Czas}(T) \= \\text{Czas}\_{24} \\times 2^{\\frac{24 \- T}{10}}\$.  
* **Wektory testowe:**  
  * **W-08.1:** Receptura bazowa 4,0h przy 24°C:  
    * W temperaturze 29°C: \$4,0 \\times 2^{-0,5} \= \\mathbf{2,83\\text{h}}\$ (ok. 2h 50 min).  
    * W temperaturze 19°C: \$4,0 \\times 2^{0,5} \= \\mathbf{5,66\\text{h}}\$ (ok. 5h 40 min).  
* **Poziom:** standard / heurystyka · **Blokuje wydanie:** TAK.

---

### **RD-09 Skalowanie receptury na masę kęsa ciasta**

* **Brzmienie:** Obliczanie masy mąki zasypowej z pożądanej wagi gotowego ciasta brutto: \$\$M\_{\\text{maki}} \= \\frac{W\_{\\text{ciasta}}}{\\sum % / 100}\$\$  
* **Wektory testowe:**  
  * **W-09.1:** Chleb 100% mąka, 70% woda, 20% zakwas, 2% sól. Suma % \= 192%. Chcemy ciasto o wadze 960 g:  
    * \$M\_{\\text{maki}} \= \\frac{960}{1,92} \= \\mathbf{500,0\\text{ g}}\$.  
    * Woda \= \$500 \\times 0,7 \= \\mathbf{350,0\\text{ g}}\$.  
    * Zakwas \= \$500 \\times 0,2 \= \\mathbf{100,0\\text{ g}}\$.  
    * Sól \= \$500 \\times 0,02 \= \\mathbf{10,0\\text{ g}}\$.  
    * Kontrola sumy: \$500 \+ 350 \+ 100 \+ 10 \= 960\\text{ g}\$.  
* **Poziom:** math · **Blokuje wydanie:** TAK.

---

### **RD-10 Straty pieczeniowe (Bake Loss)**

* **Brzmienie:** Podczas pieczenia i stygnięcia bochenek traci od 12% do 18% masy w postaci odparowanej pary wodnej (średnio 14% dla bochenków 750–900 g): \$\$W\_{\\text{upieczonego}} \= W\_{\\text{ciasta}} \\times (1 \- \\text{Strata})\$\$  
* **Wektory testowe:**  
  * **W-10.1:** Kęs ciasta 900 g przy stracie 14% daje bochenek o wadze \$\\mathbf{774\\text{ g}}\$.  
* **Poziom:** standard / heurystyka · **Blokuje wydanie:** NIE.

---

### **RD-11 Granica reologiczna mąki żytniej**

* **Brzmienie:** Jeżeli udział mąki żytniej w zasypie wynosi \$\\ge 50%\$, ciasto traci właściwości elastyczno-sprężyste siatki glutenowej na rzecz lepkiej struktury pentozanowej.  
* **Reguła aplikacji:** Wyłączenie procedur Stretch & Fold i Coil Fold. Przejście na jednoetapowy rozrost w formie.  
* **Poziom:** standard · **Blokuje wydanie:** TAK.

---

### **RD-12 Bezpieczeństwo biologiczne i pasteryzacja miękiszu**

* **Brzmienie:** Minimalna temperatura wewnętrzna w geometrycznym środku bochenka gwarantująca pełne ścięcie białek, ugotowanie skrobi i pasteryzację biologiczną wynosi:  
  * Dla chlebów pszennych: \$\\ge 94^\\circ\\text{C}\$ (\$201^\\circ\\text{F}\$).  
  * Dla chlebów żytnich razowych: \$\\ge 98^\\circ\\text{C}\$ (\$208^\\circ\\text{F}\$).  
* **Poziom:** standard sanitarny · **Blokuje wydanie:** TAK.
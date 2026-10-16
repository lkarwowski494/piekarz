# **Piekarz BRD 0.1 — Część C4a: Wektory testowe, blokery jakościowe (rozdz. 8\)**

Zestawienie procedur weryfikacji automatycznej kalkulatora piekarskiego oraz twarde kryteria blokujące wydanie.

---

## **8.4 Kompletny zestaw wektorów testowych dla CI/CD (Test Vectors)**

Wszystkie poniższe przypadki testowe muszą przechodzić w 100% w testach jednostkowych (XCTest / Swift Testing):

| Kod wektora | Testowana reguła | Wejście (Input) | Oczekiwany wynik (Output) | Tolerancja błędu |
| :---- | :---- | :---- | :---- | :---- |
| **TV-01** | RD-02 Bilans hydratacji | 1000 g mąki, 700 g wody, 200 g zakwasu (100% hydratacji) | \$M\_{calk} \= 1100	ext{ g}\$, \$W\_{calk} \= 800	ext{ g}\$, \$H\_c \= \\mathbf{72,73%}\$ | 0,01% |
| **TV-02** | RD-02 Bilans sztywnego zakwasu | 500 g mąki, 350 g wody, 100 g Lievito Madre (50% hydratacji) | \$M\_z \= 66,67	ext{ g}\$, \$W\_z \= 33,33	ext{ g}\$, \$H\_c \= \\mathbf{67,65%}\$ | 0,01% |
| **TV-03** | RD-03 Sól optymalna | \$M\_{calk} \= 850	ext{ g}\$, sól 2,0% | \$W\_{	ext{soli}} \= \\mathbf{17,0	ext{ g}}\$ | 0,1 g |
| **TV-04** | RD-04 Drożdże instant | 42 g drożdży świeżych | \$W\_{	ext{instant}} \= \\mathbf{14,0	ext{ g}}\$ | 0,1 g |
| **TV-05** | RD-05 Formuła DDT | DDT 26°C, Mąka 21°C, Pokój 23°C, Zakwas 22°C, Tarcie 4°C | \$T\_{wody} \= 104 \- 70 \= \\mathbf{34,0^\\circ	ext{C}}\$ | 0,1°C |
| **TV-06** | RD-07 Lód do schłodzenia | Woda 400 g, Kran 20°C, Docelowa 5°C | \$M\_{	ext{lodu}} \= 400 	imes rac{15}{100} \= \\mathbf{60,0	ext{ g lodu}}\$, woda \= 340 g | 0,5 g |
| **TV-07** | RD-09 Skalowanie masy ciasta | 3 bochenki po 750 g (2250 g), Receptura: 100% mąka, 68% woda, 20% zakwas, 2% sól (suma 190%) | Mąka: **1184 g**, Woda: **805 g**, Zakwas: **237 g**, Sól: **24 g** (Suma: 2250 g) | ±1 g na sumie |
| **TV-08** | RD-01 Jednostki imperialne | \$32,0	ext{ oz mąki}\$, \$22,4	ext{ oz wody}\$ | \$H \= \\mathbf{70,0%}\$, waga metryczna: \$907	ext{ g mąki}\$, \$635	ext{ g wody}\$ | 1 g |

---

## **8.5 Blokery jakościowe i merytoryczne wydania (Release Blockers)**

Żadna wersja aplikacji nie może trafić do App Store ani publicznego TestFlight, jeśli wystąpi którekolwiek ze zjawisk:

1. **Niezgodność bilansu masowego:** Jakikolwiek błąd zaokrąglenia powodujący, że suma wyliczonych składników różni się od zadanej masy całkowitej ciasta o więcej niż 1 gram.  
2. **Brak ostrzeżenia termicznego DDT:** Wyliczenie temperatury wody powyżej 45°C bez widocznego, jaskrawego ostrzeżenia o ryzyku zabicia drożdży.  
3. **Błąd w algorytmie przeliczania drożdży:** Złe przeskalowanie drożdży suchych/świeżych (ryzyko 3-krotnego przedawkowania).  
4. **Brak wsparcia dla VoiceOver na ekranie stolnicy:** Zablokowanie persony dostępności Marka (P5).  
5. **Naruszenie prywatności:** Pojawienie się w kodzie dowolnego wywołania sieciowego do zewnętrznych serwerów analitycznych (zgodnie z ZP-04 i ZP-10).
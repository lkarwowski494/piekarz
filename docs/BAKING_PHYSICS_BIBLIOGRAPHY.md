# Bibliografia Fizyki i Rzemiosła Piekarskiego — Piekarz (Apps4Craft Studio)

Niniejszy dokument stanowi formalne źródło cytowań naukowych i mistrzowskich dla algorytmów obliczeniowych, stałych fizyko-chemicznych oraz wzorców piekarskich zaimplementowanych w aplikacji **Piekarz** (`noble-pasteur`).
Zgodnie z Zasadą 3 Uniwersalnych Zasad oraz modułem dziedzinowym `research i treści merytoryczne`: *każda stała i wzór matematyczny posiada zweryfikowane źródło literaturowe*.

---

## 1. True Baker's Percentage (Matematyka Piekarska)
- **Źródło:** Hamelman, Jeffrey. *Bread: A Baker's Book of Techniques and Recipes*. John Wiley & Sons, 2012, s. 14–19.
- **Źródło uzupełniające:** Calvel, Raymond. *The Taste of Bread* (tłum. Ronald L. Wirtz). Springer, 2001, rozdz. 3: *The Principles of Calculation*.
- **Wzór i założenia:**
  - Całkowita mąka ($100\%$) jest sumą mąk sypanych bezpośrednio do dzieży oraz mąki zawartej w zakwasie / prefermencie (ang. *overall flour*).
  - Wszelkie składniki (woda całkowita, sól, mąki składowe) wyrażane są w odniesieniu do sumarycznej masy mąki:
    $$\% X = \frac{m_X}{m_{\text{mąka całkowita}}} \times 100\%$$
  - Implementacja: `src/core/domain-rules.ts` -> `calculateDoughRecipe()`

---

## 2. Desired Dough Temperature (DDT) & Bilans Energetyczny Dzieży
- **Źródło:** DiMuzio, Daniel T. *Bread Baking: An Artisan's Perspective*. John Wiley & Sons, 2009, rozdz. 5: *Controlling Dough Temperature*, s. 71–85.
- **Źródło uzupełniające:** Hamelman, Jeffrey. *Bread*, 2012, s. 382–386 (*Desired Dough Water Temperature*).
- **Wzory:**
  - **Model 3-czynnikowy (ciasta bezpośrednie):**
    $$T_{\text{woda}} = 3 \times T_{\text{docelowa}} - (T_{\text{mąka}} + T_{\text{pomieszczenie}} + F)$$
    gdzie $F$ to współczynnik tarcia (ang. *friction factor*): mieszenie ręczne ($F \approx 0{-}2^\circ\text{C}$), miesiarka spiralna ($F \approx 4{-}8^\circ\text{C}$).
  - **Model 4-czynnikowy (ciasta na zakwasie):**
    $$T_{\text{woda}} = 4 \times T_{\text{docelowa}} - (T_{\text{mąka}} + T_{\text{pomieszczenie}} + T_{\text{zakwas}} + F)$$
  - **Kompensacja lodem (Ciepło topnienia lodu):**
    Gdy wymagana temperatura wody $T_{\text{woda}} < 0^\circ\text{C}$ lub jest niższa od temperatury wody z kranu $T_{\text{kran}}$, stosuje się lód o utajonym cieple topnienia $L_f = 79.7 \approx 80\text{ cal/g} \equiv 334\text{ kJ/kg}$.
    $$m_{\text{lód}} = m_{\text{woda całkowita}} \times \frac{T_{\text{kran}} - T_{\text{woda}}}{T_{\text{kran}} + 80}$$
  - Implementacja: `src/core/domain-rules.ts` -> `calculateDdtWaterTemperature()`, `calculateIceWaterRequirement()`

---

## 3. Kinetyka Fermentacji i Wrażliwość Termiczna ($Q_{10}$)
- **Źródło:** Buehler, Emily. *Bread Science: The Chemistry and Craft of Making Bread*. Two Blue Books, 2006, rozdz. 3–4 (*Yeast and Bacteria*, *Fermentation Kinetics*).
- **Weryfikacja fizyko-chemiczna:**
  - Aktywność metaboliczna drożdży (*Saccharomyces cerevisiae*) oraz bakterii kwasu mlekowego (*Lactobacillus sanfranciscensis*) w zakresie fizjologicznym ($15^\circ\text{C} - 28^\circ\text{C}$) podlega przybliżeniu reguły van 't Hoffa / współczynnikowi Arrheniusa $Q_{10} \approx 2.0$.
  - Wzrost temperatury o $10^\circ\text{C}$ podwaja tempo fermentacji (skraca czas o $\approx 50\%$).
  - Powyżej $38^\circ\text{C}$ następuje denaturacja białek enzymatycznych i śmierć komórek drożdżowych (hamowanie wzrostu).
  - Implementacja: `src/core/domain-rules.ts` -> `estimateFermentationTime()`, `src/core/starter-peak-predictor.ts`

---

## 4. Rehydratacja, Strata Piecowa i Kwasowość (TTA / pH)
- **Źródła:**
  - Calvel, Raymond. *The Taste of Bread*, 2001 (rozdziały dot. autolizy i odparowania wody w piecu).
  - Suas, Michel. *Advanced Bread and Pastry: A Professional Approach*. Delmar Cengage Learning, 2008.
- **Wskaźniki:**
  - **Strata piecowa (Bake Loss):** Standardowy wypiek bochenka w żeliwnym garnku (Dutch Oven) lub piecu wsadowym z parą wiąże się ze stratą wilgoci na poziomie $12{-}16\%$ masy ciasta.
  - **Bezpieczeństwo mikrobiologiczne zakwasu:** pH dojrzałego zakwasu wynosi $3.8{-}4.2$. Zakwas o pH $> 4.8$ nie zapewnia pełnej ochrony przed patogenami i wymaga zintensyfikowanego dokarmiania.
  - Implementacja: `src/core/domain-rules.ts` -> `calculateBakeLossMetrics()`, `src/doctor/diagnostics.ts`

---

*Apps4Craft Studio • 100% Offline-First • Zweryfikowane Rzemiosło*

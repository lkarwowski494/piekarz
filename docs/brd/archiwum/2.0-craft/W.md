# Piekarz BRD — Raport Weryfikacji Źródeł Merytorycznych (W.md)
## Wersja: 2.0-craft (Modernizacja Retrofit Apps4Craft)
**Standard:** Apps4Craft Tier 1–3 Evidence-Based Baking Science.

---

### 1. Hierarchia Dowodów Naukowo-Rzemieślniczych

Wszystkie parametry biochemiczne, termofizyczne i matematyczne zaimplementowane w aplikacji Piekarz podlegają 5-stopniowej hierarchii źródeł:
1. **Tier 1 (Prawo i Normy Międzynarodowe):** PN-A-74022 (przetwory zbożowe), DIN 10355 (klasyfikacja mąk), ICC Standard Methods (liczba opadania Hagberga-Pertena, Alveograph Chopina W).
2. **Tier 2 (Nauka Recenzowana):** Publikacje z zakresu mikrobiologii i chemii zbóż:
   - Gänzle, M. G., & Ripari, V. (2016). *Composition and function of sourdough microbiota*. International Journal of Food Microbiology.
   - Brandt, M. J. (2007). *Sourdough technology for new products*. Trends in Food Science & Technology.
   - De Vuyst, L., & Neysens, P. (2005). *The sourdough microflora: biodiversity and metabolic activity*. Food Microbiology.
3. **Tier 3 (Klasyczne Podręczniki Mistrzowskie):**
   - Calvel, R. (2001). *The Taste of Bread*. Springer. (Teoria autolizy, równanie DDT wody, kinetyka wyrabiania).
   - Hamelman, J. (2012). *Bread: A Baker's Book of Techniques and Recipes*. Wiley. (Prefermenty, bilans kwasowości, straty pieczeniowe).
   - DiMuzio, D. T. (2009). *Bread Baking: An Artisan's Perspective*. Wiley. (Wzory procentu piekarskiego, retrogradacja skrobi).
   - Suas, M. (2008). *Advanced Bread and Pastry: A Professional Approach*. Cengage Learning. (Technologia Tangzhong, ciasta wzbogacane).
4. **Tier 4 (Autorytety Nowożytnego Rzemiosła):**
   - Robertson, C. (2010). *Tartine Bread*. Chronicle Books. (Techniki wysokiej hydratacji 75–85%, Coil Folds, kultura zakwasu naturalnego).
   - Forkish, K. (2012). *Flour Water Salt Yeast*. Ten Speed Press. (Garowanie w chłodzie 12–16h, wypiek w garnkach żeliwnych).
5. **Tier 5 (Doświadczenie Społeczności i Fora):**
   - Fora amatorskie (The Fresh Loaf, r/Sourdough) — traktowane wyłącznie jako źródło pomysłów UX i sygnałów o problemach piekarzy domowych. **Nigdy jako podstawa reguł obliczeniowych!**

---

### 2. Wykaz Twierdzeń i Znaczników Rygoru (Evidence Register)

*Stan 2026-10-19 (rola 01, zadanie M1-audytor-generalny-034, znalezisko 01-odkrywanie-013):* pozycje w kolumnie „Źródło dowodowe” nie zostały otwarte w dniu pracy i nie mają wpisu S (S.md), więc klasyfikacja `[FAKT]` / `[NORMA]` z wersji 2.0-craft nie jest potwierdzeniem. Rola 01 nie rozstrzyga tych faktów dziedzinowych: kolumna „Stan i odesłanie” wskazuje regułę RD z wpisem S, wpis w rejestrze treści roli 06 (`docs/tresci/rejestr.json`) albo otwarte pytanie OP. Brzmienie twierdzeń bez zmian.

| ID | Twierdzenie Merytoryczne | Klasyfikacja | Źródło Dowodowe | Stan i odesłanie (2026-10-19) |
|---|---|---|---|---|
| `EV-01` | Mąka i woda zawarta w zakwasie muszą w 100% wchodzić w skład całkowitej hydratacji ciasta (True Baker's %). | `[FAKT]` | Hamelman (2012) s. 14; Calvel (2001) s. 32; DiMuzio (2009) s. 28. | Podstawa w BRD: RD-02 z S-01 (procent całkowity przy prefermentach) i rachunek bilansu masy; pozycje z kolumny obok nieprzeczytane |
| `EV-02` | Równanie 4-DDT Calvela: $T_{wody} = (4 \times DDT) - (T_{mąki} + T_{otoczenia} + T_{zakwasu} + FF)$. | `[NORMA]` | Calvel, R. (1974 / 2001) *The Taste of Bread*, rozdz. 4. | Podstawa w BRD: RD-05 z S-02 (mnożnik 4 przy prefermencie); Calvel nieprzeczytany; nie jest normą |
| `EV-03` | Woda o temperaturze $> 45.0^\circ C$ powoduje szok termiczny i denaturację drożdży *S. cerevisiae*. | `[FAKT]` | Brandt, M. J. (2007); Food Microbiology Handbook (2015). | [DO USTALENIA] (OP-08); rejestr 06: brak wpisu; ER-02 |
| `EV-04` | Obliczenie masy lodu opiera się na cieple utajonym topnienia wody ($L_f = 334\text{ J/g} \approx 80\text{ cal/g}$). | `[OBLICZENIE]` | Podręcznik Fizyki Cieplnej; Hamelman (2012) s. 385. | [DO USTALENIA] (OP-13); rejestr 06: brak wpisu |
| `EV-05` | Współczynnik przyspieszenia metabolicznego fermentacji zakwasowej w zakresie 18–28°C wynosi $Q_{10} \approx 2.15$. | `[FAKT]` | Gänzle & Ripari (2016); De Vuyst & Neysens (2005). | [DO USTALENIA] (OP-05), zakres ważności (OP-14); rejestr 06: brak wpisu; ER-03 |
| `EV-06` | Płyn głodowy (Hooch) na zakwasie składa się z etanolu i kwasów organicznych wyprodukowanych przez głodujące drożdże. | `[FAKT]` | Gänzle, M. G. (2014); Sourdough Fermentation Review. | Rejestr 06: ZAK-HOO-001 (potwierdzone z S-04: płyn o zapachu alkoholu jest w porządku), ZAK-HOO-900 (wycofane); skład płynu: [DO USTALENIA] (OP-24) |
| `EV-07` | Kożuch *Kahm yeast* jest nieszkodliwą błoną drożdży tlenowych, w odróżnieniu od zarodników pleśni wytwarzających mykotoksyny. | `[FAKT]` | FDA Bad Bug Book (2012); USDA Guidelines on Sourdough Safety. | Rejestr 06: ZAK-KAH-001 wycofane, następca ZAK-NAL-001 (każdy kożuch → wyrzucić); RD-13 i ER-05. Twierdzenie nie jest podstawą żadnej reguły |
| `EV-08` | Krojenie bochenka przed wystudzeniem rdzenia poniżej 35°C niszczy siatkę skrobiową i wywołuje zakalec skrobiowy. | `[FAKT]` | DiMuzio (2009) rozdz. 11; Suas (2008) rozdz. 5. | [DO USTALENIA] (OP-19); rejestr 06: ZYT-STU-001, ZYT-STU-900 (studzenie chleba żytniego); ER-04 |
| `EV-09` | Tangzhong polega na podgrzaniu mąki z wodą w stosunku 1:5 do 65°C, powodując żelowanie amylozy i uwięzienie wilgoci. | `[FAKT]` | Suas (2008); Journal of Cereal Science (2018). | [DO USTALENIA] (OP-24); rejestr 06: brak wpisu; DEC-41 |
| `EV-10` | Ubytek masy bochenka podczas pieczenia i stygnięcia wynosi 11–16% dla bochenków 750–900g w garnku żeliwnym. | `[OBLICZENIE]` | Pomiary empiryczne Piekarz Test Matrix; Hamelman (2012) s. 42. | [DO USTALENIA] (OP-12); rejestr 06: brak wpisu; ER-13 |

---

### 3. Zgodność z Apple App Store Guidelines (Bezpieczeństwo Zdrowotne)
Zgodnie z wytyczną **Apple Review Guideline 1.4.1 (Medical and Health Disclaimers)**:
- Aplikacja Piekarz **nie stawia diagnoz medycznych** ani nie udziela porad zdrowotnych.
- Moduł oceny zakwasu (`evaluateSourdoughSafety`) służy wyłącznie technologii żywności kuchennej i ocenie organoleptycznej surowca ciasta.
- W przypadku podejrzenia pleśni aplikacja bezwzględnie nakazuje utylizację produktu do kosza.

# Piekarz BRD — 00c Errata i Rozstrzygnięcia Dziedzinowe
## Wersja: 2.0-craft (Modernizacja Retrofit Apps4Craft)

---

### 1. Sprzeczności w Literaturze Piekarskiej i Rozstrzygnięcia Naukowe

W procesie analizy dziedzinowej i triangulacji zidentyfikowano sprzeczności pomiędzy podręcznikami rzemiosła piekarskiego a badaniami mikrobiologicznymi i fizykochemicznymi. Poniższa tabela stanowi oficjalne rozstrzygnięcie merytoryczne studia Apps4Craft:

| Obszar Spory | Sprzeczność w Literaturze | Dowód Naukowy / Źródło Tier 1–2 | Rozstrzygnięcie w Piekarzu |
|---|---|---|---|
| **Bilans Zakwasu w Hydratacji** | Część przepisów traktuje zakwas jako „dodatek smakowy” i nie wlicza jego mąki/wody do bazy 100%. | Prawo zachowania masy (Lavoisier) oraz bilans stechiometryczny (Calvel 2001, Hamelman 2012). | **RD-02 (True Baker's %):** 100% mąki i wody z zakwasu oraz prefermentów jest bezwzględnie wliczane do całkowitego mianownika i hydratacji ciasta. |
| **Temperatura Wody a Śmierć Drożdży** | Część autorów podaje próg termiczny 50°C, inni 45°C lub 40°C. | Kinetyka denaturacji termicznej białek enzymatycznych i inaktywacji *S. cerevisiae* (Brandt 2007). Przy 46–48°C zaczyna się masowa lizyza komórek drożdżowych. | **RD-05:** Twardy bezpiecznik software'owy: woda $>45.0^\circ C$ wyzwala status `too_hot_danger` i blokuje zalecenie w UI. |
| **Współczynnik Q10 Fermentacji** | Często przyjmuje się ogólny współczynnik podwajania tempa reakcji chemicznych $Q_{10} = 2.0$. | Badania mikrobiologii ciast zakwasowych (Gänzle & Ripari 2016, Brandt 2007): w zakresie 18–28°C równoległa aktywacja drożdży i heterofermentatywnych bakterii LAB wykazuje $Q_{10} \approx 2.15$. | **RD-08:** Wdrożenie $Q_{10} = 2.15$ w silniku adaptacji czasu do temperatury. |
| **Krojenie Gorącego Chleba** | Pokusa konsumpcji natychmiast po wyjęciu z pieca vs zalecenia technologiczne. | Zjawisko retrogradacji amylozy i stabilizacji miękiszu (DiMuzio 2009). Krojenie gorącego chleba uwalnia parę wodną przez przekrój, sklejając pęcherzyki i tworząc zakalec skrobiowy. | **RD-10c:** Narzędzie harmonogramu i timer wymusza fazę studzenia min. 2.0h na kratce (dla żyta min. 8h) z zakazem krojenia. |
| **Kożuch (Kahm Yeast) vs Pleśń** | Fora internetowe często nakazują wyrzucenie każdego zakwasu z jakimkolwiek białym nalotem. | Mikrobiologia żywności: *Kahm yeast* (drożdże tlenowe, np. *Pichia*) tworzą białawą, suchą, pofałdowaną błonę, która jest nieszkodliwa. Pleśń (*Aspergillus*, *Penicillium*) tworzy puszyste, kolorowe zarodniki (różowe, zielone, czarne) wydzielające mykotoksyny. | **RD-13:** Moduł bezpieczeństwa ratuje zakwas w przypadku kożucha kahm (zdejmowanie wierzchniej warstwy), a bezwzględnie nakazuje utylizację przy pleśni. |

---

### 2. Wykaz Wektorów Weryfikacyjnych
Kompletny zestaw wektorów testowych dla powyższych reguł został zapisany w formacie maszynowym:
👉 `docs/brd/fixtures/test-vectors.json`

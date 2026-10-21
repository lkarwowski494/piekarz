# BRD Piekarz — reguły dziedzinowe i obliczeniowe (RD)

Stan: E2 · Aktualizacja: 2026-10-19 · Hierarchia: D-035. Reguły starego BRD o numerach 00–13 są wycofane i mają w nowym BRD tylko wpis w errata (E3); nowe zaczynają się od RD-14.

Każda reguła ma wzór, jednostki, granicę, podstawę i wektory. Wektory policzono skryptem niezależnym od kodu aplikacji (`rachunek-wektorow.mjs` w dowodach roli 01, poza repo); pochodzenie każdego wektora: źródło S, decyzja albo rachunek z metodą. Reguły krytyczne (RD-21, RD-22, RD-23) opierają się tylko na szczeblach 1–3 i trafiają do przeglądu roli 06 oraz człowieka. Po weryfikacji rejestr roli 06 (`docs/tresci/rejestr.json`) ma pierwszeństwo, a rozbieżność poprawia wpis ER. Wartości parametrów produktowych trafiają do modułu konfiguracji (rola 05).

### RD-14: Procent piekarski i hydratacja formuły całkowitej
- Wzór: `mz = Z / (1 + hz/100)`, `wz = Z − mz`, `M = Mc + mz`, `W = Wc + wz`, `H = W / M × 100`; każdy składnik `X% = mX / M × 100`
- Jednostki: Mc, Wc, Z, M, W [g]; hz, H [%]
- Granica: hz ≥ 0 (włączna); M > 0 (ostra); hz < 0 albo M = 0 to błędne dane
- Podstawa: S-01 (mąka = 100%; przy zaczynach procent liczony od sumy całej mąki i całej wody) i rachunek
- Krytyczna: nie
- Uproszczenie: zaczyn składa się tylko z mąki i wody; drożdże, sól i dodatki w zaczynie pominięte.

| ID | Mc [g] | Wc [g] | Z [g] | hz [%] | Oczekiwane: H [%] | Tolerancja | Rodzaj | Pochodzenie |
|---|---|---|---|---|---|---|---|---|
| RD-14-W1 | 900 | 630 | 200 | 100 | 73 | 0,01 | typowy | rachunek: mz = 100, M = 1000, W = 730 |
| RD-14-W2 | 1000 | 700 | 0 | 100 | 70 | 0,01 | typowy | rachunek: bez zaczynu |
| RD-14-W3 | 900 | 700 | 100 | 0 | 70 | 0,01 | granica | rachunek: zaczyn z samej mąki, mz = 100 |
| RD-14-W4 | 900 | 700 | 100 | −1 | błąd danych | — | poniżej | rachunek: poza granicą hz ≥ 0 |
| RD-14-W5 | 900 | 699 | 101 | 1 | 70 | 0,01 | powyżej | rachunek: mz = 100, wz = 1 |
| RD-14-W6 | 0 | 700 | 0 | 100 | błąd danych | — | błąd | rachunek: M = 0 |

### RD-15: Skalowanie formuły do masy ciasta: suma pokazanych ilości ±1 g
- Wzór: `M = masa / (Σp / 100)`; `mi = M × pi / 100`; mąka, woda i zakwas zaokrąglone do 1 g, sól i drożdże do 0,1 g; gdy `|masa − Σ pokazanych| > 1 g`, składnik z grupy mąka, woda, zakwas, którego zaokrąglenie najbardziej odeszło od potrzebnego kierunku, dostaje ±1 g; mąki mieszanki dzielą mąkę po korekcie metodą największej reszty (suma wierszy mąk = mąka). Każda pokazana ilość jest mniej niż 1 g od wartości dokładnej (ER-51)
- Jednostki: masa, mi [g]; pi [%]
- Granica: masa > 0 (ostra); różnica sumy pokazanych ilości od masy ≤ 1 g (włączna)
- Podstawa: rachunek; dokładność to parametr produktowy z decyzji DEC-11 (a) planu napraw M1 (2026-10-19: bilans składników w 1 g, test własności z tolerancją 1 g); wykładnia „sól i drożdże z 0,1 g, suma ±1 g”: ER-51 (DEC-19 a planu napraw M1, 2026-10-21), potwierdzona decyzją D-066 (3a); procenty względem mąki: S-01
- Krytyczna: nie

| ID | masa [g] | p: mąka / woda / sól [%] | Oczekiwane: mąka / woda / sól [g] | Tolerancja | Rodzaj | Pochodzenie |
|---|---|---|---|---|---|---|
| RD-15-W1 | 1720 | 100 / 70 / 2 | 1000 / 700 / 20 | 0 | typowy | rachunek: 1720 / 1,72 = 1000 |
| RD-15-W2 | 1000 | 100 / 70 / 2 | 581 / 407 / 11,6 | 0 | typowy | rachunek: 581,40; 406,98; 11,63; suma pokazanych 999,6 (różnica 0,4 g, bez korekty) |
| RD-15-W3 | 999 | 100 / 70 / 2 | 581 / 407 / 11,6 | 0 | typowy | rachunek: 999 / 1,72 = 580,81 → 581 (1 g); × 0,70 = 406,57 → 407 (1 g); × 0,02 = 11,62 → 11,6 (0,1 g); suma pokazanych 999,6 (różnica 0,6 g ≤ 1 g, bez korekty); decyzja D-066 (3a) |
| RD-15-W4 | 1 | 100 / 70 / 2 | 1 / 0 / 0 | 0 | granica | rachunek: najmniejsza dodatnia masa w gramach |
| RD-15-W5 | 0 | 100 / 70 / 2 | błąd danych | — | poniżej | rachunek: poza granicą masa > 0 |
| RD-15-W6 | 2 | 100 / 70 / 2 | 1 / 1 / 0 | 0 | powyżej | rachunek: 1,16; 0,81; 0,02 |
| RD-15-W7 | brak | 100 / 70 / 2 | błąd danych | — | błąd | rachunek: brak masy |

| ID | masa [g] | p: mąka / woda / sól / zakwas [%] | Oczekiwane: mąka / woda / sól / zakwas [g] | Tolerancja | Rodzaj | Pochodzenie |
|---|---|---|---|---|---|---|
| RD-15-W8 | 569 | 100 / 70 / 2 / 20 | 296 / 208 / 5,9 / 59 | 0 | powyżej | rachunek: 296,35; 207,45; 5,93; 59,27; zaokrąglenia dają 567,9 (różnica 1,1 g > 1 g), woda +1 g (największy błąd zaokrąglenia w dół, −0,45); suma pokazanych 568,9 |

### RD-16: Temperatura wody dla docelowej temperatury ciasta
- Wzór: `Tw = n × DDT − (Tm + Tp + Tt)` bez zaczynu (n = 3); `Tw = n × DDT − (Tm + Tp + Tz + Tt)` z zaczynem (n = 4)
- Jednostki: Tw, DDT, Tm, Tp, Tz [°C]; Tt (przyrost od tarcia) [°C]
- Granica: brak (wzór liniowy); wynik poniżej temperatury wody z kranu prowadzi do RD-18
- Podstawa: S-02 (mnożnik 3 bez zaczynu, 4 z zaczynem); rachunek: wzór działa w °C, bo przeliczenie °F = 1,8 × °C + 32 zachowuje równanie, a przyrost od tarcia przelicza się × 1/1,8
- Krytyczna: nie
- Uproszczenie: zakres docelowej temperatury ciasta pszennego po mieszaniu 75–78 °F, czyli ok. 24–26 °C (S-02); próg ostrzeżenia o zbyt gorącej wodzie [DO USTALENIA] (OP-34).

| ID | DDT [°C] | Tm [°C] | Tp [°C] | Tz [°C] | Tt [°C] | Oczekiwane: Tw [°C] | Tolerancja | Rodzaj | Pochodzenie |
|---|---|---|---|---|---|---|---|---|---|
| RD-16-W1 | 25 | 20 | 22 | — | 10 | 23 | 0,01 | typowy | rachunek: 3 × 25 − 52 |
| RD-16-W2 | 25 | 20 | 22 | 24 | 10 | 24 | 0,01 | typowy | rachunek: 4 × 25 − 76 |
| RD-16-W3 | 24,44 | 22,22 | 23,33 | — | 13,33 | 14,44 | 0,01 | typowy | S-02: przykład 76 × 3 − 72 − 74 − 24 = 58 °F, rachunek przeliczenia na °C |
| RD-16-W4 | 25 | brak | 22 | — | 10 | błąd danych | — | błąd | rachunek: brak temperatury mąki |

### RD-17: Czas fermentacji w zależności od temperatury
- Wzór: `t(T) = t24 × 3,0^((24 − T)/10)`
- Jednostki: t, t24 [min]; T [°C]
- Granica: 20 ≤ T ≤ 26 (włączna); temperatura w planie pochodzi tylko z wyboru w tym zakresie, więc wartość poza zakresem nie trafia do wzoru (D-066 2a, OP-35, ER-55)
- Podstawa: S-58 (model temperatury wzrostu, szczebel 2) i rachunek roli 06 w rejestrze (FER-Q10-002: Q10 = 3,0 dopasowane w 20–26 °C, błąd do 5,6% w 20–25 °C); t24 to czas z receptury użytkownika
- Krytyczna: nie
- Uproszczenie: jedna wartość Q10 dla drożdży i bakterii; dane in vitro przeniesione na ciasto. Q10 = 3,0 nie występuje w źródle dosłownie: to rachunek z modelu.

| ID | t24 [min] | T [°C] | Oczekiwane: t [min] | Tolerancja | Rodzaj | Pochodzenie |
|---|---|---|---|---|---|---|
| RD-17-W1 | 240 | 21 | 333,69 | 0,01 | typowy | rachunek: 240 × 3^0,3 |
| RD-17-W2 | 240 | 20 | 372,44 | 0,01 | granica | rachunek: 240 × 3^0,4 |
| RD-17-W3 | 240 | 26 | 192,66 | 0,01 | granica | rachunek: 240 × 3^−0,2 |
| RD-17-W4 | 240 | 24 | 240 | 0 | typowy | rachunek: wykładnik 0 |
| RD-17-W5 | 240 | 19,9 | poza zakresem: wartości nie da się wybrać | — | poniżej | rachunek: T < 20; decyzja D-066 (wybór tylko 20–26 °C) |
| RD-17-W6 | 240 | 26,1 | poza zakresem: wartości nie da się wybrać | — | powyżej | rachunek: T > 26; decyzja D-066 (wybór tylko 20–26 °C) |
| RD-17-W7 | brak | 22 | błąd danych | — | błąd | rachunek: brak czasu z receptury |

### RD-18: Masa lodu do schłodzenia wody
- Wzór: `L = W × (Tk − Tc) / (Lf/c + Tk)` dla Tc < Tk; `L = 0` dla Tc ≥ Tk
- Jednostki: L, W [g]; Tk, Tc [°C]; Lf [J/g]; c [J/(g·K)]; Lf/c ≈ 79,68 [°C]
- Granica: Tc < Tk (ostra) i Tc ≥ 0 (włączna); Tc < 0 to błędne dane
- Podstawa: rachunek bilansu ciepła (lód 0 °C topnieje i ogrzewa się do Tc, woda stygnie od Tk do Tc); c = 4,184 J/(g·K) z S-41; Lf = 333,4 J/g z S-42
- Krytyczna: nie
- Uproszczenie: lód w 0 °C, bez strat ciepła do otoczenia; W to łączna masa wody w recepturze (lód wlicza się do wody).

| ID | W [g] | Tk [°C] | Tc [°C] | Oczekiwane: L [g] | Tolerancja | Rodzaj | Pochodzenie |
|---|---|---|---|---|---|---|---|
| RD-18-W1 | 700 | 20 | 10 | 70,22 | 0,5 | typowy | rachunek: 7000 / 99,68 |
| RD-18-W2 | 700 | 20 | 20 | 0 | 0 | granica | rachunek: Tc = Tk |
| RD-18-W3 | 700 | 20 | 19,9 | 0,70 | 0,05 | poniżej | rachunek: 70 / 99,68 |
| RD-18-W4 | 700 | 20 | 20,1 | 0 | 0 | powyżej | rachunek: Tc > Tk, lód niepotrzebny |
| RD-18-W5 | 500 | 25 | 4 | 100,3 | 0,5 | typowy | rachunek: 10 500 / 104,68 |
| RD-18-W6 | 700 | 20 | −1 | błąd danych | — | błąd | rachunek: Tc < 0 |

### RD-19: Przeliczanie drożdży świeżych na suche
- Wzór: `msuche = mświeże × 0,4`; odwrotnie `mświeże = msuche / 0,4`
- Jednostki: msuche, mświeże [g]
- Granica: m ≥ 0 (włączna)
- Podstawa: S-40 (producent: 0,6 oz świeżych odpowiada 1/4 oz suchych, czyli 0,417 — rachunek), S-39 (producent: suche aktywne i instant wymienne 1:1), S-38 (świeże na suche aktywne × 0,4)
- Krytyczna: nie
- Uproszczenie: 0,4 zamiast 0,417 (różnica 4%). Rozbieżność: S-38 podaje dla instant × 0,33 (szczebel 3); wyższy szczebel (S-40, S-39) daje ok. 0,4 dla obu rodzajów suchych.

| ID | mświeże [g] | Oczekiwane: msuche [g] | Tolerancja | Rodzaj | Pochodzenie |
|---|---|---|---|---|---|
| RD-19-W1 | 10 | 4 | 0,1 | typowy | rachunek: 10 × 0,4 |
| RD-19-W2 | 25 | 10 | 0,1 | typowy | rachunek: 25 × 0,4 |
| RD-19-W3 | 0 | 0 | 0 | granica | rachunek |
| RD-19-W4 | −1 | błąd danych | — | poniżej | rachunek: poza granicą m ≥ 0 |
| RD-19-W5 | 0,1 | 0,04 | 0,01 | powyżej | rachunek: 0,1 × 0,4 |
| RD-19-W6 | brak | błąd danych | — | błąd | rachunek: brak masy |

### RD-20: Wariant żytni bez składań
- Wzór: `U = mżytnia / M × 100`; `U > 50` → wariant żytni (bez składań i bez wyrabiania do kształtu, D-030)
- Jednostki: mżytnia, M [g]; U [%]
- Granica: U > 50 (ostra)
- Podstawa: S-56 (w cieście żytnim nie tworzy się sieć białkowa jak w pszennym; definicja chleba żytniego > 50% mąki żytniej według niemieckich wytycznych, szczebel 2), D-030; S-57 (przewodnik: od 50% żyta ciasto „clay-like”, nie wyrabiać do kształtu, szczebel 4, atrybucja)
- Krytyczna: nie
- Uproszczenie: próg 50% to granica nazewnicza, nie reologiczna; S-57 mówi „at least 50%”, D-030 przyjęło granicę ostrą > 50%.

| ID | mżytnia [g] | M [g] | Oczekiwane: U [%] / wariant | Tolerancja | Rodzaj | Pochodzenie |
|---|---|---|---|---|---|---|
| RD-20-W1 | 600 | 1000 | 60 / żytni | 0,01 | typowy | rachunek; D-030 |
| RD-20-W2 | 500 | 1000 | 50 / pszenny | 0,01 | granica | rachunek: granica ostra (D-030) |
| RD-20-W3 | 501 | 1000 | 50,1 / żytni | 0,01 | powyżej | rachunek |
| RD-20-W4 | 499 | 1000 | 49,9 / pszenny | 0,01 | poniżej | rachunek |
| RD-20-W5 | 0 | 0 | błąd danych | — | błąd | rachunek: M = 0 |

### RD-21: Zasada ostrożności przy wyglądzie i zapachu zakwasu
- Wzór: jeśli zaznaczono pleśń, kolorowe plamy, biały nalot lub kożuch, przebarwienie albo zgniły zapach → „wyrzuć zakwas, nie wąchaj, umyj i wypłucz naczynie przed nowym”; jeśli zaznaczono tylko płyn o zapachu alkoholu → „według CSU Extension płyn o zapachu alkoholu jest w porządku (produkt uboczny fermentacji drożdży); można go zlać albo wmieszać” (brzmienie ZAK-HOO-001, bez „dokarm”: ER-54, D-066 4a, ER-55); bez zaznaczeń → brak werdyktu „zdrowy”
- Jednostki: objawy [-] (zbiór zaznaczeń użytkownika)
- Granica: brak (reguła jakościowa)
- Podstawa: S-43 (każda oznaka pleśni: nie używać; płyn o zapachu alkoholu jest w porządku; szczebel 3), S-44 (zielone, różowe, pomarańczowe plamy, zapach, przebarwienie; szczebel 3), S-45 (pleśń bywa biała; nie wąchać; szczebel 1); decyzja DEC-10 (a) planu napraw M1 (2026-10-19): każdy nalot, kożuch albo przebarwienie → wyrzuć
- Krytyczna: tak
- Uproszczenie: biały nalot traktowany jak pleśń, choć S-43 opisuje białe grudki drożdży na płynie w zakwasie z lodówki: rozróżnienie wymaga oceny, której aplikacja nie robi (DEC-10). Kolor płynu nie jest kryterium: źródła mówią tylko o zapachu alkoholu [DO USTALENIA] (OP-36).

| ID | Objawy [-] | Oczekiwane: komunikat [-] | Tolerancja | Rodzaj | Pochodzenie |
|---|---|---|---|---|---|
| RD-21-W1 | kolorowe plamy | wyrzuć, nie wąchaj, umyj naczynie | — | typowy | S-44, S-43, S-45 |
| RD-21-W2 | biały nalot | wyrzuć, nie wąchaj, umyj naczynie | — | typowy | S-45 (pleśń bywa biała); decyzja DEC-10 |
| RD-21-W3 | płyn o zapachu alkoholu | płyn jest w porządku (produkt uboczny fermentacji drożdży), atrybucja CSU Extension; można go zlać albo wmieszać | — | typowy | S-43; rejestr 06: ZAK-HOO-001 (brzmienie), ZAK-HOO-901 (bez „dokarm”); decyzja D-066 (4a) |
| RD-21-W4 | płyn o zapachu alkoholu i kolorowa plama | wyrzuć, nie wąchaj, umyj naczynie | — | typowy | S-43, S-44: pleśń przeważa |
| RD-21-W5 | brak zaznaczeń | brak werdyktu „zdrowy” ani „bezpieczny” | — | typowy | S-45 (strzępki pleśni bywają trudne do zauważenia); decyzja DEC-10; rejestr 06 wycofał ZAK-ZDR-900 |
| RD-21-W6 | niepełny formularz | brak werdyktu „bezpieczny”; prośba o uzupełnienie | — | błąd | S-45; decyzja DEC-10 |

### RD-22: Ostrzeżenie przed surową mąką, ciastem i zakwasem
- Wzór: krok z surową mąką, ciastem albo zakwasem (mieszanie, dokarmianie, zakładanie zakwasu, formowanie) → komunikat: „nie próbuj surowej mąki, ciasta ani zakwasu; umyj ręce mydłem pod bieżącą wodą i powierzchnie”; dzieci nie bawią się surowym ciastem
- Jednostki: rodzaj kroku [-]
- Granica: brak (reguła jakościowa)
- Podstawa: S-46 (nie jeść i nie próbować surowej mąki, ciasta; mycie rąk; domowe podgrzewanie mąki nie czyni jej bezpieczną; szczebel 1), S-43 (nie próbować surowego zakwasu; szczebel 3)
- Krytyczna: tak

| ID | Krok [-] | Oczekiwane: ostrzeżenie [-] | Tolerancja | Rodzaj | Pochodzenie |
|---|---|---|---|---|---|
| RD-22-W1 | mieszanie ciasta | tak | — | typowy | S-46 |
| RD-22-W2 | dokarmianie zakwasu | tak | — | typowy | S-43, S-46 |
| RD-22-W3 | studzenie upieczonego bochenka | nie | — | typowy | S-43: „The baking step will kill any bacteria present” |
| RD-22-W4 | krok nieznanego rodzaju | tak | — | błąd | rachunek: bezpieczna wartość domyślna |

### RD-23: Ostrzeżenie przed oparzeniem przy gorącym naczyniu, piecu i parze
- Wzór: krok z gorącym naczyniem albo piecem (wstawienie do rozgrzanego garnka, zdjęcie pokrywy, wyjęcie z pieca, kamień, piec do pizzy) → komunikat: „suche rękawice albo łapki; sprawdź, do jakiej temperatury są przeznaczone; pokrywę unoś od siebie (para); dzieci z dala od pieca”
- Jednostki: rodzaj kroku [-]
- Granica: brak (reguła jakościowa)
- Podstawa: S-47 (rękawica przy zdejmowaniu gorących pokryw; szczebel 3), S-48 (pokrywę unosić od twarzy i ręki, para; szczebel 3), S-50 (strefa bez dzieci ok. 3 stóp wokół kuchenki; szczebel 3), S-49 (rękawica producenta przeznaczona do 450 °F; szczebel 1 dla tego produktu)
- Krytyczna: tak
- Uproszczenie: bez liczby dla temperatury rękawic (S-49 dotyczy jednego produktu); kamień i piec do pizzy bez źródła szczebla 1–3 [DO USTALENIA] (OP-37).

| ID | Krok [-] | Oczekiwane: ostrzeżenie [-] | Tolerancja | Rodzaj | Pochodzenie |
|---|---|---|---|---|---|
| RD-23-W1 | zdejmij pokrywę garnka | rękawice i para: pokrywa od siebie | — | typowy | S-47, S-48 |
| RD-23-W2 | wstaw bochenek do rozgrzanego garnka | rękawice; dzieci z dala | — | typowy | S-47, S-50 |
| RD-23-W3 | dokarmianie zakwasu | brak | — | typowy | rachunek: krok bez gorącego naczynia |
| RD-23-W4 | krok nieznanego rodzaju w trakcie wypieku | rękawice | — | błąd | rachunek: bezpieczna wartość domyślna |

### RD-24: Założenie zakwasu od zera i gotowość
- Wzór: po dokarmieniu zakwas co najmniej podwaja objętość w czasie t2 ≤ 8 h, ma bąbelki i kwaśny zapach → gotowy; brak aktywności w pierwszej dobie → „to normalne, karm dalej”; brak podwojenia → karmić dalej co 12 h; oczekiwany czas założenia: kilka dni, średnio 7–10 dni
- Jednostki: t2 [h]; dzień [d]
- Granica: t2 ≤ 8 (włączna)
- Podstawa: S-44 (średnio 7–10 dni; szczebel 3), S-43 (kilka dni regularnego karmienia; gotowy, gdy bąbelkuje, rośnie i ma kwaśny zapach; szczebel 3), S-53 (przewodnik: pod koniec dnia 5 co najmniej podwojenie w 6–8 h; brak aktywności w pierwszej dobie możliwy; szczebel 4, atrybucja)
- Krytyczna: nie
- Uproszczenie: próg 8 h tylko z przewodnika (szczebel 4): w treści „według King Arthur Baking”. Pleśń w każdym dniu → RD-21. Test pływania nie potwierdza gotowości (S-55, szczebel 4).

| ID | dzień [d] | t2 [h] | Oczekiwane: stan [-] | Tolerancja | Rodzaj | Pochodzenie |
|---|---|---|---|---|---|---|
| RD-24-W1 | 6 | 6 | gotowy | — | typowy | S-53, S-43 |
| RD-24-W2 | 7 | 8 | gotowy | — | granica | S-53 |
| RD-24-W3 | 7 | 8,5 | karm dalej co 12 h | — | powyżej | S-53 |
| RD-24-W4 | 5 | 7,5 | gotowy | — | poniżej | S-53 |
| RD-24-W5 | 1 | brak podwojenia | to normalne, karm dalej | — | typowy | S-53 |
| RD-24-W6 | brak | brak | brak oceny; prośba o datę dokarmienia | — | błąd | rachunek |

### RD-25: Przypomnienie o dokarmieniu zakwasu
- Wzór: `termin = ostatnie dokarmienie + I`; I = 12 h na blacie, I = 7 d w lodówce; przypomnienie, gdy `teraz ≥ termin`
- Jednostki: I [h] albo [d]; czas [RRRR-MM-DD gg:mm]
- Granica: teraz ≥ termin (włączna)
- Podstawa: S-44 (dwa razy dziennie na blacie, raz w tygodniu w lodówce; szczebel 3); S-54 (przewodnik: raz na ok. 24 h na blacie, raz w tygodniu w lodówce; szczebel 4)
- Krytyczna: nie
- Uproszczenie: rozbieżność 12 h (S-44) a 24 h (S-54) rozstrzygnięta wyższym szczeblem; rytm użytkownika może być dłuższy, a odstęp to parametr produktowy w granicach źródeł [DO WYJAŚNIENIA] (OP-38).

| ID | Miejsce [-] | Ostatnie dokarmienie [czas] | Teraz [czas] | Oczekiwane: przypomnienie [-] | Tolerancja | Rodzaj | Pochodzenie |
|---|---|---|---|---|---|---|---|
| RD-25-W1 | blat | 2026-10-19 08:00 | 2026-10-19 20:00 | tak | 1 min | granica | rachunek: 08:00 + 12 h (S-44) |
| RD-25-W2 | blat | 2026-10-19 08:00 | 2026-10-19 19:59 | nie | 1 min | poniżej | rachunek |
| RD-25-W3 | blat | 2026-10-19 08:00 | 2026-10-19 20:01 | tak | 1 min | powyżej | rachunek |
| RD-25-W4 | lodówka | 2026-10-01 10:00 | 2026-10-08 10:00 | tak | 1 min | typowy | rachunek: + 7 d (S-44) |
| RD-25-W5 | blat | brak | 2026-10-19 20:00 | brak przypomnienia; prośba o wpis dokarmienia | — | błąd | rachunek |

### RD-26: Domyślna hydratacja zaczynu
- Wzór: poolish → 100%; biga → 50%; levain: dowolna w zakresie 50–125%, poza zakresem informacja „nietypowa hydratacja”
- Jednostki: hydratacja zaczynu [%]
- Granica: 50 ≤ hz ≤ 125 dla levainu (włączna)
- Podstawa: S-36 (poolish z definicji 100%; levain 50–125%; biga sztywna albo luźna do 100%; szczebel 3), S-61 (biga 50%; szczebel 3, niesprawdzone dosłownie)
- Krytyczna: nie
- Uproszczenie: biga 50% jako wartość domyślna do zmiany przez użytkownika.

| ID | Zaczyn [-] | hz [%] | Oczekiwane: wynik [-] | Tolerancja | Rodzaj | Pochodzenie |
|---|---|---|---|---|---|---|
| RD-26-W1 | poolish | — | 100 | 0 | typowy | S-36 |
| RD-26-W2 | biga | — | 50 | 0 | typowy | S-61 |
| RD-26-W3 | levain | 50 | typowa | — | granica | S-36 |
| RD-26-W4 | levain | 49 | nietypowa hydratacja | — | poniżej | S-36 |
| RD-26-W5 | levain | 126 | nietypowa hydratacja | — | powyżej | S-36 |
| RD-26-W6 | levain | brak | błąd danych | — | błąd | rachunek |

### RD-27: Typowy udział soli
- Wzór: `s = msól / M × 100`; 1,8 ≤ s ≤ 2,0 → typowy; poza zakresem informacja (nie blokada)
- Jednostki: msól, M [g]; s [%]
- Granica: 1,8 ≤ s ≤ 2,0 (włączna)
- Podstawa: S-37 (1,8–2% soli od masy mąki; szczebel 3)
- Krytyczna: nie

| ID | msól [g] | M [g] | Oczekiwane: s [%] / ocena | Tolerancja | Rodzaj | Pochodzenie |
|---|---|---|---|---|---|---|
| RD-27-W1 | 19 | 1000 | 1,9 / typowy | 0,01 | typowy | rachunek; S-37 |
| RD-27-W2 | 20 | 1000 | 2,0 / typowy | 0,01 | granica | rachunek; S-37 |
| RD-27-W3 | 20,1 | 1000 | 2,01 / poza typowym | 0,01 | powyżej | rachunek |
| RD-27-W4 | 17,9 | 1000 | 1,79 / poza typowym | 0,01 | poniżej | rachunek |
| RD-27-W5 | 20 | 0 | błąd danych | — | błąd | rachunek: M = 0 |

### RD-28: Zaczyn w formule (karta „Do miski”)
- Wzór: zaczyn liczony od mąki bazowej `F` (bez mąki zakwasu): `Fz = p/100 · F`, woda zaczynu `Wz = h/100 · Fz`, drożdże `Yz = y_z/100 · Fz`, sól `Sz = s_z/100 · Fz`; procenty formuły przed rachunkiem masy: `w_f = max(w, h · p/100)`, `s_f = max(s, s_z · p/100)`, `y_f = max(y, y_z · p/100)`; `F = M / (1 + (w_f + s_f + y_f + z)/100)`; wiersze „Do miski”: zaczyn cały (`Fz + Wz + Yz + Sz`, przy levainie także zakwas `Z`), mąka `F − Fz`, woda `W_f − Wz`, zakwas `Z` (poza levainem), sól `S_f − Sz`, drożdże `Y_f − Yz` (wiersz tylko > 0); wiersze gramowe w pełnych gramach, sól i drożdże co 0,1 g, suma wierszy = `M` ±1 g (korekta ±1 g jak w RD-15)
- Jednostki: M, F, Fz, Wz, Yz, Sz [g]; p, w, s, y, z, h, y_z, s_z, w_f, s_f, y_f [%] (p, h, y_z, s_z w % mąki zaczynu albo mąki bazowej, reszta w % mąki bazowej)
- Granica: 0 < p ≤ 100; p = 0 albo zaczyn „bezpośrednio” → karta bez grup zaczynu (procenty receptury bez zmian); p > 100 → błąd danych
- Podstawa: D-061 (model rachunku, DEC-23 a, wzór i zaokrąglenia), D-060 (parametry pâte fermentée: h = 75, y_z = 1, s_z = 2), DEC-11 a (zaokrąglenia ±1 g); parametry zaczynów z `PREFERMENT_DEFINITIONS` (poolish h = 100, y_z = 0,1; biga h = 50, y_z = 1); rachunek wektorów 2026-10-21
- Krytyczna: nie
- Uproszczenie: parametry poolish i bigi to wartości domyślne aplikacji, pâte fermentée to przykład BBGA (D-060), nie reguła.

| ID | Zaczyn [-] | p [%] | w / s / y [%] | M [g] | Oczekiwane: w_f / s_f / y_f [%]; wiersze „Do miski” [g] | Tolerancja | Rodzaj | Pochodzenie |
|---|---|---|---|---|---|---|---|---|
| RD-28-W1 | poolish | 30 | 70 / 2 / 0 | 1000 | 70 / 2 / 0,03; zaczyn 349, mąka 407, woda 233, sól 11,6 (suma 1000,6) | 1 g w sumie | typowy | rachunek: F = 1000 / 1,7203 = 581,29; Fz = Wz = 174,39; Yz = 0,17; zaczyn 348,95 → 349; mąka 406,91 → 407; woda 406,91 − 174,39 = 232,52 → 233; sól 11,63 → 11,6; drożdże 0,17 − 0,17 = 0 (bez wiersza); D-061 |
| RD-28-W2 | biga | 50 | 60 / 2 / 0,2 | — | 60 / 2 / 0,5 | 0,01 | typowy | rachunek: y_f = max(0,2; 1 · 0,5) = 0,5 (drożdże zaczynu w masie docelowej); D-061 reguła 2 |
| RD-28-W3 | pâte fermentée | 40 | 25 / 0,5 / 0 | — | 30 / 0,8 / 0,4 | 0,01 | typowy | rachunek: w_f = max(25; 75 · 0,4) = 30; s_f = max(0,5; 2 · 0,4) = 0,8; y_f = max(0; 1 · 0,4) = 0,4; D-061, D-060 |
| RD-28-W4 | poolish | 100 | 70 / 2 / 0 | — | 100 / 2 / 0,1 | 0,01 | granica | rachunek: cała mąka w zaczynie, w_f = max(70; 100) = 100; D-061 |
| RD-28-W5 | poolish | 0 | 70 / 2 / 0 | — | 70 / 2 / 0; karta bez grup zaczynu | 0 | poniżej | D-061 reguła 6 |
| RD-28-W6 | poolish | 101 | 70 / 2 / 0 | 1000 | błąd danych | — | powyżej | rachunek: udział mąki w zaczynie poza 0–100% (D-061) |
| RD-28-W7 | poolish | 30 | 70 / 2 / 0 | 0 | błąd danych | — | błąd | rachunek: M = 0 (RD-15) |

## Rozbieżności z kodem i rejestrem (do erraty E3 i ról 06, 07, 08)

- RD-17: silnik liczy czas także poza 20–26 °C bez komunikatu (`src/scheduler/reverse-scheduler.ts`), ale plan przyjmuje temperaturę tylko z wyboru 20–26 °C (`src/components/harmonogram/TargetReadyCard.tsx`), więc użytkownik nie dostaje liczby spoza modelu; według D-066 (2a) to nie rozbieżność kryterium (ER-55). Nowe wejście temperatury poza wyborem wymaga strażnika zakresu.
- RD-19: kod używa przelicznika 3:1 (0,33) dla drożdży (soczewka eksperta: `src/core/domain-rules.ts`, `convertYeast`); BRD przyjmuje 0,4 ze szczebla 1.
- RD-25 i RD-23: zgodne z kodem od 2026-10-20 (ER-50): przypomnienie po 12 h na blacie (`src/core/notification-config.ts`, `FEED_ROOM_TEMP_AFTER_MS`; D-043 pkt 4) i ostrzeżenie o rękawicach i parze przy zdejmowaniu pokrywki (`src/core/baking-phases.ts`, `safetyWarningPl`, RD-23-W1).
- Studzenie chleba żytniego: kod Doktora 2 h i 8 h, rejestr roli 06 24 h (ZYT-STU-001, szczebel 4).
- Próg ostrzeżenia 45 °C dla wody i progi faz zakwasu w godzinach (`src/core/sourdough-physics.ts`) bez źródła: OP-34, OP-39.

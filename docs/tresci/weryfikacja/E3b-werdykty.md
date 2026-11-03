# Weryfikacja E3b — katalog M3 (rola 06, tryb audit, niezależny weryfikator)

Data: 2026-11-03. Materiał: `docs/tresci/pl/katalog-m3.md` i `docs/tresci/en/katalog-m3.md` (163 linie, 84 zdania z ID + 11 nazw [T:-] w każdym języku; tagi PL i EN identyczne), `docs/tresci/rejestr.json` (KAT-*), `docs/tresci/wektory/katalog-m3-2026-11-03.json`, decyzje D-126, D-172, D-175, D-177, D-179.

## Jak sprawdzałem
- Źródła otwarte pod adresem: eAmbrosia 59722 (Altamura), 4h.extension.illinois.edu/media/3386, PDF-y gov.uk (Obwarzanek, Kołocz). sha256 pobranych plików = sha w rejestrze (743c40fc22ba, cdb429645615, 55b41953469b, 68faaed2f091), czyli kopie lokalne są wierne. Dz.U. C 38/2010, C 299/2010, C 434/2019, C 74/2022: kopie lokalne (sha zgodne z rejestrem). Do tego pobrałem z publications.europa.eu wersje FI i EN specyfikacji Karjalanpiirakka (C 434/12) oraz LV specyfikacji Rupjmaize (C 74/06), żeby sprawdzić tłumaczenie. PDF-y: `pdftotext -raw`.
- USDA FDC SR Legacy: wiersze food_portion.csv sprawdzone w samym zipie (nie tylko w wyciągu): 125 / 120 / 102 / 128 / 137 g za cup, 237 g wody, 7,2 g opakowania drożdży, 6 g łyżeczki soli, 4,2 g łyżeczki cukru, 13,6 g łyżki oleju, 244 g mleka, 227 g masła, 50 g jajka, 145 g rodzynek, 2,6 g cynamonu — wszystkie się zgadzają.
- Wszystkie rachunki przeliczyłem sam (Decimal, zaokrąglenie do 0,1). Wyniki: ILB 67,7 / 1,4 / 4,7 / 2,9 / 3,1; WW 69,1 / 1,4 / 4,8; żytni 74,6 / 1,5 / 5,2 (z ciemną 66,9 / 4,6); BUL 55,8 / 13,5 / 11,4 / 13,0 / 11,4 / 1,4 / 4,7; SLO 39,0 / 19,0 / 16,0 / 8,7 (9,1) / 16,0 / 1,9 / 6,6; wieniec 48,0 / 36,3 / 15,5 / 1,7; KOL 51,5 (34,3–73,6) / 25 / 6,25 (4,4–8,6); RUP 60–80 / 1,5–2 / 8–16 / 0,8–1 / 0,5–3 / 4–16; KAR 57,1–72,7 (środek 64,0); °F→°C: 400 → 204,4; 425 → 218,3; 350 → 176,7; 375 → 190,6; 100–110 °F → 37,8–43,3 °C. Zgodne z tekstem, rejestrem i wektorami. Drobne: dolne granice przedziałów ILB-006 (296,25/500 = 59,25 → w rejestrze 59,2, przy zaokrągleniu „połowa w górę” 59,3) i BUL-004 (11,85 → 11,8 zamiast 11,9) zaokrąglono „do parzystej”; to nie zmienia werdyktu.
- Poleceń dla AI w źródłach nie znalazłem (sprawdziłem wszystkie wyciągi tekstu).

## Liczby werdyktów
Zdania (84 pary PL/EN): POPARTE 69, CZĘŚCIOWO 13 (w tym 1 tylko w EN), NIEPOPARTE 1, SPRZECZNE 1, Do sprawdzenia 0.
Twierdzenia w rejestrze (49 użytych w tekście i 35 tylko w wektorach): SPRZECZNE 1 (KAT-KOL-002), CZĘŚCIOWO 3 (KAT-OBW-006, KAT-KAR-001, KAT-KAR-003), pozostałe POPARTE (z uwagami niżej).
Wektory: 11 z 11 programów maszyny zgodnych z D-179, blokada D-175 zgodna; 3 rodzaje wartości tekstowych bez ID (CZĘŚCIOWO).

## Krytyczne
1. **L105 „Gorąca woda grozi oparzeniem.” [T:KAT-OBW-006] — NIEPOPARTE.** Dz.U. C 38/2010 mówi tylko „zanurzanie surowego ciasta w wodzie o temperaturze minimalnej 90 °C”; o oparzeniach nic. Dopisek w rejestrze „(ryzyko oparzenia wrzątkiem)” nie ma cytatu, a do tego mówi „wrzątek”, choć źródło podaje ≥ 90 °C. Ostrzeżenie jest słuszne, tylko ma złe źródło. Poprawka: nowe twierdzenie BEZ-OPA-00x ze strony Brown Health, która już jest w rejestrze (https://www.brownhealth.org/centers-services/rhode-island-burn-center/avoiding-scalds, cytat sprawdzony dziś: „A large proportion of these injuries are related to scalding (burns caused by heated fluids)”). Zdanie oznaczyć tym ID, a z KAT-OBW-006 usunąć „(ryzyko oparzenia wrzątkiem)”.
2. **L67–69 (KAT-RUP-001, krytyczne): zaparzanie wodą o 85–95 °C (6–8 l), a w bloku nie ma ostrzeżenia o oparzeniu.** Przy obwarzanku ostrzeżenie jest, tu nie — dwie receptury z gorącą wodą są potraktowane różnie. Poprawka: po L68 dodać to samo zdanie co w L105, z tym samym nowym ID oparzeń. Same fakty w L67–68 są poparte.
3. **L132 masa serowa „… skórka z 1 cytryny i cukier waniliowy” [T:KAT-KOL-002] — SPRZECZNE.** W Dz.U. C 299/2010 pkt 3.3 cukier waniliowy należy do kruszonki („Posypka – kruszonka: — masło 0,35–0,45 kg, — mąka pszenna 0,70–0,90 kg, — cukier 0,35–0,45 kg, — cukier waniliowy.”). W masie serowej są: twaróg, żółtko, cukier, „aromat – skórka z 1 cytryny”, masło; dopuszcza się rodzynki i budyń. Wniosek EN, Step 3, mówi to samo: „mixing flour and vanilla sugar with butter and sugar”. Poprawka: w L132 i w KAT-KOL-002 usunąć „i cukier waniliowy”; w L133 i w KAT-KOL-003 dopisać „i cukier waniliowy” (EN: „and vanilla sugar”).
4. **D-126 (atrybucja): źródła katalogu (eAmbrosia, Dz.U./publications.europa.eu, Illinois 4-H, gov.uk, USDA FDC) nie są jeszcze w `src/` ani w `app/`** (grep nie znajduje adresów). Warunek wyjątku D-126 („każde źródło twierdzenia użytego w docs/tresci/pl jest na ekranie”) nie jest spełniony, dopóki rola 08 nie doda tych źródeł do ekranu „Źródła wiedzy”. To nie jest błąd zdania, tylko warunek wejścia tekstów do aplikacji.
5. KAT-KOL-006 (L131, L134) i KAT-OBW-006 (L104) jako fakty są poparte. Blokada opóźnionego startu dla kołocza, bułek, bułeczek i wieńca (mleko, jaja, twaróg, żółtka) w wektorach jest ustawiona (D-175).

## Tabela zdań
Numery linii są te same w PL i EN. P = POPARTE, C = CZĘŚCIOWO, N = NIEPOPARTE, S = SPRZECZNE.

| plik:linia | zdanie (skrót) | ID | werdykt | dlaczego (cytat) | minimalna poprawka |
|---|---|---|---|---|---|
| pl/en:8 | semolina durum, woda, sól morska, zakwas, bez drożdży | ALT-007 | P | „per ql. 1 di semola … kg. 20 (20%) di lievito naturale, kg 2 (2%) di sale marino, lt. 60 (60%) circa di acqua”; art. 2 „a lievito madre”; skład zamknięty, drożdży brak | — |
| :9 | formuła ze specyfikacji ChNP | ALT-001 | P | disciplinare DOP „Pane di Altamura” (wersja przesłana w 2004 po reg. 1291/2003) | uwaga: nie sprawdzono, czy później zmieniona (rejestr już to oznacza) |
| :12 | 100 kg : 20 kg zakwasu, 2 kg soli, ok. 60 l wody 18 °C | ALT-001 | P | jw.: „circa di acqua alla temperatura di 18° C” | — |
| :13 | 60% / 2% / 20% | ALT-007 | P | procenty podaje sama specyfikacja; w L13 brakuje „około” przy wodzie, ale L12 je ma | (opcjonalnie) „woda około 60%” |
| :14 | zakwas odświeża się ≥ 3 razy | ALT-002 | P | „ottenuto con minimo tre rinnovi … aggiunta di acqua e semola di grano duro” | — |
| :15 | miesienie 20 min, ramiona nurkujące | ALT-003 | P | „deve durare 20 minuti, utilizzando una impastatrice a bracci tuffanti” | — |
| :16 | płótno, ≥ 90 / 30 / ≥ 15 min | ALT-004 | P | „telo di cotone … almeno novanta minuti”; „trenta minuti”; „almeno quindici minuti” | — |
| :17 | piec 250 °C; 15 min otwarty, 45 zamknięty | ALT-005 | P | „raggiungere la temperatura di 250 °C … forno aperto. Dopo quindici minuti … chiudere la bocca del forno … altri quarantacinque minuti” | soczewka laika, patrz Pary |
| :23 | prosty chleb pszenny: woda, cukier, sól, olej, forma | ILB-001, -002 | P | „Basic Bread … water … yeast … sugar … salt … vegetable oil … all-purpose or bread flour”; „9” x 5” loaf pan” | — |
| :26 | „W przepisie … drożdże świeże 4,7%” | ILB-005 | C | Przepis podaje „1 package yeast” (rodzaj nieokreślony). 4,7% to suche 1,65% po przeliczeniu ÷ 0,35 (D-172). Słowa „w przepisie … drożdże świeże” sugerują, że przepis używa drożdży świeżych | „drożdże: 1 opakowanie suchych, w przeliczeniu na świeże 4,7%” (EN: „yeast: 1 packet of dry yeast, 4.7% as fresh yeast”) |
| :27 | przeliczone z miar objętościowych; 3–4 szklanki mąki uniwersalnej lub chlebowej | ILB-005, -001 | P | „3 to 4 cups all-purpose or bread flour” | soczewka innego kraju: „szklanka” ≠ cup |
| :28 | woda 100–110 °F | ILB-001 | P | „1 1/4 cups water, heated to 100 to 110 degrees F” | soczewka: dodać „(ok. 38–43 °C)” |
| :29 | wyrabianie 8–10 min, do podwojenia | ILB-002 | P | „knead … about 8 to 10 minutes”; „let dough rise until doubled in size” | — |
| :30 | forma 9×5 cali, do podwojenia | ILB-002 | P | „9” x 5” loaf pan … let rise until doubled” | soczewka: dodać „(ok. 23×13 cm)” |
| :31 | 400 °F ≈ 204 °C, 30–40 min | ILB-002 | P | „Bake at 400 degrees F for 30 to 40 minutes”; 204,4 °C | — |
| :37 | połowę mąki uniwersalnej zastępuje pełnoziarnista | ILB-003 | P | „Substitute whole wheat flour for half of the all-purpose flour” | — |
| :40 | najlepiej pół na pół z chlebową | ILB-003 | P | „For best quality, use half whole wheat and half bread flour” | — |
| :41 | woda 69,1%, sól 1,4%, drożdże świeże 4,8% | ILB-009 | C | Rachunek się zgadza (296,25/428,75), ale „drożdże świeże” to przeliczenie z opakowania suchych, jak w L26 | „drożdże (opakowanie suchych) w przeliczeniu na świeże 4,8%” |
| :42 | przeliczone z miar; 3–4 szklanki | ILB-009 | P | jw. | — |
| :43 | 8–10 min, do podwojenia, w formie znowu | ILB-002, -003 | P | wariant przepisu podstawowego | — |
| :44 | 400 °F ≈ 204 °C, 30–40 min | ILB-002, -003 | P | jw. | — |
| :50 | połowę zastępuje mąka żytnia | ILB-004 | P | „Substitute rye flour for half of the all-purpose flour” | — |
| :53 | najlepiej pół na pół z chlebową | ILB-004 | P | „use half rye flour and half bread flour” | — |
| :54 | woda 74,6%, sól 1,5%, drożdże świeże 5,2% | ILB-013 | C | jak L41 (296,25/397,25; 7,2/397,25/0,35 = 5,18) | „… w przeliczeniu na świeże 5,2%” |
| :55 | rodzaj żytniej nieznany → średnia | ILB-013 | P | przepis mówi tylko „rye flour”; USDA medium 102 g | — |
| :56 | wyrabianie i wyrastanie | ILB-002, -004 | P | jw. | — |
| :57 | 400 °F, 30–40 min | ILB-002, -004 | P | jw. | — |
| :63 | żytni na zaczynie, zaparzanie z kminkiem, scukrzanie słodem, bez drożdży | RUP-001, -002, -006 | P | „nie przewiduje się użycia drożdży piekarskich”; „Mąka … i kminek są ‚osładzane’, tj. zaparzane”; „wywołanego przez słód rozkładu skrobi na cukry” | EN „sweetened with rye malt” → lepiej „saccharified with rye malt” (słód rozkłada skrobię, nie jest słodzikiem) |
| :64 | ze specyfikacji GTS | RUP-006 | P | TSG-LV-1043-AM01 | — |
| :67 | z 10 kg mąki: 3 kg grubej żytniej, 0,08–0,1 kg kminku, 6–8 l wody 85–95 °C | RUP-001 (kryt.) | P | tabela: „grubej mąki żytniej 3 kg / nasion kminku 0,08–0,1 kg / gorącej wody 6–8 litrów … Temperatura wody: 85–95 °C”; LV „uz 10 kg miltu … 85–95 °C” | brak ostrzeżenia o oparzeniu (Krytyczne 2) |
| :68 | po zaparzeniu 63–68 °C | RUP-001 | P | „początkowa: 63–68 °C” | — |
| :69 | słód 50–300 g, 63–65 °C 2–4 h, chłodzenie i fermentacja 12–24 h | RUP-002 | P | „około 50–300 g niesfermentowanego słodu”; „2–4 godziny … (63–65 °C)”; „przez około 12–24 godziny” | — |
| :70 | 7–10 kg zaparzki + 0,4–1,6 kg zaczynu, 3–6 h, 35–36 °C | RUP-003 | P | tabela „Fermentacja zaparzonej mąki” | — |
| :71 | ciasto 7–12 / 7–10 / 0,8–1,6 / 0,15–0,2 kg; 2–3 h, 30–34 °C | RUP-004 | P | tabela „Ciasto” | — |
| :72 | najwyżej 10% mąki pszennej | RUP-004 | P | „można dodać maksymalnie 10 % mąki pszennej” | — |
| :73 | % przy 10 kg = 100% | RUP-007 | P | rachunek zgodny; sama specyfikacja podaje „około 0,8 % kminku, 8–16 % cukru i do 3 % … słodu”; zastrzeżenie „gdy 10 kg” jest w zdaniu | — |
| :74 | palenisko 280–350, potem 200–250 °C, 1–2 h | RUP-005 | P | „(280–350 °C) … (200–250 °C). Trwa ono w przybliżeniu od godziny do dwóch godzin” | soczewka laika |
| :75 | smaruje pastą skrobiową lub wodą | RUP-005 | P | „gorące bochenki smaruje się pastą skrobiowa lub wodą” | — |
| :81 | cienkie, otwarte; mąka, woda, sól, „bez spulchniacza”; ryż lub jęczmień | KAR-001, -002, -004 | C | Specyfikacja wymienia skład („Ciasto zagniata się z wodą, solą i mąką żytnią lub pszenną”; FI „Kuoritaikinaan laitetaan vettä, suolaa ja ruis- tai vehnäjauhoja”), ale słów „bez spulchniacza” nie zawiera — to wniosek z zamkniętej listy, podany jak treść źródła | „…z ciasta z mąki, wody i soli (specyfikacja nie wymienia spulchniacza)…” albo oznaczyć jako uproszczenie w KAT-KAR-001 |
| :82 | ze specyfikacji GTS | KAR-001 | P | TSG-FI-0015-AM01 | — |
| :85 | „Według specyfikacji … 275–350 g mąki …, 200 g wody i soli, bez środka spulchniającego” | KAR-001 | C | Oryginał FI: „noin 275–350 g jauhoja”, EN OJ: „About 275-350 g of flour”; w PL Dz.U. brak „około”. Zastrzeżenia „bez środka spulchniającego” źródło nie zawiera (jak L81) | „z około 275–350 g mąki …, 200 g wody i soli; środka spulchniającego specyfikacja nie wymienia” |
| :86 | woda 57,1–72,7%; ilości soli brak | KAR-005 | P | 200/350 i 200/275; „Kaszę lub ryż można posolić” — ilości soli w cieście brak | — |
| :87 | 1 l wody/mleka/napoju mlecznego + 2 dl (180 g) ryżu lub jęczmienia | KAR-002 | P | „1 litr (1 kg) wody, mleka lub napoju mlecznego bez laktozy … 2 dl (180 g) ryżu lub jęczmienia” (FI „ohraryynejä” = kasza, nie płatki) | — |
| :88 | ryż ½–1 h, kasza dłużej | KAR-002 | P | „Ryż gotuje się od pół godziny do godziny, a kaszę jęczmienną dłużej” | — |
| :89 | do przejrzystości, 10–24 cm | KAR-004 | P | „aż do osiągnięcia przejrzystości … o średnicy lub długości 10–24 cm” | — |
| :90 | 1–2 cm od brzegu, karbowanie, środek otwarty | KAR-004 | P | „1 cm lub 2 cm od krawędzi … pokarbowane brzegi … środek pozostawał otwarty” | — |
| :91 | „w bardzo gorącym piecu, w 250–300 °C, 15–20 min” | KAR-003 | C | FI: „korkeassa, noin 250–300 °C:n lämmössä”, EN OJ: „very high temperature of about 250–300 °C”; w zdaniu brak „około” (PL Dz.U. pominął „noin”) | „w około 250–300 °C” (EN „at about 250–300 °C”) |
| :97 | pierścień z drożdżowego ciasta pszennego, warzony | OBW-001, -006 | P | „sporządzanie ciasta drożdżowego … obwarzanie” | — |
| :98 | ChOG „Obwarzanek krakowski” | OBW-001 | P | PL-PGI-005-0674 | — |
| :101 | „na 100 kg mąki pszennej … 40–48 l wody, 1–2 kg drożdży, 1–1,5 kg soli, 2–3 kg tłuszczu, 2–4 kg cukru” | OBW-002, -003, -004 | C | Liczby zgodne („Na 100 kg mąki stosuje się: tłuszcz 2–3 kg, cukier 2–4 kg, drożdże 1–2 kg, sól 1–1,5 kg, woda do ciasta 40–48 l”), ale źródło mówi „mąki”, a do 30% może być żytnia | „na 100 kg mąki” (EN „100 kg of flour”) |
| :102 | do 30% żytniej | OBW-001 | P | Dz.U.: „zastąpienie 30 % mąki pszennej mąką żytnią”; wniosek EN: „up to 30% is permitted” | uwaga: dopisać cytat EN do KAT-OBW-001, bo „do” mówi dopiero wniosek |
| :103 | jednofazowo; od kilku minut latem do godziny zimą | OBW-005 | P | „metodą jednofazową … od kilku minut w sezonie letnim do godziny w okresach zimowych” | — |
| :104 | po podgarowaniu, ≥ 90 °C, do wypłynięcia, dekoracja, pieczenie | OBW-006 (kryt.) | P (PL) / C (EN) | „temperaturze minimalnej 90 °C … warzy się do momentu wypłynięcia … dekorowane i pieczone”. EN „After a short proof” dodaje „short”, czego KAT-OBW-006 (Dz.U.) nie mówi (mówi to dopiero wniosek EN: „After a few minutes of proving”) | EN „After proofing, …” |
| :105 | „Gorąca woda grozi oparzeniem.” | OBW-006 | N | źródło nie mówi nic o oparzeniu (Krytyczne 1) | nowe ID BEZ-OPA (Brown Health) |
| :106 | wg wniosku 250–320 °C, 10–17 min | OBW-012 | P | „baked at a temperature of 250-320°C for 10-17 minutes until the desired colour and size are achieved” | — |
| :107 | 12–17 cm, splot 2–4 cm, 80–120 g | OBW-007 | P | „średnica 12–17 cm, grubość splotu 2–4 cm, waga 80–120 g” | — |
| :113 | mleko, masło, jajko; 24 szt. | BUL-001 | P | „Yield: 24 rolls … milk … butter or margarine … 1 egg” | (opcjonalnie) „z masłem lub margaryną” |
| :116 | % … „drożdże świeże 4,7%” | BUL-003 | C | rachunek zgodny; „1 package yeast” — jak L26 | „… drożdże (opakowanie suchych) w przeliczeniu na świeże 4,7%” |
| :117 | przeliczone; 3–4 szklanki | BUL-003, -001 | P | „3 to 4 cups all-purpose flour” | — |
| :118 | mleko i woda 100–110 °F | BUL-001 | P | „1 cup milk, heated to 100 to 110 degrees F”, „1/4 cup water, heated to 100 to 110” | soczewka: „(ok. 38–43 °C)” |
| :119 | wyrabianie ok. 10 min | BUL-001 | P | „Knead … about 10 minutes” | — |
| :120 | 400–425 °F ≈ 204–218 °C, 10–12 min | BUL-002 | P | „Bake rolls at 400 to 425 degrees F until golden brown, 10 to 12 minutes” | — |
| :126 | placek drożdżowy na mleku, masa serowa, kruszonka, blacha | KOL-001..004 | P | pkt 3.2–3.3 (wariant z nadzieniem serowym); Step 5 „greased baking tray” | — |
| :127 | ChOG „Kołocz śląski” | KOL-001 | P | PL-PGI-0005-0728 | — |
| :130 | skład ciasta drożdżowego | KOL-001 | P | pkt 3.3, wszystkie liczby zgodne | — |
| :131 | 0,8 kg = 100%: mleko 51,5%, cukier/jaja/masło po 25%, drożdże 6,25% | KOL-006 (kryt.) | C | Rachunek się zgadza, ale to środki przedziałów (L130 podaje przedziały), czego zdanie nie mówi; 51,5% przyjmuje gęstość mleka 1,03 | „licząc środki przedziałów, gdy 0,8 kg mąki to 100%…” |
| :132 | masa serowa … „i cukier waniliowy” | KOL-002 | S | cukier waniliowy jest w kruszonce, nie w masie serowej (Krytyczne 3) | usunąć „i cukier waniliowy” |
| :133 | kruszonka: masło, mąka, cukier | KOL-003 | C | lista bez „cukier waniliowy” (pkt 3.3; Step 3) | dopisać „i cukier waniliowy” |
| :134 | ciasto: mleko i jaja; masa: twaróg i żółtka | KOL-006, -002 | P | pkt 3.3 | — |
| :135 | zaczyn 10–20 min, 25–30 °C | KOL-010 | P | „left to ferment or rise for approximately 10–20 minutes at a temperature ranging between 25°C and 30°C” | — |
| :136 | potem mąka, jaja, tłuszcz, sól; czasu wniosek nie podaje | KOL-010 | P | „allowed to ferment further for rising.” (bez czasu) | — |
| :137 | ok. 1,5 cm | KOL-011 | P | „thickness (about 1.5 cm)” | — |
| :138 | 180–200 °C, 30–60 min | KOL-011 | P | „baked at a temperature of 180–200°C for 30–60 minutes, until the desired degree of baking” | soczewka laika: czas dla blachy 40×60 |
| :139 | 3,5 cm, 40×60 cm, 5–6 kg | KOL-004 | P | „wysokości ok. 3,5 cm (± 0,5 cm) … 40 × 60 cm (± 5 cm) … ok. 5–6 kg” | — |
| :145 | słodkie ciasto, mleko, jajka; 24 szt. | SLO-001 | P | „Basic Sweet Dough Yield: 24 rolls … milk … 2 eggs” | — |
| :148 | % … „drożdże świeże 6,6%” | SLO-004 | C | rachunek zgodny (14,4/625/0,35 = 6,58); „2 packages yeast” — jak L26 | „… w przeliczeniu na świeże 6,6%” |
| :149 | przeliczone; ok. 5 szklanek | SLO-004 | P | „5 cups all-purpose flour, approximately” | — |
| :150 | pierwsze wyrastanie ok. 1 h | SLO-001 | P | „until doubled in size, about 1 hour” | — |
| :151 | 350 °F ≈ 177 °C; w formie 25, pojedyncze 20 min | SLO-002 | P | „25 minutes for pan rolls, or 20 minutes for individual rolls” | — |
| :152 | placek drożdżowy 30 min | SLO-002 | P | „30 minutes for coffeecakes” | — |
| :158 | wieniec z połowy ciasta; cukier, cynamon, masło, rodzynki | SLO-003 | P | „1/2 prepared sweet dough recipe, 3/4 cup sugar, 2 teaspoon cinnamon, 1/2 cup melted butter, 1/3 cup raisins” | — |
| :161 | te same proporcje …, „drożdże świeże 6,6%” | SLO-008 | C | jak L148 | „… w przeliczeniu na świeże 6,6%” |
| :162 | nadzienie 48,0 / 36,3 / 15,5 / 1,7% | SLO-008 | P | 150 g, 113,5 g, 48,3 g, 5,2 g ÷ 312,5 g | uwaga: przepis każe masłem „Brush lightly”, więc pół szklanki to ilość z listy składników, nie ilość zużyta na pewno |
| :163 | 375 °F, ok. 25 min | SLO-003 | P | „Bake at 375 degrees F for about 25 minutes” | soczewka: dodać „czyli około 191 °C” (rachunek do KAT-SLO-003), jak w L31/L151 |

Nazwy [T:-] (L5, 20, 34, 47, 60, 78, 94, 110, 123, 142, 155): faktów ponad opis nie dodają. Wyjątki: L78 „Otwarte pierożki **żytnie** z nadzieniem **ryżowym**” to wybór jednego wariantu (specyfikacja dopuszcza mąkę pszenną i nadzienie z jęczmienia lub ziemniaków) — dopuszczalne, jeśli receptura w kodzie jest żytnia i ryżowa (wektor: `kategoria: rye`). O nazwach chronionych — w Parach.

## Pary zdań i soczewki
**EN = PL.** Treść jest ta sama we wszystkich 84 parach z dwoma wyjątkami: L104 EN „After a short proof” (dodane „short”; poprawka wyżej) i L63 EN „sweetened with rye malt” (PL „scukrza”, czyli rozkład skrobi; poprawka „saccharified”). Zdania trybu rozkazującego w EN (L29, L31 i inne) przy opisowych w PL — treść bez zmian.

**Laik (dosłowność).**
- L17: „pierwsze 15 minut przy otwartym piecu” / EN „with the oven open”. Domowy piekarz przeczyta to jako „otwórz drzwiczki piekarnika na 15 minut”. Specyfikacja mówi o otwartej „bocca del forno” pieca opalanego drewnem. Poprawka: „przy otwartym otworze pieca piekarskiego (piec opalany drewnem lub gazem)”; jak to przenieść na piekarnik domowy — luka dla ról 01/08 (rejestr ALT-005 [DO USTALENIA]).
- L12, L67–71, L101, L130–133: ilości na 100 kg, 10 kg i blachę 40×60 cm podane wprost. Zastrzeżenie, że to ilości przemysłowe, jest tylko w komentarzu HTML (L2), którego użytkownik nie zobaczy. Zdania mówią „według specyfikacji” i „na 100 kg”, więc nie wprowadzają w błąd. Brakuje jednak jednego zdania, że aplikacja przeskaluje ilości na porcję domową — to zachowanie aplikacji (rola 08), nie fakt.
- L74 (palenisko 280–350 °C), L91 (250–300 °C), L106 (250–320 °C): temperatury powyżej typowego piekarnika domowego, bez słowa o tym w tekście. Fakt „piekarnik domowy zwykle nie osiąga 300 °C” nie ma źródła w rejestrze (KAT-KAR-003 UW), więc wpisanie go wymaga twierdzenia. Rekomendacja: zdanie [T:-] bez faktu, np. „To temperatura pieca piekarskiego; ustaw najwyższą temperaturę swojego piekarnika” — decyzja ról 01/08.
- L138: 30–60 min dotyczy blachy 40×60 cm (5–6 kg); dla mniejszej blachy źródło nic nie mówi (KAT-KOL-011 UW). W zdaniu dopisać „(dla blachy 40×60 cm)”.
- L69: utrzymanie 63–65 °C przez 2–4 h wymaga termometru i źródła ciepła — luka wykonawcza (KAT-RUP-002 UW).

**Ekspert (bezpieczeństwo).**
- Gorąca woda: L104–105 (obwarzanek) — ostrzeżenie jest, ale bez źródła (Krytyczne 1). L67 (85–95 °C, 6–8 l) — ostrzeżenia nie ma (Krytyczne 2).
- Nabiał i jajka: kołocz (mleko, jaja, twaróg, żółtka), bułki (mleko, jajko), bułeczki i wieniec (mleko, jajka) mają w wektorach `blokada_opoznionego_startu: true` zgodnie z D-175. Pierożki karelskie: blokada `true` z powodu mleka w nadzieniu, choć ciasto (to, co trafia do maszyny w programie „ciasto”) ma tylko mąkę, wodę i sól. To kierunek bezpieczny, opisany w wektorze; do potwierdzenia przez rolę 01.
- Zaparzka po scukrzaniu chłodzi się i fermentuje 12–24 h. Specyfikacja uzasadnia to fermentacją mlekową („hamuje rozwój niepożądanych mikroorganizmów”); tekst nie dodaje tu żadnej obietnicy bezpieczeństwa — w porządku.

**Inny kraj (jednostki, nazwy chronione).**
- PL L27, L42, L117, L149: „szklanki” — w Polsce szklanka to zwyczajowo 250 ml, a przepis i rachunek używają amerykańskiego cup (237 ml, KAT-WAG-026). Poprawka: „3–4 amerykańskie szklanki (cup, ok. 237 ml)”.
- PL L28, L118: °F bez °C (37,8–43,3 °C); PL L30: cale bez cm (22,9×12,7 cm); PL/EN L163: brak °C (190,6 °C). Wektor wieńca ma `temp_c: null` z tą samą luką. Poprawka: dopisać rachunek do KAT-ILB-001, KAT-BUL-001 i KAT-SLO-003, potem do zdań.
- EN (American English, D-127): temperatury z receptur UE są tylko w °C (L17, L67–74, L91, L104–106, L135–138), a dla czytelnika z USA brakuje °F. Ilości w l, dl i kg są podane jak w źródle. Rekomendacja: °F w nawiasie (rachunek), decyzja roli 04/06.
- Nazwy chronione (D-177): „Chleb z semoliny durum na zakwasie”, „Otwarte pierożki…” i nazwy EN są opisowe. „Do sprawdzenia” (prawnie, rola 01): „Łotewski parzony chleb żytni” / „Latvian scalded rye bread” to niemal dosłowne tłumaczenie GTS „Salinātā rudzu rupjmaize” (salināta = zaparzony/osłodzony, rudzu = żytni, rupjmaize = chleb razowy) z dodanym krajem. Ochrona GTS obejmuje też evocation/imitation, a D-177 odrzuciło dopiski „w stylu” z tego samego powodu. Bezpieczniej: „Chleb żytni z parzoną mąką na zaczynie”. „Obwarzanek parzony” i „Kołacz drożdżowy…” używają słów rodzajowych („obwarzanek” — Słownik staropolski cytowany w Dz.U.; „kołacz” — ogólna nazwa ciasta drożdżowego), bez przymiotnika geograficznego. Niskie ryzyko, ale w połączeniu z opisem „Formuła pochodzi z … ChOG …” warto, żeby rola 01 to potwierdziła.

## Twierdzenia w rejestrze
| ID | werdykt | dlaczego | minimalna poprawka |
|---|---|---|---|
| KAT-KOL-002 | S | „cukier waniliowy” przypisany masie serowej; w Dz.U. pkt 3.3 i we wniosku (Step 3) należy do kruszonki | przenieść do KAT-KOL-003 |
| KAT-OBW-006 (kryt.) | C | część faktowa poparta; dopisek „(ryzyko oparzenia wrzątkiem)” bez cytatu, a „wrzątek” ≠ „minimalna 90 °C” | usunąć dopisek; oparzenie jako osobne twierdzenie z Brown Health |
| KAT-KAR-001 | C | „bez środka spulchniającego” nie stoi w źródle (wniosek z zamkniętej listy); brak „około” przy 275–350 g (FI „noin”, EN „About”) | „około 275–350 g”; zakaz spulchniacza oznaczyć jako uproszczenie |
| KAT-KAR-003 | C | FI/EN: „noin/about 250–300 °C”; PL Dz.U. pomija „około” | „około 250–300 °C”, cytat FI/EN w źródłach |
| KAT-OBW-001 | P (uwaga) | Dz.U.: „zastąpienie 30 %”, a tekst i wektor mówią „do 30%” — górną granicę podaje dopiero wniosek EN („up to 30%”) | dopisać cytat z wniosku EN |
| KAT-ALT-001…005, -007…-010 | P | cytaty znalezione w disciplinare (PDF eAmbrosia, sha zgodne) | ALT-001: aktualność specyfikacji 2003/2004 [DO USTALENIA] już oznaczona |
| KAT-ILB-001…016, KAT-BUL-001…006, KAT-SLO-001…011 | P | cytaty i wagi USDA zgodne, rachunki powtórzone | uproszczenia nazwane (rodzaj drożdży, 3,5 szklanki, żytnia średnia); dopisać rachunki °C dla 100–110 °F i 375 °F |
| KAT-RUP-001…010 | P | tabela i opis pkt 4.2 (PL), liczby zgodne z wersją LV | — |
| KAT-KAR-002, -004, -005, -006, -008 | P | pkt 4.1–4.2 | — |
| KAT-OBW-002…005, -007…-013 | P | Dz.U. C 38/2010 pkt 3.2–3.5; wniosek EN Stage 7 | — |
| KAT-KOL-001, -003…-011 | P | Dz.U. C 299/2010 pkt 3.2–3.3; wniosek EN Steps 1, 4, 6 | KOL-003: dopisać cukier waniliowy |
| KAT-WAG-001…029 (użyte) | P | wiersze food_portion.csv w zipie | — |

## Wektory
- **ID przy wartościach.** Każda wartość liczbowa ma ID, a ID istnieją w rejestrze. Pozycje „otwarte” (ALT-006, KAR-007, KOL-008, KOL-012) są oznaczone jako otwarte. Bez ID są wartości tekstowe będące faktami: `kroki.forma: "9×5 cali"` (3 receptury ILB) → KAT-ILB-002; `kroki.wyrastanie: "do podwojenia…"` (3×) → KAT-ILB-002; `karelian_rye_pasties.formula.nadzienie.plyn` → KAT-KAR-002. Werdykt CZĘŚCIOWO, poprawka: dodać pole `twierdzenie`. Nazwy, kategorie, etykiety składników, `maszyna.program` (reguła D-179 z polem `twierdzenia`) i `blokada_opoznionego_startu` (reguła D-175 z polem `podstawa`) to reguły aplikacji, nie fakty — w porządku.
- **Zgodność z twierdzeniami.** Wszystkie wartości zgadzają się z rejestrem (środki przedziałów; 1,25 → 1,3; 1,75 → 1,8; 6,25 → 6,3). Woda w obwarzanku 44 jest z Dz.U. (OBW-009), a nie z wniosku (OBW-013) — zgodnie z hierarchią. RUP `woda_proc` 70 to tylko woda do zaparzenia, przy 10 kg mąki (zastrzeżenie 10–13 kg jest w `uwagi`). Wieniec: `temp_c: null` — luka (patrz soczewki).
- **D-179 (pierwsza pasująca reguła).** durum (bochenek formowany i pieczony w piecu) → ciasto ✓; white_pan_loaf (forma, cukier i olej, 0% pełnoziarnistej) → podstawowy ✓ (reguła 4 odpada, bo jest cukier i tłuszcz); half_whole_wheat (50% pełnoziarnistej) → pełnoziarnisty ✓; half_rye (50% żytniej) → pełnoziarnisty ✓ (reguła 3 łączy pełnoziarniste i żytnie); latvian (palenisko) → ciasto ✓; karelian (pierożki w regule 1) → ciasto ✓; obwarzanek → ciasto ✓; bułki → ciasto ✓; kołocz (`sweet`, ale reguła 1 ma pierwszeństwo) → ciasto ✓; bułeczki i wieniec (`sweet`, reguła 1) → ciasto ✓. 11/11 zgodnych. W uzasadnieniu RUP dodano „zaparzanie … trwa godzinami”, czego reguła nie wymaga — nieszkodliwe.
- **D-175.** Blokada `true`: bułki, kołocz, bułeczki, wieniec (mleko, jaja; kołocz także twaróg i żółtka) ✓; pierożki (mleko w nadzieniu, kierunek bezpieczny, do roli 01). `false`: durum, 3× ILB (bez wariantu „Milk as the Liquid”), RUP, obwarzanek (tłuszcz może być masłem, ale masła nie ma na liście D-175; posypka z sera jest w Dz.U., ale nie w recepturze) ✓.
- **Kategorie.** durum `sourdough`, ILB `yeast` i `rye`, RUP `rye`, KAR `rye` (mąka żytnia lub pszenna — wybór wariantu), obwarzanek i bułki `yeast`, kołocz, bułeczki i wieniec `sweet` — spójne z tekstem.

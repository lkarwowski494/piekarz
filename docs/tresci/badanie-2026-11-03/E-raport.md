# E: wagi miar i procenty piekarskie katalogu D-177 (rola 06, odczyt 2026-11-03)

90 wpisów (`wpisy.json`): 29 wag `KAT-WAG-*`, 61 formuł i luk. Wszystkie cytaty sprawdziłem dosłownie na tekście kopii (`E_skrypty/build.py`, wynik 0 braków). Wagi pochodzą z pliku USDA FDC SR Legacy CSV, pobranego w całości z fdc.nal.usda.gov (szczebel 1; API DEMO_KEY odpowiadało OVER_RATE_LIMIT). Objętości miar są z NIST HB 44-2025 App. C. Drożdże świeże liczyłem jako suche ÷ 0,35 według D-172. ZASADY.md mówią jeszcze ÷ 0,4 (RD-19), co jest nieaktualne, a D-172 to zmienia. W tabeli są wartości dla kodu (środek przedziału, zaokrąglone do 0,1).

| Receptura | Procenty piekarskie (mąka = 100) | ID wpisów | Luki |
|---|---|---|---|
| Altamura (semolina, zakwas) | woda 60, sól 2, zakwas 20, drożdże 0 | ALT-007..010 | woda w zakwasie nieliczona |
| Chleb podstawowy Illinois | woda 67,7 (59–79), sól 1,4, drożdże św. 4,7, cukier 2,9, olej 3,1 | ILB-005..008 | mąka „3–4 szklanki”: środek |
| Pół-pełnoziarnisty Illinois | woda 69,1, sól 1,4, drożdże św. 4,8 | ILB-009..012 | jw. |
| Pół-żytni Illinois | woda 74,6, sól 1,5, drożdże św. 5,2 | ILB-013..016 | rodzaj mąki żytniej nieznany (średnia 102 g; ciemna 128 g → woda 66,9) |
| Rupjmaize (parzony żytni) | woda 60–80 (70), sól 1,5–2 (1,8), cukier 8–16, kminek 0,8–1, słód 0,5–3, zaczyn 4–16, drożdże 0 | RUP-007..010 | przy 13 kg mąki woda 46–62 |
| Pierożki karelskie | woda 57–73 (64,0), drożdże 0 | KAR-005..008 | sól bez ilości (KAR-007 otwarte) |
| Obwarzanek | woda 40–48 (44), sól 1–1,5 (1,3), drożdże 1–2 (1,5, przyjęte jako świeże), cukier 2–4, tłuszcz 2–3; piec 250–320 °C 10–17 min | OBW-008..013 | sprzeczność co do wody (niżej) |
| Bułki obiadowe Illinois | mleko 55,8, woda 13,5, cukier 11,4, masło 13,0, jajko 11,4, sól 1,4, drożdże św. 4,7 | BUL-003..006 | jajko „large” to założenie |
| Kołocz (ciasto) | mleko 51,5 (34–74), woda 0, cukier/jaja/masło po 25 (11–43), drożdże 6,25 → 6,3; zaczyn 10–20 min 25–30 °C; piec 180–200 °C 30–60 min | KOL-006..012 | sól bez ilości; czas fermentacji i garowania (KOL-012 otwarte) |
| Słodkie ciasto Illinois | mleko 39,0, woda 19,0, cukier 16, olej 8,7, jajka 16, sól 1,9, drożdże św. 6,6 | SLO-004..007 | mąka „ok. 5 szklanek” bez przedziału |
| Wieniec cynamonowy | ciasto jak wyżej; nadzienie: cukier 48, masło 36,3, rodzynki 15,5, cynamon 1,7 | SLO-008..011 | — |
| Szybki orkiszowy USU (war.) | woda 0, drożdże 0; przy założeniu 120 g/szkl.: maślanka 81,7, sól 0,5, proszek 3,1, soda 1,5, olej 9,3, jajko 16,7, cukier 8,4 | ORK-004..007 | waga szklanki mąki orkiszowej (WAG-006, ORK-004, -006 otwarte) |
| Piadina (war.) | sól ≤2,5, tłuszcz ≤25, spulchniacz ≤2, mleko ≤30 (opcja), miód ≤2, drożdże 0 | PIA-005..008 | woda: brak liczby także w 2014 (PIA-006 otwarte) |
| Dresdner Stollen (war.) | masło 50, sułtanki 65, skórka 20, migdały 15 | STO-002..005 | mąka typ 405/550 bez ilości do reszty; drożdże, cukier, mleko, sól (otwarte) |

## Luki z zadania 3
- (a) Kołocz: w brytyjskim rejestrze GI (Defra) jest pełny wniosek o rejestrację w tłumaczeniu EN. Podaje zaczyn 10–20 min w 25–30 °C, pieczenie 180–200 °C przez 30–60 min i grubość ciasta ok. 1,5 cm. Czasu dalszej fermentacji i garowania nie podaje. eAmbrosia (GI 13871) nie ma załącznika, a zmian po rozp. 733/2011 nie było. Listy Produktów Tradycyjnych nie otwierałem (to szczebel 4). KAT-KOL-005 jest więc domknięty w części (KOL-010, -011), a reszta przechodzi do KOL-012.
- (b) Obwarzanek: wniosek w tłumaczeniu EN (rejestr brytyjski) podaje 250–320 °C przez 10–17 min. Ponad ok. 250 °C piekarnik domowy nie sięga, więc temperaturę dla domu musi ustalić rola 01/08.
- (c) Piadina: woda „quanto basta”, czyli bez liczby. Tak jest w brzmieniu z 2014 r. (cytowanym w BUR Emilia-Romagna 2020) i w JD z 2022 r. Wcześniejszej wersji z liczbą nie ma.
- (d) Stollen: pełnej specyfikacji (DPMA) nie otworzyłem, eAmbrosia nie ma załącznika, a gov.uk pisze „not yet available”. Przepis Schutzverband / Sachsen-Tourismus zwrócił 404, a i tak byłby szczeblem 4.
- (e) Orkisz: ilości w szklankach są znane (KAT-ORK-002), ale żadne źródło szczebla 1–3 nie podaje wagi szklanki mąki orkiszowej. USDA ma tylko ziarno (174 g/szkl.), a Foundation 2003587 nie podaje porcji.

## Sprzeczności
- Woda w obwarzanku: Dz.U. C 38/2010 podaje 40–48 l na 100 kg, a wniosek EN „quantity according to baking practices”. Wspólne jest to, że woda jest w cieście. Liczbę podaje tylko Dz.U. (KAT-OBW-013).
- Rupjmaize: 10 kg czy 10–13 kg mąki (już w raporcie D). Przyjąłem 10 kg według nagłówka i opisu.
- Kontrola przelicznika drożdży: opakowanie suchych 7,2 g ÷ kostka świeżych 17 g (USDA) = 0,42. To zgodne z górnym końcem D-172 (0,417), a nie ze środkiem 0,35 (KAT-WAG-029).

## Krytyczne
KAT-KOL-006 (mleko, jaja; w nadzieniu twaróg i żółtka przy opóźnionym starcie, D-175). Te same składniki są w bułkach, słodkim cieście i orkiszu (mleko, maślanka, jajka), ale wpisów formuł nie oznaczałem jako krytyczne. Blokadę daje D-175 na poziomie receptury. OBW-012 (piec 250–320 °C) nie jest krytyczne, ale to uwaga dla domu.

## Założenia (w `uproszczenie`, nie fakty)
Jajko „large” 50 g. Opakowanie drożdży to suche aktywne 7,2 g. Drożdże w specyfikacjach PL (obwarzanek, kołocz) przyjąłem jako świeże. Mleko 1 l ≈ 1,03 kg. „Vegetable oil” to olej sojowy (13,6 g/łyżkę). Mąka orkiszowa 120 g/szklankę tylko warunkowo. Cukier 1 łyżka = 3 × 4,2 g. Woda i mąka w zakwasie lub zaczynie (Altamura, rupjmaize) nieliczone.

## Pola `wielkosc`
Wielkość dodałem do wody, soli i drożdży każdej receptury, a także do wag i objętości, bo to dane dla przelicznika. Jeśli koordynator chce kodu tylko dla trzech procentów, pola WAG można zdjąć. Sól piadiny ma `kat_pia_sol_proc_max`, bo to górna granica, nie wartość typowa.

## Źródła odrzucone / niesprawdzone
- gov.pl attachment bb01cfd9 (wynik wyszukiwarki dla kołocza) okazał się poradnikiem o krupnioku, odrzucony i usunięty.
- agricultura.it (dyscyplina piadiny 2014): 403. Użyłem BUR ER 2020, który cytuje brzmienie z 2014 r.
- sachsen-tourismus.de, visitsaxony.com (Stollen): 404, a to i tak byłby szczebel 4.
- unionalimentari.com, inforlex.pl, lecker.de, polishfoodies.com: kopie pochodne albo przepisy (szczebel 4–5), nieużyte.
- NIST SP 1038 (nvlpubs): 404. Strona nist.gov „appc-19-hb44-finaldocx”: 404. Zamiast nich HB 44-2025 przez DOI.
- Wnioski EN z gov.uk liczę jako szczebel 1 (urzędowy rejestr, ta sama treść co wniosek UE), ale to tłumaczenia: polskich oryginałów nie otworzyłem.
- Na stronach nie było instrukcji dla AI.

# Rola 06 — katalog M3 (D-177, 11 „wchodzi”), 2026-11-03
Pliki: docs/tresci/pl/katalog-m3.md, docs/tresci/en/katalog-m3.md (pola .name/.description/.notes), docs/tresci/wektory/katalog-m3-2026-11-03.json. Bez commitu.

## Receptury (id → kategoria, program maszyny D-179, blokada D-175)
- durum_semolina_sourdough (ChNP Altamura) → sourdough, ciasto, nie
- white_pan_loaf → yeast, podstawowy, nie · half_whole_wheat_loaf → yeast, pełnoziarnisty, nie · half_rye_loaf → rye, pełnoziarnisty, nie
- latvian_scalded_rye (GTS rupjmaize) → rye, ciasto, nie · karelian_rye_pasties (GTS) → rye, ciasto, TAK (mleko w nadzieniu, kierunek bezpieczny)
- boiled_bread_ring (ChOG obwarzanek) → yeast, ciasto, nie · milk_dinner_rolls → yeast, ciasto, TAK (mleko, jajko)
- cheese_crumble_yeast_cake (ChOG kołocz) → sweet, ciasto, TAK (mleko, jaja, twaróg, żółtka) · sweet_yeast_buns, cinnamon_tea_ring → sweet, ciasto, TAK
Nazwy opisowe [T:-]; nazwa chroniona tylko w zdaniu „Formuła pochodzi z …” z ID. Nazwa „Pierożki karelskie” i „Kołocz” nieużyte jako nazwa własna.

## Luki (dla roli 01/08, chyba że zaznaczono)
1. Skala przemysłowa podana wprost: Altamura na 100 kg, rupjmaize na 10 kg (10–13 kg), obwarzanek na 100 kg, kołocz na blachę 40×60 / 5–6 kg — przeskalowanie na dom bez źródła.
2. Temperatury poza piekarnikiem domowym: obwarzanek 250–320 °C (OBW-012), pierożki 250–300 °C (KAR-003), rupjmaize palenisko 280–350 °C, Altamura piec 250 °C (open/closed); rupjmaize scukrzanie 63–65 °C przez 2–4 h.
3. Wariant pół-pełnoziarnisty i pół-żytni: kroki/czasy z KAT-ILB-002 przy znaczniku z ILB-003/-004 — rejestr nie mówi wprost, że wariant zachowuje czasy; rola 01 potwierdzić albo dopisać do ILB-003/-004.
4. Typ mąki w kodzie: tylko Altamura → 'durum'; pozostałe typ_kodu = null (brak wpisu mapującego all-purpose/bread/whole wheat/rye/grubą żytnią na typy src/recipes).
5. Otwarte (null w wektorach): KAR-007 sól, KOL-008 sól, KOL-012 fermentacja i garowanie, ALT-006 wersja drożdżowa; wieniec 375 °F bez °C w rejestrze.
6. Ostrzeżenie o oparzeniu przy parzeniu mąki (rupjmaize) — brak w treści KAT-RUP-001 (jest tylko w uwagach); dopisać do twierdzenia, potem zdanie.
7. Pierożki: blokada D-175 przy mleku tylko w nadzieniu (ciasto bez mleka) — decyzja roli 01.
8. Drożdże obwarzanka i kołocza „przyjęte jako świeże” (założenie w rejestrze) — w tekście „drożdży” bez rodzaju.

## Sprzeczności
- Woda obwarzanka: użyta Dz.U. C 38/2010, 40–48 l/100 kg (KAT-OBW-003, -009); wniosek EN „według praktyki” (KAT-OBW-013) pominięty.
- Rupjmaize 10 vs 10–13 kg mąki: tekst podaje ilości wprost (10 kg w nagłówku, 7–10 kg do ciasta); wektor: 100% = 10 kg z uwagą.
- Uwaga skryptu (pl/en:71): „7–10 kg” w zdaniu z KAT-RUP-004, które ma też „najwyżej 10%” — ta sama wartość, inna wielkość; nie błąd.

## Zdania krytyczne (plik:linia, ID; PL i EN te same linie)
- katalog-m3.md:63 KAT-RUP-001 (+RUP-002, -006; opis parzenia, bez liczb) · :67 KAT-RUP-001 (85–95 °C) · :68 KAT-RUP-001 (63–68 °C)
- :97 KAT-OBW-006 (+OBW-001; opis warzenia) · :104 KAT-OBW-006 (co najmniej 90 °C / at least 90 °C) · :105 KAT-OBW-006 (oparzenie)
- :131 KAT-KOL-006 (procenty ciasta) · :134 KAT-KOL-006 + KAT-KOL-002 (mleko, jaja, twaróg, żółtka)
- Skróty do pola przeglad.sha (--skroty, pl+en): KAT-OBW-006 e041ccea48d0, KAT-RUP-001 7c397c1e861c, KAT-KOL-006 dfee6cd084b2.

## Propozycje kluczy dla roli 09
recipes.<id>.name / .description / .notes dla 11 id powyżej (33 klucze, PL = tekst klucza wg konwencji, EN z pliku en/). Kontekst przekładu: nazwy opisowe, nie tłumaczyć na nazwy chronione (Karjalanpiirakka, Obwarzanek krakowski, Kołocz śląski, Pane di Altamura); w opisie nazwa w cudzysłowie bez tłumaczenia; °F zostaje w notatkach Illinois.

## Wynik skryptu
`node scripts/kontrole-tresci.mjs docs/tresci/rejestr.json docs/tresci/pl docs/tresci/en --przed-przegladem` → kod 0
„0 błędów, 29 uwag” (27 = krytyczne bez przeglądu, jak przed zmianą; 2 = pl/en:71 opisana wyżej).

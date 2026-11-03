# D-157: kandydaci do katalogu (15 → ok. 30 receptur bazowych). Rola 06, odczyt 2026-11-03

Źródła szczebla 1 pobrałem z Cellar Urzędu Publikacji UE (`publications.europa.eu/resource/oj|celex/...`, oficjalne wydanie Dz.U.) i z publicznego API eAmbrosia (załączniki specyfikacji). EUR-Lex i eAmbrosia (strona) odpowiadają na curl i WebFetch kodem 202 bez treści. Obejścia przez web.archive.org nie użyłem, bo zablokował je klasyfikator uprawnień. Kopie surowe są w `zrodla/` (sha256 w `miejsce`). Wszystkie 48 cytatów z `wpisy.json` sprawdziłem skryptem na tekście kopii.

## Tabela kandydatów
| Nr | Kat. | Nazwa PL / EN | Źródło formuły (szczebel; ilości?) | Zakwas/drożdże | Wersja drożdżowa | Maszyna | Ryzyka | Rek. |
|---|---|---|---|---|---|---|---|---|
| 1 | pszenne | Chleb z semoliny durum na zakwasie (Pane di Altamura) / Durum semolina sourdough | eAmbrosia zał. 59722, specyfikacja ChNP (1; tak: 20/2/60%, czasy, 250 °C) | zakwas | brak źródła (spec.: tylko madre) | [DO USTALENIA] | ChNP; spec. z 2003 r., zmian nie sprawdzono; piec | wchodzi |
| 2 | pszenne | Chleb pszenny foremkowy / Basic white loaf | Illinois Extension 4-H, s. 41 (3; tak, w szklankach; 400 °F 30–40 min) | drożdże | tak (bazowo) | [DO USTALENIA] | szklanki → gramy bez źródła wag | wchodzi |
| 3 | pszenne | Chleb pół-pełnoziarnisty / Half whole wheat loaf | Illinois 4-H, wariant (3; tak, „połowa mąki”) | drożdże | tak | [DO USTALENIA] | jak 2 | wchodzi |
| 4 | pszenne | Chleb toskański bez soli (Pane Toscano) / Saltless Tuscan bread | Dz.U. C 235/2013 s. 19 (1; NIE: brak liczb, tylko „bez soli”, zakwas, biga) | zakwas | brak | [DO USTALENIA] | ChNP; brak proporcji | rezerwa |
| 5 | żytnie | Żytni parzony łotewski (Salinātā rudzu rupjmaize) / Latvian scalded rye | Dz.U. C 74/2022 dok. 06, GTS (1; tak: przepis z 10 kg, temp., czasy) | zakwas (zaczyn) | nie: spec. wyklucza drożdże | [DO USTALENIA] | wrzątek 85–95 °C (krytyczne); 63–65 °C przez 2–4 h w domu; bliski borodińskiemu; sprzeczność 10 vs 10–13 kg | wchodzi |
| 6 | żytnie | Chleb pół-żytni foremkowy / Half rye loaf | Illinois 4-H, wariant (3; tak) | drożdże | tak | [DO USTALENIA] | jak 2 | wchodzi |
| 7 | żytnie/placki | Pierożki karelskie (Karjalanpiirakka) / Karelian pasties | Dz.U. C 434/12 z 2019, GTS (1; tak: 275–350 g mąki + 200 g wody, nadzienie, 250–300 °C 15–20 min) | bez spulchniacza | nie dotyczy | nie (formowanie ręczne; źródło milczy) | GTS; 300 °C poza piekarnikiem | wchodzi |
| 8 | żytnie | Chleb prądnicki / Prądnik bread | Dz.U. C 187/2010 s. 16 (1; NIE: tylko surowce, 4,5–14 kg) | zakwas + drożdże | brak | [DO USTALENIA] | ChOG; brak liczb | rezerwa |
| 9 | orkiszowe | Szybki chleb orkiszowy (bez drożdży) / Quick spelt bread | USU Extension „Cooking with Spelt” (3; tak; 375 °F 35–40 min) | proszek + soda | nie dotyczy | [DO USTALENIA] | nie fermentuje; pasuje do celu? | wchodzi warunkowo |
| 10 | orkiszowe | Orkiszowy foremkowy / Spelt pan loaf | USU (3; tylko „jak mąka pszenna”) + Illinois 2 | drożdże | tak | [DO USTALENIA] | zestawienie dwóch źródeł; brak korekty wody | rezerwa |
| 11 | placki | Piadina (Piadina Romagnola) / Romagna flatbread | Dz.U. C 278/2022 dok. 09 (1; częściowo: sól ≤25 g, tłuszcz ≤250 g/kg, 150–300 °C ≤4 min; WODY BRAK) | bez drożdży (spulchniacz ≤20 g) | nie dotyczy | nie dotyczy | ChOG; brak wody | wchodzi warunkowo |
| 12 | placki | Focaccia z serem (Focaccia di Recco) | nie otworzyłem specyfikacji | — | — | — | ChOG | rezerwa (niesprawdzone) |
| 13 | bułki | Obwarzanek krakowski / Kraków ring bagel | Dz.U. C 38/2010 s. 8 (1; tak: na 100 kg; woda 40–48 l, drożdże 1–2 kg; ≥90 °C) | drożdże | tak (bazowo) | [DO USTALENIA] | ChOG; wrzątek (krytyczne); brak temp. pieczenia | wchodzi |
| 14 | bułki | Bułki mleczne / Dinner rolls | Illinois 4-H s. 40 (3; tak; 400–425 °F 10–12 min) | drożdże | tak | [DO USTALENIA] | mleko, jajko przy opóźnionym starcie | wchodzi |
| 15 | bułki | Precel bawarski (Bayerische Breze) | Dz.U. C 262/2013 s. 13 (1; częściowo: tłuszcz ≤4%, ług NaOH <4%) | drożdże | tak | [DO USTALENIA] | ług żrący (krytyczne); ChOG | rezerwa |
| 16 | bułki | Para ferraryjska (Coppia Ferrarese) | eAmbrosia zał. 59552 (1; częściowo: woda 35%, smalec 6%, oliwa 3–4%, madre 10%; brak soli) | zakwas | brak | [DO USTALENIA] | 35% hydratacji, formowanie maszynowe | rezerwa |
| 17 | słodkie | Kołocz śląski / Silesian kołacz | Dz.U. C 299/2010 s. 7 (1; tak: ciasto, ser, mak, jabłka, kruszonka; BRAK czasów i temp.) | drożdże | tak (bazowo) | nie (blacha 40×60) | ChOG; twaróg, żółtka (krytyczne przy opóźnieniu) | wchodzi |
| 18 | słodkie | Słodkie bułeczki / wieniec cynamonowy / Sweet rolls, cinnamon tea ring | Illinois 4-H s. 42, 45 (3; tak; 350–375 °F) | drożdże | tak | [DO USTALENIA] | jak 14 | wchodzi |
| 19 | słodkie | Strucla drezdeńska (Dresdner Stollen) / Stollen | Dz.U. C 46/2010 s. 17 (1; częściowo: masło 50%, sułtanki 65%, skórka 20%, migdały 15%) | drożdże (brak liczb) | brak liczb | [DO USTALENIA] | ChOG; reszta formuły [DO USTALENIA] | wchodzi warunkowo |
| 20 | słodkie | Rogal świętomarciński | Dz.U. L 172/2013 (rozp. 597/2013) (1; NIE: brak ilości; ciasto półfrancuskie) | drożdże | — | nie | ChOG; laminowanie | rezerwa |

Liczba: 11 „wchodzi” i 3 „wchodzi warunkowo”, czyli 14 (z obecnymi 15 daje 29), oraz 6 w rezerwie. Rozkład kategorii: pszenne 2+1, żytnie 3+1, orkiszowe 1+1, placki 2 (piadina, karelskie), bułki 2+2, słodkie 3+1. Orkisz jest słabo pokryty, bo nie znalazłem formuły chleba orkiszowego na drożdżach ani na zakwasie ze źródła szczebla 1–3.

## Uwagi prawne (cytaty w KAT-PRA-001..003)
- Rozporządzenie 2024/1143 art. 26 ust. 1 lit. a chroni przed wykorzystywaniem nazwy „w celach handlowych” w odniesieniu do produktów. Lit. b obejmuje też przywołanie nazwy z dopiskiem „w stylu”, „typu” i „zgodnie z metodą”. Dlatego propozycja „w stylu …” nie omija ochrony, jeśli przepis w ogóle ma zastosowanie.
- Czy przepis w płatnej aplikacji (usługa, a nie produkt) jest „wykorzystywaniem w celach handlowych” chronionej nazwy, nie wiadomo: [DO USTALENIA], potrzebna opinia prawna. Do tego czasu proponuję nazwę opisową („obwarzanek parzony”, „kołacz z serem i kruszonką”, „chleb z semoliny durum”) i pochodzenie jako tło, nie jako tytuł.
- Nazwy GTS (Karjalanpiirakka, rupjmaize) chroni art. 24 rozporządzenia 1151/2012 (tekst pierwotny; wersji skonsolidowanej nie sprawdziłem).

## Luki [DO USTALENIA]
- Przeliczenie szklanek i łyżeczek (Illinois, USU) na gramy: nie mam źródła wag szczebla 1–3 (szklanka mąki, opakowanie drożdży). Do tego czasu brak wartości dla kodu.
- Kołocz: czasy, temperatura, przeskalowanie z blachy 5–6 kg. Obwarzanek: temperatura i czas pieczenia. Piadina: woda. Stollen: drożdże, mleko, czasy.
- Wersja drożdżowa (D-154): dla Altamury, prądnickiego, Toscano i Coppii brak źródła. Rupjmaize ją wyklucza.
- Maszyna do chleba (D-156): żadne otwarte źródło nie mówi nic o maszynie.
- Aktualność: specyfikacja Altamury z 2003 r. Zmian Obwarzanka, Kołocza i Stollena po publikacji nie sprawdziłem w rejestrze.

## Sprzeczności
- Rupjmaize: nagłówek mówi „z 10 kg mąki”, ale tabela daje 3 kg (parzenie) + 7–10 kg (ciasto), czyli 10–13 kg. Część wspólna: około 30% mąki się parzy.
- Coppia: art. 4 podaje wodę 35% dla tej wersji („w innych wyrobach 50% i więcej”).

## Twierdzenia krytyczne
KAT-OBW-006 (woda ≥90 °C), KAT-RUP-001 (wrzątek 85–95 °C), KAT-KOL-005 (twaróg i żółtka przy opóźnionym starcie). Breze jest w rezerwie z powodu ługu NaOH (bez wpisu). KAT-BUL-001 zawiera uwagę o mleku i jajku.

## Nie sprawdzono / odrzucono
- Pane di Matera, Pagnotta del Dittaino, Focaccia di Recco: nie znalazłem identyfikatorów dokumentów, więc ich nie otworzyłem.
- Polska Lista Produktów Tradycyjnych (gov.pl, „Chleb razowy parzony z Ozorkowa”) podaje tylko opis procesu, bez ilości. To opis wnioskodawcy, niższy szczebel, odrzucone jako źródło formuły.
- Oznaczam jako „tylko szczebel 4” i nie otwierałem: pita Red Star, przepisy King Arthur.
- Kopie pochodne (infor.pl, inforlex.pl, assets.publishing.service.gov.uk, unionalimentari.com) służyły tylko do znalezienia wydań Dz.U. Ich nie liczę.
- ICCD/Matera (wynik wyszukiwarki) to nie specyfikacja, odrzucone.
- Na stronach nie było instrukcji dla AI.

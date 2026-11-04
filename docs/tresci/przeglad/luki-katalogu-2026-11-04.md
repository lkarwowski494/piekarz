# Luki katalogu M3: wynik partii 06-luki (rola 06, 2026-11-04)

Wejście: D-177 (3 receptury „wchodzi warunkowo”), D-229 (rola 08), D-235 (rola 09), `docs/tresci/badanie-2026-11-03/D-raport.md`. Decyzje: D-236 (trzy warunkowe), D-237 (sól pierożków, EN, wartości D-229). Kopie źródeł leżą poza repo (scratchpad sesji); w rejestrze są skróty sha256.

## 1. Trzy receptury warunkowe: żadna nie przechodzi do „wchodzi”

| Receptura | Luka | Co przeczytałem 2026-11-04 | Wynik | Rekomendacja (D-236) |
|---|---|---|---|---|
| Piadina | ilość wody | Wyszukiwanie (po angielsku i po włosku): w wynikach tylko przepisy szczebla 4–5, nieotwierane jako źródło. Specyfikacja 2014 i 2022: „quanto basta” (KAT-PIA-006) | `[DO USTALENIA]` | rezerwa |
| Stollen (nazwa opisowa) | drożdże, mleko, cukier, sól, czasy | Pełna specyfikacja ChOG, DPMA Markenblatt 22/2008, Teil 7: tylko etapy, bez tych liczb (KAT-STO-007); nowy fakt: formowany ręcznie, nie w formach, min. 500 g (KAT-STO-006) | `[DO USTALENIA]`, luka potwierdzona w źródle pierwotnym | rezerwa |
| Szybki chleb orkiszowy | masa szklanki mąki orkiszowej; cel aplikacji | USDA FoodData Central, Branded Foods (etykiety): 1/4 szklanki = 30–35 g, czyli szklanka 120–140 g (KAT-WAG-030, szczebel 3, przedział) | luka wagi domknięta jako przedział; formuła zależy od producenta mąki (maślanka 70,0–81,7%) | rezerwa: nie pasuje do celu |

Cel z `CLAUDE.md`: „prowadzi domowego piekarza przez wypiek na zakwasie od receptury do bochenka: liczy ilości, pilnuje czasu, gdy telefon śpi, i pomaga poprawiać następny wypiek”. Szybki chleb orkiszowy to ciasto lane na proszku i sodzie, bez fermentacji: nie ma etapów, których pilnuje harmonogram, temperatury ciasta ani zakwasu, a jego płyny (maślanka, jajko, olej) leżą poza polami formuły, więc formuła pokazałaby wodę 0% i sól 0,4–0,5%. Pierożki karelskie też nie fermentują, ale są ciastem z mąki, wody i soli, które formuła opisuje w całości.

Opcje dla właściciela (D-236): (a) wszystkie trzy do rezerwy, powrót po źródle szczebla 1–3 (rekomendacja: bez zgadywania liczb, katalog ma już 26 receptur); (b) piadina z wodą „do konsystencji” ustawianą przez użytkownika — wymaga decyzji roli 03/04 o polu bez wartości domyślnej; (c) orkisz mimo celu, z mąką 120 g/szklankę (Bob's Red Mill) i opisem „bez fermentacji” — wymaga nowego pola dodatków (D-229 c).

## 2. Sól w pierożkach karelskich (`karelian_rye_pasties`)

Specyfikacja GTS w wersjach PL, FI i EN (Dz.U. C 434/12 z 2019) wymienia sól bez ilości („Kuoritaikinaan laitetaan vettä, suolaa ja ruis- tai vehnäjauhoja.”). Przepis Marttaliitto (szczebel 3, jedno źródło): „Kuoritaikina: 1½ dl vettä 3/4 tl suolaa 3 dl ruisjauhoja 1 dl vehnäjauhoja” (KAT-KAR-009). Rachunek z wagami USDA (KAT-KAR-010): 2,1% masy mąki przy mące żytniej ciemnej; przy średniej 2,5%, ale wtedy woda 82,3% wychodzi poza 57,1–72,7% specyfikacji, więc podstawa ciemna.

Opcje (D-237): (a) sól 2,1% w formule i dwa zdania w notatce (rekomendacja; tekst w `docs/tresci/pl|en/katalog-m3-luki.md`); (b) zostaje 0% z jawnym zdaniem „formuła bez soli, bo źródło nie podaje ilości” — prawdziwe, ale chleb bez soli to inna receptura niż w źródle.

Dla roli 08: `saltPercentage: 2.1`, test `katalog-m3-p8` liczy sól z 4,56 g na 215,1 g mąki (KAT-KAR-010, rachunek w polu `uproszczenie`); zdania z `katalog-m3-luki.md` do notatki po zdaniu o wodzie; Marttaliitto na ekran „Źródła wiedzy” (D-126). Typ mąki w formule `zytnia_720` — patrz pkt 3.

## 3. Wartości D-229 bez źródła: które są twierdzeniem

| Wartość | Ocena | Wymaga źródła? |
|---|---|---|
| Masa ciasta 1000 g | parametr skali, użytkownik zmienia | nie |
| DDT 25 °C, receptury bez fermentacji (pierożki karelskie) | parametr bez skutku dla wypieku | nie |
| DDT 25 °C, receptury fermentowane | twierdzenie: aplikacja liczy z niego temperaturę wody, którą użytkownik wlewa | tak; najpilniej chleb łotewski (specyfikacja: ciasto fermentuje 2–3 h w 30–34 °C, KAT-RUP-004) i Illinois (woda 100–110 °F, KAT-BUL-001) |
| Naczynie: `bread_pan` (Illinois, forma 9×5) i blacha kołacza | ze źródła | nie |
| Naczynie: `baking_steel` dla Altamury i chleba łotewskiego (źródło: piec, palenisko) | zalecenie zastępcze dla piekarnika domowego | tak, albo nazwać uproszczeniem w notatce |
| „uniwersalna” = pszenna 650, „pełnoziarnista” = razowa 2000, „żytnia średnia” = 720, gruba żytnia = 2000, pierożki = żytnia 720 | twierdzenie o równoważności typów; rejestr ma je jako otwarte (MAK-EN-900) | tak |

## 4. EN: „the app's conversion”

Potwierdzone: D-053 daje angielską nazwę „Baker: Sourdough Bread Planner”, więc „Piekarz” w tekście EN jest błędny. Poprawione 6 zdań w `docs/tresci/en/katalog-m3.md` (zamiana w teście p8 jest teraz bez skutku). Poza zakresem tej partii ta sama usterka stoi w `en/drozdze-plan-przelicznik.md:5` i `en/wersje-drozdzowe.md:22` (zgłoszenie dla ról 04 i 08).

## 5. Uwagi rodzimych terminów (rola 09, D-235): lista poprawek dla roli 09

Odniesienie: oficjalne wersje językowe tych samych dokumentów w Dz.U. UE (szczebel 1, odczyt 2026-11-04).

| Język | Teraz | Ocena merytoryczna | Propozycja |
|---|---|---|---|
| el | „κύμινο (Carum carvi)” | wersja EL specyfikacji rupjmaize (Dz.U. C 74/2022) pisze „σπόρους αγριοκύμινου” (EN „caraway seeds”, LV „ķimenes”), czyli innym słowem niż przekład; zgodność „κύμινο” z nazwą łacińską oceni rodzimy recenzent | „αγριοκύμινο (Carum carvi)” we wszystkich 3 miejscach |
| hu | „előtészta” w chlebie łotewskim | to zaczyn bez drożdży piekarskich; wersja HU specyfikacji: „Kovász 0,4–1,6 kg” | „kovász” w nazwie, opisie i notatce chleba łotewskiego; w kołaczu „előtészta” zostaje (zaczyn drożdżowy) |
| sk | „predkvas” w obu recepturach | dwa różne zaczyny: łotewski bez drożdży piekarskich, kołacza z drożdży i mleka (KAT-KOL-010) | `[DO USTALENIA]` rodzimy recenzent: czy „predkvas” oddaje zaczyn bez drożdży; w pobranej wersji SK specyfikacji nie znalazłem tego miejsca |
| cs | „zákvas” (łotewski), „kvásek” (kołacz) | rozróżnienie zgodne z rodzajem zaczynu; wersja CS specyfikacji: „Kvásek 0,4–1,6 kg” | bez zmiany; do rodzimego recenzenta tylko termin łotewski |
| ro | „preferment” w obu | wersja RO: „Ferment”; termin ogólny, nie myli rodzaju | bez zmiany |
| pt | „isco” w obu | wersja PT: „Fermento”; w kołaczu to zaczyn drożdżowy | `[DO USTALENIA]` rodzimy recenzent: czy „isco” nie sugeruje zakwasu w kołaczu |
| pt-BR | „pré-fermento” w obu | termin ogólny | bez zmiany |
| zh-Hant | „夸克乳酪” (twaróg półtłusty) | wersja EN specyfikacji: „half-fat curd cheese” (chińskiej wersji nie ma); w tej samej notatce jest też „起司層” | `[DO USTALENIA]` rodzimy recenzent: czy „夸克乳酪” to ser twarogowy; jeden termin w całej notatce |
| bg | „Отворени ръжени питки” | wersja BG specyfikacji pierożków (Dz.U. C 434/12) używa „пирожка” | „Отворени ръжени пирожки с оризов пълнеж” |
| bg | „Питка с мая, извара и стрейзел” | wersja BG specyfikacji kołacza (Dz.U. C 299/2010): „извара” zgodne, wierzch to „ронлива кора”; produkt prostokątny 40 × 60 cm | `[DO USTALENIA]` rodzimy recenzent: słowo dla ciasta z blachy zamiast „питка” |
| hr, sl | „pite” | wersje HR i SL specyfikacji pierożków: „pita” | bez zmiany |
| sl | „Kvašen kolač s skuto” | wersja SL kołacza: „kvašeno testo”, „skuta” | bez zmiany |
| sr, hr | „Квасна погача”, „Kvaseni kolač” | brak wersji SR w Dz.U.; kołacz jest słodkim ciastem z blachy | `[DO USTALENIA]` rodzimy recenzent sr |

## 6. Twierdzenia do przeglądu właściciela

Nowe twierdzenia krytyczne: 0 (sól, waga mąki i opis stollena nie dotyczą bezpieczeństwa). Do przejrzenia zdań (jak D-190), kolumna „Decyzja”:

| Zdanie (plik:linia) | Twierdzenie | Cytat i adres | Decyzja: akceptuję / do zmiany |
|---|---|---|---|
| `pl/katalog-m3-luki.md:4` sól 2,1% | KAT-KAR-010 | rachunek z „3/4 tl suolaa” (martat.fi/reseptit/karjalanpiirakat) i wag USDA SR Legacy | |
| `pl/katalog-m3-luki.md:5` przepis 1 1/2 dl wody, 3/4 łyżeczki soli | KAT-KAR-009 | „Kuoritaikina: 1½ dl vettä 3/4 tl suolaa 3 dl ruisjauhoja 1 dl vehnäjauhoja” | |
| `en/katalog-m3.md:27, 43, 56, 122, 155, 168` „the app's conversion” | KAT-ILB-005, -009, -013, KAT-BUL-003, KAT-SLO-004, -008 | brzmienie, D-053 | |

## `[DO USTALENIA]`

- Woda w piadinie (KAT-PIA-006); drożdże, mleko, cukier, sól i czasy Stollena (KAT-STO-002…005).
- DDT receptur fermentowanych, naczynie dla pieca i palenisk, równoważność typów mąk (pkt 3).
- Terminy sk, pt, bg (kołacz), sr dla rodzimego recenzenta (pkt 5).

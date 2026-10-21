# Zaczyny: wskazówka zaczynu w arkuszu Składniki i w kalkulatorze (PREFERMENT_DEFINITIONS) — PL
<!-- M1-audytor-generalny-131 (01-odkrywanie-502, 06-tresci-503). Nagłówek = pole w src/core/preferments.ts; wskazówka to szablon „{namePl}: Czas dojrzewania {fermentationTimeHours}. {flavorProfilePl}” (src/lib/wskazowka-zaczynu.ts), pokazywany dla zaczynów z menu (ZACZYNY_W_MENU: poolish, biga, pâte fermentée, levain). Rola 08 wdraża tekst dosłownie (bez znacznika [T:...]). -->
<!-- Wycofane: ZAC-POO-900, ZAC-BIG-900, ZAC-PAT-901, ZAC-LEV-900 (czasy i temperatury bez źródła, „65%” i „100%” w nazwach, „wydłużona świeżość i niski indeks glikemiczny”). Parametry obliczeń pâte fermentée: przykład BBGA 75% wody, 1% drożdży, 2% soli (ZAC-PAT-002, wybór właściciela 2026-10-21; ZAC-PAT-900 wycofane). Pola bez liczby i bez zmiany (flavorProfilePl poolish, biga, pâte fermentée) poza zakresem 131. Tangzhong i yudane nie są pokazywane użytkownikowi. -->

## PREFERMENT_DEFINITIONS.poolish.namePl
Poolish (Rzadki zaczyn 100%) [T:ZAC-POO-001]

## PREFERMENT_DEFINITIONS.poolish.fermentationTimeHours
według King Arthur Baking od 8 godzin (więcej drożdży) do 14–16 godzin (mniej drożdży) [T:ZAC-CZA-001]

## PREFERMENT_DEFINITIONS.biga.namePl
Biga (Sztywny zaczyn włoski 50%) [T:ZAC-BIG-001]

## PREFERMENT_DEFINITIONS.biga.fermentationTimeHours
według Bread Bakers Guild of America 18 godzin w temperaturze ok. 15,6 °C [T:ZAC-BIG-001]

## PREFERMENT_DEFINITIONS.pate_fermentee.namePl
Pâte Fermentée (Stare ciasto) [T:-]

## PREFERMENT_DEFINITIONS.pate_fermentee.fermentationTimeHours
według Bread Bakers Guild of America co najmniej 3 godziny w temperaturze pokojowej albo 1 godzina, a potem najwyżej 3 dni w lodówce [T:ZAC-PAT-001]

## PREFERMENT_DEFINITIONS.levain.namePl
Levain (Rzemieślniczy zaczyn na zakwasie) [T:-]

## PREFERMENT_DEFINITIONS.levain.fermentationTimeHours
według King Arthur Baking ok. 6–8 godzin, aż podwoi objętość i będzie pełen pęcherzyków [T:KRO-POC-002]

## PREFERMENT_DEFINITIONS.levain.flavorProfilePl
Złożony bukiet kwasów mlekowego i octowego. [T:KWA-TEM-001]

# Pieczenie receptur: temperatura, czas i naczynie ze źródła (DEC-03 a, D-303) — PL
<!-- Rola 06, fix M2 p2, 2026-11-09. M1-audytor-generalny-008 (06-tresci-001) i -009 (06-tresci-002). Nagłówek = id receptury i pole w src/recipes/*.ts albo pole kroku planu i fazy prowadzenia. Wartości liczbowe dla kodu i testów: docs/tresci/wektory/pieczenie-receptur-2026-11-09.json (z ID twierdzeń). Tekstu nie ma jeszcze w kodzie: wpina go rola 08 (przekazania w D-303, D-304). Kod bierze tekst dosłownie (bez znacznika [T:...]). -->

## pizza_napoletana_48h (bakeTempSteamC, bakeTempBrowningC, bakeTimeSteamMinutes, bakeTimeBrowningMinutes, recommendedVessel)
Pizzę piecze się w 260 °C około 6 minut na stali. [T:PIE-PIZ-001]

## pizza_napoletana_48h.notesPl (zdanie dopisane)
Stal nagrzewaj w 260 °C co najmniej 30 minut, a po 6 minutach pieczenia włącz górny grill na 2–3 minuty; bez grilla piecz kilka minut dłużej. [T:PIE-PIZ-001]

## receptury w garnku: country_loaf_72, tartine_high_hydration_80, san_francisco_sourdough, pain_de_campagne, spelt_ancient_seeded, graham_bread_honey (bakeTempSteamC, bakeTempBrowningC, bakeTimeSteamMinutes, bakeTimeBrowningMinutes, recommendedVessel)
Bochenek piecze się w garnku w 232 °C: 20 minut pod pokrywką, potem 20–25 minut bez pokrywki. [T:PIE-GAR-001]

## plan, krok preheat_oven, receptury w garnku (namePl)
Nagrzewanie piekarnika i garnka [T:-]

## plan, krok preheat_oven, receptury w garnku (instructionsPl)
Wstaw garnek do piekarnika i nagrzewaj go 45 minut w 260 °C. [T:PIE-GAR-001]

## plan, krok bake, receptury w garnku (instructionsPl; 20–25 = wartość bakeTimeBrowningMinutes receptury)
Przełóż bochenek na papier do pieczenia i natnij go, trzymając ostrze pod kątem około 30° do powierzchni ciasta. [T:PIE-GAR-001,DIA-NAC-001]
Na papierze przenieś bochenek do garnka, przykryj pokrywką i od razu obniż temperaturę do 232 °C. [T:PIE-GAR-001]
Piecz 20 minut pod pokrywką, potem 20–25 minut bez pokrywki, aż skórka będzie głęboko złotobrązowa. [T:PIE-GAR-001]

## faza lid_on (descriptionPl; liczby = bakeTimeSteamMinutes i bakeTempSteamC receptury)
Pokrywka zamknięta: 20 minut w 232 °C. [T:PIE-GAR-001]

## faza lid_on (tipPl)
Para w garnku dłużej utrzymuje skórkę miękką, więc bochenek może jeszcze rosnąć. [T:KRO-POC-013]

## faza lid_off (descriptionPl; liczby = bakeTimeBrowningMinutes i bakeTempBrowningC receptury)
Pokrywka zdjęta: 20–25 minut w 232 °C, aż skórka będzie głęboko złotobrązowa. [T:PIE-GAR-001]

## faza lid_off (tipPl)
Chleb piecze się bez pokrywki, aż w pełni się zrumieni. [T:KRO-POC-014]

## faza lid_off (alertHeadlinePl) i komunikat zdjęcia pokrywki na Stolnicy (DutchOvenController)
Zdejmij pokrywkę garnka i piecz dalej w tej samej temperaturze. [T:PIE-GAR-001]

## lievito_madre_panettone_brioche (bakeTempSteamC, bakeTempBrowningC, bakeTimeSteamMinutes, bakeTimeBrowningMinutes, recommendedVessel)
Brioszkę piecze się w keksówce w 177 °C przez 28–30 minut, bez pary. [T:PIE-BRI-001]

## plan, krok preheat_oven, brioszka w keksówce (namePl)
Nagrzewanie piekarnika [T:-]

## plan, krok preheat_oven, brioszka w keksówce (instructionsPl)
Nagrzej piekarnik do 204 °C, a przed włożeniem keksówki obniż temperaturę do 177 °C. [T:PIE-BRI-001]

## plan, krok bake, brioszka w keksówce (instructionsPl)
Posmaruj brioszkę roztrzepanym jajkiem i piecz 20 minut, potem obróć keksówkę i piecz jeszcze 8–10 minut, aż brioszka będzie złotobrązowa. [T:PIE-BRI-001]
Od razu wyjmij brioszkę z keksówki na kratkę. [T:PIE-BRI-001]

<!-- durum_semolina_sourdough: dane bez zmian (250 °C, 0 + 60 min, stal; KAT-ALT-005), zdanie o pieczeniu już w notesPl (katalog-m3.md). -->

## plan, krok preheat_oven i bake, chleb z semoliny durum na stali (instructionsPl)
Nagrzej piekarnik ze stalą do 250 °C. [T:KAT-ALT-005]
Piecz w 250 °C. [T:KAT-ALT-005]

<!-- M1-audytor-generalny-088 (06-tresci-601, opcja a), rola 06 fix M2 p4, 2026-11-09: keksówka i stal poza wektorem D-304 (rye_100_pan i borodinsky_rye z żytem ≤ 50%, latvian_scalded_rye z żytem ≤ 50%; dane pieczenia żyta bez źródła, D-256): krok bez liczb, temperatura i czas z danych receptury w karcie „O recepturze”. Zdania bez faktu dziedzinowego (odesłanie). Nazwy kroków jak wyżej: „Nagrzewanie piekarnika”, „Pieczenie”. -->

## plan, krok preheat_oven, keksówka i stal poza wektorem D-304 (instructionsPl)
Nagrzej piekarnik do temperatury pieczenia podanej w „O recepturze”. [T:-]

## plan, krok bake, keksówka i stal poza wektorem D-304 (instructionsPl)
Piecz w temperaturze i przez czas podane w „O recepturze”. [T:-]

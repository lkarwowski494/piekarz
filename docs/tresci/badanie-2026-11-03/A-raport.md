# Raport A — RD-19 (DRO-INS) i model czasów fermentacji drożdżowej (DRO-MOD), rola 06, 2026-11-03

37 wpisów (`wpisy.json`): 34 `robocze`, 3 `otwarte` (DRO-INS-021, DRO-MOD-008, DRO-MOD-012). Cytaty sprawdzone automatycznie (`rachunek/gen.py`: grep na tekście kopii po usunięciu znaczników). Kopie w `zrodla/`, rachunki w `rachunek/q10.py` i `rachunek/q10-wynik.txt`.

## Co znalazłem
**RD-19 (a) — suche aktywne i instant:** Red Star nadal pisze „interchangeably, one for one” (S-39 aktualne, DRO-INS-001, -003). Zastrzeżenia: zamiana 1:1 dotyczy wyrabiania ręcznego i mikserem, a w automacie do chleba Red Star daje instant 2/3 dawki suchych aktywnych (DRO-INS-002). Różnice w użyciu: Red Star pozwala dodawać oba rodzaje na dwa sposoby, rozpuszczone albo na sucho. Fleischmann's i KA Pro każą suche aktywne rozpuścić (100–110 °F wg Fleischmann's, DRO-INS-011, -012, -016). Instant miesza się z mąką i dodaje płyn ok. 120 °F (Red Star) albo 120–130 °F (Fleischmann's) (DRO-INS-005, -010). Do próby aktywności Red Star podaje wodę 110–115 °F (DRO-INS-004). Fleischmann's: instant w przepisie na suche aktywne zastępuje pierwsze rośnięcie 10-minutowym odpoczynkiem (DRO-INS-010). Ma to znaczenie dla kroków planu, nie dla ilości.
**RD-19 (b) — przelicznik świeże → suche:** producenci z USA podają ok. 0,417: Red Star (S-40 aktualne) i Fleischmann's (0,6 oz = 1 torebka) (DRO-INS-007, -008). Producenci w Polsce podają mniej: **Dr. Oetker 7 g instant = 25 g świeżych, czyli 0,28** (DRO-INS-014), **Lesaffre PL SAF-Instant „3-4 krotnie mniejsza waga”, czyli 0,25–0,33** (DRO-INS-015). KA Pro podaje 0,4 dla suchych aktywnych i 0,33 dla instant (S-38). Dla polskiego użytkownika z torebką Dr. Oetker 25 g świeżych daje w aplikacji 10 g suchych, a na opakowaniu jest 7 g.
**RD-19 (c) — nazwy:** EN: Red Star „Active Dry / Quick-Rise Instant / Platinum Instant / Fresh Cake Yeast”, zbiorczo „dry yeast”; Fleischmann's „Active Dry / RapidRise Instant / Bread Machine Instant / Fresh Active (compressed, cake)”. „Instant”, „Bread Machine” i „RapidRise” to według producenta te same drożdże (DRO-INS-009). Uwaga: „Pizza Crust Yeast” to drożdże bez rośnięcia (DRO-INS-018). PL: Dr. Oetker „Drożdże suszone instant”, Lesaffre „drożdże prasowane / suszone / suszone drożdże instant” (DRO-INS-019, -020).
**Propozycja nazwy dla roli 04 (decyzja roli 04):** przełącznik „Świeże” / „Suche (instant lub aktywne)”, w EN „Fresh (cake)” / „Dry (instant or active dry)”. Słowo „suche” obejmuje oba rodzaje (Red Star „dry yeast”, Lesaffre „drożdże suszone”), a sam „instant” sugeruje, że suche aktywne są wykluczone.

**DRO-MOD (a) — temperatura:** nie ma pomiaru szczebla 1–3 wewnątrz 20–26 °C. Najbliżej jest Izzreen i in., Cereal Chem. 2016 (szczebel 2, Tabela I). Podaje czasy do optymalnej wysokości w foremce dla 8/16/32 °C i 2/4/6% drożdży świeżych (DRO-MOD-001–003). Rachunek między 16 a 32 °C daje Q10 1,73–2,28 i zależy od ilości drożdży (DRO-MOD-004). Model wzrostu CTMI (Salvadó 2011, 10 szczepów S. cerevisiae, nie piekarskich, w pożywce) daje w 20–26 °C Q10 1,65–2,53, a z dopasowania 1,90 (DRO-MOD-005, `uproszczenie`). Oba źródła wskazują Q10 ok. 2, a nie 3,0 jak dla zakwasu. KA Pro: optimum dla drożdży 86–95 °F, ale ciasto w tym zakresie jest niewłaściwe (DRO-MOD-006).
**DRO-MOD (b) — ilość drożdży:** reguła odwrotnej proporcjonalności nie ma źródła. Izzreen jej przeczy: 2× więcej drożdży skraca czas 1,2× w 32 °C i 1,9× w 16 °C (DRO-MOD-009). KA Pro „Preferment” podaje tylko kierunek: krócej to więcej drożdży, chłodniej (65 °F) to więcej niż w 75 °F (DRO-MOD-010). Biga ma 0,1% drożdży i dojrzewa 12–16 h (DRO-MOD-011).
**DRO-MOD (c) — kroki:** kroki podają Red Star (Prepare Yeast → Mixing → Kneading → First Rise → Punching Down → Shaping → Final Rise → Baking, „not by time”, DRO-MOD-016) i UKY Extension. UKY: pierwsze rośnięcie 1–1,5 h, drugie o ok. połowę krótsze, proofing w 80–85 °F, pieczenie 40–60 min (DRO-MOD-013–015). Strona KA Pro „Dough Temperatures” (sprawdzona ponownie) i „Yeast” nie podają czasów.

## Luki [DO USTALENIA]
- DRO-INS-021: który współczynnik świeże → suche pokazać globalnie (0,28–0,42 u producentów). Propozycja: 0,4 z dopiskiem „zależy od producenta — sprawdź opakowanie” albo przedział.
- DRO-MOD-008: Q10 fermentacji ciasta drożdżowego w 20–26 °C. Propozycja: czas z receptury bez przeliczania i dopisek o kierunku. Q10 ok. 2 tylko po decyzji koordynatora. Nie przenosić Q10 = 3,0 z FER-Q10-002.
- DRO-MOD-012: zależność czas–ilość drożdży. Propozycja: nie przeliczać czasu, pokazać test palca.
- Nieprzeczytane (płatne): Birch i in. 2013 LWT 50:480–488 (5/15/35 °C, 20/40/60 g/kg), Struyf i in. 2017 CRFSFS (przegląd).

## Sprzeczności między źródłami
- Przelicznik: wspólne jest to, że suche to mniej więcej 1/4–2/5 masy świeżych. Różnica: USA ok. 0,417 bez rozróżnienia rodzajów, PL i EU 0,25–0,33 dla instant, KA Pro 0,4 / 0,33.
- Suche aktywne: Red Star pozwala dodawać na sucho, Fleischmann's i KA Pro każą rozpuszczać. Wspólne: można ich używać.
- Instant zamiast suchych aktywnych: Red Star — ten sam proces, możliwe szybsze rośnięcie; Fleischmann's — jedno rośnięcie i 10-minutowy odpoczynek.
- Rozmnażanie w cieście: KA Pro „almost no reproduction”, a UKY uzasadnia krótsze drugie rośnięcie namnożeniem komórek. Wspólne: drugie rośnięcie jest krótsze albo niezależne od tej sprzeczności.
- Temperatura rośnięcia: UKY „optimum” 80–85 °F, Red Star „don't stress”, KA Pro ciasto 75–78 °F (inna wielkość: temperatura ciasta, nie otoczenia).
- Red Star (tabela przeliczeń): przypis daje 0,417, a wiersz tabeli 0–4 cups 0,37.

## Twierdzenia krytyczne
Brak. Temperatury wody i czasy nie dotyczą bezpieczeństwa żywności, a temperatura 140 °F ze strony Red Star nie jest progiem bezpieczeństwa i nie trafiła do wpisów.

## Czego nie sprawdzono
SAF / bakingwithlesaffre.com: strony EN i „4 key stages” bez treści (ładowane skryptem), brak przelicznika. Fleischmann's „Yeast 101”: kopia jest, nie wykorzystana. Brak źródeł innych rynków (DE, Dr. Oetker DE — tylko sklepy). Brak etykiet fizycznych opakowań.

## Źródła odrzucone
- Omni Calculator, gigacalculator, hakaru.io, The Fresh Loaf, utopia.de, sklepy (Frisco, REWE, Kaufland): szczebel 5 albo przedruk; tylko wskazówka.
- bakemag.com („1 °C ≈ 10%”), loafandlevain.com (Q10 ≈ 2,7): szczebel 4–5, bez źródła pomiaru.
- UBC student report (CO2 w 25/30/35 °C): nie recenzowany, w płynie, nie w cieście.
- PMC11722544 (fermentacja w 15 °C): poza zakresem 20–26 °C, kopię usunąłem.
- Strona KA Pro „fermentation”: 404.
Na stronach nie było instrukcji dla AI.

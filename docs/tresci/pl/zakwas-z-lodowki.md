# Obudzenie zakwasu z lodówki przed wypiekiem (F-61, BR-ZAKW-006, RD-24) — PL
<!-- M1-audytor-generalny-104 b. Nagłówek = miejsce w planie (klucz dla roli 08); rola 08 wdraża tekst dosłownie (bez znacznika [T:...]). Stałej liczby dokarmień i godzin przed mieszaniem źródła nie podają (ZAK-LOD-900 [DO USTALENIA]); plan liczy się według warunku z ZAK-LOD-002 i decyzji D-104-a. Ostrzeżenie przy dokarmianiu: ostrzezenia-krokow.md, sekcja „zakwas”. -->

## plan.start (zakwas w lodówce)
Według King Arthur Baking zakwas z lodówki przed pieczeniem dokarm w równych częściach wagowych i zostaw w temperaturze pokojowej. [T:ZAK-LOD-001]
Może zacząć bąbelkować szybko albo potrzebować nawet 12 godzin, zależnie od tego, kiedy był ostatnio dokarmiony. [T:ZAK-LOD-001]

## plan.kolejne-dokarmienia
Dokarmiaj go co 12 godzin, aż w ciągu 6–8 godzin po dokarmieniu podwoi albo potroi objętość; wtedy jest gotowy do pieczenia. [T:ZAK-LOD-002]
Im rzadziej zakwas był dokarmiany, tym dłużej trwa przygotowanie go do pieczenia. [T:ZAK-LOD-003]

## niegotowy-w-dniu-ciasta (BR-ZAKW-006)
Zakwas nie podwoił jeszcze objętości: według King Arthur Baking dokarm go ponownie i sprawdź po kolejnym dokarmieniu, czy podwoi objętość w ciągu 6–8 godzin. [T:ZAK-LOD-002]
Możesz przesunąć plan wypieku. [T:-]

<!-- M1-audytor-generalny-132 (06-tresci-502): porady karty szczytu zakwasu w lodówce (src/core/sourdough-physics.ts). Wycofane bez źródła: „wyjmij na 2–3h”, „1–2 karmień”, „4°C”, „powyżej 5 dni”. Próg fazy hungry (5 dni) to logika: przekazanie do 08 (ZAK-ZAL-012, raz w tygodniu). -->

## calculateStarterPhase.advicePl, faza lag (lodówka, przed progiem)
Według King Arthur Baking przed pieczeniem dokarm zakwas z lodówki i zostaw go w temperaturze pokojowej; może potrzebować nawet 12 godzin, żeby pokazać oznaki życia. [T:ZAK-LOD-001]

## calculateStarterPhase.advicePl, faza hungry (lodówka, od progu)
Zakwas trzymany w lodówce dokarmia się raz w tygodniu. [T:ZAK-ZAL-012]
Według King Arthur Baking przed pieczeniem dokarmiaj go co 12 godzin, aż w ciągu 6–8 godzin po dokarmieniu podwoi albo potroi objętość. [T:ZAK-LOD-002]

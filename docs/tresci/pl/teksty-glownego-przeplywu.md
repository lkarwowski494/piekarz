# Teksty głównego przepływu: plan, ostrzeżenia temperatury wody, receptury bazowe — wersja zweryfikowana — PL
<!-- Rola 06, fix M2 p2, 2026-11-09. M1-audytor-generalny-010 (06-tresci-003), D-305. Nagłówek = pole w kodzie: krok szablonu planu (DEFAULT_STAGE_TEMPLATES w src/core/reverse-scheduler.ts), komunikat calculateDDTWaterTemp (src/core/domain-rules.ts) albo id receptury bazowej i pole (src/recipes/presets-*.ts). Kod bierze tekst dosłownie (bez znacznika [T:...]); wpina rola 08 (D-305). Kroki preheat_oven i bake oraz fazy garnka: pieczenie-receptur.md (D-304). Usunięte bez zastępstwa (bez źródła): superlatywy („Najprostszy chleb świata”, „Spektakularny piecowy skok”, „Idealny…”, „Zachowuje świeżość przez tydzień”), przyczyny („Dodatek łyżki miodu wspomaga fermentację i łagodzi kwasowość”, „Grozi to ugotowaniem drożdży…”, „Długa fermentacja nada…”). Liczby bez źródła usunięte z tekstu, wartości w logice otwarte: PLN-KRO-900 (plan), DDT-WOD-900 (progi 45 i 4 °C), REC-BAZ-900 (receptury bazowe), DRO-PRE-900 (ciabatta, chleb bez wyrabiania). [T:-] przy instrukcji receptury bez liczby = sposób wykonania receptury Piekarza, nie fakt dziedzinowy. Bez zmian do czasu źródła (skład i proces receptury, REC-BAZ-900, DRO-PRE-900): notesPl brioszki („Lievito Madre odśwież 3 razy co 4 h…”, „Masło (25%)…”), ciabatty, chleba bez wyrabiania i zdania bagietki o poolishu (20% mąki, 100% hydratacji) i pieczeniu na płycie; w descriptionPl ciabatty i chleba bez wyrabiania rola 08 usuwa tylko zdania-superlatywy („Spektakularny piecowy skok i wielkie perłowe dziury.”, „Najprostszy chleb świata.”), reszta bez zmian. Poza zakresem (nazwy własne, etykiety): namePl receptur i „Faza 1/2” (numer fazy), nazwy mąk (D-306). -->

## plan, krok autolyse (instructionsPl)
Połącz mąkę i wodę, przykryj i odstaw: mąka wchłonie wodę i zacznie się tworzyć gluten. [T:KRO-POC-003]

## plan, krok bulk_ferment (instructionsPl)
Rozciągaj i składaj ciasto w czasie fermentacji. [T:KRO-POC-006]

## plan, krok final_proof (instructionsPl)
Wstaw koszyk w szczelnej torbie do lodówki. [T:RAT-ZIM-004]
Chłód lodówki spowalnia fermentację, a wolniejsza fermentacja daje głębszy smak. [T:KRO-POC-010]

## plan, podpowiedź kolizji ze snem (autoResolve, suggestion)
Sugerowana korekta: wydłuż garowanie w lodówce albo przesuń godzinę dokarmienia zakwasu, aby ominąć nocne etapy stolnicowe. [T:-]

## calculateDDTWaterTemp, status too_hot_danger (warningMessagePl)
Obliczona temperatura wody jest za wysoka. [T:-]
Ogrzej mąkę albo zakwas do temperatury pokojowej albo ustaw niższą temperaturę ciasta. [T:-]

## calculateDDTWaterTemp, status requires_ice (warningMessagePl)
Obliczona temperatura wody jest bardzo niska. [T:-]
Zastąp część wody lodem. [T:-]

## country_loaf_72.descriptionPl
Bochenek pszenno-żytni na zakwasie. [T:-]

## country_loaf_72.notesPl
Wypiek w garnku żeliwnym. [T:PIE-GAR-001]
Ciasto rozciągaj i składaj w czasie fermentacji, a garuj w lodówce. [T:KRO-POC-006,KRO-POC-010]

## tartine_high_hydration_80.descriptionPl
Bochenek na zakwasie o wysokiej hydratacji. [T:-]

## tartine_high_hydration_80.notesPl
Autoliza 60 minut bez soli. [T:RAT-SOL-004]
Ciasto rozciągaj i składaj delikatnie w czasie fermentacji. [T:KRO-POC-006]

## san_francisco_sourdough.descriptionPl
Chleb na zakwasie w stylu San Francisco. [T:-]

## san_francisco_sourdough.notesPl
Wydłużona fermentacja w chłodzie. [T:KRO-POC-010]
Niższą temperaturę fermentacji wiąże się z kwasem octowym. [T:KWA-TEM-001]
Wypiek w garnku żeliwnym. [T:PIE-GAR-001]

## pain_de_campagne.descriptionPl
Bochenek na zakwasie z mąki pszennej jasnej, graham i żytniej. [T:-]

## pain_de_campagne.notesPl
Ciasto rozciągaj i składaj w czasie fermentacji, a garuj w owalnym koszyku. [T:KRO-POC-006,KRO-POC-009]

## spelt_ancient_seeded.descriptionPl
Bochenek orkiszowy na zakwasie z prażonym siemieniem, słonecznikiem i sezamem. [T:-]

## spelt_ancient_seeded.notesPl
Ziarna upraż na suchej patelni i namocz w ciepłej wodzie, zanim dodasz je do ciasta. [T:-]

## graham_bread_honey.descriptionPl
Chleb na zakwasie z mąki graham, z miodem i siemieniem lnianym. [T:-]

## graham_bread_honey.notesPl
Przed dodaniem soli i zakwasu zostaw mąkę z wodą na autolizę. [T:KRO-POC-003]

## lievito_madre_panettone_brioche.descriptionPl
Maślana brioszka na sztywnym zakwasie Lievito Madre. [T:-]

## sweet_chalka.descriptionPl
Słodka chałka zaplatana w warkocz, z kruszonką. [T:-]

## focaccia_genovese.descriptionPl
Focaccia z oliwą, rozmarynem i solą morską. [T:-]

## rye_100_pan.descriptionPl
Razowiec żytni w keksówce, bez składania. [T:KRO-POC-006]

## rye_100_pan.notesPl
Wymieszaj i od razu przełóż ciasto do wysmarowanej keksówki posypanej otrębami. [T:-]
Zostaw ciasto w formie, aż jego powierzchnia dojdzie do brzegu formy. [T:ZYT-ETA-005]
Upieczony chleb żytni na zakwasie najlepiej pokroić dopiero po 24 godzinach odpoczynku. [T:ZYT-STU-001]

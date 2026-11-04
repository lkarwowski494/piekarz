# Weryfikacja treści E3a — wersje drożdżowe, przelicznik/plan, maszyna (rola 06, audit)

Data: 2026-11-03. Weryfikator niezależny; plików repo nie edytowałem.
Źródła otwarte **na żywo** (curl, 2026-11-03) z adresów z rejestru, surowy tekst (`pdftotext -raw` / HTML bez znaczników, białe znaki scalone), cytaty szukane `grep -F`/`str.find` — wszystkie 45 ID znalezione (1 trafienie każdy; „11. Leavened doughs” różni się tylko spacją po kropce). Wyjątek: Fleischmann's FAQ — serwer zwrócił 403, użyłem kopii lokalnej `badanie/A/zrodla/fleischmanns-faq.htm` (sha256 bc3146d50afb, zgodny z rejestrem). Europe PMC pobrane przez REST fullTextXML (PMC9916868, PMC12529518, PMC5890289). Pobrane pliki: `weryfikacja-E3a/live/`.
Teksty EN porównane zdanie po zdaniu z PL — te same twierdzenia i ten sam zakres; werdykt PL dotyczy też linii EN o tym samym numerze (poprawka do przeniesienia na EN).
Polecenia dla AI w treści stron źródłowych ani w tekstach: **nie znaleziono**.

Liczby: 43 zdania (×2 języki) — **POPARTE 27, CZĘŚCIOWO 16, NIEPOPARTE 0, SPRZECZNE 0, Do sprawdzenia 0**. Rejestr: 45 ID — POPARTE 42, CZĘŚCIOWO 3.

## Zdania

| plik:linia | zdanie (skrót) | ID | werdykt | dlaczego (cytat źródła) | minimalna poprawka |
|---|---|---|---|---|---|
| wersje-drozdzowe:5 | orkisz: 3% drożdży świeżych, ok. 3 h w temp. pokojowej do pieca | DRO-WER-SP-001 | POPARTE | „15 g yeast… kept at room temperature for three hours from the starting time to the time when the finished bread was put in the oven” (500 g mąki → 3%). „Świeże” = D-178, nie źródło (zob. l. 7). | — |
| wersje-drozdzowe:6 | 1%, 18 h w lodówce 4 °C, potem 3 h | DRO-WER-SP-002 | POPARTE | „5 g yeast… refrigerator at 4 °C for 18 h, and then left at room temperature for another three hours”. Rodzaj: D-178. | — |
| wersje-drozdzowe:7 | ilość drożdży i czasy z badania chleba z pełnoziarnistego orkiszu | DRO-WER-SP-001 | CZĘŚCIOWO | Przepisy 1–2 użyto dla trzech odmian orkiszu (seria 3: „two yeast–based recipes popular among German bakers”) — OK. Ale artykuł nie podaje rodzaju drożdży; w parze z l. 5 laik wnioskuje „badanie: 3% świeżych”. | „…z badania chleba z pełnoziarnistej mąki orkiszowej; badanie nie podaje rodzaju drożdży, Piekarz liczy je jako świeże.” |
| wersje-drozdzowe:8 | czasy są wskazówką; wygląd i test palca | DRO-MOD-016 | POPARTE | Red Star: „Use the recipe rise times as a guideline.”, „Go by dough ‘look and feel’, not by time! Use the ‘ripe’ test.” | — |
| wersje-drozdzowe:11 | graham: 2% drożdży świeżych | DRO-WER-GR-001 | POPARTE | „2.0 % m/m WM baker's yeast”; „compressed baker's yeast (S. cerevisiae…)”. | — |
| wersje-drozdzowe:12 | 15 min + 15 min + 70 min w 32 °C | DRO-WER-GR-001 | POPARTE | „bulk-fermented… 15 min at room temperature (20 °C)… second fermentation of 15 min (20 °C)… final proof… lasted 70 min (32 °C, 80 % RH)”. (Pominięte 6% glutenu i kwas askorbinowy — uproszczenie nazwane w rejestrze.) | — |
| wersje-drozdzowe:13 | w chłodniejszym rośnie dłużej; oceniaj wyglądem i testem palca | DRO-MOD-016 | POPARTE | „If your room temperature is cooler, the dough will just take longer to rise”. | — |
| wersje-drozdzowe:16 | żyto bez zakwasu: 3% drożdży świeżych, 76% wody, 1,2% soli | ZYT-DRO-001 | CZĘŚCIOWO | Tab. 3, kolumna WRB (Wholegrain rye): „Water… 76.0 Yeast… 3.0 Salt… 1.2”. Rodzaj drożdży w artykule nie podany (D-178), a l. 17 „W badaniu…” sugeruje, że cała l. 16 to dane badania. Badanie dotyczy mąki żytniej **pełnoziarnistej**. | „…względem mąki (w badaniu chleba z pełnoziarnistej mąki żytniej rodzaj drożdży nie jest podany; Piekarz liczy je jako świeże).” |
| wersje-drozdzowe:17 | 60 min w 28 °C, 60 min w 37 °C w komorze | ZYT-DRO-002 | POPARTE | XML tabeli (colspan): kolumny RB+WRB „60 min 28 °C/80% RH”, „Proofing… 60 min 37 °C/80% RH”. | — |
| wersje-drozdzowe:18 | 10 min w 240 °C i 35 min w 220 °C | ZYT-DRO-002 | POPARTE | „240 °C 10 min + 220 °C 35 min” (RB+WRB). | — |
| wersje-drozdzowe:19 | chleby żytnie zbyt lepkie do oceny, badano następnego dnia | ZYT-DRO-002 | CZĘŚCIOWO | „except for the **wholegrain** rye breads, which were analysed one day after the baking because the breads were too sticky to be analysed on the baking day” — chleb z jasnej mąki żytniej (RB) badano po 2–4 h. Uogólnienie na wszystkie chleby żytnie. | „W dniu wypieku pełnoziarniste chleby żytnie były zbyt lepkie do badań…” |
| wersje-drozdzowe:22 | wg jednego przepisu bez wyrabiania ok. 1,7% drożdży świeżych | DRO-WER-TA-001 | CZĘŚCIOWO | KA: „1 teaspoon instant yeast”, 390 g + 113 g mąki, 397 g wody (79%). Przepis podaje drożdże **instant**; 1,7% świeżych to rachunek Piekarza (3 g/503 g = 0,6% ÷ 0,35, D-172). Zdanie przypisuje wartość przepisowi. Rachunek sprawdzony: 1,70%. | „…według jednego przepisu… (1 łyżeczka drożdży instant, ok. 0,6%): w przeliczeniu Piekarza około 1,7% drożdży świeżych względem mąki.” |
| wersje-drozdzowe:23 | noc, co najmniej 8 h; bochenek ok. 90 min | DRO-WER-TA-001 | POPARTE | „rest at room temperature overnight, or for at least 8 hours”; „let rise at room temperature for about 90 minutes”. | — |
| drozdze-plan-przelicznik:5 | Piekarz liczy suche (instant i aktywne) jako 0,35 świeżych | DRO-INS-030 | POPARTE | Reguła aplikacji D-172 („msuche = mświeże × 0,35 dla suchych aktywnych i instant”). | — |
| drozdze-plan-przelicznik:6 | to środek wartości producentów, od 0,28 do 0,417 | DRO-INS-030 | CZĘŚCIOWO | Oetker „7 g = 25 g drożdży świeżych” (0,28); Red Star/Fleischmann's 0,6 oz = 1/4 oz (0,417) — OK. Ale wartości producentów zaczynają się niżej: Lesaffre PL 0,25–0,33 (DRO-INS-015; sam rejestr: „źródła szczebla 1 podają 0,25–0,417”). 0,35 to środek dwóch skrajnych producentów, nie przedziału wszystkich producentów. | „To środek między wartościami dwóch producentów, 0,28 i 0,417 (inni podają nawet 0,25), więc…” |
| drozdze-plan-przelicznik:9 | instant można wsypać prosto do mąki | DRO-INS-005, DRO-INS-016 | POPARTE | Red Star: „Blend the yeast directly with the flour and other dry ingredients.”; KA: „Instant yeast can be incorporated into the dough without first rehydrating it”. Pominięte: „avoid direct contact with the salt or sugar” (Red Star) — drobne. | (opcjonalnie) „…prosto do mąki, nie bezpośrednio na sól ani cukier.” |
| drozdze-plan-przelicznik:10 | suche aktywne część producentów każe rozpuścić w ciepłej wodzie | DRO-INS-011, -012, -016 | POPARTE | Fleischmann's: „Active Dry works best if dissolved in warm water (100°–110°F)”, „…should be dissolved in water to achieve complete hydration prior to adding to the mixer”. „Część” trafne (Red Star pozwala też na sucho, DRO-INS-001). Uwaga: KA nie jest producentem drożdży. Soczewka laika: „ciepła” bez liczby → ryzyko gorącej wody. | „…w ciepłej wodzie (ok. 38–43 °C).” |
| drozdze-plan-przelicznik:13 | kroki: mieszanie, wyrabianie, 1. rośnięcie, odgazowanie, kształtowanie, 2. rośnięcie, pieczenie | DRO-MOD-016 | POPARTE | Red Star: sekcje Kneading, First Rise, Punching Down, Shaping, Final Rise, Baking. | — |
| drozdze-plan-przelicznik:14 | plan bierze czasy z receptury | T:- | POPARTE (brak faktu) | Zachowanie aplikacji (D-174). | — |
| drozdze-plan-przelicznik:15 | czasy wskazówką; zależą od składników, siły ciasta, temp., wilgotności | DRO-MOD-016 | POPARTE | „Many factors – including ingredients, dough strength, temperature and humidity will determine how long it takes a dough to rise.” | — |
| drozdze-plan-przelicznik:18 | gotowe, gdy wgłębienie po palcu zostaje | DRO-MOD-013 | POPARTE | UKY: „If the dent remains, the dough is ready.” (dla 1. rośnięcia); Red Star to samo dla „Final Rise”. | (tag) dodać DRO-MOD-016, bo zdanie dotyczy obu rośnięć. |
| drozdze-plan-przelicznik:19 | po kształtowaniu ok. o połowę krócej; nie więcej niż podwoić | DRO-MOD-015 | POPARTE | UKY: „the loaf takes about half the time as the first rise”; „should not expand more than double in size during the last rise”. Konflikt z czasami receptur — zob. Pary. | — |
| maszyna:5 | wpisz maks. mąki z instrukcji; Piekarz nie przeliczy na więcej | MAS-062 | POPARTE | UKY: „Never use more than the maximum amount of flour specified by the manufacturer.” Luka limitu ciasta/drożdży — zob. Krytyczne. | — |
| maszyna:6 | Tefal PF220838: najwyżej 620 g mąki i 10 g suchych drożdży | MAS-002 | CZĘŚCIOWO | Safety: „For 1 KG bread machines: Do not exceed a total of 1000 g of bread dough, Do not exceed a total of 620 g of bread flour and 10 g of instant dried yeast (powder type).” (PF220838 = 1 kg: nastawy 500/750/1000 g w IFU). Pominięty limit 1000 g ciasta, który przy wysokiej hydratacji jest wiążący; „suchych” zamiast „instant”. | „…przyjmuje najwyżej 1000 g ciasta, w tym 620 g mąki chlebowej i 10 g suchych drożdży instant.” |
| maszyna:9 | kolejność podaje instrukcja Twojej maszyny | MAS-060 | POPARTE | UKY: „Always follow the manufacturer's instructions to determine the proper order in which to add the ingredients.” | — |
| maszyna:10 | w większości przeczytanych: płyny, mąka i suche, drożdże na wierzch, bez kontaktu z płynem | MAS-005, -020, -040, -050 | POPARTE | 4 z 5: Tefal „First the liquids, and then the solids. The yeast must not come into contact with the liquids or with the salt.”; Zojirushi „so that the yeast does not come into contact with water”; Cuisinart „liquids in first… yeast last. Yeast should not touch wet ingredients.”; Kenwood „well… not down as far as the water”. | — |
| maszyna:11 | w niektórych odwrotnie: drożdże, mąka, płyn na końcu | MAS-031 | POPARTE | Panasonic SD-R2530: „For bread and dough menus, dry yeast should be placed first.”, „Place dry ingredients over the dry yeast.” (jeden model; „niektórych” jako ograniczenie wystarcza). Pominięte: „away from the kneading blade”. | (opcjonalnie) „…najpierw suche drożdże (z dala od mieszadła)…” |
| maszyna:12 | w maszynie z dozownikiem drożdże do dozownika | MAS-030 | CZĘŚCIOWO | Panasonic SD-YR2550: „Place the dry yeast into the yeast dispenser **for available menus**.” Jeden model, uogólnione na wszystkie maszyny z dozownikiem i wszystkie programy. | „W maszynie z dozownikiem drożdży suche drożdże zwykle wsypuje się do dozownika (w programach, które go używają — sprawdź w instrukcji).” |
| maszyna:15 | opóźniony start wyłączony, bo receptura ma jajka, mleko, ser, jogurt albo świeże owoce | MAS-072 | POPARTE | Reguła D-175 (część wspólna instrukcji). Uwaga: w UI wymienić faktyczny składnik, nie całą listę (laik czyta „receptura ma to wszystko”). | — |
| maszyna:16 | instrukcje maszyn zabraniają opóźnionego startu z takimi składnikami, bo łatwo się psują | MAS-072, -009, -035 | CZĘŚCIOWO | Każda instrukcja zabrania innego podzbioru: Tefal „raw milk, eggs, yoghurt, cheese, fresh fruit”; Zojirushi „milk, juice, vegetables, or eggs”; Cuisinart/Kenwood „milk, eggs, cheese and yogurt”; Panasonic jajka i mleko zamiast wody. „Instrukcje maszyn” + „takimi” = każda zabrania całej listy, na każdej maszynie. | „Przeczytane instrukcje maszyn zabraniają opóźnionego startu z łatwo psującymi się składnikami, np. jajkami i mlekiem.” |
| maszyna:17 | mleko w proszku nie wyłącza opóźnionego startu | MAS-084 | CZĘŚCIOWO | Tylko Cuisinart CBK-110: „Using dry milk instead of fresh milk enables you to use the Delay Start feature.” Inne instrukcje milczą lub zabraniają „mleka” bez rozróżnienia; zdanie brzmi jak fakt dla każdej maszyny. Krytyczne. | „W Piekarzu mleko w proszku… nie wyłącza opóźnionego startu (instrukcja Cuisinart CBK-110 na to pozwala; sprawdź w swojej).” |
| maszyna:20 | formę wyjmuj w rękawicach; forma, uchwyt i wnętrze pokrywy gorące | MAS-010, -024, -036, -053 | POPARTE | Tefal „Always use oven mitts, because both the pan’s handle and the inside of the lid are hot.”; Zojirushi „Main Body, Baking Pan… Kneading Blades and inside of the Lid become hot”; Panasonic „always use oven gloves to remove the bread pan… (Do not use wet oven gloves.)”; Kenwood „Always use oven gloves to remove the hot bread pan.” | (opcjonalnie) „…w suchych rękawicach…” (Panasonic). |
| maszyna:21 | mieszadło może być bardzo gorące: wyjmij po ostygnięciu chleba, narzędziem z zestawu / plastikową łopatką, bez noża i widelca | MAS-045, -025, -037, -013 | CZĘŚCIOWO | Cuisinart „the kneading paddle will be extremely hot”; Zojirushi „allow the loaf to cool and then remove the Blade(s) using a plastic spoon or rubber spatula… Be careful not to burn yourself.”; Panasonic „wait for the loaf to cool and remove it… Be careful not to get burn as the kneading blade **may still be hot**.” Konstrukcja „gorące: wyjmij po ostygnięciu” sugeruje, że po ostygnięciu chleba mieszadło jest już bezpieczne — źródła ostrzegają, że nadal może parzyć. | „…bez noża i widelca, i uważaj, bo nawet wtedy może być jeszcze gorące.” |
| maszyna:22 | przy otwieraniu pokrywy w trakcie / pod koniec może wydostać się gorąca para | MAS-011, -026, -038 | CZĘŚCIOWO | Popiera tylko Tefal: „steam can be released when you open the lid at the end of or during the programme.” MAS-026 („Do not touch the Steam Vent.”) i MAS-038 („Do not touch, block or cover the steam vent during use.”) mówią o otworze pary, którego zdanie nie wspomina. | Dopisać: „Nie dotykaj i nie zasłaniaj otworu pary w trakcie pracy.” (albo usunąć MAS-026/-038 z tagu). |
| maszyna:23 | dzieci <8 lat z dala od maszyny i przewodu; starsze tylko pod nadzorem | MAS-014, -038 | CZĘŚCIOWO | Tefal/Panasonic: „Keep the appliance and its cord out of reach of children less than 8 years”; od 8 lat „if they have been given supervision **or instruction**”. „Tylko pod nadzorem” jest ostrzejsze niż cytowane ID (bezpieczny kierunek); dosłownie popiera je Zojirushi MAS-026 („Do not allow children to use the product unsupervised.”), nieobecny w tagu. | Tag: dodać MAS-026; brzmienie może zostać. |
| maszyna:26 | podpowiedź to reguła Piekarza, nie producenta | T:- | POPARTE (brak faktu) | D-176/D-179. | — |
| maszyna:27 | „ciasto” dla wypieków z piekarnika, bo maszyna tylko wyrabia i nie piecze | MAS-006, -046 | CZĘŚCIOWO | Tefal 11: „This program does not cook food.”; Cuisinart Artisan Dough: „dough ONLY… several long, slow, cool rises”; Cuisinart Dough: „mixes ingredients, kneads and takes the dough through the two rises”. „Tylko wyrabia” zaniża (programy prowadzą też rośnięcie); uogólnienie z 2 modeli bez ograniczenia. | „…bo w nim maszyna przygotowuje ciasto (wyrabia, często też prowadzi rośnięcie) i nie piecze.” |
| maszyna:28 | „słodki”, bo jest przeznaczony dla chlebów z dużą ilością cukru, tłuszczu i białka | MAS-083 | CZĘŚCIOWO | Tylko Cuisinart: „specifically designed to bake breads with high amounts of sugar, fats and proteins.” (Tefal 7: „more fat and sugar”, bez białka). Uzasadnienie z jednego modelu podane jako fakt o każdej maszynie. | „…bo zwykle jest przeznaczony dla chlebów z dużą ilością cukru i tłuszczu.” |
| maszyna:29 | „pełnoziarnisty”, gdy pełnoziarnista + żytnia ≥ 50% | MAS-042 | POPARTE (jako reguła) | Cuisinart: „significant portion of whole-wheat flour (50% or more)”. Wliczenie żyta to reguła D-179, nie źródło — zdanie jest regułą (l. 26), więc dopuszczalne. Tefal ma osobny program żytni (10). | — |
| maszyna:30 | „francuski” dla receptur bez cukru i tłuszczu | MAS-082 | POPARTE (jako reguła) | Cuisinart: „traditionally lack sugars or large amounts of fat”. | — |
| maszyna:31 | podstawowy, przeznaczony głównie dla jasnej mąki pszennej | MAS-081 | CZĘŚCIOWO | Tylko Cuisinart: „The White program uses primarily all-purpose or bread flour.” Uzasadnienie z jednego modelu bez ograniczenia. | „…program podstawowy, zwykle przeznaczony głównie dla jasnej mąki pszennej.” |
| maszyna:34 | nie znaleźliśmy instrukcji ani źródła o maszynie na samym zakwasie | T:- | CZĘŚCIOWO | Zdanie [T:-] zawiera twierdzenie dziedzinowe (wynik przeglądu źródeł) = MAS-ZAK-005 (status „otwarte”, [DO USTALENIA]). Sprawdzone: Zojirushi „Light Sourdough Bread” ma „2 tsp. Active Dry Yeast”; Panasonic Sourdough: „Place the dry yeast in the yeast dispenser”. Treść prawdziwa, ale „ani źródła” szersze niż przegląd (szczebel 4–5 nieprzeczytany, uwagi MAS-ZAK-005). | Tag [T:MAS-ZAK-005]; „Nie znaleźliśmy instrukcji maszyny ani innego wiarygodnego źródła, które…” |
| maszyna:35 | dlatego w trybie maszyny receptura używa wersji na drożdżach | T:- | POPARTE (brak faktu) | Zachowanie aplikacji (D-156). | — |

## Pary zdań

1. **maszyna:5+6 (krytyczne, mienie)** — „Piekarz nie przeliczy na więcej [mąki]” + przykład Tefal tylko z mąką: laik wpisze 620 g i uzna, że maszyna jest chroniona. Tefal ma też limit **1000 g ciasta**; przy tartine 80% wody 620 g mąki daje ok. 1130 g ciasta (> 1000 g) → ryzyko przelania. Panasonic: „Do not exceed the maximum quantities of flour (600 g) and raising ingredients such as dry yeast (7 g)”; Tefal słodki z gotową mieszanką: „do not exceed 750 g of dough in total”. Limit tylko mąki nie wystarcza.
2. **maszyna:15+16** — lista blokująca (jajka, mleko, ser, jogurt, świeże owoce) + „instrukcje zabraniają z takimi składnikami”: laik wnioskuje, że składniki spoza listy są bezpieczne. Zojirushi zabrania też **soku i warzyw** („milk, juice, vegetables, or eggs”) — receptura z warzywami/sokiem dostanie opóźniony start.
3. **maszyna:16+17** — „instrukcje zabraniają mleka” i zaraz „mleko w proszku nie wyłącza” — wyjątek z jednej instrukcji (Cuisinart) bez ograniczenia; laik uzna za regułę wszystkich maszyn.
4. **maszyna:20+21** — „może być bardzo gorące: wyjmij po ostygnięciu chleba” → wniosek: po ostygnięciu chleba mieszadło można chwycić ręką. Panasonic/Zojirushi ostrzegają przed oparzeniem także wtedy.
5. **maszyna:22** — samo „może wydostać się para przy otwieraniu” bez ostrzeżenia o otworze pary (dotyk/zasłanianie, Zojirushi, Panasonic, Kenwood „DO NOT cover the steam vents”).
6. **maszyna:27 (+ programHint)** — Kenwood BM200: „The delayed start is not recommended for use with dough, jam or rapid bake settings.” Jeśli aplikacja pozwala połączyć podpowiedź „ciasto” z opóźnionym startem, tekst tego nie zgłasza (poza zakresem zdań, do roli 08).
7. **drozdze-plan-przelicznik:14+19 vs wersje-drozdzowe** — plan „bierze czasy z receptury”, a l. 19 mówi, że po kształtowaniu ciasto rośnie mniej więcej o połowę krócej. Czasy w wersjach drożdżowych temu przeczą: graham 15+15 min → 70 min; żyto 60 → 60 min; tartine ≥ 8 h → 90 min. Laik zobaczy sprzeczność między regułą a planem. Poprawka l. 19: „W typowym przepisie drożdżowym ciasto po kształtowaniu rośnie…”.
8. **wersje-drozdzowe:5+7 i 16+17** — „3% drożdży świeżych” + „z badania” → laik (i ekspert) uzna, że badanie użyło drożdży świeżych; tak nie jest (D-178, kierunek bezpieczny: najwyżej wolniejsze rośnięcie).
9. **wersje-drozdzowe:12+13** — 70 min w 32 °C w komorze, a w domu jest chłodniej; l. 13 zabezpiecza („rośnie dłużej… nie czasem”). Bez fałszywego wniosku.
10. **wersje-drozdzowe:22+23** — l. 23 bez „w tym przepisie” czytana osobno brzmi jak reguła dla tartine; w parze z l. 22 jasne. Bez zmiany.
11. **drozdze-plan-przelicznik:9+10** — instant „prosto do mąki”, aktywne „w ciepłej wodzie” bez temperatury; Red Star dla instant: płyn „about 120˚F… not too hot to touch”, Fleischmann's dla aktywnych 100–110 °F. Laik może zabić drożdże zbyt gorącą wodą — dodać °C.

## Twierdzenia w rejestrze

| ID | werdykt | uwaga |
|---|---|---|
| DRO-WER-SP-001 | POPARTE | Cytat dosłownie (PMC9916868). Przepisy z serii 2 (pszenica) użyte w serii 3 dla orkiszu — przypisanie do orkiszu poprawne. Rodzaj drożdży nie podany (D-178). |
| DRO-WER-SP-002 | POPARTE | j.w. |
| DRO-MOD-016 | POPARTE | Wszystkie elementy (kroki, czynniki, chłodniej = dłużej, wygląd i test) na stronie Red Star. |
| DRO-WER-GR-001 | POPARTE | „compressed baker's yeast” potwierdza „prasowane”. |
| ZYT-DRO-001 | POPARTE | Kolumna WRB; brak cukru („—”) potwierdzony. |
| ZYT-DRO-002 | CZĘŚCIOWO | Czasy/temperatury poprawne (colspan sprawdzony). „Chleby żytnie badano następnego dnia” — źródło: „wholegrain rye breads”; RB (jasne żyto) nie. Poprawić na „pełnoziarniste chleby żytnie”. |
| DRO-WER-TA-001 | POPARTE | Liczby i rachunek (0,596% → 1,70%) zgodne; woda 397/503 = 78,9%. Szczebel 4. |
| DRO-INS-030 | CZĘŚCIOWO | „Środek przedziału wartości producentów, od 0,28…” — sam wpis (uproszczenie) i DRO-INS-015 podają dolną granicę 0,25 (Lesaffre). To środek dwóch skrajnych wartości 0,28 i 0,417, nie przedziału producentów. |
| DRO-INS-005 | POPARTE | Oba cytaty; rachunek °C poprawny. |
| DRO-INS-016 | POPARTE | KA Pro; sekcja Conversions. |
| DRO-INS-011 | POPARTE | Kopia lokalna (403 na żywo), sha zgodny. |
| DRO-INS-012 | POPARTE | j.w. |
| DRO-MOD-013 | POPARTE | UKY s. 1–2. |
| DRO-MOD-015 | POPARTE | UKY. |
| MAS-062 | POPARTE | UKY FN-SSB.927. |
| MAS-002 | POPARTE | 1 kg potwierdzone nastawami 500/750/1000 g w IFU. Uwaga: IFU Tefal każe używać „active dry baker’s yeast”, Safety mówi o „instant dried yeast” — niespójność producenta. |
| MAS-060 | POPARTE | |
| MAS-005 | POPARTE | Lista „General order to follow” zgodna. |
| MAS-020 | POPARTE | |
| MAS-040 | POPARTE | |
| MAS-050 | POPARTE | |
| MAS-031 | POPARTE | |
| MAS-030 | POPARTE | Twierdzenie zachowuje „dozownik”; zdanie l. 12 gubi „for available menus”. |
| MAS-072 | CZĘŚCIOWO | Twierdzenie i 5 cytatów poprawne. Pole `uproszczenie` jest sprzeczne z twierdzeniem i D-175: „mięso i warzywa dopisane z Zojirushi… i FDA” — reguła nie zawiera ani mięsa (D-175: „bez mięsa”), ani warzyw; „Mleko w proszku… [DO USTALENIA]” jest nieaktualne wobec MAS-084. Lista blokująca pomija sok i warzywa (Zojirushi). |
| MAS-009 | POPARTE | EN i PL cytat znalezione. |
| MAS-035 | POPARTE | „Eggs go rotten quickly if your room temperature is high.” |
| MAS-084 | POPARTE | Uproszczenie (jedna instrukcja) poprawnie nazwane. |
| MAS-010 | POPARTE | |
| MAS-024 | POPARTE | |
| MAS-036 | POPARTE | |
| MAS-053 | POPARTE | |
| MAS-045 | POPARTE | |
| MAS-025 | POPARTE | Źródło dodaje „Be careful not to burn yourself.” — warto dopisać do twierdzenia. |
| MAS-037 | POPARTE | |
| MAS-013 | POPARTE | Haczyk używany „When turning out your bread”, czyli na gorąco; instrukcja nie mówi o temperaturze mieszadła — zgodne z wpisem. |
| MAS-011 | POPARTE | |
| MAS-026 | POPARTE | |
| MAS-038 | POPARTE | Cytat obejmuje tylko otwór pary; część o dzieciach < 8 lat jest w sąsiednim punkcie tej samej strony (sprawdzone). Dobrze byłoby dodać drugi cytat. |
| MAS-014 | POPARTE | |
| MAS-006 | POPARTE | Programy 1–17 i nagłówek „Pain & Délices” sprawdzone. |
| MAS-046 | POPARTE | |
| MAS-083 | POPARTE | |
| MAS-042 | POPARTE | |
| MAS-082 | POPARTE | |
| MAS-081 | POPARTE | |

(MAS-ZAK-005 nie jest użyte jako tag, ale powinno być przy maszyna:34; cytaty potwierdzone, treść poprawna, status „otwarte”.)

## Krytyczne (osobno)

Zdania w sekcjach `machine.capacity`, `machine.delayBlocked` i `machine.safety` (ID krytyczne: MAS-062, -002, -072, -009, -035, -084, -010, -024, -036, -053, -045, -025, -037, -013, -011, -026, -038, -014). Wszystkie cytaty krytyczne potwierdzone na żywych PDF producentów i UKY. Uwagi:

1. **Limit pojemności (mienie)** — maszyna:5–6: aplikacja ogranicza tylko mąkę. Instrukcje ograniczają też **masę ciasta** (Tefal 1 kg: 1000 g; słodki z mieszanką: 750 g) i **drożdże** (Tefal 10 g instant; Panasonic 7 g suchych, 600 g mąki). Receptury o wysokiej hydratacji przekroczą limit ciasta przy limicie mąki. Do roli 08/01: limit ciasta (opcjonalne pole) albo ostrzeżenie; poprawka l. 6 jak w tabeli.
2. **Opóźniony start (zdrowie)** — maszyna:16 uogólnia (CZĘŚCIOWO); lista D-175 pomija sok i warzywa, których zabrania Zojirushi; maszyna:17 robi z wyjątku Cuisinart (mleko w proszku) regułę wszystkich maszyn bez ograniczenia. MAS-072: sprzeczne pole `uproszczenie`.
3. **Mieszadło (oparzenie)** — maszyna:21: dopisać, że może być gorące nawet po ostygnięciu chleba (Panasonic „may still be hot”, Zojirushi „Be careful not to burn yourself”).
4. **Para (oparzenie)** — maszyna:22: dodać otwór pary (nie dotykać/nie zasłaniać) albo usunąć MAS-026/-038 z tagu.
5. **Dzieci** — maszyna:23: brzmienie ostrzejsze niż Tefal/Panasonic (bezpieczny kierunek); tag uzupełnić o MAS-026.
6. **Gorąca forma** — maszyna:20 POPARTE; opcjonalnie „suche rękawice” (Panasonic „Do not use wet oven gloves”).
7. Uwaga dla roli 08: Kenwood nie zaleca opóźnionego startu z programem ciasta, dżemu i szybkim — sprawdzić, czy tryb maszyny nie łączy podpowiedzi „ciasto” z opóźnionym startem.

## Soczewka: inny kraj

- EN podaje tylko °C (4, 28, 32, 37, 220, 240 °C); użytkownik z USA dostanie °F tylko, jeśli robi to UI — wspomnieć w przekazaniu do roli 08/09. „Fresh yeast” w USA to „cake/compressed yeast” (Fleischmann's: „traditionally known as compressed or cake yeast”); dodać nazwę w EN.
- Nazwy programów („whole wheat”, „French”, „sweet”, „basic”, „dough”) różnią się u producentów (Tefal „Whole grain bread”, „Classic bread”, „Leavened doughs”; Kenwood numery 1–12). Zdanie l. 26 („sprawdź w instrukcji”) to łagodzi.
- Tefal PF220838 to model europejski; dla odbiorców spoza UE przykład mniej przydatny, ale nazwany jako przykład — OK.

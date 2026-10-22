/**
 * Słownik EN, część 18: teksty 1.0 wyświetlane bez t() przed zadaniem 093 (Z-3 z 080) i pola domeny bez wpisu EN
 * [M1-audytor-generalny-093]. Przekład własny (AI, sesja roli 09, 2026-10-21); języki 093: patrz
 * docs/lokalizacja/czeka-na-przeklad.json, gdy klucza nie było w przekładzie M1.
 */
export const EN_18: Record<string, string> = {
  // Szablony Doktora Chleba (src/components/doktor/SymptomSelectorSection.tsx, DIAGNOSTIC_PRESETS)
  'Jaskinie (Niedofermentowany)': 'Caverns (Underproofed)',
  'Płaski dysk (Przerośnięty)': 'Flat disc (Overproofed)',
  'Gumowaty (Krojony na gorąco)': 'Gummy (Cut while hot)',
  'Pęknięty bok': 'Burst side',
  'Zbyt kwaśny (Octowy)': 'Too sour (Vinegary)',
  'Płaski smak (Jałowy)': 'Flat taste (Bland)',

  // Pola domeny bez wpisu EN (przekład 093 je miał, EN nie): szablony z wartościami domeny i nazwy mąk receptur
  // bazowych; nazwy mąk bez polskiego numeru typu, jak przekład 093 (094) [M1-audytor-generalny-093]
  '{namePl}: Czas dojrzewania {fermentationTimeHours}. {flavorProfilePl}': '{namePl}: ripening time {fermentationTimeHours}. {flavorProfilePl}',
  // {dni} = liczba dni z odmianą formami CLDR („{n} dzień”) [M1-audytor-generalny-071]
  'Wymaga odświeżenia ({dni} w chłodzie)': 'Needs a refresh ({dni} in the cold)',
  'Uśpiony w lodówce ({dni})': 'Dormant in the fridge ({dni})',
  'Chleb z grubo mielonej mąki pszennej Graham z dodatkiem naturalnego miodu i siemienia lnianego.':
    'Bread from coarsely ground Graham wheat flour with natural honey and flaxseed.',
  'Mąka pszenna typ 650 (chlebowa jasna)': 'Light wheat bread flour (Polish type 650)',
  'Mąka pszenna typ 650': 'Light wheat flour (Polish type 650)',
  'Mąka pszenna luksusowa typ 550': 'Fine light wheat flour (Polish type 550)',
  'Mąka pszenna graham typ 1850': 'Graham wheat flour (coarse, Polish type 1850)',
  'Mąka pszenna pełnoziarnista typ 2000': 'Wholemeal wheat flour (Polish type 2000)',
  'Mąka żytnia typ 720': 'Light rye flour (Polish type 720)',
  'Mąka pszenna Manitoba / Forte (W > 300)': 'Manitoba / Forte wheat flour (W > 300)',
  'Mąka pszenna Manitoba / Forte (W > 350)': 'Manitoba / Forte wheat flour (W > 350)',
  'Mąka pszenna wysokobiałkowa (W>280 / Manitoba)': 'High-protein wheat flour (W > 280 / Manitoba)',
  'Mąka z pszenicy durum (Semolina)': 'Durum wheat flour (semolina)',
  'Mąka pszenna włoska Tipo 00': 'Italian Tipo 00 wheat flour',

  // Czas dojrzewania zaczynu (PREFERMENT_DEFINITIONS.fermentationTimeHours) w szablonie wskazówki zaczynu
  // (src/lib/wskazowka-zaczynu.ts); nie było go w przekładzie 093 [M1-audytor-generalny-093]
  'Do ostygnięcia do temp. pokojowej': 'Until cooled to room temperature',
  'Min. 4h lub przez noc w lodówce': 'At least 4 h or overnight in the fridge',
  // „Usuń wszystkie dane” (design-spec §ustawienia, docs/design/ekrany/teksty.js us.usun) [M1-audytor-generalny-124]
  'Usuń wszystkie dane': 'Delete All Data',
  'Usunąć wszystkie dane?': 'Delete all data?',
  'Usuń wszystko': 'Delete All',
  // Uprzedzenie przed końcem próby na „Dziś” (design-spec §11d 126, rola 04) [M1-audytor-generalny-126]
  'Okres próbny kończy się {data}': 'Your free trial ends on {data}',
  'Wtedy App Store pobierze {cena} za rok subskrypcji. Jeśli nie chcesz płacić, anuluj subskrypcję przed końcem próby.':
    "Then the App Store will charge {cena} for one year of your subscription. If you don't want to pay, cancel your subscription before the trial ends.",
  'Wtedy App Store pobierze {cena} za miesiąc subskrypcji. Jeśli nie chcesz płacić, anuluj subskrypcję przed końcem próby.':
    "Then the App Store will charge {cena} for one month of your subscription. If you don't want to pay, cancel your subscription before the trial ends.",
  'Subskrypcja się nie odnowi, więc nic nie zapłacisz.': "Your subscription won't renew, so you won't be charged.",
  'Jeśli subskrypcja nie jest anulowana, App Store pobierze wtedy opłatę za wybrany plan.':
    "If your subscription isn't canceled, the App Store will then charge for the plan you chose.",
  // Nazwa planu jak w istniejącym EN („…require Baker Pro.”), nie „Piekarz Pro” z teksty.js roli 04 (znalezisko do raportu)
  'Bez zakupu zostaną historia i twoje dane. Liczenie, plan i prowadzenie będą wymagać Piekarz Pro.':
    'Without a purchase, your history and data stay. Calculations, plans, and guidance will require Baker Pro.',
  'Zamknij informację o końcu próby': 'Close trial end notice',

  // Porady karty szczytu zakwasu w lodówce: docs/tresci/en/zakwas-z-lodowki.md [M1-audytor-generalny-132; 06-tresci-502]
  'Według King Arthur Baking przed pieczeniem dokarm zakwas z lodówki i zostaw go w temperaturze pokojowej; może potrzebować nawet 12 godzin, żeby pokazać oznaki życia.':
    'According to King Arthur Baking, before baking, feed the starter from the fridge and leave it at room temperature; it may take up to 12 hours to show signs of life.',
  'Zakwas trzymany w lodówce dokarmia się raz w tygodniu. Według King Arthur Baking przed pieczeniem dokarmiaj go co 12 godzin, aż w ciągu 6–8 godzin po dokarmieniu podwoi albo potroi objętość.':
    'A starter kept in the fridge is fed once a week. According to King Arthur Baking, before baking, feed it every 12 hours until it doubles or triples in volume within 6–8 hours of feeding.',

  // Wskazówka zaczynu: docs/tresci/en/zaczyny.md [M1-audytor-generalny-131; 01-odkrywanie-502, 06-tresci-503]
  'Pâte Fermentée (Stare ciasto)': 'Pâte Fermentée (Old dough)',
  'Levain (Rzemieślniczy zaczyn na zakwasie)': 'Levain (Artisan sourdough preferment)',
  'według King Arthur Baking od 8 godzin (więcej drożdży) do 14–16 godzin (mniej drożdży)':
    'according to King Arthur Baking, from 8 hours (more yeast) to 14–16 hours (less yeast)',
  'według Bread Bakers Guild of America 18 godzin w temperaturze ok. 15,6 °C':
    'according to the Bread Bakers Guild of America, 18 hours at about 15.6 °C',
  'według Bread Bakers Guild of America co najmniej 3 godziny w temperaturze pokojowej albo 1 godzina, a potem najwyżej 3 dni w lodówce':
    'according to the Bread Bakers Guild of America, at least 3 hours at room temperature, or 1 hour and then at most 3 days in the fridge',
  'według King Arthur Baking ok. 6–8 godzin, aż podwoi objętość i będzie pełen pęcherzyków':
    'according to King Arthur Baking, about 6–8 hours, until it doubles in volume and is full of bubbles',
  'Złożony bukiet kwasów mlekowego i octowego.': 'Complex bouquet of lactic and acetic acids.',

  // Doktor Chleba i porada mieszanki mąk: docs/tresci/en/doktor-chleba.md, maki-chlonnosc.md [M1-audytor-generalny-133; 06-tresci-504]
  'Chleb wyjęty z pieca nie jest jeszcze gotowy: według King Arthur Baking w czasie studzenia oddaje wilgoć, a miękisz potrzebuje tego czasu, żeby się ustalić, więc pokrojony za wcześnie może być gumowaty. Inną przyczyną może być niedopieczenie: według King Arthur Baking większość bochenków jest upieczona, gdy w środku ma ok. 88 °C.':
    'Bread taken out of the oven is not done yet: according to King Arthur Baking, it releases moisture as it cools and the crumb needs that time to set, so if sliced too early it may be gummy. Another cause may be underbaking: according to King Arthur Baking, most loaves are done when the centre reaches about 88 °C.',
  'Przed krojeniem poczekaj, aż bochenek całkowicie ostygnie. Według King Arthur Baking upieczony chleb żytni na zakwasie powinien odpocząć 24 godziny przed krojeniem, dla najlepszej jakości.':
    'Before slicing, wait until the loaf has cooled completely. According to King Arthur Baking, a baked sourdough rye bread should rest for 24 hours before slicing, for best quality.',
  'Sprawdź temperaturę w środku bochenka termometrem szpilkowym: według King Arthur Baking większość bochenków jest upieczona przy ok. 88 °C, a chleb żytni powinien mieć w środku 96–99 °C.':
    'Check the temperature in the centre of the loaf with a probe thermometer: according to King Arthur Baking, most loaves are done at about 88 °C, and rye bread should reach 96–99 °C in the centre.',
  'Jeśli w środku jest chłodniej, piecz dłużej i zmierz ponownie.':
    'If the centre is cooler, bake longer and measure again.',
  'Wydłuż fermentację burzliwą.':
    'Extend the bulk fermentation.',
  'Policz temperaturę wody w recepturze: według King Arthur Baking ciasto pszenne po wymieszaniu powinno mieć ok. 24–25,5 °C.':
    'Work out the water temperature in the recipe: according to King Arthur Baking, wheat dough should be about 24–25.5 °C after mixing.',
  'Zmniejsz udział zakwasu w recepturze.':
    'Reduce the share of starter in the recipe.',
  'Obniż temperaturę lodówki: według King Arthur Baking niższa temperatura spowalnia fermentację.':
    'Lower the fridge temperature: according to King Arthur Baking, a lower temperature slows fermentation.',
  'Piecz pod pokrywą w garnku: według King Arthur Baking para pod pokrywką dłużej utrzymuje skórkę miękką, więc bochenek może dalej rosnąć na początku pieczenia.':
    'Bake covered in a pot: according to King Arthur Baking, steam under the lid keeps the crust soft longer, so the loaf can keep rising at the start of baking.',
  'Prowadź zakrzywione ostrze pod kątem ok. 30° do powierzchni ciasta, na głębokość ok. 6–13 mm: według King Arthur Baking płytsze nacięcie może się zrosnąć w czasie pieczenia.':
    'Hold a curved blade at about 30° to the dough surface and cut about 6–13 mm deep: according to King Arthur Baking, a shallower cut may fuse back together during baking.',
  'Według King Arthur Baking nacięcie prosto, pod kątem 90°, rozchyla się na boki, a ucho powstaje przy nacięciu pod płaskim kątem z napiętej zewnętrznej warstwy ciasta uformowanego z wystarczającym napięciem.':
    'According to King Arthur Baking, a straight-on cut at 90° splays open to the sides, while an ear forms with a cut at a shallow angle, from the taut outer layer of dough shaped with sufficient tension.',
  'Pochyl zakrzywione ostrze pod kątem ok. 30° do powierzchni ciasta: według King Arthur Baking sprzyja to powstaniu płatu ciasta, który odchyla się w ucho.':
    'Tilt a curved blade to about 30° to the dough surface: according to King Arthur Baking, this promotes a flap of dough that peels back into an ear.',
  'Nagrzej pusty garnek przed włożeniem ciasta: według King Arthur Baking około 30 minut, żeby powstała w nim para.':
    'Preheat the empty pot before putting the dough in: according to King Arthur Baking, about 30 minutes, so that steam forms in it.',
  'Po zdjęciu pokrywy piecz dalej: według King Arthur Baking chleb bez pokrywki piecze się, aż w pełni się zrumieni.':
    'After removing the lid, keep baking: according to King Arthur Baking, the uncovered bread bakes until it is fully browned.',
  'Dokarmiaj zakwas częściej przed wypiekiem.':
    'Feed the starter more often before baking.',
  'Skróć fermentację burzliwą i pilnuj temperatury ciasta: według King Arthur Baking ciasto pszenne po wymieszaniu powinno mieć ok. 24–25,5 °C.':
    'Shorten the bulk fermentation and watch the dough temperature: according to King Arthur Baking, wheat dough should be about 24–25.5 °C after mixing.',
  'Garuj ciasto w lodówce: według King Arthur Baking chłód spowalnia fermentację, a wolniejsza fermentacja pogłębia smak.':
    'Proof the dough in the fridge: according to King Arthur Baking, cold slows fermentation, and slower fermentation deepens the flavour.',
  'Zwiększ udział zakwasu w recepturze.':
    'Increase the share of starter in the recipe.',
  'Dodaj do receptury trochę mąki pełnoziarnistej (żytniej lub pszennej).':
    'Add some whole-grain flour (rye or wheat) to the recipe.',
  'Zbyt niska hydratacja ciasta, słaba mąka o niskiej zawartości białka lub niedostatecznie rozwinięty gluten.':
    'Dough hydration too low, weak flour with low protein content or underdeveloped gluten.',
  'Zwiększ hydratację receptury.':
    'Increase the recipe hydration.',
  'Użyj mąki chlebowej o wyższej zawartości białka.':
    'Use bread flour with a higher protein content.',
  'Wydłuż autolizę i dodaj dodatkową serię składań coil fold.':
    'Extend the autolyse and add an extra set of coil folds.',
  'Ciasto może być zwarte, nawet sztywne. Możesz dolać więcej wody.':
    'The dough may feel firm or even stiff. You can add more water.',
  'Hydratacja mieści się w zakresie podanym dla tej mieszanki mąk.':
    'The hydration is within the range given for this flour blend.',
  'Hydratacja jest blisko zakresu podanego dla tej mieszanki mąk.':
    'The hydration is close to the range given for this flour blend.',
  // Osobne zdanie pod mieszanką z żytem ≥ 40% [M1-audytor-generalny-134]
  'Wysoki udział żyta — ciasto będzie kleiste, unikaj agresywnego wyrabiania.':
    'High rye share: the dough will be sticky, so avoid vigorous kneading.',
  // Tekst receptury do udostępnienia (src/lib/recipe-formatter.ts): zdanie w nawiasie i skrót temperatury wody
  // jako klucze, bez sklejania i toLowerCase [M1-audytor-generalny-172; 09-lokalizacja-509]
  '{n}x ~{masa} upieczony bochenek': '{n}x ~{masa} baked loaf',
  'temp. {temp}': 'temp. {temp}',

  // Kroki starego zapisu sesji (src/core/legacy-steps-v1.ts, Stolnica przez t()) i błąd kopii przed importem
  // (src/lib/backup.ts, Alert importu) — widoczne teksty bez klucza [M1-audytor-generalny-147; 09-lokalizacja-505]
  'Połącz mąkę z wodą, nie dodawaj jeszcze zakwasu ani soli. Pozwól glutenowi i enzymom samoczynnie rozwinąć strukturę ciasta.':
    'Combine the flour and water; do not add the starter or salt yet. Let the gluten and enzymes develop the dough structure on their own.',
  'Dodaj aktywny zakwas i sól. Wyrabiaj techniką Rubaud lub delikatnym podwijaniem aż ciasto stanie się gładkie i elastyczne.':
    'Add the active starter and salt. Mix using the Rubaud method or gentle folding until the dough becomes smooth and elastic.',
  'Mieszanie i zaszczepienie': 'Mixing and adding the starter',
  'Składanie 1 (Stretch & Fold)': 'Fold 1 (Stretch & Fold)',
  'Mokrymi dłońmi podciągnij 4 brzegi ciasta ku górze i złóż do środka miski.':
    'With wet hands, lift the 4 edges of the dough upward and fold them into the centre of the bowl.',
  'Składanie 2 (Coil Fold)': 'Fold 2 (Coil Fold)',
  'Delikatnie podłóż obie dłonie pod środek ciasta, unieś i pozwól końcom zawinąć się pod spód.':
    'Gently slide both hands under the middle of the dough, lift it and let the ends tuck underneath.',
  'Składanie 3 (Coil Fold)': 'Fold 3 (Coil Fold)',
  'Ostatnie składanie budujące napięcie powierzchniowe. Ciasto powinno być puszyste i trzymać kształt kuli.':
    'The last fold, building surface tension. The dough should be airy and hold a round shape.',
  'Wyłóż ciasto na blat, podtocz delikatnie w kulę skrobakiem bez nadmiaru mąki. Zostaw na 20 min odpoczynku.':
    'Turn the dough out onto the counter and gently round it into a ball with a scraper, without excess flour. Let it rest for 20 min.',
  'Formowanie do koszyka i chłód': 'Shaping into the basket and chilling',
  'Nadaj ostateczny kształt (baton lub bochenek okrągły), umieść w oprószonym koszyku i schowaj do lodówki (4°C) na 12–16h.':
    'Give the final shape (batard or round loaf), place it in a floured basket and refrigerate (4°C) for 12–16 h.',
  'Wypiek w garnku z parą': 'Baking in a pot with steam',
  '20 min w nagrzanym garnku żeliwnym (240°C) pod pokrywką + 22–25 min bez pokrywki (210°C) do głębokiego zbrązowienia.':
    '20 min in a preheated cast-iron pot (240°C) with the lid on + 22–25 min without the lid (210°C) until deeply browned.',
  'Brak katalogu dokumentów aplikacji': "The app's documents folder is not available",
  'Trwa już inny wypiek': 'Another bake is already in progress',
  'Nowy wypiek zastąpi trwający. Jego postęp i powiadomienia znikną.':
    'A new bake will replace the one in progress. Its progress and notifications will be gone.',
  'Wróć do trwającego': 'Back to the bake in progress',
  'Przerwij tamten i zacznij nowy': 'Stop that one and start a new one',
};

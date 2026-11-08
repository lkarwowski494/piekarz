/**
 * Słownik EN, część 29 (M3 p9b-2: tryb maszyny do chleba, F-72, D-138). Zdania treści: docs/tresci/en/maszyna.md
 * (rola 06; machine.safety czeka na przegląd zdań właściciela, D-177); etykiety interfejsu z karty/README.md §6 i nowe
 * etykiety p9b-2 do akceptacji roli 04 (D-262). Pozostałe 33 języki: rola 09.
 */
export const EN_29: Record<string, string> = {
  // Segment i karty (karty/README.md §6, wiersz D-138)
  Piekarnik: 'Oven',
  'Maszyna do chleba': 'Bread machine',
  'Pojemność maszyny': 'Machine capacity',
  'Kolejność wkładania': 'Order of adding',
  'Program i godzina': 'Program and time',
  Program: 'Program',
  'Gotowe o': 'Ready at',
  'Kolejność i ilości według instrukcji maszyny.': "Order and amounts follow your machine's manual.",
  'Zapisz plan': 'Save plan',
  // Nowe etykiety p9b-2 (D-262, do akceptacji roli 04)
  'Największa ilość mąki': 'Largest amount of flour',
  'Największa masa ciasta': 'Largest dough weight',
  'Największa masa drożdży suchych': 'Largest amount of dry yeast',
  'Czas programu': 'Program time',
  'płyny najpierw': 'liquids first',
  'drożdże najpierw': 'yeast first',
  'Ilość ograniczyła granica Twojej maszyny; procenty receptury są te same.': "Your machine's limit capped the amount; the recipe percentages stay the same.",
  'Uzupełnij mąki w recepturze, żeby zobaczyć podpowiedź programu.': 'Add the flours to the recipe to see a program hint.',
  'Wpisz czas programu z instrukcji maszyny.': "Enter the program time from your machine's manual.",
  'W tej recepturze: {skladniki}.': 'In this recipe: {skladniki}.',
  'Program rusza o {godzina}.': 'The program starts at {godzina}.',
  'Ustaw opóźniony start na {czas}.': 'Set the delayed start to {czas}.',
  'Od teraz do gotowości: {czas}.': 'From now until ready: {czas}.',
  'Program nie zdąży. Najwcześniej gotowe o {godzina}.': 'The program will not finish in time. Earliest ready time: {godzina}.',
  'Po programie': 'After the program',
  'ciasto|program maszyny': 'dough',
  'słodki|program maszyny': 'sweet',
  'pełnoziarnisty|program maszyny': 'whole wheat',
  'francuski|program maszyny': 'French',
  'podstawowy|program maszyny': 'basic',
  'jajka|składnik': 'eggs',
  'świeże mleko|składnik': 'fresh milk',
  'ser|składnik': 'cheese',
  'jogurt|składnik': 'yogurt',
  'sok|składnik': 'juice',
  'świeże owoce|składnik': 'fresh fruit',
  'warzywa|składnik': 'vegetables',
  // machine.capacity
  'Wpisz z instrukcji swojej maszyny największą ilość mąki, a jeśli instrukcja ją podaje, także największą masę ciasta i drożdży; Piekarz nie przeliczy receptury ponad żadną z tych granic.':
    "Enter the largest amount of flour from your machine's manual and, if the manual gives them, the largest dough and yeast amounts; the app will not scale the recipe above any of these limits.",
  'Na przykład w Tefal PF220838 nie wolno przekroczyć łącznie 1000 g ciasta, 620 g mąki chlebowej i 10 g suchych drożdży instant.':
    'For example, the Tefal PF220838 must not exceed 1000 g of dough, 620 g of bread flour and 10 g of dry instant yeast in total.',
  // machine.order
  'Kolejność wkładania składników podaje instrukcja Twojej maszyny.': "Your machine's manual gives the order for adding ingredients.",
  'W większości przeczytanych instrukcji najpierw wlewa się płyny, potem wsypuje mąkę i inne suche składniki, a drożdże na wierzch, tak by nie dotykały płynów.':
    'Most manuals we read put liquids in first, then flour and other dry ingredients, and the yeast on top so it does not touch the liquids.',
  'W niektórych maszynach jest odwrotnie: najpierw suche drożdże, na nie mąka i suche składniki, a płyn na końcu.':
    'Some machines work the other way round: dry yeast first, flour and dry ingredients on it, and the liquid last.',
  // machine.delayBlocked
  'Opóźniony start jest wyłączony, bo receptura ma jajka, świeże mleko, ser, jogurt, sok, świeże owoce albo warzywa.':
    'Delayed start is off because the recipe has eggs, fresh milk, cheese, yogurt, juice, fresh fruit or vegetables.',
  'Każda z przeczytanych instrukcji maszyn zabrania opóźnionego startu z częścią tych składników, bo łatwo się psują.':
    'Each machine manual we read forbids delayed start with some of these ingredients because they spoil easily.',
  'Według jednej z instrukcji mleko w proszku zamiast świeżego mleka pozwala użyć opóźnionego startu, więc Piekarz go nie blokuje.':
    'According to one manual, dry milk instead of fresh milk allows delayed start, so the app does not block it.',
  // MAS-085 (P9B2F-1)
  'Według czterech z pięciu przeczytanych instrukcji opóźniony start nie działa albo nie jest zalecany w programie samego ciasta, więc Piekarz go nie proponuje.':
    'According to four of the five manuals we read, delayed start does not work or is not recommended in a dough-only program, so the app does not offer it.',
  // machine.safety
  'Po pieczeniu formę wyjmuj w rękawicach kuchennych, bo forma, jej uchwyt i wnętrze pokrywy są gorące.':
    'After baking, take the pan out with oven mitts, because the pan, its handle and the inside of the lid are hot.',
  'Mieszadło, które zostało w bochenku, może być bardzo gorące: wyjmij je dopiero po ostygnięciu chleba, narzędziem z zestawu albo plastikową łopatką, bez noża i widelca, i dalej uważaj na oparzenie.':
    'A paddle left in the loaf may be very hot: remove it only after the bread cools, with the supplied tool or a plastic spatula, not a knife or fork, and still mind burns.',
  'Przy otwieraniu pokrywy w trakcie albo pod koniec programu może wydostać się gorąca para.': 'Hot steam may escape when you open the lid during or at the end of a program.',
  'W czasie pracy nie dotykaj otworu pary i go nie zasłaniaj.': 'While the machine runs, do not touch or cover the steam vent.',
  'Dzieci poniżej 8 lat trzymaj z dala od maszyny i przewodu, a starsze mogą jej używać tylko pod nadzorem.':
    'Keep children under 8 away from the machine and its cord, and let older children use it only under supervision.',
  // machine.programHint
  'Podpowiedź programu to reguła Piekarza, nie zalecenie producenta, więc sprawdź ją w instrukcji swojej maszyny.':
    "The program hint is the app's rule, not the maker's advice, so check it against your machine's manual.",
  'Program „ciasto” podpowiadamy dla wypieków kształtowanych i pieczonych w piekarniku, bo w nim maszyna przygotowuje ciasto, ale go nie piecze.':
    'We suggest the dough program for breads shaped and baked in the oven, because in it the machine prepares the dough but does not bake it.',
  'Program „słodki” podpowiadamy dla receptur słodkich, bo według opisu w instrukcji jednej z maszyn jest przeznaczony dla chlebów z dużą ilością cukru, tłuszczu i białka.':
    "We suggest the sweet program for sweet recipes, because, as one machine's manual describes it, it is made for breads with a lot of sugar, fat and protein.",
  'Program „pełnoziarnisty” podpowiadamy, gdy mąka pełnoziarnista i żytnia to razem co najmniej 50% mąki, jak w progu z instrukcji jednej z maszyn.':
    "We suggest the whole wheat program when wholegrain and rye flour together make up at least 50% of the flour, as in the threshold from one machine's manual.",
  'Program „francuski” podpowiadamy dla receptur bez cukru i tłuszczu, jak w opisie z instrukcji jednej z maszyn.':
    "We suggest the French program for recipes without sugar or fat, as in one machine's manual.",
  'W pozostałych recepturach podpowiadamy program podstawowy, według opisu w instrukcji jednej z maszyn przeznaczony głównie dla jasnej mąki pszennej.':
    "For other recipes we suggest the basic program, which one machine's manual describes as meant mainly for white wheat flour.",
  // machine.sourdough
  'W przeczytanych instrukcjach maszyn programy na zakwasie używają także drożdży piekarskich.': 'In the machine manuals we read, sourdough programs also use baker\'s yeast.',
  'Dlatego w trybie maszyny ta receptura używa wersji na drożdżach.': 'So in machine mode this recipe uses its yeast version.',
};

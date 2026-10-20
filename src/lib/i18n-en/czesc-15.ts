/**
 * Słownik EN, część 15: teksty PL bez angielskich wstawek w nawiasach — kroki planu, Doktor Chleba, testy kuchenne,
 * pogotowie ciasta, faza garnka (design-spec §8) [M1-audytor-generalny-112; 04-studio-projektowe-027]. Wartości EN
 * przeniesione bez zmian ze starych kluczy (EN może mieć termin angielski). Stare klucze kroków planu zostają w części 12
 * dla wypieków zapisanych przed zmianą (nazwa i instrukcja kroku są w zapisie sesji). Dalej: karta dokarmienia
 * i „Importuj z pliku” [M1-audytor-generalny-113].
 */
export const EN_15: Record<string, string> = {
  'Wymieszanie z solą i zakwasem':
    'Mixing in salt and starter (Bassinage)',
  'Wykonaj 4 serie składań co 30–45 minut.':
    'Perform 4 sets of folds (Stretch & Fold / Coil Fold) every 30–45 minutes.',
  'Formowanie wstępne':
    'Pre-shaping (Pre-shape)',
  'Odpoczynek na desce':
    'Rest on the board (Bench Rest)',
  'Garowanie chłodnicze w lodówce':
    'Cold proofing in the fridge (Cold Retard)',
  'Sugerowana korekta: wydłuż czas garowania w lodówce o 2–4 godziny lub przesuń godzinę dokarmienia zakwasu, aby ominąć nocne etapy stolnicowe.':
    'Suggested fix: extend the fridge proof (Cold Retard) by 2–4 hours or move the starter feeding time to avoid hands-on stages at night.',
  'Gumowaty, lepki miękisz':
    'Gummy, sticky crumb (Gummy Crumb)',
  'Niedofermentowanie':
    'Under-proofing (Under-proofed / Flying Crust)',
  'Upewnij się, że zakwas został użyty w szczycie objętości.':
    'Make sure the starter was used at peak volume (Peak).',
  'Wykonaj test palca przed włożeniem bochenka do piekarnika.':
    'Do the poke test (Poke Test) before putting the loaf in the oven.',
  'Przekwaszenie / Przerośnięcie':
    'Over-souring / Over-proofing (Over-proofed)',
  'Pęknięcie boku bochenka':
    'Side of the loaf burst (Side Blow-out)',
  'Brak uniesionego ucha':
    'No raised ear (Lack of Ear)',
  'Cięcie pionowe (90°) zamiast podcięcia pod kątem (30°) lub niedostateczne napięcie powierzchniowe przy formowaniu batarda.':
    'A vertical cut (90°) instead of an undercut at an angle (30°), or insufficient surface tension when shaping the batard (no Surface Tension).',
  'Blada skórka bez chrupkości':
    'Pale crust without crispness (Pale Crust)',
  'Skróć fermentację burzliwą i pilnuj temperatury ciasta (24–26°C).':
    'Shorten the bulk fermentation and watch the dough temperature (DDT 24–26°C).',
  'Płaski smak bez głębi':
    'Flat flavor without depth (Bland Flavor)',
  'Wprowadź garowanie chłodnicze w lodówce (12–16 godzin w 4°C).':
    'Introduce a cold proof in the fridge (Cold Retard, 12–16 hours at 4°C).',
  'Zbity, gęsty miękisz':
    'Tight, dense crumb (Dense Crumb)',
  'Polej wierzch oliwą, wbij palce w ciasto tworząc charakterystyczne wgłębienia.':
    'Drizzle the top with olive oil and press your fingers into the dough to make the characteristic dimples (dimpling).',
  'Zrezygnuj z koszyka rozrostowego. Użyj foremki keksowej.':
    'Skip the proofing basket. Use a loaf tin (Tin Loaf).',
  'Dodaj jedno dodatkowe delikatne złożenie, aby rozprowadzić ciepło.':
    'Do one extra gentle fold (Coil Fold) to distribute the heat.',
  'Sucha sól wyciąga punktowo wodę przez osmozę i tworzy grudki. Wprowadzenie w formie roztworu pozwala jonom Na+ i Cl- natychmiast zacieśnić wiązania glutenowe w całej objętości ciasta.':
    'Dry salt draws water out locally by osmosis and forms lumps. Adding it as a solution (bassinage) lets the Na+ and Cl- ions immediately tighten the gluten bonds throughout the dough.',
  'Pokrywka ZAMKNIĘTA. Maksymalna para i rozprężenie w piecu.':
    'Lid CLOSED. Maximum steam and expansion in the oven (Oven Spring).',
  'Test palca':
    'Poke Test',
  'Rozerwanie boku przy spodzie':
    'Bottom side blowout',
  // Karta dokarmienia i jedno wejście „Importuj z pliku” z podglądem według rodzaju pliku (design-spec §11c „113”,
  // docs/design/ekrany/teksty.js) [M1-audytor-generalny-113; 04-studio-projektowe-028]
  'Ilości do dokarmienia': 'Feeding Amounts',
  'Receptura z pliku': 'Recipe from File',
  'Kopia zapasowa z pliku': 'Backup from File',
  'Wklej zawartość pliku receptury albo kopii zapasowej.': 'Paste the contents of a recipe file or a backup file.',
  'Nazwa': 'Name',
  'Dodaj': 'Add',
  'Dodam ją do Moich receptur. Pozostałe dane zostaną bez zmian.': 'I\'ll add it to My Recipes. Your other data stays as it is.',
  'Receptura „{nazwa}” jest w Moich recepturach.': '“{nazwa}” is now in My Recipes.',
  'Kopia z {data}: {receptury}, {zakwasy}, {wpisy}.': 'Backup from {data}: {receptury}, {zakwasy}, {wpisy}.',
  'Kopia: {receptury}, {zakwasy}, {wpisy}.': 'Backup: {receptury}, {zakwasy}, {wpisy}.',
  'Import zastąpi wszystkie dane w aplikacji danymi z kopii. Przed importem zapiszę kopię obecnych danych.':
    'Importing replaces all data in the app with the data from the backup. Before importing, I\'ll save a copy of your current data.',
  'Zastąp dane': 'Replace Data',
  'Tego pliku nie rozpoznaję. Piekarz importuje plik receptury i plik kopii zapasowej z Piekarza.':
    'I don\'t recognize this file. Piekarz imports recipe files and backup files made in Piekarz.',
  '{n} receptura': '{n} recipe',
  '{n} receptury': '{n} recipes',
  '{n} receptur': '{n} recipes',
  '{n} zakwas': '{n} starter',
  '{n} zakwasy': '{n} starters',
  '{n} zakwasów': '{n} starters',
  '{n} zakwasu': '{n} starters',
  '{n} wpis w Dzienniku': '{n} journal entry',
  '{n} wpisy w Dzienniku': '{n} journal entries',
  '{n} wpisów w Dzienniku': '{n} journal entries',
  '{n} wpisu w Dzienniku': '{n} journal entries',
  // Tytuł Ostrzeżenia według rodzaju zagrożenia (design-spec §11c „109”) [M1-audytor-generalny-109; 04-studio-projektowe-035]
  'Gorące naczynie': 'Hot cookware',
  'Surowy zakwas': 'Raw starter',
  'Surowe ciasto i mąka': 'Raw dough and flour',
  'Dzieci w kuchni': 'Children in the kitchen',
  'Uważaj w kuchni': 'Take care in the kitchen',
  // Teksty prowadzenia z makiety (docs/design/ekrany/prowadzenie.html, teksty.js pw.gotoweJutro, pw.do1115, pw.potem,
  // pw.ekranNieZgasnie, pw.doPotemBez, pw.2minPo) [M1-audytor-generalny-114; 04-studio-projektowe-029]
  'Gotowe {dzien} o {godzina}': 'Ready {dzien} at {godzina}',
  'do {godzina}, potem {krok}': 'until {godzina}, then {krok}',
  'do {godzina}': 'until {godzina}',
  'Potem: {krok}, {czas}, do {godzina}': 'Next: {krok}, {czas}, until {godzina}',
  'Potem: {krok}': 'Next: {krok}',
  'Ekran nie zgaśnie do końca kroku. Powiadomienie o {godzina}.': 'The screen will stay on until the step ends. Notification at {godzina}.',
  'pieczenie bez pokrywy': 'bake uncovered',
  '{czas} po czasie': '{czas} overdue',
  '{h} h {m} min': '{h} h {m} min',
  '{h} h': '{h} h',
  '{n} min': '{n} min',
  '{n} s': '{n} s',
  '{n} sekunda': '{n} second',
  '{n} sekundy': '{n} seconds',
  '{n} sekund': '{n} seconds',
  // Plan wypieku: stan „za późno” (design-spec §11c „107”, teksty.js pl.zaPozno*, pl.ustawTe, pl.zacznijPowod)
  // [M1-audytor-generalny-107; 04-studio-projektowe-024]
  'wczoraj': 'yesterday',
  'Nie zdążysz na tę godzinę': 'Not enough time for this',
  'Plan musiałby się zacząć {dzienStartu} o {godzinaStartu}. Najwcześniej chleb będzie gotowy {dzienGotowe} o {godzinaGotowe}.':
    'The plan would have to start {dzienStartu} at {godzinaStartu}. The earliest the bread can be ready is {dzienGotowe} at {godzinaGotowe}.',
  'Ustaw tę godzinę': 'Use This Time',
  'Najpierw ustaw godzinę, na którą zdążysz.': 'First set a time you can make.',
  // Puste stany i teksty bez wykrzyknika, strzałki i „Uwaga…!” (design-spec §11c „116”, teksty.js dz.*, pl.calosc)
  // [M1-audytor-generalny-116; 04-studio-projektowe-034]
  'Tu zapiszą się twoje wypieki': 'Your bakes will appear here',
  'Po każdym wypieku zapiszę recepturę, datę i twoją ocenę. Zacznij od receptury.':
    'After each bake, I\'ll save the recipe, the date, and your rating. Start with a recipe.',
  'Wybierz recepturę': 'Choose a Recipe',
  '{krok} wypada o {godzina} w nocy': '{krok} falls at {godzina} during the night',
  '{n} krok wypada w nocy': '{n} step falls during the night',
  '{n} kroki wypadają w nocy': '{n} steps fall during the night',
  '{n} kroków wypada w nocy': '{n} steps fall during the night',
  'W nocy': 'At night',
  'Przesuń do lodówki': 'Move to fridge',
  'Wszystkie mąki z tej receptury są w spiżarni.': 'All flours for this recipe are in your pantry.',
  'Zaimportowano': 'Imported',
  'Dane z kopii są w aplikacji. Poprzednie dane zapisałem w kopii przed importem.':
    'The backup data is now in the app. I saved your previous data in a pre-import backup.',
  'Dane z kopii są w aplikacji. Pominięte uszkodzone wpisy: {n}. Poprzednie dane zapisałem w kopii przed importem.':
    'The backup data is now in the app. Damaged entries skipped: {n}. I saved your previous data in a pre-import backup.',
  'Zbity, gęsty miękisz.': 'Dense, tight crumb.',
  'Równomierny miękisz.': 'Even crumb.',
  'Bardzo otwarty miękisz.': 'Very open crumb.',
  'Koniec kroku: {nazwa}': 'Step finished: {nazwa}',
  'Start {dzien} o {godzina}': 'Start {dzien} at {godzina}',
  'Całość trwa {czas}.': 'Takes {czas} in total.',
  'Studzenie na kratce': 'Cooling on a rack',
  'Zdejmij pokrywkę garnka. Wypuść parę.': 'Remove the Dutch oven lid. Release the steam.',
  'Wypiek w garnku zakończony. Wyjmij chleb na kratkę.': 'Dutch oven bake finished. Place the bread on a wire rack.',
  'Optymalny moment. Rozgrzewaj piec i szykuj żyletkę.': 'Right on time. Preheat the oven and get your blade ready.',
};

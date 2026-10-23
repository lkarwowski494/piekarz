/**
 * Słownik EN, część 14: prowadzenie wypieku w widoku skupionym — pasek kciuka (słownik akcji design-spec §5,
 * makieta docs/design/ekrany/teksty.js) [M1-audytor-generalny-056, -100, -102, -103] oraz ekrany zakwasu — karta
 * cyklu, dziennik wpisów z „Edytuj” i „Przywróć”, zakładanie dzień po dniu, Doktor zakwasu, stan z lodówki
 * (makieta docs/design/ekrany/zakwas.html) [M1-audytor-generalny-104]. Treści dziedzinowe zakwasu: część 13.
 */
export const EN_14: Record<string, string> = {
  'Cofnij poprzedni': 'Undo Previous',
  'Po co ten krok': 'Why this step',
  // Pasek „Cofnij” po „Cofnij poprzedni” (design-spec §5, stan po-cofnieciu) [M1-audytor-generalny-102]
  'Cofnięto „{krok}”. Powiadomienia wróciły do poprzednich godzin.': 'Undid “{krok}.” Notifications are back to their previous times.',
  'Przywróć': 'Restore',

  // „Po co ten krok”: docs/tresci/en/po-co-ten-krok.md (KRO-POC-001…016) [M1-audytor-generalny-100]
  'Drożdże i bakterie w zakwasie trzeba regularnie dokarmiać świeżą mąką i wodą, żeby przetrwały i się namnażały.':
    'The yeast and bacteria in a starter need regular feeding with fresh flour and water to survive and grow.',
  'Zakwas jest gotowy do pieczenia, gdy po dokarmieniu podwaja objętość w ciągu 6–8 godzin i jest pełen pęcherzyków.':
    'Your starter is ready to bake with when it doubles within 6–8 hours of a feed and is full of bubbles.',
  'Gdy mąka z wodą odpocznie przed dodaniem soli, mąka wchłania wodę, zaczyna się tworzyć gluten, a ciasto łatwiej się wyrabia.':
    'Resting the flour and water before adding salt lets the flour soak up the water, gets the gluten started and makes kneading easier.',
  'Wyrabianie rozwija gluten, dzięki czemu ciasto zatrzymuje gaz z drożdży i rośnie.':
    'Kneading develops the gluten, so the dough holds on to the gas from the yeast and rises.',
  'W czasie fermentacji powstają kwasy, które dają ciastu smak i siłę, oraz dwutlenek węgla, który daje mu objętość i lekkość.':
    'Fermentation makes acids, which give the dough flavour and strength, and carbon dioxide, which gives it volume and lightness.',
  'Składanie pomaga rozwinąć sieć glutenową i wzmacnia ciasto.': 'Folding helps develop the gluten network and strengthens the dough.',
  'Formowanie wstępne nadaje ciastu ogólny kształt bochenka, jeszcze bez wykańczania.':
    'Pre-shaping gives the dough a rough loaf shape, before the finishing touches.',
  'Każde dotknięcie ciasta napina gluten, a odpoczynek go rozluźnia, więc potem łatwiej uformujesz bochenek.':
    'Every time you handle the dough the gluten tightens, and a rest relaxes it, so final shaping goes more easily.',
  'Koszyk podtrzymuje rosnący bochenek i nadaje mu kształt.': 'The basket supports the rising loaf and gives it its shape.',
  'To ostatnie rośnięcie ciasta przed pieczeniem.': "This is the dough's last rise before baking.",
  'Chłód lodówki spowalnia fermentację, a wolniejsza fermentacja daje głębszy smak.':
    'The cold of the fridge slows fermentation, and slower fermentation means deeper flavour.',
  'Garnek nagrzewasz pusty, żeby po włożeniu ciasta zrobiła się w nim para.':
    'You preheat the pot empty so steam builds up inside once the dough goes in.',
  'Nacięcie wyznacza miejsce, w którym bochenek się rozejdzie, więc chleb trzyma kształt i nie pęka z boku.':
    "The slash gives the loaf a place to open up, so it keeps its shape and doesn't burst at the side.",
  'Para pod pokrywką dłużej trzyma skórkę miękką, więc bochenek może jeszcze rosnąć na początku pieczenia.':
    'Steam under the lid keeps the crust soft for longer, so the loaf can keep rising early in the bake.',
  'Bez pokrywki chleb piecze się dalej, aż porządnie się zrumieni.':
    "With the lid off, the bread keeps baking until it's fully browned.",
  'Chleb oddaje wilgoć, gdy stygnie, a miękisz potrzebuje tego czasu, żeby się ustalić.':
    'Bread gives off moisture as it cools, and the crumb needs that time to set.',
  'Pokrojony za wcześnie może być gumowaty.': 'Sliced too early, it can be gummy.',
  'Wilgotnym, zwartym chlebom z dużym udziałem żyta często służy studzenie nawet do 24 godzin.':
    'Moist, dense breads with a high share of rye often benefit from cooling for up to 24 hours.',

  // Ekrany zakwasu [M1-audytor-generalny-104]; „Przywróć” wyżej (wspólny z paskiem prowadzenia)
  // słownik akcji §5 i makieta zakwas.html (teksty.js: zk.*)
  'Podwoił objętość': 'Doubled in volume',
  'Coś mnie niepokoi': 'Something Looks Off',
  'Ostatnie wpisy': 'Recent Entries',
  'Co dziś zrobić': 'What to do today',
  'Co widzisz?': 'What do you see?',
  'Bąbelki': 'Bubbles',
  'Urósł od kreski': 'Rose above the mark',
  'Nic się nie dzieje': 'Nothing is happening',
  'Kolorowe plamy albo puszysty nalot': 'Colored spots or fuzzy growth',
  'Zostaw zapis i wróć': 'Keep Entry and Go Back',
  'Dzień {n}': 'Day {n}',
  'Zapisz dzień {n}': 'Save Day {n}',
  'dokarmiony o {godzina}, następne o {nastepne}': 'fed at {godzina}, next at {nastepne}',
  '{czas} od dokarmienia': '{czas} since feeding',
  'Zaznacz, gdy zakwas podwoi się od kreski na słoiku. Wtedy jest gotowy do ciasta.':
    "Tick this when the starter has doubled from the mark on the jar. Then it's ready for dough.",
  'na blacie, {proporcja}': 'on the counter, {proporcja}',
  // nowe teksty według §8 „Głos” (do przeglądu roli 04)
  'na blacie': 'on the counter',
  'w lodówce, {proporcja}': 'in the fridge, {proporcja}',
  'w lodówce': 'in the fridge',
  'Nie ma jeszcze wpisu dokarmienia. Zapisz dokarmienie, gdy dokarmisz zakwas.': 'No feeding logged yet. Log Feeding when you feed the starter.',
  'Gotowy do ciasta.': 'Ready for dough.',
  'Dokarmienie': 'Feeding',
  'Dokarmienie {proporcja}': 'Feeding {proporcja}',
  'Obserwacja: {objawy}': 'Observation: {objawy}',
  '{dzien} {godzina}: {opis}': '{dzien} {godzina}: {opis}',
  'Edytuj wpis': 'Edit Entry',
  'Edytuj wpis: {opis}': 'Edit entry: {opis}',
  'Usuń wpis: {opis}': 'Delete entry: {opis}',
  'Usunięto wpis': 'Entry deleted',
  'Usunięto recepturę':
    'Recipe deleted',
  'Godzina': 'Hour',
  'Minuta': 'Minute',
  'Godzina od 0 do 23, minuty od 0 do 59.': 'Hour from 0 to 23, minutes from 0 to 59.',
  'Dzień {n} zakładania zakwasu': 'Day {n} of making the starter',
  'Następne dokarmienie: {dzien} o {godzina}.': 'Next feeding: {dzien} at {godzina}.',
  'Sprawdź, czy podwoi objętość do {godzina}.': 'Check whether it doubles by {godzina}.',
  'Proponowane mieszanie ciasta: {dzien} o {godzina}.': 'Suggested time to mix the dough: {dzien} at {godzina}.',
  'Doktor zakwasu': 'Starter Doctor',
  'Nie podwaja objętości': 'Does not double in volume',
  'Długo stał w lodówce bez dokarmiania': 'Sat in the fridge unfed for a long time',
  'Mój zakwas': 'My starter',
  // Tor p13b: informacja o soli (BR-KALK-011, RD-27, S-37) i udział żyta (BR-KALK-005, RD-20) [M1-audytor-generalny-130]
  'Sól {procent} to więcej niż zwykłe 1,8–2,0% masy mąki.':
    'Salt at {procent} is more than the usual 1.8–2.0% of the flour weight.',
  'Sól {procent} to mniej niż zwykłe 1,8–2,0% masy mąki.':
    'Salt at {procent} is less than the usual 1.8–2.0% of the flour weight.',
  'Udział żyta {n}%: wariant żytni, plan bez składań.':
    'Rye share {n}%: rye variant, no folds in the plan.',
  'Udział żyta {n}%: wariant pszenny.':
    'Rye share {n}%: wheat variant.',
  // Tor p13b: notatka z poprzedniego wypieku w planie przy 
  'Notatka z poprzedniego wypieku: {notatka}':
    'Note from your last bake: {notatka}',
  // Tor p13b: pola temperatur w arkuszu 
  'Temperatura w kuchni':
    'Kitchen temperature',
  'Temperatura zakwasu albo zaczynu':
    'Starter or preferment temperature',
  'Uzupełnij pole „{pole}”, żeby policzyć temperaturę wody.':
    'Fill in "{pole}" to calculate the water temperature.',
};

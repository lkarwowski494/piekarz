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
  'Według King Arthur Baking zakwas jest gotowy do pieczenia, gdy po dokarmieniu podwaja objętość w ciągu 6–8 godzin i jest pełen pęcherzyków.':
    'According to King Arthur Baking, a starter is ready for baking when it doubles in volume within 6–8 hours of feeding and is full of bubbles.',
  'Według King Arthur Baking odpoczynek mąki z wodą przed dodaniem soli pozwala mące wchłonąć wodę, rozpoczyna tworzenie glutenu i ułatwia wyrabianie.':
    'According to King Arthur Baking, resting flour and water before adding salt lets the flour absorb the water, starts gluten formation and makes kneading easier.',
  'Według King Arthur Baking wyrabianie rozwija gluten, dzięki czemu ciasto zatrzymuje gaz wytwarzany przez drożdże i rośnie.':
    'According to King Arthur Baking, kneading develops the gluten, so the dough traps the gas made by the yeast and rises.',
  'Według King Arthur Baking w czasie fermentacji powstają kwasy, które nadają ciastu smak i siłę, oraz dwutlenek węgla, który daje mu objętość i lekkość.':
    'According to King Arthur Baking, fermentation produces acids, which give the dough flavour and strength, and carbon dioxide, which gives it volume and lightness.',
  'Składanie pomaga rozwinąć sieć glutenową i wzmacnia ciasto.': 'Folding helps develop the gluten network and strengthens the dough.',
  'Według King Arthur Baking formowanie wstępne nadaje ciastu podstawowy kształt bochenka, jeszcze bez dopracowania.':
    'According to King Arthur Baking, pre-shaping gives the dough the basic shape of the loaf without refining it yet.',
  'Według King Arthur Baking każde dotykanie ciasta napina gluten, a odpoczynek go rozluźnia, więc ostateczne formowanie idzie łatwiej.':
    'According to King Arthur Baking, every time you handle dough the gluten tightens, and a rest relaxes it, so final shaping is easier.',
  'Według King Arthur Baking koszyk podtrzymuje i kształtuje rosnący bochenek.': 'According to King Arthur Baking, the basket supports and shapes the rising loaf.',
  'Według King Arthur Baking to ostatnie rośnięcie ciasta przed pieczeniem.': "According to King Arthur Baking, this is the dough's final rise before baking.",
  'Chłód lodówki spowalnia fermentację, a według tego samego źródła wolniejsza fermentacja pogłębia smak.':
    'The cold of the fridge slows fermentation, and according to the same source slower fermentation deepens the flavour.',
  'Według King Arthur Baking garnek nagrzewa się pusty, żeby po włożeniu ciasta powstała w nim para.':
    'According to King Arthur Baking, the pot is preheated empty so that steam forms inside it when the dough goes in.',
  'Według King Arthur Baking nacięcie wyznacza miejsce, w którym bochenek się rozszerza, więc chleb zachowuje kształt i nie pęka z boku.':
    'According to King Arthur Baking, the slash gives the loaf a place to expand, so the bread keeps its shape and does not burst at the side.',
  'Według King Arthur Baking para pod pokrywką dłużej utrzymuje skórkę miękką, więc bochenek może dalej rosnąć na początku pieczenia.':
    'According to King Arthur Baking, the steam under the lid keeps the crust soft longer, so the loaf can keep rising early in the bake.',
  'Według King Arthur Baking bez pokrywki chleb piecze się dalej, aż w pełni się zrumieni.':
    'According to King Arthur Baking, without the lid the bread keeps baking until it is fully browned.',
  'Według King Arthur Baking chleb w czasie studzenia oddaje wilgoć, a miękisz potrzebuje tego czasu, żeby się ustalić.':
    'According to King Arthur Baking, bread releases moisture as it cools, and the crumb needs that time to set.',
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
  'Zaznacz, gdy zakwas urośnie dwa razy od kreski na słoiku. Wtedy jest gotowy do ciasta (według King Arthur Baking).':
    "Check this when the starter has doubled from the mark on the jar. That's when it's ready for dough (per King Arthur Baking).",
  'na blacie, {proporcja}': 'on the counter, {proporcja}',
  // nowe teksty według §8 „Głos” (do przeglądu roli 04)
  'na blacie': 'on the counter',
  'w lodówce, {proporcja}': 'in the fridge, {proporcja}',
  'w lodówce': 'in the fridge',
  'Nie ma jeszcze wpisu dokarmienia. Zapisz dokarmienie, gdy dokarmisz zakwas.': 'No feeding logged yet. Log Feeding when you feed the starter.',
  'Gotowy do ciasta (według King Arthur Baking).': 'Ready for dough (per King Arthur Baking).',
  'Dokarmienie': 'Feeding',
  'Dokarmienie {proporcja}': 'Feeding {proporcja}',
  'Obserwacja: {objawy}': 'Observation: {objawy}',
  '{dzien} {godzina}: {opis}': '{dzien} {godzina}: {opis}',
  'Edytuj wpis': 'Edit Entry',
  'Edytuj wpis: {opis}': 'Edit entry: {opis}',
  'Usuń wpis: {opis}': 'Delete entry: {opis}',
  'Usunięto wpis': 'Entry deleted',
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
};

/**
 * Słownik EN, część 14: ekrany zakwasu — karta cyklu, dziennik wpisów z „Edytuj” i „Przywróć”, zakładanie dzień po
 * dniu, Doktor zakwasu, stan z lodówki (design-spec §5, makieta docs/design/ekrany/zakwas.html i teksty.js)
 * [M1-audytor-generalny-104]. Treści dziedzinowe są w części 13 (docs/tresci, rola 06).
 */
export const EN_14: Record<string, string> = {
  // słownik akcji §5 i makieta zakwas.html (teksty.js: zk.*)
  'Podwoił objętość': 'Doubled in volume',
  'Coś mnie niepokoi': 'Something Looks Off',
  'Przywróć': 'Restore',
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

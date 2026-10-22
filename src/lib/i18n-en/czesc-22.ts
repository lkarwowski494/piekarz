/**
 * Słownik EN, część 22 (M3 P-a, D-116): uprzedzenie o końcu Piekarz Pro i komunikat po wygaśnięciu (D-113). Teksty do
 * akceptacji roli 04 (P-b, D-117). Pozostałe 33 języki: docs/lokalizacja/czeka-na-przeklad.json (przebieg a5).
 */
export const EN_22: Record<string, string> = {
  'Piekarz Pro kończy się {data}': 'Baker Pro ends on {data}',
  'Subskrypcja się nie odnowi. Potem przypomnienia o dokarmianiu wyłączą się, a Twoje receptury, zakwasy i dziennik zostaną.':
    "Your subscription won't renew. After that, starter feeding reminders will turn off, and your recipes, starters and journal stay.",
  'Przypomnienia o dokarmianiu wyłączyły się. Twoje receptury, zakwasy i dziennik zostają.':
    'Starter feeding reminders have turned off. Your recipes, starters and journal stay.',
  'Zamknij informację o Piekarz Pro': 'Close the Baker Pro notice',
  // M3 P-a-fix: zakładanie zakwasu od nowa (P0-1) i zapis zmian własnej receptury (P1-1)
  'Załóż zakwas od nowa': 'Start the starter again',
  'Odznacz objawy': 'Clear Symptoms',
  'Założyć zakwas od nowa?': 'Start the starter again?',
  'Wpisy tego zakwasu zostaną usunięte, a zakładanie zacznie się od dnia 1 z dokarmieniem teraz.':
    "This starter's entries will be deleted, and making it will start again from day 1 with a feeding now.",
  'Zapisano zmiany w recepturze „{name}”.': 'Saved the changes to the recipe "{name}".',
  // M3 D10: zdanie na pasie Dziennika (opcja A); data w języku aplikacji (parametr {data})
  'Ostatni wypiek: {data}': 'Last bake: {data}',
};

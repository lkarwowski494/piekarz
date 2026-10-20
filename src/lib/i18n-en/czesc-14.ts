/**
 * Słownik EN, część 14: prowadzenie wypieku w widoku skupionym — pasek kciuka (słownik akcji design-spec §5,
 * makieta docs/design/ekrany/teksty.js) [M1-audytor-generalny-056].
 */
export const EN_14: Record<string, string> = {
  'Cofnij poprzedni': 'Undo Previous',
  'Po co ten krok': 'Why this step',
  // Pasek „Cofnij” po „Cofnij poprzedni” (design-spec §5, stan po-cofnieciu) [M1-audytor-generalny-102]
  'Cofnięto „{krok}”. Powiadomienia wróciły do poprzednich godzin.': 'Undid “{krok}.” Notifications are back to their previous times.',
  'Przywróć': 'Restore',
};

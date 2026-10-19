// Słownik EN, część 4: zakupy przez App Store (M1-audytor-generalny-008, -009, -027).
// Polski tekst jest kluczem. Całość składa src/lib/i18n.en.ts.
export const EN_4: Record<string, string> = {
  '12 miesięcy': '12 months',
  'Aktywuj plan roczny': 'Start yearly plan',
  'Aktywuj plan miesięczny': 'Start monthly plan',
  'Kup dostęp dożywotni': 'Buy lifetime access',
  'Pierwsze {dni} dni bezpłatnie, potem {cena}': 'First {dni} days free, then {cena}',
  'Wypróbuj {dni} dni': 'Try {dni} days',
  'Odblokuj pełny dostęp': 'Unlock full access',
  'Odblokuj wszystkie funkcje aplikacji. Bez zakupu dostępne zostają historia wypieków oraz podgląd, eksport i usuwanie Twoich danych.':
    'Unlock every feature of the app. Without a purchase, your bake history and viewing, exporting and deleting your data stay available.',
  // Przywracanie zakupów [M1-audytor-generalny-010]
  'Zakupy': 'Purchases',
  'Nie udało się połączyć z App Store. Spróbuj ponownie.': 'Could not connect to the App Store. Please try again.',
  // Ujawnienia ekranu zakupu [M1-audytor-generalny-011]
  '1 miesiąc': '1 month',
  'Odnawia się automatycznie co rok': 'Renews automatically every year',
  'Odnawia się automatycznie co miesiąc': 'Renews automatically every month',
  'Subskrypcja odnawia się automatycznie za cenę podaną przy planie, dopóki jej nie anulujesz. Płatność pobiera App Store z Twojego konta Apple. Subskrypcję anulujesz w każdej chwili w ustawieniach konta Apple albo przyciskiem „Zarządzaj subskrypcją”.':
    'The subscription renews automatically at the price shown for the plan until you cancel it. Payment is charged to your Apple Account by the App Store. You can cancel at any time in your Apple Account settings or with “Manage subscription”.',
  'Dostęp dożywotni to jednorazowy zakup bez odnawiania.': 'Lifetime access is a one-time purchase that does not renew.',
  'Zarządzaj subskrypcją': 'Manage subscription',
  // Propozycja Doktora po ocenie ≤ 2★ (BR-DIAG-001) [M1-audytor-generalny-032]
  'Sprawdzić przyczynę w Doktorze?': 'Check the cause in the Doctor?',
  'Wpis jest w historii. Doktor Chleba podpowie, co zmienić przy następnym wypieku.':
    'The entry is in your history. The Bread Doctor will suggest what to change next bake.',
  'Nie teraz': 'Not now',
  'Otwórz Doktora': 'Open Doctor',
  // Podtytuł akordeonu PRO bez ukrytej straty piecowej (F-48 PÓŹNIEJ) [M1-audytor-generalny-032]
  '4-DDT, matematyka lodu, prefermenty': '4-DDT, ice math, preferments',
  // Rytuał bez ukrywania receptur (F-26, ZM-14) [M1-audytor-generalny-032]
  'Wybierz swój styl wypieku. Ustawi on startowy filtr receptur w Kalkulatorze; wszystkie receptury zostają dostępne.':
    'Choose your baking style. It sets the starting recipe filter in the Calculator; all recipes stay available.',
  // Jedno wejście druku w Kalkulatorze (BR-DRUK-001) [M1-audytor-generalny-032]
  'Drukuj': 'Print',
  'Co chcesz wydrukować?': 'What do you want to print?',
  'Karta receptury A4': 'A4 recipe card',
  'Etykieta słoika zakwasu': 'Starter jar label',
  'Najpierw dodaj zakwas w zakładce Zakwas.': 'Add a starter in the Sourdough tab first.',
  'Który zakwas?': 'Which starter?',
  // Test palca w Stolnicy przy garowaniu końcowym (F-15, BR-ETAP-003) [M1-audytor-generalny-032]
  'Sprawdź gotowość: test palca': 'Check readiness: poke test',
  // Ostrzeżenie RD-05 o wodzie > 45 °C w Kalkulatorze [M1-audytor-generalny-039]
  'Uwaga: Obliczona temperatura wody przekracza 45°C. Ryzyko ugotowania drożdży i bakterii kwasu mlekowego! Schłodź mąkę lub obniż temperaturę otoczenia.':
    'Warning: the calculated water temperature exceeds 45°C. Risk of killing the yeast and lactic acid bacteria! Cool the flour or lower the room temperature.',
};

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
  'Zarządzaj subskrypcją': 'Manage Subscription',
  // Propozycja Doktora po ocenie ≤ 2★ (BR-DIAG-001) [M1-audytor-generalny-032]
  'Sprawdzić przyczynę w Doktorze?': 'Check the cause in the Doctor?',
  'Wpis jest w historii. Doktor Chleba podpowie, co zmienić przy następnym wypieku.':
    'The entry is in your history. The Bread Doctor will suggest what to change next bake.',
  'Nie teraz': 'Not Now',
  'Otwórz Doktora Chleba': 'Open Bread Doctor',
  // Podtytuł akordeonu PRO bez ukrytej straty piecowej (F-48 PÓŹNIEJ) [M1-audytor-generalny-032]
  'Temperatura wody i zaczyny': 'Water temperature and preferments',
  // Receptura: 4 akcje główne i menu „Więcej” (design-spec §11b „057”, słownik §5) [M1-audytor-generalny-057]
  'Ułóż plan': 'Make a Plan',
  'Zmień składniki': 'Change Ingredients',
  'Więcej działań: receptura': 'More actions: recipe',
  'Mieszanka mąk i zaczyny': 'Flour blend and preferments',
  'Mieszanka mąk, zaczyny, strata piecowa': 'Flour blend, preferments, bake loss',
  // Jedno wejście druku w Kalkulatorze (BR-DRUK-001) [M1-audytor-generalny-032]
  'Drukuj': 'Print',
  'Co chcesz wydrukować?': 'What do you want to print?',
  'Karta receptury A4': 'A4 recipe card',
  'Etykieta słoika zakwasu': 'Starter jar label',
  'Najpierw dodaj zakwas w zakładce Zakwas.': 'Add a starter in the Sourdough tab first.',
  'Który zakwas?': 'Which starter?',
  // Test palca w Stolnicy przy garowaniu końcowym (F-15, BR-ETAP-003) [M1-audytor-generalny-032]
  'Sprawdź gotowość: test palca': 'Check readiness: poke test',
  // Jeden model szczytu zakwasu, teksty z docs/tresci/en/zakwas-szczyt.md [M1-audytor-generalny-044]
  'Przed szacowanym szczytem': 'Before the estimated peak',
  'W szacowanym oknie szczytu': 'In the estimated peak window',
  'Po szacowanym szczycie': 'After the estimated peak',
  'W niższej temperaturze wzrost i fermentacja zakwasu zwalniają.': 'At lower temperatures starter growth and fermentation slow down.',
  'Okno szczytu to szacunek: w badaniu 40 zakwasów tempo rośnięcia ciasta wynosiło od 0,1 do 1,5 mm/h.':
    'The peak window is an estimate: in a study of 40 starters, dough rise rates ranged from 0.1 to 1.5 mm/h.',
  'Zakwas po szczycie staje się bardziej kwaśny i wytwarza mniej pęcherzyków gazu.':
    'A starter past its peak becomes more sour and produces fewer gas bubbles.',
  'Do szacowanego okna szczytu zostało ok. {czas} (okno: {okno}).':
    'About {czas} left until the estimated peak window (window: {okno}).',
  'Według szacunku zakwas jest teraz w oknie szczytu.': 'By estimate, the starter is now in its peak window.',
  'Szacowane okno szczytu minęło ok. {czas} temu.': 'The estimated peak window ended about {czas} ago.',
  'Standardowe dokarmienie przed pieczeniem.': 'Standard feeding before baking.',
  'Wysokie rozcieńczenie: mniej zakwasu względem świeżej mąki i wody, więc dłuższy czas do szczytu.':
    'High dilution: less starter relative to fresh flour and water, so a longer time to peak.',
  'Szybkie odświeżenie: więcej zakwasu względem świeżej mąki i wody, więc krótszy czas do szczytu.':
    'Quick refresh: more starter relative to fresh flour and water, so a shorter time to peak.',
  // Ostrzeżenie RD-05 o wodzie > 45 °C w Kalkulatorze [M1-audytor-generalny-039]
  'Uwaga: Obliczona temperatura wody przekracza 45°C. Ryzyko ugotowania drożdży i bakterii kwasu mlekowego! Schłodź mąkę lub obniż temperaturę otoczenia.':
    'Warning: the calculated water temperature exceeds 45°C. Risk of killing the yeast and lactic acid bacteria! Cool the flour or lower the room temperature.',
  // Spirala koszyka: etykieta VoiceOver i legenda (design-spec §2, §11b 058) [M1-audytor-generalny-058]
  'Plan wypieku, krok {n} z {N}: {nazwa}, zostało {czas}.': 'Bake plan, step {n} of {N}: {nazwa}, {czas} left.',
  'Plan wypieku, krok {n} z {N}: {nazwa}.': 'Bake plan, step {n} of {N}: {nazwa}.',
  'Gotowe {dzien} o {godzina}.': 'Ready {dzien} at {godzina}.',
  'Plan wypieku: {n} krok.': 'Bake plan: {n} step.',
  'Plan wypieku: {n} kroki.': 'Bake plan: {n} steps.',
  'Plan wypieku: {n} kroków.': 'Bake plan: {n} steps.',
  'Plan wypieku: {n} kroku.': 'Bake plan: {n} steps.',
  'Od dokarmienia minęło {czas} z {odstep}.': '{czas} of {odstep} since feeding.',
  '{godziny} {minuty}': '{godziny} {minuty}',
  '{n} godzina': '{n} hour',
  '{n} godziny': '{n} hours',
  '{n} godzin': '{n} hours',
  '{n} minuta': '{n} minute',
  '{n} minuty': '{n} minutes',
  '{n} minut': '{n} minutes',
  'dziś': 'today',
  'jutro': 'tomorrow',
  'pojutrze': 'the day after tomorrow',
  'zrobione': 'done',
  'przed nami': 'ahead',
  'noc w lodówce': 'overnight in the fridge',
  'noc w lodówce (skrócona)': 'overnight in the fridge (shortened)',
  'długi krok (skrócony)': 'long step (shortened)',
};

// Słownik EN, część 4: zakupy przez App Store (M1-audytor-generalny-008, -009, -027).
// Polski tekst jest kluczem. Całość składa src/lib/i18n.en.ts.
export const EN_4: Record<string, string> = {
  'Kup dostęp dożywotni': 'Buy Lifetime Access',
  'Odblokuj pełny dostęp': 'Unlock full access',
  // Przywracanie zakupów [M1-audytor-generalny-010]
  'Zakupy': 'Purchases',
  'Nie udało się połączyć z App Store. Spróbuj ponownie.': 'Could not connect to the App Store. Please try again.',
  // Ujawnienia ekranu zakupu [M1-audytor-generalny-011]
  'Zarządzaj subskrypcją': 'Manage Subscription',
  // Ekran zakupu „Piekarz Pro” w nowej szacie (design-spec §11e 127; nazwy jak w App Store Connect) [M1-audytor-generalny-127]
  'Piekarz Pro': 'Baker Pro',
  'Okres próbny: {dni}': 'Free trial: {dni}',
  'Liczenie receptur, plan wypieku, prowadzenie z powiadomieniami, zakwasy i dziennik. Bez reklam, bez konta.':
    'Recipe calculations, bake plans, step-by-step guidance with notifications, starters, and a journal. No ads, no account.',
  'Dożywotni': 'Lifetime',
  '{cena} rocznie po próbie': '{cena} per year after the trial',
  '{cena} miesięcznie po próbie': '{cena} per month after the trial',
  '{cena} rocznie': '{cena} per year',
  '{cena} miesięcznie': '{cena} per month',
  '{cena} jednorazowo': '{cena} one-time',
  'Jedna opłata. Ten plan nie potrzebuje próby; jeśli masz zaczętą próbę subskrypcji, anuluj ją, żeby za nią nie płacić.':
    "One payment. This plan doesn't need a trial; if you've started a subscription trial, cancel it so you aren't charged.",
  'Subskrypcja odnawia się sama. Żeby nie płacić, anuluj ją najpóźniej 24 godziny przed końcem próby: w Ustawieniach stuknij swoje imię i nazwisko, potem Subskrypcje.':
    'The subscription renews automatically. To avoid being charged, cancel it at least 24 hours before the trial ends: in Settings, tap your name, then Subscriptions.',
  'Subskrypcja odnawia się sama, dopóki jej nie anulujesz: w Ustawieniach stuknij swoje imię i nazwisko, potem Subskrypcje.':
    'The subscription renews automatically until you cancel it: in Settings, tap your name, then Subscriptions.',
  'Próba jest jedna na oba plany subskrypcji.': 'There is one trial for both subscription plans.',
  'Zakup wymaga połączenia z App Store.': 'Purchasing requires a connection to the App Store.',
  'Zacznij okres próbny': 'Start Free Trial',
  'Kup plan roczny': 'Buy Yearly Plan',
  'Kup plan miesięczny': 'Buy Monthly Plan',
  'Warunki użytkowania': 'Terms of Use',
  'Nie ma połączenia z App Store, więc zakup i przywrócenie zakupów teraz się nie udadzą. Reszta aplikacji działa jak dotąd. Sprawdź internet i spróbuj ponownie.':
    "There's no connection to the App Store, so purchasing and restoring purchases won't work right now. The rest of the app works as usual. Check your internet connection and try again.",
  'Nie udało się dokończyć zakupu. Zakup wymaga połączenia z App Store: sprawdź internet i spróbuj ponownie.':
    "The purchase couldn't be completed. Purchasing requires a connection to the App Store: check your internet connection and try again.",
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
  'Obliczona temperatura wody przekracza 45°C. Grozi to ugotowaniem drożdży i bakterii kwasu mlekowego. Schłodź mąkę lub obniż temperaturę otoczenia.':
    'The calculated water temperature exceeds 45°C. That risks killing the yeast and lactic acid bacteria. Cool the flour or lower the room temperature.',
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

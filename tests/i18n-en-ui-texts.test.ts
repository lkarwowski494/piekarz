/**
 * Teksty interfejsu, które dotąd były na sztywno, mają wpis EN z tymi samymi parametrami
 * [M1-audytor-generalny-047; 09-lokalizacja-001]. Wartości EN do przeglądu: wynik 047 (tabela PL → EN).
 */
import { t, setLang } from '../src/lib/i18n';

const PARY: [string, string][] = [
  ['Krok {n} z {m}', 'Step {n} of {m}'],
  ['Brak aktywnego wypieku', 'No active bake'],
  ['Wybierz recepturę w Kalkulatorze i kliknij „{przycisk}”, lub uruchom standardowy harmonogram rzemieślniczy poniżej.', 'Choose a recipe in the Calculator and tap “{przycisk}”, or start the standard artisan schedule below.'],
  ['Zacznij wypiek', 'Start Bake'],
  ['Składniki do odważenia', 'Ingredients to weigh'],
  ['Mąki', 'Flours'],
  ['Masa ciasta: {masa}, hydratacja całkowita: {hydratacja}%', 'Dough weight: {masa}, total hydration: {hydratacja}%'],
  ['Wszystkie etapy wypieku', 'All bake stages'],
  ['{n} min', '{n} min'],
  ['Zdejmij ostrożnie pokrywkę, pozwól parze ulecieć i obniż temperaturę pieca do 210°C dla karmelizacji skórki.', 'Carefully remove the lid, let the steam escape and lower the oven temperature to 210°C to caramelize the crust.'],
  ['Oceń bochenek i zapisz notatki do historii piekarskiej', 'Rate the loaf and save notes to your baking history'],
  ['Zbity, gęsty miękisz — rozważaj dłuższy bulk', 'Tight, dense crumb — consider a longer bulk'],
  ['Dzika, otwarta struktura rzemieślnicza!', 'Wild, open artisan structure!'],
  ['Ładna równomierna alweolatura', 'Nice, even crumb structure'],
  ['Blada, miękka skórka — zwiększ parę lub temperaturę', 'Pale, soft crust — increase steam or temperature'],
  ['Perfekcyjna chrupiąca skórka z pęcherzykami', 'Perfect crisp crust with blisters'],
  ['Dobra skórka z lekkim połyskiem', 'Good crust with a slight sheen'],
  ['{h}h {m}min', '{h}h {m}min'],
  ['{h}h', '{h}h'],
  ['{dzien}, {d} {miesiac}', '{dzien}, {miesiac} {d}'],
  ['Niedz.', 'Sun'],
  ['Pon.', 'Mon'],
  ['Wt.', 'Tue'],
  ['Śr.', 'Wed'],
  ['Czw.', 'Thu'],
  ['Pt.', 'Fri'],
  ['Sob.', 'Sat'],
  ['sty', 'Jan'],
  ['lut', 'Feb'],
  ['mar', 'Mar'],
  ['kwi', 'Apr'],
  ['maj', 'May'],
  ['cze', 'Jun'],
  ['lip', 'Jul'],
  ['sie', 'Aug'],
  ['wrz', 'Sep'],
  ['paź', 'Oct'],
  ['lis', 'Nov'],
  ['gru', 'Dec'],
  ['Klasyczny chleb rzemieślniczy (Harmonogram)', 'Classic artisan bread (Schedule)'],
  ['Etap "{etap}" wypada w nocy o {godzina}', 'Stage "{etap}" falls during the night at {godzina}'],
  ['Sugerowana korekta: wydłuż czas garowania w lodówce (Cold Retard) o 2–4 godziny lub przesuń godzinę dokarmienia zakwasu, aby ominąć nocne etapy stolnicowe.', 'Suggested fix: extend the fridge proof (Cold Retard) by 2–4 hours or move the starter feeding time to avoid hands-on stages at night.'],
  ['Dobierz proporcje i potrzebną masę zaczynu (Levain) do wypieku', 'Choose the ratio and the amount of levain you need for the bake'],
  ['1:1:1 (Szybki 3-4h)', '1:1:1 (Quick 3-4h)'],
  ['1:2:2 (Klasyk 6-8h)', '1:2:2 (Classic 6-8h)'],
  ['1:5:5 (Na noc 12h)', '1:5:5 (Overnight 12h)'],
  ['{n} cz.', '{n} pt.'],
  ['Wskazówka: Z powstałych {masa} pobierz wymaganą ilość do ciasta, a resztkę (~{od}–{do}) schowaj do lodówki jako matkę na kolejny wypiek.', 'Tip: from the resulting {masa}, take the amount the dough needs and keep the rest (~{od}–{do}) in the fridge as the mother starter for your next bake.'],
  ['{n} dzień', '{n} day'],
  ['{n} dni', '{n} days'],
  ['Utwórz profil dla nowej kultury zakwasu', 'Create a profile for a new starter culture'],
  ['np. San Francisco White, Lievito...', 'e.g. San Francisco White, Lievito...'],
  ['np. Mąka pszenna chlebowa t750', 'e.g. Wheat bread flour t750'],
  ['Zmień parametry swojego zakwasu', 'Change your starter settings'],
  ['Mąka pszenna chlebowa t750', 'Wheat bread flour t750'],
  ['Zaczyn ({g} g)', 'Preferment ({g} g)'],
  ['Do miski (Ciasto właściwe)', 'Into the bowl (final dough)'],
  ['Pozostała mąka: {g} g', 'Remaining flour: {g} g'],
  ['Pozostała woda: {g} g', 'Remaining water: {g} g'],
  ['Masa mąki bazowej', 'Base flour weight'],
  ['Mąka stanowi 100% bazy w procentach piekarskich', 'Flour is the 100% base in baker\'s percentages'],
  ['Liczba bochenków i gramatura', 'Number of loaves and weight'],
  ['{masa} / szt.', '{masa} / loaf'],
  ['{n} szt.', '{n} pcs'],
  ['{n}m w {temp}', '{n}m at {temp}'],
  ['garnek żeliwny', 'cast-iron pot'],
  ['foremka keksówka', 'loaf pan'],
  ['stal piekarska', 'baking steel'],
  ['blacha piekarnika', 'oven tray'],
  ['Wprowadź unikalną nazwę dla tej proporcji składników', 'Enter a unique name for this ingredient ratio'],
  ['0°C (Lód)', '0°C (Ice)'],
  ['Uwaga: W spiżarni brakuje {g}g mąki ({lista}).', 'Warning: the pantry is short {g}g of flour ({lista}).'],
  ['W spiżarni posiadasz {nazwa} ({g}g) — możesz użyć jej jako zamiennika.', 'You have {nazwa} ({g}g) in the pantry — you can use it as a substitute.'],
  ['Sugerowany zamiennik ze Spiżarni: {nazwa}.', 'Suggested pantry substitute: {nazwa}.'],
  ['Suma procentów wynosi {suma}% — brakuje jeszcze {reszta}%.', 'The percentages add up to {suma}% — {reszta}% still missing.'],
  ['Suma procentów wynosi {suma}% — przekracza 100% o {reszta}%.', 'The percentages add up to {suma}% — {reszta}% over 100%.'],
  ['+{g}g wody', '+{g}g water'],
  ['{g}g wody', '{g}g water'],
  ['Twój zakwas ({twoj}%) jest gęstszy niż w przepisie ({przepis}%). Użyj {zakwas}g zakwasu i DODAJ {woda}g wody do ciasta właściwego.', 'Your starter ({twoj}%) is stiffer than in the recipe ({przepis}%). Use {zakwas}g of starter and ADD {woda}g of water to the final dough.'],
  ['Twój zakwas ({twoj}%) jest rzadszy niż w przepisie ({przepis}%). Użyj {zakwas}g zakwasu i ODEJMIJ {woda}g wody z ciasta właściwego.', 'Your starter ({twoj}%) is looser than in the recipe ({przepis}%). Use {zakwas}g of starter and REMOVE {woda}g of water from the final dough.'],
  ['Wymieszaj {matka}g zakwasu matki ({hydratacja}%) z {maka}g mąki i {woda}g wody.', 'Mix {matka}g of mother starter ({hydratacja}%) with {maka}g of flour and {woda}g of water.'],
  ['Konsystencja będzie zwarta (Lievito Madre) — zagnieć kulę i nacinij krzyżem lub zroluj.', 'The consistency will be stiff (Lievito Madre) — knead it into a ball and score a cross or roll it up.'],
  ['Konsystencja będzie płynna — dokładnie napowietrz trzepaczką lub widelcem.', 'The consistency will be runny — aerate it thoroughly with a whisk or fork.'],
  ['US Cup (236,6 ml)', 'US Cup (236.6 ml)'],
  ['60% (Żytni)', '60% (Rye)'],
  ['100% (Płynny)', '100% (Liquid)'],
  ['60% (Sztywny)', '60% (Stiff)'],
  ['100% (Płynny Levain)', '100% (Liquid Levain)'],
  ['100% Płynny Levain', '100% Liquid Levain'],
  ['Eksportowanie...', 'Exporting...'],
  ['Importowanie...', 'Importing...'],
  ['Nie znaleziono rekordu', 'Record not found'],
  ['Wybrany element nie istnieje lub został wcześniej usunięty.', 'The selected item does not exist or has already been deleted.'],
  ['Wróć', 'Back'],
  ['Wyczyść wyszukiwanie', 'Clear search'],
];

const params = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe('EN: teksty interfejsu z t() (047)', () => {
  afterEach(() => setLang('pl'));

  it.each(PARY)('„%s” → „%s”', (pl, en) => {
    expect(params(en)).toEqual(params(pl));
    const values = Object.fromEntries(params(pl).map((p, i) => [p, `<${i}>`]));
    setLang('pl');
    expect(t(pl, values)).toBe(Object.entries(values).reduce((s, [k, x]) => s.split(`{${k}}`).join(x), pl));
    setLang('en');
    expect(t(pl, values)).toBe(Object.entries(values).reduce((s, [k, x]) => s.split(`{${k}}`).join(x), en));
    expect(t(pl)).not.toMatch(/[ąćęłńóśźż]/i);
  });
});

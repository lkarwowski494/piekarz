/**
 * Słownik EN, część 16: zakładka Receptury według makiety — lista receptur, ekran receptury, arkusz „Składniki”
 * (design-spec §11c „106”, docs/design/ekrany/teksty.js: `lr.*`, `kl.*`) [M1-audytor-generalny-106].
 * Teksty spoza makiety (do przeglądu roli 04): „Rodzaj receptur”, „Hydratacja całkowita {n}%.”, „Zakwas ({n}% wody)”.
 */
export const EN_16: Record<string, string> = {
  // Lista receptur (stan lista-receptur)
  'Receptury bazowe': 'Base Recipes',
  'Moje receptury': 'My Recipes',
  'Rodzaj receptur': 'Recipe type',
  '{rodzaj}, poziom {trudnosc}': '{rodzaj}, {trudnosc}',
  'łatwy': 'easy',
  'średni': 'medium',
  'wymagający': 'demanding',
  'mistrzowski': 'master',
  'moja, woda {n}%': 'mine, {n}% water',
  'Brak receptur tego rodzaju.': 'No recipes of this type.',
  'Pokaż wszystkie': 'Show All',
  // Ekran receptury (stany receptura, receptura-zaczyn)
  'Masa bochenka': 'Loaf weight',
  'Do miski (odhaczaj przy ważeniu)': 'Into the bowl (check off as you weigh)',
  'Do miski': 'Into the bowl',
  'Zakwas ({n}% wody)': 'Starter ({n}% hydration)',
  'Zaczyn: {rodzaj}': 'Preferment: {rodzaj}',
  '{rodzaj} (cały)': '{rodzaj} (all of it)',
  'Hydratacja całkowita {n}%: woda z zakwasu jest wliczona.': 'Total hydration {n}%: water from the starter is included.',
  'Hydratacja całkowita {n}%: woda z zaczynu jest wliczona.': 'Total hydration {n}%: water from the preferment is included.',
  'Hydratacja całkowita {n}%.': 'Total hydration {n}%.',
  'Razem {masa}': 'Total {masa}',
  'O recepturze': 'About This Recipe',
  // Arkusz „Składniki” (stan skladniki-pelne)
  'Ilości liczę od': 'Calculate amounts from',
  'bochenków': 'loaves',
  'masy mąki': 'flour weight',
  'Mąki (razem 100%)': 'Flours (100% total)',
  'Dodaj mąkę': 'Add Flour',
  'Wstaw gotową mieszankę': 'Use a Flour Blend',
  'Proporcje (procent mąki)': 'Proportions (% of flour)',
  'Hydratacja zakwasu': 'Starter hydration',
  'Zaczyn': 'Preferment',
  'Rodzaj': 'Type',
  'bez zaczynu': 'none',
  'poolish': 'poolish',
  'biga': 'biga',
  'stare ciasto': 'old dough',
  'levain': 'levain',
  'Z zaczynem (poolish, biga, stare ciasto, levain) wybierzesz, ile mąki idzie do zaczynu; „Do miski” pokaże zaczyn i ciasto osobno.':
    'With a preferment (poolish, biga, old dough, levain), you choose how much flour goes into it; “Into the bowl” shows the preferment and the dough separately.',
};

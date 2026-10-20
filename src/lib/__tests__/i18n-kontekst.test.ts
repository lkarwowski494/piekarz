/**
 * Klucz ma kontekst; ten sam tekst w dwóch znaczeniach to dwa klucze; wpis przeglądu dla każdego języka wydania
 * [M1-audytor-generalny-074; 09-lokalizacja-009]. „Zakwas” jako zakładka i ekran = „Sourdough”, jako składnik
 * receptury = „Starter” (jak „Zakwas: {amount} g” → „Starter: {amount} g”). Kontekst w kluczu: „tekst|kontekst”.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { setLang, t } from '../i18n';
import { EN } from '../i18n.en';
import { formatRecipeText } from '../recipe-formatter';
import { calculateDoughRecipe } from '../../core/domain-rules';

const ROOT = join(__dirname, '..', '..', '..');
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');

afterEach(() => setLang('pl'));

describe('kontekst klucza w t()', () => {
  it('PL pokazuje tekst bez kontekstu', () => {
    setLang('pl');
    expect(t('Zakwas|składnik')).toBe('Zakwas');
    expect(t('Zakwas')).toBe('Zakwas');
  });

  it('EN: zakładka „Sourdough”, składnik „Starter”', () => {
    setLang('en');
    expect(t('Zakwas')).toBe('Sourdough');
    expect(t('Zakwas|składnik')).toBe('Starter');
  });

  it('brak wpisu z kontekstem: tekst źródłowy bez kontekstu, nigdy klucz z „|”', () => {
    setLang('en');
    expect(t('Nieznany tekst|test')).toBe('Nieznany tekst');
  });

  it('tekst receptury w EN nazywa składnik „Starter”', () => {
    setLang('en');
    const calc = calculateDoughRecipe({
      targetDoughWeightGrams: 1000,
      flours: [{ name: 'Bread flour', percentage: 100 }],
      waterPercentage: 70,
      saltPercentage: 2,
      starterPercentage: 20,
      starterHydration: 100,
    });
    const s = formatRecipeText({ recipeName: 'Loaf', calc, unitSystem: 'metric' });
    expect(s).toContain('Starter (');
    expect(s).not.toContain('Sourdough (');
  });

  it.each([
    'src/components/stolnica/BakeStepsList.tsx',
    'src/components/ImportRecipeModal.tsx',
    'src/components/ShareRecipeQrModal.tsx',
    'src/lib/recipe-formatter.ts',
  ])('%s: składnik receptury ma klucz z kontekstem', (file) => {
    const src = read(file);
    expect(src).not.toMatch(/t\('Zakwas'\)/);
    expect(src).toMatch(/t\('Zakwas\|składnik'\)/);
  });
});

describe('plik kontekstu docs/lokalizacja/pl.kontekst.json', () => {
  const load = (): Record<string, { gdzie: string[]; opis?: string }> => JSON.parse(read('docs/lokalizacja/pl.kontekst.json'));

  it('każdy klucz słownika EN ma wpis kontekstu, bez sierot', () => {
    const ctx = load();
    const keys = Object.keys(EN);
    for (const k of keys) expect(ctx[k]).toBeDefined();
    for (const k of Object.keys(ctx)) expect(keys).toContain(k);
  });

  it('klucz z kontekstem i jego tekst bazowy mają opis dla tłumacza', () => {
    const ctx = load();
    const withCtx = Object.keys(EN).filter((k) => k.includes('|'));
    expect(withCtx).toContain('Zakwas|składnik');
    for (const k of withCtx) {
      expect(ctx[k].opis?.trim()).toBeTruthy();
      const base = k.split('|')[0];
      if (ctx[base]) expect(ctx[base].opis?.trim()).toBeTruthy();
    }
  });
});

describe('wpis przeglądu dla każdego języka wydania (docs/lokalizacja/jezyki.md)', () => {
  it('pl i en mają wiersz w „Przeglądy języków w wydaniu”', () => {
    const doc = read('docs/lokalizacja/jezyki.md');
    const section = doc.split('## Przeglądy języków w wydaniu')[1] ?? '';
    for (const l of ['pl', 'en']) expect(section).toMatch(new RegExp(`^\\| \`${l}\` \\|`, 'm'));
  });
});

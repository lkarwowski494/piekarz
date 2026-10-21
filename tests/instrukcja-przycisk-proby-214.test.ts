/**
 * M1-audytor-generalny-214 (10-wydanie-602): instrukcja ustawień nazywa przycisk okresu
 * próbnego tak, jak pokazuje go ekran zakupu po angielsku (`t('Zacznij okres próbny')`).
 * Dlaczego: tester w piaskownicy szukający nieistniejącego przycisku uzna ofertę za niewidoczną;
 * porównanie ze słownikiem nie pozwoli nazwom znów się rozjechać.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { setLang, t } from '../src/lib/i18n';

const root = path.join(__dirname, '..');
const instrukcja = fs.readFileSync(path.join(root, 'docs/wydanie/instrukcja-ustawien.md'), 'utf8');
// Tekst przycisku zakupu ekranu zakupu (PaywallModal → stan oferty).
const ekran = fs.readFileSync(path.join(root, 'src/components/oferta/stan-oferty.ts'), 'utf8');

describe('instrukcja ustawień: przycisk okresu próbnego (214)', () => {
  afterAll(() => setLang('pl'));

  it('ekran zakupu bierze przycisk próby z klucza „Zacznij okres próbny”', () => {
    expect(ekran).toMatch(/t\('Zacznij okres próbny'\)/);
  });

  it('instrukcja nie zawiera starego „Try 14 days”', () => {
    expect(instrukcja).not.toMatch(/Try 14 days/);
  });

  it('instrukcja nazywa przycisk tekstem EN ze słownika', () => {
    setLang('en');
    const przycisk = t('Zacznij okres próbny');
    expect(przycisk).not.toBe('Zacznij okres próbny');
    const ile = instrukcja.split(`„${przycisk}”`).length - 1;
    expect(ile).toBeGreaterThanOrEqual(2);
  });
});

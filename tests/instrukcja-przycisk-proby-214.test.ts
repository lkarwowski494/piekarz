/**
 * M1-audytor-generalny-214 (10-wydanie-602): instrukcja ustawień i ekran zakupu nie mogą się rozjechać w nazwie
 * przycisku okresu próbnego. Przepisane z kontraktu D-038 [M3 P-a]: po D-112 (Basic/Pro bez próby) ekran zakupu nie ma
 * przycisku próby ani klucza „Zacznij okres próbny” w słowniku EN. Instrukcja ustawień (§4 „Oferta wprowadzająca”, 12.5)
 * dalej opisuje ofertę D-038 — przepisuje ją rola 10 razem z usunięciem oferty w App Store Connect (Z-1, Z-8 w
 * docs/monetyzacja.md); do tego czasu test pilnuje strony kodu.
 * Dlaczego: tester w piaskownicy szukający nieistniejącego przycisku uzna ofertę za niewidoczną.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { EN } from '../src/lib/i18n.en';

const root = path.join(__dirname, '..');
const instrukcja = fs.readFileSync(path.join(root, 'docs/wydanie/instrukcja-ustawien.md'), 'utf8');
// Tekst przycisku zakupu ekranu zakupu (PaywallModal → stan oferty).
const ekran = fs.readFileSync(path.join(root, 'src/components/oferta/stan-oferty.ts'), 'utf8');

describe('instrukcja ustawień: przycisk okresu próbnego (214, po D-112)', () => {
  it('ekran zakupu nie ma przycisku próby (D-112): bez klucza „Zacznij okres próbny” w kodzie i w słowniku EN', () => {
    expect(ekran).not.toMatch(/Zacznij okres próbny/);
    expect(EN['Zacznij okres próbny']).toBeUndefined();
  });

  it('instrukcja nie zawiera starego „Try 14 days”', () => {
    expect(instrukcja).not.toMatch(/Try 14 days/);
  });
});

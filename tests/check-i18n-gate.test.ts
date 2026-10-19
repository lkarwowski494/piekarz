// ============================================================================
// Piekarz — bramka check:i18n na przykładach (M1-audytor-generalny-075, 09-lokalizacja-010)
// scripts/check-i18n.mjs --kod <katalog> ma wykryć tekst na sztywno w JSX i w Alert.alert
// (kod 1, plik:linia w wyniku), a kod z t('…') przepuścić (kod 0).
// ============================================================================

import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = join(__dirname, '..');
const script = join(root, 'scripts', 'check-i18n.mjs');

let tmp: string;
beforeAll(() => {
  tmp = mkdtempSync(join(tmpdir(), 'piekarz-i18n-'));
});
afterAll(() => {
  rmSync(tmp, { recursive: true, force: true });
});

/** Zapisuje przykład w osobnym katalogu i uruchamia bramkę tylko na nim. */
function bramka(nazwa: string, plik: string, tresc: string) {
  const dir = join(tmp, nazwa);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, plik), tresc, 'utf8');
  const r = spawnSync(process.execPath, [script, '--kod', dir], { cwd: root, encoding: 'utf8' });
  return { kod: r.status, wynik: `${r.stdout}${r.stderr}` };
}

describe('check:i18n wykrywa teksty na sztywno (M1-audytor-generalny-075)', () => {
  it('tekst w JSX: kod 1 i plik:linia w wyniku', () => {
    const { kod, wynik } = bramka(
      'jsx',
      'Ekran.tsx',
      ["import { Text } from 'react-native';", '', 'export const Ekran = () => <Text>Dodaj zakwas</Text>;', ''].join('\n'),
    );
    expect(kod).toBe(1);
    expect(wynik).toMatch(/Ekran\.tsx:3: tekst na sztywno „Dodaj zakwas”/);
  });

  it('literał w Alert.alert: kod 1 i plik:linia w wyniku', () => {
    const { kod, wynik } = bramka(
      'alert',
      'Zapis.ts',
      ["import { Alert } from 'react-native';", '', "export const zglos = () => Alert.alert('Błąd', 'Nie zapisano');", ''].join('\n'),
    );
    expect(kod).toBe(1);
    expect(wynik).toMatch(/Zapis\.ts:3: tekst na sztywno „Błąd”/);
    expect(wynik).toMatch(/Zapis\.ts:3: tekst na sztywno „Nie zapisano”/);
  });

  it("tekst przez t('…') ze słownikiem EN: kod 0", () => {
    const { kod, wynik } = bramka(
      'ok',
      'Ekran.tsx',
      [
        "import { Alert, Text } from 'react-native';",
        "import { t } from '../lib/i18n';",
        '',
        "export const Ekran = () => <Text>{t('Przygotowanie koszyka rozrostowego (Banneton)')}</Text>;",
        "export const zglos = () => Alert.alert(t('Przygotowanie koszyka rozrostowego (Banneton)'));",
        '',
      ].join('\n'),
    );
    expect(wynik).toMatch(/błędy: 0/);
    expect(kod).toBe(0);
  });
});

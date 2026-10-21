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

describe('check:i18n sprawdza słowniki 33 języków przekładu 093 (M1-audytor-generalny-093)', () => {
  /** Słowniki języków w osobnym katalogu (format generatora: <kod>/czesc-N.ts) i bramka na nich. */
  function slowniki(nazwa: string, pliki: Record<string, string>) {
    const dir = join(tmp, nazwa);
    for (const [p, tresc] of Object.entries(pliki)) {
      mkdirSync(join(dir, p, '..'), { recursive: true });
      writeFileSync(join(dir, p), tresc, 'utf8');
    }
    const r = spawnSync(process.execPath, [script, '--slowniki', dir], { cwd: root, encoding: 'utf8' });
    return { kod: r.status, wynik: `${r.stdout}${r.stderr}` };
  }
  const czesc = (wpisy: Record<string, string>) =>
    `export const CZESC: Record<string, string> = {\n${Object.entries(wpisy).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`).join('\n')}\n};\n`;

  it('inny parametr, pusty tekst, brak klucza i brak formy CLDR: kod 1 z językiem i kluczem', () => {
    const { kod, wynik } = slowniki('zle', {
      'de/czesc-1.ts': czesc({ 'Krok {n} z {m}': 'Schritt {x} von {m}', Dziś: '', '{n} godzina#one': '{n} Stunde' }),
    });
    expect(kod).toBe(1);
    expect(wynik).toMatch(/de „Krok \{n\} z \{m\}”: parametry/);
    expect(wynik).toMatch(/de „Dziś”: pusty tekst/);
    expect(wynik).toMatch(/de „Receptury”: brak tłumaczenia/);
    expect(wynik).toMatch(/de „\{n\} godzina”: brak formy liczby mnogiej #other/);
  });

  // Setki linii błędów przez potok: process.exit zaraz po console.log ucinał wynik na Linuksie (ok. 64 KB bufora potoku),
  // więc test wyżej padał w CI i części stref. Wynik ma być pełny: liczba linii BŁĄD = liczba błędów z podsumowania,
  // a skrypt kończy się przez process.exitCode [M1-audytor-generalny-189; 07-jakosc-603]
  it('wynik przez potok nie jest ucinany: wszystkie linie błędów i podsumowanie, kod 1; zakończenie przez process.exitCode', () => {
    const { kod, wynik } = slowniki('potok', { 'de/czesc-1.ts': czesc({ Dziś: 'Heute' }) });
    expect(kod).toBe(1);
    const ile = Number(/błędy: (\d+)/.exec(wynik)?.[1] ?? NaN);
    expect(ile).toBeGreaterThan(400);
    expect(wynik.split('\n').filter((l) => l.startsWith('BŁĄD ')).length).toBe(ile);
    expect(wynik).toMatch(/de „Receptury”: brak tłumaczenia/);
    const zrodlo = require('node:fs').readFileSync(script, 'utf8') as string;
    expect(zrodlo).not.toMatch(/process\.exit\(bledy/);
    expect(zrodlo).toMatch(/process\.exitCode = bledy\.length \? 1 : 0;/);
  });

  it('słowniki repo: 33 języki bez błędów, kod 0', () => {
    const r = spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8' });
    expect(`${r.stdout}`).toMatch(/języki przekładu: 33/);
    expect(r.status).toBe(0);
  });
});

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

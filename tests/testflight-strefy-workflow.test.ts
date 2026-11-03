/**
 * 07-jakosc-002: build TestFlight musiał przejść bramkę tylko w jednej strefie czasu, więc
 * czerwona macierz stref (tests-tz.yml) nie zatrzymywała wydania (run 1019). Kontrakt:
 * testflight.yml uruchamia przed buildem pętlę tych samych stref tą samą komendą co
 * tests-tz.yml i kończy się błędem przy czerwonej strefie. Kroków podpisu ani wysyłki
 * ten test nie dotyka.
 */
import * as fs from 'fs';
import * as path from 'path';

const root = path.resolve(__dirname, '..');
const wf = (n: string) => fs.readFileSync(path.join(root, '.github', 'workflows', n), 'utf8').replace(/\r\n/g, '\n');

/** Strefy z `matrix.tz` w tests-tz.yml (jedyne źródło listy). */
const strefyMacierzy = (t: string): string[] => {
  const blok = /\n {8}tz:\n((?: {10}- .+\n)+)/.exec(t)?.[1] ?? '';
  return blok.split('\n').map((l) => l.replace(/^ {10}- /, '').trim()).filter(Boolean);
};

/** Treść zadania `nazwa:` w sekcji jobs (do następnego zadania na tym samym wcięciu). */
const zadanie = (t: string, nazwa: string): string => {
  const m = new RegExp(`\\n {2}${nazwa}:\\n([\\s\\S]*?)(?=\\n {2}[\\w-]+:\\n|$)`).exec(t);
  return m?.[1] ?? '';
};

describe('testflight.yml: bramka stref czasu przed buildem (07-jakosc-002)', () => {
  const tz = wf('tests-tz.yml');
  const tf = wf('testflight.yml');
  const strefy = strefyMacierzy(tz);
  const bramka = zadanie(tf, 'tz-matrix');
  const build = zadanie(tf, 'build');

  it('tests-tz.yml nadal ma 7 stref (źródło listy)', () => {
    expect(strefy).toHaveLength(7);
  });

  it('istnieje zadanie tz-matrix na Linuksie, a build czeka na nie (needs)', () => {
    expect(bramka).not.toBe('');
    expect(bramka).toMatch(/runs-on: ubuntu-latest/);
    expect(build).toMatch(/\n {4}needs: (\[[^\]]*\btz-matrix\b[^\]]*\]|tz-matrix)\n/);
  });

  it('zadanie tz-matrix ma te same strefy co tests-tz.yml', () => {
    for (const s of strefy) expect(bramka).toContain(s);
  });

  it('każda strefa biegnie tą samą komendą testową, co w tests-tz.yml', () => {
    expect(tz).toMatch(/run: npm test\n/);
    expect(bramka).toMatch(/TZ="\$tz" npm test/);
    expect(bramka).toMatch(/npm ci --legacy-peer-deps/);
  });

  it('czerwona strefa kończy zadanie błędem, a pozostałe strefy też biegną', () => {
    expect(bramka).toMatch(/if ! TZ="\$tz" npm test/);
    expect(bramka).toMatch(/exit 1/);
    expect(bramka).not.toMatch(/continue-on-error/);
  });

  it('bramka stref nie jest wyłączona warunkiem ani nie wymaga sekretów', () => {
    expect(bramka).not.toMatch(/\n {4}if:/);
    expect(bramka).not.toMatch(/secrets\./);
  });

  it('kroki podpisu i wysyłki zostały w zadaniu build', () => {
    expect(build).toContain('xcodebuild -exportArchive');
    expect(build).toContain('ASC_KEY_P8_BASE64');
  });
});

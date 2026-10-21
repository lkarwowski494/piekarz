/**
 * M1-audytor-generalny-154 (03-zakres-503): kontrakt zakresu przyjmuje zmiany po
 * zatwierdzeniu przez tabelę „Zmiany zakresu”: F-38 według D-051 (3a), wyniki
 * przejścia poznawczego roli 04 w kolumnie intuicyjności, odnośnik do historii ZM.
 */
import * as fs from 'fs';
import * as path from 'path';

const root = path.resolve(__dirname, '..');
const kontrakt = fs.readFileSync(path.join(root, 'docs/scope-contract.md'), 'utf8').replace(/\r\n/g, '\n');
const linie = kontrakt.split('\n');
const wiersz = (f: string) => linie.find((l) => l.startsWith(`| ${f} |`)) ?? '';
const zm = kontrakt.split('## Zmiany zakresu')[1]?.split('\n## ')[0] ?? '';
const wierszeZm = zm.split('\n').filter((l) => /^\| ZM-\d+/.test(l));

describe('kontrakt zakresu: zmiany po zatwierdzeniu (154)', () => {
  it('tabela ZM ma wpis F-38 z D-051', () => {
    expect(wierszeZm.some((l) => /F-38/.test(l) && /D-051/.test(l))).toBe(true);
  });

  it('historia ZM-01… (lista odcięć powołuje się na ZM-01) ma odnośnik do archiwum', () => {
    expect(zm).toMatch(/ZM-01[^\n]*docs\/archiwum\/scope-contract-2\.0\.md/);
    expect(fs.existsSync(path.join(root, 'docs/archiwum/scope-contract-2.0.md'))).toBe(true);
  });

  it('kryterium F-38 to jeden wybór jednostek, nie dwa przełączniki', () => {
    expect(wiersz('F-38')).not.toBe('');
    expect(wiersz('F-38')).not.toMatch(/przełącznik/);
    expect(wiersz('F-38')).toMatch(/jeden wybór/);
  });

  it('żaden wiersz zakresu nie czeka na rolę 04; F-61 i F-15 „nie badano”', () => {
    expect(linie.filter((l) => /^\| F-\d+/.test(l) && /czeka na 04/.test(l))).toEqual([]);
    for (const f of ['F-61', 'F-15']) expect(wiersz(f)).toMatch(/wynik: nie badano/);
    expect(wiersz('F-09')).toMatch(/wynik: pozytywny, 2026-10-20, `docs\/design\/03-przejscie-poznawcze\.md`/);
  });
});

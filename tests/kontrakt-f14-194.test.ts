/**
 * M1-audytor-generalny-194 (01-odkrywanie-602): kryterium F-14 w kontrakcie zakresu
 * zgodne z D-066 (2a): temperatura w planie tylko z wyboru 20–26 °C, bez wymogu
 * komunikatu „poza zakresem”. Dlaczego: kontrakt wyznacza wymagania rolom 04 i 08,
 * a usunięte wymaganie nie może dalej obowiązywać.
 */
import * as fs from 'fs';
import * as path from 'path';

const root = path.resolve(__dirname, '..');
const kontrakt = fs.readFileSync(path.join(root, 'docs/scope-contract.md'), 'utf8').replace(/\r\n/g, '\n');
const wiersz = (f: string) => kontrakt.split('\n').find((l) => l.startsWith(`| ${f} |`)) ?? '';
const zm = kontrakt.split('## Zmiany zakresu')[1]?.split('\n## ')[0] ?? '';

describe('kontrakt zakresu: F-14 według D-066 2a (194)', () => {
  it('F-14 nie wymaga komunikatu poza zakresem', () => {
    expect(wiersz('F-14')).not.toBe('');
    expect(wiersz('F-14')).not.toMatch(/poza zakresem komunikat/);
  });

  it('F-14 odwołuje się do D-066 2a i wyboru 20–26 °C', () => {
    expect(wiersz('F-14')).toMatch(/D-066 2a/);
    expect(wiersz('F-14')).toMatch(/20–26 °C/);
  });

  it('zmiana ma wpis w tabeli ZM', () => {
    expect(zm.split('\n').some((l) => /^\| ZM-\d+/.test(l) && /F-14/.test(l) && /D-066/.test(l))).toBe(true);
  });
});

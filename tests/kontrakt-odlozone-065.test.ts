/**
 * M1-audytor-generalny-065 (weryfikacja M1 G9 H4; DEC-19 b, D-286): przeniesienie diagnozy Doktora chleba na następny
 * wypiek („Piecz ponownie”) odłożone do zakresu 1.1 — wpis w tabeli „Zmiany zakresu” z decyzją, warunkiem powrotu
 * i adnotacją przy F-43, bez pracy nad 1.1 przed wydaniem 1.0 (D-276 pkt 5).
 */
import * as fs from 'fs';
import * as path from 'path';

const root = path.resolve(__dirname, '..');
const kontrakt = fs.readFileSync(path.join(root, 'docs/scope-contract.md'), 'utf8').replace(/\r\n/g, '\n');
const linie = kontrakt.split('\n');
const zm = kontrakt.split('## Zmiany zakresu')[1]?.split('\n## ')[0] ?? '';
const wpis = zm.split('\n').find((l) => /^\| ZM-\d+/.test(l) && /M1-audytor-generalny-065/.test(l)) ?? '';

describe('kontrakt: diagnoza Doktora przy następnym wypieku odłożona do 1.1 (065)', () => {
  it('wpis ZM z DEC-19 b, zakresem 1.1, warunkiem powrotu i D-276 pkt 5', () => {
    expect(wpis).not.toBe('');
    expect(wpis).toMatch(/DEC-19 b/);
    expect(wpis).toMatch(/1\.1/);
    expect(wpis).toMatch(/Powrót:\s*\S/);
    expect(wpis).toMatch(/D-276 pkt 5/);
  });

  it('F-43 odsyła do wpisu ZM odłożenia', () => {
    const id = wpis.split('|')[1]?.trim() ?? '';
    expect(id).toMatch(/^ZM-\d+$/);
    expect(linie.find((l) => l.startsWith('| F-43 |')) ?? '').toContain(id);
  });
});

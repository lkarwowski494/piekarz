/**
 * M1-audytor-generalny-157 (01-odkrywanie-505): obowiązujący BRD (docs/brd/*.md, bez
 * archiwum) wskazuje tylko istniejące pliki, OP rozstrzygnięte decyzją mają status
 * z ID decyzji, a lista rozbieżności z kodem nie wymienia rzeczy już naprawionych.
 */
import * as fs from 'fs';
import * as path from 'path';

const root = path.resolve(__dirname, '..');
const brd = path.join(root, 'docs', 'brd');
const pliki = fs.readdirSync(brd).filter((f) => f.endsWith('.md'));
const czytaj = (f: string) => fs.readFileSync(path.join(brd, f), 'utf8').replace(/\r\n/g, '\n');

/** Ścieżki repo w backtickach; rozszerzenia od najdłuższych, żeby `brd.json` nie złapał się jako `.js`. */
const SCIEZKA = /`((?:app|src|tests|scripts|docs)\/[^`\s]*?\.(?:json|mjs|tsx|ts|js|md|yml))(?::[\d–-]+)?`/g;

describe('BRD aktualny wobec kodu i decyzji (157)', () => {
  it('każda ścieżka repo w docs/brd/*.md istnieje', () => {
    const brak = pliki.flatMap((f) =>
      [...czytaj(f).matchAll(SCIEZKA)].map((m) => m[1]).filter((p) => !fs.existsSync(path.join(root, p))).map((p) => `${f}: ${p}`),
    );
    expect(brak).toEqual([]);
  });

  it.each(['OP-38', 'OP-41'])('%s rozstrzygnięte decyzją D-043, bez [DO WYJAŚNIENIA]', (op) => {
    const wiersz = czytaj('README.md').split('\n').find((l) => l.startsWith(`| ${op} |`)) ?? '';
    expect(wiersz).not.toBe('');
    expect(wiersz).not.toMatch(/DO WYJAŚNIENIA/);
    expect(wiersz).toMatch(/Rozstrzygnięte/);
    expect(wiersz).toMatch(/D-043/);
  });

  it('lista rozbieżności i RYZ-15 nie podają RD-25 = 24 h ani RD-23 „bez ostrzeżenia” (kod: 12 h i ostrzeżenie)', () => {
    const reguly = czytaj('reguly.md');
    const rozb = reguly.split('## Rozbieżności z kodem')[1]?.split('\n## ')[0] ?? '';
    expect(rozb).not.toBe('');
    expect(rozb).not.toMatch(/RD-25: kod przypomina po 24 h/);
    expect(rozb).not.toMatch(/RD-23: [^\n]*bez ostrzeżenia/);
    const ryz15 = czytaj('odkrywanie.md').split('### RYZ-15')[1]?.split('\n### ')[0] ?? '';
    expect(ryz15).not.toMatch(/bez ostrzeżenia/);
  });

  it('kontekst J-02 (wypiek) nie czeka na źródło, które BRD już ma (S-47…S-50)', () => {
    const wiersz = czytaj('odkrywanie.md').split('\n').find((l) => l.startsWith('| J-02 (wypiek) |')) ?? '';
    expect(wiersz).not.toBe('');
    expect(wiersz).not.toMatch(/źródło E2/);
    expect(wiersz).toMatch(/S-47/);
  });
});

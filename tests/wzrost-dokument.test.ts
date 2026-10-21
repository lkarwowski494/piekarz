/**
 * M1-audytor-generalny-180 (11-wzrost-504): plan wzrostu nie podaje „PL i EN” jako
 * ograniczenia (aplikacja ma 35 języków, DEC-06), a każda ścieżka repo w nim istnieje.
 */
import * as fs from 'fs';
import * as path from 'path';

const root = path.resolve(__dirname, '..');
const tekst = fs.readFileSync(path.join(root, 'docs/wzrost.md'), 'utf8');

/** Ścieżki repo w backtickach, bez sufiksu `:linia`. */
const sciezki = [...tekst.matchAll(/`((?:docs|src|app|tests|scripts)\/[^`\s:]+)(?::[\d-]+)?`/g)].map((m) => m[1]);

describe('docs/wzrost.md (180)', () => {
  it('nie podaje „PL i EN” jako ograniczenia wersji', () => {
    expect(tekst).not.toMatch(/PL i EN/);
  });

  it('każda ścieżka repo w dokumencie istnieje', () => {
    expect(sciezki.length).toBeGreaterThan(0);
    expect(sciezki.filter((p) => !fs.existsSync(path.join(root, p)))).toEqual([]);
  });
});

/**
 * Polityka prywatności i wsparcie mają jedno źródło: stronę publikowaną z repo apps4brew-www
 * (https://apps4brew.com/piekarz/). Kopie w site/ są tylko jawnym odesłaniem, bez własnej treści, która by się
 * rozjechała, i bez nazwy „Crust” (nazwa EN w sklepie: „Baker”, D-053). Obietnica polityki o usuwaniu danych
 * z kopią bezpieczeństwa ma pokrycie w kodzie (124) [M1-audytor-generalny-174; 10-wydanie-502].
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(__dirname, '..');
const read = (f: string) => readFileSync(join(ROOT, f), 'utf8');

describe('174: polityka i wsparcie z jednego źródła', () => {
  it.each([
    ['site/privacy.html', 'https://apps4brew.com/piekarz/privacy.html'],
    ['site/support.html', 'https://apps4brew.com/piekarz/support.html'],
  ])('%s jest odesłaniem do %s, bez własnej treści i bez „Crust”', (plik, adres) => {
    const html = read(plik);
    expect(html).not.toMatch(/Crust/);
    expect(html).toContain(`<link rel="canonical" href="${adres}">`);
    expect(html).toContain(`<meta http-equiv="refresh" content="0; url=${adres}">`);
    expect(html).toContain(`<a href="${adres}">`);
    // Bez sekcji treści polityki (rozjechana kopia była powodem 174)
    expect(html).not.toMatch(/<h2\b/);
  });

  it('obietnica „usuniesz dane w ustawieniach, przedtem kopia bezpieczeństwa” ma pokrycie w kodzie', () => {
    expect(read('src/components/settings/BackupAndDataSection.tsx')).toContain("t('Usuń wszystkie dane')");
    expect(read('src/data/usun-wszystko.ts')).toMatch(/safetyBackup\('reset'/);
    expect(read('src/lib/backup.ts')).toContain("'piekarz-przed-czyszczeniem-'");
  });
});

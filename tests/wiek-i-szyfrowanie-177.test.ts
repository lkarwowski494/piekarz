/**
 * M1-audytor-generalny-177 (10-wydanie-506): dokumenty wydania nie podają wieku 4+
 * sprzecznie z ankietą według D-058 (oczekiwane 9+, wynik wylicza Apple), tylko odsyłają
 * do kroku 8 instrukcji i dziennika; podstawą `ITSAppUsesNonExemptEncryption = false`
 * nie jest „szyfrowanie HTTPS” w aplikacji bez sieci.
 */
import * as fs from 'fs';
import * as path from 'path';

const root = path.resolve(__dirname, '..');
const czytaj = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');
const wiersz = (tekst: string) => tekst.split(/\r?\n/).find((l) => l.includes('Klasyfikacja Wiekowa')) ?? '';

describe('wiek i podstawa szyfrowania w dokumentach wydania (177)', () => {
  it.each(['docs/15-app-store.md', 'docs/app-store-metadata-v2.md'])(
    '%s: wiek odsyła do D-058, kroku 8 instrukcji i dziennika, bez 4+',
    (plik) => {
      const w = wiersz(czytaj(plik));
      expect(w).not.toBe('');
      expect(w).not.toMatch(/4\+/);
      expect(w).toMatch(/D-058/);
      expect(w).toMatch(/docs\/wydanie\/instrukcja-ustawien\.md/);
      expect(w).toMatch(/docs\/wydanie\/dziennik\.md/);
    },
  );

  it('docs/15-app-store.md nie uzasadnia braku kryptografii szyfrowaniem HTTPS', () => {
    const t = czytaj('docs/15-app-store.md');
    const szyfrowanie = t.split(/\r?\n/).find((l) => l.includes('ITSAppUsesNonExemptEncryption')) ?? '';
    expect(szyfrowanie).not.toMatch(/HTTPS/i);
    expect(szyfrowanie).toMatch(/bez sieci/);
  });
});

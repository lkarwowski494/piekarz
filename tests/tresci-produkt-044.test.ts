/**
 * Tekst w produkcie = tekst w docs/tresci, znaczniki twierdzeń bez „[T:…,-]”, skrypt kontroli w wersji modułu roli 06
 * [M1-audytor-generalny-044; 06-tresci-009].
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.join(__dirname, '..');
const czytaj = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const bezZnacznikow = (s: string) => s.replace(/\s*\[T:[^\]]*\]/g, '').replace(/\n/g, ' ');

function plikiMd(kat: string): string[] {
  return fs.readdirSync(kat, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? plikiMd(path.join(kat, e.name)) : e.name.endsWith('.md') ? [path.join(kat, e.name)] : []);
}

describe('044: treści produktu i docs/tresci', () => {
  it('zdanie stałego dnia karmienia z StalyDzienKarmienia stoi dosłownie w docs/tresci/pl (ZAK-ZAL-012)', () => {
    const kod = czytaj('src/components/zakwas/StalyDzienKarmienia.tsx');
    const zdanie = kod.match(/t\('(Stały dzień karmienia ustawisz[^']*)'\)/)![1];
    const pl = czytaj('docs/tresci/pl/kalendarz-m0.md');
    expect(bezZnacznikow(pl)).toContain(zdanie);
    expect(pl).toContain('Zakwas trafia do lodówki dopiero po 7–10 dniach od założenia. [T:ZAK-ZAL-012]');
  });
  it('żaden plik treści nie łączy twierdzeń znacznikiem „[T:…,-]”', () => {
    const zle = plikiMd(path.join(ROOT, 'docs', 'tresci')).filter((f) => /\[T:[^\]]*,\s*-\]/.test(fs.readFileSync(f, 'utf8')) && !f.includes(`${path.sep}przeglad${path.sep}`));
    expect(zle).toEqual([]);
  });
  it('scripts/kontrole-tresci.mjs w wersji modułu (opcja --przeglad zastępczy, wiersz PRZEGLĄD, D-027)', () => {
    const s = czytaj('scripts/kontrole-tresci.mjs');
    expect(s).toContain('[--przeglad zastępczy]');
    expect(s).toContain("export const ZASTEPCZY = 'weryfikacja zastępcza (subagent)'");
    expect(s).toContain('PRZEGLĄD ${t.id}');
  });
});

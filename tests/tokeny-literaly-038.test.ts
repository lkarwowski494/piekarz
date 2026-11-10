/**
 * Rozmiary tekstu i promienie z tokenów (typografia.style.*, promienie.*), nie liczbami: najmniejszy tekst 12 pt
 * (podpis), bez 10/11 pt na osi czasu planu [M1-audytor-generalny-038; 04-studio-projektowe-004, opcja A].
 * Wyjątek: koło (borderRadius = połowa boku, zapis „N / 2”).
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.join(__dirname, '..');
function pliki(kat: string): string[] {
  return fs.readdirSync(kat, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(kat, e.name);
    if (e.isDirectory()) return e.name === '__tests__' ? [] : pliki(p);
    return /\.(ts|tsx)$/.test(e.name) ? [p] : [];
  });
}
const KOD = [...pliki(path.join(ROOT, 'app')), ...pliki(path.join(ROOT, 'src'))].filter((p) => !p.endsWith(path.join('ui', 'tokeny.ts')));

describe('038: rozmiary tekstu i promienie z tokenów', () => {
  it('żadnego fontSize liczbą w app/ i src/', () => {
    const zle = KOD.flatMap((p) => fs.readFileSync(p, 'utf8').split('\n').map((l, i) => [p, i + 1, l] as const))
      .filter(([, , l]) => /fontSize\s*:\s*\d/.test(l)).map(([p, i, l]) => `${path.relative(ROOT, p)}:${i} ${l.trim()}`);
    expect(zle).toEqual([]);
  });
  it('żadnego borderRadius liczbą poza kołem („N / 2”)', () => {
    const zle = KOD.flatMap((p) => fs.readFileSync(p, 'utf8').split('\n').map((l, i) => [p, i + 1, l] as const))
      .filter(([, , l]) => /borderRadius\s*:\s*\d+(?:\.\d+)?(?!\s*\/\s*2)\s*[,}\n]/.test(`${l}\n`)).map(([p, i, l]) => `${path.relative(ROOT, p)}:${i} ${l.trim()}`);
    expect(zle).toEqual([]);
  });
});

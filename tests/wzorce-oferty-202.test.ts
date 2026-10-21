/**
 * Zrzuty wzorcowe `oferta-*` (linia bazowa SP-13) pochodzą z bieżącej makiety ekranu zakupu: manifest zapisuje skrót
 * `oferta.html` i tekstów `of.*` z `teksty.js` z chwili wygenerowania zrzutów (`node docs/design/narzedzia/zrzuty.mjs`).
 * Zmiana makiety bez odświeżenia zrzutów zatrzymuje test [M1-audytor-generalny-202; 04-studio-projektowe-610].
 */
import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';

const root = path.join(__dirname, '..');
const czytaj = (p: string) => fs.readFileSync(path.join(root, p), 'utf8').replace(/\r\n/g, '\n');

/** Skrót źródeł zrzutów oferty: makieta i teksty `of.*` (końce linii LF, niezależnie od systemu). */
function skrotZrodelOferty(): string {
  const of = czytaj('docs/design/ekrany/teksty.js').split('\n').filter((l) => /^\s*"of\./.test(l)).join('\n');
  return createHash('sha256').update(czytaj('docs/design/ekrany/oferta.html')).update('\n--\n').update(of).digest('hex');
}

describe('202: zrzuty wzorcowe oferty z bieżącej makiety', () => {
  const manifestPath = 'docs/design/wzorce-zrzuty/oferta-zrodlo.json';

  it('manifest istnieje i ma skrót bieżącej makiety oraz tekstów of.*', () => {
    expect(fs.existsSync(path.join(root, manifestPath))).toBe(true);
    const m = JSON.parse(czytaj(manifestPath));
    expect(m.skrot).toBe(skrotZrodelOferty());
  });

  it('manifest wymienia każdy zrzut oferta-* w katalogu i tylko takie', () => {
    const m = JSON.parse(czytaj(manifestPath));
    const pliki = fs.readdirSync(path.join(root, 'docs/design/wzorce-zrzuty')).filter((f) => /^oferta-.*\.png$/.test(f)).sort();
    expect(pliki.length).toBeGreaterThan(0);
    expect([...m.zrzuty].sort()).toEqual(pliki);
  });
});

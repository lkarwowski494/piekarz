/**
 * Rozmiary tekstu z tokenów typografii (design-spec §3): w `.tsx`, `*.styles.ts` i każdym `.ts` ze `StyleSheet.create`
 * (np. `style-receptur.ts`, reaudit-noc 159) liczbowe `fontSize` tylko jako
 * nazwane wyjątki (tests/fontsize-wyjatki-159.json, do zamiany przy przebudowie ekranu); nowych nie wolno dodać,
 * a sekcja „Godziny snu” (611) ma same tokeny [M1-audytor-generalny-159; 04-studio-projektowe-504, 04-studio-projektowe-611].
 */
import fs from 'fs';
import path from 'path';

const root = path.join(__dirname, '..');

function pliki(dir: string, out: string[] = []): string[] {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (['node_modules', '__tests__', 'i18n-en', 'i18n-slowniki'].includes(f)) continue;
    if (fs.statSync(p).isDirectory()) pliki(p, out);
    else if (/\.tsx$|\.styles\.ts$/.test(f) || (/\.ts$/.test(f) && /StyleSheet\.create\(/.test(fs.readFileSync(p, 'utf8')))) out.push(p);
  }
  return out;
}

const LICZBOWY = /fontSize:\s*\d+(\.\d+)?\b/g;
const wyjatki: Record<string, number> = JSON.parse(fs.readFileSync(path.join(root, 'tests/fontsize-wyjatki-159.json'), 'utf8')).pliki;
const stan = Object.fromEntries(
  [...pliki(path.join(root, 'app')), ...pliki(path.join(root, 'src'))]
    .map((p) => [path.relative(root, p).split(path.sep).join('/'), (fs.readFileSync(p, 'utf8').match(LICZBOWY) || []).length] as const)
    .filter(([, n]) => n > 0),
);

describe('159: fontSize z tokenów typografii', () => {
  it('żaden plik nie ma więcej liczbowych fontSize niż na liście wyjątków (nowe pliki: 0)', () => {
    const ponad = Object.entries(stan).filter(([p, n]) => n > (wyjatki[p] ?? 0)).map(([p, n]) => `${p}: ${n} > ${wyjatki[p] ?? 0}`);
    expect(ponad).toEqual([]);
  });

  it('611: sekcja „Godziny snu” bez liczbowych fontSize', () => {
    expect(stan['src/components/settings/GodzinySnuSection.tsx'] ?? 0).toBe(0);
    expect(wyjatki['src/components/settings/GodzinySnuSection.tsx']).toBeUndefined();
  });

  it('rozmiary równe tokenom (34, 28, 56, 22, 17, 15, 13, 12) nie są wyjątkami: zapisane jako tokeny', () => {
    const rowne: string[] = [];
    for (const p of Object.keys(stan)) {
      for (const m of fs.readFileSync(path.join(root, p), 'utf8').matchAll(/fontSize:\s*(\d+)\b/g)) {
        if (['34', '28', '56', '22', '17', '15', '13', '12'].includes(m[1])) rowne.push(`${p}: ${m[1]}`);
      }
    }
    expect(rowne).toEqual([]);
  });
});

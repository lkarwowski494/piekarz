// 050: kolor tylko z modułu motywu (docs/design/mapa-rol.md §1 i §3, test akceptacyjny 050 pkt 1)
// [M1-audytor-generalny-050; 04-studio-projektowe-002, 04-studio-projektowe-003, 04-studio-projektowe-016, 08-programista-019]
import fs from 'fs';
import path from 'path';
import { getHydrationDifficulty } from '../src/core/domain-rules';
import { calculateStarterPhase } from '../src/core/sourdough-physics';
import type { PoziomKomunikatu } from '../src/core/poziom-komunikatu';

const rootDir = path.resolve(__dirname, '..');

function walk(dir: string, filter: (f: string) => boolean): string[] {
  let res: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== '__tests__' && entry.name !== 'node_modules') res = res.concat(walk(full, filter));
    } else if (filter(entry.name)) {
      res.push(full);
    }
  }
  return res;
}

const rel = (f: string) => path.relative(rootDir, f).split(path.sep).join('/');
const produkcyjne = (ext: RegExp) =>
  ['app', 'src'].flatMap((d) => walk(path.join(rootDir, d), (n) => ext.test(n) && !/\.test\./.test(n)));

/** Nazwane wyjątki z powodem. Inne pliki nie mogą mieć literału koloru. */
const WYJATKI: Record<string, string> = {
  'src/components/QrCodeSvg.tsx':
    'kod QR: ciemne moduły na białym tle, bo czytnik wymaga jasnego tła (mapa-rol.md §3); F-08 PÓŹNIEJ, wejście ukryte',
  'src/components/QrScannerModal.tsx': 'skaner QR, F-08 PÓŹNIEJ (wejście ukryte, wejscia-pozniej.ts); przerobi powrót F-08',
  'src/components/ShareRecipeQrModal.tsx':
    'udostępnianie QR, F-08 PÓŹNIEJ (wejście ukryte); białe tło pod kodem jak w QrCodeSvg',
};

const LITERAL_KOLORU = /#[0-9A-Fa-f]{3,8}\b|rgba?\(/g;

describe('050: kolory tylko z motywu', () => {
  it('pliki .tsx w app/ i src/ nie mają literałów #… ani rgb(a)(…) poza nazwanymi wyjątkami', () => {
    const znalezione: string[] = [];
    for (const f of produkcyjne(/\.tsx$/)) {
      const r = rel(f);
      if (WYJATKI[r]) continue;
      fs.readFileSync(f, 'utf8')
        .split('\n')
        .forEach((linia, i) => {
          const m = linia.match(LITERAL_KOLORU);
          if (m) znalezione.push(`${r}:${i + 1}: ${m.join(', ')}`);
        });
    }
    expect(znalezione).toEqual([]);
  });

  it('każdy wyjątek istnieje i ma powód', () => {
    for (const [plik, powod] of Object.entries(WYJATKI)) {
      expect(fs.existsSync(path.join(rootDir, plik))).toBe(true);
      expect(powod.length).toBeGreaterThan(20);
    }
  });

  it('ekrany i komponenty nie biorą kolorów z sharedCraftTokens (@apps4craft/ui)', () => {
    const pliki = produkcyjne(/\.tsx?$/)
      .filter((f) => /sharedCraftTokens\.colors|getCraftTheme\(/.test(fs.readFileSync(f, 'utf8')))
      .map(rel);
    expect(pliki).toEqual([]);
  });

  it('bez cieni i własnego przyciemnienia (mapa-rol.md §1 zasada 4)', () => {
    const pliki = produkcyjne(/\.tsx?$/)
      .filter((f) => /shadowColor|shadowOpacity|elevation:/.test(fs.readFileSync(f, 'utf8')))
      .map(rel);
    expect(pliki).toEqual([]);
  });

  it('moduły danych nie niosą kolorów: badgeColor zastąpiony poziomem komunikatu', () => {
    for (const plik of ['src/core/domain-rules.ts', 'src/core/sourdough-physics.ts']) {
      const zrodlo = fs.readFileSync(path.join(rootDir, plik), 'utf8');
      expect(zrodlo).not.toMatch(LITERAL_KOLORU);
      expect(zrodlo).not.toMatch(/badgeColor/);
    }
  });

  it('poziom komunikatu: hydratacja i faza zakwasu to informacja, nie ostrzeżenie bezpieczeństwa', () => {
    const poziomy: PoziomKomunikatu[] = ['info', 'ostrzezenie', 'blad'];
    expect(poziomy).toContain(getHydrationDifficulty(60).poziom);
    for (const woda of [60, 72, 80, 90]) expect(getHydrationDifficulty(woda).poziom).toBe('info');
    const teraz = Date.UTC(2026, 9, 20, 12);
    expect(calculateStarterPhase(undefined, 'ROOM_TEMP', teraz).poziom).toBe('info');
    expect(calculateStarterPhase(teraz - 3_600_000, 'FRIDGE', teraz).poziom).toBe('info');
    const okno = { start: teraz - 3_600_000, end: teraz + 3_600_000 };
    expect(calculateStarterPhase(teraz - 7_200_000, 'ROOM_TEMP', teraz, okno).poziom).toBe('info');
  });
});

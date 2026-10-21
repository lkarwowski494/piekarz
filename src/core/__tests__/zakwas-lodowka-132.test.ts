/**
 * Porady fazy `lag` i `hungry` zakwasu w lodówce (karta szczytu) równe zdaniom z docs/tresci/pl|en/zakwas-z-lodowki.md
 * ze znacznikami ZAK-LOD/ZAK-ZAL; bez „2–3h”, „1–2 karmień” i „4°C”, których nie ma w rejestrze
 * [M1-audytor-generalny-132; 06-tresci-502].
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { calculateStarterPhase } from '../sourdough-physics';
import { linie, poAngielsku } from './helpers/tresci';

const ROOT = join(__dirname, '..', '..', '..');
const DOBA = 24 * 3600 * 1000;
const TERAZ = Date.UTC(2026, 9, 21, 12);
const rejestr: { id: string; status: string }[] = JSON.parse(readFileSync(join(ROOT, 'docs/tresci/rejestr.json'), 'utf8'));

const SEKCJE = {
  lag: 'calculateStarterPhase.advicePl, faza lag',
  hungry: 'calculateStarterPhase.advicePl, faza hungry',
} as const;

/** Znaczniki [T:…] z sekcji pliku PL (surowy tekst, bez obróbki helpera). */
function znaczniki(poczatek: string): string[] {
  const tekst = readFileSync(join(ROOT, 'docs/tresci/pl/zakwas-z-lodowki.md'), 'utf8').replace(/\r\n/g, '\n');
  const sekcja = tekst.split(/^## /m).find((c) => c.startsWith(poczatek));
  if (!sekcja) throw new Error(`Brak sekcji ${poczatek}`);
  return [...sekcja.matchAll(/\[T:([^\]]+)\]/g)].flatMap((m) => m[1].split(','));
}

const faza = (dni: number) => calculateStarterPhase(TERAZ - dni * DOBA, 'FRIDGE', TERAZ);

describe('132: porady zakwasu w lodówce z docs/tresci (ZAK-LOD, ZAK-ZAL)', () => {
  it.each([
    ['lag', 2],
    ['hungry', 8],
  ] as const)('faza %s: porada PL = zdania z docs/tresci/pl', (nazwa, dni) => {
    const f = faza(dni);
    expect(f.phase).toBe(nazwa);
    expect(f.advicePl).toBe(linie('pl/zakwas-z-lodowki.md', SEKCJE[nazwa]).join(' '));
  });

  it.each(['lag', 'hungry'] as const)('faza %s: każde zdanie ma znacznik ZAK-LOD albo ZAK-ZAL z potwierdzonym twierdzeniem', (nazwa) => {
    const ids = znaczniki(SEKCJE[nazwa]);
    expect(ids.length).toBeGreaterThan(0);
    for (const id of ids) {
      expect(id).toMatch(/^ZAK-(LOD|ZAL)-\d{3}$/);
      expect(rejestr.find((t) => t.id === id)?.status).toBe('potwierdzone');
    }
  });

  it.each([
    ['lag', 2],
    ['hungry', 8],
  ] as const)('faza %s: porada EN = zdania z docs/tresci/en', (nazwa, dni) => {
    const pl = linie('pl/zakwas-z-lodowki.md', SEKCJE[nazwa]).join(' ');
    expect(poAngielsku([faza(dni).advicePl])).toEqual([linie('en/zakwas-z-lodowki.md', SEKCJE[nazwa]).join(' ')]);
    expect(poAngielsku([pl])[0]).not.toBe(pl);
  });

  it('bez liczb spoza rejestru: „2–3h”, „1–2 karmień”, „4°C”', () => {
    for (const d of [0, 2, 4, 5, 8, 30]) {
      expect(faza(d).advicePl).not.toMatch(/2–3\s?h|1–2 karmie|4\s?°C/);
    }
  });

  it('„Wymaga odświeżenia” dopiero od 7. dnia: w lodówce dokarmia się raz w tygodniu (ZAK-ZAL-012)', () => {
    expect(faza(6).phase).toBe('lag');
    expect(faza(7).phase).toBe('hungry');
  });
});

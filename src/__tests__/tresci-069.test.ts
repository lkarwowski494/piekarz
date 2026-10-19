/**
 * M1-audytor-generalny-069 (06-tresci-010, -011, -012): teksty produktu równe tekstom z docs/tresci
 * (KOS-OPR-001/002, POL-SMA-001, DOK-PIE-001) w PL i EN; wycofane twierdzenia nie wracają do kodu.
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { SHAPING_BAKING_TECHNIQUES } from '../core/techniques/shaping-baking-techniques';
import { BREAD_SCHOOL_LESSONS } from '../core/bread-school-lessons';
import { DOUGH_RECOVERY_PROTOCOLS } from '../doctor/dough-recovery';
import { setLang, t } from '../lib/i18n';

const ROOT = join(__dirname, '..', '..');

/** Treść sekcji `## <nazwa>` z pliku docs/tresci, bez znacznika [T:ID]. */
function sekcja(plik: string, nazwa: string): string {
  const tekst = readFileSync(join(ROOT, 'docs', 'tresci', plik), 'utf8').replace(/\r\n/g, '\n');
  const czesci = tekst.split(/^## /m);
  const trafienie = czesci.find((c) => c.split('\n')[0].trim() === nazwa);
  if (!trafienie) throw new Error(`Brak sekcji ${nazwa} w ${plik}`);
  return trafienie
    .split('\n')
    .slice(1)
    .join(' ')
    .replace(/\s*\[T:[A-Z0-9-]+\]\s*/g, ' ')
    .trim();
}

function enDla(pl: string): string {
  setLang('en');
  try {
    return t(pl);
  } finally {
    setLang('pl');
  }
}

describe('069: teksty produktu ze źródła (docs/tresci)', () => {
  const koszyk = SHAPING_BAKING_TECHNIQUES.find((k) => k.id === 'bib_09_banneton_prep');
  const lekcja5 = BREAD_SCHOOL_LESSONS.find((l) => l.id === 'lesson_5_baguette_poolish');
  const zimna = DOUGH_RECOVERY_PROTOCOLS.find((p) => p.id === 'COLD_SLUGGISH');

  it('KOS-OPR-001/002: kroki oprószania koszyka PL i EN jak w docs/tresci', () => {
    expect(koszyk).toBeDefined();
    const pl0 = sekcja('pl/koszyk-oproszanie.md', 'executionStepsPl[0]');
    const pl1 = sekcja('pl/koszyk-oproszanie.md', 'executionStepsPl[1]');
    const en0 = sekcja('en/koszyk-oproszanie.md', 'executionStepsEn[0]');
    const en1 = sekcja('en/koszyk-oproszanie.md', 'executionStepsEn[1]');
    expect(koszyk!.executionStepsPl.slice(0, 2)).toEqual([pl0, pl1]);
    expect(koszyk!.executionStepsEn.slice(0, 2)).toEqual([en0, en1]);
    expect(enDla(pl0)).toBe(en0);
    expect(enDla(pl1)).toBe(en1);
  });

  it('KOS-OPR-001: błąd „zwykła mąka pszenna” usunięty z listy błędów (PL i EN)', () => {
    expect(koszyk!.commonMistakesPl.join(' ')).not.toMatch(/zwykłej mąki pszennej/);
    expect(koszyk!.commonMistakesEn.join(' ')).not.toMatch(/standard wheat flour/);
  });

  it('POL-SMA-001: wniosek lekcji 5 PL i EN jak w docs/tresci', () => {
    expect(lekcja5).toBeDefined();
    const pl = sekcja('pl/lekcja-5-bagietka.md', 'scientificInsightPl');
    const en = sekcja('en/lekcja-5-bagietka.md', 'scientificInsightEn');
    expect(lekcja5!.scientificInsightPl).toBe(pl);
    expect(lekcja5!.scientificInsightEn).toBe(en);
    expect(enDla(pl)).toBe(en);
  });

  it('DOK-PIE-001: pierwszy krok protokołu zimnej kuchni PL i EN jak w docs/tresci', () => {
    expect(zimna).toBeDefined();
    const pl = sekcja('pl/doktor-zimna-kuchnia.md', 'stepByStepPl[0]');
    const en = sekcja('en/doktor-zimna-kuchnia.md', 'stepByStepPl[0]');
    expect(zimna!.stepByStepPl[0]).toBe(pl);
    expect(enDla(pl)).toBe(en);
  });

  it('wycofane twierdzenia nie występują w kodzie produkcyjnym (src/, app/)', () => {
    const zakazane = [/WYŁĄCZNIE mąki bezglutenowej/, /EXCLUSIVELY with non-gluten/, /fitaz/i, /phytase/i, /26–27/];
    const pliki: string[] = [];
    const zbierz = (dir: string) => {
      for (const n of readdirSync(dir)) {
        const p = join(dir, n);
        if (statSync(p).isDirectory()) {
          if (n !== '__tests__') zbierz(p);
        } else if (/\.(ts|tsx)$/.test(n)) pliki.push(p);
      }
    };
    zbierz(join(ROOT, 'src'));
    zbierz(join(ROOT, 'app'));
    const trafienia = pliki.flatMap((p) => {
      const tekst = readFileSync(p, 'utf8');
      return zakazane.filter((re) => re.test(tekst)).map((re) => `${p.slice(ROOT.length + 1)}: ${re}`);
    });
    expect(trafienia).toEqual([]);
  });
});

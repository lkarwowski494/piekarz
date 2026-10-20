/**
 * M1-audytor-generalny-086 (01-odkrywanie-019; RD-22-W1, RD-23-W1): ostrzeżenia bezpieczeństwa w krokach
 * Stolnicy, teksty dosłownie z docs/tresci/pl|en/wypiek-bezpieczenstwo.md (przegląd człowieka w rejestrze).
 * Wektory: lid_off → ostrzeżenie (BEZ-OPA-001..003); mix i rye_mix → zdania BEZ-SUR-001/002 na końcu
 * instrukcji; lid_on i starter_feed → bez nowych zdań w instrukcji i w polu fazy. Ostrzeżenia według rodzaju kroku
 * (103: starter_feed → „zakwas”, lid_on → gorące naczynie i dzieci) jako osobne ostrzeżenie: step-warnings.test.ts.
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { DUTCH_OVEN_PHASES } from '../baking-phases';
import { DEFAULT_STAGE_TEMPLATES } from '../../scheduler/reverse-scheduler';
import { RYE_STAGE_TEMPLATES } from '../rye-stages';
import { setLang, t } from '../../lib/i18n';

const ROOT = join(__dirname, '..', '..', '..');

/** Treść sekcji `## <początek nagłówka>…` z pliku docs/tresci, bez znacznika [T:ID]. */
function sekcja(plik: string, poczatek: string): string {
  const tekst = readFileSync(join(ROOT, 'docs', 'tresci', plik), 'utf8').replace(/\r\n/g, '\n');
  const trafienie = tekst.split(/^## /m).find((c) => c.split('\n')[0].startsWith(poczatek));
  if (!trafienie) throw new Error(`Brak sekcji ${poczatek} w ${plik}`);
  return trafienie
    .split('\n')
    .slice(1)
    .join(' ')
    .replace(/\s*\[T:[A-Z0-9,-]+\]\s*/g, ' ')
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

const POKRYWKA_PL = sekcja('pl/wypiek-bezpieczenstwo.md', 'krok zdjęcia pokrywki');
const POKRYWKA_EN = sekcja('en/wypiek-bezpieczenstwo.md', 'lid removal step');
const SUROWE_PL = sekcja('pl/wypiek-bezpieczenstwo.md', 'krok mieszania ciasta');
const SUROWE_EN = sekcja('en/wypiek-bezpieczenstwo.md', 'dough mixing step');

describe('086: ostrzeżenia bezpieczeństwa w krokach (docs/tresci)', () => {
  it('teksty źródłowe są niepuste i mają oczekiwaną liczbę zdań', () => {
    expect(POKRYWKA_PL).toMatch(/^Załóż suche rękawice/);
    expect(POKRYWKA_EN).toMatch(/^Wear dry oven mitts/);
    expect(SUROWE_PL.split('. ').length).toBe(2);
    expect(SUROWE_EN.split('. ').length).toBe(2);
  });

  it('RD-23-W1: faza lid_off ma ostrzeżenie równe tekstowi BEZ-OPA (PL i EN)', () => {
    expect(DUTCH_OVEN_PHASES.lid_off.safetyWarningPl).toBe(POKRYWKA_PL);
    expect(enDla(POKRYWKA_PL)).toBe(POKRYWKA_EN);
  });

  it('faza lid_on nie ma ostrzeżenia o pokrywce', () => {
    expect(DUTCH_OVEN_PHASES.lid_on.safetyWarningPl).toBeUndefined();
  });

  const kroki: [string, string | undefined][] = [
    ['reverse-scheduler mix', DEFAULT_STAGE_TEMPLATES.find((s) => s.id === 'mix')?.instructionsPl],
    ['rye-stages rye_mix', RYE_STAGE_TEMPLATES.find((s) => s.id === 'rye_mix')?.instructionsPl],
  ];

  it.each(kroki)('RD-22-W1: krok mieszania (%s) kończy się zdaniami BEZ-SUR (PL i EN)', (_nazwa, instrukcja) => {
    expect(instrukcja).toBeDefined();
    expect(instrukcja!.endsWith(` ${SUROWE_PL}`)).toBe(true);
    const en = enDla(instrukcja!);
    expect(en).not.toBe(instrukcja);
    expect(en.endsWith(` ${SUROWE_EN}`)).toBe(true);
  });

  it('krok dokarmienia zakwasu bez zdań BEZ-SUR (ZAK-SUR-001 jest na karcie zakwasu)', () => {
    const karm = DEFAULT_STAGE_TEMPLATES.find((s) => s.id === 'starter_feed')?.instructionsPl;
    expect(karm).toBeDefined();
    expect(karm).not.toContain(SUROWE_PL);
  });
});

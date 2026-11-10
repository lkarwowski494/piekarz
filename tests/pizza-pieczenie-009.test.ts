/**
 * M1-audytor-generalny-009 (06-tresci-002, D-303, DEC-03 a): pizza piecze się według źródła receptury
 * (PIE-PIZ-001, King Arthur „Neapolitan-Style Pizza Crust”): 260 °C, 0 + 6 min na stali, a grill 2–3 min
 * i „bez grilla kilka minut dłużej” jako zdanie notesPl (docs/tresci/pl|en/pieczenie-receptur.md).
 * Wartości z wektora roli 06: docs/tresci/wektory/pieczenie-receptur-2026-11-09.json.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { MASTER_RECIPES, type RecipePreset } from '../src/recipes/presets';
import { setLang, t } from '../src/lib/i18n';

const root = path.join(__dirname, '..');
interface Param { parametr: string; wartosc?: number | string | null; granica: string; min?: number; max?: number; twierdzenie: string }
const WEKTOR: { parametry: Param[] } = JSON.parse(
  fs.readFileSync(path.join(root, 'docs', 'tresci', 'wektory', 'pieczenie-receptur-2026-11-09.json'), 'utf8'),
);
const REJESTR: { id: string; status: string }[] = JSON.parse(fs.readFileSync(path.join(root, 'docs', 'tresci', 'rejestr.json'), 'utf8'));

/** Sekcja pliku treści (nagłówek „## …”) jako jedno zdanie bez znacznika [T:…]. */
function sekcja(plik: string, naglowek: string): string {
  const t0 = fs.readFileSync(path.join(root, 'docs', 'tresci', plik), 'utf8').replace(/\r\n/g, '\n');
  const blok = t0.split('\n## ').find((b) => b.startsWith(naglowek));
  if (!blok) throw new Error(`brak sekcji ${naglowek} w ${plik}`);
  return blok.split('\n').slice(1).filter((l) => l.trim() && !l.startsWith('<!--'))
    .map((l) => l.replace(/\s*\[T:[^\]]*\]\s*$/, '').trim()).join(' ');
}

const pizza = MASTER_RECIPES.find((r) => r.id === 'pizza_napoletana_48h')!;
const PIZZA = WEKTOR.parametry.filter((p) => p.parametr.startsWith('pizza_napoletana_48h.'));

describe('009 (D-303): pizza 260 °C, 0 + 6 min na stali (PIE-PIZ-001)', () => {
  it('wektor ma 5 pól pizzy na potwierdzonym twierdzeniu PIE-PIZ-001', () => {
    expect(PIZZA).toHaveLength(5);
    expect(REJESTR.find((x) => x.id === 'PIE-PIZ-001')?.status).toBe('potwierdzone');
  });

  it.each(PIZZA.map((p) => [p.parametr, p] as const))('%s = wektor', (_n, p) => {
    const pole = p.parametr.split('.')[1] as keyof RecipePreset;
    expect(pizza[pole]).toBe(p.wartosc);
  });

  it('notesPl kończy się zdaniem o stali i grillu z pieczenie-receptur.md, EN z pliku EN', () => {
    const pl = sekcja('pl/pieczenie-receptur.md', 'pizza_napoletana_48h.notesPl');
    const en = sekcja('en/pieczenie-receptur.md', 'pizza_napoletana_48h.notesPl');
    expect(pl).toContain('2–3 minuty');
    expect(pizza.notesPl.endsWith(pl)).toBe(true);
    setLang('en');
    try {
      expect(t(pizza.notesPl).endsWith(en)).toBe(true);
    } finally {
      setLang('pl');
    }
  });

  it('stara wartość bez źródła (450 °C, 2 min) zniknęła z danych receptury', () => {
    expect([pizza.bakeTempSteamC, pizza.bakeTempBrowningC]).not.toContain(450);
    expect(pizza.bakeTimeBrowningMinutes).not.toBe(2);
  });
});

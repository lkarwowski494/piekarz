/**
 * „Basic tylko rośnie” (kontrakt docs/monetyzacja.md, „Reguły dostępu”; D-112, D-113, D-116): funkcja raz wydana w Basic
 * nie przechodzi do Pro, a limity Basic mogą tylko rosnąć. Bieżąca lista i limity (src/lib/platnosci/konfiguracja.ts)
 * wobec plików wydań w docs/monetyzacja/basic-*.json. *Dlaczego:* odbieranie darmowego wygląda jak zmiana warunków
 * po fakcie (zasada 12 wzorca portfela, 3.1.2(a)) [M3 P-a].
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { BASIC, LIMITY_BASIC } from '../platnosci/konfiguracja';

type Wydanie = { wydanie: string; basic: string[]; limity: Record<string, number> };

/** Naruszenia zasady: funkcje, które zniknęły z Basic, i limity niższe niż w wydaniu (albo usunięte). */
function naruszenia(poprzednie: Wydanie, basic: readonly string[], limity: Readonly<Record<string, number>>): string[] {
  const out: string[] = [];
  for (const f of poprzednie.basic) if (!basic.includes(f)) out.push(`${poprzednie.wydanie}: funkcja „${f}” zniknęła z Basic`);
  for (const [k, v] of Object.entries(poprzednie.limity)) {
    const teraz = limity[k];
    if (typeof teraz !== 'number') out.push(`${poprzednie.wydanie}: limit „${k}” usunięty`);
    else if (teraz < v) out.push(`${poprzednie.wydanie}: limit „${k}” spadł z ${v} do ${teraz}`);
  }
  return out;
}

const dir = path.join(__dirname, '../../../docs/monetyzacja');
const wydania: Wydanie[] = fs
  .readdirSync(dir)
  .filter((f) => /^basic-[\d.]+\.json$/.test(f))
  .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));

describe('Basic tylko rośnie (D-112, D-113)', () => {
  it('jest plik wydania 1.0 z listą Basic i limitami', () => {
    expect(wydania.map((w) => w.wydanie)).toContain('1.0');
  });

  it.each(wydania.map((w) => [w.wydanie, w] as const))('wydanie %s: bieżąca lista Basic zawiera każdą funkcję, a limity nie są niższe', (_w, w) => {
    expect(naruszenia(w, BASIC, LIMITY_BASIC)).toEqual([]);
  });

  it('kontrola negatywna: zabranie funkcji z Basic i obniżenie limitu są wykrywane', () => {
    const w: Wydanie = { wydanie: 'x', basic: ['kalkulator', 'zakwas'], limity: { zakwasy: 1, wlasneReceptury: 5 } };
    expect(naruszenia(w, ['kalkulator'], { zakwasy: 1, wlasneReceptury: 4 })).toEqual([
      'x: funkcja „zakwas” zniknęła z Basic',
      'x: limit „wlasneReceptury” spadł z 5 do 4',
    ]);
    expect(naruszenia(w, ['kalkulator', 'zakwas', 'akademia'], { zakwasy: 2, wlasneReceptury: 5 })).toEqual([]);
  });
});

/**
 * „Basic tylko rośnie” (kontrakt docs/monetyzacja.md, „Reguły dostępu”; D-112, D-113, D-116): funkcja raz wydana w Basic
 * nie przechodzi do Pro, a limity Basic mogą tylko rosnąć. Bieżąca lista i limity (src/lib/platnosci/konfiguracja.ts)
 * wobec plików wydań w docs/monetyzacja/basic-*.json. *Dlaczego:* odbieranie darmowego wygląda jak zmiana warunków
 * po fakcie (zasada 12 wzorca portfela, 3.1.2(a)) [M3 P-a].
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { createHash } from 'node:crypto';
import { BASIC, BASIC_SZCZEGOLY, LIMITY_BASIC } from '../platnosci/konfiguracja';

type Wydanie = { wydanie: string; basic: string[]; szczegoly?: { pozycje: string[] }; limity: Record<string, number> };

/** Naruszenia zasady: funkcje i szczegóły, które zniknęły z Basic, i limity niższe niż w wydaniu (albo usunięte). */
function naruszenia(poprzednie: Wydanie, basic: readonly string[], limity: Readonly<Record<string, number>>, szczegoly: readonly string[] = BASIC_SZCZEGOLY): string[] {
  const out: string[] = [];
  for (const f of poprzednie.basic) if (!basic.includes(f)) out.push(`${poprzednie.wydanie}: funkcja „${f}” zniknęła z Basic`);
  for (const s of poprzednie.szczegoly?.pozycje ?? []) if (!szczegoly.includes(s)) out.push(`${poprzednie.wydanie}: szczegół „${s}” zniknął z Basic`);
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

  // P2-7 (M3 P-a-fix): plik wydania jest zamrożony sumą SHA-256 — obniżenie limitu razem z edycją pliku w jednym commicie
  // pada tu. Nowe wydanie = nowy plik basic-<wersja>.json, ten zostaje. Miejsca użycia funkcji Basic na ekranach:
  // mapa w src/__tests__/basic-pro-pafix.test.tsx. Nie łapie: zmian Basic bez nazwy Funkcja (krok budzenia w planie,
  // biblioteka technik, filtr smaku, wylewki), przepięcia akcji, której nie ma w mapie, ani usunięcia obu plików naraz.
  // Suma zmieniona w M3 P-b2: przed wydaniem 1.0 doszły szczegóły Basic (przelicznik hydratacji, wylewki; D-117) — lista rośnie
  it('plik wydania 1.0 jest niezmieniony (SHA-256)', () => {
    const tresc = fs.readFileSync(path.join(dir, 'basic-1.0.json'), 'utf8').replace(/\r\n/g, '\n');
    expect(createHash('sha256').update(tresc).digest('hex')).toBe('290f2e43126d77fbd8fcdc46e659b47f01311aca74ae83916bca6da5405e0fbb');
  });

  it('kontrola negatywna: zabranie funkcji z Basic i obniżenie limitu są wykrywane', () => {
    const w: Wydanie = { wydanie: 'x', basic: ['kalkulator', 'zakwas'], limity: { zakwasy: 1, wlasneReceptury: 5 } };
    expect(naruszenia(w, ['kalkulator'], { zakwasy: 1, wlasneReceptury: 4 })).toEqual([
      'x: funkcja „zakwas” zniknęła z Basic',
      'x: limit „wlasneReceptury” spadł z 5 do 4',
    ]);
    expect(naruszenia(w, ['kalkulator', 'zakwas', 'akademia'], { zakwasy: 2, wlasneReceptury: 5 })).toEqual([]);
    const zSzczegolami: Wydanie = { ...w, szczegoly: { pozycje: ['dziennik-filtr-smaku'] } };
    expect(naruszenia(zSzczegolami, ['kalkulator', 'zakwas'], { zakwasy: 1, wlasneReceptury: 5 }, [])).toEqual(['x: szczegół „dziennik-filtr-smaku” zniknął z Basic']);
  });

  it('wydanie 1.0 ma siedem szczegółów Basic rozstrzygniętych przez właściciela (D-116; P-b2, D-117: przelicznik i wylewki)', () => {
    const w = wydania.find((x) => x.wydanie === '1.0');
    expect(w?.szczegoly?.pozycje).toHaveLength(7);
  });
});

/**
 * M1-audytor-generalny-064 (03-zakres-008; DEC-09 a, D-286): apetyt i koszt właściciela przeliczone po rozszerzeniach
 * 1.0 — tabela „Ranking” ma wiersz każdej funkcji poza NIE, a zapisana suma godzin MVP równa się sumie kolumny
 * „Koszt [h]” wierszy MVP (trwała kontrola: nowa funkcja albo zmiana kosztu bez przeliczenia sumy czerwieni test).
 */
import * as fs from 'fs';
import * as path from 'path';

const root = path.resolve(__dirname, '..');
const kontrakt = fs.readFileSync(path.join(root, 'docs/scope-contract.md'), 'utf8').replace(/\r\n/g, '\n');
const komorki = (l: string) => l.split('|').map((k) => k.trim());

const funkcje = new Map<string, string>();
for (const l of kontrakt.split('\n')) {
  const k = komorki(l);
  if (/^F-\d{2}$/.test(k[1] ?? '') && k.length >= 12) funkcje.set(k[1], k[4]);
}
const rankingSekcja = kontrakt.split('\n## Ranking')[1]?.split('\n## ')[0] ?? '';
const ranking = new Map<string, number>();
for (const l of rankingSekcja.split('\n')) {
  const k = komorki(l);
  if (/^F-\d{2}$/.test(k[1] ?? '')) ranking.set(k[1], Number((k[5] ?? '').replace(',', '.')));
}

describe('kontrakt: ranking i suma godzin MVP po rozszerzeniach 1.0 (064)', () => {
  it('każda funkcja poza NIE ma wiersz rankingu z kosztem > 0', () => {
    const bez = [...funkcje].filter(([, d]) => d !== 'NIE').map(([id]) => id).filter((id) => !(ranking.get(id)! > 0));
    expect(bez).toEqual([]);
  });

  it('zapisana suma MVP równa się sumie kosztów wierszy MVP', () => {
    const suma = [...funkcje].filter(([, d]) => d === 'MVP').reduce((s, [id]) => s + (ranking.get(id) ?? 0), 0);
    const zapis = kontrakt.match(/Suma MVP \(przeliczenie 2026-11-09\): (\d+(?:,\d+)?) h/);
    expect(zapis).not.toBeNull();
    expect(Number(zapis![1].replace(',', '.'))).toBe(suma);
  });
});

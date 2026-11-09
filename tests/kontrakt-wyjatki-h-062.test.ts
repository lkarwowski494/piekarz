/**
 * M1-audytor-generalny-062 (03-zakres-006; DEC-09 a, D-286): funkcja MVP z dowodem wartości tylko H (hipoteza) jest
 * wyjątkiem właściciela od zasady 18 — wiersz kontraktu ma w Uzasadnieniu decyzję D-nnn, założenie ZAL-nnn ze statusem
 * „hipoteza” w `docs/zalozenia.md` i warunek oceny z datą („Ocena: … RRRR-MM-DD”). Dotyczy F-72 (maszyna), F-75 (dwa
 * wypieki), F-78 (.ics), F-80 (miesiąc), F-81 (rytm) i każdej przyszłej funkcji MVP z dowodem H.
 */
import * as fs from 'fs';
import * as path from 'path';

const root = path.resolve(__dirname, '..');
const kontrakt = fs.readFileSync(path.join(root, 'docs/scope-contract.md'), 'utf8').replace(/\r\n/g, '\n');
const zalozenia = fs.readFileSync(path.join(root, 'docs/zalozenia.md'), 'utf8').replace(/\r\n/g, '\n');

interface Wiersz {
  id: string;
  decyzja: string;
  dowod: string;
  wtp: string;
  uzasadnienie: string;
}

const wiersze: Wiersz[] = kontrakt
  .split('\n')
  .map((l) => l.split('|').map((k) => k.trim()))
  .filter((k) => /^F-\d{2}$/.test(k[1] ?? '') && k.length >= 12)
  .map((k) => ({ id: k[1], decyzja: k[4], dowod: k[5], wtp: k[6], uzasadnienie: k[10] }));

/** Dowód tylko H: kolumna „Dowód wartości” zaczyna się od „H:” albo WTP podaje dowód „(H)”. */
const tylkoH = (w: Wiersz) => /^H:/.test(w.dowod) || /\(H\)/.test(w.wtp);
const statusZal = (id: string) => zalozenia.split('\n').find((l) => l.startsWith(`| ${id} |`))?.split('|')[4]?.trim() ?? '';

describe('kontrakt: MVP na hipotezie tylko jako nazwany wyjątek z warunkiem oceny (062)', () => {
  it('F-72, F-75, F-78, F-80, F-81 to MVP z dowodem tylko H', () => {
    const mvpH = wiersze.filter((w) => w.decyzja === 'MVP' && tylkoH(w)).map((w) => w.id);
    expect(mvpH).toEqual(expect.arrayContaining(['F-72', 'F-75', 'F-78', 'F-80', 'F-81']));
  });

  it('każdy wiersz MVP z dowodem H ma D-nnn, ZAL-nnn (hipoteza) i datę oceny', () => {
    const bledy: string[] = [];
    for (const w of wiersze.filter((x) => x.decyzja === 'MVP' && tylkoH(x))) {
      if (!/\bD-\d{3}\b/.test(w.uzasadnienie)) bledy.push(`${w.id}: brak D-nnn`);
      const zal = w.uzasadnienie.match(/\bZAL-\d{3}\b/g) ?? [];
      if (!zal.length) bledy.push(`${w.id}: brak ZAL-nnn`);
      for (const z of zal) if (!/^hipoteza/.test(statusZal(z))) bledy.push(`${w.id}: ${z} bez statusu „hipoteza” w docs/zalozenia.md`);
      if (!/Ocena:[^|]*\d{4}-\d{2}-\d{2}/.test(w.uzasadnienie)) bledy.push(`${w.id}: brak „Ocena: … RRRR-MM-DD”`);
    }
    expect(bledy).toEqual([]);
  });
});

/**
 * Spirala z dwoma torami (D-105, wybór właściciela „Jedna spirala z dwoma torami: oba plany na jednym obrazku,
 * z legendą”; makieta roli 04 `ekrany/dwa-tory-v2.html`, opis 04-a2-opcje.md „Spirala z torami”): dwa tory obrócone
 * o 180°, stały odstęp 19 jednostek, pusty środek (promień ok. 36), tor 2 różny KSZTAŁTEM (kropki), nie tylko kolorem.
 * BR-KAL-016 „Jedna spirala z dwoma torami”.
 */
import {
  rysunekSpirali,
  SPIRALA_GRUBOSC,
  SPIRALA_GRUBOSC_TORY,
  SPIRALA_TORY,
  ukladSpirali,
  ukladyTorow,
  SPIRALA_ZWOJE,
  type KrokSpirali,
} from '../spirala-geometria';

const kroki = (n: number, noc = -1): KrokSpirali[] => Array.from({ length: n }, (_, i) => ({ minuty: 60, bierny: i === noc, noc: i === noc }));
const odl = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);

describe('spirala z dwoma torami (BR-KAL-016, D-105)', () => {
  it('BR-KAL-016 Jedna spirala z dwoma torami: tor 2 obrócony o 180°, odstęp między torami ok. 19 jednostek', () => {
    const [u1, u2] = ukladyTorow(kroki(5), kroki(3));
    expect(SPIRALA_TORY.obrot).toEqual([0, Math.PI]);
    // Punkt toru 2 to punkt toru 1 obrócony o 180° (ten sam promień przy tym samym parametrze)
    const p1 = u1.punkty[200];
    const p2 = u2.punkty[200];
    expect(p2.x).toBeCloseTo(-p1.x, 6);
    expect(p2.y).toBeCloseTo(-p1.y, 6);
    // Odstęp: każdy punkt toru 1 leży co najmniej 17 jednostek od toru 2 (makieta: stały odstęp 19)
    let min = Infinity;
    for (let i = 0; i < u1.punkty.length; i += 15) {
      for (let j = 0; j < u2.punkty.length; j += 3) min = Math.min(min, odl(u1.punkty[i], u2.punkty[j]));
    }
    expect(min).toBeGreaterThanOrEqual(17);
  });

  it('pusty środek: tory zaczynają się ok. 36–38 jednostek od środka, kończą na brzegu (98)', () => {
    const [u1] = ukladyTorow(kroki(4), kroki(4));
    const r = (p: { x: number; y: number }) => Math.hypot(p.x, p.y);
    expect(r(u1.punkty[0])).toBeGreaterThanOrEqual(35);
    expect(r(u1.punkty[0])).toBeLessThanOrEqual(39);
    expect(r(u1.punkty[u1.punkty.length - 1])).toBeCloseTo(98, 0);
  });

  it('spirala jednego wypieku bez zmian (domyślne opcje = dawny wzór)', () => {
    const u = ukladSpirali(kroki(5), SPIRALA_ZWOJE.plan);
    expect(Math.hypot(u.punkty[0].x, u.punkty[0].y)).toBeCloseTo(10 + (88 / ((0.9 + SPIRALA_ZWOJE.plan) * Math.PI)) * 0.9 * Math.PI, 6);
    const r = rysunekSpirali(u, kroki(5), { wariant: 'pelna', biezacy: 1, postepKroku: 0.5 });
    expect(r.odcinki.map((o) => o.grubosc)).toEqual([SPIRALA_GRUBOSC.zrobiony, SPIRALA_GRUBOSC.biezacy, 3, 3, 3]);
    expect(r.odcinki.every((o) => o.kreski === null)).toBe(true);
  });

  it('tor 2 różni się kształtem: każdy odcinek kropkami; tor 1 ciągły poza nocą w lodówce', () => {
    const [u1, u2] = ukladyTorow(kroki(4, 2), kroki(3, 1));
    const t1 = rysunekSpirali(u1, kroki(4, 2), { wariant: 'pelna', biezacy: 1, postepKroku: 0.3, tor: 1 });
    const t2 = rysunekSpirali(u2, kroki(3, 1), { wariant: 'pelna', biezacy: 0, postepKroku: 0.6, tor: 2 });
    expect(t1.odcinki.map((o) => o.kreski === null)).toEqual([true, true, false, true]);
    expect(t2.odcinki.every((o) => o.kreski !== null && o.kreski.startsWith('0.1 '))).toBe(true);
    // Grubości torów z jednej stałej (cieńsze niż przy jednym wypieku, żeby zmieścić odstęp)
    expect(t1.odcinki[0].grubosc).toBe(SPIRALA_GRUBOSC_TORY.zrobiony);
    expect(t2.odcinki[2].grubosc).toBe(SPIRALA_GRUBOSC_TORY.przyszly);
    // Znacznik „teraz” większy (mieści numer toru)
    expect(t1.teraz?.r).toBe(SPIRALA_TORY.znacznik);
    expect(t2.teraz).not.toBeNull();
  });
});

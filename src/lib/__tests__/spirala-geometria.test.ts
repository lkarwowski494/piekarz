// Spirala koszyka: geometria liczona bez telefonu (design-spec §2, §11b 058) [M1-audytor-generalny-058]
import {
  ukladSpirali,
  rysunekSpirali,
  punktNaDlugosci,
  krokiSpiraliZSesji,
  krokiSpiraliZakwasu,
  czasPrzejsciaSpirali,
  SPIRALA_GRUBOSC,
  SPIRALA_MAKS_BIERNY_MIN,
  SPIRALA_SKALA_MALEJ,
  SPIRALA_ZWOJE,
  SPIRALA_PUSTA,
  SPIRALA_KROK_BEZ_CZASU_MIN,
  WARIANTY_SPIRALI,
  type KrokSpirali,
  type KolorSpirali,
  type StanKrokuSpirali,
  type WariantSpirali,
} from '../spirala-geometria';
import { ruch } from '../../ui/tokeny';
import type { SessionStep } from '../../core/bake-steps';

// Plan 13 kroków jak w makiecie prowadzenia (docs/design/ekrany/wspolne.js, SPIRALA_DOMYSLNA)
const PLAN13: KrokSpirali[] = [
  { minuty: 240, bierny: true, noc: false }, // rozczyn
  { minuty: 15, bierny: false, noc: false },
  { minuty: 30, bierny: false, noc: false },
  { minuty: 30, bierny: false, noc: false },
  { minuty: 30, bierny: false, noc: false },
  { minuty: 30, bierny: false, noc: false },
  { minuty: 150, bierny: true, noc: false },
  { minuty: 20, bierny: false, noc: false },
  { minuty: 960, bierny: true, noc: true }, // garowanie w lodówce
  { minuty: 45, bierny: true, noc: false },
  { minuty: 20, bierny: true, noc: false },
  { minuty: 25, bierny: true, noc: false },
  { minuty: 60, bierny: true, noc: false },
];

const szer = (o: { od: number; do: number }) => o.do - o.od;

describe('ukladSpirali: punkty i granice kroków', () => {
  const uklad = ukladSpirali(PLAN13, SPIRALA_ZWOJE.plan);

  it('punkty idą od środka na zewnątrz: długość i promień rosną monotonicznie', () => {
    expect(uklad.punkty.length).toBeGreaterThan(100);
    for (let i = 1; i < uklad.punkty.length; i++) {
      const a = uklad.punkty[i - 1];
      const b = uklad.punkty[i];
      expect(b.l).toBeGreaterThan(a.l);
      expect(Math.hypot(b.x, b.y)).toBeGreaterThan(Math.hypot(a.x, a.y));
    }
    expect(uklad.dlugosc).toBe(uklad.punkty[uklad.punkty.length - 1].l);
  });

  it('jedna granica na krok, ciągłe od 0 do 1', () => {
    expect(uklad.granice).toHaveLength(13);
    expect(uklad.granice[0].od).toBe(0);
    expect(uklad.granice[12].do).toBeCloseTo(1, 10);
    for (let i = 1; i < 13; i++) expect(uklad.granice[i].od).toBeCloseTo(uklad.granice[i - 1].do, 10);
  });

  it('długość łuku proporcjonalna do czasu kroku', () => {
    const [mieszanie, skladanie] = [uklad.granice[1], uklad.granice[2]];
    expect(szer(skladanie) / szer(mieszanie)).toBeCloseTo(2, 10);
    expect(szer(uklad.granice[12]) / szer(uklad.granice[1])).toBeCloseTo(4, 10);
  });

  it('kroki bierne dłuższe niż 3 h rysowane jak 3 h i oznaczone jako skrócone', () => {
    expect(SPIRALA_MAKS_BIERNY_MIN).toBe(180);
    const noc = uklad.granice[8];
    const rozczyn = uklad.granice[0];
    expect(noc.skrocony).toBe(true);
    expect(rozczyn.skrocony).toBe(true);
    expect(szer(noc) / szer(uklad.granice[12])).toBeCloseTo(3, 10);
    expect(szer(rozczyn)).toBeCloseTo(szer(noc), 10);
    expect(uklad.granice[6].skrocony).toBe(false); // 150 min
    // krok czynny dłuższy niż 3 h nie jest skracany (§2 mówi o krokach biernych)
    const czynny = ukladSpirali([{ minuty: 240, bierny: false, noc: false }, { minuty: 60, bierny: true, noc: false }], 8.3);
    expect(czynny.granice[0].skrocony).toBe(false);
    expect(szer(czynny.granice[0]) / szer(czynny.granice[1])).toBeCloseTo(4, 10);
  });

  it('dłuższy krok w zmienionym planie ma dłuższy łuk', () => {
    const dluzszy = PLAN13.map((k, i) => (i === 2 ? { ...k, minuty: 60 } : k));
    const po = ukladSpirali(dluzszy, SPIRALA_ZWOJE.plan);
    expect(szer(po.granice[2])).toBeGreaterThan(szer(uklad.granice[2]));
  });

  it('krok bez czasu w planie dostaje stały krótki odcinek tylko na rysunku', () => {
    const u = ukladSpirali([{ minuty: null, bierny: false, noc: false }, { minuty: 60, bierny: true, noc: false }], 8.3);
    expect(szer(u.granice[0]) / szer(u.granice[1])).toBeCloseTo(SPIRALA_KROK_BEZ_CZASU_MIN / 60, 10);
  });

  it('jeden cykl zakwasu ma niecałe 2 zwoje: krótsza ścieżka niż plan', () => {
    expect(SPIRALA_ZWOJE.zakwas).toBeLessThan(2);
    const z = ukladSpirali(krokiSpiraliZakwasu(720), SPIRALA_ZWOJE.zakwas);
    expect(z.dlugosc).toBeLessThan(uklad.dlugosc / 3);
    expect(z.granice).toHaveLength(1);
    expect(z.granice[0].skrocony).toBe(false);
  });

  it('punktNaDlugosci interpoluje między punktami ścieżki', () => {
    const p0 = punktNaDlugosci(uklad, 0);
    expect(p0.x).toBeCloseTo(uklad.punkty[0].x, 6);
    const pk = punktNaDlugosci(uklad, uklad.dlugosc * 2);
    expect(pk.x).toBeCloseTo(uklad.punkty[uklad.punkty.length - 1].x, 6);
  });
});

describe('rysunekSpirali: stany kroków → grubość, kolor, wzór', () => {
  const uklad = ukladSpirali(PLAN13, SPIRALA_ZWOJE.plan);

  it('liczba odcinków = liczba kroków planu', () => {
    expect(rysunekSpirali(uklad, PLAN13, { wariant: 'pelna', biezacy: 3, postepKroku: 0.4 }).odcinki).toHaveLength(13);
  });

  it('zrobione 7 ratan, bieżący 9, przyszłe 3 ratanSzary, noc w lodówce kropkami nocDane', () => {
    expect(SPIRALA_GRUBOSC).toEqual({ zrobiony: 7, biezacy: 9, przyszly: 3 });
    const r = rysunekSpirali(uklad, PLAN13, { wariant: 'pelna', biezacy: 3, postepKroku: 0.4 });
    for (const o of r.odcinki.slice(0, 3)) {
      expect([o.stan, o.grubosc, o.kolor, o.kreski]).toEqual(['zrobiony', 7, 'ratan', null]);
    }
    expect([r.odcinki[3].stan, r.odcinki[3].grubosc, r.odcinki[3].kolor]).toEqual(['biezacy', 9, 'ratanSzary']);
    for (const o of r.odcinki.slice(4)) expect([o.stan, o.grubosc]).toEqual(['przyszly', 3]);
    expect([r.odcinki[8].kolor, r.odcinki[8].kreski]).toEqual(['nocDane', '2 5']);
    expect([r.odcinki[9].kolor, r.odcinki[9].kreski]).toEqual(['ratanSzary', null]);
    for (const o of r.odcinki) expect(o.d).toMatch(/^M-?\d+(\.\d)? -?\d+(\.\d)?( L-?\d+(\.\d)? -?\d+(\.\d)?)+$/);
  });

  it('bieżący: gruby tusz do miejsca „teraz” i znacznik z obwódką tusz', () => {
    const r = rysunekSpirali(uklad, PLAN13, { wariant: 'pelna', biezacy: 3, postepKroku: 0.5 });
    expect(r.postep).not.toBeNull();
    expect(r.postep?.grubosc).toBe(9);
    const g = uklad.granice[3];
    const oczek = punktNaDlugosci(uklad, (g.od + (g.do - g.od) * 0.5) * uklad.dlugosc);
    expect(r.teraz?.x).toBeCloseTo(oczek.x, 6);
    expect(r.teraz?.y).toBeCloseTo(oczek.y, 6);
    expect([r.teraz?.r, r.teraz?.obwodka]).toEqual([7, 3]);
    expect(r.koniec.r).toBe(4);
    expect(r.viewBox).toBe('-110 -110 220 220');
  });

  it('tylko kolory spirali z §11b i trzy stany kroku w każdym wariancie', () => {
    const dozwolone: KolorSpirali[] = ['ratan', 'ratanSzary', 'nocDane', 'tusz', 'tlo'];
    const stany: StanKrokuSpirali[] = ['zrobiony', 'biezacy', 'przyszly'];
    for (const wariant of WARIANTY_SPIRALI as readonly WariantSpirali[]) {
      const r = rysunekSpirali(uklad, PLAN13, { wariant, biezacy: 5, postepKroku: 0.3 });
      for (const o of r.odcinki) {
        expect(dozwolone).toContain(o.kolor);
        expect(stany).toContain(o.stan);
      }
    }
  });

  it('noc zrobiona jest gruba ratan bez kropek', () => {
    const r = rysunekSpirali(uklad, PLAN13, { wariant: 'pelna', biezacy: 10, postepKroku: 0 });
    expect([r.odcinki[8].kolor, r.odcinki[8].grubosc, r.odcinki[8].kreski]).toEqual(['ratan', 7, null]);
  });

  it('plan przed startem: wszystkie zwoje cienkie, bez „teraz”', () => {
    const r = rysunekSpirali(uklad, PLAN13, { wariant: 'plan', biezacy: 3, postepKroku: 0.5 });
    expect(r.odcinki.every((o) => o.stan === 'przyszly' && o.grubosc === 3)).toBe(true);
    expect(r.odcinki[8].kreski).toBe('2 5');
    expect(r.teraz).toBeNull();
    expect(r.postep).toBeNull();
  });

  it('mała (92 pt) ma grubości ×1,4', () => {
    expect(SPIRALA_SKALA_MALEJ).toBe(1.4);
    const r = rysunekSpirali(uklad, PLAN13, { wariant: 'mala', biezacy: 3, postepKroku: 0.5 });
    expect(r.odcinki[0].grubosc).toBeCloseTo(9.8, 10);
    expect(r.odcinki[3].grubosc).toBeCloseTo(12.6, 10);
    expect(r.odcinki[5].grubosc).toBeCloseTo(4.2, 10);
    expect(r.odcinki[8].kreski).toBe('2.8 7');
    expect(r.teraz?.r).toBeCloseTo(9.8, 10);
  });

  it('zakwas: jeden cykl, znacznik w miejscu czasu od dokarmienia', () => {
    const kroki = krokiSpiraliZakwasu(720);
    const u = ukladSpirali(kroki, SPIRALA_ZWOJE.zakwas);
    const r = rysunekSpirali(u, kroki, { wariant: 'zakwas', biezacy: 0, postepKroku: 380 / 720 });
    expect(r.odcinki).toHaveLength(1);
    expect(r.odcinki[0].stan).toBe('biezacy');
    const oczek = punktNaDlugosci(u, (380 / 720) * u.dlugosc);
    expect(r.teraz?.x).toBeCloseTo(oczek.x, 6);
    // ponad odstęp: znacznik na końcu, nie poza spiralą
    const po = rysunekSpirali(u, kroki, { wariant: 'zakwas', biezacy: 0, postepKroku: 2 });
    expect(po.teraz?.x).toBeCloseTo(r.koniec.x, 6);
  });

  it('pusta (ekran startowy, ikona): bez danych i bez „teraz”', () => {
    expect(SPIRALA_PUSTA).toHaveLength(5);
    const u = ukladSpirali(SPIRALA_PUSTA, SPIRALA_ZWOJE.plan);
    const r = rysunekSpirali(u, SPIRALA_PUSTA, { wariant: 'pusta', biezacy: 2, postepKroku: 0.5 });
    expect(r.odcinki.every((o) => o.stan === 'przyszly')).toBe(true);
    expect(r.teraz).toBeNull();
    expect(WARIANTY_SPIRALI).toEqual(['pelna', 'mala', 'plan', 'zakwas', 'pusta']);
  });
});

describe('krokiSpiraliZSesji i ruch', () => {
  const krok = (id: string, category: SessionStep['category'], durationMin: number | null, isPassive: boolean): SessionStep => ({
    id, name: id, category, durationMin, isPassive, instructions: '', plannedStart: null, plannedEnd: null,
  });

  it('garowanie chłodnicze w lodówce (final_proof) to noc; żytni rozrost w formie nie', () => {
    const kroki = krokiSpiraliZSesji([
      krok('mix', 'mix', 15, false),
      krok('final_proof', 'final_proof', 840, true),
      krok('rye_proof', 'final_proof', 90, true),
      krok('rye_mix', 'mix', null, false),
    ]);
    expect(kroki).toEqual([
      { minuty: 15, bierny: false, noc: false },
      { minuty: 840, bierny: true, noc: true },
      { minuty: 90, bierny: true, noc: false },
      { minuty: null, bierny: false, noc: false },
    ]);
  });

  it('po „Zrobione” przejście 300 ms; przy „Ogranicz ruch” bez przejścia', () => {
    expect(czasPrzejsciaSpirali(false)).toBe(ruch.zwoj.ms);
    expect(czasPrzejsciaSpirali(false)).toBe(300);
    expect(czasPrzejsciaSpirali(true)).toBe(0);
  });
});

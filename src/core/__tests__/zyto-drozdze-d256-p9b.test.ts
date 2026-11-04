// D-256 (rola 06): żyto 100% na drożdżach — rośnięcie w formie ocenia powierzchnia (ZYT-ETA-005), nie test palca;
// studzenie do 24 h (KRO-POC-016); pieczenie 240 °C 10 min + 220 °C 35 min (ZYT-DRO-002). Pszenne bez zmian [M3 p9b]
import { showsPokeTestEntry } from '../bake-steps';
import { krokiDrozdzowe, pieczenieDrozdzowe } from '../yeast-stages';

const START = Date.UTC(2026, 10, 4, 8, 0);
const krok = (id: string, nr: string) => krokiDrozdzowe(id, START)!.find((k) => k.id === nr)!;

const ZYT_ETA_005 = 'Zostaw ciasto w formie, aż jego powierzchnia dojdzie do brzegu formy.';
const KRO_POC_016 = 'Wilgotnym, zwartym chlebom z dużym udziałem żyta często służy studzenie nawet do 24 godzin.';

describe('D-256 żyto na drożdżach według źródeł', () => {
  it('drugie rośnięcie żyta: id yeast_proof, opis ZYT-ETA-005, bez wejścia do testu palca', () => {
    const k = krok('rye_100_pan', 'yeast_proof');
    expect(k.instructions).toBe(ZYT_ETA_005);
    expect(showsPokeTestEntry(k)).toBe(false);
  });

  it('studzenie żyta: 1440 min i zdanie KRO-POC-016', () => {
    const k = krok('rye_100_pan', 'yeast_cool');
    expect(k.durationMin).toBe(1440);
    expect(k.instructions).toBe(KRO_POC_016);
  });

  it('pszenne bez zmian: test palca na drugim rośnięciu, studzenie 120 min (uproszczenie DRO-PLN-900)', () => {
    for (const id of ['graham_bread_honey', 'tartine_high_hydration_80']) {
      const p = krok(id, 'yeast_proof');
      expect(showsPokeTestEntry(p)).toBe(true);
      expect(p.instructions).not.toBe(ZYT_ETA_005);
      const c = krok(id, 'yeast_cool');
      expect(c.durationMin).toBe(120);
      expect(c.instructions).not.toBe(KRO_POC_016);
    }
  });

  it('pieczenie żyta na drożdżach: 240 °C 10 min + 220 °C 35 min (ZYT-DRO-002); inne receptury bez danych', () => {
    expect(pieczenieDrozdzowe('rye_100_pan')).toEqual({ temp1C: 240, min1: 10, temp2C: 220, min2: 35 });
    expect(krok('rye_100_pan', 'yeast_bake').durationMin).toBe(45);
    for (const id of ['graham_bread_honey', 'tartine_high_hydration_80', 'spelt_ancient_seeded', 'country_loaf_72']) {
      expect(pieczenieDrozdzowe(id)).toBeNull();
    }
  });
});

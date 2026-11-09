// D-155/D-174: plan wersji drożdżowej z kroków istniejących kategorii (warunek G4: 1021 czyta sesję) i z czasami
// z receptury (docs/tresci/pl/wersje-drozdzowe.md, DRO-MOD-016: mieszanie, wyrabianie, pierwsze rośnięcie,
// odgazowanie, kształtowanie, drugie rośnięcie, pieczenie) [M3 p9b]
import { isDutchOvenStep, isStageCategory, showsPokeTestEntry } from '../bake-steps';
import { krokiDrozdzowe, krokiDrozdzoweKonczaceSie, maPlanDrozdzowy } from '../../recipes/yeast-stages';

const START = Date.UTC(2026, 10, 4, 8, 0);
const min = (kroki: ReturnType<typeof krokiDrozdzowe>) => kroki?.map((k) => [k.category, k.durationMin]);

describe('D-155 kroki planu wersji drożdżowej', () => {
  it('graham: 15 min fermentacji, 15 min po podziale, 70 min w formie, pieczenie z receptury (20 + 23)', () => {
    expect(min(krokiDrozdzowe('graham_bread_honey', START))).toEqual([
      ['mix', 15], ['bulk_ferment', 15], ['pre_shape', 10], ['bench_rest', 15], ['final_shape', 15], ['final_proof', 70], ['bake', 43], ['cool', 120],
    ]);
  });

  it('żyto 100%: 60 min odpoczynku, kęsy formowane ręcznie (bez odgazowania), 60 min w formie, pieczenie 10 + 35 min ze źródła', () => {
    expect(min(krokiDrozdzowe('rye_100_pan', START))).toEqual([
      ['mix', 15], ['bulk_ferment', 60], ['final_shape', 15], ['final_proof', 60], ['bake', 45], ['cool', 1440],
    ]);
  });

  it('tartine: noc, co najmniej 8 h, i 90 min po uformowaniu', () => {
    expect(min(krokiDrozdzowe('tartine_high_hydration_80', START))).toEqual([
      ['mix', 15], ['bulk_ferment', 480], ['pre_shape', 10], ['final_shape', 15], ['final_proof', 90], ['bake', 47], ['cool', 120],
    ]);
  });

  it('orkisz: źródło nie dzieli 3 h na etapy (DRO-WER-SP-001) — brak planu, nie zgadnięty podział', () => {
    expect(krokiDrozdzowe('spelt_ancient_seeded', START)).toBeNull();
    expect(maPlanDrozdzowy('spelt_ancient_seeded')).toBe(false);
    expect(maPlanDrozdzowy('graham_bread_honey')).toBe(true);
    expect(krokiDrozdzowe('country_loaf_72', START)).toBeNull();
  });

  it('kroki tylko z kategorii wydanego buildu, bez dokarmienia zakwasu, kolejno bez przerw, bez garnka', () => {
    for (const id of ['graham_bread_honey', 'rye_100_pan', 'tartine_high_hydration_80']) {
      const k = krokiDrozdzowe(id, START)!;
      expect(k.every((s) => isStageCategory(s.category))).toBe(true);
      expect(k.some((s) => s.category === 'starter_feed')).toBe(false);
      expect(k[0].plannedStart).toBe(START);
      k.forEach((s, i) => {
        expect(s.plannedEnd).toBe((s.plannedStart ?? 0) + (s.durationMin ?? 0) * 60_000);
        if (i > 0) expect(s.plannedStart).toBe(k[i - 1].plannedEnd);
      });
      expect(new Set(k.map((s) => s.id)).size).toBe(k.length);
      expect(k.some((s) => isDutchOvenStep(s))).toBe(false);
      // Drugie rośnięcie ocenia test palca (DRO-MOD-013) — tylko ciasto pszenne; żyto: D-256 (ZYT-ETA-005)
      expect(k.filter((s) => showsPokeTestEntry(s)).map((s) => s.category)).toEqual(id === 'rye_100_pan' ? [] : ['final_proof']);
    }
  });

  it('plan wstecz: ostatni krok kończy się o godzinie „gotowe”', () => {
    const cel = START + 10 * 3_600_000;
    const k = krokiDrozdzoweKonczaceSie('rye_100_pan', cel)!;
    expect(k[k.length - 1].plannedEnd).toBe(cel);
    expect(k[0].plannedStart).toBe(cel - (15 + 60 + 15 + 60 + 45 + 1440) * 60_000);
    expect(krokiDrozdzoweKonczaceSie('spelt_ancient_seeded', cel)).toBeNull();
  });
});

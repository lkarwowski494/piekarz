/**
 * Przeliczanie jednostek w gotowym tekście nie psuje liczb [M1-audytor-generalny-013; 09-lokalizacja-003; opcja a]:
 * para „400 °F, czyli około 204 °C” ze źródła zostaje jedną wartością °F (°C pary bez przeliczenia),
 * a masa z separatorem tysięcy języka („1.000 g”, „1 000 g”) liczy się jako tysiąc, nie jako 1 albo 000.
 * Kontrola trwała: każdy klucz, 35 języków, wartość oczekiwana z tekstu źródłowego PL, nie z EN.
 */
import { ACTIVE_LANGS, setLang, t } from '../src/lib/i18n';
import { formatTextUnits, formatWeight, setUnitSystem } from '../src/lib/unit-converter';

const EN = require('../src/lib/i18n.en').EN as Record<string, string>;
const KLUCZE = Object.keys(EN);
const RE_MASA_PL = /(\d{1,3}(?:[ \u00a0]\d{3})+|\d+(?:,\d+)?)\s*(kg|g)(?![A-Za-zĄ-ż\d])/g;

afterAll(() => {
  setUnitSystem('metric');
  setLang('pl');
});

describe('013: para °F/°C ze źródła', () => {
  const zF = KLUCZE.filter((k) => /°F/.test(k));
  it('klucze z °F w tekście źródłowym istnieją (sonda 09-lokalizacja-003: 9)', () => {
    expect(zF.length).toBeGreaterThanOrEqual(9);
  });
  it.each(ACTIVE_LANGS)('%s: w trybie imperialnym jedna wartość °F na parę, °C pary bez przeliczenia', (l) => {
    setLang(l);
    setUnitSystem('imperial');
    const zle: string[] = [];
    for (const k of zF) {
      const imp = t(k);
      const grupy = [...imp.matchAll(/(\d+)(?:\s*[–-]\s*(\d+))?\s*°F/g)].map((m) => [Number(m[1]), Number(m[2] ?? m[1])]);
      for (let i = 0; i < grupy.length; i++)
        for (let j = i + 1; j < grupy.length; j++)
          if (Math.abs(grupy[i][0] - grupy[j][0]) <= 3 && Math.abs(grupy[i][1] - grupy[j][1]) <= 3) zle.push(imp);
      for (const m of k.matchAll(/°F,? (?:czyli )?około (\d+(?:–\d+)?) °C/g)) if (!imp.includes(m[1].split('–')[0])) zle.push(`brak ${m[1]} °C: ${imp}`);
    }
    expect(zle).toEqual([]);
  });
});

describe('013: masa z separatorem tysięcy', () => {
  it('formatTextUnits: „1.000 g”, „1 000 g” i „1 000 g” = tysiąc gramów, gdy źródło ma 1000 g', () => {
    const oz = formatWeight(1000, 'imperial');
    for (const s of ['1.000 g dej', '1 000 g taikinaa', '1 000 g deg', '1 000 g deg', '1000 g']) {
      expect(formatTextUnits(s, 'imperial', 'Na przykład 1000 g ciasta')).toBe(s.replace(/1.?000 g/, oz).replace('1000 g', oz));
    }
    expect(formatTextUnits('1.5 g', 'imperial', '1,5 g')).toBe(formatWeight(1.5, 'imperial'));
  });

  it.each(ACTIVE_LANGS)('%s: każda masa ze źródła PL pojawia się w trybie imperialnym jako właściwe uncje', (l) => {
    setLang(l);
    setUnitSystem('imperial');
    const zle: string[] = [];
    for (const k of KLUCZE) {
      const masy = [...k.matchAll(RE_MASA_PL)].map((m) => parseFloat(m[1].replace(/[ \u00a0]/g, '').replace(',', '.')) * (m[2] === 'kg' ? 1000 : 1));
      if (masy.length === 0) continue;
      const imp = t(k);
      for (const g of masy) if (!imp.includes(formatWeight(g, 'imperial'))) zle.push(`${g} g → ${imp}`);
    }
    expect(zle).toEqual([]);
  });
});

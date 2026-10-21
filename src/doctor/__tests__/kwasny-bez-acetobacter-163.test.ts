/**
 * 163: przyczyna „Zbyt kwaśny (Octowy)” w Doktorze nie przypisuje kwaśnego smaku bakteriom kwasu octowego
 * (Acetobacter) — rejestr nie ma takiego twierdzenia (KWA-OCT-900 wycofane, kwas octowy w zakwasie: KWA-HYD-001);
 * pole równe zdaniu z docs/tresci/pl|en/kwasowosc-temperatura.md [M1-audytor-generalny-163; 06-tresci-505].
 */
import { diagnoseBreadDefect } from '../diagnostics';
import { setLang, t } from '../../lib/i18n';
import { linie } from '../../core/__tests__/helpers/tresci';

describe('163: kwaśny smak bez Acetobacter', () => {
  afterEach(() => setLang('pl'));
  const d = diagnoseBreadDefect({ breadIsExcessivelySour: true });

  it('PL i EN bez „Acetobacter” i bakterii kwasu octowego', () => {
    const pl = [d.biologicalCausePl, ...d.actionChecklistPl].join('\n');
    expect(pl).not.toMatch(/Acetobacter|bakteri\w* kwasu octowego|bakteri\w* octow/i);
    setLang('en');
    const en = [d.biologicalCausePl, ...d.actionChecklistPl].map((s) => t(s)).join('\n');
    expect(en).not.toMatch(/Acetobacter|acetic acid bacteria/i);
  });

  it('przyczyna = docs/tresci/pl|en/kwasowosc-temperatura.md', () => {
    expect(d.biologicalCausePl).toBe(linie('pl/kwasowosc-temperatura.md', 'diagnostics.EXCESSIVELY_SOUR.biologicalCausePl').join(' '));
    setLang('en');
    expect(t(d.biologicalCausePl)).toBe(linie('en/kwasowosc-temperatura.md', 'diagnostics.EXCESSIVELY_SOUR.biologicalCausePl').join(' '));
  });
});

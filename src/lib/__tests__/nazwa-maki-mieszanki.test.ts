// Z-3 z zadania 080: „Mąka żytnia typ 720” w wierszu mieszanki receptury zostawała po polsku (zapisana nazwa).
// Przy wyświetlaniu: profil atlasu po typie mąki → nazwaMaki (094: poza językiem z mapą typów bez numeru typu);
// zapisana nazwa i typ bez zmian; po polsku nazwa zapisana [M1-audytor-generalny-093].
import { setLang, t, type Lang } from '../i18n';
import { FLOUR_PROFILES } from '../../core/flour-atlas';
import { nazwaMaki } from '../nazwa-maki';
import { nazwaMakiMieszanki } from '../nazwa-maki-mieszanki';
import { MASTER_RECIPES } from '../../recipes/presets';

const zyto = FLOUR_PROFILES.find((p) => p.id === 'rye_720')!;

describe('nazwa mąki w mieszance receptury (093, Z-3)', () => {
  afterEach(() => setLang('pl'));

  it('po polsku: nazwa zapisana w recepturze', () => {
    expect(nazwaMakiMieszanki({ name: 'Mąka żytnia typ 720', type: 'zytnia_720' })).toBe('Mąka żytnia typ 720');
  });

  it.each<Lang>(['en', 'de'])('%s: mąka receptury bazowej przez profil atlasu, bez polskiego numeru typu', (l) => {
    setLang(l);
    const n = nazwaMakiMieszanki({ name: 'Mąka żytnia typ 720', type: 'zytnia_720' });
    expect(n).toBe(nazwaMaki(zyto));
    expect(n).not.toMatch(/720|Mąka/);
  });

  it('wiersz bez typu (wynik obliczeń): typ z receptury bazowej po nazwie', () => {
    setLang('de');
    expect(nazwaMakiMieszanki({ name: 'Mąka żytnia typ 720' })).toBe(nazwaMaki(zyto));
  });

  it('mąka bez profilu atlasu (durum, Tipo 00): przekład zapisanej nazwy; własna nazwa dosłownie', () => {
    setLang('en');
    expect(nazwaMakiMieszanki({ name: 'Mąka z pszenicy durum (Semolina)', type: 'durum' })).toBe(t('Mąka z pszenicy durum (Semolina)'));
    expect(nazwaMakiMieszanki({ name: 'Mąka z pszenicy durum (Semolina)', type: 'durum' })).not.toMatch(/Mąka/);
    expect(nazwaMakiMieszanki({ name: 'Moja mąka | młyn X' })).toBe('Moja mąka | młyn X');
  });

  it('każda mąka receptur bazowych ma w każdym języku nazwę bez polskiego słowa „Mąka”', () => {
    for (const l of ['en', 'de', 'ru', 'ja'] as Lang[]) {
      setLang(l);
      for (const r of MASTER_RECIPES) for (const f of r.formula.flours) expect(nazwaMakiMieszanki(f)).not.toMatch(/Mąka/);
    }
  });
});

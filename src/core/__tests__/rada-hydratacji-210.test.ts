/**
 * 210: porada przy hydratacji poniżej zakresu mieszanki nie stwierdza stanu ciasta jako pewnego — próg
 * (zakres profili, margines 2 p.p.) to MAK-HYD-900 [DO USTALENIA], a MAK-HYD-001 daje tylko kierunek
 * („will likely feel firm or even stiff”) [M1-audytor-generalny-210; 06-tresci-606].
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { analyzeFlourBlendAbsorption } from '../flour-atlas';
import { setLang, t } from '../../lib/i18n';

const ROOT = join(__dirname, '..', '..', '..');
const rejestr: { id: string; status: string; uwagi?: string }[] = JSON.parse(readFileSync(join(ROOT, 'docs/tresci/rejestr.json'), 'utf8'));

function poradaPonizej(): string {
  const blend = [{ name: 'Mąka pszenna typ 650', percentage: 100 }];
  const [lo] = analyzeFlourBlendAbsorption(blend, 70).recommendedHydrationRange;
  return analyzeFlourBlendAbsorption(blend, lo - 5).doughFeelAdvicePl;
}

describe('210: porada „poniżej zakresu” bez pewnej oceny ciasta', () => {
  afterEach(() => setLang('pl'));

  it('PL: „może być”, nie „będzie”', () => {
    expect(poradaPonizej()).toMatch(/może być zwarte/);
    expect(poradaPonizej()).not.toMatch(/będzie/);
  });

  it('EN: „may”, nie „will be”', () => {
    setLang('en');
    const en = t(poradaPonizej());
    expect(en).toMatch(/may feel firm/);
    expect(en).not.toMatch(/will be/);
  });

  it('MAK-HYD-900 nadal otwarte, a zdanie opisane jako warunkowe do czasu źródeł', () => {
    const r = rejestr.find((x) => x.id === 'MAK-HYD-900');
    expect(r?.status).toBe('otwarte');
    expect(r?.uwagi ?? '').toMatch(/M1-audytor-generalny-210/);
  });
});

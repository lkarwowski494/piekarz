/**
 * Porada pod mieszanką mąk (arkusz Składniki) w każdym języku poza PL jest tłumaczona: logika nie skleja porady
 * z ostrzeżeniem żytnim w jeden klucz, ekran tłumaczy każde zdanie osobno [M1-audytor-generalny-134; 09-lokalizacja-502].
 */
import { analyzeFlourBlendAbsorption, BlendAbsorptionAnalysis } from '../flour-atlas';
import { MASTER_RECIPES } from '../../recipes/presets';
import { ACTIVE_LANGS, Lang, setLang, t } from '../../lib/i18n';

/** Teksty, które ekran pokazuje pod mieszanką (każdy przez osobne `t()`). */
const tekstyPorady = (a: BlendAbsorptionAnalysis): string[] => [a.doughFeelAdvicePl, a.ryeWarningPl].filter((x): x is string => !!x);

const zyto = (proc: number) => [
  { name: 'Mąka żytnia typ 720', percentage: proc },
  { name: 'Mąka pszenna typ 650', percentage: 100 - proc },
];

/** Receptury bazowe przy ich hydratacji i mieszanki z żytem 40–100% w całym zakresie hydratacji. */
function przypadki(): [string, BlendAbsorptionAnalysis][] {
  const out: [string, BlendAbsorptionAnalysis][] = MASTER_RECIPES.map((r) => [
    r.id,
    analyzeFlourBlendAbsorption(r.formula.flours, r.formula.waterPercentage),
  ]);
  for (const proc of [40, 60, 80, 100]) {
    for (const h of [50, 65, 72, 80, 95, 110]) out.push([`żyto ${proc}%, woda ${h}%`, analyzeFlourBlendAbsorption(zyto(proc), h)]);
  }
  return out;
}

const JEZYKI: Lang[] = ACTIVE_LANGS.filter((l) => l !== 'pl');

describe('134: porada do mieszanki mąk przetłumaczona (bez sklejania zdań)', () => {
  afterEach(() => setLang('pl'));

  it('ostrzeżenie żytnie jest osobnym polem, porada go nie zawiera', () => {
    const a = analyzeFlourBlendAbsorption(zyto(100), 78);
    expect(a.ryeWarningPl).toBe('Wysoki udział żyta — ciasto będzie kleiste, unikaj agresywnego wyrabiania.');
    expect(a.doughFeelAdvicePl).not.toContain('żyta');
    expect(analyzeFlourBlendAbsorption(zyto(30), 70).ryeWarningPl).toBeUndefined();
  });

  it.each(JEZYKI)('%s: każdy tekst porady dla receptur bazowych i mieszanek z żytem ≥ 40% różny od PL (i od EN poza EN)', (jezyk) => {
    const teksty = [...new Set(przypadki().flatMap(([, a]) => tekstyPorady(a)))];
    setLang('en');
    const en = new Map(teksty.map((pl) => [pl, t(pl)]));
    setLang(jezyk);
    // Język bez własnego klucza dostaje tekst zastępczy EN (albo PL, gdy EN też nie ma klucza).
    const nieprzetlumaczone = teksty.filter((pl) => t(pl) === pl || (jezyk !== 'en' && t(pl) === en.get(pl)));
    expect(nieprzetlumaczone).toEqual([]);
  });

  it('receptury żytnie (rye_100_pan, borodinsky_rye) mają ostrzeżenie żytnie', () => {
    const mapa = new Map(przypadki());
    for (const id of ['rye_100_pan', 'borodinsky_rye']) expect(mapa.get(id)?.ryeWarningPl).toBeTruthy();
  });
});

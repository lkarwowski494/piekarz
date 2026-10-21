/**
 * 207: wiersz drożdży zaczynu w „Do miski” nazywa rodzaj drożdży zgodny z ZAC-POO-002, ZAC-BIG-001 i ZAC-PAT-002
 * (procent BBGA = drożdże świeże prasowane), w PL i EN [M1-audytor-generalny-207; 06-tresci-603].
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { readFileSync } from 'fs';
import { join } from 'path';
import { DoMiski, DoMiskiProps } from '../DoMiski';
import { calculateDoughRecipe } from '../../../core/domain-rules';
import { procentyFormulyZZaczynem, zaczynWFormule } from '../../../core/zaczyn-w-formule';
import type { PrefermentType } from '../../../core/preferments';
import { setLang } from '../../../lib/i18n';

const ROOT = join(__dirname, '..', '..', '..', '..');
const rejestr: { id: string; twierdzenie: string; zrodla: { cytat: string }[] }[] = JSON.parse(
  readFileSync(join(ROOT, 'docs/tresci/rejestr.json'), 'utf8'),
);

const tekst = (n: renderer.ReactTestInstance): string =>
  n.findAll((c) => (c.type as unknown) === 'Text')
    .map((c) => (Array.isArray(c.props.children) ? c.props.children.join('') : String(c.props.children)))
    .join(' ');

function props(zaczyn: PrefermentType): DoMiskiProps {
  const formula = { waterPercentage: 70, saltPercentage: 2, starterPercentage: 0, starterHydration: 100, yeastPercentage: 0.5 };
  const wej = { ...formula, prefermentType: zaczyn, prefermentFlourPercentage: 30 };
  const proc = procentyFormulyZZaczynem(wej);
  const breakdown = zaczynWFormule({ ...wej, ...proc, targetDoughWeightGrams: 1000 });
  return {
    calculations: calculateDoughRecipe({
      flours: [{ name: 'Mąka pszenna typ 750', percentage: 100 }],
      waterPercentage: proc.waterPercentage,
      saltPercentage: proc.saltPercentage,
      starterPercentage: 0,
      targetDoughWeightGrams: 1000,
    }),
    waterPct: proc.waterPercentage, starterPct: 0, starterHydration: 100, saltPct: proc.saltPercentage, yeastPct: proc.yeastPercentage,
    calcMode: 'loaves', loavesCount: 1, onLoavesChange: jest.fn(), loafWeightGrams: 1000, onLoafWeightChange: jest.fn(),
    flourGrams: 500, onFlourGramsChange: jest.fn(), prefermentType: zaczyn, prefermentBreakdown: breakdown,
  };
}

describe('207: rodzaj drożdży w wierszu drożdży zaczynu', () => {
  let tree: renderer.ReactTestRenderer | null = null;
  afterEach(() => {
    if (tree) act(() => tree?.unmount());
    tree = null;
    setLang('pl');
  });

  it('twierdzenia ZAC-* mówią o drożdżach świeżych prasowanych', () => {
    for (const id of ['ZAC-POO-002', 'ZAC-BIG-001', 'ZAC-PAT-002']) {
      expect(rejestr.find((r) => r.id === id)?.twierdzenie).toMatch(/drożdż\w* śwież/);
    }
  });

  it.each([
    ['pl', 'poolish', 'Drożdże świeże (prasowane)'],
    ['pl', 'biga', 'Drożdże świeże (prasowane)'],
    ['pl', 'pate_fermentee', 'Drożdże świeże (prasowane)'],
    ['en', 'biga', 'Fresh yeast (compressed)'],
  ] as const)('%s, %s: wiersz drożdży zaczynu nazywa drożdże świeże', async (kod, zaczyn, wzor) => {
    setLang(kod);
    await act(async () => {
      tree = renderer.create(<DoMiski {...props(zaczyn)} />);
    });
    const wiersz = tree!.root.findAll((n) => typeof n.type === 'string' && n.props.testID === 'scale-item-preferment-yeast')[0];
    expect(wiersz).toBeDefined();
    expect(tekst(wiersz)).toContain(wzor);
  });
});

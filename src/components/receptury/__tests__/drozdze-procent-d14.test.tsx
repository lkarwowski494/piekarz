/**
 * Audyt niezależny D-14: wiersz drożdży w „Do miski” zaokrąglał procent do jednego miejsca, więc pizza z 0,08%
 * drożdży pokazywała „0,1%” (25% więcej niż receptura). Procent drożdży ma dwa miejsca po przecinku
 * [audyt-niezalezny D-14].
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { DoMiski } from '../DoMiski';
import { calculateDoughRecipe } from '../../../core/domain-rules';
import { setLang } from '../../../lib/i18n';

const tekst = (n: renderer.ReactTestInstance): string =>
  n.findAll((c) => (c.type as unknown) === 'Text')
    .map((c) => (Array.isArray(c.props.children) ? c.props.children.join('') : String(c.props.children)))
    .join(' ');

describe('D-14: procent drożdży z dwoma miejscami', () => {
  beforeEach(() => setLang('pl'));

  it('pizza 0.08% yeast shows "0,08%", not "0,1%"', () => {
    const formula = { flours: [{ name: 'Mąka pszenna włoska Tipo 00', percentage: 100 }], waterPercentage: 65, saltPercentage: 2.8, starterPercentage: 0, extraYeastPercentage: 0.08, targetDoughWeightGrams: 1000 };
    let t!: renderer.ReactTestRenderer;
    act(() => {
      t = renderer.create(
        <DoMiski
          calculations={calculateDoughRecipe(formula)}
          waterPct={65} starterPct={0} starterHydration={100} saltPct={2.8} yeastPct={0.08}
          calcMode="loaves" loavesCount={1} onLoavesChange={() => undefined}
          loafWeightGrams={1000} onLoafWeightChange={() => undefined}
          flourGrams={500} onFlourGramsChange={() => undefined}
          prefermentType="direct" prefermentBreakdown={null}
        />,
      );
    });
    const wiersz = t.root.findAll((n) => typeof n.type !== 'string' && n.props.testID === 'scale-item-yeast')[0];
    expect(tekst(wiersz)).toContain('0,08%');
    expect(tekst(wiersz)).not.toContain('0,1%');
    act(() => t.unmount());
  });
});

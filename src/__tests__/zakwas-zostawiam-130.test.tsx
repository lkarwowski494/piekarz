/**
 * Dokarmianie z masy zakwasu zostawionego w słoiku i proporcji (RD-14; BR-ZAKW-002)
 * [M1-audytor-generalny-130; 01-odkrywanie-501].
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { StarterFeedingCard } from '../components/zakwas/StarterFeedingCard';
import { dokarmienieZeZostawionego } from '../core/dokarmianie';
import { setLang, t } from '../lib/i18n';

const tekst = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(tekst).join('');
  if (n && typeof n === 'object' && 'children' in n) return tekst((n as { children: unknown }).children);
  return '';
};

function karta(): renderer.ReactTestRenderer {
  let tree: renderer.ReactTestRenderer | null = null;
  act(() => {
    tree = renderer.create(
      <StarterFeedingCard
        selectedRatio={[1, 2, 2]}
        onSelectRatio={() => {}}
        targetYield={200}
        onTargetYieldChange={() => {}}
        feeding={{ starterGrams: 40, flourGrams: 80, waterGrams: 80 }}
        hydratacjaZakwasu={100}
        unitSystem="metric"
        onCopyFeeding={() => {}}
      />,
    );
  });
  return tree!;
}

describe('Dokarmianie z masy zostawionej w słoiku (130)', () => {
  beforeEach(() => setLang('pl'));

  it('dokarmienieZeZostawionego: 50 g + 1:2:2 przy 100% → 100 g mąki, 100 g wody, hydratacja 100%; 0 g → null', () => {
    expect(dokarmienieZeZostawionego(50, [1, 2, 2], 100)).toEqual({ makaG: 100, wodaG: 100, hydratacjaPct: 100 });
    expect(dokarmienieZeZostawionego(20, [1, 5, 5], 100)).toEqual({ makaG: 100, wodaG: 100, hydratacjaPct: 100 });
    expect(dokarmienieZeZostawionego(30, [1, 1, 1], 50)).toEqual({ makaG: 30, wodaG: 30, hydratacjaPct: 80 });
    expect(dokarmienieZeZostawionego(0, [1, 2, 2], 100)).toBeNull();
  });

  it('zostawiam 50 g, proporcja 1:2:2: karta pokazuje 100 g mąki, 100 g wody i hydratację 100% (BR-ZAKW-002 Proporcja 1:2:2)', () => {
    const tree = karta();
    act(() => {
      tree.root.findByProps({ testID: 'zostawiam-input' }).props.onChangeText('50');
    });
    const wynik = tekst(tree.root.findByProps({ testID: 'zostawiam-wynik' }).children);
    expect(wynik).toContain('100 g');
    expect(wynik).toContain(t('Hydratacja zakwasu {n}%', { n: 100 }));
    expect(wynik).toContain('Hydratacja zakwasu 100%');
    act(() => tree.unmount());
  });

  it('puste pole masy zakwasu: prośba o uzupełnienie (BR-ZAKW-002 Brak masy zakwasu)', () => {
    const tree = karta();
    expect(tekst(tree.toJSON())).toContain('Wpisz, ile zakwasu zostawiasz w słoiku.');
    expect(tekst(tree.toJSON())).toContain('Zostawiam w słoiku');
    act(() => tree.unmount());
  });
});

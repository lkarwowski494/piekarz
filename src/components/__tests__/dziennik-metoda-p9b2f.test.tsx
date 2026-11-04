/**
 * p9b2f P9B2F-6 (D-260): Dziennik pokazuje metodę wypieku (piekarnik / maszyna do chleba) przy wpisie z bake_method;
 * starsze wpisy (null albo brak) bez etykiety — brak zostaje brakiem [M3 p9b2f].
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { BakeHistorySection } from '../stolnica/BakeHistorySection';
import type { StoredBakeLog } from '../../data/db';
import { setLang } from '../../lib/i18n';

const wpis = (id: string, bakeMethod?: StoredBakeLog['bakeMethod']): StoredBakeLog => ({
  id, recipeName: `Chleb ${id}`, startedAt: 1, finishedAt: 2, ...(bakeMethod !== undefined ? { bakeMethod } : {}),
});

async function render(logi: StoredBakeLog[]) {
  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(
      <BakeHistorySection bakeHistory={logi} filteredHistory={logi}
        onDeleteBakeLog={() => undefined} onBakeAgain={() => undefined} onChooseRecipe={() => undefined} />,
    );
  });
  return tree;
}
const metoda = (tree: renderer.ReactTestRenderer, id: string) => tree.root.findAll((n) => typeof n.type === 'string' && n.props?.testID === `bake-log-metoda-${id}`);
const napisy = (n: renderer.ReactTestInstance) => n.findAll((c) => (c.type as unknown) === 'Text').map((c) => String(c.props.children)).join(' ');

describe('P9B2F-6: metoda wypieku w Dzienniku (D-260)', () => {
  afterEach(() => setLang('pl'));

  it('wpis z maszyny pokazuje „Maszyna do chleba”, wpis z piekarnika „Piekarnik”', async () => {
    const tree = await render([wpis('m', 'maszyna'), wpis('p', 'piekarnik')]);
    expect(metoda(tree, 'm')).toHaveLength(1);
    expect(metoda(tree, 'p')).toHaveLength(1);
    expect(napisy(metoda(tree, 'm')[0])).toBe('Maszyna do chleba');
    expect(napisy(metoda(tree, 'p')[0])).toBe('Piekarnik');
  });

  it('starszy wpis (null albo brak pola) nie ma etykiety metody', async () => {
    const tree = await render([wpis('n', null), wpis('b')]);
    expect(metoda(tree, 'n')).toHaveLength(0);
    expect(metoda(tree, 'b')).toHaveLength(0);
  });

  it('po angielsku etykiety z istniejących kluczy EN', async () => {
    setLang('en');
    const tree = await render([wpis('m', 'maszyna')]);
    expect(metoda(tree, 'm')).toHaveLength(1);
    expect(napisy(metoda(tree, 'm')[0])).toBe('Bread machine');
  });
});

// ============================================================================
// Piekarz — wykres smaku wpisu Dziennika tylko z zapisanego profilu (PRZ-42, przegląd roli 04; zasada „brak zostaje
// brakiem”): bez `sensoryProfile` wpis dostaje pigułki z ocenami, nie wykres z wartościami, których nie podano.
// ============================================================================

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { BakeHistorySection } from '../stolnica/BakeHistorySection';
import type { StoredBakeLog } from '../../data/db';

const zProfilem: StoredBakeLog = {
  id: 'z-profilem', recipeName: 'Chleb A', startedAt: 1, finishedAt: 2, crumbScore: 4, crustScore: 5, tasteProfile: 'sour',
  sensoryProfile: { crustCrispness: 5, crumbElasticity: 2, acidity: 4, openCrumb: 3, caramelization: 1 },
};
const bezProfilu: StoredBakeLog = { id: 'bez-profilu', recipeName: 'Chleb B', startedAt: 1, finishedAt: 2, crumbScore: 4, crustScore: 5, tasteProfile: 'mild', ratingStars: 5 };

async function render(logi: StoredBakeLog[]) {
  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(
      <BakeHistorySection bakeHistory={logi} selectedTasteFilter="all" onSelectTasteFilter={() => undefined} filteredHistory={logi}
        onDeleteBakeLog={() => undefined} onBakeAgain={() => undefined} onChooseRecipe={() => undefined} />,
    );
  });
  return tree;
}
const wykres = (tree: renderer.ReactTestRenderer, id: string) => tree.root.findAll((n) => n.props?.testID === `history-radar-${id}`);
const tekst = (tree: renderer.ReactTestRenderer) => JSON.stringify(tree.toJSON());

describe('PRZ-42: wykres smaku w Dzienniku', () => {
  it('wpis z zapisanym sensoryProfile ma wykres', async () => {
    const tree = await render([zProfilem]);
    expect(wykres(tree, 'z-profilem').length).toBeGreaterThan(0);
  });

  it('wpis bez sensoryProfile nie ma wykresu, a oceny zostają w pigułkach', async () => {
    const tree = await render([bezProfilu]);
    expect(wykres(tree, 'bez-profilu')).toHaveLength(0);
    expect(tekst(tree)).toContain('Miękisz:');
    expect(tekst(tree)).toContain('Skórka:');
  });
});

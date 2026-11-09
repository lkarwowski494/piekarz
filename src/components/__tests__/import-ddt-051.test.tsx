/**
 * Podgląd importu receptury: etykieta DDT przez t('DDT'), nie na sztywno [M1-audytor-generalny-051; 09-lokalizacja-010].
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { ImportRecipeModal } from '../ImportRecipeModal';
import * as sqliteStore from '../../data/sqlite-store';
import { setLang, t } from '../../lib/i18n';

const JSON_RECEPTURY = JSON.stringify({
  schema: 'piekarz/recipe/v1',
  recipe: {
    name: 'Chleb z importu',
    targetDDT: 24.5,
    formula: { flours: [{ name: 'Mąka pszenna typ 750', percentage: 100 }], waterPercentage: 70, saltPercentage: 2, starterPercentage: 20 },
  },
});

describe('051: DDT w podglądzie importu w języku interfejsu', () => {
  afterEach(() => setLang('pl'));
  it('de: „Teigtemp.” zamiast „DDT:”', () => {
    sqliteStore._resetMemStore();
    setLang('de');
    expect(t('DDT')).not.toBe('DDT');
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<ImportRecipeModal visible onClose={jest.fn()} onImportSuccess={jest.fn()} />);
    });
    act(() => tree.root.findByProps({ testID: 'recipe-json-input' }).props.onChangeText(JSON_RECEPTURY));
    const tekst = JSON.stringify(tree.toJSON());
    expect(tekst).toContain(`${t('DDT')}: `);
    expect(tekst).not.toContain('"DDT: "');
    act(() => tree.unmount());
  });
});

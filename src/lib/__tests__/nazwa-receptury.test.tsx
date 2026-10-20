// Z-3 z zadania 080: nazwa receptury bazowej zostawała po polsku w nagłówku, Stolnicy i Dzienniku. Zapisana nazwa
// (namePl, dane użytkownika i dopasowania po nazwie) się nie zmienia; przekład przy wyświetlaniu
// [M1-audytor-generalny-093].
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { setLang, t, type Lang } from '../i18n';
import { MASTER_RECIPES } from '../../recipes/presets';
import { nazwaReceptury } from '../nazwa-receptury';
import { StrefaPlanu } from '../../components/stolnica/StrefaPlanu';

const bazowa = MASTER_RECIPES[0].namePl;

describe('nazwa receptury przy wyświetlaniu (093, Z-3)', () => {
  afterEach(() => setLang('pl'));

  it('receptura bazowa: nazwa w języku aplikacji; po polsku bez zmian', () => {
    expect(nazwaReceptury(bazowa)).toBe(bazowa);
    setLang('de' as Lang);
    expect(nazwaReceptury(bazowa)).toBe(t(bazowa));
    expect(nazwaReceptury(bazowa)).not.toBe(bazowa);
  });

  it('własna nazwa użytkownika zostaje dosłownie, także ze znakiem „|”', () => {
    setLang('de' as Lang);
    expect(nazwaReceptury('Mój chleb | wersja 2')).toBe('Mój chleb | wersja 2');
    expect(nazwaReceptury('Dziś')).toBe('Dziś');
  });

  it('Stolnica: znacznik receptury w strefie planu w języku aplikacji', () => {
    setLang('en');
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<StrefaPlanu recipeName={bazowa} steps={[]} stepIdx={0} pozostaloSec={null} pelnySec={0} />);
    });
    expect(JSON.stringify(tree.toJSON())).toContain(t(bazowa));
    expect(JSON.stringify(tree.toJSON())).not.toContain(bazowa);
    act(() => tree.unmount());
  });
});

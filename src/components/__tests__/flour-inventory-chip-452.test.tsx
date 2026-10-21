/**
 * Szybki wybór mąki w spiżarni poza PL: pole nazwy dostaje nazwę ogólną w języku interfejsu, nie polską nazwę
 * z typem; zapas zapisuje się pod nazwą danych atlasu (jak mąki receptur), więc dopasowuje się do mąki receptury,
 * a lista pokazuje go w języku interfejsu [M2-koordynator-napraw-452 (p12b2)].
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import { FlourInventoryModal } from '../FlourInventoryModal';
import { zUprawnieniem } from '../../../tests/helpers/platnosci';
import { initDatabase, getFlourInventory, _resetMemStore } from '../../data/sqlite-store';
import { FLOUR_PROFILES } from '../../core/flour-atlas';
import { checkFlourInventory } from '../../core/inventory';
import { nazwaMaki } from '../../lib/nazwa-maki';
import { setLang } from '../../lib/i18n';

describe('spiżarnia: chip mąki poza PL (452)', () => {
  let tree: renderer.ReactTestRenderer | null = null;

  beforeEach(async () => {
    zUprawnieniem();
    _resetMemStore();
    await initDatabase();
    setLang('en');
  });

  afterEach(() => {
    if (tree) act(() => tree?.unmount());
    tree = null;
    setLang('pl');
  });

  it('EN: chip wpisuje nazwę ogólną, zapis pod nazwą atlasu dopasowuje się do receptury, lista po angielsku', async () => {
    await act(async () => {
      tree = renderer.create(<FlourInventoryModal visible onClose={jest.fn()} />);
    });
    const root = tree!.root;
    await act(async () => {
      root.findByProps({ testID: 'open-add-flour-btn' }).props.onPress();
    });
    const p = FLOUR_PROFILES.slice(0, 6).find((x) => x.id === 'wheat_750')!;
    const ogolna = nazwaMaki(p, 'en');
    const etykieta = root.findByProps({ testID: 'add-flour-form' }).findAllByType(Text).find((tx) => tx.props.children === ogolna.split(' (')[0])!;
    let chip = etykieta.parent;
    while (chip && typeof chip.props.onPress !== 'function') chip = chip.parent;
    await act(async () => {
      chip!.props.onPress();
    });
    const pole = root.findByProps({ testID: 'new-flour-name-input' });
    expect(pole.props.value).toBe(ogolna);
    expect(pole.props.value).not.toMatch(/[ąćęłńóśźż]|Mąka|typ/);

    await act(async () => {
      root.findByProps({ testID: 'new-flour-stock-input' }).props.onChangeText('700');
    });
    await act(async () => {
      root.findByProps({ testID: 'confirm-add-flour-btn' }).props.onPress();
    });
    const dodana = (await getFlourInventory()).find((i) => i.stockGrams === 700)!;
    expect(dodana.name).toBe(p.namePl);
    const wynik = checkFlourInventory([{ name: p.namePl, weightGrams: 300 }], (await getFlourInventory()).filter((i) => i.id === dodana.id));
    expect(wynik.items[0].matchedInventoryId).toBe(dodana.id);
    expect(JSON.stringify(tree!.toJSON())).toContain(ogolna);
  });
});

/**
 * 164: szybki wybór mąki w spiżarni pokazuje nazwę przez nazwaMaki — poza PL nazwę ogólną
 * z OPIS_OGOLNY_MAK (094), bez polskiego numeru typu; w PL nazwę z typem jak dotąd
 * [M1-audytor-generalny-164; 06-tresci-507].
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import { FlourInventoryModal } from '../FlourInventoryModal';
import { zUprawnieniem } from '../../../tests/helpers/platnosci';
import { initDatabase, _resetMemStore } from '../../data/sqlite-store';
import { FLOUR_PROFILES } from '../../core/flour-atlas';
import { OPIS_OGOLNY_MAK } from '../../core/flour-atlas-ogolne';
import { setLang, t } from '../../lib/i18n';

async function chipy(): Promise<string[]> {
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(<FlourInventoryModal visible={true} onClose={jest.fn()} />);
  });
  const root = tree!.root;
  await act(async () => {
    root.findByProps({ testID: 'open-add-flour-btn' }).props.onPress();
  });
  const form = root.findByProps({ testID: 'add-flour-form' });
  const scroll = form.findAll((n) => n.props.horizontal === true && typeof n.type !== 'string')[0];
  const teksty = scroll
    .findAllByType(Text)
    .map((n) => (Array.isArray(n.props.children) ? n.props.children.join('') : String(n.props.children)));
  act(() => tree!.unmount());
  return teksty;
}

describe('164: chip szybkiego wyboru w spiżarni', () => {
  beforeEach(async () => {
    zUprawnieniem();
    _resetMemStore();
    await initDatabase();
  });
  afterEach(() => setLang('pl'));

  it('EN: chip pokazuje nazwę ogólną z OPIS_OGOLNY_MAK, bez polskiego typu', async () => {
    setLang('en');
    const teksty = await chipy();
    const oczekiwane = FLOUR_PROFILES.slice(0, 6).map((p) => t(OPIS_OGOLNY_MAK[p.id].nazwaPl));
    expect(teksty).toEqual(oczekiwane);
    for (const s of teksty) expect(s).not.toMatch(/Mąka|typ \d/);
  });

  it('PL: chip pokazuje nazwę z typem (mapa typów)', async () => {
    setLang('pl');
    const teksty = await chipy();
    expect(teksty).toEqual(FLOUR_PROFILES.slice(0, 6).map((p) => p.namePl.split(' (')[0]));
  });
});

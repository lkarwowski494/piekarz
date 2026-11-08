/**
 * Z-08-1: gdy dane licencji nie wczytają się (zły kształt pliku), ekran mówi o tym zamiast pokazać pustą listę.
 */
import React from 'react';
import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { LicencjeEkran } from '../settings/LicencjeEkran';
import { setLang } from '../../lib/i18n';

jest.mock('../../lib/licencje', () => ({
  ...jest.requireActual('../../lib/licencje'),
  wczytajLicencje: () => ({ ok: false, blad: 'dane licencji: pakiety' }),
}));

describe('LicencjeEkran: błąd wczytania danych', () => {
  afterEach(() => act(() => setLang('pl')));

  it('PL: komunikat „Nie można wczytać listy licencji.”, bez listy', () => {
    act(() => setLang('pl'));
    let tree: renderer.ReactTestRenderer | null = null;
    act(() => { tree = renderer.create(<LicencjeEkran />); });
    const teksty = tree!.root.findAllByType(Text).map((n) => String(n.props.children));
    expect(teksty).toEqual(['Nie można wczytać listy licencji.']);
    expect(tree!.root.findAllByProps({ testID: 'licencje-lista' })).toHaveLength(0);
    act(() => tree!.unmount());
  });

  it('EN: „The list of licenses could not be loaded.”', () => {
    act(() => setLang('en'));
    let tree: renderer.ReactTestRenderer | null = null;
    act(() => { tree = renderer.create(<LicencjeEkran />); });
    expect(tree!.root.findAllByType(Text).map((n) => String(n.props.children))).toEqual(['The list of licenses could not be loaded.']);
    act(() => tree!.unmount());
  });
});

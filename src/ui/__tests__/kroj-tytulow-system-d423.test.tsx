/**
 * Krój tytułów po zmianie języka: rozwiązanie systemowe dla wszystkich arkuszy stylów (KO-070, D-419, D-423).
 * Błąd: `get fontFamily()` w `StyleSheet.create` liczy się leniwie, więc styl z poprzedniego renderu po zmianie języka
 * daje już NOWY krój i natywny diff (ReactNativeAttributePayload) nie widzi zmiany (ru/uk zostają przy Sofii z bułgarskimi
 * formami, vi/ja/ko/zh-Hant przy Sofii bez glifów). Test: styl z renderu przed zmianą ma po zmianie dalej krój z chwili
 * renderu (wartość statyczna), a nowy render ma krój nowego języka; stan komponentu (zakładka) zostaje.
 */
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { AcademyHeader } from '../../components/academy/AcademyHeader';
import { NotificationsOffBanner } from '../../components/NotificationsOffBanner';
import { JEZYKI_CYRYLICY_BEZ_FORM_KROJU, JEZYKI_POZA_KROJEM_TYTULOW } from '../kroj-tytulow';
import { opcjeNaglowka } from '../naglowek';
import { kolory, typografia } from '../tokeny';
import { setLang, type Lang } from '../../lib/i18n';

jest.mock('../../lib/notifications', () => ({
  ...jest.requireActual('../../lib/notifications'),
  getNotificationPermission: jest.fn(async () => 'denied'),
  subscribeNotificationPermission: jest.fn(() => () => undefined),
}));

type Wezel = renderer.ReactTestInstance;
const JEZYKI_SYSTEMOWE: Lang[] = [...JEZYKI_POZA_KROJEM_TYTULOW, ...JEZYKI_CYRYLICY_BEZ_FORM_KROJU];

const flush = async () => {
  for (let i = 0; i < 5; i++) await new Promise((r) => setImmediate(r));
};

const przypadki: Array<[string, () => React.ReactElement, (n: Wezel) => boolean]> = [
  ['AcademyHeader (tytuł okna: pierwszy Text)', () => <AcademyHeader onClose={jest.fn()} activeTab="school" onSelectTab={jest.fn()} />,
    (n) => String(n.type) === 'Text'],
  ['NotificationsOffBanner (tytuł banera: pierwszy Text)', () => <NotificationsOffBanner />,
    (n) => String(n.type) === 'Text'],
];

afterEach(() => setLang('pl'));

describe('krój tytułu po zmianie języka w arkuszach stylów (KO-070)', () => {
  describe.each(przypadki)('%s', (_n, el, szukaj) => {
    const render = async () => {
      let tree!: renderer.ReactTestRenderer;
      await act(async () => { tree = renderer.create(el()); await flush(); });
      return tree;
    };
    const cel = (tree: renderer.ReactTestRenderer) => tree.root.findAll(szukaj)[0]!;

    it.each(JEZYKI_SYSTEMOWE)('pl → %s: nowy render ma krój systemowy, styl sprzed zmiany zachowuje Sofię', async (jezyk) => {
      setLang('pl');
      const tree = await render();
      const stare = cel(tree).props.style;
      expect(StyleSheet.flatten(stare).fontFamily).toBe(typografia.krojTytulow);
      act(() => { setLang(jezyk); });
      await act(async () => { tree.update(el()); await flush(); });
      expect(StyleSheet.flatten(cel(tree).props.style).fontFamily).toBeUndefined();
      expect(StyleSheet.flatten(stare).fontFamily).toBe(typografia.krojTytulow);
    });

    it('ru → pl: wraca Sofia, a styl z ru zostaje systemowy', async () => {
      setLang('ru');
      const tree = await render();
      const stare = cel(tree).props.style;
      expect(StyleSheet.flatten(stare).fontFamily).toBeUndefined();
      act(() => { setLang('pl'); });
      await act(async () => { tree.update(el()); await flush(); });
      expect(StyleSheet.flatten(cel(tree).props.style).fontFamily).toBe(typografia.krojTytulow);
      expect(StyleSheet.flatten(stare).fontFamily).toBeUndefined();
    });
  });

  it('zmiana języka nie gubi stanu komponentu (bez key na korzeniu)', async () => {
    function Probe() {
      const [tab, setTab] = useState<'school' | 'techniques'>('school');
      return <AcademyHeader onClose={jest.fn()} activeTab={tab} onSelectTab={setTab} />;
    }
    setLang('pl');
    let tree!: renderer.ReactTestRenderer;
    await act(async () => { tree = renderer.create(<Probe />); await flush(); });
    act(() => { tree.root.findByProps({ testID: 'academy-tab-techniques' }).props.onPress(); });
    expect(tree.root.findByProps({ testID: 'academy-tab-techniques' }).props.accessibilityState).toEqual({ selected: true });
    act(() => { setLang('ru'); });
    await act(async () => { tree.update(<Probe />); await flush(); });
    expect(tree.root.findByProps({ testID: 'academy-tab-techniques' }).props.accessibilityState).toEqual({ selected: true });
  });

  it.each(JEZYKI_SYSTEMOWE)('opcje nagłówka nawigacji: obiekt z pl zachowuje Sofię po przejściu na %s, nowy ma krój systemowy', (jezyk) => {
    setLang('pl');
    const stare = opcjeNaglowka(kolory.jasny, false);
    expect(StyleSheet.flatten(stare.headerTitleStyle).fontFamily).toBe(typografia.krojTytulow);
    setLang(jezyk);
    expect(StyleSheet.flatten(stare.headerTitleStyle).fontFamily).toBe(typografia.krojTytulow);
    const nowe = opcjeNaglowka(kolory.jasny, false);
    expect(StyleSheet.flatten(nowe.headerTitleStyle).fontFamily).toBeUndefined();
    expect(StyleSheet.flatten(nowe.headerLargeTitleStyle).fontFamily).toBeUndefined();
  });
});

/**
 * Krój tytułu po zmianie języka przy zamontowanym ekranie (L004-13-P2-ru/uk07, KO-067, D-419). Zrzuty #13: tytuł „Dziś”
 * w ru i uk w kroju Sofia (bułgarskie formy cyrylicy), mimo że `JEZYKI_CYRYLICY_BEZ_FORM_KROJU` go wyłącza. Ekran „Dziś”
 * montuje się przed `initLanguage()` (język z zapisu, asynchronicznie), więc pierwszy render ma krój z języka źródłowego.
 * `get fontFamily()` w `StyleSheet.create` liczy się leniwie: przy porównaniu starych i nowych właściwości
 * (starego i nowego `style`) obie strony dają już bieżący krój, różnicy nie ma i natywny widok zostaje przy Sofii.
 * Test: styl z poprzedniego renderu, spłaszczony PO zmianie języka, ma dalej krój z chwili renderu.
 */
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { PasZakladki } from '../../components/nawigacja/PasZakladki';
import { Karta } from '../karty/Karta';
import { setLang } from '../../lib/i18n';
import { typografia } from '../tokeny';

jest.mock('expo-router', () => ({ useFocusEffect: jest.fn() }));

afterEach(() => setLang('pl'));

const naglowek = (tree: renderer.ReactTestRenderer) =>
  tree.root.findAll((n) => typeof n.type === 'string' && n.props.accessibilityRole === 'header')[0]!;

describe('krój tytułu po zmianie języka bez ponownego montażu (D-419)', () => {
  const przypadki: Array<[string, () => React.ReactElement]> = [
    ['PasZakladki (tytuł pasa, ekran „Dziś”)', () => <PasZakladki gora={0} tytul="Co dziś robisz?" />],
    ['Karta (tytuł karty)', () => <Karta testID="k" tytul="Tytuł"><Text>x</Text></Karta>],
  ];

  it.each(przypadki)('%s: styl z renderu w pl zachowuje Sofię po przejściu na ru (natywny diff widzi zmianę)', (_n, el) => {
    setLang('pl');
    let tree!: renderer.ReactTestRenderer;
    act(() => { tree = renderer.create(el()); });
    const stareProps = naglowek(tree).props;
    expect(StyleSheet.flatten(stareProps.style).fontFamily).toBe(typografia.krojTytulow);
    act(() => { setLang('ru'); });
    act(() => { tree.update(el()); });
    // nowy render: krój systemowy (ru bez form kroju, kroj-tytulow.ts)
    expect(StyleSheet.flatten(naglowek(tree).props.style).fontFamily).toBeUndefined();
    // stary render spłaszczony teraz: ma zachować wartość z chwili renderu, inaczej różnica jest niewidoczna
    expect(StyleSheet.flatten(stareProps.style).fontFamily).toBe(typografia.krojTytulow);
  });
});

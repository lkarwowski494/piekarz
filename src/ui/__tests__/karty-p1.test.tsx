/**
 * [M3 p1] System kart (D-141, design-spec §14, docs/design/karty/README.md §1–§3): komponenty Karta, WierszKarty,
 * CzapkaPaska, PoleObjawu. Wygląd tylko z tokenów, cel dotyku ≥ 44 pt, role dostępności, a przy dużym tekście
 * (fontScale ≥ 2, ten sam próg co pas, kafle „Dziś” i kalendarz; AX3+) elementy obok tekstu przechodzą nad tekst
 * (reguła roli 04, zadanie 04-fix-AX5; w README §1 jeszcze jej nie ma, p1 wdraża według zdania z polecenia M3).
 * Komponenty nie mają własnych tekstów: etykiety dostają od ekranu.
 */
const mockOkno = { width: 390, height: 844, scale: 3, fontScale: 1 };
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockOkno }));

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Karta } from '../karty/Karta';
import { WierszKarty } from '../karty/WierszKarty';
import { CzapkaPaska } from '../karty/CzapkaPaska';
import { PoleObjawu } from '../karty/PoleObjawu';
import { theme } from '../theme';
import { cele, promienie, typografia } from '../tokeny';

const AX5 = 3.12;
const stos = (fs: number) => Object.assign(mockOkno, { fontScale: fs });
const hosty = (root: renderer.ReactTestInstance) => root.findAll((n) => typeof n.type === 'string');
const host = (root: renderer.ReactTestInstance, id: string) => {
  const w = hosty(root).filter((n) => n.props.testID === id);
  if (w.length !== 1) throw new Error(`testID ${id}: ${w.length} elementów`);
  return w[0]!;
};
/** Węzeł kompozytowy przycisku (Pressable jest w jest-expo podmieniony): po testID, roli i funkcji onPress, jak w pas-zakladek-d10. */
const przyciski = (root: renderer.ReactTestInstance, id?: string) =>
  root.findAll((n) => typeof n.type !== 'string' && typeof n.props.onPress === 'function' && typeof n.props.accessibilityRole === 'string' && (id === undefined || n.props.testID === id));
const styl = (n: renderer.ReactTestInstance) => StyleSheet.flatten(n.props.style) ?? {};
const kolejnosc = (root: renderer.ReactTestInstance) => hosty(root).map((n) => n.props.testID).filter((x): x is string => typeof x === 'string');
function render(el: React.ReactElement) {
  let tree!: renderer.ReactTestRenderer;
  act(() => { tree = renderer.create(el); });
  return tree;
}

beforeEach(() => stos(1));

describe('[M3 p1] Karta', () => {
  const karta = () => (
    <Karta testID="k" tytul="Ile pieczesz" ikona={<View testID="k-ik" />} znacznik={<View testID="k-pro" />}>
      <Text>treść</Text>
    </Karta>
  );

  it('wygląd z tokenów: tło powierzchnia, obwódka 1 kartaLinia, promień karta 16, wypełnienie 16', () => {
    const s = styl(host(render(karta()).root, 'k'));
    expect(s).toMatchObject({
      backgroundColor: theme.colors.powierzchnia,
      borderWidth: 1,
      borderColor: theme.colors.kartaLinia,
      borderRadius: promienie.karta,
      padding: 16,
    });
  });

  it('przy dużym tekście wypełnienie 12 (README §2)', () => {
    stos(AX5);
    expect(styl(host(render(karta()).root, 'k')).padding).toBe(12);
  });

  it('bezWypelnienia: wiersze same niosą odstępy (padding 0, bez luki)', () => {
    const s = styl(host(render(<Karta testID="k" tytul="T" bezWypelnienia><Text>x</Text></Karta>).root, 'k'));
    expect(s.padding).toBe(0);
  });

  it('tytuł: nagłówek dla czytnika, krój tytułów 20 pt (tytul2 − 2), waga 700, kolor tusz', () => {
    const t = host(render(karta()).root, 'k-tytul');
    expect(t.props.accessibilityRole).toBe('header');
    expect(styl(t)).toMatchObject({ fontSize: typografia.style.tytul2.pt - 2, fontWeight: '700', color: theme.colors.tusz });
    expect(styl(t).fontFamily).toBe(theme.typography.krojTytulow);
    expect(t.props.numberOfLines).toBeUndefined();
  });

  it('ikona 24 pt jest dekoracją (ukryta przed czytnikiem), znacznik po prawej w tym samym rzędzie', () => {
    const tree = render(karta());
    const ik = host(tree.root, 'k-ikona');
    expect(styl(ik)).toMatchObject({ width: 24, height: 24 });
    expect(ik.props.importantForAccessibility).toBe('no-hide-descendants');
    expect(styl(host(tree.root, 'k-naglowek')).flexDirection).toBe('row');
    expect(kolejnosc(tree.root)).toEqual(expect.arrayContaining(['k-ikona', 'k-tytul', 'k-pro']));
    const k = kolejnosc(tree.root);
    expect(k.indexOf('k-ikona')).toBeLessThan(k.indexOf('k-tytul'));
    expect(k.indexOf('k-tytul')).toBeLessThan(k.indexOf('k-pro'));
  });

  it('AX5: ikona i znacznik nad tytułem, nagłówek w stosie pionowym, tytuł bez limitu linii', () => {
    stos(AX5);
    const tree = render(karta());
    expect(styl(host(tree.root, 'k-naglowek')).flexDirection).toBe('column');
    const k = kolejnosc(tree.root);
    expect(k.indexOf('k-ikona')).toBeLessThan(k.indexOf('k-tytul'));
    expect(k.indexOf('k-pro')).toBeLessThan(k.indexOf('k-tytul'));
    expect(host(tree.root, 'k-tytul').props.numberOfLines).toBeUndefined();
  });

  it('bez ikony i znacznika: sam tytuł, treść w karcie', () => {
    const tree = render(<Karta testID="k" tytul="Do miski"><Text testID="k-dziecko">x</Text></Karta>);
    const k = kolejnosc(tree.root);
    expect(k).toEqual(expect.arrayContaining(['k', 'k-tytul', 'k-dziecko']));
    expect(k).not.toContain('k-ikona');
    expect(k).not.toContain('k-znacznik');
  });
});

describe('[M3 p1] WierszKarty', () => {
  const wiersz = (extra: Partial<React.ComponentProps<typeof WierszKarty>> = {}) => (
    <WierszKarty testID="w" etykieta="Mąka" wartosc="850 g" {...extra} />
  );

  it('min 52 pt, odstępy 10/16, linia między wierszami (linia) 1 px', () => {
    const s = styl(host(render(wiersz()).root, 'w'));
    expect(s).toMatchObject({ minHeight: 52, paddingVertical: 10, paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: theme.colors.linia });
    expect(s.minHeight).toBeGreaterThanOrEqual(cele.pozostale);
  });

  it('pierwszy wiersz bez linii nad sobą', () => {
    expect(styl(host(render(wiersz({ linia: false })).root, 'w')).borderTopWidth).toBe(0);
  });

  it('wartość: 17 pt, waga 600, cyfry tabelaryczne, kolor tusz2, bez limitu linii', () => {
    const v = host(render(wiersz()).root, 'w-wartosc');
    expect(styl(v)).toMatchObject({ fontSize: typografia.style.naglowek.pt, fontWeight: '600', color: theme.colors.tusz2 });
    expect(styl(v).fontVariant).toEqual(['tabular-nums']);
    expect(v.props.numberOfLines).toBeUndefined();
  });

  it('bez onPress: zwykły wiersz, nie przycisk', () => {
    const tree = render(wiersz());
    expect(przyciski(tree.root)).toHaveLength(0);
  });

  it('z onPress: przycisk z etykietą „etykieta, wartość”, wywołuje onPress, cel ≥ 44 pt (styl, bez pomiaru)', () => {
    const onPress = jest.fn();
    const tree = render(wiersz({ onPress }));
    const p = przyciski(tree.root, 'w')[0]!;
    expect(p.props.accessibilityRole).toBe('button');
    expect(p.props.accessibilityLabel).toBe('Mąka, 850 g');
    act(() => p.props.onPress());
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(styl(host(tree.root, 'w')).minHeight).toBeGreaterThanOrEqual(cele.pozostale);
  });

  it('ikona wiersza i podpis: ikona dekoracyjna, podpis pod etykietą', () => {
    const tree = render(wiersz({ ikona: <View testID="w-ik" />, podpis: 'Odhaczaj przy ważeniu.' }));
    expect(host(tree.root, 'w-ikona').props.importantForAccessibility).toBe('no-hide-descendants');
    const k = kolejnosc(tree.root);
    expect(k.indexOf('w-etykieta')).toBeLessThan(k.indexOf('w-podpis'));
  });

  it('zwykły tekst: etykieta i wartość w jednym rzędzie, wartość po prawej', () => {
    const tree = render(wiersz());
    expect(styl(host(tree.root, 'w')).flexDirection).toBe('row');
    const k = kolejnosc(tree.root);
    expect(k.indexOf('w-etykieta')).toBeLessThan(k.indexOf('w-wartosc'));
  });

  it('AX5: stos pionowy, ikona nad etykietą, wartość pod etykietą (nic obok tekstu), wartość 17 pt', () => {
    stos(AX5);
    const tree = render(wiersz({ ikona: <View testID="w-ik" />, onPress: jest.fn() }));
    expect(styl(host(tree.root, 'w')).flexDirection).toBe('column');
    const k = kolejnosc(tree.root);
    expect(k.indexOf('w-ikona')).toBeLessThan(k.indexOf('w-etykieta'));
    expect(k.indexOf('w-etykieta')).toBeLessThan(k.indexOf('w-wartosc'));
    expect(styl(host(tree.root, 'w-wartosc')).fontSize).toBe(typografia.style.naglowek.pt);
    expect(styl(host(tree.root, 'w')).paddingHorizontal).toBe(12); // mniejsze wcięcia (D-142)
    expect(host(tree.root, 'w-etykieta').props.numberOfLines).toBeUndefined();
  });
});

describe('[M3 p1] CzapkaPaska', () => {
  it('przypięta u góry na wysokość paska stanu, kolor pasa, nie przechwytuje dotyku', () => {
    const c = host(render(<CzapkaPaska testID="c" gora={47} />).root, 'c');
    expect(styl(c)).toMatchObject({ position: 'absolute', top: 0, left: 0, right: 0, height: 47, backgroundColor: theme.colors.pas });
    expect(c.props.pointerEvents).toBe('none');
  });

  it('bez pokazTytul: brak tekstu', () => {
    const tree = render(<CzapkaPaska testID="c" gora={47} tytul="Zakwasy" />);
    expect(tree.root.findAllByType(Text)).toHaveLength(0);
  });

  it('z pokazTytul: mały tytuł 17 pt / 600 na pasie, wyśrodkowany, ukryty przed czytnikiem (nagłówek jest na pasie)', () => {
    const tree = render(<CzapkaPaska testID="c" gora={47} tytul="Zakwasy" pokazTytul />);
    const t = host(tree.root, 'c-tytul');
    expect(styl(t)).toMatchObject({ fontSize: 17, fontWeight: '600', color: theme.colors.naPasie, textAlign: 'center' });
    expect(t.props.accessibilityElementsHidden).toBe(true);
    expect(t.props.importantForAccessibility).toBe('no-hide-descendants');
    expect(styl(host(tree.root, 'c')).height).toBeUndefined();
  });

  it('AX5: tytuł czapki bez limitu powiększenia i linii (README §7a, D-142: bez maxFontSizeMultiplier w kartach)', () => {
    stos(AX5);
    const t = host(render(<CzapkaPaska testID="c" gora={20} tytul="Zakwasy" pokazTytul />).root, 'c-tytul');
    expect(t.props.maxFontSizeMultiplier).toBeUndefined();
    expect(t.props.numberOfLines).toBeUndefined();
  });
});

describe('[M3 p1] PoleObjawu', () => {
  const pole = (zaznaczone: boolean, onZmien = jest.fn()) => (
    <PoleObjawu testID="p" etykieta="Zapach octu" zaznaczone={zaznaczone} onZmien={onZmien} />
  );

  it('rola checkbox, stan checked, etykieta z tekstu, dotyk przełącza na przeciwną wartość', () => {
    const onZmien = jest.fn();
    const tree = render(pole(false, onZmien));
    const p = przyciski(tree.root, 'p')[0]!;
    expect(p.props.accessibilityRole).toBe('checkbox');
    expect(p.props.accessibilityState).toEqual({ checked: false });
    expect(p.props.accessibilityLabel).toBe('Zapach octu');
    act(() => p.props.onPress());
    expect(onZmien).toHaveBeenCalledWith(true);
  });

  it('zaznaczone: stan checked true, dotyk zwraca false', () => {
    const onZmien = jest.fn();
    const tree = render(pole(true, onZmien));
    const p = przyciski(tree.root, 'p')[0]!;
    expect(p.props.accessibilityState).toEqual({ checked: true });
    act(() => p.props.onPress());
    expect(onZmien).toHaveBeenCalledWith(false);
  });

  it('wiersz: obwódka 1,5 obwodka, promień pole 10, min 52 pt (≥ 44) (styl, bez pomiaru)', () => {
    const s = styl(host(render(pole(false)).root, 'p'));
    expect(s).toMatchObject({ borderWidth: 1.5, borderColor: theme.colors.obwodka, borderRadius: promienie.pole, minHeight: 52 });
    expect(s.minHeight).toBeGreaterThanOrEqual(cele.pozostale);
  });

  it('kwadrat 28×28, promień znacznik 6, obwódka 2 obwodka; zaznaczony wypełniony akcentem ze znakiem', () => {
    const pusty = render(pole(false));
    expect(styl(host(pusty.root, 'p-kwadrat'))).toMatchObject({ width: 28, height: 28, borderRadius: promienie.znacznik, borderWidth: 2, borderColor: theme.colors.obwodka });
    expect(kolejnosc(pusty.root)).not.toContain('p-znak');
    const pelny = render(pole(true));
    expect(styl(host(pelny.root, 'p-kwadrat'))).toMatchObject({ backgroundColor: theme.colors.akcent, borderColor: theme.colors.akcent });
    expect(kolejnosc(pelny.root)).toContain('p-znak');
  });

  it('AX5 (D-142): pole wyboru nad etykietą w jednej kolumnie, etykieta bez limitu linii, kwadrat nie kurczy się', () => {
    stos(AX5);
    const tree = render(pole(true));
    expect(styl(host(tree.root, 'p')).flexDirection).toBe('column');
    const k = kolejnosc(tree.root);
    expect(k.indexOf('p-kwadrat')).toBeLessThan(k.indexOf('p-etykieta'));
    expect(host(tree.root, 'p-etykieta').props.numberOfLines).toBeUndefined();
    expect(styl(host(tree.root, 'p-kwadrat'))).toMatchObject({ width: 28, height: 28, flexShrink: 0 });
  });
});

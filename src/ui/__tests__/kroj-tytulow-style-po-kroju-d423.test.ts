/** `stylePoKroju` (D-423): arkusz osobny na krój tytułów, wartości statyczne, bez ponownej budowy przy tym samym kroju. */
import { StyleSheet } from 'react-native';
import { stylePoKroju } from '../kroj-tytulow';
import { theme } from '../theme';
import { typografia } from '../tokeny';
import { setLang } from '../../lib/i18n';

afterEach(() => setLang('pl'));

const zrob = () => {
  const fabryka = jest.fn(() => StyleSheet.create({ tytul: { fontFamily: theme.typography.krojTytulow, fontWeight: '700' }, tresc: { fontSize: 16 } }));
  return { fabryka, styles: stylePoKroju(fabryka) };
};

describe('stylePoKroju', () => {
  it('nic nie buduje przy ładowaniu modułu; arkusz powstaje przy pierwszym odczycie', () => {
    const { fabryka, styles } = zrob();
    expect(fabryka).not.toHaveBeenCalled();
    expect(styles.tresc.fontSize).toBe(16);
    expect(fabryka).toHaveBeenCalledTimes(1);
  });

  it('ten sam krój: ten sam obiekt stylu i jedna budowa (pl, en, de)', () => {
    const { fabryka, styles } = zrob();
    const a = styles.tytul;
    setLang('en');
    expect(styles.tytul).toBe(a);
    setLang('de');
    expect(styles.tytul).toBe(a);
    expect(fabryka).toHaveBeenCalledTimes(1);
  });

  it('inny krój: inny obiekt; stary zachowuje wartość, powrót do pl daje pierwotny obiekt', () => {
    const { fabryka, styles } = zrob();
    const pl = styles.tytul;
    setLang('ru');
    const ru = styles.tytul;
    expect(ru).not.toBe(pl);
    expect(ru.fontFamily).toBeUndefined();
    expect(pl.fontFamily).toBe(typografia.krojTytulow);
    setLang('pl');
    expect(styles.tytul).toBe(pl);
    expect(fabryka).toHaveBeenCalledTimes(2);
  });

  it('języki bez kroju tytułów dzielą jeden arkusz (vi, ja, ko, zh-Hant, ru, uk)', () => {
    const { fabryka, styles } = zrob();
    const widziane = new Set<object>();
    for (const l of ['vi', 'ja', 'ko', 'zh-Hant', 'ru', 'uk'] as const) {
      setLang(l);
      widziane.add(styles.tytul);
    }
    expect(widziane.size).toBe(1);
    expect(fabryka).toHaveBeenCalledTimes(1);
  });

  it('Object.keys, `in` i StyleSheet.flatten działają na arkuszu', () => {
    const { styles } = zrob();
    expect(Object.keys(styles)).toEqual(['tytul', 'tresc']);
    expect('tytul' in styles).toBe(true);
    expect(StyleSheet.flatten([styles.tytul, styles.tresc])).toMatchObject({ fontWeight: '700', fontSize: 16 });
  });
});

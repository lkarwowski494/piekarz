/**
 * M3 p6b (D-209, P2 z D-202): wybór rodzaju drożdży zrobiony przed końcem pierwszego odczytu `rodzaj_drozdzy`
 * nie może zostać nadpisany starą wartością z bazy (ekran ≠ baza). Zapis bez zmian: setAppSetting przez guardSave.
 */
const mockUstawienia = new Map<string, string>();
const mockOdczyt: { czeka: Array<() => void> } = { czeka: [] };
jest.mock('../../data/sqlite-store', () => ({
  // Odczyt czeka na zwolnienie z testu; zwraca to, co baza miała w chwili zapytania (jak SELECT przed zapisem)
  getAppSetting: jest.fn((k: string) => {
    const stara = mockUstawienia.get(k);
    return new Promise<string | undefined>((res) => mockOdczyt.czeka.push(() => res(stara)));
  }),
  setAppSetting: jest.fn(async (k: string, v: string) => {
    mockUstawienia.set(k, v);
  }),
}));

import React from 'react';
import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import {
  KLUCZ_RODZAJU_DROZDZY, _resetRodzajDrozdzy, biezacyRodzajDrozdzy, rodzajDrozdzy, useRodzajDrozdzy, zapiszRodzajDrozdzy,
} from '../rodzaj-drozdzy';
import { setAppSetting } from '../../data/sqlite-store';

const zwolnijOdczyty = async () => {
  await act(async () => {
    mockOdczyt.czeka.splice(0).forEach((f) => f());
  });
};

function Pokaz() {
  return <Text testID="rodzaj">{useRodzajDrozdzy()}</Text>;
}

describe('M3 p6b: wyścig pierwszego odczytu rodzaju drożdży (rodzaj-drozdzy.ts:26)', () => {
  beforeEach(() => {
    mockUstawienia.clear();
    mockOdczyt.czeka = [];
    _resetRodzajDrozdzy();
    jest.mocked(setAppSetting).mockClear();
  });

  it('wybór „suche” w trakcie pierwszego odczytu (baza: brak wpisu) zostaje po odczycie', async () => {
    const odczyt = rodzajDrozdzy();
    await zapiszRodzajDrozdzy('suche');
    await zwolnijOdczyty();
    await expect(odczyt).resolves.toBe('suche');
    expect(biezacyRodzajDrozdzy()).toBe('suche');
    expect(await rodzajDrozdzy()).toBe('suche');
    expect(mockUstawienia.get(KLUCZ_RODZAJU_DROZDZY)).toBe('suche');
  });

  it('wybór „świeże” w trakcie odczytu, gdy baza miała „suche”: ekran i baza zgodne (świeże)', async () => {
    mockUstawienia.set(KLUCZ_RODZAJU_DROZDZY, 'suche');
    const odczyt = rodzajDrozdzy();
    await zapiszRodzajDrozdzy('swieze');
    await zwolnijOdczyty();
    await expect(odczyt).resolves.toBe('swieze');
    expect(biezacyRodzajDrozdzy()).toBe('swieze');
    expect(mockUstawienia.get(KLUCZ_RODZAJU_DROZDZY)).toBe('swieze');
  });

  it('ekran: stuknięcie przed końcem pierwszego odczytu nie cofa wyboru na ekranie', async () => {
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<Pokaz />);
    });
    const naEkranie = () => tree.root.findByProps({ testID: 'rodzaj' }).props.children;
    expect(naEkranie()).toBe('swieze');
    await act(async () => {
      await zapiszRodzajDrozdzy('suche');
    });
    expect(naEkranie()).toBe('suche');
    await zwolnijOdczyty();
    expect(naEkranie()).toBe('suche');
    expect(mockUstawienia.get(KLUCZ_RODZAJU_DROZDZY)).toBe('suche');
    act(() => tree.unmount());
  });

  it('bez wyboru w trakcie odczytu: wartość z bazy jak dotąd (suche), zapis nie jest wołany', async () => {
    mockUstawienia.set(KLUCZ_RODZAJU_DROZDZY, 'suche');
    const odczyt = rodzajDrozdzy();
    await zwolnijOdczyty();
    await expect(odczyt).resolves.toBe('suche');
    expect(biezacyRodzajDrozdzy()).toBe('suche');
    expect(setAppSetting).not.toHaveBeenCalled();
  });
});

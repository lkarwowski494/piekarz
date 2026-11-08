/**
 * Z-08-1 (FOR-15, D-291): Ustawienia → „Licencje open source”. Wiersz obok „Polityki prywatności” (cel ≥ 44 pt), podekran
 * w tym samym arkuszu (jak „Źródła wiedzy”, D-117), lista pakietów produkcyjnych z licencją; dotknięcie pokazuje notkę,
 * treść licencji i NOTICE; osobne sekcje: biblioteki natywne spoza npm i czcionka Sofia Sans (OFL-1.1). Nazwy pakietów
 * i treść licencji w oryginale (prawnym), tłumaczone tylko etykiety.
 */
import React from 'react';
import { StyleSheet, Text, FlatList } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { SettingsModal } from '../SettingsModal';
import { WierszLicencji } from '../settings/LicencjeEkran';
import { setLang, t } from '../../lib/i18n';
import { EN } from '../../lib/i18n.en';
import { wczytajLicencje } from '../../lib/licencje';
import surowe from '../../../assets/licencje.generated.json';

jest.mock('../../lib/backup', () => ({
  exportBackup: jest.fn().mockResolvedValue(true),
  safetyBackup: jest.fn().mockResolvedValue(true),
  parseAndValidateBackup: jest.fn(),
  rescueAfterOpenFailure: jest.fn().mockResolvedValue(null),
}));

jest.mock('../../data/sqlite-store', () => ({
  getBakeLogs: jest.fn().mockResolvedValue([]),
  getStarters: jest.fn().mockResolvedValue([]),
  getRecipes: jest.fn().mockResolvedValue([]),
  getFlourInventory: jest.fn().mockResolvedValue([]),
  collectBackupData: jest.fn().mockResolvedValue({ bakes: [], starters: [], customRecipes: [], starterEntries: [], flourInventory: [] }),
  restoreFromBackupData: jest.fn().mockResolvedValue(undefined),
  getAppSetting: jest.fn().mockResolvedValue(null),
  setAppSetting: jest.fn().mockResolvedValue(undefined),
  getBakerRitualProfile: jest.fn().mockResolvedValue('artisan_hybrid'),
  setBakerRitualProfile: jest.fn().mockResolvedValue(undefined),
  getBakingVessel: jest.fn().mockResolvedValue('dutch_oven'),
  setBakingVessel: jest.fn().mockResolvedValue(undefined),
}));

const wynik = wczytajLicencje(surowe);
if (!wynik.ok) throw new Error(wynik.blad);
const dane = wynik.wartosc;

const tekstWezla = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(tekstWezla).join('');
  return '';
};
const teksty = (root: renderer.ReactTestInstance) => root.findAll((n) => (n.type as unknown) === 'Text').map((n) => tekstWezla(n.props.children));
const klucz = (nazwa: string, wersja: string) => `licencja-${nazwa}@${wersja}`;

async function otworz() {
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(<SettingsModal visible={true} onClose={() => undefined} />);
  });
  const root = tree!.root;
  return { tree: tree!, root, wejscie: root.findByProps({ testID: 'settings-licencje-btn' }) };
}

describe('Ustawienia → Licencje open source (Z-08-1, FOR-15)', () => {
  afterEach(() => act(() => setLang('pl')));

  it('wiersz w karcie „Kontakt” obok „Polityki prywatności”: przycisk z etykietą i celem ≥ 44 pt', async () => {
    act(() => setLang('pl'));
    const { tree, root, wejscie } = await otworz();
    expect(wejscie.props.accessibilityRole).toBe('button');
    expect(wejscie.props.accessibilityLabel).toBe('Licencje open source');
    expect(StyleSheet.flatten(wejscie.props.style).minHeight).toBeGreaterThanOrEqual(44);
    expect(teksty(wejscie)).toEqual(['Licencje open source']);
    const karta = root.findByProps({ testID: 'karta-kontakt' });
    expect(karta.findAllByProps({ testID: 'settings-licencje-btn' }).length).toBeGreaterThan(0);
    expect(karta.findAllByProps({ testID: 'settings-privacy-link' }).length).toBeGreaterThan(0);
    act(() => tree.unmount());
  });

  it('ekran: nagłówek, sekcje (czcionki, biblioteki natywne, pakiety) z licznikami z danych, MIT i OFL-1.1 widoczne', async () => {
    act(() => setLang('pl'));
    const { tree, root, wejscie } = await otworz();
    await act(async () => wejscie.props.onPress());
    const t1 = teksty(root);
    expect(t1).toContain('Licencje open source');
    expect(t1).toContain('Aplikacja korzysta z bibliotek open source. Dotknij pozycji, by zobaczyć notkę o prawach autorskich i pełną treść licencji. Nazwy pakietów i treść licencji są w oryginale.');
    expect(t1).toContain(`Biblioteki natywne iOS spoza npm (${dane.natywne.length})`);
    expect(t1).toContain(`Czcionki (${dane.czcionki.length})`);
    expect(t1).toContain(`Pakiety npm (${dane.pakiety.length})`);
    const naglowki = root.findAll((n) => (n.type as unknown) === 'Text' && n.props.accessibilityRole === 'header').map((n) => tekstWezla(n.props.children));
    expect(naglowki).toEqual(expect.arrayContaining([`Biblioteki natywne iOS spoza npm (${dane.natywne.length})`, `Czcionki (${dane.czcionki.length})`, `Pakiety npm (${dane.pakiety.length})`]));
    // pakiety npm z licencją MIT (nazwa, wersja, licencja) i czcionka na OFL-1.1
    const mit = dane.pakiety.find((p) => p.licencja === 'MIT');
    expect(mit).toBeDefined();
    expect(root.findAllByProps({ testID: klucz(mit!.nazwa, mit!.wersja) }).length).toBeGreaterThan(0);
    expect(t1).toContain(`${mit!.nazwa} ${mit!.wersja}`);
    expect(t1.some((x) => x.startsWith('MIT'))).toBe(true);
    expect(t1).toContain('Sofia Sans Semi Condensed 4.101');
    expect(t1.some((x) => x.startsWith('OFL-1.1'))).toBe(true);
    for (const n of dane.natywne) expect(t1).toContain(`${n.nazwa} ${n.wersja}`);
    // lightningcss (narzędzie budowania) nie pojawia się na ekranie
    expect(t1.join('\n')).not.toMatch(/lightningcss/i);
    // Ustawienia ukryte, dopóki ekran licencji jest otwarty
    expect(root.findAllByProps({ testID: 'settings-licencje-btn' })).toHaveLength(0);
    act(() => tree.unmount());
  });

  it('dotknięcie pakietu MIT pokazuje notkę i pełną treść licencji, ponowne dotknięcie zwija', async () => {
    act(() => setLang('pl'));
    const { tree, root, wejscie } = await otworz();
    await act(async () => wejscie.props.onPress());
    const mit = dane.pakiety.find((p) => p.licencja === 'MIT')!;
    const wiersz = () => root.findAll((n) => n.props.testID === klucz(mit.nazwa, mit.wersja) && typeof n.props.onPress === 'function')[0];
    expect(wiersz().props.accessibilityState).toMatchObject({ expanded: false });
    expect(teksty(root).join('\n')).not.toContain('Permission is hereby granted, free of charge');
    await act(async () => wiersz().props.onPress());
    expect(wiersz().props.accessibilityState).toMatchObject({ expanded: true });
    const rozwiniete = teksty(root).join('\n');
    expect(rozwiniete).toContain('Permission is hereby granted, free of charge');
    for (const n of mit.notki) expect(rozwiniete).toContain(n);
    await act(async () => wiersz().props.onPress());
    expect(teksty(root).join('\n')).not.toContain('Permission is hereby granted, free of charge');
    act(() => tree.unmount());
  });

  it('czcionka: dotknięcie pokazuje notkę Sofia Sans Project Authors i treść SIL Open Font License 1.1', async () => {
    act(() => setLang('pl'));
    const { tree, root, wejscie } = await otworz();
    await act(async () => wejscie.props.onPress());
    const f = dane.czcionki[0];
    const wiersz = root.findAll((n) => n.props.testID === klucz(f.nazwa, f.wersja) && typeof n.props.onPress === 'function')[0];
    await act(async () => wiersz.props.onPress());
    const s = teksty(root).join('\n');
    expect(s).toContain('Sofia Sans Project Authors');
    expect(s).toContain('SIL OPEN FONT LICENSE Version 1.1');
    act(() => tree.unmount());
  });

  it('biblioteka natywna (folly): dotknięcie pokazuje Apache-2.0 z notką Meta', async () => {
    act(() => setLang('pl'));
    const { tree, root, wejscie } = await otworz();
    await act(async () => wejscie.props.onPress());
    const folly = dane.natywne.find((n) => n.nazwa === 'folly')!;
    const wiersz = root.findAll((n) => n.props.testID === klucz(folly.nazwa, folly.wersja) && typeof n.props.onPress === 'function')[0];
    await act(async () => wiersz.props.onPress());
    const s = teksty(root).join('\n');
    expect(s).toContain('Copyright (c) Meta Platforms, Inc. and affiliates.');
    expect(s).toContain('Apache License');
    act(() => tree.unmount());
  });

  it('NOTICE: wiersz pakietu z plikiem NOTICE pokazuje go po rozwinięciu, bez NOTICE nie ma etykiety', () => {
    const zNotice = dane.pakiety.find((p) => p.notice)!;
    expect(zNotice).toBeDefined();
    const bez = dane.pakiety.find((p) => !p.notice && p.licencja === 'MIT')!;
    let tree: renderer.ReactTestRenderer | null = null;
    act(() => { tree = renderer.create(<WierszLicencji wpis={zNotice} teksty={dane.teksty} otwarty onPrzelacz={() => undefined} />); });
    const s = teksty(tree!.root);
    expect(s).toContain('NOTICE');
    expect(s.join('\n')).toContain(zNotice.notice!.split('\n')[0]);
    act(() => tree!.unmount());
    act(() => { tree = renderer.create(<WierszLicencji wpis={bez} teksty={dane.teksty} otwarty onPrzelacz={() => undefined} />); });
    expect(teksty(tree!.root)).not.toContain('NOTICE');
    act(() => tree!.unmount());
  });

  it('wyrażenie z alternatywą (np. „(MIT OR CC0-1.0)”) pokazuje treść każdej licencji, która ją ma (alternatywa bez treści w pakiecie jest pomijana)', () => {
    const alt = dane.pakiety.find((p) => /\bOR\b/.test(p.licencja) && p.licencja.split(/[\s()]+/).some((x) => dane.bezTresci.includes(x)))!;
    expect(alt).toBeDefined();
    let tree: renderer.ReactTestRenderer | null = null;
    act(() => { tree = renderer.create(<WierszLicencji wpis={alt} teksty={dane.teksty} otwarty onPrzelacz={() => undefined} />); });
    const s = teksty(tree!.root).join('\n');
    const mamy = alt.licencja.split(/[\s()]+/).filter((x) => dane.teksty[x]);
    expect(mamy.length).toBeGreaterThan(0);
    for (const id of mamy) expect(s).toContain(dane.teksty[id].tekst.slice(0, 40));
    act(() => tree!.unmount());
  });

  it('lista: FlatList z keyboardShouldPersistTaps="handled" i unikalnymi kluczami', async () => {
    act(() => setLang('pl'));
    const { tree, root, wejscie } = await otworz();
    await act(async () => wejscie.props.onPress());
    const lista = root.findByType(FlatList);
    expect(lista.props.keyboardShouldPersistTaps).toBe('handled');
    expect(lista.props.testID).toBe('licencje-lista');
    const klucze = (lista.props.data as { nazwa: string; wersja: string }[]).map((p, i) => lista.props.keyExtractor(p, i));
    expect(new Set(klucze).size).toBe(klucze.length);
    act(() => tree.unmount());
  });

  it('powrót: „Ustawienia” w nagłówku (≥ 44 pt) wraca do listy ustawień; Źródła wiedzy nadal działają', async () => {
    act(() => setLang('pl'));
    const { tree, root, wejscie } = await otworz();
    await act(async () => wejscie.props.onPress());
    const wstecz = root.findAll((n) => n.props.testID === 'licencje-wstecz' && n.props.accessibilityRole === 'button')[0];
    expect(wstecz.props.accessibilityLabel).toBe('Wróć do ustawień');
    expect(StyleSheet.flatten(wstecz.props.style).minHeight).toBeGreaterThanOrEqual(44);
    await act(async () => wstecz.props.onPress());
    expect(root.findAllByProps({ testID: 'settings-licencje-btn' }).length).toBeGreaterThan(0);
    expect(root.findAllByProps({ testID: 'licencje-lista' })).toHaveLength(0);
    await act(async () => root.findByProps({ testID: 'settings-zrodla-btn' }).props.onPress());
    expect(root.findAllByProps({ testID: 'zrodla-wstecz' }).length).toBeGreaterThan(0);
    act(() => tree.unmount());
  });

  it('EN: etykiety przetłumaczone, nazwy pakietów i treść licencji bez zmian', async () => {
    for (const k of ['Licencje open source', 'Biblioteki natywne iOS spoza npm ({n})', 'Pakiety npm ({n})', 'Czcionki ({n})']) {
      expect({ k, en: typeof EN[k] }).toEqual({ k, en: 'string' });
    }
    act(() => setLang('en'));
    const { tree, root, wejscie } = await otworz();
    expect(wejscie.props.accessibilityLabel).toBe('Open source licenses');
    await act(async () => wejscie.props.onPress());
    const t1 = teksty(root);
    expect(t1).toContain('Open source licenses');
    expect(t1).toContain(t('Pakiety npm ({n})', { n: dane.pakiety.length }));
    expect(t1.some((x) => /^Packages|^npm packages/.test(x))).toBe(true);
    const mit = dane.pakiety.find((p) => p.licencja === 'MIT')!;
    expect(t1).toContain(`${mit.nazwa} ${mit.wersja}`);
    act(() => tree.unmount());
  });

  it('licznik tekstu: ekran nie używa elementów Text bez treści z danych (brak „undefined”)', async () => {
    act(() => setLang('pl'));
    const { tree, root, wejscie } = await otworz();
    await act(async () => wejscie.props.onPress());
    expect(root.findAllByType(Text).map((n) => tekstWezla(n.props.children)).filter((x) => /undefined|\[object/.test(x))).toEqual([]);
    act(() => tree.unmount());
  });
});

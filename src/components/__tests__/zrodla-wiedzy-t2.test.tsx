/**
 * M3 T2 (D-123): Ustawienia → „Źródła wiedzy” — jeden ekran z nazwami źródeł zamiast przypisów przy poradach.
 * Wejście z Ustawień (cel ≥ 44 pt), nagłówki grup jako nagłówki VoiceOver, każde źródło z nazwą, opisem i adresem
 * jako zwykłym tekstem (bez odnośnika i bez sieci), powrót do Ustawień, tekst EN po zmianie języka.
 */
import React from 'react';
import { Linking, StyleSheet } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { SettingsModal } from '../SettingsModal';
import { setLang, t } from '../../lib/i18n';
import { EN } from '../../lib/i18n.en';
import { ZRODLA_WIEDZY, ZRODLA_WIEDZY_WSTEP, kluczeZrodelWiedzy } from '../../core/zrodla-wiedzy';

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

const tekstWezla = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(tekstWezla).join('');
  return '';
};

async function otworz() {
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(<SettingsModal visible={true} onClose={() => undefined} />);
  });
  const root = tree!.root;
  const wejscie = root.findByProps({ testID: 'settings-zrodla-btn' });
  return { tree: tree!, root, wejscie };
}

const teksty = (root: renderer.ReactTestInstance) =>
  root.findAll((n) => (n.type as unknown) === 'Text').map((n) => tekstWezla(n.props.children));

describe('Ustawienia → Źródła wiedzy (T2, D-123)', () => {
  afterEach(() => act(() => setLang('pl')));

  it('wejście w Ustawieniach: przycisk z etykietą i celem ≥ 44 pt', async () => {
    act(() => setLang('pl'));
    const { tree, root, wejscie } = await otworz();
    expect(teksty(root)).toEqual(expect.arrayContaining(['Źródła wiedzy', 'Skąd pochodzą porady, liczby i ostrzeżenia w aplikacji.', 'Zobacz źródła']));
    expect(wejscie.props.accessibilityRole).toBe('button');
    expect(wejscie.props.accessibilityLabel).toBe('Zobacz źródła');
    expect(StyleSheet.flatten(wejscie.props.style).minHeight).toBeGreaterThanOrEqual(44);
    act(() => tree.unmount());
  });

  it('ekran: wstęp, 6 grup z nagłówkami VoiceOver i 26 źródeł z nazwą, opisem i adresem jako tekstem', async () => {
    act(() => setLang('pl'));
    const openURL = jest.spyOn(Linking, 'openURL');
    const { tree, root, wejscie } = await otworz();
    await act(async () => wejscie.props.onPress());
    const t1 = teksty(root);
    expect(t1).toContain('Źródła wiedzy');
    expect(t1).toContain(ZRODLA_WIEDZY_WSTEP);
    const naglowki = root.findAll((n) => (n.type as unknown) === 'Text' && n.props.accessibilityRole === 'header').map((n) => tekstWezla(n.props.children));
    expect(naglowki).toEqual(ZRODLA_WIEDZY.map((g) => g.temat));
    const zrodla = ZRODLA_WIEDZY.flatMap((g) => g.zrodla);
    expect(zrodla).toHaveLength(26);
    for (const z of zrodla) {
      expect(t1).toContain(z.nazwa);
      expect(t1).toContain(z.opis);
      expect(t1).toContain(z.adres);
    }
    // Adres to zwykły tekst: na ekranie nie ma odnośników ani przycisków poza powrotem
    const przyciski = root.findAll((n) => typeof n.props.onPress === 'function' && typeof n.type !== 'string' && n.props.accessibilityRole !== undefined);
    expect(przyciski.map((n) => n.props.testID)).toEqual(['zrodla-wstecz']);
    expect(root.findAll((n) => n.props.accessibilityRole === 'link')).toHaveLength(0);
    expect(openURL).not.toHaveBeenCalled();
    // Ustawienia ukryte, dopóki ekran źródeł jest otwarty
    expect(root.findAllByProps({ testID: 'settings-zrodla-btn' })).toHaveLength(0);
    act(() => tree.unmount());
    openURL.mockRestore();
  });

  it('powrót: „Ustawienia” w nagłówku (etykieta „Wróć do ustawień”, ≥ 44 pt) wraca do listy ustawień', async () => {
    act(() => setLang('pl'));
    const { tree, root, wejscie } = await otworz();
    await act(async () => wejscie.props.onPress());
    const wstecz = root.findAll((n) => n.props.testID === 'zrodla-wstecz' && n.props.accessibilityRole === 'button')[0];
    expect(wstecz.props.accessibilityLabel).toBe('Wróć do ustawień');
    expect(teksty(wstecz)).toEqual(['Ustawienia']);
    expect(StyleSheet.flatten(wstecz.props.style).minHeight).toBeGreaterThanOrEqual(44);
    await act(async () => wstecz.props.onPress());
    expect(root.findAllByProps({ testID: 'settings-zrodla-btn' }).length).toBeGreaterThan(0);
    expect(teksty(root)).not.toContain(ZRODLA_WIEDZY_WSTEP);
    act(() => tree.unmount());
  });

  it('EN: ekran po angielsku (klucze ekranu w słowniku EN, nazwy „et al.” zamiast „i in.”)', async () => {
    expect(kluczeZrodelWiedzy().filter((k) => typeof EN[k] !== 'string')).toEqual([]);
    act(() => setLang('en'));
    const { tree, root, wejscie } = await otworz();
    await act(async () => wejscie.props.onPress());
    const t1 = teksty(root);
    expect(t1).toContain('Knowledge sources');
    expect(t1).toContain(t(ZRODLA_WIEDZY_WSTEP));
    expect(t1).toContain('Calvert M.D. et al., “A review of sourdough starters”, PeerJ 2021');
    expect(t1.join('\n')).not.toMatch(/ i in\.,/);
    act(() => tree.unmount());
  });
});

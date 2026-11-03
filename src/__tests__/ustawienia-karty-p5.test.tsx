/**
 * M3 p5 (D-160, D-183): Ustawienia na systemie kart (docs/design/karty/README.md §1, §3, §4, §7a; makieta
 * docs/design/karty/inne.html #ustawienia). Struktura, nie wygląd: arkusz systemowy bez zmian („Zamknij”, tytuł),
 * każda sekcja to karta z ikoną w nagłówku (nagłówek karty jednym krojem), akcje jako wiersze (min 52, linia nad
 * wierszem, bez własnego promienia przycisku) zamiast siatek przycisków; żaden nagłówek nie leży na tle bez karty.
 * Język: obecna siatka w karcie (wybór jako wiersz → lista wymagałby zmiany testów, pula „noc, do weta”, D-198).
 * Przy dużym tekście przyciski języka i jednostek w jednej kolumnie (flexBasis 100%), bez maxFontSizeMultiplier.
 * Zachowanie (kopia, eksport, import, czyszczenie, przypomnienia, godziny snu, zakupy) pilnują istniejące testy
 * (settings-modal, usun-wszystkie-dane-124, import-z-pliku-113, godziny-snu-130, przypomnienia-karmienia-179, prz33).
 */
const mockOkno = { width: 320, height: 568, scale: 2, fontScale: 1 };
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockOkno }));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

import React from 'react';
import { StyleSheet, Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { SettingsModal } from '../components/SettingsModal';
import { initDatabase, _resetMemStore } from '../data/sqlite-store';
import { theme } from '../ui/theme';
import { promienie, typografia } from '../ui/tokeny';
import { setLang } from '../lib/i18n';

jest.setTimeout(30000);

type Wezel = renderer.ReactTestInstance;
const ROZMIAR_TYTULU_KARTY = typografia.style.tytul2.pt - 2;

async function ustawienia(): Promise<renderer.ReactTestRenderer> {
  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(<SettingsModal visible onClose={() => undefined} />);
  });
  await act(async () => {
    for (let i = 0; i < 30; i++) await Promise.resolve();
  });
  return tree;
}

const tekst = (n: Wezel): string => n.children.map((c) => (typeof c === 'string' ? c : tekst(c))).join('');
const poId = (root: Wezel, id: string): Wezel[] => root.findAll((n) => n.props?.testID === id && typeof n.type === 'string');
const jeden = (root: Wezel, id: string): Wezel => {
  const w = poId(root, id);
  expect(w.length).toBeGreaterThan(0);
  return w[0];
};
const styl = (n: Wezel) => StyleSheet.flatten(n.props.style) ?? {};
const jestNaglowkiemKarty = (n: Wezel) => {
  const s = styl(n);
  return n.props.accessibilityRole === 'header' && s.fontSize === ROZMIAR_TYTULU_KARTY && s.fontFamily === theme.typography.krojTytulow;
};
const jestKarta = (p: Wezel) => {
  const s = styl(p);
  return typeof p.type === 'string' && s.borderRadius === promienie.karta && s.backgroundColor === theme.colors.powierzchnia;
};
const karta = (n: Wezel): Wezel | null => {
  for (let p: Wezel | null = n.parent; p; p = p.parent) if (jestKarta(p)) return p;
  return null;
};
const maIkone = (k: Wezel) => k.findAll((n) => typeof n.props?.testID === 'string' && /^ikona-karty-/.test(n.props.testID)).length > 0;
const kartaZ = (root: Wezel, tytul: string): Wezel => {
  const n = root.findAllByType(Text).filter(jestNaglowkiemKarty).find((x) => tekst(x) === tytul);
  if (!n) throw new Error(`brak nagłówka karty „${tytul}”`);
  const k = karta(n);
  if (!k) throw new Error(`nagłówek „${tytul}” poza kartą`);
  return k;
};

describe('M3 p5: Ustawienia na kartach', () => {
  beforeEach(async () => {
    setLang('pl');
    Object.assign(mockOkno, { fontScale: 1 });
    _resetMemStore();
    await initDatabase();
  });

  it('sekcje jako karty z ikoną; kontrolki sekcji w swojej karcie; brak gołych nagłówków na tle', async () => {
    const tree = await ustawienia();
    const sekcje: [string, string][] = [
      ['Sprzęt i naczynie do wypieku', 'vessel-dutch-oven-btn'],
      ['Język', 'lang-pl'],
      ['Jednostki', 'unit-metric'],
      ['Godziny snu', 'sleep-profile-brak'],
      ['Kopia zapasowa', 'export-backup-btn'],
      ['Eksport arkuszy CSV', 'export-bakes-csv-btn'],
      ['Źródła wiedzy', 'settings-zrodla-btn'],
      ['Kontakt', 'settings-privacy-link'],
    ];
    for (const [tytul, id] of sekcje) {
      const k = kartaZ(tree.root, tytul);
      expect(poId(k, id).length).toBeGreaterThan(0);
      expect(maIkone(k)).toBe(true);
    }
    // Zakupy: karta z ikoną, nagłówek 17 pt (test PRZ-33, D-198)
    const zakupy = karta(jeden(tree.root, 'settings-restore-purchases-btn'));
    expect(zakupy).not.toBeNull();
    expect(maIkone(zakupy!)).toBe(true);
    // „Usuń wszystkie dane” w karcie „Kopia zapasowa” (makieta), przypomnienia i import jako wiersze-karty z ikoną
    expect(poId(kartaZ(tree.root, 'Kopia zapasowa'), 'delete-all-data-btn').length).toBeGreaterThan(0);
    for (const id of ['feeding-reminders-switch', 'import-file-btn']) {
      const k = karta(jeden(tree.root, id));
      expect(k).not.toBeNull();
      expect(maIkone(k!)).toBe(true);
    }
    const gole = tree.root.findAllByType(Text).filter((n) => n.props.accessibilityRole === 'header' && !karta(n)).map(tekst);
    expect(gole).toEqual([]);
    act(() => tree.unmount());
  });

  it('akcje jako wiersze (min 52, linia nad wierszem, bez promienia przycisku) zamiast siatek przycisków', async () => {
    const tree = await ustawienia();
    const wiersze = [
      'vessel-dutch-oven-btn', 'vessel-cloche-btn', 'sleep-profile-brak', 'settings-restore-purchases-btn',
      'export-backup-btn', 'delete-all-data-btn', 'export-bakes-csv-btn', 'settings-zrodla-btn', 'settings-privacy-link',
    ];
    for (const id of wiersze) {
      const s = styl(jeden(tree.root, id));
      expect([id, s.minHeight]).toEqual([id, 52]);
      expect([id, s.borderRadius]).toEqual([id, undefined]);
      expect([id, s.borderTopColor]).toEqual([id, theme.colors.linia]);
    }
    act(() => tree.unmount());
  });

  it('duży tekst (AX5 przy 320 pt): język i jednostki w jednej kolumnie (flexBasis 100%), bez maxFontSizeMultiplier w kartach', async () => {
    const pomiar = async (fs: number) => {
      Object.assign(mockOkno, { fontScale: fs });
      const tree = await ustawienia();
      const jezyk = styl(jeden(tree.root, 'lang-pl'));
      const jednostki = styl(jeden(tree.root, 'unit-metric'));
      const limit = tree.root.findAllByType(Text).filter((n) => karta(n) && n.props.maxFontSizeMultiplier !== undefined).map(tekst);
      act(() => tree.unmount());
      return { jezyk, jednostki, limit };
    };
    const maly = await pomiar(1);
    const duzy = await pomiar(3.1);
    expect(duzy.jezyk.flexBasis).toBe('100%');
    expect(duzy.jednostki.flexBasis).toBe('100%');
    expect(maly.jezyk.flexBasis).not.toBe('100%');
    expect(duzy.limit).toEqual([]);
    expect(maly.limit).toEqual([]);
  });
});

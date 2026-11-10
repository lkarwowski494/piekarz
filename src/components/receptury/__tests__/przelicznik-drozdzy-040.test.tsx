/**
 * M1-audytor-generalny-040 (06-tresci-005, D-306): arkusz „Składniki”, karta „Drożdże do odważenia” mówi zdaniami
 * zweryfikowanymi z docs/tresci/pl/drozdze-przelicznik.md (yeast.conversionNote i yeast.dryHandling, dosłownie;
 * zdanie D-100 zostaje), a ekran „Źródła wiedzy” ma ich źródła: oetker.pl, lesaffre.pl, fleischmannsyeast.com.
 */
const mockUstawienia = new Map<string, string>();
jest.mock('../../../data/sqlite-store', () => ({
  getAppSetting: jest.fn(async (k: string) => mockUstawienia.get(k)),
  setAppSetting: jest.fn(async (k: string, v: string) => void mockUstawienia.set(k, v)),
}));
jest.mock('react-native-safe-area-context', () => {
  const ReactMod = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => ReactMod.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

import * as fs from 'node:fs';
import * as path from 'node:path';
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { SkladnikiSheet, SkladnikiSheetProps } from '../SkladnikiSheet';
import { setLang, t } from '../../../lib/i18n';
import { _resetRodzajDrozdzy } from '../../../lib/rodzaj-drozdzy';
import { ZRODLA_WIEDZY } from '../../../core/zrodla-wiedzy';

const root = path.join(__dirname, '..', '..', '..', '..');
function sekcja(jezyk: 'pl' | 'en', naglowek: string): string[] {
  const t0 = fs.readFileSync(path.join(root, 'docs', 'tresci', jezyk, 'drozdze-przelicznik.md'), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  const blok = t0.split('\n## ').find((b) => b.startsWith(naglowek))!;
  return blok.split('\n').slice(1).filter((l) => l.trim()).map((l) => l.replace(/\s*\[T:[^\]]*\]\s*$/, '').trim());
}
const ZDANIA_PL = [...sekcja('pl', 'yeast.conversionNote'), ...sekcja('pl', 'yeast.dryHandling')];
const ZDANIA_EN = [...sekcja('en', 'yeast.conversionNote'), ...sekcja('en', 'yeast.dryHandling')];

const tekst = (n: renderer.ReactTestInstance): string =>
  n.findAll((c) => (c.type as unknown) === 'Text')
    .map((c) => (Array.isArray(c.props.children) ? c.props.children.join('') : String(c.props.children)))
    .join(' ');

const PROPS: SkladnikiSheetProps = {
  visible: true, onClose: jest.fn(), calcMode: 'flour', onCalcModeChange: jest.fn(),
  flourBlend: [{ name: 'Mąka pszenna typ 650', percentage: 100, type: 'pszenna_650' }], onFlourBlendChange: jest.fn(),
  waterPct: 70, onWaterPctChange: jest.fn(), starterPct: 20, onStarterPctChange: jest.fn(),
  starterHydration: 100, onStarterHydrationChange: jest.fn(), saltPct: 2, onSaltPctChange: jest.fn(),
  yeastPct: 0.5, onYeastPctChange: jest.fn(), prefermentType: 'direct', onPrefermentTypeChange: jest.fn(),
  prefermentFlourPct: 20, onPrefermentFlourPctChange: jest.fn(), prefermentBreakdown: null,
};

async function karta(): Promise<string> {
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(<SkladnikiSheet {...PROPS} />);
  });
  const k = tree!.root.findAll((n) => typeof n.type === 'string' && n.props.testID === 'karta-drozdze')[0]!;
  const wynik = tekst(k);
  act(() => tree!.unmount());
  return wynik;
}

describe('040 (D-306): przelicznik drożdży zdaniami z docs/tresci i jego źródła na ekranie', () => {
  beforeEach(() => {
    mockUstawienia.clear();
    mockUstawienia.set('unit_system', 'metric');
    _resetRodzajDrozdzy();
    setLang('pl');
  });
  afterEach(() => setLang('pl'));

  it('plik treści ma 4 zdania przelicznika (te same co w kodzie)', () => {
    expect(ZDANIA_PL).toEqual([
      'Piekarz liczy drożdże suche, instant i aktywne, jako 0,35 masy drożdży świeżych.',
      'To środek między wartościami dwóch grup producentów, 0,28 i 0,417, a niektórzy podają jeszcze mniej, więc na opakowaniu Twoich drożdży może być inaczej.',
      'Drożdże instant można wsypać prosto do mąki.',
      'Drożdże suche aktywne część producentów każe najpierw rozpuścić w ciepłej wodzie.',
    ]);
  });

  it('PL: karta mówi 4 zdaniami pliku dosłownie i zdaniem D-100, bez starego zdania przelicznika', async () => {
    const k = await karta();
    expect(k).toContain('Procent drożdży w recepturze to drożdże świeże.');
    for (const z of ZDANIA_PL) expect(k).toContain(z);
    expect(k).not.toContain('odważysz 0,35 tej masy');
  });

  it('EN: karta mówi zdaniami docs/tresci/en', async () => {
    setLang('en');
    const k = await karta();
    for (const z of ZDANIA_EN) expect(k).toContain(z);
  });

  it('ekran „Źródła wiedzy” ma oetker.pl, lesaffre.pl i fleischmannsyeast.com', () => {
    const adresy = ZRODLA_WIEDZY.flatMap((g) => g.zrodla.map((z) => z.adres));
    for (const a of ['oetker.pl', 'lesaffre.pl', 'fleischmannsyeast.com']) expect(adresy).toContain(a);
    for (const z of ZRODLA_WIEDZY.flatMap((g) => g.zrodla)) expect(t(z.nazwa)).toBeTruthy();
  });
});

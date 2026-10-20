/**
 * M1-audytor-generalny-100 (BR-NAUK-001, F-44; design-spec §5 „Po co ten krok”): przy krokach wypieku krótkie
 * „po co ten krok”, każde zdanie ze źródłem (RYZ-21), teksty dosłownie z docs/tresci/pl|en/po-co-ten-krok.md;
 * kroki [DO USTALENIA] KRO-POC-900 bez wyjaśnienia; Akademia bez wejścia w 1.0 (wejścia-później).
 */
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  impactAsync: jest.fn(),
  NotificationFeedbackType: { Success: 'success', Warning: 'warning' },
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

import React from 'react';
import { readFileSync } from 'fs';
import { join } from 'path';
import renderer, { act } from 'react-test-renderer';
import StolnicaScreen from '../../app/stolnica';
import DoctorScreen from '../../app/doktor';
import { initDatabase, setActiveBake, _resetMemStore } from '../data/sqlite-store';
import { PO_CO_TEN_KROK, PO_CO_BEZ_ZRODLA, poCoTenKrok } from '../core/po-co-ten-krok';
import { RYE_STAGE_TEMPLATES } from '../core/rye-stages';
import { wejscieWidoczne } from '../lib/wejscia-pozniej';
import { setLang, t } from '../lib/i18n';
import { zUprawnieniem } from '../../tests/helpers/platnosci';

const ROOT = join(__dirname, '..', '..');
type Zdanie = { tekst: string; id: string };

/** Sekcje pliku treści: klucz rodzaju kroku (pierwsze słowo nagłówka) → zdania z ID twierdzenia. */
function sekcje(plik: string): Map<string, Zdanie[]> {
  const tekst = readFileSync(join(ROOT, 'docs', 'tresci', plik), 'utf8').replace(/\r\n/g, '\n');
  const wynik = new Map<string, Zdanie[]>();
  for (const c of tekst.split(/^## /m).slice(1)) {
    const [naglowek, ...linie] = c.split('\n');
    const zdania = linie
      .map((l) => /^(.*\S)\s*\[T:([A-Z0-9-]+)\]\s*$/.exec(l))
      .filter((m): m is RegExpExecArray => m !== null)
      .map((m) => ({ tekst: m[1], id: m[2] }));
    wynik.set(naglowek.split(' ')[0], zdania);
  }
  return wynik;
}
const PL = sekcje('pl/po-co-ten-krok.md');
const EN = sekcje('en/po-co-ten-krok.md');
const rejestr = JSON.parse(readFileSync(join(ROOT, 'docs', 'tresci', 'rejestr.json'), 'utf8'));
const idRejestru = new Set<string>((Array.isArray(rejestr) ? rejestr : rejestr.twierdzenia ?? []).map((x: { id: string }) => x.id));

const enDla = (pl: string) => {
  setLang('en');
  try {
    return t(pl);
  } finally {
    setLang('pl');
  }
};

describe('100: po co ten krok — treść roli 06 (docs/tresci/pl|en/po-co-ten-krok.md)', () => {
  it('każdy rodzaj kroku z sekcją ma te same zdania co plik PL, z ID twierdzenia z rejestru, i EN z pliku EN', () => {
    expect([...PL.keys()].sort()).toEqual(Object.keys(PO_CO_TEN_KROK).filter((k) => k !== 'rye_starter').sort());
    for (const [rodzaj, zdania] of PL) {
      expect({ rodzaj, zdania: PO_CO_TEN_KROK[rodzaj].map((z) => ({ tekst: z.tekst, id: z.id })) }).toEqual({ rodzaj, zdania });
      expect({ rodzaj, en: PO_CO_TEN_KROK[rodzaj].map((z) => enDla(z.tekst)) }).toEqual({ rodzaj, en: EN.get(rodzaj)?.map((z) => z.tekst) });
      for (const z of zdania) expect({ rodzaj, id: z.id, wRejestrze: idRejestru.has(z.id) }).toEqual({ rodzaj, id: z.id, wRejestrze: true });
    }
    // Etap żytni z odpowiednikiem w nawiasie nagłówka (starter_feed „także rye_starter”) używa tekstu tej sekcji
    expect(PO_CO_TEN_KROK.rye_starter).toBe(PO_CO_TEN_KROK.starter_feed);
  });

  it('KRO-POC-900: etapy żytnie bez źródła celu nie mają wyjaśnienia', () => {
    expect([...PO_CO_BEZ_ZRODLA].sort()).toEqual(['rye_bake', 'rye_mix', 'rye_proof', 'rye_rest', 'rye_shape']);
    for (const id of PO_CO_BEZ_ZRODLA) {
      const etap = RYE_STAGE_TEMPLATES.find((s) => s.id === id)!;
      expect(poCoTenKrok({ id: etap.id, category: etap.category })).toBeNull();
    }
  });

  it('krok w garnku: nacięcie (bake) i zdanie fazy (lid_on, lid_off)', () => {
    const krok = { id: 'bake', category: 'bake' as const };
    expect(poCoTenKrok(krok, 'lid_on')?.map((z) => z.id)).toEqual(['KRO-POC-012', 'KRO-POC-013']);
    expect(poCoTenKrok(krok, 'lid_off')?.map((z) => z.id)).toEqual(['KRO-POC-012', 'KRO-POC-014']);
    expect(poCoTenKrok({ id: 'rye_cool', category: 'cool' })?.map((z) => z.id)).toEqual(['KRO-POC-015', 'KRO-POC-016']);
    expect(poCoTenKrok({ id: 'x', category: 'mix' })?.map((z) => z.id)).toEqual(['KRO-POC-004']);
  });
});

describe('100: przycisk „Po co ten krok” na prowadzeniu', () => {
  let tree: renderer.ReactTestRenderer | null = null;
  const textOf = (n: unknown): string => {
    if (typeof n === 'string' || typeof n === 'number') return String(n);
    if (Array.isArray(n)) return n.map(textOf).join('');
    if (n && typeof n === 'object' && 'children' in n) return textOf((n as { children: unknown }).children);
    if (n && typeof n === 'object' && 'props' in n) return textOf((n as { props: { children?: unknown } }).props.children);
    return '';
  };
  const btn = (id: string) =>
    tree!.root.findAll((n) => n.props.testID === id && n.props.accessibilityRole === 'button' && typeof n.props.onPress === 'function')[0];
  beforeEach(async () => {
    jest.spyOn(Date, 'now').mockReturnValue(Date.UTC(2026, 9, 21, 8, 0)); // zegar stoi: tekst ekranu porównywalny
    zUprawnieniem();
    _resetMemStore();
    setActiveBake(null);
    await initDatabase();
  });
  afterEach(() => {
    if (tree) act(() => tree!.unmount());
    tree = null;
    jest.restoreAllMocks();
  });
  const render = async (el: React.ReactElement) => {
    await act(async () => {
      tree = renderer.create(el);
    });
    await act(async () => {
      for (let i = 0; i < 20; i++) await Promise.resolve();
    });
  };

  it('otwiera arkusz z wyjaśnieniem bieżącego kroku; zamknięcie wraca do kroku bez zmian', async () => {
    await render(<StolnicaScreen />);
    await act(async () => {
      tree!.root.findAll((n) => typeof n.props.onPress === 'function' && textOf(n.props.children).includes('Zacznij wypiek'))[0].props.onPress();
    });
    const przed = textOf(tree!.toJSON());
    expect(tree!.root.findAll((n) => n.props.testID === 'why-step-sheet')).toHaveLength(0);
    expect(btn('step-why-btn').props.accessibilityState).toEqual({ disabled: false });
    await act(async () => {
      btn('step-why-btn').props.onPress();
    });
    const arkusz = tree!.root.findAll((n) => n.props.testID === 'why-step-sheet' && typeof n.type === 'string');
    expect(arkusz).toHaveLength(1);
    expect(textOf(arkusz[0])).toContain(PO_CO_TEN_KROK.starter_feed.map((z) => z.tekst).join(''));
    await act(async () => {
      tree!.root.findAll((n) => n.props.testID === 'close-modal' && typeof n.props.onPress === 'function')[0].props.onPress();
    });
    expect(tree!.root.findAll((n) => n.props.testID === 'why-step-sheet')).toHaveLength(0);
    expect(textOf(tree!.toJSON())).toBe(przed);
  });

  it('krok żytni bez źródła (rye_mix): przycisk „Po co ten krok” nieaktywny', async () => {
    setActiveBake({ id: 'bake_rye', recipeName: 'Razowiec', startedAt: Date.now(), currentStageId: 'rye_starter', isHighRye: true });
    await render(<StolnicaScreen />);
    expect(btn('step-why-btn').props.accessibilityState).toEqual({ disabled: false }); // rye_starter ma tekst
    await act(async () => {
      btn('next-or-finish-step-btn').props.onPress();
    });
    expect(textOf(tree!.toJSON())).toContain('Mieszanie ciasta');
    expect(btn('step-why-btn').props.accessibilityState).toEqual({ disabled: true });
  });

  it('Akademia bez wejścia w 1.0: Doktor nie ma open-academy-btn ani open-academy-banner', async () => {
    expect(wejscieWidoczne('akademia')).toBe(false);
    await render(<DoctorScreen />);
    expect(tree!.root.findAll((n) => n.props.testID === 'open-academy-btn')).toHaveLength(0);
    expect(tree!.root.findAll((n) => n.props.testID === 'open-academy-banner')).toHaveLength(0);
  });
});

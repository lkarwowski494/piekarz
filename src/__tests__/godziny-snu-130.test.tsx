/**
 * Godziny snu w Ustawieniach (D-066 1a): domyślnie 23:00–07:00 (BRD, OP-45), wybór zapisany w `app_settings`,
 * opcja „Bez godzin snu”; plan wypieku czyta wybór [M1-audytor-generalny-130; 01-odkrywanie-501].
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import HarmonogramScreen from '../../app/(tabs)/receptury/harmonogram';
import { GodzinySnuSection } from '../components/settings/GodzinySnuSection';
import { initDatabase, setActiveBake, getAppSetting, setAppSetting } from '../data/sqlite-store';
import {
  _resetGodzinySnu, oknoSnu, parsujProfilSnu, wczytajProfilSnu, zapiszProfilSnu, useProfilSnu, PROFILE_SNU,
  KLUCZ_GODZIN_SNU, DOMYSLNY_PROFIL_SNU, type ProfilSnuId,
} from '../lib/godziny-snu';
import { t } from '../lib/i18n';
import { zUprawnieniem } from '../../tests/helpers/platnosci';

jest.setTimeout(20000);
jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock('react-native-safe-area-context', () => {
  const R = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: unknown; style?: unknown }) => R.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

const tekst = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(tekst).join('');
  if (n && typeof n === 'object' && 'children' in n) return tekst((n as { children: unknown }).children);
  return '';
};
async function render(el: React.ReactElement): Promise<renderer.ReactTestRenderer> {
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(el);
  });
  await act(async () => {
    for (let i = 0; i < 20; i++) await Promise.resolve();
  });
  return tree!;
}

describe('Godziny snu (130, D-066 1a)', () => {
  beforeEach(async () => {
    zUprawnieniem();
    setActiveBake(null);
    await initDatabase();
    await setAppSetting('godziny_snu', 'standard');
    _resetGodzinySnu();
    jest.spyOn(Date, 'now').mockImplementation(() => new Date(2026, 9, 21, 2, 0).getTime());
  });
  afterEach(() => jest.restoreAllMocks());

  it('profile i okna: domyślnie standard 23:00–07:00, „Bez godzin snu” bez okna, nieznana wartość = domyślny', () => {
    expect(oknoSnu('standard')).toEqual({ startH: 23, koniecH: 7 });
    expect(oknoSnu('brak')).toBeNull();
    expect(parsujProfilSnu(undefined)).toBe('standard');
    expect(parsujProfilSnu('night_owl')).toBe('night_owl');
    expect(parsujProfilSnu('zle')).toBe('standard');
    expect(PROFILE_SNU.map((p) => p.id)).toEqual(['standard', 'early_bird', 'night_owl']);
  });

  it('useProfilSnu: domyślny DOMYSLNY_PROFIL_SNU, potem wybór; szablon potwierdzenia ma {od} i {do}', async () => {
    const widziane: ProfilSnuId[] = [];
    function Podglad() {
      widziane.push(useProfilSnu());
      return null;
    }
    const tree = await render(<Podglad />);
    await act(async () => {
      await zapiszProfilSnu('night_owl');
    });
    expect(widziane[0]).toBe(DOMYSLNY_PROFIL_SNU);
    expect(widziane[widziane.length - 1]).toBe('night_owl');
    act(() => tree.unmount());
    expect(t('Wszystkie etapy manualne (mieszanie, składanie, pieczenie) odbywają się poza oknem snu ({od} – {do}).', { od: '23:00', do: '07:00' }))
      .toBe('Wszystkie etapy manualne (mieszanie, składanie, pieczenie) odbywają się poza oknem snu (23:00 – 07:00).');
  });

  it('wybór zapisany w app_settings i odczytany po resecie pamięci', async () => {
    await zapiszProfilSnu('early_bird');
    expect(await getAppSetting(KLUCZ_GODZIN_SNU)).toBe('early_bird');
    _resetGodzinySnu();
    expect(await wczytajProfilSnu()).toBe('early_bird');
  });

  it('Ustawienia: sekcja „Godziny snu” z profilami i „Bez godzin snu”; wybór zapisuje się', async () => {
    const tree = await render(<GodzinySnuSection />);
    const t = tekst(tree.toJSON());
    expect(t).toContain('Godziny snu');
    expect(t).toContain('Kroki z pracą przy cieście planuję poza tymi godzinami.');
    expect(t).toContain('Standard (23:00 – 07:00)');
    await act(async () => {
      tree.root.findByProps({ testID: 'sleep-profile-brak' }).props.onPress();
      for (let i = 0; i < 20; i++) await Promise.resolve();
    });
    expect(tekst(tree.root.findByProps({ testID: 'sleep-profile-brak' }).children)).toBe('Bez godzin snu');
    expect(await getAppSetting('godziny_snu')).toBe('brak');
    act(() => tree.unmount());
  });

  it('plan z „Bez godzin snu”: bez sprawdzania kolizji i z informacją, że godziny można ustawić (BR-HARMO-002 Brak godzin snu)', async () => {
    await zapiszProfilSnu('brak');
    const tree = await render(<HarmonogramScreen />);
    const t = tekst(tree.toJSON());
    expect(t).toContain('Plan nie sprawdza godzin snu. Możesz je ustawić w Ustawieniach.');
    expect(t).not.toContain('Ochrona snu aktywna');
    expect(t).not.toMatch(/w nocy/);
    act(() => tree.unmount());
  });

  it('plan z domyślnymi godzinami: potwierdzenie z oknem 23:00 – 07:00 (BR-HARMO-002 Krok czynny w nocy)', async () => {
    const tree = await render(<HarmonogramScreen />);
    expect(tekst(tree.toJSON())).toContain('Wszystkie etapy manualne (mieszanie, składanie, pieczenie) odbywają się poza oknem snu (23:00 – 07:00).');
    act(() => tree.unmount());
  });
});

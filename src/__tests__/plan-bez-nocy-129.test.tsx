/**
 * M1-audytor-generalny-129 (DEC-18 a; 08-programista-501, 07-jakosc-502): po otwarciu planu żaden krok czynny nie wypada
 * w oknie snu z ustawień (23:00–06:30), o każdej godzinie zegara; z zakwasem z lodówki (plan ok. 36 h) i bez niego.
 * Zegar ustawiony fałszywymi timerami (`new Date()` ekranu i Date.now), więc test nie zależy od pory uruchomienia.
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import HarmonogramScreen from '../../app/(tabs)/receptury/harmonogram';
import { getActiveBake, setActiveBake, initDatabase, getStarters, deleteStarter, saveStarter } from '../data/sqlite-store';
import type { StoredStarter } from '../data/db';
import { ustawZakwasPlanu } from '../lib/zakwas-planu';
import { setLang } from '../lib/i18n';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { PROFILE_SNU, DOMYSLNY_PROFIL_SNU, oknoSnu, type ProfilSnuId } from '../lib/profile-snu';
import { zapiszProfilSnu } from '../lib/godziny-snu';
import type { OknoSnu } from '../lib/plan-bez-nocy';
import { calculateReverseSchedule } from '../scheduler/reverse-scheduler';

jest.setTimeout(30000);
jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock('react-native-safe-area-context', () => {
  const R = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: unknown; style?: unknown }) => R.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

// Okno snu z profilu Ustawień (oknoSnu), nie stała w teście: domyślny Standard 23:00–07:00 (D-066 1a),
// Ranny ptaszek 22:00–06:00, Nocny marek 00:00–08:00 [M1-audytor-generalny-212; 08-programista-602]
const godz = (ms: number) => { const d = new Date(ms); return d.getHours() + d.getMinutes() / 60; };
const wSnie = (okno: OknoSnu, ms: number) => {
  const h = godz(ms);
  return okno.startH > okno.koniecH ? h >= okno.startH || h < okno.koniecH : h >= okno.startH && h < okno.koniecH;
};
/** Niezależny od kodu produkcyjnego: początek lub koniec w oknie snu albo okno snu wewnątrz kroku (krok co najwyżej kilkugodzinny). */
const krokWNocy = (okno: OknoSnu, s: number, e: number) => {
  if (wSnie(okno, s) || wSnie(okno, e)) return true;
  for (let t = s; t < e; t += 5 * 60_000) if (wSnie(okno, t)) return true;
  return false;
};

const zakwas = (storageState: StoredStarter['storageState']): StoredStarter => ({
  id: 'z1', name: 'Zakwas', flourType: 'Żytnia', hydration: 100, birthDate: 1, storageState,
});
const textOf = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(textOf).join('');
  if (n && typeof n === 'object' && 'props' in n) return textOf((n as { props: { children?: unknown } }).props.children);
  return '';
};
const wszystkieTeksty = (tree: renderer.ReactTestRenderer) =>
  tree.root.findAll((n) => (n.type as unknown) === 'Text').map((n) => textOf(n.props.children)).join(' | ');

async function otworzPlan(): Promise<renderer.ReactTestRenderer> {
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => { tree = renderer.create(<HarmonogramScreen />); });
  await act(async () => { await Promise.resolve(); });
  await act(async () => { await Promise.resolve(); });
  return tree!;
}

const GODZINY: Array<[number, number]> = [[0, 30], [6, 0], [7, 46], [12, 0], [14, 0], [20, 0], [21, 0]];
const PROFILE: ProfilSnuId[] = [...PROFILE_SNU.map((p) => p.id), 'brak'];
const PRZYPADKI = PROFILE.flatMap((profil) => GODZINY.flatMap(([h, m]) => [[profil, h, m, 'FRIDGE'], [profil, h, m, 'brak']] as const));

describe('plan bez kroków czynnych w nocy po otwarciu (129, DEC-18 a)', () => {
  beforeEach(async () => {
    zUprawnieniem();
    setLang('pl');
    setActiveBake(null);
    await initDatabase();
    for (const s of await getStarters()) await deleteStarter(s.id);
    ustawZakwasPlanu(null);
  });
  afterEach(async () => {
    jest.useRealTimers();
    await zapiszProfilSnu(DOMYSLNY_PROFIL_SNU);
  });

  it('domyślne okno harmonogramu = okno domyślnego profilu Ustawień (23:00–07:00): kolizje jak przy jawnym oknie, co 15 min doby', () => {
    const okno = oknoSnu(DOMYSLNY_PROFIL_SNU)!;
    expect(okno).toEqual({ startH: 23, koniecH: 7 });
    const rozne: string[] = [];
    for (let min = 0; min < 24 * 60; min += 15) {
      const cel = new Date(2026, 6, 15, Math.floor(min / 60), min % 60, 0, 0);
      const dom = calculateReverseSchedule(cel, { ambientTemperatureC: 22 });
      const jawne = calculateReverseSchedule(cel, { ambientTemperatureC: 22, sleepStartHour: okno.startH, sleepEndHour: okno.koniecH });
      if (JSON.stringify(dom.sleepCollisions) !== JSON.stringify(jawne.sleepCollisions)) rozne.push(cel.toTimeString().slice(0, 5));
    }
    expect(rozne).toEqual([]);
  });

  it.each(PRZYPADKI)('profil %s, zegar %i:%i, zakwas %s: żaden krok czynny nie wypada w oknie snu, baner nocy bez kolizji', async (profil, h, m, stan) => {
    await zapiszProfilSnu(profil);
    if (stan === 'FRIDGE') await saveStarter(zakwas('FRIDGE'));
    jest.useFakeTimers({ now: new Date(2026, 6, 14, h, m, 0, 0), doNotFake: ['nextTick', 'setImmediate', 'queueMicrotask'] });
    const tree = await otworzPlan();
    const teksty = wszystkieTeksty(tree);
    const okno = oknoSnu(profil);
    if (okno === null) {
      // „Bez godzin snu”: plan nie sprawdza nocy i mówi, że godziny można ustawić (D-066 1a)
      expect(teksty).not.toContain('Ochrona snu aktywna');
      expect(teksty).toContain('Bez godzin snu');
      act(() => tree.unmount());
      return;
    }
    expect(teksty).toContain('Ochrona snu aktywna');
    expect(teksty).not.toMatch(/wypada(ją)?( o \d\d:\d\d)? w nocy/);
    expect(teksty).not.toContain('Nie zdążysz na tę godzinę');

    await act(async () => {
      tree.root.findAll((n) => n.props?.testID === 'plan-start-bake-btn' && typeof n.props.onPress === 'function')[0].props.onPress();
    });
    const kroki = getActiveBake()!.steps!;
    expect(kroki.length).toBeGreaterThan(0);
    const wNocy = kroki
      .filter((s) => !s.isPassive && s.plannedStart !== null && s.plannedEnd !== null)
      .filter((s) => krokWNocy(okno, s.plannedStart!, s.plannedEnd!))
      .map((s) => `${s.id} ${new Date(s.plannedStart!).toString()}`);
    expect(wNocy).toEqual([]);
    expect(kroki[0].plannedStart!).toBeGreaterThanOrEqual(Date.now() - 60_000);
    act(() => tree.unmount());
  });
});

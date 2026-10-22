/**
 * Karta cyklu zakwasu w lodówce (odstęp 7 dni, ZAK-ZAL-012) mówi, którego dnia i o której przypada następne
 * dokarmienie; przy odstępie do doby zostaje „dokarmiony o …, następne o …” [M2-koordynator-napraw-503 (p11);
 * M1-audytor-generalny-188].
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import { StarterCycleCard } from '../zakwas/StarterCycleCard';
import { stanKartyZakwasu } from '../../lib/zakwas-widok';
import { appLocale, formatDate, formatTime } from '../../lib/format';
import { setLang } from '../../lib/i18n';
import type { StoredStarterEntry } from '../../data/db';

const H = 3_600_000;
const feed = (at: number): StoredStarterEntry => ({ id: 'f', starterId: 'z', kind: 'feeding', occurredAt: at, signs: [], createdAt: at, updatedAt: at });

function tekst(stan: ReturnType<typeof stanKartyZakwasu>): string {
  let tree: renderer.ReactTestRenderer | null = null;
  act(() => {
    tree = renderer.create(<StarterCycleCard stan={stan} opisMiejsca="w lodówce" onPodwoil={jest.fn()} onDokarm={jest.fn()} onNiepokoi={jest.fn()} />);
  });
  const t = tree!.root.findAllByType(Text).map((n) => [n.props.children].flat().join('')).join(' | ');
  act(() => tree!.unmount());
  return t;
}

describe('503: karta zakwasu w lodówce — dzień i godzina następnego dokarmienia', () => {
  afterEach(() => setLang('pl'));
  const fedAt = new Date(2026, 9, 21, 10, 0).getTime();
  const now = fedAt + 8 * H;
  // 7 dni kalendarza o tej samej godzinie (D-093): 2026-10-28 10:00 lokalnie; w strefie ze zmianą czasu 25.10 to nie fedAt + 7 × 24 h
  const nastepne = new Date(2026, 9, 28, 10, 0).getTime();

  it.each(['pl', 'en'] as const)('%s: lodówka → data i godzina T + 7 dni', (jezyk) => {
    setLang(jezyk);
    const stan = stanKartyZakwasu({ storageState: 'FRIDGE' }, [feed(fedAt)], now);
    expect(stan.nastepneAt).toBe(nastepne);
    const t = tekst(stan);
    // dzień jak w §11c: dalej niż pojutrze „{dzień tygodnia}, {d} {miesiąc}” według języka
    const dzien = formatDate(nastepne, appLocale(), { weekday: 'long', day: 'numeric', month: 'long' });
    expect(t).toContain(jezyk === 'pl' ? `Następne dokarmienie: ${dzien} o ${formatTime(nastepne)}.` : `Next feeding: ${dzien} at ${formatTime(nastepne)}.`);
  });

  it('blat: zostaje „dokarmiony o …, następne o …” bez daty', () => {
    const stan = stanKartyZakwasu({ storageState: 'ROOM_TEMP' }, [feed(fedAt)], fedAt + 2 * H);
    const t = tekst(stan);
    expect(t).toContain(`dokarmiony o ${formatTime(fedAt)}, następne o ${formatTime(fedAt + 12 * H)}`);
    expect(t).not.toContain(formatDate(fedAt + 12 * H, appLocale(), { day: 'numeric', month: 'long' }));
  });
});

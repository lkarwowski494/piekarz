/**
 * Piekarnik zajęty w arkuszu dnia i na pasku tygodnia (M3 D6; BR-KAL-016 „Jeden piekarnik”; makieta roli 04 a2
 * `piekarnik-2-arkusz-dnia`, `piekarnik-3-kalendarz`): wiersz kolizji w kolejności godzin z glifem piekarnika i słowami
 * „Piekarnik zajęty”, tło ostrzeżenia jako trzeci sygnał; na pasku glif piekarnika pierwszy w dniu, pod paskiem zdanie
 * „{dzień}: piekarnik zajęty o {godzina}”. Kolory tylko z tokenów (ostrzTlo, ostrzTusz).
 */
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { StyleSheet } from 'react-native';
import { ArkuszDnia } from '../kalendarz/ArkuszDnia';
import { PasekTygodnia } from '../kalendarz/PasekTygodnia';
import { LiniaPiekarnika } from '../kalendarz/LiniaPiekarnika';
import { zdarzeniaKalendarza, type DaneKalendarza } from '../../core/kalendarz-zdarzenia';
import { znacznikiDni } from '../../core/kalendarz-nastepne';
import { dniPaska } from '../../lib/kalendarz-pasek';
import { localDateKey, startOfLocalDay } from '../../core/dzien-lokalny';
import { setLang } from '../../lib/i18n';
import { formatTime } from '../../lib/format';
import { theme } from '../../ui/theme';

const MIN = 60_000;
const o = (h: number, m = 0) => new Date(2026, 9, 24, h, m).getTime(); // sobota
const now = new Date(2026, 9, 22, 6, 0).getTime(); // czwartek
const kroki = (od: number, nagrzewanie: number, pieczenie: number) => [
  { id: 'mix', name: 'Mieszanie ciasta', category: 'mix' as const, plannedStart: od - 120 * MIN, plannedEnd: od - 100 * MIN },
  { id: 'preheat_oven', name: 'Nagrzewanie pieca i garnka żeliwnego', category: 'preheat_oven' as const, plannedStart: od, plannedEnd: od + nagrzewanie * MIN },
  { id: 'bake', name: 'Wypiek z parą i rumienienie', category: 'bake' as const, plannedStart: od + nagrzewanie * MIN, plannedEnd: od + (nagrzewanie + pieczenie) * MIN },
];
const dane: DaneKalendarza = {
  wypieki: [], zakwasy: [], wpisyZakwasow: [], dziennik: [], pominiecia: [],
  zaplanowane: [{ id: 'chleb', recipeName: 'Chleb', steps: kroki(o(8, 15), 30, 60) }, { id: 'pizza', recipeName: 'Pizza', steps: kroki(o(8, 30), 60, 15) }],
  dostep: { terminyKarmienia: true, przyszleWypieki: true },
};
const textOf = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(textOf).join('');
  if (n && typeof n === 'object' && 'props' in n) return textOf((n as { props: { children?: unknown } }).props.children);
  return '';
};

describe('D6: piekarnik zajęty w arkuszu dnia i na pasku', () => {
  beforeAll(() => setLang('pl'));
  const zdarzenia = zdarzeniaKalendarza(dane, now);
  const sobota = localDateKey(o(8, 30));

  it('BR-KAL-016 Jeden piekarnik w arkuszu dnia: wiersz kolizji o 08:30 z glifem piekarnika, słowami i tłem ostrzeżenia', () => {
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <ArkuszDnia tryb={{ dzien: sobota, ms: startOfLocalDay(o(8, 30)) }} zdarzenia={zdarzenia} o={{ now, wieleWypiekow: true }}
          akcje={{ onZrobione: jest.fn(), onPomin: jest.fn() }} onPrzejdz={jest.fn()} onClose={jest.fn()} />
      );
    });
    const wiersze = tree.root.findAll((n) => typeof n.props.testID === 'string' && n.props.testID.startsWith('arkusz-zdarzenie-') && typeof n.type !== 'string' && n.props.accessibilityRole === 'button' && typeof n.props.onPress === 'function');
    const piec = wiersze.filter((w) => w.props.testID.startsWith('arkusz-zdarzenie-piekarnik:'));
    expect(piec).toHaveLength(1);
    const w = piec[0];
    expect(w.props.accessibilityLabel).toBe(`${formatTime(o(8, 30))} Piekarnik zajęty: Chleb i Pizza pieką się w tym samym czasie`);
    expect(w.findAll((n) => n.props.testID === 'glif-piekarnik').length).toBeGreaterThan(0);
    expect(StyleSheet.flatten(w.props.style).backgroundColor).toBe(theme.colors.ostrzTlo);
    // kolejność godzin: wiersz piekarnika przed krokiem pizzy o tej samej godzinie
    const ids = wiersze.map((x) => x.props.testID as string);
    expect(ids.indexOf(w.props.testID)).toBeLessThan(ids.indexOf('arkusz-zdarzenie-wypiek:pizza:krok:1'));
    act(() => tree.unmount());
  });

  it('BR-KAL-016 Jeden piekarnik na pasku: sobota ma glif piekarnika pierwszy w dniu', () => {
    const dni = dniPaska(now, 1);
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <PasekTygodnia dni={dni} zdarzenia={zdarzenia} znaczniki={znacznikiDni(zdarzenia, dni.map((d) => d.klucz))} wypieki={['chleb', 'pizza']}
          now={now} wieleWypiekow duzyTekst={false} waski={false} onDzien={jest.fn()} />
      );
    });
    const dzien = tree.root.findAll((n) => n.props.testID === `pasek-dzien-${sobota}` && typeof n.type !== 'string')[0];
    const glify = dzien.findAll((n) => typeof n.props.testID === 'string' && n.props.testID.startsWith('glif-') && typeof n.type !== 'string');
    expect(glify[0]?.props.testID).toBe('glif-piekarnik');
    expect(dzien.props.accessibilityLabel).toMatch(/^sobota, 24 października\. Piekarnik zajęty o /);
    act(() => tree.unmount());
  });

  it('pod paskiem: zdanie „{dzień}: piekarnik zajęty o {godzina}” dla najbliższej kolizji; bez kolizji nic', () => {
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<LiniaPiekarnika zdarzenia={zdarzenia} now={now} />);
    });
    const linia = tree.root.findAll((n) => n.props.testID === 'linia-piekarnika' && typeof n.type !== 'string')[0];
    expect(linia).toBeDefined();
    expect(textOf(linia)).toBe(`Pojutrze: piekarnik zajęty o ${formatTime(o(8, 30))}`);
    act(() => tree.update(<LiniaPiekarnika zdarzenia={zdarzenia.filter((z) => z.rodzaj !== 'piekarnik-zajety')} now={now} />));
    expect(tree.root.findAll((n) => n.props.testID === 'linia-piekarnika')).toHaveLength(0);
    act(() => tree.unmount());
  });
});

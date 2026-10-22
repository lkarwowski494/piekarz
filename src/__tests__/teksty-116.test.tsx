/**
 * M1-audytor-generalny-116 (04-studio-projektowe-034; design-spec §11c „116”, makieta docs/design/ekrany/inne.html
 * `dziennik-pusty`): pusty Dziennik z zaproszeniem i „Wybierz recepturę”, tytuł kolizji ze snem bez „Uwaga…!” z formami
 * liczby, „W nocy” na osi planu, podsumowanie planu bez strzałki („Start {dzień} o {godzina}”, „Całość trwa {czas}.”),
 * format czasu trwania w planie i w eksporcie, „Koniec kroku: {nazwa}”, ocena miękiszu bez wykrzyknika, komunikat importu.
 */
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, navigate: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useFocusEffect: (cb: () => void) => require('react').useEffect(cb, []),
  // Dziennik czyta parametr `wpis` (wejście z kalendarza, BR-KAL-013) [M3 D7]
  useLocalSearchParams: () => ({}),
}));
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('react-native-safe-area-context', () => {
  const R = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: unknown; style?: unknown }) => R.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

import React from 'react';
import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import DziennikScreen from '../../app/(tabs)/dziennik/index';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { SleepGuardBanner } from '../components/harmonogram/SleepGuardBanner';
import { TimelineStagesList } from '../components/harmonogram/TimelineStagesList';
import { ScheduleSummaryCard } from '../components/harmonogram/ScheduleSummaryCard';
import { FinishBakeModal } from '../components/stolnica/FinishBakeModal';
import { initDatabase, _resetMemStore } from '../data/sqlite-store';
import { saveBakeSession } from '../data/bake-session-store';
import { _resetStanu } from '../lib/platnosci/stan';
import { formatScheduleToText } from '../lib/schedule-formatter';
import { czasTrwania } from '../lib/czas-trwania';
import { setLang, t as tr } from '../lib/i18n';
import type { ReverseScheduleResult, ScheduledStage } from '../scheduler/reverse-scheduler';
import * as Iap from 'expo-iap';

const mockIap = (Iap as unknown as { __mock: { reset: () => void } }).__mock;
const NBSP = ' ';
const nb = (s: string) => s.split(' ').join(NBSP);

const textOf = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(textOf).join('');
  if (n && typeof n === 'object' && 'props' in n) return textOf((n as { props: { children?: unknown } }).props.children);
  return '';
};
const teksty = (root: renderer.ReactTestInstance) => root.findAllByType(Text).map((n) => textOf(n.props.children));

function render(el: React.ReactElement): renderer.ReactTestRenderer {
  let tree!: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(el);
  });
  return tree;
}

const etap = (p: Partial<ScheduledStage> & { id: string; namePl: string }): ScheduledStage => ({
  category: 'bulk_ferment',
  startTime: new Date(2026, 9, 21, 20, 30),
  endTime: new Date(2026, 9, 22, 0, 58),
  durationMinutes: 268,
  isPassive: false,
  isSleepCollision: false,
  instructionsPl: 'Wykonaj 4 serie składań co 30–45 minut.',
  ...p,
});

describe('116: pusty Dziennik (dziennik-pusty)', () => {
  beforeEach(async () => {
    mockPush.mockClear();
    _resetMemStore();
    mockIap.reset();
    _resetStanu();
    await initDatabase();
    await saveBakeSession(null);
    setLang('pl');
  });

  it('tytuł, opis i „Wybierz recepturę” prowadzący do zakładki Receptury', async () => {
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <AppAccessProvider>
          <DziennikScreen />
        </AppAccessProvider>,
      );
    });
    await act(async () => {
      for (let i = 0; i < 30; i++) await Promise.resolve();
    });
    const t = teksty(tree.root);
    expect(t).toContain('Tu zapiszą się twoje wypieki');
    expect(t).toContain('Po każdym wypieku zapiszę recepturę, datę i twoją ocenę. Zacznij od receptury.');
    expect(t).not.toContain('Brak wcześniejszych wypieków');
    const btn = tree.root.findAll((n) => n.props?.testID === 'journal-empty-choose-recipe-btn' && typeof n.props.onPress === 'function');
    expect(btn).toHaveLength(1);
    expect(btn[0].props.accessibilityRole).toBe('button');
    expect(textOf(btn[0].props.children)).toBe('Wybierz recepturę');
    await act(async () => btn[0].props.onPress());
    expect(mockPush).toHaveBeenCalledWith('/receptury');
    act(() => tree.unmount());
  });
});

describe('116: plan wypieku — kolizja ze snem, oś, podsumowanie', () => {
  afterEach(() => setLang('pl'));
  const baner = (n: number) =>
    render(
      <SleepGuardBanner
        hasSleepCollision
        sleepCollisions={[
          { stageNamePl: 'Formowanie ostateczne i koszyk', time: '00:15' },
          { stageNamePl: 'Formowanie wstępne', time: '23:40' },
          { stageNamePl: 'Odpoczynek na desce', time: '23:50' },
          { stageNamePl: 'Autoliza (mąka + woda)', time: '02:00' },
          { stageNamePl: 'Wymieszanie z solą i zakwasem', time: '02:45' },
        ].slice(0, n)}
        autoResolved={{ adjustedColdRetardHours: 16 }}
        onApplyAutoResolution={() => {}}
      />,
    );

  it('tytuł kolizji: jeden krok „{krok} wypada o {godzina} w nocy”, kilka z formą liczby; „Przesuń do lodówki”', () => {
    setLang('pl');
    expect(teksty(baner(1).root)).toContain('Formowanie ostateczne i koszyk wypada o 00:15 w nocy');
    expect(teksty(baner(3).root)).toContain('3 kroki wypadają w nocy');
    const piec = teksty(baner(5).root);
    expect(piec).toContain('5 kroków wypada w nocy');
    expect(piec.join(' ')).not.toMatch(/Uwaga|!/);
    expect(piec).toContain('Przesuń do lodówki');
    setLang('en');
    expect(teksty(baner(1).root)).toContain('Final shaping and basket falls at 00:15 during the night');
    expect(teksty(baner(3).root)).toContain('3 steps fall during the night');
    expect(teksty(baner(3).root)).toContain('Move to fridge');
  });

  it('oś planu: „W nocy” zamiast „Kolizja nocna!”, czas kroku „4 h 28 min”', () => {
    setLang('pl');
    const tree = render(
      <TimelineStagesList
        stages={[etap({ id: 'bulk', namePl: 'Fermentacja burzliwa ze składaniami', isSleepCollision: true })]}
        formatTime={(d) => `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`}
        formatDayBadge={() => 'Dziś'}
      />,
    );
    const t = teksty(tree.root);
    expect(t).toContain('W nocy');
    expect(t).toContain(nb('4 h 28 min'));
    expect(t.join(' ')).not.toContain('Kolizja nocna');
  });

  it('podsumowanie: „Start dziś o 20:30” i „Całość trwa 27 h 35 min.” bez strzałki; bez startu tylko długość', () => {
    setLang('pl');
    const props = {
      czasMin: 27 * 60 + 35,
      teraz: new Date(2026, 9, 21, 20, 15).getTime(),
      onStartBakeOnWorkbench: () => {},
      onCopySchedule: () => {},
    };
    const t = teksty(render(<ScheduleSummaryCard {...props} start={new Date(2026, 9, 21, 20, 30)} />).root);
    expect(t).toContain('Start dziś o 20:30');
    expect(t).toContain(`Całość trwa ${nb('27 h 35 min')}.`);
    expect(t.join(' ')).not.toMatch(/➔|\d\.\dh/);
    const bezStartu = teksty(render(<ScheduleSummaryCard {...props} start={null} />).root);
    expect(bezStartu.join(' ')).not.toContain('Start');
    expect(bezStartu).toContain(`Całość trwa ${nb('27 h 35 min')}.`);
    setLang('en');
    const en = teksty(render(<ScheduleSummaryCard {...props} start={new Date(2026, 9, 21, 20, 30)} />).root);
    expect(en.some((s) => /^Start today at /.test(s))).toBe(true);
    expect(en).toContain(`Takes ${nb('27 h 35 min')} in total.`);
  });
});

describe('116: teksty z kluczami PL i EN (szablony z parametrami i komunikaty bez wykrzyknika)', () => {
  afterEach(() => setLang('pl'));
  it('każdy klucz ma wpis EN bez „!”', () => {
    const pary: [string, Record<string, string>, string][] = [
      ['Start {dzien} o {godzina}', { dzien: 'today', godzina: '8:30 PM' }, 'Start today at 8:30 PM'],
      ['Całość trwa {czas}.', { czas: '4 h' }, 'Takes 4 h in total.'],
      ['{krok} wypada o {godzina} w nocy', { krok: 'Shaping', godzina: '02:30' }, 'Shaping falls at 02:30 during the night'],
      ['Zdejmij pokrywkę garnka. Wypuść parę.', {}, 'Remove the Dutch oven lid. Release the steam.'],
      ['Wypiek w garnku zakończony. Wyjmij chleb na kratkę.', {}, 'Dutch oven bake finished. Place the bread on a wire rack.'],
      ['Optymalny moment. Rozgrzewaj piec i szykuj żyletkę.', {}, 'Right on time. Preheat the oven and get your blade ready.'],
    ];
    setLang('en');
    for (const [pl, p, en] of pary) expect(tr(pl, p)).toBe(en);
  });
});

describe('116: format czasu w eksporcie planu, koniec kroku, ocena miękiszu', () => {
  afterEach(() => setLang('pl'));

  it('eksport planu: łączny czas i czasy kroków we wspólnym formacie, bez ułamków godzin', () => {
    setLang('pl');
    const schedule: ReverseScheduleResult = {
      targetReadyTime: new Date(2026, 9, 17, 0, 40),
      hasSleepCollision: false,
      sleepCollisions: [],
      stages: [
        etap({ id: 'starter_feed', namePl: 'Dokarmienie zakwasu', startTime: new Date(2026, 9, 15, 13, 0), endTime: new Date(2026, 9, 15, 18, 0), durationMinutes: 300 }),
        etap({ id: 'bake', namePl: 'Wypiek z parą', startTime: new Date(2026, 9, 16, 23, 55), endTime: new Date(2026, 9, 17, 0, 40), durationMinutes: 45 }),
      ],
    };
    const txt = formatScheduleToText(schedule, { coldRetardHours: 14, referenceDate: new Date(2026, 9, 15, 10, 0) });
    expect(txt).toContain(`Łączny czas: ${nb('35 h 40 min')}`);
    expect(txt).toContain(`Dokarmienie zakwasu (${nb('5 h')})`);
    expect(txt).toContain(`Wypiek z parą (${nb('45 min')})`);
    expect(txt).toContain(`Garowanie chłodnicze: ${nb('14 h')}`);
    expect(txt).not.toMatch(/\d\.\dh|\dh\b/);
  });

  it('czas trwania: cała wartość połączona spacjami niełamiącymi („35 h 40 min”)', () => {
    setLang('pl');
    expect(czasTrwania(35.67 * 60).tekst).toBe(nb('35 h 40 min'));
    setLang('en');
    expect(czasTrwania(35.67 * 60).tekst).toBe(nb('35 h 40 min'));
  });

  it('ocena miękiszu: krótki opis bez wykrzyknika i bez porady', () => {
    setLang('pl');
    const ocena = (crumbScore: number) =>
      teksty(
        render(
          <FinishBakeModal
            visible
            onClose={() => {}}
            onSave={() => {}}
            rating={4}
            onRatingChange={() => {}}
            notes=""
            onNotesChange={() => {}}
            crumbScore={crumbScore}
            onCrumbScoreChange={() => {}}
            crustScore={3}
            onCrustScoreChange={() => {}}
            tasteProfile="balanced"
            onTasteProfileChange={() => {}}
            sensoryProfile={{ crustCrispness: 3, crumbElasticity: 3, acidity: 3, openCrumb: 3, caramelization: 3 }}
            onSensoryProfileChange={() => {}}
          />,
        ).root,
      );
    expect(ocena(2)).toContain('Zbity, gęsty miękisz.');
    expect(ocena(4)).toContain('Równomierny miękisz.');
    expect(ocena(5)).toContain('Bardzo otwarty miękisz.');
    setLang('en');
    expect(ocena(2)).toContain('Dense, tight crumb.');
    expect(ocena(3)).toContain('Even crumb.');
    expect(ocena(5)).toContain('Very open crumb.');
  });
});

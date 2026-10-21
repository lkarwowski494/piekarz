import React from 'react';
import renderer, { act } from 'react-test-renderer';
import HarmonogramScreen from '../../app/(tabs)/receptury/harmonogram';
import { getActiveBake, setActiveBake, initDatabase } from '../data/sqlite-store';

import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { godzinaPola, ustawGodzinePlanu } from '../../tests/helpers/plan-godzina';
jest.setTimeout(20000);

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: any) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

function extractCleanText(node: any): string {
  function walk(n: any): string {
    if (typeof n === 'string' || typeof n === 'number') return String(n);
    if (!n) return '';
    if (Array.isArray(n)) return n.map(walk).join('');
    if (n.children) return walk(n.children);
    if (n.props && n.props.children) return walk(n.props.children);
    return '';
  }
  return walk(node).replace(/\s+/g, ' ').trim();
}

function findButtonByText(root: renderer.ReactTestInstance, text: string): renderer.ReactTestInstance | undefined {
  const pressables = root.findAll((n) => typeof n.props?.onPress === 'function');
  return pressables.find((p) => {
    const content = extractCleanText(p.props.children);
    return content.includes(text);
  });
}

function findAllButtonsByText(root: renderer.ReactTestInstance, text: string): renderer.ReactTestInstance[] {
  const pressables = root.findAll((n) => typeof n.props?.onPress === 'function');
  return pressables.filter((p) => {
    const content = extractCleanText(p.props.children);
    return content.includes(text);
  });
}

describe('HarmonogramScreen UI (app/(tabs)/receptury/harmonogram.tsx)', () => {
  let tree: renderer.ReactTestRenderer | null = null;

  beforeEach(async () => {
    // Zegar stały (14:00): test nie zależy od pory uruchomienia; wszystkie godziny sprawdza plan-bez-nocy-129.test.tsx
    // [M1-audytor-generalny-129; 07-jakosc-502]
    jest.useFakeTimers({ now: new Date(2026, 9, 21, 14, 0, 0, 0), doNotFake: ['nextTick', 'setImmediate', 'queueMicrotask'] });
    zUprawnieniem(); // dostęp z App Store (009): dawniej lokalny okres próbny
    jest.clearAllMocks();
    setActiveBake(null);
    await initDatabase();
  });

  afterEach(() => {
    jest.restoreAllMocks(); // zegar stały tylko w teście, który go ustawia (017)
    jest.useRealTimers();
    if (tree) {
      act(() => {
        tree?.unmount();
      });
      tree = null;
    }
  });

  it('renders reverse schedule, Sleep Guard status, and timeline stages', async () => {
    // Plan domyślny startuje od „teraz” (stan „za późno”, 107), więc kolizja ze snem zależy od godziny: zegar stały
    // o 02:00, kiedy kroki z obecnością wypadają w dzień (SYS-06; wcześniej test był czerwony np. o 10:00) [M1-audytor-generalny-017]
    jest.spyOn(Date, 'now').mockImplementation(() => new Date(2026, 9, 21, 2, 0).getTime());
    await act(async () => {
      tree = renderer.create(<HarmonogramScreen />);
      await Promise.resolve();
    });

    const root = tree!.root;
    const allText = extractCleanText(root);

    // Tytuł     expect(allText).toContain('Godzina gotowości chleba do krojenia');
    expect(allText).toContain('Ochrona snu aktywna');

    // Pole „Kiedy chleb ma być gotowy?” z godziną (chipy godziny usunięte w 128) i domyślne ustawienia
    expect(allText).toContain('Kiedy chleb ma być gotowy?');
    expect(godzinaPola(root)).toBeGreaterThanOrEqual(0);
    expect(allText).toContain('23°C');
    expect(allText).toContain('14h');

    // Stages from template
    expect(allText).toContain('Dokarmienie zakwasu');
    expect(allText).toContain('Autoliza');
    expect(allText).toContain('Garowanie chłodnicze w lodówce');
    expect(allText).toContain('Wypiek z parą i rumienienie');
    expect(allText).toContain('Studzenie na kratce');
  });

  it('allows switching target day (Dziś vs Pojutrze)', async () => {
    await act(async () => {
      tree = renderer.create(<HarmonogramScreen />);
      await Promise.resolve();
    });

    const root = tree!.root;
    const pojutrzeBtn = findButtonByText(root, 'Pojutrze');
    expect(pojutrzeBtn).toBeDefined();

    await act(async () => {
      pojutrzeBtn!.props.onPress();
      await Promise.resolve();
    });

    const allText = extractCleanText(root);
    expect(allText).toContain('Pojutrze');
  });

  it('allows fine-tuning target time with -30 min and +30 min buttons', async () => {
    await act(async () => {
      tree = renderer.create(<HarmonogramScreen />);
      await Promise.resolve();
    });

    const root = tree!.root;

    // 107: przy otwarciu pole może pokazać najwcześniejszą godzinę zamiast domyślnej, więc najpierw pojutrze 10:00
    // przyciskami obok pola (chipy godziny usunięte w 128)
    await ustawGodzinePlanu(root, 'Pojutrze', 10);
    expect(extractCleanText(root)).toContain('10:00');

    // Press +30 min
    const plus30Btn = findButtonByText(root, '+30 min');
    expect(plus30Btn).toBeDefined();

    await act(async () => {
      plus30Btn!.props.onPress();
      await Promise.resolve();
    });

    expect(extractCleanText(root)).toContain('10:30');

    // Press -30 min
    const minus30Btn = findButtonByText(root, '-30 min');
    expect(minus30Btn).toBeDefined();

    await act(async () => {
      minus30Btn!.props.onPress();
      await Promise.resolve();
    });

    expect(extractCleanText(root)).toContain('10:00');
  });

  it('adjusts temperature and recalculates fermentation duration', async () => {
    await act(async () => {
      tree = renderer.create(<HarmonogramScreen />);
      await Promise.resolve();
    });

    const root = tree!.root;

    // Switch to 26°C
    const temp26Btn = findButtonByText(root, '26°C');
    expect(temp26Btn).toBeDefined();

    await act(async () => {
      temp26Btn!.props.onPress();
      await Promise.resolve();
    });

    const allText = extractCleanText(root);
    expect(allText).toContain('26°C');
  });

  it('detects sleep collision for 18:00 target and provides one-tap auto-resolution (BR-HARMO-002 Krok czynny w nocy)', async () => {
    await act(async () => {
      tree = renderer.create(<HarmonogramScreen />);
      await Promise.resolve();
    });

    const root = tree!.root;

    // 107: „pojutrze”, żeby cel nie dał stanu „za późno” (w nim baner snu jest ukryty) niezależnie od godziny testu.
    // Target 18:00 (with standard 14h retard) causes shaping to fall around 00:15 midnight; godzina przyciskami ±30 min (128)
    await ustawGodzinePlanu(root, 'Pojutrze', 18);
    expect(godzinaPola(root)).toBe(18 * 60);

    // 116: tytuł kolizji „… wypada(ją) w nocy” zamiast „Uwaga: Kolizja ze snem!”, przycisk „Przesuń do lodówki”
    let allText = extractCleanText(root);
    expect(allText).toMatch(/wypada(ją)?( o \d\d:\d\d)? w nocy/);
    expect(allText).toContain('Przesuń do lodówki');

    // Tap the auto-resolve button
    const autoFixBtn = findButtonByText(root, 'Przesuń do lodówki');
    expect(autoFixBtn).toBeDefined();

    await act(async () => {
      autoFixBtn!.props.onPress();
      await Promise.resolve();
    });

    allText = extractCleanText(root);
    // Collision should now be resolved!
    expect(allText).toContain('Ochrona snu aktywna');
    expect(allText).not.toMatch(/wypada(ją)?( o \d\d:\d\d)? w nocy/);
  });

  it('transfers calculated schedule to Stolnica and navigates to workbench', async () => {
    await act(async () => {
      tree = renderer.create(<HarmonogramScreen />);
      await Promise.resolve();
    });

    const root = tree!.root;

    const startBakeBtn = findButtonByText(root, 'Zacznij wypiek');
    expect(startBakeBtn).toBeDefined();

    await act(async () => {
      startBakeBtn!.props.onPress();
      await Promise.resolve();
    });

    // Check sqlite store state
    const activeBake = getActiveBake();
    expect(activeBake).not.toBeNull();
    expect(activeBake?.recipeName).toBe('Klasyczny chleb rzemieślniczy'); // bez dawnej nazwy miejsca (089)
    // [M1-audytor-generalny-017] 23 °C to założenie planu, nie pomiar: bez wyboru użytkownika wypiek nie ma temperatury
    expect(activeBake?.ambientTempC).toBeUndefined();
    // [M1-audytor-generalny-017] bez pomiaru nie ma DDT (wcześniej stałe 25.0)
    expect(activeBake?.actualDdtC).toBeUndefined();

    // Check navigation
    expect(mockPush).toHaveBeenCalledWith('/stolnica');
  });

  it('copies schedule to clipboard when copy button is pressed', async () => {
    const scheduleFormatter = require('../lib/schedule-formatter');
    const copySpy = jest.spyOn(scheduleFormatter, 'copyScheduleToClipboard').mockResolvedValue(true);

    await act(async () => {
      tree = renderer.create(<HarmonogramScreen />);
      await Promise.resolve();
    });

    const root = tree!.root;
    const copyBtn = root.findByProps({ testID: 'copy-schedule-btn' });
    expect(copyBtn).toBeDefined();

    await act(async () => {
      await copyBtn.props.onPress();
    });

    expect(copySpy).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ ambientTempC: 23 })
    );
  });

  // Scenariusze wypieku usunięte z planu według wzorca `plan-sen` [M1-audytor-generalny-128; 04-studio-projektowe-501];
  // czas w lodówce wybiera się chipami pod listą kroków
  it('cold retard chips under the steps change the plan (scenarios removed in 128)', async () => {
    await act(async () => {
      tree = renderer.create(<HarmonogramScreen />);
      await Promise.resolve();
    });

    const root = tree!.root;
    expect(root.findAll((n) => typeof n.props?.testID === 'string' && n.props.testID.startsWith('scenario-'))).toHaveLength(0);

    await act(async () => {
      findButtonByText(root, '18h')!.props.onPress();
      await Promise.resolve();
    });
    expect(extractCleanText(root)).toContain('Czas w lodówce: 18h');
  });

  it('allows customizing Sleep Guard hours via sleep profiles', async () => {
    await act(async () => {
      tree = renderer.create(<HarmonogramScreen />);
      await Promise.resolve();
    });

    const root = tree!.root;

    // Initially standard profile: 23:00 - 06:30
    let allText = extractCleanText(root);
    expect(allText).toContain('23:00 – 06:30');

    // Select early bird profile (22:00 - 06:00)
    const earlyBird = root.findByProps({ testID: 'sleep-profile-early_bird' });
    expect(earlyBird).toBeDefined();

    await act(async () => {
      earlyBird.props.onPress();
      await Promise.resolve();
    });

    allText = extractCleanText(root);
    expect(allText).toContain('22:00 – 06:00');

    // Select night owl profile (00:00 - 08:00)
    const nightOwl = root.findByProps({ testID: 'sleep-profile-night_owl' });
    expect(nightOwl).toBeDefined();

    await act(async () => {
      nightOwl.props.onPress();
      await Promise.resolve();
    });

    allText = extractCleanText(root);
    expect(allText).toContain('00:00 – 08:00');
  });
});

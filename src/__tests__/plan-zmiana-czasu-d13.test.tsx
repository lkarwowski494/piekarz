/**
 * D-13 (D-093) [M3 D0]: plan w dniu wiosennej zmiany czasu w Warszawie (2027-03-28); opis wspólny w
 * helpers/plan-zmiana-czasu.tsx. Nowy Jork (2027-03-14): plan-zmiana-czasu-d13-nowy-jork.test.tsx.
 */
import { opiszPlanWDniuZmianyCzasu } from './helpers/plan-zmiana-czasu';

jest.setTimeout(30000);
jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: any) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

opiszPlanWDniuZmianyCzasu('Europe/Warsaw', [2027, 3, 26, 14], [2027, 3, 19, 14]);

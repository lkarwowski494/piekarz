/**
 * D-13 (D-093) [M3 D0]: plan w dniu wiosennej zmiany czasu w Nowym Jorku (2027-03-14); opis wspólny w
 * helpers/plan-zmiana-czasu.tsx. Warszawa (2027-03-28): plan-zmiana-czasu-d13.test.tsx.
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

opiszPlanWDniuZmianyCzasu('America/New_York', new Date(2027, 2, 12, 14, 0, 0, 0), new Date(2027, 2, 5, 14, 0, 0, 0));

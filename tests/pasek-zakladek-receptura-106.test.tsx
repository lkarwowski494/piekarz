// 106: ekran receptury (push w stosie zakładki) ukrywa pasek zakładek; lista receptur go pokazuje
// (design-spec §11c 106: „Ekran receptury ukrywa pasek zakładek”). [M1-audytor-generalny-106; 04-studio-projektowe-022]
import React from 'react';
import renderer, { act } from 'react-test-renderer';

const mockEkrany: Array<{ name: string; options: unknown }> = [];
jest.mock('expo-router', () => {
  const Tabs = ({ children }: { children: React.ReactNode }) => <>{children}</>;
  Tabs.Screen = ({ name, options }: { name: string; options: unknown }) => {
    mockEkrany.push({ name, options });
    return null;
  };
  return { Tabs };
});

import TabsLayout from '../app/(tabs)/_layout';

type Opcje = { tabBarStyle?: { display?: string } };
const opcjeReceptur = (trasa: unknown): Opcje => {
  const e = mockEkrany.find((x) => x.name === 'receptury');
  const o = e?.options;
  return (typeof o === 'function' ? o({ route: trasa }) : o) as Opcje;
};
const trasa = (ekran?: string) => ({
  key: 'receptury-1',
  name: 'receptury',
  state: ekran ? { index: 1, routes: [{ name: 'index', key: 'a' }, { name: ekran, key: 'b' }] } : undefined,
});

describe('106 pasek zakładek na ekranie receptury',() => {
  beforeAll(async () => {
    await act(async () => {
      renderer.create(<TabsLayout />);
    });
  });

  it('ekran receptury ukrywa pasek zakładek', () => {
    expect(opcjeReceptur(trasa('receptura')).tabBarStyle?.display).toBe('none');
  });

  it('bez paska strefa akcji ekranu receptury ma dolny margines systemu (wskaźnik Home)', () => {
    const zrodlo = require('fs').readFileSync(require('path').join(__dirname, '../app/(tabs)/receptury/receptura.tsx'), 'utf8');
    expect(zrodlo).toMatch(/<SafeAreaView[^>]*edges=\{\[[^\]]*'bottom'/);
  });

  it('lista receptur i plan wypieku pokazują pasek', () => {
    expect(opcjeReceptur(trasa()).tabBarStyle?.display).not.toBe('none');
    expect(opcjeReceptur(trasa('index')).tabBarStyle?.display).not.toBe('none');
    expect(opcjeReceptur(trasa('harmonogram')).tabBarStyle?.display).not.toBe('none');
  });
});

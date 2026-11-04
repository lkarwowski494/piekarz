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

  // Plan wypieku od D-219 (04-004) bez paska pod „Zacznij wypiek”, jak receptura; lista dalej z paskiem.
  // Zastępuje asercję „plan wypieku pokazuje pasek” (D-219, warunki D-194) [M3 p7b]
  it('lista receptur pokazuje pasek', () => {
    expect(opcjeReceptur(trasa()).tabBarStyle?.display).not.toBe('none');
    expect(opcjeReceptur(trasa('index')).tabBarStyle?.display).not.toBe('none');
  });

  it('plan wypieku ukrywa pasek zakładek (04-004, D-219), także po wejściu z receptury i z Doktora Chleba', () => {
    expect(opcjeReceptur(trasa('harmonogram')).tabBarStyle?.display).toBe('none');
    // Stos receptur: lista → receptura → plan (wejście „Ułóż plan”)
    const zReceptury = { key: 'receptury-1', name: 'receptury', state: { index: 2, routes: [{ name: 'index', key: 'a' }, { name: 'receptura', key: 'b' }, { name: 'harmonogram', key: 'c' }] } };
    expect(opcjeReceptur(zReceptury).tabBarStyle?.display).toBe('none');
    // Powrót z planu do receptury: pasek dalej ukryty; do listy: pasek wraca
    expect(opcjeReceptur({ ...zReceptury, state: { ...zReceptury.state, index: 1 } }).tabBarStyle?.display).toBe('none');
    expect(opcjeReceptur({ ...zReceptury, state: { ...zReceptury.state, index: 0 } }).tabBarStyle?.display).not.toBe('none');
  });

  it('bez paska strefa „Zacznij wypiek” planu ma dolny margines systemu (wskaźnik Home), poza przewijaniem', () => {
    const czytaj = (plik: string) => require('fs').readFileSync(require('path').join(__dirname, '..', plik), 'utf8');
    expect(czytaj('src/components/harmonogram/PasekStartu.tsx')).toMatch(/<SafeAreaView[^>]*edges=\{\[[^\]]*'bottom'/);
    const plan = czytaj('app/(tabs)/receptury/harmonogram.tsx');
    // PasekStartu po zamknięciu przewijania (EkranZPasem), więc zawsze nad wskaźnikiem Home
    expect(plan.indexOf('<PasekStartu')).toBeGreaterThan(plan.indexOf('</EkranZPasem>'));
    // Ekran planu nie dodaje drugiego dolnego marginesu nad paskiem startu
    expect(plan).toMatch(/<SafeAreaView[^>]*edges=\{\['left', 'right'\]\}/);
  });

  it('nawigacja do planu bez zmian: „Ułóż plan” na recepturze i Doktor Chleba otwierają ten sam ekran stosu receptur', () => {
    const czytaj = (plik: string) => require('fs').readFileSync(require('path').join(__dirname, '..', plik), 'utf8');
    expect(czytaj('app/(tabs)/receptury/receptura.tsx')).toContain("router.push('/receptury/harmonogram')");
    expect(czytaj('app/doktor.tsx')).toContain("router.push('/receptury/harmonogram')");
  });
});

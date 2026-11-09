/**
 * M1-audytor-generalny-007 (04-studio-projektowe-003, DEC-10 a, D-139, D-141, README systemu kart §1, §3): arkusze
 * na systemie kart. (1) Każdy `Modal` z `presentationStyle="pageSheet"` w `src/` jest w `ArkuszKart` albo na liście
 * wyjątków z powodem i ID — lista arkuszy pochodzi z kodu (grep), nie z pamięci: nowy arkusz poza systemem bez wpisu
 * przewraca test. (2) Siedem arkuszy ze znaleziska renderuje pasek arkusza i karty, a żaden nagłówek nie leży na tle
 * poza paskiem arkusza i kartą („na tle ekranu nie leży żaden goły nagłówek”, README §1).
 */
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, edges: _e, ...p }: { children?: React.ReactNode; edges?: unknown }) => React.createElement('View', p, children),
    SafeAreaProvider: ({ children }: { children?: React.ReactNode }) => children,
    useSafeAreaInsets: () => ({ top: 47, left: 0, right: 0, bottom: 34 }),
  };
});

import fs from 'fs';
import path from 'path';
import React from 'react';
import renderer, { act, type ReactTestInstance } from 'react-test-renderer';
import { ArkuszKart, PasekArkusza } from '../components/arkusz/ArkuszKart';
import { Karta } from '../ui/karty/Karta';
import { PlanWypiekuArkusz } from '../components/stolnica/PlanWypiekuArkusz';
import { PoCoTenKrokArkusz } from '../components/stolnica/PoCoTenKrokArkusz';
import { TemperaturaWodySheet } from '../components/calculator/TemperaturaWodySheet';
import { ArkuszDnia } from '../components/kalendarz/ArkuszDnia';
import { ArkuszPlanu } from '../components/start/ArkuszPlanu';
import { ImportRecipeModal } from '../components/ImportRecipeModal';
import { ImportZPlikuArkusz } from '../components/settings/ImportZPlikuArkusz';
import type { SessionStep } from '../core/bake-steps';
import type { DoughRecipeResult } from '../core/domain-rules';
import type { PlannedBake } from '../data/bake-sessions-store';

const KORZEN = path.resolve(__dirname, '..', '..');

/** Arkusze `pageSheet` poza `ArkuszKart`, z powodem: każdy wpis ma ID decyzji albo znaleziska. */
const WYJATKI: Record<string, string> = {
  // Na systemie kart bez ArkuszKart: własny pasek „Gotowe” i sekcje jako karty (README §4 „Arkusz Składniki”, D-160 p3)
  'src/components/receptury/SkladnikiSheet.tsx': 'D-160 p3, karty w treści',
  // Ustawienia: sekcje jako karty, pasek z podekranami (README §4 „Ustawienia”, D-160 p5)
  'src/components/SettingsModal.tsx': 'D-160 p5, karty w sekcjach',
  // Poza zakresem 04-studio-projektowe-003 (siedem arkuszy); zgłoszone jako nowe znalezisko roli 04 w fix 2026-11-09
  'src/components/stolnica/ZgodaPowiadomien.tsx': '04-studio-projektowe-007 (nowe, poza 003)',
  'src/components/BreadAcademyModal.tsx': '04-studio-projektowe-007 (nowe, poza 003)',
  'src/components/FlourEquivalentsModal.tsx': '04-studio-projektowe-007 (nowe, poza 003)',
  'src/components/VolumeConverterModal.tsx': '04-studio-projektowe-007 (nowe, poza 003)',
  'src/components/FlourBlendModal.tsx': '04-studio-projektowe-007 (nowe, poza 003)',
  'src/components/FlourInventoryModal.tsx': '04-studio-projektowe-007 (nowe, poza 003)',
};

/** Siedem arkuszy z 04-studio-projektowe-003: nie mogą trafić na listę wyjątków (DEC-10 a: przenieść). */
const SIEDEM = [
  'src/components/stolnica/PlanWypiekuArkusz.tsx',
  'src/components/stolnica/PoCoTenKrokArkusz.tsx',
  'src/components/calculator/TemperaturaWodySheet.tsx',
  'src/components/kalendarz/ArkuszDnia.tsx',
  'src/components/start/ArkuszPlanu.tsx',
  'src/components/ImportRecipeModal.tsx',
  'src/components/settings/ImportZPlikuArkusz.tsx',
];

function plikiTsx(kat: string): string[] {
  return fs.readdirSync(kat, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(kat, e.name);
    if (e.isDirectory()) return e.name === '__tests__' ? [] : plikiTsx(p);
    return /\.tsx?$/.test(e.name) ? [p] : [];
  });
}

describe('arkusze pageSheet na systemie kart (M1-audytor-generalny-007; 04-studio-projektowe-003)', () => {
  const arkusze = plikiTsx(path.join(KORZEN, 'src'))
    .filter((p) => /presentationStyle="pageSheet"/.test(fs.readFileSync(p, 'utf8')))
    .map((p) => path.relative(KORZEN, p).split(path.sep).join('/'))
    .filter((p) => p !== 'src/components/arkusz/ArkuszKart.tsx');

  it('każdy własny Modal pageSheet w src/ jest na liście wyjątków z ID (reszta przez ArkuszKart)', () => {
    const bezWpisu = arkusze.filter((p) => !(p in WYJATKI));
    expect(bezWpisu).toEqual([]);
  });

  it('siedem arkuszy ze znaleziska używa ArkuszKart i nie ma ich na liście wyjątków', () => {
    for (const p of SIEDEM) {
      const kod = fs.readFileSync(path.join(KORZEN, p), 'utf8');
      expect({ p, arkuszKart: /<ArkuszKart\b/.test(kod), wyjatek: p in WYJATKI }).toEqual({ p, arkuszKart: true, wyjatek: false });
    }
  });

  it('lista wyjątków nie trzyma plików, których już nie ma albo które nie są arkuszem', () => {
    for (const p of Object.keys(WYJATKI)) expect({ p, arkusz: arkusze.includes(p) }).toEqual({ p, arkusz: true });
  });
});

// --- render: pasek arkusza, karty i brak gołego nagłówka na tle ---

const krok = (id: string, name: string, plannedStart: number | null = null): SessionStep => ({
  id, name, category: 'mix', durationMin: 30, isPassive: false, instructions: '', plannedStart, plannedEnd: null,
});
const KROKI = [krok('a', 'Mieszanie i autoliza', 1_800_000_000_000), krok('b', 'Fermentacja w misce', 1_800_000_900_000)];
const RECEPTURA = {
  targetDoughWeightGrams: 900, baseFlourWeightGrams: 500, waterGrams: 350, saltGrams: 10, starterGrams: 100,
  overallHydrationPercent: 72,
} as unknown as DoughRecipeResult;
const PLAN: PlannedBake = { version: 1, id: 'p1', recipeName: 'Chleb pszenny', plannedStartAt: 1_800_000_000_000, steps: KROKI };
const TERAZ = 1_799_990_000_000;

const PRZYPADKI: [string, () => React.ReactElement][] = [
  ['Plan wypieku', () => (
    <PlanWypiekuArkusz visible onClose={jest.fn()} steps={KROKI} currentStepIdx={0} onGoToStep={jest.fn()}
      calculatedRecipe={RECEPTURA} unitSystem="metric" onPrzerwij={jest.fn()} />
  )],
  ['Po co ten krok', () => (
    <PoCoTenKrokArkusz zdania={[{ id: 'X-1', tekst: 'Zdanie wyjaśnienia.' }] as never} nazwaKroku="Składanie" onClose={jest.fn()} />
  )],
  ['Temperatura wody', () => (
    <TemperaturaWodySheet visible onClose={jest.fn()} targetDdt={25} onTargetDdtChange={jest.fn()} waterTempTarget={20} />
  )],
  ['arkusz dnia', () => (
    <ArkuszDnia tryb={{ dzien: '2027-01-15', ms: TERAZ }} zdarzenia={[]} o={{ now: TERAZ, wieleWypiekow: false }}
      akcje={{ onZrobione: jest.fn(), onPomin: jest.fn() }} onPrzejdz={jest.fn()} onClose={jest.fn()} />
  )],
  ['najbliższe dni', () => (
    <ArkuszDnia tryb={{ najblizsze: true }} zdarzenia={[]} o={{ now: TERAZ, wieleWypiekow: false }}
      akcje={{ onZrobione: jest.fn(), onPomin: jest.fn() }} onPrzejdz={jest.fn()} onClose={jest.fn()} />
  )],
  ['arkusz planu', () => <ArkuszPlanu plan={PLAN} teraz={TERAZ} onZacznij={jest.fn()} onUsun={jest.fn()} onClose={jest.fn()} />],
  ['import receptury', () => <ImportRecipeModal visible onClose={jest.fn()} onImportSuccess={jest.fn()} />],
  ['import z pliku', () => <ImportZPlikuArkusz onClose={jest.fn()} onRecipeImported={jest.fn()} />],
];

/** Nagłówek (accessibilityRole="header") poza paskiem arkusza i poza kartą leży goły na tle arkusza (README §1). */
function nagłówkiPozaSystemem(root: ReactTestInstance): string[] {
  const wSystemie = (n: ReactTestInstance | null): boolean => {
    for (let x = n; x; x = x.parent) if (x.type === PasekArkusza || x.type === Karta) return true;
    return false;
  };
  return root
    .findAll((n) => typeof n.type === 'string' && n.props.accessibilityRole === 'header')
    .filter((n) => !wSystemie(n))
    .map((n) => String(n.props.children));
}

describe.each(PRZYPADKI)('%s: ArkuszKart z kartami (D-139, README §1)', (_nazwa, el) => {
  let tree: renderer.ReactTestRenderer | null = null;
  afterEach(() => {
    if (tree) act(() => tree?.unmount());
    tree = null;
  });

  it('ma pasek arkusza, co najmniej jedną kartę i żadnego nagłówka na tle poza paskiem i kartą', async () => {
    await act(async () => {
      tree = renderer.create(el());
    });
    const root = tree!.root;
    expect(root.findAllByType(ArkuszKart)).toHaveLength(1);
    expect(root.findAllByType(Karta).length).toBeGreaterThan(0);
    expect(nagłówkiPozaSystemem(root)).toEqual([]);
  });
});

// „Dodaj” importu z pliku w pasku arkusza: nieczynny w trakcie zapisu, jak dawny przycisk w pasku (bez podwójnego zapisu)
describe('PasekArkusza: przycisk nieczynny (import z pliku w ArkuszKart)', () => {
  it('wylaczony przechodzi do przycisku jako disabled z accessibilityState', () => {
    let tree: renderer.ReactTestRenderer | null = null;
    act(() => {
      tree = renderer.create(<PasekArkusza prawy={{ tekst: 'Dodaj', onPress: jest.fn(), testID: 'dodaj', wylaczony: true }} />);
    });
    const host = tree!.root.findAll((n) => n.props.testID === 'dodaj' && n.props.accessibilityState !== undefined);
    expect(host.length).toBeGreaterThan(0);
    expect(host[0].props.accessibilityState).toEqual({ disabled: true });
    expect(host[0].props.disabled).toBe(true);
    act(() => tree!.unmount());
  });
});

// Opis pod nagłówkiem karty „Temperatura wody” (dawny akapit nad wynikiem) zostaje w arkuszu jako podpis karty
it('Temperatura wody: opis jako podpis karty, nie akapit na tle', async () => {
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(<TemperaturaWodySheet visible onClose={jest.fn()} targetDdt={25} onTargetDdtChange={jest.fn()} waterTempTarget={20} />);
  });
  const podpis = tree!.root.findAll((n) => n.props.testID === 'karta-temperatury-wody-podpis' && typeof n.type === 'string');
  expect(podpis.map((n) => n.props.children)).toEqual(['Właściwa temperatura wody zapewnia docelową temperaturę ciasta po wymieszaniu.']);
  act(() => tree!.unmount());
});

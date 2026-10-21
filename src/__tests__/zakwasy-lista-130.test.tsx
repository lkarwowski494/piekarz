/**
 * Lista zakwasów pokazuje przy każdym zakwasie miejsce i czas od ostatniego dokarmienia, nie tylko nazwę
 * [M1-audytor-generalny-130; 01-odkrywanie-501].
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { StartersSelectorRow } from '../components/zakwas/StartersSelectorRow';
import type { StoredStarter } from '../data/db';
import { setLang } from '../lib/i18n';

const H = 3_600_000;
const teraz = new Date(2026, 9, 21, 14, 0).getTime();
const zakwas = (id: string, name: string, storageState: StoredStarter['storageState'], lastFedAt?: number): StoredStarter => ({
  id, name, flourType: 'zytnia', hydration: 100, birthDate: teraz - 90 * 24 * H, storageState, ...(lastFedAt ? { lastFedAt } : {}),
});
const tekst = (n: renderer.ReactTestInstance): string => n.children.map((c) => (typeof c === 'string' ? c : tekst(c))).join('');

describe('Lista zakwasów (130)', () => {
  beforeEach(() => {
    setLang('pl');
    jest.spyOn(Date, 'now').mockReturnValue(teraz);
  });
  afterEach(() => jest.restoreAllMocks());

  it('dwa zakwasy: każdy z miejscem (blat albo lodówka) i czasem od ostatniego dokarmienia (BR-ZAKW-001 Dwa zakwasy)', () => {
    let tree: renderer.ReactTestRenderer | null = null;
    act(() => {
      tree = renderer.create(
        <StartersSelectorRow
          startersList={[zakwas('z1', 'Żytni', 'ROOM_TEMP', teraz - 6 * H), zakwas('z2', 'Pszenny', 'FRIDGE', teraz - 3 * 24 * H), zakwas('z3', 'Nowy', 'ROOM_TEMP')]}
          activeStarterId="z1"
          onSelectStarter={() => {}}
          onOpenAddModal={() => {}}
        />,
      );
    });
    const zyt = tekst(tree!.root.findByProps({ testID: 'select-starter-z1' }));
    const psz = tekst(tree!.root.findByProps({ testID: 'select-starter-z2' }));
    expect(zyt).toContain('Żytni');
    expect(zyt).toContain('na blacie');
    expect(zyt).toMatch(/6 godzin od dokarmienia/);
    expect(psz).toContain('w lodówce');
    expect(psz).toMatch(/od dokarmienia/);
    // bez wpisu dokarmienia: samo miejsce, bez zgadywanego czasu
    const nowy = tekst(tree!.root.findByProps({ testID: 'select-starter-z3' }));
    expect(nowy).toContain('na blacie');
    expect(nowy).not.toContain('od dokarmienia');
    act(() => tree!.unmount());
  });
});

/**
 * Ustawienie „Sprzęt i naczynie do wypieku” usunięte: nic go nie czytało, a plan bierze naczynie z receptury (D-304)
 * [M1-audytor-generalny-060; 03-zakres-004, opcja a]. Zapisana wartość zostaje w bazie i kopii (bez migracji).
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import fs from 'fs';
import path from 'path';
import { SettingsModal } from '../components/SettingsModal';
import { initDatabase, _resetMemStore } from '../data/sqlite-store';

describe('060: bez wyboru naczynia w Ustawieniach', () => {
  it('Ustawienia nie mają karty naczynia', async () => {
    _resetMemStore();
    await initDatabase();
    let tree!: renderer.ReactTestRenderer;
    await act(async () => { tree = renderer.create(<SettingsModal visible onClose={() => {}} />); });
    expect(tree.root.findAllByProps({ testID: 'karta-naczynie' })).toHaveLength(0);
    act(() => tree.unmount());
  });
  it('kopia zapasowa nadal przyjmuje klucz selected_baking_vessel', () => {
    const s = fs.readFileSync(path.join(__dirname, '..', 'data', 'ustawienia-kopii.ts'), 'utf8');
    expect(s).toContain("'selected_baking_vessel'");
  });
});

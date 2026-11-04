/**
 * M3 p7 (D-214, znalezisko 04-studio-projektowe-007; słownik interakcji „Odrzucić zmiany?”: [Wróć do edycji]
 * [Odrzuć zmiany]; istniejące `confirmDiscard`): zamknięcie zmienionego formularza — „Anuluj” w pasku arkusza albo
 * przesunięcie arkusza w dół (`onRequestClose`) — pyta o odrzucenie zmian; niezmieniony formularz zamyka się bez
 * pytania. Arkusze z polami: ocena po wypieku, zapis receptury, dodanie i edycja zakwasu. Zapis bez zmian.
 */
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, edges: _e, ...p }: { children?: React.ReactNode; edges?: unknown }) => React.createElement('View', p, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

import React from 'react';
import { Alert, Modal, type AlertButton } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { FinishBakeModal, type FinishBakeModalProps } from '../components/stolnica/FinishBakeModal';
import { SaveRecipeModal, type SaveRecipeModalProps } from '../components/calculator/SaveRecipeModal';
import { AddStarterModal, type AddStarterModalProps } from '../components/zakwas/AddStarterModal';
import { EditStarterModal, type EditStarterModalProps } from '../components/zakwas/EditStarterModal';
import { DEFAULT_BREAD_SENSORY_PROFILE } from '../components/SensoryRadarChart';
import { setLang } from '../lib/i18n';

type Wezel = renderer.ReactTestInstance;
const tekst = (n: Wezel | string): string => (typeof n === 'string' ? n : n.children.map(tekst).join(''));

interface Formularz {
  nazwa: string;
  /** Element z `onClose` i, gdy `zmien`, ze zmienioną jedną wartością (jak po wpisaniu przez użytkownika). */
  el: (onClose: () => void, zmien: boolean) => React.ReactElement;
}
const noop = () => undefined;
const finish = (onClose: () => void, zmien: boolean) => {
  const p: FinishBakeModalProps = {
    visible: true, onClose, onSave: noop, rating: 3, onRatingChange: noop, notes: zmien ? 'Za krótko w piecu' : '', onNotesChange: noop,
    crumbScore: 3, onCrumbScoreChange: noop, crustScore: 3, onCrustScoreChange: noop, tasteProfile: 'balanced', onTasteProfileChange: noop,
    sensoryProfile: DEFAULT_BREAD_SENSORY_PROFILE, onSensoryProfileChange: noop,
  };
  return <FinishBakeModal {...p} />;
};
const zapis = (onClose: () => void, zmien: boolean) => {
  const p: SaveRecipeModalProps = { visible: true, recipeName: zmien ? 'Wiejski mój' : 'Wiejski', onRecipeNameChange: noop, onClose, onSave: noop };
  return <SaveRecipeModal {...p} />;
};
const dodanie = (onClose: () => void, zmien: boolean) => {
  const p: AddStarterModalProps = { visible: true, name: zmien ? 'Bolek' : '', onNameChange: noop, flour: 'Żytnia', onFlourChange: noop, storage: 'ROOM_TEMP', onStorageChange: noop, onClose, onSave: noop };
  return <AddStarterModal {...p} />;
};
const edycja = (onClose: () => void, zmien: boolean) => {
  const p: EditStarterModalProps = {
    visible: true, name: 'Zakwas', onNameChange: noop, flourType: 'Żytnia', onFlourTypeChange: noop, storageState: zmien ? 'ROOM_TEMP' : 'FRIDGE',
    onStorageStateChange: noop, canDelete: true, onDelete: noop, onClose, onSave: noop,
  };
  return <EditStarterModal {...p} />;
};
const FORMULARZE: Formularz[] = [
  { nazwa: 'ocena po wypieku', el: finish },
  { nazwa: 'zapis receptury', el: zapis },
  { nazwa: 'dodanie zakwasu', el: dodanie },
  { nazwa: 'edycja zakwasu', el: edycja },
];

function zamontuj(f: Formularz, onClose: () => void, zmien: boolean): renderer.ReactTestRenderer {
  let tree!: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(f.el(onClose, false));
  });
  if (zmien) act(() => tree.update(f.el(onClose, true)));
  return tree;
}
const anuluj = (root: Wezel) => {
  const p = root.findAll((n) => typeof n.type !== 'string' && n.props.accessibilityRole === 'button' && typeof n.props.onPress === 'function' && tekst(n) === 'Anuluj');
  expect(p).toHaveLength(1);
  act(() => p[0].props.onPress());
};
const przesun = (root: Wezel) => act(() => root.findByType(Modal).props.onRequestClose());

describe('M3 p7 (04-007): „Odrzucić zmiany?” przy zamknięciu zmienionego formularza', () => {
  let alert: jest.SpyInstance;
  beforeEach(() => {
    setLang('pl');
    alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  });
  afterEach(() => jest.restoreAllMocks());

  describe.each(FORMULARZE)('$nazwa', (f) => {
    it.each([['„Anuluj”', anuluj], ['przesunięcie w dół', przesun]] as const)('zmieniony + %s: pytanie, zamknięcie dopiero po „Odrzuć zmiany”', (_n, zamknij) => {
      const onClose = jest.fn();
      const tree = zamontuj(f, onClose, true);
      zamknij(tree.root);
      expect(onClose).not.toHaveBeenCalled();
      expect(alert).toHaveBeenCalledTimes(1);
      expect(alert.mock.calls[0][0]).toBe('Odrzucić zmiany?');
      const przyciski = (alert.mock.calls[0][2] ?? []) as AlertButton[];
      expect(przyciski.map((b) => b.text)).toEqual(['Wróć do edycji', 'Odrzuć zmiany']);
      act(() => przyciski[1].onPress?.());
      expect(onClose).toHaveBeenCalledTimes(1);
      act(() => tree.unmount());
    });

    it.each([['„Anuluj”', anuluj], ['przesunięcie w dół', przesun]] as const)('niezmieniony + %s: zamyka bez pytania', (_n, zamknij) => {
      const onClose = jest.fn();
      const tree = zamontuj(f, onClose, false);
      zamknij(tree.root);
      expect(alert).not.toHaveBeenCalled();
      expect(onClose).toHaveBeenCalledTimes(1);
      act(() => tree.unmount());
    });
  });
});

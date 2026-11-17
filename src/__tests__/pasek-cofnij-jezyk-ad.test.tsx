/**
 * Paski „Cofnij” po zmianie języka (KO-072, recenzja AC-01, brzegowe z punktu 5, D-427): tekst paska jest liczony w `useMemo`
 * z `t()`; bez języka w zależnościach pasek widoczny w chwili zmiany języka (np. z VoiceOver, gdy nie znika po 6 s) zostawał
 * w starym języku. Hooki: useCofnijDokarmienie (zakwas) i usePlanyDzis (usunięty plan na „Dziś”).
 */
jest.mock('../lib/plany-akcje', () => ({
  ...jest.requireActual('../lib/plany-akcje'),
  usunPlan: jest.fn(async () => undefined),
}));

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { useCofnijDokarmienie } from '../hooks/useCofnijDokarmienie';
import { usePlanyDzis } from '../hooks/usePlanyDzis';
import type { PlannedBake } from '../data/bake-sessions-store';
import type { StoredStarter } from '../data/db';
import { setLang, useLang } from '../lib/i18n';

afterEach(() => setLang('pl'));

// Stałe wywołania zwrotne (KO-073, AD-01): strzałki inline zmieniałyby tożsamość `przywroc` w każdym renderze i `useMemo` paska
// przeliczałby się niezależnie od `jezyk`, więc test nie odróżniałby poprawki od jej braku. Ekran w aplikacji ma stałe wywołania.
const NIC = () => undefined;
const DOSTEP = (_f: unknown, fn: () => void) => fn();

function zamontuj<T>(uzyj: () => T) {
  const wynik: { biezacy: T | null } = { biezacy: null };
  function Probka() {
    useLang(); // komponent subskrybuje język jak ekran z `useEkranZPasem`; sam hook nie jest jedynym powodem przerysowania
    wynik.biezacy = uzyj();
    return null;
  }
  let tree!: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(<Probka />);
  });
  return { tree, wynik: () => wynik.biezacy as T };
}

describe('pasek „Cofnij” przelicza tekst po zmianie języka (AC-01, brzegowe)', () => {
  it('useCofnijDokarmienie: „Zapisano dokarmienie…” pl → en na widocznym pasku', () => {
    setLang('pl');
    const h = zamontuj(() => useCofnijDokarmienie(NIC));
    act(() => h.wynik().zapamietaj({ id: 'z1', name: 'Rysia' } as StoredStarter, 1000));
    expect(h.wynik().pasek?.tekst).toBe('Zapisano dokarmienie zakwasu Rysia.');
    act(() => setLang('en'));
    expect(h.wynik().pasek?.tekst).not.toContain('Zapisano');
    expect(h.wynik().pasek?.tekst).toContain('Rysia');
    act(() => h.tree.unmount());
  });

  it('usePlanyDzis: „Usunięto plan wypieku” pl → en na widocznym pasku', async () => {
    setLang('pl');
    const h = zamontuj(() => usePlanyDzis({ onZmiana: NIC, otworzWypiek: NIC, requireActionAccess: DOSTEP }));
    await act(async () => {
      h.wynik().usun({ id: 'p1' } as PlannedBake);
      for (let i = 0; i < 10; i++) await Promise.resolve();
    });
    expect(h.wynik().cofnij?.tekst).toBe('Usunięto plan wypieku');
    act(() => setLang('en'));
    expect(h.wynik().cofnij?.tekst).not.toBe('Usunięto plan wypieku');
    act(() => h.tree.unmount());
  });
});

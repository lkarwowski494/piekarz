/**
 * `useLang` nie gubi zmiany języka między renderem a subskrypcją w efekcie (KO-072, recenzja AC-05, D-427). Po limicie startu
 * (D-425) ekrany montują się przed spóźnionym `setLang`; zmiana trafiająca w okno między renderem a `useEffect` zostawiała
 * ekran w starym języku, bo słuchacz jeszcze nie istniał.
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { lang, setLang, useLang } from '../i18n';

afterEach(() => setLang('pl'));

it('setLang w oknie między renderem a efektem: komponent kończy w aktualnym języku', () => {
  setLang('pl');
  let ostatni = '';
  let jednorazowo = true;
  function Probka() {
    const l = useLang();
    ostatni = l;
    // Zmiana języka po odczytaniu stanu w renderze, przed subskrypcją w efekcie (efekty ruszają po zatwierdzeniu renderu)
    if (jednorazowo) {
      jednorazowo = false;
      setLang('en');
    }
    return null;
  }
  let tree!: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(<Probka />);
  });
  expect(lang()).toBe('en');
  expect(ostatni).toBe('en');
  act(() => tree.unmount());
});

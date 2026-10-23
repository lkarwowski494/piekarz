// ============================================================================
// PRZ-33 (przegląd roli 04, D-117): sekcja „Zakupy” w Ustawieniach używa tokenów typografii (nagłówek 17, objaśnienie 15)
// zamiast rozmiarów na sztywno i nie podkreśla przycisków (podkreślenie tylko w linkach).
// ============================================================================
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ZakupySection } from '../settings/ZakupySection';
import { typografia } from '../../ui/tokeny';

describe('PRZ-33: ZakupySection', () => {
  it('tytuł sekcji ma rozmiar nagłówka z tokenów, przyciski rozmiar objaśnienia i bez podkreślenia', () => {
    let t!: renderer.ReactTestRenderer;
    act(() => {
      t = renderer.create(<ZakupySection onOtworzPro={() => undefined} />);
    });
    const stylTekstu = (tekst: string) => {
      const n = t.root.findAllByType(Text).find((x) => [x.props.children].flat().join('') === tekst);
      expect(n).toBeDefined();
      return StyleSheet.flatten(n!.props.style) as { fontSize?: number; textDecorationLine?: string };
    };
    expect(stylTekstu('Zakupy').fontSize).toBe(typografia.style.naglowek.pt);
    for (const przycisk of ['Piekarz Pro', 'Przywróć zakupy', 'Zarządzaj subskrypcją', 'Zrealizuj kod']) {
      const s = stylTekstu(przycisk);
      expect(s.fontSize).toBe(typografia.style.objasnienie.pt);
      expect(s.textDecorationLine).toBeUndefined();
    }
    act(() => t.unmount());
  });
});

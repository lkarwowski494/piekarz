/**
 * Punkt listy „Co zrobić przy następnym wypieku” w Doktorze (L004-13-P1-1, KO-067/KO-068, D-422). Zrzuty #13
 * (`id|ms/iphone-6.3/04-doktor.png`): tekst rysowany o wiersz dłużej niż pole i przycięty. Poprawka jest HIPOTEZĄ
 * (usuwa znane źródła niedoszacowania wysokości tekstu iOS w wierszu flex); potwierdzi ją dopiero przebieg zrzutów.
 * To KONTROLA ZASTĘPCZA stylu, nie dowód zachowania natywnego: tekst w wierszu nie ma `flex: 1` bez `flexShrink` i
 * `minWidth: 0` oraz nie ma stałej wysokości wiersza mniejszej od naturalnej (Dynamic Type do AX5).
 */
import React from 'react';
import { StyleSheet } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { DiagnosisResultCard } from '../DiagnosisResultCard';
import { diagnoseBreadDefect } from '../../../doctor/diagnostics';
import { setLang } from '../../../lib/i18n';

afterEach(() => setLang('pl'));

describe('punkt listy Doktora: styl tekstu w wierszu flex (D-422, kontrola zastępcza)', () => {
  it('tekst punktu: flexShrink 1 i minWidth 0 zamiast flex 1; bez lineHeight mniejszego niż naturalny', () => {
    setLang('id');
    const diagnosis = diagnoseBreadDefect({ crumb: 'gumowaty' } as never);
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <DiagnosisResultCard diagnosis={diagnosis} unitSystem="metric" onNavigateHarmonogram={jest.fn()}
          onNavigateCalculator={jest.fn()} onNavigateStolnica={jest.fn()} onCopyDiagnosis={jest.fn()} />,
      );
    });
    const wiersze = tree.root.findAll((n) => typeof n.type === 'string' && StyleSheet.flatten(n.props.style)?.flexDirection === 'row' && n.children.some((c) => typeof c !== 'string' && StyleSheet.flatten((c as renderer.ReactTestInstance).props.style)?.fontWeight === '700' && (c as renderer.ReactTestInstance).props.children === '✓'));
    expect(wiersze.length).toBeGreaterThan(0);
    for (const w of wiersze) {
      const tekst = w.children[1] as renderer.ReactTestInstance;
      const s = StyleSheet.flatten(tekst.props.style);
      expect(s.flex).toBeUndefined();
      expect(s.flexShrink).toBe(1);
      expect(s.minWidth).toBe(0);
      if (s.lineHeight !== undefined) expect(s.lineHeight).toBeGreaterThanOrEqual(Math.ceil((s.fontSize as number) * 1.3));
    }
  });
});

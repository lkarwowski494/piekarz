/**
 * VoiceOver w przełączniku języka: element z `accessibilityLanguage` ma w etykiecie i podpowiedzi tylko tekst
 * w tym języku (nazwa języka w nim samym), bez zdania w języku interfejsu czytanego obcym głosem
 * [M1-audytor-generalny-170; 09-lokalizacja-507].
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { getLocalesByStatus } from '../lib/i18n-locales';
import { setLang } from '../lib/i18n';
import { PreferencesSection } from '../components/settings/PreferencesSection';

describe('przełącznik języka a VoiceOver (170)', () => {
  afterEach(() => setLang('pl'));

  it.each(['pl', 'ja'] as const)('interfejs %s: etykieta = sama nazwa języka w nim samym', async (ui) => {
    setLang(ui);
    let tree: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      tree = renderer.create(
        <PreferencesSection currentLang={ui} onLanguageChange={() => undefined} unitSystem="metric" onUnitSystemChange={() => undefined} />
      );
    });
    for (const { code, name } of getLocalesByStatus('released')) {
      const btn = tree!.root.find((n) => n.props.testID === `lang-${code}` && typeof n.type !== 'string');
      expect(btn.props.accessibilityLanguage).toBe(code);
      expect(btn.props.accessibilityLabel).toBe(name);
      expect(btn.props.accessibilityHint).toBeUndefined();
    }
    act(() => tree!.unmount());
  });
});

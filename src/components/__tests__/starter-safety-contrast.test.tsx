/**
 * Komunikat karty bezpieczeństwa zakwasu jest czytelny: kontrast ≥ 4,5:1 (WCAG 2.1 AA)
 * [M1-audytor-generalny-016; 04-studio-projektowe-001]. Pomiar na kolorach z wyrenderowanych stylów.
 */
import React from 'react';
import { StyleSheet } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { StarterSafetyCard } from '../zakwas/StarterSafetyCard';
import type { SourdoughSafetyStatus } from '../../core/sourdough-physics';
import { theme } from '../../ui/theme';
import { amberTheme } from '../../ui/amber-theme';

// WCAG 2.1, https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
const lum = (hex: string) => {
  const n = parseInt(hex.replace('#', ''), 16);
  const lin = (c: number) => (c / 255 <= 0.04045 ? c / 255 / 12.92 : Math.pow((c / 255 + 0.055) / 1.055, 2.4));
  return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
};
const contrast = (a: string, b: string) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const renderStatus = async (status: SourdoughSafetyStatus) => {
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(
      <StarterSafetyCard
        hasHooch={false}
        hasKahm={false}
        hasMold={status === 'discard'}
        hasColoredSpots={false}
        onToggleColoredSpots={() => {}}
        hasRottenSmell={false}
        onToggleRottenSmell={() => {}}
        onToggleHooch={() => {}}
        onToggleKahm={() => {}}
        onToggleMold={() => {}}
        safetyResult={{ status, titlePl: `TYTUŁ ${status}`, actionPl: `AKCJA ${status}` }}
        onReset={() => {}}
      />
    );
  });
  const root = tree!.root;
  const title = root.find((n) => String(n.type) === 'Text' && n.props.children === `TYTUŁ ${status}`);
  const action = root.find((n) => String(n.type) === 'Text' && n.props.children === `AKCJA ${status}`);
  // Najgłębszy widok zawierający tytuł = ramka komunikatu
  const boxes = root.findAll((n) => String(n.type) === 'View' && n.findAll((c) => c === title).length > 0);
  const bg = StyleSheet.flatten(boxes[boxes.length - 1].props.style).backgroundColor as string;
  const out = {
    title: contrast(StyleSheet.flatten(title.props.style).color as string, bg),
    action: contrast(StyleSheet.flatten(action.props.style).color as string, bg),
  };
  act(() => tree!.unmount());
  return out;
};

describe('Starter safety card text contrast (016)', () => {
  it.each<SourdoughSafetyStatus>(['discard', 'hooch', 'no_observation'])('%s: title and action text reach at least 4.5:1', async (status) => {
    const c = await renderStatus(status);
    expect(c.title).toBeGreaterThanOrEqual(4.5);
    expect(c.action).toBeGreaterThanOrEqual(4.5);
  });

  it('the token pair used by the card (text on surfaceCard) also reaches 4.5:1 in the amber night theme', () => {
    expect(contrast(amberTheme.colors.textPrimary, amberTheme.colors.surfaceCard)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(amberTheme.colors.textSecondary, amberTheme.colors.surfaceCard)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(theme.colors.textSecondary, theme.colors.surfaceCard)).toBeGreaterThanOrEqual(4.5);
  });
});

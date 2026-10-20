/**
 * Karta zakwasu bez wpisu dokarmienia (macierz stanów: pierwsze użycie; design-spec §11b 058, §6 przycisk
 * nieaktywny; podłoga VoiceOver) [M1-audytor-generalny-115; 04-studio-projektowe-030].
 * Komunikat w stylu objaśnienia (nie tytuł), „Podwoił objętość” nieaktywny stanem i wyglądem z tokenów
 * (obwódka zamiast wypełnienia, tekst `zablokowane`), Spirala bez danych poza drzewem dostępności.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { StarterCycleCard } from '../components/zakwas/StarterCycleCard';
import { stanKartyZakwasu } from '../lib/zakwas-widok';
import type { StoredStarterEntry } from '../data/db';
import { theme } from '../ui/theme';
import { typografia } from '../ui/tokeny';

const H = 3600_000;
const KOMUNIKAT = 'Nie ma jeszcze wpisu dokarmienia. Zapisz dokarmienie, gdy dokarmisz zakwas.';

async function karta(entries: StoredStarterEntry[]): Promise<renderer.ReactTestRenderer> {
  let t!: renderer.ReactTestRenderer;
  await act(async () => {
    t = renderer.create(
      <StarterCycleCard stan={stanKartyZakwasu({}, entries, Date.now())} opisMiejsca="na blacie" onPodwoil={jest.fn()} onDokarm={jest.fn()} onNiepokoi={jest.fn()} />
    );
  });
  return t;
}

/** Widok-host przycisku (View z testID) i styl jego tekstu. */
function przycisk(t: renderer.ReactTestRenderer) {
  const host = t.root.findAll((n) => n.type === View && n.props.testID === 'zakwas-podwoil-btn')[0];
  const styl = StyleSheet.flatten(host.props.style);
  const tekst = StyleSheet.flatten(host.findByType(Text).props.style);
  return { host, styl, tekst };
}

const spirala = (t: renderer.ReactTestRenderer) => t.root.findAll((n) => n.type === View && n.props.testID === 'brand-spiral')[0];

describe('115: karta zakwasu bez wpisu', () => {
  it('komunikat w stylu objaśnienia, bez kroju tytułu i bez pogrubienia 700', async () => {
    const t = await karta([]);
    const komunikat = t.root.findAllByType(Text).find((n) => [n.props.children].flat().join('') === KOMUNIKAT)!;
    const styl = StyleSheet.flatten(komunikat.props.style);
    expect({ pt: styl.fontSize, waga: styl.fontWeight ?? '400' }).toEqual({ pt: typografia.style.objasnienie.pt, waga: '400' });
    act(() => t.unmount());
  });

  it('„Podwoił objętość” nieaktywny: stan disabled, tekst `zablokowane`, obwódka zamiast wypełnienia akcentem', async () => {
    const t = await karta([]);
    const { host, styl, tekst } = przycisk(t);
    expect(host.props.accessibilityState).toEqual(expect.objectContaining({ disabled: true }));
    expect(tekst.color).toBe(theme.colors.zablokowane);
    expect(styl.backgroundColor).not.toBe(theme.colors.akcent);
    expect(styl.borderWidth).toBeGreaterThanOrEqual(1);
    expect(styl.borderColor).toBe(theme.colors.obwodka);
    act(() => t.unmount());
  });

  it('Spirala bez wpisu nie jest obrazem bez etykiety: poza drzewem dostępności', async () => {
    const t = await karta([]);
    const s = spirala(t);
    expect({ rola: s.props.accessibilityRole, ukryta: s.props.accessibilityElementsHidden, android: s.props.importantForAccessibility }).toEqual({
      rola: undefined,
      ukryta: true,
      android: 'no-hide-descendants',
    });
    act(() => t.unmount());
  });

  it('kontrola: po dokarmieniu przycisk aktywny z akcentem, Spirala obrazem z etykietą', async () => {
    const at = Date.now() - 2 * H;
    const t = await karta([{ id: 'f', starterId: 's', kind: 'feeding', occurredAt: at, signs: [], createdAt: at, updatedAt: at }]);
    const { host, styl, tekst } = przycisk(t);
    expect(host.props.accessibilityState?.disabled ?? false).toBe(false);
    expect(styl.backgroundColor).toBe(theme.colors.akcent);
    expect(tekst.color).toBe(theme.colors.naAkcencie);
    const s = spirala(t);
    expect(s.props.accessibilityRole).toBe('image');
    expect(typeof s.props.accessibilityLabel).toBe('string');
    expect(s.props.accessibilityLabel.length).toBeGreaterThan(0);
    act(() => t.unmount());
  });
});

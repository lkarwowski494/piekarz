/**
 * Karta dokarmienia mówi o zakwasie, nie o „zaczynie” (zaczyn = preferment w arkuszu Składniki, §11c 106)
 * [M1-audytor-generalny-160; 04-studio-projektowe-505].
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { StarterFeedingCard } from '../components/zakwas/StarterFeedingCard';
import { EN } from '../lib/i18n.en';
import { setLang } from '../lib/i18n';

const tekst = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(tekst).join(' ');
  if (n && typeof n === 'object' && 'children' in n) return tekst((n as { children: unknown }).children);
  return '';
};

function karta(): string {
  let tree: renderer.ReactTestRenderer | null = null;
  act(() => {
    tree = renderer.create(
      <StarterFeedingCard
        selectedRatio={[1, 2, 2]}
        onSelectRatio={() => {}}
        targetYield={200}
        onTargetYieldChange={() => {}}
        feeding={{ starterGrams: 40, flourGrams: 80, waterGrams: 80 }}
        hydratacjaZakwasu={100}
        unitSystem="metric"
        onCopyFeeding={() => {}}
        onOpenConverter={() => {}}
        onOpenDiscardRecipes={() => {}}
      />,
    );
  });
  return tekst(tree!.toJSON());
}

describe('160: karta dokarmienia bez „zaczynu”', () => {
  afterEach(() => setLang('pl'));

  it('PL: brak słowa „zaczyn” w karcie, jest „Potrzebny zakwas”', () => {
    setLang('pl');
    const s = karta();
    expect(s).not.toMatch(/zaczyn/i);
    expect(s).toContain('Potrzebny zakwas');
  });

  it('EN: karta mówi „starter”, nie „levain”', () => {
    setLang('en');
    const s = karta();
    expect(s).not.toMatch(/levain/i);
    expect(EN['Potrzebny zakwas']).toBe('Starter needed');
  });
});

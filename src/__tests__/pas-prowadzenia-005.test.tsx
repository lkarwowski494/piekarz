/**
 * Na pasie prowadzenia mała spirala (92 pt) zamiast pełnej 150–220 pt: karta „Co zrobić” i ostrzeżenie w pierwszym
 * ekranie [M1-audytor-generalny-005; 04-studio-projektowe-001, opcja A]. Widoczność bez przewijania na symulatorze:
 * .maestro/e2e/03-prowadzenie-widok-skupiony.yaml (assertVisible karta-kroku, bez scroll).
 */
import fs from 'fs';
import path from 'path';
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { SpiralaWypieku } from '../components/Spirala';
import { planBakeSteps } from '../core/bake-steps';

const bok = (naPasie: boolean): number => {
  const steps = planBakeSteps({ startAt: Date.now(), isHighRye: false });
  let tree!: renderer.ReactTestRenderer;
  act(() => { tree = renderer.create(<SpiralaWypieku steps={steps} stepIdx={2} pozostaloSec={600} pelnySec={1200} naPasie={naPasie} />); });
  const w = tree.root.findByProps({ testID: 'brand-spiral' }).props.style.width as number;
  act(() => tree.unmount());
  return w;
};

describe('005: pas prowadzenia z małą spiralą', () => {
  it('na pasie 92 pt, poza pasem pełna (≥ 150 pt)', () => {
    expect(bok(true)).toBe(92);
    expect(bok(false)).toBeGreaterThanOrEqual(150);
  });
  it('E2E prowadzenia sprawdza kartę „Co zrobić” bez przewijania', () => {
    const flow = fs.readFileSync(path.join(__dirname, '..', '..', '.maestro', 'e2e', '03-prowadzenie-widok-skupiony.yaml'), 'utf8');
    const po = flow.slice(flow.indexOf('id: "step-title"'));
    expect(po).toMatch(/assertVisible:\s*\n\s*id: "karta-kroku"/);
    expect(po).not.toMatch(/scrollUntilVisible/);
  });
});

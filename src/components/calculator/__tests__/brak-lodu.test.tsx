/**
 * F-53 NIE: bez pola i wyniku masy lodu w interfejsie receptury; temperatura wody (F-10) i ostrzeżenie
 * powyżej 45 °C (RD-05, M1-audytor-generalny-039) działają dalej [M1-audytor-generalny-099].
 * Obliczenie lodu zostaje w kodzie domenowym (calculateIceRequirement, testy wektorów BRD), bez wejścia z interfejsu.
 */
import React from 'react';
import fs from 'fs';
import path from 'path';
import renderer, { act } from 'react-test-renderer';
import { AccordionDdtSection } from '../accordion/AccordionDdtSection';

const ROOT = path.resolve(__dirname, '../../../..');
const zrodlo = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

function teksty(tree: renderer.ReactTestRenderer): string {
  return tree.root
    .findAll((n) => (n.type as unknown) === 'Text')
    .map((n) => (Array.isArray(n.props.children) ? n.props.children.join('') : String(n.props.children)))
    .join(' | ');
}

const LOD = /l[oó]d(u|em)?\b|\bice\b/i;

describe('No ice mass in the recipe interface (F-53 NIE)', () => {
  it('water below 4 °C shows the computed water temperature, no ice text', async () => {
    let tree: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      tree = renderer.create(
        <AccordionDdtSection targetDdt={18} onTargetDdtChange={() => undefined} waterTempTarget={-2} />
      );
    });
    const txt = teksty(tree!);
    expect(txt).toContain('-2°C');
    expect(txt).not.toMatch(LOD);
    act(() => tree!.unmount());
  });

  it('water temperature and the warning above 45 °C still work', async () => {
    let tree: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      tree = renderer.create(
        <AccordionDdtSection
          targetDdt={30}
          onTargetDdtChange={() => undefined}
          waterTempTarget={48}
          waterTempWarning="Uwaga: Obliczona temperatura wody przekracza 45°C."
        />
      );
    });
    expect(teksty(tree!)).toContain('48°C');
    expect(tree!.root.findAllByProps({ testID: 'ddt-too-hot-warning' }).length).toBeGreaterThan(0);
    act(() => tree!.unmount());
  });

  it('recipe screen code has no ice field, ice result or ice text', () => {
    for (const p of [
      'src/components/calculator/accordion/AccordionDdtSection.tsx',
      'src/components/calculator/ArtisanAccordionPro.tsx',
      'app/(tabs)/receptury/index.tsx',
      'app/(tabs)/receptury/receptura.tsx',
      'src/hooks/useRecipeCalculations.ts',
    ]) {
      expect({ p, lod: /iceGrams|iceResult|calculateIceRequirement|\(Lód\)|lodu|lodem/.test(zrodlo(p)) }).toEqual({ p, lod: false });
    }
  });
});

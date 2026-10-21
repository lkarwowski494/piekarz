/**
 * Arkusz „Temperatura wody” nie pokazuje szacunku białka mieszanki: pola proteinPercent w src/core/flour-atlas.ts
 * nie mają przeczytanego źródła (MAK-OGL-900, 06-tresci-fix-p4-002) i przeczą źródłom rejestru (np. pszenna typ 2000:
 * 13,8% w atlasie, 9,6% w MAK-OGL-003, PMC5294222). Wartość zostaje w modelu (analyzeFlourBlendAbsorption), bez
 * wyświetlania, do czasu źródła [audyt-niezalezny E-7].
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { AccordionDdtSection } from '../accordion/AccordionDdtSection';
import { analyzeFlourBlendAbsorption } from '../../../core/flour-atlas';

function teksty(tree: renderer.ReactTestRenderer): string {
  return tree.root
    .findAll((n) => (n.type as unknown) === 'Text')
    .map((n) => (Array.isArray(n.props.children) ? n.props.children.join('') : String(n.props.children)))
    .join(' | ');
}

describe('białko mąk bez źródła nie trafia na ekran (E-7)', () => {
  it('karta chłonności mąk pokazuje chłonność i zakres, bez „Białko”', async () => {
    const blend = analyzeFlourBlendAbsorption([{ name: 'Mąka pszenna razowa typ 2000', percentage: 100, type: 'wheat_2000' }], 80);
    let tree: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      tree = renderer.create(
        <AccordionDdtSection targetDdt={25} onTargetDdtChange={() => undefined} waterTempTarget={20} blendAbsorption={blend} />
      );
    });
    expect(tree!.root.findAllByProps({ testID: 'flour-absorption-badge' }).length).toBeGreaterThan(0);
    const txt = teksty(tree!);
    expect(txt).toContain('Chłonność mąk:');
    expect(txt).not.toMatch(/Białko|białk/);
    act(() => tree!.unmount());
  });
});

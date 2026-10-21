/**
 * 206: rejestr ZAC-PAT-002 zapisuje zakres przykładu BBGA (pâte fermentée z mąki pełnoziarnistej 60% i żytniej 40%)
 * i kierunek różnicy dla mąki jasnej (MAK-HYD-001: mąki pełnoziarniste chłoną więcej wody), bez zmiany decyzji D-060
 * [M1-audytor-generalny-206; 06-tresci-602].
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { PREFERMENT_DEFINITIONS } from '../preferments';

const ROOT = join(__dirname, '..', '..', '..');
const rejestr: { id: string; status: string; uproszczenie?: string }[] = JSON.parse(readFileSync(join(ROOT, 'docs/tresci/rejestr.json'), 'utf8'));

describe('206: zakres przykładu BBGA dla pâte fermentée', () => {
  const z = rejestr.find((r) => r.id === 'ZAC-PAT-002');

  it('uproszczenie ZAC-PAT-002: skład mąki przykładu BBGA (pełnoziarnista 60%, żytnia 40%)', () => {
    expect(z?.status).toBe('potwierdzone');
    const u = z?.uproszczenie ?? '';
    expect(u).toMatch(/pełnoziarnist\w* 60 ?%/);
    expect(u).toMatch(/żytni\w* 40 ?%/);
  });

  it('uproszczenie ZAC-PAT-002: kierunek różnicy dla mąki jasnej z MAK-HYD-001', () => {
    const u = z?.uproszczenie ?? '';
    expect(u).toMatch(/jasn/);
    expect(u).toMatch(/MAK-HYD-001/);
    expect(u).toMatch(/luźniejsz/);
  });

  it('decyzja D-060 bez zmian: 75% wody w obliczeniach', () => {
    expect(PREFERMENT_DEFINITIONS.pate_fermentee.defaultHydration).toBe(75);
  });
});

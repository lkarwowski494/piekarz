/**
 * design-spec: rutynowe usunięcie pokazuje pasek „Cofnij” (nazwa komponentu) z przyciskiem „Przywróć”, jak tabela §5
 * („Usunięto {obiekt}” z „Przywróć” / Restore) i kod (`src/components/PasekCofnij.tsx`: t('Przywróć'))
 * [reaudit-noc N-18; D-051 1a].
 */
import { readFileSync } from 'fs';
import { join } from 'path';

const spec = readFileSync(join(__dirname, '../docs/design/design-spec.md'), 'utf8');
const kod = readFileSync(join(__dirname, '../src/components/PasekCofnij.tsx'), 'utf8');

describe('design-spec: przycisk paska po usunięciu to „Przywróć” (N-18)', () => {
  it('kod paska ma przycisk „Przywróć”', () => {
    expect(kod).toMatch(/t\('Przywróć'\)/);
  });

  it('każde zdanie o rutynowym usunięciu z paskiem „Cofnij” nazywa przycisk „Przywróć”', () => {
    const zdania = spec
      .split('\n')
      .map((l, i) => ({ nr: i + 1, l }))
      .flatMap(({ nr, l }) => l.split(/[;|]|\.\s/).map((z) => ({ nr, z })))
      .filter(({ z }) => /usunię/i.test(z) && /„Cofnij”/.test(z));
    expect(zdania.length).toBeGreaterThan(0);
    expect(zdania.filter(({ z }) => !/„Przywróć”/.test(z)).map(({ nr, z }) => `${nr}: ${z.trim()}`)).toEqual([]);
  });
});

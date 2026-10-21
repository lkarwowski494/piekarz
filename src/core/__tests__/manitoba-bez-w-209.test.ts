/**
 * 209: nazwa profilu wheat_manitoba w atlasie PL bez siły mąki „W > 350” — rejestr nie ma twierdzenia o sile W
 * (MAK-OGL-900 otwarte); nazwa jak nazwa ogólna profilu (OPIS_OGOLNY_MAK) [M1-audytor-generalny-209; 06-tresci-605].
 */
import { FLOUR_PROFILES, matchFlourProfile } from '../flour-atlas';
import { OPIS_OGOLNY_MAK } from '../flour-atlas-ogolne';
import { nazwaMaki } from '../../lib/nazwa-maki';
import { EN } from '../../lib/i18n.en';

describe('209: Manitoba bez liczby bez twierdzenia', () => {
  const p = FLOUR_PROFILES.find((x) => x.id === 'wheat_manitoba')!;

  it('namePl bez „W > 350” i bez żadnej liczby', () => {
    expect(p.namePl).not.toMatch(/\bW\s*[>≥]/);
    expect(p.namePl).not.toMatch(/\d/);
  });

  it('PL pokazuje tę nazwę; jest równa nazwie ogólnej profilu i ma wpis EN', () => {
    expect(nazwaMaki(p, 'pl')).toBe(p.namePl);
    expect(p.namePl).toBe(OPIS_OGOLNY_MAK.wheat_manitoba.nazwaPl);
    expect(typeof EN[p.namePl]).toBe('string');
  });

  it('dopasowanie po nazwie dalej znajduje profil (zapisane receptury)', () => {
    expect(matchFlourProfile('Mąka Manitoba / Forte (W > 350)').id).toBe('wheat_manitoba');
    expect(matchFlourProfile(p.namePl).id).toBe('wheat_manitoba');
  });
});

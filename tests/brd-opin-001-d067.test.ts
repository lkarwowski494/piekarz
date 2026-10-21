/**
 * BRD i kontrakt zakresu nadążają za D-067 (DEC-20 a): systemowa prośba o ocenę po zapisanym wypieku od 3.
 * ukończonego wypieku, z odstępem 14 dni i limitem 3 w 365 dniach, bez warunku oceny bochenka; próg 4★ z D-042
 * (OP-49) uchylony w części „warunek prośby” [reaudit-noc N-12; M1-audytor-generalny-138].
 * Kod: src/lib/prosba-o-ocene.ts, src/hooks/useFinishBake.ts; testy kodu: src/__tests__/prosba-o-ocene-138.test.tsx.
 */
import { readFileSync } from 'fs';
import { join } from 'path';

const czytaj = (p: string) => readFileSync(join(__dirname, '..', p), 'utf8').replace(/\r\n/g, '\n');
const brd = czytaj('docs/brd/wymagania-dziennik.md');
const sekcja = brd.slice(brd.indexOf('### BR-OPIN-001'), brd.indexOf('### BR-OPIN-002'));
const scenariusz = (nazwa: string) => {
  const od = sekcja.indexOf(`Scenariusz: ${nazwa}`);
  if (od < 0) return '';
  const dalej = sekcja.indexOf('Scenariusz:', od + 12);
  return sekcja.slice(od, dalej < 0 ? undefined : dalej);
};
const kontrakt = czytaj('docs/scope-contract.md');
const linieKontraktu = kontrakt.split('\n');
const PROG_4 = /(co najmniej (na )?4★|≥\s*4★|od 4★)/;

describe('BR-OPIN-001 według D-067 (N-12)', () => {
  it('warunek prośby: 3 ukończone wypieki, odstęp 14 dni, limit S-63; bez progu 4★ jako warunku', () => {
    const s = scenariusz('Trzeci ukończony wypiek');
    expect(s).toMatch(/co najmniej 3 ukończone wypieki/);
    expect(s).toMatch(/14 dni/);
    expect(s).toMatch(/D-067/);
    expect(s).toMatch(/S-63/);
    expect(sekcja.split('\n').filter((l) => PROG_4.test(l) && !/uchyl/.test(l))).toEqual([]);
  });

  it('pierwszy i drugi wypiek oraz odstęp krótszy niż 14 dni: bez prośby', () => {
    expect(scenariusz('Pierwszy i drugi wypiek')).toMatch(/nie wywołuje prośby/);
    expect(scenariusz('Odstęp krótszy niż 14 dni')).toMatch(/nie wywołuje prośby/);
  });

  it('słaba ocena: propozycja Doktora, a ocena bochenka nie wchodzi do warunku prośby (bez „nie wywołuje prośby”)', () => {
    const s = scenariusz('Słaba ocena');
    expect(s).toMatch(/BR-DIAG-001/);
    expect(s).toMatch(/nie wchodzi do warunku/);
    expect(s).not.toMatch(/nie wywołuje prośby/);
  });

  it('README BRD: OP-49 wskazuje D-067', () => {
    const op49 = czytaj('docs/brd/README.md').split('\n').find((l) => l.startsWith('| OP-49 |')) ?? '';
    expect(op49).toMatch(/D-067/);
  });

  it('errata: ER-61 z D-067 i BR-OPIN-001', () => {
    const er = czytaj('docs/brd/errata.md').split('\n').find((l) => l.startsWith('| ER-61 |')) ?? '';
    expect(er).toMatch(/D-067/);
    expect(er).toMatch(/BR-OPIN-001/);
  });
});

describe('kontrakt zakresu F-69 według D-067 (N-12)', () => {
  it('wiersz F-69: warunek D-067, bez „OP-49: ≥ 4★”', () => {
    const f69 = linieKontraktu.find((l) => l.startsWith('| F-69 |')) ?? '';
    expect(f69).toMatch(/D-067/);
    expect(f69).not.toMatch(/OP-49: ≥ 4★/);
  });

  it('rozstrzygnięcia: OP-49 z dopiskiem o D-067', () => {
    const r = linieKontraktu.find((l) => l.startsWith('- Rozstrzygnięcia:')) ?? '';
    expect(r).toMatch(/OP-49[^;]*D-067/);
  });

  it('tabela „Zmiany zakresu” ma wpis ZM z F-69 i D-067', () => {
    const zm = kontrakt.split('## Zmiany zakresu')[1]?.split('\n## ')[0] ?? '';
    expect(zm.split('\n').some((l) => /^\| ZM-\d+/.test(l) && /F-69/.test(l) && /D-067/.test(l))).toBe(true);
  });
});

/**
 * Zamrożony parser sesji migracji v6 (wyjątek D-300) [M1-audytor-generalny-021; 05-architekt-004]: wynik na wariantach
 * sesji z buildu 1014 stały, niezależny od parsera bieżącego (sesja-parsery.ts). Wynik całej migracji pilnują testy
 * migracja-d1-1014 i p9a-baza-1021.
 */
import { parsujSesjeV6, idSesjiV6, KLUCZ_SESJI_V5 } from '../migracja-v6-parser';
import { surowaSesja1014, type WariantSesji1014 } from './helpers/baza-1014';

const surowa = (w: WariantSesji1014) => surowaSesja1014(w) ?? undefined;

describe('migracja-v6-parser: kopia parsera z dd824eee', () => {
  it('poprawne sesje v1 i v2 dają sesję w wersji 2 z id; v1 z 8 krokami sprzed wersji 2', () => {
    for (const w of ['v2-pauza', 'v2-zytnia'] as const) {
      const s = parsujSesjeV6(surowa(w));
      expect(s?.version).toBe(2);
      expect(s && idSesjiV6(s)).toEqual(expect.any(String));
    }
    const v1 = parsujSesjeV6(surowa('v1'));
    expect(v1?.steps).toHaveLength(8);
    expect(v1 && idSesjiV6(v1)).toBe(v1?.bake?.id ?? 'sesja-1014');
  });

  it('uszkodzona, pusta i brak sesji: null', () => {
    expect(parsujSesjeV6(surowa('uszkodzona'))).toBeNull();
    expect(parsujSesjeV6(surowa('pusta'))).toBeNull();
    expect(parsujSesjeV6(surowa('brak'))).toBeNull();
  });

  it('klucz sesji v5 jak w wydanym schemacie', () => {
    expect(KLUCZ_SESJI_V5).toBe('active_bake_session');
  });
});

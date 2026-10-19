/**
 * Lekcje nie obiecują skutków zdrowotnych bez źródła szczebla 1–2: twierdzenie LEK-TRA-900
 * („lekkostrawność”, „zerowe uczucie ciężkości”, „zero bloat”) wycofane przez rolę 06
 * [M1-audytor-generalny-045; 06-tresci-008].
 */
import * as lessons from '../bread-school-lessons';

const HEALTH_PL = /lekkostrawn|ciężkoś|trawien|wzdęci|żołąd/i;
// „digests starch” (amylazy) to chemia ciasta, nie twierdzenie o człowieku
const HEALTH_EN = /digestib|digestab|predigest|bloat|stomach|\bgut\b/i;

const allStrings = (v: unknown): string[] =>
  typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(allStrings) : v && typeof v === 'object' ? Object.values(v).flatMap(allStrings) : [];

describe('lekcje bez twierdzeń zdrowotnych', () => {
  const texts = allStrings(Object.values(lessons));

  it('PL: brak słów o trawieniu, wzdęciach i ciężkości', () => {
    expect(texts.filter((s) => HEALTH_PL.test(s))).toEqual([]);
  });

  it('EN: brak słów o trawieniu i wzdęciach', () => {
    expect(texts.filter((s) => HEALTH_EN.test(s))).toEqual([]);
  });
});

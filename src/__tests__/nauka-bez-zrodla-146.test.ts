/**
 * M1-audytor-generalny-146 (01-odkrywanie-504), BR-NAUK-001 „Treść bez źródła”: w 1.0 wiedza jest tylko w „Po co ten
 * krok” przy kroku (zdanie bez źródła: przycisk nieaktywny, test w po-co-ten-krok-100), a lekcje Akademii nie mają
 * wejścia (F-44 „lekcje osobno później”). Lekcja 6 ma zdanie LEK-PRO-900 o statusie „otwarte”: test pilnuje, żeby
 * wejście do lekcji nie wróciło, dopóki to zdanie nie ma źródła albo nie zniknie z lekcji (D-070).
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { wejscieWidoczne } from '../lib/wejscia-pozniej';
import { BREAD_SCHOOL_LESSONS } from '../core/bread-school-lessons';

const rejestr: { id: string; status: string; twierdzenie: string }[] = JSON.parse(
  readFileSync(join(__dirname, '..', '..', 'docs/tresci/rejestr.json'), 'utf8'),
);

describe('BR-NAUK-001 Treść bez źródła: lekcje z twierdzeniem „otwarte” bez wejścia w 1.0', () => {
  it('BR-NAUK-001 Treść bez źródła: zdanie LEK-PRO-900 (otwarte) jest tylko w lekcji, a lekcje nie mają wejścia', () => {
    const lek = rejestr.find((x) => x.id === 'LEK-PRO-900');
    const wLekcji = BREAD_SCHOOL_LESSONS.filter((l) => /proteaz/.test(l.scientificInsightPl));
    expect(wLekcji.length).toBeGreaterThan(0);
    if (lek?.status === 'otwarte') expect(wejscieWidoczne('akademia')).toBe(false);
  });
});

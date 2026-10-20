/**
 * M1-audytor-generalny-104, BR-DIAG-002 (RD-21, RD-24; T9 roli 05): Doktor zakwasu — objaw → możliwe przyczyny →
 * co zrobić; plamy → polecenie wyrzucenia zamiast przyczyn. Czysta funkcja, bez zapisu.
 * Teksty dosłownie z docs/tresci/pl|en/doktor-zakwasu.md.
 */
import {
  STARTER_SYMPTOMS,
  DOCTOR_CAUSES_HEADER,
  DOCTOR_ACTIONS_HEADER,
  NO_DOUBLING_CAUSES,
  NO_DOUBLING_ACTIONS,
  LONG_UNFED_TEXTS,
  diagnoseStarter,
  type StarterSymptom,
  type StarterDoctorResult,
} from '../starter-doctor';
import { FIRST_DAY_NO_ACTIVITY } from '../starter-log';
import { evaluateSourdoughSafety } from '../sourdough-physics';
import { linie, poAngielsku } from './helpers/tresci';

describe('BR-DIAG-002: Doktor zakwasu (104)', () => {
  it('BR-DIAG-002 Zakwas bez aktywności w dniu 5: przyczyny z treści 06 i rada karmienia co 12 h (RD-24-W3)', () => {
    const symptoms: StarterSymptom[] = ['no_doubling'];
    const out: StarterDoctorResult | null = diagnoseStarter({ setupDay: 5, symptoms });
    expect(out).toEqual({ kind: 'advice', symptom: 'no_doubling', intro: [], causes: NO_DOUBLING_CAUSES, actions: NO_DOUBLING_ACTIONS });
    expect(NO_DOUBLING_ACTIONS[0]).toMatch(/co 12 godzin/);
    expect(diagnoseStarter({ setupDay: 5, symptoms: ['no_activity'] })).toEqual(out);
  });

  it('BR-DIAG-002 Objawy pleśni w Doktorze: polecenie wyrzucenia (RD-21-W1), nie lista przyczyn', () => {
    const d = evaluateSourdoughSafety({ hasColoredSpots: true });
    expect(diagnoseStarter({ setupDay: 5, symptoms: ['no_doubling', 'mold_signs'] })).toEqual({ kind: 'discard', title: d.titlePl, action: d.actionPl });
  });

  it('dzień 1 bez aktywności: to normalne (RD-24-W5); długo bez dokarmiania; brak objawów', () => {
    expect(diagnoseStarter({ setupDay: 1, symptoms: ['no_activity'] })).toEqual({ kind: 'advice', symptom: 'first_day', intro: FIRST_DAY_NO_ACTIVITY, causes: [], actions: [] });
    expect(diagnoseStarter({ setupDay: null, symptoms: ['long_unfed'] })).toEqual({ kind: 'advice', symptom: 'long_unfed', intro: LONG_UNFED_TEXTS, causes: [], actions: [] });
    expect(diagnoseStarter({ setupDay: null, symptoms: [] })).toBeNull();
    expect(STARTER_SYMPTOMS).toEqual(['no_activity', 'no_doubling', 'long_unfed', 'mold_signs']);
  });

  it('Doktor nie zapisuje niczego: wynik zależy tylko od wejścia (ten sam wynik dwa razy, wejście bez zmian)', () => {
    const input = Object.freeze({ setupDay: 5, symptoms: Object.freeze(['no_doubling'] as const) });
    expect(diagnoseStarter(input)).toEqual(diagnoseStarter(input));
  });

  it('teksty dosłownie z doktor-zakwasu.md (PL i EN)', () => {
    const pl = linie('pl/doktor-zakwasu.md', 'objaw.brak-podwojenia');
    expect(pl).toEqual([DOCTOR_CAUSES_HEADER, ...NO_DOUBLING_CAUSES, DOCTOR_ACTIONS_HEADER, ...NO_DOUBLING_ACTIONS]);
    expect(poAngielsku(pl)).toEqual(linie('en/doktor-zakwasu.md', 'objaw.brak-podwojenia'));
    expect(LONG_UNFED_TEXTS).toEqual(linie('pl/doktor-zakwasu.md', 'objaw.dlugo-bez-dokarmiania'));
    expect(poAngielsku(LONG_UNFED_TEXTS)).toEqual(linie('en/doktor-zakwasu.md', 'objaw.dlugo-bez-dokarmiania'));
  });
});

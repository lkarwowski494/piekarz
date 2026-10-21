/**
 * Zakwas z obserwacją plam/nalotu po ostatnim dokarmieniu nie jest „Gotowy do ciasta”, nawet gdy podwoił objętość:
 * zasada ostrożności RD-21-W1 (każdy nalot, pleśń, przebarwienie → wyrzuć) ma pierwszeństwo przed oznaczeniem
 * gotowości [audyt-niezalezny E-5].
 */
import { isReadyAfterFeeding, setupObservationOutcome, type StarterEntryLike } from '../starter-log';

const H = 60 * 60 * 1000;
const T0 = Date.UTC(2026, 9, 20, 8, 0);
const karmienie: StarterEntryLike = { kind: 'feeding', occurredAt: T0, signs: [] };
const podwoil: StarterEntryLike = { kind: 'observation', occurredAt: T0 + 6 * H, signs: ['doubled'] };

describe('gotowość zakwasu a plamy (E-5)', () => {
  it('podwojenie bez plam ≤ 8 h po dokarmieniu: gotowy (bez zmian)', () => {
    expect(isReadyAfterFeeding([karmienie, podwoil])).toBe(true);
  });

  it('plamy i podwojenie w jednej obserwacji: nie gotowy', () => {
    expect(isReadyAfterFeeding([karmienie, { ...podwoil, signs: ['doubled', 'mold_signs'] }])).toBe(false);
  });

  it('plamy zapisane wcześniej po tym samym dokarmieniu, potem podwojenie: nie gotowy', () => {
    const plamy: StarterEntryLike = { kind: 'observation', occurredAt: T0 + 2 * H, signs: ['mold_signs'] };
    expect(isReadyAfterFeeding([karmienie, plamy, podwoil])).toBe(false);
  });

  it('plamy przed ostatnim dokarmieniem (nowy cykl po wyrzuceniu i nowym starcie) nie blokują nowej gotowości', () => {
    const plamy: StarterEntryLike = { kind: 'observation', occurredAt: T0 - 20 * H, signs: ['mold_signs'] };
    expect(isReadyAfterFeeding([plamy, karmienie, podwoil])).toBe(true);
  });

  it('zakładanie: podwojenie po wcześniejszej obserwacji plam w tym cyklu nie daje „gotowy”', () => {
    const plamy: StarterEntryLike = { kind: 'observation', occurredAt: T0 + 2 * H, signs: ['mold_signs'] };
    const w = setupObservationOutcome({ day: 6, signs: ['doubled'], entries: [karmienie, plamy], observedAt: T0 + 6 * H });
    expect(w.kind).not.toBe('ready');
  });
});

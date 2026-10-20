/**
 * M1-audytor-generalny-104 (ADR-008): wiersz dziennika zakwasu z kopii albo bazy parsowany z `unknown` —
 * zły wiersz daje null, brak zostaje brakiem.
 */
import { parseStarterEntryRow, parseStarterRow } from '../row-parsers';

const base = { id: 'e1', starterId: 's1', kind: 'feeding', occurredAt: 10, createdAt: 10, updatedAt: 11 };

describe('parseStarterEntryRow (104)', () => {
  it('dokarmienie z kopii (signs jako tablica) i z bazy (signs jako tekst JSON, NULL jako brak)', () => {
    expect(parseStarterEntryRow({ ...base, feedRatio: '1:2:2', flourGrams: 50, waterGrams: 50, signs: [] })).toEqual({
      ...base, feedRatio: '1:2:2', flourGrams: 50, waterGrams: 50, signs: [],
    });
    expect(parseStarterEntryRow({ ...base, feedRatio: null, flourGrams: null, waterGrams: null, signs: '[]' })).toEqual({
      ...base, feedRatio: undefined, flourGrams: undefined, waterGrams: undefined, signs: [],
    });
  });

  it('obserwacja bez proporcji i gramów; znane kody obserwacji', () => {
    expect(parseStarterEntryRow({ ...base, kind: 'observation', feedRatio: '1:1:1', flourGrams: 5, signs: '["doubled","bubbles"]' })).toEqual({
      ...base, kind: 'observation', feedRatio: undefined, flourGrams: undefined, waterGrams: undefined, signs: ['doubled', 'bubbles'],
    });
  });

  it.each([
    ['nieznany kod obserwacji', { ...base, signs: ['smells_nice'] }],
    ['uszkodzony JSON obserwacji', { ...base, signs: '[' }],
    ['signs nie jest tablicą', { ...base, signs: '{}' }],
    ['nieznany rodzaj', { ...base, kind: 'note' }],
    ['occurredAt = 0', { ...base, occurredAt: 0 }],
    ['brak starterId', { ...base, starterId: undefined }],
    ['brak updatedAt', { ...base, updatedAt: undefined }],
    ['nie obiekt', 'x'],
  ])('%s → null', (_n, v) => {
    expect(parseStarterEntryRow(v)).toBeNull();
  });

  it('zakwas z kopii niesie stan zakładania; brak = brak', () => {
    const s = { id: 's1', name: 'A', flourType: 'Ż', hydration: 100, birthDate: 1, storageState: 'ROOM_TEMP' };
    expect(parseStarterRow({ ...s, setupStartedAt: 5, setupCompletedAt: 9 })).toEqual(expect.objectContaining({ setupStartedAt: 5, setupCompletedAt: 9 }));
    expect(parseStarterRow(s)?.setupStartedAt).toBeUndefined();
  });
});

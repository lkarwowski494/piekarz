/**
 * „Zrobione”/„Pomiń” przy zaległym z „Dziś” na prawdziwym SQLite (node:sqlite; M3 D4b, BR-KAL-003, BR-KAL-007):
 * dokarmienie przez istniejący zapis wpisu (addStarterEntry) i cofnięcie jednego wpisu, decyzja „Pomiń” w app_settings,
 * „Pomiń” kroku wypieku = przejście do następnego kroku jak w arkuszu „Plan wypieku” (skokDoKroku), zapis z wersją.
 */
jest.mock('expo-sqlite', () => require('../../data/__tests__/helpers/node-sqlite-adapter').createExpoSqliteMock());

import { cofnijKarmienie, pominKarmienie, pominKrokWypieku, wpisDokarmienia, zrobioneKarmienie, type WynikPominieciaKroku } from '../kalendarz-akcje';
import { initDatabase, saveStarter, getAppSetting, deleteStarter, getStarters } from '../../data/sqlite-store';
import { getStarterEntries } from '../../data/starter-entries-store';
import { saveBakeSession } from '../../data/bake-session-store';
import { loadActiveBakeSessionsZWersja } from '../../data/bake-sessions-store';
import { KLUCZ_POMINIEC } from '../../data/pominiecia-store';
import { planBakeSteps } from '../../core/bake-steps';
import { useTempDbDir } from '../../data/__tests__/helpers/node-sqlite-adapter';

const H = 3_600_000;

describe('kalendarz-akcje (SQLite)', () => {
  beforeAll(() => {
    useTempDbDir();
  });
  beforeEach(async () => {
    await initDatabase();
    for (const s of await getStarters()) await deleteStarter(s.id);
    await saveBakeSession(null);
  });

  it('wpis dokarmienia: id jak w dzienniku zakwasu, rodzaj feeding, chwila teraz', () => {
    expect(wpisDokarmienia('z1', 1000)).toEqual({ id: 'feed-z1-1000', starterId: 'z1', kind: 'feeding', occurredAt: 1000, signs: [], createdAt: 1000, updatedAt: 1000 });
    expect(wpisDokarmienia('z1', 1000, '1:2:2').feedRatio).toBe('1:2:2');
  });

  it('BR-KAL-003 Zrobione: zapis dokarmienia istniejącą ścieżką; „Przywróć” usuwa tylko ten wpis', async () => {
    await saveStarter({ id: 'z1', name: 'Żytni', flourType: 'x', hydration: 100, birthDate: 1, storageState: 'ROOM_TEMP', lastFedAt: Date.now() - 13 * H });
    const przed = await getStarterEntries('z1');
    const teraz = Date.now();
    const wpis = await zrobioneKarmienie('z1', teraz);
    const po = await getStarterEntries('z1');
    expect(po.map((e) => e.id).sort()).toEqual([...przed.map((e) => e.id), wpis.id].sort());
    expect((await getStarters()).find((s) => s.id === 'z1')?.lastFedAt).toBe(teraz);
    await cofnijKarmienie(wpis.id);
    expect((await getStarterEntries('z1')).map((e) => e.id)).toEqual(przed.map((e) => e.id));
  });

  it('BR-KAL-007 Pomiń karmienia: decyzja w app_settings (klucz kalendarz_pominiecia) z chwilą pominięcia', async () => {
    await pominKarmienie('z1', 12345);
    expect(JSON.parse(String(await getAppSetting(KLUCZ_POMINIEC)))).toEqual([{ zdarzenie: 'karmienie:z1', at: 12345 }]);
  });

  it('BR-KAL-003 Pomiń krok wypieku: następny krok od teraz, dalsze przesunięte; ostatni krok i brak wypieku bez zapisu', async () => {
    const start = Date.now() - 3 * H;
    const steps = planBakeSteps({ startAt: start, isHighRye: false });
    await saveBakeSession({ version: 2, steps, stepIdx: 1, dutchOvenPhase: 'lid_on', timerEndsAt: Date.now() - 60_000, pausedLeftSec: null, recipeName: 'Chleb', startedAt: start, bake: { id: 'b1', recipeName: 'Chleb', startedAt: start, currentStageId: steps[1].id } });
    const teraz = Date.now();
    const wyniki: WynikPominieciaKroku[] = [];
    wyniki.push(await pominKrokWypieku('b1', teraz));
    const [w] = await loadActiveBakeSessionsZWersja();
    expect(w.sesja.stepIdx).toBe(2);
    expect(w.sesja.steps[2].plannedStart).toBe(teraz);
    wyniki.push(await pominKrokWypieku('nie-ma', teraz));
    await saveBakeSession({ ...w.sesja, stepIdx: steps.length - 1 });
    wyniki.push(await pominKrokWypieku('b1', teraz));
    expect(wyniki).toEqual(['ok', 'brak', 'ostatni']);
  });
});

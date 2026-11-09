/**
 * M2-012 (D-309), ścieżka danych: trwający wypiek brioszki zapisany przed zmianą (kroki szablonu bochenka w bazie)
 * wznawia się po restarcie z tymi samymi krokami, numerem kroku i zegarem; nowe kroki brioszki dostaje tylko nowy
 * wypiek bez migawki planu. Zasada wspólna 10: kroki zapisanego wypieku nie są przeliczane od nowa.
 */
jest.mock('expo-sqlite', () => require('./helpers/node-sqlite-adapter').createExpoSqliteMock());

import { useTempDbDir, restartApp } from './helpers/node-sqlite-adapter';
import type { BakeSession } from '../bake-session-store';
import type { ActiveBakeState } from '../sqlite-schema';
import { DEFAULT_STAGE_TEMPLATES } from '../../core/reverse-scheduler';
import { krokiPieczenia, pieczenieZReceptury } from '../../core/pieczenie-receptury';
import { stepsFromTemplates } from '../../core/bake-steps';
import { CATALOG_RECIPES } from '../../recipes/katalog';

const ID = 'lievito_madre_panettone_brioche';
const START = new Date(2026, 10, 10, 8, 0).getTime();
const brioszka = CATALOG_RECIPES.find((r) => r.id === ID)!;

/** Kroki planu brioszki sprzed M2-012: szablon bochenka z pieczeniem w keksówce (D-304). */
const k = krokiPieczenia({ ...pieczenieZReceptury(brioszka), tekstZrodla: true });
const STARE_KROKI = stepsFromTemplates(
  DEFAULT_STAGE_TEMPLATES.map((t) =>
    t.category === 'preheat_oven' ? { ...t, ...k.nagrzewanie } : t.category === 'bake' ? { ...t, ...k.pieczenie, isPassive: false } : t,
  ),
  START,
);

const bake: ActiveBakeState = {
  id: 'bake_brioszka', recipeName: 'Brioszka', recipeId: ID, startedAt: START, currentStageId: 'final_shape',
  steps: STARE_KROKI,
};
const session: BakeSession = {
  version: 2, steps: STARE_KROKI, stepIdx: 6, dutchOvenPhase: 'lid_on', timerEndsAt: START + 3_600_000, pausedLeftSec: null,
  recipeName: 'Brioszka', startedAt: START, bake,
};

describe('M2-012: wypiek brioszki zapisany przed zmianą wznawia się bez zmian', () => {
  beforeEach(() => {
    useTempDbDir();
  });

  it('stare kroki (final_shape, final_proof w koszyku) mają w zapisie ids szablonu bochenka', () => {
    expect(STARE_KROKI.map((s) => s.id)).toEqual(['starter_feed', 'autolyse', 'mix', 'bulk_ferment', 'pre_shape', 'bench_rest', 'final_shape', 'final_proof', 'preheat_oven', 'bake_forma', 'cool']);
  });

  it('po restarcie: ta sama sesja z bazy, te same kroki, krok i zegar; prowadzenie nie przelicza kroków', async () => {
    const first = restartApp();
    await first.schema.initDatabase();
    const store1: typeof import('../bake-session-store') = require('../bake-session-store');
    await store1.saveBakeSession(session);

    const second = restartApp();
    await second.schema.initDatabase();
    const store2: typeof import('../bake-session-store') = require('../bake-session-store');
    const wczytana = await store2.loadBakeSession();
    expect(wczytana).toEqual(session);
    const pokazana = store2.pickBakeSession(null, wczytana);
    expect(pokazana?.steps).toEqual(STARE_KROKI);
    expect([pokazana?.stepIdx, pokazana?.timerEndsAt]).toEqual([6, START + 3_600_000]);
    expect(store2.stepsForBake(bake)).toEqual(STARE_KROKI);
  });

  it('nowy wypiek brioszki bez migawki planu dostaje kroki brioszki', () => {
    const store: typeof import('../bake-session-store') = require('../bake-session-store');
    const { steps: _s, ...bezKrokow } = bake;
    expect(store.stepsForBake(bezKrokow).map((s) => s.id)).toEqual(
      ['starter_feed', 'brioche_mix', 'brioche_cold', 'brioche_shape', 'brioche_proof', 'preheat_oven', 'bake_forma', 'cool'],
    );
  });
});

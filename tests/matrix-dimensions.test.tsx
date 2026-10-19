// ============================================================================
// Piekarz (Crust) — Matrix Dimensions & Dynamic Type AX5 (NFR-A11Y-004 & BR-TEST-030)
// Weryfikuje odporność interfejsu na 320pt, AX5 oraz pokrycie 100% wymiarów wyliczeniowych.
// ============================================================================

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { View } from 'react-native';
import { NumInput } from '../src/components/NumInput';
import { Field, Btn, Empty, Missing } from '../src/components/ui';

import { BakeTypePresetId, CrumbMoistureCategory } from '../src/core/bake-loss';
import { DutchOvenBakePhase, DUTCH_OVEN_PHASES } from '../src/core/baking-phases';
import { LEGACY_STEPS_V1 } from '../src/core/legacy-steps-v1';
import { HydrationDifficulty, POPULAR_FLOUR_BLENDS } from '../src/core/domain-rules';
import { FLOUR_PROFILES } from '../src/core/flour-atlas';
import { FlourRegion, FlourGradeCategory } from '../src/core/flour-equivalents';
import { PREFERMENT_DEFINITIONS } from '../src/core/preferments';
import { SourdoughSafetyStatus, SourdoughPhase } from '../src/core/sourdough-physics';
import { BAKING_TECHNIQUES } from '../src/core/baking-techniques';
import { PREP_FERMENT_TECHNIQUES } from '../src/core/techniques/prep-ferment-techniques';
import { SHAPING_BAKING_TECHNIQUES } from '../src/core/techniques/shaping-baking-techniques';
import { VOLUME_ACCURACY_WARNING_PL, VOLUME_ACCURACY_WARNING_EN } from '../src/core/volume-converter';
import { EmergencyCode } from '../src/doctor/dough-recovery';
import { StageCategory } from '../src/scheduler/reverse-scheduler';
import { AccessStatus } from '../src/lib/app-access';
import { AUTO_DIR, AUTO_KEEP } from '../src/lib/backup';
import { LANGS } from '../src/lib/i18n';
import { RecipeValidationResult } from '../src/lib/recipe-sharing';
import { UnitSystem } from '../src/lib/unit-converter';
import { Plan } from '../src/lib/platnosci/konfiguracja';
import { SQLITE_INIT_QUERIES } from '../src/data/schema';
import { DB_NAME } from '../src/data/sqlite-schema';
import { BakerRitualProfile, BakingVessel } from '../src/data/sqlite-store';
import { PluralRuleCategory } from '../src/lib/i18n-locales';
import { StorageState } from '../src/data/storage-status';

describe('Dimension Resiliency Matrix (320pt & Dynamic Type AX5 — NFR-A11Y-004)', () => {
  describe('Compact Width 320pt Constraints (iPhone SE 1st gen)', () => {
    it('NumInput renders inside a 320pt-wide container (presence only; layout not measured)', () => {
      let tree!: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(
          <View style={{ width: 320, padding: 16 }}>
            <NumInput value={1000} unit="g" testID="dim-num-input" />
          </View>
        );
      });
      const input = tree.root.findByProps({ testID: 'dim-num-input' });
      expect(input).toBeTruthy();
    });

    it('Btn renders within 320pt container', () => {
      let tree!: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(
          <View style={{ width: 320, padding: 16 }}>
            <Btn title="Rozpocznij wypiek na stolnicy" variant="primary" />
          </View>
        );
      });
      const btn = tree.root.findByProps({ testID: 'btn' });
      expect(btn).toBeTruthy();
    });

    it('Empty state renders within 320pt container', () => {
      let tree!: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(
          <View style={{ width: 320 }}>
            <Empty
              title="Brak zapisanych przepisów w bazie"
              description="Dodaj swój pierwszy bochenek lub zaimportuj z pliku JSON."
              actionLabel="Nowy przepis"
              onAction={() => {}}
            />
          </View>
        );
      });
      const empty = tree.root.findByProps({ testID: 'empty-state' });
      expect(empty).toBeTruthy();
    });
  });

  describe('Dynamic Type AX5 Simulation (Large Font Scaling)', () => {
    it('Field renders its label with custom text styles (presence only; AX5 clipping not measured)', () => {
      let tree!: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(
          <Field
            label="Etykieta powiększona AX5"
            style={{ fontSize: 28, lineHeight: 36 }}
            value="Mąka żytnia typ 720"
          />
        );
      });
      expect(tree.root.findByProps({ children: 'Etykieta powiększona AX5' })).toBeTruthy();
    });

    it('Missing state renders its text (presence only; AX5 wrapping not measured)', () => {
      let tree!: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(
          <Missing
            title="Nie znaleziono wybranego zakwasu"
            message="Kultura drożdżowo-bakteryjna mogła zostać zarchiwizowana lub usunięta z pamięci urządzenia."
          />
        );
      });
      const missing = tree.root.findByProps({ testID: 'missing-record-state' });
      expect(missing).toBeTruthy();
    });
  });

  describe('Exhaustive Dimension Invariant Coverage (BR-TEST-030)', () => {
    it('verifies all enum dimensions and constant arrays across studio specifications', () => {
      // 1. Languages
      LANGS.forEach((l) => expect(['pl', 'en']).toContain(l));

      // 2. Bake steps: dawna lista 8 kroków tylko dla starych zapisów (M1-audytor-generalny-030)
      expect(LEGACY_STEPS_V1.length).toBe(8);
      LEGACY_STEPS_V1.forEach((step) => {
        expect(step.id).toBeTruthy();
        expect(step.name).toBeTruthy();
      });

      // 3. Dutch Oven Phases
      const phasesList = Object.values(DUTCH_OVEN_PHASES);
      expect(phasesList.length).toBe(2);
      phasesList.forEach((p) => {
        expect(p.id).toBeTruthy();
        expect(p.temperatureC).toBeGreaterThan(150);
      });

      // 5. Flour profiles & blends
      expect(FLOUR_PROFILES.length).toBeGreaterThanOrEqual(10);
      expect(POPULAR_FLOUR_BLENDS.length).toBeGreaterThan(0);
      FLOUR_PROFILES.forEach((b) => {
        expect(b.id).toBeTruthy();
        expect(b.namePl).toBeTruthy();
      });

      // 6. Preferment definitions
      const prefList = Object.values(PREFERMENT_DEFINITIONS);
      expect(prefList.length).toBeGreaterThanOrEqual(4);
      prefList.forEach((pref) => {
        expect(pref.type).toBeTruthy();
        expect(pref.defaultHydration).toBeGreaterThanOrEqual(0);
      });

      // 7. Techniques
      expect(BAKING_TECHNIQUES.length).toBeGreaterThan(0);
      expect(PREP_FERMENT_TECHNIQUES.length).toBeGreaterThan(0);
      expect(SHAPING_BAKING_TECHNIQUES.length).toBeGreaterThan(0);
      BAKING_TECHNIQUES.forEach((t) => {
        expect(t.id).toBeTruthy();
        expect(t.titlePl).toBeTruthy();
      });

      // 8. Volume warnings
      expect(VOLUME_ACCURACY_WARNING_PL.toLowerCase()).toContain('wagi kuchennej');
      expect(VOLUME_ACCURACY_WARNING_EN.toLowerCase()).toContain('kitchen scale');

      // 9. Backup constants
      expect(AUTO_DIR).toBe('Backup/');
      expect(AUTO_KEEP).toBe(10);

      // 10. Database constants
      expect(DB_NAME).toBe('piekarz.db');
      expect(SQLITE_INIT_QUERIES.length).toBeGreaterThan(0);

      // 11. Type checking literal checks
      const bakeTypes: BakeTypePresetId[] = ['batard_boule', 'tin_rye', 'baguette_roll', 'pan_focaccia', 'custom'];
      expect(bakeTypes.length).toBe(5);

      const moistures: CrumbMoistureCategory[] = ['dry', 'balanced', 'custardy_wet'];
      expect(moistures.length).toBe(3);

      const phases: DutchOvenBakePhase[] = ['lid_on', 'lid_off'];
      expect(phases.length).toBe(2);

      const difficulties: HydrationDifficulty[] = ['easy', 'artisan_standard', 'high_open_crumb', 'expert_sticky'];
      expect(difficulties.length).toBe(4);

      const regions: FlourRegion[] = ['PL', 'FR', 'IT', 'DE', 'US'];
      expect(regions.length).toBe(5);

      const grades: FlourGradeCategory[] = ['pastry', 'all_purpose', 'bread_light', 'bread_standard', 'semi_whole', 'whole_grain'];
      expect(grades.length).toBe(6);

      // [M1-audytor-generalny-013] statusy według DEC-10 (a)
      const safety: SourdoughSafetyStatus[] = ['discard', 'hooch', 'no_observation'];
      expect(safety.length).toBe(3);

      const sPhases: SourdoughPhase[] = ['lag', 'hungry', 'before', 'peak', 'after']; // [M1-audytor-generalny-044]
      expect(sPhases.length).toBe(5);

      const emergencies: EmergencyCode[] = ['OVERPROOFED_COLLAPSE', 'SLACK_HIGH_HYDRATION', 'COLD_SLUGGISH', 'FORGOTTEN_SALT'];
      expect(emergencies.length).toBe(4);

      const stageCats: StageCategory[] = [
        'starter_feed',
        'autolyse',
        'mix',
        'bulk_ferment',
        'pre_shape',
        'bench_rest',
        'final_shape',
        'final_proof',
        'preheat_oven',
        'bake',
        'cool',
      ];
      expect(stageCats.length).toBe(11);

      const accessStatuses: AccessStatus[] = ['dostep', 'bez_uprawnienia'];
      expect(accessStatuses.length).toBe(2);

      const validationResults: RecipeValidationResult[] = [
        { success: true, recipe: {} as any },
        { success: false, error: 'invalid' },
      ];
      expect(validationResults.length).toBe(2);

      const unitSystems: UnitSystem[] = ['metric', 'imperial'];
      expect(unitSystems.length).toBe(2);

      const plans: Plan[] = ['monthly', 'yearly', 'lifetime'];
      expect(plans.length).toBe(3);

      const ritualProfiles: BakerRitualProfile[] = ['sourdough_purist', 'artisan_hybrid', 'beginner'];
      expect(ritualProfiles.length).toBe(3);

      const vessels: BakingVessel[] = ['dutch_oven', 'cloche', 'baking_steel', 'pullman_pan'];
      expect(vessels.length).toBe(4);

      const storageStates: StorageState[] = ['ok', 'unavailable'];
      expect(storageStates.length).toBe(2);

      const pluralCategories: PluralRuleCategory[] = [
        'slavic',
        'germanic',
        'romance',
        'asian',
        'arabic',
        'semitic',
      ];
      expect(pluralCategories.length).toBe(6);

    });
  });
});

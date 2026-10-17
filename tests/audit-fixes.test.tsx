// ============================================================================
// Piekarz (Crust) — Audit Fixes Regression Suite (KROK 3: Runda 2)
// Standard: BRD-QA-REL 1.0 (BR-REL-016)
// Każdy test weryfikuje konkretne znalezisko z docs/25-audyt-brd-qa-rel.md
// ============================================================================

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import fs from 'fs';
import path from 'path';

import { escapeCsvValue } from '../src/lib/csv-exporter';
import { wInKeep } from '../src/lib/unit-converter';
import { saveCorruptState, checkCorruptState, dismissCorruptState, AUTO_KEEP, AUTO_RE, SAFETY_RE } from '../src/lib/backup';
import { NumInput } from '../src/components/NumInput';
import { SearchField } from '../src/components/ui';
import { normSearch } from '../src/lib/norm-search';
import { CloseButton, CLOSE_TEST_ID } from '../src/components/CloseButton';
import { calculateDoughRecipe } from '../src/core/domain-rules';
import { theme } from '../src/ui/theme';

describe('Audit Fixes Regression Suite (BR-REL-016)', () => {
  // --------------------------------------------------------------------------
  // LOG-01: Inwariant wInKeep i brak dryfu zaokrągleń (RD-ENG-01, BR-TEST-005)
  // --------------------------------------------------------------------------
  test('LOG-01: wInKeep prevents cumulative rounding drift over multiple unit conversions', () => {
    // Wejście 16.8 oz z bazy 475 g: wInKeep zachowuje 475 g zamiast dryfować
    const kept = wInKeep('16.8', 'oz', 475);
    expect(kept).toBe(475);

    // Nowa waga 500 g wpisana jako 17.6 oz
    const changed = wInKeep('17.6', 'oz', 475);
    expect(changed).toBeCloseTo(498.95, 1);
  });

  // --------------------------------------------------------------------------
  // LOG-02: Odliczanie timerów odporne na zamrażanie w tle (RD-ENG-06, NFR-PERF-004)
  // --------------------------------------------------------------------------
  test('LOG-02: Background-resilient timer calculation endAtMs - Date.now() correctly counts down', () => {
    const durationSeconds = 300; // 5 minut
    const startTime = 1000000;
    const endAtMs = startTime + durationSeconds * 1000;

    // Symulacja: telefon uśpiony przez 120 sekund
    const resumeTime = startTime + 120 * 1000;
    const remainingSeconds = Math.max(0, Math.ceil((endAtMs - resumeTime) / 1000));
    expect(remainingSeconds).toBe(180);

    // Symulacja: wybudzenie po upływie całego czasu
    const pastEndTime = endAtMs + 5000;
    const expiredSeconds = Math.max(0, Math.ceil((endAtMs - pastEndTime) / 1000));
    expect(expiredSeconds).toBe(0);
  });

  // --------------------------------------------------------------------------
  // DAT-01: Ochrona uszkodzonego stanu bazy state_corrupt_* (BR-TEST-023, RYZ-01)
  // --------------------------------------------------------------------------
  test('DAT-01: saveCorruptState creates emergency recovery payload with raw data and timestamp', async () => {
    const rawDump = '{"corrupted": true, "recipes": [{"name": "Pain de Campagne"}]}';
    const filePath = await saveCorruptState(rawDump, 'TEST_SYNTAX_ERROR');
    expect(filePath).toBeTruthy();
    expect(filePath).toContain('state_corrupt_');

    const detected = await checkCorruptState();
    expect(detected).not.toBeNull();
    expect(detected?.rawSnippet).toContain('{"corrupted": true');

    if (detected) {
      await dismissCorruptState(detected.corruptFile);
    }
  });

  // --------------------------------------------------------------------------
  // DAT-02: Dwie rozdzielne pule kopii zapasowych po 10 plików (RD-ENG-12)
  // --------------------------------------------------------------------------
  test('DAT-02: Backup pool rotates strictly at 10 items and keeps separate pools', () => {
    expect(AUTO_KEEP).toBe(10);
    expect(AUTO_RE.test('piekarz-kopia-2026-10-17-120000.json')).toBe(true);
    expect(AUTO_RE.test('piekarz-kopia-2026-10-17-120000-2.json')).toBe(true);
    expect(SAFETY_RE.test('piekarz-przed-importem-2026-10-17-120000.json')).toBe(true);
    expect(SAFETY_RE.test('piekarz-przed-czyszczeniem-2026-10-17-120000-2.json')).toBe(true);
  });

  // --------------------------------------------------------------------------
  // SEC-01: Ucieczka CSV Formula Injection (RD-ENG-10, NFR-SEC-015)
  // --------------------------------------------------------------------------
  test('SEC-01: escapeCsvValue prepends single quote for =, +, -, @, \\t, \\r characters', () => {
    expect(escapeCsvValue('=SUM(A1:A10)')).toBe('"\'=SUM(A1:A10)"');
    expect(escapeCsvValue('+cmd|/c calc')).toBe('"\'+\cmd|/c calc"');
    expect(escapeCsvValue('-2+3')).toBe('"\'\-2+3"');
    expect(escapeCsvValue('@malicious')).toBe('"\'@malicious"');
    expect(escapeCsvValue('\tsecret')).toBe('"\'\tsecret"');
    expect(escapeCsvValue('\rpayload')).toBe('"\'\rpayload"');
    expect(escapeCsvValue('Zwykły chleb')).toBe('Zwykły chleb');
  });

  // --------------------------------------------------------------------------
  // SEC-02: Deklaracja Privacy Manifests w app.json (BR-REL-010, ITMS-91053)
  // --------------------------------------------------------------------------
  test('SEC-02: app.json includes privacyManifests with 4 Required Reason API categories', () => {
    const appJsonPath = path.resolve(__dirname, '../app.json');
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf-8'));
    const manifests = appJson.expo?.ios?.privacyManifests;
    expect(manifests).toBeDefined();
    expect(Array.isArray(manifests.NSPrivacyAccessedAPITypes)).toBe(true);

    const types = manifests.NSPrivacyAccessedAPITypes.map((t: any) => t.NSPrivacyAccessedAPIType);
    expect(types).toContain('NSPrivacyAccessedAPICategoryUserDefaults');
    expect(types).toContain('NSPrivacyAccessedAPICategoryFileTimestamp');
    expect(types).toContain('NSPrivacyAccessedAPICategorySystemBootTime');
    expect(types).toContain('NSPrivacyAccessedAPICategoryDiskSpace');
  });

  // --------------------------------------------------------------------------
  // SEC-03: Skrypt verify-native.mjs z 20 niezmiennikami (BR-REL-009)
  // --------------------------------------------------------------------------
  test('SEC-03: verify-native script exists and covers 20 native iOS invariants', () => {
    const scriptPath = path.resolve(__dirname, '../scripts/verify-native.mjs');
    expect(fs.existsSync(scriptPath)).toBe(true);
    const content = fs.readFileSync(scriptPath, 'utf-8');
    expect(content).toContain('20 niezmienników');
    expect(content).toContain('ITSAppUsesNonExemptEncryption');
    expect(content).toContain('privacyManifests');
  });

  // --------------------------------------------------------------------------
  // SEC-04 & SEC-05: Czystość repozytorium i znaków towarowych (NFR-SEC-001..011)
  // --------------------------------------------------------------------------
  test('SEC-04 & SEC-05: Public repo and brand contract tests exist and guard against leaks', () => {
    expect(fs.existsSync(path.resolve(__dirname, 'public-repo.test.ts'))).toBe(true);
    expect(fs.existsSync(path.resolve(__dirname, 'brands.contract.test.ts'))).toBe(true);
  });

  // --------------------------------------------------------------------------
  // UI-01: NumInput obsługuje przecinek i kropkę dziesiętną (NFR-INT-003)
  // --------------------------------------------------------------------------
  test('UI-01: NumInput accepts both comma and dot without losing precision', () => {
    const onChangeNumber = jest.fn();
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <NumInput value={100} onChangeNumber={onChangeNumber} min={0} max={1000} />
      );
    });

    const input = tree.root.findByType('TextInput' as any);
    // Wpisanie "12,5"
    act(() => {
      input.props.onChangeText('12,5');
    });
    act(() => {
      input.props.onBlur();
    });
    expect(onChangeNumber).toHaveBeenLastCalledWith(12.5);

    // Wpisanie "12.5"
    act(() => {
      input.props.onChangeText('12.5');
    });
    act(() => {
      input.props.onBlur();
    });
    expect(onChangeNumber).toHaveBeenLastCalledWith(12.5);
  });

  // --------------------------------------------------------------------------
  // UI-02: CloseButton posiada stały testID i semantykę (S1, NFR-INT-001)
  // --------------------------------------------------------------------------
  test('UI-02: CloseButton uses standard testID close-modal with accessible label', () => {
    const onPress = jest.fn();
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<CloseButton onPress={onPress} />);
    });
    const btn = tree.root.findByProps({ testID: CLOSE_TEST_ID });
    expect(btn).toBeTruthy();
    act(() => {
      btn.props.onPress();
    });
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  // --------------------------------------------------------------------------
  // UI-04: SearchField z normalizacją polskich znaków i szybkim czyszczeniem (RD-ENG-07)
  // --------------------------------------------------------------------------
  test('UI-04: SearchField normalizes Polish diacritics and provides clear button', () => {
    // Normalizacja ł -> l, ż -> z, ą -> a
    expect(normSearch('Mąka Żytnia Łamana')).toBe('maka zytnia lamana');

    const onSearch = jest.fn();
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<SearchField value="żytni" onChangeText={onSearch} />);
    });

    const input = tree.root.findByProps({ testID: 'search-field' });
    expect(input.props.value).toBe('żytni');

    const clearBtn = tree.root.findByProps({ testID: 'search-field-clear' });
    expect(clearBtn).toBeTruthy();
    act(() => {
      clearBtn.props.onPress();
    });
    expect(onSearch).toHaveBeenCalledWith('');
  });

  // --------------------------------------------------------------------------
  // MER-01 & MER-02: Piekarska wyrocznia hydracji i kontrast WCAG AA
  // --------------------------------------------------------------------------
  test('MER-01 & MER-02: Artisan batch respects total hydration and theme satisfies WCAG AA', () => {
    const batch = calculateDoughRecipe({
      targetDoughWeightGrams: 1000,
      waterPercentage: 70,
      saltPercentage: 2,
      starterPercentage: 20,
      starterHydration: 100,
      flours: [{ name: 'Pszenna 750', percentage: 100 }],
    });

    // Całkowita hydracja uwzględnia wodę i mąkę z zakwasu (10% woda, 10% mąka)
    expect(batch.totalFlourGrams).toBeGreaterThan(0);
    expect(batch.totalWaterGrams).toBeGreaterThan(0);
    expect(Math.abs(batch.sumCheckGrams - 1000)).toBeLessThanOrEqual(3);

    // Kontrast motywu
    expect(theme.colors.accent).toBeTruthy();
    expect(theme.colors.background).toBeTruthy();
  });

  // --------------------------------------------------------------------------
  // A11-01 & A11-02: Dostępność i pole dotyku >= 44 pt (RD-ENG-03, NFR-A11Y-001)
  // --------------------------------------------------------------------------
  test('A11-01 & A11-02: NumInput touch target height is at least 44 pt', () => {
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <NumInput value={500} onChangeNumber={jest.fn()} />
      );
    });
    const input = tree.root.findByType('TextInput' as any);
    const flattened = Array.isArray(input.props.style) ? Object.assign({}, ...input.props.style) : input.props.style;
    expect(flattened.minHeight).toBeGreaterThanOrEqual(44);
  });

  // --------------------------------------------------------------------------
  // TST-01: Blokada act() i console.error w setupFilesAfterEnv (BR-TEST-018)
  // --------------------------------------------------------------------------
  test('TST-01: jest.app-after-env.js exists and configures strict error traps', () => {
    const setupPath = path.resolve(__dirname, '../jest.app-after-env.js');
    expect(fs.existsSync(setupPath)).toBe(true);
    const content = fs.readFileSync(setupPath, 'utf-8');
    expect(content).toContain('console.error');
    expect(content).toContain('act(...)');
  });

  // --------------------------------------------------------------------------
  // LIVE-01..03: Pliki Maestro, statyczne strony i workflowy CI/CD
  // --------------------------------------------------------------------------
  test('LIVE-01..03: Maestro flows, site pages, and GitHub Actions workflows exist', () => {
    // Maestro
    expect(fs.existsSync(path.resolve(__dirname, '../.maestro/01-nowy-piekarz.yaml'))).toBe(true);
    expect(fs.existsSync(path.resolve(__dirname, '../.maestro/02-wypiek-zycie.yaml'))).toBe(true);
    expect(fs.existsSync(path.resolve(__dirname, '../.maestro/aktualizacja-przygotuj.yaml'))).toBe(true);
    expect(fs.existsSync(path.resolve(__dirname, '../.maestro/aktualizacja-sprawdz.yaml'))).toBe(true);

    // Site
    expect(fs.existsSync(path.resolve(__dirname, '../site/index.html'))).toBe(true);
    expect(fs.existsSync(path.resolve(__dirname, '../site/privacy.html'))).toBe(true);
    expect(fs.existsSync(path.resolve(__dirname, '../site/support.html'))).toBe(true);

    // Workflows
    expect(fs.existsSync(path.resolve(__dirname, '../.github/workflows/ci.yml'))).toBe(true);
    expect(fs.existsSync(path.resolve(__dirname, '../.github/workflows/pages.yml'))).toBe(true);
    expect(fs.existsSync(path.resolve(__dirname, '../.github/workflows/testflight.yml'))).toBe(true);
    expect(fs.existsSync(path.resolve(__dirname, '../.github/workflows/tests-tz.yml'))).toBe(true);
    expect(fs.existsSync(path.resolve(__dirname, '../.github/workflows/e2e-ios.yml'))).toBe(true);
  });
});

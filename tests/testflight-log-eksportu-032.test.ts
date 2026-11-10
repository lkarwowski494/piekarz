// ============================================================================
// Piekarz — testflight.yml: pełny log eksportu i wysyłki jako artefakt (032, KO-025, 2026-11-10; sesja J).
// Bez pełnego logu nie wiadomo, czy xcodebuild wysłał symbole (dSYM): job pokazywał tylko tail -30 (TF #25).
// Log idzie do artefaktu wyłącznie po kontroli wzorców sekretów, z krótką retencją; linie o symbolach do podsumowania.
// ============================================================================

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const wf = readFileSync(join(__dirname, '..', '.github', 'workflows', 'testflight.yml'), 'utf8').replace(/\r\n/g, '\n');
const buildJob = wf.split(/\n  tag:\n/)[0];
const steps = buildJob.split(/\n      - name: /).slice(1);
const idx = (re: RegExp) => steps.findIndex((s) => re.test(s));

describe('testflight.yml: pełny log eksportu (032)', () => {
  const eksport = idx(/xcodebuild -exportArchive/);
  const kontrola = idx(/^Full export log/);
  const wysylka = idx(/^Upload full export log/);
  const sprzatanie = idx(/^Clean up credentials/);

  it('kroki: eksport → kontrola logu → artefakt → sprzątanie poświadczeń', () => {
    expect(eksport).toBeGreaterThanOrEqual(0);
    expect(kontrola).toBeGreaterThan(eksport);
    expect(wysylka).toBeGreaterThan(kontrola);
    expect(sprzatanie).toBeGreaterThan(wysylka);
  });

  it('log eksportu ma maskowane identyfikatory klucza, wydawcy i zespołu', () => {
    const e = steps[eksport];
    for (const z of ['ASC_KEY_ID', 'ASC_ISSUER_ID', 'APPLE_TEAM_ID']) expect(e).toContain(`-e "s/\${${z}}/`);
  });

  it('kontrola: wzorce (klucz, base64 klucza EC, JWT, Bearer, AuthKey) i prawdziwe wartości sekretów bez wielkości liter', () => {
    const k = steps[kontrola] ?? '';
    expect(k).toMatch(/if: always\(\)/);
    for (const w of ['BEGIN [A-Z ]*PRIVATE KEY', 'MIG[A-Za-z0-9+/]{40,}', 'eyJ', '[Bb]earer', 'AuthKey_']) expect(k).toContain(w);
    expect(k).toMatch(/grep -qiF -f "\$WARTOSCI" "\$LOG"/);
    for (const z of ['ASC_KEY_ID', 'ASC_ISSUER_ID', 'APPLE_TEAM_ID']) expect(k).toContain(`"$${z}"`);
    expect(k).toMatch(/KEY_PATH[\s\S]*fold -w 16/);
  });

  it('trafienie albo błąd odczytu (grep ≥ 2) = log usunięty, bez artefaktu', () => {
    const k = steps[kontrola] ?? '';
    expect(k).toMatch(/niebezpieczny\(\) \{[^}]*"\$LOG"; echo "bezpieczny=false"/);
    expect((k.match(/\[ "\$RC" -eq 1 \] \|\| niebezpieczny/g) ?? []).length).toBe(2);
  });

  it('sekrety tylko w env kroku, nigdy przez ${{ }} w run; nazwy certyfikatów maskowane', () => {
    const k = steps[kontrola] ?? '';
    const run = k.slice(k.indexOf('run: |'));
    expect(run).not.toMatch(/\$\{\{/);
    expect(k.slice(0, k.indexOf('run: |'))).toMatch(/ASC_KEY_ID: \$\{\{ secrets\.ASC_KEY_ID \}\}/);
    expect(run).toContain('(Distribution|Development|Developer)): [^"()]*/\\1: <NAZWA>/g');
  });

  it('podsumowanie joba ma linie o symbolach (dSYM)', () => {
    expect(steps[kontrola]).toMatch(/grep -iE 'dsym\|symbol'[\s\S]*GITHUB_STEP_SUMMARY/);
  });

  it('artefakt tylko po kontroli, tylko log eksportu, retencja ≤ 3 dni', () => {
    const u = steps[wysylka] ?? '';
    expect(u).toMatch(/if: always\(\) && steps\.log_eksportu\.outputs\.bezpieczny == 'true'/);
    expect(u).toMatch(/uses: actions\/upload-artifact@v4/);
    expect(u).toMatch(/path: \/tmp\/xcodebuild-export\.log\n/);
    const dni = Number(/retention-days: (\d+)/.exec(u)?.[1]);
    expect(dni).toBeGreaterThan(0);
    expect(dni).toBeLessThanOrEqual(3);
  });

  it('wynik symboli: „Upload Symbols Failed” → wyjście build.symbole; osobne zadanie symbole pada, tag od niego nie zależy (KO-028)', () => {
    expect(steps[kontrola]).toMatch(/grep -q 'Upload Symbols Failed' "\$LOG"; then echo "symbole=nieudane"/);
    expect(buildJob).toMatch(/\n {6}symbole: \$\{\{ steps\.log_eksportu\.outputs\.symbole \}\}\n/);
    const zadanie = wf.split(/\n {2}symbole:\n/)[1]?.split(/\n {2}tag:\n/)[0] ?? '';
    expect(zadanie).toMatch(/needs: build\n/);
    expect(zadanie).toMatch(/if: always\(\) && needs\.build\.result == 'success'/);
    expect(zadanie).toMatch(/if \[ "\$SYMBOLE" != ok \]; then[\s\S]*::error::[\s\S]*exit 1/);
    expect(wf.split(/\n {2}tag:\n/)[1]).toMatch(/needs: build\n/);
  });
});

describe('testflight.yml: dSYM prebudowanych frameworków w archiwum (032, KO-028)', () => {
  const dsym = idx(/^Add dSYMs of prebuilt React Native frameworks/);
  const skrypt = readFileSync(join(__dirname, '..', 'scripts', 'ci', 'dsym-ramy.sh'), 'utf8');
  const esc = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  it('krok po archiwum, przed kluczem .p8 i eksportem, bez sekretów', () => {
    expect(dsym).toBeGreaterThan(idx(/xcodebuild archive/));
    expect(dsym).toBeLessThan(idx(/^Prepare App Store Connect API Key/));
    expect(steps[dsym]).toContain('bash scripts/ci/dsym-ramy.sh "$RUNNER_TEMP/$APP_SCHEME.xcarchive"');
    expect(steps[dsym]).not.toMatch(/secrets\./);
  });

  it('pobieranie nie zawiesza wydania: budżet w skrypcie, limit kroku jako bezpiecznik; zadanie symbole wymaga 3 dodanych dSYM', () => {
    expect(steps[dsym]).toMatch(/\n {8}id: dsym\n/);
    expect(Number(/\n {8}timeout-minutes: (\d+)\n/.exec(steps[dsym])?.[1])).toBeLessThanOrEqual(15);
    expect(steps[dsym]).not.toMatch(/continue-on-error/);
    expect(buildJob).toMatch(/\n {6}dsym_dodane: \$\{\{ steps\.dsym\.outputs\.dodane \}\}\n/);
    const zadanie = wf.split(/\n {2}symbole:\n/)[1]?.split(/\n {2}tag:\n/)[0] ?? '';
    expect(zadanie).toMatch(/if \[ "\$DSYM_DODANE" != 3 \]; then[\s\S]*::error::[\s\S]*exit 1/);
  });

  it.each([
    ['React', 'reactnative-core-dSYM-release.tar.gz', 'ios-arm64/React.framework.dSYM'],
    ['ReactNativeDependencies', 'reactnative-dependencies-dSYM-release.tar.gz', 'ios-arm64/ReactNativeDependencies.framework.dSYM'],
    ['hermesvm', 'hermes-framework-dSYM-release.tar.gz', 'iphoneos/hermesvm.framework.dSYM'],
  ])('%s: dSYM release z Maven tej samej wersji, do <archiwum>/dSYMs', (nazwa, plik, wtar) => {
    expect(skrypt).toMatch(new RegExp(`\\ndodaj ${nazwa} "[^"]*${esc(plik)}" ${esc(wtar)}\\n`));
  });

  it('kontrole: curl -L (Maven przekierowuje), SHA-256 z pliku .sha256, UUID dSYM = UUID binarki w archiwum', () => {
    expect(skrypt).toContain('--max-time "$(reszta)" -o "$plik"');
    expect(skrypt).toMatch(/BUDZET_S=\$\{DSYM_BUDZET_S:-(\d+)\}/);
    expect(Number(/BUDZET_S=\$\{DSYM_BUDZET_S:-(\d+)\}/.exec(skrypt)?.[1])).toBeLessThanOrEqual(600);
    expect(skrypt).toContain('budżet czasu pobierania wyczerpany');
    expect(skrypt.trimEnd().endsWith('exit 0')).toBe(true);
    expect(skrypt).toContain('--max-time 30 "$MAVEN/$sciezka.sha256"');
    expect(skrypt).toContain('awk \'$3 == "(arm64)" {print $2; exit}\'');
    expect(skrypt).toContain('echo "dodane=$DODANE" >> "$GITHUB_OUTPUT"');
    expect(skrypt).toContain('"$MAVEN/$sciezka.sha256"');
    expect(skrypt).toContain('"$oczek" != "$jest"');
    expect(skrypt).toContain('dwarfdump --uuid "$bin"');
    expect(skrypt).toContain('"$u_bin" != "$u_dsym"');
    expect(skrypt).toContain('cp -R "$TMP/$nazwa/$wtar" "$ARCHIWUM/dSYMs/"');
  });

  it('wersje: React Native z node_modules, Hermes jak hermes-engine.podspec (V1, chyba że RCT_HERMES_V1_ENABLED=0)', () => {
    expect(skrypt).toContain("require('$ROOT/node_modules/react-native/package.json').version");
    expect(skrypt).toContain('if [ "${RCT_HERMES_V1_ENABLED:-}" = "0" ]; then KLUCZ=HERMES_VERSION_NAME; else KLUCZ=HERMES_V1_VERSION_NAME; fi');
    const podspec = readFileSync(join(__dirname, '..', 'node_modules', 'react-native', 'sdks', 'hermes-engine', 'hermes-engine.podspec'), 'utf8');
    expect(podspec).toMatch(/if ENV\['RCT_HERMES_V1_ENABLED'\] == "0"\n\s+version = versionProperties\['HERMES_VERSION_NAME'\]\nelse\n\s+version = versionProperties\['HERMES_V1_VERSION_NAME'\]/);
  });
});

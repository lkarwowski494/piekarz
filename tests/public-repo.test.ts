// ============================================================================
// Piekarz (Crust) — Public Repository Security & CI/CD Invariants (BR-REL-019..022, NFR-SEC)
// Rozdział 12.5 BRD: Weryfikacja izolacji sieciowej, uprawnień CI i czystości repozytorium.
// ============================================================================

import { execSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

describe('Bezpieczeństwo publicznego repozytorium i potoku CI/CD (NFR-SEC)', () => {
  const wfDir = join(root, '.github', 'workflows');
  const wfFiles = existsSync(wfDir)
    ? readdirSync(wfDir).filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'))
    : [];

  test('wszystkie pliki .github/workflows/*.yml przestrzegają zasad minimalnych uprawnień i izolacji', () => {
    expect(wfFiles.length).toBeGreaterThan(0);
    for (const file of wfFiles) {
      const content = readFileSync(join(wfDir, file), 'utf8');
      // 1. Zakaz pull_request_target
      expect(content).not.toMatch(/pull_request_target/);
      // 2. Jawne permissions na poziomie głównym
      expect(content).toMatch(/^permissions:\s*\n\s+(contents|pages):\s*(read|write)/m);
      // 3. Jawne timeout-minutes
      expect(content).toMatch(/timeout-minutes:\s*\d+/);
      // 4. Zakaz bezpośredniej interpolacji danych wejściowych użytkownika w blokach run:
      const runBlocks = content.split(/\n\s*-\s+name:/);
      for (const block of runBlocks) {
        if (block.includes('run:')) {
          const runPart = block.slice(block.indexOf('run:'));
          expect(runPart).not.toMatch(/\$\{\{\s*github\.event\.(inputs|pull_request|head_commit|issue|comment)/);
          expect(runPart).not.toMatch(/\$\{\{\s*github\.head_ref/);
        }
      }
      // 5. Dozwolone wyłącznie oficjalne akcje actions/* lub przypięte po 40-znakowym SHA
      const usesMatches = [...content.matchAll(/uses:\s*([^\s#]+)/g)];
      for (const m of usesMatches) {
        const action = m[1];
        const isOfficial = action.startsWith('actions/');
        const isPinnedSha = /@[0-9a-f]{40}$/.test(action);
        expect(isOfficial || isPinnedSha).toBe(true);
      }
    }
  });

  test('testflight.yml zapisuje klucz .p8 dopiero po pod install, filtruje logi i nie wysyła .ipa do artefaktów', () => {
    const tfPath = join(wfDir, 'testflight.yml');
    if (!existsSync(tfPath)) return;
    const tf = readFileSync(tfPath, 'utf8');
    const podIdx = tf.indexOf('pod install');
    const keyIdx = tf.indexOf('ASC_KEY_P8_BASE64');
    expect(podIdx).toBeGreaterThan(0);
    expect(keyIdx).toBeGreaterThan(podIdx);
    expect(tf).toContain('umask 077');
    expect(tf).toContain('<KEY_ID>');
    expect(tf).toContain('<ISSUER_ID>');
    expect(tf).toContain('EXPO_PUBLIC_STORE_FAKE');
    expect(tf).not.toMatch(/path:.*\.(ipa|xcarchive)/);
  });

  test('żaden plik śledzony przez Git nie jest kluczem prywatnym, certyfikatem ani plikiem .env', () => {
    let tracked: string[] = [];
    try {
      tracked = execSync('git ls-files', { cwd: root, encoding: 'utf8' })
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
    } catch {
      // In non-git test environment fallback to empty list
      tracked = [];
    }

    const forbiddenExt = /\.(p8|p12|mobileprovision|cer|keystore|jks|ipa)$/i;
    for (const f of tracked) {
      expect(f).not.toMatch(forbiddenExt);
      expect(f).not.toMatch(/(^|\/)\.env(\..+)?$/);
      if (/\.(ts|tsx|js|mjs|json|md|yml|yaml|html)$/.test(f) && f !== 'tests/public-repo.test.ts') {
        const body = readFileSync(join(root, f), 'utf8');
        expect(body).not.toMatch(/-----BEGIN [A-Z ]*PRIVATE KEY-----/);
      }
    }
  });

  test('app.json ma ustawione ITSAppUsesNonExemptEncryption: false oraz kompletny PrivacyManifests', () => {
    const appJson = JSON.parse(readFileSync(join(root, 'app.json'), 'utf8')).expo;
    expect(appJson.ios?.infoPlist?.ITSAppUsesNonExemptEncryption).toBe(false);
    const apiTypes = (appJson.ios?.privacyManifests?.NSPrivacyAccessedAPITypes || []).map(
      (x: { NSPrivacyAccessedAPIType: string }) => x.NSPrivacyAccessedAPIType
    );
    expect(apiTypes).toEqual(
      expect.arrayContaining([
        'NSPrivacyAccessedAPICategoryUserDefaults',
        'NSPrivacyAccessedAPICategoryFileTimestamp',
        'NSPrivacyAccessedAPICategorySystemBootTime',
        'NSPrivacyAccessedAPICategoryDiskSpace',
      ])
    );
  });

  test('strony prawne site/ (index.html, privacy.html, support.html) istnieją i mają poprawne linki', () => {
    for (const page of ['index.html', 'privacy.html', 'support.html']) {
      const p = join(root, 'site', page);
      expect(existsSync(p)).toBe(true);
      const html = readFileSync(p, 'utf8');
      expect(html).toMatch(/<!DOCTYPE html>/i);
      expect(html).not.toMatch(/\b(TODO|FIXME|PLACEHOLDER|example\.com)\b/i);
    }
  });

  test('izolacja sieciowa (100% Offline-First): zero wywołań sieciowych w kodzie produkcyjnym (NFR-SEC-014) (BR-PRYW-001 Tryb samolotowy)', () => {
    function getCodeFiles(dir: string): string[] {
      const res: string[] = [];
      if (!existsSync(dir)) return res;
      for (const item of readdirSync(dir)) {
        if (['node_modules', '.git', '__tests__'].includes(item)) continue;
        const p = join(dir, item);
        try {
          const s = require('fs').statSync(p);
          if (s.isDirectory()) res.push(...getCodeFiles(p));
          else if (p.endsWith('.ts') || p.endsWith('.tsx')) res.push(p);
        } catch {}
      }
      return res;
    }

    const prodFiles = [
      ...getCodeFiles(join(root, 'app')),
      ...getCodeFiles(join(root, 'src', 'components')),
      ...getCodeFiles(join(root, 'src', 'core')),
      ...getCodeFiles(join(root, 'src', 'lib')),
    ];

    for (const file of prodFiles) {
      const code = readFileSync(file, 'utf8');
      // No raw fetch, XMLHttpRequest, WebSocket or axios
      expect(code).not.toMatch(/\bfetch\s*\(/);
      expect(code).not.toMatch(/\bnew\s+XMLHttpRequest\s*\(/);
      expect(code).not.toMatch(/\bnew\s+WebSocket\s*\(/);
      expect(code).not.toMatch(/\baxios\b/);
    }
  });
});

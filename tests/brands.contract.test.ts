// ============================================================================
// Piekarz (Crust) — Brand Consistency & Trademark Safety Contract (NFR-SEC-011)
// Weryfikuje spójność tożsamości marki Piekarz / Crust i brak naruszeń znaków towarowych.
// ============================================================================

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

describe('Brand Identity & Trademark Contract (NFR-SEC-011)', () => {
  const root = process.cwd();
  const appJson = JSON.parse(readFileSync(join(root, 'app.json'), 'utf8')).expo;
  const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

  test('app.json defines the studio brand name and bundle identifier consistently', () => {
    expect(appJson.name).toBe('Piekarz');
    expect(appJson.slug).toBe('piekarz');
    expect(appJson.scheme).toBe('piekarz');
    expect(appJson.ios?.bundleIdentifier).toBe('com.apps4brew.baker');
    expect(appJson.android?.package).toBe('com.apps4brew.baker');
  });

  test('package.json matches the studio application name', () => {
    expect(packageJson.name).toBe('piekarz');
    expect(packageJson.description).toContain('Piekarz');
  });

  test('site/ pages consistently declare Piekarz and Apps4Brew studio ownership', () => {
    for (const page of ['index.html', 'privacy.html', 'support.html']) {
      const p = join(root, 'site', page);
      expect(existsSync(p)).toBe(true);
      const content = readFileSync(p, 'utf8');
      expect(content).toContain('Piekarz');
      expect(content).toContain('Apps4Brew Studio');
    }
  });

  test('ensures absence of infringing third-party commercial trademark claims', () => {
    const prohibitedTrademarks = [
      'Thermomix®',
      'KitchenAid®',
      'Le Creuset®',
      'Lodge®',
    ];
    const indexContent = readFileSync(join(root, 'site', 'index.html'), 'utf8');
    for (const mark of prohibitedTrademarks) {
      expect(indexContent).not.toContain(mark);
    }
  });
});

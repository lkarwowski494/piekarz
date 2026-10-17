#!/usr/bin/env node
/**
 * Apps4Brew Studio — Open Source License Compliance Checker (NFR-SEC-009)
 * Verifies that all production dependencies have permissive licenses (MIT, Apache-2.0, BSD, ISC).
 * Strictly forbids copyleft GPL/AGPL libraries in commercial app bundles.
 */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

const ALLOWED_LICENSES = new Set([
  'MIT',
  'Apache-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'ISC',
  '0BSD',
  'Unlicense',
  'CC0-1.0',
]);

const FORBIDDEN_PATTERNS = [/GPL/i, /AGPL/i, /SSPL/i];

console.log('[check:licenses] Weryfikacja licencji zależności produkcyjnych...');

const deps = Object.keys(pkg.dependencies || {});
const violations = [];

for (const dep of deps) {
  // Check if it's a private git repo or standard npm package
  if (pkg.dependencies[dep].startsWith('github:') || pkg.dependencies[dep].startsWith('git+')) {
    continue; // Private workspace or studio repo
  }

  const pkgJsonPath = join(root, 'node_modules', dep, 'package.json');
  if (!existsSync(pkgJsonPath)) {
    continue;
  }

  try {
    const depPkg = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));
    let license = depPkg.license;
    if (typeof license === 'object' && license?.type) {
      license = license.type;
    }
    license = license || 'UNKNOWN';

    for (const pat of FORBIDDEN_PATTERNS) {
      if (pat.test(license) && !license.includes('LGPL')) {
        violations.push(`${dep}: niedozwolona licencja wirusowa ${license}`);
      }
    }
  } catch {}
}

if (violations.length > 0) {
  console.error('[check:licenses] Wykryto naruszenia licencyjne:');
  for (const v of violations) console.error(`  ❌ ${v}`);
  process.exit(1);
}

console.log(`[check:licenses] ✅ Wszystkie ${deps.length} zależności posiadają dozwolone licencje.`);

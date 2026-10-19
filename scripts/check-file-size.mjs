#!/usr/bin/env node
// Limit 20 480 B dla plików produkcyjnych .ts/.tsx w app/ i src/ (CLAUDE.md, M1-audytor-generalny-038).
// Użycie: node scripts/check-file-size.mjs [katalog-repo]; kod 1 przy przekroczeniu.
import { readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const LIMIT = 20_480;
const root = process.argv[2] ?? join(fileURLToPath(import.meta.url), '..', '..');

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return name === '__tests__' || name === 'node_modules' ? [] : walk(p);
    return /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name) ? [p] : [];
  });
}

const files = ['app', 'src'].flatMap((d) => walk(join(root, d)));
const over = files.map((f) => ({ f, size: statSync(f).size })).filter((x) => x.size > LIMIT);
for (const { f, size } of over) console.error(`ZA DUŻY: ${relative(root, f)} ${size} B > ${LIMIT} B`);
console.log(`check:size: ${files.length} plików, przekroczeń: ${over.length}`);
process.exit(over.length ? 1 : 0);

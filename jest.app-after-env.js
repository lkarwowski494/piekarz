/* global jest, beforeEach, afterEach */
// jest.app-after-env.js — Apps4Brew Studio Jest Environment Hardening (BR-TEST-018)
// Automatyczne oblewanie testu przy jakimkolwiek ostrzeżeniu act(), console.error lub nieoczekiwanym console.warn.

const ALLOWED_ACT_WARNINGS = ['BottomTabView'];
const originalError = console.error;
const originalWarn = console.warn;

let actWarnings = [];
let consoleErrors = [];

console.error = (...args) => {
  const text = String(args[0] ?? '');
  if (text.includes('not wrapped in act')) {
    const isAllowed = ALLOWED_ACT_WARNINGS.some((allowed) => String(args[1] ?? '').includes(allowed));
    if (!isAllowed) {
      actWarnings.push(text.split('\n')[0].replace('%s', String(args[1] ?? '')));
    }
  } else {
    consoleErrors.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
  }
  originalError(...args);
};

beforeEach(() => {
  actWarnings = [];
  consoleErrors = [];
});

afterEach(() => {
  const seenAct = [...new Set(actWarnings)];
  const seenErrors = [...new Set(consoleErrors)];
  actWarnings = [];
  consoleErrors = [];

  if (seenAct.length > 0) {
    throw new Error(`[BR-TEST-018] Niedozwolone ostrzeżenia act(...) w teście:\n${seenAct.join('\n')}`);
  }
  if (seenErrors.length > 0) {
    throw new Error(`[BR-TEST-018] Niedozwolone wywołania console.error w teście:\n${seenErrors.join('\n')}`);
  }
});

// Stały lub losowy seed dla powtarzalności testów własnościowych
const seed = process.env.PROP_SEED || process.env.MATRIX_SEED || '17102026';
if (!process.env.PROP_SEED) {
  process.env.PROP_SEED = seed;
}

// Globalny timeout dla testów
jest.setTimeout(30_000);

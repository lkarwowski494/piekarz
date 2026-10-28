/**
 * Przebieg przekładu a5d (M3 T2, D-123: teksty bez nazw źródeł i ekran „Źródła wiedzy”; Message Batches M1 2026-10-28,
 * 175 kluczy × 33 języki, walidacja 0 braków / 0 błędów), wpięty na redesign/piekarz-2026-10-22 przez M3
 * (scripts/wepnij-przeklad.mjs, 2026-10-29): każdy klucz z audit/M3-2026-10-22/przeklad-a5/a5d-klucze.json jest
 * kluczem słownika EN i ma w każdym z 33 języków własny, niepusty wpis. Kopia listy kluczy: tests/fixtures/a5d-klucze.json
 * (audit/ jest poza repo). Do tego „100% hydratacji” zaczynu poolish w lt, uk, zh-Hant, vi i el dotyczy zaczynu, nie ciasta
 * (poprawki przekładu M1 2026-10-28). Regresja: klucz zniknie ze słownika albo wróci przypis do źródła.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { EN } from '../src/lib/i18n.en';
import { getAllSupportedLocaleCodes } from '../src/lib/i18n-locales';

const root = path.join(__dirname, '..');

/** Słownik języka z plików src/lib/i18n-slowniki/<kod>/czesc-N.ts (literały 'klucz': 'wartość', jak w teście 093). */
function slownik(kod: string): Map<string, string> {
  const dir = path.join(root, 'src/lib/i18n-slowniki', kod);
  const m = new Map<string, string>();
  for (const f of fs.readdirSync(dir).filter((x) => /^czesc-\d+\.ts$/.test(x))) {
    const src = fs.readFileSync(path.join(dir, f), 'utf8');
    for (const [, k, v] of src.matchAll(/^\s*('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"):\s*('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"),?$/gm)) {
      m.set(JSON.parse(k.startsWith("'") ? `"${k.slice(1, -1).replace(/\\'/g, "'").replace(/"/g, '\\"')}"` : k),
        JSON.parse(v.startsWith("'") ? `"${v.slice(1, -1).replace(/\\'/g, "'").replace(/"/g, '\\"')}"` : v));
    }
  }
  return m;
}

const KLUCZE_A5D: string[] = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/a5d-klucze.json'), 'utf8'));
const POOLISH = 'Zaczyn poolish (20% mąki, 100% hydratacji). Piecz na rozgrzanej płycie stalowej albo kamieniu szamotowym, z dużą ilością pary. Poolish dojrzewa około 14 godzin, a ciasto rośnie 45 i jeszcze 45 minut.';
const ZACZYN_NIE_CIASTO: Record<string, [string, string]> = {
  lt: ['įmaišo hidratacija 100 %', 'tešlos hidratacija'],
  uk: ['гідратація опари 100%', 'гідратація тіста'],
  'zh-Hant': ['酵頭含水量 100%', '麵團含水量'],
  vi: ['độ ẩm bột men 100%', 'độ ẩm bột 100%'],
  el: ['100% ενυδάτωση της προζύμωσης', 'ενυδάτωση ζύμης'],
};

describe('przekład a5d wpięty (M3 T2, D-123)', () => {
  it('175 kluczy a5d, każdy jest kluczem słownika EN', () => {
    expect(KLUCZE_A5D).toHaveLength(175);
    expect(KLUCZE_A5D.filter((k) => typeof EN[k] !== 'string')).toEqual([]);
  });

  it.each(getAllSupportedLocaleCodes().filter((k) => k !== 'pl' && k !== 'en'))('%s: każdy klucz a5d ma własny, niepusty wpis', (kod) => {
    const s = slownik(kod);
    expect(KLUCZE_A5D.filter((k) => !(s.get(k) ?? '').trim())).toEqual([]);
  });

  it.each(Object.entries(ZACZYN_NIE_CIASTO))('%s: „100% hydratacji” poolish dotyczy zaczynu, nie ciasta', (kod, [jest, nieMa]) => {
    const t = slownik(kod).get(POOLISH) ?? '';
    expect(t).toContain(jest);
    expect(t).not.toContain(nieMa);
  });
});

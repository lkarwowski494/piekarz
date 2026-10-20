/**
 * M1-audytor-generalny-103, BR-ETAP-004 (RD-22, RD-23; ER-42): ostrzeżenia według rodzaju kroku. Mapa i teksty
 * dosłownie z docs/tresci/pl|en/ostrzezenia-krokow.md (przegląd człowieka w rejestrze) i wypiek-bezpieczenstwo.md.
 * Każdy rodzaj kroku z kodu jest w mapie; krok nieznanego rodzaju dostaje zdanie RD-22-W4, w czasie wypieku też RD-23-W4.
 */
import {
  STEP_KIND_WARNINGS,
  STARTER_WARNINGS,
  RAW_DOUGH_WARNINGS,
  HOT_VESSEL_WARNING,
  CHILDREN_WARNING,
  UNKNOWN_KIND_WARNING,
  stepKindWarnings,
  stepKindOf,
  type StepWarning,
} from '../step-warnings';
import { DEFAULT_STAGE_TEMPLATES } from '../../scheduler/reverse-scheduler';
import { RYE_STAGE_TEMPLATES } from '../rye-stages';
import { DUTCH_OVEN_PHASES } from '../baking-phases';
import { FRIDGE_WAKE_STEP_ID } from '../fridge-wake';
import { linie, poAngielsku } from './helpers/tresci';

const texts = (ws: readonly StepWarning[]) => ws.map((x) => x.text);
const KINDS_FROM_CODE = [
  ...DEFAULT_STAGE_TEMPLATES.map((s) => s.category),
  ...RYE_STAGE_TEMPLATES.map((s) => s.id),
  ...Object.keys(DUTCH_OVEN_PHASES),
];

describe('BR-ETAP-004: ostrzeżenia według rodzaju kroku (103)', () => {
  it('każdy rodzaj kroku z kodu ma wpis w mapie (bez zdania „nieznany rodzaj”)', () => {
    expect(KINDS_FROM_CODE).toHaveLength(20);
    for (const k of KINDS_FROM_CODE) {
      expect({ k, inMap: Object.prototype.hasOwnProperty.call(STEP_KIND_WARNINGS, k) }).toEqual({ k, inMap: true });
      expect(stepKindWarnings(k)).not.toContain(UNKNOWN_KIND_WARNING);
    }
    expect(Object.keys(STEP_KIND_WARNINGS).sort()).toEqual([...new Set(KINDS_FROM_CODE)].sort());
  });

  const WEKTORY: Array<[string, readonly StepWarning[]]> = [
    ['starter_feed', STARTER_WARNINGS],
    ['rye_starter', STARTER_WARNINGS],
    ['mix', []],
    ['rye_mix', []],
    ['autolyse', RAW_DOUGH_WARNINGS],
    ['bulk_ferment', RAW_DOUGH_WARNINGS],
    ['pre_shape', RAW_DOUGH_WARNINGS],
    ['final_shape', RAW_DOUGH_WARNINGS],
    ['rye_shape', RAW_DOUGH_WARNINGS],
    ['lid_off', []],
    ['preheat_oven', [HOT_VESSEL_WARNING, CHILDREN_WARNING]],
    ['bake', [HOT_VESSEL_WARNING, CHILDREN_WARNING]],
    ['lid_on', [HOT_VESSEL_WARNING, CHILDREN_WARNING]],
    ['rye_bake', [HOT_VESSEL_WARNING, CHILDREN_WARNING]],
    ['cool', [HOT_VESSEL_WARNING]],
    ['rye_cool', [HOT_VESSEL_WARNING]],
    ['bench_rest', []],
    ['final_proof', []],
    ['rye_rest', []],
    ['rye_proof', []],
  ];
  it.each(WEKTORY)('%s → ostrzeżenia z mapy roli 06', (kind, expected) => {
    expect(stepKindWarnings(kind)).toEqual(expected);
  });

  it('RD-22-W2: starter_feed → zdania „zakwas” (zmiana wektora 086 „starter_feed bez nowych zdań”)', () => {
    expect(texts(stepKindWarnings('starter_feed'))).toEqual(['Nie próbuj surowego zakwasu ani mąki.', 'Po pracy z mąką i zakwasem umyj ręce mydłem pod bieżącą wodą.']);
  });

  it('RD-23-W2: lid_on → gorące naczynie i dzieci; RD-22-W3: cool → gorące naczynie, bez zdań o surowym cieście', () => {
    expect(texts(stepKindWarnings('lid_on'))).toEqual([HOT_VESSEL_WARNING.text, CHILDREN_WARNING.text]);
    expect(stepKindWarnings('cool')).toEqual([HOT_VESSEL_WARNING]);
    expect(stepKindWarnings('cool')).not.toEqual(expect.arrayContaining(RAW_DOUGH_WARNINGS));
  });

  it('RD-22-W4 i RD-23-W4: krok nieznanego rodzaju; w czasie wypieku także gorące naczynie', () => {
    expect(stepKindWarnings('moj_krok')).toEqual([UNKNOWN_KIND_WARNING]);
    expect(stepKindWarnings(undefined)).toEqual([UNKNOWN_KIND_WARNING]);
    expect(stepKindWarnings(null, { duringBake: true })).toEqual([UNKNOWN_KIND_WARNING, HOT_VESSEL_WARNING]);
    expect(stepKindWarnings('toString')).toEqual([UNKNOWN_KIND_WARNING]);
  });

  it('rodzaj kroku sesji: etap żytni po id, garnek po fazie, dokarmienie z lodówki jak starter_feed', () => {
    expect(stepKindOf({ id: 'rye_rest', category: 'bulk_ferment' })).toBe('rye_rest');
    expect(stepKindOf({ id: 'bake', category: 'bake' }, 'lid_off')).toBe('lid_off');
    expect(stepKindOf({ id: 'bake', category: 'bake' })).toBe('bake');
    expect(stepKindOf({ id: FRIDGE_WAKE_STEP_ID, category: 'starter_feed' })).toBe('starter_feed');
  });

  it('poziom ostrzeżenia i ID twierdzeń', () => {
    for (const ws of Object.values(STEP_KIND_WARNINGS)) for (const x of ws) expect(x.poziom).toBe('ostrzezenie');
    expect(HOT_VESSEL_WARNING.claims).toEqual(['BEZ-OPA-004', 'BEZ-OPA-003']);
    expect(CHILDREN_WARNING.claims).toEqual(['BEZ-OPA-005']);
    expect(UNKNOWN_KIND_WARNING.claims).toEqual(['BEZ-SUR-001', 'ZAK-SUR-001', 'BEZ-SUR-002']);
  });

  it('teksty dosłownie z ostrzezenia-krokow.md i wypiek-bezpieczenstwo.md (PL i EN)', () => {
    const pary: Array<[readonly StepWarning[], string, string, string]> = [
      [STARTER_WARNINGS, 'ostrzezenia-krokow.md', 'zakwas', 'starter'],
      [[HOT_VESSEL_WARNING], 'ostrzezenia-krokow.md', 'gorące naczynie', 'hot pot'],
      [[CHILDREN_WARNING], 'ostrzezenia-krokow.md', 'dzieci', 'children'],
      [[UNKNOWN_KIND_WARNING], 'ostrzezenia-krokow.md', 'nieznany rodzaj', 'unknown kind'],
      [RAW_DOUGH_WARNINGS, 'wypiek-bezpieczenstwo.md', 'krok mieszania ciasta', 'dough mixing step'],
    ];
    for (const [ws, plik, pl, en] of pary) {
      expect(texts(ws)).toEqual(linie(`pl/${plik}`, pl));
      expect(poAngielsku(texts(ws))).toEqual(linie(`en/${plik}`, en));
    }
  });
});

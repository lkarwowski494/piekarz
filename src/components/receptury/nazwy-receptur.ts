// ============================================================================
// Piekarz — nazwy na liście receptur i w arkuszu „Składniki” (design-spec §11c „106”, makieta
// docs/design/ekrany/kalkulator.html, stany `lista-receptur`, `skladniki-pelne`, `receptura-zaczyn`).
// Teksty przez t(); nazwy zaczynów w PL do potwierdzenia przez rolę 06 (§11c 106). [M1-audytor-generalny-106]
// ============================================================================

import { t } from '../../lib/i18n';
import type { RecipePreset } from '../../recipes/presets';
import type { PrefermentType } from '../../core/preferments';

/** Zaczyny w menu „Rodzaj” w kolejności z §11c 106 (bez zaczynu, poolish, biga, stare ciasto, levain). */
export const ZACZYNY_W_MENU: readonly PrefermentType[] = ['direct', 'poolish', 'biga', 'pate_fermentee', 'levain'];

/** Udział mąki w zaczynie do wyboru (%), jak dziś w akordeonie zaczynów. */
export const PROCENTY_MAKI_W_ZACZYNIE: readonly number[] = [15, 20, 25, 30, 40];

/** Nazwa zaczynu małą literą (wiersz „Rodzaj”, „Zaczyn: {rodzaj}”). */
export function nazwaZaczynu(typ: PrefermentType): string {
  switch (typ) {
    case 'poolish':
      return t('poolish');
    case 'biga':
      return t('biga');
    case 'pate_fermentee':
      return t('stare ciasto');
    case 'levain':
      return t('levain');
    case 'direct':
      return t('bez zaczynu');
    default:
      return typ;
  }
}

function rodzaj(c: RecipePreset['category']): string {
  switch (c) {
    case 'sourdough':
      return t('Na zakwasie');
    case 'rye':
      return t('Żytni');
    case 'yeast':
      return t('Drożdżowy');
    case 'pizza':
      return t('Pizza');
    default:
      return t('Słodkie');
  }
}

function poziom(d: NonNullable<RecipePreset['difficulty']>): string {
  switch (d) {
    case 'easy':
      return t('łatwy');
    case 'medium':
      return t('średni');
    case 'hard':
      return t('wymagający');
    default:
      return t('mistrzowski');
  }
}

/** Podpis wiersza receptury bazowej: „{rodzaj}, poziom {trudność}” (np. „Na zakwasie, poziom łatwy”). */
export function opisReceptury(r: Pick<RecipePreset, 'category' | 'difficulty'>): string {
  if (!r.difficulty) return rodzaj(r.category);
  return t('{rodzaj}, poziom {trudnosc}', { rodzaj: rodzaj(r.category), trudnosc: poziom(r.difficulty) });
}

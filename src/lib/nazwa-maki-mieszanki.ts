// ============================================================================
// Piekarz — nazwa mąki w wierszu mieszanki receptury [M1-audytor-generalny-093; Z-3 z 080]
// Zapisane `name` i `type` mąki receptury się nie zmieniają (dane użytkownika, dopasowania po nazwie).
// Przy wyświetlaniu: język z mapą typów (pl) → nazwa zapisana; inne → profil atlasu po typie i nazwaMaki
// (094: nazwa i opis ogólny bez polskiego numeru typu); mąka bez profilu → przekład zapisanej nazwy;
// nazwa własna użytkownika (spoza danych aplikacji) zostaje dosłownie.
// ============================================================================

import { FLOUR_PROFILES } from '../core/flour-atlas';
import { trybAtlasuMak } from '../core/flour-atlas-ogolne';
import { MASTER_RECIPES } from '../recipes/presets';
import { lang, t } from './i18n';
import { nazwaMaki } from './nazwa-maki';

/** Typ mąki receptur bazowych (presets.ts) → profil atlasu o tym samym zbożu i typie (flour-atlas.ts). */
const PROFIL_TYPU: Readonly<Record<string, string>> = {
  pszenna_550: 'wheat_550',
  pszenna_650: 'wheat_650',
  pszenna_750: 'wheat_750',
  pszenna_graham: 'wheat_1850',
  pszenna_razowa: 'wheat_2000',
  pszenna_manitoba: 'wheat_manitoba',
  zytnia_720: 'rye_720',
  zytnia_2000: 'rye_2000',
  orkisz_630: 'spelt_630',
  orkisz_2000: 'spelt_2000',
};

/** Nazwa mąki receptury bazowej → jej typ (wiersze wyniku obliczeń nie niosą typu). */
const TYP_NAZWY = new Map<string, string>();
for (const r of MASTER_RECIPES) for (const f of r.formula.flours) if (f.type) TYP_NAZWY.set(f.name, f.type);
const NAZWY_DANYCH = new Set(TYP_NAZWY.keys());

export function nazwaMakiMieszanki(f: { name: string; type?: string }, kod: string = lang()): string {
  if (trybAtlasuMak(kod) === 'mapa-typow') return f.name;
  const typ = f.type ?? TYP_NAZWY.get(f.name);
  const profil = FLOUR_PROFILES.find((p) => p.id === (typ ? PROFIL_TYPU[typ] ?? typ : undefined)) ?? FLOUR_PROFILES.find((p) => p.namePl === f.name);
  if (profil) return nazwaMaki(profil, kod);
  return NAZWY_DANYCH.has(f.name) ? t(f.name) : f.name;
}

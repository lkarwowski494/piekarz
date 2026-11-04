// ============================================================================
// Piekarz — tryb maszyny na recepturach katalogu (BR-MASZ-001, D-156, D-261) [M3 p9b2]
// Dostępność: receptura drożdżowa (bez zakwasu, z drożdżami) albo na zakwasie z wersją drożdżową; przy zakwasie tryb
// używa wersji drożdżowej (D-156, zdanie machine.sourdough). Własne receptury: bez trybu (formuła nie zna jajek, mleka,
// cukru ani tłuszczu, więc RD-38 nie ma danych; D-261).
// Dodatki spoza formuły (formuła ma tylko mąki, wodę, sól, drożdże i zakwas) przepisane z opisu i notatki receptury
// (treść roli 06/katalogu), bez nowych faktów; RD-38 liczy całą recepturę, także składnik spoza maszyny (OP-73).
// ============================================================================

import type { RecipePreset } from './presets-types';
import type { DoughRecipeInput } from '../core/domain-rules';
import { udzialPelnoziarnistychIZytnich, type CechyProgramu, type SkladnikMaszyny } from '../core/maszyna';
import { formulaWersji, wersjaDrozdzowa } from './wersje-drozdzowe';

/** Dodatki każdej receptury z trybem maszyny; pusta lista = notatka i opis nie wymieniają dodatków. */
export const DODATKI_MASZYNY: Readonly<Record<string, readonly SkladnikMaszyny[]>> = {
  baguette_tradition_poolish: [],
  ciabatta_con_biga: ['tluszcz'], // „Do ciasta właściwego dodaj 3% oliwy z oliwek” (06m, D-266)
  focaccia_genovese: ['tluszcz'], // „naoliwioną blachę”, „solanką z wody, oliwy i soli”
  no_knead_night: [],
  pizza_napoletana_48h: [],
  sweet_chalka: ['tluszcz', 'cukier', 'jajka'], // „z dodatkiem masła i cukru”, „posmaruj roztrzepanym jajkiem” (OP-73)
  half_rye_loaf: [],
  white_pan_loaf: ['cukier', 'tluszcz'], // „cukier 2,9%, olej 3,1%”
  half_whole_wheat_loaf: [],
  boiled_bread_ring: ['tluszcz', 'cukier'], // „2–3 kg tłuszczu i 2–4 kg cukru”
  milk_dinner_rolls: ['mleko', 'cukier', 'tluszcz', 'jajka'], // „mleko 55,8%… cukier… masło… jajko”
  cheese_crumble_yeast_cake: ['mleko', 'cukier', 'jajka', 'tluszcz', 'ser'], // „mleko… cukru… jaj… masła”, „twarogu”
  sweet_yeast_buns: ['mleko', 'cukier', 'tluszcz', 'jajka'], // „mleko 39,0%… cukier… olej… jajka”
  cinnamon_tea_ring: ['mleko', 'cukier', 'tluszcz'], // „mleko 39,0%”, nadzienie „cukier… masło… rodzynki” (suszone)
  // Receptury na zakwasie z wersją drożdżową (D-173): dodatki z receptury bazowej
  graham_bread_honey: ['cukier'], // „Dodatek łyżki miodu”
  rye_100_pan: [],
  spelt_ancient_seeded: [], // prażone ziarna (siemię, słonecznik, sezam): nie z listy RD-38, nie cukier ani tłuszcz
  tartine_high_hydration_80: [],
};

const drozdzowa = (f: DoughRecipeInput) => f.starterPercentage === 0 && (f.extraYeastPercentage ?? 0) > 0;

/** BR-MASZ-001: segment „Piekarnik / Maszyna do chleba” przy recepturze katalogu drożdżowej albo z wersją drożdżową. */
export function trybMaszynyDostepny(r: RecipePreset | undefined): boolean {
  if (!r || !(r.id in DODATKI_MASZYNY)) return false;
  return drozdzowa(r.formula) || wersjaDrozdzowa(r.id) !== null;
}

/** Formuła trybu maszyny: przy zakwasie z wersją drożdżową — wersja drożdżowa (D-156). */
export function formulaMaszyny(r: RecipePreset): { formula: DoughRecipeInput; przezWersjeDrozdzowa: boolean } {
  if (drozdzowa(r.formula) || wersjaDrozdzowa(r.id) === null) return { formula: r.formula, przezWersjeDrozdzowa: false };
  return { formula: formulaWersji(r.formula, r.id, 'drozdze'), przezWersjeDrozdzowa: true };
}

/** Składniki całej receptury do RD-38; receptura bez wpisu dodatków = null (błąd danych, nie „dostępny”). */
export function skladnikiMaszyny(r: RecipePreset): SkladnikMaszyny[] | null {
  const dodatki = DODATKI_MASZYNY[r.id];
  return dodatki ? ['maka', 'woda', 'sol', 'drozdze', ...dodatki] : null;
}

/**
 * Cechy do RD-39 (D-179): poza formą maszyny = wypiek na blasze albo kamieniu (`recommendedVessel`), bo kształtuje się
 * go i piecze w piekarniku; w formie i w garnku = bochenek, który maszyna może upiec. Cukier i tłuszcz z dodatków.
 */
export function cechyProgramuReceptury(r: RecipePreset, formula: DoughRecipeInput): CechyProgramu {
  const dodatki = DODATKI_MASZYNY[r.id];
  return {
    pozaForma: r.recommendedVessel === 'baking_sheet' || r.recommendedVessel === 'baking_steel',
    kategoria: r.category,
    upzProc: udzialPelnoziarnistychIZytnich(formula.flours),
    maCukier: dodatki ? dodatki.includes('cukier') : null,
    maTluszcz: dodatki ? dodatki.includes('tluszcz') : null,
  };
}

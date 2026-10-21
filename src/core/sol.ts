// Piekarz — ocena udziału soli (RD-27): 1,8–2,0% masy mąki to typowa ilość (S-37, King Arthur Baking, szczebel 3;
// rejestr SOL-TYP-001); poza zakresem aplikacja pokazuje informację bez blokady zapisu (BR-KALK-011)
// [M1-audytor-generalny-130].

export const SOL_TYPOWA_OD = 1.8;
export const SOL_TYPOWA_DO = 2.0;

export type OcenaSoli = 'ponizej' | 'typowa' | 'powyzej';

/** Ocena procentu soli od masy mąki; granice zakresu typowego włącznie (RD-27-W2). */
export function ocenaSoli(saltPct: number): OcenaSoli {
  // Zaokrąglenie do 0,001 p.p. chroni granice przed błędem zmiennoprzecinkowym (np. 20 / 1000 × 100).
  const s = Math.round(saltPct * 1000) / 1000;
  if (s < SOL_TYPOWA_OD) return 'ponizej';
  if (s > SOL_TYPOWA_DO) return 'powyzej';
  return 'typowa';
}

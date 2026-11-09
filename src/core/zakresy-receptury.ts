// ============================================================================
// Piekarz — zakresy pól receptury (udział w % masy mąki), jedno źródło dla arkusza „Składniki” i importu pliku/QR
// [M1-audytor-generalny-027; 08-programista-004, wariant b]: import przyjmuje każdą wartość, którą arkusz pozwala
// zapisać. Wartości arkusza sprzed 027 (SkladnikiSheet.tsx); potwierdzenie merytoryczne zakresów: zadanie roli 06 (wariant a).
// ============================================================================

export interface Zakres {
  min: number;
  max: number;
}

export const ZAKRESY_RECEPTURY = {
  woda: { min: 0, max: 150 },
  sol: { min: 0, max: 10 },
  zakwas: { min: 0, max: 100 },
  hydratacjaZakwasu: { min: 20, max: 200 },
  drozdze: { min: 0, max: 10 },
} as const satisfies Record<string, Zakres>;

export const wZakresie = (v: number, z: Zakres): boolean => v >= z.min && v <= z.max;

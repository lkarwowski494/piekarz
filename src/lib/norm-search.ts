// ============================================================================
// Piekarz (Crust) — Diacritic Normalization for Search (S15, RD-ENG-07)
// Usuwa polskie i europejskie znaki diakrytyczne (w tym twarde 'ł'/'Ł').
// ============================================================================

export function normSearch(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[łŁ]/g, 'l')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function matchesSearch(source: string, query: string): boolean {
  if (!query.trim()) return true;
  return normSearch(source).includes(normSearch(query));
}

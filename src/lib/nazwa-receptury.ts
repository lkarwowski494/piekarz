// ============================================================================
// Piekarz — nazwa receptury do wyświetlenia [M1-audytor-generalny-093; Z-3 z 080]
// Zapisana nazwa receptury bazowej to namePl (dane użytkownika, wpisy Dziennika, dopasowanie po nazwie
// w recipe-navigation.ts) i się nie zmienia; przekład dopiero przy wyświetlaniu. Nazwa własna użytkownika
// zostaje dosłownie (bez t(): „|” w nazwie nie może jej uciąć, zbieżność z kluczem słownika jej nie zmieni).
// ============================================================================

import { MASTER_RECIPES } from '../recipes/presets';
import { t } from './i18n';

const BAZOWE = new Set(MASTER_RECIPES.map((r) => r.namePl));

export function nazwaReceptury(nazwa: string): string {
  return BAZOWE.has(nazwa) ? t(nazwa) : nazwa;
}

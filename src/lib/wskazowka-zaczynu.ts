// ============================================================================
// Piekarz — wskazówka zaczynu do wyświetlenia [M1-audytor-generalny-093]
// `fermentationTipPl` w wyniku obliczeń to gotowe zdanie PL z wartościami domeny (nazwa, czas, profil smaku),
// więc t() nie znajdowało go w żadnym słowniku (PRZEKLAD-README, problem 5). Przy wyświetlaniu: szablon
// z przekładu i każda wartość z przekładu; pole PL zostaje bez zmian.
// ============================================================================

import { PREFERMENT_DEFINITIONS, type PrefermentBreakdownResult } from '../core/preferments';
import { t } from './i18n';

export function wskazowkaZaczynu(b: PrefermentBreakdownResult): string {
  const d = PREFERMENT_DEFINITIONS[b.prefermentType];
  if (!d || b.fermentationTipPl === d.flavorProfilePl) return t(b.fermentationTipPl);
  return t('{namePl}: Czas dojrzewania {fermentationTimeHours}. {flavorProfilePl}', {
    namePl: t(d.namePl),
    fermentationTimeHours: t(d.fermentationTimeHours),
    flavorProfilePl: t(d.flavorProfilePl),
  });
}

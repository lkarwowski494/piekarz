// ============================================================================
// Piekarz — zaznaczenia objawów na karcie bezpieczeństwa zakwasu (RD-21-W1) i ich ocena; „Odznacz objawy” z pytaniem.
// Wydzielone z ekranu zakwasu bez zmiany zachowania (limit 20 KB pliku, partia D10) [M3 D10].
// ============================================================================

import { useMemo, useState } from 'react';
import { evaluateSourdoughSafety } from '../../core/domain-rules';
import { confirmResetStarter } from '../../lib/confirm';

export function useObjawyZakwasu() {
  const [hasHooch, setHasHooch] = useState<boolean>(false);
  const [hasKahm, setHasKahm] = useState<boolean>(false);
  const [hasMold, setHasMold] = useState<boolean>(false);
  const [hasColoredSpots, setHasColoredSpots] = useState<boolean>(false);
  const [hasRottenSmell, setHasRottenSmell] = useState<boolean>(false);

  const safetyResult = useMemo(
    () =>
      evaluateSourdoughSafety({
        hasHoochLiquid: hasHooch,
        hasWhiteWrinkledFilm: hasKahm,
        hasFuzzySpots: hasMold,
        hasColoredSpots,
        hasRottenSmell,
      }),
    [hasHooch, hasKahm, hasMold, hasColoredSpots, hasRottenSmell]
  );

  const handleReset = () => {
    confirmResetStarter(() => {
      setHasHooch(false);
      setHasKahm(false);
      setHasMold(false);
      setHasColoredSpots(false);
      setHasRottenSmell(false);
    });
  };

  return {
    hasHooch,
    onToggleHooch: () => setHasHooch((prev) => !prev),
    hasKahm,
    onToggleKahm: () => setHasKahm((prev) => !prev),
    hasMold,
    onToggleMold: () => setHasMold((prev) => !prev),
    hasColoredSpots,
    onToggleColoredSpots: () => setHasColoredSpots((prev) => !prev),
    hasRottenSmell,
    onToggleRottenSmell: () => setHasRottenSmell((prev) => !prev),
    safetyResult,
    onReset: handleReset,
  };
}

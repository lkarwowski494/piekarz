// ============================================================================
// Piekarz — „Pogrubiony tekst” iOS dla własnego kroju tytułów (Sofia Sans, D-050). Treść w kroju systemowym reaguje
// sama; krój dołączony do aplikacji trzeba pogrubić ręcznie (podłoga typografii: własne kroje reagują na
// „Pogrubiony tekst”) [M1-audytor-generalny-158; 04-studio-projektowe-503].
// ============================================================================

import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** Stan ustawienia „Pogrubiony tekst” (iOS), aktualizowany po zmianie w trakcie działania aplikacji. */
export function usePogrubionyTekst(): boolean {
  const [wlaczony, setWlaczony] = useState(false);
  useEffect(() => {
    let aktywny = true;
    AccessibilityInfo.isBoldTextEnabled()
      .then((v) => {
        if (aktywny) setWlaczony(v);
      })
      .catch(() => undefined);
    const sub = AccessibilityInfo.addEventListener('boldTextChanged', (v: boolean) => setWlaczony(v));
    return () => {
      aktywny = false;
      sub?.remove();
    };
  }, []);
  return wlaczony;
}

/** Waga kroju tytułów: 700, a przy „Pogrubionym tekście” o stopień cięższa 900 (krój zmienny, oś wght). */
export function wagaTytulu(pogrubiony: boolean): '700' | '900' {
  return pogrubiony ? '900' : '700';
}

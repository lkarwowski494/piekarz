// ============================================================================
// Piekarz — ekran Pro z otwartego arkusza (pageSheet) według wzorca D-117 z Ustawień: najpierw zamknięcie arkusza,
// ekran Pro dopiero po jego zniknięciu (onDismiss, iOS), bo dwa arkusze modalne naraz iOS pokazuje zawodnie; poza
// iOS (bez onDismiss) od razu [04-studio-projektowe-005].
// ============================================================================

import { useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { ustawEkranZakupu } from '../lib/platnosci/ekran';
import { porzucAkcje, wstrzymajAkcje } from '../lib/platnosci/wstrzymana';

export function useProPoArkuszu() {
  const czeka = useRef(false);
  /** Zamyka arkusz i odkłada ekran Pro do zniknięcia arkusza (iOS); `wznow` wykona się po zakupie (018, W-fix2). */
  const otworzPro = useCallback((zamknijArkusz: () => void, wznow?: () => void | Promise<void>) => {
    if (wznow) wstrzymajAkcje(wznow);
    else porzucAkcje();
    zamknijArkusz();
    if (Platform.OS === 'ios') czeka.current = true;
    else ustawEkranZakupu(true);
  }, []);
  /** Do `onDismiss` arkusza: ekran Pro tylko, gdy zamknięcie przyszło z funkcji Pro. */
  const poZamknieciu = useCallback(() => {
    if (!czeka.current) return;
    czeka.current = false;
    ustawEkranZakupu(true);
  }, []);
  return { otworzPro, poZamknieciu };
}

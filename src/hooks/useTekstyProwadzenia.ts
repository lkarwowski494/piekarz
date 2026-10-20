// ============================================================================
// Piekarz — teksty prowadzenia z makiety (design-spec §11b „056”, 04-studio-projektowe-029) [M1-audytor-generalny-114]
// Cienka warstwa wokół czystej funkcji tekstyProwadzenia: zgoda na powiadomienia (jak baner „Powiadomienia
// wyłączone”) i odświeżanie co 15 s, gdy zegar kroku stoi po czasie („{n} min po czasie”, „Potem: … do {godzina}”).
// ============================================================================

import { useEffect, useState } from 'react';
import { getNotificationPermission, subscribeNotificationPermission, type NotificationPermission } from '../lib/notifications';
import { tekstyProwadzenia, type TekstyProwadzenia, type WejscieProwadzenia } from '../lib/prowadzenie-teksty';

const ODSWIEZ_PO_CZASIE_MS = 15_000;

export function useTekstyProwadzenia(w: Omit<WejscieProwadzenia, 'teraz' | 'zgodaPowiadomien'> & { poCzasie: boolean }): TekstyProwadzenia {
  const [zgoda, setZgoda] = useState<NotificationPermission>('undetermined');
  const [, setTik] = useState(0);

  useEffect(() => {
    let alive = true;
    void getNotificationPermission()
      .then((s) => alive && setZgoda(s))
      .catch(() => undefined);
    const off = subscribeNotificationPermission((s) => alive && setZgoda(s));
    return () => {
      alive = false;
      off();
    };
  }, []);

  useEffect(() => {
    if (!w.poCzasie) return;
    const id = setInterval(() => setTik((n) => n + 1), ODSWIEZ_PO_CZASIE_MS);
    return () => clearInterval(id);
  }, [w.poCzasie]);

  return tekstyProwadzenia({
    steps: w.steps,
    stepIdx: w.stepIdx,
    dutchOvenPhase: w.dutchOvenPhase,
    koniecKrokuMs: w.koniecKrokuMs,
    teraz: Date.now(),
    zgodaPowiadomien: zgoda === 'granted',
  });
}

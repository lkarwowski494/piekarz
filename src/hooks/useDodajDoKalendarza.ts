// ============================================================================
// Piekarz — „Dodaj do kalendarza” przy planie (BR-KAL-011) [M3 D8]
// Plik .ics przez arkusz udostępniania; zapamiętuje podpis planu z chwili dodania, żeby po zmianie planu powiedzieć,
// że wydarzenie w kalendarzu telefonu się nie zmieniło (scenariusz „Zmiana planu po dodaniu”). Stan tylko na czas
// ekranu: aplikacja nie czyta kalendarza telefonu, więc nie wie, czy wydarzenie nadal tam jest.
// ============================================================================

import { useRef, useState } from 'react';
import type { SessionStep } from '../core/bake-steps';
import { podpisPlanu } from '../core/plan-ics';
import { dodajDoKalendarza, pokazBladKalendarza, wydarzenieZPlanu } from '../lib/kalendarz-telefonu';

export interface PlanDoKalendarza {
  id: string;
  nazwa: string;
  kroki: readonly SessionStep[];
}

export function useDodajDoKalendarza(plan: PlanDoKalendarza | null) {
  const [dodanyPodpis, setDodanyPodpis] = useState<string | null>(null);
  const zajety = useRef(false);

  const dodaj = async () => {
    if (!plan || zajety.current) return;
    zajety.current = true;
    try {
      const wydarzenie = wydarzenieZPlanu({ ...plan, teraz: Date.now() });
      const wynik = wydarzenie ? await dodajDoKalendarza(wydarzenie) : ({ ok: false, powod: 'plan' } as const);
      if (wynik.ok) setDodanyPodpis(podpisPlanu(plan.kroki));
      else pokazBladKalendarza(wynik.powod);
    } finally {
      zajety.current = false;
    }
  };

  const nieZmienil = plan !== null && dodanyPodpis !== null && podpisPlanu(plan.kroki) !== dodanyPodpis;
  return { dodaj, nieZmienil };
}

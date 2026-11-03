// ============================================================================
// Piekarz — zakwas planu wypieku (wybrany na Zakwasach albo pierwszy), wydzielony z ekranu planu
// app/(tabs)/receptury/harmonogram.tsx (limit 20 KB) bez zmiany zachowania [M3 p4]. Z lodówki: plan dostaje jedno
// dokarmienie 12 h przed mieszaniem (BR-ZAKW-006, D-052) [M1-audytor-generalny-104]. Nieudany odczyt = brak zakwasu.
// ============================================================================

import { useEffect, useState } from 'react';
import { getStarters } from '../data/sqlite-store';
import type { StoredStarter } from '../data/db';
import { zakwasPlanu } from '../lib/zakwas-planu';

/** Zakwas planu i czy odczyt się zakończył (także nieudany). */
export function useZakwasPlanu(): { zakwas: StoredStarter | null; zakwasWczytany: boolean } {
  const [zakwas, setZakwas] = useState<StoredStarter | null>(null);
  const [zakwasWczytany, setZakwasWczytany] = useState(false);
  useEffect(() => {
    let zywy = true;
    void getStarters()
      .then((lista) => { if (zywy) setZakwas(zakwasPlanu(lista)); })
      .catch(() => {})
      .finally(() => { if (zywy) setZakwasWczytany(true); });
    return () => { zywy = false; };
  }, []);
  return { zakwas, zakwasWczytany };
}

// ============================================================================
// Piekarz — pasek „Cofnięto {krok}” prowadzenia, wydzielony z ProwadzenieWypieku.tsx (limit 20 480 B) [M3 p7c]
// Tekst i zachowanie bez zmian: PasekCofnij z zdaniem o skutku cofnięcia kroku i „Przywróć”.
// ============================================================================
import React from 'react';
import { PasekCofnij } from '../PasekCofnij';
import { t } from '../../lib/i18n';

// `skok`: po przejściu do kroku z „Plan wypieku” — „Przywróć” wraca do stanu sprzed skoku [M1-audytor-generalny-006]
export function PasekCofnijKroku({ nazwa, skok, onPrzywroc, onUkryj }: { nazwa: string; skok?: boolean; onPrzywroc: () => void; onUkryj: () => void }) {
  return (
    <PasekCofnij
      tekst={skok
        ? t('Przejście do „{krok}”: dalsze kroki i powiadomienia przesunięte.', { krok: nazwa })
        : t('Cofnięto „{krok}”. Powiadomienia wróciły do poprzednich godzin.', { krok: nazwa })}
      onPrzywroc={onPrzywroc}
      onUkryj={onUkryj}
    />
  );
}

// ============================================================================
// Piekarz — pasek „Cofnięto {krok}” prowadzenia, wydzielony z ProwadzenieWypieku.tsx (limit 20 480 B) [M3 p7c]
// Tekst i zachowanie bez zmian: PasekCofnij z zdaniem o skutku cofnięcia kroku i „Przywróć”.
// ============================================================================
import React from 'react';
import { PasekCofnij } from '../PasekCofnij';
import { t } from '../../lib/i18n';

export function PasekCofnijKroku({ nazwa, onPrzywroc, onUkryj }: { nazwa: string; onPrzywroc: () => void; onUkryj: () => void }) {
  return (
    <PasekCofnij
      tekst={t('Cofnięto „{krok}”. Powiadomienia wróciły do poprzednich godzin.', { krok: nazwa })}
      onPrzywroc={onPrzywroc}
      onUkryj={onUkryj}
    />
  );
}

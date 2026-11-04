// ============================================================================
// Piekarz — wybór „na zakwasie / na drożdżach” na ekranie receptury (D-154; receptury z wersją drożdżową, D-173).
// Wygląd i zachowanie: wspólny SegmentOpcji (wzór segmentu „świeże / suche”, SegmentDrozdzy, D-136): najbliższy
// element systemu roli 04, bo makieta przełącznika wersji nie istnieje (D-137 rysował receptury-bliźniaki;
// zgłoszenie do roli 04) [M3 p9b; struktura p9b2].
// ============================================================================

import React from 'react';
import { t } from '../../lib/i18n';
import type { WersjaWypieku } from '../../data/wybory-parsery';
import { SegmentOpcji } from './SegmentOpcji';

export function SegmentWersji({ wersja, onWybierz }: { wersja: WersjaWypieku; onWybierz: (w: WersjaWypieku) => void }) {
  return (
    <SegmentOpcji
      testID="recipe-version"
      etykieta={t('Wersja receptury')}
      wybrana={wersja}
      onWybierz={onWybierz}
      opcje={[
        { wartosc: 'zakwas', testID: 'recipe-version-sourdough', etykieta: t('na zakwasie|wersja receptury') },
        { wartosc: 'drozdze', testID: 'recipe-version-yeast', etykieta: t('na drożdżach|wersja receptury') },
      ]}
    />
  );
}

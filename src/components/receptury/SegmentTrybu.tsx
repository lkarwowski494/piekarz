// ============================================================================
// Piekarz — segment „Piekarnik / Maszyna do chleba” w karcie „Ile pieczesz” (D-138, karty/README.md O4 a, makieta
// karty/receptury.html#receptura-maszyna); wzór: SegmentOpcji. Eksport TrybMaszyny stąd, żeby ekran receptury miał
// jeden import trybu (limit 20 480 B pliku ekranu) [M3 p9b2].
// ============================================================================

import React from 'react';
import { t } from '../../lib/i18n';
import type { BakeMethod } from '../../data/db';
import { SegmentOpcji } from './SegmentOpcji';
import { sm } from './style-maszyny';

export { TrybMaszyny } from './TrybMaszyny';

export function SegmentTrybu({ tryb, onWybierz }: { tryb: BakeMethod; onWybierz: (t: BakeMethod) => void }) {
  return (
    <SegmentOpcji
      testID="recipe-tryb"
      etykieta={t('Ile pieczesz')}
      wybrana={tryb}
      onWybierz={onWybierz}
      style={sm.segmentWKarcie}
      opcje={[
        { wartosc: 'piekarnik', testID: 'recipe-tryb-oven', etykieta: t('Piekarnik') },
        { wartosc: 'maszyna', testID: 'recipe-tryb-machine', etykieta: t('Maszyna do chleba') },
      ]}
    />
  );
}

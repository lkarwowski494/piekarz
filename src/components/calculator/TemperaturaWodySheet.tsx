// ============================================================================
// Piekarz — arkusz „Temperatura wody” z akcji receptury (design-spec §11b „057”, stan `temperatura-wody`
// w docs/design/ekrany/kalkulator.html; F-10). Arkusz systemowy pageSheet bez własnego przyciemnienia,
// „Zamknij” w pasku arkusza (słownik §5). Treść: sekcja temperatury wody z ostrzeżeniem > 45 °C.
// [M1-audytor-generalny-057]. Na systemie kart: pasek arkusza i karta „Temperatura wody” (README §1, §3)
// [M1-audytor-generalny-007; 04-studio-projektowe-003].
// ============================================================================

import React from 'react';
import { t } from '../../lib/i18n';
import { CLOSE_TEST_ID } from '../CloseButton';
import { ArkuszKart } from '../arkusz/ArkuszKart';
import { AccordionDdtSection, AccordionDdtSectionProps } from './accordion/AccordionDdtSection';

export interface TemperaturaWodySheetProps extends AccordionDdtSectionProps {
  visible: boolean;
  onClose: () => void;
}

export function TemperaturaWodySheet({ visible, onClose, ...sekcja }: TemperaturaWodySheetProps) {
  return (
    <ArkuszKart visible={visible} onRequestClose={onClose} trescTestID="water-temp-sheet"
      lewy={{ tekst: t('Zamknij'), onPress: onClose, testID: CLOSE_TEST_ID }}>
      <AccordionDdtSection {...sekcja} />
    </ArkuszKart>
  );
}

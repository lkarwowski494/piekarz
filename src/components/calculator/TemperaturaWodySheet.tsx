// ============================================================================
// Piekarz — arkusz „Temperatura wody” z akcji receptury (design-spec §11b „057”, stan `temperatura-wody`
// w docs/design/ekrany/kalkulator.html; F-10). Arkusz systemowy pageSheet bez własnego przyciemnienia,
// „Zamknij” w pasku arkusza (słownik §5). Treść: sekcja temperatury wody z ostrzeżeniem > 45 °C.
// [M1-audytor-generalny-057]
// ============================================================================

import React from 'react';
import { Modal, View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { CloseButton } from '../CloseButton';
import { AccordionDdtSection, AccordionDdtSectionProps } from './accordion/AccordionDdtSection';

import { typografia } from '../../ui/tokeny';
export interface TemperaturaWodySheetProps extends AccordionDdtSectionProps {
  visible: boolean;
  onClose: () => void;
}

export function TemperaturaWodySheet({ visible, onClose, ...sekcja }: TemperaturaWodySheetProps) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.kontener} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.kontener} testID="water-temp-sheet">
          <View style={styles.pasek}>
            <Text style={styles.tytul} accessibilityRole="header">{t('Temperatura wody')}</Text>
            <CloseButton onPress={onClose} akcja="zamknij" />
          </View>
          <ScrollView contentContainerStyle={styles.tresc} keyboardShouldPersistTaps="handled">
            <AccordionDdtSection {...sekcja} />
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  kontener: {
    flex: 1,
    backgroundColor: theme.colors.tlo,
  },
  pasek: {
    minHeight: theme.cele.pozostale,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.linia,
  },
  tytul: {
    flex: 1,
    fontFamily: theme.typography.krojTytulow,
    fontSize: typografia.style.tresc.pt,
    fontWeight: '700',
    color: theme.colors.tusz,
  },
  tresc: {
    padding: theme.spacing.md,
  },
});

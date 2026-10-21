// ============================================================================
// Piekarz — zdanie przed systemową prośbą o zgodę na powiadomienia (makieta `prowadzenie.html`, stan `zgoda`;
// design-spec §5 „prośba o zgodę — po co, jednym zdaniem”; BR-CZAS-003) [M1-audytor-generalny-130].
// Arkusz nad prowadzeniem: tytuł i zdanie z makiety, „Dalej” w strefie kciuka; dopiero „Dalej” wywołuje prośbę iOS.
// Zdanie makiety „Wypiek trwa do jutra.” pominięte: długość wypieku zależy od planu (do przeglądu roli 04).
// ============================================================================

import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../ui/theme';
import { odstepy, promienie, typografia } from '../../ui/tokeny';
import { t } from '../../lib/i18n';

export interface ZgodaPowiadomienProps {
  visible: boolean;
  onDalej: () => void;
}

export function ZgodaPowiadomien({ visible, onDalej }: ZgodaPowiadomienProps) {
  if (!visible) return null;
  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onDalej}>
      <SafeAreaView style={styles.tlo} edges={['top', 'bottom']}>
        <View style={styles.tresc}>
          <Text style={styles.tytul} accessibilityRole="header">{t('Dam znać o każdym kroku')}</Text>
          <Text style={styles.opis}>{t('Gdy telefon śpi, powiadomienie powie, co i kiedy zrobić. Za chwilę telefon zapyta o zgodę.')}</Text>
        </View>
        <View style={styles.kciuk}>
          <Pressable testID="zgoda-dalej-btn" accessibilityRole="button" onPress={onDalej} style={styles.glowny}>
            <Text style={styles.glownyTekst}>{t('Dalej')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  tlo: { flex: 1, backgroundColor: theme.colors.tlo },
  tresc: { flex: 1, justifyContent: 'center', paddingHorizontal: odstepy.xl, gap: odstepy.m },
  tytul: { get fontFamily() { return theme.typography.krojTytulow; }, fontSize: typografia.style.tytulKroku.pt, fontWeight: '700', color: theme.colors.tusz },
  opis: { fontSize: typografia.style.tresc.pt, color: theme.colors.tusz },
  kciuk: { paddingHorizontal: odstepy.xl, paddingVertical: odstepy.m },
  glowny: {
    minHeight: theme.cele.przyciskKciuka,
    borderRadius: promienie.przyciskGlowny,
    backgroundColor: theme.colors.akcent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: odstepy.m,
  },
  glownyTekst: { fontSize: typografia.style.naglowek.pt, fontWeight: '600', color: theme.colors.naAkcencie },
});

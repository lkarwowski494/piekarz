// ============================================================================
// Apps4Craft Studio — StarterSafetyCard Component
// Kontrola objawów zakwasu według zasady ostrożności DEC-10 (a) [M1-audytor-generalny-013, -014].
// Teksty: docs/tresci/pl|en/zakwas-bezpieczenstwo.md (rola 06). 100% Offline-First.
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { SourdoughSafetyCheck } from '../../core/sourdough-physics';

export interface StarterSafetyCardProps {
  hasHooch: boolean;
  onToggleHooch: () => void;
  hasKahm: boolean;
  onToggleKahm: () => void;
  hasMold: boolean;
  onToggleMold: () => void;
  hasColoredSpots: boolean;
  onToggleColoredSpots: () => void;
  hasRottenSmell: boolean;
  onToggleRottenSmell: () => void;
  safetyResult: SourdoughSafetyCheck;
  onReset: () => void;
}

interface CheckProps {
  active: boolean;
  danger: boolean;
  label: string;
  onPress: () => void;
  testID: string;
}

function CheckButton({ active, danger, label, onPress, testID }: CheckProps) {
  return (
    <Pressable
      style={[styles.checkBtn, active && (danger ? styles.checkBtnDangerActive : styles.checkBtnActive)]}
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: active }}
      testID={testID}
    >
      <Text style={[styles.checkBtnText, active && styles.checkBtnTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function StarterSafetyCard({
  hasHooch,
  onToggleHooch,
  hasKahm,
  onToggleKahm,
  hasMold,
  onToggleMold,
  hasColoredSpots,
  onToggleColoredSpots,
  hasRottenSmell,
  onToggleRottenSmell,
  safetyResult,
  onReset,
}: StarterSafetyCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{t('Kontrola biologiczna (Bezpieczeństwo)')}</Text>
      <Text style={styles.cardSubtitle}>{t('Zaznacz, co widzisz albo czujesz w słoiku.')}</Text>
      {/* Granica zastosowania, widoczna przy każdym wyniku [M1-audytor-generalny-014; ZAK-NAL-001, ZAK-SUR-001] */}
      <Text style={styles.boundary} testID="starter-safety-boundary">
        {`${t('Aplikacja nie ocenia bezpieczeństwa zakwasu z pewnością.')} ${t('W razie wątpliwości wyrzuć zakwas.')} ${t('Nie próbuj surowego zakwasu przed upieczeniem.')}`}
      </Text>

      <View style={styles.checkRow}>
        <CheckButton active={hasHooch} danger={false} onPress={onToggleHooch} testID="check-hooch" label={t('Płyn na powierzchni o zapachu alkoholu (hooch)')} />
        <CheckButton active={hasKahm} danger onPress={onToggleKahm} testID="check-film" label={t('Biały nalot lub kożuch na powierzchni')} />
        <CheckButton active={hasMold} danger onPress={onToggleMold} testID="check-mold" label={t('Puszysty nalot w dowolnym kolorze, także biały')} />
        <CheckButton active={hasColoredSpots} danger onPress={onToggleColoredSpots} testID="check-colored" label={t('Różowe, pomarańczowe lub inne przebarwienia, smugi albo plamy')} />
        <CheckButton active={hasRottenSmell} danger onPress={onToggleRottenSmell} testID="check-smell" label={t('Nieprzyjemny, zgniły zapach')} />
      </View>

      <View
        style={[
          styles.safetyBox,
          safetyResult.status === 'discard'
            ? styles.safetyDanger
            : safetyResult.status === 'hooch'
            ? styles.safetyWarning
            : styles.safetyNeutral,
        ]}
        testID={`starter-safety-${safetyResult.status}`}
      >
        <Text style={[styles.safetyTitle, safetyResult.status === 'discard' && styles.safetyTekstOstrz]}>{t(safetyResult.titlePl)}</Text>
        <Text style={[styles.safetyAction, safetyResult.status === 'discard' && styles.safetyTekstOstrz]}>{t(safetyResult.actionPl)}</Text>
      </View>

      <Pressable style={styles.resetBtn} onPress={onReset}>
        <Text style={styles.resetBtnText}>{t('Zacznij od nowa')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.linia,
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.tusz,
  },
  cardSubtitle: {
    fontSize: 12,
    color: theme.colors.tusz2,
    marginTop: 2,
    marginBottom: 8,
  },
  boundary: {
    fontSize: 12,
    lineHeight: 16,
    color: theme.colors.tusz,
    marginBottom: 12,
  },
  checkRow: {
    gap: 8,
    marginBottom: 12,
  },
  checkBtn: {
    backgroundColor: theme.colors.powierzchnia,
    padding: 10,
    minHeight: 44,
    justifyContent: 'center',
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
  },
  // Zaznaczenie: ramka w kolorze stanu, tło i tekst z ciemnego motywu (kontrast jak w 016)
  checkBtnActive: {
    borderColor: theme.colors.akcent,
    borderWidth: 2,
  },
  checkBtnDangerActive: {
    borderColor: theme.colors.blad,
    borderWidth: 2,
  },
  checkBtnText: {
    fontSize: 13,
    color: theme.colors.tusz2,
    fontWeight: '500',
  },
  checkBtnTextActive: {
    color: theme.colors.tusz,
    fontWeight: '700',
  },
  safetyBox: {
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginBottom: 12,
    borderWidth: 1,
  },
  // Pleśń (RD-21) to ostrzeżenie bezpieczeństwa: żółte pole Ostrzeżenia z ciemnym tekstem; płyn i brak objawu: informacja (mapa-rol.md §3)
  // (wcześniej pastelowe tła pod jasnym tekstem: 1,04:1) [M1-audytor-generalny-016]
  safetyNeutral: {
    backgroundColor: theme.colors.powierzchnia,
    borderColor: theme.colors.linia,
  },
  safetyWarning: {
    backgroundColor: theme.colors.powierzchnia,
    borderColor: theme.colors.obwodka,
  },
  safetyDanger: {
    backgroundColor: theme.colors.ostrzTlo,
    borderColor: theme.colors.ostrzTlo,
    borderWidth: 2,
  },
  safetyTekstOstrz: {
    color: theme.colors.ostrzTusz,
  },
  safetyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.tusz,
    marginBottom: 4,
  },
  safetyAction: {
    fontSize: 12,
    color: theme.colors.tusz2,
    lineHeight: 16,
  },
  resetBtn: {
    backgroundColor: theme.colors.powierzchnia,
    paddingVertical: 10,
    minHeight: 44,
    justifyContent: 'center',
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    alignItems: 'center',
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.tusz2,
  },
});

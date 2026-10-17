// ============================================================================
// Apps4Craft Studio — StarterProfileCard Component
// Sourdough starter profile details card with age, feeding timestamp, and storage.
// 100% Offline-First.
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { StoredStarter } from '../../data/db';
import { formatTextUnits } from '../../lib/unit-converter';

export interface StarterProfileCardProps {
  starter: StoredStarter;
  ageDays: number;
  lastFedLabel: string;
  unitSystem: any;
  onPrintLabel: () => void;
  onOpenEditModal: () => void;
}

export function StarterProfileCard({
  starter,
  ageDays,
  lastFedLabel,
  unitSystem,
  onPrintLabel,
  onOpenEditModal,
}: StarterProfileCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <View style={styles.flex1}>
          <Text style={styles.starterName}>{starter.name}</Text>
          <Text style={styles.starterType}>
            {starter.flourType} · Hydratacja {starter.hydration}%
          </Text>
        </View>
        <View style={styles.cardHeaderActions}>
          <Pressable
            testID="print-starter-label-btn"
            style={styles.printLabelBtn}
            onPress={onPrintLabel}
          >
            <Text style={styles.printLabelBtnText}>🖨️ {t('Etykieta PDF')}</Text>
          </Pressable>
          <Pressable
            testID="edit-profile-btn"
            style={styles.editProfileBtn}
            onPress={onOpenEditModal}
          >
            <Text style={styles.editProfileBtnText}>✏️ {t('Edytuj')}</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>{t('Wiek zakwasu')}</Text>
          <Text style={styles.metaValue}>{ageDays} dni</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>{t('Ostatnie dokarmienie')}</Text>
          <Text style={styles.metaValue}>{lastFedLabel}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>{t('Miejsce przechowywania')}</Text>
          <Text style={styles.metaValue}>
            {starter.storageState === 'FRIDGE'
              ? formatTextUnits(t('W lodówce (4°C)'), unitSystem)
              : t('Temperatura pokojowa')}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flex1: {
    flex: 1,
  },
  cardHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starterName: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  starterType: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  printLabelBtn: {
    backgroundColor: theme.colors.surfaceCard,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderActive,
  },
  printLabelBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.accentDark,
  },
  editProfileBtn: {
    backgroundColor: theme.colors.surfaceCard,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  editProfileBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
});

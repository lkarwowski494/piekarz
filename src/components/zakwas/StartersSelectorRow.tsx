// ============================================================================
// Apps4Craft Studio — StartersSelectorRow Component
// Horizontal carousel selector for active sourdough starters.
// 100% Offline-First.
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { StoredStarter } from '../../data/db';

export interface StartersSelectorRowProps {
  startersList: StoredStarter[];
  activeStarterId: string;
  onSelectStarter: (starter: StoredStarter) => void;
  onOpenAddModal: () => void;
}

export function StartersSelectorRow({
  startersList,
  activeStarterId,
  onSelectStarter,
  onOpenAddModal,
}: StartersSelectorRowProps) {
  if (startersList.length === 0) return null;

  return (
    <View style={styles.startersSelectorRow}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.startersScroll}
      >
        {startersList.map((s) => {
          const isSelected = s.id === activeStarterId;
          return (
            <Pressable
              key={s.id}
              testID={`select-starter-${s.id}`}
              style={[styles.starterPill, isSelected && styles.starterPillActive]}
              onPress={() => onSelectStarter(s)}
            >
              <Text
                style={[
                  styles.starterPillText,
                  isSelected && styles.starterPillTextActive,
                ]}
              >
                {isSelected ? '🥣 ' : ''}{s.name}
              </Text>
            </Pressable>
          );
        })}
        <Pressable
          testID="add-starter-btn"
          style={styles.addStarterBtn}
          onPress={onOpenAddModal}
        >
          <Text style={styles.addStarterBtnText}>+ {t('Dodaj nowy zakwas')}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  startersSelectorRow: {
    marginBottom: theme.spacing.md,
  },
  startersScroll: {
    gap: 8,
  },
  starterPill: {
    backgroundColor: theme.colors.powierzchnia,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
  },
  starterPillActive: {
    backgroundColor: theme.colors.akcent,
    borderColor: theme.colors.akcent,
  },
  starterPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.tusz2,
  },
  starterPillTextActive: {
    color: theme.colors.naAkcencie,
    fontWeight: '700',
  },
  addStarterBtn: {
    backgroundColor: theme.colors.powierzchnia,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.akcent,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addStarterBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.akcentTekst,
  },
});

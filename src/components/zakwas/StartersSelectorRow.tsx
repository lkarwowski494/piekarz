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
import { czasSlownie } from '../../lib/spirala-etykieta';
import { etykietaPro } from '../../lib/platnosci/nazwy-pro';
import { OznaczeniePro } from '../OznaczeniePro';

import { odstepy, typografia } from '../../ui/tokeny';
export interface StartersSelectorRowProps {
  startersList: StoredStarter[];
  activeStarterId: string;
  onSelectStarter: (starter: StoredStarter) => void;
  onOpenAddModal: () => void;
  /** Kolejny zakwas wymaga Pro (limit Basic osiągnięty, bez dostępu): przycisk z oznaczeniem „Pro” (P2-4) [M3 P-b]. */
  dodajPro?: boolean;
}

export function StartersSelectorRow({
  startersList,
  activeStarterId,
  onSelectStarter,
  onOpenAddModal,
  dodajPro = false,
}: StartersSelectorRowProps) {
  // Bez zakwasu wiersz zostaje z samym „Dodaj nowy zakwas”: jedyne wejście do dodania pierwszego zakwasu [M1-audytor-generalny-087]
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
              accessibilityRole="button"
              accessibilityState={{ selected: !!(isSelected) }}
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
                {s.name}
              </Text>
              {/* Miejsce i czas od ostatniego dokarmienia przy każdym zakwasie (BR-ZAKW-001) [M1-audytor-generalny-130];
                  bez wpisu dokarmienia samo miejsce */}
              <Text style={[styles.starterPillMeta, isSelected && styles.starterPillTextActive]}>
                {s.storageState === 'FRIDGE' ? t('w lodówce') : t('na blacie')}
              </Text>
              {s.lastFedAt !== undefined ? (
                <Text style={[styles.starterPillMeta, isSelected && styles.starterPillTextActive]}>
                  {t('{czas} od dokarmienia', { czas: czasSlownie(Math.max(0, Math.round((Date.now() - s.lastFedAt) / 60_000))) })}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
        <Pressable
          accessibilityRole="button"
          testID="add-starter-btn"
          accessibilityLabel={etykietaPro(t('Dodaj nowy zakwas'), !dodajPro)}
          style={[styles.addStarterBtn, styles.addStarterRzad]}
          onPress={onOpenAddModal}
        >
          <Text style={styles.addStarterBtnText}>+ {t('Dodaj nowy zakwas')}</Text>
          {dodajPro && <OznaczeniePro />}
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
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
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
    fontSize: typografia.style.przypis.pt,
    fontWeight: '600',
    color: theme.colors.tusz2,
  },
  starterPillMeta: {
    fontSize: typografia.style.podpis.pt,
    color: theme.colors.tusz2,
  },
  starterPillTextActive: {
    color: theme.colors.naAkcencie,
    fontWeight: '700',
  },
  addStarterRzad: { flexDirection: 'row', gap: odstepy.s },
  addStarterBtn: {
    minHeight: theme.cele.pozostale,
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
    fontSize: typografia.style.przypis.pt,
    fontWeight: '600',
    color: theme.colors.akcentTekst,
  },
});

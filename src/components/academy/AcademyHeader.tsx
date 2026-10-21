import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';

import { typografia } from '../../ui/tokeny';
export type AcademyTab = 'school' | 'techniques';

export interface AcademyHeaderProps {
  onClose: () => void;
  activeTab: AcademyTab;
  onSelectTab: (tab: AcademyTab) => void;
}

export function AcademyHeader({
  onClose,
  activeTab,
  onSelectTab,
}: AcademyHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerTitleRow}>
        <Text style={styles.title}>{t('Akademia Piekarza')}</Text>
        <Pressable
          accessibilityRole="button"
          testID="close-modal"
          style={styles.closeBtn}
          onPress={onClose}
          accessibilityLabel={t('Zamknij Akademię')}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.closeBtnText}>✕</Text>
        </Pressable>
      </View>

      {/* Akademia bez rang, odznak i paska postępu rangi (BR-NAUK-001, D-034) [M1-audytor-generalny-032] */}
      {/* Navigation Tabs */}
      <View style={styles.tabNavRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: activeTab === 'school' }}
          testID="academy-tab-school"
          style={[styles.navTab, activeTab === 'school' && styles.navTabActive]}
          onPress={() => onSelectTab('school')}
        >
          <Text style={[styles.navTabText, activeTab === 'school' && styles.navTabTextActive]}>
            {t('Szkoła Chleba')}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: activeTab === 'techniques' }}
          testID="academy-tab-techniques"
          style={[styles.navTab, activeTab === 'techniques' && styles.navTabActive]}
          onPress={() => onSelectTab('techniques')}
        >
          <Text style={[styles.navTabText, activeTab === 'techniques' && styles.navTabTextActive]}>
            {t('Techniki')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.linia,
    backgroundColor: theme.colors.powierzchnia,
  },
  headerTitleRow: {
    fontFamily: theme.typography.krojTytulow,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontFamily: theme.typography.krojTytulow,
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.tusz,
  },
  closeBtn: {
    minHeight: theme.cele.pozostale,
    minWidth: theme.cele.pozostale,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.powierzchnia,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.tusz,
  },
  tabNavRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
  },
  navTab: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: theme.radius.sm,
  },
  navTabActive: {
    backgroundColor: theme.colors.powierzchnia,
  },
  navTabText: {
    fontSize: typografia.style.podpis.pt,
    fontWeight: '600',
    color: theme.colors.tusz3,
  },
  navTabTextActive: {
    color: theme.colors.tusz,
    fontWeight: '700',
  },
});

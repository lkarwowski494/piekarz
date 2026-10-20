import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CloseIcon, sharedCraftTokens } from '@apps4craft/ui';
import { theme } from '../ui/theme';
import { useMotyw } from '../ui/motyw';
import { t } from '../lib/i18n';
import { formatNumber } from '../lib/format';
import {
  searchFlourEquivalents,
} from '../core/flour-equivalents';

interface FlourEquivalentsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function FlourEquivalentsModal({ visible, onClose }: FlourEquivalentsModalProps) {
  const motyw = useMotyw();
  const [searchQuery, setSearchQuery] = useState('');

  const entries = useMemo(() => {
    return searchFlourEquivalents(searchQuery);
  }, [searchQuery]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.title}>🌍 {t('Słownik Odpowiedników Mąk')}</Text>
            <Pressable
              testID="close-flour-equiv-modal-btn"
              style={styles.closeBtn}
              onPress={onClose}
              hitSlop={sharedCraftTokens.hitSlopStandard}
              accessibilityLabel={t('Zamknij słownik mąk')}
            >
              <CloseIcon size={20} color={motyw.kolory.tusz} />
            </Pressable>
          </View>
          <Text style={styles.subtitle}>
            {t('Porównanie standardów przemiału: Polska, Francja, Włochy, Niemcy i USA/UK')}
          </Text>
          <TextInput
            testID="flour-equiv-search-input"
            style={styles.searchInput}
            placeholder={t('Szukaj np. T65, Tipo 00, 550, Bread Flour...')}
            placeholderTextColor={theme.colors.tusz3}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
            autoCapitalize="none"
          />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {entries.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>
                {t('Nie znaleziono odpowiednika dla podanej frazy.')}
              </Text>
            </View>
          ) : (
            entries.map((entry) => (
              <View
                key={entry.id}
                style={styles.card}
                testID={`flour-equiv-card-${entry.id}`}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{t(entry.namePl)}</Text>
                  <View style={styles.absorptionBadge}>
                    <Text style={styles.absorptionBadgeText}>
                      💧 ~{formatNumber(entry.typicalAbsorptionPercent)}% {t('wody')}
                    </Text>
                  </View>
                </View>

                {/* Country mappings grid */}
                <View style={styles.countryGrid}>
                  <View style={styles.countryRow}>
                    <Text style={styles.countryFlag}>🇵🇱 PL:</Text>
                    <Text style={styles.countryType}>{entry.plType}</Text>
                  </View>
                  <View style={styles.countryRow}>
                    <Text style={styles.countryFlag}>🇫🇷 FR:</Text>
                    <Text style={styles.countryType}>{entry.frType}</Text>
                  </View>
                  <View style={styles.countryRow}>
                    <Text style={styles.countryFlag}>🇮🇹 IT:</Text>
                    <Text style={styles.countryType}>{entry.itType}</Text>
                  </View>
                  <View style={styles.countryRow}>
                    <Text style={styles.countryFlag}>🇩🇪 DE:</Text>
                    <Text style={styles.countryType}>{entry.deType}</Text>
                  </View>
                  <View style={styles.countryRow}>
                    <Text style={styles.countryFlag}>🇺🇸 US:</Text>
                    <Text style={styles.countryType}>{entry.usType}</Text>
                  </View>
                </View>

                {/* Technical stats */}
                <View style={styles.statsRow}>
                  <Text style={styles.statChip}>
                    🔥 {t('Popiół:')} {formatNumber(entry.ashPercentRange[0], undefined, { maximumFractionDigits: 2 })}–{formatNumber(entry.ashPercentRange[1], undefined, { maximumFractionDigits: 2 })}%
                  </Text>
                  <Text style={styles.statChip}>
                    🌾 {t('Białko:')} ~{formatNumber(entry.typicalProteinPercent)}%
                  </Text>
                  {entry.wStrengthRange && (
                    <Text style={styles.statChip}>
                      💪 W: {entry.wStrengthRange[0]}–{entry.wStrengthRange[1]}
                    </Text>
                  )}
                </View>

                {/* Best for */}
                <View style={styles.bestForBox}>
                  <Text style={styles.bestForLabel}>🎯 {t('Zastosowanie:')}</Text>
                  <Text style={styles.bestForText}>{t(entry.bestForPl)}</Text>
                </View>

                {/* Substitution advice */}
                <View style={styles.tipsBox}>
                  <Text style={styles.tipsLabel}>💡 {t('Wskazówka rzemieślnicza:')}</Text>
                  <Text style={styles.tipsText}>{t(entry.substitutionTipsPl)}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.tlo,
  },
  header: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.linia,
    backgroundColor: theme.colors.powierzchnia,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.tusz,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.tusz3,
    marginBottom: theme.spacing.sm,
  },
  searchInput: {
    backgroundColor: theme.colors.tlo,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 8,
    fontSize: 14,
    color: theme.colors.tusz,
  },
  closeBtn: {
    minWidth: 44,
    minHeight: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.powierzchnia,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.tusz,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: 32,
  },
  emptyBox: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.tusz3,
    textAlign: 'center',
  },
  card: {
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.linia,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.tusz,
    flex: 1,
    marginRight: 8,
  },
  absorptionBadge: {
    backgroundColor: theme.colors.powierzchnia,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.akcent,
  },
  absorptionBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.akcentTekst,
  },
  countryGrid: {
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  countryFlag: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.tusz2,
    width: 65,
  },
  countryType: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.tusz,
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: theme.spacing.sm,
  },
  statChip: {
    fontSize: 11,
    backgroundColor: theme.colors.tlo,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
    color: theme.colors.tusz2,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
  },
  bestForBox: {
    marginBottom: 6,
  },
  bestForLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.tusz,
    marginBottom: 2,
  },
  bestForText: {
    fontSize: 12,
    color: theme.colors.tusz2,
    lineHeight: 16,
  },
  tipsBox: {
    backgroundColor: theme.colors.powierzchnia,
    padding: 8,
    borderRadius: theme.radius.sm,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.akcent,
  },
  tipsLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.akcentTekst,
    marginBottom: 2,
  },
  tipsText: {
    fontSize: 11,
    color: theme.colors.tusz,
    lineHeight: 15,
  },
});

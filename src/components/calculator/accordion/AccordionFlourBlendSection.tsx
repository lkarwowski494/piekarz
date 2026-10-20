import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { theme } from '../../../ui/theme';
import { t } from '../../../lib/i18n';
import { wejscieWidoczne } from '../../../lib/wejscia-pozniej';
import { FlourItemInput, POPULAR_FLOUR_BLENDS } from '../../../core/domain-rules';

export interface AccordionFlourBlendSectionProps {
  flourBlend: FlourItemInput[];
  onOpenBlendModal: () => void;
  onSelectFlourBlend?: (blend: (typeof POPULAR_FLOUR_BLENDS)[number]) => void;
  onOpenInventory?: () => void;
  onOpenEquivalents?: () => void;
}

export function AccordionFlourBlendSection({
  flourBlend,
  onOpenBlendModal,
  onSelectFlourBlend,
  onOpenInventory,
  onOpenEquivalents,
}: AccordionFlourBlendSectionProps) {
  return (
    <View style={styles.sectionBlock}>
      <View style={styles.rowBetween}>
        <Text style={styles.sectionHeaderTitle}>{t('Mieszanka mąk')}</Text>
        <Pressable
          testID="edit-blend-pro-btn"
          style={styles.pillActionBtn}
          onPress={onOpenBlendModal}
        >
          <Text style={styles.pillActionText}>{t('Edytuj blend')}</Text>
        </Pressable>
      </View>

      {/* Popular flour blend presets */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.blendScroll}>
        {POPULAR_FLOUR_BLENDS.map((blend) => (
          <Pressable
            key={blend.id}
            onPress={() => onSelectFlourBlend?.(blend)}
            style={styles.blendPresetChip}
          >
            <Text style={styles.blendPresetText}>{t(blend.namePl)}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.flourPillsContainer}>
        {flourBlend.map((f, i) => (
          <View key={i} style={styles.flourTag}>
            <Text style={styles.flourTagText}>
              {f.name}: {f.percentage}%
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.flourActionsRow}>
        <Pressable
          testID="open-blend-builder-btn"
          style={styles.flourActionBtn}
          onPress={onOpenBlendModal}
        >
          <Text style={styles.flourActionBtnText}>{t('Skomponuj własną mieszankę mąk')}</Text>
        </Pressable>
        {onOpenInventory && (
          <Pressable
            testID="open-flour-inventory-btn"
            style={styles.flourActionBtn}
            onPress={onOpenInventory}
          >
            <Text style={styles.flourActionBtnText}>{t('Spiżarnia mąk & Stan zapasów')}</Text>
          </Pressable>
        )}
        {/* F-46 PÓŹNIEJ: wejście ukryte (ZM-08, D-034) [M1-audytor-generalny-032] */}
        {onOpenEquivalents && wejscieWidoczne('slownik-mak') && (
          <Pressable
            testID="open-flour-equivalents-btn"
            style={styles.flourActionBtn}
            onPress={onOpenEquivalents}
          >
            <Text style={styles.flourActionBtnText}>{t('Słownik Odpowiedników Mąk')}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionBlock: {
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.linia,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.tusz,
    marginBottom: 4,
  },
  pillActionBtn: {
    backgroundColor: theme.colors.akcent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
  },
  pillActionText: {
    color: theme.colors.naAkcencie,
    fontSize: 11,
    fontWeight: '700',
  },
  blendScroll: {
    marginVertical: 6,
  },
  blendPresetChip: {
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    borderRadius: theme.radius.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
  },
  blendPresetText: {
    fontSize: 12,
    color: theme.colors.tusz2,
    fontWeight: '600',
  },
  flourPillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 6,
  },
  flourTag: {
    backgroundColor: theme.colors.powierzchnia,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.linia,
  },
  flourTagText: {
    fontSize: 11,
    color: theme.colors.tusz2,
    fontWeight: '600',
  },
  flourActionsRow: {
    gap: 6,
    marginTop: 8,
  },
  flourActionBtn: {
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    borderRadius: theme.radius.sm,
    paddingVertical: 8,
    alignItems: 'center',
  },
  flourActionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.tusz,
  },
});

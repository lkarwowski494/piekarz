import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../ui/theme';
import { t, Lang } from '../../lib/i18n';
import { UnitSystem } from '../../lib/unit-converter';

export interface PreferencesSectionProps {
  currentLang: Lang;
  onLanguageChange: (lang: Lang) => void;
  unitSystem: UnitSystem;
  onUnitSystemChange: (unit: UnitSystem) => void;
}

export function PreferencesSection({
  currentLang,
  onLanguageChange,
  unitSystem,
  onUnitSystemChange,
}: PreferencesSectionProps) {
  return (
    <>
      {/* Language Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('Język')}</Text>
        <View style={styles.langRow}>
          <Pressable
            testID="lang-pl"
            style={[styles.langBtn, currentLang === 'pl' && styles.langBtnActive]}
            onPress={() => onLanguageChange('pl')}
          >
            <Text style={[styles.langBtnText, currentLang === 'pl' && styles.langBtnTextActive]}>
              🇵🇱 Polski
            </Text>
          </Pressable>
          <Pressable
            testID="lang-en"
            style={[styles.langBtn, currentLang === 'en' && styles.langBtnActive]}
            onPress={() => onLanguageChange('en')}
          >
            <Text style={[styles.langBtnText, currentLang === 'en' && styles.langBtnTextActive]}>
              🇬🇧 English
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Unit System Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('Jednostki miar')}</Text>
        <View style={styles.langRow}>
          <Pressable
            testID="unit-metric"
            style={[styles.langBtn, unitSystem === 'metric' && styles.langBtnActive]}
            onPress={() => onUnitSystemChange('metric')}
          >
            <Text style={[styles.langBtnText, unitSystem === 'metric' && styles.langBtnTextActive]}>
              ⚖️ {t('Metryczne (°C, g)')}
            </Text>
          </Pressable>
          <Pressable
            testID="unit-imperial"
            style={[styles.langBtn, unitSystem === 'imperial' && styles.langBtnActive]}
            onPress={() => onUnitSystemChange('imperial')}
          >
            <Text style={[styles.langBtnText, unitSystem === 'imperial' && styles.langBtnTextActive]}>
              🌡️ {t('Imperialne (°F, oz)')}
            </Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.linia,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.tusz,
    marginBottom: theme.spacing.sm,
  },
  langRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  langBtn: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    borderRadius: theme.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.powierzchnia,
  },
  langBtnActive: {
    borderColor: theme.colors.akcent,
    borderWidth: 3,
    backgroundColor: theme.colors.powierzchnia,
  },
  langBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.tusz,
  },
  langBtnTextActive: {
    color: theme.colors.akcentTekst,
    fontWeight: '700',
  },
});

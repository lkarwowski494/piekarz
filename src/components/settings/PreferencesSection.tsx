import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../ui/theme';
import { t, Lang } from '../../lib/i18n';
import { UnitSystem } from '../../lib/unit-converter';
import { getLocalesByStatus } from '../../lib/i18n-locales';

import { typografia } from '../../ui/tokeny';
const JEZYKI = getLocalesByStatus('released');

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
        {/* 35 języków w wydaniu (rejestr, przekład 093): siatka przycisków w stylu dotychczasowych dwóch; nazwa języka
            w nim samym, wymowa VoiceOver w tym języku (LOK-12). Docelowy wzór listy: rola 04 [M1-audytor-generalny-093] */}
        <View style={styles.langGrid}>
          {JEZYKI.map(({ code, name }) => {
            const wybrany = currentLang === code;
            return (
              <Pressable
                key={code}
                accessibilityRole="button"
                accessibilityState={{ selected: wybrany }}
                accessibilityLabel={t('Zmień język na {nazwa}', { nazwa: name })}
                accessibilityLanguage={code}
                testID={`lang-${code}`}
                style={[styles.langBtn, styles.langBtnSiatka, wybrany && styles.langBtnActive]}
                onPress={() => onLanguageChange(code as Lang)}
              >
                <Text style={[styles.langBtnText, wybrany && styles.langBtnTextActive]}>{name}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Jeden wybór segmentowy „gramy, °C” / „uncje, °F” (design-spec §7, D-051 3a) [M1-audytor-generalny-096] */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('Jednostki')}</Text>
        <View style={styles.langRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: unitSystem === 'metric' }}
            testID="unit-metric"
            style={[styles.langBtn, unitSystem === 'metric' && styles.langBtnActive]}
            onPress={() => onUnitSystemChange('metric')}
          >
            <Text style={[styles.langBtnText, unitSystem === 'metric' && styles.langBtnTextActive]}>
              {t('gramy, °C')}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: unitSystem === 'imperial' }}
            testID="unit-imperial"
            style={[styles.langBtn, unitSystem === 'imperial' && styles.langBtnActive]}
            onPress={() => onUnitSystemChange('imperial')}
          >
            <Text style={[styles.langBtnText, unitSystem === 'imperial' && styles.langBtnTextActive]}>
              {t('uncje, °F')}
            </Text>
          </Pressable>
        </View>
        <Text style={styles.opis}>{t('Domyślnie według regionu telefonu. Receptury zapisuję w gramach; procenty się nie zmieniają.')}</Text>
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
    fontFamily: theme.typography.krojTytulow,
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
  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  // Dwie kolumny przy 320 pt; dłuższa nazwa języka zawija się w przycisku zamiast go ucinać
  langBtnSiatka: {
    flexGrow: 1,
    flexBasis: '45%',
    paddingHorizontal: theme.spacing.sm,
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
  opis: {
    marginTop: theme.spacing.sm,
    fontSize: typografia.style.przypis.pt,
    color: theme.colors.tusz2,
  },
  langBtnTextActive: {
    color: theme.colors.akcentTekst,
    fontWeight: '700',
  },
});

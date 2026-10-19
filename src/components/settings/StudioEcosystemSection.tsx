import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { PRIVACY_URL } from '../../lib/links';
import { wejscieWidoczne } from '../../lib/wejscia-pozniej';
import {
  CRAFT_APPS,
  NaparAppIcon,
  PiekarzAppIcon,
  SloikAppIcon,
  MasazAppIcon,
  FermentAppIcon,
} from '@apps4craft/ui';

export function StudioEcosystemSection() {
  return (
    <>
      {/* Rodzina Apps4Craft (F-52) PÓŹNIEJ: sekcja ukryta (ZM-14, D-034); karta bezpieczeństwa
          z odnośnikiem prywatności (F-40) zostaje widoczna [M1-audytor-generalny-032] */}
      {wejscieWidoczne('rodzina-apps4craft') && (
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('Rodzina Apps4Craft Studio')}</Text>
        <Text style={styles.cardDescription}>
          {t('Rzemieślnicze aplikacje kulinarne offline-first. Zero chmury, zero telemetrii, 100% pasji:')}
        </Text>
        <View style={styles.appsList}>
          {Object.values(CRAFT_APPS).map((app) => (
            <View
              key={app.id}
              style={[
                styles.appItem,
                app.id === 'piekarz' && styles.appItemCurrent,
              ]}
            >
              <View style={styles.appItemIconWrapper}>
                {app.id === 'napar' && <NaparAppIcon size={28} color={app.accent} />}
                {app.id === 'piekarz' && <PiekarzAppIcon size={28} color={app.accent} />}
                {app.id === 'sloik' && <SloikAppIcon size={28} color={app.accent} />}
                {app.id === 'masaz' && <MasazAppIcon size={28} color={app.accent} />}
                {app.id === 'ferment' && <FermentAppIcon size={28} color={app.accent} />}
              </View>
              <View style={styles.appItemMeta}>
                <View style={styles.appItemTitleRow}>
                  <Text style={[styles.appItemName, { color: app.accent }]}>
                    {app.name}
                  </Text>
                  {app.id === 'piekarz' && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>{t('Ta aplikacja')}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.appItemDomain}>{t(app.domain)}</Text>
                <Text style={styles.appItemDesc}>{t(app.heroDescriptor)}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
      )}

      {/* Security & Database Location */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('Baza danych i bezpieczeństwo')}</Text>
        <View style={styles.row}>
          <Text style={styles.label}>{t('Lokalizacja bazy:')}</Text>
          <Text style={styles.codeText}>/Library/SQLite/piekarz.db</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>{t('Tryb transakcji:')}</Text>
          <Text style={styles.valueText}>ACID / WAL mode</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>{t('Telemetria i chmura:')}</Text>
          <Text style={styles.statusOffText}>{t('0% (Brak trackerów)')}</Text>
        </View>
        {/* Polityka prywatności dostępna także poza paywallem [M1-audytor-generalny-012] */}
        <Pressable
          style={styles.linkRow}
          onPress={() => void Linking.openURL(PRIVACY_URL)}
          accessibilityRole="link"
          accessibilityLabel={t('Polityka prywatności')}
          testID="settings-privacy-link"
        >
          <Text style={styles.linkText}>{t('Polityka prywatności')}</Text>
        </Pressable>
      </View>

      {/* Apps4Craft Manifesto & Version */}
      <View style={styles.manifestoCard}>
        <Text style={styles.manifestoTitle}>Apps4Craft Studio</Text>
        <Text style={styles.manifestoText}>
          „{t('Mąka, woda, sól i czas — rzemieślnicza precyzja bez kompromisów.')}”
        </Text>
        <Text style={styles.manifestoDetails}>
          Piekarz (Crust) v1.0.0 • 100% Offline-First • Data Not Collected
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  cardDescription: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: theme.spacing.md,
  },
  appsList: {
    gap: 8,
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  appItemCurrent: {
    borderColor: theme.colors.accent,
  },
  appItemIconWrapper: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  appItemMeta: {
    flex: 1,
  },
  appItemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appItemName: {
    fontSize: 14,
    fontWeight: '800',
  },
  currentBadge: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#121214',
  },
  appItemDomain: {
    fontSize: 12,
    color: theme.colors.textPrimary,
    marginTop: 1,
  },
  appItemDesc: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  linkRow: {
    minHeight: 44,
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.accent,
    textDecorationLine: 'underline',
  },
  label: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  codeText: {
    fontSize: 12,
    fontFamily: 'System',
    color: theme.colors.accent,
  },
  valueText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  statusOffText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.statusSuccess,
  },
  manifestoCard: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  manifestoTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.accent,
    marginBottom: 4,
  },
  manifestoText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  manifestoDetails: {
    fontSize: 11,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});

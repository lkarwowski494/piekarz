import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking, Alert } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { PRIVACY_URL, APP_STORE_ID, APP_STORE_REVIEW_URL, SUPPORT_EMAIL } from '../../lib/links';
import { czyAdresWsparcia } from '../../lib/zgloszenie';
import { napiszDoAutora } from '../../lib/zgloszenie-wyslanie';
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

      {/* Kontakt i polityka prywatności (makieta ustawienia); bez tekstów technicznych o bazie (design-spec §8)
          [M1-audytor-generalny-088] */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('Kontakt')}</Text>
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
        {/* Stały link do opinii (BR-OPIN-002); ukryty, dopóki Apple ID jest znacznikiem [M1-audytor-generalny-082] */}
        {/^\d+$/.test(APP_STORE_ID) && (
          <Pressable
            style={styles.linkRow}
            onPress={() => {
              Linking.openURL(APP_STORE_REVIEW_URL).catch(() =>
                Alert.alert(t('Oceń w App Store'), t('Ocena wymaga połączenia z App Store.'))
              );
            }}
            accessibilityRole="link"
            accessibilityLabel={t('Oceń w App Store')}
            testID="settings-rate-link"
          >
            <Text style={styles.linkText}>{t('Oceń w App Store')}</Text>
          </Pressable>
        )}
        {/* Kontakt przez systemową pocztę (BR-OPIN-003); ukryty, dopóki adres wsparcia jest znacznikiem [M1-audytor-generalny-083] */}
        {czyAdresWsparcia(SUPPORT_EMAIL) && (
          <Pressable
            style={styles.linkRow}
            onPress={() => void napiszDoAutora()}
            accessibilityRole="button"
            accessibilityLabel={t('Napisz do nas')}
            testID="settings-contact-link"
          >
            <Text style={styles.linkText}>{t('Napisz do nas')}</Text>
          </Pressable>
        )}
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
    get fontFamily() { return theme.typography.krojTytulow; },
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.tusz,
    marginBottom: theme.spacing.sm,
  },
  cardDescription: {
    fontSize: 13,
    color: theme.colors.tusz2,
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
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.linia,
  },
  appItemCurrent: {
    borderColor: theme.colors.akcent,
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
    get fontFamily() { return theme.typography.krojTytulow; },
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appItemName: {
    fontSize: 14,
    fontWeight: '800',
  },
  currentBadge: {
    backgroundColor: theme.colors.akcent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.naAkcencie,
  },
  appItemDomain: {
    fontSize: 12,
    color: theme.colors.tusz,
    marginTop: 1,
  },
  appItemDesc: {
    fontSize: 11,
    color: theme.colors.tusz3,
    marginTop: 2,
  },
  linkRow: {
    minHeight: 44,
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.akcentTekst,
    textDecorationLine: 'underline',
  },
});

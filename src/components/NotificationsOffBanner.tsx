// ============================================================================
// Piekarz — stan „Powiadomienia wyłączone” (design-spec 121–125, ADR-006) [M1-audytor-generalny-006]
// Bez zgody zegar w aplikacji działa, ale telefon nie przypomni o kroku ani karmieniu.
// ============================================================================

import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Linking } from 'react-native';
import { getNotificationPermission, subscribeNotificationPermission, NotificationPermission } from '../lib/notifications';
import { theme } from '../ui/theme';
import { t } from '../lib/i18n';

export const NotificationsOffBanner: React.FC = () => {
  const [status, setStatus] = useState<NotificationPermission>('undetermined');

  useEffect(() => {
    let alive = true;
    void getNotificationPermission()
      .then((s) => alive && setStatus(s))
      .catch(() => undefined);
    const off = subscribeNotificationPermission((s) => alive && setStatus(s));
    return () => {
      alive = false;
      off();
    };
  }, []);

  if (status !== 'denied') return null;
  return (
    <View style={styles.banner} testID="notifications-off-banner">
      <Text style={styles.title}>{t('Powiadomienia wyłączone')}</Text>
      <Text style={styles.body}>
        {t('Zegar działa w aplikacji, ale przy zablokowanym telefonie nie przypomni o końcu kroku ani o karmieniu.')}
      </Text>
      <Pressable
        style={styles.button}
        onPress={() => void Linking.openSettings()}
        accessibilityRole="button"
        testID="notifications-open-settings"
      >
        <Text style={styles.buttonText}>{t('Otwórz Ustawienia')}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: theme.colors.powierzchnia,
    borderColor: theme.colors.obwodka,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  title: { color: theme.colors.tusz, fontSize: 15, fontWeight: '700', marginBottom: 4 },
  body: { color: theme.colors.tusz2, fontSize: 13, lineHeight: 18, marginBottom: theme.spacing.sm },
  button: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
  buttonText: { color: theme.colors.akcentTekst, fontSize: 14, fontWeight: '700' },
});

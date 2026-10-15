import React from 'react';
import { Pressable, Text, Alert, Keyboard, StyleSheet } from 'react-native';
import { theme } from '../ui/theme';
import { t, lang } from '../lib/i18n';
import { backToEditButton } from '../lib/confirm';

export interface HeaderButtonProps {
  title: string;
  onPress: () => void;
  bold?: boolean;
  label?: string;
  testID?: string;
}

/**
 * Standardowy przycisk nagłówka (Apps4Brew HIG standard):
 * Minimalny obszar dotykowy 44x44 pt, wsparcie VoiceOver, limit powiększenia Dynamic Type.
 */
export function HeaderButton({ title, onPress, bold, label, testID }: HeaderButtonProps) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLanguage={lang()}
      accessibilityLabel={label ?? title}
      hitSlop={10}
      onPress={onPress}
      style={styles.headerButton}
    >
      <Text
        accessibilityLanguage={lang()}
        maxFontSizeMultiplier={1.4}
        style={[
          styles.headerButtonText,
          bold && styles.headerButtonBold,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

/**
 * Pytanie o odrzucenie zmian przy anulowaniu edycji szkicu (Draft).
 */
export function confirmDiscard(
  dirty: boolean,
  message: string,
  discard: () => void,
  same: () => boolean = () => true
) {
  Keyboard.dismiss();
  if (!dirty) {
    discard();
    return;
  }
  Alert.alert(t('Odrzucić zmiany?'), message, [
    backToEditButton(),
    {
      text: t('Odrzuć zmiany'),
      style: 'destructive',
      onPress: () => {
        if (same()) discard();
      },
    },
  ]);
}

const styles = StyleSheet.create({
  headerButton: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  headerButtonText: {
    color: theme.colors.accent,
    fontSize: 17,
    fontWeight: '400',
  },
  headerButtonBold: {
    fontWeight: '600',
  },
});

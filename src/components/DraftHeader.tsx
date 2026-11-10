import React from 'react';
import { Pressable, Text, Alert, Keyboard, StyleSheet } from 'react-native';
import { theme } from '../ui/theme';
import { t, lang } from '../lib/i18n';
import { backToEditButton } from '../lib/confirm';

import { typografia } from '../ui/tokeny';
export interface HeaderButtonProps {
  title: string;
  onPress: () => void;
  bold?: boolean;
  label?: string;
  testID?: string;
  /** Przycisk chwilowo nieczynny (np. w trakcie zapisu); bez wartości: zawsze czynny. */
  disabled?: boolean;
}

/**
 * Standardowy przycisk nagłówka (Apps4Brew HIG standard):
 * Minimalny obszar dotykowy 44x44 pt, wsparcie VoiceOver, limit powiększenia Dynamic Type.
 */
export function HeaderButton(props: HeaderButtonProps) {
  return przyciskNaglowka(props);
}

/**
 * Ten sam przycisk jako funkcja rysująca (bez warstwy komponentu): pasek arkusza (`PasekArkusza`) rysuje nim
 * „Anuluj” / „Zapisz”, żeby w drzewie był jeden element z testID i akcją, jak dawne przyciski arkuszy
 * [M1-audytor-generalny-007; 04-studio-projektowe-003].
 */
export function przyciskNaglowka({ title, onPress, bold, label, testID, disabled }: HeaderButtonProps) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLanguage={lang()}
      accessibilityLabel={label ?? title}
      hitSlop={10}
      onPress={onPress}
      {...(disabled !== undefined && { disabled, accessibilityState: { disabled } })}
      style={styles.headerButton}
    >
      <Text
        accessibilityLanguage={lang()}
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
    color: theme.colors.akcentTekst,
    fontSize: typografia.style.tresc.pt,
    fontWeight: '400',
  },
  headerButtonBold: {
    fontWeight: '600',
  },
});

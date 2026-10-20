import React, { useRef } from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { theme } from '../ui/theme';
import { lang } from '../lib/i18n';

export interface AddButtonProps {
  onPress: () => void;
  accessibilityLabel: string;
  testID?: string;
}

/**
 * Standardowy przycisk dodawania (Apps4Brew S4):
 * Przycisk „+” w prawym rogu nagłówka z etykietą VoiceOver „Dodaj {obiekt}”
 * oraz blokadą podwójnego tapnięcia.
 */
export function AddButton({
  onPress,
  accessibilityLabel,
  testID = 'add-button',
}: AddButtonProps) {
  const lastTapRef = useRef<number>(0);

  const handlePress = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 500) {
      return; // Ochrona przed podwójnym stuknięciem
    }
    lastTapRef.current = now;
    onPress();
  };

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLanguage={lang()}
      accessibilityLabel={accessibilityLabel}
      hitSlop={10}
      onPress={handlePress}
      style={styles.button}
    >
      <Text
        accessibilityLanguage={lang()}
        style={styles.text}
      >
        +
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  text: {
    color: theme.colors.akcentTekst,
    fontSize: 26,
    fontWeight: '400',
    lineHeight: 28,
  },
});

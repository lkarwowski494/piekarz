// ============================================================================
// Piekarz (Crust) — NumInput Component (S3, NFR-INT-003, BR-TEST-005, RD-ENG-01)
// Akceptuje przecinek i kropkę, wspiera stany pośrednie w trakcie pisania ("12,"),
// oraz chroni przed dryfem zaokrągleń przez prop `stored` i wInKeep.
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  TextInput,
  TextInputProps,
  StyleSheet,
  StyleProp,
  TextStyle,
} from 'react-native';
import { wInKeep } from '../lib/unit-converter';
import { theme } from '../ui/theme';

export interface NumInputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  value?: number | string;
  stored?: number;
  unit?: string;
  min?: number;
  max?: number;
  onChangeNumber?: (val: number) => void;
  onChangeText?: (text: string) => void;
  style?: StyleProp<TextStyle>;
}

export const NumInput: React.FC<NumInputProps> = ({
  value,
  stored,
  unit = '',
  min,
  max,
  onChangeNumber,
  onChangeText,
  onBlur,
  style,
  keyboardType = 'decimal-pad',
  ...rest
}) => {
  const formatInitial = (v: number | string | undefined): string => {
    if (v === undefined || v === null || v === '') return '';
    return String(v);
  };

  const [rawText, setRawText] = useState<string>(formatInitial(value));
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    if (!isEditing) {
      setRawText(formatInitial(value));
    }
  }, [value, isEditing]);

  const handleChangeText = (text: string) => {
    setRawText(text);
    if (onChangeText) {
      onChangeText(text);
    }
  };

  const handleFocus = () => {
    setIsEditing(true);
  };

  const handleBlur: NonNullable<TextInputProps['onBlur']> = (e) => {
    setIsEditing(false);
    const trimmed = rawText.trim();
    if (trimmed === '') {
      if (onChangeNumber) onChangeNumber(0);
      if (onBlur) onBlur(e);
      return;
    }

    let parsed = wInKeep(trimmed, unit, stored);

    if (min !== undefined && parsed < min) {
      parsed = min;
    }
    if (max !== undefined && parsed > max) {
      parsed = max;
    }

    setRawText(String(parsed));
    if (onChangeNumber) {
      onChangeNumber(parsed);
    }
    if (onBlur) {
      onBlur(e);
    }
  };

  return (
    <TextInput
      value={rawText}
      onChangeText={handleChangeText}
      onFocus={handleFocus}
      onBlur={handleBlur}
      keyboardType={keyboardType}
      placeholderTextColor={theme.colors.textMuted}
      style={[styles.input, style]}
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.textPrimary,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 48,
    fontVariant: ['tabular-nums'],
  },
});

// ============================================================================
// Piekarz (Crust) — Common UI Components (S1..S16, NFR-INT-001..016)
// Komponenty interfejsu: NumInput, Field, Empty, Missing, Btn, SearchField, SwipeRow
// ============================================================================

import React from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  Pressable,
  PressableProps,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../ui/theme';
import { t } from '../lib/i18n';
import { NumInput, NumInputProps } from './NumInput';

export { NumInput, NumInputProps };

// ----------------------------------------------------------------------------
// S2 & NFR-INT-002: Field — Bezpieczne pole tekstowe z limitem znaków maxLength
// ----------------------------------------------------------------------------
export interface FieldProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export const Field: React.FC<FieldProps> = ({
  label,
  error,
  maxLength = 256,
  style,
  containerStyle,
  ...rest
}) => {
  return (
    <View style={[styles.fieldContainer, containerStyle]}>
      {label && <Text style={styles.fieldLabel}>{label}</Text>}
      <TextInput
        maxLength={maxLength}
        placeholderTextColor={theme.colors.textMuted}
        style={[styles.fieldInput, error ? styles.fieldInputError : null, style]}
        {...rest}
      />
      {error && <Text style={styles.fieldErrorText}>{error}</Text>}
    </View>
  );
};

// ----------------------------------------------------------------------------
// S11 & NFR-INT-011: Empty — Stan pusty z wyjaśnieniem i przyciskiem kolejnego kroku
// ----------------------------------------------------------------------------
export interface EmptyProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const Empty: React.FC<EmptyProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  style,
  testID = 'empty-state',
}) => {
  return (
    <View testID={testID} style={[styles.emptyContainer, style]}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {description && <Text style={styles.emptyDescription}>{description}</Text>}
      {actionLabel && onAction && (
        <Pressable
          testID={`${testID}-action`}
          style={styles.emptyButton}
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text style={styles.emptyButtonText}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
};

// ----------------------------------------------------------------------------
// S12 & NFR-INT-012: Missing — Stan brakującego rekordu na trasach [id].tsx
// ----------------------------------------------------------------------------
export interface MissingProps {
  title?: string;
  message?: string;
  backLabel?: string;
  onBack?: () => void;
}

export const Missing: React.FC<MissingProps> = ({
  title = t('Nie znaleziono rekordu'),
  message = t('Wybrany element nie istnieje lub został wcześniej usunięty.'),
  backLabel = t('Wróć'),
  onBack,
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      try {
        router.back();
      } catch {
        router.replace('/');
      }
    }
  };

  return (
    <View testID="missing-record-state" style={styles.missingContainer}>
      <Text style={styles.missingTitle}>{title}</Text>
      <Text style={styles.missingMessage}>{message}</Text>
      <Pressable
        testID="missing-back-button"
        style={styles.missingButton}
        onPress={handleBack}
        accessibilityRole="button"
        accessibilityLabel={backLabel}
      >
        <Text style={styles.missingButtonText}>{backLabel}</Text>
      </Pressable>
    </View>
  );
};

// ----------------------------------------------------------------------------
// S13 & NFR-INT-013: Btn — Hierarchia przycisków (primary, secondary, ghost, danger)
// ----------------------------------------------------------------------------
export type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface BtnProps extends PressableProps {
  title: string;
  variant?: BtnVariant;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Btn: React.FC<BtnProps> = ({
  title,
  variant = 'secondary',
  style,
  textStyle,
  disabled,
  testID = 'btn',
  ...rest
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.btnPrimary;
      case 'danger':
        return styles.btnDanger;
      case 'ghost':
        return styles.btnGhost;
      case 'secondary':
      default:
        return styles.btnSecondary;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.btnTextPrimary;
      case 'danger':
        return styles.btnTextDanger;
      case 'ghost':
        return styles.btnTextGhost;
      case 'secondary':
      default:
        return styles.btnTextSecondary;
    }
  };

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btnBase,
        getVariantStyle(),
        pressed && styles.btnPressed,
        disabled && styles.btnDisabled,
        style,
      ]}
      {...rest}
    >
      <Text style={[getTextStyle(), disabled && styles.btnTextDisabled, textStyle]}>
        {title}
      </Text>
    </Pressable>
  );
};

// ----------------------------------------------------------------------------
// S15 & NFR-INT-015: SearchField — Wyszukiwarka z przyciskiem czyszczenia ×
// ----------------------------------------------------------------------------
export interface SearchFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const SearchField: React.FC<SearchFieldProps> = ({
  value,
  onChangeText,
  placeholder = 'Szukaj...',
  onClear,
  style,
  testID = 'search-field',
}) => {
  const handleClear = () => {
    onChangeText('');
    if (onClear) onClear();
  };

  return (
    <View style={[styles.searchContainer, style]}>
      <TextInput
        testID={testID}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        style={styles.searchInput}
        maxLength={128}
        returnKeyType="search"
        accessibilityRole="search"
        accessibilityLabel={placeholder}
      />
      {value.length > 0 && (
        <Pressable
          testID={`${testID}-clear`}
          style={styles.searchClearBtn}
          onPress={handleClear}
          accessibilityRole="button"
          accessibilityLabel={t('Wyczyść wyszukiwanie')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.searchClearText}>×</Text>
        </Pressable>
      )}
    </View>
  );
};

// ----------------------------------------------------------------------------
// S4 & NFR-INT-004: SwipeRow — Dwutorowe usuwanie elementu z listy
// ----------------------------------------------------------------------------
export interface SwipeRowProps {
  children: React.ReactNode;
  onDelete: () => void;
  deleteLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export const SwipeRow: React.FC<SwipeRowProps> = ({
  children,
  onDelete,
  deleteLabel = t('Usuń'),
  style,
}) => {
  return (
    <View
      style={[styles.swipeRowContainer, style]}
      accessible={true}
      accessibilityActions={[{ name: 'delete', label: deleteLabel }]}
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === 'delete') {
          onDelete();
        }
      }}
    >
      <View style={styles.swipeRowContent}>{children}</View>
      <Pressable
        testID="swipe-row-delete-btn"
        style={styles.swipeRowDeleteBtn}
        onPress={onDelete}
        accessibilityRole="button"
        accessibilityLabel={deleteLabel}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.swipeRowDeleteText}>✕</Text>
      </Pressable>
    </View>
  );
};

// ----------------------------------------------------------------------------
// S6 & NFR-INT-006: SwitchRow — Binarny przełącznik z rolą switch i stanem checked
// ----------------------------------------------------------------------------
export interface SwitchRowProps {
  label: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
  description?: string;
  disabled?: boolean;
  testID?: string;
}

export const SwitchRow: React.FC<SwitchRowProps> = ({
  label,
  value,
  onValueChange,
  description,
  disabled,
  testID = 'switch-row',
}) => {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled: !!disabled }}
      accessibilityLabel={label}
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      style={styles.switchRow}
    >
      <View style={styles.switchRowTextCol}>
        <Text style={styles.switchRowLabel}>{label}</Text>
        {description && <Text style={styles.switchRowDesc}>{description}</Text>}
      </View>
      <View style={[styles.switchTrack, value && styles.switchTrackActive]}>
        <View style={[styles.switchThumb, value && styles.switchThumbActive]} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    minHeight: 48,
  },
  switchRowTextCol: {
    flex: 1,
    marginRight: 16,
  },
  switchRowLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  switchRowDesc: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  switchTrack: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.border,
    padding: 2,
    justifyContent: 'center',
  },
  switchTrackActive: {
    backgroundColor: theme.colors.accent,
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldInput: {
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.textPrimary,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 48,
  },
  fieldInputError: {
    borderColor: theme.colors.statusDanger,
  },
  fieldErrorText: {
    fontSize: 12,
    color: theme.colors.statusDanger,
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  emptyButton: {
    minHeight: 48,
    minWidth: 120,
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyButtonText: {
    color: '#121214',
    fontSize: 15,
    fontWeight: '700',
  },
  missingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: theme.colors.background,
  },
  missingTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  missingMessage: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  missingButton: {
    minHeight: 48,
    minWidth: 140,
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missingButtonText: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  btnBase: {
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {
    backgroundColor: theme.colors.accent,
  },
  btnSecondary: {
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  btnGhost: {
    backgroundColor: 'transparent',
  },
  btnDanger: {
    backgroundColor: '#7F1D1D',
    borderWidth: 1,
    borderColor: theme.colors.statusDanger,
  },
  btnPressed: {
    opacity: 0.8,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnTextPrimary: {
    color: '#121214',
    fontSize: 15,
    fontWeight: '700',
  },
  btnTextSecondary: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  btnTextGhost: {
    color: theme.colors.accent,
    fontSize: 15,
    fontWeight: '600',
  },
  btnTextDanger: {
    color: '#FCA5A5',
    fontSize: 15,
    fontWeight: '700',
  },
  btnTextDisabled: {
    color: theme.colors.textMuted,
  },
  searchContainer: {
    position: 'relative',
    justifyContent: 'center',
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.textPrimary,
    fontSize: 15,
    paddingHorizontal: 12,
    paddingRight: 40,
    minHeight: 44,
  },
  searchClearBtn: {
    position: 'absolute',
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchClearText: {
    color: theme.colors.textSecondary,
    fontSize: 18,
    lineHeight: 20,
    fontWeight: '600',
  },
  swipeRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: theme.radius.sm,
    marginVertical: 4,
    overflow: 'hidden',
  },
  swipeRowContent: {
    flex: 1,
  },
  swipeRowDeleteBtn: {
    width: 48,
    minHeight: 44,
    backgroundColor: '#7F1D1D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeRowDeleteText: {
    color: '#FCA5A5',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

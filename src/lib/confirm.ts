import { Alert } from 'react-native';
import { t } from './i18n';

export type CancelBtn = { text: string; style: 'cancel'; onPress?: () => void };

/**
 * Wzorzec potwierdzania akcji (Apps4Brew / HIG Alerts).
 * Zasada: przycisk rezygnacji w alertach ma ZAWSZE jedno słowo: „Anuluj”.
 * Jedyny wyjątek: „Wróć do edycji” przy odrzucaniu szkicu (aby słowo „Anuluj” nie myliło).
 * Zakaz używania słów „Nie” lub „Wróć” jako przycisków rezygnacji.
 */
export const cancelButton = (onPress?: () => void): CancelBtn => ({
  text: t('Anuluj'),
  style: 'cancel',
  ...(onPress ? { onPress } : {}),
});

export const backToEditButton = (): CancelBtn => ({
  text: t('Wróć do edycji'),
  style: 'cancel',
});

export const okButton = (): CancelBtn => ({
  text: t('OK'),
  style: 'cancel',
});

export interface ConfirmParams {
  title: string;
  message?: string;
  action: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

export function confirm({
  title,
  message,
  action,
  destructive,
  onConfirm,
  onCancel,
}: ConfirmParams) {
  Alert.alert(title, message, [
    cancelButton(onCancel),
    {
      text: action,
      ...(destructive ? { style: 'destructive' as const } : {}),
      onPress: onConfirm,
    },
  ]);
}

/**
 * Potwierdzenie porzucenia trwającego wypieku.
 */
export function confirmDiscardBake(onConfirm: () => void) {
  confirm({
    title: t('Odrzucić trwający wypiek?'),
    message: t('Przerwiesz bieżący harmonogram i pomiary czasu.'),
    action: t('Odrzuć wypiek'),
    destructive: true,
    onConfirm,
  });
}

/**
 * Potwierdzenie zresetowania profilu zakwasu.
 */
export function confirmResetStarter(onConfirm: () => void) {
  confirm({
    title: t('Zresetować profil zakwasu?'),
    message: t('Dotychczasowy cykl dokarmiania zostanie wyzerowany.'),
    action: t('Resetuj profil'),
    destructive: true,
    onConfirm,
  });
}

/**
 * Potwierdzenie usunięcia wpisu z historii wypieków.
 */
export function confirmDeleteBakeLog(onConfirm: () => void) {
  confirm({
    title: t('Usunąć wpis z historii?'),
    message: t('Wpis z historii wypieku zostanie trwale usunięty.'),
    action: t('Usuń wpis'),
    destructive: true,
    onConfirm,
  });
}

/**
 * Potwierdzenie usunięcia profilu zakwasu.
 */
export function confirmDeleteStarter(name: string, onConfirm: () => void) {
  confirm({
    title: t('Usunąć profil zakwasu?'),
    message: `${t('Profil zakwasu')} „${name}” ${t('zostanie trwale usunięty wraz z całą historią dokarmiania.')}`,
    action: t('Usuń zakwas'),
    destructive: true,
    onConfirm,
  });
}

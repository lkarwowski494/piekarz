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
 * Potwierdzenie przerwania trwającego wypieku: [Wróć do wypieku] [Przerwij]
 * (słownik interakcji, docs/design/design-spec.md §5; wyjątek od „Anuluj”, bo rezygnacja wraca do wypieku) [M1-audytor-generalny-089].
 */
export function confirmDiscardBake(onConfirm: () => void) {
  Alert.alert(t('Przerwać wypiek?'), t('Powiadomienia o kolejnych krokach znikną.'), [
    { text: t('Wróć do wypieku'), style: 'cancel' },
    { text: t('Przerwij'), style: 'destructive', onPress: onConfirm },
  ]);
}

/**
 * Potwierdzenie zresetowania profilu zakwasu.
 */
export function confirmResetStarter(onConfirm: () => void) {
  confirm({
    title: t('Zacząć profil zakwasu od nowa?'),
    message: t('Dotychczasowy cykl dokarmiania zostanie wyzerowany.'),
    action: t('Zacznij od nowa'),
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

/**
 * Potwierdzenie usunięcia autorskiej receptury.
 */
export function confirmDeleteRecipe(name: string, onConfirm: () => void) {
  confirm({
    title: t('Usunąć recepturę?'),
    message: `${t('Receptura')} „${name}” ${t('zostanie trwale usunięta z bazy.')}`,
    action: t('Usuń recepturę'),
    destructive: true,
    onConfirm,
  });
}


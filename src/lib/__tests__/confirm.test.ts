import { Alert } from 'react-native';
import {
  cancelButton,
  backToEditButton,
  okButton,
  confirm,
  confirmDiscardBake,
  confirmStartPrzyTrwajacym,
  confirmLimitWypiekow,
  confirmResetStarter,
  confirmDeleteStarter,
  confirmDeleteRecipe,
} from '../confirm';
import { setLang } from '../i18n';

jest.spyOn(Alert, 'alert');

describe('Apps4Brew Confirm Interaction Standard (docs/32 wzorzec 6)', () => {
  beforeEach(() => {
    setLang('pl');
    jest.clearAllMocks();
  });

  it('cancelButton always uses exactly "Anuluj" with style cancel', () => {
    const btn = cancelButton();
    expect(btn.text).toBe('Anuluj');
    expect(btn.style).toBe('cancel');
  });

  it('backToEditButton uses "Wróć do edycji" exclusively for discarding edits', () => {
    const btn = backToEditButton();
    expect(btn.text).toBe('Wróć do edycji');
    expect(btn.style).toBe('cancel');
  });

  it('okButton uses "OK" for informational alerts', () => {
    const btn = okButton();
    expect(btn.text).toBe('OK');
    expect(btn.style).toBe('cancel');
  });

  it('confirm invokes Alert.alert with cancel and action buttons', () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();

    confirm({
      title: 'Tytuł testu',
      message: 'Treść testowa',
      action: 'Wykonaj',
      destructive: true,
      onConfirm,
      onCancel,
    });

    expect(Alert.alert).toHaveBeenCalledTimes(1);
    const [title, message, buttons] = (Alert.alert as jest.Mock).mock.calls[0];

    expect(title).toBe('Tytuł testu');
    expect(message).toBe('Treść testowa');
    expect(buttons).toHaveLength(2);
    expect(buttons[0].text).toBe('Anuluj');
    expect(buttons[0].style).toBe('cancel');
    expect(buttons[1].text).toBe('Wykonaj');
    expect(buttons[1].style).toBe('destructive');
  });

  it('confirmDiscardBake uses destructive action and precise copy', () => {
    const onConfirm = jest.fn();
    confirmDiscardBake(onConfirm);

    expect(Alert.alert).toHaveBeenCalledTimes(1);
    const [title, , buttons] = (Alert.alert as jest.Mock).mock.calls[0];
    expect(title).toBe('Przerwać wypiek?');
    expect(buttons[0].text).toBe('Wróć do wypieku');
    expect(buttons[0].style).toBe('cancel');
    expect(buttons[1].text).toBe('Przerwij');
    expect(buttons[1].style).toBe('destructive');
  });

  // Zmiana D3a (D-104): pytanie a1b z przerwaniem zastąpione przez „Prowadź oba” / „Wróć do: …” / „Anuluj”
  it('confirmStartPrzyTrwajacym: „Prowadź oba” domyślne, „Wróć do: {nazwa}” z id, Anuluj bez skutku, nic niszczącego (D3a)', () => {
    const oba = jest.fn();
    const wroc = jest.fn();
    confirmStartPrzyTrwajacym({ id: 'bake_a', nazwa: 'Chleb' }, oba, wroc);

    expect(Alert.alert).toHaveBeenCalledTimes(1);
    const [title, message, buttons] = (Alert.alert as jest.Mock).mock.calls[0];
    expect(title).toBe('Trwa już inny wypiek');
    expect(message).toBeUndefined();
    expect(buttons.map((b: { text: string }) => b.text)).toEqual(['Prowadź oba', 'Wróć do: Chleb', 'Anuluj']);
    expect(buttons[0].isPreferred).toBe(true);
    expect(buttons.some((b: { style?: string }) => b.style === 'destructive')).toBe(false);
    expect(buttons[2].style).toBe('cancel');
    buttons[2].onPress?.();
    expect(oba).not.toHaveBeenCalled();
    expect(wroc).not.toHaveBeenCalled();
    buttons[0].onPress();
    expect(oba).toHaveBeenCalledTimes(1);
    buttons[1].onPress();
    expect(wroc).toHaveBeenCalledWith('bake_a');
  });

  it('confirmLimitWypiekow: „Prowadzisz już 2 wypieki”, powrót do każdego z id, bez nazwy „Wróć do wypieku”, Anuluj (D3a)', () => {
    const wroc = jest.fn();
    confirmLimitWypiekow([{ id: 'bake_a', nazwa: 'Chleb' }, { id: 'bake_b', nazwa: null }], wroc);
    const [title, message, buttons] = (Alert.alert as jest.Mock).mock.calls[0];
    expect(title).toBe('Prowadzisz już 2 wypieki');
    expect(message).toBeUndefined();
    expect(buttons.map((b: { text: string }) => b.text)).toEqual(['Wróć do: Chleb', 'Wróć do wypieku', 'Anuluj']);
    expect(buttons[2].style).toBe('cancel');
    buttons[1].onPress();
    expect(wroc).toHaveBeenCalledWith('bake_b');
  });

  it('confirmResetStarter uses destructive action to protect user data', () => {
    const onConfirm = jest.fn();
    confirmResetStarter(onConfirm);

    expect(Alert.alert).toHaveBeenCalledTimes(1);
    const [title, , buttons] = (Alert.alert as jest.Mock).mock.calls[0];
    expect(title).toBe('Zacząć profil zakwasu od nowa?');
    expect(buttons[1].text).toBe('Zacznij od nowa');
    expect(buttons[1].style).toBe('destructive');
  });

  it('confirmDeleteStarter uses destructive action and mentions starter name', () => {
    const onConfirm = jest.fn();
    confirmDeleteStarter('Bolesław', onConfirm);

    expect(Alert.alert).toHaveBeenCalledTimes(1);
    const [title, message, buttons] = (Alert.alert as jest.Mock).mock.calls[0];
    expect(title).toBe('Usunąć profil zakwasu?');
    expect(message).toContain('Bolesław');
    expect(buttons[1].text).toBe('Usuń zakwas');
    expect(buttons[1].style).toBe('destructive');
  });

  it('confirmDeleteRecipe uses destructive action and mentions recipe name', () => {
    const onConfirm = jest.fn();
    confirmDeleteRecipe('Moja Bagietka', onConfirm);

    expect(Alert.alert).toHaveBeenCalledTimes(1);
    const [title, message, buttons] = (Alert.alert as jest.Mock).mock.calls[0];
    expect(title).toBe('Usunąć recepturę?');
    expect(message).toContain('Moja Bagietka');
    expect(buttons[1].text).toBe('Usuń recepturę');
    expect(buttons[1].style).toBe('destructive');
  });
});


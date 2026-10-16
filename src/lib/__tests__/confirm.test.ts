import { Alert } from 'react-native';
import {
  cancelButton,
  backToEditButton,
  okButton,
  confirm,
  confirmDiscardBake,
  confirmResetStarter,
  confirmDeleteBakeLog,
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
    expect(title).toBe('Odrzucić trwający wypiek?');
    expect(buttons[1].text).toBe('Odrzuć wypiek');
    expect(buttons[1].style).toBe('destructive');
  });

  it('confirmResetStarter uses destructive action to protect user data', () => {
    const onConfirm = jest.fn();
    confirmResetStarter(onConfirm);

    expect(Alert.alert).toHaveBeenCalledTimes(1);
    const [title, , buttons] = (Alert.alert as jest.Mock).mock.calls[0];
    expect(title).toBe('Zresetować profil zakwasu?');
    expect(buttons[1].text).toBe('Resetuj profil');
    expect(buttons[1].style).toBe('destructive');
  });

  it('confirmDeleteBakeLog uses destructive action and exact warning copy', () => {
    const onConfirm = jest.fn();
    confirmDeleteBakeLog(onConfirm);

    expect(Alert.alert).toHaveBeenCalledTimes(1);
    const [title, , buttons] = (Alert.alert as jest.Mock).mock.calls[0];
    expect(title).toBe('Usunąć wpis z historii?');
    expect(buttons[1].text).toBe('Usuń wpis');
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


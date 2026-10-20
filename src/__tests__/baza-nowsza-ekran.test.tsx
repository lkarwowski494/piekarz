/**
 * Baza nowsza niż aplikacja na ekranie [M1-audytor-generalny-061; 05-architekt-012]: bramka pokazuje
 * komunikat (PL i EN) nad aplikacją, którą da się przeglądać; nieudany zapis mówi o aktualizacji,
 * a stan dostępu ustala się mimo braku zapisu pamięci zakupu.
 */
import React from 'react';
import { Alert, Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { StorageGate } from '../components/StorageGate';
import { assertWritable, markStorageNewer, resetStorageState, StorageReadOnlyError, StorageWriteError } from '../data/storage-status';
import { guardSave, saveErrorText } from '../lib/save-guard';
import { setLang } from '../lib/i18n';
import { ustalDostep, pobierzStan, _resetStanu } from '../lib/platnosci/stan';

const PL = 'Dane zapisała nowsza wersja Piekarza. Zaktualizuj aplikację, żeby dalej zapisywać. Do tego czasu możesz tylko przeglądać.';
const EN = 'Your data was saved by a newer version of Baker. Update the app to keep saving. Until then you can only view it.';

const textOf = (n: unknown): string => {
  if (typeof n === 'string') return n;
  if (Array.isArray(n)) return n.map(textOf).join('');
  if (n && typeof n === 'object' && 'children' in n) return textOf((n as { children: unknown }).children);
  return '';
};

describe('Baza nowsza niż aplikacja — ekran (061)', () => {
  afterEach(() => {
    setLang('pl');
    resetStorageState();
  });

  it.each([
    ['pl', PL],
    ['en', EN],
  ] as const)('StorageGate (%s): komunikat tylko do odczytu nad aplikacją, aplikacja widoczna', async (lang, text) => {
    setLang(lang);
    let tree: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      tree = renderer.create(
        <StorageGate onRetry={async () => {}}>
          <Text>APP</Text>
        </StorageGate>
      );
    });
    expect(tree!.root.findAll((n) => n.props?.testID === 'storage-newer-notice')).toEqual([]);
    await act(async () => {
      markStorageNewer(5, 4);
    });
    const shown = textOf(tree!.toJSON());
    expect(shown).toContain(text);
    expect(shown).toContain('APP');
    expect(tree!.root.findByProps({ testID: 'storage-newer-notice' }).props.accessibilityRole).toBe('alert');
    expect(tree!.root.findAll((n) => n.props?.testID === 'storage-unavailable-screen')).toEqual([]);
    act(() => tree!.unmount());
  });

  it('guardSave: zapis odrzucony w trybie tylko do odczytu daje „Nie zapisano” z prośbą o aktualizację', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    await guardSave(async () => {
      throw new StorageReadOnlyError();
    })();
    expect(alert).toHaveBeenCalledWith('Nie zapisano', PL);
    alert.mockRestore();
  });

  it('assertWritable rzuca StorageReadOnlyError tylko w trybie „newer”; saveErrorText rozróżnia przyczynę', () => {
    expect(() => assertWritable()).not.toThrow();
    markStorageNewer(5, 4);
    expect(() => assertWritable()).toThrow(StorageReadOnlyError);
    expect(saveErrorText(new StorageReadOnlyError())).toBe(PL);
    expect(saveErrorText(new StorageWriteError(new Error('SQLITE_FULL')))).toBe(
      'Zmiana nie została zapisana w pamięci telefonu. Sprawdź wolne miejsce i spróbuj ponownie.'
    );
  });

  it('ustalDostep w trybie tylko do odczytu ustala dostęp bez zapisu pamięci zakupu', async () => {
    _resetStanu();
    markStorageNewer(5, 4);
    await expect(ustalDostep({ zrodlo: 'sklep', uprawnienia: [] })).resolves.toBeTruthy();
    expect(pobierzStan().gotowe).toBe(true);
  });
});

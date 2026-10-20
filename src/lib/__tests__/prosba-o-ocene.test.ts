/**
 * BR-OPIN-001 (DEC-13 a, D-042): systemowa prośba o ocenę tylko po wypieku ocenionym na co najmniej 4★,
 * najwyżej 3 razy w 365 dniach. Wektory W01–W15 i M01–M06: docs/wzrost/wektory-prosba-o-ocene.json
 * [M1-audytor-generalny-082; 11-wzrost-004].
 */
import { readFileSync } from 'fs';
import { join } from 'path';

const mockSettings = new Map<string, string>();
jest.mock('../../data/settings-store', () => ({
  getAppSetting: jest.fn(async (key: string) => mockSettings.get(key)),
  setAppSetting: jest.fn(async (key: string, value: string) => {
    const { assertWritable } = jest.requireActual('../../data/storage-status');
    assertWritable();
    mockSettings.set(key, value);
  }),
}));
jest.mock('expo-store-review', () => ({
  isAvailableAsync: jest.fn(async () => true),
  hasAction: jest.fn(async () => true),
  requestReview: jest.fn(async () => undefined),
}));

import * as StoreReview from 'expo-store-review';
import { czyProsicOOcene, PROSBA_O_OCENE } from '../prosba-o-ocene';
import { poprosOOceneJesliWarto, KLUCZ_DAT_PROSBY } from '../prosba-o-ocene-wywolanie';
import { markStorageNewer, resetStorageState } from '../../data/storage-status';

interface Wektor {
  id: string;
  we: { ocenaWypieku: number | null; datyPoprzednichProsb: string[]; teraz: string };
  oczekiwane: boolean;
}
const plik = JSON.parse(
  readFileSync(join(__dirname, '../../../docs/wzrost/wektory-prosba-o-ocene.json'), 'utf8')
) as { stale: typeof PROSBA_O_OCENE; wektory: Wektor[]; miejsce_wywolania: { id: string }[] };

const review = StoreReview as jest.Mocked<typeof StoreReview>;
const zapisaneDaty = (): unknown => {
  const raw = mockSettings.get(KLUCZ_DAT_PROSBY);
  return raw === undefined ? undefined : JSON.parse(raw);
};
const TERAZ = Date.parse('2027-03-01T12:00:00Z');

describe('czyProsicOOcene: wektory W01–W15', () => {
  it('stałe zgodne ze specyfikacją (D-042, S-63)', () => {
    expect(PROSBA_O_OCENE).toEqual(plik.stale);
  });

  it('plik ma 15 wektorów funkcji', () => {
    expect(plik.wektory.map((w) => w.id)).toEqual(
      Array.from({ length: 15 }, (_, i) => `W${String(i + 1).padStart(2, '0')}`)
    );
  });

  it.each(plik.wektory.map((w) => [w.id, w] as const))('%s', (_id, w) => {
    const wynik = czyProsicOOcene({
      ocenaWypieku: w.we.ocenaWypieku,
      datyPoprzednichProsb: w.we.datyPoprzednichProsb.map((d) => Date.parse(d)),
      teraz: Date.parse(w.we.teraz),
    });
    expect(wynik).toBe(w.oczekiwane);
  });
});

describe('poprosOOceneJesliWarto: miejsce wywołania M01–M05', () => {
  beforeEach(() => {
    mockSettings.clear();
    resetStorageState();
    jest.clearAllMocks();
    review.isAvailableAsync.mockResolvedValue(true);
    review.hasAction.mockResolvedValue(true);
    review.requestReview.mockResolvedValue(undefined);
    jest.spyOn(Date, 'now').mockReturnValue(TERAZ);
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('plik ma wektory M01–M06', () => {
    expect(plik.miejsce_wywolania.map((m) => m.id)).toEqual(['M01', 'M02', 'M03', 'M04', 'M05', 'M06']);
  });

  it('M01: isAvailableAsync false (TestFlight) — bez requestReview i bez zapisu daty', async () => {
    review.isAvailableAsync.mockResolvedValue(false);
    await poprosOOceneJesliWarto(5);
    expect(review.requestReview).not.toHaveBeenCalled();
    expect(zapisaneDaty()).toBeUndefined();
  });

  it('M02: hasAction false — bez requestReview i bez zapisu daty', async () => {
    review.hasAction.mockResolvedValue(false);
    await poprosOOceneJesliWarto(5);
    expect(review.requestReview).not.toHaveBeenCalled();
    expect(zapisaneDaty()).toBeUndefined();
  });

  it('M03: warunek spełniony — jedno requestReview i zapis bieżącej daty do listy', async () => {
    mockSettings.set(KLUCZ_DAT_PROSBY, JSON.stringify([Date.parse('2026-11-15T12:00:00Z')]));
    await poprosOOceneJesliWarto(4);
    expect(review.requestReview).toHaveBeenCalledTimes(1);
    expect(zapisaneDaty()).toEqual([Date.parse('2026-11-15T12:00:00Z'), TERAZ]);
  });

  it('M03: requestReview dopiero po zamknięciu okna zapisu, nie od razu w obsłudze dotknięcia', async () => {
    jest.useFakeTimers();
    try {
      const wywolanie = poprosOOceneJesliWarto(5);
      for (let i = 0; i < 20; i++) await Promise.resolve();
      expect(review.requestReview).not.toHaveBeenCalled();
      await jest.advanceTimersByTimeAsync(1000);
      await wywolanie;
      expect(review.requestReview).toHaveBeenCalledTimes(1);
    } finally {
      jest.useRealTimers();
    }
  });

  it('M03: trzy prośby w roku — czwarta się nie pokazuje (limit z zapisanych dat)', async () => {
    await poprosOOceneJesliWarto(5);
    await poprosOOceneJesliWarto(5);
    await poprosOOceneJesliWarto(5);
    await poprosOOceneJesliWarto(5);
    expect(review.requestReview).toHaveBeenCalledTimes(3);
    expect(zapisaneDaty()).toEqual([TERAZ, TERAZ, TERAZ]);
  });

  it('ocena poniżej 4★ albo nietknięte gwiazdki (null) — bez requestReview', async () => {
    await poprosOOceneJesliWarto(3);
    await poprosOOceneJesliWarto(null);
    expect(review.requestReview).not.toHaveBeenCalled();
  });

  it('uszkodzony zapis dat liczy się do limitu, nie jak pusta lista', async () => {
    mockSettings.set(KLUCZ_DAT_PROSBY, '{zepsute');
    await poprosOOceneJesliWarto(5);
    await poprosOOceneJesliWarto(5);
    await poprosOOceneJesliWarto(5);
    expect(review.requestReview).toHaveBeenCalledTimes(2);
  });

  it('M05: requestReview rzuca — błąd połknięty, daty nie zapisuje się', async () => {
    review.requestReview.mockRejectedValue(Object.assign(new Error('fail'), { code: 'ERR_STORE_REVIEW_FAILED' }));
    await expect(poprosOOceneJesliWarto(5)).resolves.toBeUndefined();
    expect(review.requestReview).toHaveBeenCalledTimes(1);
    expect(zapisaneDaty()).toBeUndefined();
  });

  it('baza tylko do odczytu (061): prośba się nie pokazuje, bez nieobsłużonego odrzucenia', async () => {
    markStorageNewer(99, 4);
    await expect(poprosOOceneJesliWarto(5)).resolves.toBeUndefined();
    expect(review.requestReview).not.toHaveBeenCalled();
  });
});

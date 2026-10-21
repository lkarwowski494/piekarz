/**
 * BR-OPIN-001 (DEC-13 a; DEC-20 a, D-067 uchyla próg 4★ z D-042): systemowa prośba o ocenę od 3. ukończonego
 * wypieku, bez warunku oceny bochenka, z odstępem 14 dni, najwyżej 3 razy w 365 dniach. Wektory W01–W19
 * i M01–M06: docs/wzrost/wektory-prosba-o-ocene.json [M1-audytor-generalny-082; 11-wzrost-004;
 * M1-audytor-generalny-138; 11-wzrost-501, 11-wzrost-502].
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
let mockWypieki = 3;
jest.mock('../../data/sqlite-store', () => ({
  getBakeLogs: jest.fn(async () => Array.from({ length: mockWypieki }, (_, i) => ({ id: `b${i}`, finishedAt: 1 }))),
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
  we: { zakonczoneWypieki: number; ocenaWypieku?: number; datyPoprzednichProsb: string[]; teraz: string };
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

describe('czyProsicOOcene: wektory W01–W19', () => {
  it('stałe zgodne ze specyfikacją (DEC-20 a, D-067, S-63)', () => {
    expect(PROSBA_O_OCENE).toEqual(plik.stale);
  });

  it('plik ma 19 wektorów funkcji', () => {
    expect(plik.wektory.map((w) => w.id)).toEqual(
      Array.from({ length: 19 }, (_, i) => `W${String(i + 1).padStart(2, '0')}`)
    );
  });

  // Pole ocenaWypieku przechodzi do funkcji razem z resztą wektora; warunek go nie czyta (11-wzrost-501)
  const wejscie = (w: Wektor) => {
    const we = { ...w.we, datyPoprzednichProsb: w.we.datyPoprzednichProsb.map((d) => Date.parse(d)), teraz: Date.parse(w.we.teraz) };
    return we;
  };

  it.each(plik.wektory.map((w) => [w.id, w] as const))('%s', (_id, w) => {
    expect(czyProsicOOcene(wejscie(w))).toBe(w.oczekiwane);
  });

  it('wektor z oceną 1★ i progami spełnionymi daje ten sam wynik co z 5★ (138)', () => {
    const w = (id: string) => plik.wektory.find((x) => x.id === id)!;
    expect(w('W04').we.ocenaWypieku).toBe(1);
    expect(w('W05').we.ocenaWypieku).toBe(5);
    expect(czyProsicOOcene(wejscie(w('W04')))).toBe(czyProsicOOcene(wejscie(w('W05'))));
    for (const ocena of [1, 2, 3, 4, 5]) {
      const we = { ...wejscie(w('W03')), ocenaWypieku: ocena };
      expect(czyProsicOOcene(we)).toBe(true);
    }
  });
});

describe('poprosOOceneJesliWarto: miejsce wywołania M01–M05', () => {
  beforeEach(() => {
    mockSettings.clear();
    mockWypieki = 3;
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
    await poprosOOceneJesliWarto();
    expect(review.requestReview).not.toHaveBeenCalled();
    expect(zapisaneDaty()).toBeUndefined();
  });

  it('M02: hasAction false — bez requestReview i bez zapisu daty', async () => {
    review.hasAction.mockResolvedValue(false);
    await poprosOOceneJesliWarto();
    expect(review.requestReview).not.toHaveBeenCalled();
    expect(zapisaneDaty()).toBeUndefined();
  });

  it('M03: warunek spełniony — jedno requestReview i zapis bieżącej daty do listy', async () => {
    mockSettings.set(KLUCZ_DAT_PROSBY, JSON.stringify([Date.parse('2026-11-15T12:00:00Z')]));
    await poprosOOceneJesliWarto();
    expect(review.requestReview).toHaveBeenCalledTimes(1);
    expect(zapisaneDaty()).toEqual([Date.parse('2026-11-15T12:00:00Z'), TERAZ]);
  });

  it('M03: requestReview dopiero po zamknięciu okna zapisu, nie od razu w obsłudze dotknięcia', async () => {
    jest.useFakeTimers();
    try {
      const wywolanie = poprosOOceneJesliWarto();
      for (let i = 0; i < 20; i++) await Promise.resolve();
      expect(review.requestReview).not.toHaveBeenCalled();
      await jest.advanceTimersByTimeAsync(1000);
      await wywolanie;
      expect(review.requestReview).toHaveBeenCalledTimes(1);
    } finally {
      jest.useRealTimers();
    }
  });

  it('M03: kolejne wypieki dzień po dniu — jedna prośba, następna dopiero po 14 dniach (odstęp, 502)', async () => {
    await poprosOOceneJesliWarto();
    (Date.now as jest.Mock).mockReturnValue(TERAZ + 86_400_000);
    await poprosOOceneJesliWarto();
    (Date.now as jest.Mock).mockReturnValue(TERAZ + 2 * 86_400_000);
    await poprosOOceneJesliWarto();
    expect(review.requestReview).toHaveBeenCalledTimes(1);
    (Date.now as jest.Mock).mockReturnValue(TERAZ + 14 * 86_400_000);
    await poprosOOceneJesliWarto();
    expect(review.requestReview).toHaveBeenCalledTimes(2);
    expect(zapisaneDaty()).toEqual([TERAZ, TERAZ + 14 * 86_400_000]);
  });

  it('mniej niż 3 ukończone wypieki w dzienniku — bez requestReview', async () => {
    mockWypieki = 2;
    await poprosOOceneJesliWarto();
    expect(review.requestReview).not.toHaveBeenCalled();
  });

  it('uszkodzony zapis dat liczy się do limitu, nie jak pusta lista', async () => {
    mockSettings.set(KLUCZ_DAT_PROSBY, '{zepsute');
    for (let i = 0; i < 4; i++) {
      (Date.now as jest.Mock).mockReturnValue(TERAZ + i * 15 * 86_400_000);
      await poprosOOceneJesliWarto();
    }
    expect(review.requestReview).toHaveBeenCalledTimes(2);
  });

  it('M05: requestReview rzuca — błąd połknięty, daty nie zapisuje się', async () => {
    review.requestReview.mockRejectedValue(Object.assign(new Error('fail'), { code: 'ERR_STORE_REVIEW_FAILED' }));
    await expect(poprosOOceneJesliWarto()).resolves.toBeUndefined();
    expect(review.requestReview).toHaveBeenCalledTimes(1);
    expect(zapisaneDaty()).toBeUndefined();
  });

  it('baza tylko do odczytu (061): prośba się nie pokazuje, bez nieobsłużonego odrzucenia', async () => {
    markStorageNewer(99, 4);
    await expect(poprosOOceneJesliWarto()).resolves.toBeUndefined();
    expect(review.requestReview).not.toHaveBeenCalled();
  });
});

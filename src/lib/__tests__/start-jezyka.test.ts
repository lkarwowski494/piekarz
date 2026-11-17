/** Język na starcie z limitem czasu (KO-071, AB-06/AB-07, D-425): błąd albo zawieszenie odczytu daje język systemu, bez rzucania. */
import { JEZYK_START_LIMIT_MS, jezykNaStart } from '../start-jezyka';

afterEach(() => jest.useRealTimers());

describe('jezykNaStart', () => {
  it('odczyt udany: bez języka zapasowego', async () => {
    const zapasowy = jest.fn();
    await jezykNaStart(async () => undefined, zapasowy);
    expect(zapasowy).not.toHaveBeenCalled();
  });

  it('odczyt rzuca: język zapasowy, bez wyjątku', async () => {
    const zapasowy = jest.fn();
    await expect(jezykNaStart(async () => { throw new Error('zapis'); }, zapasowy)).resolves.toBeUndefined();
    expect(zapasowy).toHaveBeenCalledTimes(1);
  });

  it('odczyt wisi: po limicie język zapasowy; tuż przed limitem jeszcze nie', async () => {
    jest.useFakeTimers();
    const zapasowy = jest.fn();
    let koniec = false;
    const p = jezykNaStart(() => new Promise<void>(() => undefined), zapasowy).then(() => { koniec = true; });
    await jest.advanceTimersByTimeAsync(JEZYK_START_LIMIT_MS - 1);
    expect(koniec).toBe(false);
    expect(zapasowy).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(1);
    await p;
    expect(zapasowy).toHaveBeenCalledTimes(1);
  });

  it('odczyt rzuca po limicie: bez nieobsłużonego odrzucenia', async () => {
    jest.useFakeTimers();
    const odrzucenia = jest.fn();
    process.on('unhandledRejection', odrzucenia);
    let odrzuc!: (e: Error) => void;
    const p = jezykNaStart(() => new Promise<void>((_r, rej) => { odrzuc = rej; }), jest.fn(), 10);
    await jest.advanceTimersByTimeAsync(10);
    await p;
    odrzuc(new Error('późno'));
    jest.useRealTimers();
    await new Promise((r) => setImmediate(r));
    process.off('unhandledRejection', odrzucenia);
    expect(odrzucenia).not.toHaveBeenCalled();
  });
});

/**
 * W-fix2, 04-studio-projektowe-018: jedna akcja wstrzymana przez ekran Pro na proces; wznowienie wykonuje ją raz,
 * porzucenie ją kasuje, nowsza zastępuje starszą (czysta logika modułu, ekrany: src/__tests__/pro-wznowienie-w2.test.tsx).
 */
import { porzucAkcje, wstrzymajAkcje, wznowAkcje } from '../platnosci/wstrzymana';

describe('018: wstrzymana akcja', () => {
  afterEach(() => porzucAkcje());

  it('wznowAkcje wykonuje akcję raz', () => {
    const a = jest.fn();
    wstrzymajAkcje(a);
    wznowAkcje();
    wznowAkcje();
    expect(a).toHaveBeenCalledTimes(1);
  });

  it('porzucAkcje: wznowienie niczego nie wykonuje', () => {
    const a = jest.fn();
    wstrzymajAkcje(a);
    porzucAkcje();
    wznowAkcje();
    expect(a).not.toHaveBeenCalled();
  });

  it('nowsza akcja zastępuje starszą', () => {
    const a = jest.fn();
    const b = jest.fn();
    wstrzymajAkcje(a);
    wstrzymajAkcje(b);
    wznowAkcje();
    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalledTimes(1);
  });
});

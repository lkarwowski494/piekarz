/**
 * Odłożona prośba o ocenę (D-089, reaudyt N-12 wariant c): znacznik w pamięci, wykonanie najwyżej raz,
 * warunek D-067 sprawdza dopiero poprosOOceneJesliWarto [reaudit-noc N-12]. Przez ekran:
 * src/__tests__/prosba-o-ocene-po-doktorze-n12.test.tsx.
 */
jest.mock('../prosba-o-ocene-wywolanie', () => ({ poprosOOceneJesliWarto: jest.fn(async () => undefined) }));

import { poprosOOceneJesliWarto } from '../prosba-o-ocene-wywolanie';
import { odlozProsbeOOcene, czyProsbaOOceneOdlozona, wykonajOdlozonaProsbeOOcene } from '../prosba-o-ocene-odlozona';

const prosba = poprosOOceneJesliWarto as jest.MockedFunction<typeof poprosOOceneJesliWarto>;

describe('prośba o ocenę odłożona przy propozycji Doktora (D-089)', () => {
  beforeEach(() => {
    wykonajOdlozonaProsbeOOcene();
    prosba.mockClear();
  });

  it('bez odłożenia wykonanie nic nie robi', () => {
    expect(czyProsbaOOceneOdlozona()).toBe(false);
    wykonajOdlozonaProsbeOOcene();
    expect(prosba).not.toHaveBeenCalled();
  });

  it('odłożona prośba czeka, a wykonanie woła opakowanie z warunkiem D-067 dokładnie raz', () => {
    odlozProsbeOOcene();
    expect(czyProsbaOOceneOdlozona()).toBe(true);
    expect(prosba).not.toHaveBeenCalled();
    wykonajOdlozonaProsbeOOcene();
    wykonajOdlozonaProsbeOOcene();
    expect(prosba).toHaveBeenCalledTimes(1);
    expect(czyProsbaOOceneOdlozona()).toBe(false);
  });

  it('dwa odłożenia przed wykonaniem dają jedną prośbę', () => {
    odlozProsbeOOcene();
    odlozProsbeOOcene();
    wykonajOdlozonaProsbeOOcene();
    expect(prosba).toHaveBeenCalledTimes(1);
  });
});

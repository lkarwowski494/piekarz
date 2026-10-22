/**
 * Prośba o ocenę odłożona przy propozycji Doktora (D-089, wariant c reaudytu N-12; zmienia D-067) [reaudit-noc N-12].
 * Po zakończeniu wypieku z oceną ≤ 2★ aplikacja proponuje Doktora; systemowa prośba o ocenę nie pojawia się w tej
 * samej chwili, tylko po zamknięciu propozycji („Nie teraz”), po zamknięciu Doktora albo przy następnym wejściu na
 * „Dziś” — co nastąpi pierwsze. Warunek prośby (3 wypieki, 14 dni, 3/365) sprawdza dopiero poprosOOceneJesliWarto,
 * więc odłożenie zmienia tylko moment, nie warunek. Znacznik w pamięci procesu: zamknięcie aplikacji go kasuje
 * (prośba przepada dla tego wypieku; przy wątpliwości nie prosimy).
 */
import { poprosOOceneJesliWarto } from './prosba-o-ocene-wywolanie';

let odlozona = false;

/** Zakończenie wypieku z propozycją Doktora: prośba czeka na zamknięcie Doktora albo wejście na „Dziś”. */
export function odlozProsbeOOcene(): void {
  odlozona = true;
}

/** Czy czeka odłożona prośba. */
export function czyProsbaOOceneOdlozona(): boolean {
  return odlozona;
}

/** Zamknięcie propozycji lub Doktora albo wejście na „Dziś”: wykonuje odłożoną prośbę raz (bez niej nic nie robi). */
export function wykonajOdlozonaProsbeOOcene(): void {
  if (!odlozona) return;
  odlozona = false;
  void poprosOOceneJesliWarto();
}

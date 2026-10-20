/**
 * Treść wiadomości do autora (BR-OPIN-003, DEC-13 a) [M1-audytor-generalny-083; 11-wzrost-005].
 * Specyfikacja: docs/wzrost/petla-opinii.md §2.3; wektory: docs/wzrost/wektory-kontakt.json.
 * Bez importów z React Native.
 */
import { t } from './i18n';

export interface DaneZgloszenia {
  wersja: string | null;
  build: string | null;
  systemIos: string | null;
  model: string | null;
  jezyk: 'pl' | 'en';
}

/**
 * Temat i treść do systemowego okna poczty. Tylko wersje aplikacji i systemu oraz model telefonu, gdy
 * znany: bez receptur, notatek, historii, identyfikatorów i adresów (użytkownik widzi całość przed wysłaniem).
 * Teksty idą przez t(), więc `jezyk` to język aplikacji w chwili wywołania (wołający podaje lang()).
 */
export function trescZgloszenia(d: DaneZgloszenia): { temat: string; tresc: string } {
  const nieznana = t('nieznana');
  const temat = `Piekarz (Crust)${d.wersja ? ` ${d.wersja}` : ''} — ${t('wiadomość do autora')}`;
  const wersja = `${d.wersja ?? nieznana}${d.build ? ` (${d.build})` : ''}`;
  const linie = [
    t('Wersja aplikacji: {wersja}', { wersja }),
    `iOS: ${d.systemIos ?? nieznana}`,
    ...(d.model ? [t('Telefon: {model}', { model: d.model })] : []),
  ];
  const tresc = `${t('Opisz, co się stało albo co chcesz nam przekazać:')}\n\n\n---\n${linie.join('\n')}\n`;
  return { temat, tresc };
}

/** Adres e-mail, nie znacznik [DO USTALENIA…] (petla-opinii.md §2.2). */
export function czyAdresWsparcia(adres: string): boolean {
  return /^[^\s@[\]]+@[^\s@[\]]+\.[a-z]{2,}$/i.test(adres);
}

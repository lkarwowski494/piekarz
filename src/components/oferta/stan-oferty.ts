// ============================================================================
// Piekarz — stan ekranu zakupu i teksty zależne od planu (design-spec §11e 127) [M1-audytor-generalny-127;
// 04-studio-projektowe-502; 02-monetyzacja-506]. Kwoty tylko z displayPrice sklepu, okres w kluczu (nigdy parametr),
// dosłowne t() dla skanu słownika (check:i18n).
// ============================================================================

import { t } from '../../lib/i18n';
import type { Plan } from '../../lib/platnosci/konfiguracja';
import type { Oferta } from '../../lib/platnosci/sklep';

export type StanOferty = 'ladowanie' | 'oferta-proba' | 'zakup-bez-proby' | 'bez-sieci' | 'niedostepna';

/** Kolejność opcji jak w makiecie oferta.html: rocznie, miesięcznie, na zawsze. */
export const PLANY_OFERTY: readonly Plan[] = ['yearly', 'monthly', 'lifetime'];

/**
 * null = odczyt sklepu jeszcze trwa; błąd odczytu = bez sieci (§11e 127, tabela stanów); pusta lista bez błędu = sklep
 * odpowiedział bez produktów, oferta chwilowo niedostępna, nie brak internetu [audyt-niezalezny A-3].
 */
export function stanOferty(oferta: readonly Oferta[] | null, blad: boolean): StanOferty {
  if (blad) return 'bez-sieci';
  if (oferta === null) return 'ladowanie';
  if (oferta.length === 0) return 'niedostepna';
  return oferta.some((o) => (o.probaDni ?? 0) > 0) ? 'oferta-proba' : 'zakup-bez-proby';
}

/** Nazwa opcji planu. */
export function nazwaPlanu(plan: Plan): string {
  if (plan === 'yearly') return t('Roczny');
  if (plan === 'monthly') return t('Miesięczny');
  return t('Dożywotni');
}

/** Kwota do pobrania z okresem; „po próbie” tylko, gdy ten plan ma ofertę wprowadzającą. */
export function cenaPlanu(o: Oferta): string {
  const cena = o.cena;
  const proba = (o.probaDni ?? 0) > 0;
  if (o.plan === 'yearly') return proba ? t('{cena} rocznie po próbie', { cena }) : t('{cena} rocznie', { cena });
  if (o.plan === 'monthly') return proba ? t('{cena} miesięcznie po próbie', { cena }) : t('{cena} miesięcznie', { cena });
  return t('{cena} jednorazowo', { cena });
}

/** Przycisk główny według wybranego planu (słownik akcji §5). */
export function napisPrzycisku(o: Oferta | undefined, plan: Plan): string {
  if (plan === 'lifetime') return t('Kup dostęp dożywotni');
  if ((o?.probaDni ?? 0) > 0) return t('Zacznij okres próbny');
  return plan === 'yearly' ? t('Kup plan roczny') : t('Kup plan miesięczny');
}

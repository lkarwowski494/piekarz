// ============================================================================
// Piekarz — format czasu trwania (design-spec §11c „116”): jedna funkcja dla planu, kroków prowadzenia
// i eksportu planu. Tekst „{h} h {m} min” / „{m} min” / „{h} h”: minuty zaokrąglone do pełnych, bez ułamków godzin
// i bez dni, cała wartość połączona spacjami niełamiącymi (U+00A0, w kluczach i18n). Etykieta VoiceOver w pełnych
// słowach z formami liczby („35 godzin 40 minut”, czasSlownie). [M1-audytor-generalny-116; 04-studio-projektowe-034]
// ============================================================================

import { t } from './i18n';
import { czasSlownie } from './spirala-etykieta';

export interface CzasTrwania {
  /** Tekst na ekranie: „35 h 40 min”, „30 min”, „4 h”. */
  tekst: string;
  /** Etykieta VoiceOver: „35 godzin 40 minut” / “35 hours 40 minutes”. */
  etykieta: string;
}

/** Czas trwania w minutach (zaokrąglony do pełnych minut) jako tekst i etykieta. */
export function czasTrwania(minuty: number): CzasTrwania {
  const min = Math.max(0, Math.round(minuty));
  const h = Math.floor(min / 60);
  const m = min % 60;
  let tekst: string;
  if (h > 0 && m > 0) tekst = t('{h} h {m} min', { h, m });
  else if (h > 0) tekst = t('{h} h', { h });
  else tekst = t('{n} min', { n: m });
  return { tekst, etykieta: czasSlownie(min) };
}

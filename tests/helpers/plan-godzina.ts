/**
 * Ustawienie godziny „gotowe” na ekranie planu tak jak użytkownik: przyciski „-30 min” / „+30 min” obok pola
 * „Kiedy chleb ma być gotowy?” (układ `plan-sen`, chipy godziny usunięte w 128) [M1-audytor-generalny-128].
 * Godzina odczytana z pola `plan-pole-gotowosci` (format PL „HH:MM”); cel w pełnych 30 minutach względem pola.
 */
import { act } from 'react-test-renderer';
import type { ReactTestInstance } from 'react-test-renderer';

function tekst(n: unknown): string {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (!n || typeof n !== 'object') return '';
  if (Array.isArray(n)) return n.map(tekst).join('');
  const o = n as { children?: unknown; props?: { children?: unknown } };
  if (o.children) return tekst(o.children);
  if (o.props?.children) return tekst(o.props.children);
  return '';
}

function przycisk(root: ReactTestInstance, etykieta: string): ReactTestInstance {
  const p = root.findAll((n) => typeof n.props?.onPress === 'function' && tekst(n.props.children).trim() === etykieta)[0];
  if (!p) throw new Error(`brak przycisku „${etykieta}”`);
  return p;
}

/** Minuty od północy z pola godziny planu. */
export function godzinaPola(root: ReactTestInstance): number {
  const m = tekst(root.findByProps({ testID: 'plan-pole-gotowosci' })).match(/(\d{1,2}):(\d{2})/);
  if (!m) throw new Error('pole godziny bez „HH:MM”');
  return Number(m[1]) * 60 + Number(m[2]);
}

/** Dzień („Dziś” | „Jutro” | „Pojutrze”) i godzina celu przyciskami ekranu. */
export async function ustawGodzinePlanu(root: ReactTestInstance, dzien: 'Dziś' | 'Jutro' | 'Pojutrze', h: number, min = 0): Promise<void> {
  await act(async () => {
    przycisk(root, dzien).props.onPress();
  });
  // ±30 min idzie do pełnej albo połówkowej godziny i zawija w obrębie doby (dzień wybiera przycisk dnia)
  const cel = h * 60 + min;
  for (let i = 0; godzinaPola(root) !== cel; i++) {
    if (i > 48) throw new Error(`nie da się ustawić ${h}:${min} przyciskami ±30 min`);
    const krok = cel > godzinaPola(root) ? '+30 min' : '-30 min';
    await act(async () => {
      przycisk(root, krok).props.onPress();
    });
  }
}

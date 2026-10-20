/**
 * Linie sekcji `## <początek nagłówka>…` z pliku docs/tresci (bez znacznika [T:…] i myślnika listy) oraz przekład EN
 * przez słownik aplikacji — do porównań „tekst dosłownie z treści roli 06” [M1-audytor-generalny-104].
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { setLang, t } from '../../../lib/i18n';

const ROOT = join(__dirname, '..', '..', '..', '..');

export function linie(plik: string, poczatek: string): string[] {
  const tekst = readFileSync(join(ROOT, 'docs', 'tresci', plik), 'utf8').replace(/\r\n/g, '\n');
  const trafienie = tekst.split(/^## /m).find((c) => c.split('\n')[0].startsWith(poczatek));
  if (!trafienie) throw new Error(`Brak sekcji ${poczatek} w ${plik}`);
  return trafienie
    .split('\n')
    .slice(1)
    .map((l) => l.replace(/\s*\[T:[A-Z0-9,-]+\]\s*$/, '').replace(/^- /, '').trim())
    .filter((l) => l.length > 0 && !l.startsWith('<!--'));
}

export function poAngielsku(pl: readonly string[]): string[] {
  setLang('en');
  try {
    return pl.map((x) => t(x));
  } finally {
    setLang('pl');
  }
}

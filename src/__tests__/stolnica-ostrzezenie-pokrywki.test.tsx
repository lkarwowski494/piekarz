/**
 * M1-audytor-generalny-086 (01-odkrywanie-019; RD-23-W1): w Stolnicy krok zdjęcia pokrywki (baner
 * steam-gate-alert po fazie 1) pokazuje ostrzeżenie BEZ-OPA-001..003 dosłownie z docs/tresci, PL i EN.
 */
import React from 'react';
import { readFileSync } from 'fs';
import { join } from 'path';
import renderer, { act } from 'react-test-renderer';
import { DutchOvenController } from '../components/stolnica/DutchOvenController';
import { setLang } from '../lib/i18n';

const ROOT = join(__dirname, '..', '..');

function sekcja(plik: string, poczatek: string): string {
  const tekst = readFileSync(join(ROOT, 'docs', 'tresci', plik), 'utf8').replace(/\r\n/g, '\n');
  const trafienie = tekst.split(/^## /m).find((c) => c.split('\n')[0].startsWith(poczatek));
  if (!trafienie) throw new Error(`Brak sekcji ${poczatek} w ${plik}`);
  return trafienie.split('\n').slice(1).join(' ').replace(/\s*\[T:[A-Z0-9,-]+\]\s*/g, ' ').trim();
}

function tekst(n: renderer.ReactTestInstance | string): string {
  if (typeof n === 'string') return n;
  return n.children.map(tekst).join('');
}

function ostrzezenia(lang: 'pl' | 'en', faza: 'lid_on' | 'lid_off', zakonczona: boolean) {
  setLang(lang);
  let tree: renderer.ReactTestRenderer | undefined;
  act(() => {
    tree = renderer.create(
      <DutchOvenController
        dutchOvenPhase={faza}
        onSwitchPhase={() => undefined}
        unitSystem="metric"
        isCompleted={zakonczona}
        onStartPhase2AfterSteamAlert={() => undefined}
      />
    );
  });
  const baner = tree!.root.findAll((n) => n.props.testID === 'steam-gate-alert' && typeof n.type !== 'string');
  const wynik = tree!.root
    .findAll((n) => n.props.testID === 'steam-gate-safety-warning' && typeof n.type !== 'string')
    .map((n) => ({ tekst: tekst(n), rola: n.props.accessibilityRole, wBanerze: baner.some((b) => b.findAll((x) => x === n).length > 0) }));
  act(() => tree!.unmount());
  return wynik;
}

describe('086: ostrzeżenie przy zdjęciu pokrywki w Stolnicy', () => {
  afterEach(() => setLang('pl'));

  it('PL: baner zdjęcia pokrywki pokazuje ostrzeżenie BEZ-OPA jako alert', () => {
    expect(ostrzezenia('pl', 'lid_on', true)).toEqual([
      { tekst: sekcja('pl/wypiek-bezpieczenstwo.md', 'krok zdjęcia pokrywki'), rola: 'alert', wBanerze: true },
    ]);
  });

  it('EN: baner zdjęcia pokrywki pokazuje ostrzeżenie BEZ-OPA jako alert', () => {
    expect(ostrzezenia('en', 'lid_on', true)).toEqual([
      { tekst: sekcja('en/wypiek-bezpieczenstwo.md', 'lid removal step'), rola: 'alert', wBanerze: true },
    ]);
  });

  it('bez banera (faza 1 trwa) nie ma ostrzeżenia o pokrywce', () => {
    expect(ostrzezenia('pl', 'lid_on', false)).toEqual([]);
  });
});

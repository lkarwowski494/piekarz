/**
 * Werdykt bezpieczeństwa zakwasu w każdym obsługiwanym języku jest w tym języku
 * [M1-audytor-generalny-046; 09-lokalizacja-002]. Tytuł, działanie i zdanie granicy
 * dosłownie z docs/tresci/<język>/zakwas-bezpieczenstwo.md (bez znacznika [T:...]).
 */
import fs from 'fs';
import path from 'path';
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { StarterSafetyCard } from '../src/components/zakwas/StarterSafetyCard';
import { evaluateSourdoughSafety } from '../src/core/sourdough-physics';
import { ACTIVE_LANGS, setLang, Lang } from '../src/lib/i18n';
import { EN } from '../src/lib/i18n.en';

type Status = 'discard' | 'hooch' | 'no_observation';
const OBSERVATIONS: Record<Status, Parameters<typeof evaluateSourdoughSafety>[0]> = {
  discard: { hasFuzzySpots: true },
  hooch: { hasHoochLiquid: true },
  no_observation: {},
};

/** Sekcje pliku treści: nagłówek „## pole …” → zdania bez [T:...] złączone spacją. */
function sections(lang: string): Record<string, string> {
  const file = path.resolve(__dirname, '..', 'docs', 'tresci', lang, 'zakwas-bezpieczenstwo.md');
  const out: Record<string, string> = {};
  let key = '';
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const h = line.match(/^## (\S+)/);
    if (h) {
      key = h[1];
      out[key] = '';
    } else if (key && line.trim() && !line.startsWith('<!--')) {
      const s = line.replace(/\s*\[T:[^\]]*\]\s*$/, '').trim();
      out[key] = out[key] ? `${out[key]} ${s}` : s;
    }
  }
  return out;
}

const textOf = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(textOf).join('');
  if (n && typeof n === 'object' && 'children' in n) return textOf((n as { children: unknown }).children);
  return '';
};

function renderCard(status: Status) {
  const result = evaluateSourdoughSafety(OBSERVATIONS[status]);
  expect(result.status).toBe(status);
  const noop = () => undefined;
  let tree: renderer.ReactTestRenderer | null = null;
  act(() => {
    tree = renderer.create(
      <StarterSafetyCard
        hasHooch={false} onToggleHooch={noop} hasKahm={false} onToggleKahm={noop} hasMold={false}
        onToggleMold={noop} hasColoredSpots={false} onToggleColoredSpots={noop} hasRottenSmell={false}
        onToggleRottenSmell={noop} safetyResult={result} onReset={noop}
      />
    );
  });
  const root = tree!.root;
  const box = root.findByProps({ testID: `starter-safety-${status}` });
  const [title, action] = box.findAllByType('Text' as never).map((n) => textOf(n.props.children));
  const boundary = textOf(root.findByProps({ testID: 'starter-safety-boundary' }).props.children);
  act(() => tree!.unmount());
  return { title, action, boundary };
}

const PL = sections('pl');
const STATUSES: Status[] = ['discard', 'hooch', 'no_observation'];
const OTHER_LANGS = ACTIVE_LANGS.filter((l): l is Exclude<Lang, 'pl'> => l !== 'pl');

describe('Werdykt bezpieczeństwa zakwasu w każdym aktywnym języku (046)', () => {
  afterEach(() => setLang('pl'));

  it('są języki do sprawdzenia poza PL', () => {
    expect(OTHER_LANGS.length).toBeGreaterThan(0);
  });

  it('PL: teksty karty równe docs/tresci/pl', () => {
    setLang('pl');
    for (const status of STATUSES) {
      const card = renderCard(status);
      expect(card).toEqual({
        title: PL[`wynik.${status}.titlePl`],
        action: PL[`wynik.${status}.actionPl`],
        boundary: PL['card.granica'],
      });
    }
  });

  // Działanie przy samym płynie (wynik.hooch.actionPl) bez „Według CSU Extension” (M3 T2, D-123) przetłumaczone w a5d
  // (wpięte 2026-10-29); wyjątek „T2 / a5d” usunięty — wszystkie statusy jak niżej.
  for (const lang of OTHER_LANGS) {
    const DOC = sections(lang);
    for (const status of STATUSES) {
      it(`${lang}: ${status} — tytuł, działanie i granica przetłumaczone i równe docs/tresci/${lang}`, () => {
        setLang(lang);
        const card = renderCard(status);
        expect(card.title).not.toBe(PL[`wynik.${status}.titlePl`]);
        expect(card.action).not.toBe(PL[`wynik.${status}.actionPl`]);
        expect(card.boundary).not.toBe(PL['card.granica']);
        expect(card).toEqual({
          title: DOC[`wynik.${status}.titlePl`],
          action: DOC[`wynik.${status}.actionPl`],
          boundary: DOC['card.granica'],
        });
      });
    }
  }
});

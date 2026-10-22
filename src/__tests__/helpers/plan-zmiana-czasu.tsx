/**
 * Wspólny opis testów planu w dniu wiosennej zmiany czasu (D-13, D-093) [M3 D0]: 02:30 w tym dniu nie istnieje, plan i
 * powiadomienia kończą się o 03:30, więc karta „Kiedy chleb ma być gotowy?” pokazuje faktyczną godzinę gotowości z
 * planu (03:30) i krótki komunikat, że w tym dniu zmienia się czas. Jedna strefa na plik testowy: formatTime
 * (src/lib/format.ts) trzyma Intl.DateTimeFormat w pamięci podręcznej, a ta zapamiętuje strefę z chwili utworzenia.
 * Mocki (expo-router, safe-area) wołają pliki testowe, bo jest.mock działa tylko w pliku, w którym stoi.
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import HarmonogramScreen from '../../../app/(tabs)/receptury/harmonogram';
import { setActiveBake, initDatabase } from '../../data/sqlite-store';
import { setLang, t } from '../../lib/i18n';
import { formatTime } from '../../lib/format';
import { zUprawnieniem } from '../../../tests/helpers/platnosci';
import { wStrefie } from '../../core/__tests__/helpers/strefa';

function tekst(n: any): string {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (!n) return '';
  if (Array.isArray(n)) return n.map(tekst).join('');
  if (n.children) return tekst(n.children);
  if (n.props?.children) return tekst(n.props.children);
  return '';
}

const KOMUNIKAT = 'W tym dniu zmienia się czas, a wybranej godziny nie ma. Chleb będzie gotowy o {godzina}.';

/** Data ścienna [rok, miesiąc 1–12, dzień, godzina] w strefie testu. */
export type DataScienna = readonly [number, number, number, number];

/**
 * Chwile „teraz” podaje się jako datę ścienną, nie jako Date: Date liczony przy ładowaniu pliku (zbieranie testów)
 * powstaje w strefie procesu sprzed beforeAll z wStrefie, więc np. przy TZ=Pacific/Auckland „12.03 14:00” to
 * w Nowym Jorku 11.03 i dzień docelowy nie jest dniem zmiany czasu (CI Tests across Timezones, 2026-10-22).
 * Date powstaje dopiero w teście, już w strefie z wStrefie.
 * @param dzisiaj „teraz” dwa dni przed dniem zmiany czasu (14:00); dzień docelowy to „Pojutrze”
 * @param zwykly „teraz” dwa dni przed zwykłym dniem
 */
export function opiszPlanWDniuZmianyCzasu(strefa: string, dzisiajSciana: DataScienna, zwyklySciana: DataScienna): void {
  describe(`plan w dniu zmiany czasu, ${strefa} (D-13)`, () => {
    wStrefie(strefa);
    const naDate = ([r, m, d, g]: DataScienna) => new Date(r, m - 1, d, g, 0, 0, 0);
    let dzisiaj = new Date(NaN);
    let zwykly = new Date(NaN);
    beforeAll(() => {
      dzisiaj = naDate(dzisiajSciana);
      zwykly = naDate(zwyklySciana);
    });
    let tree: renderer.ReactTestRenderer | null = null;
    const pole = () => tekst(tree!.root.findByProps({ testID: 'plan-pole-gotowosci' }).props.children);

    async function otworz(teraz: Date) {
      jest.useFakeTimers({ now: teraz, doNotFake: ['nextTick', 'setImmediate', 'queueMicrotask'] });
      zUprawnieniem();
      setActiveBake(null);
      await initDatabase();
      await act(async () => {
        tree = renderer.create(<HarmonogramScreen />);
        await Promise.resolve();
      });
    }

    /**
     * Plan trwa ponad dobę, więc od 14:00 dwa dni przed dniem docelowym domyślna godzina ustępuje najwcześniejszej, którą
     * wylicza planista (zależnie od nocy). Test czyta pokazaną godzinę dnia „Pojutrze” (= dzień docelowy) i przyciskami
     * „-30 min” / „+30 min” dochodzi do 02:30.
     */
    async function ustaw0230() {
      expect(pole()).toMatch(/Pojutrze|Day after tomorrow/);
      const m = /(\d{1,2}):(\d{2})\s?(AM|PM)?$/.exec(pole());
      expect(m).not.toBeNull();
      const [, g, min, ampm] = m!;
      const godz = ampm ? (Number(g) % 12) + (ampm === 'PM' ? 12 : 0) : Number(g);
      const kroki = (godz * 60 + Number(min) - 150) / 30;
      for (let i = 0; i < Math.abs(kroki); i++) {
        const etykieta = kroki > 0 ? '-30 min' : '+30 min';
        const p = tree!.root.findAll((n) => typeof n.props?.onPress === 'function' && tekst(n.props.children) === etykieta)[0];
        await act(async () => {
          p.props.onPress();
          await Promise.resolve();
        });
      }
    }

    const godzinaGotowosci = (od: Date, h: number, min: number) => formatTime(new Date(od.getFullYear(), od.getMonth(), od.getDate() + 2, h, min));

    afterEach(() => {
      if (tree) act(() => tree?.unmount());
      tree = null;
      setLang('pl');
      jest.useRealTimers();
    });

    it('wybrane 02:30 w dniu docelowym (dzień zmiany czasu): karta pokazuje faktyczne 03:30 i komunikat, nie „02:30”', async () => {
      await otworz(dzisiaj);
      await ustaw0230();
      expect(pole()).toContain(godzinaGotowosci(dzisiaj, 3, 30));
      expect(pole()).not.toContain(formatTime(new Date(2000, 0, 1, 2, 30)));
      expect(tekst(tree!.toJSON())).toContain(t(KOMUNIKAT, { godzina: godzinaGotowosci(dzisiaj, 3, 30) }));
    });

    it('zwykły dzień, 02:30: godzina tak jak wybrana, bez komunikatu', async () => {
      await otworz(zwykly);
      await ustaw0230();
      expect(pole()).toContain(formatTime(new Date(2000, 0, 1, 2, 30)));
      expect(tekst(tree!.toJSON())).not.toContain('W tym dniu zmienia się czas');
    });

    it('en: komunikat po angielsku z faktyczną godziną', async () => {
      setLang('en');
      await otworz(dzisiaj);
      await ustaw0230();
      expect(tekst(tree!.toJSON())).toContain(
        `The clocks change that day and the time you picked does not exist. The bread will be ready at ${godzinaGotowosci(dzisiaj, 3, 30)}.`,
      );
    });
  });
}

/**
 * D-392 (sesja U, zrzuty #6, ramka 05 na 6,3″): tytuł karty z długim znacznikiem nie łamie się wewnątrz słowa.
 * Na urządzeniu „Szczyt aktywności” łamał się „Szcz/yt/akty/wnoś/ci”, bo znacznik „6 godzin 6 minut od dokarmienia”
 * zabierał szerokość rzędu, a tytuł (`flex: 1`) dostawał resztę. Układ liczy Yoga, silnik układu React Native
 * (`tests/uklad-yoga.ts`), na stylach z prawdziwego komponentu; 35 języków, 320 / 393 / 440 pt, fontScale 1 i AX5.
 * Ten sam wzorzec tytuł + znacznik w rzędzie: nagłówek fazy w `DutchOvenController` (znacznik temperatury).
 */
import React from 'react';
import { Text, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { StarterPeakActivityCard } from '../components/zakwas/StarterPeakActivityCard';
import { DutchOvenController } from '../components/stolnica/DutchOvenController';
import { Karta } from '../ui/karty/Karta';
import { calculateStarterPhase } from '../core/sourdough-physics';
import { predictStarterPeak } from '../core/starter-peak-predictor';
import { ACTIVE_LANGS, setLang, type Lang } from '../lib/i18n';
import { najdluzszeSlowo, uklad, type Pudelko } from '../../tests/uklad-yoga';

const mockOkno = { width: 393, height: 852, scale: 3, fontScale: 1 };
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockOkno }));

const T0 = 1_800_000_000_000;
/** AX5: treść 17 → 53 pt (HIG; podłogi dostępności roli 04). */
const AX5 = 53 / 17;
/** Margines ekranu Zakwasy (theme.spacing.md = 16 z każdej strony, app/(tabs)/zakwasy/index.tsx). */
const MARGINES = 16;
const SZEROKOSCI = [320, 393, 440] as const;

function drzewo(el: React.ReactElement, szer: number) {
  let tree!: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(<View style={{ width: szer - 2 * MARGINES }}>{el}</View>);
  });
  const json = tree.toJSON();
  act(() => tree.unmount());
  if (!json || Array.isArray(json)) throw new Error('brak drzewa');
  return json;
}

/** Karta „Szczyt aktywności” jak w ramce 05: bez okna szczytu, 6 h 6 min od dokarmienia. */
const kartaSzczytu = () => (
  <StarterPeakActivityCard
    phaseResult={calculateStarterPhase(T0, 'ROOM_TEMP', T0 + 366 * 60_000)}
    peakPrediction={predictStarterPeak({ lastFedAt: T0, now: T0 + 366 * 60_000, ambientTempC: 22 } as Parameters<typeof predictStarterPeak>[0])}
    showPeakWindow={false}
    ambientTempC={22}
    onAmbientTempChange={() => undefined}
    unitSystem="metric"
  />
);

const wDwochRzedach = (a: Pudelko, b: Pudelko) => b.y >= a.y + a.h - 0.5;

/** Naruszenia układu nagłówka (`kartaId` = rząd nagłówka): tytuł węższy od najdłuższego słowa (gdy słowo mieści się
 * w wierszu z zapasem 64 pt na ikonę i odstępy), znacznik poza rzędem nagłówka. Położenie znacznika pod tytułem
 * sprawdza osobny przypadek (PL 393 pt). */
function naruszenia(m: Map<string, Pudelko>, tytulId: string, znacznikId: string, kartaId: string, opis: string): string[] {
  const tyt = m.get(tytulId), zn = m.get(znacznikId), karta = m.get(kartaId);
  if (!tyt?.tekst || !tyt.styl || !zn || !karta) return [`${opis}: brak elementu`];
  const out: string[] = [];
  const slowo = najdluzszeSlowo(tyt.tekst, tyt.styl);
  const prawaKarty = karta.x + karta.w;
  // Słowo szersze niż cała karta łamie się systemowo (README §7a); poza tym tytuł nie może być węższy od słowa
  if (slowo < karta.w - 64 && tyt.w + 0.5 < slowo) out.push(`${opis}: tytuł „${tyt.tekst}” ${Math.round(tyt.w)} pt < słowo ${Math.round(slowo)} pt`);
  if (zn.x + zn.w > prawaKarty + 0.5) out.push(`${opis}: znacznik wystaje poza kartę o ${Math.round(zn.x + zn.w - prawaKarty)} pt`);
  if (zn.x < karta.x - 0.5) out.push(`${opis}: znacznik przed kartą`);
  return out;
}

describe('D-392: tytuł karty i znacznik — tytuł nie łamie się wewnątrz słowa, znacznik schodzi pod tytuł', () => {
  afterAll(() => setLang('pl'));

  it.each([1, AX5])('„Szczyt aktywności” ze znacznikiem czasu: 35 języków × 320/393/440 pt, fontScale %f', async (fs) => {
    mockOkno.fontScale = fs;
    const bledy: string[] = [];
    for (const l of ACTIVE_LANGS as readonly Lang[]) {
      setLang(l);
      for (const w of SZEROKOSCI) {
        const m = await uklad(drzewo(kartaSzczytu(), w), w - 2 * MARGINES, fs);
        bledy.push(...naruszenia(m, 'karta-szczyt-tytul', 'karta-szczyt-znacznik', 'karta-szczyt-naglowek', `${l} ${w} pt`));
      }
    }
    expect(bledy).toEqual([]);
  });

  it('PL 393 pt (ramka 05, 6,3″): znacznik pod tytułem, tytuł w jednym wierszu', async () => {
    mockOkno.fontScale = 1;
    setLang('pl');
    const m = await uklad(drzewo(kartaSzczytu(), 393), 393 - 2 * MARGINES);
    const tyt = m.get('karta-szczyt-tytul')!, zn = m.get('karta-szczyt-znacznik')!;
    expect(wDwochRzedach(tyt, zn)).toBe(true);
    expect(tyt.h).toBeLessThan(tyt.styl!.fontSize * 1.2 * 1.5); // jeden wiersz
    expect(zn.x).toBeCloseTo(tyt.x, 0); // znacznik wyrównany do tytułu, nie do ikony
  });

  it('krótki znacznik (Pro) zostaje w rzędzie z tytułem', async () => {
    mockOkno.fontScale = 1;
    setLang('pl');
    const m = await uklad(drzewo(<Karta testID="k" tytul="Plan wypieku" znacznik={<Text>Pro</Text>} />, 393), 393 - 2 * MARGINES);
    const tyt = m.get('k-tytul')!, zn = m.get('k-znacznik')!;
    expect(wDwochRzedach(tyt, zn)).toBe(false);
    expect(zn.x).toBeGreaterThan(tyt.x + tyt.w - 1);
  });

  it.each([1, AX5])('DutchOvenController: nagłówek fazy ze znacznikiem temperatury, 35 języków × 320/393/440 pt, fontScale %f', async (fs) => {
    mockOkno.fontScale = fs;
    const bledy: string[] = [];
    for (const l of ACTIVE_LANGS as readonly Lang[]) {
      setLang(l);
      for (const faza of ['lid_on', 'lid_off'] as const) for (const w of SZEROKOSCI) {
        const el = <DutchOvenController dutchOvenPhase={faza} onSwitchPhase={() => undefined} unitSystem="metric" isCompleted={false} onStartPhase2AfterSteamAlert={() => undefined} />;
        const m = await uklad(drzewo(el, w), w - 2 * MARGINES, fs);
        bledy.push(...naruszenia(m, 'dutch-oven-faza-tytul', 'dutch-oven-faza-znacznik', 'dutch-oven-faza-naglowek', `${l} ${faza} ${w} pt`));
      }
    }
    expect(bledy).toEqual([]);
  });
});

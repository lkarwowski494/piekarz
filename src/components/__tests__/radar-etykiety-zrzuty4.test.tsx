/**
 * Radar smaku w Dzienniku: etykiety osi i wartości mieszczą się w obszarze wykresu (KO-048 P1, D-381).
 * Zrzuty #4 (ramka 06-dziennik): „ıcja”, „Spr”, „twartość”, „Kwasow” i oderwane „(4)”, bo etykiety SVG
 * z kotwicą start/end wychodziły poza płótno, a nazwa i wartość były osobnymi kawałkami tekstu.
 *
 * Model szerokości (bez pomiaru tekstu w Jest): szerokość napisu szacowana z góry — 0,62 em na znak
 * alfabetyczny (SF półgruby ma średnio ok. 0,55 em), 1 em na znak CJK/kana/hangul. Karta Dziennika:
 * ekran − 2 × `theme.spacing.md` (treść ekranu) − 2 × `odstepy.l` (wypełnienie karty) − 2 × 1 pt (obwódka).
 * Szerokości: 320 pt (iPhone SE, Powiększenie ekranu) i 440 pt (6,9″). Języki: pl i najdłuższy z 35 (it,
 * „Caramellizzazione”, 17 znaków; `docs/dowody-08-zrzuty4/radar-etykiety-35.txt`) oraz de (najdłuższe
 * słowo bez spacji wśród reszty) i ja (znaki pełnej szerokości).
 */
import React from 'react';
import renderer, { act, type ReactTestInstance } from 'react-test-renderer';
import { StyleSheet, Text } from 'react-native';
import { Svg, Text as SvgText } from 'react-native-svg';
import { setLang, t, type Lang } from '../../lib/i18n';
import { theme } from '../../ui/theme';
import { odstepy } from '../../ui/tokeny';
import { SensoryRadarChart, BREAD_SENSORY_AXES, type BreadSensoryProfile } from '../SensoryRadarChart';

let mockOkno = { width: 320, height: 568, scale: 2, fontScale: 1 };
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockOkno }));

const PROFIL: BreadSensoryProfile = { crustCrispness: 4, crumbElasticity: 4, acidity: 3, openCrumb: 3, caramelization: 4 };
const ROZMIAR_DZIENNIK = 170; // BakeHistorySection: size={170}

const pelnaSzerokosc = (z: string): boolean => /[　-鿿가-힯＀-￯]/.test(z);
const szerokoscNapisu = (s: string, pt: number): number => [...s].reduce((suma, z) => suma + (pelnaSzerokosc(z) ? 1 : 0.62) * pt, 0);
const najdluzszeSlowo = (s: string, pt: number): number => Math.max(...s.split(/\s+/).map((w) => szerokoscNapisu(w, pt)));
const szerokoscKarty = (ekran: number): number => ekran - 2 * theme.spacing.md - 2 * odstepy.l - 2;

const tekstWezla = (n: ReactTestInstance): string => {
  const c: unknown = n.props.children;
  return Array.isArray(c) ? c.map(String).join('') : String(c);
};
const wSvg = (n: ReactTestInstance): boolean => {
  for (let p = n.parent; p; p = p.parent) if (p.type === Svg) return true;
  return false;
};

/** Najbliższy przodek, który ustala kierunek układu (wiersz: etykieta dzieli kartę z sąsiadką). */
const kierunekPrzodka = (n: ReactTestInstance): { flexDirection?: string; gap?: unknown; wezel?: ReactTestInstance } => {
  for (let p = n.parent; p; p = p.parent) {
    const s = StyleSheet.flatten(p.props.style) ?? {};
    if (s.flexDirection) return { flexDirection: s.flexDirection, gap: s.gap, wezel: p };
  }
  return {};
};

let drzewo: renderer.ReactTestRenderer | null = null;
afterEach(() => {
  act(() => drzewo?.unmount());
  drzewo = null;
  setLang('pl');
  mockOkno = { width: 320, height: 568, scale: 2, fontScale: 1 };
});

async function renderuj(): Promise<ReactTestInstance> {
  await act(async () => {
    drzewo = renderer.create(<SensoryRadarChart profile={PROFIL} size={ROZMIAR_DZIENNIK} showLabels testID="radar" />);
  });
  return drzewo!.root;
}

/** Węzeł, który wyświetla etykietę osi z wartością (SVG albo Text). */
function etykiety(root: ReactTestInstance): { os: string; oczekiwany: string; wezel: ReactTestInstance | undefined }[] {
  const kandydaci = [...root.findAllByType(SvgText), ...root.findAllByType(Text)];
  return BREAD_SENSORY_AXES.map((os) => {
    const oczekiwany = `${t(os.labelPl)} (${PROFIL[os.key]})`;
    return { os: os.key, oczekiwany, wezel: kandydaci.find((n) => tekstWezla(n) === oczekiwany) };
  });
}

describe.each([['pl'], ['it'], ['de'], ['ja']] as [Lang][])('radar smaku, język %s (KO-048 P1, D-381)', (jezyk) => {
  it.each([[320], [440]])('przy %i pt każda etykieta z wartością mieści się w obszarze wykresu i jest jednym napisem', async (ekran) => {
    setLang(jezyk);
    mockOkno = { ...mockOkno, width: ekran };
    const root = await renderuj();
    const bledy: string[] = [];
    for (const { os, oczekiwany, wezel } of etykiety(root)) {
      if (!wezel) { bledy.push(`${os}: brak „${oczekiwany}”`); continue; }
      // Jeden napis: kilka dzieci to kilka TSpan/kawałków; na iOS kotwica liczy się osobno dla każdego („(4)” oderwane).
      if (typeof wezel.props.children !== 'string') bledy.push(`${os}: nazwa i wartość w ${React.Children.count(wezel.props.children)} kawałkach`);
      if (wezel.type === SvgText || wSvg(wezel)) {
        const pt = Number(wezel.props.fontSize);
        const w = szerokoscNapisu(oczekiwany, pt);
        const x = Number(wezel.props.x);
        const lewo = wezel.props.textAnchor === 'start' ? x : wezel.props.textAnchor === 'end' ? x - w : x - w / 2;
        if (lewo < 0 || lewo + w > ROZMIAR_DZIENNIK) bledy.push(`${os}: SVG ${Math.round(lewo)}…${Math.round(lewo + w)} pt poza 0…${ROZMIAR_DZIENNIK}`);
        continue;
      }
      const styl = StyleSheet.flatten(wezel.props.style) ?? {};
      const pt = Number(styl.fontSize);
      if (!(pt >= 11)) bledy.push(`${os}: rozmiar ${pt} pt < 11 pt`);
      if (wezel.props.numberOfLines !== undefined) bledy.push(`${os}: limit linii ${wezel.props.numberOfLines}`);
      // Etykieta w wierszu dzieli kartę z sąsiadką; najdłuższe słowo musi zmieścić się w jej części (bez łamania w środku słowa).
      // Podział jak w Yoga przy flexShrink 1 i szerokości z treści: nadmiar odejmowany proporcjonalnie do szerokości treści.
      const rzad = kierunekPrzodka(wezel);
      let miejsce = szerokoscKarty(ekran);
      if (rzad.flexDirection === 'row') {
        const rodzenstwo = (rzad.wezel?.findAllByType(Text) ?? []).map((n) => szerokoscNapisu(tekstWezla(n), pt));
        const suma = rodzenstwo.reduce((a, b) => a + b, 0);
        const nadmiar = suma + Number(rzad.gap ?? 0) * (rodzenstwo.length - 1) - szerokoscKarty(ekran);
        const wlasna = szerokoscNapisu(oczekiwany, pt);
        miejsce = nadmiar > 0 ? wlasna - (nadmiar * wlasna) / suma : wlasna;
      }
      const slowo = najdluzszeSlowo(oczekiwany, pt);
      if (slowo > miejsce) bledy.push(`${os}: słowo ${Math.round(slowo)} pt > miejsce ${Math.round(miejsce)} pt`);
    }
    expect(bledy).toEqual([]);
  });
});

describe('radar smaku przy dużym tekście (fontScale ≥ 2, reguła duzyTekst, D-381)', () => {
  it('etykiety są pod wykresem, jedna pod drugą, w kolejności osi, bez limitu linii', async () => {
    mockOkno = { ...mockOkno, fontScale: 3.1 };
    const root = await renderuj();
    const svg = root.findByProps({ testID: 'bread-sensory-radar-svg' });
    const lista = root.findByProps({ testID: 'radar-etykiety-lista' });
    expect(lista.findAllByType(Svg)).toHaveLength(0);
    expect(StyleSheet.flatten(lista.props.style)?.flexDirection ?? 'column').toBe('column');
    const teksty = lista.findAllByType(Text).map(tekstWezla);
    expect(teksty).toEqual(BREAD_SENSORY_AXES.map((os) => `${t(os.labelPl)} (${PROFIL[os.key]})`));
    expect(lista.findAllByType(Text).every((n) => n.props.numberOfLines === undefined)).toBe(true);
    expect(svg.findAllByType(SvgText)).toHaveLength(0);
  });
});

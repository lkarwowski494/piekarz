/**
 * Przybliżony układ ekranu z drzewa react-test-renderer (Jest nie liczy layoutu): wysokości i położenia z tokenów
 * i stylów (padding, margin, gap, minHeight, kierunek, zawijanie), tekst łamany po słowach przy średniej szerokości
 * znaku. To rachunek, nie pomiar z urządzenia: służy testom „czy element mieści się w pierwszym ekranie” przy danej
 * szerokości i wysokości (M1-audytor-generalny-005). Zrzut z symulatora zostaje dowodem rozstrzygającym (E2E iOS).
 */
import { StyleSheet } from 'react-native';
import type { ReactTestInstance } from 'react-test-renderer';

type Wezel = ReactTestInstance;
type Styl = Record<string, unknown>;
export interface Ramka { y: number; h: number }

/** Średnia szerokość znaku jako ułamek rozmiaru kroju: SF Pro (treść) i Sofia Sans Semi Condensed (tytuły). */
const ZNAK_TRESC = 0.5;
const ZNAK_TYTUL = 0.44;
/** Wysokość wiersza jako ułamek rozmiaru kroju: treść (iOS: Body 17 → 22 pt) i tytuły (Sofia, ok. 1,2). */
const WIERSZ = 1.3;
const WIERSZ_TYTUL = 1.2;

const num = (v: unknown): number | undefined => (typeof v === 'number' ? v : undefined);
/** Nazwa hosta (`View`, `Text`, `RCTScrollView`, `Modal`); komponent złożony: pusty napis. */
const typ = (n: Wezel): string => (typeof n.type === 'string' ? n.type : '');
const styl = (n: Wezel): Styl => (StyleSheet.flatten(n.props?.style) ?? {}) as Styl;
const tekst = (n: Wezel | string): string => (typeof n === 'string' ? n : n.children.map(tekst).join(''));

/** Dzieci-hosty węzła (komponenty złożone są przezroczyste). */
export function dzieciHost(n: Wezel): Wezel[] {
  const wynik: Wezel[] = [];
  for (const c of n.children) {
    if (typeof c === 'string') continue;
    if (typeof c.type === 'string') wynik.push(c);
    else wynik.push(...dzieciHost(c));
  }
  return wynik;
}

const pominiety = (n: Wezel): boolean => typ(n) === 'Modal' || styl(n).position === 'absolute' || styl(n).display === 'none';

function bok(s: Styl, strona: 'Top' | 'Bottom' | 'Left' | 'Right', rodzaj: 'padding' | 'margin'): number {
  const os = strona === 'Top' || strona === 'Bottom' ? 'Vertical' : 'Horizontal';
  return num(s[`${rodzaj}${strona}`]) ?? num(s[`${rodzaj}${os}`]) ?? num(s[rodzaj]) ?? 0;
}

/** Liczba wierszy tekstu przy szerokości `w` (łamanie po słowach). */
function wiersze(t: string, rozmiar: number, znak: number, w: number): number {
  let suma = 0;
  for (const akapit of t.split('\n')) {
    let wiersz = 0;
    let n = 1;
    for (const slowo of akapit.split(/\s+/).filter(Boolean)) {
      const s = slowo.length * rozmiar * znak;
      const zSpacja = wiersz === 0 ? s : wiersz + rozmiar * znak + s;
      if (zSpacja <= w || wiersz === 0) wiersz = zSpacja;
      else { n += 1; wiersz = s; }
      while (wiersz > w) { n += 1; wiersz -= w; }
    }
    suma += n;
  }
  return suma;
}

const rozmiarTekstu = (s: Styl) => num(s.fontSize) ?? 14;
const znakTekstu = (s: Styl) => (typeof s.fontFamily === 'string' && /Sofia/.test(s.fontFamily) ? ZNAK_TYTUL : ZNAK_TRESC);

/** Naturalna szerokość tekstu w jednym wierszu (do rzędów bez flex). */
function szerokoscTekstu(n: Wezel): number {
  const s = styl(n);
  return tekst(n).length * rozmiarTekstu(s) * znakTekstu(s);
}

/**
 * Szerokość treści węzła w jednym wierszu (Yoga: element bez flex i bez szerokości ma rozmiar treści): tekst, wcięcia,
 * obwódka, dzieci obok siebie (rząd) albo najszersze (kolumna); co najmniej minWidth. Rola 04 p4b: przycisk pasa
 * („Plan wypieku”) w rzędzie nawigacji nie dzieli się już po równo z przyciskiem wstecz (zrzut web 320: 44 pt, nie 66).
 */
export function szerokoscTresci(n: Wezel): number {
  const s = styl(n);
  const stala = num(s.width) ?? num(n.props?.width);
  if (stala !== undefined) return stala;
  const wciecia = bok(s, 'Left', 'padding') + bok(s, 'Right', 'padding') + 2 * (num(s.borderWidth) ?? 0);
  let tresc: number;
  if (typ(n) === 'Text') tresc = szerokoscTekstu(n);
  else {
    const dzieci = dzieciHost(n).filter((d) => !pominiety(d));
    const miary = dzieci.map((d) => szerokoscTresci(d) + bok(styl(d), 'Left', 'margin') + bok(styl(d), 'Right', 'margin'));
    tresc = s.flexDirection === 'row'
      ? miary.reduce((a, m) => a + m, 0) + (num(s.columnGap) ?? num(s.gap) ?? 0) * Math.max(0, miary.length - 1)
      : Math.max(0, ...miary);
  }
  return Math.max(tresc + wciecia, num(s.minWidth) ?? 0);
}

/** Szerokość własna dziecka w rzędzie: podstawa (flexBasis, szerokość albo treść) i czy rośnie (flex, flexGrow). */
function szerokoscWRzedzie(n: Wezel): { podstawa: number; rosnie: boolean } {
  const s = styl(n);
  const stala = num(s.width) ?? num(n.props?.width);
  if (stala !== undefined) return { podstawa: stala + bok(s, 'Left', 'margin') + bok(s, 'Right', 'margin'), rosnie: false };
  const rosnie = (num(s.flex) ?? 0) > 0 || (num(s.flexGrow) ?? 0) > 0;
  if (num(s.flexBasis) !== undefined) return { podstawa: num(s.flexBasis)!, rosnie };
  // Yoga: podstawa flex (0) nie mniejsza niż minWidth — także przy łamaniu rzędu z zawijaniem (KO-017, D-336)
  if (rosnie) return { podstawa: num(s.minWidth) ?? 0, rosnie: true };
  return { podstawa: szerokoscTresci(n), rosnie: false };
}

/**
 * Układa węzeł od `y` przy szerokości `w` (z wcięciami węzła); zapisuje ramkę każdego hosta w `ramki`. Zwraca wysokość
 * z marginesami pionowymi węzła nieuwzględnionymi (dolicza je rodzic).
 */
function uloz(n: Wezel, y: number, w: number, ramki: Map<Wezel, Ramka>): number {
  const s = styl(n);
  const pt = bok(s, 'Top', 'padding');
  const pb = bok(s, 'Bottom', 'padding');
  const wew = Math.max(1, w - bok(s, 'Left', 'padding') - bok(s, 'Right', 'padding') - 2 * (num(s.borderWidth) ?? 0));
  let h: number;
  if (typ(n) === 'Text') {
    const rozmiar = rozmiarTekstu(s);
    const limit = n.props.adjustsFontSizeToFit ? 1 : num(n.props.numberOfLines);
    const ile = wiersze(tekst(n), rozmiar, znakTekstu(s), wew);
    h = pt + pb + Math.min(ile, limit ?? ile) * (num(s.lineHeight) ?? rozmiar * (znakTekstu(s) === ZNAK_TYTUL ? WIERSZ_TYTUL : WIERSZ));
  } else {
    const dzieci = dzieciHost(n).filter((d) => !pominiety(d));
    const wiersz = s.flexDirection === 'row';
    const gapW = num(s.rowGap) ?? num(s.gap) ?? 0;
    const gapK = num(s.columnGap) ?? num(s.gap) ?? 0;
    let kursor = y + pt;
    if (!wiersz) {
      dzieci.forEach((d, i) => {
        const ds = styl(d);
        if (i > 0) kursor += gapW;
        kursor += bok(ds, 'Top', 'margin');
        kursor += uloz(d, kursor, wew - bok(ds, 'Left', 'margin') - bok(ds, 'Right', 'margin'), ramki);
        kursor += bok(ds, 'Bottom', 'margin');
      });
    } else {
      // Rząd: linie (przy zawijaniu zachłannie po podstawach), reszta szerokości dla elementów rosnących
      const linie: Wezel[][] = [];
      let linia: Wezel[] = [];
      let zajete = 0;
      for (const d of dzieci) {
        const { podstawa } = szerokoscWRzedzie(d);
        const dodaj = linia.length === 0 ? podstawa : zajete + gapK + podstawa;
        if (s.flexWrap === 'wrap' && linia.length > 0 && dodaj > wew) { linie.push(linia); linia = [d]; zajete = podstawa; }
        else { linia.push(d); zajete = dodaj; }
      }
      if (linia.length) linie.push(linia);
      linie.forEach((l, i) => {
        if (i > 0) kursor += gapW;
        const miary = l.map(szerokoscWRzedzie);
        const wolne = Math.max(0, wew - miary.reduce((a, m) => a + m.podstawa, 0) - gapK * (l.length - 1));
        const rosnace = miary.filter((m) => m.rosnie).length;
        let wys = 0;
        l.forEach((d, j) => {
          const ds = styl(d);
          const szer = Math.min(wew, miary[j].podstawa + (miary[j].rosnie && rosnace ? wolne / rosnace : 0));
          const dh = bok(ds, 'Top', 'margin') + uloz(d, kursor + bok(ds, 'Top', 'margin'), szer - bok(ds, 'Left', 'margin') - bok(ds, 'Right', 'margin'), ramki) + bok(ds, 'Bottom', 'margin');
          wys = Math.max(wys, dh);
        });
        kursor += wys;
      });
    }
    h = kursor - y + pb;
    if (dzieci.length === 0) h = Math.max(h, num(s.height) ?? num(n.props?.height) ?? 0);
  }
  h = Math.max(h, num(s.minHeight) ?? 0);
  if (num(s.height) !== undefined) h = num(s.height)!;
  ramki.set(n, { y, h });
  return h;
}

/**
 * Układ całego ekranu `szer`×`wys` (pt) z dolnym wcięciem: korzeń to pierwszy host drzewa (kolumna), przewijanie
 * (`RCTScrollView`) dostaje wysokość, która zostaje po elementach stałych pod nim (przełącznik, pasek kciuka).
 * Zwraca ramki hostów w układzie ekranu (y od góry ekranu; treść przewijania bez przewinięcia).
 */
export function ukladEkranu(root: Wezel, szer: number, wys: number, dol: number): Map<Wezel, Ramka> {
  const ramki = new Map<Wezel, Ramka>();
  const korzen = root.findAll((n) => typeof n.type === 'string')[0];
  const dzieci = dzieciHost(korzen).filter((d) => !pominiety(d));
  const przewijanie = dzieci.find((d) => typ(d) === 'RCTScrollView');
  if (!przewijanie) throw new Error('ukladEkranu: brak przewijania (RCTScrollView)');
  const robocze = new Map<Wezel, Ramka>();
  const stale = dzieci.filter((d) => d !== przewijanie).reduce((a, d) => a + uloz(d, 0, szer, robocze), 0);
  let y = 0;
  for (const d of dzieci) {
    if (d === przewijanie) {
      uloz(d, y, szer, ramki);
      const okno = wys - dol - stale;
      ramki.set(d, { y, h: okno });
      y += okno;
    } else y += uloz(d, y, szer, ramki);
  }
  return ramki;
}

/** Ramka hosta o danym testID (pierwszego). */
export function ramka(root: Wezel, ramki: Map<Wezel, Ramka>, testID: string): Ramka {
  const n = root.findAll((x) => x.props?.testID === testID && typeof x.type === 'string')[0];
  const r = n ? ramki.get(n) : undefined;
  if (!r) throw new Error(`ukladEkranu: brak ramki ${testID}`);
  return r;
}

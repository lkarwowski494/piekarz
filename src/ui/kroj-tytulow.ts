// ============================================================================
// Piekarz — krój tytułów według języka aplikacji (D-050) [M1-audytor-generalny-171; 09-lokalizacja-508]
// Plik kroju (assets/fonts/SofiaSansSemiCondensed-wght.ttf) nie ma liter wietnamskich ani pism CJK; iOS
// uzupełnia brakujące znaki krojem systemowym, więc słowo wietnamskie składałoby się z dwóch krojów.
// W tych językach tytuł idzie w całości krojem systemowym (rekomendacja roli 09 do czasu decyzji roli 04).
// Listę pilnuje test src/ui/__tests__/kroj-tytulow-jezyki-171.test.ts (cmap kroju kontra teksty 35 języków).
// ============================================================================

import { lang, type Lang } from '../lib/i18n';
import { typografia } from './tokeny';

export const JEZYKI_POZA_KROJEM_TYTULOW: readonly Lang[] = ['vi', 'ja', 'ko', 'zh-Hant'];

/**
 * Cyrylica: plik kroju rysuje domyślnie formy bułgarskie (д, в, г, т…); formy rosyjskie są tylko w `locl` dla RUS,
 * ukraińskich i serbskich nie ma, a React Native na iOS nie podaje języka do `locl`. W uk, ru i sr tytuł idzie
 * krojem systemowym; bg zostaje przy kroju tytułów. Pilnuje test kroj-tytulow-cyrylica-137 (GSUB pliku kroju)
 * [M2-koordynator-napraw-137 (p12b); M1-audytor-generalny-137].
 */
export const JEZYKI_CYRYLICY_BEZ_FORM_KROJU: readonly Lang[] = ['uk', 'ru', 'sr'];

/** Krój tytułów dla bieżącego języka; `undefined` = krój systemowy. Czytany przy renderze albo w fabryce `stylePoKroju`. */
export function krojTytulowDlaJezyka(): string | undefined {
  const l = lang();
  return JEZYKI_POZA_KROJEM_TYTULOW.includes(l) || JEZYKI_CYRYLICY_BEZ_FORM_KROJU.includes(l) ? undefined : typografia.krojTytulow;
}

/**
 * Arkusz stylów osobny dla każdego kroju tytułów (D-423, KO-070; zastępuje `get fontFamily()` z D-050 i `krojTytulowStyl()`
 * z D-419). Leniwy getter w `StyleSheet.create` liczył krój przy każdym odczycie, więc styl z poprzedniego renderu po
 * zmianie języka dawał już nowy krój i natywny diff nie widział zmiany (ru/uk zostawały przy Sofii z bułgarskimi formami).
 * Tu `fabryka` (`() => StyleSheet.create({... fontFamily: theme.typography.krojTytulow ...})`) wykonuje się raz na krój;
 * obiekty stylów mają wartość statyczną, a zmiana języka daje inny obiekt (nowy krój) albo ten sam (ten sam krój).
 * `t()` ani `stylePoKroju` same nie renderują komponentu: nowy krój i nowe teksty dostaje komponent, który po zmianie
 * języka renderuje się z innego powodu. Układy i `useNaglowek` wołają `useLang()`, a ekrany tras (za `StaticContainer`,
 * który nie przerysowuje ich przy renderze układu) subskrybują język przez `useEkranZPasem()` albo `useLang()`; pilnuje
 * tego tests/jezyk-ekrany-straznik-ac.test.ts [KO-071, D-424]. Komponent z `React.memo` albo `useMemo` bez języka w zależnościach
 * zostaje przy starym kroju i tekstach do własnego renderu (kandydaci: D-424). Stan ekranu i nawigacja
 * zostają, bez `key` na korzeniu. Miejsca odczytu kroju pilnuje tests/kroj-tytulow-straznik-d423.test.ts (fabryka
 * `stylePoKroju` albo funkcja z listy WYJATKI).
 */
export function stylePoKroju<T extends object>(fabryka: () => T): T {
  const arkusze = new Map<string, T>();
  const biezacy = (): T => {
    const klucz = krojTytulowDlaJezyka() ?? '';
    let a = arkusze.get(klucz);
    if (!a) {
      a = fabryka();
      arkusze.set(klucz, a);
    }
    return a;
  };
  return new Proxy({} as T, {
    get: (_c, k) => Reflect.get(biezacy(), k),
    has: (_c, k) => Reflect.has(biezacy(), k),
    ownKeys: () => Reflect.ownKeys(biezacy()),
    getOwnPropertyDescriptor: (_c, k) => {
      const d = Reflect.getOwnPropertyDescriptor(biezacy(), k);
      return d ? { ...d, configurable: true } : undefined;
    },
  });
}

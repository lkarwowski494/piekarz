// Piekarz — „ile temu” we wspólnym formacie czasu (design-spec §7, §11c 116): pełne słowo dni z formą liczby,
// godziny jako „{n} h” ze spacją, bez skrótów „2d”, „14h” [M1-audytor-generalny-162; 04-studio-projektowe-508].
import { t, tPlural } from './i18n';

const DNI_TEMU = { one: '{n} dzień temu', few: '{n} dni temu', many: '{n} dni temu', other: '{n} dnia temu' };

/** „1 dzień temu”, „2 dni temu”, „5 dni temu” (forma CLDR języka aplikacji). */
export function dniTemu(dni: number): string {
  return tPlural(dni, DNI_TEMU);
}

/** „3 h temu”. */
export function godzinTemu(godziny: number): string {
  return t('{n} h temu', { n: godziny });
}

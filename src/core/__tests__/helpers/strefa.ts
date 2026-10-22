/**
 * Strefa czasowa na czas bloku testów: proces roboczy Jest dostaje TZ=<strefa> w beforeAll i wraca do poprzedniej
 * w afterAll. process.env w Jest to kopia w piaskownicy (zmiana nie działa), więc TZ ustawiamy w prawdziwym procesie
 * (getBuiltinModule, jak w src/scheduler/__tests__/reverse-scheduler-dst.test.ts); Node 24 przelicza strefę po
 * zmianie TZ [M3 D0]. Wołać wewnątrz describe.
 */
const prawdziwyProces = process.getBuiltinModule('process') as NodeJS.Process;

export function wStrefie(strefa: string): void {
  const poprzednia = prawdziwyProces.env.TZ;
  beforeAll(() => {
    prawdziwyProces.env.TZ = strefa;
    // Jawna kontrola, że strefa naprawdę zadziałała
    expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe(strefa);
  });
  afterAll(() => {
    if (poprzednia === undefined) delete prawdziwyProces.env.TZ;
    else prawdziwyProces.env.TZ = poprzednia;
  });
}

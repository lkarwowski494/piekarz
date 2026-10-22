/**
 * format.ts cachuje Intl.DateTimeFormat; po zmianie strefy urządzenia przy działającej aplikacji godziny (także w treści
 * powiadomień) nie mogą zostać w starej strefie [M3 D2, znalezisko D0].
 */
import { formatTime, formatDate, formatDzienData } from '../format';

// process.env w Jest to kopia w piaskownicy: TZ ustawiamy w prawdziwym procesie (jak src/core/__tests__/helpers/strefa.ts)
const prawdziwyProces = process.getBuiltinModule('process') as NodeJS.Process;

describe('format.ts po zmianie strefy czasowej urządzenia', () => {
  const poprzednia = prawdziwyProces.env.TZ;
  afterAll(() => {
    if (poprzednia === undefined) delete prawdziwyProces.env.TZ;
    else prawdziwyProces.env.TZ = poprzednia;
  });
  const ustaw = (strefa: string) => {
    prawdziwyProces.env.TZ = strefa;
    expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe(strefa);
  };

  it('godzina i data liczą się w bieżącej strefie, także gdy formatter był już użyty w poprzedniej', () => {
    const chwila = Date.UTC(2026, 9, 22, 22, 30); // 22.10.2026 22:30 UTC
    ustaw('Europe/Warsaw');
    expect(formatTime(chwila, 'pl')).toBe('00:30');
    expect(formatDate(chwila, 'pl')).toBe('23.10.2026');
    expect(formatDzienData(chwila, 'pl')).toContain('23');
    ustaw('America/New_York');
    expect(formatTime(chwila, 'pl')).toBe('18:30');
    expect(formatDate(chwila, 'pl')).toBe('22.10.2026');
    expect(formatDzienData(chwila, 'pl')).toContain('22');
    ustaw('Europe/Warsaw');
    expect(formatTime(chwila, 'pl')).toBe('00:30');
  });
});

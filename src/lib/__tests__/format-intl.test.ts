/**
 * M1-audytor-generalny-070 (09-lokalizacja-005): liczby, daty i godziny na ekranie przez Intl według
 * języka aplikacji (PL: 1,5 i 25.10.2026, 24 h; EN: 1.5 i format EN). Eksport JSON i CSV bez zmian (kropka).
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { setLang } from '../i18n';
import { appLocale, formatDate, formatFixed, formatNumber, formatTime } from '../format';
import { formatDoseWeight, formatTemperature, formatWeight } from '../unit-converter';
import { formatDate as formatDateApp } from '../date';
import { buildBackup } from '../backup';
import { exportFlourInventoryCsv } from '../csv-exporter';
import { calculateReverseSchedule } from '../../scheduler/reverse-scheduler';

const D = new Date(2026, 9, 25, 21, 5); // 25.10.2026 21:05 czasu lokalnego

afterEach(() => setLang('pl'));

describe('src/lib/format.ts', () => {
  it('formatNumber: PL przecinek, EN kropka, liczba miejsc z opcji', () => {
    expect(formatNumber(1.5, 'pl')).toBe('1,5');
    expect(formatNumber(1.5, 'en')).toBe('1.5');
    expect(formatNumber(65, 'pl', { minimumFractionDigits: 1, maximumFractionDigits: 1 })).toBe('65,0');
    expect(formatNumber(0.354, 'en', { maximumFractionDigits: 2 })).toBe('0.35');
    expect(formatNumber(1250, 'en')).toBe('1250'); // bez separatora tysięcy, jak na wadze kuchennej
  });

  it('formatFixed: stała liczba miejsc jak toFixed, separator według języka aplikacji', () => {
    setLang('pl');
    expect(formatFixed(65, 1)).toBe('65,0');
    expect(formatFixed(2.25, 2)).toBe('2,25');
    setLang('en');
    expect(formatFixed(65, 1)).toBe('65.0');
  });

  it('formatDate: PL 25.10.2026, EN-GB 25/10/2026, EN-US 10/25/2026', () => {
    expect(formatDate(D, 'pl')).toBe('25.10.2026');
    expect(formatDate(D, 'en-GB')).toBe('25/10/2026');
    expect(formatDate(D, 'en-US')).toBe('10/25/2026');
  });

  it('formatTime: PL 24 h, EN 12 h', () => {
    expect(formatTime(D, 'pl')).toBe('21:05');
    expect(formatTime(D, 'en-US')).toMatch(/^09:05\s?PM$/);
  });

  it('appLocale: język aplikacji z regionem urządzenia, gdy język się zgadza', () => {
    setLang('pl');
    expect(appLocale()).toBe('pl-PL'); // urządzenie w jest.setup.js: pl-PL
    setLang('en');
    expect(appLocale()).toBe('en');
  });
});

describe('miejsca wyświetlania według języka aplikacji', () => {
  it('temperatura i masa: PL 26,5°C i 2,5 g; EN 26.5°C i 2.5 g', () => {
    setLang('pl');
    expect(formatTemperature(26.5, 'metric')).toBe('26,5°C');
    expect(formatDoseWeight(2.5, 'metric')).toBe('2,5 g');
    expect(formatDoseWeight(10, 'imperial')).toBe('0,35 oz');
    expect(formatWeight(500, 'metric')).toBe('500 g');
    setLang('en');
    expect(formatTemperature(26.5, 'metric')).toBe('26.5°C');
    expect(formatDoseWeight(2.5, 'metric')).toBe('2.5 g');
    expect(formatDoseWeight(10, 'imperial')).toBe('0.35 oz');
  });

  it('src/lib/date.ts formatuje według języka aplikacji', () => {
    setLang('pl');
    expect(formatDateApp(D, { day: '2-digit', month: '2-digit', year: 'numeric' })).toBe('25.10.2026');
    setLang('en');
    expect(formatDateApp(D, { day: '2-digit', month: '2-digit', year: 'numeric' })).toBe('10/25/2026');
  });

  it('harmonogram: godzina kolizji ze snem według języka aplikacji', () => {
    // Cel o 03:00: aktywne etapy wypadają w nocy (sen 23:00–06:30), więc są kolizje
    const target = new Date(2026, 9, 26, 3, 0);
    setLang('pl');
    const pl = calculateReverseSchedule(target).sleepCollisions.map((c) => c.time);
    expect(pl.length).toBeGreaterThan(0);
    for (const s of pl) expect(s).toMatch(/^\d{2}:\d{2}$/);
    setLang('en');
    const en = calculateReverseSchedule(target).sleepCollisions.map((c) => c.time);
    expect(en.length).toBe(pl.length);
    for (const s of en) expect(s).toMatch(/^\d{2}:\d{2}\s?[AP]M$/);
  });

  it("w src/ i app/ nie ma 'pl-PL' ani 'en-US' na sztywno (poza testami)", () => {
    const root = join(__dirname, '..', '..', '..');
    const hits: string[] = [];
    const walk = (dir: string) => {
      for (const n of readdirSync(dir)) {
        const p = join(dir, n);
        if (statSync(p).isDirectory()) {
          if (n !== '__tests__') walk(p);
        } else if (/\.(ts|tsx)$/.test(n) && /'(pl-PL|en-US)'/.test(readFileSync(p, 'utf8'))) hits.push(p.slice(root.length + 1));
      }
    };
    walk(join(root, 'src'));
    walk(join(root, 'app'));
    expect(hits).toEqual([]);
  });
});

describe('eksport bez zmian formatu (kropka niezależnie od języka)', () => {
  it('kopia JSON i CSV spiżarni mają kropkę dziesiętną w PL', () => {
    setLang('pl');
    const json = JSON.stringify(buildBackup({ bakes: [], starters: [], customRecipes: [], settings: { hydration: 72.5 } }));
    expect(json).toContain('"hydration":72.5');
    const csv = exportFlourInventoryCsv([
      { id: 'f1', name: 'Typ 750', stockGrams: 1234.5, proteinPct: 12.5, updatedAt: 0 } as Parameters<typeof exportFlourInventoryCsv>[0][number],
    ]);
    expect(csv).toContain('1234.5');
    expect(csv).toContain('12.5');
  });
});

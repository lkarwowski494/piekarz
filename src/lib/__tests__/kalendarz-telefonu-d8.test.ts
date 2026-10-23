/**
 * Plan wypieku w kalendarzu telefonu przez plik .ics (BR-KAL-011; M3 D8): zapis do katalogu cache, arkusz
 * udostępniania z text/calendar, bez prośby o dostęp do kalendarza (OG-08), komunikaty błędów bez cichej porażki.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import type { SessionStep } from '../../core/bake-steps';
import { dodajDoKalendarza, pokazBladKalendarza, wydarzenieZPlanu, type PowodBleduKalendarza, type WynikDodania } from '../kalendarz-telefonu';

const root = path.join(__dirname, '..', '..', '..');
const mockFiles: Map<string, string> = (FileSystem as unknown as { __mockFiles: Map<string, string> }).__mockFiles;

const krok = (id: string, name: string, h: number, min: number, isPassive = false): SessionStep => ({
  id, name, category: 'mix', durationMin: min, isPassive, instructions: '',
  plannedStart: Date.UTC(2026, 9, 24, h), plannedEnd: Date.UTC(2026, 9, 24, h) + min * 60_000,
});
const kroki = [krok('mix', 'Mieszanie', 8, 30), krok('bulk', 'Fermentacja zasadnicza', 8, 240, true), krok('bake', 'Pieczenie', 14, 45)];
const wydarzenie = () => {
  const w = wydarzenieZPlanu({ id: 'bake_1', nazwa: 'Mój chleb, żytni', kroki, teraz: Date.UTC(2026, 9, 22, 12) });
  if (!w) throw new Error('oczekiwano wydarzenia');
  return w;
};

beforeEach(() => {
  mockFiles.clear();
  jest.clearAllMocks();
  (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
  (Sharing.shareAsync as jest.Mock).mockResolvedValue(undefined);
});

describe('BR-KAL-011 wydarzenie z planu', () => {
  it('BR-KAL-011 tytuł z nazwą receptury, początek pierwszego i koniec ostatniego kroku, jeden wiersz opisu na krok', () => {
    const w = wydarzenie();
    expect(w.id).toBe('bake_1');
    expect(w.tytul).toContain('Mój chleb, żytni');
    expect(w.startMs).toBe(Date.UTC(2026, 9, 24, 8));
    expect(w.koniecMs).toBe(Date.UTC(2026, 9, 24, 14) + 45 * 60_000);
    expect(w.stempelMs).toBe(Date.UTC(2026, 9, 22, 12));
    // trzy kroki i stopka z nazwą aplikacji
    expect(w.opis).toHaveLength(4);
    expect(w.opis[0]).toContain('Mieszanie');
    expect(w.opis[2]).toContain('Pieczenie');
    expect(w.opis[3]).toBe('— Piekarz');
  });

  it('BR-KAL-011 plan bez kroków z godzinami nie daje wydarzenia', () => {
    expect(wydarzenieZPlanu({ id: 'x', nazwa: 'Chleb', kroki: [], teraz: 0 })).toBeNull();
    const bez = { ...krok('a', 'Mieszanie', 8, 30), plannedStart: null, plannedEnd: null };
    expect(wydarzenieZPlanu({ id: 'x', nazwa: 'Chleb', kroki: [bez], teraz: 0 })).toBeNull();
  });
});

describe('BR-KAL-011 Dodanie bez dostępu do kalendarza', () => {
  it('BR-KAL-011 zapisuje plik .ics w katalogu cache i otwiera arkusz udostępniania z text/calendar', async () => {
    const r = await dodajDoKalendarza(wydarzenie());
    expect(r).toEqual({ ok: true });
    const [sciezka] = (FileSystem.writeAsStringAsync as jest.Mock).mock.calls[0] as [string, string];
    expect(sciezka.startsWith(String(FileSystem.cacheDirectory))).toBe(true);
    expect(sciezka.endsWith('.ics')).toBe(true);
    const tresc = mockFiles.get(sciezka) ?? '';
    expect(tresc.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(tresc).toContain('UID:bake_1@piekarz');
    expect(Sharing.shareAsync).toHaveBeenCalledTimes(1);
    const [uri, opcje] = (Sharing.shareAsync as jest.Mock).mock.calls[0] as [string, { mimeType: string; UTI: string }];
    expect(uri).toBe(sciezka);
    expect(opcje.mimeType).toBe('text/calendar');
    expect(opcje.UTI).toBe('public.calendar-event');
  });

  it('BR-KAL-011 OG-08: aplikacja nie ma modułu kalendarza ani uprawnienia do niego', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')) as { dependencies: Record<string, string> };
    expect(Object.keys(pkg.dependencies).filter((k) => /calendar|eventkit/i.test(k))).toEqual([]);
    const zrodlo = fs.readFileSync(path.join(root, 'src/lib/kalendarz-telefonu.ts'), 'utf8');
    expect(zrodlo).not.toMatch(/expo-calendar|requestCalendarPermissions|NSCalendars/);
    const konfig = fs.readFileSync(path.join(root, 'app.json'), 'utf8');
    expect(konfig).not.toMatch(/NSCalendars|calendarPermission/i);
  });
});

describe('BR-KAL-011 błąd udostępniania bez cichej porażki', () => {
  it('BR-KAL-011 brak udostępniania na telefonie: wynik z powodem, arkusz się nie otwiera', async () => {
    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(false);
    expect(await dodajDoKalendarza(wydarzenie())).toEqual({ ok: false, powod: 'brak-udostepniania' });
    expect(Sharing.shareAsync).not.toHaveBeenCalled();
  });

  it('BR-KAL-011 błąd zapisu pliku: powód „zapis”, arkusz się nie otwiera', async () => {
    (FileSystem.writeAsStringAsync as jest.Mock).mockRejectedValueOnce(new Error('brak miejsca'));
    expect(await dodajDoKalendarza(wydarzenie())).toEqual({ ok: false, powod: 'zapis' });
    expect(Sharing.shareAsync).not.toHaveBeenCalled();
  });

  it('BR-KAL-011 błąd arkusza udostępniania: powód „arkusz”', async () => {
    (Sharing.shareAsync as jest.Mock).mockRejectedValueOnce(new Error('błąd systemu'));
    expect(await dodajDoKalendarza(wydarzenie())).toEqual({ ok: false, powod: 'arkusz' });
  });

  it('BR-KAL-011 wydarzenie z błędnym czasem: powód „plan”, nic nie zapisano', async () => {
    expect(await dodajDoKalendarza({ ...wydarzenie(), koniecMs: 0 })).toEqual({ ok: false, powod: 'plan' });
    expect(FileSystem.writeAsStringAsync).not.toHaveBeenCalled();
  });

  it('BR-KAL-011 komunikat „Nie dodano do kalendarza” z innym tekstem dla każdego powodu', () => {
    const spy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const powody: PowodBleduKalendarza[] = ['plan', 'zapis', 'brak-udostepniania', 'arkusz'];
    const brak: WynikDodania = { ok: false, powod: 'plan' };
    expect(powody).toContain(brak.ok ? 'plan' : brak.powod);
    const teksty = powody.map((p) => {
      pokazBladKalendarza(p);
      const [tytul, tresc] = spy.mock.calls[spy.mock.calls.length - 1] as [string, string];
      expect(tytul).toBe('Nie dodano do kalendarza');
      expect(tresc.length).toBeGreaterThan(20);
      return tresc;
    });
    expect(new Set(teksty).size).toBeGreaterThanOrEqual(3);
    expect(teksty[2]).toContain('skopiować');
    spy.mockRestore();
  });
});

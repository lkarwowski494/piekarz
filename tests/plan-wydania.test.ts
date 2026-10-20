// ============================================================================
// Piekarz — plan wydania i dziennik wydań w repo (M1-audytor-generalny-079,
// 10-wydanie-009; DEC-16 (a) z 2026-10-19: wydanie ręczne po TestFlight,
// dziennik wydania). Test pilnuje, że plan istnieje, zgadza się z konfiguracją
// (minimalny iOS, numer buildu, workflow bez wysyłki do recenzji) i nie powiela
// metadanych sklepu, a dziennik nie ma wpisu App Store bez werdyktu 07 i zgody.
// Same działania w App Store Connect sprawdza właściciel (kroki w sklep.md).
// ============================================================================

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(__dirname, '..');
const read = (p: string) => readFileSync(join(root, p), 'utf8').replace(/\r\n/g, '\n');
const SKLEP = 'docs/wydanie/sklep.md';
const DZIENNIK = 'docs/wydanie/dziennik.md';
const sklep = existsSync(join(root, SKLEP)) ? read(SKLEP) : '';
const dziennik = existsSync(join(root, DZIENNIK)) ? read(DZIENNIK) : '';

describe('plan wydania docs/wydanie/sklep.md (079, DEC-16 a)', () => {
  it('istnieje', () => {
    expect(existsSync(join(root, SKLEP))).toBe(true);
  });

  it('wydanie ręczne po TestFlight: opcja „Manually release this version”, TestFlight przed recenzją', () => {
    expect(sklep).toMatch(/DEC-16 \(a\)/);
    expect(sklep).toContain('Manually release this version');
    expect(sklep).toMatch(/TestFlight/);
  });

  it('wydanie stopniowe 7 dni dla aktualizacji i plan na zły build', () => {
    expect(sklep).toMatch(/Release update over a 7-day period using phased release/);
    expect(sklep).toMatch(/^## .*[Zz]ły build/m);
    expect(sklep).toMatch(/Pause Phased Release/);
  });

  it('odsyła do jedynego źródła metadanych i nie powiela słów kluczowych ani opisu', () => {
    expect(sklep).toContain('docs/app-store-metadata-v2.md');
    const meta = read('docs/app-store-metadata-v2.md');
    const slowa = [...meta.matchAll(/^\| \*\*(?:Słowa kluczowe \(Keywords\)|Keywords)\*\* \| `([^`]+)`/gm)].map((m) => m[1]);
    expect(slowa.length).toBeGreaterThanOrEqual(2);
    for (const s of slowa) expect(sklep).not.toContain(s);
    const opisPL = /```text\n(Piekarz \(Crust\) prowadzi[^\n]+)/.exec(meta)?.[1] ?? '';
    expect(opisPL.length).toBeGreaterThan(50);
    expect(sklep).not.toContain(opisPL);
  });

  it('minimalny iOS w planie = ios.deploymentTarget w app.json (077)', () => {
    const target = JSON.parse(read('app.json')).expo.ios.deploymentTarget as string;
    expect(target).toBe('18.0');
    expect(sklep).toContain(`iOS ${target}`);
  });

  it('numer buildu w planie = BUILD_BASE + numer przebiegu z workflow (077)', () => {
    const wf = read('.github/workflows/testflight.yml');
    const base = /BUILD_BASE: '(\d+)'/.exec(wf)?.[1];
    expect(base).toBeDefined();
    expect(wf).toContain('BUILD_NUMBER=$((BUILD_BASE + GITHUB_RUN_NUMBER))');
    expect(sklep).toContain(`BUILD_BASE (${base}) + GITHUB_RUN_NUMBER`);
  });

  it('konfiguracja nie wysyła do recenzji ani nie publikuje sama (zasada roli 2)', () => {
    const wf = read('.github/workflows/testflight.yml');
    expect(wf).not.toMatch(/eas submit|fastlane|deliver|appStoreVersionSubmissions|reviewSubmissions/);
    const eas = JSON.parse(read('eas.json'));
    expect(JSON.stringify(eas)).not.toMatch(/autoSubmit|auto-submit/);
  });

  it('blokady wydania nazwane: polityka i wsparcie (012), kontrakt B (D-043), werdykt 07', () => {
    expect(sklep).toContain('M1-audytor-generalny-012');
    expect(sklep).toContain('D-043');
    expect(sklep).toMatch(/ZABLOKOWANE/);
  });
});

describe('dziennik wydań docs/wydanie/dziennik.md (079)', () => {
  const NAGLOWEK = '| Data | Wersja | Build | SHA | Werdykt 07 | Kanał | Decyzje | Zgody właściciela (słowa, data) | Wynik |';
  const wiersze = dziennik
    .split('\n')
    .filter((l) => /^\| \d{4}-\d{2}-\d{2}/.test(l))
    .map((l) => l.slice(1, -1).split(' | ').map((c) => c.trim()));

  it('istnieje i ma nagłówek z szablonu roli', () => {
    expect(existsSync(join(root, DZIENNIK))).toBe(true);
    expect(dziennik).toContain(NAGLOWEK);
  });

  it('każdy wpis ma 9 kolumn, wersję, numer buildu i SHA', () => {
    expect(wiersze.length).toBeGreaterThan(0);
    for (const w of wiersze) {
      expect(w).toHaveLength(9);
      expect(w[1]).toMatch(/^\d+\.\d+(\.\d+)?$/);
      expect(w[2]).toMatch(/^\d+$/);
      expect(w[3]).toMatch(/^`?[0-9a-f]{7,40}`?$/);
    }
  });

  it('wpis z kanałem App Store ma werdykt 07 inny niż ZABLOKOWANE i zgodę właściciela', () => {
    for (const w of wiersze.filter((x) => /App Store/.test(x[5]) && !/TestFlight/.test(x[5]))) {
      expect(w[4]).not.toMatch(/ZABLOKOWANE|brak|DO USTALENIA|^—$/);
      expect(w[7]).not.toMatch(/DO USTALENIA|^—$/);
    }
  });
});

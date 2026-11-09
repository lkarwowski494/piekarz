// ============================================================================
// Piekarz — klucz App Store Connect i workflowy ASC „jak Trening” (D-314)
// [M1-audytor-generalny-082; 10-wydanie-007]. Jeden klucz zespołu (rola, której wymaga podpis w chmurze)
// zostaje, ale każde zadanie, które nim wysyła build albo zapisuje w App Store Connect, czeka na akceptację
// właściciela w środowisku GitHub `release`. Przebiegi na sucho i kontrola (tylko GET) biegną bez środowiska.
// Procedura unieważnienia klucza: docs/prawne/procedura-bezpieczenstwa.md.
// ============================================================================

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PRODUKTY } from '../src/lib/platnosci/konfiguracja';

const root = join(__dirname, '..');
const read = (p: string) => readFileSync(join(root, p), 'utf8').replace(/\r\n/g, '\n');
const wf = (nazwa: string) => read(`.github/workflows/${nazwa}`);

/** Zadania workflow: nazwa → tekst (od `  nazwa:` do następnego zadania na tym samym wcięciu). */
function zadania(tekst: string): Record<string, string> {
  const jobs = tekst.split(/\njobs:\n/)[1] ?? '';
  const wynik: Record<string, string> = {};
  for (const kawalek of jobs.split(/\n(?=  [\w-]+:\n)/)) {
    const m = /^\s*([\w-]+):\n/.exec(kawalek);
    if (m) wynik[m[1]] = kawalek;
  }
  return wynik;
}
const wSrodowiskuRelease = (job: string) => /\n    environment: release\n/.test(job);
const uzywaKluczaAsc = (job: string) => /secrets\.ASC_/.test(job);

describe('testflight.yml: wysyłka buildu tylko po akceptacji właściciela (D-314)', () => {
  const jobs = zadania(wf('testflight.yml'));

  it('zadanie build (klucz ASC, podpis w chmurze, upload) jest w środowisku release', () => {
    expect(jobs.build).toBeDefined();
    expect(uzywaKluczaAsc(jobs.build)).toBe(true);
    expect(wSrodowiskuRelease(jobs.build)).toBe(true);
  });

  it('każde zadanie z sekretem ASC jest w środowisku release; nazwy sekretów bez zmian', () => {
    for (const [nazwa, job] of Object.entries(jobs)) if (uzywaKluczaAsc(job)) expect([nazwa, wSrodowiskuRelease(job)]).toEqual([nazwa, true]);
    expect(jobs.build).toMatch(/secrets\.ASC_KEY_ID/);
    expect(jobs.build).toMatch(/secrets\.ASC_ISSUER_ID/);
    expect(jobs.build).toMatch(/secrets\.ASC_KEY_P8_BASE64/);
  });
});

describe.each([
  ['asc-ustawienia.yml', 'scripts/asc-ustawienia.mjs', 'docs/wydanie/asc-zgoda.json'],
  ['asc-zgloszenie.yml', 'scripts/asc-zgloszenie.mjs', 'docs/wydanie/asc-zgoda-zgloszenie.json'],
])('%s: przebieg na sucho bez środowiska, zapis w środowisku release (D-314)', (plik, skrypt, zgoda) => {
  const tekst = wf(plik);
  const jobs = zadania(tekst);

  it('dwa zadania: na-sucho i zapis', () => {
    expect(Object.keys(jobs).sort()).toEqual(['na-sucho', 'zapis']);
  });

  it('na-sucho: bez środowiska; skrypt nie dostaje pliku zgody z "zapis": true (kopia z "zapis": false)', () => {
    const job = jobs['na-sucho'];
    expect(wSrodowiskuRelease(job)).toBe(false);
    expect(job).not.toMatch(/environment:/);
    expect(job).toContain(skrypt);
    expect(job).not.toContain(`--zgoda ${zgoda}`);
    expect(job).toMatch(/z\.zapis = false/);
    expect(job).toMatch(/--zgoda "\$RUNNER_TEMP\/zgoda-na-sucho\.json"/);
  });

  it('na-sucho wystawia wyjście zapis tylko z "zapis": true w pliku zgody', () => {
    const job = jobs['na-sucho'];
    expect(job).toMatch(/outputs:\n      zapis: \$\{\{ steps\.zgoda\.outputs\.zapis \}\}\n/);
    expect(job).toContain(`require('./${zgoda}').zapis === true`);
  });

  it('zapis: po na-sucho, tylko gdy zgoda ma "zapis": true, w środowisku release; skrypt z oryginalnym plikiem zgody', () => {
    const job = jobs.zapis;
    expect(job).toMatch(/\n    needs: na-sucho\n/);
    expect(job).toMatch(/\n    if: needs\.na-sucho\.outputs\.zapis == 'true'\n/);
    expect(wSrodowiskuRelease(job)).toBe(true);
    expect(job).toContain(`node ${skrypt} --zgoda ${zgoda}`);
  });

  it('wyzwalacz bez zmian: tylko workflow_dispatch; token repo tylko do odczytu', () => {
    const on = tekst.split(/\nconcurrency:/)[0].split(/\non:\n/)[1];
    expect(on.trim()).toBe('workflow_dispatch:');
    expect(tekst).toMatch(/\npermissions:\n  contents: read\n/);
    expect(tekst).not.toMatch(/contents: write/);
  });
});

describe('asc-kontrola.yml: kontrola App Store Connect tylko do odczytu, wspólny workflow studia (D-314)', () => {
  const sciezka = '.github/workflows/asc-kontrola.yml';
  const tekst = existsSync(join(root, sciezka)) ? wf('asc-kontrola.yml') : '';

  it('istnieje; tylko ręcznie (workflow_dispatch z wejściem szczegoly), bez harmonogramu, push i pull_request', () => {
    expect(tekst).not.toBe('');
    expect(tekst).toMatch(/\non:\n  workflow_dispatch:\n    inputs:\n      szczegoly:\n[\s\S]*?type: boolean\n\s+default: false\n/);
    expect(tekst).not.toMatch(/schedule:|\bpush:|pull_request|workflow_call/);
  });

  it('uprawnienia contents: read; bez środowiska release i bez własnych kroków (zapisu nie ma czym zrobić)', () => {
    expect(tekst).toMatch(/\npermissions:\n  contents: read\n/);
    expect(tekst).not.toMatch(/contents: write|environment:/);
    expect(tekst).not.toMatch(/\n\s+steps:|\n\s+run:|scripts\/asc-(ustawienia|zgloszenie)/);
  });

  it('wywołuje workflow lkarwowski494/apps4brew-narzedzia przypięty do pełnego SHA (40 znaków hex), konfiguracja docs/wydanie/asc-kontrola.json', () => {
    const m = /uses: lkarwowski494\/apps4brew-narzedzia\/\.github\/workflows\/asc-kontrola\.yml@([^\s]+)\n/.exec(tekst);
    expect(m?.[1]).toMatch(/^[0-9a-f]{40}$/);
    expect(tekst).toMatch(/with:\n\s+config: docs\/wydanie\/asc-kontrola\.json\n\s+szczegoly: \$\{\{ inputs\.szczegoly \}\}\n/);
  });

  it('sekrety przekazane jawnie: dokładnie ASC_KEY_ID, ASC_ISSUER_ID, ASC_KEY_P8 (bez secrets: inherit)', () => {
    expect(tekst).not.toMatch(/secrets: inherit/);
    expect([...(tekst.match(/secrets\.[A-Z_0-9]+/g) ?? [])].sort()).toEqual(['secrets.ASC_ISSUER_ID', 'secrets.ASC_KEY_ID', 'secrets.ASC_KEY_P8']);
  });
});

describe('docs/wydanie/asc-kontrola.json: oczekiwane wartości z plików Piekarza, bez sekretów', () => {
  const sciezka = 'docs/wydanie/asc-kontrola.json';
  const config = existsSync(join(root, sciezka)) ? JSON.parse(read(sciezka)) : {};
  const ceny = JSON.parse(read('docs/wydanie/ceny.json'));

  it('bundle id = app.json; produkty = PRODUKTY (src/lib/platnosci/konfiguracja.ts)', () => {
    expect(config.aplikacja?.bundleId).toBe(JSON.parse(read('app.json')).expo.ios.bundleIdentifier);
    expect(config.produkty).toEqual([
      { klucz: 'monthly', productId: PRODUKTY.monthly, rodzaj: 'subskrypcja' },
      { klucz: 'yearly', productId: PRODUKTY.yearly, rodzaj: 'subskrypcja' },
      { klucz: 'lifetime', productId: PRODUKTY.lifetime, rodzaj: 'jednorazowy' },
    ]);
  });

  it('ceny i terytoria = storefronty z ceną ręczną w docs/wydanie/ceny.json; Family Sharing = ceny.json', () => {
    expect(config.terytoria?.wybrane).toEqual(Object.keys(ceny.reczne));
    for (const plan of ['monthly', 'yearly', 'lifetime']) {
      expect(config.ceny?.[plan]).toEqual(Object.fromEntries(Object.entries(ceny.reczne).map(([t, w]: [string, any]) => [t, Number(w[plan])])));
      expect(config.rodzina?.[plan]).toBe(ceny.familySharing.includes(plan));
    }
  });

  it('bez oferty wprowadzającej (D-112): ceny.json jej nie ma, kontrola zgłosi każdą', () => {
    expect(ceny.ofertaWprowadzajaca).toBeUndefined();
    expect(config.oferta).toEqual({ produkty: ['monthly', 'yearly'], brak: true });
  });

  it('kategoria Food & Drink + Productivity (D-055, instrukcja-ustawien §10.7)', () => {
    expect(read('docs/wydanie/instrukcja-ustawien.md')).toMatch(/Primary Category: Food & Drink; Secondary Category: Productivity/);
    expect(config.kategoria).toEqual({ glowna: 'FOOD_AND_DRINK', dodatkowa: 'PRODUCTIVITY' });
  });

  it('adresy i metadane z pliku generowanego scripts/asc-kontrola-oczekiwane.mjs (aktualny: --check)', () => {
    expect(config.adresy).toEqual({ plik: 'docs/wydanie/asc-kontrola-oczekiwane.json' });
    expect(config.metadane?.zrodla).toEqual([
      { plik: 'docs/wydanie/asc-kontrola-oczekiwane.json', korzen: 'lokalizacje', pola: { name: 'name', subtitle: 'subtitle', keywords: 'keywords', promotionalText: 'promotionalText', description: 'description' } },
    ]);
    expect(() => execFileSync(process.execPath, [join(root, 'scripts/asc-kontrola-oczekiwane.mjs'), '--check'], { cwd: root, stdio: 'pipe' })).not.toThrow();
    const oczek = JSON.parse(read('docs/wydanie/asc-kontrola-oczekiwane.json'));
    const pl = JSON.parse(read('docs/wydanie/metadane/pl.json'));
    expect(Object.keys(oczek.lokalizacje)).toHaveLength(JSON.parse(read('docs/wydanie/asc-zgloszenie.json')).lokalizacji);
    expect(oczek.lokalizacje.pl).toEqual({ name: pl.nazwa, subtitle: pl.podtytul, keywords: pl.slowaKluczowe, promotionalText: pl.tekstPromocyjny, description: pl.opis });
    const linki = read('src/lib/links.ts');
    expect(linki).toContain(`export const PRIVACY_URL = '${oczek.privacyPolicyUrl}'`);
    expect(linki).toContain(`export const SUPPORT_URL = '${oczek.supportUrl}'`);
  });

  it('bez identyfikatorów klucza i sekretów w plikach kontroli', () => {
    for (const p of [sciezka, 'docs/wydanie/asc-kontrola-oczekiwane.json', '.github/workflows/asc-kontrola.yml']) {
      const t = existsSync(join(root, p)) ? read(p) : '';
      expect(t).not.toMatch(/BEGIN PRIVATE KEY|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|AuthKey_[A-Z0-9]/i);
    }
  });
});

describe('procedura unieważnienia klucza App Store Connect (D-314)', () => {
  const doc = read('docs/prawne/procedura-bezpieczenstwa.md');
  const sekcja = doc.slice(doc.indexOf('## 5. Klucz App Store Connect'));

  it('sekcja istnieje i opisuje Revoke w Users and Access → Integrations', () => {
    expect(doc).toContain('## 5. Klucz App Store Connect');
    expect(sekcja).toMatch(/Users and Access → Integrations/);
    expect(sekcja).toMatch(/Revoke/);
  });

  it('wymiana sekretów w obu repo, które dzielą klucz (Piekarz i Napar), i sprawdzenie przebiegiem asc-kontrola', () => {
    expect(sekcja).toMatch(/Piekarz/);
    expect(sekcja).toMatch(/Napar/);
    expect(sekcja).toMatch(/asc-kontrola/);
    for (const s of ['ASC_KEY_ID', 'ASC_ISSUER_ID', 'ASC_KEY_P8_BASE64', 'ASC_KEY_P8']) expect(sekcja).toContain(s);
  });

  it('kiedy unieważnić: wyciek, odejście współpracownika, sekret w logu', () => {
    expect(sekcja).toMatch(/wycie/i);
    expect(sekcja).toMatch(/współpracownik/);
    expect(sekcja).toMatch(/log/);
  });

  it('warunek ochrony środowiska release (Required reviewers, tylko master) i zasięg sekretu repozytorium (przegląd 082, P2)', () => {
    expect(sekcja).toMatch(/Required reviewers/);
    expect(sekcja).toMatch(/Deployment branches = tylko `master`/);
    expect(sekcja).toMatch(/bez reguł/);
    expect(sekcja).toMatch(/sekrety są na poziomie repozytorium/);
  });
});

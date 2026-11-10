#!/usr/bin/env node
// ============================================================================
// Piekarz — oczekiwane wartości kontroli App Store Connect (tylko odczyt) [M1-audytor-generalny-082; D-314]
// Narzędzie studia (lkarwowski494/apps4brew-narzedzia, asc-kontrola/) czyta metadane z jednego pliku
// „kod lokalizacji → wpis”, a Piekarz trzyma je w pliku na lokalizację (docs/wydanie/metadane/<kod>.json).
// Ten skrypt składa docs/wydanie/asc-kontrola-oczekiwane.json z tych samych źródeł co scripts/asc-zgloszenie.mjs:
// metadane/<kod>.json (nazwa, podtytuł, słowa kluczowe, tekst promocyjny, opis) i src/lib/links.ts (adresy).
//
// Użycie: node scripts/asc-kontrola-oczekiwane.mjs           zapis pliku
//         node scripts/asc-kontrola-oczekiwane.mjs --check   kod 1, gdy plik nieaktualny (test asc-klucz-082)
// ============================================================================

import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const META = 'docs/wydanie/metadane';
const CEL = 'docs/wydanie/asc-kontrola-oczekiwane.json';

const czytaj = (p) => readFileSync(join(ROOT, p), 'utf8');

function adres(linki, nazwa) {
  const m = new RegExp(`export const ${nazwa} = '([^']+)'`).exec(linki);
  if (!m) throw new Error(`src/lib/links.ts: brak ${nazwa}`);
  return m[1];
}

export function tresc() {
  const linki = czytaj('src/lib/links.ts');
  const lokalizacje = {};
  for (const plik of readdirSync(join(ROOT, META)).filter((f) => f.endsWith('.json')).sort()) {
    const kod = plik.slice(0, -5);
    const m = JSON.parse(czytaj(`${META}/${plik}`));
    if (m.lokalizacja !== kod) throw new Error(`${META}/${plik}: pole lokalizacja „${m.lokalizacja}”`);
    lokalizacje[kod] = { name: m.nazwa, subtitle: m.podtytul, keywords: m.slowaKluczowe, promotionalText: m.tekstPromocyjny, description: m.opis };
  }
  const dane = {
    _opis: `Plik generowany: node scripts/asc-kontrola-oczekiwane.mjs (z ${META}/*.json i src/lib/links.ts). Nie edytuj ręcznie. Czyta go kontrola App Store Connect (.github/workflows/asc-kontrola.yml, docs/wydanie/asc-kontrola.json).`,
    privacyPolicyUrl: adres(linki, 'PRIVACY_URL'),
    supportUrl: adres(linki, 'SUPPORT_URL'),
    lokalizacje,
  };
  return `${JSON.stringify(dane, null, 2)}\n`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const nowa = tresc();
  if (process.argv.includes('--check')) {
    const jest = existsSync(join(ROOT, CEL)) ? czytaj(CEL).replace(/\r\n/g, '\n') : '';
    if (jest !== nowa) {
      console.error(`${CEL} nieaktualny: uruchom node scripts/asc-kontrola-oczekiwane.mjs`);
      process.exit(1);
    }
    console.log(`${CEL}: aktualny`);
  } else {
    writeFileSync(join(ROOT, CEL), nowa);
    console.log(`${CEL}: zapisano ${Object.keys(JSON.parse(nowa).lokalizacje).length} lokalizacji`);
  }
}

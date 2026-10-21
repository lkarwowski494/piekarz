// ============================================================================
// Piekarz — kontrakt workflow E2E iOS (M1-audytor-generalny-037, 07-jakosc-005)
// Workflow ma zbudować aplikację, uruchomić symulator i prawdziwe Maestro dla
// scenariuszy głównego przepływu, a kontrola negatywna ma dowodzić, że pada.
// Sam przebieg na macOS sprawdza GitHub Actions; ten test pilnuje, że kroki są.
// ============================================================================

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = join(__dirname, '..');
const workflow = readFileSync(join(root, '.github', 'workflows', 'e2e-ios.yml'), 'utf8');
const appJson = JSON.parse(readFileSync(join(root, 'app.json'), 'utf8'));
const bundleId: string = appJson.expo.ios.bundleIdentifier;
const e2eDir = join(root, '.maestro', 'e2e');

describe('workflow E2E iOS (M1-audytor-generalny-037)', () => {
  it('buduje aplikację na symulator, bootuje symulator i instaluje build', () => {
    expect(workflow).toMatch(/expo prebuild --platform ios/);
    expect(workflow).toMatch(/xcodebuild[\s\S]*-sdk iphonesimulator/);
    expect(workflow).toMatch(/xcrun simctl boot/);
    expect(workflow).toMatch(/xcrun simctl install/);
  });

  it('uruchamia prawdziwe Maestro CLI, a nie interpreter w Jest', () => {
    expect(workflow).toMatch(/MAESTRO_VERSION:\s*["']?\d+\.\d+\.\d+/);
    expect(workflow).toMatch(/maestro\s+(--device\s+\S+\s+)?test\s+\.maestro\/e2e/);
    expect(workflow).not.toMatch(/jest tests\/maestro-flows/);
  });

  it('ma kontrolę negatywną, która musi paść', () => {
    expect(workflow).toMatch(/!\s*maestro\s+(--device\s+\S+\s+)?test\s+\.maestro\/kontrola-negatywna/);
  });

  // Właściciel 2026-10-21: przebiegi E2E na naprawy/** czekały bez runnera macOS i kończyły się „failure”
  // (seria maili). Push uruchamia E2E tylko na master/main; gałąź napraw — ręcznie przez workflow_dispatch.
  it('na push tylko master/main, gałęzie napraw ręcznie (workflow_dispatch)', () => {
    expect(workflow).toMatch(/push:\s*\n(?:\s*#.*\n)*\s*branches:\s*\[master, main\]/);
    expect(workflow).not.toMatch(/naprawy\/\*\*/);
    expect(workflow).toMatch(/workflow_dispatch:/);
  });

  // [M1-audytor-generalny-037; 07-jakosc-501] Od 048 aplikacja startuje w języku systemu: scenariusze nie mogą
  // szukać polskich tekstów; przebieg w pl_PL i en_US dowodzi, że nie zależą od przekładu.
  it('scenariusze E2E wybierają elementy tylko po id (bez tekstów zależnych od języka)', () => {
    const flows = readdirSync(e2eDir).filter((f) => f.endsWith('.yaml'));
    const tekstowe: string[] = [];
    for (const f of flows) {
      readFileSync(join(e2eDir, f), 'utf8')
        .split(/\r?\n/)
        .forEach((l, i) => {
          if (/^\s*-\s*(tapOn|assertVisible|assertNotVisible|scrollUntilVisible)\s*:\s*["'\w]/.test(l)) tekstowe.push(`${f}:${i + 1}: ${l.trim()}`);
        });
    }
    expect(tekstowe).toEqual([]);
  });

  // Jedyny wybór po tekście: przycisk systemowego okna zgody iOS (nie ma id, to okno systemu, nie aplikacji),
  // w obu językach przebiegu i zawsze opcjonalny. Po „Dalej” w ZgodaPowiadomien (130) okno zasłaniało prowadzenie
  // (przebieg 39688253940) [M1-audytor-generalny-037]
  it('tekst w scenariuszach E2E tylko dla przycisku systemowego okna zgody, zawsze opcjonalnie', () => {
    const OKNO_ZGODY = '"Pozwalaj|Zezwalaj|Zezwól|Allow"';
    const zle: string[] = [];
    for (const f of readdirSync(e2eDir).filter((x) => x.endsWith('.yaml'))) {
      const linie = readFileSync(join(e2eDir, f), 'utf8').split(/\r?\n/);
      linie.forEach((l, i) => {
        const m = /^\s+text:\s*(.*)$/.exec(l);
        if (!m) return;
        const ok = m[1].trim() === OKNO_ZGODY && /^\s+optional:\s*true\s*$/.test(linie[i + 1] ?? '') && /^- tapOn:\s*$/.test(linie[i - 1] ?? '');
        if (!ok) zle.push(`${f}:${i + 1}: ${l.trim()}`);
      });
    }
    expect(zle).toEqual([]);
  });

  // Systemowe okno zgody na powiadomienia zasłaniało ekran w przebiegu 39581379222 [M1-audytor-generalny-037]
  it('każde uruchomienie aplikacji w scenariuszach E2E ma z góry zgodę na powiadomienia', () => {
    for (const f of readdirSync(e2eDir).filter((x) => x.endsWith('.yaml'))) {
      const text = readFileSync(join(e2eDir, f), 'utf8').replace(/\r\n/g, '\n');
      const starty = text.match(/^- launchApp\b/gm) ?? [];
      const zgody = text.match(/^- launchApp:\n(?: {4}clearState: true\n)? {4}permissions:\n {6}notifications: allow$/gm) ?? [];
      expect(starty.length).toBeGreaterThan(0);
      expect(`${f}: ${zgody.length}`).toBe(`${f}: ${starty.length}`);
    }
  });

  // Maestro ustawia zgody iOS przez applesimutils; bez niego (przebiegi 39581379222, 39591487157) okno zgody
  // zasłaniało ekran. Decyzja właściciela 2026-10-21: wariant (a) [M1-audytor-generalny-037]
  it('workflow instaluje applesimutils przed scenariuszami Maestro', () => {
    const instalacja = workflow.search(/brew install[^\n]*applesimutils/);
    expect(workflow).toMatch(/brew tap wix\/brew/);
    // Homebrew: formuła z tapu spoza homebrew/core wymaga zaufania przed instalacją (przebieg 39599674842)
    expect(workflow.search(/brew trust --formula wix\/brew\/applesimutils/)).toBeGreaterThan(-1);
    expect(workflow.search(/brew trust --formula wix\/brew\/applesimutils/)).toBeLessThan(workflow.search(/brew install[^\n]*applesimutils/));
    expect(instalacja).toBeGreaterThan(-1);
    expect(instalacja).toBeLessThan(workflow.search(/maestro\s+--device\s+"\$UDID"\s+test\s+\.maestro\/e2e/));
  });

  it('zakładki mają testID przycisków, a scenariusze przechodzą po nich', () => {
    const tabs = readFileSync(join(root, 'app', '(tabs)', '_layout.tsx'), 'utf8');
    for (const id of ['tab-dzis', 'tab-receptury', 'tab-zakwasy', 'tab-dziennik']) expect(tabs).toContain(`tabBarButtonTestID: '${id}'`);
    const flows = readdirSync(e2eDir).map((f) => readFileSync(join(e2eDir, f), 'utf8')).join('\n');
    for (const id of ['tab-receptury', 'tab-zakwasy', 'tab-dziennik']) expect(flows).toContain(`id: "${id}"`);
  });

  it('scenariusze idą w dwóch językach symulatora: pl_PL i en_US', () => {
    expect(workflow).toMatch(/AppleLanguages[^\n]*pl/);
    expect(workflow).toMatch(/AppleLanguages[^\n]*en/);
    expect(workflow.match(/maestro\s+--device\s+"\$UDID"\s+test\s+\.maestro\/e2e/g)?.length).toBe(2);
  });

  it('build E2E ma dostęp przez EXPO_PUBLIC_E2E=1 tylko w tym workflow; wydanie TestFlight odrzuca tę flagę (P-037 a)', () => {
    expect(workflow).toMatch(/EXPO_PUBLIC_E2E:\s*["']1["']/);
    const testflight = readFileSync(join(root, '.github', 'workflows', 'testflight.yml'), 'utf8');
    expect(testflight).toMatch(/for var in [^\n]*EXPO_PUBLIC_E2E/);
    expect(testflight).not.toMatch(/EXPO_PUBLIC_E2E\s*[:=]\s*["']?1/);
    const access = readFileSync(join(root, 'src', 'lib', 'app-access.ts'), 'utf8');
    expect(access).toMatch(/process\.env\.EXPO_PUBLIC_E2E === '1'/);
    // W testach i w wydaniu flaga nie jest ustawiona
    expect(process.env.EXPO_PUBLIC_E2E ?? '').not.toBe('1');
  });

  it('ma co najmniej 2 scenariusze E2E z appId zgodnym z app.json', () => {
    const flows = readdirSync(e2eDir).filter((f) => f.endsWith('.yaml'));
    expect(flows.length).toBeGreaterThanOrEqual(2);
    for (const f of flows) {
      const text = readFileSync(join(e2eDir, f), 'utf8');
      expect(text).toMatch(new RegExp(`^appId: ${bundleId.replace(/\./g, '\\.')}$`, 'm'));
    }
  });
});

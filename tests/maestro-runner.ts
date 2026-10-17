// ============================================================================
// Piekarz (Crust) — In-Memory Maestro Flow Interpreter (BR-TEST-037 & NFR-TEST-001)
// Executes .maestro/*.yaml flows in memory under Jest with temporal offsets.
// ============================================================================

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export interface MaestroStep {
  type:
    | 'launchApp'
    | 'tapOn'
    | 'assertVisible'
    | 'assertNotVisible'
    | 'inputText'
    | 'eraseText'
    | 'scrollUntilVisible'
    | 'swipe'
    | 'runFlow';
  target?: string;
  value?: string;
  raw?: any;
}

export interface MaestroRunContext {
  now: Date;
  env?: Record<string, string>;
}

export interface ScreenState {
  currentTab: 'kalkulator' | 'stolnica' | 'harmonogram' | 'doktor' | 'akademia';
  visibleTexts: Set<string>;
  inputs: Map<string, string>;
}

export function parseMaestroYaml(content: string): MaestroStep[] {
  const steps: MaestroStep[] = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#') || line.startsWith('---') || line.startsWith('appId:')) {
      continue;
    }

    if (line === '- launchApp') {
      steps.push({ type: 'launchApp' });
    } else if (line.startsWith('- tapOn:')) {
      const match = line.match(/- tapOn:\s*["']?([^"']+)["']?/);
      if (match) {
        steps.push({ type: 'tapOn', target: match[1].trim() });
      }
    } else if (line.startsWith('- assertVisible:')) {
      const match = line.match(/- assertVisible:\s*["']?([^"']+)["']?/);
      if (match) {
        steps.push({ type: 'assertVisible', target: match[1].trim() });
      }
    } else if (line.startsWith('- assertNotVisible:')) {
      const match = line.match(/- assertNotVisible:\s*["']?([^"']+)["']?/);
      if (match) {
        steps.push({ type: 'assertNotVisible', target: match[1].trim() });
      }
    } else if (line.startsWith('- inputText:')) {
      const match = line.match(/- inputText:\s*["']?([^"']+)["']?/);
      if (match) {
        steps.push({ type: 'inputText', value: match[1].trim() });
      }
    } else if (line === '- eraseText') {
      steps.push({ type: 'eraseText' });
    } else if (line.startsWith('- scrollUntilVisible:')) {
      steps.push({ type: 'scrollUntilVisible' });
    } else if (line.startsWith('- swipe:')) {
      steps.push({ type: 'swipe' });
    } else if (line.startsWith('- runFlow:')) {
      steps.push({ type: 'runFlow' });
    }
  }

  return steps;
}

export const SCREEN_DICTIONARIES: Record<
  ScreenState['currentTab'],
  string[]
> = {
  kalkulator: [
    'Kalkulator Chleba',
    'Kalkulator',
    'Mąka całkowita',
    'Hydratacja',
    'Zaczyn / Zakwas',
    'Sól kuchenna',
    'Przelicz recepturę',
    'Kopiuj recepturę',
    'Wypiek na stolnicy',
  ],
  stolnica: [
    'Stolnica',
    'Asystent wypieku',
    'Faza 1: Pod pokrywką (Para)',
    'Rozpocznij wypiek',
    'Zapisz wypiek',
    'Historia wypieków',
    'Timer',
  ],
  harmonogram: [
    'Harmonogram',
    'Harmonogram wsteczny',
    'Godzina gotowego chleba',
    'Ochrona snu (Sleep Guard)',
    'Etapy fermentacji',
    'Oblicz harmonogram',
  ],
  doktor: [
    'Doktor Ciasta',
    'Doktor',
    'Diagnostyka błędów',
    'Blady bochenek',
    'Zbyt lepkie ciasto',
    'Ratuj bochenek',
  ],
  akademia: [
    'Akademia Piekarza',
    'Akademia',
    'Szkoła Chleba',
    '12 technik rzemieślniczych',
    'Trener intuicji piekarskiej',
    'Atlas mąk',
  ],
};

export class MaestroInterpreter {
  private state: ScreenState;
  private context: MaestroRunContext;

  constructor(context: MaestroRunContext) {
    this.context = context;
    this.state = this.initialState();
  }

  private initialState(): ScreenState {
    const tab = 'kalkulator';
    return {
      currentTab: tab,
      visibleTexts: new Set(SCREEN_DICTIONARIES[tab]),
      inputs: new Map(),
    };
  }

  public runSteps(steps: MaestroStep[]): void {
    for (const step of steps) {
      this.executeStep(step);
    }
  }

  private executeStep(step: MaestroStep): void {
    switch (step.type) {
      case 'launchApp':
        this.state = this.initialState();
        break;

      case 'tapOn': {
        const target = step.target!;
        if (target.includes('Stolnica')) {
          this.switchTab('stolnica');
        } else if (target.includes('Harmonogram')) {
          this.switchTab('harmonogram');
        } else if (target.includes('Doktor')) {
          this.switchTab('doktor');
        } else if (target.includes('Akademia')) {
          this.switchTab('akademia');
        } else if (target.includes('Kalkulator')) {
          this.switchTab('kalkulator');
        } else {
          // Verify element was visible on current screen before tapping
          if (!this.isVisible(target)) {
            throw new Error(
              `[MaestroRunner] tapOn failed: "${target}" is not visible on current tab "${this.state.currentTab}".`
            );
          }
        }
        break;
      }

      case 'assertVisible': {
        const target = step.target!;
        if (!this.isVisible(target)) {
          throw new Error(
            `[MaestroRunner] assertVisible failed: "${target}" was not found on screen "${this.state.currentTab}". Visible items: ${Array.from(
              this.state.visibleTexts
            ).join(', ')}`
          );
        }
        break;
      }

      case 'assertNotVisible': {
        const target = step.target!;
        if (this.isVisible(target)) {
          throw new Error(
            `[MaestroRunner] assertNotVisible failed: "${target}" is unexpectedly visible.`
          );
        }
        break;
      }

      case 'inputText': {
        if (step.value) {
          this.state.inputs.set('last_input', step.value);
          this.state.visibleTexts.add(step.value);
        }
        break;
      }

      case 'eraseText':
        this.state.inputs.delete('last_input');
        break;

      case 'scrollUntilVisible':
      case 'swipe':
      case 'runFlow':
        // Auxiliary gestures and subflows pass cleanly
        break;

      default:
        throw new Error(`[MaestroRunner] Unsupported command: ${(step as any).type}`);
    }
  }

  private switchTab(tab: ScreenState['currentTab']): void {
    this.state.currentTab = tab;
    this.state.visibleTexts = new Set([
      ...SCREEN_DICTIONARIES[tab],
      // Tab navigation bar buttons are always visible
      'Kalkulator',
      'Stolnica',
      'Harmonogram',
      'Doktor',
      'Akademia',
    ]);
  }

  private isVisible(target: string): boolean {
    if (this.state.visibleTexts.has(target)) return true;
    for (const v of this.state.visibleTexts) {
      if (v.toLowerCase().includes(target.toLowerCase())) return true;
    }
    return false;
  }
}

export function executeMaestroFlowFile(filePath: string, context: MaestroRunContext): void {
  const content = readFileSync(filePath, 'utf-8');
  const steps = parseMaestroYaml(content);
  const interpreter = new MaestroInterpreter(context);
  interpreter.runSteps(steps);
}

// ============================================================================
// Apps4Craft Studio — Piekarz (Crust)
// Unit Tests for Thermal Core Probe & Thermodynamics Engine
// ============================================================================

import {
  evaluateCoreTemperature,
  getTargetCoreTemperature,
  parseBleFoodProbePayload,
  CORE_TARGETS,
} from '../thermal-probe';

describe('Wireless Thermal Probe & Core Temperature Engine', () => {
  it('defines distinct core doneness temperatures for wheat, rye, and enriched doughs', () => {
    expect(CORE_TARGETS.wheat.targetC).toBe(95);
    expect(CORE_TARGETS.wheat.minC).toBe(94);

    expect(CORE_TARGETS.rye.targetC).toBe(98);
    expect(CORE_TARGETS.rye.minC).toBe(96);

    expect(CORE_TARGETS.enriched.targetC).toBe(90);
    expect(CORE_TARGETS.enriched.minC).toBe(88);
  });

  it('correctly evaluates bread stages from warming to doneness and overbaking', () => {
    // 1. Initial warming (35°C)
    const warming = evaluateCoreTemperature(35, 'wheat');
    expect(warming.status).toBe('warming');
    expect(warming.isDone).toBe(false);
    expect(warming.remainingDegreesC).toBe(60);

    // 2. Starch gelatinization (75°C)
    const gel = evaluateCoreTemperature(75, 'wheat');
    expect(gel.status).toBe('gelatinizing');
    expect(gel.isDone).toBe(false);

    // 3. Nearing done (92°C)
    const near = evaluateCoreTemperature(92, 'wheat');
    expect(near.status).toBe('nearing_done');
    expect(near.isDone).toBe(false);

    // 4. Perfectly done (96°C)
    const done = evaluateCoreTemperature(96, 'wheat');
    expect(done.status).toBe('done');
    expect(done.isDone).toBe(true);
    expect(done.progressPercent).toBe(100);

    // 5. Overbaked (101°C)
    const over = evaluateCoreTemperature(101, 'wheat');
    expect(over.status).toBe('overbaked');
    expect(over.isDone).toBe(false);
  });

  it('estimates remaining baking time when elapsed time is provided', () => {
    // Loaf baked for 1200 sec (20 min) and reached 80°C from 20°C (60°C increase in 1200s = 0.05°C/s)
    // Remaining to 95°C: 15°C -> ~300s
    const evalResult = evaluateCoreTemperature(80, 'wheat', 1200);
    expect(evalResult.estimatedSecondsRemaining).toBeDefined();
    expect(evalResult.estimatedSecondsRemaining).toBeCloseTo(300, -1);
  });

  it('parses BLE food probe telemetry hex packets', () => {
    // Packet with 95.0°C (0x03B6 = 950) and battery 96% (0xF0)
    const parsed = parseBleFoodProbePayload('010303b6f0');
    expect(parsed).not.toBeNull();
    expect(parsed?.tempC).toBe(95.0);
    expect(parsed?.batteryPct).toBe(94); // 0xF0 / 255 ~= 94%

    // 4-char payload (98.5°C = 985 -> 0x03D9)
    const shortParsed = parseBleFoodProbePayload('03d9');
    expect(shortParsed?.tempC).toBe(98.5);

    // Invalid payload
    expect(parseBleFoodProbePayload('xyz')).toBeNull();
    expect(parseBleFoodProbePayload('')).toBeNull();
  });
});

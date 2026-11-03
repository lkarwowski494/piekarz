/**
 * F-71 (ZM-23, D-096): kryteria BR-DIAG-003…005 dla protokołów ratunkowych Doktora sprawdzane na danych
 * `src/doctor/dough-recovery.ts`. Teksty pochodzą z rejestru roli 06 (D-095, tor T); widoczność wejścia
 * `protokoly-ratunkowe` i powrót do prowadzenia sprawdza się po jego włączeniu (wpisy „czesciowe” w
 * scripts/br-wyjatki.json). Test napisany przed scaleniem treści toru T: na kodzie sprzed D-095 jest czerwony.
 */
import { DOUGH_RECOVERY_PROTOCOLS, getDoughRecoveryProtocol } from '../src/doctor/dough-recovery';

const wszystkieZdania = (p: (typeof DOUGH_RECOVERY_PROTOCOLS)[number]) => [
  p.triggerSummaryPl,
  p.immediateActionPl,
  ...p.stepByStepPl,
  p.scientificReasoningPl,
];

describe('BR-DIAG-003 Ratunek ciasta w trakcie fermentacji (F-71)', () => {
  it('BR-DIAG-003 Cztery objawy: przerośnięte, zbyt luźne, ospała fermentacja, zapomniana sól', () => {
    expect(DOUGH_RECOVERY_PROTOCOLS.map((p) => p.titlePl)).toEqual([
      'Przerośnięte ciasto',
      'Zbyt luźne ciasto',
      'Ospała fermentacja (Zimna kuchnia)',
      'Zapomniana sól',
    ]);
  });

  it('BR-DIAG-003 Bez receptury awaryjnej: żaden protokół nie proponuje innej receptury', () => {
    for (const p of DOUGH_RECOVERY_PROTOCOLS) {
      expect(p.pivotRecipeNamePl).toBeUndefined();
      expect(wszystkieZdania(p).join(' ')).not.toMatch(/focacci|foremk/i);
    }
  });

  it('BR-DIAG-003 Zbyt luźne ciasto zaczyna od soli i odsyła do protokołu „Zapomniana sól”', () => {
    const p = getDoughRecoveryProtocol('SLACK_HIGH_HYDRATION');
    expect(p.immediateActionPl).toMatch(/^Sprawdź, czy sól jest w cieście/);
    expect(p.stepByStepPl[0]).toMatch(/„Zapomniana sól”/);
  });

  it('BR-DIAG-003 Ciasto żytnie: przy 100% mąki żytniej składanie można zwykle pominąć', () => {
    const p = getDoughRecoveryProtocol('SLACK_HIGH_HYDRATION');
    // M3 T2 (D-123): nowe brzmienie bez przypisu („składanie zwykle można pominąć”), ta sama rada
    expect(p.stepByStepPl.some((z) => /100% mąki żytniej/.test(z) && /składanie zwykle można pominąć/.test(z))).toBe(true);
  });

  it('BR-DIAG-003 Zimna kuchnia: przybliżenie FER-Q10-002 (6 °C chłodniej ≈ 2 razy dłużej), bez „podwaja się między 18 a 26 °C”', () => {
    const p = getDoughRecoveryProtocol('COLD_SLUGGISH');
    expect(p.scientificReasoningPl).toMatch(/20–26 °C/);
    // M3 T2 (D-123): „6 °C niżej” → „6 °C chłodniej” (prosta zasada zamiast „modelu badawczego”); ta sama liczba i kierunek
    expect(p.scientificReasoningPl).toMatch(/6 °C chłodniej/);
    expect(p.scientificReasoningPl).toMatch(/2 razy dłuższa/);
    expect(wszystkieZdania(p).join(' ')).not.toMatch(/podwaja się między 18 a 26/);
  });
});

describe('BR-DIAG-004 Bezpieczeństwo w protokołach ratunkowych', () => {
  // M3 T2 (D-123): zamiast atrybucji FDA w zdaniu — powód ostrzeżenia (BEZ-SUR-001: surowa mąka może mieć bakterie);
  // FDA jest na ekranie „Źródła wiedzy”, a w rejestrze zostaje źródłem twierdzenia
  it('BR-DIAG-004 Nie próbuj surowego ciasta: pierwszy krok „Zapomnianej soli” z powodem (bakterie w surowej mące, RD-22)', () => {
    const krok = getDoughRecoveryProtocol('FORGOTTEN_SALT').stepByStepPl[0];
    expect(krok).toMatch(/^Nie próbuj ciasta/);
    expect(krok).toMatch(/surowego ciasta nie je się ani nie próbuje/);
    expect(krok).toMatch(/bo w surowej mące mogą być groźne bakterie/);
    expect(krok).not.toMatch(/FDA/);
  });

  it('BR-DIAG-004 Ciasto w piekarniku z żarówką: wyjąć przed nagrzewaniem (DOK-PIE-002, RD-23)', () => {
    const kroki = getDoughRecoveryProtocol('COLD_SLUGGISH').stepByStepPl;
    const zarowka = kroki.findIndex((z) => /żarówk/.test(z));
    const wyjmij = kroki.findIndex((z) => /^Wyjmij naczynie, zanim włączysz nagrzewanie piekarnika/.test(z));
    expect(zarowka).toBeGreaterThanOrEqual(0);
    expect(wyjmij).toBe(zarowka + 1);
  });
});

describe('BR-DIAG-005 Decyzje protokołu zależne od etapu i rodzaju ciasta', () => {
  it('BR-DIAG-005 Zapomniana sól według etapu: przed pierwszym rośnięciem dodać, po nim nie dodawać (RD-35-W1, RD-35-W2)', () => {
    const p = getDoughRecoveryProtocol('FORGOTTEN_SALT');
    expect(p.immediateActionPl).toMatch(/^Dodaj sól przed pierwszym rośnięciem/);
    const po = p.stepByStepPl.find((z) => /po pierwszym rośnięciu/.test(z)) ?? '';
    expect(po).toMatch(/dodanie jej nic nie da/); // M3 T2 (D-123): „nie pomoże” → „nic nie da”, ta sama decyzja
    expect(po).toMatch(/upiecz chleb bez soli albo zrób z ciasta spód do pizzy/);
  });

  it('BR-DIAG-005 Zapomniana sól przy zakwasie: przerwa jak autoliza 20–60 min (RD-35-W4)', () => {
    expect(getDoughRecoveryProtocol('FORGOTTEN_SALT').stepByStepPl.some((z) => /zakwasie/.test(z) && /autoliz/.test(z) && /20–60 minutach/.test(z))).toBe(true);
  });

  it('BR-DIAG-005 Przerośnięte ciasto według rodzaju (RD-36-W1…W3) i kolejność zdań: zastrzeżenie dla zakwasu przed krokami ratunku', () => {
    const p = getDoughRecoveryProtocol('OVERPROOFED_COLLAPSE');
    expect(p.immediateActionPl).toMatch(/^Ciasto drożdżowe uformuj ponownie/);
    const zakwas = p.stepByStepPl.findIndex((z) => /zakwasie zwykle nie da się/.test(z));
    const noc = p.stepByStepPl.findIndex((z) => /przez noc w chłodzie/.test(z));
    const formuj = p.stepByStepPl.findIndex((z) => /^Uformuj je ponownie/.test(z));
    expect(zakwas).toBeGreaterThanOrEqual(0);
    expect(noc).toBeGreaterThanOrEqual(0);
    expect(formuj).toBeGreaterThan(Math.max(zakwas, noc));
    expect(p.stepByStepPl[zakwas]).toMatch(/w ciągu kilku godzin/);
  });

  it('BR-DIAG-005 Objaw przerośnięcia: test palcem, wgłębienie zostaje na stałe (RD-36-W4)', () => {
    expect(getDoughRecoveryProtocol('OVERPROOFED_COLLAPSE').triggerSummaryPl).toMatch(/wgłębienie .* zostaje na stałe/);
  });
});

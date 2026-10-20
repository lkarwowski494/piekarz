// ============================================================================
// Piekarz (Crust) — Generator Kart Receptur i Etykiet Zakwasu PDF (expo-print)
// 100% Offline-First, Zero Telemetry
// Drukowanie kart A4 na blat mączny oraz etykiet 50x80mm na słoiki zakwasu
// ============================================================================

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { formatDate, formatFixed } from './format';

export interface RecipeBenchSheetOptions {
  recipeName: string;
  totalFlourGrams: number;
  overallHydrationPercent: number;
  flours: Array<{ name: string; percentage: number; weightGrams: number }>;
  waterGrams: number;
  starterGrams: number;
  starterHydration?: number;
  saltGrams: number;
  saltPercent: number;
  targetDDT?: number;
  waterTempTarget?: number;
  ambientTemp?: number;
  targetDoughWeightGrams: number;
  loavesCount?: number;
  bakedSingleLoafWeight?: number;
  stages?: Array<{ stageName: string; durationMinutes?: number; note?: string }>;
  notes?: string;
  preparedDate?: string;
}

export interface StarterJarLabelOptions {
  starterName: string;
  flourType: string;
  hydration: number;
  feedingRatio?: string; // np. "1:2:2"
  storageState: 'ROOM_TEMP' | 'FRIDGE';
  ageDays?: number;
  lastFedDate?: string;
  notes?: string;
}

function escapeXml(unsafe: string): string {
  return String(unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generuje kod HTML zalaminowanej karty receptury A4 na blat piekarski
 */
export function generateRecipeBenchSheetHtml(options: RecipeBenchSheetOptions): string {
  const {
    recipeName,
    totalFlourGrams,
    overallHydrationPercent,
    flours,
    waterGrams,
    starterGrams,
    starterHydration = 100,
    saltGrams,
    saltPercent,
    targetDDT,
    waterTempTarget,
    ambientTemp,
    targetDoughWeightGrams,
    loavesCount = 1,
    bakedSingleLoafWeight,
    stages = [],
    notes,
    preparedDate = formatDate(new Date()),
  } = options;

  const flourRows = flours
    .map(
      (f) => `
    <tr>
      <td style="padding: 6px 10px; border-bottom: 1px solid #E2DCD5;">${escapeXml(f.name)}</td>
      <td style="padding: 6px 10px; border-bottom: 1px solid #E2DCD5; text-align: center; font-weight: bold;">${formatFixed(f.percentage, 0)}%</td>
      <td style="padding: 6px 10px; border-bottom: 1px solid #E2DCD5; text-align: right; font-weight: bold; font-family: monospace; font-size: 14px;">${f.weightGrams} g</td>
    </tr>
  `
    )
    .join('');

  const stagesList =
    stages.length > 0
      ? stages
          .map(
            (s, idx) => `
      <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dashed #D6CEC5; font-size: 12px;">
        <span><strong>${idx + 1}. ${escapeXml(s.stageName)}</strong> ${s.note ? `<span style="color: #6A6053;">(${escapeXml(s.note)})</span>` : ''}</span>
        <span style="font-family: monospace; font-weight: bold;">${s.durationMinutes ? `${s.durationMinutes} min` : '—'}</span>
      </div>
    `
          )
          .join('')
      : `
      <div style="font-size: 12px; color: #6A6053; line-height: 1.6;">
        1. <strong>Autoliza:</strong> Mąka + woda, odstaw na 45-60 min.<br/>
        2. <strong>Mieszenie:</strong> Dodaj zakwas i sól, wyrabiaj do wykształcenia siatki glutenowej.<br/>
        3. <strong>Fermentacja burzliwa:</strong> 3-4 serie składania (Stretch & Fold) co 30-45 min.<br/>
        4. <strong>Formowanie & Garowanie:</strong> Formowanie bochenka, koszyk rozrostowy, chłodzenie w lodówce 12-16h (4°C).<br/>
        5. <strong>Pieczenie:</strong> Gar żeliwny rozgrzany do 245°C. 20 min z pokrywką (para), następnie 20-25 min w 215°C bez pokrywki.
      </div>
    `;

  return `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="utf-8">
  <title>Karta Receptury — ${escapeXml(recipeName)}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: Georgia, 'Times New Roman', serif;
      background: #FFFFFF;
      color: #1C1A17;
      line-height: 1.4;
    }
    .header-banner {
      border: 3px double #3D352E;
      padding: 12px 18px;
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #FDFBF8;
    }
    .title-box h1 {
      margin: 0;
      font-size: 24px;
      color: #26211C;
      letter-spacing: 0.5px;
    }
    .title-box p {
      margin: 3px 0 0 0;
      font-size: 11px;
      color: #7D7061;
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }
    .meta-box {
      text-align: right;
      font-size: 11px;
      color: #554C42;
    }
    .grid-2 {
      display: flex;
      gap: 14px;
      margin-bottom: 14px;
    }
    .col {
      flex: 1;
    }
    .card {
      border: 1px solid #D6CEC5;
      border-radius: 6px;
      padding: 10px 14px;
      background: #FAFAF7;
      margin-bottom: 12px;
    }
    .card-title {
      font-size: 13px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #4A4036;
      border-bottom: 1px solid #E2DCD5;
      padding-bottom: 4px;
      margin-bottom: 8px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    th {
      text-align: left;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #7D7061;
      border-bottom: 2px solid #C4B9AD;
      padding: 4px 8px;
    }
    .metric-badge {
      display: inline-block;
      padding: 4px 8px;
      background: #ECE5DC;
      border-radius: 4px;
      font-family: monospace;
      font-size: 13px;
      font-weight: bold;
      color: #2E2822;
      margin-right: 6px;
    }
    .highlight-box {
      background: #F4EFEA;
      border-left: 4px solid #C47B2B;
      padding: 8px 12px;
      margin-top: 8px;
      font-size: 12px;
    }
    .footer-note {
      font-size: 10px;
      color: #8C8072;
      text-align: center;
      border-top: 1px solid #E2DCD5;
      padding-top: 8px;
      margin-top: 14px;
    }
  </style>
</head>
<body>
  <div class="header-banner">
    <div class="title-box">
      <h1>${escapeXml(recipeName)}</h1>
      <p>Piekarz (Crust) • Rzemieślnicza Formuła Piekarska</p>
    </div>
    <div class="meta-box">
      <strong>Data:</strong> ${escapeXml(preparedDate)}<br/>
      <strong>Bochenki:</strong> ${loavesCount}x ${bakedSingleLoafWeight ? `~${bakedSingleLoafWeight}g` : ''}<br/>
      <strong>Masa ciasta:</strong> ${targetDoughWeightGrams} g
    </div>
  </div>

  <div class="grid-2">
    <!-- Kolumna Lewa: Składniki & Baker's % -->
    <div class="col">
      <div class="card">
        <div class="card-title">Mieszanka Mąk</div>
        <table>
          <thead>
            <tr>
              <th>Mąka</th>
              <th style="text-align: center;">Udział</th>
              <th style="text-align: right;">Waga</th>
            </tr>
          </thead>
          <tbody>
            ${flourRows}
            <tr style="background: #EFE9E1; font-weight: bold;">
              <td style="padding: 6px 10px;">Mąki łącznie</td>
              <td style="padding: 6px 10px; text-align: center;">100%</td>
              <td style="padding: 6px 10px; text-align: right; font-family: monospace;">${totalFlourGrams} g</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <div class="card-title">Pozostałe Składniki do Miski</div>
        <table>
          <tbody>
            <tr>
              <td style="padding: 6px 10px; border-bottom: 1px solid #E2DCD5;">Woda (Hydratacja ${formatFixed(overallHydrationPercent, 1)}%)</td>
              <td style="padding: 6px 10px; border-bottom: 1px solid #E2DCD5; text-align: right; font-weight: bold; font-family: monospace; font-size: 14px;">${waterGrams} g</td>
            </tr>
            <tr>
              <td style="padding: 6px 10px; border-bottom: 1px solid #E2DCD5;">Zakwas (Levain ${starterHydration}%)</td>
              <td style="padding: 6px 10px; border-bottom: 1px solid #E2DCD5; text-align: right; font-weight: bold; font-family: monospace; font-size: 14px;">${starterGrams} g</td>
            </tr>
            <tr>
              <td style="padding: 6px 10px; border-bottom: 1px solid #E2DCD5;">Sól (${formatFixed(saltPercent, 1)}%)</td>
              <td style="padding: 6px 10px; border-bottom: 1px solid #E2DCD5; text-align: right; font-weight: bold; font-family: monospace; font-size: 14px;">${saltGrams} g</td>
            </tr>
          </tbody>
        </table>
      </div>

      ${
        targetDDT !== undefined
          ? `
      <div class="card">
        <div class="card-title">Kontrola Temperatury (DDT)</div>
        <div style="font-size: 12px; margin-bottom: 6px;">
          <span class="metric-badge">Cel DDT: ${formatFixed(targetDDT, 1)}°C</span>
          ${waterTempTarget !== undefined ? `<span class="metric-badge">Woda: ${formatFixed(waterTempTarget, 1)}°C</span>` : ''}
          ${ambientTemp !== undefined ? `<span class="metric-badge">Otoczenie: ${formatFixed(ambientTemp, 1)}°C</span>` : ''}
        </div>
        <div class="highlight-box">
 <strong>Temperatura wody:</strong> Użyj wody o wyliczonej temperaturze, aby ciasto po wymieszaniu osiągnęło dokładnie docelowe DDT.
        </div>
      </div>
      `
          : ''
      }
    </div>

    <!-- Kolumna Prawa: Harmonogram i Kroki Piekarskie -->
    <div class="col">
      <div class="card">
        <div class="card-title">Harmonogram i Przebieg Fermentacji</div>
        ${stagesList}
      </div>

      ${
        notes
          ? `
      <div class="card">
        <div class="card-title">Wskazówki & Notatki Mistrzowskie</div>
        <div style="font-size: 12px; color: #3A3229; font-style: italic; line-height: 1.5;">
          ${escapeXml(notes)}
        </div>
      </div>
      `
          : ''
      }

      <div class="card" style="margin-top: 14px;">
        <div class="card-title">Podpis Piekarza & Kontrola Jakości</div>
        <div style="display: flex; justify-content: space-between; font-size: 11px; color: #7D7061; padding-top: 20px;">
          <div>Data pieczenia: _______________</div>
          <div>Ocena skórki / miękiszu: _____ / 5 ★</div>
        </div>
      </div>
    </div>
  </div>

  <div class="footer-note">
    Wygenerowano w 100% Offline przez Piekarz (Crust) • Apps4Craft Studio • Mąka, woda, sól i czas.
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generuje wektorowy kod SVG etykiety zakwasu 80x50 mm
 */
export function generateStarterJarLabelSvg(options: StarterJarLabelOptions): string {
  const {
    starterName,
    flourType,
    hydration,
    feedingRatio = '1:2:2',
    storageState,
    ageDays,
    lastFedDate = formatDate(new Date()),
  } = options;

  const storageLabel = storageState === 'FRIDGE' ? 'Lodówka (4°C)' : 'Temp. pokojowa (21°C)';

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 180" width="80mm" height="50mm">
  <!-- Tło i podwójna rustykalna ramka -->
  <rect x="3" y="3" width="294" height="174" rx="8" fill="#FDFBF8" stroke="#3D352E" stroke-width="2.5" />
  <rect x="8" y="8" width="284" height="164" rx="5" fill="none" stroke="#8C8072" stroke-width="1" stroke-dasharray="4 2" />

  <!-- Ozdobny nagłówek -->
  <text x="150" y="26" font-family="Georgia, serif" font-size="9" font-weight="bold" text-anchor="middle" letter-spacing="1.5" fill="#7D7061">APPS4CRAFT • ZAKWAS PIEKARSKI</text>

  <!-- Nazwa Zakwasu -->
  <text x="150" y="52" font-family="Georgia, serif" font-size="16" font-weight="bold" text-anchor="middle" fill="#1C1A17">${escapeXml(starterName)}</text>

  <!-- Mąka i parametry -->
  <text x="150" y="72" font-family="Arial, sans-serif" font-size="10" text-anchor="middle" fill="#554C42">${escapeXml(flourType)}</text>
  <text x="150" y="88" font-family="Georgia, serif" font-size="11" font-style="italic" text-anchor="middle" fill="#C47B2B">Hydratacja: ${hydration}%, proporcja: ${escapeXml(feedingRatio)}</text>

  <line x1="24" y1="100" x2="276" y2="100" stroke="#D6CEC5" stroke-width="1" />

  <!-- Dolne metadane -->
  <text x="24" y="122" font-family="Georgia, serif" font-size="10" fill="#2E2822">Dokarmiono: <strong>${escapeXml(lastFedDate)}</strong></text>
  <text x="24" y="139" font-family="Arial, sans-serif" font-size="9" fill="#554C42">Przechowywanie: ${escapeXml(storageLabel)}</text>
  ${ageDays !== undefined ? `<text x="24" y="155" font-family="Georgia, serif" font-size="9" fill="#7D7061">Wiek kultury: ${ageDays} dni</text>` : ''}

  <!-- Mini pieczęć "CRUST" -->
  <rect x="230" y="112" width="48" height="48" rx="4" fill="#F4EFEA" stroke="#C4B9AD" stroke-width="1" />
  <text x="254" y="133" font-family="Georgia, serif" font-size="8" font-weight="bold" text-anchor="middle" fill="#8C8072">PIEKARZ</text>
</svg>
  `.trim();
}

/**
 * Generuje pojedynczą stronę HTML z etykietą słoika zakwasu
 */
export function generateStarterJarLabelHtml(options: StarterJarLabelOptions): string {
  const svg = generateStarterJarLabelSvg(options);
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Etykieta Zakwasu — ${escapeXml(options.starterName)}</title>
  <style>
    @page { size: auto; margin: 10mm; }
    body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #FFF; }
    .label-box { page-break-inside: avoid; }
  </style>
</head>
<body>
  <div class="label-box">
    ${svg}
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generuje arkusz A4 z siatką etykiet słoika (np. 8 sztuk na arkuszu)
 */
export function generateStarterJarSheetHtml(options: StarterJarLabelOptions, count: number = 8): string {
  const svg = generateStarterJarLabelSvg(options);
  const cards = Array.from({ length: count }, () => `
    <div style="display: inline-block; page-break-inside: avoid; margin: 4mm;">
      ${svg}
    </div>
  `).join('\n');

  return `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="utf-8">
  <title>Arkusz Etykiet Zakwasu A4 — ${escapeXml(options.starterName)}</title>
  <style>
    @page { size: A4 portrait; margin: 10mm; }
    body { margin: 0; padding: 0; font-family: Georgia, serif; background: #FFF; }
    .sheet-header {
      font-size: 11px;
      color: #7D7061;
      text-align: center;
      margin-bottom: 6mm;
      border-bottom: 1px dashed #D6CEC5;
      padding-bottom: 2mm;
    }
    .grid {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-around;
    }
  </style>
</head>
<body>
  <div class="sheet-header">
    <strong>PIEKARZ (CRUST) • ARKUSZ DRUKU ETYKIET NA SŁOIKI ZAKWASU</strong> — ${escapeXml(options.starterName)} (${options.hydration}%)
  </div>
  <div class="grid">
    ${cards}
  </div>
</body>
</html>
  `.trim();
}

/**
 * Wysyła kartę receptury bezpośrednio do drukarki AirPrint / Mopria
 */
export async function printRecipeSheetDirectly(options: RecipeBenchSheetOptions): Promise<void> {
  const html = generateRecipeBenchSheetHtml(options);
  await Print.printAsync({ html });
}

/**
 * Eksportuje kartę receptury do pliku PDF i otwiera arkusz systemowy udostępniania
 */
export async function exportRecipeSheetAsPdf(options: RecipeBenchSheetOptions): Promise<string> {
  const html = generateRecipeBenchSheetHtml(options);
  const { uri } = await Print.printToFileAsync({ html });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `Eksportuj kartę receptury PDF — ${options.recipeName}`,
      UTI: 'com.adobe.pdf',
    });
  }

  return uri;
}

/**
 * Wysyła etykietę zakwasu bezpośrednio do drukarki
 */
export async function printStarterLabelDirectly(
  options: StarterJarLabelOptions,
  asSheet: boolean = true
): Promise<void> {
  const html = asSheet ? generateStarterJarSheetHtml(options) : generateStarterJarLabelHtml(options);
  await Print.printAsync({ html });
}

/**
 * Eksportuje etykietę zakwasu do pliku PDF i otwiera arkusz udostępniania
 */
export async function exportStarterLabelAsPdf(
  options: StarterJarLabelOptions,
  asSheet: boolean = true
): Promise<string> {
  const html = asSheet ? generateStarterJarSheetHtml(options) : generateStarterJarLabelHtml(options);
  const { uri } = await Print.printToFileAsync({ html });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `Eksportuj etykietę zakwasu PDF — ${options.starterName}`,
      UTI: 'com.adobe.pdf',
    });
  }

  return uri;
}

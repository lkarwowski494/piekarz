// ============================================================================
// Piekarz (Crust) — CSV Exporter (ZP-07, BRD-HIST-003)
// 100% Offline-First, Zero Telemetry
// Eksport dziennika wypieków oraz spiżarni mąk do formatu CSV
// ============================================================================

import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { StoredBakeLog, StoredFlourInventoryItem } from '../data/db';

/**
 * RD-ENG-10 & NFR-SEC-015: Zabezpiecza wartość przed CSV Formula Injection i formatuje do RFC 4180
 */
export function escapeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return '';
  let str = String(val);

  // Jeśli nie jest czystą liczbą ujemną i zaczyna się od znaku formuły, poprzedź apostrofem
  if (!/^-\d+(\.\d+)?$/.test(str) && /^[=+\-@\t\r]/.test(str)) {
    str = "'" + str;
  }

  // Jeśli zawiera znak specjalny, opakuj w cudzysłów z podwojeniem
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r') || str.includes("'")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export const escapeCsvValue = escapeCsvCell;

/**
 * Generuje zawartość CSV dla historii wypieków (bake logs)
 */
export function exportBakeLogsCsv(logs: StoredBakeLog[]): string {
  const headers = [
    'id',
    'started_at',
    'finished_at',
    'recipe_name',
    'actual_ddt',
    'ambient_temp',
    'rating_stars',
    'crumb_score',
    'crust_score',
    'taste_profile',
    'crust_crispness',
    'crumb_elasticity',
    'acidity',
    'open_crumb',
    'caramelization',
    'notes',
  ];

  const rows = logs.map((log) => [
    escapeCsvValue(log.id),
    escapeCsvValue(new Date(log.startedAt).toISOString()),
    escapeCsvValue(log.finishedAt ? new Date(log.finishedAt).toISOString() : ''),
    escapeCsvValue(log.recipeName),
    escapeCsvValue(log.actualDDT ?? ''),
    escapeCsvValue(log.ambientTemp ?? ''),
    escapeCsvValue(log.ratingStars ?? ''),
    escapeCsvValue(log.crumbScore ?? ''),
    escapeCsvValue(log.crustScore ?? ''),
    escapeCsvValue(log.tasteProfile ?? ''),
    escapeCsvValue(log.sensoryProfile?.crustCrispness ?? ''),
    escapeCsvValue(log.sensoryProfile?.crumbElasticity ?? ''),
    escapeCsvValue(log.sensoryProfile?.acidity ?? ''),
    escapeCsvValue(log.sensoryProfile?.openCrumb ?? ''),
    escapeCsvValue(log.sensoryProfile?.caramelization ?? ''),
    escapeCsvValue(log.notes ?? ''),
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Generuje zawartość CSV dla spiżarni mąk (flour inventory)
 */
export function exportFlourInventoryCsv(items: StoredFlourInventoryItem[]): string {
  const headers = [
    'id',
    'name',
    'stock_grams',
    'brand',
    'protein_pct',
    'updated_at',
  ];

  const rows = items.map((item) => [
    escapeCsvValue(item.id),
    escapeCsvValue(item.name),
    escapeCsvValue(item.stockGrams),
    escapeCsvValue(item.brand ?? ''),
    escapeCsvValue(item.proteinPct ?? ''),
    escapeCsvValue(new Date(item.updatedAt).toISOString()),
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Zapisuje plik CSV w pamięci podręcznej i otwiera systemowy arkusz udostępniania
 */
export async function exportAndShareCsv(
  filename: string,
  csvContent: string,
  dialogTitle: string = 'Eksport CSV'
): Promise<boolean> {
  const targetPath = `${FileSystem.cacheDirectory}${filename}`;
  try {
    // BOM UTF-8: bez niego Excel czyta polskie znaki w złym kodowaniu (M1-audytor-generalny-152)
    await FileSystem.writeAsStringAsync(targetPath, `﻿${csvContent}`);

    if (!(await Sharing.isAvailableAsync())) {
      return false;
    }

    await Sharing.shareAsync(targetPath, {
      mimeType: 'text/csv',
      dialogTitle,
      UTI: 'public.comma-separated-values-text',
    });

    return true;
  } finally {
    await FileSystem.deleteAsync(targetPath, { idempotent: true }).catch(() => {});
  }
}

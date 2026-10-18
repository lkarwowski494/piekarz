// ============================================================================
// Apps4Craft Studio — Piekarz (Crust)
// Tier 1 Global Sourdough Markets Localized Dictionaries
// German (de), French (fr), Italian (it), Spanish (es), Japanese (ja)
// ============================================================================

export type Tier1Locale = 'de' | 'fr' | 'it' | 'es' | 'ja';

export const TIER1_DICTIONARIES: Record<Tier1Locale, Record<string, string>> = {
  de: {
    'Kalkulator': 'Rechner',
    'Stolnica': 'Backtisch',
    'Harmonogram': 'Zeitplan',
    'Zakwas': 'Sauerteig',
    'Doktor Chleba': 'Brot-Doktor',
    'Więcej': 'Mehr',
    'Mąka': 'Mehl',
    'Woda': 'Wasser',
    'Sól': 'Salz',
    'Drożdże': 'Hefe',
    'Zapisz': 'Speichern',
    'Anuluj': 'Abbrechen',
    'Autoliza': 'Autolyse',
    'Fermentacja burzliwa': 'Stockgare',
    'Wypiek pod pokrywą (Para)': 'Backen im Gusstopf (Dampf)',
    'Dopiekanie bez pokrywy (Karmelizacja)': 'Fertigbacken ohne Deckel (Kruste)',
    'Studzenie na kratce': 'Auskühlen auf dem Gitter',
    'Wypiek zakończony': 'Backen abgeschlossen',
  },
  fr: {
    'Kalkulator': 'Calculateur',
    'Stolnica': 'Plan de travail',
    'Harmonogram': 'Planning',
    'Zakwas': 'Levain naturel',
    'Doktor Chleba': 'Docteur du Pain',
    'Więcej': 'Plus',
    'Mąka': 'Farine',
    'Woda': 'Eau',
    'Sól': 'Sel',
    'Drożdże': 'Levure',
    'Zapisz': 'Enregistrer',
    'Anuluj': 'Annuler',
    'Autoliza': 'Autolyse',
    'Fermentacja burzliwa': 'Pointage en masse',
    'Wypiek pod pokrywą (Para)': 'Cuisson en cocotte (Vapeur)',
    'Dopiekanie bez pokrywy (Karmelizacja)': 'Cuisson découverte (Croûte)',
    'Studzenie na kratce': 'Refroidissement sur grille',
    'Wypiek zakończony': 'Cuisson terminée',
  },
  it: {
    'Kalkulator': 'Calcolatore',
    'Stolnica': 'Spianatoia',
    'Harmonogram': 'Programma',
    'Zakwas': 'Lievito madre',
    'Doktor Chleba': 'Dottore del Pane',
    'Więcej': 'Altro',
    'Mąka': 'Farina',
    'Woda': 'Acqua',
    'Sól': 'Sale',
    'Drożdże': 'Lievito',
    'Zapisz': 'Salva',
    'Anuluj': 'Annulla',
    'Autoliza': 'Autolisi',
    'Fermentacja burzliwa': 'Puntata (Prima lievitazione)',
    'Wypiek pod pokrywą (Para)': 'Cottura in pentola di ghisa (Vapore)',
    'Dopiekanie bez pokrywy (Karmelizacja)': 'Doratura senza coperchio',
    'Studzenie na kratce': 'Raffreddamento su griglia',
    'Wypiek zakończony': 'Cottura completata',
  },
  es: {
    'Kalkulator': 'Calculadora',
    'Stolnica': 'Mesa de trabajo',
    'Harmonogram': 'Cronograma',
    'Zakwas': 'Masa madre',
    'Doktor Chleba': 'Doctor del Pan',
    'Więcej': 'Más',
    'Mąka': 'Harina',
    'Woda': 'Agua',
    'Sól': 'Sal',
    'Drożdże': 'Levadura',
    'Zapisz': 'Guardar',
    'Anuluj': 'Cancelar',
    'Autoliza': 'Autólisis',
    'Fermentacja burzliwa': 'Fermentación en bloque',
    'Wypiek pod pokrywą (Para)': 'Horneado en olla de hierro (Vapor)',
    'Dopiekanie bez pokrywy (Karmelizacja)': 'Horneado sin tapa (Corteza)',
    'Studzenie na kratce': 'Enfriamiento en rejilla',
    'Wypiek zakończony': 'Horneado completado',
  },
  ja: {
    'Kalkulator': '計算機',
    'Stolnica': '作業台',
    'Harmonogram': 'スケジュール',
    'Zakwas': '自家製酵母種',
    'Doktor Chleba': 'ブレッド・ドクター',
    'Więcej': 'その他',
    'Mąka': '小麦粉',
    'Woda': '水',
    'Sól': '塩',
    'Drożdże': '酵母',
    'Zapisz': '保存',
    'Anuluj': 'キャンセル',
    'Autoliza': 'オートリーズ',
    'Fermentacja burzliwa': '一次発酵',
    'Wypiek pod pokrywą (Para)': 'ダッチオーブン蒸気焼成',
    'Dopiekanie bez pokrywy (Karmelizacja)': '蓋外し焼成 (クラスト形成)',
    'Studzenie na kratce': 'クーラー網で冷却',
    'Wypiek zakończony': '焼き上がり完了',
  },
};

/**
 * Returns localized string for a given Tier 1 locale, or undefined if not available.
 */
export function translateTier1(locale: string, polishKey: string): string | undefined {
  const dict = TIER1_DICTIONARIES[locale as Tier1Locale];
  if (!dict) return undefined;
  return dict[polishKey];
}

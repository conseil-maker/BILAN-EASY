import i18n from '../i18n';

/**
 * Retourne le nom traduit d'un forfait à partir de son ID
 * Fallback sur le nom original si la traduction n'existe pas
 */
export function getTranslatedPackageName(packageId: string, fallbackName?: string): string {
  const translated = i18n.t(`packages:items.${packageId}.name`, { defaultValue: '' });
  return translated || fallbackName || packageId;
}

/**
 * Retourne la description traduite d'un forfait à partir de son ID
 */
export function getTranslatedPackageDescription(packageId: string, fallbackDesc?: string): string {
  const translated = i18n.t(`packages:items.${packageId}.description`, { defaultValue: '' });
  return translated || fallbackDesc || '';
}

/**
 * Retourne le nom traduit d'une phase (phase1, phase2, phase3)
 */
export function getTranslatedPhaseName(phaseKey: string, fallbackName?: string): string {
  const translated = i18n.t(`packages:phaseNames.${phaseKey}`, { defaultValue: '' });
  return translated || fallbackName || phaseKey;
}

/**
 * Traduit un nom de package en cherchant par nom français (pour les données venant de la DB)
 * Utile quand on a le nom stocké en français dans la base de données
 */
const packageNameToId: Record<string, string> = {
  'Forfait Test': 'test',
  'Bilan Essentiel': 'essentiel',
  'Bilan Approfondi': 'approfondi',
  'Accompagnement Stratégique': 'strategique',
};

export function translatePackageNameFromFrench(frenchName: string): string {
  const id = packageNameToId[frenchName];
  if (id) {
    return getTranslatedPackageName(id, frenchName);
  }
  return frenchName;
}

/**
 * Traduit un nom de phase en cherchant par nom français
 */
const phaseNameToKey: Record<string, string> = {
  'Phase Préliminaire': 'phase1',
  'Phase d\'Investigation': 'phase2',
  'Phase de Conclusion': 'phase3',
};

export function translatePhaseNameFromFrench(frenchName: string): string {
  const key = phaseNameToKey[frenchName];
  if (key) {
    return getTranslatedPhaseName(key, frenchName);
  }
  return frenchName;
}

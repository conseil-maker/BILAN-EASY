/**
 * Module de synthèse PDF enrichi
 * 
 * Ce module regroupe les fonctionnalités de génération de documents PDF
 * pour les bilans de compétences.
 */

// Types
export * from './types';

// Analyse des compétences et profil RIASEC
export {
  extractRIASECProfile,
  extractDetailedCompetences,
  extractDetailedValues,
  calculateProjectCoherence,
} from './analysis';

// Helpers PDF
export {
  createPDFContext,
  checkNewPage,
  addText,
  addSection,
  addSubSection,
  drawProgressBar,
  drawRadarChart,
  addBulletList,
  addInfoBox,
  type PDFContext,
} from './pdfHelpers';

// Réexporter les types principaux pour faciliter l'import
export type {
  CompetenceAnalysis,
  RIASECProfile,
  ValueAnalysis,
  FeasibilityData,
  PDFStyleConfig,
} from './types';

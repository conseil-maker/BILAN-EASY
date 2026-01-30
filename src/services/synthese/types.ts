/**
 * Types pour le service de synthèse PDF enrichi
 */

import { MarketExplorationResult, JobInterviewResult } from '../geminiService';

/**
 * Analyse détaillée d'une compétence
 */
export interface CompetenceAnalysis {
  category: string;
  level: number; // 1-5
  examples: string[];
  developmentSuggestions: string[];
}

/**
 * Profil RIASEC (Holland Code)
 * Chaque dimension est notée de 0 à 100
 */
export interface RIASECProfile {
  realistic: number;      // Réaliste - activités pratiques et manuelles
  investigative: number;  // Investigateur - recherche et analyse
  artistic: number;       // Artistique - créativité et expression
  social: number;         // Social - aide et accompagnement
  enterprising: number;   // Entreprenant - leadership et persuasion
  conventional: number;   // Conventionnel - organisation et méthode
}

/**
 * Analyse d'une valeur professionnelle
 */
export interface ValueAnalysis {
  value: string;
  importance: 'haute' | 'moyenne' | 'basse';
  manifestation: string;
}

/**
 * Données de faisabilité du projet professionnel
 */
export interface FeasibilityData {
  marketExploration?: MarketExplorationResult;
  jobInterview?: JobInterviewResult;
  feasibilityReport?: {
    summary: string;
    feasibilityScore: number;
    keyFindings: string[];
    actionItems: string[];
    risks: string[];
    opportunities: string[];
  };
}

/**
 * Configuration du style PDF
 */
export interface PDFStyleConfig {
  primaryColor: [number, number, number];
  secondaryColor: [number, number, number];
  accentColor: [number, number, number];
  textColor: [number, number, number];
  lightGray: [number, number, number];
  margins: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
  fonts: {
    title: number;
    subtitle: number;
    heading: number;
    body: number;
    small: number;
  };
}

/**
 * Configuration par défaut du style PDF
 */
export const DEFAULT_PDF_STYLE: PDFStyleConfig = {
  primaryColor: [79, 70, 229],      // Indigo
  secondaryColor: [99, 102, 241],   // Indigo clair
  accentColor: [16, 185, 129],      // Vert émeraude
  textColor: [31, 41, 55],          // Gris foncé
  lightGray: [243, 244, 246],       // Gris très clair
  margins: {
    left: 20,
    right: 20,
    top: 20,
    bottom: 25,
  },
  fonts: {
    title: 24,
    subtitle: 18,
    heading: 14,
    body: 11,
    small: 9,
  },
};

/**
 * Mots-clés pour l'analyse RIASEC
 */
export const RIASEC_KEYWORDS = {
  realistic: ['technique', 'pratique', 'concret', 'manuel', 'outil', 'machine', 'construire', 'réparer'],
  investigative: ['analyser', 'recherche', 'comprendre', 'science', 'données', 'logique', 'résoudre', 'étudier'],
  artistic: ['créatif', 'artistique', 'imagination', 'design', 'expression', 'original', 'innovation', 'esthétique'],
  social: ['aider', 'accompagner', 'enseigner', 'équipe', 'relation', 'communiquer', 'écouter', 'soutenir'],
  enterprising: ['diriger', 'vendre', 'convaincre', 'entreprendre', 'négocier', 'leadership', 'décision', 'influence'],
  conventional: ['organiser', 'planifier', 'méthode', 'précis', 'procédure', 'administratif', 'structurer', 'classer'],
};

/**
 * Descriptions des types RIASEC
 */
export const RIASEC_DESCRIPTIONS: Record<keyof RIASECProfile, string> = {
  realistic: 'Préférence pour les activités pratiques, concrètes et manuelles',
  investigative: 'Goût pour la recherche, l\'analyse et la résolution de problèmes',
  artistic: 'Attirance pour la créativité, l\'expression et l\'innovation',
  social: 'Orientation vers l\'aide, l\'accompagnement et les relations humaines',
  enterprising: 'Intérêt pour le leadership, la persuasion et l\'entrepreneuriat',
  conventional: 'Préférence pour l\'organisation, la méthode et la structure',
};

export default {
  DEFAULT_PDF_STYLE,
  RIASEC_KEYWORDS,
  RIASEC_DESCRIPTIONS,
};

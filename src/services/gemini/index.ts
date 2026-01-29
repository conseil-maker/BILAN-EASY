/**
 * Service Gemini - Point d'entrée principal
 * 
 * Ce module réexporte toutes les fonctionnalités du service Gemini
 * depuis des fichiers modulaires pour une meilleure maintenabilité.
 */

// Schémas JSON pour les réponses structurées
export * from './schemas';

// Utilitaires et helpers
export * from './utils';

// Module d'exploration de carrière
export * from './careerExploration';

// Module d'analyse de réponse (détection hors-cadre)
export * from './responseAnalysis';

// Module d'exploration du marché de l'emploi
export * from './marketExploration';

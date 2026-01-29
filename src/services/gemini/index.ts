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

// Note: Les fonctions principales restent dans geminiService.ts
// pour le moment, mais seront progressivement migrées ici
// lors des prochaines itérations de refactoring.

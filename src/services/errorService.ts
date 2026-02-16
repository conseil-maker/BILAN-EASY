/**
 * errorService - Service de gestion centralisée des erreurs
 * 
 * Ce service remplace les console.error et window.confirm éparpillés dans le code.
 * Il fournit une gestion cohérente des erreurs avec :
 * - Logging structuré (console en dev, Sentry en prod potentiellement)
 * - Messages utilisateur via le système de toast
 * - Catégorisation des erreurs par type et gravité
 * 
 * @author Manus AI
 * @date 22 janvier 2026
 */

// ============================================
// TYPES
// ============================================

/**
 * Catégories d'erreurs
 */
export type ErrorCategory = 
  | 'network'       // Erreurs réseau (API, Supabase)
  | 'auth'          // Erreurs d'authentification
  | 'validation'    // Erreurs de validation de données
  | 'ai'            // Erreurs liées à l'IA (Gemini)
  | 'storage'       // Erreurs de stockage (localStorage, Supabase)
  | 'pdf'           // Erreurs de génération PDF
  | 'unknown';      // Erreurs non catégorisées

/**
 * Niveaux de gravité
 */
export type ErrorSeverity = 
  | 'info'      // Information, pas vraiment une erreur
  | 'warning'   // Avertissement, l'application peut continuer
  | 'error'     // Erreur, action échouée mais application stable
  | 'critical'; // Erreur critique, l'application peut être instable

/**
 * Structure d'une erreur traitée
 */
export interface ProcessedError {
  id: string;
  timestamp: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  context: string;
  message: string;
  userMessage: string;
  originalError: unknown;
  stack?: string;
}

/**
 * Options pour le traitement des erreurs
 */
export interface ErrorOptions {
  category?: ErrorCategory;
  severity?: ErrorSeverity;
  showToast?: boolean;
  silent?: boolean;
  userMessage?: string;
}

// ============================================
// ÉTAT INTERNE
// ============================================

// Historique des erreurs (pour débogage)
const errorHistory: ProcessedError[] = [];
const MAX_ERROR_HISTORY = 50;

// Callback pour afficher les toasts (sera défini par le composant Toast)
let toastCallback: ((message: string, type: 'success' | 'error' | 'warning' | 'info') => void) | null = null;

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

/**
 * Génère un ID unique pour l'erreur
 */
const generateErrorId = (): string => {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Extrait le message d'une erreur de type inconnu
 */
const extractErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return 'Une erreur inconnue est survenue';
};

/**
 * Extrait la stack trace d'une erreur
 */
const extractStack = (error: unknown): string | undefined => {
  if (error instanceof Error) {
    return error.stack;
  }
  return undefined;
};

/**
 * Détermine la catégorie d'erreur automatiquement
 */
const detectCategory = (error: unknown, context: string): ErrorCategory => {
  const message = extractErrorMessage(error).toLowerCase();
  const contextLower = context.toLowerCase();
  
  // Erreurs réseau
  if (message.includes('fetch') || message.includes('network') || message.includes('timeout') || message.includes('failed to fetch')) {
    return 'network';
  }
  
  // Erreurs d'authentification
  if (message.includes('auth') || message.includes('login') || message.includes('credentials') || message.includes('unauthorized')) {
    return 'auth';
  }
  
  // Erreurs IA
  if (contextLower.includes('gemini') || contextLower.includes('ai') || message.includes('gemini') || message.includes('api key')) {
    return 'ai';
  }
  
  // Erreurs PDF
  if (contextLower.includes('pdf') || contextLower.includes('synthese') || message.includes('pdf')) {
    return 'pdf';
  }
  
  // Erreurs de stockage
  if (message.includes('storage') || message.includes('supabase') || message.includes('database')) {
    return 'storage';
  }
  
  // Erreurs de validation
  if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
    return 'validation';
  }
  
  return 'unknown';
};

/**
 * Génère un message utilisateur approprié
 */
const generateUserMessage = (category: ErrorCategory, severity: ErrorSeverity, originalMessage: string): string => {
  // Messages par catégorie
  const categoryMessages: Record<ErrorCategory, string> = {
    network: 'Problème de connexion. Vérifiez votre connexion internet et réessayez.',
    auth: 'Problème d\'authentification. Veuillez vous reconnecter.',
    validation: 'Les données saisies sont invalides. Veuillez vérifier et réessayer.',
    ai: 'L\'assistant IA rencontre des difficultés. Veuillez réessayer dans quelques instants.',
    storage: 'Problème de sauvegarde des données. Vos modifications pourraient ne pas être enregistrées.',
    pdf: 'Erreur lors de la génération du document. Veuillez réessayer.',
    unknown: 'Une erreur inattendue s\'est produite. Veuillez réessayer.',
  };
  
  // Pour les erreurs critiques, ajouter un message supplémentaire
  if (severity === 'critical') {
    return `${categoryMessages[category]} Si le problème persiste, veuillez contacter le support.`;
  }
  
  return categoryMessages[category];
};

// ============================================
// FONCTIONS PRINCIPALES
// ============================================

/**
 * Enregistre le callback pour afficher les toasts
 * Appelé par le composant ToastProvider au montage
 */
export const setToastCallback = (callback: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void): void => {
  toastCallback = callback;
};

/**
 * Supprime le callback toast
 * Appelé par le composant ToastProvider au démontage
 */
export const clearToastCallback = (): void => {
  toastCallback = null;
};

/**
 * Fonction principale de gestion des erreurs
 * 
 * @param error - L'erreur à traiter (peut être de n'importe quel type)
 * @param context - Le contexte où l'erreur s'est produite (ex: "SessionService.saveSession")
 * @param options - Options de traitement
 * @returns L'erreur traitée
 */
export const handleError = (
  error: unknown, 
  context: string, 
  options: ErrorOptions = {}
): ProcessedError => {
  const {
    category = detectCategory(error, context),
    severity = 'error',
    showToast = true,
    silent = false,
    userMessage,
  } = options;
  
  const message = extractErrorMessage(error);
  const finalUserMessage = userMessage || generateUserMessage(category, severity, message);
  
  // Créer l'erreur traitée
  const processedError: ProcessedError = {
    id: generateErrorId(),
    timestamp: new Date().toISOString(),
    category,
    severity,
    context,
    message,
    userMessage: finalUserMessage,
    originalError: error,
    stack: extractStack(error),
  };
  
  // Ajouter à l'historique
  errorHistory.unshift(processedError);
  if (errorHistory.length > MAX_ERROR_HISTORY) {
    errorHistory.pop();
  }
  
  // Logging (sauf si silent)
  if (!silent) {
    const logPrefix = `[${severity.toUpperCase()}] [${category}] [${context}]`;
    
    switch (severity) {
      case 'info':
        console.info(logPrefix, message);
        break;
      case 'warning':
        console.warn(logPrefix, message);
        break;
      case 'error':
      case 'critical':
        console.error(logPrefix, message, error);
        break;
    }
  }
  
  // Afficher le toast si demandé
  if (showToast && toastCallback) {
    const toastType = severity === 'info' ? 'info' : severity === 'warning' ? 'warning' : 'error';
    toastCallback(finalUserMessage, toastType);
  }
  
  // Envoyer à Sentry en production pour les erreurs critiques (async)
  if (import.meta.env.PROD && (severity === 'critical' || severity === 'error')) {
    import('../lib/sentry').then(({ captureError }) => {
      captureError(processedError.originalError as Error, {
        context,
        severity,
        category,
        userMessage: finalUserMessage,
      });
    }).catch(() => {
      // Sentry non disponible, ignorer silencieusement
      console.debug('[ErrorService] Sentry non disponible');
    });
  }
  
  return processedError;
};

/**
 * Gère une erreur réseau
 */
export const handleNetworkError = (error: unknown, context: string, options?: { showToast?: boolean; userMessage?: string }): ProcessedError => {
  return handleError(error, context, { category: 'network', ...options });
};

/**
 * Gère une erreur d'authentification
 */
export const handleAuthError = (error: unknown, context: string): ProcessedError => {
  return handleError(error, context, { category: 'auth', severity: 'warning' });
};

/**
 * Gère une erreur IA
 */
export const handleAIError = (error: unknown, context: string): ProcessedError => {
  return handleError(error, context, { category: 'ai' });
};

/**
 * Gère une erreur de génération PDF
 */
export const handlePDFError = (error: unknown, context: string): ProcessedError => {
  return handleError(error, context, { category: 'pdf' });
};

/**
 * Gère une erreur de validation
 */
export const handleValidationError = (message: string, context: string): ProcessedError => {
  return handleError(new Error(message), context, { 
    category: 'validation', 
    severity: 'warning' 
  });
};

/**
 * Log une erreur silencieusement (sans toast)
 */
export const logError = (error: unknown, context: string): ProcessedError => {
  return handleError(error, context, { showToast: false });
};

/**
 * Log une erreur complètement silencieusement (sans console ni toast)
 */
export const silentError = (error: unknown, context: string): ProcessedError => {
  return handleError(error, context, { showToast: false, silent: true });
};

// ============================================
// FONCTIONS DE DÉBOGAGE
// ============================================

/**
 * Récupère l'historique des erreurs
 */
export const getErrorHistory = (): ProcessedError[] => {
  return [...errorHistory];
};

/**
 * Efface l'historique des erreurs
 */
export const clearErrorHistory = (): void => {
  errorHistory.length = 0;
};

/**
 * Récupère les erreurs par catégorie
 */
export const getErrorsByCategory = (category: ErrorCategory): ProcessedError[] => {
  return errorHistory.filter(e => e.category === category);
};

/**
 * Récupère les erreurs par gravité
 */
export const getErrorsBySeverity = (severity: ErrorSeverity): ProcessedError[] => {
  return errorHistory.filter(e => e.severity === severity);
};

/**
 * Exporte l'historique des erreurs en JSON (pour le support)
 */
export const exportErrorHistory = (): string => {
  return JSON.stringify(errorHistory, null, 2);
};

export default {
  handleError,
  handleNetworkError,
  handleAuthError,
  handleAIError,
  handlePDFError,
  handleValidationError,
  logError,
  silentError,
  setToastCallback,
  clearToastCallback,
  getErrorHistory,
  clearErrorHistory,
  getErrorsByCategory,
  getErrorsBySeverity,
  exportErrorHistory,
};

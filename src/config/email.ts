/**
 * Configuration du service d'emails
 * 
 * Pour activer l'envoi d'emails réels :
 * 1. Créez un compte sur https://resend.com
 * 2. Obtenez votre clé API
 * 3. Ajoutez VITE_RESEND_API_KEY dans vos variables d'environnement Vercel
 * 4. Vérifiez votre domaine d'envoi sur Resend
 */

export const emailConfig = {
  // Clé API Resend (à configurer dans les variables d'environnement)
  apiKey: import.meta.env.VITE_RESEND_API_KEY || '',
  
  // Email d'envoi (doit être vérifié sur Resend)
  fromEmail: import.meta.env.VITE_EMAIL_FROM || 'contact@netzinformatique.fr',
  fromName: import.meta.env.VITE_EMAIL_FROM_NAME || 'NETZ INFORMATIQUE',
  
  // Mode de fonctionnement
  // 'production' = envoi réel via Resend
  // 'development' = simulation (log console)
  mode: import.meta.env.VITE_EMAIL_MODE || 'development',
  
  // Activer/désactiver les emails
  enabled: import.meta.env.VITE_EMAIL_ENABLED === 'true',
};

// Vérifier si le service d'email est configuré
export const isEmailConfigured = (): boolean => {
  return emailConfig.enabled && emailConfig.apiKey !== '';
};

// Obtenir le statut de configuration
export const getEmailStatus = (): {
  configured: boolean;
  mode: string;
  fromEmail: string;
} => ({
  configured: isEmailConfigured(),
  mode: emailConfig.mode,
  fromEmail: emailConfig.fromEmail,
});

/**
 * Service d'emails via Gmail / Google Workspace
 * 
 * Ce service utilise l'API Gmail via MCP pour envoyer des emails
 * directement depuis le compte Google Workspace de l'organisation.
 * 
 * Avantages :
 * - Emails envoyés depuis @netzinformatique.fr
 * - Pas de service tiers (Resend)
 * - Intégré avec Google Workspace existant
 * - Meilleure délivrabilité
 */

import { organizationConfig } from '../config/organization';

// Types
export interface GmailMessage {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  content: string;
  attachments?: string[];
}

export interface EmailRecipient {
  email: string;
  name: string;
}

// Configuration Gmail
const GMAIL_CONFIG = {
  defaultFrom: organizationConfig.email,
  defaultFromName: organizationConfig.name,
  consultantEmail: organizationConfig.defaultConsultant.email,
  consultantName: organizationConfig.defaultConsultant.name,
};

/**
 * Convertit le HTML en texte brut pour Gmail
 * Gmail MCP n'accepte que le texte brut, pas le HTML
 */
const htmlToPlainText = (html: string): string => {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();
};

/**
 * Formate un email pour l'affichage
 */
const formatEmailContent = (
  greeting: string,
  body: string[],
  signature: boolean = true
): string => {
  let content = `${greeting}\n\n`;
  content += body.join('\n\n');
  
  if (signature) {
    content += `\n\n---\n`;
    content += `${GMAIL_CONFIG.consultantName}\n`;
    content += `${organizationConfig.name}\n`;
    content += `${organizationConfig.phone}\n`;
    content += `${organizationConfig.email}\n`;
    content += `${organizationConfig.address.street}, ${organizationConfig.address.postalCode} ${organizationConfig.address.city}\n`;
    content += `\nOrganisme certifié Qualiopi - ${organizationConfig.qualiopi}`;
  }
  
  return content;
};

// Templates d'emails en texte brut pour Gmail
export const gmailTemplates = {
  
  // Email de bienvenue
  welcome: (userName: string, packageName: string): GmailMessage => ({
    to: [], // À remplir
    subject: `Bienvenue chez ${organizationConfig.name} - Votre bilan de compétences`,
    content: formatEmailContent(
      `Bonjour ${userName},`,
      [
        `Nous sommes ravis de vous accueillir chez ${organizationConfig.name} pour votre bilan de compétences.`,
        `VOTRE FORFAIT : ${packageName}`,
        `Prochaines étapes :
1. Complétez la phase préliminaire en ligne
2. Répondez au questionnaire d'investigation
3. Planifiez vos entretiens avec votre consultant`,
        `Accédez à votre espace : ${organizationConfig.website}`,
        `🏆 ORGANISME CERTIFIÉ QUALIOPI
N° ${organizationConfig.qualiopi}
Votre bilan est éligible au financement CPF et OPCO.`,
      ]
    ),
  }),

  // Confirmation de rendez-vous
  appointmentConfirmation: (
    userName: string,
    date: string,
    time: string,
    type: string,
    consultantName: string
  ): GmailMessage => ({
    to: [],
    subject: `✓ Confirmation de rendez-vous - ${date} à ${time}`,
    content: formatEmailContent(
      `Bonjour ${userName},`,
      [
        `Votre rendez-vous a bien été enregistré.`,
        `📅 DÉTAILS DU RENDEZ-VOUS
• Type : ${type}
• Date : ${date}
• Heure : ${time}
• Consultant : ${consultantName}
• Lieu : ${organizationConfig.address.street}, ${organizationConfig.address.postalCode} ${organizationConfig.address.city}`,
        `📝 PRÉPARATION
Pour préparer au mieux cet entretien :
• Complétez le questionnaire en ligne si ce n'est pas déjà fait
• Réfléchissez aux questions que vous souhaitez aborder
• Apportez votre CV à jour (si disponible)`,
        `En cas d'empêchement, merci de nous prévenir au moins 48h à l'avance.`,
      ]
    ),
  }),

  // Rappel de rendez-vous (J-1)
  appointmentReminder: (
    userName: string,
    date: string,
    time: string,
    type: string
  ): GmailMessage => ({
    to: [],
    subject: `⏰ Rappel : Votre rendez-vous demain à ${time}`,
    content: formatEmailContent(
      `Bonjour ${userName},`,
      [
        `Nous vous rappelons votre rendez-vous prévu DEMAIN.`,
        `📅 DEMAIN
• Type : ${type}
• Date : ${date}
• Heure : ${time}
• Adresse : ${organizationConfig.address.street}, ${organizationConfig.address.postalCode} ${organizationConfig.address.city}`,
        `Nous avons hâte de vous retrouver !`,
      ]
    ),
  }),

  // Bilan terminé
  bilanCompleted: (userName: string): GmailMessage => ({
    to: [],
    subject: `🎉 Félicitations ! Votre bilan de compétences est terminé`,
    content: formatEmailContent(
      `Bonjour ${userName},`,
      [
        `Félicitations ! Vous avez terminé votre bilan de compétences avec succès.`,
        `📄 VOS DOCUMENTS SONT DISPONIBLES
Vous pouvez dès maintenant télécharger :
• Votre document de synthèse (conforme article R.6313-8)
• Votre attestation de présence
• Votre plan d'action personnalisé`,
        `Accédez à vos documents : ${organizationConfig.website}/#/mes-documents`,
        `🔒 CONFIDENTIALITÉ
Conformément à l'article L.6313-10-1 du Code du travail, le document de synthèse ne peut être communiqué à un tiers qu'avec votre accord écrit.`,
        `📞 SUIVI POST-BILAN
Un entretien de suivi vous sera proposé dans 6 mois pour faire le point sur l'avancement de votre projet.`,
        `Merci de votre confiance !`,
      ]
    ),
  }),

  // Suivi 6 mois
  followUp6Months: (userName: string): GmailMessage => ({
    to: [],
    subject: `📊 Suivi de votre bilan - Comment avancez-vous ?`,
    content: formatEmailContent(
      `Bonjour ${userName},`,
      [
        `Il y a 6 mois, vous avez terminé votre bilan de compétences avec ${organizationConfig.name}.`,
        `Nous aimerions prendre de vos nouvelles et savoir comment avance votre projet professionnel.`,
        `📋 QUELQUES QUESTIONS
• Avez-vous mis en œuvre les actions définies dans votre plan ?
• Avez-vous rencontré des difficultés ?
• Avez-vous besoin d'un accompagnement complémentaire ?`,
        `Nous vous proposons un entretien de suivi gratuit pour faire le point.`,
        `Planifiez votre entretien : ${organizationConfig.website}/#/rendez-vous`,
        `Nous restons à votre disposition !`,
      ]
    ),
  }),

  // Email personnalisé
  custom: (
    userName: string,
    subject: string,
    bodyLines: string[]
  ): GmailMessage => ({
    to: [],
    subject,
    content: formatEmailContent(
      `Bonjour ${userName},`,
      bodyLines
    ),
  }),
};

/**
 * Envoie un email via Gmail
 * Note: Cette fonction prépare les données pour l'envoi via MCP Gmail
 * L'envoi réel se fait côté serveur via le MCP
 */
export const prepareGmailMessage = (
  to: EmailRecipient,
  template: GmailMessage,
  cc?: string[],
  bcc?: string[]
): GmailMessage => {
  return {
    ...template,
    to: [to.email],
    cc: cc || [],
    bcc: bcc || [GMAIL_CONFIG.consultantEmail], // Copie au consultant par défaut
  };
};

/**
 * Prépare un email de bienvenue
 */
export const prepareWelcomeEmail = (
  email: string,
  name: string,
  packageName: string
): GmailMessage => {
  const template = gmailTemplates.welcome(name, packageName);
  return {
    ...template,
    to: [email],
    bcc: [GMAIL_CONFIG.consultantEmail],
  };
};

/**
 * Prépare un email de confirmation de rendez-vous
 */
export const prepareAppointmentConfirmation = (
  email: string,
  name: string,
  date: string,
  time: string,
  type: string
): GmailMessage => {
  const template = gmailTemplates.appointmentConfirmation(
    name,
    date,
    time,
    type,
    GMAIL_CONFIG.consultantName
  );
  return {
    ...template,
    to: [email],
    bcc: [GMAIL_CONFIG.consultantEmail],
  };
};

/**
 * Prépare un email de rappel de rendez-vous
 */
export const prepareAppointmentReminder = (
  email: string,
  name: string,
  date: string,
  time: string,
  type: string
): GmailMessage => {
  const template = gmailTemplates.appointmentReminder(name, date, time, type);
  return {
    ...template,
    to: [email],
  };
};

/**
 * Prépare un email de fin de bilan
 */
export const prepareBilanCompletedEmail = (
  email: string,
  name: string
): GmailMessage => {
  const template = gmailTemplates.bilanCompleted(name);
  return {
    ...template,
    to: [email],
    bcc: [GMAIL_CONFIG.consultantEmail],
  };
};

/**
 * Prépare un email de suivi 6 mois
 */
export const prepareFollowUp6MonthsEmail = (
  email: string,
  name: string
): GmailMessage => {
  const template = gmailTemplates.followUp6Months(name);
  return {
    ...template,
    to: [email],
  };
};

/**
 * Génère le JSON pour l'envoi via MCP Gmail
 */
export const generateMcpGmailPayload = (messages: GmailMessage[]): string => {
  return JSON.stringify({
    messages: messages.map(msg => ({
      to: msg.to,
      cc: msg.cc || [],
      bcc: msg.bcc || [],
      subject: msg.subject,
      content: msg.content,
      attachments: msg.attachments || [],
    })),
  });
};

export default {
  gmailTemplates,
  prepareGmailMessage,
  prepareWelcomeEmail,
  prepareAppointmentConfirmation,
  prepareAppointmentReminder,
  prepareBilanCompletedEmail,
  prepareFollowUp6MonthsEmail,
  generateMcpGmailPayload,
};

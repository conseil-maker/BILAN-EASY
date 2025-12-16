/**
 * Service d'emails automatiques
 * 
 * Ce service gère l'envoi d'emails automatiques pour :
 * - Confirmations de rendez-vous
 * - Rappels
 * - Notifications de fin de bilan
 * - Documents disponibles
 * 
 * Intégration avec Resend pour l'envoi réel d'emails.
 * Configuration requise : VITE_RESEND_API_KEY dans les variables d'environnement.
 */

import { organizationConfig } from '../config/organization';
import { emailConfig, isEmailConfigured } from '../config/email';

// Types
export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface EmailRecipient {
  email: string;
  name: string;
}

export interface EmailData {
  to: EmailRecipient;
  template: EmailTemplate;
  variables: Record<string, string>;
}

// Templates d'emails
export const emailTemplates = {
  // Confirmation d'inscription
  welcome: (userName: string, packageName: string): EmailTemplate => ({
    subject: `Bienvenue chez ${organizationConfig.name} - Votre bilan de compétences`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .qualiopi { background: #e0f2fe; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Bienvenue ${userName} !</h1>
            <p>Votre bilan de compétences commence</p>
          </div>
          <div class="content">
            <p>Bonjour ${userName},</p>
            <p>Nous sommes ravis de vous accueillir chez <strong>${organizationConfig.name}</strong> pour votre bilan de compétences.</p>
            
            <h3>Votre forfait : ${packageName}</h3>
            <p>Vous avez choisi le forfait ${packageName}. Voici les prochaines étapes :</p>
            <ol>
              <li>Complétez la phase préliminaire en ligne</li>
              <li>Répondez au questionnaire d'investigation</li>
              <li>Planifiez vos entretiens avec votre consultant</li>
            </ol>
            
            <a href="${organizationConfig.website}" class="button">Accéder à mon espace</a>
            
            <div class="qualiopi">
              <strong>🏆 Organisme certifié Qualiopi</strong><br>
              N° ${organizationConfig.qualiopi}<br>
              Votre bilan est éligible au financement CPF et OPCO.
            </div>
            
            <p>Votre consultant dédié : <strong>${organizationConfig.defaultConsultant.name}</strong></p>
            <p>Contact : ${organizationConfig.email} | ${organizationConfig.phone}</p>
          </div>
          <div class="footer">
            <p>${organizationConfig.name} - ${organizationConfig.address.full}</p>
            <p>SIRET : ${organizationConfig.siret} | NDA : ${organizationConfig.nda}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Bienvenue ${userName} !
      
      Nous sommes ravis de vous accueillir chez ${organizationConfig.name} pour votre bilan de compétences.
      
      Votre forfait : ${packageName}
      
      Prochaines étapes :
      1. Complétez la phase préliminaire en ligne
      2. Répondez au questionnaire d'investigation
      3. Planifiez vos entretiens avec votre consultant
      
      Accédez à votre espace : ${organizationConfig.website}
      
      Votre consultant : ${organizationConfig.defaultConsultant.name}
      Contact : ${organizationConfig.email} | ${organizationConfig.phone}
      
      ${organizationConfig.name}
      ${organizationConfig.address.full}
    `
  }),

  // Confirmation de rendez-vous
  appointmentConfirmation: (
    userName: string,
    date: string,
    time: string,
    type: string,
    consultantName: string
  ): EmailTemplate => ({
    subject: `Confirmation de rendez-vous - ${date} à ${time}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .appointment-box { background: white; border: 2px solid #10b981; border-radius: 10px; padding: 20px; margin: 20px 0; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
          .button-secondary { background: #6b7280; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Rendez-vous confirmé</h1>
          </div>
          <div class="content">
            <p>Bonjour ${userName},</p>
            <p>Votre rendez-vous a bien été enregistré.</p>
            
            <div class="appointment-box">
              <h3 style="margin-top: 0;">📅 Détails du rendez-vous</h3>
              <p><strong>Type :</strong> ${type}</p>
              <p><strong>Date :</strong> ${date}</p>
              <p><strong>Heure :</strong> ${time}</p>
              <p><strong>Consultant :</strong> ${consultantName}</p>
              <p><strong>Lieu :</strong> ${organizationConfig.address.full}</p>
            </div>
            
            <p>
              <a href="${organizationConfig.website}/#/rendez-vous" class="button">Gérer mes rendez-vous</a>
              <a href="mailto:${organizationConfig.email}?subject=Modification RDV ${date}" class="button button-secondary">Modifier/Annuler</a>
            </p>
            
            <h4>📝 Préparation</h4>
            <p>Pour préparer au mieux cet entretien, nous vous invitons à :</p>
            <ul>
              <li>Compléter le questionnaire en ligne si ce n'est pas déjà fait</li>
              <li>Réfléchir aux questions que vous souhaitez aborder</li>
              <li>Apporter votre CV à jour (si disponible)</li>
            </ul>
          </div>
          <div class="footer">
            <p>En cas d'empêchement, merci de nous prévenir au moins 48h à l'avance.</p>
            <p>${organizationConfig.name} | ${organizationConfig.phone} | ${organizationConfig.email}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Rendez-vous confirmé
      
      Bonjour ${userName},
      
      Votre rendez-vous a bien été enregistré.
      
      Détails :
      - Type : ${type}
      - Date : ${date}
      - Heure : ${time}
      - Consultant : ${consultantName}
      - Lieu : ${organizationConfig.address.full}
      
      En cas d'empêchement, merci de nous prévenir au moins 48h à l'avance.
      
      ${organizationConfig.name}
      ${organizationConfig.phone} | ${organizationConfig.email}
    `
  }),

  // Rappel de rendez-vous (J-1)
  appointmentReminder: (
    userName: string,
    date: string,
    time: string,
    type: string
  ): EmailTemplate => ({
    subject: `Rappel : Votre rendez-vous demain à ${time}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .reminder-box { background: #fef3c7; border: 2px solid #f59e0b; border-radius: 10px; padding: 20px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Rappel rendez-vous</h1>
          </div>
          <div class="content">
            <p>Bonjour ${userName},</p>
            <p>Nous vous rappelons votre rendez-vous prévu <strong>demain</strong>.</p>
            
            <div class="reminder-box">
              <h3 style="margin-top: 0;">📅 Demain</h3>
              <p><strong>Type :</strong> ${type}</p>
              <p><strong>Date :</strong> ${date}</p>
              <p><strong>Heure :</strong> ${time}</p>
              <p><strong>Adresse :</strong> ${organizationConfig.address.full}</p>
            </div>
            
            <p>Nous avons hâte de vous retrouver !</p>
          </div>
          <div class="footer">
            <p>${organizationConfig.name} | ${organizationConfig.phone}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Rappel : Votre rendez-vous demain
      
      Bonjour ${userName},
      
      Nous vous rappelons votre rendez-vous prévu demain.
      
      - Type : ${type}
      - Date : ${date}
      - Heure : ${time}
      - Adresse : ${organizationConfig.address.full}
      
      Nous avons hâte de vous retrouver !
      
      ${organizationConfig.name}
    `
  }),

  // Bilan terminé - Documents disponibles
  bilanCompleted: (userName: string): EmailTemplate => ({
    subject: `Félicitations ! Votre bilan de compétences est terminé`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .documents-box { background: white; border: 2px solid #8b5cf6; border-radius: 10px; padding: 20px; margin: 20px 0; }
          .document-item { display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .document-item:last-child { border-bottom: none; }
          .button { display: inline-block; background: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Félicitations ${userName} !</h1>
            <p>Votre bilan de compétences est terminé</p>
          </div>
          <div class="content">
            <p>Bonjour ${userName},</p>
            <p>Nous avons le plaisir de vous informer que votre bilan de compétences est maintenant terminé.</p>
            
            <div class="documents-box">
              <h3 style="margin-top: 0;">📁 Vos documents sont disponibles</h3>
              <div class="document-item">
                <span>📄</span>
                <span style="margin-left: 10px;">Document de synthèse</span>
              </div>
              <div class="document-item">
                <span>✅</span>
                <span style="margin-left: 10px;">Attestation de présence</span>
              </div>
              <div class="document-item">
                <span>🎯</span>
                <span style="margin-left: 10px;">Plan d'action personnalisé</span>
              </div>
            </div>
            
            <a href="${organizationConfig.website}/#/mes-documents" class="button">Télécharger mes documents</a>
            
            <h4>📋 Prochaines étapes</h4>
            <p>Votre document de synthèse vous appartient. Conformément à l'article L.6313-10-1 du Code du travail, il ne peut être communiqué à un tiers qu'avec votre accord écrit.</p>
            
            <h4>🔄 Suivi à 6 mois</h4>
            <p>Nous vous recontacterons dans 6 mois pour faire le point sur la mise en œuvre de votre projet professionnel.</p>
            
            <h4>⭐ Votre avis compte</h4>
            <p>N'oubliez pas de compléter le questionnaire de satisfaction pour nous aider à améliorer nos services.</p>
            <a href="${organizationConfig.website}/#/satisfaction" class="button" style="background: #f59e0b;">Donner mon avis</a>
          </div>
          <div class="footer">
            <p>Merci de votre confiance !</p>
            <p>${organizationConfig.name} | ${organizationConfig.phone} | ${organizationConfig.email}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Félicitations ${userName} !
      
      Votre bilan de compétences est terminé.
      
      Vos documents sont disponibles :
      - Document de synthèse
      - Attestation de présence
      - Plan d'action personnalisé
      
      Téléchargez-les sur : ${organizationConfig.website}/#/mes-documents
      
      Nous vous recontacterons dans 6 mois pour faire le point.
      
      Merci de votre confiance !
      ${organizationConfig.name}
    `
  }),

  // Suivi à 6 mois
  followUp6Months: (userName: string): EmailTemplate => ({
    subject: `${userName}, comment avance votre projet professionnel ?`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #06b6d4; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Suivi à 6 mois</h1>
          </div>
          <div class="content">
            <p>Bonjour ${userName},</p>
            <p>Il y a 6 mois, vous avez terminé votre bilan de compétences avec nous. Nous espérons que vous avez pu avancer dans la réalisation de votre projet professionnel.</p>
            
            <p>Conformément aux exigences Qualiopi, nous souhaiterions faire un point avec vous sur :</p>
            <ul>
              <li>L'avancement de votre projet</li>
              <li>Les actions mises en œuvre</li>
              <li>Les éventuelles difficultés rencontrées</li>
            </ul>
            
            <a href="${organizationConfig.website}/#/rendez-vous" class="button">Planifier un entretien de suivi</a>
            
            <p>Ou répondez simplement à cet email pour nous donner de vos nouvelles.</p>
          </div>
          <div class="footer">
            <p>${organizationConfig.name} | ${organizationConfig.phone}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Suivi à 6 mois
      
      Bonjour ${userName},
      
      Il y a 6 mois, vous avez terminé votre bilan de compétences avec nous.
      
      Nous souhaiterions faire un point avec vous sur l'avancement de votre projet.
      
      Planifiez un entretien : ${organizationConfig.website}/#/rendez-vous
      
      ${organizationConfig.name}
    `
  }),
};

// Fonction d'envoi avec Resend
export const sendEmail = async (emailData: EmailData): Promise<boolean> => {
  console.log('📧 Email à envoyer:', {
    to: emailData.to.email,
    subject: emailData.template.subject,
    mode: emailConfig.mode,
  });
  
  // Vérifier si le service est configuré
  if (!isEmailConfigured()) {
    console.warn('⚠️ Service d\'email non configuré - Email simulé');
    console.log('Pour activer les emails réels, configurez VITE_RESEND_API_KEY');
    return true; // Simulation de succès
  }
  
  // Mode développement : simulation
  if (emailConfig.mode === 'development') {
    console.log('🛠️ Mode développement - Email simulé');
    console.log('Contenu:', emailData.template.text.substring(0, 200) + '...');
    return true;
  }
  
  // Mode production : envoi réel via Resend
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${emailConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${emailConfig.fromName} <${emailConfig.fromEmail}>`,
        to: [emailData.to.email],
        subject: emailData.template.subject,
        html: emailData.template.html,
        text: emailData.template.text,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Erreur Resend:', errorData);
      return false;
    }
    
    const result = await response.json();
    console.log('✅ Email envoyé avec succès:', result.id);
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    return false;
  }
};

// Fonctions utilitaires pour envoyer des emails spécifiques
export const sendWelcomeEmail = async (
  email: string,
  name: string,
  packageName: string
): Promise<boolean> => {
  const template = emailTemplates.welcome(name, packageName);
  return sendEmail({
    to: { email, name },
    template,
    variables: { userName: name, packageName }
  });
};

export const sendAppointmentConfirmation = async (
  email: string,
  name: string,
  date: string,
  time: string,
  type: string
): Promise<boolean> => {
  const template = emailTemplates.appointmentConfirmation(
    name,
    date,
    time,
    type,
    organizationConfig.defaultConsultant.name
  );
  return sendEmail({
    to: { email, name },
    template,
    variables: { userName: name, date, time, type }
  });
};

export const sendAppointmentReminder = async (
  email: string,
  name: string,
  date: string,
  time: string,
  type: string
): Promise<boolean> => {
  const template = emailTemplates.appointmentReminder(name, date, time, type);
  return sendEmail({
    to: { email, name },
    template,
    variables: { userName: name, date, time, type }
  });
};

export const sendBilanCompletedEmail = async (
  email: string,
  name: string
): Promise<boolean> => {
  const template = emailTemplates.bilanCompleted(name);
  return sendEmail({
    to: { email, name },
    template,
    variables: { userName: name }
  });
};

export const sendFollowUp6MonthsEmail = async (
  email: string,
  name: string
): Promise<boolean> => {
  const template = emailTemplates.followUp6Months(name);
  return sendEmail({
    to: { email, name },
    template,
    variables: { userName: name }
  });
};

export default {
  emailTemplates,
  sendEmail,
  sendWelcomeEmail,
  sendAppointmentConfirmation,
  sendAppointmentReminder,
  sendBilanCompletedEmail,
  sendFollowUp6MonthsEmail,
};

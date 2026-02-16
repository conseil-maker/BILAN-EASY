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
import { supabase } from '../lib/supabaseClient';
import i18n from '../i18n';

const isTR = (): boolean => (i18n.language || 'fr') === 'tr';
const tEmail = (fr: string, tr: string): string => isTR() ? tr : fr;

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
    subject: tEmail(`Bienvenue chez ${organizationConfig.name} - Votre bilan de compétences`, `${organizationConfig.name} - Yetkinlik değerlendirmenize hoş geldiniz`),
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
            <h1>${isTR() ? `Hoş geldiniz ${userName}!` : `Bienvenue ${userName} !`}</h1>
            <p>${tEmail('Votre bilan de compétences commence', 'Yetkinlik değerlendirmeniz başlıyor')}</p>
          </div>
          <div class="content">
            <p>${tEmail(`Bonjour ${userName},`, `Merhaba ${userName},`)}</p>
            <p>${tEmail(`Nous sommes ravis de vous accueillir chez <strong>${organizationConfig.name}</strong> pour votre bilan de compétences.`, `Yetkinlik değerlendirmeniz için <strong>${organizationConfig.name}</strong>'e hoş geldiniz.`)}</p>
            
            <h3>${tEmail(`Votre forfait : ${packageName}`, `Paketiniz: ${packageName}`)}</h3>
            <p>${tEmail(`Vous avez choisi le forfait ${packageName}. Voici les prochaines étapes :`, `${packageName} paketini seçtiniz. Sonraki adımlar:`)}</p>
            <ol>
              <li>${tEmail('Complétez la phase préliminaire en ligne', 'Ön aşamayı çevrimiçi tamamlayın')}</li>
              <li>${tEmail("Répondez au questionnaire d'investigation", 'Araştırma anketini yanıtlayın')}</li>
              <li>${tEmail('Planifiez vos entretiens avec votre consultant', 'Danışmanınızla görüşmelerinizi planlayın')}</li>
            </ol>
            
            <a href="${organizationConfig.website}" class="button">${tEmail('Accéder à mon espace', 'Hesabıma eriş')}</a>
            
            <div class="qualiopi">
              <strong>🏆 ${tEmail('Organisme certifié Qualiopi', 'Qualiopi sertifikalı kurum')}</strong><br>
              N° ${organizationConfig.qualiopi}<br>
              ${tEmail('Votre bilan est éligible au financement CPF et OPCO.', 'Değerlendirmeniz CPF ve OPCO finansmanına uygundur.')}
            </div>
            
            <p>${tEmail('Votre consultant dédié', 'Atanmış danışmanınız')} : <strong>${organizationConfig.defaultConsultant.name}</strong></p>
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
    text: isTR() ? `
      Hoş geldiniz ${userName}!
      
      Yetkinlik değerlendirmeniz için ${organizationConfig.name}'e hoş geldiniz.
      
      Paketiniz: ${packageName}
      
      Sonraki adımlar:
      1. Ön aşamayı çevrimiçi tamamlayın
      2. Araştırma anketini yanıtlayın
      3. Danışmanınızla görüşmelerinizi planlayın
      
      Hesabınıza erişin: ${organizationConfig.website}
      
      Danışmanınız: ${organizationConfig.defaultConsultant.name}
      İletişim: ${organizationConfig.email} | ${organizationConfig.phone}
      
      ${organizationConfig.name}
      ${organizationConfig.address.full}
    ` : `
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
    subject: tEmail(`Confirmation de rendez-vous - ${date} à ${time}`, `Randevu onayı - ${date} saat ${time}`),
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
            <h1>✓ ${tEmail('Rendez-vous confirmé', 'Randevu onaylandı')}</h1>
          </div>
          <div class="content">
            <p>${tEmail(`Bonjour ${userName},`, `Merhaba ${userName},`)}</p>
            <p>${tEmail('Votre rendez-vous a bien été enregistré.', 'Randevunuz kaydedildi.')}</p>
            
            <div class="appointment-box">
              <h3 style="margin-top: 0;">📅 ${tEmail('Détails du rendez-vous', 'Randevu detayları')}</h3>
              <p><strong>${tEmail('Type', 'Tür')} :</strong> ${type}</p>
              <p><strong>${tEmail('Date', 'Tarih')} :</strong> ${date}</p>
              <p><strong>${tEmail('Heure', 'Saat')} :</strong> ${time}</p>
              <p><strong>${tEmail('Consultant', 'Danışman')} :</strong> ${consultantName}</p>
              <p><strong>${tEmail('Lieu', 'Yer')} :</strong> ${organizationConfig.address.full}</p>
            </div>
            
            <p>
              <a href="${organizationConfig.website}/#/rendez-vous" class="button">${tEmail('Gérer mes rendez-vous', 'Randevularımı yönet')}</a>
              <a href="mailto:${organizationConfig.email}?subject=${tEmail(`Modification RDV ${date}`, `Randevu değişikliği ${date}`)}" class="button button-secondary">${tEmail('Modifier/Annuler', 'Değiştir/İptal et')}</a>
            </p>
            
            <h4>📝 ${tEmail('Préparation', 'Hazırlık')}</h4>
            <p>${tEmail('Pour préparer au mieux cet entretien, nous vous invitons à :', 'Bu görüşmeye en iyi şekilde hazırlanmak için:')}</p>
            <ul>
              <li>${tEmail("Compléter le questionnaire en ligne si ce n'est pas déjà fait", 'Henüz yapmadıysanız çevrimiçi anketi tamamlayın')}</li>
              <li>${tEmail('Réfléchir aux questions que vous souhaitez aborder', 'Görüşmek istediğiniz soruları düşünün')}</li>
              <li>${tEmail('Apporter votre CV à jour (si disponible)', 'Güncel özgeçmişinizi getirin (varsa)')}</li>
            </ul>
          </div>
          <div class="footer">
            <p>${tEmail("En cas d'empêchement, merci de nous prévenir au moins 48h à l'avance.", 'Katılamamanız durumunda lütfen en az 48 saat önceden bizi bilgilendirin.')}</p>
            <p>${organizationConfig.name} | ${organizationConfig.phone} | ${organizationConfig.email}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: isTR() ? `
      Randevu onaylandı
      
      Merhaba ${userName},
      
      Randevunuz kaydedildi.
      
      Detaylar:
      - Tür: ${type}
      - Tarih: ${date}
      - Saat: ${time}
      - Danışman: ${consultantName}
      - Yer: ${organizationConfig.address.full}
      
      Katılamamanız durumunda lütfen en az 48 saat önceden bizi bilgilendirin.
      
      ${organizationConfig.name}
      ${organizationConfig.phone} | ${organizationConfig.email}
    ` : `
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
    subject: tEmail(`Rappel : Votre rendez-vous demain à ${time}`, `Hatırlatma: Yarınki randevunuz saat ${time}`),
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
            <h1>⏰ ${tEmail('Rappel rendez-vous', 'Randevu hatırlatması')}</h1>
          </div>
          <div class="content">
            <p>${tEmail(`Bonjour ${userName},`, `Merhaba ${userName},`)}</p>
            <p>${tEmail('Nous vous rappelons votre rendez-vous prévu <strong>demain</strong>.', 'Yarın için planlanan randevunuzu hatırlatırız.')}</p>
            
            <div class="reminder-box">
              <h3 style="margin-top: 0;">📅 ${tEmail('Demain', 'Yarın')}</h3>
              <p><strong>${tEmail('Type', 'Tür')} :</strong> ${type}</p>
              <p><strong>${tEmail('Date', 'Tarih')} :</strong> ${date}</p>
              <p><strong>${tEmail('Heure', 'Saat')} :</strong> ${time}</p>
              <p><strong>${tEmail('Adresse', 'Adres')} :</strong> ${organizationConfig.address.full}</p>
            </div>
            
            <p>${tEmail('Nous avons hâte de vous retrouver !', 'Sizinle görüşmeyi sabırsızlıkla bekliyoruz!')}</p>
          </div>
          <div class="footer">
            <p>${organizationConfig.name} | ${organizationConfig.phone}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: isTR() ? `
      Hatırlatma: Yarınki randevunuz
      
      Merhaba ${userName},
      
      Yarın için planlanan randevunuzu hatırlatırız.
      
      - Tür: ${type}
      - Tarih: ${date}
      - Saat: ${time}
      - Adres: ${organizationConfig.address.full}
      
      Sizinle görüşmeyi sabırsızlıkla bekliyoruz!
      
      ${organizationConfig.name}
    ` : `
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
    subject: tEmail(`Félicitations ! Votre bilan de compétences est terminé`, `Tebrikler! Yetkinlik değerlendirmeniz tamamlandı`),
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
            <h1>🎉 ${tEmail(`Félicitations ${userName} !`, `Tebrikler ${userName}!`)}</h1>
            <p>${tEmail('Votre bilan de compétences est terminé', 'Yetkinlik değerlendirmeniz tamamlandı')}</p>
          </div>
          <div class="content">
            <p>${tEmail(`Bonjour ${userName},`, `Merhaba ${userName},`)}</p>
            <p>${tEmail('Nous avons le plaisir de vous informer que votre bilan de compétences est maintenant terminé.', 'Yetkinlik değerlendirmenizin tamamlandığını bildirmekten mutluluk duyarız.')}</p>
            
            <div class="documents-box">
              <h3 style="margin-top: 0;">📁 ${tEmail('Vos documents sont disponibles', 'Belgeleriniz hazır')}</h3>
              <div class="document-item">
                <span>📄</span>
                <span style="margin-left: 10px;">${tEmail('Document de synthèse', 'Özet belgesi')}</span>
              </div>
              <div class="document-item">
                <span>✅</span>
                <span style="margin-left: 10px;">${tEmail('Attestation de présence', 'Katılım belgesi')}</span>
              </div>
              <div class="document-item">
                <span>🎯</span>
                <span style="margin-left: 10px;">${tEmail("Plan d'action personnalisé", 'Kişisel eylem planı')}</span>
              </div>
            </div>
            
            <a href="${organizationConfig.website}/#/mes-documents" class="button">${tEmail('Télécharger mes documents', 'Belgelerimi indir')}</a>
            
            <h4>📋 ${tEmail('Prochaines étapes', 'Sonraki adımlar')}</h4>
            <p>${tEmail("Votre document de synthèse vous appartient. Conformément à l'article L.6313-10-1 du Code du travail, il ne peut être communiqué à un tiers qu'avec votre accord écrit.", 'Özet belgeniz size aittir. İş Kanunu\'nun L.6313-10-1 maddesi uyarınca, yazılı onayınız olmadan üçüncü taraflara iletilemez.')}</p>
            
            <h4>🔄 ${tEmail('Suivi à 6 mois', '6 aylık takip')}</h4>
            <p>${tEmail('Nous vous recontacterons dans 6 mois pour faire le point sur la mise en œuvre de votre projet professionnel.', 'Mesleki projenizin uygulanması hakkında değerlendirme yapmak için 6 ay içinde sizinle tekrar iletişime geçeceğiz.')}</p>
            
            <h4>⭐ ${tEmail('Votre avis compte', 'Görüşünüz önemli')}</h4>
            <p>${tEmail("N'oubliez pas de compléter le questionnaire de satisfaction pour nous aider à améliorer nos services.", 'Hizmetlerimizi geliştirmemize yardımcı olmak için memnuniyet anketini doldurmayı unutmayın.')}</p>
            <a href="${organizationConfig.website}/#/satisfaction" class="button" style="background: #f59e0b;">${tEmail('Donner mon avis', 'Görüşümü bildir')}</a>
          </div>
          <div class="footer">
            <p>${tEmail('Merci de votre confiance !', 'Güveniniz için teşekkürler!')}</p>
            <p>${organizationConfig.name} | ${organizationConfig.phone} | ${organizationConfig.email}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: isTR() ? `
      Tebrikler ${userName}!
      
      Yetkinlik değerlendirmeniz tamamlandı.
      
      Belgeleriniz hazır:
      - Özet belgesi
      - Katılım belgesi
      - Kişisel eylem planı
      
      İndirin: ${organizationConfig.website}/#/mes-documents
      
      6 ay içinde sizinle tekrar iletişime geçeceğiz.
      
      Güveniniz için teşekkürler!
      ${organizationConfig.name}
    ` : `
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
    subject: tEmail(`${userName}, comment avance votre projet professionnel ?`, `${userName}, mesleki projeniz nasıl ilerliyor?`),
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
            <h1>📊 ${tEmail('Suivi à 6 mois', '6 aylık takip')}</h1>
          </div>
          <div class="content">
            <p>${tEmail(`Bonjour ${userName},`, `Merhaba ${userName},`)}</p>
            <p>${tEmail('Il y a 6 mois, vous avez terminé votre bilan de compétences avec nous. Nous espérons que vous avez pu avancer dans la réalisation de votre projet professionnel.', '6 ay önce bizimle yetkinlik değerlendirmenizi tamamladınız. Mesleki projenizin gerçekleştirilmesinde ilerleme kaydetmiş olmanızı umuyoruz.')}</p>
            
            <p>${tEmail('Conformément aux exigences Qualiopi, nous souhaiterions faire un point avec vous sur :', 'Qualiopi gereksinimlerine uygun olarak, aşağıdaki konularda sizinle değerlendirme yapmak istiyoruz:')}</p>
            <ul>
              <li>${tEmail("L'avancement de votre projet", 'Projenizin ilerlemesi')}</li>
              <li>${tEmail('Les actions mises en œuvre', 'Gerçekleştirilen eylemler')}</li>
              <li>${tEmail('Les éventuelles difficultés rencontrées', 'Karşılaşılan olası zorluklar')}</li>
            </ul>
            
            <a href="${organizationConfig.website}/#/rendez-vous" class="button">${tEmail('Planifier un entretien de suivi', 'Takip görüşmesi planla')}</a>
            
            <p>${tEmail('Ou répondez simplement à cet email pour nous donner de vos nouvelles.', 'Veya haberlerinizi vermek için bu e-postayı yanıtlayın.')}</p>
          </div>
          <div class="footer">
            <p>${organizationConfig.name} | ${organizationConfig.phone}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: isTR() ? `
      6 aylık takip
      
      Merhaba ${userName},
      
      6 ay önce bizimle yetkinlik değerlendirmenizi tamamladınız.
      
      Projenizin ilerlemesi hakkında sizinle değerlendirme yapmak istiyoruz.
      
      Görüşme planlayın: ${organizationConfig.website}/#/rendez-vous
      
      ${organizationConfig.name}
    ` : `
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
  
  // Mode production : envoi réel via Edge Function email-proxy (clé API côté serveur)
  try {
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/email-proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token || ''}`,
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
      console.error('❌ Erreur email-proxy:', errorData);
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

// Notification au consultant pour une nouvelle demande de RDV
export const sendAppointmentRequestNotification = async (
  clientName: string,
  clientEmail: string,
  reason: string,
  preferredDate?: string,
  preferredTime?: string,
  message?: string
): Promise<boolean> => {
  const consultantEmail = organizationConfig.defaultConsultant.email;
  const consultantName = organizationConfig.defaultConsultant.name;
  const dashboardUrl = `${organizationConfig.website}/#/consultant-dashboard`;
  
  const dateInfo = preferredDate 
    ? `${preferredDate}${preferredTime ? ` (${preferredTime})` : ''}` 
    : 'Non précisée';
  
  const template: EmailTemplate = {
    subject: `Nouvelle demande de RDV - ${clientName}`,
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
          .request-box { background: white; border: 2px solid #f59e0b; border-radius: 10px; padding: 20px; margin: 20px 0; }
          .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 0; font-weight: bold; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .message-box { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; font-style: italic; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📅 Nouvelle demande de rendez-vous</h1>
          </div>
          <div class="content">
            <p>Bonjour ${consultantName},</p>
            <p>Un client a fait une nouvelle demande de rendez-vous sur la plateforme Bilan-Easy.</p>
            
            <div class="request-box">
              <h3 style="margin-top: 0;">📋 Détails de la demande</h3>
              <p><strong>Client :</strong> ${clientName}</p>
              <p><strong>Email :</strong> <a href="mailto:${clientEmail}">${clientEmail}</a></p>
              <p><strong>Motif :</strong> ${reason}</p>
              <p><strong>Date souhaitée :</strong> ${dateInfo}</p>
            </div>
            
            ${message ? `<div class="message-box"><strong>Message du client :</strong><br/>"${message}"</div>` : ''}
            
            <p>Merci de contacter le client dans les meilleurs délais.</p>
            
            <p style="text-align: center;">
              <a href="${dashboardUrl}" class="button">Voir dans le dashboard</a>
            </p>
            
            <p style="text-align: center;">
              <a href="mailto:${clientEmail}?subject=Votre demande de rendez-vous - ${organizationConfig.name}" style="color: #f59e0b;">Répondre par email au client</a>
            </p>
          </div>
          <div class="footer">
            <p>Cet email a été envoyé automatiquement par la plateforme ${organizationConfig.name}.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Nouvelle demande de rendez-vous\n\nBonjour ${consultantName},\n\nUn client a fait une nouvelle demande de rendez-vous.\n\nClient : ${clientName}\nEmail : ${clientEmail}\nMotif : ${reason}\nDate souhaitée : ${dateInfo}\n${message ? `Message : ${message}\n` : ''}\nMerci de contacter le client dans les meilleurs délais.\n\nVoir dans le dashboard : ${dashboardUrl}`
  };
  
  return sendEmail({
    to: { email: consultantEmail, name: consultantName },
    template,
    variables: { clientName, clientEmail, reason }
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
  sendAppointmentRequestNotification,
};

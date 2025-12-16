import jsPDF from 'jspdf';

export interface ConventionData {
  clientName: string;
  clientEmail: string;
  clientAddress?: string;
  packageName: string;
  packageDuration: number; // en heures
  packagePrice: number;
  startDate: string;
  consultantName: string;
  consultantEmail: string;
  organizationName: string;
  organizationAddress: string;
  organizationSiret: string;
}

export interface AttestationData {
  clientName: string;
  packageName: string;
  packageDuration: number;
  startDate: string;
  endDate: string;
  consultantName: string;
  organizationName: string;
}

export const qualiopiDocuments = {
  /**
   * Génère la convention de prestation conforme Qualiopi
   */
  generateConvention(data: ConventionData): Blob {
    const doc = new jsPDF();
    let y = 20;
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxWidth = pageWidth - 2 * margin;

    // Helper pour ajouter du texte
    const addText = (text: string, fontSize: number = 11, isBold: boolean = false, align: 'left' | 'center' | 'right' = 'left') => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      
      const lines = doc.splitTextToSize(text, maxWidth);
      lines.forEach((line: string) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        
        if (align === 'center') {
          doc.text(line, pageWidth / 2, y, { align: 'center' });
        } else if (align === 'right') {
          doc.text(line, pageWidth - margin, y, { align: 'right' });
        } else {
          doc.text(line, margin, y);
        }
        
        y += fontSize * 0.5;
      });
      y += 3;
    };

    const addSection = (title: string) => {
      y += 5;
      doc.setFillColor(79, 70, 229);
      doc.rect(margin, y - 5, maxWidth, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(title, margin + 2, y);
      y += 10;
      doc.setTextColor(0, 0, 0);
    };

    // En-tête
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, pageWidth, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('CONVENTION DE PRESTATION', pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Bilan de Compétences', pageWidth / 2, 25, { align: 'center' });
    
    y = 45;
    doc.setTextColor(0, 0, 0);

    // Article 1 : Objet
    addSection('ARTICLE 1 : OBJET DE LA CONVENTION');
    addText(`La présente convention a pour objet la réalisation d'un bilan de compétences conformément aux articles L.6313-1 et suivants du Code du travail.`);
    addText(`Parcours choisi : ${data.packageName}`);
    addText(`Durée totale : ${data.packageDuration} heures maximum`);
    addText(`Date de début : ${data.startDate}`);

    // Article 2 : Parties
    addSection('ARTICLE 2 : PARTIES CONTRACTANTES');
    addText('Entre :', 11, true);
    addText(`${data.organizationName}`);
    addText(`Adresse : ${data.organizationAddress}`);
    addText(`SIRET : ${data.organizationSiret}`);
    addText(`Représenté par : ${data.consultantName}`);
    addText(`Email : ${data.consultantEmail}`);
    y += 5;
    addText('Et :', 11, true);
    addText(`${data.clientName}`);
    addText(`Email : ${data.clientEmail}`);
    if (data.clientAddress) {
      addText(`Adresse : ${data.clientAddress}`);
    }

    // Article 3 : Déroulement
    addSection('ARTICLE 3 : DÉROULEMENT DU BILAN');
    addText('Le bilan de compétences comprend obligatoirement trois phases :');
    addText('1. Phase préliminaire : Analyse du besoin et définition des objectifs (environ 17% du temps)');
    addText('2. Phase d\'investigation : Élaboration du projet professionnel (environ 50% du temps)');
    addText('3. Phase de conclusion : Restitution et plan d\'action (environ 17% du temps)');
    y += 3;
    addText('Le bénéficiaire peut interrompre le bilan à tout moment. Les résultats sont confidentiels et ne peuvent être communiqués à un tiers qu\'avec l\'accord du bénéficiaire.');

    // Article 4 : Moyens
    addSection('ARTICLE 4 : MOYENS MIS EN ŒUVRE');
    addText('Le prestataire met à disposition :');
    addText('- Un consultant certifié en bilan de compétences');
    addText('- Une plateforme numérique sécurisée (Bilan-Easy)');
    addText('- Des outils d\'évaluation et d\'analyse');
    addText('- Une base de données métiers et formations');
    addText('- Un document de synthèse personnalisé');

    // Article 5 : Livrables
    addSection('ARTICLE 5 : LIVRABLES');
    addText('À l\'issue du bilan, le bénéficiaire recevra :');
    addText('- Un document de synthèse détaillé');
    addText('- Un plan d\'action personnalisé');
    addText('- Une attestation de présence');
    addText('- L\'accès à l\'historique complet de son parcours');

    // Article 6 : Tarifs
    addSection('ARTICLE 6 : TARIFS ET MODALITÉS DE PAIEMENT');
    addText(`Coût total du bilan : ${data.packagePrice}€ TTC`);
    addText('Modalités de paiement : Selon les conditions convenues avec le financeur (CPF, OPCO, employeur, etc.)');

    // Article 7 : Confidentialité
    addSection('ARTICLE 7 : CONFIDENTIALITÉ');
    addText('Les résultats du bilan sont la propriété exclusive du bénéficiaire. Ils ne peuvent être communiqués à un tiers (employeur, financeur, etc.) qu\'avec l\'accord écrit du bénéficiaire.');
    addText('Le prestataire s\'engage à respecter la confidentialité des échanges et des données personnelles conformément au RGPD.');

    // Article 8 : Annulation
    addSection('ARTICLE 8 : ANNULATION ET INTERRUPTION');
    addText('Le bénéficiaire peut interrompre le bilan à tout moment. En cas d\'interruption, seules les heures effectivement réalisées seront facturées.');
    addText('En cas d\'absence non justifiée à deux rendez-vous consécutifs, le prestataire se réserve le droit de mettre fin à la prestation.');

    // Signatures
    y += 10;
    addText('Fait en deux exemplaires originaux', 11, false, 'center');
    addText(`Le ${new Date().toLocaleDateString('fr-FR')}`, 11, false, 'center');
    
    y += 15;
    const signatureY = y;
    
    // Signature prestataire
    doc.text('Le prestataire', margin + 20, signatureY);
    doc.text(data.consultantName, margin + 20, signatureY + 20);
    doc.line(margin, signatureY + 15, margin + 60, signatureY + 15);
    
    // Signature bénéficiaire
    doc.text('Le bénéficiaire', pageWidth - margin - 60, signatureY);
    doc.text(data.clientName, pageWidth - margin - 60, signatureY + 20);
    doc.line(pageWidth - margin - 60, signatureY + 15, pageWidth - margin, signatureY + 15);

    // Pied de page
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('Convention de prestation - Bilan de compétences conforme Qualiopi', pageWidth / 2, 285, { align: 'center' });

    return doc.output('blob');
  },

  /**
   * Génère l'attestation de présence conforme Qualiopi
   */
  generateAttestation(data: AttestationData): Blob {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = 60;

    // Bordure décorative
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(2);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

    // En-tête
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, pageWidth, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('ATTESTATION DE PRÉSENCE', pageWidth / 2, 25, { align: 'center' });
    doc.setFontSize(14);
    doc.text('Bilan de Compétences', pageWidth / 2, 35, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    y = 70;

    // Corps de l'attestation
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    const text1 = `Je soussigné(e), ${data.consultantName}, consultant(e) en bilan de compétences pour ${data.organizationName},`;
    const lines1 = doc.splitTextToSize(text1, pageWidth - 60);
    lines1.forEach((line: string) => {
      doc.text(line, pageWidth / 2, y, { align: 'center' });
      y += 7;
    });

    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('ATTESTE QUE', pageWidth / 2, y, { align: 'center' });
    y += 15;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(data.clientName, pageWidth / 2, y, { align: 'center' });
    y += 15;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const text2 = `a suivi et complété un bilan de compétences dans le cadre du parcours "${data.packageName}"`;
    const lines2 = doc.splitTextToSize(text2, pageWidth - 60);
    lines2.forEach((line: string) => {
      doc.text(line, pageWidth / 2, y, { align: 'center' });
      y += 7;
    });

    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.text(`Durée totale : ${data.packageDuration} heures`, pageWidth / 2, y, { align: 'center' });
    y += 10;
    doc.text(`Période : du ${data.startDate} au ${data.endDate}`, pageWidth / 2, y, { align: 'center' });

    y += 20;
    doc.setFont('helvetica', 'normal');
    const text3 = 'Ce bilan de compétences a été réalisé conformément aux articles L.6313-1 et suivants du Code du travail et au référentiel national qualité Qualiopi.';
    const lines3 = doc.splitTextToSize(text3, pageWidth - 60);
    lines3.forEach((line: string) => {
      doc.text(line, pageWidth / 2, y, { align: 'center' });
      y += 7;
    });

    y += 15;
    doc.setFont('helvetica', 'bold');
    doc.text('Le bénéficiaire a reçu :', pageWidth / 2, y, { align: 'center' });
    y += 10;
    doc.setFont('helvetica', 'normal');
    doc.text('- Un document de synthèse détaillé', pageWidth / 2, y, { align: 'center' });
    y += 7;
    doc.text('- Un plan d\'action personnalisé', pageWidth / 2, y, { align: 'center' });
    y += 7;
    doc.text('- L\'accès à son historique complet', pageWidth / 2, y, { align: 'center' });

    // Signature
    y += 30;
    doc.setFont('helvetica', 'normal');
    doc.text(`Fait à ${data.organizationName}`, pageWidth / 2, y, { align: 'center' });
    y += 7;
    doc.text(`Le ${new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, y, { align: 'center' });

    y += 20;
    doc.setFont('helvetica', 'bold');
    doc.text('Le consultant', pageWidth / 2, y, { align: 'center' });
    y += 15;
    doc.line(pageWidth / 2 - 40, y, pageWidth / 2 + 40, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.text(data.consultantName, pageWidth / 2, y, { align: 'center' });

    // Pied de page
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('Attestation de présence - Bilan de compétences conforme Qualiopi', pageWidth / 2, pageHeight - 15, { align: 'center' });

    return doc.output('blob');
  },

  /**
   * Génère le livret d'accueil
   */
  generateLivretAccueil(): Blob {
    const doc = new jsPDF();
    let y = 20;
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxWidth = pageWidth - 2 * margin;

    const addText = (text: string, fontSize: number = 11, isBold: boolean = false) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      const lines = doc.splitTextToSize(text, maxWidth);
      lines.forEach((line: string) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, margin, y);
        y += fontSize * 0.5;
      });
      y += 3;
    };

    const addSection = (title: string) => {
      y += 5;
      doc.setFillColor(79, 70, 229);
      doc.rect(margin, y - 5, maxWidth, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(title, margin + 2, y);
      y += 10;
      doc.setTextColor(0, 0, 0);
    };

    // En-tête
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('LIVRET D\'ACCUEIL', pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(14);
    doc.text('Bilan de Compétences', pageWidth / 2, 28, { align: 'center' });
    
    y = 50;
    doc.setTextColor(0, 0, 0);

    // Bienvenue
    addSection('BIENVENUE');
    addText('Nous sommes heureux de vous accompagner dans votre bilan de compétences. Ce livret vous présente le déroulement de votre parcours, vos droits et nos engagements.');

    // Qu'est-ce qu'un bilan de compétences
    addSection('QU\'EST-CE QU\'UN BILAN DE COMPÉTENCES ?');
    addText('Le bilan de compétences est une démarche d\'accompagnement qui vous permet de :');
    addText('• Analyser vos compétences professionnelles et personnelles');
    addText('• Identifier vos aptitudes et motivations');
    addText('• Définir un projet professionnel ou de formation');
    addText('• Élaborer un plan d\'action concret');

    // Les 3 phases
    addSection('LES 3 PHASES DU BILAN');
    addText('1. Phase préliminaire (17% du temps)', 11, true);
    addText('Analyse de votre besoin, définition de vos objectifs et présentation de la méthodologie.');
    y += 3;
    addText('2. Phase d\'investigation (50% du temps)', 11, true);
    addText('Exploration approfondie de vos compétences, valeurs, motivations et construction de votre projet professionnel.');
    y += 3;
    addText('3. Phase de conclusion (17% du temps)', 11, true);
    addText('Synthèse des résultats, validation de votre projet et élaboration d\'un plan d\'action détaillé.');

    // Vos droits
    addSection('VOS DROITS');
    addText('• Confidentialité : Les résultats du bilan vous appartiennent. Ils ne peuvent être communiqués à un tiers qu\'avec votre accord écrit.');
    addText('• Interruption : Vous pouvez interrompre le bilan à tout moment.');
    addText('• Accès aux données : Vous avez un droit d\'accès, de rectification et de suppression de vos données personnelles (RGPD).');

    // Nos engagements
    addSection('NOS ENGAGEMENTS QUALITÉ');
    addText('• Certification Qualiopi : Nous sommes certifiés Qualiopi, gage de qualité de nos prestations.');
    addText('• Consultants qualifiés : Nos consultants sont formés et expérimentés en bilan de compétences.');
    addText('• Outils professionnels : Nous utilisons des outils d\'évaluation reconnus et une plateforme numérique sécurisée.');
    addText('• Accompagnement personnalisé : Chaque bilan est unique et adapté à votre situation.');

    // Modalités pratiques
    addSection('MODALITÉS PRATIQUES');
    addText('• Durée : Maximum 24 heures réparties sur plusieurs semaines');
    addText('• Format : Entretiens individuels + travail personnel sur plateforme');
    addText('• Livrables : Document de synthèse, plan d\'action, attestation de présence');
    addText('• Suivi : Accès à votre espace personnel pendant et après le bilan');

    // Contact
    addSection('CONTACT');
    addText('Pour toute question, vous pouvez contacter votre consultant via la plateforme Bilan-Easy ou par email.');
    y += 5;
    addText('Nous vous souhaitons un excellent parcours !', 12, true);

    // Pied de page
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('Livret d\'accueil - Bilan de compétences conforme Qualiopi', pageWidth / 2, 285, { align: 'center' });

    return doc.output('blob');
  }
};

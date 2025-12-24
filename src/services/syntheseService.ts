import jsPDF from 'jspdf';
import { Summary, Answer } from '../types-ai-studio';
import { organizationConfig, getFullAddress } from '../config/organization';
import { CareerPath } from './geminiService';

export interface SyntheseData {
  userName: string;
  userEmail?: string;
  packageName: string;
  startDate: string;
  endDate: string;
  consultantName: string;
  organizationName: string;
  summary: Summary;
  answers: Answer[];
  projectProfessionnel?: string;
  planAction?: PlanActionItem[];
  metiersVises?: string[];
  formationsRecommandees?: string[];
  careerPaths?: CareerPath[]; // Pistes métiers explorées avec l'IA
}

export interface PlanActionItem {
  action: string;
  echeance: string;
  priorite: 'haute' | 'moyenne' | 'basse';
  statut: 'a_faire' | 'en_cours' | 'termine';
}

export const syntheseService = {
  /**
   * Génère le document de synthèse complet conforme Qualiopi
   */
  generateSynthese(data: SyntheseData): Blob {
    const doc = new jsPDF();
    let y = 20;
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxWidth = pageWidth - 2 * margin;

    const addText = (text: string, fontSize: number = 11, isBold: boolean = false, color: number[] = [0, 0, 0]) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      doc.setTextColor(color[0], color[1], color[2]);
      
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
      doc.setTextColor(0, 0, 0);
    };

    const addSection = (title: string) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      y += 8;
      doc.setFillColor(79, 70, 229);
      doc.rect(margin, y - 6, maxWidth, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text(title, margin + 3, y + 1);
      y += 12;
      doc.setTextColor(0, 0, 0);
    };

    const addSubSection = (title: string) => {
      y += 5;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(79, 70, 229);
      doc.text(title, margin, y);
      y += 8;
      doc.setTextColor(0, 0, 0);
    };

    // ========== PAGE DE GARDE ==========
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, pageWidth, 60, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('DOCUMENT DE SYNTHÈSE', pageWidth / 2, 25, { align: 'center' });
    doc.setFontSize(16);
    doc.text('Bilan de Compétences', pageWidth / 2, 40, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Conforme au référentiel Qualiopi', pageWidth / 2, 52, { align: 'center' });

    y = 80;
    doc.setTextColor(0, 0, 0);

    // Informations bénéficiaire
    doc.setFillColor(245, 245, 255);
    doc.rect(margin, y - 5, maxWidth, 50, 'F');
    doc.setDrawColor(79, 70, 229);
    doc.rect(margin, y - 5, maxWidth, 50, 'S');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Bénéficiaire', margin + 5, y + 5);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nom : ${data.userName}`, margin + 5, y + 15);
    doc.text(`Parcours : ${data.packageName}`, margin + 5, y + 23);
    doc.text(`Période : du ${data.startDate} au ${data.endDate}`, margin + 5, y + 31);
    doc.text(`Consultant : ${data.consultantName}`, margin + 5, y + 39);

    y = 145;

    // Mention légale
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    const legalText = 'Ce document de synthèse est établi conformément à l\'article R.6313-7 du Code du travail. ' +
      'Il est la propriété exclusive du bénéficiaire et ne peut être communiqué à un tiers qu\'avec son accord écrit.';
    const legalLines = doc.splitTextToSize(legalText, maxWidth);
    legalLines.forEach((line: string) => {
      doc.text(line, margin, y);
      y += 5;
    });

    // ========== NOUVELLE PAGE - CONTENU ==========
    doc.addPage();
    y = 20;

    // 1. CIRCONSTANCES DU BILAN
    addSection('1. CIRCONSTANCES DU BILAN');
    addText(`Ce bilan de compétences a été réalisé à la demande de ${data.userName} dans le cadre d'une démarche volontaire d'évolution professionnelle.`);
    addText(`Le bilan s'est déroulé du ${data.startDate} au ${data.endDate}, selon le parcours "${data.packageName}".`);
    addText('Il a respecté les trois phases réglementaires : phase préliminaire, phase d\'investigation et phase de conclusion.');

    // 2. COMPÉTENCES IDENTIFIÉES
    addSection('2. COMPÉTENCES IDENTIFIÉES');
    
    if (data.summary.strengths && data.summary.strengths.length > 0) {
      addSubSection('Points forts');
      data.summary.strengths.forEach((strength, i) => {
        addText(`• ${strength}`);
      });
    }

    if (data.summary.skills && data.summary.skills.length > 0) {
      addSubSection('Compétences clés');
      data.summary.skills.forEach((skill, i) => {
        addText(`• ${skill}`);
      });
    }

    // 3. APTITUDES ET MOTIVATIONS
    addSection('3. APTITUDES ET MOTIVATIONS');
    
    if (data.summary.motivations && data.summary.motivations.length > 0) {
      addSubSection('Motivations principales');
      data.summary.motivations.forEach((motivation, i) => {
        addText(`• ${motivation}`);
      });
    }

    if (data.summary.values && data.summary.values.length > 0) {
      addSubSection('Valeurs professionnelles');
      data.summary.values.forEach((value, i) => {
        addText(`• ${value}`);
      });
    }

    // 4. AXES DE DÉVELOPPEMENT
    addSection('4. AXES DE DÉVELOPPEMENT');
    
    if (data.summary.areasToImprove && data.summary.areasToImprove.length > 0) {
      addSubSection('Points à développer');
      data.summary.areasToImprove.forEach((area, i) => {
        addText(`• ${area}`);
      });
    }

    // 5. PROJET PROFESSIONNEL
    addSection('5. PROJET PROFESSIONNEL');
    
    if (data.projectProfessionnel) {
      addText(data.projectProfessionnel);
    } else if (data.summary.recommendations && data.summary.recommendations.length > 0) {
      addSubSection('Recommandations');
      data.summary.recommendations.forEach((rec, i) => {
        addText(`• ${rec}`);
      });
    }

    if (data.metiersVises && data.metiersVises.length > 0) {
      addSubSection('Métiers visés');
      data.metiersVises.forEach((metier, i) => {
        addText(`• ${metier}`);
      });
    }

    // 5bis. PISTES MÉTIERS EXPLORÉES (si exploration IA réalisée)
    if (data.careerPaths && data.careerPaths.length > 0) {
      addSection('5bis. PISTES MÉTIERS EXPLORÉES');
      addText('Les pistes suivantes ont été identifiées lors de l\'exploration personnalisée basée sur le profil du bénéficiaire et les tendances du marché du travail :');
      y += 5;
      
      data.careerPaths.forEach((path, index) => {
        // Vérifier si on a besoin d'une nouvelle page
        if (y > 230) {
          doc.addPage();
          y = 20;
        }
        
        // Titre du métier avec score
        addSubSection(`${index + 1}. ${path.title}`);
        
        // Description
        addText(path.description);
        
        // Score de correspondance et tendance
        const trendLabel = path.marketTrend === 'en_croissance' ? '↑ En croissance' : 
                          path.marketTrend === 'en_declin' ? '↓ En déclin' : '→ Stable';
        addText(`Correspondance : ${path.matchScore}% | Tendance marché : ${trendLabel} | Salaire : ${path.salaryRange}`, 10, false, [100, 100, 100]);
        
        // Raisons de correspondance
        if (path.matchReasons && path.matchReasons.length > 0) {
          addText('Pourquoi cette piste correspond :', 10, true);
          path.matchReasons.forEach(reason => {
            addText(`  • ${reason}`, 10);
          });
        }
        
        // Compétences à développer
        if (path.skillsToAcquire && path.skillsToAcquire.length > 0) {
          addText('Compétences à développer :', 10, true);
          addText(path.skillsToAcquire.join(', '), 10);
        }
        
        // Formations recommandées
        if (path.trainingPath && path.trainingPath.length > 0) {
          addText('Formations recommandées :', 10, true);
          path.trainingPath.forEach(training => {
            addText(`  • ${training}`, 10);
          });
        }
        
        // Prochaines étapes
        if (path.nextSteps && path.nextSteps.length > 0) {
          addText('Prochaines étapes :', 10, true);
          path.nextSteps.forEach((step, i) => {
            addText(`  ${i + 1}. ${step}`, 10);
          });
        }
        
        y += 8; // Espacement entre les pistes
      });
    }

    // 6. FORMATIONS RECOMMANDÉES
    if (data.formationsRecommandees && data.formationsRecommandees.length > 0) {
      addSection('6. FORMATIONS RECOMMANDÉES');
      data.formationsRecommandees.forEach((formation, i) => {
        addText(`• ${formation}`);
      });
    }

    // 7. PLAN D'ACTION
    addSection('7. PLAN D\'ACTION');
    
    if (data.planAction && data.planAction.length > 0) {
      // Tableau du plan d'action
      const tableTop = y;
      const colWidths = [80, 40, 30, 30];
      const headers = ['Action', 'Échéance', 'Priorité', 'Statut'];
      
      // En-têtes
      doc.setFillColor(79, 70, 229);
      doc.rect(margin, tableTop, maxWidth, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      
      let xPos = margin + 2;
      headers.forEach((header, i) => {
        doc.text(header, xPos, tableTop + 5);
        xPos += colWidths[i];
      });
      
      y = tableTop + 10;
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      
      data.planAction.forEach((item, index) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        
        const rowColor = index % 2 === 0 ? [255, 255, 255] : [245, 245, 255];
        doc.setFillColor(rowColor[0], rowColor[1], rowColor[2]);
        doc.rect(margin, y - 4, maxWidth, 10, 'F');
        
        xPos = margin + 2;
        const actionLines = doc.splitTextToSize(item.action, colWidths[0] - 4);
        doc.text(actionLines[0], xPos, y + 2);
        xPos += colWidths[0];
        doc.text(item.echeance, xPos, y + 2);
        xPos += colWidths[1];
        doc.text(item.priorite, xPos, y + 2);
        xPos += colWidths[2];
        doc.text(item.statut.replace('_', ' '), xPos, y + 2);
        
        y += 10;
      });
    } else {
      addText('Le plan d\'action détaillé sera élaboré avec le consultant lors de l\'entretien de suivi.');
    }

    // 8. CONCLUSION
    addSection('8. CONCLUSION');
    addText(`Ce bilan de compétences a permis à ${data.userName} d'identifier ses compétences, aptitudes et motivations, et de définir un projet professionnel cohérent avec son profil et le marché de l'emploi.`);
    addText('Un entretien de suivi est prévu 6 mois après la fin du bilan pour faire le point sur la mise en œuvre du plan d\'action.');

    // ========== PAGE SIGNATURES ==========
    doc.addPage();
    y = 30;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('SIGNATURES', pageWidth / 2, y, { align: 'center' });
    y += 20;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    addText('Le présent document de synthèse a été remis au bénéficiaire à l\'issue de la phase de conclusion du bilan de compétences.');
    addText('Le bénéficiaire reconnaît avoir reçu ce document et en avoir pris connaissance.');

    y += 20;

    // Zone signature consultant
    doc.setDrawColor(200, 200, 200);
    doc.rect(margin, y, 80, 50, 'S');
    doc.setFontSize(10);
    doc.text('Le consultant', margin + 25, y + 10);
    doc.text(data.consultantName, margin + 5, y + 25);
    doc.text(`Date : ${data.endDate}`, margin + 5, y + 35);
    doc.text('Signature :', margin + 5, y + 45);

    // Zone signature bénéficiaire
    doc.rect(pageWidth - margin - 80, y, 80, 50, 'S');
    doc.text('Le bénéficiaire', pageWidth - margin - 55, y + 10);
    doc.text(data.userName, pageWidth - margin - 75, y + 25);
    doc.text(`Date : ${data.endDate}`, pageWidth - margin - 75, y + 35);
    doc.text('Signature :', pageWidth - margin - 75, y + 45);

    y += 70;

    // Mentions légales finales
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    const finalLegal = [
      'MENTIONS LÉGALES',
      '',
      '• Ce document est strictement confidentiel (article L.6313-10-1 du Code du travail).',
      '• Il ne peut être communiqué à un tiers qu\'avec l\'accord écrit du bénéficiaire.',
      '• Le bénéficiaire est seul destinataire des résultats détaillés et du document de synthèse.',
      '• Ce bilan a été réalisé conformément aux articles L.6313-4 et R.6313-4 à R.6313-8 du Code du travail.',
      '',
      `Document généré le ${new Date().toLocaleDateString('fr-FR')} par ${data.organizationName}`
    ];
    
    finalLegal.forEach(line => {
      doc.text(line, margin, y);
      y += 5;
    });

    // Pied de page sur toutes les pages
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Document de synthèse - ${data.userName} - Page ${i}/${totalPages}`,
        pageWidth / 2,
        290,
        { align: 'center' }
      );
    }

    return doc.output('blob');
  },

  /**
   * Génère le plan d'action séparé
   */
  generatePlanAction(data: SyntheseData): Blob {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = 20;

    // En-tête
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('PLAN D\'ACTION', pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`${data.userName} - ${data.endDate}`, pageWidth / 2, 32, { align: 'center' });

    y = 55;
    doc.setTextColor(0, 0, 0);

    // Objectif principal
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Objectif principal', margin, y);
    y += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const objectif = data.projectProfessionnel || 'Définir et mettre en œuvre le projet professionnel identifié lors du bilan de compétences.';
    const objectifLines = doc.splitTextToSize(objectif, pageWidth - 2 * margin);
    objectifLines.forEach((line: string) => {
      doc.text(line, margin, y);
      y += 6;
    });

    y += 10;

    // Actions
    if (data.planAction && data.planAction.length > 0) {
      data.planAction.forEach((item, index) => {
        if (y > 250) {
          doc.addPage();
          y = 20;
        }

        // Numéro et priorité
        const prioriteColor = item.priorite === 'haute' ? [220, 38, 38] : 
                             item.priorite === 'moyenne' ? [234, 179, 8] : [34, 197, 94];
        
        doc.setFillColor(prioriteColor[0], prioriteColor[1], prioriteColor[2]);
        doc.circle(margin + 5, y + 3, 5, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(String(index + 1), margin + 3, y + 5);

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(item.action, margin + 15, y + 5);

        y += 12;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Échéance : ${item.echeance}`, margin + 15, y);
        doc.text(`Priorité : ${item.priorite}`, margin + 80, y);
        
        // Case à cocher
        doc.rect(pageWidth - margin - 15, y - 4, 10, 10, 'S');
        if (item.statut === 'termine') {
          doc.text('✓', pageWidth - margin - 12, y + 3);
        }

        y += 15;
      });
    }

    // Suivi
    y += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Suivi', margin, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Un entretien de suivi est prévu 6 mois après la fin du bilan pour évaluer la progression.', margin, y);

    return doc.output('blob');
  }
};

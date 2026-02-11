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

// Helper pour extraire des exemples pertinents des réponses
const extractExamplesFromAnswers = (answers: Answer[], keywords: string[]): string[] => {
  const examples: string[] = [];
  
  answers.forEach(answer => {
    if (answer.value && typeof answer.value === 'string') {
      const lowerValue = answer.value.toLowerCase();
      const hasKeyword = keywords.some(kw => lowerValue.includes(kw.toLowerCase()));
      
      if (hasKeyword && answer.value.length > 50 && answer.value.length < 500) {
        examples.push(answer.value);
      }
    }
  });
  
  return examples.slice(0, 3); // Max 3 exemples
};

// Helper pour extraire le parcours professionnel
const extractCareerPath = (answers: Answer[]): string => {
  const careerKeywords = ['parcours', 'expérience', 'poste', 'mission', 'responsabilité', 'commencé', 'premier'];
  const careerAnswers = answers.filter(a => 
    a.value && typeof a.value === 'string' && 
    careerKeywords.some(kw => a.value.toLowerCase().includes(kw))
  ).slice(0, 3);
  
  return careerAnswers.map(a => a.value).join('\n\n');
};

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
    
    // Profil identifié
    if (data.summary.profileType) {
      addSubSection('Profil identifié');
      addText(`Type de profil : ${data.summary.profileType}`, 12, true, [79, 70, 229]);
    }
    
    // Niveau de maturité du projet
    if (data.summary.maturityLevel) {
      addSubSection('Maturité du projet');
      addText(data.summary.maturityLevel);
    }
    
    // Thèmes prioritaires
    if (data.summary.priorityThemes && data.summary.priorityThemes.length > 0) {
      addSubSection('Thèmes prioritaires identifiés');
      data.summary.priorityThemes.forEach((theme) => {
        addText(`• ${theme}`);
      });
    }

    // 1.5 PARCOURS PROFESSIONNEL
    const careerPath = extractCareerPath(data.answers);
    if (careerPath) {
      addSection('1.5. PARCOURS PROFESSIONNEL');
      addSubSection('Synthèse du parcours');
      addText(careerPath);
    }

    // 2. COMPÉTENCES IDENTIFIÉES
    addSection('2. COMPÉTENCES IDENTIFIÉES');
    
    // Utiliser strengths si disponible, sinon extraire de keyStrengths
    const strengths = data.summary.strengths || 
      (data.summary.keyStrengths?.map(s => typeof s === 'string' ? s : s.text) || []);
    
    if (strengths.length > 0) {
      addSubSection('Points forts');
      strengths.forEach((strength) => {
        addText(`• ${strength}`);
      });
      
      // Ajouter des exemples concrets
      const examples = extractExamplesFromAnswers(data.answers, ['structur', 'organis', 'coordin', 'facilit']);
      if (examples.length > 0) {
        addSubSection('Exemples concrets tirés du bilan');
        examples.forEach((example, i) => {
          addText(`Exemple ${i + 1} :`, 11, true);
          addText(`« ${example.substring(0, 300)}${example.length > 300 ? '...' : ''} »`, 10, false, [60, 60, 60]);
        });
      }
    }

    if (data.summary.skills && data.summary.skills.length > 0) {
      addSubSection('Compétences clés');
      data.summary.skills.forEach((skill) => {
        addText(`• ${skill}`);
      });
    }

    // 3. APTITUDES ET MOTIVATIONS
    addSection('3. APTITUDES ET MOTIVATIONS');
    
    // Motivations
    if (data.summary.motivations && data.summary.motivations.length > 0) {
      addSubSection('Motivations principales');
      data.summary.motivations.forEach((motivation) => {
        addText(`• ${motivation}`);
      });
    } else {
      // Extraire des motivations depuis les réponses
      const motivationExamples = extractExamplesFromAnswers(data.answers, ['motiv', 'stimul', 'satisf', 'appréci', 'aim']);
      if (motivationExamples.length > 0) {
        addSubSection('Motivations identifiées');
        motivationExamples.forEach((example) => {
          addText(`• ${example.substring(0, 200)}${example.length > 200 ? '...' : ''}`);
        });
      }
    }

    // Valeurs
    if (data.summary.values && data.summary.values.length > 0) {
      addSubSection('Valeurs professionnelles');
      data.summary.values.forEach((value) => {
        addText(`• ${value}`);
      });
    } else {
      // Extraire des valeurs depuis les réponses
      const valueExamples = extractExamplesFromAnswers(data.answers, ['valeur', 'important', 'priorité', 'essentiel', 'respect']);
      if (valueExamples.length > 0) {
        addSubSection('Valeurs professionnelles identifiées');
        valueExamples.forEach((example) => {
          addText(`• ${example.substring(0, 200)}${example.length > 200 ? '...' : ''}`);
        });
      }
    }
    
    // Environnement de travail recherché
    const environmentExamples = extractExamplesFromAnswers(data.answers, ['environnement', 'ambiance', 'autonomie', 'collabor', 'équipe']);
    if (environmentExamples.length > 0) {
      addSubSection('Environnement de travail recherché');
      environmentExamples.forEach((example) => {
        addText(`• ${example.substring(0, 200)}${example.length > 200 ? '...' : ''}`);
      });
    }

    // 4. AXES DE DÉVELOPPEMENT
    addSection('4. AXES DE DÉVELOPPEMENT');
    
    // Utiliser areasToImprove si disponible, sinon extraire de areasForDevelopment
    const areasToImprove = data.summary.areasToImprove || 
      (data.summary.areasForDevelopment?.map(a => typeof a === 'string' ? a : a.text) || []);
    
    if (areasToImprove.length > 0) {
      addSubSection('Points à développer');
      areasToImprove.forEach((area) => {
        addText(`• ${area}`);
      });
    }

    // 5. PROJET PROFESSIONNEL
    addSection('5. PROJET PROFESSIONNEL');
    
    // Projet professionnel détaillé
    if (data.projectProfessionnel || data.summary.projectProfessionnel) {
      addText(data.projectProfessionnel || data.summary.projectProfessionnel || '');
    }
    
    // Recommandations
    if (data.summary.recommendations && data.summary.recommendations.length > 0) {
      addSubSection('Recommandations');
      data.summary.recommendations.forEach((rec) => {
        addText(`• ${rec}`);
      });
    }

    // Métiers visés
    if (data.metiersVises && data.metiersVises.length > 0) {
      addSubSection('Métiers visés');
      data.metiersVises.forEach((metier) => {
        addText(`• ${metier}`);
      });
    } else if (data.careerPaths && data.careerPaths.length > 0) {
      addSubSection('Métiers visés');
      data.careerPaths.slice(0, 5).forEach((path) => {
        addText(`• ${path.title} (correspondance : ${path.matchScore}%)`);
      });
    }
    
    // Secteurs d'activité
    if (data.careerPaths && data.careerPaths.length > 0) {
      const sectors = [...new Set(data.careerPaths.map(p => p.sector).filter(Boolean))];
      if (sectors.length > 0) {
        addSubSection('Secteurs d\'activité privilégiés');
        sectors.forEach((sector) => {
          addText(`• ${sector}`);
        });
      }
    }
    
    // Formations recommandées
    if (data.formationsRecommandees && data.formationsRecommandees.length > 0) {
      addSubSection('Formations recommandées');
      data.formationsRecommandees.forEach((formation) => {
        addText(`• ${formation}`);
      });
    } else if (data.careerPaths && data.careerPaths.length > 0) {
      const allFormations = data.careerPaths.flatMap(p => p.requiredSkills || []);
      const uniqueFormations = [...new Set(allFormations)].slice(0, 5);
      if (uniqueFormations.length > 0) {
        addSubSection('Compétences à développer');
        uniqueFormations.forEach((skill) => {
          addText(`• ${skill}`);
        });
      }
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
    
    // Utiliser le plan d'action du summary si disponible
    const hasActionPlanFromSummary = data.summary.actionPlan && 
      (data.summary.actionPlan.shortTerm?.length > 0 || data.summary.actionPlan.mediumTerm?.length > 0);
    
    if (hasActionPlanFromSummary) {
      // Afficher le plan d'action structuré du summary
      if (data.summary.actionPlan.shortTerm && data.summary.actionPlan.shortTerm.length > 0) {
        addSubSection('Actions à court terme (1-3 mois)');
        data.summary.actionPlan.shortTerm.forEach((item, i) => {
          const text = typeof item === 'string' ? item : item.text;
          addText(`${i + 1}. ${text}`, 11, false);
          addText('   Priorité : Haute | Échéance : 1-3 mois', 9, false, [100, 100, 100]);
        });
      }
      
      if (data.summary.actionPlan.mediumTerm && data.summary.actionPlan.mediumTerm.length > 0) {
        addSubSection('Actions à moyen terme (3-6 mois)');
        data.summary.actionPlan.mediumTerm.forEach((item, i) => {
          const text = typeof item === 'string' ? item : item.text;
          addText(`${i + 1}. ${text}`, 11, false);
          addText('   Priorité : Moyenne | Échéance : 3-6 mois', 9, false, [100, 100, 100]);
        });
      }
      
      if (data.summary.actionPlan.longTerm && data.summary.actionPlan.longTerm.length > 0) {
        addSubSection('Actions à long terme (6-12 mois)');
        data.summary.actionPlan.longTerm.forEach((item, i) => {
          const text = typeof item === 'string' ? item : item.text;
          addText(`${i + 1}. ${text}`, 11, false);
          addText('   Priorité : Basse | Échéance : 6-12 mois', 9, false, [100, 100, 100]);
        });
      }
    } else if (data.planAction && data.planAction.length > 0) {
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
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    const actionTextWidth = contentWidth - 20; // Espace pour la pastille numérotée
    let y = 20;

    // Fonction utilitaire pour vérifier si on doit ajouter une nouvelle page
    const checkPageBreak = (neededSpace: number) => {
      if (y + neededSpace > pageHeight - 30) {
        doc.addPage();
        y = 25;
      }
    };

    // === EN-TÊTE ===
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, pageWidth, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('PLAN D\'ACTION', pageWidth / 2, 22, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`${data.userName} - ${data.endDate}`, pageWidth / 2, 36, { align: 'center' });

    y = 60;
    doc.setTextColor(0, 0, 0);

    // === OBJECTIF PRINCIPAL ===
    doc.setFillColor(245, 243, 255);
    doc.roundedRect(margin, y - 5, contentWidth, 10, 2, 2, 'F');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229);
    doc.text('Objectif principal', margin + 5, y + 2);
    y += 12;

    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const objectif = data.projectProfessionnel || 'Définir et mettre en oeuvre le projet professionnel identifié lors du bilan de compétences.';
    const objectifLines = doc.splitTextToSize(objectif, contentWidth - 10);
    objectifLines.forEach((line: string) => {
      checkPageBreak(6);
      doc.text(line, margin + 5, y);
      y += 6;
    });

    y += 12;

    // === ACTIONS PAR SECTION ===
    if (data.planAction && data.planAction.length > 0) {
      // Regrouper les actions par échéance
      const sections = [
        {
          title: 'Court terme (0-3 mois)',
          color: [220, 38, 38] as number[],
          bgColor: [254, 242, 242] as number[],
          items: data.planAction.filter(a => a.priorite === 'haute'),
        },
        {
          title: 'Moyen terme (3-6 mois)',
          color: [234, 179, 8] as number[],
          bgColor: [254, 252, 232] as number[],
          items: data.planAction.filter(a => a.priorite === 'moyenne'),
        },
        {
          title: 'Long terme (6-12 mois)',
          color: [34, 197, 94] as number[],
          bgColor: [240, 253, 244] as number[],
          items: data.planAction.filter(a => a.priorite === 'basse'),
        },
      ];

      let globalIndex = 1;

      sections.forEach((section) => {
        if (section.items.length === 0) return;

        checkPageBreak(30);

        // Titre de section avec barre colorée
        doc.setFillColor(section.color[0], section.color[1], section.color[2]);
        doc.rect(margin, y, 4, 12, 'F');
        doc.setFillColor(section.bgColor[0], section.bgColor[1], section.bgColor[2]);
        doc.roundedRect(margin + 4, y, contentWidth - 4, 12, 0, 0, 'F');
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(section.color[0], section.color[1], section.color[2]);
        doc.text(section.title, margin + 10, y + 8);
        y += 18;

        // Actions de cette section
        section.items.forEach((item) => {
          // Calculer la hauteur nécessaire pour cette action
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          const actionLines = doc.splitTextToSize(item.action, actionTextWidth);
          const actionHeight = actionLines.length * 5.5 + 18; // Texte + échéance + marge
          
          checkPageBreak(actionHeight);

          // Pastille numérotée
          doc.setFillColor(section.color[0], section.color[1], section.color[2]);
          doc.circle(margin + 6, y + 4, 6, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          const numStr = String(globalIndex);
          doc.text(numStr, margin + 6 - (doc.getTextWidth(numStr) / 2), y + 6);

          // Texte de l'action (wrappé sur plusieurs lignes)
          doc.setTextColor(30, 30, 30);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          actionLines.forEach((line: string, lineIndex: number) => {
            doc.text(line, margin + 16, y + 4 + (lineIndex * 5.5));
          });

          y += actionLines.length * 5.5 + 4;

          // Échéance et priorité
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100, 100, 100);
          doc.text(`Echeance : ${item.echeance}`, margin + 16, y);
          
          // Badge priorité
          const prioriteLabel = item.priorite.charAt(0).toUpperCase() + item.priorite.slice(1);
          doc.setFillColor(section.color[0], section.color[1], section.color[2]);
          const badgeX = margin + 90;
          doc.roundedRect(badgeX, y - 3.5, 30, 5, 1.5, 1.5, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.text(prioriteLabel, badgeX + 15, y, { align: 'center' });

          // Case à cocher
          doc.setDrawColor(180, 180, 180);
          doc.setLineWidth(0.5);
          doc.roundedRect(pageWidth - margin - 12, y - 4, 8, 8, 1, 1, 'S');
          if (item.statut === 'termine') {
            doc.setTextColor(34, 197, 94);
            doc.setFontSize(10);
            doc.text('v', pageWidth - margin - 9, y + 2);
          }

          y += 12;
          globalIndex++;
        });

        y += 6; // Espacement entre sections
      });
    }

    // === SECTION SUIVI ===
    checkPageBreak(40);
    y += 5;
    doc.setFillColor(240, 249, 255);
    doc.roundedRect(margin, y - 5, contentWidth, 35, 3, 3, 'F');
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y - 5, contentWidth, 35, 3, 3, 'S');

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text('Suivi post-bilan', margin + 8, y + 4);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    const suiviText = 'Un entretien de suivi est prévu 6 mois après la fin du bilan pour évaluer la progression de votre projet professionnel et ajuster le plan d\'action si nécessaire.';
    const suiviLines = doc.splitTextToSize(suiviText, contentWidth - 16);
    suiviLines.forEach((line: string, i: number) => {
      doc.text(line, margin + 8, y + 14 + (i * 5.5));
    });

    // === PIED DE PAGE ===
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Plan d'action - ${data.userName} - ${data.organizationName || 'BILAN-EASY'} - Page ${i}/${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    return doc.output('blob');
  }
};

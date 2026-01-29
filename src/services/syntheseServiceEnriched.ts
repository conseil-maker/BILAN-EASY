/**
 * Service de synthèse PDF enrichi pour atteindre 10-15 pages
 * 
 * Ce service étend le service de synthèse existant avec des sections supplémentaires :
 * - Analyse approfondie des compétences avec visualisation
 * - Bilan des intérêts professionnels (RIASEC)
 * - Analyse détaillée des valeurs
 * - Synthèse des entretiens
 * - Ressources et contacts utiles
 * - Annexes avec détail des réponses
 * 
 * @author Manus AI
 * @date 27 janvier 2026
 */

import jsPDF from 'jspdf';
import { Summary, Answer } from '../types-ai-studio';
import { organizationConfig, getFullAddress } from '../config/organization';
import { CareerPath, MarketExplorationResult, JobInterviewResult } from './geminiService';
import { SyntheseData, PlanActionItem } from './syntheseService';

// Types pour les analyses enrichies
interface CompetenceAnalysis {
  category: string;
  level: number; // 1-5
  examples: string[];
  developmentSuggestions: string[];
}

interface RIASECProfile {
  realistic: number;
  investigative: number;
  artistic: number;
  social: number;
  enterprising: number;
  conventional: number;
}

interface ValueAnalysis {
  value: string;
  importance: 'haute' | 'moyenne' | 'basse';
  manifestation: string;
}

// Interface pour l'analyse de faisabilité du projet
interface FeasibilityData {
  marketExploration?: MarketExplorationResult;
  jobInterview?: JobInterviewResult;
  feasibilityReport?: {
    summary: string;
    feasibilityScore: number;
    keyFindings: string[];
    actionItems: string[];
    risks: string[];
    opportunities: string[];
  };
}

// Helper pour extraire le profil RIASEC des réponses
const extractRIASECProfile = (answers: Answer[]): RIASECProfile => {
  const profile: RIASECProfile = {
    realistic: 0,
    investigative: 0,
    artistic: 0,
    social: 0,
    enterprising: 0,
    conventional: 0
  };
  
  const keywords = {
    realistic: ['technique', 'pratique', 'concret', 'manuel', 'outil', 'machine', 'construire', 'réparer'],
    investigative: ['analyser', 'recherche', 'comprendre', 'science', 'données', 'logique', 'résoudre', 'étudier'],
    artistic: ['créatif', 'artistique', 'imagination', 'design', 'expression', 'original', 'innovation', 'esthétique'],
    social: ['aider', 'accompagner', 'enseigner', 'équipe', 'relation', 'communiquer', 'écouter', 'soutenir'],
    enterprising: ['diriger', 'vendre', 'convaincre', 'entreprendre', 'négocier', 'leadership', 'décision', 'influence'],
    conventional: ['organiser', 'planifier', 'méthode', 'précis', 'procédure', 'administratif', 'structurer', 'classer']
  };
  
  answers.forEach(answer => {
    if (answer.value && typeof answer.value === 'string') {
      const lowerValue = answer.value.toLowerCase();
      
      Object.entries(keywords).forEach(([type, words]) => {
        words.forEach(word => {
          if (lowerValue.includes(word)) {
            profile[type as keyof RIASECProfile] += 1;
          }
        });
      });
    }
  });
  
  // Normaliser sur 100
  const maxScore = Math.max(...Object.values(profile), 1);
  Object.keys(profile).forEach(key => {
    profile[key as keyof RIASECProfile] = Math.round((profile[key as keyof RIASECProfile] / maxScore) * 100);
  });
  
  return profile;
};

// Helper pour extraire les compétences détaillées
const extractDetailedCompetences = (answers: Answer[], summary: Summary): CompetenceAnalysis[] => {
  const categories = [
    { name: 'Communication', keywords: ['communiquer', 'présenter', 'expliquer', 'écouter', 'rédiger', 'oral', 'écrit'] },
    { name: 'Leadership', keywords: ['diriger', 'manager', 'encadrer', 'motiver', 'déléguer', 'équipe', 'responsabilité'] },
    { name: 'Organisation', keywords: ['organiser', 'planifier', 'coordonner', 'gérer', 'priorité', 'temps', 'projet'] },
    { name: 'Analyse', keywords: ['analyser', 'résoudre', 'synthétiser', 'évaluer', 'diagnostic', 'problème', 'solution'] },
    { name: 'Créativité', keywords: ['créer', 'innover', 'imaginer', 'concevoir', 'idée', 'original', 'nouveau'] },
    { name: 'Relationnel', keywords: ['relation', 'collaborer', 'négocier', 'réseau', 'partenaire', 'client', 'contact'] },
    { name: 'Technique', keywords: ['technique', 'outil', 'logiciel', 'méthode', 'procédure', 'système', 'informatique'] },
    { name: 'Adaptabilité', keywords: ['adapter', 'flexible', 'changement', 'apprendre', 'évolution', 'polyvalent', 'réactif'] }
  ];
  
  return categories.map(cat => {
    let score = 0;
    const examples: string[] = [];
    
    answers.forEach(answer => {
      if (answer.value && typeof answer.value === 'string') {
        const lowerValue = answer.value.toLowerCase();
        const hasKeyword = cat.keywords.some(kw => lowerValue.includes(kw));
        
        if (hasKeyword) {
          score += 1;
          if (examples.length < 2 && answer.value.length > 50 && answer.value.length < 300) {
            examples.push(answer.value);
          }
        }
      }
    });
    
    // Normaliser le niveau sur 5
    const level = Math.min(5, Math.max(1, Math.round(score / 2) + 1));
    
    return {
      category: cat.name,
      level,
      examples,
      developmentSuggestions: level < 4 ? [`Renforcer les compétences en ${cat.name.toLowerCase()}`] : []
    };
  });
};

// Helper pour extraire les valeurs détaillées
const extractDetailedValues = (answers: Answer[]): ValueAnalysis[] => {
  const valueKeywords = {
    'Autonomie': ['autonome', 'indépendant', 'liberté', 'décider seul'],
    'Sécurité': ['sécurité', 'stable', 'garanti', 'pérenne'],
    'Reconnaissance': ['reconnu', 'valorisé', 'apprécié', 'respecté'],
    'Équilibre vie pro/perso': ['équilibre', 'famille', 'temps libre', 'vie personnelle'],
    'Sens du travail': ['sens', 'utilité', 'impact', 'contribution'],
    'Rémunération': ['salaire', 'rémunération', 'revenus', 'argent'],
    'Évolution': ['évoluer', 'progresser', 'carrière', 'promotion'],
    'Créativité': ['créatif', 'innover', 'imagination', 'original'],
    'Relations humaines': ['équipe', 'collègues', 'ambiance', 'convivial'],
    'Challenge': ['défi', 'challenge', 'stimulant', 'complexe']
  };
  
  const values: ValueAnalysis[] = [];
  
  Object.entries(valueKeywords).forEach(([value, keywords]) => {
    let count = 0;
    let manifestation = '';
    
    answers.forEach(answer => {
      if (answer.value && typeof answer.value === 'string') {
        const lowerValue = answer.value.toLowerCase();
        keywords.forEach(kw => {
          if (lowerValue.includes(kw)) {
            count++;
            if (!manifestation && answer.value.length > 30 && answer.value.length < 200) {
              manifestation = answer.value;
            }
          }
        });
      }
    });
    
    if (count > 0) {
      values.push({
        value,
        importance: count >= 3 ? 'haute' : count >= 2 ? 'moyenne' : 'basse',
        manifestation: manifestation || `Expression de la valeur "${value}" dans les réponses`
      });
    }
  });
  
  // Trier par importance
  return values.sort((a, b) => {
    const order = { haute: 0, moyenne: 1, basse: 2 };
    return order[a.importance] - order[b.importance];
  }).slice(0, 8);
};

export const syntheseServiceEnriched = {
  /**
   * Génère le document de synthèse enrichi (10-15 pages)
   */
  generateEnrichedSynthese(data: SyntheseData, feasibilityData?: FeasibilityData): Blob {
    const doc = new jsPDF();
    let y = 20;
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxWidth = pageWidth - 2 * margin;

    // Helpers
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

    const addSection = (title: string, sectionNumber?: string) => {
      if (y > 240) {
        doc.addPage();
        y = 20;
      }
      y += 8;
      doc.setFillColor(79, 70, 229);
      doc.rect(margin, y - 6, maxWidth, 12, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      const titleText = sectionNumber ? `${sectionNumber}. ${title}` : title;
      doc.text(titleText, margin + 3, y + 2);
      y += 16;
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

    const drawProgressBar = (x: number, yPos: number, width: number, value: number, label: string) => {
      // Label
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(label, x, yPos - 2);
      
      // Barre de fond
      doc.setFillColor(230, 230, 230);
      doc.rect(x, yPos, width, 6, 'F');
      
      // Barre de progression
      const progressWidth = (value / 100) * width;
      doc.setFillColor(79, 70, 229);
      doc.rect(x, yPos, progressWidth, 6, 'F');
      
      // Pourcentage
      doc.setFontSize(8);
      doc.text(`${value}%`, x + width + 3, yPos + 5);
    };

    // ========== PAGE DE GARDE ==========
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, pageWidth, 70, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.text('DOCUMENT DE SYNTHÈSE', pageWidth / 2, 28, { align: 'center' });
    doc.setFontSize(18);
    doc.text('Bilan de Compétences', pageWidth / 2, 45, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Conforme au référentiel Qualiopi', pageWidth / 2, 60, { align: 'center' });

    y = 90;
    doc.setTextColor(0, 0, 0);

    // Informations bénéficiaire
    doc.setFillColor(245, 245, 255);
    doc.rect(margin, y - 5, maxWidth, 55, 'F');
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(0.5);
    doc.rect(margin, y - 5, maxWidth, 55, 'S');
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Informations du bénéficiaire', margin + 5, y + 8);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nom : ${data.userName}`, margin + 5, y + 20);
    doc.text(`Email : ${data.userEmail || 'Non renseigné'}`, margin + 5, y + 28);
    doc.text(`Parcours : ${data.packageName}`, margin + 5, y + 36);
    doc.text(`Période : du ${data.startDate} au ${data.endDate}`, margin + 5, y + 44);

    y = 160;

    // Informations organisme
    doc.setFillColor(255, 250, 245);
    doc.rect(margin, y - 5, maxWidth, 40, 'F');
    doc.setDrawColor(234, 179, 8);
    doc.rect(margin, y - 5, maxWidth, 40, 'S');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Organisme prestataire', margin + 5, y + 8);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${data.organizationName}`, margin + 5, y + 18);
    doc.text(`Consultant référent : ${data.consultantName}`, margin + 5, y + 26);
    doc.text(`Numéro de déclaration d'activité : ${organizationConfig.declarationNumber || 'En cours'}`, margin + 5, y + 34);

    y = 220;

    // Mention légale
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    const legalText = 'Ce document de synthèse est établi conformément aux articles L.6313-4 et R.6313-7 du Code du travail. ' +
      'Il est la propriété exclusive du bénéficiaire et ne peut être communiqué à un tiers qu\'avec son accord écrit préalable. ' +
      'Le bénéficiaire est seul destinataire des résultats détaillés et du présent document de synthèse.';
    const legalLines = doc.splitTextToSize(legalText, maxWidth);
    legalLines.forEach((line: string) => {
      doc.text(line, margin, y);
      y += 5;
    });

    // ========== SOMMAIRE ==========
    doc.addPage();
    y = 30;
    
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229);
    doc.text('SOMMAIRE', pageWidth / 2, y, { align: 'center' });
    y += 20;
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const sommaire = [
      { num: '1', title: 'Circonstances et objectifs du bilan', page: 3 },
      { num: '2', title: 'Profil du bénéficiaire', page: 4 },
      { num: '3', title: 'Analyse approfondie des compétences', page: 5 },
      { num: '4', title: 'Bilan des intérêts professionnels (RIASEC)', page: 6 },
      { num: '5', title: 'Analyse des valeurs professionnelles', page: 7 },
      { num: '6', title: 'Aptitudes et motivations', page: 8 },
      { num: '7', title: 'Axes de développement', page: 9 },
      { num: '8', title: 'Projet professionnel', page: 10 },
      { num: '9', title: 'Pistes métiers explorées', page: 11 },
      { num: '10', title: 'Plan d\'action', page: 12 },
      { num: '11', title: 'Ressources et contacts utiles', page: 13 },
      { num: '12', title: 'Conclusion et suivi', page: 14 },
      { num: '', title: 'Annexes', page: 15 }
    ];
    
    sommaire.forEach(item => {
      const dots = '.'.repeat(Math.max(0, 60 - item.title.length - item.num.length));
      doc.text(`${item.num}${item.num ? '.' : ''} ${item.title} ${dots} ${item.page}`, margin, y);
      y += 8;
    });

    // ========== SECTION 1: CIRCONSTANCES ==========
    doc.addPage();
    y = 20;
    
    addSection('CIRCONSTANCES ET OBJECTIFS DU BILAN', '1');
    
    addSubSection('Contexte de la demande');
    addText(`Ce bilan de compétences a été réalisé à la demande de ${data.userName} dans le cadre d'une démarche volontaire d'évolution professionnelle.`);
    addText(`Le bilan s'est déroulé du ${data.startDate} au ${data.endDate}, selon le parcours "${data.packageName}".`);
    
    addSubSection('Déroulement du bilan');
    addText('Le bilan de compétences s\'est déroulé conformément aux dispositions légales et réglementaires, en trois phases distinctes :');
    y += 5;
    addText('• Phase préliminaire : analyse de la demande, définition des objectifs, présentation de la méthodologie');
    addText('• Phase d\'investigation : exploration du parcours, identification des compétences, analyse des motivations et valeurs, élaboration du projet');
    addText('• Phase de conclusion : synthèse des résultats, définition du plan d\'action, remise des documents');
    
    addSubSection('Objectifs définis');
    if (data.summary.priorityThemes && data.summary.priorityThemes.length > 0) {
      addText('Les objectifs suivants ont été définis lors de la phase préliminaire :');
      data.summary.priorityThemes.forEach(theme => {
        addText(`• ${theme}`);
      });
    } else {
      addText('• Identifier et valoriser les compétences professionnelles et personnelles');
      addText('• Clarifier les motivations et les valeurs professionnelles');
      addText('• Définir un projet professionnel réaliste et réalisable');
      addText('• Élaborer un plan d\'action concret pour atteindre les objectifs fixés');
    }

    // ========== SECTION 2: PROFIL ==========
    doc.addPage();
    y = 20;
    
    addSection('PROFIL DU BÉNÉFICIAIRE', '2');
    
    addSubSection('Type de profil identifié');
    if (data.summary.profileType) {
      addText(`Profil dominant : ${data.summary.profileType}`, 14, true, [79, 70, 229]);
      y += 5;
    }
    
    addSubSection('Niveau de maturité du projet');
    if (data.summary.maturityLevel) {
      addText(data.summary.maturityLevel);
    } else {
      addText('Le niveau de maturité du projet a été évalué au cours du bilan et permet d\'adapter les recommandations et le plan d\'action.');
    }
    
    addSubSection('Parcours professionnel synthétique');
    // Extraire le parcours des réponses
    const careerKeywords = ['parcours', 'expérience', 'poste', 'mission', 'responsabilité'];
    const careerAnswers = data.answers.filter(a => 
      a.value && typeof a.value === 'string' && 
      careerKeywords.some(kw => a.value.toLowerCase().includes(kw))
    ).slice(0, 2);
    
    if (careerAnswers.length > 0) {
      careerAnswers.forEach(answer => {
        addText(`« ${answer.value.substring(0, 400)}${answer.value.length > 400 ? '...' : ''} »`, 10, false, [60, 60, 60]);
        y += 3;
      });
    } else {
      addText('Le parcours professionnel a été analysé en détail lors des entretiens et a permis d\'identifier les compétences clés et les réalisations significatives.');
    }

    // ========== SECTION 3: COMPÉTENCES ==========
    doc.addPage();
    y = 20;
    
    addSection('ANALYSE APPROFONDIE DES COMPÉTENCES', '3');
    
    const competences = extractDetailedCompetences(data.answers, data.summary);
    
    addSubSection('Cartographie des compétences');
    addText('L\'analyse des entretiens et des exercices a permis d\'établir la cartographie suivante des compétences :');
    y += 10;
    
    // Afficher les compétences avec barres de progression
    competences.forEach(comp => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      
      const percentage = (comp.level / 5) * 100;
      drawProgressBar(margin, y, 100, percentage, comp.category);
      y += 15;
    });
    
    y += 10;
    
    addSubSection('Points forts identifiés');
    const strengths = data.summary.strengths || 
      (data.summary.keyStrengths?.map(s => typeof s === 'string' ? s : s.text) || []);
    
    if (strengths.length > 0) {
      strengths.forEach(strength => {
        addText(`✓ ${strength}`);
      });
    }
    
    addSubSection('Compétences transférables');
    if (data.summary.skills && data.summary.skills.length > 0) {
      addText('Les compétences suivantes ont été identifiées comme transférables vers d\'autres contextes professionnels :');
      data.summary.skills.forEach(skill => {
        addText(`• ${skill}`);
      });
    }

    // ========== SECTION 4: RIASEC ==========
    doc.addPage();
    y = 20;
    
    addSection('BILAN DES INTÉRÊTS PROFESSIONNELS (RIASEC)', '4');
    
    const riasec = extractRIASECProfile(data.answers);
    
    addSubSection('Profil RIASEC');
    addText('Le modèle RIASEC (Holland) permet d\'identifier les intérêts professionnels dominants. Voici le profil établi à partir des réponses :');
    y += 10;
    
    // Afficher le profil RIASEC
    const riasecLabels = {
      realistic: 'Réaliste (R) - Activités concrètes et pratiques',
      investigative: 'Investigateur (I) - Recherche et analyse',
      artistic: 'Artistique (A) - Créativité et expression',
      social: 'Social (S) - Relations et accompagnement',
      enterprising: 'Entreprenant (E) - Leadership et influence',
      conventional: 'Conventionnel (C) - Organisation et méthode'
    };
    
    Object.entries(riasec).forEach(([key, value]) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      drawProgressBar(margin, y, 100, value, riasecLabels[key as keyof typeof riasecLabels]);
      y += 18;
    });
    
    y += 10;
    
    // Identifier les types dominants
    const sortedRiasec = Object.entries(riasec).sort((a, b) => b[1] - a[1]);
    const topTypes = sortedRiasec.slice(0, 3).map(([key]) => key);
    
    addSubSection('Interprétation');
    addText(`Les types dominants identifiés sont : ${topTypes.map(t => riasecLabels[t as keyof typeof riasecLabels].split(' ')[0]).join(', ')}.`);
    addText('Cette combinaison suggère une affinité pour les métiers et environnements de travail correspondant à ces caractéristiques.');

    // ========== SECTION 5: VALEURS ==========
    doc.addPage();
    y = 20;
    
    addSection('ANALYSE DES VALEURS PROFESSIONNELLES', '5');
    
    const values = extractDetailedValues(data.answers);
    
    addSubSection('Valeurs prioritaires');
    addText('L\'analyse des entretiens a permis d\'identifier les valeurs professionnelles suivantes :');
    y += 5;
    
    if (values.length > 0) {
      values.forEach(val => {
        if (y > 250) {
          doc.addPage();
          y = 20;
        }
        
        const importanceColor = val.importance === 'haute' ? [34, 197, 94] : 
                               val.importance === 'moyenne' ? [234, 179, 8] : [156, 163, 175];
        
        doc.setFillColor(importanceColor[0], importanceColor[1], importanceColor[2]);
        doc.circle(margin + 3, y + 2, 3, 'F');
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(val.value, margin + 10, y + 4);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`(Importance : ${val.importance})`, margin + 60, y + 4);
        y += 10;
        
        if (val.manifestation) {
          doc.setFontSize(10);
          doc.setTextColor(80, 80, 80);
          const manifestLines = doc.splitTextToSize(val.manifestation, maxWidth - 10);
          manifestLines.slice(0, 2).forEach((line: string) => {
            doc.text(line, margin + 10, y);
            y += 5;
          });
          doc.setTextColor(0, 0, 0);
        }
        y += 5;
      });
    } else if (data.summary.values && data.summary.values.length > 0) {
      data.summary.values.forEach(value => {
        addText(`• ${value}`);
      });
    }
    
    addSubSection('Impact sur le projet professionnel');
    addText('Ces valeurs constituent des critères essentiels pour évaluer la pertinence des pistes professionnelles envisagées et garantir l\'épanouissement dans le futur environnement de travail.');

    // ========== SECTION 6: APTITUDES ET MOTIVATIONS ==========
    doc.addPage();
    y = 20;
    
    addSection('APTITUDES ET MOTIVATIONS', '6');
    
    addSubSection('Motivations principales');
    if (data.summary.motivations && data.summary.motivations.length > 0) {
      data.summary.motivations.forEach(motivation => {
        addText(`• ${motivation}`);
      });
    } else {
      addText('Les motivations ont été explorées à travers les entretiens et les exercices du bilan.');
    }
    
    addSubSection('Sources de satisfaction professionnelle');
    const satisfactionKeywords = ['satisf', 'plaisir', 'épanoui', 'motiv', 'passion'];
    const satisfactionAnswers = data.answers.filter(a => 
      a.value && typeof a.value === 'string' && 
      satisfactionKeywords.some(kw => a.value.toLowerCase().includes(kw))
    ).slice(0, 3);
    
    if (satisfactionAnswers.length > 0) {
      satisfactionAnswers.forEach(answer => {
        addText(`« ${answer.value.substring(0, 200)}${answer.value.length > 200 ? '...' : ''} »`, 10, false, [60, 60, 60]);
        y += 3;
      });
    }
    
    addSubSection('Environnement de travail recherché');
    const envKeywords = ['environnement', 'ambiance', 'autonomie', 'équipe', 'télétravail'];
    const envAnswers = data.answers.filter(a => 
      a.value && typeof a.value === 'string' && 
      envKeywords.some(kw => a.value.toLowerCase().includes(kw))
    ).slice(0, 2);
    
    if (envAnswers.length > 0) {
      envAnswers.forEach(answer => {
        addText(`• ${answer.value.substring(0, 200)}${answer.value.length > 200 ? '...' : ''}`);
      });
    } else {
      addText('L\'environnement de travail idéal a été défini en fonction des valeurs et des préférences identifiées.');
    }

    // ========== SECTION 7: AXES DE DÉVELOPPEMENT ==========
    doc.addPage();
    y = 20;
    
    addSection('AXES DE DÉVELOPPEMENT', '7');
    
    addSubSection('Points à développer');
    const areasToImprove = data.summary.areasToImprove || 
      (data.summary.areasForDevelopment?.map(a => typeof a === 'string' ? a : a.text) || []);
    
    if (areasToImprove.length > 0) {
      areasToImprove.forEach(area => {
        addText(`• ${area}`);
      });
    }
    
    addSubSection('Compétences à acquérir ou renforcer');
    const competencesToDevelop = competences.filter(c => c.level < 4);
    if (competencesToDevelop.length > 0) {
      competencesToDevelop.forEach(comp => {
        addText(`• ${comp.category} : niveau actuel ${comp.level}/5 - potentiel de développement identifié`);
      });
    }
    
    addSubSection('Formations recommandées');
    if (data.formationsRecommandees && data.formationsRecommandees.length > 0) {
      data.formationsRecommandees.forEach(formation => {
        addText(`• ${formation}`);
      });
    } else if (data.careerPaths && data.careerPaths.length > 0) {
      const allTrainings = data.careerPaths.flatMap(p => p.trainingPath || []);
      const uniqueTrainings = [...new Set(allTrainings)].slice(0, 5);
      if (uniqueTrainings.length > 0) {
        uniqueTrainings.forEach(training => {
          addText(`• ${training}`);
        });
      }
    }

    // ========== SECTION 8: PROJET PROFESSIONNEL ==========
    doc.addPage();
    y = 20;
    
    addSection('PROJET PROFESSIONNEL', '8');
    
    addSubSection('Définition du projet');
    if (data.projectProfessionnel || data.summary.projectProfessionnel) {
      addText(data.projectProfessionnel || data.summary.projectProfessionnel || '');
    } else {
      addText('Le projet professionnel a été défini en cohérence avec le profil, les compétences, les valeurs et les aspirations du bénéficiaire.');
    }
    
    addSubSection('Métiers visés');
    if (data.metiersVises && data.metiersVises.length > 0) {
      data.metiersVises.forEach(metier => {
        addText(`• ${metier}`);
      });
    } else if (data.careerPaths && data.careerPaths.length > 0) {
      data.careerPaths.slice(0, 3).forEach(path => {
        addText(`• ${path.title} (correspondance : ${path.matchScore}%)`);
      });
    }
    
    addSubSection('Secteurs d\'activité privilégiés');
    if (data.careerPaths && data.careerPaths.length > 0) {
      const sectors = [...new Set(data.careerPaths.map(p => p.sector).filter(Boolean))];
      if (sectors.length > 0) {
        sectors.forEach(sector => {
          addText(`• ${sector}`);
        });
      }
    }
    
    addSubSection('Recommandations');
    if (data.summary.recommendations && data.summary.recommendations.length > 0) {
      data.summary.recommendations.forEach(rec => {
        addText(`• ${rec}`);
      });
    }

    // ========== SECTION 9: PISTES MÉTIERS ==========
    if (data.careerPaths && data.careerPaths.length > 0) {
      doc.addPage();
      y = 20;
      
      addSection('PISTES MÉTIERS EXPLORÉES', '9');
      
      addText('Les pistes suivantes ont été identifiées lors de l\'exploration personnalisée basée sur le profil du bénéficiaire et les tendances du marché du travail :');
      y += 5;
      
      data.careerPaths.slice(0, 5).forEach((path, index) => {
        if (y > 200) {
          doc.addPage();
          y = 20;
        }
        
        // Titre avec score
        doc.setFillColor(245, 245, 255);
        doc.rect(margin, y - 3, maxWidth, 30, 'F');
        doc.setDrawColor(79, 70, 229);
        doc.rect(margin, y - 3, maxWidth, 30, 'S');
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(79, 70, 229);
        doc.text(`${index + 1}. ${path.title}`, margin + 3, y + 5);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        
        const trendLabel = path.marketTrend === 'en_croissance' ? '↑ En croissance' : 
                          path.marketTrend === 'en_declin' ? '↓ En déclin' : '→ Stable';
        doc.text(`Correspondance : ${path.matchScore}% | ${trendLabel} | ${path.salaryRange}`, margin + 3, y + 15);
        
        // Description courte
        const descLines = doc.splitTextToSize(path.description, maxWidth - 10);
        doc.text(descLines[0], margin + 3, y + 23);
        
        y += 40;
        
        // Détails
        if (path.matchReasons && path.matchReasons.length > 0) {
          addText('Pourquoi cette piste :', 10, true);
          path.matchReasons.slice(0, 2).forEach(reason => {
            addText(`  • ${reason}`, 9);
          });
        }
        
        y += 5;
      });
    }

    // ========== SECTION 9bis: ANALYSE DE FAISABILITÉ ET CONFRONTATION AU MARCHÉ ==========
    if (feasibilityData && (feasibilityData.marketExploration || feasibilityData.feasibilityReport)) {
      doc.addPage();
      y = 20;
      
      addSection('ANALYSE DE FAISABILITÉ DU PROJET', '9bis');
      
      // Score de faisabilité
      if (feasibilityData.marketExploration?.feasibilityAnalysis) {
        const fa = feasibilityData.marketExploration.feasibilityAnalysis;
        
        addSubSection('Score de faisabilité global');
        
        // Dessiner un indicateur visuel du score
        const score = fa.overallScore;
        const scoreColor = score >= 8 ? [34, 197, 94] : score >= 6 ? [234, 179, 8] : score >= 4 ? [249, 115, 22] : [239, 68, 68];
        
        doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
        doc.roundedRect(margin, y, 30, 20, 3, 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(`${score}/10`, margin + 15, y + 13, { align: 'center' });
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        const scoreLabel = score >= 8 ? 'Excellent - Projet très réalisable' : 
                          score >= 6 ? 'Bon - Projet réalisable avec quelques ajustements' : 
                          score >= 4 ? 'Modéré - Projet nécessitant des efforts significatifs' : 
                          'Difficile - Projet ambitieux nécessitant une réorientation';
        doc.text(scoreLabel, margin + 35, y + 13);
        y += 30;
        
        addText(fa.feasibilityComment, 10);
        y += 5;
      }
      
      // Analyse du marché
      if (feasibilityData.marketExploration?.marketAnalysis) {
        const ma = feasibilityData.marketExploration.marketAnalysis;
        
        addSubSection('Analyse du marché de l\'emploi');
        
        // Tableau des indicateurs marché
        const demandColor = ma.demandLevel === 'très_forte' || ma.demandLevel === 'forte' ? [34, 197, 94] : 
                           ma.demandLevel === 'moyenne' ? [234, 179, 8] : [239, 68, 68];
        
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, y, maxWidth, 35, 'F');
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Niveau de demande', margin + 5, y + 8);
        doc.text('Tendance', margin + 50, y + 8);
        doc.text('Salaire', margin + 90, y + 8);
        doc.text('Régions', margin + 130, y + 8);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(demandColor[0], demandColor[1], demandColor[2]);
        doc.text(ma.demandLevel.replace('_', ' '), margin + 5, y + 18);
        doc.setTextColor(0, 0, 0);
        doc.text(ma.demandTrend, margin + 50, y + 18);
        doc.text(ma.salaryRange, margin + 90, y + 18);
        const regions = ma.geographicOpportunities.slice(0, 2).join(', ');
        doc.text(regions.substring(0, 25), margin + 130, y + 18);
        
        y += 40;
        
        addText('Secteurs qui recrutent : ' + ma.sectors.join(', '), 10);
        addText(ma.marketInsights, 10);
        y += 5;
      }
      
      // Compétences correspondantes vs à développer
      if (feasibilityData.marketExploration?.feasibilityAnalysis) {
        const fa = feasibilityData.marketExploration.feasibilityAnalysis;
        
        addSubSection('Analyse des compétences');
        
        // Deux colonnes
        const colWidth = (maxWidth - 10) / 2;
        
        // Colonne gauche - Compétences correspondantes
        doc.setFillColor(220, 252, 231);
        doc.rect(margin, y, colWidth, 8, 'F');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(22, 101, 52);
        doc.text('\u2713 Compétences correspondantes', margin + 3, y + 6);
        
        // Colonne droite - Compétences à développer
        doc.setFillColor(254, 243, 199);
        doc.rect(margin + colWidth + 10, y, colWidth, 8, 'F');
        doc.setTextColor(146, 64, 14);
        doc.text('\u26A0 Compétences à développer', margin + colWidth + 13, y + 6);
        
        y += 12;
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        
        const maxItems = Math.max(fa.matchingSkills.length, fa.skillGaps.length);
        for (let i = 0; i < Math.min(maxItems, 5); i++) {
          if (fa.matchingSkills[i]) {
            doc.text('\u2022 ' + fa.matchingSkills[i].substring(0, 35), margin + 3, y);
          }
          if (fa.skillGaps[i]) {
            doc.text('\u2022 ' + fa.skillGaps[i].substring(0, 35), margin + colWidth + 13, y);
          }
          y += 5;
        }
        y += 5;
      }
      
      // Formations recommandées
      if (feasibilityData.marketExploration?.trainingRecommendations && 
          feasibilityData.marketExploration.trainingRecommendations.length > 0) {
        
        addSubSection('Formations recommandées');
        
        feasibilityData.marketExploration.trainingRecommendations.slice(0, 4).forEach((training, i) => {
          const priorityColor = training.priority === 'essentielle' ? [239, 68, 68] : 
                               training.priority === 'recommandée' ? [234, 179, 8] : [156, 163, 175];
          
          doc.setFillColor(priorityColor[0], priorityColor[1], priorityColor[2]);
          doc.circle(margin + 3, y - 1, 2, 'F');
          
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text(training.title, margin + 8, y);
          
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(100, 100, 100);
          doc.text(`${training.type} | ${training.duration} | ${training.priority}`, margin + 8, y + 5);
          doc.setTextColor(0, 0, 0);
          
          y += 12;
        });
        y += 5;
      }
      
      // Insights de l'enquête métier
      if (feasibilityData.jobInterview) {
        const ji = feasibilityData.jobInterview;
        
        if (y > 200) {
          doc.addPage();
          y = 20;
        }
        
        addSubSection(`Insights de l'enquête métier (${ji.professionalPersona.name})`);
        
        addText(`Témoignage de ${ji.professionalPersona.name}, ${ji.professionalPersona.currentRole} depuis ${ji.professionalPersona.yearsExperience} ans.`, 10, true);
        
        // Avantages et inconvénients en deux colonnes
        const colWidth2 = (maxWidth - 10) / 2;
        
        doc.setFillColor(220, 252, 231);
        doc.rect(margin, y, colWidth2, 8, 'F');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(22, 101, 52);
        doc.text('Avantages du métier', margin + 3, y + 6);
        
        doc.setFillColor(254, 226, 226);
        doc.rect(margin + colWidth2 + 10, y, colWidth2, 8, 'F');
        doc.setTextColor(153, 27, 27);
        doc.text('Points de vigilance', margin + colWidth2 + 13, y + 6);
        
        y += 12;
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        
        const maxPros = Math.max(ji.honestOpinion.prosOfJob.length, ji.honestOpinion.consOfJob.length);
        for (let i = 0; i < Math.min(maxPros, 4); i++) {
          if (ji.honestOpinion.prosOfJob[i]) {
            const proText = ji.honestOpinion.prosOfJob[i].substring(0, 35);
            doc.text('\u2022 ' + proText, margin + 3, y);
          }
          if (ji.honestOpinion.consOfJob[i]) {
            const conText = ji.honestOpinion.consOfJob[i].substring(0, 35);
            doc.text('\u2022 ' + conText, margin + colWidth2 + 13, y);
          }
          y += 5;
        }
        y += 8;
        
        // Conseils clés
        addText('Conseils pour réussir :', 10, true);
        addText(ji.careerAdvice.entryTips, 9);
        y += 5;
      }
      
      // Métiers alternatifs
      if (feasibilityData.marketExploration?.alternativePaths && 
          feasibilityData.marketExploration.alternativePaths.length > 0) {
        
        addSubSection('Pistes alternatives à considérer');
        
        feasibilityData.marketExploration.alternativePaths.forEach((alt, i) => {
          const easeColor = alt.transitionEase === 'facile' ? [34, 197, 94] : 
                           alt.transitionEase === 'modérée' ? [234, 179, 8] : [239, 68, 68];
          
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text(`${i + 1}. ${alt.jobTitle}`, margin, y);
          
          doc.setFillColor(easeColor[0], easeColor[1], easeColor[2]);
          doc.setTextColor(255, 255, 255);
          doc.roundedRect(margin + 100, y - 4, 25, 6, 1, 1, 'F');
          doc.setFontSize(7);
          doc.text(alt.transitionEase, margin + 112, y, { align: 'center' });
          
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          y += 6;
          doc.text(alt.relevance.substring(0, 80), margin + 5, y);
          y += 8;
        });
      }
    }

    // ========== SECTION 10: PLAN D'ACTION ==========
    doc.addPage();
    y = 20;
    
    addSection('PLAN D\'ACTION', '10');
    
    const hasActionPlan = data.summary.actionPlan && 
      (data.summary.actionPlan.shortTerm?.length > 0 || data.summary.actionPlan.mediumTerm?.length > 0);
    
    if (hasActionPlan) {
      if (data.summary.actionPlan.shortTerm && data.summary.actionPlan.shortTerm.length > 0) {
        addSubSection('Actions à court terme (1-3 mois)');
        data.summary.actionPlan.shortTerm.forEach((item, i) => {
          const text = typeof item === 'string' ? item : item.text;
          doc.setFillColor(220, 252, 231);
          doc.rect(margin, y - 3, maxWidth, 12, 'F');
          addText(`${i + 1}. ${text}`, 11, false);
          y += 3;
        });
      }
      
      if (data.summary.actionPlan.mediumTerm && data.summary.actionPlan.mediumTerm.length > 0) {
        addSubSection('Actions à moyen terme (3-6 mois)');
        data.summary.actionPlan.mediumTerm.forEach((item, i) => {
          const text = typeof item === 'string' ? item : item.text;
          doc.setFillColor(254, 249, 195);
          doc.rect(margin, y - 3, maxWidth, 12, 'F');
          addText(`${i + 1}. ${text}`, 11, false);
          y += 3;
        });
      }
      
      if (data.summary.actionPlan.longTerm && data.summary.actionPlan.longTerm.length > 0) {
        addSubSection('Actions à long terme (6-12 mois)');
        data.summary.actionPlan.longTerm.forEach((item, i) => {
          const text = typeof item === 'string' ? item : item.text;
          doc.setFillColor(254, 226, 226);
          doc.rect(margin, y - 3, maxWidth, 12, 'F');
          addText(`${i + 1}. ${text}`, 11, false);
          y += 3;
        });
      }
    } else if (data.planAction && data.planAction.length > 0) {
      data.planAction.forEach((item, i) => {
        addText(`${i + 1}. ${item.action}`);
        addText(`   Échéance : ${item.echeance} | Priorité : ${item.priorite}`, 9, false, [100, 100, 100]);
        y += 3;
      });
    } else {
      addText('Le plan d\'action détaillé sera élaboré avec le consultant lors de l\'entretien de suivi.');
    }

    // ========== SECTION 11: RESSOURCES ==========
    doc.addPage();
    y = 20;
    
    addSection('RESSOURCES ET CONTACTS UTILES', '11');
    
    addSubSection('Organismes de formation');
    addText('• Pôle Emploi - www.pole-emploi.fr - Accompagnement à la recherche d\'emploi');
    addText('• APEC - www.apec.fr - Association pour l\'emploi des cadres');
    addText('• Mon Compte Formation - www.moncompteformation.gouv.fr - Financement CPF');
    addText('• France Compétences - www.francecompetences.fr - Certifications professionnelles');
    
    addSubSection('Réseaux professionnels');
    addText('• LinkedIn - Réseau professionnel en ligne');
    addText('• Viadeo - Réseau professionnel francophone');
    addText('• Meetup - Événements et rencontres professionnelles');
    
    addSubSection('Ressources documentaires');
    addText('• ONISEP - www.onisep.fr - Information sur les métiers et formations');
    addText('• CIDJ - www.cidj.com - Centre d\'information et de documentation jeunesse');
    addText('• Orientation pour tous - www.orientation-pour-tous.fr');
    
    addSubSection('Accompagnement entrepreneuriat');
    addText('• BPI France - www.bpifrance.fr - Financement et accompagnement');
    addText('• CCI - Chambre de Commerce et d\'Industrie');
    addText('• BGE - Réseau d\'accompagnement à la création d\'entreprise');

    // ========== SECTION 12: CONCLUSION ==========
    doc.addPage();
    y = 20;
    
    addSection('CONCLUSION ET SUIVI', '12');
    
    addSubSection('Synthèse');
    addText(`Ce bilan de compétences a permis à ${data.userName} d'identifier ses compétences, aptitudes et motivations, et de définir un projet professionnel cohérent avec son profil et les réalités du marché de l'emploi.`);
    
    addSubSection('Engagements réciproques');
    addText('Le bénéficiaire s\'engage à :');
    addText('• Mettre en œuvre le plan d\'action défini');
    addText('• Participer à l\'entretien de suivi prévu 6 mois après la fin du bilan');
    addText('• Informer le consultant de l\'évolution de sa situation');
    
    y += 5;
    addText('L\'organisme s\'engage à :');
    addText('• Assurer la confidentialité des informations recueillies');
    addText('• Proposer un entretien de suivi dans les 6 mois');
    addText('• Rester disponible pour toute question ou besoin d\'accompagnement complémentaire');
    
    addSubSection('Entretien de suivi');
    addText('Un entretien de suivi est prévu 6 mois après la fin du bilan pour :');
    addText('• Faire le point sur la mise en œuvre du plan d\'action');
    addText('• Identifier les éventuelles difficultés rencontrées');
    addText('• Ajuster les objectifs si nécessaire');
    addText('• Apporter un soutien complémentaire si besoin');

    // ========== PAGE SIGNATURES ==========
    doc.addPage();
    y = 30;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229);
    doc.text('SIGNATURES', pageWidth / 2, y, { align: 'center' });
    y += 20;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    addText('Le présent document de synthèse a été remis au bénéficiaire à l\'issue de la phase de conclusion du bilan de compétences.');
    addText('Le bénéficiaire reconnaît avoir reçu ce document et en avoir pris connaissance.');
    addText('Il atteste de l\'exactitude des informations le concernant et de la conformité du bilan aux objectifs définis lors de la phase préliminaire.');

    y += 20;

    // Zone signature consultant
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(margin, y, 80, 55, 'S');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Le consultant', margin + 20, y + 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(data.consultantName, margin + 5, y + 22);
    doc.text(`Date : ${data.endDate}`, margin + 5, y + 32);
    doc.text('Signature :', margin + 5, y + 45);

    // Zone signature bénéficiaire
    doc.rect(pageWidth - margin - 80, y, 80, 55, 'S');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Le bénéficiaire', pageWidth - margin - 55, y + 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(data.userName, pageWidth - margin - 75, y + 22);
    doc.text(`Date : ${data.endDate}`, pageWidth - margin - 75, y + 32);
    doc.text('Signature :', pageWidth - margin - 75, y + 45);

    y += 75;

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

    // ========== ANNEXES ==========
    doc.addPage();
    y = 20;
    
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229);
    doc.text('ANNEXES', pageWidth / 2, y, { align: 'center' });
    y += 20;
    
    doc.setTextColor(0, 0, 0);
    
    addSubSection('Annexe 1 : Détail des réponses significatives');
    
    // Sélectionner les réponses les plus significatives
    const significantAnswers = data.answers
      .filter(a => a.value && typeof a.value === 'string' && a.value.length > 100 && a.value.length < 500)
      .slice(0, 10);
    
    significantAnswers.forEach((answer, index) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${answer.question?.substring(0, 80) || 'Question'}...`, margin, y);
      y += 6;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      const answerLines = doc.splitTextToSize(answer.value, maxWidth - 5);
      answerLines.slice(0, 4).forEach((line: string) => {
        doc.text(line, margin + 5, y);
        y += 4;
      });
      doc.setTextColor(0, 0, 0);
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
  }
};

export default syntheseServiceEnriched;

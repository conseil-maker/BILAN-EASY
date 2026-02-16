import jsPDF from 'jspdf';
import { Summary, Answer } from '../types-ai-studio';
import { organizationConfig, getFullAddress } from '../config/organization';
import { CareerPath } from './geminiService';
import i18n from '../i18n';

// Langue par défaut basée sur i18n, mais peut être forcée via le paramètre forceLang
let _forceLang: string | null = null;
const tSyn = (fr: string, tr: string): string => {
  const lang = _forceLang || i18n.language || 'fr';
  return lang === 'tr' ? tr : fr;
};
const dateFmt = (): string => {
  const lang = _forceLang || i18n.language || 'fr';
  return lang === 'tr' ? 'tr-TR' : 'fr-FR';
};

// ========== COULEURS DU THÈME ==========
const COLORS = {
  primary: [79, 70, 229] as [number, number, number],       // Indigo
  primaryLight: [99, 102, 241] as [number, number, number],  // Indigo clair
  primaryBg: [238, 242, 255] as [number, number, number],    // Indigo très clair
  accent: [16, 185, 129] as [number, number, number],        // Émeraude
  accentBg: [209, 250, 229] as [number, number, number],     // Émeraude clair
  warning: [245, 158, 11] as [number, number, number],       // Ambre
  warningBg: [254, 243, 199] as [number, number, number],    // Ambre clair
  danger: [239, 68, 68] as [number, number, number],         // Rouge
  dangerBg: [254, 226, 226] as [number, number, number],     // Rouge clair
  text: [31, 41, 55] as [number, number, number],            // Gris foncé
  textLight: [107, 114, 128] as [number, number, number],    // Gris moyen
  white: [255, 255, 255] as [number, number, number],
  lightBg: [249, 250, 251] as [number, number, number],      // Gris très clair
  border: [229, 231, 235] as [number, number, number],       // Gris bordure
};

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
  const careerKeywords = (i18n.language || 'fr') === 'tr'
    ? ['kariyer', 'deneyim', 'görev', 'misyon', 'sorumluluk', 'başladı', 'ilk']
    : ['parcours', 'expérience', 'poste', 'mission', 'responsabilité', 'commencé', 'premier'];
  const careerAnswers = answers.filter(a => 
    a.value && typeof a.value === 'string' && 
    careerKeywords.some(kw => a.value.toLowerCase().includes(kw))
  ).slice(0, 3);
  
  return careerAnswers.map(a => a.value).join('\n\n');
};

export const syntheseService = {
  /**
   * Génère le document de synthèse complet conforme Qualiopi
   * Version améliorée avec design professionnel
   */
  generateSynthese(data: SyntheseData, forceLang?: string): Blob {
    _forceLang = forceLang || null;
    const doc = new jsPDF();
    let y = 20;
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxWidth = pageWidth - 2 * margin;

    // ========== HELPERS AMÉLIORÉS ==========
    const addText = (text: string, fontSize: number = 11, isBold: boolean = false, color: [number, number, number] = COLORS.text) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      doc.setTextColor(color[0], color[1], color[2]);
      
      const lines = doc.splitTextToSize(text, maxWidth);
      lines.forEach((line: string) => {
        if (y > pageHeight - 30) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, margin, y);
        y += fontSize * 0.5;
      });
      y += 3;
      doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    };

    const addSection = (title: string) => {
      if (y > pageHeight - 50) {
        doc.addPage();
        y = 20;
      }
      y += 10;
      
      // Barre colorée avec dégradé simulé
      doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
      doc.roundedRect(margin, y - 7, maxWidth, 12, 2, 2, 'F');
      
      // Accent à gauche
      doc.setFillColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
      doc.rect(margin, y - 7, 4, 12, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text(title, margin + 8, y + 1);
      y += 14;
      doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    };

    const addSubSection = (title: string) => {
      if (y > pageHeight - 30) {
        doc.addPage();
        y = 20;
      }
      y += 6;
      
      // Ligne décorative à gauche
      doc.setFillColor(COLORS.primaryLight[0], COLORS.primaryLight[1], COLORS.primaryLight[2]);
      doc.rect(margin, y - 4, 3, 10, 'F');
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
      doc.text(title, margin + 7, y + 3);
      y += 12;
      doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    };

    // Encadré d'information coloré
    const addInfoBox = (title: string, content: string, type: 'info' | 'success' | 'warning' = 'info') => {
      const colors = {
        info: { bg: COLORS.primaryBg, border: COLORS.primary },
        success: { bg: COLORS.accentBg, border: COLORS.accent },
        warning: { bg: COLORS.warningBg, border: COLORS.warning },
      };
      const c = colors[type];
      
      const contentLines = doc.splitTextToSize(content, maxWidth - 20);
      const boxHeight = 18 + contentLines.length * 5.5;
      
      if (y + boxHeight > pageHeight - 30) {
        doc.addPage();
        y = 20;
      }
      
      // Fond
      doc.setFillColor(c.bg[0], c.bg[1], c.bg[2]);
      doc.roundedRect(margin, y - 2, maxWidth, boxHeight, 3, 3, 'F');
      
      // Bordure gauche
      doc.setFillColor(c.border[0], c.border[1], c.border[2]);
      doc.roundedRect(margin, y - 2, 4, boxHeight, 2, 0, 'F');
      
      // Titre
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(c.border[0], c.border[1], c.border[2]);
      doc.text(title, margin + 10, y + 8);
      
      // Contenu
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
      let contentY = y + 16;
      contentLines.forEach((line: string) => {
        doc.text(line, margin + 10, contentY);
        contentY += 5.5;
      });
      
      y += boxHeight + 6;
    };

    // Barre de compétence visuelle
    const drawSkillBar = (label: string, level: number, maxLevel: number = 5) => {
      if (y > pageHeight - 25) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
      doc.text(label, margin + 2, y);
      
      const barX = margin + 80;
      const barWidth = maxWidth - 85;
      const barHeight = 6;
      
      // Fond de la barre
      doc.setFillColor(COLORS.border[0], COLORS.border[1], COLORS.border[2]);
      doc.roundedRect(barX, y - 4, barWidth, barHeight, 2, 2, 'F');
      
      // Barre de progression
      const progressWidth = (level / maxLevel) * barWidth;
      const progressColor: [number, number, number] = level >= 4 ? COLORS.accent : level >= 3 ? COLORS.primary : COLORS.warning;
      doc.setFillColor(progressColor[0], progressColor[1], progressColor[2]);
      doc.roundedRect(barX, y - 4, progressWidth, barHeight, 2, 2, 'F');
      
      // Texte du niveau
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(COLORS.textLight[0], COLORS.textLight[1], COLORS.textLight[2]);
      doc.text(`${level}/${maxLevel}`, barX + barWidth + 3, y);
      
      y += 12;
    };

    // Badge coloré
    const drawBadge = (text: string, x: number, yPos: number, color: [number, number, number]) => {
      const textWidth = doc.getTextWidth(text) + 8;
      doc.setFillColor(color[0], color[1], color[2]);
      doc.roundedRect(x, yPos - 4, textWidth, 7, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(text, x + 4, yPos + 1);
      doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    };

    // ========== PAGE DE GARDE AMÉLIORÉE ==========
    // Fond dégradé simulé (bandes)
    const gradientSteps = 30;
    for (let i = 0; i < gradientSteps; i++) {
      const ratio = i / gradientSteps;
      const r = Math.round(79 + (99 - 79) * ratio);
      const g = Math.round(70 + (102 - 70) * ratio);
      const b = Math.round(229 + (241 - 229) * ratio);
      doc.setFillColor(r, g, b);
      doc.rect(0, (i * 70) / gradientSteps, pageWidth, 70 / gradientSteps + 1, 'F');
    }
    
    // Ligne décorative
    doc.setFillColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
    doc.rect(0, 70, pageWidth, 3, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text(tSyn('DOCUMENT DE SYNTHESE', 'OZET BELGESI'), pageWidth / 2, 28, { align: 'center' });
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text(tSyn('Bilan de Competences', 'Yetkinlik Degerlendirmesi'), pageWidth / 2, 42, { align: 'center' });
    doc.setFontSize(11);
    doc.text(tSyn('Conforme au referentiel Qualiopi', 'Qualiopi referansina uygun'), pageWidth / 2, 55, { align: 'center' });
    
    // Logo placeholder / Nom organisme
    doc.setFontSize(10);
    doc.text(organizationConfig.name, pageWidth / 2, 65, { align: 'center' });

    y = 90;
    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);

    // Carte bénéficiaire avec design amélioré
    doc.setFillColor(COLORS.primaryBg[0], COLORS.primaryBg[1], COLORS.primaryBg[2]);
    doc.roundedRect(margin, y - 5, maxWidth, 55, 4, 4, 'F');
    doc.setDrawColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y - 5, maxWidth, 55, 4, 4, 'S');
    
    // Icône bénéficiaire (cercle)
    doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    doc.circle(margin + 12, y + 12, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    const initials = data.userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    doc.text(initials, margin + 12, y + 15, { align: 'center' });
    
    doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(tSyn('Beneficiaire', 'Yararlanici'), margin + 25, y + 5);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    doc.text(`${tSyn('Nom', 'Ad')} : ${data.userName}`, margin + 25, y + 16);
    doc.text(`${tSyn('Parcours', 'Paket')} : ${data.packageName}`, margin + 25, y + 25);
    doc.text(tSyn(`Periode : du ${data.startDate} au ${data.endDate}`, `Donem: ${data.startDate} - ${data.endDate}`), margin + 25, y + 34);
    doc.text(`${tSyn('Consultant', 'Danisman')} : ${data.consultantName}`, margin + 25, y + 43);

    y = 160;

    // Informations organisme
    doc.setFillColor(COLORS.lightBg[0], COLORS.lightBg[1], COLORS.lightBg[2]);
    doc.roundedRect(margin, y - 3, maxWidth, 25, 3, 3, 'F');
    doc.setFontSize(9);
    doc.setTextColor(COLORS.textLight[0], COLORS.textLight[1], COLORS.textLight[2]);
    doc.text(`${organizationConfig.name} | ${getFullAddress()} | ${organizationConfig.phone}`, margin + 5, y + 6);
    doc.text(`Qualiopi ${organizationConfig.qualiopi} | SIRET ${organizationConfig.siret}`, margin + 5, y + 14);

    y = 200;

    // Mention légale
    doc.setFontSize(9);
    doc.setTextColor(COLORS.textLight[0], COLORS.textLight[1], COLORS.textLight[2]);
    const legalText = tSyn(
      'Ce document de synthese est etabli conformement a l\'article R.6313-7 du Code du travail. Il est la propriete exclusive du beneficiaire et ne peut etre communique a un tiers qu\'avec son accord ecrit.',
      'Bu ozet belgesi Is Kanunu\'nun R.6313-7 maddesi uyarinca duzenlenmektedir. Yalnizca yararlaniciya aittir ve yazili onayi olmadan ucuncu taraflara iletilemez.'
    );
    const legalLines = doc.splitTextToSize(legalText, maxWidth);
    legalLines.forEach((line: string) => {
      doc.text(line, margin, y);
      y += 5;
    });

    // ========== NOUVELLE PAGE - CONTENU ==========
    doc.addPage();
    y = 20;

    // 1. CIRCONSTANCES DU BILAN
    addSection(tSyn('1. CIRCONSTANCES DU BILAN', '1. DEGERLENDIRME KOSULLARI'));
    addText(tSyn(`Ce bilan de competences a ete realise a la demande de ${data.userName} dans le cadre d'une demarche volontaire d'evolution professionnelle.`, `Bu yetkinlik degerlendirmesi, ${data.userName} tarafindan gonullu mesleki gelisim sureci kapsaminda talep edilmistir.`));
    addText(tSyn(`Le bilan s'est deroule du ${data.startDate} au ${data.endDate}, selon le parcours "${data.packageName}".`, `Degerlendirme ${data.startDate} - ${data.endDate} tarihleri arasinda "${data.packageName}" paketi kapsaminda gerceklestirilmistir.`));
    
    // Encadré phases réglementaires
    addInfoBox(
      tSyn('Phases reglementaires', 'Yasal asamalar'),
      tSyn('Phase preliminaire (analyse de la demande) > Phase d\'investigation (exploration des competences) > Phase de conclusion (synthese et plan d\'action)', 'On asama (talep analizi) > Arastirma asamasi (yetkinliklerin incelenmesi) > Sonuc asamasi (sentez ve eylem plani)'),
      'info'
    );
    
    // Profil identifié
    if (data.summary.profileType) {
      addSubSection(tSyn('Profil identifie', 'Belirlenen profil'));
      addInfoBox(
        tSyn('Type de profil', 'Profil tipi'),
        data.summary.profileType,
        'success'
      );
    }
    
    // Niveau de maturité du projet
    if (data.summary.maturityLevel) {
      addSubSection(tSyn('Maturite du projet', 'Proje olgunlugu'));
      addText(data.summary.maturityLevel);
    }
    
    // Thèmes prioritaires
    if (data.summary.priorityThemes && data.summary.priorityThemes.length > 0) {
      addSubSection(tSyn('Themes prioritaires identifies', 'Belirlenen oncelikli temalar'));
      data.summary.priorityThemes.forEach((theme) => {
        addText(`  \u2022 ${theme}`);
      });
    }

    // 1.5 PARCOURS PROFESSIONNEL
    const careerPath = extractCareerPath(data.answers);
    if (careerPath) {
      addSection(tSyn('1.5. PARCOURS PROFESSIONNEL', '1.5. MESLEKI GECMIS'));
      addSubSection(tSyn('Synthese du parcours', 'Gecmis ozeti'));
      addText(careerPath);
    }

    // 2. COMPÉTENCES IDENTIFIÉES
    addSection(tSyn('2. COMPETENCES IDENTIFIEES', '2. BELIRLENEN YETKINLIKLER'));
    
    const strengths = data.summary.strengths || 
      (data.summary.keyStrengths?.map(s => typeof s === 'string' ? s : s.text) || []);
    
    if (strengths.length > 0) {
      addSubSection(tSyn('Points forts', 'Guclu yonler'));
      
      // Afficher sous forme de barres visuelles
      strengths.forEach((strength, i) => {
        const level = Math.min(5, 5 - Math.floor(i * 0.5)); // Les premiers sont les plus forts
        drawSkillBar(strength.substring(0, 40) + (strength.length > 40 ? '...' : ''), level);
      });
      
      // Exemples concrets
      const examples = extractExamplesFromAnswers(data.answers, ['structur', 'organis', 'coordin', 'facilit']);
      if (examples.length > 0) {
        addSubSection(tSyn('Exemples concrets tires du bilan', 'Degerlendirmeden somut ornekler'));
        examples.forEach((example, i) => {
          addInfoBox(
            `${tSyn('Exemple', 'Ornek')} ${i + 1}`,
            example.substring(0, 300) + (example.length > 300 ? '...' : ''),
            'info'
          );
        });
      }
    }

    if (data.summary.skills && data.summary.skills.length > 0) {
      addSubSection(tSyn('Competences cles', 'Temel yetkinlikler'));
      data.summary.skills.forEach((skill) => {
        addText(`  \u2022 ${skill}`);
      });
    }

    // 3. APTITUDES ET MOTIVATIONS
    addSection(tSyn('3. APTITUDES ET MOTIVATIONS', '3. YETENEKLER VE MOTIVASYONLAR'));
    
    if (data.summary.motivations && data.summary.motivations.length > 0) {
      addSubSection(tSyn('Motivations principales', 'Temel motivasyonlar'));
      data.summary.motivations.forEach((motivation) => {
        addText(`  \u2022 ${motivation}`);
      });
    } else {
      const motivationExamples = extractExamplesFromAnswers(data.answers, ['motiv', 'stimul', 'satisf', 'appreci', 'aim']);
      if (motivationExamples.length > 0) {
        addSubSection(tSyn('Motivations identifiees', 'Belirlenen motivasyonlar'));
        motivationExamples.forEach((example) => {
          addText(`  \u2022 ${example.substring(0, 200)}${example.length > 200 ? '...' : ''}`);
        });
      }
    }

    // Valeurs
    if (data.summary.values && data.summary.values.length > 0) {
      addSubSection(tSyn('Valeurs professionnelles', 'Mesleki degerler'));
      data.summary.values.forEach((value) => {
        addText(`  \u2022 ${value}`);
      });
    } else {
      const valueExamples = extractExamplesFromAnswers(data.answers, ['valeur', 'important', 'priorite', 'essentiel', 'respect']);
      if (valueExamples.length > 0) {
        addSubSection(tSyn('Valeurs professionnelles identifiees', 'Belirlenen mesleki degerler'));
        valueExamples.forEach((example) => {
          addText(`  \u2022 ${example.substring(0, 200)}${example.length > 200 ? '...' : ''}`);
        });
      }
    }
    
    // Environnement de travail recherché
    const environmentExamples = extractExamplesFromAnswers(data.answers, ['environnement', 'ambiance', 'autonomie', 'collabor', 'equipe']);
    if (environmentExamples.length > 0) {
      addSubSection(tSyn('Environnement de travail recherche', 'Aranan calisma ortami'));
      environmentExamples.forEach((example) => {
        addText(`  \u2022 ${example.substring(0, 200)}${example.length > 200 ? '...' : ''}`);
      });
    }

    // 4. AXES DE DÉVELOPPEMENT
    addSection(tSyn('4. AXES DE DEVELOPPEMENT', '4. GELISIM ALANLARI'));
    
    const areasToImprove = data.summary.areasToImprove || 
      (data.summary.areasForDevelopment?.map(a => typeof a === 'string' ? a : a.text) || []);
    
    if (areasToImprove.length > 0) {
      addSubSection(tSyn('Points a developper', 'Gelistirilecek noktalar'));
      areasToImprove.forEach((area) => {
        addText(`  \u2022 ${area}`);
      });
    }

    // 5. PROJET PROFESSIONNEL
    addSection(tSyn('5. PROJET PROFESSIONNEL', '5. MESLEKI PROJE'));
    
    if (data.projectProfessionnel || data.summary.projectProfessionnel) {
      addInfoBox(
        tSyn('Projet defini', 'Tanimlanan proje'),
        data.projectProfessionnel || data.summary.projectProfessionnel || '',
        'success'
      );
    }
    
    // Recommandations
    if (data.summary.recommendations && data.summary.recommendations.length > 0) {
      addSubSection(tSyn('Recommandations', 'Oneriler'));
      data.summary.recommendations.forEach((rec) => {
        addText(`  \u2022 ${rec}`);
      });
    }

    // Métiers visés
    if (data.metiersVises && data.metiersVises.length > 0) {
      addSubSection(tSyn('Metiers vises', 'Hedeflenen meslekler'));
      data.metiersVises.forEach((metier) => {
        addText(`  \u2022 ${metier}`);
      });
    } else if (data.careerPaths && data.careerPaths.length > 0) {
      addSubSection(tSyn('Metiers vises', 'Hedeflenen meslekler'));
      data.careerPaths.slice(0, 5).forEach((path) => {
        if (y > pageHeight - 25) { doc.addPage(); y = 20; }
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
        doc.text(`\u2022 ${path.title}`, margin + 2, y);
        
        // Badge score
        const scoreColor: [number, number, number] = path.matchScore >= 80 ? COLORS.accent : path.matchScore >= 60 ? COLORS.primary : COLORS.warning;
        drawBadge(`${path.matchScore}%`, margin + 120, y, scoreColor);
        
        y += 8;
        doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
      });
    }
    
    // Secteurs d'activité
    if (data.careerPaths && data.careerPaths.length > 0) {
      const sectors = [...new Set(data.careerPaths.map(p => p.sector).filter(Boolean))];
      if (sectors.length > 0) {
        addSubSection(tSyn('Secteurs d\'activite privilegies', 'Tercih edilen sektorler'));
        sectors.forEach((sector) => {
          addText(`  \u2022 ${sector}`);
        });
      }
    }
    
    // Formations recommandées
    if (data.formationsRecommandees && data.formationsRecommandees.length > 0) {
      addSubSection(tSyn('Formations recommandees', 'Onerilen egitimler'));
      data.formationsRecommandees.forEach((formation) => {
        addText(`  \u2022 ${formation}`);
      });
    } else if (data.careerPaths && data.careerPaths.length > 0) {
      const allFormations = data.careerPaths.flatMap(p => p.requiredSkills || []);
      const uniqueFormations = [...new Set(allFormations)].slice(0, 5);
      if (uniqueFormations.length > 0) {
        addSubSection(tSyn('Competences a developper', 'Gelistirilecek yetkinlikler'));
        uniqueFormations.forEach((skill) => {
          addText(`  \u2022 ${skill}`);
        });
      }
    }

    // 5bis. PISTES MÉTIERS EXPLORÉES
    if (data.careerPaths && data.careerPaths.length > 0) {
      addSection(tSyn('5bis. PISTES METIERS EXPLOREES', '5bis. KESFEDILEN MESLEK YOLLARI'));
      addText(tSyn('Les pistes suivantes ont ete identifiees lors de l\'exploration personnalisee basee sur le profil du beneficiaire et les tendances du marche du travail :', 'Asagidaki yollar, yararlanicinin profiline ve is piyasasi egilimlere dayali kisisel kesif sirasinda belirlenmistir:'));
      y += 5;
      
      data.careerPaths.forEach((path, index) => {
        if (y > pageHeight - 60) {
          doc.addPage();
          y = 20;
        }
        
        // Carte métier avec fond coloré
        const cardHeight = 45;
        doc.setFillColor(COLORS.primaryBg[0], COLORS.primaryBg[1], COLORS.primaryBg[2]);
        doc.roundedRect(margin, y - 3, maxWidth, cardHeight, 3, 3, 'F');
        doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2]);
        doc.roundedRect(margin, y - 3, maxWidth, cardHeight, 3, 3, 'S');
        
        // Numéro dans un cercle
        doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
        doc.circle(margin + 10, y + 8, 7, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(String(index + 1), margin + 10, y + 11, { align: 'center' });
        
        // Titre du métier
        doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
        doc.setFontSize(12);
        doc.text(path.title, margin + 22, y + 10);
        
        // Badge score
        const scoreColor: [number, number, number] = path.matchScore >= 80 ? COLORS.accent : path.matchScore >= 60 ? COLORS.primary : COLORS.warning;
        drawBadge(`${tSyn('Correspondance', 'Uyum')}: ${path.matchScore}%`, margin + maxWidth - 55, y + 8, scoreColor);
        
        // Description
        doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const descLines = doc.splitTextToSize(path.description, maxWidth - 30);
        descLines.slice(0, 2).forEach((line: string, i: number) => {
          doc.text(line, margin + 22, y + 20 + i * 5);
        });
        
        // Tendance et salaire
        const trendLabel = path.marketTrend === 'en_croissance' ? tSyn('\u2191 En croissance', '\u2191 Buyuyen') : 
                          path.marketTrend === 'en_declin' ? tSyn('\u2193 En declin', '\u2193 Azalan') : tSyn('\u2192 Stable', '\u2192 Stabil');
        doc.setFontSize(8);
        doc.setTextColor(COLORS.textLight[0], COLORS.textLight[1], COLORS.textLight[2]);
        doc.text(`${trendLabel} | ${tSyn('Salaire', 'Maas')}: ${path.salaryRange}`, margin + 22, y + 38);
        
        y += cardHeight + 8;
      });
    }

    // 6. FORMATIONS RECOMMANDÉES
    if (data.formationsRecommandees && data.formationsRecommandees.length > 0) {
      addSection(tSyn('6. FORMATIONS RECOMMANDEES', '6. ONERILEN EGITIMLER'));
      data.formationsRecommandees.forEach((formation) => {
        addText(`  \u2022 ${formation}`);
      });
    }

    // 7. PLAN D'ACTION
    addSection(tSyn('7. PLAN D\'ACTION', '7. EYLEM PLANI'));
    
    const hasActionPlanFromSummary = data.summary.actionPlan && 
      (data.summary.actionPlan.shortTerm?.length > 0 || data.summary.actionPlan.mediumTerm?.length > 0);
    
    if (hasActionPlanFromSummary) {
      // Court terme
      if (data.summary.actionPlan.shortTerm && data.summary.actionPlan.shortTerm.length > 0) {
        addSubSection(tSyn('Actions a court terme (1-3 mois)', 'Kisa vadeli eylemler (1-3 ay)'));
        data.summary.actionPlan.shortTerm.forEach((item, i) => {
          const text = typeof item === 'string' ? item : item.text;
          if (y > pageHeight - 25) { doc.addPage(); y = 20; }
          
          // Fond coloré
          doc.setFillColor(COLORS.dangerBg[0], COLORS.dangerBg[1], COLORS.dangerBg[2]);
          doc.roundedRect(margin, y - 4, maxWidth, 12, 2, 2, 'F');
          
          // Pastille numérotée
          doc.setFillColor(COLORS.danger[0], COLORS.danger[1], COLORS.danger[2]);
          doc.circle(margin + 6, y + 1, 4, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.text(String(i + 1), margin + 6, y + 3, { align: 'center' });
          
          doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          const actionLines = doc.splitTextToSize(text, maxWidth - 20);
          doc.text(actionLines[0] || '', margin + 14, y + 3);
          y += 16;
        });
      }
      
      // Moyen terme
      if (data.summary.actionPlan.mediumTerm && data.summary.actionPlan.mediumTerm.length > 0) {
        addSubSection(tSyn('Actions a moyen terme (3-6 mois)', 'Orta vadeli eylemler (3-6 ay)'));
        data.summary.actionPlan.mediumTerm.forEach((item, i) => {
          const text = typeof item === 'string' ? item : item.text;
          if (y > pageHeight - 25) { doc.addPage(); y = 20; }
          
          doc.setFillColor(COLORS.warningBg[0], COLORS.warningBg[1], COLORS.warningBg[2]);
          doc.roundedRect(margin, y - 4, maxWidth, 12, 2, 2, 'F');
          
          doc.setFillColor(COLORS.warning[0], COLORS.warning[1], COLORS.warning[2]);
          doc.circle(margin + 6, y + 1, 4, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.text(String(i + 1), margin + 6, y + 3, { align: 'center' });
          
          doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          const actionLines = doc.splitTextToSize(text, maxWidth - 20);
          doc.text(actionLines[0] || '', margin + 14, y + 3);
          y += 16;
        });
      }
      
      // Long terme
      if (data.summary.actionPlan.longTerm && data.summary.actionPlan.longTerm.length > 0) {
        addSubSection(tSyn('Actions a long terme (6-12 mois)', 'Uzun vadeli eylemler (6-12 ay)'));
        data.summary.actionPlan.longTerm.forEach((item, i) => {
          const text = typeof item === 'string' ? item : item.text;
          if (y > pageHeight - 25) { doc.addPage(); y = 20; }
          
          doc.setFillColor(COLORS.accentBg[0], COLORS.accentBg[1], COLORS.accentBg[2]);
          doc.roundedRect(margin, y - 4, maxWidth, 12, 2, 2, 'F');
          
          doc.setFillColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
          doc.circle(margin + 6, y + 1, 4, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.text(String(i + 1), margin + 6, y + 3, { align: 'center' });
          
          doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          const actionLines = doc.splitTextToSize(text, maxWidth - 20);
          doc.text(actionLines[0] || '', margin + 14, y + 3);
          y += 16;
        });
      }
    } else if (data.planAction && data.planAction.length > 0) {
      // Tableau du plan d'action amélioré
      const tableTop = y;
      const colWidths = [80, 40, 30, 30];
      const headers = [tSyn('Action', 'Eylem'), tSyn('Echeance', 'Sure'), tSyn('Priorite', 'Oncelik'), tSyn('Statut', 'Durum')];
      
      doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
      doc.roundedRect(margin, tableTop, maxWidth, 10, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      
      let xPos = margin + 2;
      headers.forEach((header, i) => {
        doc.text(header, xPos, tableTop + 7);
        xPos += colWidths[i] ?? 30;
      });
      
      y = tableTop + 12;
      doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
      doc.setFont('helvetica', 'normal');
      
      data.planAction.forEach((item, index) => {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }
        
        const rowColor: [number, number, number] = index % 2 === 0 ? COLORS.white : COLORS.lightBg;
        doc.setFillColor(rowColor[0], rowColor[1], rowColor[2]);
        doc.rect(margin, y - 4, maxWidth, 10, 'F');
        
        xPos = margin + 2;
        const actionLines = doc.splitTextToSize(item.action, (colWidths[0] ?? 60) - 4);
        doc.setFontSize(9);
        doc.text(actionLines[0] ?? '', xPos, y + 2);
        xPos += colWidths[0] ?? 60;
        doc.text(item.echeance, xPos, y + 2);
        xPos += colWidths[1] ?? 30;
        
        // Badge priorité
        const prioColor: [number, number, number] = item.priorite === 'haute' ? COLORS.danger : item.priorite === 'moyenne' ? COLORS.warning : COLORS.accent;
        drawBadge(item.priorite, xPos, y + 2, prioColor);
        xPos += colWidths[2] ?? 25;
        doc.text(item.statut.replace('_', ' '), xPos, y + 2);
        
        y += 10;
      });
    } else {
      addInfoBox(
        tSyn('Plan d\'action', 'Eylem plani'),
        tSyn('Le plan d\'action detaille sera elabore avec le consultant lors de l\'entretien de suivi.', 'Ayrintili eylem plani takip gorusmesinde danismanla birlikte hazirlanacaktir.'),
        'info'
      );
    }

    // 8. CONCLUSION
    addSection(tSyn('8. CONCLUSION', '8. SONUC'));
    addText(tSyn(`Ce bilan de competences a permis a ${data.userName} d'identifier ses competences, aptitudes et motivations, et de definir un projet professionnel coherent avec son profil et le marche de l'emploi.`, `Bu yetkinlik degerlendirmesi, ${data.userName}'in yetkinliklerini, yeteneklerini ve motivasyonlarini belirlemesini ve profili ile is piyasasina uygun bir mesleki proje tanimlamasini saglamistir.`));
    
    // Encadré suivi
    addInfoBox(
      tSyn('Suivi post-bilan', 'Degerlendirme sonrasi takip'),
      tSyn('Un entretien de suivi est prevu 6 mois apres la fin du bilan pour faire le point sur la mise en oeuvre du plan d\'action.', 'Eylem planinin uygulanmasini degerlendirmek icin degerlendirme sonrasi 6 ay icinde bir takip gorusmesi planlanmistir.'),
      'success'
    );

    // ========== PAGE SIGNATURES ==========
    doc.addPage();
    y = 30;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    doc.text(tSyn('SIGNATURES', 'IMZALAR'), pageWidth / 2, y, { align: 'center' });
    y += 20;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    addText(tSyn('Le present document de synthese a ete remis au beneficiaire a l\'issue de la phase de conclusion du bilan de competences.', 'Bu ozet belgesi yetkinlik degerlendirmesinin sonuc asamasi sonunda yararlaniciya teslim edilmistir.'));
    addText(tSyn('Le beneficiaire reconnait avoir recu ce document et en avoir pris connaissance.', 'Yararlanici bu belgeyi aldigini ve inceledigini kabul eder.'));

    y += 20;

    // Zone signature consultant - améliorée
    doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2]);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y, 80, 55, 3, 3, 'S');
    doc.setFillColor(COLORS.primaryBg[0], COLORS.primaryBg[1], COLORS.primaryBg[2]);
    doc.roundedRect(margin, y, 80, 12, 3, 0, 'F');
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    doc.text(tSyn('Le consultant', 'Danisman'), margin + 20, y + 8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    doc.text(data.consultantName, margin + 5, y + 25);
    doc.text(`${tSyn('Date', 'Tarih')} : ${data.endDate}`, margin + 5, y + 35);
    doc.text(tSyn('Signature :', 'Imza :'), margin + 5, y + 48);

    // Zone signature bénéficiaire
    doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2]);
    doc.roundedRect(pageWidth - margin - 80, y, 80, 55, 3, 3, 'S');
    doc.setFillColor(COLORS.primaryBg[0], COLORS.primaryBg[1], COLORS.primaryBg[2]);
    doc.roundedRect(pageWidth - margin - 80, y, 80, 12, 3, 0, 'F');
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    doc.text(tSyn('Le beneficiaire', 'Yararlanici'), pageWidth - margin - 55, y + 8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    doc.text(data.userName, pageWidth - margin - 75, y + 25);
    doc.text(`${tSyn('Date', 'Tarih')} : ${data.endDate}`, pageWidth - margin - 75, y + 35);
    doc.text(tSyn('Signature :', 'Imza :'), pageWidth - margin - 75, y + 48);

    y += 75;

    // Mentions légales finales
    doc.setFillColor(COLORS.lightBg[0], COLORS.lightBg[1], COLORS.lightBg[2]);
    doc.roundedRect(margin, y, maxWidth, 45, 3, 3, 'F');
    
    doc.setFontSize(8);
    doc.setTextColor(COLORS.textLight[0], COLORS.textLight[1], COLORS.textLight[2]);
    const finalLegal = ((_forceLang || i18n.language || 'fr') === 'tr') ? [
      'YASAL BILDIRIMLER',
      '',
      '\u2022 Bu belge kesinlikle gizlidir (Is Kanunu madde L.6313-10-1).',
      '\u2022 Yararlanicinin yazili onayi olmadan ucuncu taraflara iletilemez.',
      '\u2022 Ayrintili sonuclarin ve ozet belgesinin tek alicisi yararlanicidir.',
      '\u2022 Bu degerlendirme Is Kanunu\'nun L.6313-4 ve R.6313-4 ila R.6313-8 maddeleri uyarinca gerceklestirilmistir.',
      '',
      `Belge ${new Date().toLocaleDateString('tr-TR')} tarihinde ${data.organizationName} tarafindan olusturuldu`
    ] : [
      'MENTIONS LEGALES',
      '',
      '\u2022 Ce document est strictement confidentiel (article L.6313-10-1 du Code du travail).',
      '\u2022 Il ne peut etre communique a un tiers qu\'avec l\'accord ecrit du beneficiaire.',
      '\u2022 Le beneficiaire est seul destinataire des resultats detailles et du document de synthese.',
      '\u2022 Ce bilan a ete realise conformement aux articles L.6313-4 et R.6313-4 a R.6313-8 du Code du travail.',
      '',
      `Document genere le ${new Date().toLocaleDateString('fr-FR')} par ${data.organizationName}`
    ];
    
    finalLegal.forEach((line, i) => {
      doc.text(line, margin + 5, y + 6 + i * 5);
    });

    // Pied de page sur toutes les pages
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      
      // Ligne décorative en bas
      doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
      doc.rect(margin, pageHeight - 15, maxWidth, 0.5, 'F');
      
      doc.setFontSize(7);
      doc.setTextColor(COLORS.textLight[0], COLORS.textLight[1], COLORS.textLight[2]);
      doc.text(
        `${organizationConfig.name} | ${tSyn('Document de synthese', 'Ozet belgesi')} - ${data.userName}`,
        margin,
        pageHeight - 8
      );
      doc.text(
        `${tSyn('Page', 'Sayfa')} ${i}/${totalPages}`,
        pageWidth - margin,
        pageHeight - 8,
        { align: 'right' }
      );
    }

    _forceLang = null;
    return doc.output('blob');
  },

  /**
   * Génère le plan d'action séparé - Version améliorée
   */
  generatePlanAction(data: SyntheseData, forceLang?: string): Blob {
    _forceLang = forceLang || null;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    const actionTextWidth = contentWidth - 20;
    let y = 20;

    const checkPageBreak = (neededSpace: number) => {
      if (y + neededSpace > pageHeight - 30) {
        doc.addPage();
        y = 25;
      }
    };

    // === EN-TÊTE AMÉLIORÉ ===
    // Dégradé simulé
    const gradientSteps = 20;
    for (let i = 0; i < gradientSteps; i++) {
      const ratio = i / gradientSteps;
      const r = Math.round(79 + (99 - 79) * ratio);
      const g = Math.round(70 + (102 - 70) * ratio);
      const b = Math.round(229 + (241 - 229) * ratio);
      doc.setFillColor(r, g, b);
      doc.rect(0, (i * 50) / gradientSteps, pageWidth, 50 / gradientSteps + 1, 'F');
    }
    
    // Accent
    doc.setFillColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
    doc.rect(0, 50, pageWidth, 3, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(tSyn('PLAN D\'ACTION', 'EYLEM PLANI'), pageWidth / 2, 22, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`${data.userName} - ${data.endDate}`, pageWidth / 2, 38, { align: 'center' });
    doc.setFontSize(9);
    doc.text(organizationConfig.name, pageWidth / 2, 47, { align: 'center' });

    y = 65;
    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);

    // === OBJECTIF PRINCIPAL ===
    doc.setFillColor(COLORS.primaryBg[0], COLORS.primaryBg[1], COLORS.primaryBg[2]);
    doc.roundedRect(margin, y - 5, contentWidth, 10, 3, 3, 'F');
    doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    doc.rect(margin, y - 5, 4, 10, 'F');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    doc.text(tSyn('Objectif principal', 'Ana hedef'), margin + 8, y + 2);
    y += 12;

    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const objectif = data.projectProfessionnel || tSyn('Definir et mettre en oeuvre le projet professionnel identifie lors du bilan de competences.', 'Yetkinlik degerlendirmesi sirasinda belirlenen mesleki projeyi tanimlamak ve uygulamak.');
    const objectifLines = doc.splitTextToSize(objectif, contentWidth - 10);
    objectifLines.forEach((line: string) => {
      checkPageBreak(6);
      doc.text(line, margin + 5, y);
      y += 6;
    });

    y += 12;

    // === ACTIONS PAR SECTION ===
    if (data.planAction && data.planAction.length > 0) {
      const sections = [
        {
          title: tSyn('Court terme (0-3 mois)', 'Kisa vade (0-3 ay)'),
          color: COLORS.danger,
          bgColor: COLORS.dangerBg,
          items: data.planAction.filter(a => a.priorite === 'haute'),
        },
        {
          title: tSyn('Moyen terme (3-6 mois)', 'Orta vade (3-6 ay)'),
          color: COLORS.warning,
          bgColor: COLORS.warningBg,
          items: data.planAction.filter(a => a.priorite === 'moyenne'),
        },
        {
          title: tSyn('Long terme (6-12 mois)', 'Uzun vade (6-12 ay)'),
          color: COLORS.accent,
          bgColor: COLORS.accentBg,
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
        doc.roundedRect(margin + 4, y, contentWidth - 4, 12, 0, 2, 'F');
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(section.color[0], section.color[1], section.color[2]);
        doc.text(section.title, margin + 10, y + 8);
        y += 18;

        section.items.forEach((item) => {
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          const actionLines = doc.splitTextToSize(item.action, actionTextWidth);
          const actionHeight = actionLines.length * 5.5 + 18;
          
          checkPageBreak(actionHeight);

          // Pastille numérotée
          doc.setFillColor(section.color[0], section.color[1], section.color[2]);
          doc.circle(margin + 6, y + 4, 6, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          const numStr = String(globalIndex);
          doc.text(numStr, margin + 6 - (doc.getTextWidth(numStr) / 2), y + 6);

          // Texte de l'action
          doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          actionLines.forEach((line: string, lineIndex: number) => {
            doc.text(line, margin + 16, y + 4 + (lineIndex * 5.5));
          });

          y += actionLines.length * 5.5 + 4;

          // Échéance et priorité
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(COLORS.textLight[0], COLORS.textLight[1], COLORS.textLight[2]);
          doc.text(`${tSyn('Echeance', 'Sure')} : ${item.echeance}`, margin + 16, y);
          
          // Badge priorité
          const prioriteLabel = item.priorite.charAt(0).toUpperCase() + item.priorite.slice(1);
          doc.setFillColor(section.color[0], section.color[1], section.color[2]);
          const badgeX = margin + 90;
          doc.roundedRect(badgeX, y - 3.5, 30, 5, 1.5, 1.5, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.text(prioriteLabel, badgeX + 15, y, { align: 'center' });

          // Case à cocher améliorée
          doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2]);
          doc.setLineWidth(0.5);
          doc.roundedRect(pageWidth - margin - 12, y - 4, 8, 8, 1, 1, 'S');
          if (item.statut === 'termine') {
            doc.setFillColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
            doc.roundedRect(pageWidth - margin - 12, y - 4, 8, 8, 1, 1, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(10);
            doc.text('\u2713', pageWidth - margin - 9, y + 2);
          }

          y += 12;
          globalIndex++;
        });

        y += 6;
      });
    }

    // === SECTION SUIVI ===
    checkPageBreak(40);
    y += 5;
    doc.setFillColor(COLORS.primaryBg[0], COLORS.primaryBg[1], COLORS.primaryBg[2]);
    doc.roundedRect(margin, y - 5, contentWidth, 35, 3, 3, 'F');
    doc.setDrawColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y - 5, contentWidth, 35, 3, 3, 'S');

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    doc.text(tSyn('Suivi post-bilan', 'Degerlendirme sonrasi takip'), margin + 8, y + 4);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    const suiviText = tSyn('Un entretien de suivi est prevu 6 mois apres la fin du bilan pour evaluer la progression de votre projet professionnel et ajuster le plan d\'action si necessaire.', 'Mesleki projenizin ilerlemesini degerlendirmek ve gerekirse eylem planini ayarlamak icin degerlendirme sonrasi 6 ay icinde bir takip gorusmesi planlanmistir.');
    const suiviLines = doc.splitTextToSize(suiviText, contentWidth - 16);
    suiviLines.forEach((line: string, i: number) => {
      doc.text(line, margin + 8, y + 14 + (i * 5.5));
    });

    // === PIED DE PAGE ===
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      
      doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
      doc.rect(margin, pageHeight - 15, contentWidth, 0.5, 'F');
      
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(COLORS.textLight[0], COLORS.textLight[1], COLORS.textLight[2]);
      doc.text(
        `${tSyn('Plan d\'action', 'Eylem plani')} - ${data.userName} - ${data.organizationName || 'BILAN-EASY'}`,
        margin,
        pageHeight - 8
      );
      doc.text(
        `${tSyn('Page', 'Sayfa')} ${i}/${totalPages}`,
        pageWidth - margin,
        pageHeight - 8,
        { align: 'right' }
      );
    }

    _forceLang = null;
    return doc.output('blob');
  }
};

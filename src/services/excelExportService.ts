/**
 * Service d'export Excel pour les données du bilan de compétences
 * Utilise le format CSV compatible Excel avec encodage UTF-8 BOM
 */

import { organizationConfig, getFullAddress } from '../config/organization';

interface ExportData {
  userName: string;
  packageName: string;
  startDate: string;
  endDate?: string;
  answers: any[];
  summary?: any;
  competences?: any[];
  themes?: any[];
}

/**
 * Échappe les caractères spéciaux pour CSV
 */
const escapeCSV = (value: any): string => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

/**
 * Génère un fichier CSV compatible Excel avec les données du bilan
 */
export const exportToExcel = (data: ExportData): void => {
  const { userName, packageName, startDate, endDate, answers, summary, competences, themes } = data;

  // BOM UTF-8 pour que Excel reconnaisse l'encodage
  const BOM = '\uFEFF';
  
  let csvContent = BOM;

  // === Section 1: Informations générales ===
  csvContent += 'BILAN DE COMPÉTENCES - SYNTHÈSE\n';
  csvContent += '\n';
  csvContent += 'INFORMATIONS GÉNÉRALES\n';
  csvContent += `Organisme,${escapeCSV(organizationConfig.name)}\n`;
  csvContent += `N° Qualiopi,${escapeCSV(organizationConfig.qualiopi)}\n`;
  csvContent += `Adresse,${escapeCSV(getFullAddress())}\n`;
  csvContent += `Consultant,${escapeCSV(organizationConfig.defaultConsultant.name)}\n`;
  csvContent += '\n';
  csvContent += 'BÉNÉFICIAIRE\n';
  csvContent += `Nom,${escapeCSV(userName)}\n`;
  csvContent += `Forfait,${escapeCSV(packageName)}\n`;
  csvContent += `Date de début,${escapeCSV(new Date(startDate).toLocaleDateString('fr-FR'))}\n`;
  if (endDate) {
    csvContent += `Date de fin,${escapeCSV(new Date(endDate).toLocaleDateString('fr-FR'))}\n`;
  }
  csvContent += '\n';

  // === Section 2: Réponses au questionnaire ===
  csvContent += 'RÉPONSES AU QUESTIONNAIRE\n';
  csvContent += 'N°,Question,Réponse,Thème,Date\n';
  
  answers.forEach((answer, index) => {
    csvContent += `${index + 1},`;
    csvContent += `${escapeCSV(answer.question || answer.content || '')},`;
    csvContent += `${escapeCSV(answer.answer || answer.response || '')},`;
    csvContent += `${escapeCSV(answer.theme || answer.category || '')},`;
    csvContent += `${escapeCSV(answer.timestamp ? new Date(answer.timestamp).toLocaleString('fr-FR') : '')}\n`;
  });
  csvContent += '\n';

  // === Section 3: Compétences identifiées ===
  if (competences && competences.length > 0) {
    csvContent += 'COMPÉTENCES IDENTIFIÉES\n';
    csvContent += 'Compétence,Niveau,Catégorie\n';
    
    competences.forEach((comp) => {
      csvContent += `${escapeCSV(comp.name || comp.label)},`;
      csvContent += `${escapeCSV(comp.level || comp.score || '')},`;
      csvContent += `${escapeCSV(comp.category || '')}\n`;
    });
    csvContent += '\n';
  }

  // === Section 4: Thèmes émergents ===
  if (themes && themes.length > 0) {
    csvContent += 'THÈMES ÉMERGENTS\n';
    csvContent += 'Thème,Importance,Description\n';
    
    themes.forEach((theme) => {
      csvContent += `${escapeCSV(theme.name || theme.label)},`;
      csvContent += `${escapeCSV(theme.importance || theme.weight || '')},`;
      csvContent += `${escapeCSV(theme.description || '')}\n`;
    });
    csvContent += '\n';
  }

  // === Section 5: Synthèse ===
  if (summary) {
    csvContent += 'SYNTHÈSE\n';
    if (summary.strengths) {
      csvContent += 'Points forts\n';
      (Array.isArray(summary.strengths) ? summary.strengths : [summary.strengths]).forEach((s: string) => {
        csvContent += `- ${escapeCSV(s)}\n`;
      });
    }
    if (summary.areasToImprove) {
      csvContent += 'Axes d\'amélioration\n';
      (Array.isArray(summary.areasToImprove) ? summary.areasToImprove : [summary.areasToImprove]).forEach((s: string) => {
        csvContent += `- ${escapeCSV(s)}\n`;
      });
    }
    if (summary.recommendations) {
      csvContent += 'Recommandations\n';
      (Array.isArray(summary.recommendations) ? summary.recommendations : [summary.recommendations]).forEach((s: string) => {
        csvContent += `- ${escapeCSV(s)}\n`;
      });
    }
    csvContent += '\n';
  }

  // === Section 6: Statistiques ===
  csvContent += 'STATISTIQUES\n';
  csvContent += `Nombre de questions,${answers.length}\n`;
  csvContent += `Date d'export,${new Date().toLocaleString('fr-FR')}\n`;
  csvContent += '\n';

  // === Footer ===
  csvContent += 'Document généré par Bilan-Easy\n';
  csvContent += `${organizationConfig.name} - Certifié Qualiopi\n`;

  // Créer et télécharger le fichier
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  const fileName = `bilan_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
  
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Génère un fichier Excel (XLSX) avec les données du bilan
 * Note: Nécessite la bibliothèque xlsx pour un vrai format XLSX
 * Cette version utilise CSV compatible Excel comme fallback
 */
export const exportToXLSX = async (data: ExportData): Promise<void> => {
  // Pour un vrai format XLSX, il faudrait installer xlsx:
  // npm install xlsx
  // Pour l'instant, on utilise le format CSV compatible Excel
  exportToExcel(data);
};

export default { exportToExcel, exportToXLSX };

import { Answer, DashboardData } from '../types';

export const generatePDF = async (
  userName: string,
  packageName: string,
  answers: Answer[],
  dashboardData: DashboardData
): Promise<Blob> => {
  // Créer le contenu HTML du rapport
  const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Rapport de Bilan de Compétences - ${userName}</title>
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
    }
    h1 {
      color: #2563eb;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 10px;
      margin-bottom: 30px;
    }
    h2 {
      color: #1e40af;
      margin-top: 30px;
      margin-bottom: 15px;
    }
    h3 {
      color: #3b82f6;
      margin-top: 20px;
      margin-bottom: 10px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    .theme {
      background: #eff6ff;
      padding: 15px;
      border-left: 4px solid #2563eb;
      margin-bottom: 15px;
      border-radius: 4px;
    }
    .skill {
      background: #f0fdf4;
      padding: 15px;
      border-left: 4px solid #10b981;
      margin-bottom: 15px;
      border-radius: 4px;
    }
    .answer {
      background: #f9fafb;
      padding: 12px;
      margin-bottom: 10px;
      border-radius: 4px;
      border-left: 3px solid #6b7280;
    }
    .question {
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 8px;
    }
    .response {
      color: #4b5563;
      margin-left: 15px;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 0.9em;
    }
    .badge {
      display: inline-block;
      background: #dbeafe;
      color: #1e40af;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.85em;
      margin-right: 8px;
      margin-bottom: 8px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Rapport de Bilan de Compétences</h1>
    <p><strong>Participant :</strong> ${userName}</p>
    <p><strong>Parcours :</strong> ${packageName}</p>
    <p><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}</p>
  </div>

  <div class="section">
    <h2>📊 Thèmes Émergents</h2>
    ${dashboardData.themes.length > 0 ? 
      dashboardData.themes.map(theme => `
        <div class="theme">
          <h3>${theme.name}</h3>
          <p>${theme.description}</p>
          <div>
            ${theme.keywords.map(keyword => `<span class="badge">${keyword}</span>`).join('')}
          </div>
        </div>
      `).join('') 
      : '<p>Aucun thème identifié pour le moment.</p>'
    }
  </div>

  <div class="section">
    <h2>💡 Compétences Identifiées</h2>
    ${dashboardData.skills.length > 0 ?
      dashboardData.skills.map(skill => `
        <div class="skill">
          <h3>${skill.name}</h3>
          <p><strong>Niveau :</strong> ${skill.level}/5</p>
          <p>${skill.description}</p>
        </div>
      `).join('')
      : '<p>Aucune compétence identifiée pour le moment.</p>'
    }
  </div>

  <div class="section">
    <h2>💬 Vos Réponses</h2>
    ${answers.map((answer, index) => `
      <div class="answer">
        <div class="question">Question ${index + 1}: ${answer.questionTitle || answer.questionId}</div>
        <div class="response">${answer.value}</div>
      </div>
    `).join('')}
  </div>

  <div class="footer">
    <p>Rapport généré par Bilan de Compétences IA</p>
    <p>© ${new Date().getFullYear()} - Tous droits réservés</p>
  </div>
</body>
</html>
  `;

  // Convertir le HTML en PDF en utilisant l'API du navigateur
  // Note: Pour une vraie conversion PDF, il faudrait utiliser une bibliothèque comme jsPDF ou html2pdf
  // Pour l'instant, on retourne le HTML comme blob
  const blob = new Blob([htmlContent], { type: 'text/html' });
  
  return blob;
};

export const downloadPDF = async (
  userName: string,
  packageName: string,
  answers: Answer[],
  dashboardData: DashboardData | null
) => {
  // Créer un dashboardData par défaut si null
  const data: DashboardData = dashboardData || {
    themes: [],
    skills: [],
    summary: null,
    wordCloud: [],
    radarData: []
  };
  const blob = await generatePDF(userName, packageName, answers, data);
  
  // Créer un lien de téléchargement
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `rapport-bilan-competences-${userName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

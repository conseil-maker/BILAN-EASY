import { jsPDF } from 'jspdf';
import i18n from '../i18n';

const tPdf = (fr: string, tr: string): string => (i18n.language || 'fr') === 'tr' ? tr : fr;

export interface PDFData {
  title: string;
  clientName?: string;
  date: string;
  profileType?: string;
  strengths?: string[];
  areasForDevelopment?: string[];
  recommendations?: string[];
  actionPlan?: Array<{ action: string; timeline?: string }>;
}

export const pdfService = {
  generateAssessmentPDF(data: PDFData): Blob {
    const doc = new jsPDF();
    let yPosition = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;

    // Fonction helper pour ajouter du texte avec retour à la ligne automatique
    const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
      doc.setFontSize(fontSize);
      if (isBold) {
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setFont('helvetica', 'normal');
      }
      
      const lines = doc.splitTextToSize(text, maxWidth);
      lines.forEach((line: string) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, margin, yPosition);
        yPosition += fontSize * 0.5;
      });
      yPosition += 5;
    };

    // Titre principal
    doc.setFillColor(79, 70, 229); // primary-600
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(tPdf('Bilan de Compétences', 'Yetkinlik Değerlendirmesi'), pageWidth / 2, 25, { align: 'center' });
    
    yPosition = 50;
    doc.setTextColor(0, 0, 0);

    // Informations générales
    addText(data.title, 18, true);
    
    if (data.clientName) {
      addText(`${tPdf('Client', 'Danışan')}: ${data.clientName}`, 12);
    }
    
    addText(`Date: ${data.date}`, 12);
    yPosition += 10;

    // Type de profil
    if (data.profileType) {
      addText(tPdf('Type de profil', 'Profil türü'), 16, true);
      doc.setFillColor(243, 244, 246);
      doc.rect(margin, yPosition, maxWidth, 15, 'F');
      yPosition += 10;
      addText(data.profileType, 14);
      yPosition += 10;
    }

    // Forces
    if (data.strengths && data.strengths.length > 0) {
      addText(tPdf('Forces principales', 'Temel güçlü yönler'), 16, true);
      data.strengths.forEach((strength, index) => {
        addText(`${index + 1}. ${strength}`, 12);
      });
      yPosition += 5;
    }

    // Axes de développement
    if (data.areasForDevelopment && data.areasForDevelopment.length > 0) {
      addText(tPdf('Axes de développement', 'Gelişim alanları'), 16, true);
      data.areasForDevelopment.forEach((area, index) => {
        addText(`${index + 1}. ${area}`, 12);
      });
      yPosition += 5;
    }

    // Recommandations
    if (data.recommendations && data.recommendations.length > 0) {
      addText(tPdf('Recommandations', 'Öneriler'), 16, true);
      data.recommendations.forEach((rec, index) => {
        addText(`${index + 1}. ${rec}`, 12);
      });
      yPosition += 5;
    }

    // Plan d'action
    if (data.actionPlan && data.actionPlan.length > 0) {
      addText(tPdf("Plan d'action", 'Eylem planı'), 16, true);
      data.actionPlan.forEach((item, index) => {
        const action = typeof item === 'string' ? item : item.action;
        const timeline = typeof item === 'object' && item.timeline ? ` (${item.timeline})` : '';
        addText(`${index + 1}. ${action}${timeline}`, 12);
      });
    }

    // Pied de page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text(
        tPdf(`Page ${i} sur ${pageCount}`, `Sayfa ${i} / ${pageCount}`),
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
      doc.text(
        tPdf('Bilan de Compétences IA - Confidentiel', 'Yetkinlik Değerlendirmesi - Gizli'),
        margin,
        doc.internal.pageSize.getHeight() - 10
      );
    }

    return doc.output('blob');
  }
};

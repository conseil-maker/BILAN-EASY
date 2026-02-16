/**
 * Helpers pour la génération de documents PDF
 */

import jsPDF from 'jspdf';
import { PDFStyleConfig, DEFAULT_PDF_STYLE } from './types';

/**
 * Contexte de génération PDF
 */
export interface PDFContext {
  doc: jsPDF;
  y: number;
  margin: number;
  pageWidth: number;
  maxWidth: number;
  style: PDFStyleConfig;
}

/**
 * Crée un nouveau contexte PDF
 */
export function createPDFContext(style: PDFStyleConfig = DEFAULT_PDF_STYLE): PDFContext {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  return {
    doc,
    y: style.margins.top,
    margin: style.margins.left,
    pageWidth,
    maxWidth: pageWidth - style.margins.left - style.margins.right,
    style,
  };
}

/**
 * Vérifie si une nouvelle page est nécessaire et l'ajoute si besoin
 */
export function checkNewPage(ctx: PDFContext, requiredSpace: number = 20): void {
  const pageHeight = ctx.doc.internal.pageSize.getHeight();
  if (ctx.y > pageHeight - ctx.style.margins.bottom - requiredSpace) {
    ctx.doc.addPage();
    ctx.y = ctx.style.margins.top;
  }
}

/**
 * Ajoute du texte au document
 */
export function addText(
  ctx: PDFContext,
  text: string,
  options: {
    fontSize?: number;
    isBold?: boolean;
    color?: [number, number, number];
    align?: 'left' | 'center' | 'right';
  } = {}
): void {
  const {
    fontSize = ctx.style.fonts.body,
    isBold = false,
    color = ctx.style.textColor,
    align = 'left',
  } = options;

  ctx.doc.setFontSize(fontSize);
  ctx.doc.setFont('helvetica', isBold ? 'bold' : 'normal');
  ctx.doc.setTextColor(color[0], color[1], color[2]);

  const lines = ctx.doc.splitTextToSize(text, ctx.maxWidth);
  
  lines.forEach((line: string) => {
    checkNewPage(ctx);
    
    let x = ctx.margin;
    if (align === 'center') {
      x = ctx.pageWidth / 2;
    } else if (align === 'right') {
      x = ctx.pageWidth - ctx.margin;
    }
    
    ctx.doc.text(line, x, ctx.y, { align });
    ctx.y += fontSize * 0.5;
  });
  
  ctx.y += 3;
  ctx.doc.setTextColor(...ctx.style.textColor);
}

/**
 * Ajoute un titre de section
 */
export function addSection(
  ctx: PDFContext,
  title: string,
  sectionNumber?: string
): void {
  checkNewPage(ctx, 30);
  
  ctx.y += 8;
  ctx.doc.setFillColor(...ctx.style.primaryColor);
  ctx.doc.rect(ctx.margin, ctx.y - 6, ctx.maxWidth, 12, 'F');
  
  ctx.doc.setTextColor(255, 255, 255);
  ctx.doc.setFontSize(ctx.style.fonts.heading);
  ctx.doc.setFont('helvetica', 'bold');
  
  const titleText = sectionNumber ? `${sectionNumber}. ${title}` : title;
  ctx.doc.text(titleText, ctx.margin + 3, ctx.y + 2);
  
  ctx.y += 16;
  ctx.doc.setTextColor(...ctx.style.textColor);
}

/**
 * Ajoute un sous-titre de section
 */
export function addSubSection(ctx: PDFContext, title: string): void {
  checkNewPage(ctx, 15);
  
  ctx.y += 5;
  ctx.doc.setFontSize(12);
  ctx.doc.setFont('helvetica', 'bold');
  ctx.doc.setTextColor(...ctx.style.primaryColor);
  ctx.doc.text(title, ctx.margin, ctx.y);
  ctx.y += 8;
  ctx.doc.setTextColor(...ctx.style.textColor);
}

/**
 * Dessine une barre de progression
 */
export function drawProgressBar(
  ctx: PDFContext,
  x: number,
  yPos: number,
  width: number,
  value: number,
  label: string
): void {
  // Label
  ctx.doc.setFontSize(9);
  ctx.doc.setFont('helvetica', 'normal');
  ctx.doc.text(label, x, yPos - 2);

  // Barre de fond
  ctx.doc.setFillColor(230, 230, 230);
  ctx.doc.rect(x, yPos, width, 6, 'F');

  // Barre de progression
  const progressWidth = (value / 100) * width;
  ctx.doc.setFillColor(...ctx.style.primaryColor);
  ctx.doc.rect(x, yPos, progressWidth, 6, 'F');

  // Pourcentage
  ctx.doc.setFontSize(8);
  ctx.doc.text(`${value}%`, x + width + 3, yPos + 5);
}

/**
 * Dessine un graphique radar (hexagone) pour le profil RIASEC
 */
export function drawRadarChart(
  ctx: PDFContext,
  centerX: number,
  centerY: number,
  radius: number,
  values: number[],
  labels: string[]
): void {
  const numPoints = values.length;
  const angleStep = (2 * Math.PI) / numPoints;

  // Dessiner les axes
  ctx.doc.setDrawColor(200, 200, 200);
  ctx.doc.setLineWidth(0.3);

  for (let i = 0; i < numPoints; i++) {
    const angle = i * angleStep - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    ctx.doc.line(centerX, centerY, x, y);

    // Labels
    const labelX = centerX + (radius + 10) * Math.cos(angle);
    const labelY = centerY + (radius + 10) * Math.sin(angle);
    ctx.doc.setFontSize(8);
    ctx.doc.text(labels[i] || '', labelX, labelY, { align: 'center' });
  }

  // Dessiner les cercles concentriques
  for (let r = 0.25; r <= 1; r += 0.25) {
    ctx.doc.setDrawColor(230, 230, 230);
    const points: [number, number][] = [];
    for (let i = 0; i < numPoints; i++) {
      const angle = i * angleStep - Math.PI / 2;
      points.push([
        centerX + radius * r * Math.cos(angle),
        centerY + radius * r * Math.sin(angle),
      ]);
    }
    // Dessiner le polygone
    for (let i = 0; i < points.length; i++) {
      const next = (i + 1) % points.length;
      ctx.doc.line(points[i]![0], points[i]![1], points[next]![0], points[next]![1]);
    }
  }

  // Dessiner le polygone des valeurs
  ctx.doc.setFillColor(...ctx.style.primaryColor);
  ctx.doc.setDrawColor(...ctx.style.primaryColor);
  ctx.doc.setLineWidth(1);

  const valuePoints: [number, number][] = [];
  for (let i = 0; i < numPoints; i++) {
    const angle = i * angleStep - Math.PI / 2;
    const r = ((values[i] ?? 0) / 100) * radius;
    valuePoints.push([centerX + r * Math.cos(angle), centerY + r * Math.sin(angle)]);
  }

  // Remplir avec transparence (simulée)
  ctx.doc.setGState(new (ctx.doc as any).GState({ opacity: 0.3 }));
  ctx.doc.setFillColor(...ctx.style.primaryColor);
  
  // Dessiner le polygone rempli
  const path = valuePoints.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(' ') + ' Z';
  
  // Dessiner les lignes du polygone
  ctx.doc.setGState(new (ctx.doc as any).GState({ opacity: 1 }));
  for (let i = 0; i < valuePoints.length; i++) {
    const next = (i + 1) % valuePoints.length;
    ctx.doc.line(valuePoints[i]![0], valuePoints[i]![1], valuePoints[next]![0], valuePoints[next]![1]);
  }

  // Points sur le polygone
  ctx.doc.setFillColor(...ctx.style.primaryColor);
  valuePoints.forEach((point) => {
    ctx.doc.circle(point[0], point[1], 2, 'F');
  });
}

/**
 * Ajoute une liste à puces
 */
export function addBulletList(ctx: PDFContext, items: string[]): void {
  items.forEach((item) => {
    checkNewPage(ctx);
    ctx.doc.setFontSize(ctx.style.fonts.body);
    ctx.doc.setFont('helvetica', 'normal');
    
    const bullet = '•';
    ctx.doc.text(bullet, ctx.margin, ctx.y);
    
    const lines = ctx.doc.splitTextToSize(item, ctx.maxWidth - 10);
    lines.forEach((line: string, index: number) => {
      ctx.doc.text(line, ctx.margin + 8, ctx.y);
      ctx.y += ctx.style.fonts.body * 0.5;
    });
    ctx.y += 2;
  });
}

/**
 * Ajoute un encadré d'information
 */
export function addInfoBox(
  ctx: PDFContext,
  title: string,
  content: string,
  type: 'info' | 'warning' | 'success' = 'info'
): void {
  checkNewPage(ctx, 40);

  const colors = {
    info: { bg: [240, 249, 255] as [number, number, number], border: [59, 130, 246] as [number, number, number] },
    warning: { bg: [255, 251, 235] as [number, number, number], border: [245, 158, 11] as [number, number, number] },
    success: { bg: [240, 253, 244] as [number, number, number], border: [34, 197, 94] as [number, number, number] },
  };

  const color = colors[type];

  // Calculer la hauteur nécessaire
  const contentLines = ctx.doc.splitTextToSize(content, ctx.maxWidth - 16);
  const boxHeight = 20 + contentLines.length * 5;

  // Fond
  ctx.doc.setFillColor(...color.bg);
  ctx.doc.rect(ctx.margin, ctx.y, ctx.maxWidth, boxHeight, 'F');

  // Bordure gauche
  ctx.doc.setFillColor(...color.border);
  ctx.doc.rect(ctx.margin, ctx.y, 3, boxHeight, 'F');

  // Titre
  ctx.y += 8;
  ctx.doc.setFontSize(11);
  ctx.doc.setFont('helvetica', 'bold');
  ctx.doc.setTextColor(...color.border);
  ctx.doc.text(title, ctx.margin + 8, ctx.y);

  // Contenu
  ctx.y += 8;
  ctx.doc.setFontSize(10);
  ctx.doc.setFont('helvetica', 'normal');
  ctx.doc.setTextColor(...ctx.style.textColor);
  contentLines.forEach((line: string) => {
    ctx.doc.text(line, ctx.margin + 8, ctx.y);
    ctx.y += 5;
  });

  ctx.y += 8;
}

export default {
  createPDFContext,
  checkNewPage,
  addText,
  addSection,
  addSubSection,
  drawProgressBar,
  drawRadarChart,
  addBulletList,
  addInfoBox,
};

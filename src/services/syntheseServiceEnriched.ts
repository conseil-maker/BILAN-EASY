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
import i18n from '../i18n';

// Langue par défaut basée sur i18n, mais peut être forcée via le paramètre forceLang
let _forceLang: string | null = null;
const tE = (fr: string, tr: string): string => {
  const lang = _forceLang || i18n.language || 'fr';
  return lang === 'tr' ? tr : fr;
};
const dateFmtE = (): string => {
  const lang = _forceLang || i18n.language || 'fr';
  return lang === 'tr' ? 'tr-TR' : 'fr-FR';
};

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
  
  // Keywords bilingues FR + TR pour détecter les types RIASEC
  const keywords = {
    realistic: ['technique', 'pratique', 'concret', 'manuel', 'outil', 'machine', 'construire', 'réparer', 'teknik', 'pratik', 'somut', 'araç', 'makine', 'inşa', 'tamir'],
    investigative: ['analyser', 'recherche', 'comprendre', 'science', 'données', 'logique', 'résoudre', 'étudier', 'analiz', 'araştırma', 'anlamak', 'bilim', 'veri', 'mantık', 'çözmek'],
    artistic: ['créatif', 'artistique', 'imagination', 'design', 'expression', 'original', 'innovation', 'esthétique', 'yaratıcı', 'sanatsal', 'hayal', 'tasarım', 'ifade', 'özgün', 'yenilik'],
    social: ['aider', 'accompagner', 'enseigner', 'équipe', 'relation', 'communiquer', 'écouter', 'soutenir', 'yardım', 'eşlik', 'öğretmek', 'ekip', 'ilişki', 'iletişim', 'dinlemek'],
    enterprising: ['diriger', 'vendre', 'convaincre', 'entreprendre', 'négocier', 'leadership', 'décision', 'influence', 'yönetmek', 'satmak', 'ikna', 'girişim', 'müzakere', 'liderlik', 'karar'],
    conventional: ['organiser', 'planifier', 'méthode', 'précis', 'procédure', 'administratif', 'structurer', 'classer', 'organize', 'planlamak', 'yöntem', 'kesin', 'prosedür', 'idari', 'yapılandırmak']
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
    { name: tE('Communication', 'İletişim'), keywords: ['communiquer', 'présenter', 'expliquer', 'écouter', 'rédiger', 'oral', 'écrit', 'iletişim', 'sunmak', 'açıklamak', 'dinlemek', 'yazmak'] },
    { name: tE('Leadership', 'Liderlik'), keywords: ['diriger', 'manager', 'encadrer', 'motiver', 'déléguer', 'équipe', 'responsabilité', 'yönetmek', 'motive', 'delege', 'ekip', 'sorumluluk'] },
    { name: tE('Organisation', 'Organizasyon'), keywords: ['organiser', 'planifier', 'coordonner', 'gérer', 'priorité', 'temps', 'projet', 'organize', 'planlamak', 'koordine', 'yönetmek', 'öncelik', 'zaman', 'proje'] },
    { name: tE('Analyse', 'Analiz'), keywords: ['analyser', 'résoudre', 'synthétiser', 'évaluer', 'diagnostic', 'problème', 'solution', 'analiz', 'çözmek', 'sentez', 'değerlendirmek', 'teşhis', 'sorun', 'çözüm'] },
    { name: tE('Créativité', 'Yaratıcılık'), keywords: ['créer', 'innover', 'imaginer', 'concevoir', 'idée', 'original', 'nouveau', 'yaratmak', 'yenilik', 'hayal', 'tasarlamak', 'fikir', 'özgün', 'yeni'] },
    { name: tE('Relationnel', 'İlişkisel'), keywords: ['relation', 'collaborer', 'négocier', 'réseau', 'partenaire', 'client', 'contact', 'ilişki', 'işbirliği', 'müzakere', 'ağ', 'ortak', 'müşteri', 'iletişim'] },
    { name: tE('Technique', 'Teknik'), keywords: ['technique', 'outil', 'logiciel', 'méthode', 'procédure', 'système', 'informatique', 'teknik', 'araç', 'yazılım', 'yöntem', 'prosedür', 'sistem', 'bilişim'] },
    { name: tE('Adaptabilité', 'Uyum Yeteneği'), keywords: ['adapter', 'flexible', 'changement', 'apprendre', 'évolution', 'polyvalent', 'réactif', 'uyum', 'esnek', 'değişim', 'öğrenmek', 'gelişim', 'çok yönlü', 'reaktif'] }
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
      developmentSuggestions: level < 4 ? [tE(`Renforcer les compétences en ${cat.name.toLowerCase()}`, `${cat.name} alanındaki yetkinlikleri güçlendirmek`)] : []
    };
  });
};

// Helper pour extraire les valeurs détaillées
const extractDetailedValues = (answers: Answer[]): ValueAnalysis[] => {
  const valueKeywords: Record<string, string[]> = {
    [tE('Autonomie', 'Özerklik')]: ['autonome', 'indépendant', 'liberté', 'décider seul', 'özerk', 'bağımsız', 'özgürlük'],
    [tE('Sécurité', 'Güvenlik')]: ['sécurité', 'stable', 'garanti', 'pérenne', 'güvenlik', 'istikrar', 'garanti', 'kalıcı'],
    [tE('Reconnaissance', 'Tanınma')]: ['reconnu', 'valorisé', 'apprécié', 'respecté', 'tanınmış', 'değerli', 'takdir', 'saygı'],
    [tE('Équilibre vie pro/perso', 'İş/Özel Yaşam Dengesi')]: ['équilibre', 'famille', 'temps libre', 'vie personnelle', 'denge', 'aile', 'boş zaman', 'özel yaşam'],
    [tE('Sens du travail', 'İşin Anlamı')]: ['sens', 'utilité', 'impact', 'contribution', 'anlam', 'fayda', 'etki', 'katkı'],
    [tE('Rémunération', 'Ücretlendirme')]: ['salaire', 'rémunération', 'revenus', 'argent', 'maaş', 'ücret', 'gelir', 'para'],
    [tE('Évolution', 'Gelişim')]: ['évoluer', 'progresser', 'carrière', 'promotion', 'gelişmek', 'ilerlemek', 'kariyer', 'terfi'],
    [tE('Créativité', 'Yaratıcılık')]: ['créatif', 'innover', 'imagination', 'original', 'yaratıcı', 'yenilik', 'hayal', 'özgün'],
    [tE('Relations humaines', 'İnsan İlişkileri')]: ['équipe', 'collègues', 'ambiance', 'convivial', 'ekip', 'meslektaş', 'ortam', 'samimi'],
    [tE('Challenge', 'Meydan Okuma')]: ['défi', 'challenge', 'stimulant', 'complexe', 'meydan', 'zorluk', 'teşvik', 'karmaşık']
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
        manifestation: manifestation || tE(`Expression de la valeur "${value}" dans les réponses`, `Yanıtlarda "${value}" değerinin ifadesi`)
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
   * @param forceLang - Langue forcée optionnelle ('fr' ou 'tr')
   */
  generateEnrichedSynthese(data: SyntheseData, feasibilityData?: FeasibilityData, forceLang?: string): Blob {
    _forceLang = forceLang || null;
    
    const doc = new jsPDF();
    let y = 20;
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxWidth = pageWidth - 2 * margin;

    // Helpers
    const addText = (text: string, fontSize: number = 11, isBold: boolean = false, color: [number, number, number] = [0, 0, 0]) => {
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
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(label, x, yPos - 2);
      
      doc.setFillColor(230, 230, 230);
      doc.rect(x, yPos, width, 6, 'F');
      
      const progressWidth = (value / 100) * width;
      doc.setFillColor(79, 70, 229);
      doc.rect(x, yPos, progressWidth, 6, 'F');
      
      doc.setFontSize(8);
      doc.text(`${value}%`, x + width + 3, yPos + 5);
    };

    // ========== PAGE DE GARDE ==========
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, pageWidth, 70, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.text(tE('DOCUMENT DE SYNTHÈSE', 'SENTEZ BELGESİ'), pageWidth / 2, 28, { align: 'center' });
    doc.setFontSize(18);
    doc.text(tE('Bilan de Compétences', 'Yetkinlik Değerlendirmesi'), pageWidth / 2, 45, { align: 'center' });
    doc.setFontSize(12);
    doc.text(tE('Conforme au référentiel Qualiopi', 'Qualiopi referansına uygun'), pageWidth / 2, 60, { align: 'center' });

    y = 90;
    doc.setTextColor(0, 0, 0);

    // Informations bénéficiaire
    doc.setFillColor(245, 245, 255);
    doc.rect(margin, y - 5, maxWidth, 55, 'F');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(tE('Informations du bénéficiaire', 'Yararlanıcı bilgileri'), margin + 5, y + 5);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`${tE('Nom', 'Ad Soyad')} : ${data.userName}`, margin + 5, y + 18);
    doc.text(`${tE('Forfait', 'Paket')} : ${data.packageName}`, margin + 5, y + 28);
    doc.text(`${tE('Période', 'Dönem')} : ${tE('du', '')} ${data.startDate} ${tE('au', '-')} ${data.endDate}`, margin + 5, y + 38);
    doc.text(`${tE('Consultant', 'Danışman')} : ${data.consultantName}`, margin + 5, y + 48);
    
    y += 65;

    // Organisme
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`${tE('Organisme', 'Kuruluş')} : ${data.organizationName}`, margin + 5, y);
    doc.text(`${tE('Adresse', 'Adres')} : ${getFullAddress()}`, margin + 5, y + 10);
    doc.text(`${tE('Certifié Qualiopi', 'Qualiopi sertifikalı')} - ${organizationConfig.qualiopi}`, margin + 5, y + 20);
    doc.setTextColor(0, 0, 0);

    // ========== TABLE DES MATIÈRES ==========
    doc.addPage();
    y = 20;
    
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229);
    doc.text(tE('TABLE DES MATIÈRES', 'İÇİNDEKİLER'), pageWidth / 2, y, { align: 'center' });
    y += 20;
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    
    const tocItems = [
      tE('1. Contexte et objectifs du bilan', '1. Değerlendirmenin bağlamı ve hedefleri'),
      tE('2. Parcours professionnel', '2. Mesleki geçmiş'),
      tE('3. Analyse des compétences', '3. Yetkinlik analizi'),
      tE('4. Profil RIASEC', '4. RIASEC profili'),
      tE('5. Analyse des valeurs professionnelles', '5. Mesleki değerler analizi'),
      tE('6. Aptitudes et motivations', '6. Yetenekler ve motivasyonlar'),
      tE('7. Axes de développement', '7. Gelişim eksenleri'),
      tE('8. Projet professionnel', '8. Mesleki proje'),
      tE('9. Pistes métiers explorées', '9. İncelenen meslek yolları'),
      tE('10. Plan d\'action', '10. Eylem planı'),
      tE('11. Ressources et contacts utiles', '11. Faydalı kaynaklar ve iletişim bilgileri'),
      tE('12. Conclusion et suivi', '12. Sonuç ve takip'),
      tE('Annexes', 'Ekler')
    ];
    
    tocItems.forEach((item, index) => {
      doc.setFont('helvetica', index < 12 ? 'normal' : 'bold');
      doc.text(item, margin + 10, y);
      y += 10;
    });

    // ========== SECTION 1: CONTEXTE ==========
    doc.addPage();
    y = 20;
    
    addSection(tE('CONTEXTE ET OBJECTIFS DU BILAN', 'DEĞERLENDİRMENİN BAĞLAMI VE HEDEFLERİ'), '1');
    
    addSubSection(tE('Cadre légal', 'Yasal çerçeve'));
    addText(tE(
      'Le bilan de compétences est réalisé conformément aux articles L.6313-4 et R.6313-4 à R.6313-8 du Code du travail. Il a pour objet de permettre au bénéficiaire d\'analyser ses compétences professionnelles et personnelles, ses aptitudes et motivations, afin de définir un projet professionnel et, le cas échéant, un projet de formation.',
      'Yetkinlik değerlendirmesi, İş Kanunu\'nun L.6313-4 ve R.6313-4 ile R.6313-8 maddeleri uyarınca gerçekleştirilmektedir. Amacı, yararlanıcının mesleki ve kişisel yetkinliklerini, yeteneklerini ve motivasyonlarını analiz ederek bir mesleki proje ve gerektiğinde bir eğitim projesi tanımlamasını sağlamaktır.'
    ));
    
    addSubSection(tE('Objectifs personnalisés', 'Kişiselleştirilmiş hedefler'));
    addText(tE(
      `Le bilan de compétences de ${data.userName} a été réalisé dans le cadre du forfait "${data.packageName}", du ${data.startDate} au ${data.endDate}, sous la conduite de ${data.consultantName}.`,
      `${data.userName} adlı kişinin yetkinlik değerlendirmesi, "${data.packageName}" paketi kapsamında, ${data.startDate} ile ${data.endDate} tarihleri arasında, ${data.consultantName} rehberliğinde gerçekleştirilmiştir.`
    ));
    
    addSubSection(tE('Déroulement', 'Süreç'));
    addText(tE(
      'Le bilan s\'est déroulé en trois phases conformément à la réglementation :',
      'Değerlendirme, mevzuata uygun olarak üç aşamada gerçekleştirilmiştir:'
    ));
    addText(tE(
      '• Phase préliminaire : analyse de la demande, définition des objectifs et des modalités',
      '• Ön aşama: talebin analizi, hedeflerin ve yöntemlerin belirlenmesi'
    ));
    addText(tE(
      '• Phase d\'investigation : exploration du parcours, des compétences, des intérêts et des valeurs',
      '• Araştırma aşaması: geçmişin, yetkinliklerin, ilgi alanlarının ve değerlerin incelenmesi'
    ));
    addText(tE(
      '• Phase de conclusion : synthèse des résultats, définition du projet et du plan d\'action',
      '• Sonuç aşaması: sonuçların sentezi, projenin ve eylem planının belirlenmesi'
    ));

    // ========== SECTION 2: PARCOURS ==========
    doc.addPage();
    y = 20;
    
    addSection(tE('PARCOURS PROFESSIONNEL', 'MESLEKİ GEÇMİŞ'), '2');
    
    addSubSection(tE('Expériences significatives', 'Önemli deneyimler'));
    if (data.summary.strengths && data.summary.strengths.length > 0) {
      addText(tE(
        'L\'analyse du parcours professionnel a mis en évidence les points forts suivants :',
        'Mesleki geçmişin analizi aşağıdaki güçlü yönleri ortaya koymuştur:'
      ));
      data.summary.strengths.forEach(strength => {
        addText(`• ${strength}`);
      });
    }
    
    addSubSection(tE('Compétences transférables identifiées', 'Belirlenen aktarılabilir yetkinlikler'));
    if (data.summary.transferableSkills && data.summary.transferableSkills.length > 0) {
      data.summary.transferableSkills.forEach(skill => {
        addText(`• ${skill}`);
      });
    } else {
      addText(tE(
        'Les compétences transférables ont été identifiées à travers l\'analyse des expériences professionnelles et personnelles.',
        'Aktarılabilir yetkinlikler, mesleki ve kişisel deneyimlerin analizi yoluyla belirlenmiştir.'
      ));
    }

    // ========== SECTION 3: COMPÉTENCES ==========
    doc.addPage();
    y = 20;
    
    addSection(tE('ANALYSE APPROFONDIE DES COMPÉTENCES', 'DERİNLEMESİNE YETKİNLİK ANALİZİ'), '3');
    
    const competences = extractDetailedCompetences(data.answers, data.summary);
    
    addText(tE(
      'L\'analyse des compétences a été réalisée à partir des entretiens, des exercices et des réponses aux questionnaires. Chaque domaine de compétence est évalué sur une échelle de 1 à 5.',
      'Yetkinlik analizi, görüşmeler, alıştırmalar ve anket yanıtları temelinde gerçekleştirilmiştir. Her yetkinlik alanı 1-5 ölçeğinde değerlendirilmiştir.'
    ));
    y += 5;
    
    competences.forEach(comp => {
      if (y > 240) {
        doc.addPage();
        y = 20;
      }
      
      // Nom de la compétence et niveau
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(comp.category, margin, y);
      
      // Étoiles de niveau
      const stars = '★'.repeat(comp.level) + '☆'.repeat(5 - comp.level);
      doc.setTextColor(79, 70, 229);
      doc.text(stars, margin + 60, y);
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`${comp.level}/5`, margin + 90, y);
      
      y += 8;
      
      // Exemples
      if (comp.examples.length > 0) {
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        comp.examples.forEach(ex => {
          const exLines = doc.splitTextToSize(`« ${ex.substring(0, 150)}${ex.length > 150 ? '...' : ''} »`, maxWidth - 10);
          exLines.slice(0, 2).forEach((line: string) => {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.text(line, margin + 5, y);
            y += 4;
          });
        });
        doc.setTextColor(0, 0, 0);
      }
      
      // Suggestions de développement
      if (comp.developmentSuggestions.length > 0) {
        doc.setFontSize(9);
        doc.setTextColor(234, 88, 12);
        comp.developmentSuggestions.forEach(sug => {
          doc.text(`→ ${sug}`, margin + 5, y);
          y += 5;
        });
        doc.setTextColor(0, 0, 0);
      }
      
      y += 5;
    });

    // ========== SECTION 4: RIASEC ==========
    doc.addPage();
    y = 20;
    
    addSection(tE('PROFIL D\'INTÉRÊTS PROFESSIONNELS (RIASEC)', 'MESLEKİ İLGİ PROFİLİ (RIASEC)'), '4');
    
    addText(tE(
      'Le modèle RIASEC de John Holland identifie six types d\'intérêts professionnels. L\'analyse des réponses du bénéficiaire permet de dessiner son profil :',
      'John Holland\'ın RIASEC modeli altı tür mesleki ilgi alanı tanımlar. Yararlanıcının yanıtlarının analizi profilini çizmeye olanak tanır:'
    ));
    y += 5;
    
    const riasec = extractRIASECProfile(data.answers);
    
    const riasecLabels: Record<string, string> = {
      realistic: tE('Réaliste (R) - Technique et pratique', 'Gerçekçi (R) - Teknik ve pratik'),
      investigative: tE('Investigateur (I) - Recherche et analyse', 'Araştırmacı (I) - Araştırma ve analiz'),
      artistic: tE('Artistique (A) - Créativité et expression', 'Sanatsal (A) - Yaratıcılık ve ifade'),
      social: tE('Social (S) - Relations et accompagnement', 'Sosyal (S) - İlişkiler ve eşlik'),
      enterprising: tE('Entreprenant (E) - Leadership et influence', 'Girişimci (E) - Liderlik ve etki'),
      conventional: tE('Conventionnel (C) - Organisation et méthode', 'Geleneksel (C) - Organizasyon ve yöntem')
    };
    
    Object.entries(riasec).forEach(([key, value]) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      drawProgressBar(margin, y, 100, value, riasecLabels[key as keyof typeof riasecLabels] || key);
      y += 18;
    });
    
    y += 10;
    
    const sortedRiasec = Object.entries(riasec).sort((a, b) => b[1] - a[1]);
    const topTypes = sortedRiasec.slice(0, 3).map(([key]) => key);
    
    addSubSection(tE('Interprétation', 'Yorumlama'));
    addText(tE(
      `Les types dominants identifiés sont : ${topTypes.map(t => (riasecLabels[t as keyof typeof riasecLabels] || t).split(' ')[0]).join(', ')}.`,
      `Belirlenen baskın tipler: ${topTypes.map(t => (riasecLabels[t as keyof typeof riasecLabels] || t).split(' ')[0]).join(', ')}.`
    ));
    addText(tE(
      'Cette combinaison suggère une affinité pour les métiers et environnements de travail correspondant à ces caractéristiques.',
      'Bu kombinasyon, bu özelliklere karşılık gelen meslekler ve çalışma ortamları için bir yakınlık olduğunu göstermektedir.'
    ));

    // ========== SECTION 5: VALEURS ==========
    doc.addPage();
    y = 20;
    
    addSection(tE('ANALYSE DES VALEURS PROFESSIONNELLES', 'MESLEKİ DEĞERLER ANALİZİ'), '5');
    
    const values = extractDetailedValues(data.answers);
    
    addSubSection(tE('Valeurs prioritaires', 'Öncelikli değerler'));
    addText(tE(
      'L\'analyse des entretiens a permis d\'identifier les valeurs professionnelles suivantes :',
      'Görüşmelerin analizi aşağıdaki mesleki değerlerin belirlenmesini sağlamıştır:'
    ));
    y += 5;
    
    const importanceLabel = (imp: string) => tE(imp, imp === 'haute' ? 'yüksek' : imp === 'moyenne' ? 'orta' : 'düşük');
    
    if (values.length > 0) {
      values.forEach(val => {
        if (y > 250) {
          doc.addPage();
          y = 20;
        }
        
        const importanceColor: [number, number, number] = val.importance === 'haute' ? [34, 197, 94] : 
                               val.importance === 'moyenne' ? [234, 179, 8] : [156, 163, 175];
        
        doc.setFillColor(importanceColor[0], importanceColor[1], importanceColor[2]);
        doc.circle(margin + 3, y + 2, 3, 'F');
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(val.value, margin + 10, y + 4);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`(${tE('Importance', 'Önem')} : ${importanceLabel(val.importance)})`, margin + 60, y + 4);
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
    
    addSubSection(tE('Impact sur le projet professionnel', 'Mesleki proje üzerindeki etkisi'));
    addText(tE(
      'Ces valeurs constituent des critères essentiels pour évaluer la pertinence des pistes professionnelles envisagées et garantir l\'épanouissement dans le futur environnement de travail.',
      'Bu değerler, düşünülen mesleki yolların uygunluğunu değerlendirmek ve gelecekteki çalışma ortamında tatmini garanti etmek için temel kriterler oluşturmaktadır.'
    ));

    // ========== SECTION 6: APTITUDES ET MOTIVATIONS ==========
    doc.addPage();
    y = 20;
    
    addSection(tE('APTITUDES ET MOTIVATIONS', 'YETENEKLER VE MOTİVASYONLAR'), '6');
    
    addSubSection(tE('Motivations principales', 'Ana motivasyonlar'));
    if (data.summary.motivations && data.summary.motivations.length > 0) {
      data.summary.motivations.forEach(motivation => {
        addText(`• ${motivation}`);
      });
    } else {
      addText(tE(
        'Les motivations ont été explorées à travers les entretiens et les exercices du bilan.',
        'Motivasyonlar, görüşmeler ve değerlendirme alıştırmaları aracılığıyla incelenmiştir.'
      ));
    }
    
    addSubSection(tE('Sources de satisfaction professionnelle', 'Mesleki tatmin kaynakları'));
    const satisfactionKeywords = ['satisf', 'plaisir', 'épanoui', 'motiv', 'passion', 'tatmin', 'zevk', 'mutlu', 'tutku'];
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
    
    addSubSection(tE('Environnement de travail recherché', 'Aranan çalışma ortamı'));
    const envKeywords = ['environnement', 'ambiance', 'autonomie', 'équipe', 'télétravail', 'ortam', 'atmosfer', 'özerklik', 'ekip', 'uzaktan'];
    const envAnswers = data.answers.filter(a => 
      a.value && typeof a.value === 'string' && 
      envKeywords.some(kw => a.value.toLowerCase().includes(kw))
    ).slice(0, 2);
    
    if (envAnswers.length > 0) {
      envAnswers.forEach(answer => {
        addText(`• ${answer.value.substring(0, 200)}${answer.value.length > 200 ? '...' : ''}`);
      });
    } else {
      addText(tE(
        'L\'environnement de travail idéal a été défini en fonction des valeurs et des préférences identifiées.',
        'İdeal çalışma ortamı, belirlenen değerler ve tercihler doğrultusunda tanımlanmıştır.'
      ));
    }

    // ========== SECTION 7: AXES DE DÉVELOPPEMENT ==========
    doc.addPage();
    y = 20;
    
    addSection(tE('AXES DE DÉVELOPPEMENT', 'GELİŞİM EKSENLERİ'), '7');
    
    addSubSection(tE('Points à développer', 'Geliştirilecek noktalar'));
    const areasToImprove = data.summary.areasToImprove || 
      (data.summary.areasForDevelopment?.map(a => typeof a === 'string' ? a : a.text) || []);
    
    if (areasToImprove.length > 0) {
      areasToImprove.forEach(area => {
        addText(`• ${area}`);
      });
    }
    
    addSubSection(tE('Compétences à acquérir ou renforcer', 'Edinilecek veya güçlendirilecek yetkinlikler'));
    const competencesToDevelop = competences.filter(c => c.level < 4);
    if (competencesToDevelop.length > 0) {
      competencesToDevelop.forEach(comp => {
        addText(tE(
          `• ${comp.category} : niveau actuel ${comp.level}/5 - potentiel de développement identifié`,
          `• ${comp.category} : mevcut seviye ${comp.level}/5 - gelişim potansiyeli belirlendi`
        ));
      });
    }
    
    addSubSection(tE('Formations recommandées', 'Önerilen eğitimler'));
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
    
    addSection(tE('PROJET PROFESSIONNEL', 'MESLEKİ PROJE'), '8');
    
    addSubSection(tE('Définition du projet', 'Projenin tanımı'));
    if (data.projectProfessionnel || data.summary.projectProfessionnel) {
      addText(data.projectProfessionnel || data.summary.projectProfessionnel || '');
    } else {
      addText(tE(
        'Le projet professionnel a été défini en cohérence avec le profil, les compétences, les valeurs et les aspirations du bénéficiaire.',
        'Mesleki proje, yararlanıcının profili, yetkinlikleri, değerleri ve beklentileri ile uyumlu olarak tanımlanmıştır.'
      ));
    }
    
    addSubSection(tE('Métiers visés', 'Hedeflenen meslekler'));
    if (data.metiersVises && data.metiersVises.length > 0) {
      data.metiersVises.forEach(metier => {
        addText(`• ${metier}`);
      });
    } else if (data.careerPaths && data.careerPaths.length > 0) {
      data.careerPaths.slice(0, 3).forEach(path => {
        addText(`• ${path.title} (${tE('correspondance', 'uyum')} : ${path.matchScore}%)`);
      });
    }
    
    addSubSection(tE('Secteurs d\'activité privilégiés', 'Tercih edilen faaliyet sektörleri'));
    if (data.careerPaths && data.careerPaths.length > 0) {
      const sectors = [...new Set(data.careerPaths.map(p => p.sector).filter(Boolean))];
      if (sectors.length > 0) {
        sectors.forEach(sector => {
          addText(`• ${sector}`);
        });
      }
    }
    
    addSubSection(tE('Recommandations', 'Öneriler'));
    if (data.summary.recommendations && data.summary.recommendations.length > 0) {
      data.summary.recommendations.forEach(rec => {
        addText(`• ${rec}`);
      });
    }

    // ========== SECTION 9: PISTES MÉTIERS ==========
    if (data.careerPaths && data.careerPaths.length > 0) {
      doc.addPage();
      y = 20;
      
      addSection(tE('PISTES MÉTIERS EXPLORÉES', 'İNCELENEN MESLEK YOLLARI'), '9');
      
      addText(tE(
        'Les pistes suivantes ont été identifiées lors de l\'exploration personnalisée basée sur le profil du bénéficiaire et les tendances du marché du travail :',
        'Aşağıdaki yollar, yararlanıcının profili ve iş piyasası eğilimleri temelinde kişiselleştirilmiş keşif sırasında belirlenmiştir:'
      ));
      y += 5;
      
      const trendLabelFn = (trend: string) => {
        if (trend === 'en_croissance') return tE('↑ En croissance', '↑ Büyüme');
        if (trend === 'en_declin') return tE('↓ En déclin', '↓ Düşüş');
        return tE('→ Stable', '→ Stabil');
      };
      
      data.careerPaths.slice(0, 5).forEach((path, index) => {
        if (y > 200) {
          doc.addPage();
          y = 20;
        }
        
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
        
        doc.text(`${tE('Correspondance', 'Uyum')} : ${path.matchScore}% | ${trendLabelFn(path.marketTrend)} | ${path.salaryRange}`, margin + 3, y + 15);
        
        const descLines = doc.splitTextToSize(path.description, maxWidth - 10);
        doc.text(descLines[0], margin + 3, y + 23);
        
        y += 40;
        
        if (path.matchReasons && path.matchReasons.length > 0) {
          addText(tE('Pourquoi cette piste :', 'Bu yol neden :'), 10, true);
          path.matchReasons.slice(0, 2).forEach(reason => {
            addText(`  • ${reason}`, 9);
          });
        }
        
        y += 5;
      });
    }

    // ========== SECTION 9bis: ANALYSE DE FAISABILITÉ ==========
    if (feasibilityData && (feasibilityData.marketExploration || feasibilityData.feasibilityReport)) {
      doc.addPage();
      y = 20;
      
      addSection(tE('ANALYSE DE FAISABILITÉ DU PROJET', 'PROJENİN FİZİBİLİTE ANALİZİ'), '9bis');
      
      if (feasibilityData.marketExploration?.feasibilityAnalysis) {
        const fa = feasibilityData.marketExploration.feasibilityAnalysis;
        
        addSubSection(tE('Score de faisabilité global', 'Genel fizibilite puanı'));
        
        const score = fa.overallScore;
        const scoreColor: [number, number, number] = score >= 8 ? [34, 197, 94] : score >= 6 ? [234, 179, 8] : score >= 4 ? [249, 115, 22] : [239, 68, 68];
        
        doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
        doc.roundedRect(margin, y, 30, 20, 3, 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(`${score}/10`, margin + 15, y + 13, { align: 'center' });
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        const scoreLabel = score >= 8 ? tE('Excellent - Projet très réalisable', 'Mükemmel - Çok gerçekleştirilebilir proje') : 
                          score >= 6 ? tE('Bon - Projet réalisable avec quelques ajustements', 'İyi - Bazı ayarlamalarla gerçekleştirilebilir proje') : 
                          score >= 4 ? tE('Modéré - Projet nécessitant des efforts significatifs', 'Orta - Önemli çaba gerektiren proje') : 
                          tE('Difficile - Projet ambitieux nécessitant une réorientation', 'Zor - Yeniden yönlendirme gerektiren iddialı proje');
        doc.text(scoreLabel, margin + 35, y + 13);
        y += 30;
        
        addText(fa.feasibilityComment, 10);
        y += 5;
      }
      
      if (feasibilityData.marketExploration?.marketAnalysis) {
        const ma = feasibilityData.marketExploration.marketAnalysis;
        
        addSubSection(tE('Analyse du marché de l\'emploi', 'İstihdam piyasası analizi'));
        
        const demandColor: [number, number, number] = ma.demandLevel === 'très_forte' || ma.demandLevel === 'forte' ? [34, 197, 94] : 
                           ma.demandLevel === 'moyenne' ? [234, 179, 8] : [239, 68, 68];
        
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, y, maxWidth, 35, 'F');
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(tE('Niveau de demande', 'Talep seviyesi'), margin + 5, y + 8);
        doc.text(tE('Tendance', 'Eğilim'), margin + 50, y + 8);
        doc.text(tE('Salaire', 'Maaş'), margin + 90, y + 8);
        doc.text(tE('Régions', 'Bölgeler'), margin + 130, y + 8);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(demandColor[0]!, demandColor[1]!, demandColor[2]!);
        doc.text(ma.demandLevel.replace('_', ' '), margin + 5, y + 18);
        doc.setTextColor(0, 0, 0);
        doc.text(ma.demandTrend, margin + 50, y + 18);
        doc.text(ma.salaryRange, margin + 90, y + 18);
        const regions = ma.geographicOpportunities.slice(0, 2).join(', ');
        doc.text(regions.substring(0, 25), margin + 130, y + 18);
        
        y += 40;
        
        addText(tE('Secteurs qui recrutent : ', 'İşe alan sektörler: ') + ma.sectors.join(', '), 10);
        addText(ma.marketInsights, 10);
        y += 5;
      }
      
      if (feasibilityData.marketExploration?.feasibilityAnalysis) {
        const fa = feasibilityData.marketExploration.feasibilityAnalysis;
        
        addSubSection(tE('Analyse des compétences', 'Yetkinlik analizi'));
        
        const colWidth = (maxWidth - 10) / 2;
        
        doc.setFillColor(220, 252, 231);
        doc.rect(margin, y, colWidth, 8, 'F');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(22, 101, 52);
        doc.text(tE('\u2713 Compétences correspondantes', '\u2713 Uyumlu yetkinlikler'), margin + 3, y + 6);
        
        doc.setFillColor(254, 243, 199);
        doc.rect(margin + colWidth + 10, y, colWidth, 8, 'F');
        doc.setTextColor(146, 64, 14);
        doc.text(tE('\u26A0 Compétences à développer', '\u26A0 Geliştirilecek yetkinlikler'), margin + colWidth + 13, y + 6);
        
        y += 12;
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        
        const maxItems = Math.max(fa.matchingSkills.length, fa.skillGaps.length);
        for (let i = 0; i < Math.min(maxItems, 5); i++) {
          if (fa.matchingSkills[i]) {
            doc.text('\u2022 ' + fa.matchingSkills[i]!.substring(0, 35), margin + 3, y);
          }
          if (fa.skillGaps[i]) {
            doc.text('\u2022 ' + fa.skillGaps[i]!.substring(0, 35), margin + colWidth + 13, y);
          }
          y += 5;
        }
        y += 5;
      }
      
      if (feasibilityData.marketExploration?.trainingRecommendations && 
          feasibilityData.marketExploration.trainingRecommendations.length > 0) {
        
        addSubSection(tE('Formations recommandées', 'Önerilen eğitimler'));
        
        feasibilityData.marketExploration.trainingRecommendations.slice(0, 4).forEach((training) => {
          const priorityColor: [number, number, number] = training.priority === 'essentielle' ? [239, 68, 68] : 
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
      
      if (feasibilityData.jobInterview) {
        const ji = feasibilityData.jobInterview;
        
        if (y > 200) {
          doc.addPage();
          y = 20;
        }
        
        addSubSection(tE(
          `Insights de l'enquête métier (${ji.professionalPersona.name})`,
          `Meslek araştırması bilgileri (${ji.professionalPersona.name})`
        ));
        
        addText(tE(
          `Témoignage de ${ji.professionalPersona.name}, ${ji.professionalPersona.currentRole} depuis ${ji.professionalPersona.yearsExperience} ans.`,
          `${ji.professionalPersona.name} ifadesi, ${ji.professionalPersona.yearsExperience} yıldır ${ji.professionalPersona.currentRole}.`
        ), 10, true);
        
        const colWidth2 = (maxWidth - 10) / 2;
        
        doc.setFillColor(220, 252, 231);
        doc.rect(margin, y, colWidth2, 8, 'F');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(22, 101, 52);
        doc.text(tE('Avantages du métier', 'Mesleğin avantajları'), margin + 3, y + 6);
        
        doc.setFillColor(254, 226, 226);
        doc.rect(margin + colWidth2 + 10, y, colWidth2, 8, 'F');
        doc.setTextColor(153, 27, 27);
        doc.text(tE('Points de vigilance', 'Dikkat edilecek noktalar'), margin + colWidth2 + 13, y + 6);
        
        y += 12;
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        
        const maxPros = Math.max(ji.honestOpinion.prosOfJob.length, ji.honestOpinion.consOfJob.length);
        for (let i = 0; i < Math.min(maxPros, 4); i++) {
          if (ji.honestOpinion.prosOfJob[i]) {
            const proText = ji.honestOpinion.prosOfJob[i]!.substring(0, 35);
            doc.text('\u2022 ' + proText, margin + 3, y);
          }
          if (ji.honestOpinion.consOfJob[i]) {
            const conText = ji.honestOpinion.consOfJob[i]!.substring(0, 35);
            doc.text('\u2022 ' + conText, margin + colWidth2 + 13, y);
          }
          y += 5;
        }
        y += 8;
        
        addText(tE('Conseils pour réussir :', 'Başarı için tavsiyeler:'), 10, true);
        addText(ji.careerAdvice.entryTips, 9);
        y += 5;
      }
      
      if (feasibilityData.marketExploration?.alternativePaths && 
          feasibilityData.marketExploration.alternativePaths.length > 0) {
        
        addSubSection(tE('Pistes alternatives à considérer', 'Değerlendirilecek alternatif yollar'));
        
        feasibilityData.marketExploration.alternativePaths.forEach((alt, i) => {
          const easeColor: [number, number, number] = alt.transitionEase === 'facile' ? [34, 197, 94] : 
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
    
    addSection(tE('PLAN D\'ACTION', 'EYLEM PLANI'), '10');
    
    const hasActionPlan = data.summary.actionPlan && 
      (data.summary.actionPlan.shortTerm?.length > 0 || data.summary.actionPlan.mediumTerm?.length > 0);
    
    if (hasActionPlan) {
      if (data.summary.actionPlan.shortTerm && data.summary.actionPlan.shortTerm.length > 0) {
        addSubSection(tE('Actions à court terme (1-3 mois)', 'Kısa vadeli eylemler (1-3 ay)'));
        data.summary.actionPlan.shortTerm.forEach((item, i) => {
          const text = typeof item === 'string' ? item : item.text;
          doc.setFillColor(220, 252, 231);
          doc.rect(margin, y - 3, maxWidth, 12, 'F');
          addText(`${i + 1}. ${text}`, 11, false);
          y += 3;
        });
      }
      
      if (data.summary.actionPlan.mediumTerm && data.summary.actionPlan.mediumTerm.length > 0) {
        addSubSection(tE('Actions à moyen terme (3-6 mois)', 'Orta vadeli eylemler (3-6 ay)'));
        data.summary.actionPlan.mediumTerm.forEach((item, i) => {
          const text = typeof item === 'string' ? item : item.text;
          doc.setFillColor(254, 249, 195);
          doc.rect(margin, y - 3, maxWidth, 12, 'F');
          addText(`${i + 1}. ${text}`, 11, false);
          y += 3;
        });
      }
      
      if (data.summary.actionPlan.longTerm && data.summary.actionPlan.longTerm.length > 0) {
        addSubSection(tE('Actions à long terme (6-12 mois)', 'Uzun vadeli eylemler (6-12 ay)'));
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
        addText(`   ${tE('Échéance', 'Son tarih')} : ${item.echeance} | ${tE('Priorité', 'Öncelik')} : ${item.priorite}`, 9, false, [100, 100, 100]);
        y += 3;
      });
    } else {
      addText(tE(
        'Le plan d\'action détaillé sera élaboré avec le consultant lors de l\'entretien de suivi.',
        'Ayrıntılı eylem planı, takip görüşmesi sırasında danışmanla birlikte hazırlanacaktır.'
      ));
    }

    // ========== SECTION 11: RESSOURCES ==========
    doc.addPage();
    y = 20;
    
    addSection(tE('RESSOURCES ET CONTACTS UTILES', 'FAYDALI KAYNAKLAR VE İLETİŞİM BİLGİLERİ'), '11');
    
    addSubSection(tE('Organismes de formation', 'Eğitim kuruluşları'));
    addText(tE('• Pôle Emploi - www.pole-emploi.fr - Accompagnement à la recherche d\'emploi', '• Pôle Emploi - www.pole-emploi.fr - İş arama desteği'));
    addText(tE('• APEC - www.apec.fr - Association pour l\'emploi des cadres', '• APEC - www.apec.fr - Yönetici istihdamı derneği'));
    addText(tE('• Mon Compte Formation - www.moncompteformation.gouv.fr - Financement CPF', '• Mon Compte Formation - www.moncompteformation.gouv.fr - CPF finansmanı'));
    addText(tE('• France Compétences - www.francecompetences.fr - Certifications professionnelles', '• France Compétences - www.francecompetences.fr - Mesleki sertifikalar'));
    
    addSubSection(tE('Réseaux professionnels', 'Profesyonel ağlar'));
    addText(tE('• LinkedIn - Réseau professionnel en ligne', '• LinkedIn - Çevrimiçi profesyonel ağ'));
    addText(tE('• Viadeo - Réseau professionnel francophone', '• Viadeo - Frankofon profesyonel ağ'));
    addText(tE('• Meetup - Événements et rencontres professionnelles', '• Meetup - Profesyonel etkinlikler ve buluşmalar'));
    
    addSubSection(tE('Ressources documentaires', 'Belge kaynakları'));
    addText(tE('• ONISEP - www.onisep.fr - Information sur les métiers et formations', '• ONISEP - www.onisep.fr - Meslekler ve eğitimler hakkında bilgi'));
    addText(tE('• CIDJ - www.cidj.com - Centre d\'information et de documentation jeunesse', '• CIDJ - www.cidj.com - Gençlik bilgi ve dokümantasyon merkezi'));
    addText(tE('• Orientation pour tous - www.orientation-pour-tous.fr', '• Orientation pour tous - www.orientation-pour-tous.fr'));
    
    addSubSection(tE('Accompagnement entrepreneuriat', 'Girişimcilik desteği'));
    addText(tE('• BPI France - www.bpifrance.fr - Financement et accompagnement', '• BPI France - www.bpifrance.fr - Finansman ve destek'));
    addText(tE('• CCI - Chambre de Commerce et d\'Industrie', '• CCI - Ticaret ve Sanayi Odası'));
    addText(tE('• BGE - Réseau d\'accompagnement à la création d\'entreprise', '• BGE - İşletme kurma destek ağı'));

    // ========== SECTION 12: CONCLUSION ==========
    doc.addPage();
    y = 20;
    
    addSection(tE('CONCLUSION ET SUIVI', 'SONUÇ VE TAKİP'), '12');
    
    addSubSection(tE('Synthèse', 'Sentez'));
    addText(tE(
      `Ce bilan de compétences a permis à ${data.userName} d'identifier ses compétences, aptitudes et motivations, et de définir un projet professionnel cohérent avec son profil et les réalités du marché de l'emploi.`,
      `Bu yetkinlik değerlendirmesi, ${data.userName} adlı kişinin yetkinliklerini, yeteneklerini ve motivasyonlarını belirlemesini ve profili ile iş piyasasının gerçekleriyle uyumlu bir mesleki proje tanımlamasını sağlamıştır.`
    ));
    
    addSubSection(tE('Engagements réciproques', 'Karşılıklı taahhütler'));
    addText(tE('Le bénéficiaire s\'engage à :', 'Yararlanıcı şunları taahhüt eder:'));
    addText(tE(
      '• Mettre en œuvre le plan d\'action défini',
      '• Belirlenen eylem planını uygulamak'
    ));
    addText(tE(
      '• Participer à l\'entretien de suivi prévu 6 mois après la fin du bilan',
      '• Değerlendirmenin bitiminden 6 ay sonra planlanan takip görüşmesine katılmak'
    ));
    addText(tE(
      '• Informer le consultant de l\'évolution de sa situation',
      '• Danışmanı durumunun gelişimi hakkında bilgilendirmek'
    ));
    
    y += 5;
    addText(tE('L\'organisme s\'engage à :', 'Kuruluş şunları taahhüt eder:'));
    addText(tE(
      '• Assurer la confidentialité des informations recueillies',
      '• Toplanan bilgilerin gizliliğini sağlamak'
    ));
    addText(tE(
      '• Proposer un entretien de suivi dans les 6 mois',
      '• 6 ay içinde bir takip görüşmesi önermek'
    ));
    addText(tE(
      '• Rester disponible pour toute question ou besoin d\'accompagnement complémentaire',
      '• Her türlü soru veya ek destek ihtiyacı için müsait olmak'
    ));
    
    addSubSection(tE('Entretien de suivi', 'Takip görüşmesi'));
    addText(tE(
      'Un entretien de suivi est prévu 6 mois après la fin du bilan pour :',
      'Değerlendirmenin bitiminden 6 ay sonra aşağıdaki amaçlarla bir takip görüşmesi planlanmıştır:'
    ));
    addText(tE('• Faire le point sur la mise en œuvre du plan d\'action', '• Eylem planının uygulanması hakkında değerlendirme yapmak'));
    addText(tE('• Identifier les éventuelles difficultés rencontrées', '• Karşılaşılan olası zorlukları belirlemek'));
    addText(tE('• Ajuster les objectifs si nécessaire', '• Gerekirse hedefleri ayarlamak'));
    addText(tE('• Apporter un soutien complémentaire si besoin', '• Gerektiğinde ek destek sağlamak'));

    // ========== PAGE SIGNATURES ==========
    doc.addPage();
    y = 30;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229);
    doc.text(tE('SIGNATURES', 'İMZALAR'), pageWidth / 2, y, { align: 'center' });
    y += 20;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    addText(tE(
      'Le présent document de synthèse a été remis au bénéficiaire à l\'issue de la phase de conclusion du bilan de compétences.',
      'Bu sentez belgesi, yetkinlik değerlendirmesinin sonuç aşamasının sonunda yararlanıcıya teslim edilmiştir.'
    ));
    addText(tE(
      'Le bénéficiaire reconnaît avoir reçu ce document et en avoir pris connaissance.',
      'Yararlanıcı bu belgeyi aldığını ve içeriğini incelediğini kabul eder.'
    ));
    addText(tE(
      'Il atteste de l\'exactitude des informations le concernant et de la conformité du bilan aux objectifs définis lors de la phase préliminaire.',
      'Kendisine ait bilgilerin doğruluğunu ve değerlendirmenin ön aşamada belirlenen hedeflere uygunluğunu onaylar.'
    ));

    y += 20;

    // Zone signature consultant
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(margin, y, 80, 55, 'S');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(tE('Le consultant', 'Danışman'), margin + 20, y + 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(data.consultantName, margin + 5, y + 22);
    doc.text(`${tE('Date', 'Tarih')} : ${data.endDate}`, margin + 5, y + 32);
    doc.text(`${tE('Signature', 'İmza')} :`, margin + 5, y + 45);

    // Zone signature bénéficiaire
    doc.rect(pageWidth - margin - 80, y, 80, 55, 'S');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(tE('Le bénéficiaire', 'Yararlanıcı'), pageWidth - margin - 55, y + 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(data.userName, pageWidth - margin - 75, y + 22);
    doc.text(`${tE('Date', 'Tarih')} : ${data.endDate}`, pageWidth - margin - 75, y + 32);
    doc.text(`${tE('Signature', 'İmza')} :`, pageWidth - margin - 75, y + 45);

    y += 75;

    // Mentions légales finales
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    const finalLegal = [
      tE('MENTIONS LÉGALES', 'YASAL BİLDİRİMLER'),
      '',
      tE(
        '• Ce document est strictement confidentiel (article L.6313-10-1 du Code du travail).',
        '• Bu belge kesinlikle gizlidir (İş Kanunu madde L.6313-10-1).'
      ),
      tE(
        '• Il ne peut être communiqué à un tiers qu\'avec l\'accord écrit du bénéficiaire.',
        '• Yararlanıcının yazılı onayı olmadan üçüncü şahıslara iletilemez.'
      ),
      tE(
        '• Le bénéficiaire est seul destinataire des résultats détaillés et du document de synthèse.',
        '• Ayrıntılı sonuçların ve sentez belgesinin tek alıcısı yararlanıcıdır.'
      ),
      tE(
        '• Ce bilan a été réalisé conformément aux articles L.6313-4 et R.6313-4 à R.6313-8 du Code du travail.',
        '• Bu değerlendirme, İş Kanunu\'nun L.6313-4 ve R.6313-4 ile R.6313-8 maddeleri uyarınca gerçekleştirilmiştir.'
      ),
      '',
      tE(
        `Document généré le ${new Date().toLocaleDateString('fr-FR')} par ${data.organizationName}`,
        `Belge ${new Date().toLocaleDateString('tr-TR')} tarihinde ${data.organizationName} tarafından oluşturulmuştur`
      )
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
    doc.text(tE('ANNEXES', 'EKLER'), pageWidth / 2, y, { align: 'center' });
    y += 20;
    
    doc.setTextColor(0, 0, 0);
    
    addSubSection(tE('Annexe 1 : Détail des réponses significatives', 'Ek 1: Önemli yanıtların detayı'));
    
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
      doc.text(`${index + 1}. ${answer.question?.substring(0, 80) || tE('Question', 'Soru')}...`, margin, y);
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
        `${tE('Document de synthèse', 'Sentez belgesi')} - ${data.userName} - ${tE('Page', 'Sayfa')} ${i}/${totalPages}`,
        pageWidth / 2,
        290,
        { align: 'center' }
      );
    }

    _forceLang = null;
    return doc.output('blob');
  }
};

export default syntheseServiceEnriched;

/**
 * Module d'analyse des compétences et profil RIASEC
 */

import { Answer, Summary } from '../../types-ai-studio';
import { 
  CompetenceAnalysis, 
  RIASECProfile, 
  ValueAnalysis,
  RIASEC_KEYWORDS 
} from './types';
import i18n from '../../i18n';

const tA = (fr: string, tr: string): string => (i18n.language || 'fr') === 'tr' ? tr : fr;

/**
 * Extrait le profil RIASEC à partir des réponses du bénéficiaire
 */
export function extractRIASECProfile(answers: Answer[]): RIASECProfile {
  const profile: RIASECProfile = {
    realistic: 0,
    investigative: 0,
    artistic: 0,
    social: 0,
    enterprising: 0,
    conventional: 0,
  };

  answers.forEach((answer) => {
    if (answer.value && typeof answer.value === 'string') {
      const lowerValue = answer.value.toLowerCase();

      Object.entries(RIASEC_KEYWORDS).forEach(([type, words]) => {
        words.forEach((word) => {
          if (lowerValue.includes(word)) {
            profile[type as keyof RIASECProfile] += 1;
          }
        });
      });
    }
  });

  // Normaliser sur 100
  const maxScore = Math.max(...Object.values(profile), 1);
  Object.keys(profile).forEach((key) => {
    profile[key as keyof RIASECProfile] = Math.round(
      (profile[key as keyof RIASECProfile] / maxScore) * 100
    );
  });

  return profile;
}

/**
 * Extrait les compétences détaillées à partir des réponses et de la synthèse
 */
export function extractDetailedCompetences(
  answers: Answer[],
  summary: Summary
): CompetenceAnalysis[] {
  const competences: CompetenceAnalysis[] = [];

  // Catégories de compétences à analyser
  const isTr = (i18n.language || 'fr') === 'tr';
  const categories = isTr ? [
    { name: 'Teknik yetkinlikler', keywords: ['teknik', 'araç', 'yazılım', 'yöntem', 'süreç'] },
    { name: 'İlişkisel yetkinlikler', keywords: ['ekip', 'iletişim', 'ilişki', 'işbirliği', 'dinleme'] },
    { name: 'Organizasyonel yetkinlikler', keywords: ['organizasyon', 'planlama', 'yönetim', 'öncelik', 'zaman'] },
    { name: 'Analitik yetkinlikler', keywords: ['analiz', 'çözüm', 'sorun', 'mantık', 'sentez'] },
    { name: 'Yaratıcı yetkinlikler', keywords: ['yaratıcı', 'inovasyon', 'fikir', 'tasarım', 'dizayn'] },
    { name: 'Yönetsel yetkinlikler', keywords: ['yönetim', 'liderlik', 'karar', 'delegasyon', 'motivasyon'] },
  ] : [
    { name: 'Compétences techniques', keywords: ['technique', 'outil', 'logiciel', 'méthode', 'processus'] },
    { name: 'Compétences relationnelles', keywords: ['équipe', 'communication', 'relation', 'collaboration', 'écoute'] },
    { name: 'Compétences organisationnelles', keywords: ['organisation', 'planification', 'gestion', 'priorité', 'temps'] },
    { name: 'Compétences analytiques', keywords: ['analyse', 'résolution', 'problème', 'logique', 'synthèse'] },
    { name: 'Compétences créatives', keywords: ['créatif', 'innovation', 'idée', 'conception', 'design'] },
    { name: 'Compétences managériales', keywords: ['management', 'leadership', 'décision', 'délégation', 'motivation'] },
  ];

  categories.forEach((category) => {
    let level = 0;
    const examples: string[] = [];
    const developmentSuggestions: string[] = [];

    answers.forEach((answer) => {
      if (answer.value && typeof answer.value === 'string') {
        const lowerValue = answer.value.toLowerCase();
        const matchCount = category.keywords.filter((kw) => lowerValue.includes(kw)).length;

        if (matchCount > 0) {
          level += matchCount;
          // Extraire un exemple (première phrase pertinente)
          const sentences = answer.value.split(/[.!?]+/).filter((s) => s.trim().length > 20);
          if (sentences.length > 0 && examples.length < 2) {
            const relevantSentence = sentences.find((s) =>
              category.keywords.some((kw) => s.toLowerCase().includes(kw))
            );
            if (relevantSentence) {
              examples.push(relevantSentence.trim());
            }
          }
        }
      }
    });

    // Normaliser le niveau sur 5
    level = Math.min(5, Math.max(1, Math.round(level / 2)));

    // Suggestions de développement basées sur le niveau
    if (level < 3) {
      developmentSuggestions.push(tA(`Formation recommandée en ${category.name.toLowerCase()}`, `${category.name.toLowerCase()} alanında eğitim önerilir`));
      developmentSuggestions.push(tA('Recherche de missions permettant de développer ces compétences', 'Bu yetkinlikleri geliştirmeye yönelik görev arayışı'));
    } else if (level < 5) {
      developmentSuggestions.push(tA('Perfectionnement par la pratique et le mentorat', 'Uygulama ve mentorluk yoluyla gelişim'));
      developmentSuggestions.push(tA('Partage d\'expertise avec les collègues', 'Meslektaşlarla uzmanlık paylaşımı'));
    }

    if (level > 0 || examples.length > 0) {
      competences.push({
        category: category.name,
        level,
        examples: examples.length > 0 ? examples : [tA('Compétence identifiée dans le parcours', 'Süreçte belirlenen yetkinlik')],
        developmentSuggestions,
      });
    }
  });

  // Ajouter les compétences de la synthèse si disponibles
  if (summary.competences && summary.competences.length > 0) {
    summary.competences.forEach((comp) => {
      const existing = competences.find(
        (c) => c.category.toLowerCase().includes(comp.toLowerCase().slice(0, 10))
      );
      if (!existing) {
        competences.push({
          category: comp,
          level: 3,
          examples: [tA('Identifié lors de l\'analyse du parcours', 'Süreç analizi sırasında belirlendi')],
          developmentSuggestions: [tA('Continuer à développer cette compétence', 'Bu yetkinliği geliştirmeye devam edin')],
        });
      }
    });
  }

  return competences;
}

/**
 * Extrait les valeurs professionnelles détaillées
 */
export function extractDetailedValues(answers: Answer[]): ValueAnalysis[] {
  const values: ValueAnalysis[] = [];

  const isTr = (i18n.language || 'fr') === 'tr';
  const valueKeywords = isTr ? {
    'Otonomi': ['otonom', 'bağımsız', 'özgürlük', 'tek başına', 'karar vermek'],
    'Güvenlik': ['istikrar', 'güvenlik', 'kalıcı', 'garanti', 'düzenli'],
    'Tanınma': ['tanınmış', 'değer verilen', 'takdir edilen', 'hak', 'ödül'],
    'Yaratıcılık': ['yaratmak', 'inovasyon', 'icat', 'orijinal', 'yeni'],
    'İnsan ilişkileri': ['ekip', 'meslektaş', 'ortam', 'dayanışma', 'samimi'],
    'Başarı': ['başarmak', 'gerçekleştirmek', 'hedef', 'zorluk', 'meydan okuma'],
    'İş-yaşam dengesi': ['denge', 'aile', 'boş zaman', 'esneklik', 'uzaktan çalışma'],
    'Ücret': ['maaş', 'ücret', 'para', 'gelir', 'finansal'],
    'İşin anlamı': ['anlam', 'fayda', 'etki', 'katkı', 'değer'],
    'Gelişim': ['gelişmek', 'ilerlemek', 'kariyer', 'terfi', 'gelişim'],
  } : {
    'Autonomie': ['autonome', 'indépendant', 'liberté', 'seul', 'décider'],
    'Sécurité': ['stable', 'sécurité', 'pérenne', 'garanti', 'régulier'],
    'Reconnaissance': ['reconnu', 'valorisé', 'apprécié', 'mérite', 'récompense'],
    'Créativité': ['créer', 'innover', 'inventer', 'original', 'nouveau'],
    'Relations humaines': ['équipe', 'collègues', 'ambiance', 'entraide', 'convivial'],
    'Accomplissement': ['réussir', 'accomplir', 'objectif', 'défi', 'challenge'],
    'Équilibre vie pro/perso': ['équilibre', 'famille', 'temps libre', 'flexibilité', 'télétravail'],
    'Rémunération': ['salaire', 'rémunération', 'argent', 'revenus', 'financier'],
    'Sens du travail': ['sens', 'utilité', 'impact', 'contribution', 'valeur'],
    'Évolution': ['évoluer', 'progresser', 'carrière', 'promotion', 'développement'],
  };

  const valueCounts: Record<string, { count: number; manifestations: string[] }> = {};

  answers.forEach((answer) => {
    if (answer.value && typeof answer.value === 'string') {
      const lowerValue = answer.value.toLowerCase();

      Object.entries(valueKeywords).forEach(([value, keywords]) => {
        keywords.forEach((keyword: string) => {
          if (lowerValue.includes(keyword)) {
            if (!valueCounts[value]) {
              valueCounts[value] = { count: 0, manifestations: [] };
            }
            valueCounts[value].count += 1;

            // Extraire une manifestation
            const sentences = answer.value.split(/[.!?]+/);
            const relevantSentence = sentences.find((s) =>
              s.toLowerCase().includes(keyword)
            );
            if (
              relevantSentence &&
              valueCounts[value]!.manifestations.length < 1 &&
              relevantSentence.trim().length > 15
            ) {
              valueCounts[value]!.manifestations.push(relevantSentence.trim());
            }
          }
        });
      });
    }
  });

  // Convertir en ValueAnalysis et trier par importance
  const sortedValues = Object.entries(valueCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 8); // Garder les 8 valeurs les plus importantes

  const maxCount = sortedValues.length > 0 ? sortedValues[0]![1].count : 1;

  sortedValues.forEach(([value, data]) => {
    let importance: 'haute' | 'moyenne' | 'basse';
    if (data.count >= maxCount * 0.7) {
      importance = 'haute';
    } else if (data.count >= maxCount * 0.4) {
      importance = 'moyenne';
    } else {
      importance = 'basse';
    }

    values.push({
      value,
      importance,
      manifestation: data.manifestations[0] || tA('Valeur importante dans le parcours professionnel', 'Mesleki süreçte önemli değer'),
    });
  });

  return values;
}

/**
 * Calcule le score de cohérence du projet professionnel
 */
export function calculateProjectCoherence(
  riasecProfile: RIASECProfile,
  competences: CompetenceAnalysis[],
  values: ValueAnalysis[]
): number {
  let score = 50; // Score de base

  // Bonus si profil RIASEC bien défini (écart entre les scores)
  const riasecValues = Object.values(riasecProfile);
  const riasecMax = Math.max(...riasecValues);
  const riasecMin = Math.min(...riasecValues);
  if (riasecMax - riasecMin > 40) {
    score += 15; // Profil différencié
  }

  // Bonus si compétences variées
  const highLevelCompetences = competences.filter((c) => c.level >= 4).length;
  score += Math.min(20, highLevelCompetences * 5);

  // Bonus si valeurs claires
  const highImportanceValues = values.filter((v) => v.importance === 'haute').length;
  score += Math.min(15, highImportanceValues * 5);

  return Math.min(100, score);
}

export default {
  extractRIASECProfile,
  extractDetailedCompetences,
  extractDetailedValues,
  calculateProjectCoherence,
};

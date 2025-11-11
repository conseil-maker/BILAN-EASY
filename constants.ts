import { Package } from './types';

export const PACKAGES: Package[] = [
  {
    id: 'decouverte',
    name: "Parcours Découverte",
    totalHours: 5,
    totalQuestionnaires: 30, // 30 soru (her phase'de 4 kategori × 2-3 soru = 8-12 soru/phase)
    description: "Idéal pour faire un premier point sur vos compétences et aspirations professionnelles.",
    features: [
      "Analyse de vos motivations",
      "Identification de vos compétences clés",
      "Rapport de synthèse initial",
      "30 questions guidées"
    ],
    phases: {
      phase1: { questionnaires: 1, duration_min: 60, name: "Phase d'Investigation" }, // 1 döngü × 4 kategori × 2-3 soru = 8-12 soru
      phase2: { questionnaires: 1, duration_min: 120, name: "Phase d'Analyse" }, // 1 döngü × 4 kategori × 3-4 soru = 12-16 soru
      phase3: { questionnaires: 1, duration_min: 120, name: "Phase de Conclusion" } // 1 döngü × 4 kategori × 2-3 soru = 8-12 soru
    }
  },
  {
    id: 'approfondi',
    name: "Bilan Approfondi",
    totalHours: 12,
    totalQuestionnaires: 72, // 72 soru (her phase'de 2 döngü × 4 kategori × 3-4 soru = 24-32 soru/phase)
    description: "Une exploration complète de votre profil pour définir un projet professionnel solide et réaliste.",
    features: [
      "Tout du Parcours Découverte",
      "Exploration de pistes professionnelles",
      "Analyse du marché du travail",
      "72 questions approfondies",
      "Plan d'action détaillé"
    ],
    phases: {
      phase1: { questionnaires: 2, duration_min: 120, name: "Phase d'Investigation" }, // 2 döngü × 4 kategori × 3 soru = 24 soru
      phase2: { questionnaires: 2, duration_min: 240, name: "Phase d'Analyse" }, // 2 döngü × 4 kategori × 4 soru = 32 soru
      phase3: { questionnaires: 2, duration_min: 360, name: "Phase de Conclusion" } // 2 döngü × 4 kategori × 4 soru = 32 soru
    }
  },
  {
    id: 'strategique',
    name: "Accompagnement Stratégique",
    totalHours: 24,
    totalQuestionnaires: 120, // 120 soru (her phase'de 3 döngü × 4 kategori × 4-5 soru = 48-60 soru/phase)
    description: "Un accompagnement premium pour les professionnels visant une transition de carrière majeure ou un poste à haute responsabilité.",
    features: [
      "Tout du Bilan Approfondi",
      "Coaching personnalisé",
      "Développement du leadership",
      "120 questions stratégiques",
      "Stratégie de personal branding"
    ],
    phases: {
      phase1: { questionnaires: 3, duration_min: 180, name: "Phase d'Investigation" }, // 3 döngü × 4 kategori × 3 soru = 36 soru
      phase2: { questionnaires: 3, duration_min: 480, name: "Phase d'Analyse" }, // 3 döngü × 4 kategori × 4 soru = 48 soru
      phase3: { questionnaires: 3, duration_min: 780, name: "Phase de Conclusion" } // 3 döngü × 4 kategori × 5 soru = 60 soru
    }
  }
];

export const QUESTION_CATEGORIES = {
  phase1: {
    name: "Phase d'Investigation : Connaissance de soi",
    objective: "Explorer les motivations, les intérêts, la personnalité et le parcours de l'utilisateur pour construire une base solide pour la réflexion.",
    categories: ["Motivations", "Intérêts Professionnels", "Personnalité au travail", "Parcours et Réalisations"],
    satisfactionActive: true
  },
  phase2: {
    name: "Phase d'Analyse : Identification des compétences",
    objective: "Identifier et évaluer les compétences techniques (hard skills), comportementales (soft skills) et transférables de l'utilisateur.",
    categories: ["Compétences Techniques", "Compétences Comportementales", "Environnement de travail idéal", "Aspirations d'évolution"],
    satisfactionActive: true
  },
  phase3: {
    name: "Phase de Conclusion : Projection et Plan d'action",
    objective: "Synthétiser les informations, explorer des pistes de projets professionnels concrets et définir un plan d'action pour atteindre les objectifs.",
    categories: ["Projets Professionnels", "Besoins en formation", "Stratégie de recherche", "Plan d'action"],
    satisfactionActive: false
  }
};

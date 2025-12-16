// Base de données des formations professionnelles

export interface Formation {
  id: string;
  titre: string;
  type: 'diplome' | 'certification' | 'titre_pro' | 'mooc' | 'formation_courte';
  niveau: string;
  duree: string;
  modalite: 'presentiel' | 'distanciel' | 'hybride';
  cpf: boolean;
  domaines: string[];
  competences: string[];
  debouches: string[];
  organismes?: string[];
  prix?: string;
}

export const NIVEAUX_FORMATION = [
  { code: '3', libelle: 'CAP, BEP (Niveau 3)' },
  { code: '4', libelle: 'Bac, BP (Niveau 4)' },
  { code: '5', libelle: 'Bac+2, BTS, DUT (Niveau 5)' },
  { code: '6', libelle: 'Bac+3, Licence (Niveau 6)' },
  { code: '7', libelle: 'Bac+5, Master (Niveau 7)' },
  { code: '8', libelle: 'Bac+8, Doctorat (Niveau 8)' }
];

export const FORMATIONS: Formation[] = [
  // Informatique et Digital
  {
    id: 'dev-web-fullstack',
    titre: 'Développeur Web Full Stack',
    type: 'titre_pro',
    niveau: '5',
    duree: '6 mois',
    modalite: 'hybride',
    cpf: true,
    domaines: ['M', 'E'],
    competences: ['JavaScript', 'React', 'Node.js', 'SQL', 'Git'],
    debouches: ['Développeur web', 'Développeur front-end', 'Développeur back-end'],
    organismes: ['OpenClassrooms', 'Le Wagon', 'Wild Code School'],
    prix: '6 000 - 9 000 €'
  },
  {
    id: 'data-analyst',
    titre: 'Data Analyst',
    type: 'titre_pro',
    niveau: '6',
    duree: '6-12 mois',
    modalite: 'hybride',
    cpf: true,
    domaines: ['M'],
    competences: ['Python', 'SQL', 'Data visualization', 'Statistics', 'Machine Learning'],
    debouches: ['Data Analyst', 'Business Analyst', 'Data Scientist junior'],
    organismes: ['DataScientest', 'Jedha', 'OpenClassrooms'],
    prix: '5 000 - 8 000 €'
  },
  {
    id: 'cybersecurity',
    titre: 'Analyste en Cybersécurité',
    type: 'titre_pro',
    niveau: '6',
    duree: '6 mois',
    modalite: 'hybride',
    cpf: true,
    domaines: ['M'],
    competences: ['Sécurité réseau', 'Pentesting', 'SIEM', 'Cryptographie'],
    debouches: ['Analyste SOC', 'Consultant cybersécurité', 'RSSI'],
    organismes: ['Simplon', 'ORSYS', 'M2i Formation'],
    prix: '6 000 - 10 000 €'
  },
  {
    id: 'ux-designer',
    titre: 'UX Designer',
    type: 'certification',
    niveau: '6',
    duree: '3-6 mois',
    modalite: 'hybride',
    cpf: true,
    domaines: ['E', 'M'],
    competences: ['User Research', 'Wireframing', 'Prototypage', 'Design Thinking', 'Figma'],
    debouches: ['UX Designer', 'UI Designer', 'Product Designer'],
    organismes: ['Ironhack', 'Google', 'Coursera'],
    prix: '3 000 - 7 000 €'
  },
  {
    id: 'product-manager',
    titre: 'Product Manager',
    type: 'certification',
    niveau: '7',
    duree: '3-6 mois',
    modalite: 'hybride',
    cpf: true,
    domaines: ['M'],
    competences: ['Product Strategy', 'Agile', 'User Stories', 'Roadmap', 'Analytics'],
    debouches: ['Product Manager', 'Product Owner', 'Chef de projet digital'],
    organismes: ['Thiga Academy', 'Product School', 'OpenClassrooms'],
    prix: '4 000 - 8 000 €'
  },

  // Management et RH
  {
    id: 'manager-equipe',
    titre: 'Manager d\'équipe',
    type: 'titre_pro',
    niveau: '6',
    duree: '6 mois',
    modalite: 'hybride',
    cpf: true,
    domaines: ['M'],
    competences: ['Leadership', 'Communication', 'Gestion de conflits', 'Motivation'],
    debouches: ['Manager', 'Chef d\'équipe', 'Responsable de service'],
    organismes: ['CEGOS', 'DEMOS', 'Comundi'],
    prix: '4 000 - 7 000 €'
  },
  {
    id: 'rh-assistant',
    titre: 'Assistant Ressources Humaines',
    type: 'titre_pro',
    niveau: '5',
    duree: '6 mois',
    modalite: 'presentiel',
    cpf: true,
    domaines: ['M'],
    competences: ['Administration du personnel', 'Paie', 'Recrutement', 'Droit du travail'],
    debouches: ['Assistant RH', 'Gestionnaire paie', 'Chargé de recrutement'],
    organismes: ['AFPA', 'CNAM', 'IGS'],
    prix: '3 500 - 6 000 €'
  },
  {
    id: 'coach-professionnel',
    titre: 'Coach Professionnel',
    type: 'certification',
    niveau: '6',
    duree: '12-18 mois',
    modalite: 'hybride',
    cpf: true,
    domaines: ['K', 'M'],
    competences: ['Coaching', 'Écoute active', 'PNL', 'Accompagnement au changement'],
    debouches: ['Coach professionnel', 'Coach de vie', 'Consultant RH'],
    organismes: ['ICF', 'Linkup Coaching', 'Mozaik'],
    prix: '6 000 - 12 000 €'
  },

  // Commerce et Marketing
  {
    id: 'commercial-btob',
    titre: 'Négociateur Technico-Commercial',
    type: 'titre_pro',
    niveau: '5',
    duree: '6 mois',
    modalite: 'presentiel',
    cpf: true,
    domaines: ['D'],
    competences: ['Prospection', 'Négociation', 'CRM', 'Closing'],
    debouches: ['Commercial B2B', 'Business Developer', 'Key Account Manager'],
    organismes: ['AFPA', 'IFOCOP', 'CNAM'],
    prix: '4 000 - 6 000 €'
  },
  {
    id: 'marketing-digital',
    titre: 'Responsable Marketing Digital',
    type: 'titre_pro',
    niveau: '6',
    duree: '6-12 mois',
    modalite: 'hybride',
    cpf: true,
    domaines: ['E', 'M'],
    competences: ['SEO/SEA', 'Social Media', 'Analytics', 'Content Marketing', 'Email Marketing'],
    debouches: ['Responsable marketing digital', 'Traffic Manager', 'Growth Hacker'],
    organismes: ['Digital Campus', 'ISCOD', 'OpenClassrooms'],
    prix: '5 000 - 8 000 €'
  },
  {
    id: 'community-manager',
    titre: 'Community Manager',
    type: 'certification',
    niveau: '5',
    duree: '3-6 mois',
    modalite: 'distanciel',
    cpf: true,
    domaines: ['E'],
    competences: ['Réseaux sociaux', 'Création de contenu', 'Modération', 'Analytics'],
    debouches: ['Community Manager', 'Social Media Manager', 'Content Manager'],
    organismes: ['OpenClassrooms', 'Studi', 'Digital Campus'],
    prix: '2 500 - 5 000 €'
  },

  // Comptabilité et Finance
  {
    id: 'comptable-assistant',
    titre: 'Comptable Assistant',
    type: 'titre_pro',
    niveau: '4',
    duree: '6 mois',
    modalite: 'presentiel',
    cpf: true,
    domaines: ['M'],
    competences: ['Comptabilité générale', 'TVA', 'Logiciels comptables', 'Déclarations fiscales'],
    debouches: ['Comptable', 'Assistant comptable', 'Aide-comptable'],
    organismes: ['AFPA', 'CNAM', 'IFOCOP'],
    prix: '3 000 - 5 000 €'
  },
  {
    id: 'gestionnaire-paie',
    titre: 'Gestionnaire de Paie',
    type: 'titre_pro',
    niveau: '5',
    duree: '6 mois',
    modalite: 'presentiel',
    cpf: true,
    domaines: ['M'],
    competences: ['Paie', 'Droit social', 'Logiciels de paie', 'DSN'],
    debouches: ['Gestionnaire de paie', 'Technicien paie', 'Responsable paie'],
    organismes: ['AFPA', 'CNAM', 'Studi'],
    prix: '3 500 - 6 000 €'
  },
  {
    id: 'controleur-gestion',
    titre: 'Contrôleur de Gestion',
    type: 'diplome',
    niveau: '7',
    duree: '2 ans',
    modalite: 'presentiel',
    cpf: true,
    domaines: ['M'],
    competences: ['Contrôle de gestion', 'Budget', 'Reporting', 'Excel avancé', 'ERP'],
    debouches: ['Contrôleur de gestion', 'Analyste financier', 'DAF'],
    organismes: ['IAE', 'Écoles de commerce', 'CNAM'],
    prix: '8 000 - 15 000 €'
  },

  // Santé et Social
  {
    id: 'aide-soignant',
    titre: 'Diplôme d\'État d\'Aide-Soignant (DEAS)',
    type: 'diplome',
    niveau: '4',
    duree: '10 mois',
    modalite: 'presentiel',
    cpf: true,
    domaines: ['J'],
    competences: ['Soins d\'hygiène', 'Accompagnement', 'Observation', 'Communication'],
    debouches: ['Aide-soignant', 'Auxiliaire de vie'],
    organismes: ['IFAS', 'Croix-Rouge', 'Hôpitaux'],
    prix: 'Gratuit (financement région)'
  },
  {
    id: 'accompagnant-educatif',
    titre: 'Accompagnant Éducatif et Social (AES)',
    type: 'diplome',
    niveau: '3',
    duree: '12-18 mois',
    modalite: 'presentiel',
    cpf: true,
    domaines: ['K'],
    competences: ['Accompagnement', 'Aide à la personne', 'Animation', 'Écoute'],
    debouches: ['AES', 'Auxiliaire de vie', 'Accompagnant handicap'],
    organismes: ['IRTS', 'Croix-Rouge', 'AFPA'],
    prix: 'Gratuit (financement région)'
  },

  // Langues
  {
    id: 'anglais-professionnel',
    titre: 'Anglais Professionnel - TOEIC',
    type: 'certification',
    niveau: '5',
    duree: '3-6 mois',
    modalite: 'hybride',
    cpf: true,
    domaines: ['M', 'D', 'E'],
    competences: ['Anglais écrit', 'Anglais oral', 'Business English', 'Négociation'],
    debouches: ['Tous secteurs internationaux'],
    organismes: ['Wall Street English', 'EF', 'Berlitz'],
    prix: '2 000 - 5 000 €'
  },

  // Gestion de projet
  {
    id: 'chef-projet',
    titre: 'Chef de Projet',
    type: 'certification',
    niveau: '6',
    duree: '3-6 mois',
    modalite: 'hybride',
    cpf: true,
    domaines: ['M'],
    competences: ['Gestion de projet', 'Agile', 'MS Project', 'Budget', 'Risques'],
    debouches: ['Chef de projet', 'PMO', 'Scrum Master'],
    organismes: ['CEGOS', 'PMI', 'OpenClassrooms'],
    prix: '3 000 - 6 000 €'
  },
  {
    id: 'pmp-certification',
    titre: 'PMP (Project Management Professional)',
    type: 'certification',
    niveau: '7',
    duree: '35h minimum',
    modalite: 'hybride',
    cpf: true,
    domaines: ['M'],
    competences: ['PMBOK', 'Gestion de projet avancée', 'Leadership', 'Stakeholders'],
    debouches: ['Chef de projet senior', 'Directeur de projet', 'PMO'],
    organismes: ['PMI', 'CEGOS', 'Capgemini'],
    prix: '3 000 - 5 000 €'
  }
];

// Fonction de recherche de formations
export const searchFormations = (query: string): Formation[] => {
  const lowerQuery = query.toLowerCase();
  return FORMATIONS.filter(formation => 
    formation.titre.toLowerCase().includes(lowerQuery) ||
    formation.competences.some(c => c.toLowerCase().includes(lowerQuery)) ||
    formation.debouches.some(d => d.toLowerCase().includes(lowerQuery))
  );
};

// Fonction pour obtenir les formations par domaine
export const getFormationsByDomaine = (domaineCode: string): Formation[] => {
  return FORMATIONS.filter(formation => formation.domaines.includes(domaineCode));
};

// Fonction pour obtenir les formations CPF
export const getFormationsCPF = (): Formation[] => {
  return FORMATIONS.filter(formation => formation.cpf);
};

// Fonction pour suggérer des formations basées sur les compétences à développer
export const suggestFormationsByCompetences = (competences: string[]): Formation[] => {
  const lowerCompetences = competences.map(c => c.toLowerCase());
  
  return FORMATIONS
    .map(formation => {
      const matchCount = formation.competences.filter(c => 
        lowerCompetences.some(lc => c.toLowerCase().includes(lc) || lc.includes(c.toLowerCase()))
      ).length;
      return { formation, matchCount };
    })
    .filter(item => item.matchCount > 0)
    .sort((a, b) => b.matchCount - a.matchCount)
    .map(item => item.formation);
};

// Fonction pour obtenir les formations par niveau
export const getFormationsByNiveau = (niveau: string): Formation[] => {
  return FORMATIONS.filter(formation => formation.niveau === niveau);
};

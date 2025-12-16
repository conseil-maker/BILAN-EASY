// Base de données des métiers ROME (Répertoire Opérationnel des Métiers et des Emplois)
// Source: Pôle Emploi / France Travail

export interface RomeMetier {
  code: string;
  libelle: string;
  domaine: string;
  famille: string;
  competences: string[];
  formations: string[];
  salaireMoyen?: string;
  perspectives?: string;
}

export const DOMAINES_ROME = [
  { code: 'A', libelle: 'Agriculture et Pêche, Espaces naturels et Espaces verts, Soins aux animaux' },
  { code: 'B', libelle: 'Arts et Façonnage d\'ouvrages d\'art' },
  { code: 'C', libelle: 'Banque, Assurance, Immobilier' },
  { code: 'D', libelle: 'Commerce, Vente et Grande distribution' },
  { code: 'E', libelle: 'Communication, Média et Multimédia' },
  { code: 'F', libelle: 'Construction, Bâtiment et Travaux publics' },
  { code: 'G', libelle: 'Hôtellerie-Restauration, Tourisme, Loisirs et Animation' },
  { code: 'H', libelle: 'Industrie' },
  { code: 'I', libelle: 'Installation et Maintenance' },
  { code: 'J', libelle: 'Santé' },
  { code: 'K', libelle: 'Services à la personne et à la collectivité' },
  { code: 'L', libelle: 'Spectacle' },
  { code: 'M', libelle: 'Support à l\'entreprise' },
  { code: 'N', libelle: 'Transport et Logistique' }
];

export const METIERS_ROME: RomeMetier[] = [
  // M - Support à l'entreprise
  {
    code: 'M1801',
    libelle: 'Administration des systèmes d\'information',
    domaine: 'M',
    famille: 'Systèmes d\'information et de télécommunication',
    competences: ['Administration système', 'Sécurité informatique', 'Virtualisation', 'Cloud computing'],
    formations: ['BTS SIO', 'Licence pro informatique', 'Master informatique'],
    salaireMoyen: '35 000 - 55 000 €',
    perspectives: 'Très bonnes'
  },
  {
    code: 'M1802',
    libelle: 'Expertise et support en systèmes d\'information',
    domaine: 'M',
    famille: 'Systèmes d\'information et de télécommunication',
    competences: ['Support technique', 'Diagnostic', 'Formation utilisateurs', 'Documentation'],
    formations: ['BTS SIO', 'DUT Informatique', 'Licence pro'],
    salaireMoyen: '28 000 - 45 000 €',
    perspectives: 'Bonnes'
  },
  {
    code: 'M1803',
    libelle: 'Direction des systèmes d\'information',
    domaine: 'M',
    famille: 'Systèmes d\'information et de télécommunication',
    competences: ['Management', 'Stratégie SI', 'Gestion de projet', 'Budget'],
    formations: ['Master informatique', 'École d\'ingénieur', 'MBA'],
    salaireMoyen: '60 000 - 120 000 €',
    perspectives: 'Excellentes'
  },
  {
    code: 'M1805',
    libelle: 'Études et développement informatique',
    domaine: 'M',
    famille: 'Systèmes d\'information et de télécommunication',
    competences: ['Développement logiciel', 'Analyse', 'Tests', 'Méthodologies agiles'],
    formations: ['BTS SIO', 'DUT Informatique', 'École d\'ingénieur', 'Master'],
    salaireMoyen: '35 000 - 60 000 €',
    perspectives: 'Excellentes'
  },
  {
    code: 'M1806',
    libelle: 'Conseil et maîtrise d\'ouvrage en systèmes d\'information',
    domaine: 'M',
    famille: 'Systèmes d\'information et de télécommunication',
    competences: ['Analyse des besoins', 'Rédaction cahier des charges', 'Conduite du changement'],
    formations: ['Master informatique', 'École de commerce', 'Double cursus'],
    salaireMoyen: '40 000 - 70 000 €',
    perspectives: 'Très bonnes'
  },
  {
    code: 'M1810',
    libelle: 'Production et exploitation de systèmes d\'information',
    domaine: 'M',
    famille: 'Systèmes d\'information et de télécommunication',
    competences: ['Exploitation', 'Supervision', 'Ordonnancement', 'Incidents'],
    formations: ['BTS SIO', 'Licence pro', 'Certifications'],
    salaireMoyen: '30 000 - 45 000 €',
    perspectives: 'Stables'
  },
  {
    code: 'M1402',
    libelle: 'Conseil en organisation et management d\'entreprise',
    domaine: 'M',
    famille: 'Ressources humaines',
    competences: ['Diagnostic organisationnel', 'Conduite du changement', 'Stratégie', 'Communication'],
    formations: ['École de commerce', 'Master management', 'MBA'],
    salaireMoyen: '45 000 - 90 000 €',
    perspectives: 'Très bonnes'
  },
  {
    code: 'M1502',
    libelle: 'Développement des ressources humaines',
    domaine: 'M',
    famille: 'Ressources humaines',
    competences: ['Recrutement', 'Formation', 'GPEC', 'Gestion des talents'],
    formations: ['Master RH', 'École de commerce', 'Licence pro RH'],
    salaireMoyen: '35 000 - 55 000 €',
    perspectives: 'Bonnes'
  },
  {
    code: 'M1503',
    libelle: 'Management des ressources humaines',
    domaine: 'M',
    famille: 'Ressources humaines',
    competences: ['Droit du travail', 'Relations sociales', 'Stratégie RH', 'Management'],
    formations: ['Master RH', 'MBA', 'École de commerce'],
    salaireMoyen: '50 000 - 100 000 €',
    perspectives: 'Très bonnes'
  },
  {
    code: 'M1202',
    libelle: 'Audit et contrôle comptables et financiers',
    domaine: 'M',
    famille: 'Comptabilité et gestion',
    competences: ['Audit', 'Contrôle interne', 'Normes comptables', 'Analyse financière'],
    formations: ['DSCG', 'Master CCA', 'École de commerce'],
    salaireMoyen: '40 000 - 80 000 €',
    perspectives: 'Très bonnes'
  },
  {
    code: 'M1203',
    libelle: 'Comptabilité',
    domaine: 'M',
    famille: 'Comptabilité et gestion',
    competences: ['Comptabilité générale', 'Fiscalité', 'Paie', 'Logiciels comptables'],
    formations: ['BTS Comptabilité', 'DCG', 'Licence pro'],
    salaireMoyen: '28 000 - 45 000 €',
    perspectives: 'Stables'
  },
  {
    code: 'M1205',
    libelle: 'Direction administrative et financière',
    domaine: 'M',
    famille: 'Comptabilité et gestion',
    competences: ['Gestion financière', 'Reporting', 'Stratégie', 'Management'],
    formations: ['DSCG', 'Master finance', 'École de commerce'],
    salaireMoyen: '60 000 - 150 000 €',
    perspectives: 'Excellentes'
  },
  {
    code: 'M1705',
    libelle: 'Marketing',
    domaine: 'M',
    famille: 'Marketing',
    competences: ['Stratégie marketing', 'Études de marché', 'Marketing digital', 'Communication'],
    formations: ['Master marketing', 'École de commerce', 'Licence pro'],
    salaireMoyen: '35 000 - 60 000 €',
    perspectives: 'Bonnes'
  },
  {
    code: 'M1707',
    libelle: 'Stratégie commerciale',
    domaine: 'M',
    famille: 'Marketing',
    competences: ['Développement commercial', 'Négociation', 'Management', 'Stratégie'],
    formations: ['École de commerce', 'Master commerce', 'MBA'],
    salaireMoyen: '45 000 - 90 000 €',
    perspectives: 'Très bonnes'
  },

  // D - Commerce
  {
    code: 'D1401',
    libelle: 'Assistanat commercial',
    domaine: 'D',
    famille: 'Commerce',
    competences: ['Administration des ventes', 'Relation client', 'Outils bureautiques', 'Organisation'],
    formations: ['BTS Commerce', 'BTS Assistant manager', 'Licence pro'],
    salaireMoyen: '24 000 - 35 000 €',
    perspectives: 'Stables'
  },
  {
    code: 'D1402',
    libelle: 'Relation commerciale grands comptes et entreprises',
    domaine: 'D',
    famille: 'Commerce',
    competences: ['Négociation', 'Gestion de portefeuille', 'Prospection', 'Fidélisation'],
    formations: ['École de commerce', 'Master commerce', 'BTS NRC'],
    salaireMoyen: '40 000 - 80 000 €',
    perspectives: 'Bonnes'
  },
  {
    code: 'D1406',
    libelle: 'Management en force de vente',
    domaine: 'D',
    famille: 'Commerce',
    competences: ['Management', 'Animation d\'équipe', 'Pilotage commercial', 'Reporting'],
    formations: ['École de commerce', 'Master management', 'BTS + expérience'],
    salaireMoyen: '45 000 - 75 000 €',
    perspectives: 'Bonnes'
  },
  {
    code: 'D1501',
    libelle: 'Animation de vente',
    domaine: 'D',
    famille: 'Grande distribution',
    competences: ['Techniques de vente', 'Animation', 'Merchandising', 'Communication'],
    formations: ['Bac pro commerce', 'BTS MUC', 'Formation interne'],
    salaireMoyen: '22 000 - 30 000 €',
    perspectives: 'Stables'
  },

  // E - Communication
  {
    code: 'E1101',
    libelle: 'Animation de site multimédia',
    domaine: 'E',
    famille: 'Communication',
    competences: ['Community management', 'Rédaction web', 'SEO', 'Réseaux sociaux'],
    formations: ['Licence communication', 'Master digital', 'École de communication'],
    salaireMoyen: '28 000 - 45 000 €',
    perspectives: 'Très bonnes'
  },
  {
    code: 'E1103',
    libelle: 'Communication',
    domaine: 'E',
    famille: 'Communication',
    competences: ['Stratégie de communication', 'Relations presse', 'Événementiel', 'Rédaction'],
    formations: ['Master communication', 'École de communication', 'IEP'],
    salaireMoyen: '32 000 - 55 000 €',
    perspectives: 'Bonnes'
  },
  {
    code: 'E1104',
    libelle: 'Conception de contenus multimédias',
    domaine: 'E',
    famille: 'Multimédia',
    competences: ['Création graphique', 'Vidéo', 'Motion design', 'UX/UI'],
    formations: ['École de design', 'BTS Design graphique', 'Master création numérique'],
    salaireMoyen: '30 000 - 50 000 €',
    perspectives: 'Très bonnes'
  },

  // K - Services à la personne
  {
    code: 'K1801',
    libelle: 'Conseil en emploi et insertion socioprofessionnelle',
    domaine: 'K',
    famille: 'Emploi et formation',
    competences: ['Accompagnement', 'Orientation', 'Connaissance du marché', 'Écoute'],
    formations: ['Licence pro insertion', 'Master psychologie du travail', 'Titre CIP'],
    salaireMoyen: '28 000 - 40 000 €',
    perspectives: 'Bonnes'
  },
  {
    code: 'K2101',
    libelle: 'Conseil en formation',
    domaine: 'K',
    famille: 'Formation',
    competences: ['Ingénierie de formation', 'Analyse des besoins', 'Pédagogie', 'Évaluation'],
    formations: ['Master sciences de l\'éducation', 'Master RH', 'Titre professionnel'],
    salaireMoyen: '32 000 - 50 000 €',
    perspectives: 'Bonnes'
  },
  {
    code: 'K2111',
    libelle: 'Formation professionnelle',
    domaine: 'K',
    famille: 'Formation',
    competences: ['Animation de formation', 'Pédagogie', 'Expertise métier', 'Évaluation'],
    formations: ['Master + expérience', 'Titre formateur', 'Certification'],
    salaireMoyen: '30 000 - 50 000 €',
    perspectives: 'Bonnes'
  },

  // J - Santé
  {
    code: 'J1501',
    libelle: 'Soins d\'hygiène, de confort du patient',
    domaine: 'J',
    famille: 'Soins',
    competences: ['Soins de base', 'Hygiène', 'Accompagnement', 'Observation'],
    formations: ['DEAS', 'Formation aide-soignant'],
    salaireMoyen: '22 000 - 28 000 €',
    perspectives: 'Excellentes'
  },
  {
    code: 'J1502',
    libelle: 'Coordination de services médicaux ou paramédicaux',
    domaine: 'J',
    famille: 'Soins',
    competences: ['Management', 'Organisation', 'Qualité', 'Gestion d\'équipe'],
    formations: ['Master management santé', 'Cadre de santé', 'EHESP'],
    salaireMoyen: '40 000 - 60 000 €',
    perspectives: 'Très bonnes'
  },

  // H - Industrie
  {
    code: 'H1206',
    libelle: 'Management et ingénierie études, recherche et développement industriel',
    domaine: 'H',
    famille: 'Études et R&D',
    competences: ['R&D', 'Innovation', 'Gestion de projet', 'Management'],
    formations: ['École d\'ingénieur', 'Doctorat', 'Master'],
    salaireMoyen: '45 000 - 80 000 €',
    perspectives: 'Excellentes'
  },
  {
    code: 'H1401',
    libelle: 'Management et ingénierie gestion industrielle et logistique',
    domaine: 'H',
    famille: 'Production',
    competences: ['Lean management', 'Supply chain', 'Amélioration continue', 'ERP'],
    formations: ['École d\'ingénieur', 'Master logistique', 'Master management'],
    salaireMoyen: '40 000 - 70 000 €',
    perspectives: 'Très bonnes'
  },
  {
    code: 'H1502',
    libelle: 'Management et ingénierie qualité industrielle',
    domaine: 'H',
    famille: 'Qualité',
    competences: ['Normes qualité', 'Audit', 'Amélioration continue', 'Certification'],
    formations: ['École d\'ingénieur', 'Master qualité', 'Licence pro'],
    salaireMoyen: '35 000 - 60 000 €',
    perspectives: 'Bonnes'
  },

  // C - Banque, Assurance
  {
    code: 'C1102',
    libelle: 'Conseil clientèle en assurances',
    domaine: 'C',
    famille: 'Assurance',
    competences: ['Conseil', 'Vente', 'Produits d\'assurance', 'Relation client'],
    formations: ['BTS Assurance', 'Licence pro', 'Master'],
    salaireMoyen: '28 000 - 45 000 €',
    perspectives: 'Stables'
  },
  {
    code: 'C1201',
    libelle: 'Accueil et services bancaires',
    domaine: 'C',
    famille: 'Banque',
    competences: ['Accueil', 'Opérations bancaires', 'Conseil', 'Vente'],
    formations: ['BTS Banque', 'Licence pro banque', 'Formation interne'],
    salaireMoyen: '25 000 - 35 000 €',
    perspectives: 'En baisse'
  },
  {
    code: 'C1206',
    libelle: 'Gestion de clientèle bancaire',
    domaine: 'C',
    famille: 'Banque',
    competences: ['Gestion de portefeuille', 'Conseil patrimonial', 'Crédit', 'Épargne'],
    formations: ['Master banque-finance', 'École de commerce', 'ITB'],
    salaireMoyen: '35 000 - 60 000 €',
    perspectives: 'Bonnes'
  },

  // N - Transport et Logistique
  {
    code: 'N1301',
    libelle: 'Conception et organisation de la chaîne logistique',
    domaine: 'N',
    famille: 'Logistique',
    competences: ['Supply chain', 'Optimisation', 'SI logistique', 'Management'],
    formations: ['Master logistique', 'École d\'ingénieur', 'École de commerce'],
    salaireMoyen: '40 000 - 70 000 €',
    perspectives: 'Excellentes'
  },
  {
    code: 'N1302',
    libelle: 'Direction de site logistique',
    domaine: 'N',
    famille: 'Logistique',
    competences: ['Management', 'Gestion de site', 'Budget', 'Qualité'],
    formations: ['Master logistique', 'École de commerce', 'Expérience terrain'],
    salaireMoyen: '50 000 - 90 000 €',
    perspectives: 'Très bonnes'
  }
];

// Fonction de recherche de métiers
export const searchMetiers = (query: string): RomeMetier[] => {
  const lowerQuery = query.toLowerCase();
  return METIERS_ROME.filter(metier => 
    metier.libelle.toLowerCase().includes(lowerQuery) ||
    metier.competences.some(c => c.toLowerCase().includes(lowerQuery)) ||
    metier.code.toLowerCase().includes(lowerQuery)
  );
};

// Fonction pour obtenir les métiers par domaine
export const getMetiersByDomaine = (domaineCode: string): RomeMetier[] => {
  return METIERS_ROME.filter(metier => metier.domaine === domaineCode);
};

// Fonction pour suggérer des métiers basés sur les compétences
export const suggestMetiersByCompetences = (competences: string[]): RomeMetier[] => {
  const lowerCompetences = competences.map(c => c.toLowerCase());
  
  return METIERS_ROME
    .map(metier => {
      const matchCount = metier.competences.filter(c => 
        lowerCompetences.some(lc => c.toLowerCase().includes(lc) || lc.includes(c.toLowerCase()))
      ).length;
      return { metier, matchCount };
    })
    .filter(item => item.matchCount > 0)
    .sort((a, b) => b.matchCount - a.matchCount)
    .map(item => item.metier);
};

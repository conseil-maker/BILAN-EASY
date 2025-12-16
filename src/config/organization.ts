/**
 * Configuration de l'organisme de formation
 * 
 * NETZ INFORMATIQUE - Organisme certifié Qualiopi
 * Certificat N° FP 2022/0076-4
 * Validité : 10/02/2025 - 09/02/2028
 * Catégories : Actions de Formation, Bilans de compétences
 * Organisme certificateur : QUALIBAT
 */

export interface OrganizationConfig {
  // Informations légales
  name: string;
  legalName: string;
  siret: string;
  siren: string;
  nda: string; // Numéro de déclaration d'activité
  qualiopi: string; // Numéro de certification Qualiopi
  qualiopiValidFrom: string;
  qualiopiValidTo: string;
  qualiopiCategories: string[];
  certificationBody: string;
  
  // Coordonnées
  address: {
    street: string;
    postalCode: string;
    city: string;
    country: string;
    full: string;
  };
  phone: string;
  email: string;
  website: string;
  
  // Contact RGPD
  dpo: {
    name: string;
    email: string;
  };
  
  // Informations bancaires (pour les CGV)
  bank?: {
    name: string;
    iban: string;
    bic: string;
  };
  
  // Consultant par défaut
  defaultConsultant: {
    name: string;
    email: string;
    title: string;
    phone: string;
  };
  
  // Tarifs
  pricing: {
    test: number;
    essentiel: number;
    approfondi: number;
    strategique: number;
  };
}

/**
 * Configuration NETZ INFORMATIQUE
 */
export const organizationConfig: OrganizationConfig = {
  // Informations légales officielles (certificat Qualiopi)
  name: 'NETZ INFORMATIQUE',
  legalName: 'NETZ INFORMATIQUE',
  siret: '818 347 346 00029', // SIREN + NIC (NIC à vérifier)
  siren: '818347346',
  nda: '446706715 67', // Numéro de Déclaration d'Activité
  qualiopi: 'FP 2022/0076-4',
  qualiopiValidFrom: '10/02/2025',
  qualiopiValidTo: '09/02/2028',
  qualiopiCategories: ['Actions de Formation', 'Bilans de compétences'],
  certificationBody: 'QUALIBAT',
  
  // Coordonnées officielles
  address: {
    street: '1A, route de Schweighouse',
    postalCode: '67500',
    city: 'HAGUENAU',
    country: 'France',
    full: '1A, route de Schweighouse - 67500 HAGUENAU',
  },
  phone: '+33 3 XX XX XX XX', // À compléter
  email: 'contact@netz-informatique.fr', // À compléter
  website: 'https://bilan-easy.vercel.app',
  
  // Contact RGPD
  dpo: {
    name: 'Délégué à la Protection des Données',
    email: 'rgpd@netz-informatique.fr', // À compléter
  },
  
  // Informations bancaires (à compléter)
  bank: {
    name: 'À préciser',
    iban: 'FR76 XXXX XXXX XXXX XXXX XXXX XXX',
    bic: 'XXXXXXXX',
  },
  
  // Consultant par défaut
  defaultConsultant: {
    name: 'Consultant NETZ INFORMATIQUE', // À personnaliser
    email: 'consultant@netz-informatique.fr', // À compléter
    title: 'Consultant en Bilan de Compétences',
    phone: '+33 3 XX XX XX XX', // À compléter
  },
  
  // Tarifs TTC
  pricing: {
    test: 0, // Forfait découverte gratuit
    essentiel: 1200,
    approfondi: 1800,
    strategique: 2400,
  },
};

/**
 * Obtenir l'adresse complète formatée
 */
export const getFullAddress = (): string => {
  return organizationConfig.address.full;
};

/**
 * Obtenir les informations légales formatées
 */
export const getLegalInfo = (): string => {
  return `${organizationConfig.legalName} - SIRET: ${organizationConfig.siret} - NDA: ${organizationConfig.nda}`;
};

/**
 * Obtenir les informations Qualiopi formatées
 */
export const getQualiopiInfo = (): string => {
  return `Certifié Qualiopi N° ${organizationConfig.qualiopi} - Valide du ${organizationConfig.qualiopiValidFrom} au ${organizationConfig.qualiopiValidTo}`;
};

/**
 * Obtenir le prix d'un forfait
 */
export const getPackagePrice = (packageName: string): number => {
  const name = packageName.toLowerCase();
  if (name.includes('test')) return organizationConfig.pricing.test;
  if (name.includes('essentiel')) return organizationConfig.pricing.essentiel;
  if (name.includes('approfondi')) return organizationConfig.pricing.approfondi;
  if (name.includes('stratégique') || name.includes('strategique')) return organizationConfig.pricing.strategique;
  return organizationConfig.pricing.essentiel; // Par défaut
};

/**
 * Obtenir la durée d'un forfait en heures
 */
export const getPackageDuration = (packageName: string): number => {
  const name = packageName.toLowerCase();
  if (name.includes('test')) return 2;
  if (name.includes('essentiel')) return 12;
  if (name.includes('approfondi')) return 18;
  if (name.includes('stratégique') || name.includes('strategique')) return 24;
  return 12; // Par défaut
};

export default organizationConfig;

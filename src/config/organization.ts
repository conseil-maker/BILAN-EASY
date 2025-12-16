/**
 * Configuration de l'organisme de formation
 * 
 * Ces informations sont utilisées dans les documents officiels
 * (Convention, Attestation, Synthèse) et les pages légales.
 * 
 * À personnaliser avec les vraies informations de votre organisme.
 */

export interface OrganizationConfig {
  // Informations légales
  name: string;
  legalName: string;
  siret: string;
  nda: string; // Numéro de déclaration d'activité
  qualiopi: string; // Numéro de certification Qualiopi
  
  // Coordonnées
  address: {
    street: string;
    postalCode: string;
    city: string;
    country: string;
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
 * Configuration par défaut - À PERSONNALISER
 */
export const organizationConfig: OrganizationConfig = {
  // Informations légales
  name: 'Bilan-Easy',
  legalName: 'Bilan-Easy SAS', // À personnaliser
  siret: '123 456 789 00012', // À personnaliser
  nda: '11 75 12345 75', // Numéro de déclaration d'activité - À personnaliser
  qualiopi: 'FR-2024-XXXXX', // Numéro Qualiopi - À personnaliser
  
  // Coordonnées
  address: {
    street: '123 Avenue de l\'Innovation', // À personnaliser
    postalCode: '75001', // À personnaliser
    city: 'Paris', // À personnaliser
    country: 'France',
  },
  phone: '+33 1 23 45 67 89', // À personnaliser
  email: 'contact@bilan-easy.fr',
  website: 'https://bilan-easy.vercel.app',
  
  // Contact RGPD
  dpo: {
    name: 'Délégué à la Protection des Données', // À personnaliser
    email: 'rgpd@bilan-easy.fr',
  },
  
  // Informations bancaires (optionnel)
  bank: {
    name: 'Banque Exemple', // À personnaliser
    iban: 'FR76 XXXX XXXX XXXX XXXX XXXX XXX', // À personnaliser
    bic: 'BNPAFRPP', // À personnaliser
  },
  
  // Consultant par défaut
  defaultConsultant: {
    name: 'Consultant Bilan-Easy', // À personnaliser
    email: 'consultant@bilan-easy.fr',
    title: 'Consultant en Bilan de Compétences',
  },
  
  // Tarifs TTC
  pricing: {
    test: 200,
    essentiel: 1200,
    approfondi: 1800,
    strategique: 2400,
  },
};

/**
 * Obtenir l'adresse complète formatée
 */
export const getFullAddress = (): string => {
  const { street, postalCode, city, country } = organizationConfig.address;
  return `${street}, ${postalCode} ${city}, ${country}`;
};

/**
 * Obtenir les informations légales formatées
 */
export const getLegalInfo = (): string => {
  return `${organizationConfig.legalName} - SIRET: ${organizationConfig.siret} - NDA: ${organizationConfig.nda}`;
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

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
  nda: string;
  qualiopi: string;
  qualiopiValidFrom: string;
  qualiopiValidTo: string;
  qualiopiCategories: string[];
  certificationBody: string;
  codeNaf: string;
  urssaf: string;
  
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
  
  // Informations bancaires
  bank: {
    name: string;
    iban: string;
    bic: string;
    domiciliation: string;
  };
  
  // Équipe / Consultants
  team: {
    president: {
      name: string;
      title: string;
    };
    consultants: Array<{
      name: string;
      title: string;
      email: string;
    }>;
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
 * Configuration NETZ INFORMATIQUE - Données officielles
 */
export const organizationConfig: OrganizationConfig = {
  // Informations légales officielles
  name: 'NETZ INFORMATIQUE',
  legalName: 'NETZ INFORMATIQUE',
  siret: '818 347 346 00020',
  siren: '818347346',
  nda: '446706715 67',
  qualiopi: 'FP 2022/0076-4',
  qualiopiValidFrom: '10/02/2025',
  qualiopiValidTo: '09/02/2028',
  qualiopiCategories: ['Actions de Formation', 'Bilans de compétences'],
  certificationBody: 'QUALIBAT',
  codeNaf: '8559B',
  urssaf: '427 320834682',
  
  // Coordonnées officielles
  address: {
    street: '1A, route de Schweighouse',
    postalCode: '67500',
    city: 'HAGUENAU',
    country: 'France',
    full: '1A, route de Schweighouse - 67500 HAGUENAU',
  },
  phone: '03 67 31 02 01',
  email: 'contact@netzinformatique.fr',
  website: 'https://bilan-easy.vercel.app',
  
  // Contact RGPD
  dpo: {
    name: 'Mikail LEKESIZ',
    email: 'contact@netzinformatique.fr',
  },
  
  // Informations bancaires (RIB CIC)
  bank: {
    name: 'CIC',
    iban: 'FR76 3008 7330 4000 0215 9600 155',
    bic: 'CMCIFRPP',
    domiciliation: 'CIC HAGUENAU - 12 Place d\'Armes - 67500 HAGUENAU',
  },
  
  // Équipe
  team: {
    president: {
      name: 'Mikail LEKESIZ',
      title: 'Président',
    },
    consultants: [
      {
        name: 'Mikail LEKESIZ',
        title: 'Président - Consultant en Bilan de Compétences',
        email: 'contact@netzinformatique.fr',
      },
      {
        name: 'Bahtisen AKINET',
        title: 'Assistante Administrative et Formatrice',
        email: 'contact@netzinformatique.fr',
      },
    ],
  },
  
  // Consultant par défaut pour les documents
  defaultConsultant: {
    name: 'Mikail LEKESIZ',
    email: 'contact@netzinformatique.fr',
    title: 'Consultant en Bilan de Compétences',
    phone: '03 67 31 02 01',
  },
  
  // Tarifs TTC
  pricing: {
    test: 0,
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
  return organizationConfig.pricing.essentiel;
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
  return 12;
};

/**
 * Obtenir les informations bancaires formatées pour les CGV
 */
export const getBankInfo = (): string => {
  const { bank } = organizationConfig;
  return `${bank.name} - IBAN: ${bank.iban} - BIC: ${bank.bic}`;
};

export default organizationConfig;

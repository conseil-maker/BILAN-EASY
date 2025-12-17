/**
 * Tests de la configuration organization
 */

import { describe, it, expect } from 'vitest';
import {
  organizationConfig,
  getFullAddress,
  getLegalInfo,
  getQualiopiInfo,
  getPackagePrice,
  getPackageDuration,
  getBankInfo,
} from './organization';

describe('organization config', () => {
  describe('organizationConfig', () => {
    it('devrait contenir le nom de l\'organisme', () => {
      expect(organizationConfig.name).toBe('NETZ INFORMATIQUE');
    });

    it('devrait contenir le SIRET', () => {
      expect(organizationConfig.siret).toBe('818 347 346 00020');
    });

    it('devrait contenir le numéro Qualiopi', () => {
      expect(organizationConfig.qualiopi).toBe('FP 2022/0076-4');
    });

    it('devrait contenir l\'adresse complète', () => {
      expect(organizationConfig.address.city).toBe('HAGUENAU');
      expect(organizationConfig.address.postalCode).toBe('67500');
    });

    it('devrait contenir le téléphone', () => {
      expect(organizationConfig.phone).toBe('03 67 31 02 01');
    });

    it('devrait contenir l\'email', () => {
      expect(organizationConfig.email).toBe('contact@netzinformatique.fr');
    });

    it('devrait contenir les informations bancaires', () => {
      expect(organizationConfig.bank.name).toBe('CIC');
      expect(organizationConfig.bank.iban).toBeDefined();
      expect(organizationConfig.bank.bic).toBe('CMCIFRPP');
    });

    it('devrait contenir le consultant par défaut', () => {
      expect(organizationConfig.defaultConsultant.name).toBe('Mikail LEKESIZ');
      expect(organizationConfig.defaultConsultant.email).toBeDefined();
    });

    it('devrait contenir les tarifs', () => {
      expect(organizationConfig.pricing.test).toBe(0);
      expect(organizationConfig.pricing.essentiel).toBe(1200);
      expect(organizationConfig.pricing.approfondi).toBe(1800);
      expect(organizationConfig.pricing.strategique).toBe(2400);
    });

    it('devrait contenir les catégories Qualiopi', () => {
      expect(organizationConfig.qualiopiCategories).toContain('Bilans de compétences');
      expect(organizationConfig.qualiopiCategories).toContain('Actions de Formation');
    });
  });

  describe('getFullAddress', () => {
    it('devrait retourner l\'adresse complète', () => {
      const address = getFullAddress();
      expect(address).toContain('HAGUENAU');
      expect(address).toContain('67500');
    });

    it('devrait retourner une chaîne non vide', () => {
      const address = getFullAddress();
      expect(address.length).toBeGreaterThan(0);
    });
  });

  describe('getLegalInfo', () => {
    it('devrait retourner les informations légales', () => {
      const info = getLegalInfo();
      expect(info).toContain('NETZ INFORMATIQUE');
      expect(info).toContain('SIRET');
      expect(info).toContain('NDA');
    });

    it('devrait inclure le numéro SIRET', () => {
      const info = getLegalInfo();
      expect(info).toContain('818 347 346 00020');
    });
  });

  describe('getQualiopiInfo', () => {
    it('devrait retourner les informations Qualiopi', () => {
      const info = getQualiopiInfo();
      expect(info).toContain('Qualiopi');
      expect(info).toContain('FP 2022/0076-4');
    });

    it('devrait inclure les dates de validité', () => {
      const info = getQualiopiInfo();
      expect(info).toContain('10/02/2025');
      expect(info).toContain('09/02/2028');
    });
  });

  describe('getPackagePrice', () => {
    it('devrait retourner 0 pour le forfait test', () => {
      expect(getPackagePrice('Test')).toBe(0);
      expect(getPackagePrice('test')).toBe(0);
      expect(getPackagePrice('Bilan Test')).toBe(0);
    });

    it('devrait retourner 1200 pour le forfait essentiel', () => {
      expect(getPackagePrice('Essentiel')).toBe(1200);
      expect(getPackagePrice('essentiel')).toBe(1200);
      expect(getPackagePrice('Bilan Essentiel')).toBe(1200);
    });

    it('devrait retourner 1800 pour le forfait approfondi', () => {
      expect(getPackagePrice('Approfondi')).toBe(1800);
      expect(getPackagePrice('approfondi')).toBe(1800);
      expect(getPackagePrice('Bilan Approfondi')).toBe(1800);
    });

    it('devrait retourner 2400 pour le forfait stratégique', () => {
      expect(getPackagePrice('Stratégique')).toBe(2400);
      expect(getPackagePrice('strategique')).toBe(2400);
      expect(getPackagePrice('Bilan Stratégique')).toBe(2400);
    });

    it('devrait retourner le prix essentiel par défaut', () => {
      expect(getPackagePrice('Inconnu')).toBe(1200);
      expect(getPackagePrice('')).toBe(1200);
    });
  });

  describe('getPackageDuration', () => {
    it('devrait retourner 2h pour le forfait test', () => {
      expect(getPackageDuration('Test')).toBe(2);
      expect(getPackageDuration('test')).toBe(2);
    });

    it('devrait retourner 12h pour le forfait essentiel', () => {
      expect(getPackageDuration('Essentiel')).toBe(12);
      expect(getPackageDuration('essentiel')).toBe(12);
    });

    it('devrait retourner 18h pour le forfait approfondi', () => {
      expect(getPackageDuration('Approfondi')).toBe(18);
      expect(getPackageDuration('approfondi')).toBe(18);
    });

    it('devrait retourner 24h pour le forfait stratégique', () => {
      expect(getPackageDuration('Stratégique')).toBe(24);
      expect(getPackageDuration('strategique')).toBe(24);
    });

    it('devrait retourner 12h par défaut', () => {
      expect(getPackageDuration('Inconnu')).toBe(12);
      expect(getPackageDuration('')).toBe(12);
    });
  });

  describe('getBankInfo', () => {
    it('devrait retourner les informations bancaires', () => {
      const info = getBankInfo();
      expect(info).toContain('CIC');
      expect(info).toContain('IBAN');
      expect(info).toContain('BIC');
    });

    it('devrait inclure le code BIC', () => {
      const info = getBankInfo();
      expect(info).toContain('CMCIFRPP');
    });
  });

  describe('default export', () => {
    it('devrait exporter la config par défaut', async () => {
      const module = await import('./organization');
      expect(module.default).toBeDefined();
      expect(module.default.name).toBe('NETZ INFORMATIQUE');
    });
  });
});

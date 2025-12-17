/**
 * Tests du service d'export Excel
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock de la config
vi.mock('../config/organization', () => ({
  organizationConfig: {
    name: 'NETZ INFORMATIQUE',
    qualiopi: 'QUALIOPI-TEST',
    defaultConsultant: { name: 'Test Consultant' },
    address: {
      street: '1A route de Test',
      city: 'TESTVILLE',
      postalCode: '67000',
    },
  },
  getFullAddress: () => '1A route de Test, 67000 TESTVILLE',
}));

// Mock du DOM
const mockClick = vi.fn();
vi.spyOn(document, 'createElement').mockImplementation((tag) => {
  if (tag === 'a') {
    return {
      setAttribute: vi.fn(),
      style: {},
      click: mockClick,
    } as any;
  }
  return { tagName: tag } as any;
});
vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);
vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

describe('excelExportService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('module import', () => {
    it('devrait pouvoir importer le module', async () => {
      const module = await import('./excelExportService');
      expect(module).toBeDefined();
    });

    it('devrait exporter exportToExcel', async () => {
      const module = await import('./excelExportService');
      expect(module.exportToExcel).toBeDefined();
      expect(typeof module.exportToExcel).toBe('function');
    });

    it('devrait exporter exportToXLSX', async () => {
      const module = await import('./excelExportService');
      expect(module.exportToXLSX).toBeDefined();
      expect(typeof module.exportToXLSX).toBe('function');
    });

    it('devrait avoir un export par défaut', async () => {
      const module = await import('./excelExportService');
      expect(module.default).toBeDefined();
      expect(module.default.exportToExcel).toBeDefined();
    });
  });

  describe('exportToExcel', () => {
    const mockData = {
      userName: 'Jean Dupont',
      packageName: 'Bilan Essentiel',
      startDate: '2025-12-01',
      answers: [
        { question: 'Q1', answer: 'R1', theme: 'T1' },
      ],
    };

    it('devrait créer un lien de téléchargement', async () => {
      const { exportToExcel } = await import('./excelExportService');
      exportToExcel(mockData);
      expect(document.createElement).toHaveBeenCalledWith('a');
    });

    it('devrait créer un blob URL', async () => {
      const { exportToExcel } = await import('./excelExportService');
      exportToExcel(mockData);
      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    it('devrait déclencher le téléchargement', async () => {
      const { exportToExcel } = await import('./excelExportService');
      exportToExcel(mockData);
      expect(mockClick).toHaveBeenCalled();
    });

    it('devrait gérer les données avec compétences', async () => {
      const { exportToExcel } = await import('./excelExportService');
      const data = {
        ...mockData,
        competences: [{ name: 'Test', level: 'Expert' }],
      };
      expect(() => exportToExcel(data)).not.toThrow();
    });

    it('devrait gérer les données avec thèmes', async () => {
      const { exportToExcel } = await import('./excelExportService');
      const data = {
        ...mockData,
        themes: [{ name: 'Theme', importance: 'Haute' }],
      };
      expect(() => exportToExcel(data)).not.toThrow();
    });

    it('devrait gérer les données avec synthèse', async () => {
      const { exportToExcel } = await import('./excelExportService');
      const data = {
        ...mockData,
        summary: {
          strengths: ['Force 1'],
          areasToImprove: ['Amélioration'],
          recommendations: ['Recommandation'],
        },
      };
      expect(() => exportToExcel(data)).not.toThrow();
    });

    it('devrait gérer les données minimales', async () => {
      const { exportToExcel } = await import('./excelExportService');
      const minData = {
        userName: 'Test',
        packageName: 'Test',
        startDate: '2025-01-01',
        answers: [],
      };
      expect(() => exportToExcel(minData)).not.toThrow();
    });

    it('devrait gérer la date de fin optionnelle', async () => {
      const { exportToExcel } = await import('./excelExportService');
      const data = {
        ...mockData,
        endDate: '2025-12-17',
      };
      expect(() => exportToExcel(data)).not.toThrow();
    });
  });

  describe('exportToXLSX', () => {
    it('devrait être une fonction async', async () => {
      const { exportToXLSX } = await import('./excelExportService');
      expect(typeof exportToXLSX).toBe('function');
    });

    it('devrait s\'exécuter sans erreur', async () => {
      const { exportToXLSX } = await import('./excelExportService');
      const data = {
        userName: 'Test',
        packageName: 'Test',
        startDate: '2025-01-01',
        answers: [],
      };
      await expect(exportToXLSX(data)).resolves.not.toThrow();
    });
  });
});

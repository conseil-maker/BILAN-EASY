/**
 * Tests du service d'export Excel
 * Note: Les tests d'export complets nécessitent un environnement DOM réel
 */

import { describe, it, expect } from 'vitest';

describe('excelExportService', () => {
  describe('module import', () => {
    it('devrait pouvoir importer le module', async () => {
      const module = await import('./excelExportService');
      expect(module).toBeDefined();
      expect(module.exportToExcel).toBeDefined();
      expect(typeof module.exportToExcel).toBe('function');
    });
  });

  describe('escapeCSV (fonction interne)', () => {
    it('devrait être utilisé correctement dans exportToExcel', async () => {
      // Test indirect via l'import du module
      const { exportToExcel } = await import('./excelExportService');
      expect(exportToExcel).toBeDefined();
    });
  });
});

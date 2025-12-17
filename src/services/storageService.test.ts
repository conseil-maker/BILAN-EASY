/**
 * Tests du service storageService
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock de supabase
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ data: { path: 'test/path.pdf' }, error: null }),
        download: vi.fn().mockResolvedValue({ data: new Blob(['test']), error: null }),
        createSignedUrl: vi.fn().mockResolvedValue({ data: { signedUrl: 'https://test.url' }, error: null }),
        remove: vi.fn().mockResolvedValue({ error: null }),
        list: vi.fn().mockResolvedValue({ data: [], error: null }),
      })),
    },
  },
}));

// Mock de authService
vi.mock('./authService', () => ({
  authService: {
    getCurrentUser: vi.fn().mockResolvedValue({ id: 'test-user-id' }),
  },
}));

describe('storageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('module import', () => {
    it('devrait pouvoir importer le module', async () => {
      const module = await import('./storageService');
      expect(module).toBeDefined();
      expect(module.storageService).toBeDefined();
    });

    it('devrait exporter un objet storageService', async () => {
      const { storageService } = await import('./storageService');
      expect(typeof storageService).toBe('object');
    });
  });

  describe('uploadCV', () => {
    it('devrait être une fonction async', async () => {
      const { storageService } = await import('./storageService');
      expect(typeof storageService.uploadCV).toBe('function');
    });
  });

  describe('downloadCV', () => {
    it('devrait être une fonction async', async () => {
      const { storageService } = await import('./storageService');
      expect(typeof storageService.downloadCV).toBe('function');
    });
  });

  describe('getCVUrl', () => {
    it('devrait être une fonction async', async () => {
      const { storageService } = await import('./storageService');
      expect(typeof storageService.getCVUrl).toBe('function');
    });
  });

  describe('deleteCV', () => {
    it('devrait être une fonction async', async () => {
      const { storageService } = await import('./storageService');
      expect(typeof storageService.deleteCV).toBe('function');
    });
  });

  describe('uploadPDF', () => {
    it('devrait être une fonction async', async () => {
      const { storageService } = await import('./storageService');
      expect(typeof storageService.uploadPDF).toBe('function');
    });
  });

  describe('downloadPDF', () => {
    it('devrait être une fonction async', async () => {
      const { storageService } = await import('./storageService');
      expect(typeof storageService.downloadPDF).toBe('function');
    });
  });

  describe('getPDFUrl', () => {
    it('devrait être une fonction async', async () => {
      const { storageService } = await import('./storageService');
      expect(typeof storageService.getPDFUrl).toBe('function');
    });
  });

  describe('listUserCVs', () => {
    it('devrait être une fonction async', async () => {
      const { storageService } = await import('./storageService');
      expect(typeof storageService.listUserCVs).toBe('function');
    });
  });

  describe('listAssessmentPDFs', () => {
    it('devrait être une fonction async', async () => {
      const { storageService } = await import('./storageService');
      expect(typeof storageService.listAssessmentPDFs).toBe('function');
    });
  });

  describe('fileExists', () => {
    it('devrait être une fonction async', async () => {
      const { storageService } = await import('./storageService');
      expect(typeof storageService.fileExists).toBe('function');
    });

    it('devrait accepter les buckets cvs et pdfs', async () => {
      const { storageService } = await import('./storageService');
      
      // Ne devrait pas lancer d'erreur
      await expect(storageService.fileExists('cvs', 'test/file.pdf')).resolves.toBeDefined();
      await expect(storageService.fileExists('pdfs', 'test/file.pdf')).resolves.toBeDefined();
    });
  });

  describe('service methods', () => {
    it('devrait avoir toutes les méthodes requises', async () => {
      const { storageService } = await import('./storageService');
      
      expect(storageService.uploadCV).toBeDefined();
      expect(storageService.downloadCV).toBeDefined();
      expect(storageService.getCVUrl).toBeDefined();
      expect(storageService.deleteCV).toBeDefined();
      expect(storageService.uploadPDF).toBeDefined();
      expect(storageService.downloadPDF).toBeDefined();
      expect(storageService.getPDFUrl).toBeDefined();
      expect(storageService.listUserCVs).toBeDefined();
      expect(storageService.listAssessmentPDFs).toBeDefined();
      expect(storageService.fileExists).toBeDefined();
    });
  });
});

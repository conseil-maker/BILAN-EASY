/**
 * Tests du service storageService
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Variables pour contrôler les mocks
let mockUploadResult = { data: { path: 'test/path.pdf' }, error: null };
let mockDownloadResult = { data: new Blob(['test']), error: null };
let mockSignedUrlResult = { data: { signedUrl: 'https://test.url' }, error: null };
let mockRemoveResult = { error: null };
let mockListResult = { data: [{ name: 'file1.pdf' }, { name: 'file2.pdf' }], error: null };
let mockCurrentUser = { id: 'test-user-id', email: 'test@test.com' };

// Mock de supabase
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockImplementation(() => Promise.resolve(mockUploadResult)),
        download: vi.fn().mockImplementation(() => Promise.resolve(mockDownloadResult)),
        createSignedUrl: vi.fn().mockImplementation(() => Promise.resolve(mockSignedUrlResult)),
        remove: vi.fn().mockImplementation(() => Promise.resolve(mockRemoveResult)),
        list: vi.fn().mockImplementation(() => Promise.resolve(mockListResult)),
      })),
    },
  },
}));

// Mock de authService
vi.mock('./authService', () => ({
  authService: {
    getCurrentUser: vi.fn().mockImplementation(() => Promise.resolve(mockCurrentUser)),
  },
}));

describe('storageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset des mocks
    mockUploadResult = { data: { path: 'test/path.pdf' }, error: null };
    mockDownloadResult = { data: new Blob(['test']), error: null };
    mockSignedUrlResult = { data: { signedUrl: 'https://test.url' }, error: null };
    mockRemoveResult = { error: null };
    mockListResult = { data: [{ name: 'file1.pdf' }, { name: 'file2.pdf' }], error: null };
    mockCurrentUser = { id: 'test-user-id', email: 'test@test.com' };
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

    it('devrait retourner le chemin du fichier uploadé', async () => {
      const { storageService } = await import('./storageService');
      const file = new File(['test content'], 'cv.pdf', { type: 'application/pdf' });
      const result = await storageService.uploadCV(file);
      expect(result).toBe('test/path.pdf');
    });

    it('devrait lancer une erreur si utilisateur non connecté', async () => {
      mockCurrentUser = null as any;
      const { storageService } = await import('./storageService');
      const file = new File(['test'], 'cv.pdf');
      
      await expect(storageService.uploadCV(file)).rejects.toThrow('Utilisateur non connecté');
    });

    it('devrait lancer une erreur si upload échoue', async () => {
      mockUploadResult = { data: null, error: new Error('Upload failed') } as any;
      const { storageService } = await import('./storageService');
      const file = new File(['test'], 'cv.pdf');
      
      await expect(storageService.uploadCV(file)).rejects.toThrow();
    });
  });

  describe('downloadCV', () => {
    it('devrait être une fonction async', async () => {
      const { storageService } = await import('./storageService');
      expect(typeof storageService.downloadCV).toBe('function');
    });

    it('devrait retourner un Blob', async () => {
      const { storageService } = await import('./storageService');
      const result = await storageService.downloadCV('test/path.pdf');
      expect(result).toBeInstanceOf(Blob);
    });

    it('devrait lancer une erreur si téléchargement échoue', async () => {
      mockDownloadResult = { data: null, error: new Error('Download failed') } as any;
      const { storageService } = await import('./storageService');
      
      await expect(storageService.downloadCV('test/path.pdf')).rejects.toThrow();
    });
  });

  describe('getCVUrl', () => {
    it('devrait être une fonction async', async () => {
      const { storageService } = await import('./storageService');
      expect(typeof storageService.getCVUrl).toBe('function');
    });

    it('devrait retourner une URL signée', async () => {
      const { storageService } = await import('./storageService');
      const result = await storageService.getCVUrl('test/path.pdf');
      expect(result).toBe('https://test.url');
    });

    it('devrait lancer une erreur si génération URL échoue', async () => {
      mockSignedUrlResult = { data: null, error: new Error('URL failed') } as any;
      const { storageService } = await import('./storageService');
      
      await expect(storageService.getCVUrl('test/path.pdf')).rejects.toThrow();
    });
  });

  describe('deleteCV', () => {
    it('devrait être une fonction async', async () => {
      const { storageService } = await import('./storageService');
      expect(typeof storageService.deleteCV).toBe('function');
    });

    it('devrait supprimer sans erreur', async () => {
      const { storageService } = await import('./storageService');
      await expect(storageService.deleteCV('test/path.pdf')).resolves.not.toThrow();
    });

    it('devrait lancer une erreur si suppression échoue', async () => {
      mockRemoveResult = { error: new Error('Delete failed') } as any;
      const { storageService } = await import('./storageService');
      
      await expect(storageService.deleteCV('test/path.pdf')).rejects.toThrow();
    });
  });

  describe('uploadPDF', () => {
    it('devrait être une fonction async', async () => {
      const { storageService } = await import('./storageService');
      expect(typeof storageService.uploadPDF).toBe('function');
    });

    it('devrait retourner le chemin du PDF uploadé', async () => {
      const { storageService } = await import('./storageService');
      const blob = new Blob(['test pdf content'], { type: 'application/pdf' });
      const result = await storageService.uploadPDF('assessment-123', blob, 'synthese.pdf');
      expect(result).toBe('test/path.pdf');
    });

    it('devrait lancer une erreur si upload PDF échoue', async () => {
      mockUploadResult = { data: null, error: new Error('Upload PDF failed') } as any;
      const { storageService } = await import('./storageService');
      const blob = new Blob(['test']);
      
      await expect(storageService.uploadPDF('assessment-123', blob, 'test.pdf')).rejects.toThrow();
    });
  });

  describe('downloadPDF', () => {
    it('devrait être une fonction async', async () => {
      const { storageService } = await import('./storageService');
      expect(typeof storageService.downloadPDF).toBe('function');
    });

    it('devrait retourner un Blob', async () => {
      const { storageService } = await import('./storageService');
      const result = await storageService.downloadPDF('assessment-123/synthese.pdf');
      expect(result).toBeInstanceOf(Blob);
    });
  });

  describe('getPDFUrl', () => {
    it('devrait être une fonction async', async () => {
      const { storageService } = await import('./storageService');
      expect(typeof storageService.getPDFUrl).toBe('function');
    });

    it('devrait retourner une URL signée', async () => {
      const { storageService } = await import('./storageService');
      const result = await storageService.getPDFUrl('assessment-123/synthese.pdf');
      expect(result).toBe('https://test.url');
    });
  });

  describe('listUserCVs', () => {
    it('devrait être une fonction async', async () => {
      const { storageService } = await import('./storageService');
      expect(typeof storageService.listUserCVs).toBe('function');
    });

    it('devrait retourner une liste de fichiers', async () => {
      const { storageService } = await import('./storageService');
      const result = await storageService.listUserCVs();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
    });

    it('devrait accepter un userId optionnel', async () => {
      const { storageService } = await import('./storageService');
      const result = await storageService.listUserCVs('custom-user-id');
      expect(Array.isArray(result)).toBe(true);
    });

    it('devrait lancer une erreur si pas de userId', async () => {
      mockCurrentUser = null as any;
      const { storageService } = await import('./storageService');
      
      await expect(storageService.listUserCVs()).rejects.toThrow('User ID requis');
    });
  });

  describe('listAssessmentPDFs', () => {
    it('devrait être une fonction async', async () => {
      const { storageService } = await import('./storageService');
      expect(typeof storageService.listAssessmentPDFs).toBe('function');
    });

    it('devrait retourner une liste de PDFs', async () => {
      const { storageService } = await import('./storageService');
      const result = await storageService.listAssessmentPDFs('assessment-123');
      expect(Array.isArray(result)).toBe(true);
    });

    it('devrait retourner un tableau vide si pas de données', async () => {
      mockListResult = { data: null, error: null } as any;
      const { storageService } = await import('./storageService');
      const result = await storageService.listAssessmentPDFs('assessment-123');
      expect(result).toEqual([]);
    });
  });

  describe('fileExists', () => {
    it('devrait être une fonction async', async () => {
      const { storageService } = await import('./storageService');
      expect(typeof storageService.fileExists).toBe('function');
    });

    it('devrait retourner true si le fichier existe', async () => {
      mockListResult = { data: [{ name: 'file.pdf' }], error: null };
      const { storageService } = await import('./storageService');
      const result = await storageService.fileExists('cvs', 'user/file.pdf');
      expect(result).toBe(true);
    });

    it('devrait retourner false si le fichier n\'existe pas', async () => {
      mockListResult = { data: [{ name: 'other.pdf' }], error: null };
      const { storageService } = await import('./storageService');
      const result = await storageService.fileExists('cvs', 'user/file.pdf');
      expect(result).toBe(false);
    });

    it('devrait retourner false en cas d\'erreur', async () => {
      mockListResult = { data: null, error: new Error('List failed') } as any;
      const { storageService } = await import('./storageService');
      const result = await storageService.fileExists('pdfs', 'test/file.pdf');
      expect(result).toBe(false);
    });

    it('devrait accepter les buckets cvs et pdfs', async () => {
      const { storageService } = await import('./storageService');
      
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

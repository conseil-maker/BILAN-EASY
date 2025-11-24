import { supabase } from '../lib/supabaseClient';
import { authService } from './authService';

export const storageService = {
  // Upload un CV
  async uploadCV(file: File): Promise<string> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error('Utilisateur non connecté');

      // Créer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/cv_${Date.now()}.${fileExt}`;

      // Upload le fichier
      const { data, error } = await supabase.storage
        .from('cvs')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Retourner le chemin du fichier
      return data.path;
    } catch (error) {
      console.error('Erreur lors de l\'upload du CV:', error);
      throw error;
    }
  },

  // Télécharger un CV
  async downloadCV(filePath: string): Promise<Blob> {
    try {
      const { data, error } = await supabase.storage
        .from('cvs')
        .download(filePath);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors du téléchargement du CV:', error);
      throw error;
    }
  },

  // Obtenir l'URL publique d'un CV (avec signature temporaire)
  async getCVUrl(filePath: string): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from('cvs')
        .createSignedUrl(filePath, 3600); // URL valide 1 heure

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error('Erreur lors de la génération de l\'URL du CV:', error);
      throw error;
    }
  },

  // Supprimer un CV
  async deleteCV(filePath: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from('cvs')
        .remove([filePath]);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la suppression du CV:', error);
      throw error;
    }
  },

  // Upload un PDF de synthèse
  async uploadPDF(assessmentId: string, pdfBlob: Blob, fileName: string): Promise<string> {
    try {
      const filePath = `${assessmentId}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('pdfs')
        .upload(filePath, pdfBlob, {
          contentType: 'application/pdf',
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      return data.path;
    } catch (error) {
      console.error('Erreur lors de l\'upload du PDF:', error);
      throw error;
    }
  },

  // Télécharger un PDF
  async downloadPDF(filePath: string): Promise<Blob> {
    try {
      const { data, error } = await supabase.storage
        .from('pdfs')
        .download(filePath);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors du téléchargement du PDF:', error);
      throw error;
    }
  },

  // Obtenir l'URL publique d'un PDF (avec signature temporaire)
  async getPDFUrl(filePath: string): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from('pdfs')
        .createSignedUrl(filePath, 3600); // URL valide 1 heure

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error('Erreur lors de la génération de l\'URL du PDF:', error);
      throw error;
    }
  },

  // Lister les CVs d'un utilisateur
  async listUserCVs(userId?: string): Promise<any[]> {
    try {
      const user = await authService.getCurrentUser();
      const targetUserId = userId || user?.id;
      
      if (!targetUserId) throw new Error('User ID requis');

      const { data, error } = await supabase.storage
        .from('cvs')
        .list(targetUserId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la liste des CVs:', error);
      throw error;
    }
  },

  // Lister les PDFs d'un bilan
  async listAssessmentPDFs(assessmentId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase.storage
        .from('pdfs')
        .list(assessmentId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la liste des PDFs:', error);
      throw error;
    }
  },

  // Vérifier si un fichier existe
  async fileExists(bucket: 'cvs' | 'pdfs', filePath: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(filePath.split('/')[0]);

      if (error) return false;
      
      const fileName = filePath.split('/').pop();
      return data?.some(file => file.name === fileName) || false;
    } catch (error) {
      return false;
    }
  }
};

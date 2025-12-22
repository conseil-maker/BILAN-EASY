import { supabase } from '../lib/supabaseClient';

const BUCKET_NAME = 'documents';

export interface StoredDocument {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_type: 'synthese' | 'convention' | 'attestation' | 'livret';
  file_size: number;
  created_at: string;
  assessment_id?: string;
}

/**
 * Initialiser le bucket de stockage (à appeler une fois)
 */
export const initializeStorage = async (): Promise<boolean> => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);
    
    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: false,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      });
      
      if (error) {
        console.error('[DocumentStorage] Erreur création bucket:', error);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('[DocumentStorage] Erreur initialisation:', error);
    return false;
  }
};

/**
 * Uploader un document PDF
 */
export const uploadDocument = async (
  userId: string,
  file: Blob,
  fileName: string,
  fileType: StoredDocument['file_type'],
  assessmentId?: string
): Promise<StoredDocument | null> => {
  try {
    // Générer un chemin unique
    const timestamp = Date.now();
    const filePath = `${userId}/${fileType}/${timestamp}_${fileName}`;
    
    // Uploader le fichier
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        contentType: 'application/pdf',
        upsert: false
      });
    
    if (uploadError) {
      console.error('[DocumentStorage] Erreur upload:', uploadError);
      return null;
    }
    
    // Enregistrer les métadonnées dans la base de données
    const documentRecord = {
      user_id: userId,
      file_name: fileName,
      file_path: filePath,
      file_type: fileType,
      file_size: file.size,
      assessment_id: assessmentId || null
    };
    
    const { data, error: dbError } = await supabase
      .from('documents')
      .insert(documentRecord)
      .select()
      .single();
    
    if (dbError) {
      console.error('[DocumentStorage] Erreur enregistrement métadonnées:', dbError);
      // Supprimer le fichier uploadé si l'enregistrement échoue
      await supabase.storage.from(BUCKET_NAME).remove([filePath]);
      return null;
    }
    
    return data as StoredDocument;
  } catch (error) {
    console.error('[DocumentStorage] Erreur upload document:', error);
    return null;
  }
};

/**
 * Récupérer l'URL de téléchargement d'un document
 */
export const getDocumentUrl = async (filePath: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, 3600); // URL valide 1 heure
    
    if (error) {
      console.error('[DocumentStorage] Erreur génération URL:', error);
      return null;
    }
    
    return data.signedUrl;
  } catch (error) {
    console.error('[DocumentStorage] Erreur getDocumentUrl:', error);
    return null;
  }
};

/**
 * Télécharger un document
 */
export const downloadDocument = async (filePath: string): Promise<Blob | null> => {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(filePath);
    
    if (error) {
      console.error('[DocumentStorage] Erreur téléchargement:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('[DocumentStorage] Erreur downloadDocument:', error);
    return null;
  }
};

/**
 * Lister les documents d'un utilisateur
 */
export const listUserDocuments = async (userId: string): Promise<StoredDocument[]> => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('[DocumentStorage] Erreur liste documents:', error);
      return [];
    }
    
    return data as StoredDocument[];
  } catch (error) {
    console.error('[DocumentStorage] Erreur listUserDocuments:', error);
    return [];
  }
};

/**
 * Supprimer un document
 */
export const deleteDocument = async (documentId: string, filePath: string): Promise<boolean> => {
  try {
    // Supprimer le fichier du storage
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);
    
    if (storageError) {
      console.error('[DocumentStorage] Erreur suppression fichier:', storageError);
      return false;
    }
    
    // Supprimer l'enregistrement de la base de données
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);
    
    if (dbError) {
      console.error('[DocumentStorage] Erreur suppression enregistrement:', dbError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('[DocumentStorage] Erreur deleteDocument:', error);
    return false;
  }
};

/**
 * Convertir un Blob PDF en base64 pour stockage temporaire
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Convertir base64 en Blob
 */
export const base64ToBlob = (base64: string, contentType = 'application/pdf'): Blob => {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
};

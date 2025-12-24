import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';
import { analyzeUserProfile } from '../services/geminiService';
import { storageService } from '../services/storageService';

interface PersonalizationStepProps {
  onComplete: (profile: UserProfile | null) => void;
}

const PersonalizationStep: React.FC<PersonalizationStepProps> = ({ onComplete }) => {
  const [cvText, setCvText] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'text' | 'file'>('text');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const processFile = async (file: File) => {
    // Vérifier le type de fichier
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      setError('Format de fichier non supporté. Veuillez uploader un PDF, Word ou fichier texte.');
      return;
    }
    // Vérifier la taille (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Le fichier est trop volumineux. Taille maximale: 10MB.');
      return;
    }
    setCvFile(file);
    setError('');
    
    // Si c'est un fichier texte, extraire le contenu directement
    if (file.type === 'text/plain') {
      try {
        const text = await file.text();
        setCvText(text);
        setUploadProgress('Texte extrait du fichier');
      } catch (err) {
        console.error('Erreur lecture fichier texte:', err);
      }
    }
  };

  // Gestion du drag & drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleSubmit = async () => {
    if (uploadMethod === 'text' && !cvText.trim()) {
      setError('Veuillez coller le texte de votre profil.');
      return;
    }
    if (uploadMethod === 'file' && !cvFile) {
      setError('Veuillez sélectionner un fichier.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      let profileText = cvText;
      
      // Si un fichier est uploadé
      if (uploadMethod === 'file' && cvFile) {
        setUploadProgress('Upload du CV en cours...');
        
        try {
          // Upload vers Supabase Storage
          await storageService.uploadCV(cvFile);
          setUploadProgress('CV uploadé avec succès!');
        } catch (uploadError) {
          console.error('Erreur upload:', uploadError);
          // Continuer même si l'upload échoue
          setUploadProgress('Upload échoué, analyse locale...');
        }
        
        // Si on a déjà extrait le texte (fichier .txt), l'utiliser
        if (cvText.trim()) {
          profileText = cvText;
        } else {
          // Pour PDF/Word, on indique le nom du fichier
          // L'analyse sera basée sur les métadonnées disponibles
          profileText = `CV uploadé: ${cvFile.name}\nType: ${cvFile.type}\nTaille: ${(cvFile.size / 1024).toFixed(1)} KB`;
        }
      }
      
      if (profileText.trim()) {
        setUploadProgress('Analyse du profil en cours...');
        const profile = await analyzeUserProfile(profileText);
        setUploadProgress('Analyse terminée!');
        onComplete(profile);
      } else {
        onComplete(null);
      }
    } catch (err) {
      console.error("Error analyzing profile:", err);
      setError("Désolé, une erreur est survenue lors de l'analyse. Nous allons continuer sans cette information.");
      setTimeout(() => onComplete(null), 2000);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSkip = () => {
    onComplete(null);
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <header className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-display font-bold text-primary-800 mb-2">Hyper-Personnalisation</h1>
          <p className="text-slate-600 text-lg">
            Pour un bilan encore plus pertinent, partagez votre CV ou profil.
          </p>
          <p className="text-sm text-slate-500 mt-1">(C'est optionnel, vous pouvez passer cette étape)</p>
        </header>
        
        {/* Sélection de la méthode d'upload */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setUploadMethod('text')}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
              uploadMethod === 'text'
                ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-md'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <span className="text-xl mb-1 block">📝</span>
            <span className="font-medium">Coller le texte</span>
          </button>
          <button
            onClick={() => setUploadMethod('file')}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
              uploadMethod === 'file'
                ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-md'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <span className="text-xl mb-1 block">📄</span>
            <span className="font-medium">Uploader un fichier</span>
          </button>
        </div>
        
        {uploadMethod === 'text' ? (
          <div className="relative">
            <textarea
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              placeholder="Collez ici le texte de votre CV, profil LinkedIn, ou description de votre parcours professionnel..."
              rows={8}
              className="w-full h-64 p-4 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none transition-colors"
            />
            {cvText && (
              <div className="absolute bottom-3 right-3 text-xs text-slate-400">
                {cvText.length} caractères
              </div>
            )}
          </div>
        ) : (
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
              isDragging 
                ? 'border-primary-500 bg-primary-50' 
                : cvFile 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-slate-300 hover:border-primary-400 hover:bg-slate-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleFileClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              id="cv-upload"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
            
            {cvFile ? (
              <div className="space-y-2">
                <div className="text-5xl mb-2">✅</div>
                <p className="font-medium text-green-700">{cvFile.name}</p>
                <p className="text-sm text-green-600">
                  {(cvFile.size / 1024).toFixed(1)} KB • Prêt à analyser
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCvFile(null);
                    setCvText('');
                  }}
                  className="mt-2 text-sm text-slate-500 hover:text-red-600 underline"
                >
                  Supprimer et choisir un autre fichier
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-5xl mb-2">
                  {isDragging ? '📥' : '📎'}
                </div>
                <p className="text-slate-600 font-medium">
                  {isDragging ? 'Déposez le fichier ici' : 'Glissez-déposez ou cliquez pour sélectionner'}
                </p>
                <p className="text-sm text-slate-500">
                  Formats acceptés: PDF, Word, Texte (max 10MB)
                </p>
              </div>
            )}
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <span className="text-red-500">⚠️</span>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        
        {uploadProgress && (
          <div className="mt-4 p-3 bg-primary-50 border border-primary-200 rounded-lg flex items-center gap-2">
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-600 border-t-transparent"></div>
            )}
            <p className="text-primary-600 text-sm">{uploadProgress}</p>
          </div>
        )}
        
        <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            onClick={handleSubmit}
            disabled={isLoading || (uploadMethod === 'text' && !cvText.trim()) || (uploadMethod === 'file' && !cvFile)}
            className="w-full sm:w-auto bg-primary-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-primary-700 transition-transform transform hover:scale-105 duration-300 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Analyse en cours...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Personnaliser le bilan
              </>
            )}
          </button>
          <button
            onClick={handleSkip}
            disabled={isLoading}
            className="text-sm text-slate-500 hover:text-primary-600 transition-colors"
          >
            Passer cette étape →
          </button>
        </div>
        
        {/* Note de confidentialité */}
        <p className="mt-6 text-xs text-slate-400 text-center">
          🔒 Vos données sont traitées de manière confidentielle et sécurisée.
        </p>
      </div>
    </div>
  );
};

export default PersonalizationStep;

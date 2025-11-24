import React, { useState } from 'react';
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setError('Format de fichier non supporté. Veuillez uploader un PDF ou un document Word.');
        return;
      }
      // Vérifier la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Le fichier est trop volumineux. Taille maximale: 10MB.');
        return;
      }
      setCvFile(file);
      setError('');
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
      
      // Si un fichier est uploadé, l'envoyer à Supabase Storage
      if (uploadMethod === 'file' && cvFile) {
        setUploadProgress('Upload du CV en cours...');
        await storageService.uploadCV(cvFile);
        setUploadProgress('CV uploadé avec succès!');
        
        // Pour l'instant, on continue sans analyser le fichier
        // Dans une version future, on pourrait extraire le texte du PDF/Word
        profileText = `CV uploadé: ${cvFile.name}`;
      }
      
      if (profileText.trim()) {
        setUploadProgress('Analyse du profil...');
        const profile = await analyzeUserProfile(profileText);
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
      setUploadProgress('');
    }
  };
  
  const handleSkip = () => {
    onComplete(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <header className="text-center mb-8">
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
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
              uploadMethod === 'text'
                ? 'border-primary-600 bg-primary-50 text-primary-700'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            📝 Coller le texte
          </button>
          <button
            onClick={() => setUploadMethod('file')}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
              uploadMethod === 'file'
                ? 'border-primary-600 bg-primary-50 text-primary-700'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            📄 Uploader un fichier
          </button>
        </div>
        
        {uploadMethod === 'text' ? (
          <textarea
            value={cvText}
            onChange={(e) => setCvText(e.target.value)}
            placeholder="Collez ici le texte de votre CV..."
            rows={8}
            className="w-full h-64 p-4 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
          />
        ) : (
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
            <input
              type="file"
              id="cv-upload"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="cv-upload"
              className="cursor-pointer inline-block"
            >
              <div className="text-6xl mb-4">📎</div>
              <p className="text-slate-600 mb-2">
                {cvFile ? cvFile.name : 'Cliquez pour sélectionner un fichier'}
              </p>
              <p className="text-sm text-slate-500">
                Formats acceptés: PDF, Word (max 10MB)
              </p>
            </label>
          </div>
        )}
        
        {error && (
          <p className="text-red-600 text-sm mt-4">{error}</p>
        )}
        
        {uploadProgress && (
          <p className="text-primary-600 text-sm mt-4">{uploadProgress}</p>
        )}
        
        <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            onClick={handleSubmit}
            disabled={isLoading || !cvText.trim()}
            className="w-full sm:w-auto bg-primary-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-primary-700 transition-transform transform hover:scale-105 duration-300 disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Analyse en cours...' : 'Personnaliser le bilan'}
          </button>
          <button
            onClick={handleSkip}
            disabled={isLoading}
            className="text-sm text-slate-500 hover:text-primary-600"
          >
            Passer cette étape
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonalizationStep;

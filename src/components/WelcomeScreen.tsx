import React, { useState, useEffect } from 'react';
import { assessmentService } from '../services/assessmentService';

interface WelcomeScreenProps {
  onStart: (name: string) => void;
  onShowHistory: () => void;
  userName?: string;
  onLogout?: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, onShowHistory, userName, onLogout }) => {
  const [name, setName] = useState(userName || '');
  const [hasHistory, setHasHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a des bilans dans Supabase
    checkHistory();
  }, []);

  const checkHistory = async () => {
    try {
      const assessments = await assessmentService.getClientAssessments();
      setHasHistory(assessments.length > 0);
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'historique:', error);
    }
  };

  const validateName = (value: string): string | null => {
    if (!value.trim()) {
      return 'Veuillez entrer votre prénom pour continuer';
    }
    if (value.trim().length < 2) {
      return 'Le prénom doit contenir au moins 2 caractères';
    }
    if (value.trim().length > 50) {
      return 'Le prénom ne peut pas dépasser 50 caractères';
    }
    return null;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    if (touched) {
      setError(validateName(value));
    }
  };

  const handleBlur = () => {
    setTouched(true);
    setError(validateName(name));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    const validationError = validateName(name);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    onStart(name.trim());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center transform transition-all hover:scale-105 duration-500">
        {onLogout && (
          <div className="flex justify-end mb-4">
            <button
              onClick={onLogout}
              className="text-sm text-slate-500 hover:text-red-600 transition-colors"
              title="Se déconnecter"
            >
              🚪 Déconnexion
            </button>
          </div>
        )}
        
        <h1 className="text-4xl md:text-5xl font-display font-bold text-primary-800 mb-4">Bilan de Compétences</h1>
        <p className="text-slate-600 mb-8 text-lg">
          Découvrez vos forces et dessinez votre avenir professionnel.
        </p>
        
        {userName && (
          <p className="text-primary-600 mb-4 font-semibold">
            Bienvenue, {userName} !
          </p>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="sr-only">Votre nom</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={handleNameChange}
              onBlur={handleBlur}
              placeholder="Entrez votre prénom"
              className={`w-full px-4 py-3 border rounded-lg text-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition ${
                error && touched ? 'border-red-500 bg-red-50' : 'border-slate-300'
              }`}
              required
              aria-invalid={error && touched ? 'true' : 'false'}
              aria-describedby={error && touched ? 'name-error' : undefined}
            />
            {error && touched && (
              <p id="name-error" className="mt-2 text-sm text-red-600 text-left flex items-center gap-1" role="alert">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-primary-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-primary-700 transition-transform transform hover:scale-105 duration-300 disabled:bg-slate-400 disabled:cursor-not-allowed"
            disabled={!name.trim()}
          >
            Commencer mon bilan
          </button>
        </form>
        {hasHistory && (
          <button
            onClick={onShowHistory}
            className="mt-4 text-sm text-slate-500 hover:text-primary-600"
          >
            Consulter l'historique
          </button>
        )}

        {/* Accès rapides */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <p className="text-sm text-slate-500 mb-4">Accès rapides</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="#/dashboard"
              className="px-4 py-2 bg-primary-100 hover:bg-primary-200 rounded-lg text-sm text-primary-700 transition-colors font-medium"
            >
              🏠 Mon Dashboard
            </a>
            <a
              href="#/mes-documents"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-700 transition-colors"
            >
              📁 Mes documents
            </a>
            <a
              href="#/satisfaction"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-700 transition-colors"
            >
              ⭐ Satisfaction
            </a>
          </div>
        </div>

        {/* Badge Qualiopi */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded">Qualiopi</span>
          <span>Organisme certifié</span>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;

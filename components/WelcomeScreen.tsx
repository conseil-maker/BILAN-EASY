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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onStart(name.trim());
    }
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
              onChange={(e) => setName(e.target.value)}
              placeholder="Entrez votre prénom"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg text-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
              required
            />
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
      </div>
    </div>
  );
};

export default WelcomeScreen;

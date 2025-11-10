import React, { useState, useEffect } from 'react';
import { getAssessmentHistory } from '../services/historyService';

interface WelcomeScreenProps {
  onStart: (name: string) => void;
  onShowHistory: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, onShowHistory }) => {
  const [name, setName] = useState('');
  const [hasHistory, setHasHistory] = useState(false);

  useEffect(() => {
    const history = getAssessmentHistory();
    setHasHistory(history.length > 0);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onStart(name.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center transform transition-all hover:scale-105 duration-500">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-primary-800 mb-4">Bilan de Compétences</h1>
        <p className="text-slate-600 mb-8 text-lg">
          Découvrez vos forces et dessinez votre avenir professionnel.
        </p>
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

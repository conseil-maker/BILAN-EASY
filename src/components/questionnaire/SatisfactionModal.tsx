/**
 * SatisfactionModal - Modal de satisfaction après une phase
 * 
 * Permet à l'utilisateur de noter et commenter une phase terminée.
 * Utilisé pour le feedback continu et l'amélioration de l'expérience.
 * 
 * @author Manus AI
 * @date 22 janvier 2026
 */

import React, { useState, useEffect } from 'react';

interface SatisfactionModalProps {
  phaseName: string;
  onSubmit: (rating: number, comment: string) => void;
}

const SatisfactionModal: React.FC<SatisfactionModalProps> = ({ phaseName, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onSubmit(rating || 3, comment);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [rating, comment, onSubmit]);
  
  const handleStarClick = (star: number) => {
    setRating(star);
  };
  
  const handleSubmit = () => {
    onSubmit(rating, comment);
  };
  
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onSubmit(rating || 3, comment);
    }
  };
  
  return (
    <div 
      onClick={handleBackdropClick} 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in"
    >
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full relative">
        <button 
          onClick={() => onSubmit(rating || 3, comment)} 
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-2xl font-bold"
        >
          &times;
        </button>
        
        <h2 className="text-2xl font-bold font-display text-primary-800 mb-2">
          Votre avis sur la phase terminée
        </h2>
        <p className="text-slate-600 mb-4">"{phaseName}"</p>
        
        <div className="mb-4">
          <p className="mb-2 text-slate-700">Cette phase vous a-t-elle semblé pertinente ?</p>
          <div className="flex justify-center text-3xl gap-2">
            {[1, 2, 3, 4, 5].map(star => (
              <span 
                key={star} 
                onClick={() => handleStarClick(star)} 
                className={`cursor-pointer transition-all hover:scale-110 ${
                  star <= rating ? 'text-yellow-400' : 'text-slate-300'
                }`}
              >
                ★
              </span>
            ))}
          </div>
        </div>
        
        <textarea 
          value={comment} 
          onChange={e => setComment(e.target.value)} 
          placeholder="Un commentaire ? (optionnel)" 
          rows={3} 
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
        />
        
        <div className="flex gap-3 mt-4">
          <button 
            onClick={handleSubmit} 
            disabled={rating === 0} 
            className="flex-1 bg-primary-600 text-white font-bold py-3 rounded-lg hover:bg-primary-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
          >
            Valider
          </button>
          <button 
            onClick={() => onSubmit(3, comment)} 
            className="px-6 bg-slate-200 text-slate-700 font-bold py-3 rounded-lg hover:bg-slate-300 transition-colors"
          >
            Passer
          </button>
        </div>
      </div>
    </div>
  );
};

export default SatisfactionModal;

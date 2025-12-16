import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface Draft {
  id: string;
  package_name: string;
  status: string;
  answers: any[];
  created_at: string;
  updated_at: string;
}

interface DraftRecoveryProps {
  userId: string;
  onResume: (draft: Draft) => void;
  onDiscard: () => void;
}

const DraftRecovery: React.FC<DraftRecoveryProps> = ({ userId, onResume, onDiscard }) => {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkForDraft = async () => {
      try {
        // Vérifier d'abord dans localStorage
        const localDraft = localStorage.getItem('currentDraft');
        if (localDraft) {
          const parsed = JSON.parse(localDraft);
          if (parsed.answers && parsed.answers.length > 0) {
            setDraft(parsed);
            setIsVisible(true);
            setLoading(false);
            return;
          }
        }

        // Sinon, vérifier dans Supabase
        const { data, error } = await supabase
          .from('assessments')
          .select('*')
          .eq('client_id', userId)
          .eq('status', 'in_progress')
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();

        if (data && !error) {
          setDraft(data);
          setIsVisible(true);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du brouillon:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      checkForDraft();
    }
  }, [userId]);

  const handleResume = () => {
    if (draft) {
      onResume(draft);
      setIsVisible(false);
    }
  };

  const handleDiscard = async () => {
    if (draft) {
      try {
        // Supprimer le brouillon de Supabase
        await supabase
          .from('assessments')
          .delete()
          .eq('id', draft.id);

        // Supprimer du localStorage
        localStorage.removeItem('currentDraft');
      } catch (error) {
        console.error('Erreur lors de la suppression du brouillon:', error);
      }
    }
    onDiscard();
    setIsVisible(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading || !isVisible || !draft) {
    return null;
  }

  const answersCount = draft.answers?.length || 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold">Brouillon trouvé</h2>
              <p className="text-white/80 text-sm">Reprendre votre bilan en cours ?</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Forfait</p>
                <p className="font-semibold text-gray-900 dark:text-white">{draft.package_name || 'Non défini'}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Questions répondues</p>
                <p className="font-semibold text-gray-900 dark:text-white">{answersCount}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500 dark:text-gray-400">Dernière modification</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {formatDate(draft.updated_at || draft.created_at)}
                </p>
              </div>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">Progression estimée</span>
              <span className="font-semibold text-primary-600">{Math.min(answersCount * 5, 100)}%</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(answersCount * 5, 100)}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleDiscard}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Nouveau bilan
            </button>
            <button
              onClick={handleResume}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-colors font-medium shadow-lg shadow-primary-500/25"
            >
              Reprendre
            </button>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
            En cliquant sur "Nouveau bilan", le brouillon sera supprimé définitivement.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DraftRecovery;

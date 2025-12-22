import React, { useState, useEffect } from 'react';
import { useToast } from './ToastProvider';
import { HistoryItem } from '../types';
import { getAssessmentHistory, deleteAssessmentFromSupabase } from '../services/historyService';
import { supabase } from '../lib/supabaseClient';

interface HistoryScreenProps {
    onViewRecord: (record: HistoryItem) => void;
    onBack: () => void;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ onViewRecord, onBack }) => {
    const { showError, showSuccess } = useToast();
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user?.id) {
                showError('Vous devez être connecté pour voir l\'historique');
                return;
            }
            
            const historyItems = await getAssessmentHistory(user.id);
            setHistory(historyItems);
        } catch (error) {
            console.error('Erreur lors du chargement de l\'historique:', error);
            showError('Erreur lors du chargement de l\'historique');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAssessment = async (assessmentId: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce bilan ? Cette action est irréversible.")) {
            try {
                const success = await deleteAssessmentFromSupabase(assessmentId);
                if (success) {
                    setHistory(history.filter(item => item.id !== assessmentId));
                    showSuccess('Bilan supprimé avec succès');
                } else {
                    showError('Erreur lors de la suppression du bilan');
                }
            } catch (error) {
                console.error('Erreur lors de la suppression du bilan:', error);
                showError('Erreur lors de la suppression du bilan');
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Chargement de l'historique...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-primary-800 mb-3">Historique des Bilans</h1>
                    <p className="text-lg text-slate-600">Consultez vos évaluations précédentes.</p>
                </header>

                {history.length === 0 ? (
                    <div className="text-center bg-white p-8 rounded-xl shadow-md">
                        <p className="text-slate-600 text-lg">Aucune évaluation n'a été trouvée dans votre historique.</p>
                        <button onClick={onBack} className="mt-6 bg-primary-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-700 transition-colors">
                            Commencer une nouvelle évaluation
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {history.map((item) => (
                            <div key={item.id} className="bg-white p-4 sm:p-6 rounded-lg shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="flex-grow">
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-primary-800">{item.packageName}</p>
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                            ☁️ Sauvegardé
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500">
                                        Complété le {new Date(item.date).toLocaleDateString('fr-FR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                    {item.summary?.profileType && (
                                        <p className="text-slate-700 mt-1">Profil : {item.summary.profileType}</p>
                                    )}
                                    {item.answers && (
                                        <p className="text-xs text-slate-400 mt-1">
                                            {item.answers.length} réponse(s)
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <button 
                                        onClick={() => onViewRecord(item)} 
                                        className="bg-secondary text-white font-semibold py-2 px-4 rounded-lg hover:bg-secondary-600 transition-colors flex-1 sm:flex-initial"
                                    >
                                        Consulter
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteAssessment(item.id)} 
                                        className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                                        title="Supprimer ce bilan"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                        <div className="flex justify-center gap-4 pt-8">
                             <button onClick={onBack} className="text-sm text-slate-500 hover:text-primary-600">
                                Retour à l'accueil
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoryScreen;

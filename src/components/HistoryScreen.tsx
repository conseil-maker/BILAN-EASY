import React, { useState, useEffect } from 'react';
import { useToast } from './ToastProvider';
import { HistoryItem } from '../types';
import { getAssessmentHistory, deleteAssessmentFromSupabase, syncLocalToSupabase } from '../services/historyService';
import { supabase } from '../lib/supabaseClient';

interface HistoryScreenProps {
    onViewRecord: (record: HistoryItem) => void;
    onBack: () => void;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ onViewRecord, onBack }) => {
    const { showError, showSuccess, showInfo } = useToast();
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            setLoading(true);
            
            // Récupérer l'utilisateur connecté
            const { data: { user } } = await supabase.auth.getUser();
            
            // Charger l'historique fusionné (Supabase + localStorage)
            const historyItems = await getAssessmentHistory(user?.id);
            setHistory(historyItems);
            
            // Synchroniser automatiquement les bilans locaux vers Supabase
            if (user?.id) {
                const syncedCount = await syncLocalToSupabase(user.id);
                if (syncedCount > 0) {
                    showInfo(`${syncedCount} bilan(s) synchronisé(s) avec le cloud`);
                    // Recharger après synchronisation
                    const updatedHistory = await getAssessmentHistory(user.id);
                    setHistory(updatedHistory);
                }
            }
        } catch (error) {
            console.error('Erreur lors du chargement de l\'historique:', error);
            showError('Erreur lors du chargement de l\'historique');
        } finally {
            setLoading(false);
        }
    };

    const handleSyncToCloud = async () => {
        try {
            setSyncing(true);
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user?.id) {
                showError('Vous devez être connecté pour synchroniser');
                return;
            }
            
            const syncedCount = await syncLocalToSupabase(user.id);
            
            if (syncedCount > 0) {
                showSuccess(`${syncedCount} bilan(s) synchronisé(s) avec succès`);
                // Recharger l'historique
                const updatedHistory = await getAssessmentHistory(user.id);
                setHistory(updatedHistory);
            } else {
                showInfo('Tous les bilans sont déjà synchronisés');
            }
        } catch (error) {
            console.error('Erreur de synchronisation:', error);
            showError('Erreur lors de la synchronisation');
        } finally {
            setSyncing(false);
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
                    // Supprimer uniquement du state local si pas dans Supabase
                    setHistory(history.filter(item => item.id !== assessmentId));
                    showInfo('Bilan supprimé localement');
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

                {/* Bouton de synchronisation */}
                <div className="flex justify-end mb-4">
                    <button
                        onClick={handleSyncToCloud}
                        disabled={syncing}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors disabled:opacity-50"
                    >
                        {syncing ? (
                            <>
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Synchronisation...
                            </>
                        ) : (
                            <>
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                Synchroniser avec le cloud
                            </>
                        )}
                    </button>
                </div>

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
                                        {item.id.includes('-') && (
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                                ☁️ Cloud
                                            </span>
                                        )}
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

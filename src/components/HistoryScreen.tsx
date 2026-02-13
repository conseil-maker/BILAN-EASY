import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from './ToastProvider';
import { HistoryItem } from '../types';
import { getAssessmentHistory, deleteAssessmentFromSupabase } from '../services/historyService';
import { supabase } from '../lib/supabaseClient';

interface HistoryScreenProps {
    onViewRecord: (record: HistoryItem) => void;
    onBack: () => void;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ onViewRecord, onBack }) => {
    const { t, i18n } = useTranslation('dashboard');
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
                showError(t('history.errorLogin'));
                return;
            }
            
            const historyItems = await getAssessmentHistory(user.id);
            setHistory(historyItems);
        } catch (error) {
            console.error('Erreur lors du chargement de l\'historique:', error);
            showError(t('history.errorLoad'));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAssessment = async (assessmentId: string) => {
        if (window.confirm(t('history.confirmDelete'))) {
            try {
                const success = await deleteAssessmentFromSupabase(assessmentId);
                if (success) {
                    setHistory(history.filter(item => item.id !== assessmentId));
                    showSuccess(t('history.deleteSuccess'));
                } else {
                    showError(t('history.deleteError'));
                }
            } catch (error) {
                console.error('Erreur lors de la suppression du bilan:', error);
                showError(t('history.deleteError'));
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">{t('history.loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-primary-800 mb-3">{t('history.title')}</h1>
                    <p className="text-lg text-slate-600">{t('history.subtitle')}</p>
                </header>

                {history.length === 0 ? (
                    <div className="text-center bg-white p-8 rounded-xl shadow-md">
                        <p className="text-slate-600 text-lg">{t('history.empty')}</p>
                        <button onClick={onBack} className="mt-6 bg-primary-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-700 transition-colors">
                            {t('history.startNew')}
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
                                            {t('history.saved')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500">
                                        {t('history.completedOn')} {new Date(item.date).toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'fr-FR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                    {item.summary?.profileType && (
                                        <p className="text-slate-700 mt-1">{t('history.profile')} : {item.summary.profileType}</p>
                                    )}
                                    {item.answers && (
                                        <p className="text-xs text-slate-400 mt-1">
                                            {item.answers.length} {t('history.answers')}
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <button 
                                        onClick={() => onViewRecord(item)} 
                                        className="bg-secondary text-white font-semibold py-2 px-4 rounded-lg hover:bg-secondary-600 transition-colors flex-1 sm:flex-initial"
                                    >
                                        {t('history.view')}
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteAssessment(item.id)} 
                                        className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                                        title={t('history.deleteTitle')}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                        <div className="flex justify-center gap-4 pt-8">
                             <button onClick={onBack} className="text-sm text-slate-500 hover:text-primary-600">
                                {t('history.backHome')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoryScreen;

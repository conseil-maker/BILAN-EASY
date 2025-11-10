import React, { useState, useEffect } from 'react';
import { HistoryItem } from '../types';
import { getAssessmentHistory, clearAssessmentHistory } from '../services/historyService';

interface HistoryScreenProps {
    onViewRecord: (record: HistoryItem) => void;
    onBack: () => void;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ onViewRecord, onBack }) => {
    const [history, setHistory] = useState<HistoryItem[]>([]);

    useEffect(() => {
        setHistory(getAssessmentHistory());
    }, []);

    const handleClearHistory = () => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer tout votre historique ? Cette action est irréversible.")) {
            clearAssessmentHistory();
            setHistory([]);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="text-center mb-12">
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
                                <div>
                                    <p className="font-bold text-primary-800">{item.packageName}</p>
                                    <p className="text-sm text-slate-500">
                                        Fait par {item.userName} le {new Date(item.date).toLocaleDateString('fr-FR')}
                                    </p>
                                    <p className="text-slate-700 mt-1">Profil : {item.summary.profileType}</p>
                                </div>
                                <button onClick={() => onViewRecord(item)} className="bg-secondary text-white font-semibold py-2 px-4 rounded-lg hover:bg-secondary-600 transition-colors w-full sm:w-auto flex-shrink-0">
                                    Consulter
                                </button>
                            </div>
                        ))}
                        <div className="flex justify-center gap-4 pt-8">
                             <button onClick={onBack} className="text-sm text-slate-500 hover:text-primary-600">
                                Retour à l'accueil
                            </button>
                            <button onClick={handleClearHistory} className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors">
                                Effacer l'historique
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoryScreen;

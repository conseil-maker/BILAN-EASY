import React, { useState, useEffect } from 'react';
import { HistoryItem, Summary, Answer } from '../types';
import { getAssessmentHistory, clearAssessmentHistory } from '../services/historyService';
import { useApi } from '../services/apiClient';
import { HistoryItemSkeleton } from './SkeletonLoader';
import type { Assessment } from '../services/apiClient';

interface HistoryScreenProps {
    onViewRecord: (record: HistoryItem) => void;
    onBack: () => void;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ onViewRecord, onBack }) => {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(0);
    const LIMIT = 10; // Pagination limit
    const api = useApi();

    useEffect(() => {
        const loadHistory = async () => {
            setIsLoading(true);
            try {
                // Backend'den completed assessments çek (pagination ile)
                const response = await api.getAssessments({ 
                    status: 'completed', 
                    limit: LIMIT,
                    offset: offset 
                });
                const assessments: Assessment[] = response.data || [];
                setHasMore(assessments.length === LIMIT);
                
                // Her assessment için summary ve answers çek
                const historyItems: HistoryItem[] = await Promise.all(
                    assessments.map(async (assessment) => {
                        try {
                            const [summaryResponse, answersResponse] = await Promise.all([
                                api.getSummary(assessment.id),
                                api.getAnswers(assessment.id),
                            ]);
                            
                            const summary: Summary = {
                                profileType: summaryResponse.profileType,
                                priorityThemes: summaryResponse.priorityThemes as string[],
                                maturityLevel: summaryResponse.maturityLevel,
                                keyStrengths: summaryResponse.keyStrengths as any[],
                                areasForDevelopment: summaryResponse.areasForDevelopment as any[],
                                recommendations: summaryResponse.recommendations as string[],
                                actionPlan: {
                                    shortTerm: summaryResponse.actionPlan.shortTerm.map((item: any) => ({
                                        id: item.id,
                                        text: item.text,
                                        completed: item.completed || false,
                                    })),
                                    mediumTerm: summaryResponse.actionPlan.mediumTerm.map((item: any) => ({
                                        id: item.id,
                                        text: item.text,
                                        completed: item.completed || false,
                                    })),
                                },
                            };
                            
                            const answers: Answer[] = (answersResponse.answers || []).map((a: any) => ({
                                questionId: a.questionId,
                                value: a.value,
                            }));
                            
                            return {
                                id: assessment.id,
                                date: assessment.completedAt || assessment.createdAt,
                                userName: assessment.userName,
                                packageName: assessment.packageName,
                                summary: summary,
                                answers: answers,
                            };
                        } catch (error) {
                            console.error(`Failed to load assessment ${assessment.id}:`, error);
                            return null;
                        }
                    })
                );
                
                // null değerleri filtrele
                const validItems = historyItems.filter((item): item is HistoryItem => item !== null);
                
                // localStorage'dan da oku (fallback)
                const localHistory = getAssessmentHistory();
                
                // Birleştir ve duplicate'leri kaldır (backend öncelikli)
                const allHistory = [...validItems, ...localHistory];
                const uniqueHistory = allHistory.filter((item, index, self) => 
                    index === self.findIndex((t) => t.id === item.id)
                );
                
                // Tarihe göre sırala (en yeni önce)
                uniqueHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                
                // Pagination: offset 0 ise replace, değilse append
                if (offset === 0) {
                    setHistory(uniqueHistory);
                } else {
                    setHistory(prev => {
                        const combined = [...prev, ...uniqueHistory];
                        // Duplicate'leri kaldır
                        return combined.filter((item, index, self) => 
                            index === self.findIndex((t) => t.id === item.id)
                        );
                    });
                }
            } catch (error) {
                console.error('Failed to load history from backend:', error);
                // Fallback: localStorage'dan oku
                setHistory(getAssessmentHistory());
            } finally {
                setIsLoading(false);
            }
        };
        
        loadHistory();
    }, [api, offset]);
    
    const loadMore = () => {
        if (!isLoading && hasMore) {
            setOffset(prev => prev + LIMIT);
        }
    };

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

                {isLoading ? (
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <HistoryItemSkeleton key={i} />
                        ))}
                    </div>
                ) : history.length === 0 ? (
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
                        {hasMore && (
                            <div className="text-center mt-6">
                                <button
                                    onClick={loadMore}
                                    disabled={isLoading}
                                    className="bg-primary-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Chargement...' : 'Charger plus'}
                                </button>
                            </div>
                        )}
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

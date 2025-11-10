import React, { useState, useEffect, useRef } from 'react';
import { Summary, SummaryPoint, ActionPlanItem, Answer, DashboardData } from '../types';
import { findResourceLeads, analyzeThemesAndSkills } from '../services/geminiService';
import SkillsRadar from './SkillsRadar';

interface SummaryDashboardProps {
  summary: Summary;
  answers: Answer[];
  userName: string;
  packageName: string;
  onRestart: () => void;
  onViewHistory: () => void;
  isHistoryView?: boolean;
}

const SourceModal: React.FC<{ sources: string[], onClose: () => void }> = ({ sources, onClose }) => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold font-display text-primary-800 mb-4">Justification par vos réponses</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {sources.map((source, i) => <blockquote key={i} className="border-l-4 border-primary-300 pl-4 py-2 bg-slate-50 italic text-slate-700">"{source}"</blockquote>)}
            </div>
            <button onClick={onClose} className="mt-6 w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700">Fermer</button>
        </div>
    </div>
);

const CoachModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold font-display text-primary-800 mb-4">Discuter avec un coach</h3>
            <p className="text-slate-600 mb-4">Cette synthèse est un excellent point de départ pour une discussion approfondie avec un coach de carrière certifié.</p>
            <p className="text-slate-600">Utilisez ce document pour préparer votre entretien et maximiser la valeur de votre accompagnement.</p>
            <button onClick={onClose} className="mt-6 w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700">J'ai compris</button>
        </div>
    </div>
);

const ResourceModal: React.FC<{ item: ActionPlanItem, onClose: () => void }> = ({ item, onClose }) => {
    const [leads, setLeads] = useState<{ searchKeywords: string[], resourceTypes: string[], platformExamples: string[] } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLeads = async () => {
            setIsLoading(true);
            try {
                const result = await findResourceLeads(item.text);
                setLeads(result);
            } catch (error) { console.error("Failed to fetch resource leads:", error); }
            finally { setIsLoading(false); }
        };
        fetchLeads();
    }, [item]);

    return (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold font-display text-primary-800 mb-2">Pistes pour : "{item.text}"</h3>
                <p className="text-slate-600 mb-4">Voici un point de départ pour vos recherches. L'objectif est de vous guider, pas de faire le travail à votre place.</p>
                {isLoading ? <p>Recherche en cours...</p> : leads ? (
                    <div className="space-y-4">
                        <div><h4 className="font-semibold text-slate-700">Mots-clés à rechercher :</h4><p className="text-slate-600 text-sm">{leads.searchKeywords.join(', ')}</p></div>
                        <div><h4 className="font-semibold text-slate-700">Types de ressources à explorer :</h4><p className="text-slate-600 text-sm">{leads.resourceTypes.join(', ')}</p></div>
                        <div><h4 className="font-semibold text-slate-700">Exemples de plateformes :</h4><p className="text-slate-600 text-sm">{leads.platformExamples.join(', ')}</p></div>
                    </div>
                ) : <p>Impossible de trouver des pistes pour le moment.</p>}
                <button onClick={onClose} className="mt-6 w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700">Fermer</button>
            </div>
        </div>
    );
};

const ExportModal: React.FC<{ onExportJson: () => void, onExportCsv: () => void, onClose: () => void }> = ({ onExportJson, onExportCsv, onClose }) => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold font-display text-primary-800 mb-4">Exporter vos données</h3>
            <p className="text-slate-600 mb-6">Choisissez le format qui vous convient. Vos données vous appartiennent.</p>
            <div className="space-y-3">
                <button onClick={onExportJson} className="w-full text-left p-4 border rounded-lg hover:bg-slate-50"><strong>JSON</strong><p className="text-sm text-slate-500">Idéal pour la portabilité et la réutilisation technique.</p></button>
                <button onClick={onExportCsv} className="w-full text-left p-4 border rounded-lg hover:bg-slate-50"><strong>CSV</strong><p className="text-sm text-slate-500">Parfait pour ouvrir vos réponses dans un tableur.</p></button>
            </div>
            <button onClick={onClose} className="mt-6 w-full bg-slate-200 py-2 rounded-lg hover:bg-slate-300">Annuler</button>
        </div>
    </div>
);

const StrengthIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const DevelopmentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const RecommendationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
const ActionPlanIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const CoachIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.084-1.284-.24-1.88M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.084-1.284.24-1.88M12 12a3 3 0 100-6 3 3 0 000 6z" /></svg>;
const BenchmarkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;

const SummaryCard: React.FC<{ icon: React.ReactNode, title: string, children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-4"><span className="text-primary-600">{icon}</span><h2 className="text-xl font-bold font-display text-primary-800">{title}</h2></div>
        {children}
    </div>
);

const ActionItem: React.FC<{ item: ActionPlanItem, onToggle: (id: string) => void, onFindLeads: (item: ActionPlanItem) => void }> = ({ item, onToggle, onFindLeads }) => (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50">
        <input type="checkbox" checked={item.completed} onChange={() => onToggle(item.id)} className="mt-1 h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
        <div className="flex-1">
            <label className={`text-slate-700 ${item.completed ? 'line-through text-slate-400' : ''}`}>{item.text}</label>
            {!item.completed && <button onClick={() => onFindLeads(item)} className="text-xs text-primary-600 hover:underline">Trouver des pistes</button>}
        </div>
    </div>
);

const SummaryDashboard: React.FC<SummaryDashboardProps> = ({ summary, answers, userName, packageName, onRestart, onViewHistory, isHistoryView = false }) => {
    const [selectedSources, setSelectedSources] = useState<string[] | null>(null);
    const [isCoachModalOpen, setIsCoachModalOpen] = useState(false);
    const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
    const [selectedActionItem, setSelectedActionItem] = useState<ActionPlanItem | null>(null);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [actionPlan, setActionPlan] = useState(summary.actionPlan);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isDashboardLoading, setIsDashboardLoading] = useState(true);

    const ACTION_PLAN_STORAGE_KEY = `actionPlan-${userName}-${packageName}-${summary.profileType}`;

    useEffect(() => {
        if (!isHistoryView) {
            const savedPlan = localStorage.getItem(ACTION_PLAN_STORAGE_KEY);
            if (savedPlan) {
                setActionPlan(JSON.parse(savedPlan));
            }
        }
    }, [isHistoryView, ACTION_PLAN_STORAGE_KEY]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (answers && answers.length > 0) {
                setIsDashboardLoading(true);
                try {
                    const data = await analyzeThemesAndSkills(answers);
                    setDashboardData(data);
                } catch (error) {
                    console.error("Failed to analyze skills for summary:", error);
                } finally {
                    setIsDashboardLoading(false);
                }
            } else {
                 setIsDashboardLoading(false);
            }
        };

        fetchDashboardData();
    }, [answers]);

    useEffect(() => {
        if (!isHistoryView) {
            localStorage.setItem(ACTION_PLAN_STORAGE_KEY, JSON.stringify(actionPlan));
        }
    }, [actionPlan, isHistoryView, ACTION_PLAN_STORAGE_KEY]);
    
    const summaryRef = useRef<HTMLDivElement>(null);
    const [isPdfGenerating, setIsPdfGenerating] = useState(false);

    const handleDownloadPdf = async () => {
        const content = summaryRef.current;
        if (!content) {
            console.error('❌ PDF: Content not found');
            alert('Erreur: Contenu non trouvé pour le PDF');
            return;
        }

        // jspdf ve html2canvas kontrolü
        if (typeof window === 'undefined' || !(window as any).jspdf || !(window as any).html2canvas) {
            console.error('❌ PDF: jspdf veya html2canvas yüklenmemiş');
            alert('Erreur: Les bibliothèques PDF ne sont pas chargées. Veuillez rafraîchir la page.');
            return;
        }

        setIsPdfGenerating(true);
        try {
            console.log('📄 PDF oluşturuluyor...');
            
            // html2canvas ile screenshot al
            const canvas = await (window as any).html2canvas(content, { 
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#f1f5f9'
            });
            
            const imgData = canvas.toDataURL('image/png');
            console.log('✅ Canvas oluşturuldu, PDF oluşturuluyor...');
            
            // jsPDF ile PDF oluştur
            const { jsPDF } = (window as any).jspdf;
            const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / pdfWidth;
            const imgHeight = canvasHeight / ratio;

            let heightLeft = imgHeight;
            let position = 0;

            // İlk sayfa
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;

            // Ek sayfalar gerekirse
            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pdfHeight;
            }
            
            const fileName = `Bilan_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(fileName);
            console.log('✅ PDF indirildi:', fileName);
        } catch (error) {
            console.error('❌ PDF oluşturma hatası:', error);
            alert(`Erreur lors de la génération du PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        } finally {
            setIsPdfGenerating(false);
        }
    };

    const handleExportJson = () => {
        const data = { summary, answers };
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `Bilan_${userName.replace(' ', '_')}.json`;
        link.click();
        setIsExportModalOpen(false);
    };

    const handleExportCsv = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "question_id,answer_value\r\n";
        answers.forEach(row => {
            csvContent += `${row.questionId.replace(/"/g, '""')},"${row.value.replace(/"/g, '""')}"\r\n`;
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Reponses_Bilan_${userName.replace(' ', '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsExportModalOpen(false);
    };

    const handleToggleActionItem = (id: string) => {
        const newActionPlan = {
            shortTerm: actionPlan.shortTerm.map(item => item.id === id ? { ...item, completed: !item.completed } : item),
            mediumTerm: actionPlan.mediumTerm.map(item => item.id === id ? { ...item, completed: !item.completed } : item),
        };
        setActionPlan(newActionPlan);
    };

    const handleFindLeads = (item: ActionPlanItem) => {
        setSelectedActionItem(item);
        setIsResourceModalOpen(true);
    };

    return (
        <>
            {selectedSources && <SourceModal sources={selectedSources} onClose={() => setSelectedSources(null)} />}
            {isCoachModalOpen && <CoachModal onClose={() => setIsCoachModalOpen(false)} />}
            {isResourceModalOpen && selectedActionItem && <ResourceModal item={selectedActionItem} onClose={() => setIsResourceModalOpen(false)} />}
            {isExportModalOpen && <ExportModal onExportJson={handleExportJson} onExportCsv={handleExportCsv} onClose={() => setIsExportModalOpen(false)} />}

            <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
                <div ref={summaryRef} className="max-w-4xl mx-auto p-8 bg-slate-100 rounded-lg">
                    <header className="text-center mb-12 border-b pb-8">
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-primary-800 mb-3">Synthèse de votre Bilan</h1>
                        <p className="text-lg text-slate-600">{userName} - {packageName}</p>
                        <p className="text-slate-500 mt-4 max-w-2xl mx-auto">"{summary.profileType}"</p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <SummaryCard icon={<StrengthIcon/>} title="Vos Forces Clés">
                            <ul className="space-y-3">
                                {summary.keyStrengths.map((point: SummaryPoint, i) => (
                                    <li key={i} className="flex gap-2 items-start"><span className="text-secondary mt-1">✓</span><div>{point.text}<button onClick={() => setSelectedSources(point.sources)} className="text-xs text-primary-600 hover:underline ml-1">(Pourquoi ?)</button></div></li>
                                ))}
                            </ul>
                        </SummaryCard>

                         <SummaryCard icon={<DevelopmentIcon/>} title="Vos Axes de Développement">
                             <ul className="space-y-3">
                                {summary.areasForDevelopment.map((point: SummaryPoint, i) => (
                                    <li key={i} className="flex gap-2 items-start"><span className="text-amber-500 mt-1">→</span><div>{point.text}<button onClick={() => setSelectedSources(point.sources)} className="text-xs text-primary-600 hover:underline ml-1">(Pourquoi ?)</button></div></li>
                                ))}
                            </ul>
                        </SummaryCard>

                        <SummaryCard icon={<RecommendationIcon/>} title="Recommandations">
                            <ul className="space-y-3 list-disc list-inside text-slate-700">
                                {summary.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                            </ul>
                        </SummaryCard>
                        
                         <SummaryCard icon={<ActionPlanIcon/>} title="Plan d'Action">
                            <div><h3 className="font-semibold text-slate-800 mb-2">Court terme (1-3 mois)</h3><div className="divide-y">{actionPlan.shortTerm.map(item => <ActionItem key={item.id} item={item} onToggle={handleToggleActionItem} onFindLeads={handleFindLeads} />)}</div></div>
                            <div className="mt-4"><h3 className="font-semibold text-slate-800 mb-2">Moyen terme (3-6 mois)</h3><div className="divide-y">{actionPlan.mediumTerm.map(item => <ActionItem key={item.id} item={item} onToggle={handleToggleActionItem} onFindLeads={handleFindLeads} />)}</div></div>
                        </SummaryCard>
                        
                        <div className="md:col-span-2">
                            <SummaryCard icon={<BenchmarkIcon/>} title="Positionnement des Compétences">
                                <p className="text-sm text-slate-600 mb-4">Voici une visualisation de votre profil de compétences, basé sur vos réponses.</p>
                                {isDashboardLoading ? (
                                    <div className="text-center p-4"><p className="text-sm text-slate-500">Analyse des compétences en cours...</p></div>
                                ) : dashboardData && dashboardData.skills ? (
                                    <SkillsRadar data={dashboardData.skills} />
                                ) : (
                                    <div className="text-center p-4"><p className="text-sm text-slate-500">Les données de compétences ne sont pas disponibles.</p></div>
                                )}
                            </SummaryCard>
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto mt-8 flex flex-wrap justify-center items-center gap-4">
                     {!isHistoryView && <button onClick={onRestart} className="bg-primary-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-700">Refaire un bilan</button>}
                     <button onClick={onViewHistory} className="bg-slate-200 text-slate-700 font-bold py-3 px-8 rounded-lg hover:bg-slate-300">{isHistoryView ? "Retour à l'historique" : "Voir mon historique"}</button>
                     <button 
                        onClick={handleDownloadPdf} 
                        disabled={isPdfGenerating}
                        className="bg-secondary text-white font-bold py-3 px-8 rounded-lg hover:bg-secondary-600 disabled:bg-slate-400 disabled:cursor-not-allowed"
                     >
                        {isPdfGenerating ? 'Génération du PDF...' : 'Télécharger en PDF'}
                     </button>
                     <button onClick={() => setIsExportModalOpen(true)} className="text-sm text-slate-500 hover:text-primary-600">Exporter mes données</button>
                     <button onClick={() => setIsCoachModalOpen(true)} className="text-sm text-slate-500 hover:text-primary-600">Discuter avec un coach</button>
                </div>
            </div>
        </>
    );
};

export default SummaryDashboard;
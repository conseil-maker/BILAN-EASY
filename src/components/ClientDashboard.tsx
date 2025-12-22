import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { useToast } from './ToastProvider';
import { supabase } from '../lib/supabaseClient';
import { HistoryItem } from '../types-ai-studio';
import { downloadPDF } from '../utils/pdfGenerator';

interface ClientDashboardProps {
  user: User;
  onStartNewBilan: () => void;
  onContinueBilan?: () => void;
  onViewHistory: (record: HistoryItem) => void;
}

interface BilanStats {
  totalBilans: number;
  completedBilans: number;
  inProgressBilans: number;
  totalHours: number;
  lastActivity: string | null;
}

interface RecentDocument {
  id: string;
  type: string;
  name: string;
  downloadedAt: string;
}

type DashboardTab = 'overview' | 'history' | 'documents' | 'profile';

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  user,
  onStartNewBilan,
  onContinueBilan,
  onViewHistory,
}) => {
  const { showError, showSuccess } = useToast();
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [stats, setStats] = useState<BilanStats>({
    totalBilans: 0,
    completedBilans: 0,
    inProgressBilans: 0,
    totalHours: 0,
    lastActivity: null,
  });
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<RecentDocument[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentBilan, setCurrentBilan] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, [user.id]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Charger le profil
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(profileData);

      // Charger l'historique des bilans
      const { data: assessments } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (assessments) {
        const historyItems: HistoryItem[] = assessments.map(a => ({
          id: a.id,
          date: a.created_at,
          userName: profileData?.full_name || user.email?.split('@')[0] || 'Utilisateur',
          packageName: a.package_name,
          summary: a.summary,
          answers: a.answers || [],
        }));
        setHistory(historyItems);

        // Calculer les stats
        const completed = assessments.filter(a => a.status === 'completed').length;
        const inProgress = assessments.filter(a => a.status === 'in_progress').length;
        const totalHours = assessments.reduce((sum, a) => sum + (a.duration_hours || 0), 0);
        
        setStats({
          totalBilans: assessments.length,
          completedBilans: completed,
          inProgressBilans: inProgress,
          totalHours,
          lastActivity: assessments[0]?.updated_at || null,
        });

        // Vérifier s'il y a un bilan en cours
        const inProgressBilan = assessments.find(a => a.status === 'in_progress');
        setCurrentBilan(inProgressBilan);
      }

      // Charger les documents récents
      const { data: documents } = await supabase
        .from('document_downloads')
        .select('*')
        .eq('user_id', user.id)
        .order('downloaded_at', { ascending: false })
        .limit(5);

      if (documents) {
        setRecentDocuments(documents.map(d => ({
          id: d.id,
          type: d.document_type,
          name: d.document_name,
          downloadedAt: d.downloaded_at,
        })));
      }
    } catch (err) {
      console.error('Erreur chargement dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  // Charger aussi depuis localStorage pour l'historique local
  useEffect(() => {
    const localHistory = localStorage.getItem('bilanHistory');
    if (localHistory && history.length === 0) {
      try {
        const parsed = JSON.parse(localHistory);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
          setStats(prev => ({
            ...prev,
            totalBilans: parsed.length,
            completedBilans: parsed.length,
          }));
        }
      } catch (err) {
        console.error('Erreur parsing historique local:', err);
      }
    }
  }, []);

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
    { id: 'history', label: 'Historique', icon: '📜' },
    { id: 'documents', label: 'Documents', icon: '📁' },
    { id: 'profile', label: 'Profil', icon: '👤' },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
    return formatDate(dateString);
  };

  // Télécharger la synthèse PDF d'un bilan
  const handleDownloadPDF = async (item: HistoryItem) => {
    try {
      await downloadPDF(
        item.userName,
        item.packageName,
        item.answers || [],
        null // dashboardData sera généré à partir des réponses
      );
    } catch (error) {
      console.error('Erreur lors du téléchargement PDF:', error);
      showError('Une erreur est survenue lors du téléchargement du PDF.');
    }
  };

  // Exporter l'historique en Excel
  const handleExportExcel = () => {
    try {
      // Préparer les données pour Excel
      const data: string[][] = [
        ['Date', 'Forfait', 'Question', 'Réponse', 'Catégorie']
      ];
      
      history.forEach(item => {
        if (item.answers) {
          item.answers.forEach(answer => {
            data.push([
              formatDate(item.date),
              item.packageName,
              answer.question,
              answer.answer,
              answer.category || ''
            ]);
          });
        }
      });

      // Créer le contenu Excel (format TSV compatible)
      const excelContent = data.map(row => 
        row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join('\t')
      ).join('\n');
      
      // Télécharger le fichier
      const blob = new Blob([`\uFEFF${excelContent}`], { type: 'application/vnd.ms-excel;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `historique_bilan_${new Date().toISOString().split('T')[0]}.xls`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de l\'export Excel:', error);
      showError('Une erreur est survenue lors de l\'export Excel.');
    }
  };

  // Exporter l'historique en CSV
  const handleExportCSV = () => {
    try {
      // Préparer les données pour CSV
      const data: string[][] = [
        ['Date', 'Forfait', 'Question', 'Réponse', 'Catégorie']
      ];
      
      history.forEach(item => {
        if (item.answers) {
          item.answers.forEach(answer => {
            data.push([
              formatDate(item.date),
              item.packageName,
              answer.question,
              answer.answer,
              answer.category || ''
            ]);
          });
        }
      });

      // Créer le contenu CSV
      const csvContent = data.map(row => 
        row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(',')
      ).join('\n');
      
      // Télécharger le fichier
      const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `historique_bilan_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de l\'export CSV:', error);
      showError('Une erreur est survenue lors de l\'export CSV.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                Bonjour {profile?.full_name || user.email?.split('@')[0]} 👋
              </h1>
              <p className="text-indigo-100 mt-1">
                Bienvenue dans votre espace personnel Bilan-Easy
              </p>
            </div>
            <div className="flex gap-3">
              {currentBilan && onContinueBilan && (
                <button
                  onClick={onContinueBilan}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors"
                >
                  Continuer mon bilan
                </button>
              )}
              <button
                onClick={onStartNewBilan}
                className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
              >
                {stats.totalBilans === 0 ? 'Commencer mon bilan' : 'Nouveau bilan'}
              </button>
            </div>
          </div>

          {/* Stats rapides */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-3xl font-bold">{stats.totalBilans}</p>
              <p className="text-sm text-indigo-100">Bilans réalisés</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-3xl font-bold">{stats.completedBilans}</p>
              <p className="text-sm text-indigo-100">Bilans terminés</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-3xl font-bold">{stats.totalHours}h</p>
              <p className="text-sm text-indigo-100">Heures d'accompagnement</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-3xl font-bold">{recentDocuments.length}</p>
              <p className="text-sm text-indigo-100">Documents générés</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex gap-1 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-lg -mt-4 relative z-10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as DashboardTab)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Vue d'ensemble */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Bilan en cours */}
            {currentBilan && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-amber-800 dark:text-amber-200 flex items-center">
                      <span className="mr-2">⏳</span>
                      Bilan en cours
                    </h3>
                    <p className="text-amber-700 dark:text-amber-300 mt-1">
                      {currentBilan.package_name} - Commencé le {formatDate(currentBilan.created_at)}
                    </p>
                  </div>
                  {onContinueBilan && (
                    <button
                      onClick={onContinueBilan}
                      className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                    >
                      Continuer →
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Accès rapides */}
            <div className="grid md:grid-cols-3 gap-4">
              <a
                href="#/mes-documents"
                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <span className="text-3xl mb-3 block">📁</span>
                <h3 className="font-semibold text-gray-900 dark:text-white">Mes Documents</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Téléchargez vos documents officiels
                </p>
              </a>
              
              <a
                href="#/metiers"
                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <span className="text-3xl mb-3 block">💼</span>
                <h3 className="font-semibold text-gray-900 dark:text-white">Explorer les métiers</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Découvrez les métiers et formations
                </p>
              </a>
              
              <a
                href="#/satisfaction"
                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <span className="text-3xl mb-3 block">⭐</span>
                <h3 className="font-semibold text-gray-900 dark:text-white">Donner mon avis</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Évaluez votre expérience
                </p>
              </a>
            </div>

            {/* Dernière activité */}
            {stats.lastActivity && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Dernière activité
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {formatRelativeTime(stats.lastActivity)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Historique */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Historique de mes bilans
            </h2>
            
            {history.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
                <span className="text-4xl mb-4 block">📋</span>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Aucun bilan terminé
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Commencez votre premier bilan de compétences pour voir votre historique ici.
                </p>
                <button
                  onClick={onStartNewBilan}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Commencer mon bilan
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {item.packageName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {formatDate(item.date)}
                        </p>
                        {item.summary?.profileType && (
                          <span className="inline-block mt-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm">
                            {item.summary.profileType}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => onViewHistory(item)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Voir les résultats
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Documents */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Mes documents
            </h2>
            
            {/* Section Bilans terminés avec synthèse */}
            {history.filter(h => h.summary).length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span>📊</span> Synthèses de vos bilans
                </h3>
                <div className="space-y-3">
                  {history.filter(h => h.summary).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📄</span>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Synthèse - {item.packageName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(item.date)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownloadPDF(item)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Télécharger PDF
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section Export historique */}
            {history.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span>📝</span> Historique des échanges
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Exportez l'historique complet de vos échanges avec l'IA au format Excel.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleExportExcel()}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Exporter en Excel
                  </button>
                  <button
                    onClick={() => handleExportCSV()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Exporter en CSV
                  </button>
                </div>
              </div>
            )}

            {/* Documents récents */}
            {recentDocuments.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>📁</span> Documents récents
                  </h3>
                  <a
                    href="#/mes-documents"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
                  >
                    Voir tous →
                  </a>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {recentDocuments.map((doc) => (
                    <div key={doc.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">
                          {doc.type === 'convention' ? '📄' :
                           doc.type === 'attestation' ? '✅' :
                           doc.type === 'livret' ? '📘' :
                           doc.type === 'synthese' ? '📋' : '📎'}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{doc.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatRelativeTime(doc.downloadedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Message si aucun document */}
            {history.length === 0 && recentDocuments.length === 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
                <span className="text-4xl mb-4 block">📄</span>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Aucun document disponible
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Terminez votre premier bilan pour obtenir votre synthèse PDF et l'historique de vos échanges.
                </p>
                <button
                  onClick={onStartNewBilan}
                  className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Commencer mon bilan
                </button>
              </div>
            )}
          </div>
        )}

        {/* Profil */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Mon profil
            </h2>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-2xl">
                  👤
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                    {profile?.full_name || 'Non renseigné'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900 dark:text-white">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Membre depuis
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {formatDate(user.created_at)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                <strong>RGPD :</strong> Vous pouvez demander l'accès, la rectification ou la suppression 
                de vos données personnelles en nous contactant à rgpd@bilan-easy.fr
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;

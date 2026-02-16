import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { useTranslation } from 'react-i18next';
import { useToast } from './ToastProvider';
import { supabase } from '../lib/supabaseClient';
import { calculateProgression } from '../services/progressionService';
import { PACKAGES } from '../constants';
import { HistoryItem } from '../types-ai-studio';
import { syntheseService, SyntheseData } from '../services/syntheseService';
import { organizationConfig } from '../config/organization';
import { getTranslatedPackageName, translatePackageNameFromFrench } from '../utils/packageTranslations';

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
  const { t, i18n } = useTranslation('dashboard');
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
  
  // États pour l'édition du profil
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    birth_date: '',
    profession: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [changingPassword, setChangingPassword] = useState(false);
  const [showNewBilanModal, setShowNewBilanModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [user.id]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      setProfile(profileData);

      const { data: assessments } = await supabase
        .from('assessments')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      let inProgressBilan: any = null;

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

        inProgressBilan = assessments.find(a => a.status === 'in_progress');
        if (inProgressBilan) {
          setCurrentBilan(inProgressBilan);
        }
      }

      const { data: sessionData, error: sessionError } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('[Dashboard] Session data:', sessionData, 'Error:', sessionError);

      if (!inProgressBilan && sessionData && sessionData.current_answers?.length > 0) {
        const pkg = PACKAGES.find(p => p.id === sessionData.selected_package_id);
        const packageName = pkg ? getTranslatedPackageName(pkg.id, pkg.name) : t('bilanInProgress', 'Bilan en cours');
        
        const progressionInfo = calculateProgression(
          sessionData.current_answers || [],
          sessionData.selected_package_id || 'test',
          sessionData.user_profile || null
        );
        
        setCurrentBilan({
          id: 'session-' + (sessionData.id || user.id),
          package_name: packageName,
          created_at: sessionData.created_at || sessionData.updated_at || new Date().toISOString(),
          status: 'in_progress',
          answers_count: sessionData.current_answers?.length || 0,
          progress: progressionInfo.globalProgress,
          questions_target: progressionInfo.questionsTarget,
          current_phase: progressionInfo.currentPhase,
          from_session: true
        });
      }

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

  const startEditingProfile = () => {
    setEditedProfile({
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
      birth_date: profile?.birth_date || '',
      profession: profile?.profession || '',
    });
    setIsEditingProfile(true);
  };

  const cancelEditingProfile = () => {
    setIsEditingProfile(false);
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const fullName = [editedProfile.first_name, editedProfile.last_name].filter(Boolean).join(' ');
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...editedProfile,
          full_name: fullName,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      setProfile({ ...profile, ...editedProfile, full_name: fullName });
      setIsEditingProfile(false);
      showSuccess(t('profile.saveSuccess'));
    } catch (err) {
      console.error('Erreur sauvegarde profil:', err);
      showError(t('profile.saveError'));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      showError(t('security.passwordMismatch'));
      return;
    }
    if (passwordData.new.length < 6) {
      showError(t('security.passwordTooShort'));
      return;
    }
    
    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.new
      });

      if (error) throw error;

      showSuccess(t('security.passwordSuccess'));
      setShowPasswordModal(false);
      setPasswordData({ current: '', new: '', confirm: '' });
    } catch (err: any) {
      console.error('Erreur changement mot de passe:', err);
      showError(err.message || t('security.passwordError'));
    } finally {
      setChangingPassword(false);
    }
  };

  const handleNewBilanClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentBilan && currentBilan.progress < 100) {
      setShowNewBilanModal(true);
    } else {
      window.location.hash = '#/bilan?new=true';
    }
  };

  const handleConfirmNewBilan = () => {
    setShowNewBilanModal(false);
    window.location.hash = '#/bilan?new=true';
  };

  const handleContinueExistingBilan = () => {
    setShowNewBilanModal(false);
    window.location.hash = '#/bilan';
  };

  const tabs = [
    { id: 'overview', label: t('tabs.overview'), icon: '📊' },
    { id: 'history', label: t('tabs.history'), icon: '📜' },
    { id: 'documents', label: t('tabs.documents'), icon: '📁' },
    { id: 'profile', label: t('tabs.profile'), icon: '👤' },
  ];

  const locale = i18n.language === 'tr' ? 'tr-TR' : 'fr-FR';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
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
    
    if (diffDays === 0) return t('relativeTime.today');
    if (diffDays === 1) return t('relativeTime.yesterday');
    if (diffDays < 7) return t('relativeTime.daysAgo', { count: diffDays });
    if (diffDays < 30) return t('relativeTime.weeksAgo', { count: Math.floor(diffDays / 7) });
    return formatDate(dateString);
  };

  const handleDownloadPDF = async (item: HistoryItem) => {
    try {
      const syntheseData: SyntheseData = {
        userName: item.userName,
        userEmail: user.email || '',
        packageName: translatePackageNameFromFrench(item.packageName),
        startDate: formatDate(item.date),
        endDate: new Date().toLocaleDateString(locale),
        consultantName: organizationConfig.defaultConsultant.name,
        organizationName: organizationConfig.name,
        summary: item.summary || {
          profileType: '',
          themes: [],
          recommendations: [],
          actionPlan: []
        },
        answers: item.answers || [],
      };

      const blob = syntheseService.generateSynthese(syntheseData);
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `synthese-${item.userName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showSuccess(t('toasts.pdfSuccess'));
    } catch (error) {
      console.error('Erreur lors du téléchargement PDF:', error);
      showError(t('toasts.pdfError'));
    }
  };

  const handleExportExcel = () => {
    try {
      const headers = t('documents.excelHeaders', { returnObjects: true }) as any;
      const data: string[][] = [
        [headers.date, headers.package, headers.question, headers.answer, headers.category]
      ];
      
      history.forEach(item => {
        if (item.answers && item.answers.length > 0) {
          item.answers.forEach(answer => {
            data.push([
              formatDate(item.date),
              translatePackageNameFromFrench(item.packageName),
              answer.questionTitle || answer.questionId || '',
              answer.value || '',
              answer.categoryId || ''
            ]);
          });
        }
      });

      const excelContent = data.map(row => 
        row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join('\t')
      ).join('\n');
      
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
      showError(t('toasts.excelError'));
    }
  };

  const handleExportCSV = () => {
    try {
      const headers = t('documents.excelHeaders', { returnObjects: true }) as any;
      const data: string[][] = [
        [headers.date, headers.package, headers.question, headers.answer, headers.category]
      ];
      
      history.forEach(item => {
        if (item.answers && item.answers.length > 0) {
          item.answers.forEach(answer => {
            data.push([
              formatDate(item.date),
              translatePackageNameFromFrench(item.packageName),
              answer.questionTitle || answer.questionId || '',
              answer.value || '',
              answer.categoryId || ''
            ]);
          });
        }
      });

      const csvContent = data.map(row => 
        row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(',')
      ).join('\n');
      
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
      showError(t('toasts.csvError'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">{t('loading')}</p>
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
                {t('greeting', { name: profile?.full_name || user.email?.split('@')[0] })}
              </h1>
              <p className="text-indigo-100 mt-1">
                {t('subtitle')}
              </p>
            </div>
            <div className="flex gap-3">
              {currentBilan && currentBilan.progress < 100 && onContinueBilan && (
                <button
                  onClick={onContinueBilan}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors"
                >
                  {t('actions.continueBilan')}
                </button>
              )}
              <button
                onClick={handleNewBilanClick}
                className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
              >
                {stats.totalBilans === 0 ? t('actions.startBilan') : t('actions.newBilan')}
              </button>
            </div>
          </div>

          {/* Stats rapides */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-3xl font-bold">{stats.totalBilans}</p>
              <p className="text-sm text-indigo-100">{t('stats.totalBilans')}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-3xl font-bold">{stats.completedBilans}</p>
              <p className="text-sm text-indigo-100">{t('stats.completedBilans')}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-3xl font-bold">{stats.totalHours}h</p>
              <p className="text-sm text-indigo-100">{t('stats.totalHours')}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-3xl font-bold">{recentDocuments.length}</p>
              <p className="text-sm text-indigo-100">{t('stats.documentsGenerated')}</p>
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
            {currentBilan && currentBilan.progress < 100 && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-800 dark:text-amber-200 flex items-center text-lg">
                      <span className="mr-2">⏳</span>
                      {t('currentBilan.title')}
                    </h3>
                    <p className="text-amber-700 dark:text-amber-300 mt-1">
                      {currentBilan.package_name || 'Bilan de compétences'} - {t('currentBilan.startedOn', { date: formatDate(currentBilan.created_at) })}
                    </p>
                    {(currentBilan.answers_count || currentBilan.progress) && (
                      <div className="mt-3">
                        <div className="flex items-center gap-4 text-sm text-amber-600 dark:text-amber-400">
                          {currentBilan.answers_count && (
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                              {t('currentBilan.answers', { count: currentBilan.answers_count })}
                            </span>
                          )}
                          {currentBilan.progress > 0 && (
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                              {t('currentBilan.completed', { percent: Math.round(currentBilan.progress) })}
                            </span>
                          )}
                        </div>
                        <div className="mt-2 h-2 bg-amber-200 dark:bg-amber-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                            style={{ width: `${Math.max(5, currentBilan.progress || 0)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  {onContinueBilan && (
                    <button
                      onClick={onContinueBilan}
                      className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                    >
                      {t('actions.continue')}
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
                <h3 className="font-semibold text-gray-900 dark:text-white">{t('quickAccess.documents')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t('quickAccess.documentsDesc')}
                </p>
              </a>
              
              <a
                href="#/rendez-vous"
                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <span className="text-3xl mb-3 block">📅</span>
                <h3 className="font-semibold text-gray-900 dark:text-white">{t('quickAccess.appointments')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t('quickAccess.appointmentsDesc')}
                </p>
              </a>
              
              <a
                href="#/satisfaction"
                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <span className="text-3xl mb-3 block">⭐</span>
                <h3 className="font-semibold text-gray-900 dark:text-white">{t('quickAccess.feedback')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t('quickAccess.feedbackDesc')}
                </p>
              </a>
            </div>

            {stats.lastActivity && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  {t('lastActivity')}
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
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('history.title')}
            </h2>

            {currentBilan && currentBilan.progress < 100 && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-300 dark:border-amber-700 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">⏳</span>
                  <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200">
                    {t('currentBilan.title')}
                  </h3>
                  <span className="px-2 py-1 bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 text-xs font-medium rounded-full">
                    {t('currentBilan.active')}
                  </span>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {translatePackageNameFromFrench(currentBilan.package_name) || t('bilanDeCompetences', 'Bilan de compétences')}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {t('currentBilan.startedOn', { date: formatDate(currentBilan.created_at) })}
                      </p>
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center flex-wrap gap-4 text-sm">
                          {currentBilan.answers_count > 0 && (
                            <span className="flex items-center gap-1 text-amber-700 dark:text-amber-300">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                              {currentBilan.questions_target 
                                ? t('currentBilan.answersWithTarget', { count: currentBilan.answers_count, target: currentBilan.questions_target })
                                : t('currentBilan.answers', { count: currentBilan.answers_count })}
                            </span>
                          )}
                          {currentBilan.progress >= 0 && (
                            <span className="flex items-center gap-1 text-amber-700 dark:text-amber-300">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                              {t('currentBilan.completed', { percent: Math.round(currentBilan.progress) })}
                            </span>
                          )}
                          {currentBilan.current_phase && (
                            <span className="flex items-center gap-1 text-amber-700 dark:text-amber-300">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              {currentBilan.current_phase === 'phase1' ? t('currentBilan.phase1') : 
                               currentBilan.current_phase === 'phase2' ? t('currentBilan.phase2') : 
                               t('currentBilan.phase3')}
                            </span>
                          )}
                        </div>
                        <div className="h-2 bg-amber-200 dark:bg-amber-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(currentBilan.progress || 0, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <a
                      href="#/bilan"
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {t('actions.resume')}
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Section Bilans terminés */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span>✅</span> {t('history.completedTitle')}
              </h3>
              
              {history.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
                  <span className="text-4xl mb-4 block">📋</span>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {t('history.noCompleted')}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {currentBilan 
                      ? t('history.noCompletedWithCurrent')
                      : t('history.noCompletedNoCurrent')
                    }
                  </p>
                  {!currentBilan && (
                    <a
                      href="#/bilan"
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors inline-block"
                    >
                      {t('actions.startBilan')}
                    </a>
                  )}
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
                          {translatePackageNameFromFrench(item.packageName)}
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
                        {t('actions.viewResults')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>
          </div>
        )}

        {/* Documents */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('documents.title')}
            </h2>
            
            {history.filter(h => h.summary).length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span>📊</span> {t('documents.synthesisTitle')}
                </h3>
                <div className="space-y-3">
                  {history.filter(h => h.summary).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📄</span>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {t('documents.synthesisItem', { name: translatePackageNameFromFrench(item.packageName) })}
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
                        {t('documents.downloadPdf')}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {history.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span>📝</span> {t('documents.exchangeHistory')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {t('documents.exchangeDesc')}
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleExportExcel()}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {t('documents.exportExcel')}
                  </button>
                  <button
                    onClick={() => handleExportCSV()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {t('documents.exportCsv')}
                  </button>
                </div>
              </div>
            )}

            {recentDocuments.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>📁</span> {t('documents.recentDocs')}
                  </h3>
                  <a
                    href="#/mes-documents"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
                  >
                    {t('documents.viewAll')}
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

            {history.length === 0 && recentDocuments.length === 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
                <span className="text-4xl mb-4 block">📄</span>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('documents.noDocuments')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {t('documents.noDocumentsDesc')}
                </p>
                <a
                  href="#/bilan"
                  className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {t('actions.startBilan')}
                </a>
              </div>
            )}
          </div>
        )}

        {/* Profil */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('profile.title')}
              </h2>
              {!isEditingProfile && (
                <button
                  onClick={startEditingProfile}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <span>✏️</span> {t('profile.edit')}
                </button>
              )}
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              {!isEditingProfile ? (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-2xl">
                      👤
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                        {profile?.full_name || t('profile.notProvided')}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
                        {t('profile.fields.email')}
                      </label>
                      <p className="text-gray-900 dark:text-white">{user.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
                        {t('profile.fields.phone')}
                      </label>
                      <p className="text-gray-900 dark:text-white">{profile?.phone || t('profile.notProvided')}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
                        {t('profile.fields.profession')}
                      </label>
                      <p className="text-gray-900 dark:text-white">{profile?.profession || t('profile.notProvided')}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
                        {t('profile.fields.address')}
                      </label>
                      <p className="text-gray-900 dark:text-white">{profile?.address || t('profile.notProvided')}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
                        {t('profile.fields.birthDate')}
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {profile?.birth_date ? formatDate(profile.birth_date) : t('profile.notProvided')}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
                        {t('profile.fields.memberSince')}
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {formatDate(user.created_at)}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('profile.fields.firstName')}
                      </label>
                      <input
                        type="text"
                        value={editedProfile.first_name}
                        onChange={(e) => setEditedProfile({ ...editedProfile, first_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        placeholder={t('profile.placeholders.firstName')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('profile.fields.lastName')}
                      </label>
                      <input
                        type="text"
                        value={editedProfile.last_name}
                        onChange={(e) => setEditedProfile({ ...editedProfile, last_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        placeholder={t('profile.placeholders.lastName')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('profile.fields.phone')}
                      </label>
                      <input
                        type="tel"
                        value={editedProfile.phone}
                        onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        placeholder={t('profile.placeholders.phone')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('profile.fields.profession')}
                      </label>
                      <input
                        type="text"
                        value={editedProfile.profession}
                        onChange={(e) => setEditedProfile({ ...editedProfile, profession: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        placeholder={t('profile.placeholders.profession')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('profile.fields.birthDate')}
                      </label>
                      <input
                        type="date"
                        value={editedProfile.birth_date}
                        onChange={(e) => setEditedProfile({ ...editedProfile, birth_date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('profile.fields.address')}
                      </label>
                      <input
                        type="text"
                        value={editedProfile.address}
                        onChange={(e) => setEditedProfile({ ...editedProfile, address: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        placeholder={t('profile.placeholders.address')}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={cancelEditingProfile}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      {t('profile.cancel')}
                    </button>
                    <button
                      onClick={saveProfile}
                      disabled={savingProfile}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {savingProfile ? (
                        <>
                          <span className="animate-spin">⏳</span> {t('profile.saving')}
                        </>
                      ) : (
                        <>
                          <span>✔️</span> {t('profile.save')}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Section Sécurité */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span>🔒</span> {t('security.title')}
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-900 dark:text-white font-medium">{t('security.password')}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('security.passwordDesc')}</p>
                </div>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {t('security.change')}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                <strong>{t('rgpd.label')} :</strong> {t('rgpd.message')}
              </p>
            </div>
          </div>
        )}

        {/* Modal confirmation nouveau bilan */}
        {showNewBilanModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full shadow-2xl">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('confirmNewBilan.title')}
                </h3>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">⏳</span>
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-200">
                      {currentBilan?.package_name || 'Bilan de compétences'}
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      {t('confirmNewBilan.answers', { count: currentBilan?.answers_count || 0 })} • {t('confirmNewBilan.percentCompleted', { percent: Math.round(currentBilan?.progress || 0) })}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6" dangerouslySetInnerHTML={{ __html: t('confirmNewBilan.warningMessage') }} />

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleContinueExistingBilan}
                  className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t('confirmNewBilan.resumeCurrent')}
                </button>
                <button
                  onClick={handleConfirmNewBilan}
                  className="w-full px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                >
                  {t('confirmNewBilan.abandonAndRestart')}
                </button>
                <button
                  onClick={() => setShowNewBilanModal(false)}
                  className="w-full px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors text-sm"
                >
                  {t('confirmNewBilan.cancel')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal changement de mot de passe */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('security.changePassword')}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('security.newPassword')}
                  </label>
                  <input
                    type="password"
                    value={passwordData.new}
                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder={t('security.newPasswordPlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('security.confirmPassword')}
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder={t('security.confirmPasswordPlaceholder')}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({ current: '', new: '', confirm: '' });
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {t('profile.cancel')}
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={changingPassword || !passwordData.new || !passwordData.confirm}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {changingPassword ? t('security.changing') : t('security.change')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Assessment } from '../lib/supabaseClient';
import { supabase } from '../lib/supabaseClient';
import { ConsultantNotes } from './ConsultantNotes';

interface AssessmentDetailViewProps {
  assessment: Assessment;
  onBack: () => void;
  isConsultantView?: boolean;
}

export const AssessmentDetailView: React.FC<AssessmentDetailViewProps> = ({ 
  assessment, 
  onBack,
  isConsultantView = false 
}) => {
  const { t } = useTranslation('consultant');
  const [activeTab, setActiveTab] = useState<'overview' | 'cv' | 'questionnaire' | 'summary'>('overview');
  const [clientInfo, setClientInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClientInfo();
  }, [assessment]);

  const loadClientInfo = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('id', assessment.client_id)
        .single();
      
      if (error) throw error;
      setClientInfo(data);
    } catch (error) {
      console.error('Erreur lors du chargement des infos client:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: { bg: 'bg-slate-100', text: 'text-slate-800', label: t('status.notStarted') },
      in_progress: { bg: 'bg-orange-100', text: 'text-orange-800', label: t('status.inProgress') },
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: t('status.completed') },
      archived: { bg: 'bg-slate-100', text: 'text-slate-600', label: t('status.completed') }
    };
    
    const badge = badges[status as keyof typeof badges] || badges.draft;
    
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-slate-800 mb-4">{t('detail.generalInfo')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-500">{t('detail.bilanTitle')}</p>
            <p className="font-semibold text-slate-900">{assessment.title}</p>
          </div>
          {isConsultantView && clientInfo && (
            <div>
              <p className="text-sm text-slate-500">{t('table.client')}</p>
              <p className="font-semibold text-slate-900">{clientInfo.full_name || clientInfo.email}</p>
              {clientInfo.full_name && (
                <p className="text-xs text-slate-500">{clientInfo.email}</p>
              )}
            </div>
          )}
          <div>
            <p className="text-sm text-slate-500">{t('detail.coachingStyle')}</p>
            <p className="font-semibold text-slate-900">
              {assessment.coaching_style === 'collaborative' ? t('detail.collaborative') :
               assessment.coaching_style === 'analytical' ? t('detail.analytical') : t('detail.creative')}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">{t('table.status')}</p>
            <div className="mt-1">{getStatusBadge(assessment.status)}</div>
          </div>
          <div>
            <p className="text-sm text-slate-500">{t('detail.creationDate')}</p>
            <p className="font-semibold text-slate-900">
              {new Date(assessment.created_at).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          {assessment.completed_at && (
            <div>
              <p className="text-sm text-slate-500">{t('detail.completionDate')}</p>
              <p className="font-semibold text-slate-900">
                {new Date(assessment.completed_at).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderCVAnalysis = () => {
    if (!assessment.cv_analysis) {
      return (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-slate-600">
          {t('detail.noCVAnalysis')}
        </div>
      );
    }

    const cvData = assessment.cv_analysis;

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4">{t('detail.cvAnalysis')}</h3>
          
          {cvData.experience && (
            <div className="mb-6">
              <h4 className="font-semibold text-slate-700 mb-2">{t('detail.experience')}</h4>
              <p className="text-slate-600 whitespace-pre-wrap">{cvData.experience}</p>
            </div>
          )}
          
          {cvData.skills && (
            <div className="mb-6">
              <h4 className="font-semibold text-slate-700 mb-2">{t('detail.skills')}</h4>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(cvData.skills) ? (
                  cvData.skills.map((skill: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-slate-600">{cvData.skills}</p>
                )}
              </div>
            </div>
          )}
          
          {cvData.education && (
            <div className="mb-6">
              <h4 className="font-semibold text-slate-700 mb-2">{t('detail.education')}</h4>
              <p className="text-slate-600 whitespace-pre-wrap">{cvData.education}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderQuestionnaire = () => {
    if (!assessment.questionnaire_data || !assessment.questionnaire_data.answers) {
      return (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-slate-600">
          {t('detail.noQuestionnaire')}
        </div>
      );
    }

    const answers = assessment.questionnaire_data.answers;

    return (
      <div className="space-y-4">
        {answers.map((answer: any, index: number) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <p className="font-semibold text-slate-800 mb-2">{answer.question}</p>
            <p className="text-slate-600">{answer.answer}</p>
          </div>
        ))}
      </div>
    );
  };

  const renderSummary = () => {
    if (!assessment.summary_data) {
      return (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-slate-600">
          {t('detail.noSummary')}
        </div>
      );
    }

    const summary = assessment.summary_data;

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4">{t('detail.summary')}</h3>
          
          {summary.profileType && (
            <div className="mb-6">
              <h4 className="font-semibold text-slate-700 mb-2">{t('detail.profileType')}</h4>
              <p className="text-lg text-primary-600 font-semibold">{summary.profileType}</p>
            </div>
          )}
          
          {summary.strengths && summary.strengths.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-slate-700 mb-2">{t('detail.strengths')}</h4>
              <ul className="list-disc list-inside space-y-1">
                {summary.strengths.map((strength: string, index: number) => (
                  <li key={index} className="text-slate-600">{strength}</li>
                ))}
              </ul>
            </div>
          )}
          
          {summary.areasForDevelopment && summary.areasForDevelopment.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-slate-700 mb-2">{t('detail.development')}</h4>
              <ul className="list-disc list-inside space-y-1">
                {summary.areasForDevelopment.map((area: string, index: number) => (
                  <li key={index} className="text-slate-600">{area}</li>
                ))}
              </ul>
            </div>
          )}
          
          {summary.recommendations && summary.recommendations.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-slate-700 mb-2">{t('detail.recommendations')}</h4>
              <ul className="list-disc list-inside space-y-1">
                {summary.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="text-slate-600">{rec}</li>
                ))}
              </ul>
            </div>
          )}
          
          {summary.actionPlan && summary.actionPlan.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-700 mb-2">{t('detail.actionPlan')}</h4>
              <div className="space-y-3">
                {summary.actionPlan.map((action: any, index: number) => (
                  <div key={index} className="border-l-4 border-primary-500 pl-4 py-2">
                    <p className="font-medium text-slate-800">{action.action || action}</p>
                    {action.timeline && (
                      <p className="text-sm text-slate-500 mt-1">Échéance : {action.timeline}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="text-primary-600 hover:text-primary-700 font-medium mb-4 flex items-center"
          >
            ← Retour
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">{assessment.title}</h1>
              {isConsultantView && clientInfo && (
                <p className="text-slate-600 mt-1">
                  Client : {clientInfo.full_name || clientInfo.email}
                </p>
              )}
            </div>
            {getStatusBadge(assessment.status)}
          </div>
        </div>

        {/* Onglets */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-slate-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {t('tabs.overview')}
              </button>
              <button
                onClick={() => setActiveTab('cv')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'cv'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {t('detail.cvAnalysis')}
              </button>
              <button
                onClick={() => setActiveTab('questionnaire')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'questionnaire'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {t('detail.questionnaire')}
              </button>
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'summary'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {t('detail.summary')}
              </button>
            </nav>
          </div>
        </div>

        {/* Contenu */}
        <div className="space-y-6">
          <div>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'cv' && renderCVAnalysis()}
            {activeTab === 'questionnaire' && renderQuestionnaire()}
            {activeTab === 'summary' && renderSummary()}
          </div>
          
          {/* Notes du consultant (visible uniquement pour les consultants) */}
          {isConsultantView && (
            <ConsultantNotes assessmentId={assessment.id} />
          )}
        </div>
      </div>
    </div>
  );
};

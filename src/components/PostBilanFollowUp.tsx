import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar, Mail, Bell, CheckCircle, Clock, Target,
  TrendingUp, MessageSquare, FileText, ArrowRight,
  Loader2, AlertCircle, X
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface FollowUpData {
  id: string;
  user_id: string;
  bilan_id: string;
  scheduled_date: string;
  type: 'email_3_months' | 'email_6_months' | 'survey' | 'meeting';
  status: 'pending' | 'sent' | 'completed' | 'skipped';
  created_at: string;
  completed_at?: string;
  notes?: string;
}

interface FollowUpSurveyResponse {
  projectRealized: 'yes' | 'partial' | 'no' | 'changed';
  currentSituation: string;
  actionsCompleted: string[];
  obstacles: string[];
  needsSupport: boolean;
  satisfactionScore: number;
  comments: string;
}

interface PostBilanFollowUpProps {
  userId: string;
  bilanId: string;
  userName: string;
  userEmail: string;
  projectTitle: string;
  bilanEndDate: Date;
  onClose: () => void;
}

export const PostBilanFollowUp: React.FC<PostBilanFollowUpProps> = ({
  userId,
  bilanId,
  userName,
  userEmail,
  projectTitle,
  bilanEndDate,
  onClose
}) => {
  const { t } = useTranslation('followup');
  const [followUps, setFollowUps] = useState<FollowUpData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSurvey, setShowSurvey] = useState(false);
  const [surveyResponse, setSurveyResponse] = useState<Partial<FollowUpSurveyResponse>>({
    actionsCompleted: [],
    obstacles: [],
    satisfactionScore: 5
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadFollowUps();
  }, [bilanId]);

  const loadFollowUps = async () => {
    setIsLoading(true);
    try {
      // Vérifier si des suivis existent déjà
      const { data: existingFollowUps, error } = await supabase
        .from('bilan_follow_ups')
        .select('*')
        .eq('bilan_id', bilanId)
        .order('scheduled_date', { ascending: true });

      if (error) {
        // Si la table n'existe pas, utiliser des données locales
        if (error.code === '42P01' || error.message?.includes('does not exist') || error.code === 'PGRST116') {
          console.warn('Table bilan_follow_ups not found, using local data');
          createLocalFollowUpSchedule();
        } else {
          console.error('Error loading follow-ups:', error);
          createLocalFollowUpSchedule();
        }
      } else if (existingFollowUps && existingFollowUps.length > 0) {
        setFollowUps(existingFollowUps);
      } else {
        // Créer les suivis planifiés
        await createFollowUpSchedule();
      }
    } catch (err) {
      console.error('Error:', err);
      createLocalFollowUpSchedule();
    } finally {
      setIsLoading(false);
    }
  };

  // Créer un planning de suivi local (quand la table Supabase n'existe pas)
  const createLocalFollowUpSchedule = () => {
    const endDate = new Date(bilanEndDate);
    const localFollowUps: FollowUpData[] = [
      {
        id: `local-3m-${bilanId}`,
        user_id: userId,
        bilan_id: bilanId,
        scheduled_date: new Date(endDate.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'email_3_months',
        status: 'pending',
        created_at: new Date().toISOString()
      },
      {
        id: `local-6m-${bilanId}`,
        user_id: userId,
        bilan_id: bilanId,
        scheduled_date: new Date(endDate.getTime() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'email_6_months',
        status: 'pending',
        created_at: new Date().toISOString()
      }
    ];
    setFollowUps(localFollowUps);
  };

  const createFollowUpSchedule = async () => {
    const endDate = new Date(bilanEndDate);
    
    const scheduledFollowUps: Omit<FollowUpData, 'id' | 'created_at'>[] = [
      {
        user_id: userId,
        bilan_id: bilanId,
        scheduled_date: new Date(endDate.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString(), // +3 mois
        type: 'email_3_months',
        status: 'pending'
      },
      {
        user_id: userId,
        bilan_id: bilanId,
        scheduled_date: new Date(endDate.getTime() + 180 * 24 * 60 * 60 * 1000).toISOString(), // +6 mois
        type: 'email_6_months',
        status: 'pending'
      }
    ];

    try {
      const { data, error } = await supabase
        .from('bilan_follow_ups')
        .insert(scheduledFollowUps)
        .select();

      if (error) {
        console.error('Error creating follow-ups:', error);
        // Créer des données locales si la table n'existe pas
        const localFollowUps = scheduledFollowUps.map((fu, idx) => ({
          ...fu,
          id: `local-${idx}`,
          created_at: new Date().toISOString()
        }));
        setFollowUps(localFollowUps as FollowUpData[]);
      } else if (data) {
        setFollowUps(data);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleSurveySubmit = async () => {
    setIsSubmitting(true);
    try {
      // Sauvegarder la réponse au questionnaire de suivi
      const { error } = await supabase
        .from('follow_up_surveys')
        .insert({
          user_id: userId,
          bilan_id: bilanId,
          response: surveyResponse,
          submitted_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving survey:', error);
      }

      // Marquer le suivi comme complété
      setShowSurvey(false);
      alert(t('survey.thankYou'));
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'sent':
        return <Mail className="w-5 h-5 text-blue-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'email_3_months':
        return t('types.email_3_months');
      case 'email_6_months':
        return t('types.email_6_months');
      case 'survey':
        return t('types.survey');
      case 'meeting':
        return t('types.meeting');
      default:
        return type;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
            <p className="text-gray-600">{t('loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-cyan-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                📅 {t('title')}
              </h2>
              <p className="text-teal-100">
                {t('legalRef')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Informations du bilan */}
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-4 border border-teal-100">
            <div className="flex items-center space-x-3 mb-3">
              <Target className="w-6 h-6 text-teal-600" />
              <h3 className="font-semibold text-gray-800">{t('project.title')}</h3>
            </div>
            <p className="text-gray-700 font-medium">{projectTitle || t('project.default')}</p>
            <p className="text-sm text-gray-500 mt-2">
              {t('project.completedOn', { date: formatDate(bilanEndDate.toISOString()) })}
            </p>
          </div>

          {/* Timeline des suivis */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <Bell className="w-5 h-5 mr-2 text-indigo-600" />
              {t('timeline.title')}
            </h3>
            
            <div className="space-y-4">
              {followUps.map((followUp, index) => (
                <div 
                  key={followUp.id}
                  className={`flex items-start space-x-4 p-4 rounded-lg border ${
                    followUp.status === 'completed' 
                      ? 'bg-green-50 border-green-200' 
                      : followUp.status === 'sent'
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {getStatusIcon(followUp.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {getTypeLabel(followUp.type)}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {t('timeline.scheduledFor', { date: formatDate(followUp.scheduled_date) })}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        followUp.status === 'completed' 
                          ? 'bg-green-100 text-green-700' 
                          : followUp.status === 'sent'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {followUp.status === 'completed' ? t('timeline.completed') : 
                         followUp.status === 'sent' ? t('timeline.sent') : t('timeline.pending')}
                      </span>
                    </div>
                    {followUp.notes && (
                      <p className="text-sm text-gray-600 mt-2">{followUp.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bouton pour remplir le questionnaire de suivi */}
          {!showSurvey && (
            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-indigo-800">{t('survey.title')}</h4>
                  <p className="text-sm text-indigo-600">
                    {t('survey.subtitle')}
                  </p>
                </div>
                <button
                  onClick={() => setShowSurvey(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>{t('survey.fill')}</span>
                </button>
              </div>
            </div>
          )}

          {/* Questionnaire de suivi */}
          {showSurvey && (
            <div className="border rounded-xl p-4 space-y-4">
              <h4 className="font-semibold text-gray-800 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-indigo-600" />
                {t('survey.title')}
              </h4>

              {/* Question 1 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('survey.q1Label')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'yes', label: t('survey.q1Yes') },
                    { value: 'partial', label: t('survey.q1Partial') },
                    { value: 'no', label: t('survey.q1No') },
                    { value: 'changed', label: t('survey.q1Changed') }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setSurveyResponse(prev => ({ ...prev, projectRealized: option.value as any }))}
                      className={`p-2 text-sm rounded-lg border transition-colors ${
                        surveyResponse.projectRealized === option.value
                          ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('survey.q2Label')}
                </label>
                <textarea
                  value={surveyResponse.currentSituation || ''}
                  onChange={(e) => setSurveyResponse(prev => ({ ...prev, currentSituation: e.target.value }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder={t('survey.q2Placeholder')}
                />
              </div>

              {/* Question 3 - Satisfaction */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('survey.q3Label')}
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
                    <button
                      key={score}
                      onClick={() => setSurveyResponse(prev => ({ ...prev, satisfactionScore: score }))}
                      className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                        surveyResponse.satisfactionScore === score
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 4 - Besoin de support */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('survey.q4Label')}
                </label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setSurveyResponse(prev => ({ ...prev, needsSupport: true }))}
                    className={`flex-1 p-3 rounded-lg border transition-colors ${
                      surveyResponse.needsSupport === true
                        ? 'bg-indigo-100 border-indigo-500'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {t('survey.q4Yes')}
                  </button>
                  <button
                    onClick={() => setSurveyResponse(prev => ({ ...prev, needsSupport: false }))}
                    className={`flex-1 p-3 rounded-lg border transition-colors ${
                      surveyResponse.needsSupport === false
                        ? 'bg-indigo-100 border-indigo-500'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {t('survey.q4No')}
                  </button>
                </div>
              </div>

              {/* Question 5 - Commentaires */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('survey.q5Label')}
                </label>
                <textarea
                  value={surveyResponse.comments || ''}
                  onChange={(e) => setSurveyResponse(prev => ({ ...prev, comments: e.target.value }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows={2}
                  placeholder={t('survey.q5Placeholder')}
                />
              </div>

              {/* Boutons */}
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={handleSurveySubmit}
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>{t('survey.submit')}</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowSurvey(false)}
                  className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  {t('survey.cancel')}
                </button>
              </div>
            </div>
          )}

          {/* Informations légales */}
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            <p className="font-medium text-gray-700 mb-2">📋 {t('legal.title')}</p>
            <p>{t('legal.text')}</p>
          </div>

          {/* Bouton fermer */}
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostBilanFollowUp;

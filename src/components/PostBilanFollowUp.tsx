import React, { useState, useEffect } from 'react';
import {
  Calendar, Mail, Bell, CheckCircle, Clock, Target,
  TrendingUp, MessageSquare, FileText, ArrowRight,
  Loader2, AlertCircle, X
} from 'lucide-react';
import { supabase } from '../lib/supabase';

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

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading follow-ups:', error);
      }

      if (existingFollowUps && existingFollowUps.length > 0) {
        setFollowUps(existingFollowUps);
      } else {
        // Créer les suivis planifiés
        await createFollowUpSchedule();
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
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
      alert('Merci pour votre retour ! Vos réponses nous aident à améliorer notre accompagnement.');
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
        return 'Suivi à 3 mois';
      case 'email_6_months':
        return 'Suivi à 6 mois';
      case 'survey':
        return 'Questionnaire de suivi';
      case 'meeting':
        return 'Entretien de suivi';
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
            <p className="text-gray-600">Chargement du suivi...</p>
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
                📅 Suivi Post-Bilan
              </h2>
              <p className="text-teal-100">
                Conformément à l'article R.6313-4 du Code du travail
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
              <h3 className="font-semibold text-gray-800">Votre projet professionnel</h3>
            </div>
            <p className="text-gray-700 font-medium">{projectTitle || 'Projet en cours de définition'}</p>
            <p className="text-sm text-gray-500 mt-2">
              Bilan terminé le {formatDate(bilanEndDate.toISOString())}
            </p>
          </div>

          {/* Timeline des suivis */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <Bell className="w-5 h-5 mr-2 text-indigo-600" />
              Calendrier de suivi
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
                          Prévu le {formatDate(followUp.scheduled_date)}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        followUp.status === 'completed' 
                          ? 'bg-green-100 text-green-700' 
                          : followUp.status === 'sent'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {followUp.status === 'completed' ? 'Complété' : 
                         followUp.status === 'sent' ? 'Envoyé' : 'En attente'}
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
                  <h4 className="font-medium text-indigo-800">Questionnaire de suivi</h4>
                  <p className="text-sm text-indigo-600">
                    Partagez l'avancement de votre projet professionnel
                  </p>
                </div>
                <button
                  onClick={() => setShowSurvey(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>Remplir</span>
                </button>
              </div>
            </div>
          )}

          {/* Questionnaire de suivi */}
          {showSurvey && (
            <div className="border rounded-xl p-4 space-y-4">
              <h4 className="font-semibold text-gray-800 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-indigo-600" />
                Questionnaire de suivi
              </h4>

              {/* Question 1 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Où en êtes-vous dans la réalisation de votre projet ?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'yes', label: 'Projet réalisé' },
                    { value: 'partial', label: 'En cours' },
                    { value: 'no', label: 'Pas encore commencé' },
                    { value: 'changed', label: 'Projet modifié' }
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
                  Décrivez votre situation actuelle
                </label>
                <textarea
                  value={surveyResponse.currentSituation || ''}
                  onChange={(e) => setSurveyResponse(prev => ({ ...prev, currentSituation: e.target.value }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Nouveau poste, formation en cours, recherche d'emploi..."
                />
              </div>

              {/* Question 3 - Satisfaction */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Satisfaction globale par rapport à votre évolution
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
                  Avez-vous besoin d'un accompagnement supplémentaire ?
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
                    Oui, je souhaite être recontacté(e)
                  </button>
                  <button
                    onClick={() => setSurveyResponse(prev => ({ ...prev, needsSupport: false }))}
                    className={`flex-1 p-3 rounded-lg border transition-colors ${
                      surveyResponse.needsSupport === false
                        ? 'bg-indigo-100 border-indigo-500'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    Non, tout va bien
                  </button>
                </div>
              </div>

              {/* Question 5 - Commentaires */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commentaires ou suggestions (optionnel)
                </label>
                <textarea
                  value={surveyResponse.comments || ''}
                  onChange={(e) => setSurveyResponse(prev => ({ ...prev, comments: e.target.value }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows={2}
                  placeholder="Vos remarques..."
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
                      <span>Envoyer mes réponses</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowSurvey(false)}
                  className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Informations légales */}
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            <p className="font-medium text-gray-700 mb-2">📋 Conformité Qualiopi</p>
            <p>
              Conformément à l'article R.6313-4 du Code du travail, vous avez la possibilité de bénéficier 
              d'un entretien de suivi avec votre conseiller en bilan de compétences. Ce suivi permet de 
              faire le point sur l'avancement de votre projet professionnel et d'ajuster le plan d'action si nécessaire.
            </p>
          </div>

          {/* Bouton fermer */}
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostBilanFollowUp;

import React, { useState } from 'react';
import { Star, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface SatisfactionSurveyProps {
  userId: string;
  assessmentId: string;
  onComplete?: () => void;
}

interface SurveyAnswer {
  questionId: string;
  rating?: number;
  text?: string;
}

const SURVEY_QUESTIONS = [
  {
    id: 'q1',
    category: 'Accueil et information',
    question: 'Les informations fournies avant le début du bilan étaient-elles claires et complètes ?',
    type: 'rating' as const
  },
  {
    id: 'q2',
    category: 'Accueil et information',
    question: 'L\'accueil et la prise en charge ont-ils été satisfaisants ?',
    type: 'rating' as const
  },
  {
    id: 'q3',
    category: 'Déroulement',
    question: 'Le déroulement du bilan a-t-il respecté le planning prévu ?',
    type: 'rating' as const
  },
  {
    id: 'q4',
    category: 'Déroulement',
    question: 'La durée du bilan était-elle adaptée à vos besoins ?',
    type: 'rating' as const
  },
  {
    id: 'q5',
    category: 'Déroulement',
    question: 'Les outils et méthodes utilisés étaient-ils pertinents ?',
    type: 'rating' as const
  },
  {
    id: 'q6',
    category: 'Accompagnement',
    question: 'Votre consultant était-il à l\'écoute de vos besoins ?',
    type: 'rating' as const
  },
  {
    id: 'q7',
    category: 'Accompagnement',
    question: 'Les conseils et recommandations étaient-ils adaptés à votre situation ?',
    type: 'rating' as const
  },
  {
    id: 'q8',
    category: 'Accompagnement',
    question: 'Vous êtes-vous senti(e) accompagné(e) tout au long du parcours ?',
    type: 'rating' as const
  },
  {
    id: 'q9',
    category: 'Résultats',
    question: 'Le document de synthèse répond-il à vos attentes ?',
    type: 'rating' as const
  },
  {
    id: 'q10',
    category: 'Résultats',
    question: 'Le bilan vous a-t-il permis de clarifier votre projet professionnel ?',
    type: 'rating' as const
  },
  {
    id: 'q11',
    category: 'Résultats',
    question: 'Le plan d\'action proposé est-il réaliste et applicable ?',
    type: 'rating' as const
  },
  {
    id: 'q12',
    category: 'Plateforme',
    question: 'La plateforme Bilan-Easy était-elle facile à utiliser ?',
    type: 'rating' as const
  },
  {
    id: 'q13',
    category: 'Plateforme',
    question: 'Les fonctionnalités proposées répondaient-elles à vos besoins ?',
    type: 'rating' as const
  },
  {
    id: 'q14',
    category: 'Satisfaction globale',
    question: 'Recommanderiez-vous Bilan-Easy à votre entourage ?',
    type: 'rating' as const
  },
  {
    id: 'q15',
    category: 'Satisfaction globale',
    question: 'Quelle est votre satisfaction globale concernant ce bilan de compétences ?',
    type: 'rating' as const
  },
  {
    id: 'q16',
    category: 'Commentaires',
    question: 'Quels sont les points forts de ce bilan de compétences ?',
    type: 'text' as const
  },
  {
    id: 'q17',
    category: 'Commentaires',
    question: 'Quels sont les points à améliorer ?',
    type: 'text' as const
  },
  {
    id: 'q18',
    category: 'Commentaires',
    question: 'Avez-vous des suggestions pour améliorer notre service ?',
    type: 'text' as const
  }
];

export const SatisfactionSurvey: React.FC<SatisfactionSurveyProps> = ({
  userId,
  assessmentId,
  onComplete
}) => {
  const [answers, setAnswers] = useState<Record<string, SurveyAnswer>>({});
  const [currentCategory, setCurrentCategory] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const categories = Array.from(new Set(SURVEY_QUESTIONS.map(q => q.category)));
  const currentQuestions = SURVEY_QUESTIONS.filter(q => q.category === categories[currentCategory]);

  const handleRatingChange = (questionId: string, rating: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { questionId, rating }
    }));
  };

  const handleTextChange = (questionId: string, text: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { questionId, text }
    }));
  };

  const isCurrentCategoryComplete = () => {
    return currentQuestions.every(q => {
      const answer = answers[q.id];
      if (q.type === 'rating') {
        return answer?.rating !== undefined;
      }
      return true; // Les questions texte sont optionnelles
    });
  };

  const handleNext = () => {
    if (currentCategory < categories.length - 1) {
      setCurrentCategory(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentCategory > 0) {
      setCurrentCategory(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculer les scores par catégorie
      const categoryScores: Record<string, number> = {};
      categories.forEach(category => {
        const categoryQuestions = SURVEY_QUESTIONS.filter(q => q.category === category && q.type === 'rating');
        const categoryAnswers = categoryQuestions
          .map(q => answers[q.id]?.rating)
          .filter((r): r is number => r !== undefined);
        
        if (categoryAnswers.length > 0) {
          categoryScores[category] = categoryAnswers.reduce((sum, r) => sum + r, 0) / categoryAnswers.length;
        }
      });

      // Score global
      const allRatings = Object.values(answers)
        .map(a => a.rating)
        .filter((r): r is number => r !== undefined);
      const globalScore = allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length;

      // Sauvegarder dans Supabase
      console.log('Data to insert:', {
        user_id: userId,
        assessment_id: assessmentId,
        answers: answers,
        category_scores: categoryScores,
        global_score: globalScore,
        submitted_at: new Date().toISOString()
      });
      const { error: insertError } = await supabase
        .from('satisfaction_surveys')
        .insert({
          user_id: userId,
          assessment_id: assessmentId,
          answers: answers,
          category_scores: categoryScores,
          global_score: globalScore,
          submitted_at: new Date().toISOString()
        });

      if (insertError) throw insertError;

      setSubmitted(true);
      if (onComplete) {
        setTimeout(onComplete, 2000);
      }
    } catch (err) {
      console.error('Erreur soumission questionnaire:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la soumission');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-8 text-center">
          <CheckCircle className="mx-auto text-green-600 dark:text-green-400 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-green-900 dark:text-green-300 mb-2">
            Merci pour votre retour !
          </h2>
          <p className="text-green-800 dark:text-green-300">
            Votre questionnaire de satisfaction a été enregistré avec succès.
            Vos réponses nous aideront à améliorer notre service.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
          Questionnaire de Satisfaction
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Votre avis est précieux pour améliorer notre service
        </p>

        {/* Progression */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {categories[currentCategory]}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {currentCategory + 1} / {categories.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentCategory + 1) / categories.length) * 100}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start">
            <AlertCircle className="text-red-600 dark:text-red-400 mr-3 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Questions */}
        <div className="space-y-6 mb-8">
          {currentQuestions.map((question, index) => (
            <div key={question.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
              <p className="font-medium text-gray-900 dark:text-white mb-4">
                {index + 1}. {question.question}
              </p>

              {question.type === 'rating' ? (
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => handleRatingChange(question.id, rating)}
                      className="group relative"
                    >
                      <Star
                        size={40}
                        className={`transition-all ${
                          (answers[question.id]?.rating ?? 0) >= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 dark:text-gray-600 hover:text-yellow-300'
                        }`}
                      />
                      <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        {rating === 1 && 'Très insatisfait'}
                        {rating === 2 && 'Insatisfait'}
                        {rating === 3 && 'Neutre'}
                        {rating === 4 && 'Satisfait'}
                        {rating === 5 && 'Très satisfait'}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <textarea
                  value={answers[question.id]?.text ?? ''}
                  onChange={(e) => handleTextChange(question.id, e.target.value)}
                  placeholder="Votre réponse (optionnel)..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              )}
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentCategory === 0}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Précédent
          </button>

          {currentCategory < categories.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!isCurrentCategoryComplete()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Suivant
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!isCurrentCategoryComplete() || loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send size={20} className="mr-2" />
                  Envoyer
                </>
              )}
            </button>
          )}
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
          * Les questions notées sont obligatoires. Les commentaires sont optionnels mais appréciés.
        </p>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Summary, Answer } from '../types-ai-studio';
import { SatisfactionSurvey } from './SatisfactionSurvey';
import { DocumentsQualiopi } from './DocumentsQualiopi';
import { supabase } from '../lib/supabaseClient';
import { syntheseService, SyntheseData } from '../services/syntheseService';
import { syntheseServiceEnriched } from '../services/syntheseServiceEnriched';

interface BilanCompletionProps {
  userId: string;
  userName: string;
  userEmail: string;
  packageName: string;
  packageDuration: number;
  packagePrice: number;
  summary: Summary;
  answers: Answer[];
  startDate: string;
  existingAssessmentId?: string;
  onRestart: () => void;
  onViewHistory: () => void;
}

type CompletionStep = 'congratulations' | 'synthesis' | 'documents' | 'satisfaction' | 'final';

const CheckIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const CelebrationIcon = () => (
  <svg className="w-24 h-24 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);

export const BilanCompletion: React.FC<BilanCompletionProps> = ({
  userId,
  userName,
  userEmail,
  packageName,
  packageDuration,
  packagePrice,
  summary,
  answers,
  startDate,
  existingAssessmentId,
  onRestart,
  onViewHistory,
}) => {
  const { t } = useTranslation('completion');
  const [currentStep, setCurrentStep] = useState<CompletionStep>('congratulations');
  const [syntheseGenerated, setSyntheseGenerated] = useState(false);
  const [syntheseData, setSyntheseData] = useState<SyntheseData | null>(null);
  const [isGeneratingSynthese, setIsGeneratingSynthese] = useState(false);
  const [satisfactionCompleted, setSatisfactionCompleted] = useState(false);
  const [assessmentId, setAssessmentId] = useState<string>('');
  const [isAssessmentSaving, setIsAssessmentSaving] = useState(true);
  const [syntheseDownloadConfirmed, setSyntheseDownloadConfirmed] = useState(false); // Confirmation de réception

  // Générer u  // Générer un ID d'évaluation unique (UUID v4 valide) et sauvegarder
  useEffect(() => {
    const initAssessment = async () => {
      // Réutiliser l'ID existant si fourni par ClientApp (évite la double sauvegarde)
      const id = existingAssessmentId || crypto.randomUUID();
      console.log('[BilanCompletion] Assessment ID:', id, existingAssessmentId ? '(réutilisé)' : '(nouveau)');
      setAssessmentId(id);
      
      // Mettre à jour le bilan existant ou en créer un nouveau
      await saveBilanToDatabase(id);
      setIsAssessmentSaving(false); // Fin du chargement
    };
    
    initAssessment();
  }, [userId]);

  const saveBilanToDatabase = async (id: string) => {
    try {
      const { error } = await supabase
        .from('assessments')
        .upsert({
          id,
          client_id: userId,
          package_name: packageName,
          status: 'completed',
          summary: summary,
          answers: answers,
          completed_at: new Date().toISOString(),
          start_date: startDate,
        });

      if (error) {
        console.error('Erreur sauvegarde bilan:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Erreur:', err);
      return false;
    }
  };

  const handleGenerateSynthese = async () => {
    setIsGeneratingSynthese(true);
    try {
      // Helper pour extraire les textes de manière sécurisée
      const safeSlice = (arr: any[] | undefined, start: number, end?: number): any[] => {
        if (!arr || !Array.isArray(arr)) return [];
        return arr.slice(start, end);
      };
      
      const safeMap = (arr: any[] | undefined, mapper: (item: any) => string): string[] => {
        if (!arr || !Array.isArray(arr)) return [];
        return arr.map(mapper).filter(Boolean);
      };

      // Utiliser les nouveaux champs enrichis si disponibles, sinon fallback
      const strengthTexts = summary.strengths || safeMap(summary.keyStrengths, (s) => typeof s === 'string' ? s : s?.text || '');
      const skillTexts = summary.skills || [];
      const motivationTexts = summary.motivations || [];
      const valueTexts = summary.values || [];
      const devAreaTexts = summary.areasToImprove || safeMap(summary.areasForDevelopment, (d) => typeof d === 'string' ? d : d?.text || '');
      const projectPro = summary.projectProfessionnel || summary.profileType || 'Projet en cours de définition';
      
      // Extraire les recommandations (peut être string[] ou objet[])
      const recommendations = summary.recommendations || [];
      const recommendationTexts = safeMap(recommendations, (r) => typeof r === 'string' ? r : r?.text || '');
      
      // Extraire le plan d'action (structure différente selon la source)
      const actionPlan = summary.actionPlan || {};
      let shortTermActions: string[] = [];
      let mediumTermActions: string[] = [];
      let longTermActions: string[] = [];
      
      if (Array.isArray(actionPlan)) {
        // Ancien format: tableau plat
        shortTermActions = safeSlice(actionPlan, 0, 2).map((a: any) => typeof a === 'string' ? a : a?.text || '');
        mediumTermActions = safeSlice(actionPlan, 2, 4).map((a: any) => typeof a === 'string' ? a : a?.text || '');
        longTermActions = safeSlice(actionPlan, 4).map((a: any) => typeof a === 'string' ? a : a?.text || '');
      } else if (actionPlan.shortTerm || actionPlan.mediumTerm) {
        // Nouveau format: objet avec shortTerm/mediumTerm/longTerm
        shortTermActions = safeMap(actionPlan.shortTerm, (a) => typeof a === 'string' ? a : a?.text || '');
        mediumTermActions = safeMap(actionPlan.mediumTerm, (a) => typeof a === 'string' ? a : a?.text || '');
        longTermActions = safeMap(actionPlan.longTerm, (a) => typeof a === 'string' ? a : a?.text || '');
      }

      // Préparer les données pour la synthèse avec les champs enrichis
      const data: SyntheseData = {
        beneficiaire: {
          nom: userName,
          email: userEmail,
          dateNaissance: '',
          situationActuelle: summary.profileType || 'Non spécifié',
        },
        bilan: {
          dateDebut: startDate,
          dateFin: new Date().toLocaleDateString('fr-FR'),
          dureeHeures: packageDuration,
          forfait: packageName,
          consultant: 'Consultant Bilan-Easy',
        },
        parcoursProfessionnel: {
          resume: projectPro,
          experiencesCles: answers
            .filter(a => (a as any).category === 'parcours')
            .map(a => (a as any).text || a.value || '')
            .slice(0, 5),
        },
        competences: {
          techniques: skillTexts.length > 0 ? skillTexts.slice(0, 3) : strengthTexts.slice(0, 3),
          transversales: skillTexts.length > 3 ? skillTexts.slice(3, 6) : devAreaTexts.slice(0, 3),
          personnelles: strengthTexts.slice(0, 3),
        },
        interetsMotivations: {
          valeurs: valueTexts,
          interetsProfessionnels: recommendationTexts.slice(0, 3),
          facteursMotivation: motivationTexts,
        },
        projetProfessionnel: {
          projetPrincipal: projectPro,
          projetAlternatif: '',
          coherenceAnalysis: summary.maturityLevel || recommendationTexts[0] || '',
        },
        planAction: {
          courtTerme: shortTermActions,
          moyenTerme: mediumTermActions,
          longTerme: longTermActions,
        },
        conclusion: {
          syntheseGlobale: `${userName} a complété son bilan de compétences avec succès. ${summary.maturityLevel || `Les résultats montrent un profil ${summary.profileType || 'riche et diversifié'}.`}`,
          recommandationsFinales: recommendationTexts,
        },
      };

      setSyntheseData(data);
      
      // Préparer les données pour le PDF
      const syntheseParams = {
        userName: data.beneficiaire.nom,
        userEmail: data.beneficiaire.email,
        packageName: data.bilan.forfait,
        startDate: data.bilan.dateDebut,
        endDate: data.bilan.dateFin,
        consultantName: data.bilan.consultant,
        organizationName: 'Bilan-Easy',
        summary: summary,
        answers: answers,
        projectProfessionnel: data.projetProfessionnel.projetPrincipal,
        metiersVises: [] as string[],
        formationsRecommandees: [] as string[],
        planAction: data.planAction.courtTerme.map((a, i) => ({
          action: a,
          echeance: 'Court terme',
          priorite: 'haute' as const,
          statut: 'a_faire' as const,
        })),
      };
      
      // Utiliser le service enrichi pour les forfaits complets (12h+), sinon le service standard
      const isFullPackage = packageDuration >= 12;
      const blob = isFullPackage 
        ? syntheseServiceEnriched.generateEnrichedSynthese(syntheseParams)
        : syntheseService.generateSynthese(syntheseParams);
      
      // Télécharger le PDF
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `synthese-bilan-${userName}-${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      setSyntheseGenerated(true);
    } catch (err) {
      console.error('Erreur génération synthèse:', err);
    } finally {
      setIsGeneratingSynthese(false);
    }
  };

  const handleSatisfactionComplete = () => {
    setSatisfactionCompleted(true);
    setCurrentStep('final');
  };

  const steps = [
    { id: 'congratulations', label: t('steps.congratulations'), icon: '🎉' },
    { id: 'synthesis', label: t('steps.synthesis'), icon: '📄' },
    { id: 'documents', label: t('steps.documents'), icon: '📁' },
    { id: 'satisfaction', label: t('steps.satisfaction'), icon: '⭐' },
    { id: 'final', label: t('steps.final'), icon: '✅' },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Progress Bar */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${
                      index < currentStepIndex
                        ? 'bg-green-500 text-white'
                        : index === currentStepIndex
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-200'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                    }`}
                  >
                    {index < currentStepIndex ? <CheckIcon /> : step.icon}
                  </div>
                  <span className={`text-xs mt-1 ${
                    index <= currentStepIndex ? 'text-indigo-600 font-medium' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded ${
                    index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Étape 1: Félicitations */}
        {currentStep === 'congratulations' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center animate-fade-in">
            <CelebrationIcon />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-6 mb-4">
              {t('congratulations.title', { name: userName })} 🎉
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
              {t('congratulations.subtitle', { package: packageName })}
            </p>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 mb-8">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold text-green-600">{answers.length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('congratulations.questionsAnswered')}</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-600">{packageDuration}h</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('congratulations.duration')}</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-indigo-600">100%</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('congratulations.completed')}</p>
                </div>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {t('congratulations.legalText')}
            </p>

            <button
              onClick={() => setCurrentStep('synthesis')}
              className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
            >
              {t('congratulations.continueButton')}
            </button>
          </div>
        )}

        {/* Étape 2: Synthèse */}
        {currentStep === 'synthesis' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                <DocumentIcon />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('synthesis.title')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('synthesis.subtitle')}
                </p>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
              <p className="text-amber-800 dark:text-amber-200 text-sm">
                {t('synthesis.importantNotice')}
              </p>
            </div>

            {!syntheseGenerated ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {t('synthesis.generatePrompt')}
                </p>
                <button
                  onClick={handleGenerateSynthese}
                  disabled={isGeneratingSynthese}
                  className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
                >
                  {isGeneratingSynthese ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      {t('synthesis.generating')}
                    </>
                  ) : (
                    <>
                      <DownloadIcon />
                      {t('synthesis.generateButton')}
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckIcon />
                </div>
                <p className="text-green-600 dark:text-green-400 font-semibold mb-2">
                  {t('synthesis.successTitle')}
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {t('synthesis.successMessage')}
                </p>
                <button
                  onClick={() => setCurrentStep('documents')}
                  className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                >
                  {t('synthesis.viewDocuments')}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Étape 3: Documents */}
        {currentStep === 'documents' && (
          <div className="animate-fade-in">
            <DocumentsQualiopi
              userId={userId}
              packageName={packageName}
              packageDuration={packageDuration}
              packagePrice={packagePrice}
              startDate={startDate}
              isCompleted={true}
            />
            
            {/* Confirmation de réception des documents (obligatoire avant satisfaction) */}
            <div className="mt-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <input
                    type="checkbox"
                    id="confirm-documents"
                    checked={syntheseDownloadConfirmed}
                    onChange={(e) => setSyntheseDownloadConfirmed(e.target.checked)}
                    className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                </div>
                <label htmlFor="confirm-documents" className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>{t('documents.confirmLabel')}</strong>
                  <p className="text-amber-700 dark:text-amber-300 mt-1">
                    {t('documents.confirmLegal')}
                  </p>
                </label>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <button
                onClick={() => setCurrentStep('satisfaction')}
                disabled={!syntheseDownloadConfirmed}
                className={`px-8 py-4 rounded-xl font-semibold transition-colors ${
                  syntheseDownloadConfirmed
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {syntheseDownloadConfirmed ? t('documents.continueButton') : t('documents.confirmFirst')}
              </button>
            </div>
          </div>
        )}

        {/* Étape 4: Satisfaction */}
        {currentStep === 'satisfaction' && (
          <div className="animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                  <StarIcon />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {t('satisfaction.title')}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t('satisfaction.subtitle')}
                  </p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {t('satisfaction.description')}
              </p>
            </div>
            <div className="mt-8">
              {isAssessmentSaving ? (
                <div className="text-center p-10">{t('satisfaction.loading')}</div>
              ) : (
                <SatisfactionSurvey
                  userId={userId}
                  assessmentId={assessmentId}
                  onComplete={handleSatisfactionComplete}
                />
              )}
            </div>
          </div>
        )}

        {/* Étape 5: Final */}
        {currentStep === 'final' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center animate-fade-in">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('final.title', { name: userName })}
            </h2>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
              {t('final.subtitle')}
            </p>

            {/* Message de redirection vers le Dashboard */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="font-bold text-green-800 dark:text-green-200 text-lg">
                  {t('final.documentsReady')}
                </h3>
              </div>
              <p className="text-green-700 dark:text-green-300 mb-4">
                {t('final.dashboardPrompt')}
              </p>
              <ul className="text-left text-green-700 dark:text-green-300 space-y-2 max-w-md mx-auto">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{t('final.synthesePdf')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{t('final.historyExport')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{t('final.qualiopiDocs')}</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                {t('final.summaryTitle')}
              </h3>
              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <p className="text-sm text-gray-500">{t('final.package')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{packageName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('final.endDate')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date().toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('final.questionsAnswered')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{answers.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('final.satisfactionLabel')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {satisfactionCompleted ? `✅ ${t('final.satisfactionCompleted')}` : `⏳ ${t('final.satisfactionPending')}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.hash = '#/dashboard'}
                className="bg-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {t('final.accessDashboard')}
              </button>
            </div>

            <div className="flex flex-wrap gap-3 justify-center mt-6">
              <button
                onClick={onViewHistory}
                className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-sm"
              >
                {t('final.viewHistory')}
              </button>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <button
                onClick={onRestart}
                className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-sm"
              >
                {t('final.startNewBilan')}
              </button>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
              {t('final.contactMessage')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BilanCompletion;

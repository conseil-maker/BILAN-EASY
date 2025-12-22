import React, { useState, useEffect } from 'react';
import { Summary, Answer } from '../types-ai-studio';
import { SatisfactionSurvey } from './SatisfactionSurvey';
import { DocumentsQualiopi } from './DocumentsQualiopi';
import { supabase } from '../lib/supabaseClient';
import { syntheseService, SyntheseData } from '../services/syntheseService';

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
  onRestart,
  onViewHistory,
}) => {
  const [currentStep, setCurrentStep] = useState<CompletionStep>('congratulations');
  const [syntheseGenerated, setSyntheseGenerated] = useState(false);
  const [syntheseData, setSyntheseData] = useState<SyntheseData | null>(null);
  const [isGeneratingSynthese, setIsGeneratingSynthese] = useState(false);
  const [satisfactionCompleted, setSatisfactionCompleted] = useState(false);
  const [assessmentId, setAssessmentId] = useState<string>('');

  // Générer un ID d'évaluation unique
  useEffect(() => {
    const id = `bilan-${userId}-${Date.now()}`;
    setAssessmentId(id);
    
    // Sauvegarder le bilan complété en base
    saveBilanToDatabase(id);
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
      }
    } catch (err) {
      console.error('Erreur:', err);
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

      // Extraire les forces (keyStrengths ou strengths selon la structure)
      const strengths = summary.keyStrengths || (summary as any).strengths || [];
      const strengthTexts = safeMap(strengths, (s) => typeof s === 'string' ? s : s?.text || '');
      
      // Extraire les axes de développement (areasForDevelopment ou developmentAreas)
      const devAreas = summary.areasForDevelopment || (summary as any).developmentAreas || [];
      const devAreaTexts = safeMap(devAreas, (d) => typeof d === 'string' ? d : d?.text || '');
      
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
        // Nouveau format: objet avec shortTerm/mediumTerm
        shortTermActions = safeMap(actionPlan.shortTerm, (a) => typeof a === 'string' ? a : a?.text || '');
        mediumTermActions = safeMap(actionPlan.mediumTerm, (a) => typeof a === 'string' ? a : a?.text || '');
      }

      // Préparer les données pour la synthèse
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
          resume: strengthTexts.join('. ') || '',
          experiencesCles: answers
            .filter(a => (a as any).category === 'parcours')
            .map(a => (a as any).text || a.value || '')
            .slice(0, 5),
        },
        competences: {
          techniques: strengthTexts.slice(0, 3),
          transversales: devAreaTexts.slice(0, 3),
          personnelles: [],
        },
        interetsMotivations: {
          valeurs: [],
          interetsProfessionnels: recommendationTexts.slice(0, 3),
          facteursMotivation: [],
        },
        projetProfessionnel: {
          projetPrincipal: summary.profileType || 'Projet en cours de définition',
          projetAlternatif: '',
          coherenceAnalysis: recommendationTexts[0] || '',
        },
        planAction: {
          courtTerme: shortTermActions,
          moyenTerme: mediumTermActions,
          longTerme: longTermActions,
        },
        conclusion: {
          syntheseGlobale: `${userName} a complété son bilan de compétences avec succès. Les résultats montrent un profil ${summary.profileType || 'riche et diversifié'}.`,
          recommandationsFinales: recommendationTexts,
        },
      };

      setSyntheseData(data);
      
      // Générer le PDF
      const blob = syntheseService.generateSynthese({
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
        metiersVises: [],
        formationsRecommandees: [],
        planAction: data.planAction.courtTerme.map((a, i) => ({
          action: a,
          echeance: 'Court terme',
          priorite: 'haute' as const,
          statut: 'a_faire' as const,
        })),
      });
      
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
    { id: 'congratulations', label: 'Félicitations', icon: '🎉' },
    { id: 'synthesis', label: 'Synthèse', icon: '📄' },
    { id: 'documents', label: 'Documents', icon: '📁' },
    { id: 'satisfaction', label: 'Satisfaction', icon: '⭐' },
    { id: 'final', label: 'Terminé', icon: '✅' },
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
              Félicitations {userName} ! 🎉
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
              Vous avez terminé votre bilan de compétences "{packageName}"
            </p>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 mb-8">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold text-green-600">{answers.length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Questions répondues</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-600">{packageDuration}h</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Durée du parcours</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-indigo-600">100%</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Complété</p>
                </div>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Conformément à l'article L.6313-4 du Code du travail, vous allez maintenant recevoir 
              votre document de synthèse et les attestations obligatoires.
            </p>

            <button
              onClick={() => setCurrentStep('synthesis')}
              className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Continuer vers ma synthèse →
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
                  Document de Synthèse
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Conforme à l'article R.6313-8 du Code du travail
                </p>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
              <p className="text-amber-800 dark:text-amber-200 text-sm">
                <strong>Important :</strong> Ce document vous appartient. Conformément à l'article L.6313-10-1, 
                il ne peut être communiqué à un tiers qu'avec votre accord écrit.
              </p>
            </div>

            {!syntheseGenerated ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Cliquez sur le bouton ci-dessous pour générer votre document de synthèse personnalisé.
                </p>
                <button
                  onClick={handleGenerateSynthese}
                  disabled={isGeneratingSynthese}
                  className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
                >
                  {isGeneratingSynthese ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <DownloadIcon />
                      Générer ma synthèse PDF
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
                  Synthèse générée avec succès !
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Le document a été téléchargé automatiquement.
                </p>
                <button
                  onClick={() => setCurrentStep('documents')}
                  className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Voir tous mes documents →
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
            <div className="mt-6 text-center">
              <button
                onClick={() => setCurrentStep('satisfaction')}
                className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
              >
                Donner mon avis →
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
                    Votre avis compte
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Aidez-nous à améliorer notre accompagnement
                  </p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Conformément aux exigences Qualiopi, nous vous invitons à évaluer votre expérience. 
                Vos retours sont précieux pour l'amélioration continue de nos services.
              </p>
            </div>
            
            <SatisfactionSurvey
              userId={userId}
              assessmentId={assessmentId}
              onComplete={handleSatisfactionComplete}
            />
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
              Félicitations {userName} !
            </h2>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
              Votre bilan de compétences est terminé.
            </p>

            {/* Message de redirection vers le Dashboard */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="font-bold text-green-800 dark:text-green-200 text-lg">
                  Vos documents sont prêts !
                </h3>
              </div>
              <p className="text-green-700 dark:text-green-300 mb-4">
                Retrouvez dans votre <strong>Dashboard</strong> :
              </p>
              <ul className="text-left text-green-700 dark:text-green-300 space-y-2 max-w-md mx-auto">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span><strong>Synthèse PDF</strong> de votre bilan téléchargeable</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span><strong>Historique des échanges</strong> exportable en Excel/CSV</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span><strong>Documents Qualiopi</strong> (convention, attestation...)</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Récapitulatif de votre bilan
              </h3>
              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <p className="text-sm text-gray-500">Forfait</p>
                  <p className="font-medium text-gray-900 dark:text-white">{packageName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date de fin</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date().toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Questions répondues</p>
                  <p className="font-medium text-gray-900 dark:text-white">{answers.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Satisfaction</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {satisfactionCompleted ? '✅ Complété' : '⏳ En attente'}
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
                Accéder à mon Dashboard
              </button>
            </div>

            <div className="flex flex-wrap gap-3 justify-center mt-6">
              <button
                onClick={onViewHistory}
                className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-sm"
              >
                Voir mon historique
              </button>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <button
                onClick={onRestart}
                className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-sm"
              >
                Commencer un nouveau bilan
              </button>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
              Pour toute question, contactez-nous à support@bilan-easy.fr
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BilanCompletion;

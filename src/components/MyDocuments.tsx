import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { qualiopiDocuments, ConventionData, AttestationData } from '../services/qualiopiDocuments';
import { syntheseService, SyntheseData } from '../services/syntheseService';
import { organizationConfig, getFullAddress } from '../config/organization';
import { exportToExcel } from '../services/excelExportService';
import { useToast } from './ToastProvider';

interface MyDocumentsProps {
  user: User;
  packageName?: string;
  packageDuration?: number;
  packagePrice?: number;
  startDate?: string;
  endDate?: string;
  isCompleted?: boolean;
  summary?: any;
  answers?: any[];
}

interface DocumentItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  available: boolean;
  availableMessage?: string;
  type: 'convention' | 'attestation' | 'livret' | 'synthese' | 'plan';
  qualiopi?: boolean;
}

export const MyDocuments: React.FC<MyDocumentsProps> = ({
  user,
  packageName = 'Bilan Standard',
  packageDuration = 24,
  packagePrice = 1800,
  startDate = new Date().toLocaleDateString('fr-FR'),
  endDate,
  isCompleted = false,
  summary,
  answers = [],
}) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadProfile();
  }, [user.id]);

  const loadProfile = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(data);
    } catch (err) {
      console.error('Erreur chargement profil:', err);
    }
  };

  const documents: DocumentItem[] = [
    {
      id: 'convention',
      name: 'Convention de prestation',
      description: 'Document contractuel obligatoire définissant les modalités du bilan',
      icon: '📄',
      color: 'indigo',
      available: true,
      type: 'convention',
      qualiopi: true,
    },
    {
      id: 'livret',
      name: 'Livret d\'accueil',
      description: 'Guide complet présentant le déroulement et la méthodologie',
      icon: '📘',
      color: 'blue',
      available: true,
      type: 'livret',
      qualiopi: true,
    },
    {
      id: 'attestation',
      name: 'Attestation de présence',
      description: 'Certificat de participation au bilan de compétences',
      icon: '✅',
      color: 'green',
      available: isCompleted,
      availableMessage: 'Disponible à la fin du bilan',
      type: 'attestation',
      qualiopi: true,
    },
    {
      id: 'synthese',
      name: 'Document de synthèse',
      description: 'Synthèse complète conforme à l\'article R.6313-8 du Code du travail',
      icon: '📋',
      color: 'purple',
      available: isCompleted && !!summary,
      availableMessage: 'Disponible après la phase de conclusion',
      type: 'synthese',
      qualiopi: true,
    },
    {
      id: 'plan',
      name: 'Plan d\'action',
      description: 'Feuille de route avec objectifs et échéances',
      icon: '🎯',
      color: 'orange',
      available: isCompleted && !!summary,
      availableMessage: 'Disponible après la phase de conclusion',
      type: 'plan',
      qualiopi: false,
    },
  ];

  const handleExportExcel = async () => {
    try {
      setLoading('excel');
      const userName = profile?.full_name || user.email?.split('@')[0] || 'Utilisateur';
      
      exportToExcel({
        userName,
        packageName,
        startDate,
        endDate,
        answers,
        summary,
        competences: summary?.competences || [],
        themes: summary?.themes || [],
      });
      
      showSuccess('Export Excel téléchargé avec succès !');
    } catch (err) {
      console.error('Erreur export Excel:', err);
      showError('Erreur lors de l\'export Excel');
    } finally {
      setLoading(null);
    }
  };

  const downloadDocument = async (doc: DocumentItem) => {
    try {
      setLoading(doc.id);
      setError(null);
      setSuccess(null);

      const userName = profile?.full_name || user.email?.split('@')[0] || 'Utilisateur';
      const userEmail = profile?.email || user.email || '';
      const userAddress = profile?.address || '';
      const currentEndDate = endDate || new Date().toLocaleDateString('fr-FR');

      let blob: Blob;
      let filename: string;

      switch (doc.type) {
        case 'convention':
          const conventionData: ConventionData = {
            clientName: userName,
            clientEmail: userEmail,
            clientAddress: userAddress,
            packageName,
            packageDuration,
            packagePrice,
            startDate,
            consultantName: organizationConfig.defaultConsultant.name,
            consultantEmail: organizationConfig.defaultConsultant.email,
            organizationName: organizationConfig.name,
            organizationAddress: getFullAddress(),
            organizationSiret: organizationConfig.siret,
          };
          blob = qualiopiDocuments.generateConvention(conventionData);
          filename = `convention-${userName.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
          break;

        case 'attestation':
          const attestationData: AttestationData = {
            clientName: userName,
            packageName,
            packageDuration,
            startDate,
            endDate: currentEndDate,
            consultantName: organizationConfig.defaultConsultant.name,
            organizationName: organizationConfig.name,
          };
          blob = qualiopiDocuments.generateAttestation(attestationData);
          filename = `attestation-${userName.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
          break;

        case 'livret':
          blob = qualiopiDocuments.generateLivretAccueil();
          filename = `livret-accueil-${Date.now()}.pdf`;
          break;

        case 'synthese':
          const syntheseData: SyntheseData = {
            userName,
            userEmail,
            packageName,
            startDate,
            endDate: currentEndDate,
            consultantName: organizationConfig.defaultConsultant.name,
            organizationName: organizationConfig.name,
            summary: summary || {},
            answers: answers || [],
          };
          blob = syntheseService.generateSynthese(syntheseData);
          filename = `synthese-${userName.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
          break;

        case 'plan':
          const planData: SyntheseData = {
            userName,
            userEmail,
            packageName,
            startDate,
            endDate: currentEndDate,
            consultantName: organizationConfig.defaultConsultant.name,
            organizationName: organizationConfig.name,
            summary: summary || {},
            answers: answers || [],
            planAction: summary?.actionPlan?.map((item: any, index: number) => ({
              action: item.text || item,
              echeance: index < 2 ? 'Court terme' : index < 4 ? 'Moyen terme' : 'Long terme',
              priorite: index < 2 ? 'haute' : index < 4 ? 'moyenne' : 'basse',
              statut: item.completed ? 'termine' : 'a_faire',
            })) || [],
          };
          blob = syntheseService.generatePlanAction(planData);
          filename = `plan-action-${userName.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
          break;

        default:
          throw new Error('Type de document non reconnu');
      }

      // Télécharger le fichier
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccess(`Document "${doc.name}" téléchargé avec succès !`);
      
      // Sauvegarder l'historique de téléchargement
      await saveDownloadHistory(doc);
    } catch (err) {
      console.error('Erreur génération document:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la génération du document');
    } finally {
      setLoading(null);
    }
  };

  const saveDownloadHistory = async (doc: DocumentItem) => {
    try {
      await supabase.from('document_downloads').insert({
        user_id: user.id,
        document_type: doc.type,
        document_name: doc.name,
        downloaded_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Erreur sauvegarde historique:', err);
    }
  };

  const colorClasses: Record<string, { bg: string; text: string; border: string; button: string }> = {
    indigo: {
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      text: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-200 dark:border-indigo-800',
      button: 'bg-indigo-600 hover:bg-indigo-700',
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
      button: 'bg-blue-600 hover:bg-blue-700',
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-600 dark:text-green-400',
      border: 'border-green-200 dark:border-green-800',
      button: 'bg-green-600 hover:bg-green-700',
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-800',
      button: 'bg-purple-600 hover:bg-purple-700',
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      text: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-200 dark:border-orange-800',
      button: 'bg-orange-600 hover:bg-orange-700',
    },
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white mb-8">
        <h1 className="text-2xl font-bold mb-2">📁 Mes Documents</h1>
        <p className="text-indigo-100">
          Retrouvez tous vos documents officiels conformes Qualiopi
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="bg-white/20 rounded-lg px-3 py-1">
            <span className="opacity-75">Forfait :</span> {packageName}
          </div>
          <div className="bg-white/20 rounded-lg px-3 py-1">
            <span className="opacity-75">Début :</span> {startDate}
          </div>
          {isCompleted && endDate && (
            <div className="bg-white/20 rounded-lg px-3 py-1">
              <span className="opacity-75">Fin :</span> {endDate}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start">
          <span className="text-xl mr-3">⚠️</span>
          <div>
            <p className="font-medium text-red-800 dark:text-red-300">Erreur</p>
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-start">
          <span className="text-xl mr-3">✅</span>
          <div>
            <p className="font-medium text-green-800 dark:text-green-300">Succès</p>
            <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
          </div>
        </div>
      )}

      {/* Documents Qualiopi */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <span className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-3 text-green-600">
            ✓
          </span>
          Documents obligatoires Qualiopi
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          {documents.filter(d => d.qualiopi).map((doc) => {
            const colors = colorClasses[doc.color];
            return (
              <div
                key={doc.id}
                className={`${colors.bg} border ${colors.border} rounded-xl p-5 transition-all hover:shadow-lg`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{doc.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {doc.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {doc.description}
                    </p>
                    
                    {!doc.available && doc.availableMessage && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center">
                        <span className="mr-1">⏳</span>
                        {doc.availableMessage}
                      </p>
                    )}
                    
                    <button
                      onClick={() => downloadDocument(doc)}
                      disabled={loading === doc.id || !doc.available}
                      className={`mt-4 px-4 py-2 ${colors.button} text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors text-sm`}
                    >
                      {loading === doc.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                          Génération...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          {doc.available ? 'Télécharger PDF' : 'Non disponible'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Export Excel */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <span className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mr-3 text-emerald-600">
            📊
          </span>
          Export des données
        </h2>
        
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-5">
          <div className="flex items-start gap-4">
            <span className="text-3xl">📈</span>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Export Excel (CSV)
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Téléchargez toutes vos réponses et analyses au format Excel pour une exploitation personnalisée
              </p>
              
              {answers.length === 0 && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center">
                  <span className="mr-1">⏳</span>
                  Disponible après avoir répondu à des questions
                </p>
              )}
              
              <button
                onClick={handleExportExcel}
                disabled={loading === 'excel' || answers.length === 0}
                className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors text-sm"
              >
                {loading === 'excel' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Génération...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {answers.length > 0 ? 'Télécharger Excel' : 'Non disponible'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Documents complémentaires */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3 text-blue-600">
            📎
          </span>
          Documents complémentaires
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          {documents.filter(d => !d.qualiopi).map((doc) => {
            const colors = colorClasses[doc.color];
            return (
              <div
                key={doc.id}
                className={`${colors.bg} border ${colors.border} rounded-xl p-5 transition-all hover:shadow-lg`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{doc.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {doc.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {doc.description}
                    </p>
                    
                    {!doc.available && doc.availableMessage && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center">
                        <span className="mr-1">⏳</span>
                        {doc.availableMessage}
                      </p>
                    )}
                    
                    <button
                      onClick={() => downloadDocument(doc)}
                      disabled={loading === doc.id || !doc.available}
                      className={`mt-4 px-4 py-2 ${colors.button} text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors text-sm`}
                    >
                      {loading === doc.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                          Génération...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          {doc.available ? 'Télécharger PDF' : 'Non disponible'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Informations légales */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
          <span className="mr-2">⚖️</span>
          Informations légales
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <p>
            <strong>Confidentialité :</strong> Conformément à l'article L.6313-10-1 du Code du travail, 
            le document de synthèse ne peut être communiqué à un tiers qu'avec votre accord écrit.
          </p>
          <p>
            <strong>Conservation :</strong> Vos documents sont conservés pendant 3 ans conformément 
            aux exigences Qualiopi et peuvent être téléchargés à tout moment depuis votre espace.
          </p>
          <p>
            <strong>RGPD :</strong> Vous pouvez exercer vos droits d'accès, de rectification et de 
            suppression en nous contactant à rgpd@bilan-easy.fr
          </p>
        </div>
      </div>
    </div>
  );
};

export default MyDocuments;

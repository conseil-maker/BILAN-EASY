import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Download, CheckCircle, AlertCircle, BookOpen, ClipboardList, Star } from 'lucide-react';
import { qualiopiDocuments, ConventionData, AttestationData, ProgrammeData, EmargementData, EvaluationData } from '../services/qualiopiDocuments';
import { supabase } from '../lib/supabaseClient';
import { organizationConfig, getFullAddress } from '../config/organization';

interface DocumentsQualiopiProps {
  userId: string;
  packageName: string;
  packageDuration: number;
  packagePrice: number;
  startDate: string;
  endDate?: string;
  isCompleted?: boolean;
}

type DocType = 'convention' | 'attestation' | 'livret' | 'programme' | 'emargement' | 'evaluation';

export const DocumentsQualiopi: React.FC<DocumentsQualiopiProps> = ({
  userId,
  packageName,
  packageDuration,
  packagePrice,
  startDate,
  endDate,
  isCompleted = false
}) => {
  const { t } = useTranslation('documents');
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const downloadDocument = async (type: DocType) => {
    try {
      setLoading(type);
      setError(null);
      setSuccess(null);

      // Récupérer les données utilisateur
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!profile) {
        throw new Error(t('qualiopi.profileNotFound'));
      }

      const clientName = profile.full_name || profile.email;
      const consultantName = organizationConfig.defaultConsultant?.name || 'Consultant Bilan-Easy';
      const consultantEmail = organizationConfig.defaultConsultant?.email || 'consultant@bilan-easy.fr';
      const orgName = organizationConfig.name;
      const orgAddress = getFullAddress();
      const orgSiret = organizationConfig.siret || '';

      let blob: Blob;
      let filename: string;

      switch (type) {
        case 'convention': {
          const conventionData: ConventionData = {
            clientName,
            clientEmail: profile.email,
            clientAddress: profile.address || '',
            packageName,
            packageDuration,
            packagePrice,
            startDate,
            consultantName,
            consultantEmail,
            organizationName: orgName,
            organizationAddress: orgAddress,
            organizationSiret: orgSiret
          };
          blob = qualiopiDocuments.generateConvention(conventionData);
          filename = `convention-${clientName.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
          break;
        }
        case 'attestation': {
          if (!isCompleted || !endDate) {
            throw new Error(t('qualiopi.attestationNotReady'));
          }
          const attestationData: AttestationData = {
            clientName,
            packageName,
            packageDuration,
            startDate,
            endDate,
            consultantName,
            organizationName: orgName
          };
          blob = qualiopiDocuments.generateAttestation(attestationData);
          filename = `attestation-${clientName.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
          break;
        }
        case 'livret': {
          blob = qualiopiDocuments.generateLivretAccueil();
          filename = `livret-accueil-${Date.now()}.pdf`;
          break;
        }
        case 'programme': {
          const programmeData: ProgrammeData = {
            packageName,
            packageDuration,
            consultantName,
            organizationName: orgName,
            startDate
          };
          blob = qualiopiDocuments.generateProgramme(programmeData);
          filename = `programme-formation-${clientName.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
          break;
        }
        case 'emargement': {
          const emargementData: EmargementData = {
            clientName,
            packageName,
            consultantName,
            organizationName: orgName,
            sessions: [] // Feuille vierge à remplir
          };
          blob = qualiopiDocuments.generateEmargement(emargementData);
          filename = `emargement-${clientName.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
          break;
        }
        case 'evaluation': {
          if (!isCompleted) {
            throw new Error(t('qualiopi.evaluationNotReady', { defaultValue: 'L\'évaluation est disponible uniquement à la fin du bilan.' }));
          }
          const evaluationData: EvaluationData = {
            clientName,
            packageName,
            consultantName,
            organizationName: orgName,
            completionDate: endDate || new Date().toLocaleDateString()
          };
          blob = qualiopiDocuments.generateEvaluation(evaluationData);
          filename = `evaluation-satisfaction-${clientName.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
          break;
        }
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

      setSuccess(t('qualiopi.downloadSuccess', { type }));
    } catch (err) {
      console.error('Erreur génération document:', err);
      setError(err instanceof Error ? err.message : t('qualiopi.generateError'));
    } finally {
      setLoading(null);
    }
  };

  const documents: { type: DocType; icon: React.ReactNode; color: string; bgColor: string; disabled?: boolean; disabledText?: string }[] = [
    {
      type: 'convention',
      icon: <FileText className="text-indigo-600" size={24} />,
      color: 'bg-indigo-600 hover:bg-indigo-700',
      bgColor: 'border-indigo-200 dark:border-indigo-800'
    },
    {
      type: 'programme',
      icon: <BookOpen className="text-blue-600" size={24} />,
      color: 'bg-blue-600 hover:bg-blue-700',
      bgColor: 'border-blue-200 dark:border-blue-800'
    },
    {
      type: 'livret',
      icon: <FileText className="text-purple-600" size={24} />,
      color: 'bg-purple-600 hover:bg-purple-700',
      bgColor: 'border-purple-200 dark:border-purple-800'
    },
    {
      type: 'emargement',
      icon: <ClipboardList className="text-orange-600" size={24} />,
      color: 'bg-orange-600 hover:bg-orange-700',
      bgColor: 'border-orange-200 dark:border-orange-800'
    },
    {
      type: 'attestation',
      icon: <FileText className="text-green-600" size={24} />,
      color: 'bg-green-600 hover:bg-green-700',
      bgColor: 'border-green-200 dark:border-green-800',
      disabled: !isCompleted,
      disabledText: t('buttons.notAvailable', { defaultValue: 'Disponible à la fin du bilan' })
    },
    {
      type: 'evaluation',
      icon: <Star className="text-amber-600" size={24} />,
      color: 'bg-amber-600 hover:bg-amber-700',
      bgColor: 'border-amber-200 dark:border-amber-800',
      disabled: !isCompleted,
      disabledText: t('buttons.notAvailable', { defaultValue: 'Disponible à la fin du bilan' })
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
          <FileText className="mr-3 text-indigo-600" size={28} />
          {t('qualiopi.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {t('qualiopi.subtitle')}
        </p>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start">
            <AlertCircle className="text-red-600 dark:text-red-400 mr-3 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start">
            <CheckCircle className="text-green-600 dark:text-green-400 mr-3 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-green-800 dark:text-green-300 text-sm">{success}</p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4">
          {documents.map(({ type, icon, color, bgColor, disabled, disabledText }) => (
            <div key={type} className={`border ${bgColor} rounded-lg p-4 hover:shadow-lg transition-shadow`}>
              <div className="flex items-start mb-3">
                <div className="mr-3 flex-shrink-0">{icon}</div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {t(`docs.${type}.name`, { defaultValue: type })}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {t(`docs.${type}.description`, { defaultValue: '' })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => downloadDocument(type)}
                disabled={loading === type || disabled}
                className={`w-full mt-3 px-4 py-2 ${disabled ? 'bg-gray-400 cursor-not-allowed' : color} text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors`}
              >
                {loading === type ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    {t('buttons.generating')}
                  </>
                ) : disabled ? (
                  <span className="text-sm">{disabledText}</span>
                ) : (
                  <>
                    <Download size={16} className="mr-2" />
                    {t('buttons.downloadPdf')}
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">📋 {t('qualiopi.importantInfo')}</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
            <li>• {t('qualiopi.info1')}</li>
            <li>• {t('qualiopi.info2')}</li>
            <li>• {t('qualiopi.info3')}</li>
            <li>• {t('qualiopi.info4')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

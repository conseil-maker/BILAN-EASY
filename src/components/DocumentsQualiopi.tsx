import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { qualiopiDocuments, ConventionData, AttestationData } from '../services/qualiopiDocuments';
import { supabase } from '../lib/supabaseClient';

interface DocumentsQualiopiProps {
  userId: string;
  packageName: string;
  packageDuration: number;
  packagePrice: number;
  startDate: string;
  endDate?: string;
  isCompleted?: boolean;
}

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

  const downloadDocument = async (type: 'convention' | 'attestation' | 'livret') => {
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

      let blob: Blob;
      let filename: string;

      if (type === 'convention') {
        const conventionData: ConventionData = {
          clientName: profile.full_name || profile.email,
          clientEmail: profile.email,
          clientAddress: profile.address || '',
          packageName,
          packageDuration,
          packagePrice,
          startDate,
          consultantName: 'Consultant Bilan-Easy', // À récupérer depuis la base
          consultantEmail: 'consultant@bilan-easy.fr',
          organizationName: 'Bilan-Easy',
          organizationAddress: 'Adresse de l\'organisme', // À configurer
          organizationSiret: 'SIRET de l\'organisme' // À configurer
        };
        blob = qualiopiDocuments.generateConvention(conventionData);
        filename = `convention-${profile.full_name?.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
      } else if (type === 'attestation') {
        if (!isCompleted || !endDate) {
          throw new Error(t('qualiopi.attestationNotReady'));
        }
        const attestationData: AttestationData = {
          clientName: profile.full_name || profile.email,
          packageName,
          packageDuration,
          startDate,
          endDate,
          consultantName: 'Consultant Bilan-Easy',
          organizationName: 'Bilan-Easy'
        };
        blob = qualiopiDocuments.generateAttestation(attestationData);
        filename = `attestation-${profile.full_name?.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
      } else {
        blob = qualiopiDocuments.generateLivretAccueil();
        filename = `livret-accueil-${Date.now()}.pdf`;
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
          {/* Convention de prestation */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start mb-3">
              <FileText className="text-indigo-600 mr-3 flex-shrink-0" size={24} />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{t('docs.convention.name')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t('docs.convention.description')}
                </p>
              </div>
            </div>
            <button
              onClick={() => downloadDocument('convention')}
              disabled={loading === 'convention'}
              className="w-full mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              {loading === 'convention' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  {t('buttons.generating')}
                </>
              ) : (
                <>
                  <Download size={16} className="mr-2" />
                  {t('buttons.downloadPdf')}
                </>
              )}
            </button>
          </div>

          {/* Attestation de présence */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start mb-3">
              <FileText className="text-green-600 mr-3 flex-shrink-0" size={24} />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{t('docs.attestation.name')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t('docs.attestation.availableMessage')}
                </p>
              </div>
            </div>
            <button
              onClick={() => downloadDocument('attestation')}
              disabled={loading === 'attestation' || !isCompleted}
              className="w-full mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              {loading === 'attestation' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  {t('buttons.generating')}
                </>
              ) : (
                <>
                  <Download size={16} className="mr-2" />
                  {isCompleted ? t('buttons.downloadPdf') : t('buttons.notAvailable')}
                </>
              )}
            </button>
          </div>

          {/* Livret d'accueil */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start mb-3">
              <FileText className="text-purple-600 mr-3 flex-shrink-0" size={24} />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{t('docs.livret.name')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t('docs.livret.description')}
                </p>
              </div>
            </div>
            <button
              onClick={() => downloadDocument('livret')}
              disabled={loading === 'livret'}
              className="w-full mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              {loading === 'livret' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  {t('buttons.generating')}
                </>
              ) : (
                <>
                  <Download size={16} className="mr-2" />
                  {t('buttons.downloadPdf')}
                </>
              )}
            </button>
          </div>
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

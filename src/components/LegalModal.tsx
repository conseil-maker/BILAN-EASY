/**
 * LegalModal - Composant pour afficher les documents légaux dans une modal
 * 
 * Ce composant permet d'afficher les CGU, CGV et Politique de confidentialité
 * sans quitter la page en cours, évitant ainsi la perte de progression.
 * Le contenu est chargé dynamiquement depuis les fichiers de traduction i18n.
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, FileText, Shield, Scale } from 'lucide-react';

// ============================================
// TYPES
// ============================================

export type LegalDocumentType = 'cgu' | 'cgv' | 'privacy' | null;

interface LegalModalProps {
  documentType: LegalDocumentType;
  onClose: () => void;
}

// ============================================
// COMPOSANT
// ============================================

const LegalModal: React.FC<LegalModalProps> = ({ documentType, onClose }) => {
  const { t } = useTranslation('legal');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (documentType) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [documentType]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!documentType) return null;

  const getDocumentInfo = () => {
    switch (documentType) {
      case 'cgu':
        return {
          title: t('cgu.title'),
          icon: <FileText size={24} />,
          content: t('cgu.content', '')
        };
      case 'cgv':
        return {
          title: t('cgv.title'),
          icon: <Scale size={24} />,
          content: t('cgv.content', '')
        };
      case 'privacy':
        return {
          title: t('privacy.title'),
          icon: <Shield size={24} />,
          content: t('privacy.content', '')
        };
      default:
        return null;
    }
  };

  const docInfo = getDocumentInfo();
  if (!docInfo) return null;

  return (
    <div 
      onClick={handleBackdropClick}
      className={`fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div 
        className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col transition-transform duration-200 ${
          isVisible ? 'scale-100' : 'scale-95'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="text-indigo-600 dark:text-indigo-400">
              {docInfo.icon}
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {docInfo.title}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={t('close')}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {docInfo.content.split('\n').map((line, index) => {
              if (line.startsWith('# ')) {
                return <h1 key={index} className="text-2xl font-bold text-gray-900 dark:text-white mt-0 mb-4">{line.replace('# ', '')}</h1>;
              }
              if (line.startsWith('## ')) {
                return <h2 key={index} className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3">{line.replace('## ', '')}</h2>;
              }
              if (line.startsWith('**') && line.endsWith('**')) {
                return <p key={index} className="font-semibold text-gray-700 dark:text-gray-300 my-2">{line.replace(/\*\*/g, '')}</p>;
              }
              if (line.startsWith('- ')) {
                const text = line.replace('- ', '');
                // Handle bold within list items
                if (text.includes('**')) {
                  const parts = text.split(/\*\*(.*?)\*\*/);
                  return (
                    <li key={index} className="text-gray-600 dark:text-gray-400 ml-4">
                      {parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}
                    </li>
                  );
                }
                return <li key={index} className="text-gray-600 dark:text-gray-400 ml-4">{text}</li>;
              }
              if (line.trim() === '') {
                return <br key={index} />;
              }
              return <p key={index} className="text-gray-600 dark:text-gray-400 my-2">{line}</p>;
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            {t('understood')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegalModal;

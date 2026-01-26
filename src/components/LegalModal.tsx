/**
 * LegalModal - Composant pour afficher les documents légaux dans une modal
 * 
 * Ce composant permet d'afficher les CGU, CGV et Politique de confidentialité
 * sans quitter la page en cours, évitant ainsi la perte de progression.
 * 
 * @author Manus AI
 * @date 26 janvier 2026
 */

import React, { useState, useEffect } from 'react';
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
// CONTENU DES DOCUMENTS
// ============================================

const CGU_CONTENT = `
# Conditions Générales d'Utilisation (CGU)

**Date de dernière mise à jour : 26 janvier 2026**

## 1. Objet

Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les modalités et conditions d'utilisation de la plateforme BILAN-EASY, accessible à l'adresse https://bilan-easy.vercel.app.

## 2. Acceptation des CGU

L'utilisation de la plateforme implique l'acceptation pleine et entière des présentes CGU. Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser la plateforme.

## 3. Description du service

BILAN-EASY est une plateforme numérique de bilan de compétences conforme aux exigences Qualiopi. Elle permet aux bénéficiaires de :
- Réaliser un bilan de compétences accompagné par une intelligence artificielle
- Identifier leurs compétences, aptitudes et motivations
- Définir un projet professionnel ou de formation
- Obtenir une synthèse personnalisée et un plan d'action

## 4. Accès au service

L'accès au service nécessite :
- Une inscription avec création d'un compte utilisateur
- Une connexion internet stable
- Un navigateur web moderne (Chrome, Firefox, Safari, Edge)

## 5. Obligations de l'utilisateur

L'utilisateur s'engage à :
- Fournir des informations exactes lors de son inscription
- Maintenir la confidentialité de ses identifiants de connexion
- Utiliser le service de manière loyale et conforme à sa destination
- Ne pas tenter de perturber le fonctionnement de la plateforme

## 6. Propriété intellectuelle

Tous les contenus présents sur la plateforme (textes, images, logos, algorithmes) sont protégés par le droit de la propriété intellectuelle et restent la propriété exclusive de BILAN-EASY ou de ses partenaires.

## 7. Responsabilité

BILAN-EASY s'efforce d'assurer la disponibilité et la fiabilité du service mais ne peut garantir une disponibilité continue. La plateforme ne saurait être tenue responsable des dommages directs ou indirects résultant de l'utilisation du service.

## 8. Modification des CGU

BILAN-EASY se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés de toute modification substantielle.

## 9. Droit applicable

Les présentes CGU sont soumises au droit français. Tout litige sera soumis aux tribunaux compétents.
`;

const CGV_CONTENT = `
# Conditions Générales de Vente (CGV)

**Date de dernière mise à jour : 26 janvier 2026**

## 1. Préambule

Les présentes Conditions Générales de Vente (CGV) s'appliquent à toutes les prestations de bilan de compétences réalisées via la plateforme BILAN-EASY.

## 2. Prestations proposées

BILAN-EASY propose plusieurs forfaits de bilan de compétences :
- **Forfait Test** : Découverte du bilan (non éligible CPF)
- **Bilan Essentiel (12h)** : Parcours complet standard
- **Bilan Approfondi (16h)** : Parcours avec accompagnement renforcé
- **Bilan Premium (24h)** : Parcours complet avec suivi personnalisé

## 3. Prix et paiement

Les prix sont indiqués en euros TTC. Le paiement peut être effectué par :
- Carte bancaire
- Virement bancaire
- Financement CPF (pour les forfaits éligibles)
- Financement OPCO

## 4. Droit de rétractation

Conformément à l'article L.221-18 du Code de la consommation, vous disposez d'un délai de 14 jours pour exercer votre droit de rétractation, à compter de la date de souscription.

Toutefois, si vous avez commencé à utiliser le service avant la fin du délai de rétractation, vous reconnaissez perdre votre droit de rétractation.

## 5. Exécution de la prestation

Le bilan de compétences se déroule conformément aux dispositions du Code du travail (articles L.6313-4 et R.6313-4 à R.6313-8). Il comprend :
- Une phase préliminaire
- Une phase d'investigation
- Une phase de conclusion

## 6. Confidentialité des résultats

Conformément à l'article L.6313-4 du Code du travail, les résultats du bilan de compétences sont la propriété exclusive du bénéficiaire. Ils ne peuvent être communiqués à un tiers qu'avec son accord écrit.

## 7. Réclamations

Toute réclamation doit être adressée par email à support@bilan-easy.com dans un délai de 30 jours suivant la fin de la prestation.

## 8. Médiation

En cas de litige, vous pouvez recourir gratuitement au service de médiation de la consommation.
`;

const PRIVACY_CONTENT = `
# Politique de Confidentialité

**Date de dernière mise à jour : 26 janvier 2026**

## 1. Introduction

La présente politique de confidentialité décrit comment BILAN-EASY collecte, utilise et protège vos données personnelles conformément au Règlement Général sur la Protection des Données (RGPD).

## 2. Responsable du traitement

Le responsable du traitement des données est :
- Raison sociale : BILAN-EASY
- Adresse : [Adresse du siège social]
- Email : dpo@bilan-easy.com

## 3. Données collectées

Nous collectons les données suivantes :
- **Données d'identification** : nom, prénom, email
- **Données professionnelles** : parcours, compétences, expériences
- **Données de connexion** : adresse IP, logs de connexion
- **Réponses au questionnaire** : pour la réalisation du bilan

## 4. Finalités du traitement

Vos données sont traitées pour :
- La réalisation de votre bilan de compétences
- La génération de votre synthèse personnalisée
- L'amélioration de nos services
- Le respect de nos obligations légales

## 5. Base légale

Le traitement de vos données repose sur :
- Votre consentement explicite
- L'exécution du contrat de prestation
- Nos obligations légales (conservation des documents Qualiopi)

## 6. Durée de conservation

Vos données sont conservées :
- Données du bilan : 3 ans après la fin de la prestation (obligation Qualiopi)
- Données de connexion : 1 an
- Données de facturation : 10 ans (obligation comptable)

## 7. Vos droits

Conformément au RGPD, vous disposez des droits suivants :
- **Droit d'accès** : obtenir une copie de vos données
- **Droit de rectification** : corriger vos données inexactes
- **Droit à l'effacement** : demander la suppression de vos données
- **Droit à la portabilité** : recevoir vos données dans un format structuré
- **Droit d'opposition** : vous opposer au traitement de vos données

Pour exercer ces droits, contactez-nous à : dpo@bilan-easy.com

## 8. Sécurité des données

Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :
- Chiffrement des données en transit (HTTPS)
- Stockage sécurisé sur des serveurs certifiés
- Accès restreint aux données personnelles

## 9. Cookies

Notre plateforme utilise des cookies essentiels au fonctionnement du service. Aucun cookie publicitaire n'est utilisé.

## 10. Modifications

Cette politique peut être mise à jour. Vous serez informé de toute modification substantielle.
`;

// ============================================
// COMPOSANT
// ============================================

const LegalModal: React.FC<LegalModalProps> = ({ documentType, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (documentType) {
      setIsVisible(true);
      // Empêcher le scroll du body
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
    setTimeout(onClose, 200); // Attendre la fin de l'animation
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
          title: 'Conditions Générales d\'Utilisation',
          icon: <FileText size={24} />,
          content: CGU_CONTENT
        };
      case 'cgv':
        return {
          title: 'Conditions Générales de Vente',
          icon: <Scale size={24} />,
          content: CGV_CONTENT
        };
      case 'privacy':
        return {
          title: 'Politique de Confidentialité',
          icon: <Shield size={24} />,
          content: PRIVACY_CONTENT
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
            aria-label="Fermer"
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
                return <li key={index} className="text-gray-600 dark:text-gray-400 ml-4">{line.replace('- ', '')}</li>;
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
            J'ai compris
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegalModal;

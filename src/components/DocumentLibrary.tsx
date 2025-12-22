import React, { useState, useEffect } from 'react';
import { 
  FileText, Download, FolderOpen, Clock, CheckCircle, 
  AlertCircle, Search, Filter, Calendar, User 
} from 'lucide-react';
import { qualiopiDocuments, ConventionData, AttestationData } from '../services/qualiopiDocuments';
import { supabase } from '../lib/supabaseClient';

interface DocumentLibraryProps {
  userId: string;
  userName: string;
  userEmail: string;
  packageName: string;
  packageDuration: number;
  packagePrice: number;
  startDate: string;
  endDate?: string;
  isCompleted?: boolean;
}

interface Document {
  id: string;
  name: string;
  description: string;
  category: 'obligatoire' | 'synthese' | 'ressources';
  status: 'available' | 'pending' | 'locked';
  icon: React.ReactNode;
  color: string;
  action: () => void;
}

export const DocumentLibrary: React.FC<DocumentLibraryProps> = ({
  userId,
  userName,
  userEmail,
  packageName,
  packageDuration,
  packagePrice,
  startDate,
  endDate,
  isCompleted = false
}) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [downloadHistory, setDownloadHistory] = useState<{id: string, date: string}[]>([]);

  // Historique des téléchargements géré en mémoire uniquement
  const saveDownload = (docId: string) => {
    const newHistory = [...downloadHistory, { id: docId, date: new Date().toISOString() }];
    setDownloadHistory(newHistory);
  };

  const downloadBlob = (blob: Blob, filename: string, docId: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    saveDownload(docId);
    setSuccess(`Document "${filename}" téléchargé avec succès !`);
  };

  const generateConvention = async () => {
    try {
      setLoading('convention');
      setError(null);
      
      const conventionData: ConventionData = {
        clientName: userName,
        clientEmail: userEmail,
        packageName,
        packageDuration,
        packagePrice,
        startDate,
        consultantName: 'Consultant Bilan-Easy',
        consultantEmail: 'consultant@bilan-easy.fr',
        organizationName: 'Bilan-Easy',
        organizationAddress: '123 Avenue de la Formation, 75001 Paris',
        organizationSiret: '123 456 789 00012'
      };
      
      const blob = qualiopiDocuments.generateConvention(conventionData);
      downloadBlob(blob, `convention-${userName.replace(/\s+/g, '-')}.pdf`, 'convention');
    } catch (err) {
      setError('Erreur lors de la génération de la convention');
    } finally {
      setLoading(null);
    }
  };

  const generateAttestation = async () => {
    if (!isCompleted || !endDate) {
      setError('L\'attestation sera disponible à la fin de votre bilan');
      return;
    }
    
    try {
      setLoading('attestation');
      setError(null);
      
      const attestationData: AttestationData = {
        clientName: userName,
        packageName,
        packageDuration,
        startDate,
        endDate,
        consultantName: 'Consultant Bilan-Easy',
        organizationName: 'Bilan-Easy'
      };
      
      const blob = qualiopiDocuments.generateAttestation(attestationData);
      downloadBlob(blob, `attestation-${userName.replace(/\s+/g, '-')}.pdf`, 'attestation');
    } catch (err) {
      setError('Erreur lors de la génération de l\'attestation');
    } finally {
      setLoading(null);
    }
  };

  const generateLivret = async () => {
    try {
      setLoading('livret');
      setError(null);
      
      const blob = qualiopiDocuments.generateLivretAccueil();
      downloadBlob(blob, 'livret-accueil-bilan-easy.pdf', 'livret');
    } catch (err) {
      setError('Erreur lors de la génération du livret');
    } finally {
      setLoading(null);
    }
  };

  const documents: Document[] = [
    // Documents obligatoires
    {
      id: 'convention',
      name: 'Convention de prestation',
      description: 'Document contractuel obligatoire définissant les modalités du bilan',
      category: 'obligatoire',
      status: 'available',
      icon: <FileText size={24} />,
      color: 'indigo',
      action: generateConvention
    },
    {
      id: 'livret',
      name: 'Livret d\'accueil',
      description: 'Guide complet présentant le déroulement de votre bilan',
      category: 'obligatoire',
      status: 'available',
      icon: <FolderOpen size={24} />,
      color: 'purple',
      action: generateLivret
    },
    {
      id: 'attestation',
      name: 'Attestation de présence',
      description: 'Certificat attestant de votre participation au bilan',
      category: 'obligatoire',
      status: isCompleted ? 'available' : 'locked',
      icon: <CheckCircle size={24} />,
      color: 'green',
      action: generateAttestation
    },
    // Documents de synthèse
    {
      id: 'synthese',
      name: 'Document de synthèse',
      description: 'Synthèse complète de votre bilan de compétences',
      category: 'synthese',
      status: isCompleted ? 'available' : 'pending',
      icon: <FileText size={24} />,
      color: 'blue',
      action: () => setError('Document disponible à la fin du bilan')
    },
    {
      id: 'plan-action',
      name: 'Plan d\'action',
      description: 'Votre feuille de route personnalisée',
      category: 'synthese',
      status: isCompleted ? 'available' : 'pending',
      icon: <Calendar size={24} />,
      color: 'orange',
      action: () => setError('Document disponible à la fin du bilan')
    },
    // Ressources
    {
      id: 'guide-metiers',
      name: 'Guide des métiers',
      description: 'Fiches métiers correspondant à votre profil',
      category: 'ressources',
      status: 'available',
      icon: <User size={24} />,
      color: 'teal',
      action: () => window.open('https://www.pole-emploi.fr/candidat/les-fiches-metiers.html', '_blank')
    }
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status: Document['status']) => {
    switch (status) {
      case 'available':
        return <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">Disponible</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full">En cours</span>;
      case 'locked':
        return <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full">Verrouillé</span>;
    }
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      indigo: 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30',
      purple: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30',
      green: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30',
      blue: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
      orange: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30',
      teal: 'text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-900/30'
    };
    return colors[color] || colors.indigo;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <FolderOpen className="mr-3 text-indigo-600" size={32} />
            Bibliothèque de documents
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Tous vos documents officiels et ressources au même endroit
          </p>
        </header>

        {/* Alertes */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start">
            <AlertCircle className="text-red-600 dark:text-red-400 mr-3 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-800 dark:text-red-300">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">×</button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start">
            <CheckCircle className="text-green-600 dark:text-green-400 mr-3 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-green-800 dark:text-green-300">{success}</p>
            <button onClick={() => setSuccess(null)} className="ml-auto text-green-600 hover:text-green-800">×</button>
          </div>
        )}

        {/* Filtres */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher un document..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400" size={20} />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Tous les documents</option>
              <option value="obligatoire">Documents obligatoires</option>
              <option value="synthese">Synthèse</option>
              <option value="ressources">Ressources</option>
            </select>
          </div>
        </div>

        {/* Liste des documents */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className={`border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-lg transition-all ${
                doc.status === 'locked' ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-3 rounded-lg ${getColorClasses(doc.color)}`}>
                  {doc.icon}
                </div>
                {getStatusBadge(doc.status)}
              </div>
              
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">{doc.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{doc.description}</p>
              
              {downloadHistory.find(h => h.id === doc.id) && (
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-3">
                  <Clock size={14} className="mr-1" />
                  Dernier téléchargement : {new Date(downloadHistory.find(h => h.id === doc.id)!.date).toLocaleDateString('fr-FR')}
                </div>
              )}
              
              <button
                onClick={doc.action}
                disabled={loading === doc.id || doc.status === 'locked'}
                className={`w-full py-2.5 rounded-lg font-medium flex items-center justify-center transition-colors ${
                  doc.status === 'locked'
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {loading === doc.id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Génération...
                  </>
                ) : (
                  <>
                    <Download size={18} className="mr-2" />
                    {doc.status === 'locked' ? 'Non disponible' : 'Télécharger'}
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Info Qualiopi */}
        <div className="mt-8 p-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl">
          <h3 className="font-bold text-indigo-900 dark:text-indigo-300 mb-3 flex items-center">
            <CheckCircle className="mr-2" size={20} />
            Conformité Qualiopi
          </h3>
          <p className="text-indigo-800 dark:text-indigo-300 text-sm">
            Tous les documents générés sont conformes au référentiel national qualité Qualiopi et aux articles 
            L.6313-1 et suivants du Code du travail. Ils sont acceptés par les organismes financeurs (CPF, OPCO, etc.).
          </p>
        </div>
      </div>
    </div>
  );
};

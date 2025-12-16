import React, { useState, useMemo } from 'react';
import { 
  Search, Briefcase, GraduationCap, Filter, ChevronDown, ChevronRight,
  Star, TrendingUp, Clock, Euro, CheckCircle, ExternalLink
} from 'lucide-react';
import { 
  METIERS_ROME, DOMAINES_ROME, searchMetiers, getMetiersByDomaine, 
  suggestMetiersByCompetences, RomeMetier 
} from '../data/romeMetiers';
import { 
  FORMATIONS, NIVEAUX_FORMATION, searchFormations, getFormationsByDomaine,
  suggestFormationsByCompetences, Formation 
} from '../data/formations';

interface MetiersFormationsExplorerProps {
  userCompetences?: string[];
  onSelectMetier?: (metier: RomeMetier) => void;
  onSelectFormation?: (formation: Formation) => void;
}

type TabType = 'metiers' | 'formations' | 'suggestions';

export const MetiersFormationsExplorer: React.FC<MetiersFormationsExplorerProps> = ({
  userCompetences = [],
  onSelectMetier,
  onSelectFormation
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('metiers');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomaine, setSelectedDomaine] = useState<string>('all');
  const [selectedNiveau, setSelectedNiveau] = useState<string>('all');
  const [expandedMetier, setExpandedMetier] = useState<string | null>(null);
  const [expandedFormation, setExpandedFormation] = useState<string | null>(null);
  const [showCPFOnly, setShowCPFOnly] = useState(false);

  // Filtrage des métiers
  const filteredMetiers = useMemo(() => {
    let results = METIERS_ROME;
    
    if (searchTerm) {
      results = searchMetiers(searchTerm);
    }
    
    if (selectedDomaine !== 'all') {
      results = results.filter(m => m.domaine === selectedDomaine);
    }
    
    return results;
  }, [searchTerm, selectedDomaine]);

  // Filtrage des formations
  const filteredFormations = useMemo(() => {
    let results = FORMATIONS;
    
    if (searchTerm) {
      results = searchFormations(searchTerm);
    }
    
    if (selectedDomaine !== 'all') {
      results = results.filter(f => f.domaines.includes(selectedDomaine));
    }
    
    if (selectedNiveau !== 'all') {
      results = results.filter(f => f.niveau === selectedNiveau);
    }
    
    if (showCPFOnly) {
      results = results.filter(f => f.cpf);
    }
    
    return results;
  }, [searchTerm, selectedDomaine, selectedNiveau, showCPFOnly]);

  // Suggestions basées sur les compétences
  const suggestedMetiers = useMemo(() => {
    if (userCompetences.length === 0) return [];
    return suggestMetiersByCompetences(userCompetences).slice(0, 10);
  }, [userCompetences]);

  const suggestedFormations = useMemo(() => {
    if (userCompetences.length === 0) return [];
    return suggestFormationsByCompetences(userCompetences).slice(0, 10);
  }, [userCompetences]);

  const renderMetierCard = (metier: RomeMetier) => {
    const isExpanded = expandedMetier === metier.code;
    const domaine = DOMAINES_ROME.find(d => d.code === metier.domaine);
    
    return (
      <div 
        key={metier.code}
        className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
      >
        <div 
          className="p-4 cursor-pointer"
          onClick={() => setExpandedMetier(isExpanded ? null : metier.code)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded">
                  {metier.code}
                </span>
                {metier.perspectives === 'Excellentes' && (
                  <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded flex items-center">
                    <TrendingUp size={12} className="mr-1" />
                    Porteur
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{metier.libelle}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{domaine?.libelle}</p>
            </div>
            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
        </div>
        
        {isExpanded && (
          <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-4 space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Compétences clés</h4>
              <div className="flex flex-wrap gap-2">
                {metier.competences.map((comp, i) => (
                  <span key={i} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                    {comp}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Formations recommandées</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {metier.formations.map((form, i) => (
                  <li key={i} className="flex items-center">
                    <GraduationCap size={14} className="mr-2 text-indigo-500" />
                    {form}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Euro size={14} className="mr-1" />
                {metier.salaireMoyen || 'Variable'}
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <TrendingUp size={14} className="mr-1" />
                Perspectives : {metier.perspectives || 'Non renseigné'}
              </div>
            </div>
            
            <div className="flex gap-2">
              <a
                href={`https://candidat.francetravail.fr/metierscope/fiche-metier/${metier.code}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 text-center text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
              >
                <ExternalLink size={14} className="mr-2" />
                Voir sur France Travail
              </a>
              {onSelectMetier && (
                <button
                  onClick={() => onSelectMetier(metier)}
                  className="px-4 py-2 text-sm border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                >
                  Ajouter au projet
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFormationCard = (formation: Formation) => {
    const isExpanded = expandedFormation === formation.id;
    const niveau = NIVEAUX_FORMATION.find(n => n.code === formation.niveau);
    
    return (
      <div 
        key={formation.id}
        className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
      >
        <div 
          className="p-4 cursor-pointer"
          onClick={() => setExpandedFormation(isExpanded ? null : formation.id)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {formation.cpf && (
                  <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded flex items-center">
                    <CheckCircle size={12} className="mr-1" />
                    CPF
                  </span>
                )}
                <span className="px-2 py-0.5 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                  {formation.type.replace('_', ' ')}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{formation.titre}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{niveau?.libelle}</p>
            </div>
            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
        </div>
        
        {isExpanded && (
          <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-4 space-y-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Clock size={14} className="mr-2" />
                {formation.duree}
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Euro size={14} className="mr-2" />
                {formation.prix || 'Variable'}
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <span className={`px-2 py-0.5 text-xs rounded ${
                  formation.modalite === 'distanciel' ? 'bg-blue-100 text-blue-700' :
                  formation.modalite === 'presentiel' ? 'bg-orange-100 text-orange-700' :
                  'bg-purple-100 text-purple-700'
                }`}>
                  {formation.modalite}
                </span>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Compétences acquises</h4>
              <div className="flex flex-wrap gap-2">
                {formation.competences.map((comp, i) => (
                  <span key={i} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                    {comp}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Débouchés</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {formation.debouches.map((deb, i) => (
                  <li key={i} className="flex items-center">
                    <Briefcase size={14} className="mr-2 text-indigo-500" />
                    {deb}
                  </li>
                ))}
              </ul>
            </div>
            
            {formation.organismes && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Organismes</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formation.organismes.join(', ')}
                </p>
              </div>
            )}
            
            <div className="flex gap-2">
              <a
                href="https://www.moncompteformation.gouv.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 text-center text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <ExternalLink size={14} className="mr-2" />
                Rechercher sur Mon Compte Formation
              </a>
              {onSelectFormation && (
                <button
                  onClick={() => onSelectFormation(formation)}
                  className="px-4 py-2 text-sm border border-green-600 text-green-600 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                >
                  Ajouter au plan
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Briefcase className="mr-3 text-indigo-600" size={32} />
            Explorer les métiers et formations
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Découvrez les métiers et formations qui correspondent à votre profil
          </p>
        </header>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab('metiers')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'metiers'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Briefcase size={18} className="inline mr-2" />
            Métiers ({filteredMetiers.length})
          </button>
          <button
            onClick={() => setActiveTab('formations')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'formations'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <GraduationCap size={18} className="inline mr-2" />
            Formations ({filteredFormations.length})
          </button>
          {userCompetences.length > 0 && (
            <button
              onClick={() => setActiveTab('suggestions')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'suggestions'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Star size={18} className="inline mr-2" />
              Suggestions pour vous
            </button>
          )}
        </div>

        {/* Filtres */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={activeTab === 'metiers' ? 'Rechercher un métier...' : 'Rechercher une formation...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <select
            value={selectedDomaine}
            onChange={(e) => setSelectedDomaine(e.target.value)}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Tous les domaines</option>
            {DOMAINES_ROME.map(d => (
              <option key={d.code} value={d.code}>{d.code} - {d.libelle.substring(0, 30)}...</option>
            ))}
          </select>
          
          {activeTab === 'formations' && (
            <>
              <select
                value={selectedNiveau}
                onChange={(e) => setSelectedNiveau(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Tous les niveaux</option>
                {NIVEAUX_FORMATION.map(n => (
                  <option key={n.code} value={n.code}>{n.libelle}</option>
                ))}
              </select>
              
              <label className="flex items-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <input
                  type="checkbox"
                  checked={showCPFOnly}
                  onChange={(e) => setShowCPFOnly(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">CPF uniquement</span>
              </label>
            </>
          )}
        </div>

        {/* Contenu */}
        {activeTab === 'metiers' && (
          <div className="grid md:grid-cols-2 gap-4">
            {filteredMetiers.slice(0, 20).map(renderMetierCard)}
          </div>
        )}

        {activeTab === 'formations' && (
          <div className="grid md:grid-cols-2 gap-4">
            {filteredFormations.slice(0, 20).map(renderFormationCard)}
          </div>
        )}

        {activeTab === 'suggestions' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <Briefcase className="mr-2 text-indigo-600" size={24} />
                Métiers suggérés pour vous
              </h2>
              {suggestedMetiers.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {suggestedMetiers.map(renderMetierCard)}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  Complétez votre bilan pour recevoir des suggestions personnalisées.
                </p>
              )}
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <GraduationCap className="mr-2 text-green-600" size={24} />
                Formations suggérées pour vous
              </h2>
              {suggestedFormations.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {suggestedFormations.map(renderFormationCard)}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  Complétez votre bilan pour recevoir des suggestions personnalisées.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-2">Sources officielles</h3>
          <p className="text-blue-800 dark:text-blue-300 text-sm">
            Les données métiers proviennent du répertoire ROME de France Travail. 
            Les formations sont éligibles au CPF (Compte Personnel de Formation) et conformes aux exigences Qualiopi.
          </p>
        </div>
      </div>
    </div>
  );
};

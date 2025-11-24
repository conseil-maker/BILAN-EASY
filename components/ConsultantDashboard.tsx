import React, { useState, useEffect } from 'react';
import { assessmentService } from '../services/assessmentService';
import { Assessment } from '../lib/supabaseClient';
import { supabase } from '../lib/supabaseClient';

interface ConsultantDashboardProps {
  onBack: () => void;
  onViewAssessment: (assessment: Assessment) => void;
}

export const ConsultantDashboard: React.FC<ConsultantDashboardProps> = ({ onBack, onViewAssessment }) => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed'>('all');

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      setLoading(true);
      const data = await assessmentService.getConsultantAssessments();
      setAssessments(data);
    } catch (error) {
      console.error('Erreur lors du chargement des bilans:', error);
    } finally {
      setLoading(false);
    }
  };

  const getClientInfo = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', clientId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des infos client:', error);
      return null;
    }
  };

  const filteredAssessments = assessments.filter(a => {
    if (filter === 'all') return true;
    return a.status === filter;
  });

  const stats = {
    total: assessments.length,
    inProgress: assessments.filter(a => a.status === 'in_progress').length,
    completed: assessments.filter(a => a.status === 'completed').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement des bilans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-primary-800 mb-2">Dashboard Consultant</h1>
              <p className="text-slate-600">Suivi des bilans de vos clients</p>
            </div>
            <button
              onClick={onBack}
              className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors"
            >
              ← Retour
            </button>
          </div>
        </header>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl font-bold text-primary-600">{stats.total}</div>
            <div className="text-slate-600 mt-1">Bilans totaux</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl font-bold text-orange-600">{stats.inProgress}</div>
            <div className="text-slate-600 mt-1">En cours</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-slate-600 mt-1">Complétés</div>
          </div>
        </div>

        {/* Filtres */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all' 
                ? 'bg-primary-600 text-white' 
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            Tous ({stats.total})
          </button>
          <button
            onClick={() => setFilter('in_progress')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'in_progress' 
                ? 'bg-orange-600 text-white' 
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            En cours ({stats.inProgress})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'completed' 
                ? 'bg-green-600 text-white' 
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            Complétés ({stats.completed})
          </button>
        </div>

        {/* Liste des bilans */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800">Bilans des clients</h2>
          </div>
          
          {filteredAssessments.length === 0 ? (
            <div className="p-8 text-center text-slate-600">
              Aucun bilan à afficher pour ce filtre.
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredAssessments.map((assessment) => (
                <div key={assessment.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        {assessment.title}
                      </h3>
                      <div className="space-y-1 text-sm text-slate-600">
                        <p>
                          <span className="font-medium">Style de coaching:</span>{' '}
                          {assessment.coaching_style === 'collaborative' ? 'Collaboratif' :
                           assessment.coaching_style === 'analytical' ? 'Analytique' :
                           'Créatif'}
                        </p>
                        <p>
                          <span className="font-medium">Créé le:</span>{' '}
                          {new Date(assessment.created_at).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        {assessment.completed_at && (
                          <p>
                            <span className="font-medium">Complété le:</span>{' '}
                            {new Date(assessment.completed_at).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        assessment.status === 'completed' ? 'bg-green-100 text-green-800' :
                        assessment.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
                        assessment.status === 'draft' ? 'bg-slate-100 text-slate-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {assessment.status === 'completed' ? 'Complété' :
                         assessment.status === 'in_progress' ? 'En cours' :
                         assessment.status === 'draft' ? 'Brouillon' :
                         'Archivé'}
                      </span>
                      <button
                        onClick={() => onViewAssessment(assessment)}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm"
                      >
                        Consulter
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

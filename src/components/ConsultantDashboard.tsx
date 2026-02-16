import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { assessmentService } from '../services/assessmentService';
import { assignmentService } from '../services/assignmentService';
import { Assessment } from '../lib/supabaseClient';
import { supabase } from '../lib/supabaseClient';
import { AssessmentDetailView } from './AssessmentDetailView';
import { Calendar, Clock, CheckCircle, XCircle, MessageSquare, Phone, Users, FileText, TrendingUp, Loader2 } from 'lucide-react';

interface ConsultantDashboardProps {
  onBack: () => void;
  onViewAssessment: (assessment: Assessment) => void;
}

interface ClientInfo {
  id: string;
  email: string;
  full_name?: string;
  assignedAt: string;
}

interface AppointmentRequestData {
  id: string;
  client_id: string;
  client_name: string;
  client_email: string;
  reason: string;
  preferred_date: string | null;
  preferred_time: string | null;
  message: string | null;
  status: 'pending' | 'contacted' | 'scheduled' | 'completed' | 'cancelled';
  consultant_notes: string | null;
  created_at: string;
  updated_at: string;
}

export const ConsultantDashboard: React.FC<ConsultantDashboardProps> = ({ onBack, onViewAssessment }) => {
  const { t } = useTranslation(['consultant', 'appointments']);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [clients, setClients] = useState<ClientInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed'>('all');
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'assessments'>('overview');

  // Demandes de RDV
  const [appointmentRequests, setAppointmentRequests] = useState<AppointmentRequestData[]>([]);
  const [updatingRequestId, setUpdatingRequestId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [assessmentsData, clientsData] = await Promise.all([
        assessmentService.getConsultantAssessments(),
        assignmentService.getConsultantClients()
      ]);
      
      setAssessments(assessmentsData);
      
      const formattedClients = clientsData.map((assignment: any) => ({
        id: assignment.client.id,
        email: assignment.client.email,
        full_name: assignment.client.full_name,
        assignedAt: assignment.assigned_at
      }));
      setClients(formattedClients);

      // Charger les demandes de RDV
      await loadAppointmentRequests();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAppointmentRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('appointment_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAppointmentRequests(data || []);
    } catch (error) {
      console.error('Error loading appointment requests:', error);
    }
  };

  const updateRequestStatus = async (requestId: string, newStatus: string, notes?: string) => {
    setUpdatingRequestId(requestId);
    try {
      const updateData: any = { status: newStatus, updated_at: new Date().toISOString() };
      if (notes !== undefined) updateData.consultant_notes = notes;

      const { error } = await supabase
        .from('appointment_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;
      await loadAppointmentRequests();
    } catch (error) {
      console.error('Error updating request:', error);
    } finally {
      setUpdatingRequestId(null);
    }
  };

  const filteredAssessments = assessments.filter(a => {
    if (filter === 'all') return true;
    return a.status === filter;
  });

  const stats = {
    totalClients: clients.length,
    total: assessments.length,
    inProgress: assessments.filter(a => a.status === 'in_progress').length,
    completed: assessments.filter(a => a.status === 'completed').length,
    pendingRequests: appointmentRequests.filter(r => r.status === 'pending').length,
  };

  // Vue détaillée d'un bilan
  if (selectedAssessment) {
    return (
      <AssessmentDetailView
        assessment={selectedAssessment}
        onBack={() => setSelectedAssessment(null)}
        isConsultantView={true}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-slate-600">{t('consultant:status.loading', 'Chargement...')}</p>
        </div>
      </div>
    );
  }

  const getReasonLabel = (reason: string) => {
    const key = `appointments:reasons.${reason}`;
    const translated = t(key);
    return translated !== key ? translated : reason;
  };

  const getTimeLabel = (time: string) => {
    const key = `appointments:form.${time}`;
    const translated = t(key);
    return translated !== key ? translated : time;
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock size={14} />, label: t('appointments:status.pending', 'En attente') },
      contacted: { color: 'bg-blue-100 text-blue-800', icon: <Phone size={14} />, label: t('appointments:status.contacted', 'Contacté') },
      scheduled: { color: 'bg-indigo-100 text-indigo-800', icon: <Calendar size={14} />, label: t('appointments:status.scheduled', 'Planifié') },
      completed: { color: 'bg-green-100 text-green-800', icon: <CheckCircle size={14} />, label: t('appointments:status.completed', 'Terminé') },
      cancelled: { color: 'bg-red-100 text-red-800', icon: <XCircle size={14} />, label: t('appointments:status.cancelled', 'Annulé') },
    };
    const c = config[status] || config.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${c.color}`}>
        {c.icon} {c.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-primary-800 mb-2">{t('consultant:title')}</h1>
              <p className="text-slate-600">{t('consultant:overview.clientTracking', 'Suivi des bilans de vos clients')}</p>
            </div>
            <button
              onClick={onBack}
              className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors"
            >
              {t('common:back', '← Retour')}
            </button>
          </div>
        </header>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg"><Users size={20} className="text-blue-600" /></div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.totalClients}</div>
                <div className="text-xs text-slate-500">{t('consultant:clients.assigned', 'Clients')}</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg"><FileText size={20} className="text-indigo-600" /></div>
              <div>
                <div className="text-2xl font-bold text-indigo-600">{stats.total}</div>
                <div className="text-xs text-slate-500">{t('consultant:stats.totalBilans', 'Bilans')}</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg"><TrendingUp size={20} className="text-orange-600" /></div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{stats.inProgress}</div>
                <div className="text-xs text-slate-500">{t('consultant:status.inProgress')}</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg"><CheckCircle size={20} className="text-green-600" /></div>
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                <div className="text-xs text-slate-500">{t('consultant:status.completed')}</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stats.pendingRequests > 0 ? 'bg-red-100' : 'bg-slate-100'}`}>
                <Calendar size={20} className={stats.pendingRequests > 0 ? 'text-red-600' : 'text-slate-400'} />
              </div>
              <div>
                <div className={`text-2xl font-bold ${stats.pendingRequests > 0 ? 'text-red-600' : 'text-slate-400'}`}>{stats.pendingRequests}</div>
                <div className="text-xs text-slate-500">{t('appointments:consultant.pending_requests', 'Demandes RDV')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 shadow-sm border border-slate-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'overview' ? 'bg-primary-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t('consultant:overview.title', 'Vue d\'ensemble')}
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors relative ${
              activeTab === 'appointments' ? 'bg-primary-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t('appointments:consultant.tab_title', 'Demandes de RDV')}
            {stats.pendingRequests > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {stats.pendingRequests}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('assessments')}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'assessments' ? 'bg-primary-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t('consultant:clients.clientBilans', 'Bilans')}
          </button>
        </div>

        {/* ============ ONGLET VUE D'ENSEMBLE ============ */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Demandes de RDV en attente */}
            {stats.pendingRequests > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Calendar className="text-red-500" size={20} />
                  {t('appointments:consultant.pending_alert', 'Demandes de RDV en attente')}
                  <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">{stats.pendingRequests}</span>
                </h2>
                <div className="space-y-3">
                  {appointmentRequests.filter(r => r.status === 'pending').slice(0, 3).map(req => (
                    <div key={req.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <span className="font-medium text-slate-900">{req.client_name}</span>
                        <span className="text-slate-500 text-sm ml-2">— {getReasonLabel(req.reason)}</span>
                      </div>
                      <button
                        onClick={() => setActiveTab('appointments')}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        {t('appointments:consultant.view_details', 'Voir →')}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Clients */}
            {clients.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Users className="text-blue-600" size={20} />
                  {t('consultant:clients.myClients', 'Mes clients')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clients.map(client => (
                    <div key={client.id} className="border border-slate-200 rounded-lg p-4 hover:border-primary-400 transition-colors">
                      <div className="font-semibold text-slate-900">
                        {client.full_name || client.email}
                      </div>
                      {client.full_name && (
                        <div className="text-sm text-slate-500 mt-1">{client.email}</div>
                      )}
                      <div className="text-xs text-slate-400 mt-2">
                        {t('consultant:clients.assignedDate')} {new Date(client.assignedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============ ONGLET DEMANDES DE RDV ============ */}
        {activeTab === 'appointments' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="text-indigo-600" size={20} />
                {t('appointments:consultant.all_requests', 'Toutes les demandes de rendez-vous')}
              </h2>
            </div>

            {appointmentRequests.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                {t('appointments:consultant.no_requests', 'Aucune demande de rendez-vous pour le moment.')}
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {appointmentRequests.map(req => (
                  <div key={req.id} className={`p-5 transition-colors ${req.status === 'pending' ? 'bg-yellow-50/50' : ''}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* En-tête */}
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold text-slate-900">{req.client_name}</span>
                          {getStatusBadge(req.status)}
                        </div>
                        
                        {/* Détails */}
                        <div className="space-y-1 text-sm">
                          <p className="text-slate-600">
                            <span className="font-medium">{t('appointments:consultant.reason', 'Motif')}:</span> {getReasonLabel(req.reason)}
                          </p>
                          <p className="text-slate-500">
                            <span className="font-medium">Email:</span> {req.client_email}
                          </p>
                          {req.preferred_date && (
                            <p className="text-slate-500">
                              <span className="font-medium">{t('appointments:consultant.preferred_slot', 'Créneau souhaité')}:</span>{' '}
                              {new Date(req.preferred_date).toLocaleDateString()}
                              {req.preferred_time && ` — ${getTimeLabel(req.preferred_time)}`}
                            </p>
                          )}
                          {req.message && (
                            <p className="text-slate-600 mt-2 bg-slate-50 p-2 rounded-lg italic">
                              "{req.message}"
                            </p>
                          )}
                          {req.consultant_notes && (
                            <p className="text-indigo-600 mt-1">
                              <span className="font-medium">{t('appointments:consultant.your_notes', 'Vos notes')}:</span> {req.consultant_notes}
                            </p>
                          )}
                          <p className="text-xs text-slate-400 mt-1">
                            {t('appointments:consultant.received', 'Reçue le')} {new Date(req.created_at).toLocaleDateString()} {t('appointments:consultant.at', 'à')} {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 shrink-0">
                        {req.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateRequestStatus(req.id, 'contacted')}
                              disabled={updatingRequestId === req.id}
                              className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                            >
                              {updatingRequestId === req.id ? <Loader2 size={12} className="animate-spin" /> : <Phone size={12} />}
                              {t('appointments:consultant.mark_contacted', 'Contacté')}
                            </button>
                            <button
                              onClick={() => updateRequestStatus(req.id, 'cancelled')}
                              disabled={updatingRequestId === req.id}
                              className="px-3 py-1.5 bg-slate-200 text-slate-600 text-xs rounded-lg hover:bg-slate-300 disabled:opacity-50"
                            >
                              {t('appointments:consultant.cancel', 'Annuler')}
                            </button>
                          </>
                        )}
                        {req.status === 'contacted' && (
                          <>
                            <button
                              onClick={() => updateRequestStatus(req.id, 'scheduled')}
                              disabled={updatingRequestId === req.id}
                              className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1"
                            >
                              {updatingRequestId === req.id ? <Loader2 size={12} className="animate-spin" /> : <Calendar size={12} />}
                              {t('appointments:consultant.mark_scheduled', 'Planifié')}
                            </button>
                          </>
                        )}
                        {req.status === 'scheduled' && (
                          <button
                            onClick={() => updateRequestStatus(req.id, 'completed')}
                            disabled={updatingRequestId === req.id}
                            className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                          >
                            {updatingRequestId === req.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                            {t('appointments:consultant.mark_completed', 'Terminé')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============ ONGLET BILANS ============ */}
        {activeTab === 'assessments' && (
          <>
            {/* Filtres */}
            <div className="mb-6 flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                  filter === 'all' ? 'bg-primary-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {t('consultant:table.all', 'Tous')} ({stats.total})
              </button>
              <button
                onClick={() => setFilter('in_progress')}
                className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                  filter === 'in_progress' ? 'bg-orange-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {t('consultant:status.inProgress')} ({stats.inProgress})
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                  filter === 'completed' ? 'bg-green-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {t('consultant:status.completed')} ({stats.completed})
              </button>
            </div>

            {/* Liste des bilans */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-lg font-bold text-slate-800">{t('consultant:clients.clientBilans', 'Bilans des clients')}</h2>
              </div>
              
              {filteredAssessments.length === 0 ? (
                <div className="p-8 text-center text-slate-600">
                  {t('consultant:overview.noAssessments', 'Aucun bilan à afficher.')}
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {filteredAssessments.map((assessment) => (
                    <div key={assessment.id} className="p-5 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-grow">
                          <h3 className="text-base font-semibold text-slate-900 mb-2">
                            {assessment.title}
                          </h3>
                          <div className="space-y-1 text-sm text-slate-600">
                            <p>
                              <span className="font-medium">{t('consultant:detail.coachingStyle')}:</span>{' '}
                              {assessment.coaching_style === 'collaborative' ? t('consultant:detail.collaborative') :
                               assessment.coaching_style === 'analytical' ? t('consultant:detail.analytical') :
                               t('consultant:detail.creative')}
                            </p>
                            <p>
                              <span className="font-medium">{t('consultant:detail.creationDate')}:</span>{' '}
                              {new Date(assessment.created_at).toLocaleDateString()}
                            </p>
                            {assessment.completed_at && (
                              <p>
                                <span className="font-medium">{t('consultant:detail.completionDate')}:</span>{' '}
                                {new Date(assessment.completed_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            assessment.status === 'completed' ? 'bg-green-100 text-green-800' :
                            assessment.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {assessment.status === 'completed' ? t('consultant:status.completed') :
                             assessment.status === 'in_progress' ? t('consultant:status.inProgress') :
                             assessment.status === 'draft' ? t('consultant:status.draft', 'Brouillon') :
                             t('consultant:status.archived', 'Archivé')}
                          </span>
                          <button
                            onClick={() => setSelectedAssessment(assessment)}
                            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm"
                          >
                            {t('consultant:table.actions')}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

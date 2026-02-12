import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useTranslation } from 'react-i18next';
import { organizationConfig } from '../config/organization';

interface Client {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  assignedAt: string;
  lastActivity?: string;
  assessmentStatus?: 'not_started' | 'in_progress' | 'completed';
  assessmentProgress?: number;
  nextAppointment?: string;
}

interface Assessment {
  id: string;
  user_id: string;
  title: string;
  status: string;
  created_at: string;
  completed_at?: string;
  package_name?: string;
  progress?: number;
}

interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  time: string;
  type: 'preliminary' | 'investigation' | 'conclusion' | 'follow_up';
  notes?: string;
}

interface ConsultantDashboardProProps {
  onBack: () => void;
}

export const ConsultantDashboardPro: React.FC<ConsultantDashboardProProps> = ({ onBack }) => {
  const { t } = useTranslation('consultant');
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'calendar' | 'documents'>('overview');
  const [clients, setClients] = useState<Client[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger les clients assignés au consultant
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Charger les affectations
      const { data: assignmentsData } = await supabase
        .from('consultant_client_assignments')
        .select(`
          client_id,
          assigned_at,
          profiles!consultant_client_assignments_client_id_fkey (
            id,
            email,
            full_name
          )
        `)
        .eq('consultant_id', user.id);

      // Charger les bilans
      const { data: assessmentsData } = await supabase
        .from('assessments')
        .select('*')
        .order('created_at', { ascending: false });

      if (assignmentsData) {
        const formattedClients: Client[] = assignmentsData.map((a: any) => {
          const clientAssessments = assessmentsData?.filter(
            (ass: any) => ass.user_id === a.client_id
          ) || [];
          const latestAssessment = clientAssessments[0];
          
          return {
            id: a.profiles?.id || a.client_id,
            email: a.profiles?.email || '',
            full_name: a.profiles?.full_name,
            assignedAt: a.assigned_at,
            assessmentStatus: latestAssessment?.status || 'not_started',
            assessmentProgress: latestAssessment?.progress || 0,
            lastActivity: latestAssessment?.updated_at
          };
        });
        setClients(formattedClients);
      }

      if (assessmentsData) {
        setAssessments(assessmentsData);
      }

      // Charger les rendez-vous (simulé pour l'instant)
      setAppointments([
        {
          id: '1',
          clientId: 'demo',
          clientName: 'Client Demo',
          date: new Date().toISOString().split('T')[0],
          time: '14:00',
          type: 'preliminary',
          notes: 'Premier entretien'
        }
      ]);

    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  // Statistiques
  const stats = {
    totalClients: clients.length,
    activeClients: clients.filter(c => c.assessmentStatus === 'in_progress').length,
    completedBilans: assessments.filter(a => a.status === 'completed').length,
    pendingActions: clients.filter(c => c.assessmentStatus === 'in_progress').length,
    upcomingAppointments: appointments.filter(a => new Date(a.date) >= new Date()).length,
    satisfactionRate: 4.7
  };

  // Obtenir les prochains rendez-vous
  const upcomingAppointments = appointments
    .filter(a => new Date(a.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  // Obtenir les clients nécessitant une action
  const clientsNeedingAction = clients.filter(c => 
    c.assessmentStatus === 'in_progress' && 
    (!c.lastActivity || new Date(c.lastActivity) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
  );

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">{t('status.completed')}</span>;
      case 'in_progress':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">{t('status.inProgress')}</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800">{t('status.notStarted')}</span>;
    }
  };

  const getAppointmentTypeBadge = (type: string) => {
    const types: Record<string, { label: string; color: string }> = {
      preliminary: { label: 'Phase préliminaire', color: 'bg-blue-100 text-blue-800' },
      investigation: { label: 'Investigation', color: 'bg-purple-100 text-purple-800' },
      conclusion: { label: 'Conclusion', color: 'bg-green-100 text-green-800' },
      follow_up: { label: 'Suivi 6 mois', color: 'bg-amber-100 text-amber-800' }
    };
    const t = types[type] || { label: type, color: 'bg-slate-100 text-slate-800' };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${t.color}`}>{t.label}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="text-slate-500 hover:text-slate-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{t('title')}</h1>
                <p className="text-sm text-slate-500">{organizationConfig.name} - Certifié Qualiopi</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-slate-500 hover:text-slate-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {stats.pendingActions > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {stats.pendingActions}
                  </span>
                )}
              </button>
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                C
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation par onglets */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
              { id: 'clients', label: 'Mes clients', icon: '👥' },
              { id: 'calendar', label: 'Calendrier', icon: '📅' },
              { id: 'documents', label: 'Documents', icon: '📄' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{t('stats.activeClients')}</p>
                    <p className="text-3xl font-bold text-slate-900">{stats.activeClients}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">👥</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-2">sur {stats.totalClients} clients</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{t('stats.completedBilans')}</p>
                    <p className="text-3xl font-bold text-green-600">{stats.completedBilans}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">✅</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-2">{t('stats.thisMonth')}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{t('stats.upcomingAppointments')}</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.upcomingAppointments}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📅</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-2">{t('stats.thisWeek')}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{t('stats.satisfaction')}</p>
                    <p className="text-3xl font-bold text-amber-600">{stats.satisfactionRate}/5</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">⭐</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-2">{t('stats.globalAverage')}</p>
              </div>
            </div>

            {/* Actions rapides et alertes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Clients nécessitant une action */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <span className="text-orange-500">⚠️</span>
                    Actions requises
                  </h2>
                </div>
                <div className="p-6">
                  {clientsNeedingAction.length === 0 ? (
                    <p className="text-slate-500 text-center py-4">{t('overview.noUrgentActions')}</p>
                  ) : (
                    <ul className="space-y-3">
                      {clientsNeedingAction.map(client => (
                        <li key={client.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                          <div>
                            <p className="font-medium text-slate-900">{client.full_name || client.email}</p>
                            <p className="text-sm text-slate-500">{t('overview.inactiveSince')}</p>
                          </div>
                          <button className="text-orange-600 hover:text-orange-700 font-medium text-sm">
                            Contacter →
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Prochains rendez-vous */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <span>📅</span>
                    Prochains rendez-vous
                  </h2>
                  <button 
                    onClick={() => setShowNewAppointmentModal(true)}
                    className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                  >
                    + Nouveau
                  </button>
                </div>
                <div className="p-6">
                  {upcomingAppointments.length === 0 ? (
                    <p className="text-slate-500 text-center py-4">{t('calendar.noAppointments')}</p>
                  ) : (
                    <ul className="space-y-3">
                      {upcomingAppointments.map(apt => (
                        <li key={apt.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <p className="font-medium text-slate-900">{apt.clientName}</p>
                            <p className="text-sm text-slate-500">
                              {new Date(apt.date).toLocaleDateString('fr-FR')} à {apt.time}
                            </p>
                          </div>
                          {getAppointmentTypeBadge(apt.type)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Derniers bilans */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">{t('overview.latestBilans')}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('table.client')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('table.package')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('table.status')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('table.date')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {assessments.slice(0, 5).map(assessment => (
                      <tr key={assessment.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm text-slate-900">{assessment.title}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{assessment.package_name || '-'}</td>
                        <td className="px-6 py-4">{getStatusBadge(assessment.status)}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {new Date(assessment.created_at).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                            Voir détails
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-900">Mes clients ({clients.length})</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="divide-y divide-slate-200">
              {clients.map(client => (
                <div key={client.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold">
                        {(client.full_name || client.email).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{client.full_name || 'Non renseigné'}</p>
                        <p className="text-sm text-slate-500">{client.email}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Assigné le {new Date(client.assignedAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {getStatusBadge(client.assessmentStatus)}
                      <div className="flex gap-2">
                        <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors" title="Envoyer un email">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors" title="Planifier un RDV">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors" title="Voir le bilan">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  {client.assessmentProgress !== undefined && client.assessmentProgress > 0 && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>{t('overview.bilanProgress')}</span>
                        <span>{client.assessmentProgress}%</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-600 rounded-full transition-all"
                          style={{ width: `${client.assessmentProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {clients.length === 0 && (
                <div className="p-12 text-center text-slate-500">
                  <p className="text-lg mb-2">{t('clients.noClients')}</p>
                  <p className="text-sm">Contactez l'administrateur pour vous faire assigner des clients.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-slate-900">{t('calendar.title')}</h2>
              <button 
                onClick={() => setShowNewAppointmentModal(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nouveau rendez-vous
              </button>
            </div>
            
            {/* Calendrier simplifié - Vue semaine */}
            <div className="grid grid-cols-7 gap-2 mb-6">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-slate-500 py-2">
                  {day}
                </div>
              ))}
              {Array.from({ length: 7 }).map((_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - date.getDay() + 1 + i);
                const isToday = date.toDateString() === new Date().toDateString();
                const dayAppointments = appointments.filter(
                  a => a.date === date.toISOString().split('T')[0]
                );
                
                return (
                  <div 
                    key={i}
                    className={`min-h-24 p-2 border rounded-lg ${
                      isToday ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200'
                    }`}
                  >
                    <div className={`text-sm font-medium mb-1 ${isToday ? 'text-indigo-600' : 'text-slate-700'}`}>
                      {date.getDate()}
                    </div>
                    {dayAppointments.map(apt => (
                      <div 
                        key={apt.id}
                        className="text-xs bg-indigo-100 text-indigo-700 rounded px-1 py-0.5 mb-1 truncate"
                      >
                        {apt.time} - {apt.clientName}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* Liste des rendez-vous */}
            <div className="border-t border-slate-200 pt-6">
              <h3 className="font-medium text-slate-900 mb-4">{t('calendar.allAppointments')}</h3>
              {appointments.length === 0 ? (
                <p className="text-slate-500 text-center py-8">{t('calendar.noAppointments')}</p>
              ) : (
                <div className="space-y-3">
                  {appointments.map(apt => (
                    <div key={apt.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex flex-col items-center justify-center">
                          <span className="text-xs text-indigo-600 font-medium">
                            {new Date(apt.date).toLocaleDateString('fr-FR', { month: 'short' })}
                          </span>
                          <span className="text-lg font-bold text-indigo-700">
                            {new Date(apt.date).getDate()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{apt.clientName}</p>
                          <p className="text-sm text-slate-500">{apt.time} - {apt.notes}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getAppointmentTypeBadge(apt.type)}
                        <button className="text-slate-400 hover:text-red-500">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">{t('documents.toValidate')}</h2>
            
            <div className="space-y-4">
              <div className="p-4 border border-slate-200 rounded-lg hover:border-indigo-300 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <span className="text-red-600">📄</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{t('documents.synthesis')}</p>
                      <p className="text-sm text-slate-500">{t('documents.awaitingValidation')}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded hover:bg-slate-200">
                      Voir
                    </button>
                    <button className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200">
                      Valider
                    </button>
                  </div>
                </div>
              </div>
              
              <p className="text-slate-500 text-center py-4">
                Les documents de synthèse des clients apparaîtront ici pour validation.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Modal nouveau rendez-vous */}
      {showNewAppointmentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('appointmentForm.title')}</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('appointmentForm.client')}</label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">{t('appointmentForm.selectClient')}</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.full_name || c.email}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('appointmentForm.date')}</label>
                  <input type="date" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('appointmentForm.time')}</label>
                  <input type="time" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('appointmentForm.type')}</label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="preliminary">{t('appointmentForm.preliminary')}</option>
                  <option value="investigation">{t('appointmentForm.investigation')}</option>
                  <option value="conclusion">{t('appointmentForm.conclusion')}</option>
                  <option value="follow_up">{t('appointmentForm.followUp')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('appointmentForm.notes')}</label>
                <textarea className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" rows={3} />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewAppointmentModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultantDashboardPro;

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabaseClient';
import { organizationConfig } from '../config/organization';

interface User {
  id: string;
  email: string;
  full_name?: string;
  role: 'client' | 'consultant' | 'admin';
  created_at: string;
}

interface Assessment {
  id: string;
  user_id: string;
  title: string;
  status: string;
  created_at: string;
  completed_at?: string;
  package_name?: string;
}

interface Stats {
  totalUsers: number;
  totalClients: number;
  totalConsultants: number;
  totalAdmins: number;
  totalAssessments: number;
  completedAssessments: number;
  inProgressAssessments: number;
  revenue: number;
  satisfactionAvg: number;
  monthlyGrowth: number;
}

interface AdminDashboardProProps {
  onBack: () => void;
}

export const AdminDashboardPro: React.FC<AdminDashboardProProps> = ({ onBack }) => {
  const { t } = useTranslation('admin');
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'assessments' | 'reports' | 'settings'>('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalClients: 0,
    totalConsultants: 0,
    totalAdmins: 0,
    totalAssessments: 0,
    completedAssessments: 0,
    inProgressAssessments: 0,
    revenue: 0,
    satisfactionAvg: 4.5,
    monthlyGrowth: 12
  });
  const [userFilter, setUserFilter] = useState<'all' | 'client' | 'consultant' | 'admin'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger les utilisateurs
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (usersError) throw usersError;
      setUsers(usersData || []);

      // Charger les bilans
      const { data: assessmentsData, error: assessmentsError } = await supabase
        .from('assessments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (assessmentsError) throw assessmentsError;
      setAssessments(assessmentsData || []);

      // Calculer les statistiques
      const clients = usersData?.filter(u => u.role === 'client') || [];
      const consultants = usersData?.filter(u => u.role === 'consultant') || [];
      const admins = usersData?.filter(u => u.role === 'admin') || [];
      const completed = assessmentsData?.filter(a => a.status === 'completed') || [];
      const inProgress = assessmentsData?.filter(a => a.status === 'in_progress') || [];

      // Calculer le revenu estimé
      const revenue = completed.reduce((acc, a) => {
        const price = organizationConfig.pricing[a.package_name?.toLowerCase() as keyof typeof organizationConfig.pricing] || 0;
        return acc + price;
      }, 0);

      setStats({
        totalUsers: usersData?.length || 0,
        totalClients: clients.length,
        totalConsultants: consultants.length,
        totalAdmins: admins.length,
        totalAssessments: assessmentsData?.length || 0,
        completedAssessments: completed.length,
        inProgressAssessments: inProgress.length,
        revenue,
        satisfactionAvg: 4.5,
        monthlyGrowth: 12
      });
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId: string, newRole: 'client' | 'consultant' | 'admin') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) throw error;
      await loadData();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesFilter = userFilter === 'all' || user.role === userFilter;
    const matchesSearch = searchQuery === '' || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  // Données pour les graphiques (simulées)
  const monthlyData = [
    { month: 'Jan', bilans: 5, revenue: 6000 },
    { month: 'Fév', bilans: 8, revenue: 9600 },
    { month: 'Mar', bilans: 12, revenue: 14400 },
    { month: 'Avr', bilans: 10, revenue: 12000 },
    { month: 'Mai', bilans: 15, revenue: 18000 },
    { month: 'Juin', bilans: 18, revenue: 21600 }
  ];

  const getRoleBadge = (role: string) => {
    const roles: Record<string, { label: string; color: string }> = {
      admin: { label: t('users.roles.admin'), color: 'bg-red-100 text-red-800' },
      consultant: { label: t('users.roles.consultant'), color: 'bg-green-100 text-green-800' },
      client: { label: t('users.roles.client'), color: 'bg-blue-100 text-blue-800' }
    };
    const r = roles[role] || { label: role, color: 'bg-slate-100 text-slate-800' };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${r.color}`}>{r.label}</span>;
  };

  const getStatusBadge = (status: string) => {
    const statuses: Record<string, { label: string; color: string }> = {
      completed: { label: t('stats.completedBilans'), color: 'bg-green-100 text-green-800' },
      in_progress: { label: t('stats.inProgressBilans'), color: 'bg-orange-100 text-orange-800' },
      draft: { label: t('back'), color: 'bg-slate-100 text-slate-800' }
    };
    const s = statuses[status] || { label: status, color: 'bg-slate-100 text-slate-800' };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${s.color}`}>{s.label}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-800 border-r border-slate-700 p-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">BE</span>
          </div>
          <div>
            <h1 className="text-white font-bold">{t('title')}</h1>
            <p className="text-xs text-slate-400">{t('subtitle')}</p>
          </div>
        </div>

        <nav className="space-y-1">
          {[
            { id: 'overview', label: t('tabs.overview'), icon: '📊' },
            { id: 'users', label: t('tabs.users'), icon: '👥' },
            { id: 'assessments', label: t('tabs.bilans'), icon: '📋' },
            { id: 'reports', label: t('tabs.reports'), icon: '📈' },
            { id: 'settings', label: t('tabs.settings'), icon: '⚙️' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={onBack}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>{t('back')}</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 p-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {activeTab === 'overview' && 'Vue d\'ensemble'}
              {activeTab === 'users' && 'Gestion des utilisateurs'}
              {activeTab === 'assessments' && 'Gestion des bilans'}
              {activeTab === 'reports' && 'Rapports et statistiques'}
              {activeTab === 'settings' && 'Paramètres'}
            </h1>
            <p className="text-slate-400 text-sm">
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
              A
            </div>
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">👥</span>
                  </div>
                  <span className="text-green-400 text-sm flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    +{stats.monthlyGrowth}%
                  </span>
                </div>
                <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                <p className="text-slate-400 text-sm">{t('stats.totalUsers')}</p>
              </div>

              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">✅</span>
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">{stats.completedAssessments}</p>
                <p className="text-slate-400 text-sm">{t('stats.completedBilans')}</p>
              </div>

              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">⏳</span>
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">{stats.inProgressAssessments}</p>
                <p className="text-slate-400 text-sm">{t('stats.inProgressBilans')}</p>
              </div>

              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">{stats.revenue.toLocaleString('fr-FR')} €</p>
                <p className="text-slate-400 text-sm">{t('stats.revenue')}</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar chart - Bilans par mois */}
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-6">{t('charts.bilansByMonth')}</h3>
                <div className="flex items-end justify-between h-48 gap-4">
                  {monthlyData.map((data, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className="w-full bg-indigo-600 rounded-t-lg transition-all hover:bg-indigo-500"
                        style={{ height: `${(data.bilans / 20) * 100}%` }}
                      />
                      <span className="text-xs text-slate-400">{data.month}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pie chart - Répartition des utilisateurs */}
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-6">{t('charts.userDistribution')}</h3>
                <div className="flex items-center justify-center gap-8">
                  <div className="relative w-40 h-40">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#334155" strokeWidth="20" />
                      <circle 
                        cx="50" cy="50" r="40" fill="none" 
                        stroke="#3b82f6" strokeWidth="20"
                        strokeDasharray={`${(stats.totalClients / stats.totalUsers) * 251.2} 251.2`}
                      />
                      <circle 
                        cx="50" cy="50" r="40" fill="none" 
                        stroke="#22c55e" strokeWidth="20"
                        strokeDasharray={`${(stats.totalConsultants / stats.totalUsers) * 251.2} 251.2`}
                        strokeDashoffset={`-${(stats.totalClients / stats.totalUsers) * 251.2}`}
                      />
                      <circle 
                        cx="50" cy="50" r="40" fill="none" 
                        stroke="#ef4444" strokeWidth="20"
                        strokeDasharray={`${(stats.totalAdmins / stats.totalUsers) * 251.2} 251.2`}
                        strokeDashoffset={`-${((stats.totalClients + stats.totalConsultants) / stats.totalUsers) * 251.2}`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">{stats.totalUsers}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-slate-400">Clients ({stats.totalClients})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-slate-400">Consultants ({stats.totalConsultants})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-slate-400">Admins ({stats.totalAdmins})</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent activity */}
            <div className="bg-slate-800 rounded-xl border border-slate-700">
              <div className="p-6 border-b border-slate-700">
                <h3 className="text-lg font-semibold text-white">{t('activity.title')}</h3>
              </div>
              <div className="divide-y divide-slate-700">
                {assessments.slice(0, 5).map(assessment => (
                  <div key={assessment.id} className="p-4 flex items-center justify-between hover:bg-slate-700/50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                        <span>📋</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{assessment.title}</p>
                        <p className="text-sm text-slate-400">
                          {new Date(assessment.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(assessment.status)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-2">
                {[
                  { id: 'all', label: 'Tous' },
                  { id: 'client', label: 'Clients' },
                  { id: 'consultant', label: 'Consultants' },
                  { id: 'admin', label: 'Admins' }
                ].map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => setUserFilter(filter.id as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      userFilter === filter.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Users table */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">{t('users.table.user')}</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">{t('users.table.role')}</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">{t('users.table.registration')}</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">{t('users.table.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-slate-700/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 font-semibold">
                            {(user.full_name || user.email).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-medium">{user.full_name || 'Non renseigné'}</p>
                            <p className="text-sm text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                      <td className="px-6 py-4 text-slate-400">
                        {new Date(user.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={user.role}
                          onChange={(e) => handleChangeRole(user.id, e.target.value as any)}
                          className="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="client">{t('users.roles.client')}</option>
                          <option value="consultant">{t('users.roles.consultant')}</option>
                          <option value="admin">{t('users.roles.admin')}</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'assessments' && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Tous les bilans ({assessments.length})</h3>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Exporter CSV
              </button>
            </div>
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">{t('bilans.table.title')}</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">{t('bilans.table.package')}</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">{t('bilans.table.status')}</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">{t('bilans.table.date')}</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">{t('users.table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {assessments.map(assessment => (
                  <tr key={assessment.id} className="hover:bg-slate-700/30">
                    <td className="px-6 py-4 text-white">{assessment.title}</td>
                    <td className="px-6 py-4 text-slate-400">{assessment.package_name || '-'}</td>
                    <td className="px-6 py-4">{getStatusBadge(assessment.status)}</td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(assessment.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-indigo-400 hover:text-indigo-300">{t('bilans.view')}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">{t('reports.monthlyReport')}</h3>
                <p className="text-slate-400 text-sm mb-4">Générez un rapport détaillé de l'activité du mois.</p>
                <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Générer PDF
                </button>
              </div>
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">{t('reports.userExport')}</h3>
                <p className="text-slate-400 text-sm mb-4">Exportez la liste complète des utilisateurs.</p>
                <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Exporter CSV
                </button>
              </div>
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">{t('reports.qualiopiStats')}</h3>
                <p className="text-slate-400 text-sm mb-4">Indicateurs pour le renouvellement Qualiopi.</p>
                <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Voir les indicateurs
                </button>
              </div>
            </div>

            {/* KPIs Qualiopi */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-6">{t('qualiopi.indicators')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-400">{stats.satisfactionAvg}/5</p>
                  <p className="text-slate-400 text-sm">{t('qualiopi.averageSatisfaction')}</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-400">98%</p>
                  <p className="text-slate-400 text-sm">{t('qualiopi.completionRate')}</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-400">100%</p>
                  <p className="text-slate-400 text-sm">{t('qualiopi.documentCompliance')}</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-amber-400">95%</p>
                  <p className="text-slate-400 text-sm">{t('qualiopi.sixMonthFollowUp')}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-6">{t('settings.orgInfo')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">{t('settings.orgName')}</label>
                  <input
                    type="text"
                    defaultValue={organizationConfig.name}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">{t('settings.siret')}</label>
                  <input
                    type="text"
                    defaultValue={organizationConfig.siret}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">{t('settings.qualiopiNumber')}</label>
                  <input
                    type="text"
                    defaultValue={organizationConfig.qualiopi}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">{t('settings.nda')}</label>
                  <input
                    type="text"
                    defaultValue={organizationConfig.nda}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  />
                </div>
              </div>
              <button className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Enregistrer les modifications
              </button>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-6">{t('settings.pricing')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {Object.entries(organizationConfig.pricing).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-slate-400 mb-2 capitalize">{key}</label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        defaultValue={value}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-l-lg text-white"
                      />
                      <span className="px-4 py-2 bg-slate-600 border border-slate-600 rounded-r-lg text-slate-400">€</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboardPro;

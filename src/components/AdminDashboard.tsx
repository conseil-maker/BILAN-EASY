import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from './ToastProvider';
import { supabase } from '../lib/supabaseClient';
import { AssignmentManager } from './AssignmentManager';

interface User {
  id: string;
  email: string;
  full_name?: string;
  role: 'client' | 'consultant' | 'admin';
  created_at: string;
}

interface AdminDashboardProps {
  onBack: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const { t } = useTranslation('admin');
  const { showSuccess, showError } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalClients: 0,
    totalConsultants: 0,
    totalAssessments: 0
  });

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

      // Charger les statistiques
      const { data: assessmentsData, error: assessmentsError } = await supabase
        .from('assessments')
        .select('id');
      
      if (assessmentsError) throw assessmentsError;

      setStats({
        totalUsers: usersData?.length || 0,
        totalClients: usersData?.filter(u => u.role === 'client').length || 0,
        totalConsultants: usersData?.filter(u => u.role === 'consultant').length || 0,
        totalAssessments: assessmentsData?.length || 0
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
      
      // Recharger les données
      await loadData();
      showSuccess('Rôle mis à jour avec succès !');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error);
      showError('Erreur lors de la mise à jour du rôle.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement du dashboard...</p>
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
              <h1 className="text-4xl font-bold text-primary-800 mb-2">{t('title')}</h1>
              <p className="text-slate-600">{t('subtitle')}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl font-bold text-primary-600">{stats.totalUsers}</div>
            <div className="text-slate-600 mt-1">{t('stats.totalUsers')}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl font-bold text-blue-600">{stats.totalClients}</div>
            <div className="text-slate-600 mt-1">{t('users.roles.client')}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl font-bold text-green-600">{stats.totalConsultants}</div>
            <div className="text-slate-600 mt-1">{t('users.roles.consultant')}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl font-bold text-purple-600">{stats.totalAssessments}</div>
            <div className="text-slate-600 mt-1">{t('stats.completedBilans')}</div>
          </div>
        </div>

        {/* Gestion des affectations */}
        <div className="mb-8">
          <AssignmentManager />
        </div>

        {/* Liste des utilisateurs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800">{t('users.management')}</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {t('users.table.email')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {t('users.table.name')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {t('users.table.role')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {t('users.table.registration')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {t('users.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {user.full_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'consultant' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'admin' ? t('users.roles.admin') :
                         user.role === 'consultant' ? t('users.roles.consultant') :
                         t('users.roles.client')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(user.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <select
                        value={user.role}
                        onChange={(e) => handleChangeRole(user.id, e.target.value as any)}
                        className="border border-slate-300 rounded px-2 py-1 text-sm"
                      >
                        <option value="client">Client</option>
                        <option value="consultant">Consultant</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

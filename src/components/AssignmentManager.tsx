import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from './ToastProvider';
import { assignmentService } from '../services/assignmentService';

interface Client {
  id: string;
  email: string;
  full_name?: string;
}

interface Consultant {
  id: string;
  email: string;
  full_name?: string;
}

interface Assignment {
  id: string;
  assigned_at: string;
  consultant: Consultant;
  client: Client;
}

export const AssignmentManager: React.FC = () => {
  const { t } = useTranslation('admin');
  const { showSuccess, showError, showWarning } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [unassignedClients, setUnassignedClients] = useState<Client[]>([]);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedConsultant, setSelectedConsultant] = useState<string>('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [assignmentsData, unassignedData, consultantsData] = await Promise.all([
        assignmentService.getAllAssignments(),
        assignmentService.getUnassignedClients(),
        assignmentService.getAvailableConsultants()
      ]);
      
      setAssignments(assignmentsData as Assignment[]);
      setUnassignedClients(unassignedData);
      setConsultants(consultantsData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      showError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedClient || !selectedConsultant) {
      showWarning('Veuillez sélectionner un client et un consultant');
      return;
    }

    try {
      setProcessing(true);
      await assignmentService.assignClientToConsultant(selectedClient, selectedConsultant);
      setShowAssignModal(false);
      setSelectedClient('');
      setSelectedConsultant('');
      await loadData();
      showSuccess('Client assigné avec succès !');
    } catch (error: any) {
      console.error('Erreur lors de l\'affectation:', error);
      showError(error.message || 'Erreur lors de l\'affectation');
    } finally {
      setProcessing(false);
    }
  };

  const handleUnassign = async (assignmentId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir retirer cette affectation ?')) {
      return;
    }

    try {
      await assignmentService.unassignClient(assignmentId);
      await loadData();
      showSuccess('Affectation retirée avec succès !');
    } catch (error) {
      console.error('Erreur lors du retrait de l\'affectation:', error);
      showError('Erreur lors du retrait de l\'affectation');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{t('assignments.title')}</h2>
          <p className="text-slate-600 mt-1">
            {assignments.length} affectation{assignments.length > 1 ? 's' : ''} active{assignments.length > 1 ? 's' : ''} • {unassignedClients.length} client{unassignedClients.length > 1 ? 's' : ''} non assigné{unassignedClients.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowAssignModal(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
        >
          + {t('assignments.newAssignment')}
        </button>
      </div>

      {/* Clients non assignés */}
      {unassignedClients.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">
            ⚠️ Clients non assignés ({unassignedClients.length})
          </h3>
          <div className="space-y-1">
            {unassignedClients.map(client => (
              <div key={client.id} className="text-sm text-yellow-700">
                • {client.full_name || client.email}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Liste des affectations */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {assignments.length === 0 ? (
          <div className="p-8 text-center text-slate-600">
            {t('assignments.noAssignments')}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('users.table.name')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('assignments.consultant')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('assignments.assignDate')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('users.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {assignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">
                      {assignment.client.full_name || assignment.client.email}
                    </div>
                    {assignment.client.full_name && (
                      <div className="text-xs text-slate-500">{assignment.client.email}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">
                      {assignment.consultant.full_name || assignment.consultant.email}
                    </div>
                    {assignment.consultant.full_name && (
                      <div className="text-xs text-slate-500">{assignment.consultant.email}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(assignment.assigned_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleUnassign(assignment.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      {t('assignments.remove')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal d'affectation */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">{t('assignments.newAssignment')}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('assignments.selectClient')}
                </label>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                >
                  <option value="">-- {t('assignments.chooseClient')} --</option>
                  {unassignedClients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.full_name || client.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('assignments.selectConsultant')}
                </label>
                <select
                  value={selectedConsultant}
                  onChange={(e) => setSelectedConsultant(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                >
                  <option value="">-- {t('assignments.chooseConsultant')} --</option>
                  {consultants.map(consultant => (
                    <option key={consultant.id} value={consultant.id}>
                      {consultant.full_name || consultant.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedClient('');
                  setSelectedConsultant('');
                }}
                className="flex-1 bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors"
                disabled={processing}
              >
                {t('assignments.cancel')}
              </button>
              <button
                onClick={handleAssign}
                disabled={processing || !selectedClient || !selectedConsultant}
                className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                {processing ? t('assignments.assigning') : t('assignments.assign')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

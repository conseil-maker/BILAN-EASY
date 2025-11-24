import { supabase } from '../lib/supabaseClient';
import { authService } from './authService';

export interface Assignment {
  id: string;
  consultant_id: string;
  client_id: string;
  assigned_at: string;
  consultant?: {
    id: string;
    email: string;
    full_name?: string;
  };
  client?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

export const assignmentService = {
  // Assigner un client à un consultant
  async assignClientToConsultant(clientId: string, consultantId: string) {
    // Vérifier si l'affectation existe déjà
    const { data: existing, error: checkError } = await supabase
      .from('consultant_client_assignments')
      .select('id')
      .eq('client_id', clientId)
      .eq('consultant_id', consultantId)
      .single();
    
    if (existing) {
      throw new Error('Ce client est déjà assigné à ce consultant');
    }
    
    const { data, error } = await supabase
      .from('consultant_client_assignments')
      .insert({
        consultant_id: consultantId,
        client_id: clientId
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Retirer l'affectation d'un client
  async unassignClient(assignmentId: string) {
    const { error } = await supabase
      .from('consultant_client_assignments')
      .delete()
      .eq('id', assignmentId);
    
    if (error) throw error;
  },

  // Retirer un client d'un consultant spécifique
  async unassignClientFromConsultant(clientId: string, consultantId: string) {
    const { error } = await supabase
      .from('consultant_client_assignments')
      .delete()
      .eq('client_id', clientId)
      .eq('consultant_id', consultantId);
    
    if (error) throw error;
  },

  // Récupérer tous les clients d'un consultant
  async getConsultantClients(consultantId?: string) {
    const user = await authService.getCurrentUser();
    const targetConsultantId = consultantId || user?.id;
    
    if (!targetConsultantId) throw new Error('Consultant ID requis');
    
    const { data, error } = await supabase
      .from('consultant_client_assignments')
      .select(`
        id,
        assigned_at,
        client:client_id (
          id,
          email,
          full_name
        )
      `)
      .eq('consultant_id', targetConsultantId);
    
    if (error) throw error;
    return data;
  },

  // Récupérer tous les consultants d'un client
  async getClientConsultants(clientId?: string) {
    const user = await authService.getCurrentUser();
    const targetClientId = clientId || user?.id;
    
    if (!targetClientId) throw new Error('Client ID requis');
    
    const { data, error } = await supabase
      .from('consultant_client_assignments')
      .select(`
        id,
        assigned_at,
        consultant:consultant_id (
          id,
          email,
          full_name
        )
      `)
      .eq('client_id', targetClientId);
    
    if (error) throw error;
    return data;
  },

  // Récupérer toutes les affectations (pour Admin)
  async getAllAssignments() {
    const { data, error } = await supabase
      .from('consultant_client_assignments')
      .select(`
        id,
        assigned_at,
        consultant:consultant_id (
          id,
          email,
          full_name
        ),
        client:client_id (
          id,
          email,
          full_name
        )
      `)
      .order('assigned_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Vérifier si un client est assigné à un consultant
  async isClientAssignedToConsultant(clientId: string, consultantId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('consultant_client_assignments')
      .select('id')
      .eq('client_id', clientId)
      .eq('consultant_id', consultantId)
      .single();
    
    return !!data && !error;
  },

  // Récupérer les clients non assignés
  async getUnassignedClients() {
    // Récupérer tous les clients
    const { data: allClients, error: clientsError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('role', 'client');
    
    if (clientsError) throw clientsError;
    
    // Récupérer tous les clients assignés
    const { data: assignments, error: assignmentsError } = await supabase
      .from('consultant_client_assignments')
      .select('client_id');
    
    if (assignmentsError) throw assignmentsError;
    
    const assignedClientIds = new Set(assignments.map(a => a.client_id));
    
    // Filtrer les clients non assignés
    return allClients.filter(client => !assignedClientIds.has(client.id));
  },

  // Récupérer les consultants disponibles
  async getAvailableConsultants() {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('role', 'consultant')
      .order('full_name', { ascending: true });
    
    if (error) throw error;
    return data;
  }
};

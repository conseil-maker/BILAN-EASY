import { supabase, Assessment } from '../lib/supabaseClient';
import { authService } from './authService';

export const assessmentService = {
  // Créer un nouveau bilan
  async createAssessment(title: string, coachingStyle: 'collaborative' | 'analytical' | 'creative') {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Utilisateur non connecté');
    
    const { data, error } = await supabase
      .from('assessments')
      .insert({
        client_id: user.id,
        title,
        coaching_style: coachingStyle,
        status: 'draft'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Récupérer tous les bilans d'un client
  async getClientAssessments() {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Utilisateur non connecté');
    
    const { data, error} = await supabase
      .from('assessments')
      .select('*')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Récupérer un bilan spécifique
  async getAssessment(assessmentId: string) {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', assessmentId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Mettre à jour un bilan
  async updateAssessment(
    assessmentId: string, 
    updates: {
      cv_analysis?: any;
      questionnaire_data?: any;
      summary_data?: any;
      status?: 'draft' | 'in_progress' | 'completed' | 'archived';
      completed_at?: string;
    }
  ) {
    const { data, error } = await supabase
      .from('assessments')
      .update(updates)
      .eq('id', assessmentId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Sauvegarder l'analyse du CV
  async saveCVAnalysis(assessmentId: string, cvAnalysis: any) {
    return this.updateAssessment(assessmentId, {
      cv_analysis: cvAnalysis,
      status: 'in_progress'
    });
  },

  // Sauvegarder les données du questionnaire
  async saveQuestionnaireData(assessmentId: string, questionnaireData: any) {
    return this.updateAssessment(assessmentId, {
      questionnaire_data: questionnaireData
    });
  },

  // Sauvegarder la synthèse du bilan
  async saveSummary(assessmentId: string, summaryData: any) {
    return this.updateAssessment(assessmentId, {
      summary_data: summaryData,
      status: 'completed',
      completed_at: new Date().toISOString()
    });
  },

  // Supprimer un bilan
  async deleteAssessment(assessmentId: string) {
    const { error } = await supabase
      .from('assessments')
      .delete()
      .eq('id', assessmentId);
    
    if (error) throw error;
  },

  // Récupérer les bilans pour un consultant
  async getConsultantAssessments() {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Utilisateur non connecté');
    
    // Récupérer les IDs des clients assignés au consultant
    const { data: assignments, error: assignError } = await supabase
      .from('consultant_client_assignments')
      .select('client_id')
      .eq('consultant_id', user.id);
    
    if (assignError) throw assignError;
    
    const clientIds = assignments.map(a => a.client_id);
    
    if (clientIds.length === 0) return [];
    
    // Récupérer les bilans de ces clients
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .in('client_id', clientIds)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};

import { supabase, ChatSession } from '../lib/supabaseClient';

export const chatService = {
  // Créer une nouvelle session de chat
  async createChatSession(
    assessmentId: string,
    sessionType: 'text' | 'voice',
    messages: any[] = []
  ) {
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({
        assessment_id: assessmentId,
        session_type: sessionType,
        messages
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Récupérer les sessions de chat d'un bilan
  async getChatSessions(assessmentId: string) {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('assessment_id', assessmentId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Récupérer une session spécifique
  async getChatSession(sessionId: string) {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Mettre à jour les messages d'une session
  async updateChatSession(sessionId: string, messages: any[]) {
    const { data, error } = await supabase
      .from('chat_sessions')
      .update({ messages })
      .eq('id', sessionId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Ajouter un message à une session
  async addMessage(sessionId: string, message: any) {
    // Récupérer la session actuelle
    const session = await this.getChatSession(sessionId);
    
    // Ajouter le nouveau message
    const updatedMessages = [...session.messages, message];
    
    // Mettre à jour la session
    return this.updateChatSession(sessionId, updatedMessages);
  },

  // Supprimer une session de chat
  async deleteChatSession(sessionId: string) {
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId);
    
    if (error) throw error;
  }
};

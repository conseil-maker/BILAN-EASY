import { supabase } from '../lib/supabaseClient';

export const authService = {
  // Inscription
  async signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });
    
    if (error) throw error;
    return data;
  },

  // Connexion
  async signIn(email: string, password: string) {
    console.log('[AUTH] Tentative de connexion pour:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('[AUTH] Erreur de connexion:', error);
      throw error;
    }
    console.log('[AUTH] Connexion réussie:', data.user?.email);
    return data;
  },

  // Déconnexion
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Récupérer l'utilisateur connecté
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Récupérer le profil complet
  async getUserProfile() {
    const user = await this.getCurrentUser();
    if (!user) {
      console.log('[AUTH] Aucun utilisateur connecté');
      return null;
    }
    
    console.log('[AUTH] Récupération du profil pour:', user.email);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error('[AUTH] Erreur récupération profil:', error);
      throw error;
    }
    console.log('[AUTH] Profil récupéré:', data);
    return data;
  },

  // Vérifier le rôle de l'utilisateur
  async getUserRole(): Promise<'client' | 'consultant' | 'admin' | null> {
    const profile = await this.getUserProfile();
    return profile?.role || null;
  },

  // Mettre à jour le profil
  async updateProfile(updates: {
    full_name?: string;
    avatar_url?: string;
  }) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Utilisateur non connecté');
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Écouter les changements d'authentification
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

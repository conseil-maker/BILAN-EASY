const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pkhhxouuavfqzccahihe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBraGh4b3V1YXZmcXpjY2FoaWhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1MjA3NTQsImV4cCI6MjA0ODA5Njc1NH0.1C_YvqkUbqLmYVvYxzRXB1Nt-Gm4lqCVOIxVRNvDPjU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConsultantLogin() {
  console.log('🔐 Test de connexion Consultant...\n');
  
  try {
    // Connexion
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'test.nouveau@gmail.com',
      password: 'Test2024!'
    });
    
    if (authError) {
      console.error('❌ Erreur de connexion:', authError.message);
      return;
    }
    
    console.log('✅ Connexion réussie!');
    console.log('User ID:', authData.user.id);
    console.log('Email:', authData.user.email);
    
    // Récupérer le profil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Erreur profil:', profileError.message);
      return;
    }
    
    console.log('\n📋 Profil:');
    console.log('Rôle:', profile.role);
    console.log('Email:', profile.email);
    
    // Récupérer les clients assignés
    const { data: assignments, error: assignError } = await supabase
      .from('consultant_client_assignments')
      .select(`
        *,
        client:profiles!consultant_client_assignments_client_id_fkey(*)
      `)
      .eq('consultant_id', authData.user.id);
    
    if (assignError) {
      console.error('❌ Erreur affectations:', assignError.message);
      return;
    }
    
    console.log('\n👥 Clients assignés:', assignments.length);
    assignments.forEach((assignment, index) => {
      console.log(`\nClient ${index + 1}:`);
      console.log('  Email:', assignment.client.email);
      console.log('  Rôle:', assignment.client.role);
      console.log('  Date affectation:', new Date(assignment.created_at).toLocaleDateString('fr-FR'));
    });
    
    console.log('\n✅ Tous les tests passent! Le dashboard Consultant devrait fonctionner parfaitement.');
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
  }
}

testConsultantLogin();

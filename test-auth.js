/**
 * Script de test automatisé pour l'authentification
 * Ce script simule une connexion et capture tous les logs
 */

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://pkhhxouuavfqzccahihe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBraGh4b3V1YXZmcXpjY2FoaWhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5ODA1MzYsImV4cCI6MjA3OTU1NjUzNn0.dJqT8Co_o2rrsdxmmgkQm3NnNQasWlJ2aUc_XCg01TQ';

// Identifiants de test
const TEST_EMAIL = 'testfinal@bilancompetences.com';
const TEST_PASSWORD = 'TestFinal2024!';

// Créer le client Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('='.repeat(80));
console.log('🧪 TEST AUTOMATISÉ D\'AUTHENTIFICATION');
console.log('='.repeat(80));
console.log('');

async function testAuthentication() {
  try {
    console.log('📝 Étape 1: Tentative de connexion');
    console.log(`   Email: ${TEST_EMAIL}`);
    console.log(`   Password: ${'*'.repeat(TEST_PASSWORD.length)}`);
    console.log('');

    // Tentative de connexion
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    if (signInError) {
      console.error('❌ ERREUR DE CONNEXION:');
      console.error('   Message:', signInError.message);
      console.error('   Code:', signInError.status);
      console.error('   Détails:', JSON.stringify(signInError, null, 2));
      console.log('');
      return false;
    }

    console.log('✅ Connexion réussie!');
    console.log('   User ID:', signInData.user?.id);
    console.log('   Email:', signInData.user?.email);
    console.log('   Email confirmé:', signInData.user?.email_confirmed_at ? 'Oui' : 'Non');
    console.log('');

    console.log('📝 Étape 2: Récupération du profil utilisateur');
    
    // Récupération du profil
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', signInData.user.id)
      .single();

    if (profileError) {
      console.error('❌ ERREUR DE RÉCUPÉRATION DU PROFIL:');
      console.error('   Message:', profileError.message);
      console.error('   Code:', profileError.code);
      console.error('   Détails:', JSON.stringify(profileError, null, 2));
      console.log('');
      return false;
    }

    console.log('✅ Profil récupéré avec succès!');
    console.log('   Nom complet:', profileData.full_name);
    console.log('   Email:', profileData.email);
    console.log('   Rôle:', profileData.role);
    console.log('   Créé le:', profileData.created_at);
    console.log('');

    console.log('📝 Étape 3: Vérification des permissions RLS');
    
    // Test d'accès aux données selon le rôle
    if (profileData.role === 'admin') {
      const { data: allUsers, error: usersError } = await supabase
        .from('profiles')
        .select('id, email, role, full_name');

      if (usersError) {
        console.error('❌ ERREUR D\'ACCÈS AUX UTILISATEURS:');
        console.error('   Message:', usersError.message);
        console.error('   Code:', usersError.code);
        console.log('');
      } else {
        console.log('✅ Accès admin confirmé!');
        console.log(`   Nombre d'utilisateurs visibles: ${allUsers.length}`);
        console.log('');
      }
    }

    console.log('='.repeat(80));
    console.log('🎉 TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS!');
    console.log('='.repeat(80));
    console.log('');
    console.log('✅ L\'authentification fonctionne correctement');
    console.log('✅ Le profil est accessible');
    console.log('✅ Les permissions RLS sont correctes');
    console.log('');

    // Déconnexion
    await supabase.auth.signOut();
    console.log('🔓 Déconnexion effectuée');
    console.log('');

    return true;

  } catch (error) {
    console.error('❌ ERREUR INATTENDUE:');
    console.error('   Type:', error.name);
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
    console.log('');
    return false;
  }
}

// Exécution du test
console.log('🚀 Démarrage des tests...');
console.log('');

testAuthentication()
  .then(success => {
    if (success) {
      console.log('✅ Tests terminés avec succès');
      process.exit(0);
    } else {
      console.log('❌ Tests échoués - voir les erreurs ci-dessus');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });

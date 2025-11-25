import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pkhhxouuavfqzccahihe.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'YOUR_SERVICE_KEY';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestUsers() {
  const users = [
    {
      email: 'admin@bilancompetences.fr',
      password: 'Admin123!',
      role: 'admin',
      full_name: 'Administrateur Test'
    },
    {
      email: 'consultant@bilancompetences.fr',
      password: 'Consultant123!',
      role: 'consultant',
      full_name: 'Consultant Test'
    },
    {
      email: 'client@bilancompetences.fr',
      password: 'Client123!',
      role: 'client',
      full_name: 'Client Test'
    }
  ];

  for (const user of users) {
    console.log(`Création de l'utilisateur ${user.email}...`);
    
    // Créer l'utilisateur dans auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true
    });

    if (authError) {
      console.error(`Erreur pour ${user.email}:`, authError.message);
      continue;
    }

    console.log(`✓ Utilisateur créé: ${user.email}`);

    // Mettre à jour le profil avec le rôle
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        role: user.role,
        full_name: user.full_name
      })
      .eq('id', authData.user.id);

    if (profileError) {
      console.error(`Erreur de profil pour ${user.email}:`, profileError.message);
    } else {
      console.log(`✓ Profil mis à jour: ${user.role}`);
    }
  }

  console.log('\n✅ Tous les comptes de test ont été créés!');
  console.log('\nIdentifiants de connexion:');
  console.log('Admin: admin@bilancompetences.fr / Admin123!');
  console.log('Consultant: consultant@bilancompetences.fr / Consultant123!');
  console.log('Client: client@bilancompetences.fr / Client123!');
}

createTestUsers().catch(console.error);

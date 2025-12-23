# 🎯 Bilan de Compétences IA - Documentation Complète

## 📊 Vue d'Ensemble

**Bilan Easy** est une plateforme SaaS complète pour la réalisation de bilans de compétences assistés par intelligence artificielle. Elle intègre :

- ✅ **API Gemini** : IA conversationnelle pour un accompagnement personnalisé (Coach Live + Coach Chat)
- ✅ **Supabase** : Backend avec authentification et base de données PostgreSQL
- ✅ **Architecture Multi-tenant** : 3 rôles (Admin, Consultant, Client)
- ✅ **Vercel** : Déploiement et hébergement

---

## 🏗️ Architecture Technique

### Stack Technologique

```
Frontend:
├── React 18 + TypeScript
├── Vite (build tool)
├── TailwindCSS (styling)
└── Supabase Client (auth + database)

Backend:
├── Supabase (PostgreSQL + Auth + Storage)
└── API Gemini (IA conversationnelle)

Déploiement:
└── Vercel (CI/CD automatique depuis GitHub)
```

### Structure du Projet

```
/BILAN-EASY
├── src/
│   ├── components/           # Composants React
│   │   ├── AuthWrapper.tsx   # Gestion authentification
│   │   ├── ClientApp.tsx     # Application client principale
│   │   ├── AdminDashboard.tsx
│   │   ├── ConsultantDashboard.tsx
│   │   ├── WelcomeScreen.tsx
│   │   ├── PackageSelector.tsx
│   │   ├── Questionnaire.tsx
│   │   ├── CoachChat.tsx     # Coach textuel
│   │   ├── LiveCoach.tsx     # Coach vocal
│   │   └── ... (14 composants client)
│   │
│   ├── services/             # Services métier
│   │   ├── geminiService.ts  # Intégration Gemini AI
│   │   ├── historyService.ts
│   │   ├── liveService.ts
│   │   ├── ttsService.ts
│   │   ├── assessmentService.ts
│   │   ├── assignmentService.ts
│   │   └── authService.ts
│   │
│   ├── hooks/                # Hooks React personnalisés
│   │   ├── useSpeechRecognition.ts
│   │   └── useSpeechSynthesis.ts
│   │
│   ├── utils/                # Utilitaires
│   │   └── audio.ts
│   │
│   ├── lib/
│   │   └── supabaseClient.ts # Configuration Supabase
│   │
│   ├── types-ai-studio.ts    # Types TypeScript
│   ├── constants.ts          # Constantes
│   ├── App.tsx              # Composant racine
│   └── index.tsx            # Point d'entrée
│
├── dist/                    # Build de production
├── vercel.json             # Configuration Vercel
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🎭 Rôles et Fonctionnalités

### 👤 Client

**Accès** : Interface client complète

**Fonctionnalités** :
- ✅ Sélection de package (Essentiel, Complet, Premium)
- ✅ Phase préliminaire (objectifs, contexte)
- ✅ Personnalisation du coaching (style, préférences)
- ✅ Questionnaires adaptatifs intelligents
- ✅ Coach Chat (IA textuelle)
- ✅ Coach Live (IA vocale avec reconnaissance vocale)
- ✅ Visualisations interactives (radar de compétences, graphiques)
- ✅ Dashboard de synthèse
- ✅ Export PDF/JSON/CSV
- ✅ Historique des bilans

### 👨‍💼 Consultant

**Accès** : Dashboard consultant

**Fonctionnalités** :
- ✅ Vue sur tous les clients assignés
- ✅ Accès aux assessments des clients
- ✅ Suivi de progression
- ✅ Notes et commentaires
- ✅ Gestion des rendez-vous

### 👑 Admin

**Accès** : Dashboard administrateur

**Fonctionnalités** :
- ✅ Gestion des utilisateurs (clients, consultants)
- ✅ Attribution clients ↔ consultants
- ✅ Vue globale sur tous les bilans
- ✅ Statistiques et analytics
- ✅ Configuration de la plateforme

---

## 🚀 Installation et Démarrage Local

### Prérequis

```bash
Node.js >= 18
npm >= 9
```

### Installation

```bash
# Cloner le repository
git clone https://github.com/conseil-maker/BILAN-EASY.git
cd BILAN-EASY

# Installer les dépendances
npm install
```

### Configuration

Créer un fichier `.env` à la racine :

```env
VITE_SUPABASE_URL=https://pkhhxouuavfqzccahihe.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_GEMINI_API_KEY=AIzaSyDqVOTHE_JMV-V0...
```

### Démarrage en Développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

### Build de Production

```bash
npm run build
```

Les fichiers compilés seront dans `/dist`

### Servir le Build de Production Localement

```bash
npx serve dist -l 5001
```

---

## 🧪 Comptes de Test

### Admin
- **Email** : testfinal@bilancompetences.com
- **Mot de passe** : password123
- **Rôle** : admin

### Consultant
- **Email** : test.nouveau@gmail.com
- **Mot de passe** : password123
- **Rôle** : consultant

### Client
- **Email** : admin.bilan@gmail.com
- **Mot de passe** : password123
- **Rôle** : client

---

## 📦 Base de Données Supabase

### Tables Principales

#### `profiles`
```sql
- id (uuid, PK)
- email (text)
- role (text: 'admin' | 'consultant' | 'client')
- full_name (text)
- created_at (timestamp)
```

#### `assessments`
```sql
- id (uuid, PK)
- client_id (uuid, FK → profiles)
- consultant_id (uuid, FK → profiles)
- package_type (text)
- status (text)
- data (jsonb)
- created_at (timestamp)
- updated_at (timestamp)
```

#### `assignments`
```sql
- id (uuid, PK)
- client_id (uuid, FK → profiles)
- consultant_id (uuid, FK → profiles)
- created_at (timestamp)
```

---

## 🔧 Déploiement Vercel

### Configuration Automatique

Le projet est configuré pour un déploiement automatique via GitHub :

1. **Push sur `main`** → Déploiement automatique
2. **Pull Request** → Preview deployment

### Configuration Manuelle

#### Variables d'Environnement sur Vercel

Dans le dashboard Vercel (Settings → Environment Variables) :

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_GEMINI_API_KEY
```

#### vercel.json

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "routes": [
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### ⚠️ Problème Actuel de Déploiement Vercel

**Symptôme** : Page blanche sur https://bilan-easy.vercel.app

**Cause** : Cache CDN Vercel qui ne se met pas à jour

**Solutions** :

1. **Vider le cache Vercel** :
   - Aller sur https://vercel.com/conseil-maker/bilan-easy
   - Settings → General → Clear Build Cache
   - Redéployer

2. **Contacter le support Vercel** :
   - Demander un purge du cache CDN
   - Mentionner le projet ID : `prj_wjE3TJHfFAf6SEBlRAmhMJDD1JWI`

3. **Alternative temporaire** :
   - Déployer sur Netlify ou Cloudflare Pages
   - Ou utiliser la version locale

**Note** : Le code compile parfaitement et fonctionne en local. C'est uniquement un problème de cache Vercel.

---

## 🎨 Fonctionnalités IA Intégrées

### 1. Questionnaires Adaptatifs

- Questions générées dynamiquement par Gemini AI
- Adaptation selon les réponses précédentes
- Analyse sémantique des réponses

### 2. Coach Chat

- Conversation textuelle avec IA
- Conseils personnalisés
- Historique de conversation

### 3. Coach Live

- Interaction vocale en temps réel
- Reconnaissance vocale (Web Speech API)
- Synthèse vocale (TTS)
- Transcription automatique

### 4. Visualisations

- Radar de compétences interactif
- Graphiques de progression
- Timeline du parcours

### 5. Export

- **PDF** : Rapport complet avec graphiques
- **JSON** : Données brutes pour intégrations
- **CSV** : Export tableur pour analyse

---

## 🔐 Sécurité

### Authentification

- ✅ Supabase Auth (JWT)
- ✅ Row Level Security (RLS) sur PostgreSQL
- ✅ Hashage bcrypt des mots de passe
- ✅ Sessions sécurisées

### Autorizations

- ✅ Middleware de vérification des rôles
- ✅ Isolation des données par utilisateur
- ✅ API endpoints protégés

---

## 📝 Workflow de Développement

### Branches

- `main` : Production (déploiement auto sur Vercel)
- `dev` : Développement
- `feature/*` : Nouvelles fonctionnalités

### Commits

Format recommandé :
```
feat: add new feature
fix: resolve bug
docs: update documentation
chore: maintenance tasks
```

### Tests

```bash
# Lancer les tests (à configurer)
npm test

# Linter
npm run lint
```

---

## 🐛 Dépannage

### Problème : Page blanche en local

**Solution** :
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Problème : Erreur Supabase

**Vérifier** :
1. Variables d'environnement `.env`
2. Connexion internet
3. Clés API valides

### Problème : Build échoue

**Vérifier** :
1. Version Node.js >= 18
2. Pas d'erreurs TypeScript
3. Dépendances installées

---

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Gemini AI](https://ai.google.dev/docs)
- [Documentation React](https://react.dev)
- [Documentation Vite](https://vitejs.dev)

---

## 🤝 Support

Pour toute question ou problème :

1. Consulter cette documentation
2. Vérifier les issues GitHub
3. Contacter l'équipe de développement

---

## 📄 Licence

Propriétaire - Tous droits réservés

---

**Version** : 1.0.0  
**Dernière mise à jour** : Décembre 2025  
**Statut** : ✅ Fonctionnel en local | ⚠️ Déploiement Vercel en cours de résolution

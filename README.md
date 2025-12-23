<div align="center">

# 🎯 Bilan Easy - Bilan de Compétences IA

**Plateforme SaaS de bilan de compétences assisté par intelligence artificielle**

</div>

## 📋 Description

Bilan Easy est une application web complète pour la réalisation de bilans de compétences, intégrant :

- 🤖 **API Gemini** : IA conversationnelle pour un accompagnement personnalisé
- 🔐 **Supabase** : Backend avec authentification et base de données PostgreSQL
- 👥 **Multi-tenant** : 3 rôles (Admin, Consultant, Client)
- 📄 **Documents Qualiopi** : Génération automatique des documents réglementaires

## 🚀 Installation

**Prérequis :** Node.js 18+

1. Cloner le repository :
   ```bash
   git clone https://github.com/conseil-maker/BILAN-EASY.git
   cd BILAN-EASY
   ```

2. Installer les dépendances :
   ```bash
   npm install
   ```

3. Configurer les variables d'environnement dans `.env.local` :
   ```env
   VITE_GEMINI_API_KEY=votre_clé_api_gemini
   VITE_SUPABASE_URL=votre_url_supabase
   VITE_SUPABASE_ANON_KEY=votre_clé_anon_supabase
   ```

4. Lancer l'application :
   ```bash
   npm run dev
   ```

## 🔑 Configuration des clés API

### Gemini API
1. Aller sur [Google AI for Developers](https://ai.google.dev/)
2. Créer une clé API
3. Ajouter la clé dans `VITE_GEMINI_API_KEY`

### Supabase
1. Créer un projet sur [Supabase](https://supabase.com)
2. Récupérer l'URL et la clé anon dans les paramètres du projet
3. Configurer les variables `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`

## 📁 Structure du projet

```
src/
├── components/       # Composants React
├── services/         # Services métier (Gemini, Supabase, PDF)
├── hooks/            # Hooks personnalisés
├── types/            # Types TypeScript
└── data/             # Données statiques
```

## 🛠️ Technologies

- **Frontend** : React 18 + TypeScript + Vite
- **Styling** : TailwindCSS
- **Backend** : Supabase (Auth + PostgreSQL)
- **IA** : API Gemini (Google)
- **Déploiement** : Vercel

## 📄 Licence

Propriétaire - NETZ INFORMATIQUE

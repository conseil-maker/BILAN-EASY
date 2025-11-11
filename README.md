<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# Bilan de Compétences IA

Une application interactive pour réaliser votre bilan de compétences avec l'aide de l'intelligence artificielle Gemini.

[![Built with AI Studio](https://img.shields.io/badge/Built%20with-AI%20Studio-blue)](https://aistudio.google.com/apps)
[![React](https://img.shields.io/badge/React-19.2.0-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-purple)](https://vitejs.dev/)

</div>

## 📋 Table des matières

- [Vue d'ensemble](#-vue-densemble)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture du projet](#-architecture-du-projet)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Utilisation](#-utilisation)
- [Structure des données](#-structure-des-données)
- [API Gemini](#-api-gemini)
- [Dépannage](#-dépannage)
- [Contribution](#-contribution)

## 🎯 Vue d'ensemble

**BILAN-EASY** est une application web React/TypeScript qui propose un bilan de compétences interactif et personnalisé, alimenté par l'IA Gemini 2.5. L'application guide l'utilisateur à travers trois phases structurées pour explorer ses compétences, motivations et aspirations professionnelles.

**Version AI Studio**: [Voir dans AI Studio](https://ai.studio/apps/drive/1xKIXDV1a-WYTmcI6iSQtpDZmqzFlPdmG)

### 🎉 Dernières améliorations (Dernière mise à jour: Décembre 2024)

✅ **Backend complet intégré**: API REST avec Hono.js, PostgreSQL, Drizzle ORM
✅ **Authentification**: Système de session personnalisé (remplacement de Clerk)
✅ **Docker**: Configuration complète avec Docker Compose (Frontend, Backend, PostgreSQL)
✅ **Tests**: Vitest configuré pour frontend et backend
✅ **Error Handling**: Error Boundary, Toast notifications, retry mechanism
✅ **Performance**: Debouncing, pagination, code splitting, connection pooling
✅ **PDF Export**: Génération PDF avec jsPDF et html2canvas
✅ **API Retry**: Mécanisme de retry automatique pour erreurs Gemini API (503, 429)
✅ **State Management**: Synchronisation d'état améliorée, prévention des boucles infinies
✅ **Questionnaire Flow**: Correction du flux multi-étapes, satisfaction modal unique par phase

## ✨ Fonctionnalités

### 🎤 **Interface conversationnelle**
- Chat interactif avec l'IA coach
- Questions dynamiques générées par Gemini
- Synthèses régulières toutes les 3 réponses
- Support de la voix (speech-to-text et text-to-speech)

### 📦 **Trois formules de bilan**

| Formule | Durée | Questions | Description |
|---------|-------|-----------|-------------|
| **Parcours Découverte** | 5h | 3 | Premier point sur vos compétences |
| **Bilan Approfondi** | 12h | 6 | Exploration complète avec plan d'action |
| **Accompagnement Stratégique** | 24h | 9 | Premium pour transitions majeures |

### 🎨 **Styles de coaching**
- **Collaboratif**: Chaleureux et encourageant
- **Analytique**: Méthodique et structuré
- **Créatif**: Inspirant et novateur

### 📊 **Tableaux de bord en temps réel**
- Nuage de mots (thèmes émergents)
- Radar des compétences (5 dimensions)
- Visualisation de la progression

### 💾 **Sauvegarde et historique**
- Sauvegarde automatique toutes les 5 questions
- Reprise de session inachevée
- Historique complet des bilans
- Export JSON/CSV des données

### 🎓 **Modules optionnels adaptatifs**
L'IA suggère des modules selon les besoins détectés:
- Gestion de transition
- Confiance en soi
- Équilibre vie pro/perso

### 📄 **Synthèse finale**
- Type de profil professionnel
- Forces clés avec justifications (citations)
- Axes de développement
- Plan d'action court/moyen terme
- Recommandations personnalisées
- Export PDF avec visualisations

## 🏗️ Architecture du projet

```
BILAN-EASY/
├── 📁 components/           # Composants React
│   ├── WelcomeScreen.tsx       # Écran d'accueil
│   ├── PackageSelector.tsx     # Sélection de formule
│   ├── PhasePreliminaire.tsx   # Intro et choix de style
│   ├── PersonalizationStep.tsx # Analyse CV (optionnel)
│   ├── Questionnaire.tsx       # Interface chat principale ⭐
│   ├── SummaryDashboard.tsx    # Synthèse finale ⭐
│   ├── HistoryScreen.tsx       # Historique des bilans
│   ├── Dashboard.tsx           # Dashboard temps réel
│   ├── JourneyProgress.tsx     # Barre de progression
│   ├── SkillsRadar.tsx         # Graphique radar
│   ├── WordCloud.tsx           # Nuage de mots
│   ├── SpeechSettings.tsx      # Paramètres vocaux
│   ├── ErrorBoundary.tsx       # Gestion d'erreurs globales
│   ├── Toast.tsx               # Notifications toast
│   └── SkeletonLoader.tsx     # Loaders de chargement
│
├── 📁 services/             # Logique métier
│   ├── geminiService.ts        # API Gemini 2.5 (génération) ⭐
│   ├── apiClient.ts            # Client API backend ⭐
│   ├── historyService.ts       # Gestion localStorage
│   ├── ttsService.ts           # Text-to-speech
│   └── liveService.ts          # Services live
│
├── 📁 hooks/                # Hooks React personnalisés
│   ├── useSpeechRecognition.ts # Speech-to-text
│   ├── useSpeechSynthesis.ts    # Text-to-speech
│   ├── useDebounce.ts          # Debouncing
│   └── useOfflineDetection.ts  # Détection hors ligne
│
├── 📁 backend/              # Backend API (Hono.js + PostgreSQL)
│   ├── src/
│   │   ├── app.ts              # Application Hono
│   │   ├── db/
│   │   │   ├── schema.ts       # Schéma Drizzle ORM
│   │   │   └── client.ts       # Client PostgreSQL
│   │   ├── routes/             # Routes API
│   │   │   ├── assessments.ts
│   │   │   ├── answers.ts
│   │   │   └── summaries.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts         # Authentification
│   │   │   └── error.ts        # Gestion d'erreurs
│   │   └── test/               # Tests Vitest
│   ├── Dockerfile
│   └── package.json
│
├── 📁 src/test/             # Tests frontend (Vitest)
│   ├── components/
│   ├── hooks/
│   └── services/
│
├── 📄 App.tsx               # Composant racine (routing)
├── 📄 types.ts              # Définitions TypeScript
├── 📄 constants.ts          # Packages et catégories
├── 📄 index.tsx             # Point d'entrée
├── 📄 vite.config.ts        # Configuration Vite
├── 📄 tsconfig.json         # Configuration TypeScript
├── 📄 package.json          # Dépendances npm
├── 📄 Dockerfile             # Docker frontend
├── 📄 docker-compose.yml     # Orchestration Docker
├── 📄 nginx.conf             # Configuration Nginx
└── 📄 .env.local             # Variables d'environnement ⚠️

⭐ Fichiers critiques
⚠️ Nécessite configuration
```

## 🚀 Installation

### Prérequis
- **Node.js** (v18+)
- **npm** ou **yarn**
- **PostgreSQL** (v14+) - Pour le backend
- **Docker & Docker Compose** (optionnel, pour déploiement)
- **Clé API Gemini** ([Obtenir ici](https://aistudio.google.com/app/apikey))

### Installation locale

```bash
# 1. Cloner le dépôt
git clone https://github.com/lekesiz/BILAN-EASY.git
cd BILAN-EASY

# 2. Installer les dépendances frontend
npm install

# 3. Installer les dépendances backend
cd backend
npm install
cd ..

# 4. Configurer les variables d'environnement
# Frontend: .env.local
echo "GEMINI_API_KEY=votre_clé_ici" > .env.local

# Backend: backend/.env
echo "DATABASE_URL=postgresql://user:password@localhost:5432/bilan_easy" > backend/.env
echo "PORT=3001" >> backend/.env
echo "FRONTEND_URL=http://localhost:3000" >> backend/.env
echo "TEST_MODE=true" >> backend/.env

# 5. Créer la base de données
cd backend
npm run db:push
cd ..

# 6. Lancer en développement
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
npm run dev
```

### Installation avec Docker

```bash
# 1. Cloner le dépôt
git clone https://github.com/lekesiz/BILAN-EASY.git
cd BILAN-EASY

# 2. Configurer les variables d'environnement
# Créer .env.local avec GEMINI_API_KEY
echo "GEMINI_API_KEY=votre_clé_ici" > .env.local

# 3. Lancer avec Docker Compose
docker-compose up -d

# 4. Accéder à l'application
# Frontend: http://localhost:3000
# Backend: http://localhost:3001/api
```

Voir [DEPLOYMENT.md](DEPLOYMENT.md) pour plus de détails.

## ⚙️ Configuration

### Clés API AI (Au moins une OBLIGATOIRE)

**Fichier**: `.env.local` (frontend)

Le système supporte maintenant **multi-provider AI** avec fallback automatique entre Gemini, OpenAI et Claude. Si un provider échoue, le système bascule automatiquement vers un autre.

```bash
# Gemini (Recommandé - Le plus rapide et économique)
VITE_GEMINI_API_KEY=votre_clé_api_gemini_ici
# ou
GEMINI_API_KEY=votre_clé_api_gemini_ici

# OpenAI (Optionnel - Fallback)
VITE_OPENAI_API_KEY=votre_clé_api_openai_ici
VITE_OPENAI_MODEL=gpt-4o  # ou gpt-4o-mini, gpt-4-turbo

# Claude (Optionnel - Fallback)
VITE_CLAUDE_API_KEY=votre_clé_api_claude_ici
VITE_CLAUDE_MODEL=claude-3-5-sonnet-20241022  # ou claude-3-opus-20240229
```

**Comment obtenir les clés**:
- **Gemini**: [Google AI Studio](https://aistudio.google.com/app/apikey)
- **OpenAI**: [OpenAI Platform](https://platform.openai.com/api-keys)
- **Claude**: [Anthropic Console](https://console.anthropic.com/)

**Configuration minimale**: Au moins une clé API est requise. Pour une meilleure fiabilité, configurez plusieurs providers.

**Pour Docker**: Voir [GEMINI_API_KEY_SETUP.md](GEMINI_API_KEY_SETUP.md)

### Variables d'environnement

#### Frontend (`.env.local`)

| Variable | Description | Requis |
|----------|-------------|--------|
| `GEMINI_API_KEY` ou `VITE_GEMINI_API_KEY` | Clé API Gemini 2.5 | ✅ Au moins un |
| `VITE_OPENAI_API_KEY` | Clé API OpenAI (fallback) | ⚠️ Optionnel |
| `VITE_CLAUDE_API_KEY` | Clé API Claude (fallback) | ⚠️ Optionnel |
| `VITE_OPENAI_MODEL` | Modèle OpenAI (défaut: `gpt-4o`) | ⚠️ Optionnel |
| `VITE_CLAUDE_MODEL` | Modèle Claude (défaut: `claude-3-5-sonnet-20241022`) | ⚠️ Optionnel |
| `VITE_API_URL` | URL du backend (défaut: `http://localhost:3001/api`) | ⚠️ Optionnel |

#### Backend (`backend/.env`)

| Variable | Description | Requis |
|----------|-------------|--------|
| `DATABASE_URL` | URL PostgreSQL | ✅ Oui |
| `PORT` | Port du serveur (défaut: `3001`) | ⚠️ Optionnel |
| `FRONTEND_URL` | URL du frontend (pour CORS) | ⚠️ Optionnel |
| `TEST_MODE` | Mode test (défaut: `false`) | ⚠️ Optionnel |

**Note**: Vite expose les variables via `process.env.API_KEY` (voir `vite.config.ts`)

## 📖 Utilisation

### Démarrage rapide

1. **Accueil**: Entrer votre nom
2. **Sélection**: Choisir une formule (Découverte/Approfondi/Stratégique)
3. **Personnalisation**:
   - Choisir votre style de coaching
   - (Optionnel) Uploader un CV pour personnalisation
4. **Questionnaire**: Répondre aux questions de l'IA
   - Questions textuelles (PARAGRAPH)
   - Choix multiples (MULTIPLE_CHOICE)
   - Utiliser 🎤 pour la voix
   - Utiliser "Joker" si besoin d'aide
5. **Synthèse**: Consulter votre bilan complet
   - Télécharger en PDF
   - Exporter vos données (JSON/CSV)

### Raccourcis clavier

| Action | Raccourci |
|--------|-----------|
| Envoyer réponse | `Enter` |
| Activer micro | Clic sur 🎤 |
| Paramètres voix | Clic sur ⚙️ |

## 📊 Structure des données

### Types principaux (`types.ts`)

```typescript
// Question générée par l'IA
interface Question {
  id: string;
  title: string;
  description?: string;
  type: QuestionType.PARAGRAPH | QuestionType.MULTIPLE_CHOICE;
  theme: string;
  choices?: string[];
  required: boolean;
}

// Réponse utilisateur
interface Answer {
  questionId: string;
  value: string;
}

// Synthèse finale
interface Summary {
  profileType: string;
  priorityThemes: string[];
  maturityLevel: string;
  keyStrengths: SummaryPoint[];
  areasForDevelopment: SummaryPoint[];
  recommendations: string[];
  actionPlan: {
    shortTerm: ActionPlanItem[];
    mediumTerm: ActionPlanItem[];
  };
}
```

### Packages (`constants.ts`)

Trois formules avec phases structurées:

```typescript
PACKAGES = [
  {
    id: 'decouverte',
    totalQuestionnaires: 3,
    phases: {
      phase1: { questionnaires: 1 }, // Investigation
      phase2: { questionnaires: 1 }, // Analyse
      phase3: { questionnaires: 1 }  // Conclusion
    }
  },
  // ... approfondi (6 questions), stratégique (9 questions)
]
```

## 🤖 Multi-Provider AI System

Le système supporte maintenant **trois providers AI** avec fallback automatique :
- **Gemini** (Google) - Recommandé, rapide et économique
- **OpenAI** - Puissant et fiable
- **Claude** (Anthropic) - Haute qualité de sortie

Si un provider échoue, le système bascule automatiquement vers un autre. Voir [ENV_VARIABLES.md](ENV_VARIABLES.md) pour la configuration.

### Modèles utilisés

| Provider | Modèles | Usage |
|----------|---------|-------|
| **Gemini** | `gemini-2.5-flash`, `gemini-2.5-pro` | Questions, synthèses, dashboard, résumé final |
| **OpenAI** | `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo` | Toutes les fonctions (fallback) |
| **Claude** | `claude-3-5-sonnet-20241022`, `claude-3-opus-20240229` | Toutes les fonctions (fallback) |

### Schemas JSON structurés

Toutes les réponses Gemini utilisent des schémas JSON stricts pour garantir la cohérence:

```typescript
// Exemple: Schema de question
const questionSchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    title: { type: Type.STRING },
    type: { type: Type.STRING, enum: ['PARAGRAPH', 'MULTIPLE_CHOICE'] },
    theme: { type: Type.STRING },
    // ...
  }
}
```

### Fonctionnalités avancées

- **Google Search intégré**: Pour questions métier (phase 2)
- **Modules optionnels**: Détection automatique de besoins
- **Joker**: Reformulation de question si bloqué
- **Styles de coaching**: 3 systèmes d'instructions différents

## 🐛 Dépannage

### Erreur: "API_KEY is undefined"

**Cause**: Clé API non configurée dans `.env.local`

**Solution**:
```bash
echo "GEMINI_API_KEY=votre_clé_ici" > .env.local
npm run dev
```

### Erreur: "Failed to fetch" (Backend)

**Cause**: Backend non démarré ou CORS mal configuré

**Solution**:
1. Vérifier que le backend est démarré: `cd backend && npm run dev`
2. Vérifier `FRONTEND_URL` dans `backend/.env`
3. Vérifier les logs backend pour les erreurs

### Erreur: "relation 'assessments' does not exist"

**Cause**: Schéma de base de données non créé

**Solution**:
```bash
cd backend
npm run db:push
```

### Erreur Docker: "Port already in use"

**Cause**: Port 3000, 3001 ou 5432 déjà utilisé

**Solution**:
1. Trouver le processus: `lsof -i :3000` (ou 3001, 5432)
2. Arrêter le processus ou changer les ports dans `docker-compose.yml`

Voir [DOCKER_TROUBLESHOOTING.md](DOCKER_TROUBLESHOOTING.md) pour plus de détails.

### Erreur: "503 The model is overloaded" ou "429 Quota exceeded"

**Cause**: Limite de quota Gemini API atteinte

**Solution**: 
- L'application retry automatiquement (max 3 tentatives)
- Attendre le délai indiqué par l'API
- Vérifier votre quota sur [Google AI Studio](https://aistudio.google.com/app/apikey)

### Sauvegarde ne fonctionne pas

**Cause**: localStorage désactivé ou plein

**Solution**:
1. Vérifier les permissions du navigateur
2. Vider le localStorage: `localStorage.clear()`

### Voix ne fonctionne pas

**Cause**: API Web Speech non supportée ou permissions refusées

**Solution**:
1. Utiliser Chrome/Edge (meilleur support)
2. Autoriser l'accès au microphone
3. HTTPS requis en production

## 🔧 Scripts npm

### Frontend

```bash
npm run dev      # Serveur dev (http://localhost:3000)
npm run build    # Build production (dist/)
npm run preview  # Prévisualiser le build
npm test         # Lancer les tests (Vitest)
npm run test:ui  # Interface UI pour les tests
npm run test:coverage  # Tests avec couverture
```

### Backend

```bash
cd backend
npm run dev      # Serveur dev (http://localhost:3001)
npm run build    # Build production
npm run db:push  # Créer/mettre à jour le schéma DB
npm test         # Lancer les tests (Vitest)
```

### Docker

```bash
docker-compose up -d        # Démarrer tous les services
docker-compose down         # Arrêter tous les services
docker-compose logs -f      # Voir les logs
docker-compose build        # Reconstruire les images
```

## 📝 Fichiers de configuration

### `vite.config.ts`

```typescript
// Expose la clé API Gemini
define: {
  'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
}
```

### `tsconfig.json`

TypeScript 5.8 avec strict mode activé.

### `package.json`

Dépendances principales:
- `react@19.2.0`
- `@google/genai@1.29.0` (SDK Gemini)
- `vite@6.2.0`
- `typescript@5.8.2`

## 🤝 Contribution

### Workflow Git

```bash
# Créer une branche feature
git checkout -b feature/ma-fonctionnalite

# Commiter les changements
git commit -m "feat: Description de la fonctionnalité"

# Pousser et créer une PR
git push -u origin feature/ma-fonctionnalite
```

### Standards de code

- **TypeScript strict**: Typage complet obligatoire
- **React 19**: Hooks modernes (pas de class components)
- **Tailwind CSS**: Classes utilitaires pour le style
- **Schémas JSON**: Toutes les réponses IA doivent avoir un schéma

## 📚 Documentation supplémentaire

- [DEPLOYMENT.md](DEPLOYMENT.md) - Guide de déploiement complet
- [DOCKER_TROUBLESHOOTING.md](DOCKER_TROUBLESHOOTING.md) - Résolution de problèmes Docker
- [TESTING.md](TESTING.md) - Guide des tests
- [ENV_VARIABLES.md](ENV_VARIABLES.md) - Variables d'environnement détaillées
- [GEMINI_API_KEY_SETUP.md](GEMINI_API_KEY_SETUP.md) - Configuration de la clé API pour Docker
- [FINAL_TEST_GUIDE.md](FINAL_TEST_GUIDE.md) - Guide de test final

## 📞 Support

- **Issues GitHub**: [Créer une issue](https://github.com/lekesiz/BILAN-EASY/issues)
- **AI Studio**: [Voir le projet](https://aistudio.google.com/apps)

## 📜 Licence

Ce projet a été généré avec [Google AI Studio](https://aistudio.google.com/apps).

---

<div align="center">

**Built with ❤️ using Google Gemini 2.5**

[⬆ Retour en haut](#bilan-de-compétences-ia)

</div>

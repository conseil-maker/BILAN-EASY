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

### Problèmes résolus (Dernier commit: ec00f8f)

✅ Extraction du code source depuis l'archive ZIP
✅ Installation de 133 packages npm sans vulnérabilités
✅ **Correction critique**: Erreur de syntaxe JSX dans `SummaryDashboard.tsx:293` (apostrophes)
✅ Build réussi (469.79 kB)
✅ Serveur de développement fonctionnel

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
│   ├── CoachChat.tsx           # Chat avec coach
│   └── LiveCoach.tsx           # Coach en direct
│
├── 📁 services/             # Logique métier
│   ├── geminiService.ts        # API Gemini 2.5 (génération) ⭐
│   ├── historyService.ts       # Gestion localStorage
│   ├── ttsService.ts           # Text-to-speech
│   └── liveService.ts          # Services live
│
├── 📁 hooks/                # Hooks React personnalisés
│   ├── useSpeechRecognition.ts # Speech-to-text
│   └── useSpeechSynthesis.ts   # Text-to-speech
│
├── 📁 utils/                # Utilitaires
│   └── audio.ts                # Gestion audio
│
├── 📄 App.tsx               # Composant racine (routing)
├── 📄 types.ts              # Définitions TypeScript
├── 📄 constants.ts          # Packages et catégories
├── 📄 index.tsx             # Point d'entrée
├── 📄 vite.config.ts        # Configuration Vite
├── 📄 tsconfig.json         # Configuration TypeScript
├── 📄 package.json          # Dépendances npm
└── 📄 .env.local            # Variables d'environnement ⚠️

⭐ Fichiers critiques
⚠️ Nécessite configuration
```

## 🚀 Installation

### Prérequis
- **Node.js** (v18+)
- **npm** ou **yarn**
- **Clé API Gemini** ([Obtenir ici](https://aistudio.google.com/app/apikey))

### Étapes

```bash
# 1. Cloner le dépôt
git clone https://github.com/lekesiz/BILAN-EASY.git
cd BILAN-EASY

# 2. Installer les dépendances
npm install

# 3. Configurer l'API Gemini (voir section suivante)
# Éditer .env.local avec votre clé API

# 4. Lancer en développement
npm run dev

# 5. Build pour production
npm run build
```

## ⚙️ Configuration

### Clé API Gemini (OBLIGATOIRE)

**Fichier**: `.env.local`

```bash
# Remplacer PLACEHOLDER_API_KEY par votre vraie clé
GEMINI_API_KEY=votre_clé_api_gemini_ici
```

**Comment obtenir la clé**:
1. Aller sur [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Créer ou copier votre clé API
3. Remplacer dans `.env.local`

### Variables d'environnement

| Variable | Description | Requis |
|----------|-------------|--------|
| `GEMINI_API_KEY` | Clé API Gemini 2.5 | ✅ Oui |

**Note**: Vite expose les variables via `process.env.API_KEY` (voir `vite.config.ts:14`)

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

## 🤖 API Gemini

### Modèles utilisés (`geminiService.ts`)

| Fonction | Modèle | Usage |
|----------|--------|-------|
| `generateQuestion` | `gemini-2.5-flash` | Génération de questions |
| `generateSynthesis` | `gemini-2.5-flash` | Synthèses intermédiaires |
| `analyzeThemesAndSkills` | `gemini-2.5-flash` | Dashboard temps réel |
| `generateSummary` | `gemini-2.5-pro` | Synthèse finale ⭐ |
| `findResourceLeads` | `gemini-2.5-flash` | Recherche de ressources |

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

### Erreur de build: "Transform failed"

**Cause**: Problème de syntaxe JSX (apostrophes)

**Solution**: Déjà corrigée dans commit `ec00f8f`. Utiliser des guillemets doubles pour les chaînes avec apostrophes.

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

```bash
npm run dev      # Serveur dev (http://localhost:3000)
npm run build    # Build production (dist/)
npm run preview  # Prévisualiser le build
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

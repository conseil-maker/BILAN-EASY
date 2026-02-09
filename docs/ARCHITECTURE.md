# 🏛️ Architecture Technique - Bilan Easy

**Version** : 1.0  
**Date** : 9 février 2026  
**Auteur** : Manus AI Agent

---

## 1. Vue d'Ensemble

L'architecture de Bilan Easy est conçue pour être **moderne, scalable et sécurisée**, en s'appuyant sur une stack technologique éprouvée et des services managés pour minimiser la maintenance.

![Diagramme d'Architecture](https://i.imgur.com/your-diagram-url.png)  
*Diagramme d'architecture de haut niveau (à créer)*

---

## 2. Architecture Frontend

- **Framework** : React 18 avec TypeScript pour un typage statique robuste.
- **Build Tool** : Vite pour un développement rapide et des builds optimisés.
- **Styling** : TailwindCSS pour un design system cohérent et une personnalisation facile.
- **State Management** : React Context API pour les états simples, Zustand ou Redux Toolkit pour les états complexes.
- **Routing** : React Router pour la navigation côté client.

---

## 3. Architecture Backend

Le backend est entièrement basé sur **Supabase**, une plateforme open-source qui fournit tous les services nécessaires :

- **Base de Données** : PostgreSQL, une base de données relationnelle puissante et fiable.
- **Authentification** : Supabase Auth pour la gestion des utilisateurs, des rôles et des permissions (RLS).
- **Stockage** : Supabase Storage pour le stockage des fichiers (documents, avatars, etc.).
- **Edge Functions** : Fonctions serverless (Deno) pour la logique métier complexe et les intégrations (ex: `gemini-proxy`).

---

## 4. Schéma de Base de Données

Le schéma de la base de données est conçu pour être normalisé et évolutif. Voici les tables principales :

| Table | Description |
|---|---|
| `users` | Informations sur les utilisateurs (clients, consultants, admins) |
| `profiles` | Données de profil supplémentaires |
| `assessments` | Bilans de compétences en cours |
| `questions` | Questions posées lors des bilans |
| `answers` | Réponses des clients |
| `themes` | Thèmes émergents identifiés par l'IA |
| `documents` | Documents générés (Qualiopi, synthèses) |
| `invoices` | Factures et informations de paiement |

*Un schéma détaillé avec les relations sera ajouté ultérieurement.*

---

## 5. Flux de Données

### 5.1. Flux de Connexion

1. L'utilisateur saisit ses identifiants dans le composant `Login.tsx`.
2. `authService.ts` appelle `supabase.auth.signInWithPassword()`.
3. Supabase vérifie les identifiants et retourne un JWT.
4. Le JWT est stocké dans le localStorage et utilisé pour les requêtes authentifiées.

### 5.2. Flux de Génération de Question IA

1. L'utilisateur envoie sa réponse dans `Questionnaire.tsx`.
2. `geminiService.ts` appelle `geminiServiceProxy.generateContentViaProxy()`.
3. `geminiServiceProxy.ts` fait un `fetch()` vers l'Edge Function `gemini-proxy`.
4. L'Edge Function `gemini-proxy` appelle l'API Google Gemini avec le contexte de la conversation.
5. Gemini retourne une nouvelle question personnalisée.
6. La question est affichée dans l'interface `Questionnaire.tsx`.

---

## 6. Sécurité

- **Row Level Security (RLS)** : Les politiques RLS de Supabase sont utilisées pour s'assurer que les utilisateurs ne peuvent accéder qu'à leurs propres données.
- **Variables d'Environnement** : Toutes les clés API et secrets sont stockés dans des variables d'environnement sur Vercel, jamais dans le code source.
- **HTTPS** : Toutes les communications sont chiffrées avec SSL/TLS.

---

## 7. Performance

- **Code Splitting** : Vite divise automatiquement le code en chunks pour un chargement plus rapide.
- **Lazy Loading** : Les composants et les routes sont chargés à la demande.
- **CDN** : Vercel déploie les assets statiques sur un CDN global pour une faible latence.
- **Optimisation des Requêtes** : Les requêtes Supabase sont optimisées pour ne récupérer que les données nécessaires.

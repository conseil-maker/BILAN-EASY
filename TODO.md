# ✅ Bilan Easy - TODO List & État des Lieux

**Date de dernière mise à jour :** 16 février 2026

Ce document sert de feuille de route et de suivi pour le développement de la plateforme Bilan-Easy. Il est destiné à être mis à jour régulièrement pour refléter l'avancement du projet.

---

## 📊 État Actuel du Projet (Audit du 16/02/2026)

L'application est **fonctionnelle** sur son périmètre principal. La base technique est solide, mais une **dette technique significative** a été identifiée, principalement dans les composants `Questionnaire.tsx` et `ClientApp.tsx`, qui freine l'ajout de nouvelles fonctionnalités.

| Métrique | Valeur |
|---|---|
| Fichiers de code (TS/TSX) | ~150 |
| Lignes de code (`src/`) | ~45,000+ |
| Fichiers de traduction (FR/TR) | 40 |
| Dépendances (prod/dev) | 13 / 12 |
| Tables Supabase utilisées | 10 |
| Buckets Supabase Storage | 2 (`cvs`, `pdfs`) |
| Edge Functions (Supabase) | 2 (Gemini & Email Proxy) |
| Erreurs TypeScript (critiques) | ~100+ |

---

## ✅ Tâches Accomplies (Ce qui est fait et validé)

| Catégorie | Fonctionnalité | Détails |
|---|---|---|
|  архитектура | **Stack Technique Moderne** | React 18, Vite, TypeScript, TailwindCSS, Supabase, Vercel. |
| 👤 Authentification | **Gestion des Rôles** | Inscription, connexion, et 3 rôles fonctionnels (client, consultant, admin). |
| 🚀 Parcours Client | **Questionnaire Dynamique** | Les 3 phases (Préliminaire, Investigation, Conclusion) sont implémentées avec une logique de questions adaptatives. |
| 💾 Sauvegarde | **Progression & Historique** | La session du client est sauvegardée dans Supabase (`user_sessions`) et les bilans terminés sont dans l'historique (`assessments`). |
| 🌍 Internationalisation | **Traduction FR/TR (Partielle)** | L'UI principale est bilingue. La langue est détectée, sélectionnable, et sauvegardée dans le profil utilisateur. |
| 📄 Documents | **Génération Qualiopi (Partiel)** | La convention de formation et l'attestation de présence sont générées. |
| 🔒 Sécurité | **Proxy API** | Les clés API (Gemini, Resend) sont sécurisées côté serveur via des Edge Functions Supabase. |
| 🧹 Nettoyage | **Code Orphelin Archivé** | 12 composants et 5 services inutilisés ont été déplacés dans `src/_unused` pour clarifier la base de code. |

---

## ⏳ Tâches Restantes (Ce qui reste à faire)

### 🔴 Priorité Haute : Bugs Critiques & Dette Technique

*Ces tâches sont **bloquantes** pour la stabilité et l'évolution saine du projet. Il est impératif de les réaliser avant d'ajouter de nouvelles fonctionnalités.*

- [x] **Corriger les ~100+ Erreurs TypeScript :**
  - **Objectif :** Rendre le build TypeScript propre pour éviter les bugs silencieux.
  - **Comment :** Corriger les erreurs de type (`TS2339`, `TS2345`, etc.) et les incohérences (`t()` sans `useTranslation`).
  - **Fichiers concernés :** `ConsultantDashboard.tsx`, `BilanCompletion.tsx`, `syntheseServiceEnriched.ts`, etc.

- [x] **Résoudre le bug de la langue au chargement :**
  - **Objectif :** Afficher directement la langue de l'utilisateur (TR) sans flash de contenu en français.
  - **Comment :** Modifier la séquence de chargement dans `AuthWrapper.tsx` pour appliquer la langue du profil *avant* le premier rendu de l'application.
  - **Fichiers concernés :** `AuthWrapper.tsx`, `i18n/index.ts`.

- [x] **Finaliser la traduction (i18n) :**
  - **Objectif :** Éliminer tous les textes français en dur restants.
  - **Comment :** Traduire les prompts Gemini, les noms de phases/catégories dans `constants.ts`, les textes dans `AdminDashboardPro.tsx`, et surtout le contenu des pages légales (`legal/CGU.tsx`, etc.).
  - **État actuel :** Les prompts Gemini et les pages légales sont maintenant traduits.

- [ ] **Intégrer `SessionContext` :**
  - **Objectif :** Supprimer les ~20 `useState` de `ClientApp.tsx`.
  - **Comment :** Utiliser le `SessionProvider` (déjà présent) et le hook `useSession` pour centraliser l'état de la session du bilan.
  - **Fichiers concernés :** `ClientApp.tsx`, `ClientAppWithSession.tsx`, `contexts/SessionContext.tsx`.

- [ ] **Décomposer `Questionnaire.tsx` et `ClientDashboard.tsx` :**
  - **Objectif :** Réduire la taille des fichiers (actuellement ~1600 et ~1200 lignes) en plusieurs composants logiques.
  - **Comment :** Utiliser les sous-composants déjà créés.
  - **Fichiers concernés :** `Questionnaire.tsx`, `ClientDashboard.tsx`.

### 🟡 Priorité Moyenne : Fonctionnalités Clés

- [ ] **Finaliser le Système de Paiement :**
  - **Objectif :** Permettre aux clients de payer pour les forfaits.
  - **Comment :** Intégrer une solution de paiement comme Stripe. Le cahier des charges mentionne aussi Pennylane pour la facturation.
  - **État actuel :** Aucun code n'existe pour le paiement.

- [ ] **Finaliser le Système de Rendez-vous :**
  - **Objectif :** Permettre aux clients et consultants de prendre et gérer des rendez-vous.
  - **Comment :** Créer les tables Supabase (`appointments`, `time_slots`), connecter le composant `AppointmentSystem.tsx` à la base de données, et gérer les disponibilités.
  - **État actuel :** Le composant existe mais n'est pas fonctionnel (données en mémoire).

- [ ] **Enrichir les Dashboards Admin & Consultant :**
  - **Objectif :** Fournir les outils de gestion nécessaires.
  - **Comment :** Ajouter des statistiques, la gestion des utilisateurs, la gestion des bilans, un outil de communication, etc.
  - **État actuel :** Les dashboards sont des coquilles vides.

- [ ] **Améliorer la Génération de la Synthèse PDF :**
  - **Objectif :** Produire un document de synthèse riche et visuel.
  - **Comment :** Intégrer pleinement `syntheseServiceEnriched` et les graphiques (`SkillsRadar`, etc.) dans la génération du PDF final.
  - **État actuel :** La génération PDF depuis le `SummaryDashboard` est basique.

### 🟢 Priorité Basse : Améliorations & Vision à Long Terme

- [ ] **Activer le Coach Live & Chat :**
  - **Objectif :** Fournir une assistance IA en temps réel.
  - **Comment :** Intégrer les composants `CoachChat` et `LiveCoach` avec un service temps réel (ex: Supabase Realtime).

- [ ] **Implémenter le Suivi Post-Bilan :**
  - **Objectif :** Gérer le suivi à 3 et 6 mois.
  - **Comment :** Réparer l'import cassé dans `PostBilanFollowUp.tsx` et l'intégrer au parcours.

- [ ] **Activer les Notifications Push :**
  - **Objectif :** Envoyer des notifications aux utilisateurs.
  - **Comment :** Intégrer `NotificationCenter` et `NotificationManager` avec `pushNotificationService`.

- [ ] **Migrer vers `react-router-dom` :**
  - **Objectif :** Remplacer le routeur "maison" basé sur les hashs par la librairie standard.

- [ ] **Augmenter la Couverture de Tests :**
  - **Objectif :** Améliorer la fiabilité du code.
  - **Comment :** Ajouter des tests unitaires et d'intégration pour les composants et services critiques.

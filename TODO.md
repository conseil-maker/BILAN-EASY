# ✅ Bilan Easy - TODO List & État des Lieux

**Date de dernière mise à jour :** 16 février 2026 (session 4)

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
| Tables Supabase utilisées | 11 (dont `appointment_requests`) |
| Buckets Supabase Storage | 2 (`cvs`, `pdfs`) |
| Edge Functions (Supabase) | 2 (Gemini & Email Proxy) |
| Erreurs TypeScript (critiques) | ~1 (réduites de ~7800 → ~143 → ~66 → ~1) |
| Documents Qualiopi | 6 (convention, programme, livret, émargement, attestation, évaluation) |

---

## ✅ Tâches Accomplies (Ce qui est fait et validé)

| Catégorie | Fonctionnalité | Détails |
|---|---|---|
| 🏗️ Architecture | **Stack Technique Moderne** | React 18, Vite, TypeScript, TailwindCSS, Supabase, Vercel. |
| 👤 Authentification | **Gestion des Rôles** | Inscription, connexion, et 3 rôles fonctionnels (client, consultant, admin). |
| 🚀 Parcours Client | **Questionnaire Dynamique** | Les 3 phases (Préliminaire, Investigation, Conclusion) sont implémentées avec une logique de questions adaptatives. |
| 💾 Sauvegarde | **Progression & Historique** | La session du client est sauvegardée dans Supabase (`user_sessions`) et les bilans terminés sont dans l'historique (`assessments`). |
| 🌍 Internationalisation | **Traduction FR/TR (Complète)** | L'UI est bilingue. Prompts Gemini, pages légales, noms de packages/phases, dashboards, synthèse PDF — tout est traduit. |
| 📄 Documents | **6 Documents Qualiopi Complets** | Convention de formation, programme de formation, livret d'accueil, feuille d'émargement, attestation de présence, évaluation de satisfaction. |
| 📄 Documents | **Synthèse PDF Bilingue** | La synthèse PDF (standard et enrichie) est traduite dynamiquement selon la langue via `tSyn()`. |
| 🔒 Sécurité | **Proxy API** | Les clés API (Gemini, Resend) sont sécurisées côté serveur via des Edge Functions Supabase. |
| 🧹 Nettoyage | **Code Orphelin Archivé** | 12 composants et 5 services inutilisés ont été déplacés dans `src/_unused` pour clarifier la base de code. |
| 🐛 TypeScript | **Erreurs TS Corrigées** | De ~7800 erreurs à ~1 (ajout `@types/react`, correction types, `useTranslation` manquants, `tsconfig.json`, gardes null, props optionnelles, tuples typés). |
| 🌐 Langue | **Flash de Langue Résolu** | La langue préférée est chargée depuis Supabase avant le rendu de l'UI (AuthWrapper). |
| 📅 Rendez-vous | **Système de Demande RDV** | Formulaire simple côté client → consultant voit et gère les demandes. Table `appointment_requests` avec RLS. |
| 📧 Notifications | **Email Notification RDV** | Le consultant est notifié par email (via proxy Supabase) quand un client fait une demande de RDV. |
| 📊 Dashboards | **Admin & Consultant Enrichis** | Données dynamiques Supabase, onglet RDV, statistiques, gestion des utilisateurs et des bilans. |

---

## ⏳ Tâches Restantes (Ce qui reste à faire)

### 🔴 Priorité Haute : Dette Technique

*Ces tâches sont **importantes** pour la maintenabilité du projet à long terme.*

- [ ] **Intégrer `SessionContext` :**
  - **Objectif :** Supprimer les ~20 `useState` de `ClientApp.tsx`.
  - **Comment :** Utiliser le `SessionProvider` (déjà présent) et le hook `useSession` pour centraliser l'état de la session du bilan.
  - **Fichiers concernés :** `ClientApp.tsx`, `ClientAppWithSession.tsx`, `contexts/SessionContext.tsx`.
  - **Risque :** Élevé — touche au cœur de l'application. À faire dans une session dédiée avec tests manuels.

- [ ] **Décomposer `Questionnaire.tsx` et `ClientDashboard.tsx` :**
  - **Objectif :** Réduire la taille des fichiers (actuellement ~1600 et ~1200 lignes) en plusieurs composants logiques.
  - **Comment :** Utiliser les sous-composants déjà créés dans `src/components/questionnaire/`.
  - **Fichiers concernés :** `Questionnaire.tsx`, `ClientDashboard.tsx`.

### 🟡 Priorité Moyenne : Fonctionnalités Clés

- [ ] **Améliorer la Génération de la Synthèse PDF :**
  - **Objectif :** Produire un document de synthèse plus riche visuellement.
  - **Comment :** Intégrer les graphiques (`SkillsRadar`, etc.) dans la génération du PDF final.
  - **État actuel :** La génération PDF fonctionne et est bilingue, mais pourrait être plus visuelle.

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

### 🔵 Pour Plus Tard : Intégrations Externes

*Ces intégrations sont prévues dans le cahier des charges mais ne sont pas prioritaires.*

- [ ] **Stripe** — Paiement en ligne pour les forfaits.
- [ ] **Pennylane** — Facturation et comptabilité.
- [ ] **Wedof** — Gestion administrative des formations.
- [ ] **Google Workspace** — Intégration calendrier, drive, etc.

---

## 📝 Journal des Sessions

| Date | Résumé |
|---|---|
| 16/02/2026 (S1) | Traduction noms packages/phases, audit complet, nettoyage 17 fichiers orphelins, création TODO.md |
| 16/02/2026 (S2) | Correction ~7500 erreurs TS, flash de langue, traduction prompts Gemini + pages légales, système RDV simplifié, dashboards Admin/Consultant enrichis |
| 16/02/2026 (S3) | Notification email RDV au consultant, correction 77 erreurs TS supplémentaires (de 143 à 66), types enrichis (Question, Answer, Package, etc.), gardes null, props optionnelles |
| 16/02/2026 (S4) | Correction des 65 dernières erreurs TS critiques (de 66 à 1), 3 nouveaux documents Qualiopi (programme de formation, feuille d'émargement, évaluation de satisfaction), DocumentsQualiopi refactoré avec grille 6 documents |

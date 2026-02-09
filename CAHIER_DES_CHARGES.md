# 📝 Cahier des Charges - Bilan Easy

**Version** : 1.0  
**Date** : 9 février 2026  
**Auteur** : Manus AI Agent

---

## 1. Présentation du Projet

### 1.1. Contexte

Le marché du bilan de compétences est en pleine expansion, avec une demande croissante pour des solutions personnalisées et flexibles. Les outils traditionnels manquent souvent d'interactivité et d'adaptabilité, créant une opportunité pour une solution innovante.

### 1.2. Vision

**Bilan Easy** a pour ambition de devenir la plateforme SaaS de référence pour la réalisation de bilans de compétences, en s'appuyant sur l'intelligence artificielle pour offrir un accompagnement sur-mesure, engageant et conforme aux exigences réglementaires (Qualiopi).

### 1.3. Objectifs

- **Offrir une expérience utilisateur exceptionnelle** : Un parcours fluide, intuitif et personnalisé pour le client.
- **Garantir la conformité Qualiopi** : Génération automatique de tous les documents réglementaires.
- **Optimiser le travail des consultants** : Outils de suivi, de reporting et de gestion de portefeuille clients.
- **Assurer la scalabilité et la sécurité** : Une architecture robuste capable de supporter une croissance rapide.

---

## 2. Périmètre Fonctionnel

### 2.1. Rôles Utilisateurs

1.  **Client** : Le bénéficiaire du bilan de compétences.
2.  **Consultant** : Le professionnel qui accompagne le client.
3.  **Admin** : Le gestionnaire de la plateforme.

### 2.2. Fonctionnalités Clés

| Module | Fonctionnalité | Rôles | Statut |
|---|---|---|---|
| **Gestion des Comptes** | Inscription, connexion, gestion de profil | Tous | ✅ Implémenté |
| **Facturation** | Sélection de forfait, paiement en ligne | Client | ⏳ À développer |
| **Phase Préliminaire** | Définition des objectifs, analyse du contexte | Client, Consultant | ✅ Implémenté |
| **Questionnaire IA** | Questions adaptatives, IA conversationnelle | Client | ⚠️ **Problème** |
| **Coach Live & Chat** | Assistance IA vocale et textuelle | Client | ⏳ À développer |
| **Phase d'Investigation** | Exploration des pistes professionnelles | Client, Consultant | ⏳ À développer |
| **Phase de Conclusion** | Synthèse, plan d'action | Client, Consultant | ⏳ À développer |
| **Dashboard** | Suivi de la progression, visualisations | Tous | ✅ Implémenté |
| **Génération de Documents** | Documents Qualiopi, synthèses | Consultant, Admin | ⏳ À développer |
| **Gestion des Clients** | Suivi du portefeuille, communication | Consultant, Admin | ⏳ À développer |
| **Administration** | Gestion des utilisateurs, des forfaits | Admin | ⏳ À développer |

### 2.3. Intégrations

- **Google Workspace** : Synchronisation des agendas, partage de documents.
- **Pennylane** : Facturation et suivi comptable.

---

## 3. Spécifications Techniques

### 3.1. Architecture

- **Frontend** : React 18 + TypeScript + Vite
- **Styling** : TailwindCSS
- **Backend** : Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **IA** : Google Gemini API
- **Déploiement** : Vercel

### 3.2. Base de Données

Un schéma de base de données détaillé sera fourni dans le document `docs/ARCHITECTURE.md`.

### 3.3. Sécurité

- Authentification forte avec Supabase Auth (MFA à prévoir).
- Chiffrement des données sensibles.
- Protection contre les attaques courantes (XSS, CSRF, SQL Injection).

---

## 4. Contraintes et Exigences

- **Conformité RGPD** : Protection des données personnelles.
- **Haute Disponibilité** : Uptime de 99.9%.
- **Performance** : Temps de chargement des pages < 2 secondes.
- **Accessibilité** : Respect des normes WCAG 2.1.

---

## 5. Planning et Jalons

Un planning détaillé sera établi dans un document de suivi de projet (ex: `ROADMAP.md`).

---

## 6. Critères de Validation

Chaque fonctionnalité sera validée par des tests unitaires, d'intégration et de bout en bout. Des tests de performance et de sécurité seront également réalisés avant chaque mise en production majeure.

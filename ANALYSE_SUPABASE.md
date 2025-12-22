# Analyse de la Structure Supabase - Bilan de Compétences IA

## Projet Supabase
- **ID**: pkhhxouuavfqzccahihe
- **Nom**: Bilan de Competences IA
- **Région**: eu-west-1
- **Status**: ACTIVE_HEALTHY

## Tables Existantes

### 1. `profiles` (17 lignes)
Profils utilisateurs avec rôles.
- `id` (uuid) - Lié à auth.users
- `email` (text, unique)
- `full_name` (text)
- `avatar_url` (text)
- `role` (text) - client | consultant | admin
- `organization_id` (uuid)
- `created_at`, `updated_at`
- **RLS**: Désactivé

### 2. `assessments` (0 lignes)
Bilans de compétences réalisés.
- `id` (uuid)
- `client_id` (uuid) → profiles
- `consultant_id` (uuid) → profiles
- `title` (text)
- `status` (text) - draft | in_progress | completed | archived
- `coaching_style` (text) - collaborative | analytical | creative
- `cv_analysis` (jsonb)
- `questionnaire_data` (jsonb)
- `summary_data` (jsonb)
- `consultant_notes` (jsonb)
- `package_name`, `package_duration`, `package_price`
- `duration_hours`, `start_date`, `end_date`
- `consent_data` (jsonb)
- `answers` (jsonb)
- `summary` (jsonb)
- `created_at`, `updated_at`, `completed_at`
- **RLS**: Activé

### 3. `satisfaction_surveys` (0 lignes)
Questionnaires de satisfaction Qualiopi.
- `id` (uuid)
- `user_id` (uuid) → profiles
- `assessment_id` (uuid) → assessments
- `responses` (jsonb)
- `nps_score` (integer, 0-10)
- `overall_rating` (integer, 1-5)
- `comments` (text)
- `submitted_at`, `created_at`
- **RLS**: Activé

### 4. `organizations` (0 lignes)
Organisations pour les consultants.
- `id`, `name`, `description`, `logo_url`
- `created_at`, `updated_at`
- **RLS**: Activé

### 5. `consultant_client_assignments` (0 lignes)
Affectations consultant-client.
- `id`, `consultant_id`, `client_id`, `assigned_at`
- **RLS**: Activé

### 6. `organization_settings` (0 lignes)
Paramètres de configuration des organismes.
- `id`, `organization_id`, `key`, `value` (jsonb)
- **RLS**: Activé

### 7. `chat_sessions` (0 lignes)
Sessions de chat avec le coach IA.
- `id`, `assessment_id`
- `session_type` (text | voice)
- `messages` (jsonb)
- **RLS**: Activé

### 8. `document_downloads` (0 lignes)
Historique des téléchargements de documents.
- `id`, `user_id`, `document_type`, `document_name`
- `assessment_id`, `downloaded_at`
- **RLS**: Activé

### 9. `documents` (0 lignes)
Documents téléchargés et générés.
- `id`, `assessment_id`, `user_id`
- `file_name`, `file_path`, `file_type`, `file_size`
- **RLS**: Activé

## Constats

### ✅ Ce qui est déjà en place
1. Structure de base complète pour les bilans
2. Authentification via Supabase Auth
3. Tables pour assessments, profiles, documents
4. RLS activé sur la plupart des tables
5. Relations entre tables bien définies

### ⚠️ Problèmes identifiés
1. **0 assessments** - Les bilans ne sont pas sauvegardés dans Supabase
2. **localStorage utilisé** - L'application utilise localStorage au lieu de Supabase
3. **historyService** - Sauvegarde locale, pas dans Supabase
4. **Session non persistée** - Les sessions sont en localStorage

## Actions Requises

### Phase 1: Connecter les bilans à Supabase
1. Modifier `historyService.ts` pour sauvegarder dans `assessments`
2. Créer un service `assessmentService` complet
3. Migrer la sauvegarde de session vers Supabase

### Phase 2: Synchroniser les données
1. Sauvegarder les réponses en temps réel
2. Récupérer l'historique depuis Supabase
3. Gérer la reprise de session

### Phase 3: Supprimer les dépendances localStorage
1. Remplacer localStorage par Supabase
2. Conserver Gemini AI pour la génération de questions

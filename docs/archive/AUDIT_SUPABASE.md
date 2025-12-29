# Audit des interactions Supabase

## Tables utilisées

| Table | Opérations | Fichiers |
|-------|------------|----------|
| `profiles` | SELECT, INSERT, UPDATE | AuthWrapper, AdminDashboard, ClientDashboard, ConsultantDashboard, DocumentsQualiopi, MyDocuments, Signup, authService, assignmentService |
| `assessments` | SELECT, INSERT, UPDATE, DELETE, UPSERT | AdminDashboard, BilanCompletion, ClientDashboard, ConsultantDashboard, ConsultantNotes, assessmentService, historyService, notificationService, offlineSyncService |
| `user_sessions` | SELECT, INSERT, UPDATE, DELETE | sessionService |
| `satisfaction_surveys` | INSERT | SatisfactionSurvey, offlineSyncService |
| `document_downloads` | SELECT, INSERT | ClientDashboard, MyDocuments |
| `chat_sessions` | SELECT, INSERT, UPDATE, DELETE | chatService |
| `consultant_client_assignments` | SELECT, INSERT, DELETE | ConsultantDashboardPro, assessmentService, assignmentService |

## Problèmes identifiés

### 1. Incohérence dans les clés étrangères
- `assessments.user_id` vs `assessments.client_id` - utilisé de manière incohérente
- BilanCompletion utilise `user_id`, historyService utilise `client_id`

### 2. Pas de gestion d'erreur uniforme
- Certains fichiers ignorent les erreurs silencieusement
- D'autres lancent des exceptions

### 3. Pas de validation des données avant insertion
- Aucune validation côté client avant envoi à Supabase

### 4. offlineSyncService encore présent
- Ce service ne devrait plus exister car l'app est 100% online

## Recommandations

1. Standardiser sur `client_id` pour tous les assessments
2. Créer un service centralisé de gestion d'erreurs Supabase
3. Supprimer offlineSyncService
4. Ajouter validation des données

# Structure de la table user_sessions

| column_name | data_type |
|-------------|-----------|
| id | uuid |
| user_id | uuid |
| app_state | text |
| user_name | text |
| selected_package_id | text |
| coaching_style | text |
| current_answers | jsonb |
| start_date | text |
| time_spent | integer |
| updated_at | timestamp with time zone |
| created_at | timestamp with time zone |
| current_questions | jsonb |
| current_phase | text |
| progress | numeric |
| consent_data | jsonb |
| user_profile | jsonb |

## Observations

La colonne `last_ai_message` n'existe PAS dans la table !
Il faut l'ajouter via une migration.

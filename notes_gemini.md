# Noms de modèles Gemini corrects

## Modèles actuels (Décembre 2024)
- **gemini-2.5-flash** - Le modèle stable recommandé (rapide et intelligent)
- **gemini-2.5-pro** - Modèle de raisonnement avancé
- **gemini-2.0-flash** - Ancien modèle de 2ème génération

## Problème identifié
Le code utilise `gemini-2.0-flash` qui est un ancien modèle.
Il faut utiliser `gemini-2.5-flash` pour de meilleures performances.

## Action
Mettre à jour geminiService.ts pour utiliser `gemini-2.5-flash`

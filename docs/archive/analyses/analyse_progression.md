# Analyse des Incohérences de Progression

## Problème Identifié (Rapport Comet)
- Header principal : 75% complété
- Header secondaire : 50% complété  
- Sidebar : 0% complété
- Temps : 90 min / 173 min / 204 min

## Sources de Calcul Actuelles

### 1. Header Principal (Questionnaire.tsx ligne 832-840)
```typescript
const timeBudget = getTimeBudget(pkg.id, answers);
{Math.floor(timeBudget.spent)} / {timeBudget.total} min
{timeBudget.percentage.toFixed(0)}% complété
```
- Utilise `getTimeBudget()` qui calcule via `calculateTimeSpent()`
- Basé sur la **complexité estimée** des questions (5-10 min par question)

### 2. Sidebar (Dashboard.tsx ligne 1004)
```typescript
timeSpent={Math.floor((Date.now() - bilanStartTime) / 60000)}
```
- Utilise le **temps réel écoulé** depuis `bilanStartTime`

### 3. Calcul de la Progression (constants.ts ligne 334)
```typescript
const percentage = (spent / total) * 100;
```
- `spent` = temps estimé basé sur complexité
- `total` = budget temps du package

## Problème
**Deux méthodes de calcul différentes :**
1. **Estimation** : Basée sur complexité des questions (peu fiable)
2. **Temps réel** : Basé sur Date.now() (plus intuitif)

## Solution Recommandée
Utiliser le **temps réel** comme source unique de vérité :
- Plus intuitif pour l'utilisateur
- Plus précis
- Évite les incohérences

## Modifications à Apporter
1. Modifier `getTimeBudget()` pour accepter `bilanStartTime` en paramètre
2. Calculer `spent` via temps réel au lieu de `calculateTimeSpent()`
3. Garder `calculateTimeSpent()` uniquement pour estimer le temps restant

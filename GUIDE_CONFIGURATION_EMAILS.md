# Guide de Configuration des Emails - Bilan-Easy

## Prérequis

Pour activer l'envoi d'emails réels, vous devez :
1. Créer un compte sur [Resend](https://resend.com)
2. Vérifier votre domaine d'envoi
3. Configurer les variables d'environnement

---

## Étape 1 : Créer un compte Resend

1. Allez sur https://resend.com
2. Créez un compte gratuit (100 emails/jour inclus)
3. Obtenez votre clé API dans le dashboard

---

## Étape 2 : Vérifier votre domaine

1. Dans Resend, allez dans "Domains"
2. Ajoutez votre domaine (ex: netzinformatique.fr)
3. Suivez les instructions pour ajouter les enregistrements DNS :
   - SPF
   - DKIM
   - DMARC (optionnel mais recommandé)

**Alternative :** Utilisez le domaine de test `onboarding@resend.dev` pour les tests.

---

## Étape 3 : Configurer Vercel

1. Allez sur https://vercel.com/dashboard
2. Sélectionnez le projet "bilan-easy"
3. Allez dans "Settings" > "Environment Variables"
4. Ajoutez les variables suivantes :

| Variable | Valeur | Description |
|----------|--------|-------------|
| `VITE_RESEND_API_KEY` | `re_xxxxxxxx` | Votre clé API Resend |
| `VITE_EMAIL_FROM` | `contact@netzinformatique.fr` | Email d'envoi vérifié |
| `VITE_EMAIL_FROM_NAME` | `NETZ INFORMATIQUE` | Nom d'affichage |
| `VITE_EMAIL_MODE` | `production` | Mode d'envoi |
| `VITE_EMAIL_ENABLED` | `true` | Activer les emails |

5. Redéployez l'application

---

## Étape 4 : Tester l'envoi

1. Accédez à l'application
2. Complétez un bilan ou prenez un rendez-vous
3. Vérifiez que l'email est reçu

---

## Modes de fonctionnement

| Mode | Comportement |
|------|--------------|
| `development` | Emails simulés (log console uniquement) |
| `production` | Emails envoyés réellement via Resend |

---

## Types d'emails envoyés

| Email | Déclencheur |
|-------|-------------|
| **Bienvenue** | Inscription d'un nouveau bénéficiaire |
| **Confirmation RDV** | Prise de rendez-vous |
| **Rappel J-1** | 24h avant un rendez-vous |
| **Bilan terminé** | Fin du bilan de compétences |
| **Suivi 6 mois** | 6 mois après la fin du bilan |

---

## Dépannage

### Les emails ne sont pas envoyés

1. Vérifiez que `VITE_EMAIL_ENABLED` est à `true`
2. Vérifiez que `VITE_RESEND_API_KEY` est correcte
3. Vérifiez que le domaine est vérifié sur Resend
4. Consultez les logs dans la console du navigateur

### Les emails arrivent en spam

1. Configurez DMARC sur votre domaine
2. Utilisez un email d'envoi vérifié
3. Évitez les mots-clés spam dans le contenu

---

## Support

- Documentation Resend : https://resend.com/docs
- Support NETZ INFORMATIQUE : contact@netzinformatique.fr

---

*Guide créé le 16 décembre 2025*
*NETZ INFORMATIQUE - Organisme certifié Qualiopi*

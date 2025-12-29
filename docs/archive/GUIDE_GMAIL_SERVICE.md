# Guide du Service Gmail - Bilan-Easy

## Présentation

Le service d'emails de Bilan-Easy utilise désormais **Gmail / Google Workspace** au lieu de Resend. Cela permet d'envoyer les emails directement depuis votre compte professionnel `@netzinformatique.fr`.

## Avantages

| Aspect | Avantage |
|--------|----------|
| **Coût** | Inclus dans Google Workspace, pas de service tiers |
| **Délivrabilité** | Emails depuis votre domaine = meilleure réputation |
| **Cohérence** | Tous les emails passent par le même système |
| **Historique** | Emails visibles dans Gmail envoyés |
| **Réponses** | Les réponses arrivent dans votre boîte Gmail |

## Architecture

```
src/services/
├── emailService.ts      # Ancien service (Resend) - conservé pour compatibilité
└── gmailService.ts      # Nouveau service (Gmail/Google Workspace)
```

## Utilisation

### Templates disponibles

Le service propose 5 templates d'emails :

1. **welcome** - Email de bienvenue après inscription
2. **appointmentConfirmation** - Confirmation de rendez-vous
3. **appointmentReminder** - Rappel J-1
4. **bilanCompleted** - Notification de fin de bilan
5. **followUp6Months** - Suivi à 6 mois

### Exemple d'utilisation

```typescript
import { prepareWelcomeEmail, generateMcpGmailPayload } from '../services/gmailService';

// Préparer l'email
const email = prepareWelcomeEmail(
  'client@example.com',
  'Jean Dupont',
  'Bilan Approfondi'
);

// Générer le payload pour MCP
const payload = generateMcpGmailPayload([email]);

// Envoyer via MCP Gmail
// manus-mcp-cli tool call gmail_send_messages --server gmail --input '${payload}'
```

### Structure d'un email

```typescript
interface GmailMessage {
  to: string[];           // Destinataires
  cc?: string[];          // Copie carbone
  bcc?: string[];         // Copie cachée (consultant par défaut)
  subject: string;        // Objet
  content: string;        // Contenu texte brut
  attachments?: string[]; // Pièces jointes (chemins)
}
```

## Envoi via MCP

L'envoi d'emails se fait via le serveur MCP Gmail avec la commande :

```bash
manus-mcp-cli tool call gmail_send_messages --server gmail --input '{
  "messages": [{
    "to": ["client@example.com"],
    "subject": "Bienvenue chez NETZ INFORMATIQUE",
    "content": "Bonjour Jean,\n\nNous sommes ravis..."
  }]
}'
```

### Paramètres de gmail_send_messages

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `messages` | array | Oui | Liste des emails à envoyer (max 100) |
| `messages[].to` | array | Oui | Liste des destinataires |
| `messages[].subject` | string | Oui | Objet de l'email |
| `messages[].content` | string | Oui | Contenu en texte brut |
| `messages[].cc` | array | Non | Destinataires en copie |
| `messages[].bcc` | array | Non | Destinataires en copie cachée |
| `messages[].attachments` | array | Non | Chemins des pièces jointes |

## Différences avec Resend

| Aspect | Resend | Gmail |
|--------|--------|-------|
| **Format** | HTML + Texte | Texte brut uniquement |
| **Envoi** | API REST directe | Via MCP |
| **Authentification** | Clé API | OAuth Google |
| **Pièces jointes** | Base64 | Chemins fichiers |
| **Tracking** | Intégré | Via Gmail |

## Templates en texte brut

Gmail MCP n'accepte que le texte brut. Les templates sont formatés avec :

- Lignes de séparation `---`
- Listes avec `•` ou numéros
- Sections en MAJUSCULES
- Signature standardisée

### Exemple de template

```
Bonjour Jean Dupont,

Nous sommes ravis de vous accueillir chez NETZ INFORMATIQUE pour votre bilan de compétences.

VOTRE FORFAIT : Bilan Approfondi

Prochaines étapes :
1. Complétez la phase préliminaire en ligne
2. Répondez au questionnaire d'investigation
3. Planifiez vos entretiens avec votre consultant

---
Mikail LEKESIZ
NETZ INFORMATIQUE
03 67 31 02 01
contact@netzinformatique.fr
1A, route de Schweighouse, 67500 HAGUENAU

Organisme certifié Qualiopi - FP 2022/0076-4
```

## Prévisualisation

La prévisualisation des emails est disponible dans le dashboard admin :
- Section "Emails" → "Prévisualiser les templates"
- Affiche la version HTML (ancien) et Gmail (nouveau)

## Migration

L'ancien service `emailService.ts` est conservé pour :
- Compatibilité avec le code existant
- Prévisualisation HTML dans l'interface
- Fallback si nécessaire

Pour migrer complètement vers Gmail :
1. Remplacer les imports de `emailService` par `gmailService`
2. Utiliser les fonctions `prepare*` au lieu de `send*`
3. Appeler le MCP Gmail pour l'envoi effectif

## Icônes PWA

Les icônes PWA ont été générées dans toutes les tailles requises :

| Fichier | Taille | Usage |
|---------|--------|-------|
| `icon-72.png` | 72x72 | Android legacy |
| `icon-96.png` | 96x96 | Android legacy |
| `icon-128.png` | 128x128 | Chrome Web Store |
| `icon-144.png` | 144x144 | Windows tiles |
| `icon-152.png` | 152x152 | iOS |
| `icon-192.png` | 192x192 | Android, Chrome |
| `icon-384.png` | 384x384 | Android splash |
| `icon-512.png` | 512x512 | PWA standard |

## Contact

**NETZ INFORMATIQUE**
- Email : contact@netzinformatique.fr
- Téléphone : 03 67 31 02 01
- Site : https://bilan-easy.vercel.app

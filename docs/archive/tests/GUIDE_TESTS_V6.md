# Guide des Tests V6 - Bilan-Easy

## Résumé

Cette version ajoute une suite complète de tests automatisés pour garantir la stabilité et la qualité du code.

---

## 1. Statistiques des tests

| Métrique | Valeur |
|----------|--------|
| **Fichiers de test** | 12 |
| **Tests totaux** | 73 |
| **Tests passants** | 73 (100%) |
| **Couverture globale** | 38% |

---

## 2. Détail par fichier

### Services

| Fichier | Tests | Couverture |
|---------|-------|------------|
| `pushNotificationService.test.ts` | 8 | 30% |
| `gmailService.test.ts` | 6 | 69% |
| `historyService.test.ts` | 9 | 42% |
| `offlineSyncService.test.ts` | 11 | 37% |
| `excelExportService.test.ts` | 2 | 4% |

### Hooks

| Fichier | Tests | Couverture |
|---------|-------|------------|
| `useAutoSave.test.ts` | 3 | 50% |
| `useDarkMode.test.ts` | 3 | 93% |
| `useOffline.test.ts` | 8 | 39% |

### Composants

| Fichier | Tests | Couverture |
|---------|-------|------------|
| `Toast.test.tsx` | 6 | 89% |
| `DraftRecovery.test.tsx` | 4 | 2% |
| `OfflineIndicator.test.tsx` | 5 | 55% |
| `NotificationManager.test.tsx` | 8 | 53% |

---

## 3. Commandes de test

```bash
# Lancer tous les tests en mode watch
npm test

# Lancer les tests une seule fois
npm run test:run

# Générer le rapport de couverture
npm run test:coverage

# Lancer un fichier de test spécifique
npm run test:run -- src/services/gmailService.test.ts
```

---

## 4. Structure des tests

```
src/
├── components/
│   ├── DraftRecovery.test.tsx
│   ├── NotificationManager.test.tsx
│   ├── OfflineIndicator.test.tsx
│   └── Toast.test.tsx
├── hooks/
│   ├── useAutoSave.test.ts
│   ├── useDarkMode.test.ts
│   └── useOffline.test.ts
├── services/
│   ├── excelExportService.test.ts
│   ├── gmailService.test.ts
│   ├── historyService.test.ts
│   ├── offlineSyncService.test.ts
│   └── pushNotificationService.test.ts
└── test/
    └── setup.ts
```

---

## 5. Configuration Vitest

Le fichier `vitest.config.ts` configure :
- Environnement jsdom pour les tests React
- Setup automatique avec `src/test/setup.ts`
- Rapport de couverture avec v8
- Exclusion des fichiers de configuration

---

## 6. Bonnes pratiques

### Structure d'un test

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('NomDuModule', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fonctionnalité', () => {
    it('devrait faire quelque chose', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = maFonction(input);
      
      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

### Mocking

```typescript
// Mock d'un module
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
  },
}));

// Mock de localStorage
vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => null);
```

---

## 7. Prochaines étapes pour atteindre 80%

| Priorité | Action | Impact estimé |
|----------|--------|---------------|
| Haute | Tests pour DraftRecovery | +5% |
| Haute | Tests pour excelExportService | +3% |
| Moyenne | Tests pour useOffline complets | +5% |
| Moyenne | Tests pour offlineSyncService | +5% |
| Basse | Tests pour organization.ts | +2% |

---

## 8. Commits

```
6b75be3 - test: Augmentation de la couverture de tests
08d9767 - feat: Intégration NotificationManager, rappels automatiques et tests
d212dba - feat: Optimisation bundle, push notifications et tests
```

---

## 9. URL de production

**https://bilan-easy.vercel.app**

---

## Contact

**NETZ INFORMATIQUE**
- Email : contact@netzinformatique.fr
- Téléphone : 03 67 31 02 01

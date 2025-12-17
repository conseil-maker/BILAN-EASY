# Guide des Tests V7 - Bilan-Easy

## Résumé

Cette version apporte une augmentation significative de la couverture de tests, passant de 38% à 54%.

---

## 1. Statistiques des tests

| Métrique | V6 | V7 | Progression |
|----------|-----|-----|-------------|
| **Fichiers de test** | 12 | 15 | +3 |
| **Tests totaux** | 73 | 170 | +97 |
| **Couverture globale** | 38% | 54% | +16% |

---

## 2. Détail par fichier

### Services (52% de couverture)

| Fichier | Tests | Couverture |
|---------|-------|------------|
| `excelExportService.test.ts` | 14 | **99%** |
| `gmailService.test.ts` | 6 | 69% |
| `authService.test.ts` | 17 | 68% |
| `historyService.test.ts` | 9 | 42% |
| `pushNotificationService.test.ts` | 26 | 40% |
| `offlineSyncService.test.ts` | 11 | 37% |
| `storageService.test.ts` | 14 | 9% |

### Hooks (50% de couverture)

| Fichier | Tests | Couverture |
|---------|-------|------------|
| `useDarkMode.test.ts` | 3 | **93%** |
| `useAutoSave.test.ts` | 3 | 50% |
| `useOffline.test.ts` | 8 | 43% |

### Composants (59% de couverture)

| Fichier | Tests | Couverture |
|---------|-------|------------|
| `Toast.test.tsx` | 6 | **89%** |
| `ToastProvider.tsx` | - | **85%** |
| `OfflineIndicator.test.tsx` | 5 | 55% |
| `NotificationManager.test.tsx` | 8 | 53% |
| `DraftRecovery.test.tsx` | 12 | 48% |

### Config (100% de couverture)

| Fichier | Tests | Couverture |
|---------|-------|------------|
| `organization.test.ts` | 29 | **100%** |

---

## 3. Fichiers avec couverture complète

Les fichiers suivants ont atteint une couverture optimale :

- ✅ `organization.ts` - **100%** (29 tests)
- ✅ `excelExportService.ts` - **99%** (14 tests)
- ✅ `useDarkMode.ts` - **93%** (3 tests)
- ✅ `Toast.tsx` - **89%** (6 tests)
- ✅ `ToastProvider.tsx` - **85%** (tests indirects)

---

## 4. Commandes de test

```bash
# Lancer tous les tests en mode watch
npm test

# Lancer les tests une seule fois
npm run test:run

# Générer le rapport de couverture
npm run test:coverage

# Lancer un fichier de test spécifique
npm run test:run -- src/services/authService.test.ts
```

---

## 5. Structure des tests

```
src/
├── components/
│   ├── DraftRecovery.test.tsx      (12 tests)
│   ├── NotificationManager.test.tsx (8 tests)
│   ├── OfflineIndicator.test.tsx   (5 tests)
│   └── Toast.test.tsx              (6 tests)
├── config/
│   └── organization.test.ts        (29 tests)
├── hooks/
│   ├── useAutoSave.test.ts         (3 tests)
│   ├── useDarkMode.test.ts         (3 tests)
│   └── useOffline.test.ts          (8 tests)
├── services/
│   ├── authService.test.ts         (17 tests)
│   ├── excelExportService.test.ts  (14 tests)
│   ├── gmailService.test.ts        (6 tests)
│   ├── historyService.test.ts      (9 tests)
│   ├── offlineSyncService.test.ts  (11 tests)
│   ├── pushNotificationService.test.ts (26 tests)
│   └── storageService.test.ts      (14 tests)
└── test/
    └── setup.ts
```

---

## 6. Prochaines étapes pour atteindre 80%

| Priorité | Action | Impact estimé |
|----------|--------|---------------|
| Haute | Tests d'intégration storageService | +5% |
| Haute | Tests complets useOffline | +3% |
| Moyenne | Tests des handlers dans les composants | +5% |
| Moyenne | Tests des cas d'erreur | +5% |
| Basse | Tests E2E avec Playwright | +10% |

---

## 7. Commits

```
a334b0c - test: Augmentation significative de la couverture de tests
2591871 - docs: Guide complet des tests V6
6b75be3 - test: Augmentation de la couverture de tests
```

---

## 8. URL de production

**https://bilan-easy.vercel.app**

---

## Contact

**NETZ INFORMATIQUE**
- Email : contact@netzinformatique.fr
- Téléphone : 03 67 31 02 01

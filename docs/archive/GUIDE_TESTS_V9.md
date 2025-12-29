# Guide des Tests V9 - Bilan-Easy

## Résumé

Cette version apporte une augmentation majeure de la couverture de tests, passant de 67% à **71%**.

---

## 1. Statistiques des tests

| Métrique | V8 | V9 | Progression |
|----------|-----|-----|-------------|
| **Tests totaux** | 270 | **356** | **+86 (+32%)** |
| **Fichiers de test** | 16 | 16 | - |
| **Couverture globale** | 67% | **71%** | **+4%** |

---

## 2. Couverture par fichier

### Fichiers avec couverture excellente (>80%)

| Fichier | Couverture | Tests |
|---------|------------|-------|
| `organization.ts` | **100%** | 29 |
| `excelExportService.ts` | **99%** | 14 |
| `useDarkMode.ts` | **93%** | 3 |
| `storageService.ts` | **90%** | 35 |
| `Toast.tsx` | **88%** | 6 |
| `ToastProvider.tsx` | **85%** | 15 |
| `authService.ts` | **82%** | 38 |

### Fichiers avec couverture bonne (60-80%)

| Fichier | Couverture | Tests |
|---------|------------|-------|
| `gmailService.ts` | 69% | 30 |
| `pushNotificationService.ts` | 68% | 47 |
| `useOffline.ts` | 67% | 22 |
| `NotificationManager.tsx` | 63% | 24 |
| `useAutoSave.ts` | 61% | 18 |

### Fichiers avec couverture moyenne (40-60%)

| Fichier | Couverture | Tests |
|---------|------------|-------|
| `OfflineIndicator.tsx` | 55% | 5 |
| `historyService.ts` | 53% | 24 |
| `offlineSyncService.ts` | 49% | 26 |
| `DraftRecovery.tsx` | 48% | 18 |

---

## 3. Détail des tests par fichier

### Services (73% de couverture moyenne)

| Fichier | Tests | Description |
|---------|-------|-------------|
| `pushNotificationService.test.ts` | 47 | Templates, fonctions, scheduling |
| `authService.test.ts` | 38 | SignUp, SignIn, SignOut, profil, rôles |
| `storageService.test.ts` | 35 | Upload, download, list, delete |
| `gmailService.test.ts` | 30 | Templates d'emails, préparation |
| `offlineSyncService.test.ts` | 26 | Queue, sync, offline answers |
| `historyService.test.ts` | 24 | History local et Supabase |
| `excelExportService.test.ts` | 14 | Export, données, caractères spéciaux |

### Hooks (68% de couverture moyenne)

| Fichier | Tests | Description |
|---------|-------|-------------|
| `useOffline.test.ts` | 22 | Online/offline, sync, service worker |
| `useAutoSave.test.ts` | 18 | Save, localStorage, Supabase |
| `useDarkMode.test.ts` | 3 | Toggle, persistence |

### Composants (62% de couverture moyenne)

| Fichier | Tests | Description |
|---------|-------|-------------|
| `NotificationManager.test.tsx` | 24 | Permission, notifications, hook |
| `DraftRecovery.test.tsx` | 18 | Structure, localStorage, props |
| `ToastProvider.test.tsx` | 15 | Provider, useToast, fonctions |
| `Toast.test.tsx` | 6 | Types, affichage |
| `OfflineIndicator.test.tsx` | 5 | Indicateur de connexion |

### Config (100% de couverture)

| Fichier | Tests | Description |
|---------|-------|-------------|
| `organization.test.ts` | 29 | Config, prix, durées, infos légales |

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
│   ├── DraftRecovery.test.tsx      (18 tests)
│   ├── NotificationManager.test.tsx (24 tests)
│   ├── OfflineIndicator.test.tsx   (5 tests)
│   ├── Toast.test.tsx              (6 tests)
│   └── ToastProvider.test.tsx      (15 tests)
├── config/
│   └── organization.test.ts        (29 tests)
├── hooks/
│   ├── useAutoSave.test.ts         (18 tests)
│   ├── useDarkMode.test.ts         (3 tests)
│   └── useOffline.test.ts          (22 tests)
├── services/
│   ├── authService.test.ts         (38 tests)
│   ├── excelExportService.test.ts  (14 tests)
│   ├── gmailService.test.ts        (30 tests)
│   ├── historyService.test.ts      (24 tests)
│   ├── offlineSyncService.test.ts  (26 tests)
│   ├── pushNotificationService.test.ts (47 tests)
│   └── storageService.test.ts      (35 tests)
└── test/
    └── setup.ts
```

---

## 6. Progression de la couverture

| Version | Tests | Couverture | Progression |
|---------|-------|------------|-------------|
| V6 | 73 | 38% | Baseline |
| V7 | 170 | 54% | +16% |
| V8 | 270 | 67% | +13% |
| **V9** | **356** | **71%** | **+4%** |

---

## 7. Prochaines étapes pour atteindre 80%

| Priorité | Action | Impact estimé |
|----------|--------|---------------|
| Haute | Tests des handlers dans DraftRecovery | +3% |
| Haute | Tests des cas d'erreur Supabase | +2% |
| Moyenne | Tests d'intégration complets | +3% |
| Basse | Tests E2E avec Playwright | +5% |

---

## 8. Commits

```
4da677a - test: Augmentation majeure de la couverture de tests à 71%
7214616 - test: Augmentation majeure de la couverture de tests à 67%
a334b0c - test: Augmentation significative de la couverture de tests
6b75be3 - test: Augmentation de la couverture de tests
```

---

## 9. URL de production

**https://bilan-easy.vercel.app**

---

## Contact

**NETZ INFORMATIQUE**
- Email : contact@netzinformatique.fr
- Téléphone : 03 67 31 02 01

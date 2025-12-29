# Guide des Tests V8 - Bilan-Easy

## Résumé

Cette version apporte une augmentation majeure de la couverture de tests, passant de 54% à **67%**.

---

## 1. Statistiques des tests

| Métrique | V7 | V8 | Progression |
|----------|-----|-----|-------------|
| **Tests totaux** | 170 | 270 | **+100 (+59%)** |
| **Fichiers de test** | 15 | 16 | +1 |
| **Couverture globale** | 54% | **67%** | **+13%** |

---

## 2. Couverture par fichier

### Fichiers avec couverture excellente (>80%)

| Fichier | Couverture | Tests |
|---------|------------|-------|
| `organization.ts` | **100%** | 29 |
| `excelExportService.ts` | **99%** | 14 |
| `useDarkMode.ts` | **93%** | 3 |
| `Toast.tsx` | **89%** | 6 |
| `storageService.ts` | **86%** | 35 |
| `ToastProvider.tsx` | **85%** | 15 |

### Fichiers avec couverture bonne (60-80%)

| Fichier | Couverture | Tests |
|---------|------------|-------|
| `gmailService.ts` | 69% | 6 |
| `authService.ts` | 68% | 17 |
| `useOffline.ts` | 67% | 22 |
| `useAutoSave.ts` | 61% | 18 |

### Fichiers avec couverture moyenne (40-60%)

| Fichier | Couverture | Tests |
|---------|------------|-------|
| `NotificationManager.tsx` | 53% | 8 |
| `historyService.ts` | 53% | 20 |
| `OfflineIndicator.tsx` | 55% | 5 |
| `offlineSyncService.ts` | 49% | 26 |
| `DraftRecovery.tsx` | 48% | 12 |

---

## 3. Détail des tests par fichier

### Services (68% de couverture moyenne)

| Fichier | Tests | Description |
|---------|-------|-------------|
| `storageService.test.ts` | 35 | Upload, download, list, delete avec mocks complets |
| `pushNotificationService.test.ts` | 26 | Tous les templates et fonctions |
| `offlineSyncService.test.ts` | 26 | Queue, sync, offline answers |
| `historyService.test.ts` | 20 | History local et Supabase |
| `authService.test.ts` | 17 | SignUp, SignIn, SignOut, profil |
| `excelExportService.test.ts` | 14 | Export, données, caractères spéciaux |
| `gmailService.test.ts` | 6 | Templates d'emails |

### Hooks (68% de couverture moyenne)

| Fichier | Tests | Description |
|---------|-------|-------------|
| `useOffline.test.ts` | 22 | Online/offline, sync, service worker |
| `useAutoSave.test.ts` | 18 | Save, localStorage, Supabase |
| `useDarkMode.test.ts` | 3 | Toggle, persistence |

### Composants (59% de couverture moyenne)

| Fichier | Tests | Description |
|---------|-------|-------------|
| `ToastProvider.test.tsx` | 15 | Provider, useToast, fonctions |
| `DraftRecovery.test.tsx` | 12 | Structure, localStorage |
| `NotificationManager.test.tsx` | 8 | Permission, notifications |
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
npm run test:run -- src/services/storageService.test.ts
```

---

## 5. Structure des tests

```
src/
├── components/
│   ├── DraftRecovery.test.tsx      (12 tests)
│   ├── NotificationManager.test.tsx (8 tests)
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
│   ├── authService.test.ts         (17 tests)
│   ├── excelExportService.test.ts  (14 tests)
│   ├── gmailService.test.ts        (6 tests)
│   ├── historyService.test.ts      (20 tests)
│   ├── offlineSyncService.test.ts  (26 tests)
│   ├── pushNotificationService.test.ts (26 tests)
│   └── storageService.test.ts      (35 tests)
└── test/
    └── setup.ts
```

---

## 6. Prochaines étapes pour atteindre 80%

| Priorité | Action | Impact estimé |
|----------|--------|---------------|
| Haute | Tests des handlers dans les composants | +5% |
| Haute | Tests des cas d'erreur Supabase | +3% |
| Moyenne | Tests d'intégration complets | +5% |
| Basse | Tests E2E avec Playwright | +10% |

---

## 7. Commits

```
7214616 - test: Augmentation majeure de la couverture de tests à 67%
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

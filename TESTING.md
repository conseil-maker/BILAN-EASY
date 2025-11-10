# 🧪 Testing Guide - BILAN-EASY

Bu dokümantasyon, BILAN-EASY projesi için test suite'ini açıklar.

## 📊 Test İstatistikleri

- **Toplam Test Dosyası**: 22
- **Frontend Tests**: 15 dosya
- **Backend Tests**: 7 dosya
- **Toplam Test Sayısı**: 69+ test

## 🏗️ Test Yapısı

### Frontend Tests (`src/test/`)

#### Components (8 dosya)
- `WelcomeScreen.test.tsx` - Welcome ekranı testleri
- `PackageSelector.test.tsx` - Paket seçimi testleri
- `PhasePreliminaire.test.tsx` - Ön faz testleri
- `PersonalizationStep.test.tsx` - Kişiselleştirme testleri
- `HistoryScreen.test.tsx` - Geçmiş ekranı testleri
- `ErrorBoundary.test.tsx` - Hata yakalama testleri
- `SkeletonLoader.test.tsx` - Loading skeleton testleri
- `Toast.test.tsx` - Bildirim testleri

#### Services (3 dosya)
- `apiClient.test.ts` - API client testleri (retry, error handling)
- `geminiService.test.ts` - Gemini AI servis testleri
- `historyService.test.ts` - Geçmiş servis testleri (localStorage)

#### Hooks (4 dosya)
- `useDebounce.test.ts` - Debounce hook testleri
- `useOfflineDetection.test.ts` - Offline detection testleri
- `useSpeechRecognition.test.ts` - Speech-to-text testleri
- `useSpeechSynthesis.test.ts` - Text-to-speech testleri

### Backend Tests (`backend/src/test/`)

#### Routes (3 dosya)
- `assessments.test.ts` - Assessment CRUD testleri
- `answers.test.ts` - Answer oluşturma ve listeleme testleri
- `summaries.test.ts` - Summary oluşturma testleri

#### Middleware (2 dosya)
- `auth.test.ts` - Authentication middleware testleri
- `error.test.ts` - Error handling middleware testleri

#### Utils (2 dosya)
- `response.test.ts` - Response helper testleri
- `validate.test.ts` - Validation schema testleri

## 🚀 Test Çalıştırma

### Tüm Testleri Çalıştırma

```bash
# Frontend testleri
npm test

# Backend testleri
cd backend && npm test

# Her ikisi birden (root'tan)
npm test
```

### Watch Mode

```bash
# Frontend (otomatik yeniden çalıştırma)
npm test

# Backend
cd backend && npm test
```

### Coverage Raporu

```bash
# Frontend coverage
npm test -- --coverage

# Backend coverage
cd backend && npm test -- --coverage
```

### UI Mode (Vitest UI)

```bash
# Frontend
npm run test:ui

# Backend
cd backend && npm run test:ui
```

## 📝 Test Yazma Kuralları

### Component Testleri

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../utils/testUtils';
import MyComponent from '../../../components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Service Testleri

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { myService } from '../../../services/myService';

describe('MyService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should perform action', async () => {
    const result = await myService.action();
    expect(result).toBeDefined();
  });
});
```

### Hook Testleri

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMyHook } from '../../../hooks/useMyHook';

describe('useMyHook', () => {
  it('should return expected value', () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current.value).toBeDefined();
  });
});
```

## 🎯 Test Kapsamı

### ✅ Test Edilenler

- **Components**: Tüm ana component'ler
- **Services**: API client, history service
- **Hooks**: Debounce, offline detection, speech hooks
- **Backend Routes**: Assessments, answers, summaries
- **Backend Middleware**: Auth, error handling
- **Backend Utils**: Response helpers, validation

### ⚠️ Eksik Testler (İsteğe Bağlı)

- `Questionnaire.tsx` - Kompleks component (integration test gerekli)
- `SummaryDashboard.tsx` - Kompleks component
- `Dashboard.tsx` - Kompleks component
- E2E testleri (Playwright/Cypress)
- Integration testleri (frontend-backend)

## 🔧 Test Utilities

### `testUtils.tsx`

Custom render fonksiyonu ile provider'ları içerir:

```typescript
import { render } from '../utils/testUtils';

// ToastProvider otomatik eklenir
render(<MyComponent />);
```

## 📈 Coverage Hedefleri

- **Components**: %80+
- **Services**: %90+
- **Hooks**: %85+
- **Backend Routes**: %85+
- **Backend Middleware**: %90+

## 🐛 Debugging Tests

### Tek bir test dosyası çalıştırma

```bash
npm test -- src/test/components/WelcomeScreen.test.tsx
```

### Tek bir test çalıştırma

```bash
npm test -- -t "should render welcome screen"
```

### Verbose output

```bash
npm test -- --reporter=verbose
```

## 📚 Daha Fazla Bilgi

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)


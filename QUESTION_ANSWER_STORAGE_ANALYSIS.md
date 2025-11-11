# Soru ve Cevap Kayıt Durumu Analizi

## ✅ Mevcut Durum

### Cevaplar (Answers) - TAM KAYITLI ✅

**Backend'de kaydediliyor:**
- ✅ Her cevap `api.addAnswer()` ile backend'e gönderiliyor
- ✅ `answers` tablosunda saklanıyor
- ✅ Kaydedilen bilgiler:
  - `questionId` - Soru ID'si
  - `questionTitle` - Soru başlığı
  - `questionType` - Soru tipi (PARAGRAPH/MULTIPLE_CHOICE)
  - `questionTheme` - Soru teması/kategorisi
  - `value` - Kullanıcının cevabı
  - `answeredAt` - Cevaplama zamanı
  - `assessmentId` - Hangi bilan'a ait

**Kod yeri:**
- Frontend: `components/Questionnaire.tsx` → `handleAnswerSubmitInternal()` (satır 540)
- Backend: `backend/src/routes/answers.ts` → `POST /api/assessments/:assessmentId/answers`
- Database: `backend/src/db/schema.ts` → `answers` tablosu

### Sorular (Questions) - KISMEN KAYITLI ⚠️

**Mevcut durum:**
- ⚠️ Sorular dinamik olarak AI tarafından üretiliyor
- ⚠️ Ayrı bir `questions` tablosu YOK
- ✅ Soru bilgileri cevaplarla birlikte kaydediliyor (questionId, questionTitle, questionType, questionTheme)
- ❌ Eksik bilgiler:
  - `question.description` - Soru açıklaması/detayı
  - `question.choices` - Multiple choice seçenekleri (eğer varsa)

**Kod yeri:**
- Soru üretimi: `services/aiService.ts` → `generateQuestion()`
- Soru kaydı: Şu anda yok (sadece cevaplarla birlikte kaydediliyor)

## 🔧 Önerilen İyileştirmeler

### 1. Sorular İçin Ayrı Tablo Oluşturma

**Avantajlar:**
- ✅ Sorular tekrar kullanılabilir
- ✅ Soru istatistikleri tutulabilir
- ✅ Soru kalitesi analiz edilebilir
- ✅ Soru description ve choices tam olarak kaydedilir

**Yeni Tablo Yapısı:**
```sql
CREATE TABLE questions (
  id UUID PRIMARY KEY,
  assessment_id UUID REFERENCES assessments(id),
  question_id VARCHAR(255) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  theme VARCHAR(255),
  choices JSONB, -- Multiple choice seçenekleri
  phase VARCHAR(50), -- phase1, phase2, phase3
  category_index INTEGER,
  generated_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL
);
```

### 2. Mevcut Sistemi Geliştirme

**Seçenek A: Soruları cevaplarla birlikte kaydet (minimal değişiklik)**
- `answers` tablosuna `questionDescription` ve `questionChoices` kolonları ekle
- Her cevap kaydedilirken soru detaylarını da kaydet

**Seçenek B: Ayrı questions tablosu oluştur (tam çözüm)**
- Yeni `questions` tablosu oluştur
- Her soru üretildiğinde kaydet
- Cevaplarla ilişkilendir

## 📋 Mevcut Kayıt Özeti

| Veri | Kayıt Durumu | Tablo | Eksikler |
|------|--------------|-------|----------|
| **Cevap metni** | ✅ Tam | `answers.value` | - |
| **Soru başlığı** | ✅ Tam | `answers.questionTitle` | - |
| **Soru ID** | ✅ Tam | `answers.questionId` | - |
| **Soru tipi** | ✅ Tam | `answers.questionType` | - |
| **Soru teması** | ✅ Tam | `answers.questionTheme` | - |
| **Soru açıklaması** | ❌ Yok | - | `question.description` |
| **Soru seçenekleri** | ❌ Yok | - | `question.choices` |
| **Cevap zamanı** | ✅ Tam | `answers.answeredAt` | - |

## 🎯 Sonuç

**Mevcut sistem:**
- ✅ Tüm cevaplar kaydediliyor
- ✅ Soru bilgilerinin çoğu cevaplarla birlikte kaydediliyor
- ⚠️ Soru description ve choices kaydedilmiyor

**Öneri:**
Eğer soru description ve choices'ın da kaydedilmesini istiyorsanız, `answers` tablosuna bu kolonları ekleyebiliriz veya ayrı bir `questions` tablosu oluşturabiliriz.


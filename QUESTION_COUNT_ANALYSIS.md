# Soru Sayısı Analizi ve Düzeltme Planı

## 🔍 Mevcut Sorun

### Parcours Découverte (5 saat bekleniyor, ama 5 dakikada bitiyor)

**Mevcut Mantık:**
- `questionnaires: 1` = 1 kategori döngüsü
- Her phase'de 4 kategori var
- Her kategori için sadece 1 soru soruluyor
- **Toplam: 3 phase × 1 döngü × 4 kategori × 1 soru = 12 soru** ❌

**Beklenen:**
- 5 saat = ~300 dakika
- Ortalama soru başına 10-15 dakika düşünülürse
- **Toplam: 20-30 soru olmalı** ✅

## 📊 Doğru Mantık

### Her Kategori İçin Birden Fazla Soru

**Parcours Découverte (5 saat):**
- Phase 1 (60 min): 4 kategori × 2-3 soru = **8-12 soru**
- Phase 2 (120 min): 4 kategori × 3-4 soru = **12-16 soru**
- Phase 3 (120 min): 4 kategori × 2-3 soru = **8-12 soru**
- **Toplam: 28-40 soru** ✅

**Bilan Approfondi (12 saat):**
- Phase 1 (120 min): 2 döngü × 4 kategori × 2-3 soru = **16-24 soru**
- Phase 2 (240 min): 2 döngü × 4 kategori × 3-4 soru = **24-32 soru**
- Phase 3 (360 min): 2 döngü × 4 kategori × 3-4 soru = **24-32 soru**
- **Toplam: 64-88 soru** ✅

**Accompagnement Stratégique (24 saat):**
- Phase 1 (180 min): 3 döngü × 4 kategori × 2-3 soru = **24-36 soru**
- Phase 2 (480 min): 3 döngü × 4 kategori × 3-4 soru = **36-48 soru**
- Phase 3 (780 min): 3 döngü × 4 kategori × 4-5 soru = **48-60 soru**
- **Toplam: 108-144 soru** ✅

## 🔧 Çözüm

### 1. `getPhaseInfo` Fonksiyonunu Düzelt

`questionnaires` değerini "kategori döngüsü sayısı" olarak yorumla, ama her kategori için birden fazla soru sor.

### 2. Soru Sayısı Hesaplama

Her kategori için soru sayısı = `questionnaires × questionsPerCategory`

`questionsPerCategory` değeri:
- Parcours Découverte: 2-3 soru/kategori
- Bilan Approfondi: 3-4 soru/kategori
- Accompagnement Stratégique: 4-5 soru/kategori

### 3. `totalQuestionnaires` Değerini Güncelle

`totalQuestionnaires` artık "toplam soru sayısı" olmalı, "kategori döngüsü sayısı" değil.

## 📝 Önerilen Değişiklikler

1. **constants.ts**: `totalQuestionnaires` değerlerini güncelle
2. **Questionnaire.tsx**: `getPhaseInfo` ve soru sayısı hesaplamasını düzelt
3. **Phase geçiş mantığı**: Her kategori için birden fazla soru sorulduğundan emin ol


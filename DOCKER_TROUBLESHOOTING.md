# 🐳 Docker Troubleshooting Guide

## Docker Daemon Çalışmıyor

### macOS'ta Çözüm

1. **Docker Desktop'ı başlatın**
   ```bash
   # Docker Desktop uygulamasını açın
   open -a Docker
   ```

2. **Docker Desktop'ın çalıştığını kontrol edin**
   ```bash
   docker info
   # Eğer hata alıyorsanız, Docker Desktop henüz başlamamıştır
   ```

3. **Docker Desktop başladıktan sonra tekrar deneyin**
   ```bash
   docker-compose up -d
   ```

### Docker Desktop Yüklü Değilse

1. **Docker Desktop'ı indirin**
   - https://www.docker.com/products/docker-desktop/
   - macOS için indirin ve yükleyin

2. **Docker Desktop'ı başlatın**
   - Applications klasöründen Docker'ı açın
   - İlk başlatmada biraz zaman alabilir

3. **Kontrol edin**
   ```bash
   docker --version
   docker-compose --version
   ```

---

## Docker Compose Hataları

### "version attribute is obsolete"

✅ **Çözüldü**: `docker-compose.yml` dosyasından `version: '3.8'` satırı kaldırıldı.

### "Cannot connect to Docker daemon"

**Neden**: Docker Desktop çalışmıyor.

**Çözüm**:
```bash
# Docker Desktop'ı başlat
open -a Docker

# Birkaç saniye bekleyin, sonra kontrol edin
docker ps
```

### Port Already in Use

**Hata**: `Bind for 0.0.0.0:3000 failed: port is already allocated`

**Çözüm**:
```bash
# Port'u kullanan process'i bulun
lsof -i :3000

# Process'i durdurun veya docker-compose.yml'de port'u değiştirin
```

---

## Docker Compose Kullanımı

### Servisleri Başlat

```bash
# Root dizinde
docker-compose up -d
```

### Servisleri Durdur

```bash
docker-compose down
```

### Logları Görüntüle

```bash
# Tüm servisler
docker-compose logs -f

# Sadece backend
docker-compose logs -f backend

# Sadece frontend
docker-compose logs -f frontend
```

### Servisleri Yeniden Başlat

```bash
docker-compose restart
```

### Servisleri Rebuild Et

```bash
# Tüm servisleri rebuild et
docker-compose up -d --build

# Sadece backend'i rebuild et
docker-compose up -d --build backend
```

---

## Database Migration (Docker içinde)

### Backend Container'a Gir

```bash
docker exec -it bilan-backend sh
```

### Migration Çalıştır

```bash
# Container içinde
npm run db:push
```

### Veya Dışarıdan

```bash
docker exec -it bilan-backend npm run db:push
```

---

## Yaygın Sorunlar

### 1. PostgreSQL Bağlantı Hatası

**Hata**: `connection refused` veya `database does not exist`

**Çözüm**:
```bash
# PostgreSQL container'ının çalıştığını kontrol edin
docker-compose ps

# PostgreSQL loglarını kontrol edin
docker-compose logs postgres

# DATABASE_URL'i kontrol edin
# docker-compose.yml'de doğru olmalı
```

### 2. Frontend Build Hatası

**Hata**: `Cannot find module` veya build errors

**Çözüm**:
```bash
# Frontend image'ı rebuild et
docker-compose build frontend

# Cache olmadan rebuild
docker-compose build --no-cache frontend
```

### 3. Backend Başlamıyor

**Hata**: Backend container sürekli restart oluyor

**Çözüm**:
```bash
# Backend loglarını kontrol edin
docker-compose logs backend

# Genellikle DATABASE_URL veya environment variable sorunudur
# .env dosyasını kontrol edin
```

---

## Docker Cleanup

### Kullanılmayan Container'ları Temizle

```bash
docker-compose down
docker system prune -a
```

### Volume'ları Temizle (DİKKAT: Veri kaybı olur)

```bash
docker-compose down -v
```

---

## Hızlı Kontrol Listesi

- [ ] Docker Desktop çalışıyor mu? (`docker info`)
- [ ] Port'lar boş mu? (`lsof -i :3000`, `lsof -i :3001`, `lsof -i :5432`)
- [ ] `.env` dosyası var mı ve doğru mu?
- [ ] `docker-compose.yml` doğru dizinde mi?
- [ ] Container'lar çalışıyor mu? (`docker-compose ps`)

---

## Yardımcı Komutlar

```bash
# Tüm container'ları listele
docker ps -a

# Container'ların durumunu gör
docker-compose ps

# Container'a shell ile gir
docker exec -it <container-name> sh

# Container'ı durdur
docker stop <container-name>

# Container'ı sil
docker rm <container-name>

# Image'ları listele
docker images

# Logları görüntüle
docker logs <container-name>
```


# KaptanlikApp - Sunucu Kurulum Handover

## Proje Ozeti
- **Isim:** KaptanlikApp
- **Aciklama:** Kaptanlik ehliyet sinavi hazirlik uygulamasi
- **Frontend:** React 19 + TypeScript + Tailwind CSS + shadcn/ui (PWA)
- **Backend:** Supabase (PostgreSQL + Auth + Realtime) - Docker
- **Mobil:** Capacitor (iOS/Android)
- **Soru Bankasi:** 890 soru (parse edilmis JSON)
- **Kaynak PDF:** Onur Sevincler 02.24 Subat Stabilite (437 sayfa)

---

## 1. Sistem Gereksinimleri

| Bilesen | Minimum | Onerilen |
|---------|---------|----------|
| RAM | 4 GB | 8 GB |
| Disk | 20 GB | 50 GB |
| CPU | 2 cekirdek | 4 cekirdek |
| OS | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |

### Gerekli Yazilimlar
```bash
# Sistem guncelleme
sudo apt update && sudo apt upgrade -y

# Docker kurulumu
sudo apt install -y docker.io docker-compose-plugin
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
# CIKIS YAPIP TEKRAR GIRIS YAP (veya: newgrp docker)

# Node.js 20+ kurulumu
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Git kurulumu
sudo apt install -y git nginx certbot python3-certbot-nginx

# Versiyon kontrol
docker --version        # >= 24.0
node --version          # >= 20.0
npm --version           # >= 10.0
```

---

## 2. GitHub'dan Repo Cekme

```bash
cd /opt
sudo mkdir -p /opt/kaptanlikapp
sudo chown $USER:$USER /opt/kaptanlikapp
git clone https://github.com/AsilOzbay/kaptanlikapp.git /opt/kaptanlikapp
cd /opt/kaptanlikapp
```

### Repo Yapisi
```
/opt/kaptanlikapp/
├── dist/                        # Build edilmis frontend (deploy edilecek)
├── parsed_questions/            # 890 soru JSON
│   ├── questions_1_50.json
│   ├── questions_51_150.json
│   ├── questions_151_250.json
│   ├── questions_251_350.json
│   ├── questions_351_437.json
│   └── questions_351_890.json
├── supabase_backend/            # Backend
│   ├── docker-compose.yml
│   ├── migrations/
│   ├── setup.sh
│   ├── API_SPEC.md
│   └── .env.example
├── public/                      # Frontend public (gorseller, sorular)
├── src/                         # Frontend kaynak kodu
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── TEST_SENARYOLARI.md          # 50 test senaryosu
└── HANDOVER.md                  # Bu dosya
```

---

## 3. Supabase Backend Kurulumu

### Adim 3.1: Environment Degiskenleri

```bash
cd /opt/kaptanlikapp/supabase_backend
cp .env.example .env
nano .env
```

**`.env` icerigi doldur:**
```env
# PostgreSQL
POSTGRES_PASSWORD=GucluSifre123!Degistir
POSTGRES_DB=postgres
POSTGRES_USER=postgres

# JWT Secrets (openssl rand -base64 48 ile uret)
JWT_SECRET=degistir-bu-degeri-openssl-ile-uret
ANON_KEY=degistir-bu-degeri-openssl-ile-uret
SERVICE_ROLE_KEY=degistir-bu-degeri-openssl-ile-uret

# Site URL (public IP veya domain)
SITE_URL=http://SUNUCU_PUBLIC_IP:3000
ADDITIONAL_REDIRECT_URLS=http://localhost:3000

# SMTP (opsiyonel - e-posta gonderimi icin)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_SENDER_NAME=KaptanlikApp

# Portlar
KONG_HTTP_PORT=8000
KONG_HTTPS_PORT=8443
POSTGRES_PORT=5432
STUDIO_PORT=54323
```

### Adim 3.2: Guvenli JWT ve API Key Uretme

```bash
# Guvenli key'ler uret
cd /opt/kaptanlikapp/supabase_backend

export JWT_SECRET=$(openssl rand -base64 48)
export ANON_KEY=$(openssl rand -base64 48)
export SERVICE_ROLE_KEY=$(openssl rand -base64 48)

echo "JWT_SECRET=$JWT_SECRET"
echo "ANON_KEY=$ANON_KEY"
echo "SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY"

# Bu degerleri .env dosyasina kopyala
sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" .env
sed -i "s|ANON_KEY=.*|ANON_KEY=$ANON_KEY|" .env
sed -i "s|SERVICE_ROLE_KEY=.*|SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY|" .env
```

### Adim 3.3: Docker Compose ile Baslatma

```bash
cd /opt/kaptanlikapp/supabase_backend

# Supabase stack'ini baslat (ilk calistirma 3-5 dk surer)
docker compose up -d

# Container'larin durumunu kontrol et
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

**Beklenen output:**
```
NAMES                    STATUS          PORTS
supabase-kong            Up 10 seconds   0.0.0.0:8000->8000/tcp, 0.0.0.0:8443->8443/tcp
supabase-auth            Up 10 seconds   9999/tcp
supabase-rest            Up 10 seconds   3000/tcp
supabase-realtime        Up 10 seconds   4000/tcp
supabase-storage         Up 10 seconds   5000/tcp
supabase-meta            Up 10 seconds   8080/tcp
supabase-studio          Up 10 seconds   3000/tcp
supabase-db              Up 10 seconds   0.0.0.0:5432->5432/tcp
```

### Adim 3.4: Migration'lari Calistirma

```bash
# PostgreSQL'e baglan ve migration'lari calistir
cd /opt/kaptanlikapp/supabase_backend

# Schema olustur
sudo docker compose exec -T db psql -U postgres -d postgres < migrations/001_initial_schema.sql

# RLS politikalarini ekle
sudo docker compose exec -T db psql -U postgres -d postgres < migrations/002_rls_policies.sql

# Triggers ve fonksiyonlar
sudo docker compose exec -T db psql -U postgres -d postgres < migrations/003_functions_triggers.sql

# Seed data (paket, rozetler, admin kullanici)
sudo docker compose exec -T db psql -U postgres -d postgres < migrations/004_seed_data.sql
```

### Adim 3.5: Saglik Kontrolu

```bash
# API saglik kontrolu
curl http://localhost:8000/rest/v1/packages \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY"

# Beklenen: [{"id": "stab_2024_02", "title": "Subat 2024 Stabilite", ...}]

# Auth saglik kontrolu
curl http://localhost:8000/auth/v1/health

# Beklenen: {"version": "...", "status": "OK"}
```

---

## 4. Sorulari Database'e Import Etme

### Adim 4.1: Node.js Import Scripti

```bash
cd /opt/kaptanlikapp
npm install pg
```

```bash
cat > scripts/import_questions.js << 'IMPORTSCRIPT'
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'GucluSifre123!Degistir',
});

const files = [
  'parsed_questions/questions_1_50.json',
  'parsed_questions/questions_51_150.json',
  'parsed_questions/questions_151_250.json',
  'parsed_questions/questions_251_350.json',
  'parsed_questions/questions_351_890.json',
];

async function importQuestions() {
  let total = 0;
  
  for (const file of files) {
    const filepath = path.join(__dirname, '..', file);
    if (!fs.existsSync(filepath)) {
      console.log(`Dosya bulunamadi: ${file}`);
      continue;
    }
    
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    const questions = data.sorular || [];
    
    for (const q of questions) {
      try {
        await pool.query(`
          INSERT INTO questions (
            package_id, question_number, topic, question_text,
            option_a, option_b, option_c, option_d, option_e,
            correct_answer, explanation, formulas, difficulty
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          ON CONFLICT DO NOTHING
        `, [
          'stab_2024_02',
          q.soru_no,
          q.konu || 'Genel',
          q.soru_metni,
          q.secenekler?.A || '',
          q.secenekler?.B || '',
          q.secenekler?.C || '',
          q.secenckler?.D || '',
          q.secenekler?.E || '',
          q.dogru_cevap,
          q.aciklama || '',
          q.formuller || [],
          q.zorluk || 'orta',
        ]);
        total++;
      } catch (err) {
        console.error(`Soru ${q.soru_no} hatasi:`, err.message);
      }
    }
    
    console.log(`${file}: ${questions.length} soru isleme alindi`);
  }
  
  console.log(`\n=== TOPLAM ${total} SORU IMPORT EDILDI ===`);
  await pool.end();
}

importQuestions().catch(console.error);
IMPORTSCRIPT
```

```bash
cd /opt/kaptanlikapp
node scripts/import_questions.js
```

**Beklenen output:**
```
parsed_questions/questions_1_50.json: 50 soru isleme alindi
parsed_questions/questions_51_150.json: 100 soru isleme alindi
parsed_questions/questions_151_250.json: 100 soru isleme alindi
parsed_questions/questions_251_350.json: 100 soru isleme alindi
parsed_questions/questions_351_890.json: 540 soru isleme alindi

=== TOPLAM 890 SORU IMPORT EDILDI ===
```

### Adim 4.2: Import Dogrulama

```bash
# Supabase Studio'ya gir (tarayicidan)
# http://SUNUCU_PUBLIC_IP:54323

# SQL Editor'de calistir:
SELECT COUNT(*) as total_questions FROM questions;
-- Beklenen: 890

SELECT topic, COUNT(*) as count 
FROM questions 
GROUP BY topic 
ORDER BY count DESC;
```

---

## 5. Frontend Build & Deploy

### Adim 5.1: Supabase URL'lerini Ayarlama

```bash
cd /opt/kaptanlikapp

# .env dosyasi olustur
cat > .env << 'ENVFILE'
VITE_SUPABASE_URL=http://SUNUCU_PUBLIC_IP:8000
VITE_SUPABASE_ANON_KEY=DEGISTIR_ANON_KEY
ENVFILE

# .env'den ANON_KEY'i supabase_backend/.env'den al
ANON_KEY=$(grep ANON_KEY /opt/kaptanlikapp/supabase_backend/.env | cut -d= -f2 | head -1)
sed -i "s|DEGISTIR_ANON_KEY|$ANON_KEY|" .env

# Gercek IP'yi yaz
sed -i "s|SUNUCU_PUBLIC_IP|$(curl -s ifconfig.me)|" .env
```

### Adim 5.2: Build

```bash
cd /opt/kaptanlikapp
npm install
npm run build

# dist/ klasoru olustu mu kontrol et
ls -la dist/
# Beklenen: index.html + assets/
```

### Adim 5.3: Nginx ile Serve Etme

```bash
# Nginx config
sudo tee /etc/nginx/sites-available/kaptanlikapp << 'NGINXCONF'
server {
    listen 80;
    server_name SUNUCU_PUBLIC_IP;
    
    root /opt/kaptanlikapp/dist;
    index index.html;
    
    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/javascript;
    
    # Cache static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # SPA routing - her route index.html'e yonlendir
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy Supabase API (opsiyonel - CORS icin)
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
NGINXCONF

# IP'yi gercek degerle degistir
sudo sed -i "s|SUNUCU_PUBLIC_IP|$(curl -s ifconfig.me)|" /etc/nginx/sites-available/kaptanlikapp

# Siteyi etkinlestir
sudo ln -sf /etc/nginx/sites-available/kaptanlikapp /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

**Tarayicidan erisim:** `http://SUNUCU_PUBLIC_IP`

---

## 6. SSL (HTTPS) - Let's Encrypt

```bash
# Certbot ile SSL sertifikasi al
sudo certbot --nginx -d SENIN_DOMAININ.COM

# Otomatik yenileme kontrolu
sudo certbot renew --dry-run

# Domain yoksa IP ile self-signed sertifika (gelistirme icin)
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/kaptanlikapp.key \
  -out /etc/ssl/certs/kaptanlikapp.crt \
  -subj "/CN=SUNUCU_PUBLIC_IP"
```

---

## 7. Capacitor Mobil Build (iOS/Android)

```bash
cd /opt/kaptanlikapp

# Capacitor ekle
npm install @capacitor/core @capacitor/cli
npx cap init KaptanlikApp com.kaptanlik.app --web-dir dist

# Platform ekle
npm install @capacitor/android @capacitor/ios
npx cap add android
npx cap add ios

# Build sync
npm run build
npx cap sync

# Android build
npx cap open android
# Android Studio'da: Build -> Generate Signed Bundle/APK

# iOS build (Mac gerekiyor)
npx cap open ios
# Xcode'da: Product -> Archive -> Distribute
```

---

## 8. Supabase Studio Yonetim Paneli

```
URL: http://SUNUCU_PUBLIC_IP:54323

Icerik:
- Table Editor: Tablolari gorme/duzenleme
- SQL Editor: SQL sorgulari calistirma
- Authentication: Kullanicilari yonetme
- Database: Migration, backup
- Storage: Dosya yukleme
```

---

## 9. Supabase API Endpoint'leri

| Servis | URL | Aciklama |
|--------|-----|----------|
| REST API | `http://IP:8000/rest/v1/` | CRUD islemleri |
| Auth | `http://IP:8000/auth/v1/` | Kayit/giris/sifre |
| Realtime | `ws://IP:8000/realtime/v1` | Canli veri |
| Storage | `http://IP:8000/storage/v1/` | Dosya yukleme |
| Studio | `http://IP:54323` | Yonetim paneli |

---

## 10. Loglar ve Debug

```bash
# Supabase container loglari
sudo docker compose -f /opt/kaptanlikapp/supabase_backend/docker-compose.yml logs -f

# Sadece db loglari
sudo docker compose -f /opt/kaptanlikapp/supabase_backend/docker-compose.yml logs -f db

# Sadece auth loglari
sudo docker compose -f /opt/kaptanlikapp/supabase_backend/docker-compose.yml logs -f auth

# Nginx loglari
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# PostgreSQL'e direkt baglan
sudo docker exec -it supabase-db psql -U postgres
```

---

## 11. Yedekleme

```bash
# PostgreSQL yedekleme (gunluk cron job)
0 3 * * * docker exec supabase-db pg_dump -U postgres > /opt/backups/kaptanlik-$(date +\%Y\%m\%d).sql

# Restore
sudo docker exec -i supabase-db psql -U postgres < /opt/backups/kaptanlik-20240101.sql
```

---

## 12. Sorun Giderme

### Sorun: 54321 portuna disaridan erisilemiyor
```bash
# Firewall kontrolu
sudo ufw allow 8000/tcp
sudo ufw allow 54323/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Router port yonlendirme kontrolu (54321 -> sunucu:8000)
# curl ile test et:
curl http://SUNUCU_PUBLIC_IP:54321/rest/v1/packages -H "apikey: ANON_KEY"
```

### Sorun: Container'lar baslamiyor
```bash
sudo docker compose down
sudo docker system prune -f
sudo docker compose up -d
```

### Sorun: Migration hatasi
```bash
# Veritabanini sifirla (DIKKAT: tum veriler silinir)
sudo docker compose down -v
sudo docker compose up -d
# Migration'lari tekrar calistir
```

### Sorun: Nginx 404 hatasi
```bash
sudo nginx -t
sudo systemctl restart nginx
# index.html dist/ icinde mi kontrol et
ls /opt/kaptanlikapp/dist/index.html
```

---

## 13. Onemli Guvenlik Notlari

1. **.env dosyalarini asla Git'e pushlama**
2. **JWT_SECRET ve API key'leri guclu degerlerle degistir**
3. **PostgreSQL sifresini guclu yap**
4. **Firewall'da sadece gerekli portlari ac (80, 443, 54321, 54323)**
5. **Supabase Studio'yu sadece VPN/internal IP'den ac (54323)**
6. **Let's Encrypt SSL kullan**
7. **Guvenlik guncellemelerini duzenli yap: docker compose pull && docker compose up -d**

---

## 14. Iletisim & Kaynaklar

| Kaynak | Link |
|--------|------|
| GitHub Repo | https://github.com/AsilOzbay/kaptanlikapp |
| Supabase Docs | https://supabase.com/docs |
| Supabase Self-Host | https://supabase.com/docs/guides/self-hosting/docker |
| Capacitor Docs | https://capacitorjs.com/docs |

---

## 15. Kisa Ozet (Hizli Baslangic)

```bash
# 1. Repo cek
git clone https://github.com/AsilOzbay/kaptanlikapp.git /opt/kaptanlikapp
cd /opt/kaptanlikapp

# 2. Docker + Node.js kur (yoksa)
# ...

# 3. Supabase baslat
cd supabase_backend
cp .env.example .env
# .env'de key'leri uret ve IP'yi ayarla
./setup.sh

# 4. Sorulari import et
cd /opt/kaptanlikapp
node scripts/import_questions.js

# 5. Frontend build et
cp supabase_backend/.env .env  # VITE_* degiskenlerini ayarla
npm install && npm run build

# 6. Nginx ayarla ve baslat
sudo ln -s /opt/kaptanlikapp/nginx.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx

# 7. Erişim:
# Uygulama: http://SUNUCU_IP
# Admin Panel: http://SUNUCU_IP:54323
```

---

## 16. Test Senaryolari

50 detayli test senaryosu `TEST_SENARYOLARI.md` dosyasinda mevcuttur.

API test icin: `supabase_backend/API_SPEC.md`

---

**Hazirlayan:** Agent Swarm (KaptanlikApp Mimarisi)
**Tarih:** 2026-05-14
**Versiyon:** v1.1.0

# KaptanlikApp - Supabase Backend

Kaptanlik ehliyet sinavi hazirlik uygulamasi icin Supabase (PostgreSQL + Auth + Realtime) backend altyapisi.

## Hizli Baslangic

```bash
# 1. Depoyu klonla
cd supabase_backend

# 2. .env dosyasini olustur
cp .env.example .env

# 3. Kurulum scriptini calistir
chmod +x setup.sh
./setup.sh
```

## Servisler

| Servis       | Port  | Aciklama                           |
|-------------|-------|-----------------------------------|
| PostgreSQL  | 5432  | Ana veritabani                     |
| Kong        | 54321 | API Gateway (PostgREST)            |
| GoTrue      | 54322 | Kimlik dogrulama (Auth)            |
| Studio      | 54323 | Supabase Web UI                    |
| Realtime    | 54329 | WebSocket (canli guncellemeler)    |

## Tablolar

| Tablo           | Aciklama                           |
|----------------|-----------------------------------|
| profiles       | Kullanici profilleri               |
| packages       | Sinav paketleri                    |
| questions      | Sorular                            |
| user_progress  | Kullanici cozum ilerlemesi          |
| subscriptions  | Paket abonelikleri                  |
| user_stats     | Kullanici istatistikleri            |
| badges         | Rozet tanimlari                    |
| user_badges    | Kazanilan rozetler                  |
| simulations    | Sinav simulasyonlari                |
| notifications  | Kullanici bildirimleri              |

## CLI Komutlari

```bash
# Stack baslat
docker compose up -d

# Stack durdur
docker compose down

# Loglari goster
docker compose logs -f

# Postgres'e baglan
docker compose exec db psql -U supabase_admin -d postgres

# Migration calistir
docker compose exec db psql -U supabase_admin -d postgres -f /docker-entrypoint-initdb.d/001_initial_schema.sql
```

## Frontend Entegrasyonu

```bash
cp frontend_env.example .env
```

## API Dökümantasyonu

Detayli API dokümantasyonu icin [API_SPEC.md](API_SPEC.md) dosyasina bakin.

## Güvenlik

- RLS (Row Level Security) tüm tablolarda aktif
- Admin erisimi sadece `role = 'admin'` kullanicilara
- JWT token ile kimlik dogrulama
- Service Role Key sadece sunucu tarafinda kullanilmali

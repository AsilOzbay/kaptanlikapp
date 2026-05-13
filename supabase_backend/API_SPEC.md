# KaptanlikApp - API Specification

> **Versiyon:** 1.0.0  
> **Son Güncelleme:** 2024  
> **Base URL:** `http://localhost:54321` (local)  
> **Auth:** Bearer Token (JWT)

---

## İçindekiler

1. [Kimlik Doğrulama (Auth)](#1-kimlik-dogrulama-auth)
2. [Profiller](#2-profiler)
3. [Paketler](#3-paketler)
4. [Sorular](#4-sorular)
5. [Kullanıcı İlerlemesi](#5-kullanici-ilerlemesi)
6. [İstatistikler](#6-istatistikler)
7. [Abonelikler](#7-abonelikler)
8. [Rozetler](#8-rozetler)
9. [Simülasyonlar](#9-simulasyonlar)
10. [Bildirimler](#10-bildirimler)
11. [Yönetici (Admin)](#11-yonetici-admin)
12. [Realtime](#12-realtime)
13. [Hata Kodları](#13-hata-kodlari)
14. [Supabase Client Örnekleri](#14-supabase-client-ornekleri)

---

## 1. Kimlik Doğrulama (Auth)

Supabase Auth (GoTrue) kullanılır. Tüm endpoint'ler `http://localhost:54322/auth/v1/` altındadır.

### 1.1 Kayıt Ol

```http
POST /auth/v1/signup
Content-Type: application/json
apikey: {ANON_KEY}
```

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "data": {
    "display_name": "Ahmet Yilmaz",
    "role": "user"
  }
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "role": "authenticated",
    "user_metadata": {
      "display_name": "Ahmet Yilmaz",
      "role": "user"
    },
    "created_at": "2024-01-15T10:30:00Z"
  },
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "jHvL2mPqR5sT8uW...",
    "expires_at": 1705317000
  }
}
```

### 1.2 Giriş Yap

```http
POST /auth/v1/token?grant_type=password
Content-Type: application/json
apikey: {ANON_KEY}
```

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "jHvL2mPqR5sT8uW...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com"
  }
}
```

### 1.3 Oturum Yenileme

```http
POST /auth/v1/token?grant_type=refresh_token
Content-Type: application/json
apikey: {ANON_KEY}
```

**Request:**
```json
{
  "refresh_token": "jHvL2mPqR5sT8uW..."
}
```

### 1.4 Çıkış Yap

```http
POST /auth/v1/logout
Authorization: Bearer {ACCESS_TOKEN}
apikey: {ANON_KEY}
```

**Response (204 No Content)**

### 1.5 Mevcut Kullanıcı Bilgisi

```http
GET /auth/v1/user
Authorization: Bearer {ACCESS_TOKEN}
apikey: {ANON_KEY}
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "role": "authenticated",
  "user_metadata": {
    "display_name": "Ahmet Yilmaz"
  }
}
```

### 1.6 Şifre Sıfırlama

```http
POST /auth/v1/recover
Content-Type: application/json
apikey: {ANON_KEY}
```

**Request:**
```json
{
  "email": "user@example.com"
}
```

---

## 2. Profiller

Tüm endpoint'ler `POST /rest/v1/profiles` (RPC stili) veya doğrudan tablo erişimi şeklinde çalışır.

### 2.1 Profil Getir (Kendi)

```http
GET /rest/v1/profiles?id=eq.{user_id}
Authorization: Bearer {ACCESS_TOKEN}
apikey: {ANON_KEY}
```

**Response (200 OK):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "display_name": "Ahmet Yilmaz",
    "role": "user",
    "avatar_url": null,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
]
```

### 2.2 Profil Güncelle

```http
PATCH /rest/v1/profiles?id=eq.{user_id}
Authorization: Bearer {ACCESS_TOKEN}
apikey: {ANON_KEY}
Content-Type: application/json
Prefer: return=representation
```

**Request:**
```json
{
  "display_name": "Ahmet Yilmaz 2",
  "avatar_url": "https://cdn.example.com/avatars/user.jpg"
}
```

**Response (200 OK):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "display_name": "Ahmet Yilmaz 2",
    "role": "user",
    "avatar_url": "https://cdn.example.com/avatars/user.jpg",
    "updated_at": "2024-01-16T08:15:00Z"
  }
]
```

### 2.3 Tüm Profilleri Listele (Admin)

```http
GET /rest/v1/profiles
Authorization: Bearer {ADMIN_TOKEN}
apikey: {ANON_KEY}
```

**Query Parametreleri:**

| Parametre | Açıklama | Örnek |
|-----------|----------|-------|
| `role` | Role göre filtrele | `eq.user` |
| `email` | E-posta ile ara | `ilike.%example%` |
| `order` | Sıralama | `created_at.desc` |
| `limit` | Sayfalama limiti | `20` |
| `offset` | Sayfalama offset | `0` |

---

## 3. Paketler

### 3.1 Tüm Paketleri Listele

```http
GET /rest/v1/packages
Authorization: Bearer {ACCESS_TOKEN}
apikey: {ANON_KEY}
```

**Query Parametreleri:**

| Parametre | Açıklama | Örnek |
|-----------|----------|-------|
| `is_active` | Aktif paketler | `eq.true` |
| `slug` | Slug ile filtrele | `eq.stab_2024_02` |
| `order` | Sıralama | `created_at.desc` |
| `select` | Seçili kolonlar | `id,slug,title,total_questions` |

**Response (200 OK):**
```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "slug": "stab_2024_02",
    "title": "Subat 2024 Stabilite",
    "description": "Stabilite kaptanlik sinavi Subat 2024 donemi sorulari.",
    "pdf_url": "https://cdn.kaptanlik.app/pdfs/stab_2024_02.pdf",
    "total_questions": 100,
    "is_active": true,
    "created_at": "2024-01-10T00:00:00Z"
  }
]
```

### 3.2 Paket Detayı Getir

```http
GET /rest/v1/packages?slug=eq.{slug}
Authorization: Bearer {ACCESS_TOKEN}
apikey: {ANON_KEY}
```

### 3.3 Paket Oluştur (Admin)

```http
POST /rest/v1/packages
Authorization: Bearer {ADMIN_TOKEN}
apikey: {ANON_KEY}
Content-Type: application/json
Prefer: return=representation
```

**Request:**
```json
{
  "slug": "stab_2024_03",
  "title": "Mart 2024 Stabilite",
  "description": "Mart 2024 donemi stabilite sorulari",
  "pdf_url": "https://cdn.kaptanlik.app/pdfs/stab_2024_03.pdf",
  "total_questions": 120,
  "is_active": true
}
```

### 3.4 Paket Güncelle (Admin)

```http
PATCH /rest/v1/packages?id=eq.{package_id}
Authorization: Bearer {ADMIN_TOKEN}
apikey: {ANON_KEY}
Content-Type: application/json
```

### 3.5 Paket Sil (Admin)

```http
DELETE /rest/v1/packages?id=eq.{package_id}
Authorization: Bearer {ADMIN_TOKEN}
apikey: {ANON_KEY}
```

---

## 4. Sorular

### 4.1 Paketin Tüm Sorularını Listele

```http
GET /rest/v1/questions
Authorization: Bearer {ACCESS_TOKEN}
apikey: {ANON_KEY}
```

**Query Parametreleri:**

| Parametre | Açıklama | Örnek |
|-----------|----------|-------|
| `package_id` | Paket ID filtresi | `eq.{package_id}` |
| `topic` | Konu filtresi | `eq.Stabilite` |
| `difficulty` | Zorluk filtresi | `eq.medium` |
| `question_number` | Soru numarası | `eq.5` |
| `order` | Sıralama | `question_number.asc` |
| `limit` | Limit | `50` |
| `offset` | Offset | `0` |

**Response (200 OK):**
```json
[
  {
    "id": "q1w2e3r4-t5y6-u7i8-o9p0-a1s2d3f4g5h6",
    "package_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "topic": "Stabilite",
    "question_number": 1,
    "question_text": "Bir geminin stabilite merkezi (M) ile agirlik merkezi (G) arasindaki mesafe ne olarak adlandirilir?",
    "option_a": "GM - Metasentrik yukseklik",
    "option_b": "GZ - Duzeltici kuvvet kolu",
    "option_c": "BM - Metasentrik yaricap",
    "option_d": "KB - Dralya yuksekligi",
    "option_e": "LCB - Boyuna yuzen merkez",
    "correct_answer": "A",
    "explanation": "GM (metasentrik yukseklik), stabilite merkezi M ile agirlik merkezi G arasindaki dikey mesafedir.",
    "formulas": ["GM = KM - KG", "GZ = GM x sin(θ)"],
    "image_url": null,
    "difficulty": "easy",
    "created_at": "2024-01-10T00:00:00Z"
  }
]
```

### 4.2 Soru Detayı Getir

```http
GET /rest/v1/questions?id=eq.{question_id}
Authorization: Bearer {ACCESS_TOKEN}
apikey: {ANON_KEY}
```

### 4.3 Rastgele Sorular Getir

```http
GET /rest/v1/rpc/get_random_questions
Authorization: Bearer {ACCESS_TOKEN}
apikey: {ANON_KEY}
Content-Type: application/json
```

**Request:**
```json
{
  "p_package_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "p_count": 30
}
```

**Örnek Implementasyon:**
```sql
-- Bu fonksiyonu migration olarak ekleyin:
CREATE OR REPLACE FUNCTION public.get_random_questions(p_package_id UUID, p_count INT DEFAULT 30)
RETURNS SETOF public.questions AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public.questions
    WHERE package_id = p_package_id
    ORDER BY random()
    LIMIT p_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 4.4 Cevap Gönder

```http
POST /rest/v1/user_progress
Authorization: Bearer {ACCESS_TOKEN}
apikey: {ANON_KEY}
Content-Type: application/json
Prefer: return=representation
```

**Request:**
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "question_id": "q1w2e3r4-t5y6-u7i8-o9p0-a1s2d3f4g5h6",
  "last_answer": "A",
  "is_favorite": false
}
```

**Response (201 Created):**
```json
[
  {
    "id": "p1o2i3u4-y5t6-r7e8-w9q0-a1s2d3f4g5h6",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "question_id": "q1w2e3r4-t5y6-u7i8-o9p0-a1s2d3f4g5h6",
    "attempts": 1,
    "correct_count": 1,
    "wrong_count": 0,
    "is_favorite": false,
    "is_wrong": false,
    "last_answer": "A",
    "last_attempt_at": "2024-01-15T14:30:00Z",
    "created_at": "2024-01-15T14:30:00Z",
    "updated_at": "2024-01-15T14:30:00Z"
  }
]
```

**Otomatik İşlemler (Trigger):**
- `attempts` sayacı artırılır
- `correct_count` veya `wrong_count` güncellenir
- `is_wrong` bayrağı ayarlanır
- `user_stats` tablosu güncellenir
- Rozet kontrolü yapılır

---

## 5. Kullanıcı İlerlemesi

### 5.1 Kullanıcının Tüm İlerlemesi

```http
GET /rest/v1/user_progress
Authorization: Bearer {ACCESS_TOKEN}
apikey: {ANON_KEY}
```

**Query Parametreleri:**

| Parametre | Açıklama | Örnek |
|-----------|----------|-------|
| `user_id` | RLS gereği otomatik filtrelenecek | `eq.{user_id}` |
| `is_favorite` | Sadece favoriler | `eq.true` |
| `is_wrong` | Sadece yanlışlar | `eq.true` |
| `question_id` | Belirli soru | `eq.{question_id}` |

### 5.2 Favori Sorular

```http
GET /rest/v1/user_progress?is_favorite=eq.true
Authorization: Bearer {ACCESS_TOKEN}
apikey: {ANON_KEY}
```

### 5.3 Yanlış Çözülen Sorular

```http
GET /rest/v1/user_progress?is_wrong=eq.true
Authorization: Bearer {ACCESS_TOKEN}
apikey: {ANON_KEY}
```

### 5.4 Favori Ekle/Çıkar

```http
PATCH /rest/v1/user_progress?id=eq.{progress_id}
Authorization: Bearer {ACCESS_TOKEN}
apikey: {ANON_KEY}
Content-Type: application/json
```

**Request:**
```json
{
  "is_favorite": true
}
```

---

## 6. İstatistikler

### 6.1 Kullanıcı İstatistikleri

```http
GET /rest/v1/user_stats
Authorization: Bearer {ACCESS_TOKEN}
apikey: {ANON_KEY}
```

**Response (200 OK):**
```json
[
  {
    "id": "s1d2f3g4-h5j6-k7l8-ç9p0-o1i2u3y4t5r6",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "package_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "total_solved": 45,
    "total_correct": 38,
    "total_wrong": 7,
    "last_activity": "2024-01-15T16:45:00Z",
    "created_at": "2024-01-10T00:00:00Z",
    "updated_at": "2024-01-15T16:45:00Z"
  }
]
```

### 6.2 Paket Bazlı İstatistik

```http
GET /rest/v1/user_stats?package_id=eq.{package_id}
Authorization: Bearer {ACCESS_TOKEN}
apikey: {ANON_KEY}
```

### 6.3 Detaylı İstatistikler (RPC)

```http
GET /rest/v1/rpc/get_user_detailed_stats
Authorization: Bearer {ACCESS_TOKEN}
apikey: {ANON_KEY}
Content-Type: application/json
```

**Request:**
```json
{
  "p_user_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Örnek SQL:**
```sql
CREATE OR REPLACE FUNCTION public.get_user_detailed_stats(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_solved', COALESCE(SUM(total_solved), 0),
        'total_correct', COALESCE(SUM(total_correct), 0),
        'total_wrong', COALESCE(SUM(total_wrong), 0),
        'success_rate', CASE
            WHEN COALESCE(SUM(total_solved), 0) > 0
            THEN ROUND(COALESCE(SUM(total_correct), 0)::NUMERIC / SUM(total_solved) * 100, 2)
            ELSE 0
        END,
        'package_stats', jsonb_agg(jsonb_build_object(
            'package_id', package_id,
            'total_solved', total_solved,
            'total_correct', total_correct,
            'total_wrong', total_wrong
        )),
        'total_simulations', (SELECT COUNT(*) FROM public.simulations WHERE user_id = p_user_id),
        'passed_simulations', (SELECT COUNT(*) FROM public.simulations WHERE user_id = p_user_id AND passed = true),
        'total_badges', (SELECT COUNT(*) FROM public.user_badges WHERE user_id = p_user_id),
        'favorite_count', (SELECT COUNT(*) FROM public.user_progress WHERE user_id = p_user_id AND is_favorite = true)
    )
    INTO result
    FROM public.user_stats
    WHERE user_id = p_user_id;

    RETURN COALESCE(result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 7. Abonelikler

### 7.1 Kullanıcının Abonelikleri

```http
GET /rest/v1/subscriptions
Authorization: Bearer {ACCESS_TOKEN}
apikey: {ANON_KEY}
```

**Response (200 OK):**
```json
[
  {
    "id": "sub-1234-5678-...",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "package_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "status": "active",
    "started_at": "2024-01-10T00:00:00Z",
    "expires_at": "2024-12-31T23:59:59Z",
    "created_at": "2024-01-10T00:00:00Z"
  }
]
```

### 7.2 Abonelik Oluştur (Admin)

```http
POST /rest/v1/subscriptions
Authorization: Bearer {ADMIN_TOKEN}
apikey: {ANON_KEY}
Content-Type: application/json
Prefer: return=representation
```

**Request:**
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "package_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "active",
  "started_at": "2024-01-15T00:00:00Z",
  "expires_at": "2025-01-15T00:00:00Z"
}
```

### 7.3 Abonelik İptal

```http
PATCH /rest/v1/subscriptions?id=eq.{subscription_id}
Authorization: Bearer {ACCESS_TOKEN}
apikey: {ANON_KEY}
Content-Type: application/json
```

**Request:**
```json
{
  "status": "cancelled"
}
```

---

## 8. Rozetler

### 8.1 Tüm Rozet Tanımları

```http
GET /rest/v1/badges
Authorization: Bearer {ACCESS_TOKEN}
apikey: {ANON_KEY}
```

**Response (200 OK):**
```json
[
  {
    "id": "b1n2m3...",
    "name": "Acemi Kaptan",
    "description": "İlk 10 sorunu dogru cevapladin.",
    "icon": "anchor",
    "condition_type": "total_solved",
    "condition_value": 10,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### 8.2 Kullanıcının Rozetleri

```http
GET /rest/v1/user_badges
Authorization: Bearer {ACCESS_TOKEN}
apikey: {ANON_KEY}
```

**Genişletilmiş sorgu (Rozet detayları ile):**
```http
GET /rest/v1/user_badges?select=*,badges(name,description,icon)&order=earned_at.desc
Authorization: Bearer {ACCESS_TOKEN}
apikey: {ANON_KEY}
```

**Response (200 OK):**
```json
[
  {
    "id": "ub1...",
    "user_id": "550e8400...",
    "badge_id": "b1n2m3...",
    "earned_at": "2024-01-15T18:00:00Z",
    "badges": {
      "name": "Acemi Kaptan",
      "description": "İlk 10 sorunu dogru cevapladin.",
      "icon": "anchor"
    }
  }
]
```

### 8.3 Rozet Kontrolü (Manuel)

```http
GET /rest/v1/rpc/check_and_award_badges
Authorization: Bearer {ACCESS_TOKEN}
apikey: {ANON_KEY}
Content-Type: application/json
```

**Request:**
```json
{
  "p_user_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## 9. Simülasyonlar

### 9.1 Simülasyon Oluştur

```http
POST /rest/v1/simulations
Authorization: Bearer {ACCESS_TOKEN}
apikey: {ANON_KEY}
Content-Type: application/json
Prefer: return=representation
```

**Request:**
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "package_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "question_count": 30,
  "duration_minutes": 90,
  "correct_count": 25,
  "wrong_count": 5,
  "empty_count": 0,
  "percentage": 83.33,
  "passed": true,
  "answers": {
    "q1-id": "A",
    "q2-id": "B",
    "q3-id": "C"
  }
}
```

**Response (201 Created):**
```json
[
  {
    "id": "sim-1234-5678-...",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "package_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "question_count": 30,
    "duration_minutes": 90,
    "correct_count": 25,
    "wrong_count": 5,
    "empty_count": 0,
    "percentage": 83.33,
    "passed": true,
    "answers": {"q1-id": "A", "q2-id": "B"},
    "created_at": "2024-01-15T14:00:00Z"
  }
]
```

### 9.2 Kullanıcının Simülasyonları

```http
GET /rest/v1/simulations?order=created_at.desc
Authorization: Bearer {ACCESS_TOKEN}
apikey: {ANON_KEY}
```

### 9.3 Simülasyon Detayı

```http
GET /rest/v1/simulations?id=eq.{simulation_id}
Authorization: Bearer {ACCESS_TOKEN}
apikey: {ANON_KEY}
```

---

## 10. Bildirimler

### 10.1 Kullanıcının Bildirimleri

```http
GET /rest/v1/notifications?order=created_at.desc
Authorization: Bearer {ACCESS_TOKEN}
apikey: {ANON_KEY}
```

**Okunmamış bildirimler:**
```http
GET /rest/v1/notifications?is_read=eq.false&order=created_at.desc
Authorization: Bearer {ACCESS_TOKEN}
apikey: {ANON_KEY}
```

**Response (200 OK):**
```json
[
  {
    "id": "not-1234-5678-...",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Yeni Rozet Kazandin!",
    "body": "Acemi Kaptan rozeti kazandin: İlk 10 sorunu dogru cevapladin.",
    "type": "badge_earned",
    "is_read": false,
    "data": {
      "badge_id": "b1n2m3...",
      "badge_name": "Acemi Kaptan"
    },
    "created_at": "2024-01-15T18:00:00Z"
  }
]
```

### 10.2 Bildirimi Okundu İşaretle

```http
PATCH /rest/v1/notifications?id=eq.{notification_id}
Authorization: Bearer {ACCESS_TOKEN}
apikey: {ANON_KEY}
Content-Type: application/json
```

**Request:**
```json
{
  "is_read": true
}
```

### 10.3 Tümünü Okundu İşaretle (RPC)

```http
GET /rest/v1/rpc/mark_all_notifications_read
Authorization: Bearer {ACCESS_TOKEN}
apikey: {ANON_KEY}
Content-Type: application/json
```

**Örnek SQL:**
```sql
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS VOID AS $$
BEGIN
    UPDATE public.notifications
    SET is_read = true
    WHERE user_id = auth.uid()
      AND is_read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 10.4 Bildirim Sil

```http
DELETE /rest/v1/notifications?id=eq.{notification_id}
Authorization: Bearer {ACCESS_TOKEN}
apikey: {ANON_KEY}
```

---

## 11. Yönetici (Admin)

### 11.1 Tüm Kullanıcıları Listele

```http
GET /rest/v1/profiles?select=*&order=created_at.desc
Authorization: Bearer {ADMIN_TOKEN}
apikey: {ANON_KEY}
```

### 11.2 Kullanıcı Rolünü Güncelle

```http
PATCH /rest/v1/profiles?id=eq.{user_id}
Authorization: Bearer {ADMIN_TOKEN}
apikey: {ANON_KEY}
Content-Type: application/json
```

**Request:**
```json
{
  "role": "admin"
}
```

### 11.3 Soru Ekle (Admin)

```http
POST /rest/v1/questions
Authorization: Bearer {ADMIN_TOKEN}
apikey: {ANON_KEY}
Content-Type: application/json
Prefer: return=representation
```

**Request:**
```json
{
  "package_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "topic": "Stabilite",
  "question_number": 6,
  "question_text": "Yeni soru metni...",
  "option_a": "Secenek A",
  "option_b": "Secenek B",
  "option_c": "Secenek C",
  "option_d": "Secenek D",
  "option_e": "Secenek E",
  "correct_answer": "A",
  "explanation": "Aciklama metni...",
  "formulas": ["Formul 1", "Formul 2"],
  "difficulty": "medium"
}
```

### 11.4 Soru Güncelle (Admin)

```http
PATCH /rest/v1/questions?id=eq.{question_id}
Authorization: Bearer {ADMIN_TOKEN}
apikey: {ANON_KEY}
Content-Type: application/json
```

### 11.5 Soru Sil (Admin)

```http
DELETE /rest/v1/questions?id=eq.{question_id}
Authorization: Bearer {ADMIN_TOKEN}
apikey: {ANON_KEY}
```

### 11.6 Toplu Soru İmport (Admin - RPC)

```http
POST /rest/v1/rpc/bulk_import_questions
Authorization: Bearer {ADMIN_TOKEN}
apikey: {ANON_KEY}
Content-Type: application/json
```

**Request:**
```json
{
  "p_package_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "p_questions": [
    {
      "topic": "Stabilite",
      "question_number": 7,
      "question_text": "...",
      "option_a": "...",
      "option_b": "...",
      "option_c": "...",
      "option_d": "...",
      "option_e": "...",
      "correct_answer": "B",
      "explanation": "...",
      "difficulty": "easy"
    }
  ]
}
```

**Örnek SQL:**
```sql
CREATE OR REPLACE FUNCTION public.bulk_import_questions(
    p_package_id UUID,
    p_questions JSONB
)
RETURNS INT AS $$
DECLARE
    q JSONB;
    inserted_count INT := 0;
BEGIN
    FOR q IN SELECT * FROM jsonb_array_elements(p_questions)
    LOOP
        INSERT INTO public.questions (
            package_id, topic, question_number, question_text,
            option_a, option_b, option_c, option_d, option_e,
            correct_answer, explanation, formulas, difficulty
        ) VALUES (
            p_package_id,
            q->>'topic',
            (q->>'question_number')::INT,
            q->>'question_text',
            q->>'option_a',
            q->>'option_b',
            q->>'option_c',
            q->>'option_d',
            q->>'option_e',
            q->>'correct_answer',
            q->>'explanation',
            ARRAY(SELECT jsonb_array_elements_text(q->'formulas')),
            q->>'difficulty'
        )
        ON CONFLICT (package_id, question_number) DO NOTHING;

        IF FOUND THEN
            inserted_count := inserted_count + 1;
        END IF;
    END LOOP;

    -- Paket soru sayısını güncelle
    UPDATE public.packages
    SET total_questions = (SELECT COUNT(*) FROM public.questions WHERE package_id = p_package_id)
    WHERE id = p_package_id;

    RETURN inserted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 11.7 Dashboard İstatistikleri (Admin)

```http
GET /rest/v1/rpc/get_admin_dashboard_stats
Authorization: Bearer {ADMIN_TOKEN}
apikey: {ANON_KEY}
Content-Type: application/json
```

**Örnek SQL:**
```sql
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_users', (SELECT COUNT(*) FROM public.profiles),
        'active_users_today', (SELECT COUNT(DISTINCT user_id) FROM public.user_stats WHERE last_activity > NOW() - INTERVAL '24 hours'),
        'total_questions', (SELECT COUNT(*) FROM public.questions),
        'total_simulations', (SELECT COUNT(*) FROM public.simulations),
        'total_subscriptions', (SELECT COUNT(*) FROM public.subscriptions WHERE status = 'active'),
        'simulations_today', (SELECT COUNT(*) FROM public.simulations WHERE created_at > NOW() - INTERVAL '24 hours'),
        'avg_success_rate', (SELECT ROUND(AVG(percentage)::NUMERIC, 2) FROM public.simulations),
        'top_packages', (
            SELECT jsonb_agg(p)
            FROM (
                SELECT p.title, COUNT(s.id) as simulation_count
                FROM public.packages p
                LEFT JOIN public.simulations s ON p.id = s.package_id
                GROUP BY p.id, p.title
                ORDER BY simulation_count DESC
                LIMIT 5
            ) p
        )
    )
    INTO result;

    RETURN COALESCE(result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 12. Realtime

WebSocket üzerinden canlı güncellemeler.

### 12.1 Bağlantı

```javascript
// Supabase JavaScript Client
const supabase = createClient(SUPABASE_URL, ANON_KEY);

// Realtime abonelik
const subscription = supabase
  .channel('notifications')
  .on('postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      console.log('Yeni bildirim:', payload.new);
    }
  )
  .subscribe();
```

### 12.2 İlerleme Güncellemeleri

```javascript
supabase
  .channel('user_progress')
  .on('postgres_changes',
    {
      event: '*', // INSERT, UPDATE, DELETE
      schema: 'public',
      table: 'user_progress',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      console.log('İlerleme güncellendi:', payload.new);
    }
  )
  .subscribe();
```

### 12.3 Yeni Soru Bildirimi

```javascript
supabase
  .channel('new_questions')
  .on('postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'questions',
      filter: `package_id=eq.${packageId}`
    },
    (payload) => {
      console.log('Yeni soru eklendi:', payload.new);
    }
  )
  .subscribe();
```

---

## 13. Hata Kodları

### HTTP Durum Kodları

| Kod | Açıklama | Senaryo |
|-----|----------|---------|
| `200` | OK | Başarılı GET/PATCH |
| `201` | Created | Başarılı POST |
| `204` | No Content | Başarılı DELETE |
| `400` | Bad Request | Geçersiz parametreler |
| `401` | Unauthorized | Geçersiz veya eksik token |
| `403` | Forbidden | Yetkisiz erişim (RLS) |
| `404` | Not Found | Kaynak bulunamadı |
| `409` | Conflict | Çakışma (unique constraint) |
| `422` | Unprocessable | Doğrulama hatası |
| `500` | Server Error | Sunucu hatası |

### Supabase Özel Hataları

```json
{
  "message": "new row violates row-level security policy",
  "code": "42501",
  "details": null,
  "hint": null
}
```

---

## 14. Supabase Client Örnekleri

### 14.1 React / TypeScript

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Auth
const { data: { user } } = await supabase.auth.getUser();
const { data: { session } } = await supabase.auth.getSession();

// Soru listeleme
const { data: questions, error } = await supabase
  .from('questions')
  .select('*')
  .eq('package_id', packageId)
  .order('question_number', { ascending: true });

// Cevap gönderme
const { data: progress, error } = await supabase
  .from('user_progress')
  .upsert({
    user_id: user!.id,
    question_id: questionId,
    last_answer: answer,
    is_favorite: false
  }, {
    onConflict: 'user_id,question_id'
  })
  .select()
  .single();

// Favori sorular
const { data: favorites } = await supabase
  .from('user_progress')
  .select('*, questions(*)')
  .eq('user_id', user!.id)
  .eq('is_favorite', true);

// İstatistikler
const { data: stats } = await supabase
  .from('user_stats')
  .select('*')
  .eq('user_id', user!.id);

// Rozetler
const { data: badges } = await supabase
  .from('user_badges')
  .select('*, badges(*)')
  .eq('user_id', user!.id);

// Bildirimler
const { data: notifications } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', user!.id)
  .eq('is_read', false)
  .order('created_at', { ascending: false });

// Simülasyon oluşturma
const { data: simulation } = await supabase
  .from('simulations')
  .insert({
    user_id: user!.id,
    package_id: packageId,
    question_count: 30,
    duration_minutes: 90,
    correct_count: 25,
    wrong_count: 5,
    empty_count: 0,
    percentage: 83.33,
    passed: true,
    answers: answerMap
  })
  .select()
  .single();
```

### 14.2 curl Örnekleri

```bash
# Giriş yap
TOKEN=$(curl -s -X POST http://localhost:54322/auth/v1/token?grant_type=password \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}' \
  | jq -r '.access_token')

# Soru listele
curl -s http://localhost:54321/rest/v1/questions \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Cevap gönder
curl -s -X POST http://localhost:54321/rest/v1/user_progress \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"...","question_id":"...","last_answer":"A"}' | jq '.'

# İstatistik al
curl -s http://localhost:54321/rest/v1/user_stats \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

### 14.3 Python Client

```python
from supabase import create_client
import os

supabase = create_client(
    os.environ.get("SUPABASE_URL"),
    os.environ.get("SUPABASE_ANON_KEY")
)

# Auth
auth_response = supabase.auth.sign_in_with_password({
    "email": "user@example.com",
    "password": "pass123"
})
user = auth_response.user

# Soruları listele
questions = supabase.table("questions") \
    .select("*") \
    .eq("package_id", package_id) \
    .order("question_number") \
    .execute()

# Cevap gönder
progress = supabase.table("user_progress") \
    .upsert({
        "user_id": user.id,
        "question_id": question_id,
        "last_answer": "A",
        "is_favorite": False
    }) \
    .execute()

# RPC çağrı
stats = supabase.rpc("get_user_detailed_stats", {
    "p_user_id": user.id
}).execute()

print(stats.data)
```

---

## Postman / API Test Collection

### Environment Variables

```json
{
  "name": "KaptanlikApp Local",
  "values": [
    {"key": "base_url", "value": "http://localhost:54321", "enabled": true},
    {"key": "auth_url", "value": "http://localhost:54322", "enabled": true},
    {"key": "anon_key", "value": "eyJhbGciOiJIUzI1NiIs...", "enabled": true},
    {"key": "access_token", "value": "", "enabled": true},
    {"key": "user_id", "value": "", "enabled": true}
  ]
}
```

### Örnek Collection Adımları

1. **Auth → Login** → `access_token` değişkenine kaydet
2. **Questions → List** → Bearer token ile soruları çek
3. **Progress → Submit Answer** → Cevap gönder
4. **Stats → Get** → İstatistikleri al
5. **Simulations → Create** → Simülasyon kaydet

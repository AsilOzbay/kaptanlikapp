-- ============================================================
-- KaptanlikApp - Seed Data
-- ============================================================
--
-- 1. Paket: Şubat 2024 Stabilite
-- 2. 12 rozet tanımı
-- 3. Admin kullanıcısı (manuel SQL ile)
-- ============================================================

-- ============================================================
-- 1. PAKET: Şubat 2024 Stabilite
-- ============================================================

INSERT INTO public.packages (id, slug, title, description, pdf_url, total_questions, is_active, created_at)
VALUES (
    uuid_generate_v4(),
    'stab_2024_02',
    'Subat 2024 Stabilite',
    'Stabilite kaptanlik sinavi Subat 2024 donemi sorulari. Gemi insasi, gemi stabilitesi, yukleme ve bosaltma, gemi hesaplari konularini kapsar.',
    'https://cdn.kaptanlik.app/pdfs/stab_2024_02.pdf',
    100,
    true,
    NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- Paket ID'sini al (sonraki sorular için)
-- Sorular seed olarak eklenmez; admin panelinden import edilir


-- ============================================================
-- 2. ROZET TANIMLARI (12 adet)
-- ============================================================

INSERT INTO public.badges (id, name, description, icon, condition_type, condition_value, created_at)
VALUES
    -- İlk adım rozetleri
    (
        uuid_generate_v4(),
        'İlk Adım',
        'KaptanlikApp''e katildin. İlk sorunu cozerek yolculuga basladin!',
        'footprints',
        'first_login',
        1,
        NOW()
    ),

    -- Çözüm sayısı rozetleri
    (
        uuid_generate_v4(),
        'Acemi Kaptan',
        'İlk 10 sorunu dogru cevapladin.',
        'anchor',
        'total_solved',
        10,
        NOW()
    ),
    (
        uuid_generate_v4(),
        'Deneyimli Kaptan',
        '100 soruyu basariyla cozdun.',
        'ship',
        'total_solved',
        100,
        NOW()
    ),
    (
        uuid_generate_v4(),
        'Uzman Kaptan',
        '500 soruyu basariyla cozdun.',
        'crown',
        'total_solved',
        500,
        NOW()
    ),
    (
        uuid_generate_v4(),
        'Efsane Kaptan',
        '1000 soruyu basariyla cozdun. Efsaneler seni konussun!',
        'star',
        'total_solved',
        1000,
        NOW()
    ),

    -- Seri (streak) rozetleri
    (
        uuid_generate_v4(),
        'İsabetli Atis',
        'Arka arkaya 10 soruyu dogru cevapladin.',
        'target',
        'correct_streak',
        10,
        NOW()
    ),
    (
        uuid_generate_v4(),
        'Keskin Nişancı',
        'Arka arkaya 25 soruyu dogru cevapladin.',
        'crosshair',
        'correct_streak',
        25,
        NOW()
    ),

    -- Simülasyon rozetleri
    (
        uuid_generate_v4(),
        'Sinav Adayi',
        'İlk simulasyon sinavini tamamladin.',
        'file-check',
        'simulation_pass',
        1,
        NOW()
    ),
    (
        uuid_generate_v4(),
        'Sinav Krali',
        '5 simulasyon sinavini basariyla gectin.',
        'trophy',
        'simulation_pass',
        5,
        NOW()
    ),
    (
        uuid_generate_v4(),
        'Mükemmel Puan',
        'Bir simulasyon sinavinda %100 basari elde ettin.',
        'award',
        'perfect_simulation',
        1,
        NOW()
    ),

    -- Özel rozetler
    (
        uuid_generate_v4(),
        'Gece Kurdu',
        'Gece yarisi (22:00-06:00) çalisarak 10 soru cozdun.',
        'moon',
        'night_owl',
        10,
        NOW()
    ),
    (
        uuid_generate_v4(),
        'Erken Kalkan',
        'Sabahi erken kalkip 06:00-09:00 arasinda calistin.',
        'sunrise',
        'early_bird',
        1,
        NOW()
    )

ON CONFLICT DO NOTHING;


-- ============================================================
-- 3. ADMIN KULLANICISI
-- ============================================================
--
-- NOT: Bu seed data auth.users tablosuna doğrudan müdahale etmez.
-- Admin kullanıcıyı oluşturmak için:
--
-- 1. Uygulamadan admin@kaptanlik.app ile kaydolun
-- 2. Aşağıdaki SQL'i çalıştırarak rolü admin yapın:
--
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@kaptanlik.app';
--
-- VEYA auth.users üzerinden:
--
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role)
-- VALUES (
--     '00000000-0000-0000-0000-000000000001',
--     'admin@kaptanlik.app',
--     crypt('admin123', gen_salt('bf')),
--     NOW(),
--     '{"provider":"email","providers":["email"]}',
--     '{"display_name":"Kaptanlik Admin","role":"admin"}',
--     NOW(),
--     NOW(),
--     'authenticated'
-- )
-- ON CONFLICT (email) DO NOTHING;
--
-- NOT: auth.users tablosuna doğrudan ekleme, Supabase Auth servisinin
-- tutarlılığını bozabilir. Tercihen uygulama üzerinden kayıt yapıp
-- ardından profiles tablosundan role güncellemesi yapın.
--
-- Alternatif: Supabase Studio (http://localhost:54323) üzerinden
-- Authentication > Users > Add User ile ekleyebilirsiniz.
-- ============================================================

-- ============================================================
-- ÖRNEK SORULAR (isteğe bağlı - test için)
-- ============================================================
--
-- Aşağıdaki örnek sorular test amaçlıdır.
-- Gerçek sorular admin panelinden veya CSV/XML import ile eklenir.
--

-- Önce paket ID'sini al
DO $$
DECLARE
    pkg_id UUID;
BEGIN
    SELECT id INTO pkg_id FROM public.packages WHERE slug = 'stab_2024_02' LIMIT 1;

    IF pkg_id IS NOT NULL THEN
        -- Örnek sorular (test amaçlı)
        INSERT INTO public.questions (
            package_id, topic, question_number, question_text,
            option_a, option_b, option_c, option_d, option_e,
            correct_answer, explanation, formulas, difficulty, created_at
        )
        VALUES
            (
                pkg_id, 'Gemi İnsasi', 1,
                'Bir geminin boyuna dayanma mukavemeti hangi faktörlere baglidir?',
                'Sadece malzeme kalitesine',
                'Gemi boyu, eni ve malzeme kalitesine',
                'Sadece gemi boyuna',
                'Sadece yük miktarina',
                'Hava kosullarina',
                'B',
                'Boyuna dayanma mukavemeti geminin boyu, eni, derinliği ve kullanilan malzemenin kalitesi gibi birçok faktöre baglidir. Bu faktörler birlikte geminin gövdesinin uzunlamasina kuvvetlere karsi direncini belirler.',
                ARRAY['σ = F/A', 'M = σ × I/c'],
                'easy',
                NOW()
            ),
            (
                pkg_id, 'Stabilite', 2,
                'Bir geminin stabilite merkezi (M) ile agirlik merkezi (G) arasindaki mesafe ne olarak adlandirilir?',
                'GM - Metasentrik yükseklik',
                'GZ - Düzeltici kuvvet kolu',
                'BM - Metasentrik yaricap',
                'KB - Dralya yüksekliği',
                'LCB - Boyuna yüzen merkez',
                'A',
                'GM (metasentrik yükseklik), stabilite merkezi M ile agirlik merkezi G arasindaki dikey mesafedir. Pozitif GM degeri geminin stabil oldugunu gösterir. GM = KM - KG formülü ile hesaplanir.',
                ARRAY['GM = KM - KG', 'GZ = GM × sin(θ)'],
                'easy',
                NOW()
            ),
            (
                pkg_id, 'Yükleme ve Bosaltma', 3,
                'Bir geminin kargo kapasitesi Deadweight ton (DWT) ile ifade edilir. Aşağidakilerden hangisi DWT''ye dahil degildir?',
                'Yakit tonaji',
                'Yağ ve su tonaji',
                'Yük tonaji',
                'Personel ve esya tonaji',
                'Geminin bos agirliği (Lightship)',
                'E',
                'DWT (Deadweight Tonnage), geminin taşıyabileceği toplam yükü ifade eder ve yakıt, yağ, su, kargo, personel ve yiyecek gibi her şeyi içerir. Geminin kendi boş ağırlığı (Lightship) DWT''ye dahil değildir.',
                ARRAY['DWT = Displacement - Lightship'],
                'medium',
                NOW()
            ),
            (
                pkg_id, 'Gemi Hesaplari', 4,
                'Bir geminin ortalama su çekimi (T) ile küp hacmi arasindaki ilişkiyi veren formül hangisidir?',
                'V = L × B × T',
                'V = L × B × T × Cb',
                'Displacement = V × ρ',
                'T = Displacement / (L × B)',
                'V = L × B / T',
                'B',
                'Gemin toplam hacmi (V), geminin boyu (L), eni (B), ortalama su çekimi (T) ve blok katsayısı (Cb) ile hesaplanır: V = L × B × T × Cb. Bu formül geminin su altında kalan hacmini verir.',
                ARRAY['V = L × B × T × Cb', 'Displacement = V × ρ'],
                'medium',
                NOW()
            ),
            (
                pkg_id, 'Stabilite', 5,
                'Gövde açısı (Angle of Loll) ne zaman oluşur?',
                'Pozitif GM olduğunda',
                'Sıfır GM olduğunda',
                'Negatif GM olduğunda',
                'Geminin trimi sıfır olduğunda',
                'Geminin drafti maksimum olduğunda',
                'C',
                'Gövde açısı (Angle of Loll), negatif GM durumunda oluşur. Bu durumda gemi dengesizdir ve her iki tarafa da yatabilir. Gövde açısında gemi GZ=0 konumunda kalır ve bu durum geçicidir; yük değişimi ile düzeltilebilir.',
                ARRAY['GZ = GM × sin(θ)', 'Angle of Loll: GM < 0'],
                'hard',
                NOW()
            )
        ON CONFLICT (package_id, question_number) DO NOTHING;

        -- Paket soru sayısını güncelle
        UPDATE public.packages
        SET total_questions = (SELECT COUNT(*) FROM public.questions WHERE package_id = pkg_id)
        WHERE id = pkg_id;

    END IF;
END $$;

# KaptanlikApp - 50 Test Senaryosu

## I. AUTH & Kullanici Yonetimi (1-10)

### TS-01: Kayit Ol - Basarili Kayit
**Adimlar:**
1. Ana sayfaya git (/)
2. "Kayit Ol" butonuna tikla
3. Ad Soyad: "Mehmet Yilmaz"
4. Email: "mehmet@test.com"
5. Sifre: "Test123!"
6. Sifre Tekrar: "Test123!"
7. "Kayit Ol" butonuna tikla

**Beklenen:** Kayit basarili, otomatik giris yapildi, /packages sayfasina yonlendirildi, toast mesaji: "Hos geldin Mehmet!"

### TS-02: Kayit Ol - Email Zaten Var
**Adimlar:**
1. "Kayit Ol" formunu ac
2. Var olan email gir: "mehmet@test.com"
3. Diger alanlari doldur
4. "Kayit Ol" butonuna tikla

**Beklenen:** Hata mesaji: "Bu email adresi zaten kayitli", form temizlenmedi, email alani kirmizi border

### TS-03: Kayit Ol - Sifre Eslesmiyor
**Adimlar:**
1. "Kayit Ol" formunu ac
2. Sifre: "Test123!"
3. Sifre Tekrar: "Test456!"
4. "Kayit Ol" butonuna tikla

**Beklenen:** Hata mesaji: "Sifreler eslesmiyor", Sifre Tekrar alani kirmizi border, shake animasyonu

### TS-04: Giris Yap - Basarili Giris
**Adimlar:**
1. /login sayfasina git
2. Email: "mehmet@test.com"
3. Sifre: "Test123!"
4. "Giris Yap" butonuna tikla

**Beklenen:** Basarili giris, /packages sayfasina yonlendirme, Navbar'da kullanici adi gosteriliyor

### TS-05: Giris Yap - Yanlis Sifre
**Adimlar:**
1. /login sayfasina git
2. Email: "mehmet@test.com"
3. Sifre: "YanlisSifre"
4. "Giris Yap" butonuna tikla

**Beklenen:** Hata mesaji: "Email veya sifre hatali", form temizlenmedi, shake animasyonu

### TS-06: Giris Yap - Email Format Hatasi
**Adimlar:**
1. /login sayfasina git
2. Email: "gecersiz-email"
3. Sifre: "Test123!"
4. "Giris Yap" butonuna tikla

**Beklenen:** Email alani altinda: "Gecerli bir email adresi giriniz", buton disabled

### TS-07: Sifre Sifirlama - Basarili
**Adimlar:**
1. /forgot-password sayfasina git
2. Email: "mehmet@test.com"
3. "Sifre Sifirlama Linki Gonder" butonuna tikla

**Beklenen:** Basari mesaji: "Sifre sifirlama linki emailinize gonderildi", yesil checkmark ikonu

### TS-08: Cikis Yap
**Adimlar:**
1. Giris yap (mehmet@test.com)
2. /profile sayfasina git
3. "Cikis Yap" butonuna tikla
4. Onay modalinda "Evet" tikla

**Beklenen:** Cikis yapildi, / sayfasina yonlendirme, Navbar'da "Giris Yap / Kayit Ol" butonlari gosteriliyor

### TS-09: Admin Girisi
**Adimlar:**
1. /admin/login sayfasina git
2. Email: "admin@kaptanlik.app"
3. Sifre: "admin123"
4. Giris yap

**Beklenen:** Admin dashboard (/admin) acildi, side navigation gosteriliyor, admin istatistikleri yuklendi

### TS-10: Admin Yetkisiz Erisim
**Adimlar:**
1. Normal kullanici ile giris yap (mehmet@test.com)
2. /admin URL'sini dogrudan gir

**Beklenen:** Anasayfaya (/packages) yonlendirme, hata toast: "Bu sayfaya erisim yetkiniz yok"

---

## II. Soru Cozme Modu (11-25)

### TS-11: Soru Acma - Ucretsiz Kullanici
**Adimlar:**
1. Kayit olmadan /packages sayfasina git
2. "Subat 2024 Stabilite" paketine tikla
3. "Konu Konu Calis" butonuna tikla

**Beklenen:** Ilk 10 soru acik, 11. soru kilitli, "Abone Ol" butonu 11. soruda gorunuyor

### TS-12: Soru Cozme - Dogru Cevap
**Adimlar:**
1. Paket ac (abone kullanici)
2. 1. soruyu ac
3. "C" sikkini sec
4. "Kontrol Et" butonuna tikla

**Beklenen:** C sikki yesil oldu, dogru cevap animasyonu (bounce), "Sonraki" butonu aktif

### TS-13: Soru Cozme - Yanlis Cevap (1. Deneme)
**Adimlar:**
1. 1. soruyu ac
2. "A" sikkini sec (yanlis)
3. "Kontrol Et" butonuna tikla

**Beklenen:** A sikki kirmizi oldu, shake animasyonu, "Tekrar Dene" butonu aktif, dogru cevap gosterilmedi

### TS-14: Soru Cozme - Yanlis Cevap (2. Deneme Sonrasi)
**Adimlar:**
1. Yanlis cevap ver (1. deneme)
2. "Tekrar Dene" butonuna tikla
3. Baska bir sik sec (yine yanlis)
4. "Kontrol Et" butonuna tikla

**Beklenen:** Dogru cevap aciklandi (yesil), aciklama paneli acildi, "Sonraki" butonu aktif

### TS-15: Sik Degistirme - Kontrol Oncesi
**Adimlar:**
1. Soru ac
2. "B" sikkini sec
3. "D" sikkini sec (degistir)
4. "Kontrol Et" butonuna tikla

**Beklenen:** D sikki kontrol edildi, B sikki deselected oldu

### TS-16: Formul Popup
**Adimlar:**
1. Formul iceren soru ac
2. "Formulleri Gor" butonuna tikla

**Beklenen:** Alttan formulu panel acildi, ilgili formuller ve aciklamalari gosterildi

### TS-17: Favori Ekleme
**Adimlar:**
1. Soru cozerken kalp ikonuna tikla
2. Favori sorular sayfasina git (/packages/:id/fav)

**Beklenen:** Eklenen soru favori listesinde gorunuyor, kalp ikonu dolu/gold

### TS-18: Yanlis Sorulari Tekrar Cozme
**Adimlar:**
1. 3 soruyu yanlis coz
2. /packages/:id/wrong sayfasina git
3. Yanlis sorulari gor

**Beklenen:** Sadece yanlis cozulen 3 soru listelendi, her soru yanlis cozulme sayisi ile birlikte

### TS-19: Karisik Mod
**Adimlar:**
1. /packages/:id/mixed sayfasina git
2. 20 sorunun karisik sirada geldigini kontrol et

**Beklenen:** 20 soru karisik sirada, soru numaralari rastgele, her yenilemede farkli siralama

### TS-20: Soru Navigasyonu
**Adimlar:**
1. Soru 5'tesin
2. Alt navigasyondan soru 12'ye tikla
3. Soru 12 acildi
4. Sol ok ile soru 11'e git

**Beklenen:** Soru 12 acildi, geri gidince soru 11, navigasyonda aktif soru gold cerceve

### TS-21: Klavye Kisayollari
**Adimlar:**
1. Soru ac
2. Klavyeden "3" tusuna bas
3. Enter tusuna bas

**Beklenen:** C sikki secildi, kontrol edildi, sonuc gosterildi

### TS-22: 10 Soru Limiti - Ucretsiz
**Adimlar:**
1. Kayit olmadan soru coz
2. 10 soruyu basarili coz
3. 11. soruya gecmeye calis

**Beklenen:** Kilitli ekran, "Abone Ol" CTA butonu, "10 ucretsiz soruyu tamamladiniz" mesaji

### TS-23: Son Soru - Paket Tamamlama
**Adimlar:**
1. Abone kullanici olarak 50. (son) soruyu coz
2. Dogru cevap ver

**Beklenen:** "Tebrikler! Paketi tamamladiniz" mesaji, sonuc ozeti, /stats sayfasina yonlendirme secenegi

### TS-24: Progress Bar Guncellenmesi
**Adimlar:**
1. Paketi ac
2. 5 soru coz
3. Paketler sayfasina don

**Beklenen:** Paket kartinda ilerleme cubugu 5/50 = %10 dolu, "5/50 soru cozuldu" metni

### TS-25: Cozulen Sorulari localStorage'da Saklama
**Adimlar:**
1. 3 soru coz
2. Tarayiciyi yenile (F5)
3. Paket ac

**Beklenen:** Cozulen 3 soru yesil olarak isaretlendi, ilerleme kaybolmadi

---

## III. Simulasyon Modu (26-35)

### TS-26: Simulasyon Ayarlari
**Adimlar:**
1. /simulation sayfasina git
2. Paket: "Subat 2024 Stabilite" sec
3. Soru sayisi: 20 sec
4. Sure: 30 dakika sec
5. "Simulasyonu Baslat" butonuna tikla

**Beklenen:** /simulation/exam sayfasina yonlendirme, 20 soru yuklendi, timer 30:00'dan basladi

### TS-27: Simulasyon - Zamanlayici
**Adimlar:**
1. Simulasyon baslat (20 soru, 30 dk)
2. 25 dakika bekle (veya timer'i 5 dk olarak ayarla)

**Beklenen:** Timer 5:00'i gosteriyor, zaman cubugu sari oldu, uyari rengi degisti

### TS-28: Simulasyon - Sure Doldu Otomatik Bitis
**Adimlar:**
1. Simulasyon baslat (5 soru, 1 dk)
2. Hicbir sey yapmadan bekle

**Beklenen:** 1 dk sonra otomatik /simulation/results sayfasina yonlendirme, bos cevaplar "bos" olarak isaretlendi

### TS-29: Simulasyon - Erken Bitirme
**Adimlar:**
1. Simulasyon baslat
2. Pause butonuna tikla
3. "Simulasyonu Bitir" sec
4. Onay modalinda "Evet" tikla

**Beklenen:** Sonuclar sayfasina yonlendirme, cozulen sorular degerlendirildi

### TS-30: Simulasyon - Sonuc Ekrani Gecme
**Adimlar:**
1. Simulasyon tamamla (%75 basari)
2. Sonuc ekranini kontrol et

**Beklenen:** Yesil halka %75, "Tebrikler! Simulasyonu gectiniz" mesaji, konfeti animasyonu

### TS-31: Simulasyon - Sonuc Ekrani Kalma
**Adimlar:**
1. Simulasyon tamamla (%60 basari)
2. Sonuc ekranini kontrol et

**Beklenen:** Kirmizi halka %60, "Simulasyonu gecemediniz" mesaji, tekrar dene butonu

### TS-32: Simulasyon - Konu Bazli Analiz
**Adimlar:**
1. Simulasyon tamamla
2. Sonuc ekraninda konu analizini kontrol et

**Beklenen:** Her konu icin basari yuzdesi cubuk grafik, en zayif konu vurgulandi

### TS-33: Simulasyon - Soru Inceleme
**Adimlar:**
1. Simulasyon tamamla
2. Sonuc ekraninda "Yanlis" filtresini sec
3. Bir yanlis soruya tikla

**Beklenen:** Soru detayi acildi, dogru cevap vurgulandi, aciklama gosterildi

### TS-34: Simulasyon - Rastgele Soru Secimi
**Adimlar:**
1. 2 farkli simulasyon baslat (ayni ayarlar)
2. Soru siralamasini karsilastir

**Beklenen:** Her simulasyonda farkli soru siralamasi (rastgele secim dogrulandi)

### TS-35: Simulasyon - Klavye Kullanimi
**Adimlar:**
1. Simulasyon baslat
2. Space ile basla
3. 1-5 tuslariyla sik sec
4. Enter ile kontrol et

**Beklenen:** Tum islemler klavye ile yapilabildi, fare kullanilmadi

---

## IV. Istatistikler & Rozetler (36-42)

### TS-36: Genel Istatistikler
**Adimlar:**
1. 20 soru coz (15 dogru, 5 yanlis)
2. /stats sayfasina git

**Beklenen:** Dogru/yanlis pasta grafigi %75/25, toplam 20 soru cozuldu gosteriliyor

### TS-37: Haftalik Grafik
**Adimlar:**
1. 7 gun boyunca her gun soru coz
2. /stats sayfasina git
3. Haftalik grafigi kontrol et

**Beklenen:** 7 gunluk cubuk grafik, her gun icin cozulen soru sayisi

### TS-38: Aktivite Takvimi
**Adimlar:**
1. 3 gun ust uste soru coz
2. /stats sayfasina git

**Beklenen:** 3 gun yesil isaretli, alev (streak) ikonu gorunuyor

### TS-39: Rozet Kazanma - "Ilk Adim"
**Adimlar:**
1. Ilk soruyu coz
2. /stats sayfasina git
3. Rozetler bolumune bak

**Beklenen:** "Ilk Adim" rozet kilidi acildi, kazanim animasyonu, alev ikonu

### TS-40: Rozet Kazanma - "Usta Cozumcu" (50 Soru)
**Adimlar:**
1. 50 soru coz
2. /stats sayfasina git

**Beklenen:** "Usta Cozumcu" rozet kilidi acildi, konfeti animasyonu

### TS-41: Rozet Kazanma - "Mukemmel" (%90)
**Adimlar:**
1. 10 soru coz, 9'unu dogru yap
2. /stats sayfasina git

**Beklenen:** "Mukemmel" rozet kilidi acildi

### TS-42: Rozet Kilitli Gosterim
**Adimlar:**
1. Hic soru cozme
2. /stats sayfasina git

**Beklenen:** 12 rozetin tamami kilitli (gri), ilerleme cubugu %0

---

## V. Profil & Abonelik (43-47)

### TS-43: Profil Bilgileri
**Adimlar:**
1. /profile sayfasina git
2. Profil bilgilerini kontrol et

**Beklenen:** Avatar (bas harfler), isim, email, uyelik tarihi, istatistik kartlari

### TS-44: Abonelik Olma (Mock)
**Adimlar:**
1. /profile sayfasina git
2. "Abone Ol" butonuna tikla
3. Paket sec
4. Onayla

**Beklenen:** Abonelik aktif, paket karti "Aktif" olarak guncellendi, kilitli sorular acildi

### TS-45: Tema Degistirme
**Adimlar:**
1. /profile sayfasina git
2. "Tema" bolumunde dark/light toggle'a tikla

**Beklenen:** Tema aninda degisti, localStorage'a kaydedildi, sayfa yenilenince tema korundu

### TS-46: Profil Istatistik Ozeti
**Adimlar:**
1. 25 soru coz
2. /profile sayfasina git

**Beklenen:** Toplam cozulen: 25, basari orani, en basarili konu gosteriliyor

### TS-47: Cikis Yapma Onayi
**Adimlar:**
1. /profile sayfasina git
2. "Cikis Yap" butonuna tikla

**Beklenen:** Onay modal acildi: "Cikis yapmak istediginize emin misiniz?"

---

## VI. Admin Panel (48-50)

### TS-48: Admin Dashboard - Istatistik Kartlari
**Adimlar:**
1. Admin girisi yap
2. /admin sayfasina git
3. Istatistik kartlarini kontrol et

**Beklenen:** 4 kart: Toplam Kullanici, Toplam Soru, Aktif Abonelik, Bugunku Aktivite

### TS-49: Admin - Soru Ekleme
**Adimlar:**
1. /admin/questions sayfasina git
2. "Yeni Soru Ekle" butonuna tikla
3. Form doldur: soru metni, 5 sik, dogru cevap, konu, aciklama
4. "Kaydet" butonuna tikla

**Beklenen:** Soru tablosunda yeni soru gorundu, basari toast: "Soru eklendi"

### TS-50: Admin - Kullanici Yonetimi
**Adimlar:**
1. /admin/users sayfasina git
2. Kullanici ara: "mehmet"
3. Bulunan kullaniciya tikla

**Beklenen:** Kullanici detayi acildi (drawer), email, rol, abonelik bilgisi, cozulen sorular

---

## Test Ortami Gereksinimleri

| Cihaz | Cozunurluk | Browser |
|-------|-----------|---------|
| Mobile (iPhone 14) | 390x844 | Safari, Chrome |
| Tablet (iPad) | 810x1080 | Safari |
| Desktop | 1920x1080 | Chrome, Firefox, Edge |

## Test Verileri
- **Ucretsiz kullanici:** Kayit olmadan
- **Normal kullanici:** mehmet@test.com / Test123!
- **Admin:** admin@kaptanlik.app / admin123

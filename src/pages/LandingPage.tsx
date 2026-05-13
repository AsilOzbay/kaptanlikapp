import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Timer,
  TrendingUp,
  UserPlus,
  Package,
  Award,
  Check,
  X,
  Star,
  ChevronRight,
} from 'lucide-react';
import Footer from '@/components/Footer';

/* ──────────────────────── EASINGS ──────────────────────── */
const easeOut = [0, 0, 0.2, 1] as [number, number, number, number];
const easeSpring = [0.34, 1.56, 0.64, 1] as [number, number, number, number];

/* ──────────────────────── HERO ──────────────────────── */
function HeroSection() {
  const [loaded, setLoaded] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden"
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="/hero-ship.png"
          alt="Cargo ship"
          className={`w-full h-full object-cover transition-transform duration-[2000ms] ease-out ${
            loaded ? 'scale-100' : 'scale-105'
          }`}
        />
        <div className="absolute inset-0 bg-[rgba(3,4,94,0.75)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-[800px] mx-auto px-4 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={loaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.2, ease: easeOut }}
          className="inline-flex items-center px-3 py-1.5 rounded-full border border-gold-500/60 text-gold-300 text-xs font-bold tracking-widest uppercase mb-6"
        >
          Kaptanlik Ehliyet Sinavina Hazirlik
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={loaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4, ease: easeOut }}
          className="text-3xl sm:text-4xl lg:text-[32px] font-extrabold text-white leading-[1.1] tracking-[-0.02em] text-shadow-hero mb-4"
        >
          Kaptanliginiza ilk adimi bizimle atin
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={loaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.8, ease: easeOut }}
          className="text-base text-[#E2E8F0] leading-relaxed max-w-[560px] mx-auto mb-8"
        >
          Gemi stabilitesinden yuk islemlerine, SOLAS belgelerinden deadweight
          hesaplamalarina kadar tum konularda profesyonel sinav hazirligi.
        </motion.p>

        {/* CTA Group */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={loaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 1.0, ease: easeOut }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10"
        >
          <Link
            href="/register"
            className="w-full sm:w-auto sm:min-w-[200px] h-14 flex items-center justify-center bg-gold-500 text-navy-950 font-semibold text-sm rounded-lg hover:bg-gold-400 transition-colors shadow-glow active:scale-[0.97]"
          >
            Ucretsiz Basla
          </Link>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto h-14 flex items-center justify-center text-gold-400 font-semibold text-sm rounded-lg hover:bg-navy-800/50 transition-colors"
          >
            Nasil Calisir?
          </a>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={loaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 1.2, ease: easeOut }}
          className="flex items-center justify-center gap-8 flex-wrap"
        >
          {[
            { value: '10.000+', label: 'Soru' },
            { value: '50+', label: 'Paket' },
            { value: '5.000+', label: 'Aday' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={loaded ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 1.2 + i * 0.08, ease: easeOut }}
              className="flex items-center gap-1.5"
            >
              <ChevronRight className="w-3.5 h-3.5 text-gold-500" />
              <span className="text-sm text-[#E2E8F0] font-medium">
                {stat.value} {stat.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────── FEATURES ──────────────────────── */
const features = [
  {
    image: '/feature-quiz.png',
    icon: BookOpen,
    title: 'Kapsamli Soru Bankasi',
    description:
      'Gemi stabilitesi, yuk islemleri, SOLAS ve daha fazlasi. Her soru detayli aciklamali ve formullu.',
    badge: { text: '10.000+ Soru', color: 'bg-green-500' },
  },
  {
    image: '/feature-simulation.png',
    icon: Timer,
    title: 'Gercek Sinav Simulasyonu',
    description:
      'Zamanli sinav deneyimi ile gercek sinav kosullarinda kendinizi test edin. Detayli sonuc analizi.',
    badge: { text: 'Sinav Modu', color: 'bg-blue-500' },
  },
  {
    image: '/feature-stats.png',
    icon: TrendingUp,
    title: 'Detayli Istatistikler',
    description:
      'Cozum istatistiklerinizi takip edin, rozetler kazanin, zayif konularinizi belirleyin.',
    badge: { text: 'Rozet Sistemi', color: 'bg-purple-500' },
  },
];

function FeaturesSection() {
  return (
    <section className="bg-navy-950 py-20 lg:py-[120px] px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center px-3 py-1 rounded-full border border-gold-500/60 text-gold-300 text-[11px] font-bold tracking-widest uppercase">
            OZELLIKLER
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-3 tracking-[-0.01em]">
            Sinavi gecmeniz icin her sey
          </h2>
          <p className="text-base text-[#E2E8F0] mt-2 max-w-[500px] mx-auto">
            Kapsamli soru bankasi, gercekci simulasyonlar ve detayli istatistiklerle hazirlik yapin.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.75 }}
                transition={{ duration: 0.5, delay: i * 0.15, ease: easeOut }}
                className="group bg-navy-800 rounded-2xl border border-navy-700/30 overflow-hidden shadow-card hover:border-gold-500/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <Icon className="w-6 h-6 text-gold-500 mt-1 mb-2" />
                  <h3 className="text-lg font-semibold text-white mb-1.5">
                    {feature.title}
                  </h3>
                  <p className="text-[15px] leading-relaxed text-[#E2E8F0] mb-3">
                    {feature.description}
                  </p>
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-white ${feature.badge.color}`}
                  >
                    {feature.badge.text}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── HOW IT WORKS ──────────────────────── */
const steps = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Hesap Olusturun',
    description: 'Ucretsiz kaydolun ve ilk 10 soruyu hemen cozmeye baslayin.',
  },
  {
    number: '02',
    icon: Package,
    title: 'Paket Secin',
    description: 'Istediginiz konu paketini secin ve kendi hizinizda calisin.',
  },
  {
    number: '03',
    icon: Award,
    title: 'Sinava Hazirlanin',
    description:
      'Simulasyonlarla kendinizi test edin, istatistiklerle gelisiminizi takip edin.',
  },
];

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-navy-900 py-20 px-4 sm:px-6">
      <div className="max-w-[1000px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center px-3 py-1 rounded-full border border-gold-500/60 text-gold-300 text-[11px] font-bold tracking-widest uppercase">
            NASIL CALISIR
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-3 tracking-[-0.01em]">
            3 Adimda Baslayin
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Dashed line - desktop */}
          <div className="hidden md:block absolute top-10 left-[16.67%] right-[16.67%] h-0.5 border-t-2 border-dashed border-gold-500/40" />

          {/* Dashed line - mobile */}
          <div className="md:hidden absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 border-l-2 border-dashed border-gold-500/40" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.4, delay: i * 0.2, ease: easeOut }}
                  className="flex flex-col items-center text-center"
                >
                  {/* Number circle */}
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.5,
                      delay: i * 0.2,
                      ease: easeSpring,
                    }}
                    className="w-16 h-16 rounded-full bg-navy-800 border-2 border-gold-500 flex items-center justify-center mb-4 shadow-glow"
                  >
                    <span className="text-xl font-bold text-gold-500">
                      {step.number}
                    </span>
                  </motion.div>

                  {/* Content */}
                  <div className="bg-navy-800/50 rounded-xl p-5 max-w-[280px]">
                    <Icon className="w-5 h-5 text-[#94A3B8] mx-auto mb-2" />
                    <h3 className="text-lg font-semibold text-white mb-1.5">
                      {step.title}
                    </h3>
                    <p className="text-[15px] leading-relaxed text-[#E2E8F0]">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── PRICING ──────────────────────── */
const freeFeatures = [
  { text: '10 soru cozme hakki', included: true },
  { text: '2 simulasyon denemesi', included: true },
  { text: 'Temel istatistikler', included: true },
  { text: 'Rozet kazanma', included: true },
  { text: 'Sinirsiz soru erisimi', included: false },
  { text: 'Detayli performans raporu', included: false },
];

const proFeatures = [
  { text: 'Sinirsiz soru cozme', included: true },
  { text: 'Sinirsiz simulasyon', included: true },
  { text: 'Detayli istatistikler ve grafikler', included: true },
  { text: 'Tum rozetleri kazanma', included: true },
  { text: 'Detayli performans raporu', included: true },
  { text: 'Oncelikli destek', included: true },
];

function PricingSection() {
  return (
    <section className="bg-navy-950 py-20 px-4 sm:px-6">
      <div className="max-w-[900px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center px-3 py-1 rounded-full border border-gold-500/60 text-gold-300 text-[11px] font-bold tracking-widest uppercase">
            FIYATLANDIRMA
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-3 tracking-[-0.01em]">
            Baslangic Ucretsiz, Devami Aylik
          </h2>
          <p className="text-base text-[#E2E8F0] mt-2 max-w-[500px] mx-auto">
            Ilk 10 soru tamamen ucretsiz. Sonrasinda aylik abonelik ile sinirsiz erisim.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, ease: easeOut }}
            className="relative bg-navy-800 rounded-2xl border border-navy-700 p-8"
          >
            <span className="absolute top-4 right-4 inline-flex px-2 py-0.5 rounded-full bg-green-500 text-white text-[11px] font-bold uppercase tracking-wider">
              UCRETSIZ
            </span>
            <h3 className="text-lg font-semibold text-white mt-4">Baslangic</h3>
            <div className="flex items-baseline gap-1 mt-2 mb-6">
              <span className="text-3xl font-extrabold text-gold-500">0 &</span>
              <span className="text-sm text-[#94A3B8]">/ ay</span>
            </div>
            <ul className="space-y-3 mb-8">
              {freeFeatures.map((f, i) => (
                <motion.li
                  key={f.text}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                  className={`flex items-center gap-2 text-sm ${
                    f.included ? 'text-[#E2E8F0]' : 'text-[#475569] line-through'
                  }`}
                >
                  {f.included ? (
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-[#475569] shrink-0" />
                  )}
                  {f.text}
                </motion.li>
              ))}
            </ul>
            <Link
              href="/register"
              className="flex items-center justify-center w-full h-12 rounded-lg border border-navy-700 text-[#E2E8F0] font-semibold text-sm hover:bg-navy-700/50 transition-colors"
            >
              Ucretsiz Basla
            </Link>
          </motion.div>

          {/* Pro */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: 0.15, ease: easeOut }}
            className="relative bg-navy-800 rounded-2xl border-2 border-gold-500 p-8 animate-pulse-glow"
          >
            <span className="absolute top-4 right-4 inline-flex px-2 py-0.5 rounded-full bg-gold-500 text-navy-950 text-[11px] font-bold uppercase tracking-wider">
              EN POPULER
            </span>
            <h3 className="text-lg font-semibold text-white mt-4">Profesyonel</h3>
            <div className="flex items-baseline gap-1 mt-2 mb-6">
              <span className="text-3xl font-extrabold text-gold-500">149 &</span>
              <span className="text-sm text-[#94A3B8]">/ ay</span>
            </div>
            <ul className="space-y-3 mb-8">
              {proFeatures.map((f, i) => (
                <motion.li
                  key={f.text}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                  className="flex items-center gap-2 text-sm text-[#E2E8F0]"
                >
                  <Check className="w-4 h-4 text-green-500 shrink-0" />
                  {f.text}
                </motion.li>
              ))}
            </ul>
            <Link
              href="/register"
              className="flex items-center justify-center w-full h-12 rounded-lg bg-gold-500 text-navy-950 font-semibold text-sm hover:bg-gold-400 transition-colors shadow-glow active:scale-[0.97]"
            >
              Hemen Basla
            </Link>
            <p className="text-center text-xs text-[#94A3B8] mt-2">
              Istediginiz zaman iptal edin
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── TESTIMONIALS ──────────────────────── */
const testimonials = [
  {
    quote:
      'Gemi stabilitesi konusunda cok zorlaniyordum. Bu uygulama sayesinde formulleri ogrenip pratik yaptim ve sinavi gectim!',
    author: 'Ahmet K.',
    role: '2. Kaptan Adayi',
  },
  {
    quote:
      'Simulasyon modu gercek sinavi aratmedi. Zaman yonetimimi gelistirmemde cok faydali oldu.',
    author: 'Mehmet Y.',
    role: '1. Kaptan Adayi',
  },
  {
    quote:
      'Rozet sistemi motivasyonumu artirdi. Her gun calismak icin bir nedenim oldu. Kesinlikle tavsiye ederim.',
    author: 'Selin D.',
    role: '3. Kaptan Adayi',
  },
];

function TestimonialsSection() {
  return (
    <section className="bg-navy-900 py-20 px-4 sm:px-6">
      <div className="max-w-[1000px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center px-3 py-1 rounded-full border border-gold-500/60 text-gold-300 text-[11px] font-bold tracking-widest uppercase">
            KULLANICI YORUMLARI
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-3 tracking-[-0.01em]">
            Adaylar Ne Diyor?
          </h2>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.8 }}
              transition={{ duration: 0.5, delay: i * 0.12, ease: easeOut }}
              className="relative bg-navy-800 rounded-2xl border border-navy-700/30 p-6 shadow-card"
            >
              {/* Quote mark */}
              <span className="absolute top-3 left-4 text-5xl text-gold-500/20 font-serif leading-none select-none">
                &ldquo;
              </span>

              <p className="text-[15px] leading-relaxed text-[#E2E8F0] italic mb-4 mt-4">
                &ldquo;{t.quote}&rdquo;
              </p>
              <h4 className="text-base font-semibold text-[#F8FAFC]">{t.author}</h4>
              <p className="text-[13px] text-[#94A3B8] mt-0.5">{t.role}</p>
              <div className="flex gap-0.5 mt-2">
                {[...Array(5)].map((_, j) => (
                  <Star
                    key={j}
                    className="w-4 h-4 fill-gold-500 text-gold-500"
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── DOWNLOAD CTA ──────────────────────── */
function DownloadCTASection() {
  return (
    <section className="relative bg-navy-950 py-20 px-4 sm:px-6 overflow-hidden">
      {/* Radial gradient */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-gold-500/5 animate-radial-pulse" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5, ease: easeOut }}
        className="relative z-10 max-w-[600px] mx-auto text-center"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-[-0.01em]">
          Hemen Baslayin
        </h2>
        <p className="text-base text-[#E2E8F0] mt-2 mb-8">
          Web&apos;den, App Store&apos;dan veya Google Play&apos;den erisim saglayin.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2, ease: easeOut }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 h-12 flex items-center justify-center bg-gold-500 text-navy-950 font-semibold text-sm rounded-lg hover:bg-gold-400 transition-colors shadow-glow active:scale-[0.97]"
          >
            Web&apos;den Basla
          </Link>
          <button className="w-full sm:w-auto h-12 px-4 flex items-center justify-center bg-navy-800 border border-navy-700 rounded-lg text-[#E2E8F0] text-sm font-medium hover:border-gold-500/40 transition-colors">
            App Store
          </button>
          <button className="w-full sm:w-auto h-12 px-4 flex items-center justify-center bg-navy-800 border border-navy-700 rounded-lg text-[#E2E8F0] text-sm font-medium hover:border-gold-500/40 transition-colors">
            Google Play
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ──────────────────────── LANDING PAGE ──────────────────────── */
export default function LandingPage() {
  return (
    <div className="bg-navy-900">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <TestimonialsSection />
      <DownloadCTASection />
      <Footer />
    </div>
  );
}

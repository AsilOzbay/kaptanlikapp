import { useEffect, useState, useMemo } from 'react';
import { Link, useLocation } from 'wouter';
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
  Target,
  Lock,
  Anchor,
  FileCheck,
  Ruler,
  Calculator,
  ArrowUp,
  BarChart3,
  Flame,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Footer from '@/components/Footer';

/* ──────────────────────── EASINGS ──────────────────────── */
const easeOut = [0, 0, 0.2, 1] as [number, number, number, number];
const easeSpring = [0.34, 1.56, 0.64, 1] as [number, number, number, number];

/* ──────────────────────── LOCAL STORAGE HELPERS ──────────────────────── */
function getProgressFromStorage(): Record<string, { solved: number; correct: number; total: number }> {
  try {
    const raw = localStorage.getItem('kaptanlik_progress');
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}

function getFavoritesFromStorage(): string[] {
  try {
    const raw = localStorage.getItem('kaptanlik_favorites');
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

interface UserStats {
  totalSolved: number;
  totalCorrect: number;
  accuracy: number;
  completedPackages: number;
  favoritesCount: number;
  streak: number;
  topicBreakdown: Record<string, { solved: number; correct: number }>;
}

function computeUserStats(): UserStats {
  const progress = getProgressFromStorage();
  const favorites = getFavoritesFromStorage();
  let totalSolved = 0;
  let totalCorrect = 0;
  const topicBreakdown: Record<string, { solved: number; correct: number }> = {};

  Object.entries(progress).forEach(([pkgId, data]) => {
    const solved = data.solved || 0;
    const correct = data.correct || 0;
    totalSolved += solved;
    totalCorrect += correct;
    topicBreakdown[pkgId] = { solved, correct };
  });

  const accuracy = totalSolved > 0 ? Math.round((totalCorrect / totalSolved) * 100) : 0;
  const completedPackages = Object.values(progress).filter((d: unknown) => {
    const data = d as { solved: number; total: number };
    return data.solved >= data.total;
  }).length;

  // Simulate streak from localStorage or default to mock
  let streak = 0;
  try {
    const raw = localStorage.getItem('kaptanlik_streak');
    if (raw) streak = parseInt(raw, 10);
  } catch { /* ignore */ }
  if (!streak) streak = 5; // mock default

  return {
    totalSolved,
    totalCorrect,
    accuracy,
    completedPackages,
    favoritesCount: favorites.length,
    streak,
    topicBreakdown,
  };
}

/* ──────────────────────── PACKAGE DATA ──────────────────────── */
const packages = [
  { id: 'stability', name: 'Gemi Stabilitesi', icon: Anchor, total: 150, progress: 65 },
  { id: 'cargo', name: 'Yuk Islemleri', icon: Package, total: 120, progress: 40 },
  { id: 'solas', name: 'SOLAS Belgeleri', icon: FileCheck, total: 200, progress: 0, locked: true },
  { id: 'dimensions', name: 'Gemi Boyutlari', icon: Ruler, total: 100, progress: 0, locked: true },
  { id: 'deadweight', name: 'Deadweight Hesaplamalari', icon: Calculator, total: 90, progress: 0, locked: true },
  { id: 'metacentric', name: 'Metasentrik Yukseklik', icon: ArrowUp, total: 110, progress: 0, locked: true },
];

const dayLabels = ['Pz', 'Pt', 'Sa', 'Ca', 'Pe', 'Cu', 'Ct'];
const studiedDays = [true, true, false, true, true, false, true];

/* ──────────────────────── DASHBOARD PAGE ──────────────────────── */
function DashboardView() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const stats = useMemo(() => computeUserStats(), []);
  const [animated, setAnimated] = useState(false);

  const firstName = user?.displayName?.split(' ')[0] || 'Kaptan';

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return `Gunaydin, ${firstName}!`;
    if (hour < 18) return `Iyi gunler, ${firstName}!`;
    return `Iyi aksamlar, ${firstName}!`;
  }, [firstName]);

  const quickStats = [
    { icon: BookOpen, label: 'Cozulen Soru', value: stats.totalSolved.toLocaleString('tr-TR'), trend: '+12% bu hafta' },
    { icon: Target, label: 'Basari Orani', value: `%${stats.accuracy}`, trend: '+5% bu hafta' },
    { icon: Package, label: 'Acik Paket', value: stats.completedPackages.toString(), sub: '18 kilitli' },
    { icon: Award, label: 'Kazanilan Rozet', value: '7', sub: '15 toplam' },
  ];

  return (
    <div className="min-h-[100dvh] bg-navy-900 pb-24">
      {/* Greeting Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: easeOut }}
        className="mx-4 mt-4 bg-navy-800 rounded-2xl p-5 shadow-card"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-[-0.01em]">{greeting}</h2>
        <p className="text-sm text-gray-100 mt-1">
          Bugun {stats.totalSolved} soru cozdunuz. Hedefinize {Math.max(0, 50 - stats.totalSolved)} soru kaldi.
        </p>
        {/* Daily goal progress */}
        <div className="mt-3 h-2 bg-navy-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: animated ? `${Math.min(100, (stats.totalSolved / 50) * 100)}%` : 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: easeOut }}
            className="h-full bg-gold-500 rounded-full"
          />
        </div>
        {stats.streak > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: animated ? 1 : 0 }}
            transition={{ duration: 0.3, delay: 0.4, ease: easeSpring }}
            className="inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded-full bg-gold-500/10 border border-gold-500/30"
          >
            <Flame className="w-4 h-4 text-gold-500" />
            <span className="text-xs font-bold text-gold-300">{stats.streak} gunluk seri</span>
          </motion.div>
        )}
      </motion.div>

      {/* Daily Streak */}
      <div className="mt-4 px-4">
        <h4 className="text-sm font-semibold text-gray-100 mb-2">Bu Hafta</h4>
        <div className="flex gap-2">
          {dayLabels.map((day, i) => (
            <motion.div
              key={day}
              initial={{ scale: 0 }}
              animate={{ scale: animated ? 1 : 0 }}
              transition={{ duration: 0.2, delay: 0.3 + i * 0.05 }}
              className={`flex flex-col items-center gap-1 ${i === dayLabels.length - 1 ? 'relative' : ''}`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                  studiedDays[i]
                    ? 'bg-gold-500 text-navy-950'
                    : 'bg-navy-800 border border-navy-700 text-gray-400'
                } ${i === dayLabels.length - 1 ? 'ring-2 ring-gold-500' : ''}`}
              >
                {day}
              </div>
              {studiedDays[i] && <Flame className="w-3 h-3 text-gold-500" />}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-4 px-4 grid grid-cols-2 gap-3">
        {quickStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 + i * 0.08, ease: easeOut }}
              className="bg-navy-800 rounded-2xl p-4 shadow-card"
            >
              <Icon className="w-5 h-5 text-gold-500 mb-2" />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: animated ? 1 : 0 }}
                transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
                className="text-xl font-bold text-white"
              >
                {stat.value}
              </motion.div>
              <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
              {stat.trend && (
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-green-400">{stat.trend}</span>
                </div>
              )}
              {stat.sub && <p className="text-xs text-gray-600 mt-1">{stat.sub}</p>}
            </motion.div>
          );
        })}
      </div>

      {/* Continue Studying */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: animated ? 1 : 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="mt-6 px-4"
      >
        <h3 className="text-lg font-semibold text-white mb-3">Kaldiginiz Yerden Devam Edin</h3>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 snap-x">
          {packages.slice(0, 3).filter((p) => !p.locked).map((pkg) => (
            <motion.button
              key={pkg.id}
              onClick={() => navigate('/packages')}
              whileTap={{ scale: 0.97 }}
              className="flex-shrink-0 w-[260px] snap-start bg-navy-800 rounded-2xl border border-navy-700 p-4 text-left hover:border-gold-500/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gold-500/10 flex items-center justify-center">
                  <pkg.icon className="w-5 h-5 text-gold-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-white truncate">{pkg.name}</h4>
                  <p className="text-xs text-gold-500">%{pkg.progress} tamamlandi</p>
                </div>
              </div>
              <div className="mt-3 h-1 bg-navy-700 rounded-full overflow-hidden">
                <div className="h-full bg-gold-500 rounded-full" style={{ width: `${pkg.progress}%` }} />
              </div>
              <p className="text-xs text-gray-400 mt-2">Son calisilan: 2 saat once</p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Package Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: animated ? 1 : 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
        className="mt-6 px-4"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">Paketler</h3>
          <button onClick={() => navigate('/packages')} className="text-xs text-gold-500 flex items-center gap-0.5 hover:text-gold-400 transition-colors">
            Tumunu Gor <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {packages.map((pkg, i) => (
            <motion.button
              key={pkg.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: animated ? 1 : 0, y: animated ? 0 : 16 }}
              transition={{ duration: 0.3, delay: 0.7 + i * 0.06, ease: easeOut }}
              whileTap={pkg.locked ? { x: [0, -3, 3, -3, 0] } : { scale: 0.97 }}
              onClick={() => {
                if (pkg.locked) return;
                navigate('/packages');
              }}
              className={`relative bg-navy-800 rounded-2xl border border-navy-700 p-4 text-left transition-colors ${
                pkg.locked ? 'opacity-70' : 'hover:border-gold-500/40'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                pkg.locked ? 'bg-navy-700' : 'bg-gold-500/10'
              }`}>
                {pkg.locked ? (
                  <Lock className="w-5 h-5 text-gray-400" />
                ) : (
                  <pkg.icon className="w-5 h-5 text-gold-500" />
                )}
              </div>
              <h4 className="text-sm font-semibold text-white mt-3">{pkg.name}</h4>
              <p className="text-xs text-gray-400">{pkg.total} soru</p>
              {!pkg.locked && (
                <p className="text-xs text-gold-500 mt-1">%{pkg.progress} tamamlandi</p>
              )}
              {pkg.locked && (
                <div className="mt-2 inline-flex items-center px-1.5 py-0.5 rounded-full border border-gold-500/50 text-[10px] font-bold text-gold-300 uppercase tracking-wider">
                  <Lock className="w-3 h-3 mr-1" />
                  Abonelik Gerekli
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: animated ? 1 : 0 }}
        transition={{ duration: 0.3, delay: 0.8 }}
        className="mt-6 px-4 pb-8"
      >
        <h4 className="text-sm font-semibold text-gray-100 mb-2">Hizli Eylemler</h4>
        <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1">
          {[
            { label: 'Simulasyon Baslat', icon: Timer, color: 'text-blue-500', path: '/simulation' },
            { label: 'Formuller', icon: Calculator, color: 'text-purple-500', path: '/packages' },
            { label: 'Istatistikler', icon: BarChart3, color: 'text-green-500', path: '/stats' },
            { label: 'Rozetlerim', icon: Award, color: 'text-gold-500', path: '/stats' },
          ].map((action, i) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: animated ? 1 : 0, x: animated ? 0 : -12 }}
                transition={{ duration: 0.25, delay: 0.9 + i * 0.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(action.path)}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-navy-800 border border-navy-700 rounded-full hover:border-gold-500/30 transition-colors"
              >
                <Icon className={`w-4 h-4 ${action.color}`} />
                <span className="text-xs font-medium text-gray-100 whitespace-nowrap">{action.label}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

/* ──────────────────────── LANDING SECTIONS (original) ──────────────────────── */

/* Hero */
function HeroSection() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img src="/hero-ship.png" alt="Cargo ship" className={`w-full h-full object-cover transition-transform duration-[2000ms] ease-out ${loaded ? 'scale-100' : 'scale-105'}`} />
        <div className="absolute inset-0 bg-[rgba(3,4,94,0.75)]" />
      </div>
      <div className="relative z-10 max-w-[800px] mx-auto px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={loaded ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.4, delay: 0.2, ease: easeOut }} className="inline-flex items-center px-3 py-1.5 rounded-full border border-gold-500/60 text-gold-300 text-xs font-bold tracking-widest uppercase mb-6">
          Kaptanlik Ehliyet Sinavina Hazirlik
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={loaded ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.4, ease: easeOut }} className="text-3xl sm:text-4xl lg:text-[32px] font-extrabold text-white leading-[1.1] tracking-[-0.02em] text-shadow-hero mb-4">
          Kaptanliginiza ilk adimi bizimle atin
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={loaded ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.8, ease: easeOut }} className="text-base text-[#E2E8F0] leading-relaxed max-w-[560px] mx-auto mb-8">
          Gemi stabilitesinden yuk islemlerine, SOLAS belgelerinden deadweight hesaplamalarina kadar tum konularda profesyonel sinav hazirligi.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={loaded ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.4, delay: 1.0, ease: easeOut }} className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
          <Link href="/register" className="w-full sm:w-auto sm:min-w-[200px] h-14 flex items-center justify-center bg-gold-500 text-navy-950 font-semibold text-sm rounded-lg hover:bg-gold-400 transition-colors shadow-glow active:scale-[0.97]">
            Ucretsiz Basla
          </Link>
          <a href="#how-it-works" className="w-full sm:w-auto h-14 flex items-center justify-center text-gold-400 font-semibold text-sm rounded-lg hover:bg-navy-800/50 transition-colors">
            Nasil Calisir?
          </a>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={loaded ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.4, delay: 1.2, ease: easeOut }} className="flex items-center justify-center gap-8 flex-wrap">
          {[{ value: '10.000+', label: 'Soru' }, { value: '50+', label: 'Paket' }, { value: '5.000+', label: 'Aday' }].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={loaded ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.4, delay: 1.2 + i * 0.08, ease: easeOut }} className="flex items-center gap-1.5">
              <ChevronRight className="w-3.5 h-3.5 text-gold-500" />
              <span className="text-sm text-[#E2E8F0] font-medium">{stat.value} {stat.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* Features */
const features = [
  { image: '/feature-quiz.png', icon: BookOpen, title: 'Kapsamli Soru Bankasi', description: 'Gemi stabilitesi, yuk islemleri, SOLAS ve daha fazlasi. Her soru detayli aciklamali ve formullu.', badge: { text: '10.000+ Soru', color: 'bg-green-500' } },
  { image: '/feature-simulation.png', icon: Timer, title: 'Gercek Sinav Simulasyonu', description: 'Zamanli sinav deneyimi ile gercek sinav kosullarinda kendinizi test edin. Detayli sonuc analizi.', badge: { text: 'Sinav Modu', color: 'bg-blue-500' } },
  { image: '/feature-stats.png', icon: TrendingUp, title: 'Detayli Istatistikler', description: 'Cozum istatistiklerinizi takip edin, rozetler kazanin, zayif konularinizi belirleyin.', badge: { text: 'Rozet Sistemi', color: 'bg-purple-500' } },
];

function FeaturesSection() {
  return (
    <section className="bg-navy-950 py-20 lg:py-[120px] px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.8 }} transition={{ duration: 0.5, ease: easeOut }} className="text-center mb-12">
          <span className="inline-flex items-center px-3 py-1 rounded-full border border-gold-500/60 text-gold-300 text-[11px] font-bold tracking-widest uppercase">OZELLIKLER</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-3 tracking-[-0.01em]">Sinavi gecmeniz icin her sey</h2>
          <p className="text-base text-[#E2E8F0] mt-2 max-w-[500px] mx-auto">Kapsamli soru bankasi, gercekci simulasyonlar ve detayli istatistiklerle hazirlik yapin.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.75 }} transition={{ duration: 0.5, delay: i * 0.15, ease: easeOut }} className="group bg-navy-800 rounded-2xl border border-navy-700/30 overflow-hidden shadow-card hover:border-gold-500/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={feature.image} alt={feature.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4">
                  <Icon className="w-6 h-6 text-gold-500 mt-1 mb-2" />
                  <h3 className="text-lg font-semibold text-white mb-1.5">{feature.title}</h3>
                  <p className="text-[15px] leading-relaxed text-[#E2E8F0] mb-3">{feature.description}</p>
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-white ${feature.badge.color}`}>{feature.badge.text}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* How It Works */
const steps = [
  { number: '01', icon: UserPlus, title: 'Hesap Olusturun', description: 'Ucretsiz kaydolun ve ilk 10 soruyu hemen cozmeye baslayin.' },
  { number: '02', icon: Package, title: 'Paket Secin', description: 'Istediginiz konu paketini secin ve kendi hizinizda calisin.' },
  { number: '03', icon: Award, title: 'Sinava Hazirlanin', description: 'Simulasyonlarla kendinizi test edin, istatistiklerle gelisiminizi takip edin.' },
];

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-navy-900 py-20 px-4 sm:px-6">
      <div className="max-w-[1000px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.8 }} transition={{ duration: 0.5, ease: easeOut }} className="text-center mb-12">
          <span className="inline-flex items-center px-3 py-1 rounded-full border border-gold-500/60 text-gold-300 text-[11px] font-bold tracking-widest uppercase">NASIL CALISIR</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-3 tracking-[-0.01em]">3 Adimda Baslayin</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div key={step.number} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.75 }} transition={{ duration: 0.5, delay: i * 0.12, ease: easeOut }} className="text-center">
                <div className="relative inline-flex items-center justify-center mb-4">
                  <div className="absolute inset-0 rounded-full bg-gold-500/10 animate-pulse" />
                  <div className="relative w-[72px] h-[72px] rounded-full border border-gold-500/40 flex flex-col items-center justify-center bg-navy-800/50">
                    <Icon className="w-5 h-5 text-gold-500" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gold-500 flex items-center justify-center">
                    <span className="text-[11px] font-bold text-navy-950">{step.number}</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-[15px] text-[#E2E8F0] leading-relaxed">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* Pricing */
const plans = [
  { name: 'Baslangic', price: 'Ucretsiz', period: '', description: 'Sinava hazirlik yolculugunuza baslayin.', features: [{ text: '10 soru/gun', included: true }, { text: '2 simulasyon/gun', included: true }, { text: 'Temel istatistikler', included: true }, { text: 'Tum konu paketleri', included: false }, { text: 'Detayli aciklamalar', included: false }], cta: 'Ucretsiz Basla', ctaStyle: 'secondary' as const, popular: false },
  { name: 'Profesyonel', price: '149', period: '/ay', description: 'Sinavi gecmek icin tam erisim.', features: [{ text: 'Sinirsiz soru cozumu', included: true }, { text: 'Sinirsiz simulasyon', included: true }, { text: 'Detayli istatistikler', included: true }, { text: 'Tum konu paketleri', included: true }, { text: 'Detayli aciklamalar', included: true }], cta: 'Profesyonel Ol', ctaStyle: 'primary' as const, popular: true },
];

function PricingSection() {
  return (
    <section className="bg-navy-950 py-20 px-4 sm:px-6">
      <div className="max-w-[1000px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.8 }} transition={{ duration: 0.5, ease: easeOut }} className="text-center mb-12">
          <span className="inline-flex items-center px-3 py-1 rounded-full border border-gold-500/60 text-gold-300 text-[11px] font-bold tracking-widest uppercase">FIYATLANDIRMA</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-3 tracking-[-0.01em]">Size Uygun Plani Secin</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-[640px] mx-auto">
          {plans.map((plan, i) => (
            <motion.div key={plan.name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.5, delay: i * 0.12, ease: easeOut }} className={`relative bg-navy-800 rounded-2xl p-6 border ${plan.popular ? 'border-gold-500/60 shadow-glow' : 'border-navy-700/30'}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gold-500 rounded-full text-[11px] font-bold text-navy-950 uppercase tracking-wider">En Populer</div>
              )}
              <h3 className="text-lg font-semibold text-white mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                {plan.period && <span className="text-sm text-gray-400">{plan.period}</span>}
              </div>
              <p className="text-sm text-[#E2E8F0] mb-4">{plan.description}</p>
              <div className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <div key={f.text} className="flex items-center gap-2">
                    {f.included ? <Check className="w-4 h-4 text-green-500 flex-shrink-0" /> : <X className="w-4 h-4 text-gray-600 flex-shrink-0" />}
                    <span className={`text-sm ${f.included ? 'text-[#E2E8F0]' : 'text-gray-600'}`}>{f.text}</span>
                  </div>
                ))}
              </div>
              <Link href="/register" className={`block w-full h-12 flex items-center justify-center font-semibold text-sm rounded-lg transition-colors active:scale-[0.97] ${plan.popular ? 'bg-gold-500 text-navy-950 hover:bg-gold-400 shadow-glow' : 'bg-transparent border border-gold-500 text-gold-500 hover:bg-gold-500/8'}`}>
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Testimonials */
const testimonials = [
  { quote: 'Bu uygulama sayesinde kaptanlik sinavini ilk denemede gectim. Sorularin detayli aciklamalari cok faydali.', author: 'Mehmet K.', role: '2. Kaptan', },
  { quote: 'Simulasyon modu gercek sinav deneyimi yasatti. Zaman yonetimimi gelistirdim.', author: 'Ayse Y.', role: '3. Kaptan', },
  { quote: 'Istatistikler sayesinde zayif oldugum konulari gorup uzerine calistim. Harika bir uygulama.', author: 'Can B.', role: '4. Kaptan', },
];

function TestimonialsSection() {
  return (
    <section className="bg-navy-900 py-20 px-4 sm:px-6">
      <div className="max-w-[1000px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.8 }} transition={{ duration: 0.5, ease: easeOut }} className="text-center mb-12">
          <span className="inline-flex items-center px-3 py-1 rounded-full border border-gold-500/60 text-gold-300 text-[11px] font-bold tracking-widest uppercase">YORUMLAR</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-3 tracking-[-0.01em]">Adaylar Ne Diyor?</h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div key={t.author} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.8 }} transition={{ duration: 0.5, delay: i * 0.12, ease: easeOut }} className="relative bg-navy-800 rounded-2xl border border-navy-700/30 p-6 shadow-card">
              <span className="absolute top-3 left-4 text-5xl text-gold-500/20 font-serif leading-none select-none">&ldquo;</span>
              <p className="text-[15px] leading-relaxed text-[#E2E8F0] italic mb-4 mt-4">&ldquo;{t.quote}&rdquo;</p>
              <h4 className="text-base font-semibold text-[#F8FAFC]">{t.author}</h4>
              <p className="text-[13px] text-[#94A3B8] mt-0.5">{t.role}</p>
              <div className="flex gap-0.5 mt-2">{[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-gold-500 text-gold-500" />)}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Download CTA */
function DownloadCTASection() {
  return (
    <section className="relative bg-navy-950 py-20 px-4 sm:px-6 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-gold-500/5 animate-radial-pulse" />
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.5, ease: easeOut }} className="relative z-10 max-w-[600px] mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-[-0.01em]">Hemen Baslayin</h2>
        <p className="text-base text-[#E2E8F0] mt-2 mb-8">Web&apos;den, App Store&apos;dan veya Google Play&apos;den erisim saglayin.</p>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.2, ease: easeOut }} className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/register" className="w-full sm:w-auto px-8 h-12 flex items-center justify-center bg-gold-500 text-navy-950 font-semibold text-sm rounded-lg hover:bg-gold-400 transition-colors shadow-glow active:scale-[0.97]">Web&apos;den Basla</Link>
          <button className="w-full sm:w-auto h-12 px-4 flex items-center justify-center bg-navy-800 border border-navy-700 rounded-lg text-[#E2E8F0] text-sm font-medium hover:border-gold-500/40 transition-colors">App Store</button>
          <button className="w-full sm:w-auto h-12 px-4 flex items-center justify-center bg-navy-800 border border-navy-700 rounded-lg text-[#E2E8F0] text-sm font-medium hover:border-gold-500/40 transition-colors">Google Play</button>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ──────────────────────── LANDING PAGE ──────────────────────── */
export default function LandingPage() {
  const { user } = useAuth();

  if (user) {
    return <DashboardView />;
  }

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

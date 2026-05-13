import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {
  BookOpen,
  Target,
  Flame,
  Trophy,
  Award,
  Anchor,
  Lock,
  
  Zap,
  Star,
  Moon,
  Calculator,
  ClipboardCheck,
  Compass,
  Heart,
  Sparkles,
} from 'lucide-react';
import { badges, computeBadgeStatuses } from '@/data/badges';
import type { BadgeWithStatus } from '@/data/badges';

/* ──────────────────────── EASINGS ──────────────────────── */
const easeOut = [0, 0, 0.2, 1] as [number, number, number, number];
const easeSpring = [0.34, 1.56, 0.64, 1] as [number, number, number, number];

/* ──────────────────────── DATA HELPERS ──────────────────────── */
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
  streak: number;
  topicBreakdown: Record<string, { solved: number; correct: number }>;
  favoritesCount: number;
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

  // Mock data if no real data
  if (totalSolved === 0) {
    const mockTopics: Record<string, { solved: number; correct: number }> = {
      stability: { solved: 85, correct: 72 },
      cargo: { solved: 64, correct: 50 },
      solas: { solved: 120, correct: 96 },
      dimensions: { solved: 45, correct: 29 },
      deadweight: { solved: 38, correct: 22 },
      metacentric: { solved: 52, correct: 23 },
      navigation: { solved: 30, correct: 9 },
    };
    Object.entries(mockTopics).forEach(([k, v]) => {
      totalSolved += v.solved;
      totalCorrect += v.correct;
      topicBreakdown[k] = v;
    });
  }

  const accuracy = totalSolved > 0 ? Math.round((totalCorrect / totalSolved) * 100) : 0;

  let streak = 0;
  try {
    const raw = localStorage.getItem('kaptanlik_streak');
    if (raw) streak = parseInt(raw, 10);
  } catch { /* ignore */ }
  if (!streak) streak = 12;

  return {
    totalSolved,
    totalCorrect,
    accuracy,
    streak,
    topicBreakdown,
    favoritesCount: favorites.length || 3,
  };
}

/* ──────────────────────── WEEKLY CHART DATA ──────────────────────── */
const weeklyData = [
  { day: 'Pz', count: 45, studied: true },
  { day: 'Pt', count: 62, studied: true },
  { day: 'Sa', count: 38, studied: true },
  { day: 'Ca', count: 0, studied: false },
  { day: 'Pe', count: 74, studied: true },
  { day: 'Cu', count: 15, studied: true },
  { day: 'Ct', count: 0, studied: false },
];

/* ──────────────────────── TOPIC DATA ──────────────────────── */
const topicData = [
  { name: 'Gemi Stabilitesi', key: 'stability' },
  { name: 'SOLAS Belgeleri', key: 'solas' },
  { name: 'Yuk Islemleri', key: 'cargo' },
  { name: 'Gemi Boyutlari', key: 'dimensions' },
  { name: 'Deadweight Hes.', key: 'deadweight' },
  { name: 'Metasentrik Yks.', key: 'metacentric' },
  { name: 'Seyir & Navigasyon', key: 'navigation' },
];

/* ──────────────────────── BADGE ICONS MAP ──────────────────────── */
const badgeIcons: Record<string, typeof Trophy> = {
  'first-solve': Star,
  'solver-10': Award,
  'solver-50': Zap,
  'solver-100': Trophy,
  'accuracy-70': Target,
  'accuracy-90': Star,
  'perfect-solve': Sparkles,
  'night-owl': Moon,
  'formula-master': Calculator,
  'simulation-pass': ClipboardCheck,
  'explorer': Compass,
  'favorite-10': Heart,
};

/* ──────────────────────── ACTIVITY CALENDAR ──────────────────────── */
function generateCalendarDays(): { day: number; status: 'full' | 'partial' | 'rest' | 'today' }[] {
  const days: { day: number; status: 'full' | 'partial' | 'rest' | 'today' }[] = [];
  const today = new Date().getDate();
  for (let i = 1; i <= 28; i++) {
    if (i === today) {
      days.push({ day: i, status: 'today' });
    } else if (i % 3 === 0) {
      days.push({ day: i, status: 'full' });
    } else if (i % 5 === 0) {
      days.push({ day: i, status: 'partial' });
    } else {
      days.push({ day: i, status: 'rest' });
    }
  }
  return days;
}

/* ──────────────────────── ACHIEVEMENTS ──────────────────────── */
const achievements = [
  { title: '500 Soru Clubu!', desc: 'Toplam 500 soruyu cozdunuz.', icon: Trophy, time: '2 saat once' },
  { title: '7 Gunluk Seri!', desc: '7 gun ust uste calistiniz.', icon: Flame, time: 'Dun' },
  { title: 'Gemi Stabilitesi Uzmani', desc: 'Bu konuda %85 basari elde ettiniz.', icon: Anchor, time: '3 gun once' },
];

/* ──────────────────────── SECTION: OverallScore ──────────────────────── */
function OverallScore({ stats }: { stats: UserStats }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: easeOut }}
      className="mx-4 mt-4 bg-navy-800 rounded-2xl p-6 shadow-card"
    >
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Circular Score */}
        <div className="w-[120px] h-[120px] flex-shrink-0">
          <CircularProgressbar
            value={animated ? stats.accuracy : 0}
            text={`${animated ? stats.accuracy : 0}%`}
            styles={buildStyles({
              pathColor: '#10B981',
              trailColor: '#1B2E6B',
              textColor: '#F8FAFC',
              textSize: '28px',
              strokeLinecap: 'round',
              pathTransitionDuration: 1.2,
            })}
          />
        </div>
        <p className="text-xs text-gray-400 -mt-3 sm:hidden">Genel Basari</p>

        {/* Stats Row */}
        <div className="flex flex-1 justify-around gap-4 w-full">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2, ease: easeOut }}
            className="text-center"
          >
            <BookOpen className="w-4 h-4 text-gold-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.totalSolved.toLocaleString('tr-TR')}</p>
            <p className="text-xs text-gray-400">Toplam Soru</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3, ease: easeOut }}
            className="text-center"
          >
            <Target className="w-4 h-4 text-gold-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">%{stats.accuracy}</p>
            <p className="text-xs text-gray-400">Basari Orani</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4, ease: easeOut }}
            className="text-center"
          >
            <Flame className="w-4 h-4 text-gold-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.streak}</p>
            <p className="text-xs text-gray-400">Gunluk Seri</p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

/* ──────────────────────── SECTION: WeeklyChart ──────────────────────── */
function WeeklyChart() {
  const total = weeklyData.reduce((s, d) => s + d.count, 0);
  const avg = Math.round(total / 7);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2, ease: easeOut }}
      className="mx-4 mt-4 bg-navy-800 rounded-2xl p-4 shadow-card"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Bu Hafta</h3>
        <span className="px-2.5 py-1 rounded-full bg-gray-600/30 text-[11px] font-bold text-gray-400 uppercase tracking-wider">7 gun</span>
      </div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyData} barSize={24} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="0" stroke="rgba(27, 46, 107, 0.5)" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fill: '#94A3B8', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                background: '#1B2E6B',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#F8FAFC',
                padding: '8px 12px',
              }}
              formatter={(value: number) => [`${value} soru`, '']}
              labelFormatter={(label: string) => `Gun: ${label}`}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} animationDuration={600} animationEasing="ease-out">
              {weeklyData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.count > 0 ? '#D4A017' : '#1B2E6B'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-gray-100">Toplam: <span className="font-semibold text-white">{total} soru</span></p>
        <p className="text-xs text-gray-400">Ortalama: {avg} soru/gun</p>
      </div>
    </motion.div>
  );
}

/* ──────────────────────── SECTION: TopicPerformance ──────────────────────── */
function TopicPerformance({ topicBreakdown }: { topicBreakdown: Record<string, { solved: number; correct: number }> }) {
  const topics = useMemo(() => {
    return topicData.map((t) => {
      const data = topicBreakdown[t.key];
      const pct = data && data.solved > 0 ? Math.round((data.correct / data.solved) * 100) : 0;
      let color = '#10B981'; // green
      if (pct < 40) color = '#EF4444'; // red
      else if (pct < 70) color = '#F59E0B'; // amber
      return { ...t, pct, color };
    }).sort((a, b) => b.pct - a.pct);
  }, [topicBreakdown]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3, ease: easeOut }}
      className="mx-4 mt-4"
    >
      <h3 className="text-lg font-semibold text-white mb-3">Konu Performansi</h3>
      <div className="space-y-3">
        {topics.map((topic, i) => (
          <motion.div
            key={topic.key}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.4 + i * 0.08, ease: easeOut }}
            className="bg-navy-800 rounded-xl p-3"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm text-gray-100">{topic.name}</span>
              <span className="text-xs font-semibold text-white">%{topic.pct}</span>
            </div>
            <div className="h-2 bg-navy-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${topic.pct}%` }}
                transition={{ duration: 0.6, delay: 0.5 + i * 0.08, ease: easeOut }}
                className="h-full rounded-full"
                style={{ backgroundColor: topic.color }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ──────────────────────── SECTION: StudyStreak ──────────────────────── */
function StudyStreak({ streak }: { streak: number }) {
  const calendarDays = useMemo(() => generateCalendarDays(), []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4, ease: easeOut }}
      className="mx-4 mt-4 bg-navy-800 rounded-2xl p-4 shadow-card"
    >
      <h3 className="text-lg font-semibold text-white mb-3">Calisma Serisi</h3>

      {/* Flame + Streak */}
      <div className="flex flex-col items-center mb-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.5, ease: easeSpring }}
          className="relative"
        >
          <Flame className="w-12 h-12 text-gold-500" />
          {/* Particle dots */}
          <div className="absolute -top-1 left-1/2 w-1.5 h-1.5 rounded-full bg-gold-400 animate-ping" />
          <div className="absolute -top-3 left-1/3 w-1 h-1 rounded-full bg-gold-300 animate-ping" style={{ animationDelay: '0.3s' }} />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-2xl font-extrabold text-gold-500 mt-2"
        >
          {streak} gun
        </motion.p>
        <p className="text-xs text-gray-400">Mevcut seri</p>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {calendarDays.map((day, i) => (
          <motion.div
            key={day.day}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2, delay: 0.5 + i * 0.02 }}
            className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium relative ${
              day.status === 'full'
                ? 'bg-gold-500 text-navy-950'
                : day.status === 'partial'
                ? 'bg-gold-500/30 border border-gold-500 text-gold-300'
                : day.status === 'today'
                ? 'bg-navy-700 text-white ring-2 ring-gold-500'
                : 'bg-navy-700 text-gray-400'
            }`}
          >
            {day.day}
            {day.status === 'full' && (
              <Flame className="absolute bottom-0.5 w-2 h-2 text-navy-950" />
            )}
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-gold-500" />
          <span className="text-xs text-gray-400">Hedef tamamlandi</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-gold-500/30 border border-gold-500" />
          <span className="text-xs text-gray-400">Kismi calisma</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-navy-700" />
          <span className="text-xs text-gray-400">Calisilmadi</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ──────────────────────── SECTION: BadgesCollection ──────────────────────── */
function BadgesCollection({ badgeList }: { badgeList: BadgeWithStatus[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5, ease: easeOut }}
      className="mx-4 mt-4"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-white">Kazanilan Rozetler</h3>
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold text-gold-300 bg-gold-500/10 border border-gold-500/30 uppercase tracking-wider">
          {badgeList.filter((b) => b.earned).length}/{badgeList.length}
        </span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {badgeList.map((badge, i) => {
          const IconComp = badgeIcons[badge.id] || Award;
          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.6 + i * 0.06, ease: easeOut }}
              whileTap={{ scale: 1.1 }}
              className={`bg-navy-800 rounded-2xl border p-4 flex flex-col items-center text-center aspect-square justify-center ${
                badge.earned
                  ? 'border-gold-500/40 animate-pulse-glow'
                  : 'border-navy-700 opacity-60'
              }`}
              title={badge.desc}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                badge.earned ? 'bg-gold-500/15' : 'bg-navy-700/50'
              }`}>
                {badge.earned ? (
                  <IconComp className="w-6 h-6 text-gold-500" />
                ) : (
                  <Lock className="w-5 h-5 text-gray-600" />
                )}
              </div>
              <p className={`text-xs font-semibold ${badge.earned ? 'text-white' : 'text-gray-600'}`}>
                {badge.name}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{badge.desc}</p>
              {!badge.earned && badge.progressMax > 0 && (
                <div className="w-full mt-1.5">
                  <div className="h-1 bg-navy-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gold-500 rounded-full"
                      style={{ width: `${Math.min(100, (badge.progress / badge.progressMax) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-gray-400 mt-0.5">
                    {badge.progress}/{badge.progressMax}
                  </p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ──────────────────────── SECTION: Achievements ──────────────────────── */
function AchievementsSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6, ease: easeOut }}
      className="mx-4 mt-4 mb-8"
    >
      <h3 className="text-lg font-semibold text-white mb-3">Son Basarilar</h3>
      <div className="space-y-2">
        {achievements.map((ach, i) => {
          const Icon = ach.icon;
          return (
            <motion.div
              key={ach.title}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.7 + i * 0.1, ease: easeOut }}
              className="bg-navy-800 rounded-2xl p-3 flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-full bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-gold-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white">{ach.title}</h4>
                <p className="text-xs text-gray-400">{ach.desc}</p>
              </div>
              <span className="text-xs text-gray-600 flex-shrink-0">{ach.time}</span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ──────────────────────── STATS PAGE ──────────────────────── */
export default function StatsPage() {
  const stats = useMemo(() => computeUserStats(), []);

  const badgeList = useMemo(() => {
    return computeBadgeStatuses(badges, {
      totalSolved: stats.totalSolved,
      accuracy: stats.accuracy,
      streak: stats.streak,
      formulasViewed: 8,
      simulationsPassed: 2,
      modesExplored: 3,
      favoritesCount: stats.favoritesCount,
      nightStudy: true,
      maxCorrectStreak: 7,
    });
  }, [stats]);

  return (
    <div className="min-h-[100dvh] bg-navy-900 pb-24">
      <OverallScore stats={stats} />
      <WeeklyChart />
      <TopicPerformance topicBreakdown={stats.topicBreakdown} />
      <StudyStreak streak={stats.streak} />
      <BadgesCollection badgeList={badgeList} />
      <AchievementsSection />
    </div>
  );
}

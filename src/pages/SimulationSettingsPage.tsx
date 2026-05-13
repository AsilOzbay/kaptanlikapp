import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import {
  ChevronLeft,
  Info,
  Globe,
  Anchor,
  Package,
  FileCheck,
  Ruler,
  Calculator,
  Play,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  loadSettings,
  saveSettings,
  createSimulationState,
} from '@/hooks/useSimulation';
import type { SimulationSettings, Question } from '@/hooks/useSimulation';

const TOPICS: Array<{
  id: string;
  name: string;
  description: string;
  count: string;
  icon: React.ReactNode;
}> = [
  { id: 'all', name: 'Tum Konular', description: 'Tum konulardan karma sorular', count: '50+ soru', icon: <Globe className="w-5 h-5" /> },
  { id: 'stab_2024_02', name: 'Subat 2024 Stabilite', description: 'Stabilite ve metasentrik yukseklik', count: '50 soru', icon: <Anchor className="w-5 h-5" /> },
  { id: 'yuk', name: 'Yuk Islemleri', description: 'Yukleme, bosaltma ve denge', count: '30 soru', icon: <Package className="w-5 h-5" /> },
  { id: 'solas', name: 'SOLAS Belgeleri', description: 'SOLAS, MARPOL, STCW', count: '40 soru', icon: <FileCheck className="w-5 h-5" /> },
  { id: 'boyut', name: 'Gemi Boyutlari', description: 'Gemi olculeri ve kisaltmalar', count: '35 soru', icon: <Ruler className="w-5 h-5" /> },
  { id: 'dwt', name: 'Deadweight Hesaplamalari', description: 'Deadweight ton hesaplamalari', count: '25 soru', icon: <Calculator className="w-5 h-5" /> },
];

const COUNT_OPTIONS = [10, 20, 30, 50];
const DURATION_PRESETS = [15, 30, 45, 60, 90];

export default function SimulationSettingsPage() {
  const [, navigate] = useLocation();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [topic, setTopic] = useState('stab_2024_02');
  const [questionCount, setQuestionCount] = useState(20);
  const [duration, setDuration] = useState(30);
  const [difficultyAll, setDifficultyAll] = useState(true);
  const [difficulty, setDifficulty] = useState<'kolay' | 'orta' | 'zor'>('orta');
  const [showInfo, setShowInfo] = useState(false);
  const [recent, setRecent] = useState<Array<{
    id: string; topic: string; score: number; count: number; duration: number; date: string; completed: boolean;
  }>>([]);

  // Load questions and saved settings
  useEffect(() => {
    fetch('/questions/questions_1_50.json')
      .then((r) => r.json())
      .then((data) => setQuestions(data.sorular || []))
      .catch(() => setQuestions([]));

    const saved = loadSettings();
    if (saved) {
      setTopic(saved.packageId);
      setQuestionCount(saved.questionCount);
      setDuration(saved.duration);
      if (saved.difficulty === 'all') {
        setDifficultyAll(true);
      } else {
        setDifficultyAll(false);
        setDifficulty(saved.difficulty as 'kolay' | 'orta' | 'zor');
      }
    }

    // Load recent simulations from localStorage
    try {
      const raw = localStorage.getItem('kaptanlik_recent_simulations');
      if (raw) setRecent(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const handleStart = useCallback(() => {
    if (!questions.length) return;
    const settings: SimulationSettings = {
      packageId: topic,
      packageName: TOPICS.find((t) => t.id === topic)?.name || topic,
      questionCount,
      duration,
      difficulty: difficultyAll ? 'all' : difficulty,
    };
    saveSettings(settings);
    createSimulationState(questions, settings);
    navigate('/simulation/exam');
  }, [questions, topic, questionCount, duration, difficultyAll, difficulty, navigate]);

  const perQuestion = (duration * 60) / questionCount;

  return (
    <div className="min-h-[100dvh] bg-navy-900">
      {/* Top App Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-navy-900/95 backdrop-blur-md border-b border-navy-700/30 flex items-center justify-between px-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-gray-100 hover:text-gold-400 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-base font-semibold text-white truncate">
          Simulasyon Ayarlari
        </h1>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-2 rounded-lg text-gray-400 hover:text-gold-400 hover:bg-navy-800 transition-colors relative"
          aria-label="Bilgi"
        >
          <Info className="w-5 h-5" />
          {showInfo && (
            <div className="absolute right-0 top-12 w-72 bg-navy-800 border border-navy-700 rounded-lg p-4 shadow-modal z-50">
              <p className="text-sm text-gray-100">
                Simulasyon modu gercek sinav kosullarini simule eder. Sure doldugunda cozum otomatik tamamlanir. Ilerlemeniz istatistiklerinize yansir.
              </p>
            </div>
          )}
        </button>
      </header>

      {/* Content */}
      <div className="pt-14 pb-28 px-4 max-w-xl mx-auto space-y-6">
        {/* Topic Selection */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-1">Konu Secimi</h2>
          <p className="text-sm text-gray-400 mb-3">Simulasyon yapmak istediginiz konuyu secin</p>
          <div className="space-y-2.5">
            {TOPICS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTopic(t.id)}
                className={cn(
                  'w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left',
                  topic === t.id
                    ? 'border-gold-500 bg-navy-800'
                    : 'border-navy-700 bg-navy-800/60 hover:border-navy-600'
                )}
              >
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                  topic === t.id ? 'bg-gold-500/20 text-gold-400' : 'bg-navy-700 text-gray-400'
                )}>
                  {t.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gold-500 bg-gold-500/10 px-2 py-1 rounded-full">
                    {t.count}
                  </span>
                  <div className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                    topic === t.id ? 'border-gold-500' : 'border-gray-600'
                  )}>
                    {topic === t.id && <div className="w-2.5 h-2.5 rounded-full bg-gold-500" />}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Question Count */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-1">Soru Sayisi</h2>
          <p className="text-sm text-gray-400 mb-3">Kac soru cozmek istiyorsunuz?</p>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {COUNT_OPTIONS.map((c) => (
              <button
                key={c}
                onClick={() => setQuestionCount(c)}
                className={cn(
                  'px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 shrink-0',
                  questionCount === c
                    ? 'bg-gold-500 text-navy-950 font-bold'
                    : 'bg-navy-800 border border-navy-700 text-gray-100 hover:border-navy-600'
                )}
              >
                {c}
              </button>
            ))}
            <button
              onClick={() => setQuestionCount(questions.length || 50)}
              className={cn(
                'px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 shrink-0',
                questionCount === (questions.length || 50)
                  ? 'bg-gold-500 text-navy-950 font-bold'
                  : 'bg-navy-800 border border-navy-700 text-gray-100 hover:border-navy-600'
              )}
            >
              Tum
            </button>
          </div>
        </section>

        {/* Duration */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-1">Sure (Dakika)</h2>
          <p className="text-sm text-gray-400 mb-3">Her soru icin ortalama sure otomatik hesaplanir</p>
          <div className="bg-navy-800 rounded-xl p-4 border border-navy-700/50">
            <p className="text-3xl font-bold text-gold-500 text-center mb-4">{duration} dk</p>
            <input
              type="range"
              min={10}
              max={120}
              step={5}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full h-2 bg-navy-700 rounded-full appearance-none cursor-pointer accent-gold-500"
              style={{
                background: `linear-gradient(to right, #D4A017 ${((duration - 10) / 110) * 100}%, #1B2E6B ${((duration - 10) / 110) * 100}%)`,
              }}
            />
            <div className="flex justify-between mt-2">
              <span className="text-xs text-gray-400">10 dk</span>
              <span className="text-xs text-gray-400">Soru basina ~{perQuestion.toFixed(0)} sn</span>
              <span className="text-xs text-gray-400">120 dk</span>
            </div>
            <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-hide">
              {DURATION_PRESETS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={cn(
                    'px-4 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0',
                    duration === d
                      ? 'bg-gold-500 text-navy-950'
                      : 'bg-navy-700 text-gray-300 hover:bg-navy-600'
                  )}
                >
                  {d} dk
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Difficulty */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">Zorluk Seviyesi</h2>
          <div className="flex items-center gap-3 bg-navy-800 rounded-xl p-4 border border-navy-700/50">
            <button
              onClick={() => setDifficultyAll(!difficultyAll)}
              className={cn(
                'w-12 h-6 rounded-full transition-all duration-200 relative shrink-0',
                difficultyAll ? 'bg-gold-500' : 'bg-navy-700'
              )}
            >
              <div className={cn(
                'w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all duration-200',
                difficultyAll ? 'left-6' : 'left-0.5'
              )} />
            </button>
            <span className="text-sm text-gray-100">Karma zorluk</span>
          </div>
          {!difficultyAll && (
            <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
              {(['kolay', 'orta', 'zor'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={cn(
                    'px-5 py-2 rounded-full text-sm font-semibold transition-all capitalize shrink-0',
                    difficulty === d
                      ? 'bg-gold-500 text-navy-950'
                      : 'bg-navy-800 border border-navy-700 text-gray-100 hover:border-navy-600'
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Recent Simulations */}
        {recent.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white">Son Simulasyonlar</h2>
              <button
                onClick={() => navigate('/stats')}
                className="text-xs text-gold-500 hover:text-gold-400 flex items-center gap-0.5"
              >
                Tumunu Gor <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-1">
              {recent.slice(0, 5).map((sim) => (
                <div
                  key={sim.id}
                  className="w-64 shrink-0 snap-start bg-navy-800 border border-navy-700 rounded-xl p-4"
                >
                  <p className="text-sm font-semibold text-white mb-1">{sim.topic}</p>
                  <p className={cn(
                    'text-2xl font-bold',
                    sim.score >= 70 ? 'text-green-400' : 'text-red-400'
                  )}>
                    {sim.score}%
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {sim.count} soru - {sim.duration} dk
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{sim.date}</p>
                  <span className={cn(
                    'inline-block mt-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full',
                    sim.completed
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-amber-500/20 text-amber-400'
                  )}>
                    {sim.completed ? 'Tamamlandi' : 'Yarim Kaldi'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Fixed Start Button */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-navy-950/95 to-transparent">
        <button
          onClick={handleStart}
          disabled={!questions.length}
          className={cn(
            'w-full h-14 bg-gold-500 text-navy-950 font-bold text-base rounded-xl flex items-center justify-center gap-2 shadow-glow hover:bg-gold-400 active:scale-[0.97] transition-all duration-100 disabled:opacity-40 disabled:cursor-not-allowed'
          )}
        >
          <Play className="w-5 h-5" />
          Simulasyonu Baslat
        </button>
      </div>
    </div>
  );
}

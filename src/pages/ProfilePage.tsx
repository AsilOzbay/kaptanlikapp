import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  Bell,
  Target,
  BarChart3,
  Globe,
  Palette,
  Info,
  LogOut,
  Trash2,
  ChevronRight,
  BookOpen,
  Award,
  Flame,
  
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

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

interface UserStats {
  totalSolved: number;
  accuracy: number;
  bestTopic: string;
}

function computeUserStats(): UserStats {
  const progress = getProgressFromStorage();
  let totalSolved = 0;
  let totalCorrect = 0;
  let bestTopic = 'Gemi Stabilitesi';
  let bestPct = 0;

  Object.entries(progress).forEach(([_pkgId, data]) => {
    const solved = data.solved || 0;
    const correct = data.correct || 0;
    totalSolved += solved;
    totalCorrect += correct;
    const pct = solved > 0 ? (correct / solved) * 100 : 0;
    if (pct > bestPct) {
      bestPct = pct;
      bestTopic = _pkgId;
    }
  });

  if (totalSolved === 0) {
    totalSolved = 247;
    totalCorrect = 193;
  }

  const accuracy = totalSolved > 0 ? Math.round((totalCorrect / totalSolved) * 100) : 0;

  // Map package key to Turkish name
  const topicNames: Record<string, string> = {
    stability: 'Gemi Stabilitesi',
    cargo: 'Yuk Islemleri',
    solas: 'SOLAS Belgeleri',
    dimensions: 'Gemi Boyutlari',
    deadweight: 'Deadweight Hes.',
    metacentric: 'Metasentrik Yks.',
    navigation: 'Seyir & Navigasyon',
  };

  return {
    totalSolved,
    accuracy,
    bestTopic: topicNames[bestTopic] || bestTopic,
  };
}

/* ──────────────────────── SECTION: ProfileHeader ──────────────────────── */
function ProfileHeader() {
  const { user } = useAuth();
  const initials = user?.displayName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'KA';
  const fullName = user?.displayName || 'Kaptan Adayi';
  const email = user?.email || 'kaptan@example.com';

  // Mock member since
  const memberSince = 'Ocak 2025';

  const stats = useMemo(() => computeUserStats(), []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: easeOut }}
      className="mx-4 mt-4 bg-navy-800 rounded-2xl p-6 shadow-card text-center"
    >
      {/* Avatar */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4, ease: easeSpring }}
        className="relative inline-block"
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold-500 to-gold-400 flex items-center justify-center border-[3px] border-gold-500">
          <span className="text-xl font-extrabold text-navy-950">{initials}</span>
        </div>
        {/* Edit icon */}
        <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-navy-800 border border-navy-700 flex items-center justify-center">
          <Lock className="w-3 h-3 text-gray-400" />
        </div>
      </motion.div>

      {/* Name */}
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1, ease: easeOut }}
        className="text-xl font-bold text-white mt-4"
      >
        {fullName}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="text-sm text-gray-400 mt-1"
      >
        {email}
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="text-xs text-gray-600 mt-1"
      >
        {memberSince}&apos;den beri uye
      </motion.p>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2, ease: easeOut }}
        className="flex items-center justify-center gap-6 mt-5"
      >
        <div className="text-center">
          <p className="text-base font-bold text-gold-500">{stats.totalSolved.toLocaleString('tr-TR')}</p>
          <p className="text-[11px] text-gray-400">soru</p>
        </div>
        <div className="w-px h-8 bg-navy-700" />
        <div className="text-center">
          <p className="text-base font-bold text-gold-500">%{stats.accuracy}</p>
          <p className="text-[11px] text-gray-400">basari</p>
        </div>
        <div className="w-px h-8 bg-navy-700" />
        <div className="text-center">
          <p className="text-base font-bold text-gold-500">12</p>
          <p className="text-[11px] text-gray-400">gun seri</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ──────────────────────── SECTION: SubscriptionCard ──────────────────────── */
function SubscriptionCard() {
  // Mock subscription state
  const [hasSubscription] = useState(true);
  const remainingDays = 12;
  const totalDays = 30;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2, ease: easeOut }}
      className="mx-4 mt-4 px-4"
    >
      <div
        className={`bg-navy-800 rounded-2xl p-5 border ${
          hasSubscription ? 'border-gold-500/60' : 'border-navy-700'
        } shadow-card`}
      >
        {hasSubscription ? (
          <>
            {/* Active Badge */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-white">Profesyonel Plan</h3>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-navy-950 bg-gold-500 uppercase tracking-wider">
                AKTIF
              </span>
            </div>
            <p className="text-2xl font-extrabold text-gold-500 mb-3">
              149 <span className="text-sm font-medium">&#8378; / ay</span>
            </p>
            <div className="space-y-1 mb-3">
              <p className="text-xs text-gray-400">Baslangic: 15 Ocak 2025</p>
              <p className="text-xs text-gray-400">Sonraki odeme: 15 Subat 2025</p>
              <p className="text-xs text-gold-500">Kalan gun: {remainingDays}</p>
            </div>
            {/* Progress */}
            <div className="mb-4">
              <div className="h-1.5 bg-navy-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(remainingDays / totalDays) * 100}%` }}
                  transition={{ duration: 0.6, ease: easeOut }}
                  className="h-full bg-gold-500 rounded-full"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">{remainingDays}/{totalDays} gun kaldi</p>
            </div>
            {/* Actions */}
            <div className="flex gap-3">
              <button className="flex-1 h-10 flex items-center justify-center border border-gold-500 text-gold-500 font-semibold text-sm rounded-lg hover:bg-gold-500/8 transition-colors">
                Plani Degistir
              </button>
              <button className="flex-1 h-10 flex items-center justify-center text-red-400 font-semibold text-sm rounded-lg hover:bg-red-500/5 transition-colors">
                Iptal Et
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-white">Baslangic Plani</h3>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white bg-green-500 uppercase tracking-wider">
                UCRETSIZ
              </span>
            </div>
            <div className="space-y-2 mb-4">
              <p className="text-xs text-red-400">10/10 soru cozuldu</p>
              <div className="h-1.5 bg-navy-700 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: '100%' }} />
              </div>
              <p className="text-xs text-red-400">2/2 simulasyon kullanildi</p>
              <div className="h-1.5 bg-navy-700 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
            <button className="w-full h-12 flex items-center justify-center bg-gold-500 text-navy-950 font-semibold text-sm rounded-lg hover:bg-gold-400 transition-colors shadow-glow active:scale-[0.97]">
              Profesyonel&apos;e Gec - 149 &#8378;/ay
            </button>
            <p className="text-xs text-gray-400 text-center mt-2">Istediginiz zaman iptal edin</p>
          </>
        )}
      </div>
    </motion.div>
  );
}

/* ──────────────────────── SECTION: Settings ──────────────────────── */
interface SettingRowProps {
  icon: typeof User;
  label: string;
  value?: string;
  iconColor?: string;
  onClick?: () => void;
  children?: React.ReactNode;
  delay?: number;
}

function SettingRow({ icon: Icon, label, value, iconColor = 'text-gold-500', onClick, children, delay = 0 }: SettingRowProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.3 + delay * 0.05, ease: easeOut }}
      whileTap={{ scale: 0.98, backgroundColor: 'rgba(27, 46, 107, 0.5)' }}
      onClick={onClick}
      className="w-full flex items-center gap-3 bg-navy-800 rounded-xl p-4 text-left mb-2 transition-colors"
    >
      <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-100">{label}</p>
        {value && <p className="text-xs text-gray-400">{value}</p>}
      </div>
      {children || <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />}
    </motion.button>
  );
}

/* ──────────────────────── SWITCH COMPONENT ──────────────────────── */
function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
        checked ? 'bg-gold-500' : 'bg-navy-700'
      }`}
    >
      <motion.div
        animate={{ x: checked ? 20 : 2 }}
        transition={{ duration: 0.2, ease: easeOut }}
        className="absolute top-1 w-4 h-4 rounded-full bg-white"
      />
    </button>
  );
}

/* ──────────────────────── MODAL: Logout Confirmation ──────────────────────── */
function LogoutModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center px-4"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm" onClick={onClose} />
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.3, ease: easeOut }}
        className="relative bg-navy-800 rounded-2xl p-6 max-w-sm w-full border border-navy-700 shadow-modal"
      >
        <h3 className="text-lg font-bold text-white mb-2">Cikis Yap?</h3>
        <p className="text-sm text-gray-100 mb-6">Oturumunuz kapatilacak.</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-10 flex items-center justify-center text-gray-100 font-semibold text-sm rounded-lg hover:bg-navy-700 transition-colors"
          >
            Iptal
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-10 flex items-center justify-center bg-red-500 text-white font-semibold text-sm rounded-lg hover:bg-red-400 transition-colors"
          >
            Cikis Yap
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ──────────────────────── MODAL: Delete Account ──────────────────────── */
function DeleteAccountModal({ onClose }: { onClose: () => void }) {
  const [confirmText, setConfirmText] = useState('');
  const canDelete = confirmText === 'SIL';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center px-4"
    >
      <div className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.3, ease: easeOut }}
        className="relative bg-navy-800 rounded-2xl p-6 max-w-sm w-full border border-red-500/30 shadow-modal"
      >
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-bold text-red-400">Hesabi Sil?</h3>
        </div>
        <p className="text-sm text-red-400 mb-2">
          Bu islem geri alinamaz. Tum verileriniz kalici olarak silinecektir.
        </p>
        <p className="text-xs text-gray-400 mb-3">
          Lutfen silmeyi onaylamak icin &apos;SIL&apos; yazin
        </p>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="SIL"
          className="w-full h-10 px-3 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-red-500 mb-4"
        />
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-10 flex items-center justify-center text-gray-100 font-semibold text-sm rounded-lg hover:bg-navy-700 transition-colors"
          >
            Iptal
          </button>
          <button
            disabled={!canDelete}
            onClick={onClose}
            className={`flex-1 h-10 flex items-center justify-center font-semibold text-sm rounded-lg transition-colors ${
              canDelete
                ? 'bg-red-500 text-white hover:bg-red-400'
                : 'bg-red-500/30 text-red-300 cursor-not-allowed'
            }`}
          >
            Hesabi Sil
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ──────────────────────── PROFILE PAGE ──────────────────────── */
export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dailyGoal, setDailyGoal] = useState(50);

  const stats = useMemo(() => computeUserStats(), []);

  const handleLogout = async () => {
    await signOut();
    setShowLogoutModal(false);
  };

  return (
    <div className="min-h-[100dvh] bg-navy-900 pb-24">
      {/* Profile Header */}
      <ProfileHeader />

      {/* Subscription */}
      <SubscriptionCard />

      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3, ease: easeOut }}
        className="mx-4 mt-4 px-4"
      >
        <div className="bg-navy-800 rounded-2xl p-4 shadow-card">
          <h3 className="text-base font-semibold text-white mb-3">Istatistik Ozeti</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <BookOpen className="w-4 h-4 text-gold-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{stats.totalSolved.toLocaleString('tr-TR')}</p>
              <p className="text-[11px] text-gray-400">Cozulen Soru</p>
            </div>
            <div className="text-center">
              <Award className="w-4 h-4 text-gold-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">%{stats.accuracy}</p>
              <p className="text-[11px] text-gray-400">D/Y Orani</p>
            </div>
            <div className="text-center">
              <Flame className="w-4 h-4 text-gold-500 mx-auto mb-1" />
              <p className="text-sm font-bold text-white leading-tight mt-1">{stats.bestTopic}</p>
              <p className="text-[11px] text-gray-400">En Basarili Konu</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Settings */}
      <div className="mx-4 mt-6 px-4 mb-8">
        {/* Hesap Group */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.35 }}
          className="text-xs font-semibold text-gray-400 uppercase tracking-[0.08em] mb-2"
        >
          Hesap
        </motion.p>
        <SettingRow icon={User} label="Ad Soyad" value={user?.displayName || 'Kaptan Adayi'} delay={0} />
        <SettingRow icon={Mail} label="E-posta" value={user?.email || ''} delay={1} />
        <SettingRow icon={Lock} label="Sifre Degistir" delay={2} />

        {/* Tercihler Group */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.5 }}
          className="text-xs font-semibold text-gray-400 uppercase tracking-[0.08em] mb-2 mt-6"
        >
          Tercihler
        </motion.p>
        <SettingRow icon={Bell} label="Bildirimler" delay={3}>
          <Switch checked={notifications} onChange={setNotifications} />
        </SettingRow>
        <SettingRow
          icon={Target}
          label="Gunluk Hedef"
          value={`${dailyGoal} soru`}
          delay={4}
          onClick={() => {
            const goals = [20, 30, 50, 75, 100];
            const next = goals[(goals.indexOf(dailyGoal) + 1) % goals.length];
            setDailyGoal(next);
          }}
        />
        <SettingRow icon={BarChart3} label="Zorluk Seviyesi" value="Karma" delay={5} />

        {/* Uygulama Group */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.65 }}
          className="text-xs font-semibold text-gray-400 uppercase tracking-[0.08em] mb-2 mt-6"
        >
          Uygulama
        </motion.p>
        <SettingRow icon={Globe} label="Dil" value="Turkce" delay={6} />
        <SettingRow
          icon={Palette}
          label="Tema"
          value={theme === 'dark' ? 'Koyu' : 'Acik'}
          delay={7}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        />
        <SettingRow icon={Info} label="Hakkinda" value="v1.0.0" delay={8} />

        {/* Danger Zone */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.8 }}
          className="text-xs font-semibold text-red-400 uppercase tracking-[0.08em] mb-2 mt-6"
        >
          Danger Zone
        </motion.p>
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.75, ease: easeOut }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowLogoutModal(true)}
          className="w-full flex items-center gap-3 bg-navy-800 rounded-xl p-4 text-left mb-2 hover:bg-navy-700/50 transition-colors"
        >
          <LogOut className="w-5 h-5 text-red-400 flex-shrink-0" />
          <span className="text-sm text-red-400 flex-1">Cikis Yap</span>
          <ChevronRight className="w-4 h-4 text-red-400/60 flex-shrink-0" />
        </motion.button>
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.8, ease: easeOut }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowDeleteModal(true)}
          className="w-full flex items-center gap-3 bg-navy-800 rounded-xl p-4 text-left hover:bg-navy-700/50 transition-colors"
        >
          <Trash2 className="w-5 h-5 text-red-400 flex-shrink-0" />
          <span className="text-sm text-red-400 flex-1">Hesabi Sil</span>
          <ChevronRight className="w-4 h-4 text-red-400/60 flex-shrink-0" />
        </motion.button>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showLogoutModal && (
          <LogoutModal onClose={() => setShowLogoutModal(false)} onConfirm={handleLogout} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showDeleteModal && (
          <DeleteAccountModal onClose={() => setShowDeleteModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

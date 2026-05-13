import { useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  ArrowLeft,
  Menu,
  X,
  ShieldCheck,
  Bell,
  TrendingUp,
  Plus,
  UserPlus,
  Trash2,
  AlertTriangle,
  PlusCircle,
  FileSpreadsheet,
  ChevronRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

/* ------------------------------------------------------------------ */
/*  NAV ITEM TYPE                                                       */
/* ------------------------------------------------------------------ */
interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
  { label: 'Sorular', icon: BookOpen, href: '/admin/questions' },
  { label: 'Kullanicilar', icon: Users, href: '/admin/users' },
  { label: 'Abonelikler', icon: CreditCard, href: '/admin/subscriptions' },
  { label: 'Istatistikler', icon: BarChart3, href: '#' },
  { label: 'Ayarlar', icon: Settings, href: '#' },
];

/* ------------------------------------------------------------------ */
/*  MOCK DATA                                                           */
/* ------------------------------------------------------------------ */
const activityData = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (29 - i));
  return {
    date: d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
    fullDate: d.toLocaleDateString('tr-TR'),
    users: Math.floor(Math.random() * 60) + 20,
  };
});

const recentActivities = [
  { id: 1, icon: Plus, color: 'text-green-500', bg: 'bg-green-500/10', text: 'Yeni soru eklendi', detail: 'Gemi Stabilitesi #1245', user: 'Admin', time: '5 dk once' },
  { id: 2, icon: UserPlus, color: 'text-blue-500', bg: 'bg-blue-500/10', text: 'Yeni kullanici kaydoldu', detail: 'mehmet@email.com', user: 'Sistem', time: '12 dk once' },
  { id: 3, icon: CreditCard, color: 'text-purple-500', bg: 'bg-purple-500/10', text: 'Yeni abonelik', detail: 'Profesyonel Plan', user: 'Ahmet Y.', time: '25 dk once' },
  { id: 4, icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10', text: 'Soru rapor edildi', detail: 'Soru #892', user: 'Selin D.', time: '1 saat once' },
  { id: 5, icon: Trash2, color: 'text-red-400', bg: 'bg-red-400/10', text: 'Soru silindi', detail: 'Gemi Boyutlari #456', user: 'Admin', time: '2 saat once' },
];

const quickActions = [
  { icon: PlusCircle, label: 'Soru Ekle', color: 'text-green-500', href: '/admin/questions' },
  { icon: Users, label: 'Kullanici Ara', color: 'text-blue-500', href: '/admin/users' },
  { icon: FileSpreadsheet, label: 'Toplu Yukle', color: 'text-purple-500', href: null },
  { icon: CreditCard, label: 'Abonelikler', color: 'text-gold-500', href: '/admin/subscriptions' },
];

/* ------------------------------------------------------------------ */
/*  SIDE NAV COMPONENT                                                  */
/* ------------------------------------------------------------------ */
function AdminSideNav({ currentPath, onNavigate }: { currentPath: string; onNavigate: (href: string) => void }) {
  return (
    <nav className="flex flex-col h-full py-4">
      <div className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const isActive = item.href === currentPath;
          return (
            <button
              key={item.label}
              onClick={() => item.href !== '#' && onNavigate(item.href)}
              className={
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 text-left ' +
                (isActive
                  ? 'bg-gold-500/10 text-gold-500 border-l-[3px] border-gold-500'
                  : 'text-gray-400 hover:bg-gold-500/5 hover:text-gray-100 border-l-[3px] border-transparent')
              }
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
      <div className="px-3 mt-auto pt-4 border-t border-navy-700/30">
        <button
          onClick={() => onNavigate('/')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:bg-gold-500/5 hover:text-gray-100 transition-all duration-150 text-left"
        >
          <ArrowLeft className="w-5 h-5 shrink-0" />
          <span>Uygulamaya Don</span>
        </button>
        <p className="mt-3 px-4 text-xs text-gray-600">Admin</p>
      </div>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  STATS CARD                                                          */
/* ------------------------------------------------------------------ */
interface StatCardProps {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  value: string;
  label: string;
  trend: string;
}

function StatCard({ icon: Icon, iconBg, iconColor, value, label, trend }: StatCardProps) {
  return (
    <div className="bg-navy-800 rounded-2xl p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <span className="flex items-center gap-1 text-xs font-medium text-green-400">
          <TrendingUp className="w-3.5 h-3.5" />
          {trend}
        </span>
      </div>
      <p className="mt-3 text-2xl font-extrabold text-white">{value}</p>
      <p className="mt-1 text-xs text-gray-400">{label}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CUSTOM CHART TOOLTIP                                                */
/* ------------------------------------------------------------------ */
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-navy-700 rounded-lg px-3 py-2 shadow-modal border border-navy-700">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-white">{payload[0].value} kullanici</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN PAGE                                                           */
/* ------------------------------------------------------------------ */
export default function AdminDashboardPage() {
  const [location, navigate] = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<'7' | '30' | '90'>('30');
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [notifCount] = useState(3);

  const handleNavigate = useCallback(
    (href: string) => {
      navigate(href);
      setMobileNavOpen(false);
    },
    [navigate]
  );

  const chartFiltered = activityData.slice(-parseInt(chartPeriod));

  const userInitials = 'AD';

  return (
    <div className="min-h-[100dvh] bg-navy-900">
      {/* ========== TOP BAR ========== */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-navy-900/90 backdrop-blur-md border-b border-navy-700/20 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-navy-800 transition-colors"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-gold-500" />
            <h1 className="text-base font-semibold text-white">Admin Panel</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-lg hover:bg-navy-800 transition-colors">
            <Bell className="w-5 h-5 text-gray-400" />
            {notifCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>
          <div className="w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center text-navy-950 text-xs font-bold">
            {userInitials}
          </div>
        </div>
      </header>

      {/* ========== MOBILE NAV DRAWER ========== */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-navy-950/80" onClick={() => setMobileNavOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-navy-800 border-r border-navy-700/20">
            <div className="flex items-center justify-between h-14 px-4 border-b border-navy-700/20">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-gold-500" />
                <span className="font-semibold text-white">Admin Panel</span>
              </div>
              <button onClick={() => setMobileNavOpen(false)} className="p-2 rounded-lg hover:bg-navy-700">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <AdminSideNav currentPath={location} onNavigate={handleNavigate} />
          </div>
        </div>
      )}

      {/* ========== LAYOUT ========== */}
      <div className="pt-14 lg:flex">
        {/* Desktop Side Nav */}
        <aside className="hidden lg:block fixed left-0 top-14 bottom-0 w-[240px] bg-navy-800 border-r border-navy-700/20 z-40">
          <AdminSideNav currentPath={location} onNavigate={handleNavigate} />
        </aside>

        {/* Content */}
        <main className="flex-1 lg:ml-[240px]">
          {/* Stats Cards */}
          <section className="p-4 sm:p-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={Users}
                iconBg="bg-blue-500/10"
                iconColor="text-blue-500"
                value="1,247"
                label="Toplam Kullanici"
                trend="+12% bu ay"

              />
              <StatCard
                icon={CreditCard}
                iconBg="bg-green-500/10"
                iconColor="text-green-500"
                value="342"
                label="Aktif Abone"
                trend="+8% bu ay"

              />
              <StatCard
                icon={BookOpen}
                iconBg="bg-gold-500/10"
                iconColor="text-gold-500"
                value="10,500"
                label="Toplam Soru"
                trend="+25 bu hafta"

              />
              <StatCard
                icon={TrendingUp}
                iconBg="bg-purple-500/10"
                iconColor="text-purple-500"
                value="50,958 &#8378;"
                label="Aylik Gelir"
                trend="+15% bu ay"

              />
            </div>
          </section>

          {/* Activity Chart */}
          <section className="px-4 sm:px-6 pb-4">
            <div className="bg-navy-800 rounded-2xl p-5 shadow-card">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                <h2 className="text-lg font-semibold text-white">Kullanici Aktivitesi</h2>
                <div className="flex gap-2">
                  {(['7', '30', '90'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setChartPeriod(p)}
                      className={
                        'px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ' +
                        (chartPeriod === p
                          ? 'bg-gold-500 text-navy-950'
                          : 'bg-navy-700 text-gray-100 hover:bg-navy-700/80')
                      }
                    >
                      {p} Gun
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartFiltered} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="areaGold" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(212, 160, 23, 0.2)" />
                        <stop offset="100%" stopColor="rgba(212, 160, 23, 0)" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(27, 46, 107, 0.3)" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: '#94A3B8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stroke="#D4A017"
                      strokeWidth={2}
                      fill="url(#areaGold)"
                      dot={false}
                      activeDot={{ r: 4, fill: '#D4A017', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-3 text-xs text-gray-400">
                Ortalama: {Math.round(chartFiltered.reduce((s, d) => s + d.users, 0) / chartFiltered.length)} yeni kullanici/gun
              </p>
            </div>
          </section>

          {/* Recent Activities */}
          <section className="px-4 sm:px-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Son Aktiviteler</h2>
              <button className="text-xs text-gold-500 hover:text-gold-400 font-medium flex items-center gap-1">
                Tumunu Gor <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-2">
              {recentActivities.map((act) => (
                <div
                  key={act.id}
                  className="bg-navy-800 rounded-xl p-4 flex items-start gap-3 transition-all duration-150 hover:bg-navy-800/80"
                >
                  <div className={`w-9 h-9 rounded-full ${act.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <act.icon className={`w-4 h-4 ${act.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{act.text}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{act.detail}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-500">{act.user}</span>
                      <span className="text-[10px] text-gray-600">&#9679;</span>
                      <span className="text-xs text-gray-600">{act.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Actions */}
          <section className="px-4 sm:px-6 pb-8">
            <h2 className="text-lg font-semibold text-white mb-4">Hizli Eylemler</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => {
                    if (action.href) {
                      navigate(action.href);
                    } else {
                      setImportModalOpen(true);
                    }
                  }}
                  className="bg-navy-800 border border-navy-700 rounded-2xl p-5 flex flex-col items-center gap-3 transition-all duration-200 hover:border-gold-500/40 hover:-translate-y-0.5"
                >
                  <action.icon className={`w-8 h-8 ${action.color}`} />
                  <span className="text-sm font-medium text-gray-100">{action.label}</span>
                </button>
              ))}
            </div>
          </section>
        </main>
      </div>

      {/* Bulk Import Modal */}
      <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
        <DialogContent className="bg-navy-800 border-navy-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-white">Toplu Soru Yukleme</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-100 mb-4">
            CSV veya Excel dosyasi yukleyin. Sablonu indirmek icin tiklayin.
          </p>
          <div className="border-2 border-dashed border-navy-700 rounded-xl h-[200px] flex flex-col items-center justify-center gap-3 hover:border-gold-500/50 transition-colors cursor-pointer">
            <FileSpreadsheet className="w-12 h-12 text-gray-400" />
            <p className="text-sm text-gray-400">Dosyayi surukle ve birak veya tikla</p>
            <p className="text-xs text-gray-600">.csv, .xlsx</p>
          </div>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1 bg-transparent border-navy-700 text-gray-100 hover:bg-navy-700 hover:text-white"
            >
              Sablon Indir
            </Button>
            <Button className="flex-1 bg-gold-500 text-navy-950 hover:bg-gold-400" disabled>
              Yukle
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

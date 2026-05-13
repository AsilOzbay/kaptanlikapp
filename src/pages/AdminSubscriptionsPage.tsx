import { useState, useMemo, useCallback } from 'react';
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
  Search,
  TrendingUp,
  UserPlus,
  UserMinus,
  Clock,
  Eye,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle,
  Edit3,
  
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
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';

/* ------------------------------------------------------------------ */
/*  TYPES                                                               */
/* ------------------------------------------------------------------ */
interface Subscription {
  id: string;
  user_name: string;
  user_email: string;
  plan: string;
  status: 'Aktif' | 'Iptal Edildi' | 'Suresi Doldu';
  started_at: string;
  next_payment: string;
  cancel_date?: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  period: 'Aylik' | 'Yillik';
  subscribers: number;
  revenue: string;
  status: 'Aktif' | 'Pasif';
  features: string[];
}

/* ------------------------------------------------------------------ */
/*  NAV DATA                                                            */
/* ------------------------------------------------------------------ */
const navItems = [
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
const revenueChartData = [
  { month: 'Oca', revenue: 42000 },
  { month: 'Sub', revenue: 45000 },
  { month: 'Mar', revenue: 43500 },
  { month: 'Nis', revenue: 48000 },
  { month: 'May', revenue: 46200 },
  { month: 'Haz', revenue: 51000 },
  { month: 'Tem', revenue: 49500 },
  { month: 'Agu', revenue: 54000 },
  { month: 'Eyl', revenue: 52000 },
  { month: 'Eki', revenue: 50958 },
  { month: 'Kas', revenue: 56000 },
  { month: 'Ara', revenue: 58000 },
];

const mockSubscriptions: Subscription[] = [
  { id: 'SUB-4821', user_name: 'Ahmet Yilmaz', user_email: 'ahmet@email.com', plan: 'Profesyonel', status: 'Aktif', started_at: '15 Kas 2024', next_payment: '15 Sub 2025' },
  { id: 'SUB-4820', user_name: 'Selin Demir', user_email: 'selin@email.com', plan: 'Profesyonel', status: 'Aktif', started_at: '1 Ara 2024', next_payment: '1 Sub 2025' },
  { id: 'SUB-4819', user_name: 'Can Yildiz', user_email: 'can@email.com', plan: 'Profesyonel', status: 'Iptal Edildi', started_at: '10 Ara 2024', next_payment: '10 Oca 2025', cancel_date: '10 Oca 2025' },
  { id: 'SUB-4818', user_name: 'Mehmet Kaya', user_email: 'mehmet@email.com', plan: 'Profesyonel', status: 'Aktif', started_at: '5 Oca 2025', next_payment: '5 Sub 2025' },
  { id: 'SUB-4817', user_name: 'Ayse Sahin', user_email: 'ayse@email.com', plan: 'Profesyonel', status: 'Aktif', started_at: '20 Ara 2024', next_payment: '20 Sub 2025' },
  { id: 'SUB-4816', user_name: 'Burak Ozdemir', user_email: 'burak@email.com', plan: 'Profesyonel', status: 'Aktif', started_at: '18 Ara 2024', next_payment: '18 Sub 2025' },
  { id: 'SUB-4815', user_name: 'Dilara Aydin', user_email: 'dilara@email.com', plan: 'Profesyonel', status: 'Suresi Doldu', started_at: '1 Eki 2024', next_payment: '1 Oca 2025' },
  { id: 'SUB-4814', user_name: 'Zeynep Arslan', user_email: 'zeynep@email.com', plan: 'Profesyonel', status: 'Aktif', started_at: '25 Ara 2024', next_payment: '25 Sub 2025' },
  { id: 'SUB-4813', user_name: 'Omer Polat', user_email: 'omer@email.com', plan: 'Profesyonel', status: 'Iptal Edildi', started_at: '15 Kas 2024', next_payment: '15 Oca 2025', cancel_date: '5 Oca 2025' },
  { id: 'SUB-4812', user_name: 'Kemal Yilmaz', user_email: 'kemal@email.com', plan: 'Profesyonel', status: 'Aktif', started_at: '1 Eyl 2024', next_payment: '1 Sub 2025' },
  { id: 'SUB-4811', user_name: 'Asli Erdem', user_email: 'asli@email.com', plan: 'Profesyonel', status: 'Aktif', started_at: '8 Oca 2025', next_payment: '8 Sub 2025' },
  { id: 'SUB-4810', user_name: 'Emre Karaca', user_email: 'emre@email.com', plan: 'Profesyonel', status: 'Suresi Doldu', started_at: '1 Eyl 2024', next_payment: '1 Ara 2024' },
  { id: 'SUB-4809', user_name: 'Elif Koc', user_email: 'elif@email.com', plan: 'Profesyonel', status: 'Iptal Edildi', started_at: '20 Eki 2024', next_payment: '20 Oca 2025', cancel_date: '15 Ara 2024' },
  { id: 'SUB-4808', user_name: 'Selma Tunc', user_email: 'selma@email.com', plan: 'Profesyonel', status: 'Aktif', started_at: '12 Oca 2025', next_payment: '12 Sub 2025' },
  { id: 'SUB-4807', user_name: 'Hasan Celik', user_email: 'hasan@email.com', plan: 'Profesyonel', status: 'Aktif', started_at: '30 Ara 2024', next_payment: '28 Sub 2025' },
];

const mockPlans: Plan[] = [
  {
    id: 'plan-pro',
    name: 'Profesyonel',
    price: 149,
    period: 'Aylik',
    subscribers: 342,
    revenue: '50,958',
    status: 'Aktif',
    features: ['Sinirsiz soru cozme', 'Sinirsiz simulasyon', 'Tum istatistikler'],
  },
  {
    id: 'plan-free',
    name: 'Baslangic',
    price: 0,
    period: 'Aylik',
    subscribers: 905,
    revenue: '0',
    status: 'Aktif',
    features: ['Gunluk 10 soru', '3 simulasyon/ay', 'Temel istatistikler'],
  },
];

/* ------------------------------------------------------------------ */
/*  SIDE NAV                                                            */
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
/*  REVENUE CARD                                                        */
/* ------------------------------------------------------------------ */
interface RevenueCardProps {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  value: string;
  label: string;
  trend: string;
  trendUp: boolean;
  note?: string;
}

function RevenueCard({ icon: Icon, iconBg, iconColor, value, label, trend, note }: RevenueCardProps) {
  return (
    <div className="bg-navy-800 rounded-2xl p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
      <p className="mt-3 text-2xl font-extrabold text-white">{value}</p>
      <p className="mt-1 text-xs text-gray-400">{label}</p>
      <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
        <TrendingUp className="w-3 h-3" />
        {trend}
      </p>
      {note && <p className="text-[10px] text-gray-500 mt-1">{note}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  STATUS DOT                                                          */
/* ------------------------------------------------------------------ */
function SubStatusDot({ status }: { status: string }) {
  const color =
    status === 'Aktif' ? 'bg-green-400' :
    status === 'Iptal Edildi' ? 'bg-red-400' :
    'bg-amber-400';
  return (
    <span className="flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full ${color}`} />
      <span className={`text-xs ${status === 'Aktif' ? 'text-green-400' : status === 'Iptal Edildi' ? 'text-red-400' : 'text-amber-400'}`}>
        {status}
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  CHART TOOLTIP                                                       */
/* ------------------------------------------------------------------ */
function RevenueTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-navy-700 rounded-lg px-3 py-2 shadow-modal border border-navy-700">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-white">{payload[0].value.toLocaleString()} &#8378;</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN PAGE                                                           */
/* ------------------------------------------------------------------ */
export default function AdminSubscriptionsPage() {
  const [location, navigate] = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  /* Period */
  const [period, setPeriod] = useState('Bu Ay');

  /* Tab */
  const [activeTab, setActiveTab] = useState<'Aktif' | 'Iptal Edildi' | 'Tumu'>('Aktif');

  /* Search */
  const [search, setSearch] = useState('');

  /* Pagination */
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  /* Cancel dialog */
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Subscription | null>(null);
  const [cancelReason, setCancelReason] = useState('Kullanici istegi');

  /* Detail modal */
  const [detailSub, setDetailSub] = useState<Subscription | null>(null);

  /* Derived */
  const tabFiltered = useMemo(() => {
    return mockSubscriptions.filter((s) => {
      const matchTab = activeTab === 'Tumu' || s.status === activeTab;
      const matchSearch = search === '' || s.user_name.toLowerCase().includes(search.toLowerCase()) || s.user_email.toLowerCase().includes(search.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [activeTab, search]);

  const totalPages = Math.ceil(tabFiltered.length / pageSize);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return tabFiltered.slice(start, start + pageSize);
  }, [tabFiltered, currentPage]);

  const tabCounts = useMemo(() => ({
    Aktif: mockSubscriptions.filter((s) => s.status === 'Aktif').length,
    'Iptal Edildi': mockSubscriptions.filter((s) => s.status === 'Iptal Edildi').length,
    Tumu: mockSubscriptions.length,
  }), []);

  /* Actions */
  const openCancel = useCallback((s: Subscription) => {
    setCancelTarget(s);
    setCancelDialogOpen(true);
  }, []);

  const handleCancel = useCallback(() => {
    setCancelDialogOpen(false);
    setCancelTarget(null);
  }, []);

  const handleNavigate = useCallback(
    (href: string) => {
      navigate(href);
      setMobileNavOpen(false);
    },
    [navigate]
  );

  const notifCount = 3;
  const userInitials = 'AD';

  return (
    <div className="min-h-[100dvh] bg-navy-900">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-navy-900/90 backdrop-blur-md border-b border-navy-700/20 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileNavOpen(true)} className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-navy-800 transition-colors">
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
            {notifCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
          </button>
          <div className="w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center text-navy-950 text-xs font-bold">
            {userInitials}
          </div>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
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

      {/* Layout */}
      <div className="pt-14 lg:flex">
        {/* Desktop Side Nav */}
        <aside className="hidden lg:block fixed left-0 top-14 bottom-0 w-[240px] bg-navy-800 border-r border-navy-700/20 z-40">
          <AdminSideNav currentPath={location} onNavigate={handleNavigate} />
        </aside>

        {/* Content */}
        <main className="flex-1 lg:ml-[240px]">
          {/* Page Header */}
          <section className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-white">Abonelik Yonetimi</h2>
              <p className="text-xs text-gray-400 mt-1">{tabCounts.Aktif} aktif abone</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-navy-800 rounded-full p-0.5">
                {['Bu Ay', 'Son 3 Ay', 'Bu Yil'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      period === p ? 'bg-gold-500 text-navy-950' : 'text-gray-100 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Revenue Cards */}
          <section className="px-4 sm:px-6 pb-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <RevenueCard
                icon={TrendingUp}
                iconBg="bg-purple-500/10"
                iconColor="text-purple-500"
                value="50,958 &#8378;"
                label="Aylik Tekrarlayan Gelir"
                trend="+15% onceki aya gore"
                trendUp
              />
              <RevenueCard
                icon={UserPlus}
                iconBg="bg-green-500/10"
                iconColor="text-green-500"
                value="48"
                label="Bu Ay Yeni Abone"
                trend="+12% onceki aya gore"
                trendUp
              />
              <RevenueCard
                icon={UserMinus}
                iconBg="bg-red-500/10"
                iconColor="text-red-500"
                value="5.2%"
                label="Aylik Iptal Orani"
                trend="-2.1% iyilesme"
                trendUp
                note="18 iptal / 342 aktif"
              />
              <RevenueCard
                icon={Clock}
                iconBg="bg-blue-500/10"
                iconColor="text-blue-500"
                value="4.2 ay"
                label="Ortalama Abonelik Suresi"
                trend="+0.3 ay"
                trendUp
              />
            </div>
          </section>

          {/* Revenue Chart */}
          <section className="px-4 sm:px-6 pb-4">
            <div className="bg-navy-800 rounded-2xl p-5 shadow-card">
              <h3 className="text-lg font-semibold text-white mb-4">Gelir Trendi</h3>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueChartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="areaGold2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(212, 160, 23, 0.15)" />
                        <stop offset="100%" stopColor="rgba(212, 160, 23, 0)" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(27, 46, 107, 0.3)" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: '#94A3B8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis hide />
                    <Tooltip content={<RevenueTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#D4A017"
                      strokeWidth={2}
                      fill="url(#areaGold2)"
                      dot={false}
                      activeDot={{ r: 4, fill: '#D4A017', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* Subscription Table */}
          <section className="px-4 sm:px-6 pb-4">
            <div className="bg-navy-800 rounded-2xl overflow-hidden shadow-card">
              {/* Header + Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-navy-700/20">
                <h3 className="text-base font-semibold text-white">Abonelikler</h3>
                <div className="flex flex-wrap gap-2">
                  <div className="flex bg-navy-900 rounded-full p-0.5">
                    {(['Aktif', 'Iptal Edildi', 'Tumu'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => { setActiveTab(t); setCurrentPage(1); }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          activeTab === t ? 'bg-gold-500 text-navy-950' : 'text-gray-100 hover:text-white'
                        }`}
                      >
                        {t === 'Aktif' ? `Aktif (${tabCounts.Aktif})` : t === 'Iptal Edildi' ? `Iptal Edildi (${tabCounts['Iptal Edildi']})` : `Tumu (${tabCounts.Tumu})`}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <Input
                      placeholder="E-posta ara..."
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                      className="pl-9 h-9 w-[200px] bg-navy-900 border-navy-700 text-white text-xs placeholder:text-gray-400 focus:border-gold-500 focus:ring-gold-500/15"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-navy-700/20 hover:bg-transparent">
                      <TableHead className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">ID</TableHead>
                      <TableHead className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Kullanici</TableHead>
                      <TableHead className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Plan</TableHead>
                      <TableHead className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Baslangic</TableHead>
                      <TableHead className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Sonraki Odeme</TableHead>
                      <TableHead className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Durum</TableHead>
                      <TableHead className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-right">Islemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.map((s) => (
                      <TableRow
                        key={s.id}
                        className="border-navy-700/20 hover:bg-gold-500/[0.03] transition-colors"
                      >
                        <TableCell className="text-xs text-gray-400 font-mono">{s.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium text-gray-100">{s.user_name}</p>
                            <p className="text-xs text-gray-400">{s.user_email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-gold-500/30 text-gold-400">
                            {s.plan}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-gray-400">{s.started_at}</TableCell>
                        <TableCell className="text-xs text-gray-400">
                          {s.status === 'Iptal Edildi' ? (
                            <span className="text-red-400">{s.cancel_date}</span>
                          ) : (
                            s.next_payment
                          )}
                        </TableCell>
                        <TableCell><SubStatusDot status={s.status} /></TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setDetailSub(s)}
                              className="p-1.5 rounded hover:bg-navy-700 text-gray-400 hover:text-blue-400 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {s.status === 'Aktif' && (
                              <button
                                onClick={() => openCancel(s)}
                                className="p-1.5 rounded hover:bg-navy-700 text-gray-400 hover:text-red-400 transition-colors"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Empty */}
              {paginated.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Search className="w-10 h-10 text-gray-600 mb-3" />
                  <p className="text-sm text-gray-400">Sonuc bulunamadi</p>
                </div>
              )}

              {/* Pagination */}
              {tabFiltered.length > 0 && (
                <div className="flex items-center justify-center gap-2 px-4 py-4 border-t border-navy-700/20">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-9 h-9 rounded-full bg-navy-800 flex items-center justify-center text-gray-100 disabled:opacity-30 hover:bg-navy-700 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page: number;
                    if (totalPages <= 5) page = i + 1;
                    else if (currentPage <= 3) page = i + 1;
                    else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                    else page = currentPage - 2 + i;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                          page === currentPage
                            ? 'bg-gold-500 text-navy-950'
                            : 'bg-navy-800 text-gray-100 hover:bg-navy-700'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-9 h-9 rounded-full bg-navy-800 flex items-center justify-center text-gray-100 disabled:opacity-30 hover:bg-navy-700 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <span className="ml-3 text-xs text-gray-400">
                    {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, tabFiltered.length)} / {tabFiltered.length.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Plan Management */}
          <section className="px-4 sm:px-6 pb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Plan Yonetimi</h3>
                <p className="text-xs text-gray-400 mt-0.5">Duzenlemek icin tiklayin</p>
              </div>
              <Button className="hidden sm:flex items-center gap-2 bg-gold-500 text-navy-950 hover:bg-gold-400 h-10 px-4 text-sm font-semibold">
                <Plus className="w-4 h-4" />
                Yeni Plan
              </Button>
            </div>
            <div className="space-y-3">
              {mockPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`bg-navy-800 rounded-2xl p-5 transition-all duration-200 ${
                    plan.id === 'plan-pro' ? 'border-2 border-gold-500' : 'border border-navy-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h4 className="text-lg font-semibold text-white">{plan.name}</h4>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          plan.status === 'Aktif' ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'
                        }`}>
                          {plan.status}
                        </span>
                        <span className="text-xl font-bold text-gold-500">{plan.price} &#8378;</span>
                        <span className="text-xs text-gray-400">/{plan.period.toLowerCase()}</span>
                      </div>
                      <div className="flex gap-6 mt-2 text-xs text-gray-400">
                        <span>Abone: <strong className="text-gray-100">{plan.subscribers} kullanici</strong></span>
                        <span>Gelir: <strong className="text-gray-100">{plan.revenue} &#8378;/ay</strong></span>
                      </div>
                      <ul className="mt-3 space-y-1">
                        {plan.features.map((f, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs text-gray-100">
                            <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="bg-transparent border-navy-700 text-gray-100 hover:bg-navy-700 hover:text-white text-xs h-8 px-3"
                      >
                        <Edit3 className="w-3.5 h-3.5 mr-1" />
                        Duzenle
                      </Button>
                      <Button
                        variant="outline"
                        className="bg-transparent border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs h-8 px-3"
                      >
                        Pasif Yap
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="h-8" />
        </main>
      </div>

      {/* Subscription Detail Modal */}
      <Dialog open={!!detailSub} onOpenChange={() => setDetailSub(null)}>
        <DialogContent className="bg-navy-800 border-navy-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-white">Abonelik Detayi</DialogTitle>
          </DialogHeader>
          {detailSub && (
            <div className="mt-2 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-500 to-gold-400 flex items-center justify-center text-navy-950 font-bold text-sm">
                  {detailSub.user_name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <p className="font-semibold text-white">{detailSub.user_name}</p>
                  <p className="text-xs text-gray-400">{detailSub.user_email}</p>
                </div>
              </div>
              <div className="bg-navy-900 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Plan</span>
                  <span className="text-gold-400 font-medium">{detailSub.plan}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Durum</span>
                  <SubStatusDot status={detailSub.status} />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Baslangic</span>
                  <span className="text-gray-100">{detailSub.started_at}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{detailSub.status === 'Iptal Edildi' ? 'Iptal Tarihi' : 'Sonraki Odeme'}</span>
                  <span className={detailSub.status === 'Iptal Edildi' ? 'text-red-400' : 'text-gray-100'}>
                    {detailSub.status === 'Iptal Edildi' ? detailSub.cancel_date : detailSub.next_payment}
                  </span>
                </div>
              </div>
              {detailSub.status === 'Aktif' && (
                <Button
                  onClick={() => { setDetailSub(null); openCancel(detailSub); }}
                  variant="outline"
                  className="w-full bg-transparent border-red-500 text-red-400 hover:bg-red-500/10"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Aboneligi Iptal Et
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="bg-navy-800 border-navy-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-white">Aboneligi Iptal Et?</DialogTitle>
          </DialogHeader>
          {cancelTarget && (
            <div className="mt-2">
              <p className="text-sm text-gray-100">
                {cancelTarget.user_name} adli kullanicinin aboneligi iptal edilecek. Kalan sure sonunda pasif olacak.
              </p>
              <div className="mt-4">
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Neden</label>
                <Select value={cancelReason} onValueChange={setCancelReason}>
                  <SelectTrigger className="h-11 bg-navy-900 border-navy-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-navy-900 border-navy-700">
                    {['Kullanici istegi', 'Odemesizlik', 'Kural ihlali', 'Diger'].map((r) => (
                      <SelectItem key={r} value={r} className="text-gray-100 focus:bg-navy-700 focus:text-white">{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <Switch />
                <span className="text-sm text-gray-100">Odeme iadesi yap</span>
              </div>
            </div>
          )}
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => { setCancelDialogOpen(false); setCancelTarget(null); }}
              className="flex-1 bg-transparent border-navy-700 text-gray-100 hover:bg-navy-700 hover:text-white"
            >
              Vazgec
            </Button>
            <Button
              onClick={handleCancel}
              className="flex-1 bg-red-500 text-white hover:bg-red-400 font-semibold"
            >
              Iptal Et
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

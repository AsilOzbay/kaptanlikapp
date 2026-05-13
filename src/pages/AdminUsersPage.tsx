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
  Eye,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Download,
  Mail,
  
  
  
  Award,
  
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

/* ------------------------------------------------------------------ */
/*  TYPES                                                               */
/* ------------------------------------------------------------------ */
interface AppUser {
  id: number;
  email: string;
  display_name: string;
  role: string;
  created_at: string;
  plan: 'Profesyonel' | 'Ucretsiz' | 'Iptal Edildi';
  status: 'Aktif' | 'Pasif' | 'Askiya Alindi';
  last_login: string;
  solved_count: number;
  success_rate: number;
  badges_earned: number;
  badges_total: number;
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
/*  MOCK USERS                                                          */
/* ------------------------------------------------------------------ */
const mockUsers: AppUser[] = [
  { id: 1024, email: 'ahmet@email.com', display_name: 'Ahmet Yilmaz', role: 'user', created_at: '2024-01-15', plan: 'Profesyonel', status: 'Aktif', last_login: '2 saat once', solved_count: 1247, success_rate: 78, badges_earned: 7, badges_total: 15 },
  { id: 1023, email: 'mehmet@email.com', display_name: 'Mehmet Kaya', role: 'user', created_at: '2024-02-01', plan: 'Ucretsiz', status: 'Aktif', last_login: '5 saat once', solved_count: 45, success_rate: 62, badges_earned: 2, badges_total: 15 },
  { id: 1022, email: 'selin@email.com', display_name: 'Selin Demir', role: 'user', created_at: '2024-01-20', plan: 'Profesyonel', status: 'Aktif', last_login: '1 gun once', solved_count: 892, success_rate: 85, badges_earned: 10, badges_total: 15 },
  { id: 1021, email: 'can@email.com', display_name: 'Can Yildiz', role: 'user', created_at: '2023-11-10', plan: 'Iptal Edildi', status: 'Pasif', last_login: '3 gun once', solved_count: 234, success_rate: 55, badges_earned: 4, badges_total: 15 },
  { id: 1020, email: 'ayse@email.com', display_name: 'Ayse Sahin', role: 'admin', created_at: '2024-03-05', plan: 'Profesyonel', status: 'Aktif', last_login: '12 dk once', solved_count: 567, success_rate: 71, badges_earned: 6, badges_total: 15 },
  { id: 1019, email: 'burak@email.com', display_name: 'Burak Ozdemir', role: 'user', created_at: '2024-02-14', plan: 'Profesyonel', status: 'Aktif', last_login: '1 saat once', solved_count: 1567, success_rate: 92, badges_earned: 12, badges_total: 15 },
  { id: 1018, email: 'elif@email.com', display_name: 'Elif Koc', role: 'content_editor', created_at: '2024-01-08', plan: 'Ucretsiz', status: 'Aktif', last_login: '30 dk once', solved_count: 89, success_rate: 68, badges_earned: 3, badges_total: 15 },
  { id: 1017, email: 'hasan@email.com', display_name: 'Hasan Celik', role: 'viewer', created_at: '2023-12-22', plan: 'Profesyonel', status: 'Askiya Alindi', last_login: '1 hafta once', solved_count: 12, success_rate: 40, badges_earned: 1, badges_total: 15 },
  { id: 1016, email: 'zeynep@email.com', display_name: 'Zeynep Arslan', role: 'user', created_at: '2024-03-10', plan: 'Profesyonel', status: 'Aktif', last_login: '3 saat once', solved_count: 345, success_rate: 74, badges_earned: 5, badges_total: 15 },
  { id: 1015, email: 'omer@email.com', display_name: 'Omer Polat', role: 'user', created_at: '2024-02-28', plan: 'Ucretsiz', status: 'Aktif', last_login: '6 saat once', solved_count: 67, success_rate: 58, badges_earned: 2, badges_total: 15 },
  { id: 1014, email: 'dilara@email.com', display_name: 'Dilara Aydin', role: 'user', created_at: '2024-01-25', plan: 'Profesyonel', status: 'Aktif', last_login: '4 saat once', solved_count: 789, success_rate: 81, badges_earned: 8, badges_total: 15 },
  { id: 1013, email: 'emre@email.com', display_name: 'Emre Karaca', role: 'user', created_at: '2024-03-01', plan: 'Ucretsiz', status: 'Aktif', last_login: '8 saat once', solved_count: 123, success_rate: 65, badges_earned: 3, badges_total: 15 },
  { id: 1012, email: 'selma@email.com', display_name: 'Selma Tunc', role: 'user', created_at: '2023-10-15', plan: 'Iptal Edildi', status: 'Pasif', last_login: '2 hafta once', solved_count: 456, success_rate: 70, badges_earned: 5, badges_total: 15 },
  { id: 1011, email: 'kemal@email.com', display_name: 'Kemal Yilmaz', role: 'admin', created_at: '2023-09-01', plan: 'Profesyonel', status: 'Aktif', last_login: '15 dk once', solved_count: 2345, success_rate: 95, badges_earned: 15, badges_total: 15 },
  { id: 1010, email: 'asli@email.com', display_name: 'Asli Erdem', role: 'user', created_at: '2024-02-10', plan: 'Profesyonel', status: 'Aktif', last_login: '2 gun once', solved_count: 678, success_rate: 79, badges_earned: 7, badges_total: 15 },
];

const roles = ['user', 'admin', 'content_editor', 'viewer'];

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
/*  PLAN BADGE                                                          */
/* ------------------------------------------------------------------ */
function PlanBadge({ plan }: { plan: string }) {
  const color =
    plan === 'Profesyonel' ? 'bg-gold-500/10 text-gold-400' :
    plan === 'Ucretsiz' ? 'bg-navy-700 text-gray-400' :
    'bg-red-500/10 text-red-400';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${color}`}>
      {plan}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  STATUS DOT                                                          */
/* ------------------------------------------------------------------ */
function StatusDot({ status }: { status: string }) {
  const color =
    status === 'Aktif' ? 'bg-green-400' :
    status === 'Pasif' ? 'bg-gray-400' :
    'bg-red-400';
  return (
    <span className="flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full ${color}`} />
      <span className={`text-xs ${status === 'Aktif' ? 'text-green-400' : status === 'Pasif' ? 'text-gray-400' : 'text-red-400'}`}>
        {status}
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  AVATAR                                                              */
/* ------------------------------------------------------------------ */
function UserAvatar({ name, size = 32 }: { name: string; size?: number }) {
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div
      className="rounded-full bg-gradient-to-br from-gold-500 to-gold-400 flex items-center justify-center text-navy-950 font-bold shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN PAGE                                                           */
/* ------------------------------------------------------------------ */
export default function AdminUsersPage() {
  const [location, navigate] = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  /* Filters */
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tum Durumlar');
  const [planFilter, setPlanFilter] = useState('Tum Planlar');
  const [roleFilter, setRoleFilter] = useState('Tum Roller');

  /* Pagination */
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  /* Drawer */
  const [drawerUser, setDrawerUser] = useState<AppUser | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  /* Suspend dialog */
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [suspendTarget, setSuspendTarget] = useState<AppUser | null>(null);
  const [suspendDuration, setSuspendDuration] = useState('Belirsiz');

  /* Role dialog */
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [roleTarget, setRoleTarget] = useState<AppUser | null>(null);
  const [selectedRole, setSelectedRole] = useState('');

  /* Derived */
  const filtered = useMemo(() => {
    return mockUsers.filter((u) => {
      const matchSearch =
        search === '' ||
        u.display_name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'Tum Durumlar' || u.status === statusFilter;
      const matchPlan = planFilter === 'Tum Planlar' || u.plan === planFilter;
      const matchRole = roleFilter === 'Tum Roller' || u.role === roleFilter;
      return matchSearch && matchStatus && matchPlan && matchRole;
    });
  }, [search, statusFilter, planFilter, roleFilter]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  /* Actions */
  const openDrawer = useCallback((u: AppUser) => {
    setDrawerUser(u);
    setDrawerOpen(true);
  }, []);

  const openSuspend = useCallback((u: AppUser) => {
    setSuspendTarget(u);
    setSuspendDialogOpen(true);
  }, []);

  const openRoleDialog = useCallback((u: AppUser) => {
    setRoleTarget(u);
    setSelectedRole(u.role);
    setRoleDialogOpen(true);
  }, []);

  const handleSuspend = useCallback(() => {
    setSuspendDialogOpen(false);
    setSuspendTarget(null);
  }, []);

  const handleRoleChange = useCallback(() => {
    setRoleDialogOpen(false);
    setRoleTarget(null);
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
          <section className="p-4 sm:p-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Kullanici Yonetimi</h2>
              <p className="text-xs text-gray-400 mt-1">{filtered.length.toLocaleString()} kullanici</p>
            </div>
            <Button
              variant="outline"
              className="hidden sm:flex items-center gap-2 bg-transparent border-navy-700 text-gray-100 hover:bg-navy-700 hover:text-white h-10 px-4 text-sm"
            >
              <Download className="w-4 h-4" />
              Disa Aktar
            </Button>
          </section>

          {/* Filter Bar */}
          <section className="px-4 sm:px-6 mb-4">
            <div className="flex flex-wrap gap-2.5">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Isim, e-posta ara..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  className="pl-10 h-10 bg-navy-800 border-navy-700 text-white placeholder:text-gray-400 focus:border-gold-500 focus:ring-gold-500/15"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-[140px] h-10 bg-navy-800 border-navy-700 text-gray-100 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-navy-800 border-navy-700">
                  {['Tum Durumlar', 'Aktif', 'Pasif', 'Askiya Alindi'].map((s) => (
                    <SelectItem key={s} value={s} className="text-gray-100 focus:bg-navy-700 focus:text-white">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={planFilter} onValueChange={(v) => { setPlanFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-[140px] h-10 bg-navy-800 border-navy-700 text-gray-100 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-navy-800 border-navy-700">
                  {['Tum Planlar', 'Profesyonel', 'Ucretsiz', 'Iptal Edildi'].map((p) => (
                    <SelectItem key={p} value={p} className="text-gray-100 focus:bg-navy-700 focus:text-white">{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-[140px] h-10 bg-navy-800 border-navy-700 text-gray-100 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-navy-800 border-navy-700">
                  {['Tum Roller', 'user', 'admin', 'content_editor', 'viewer'].map((r) => (
                    <SelectItem key={r} value={r} className="text-gray-100 focus:bg-navy-700 focus:text-white">{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          {/* User Table */}
          <section className="px-4 sm:px-6">
            <div className="bg-navy-800 rounded-2xl overflow-hidden shadow-card">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-navy-700/20 hover:bg-transparent">
                      <TableHead className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">ID</TableHead>
                      <TableHead className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Kullanici</TableHead>
                      <TableHead className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">E-posta</TableHead>
                      <TableHead className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Plan</TableHead>
                      <TableHead className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Durum</TableHead>
                      <TableHead className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Son Giris</TableHead>
                      <TableHead className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Soru</TableHead>
                      <TableHead className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-right">Islemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.map((u) => (
                      <TableRow
                        key={u.id}
                        className="border-navy-700/20 hover:bg-gold-500/[0.03] transition-colors cursor-pointer"
                        onClick={() => openDrawer(u)}
                      >
                        <TableCell className="text-xs text-gray-400 font-mono">#{u.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <UserAvatar name={u.display_name} size={32} />
                            <span className="text-sm font-medium text-gray-100">{u.display_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-gray-400">{u.email}</TableCell>
                        <TableCell><PlanBadge plan={u.plan} /></TableCell>
                        <TableCell><StatusDot status={u.status} /></TableCell>
                        <TableCell className="text-xs text-gray-400">{u.last_login}</TableCell>
                        <TableCell className="text-xs text-gray-400">{u.solved_count.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => openDrawer(u)} className="p-1.5 rounded hover:bg-navy-700 text-gray-400 hover:text-blue-400 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => openSuspend(u)} className="p-1.5 rounded hover:bg-navy-700 text-gray-400 hover:text-red-400 transition-colors">
                              <ShieldAlert className="w-4 h-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Empty state */}
              {paginated.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16">
                  <Search className="w-10 h-10 text-gray-600 mb-3" />
                  <p className="text-sm text-gray-400">Sonuc bulunamadi</p>
                </div>
              )}

              {/* Pagination */}
              {filtered.length > 0 && (
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
                    {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filtered.length)} / {filtered.length.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </section>

          <div className="h-8" />
        </main>
      </div>

      {/* User Detail Drawer */}
      {drawerOpen && drawerUser && (
        <div className="fixed inset-0 z-[70]">
          <div className="absolute inset-0 bg-navy-950/60" onClick={() => setDrawerOpen(false)} />
          {/* Desktop: right drawer, Mobile: bottom sheet */}
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-[420px] bg-navy-800 border-l border-navy-700 overflow-y-auto animate-in slide-in-from-right duration-300 lg:block hidden">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <UserAvatar name={drawerUser.display_name} size={64} />
                  <div>
                    <h3 className="text-xl font-bold text-white">{drawerUser.display_name}</h3>
                    <p className="text-sm text-gray-400 mt-0.5">{drawerUser.email}</p>
                    <p className="text-xs text-gray-500 mt-0.5 capitalize">Rol: {drawerUser.role}</p>
                  </div>
                </div>
                <button onClick={() => setDrawerOpen(false)} className="p-2 rounded-lg hover:bg-navy-700 transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="mt-6 space-y-3">
                {/* Plan Info */}
                <div className="bg-navy-900 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-400 mb-1">Mevcut Plan</p>
                  <p className="text-lg font-semibold text-gold-500">{drawerUser.plan}</p>
                  <p className="text-xs text-gray-400 mt-1">Sonraki odeme: 15 Subat</p>
                  <p className="text-xs text-gold-500 mt-1">12 gun kaldi</p>
                </div>

                {/* Activity */}
                <div className="bg-navy-900 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-400 mb-1">Toplam Soru Cozumu</p>
                  <p className="text-2xl font-bold text-white">{drawerUser.solved_count.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 mt-1">Basari Orani: {drawerUser.success_rate}%</p>
                  <p className="text-xs text-gray-400">Son Simulasyon: 2 gun once</p>
                </div>

                {/* Badges */}
                <div className="bg-navy-900 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-400 mb-1">Kazanilan Rozetler</p>
                  <p className="text-lg font-semibold text-gold-500">{drawerUser.badges_earned} / {drawerUser.badges_total}</p>
                  <div className="flex gap-1 mt-2">
                    {Array.from({ length: Math.min(drawerUser.badges_earned, 10) }).map((_, i) => (
                      <Award key={i} className="w-5 h-5 text-gold-500" />
                    ))}
                  </div>
                </div>

                {/* Account Info */}
                <div className="bg-navy-900 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-400 mb-1">Kayit Tarihi</p>
                  <p className="text-sm text-gray-100 mb-3">
                    {new Date(drawerUser.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-xs font-medium text-gray-400 mb-1">Son Giris</p>
                  <p className="text-sm text-gray-100">{drawerUser.last_login}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 space-y-2.5">
                <Button
                  onClick={() => openRoleDialog(drawerUser)}
                  variant="outline"
                  className="w-full bg-transparent border-gold-500 text-gold-500 hover:bg-gold-500/10"
                >
                  Rol Degistir
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-transparent border-navy-700 text-gray-100 hover:bg-navy-700 hover:text-white"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Kullaniciya Mesaj Gonder
                </Button>
                <Button
                  onClick={() => openSuspend(drawerUser)}
                  variant="outline"
                  className="w-full bg-transparent border-red-500 text-red-400 hover:bg-red-500/10"
                >
                  <ShieldAlert className="w-4 h-4 mr-2" />
                  Hesabi Askiya Al
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile bottom sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-navy-800 rounded-t-2xl border-t border-navy-700 max-h-[85vh] overflow-y-auto lg:hidden animate-in slide-in-from-bottom duration-300">
            <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mt-3" />
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <UserAvatar name={drawerUser.display_name} size={48} />
                  <div>
                    <h3 className="text-lg font-bold text-white">{drawerUser.display_name}</h3>
                    <p className="text-xs text-gray-400">{drawerUser.email}</p>
                  </div>
                </div>
                <button onClick={() => setDrawerOpen(false)} className="p-2 rounded-lg hover:bg-navy-700">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="mt-5 space-y-3">
                <div className="bg-navy-900 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-400 mb-1">Mevcut Plan</p>
                  <p className="text-lg font-semibold text-gold-500">{drawerUser.plan}</p>
                </div>
                <div className="bg-navy-900 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-400 mb-1">Toplam Soru Cozumu</p>
                  <p className="text-2xl font-bold text-white">{drawerUser.solved_count.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 mt-1">Basari Orani: {drawerUser.success_rate}%</p>
                </div>
                <div className="bg-navy-900 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-400 mb-1">Kazanilan Rozetler</p>
                  <p className="text-lg font-semibold text-gold-500">{drawerUser.badges_earned} / {drawerUser.badges_total}</p>
                </div>
              </div>

              <div className="mt-5 space-y-2.5 pb-4">
                <Button
                  onClick={() => openRoleDialog(drawerUser)}
                  variant="outline"
                  className="w-full bg-transparent border-gold-500 text-gold-500 hover:bg-gold-500/10"
                >
                  Rol Degistir
                </Button>
                <Button
                  onClick={() => openSuspend(drawerUser)}
                  variant="outline"
                  className="w-full bg-transparent border-red-500 text-red-400 hover:bg-red-500/10"
                >
                  Hesabi Askiya Al
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Dialog */}
      <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <DialogContent className="bg-navy-800 border-navy-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-white">Kullaniciyi Askiya Al?</DialogTitle>
          </DialogHeader>
          {suspendTarget && (
            <div className="mt-2">
              <p className="text-sm text-gray-100">
                {suspendTarget.display_name} adli kullanici hesabina erisemeyecek.
              </p>
              <div className="mt-4">
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Sure</label>
                <Select value={suspendDuration} onValueChange={setSuspendDuration}>
                  <SelectTrigger className="h-11 bg-navy-900 border-navy-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-navy-900 border-navy-700">
                    {['Belirsiz', '7 Gun', '30 Gun', '90 Gun'].map((d) => (
                      <SelectItem key={d} value={d} className="text-gray-100 focus:bg-navy-700 focus:text-white">{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => { setSuspendDialogOpen(false); setSuspendTarget(null); }}
              className="flex-1 bg-transparent border-navy-700 text-gray-100 hover:bg-navy-700 hover:text-white"
            >
              Iptal
            </Button>
            <Button
              onClick={handleSuspend}
              className="flex-1 bg-red-500 text-white hover:bg-red-400 font-semibold"
            >
              Askiya Al
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Role Change Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="bg-navy-800 border-navy-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-white">Rol Degistir</DialogTitle>
          </DialogHeader>
          {roleTarget && (
            <div className="mt-2">
              <p className="text-sm text-gray-100 mb-4">
                {roleTarget.display_name} icin yeni rol secin:
              </p>
              <div className="space-y-2">
                {roles.map((r) => (
                  <button
                    key={r}
                    onClick={() => setSelectedRole(r)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                      selectedRole === r
                        ? 'bg-gold-500/10 border border-gold-500'
                        : 'bg-navy-900 border border-navy-700 hover:border-gold-500/30'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedRole === r ? 'border-gold-500' : 'border-navy-600'
                    }`}>
                      {selectedRole === r && <div className="w-2.5 h-2.5 rounded-full bg-gold-500" />}
                    </div>
                    <span className={`text-sm font-medium capitalize ${selectedRole === r ? 'text-gold-400' : 'text-gray-100'}`}>
                      {r}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => { setRoleDialogOpen(false); setRoleTarget(null); }}
              className="flex-1 bg-transparent border-navy-700 text-gray-100 hover:bg-navy-700 hover:text-white"
            >
              Iptal
            </Button>
            <Button
              onClick={handleRoleChange}
              className="flex-1 bg-gold-500 text-navy-950 hover:bg-gold-400 font-semibold"
            >
              Kaydet
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

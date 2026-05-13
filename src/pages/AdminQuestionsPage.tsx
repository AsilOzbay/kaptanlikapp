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
  
  Pencil,
  Trash2,
  Eye,
  Plus,
  ChevronLeft,
  ChevronRight,
  
  Package,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

/* ------------------------------------------------------------------ */
/*  TYPES                                                               */
/* ------------------------------------------------------------------ */
interface Question {
  id: number;
  soru_no: string;
  konu: string;
  soru_metni: string;
  secenekler: string[];
  dogru_cevap: string;
  aciklama: string;
  formuller: string;
  zorluk: 'Kolay' | 'Orta' | 'Zor';
  status: 'Aktif' | 'Pasif' | 'Rapor Edildi';
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

const konular = ['Gemi Stabilitesi', 'Yuk Islemleri', 'SOLAS Belgeleri', 'Gemi Insasi', 'Seyir Bilgisi', 'Can Emniyeti'];
const zorluklar = ['Kolay', 'Orta', 'Zor'];
const dogruCevapOptions = ['A', 'B', 'C', 'D', 'E'];

/* ------------------------------------------------------------------ */
/*  MOCK QUESTIONS                                                      */
/* ------------------------------------------------------------------ */
const mockQuestions: Question[] = Array.from({ length: 85 }, (_, i) => {
  const id = i + 1;
  const z = zorluklar[i % 3] as 'Kolay' | 'Orta' | 'Zor';
  const statuses: Array<'Aktif' | 'Pasif' | 'Rapor Edildi'> = ['Aktif', 'Aktif', 'Aktif', 'Pasif', 'Rapor Edildi'];
  return {
    id,
    soru_no: `Q-${1000 + id}`,
    konu: konular[i % konular.length],
    soru_metni: `Bir geminin ${['enine', 'boyuna', 'dikey', 'donme', 'sallanma'][i % 5]} stabilitesi ile ilgili asagidaki ifadelerden hangisi dogrudur? Gemi yuku durumunda GM degeri hesaplanirken dikkate alinmasi gereken faktorler nelerdir?`,
    secenekler: [
      'GM = KM - KG formulu ile hesaplanir',
      'Sadece dis merkezlik etkisi goz onunde bulundurulur',
      'Serbest suzinti etkisi hesaba katilmaz',
      'Donme yarim capi sabit kabul edilir',
      'Gemi hizi stabilite hesaplamalarinda kullanilmaz',
    ],
    dogru_cevap: dogruCevapOptions[i % 5],
    aciklama: `Dogru cevap ${dogruCevapOptions[i % 5]} seceneginde verilmistir. GM degeri metasantr yuksekliginden agirlik merkezi yuksekliginin cikarilmasiyla bulunur.`,
    formuller: i % 3 === 0 ? 'GM = KM - KG' : '',
    zorluk: z,
    status: statuses[i % 5],
  };
});

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
/*  DIFFICULTY BADGE                                                    */
/* ------------------------------------------------------------------ */
function DifficultyBadge({ level }: { level: string }) {
  const color =
    level === 'Kolay' ? 'bg-green-500/10 text-green-400' :
    level === 'Orta' ? 'bg-amber-500/10 text-amber-400' :
    'bg-red-500/10 text-red-400';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${color}`}>
      {level}
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
/*  MAIN PAGE                                                           */
/* ------------------------------------------------------------------ */
export default function AdminQuestionsPage() {
  const [location, navigate] = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  /* Filters */
  const [search, setSearch] = useState('');
  const [konuFilter, setKonuFilter] = useState('Tum Konular');
  const [zorlukFilter, setZorlukFilter] = useState('Tum Zorluklar');
  const [statusFilter, setStatusFilter] = useState('Tum Durumlar');

  /* Pagination */
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  /* Selection */
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  /* Modal states */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Question | null>(null);
  const [viewQuestion, setViewQuestion] = useState<Question | null>(null);

  /* Form state */
  const [formData, setFormData] = useState<Partial<Question>>({
    konu: konular[0],
    zorluk: 'Orta',
    dogru_cevap: 'A',
    secenekler: ['', '', '', '', ''],
  });

  /* Derived */
  const filtered = useMemo(() => {
    return mockQuestions.filter((q) => {
      const matchSearch =
        search === '' ||
        q.soru_metni.toLowerCase().includes(search.toLowerCase()) ||
        q.konu.toLowerCase().includes(search.toLowerCase());
      const matchKonu = konuFilter === 'Tum Konular' || q.konu === konuFilter;
      const matchZorluk = zorlukFilter === 'Tum Zorluklar' || q.zorluk === zorlukFilter;
      const matchStatus = statusFilter === 'Tum Durumlar' || q.status === statusFilter;
      return matchSearch && matchKonu && matchZorluk && matchStatus;
    });
  }, [search, konuFilter, zorlukFilter, statusFilter]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const allSelectedOnPage = paginated.length > 0 && paginated.every((q) => selectedIds.has(q.id));

  /* Actions */
  const handleSelectAll = useCallback(() => {
    if (allSelectedOnPage) {
      const newSet = new Set(selectedIds);
      paginated.forEach((q) => newSet.delete(q.id));
      setSelectedIds(newSet);
    } else {
      const newSet = new Set(selectedIds);
      paginated.forEach((q) => newSet.add(q.id));
      setSelectedIds(newSet);
    }
  }, [allSelectedOnPage, paginated, selectedIds]);

  const handleSelectOne = useCallback(
    (id: number) => {
      const newSet = new Set(selectedIds);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setSelectedIds(newSet);
    },
    [selectedIds]
  );

  const openCreate = useCallback(() => {
    setFormData({
      konu: konular[0],
      zorluk: 'Orta',
      dogru_cevap: 'A',
      soru_metni: '',
      secenekler: ['', '', '', '', ''],
      aciklama: '',
      formuller: '',
      soru_no: '',
    });
    setModalMode('create');
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((q: Question) => {
    setFormData({ ...q });
    setModalMode('edit');
    setModalOpen(true);
  }, []);

  const openView = useCallback((q: Question) => {
    setViewQuestion(q);
  }, []);

  const confirmDelete = useCallback((q: Question) => {
    setDeleteTarget(q);
    setDeleteDialogOpen(true);
  }, []);

  const handleSave = useCallback(() => {
    // stub: save question
    setModalOpen(false);
  }, []);

  const handleDelete = useCallback(() => {
    // stub: delete question
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  }, []);

  const handleBulkDelete = useCallback(() => {
    // stub: bulk delete
    setSelectedIds(new Set());
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
              <h2 className="text-xl font-bold text-white">Soru Yonetimi</h2>
              <p className="text-xs text-gray-400 mt-1">{filtered.length.toLocaleString()} soru</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={openCreate}
                className="hidden sm:flex items-center gap-2 bg-gold-500 text-navy-950 hover:bg-gold-400 h-10 px-4 text-sm font-semibold"
              >
                <Plus className="w-4 h-4" />
                Soru Ekle
              </Button>
              <button
                onClick={openCreate}
                className="sm:hidden w-12 h-12 rounded-full bg-gold-500 flex items-center justify-center shadow-glow"
              >
                <Plus className="w-6 h-6 text-navy-950" />
              </button>
            </div>
          </section>

          {/* Filter Bar */}
          <section className="px-4 sm:px-6 mb-4">
            <div className="flex flex-wrap gap-2.5">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Soru ara..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  className="pl-10 h-10 bg-navy-800 border-navy-700 text-white placeholder:text-gray-400 focus:border-gold-500 focus:ring-gold-500/15"
                />
              </div>
              <Select value={konuFilter} onValueChange={(v) => { setKonuFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-[160px] h-10 bg-navy-800 border-navy-700 text-gray-100 text-xs">
                  <Package className="w-3.5 h-3.5 mr-1 text-gray-400" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-navy-800 border-navy-700">
                  <SelectItem value="Tum Konular" className="text-gray-100 focus:bg-navy-700 focus:text-white">Tum Konular</SelectItem>
                  {konular.map((k) => (
                    <SelectItem key={k} value={k} className="text-gray-100 focus:bg-navy-700 focus:text-white">{k}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={zorlukFilter} onValueChange={(v) => { setZorlukFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-[140px] h-10 bg-navy-800 border-navy-700 text-gray-100 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-navy-800 border-navy-700">
                  <SelectItem value="Tum Zorluklar" className="text-gray-100 focus:bg-navy-700 focus:text-white">Tum Zorluklar</SelectItem>
                  {zorluklar.map((z) => (
                    <SelectItem key={z} value={z} className="text-gray-100 focus:bg-navy-700 focus:text-white">{z}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-[140px] h-10 bg-navy-800 border-navy-700 text-gray-100 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-navy-800 border-navy-700">
                  <SelectItem value="Tum Durumlar" className="text-gray-100 focus:bg-navy-700 focus:text-white">Tum Durumlar</SelectItem>
                  {['Aktif', 'Pasif', 'Rapor Edildi'].map((s) => (
                    <SelectItem key={s} value={s} className="text-gray-100 focus:bg-navy-700 focus:text-white">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          {/* Bulk Actions Bar */}
          {selectedIds.size > 0 && (
            <section className="px-4 sm:px-6 mb-3">
              <div className="flex items-center justify-between bg-navy-800 border border-gold-500 rounded-xl px-4 py-3">
                <span className="text-sm font-medium text-gold-500">{selectedIds.size} soru secildi</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBulkDelete}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                    title="Secili sorulari sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedIds(new Set())}
                    className="p-2 rounded-lg hover:bg-navy-700 text-gray-400 transition-colors"
                    title="Secimi temizle"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Question Table */}
          <section className="px-4 sm:px-6">
            <div className="bg-navy-800 rounded-2xl overflow-hidden shadow-card">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-navy-700/20 hover:bg-transparent">
                      <TableHead className="w-[40px]">
                        <button
                          onClick={handleSelectAll}
                          className={`w-[18px] h-[18px] rounded border-2 flex items-center justify-center transition-colors ${
                            allSelectedOnPage ? 'bg-gold-500 border-gold-500' : 'border-navy-600'
                          }`}
                        >
                          {allSelectedOnPage && <Check className="w-3 h-3 text-white" />}
                        </button>
                      </TableHead>
                      <TableHead className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">ID</TableHead>
                      <TableHead className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Soru</TableHead>
                      <TableHead className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Konu</TableHead>
                      <TableHead className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Zorluk</TableHead>
                      <TableHead className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Durum</TableHead>
                      <TableHead className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-right">Islemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.map((q) => (
                      <TableRow
                        key={q.id}
                        className="border-navy-700/20 hover:bg-gold-500/[0.03] transition-colors cursor-pointer"
                        onClick={() => openView(q)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleSelectOne(q.id)}
                            className={`w-[18px] h-[18px] rounded border-2 flex items-center justify-center transition-colors ${
                              selectedIds.has(q.id) ? 'bg-gold-500 border-gold-500' : 'border-navy-600'
                            }`}
                          >
                            {selectedIds.has(q.id) && <Check className="w-3 h-3 text-white" />}
                          </button>
                        </TableCell>
                        <TableCell className="text-xs text-gray-400 font-mono">#{q.soru_no}</TableCell>
                        <TableCell>
                          <p className="text-sm text-gray-100 max-w-[320px] truncate" title={q.soru_metni}>
                            {q.soru_metni}
                          </p>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-gold-500/30 text-gold-400">
                            {q.konu}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DifficultyBadge level={q.zorluk} />
                        </TableCell>
                        <TableCell>
                          <StatusDot status={q.status} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => openView(q)} className="p-1.5 rounded hover:bg-navy-700 text-gray-400 hover:text-blue-400 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => openEdit(q)} className="p-1.5 rounded hover:bg-navy-700 text-gray-400 hover:text-gold-500 transition-colors">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => confirmDelete(q)} className="p-1.5 rounded hover:bg-navy-700 text-gray-400 hover:text-red-400 transition-colors">
                              <Trash2 className="w-4 h-4" />
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

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-navy-800 border-navy-700 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-white">
              {modalMode === 'create' ? 'Yeni Soru Ekle' : 'Soru Duzenle'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Konu & Zorluk */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Konu *</label>
                <Select value={formData.konu} onValueChange={(v) => setFormData({ ...formData, konu: v })}>
                  <SelectTrigger className="h-11 bg-navy-900 border-navy-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-navy-900 border-navy-700">
                    {konular.map((k) => (
                      <SelectItem key={k} value={k} className="text-gray-100 focus:bg-navy-700 focus:text-white">{k}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Zorluk *</label>
                <div className="flex gap-2">
                  {zorluklar.map((z) => (
                    <button
                      key={z}
                      onClick={() => setFormData({ ...formData, zorluk: z as Question['zorluk'] })}
                      className={`flex-1 h-11 rounded-lg text-sm font-medium transition-all ${
                        formData.zorluk === z
                          ? 'bg-gold-500 text-navy-950'
                          : 'bg-navy-900 border border-navy-700 text-gray-100 hover:border-gold-500/30'
                      }`}
                    >
                      {z}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Soru Metni */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Soru Metni *</label>
              <Textarea
                rows={4}
                placeholder="Soru metnini buraya yazin..."
                value={formData.soru_metni || ''}
                onChange={(e) => setFormData({ ...formData, soru_metni: e.target.value })}
                className="bg-navy-900 border-navy-700 text-white placeholder:text-gray-500 focus:border-gold-500 focus:ring-gold-500/15 resize-none"
              />
              <p className="text-right text-[10px] text-gray-500 mt-1">{(formData.soru_metni || '').length}/500</p>
            </div>

            {/* Secenekler */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Secenekler *</label>
              <div className="space-y-2">
                {dogruCevapOptions.map((letter, idx) => (
                  <div key={letter} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-navy-700 flex items-center justify-center text-sm font-semibold text-gray-100 shrink-0">
                      {letter}
                    </div>
                    <Input
                      placeholder={`${letter} secenegini yazin...`}
                      value={formData.secenekler?.[idx] || ''}
                      onChange={(e) => {
                        const newSec = [...(formData.secenekler || ['', '', '', '', ''])];
                        newSec[idx] = e.target.value;
                        setFormData({ ...formData, secenekler: newSec });
                      }}
                      className="flex-1 h-10 bg-navy-900 border-navy-700 text-white placeholder:text-gray-500 focus:border-gold-500 focus:ring-gold-500/15"
                    />
                    <button
                      onClick={() => setFormData({ ...formData, dogru_cevap: letter })}
                      className={`h-10 px-3 rounded-lg text-xs font-medium transition-all shrink-0 ${
                        formData.dogru_cevap === letter
                          ? 'bg-gold-500 text-navy-950'
                          : 'bg-navy-900 border border-navy-700 text-gray-400 hover:border-gold-500/30'
                      }`}
                    >
                      Dogru
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Aciklama */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Aciklama *</label>
              <Textarea
                rows={3}
                placeholder="Dogru cevabin aciklamasini yazin..."
                value={formData.aciklama || ''}
                onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
                className="bg-navy-900 border-navy-700 text-white placeholder:text-gray-500 focus:border-gold-500 focus:ring-gold-500/15 resize-none"
              />
            </div>

            {/* Formul */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Formul (istege bagli)</label>
              <Input
                placeholder="Orn: GM = KM - KG"
                value={formData.formuller || ''}
                onChange={(e) => setFormData({ ...formData, formuller: e.target.value })}
                className="h-10 bg-navy-900 border-navy-700 text-white placeholder:text-gray-500 font-mono focus:border-gold-500 focus:ring-gold-500/15"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-navy-700">
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
              className="flex-1 bg-transparent border-navy-700 text-gray-100 hover:bg-navy-700 hover:text-white"
            >
              Iptal
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-gold-500 text-navy-950 hover:bg-gold-400 font-semibold"
            >
              Kaydet
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Detail Modal */}
      <Dialog open={!!viewQuestion} onOpenChange={() => setViewQuestion(null)}>
        <DialogContent className="bg-navy-800 border-navy-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-white">Soru Detayi</DialogTitle>
          </DialogHeader>
          {viewQuestion && (
            <div className="space-y-4 mt-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-gray-400 font-mono">#{viewQuestion.soru_no}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-gold-500/30 text-gold-400">
                  {viewQuestion.konu}
                </span>
                <DifficultyBadge level={viewQuestion.zorluk} />
                <StatusDot status={viewQuestion.status} />
              </div>
              <div className="bg-navy-900 rounded-xl p-4">
                <p className="text-sm text-gray-100 font-medium">{viewQuestion.soru_metni}</p>
              </div>
              <div className="space-y-2">
                {viewQuestion.secenekler.map((s, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      dogruCevapOptions[i] === viewQuestion.dogru_cevap
                        ? 'border-green-500 bg-green-500/5'
                        : 'border-navy-700 bg-navy-900'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                        dogruCevapOptions[i] === viewQuestion.dogru_cevap
                          ? 'bg-green-500 text-white'
                          : 'bg-navy-700 text-gray-100'
                      }`}
                    >
                      {dogruCevapOptions[i]}
                    </div>
                    <span className={`text-sm ${dogruCevapOptions[i] === viewQuestion.dogru_cevap ? 'text-green-400 font-medium' : 'text-gray-100'}`}>
                      {s}
                    </span>
                    {dogruCevapOptions[i] === viewQuestion.dogru_cevap && (
                      <Check className="w-4 h-4 text-green-500 ml-auto" />
                    )}
                  </div>
                ))}
              </div>
              <div className="bg-navy-900 rounded-xl p-4">
                <p className="text-xs font-medium text-gray-400 mb-1">Aciklama</p>
                <p className="text-sm text-gray-100">{viewQuestion.aciklama}</p>
              </div>
              {viewQuestion.formuller && (
                <div className="bg-navy-900 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-400 mb-1">Formul</p>
                  <code className="text-sm text-gold-400 font-mono">{viewQuestion.formuller}</code>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => { setViewQuestion(null); openEdit(viewQuestion); }}
                  className="flex-1 bg-gold-500 text-navy-950 hover:bg-gold-400 font-semibold"
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Duzenle
                </Button>
                <Button
                  onClick={() => { setViewQuestion(null); confirmDelete(viewQuestion); }}
                  variant="outline"
                  className="flex-1 bg-transparent border-red-500 text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Sil
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-navy-800 border-navy-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-white">Soruyu Sil?</DialogTitle>
          </DialogHeader>
          {deleteTarget && (
            <div className="mt-2">
              <p className="text-sm text-gray-100">
                #{deleteTarget.soru_no} numarali soru kalici olarak silinecektir.
              </p>
              <p className="text-xs text-red-400 mt-2">Bu islem geri alinamaz.</p>
            </div>
          )}
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => { setDeleteDialogOpen(false); setDeleteTarget(null); }}
              className="flex-1 bg-transparent border-navy-700 text-gray-100 hover:bg-navy-700 hover:text-white"
            >
              Iptal
            </Button>
            <Button
              onClick={handleDelete}
              className="flex-1 bg-red-500 text-white hover:bg-red-400 font-semibold"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Sil
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

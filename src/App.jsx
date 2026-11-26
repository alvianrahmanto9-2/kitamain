import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Wallet,
  Heart,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Sparkles,
  Trash2,
  Edit3,
  ArrowRight,
  Copy,
  ExternalLink,
  RotateCcw,
  MapPin,
  Coffee,
  Film,
  ShoppingBag,
  MoreHorizontal,
  X,
  Check,
  TrendingDown,
  TrendingUp,
  User,
  Users,
  Filter,
  Cloud,
  HardDrive,
  Printer,
  Image as ImageIcon,
  FileText,
} from 'lucide-react';
import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';

// ============================================================================
// KONFIGURASI FIREBASE (Ganti dengan kredensial Firebase project Anda)
// ============================================================================

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyA4o4XsS-LUxR6uiSyHWM5mQJPHtIEb7v0",
  authDomain: "kitamain-couple.firebaseapp.com",
  projectId: "kitamain-couple",
  storageBucket: "kitamain-couple.firebasestorage.app",
  messagingSenderId: "1052275748482",
  appId: "1:1052275748482:web:cd166d85bfb00aaacb8e9b",
  measurementId: "G-6CCY92729D"
};

let db = null;
try {
  if (FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId) {
    const firebaseApp = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
    db = getFirestore(firebaseApp);
  }
} catch (error) {
  console.warn('Inisialisasi Firebase dilewati, beralih ke mode penyimpanan lokal:', error);
}

// ============================================================================
// KONSTANTA & DATA AWAL (SEED DATA)
// ============================================================================

const WORKSPACE_ID = 'couple-kitamain-rahasia-01';
const STORAGE_KEY = 'kitamain_app_state_v4';

const AVAILABLE_MONTHS = [
  { value: '2026-10', label: 'Oktober 2026' },
  { value: '2026-11', label: 'November 2026' },
  { value: '2026-12', label: 'Desember 2026' },
  { value: '2027-01', label: 'Januari 2027' },
];

const WEEKS = [
  { id: 1, label: 'Minggu 1', rangeHint: 'Tgl 1 – 7' },
  { id: 2, label: 'Minggu 2', rangeHint: 'Tgl 8 – 14' },
  { id: 3, label: 'Minggu 3', rangeHint: 'Tgl 15 – 21' },
  { id: 4, label: 'Minggu 4', rangeHint: 'Tgl 22 – 28' },
  { id: 5, label: 'Minggu 5', rangeHint: 'Tgl 29 – Akhir Bulan' },
];

const CATEGORIES = [
  { id: 'Wisata', label: 'Wisata', icon: MapPin, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { id: 'Staycation', label: 'Staycation', icon: Sparkles, color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  { id: 'Kuliner', label: 'Kuliner', icon: Coffee, color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 'Hiburan', label: 'Hiburan', icon: Film, color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { id: 'Belanja', label: 'Belanja', icon: ShoppingBag, color: 'bg-pink-100 text-pink-700 border-pink-200' },
  { id: 'Lainnya', label: 'Lainnya', icon: MoreHorizontal, color: 'bg-slate-100 text-slate-700 border-slate-200' },
];

const PRIORITIES = [
  { id: 'Tinggi', label: 'Prioritas Tinggi', color: 'bg-rose-100 text-rose-700 border-rose-200' },
  { id: 'Sedang', label: 'Prioritas Sedang', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 'Santai', label: 'Santai / Kapan-kapan', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
];

const INITIAL_STATE = {
  selectedMonth: '2026-11',
  budgets: {
    '2026-10': 1500000,
    '2026-11': 1500000,
    '2026-12': 2000000,
    '2027-01': 1500000,
  },
  plans: [
    // Data Oktober 2026 (untuk fitur Salin Bulan Lalu)
    {
      id: 'plan-oct-1',
      monthYear: '2026-10',
      weekNumber: 2,
      title: 'Belanja Bulanan & Jajan Es Krim',
      category: 'Belanja',
      estimatedCost: 250000,
      plannedDate: '2026-10-10',
      plannedTime: '10:00',
      status: 'completed',
      notes: 'Stok camilan rumah',
      isSpontaneous: false,
    },
    {
      id: 'plan-oct-2',
      monthYear: '2026-10',
      weekNumber: 4,
      title: 'Movie Date Akhir Pekan',
      category: 'Hiburan',
      estimatedCost: 160000,
      plannedDate: '2026-10-24',
      plannedTime: '19:30',
      status: 'completed',
      notes: 'Tiket + Popcorn Caramel',
      isSpontaneous: false,
    },
    // Data November 2026 (Bulan Berjalan)
    {
      id: 'plan-nov-1',
      monthYear: '2026-11',
      weekNumber: 2,
      title: 'Ngopi Sore & Beli Buku',
      category: 'Kuliner',
      estimatedCost: 150000,
      plannedDate: '2026-11-08',
      plannedTime: '16:00',
      status: 'completed',
      notes: 'Kopi susu gula aren + 1 novel istri',
      isSpontaneous: false,
    },
    {
      id: 'plan-nov-2',
      monthYear: '2026-11',
      weekNumber: 4,
      title: 'Nonton Bioskop Weekend',
      category: 'Hiburan',
      estimatedCost: 180000,
      plannedDate: '2026-11-28',
      plannedTime: '19:00',
      status: 'planned',
      notes: 'Nonton film baru + makan ringan',
      isSpontaneous: false,
    },
    {
      id: 'plan-nov-3',
      monthYear: '2026-11',
      weekNumber: 5,
      title: 'Dinner Anniversary',
      category: 'Kuliner',
      estimatedCost: 450000,
      plannedDate: '2026-11-30',
      plannedTime: '19:30',
      status: 'planned',
      notes: 'Reservasi meja dekat jendela',
      isSpontaneous: false,
    },
  ],
  expenses: [
    {
      id: 'exp-nov-1',
      planId: 'plan-nov-1',
      monthYear: '2026-11',
      weekNumber: 2,
      title: 'Ngopi Sore & Beli Buku',
      category: 'Kuliner',
      estimatedCost: 150000,
      actualCost: 135000,
      actualDate: '2026-11-08',
      paidBy: 'Rekening Bersama',
      notes: 'Dapat promo bundling kopi & croissant',
      isSpontaneous: false,
    },
  ],
  wishlists: [
    {
      id: 'wish-1',
      title: 'Kafe Rooftop Senja',
      category: 'Kuliner',
      estimatedCost: 200000,
      priority: 'Tinggi',
      referenceLink: 'https://maps.google.com',
      notes: 'Datang jam 16.30 biar dapat spot sunset terbaik',
      isScheduled: false,
    },
    {
      id: 'wish-2',
      title: 'Staycation Vila Pegunungan',
      category: 'Staycation',
      estimatedCost: 950000,
      priority: 'Sedang',
      referenceLink: 'https://instagram.com',
      notes: 'Tunggu promo weekday atau akhir tahun',
      isScheduled: false,
    },
    {
      id: 'wish-3',
      title: 'Piknik Sore di Kebun Raya',
      category: 'Wisata',
      estimatedCost: 85000,
      priority: 'Santai',
      referenceLink: '',
      notes: 'Bawa bekal buah & tikar sendiri',
      isScheduled: false,
    },
  ],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatRupiah = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

const formatDateShort = (dateStr) => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr + 'T00:00:00');
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
    }).format(date);
  } catch {
    return dateStr;
  }
};

const formatDayDateFull = (dateStr) => {
  if (!dateStr) return 'Tentatif';
  try {
    const date = new Date(dateStr + 'T00:00:00');
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
};

const getPreviousMonthKey = (currentMonthKey) => {
  const [year, month] = currentMonthKey.split('-').map(Number);
  if (month === 1) {
    return `${year - 1}-12`;
  }
  return `${year}-${String(month - 1).padStart(2, '0')}`;
};

const getWeekFromDateString = (dateStr) => {
  if (!dateStr) return 4;
  const day = Number(dateStr.split('-')[2]);
  if (!day || isNaN(day)) return 1;
  return Math.min(5, Math.ceil(day / 7));
};

// ============================================================================
// MAIN APPLICATION COMPONENT
// ============================================================================

export default function App() {
  const isFirebaseReady = Boolean(db);

  const [appState, setAppState] = useState(() => {
    if (isFirebaseReady) {
      return {
        selectedMonth: '2026-11',
        budgets: { '2026-11': 1500000 },
        plans: [],
        expenses: [],
        wishlists: [],
      };
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Gagal memuat data dari localStorage:', e);
    }
    return INITIAL_STATE;
  });

  const [isSyncing, setIsSyncing] = useState(isFirebaseReady);

  const [activeTab, setActiveTab] = useState('plans');
  const [toast, setToast] = useState(null);

  // Modal Edit Budget
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');

  // Modal Tambah Rencana Rutin
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [newPlanForm, setNewPlanForm] = useState({
    weekNumber: 1,
    title: '',
    category: 'Wisata',
    estimatedCost: '',
    plannedDate: '',
    plannedTime: '',
    notes: '',
  });

  // Modal Realisasi Pengeluaran (Linked dari Rencana Rutin atau Spontan)
  const [realizeModal, setRealizeModal] = useState({
    isOpen: false,
    isSpontaneous: false,
    planId: null,
    weekNumber: 4,
    title: '',
    category: 'Wisata',
    estimatedCost: 0,
    actualCost: '',
    actualDate: '2026-11-23',
    paidBy: 'Rekening Bersama',
    notes: '',
  });

  // Modal Tambah Wishlist
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const [newWishlistForm, setNewWishlistForm] = useState({
    title: '',
    category: 'Wisata',
    estimatedCost: '',
    priority: 'Tinggi',
    referenceLink: '',
    notes: '',
  });

  // Modal Promosi Wishlist -> Pilih Minggu Rencana
  const [promoteModal, setPromoteModal] = useState({
    isOpen: false,
    wish: null,
    weekNumber: 1,
  });

  // Filter Wishlist ('all' | 'affordable')
  const [wishlistFilter, setWishlistFilter] = useState('all');

  // Modal Cetak Jadwal Mingguan (PDF / Image)
  const [exportModal, setExportModal] = useState({
    isOpen: false,
    week: null,
  });
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);

  // Custom Confirmation Dialog
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Hapus',
    isDanger: true,
    onConfirm: null,
  });

  // Sinkronisasi Real-Time ke Firebase Firestore (Tanpa Login)
  useEffect(() => {
    if (!isFirebaseReady) return;

    setIsSyncing(true);
    const workspaceRef = doc(db, 'workspaces', WORKSPACE_ID);

    const unsubBudgets = onSnapshot(
      collection(workspaceRef, 'budgets'),
      (snapshot) => {
        const budgetsMap = {};
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          budgetsMap[docSnap.id] = Number(data.limitAmount) || 0;
        });
        setAppState((prev) => ({
          ...prev,
          budgets: { ...prev.budgets, ...budgetsMap },
        }));
        setIsSyncing(false);
      },
      (err) => {
        console.error('Error listener budgets:', err);
        setIsSyncing(false);
      }
    );

    const unsubPlans = onSnapshot(
      collection(workspaceRef, 'plans'),
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setAppState((prev) => ({ ...prev, plans: items }));
      },
      (err) => console.error('Error listener plans:', err)
    );

    const unsubExpenses = onSnapshot(
      collection(workspaceRef, 'expenses'),
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setAppState((prev) => ({ ...prev, expenses: items }));
      },
      (err) => console.error('Error listener expenses:', err)
    );

    const unsubWishlists = onSnapshot(
      collection(workspaceRef, 'wishlists'),
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setAppState((prev) => ({ ...prev, wishlists: items }));
      },
      (err) => console.error('Error listener wishlists:', err)
    );

    return () => {
      unsubBudgets();
      unsubPlans();
      unsubExpenses();
      unsubWishlists();
    };
  }, [isFirebaseReady]);

  // Fallback penyimpanan localStorage jika Firebase belum dikonfigurasi
  useEffect(() => {
    if (isFirebaseReady) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    } catch (e) {
      console.error('Gagal menyimpan data ke localStorage:', e);
    }
  }, [appState, isFirebaseReady]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  // ==========================================================================
  // KALKULASI BUDGET & DATA BULAN BERJALAN
  // ==========================================================================

  const currentMonth = appState.selectedMonth;
  const monthlyBudget = appState.budgets[currentMonth] ?? 1500000;

  const monthlyPlans = useMemo(
    () => appState.plans.filter((p) => p.monthYear === currentMonth),
    [appState.plans, currentMonth]
  );

  const monthlyExpenses = useMemo(
    () => appState.expenses.filter((e) => e.monthYear === currentMonth),
    [appState.expenses, currentMonth]
  );

  const totalEstimatedPlan = useMemo(
    () => monthlyPlans.reduce((sum, item) => sum + (Number(item.estimatedCost) || 0), 0),
    [monthlyPlans]
  );

  const totalActualExpense = useMemo(
    () => monthlyExpenses.reduce((sum, item) => sum + (Number(item.actualCost) || 0), 0),
    [monthlyExpenses]
  );

  const remainingSafeBudget = monthlyBudget - totalActualExpense;
  const remainingPlanBudget = monthlyBudget - totalEstimatedPlan;
  const usagePercentage = monthlyBudget > 0 ? Math.round((totalActualExpense / monthlyBudget) * 100) : 0;
  const planUsagePercentage = monthlyBudget > 0 ? Math.round((totalEstimatedPlan / monthlyBudget) * 100) : 0;
  const isPlanOverBudget = totalEstimatedPlan > monthlyBudget;

  const budgetStatus = useMemo(() => {
    if (usagePercentage >= 100) {
      return {
        label: 'Overbudget!',
        barColor: 'bg-rose-500',
        badgeBg: 'bg-rose-100 text-rose-700 border-rose-200',
      };
    }
    if (usagePercentage >= 75) {
      return {
        label: 'Waspada',
        barColor: 'bg-amber-500',
        badgeBg: 'bg-amber-100 text-amber-700 border-amber-200',
      };
    }
    return {
      label: 'Aman',
      barColor: 'bg-emerald-500',
      badgeBg: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    };
  }, [usagePercentage]);

  const displayedWishlists = useMemo(() => {
    if (wishlistFilter === 'affordable') {
      return appState.wishlists.filter((w) => (Number(w.estimatedCost) || 0) <= Math.max(0, remainingSafeBudget));
    }
    return appState.wishlists;
  }, [appState.wishlists, wishlistFilter, remainingSafeBudget]);

  // ==========================================================================
  // HANDLERS: BUDGET & RESET DEMO
  // ==========================================================================

  const handleOpenBudgetModal = () => {
    setBudgetInput(String(monthlyBudget));
    setIsBudgetModalOpen(true);
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    const parsed = Number(budgetInput);
    if (isNaN(parsed) || parsed < 0) return;

    if (isFirebaseReady) {
      try {
        const budgetDocRef = doc(db, 'workspaces', WORKSPACE_ID, 'budgets', currentMonth);
        await setDoc(
          budgetDocRef,
          { monthYear: currentMonth, limitAmount: parsed, updatedAt: Date.now() },
          { merge: true }
        );
        setIsBudgetModalOpen(false);
        showToast('Batas budget bulanan tersimpan ke cloud!');
      } catch (err) {
        console.error('Gagal menyimpan budget:', err);
        showToast('Gagal menyimpan budget ke Firestore.', 'warning');
      }
      return;
    }

    setAppState((prev) => ({
      ...prev,
      budgets: {
        ...prev.budgets,
        [currentMonth]: parsed,
      },
    }));
    setIsBudgetModalOpen(false);
    showToast('Batas budget bulanan diperbarui!');
  };

  const handleResetDemoData = () => {
    setConfirmDialog({
      isOpen: true,
      title: isFirebaseReady ? 'Isi Contoh Data Awal?' : 'Reset Data Demo?',
      message: isFirebaseReady
        ? 'Menambahkan contoh rencana, pengeluaran, dan wishlist awal ke workspace Firebase ini?'
        : 'Semua perubahan Anda akan dikembalikan ke data contoh awal (November 2026).',
      confirmText: isFirebaseReady ? 'Ya, Isi Contoh' : 'Ya, Reset Data',
      isDanger: !isFirebaseReady,
      onConfirm: async () => {
        if (isFirebaseReady) {
          try {
            const batch = writeBatch(db);
            Object.entries(INITIAL_STATE.budgets).forEach(([monthKey, limit]) => {
              batch.set(doc(db, 'workspaces', WORKSPACE_ID, 'budgets', monthKey), {
                monthYear: monthKey,
                limitAmount: limit,
              });
            });
            INITIAL_STATE.plans.forEach((p) => {
              const { id, ...rest } = p;
              batch.set(doc(db, 'workspaces', WORKSPACE_ID, 'plans', id), {
                ...rest,
                createdAt: Date.now(),
              });
            });
            INITIAL_STATE.expenses.forEach((exp) => {
              const { id, ...rest } = exp;
              batch.set(doc(db, 'workspaces', WORKSPACE_ID, 'expenses', id), {
                ...rest,
                createdAt: Date.now(),
              });
            });
            INITIAL_STATE.wishlists.forEach((w) => {
              const { id, ...rest } = w;
              batch.set(doc(db, 'workspaces', WORKSPACE_ID, 'wishlists', id), {
                ...rest,
                createdAt: Date.now(),
              });
            });
            await batch.commit();
            setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
            showToast('Contoh data awal berhasil dikirim ke Firestore!');
          } catch (err) {
            console.error('Gagal seed data Firestore:', err);
            showToast('Gagal mengisi contoh data ke Firestore.', 'warning');
          }
          return;
        }

        localStorage.removeItem(STORAGE_KEY);
        setAppState(INITIAL_STATE);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        showToast('Data demo berhasil dikembalikan ke awal.');
      },
    });
  };

  // ==========================================================================
  // HANDLERS: MENU 1 - RENCANA RUTIN (PER MINGGU + JAM)
  // ==========================================================================
  const openAddPlanModal = (defaultWeek = 1) => {
    setNewPlanForm({
      weekNumber: defaultWeek,
      title: '',
      category: 'Wisata',
      estimatedCost: '',
      plannedDate: '',
      plannedTime: '',
      notes: '',
    });
    setIsPlanModalOpen(true);
  };

  const handleAddPlan = async (e) => {
    e.preventDefault();
    if (!newPlanForm.title.trim()) return;

    const selectedWeek = Number(newPlanForm.weekNumber) || 1;
    const planPayload = {
      monthYear: currentMonth,
      weekNumber: selectedWeek,
      title: newPlanForm.title.trim(),
      category: newPlanForm.category,
      estimatedCost: Number(newPlanForm.estimatedCost) || 0,
      plannedDate: newPlanForm.plannedDate || '',
      plannedTime: newPlanForm.plannedTime || '',
      status: 'planned',
      notes: newPlanForm.notes.trim(),
      isSpontaneous: false,
      createdAt: Date.now(),
    };

    if (isFirebaseReady) {
      try {
        await addDoc(collection(db, 'workspaces', WORKSPACE_ID, 'plans'), planPayload);
        setNewPlanForm({
          weekNumber: 1,
          title: '',
          category: 'Wisata',
          estimatedCost: '',
          plannedDate: '',
          plannedTime: '',
          notes: '',
        });
        setIsPlanModalOpen(false);
        showToast(`Rencana ditambahkan ke Minggu ${selectedWeek}!`);
      } catch (err) {
        console.error('Gagal menambah rencana:', err);
        showToast('Gagal menyimpan rencana ke Firestore.', 'warning');
      }
      return;
    }

    const createdPlan = {
      id: `plan-${Date.now()}`,
      ...planPayload,
    };

    setAppState((prev) => ({
      ...prev,
      plans: [createdPlan, ...prev.plans],
    }));

    setNewPlanForm({
      weekNumber: 1,
      title: '',
      category: 'Wisata',
      estimatedCost: '',
      plannedDate: '',
      plannedTime: '',
      notes: '',
    });
    setIsPlanModalOpen(false);
    showToast(`Rencana ditambahkan ke Minggu ${selectedWeek}!`);
  };

  const handleCopyFromPreviousMonth = async () => {
    const prevMonth = getPreviousMonthKey(currentMonth);
    const prevPlans = appState.plans.filter((p) => p.monthYear === prevMonth && !p.isSpontaneous);

    if (prevPlans.length === 0) {
      showToast('Tidak ada rencana di bulan sebelumnya untuk disalin.', 'warning');
      return;
    }

    if (isFirebaseReady) {
      try {
        const batch = writeBatch(db);
        const plansCol = collection(db, 'workspaces', WORKSPACE_ID, 'plans');
        prevPlans.forEach((p) => {
          const newDocRef = doc(plansCol);
          batch.set(newDocRef, {
            monthYear: currentMonth,
            weekNumber: p.weekNumber || 1,
            title: p.title,
            category: p.category,
            estimatedCost: Number(p.estimatedCost) || 0,
            plannedDate: '',
            plannedTime: p.plannedTime || '',
            status: 'planned',
            notes: p.notes || '',
            isSpontaneous: false,
            createdAt: Date.now(),
          });
        });
        await batch.commit();
        showToast(`${prevPlans.length} rencana rutin disalin sesuai minggu masing-masing!`);
      } catch (err) {
        console.error('Gagal menyalin bulan lalu:', err);
        showToast('Gagal menyalin rencana bulan lalu.', 'warning');
      }
      return;
    }

    const copiedPlans = prevPlans.map((p, idx) => ({
      ...p,
      id: `plan-copy-${Date.now()}-${idx}`,
      monthYear: currentMonth,
      weekNumber: p.weekNumber || 1,
      plannedDate: '',
      status: 'planned',
    }));

    setAppState((prev) => ({
      ...prev,
      plans: [...copiedPlans, ...prev.plans],
    }));
    showToast(`${copiedPlans.length} rencana rutin disalin sesuai minggu masing-masing!`);
  };

  const handleDeletePlan = (plan) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Rencana Ini?',
      message: `Yakin ingin menghapus "${plan.title}"? Jika sudah tercatat di Pengeluaran Riil, data pengeluarannya juga akan ikut terhapus.`,
      confirmText: 'Hapus Rencana',
      isDanger: true,
      onConfirm: async () => {
        if (isFirebaseReady) {
          try {
            const batch = writeBatch(db);
            batch.delete(doc(db, 'workspaces', WORKSPACE_ID, 'plans', plan.id));
            const linkedExpenses = appState.expenses.filter((e) => e.planId === plan.id);
            linkedExpenses.forEach((exp) => {
              batch.delete(doc(db, 'workspaces', WORKSPACE_ID, 'expenses', exp.id));
            });
            await batch.commit();
            setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
            showToast('Rencana berhasil dihapus.');
          } catch (err) {
            console.error('Gagal menghapus rencana:', err);
            showToast('Gagal menghapus rencana.', 'warning');
          }
          return;
        }

        setAppState((prev) => ({
          ...prev,
          plans: prev.plans.filter((p) => p.id !== plan.id),
          expenses: prev.expenses.filter((e) => e.planId !== plan.id),
        }));
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        showToast('Rencana berhasil dihapus.');
      },
    });
  };

  // ==========================================================================
  // HANDLERS: LINKING RENCANA -> PENGELUARAN RIIL (MENU 2)
  // ==========================================================================
  const openRealizeFromPlan = (plan) => {
    setRealizeModal({
      isOpen: true,
      isSpontaneous: false,
      planId: plan.id,
      weekNumber: plan.weekNumber || 1,
      title: plan.title,
      category: plan.category,
      estimatedCost: Number(plan.estimatedCost) || 0,
      actualCost: String(plan.estimatedCost || ''),
      actualDate: plan.plannedDate || new Date().toISOString().split('T')[0],
      paidBy: 'Rekening Bersama',
      notes: plan.notes || '',
    });
  };

  const openSpontaneousExpenseModal = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    setRealizeModal({
      isOpen: true,
      isSpontaneous: true,
      planId: null,
      weekNumber: getWeekFromDateString(todayStr),
      title: '',
      category: 'Kuliner',
      estimatedCost: 0,
      actualCost: '',
      actualDate: todayStr,
      paidBy: 'Rekening Bersama',
      notes: '',
    });
  };

  const handleSubmitExpense = async (e) => {
    e.preventDefault();
    const actualAmount = Number(realizeModal.actualCost);
    if (isNaN(actualAmount) || actualAmount < 0) return;

    if (realizeModal.isSpontaneous) {
      if (!realizeModal.title.trim()) return;
      const targetWeek = Number(realizeModal.weekNumber) || getWeekFromDateString(realizeModal.actualDate);

      if (isFirebaseReady) {
        try {
          const batch = writeBatch(db);
          const shadowPlanRef = doc(collection(db, 'workspaces', WORKSPACE_ID, 'plans'));
          const expenseRef = doc(collection(db, 'workspaces', WORKSPACE_ID, 'expenses'));

          batch.set(shadowPlanRef, {
            monthYear: currentMonth,
            weekNumber: targetWeek,
            title: realizeModal.title.trim(),
            category: realizeModal.category,
            estimatedCost: actualAmount,
            plannedDate: realizeModal.actualDate,
            plannedTime: '',
            status: 'completed',
            notes: realizeModal.notes.trim(),
            isSpontaneous: true,
            createdAt: Date.now(),
          });

          batch.set(expenseRef, {
            planId: shadowPlanRef.id,
            monthYear: currentMonth,
            weekNumber: targetWeek,
            title: realizeModal.title.trim(),
            category: realizeModal.category,
            estimatedCost: actualAmount,
            actualCost: actualAmount,
            actualDate: realizeModal.actualDate,
            paidBy: realizeModal.paidBy,
            notes: realizeModal.notes.trim(),
            isSpontaneous: true,
            createdAt: Date.now(),
          });

          await batch.commit();
          showToast(`Pengeluaran dadakan dicatat (Minggu ${targetWeek})!`);
          setRealizeModal((prev) => ({ ...prev, isOpen: false }));
          setActiveTab('expenses');
        } catch (err) {
          console.error('Gagal menyimpan pengeluaran dadakan:', err);
          showToast('Gagal menyimpan pengeluaran dadakan.', 'warning');
        }
        return;
      }

      const generatedPlanId = `plan-spontan-${Date.now()}`;
      const shadowPlan = {
        id: generatedPlanId,
        monthYear: currentMonth,
        weekNumber: targetWeek,
        title: realizeModal.title.trim(),
        category: realizeModal.category,
        estimatedCost: actualAmount,
        plannedDate: realizeModal.actualDate,
        plannedTime: '',
        status: 'completed',
        notes: realizeModal.notes.trim(),
        isSpontaneous: true,
      };

      const newExpense = {
        id: `exp-${Date.now()}`,
        planId: generatedPlanId,
        monthYear: currentMonth,
        weekNumber: targetWeek,
        title: realizeModal.title.trim(),
        category: realizeModal.category,
        estimatedCost: actualAmount,
        actualCost: actualAmount,
        actualDate: realizeModal.actualDate,
        paidBy: realizeModal.paidBy,
        notes: realizeModal.notes.trim(),
        isSpontaneous: true,
      };

      setAppState((prev) => ({
        ...prev,
        plans: [shadowPlan, ...prev.plans],
        expenses: [newExpense, ...prev.expenses],
      }));

      showToast(`Pengeluaran dadakan dicatat (Minggu ${targetWeek})!`);
    } else {
      if (isFirebaseReady) {
        try {
          const batch = writeBatch(db);
          const planRef = doc(db, 'workspaces', WORKSPACE_ID, 'plans', realizeModal.planId);
          const expenseRef = doc(collection(db, 'workspaces', WORKSPACE_ID, 'expenses'));

          batch.update(planRef, { status: 'completed' });
          batch.set(expenseRef, {
            planId: realizeModal.planId,
            monthYear: currentMonth,
            weekNumber: realizeModal.weekNumber || 1,
            title: realizeModal.title,
            category: realizeModal.category,
            estimatedCost: Number(realizeModal.estimatedCost) || 0,
            actualCost: actualAmount,
            actualDate: realizeModal.actualDate,
            paidBy: realizeModal.paidBy,
            notes: realizeModal.notes.trim(),
            isSpontaneous: false,
            createdAt: Date.now(),
          });

          await batch.commit();
          showToast('Rencana terlaksana & masuk ke Pengeluaran Riil!');
          setRealizeModal((prev) => ({ ...prev, isOpen: false }));
          setActiveTab('expenses');
        } catch (err) {
          console.error('Gagal merealisasikan rencana:', err);
          showToast('Gagal menyimpan realisasi pengeluaran.', 'warning');
        }
        return;
      }

      const newExpense = {
        id: `exp-${Date.now()}`,
        planId: realizeModal.planId,
        monthYear: currentMonth,
        weekNumber: realizeModal.weekNumber || 1,
        title: realizeModal.title,
        category: realizeModal.category,
        estimatedCost: Number(realizeModal.estimatedCost) || 0,
        actualCost: actualAmount,
        actualDate: realizeModal.actualDate,
        paidBy: realizeModal.paidBy,
        notes: realizeModal.notes.trim(),
        isSpontaneous: false,
      };

      setAppState((prev) => ({
        ...prev,
        plans: prev.plans.map((p) =>
          p.id === realizeModal.planId ? { ...p, status: 'completed' } : p
        ),
        expenses: [newExpense, ...prev.expenses],
      }));

      showToast('Rencana terlaksana & masuk ke Pengeluaran Riil!');
    }

    setRealizeModal((prev) => ({ ...prev, isOpen: false }));
    setActiveTab('expenses');
  };

  const handleDeleteExpense = (expense) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Catatan Pengeluaran?',
      message: expense.isSpontaneous
        ? `Yakin ingin menghapus pengeluaran spontan "${expense.title}"?`
        : `Yakin ingin menghapus pengeluaran "${expense.title}"? Status di Rencana Rutin akan dikembalikan menjadi "Terjadwal".`,
      confirmText: 'Hapus Pengeluaran',
      isDanger: true,
      onConfirm: async () => {
        if (isFirebaseReady) {
          try {
            const batch = writeBatch(db);
            batch.delete(doc(db, 'workspaces', WORKSPACE_ID, 'expenses', expense.id));
            if (expense.planId) {
              const planRef = doc(db, 'workspaces', WORKSPACE_ID, 'plans', expense.planId);
              if (expense.isSpontaneous) {
                batch.delete(planRef);
              } else {
                batch.update(planRef, { status: 'planned' });
              }
            }
            await batch.commit();
            setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
            showToast('Pengeluaran dihapus & status rencana diperbarui.');
          } catch (err) {
            console.error('Gagal menghapus pengeluaran:', err);
            showToast('Gagal menghapus pengeluaran.', 'warning');
          }
          return;
        }

        setAppState((prev) => ({
          ...prev,
          expenses: prev.expenses.filter((e) => e.id !== expense.id),
          plans: expense.isSpontaneous
            ? prev.plans.filter((p) => p.id !== expense.planId)
            : prev.plans.map((p) =>
                p.id === expense.planId ? { ...p, status: 'planned' } : p
              ),
        }));
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        showToast('Pengeluaran dihapus & status rencana diperbarui.');
      },
    });
  };

  // ==========================================================================
  // HANDLERS: MENU 3 - WISHLIST & PROMOSI KE RENCANA
  // ==========================================================================

  const handleAddWishlist = async (e) => {
    e.preventDefault();
    if (!newWishlistForm.title.trim()) return;

    const wishPayload = {
      title: newWishlistForm.title.trim(),
      category: newWishlistForm.category,
      estimatedCost: Number(newWishlistForm.estimatedCost) || 0,
      priority: newWishlistForm.priority,
      referenceLink: newWishlistForm.referenceLink.trim(),
      notes: newWishlistForm.notes.trim(),
      isScheduled: false,
      createdAt: Date.now(),
    };

    if (isFirebaseReady) {
      try {
        await addDoc(collection(db, 'workspaces', WORKSPACE_ID, 'wishlists'), wishPayload);
        setNewWishlistForm({
          title: '',
          category: 'Wisata',
          estimatedCost: '',
          priority: 'Tinggi',
          referenceLink: '',
          notes: '',
        });
        setIsWishlistModalOpen(false);
        showToast('Ide baru ditambahkan ke Wishlist!');
      } catch (err) {
        console.error('Gagal menambah wishlist:', err);
        showToast('Gagal menyimpan wishlist.', 'warning');
      }
      return;
    }

    const newItem = {
      id: `wish-${Date.now()}`,
      ...wishPayload,
    };

    setAppState((prev) => ({
      ...prev,
      wishlists: [newItem, ...prev.wishlists],
    }));

    setNewWishlistForm({
      title: '',
      category: 'Wisata',
      estimatedCost: '',
      priority: 'Tinggi',
      referenceLink: '',
      notes: '',
    });
    setIsWishlistModalOpen(false);
    showToast('Ide baru ditambahkan ke Wishlist!');
  };

  const openPromoteWishlistModal = (wish) => {
    setPromoteModal({
      isOpen: true,
      wish,
      weekNumber: 1,
    });
  };

  const handleConfirmPromoteWishlist = async (e) => {
    e.preventDefault();
    const { wish, weekNumber } = promoteModal;
    if (!wish) return;

    const targetWeek = Number(weekNumber) || 1;
    const planPayload = {
      monthYear: currentMonth,
      weekNumber: targetWeek,
      title: wish.title,
      category: wish.category,
      estimatedCost: Number(wish.estimatedCost) || 0,
      plannedDate: '',
      plannedTime: '',
      status: 'planned',
      notes: wish.notes || '',
      isSpontaneous: false,
      fromWishlistId: wish.id,
      createdAt: Date.now(),
    };

    if (isFirebaseReady) {
      try {
        const batch = writeBatch(db);
        const newPlanRef = doc(collection(db, 'workspaces', WORKSPACE_ID, 'plans'));
        const wishRef = doc(db, 'workspaces', WORKSPACE_ID, 'wishlists', wish.id);

        batch.set(newPlanRef, planPayload);
        batch.update(wishRef, { isScheduled: true });

        await batch.commit();
        setPromoteModal({ isOpen: false, wish: null, weekNumber: 1 });
        showToast(`"${wish.title}" masuk ke Minggu ${targetWeek}!`);
        setActiveTab('plans');
      } catch (err) {
        console.error('Gagal menjadwalkan wishlist:', err);
        showToast('Gagal memindahkan wishlist ke rencana.', 'warning');
      }
      return;
    }

    const promotedPlan = {
      id: `plan-from-wish-${Date.now()}`,
      ...planPayload,
    };

    setAppState((prev) => ({
      ...prev,
      plans: [promotedPlan, ...prev.plans],
      wishlists: prev.wishlists.map((w) =>
        w.id === wish.id ? { ...w, isScheduled: true } : w
      ),
    }));

    setPromoteModal({ isOpen: false, wish: null, weekNumber: 1 });
    showToast(`"${wish.title}" masuk ke Minggu ${targetWeek}!`);
    setActiveTab('plans');
  };

  const handleDeleteWishlist = (wish) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Ide Wishlist?',
      message: `Yakin ingin menghapus "${wish.title}" dari daftar keinginan?`,
      confirmText: 'Hapus Wishlist',
      isDanger: true,
      onConfirm: async () => {
        if (isFirebaseReady) {
          try {
            await deleteDoc(doc(db, 'workspaces', WORKSPACE_ID, 'wishlists', wish.id));
            setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
            showToast('Item wishlist dihapus.');
          } catch (err) {
            console.error('Gagal menghapus wishlist:', err);
            showToast('Gagal menghapus item wishlist.', 'warning');
          }
          return;
        }

        setAppState((prev) => ({
          ...prev,
          wishlists: prev.wishlists.filter((w) => w.id !== wish.id),
        }));
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        showToast('Item wishlist dihapus.');
      },
    });
  };

  // ==========================================================================
  // HANDLERS: EXPORT & CETAK JADWAL MINGGUAN (IMAGE PNG & PDF PRINT)
  // ==========================================================================

  const handleDownloadWeeklyImage = async () => {
    if (!exportModal.week) return;
    setIsExportingImage(true);

    try {
      const week = exportModal.week;
      const weekPlans = monthlyPlans.filter((p) => (p.weekNumber || 1) === week.id);
      const monthLabel =
        AVAILABLE_MONTHS.find((m) => m.value === currentMonth)?.label || currentMonth;
      const totalWeekEst = weekPlans.reduce(
        (sum, item) => sum + (Number(item.estimatedCost) || 0),
        0
      );

      const scale = 2;
      const width = 820;
      const rowHeight = 64;
      const headerHeight = 165;
      const tableHeaderHeight = 46;
      const footerHeight = 95;
      const bodyRowsCount = Math.max(1, weekPlans.length);
      const height =
        headerHeight + tableHeaderHeight + bodyRowsCount * rowHeight + footerHeight;

      const canvas = document.createElement('canvas');
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext('2d');
      ctx.scale(scale, scale);

      // Background
      ctx.fillStyle = '#fff1f2';
      ctx.fillRect(0, 0, width, height);

      // Main Card Container
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#fecdd3';
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(24, 24, width - 48, height - 48, 24);
      } else {
        ctx.rect(24, 24, width - 48, height - 48);
      }
      ctx.fill();
      ctx.stroke();

      // Header Banner
      ctx.fillStyle = '#e11d48';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(24, 24, width - 48, 108, [24, 24, 0, 0]);
      } else {
        ctx.rect(24, 24, width - 48, 108);
      }
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(`KitaMain — Jadwal ${week.label}`, 52, 68);

      ctx.fillStyle = '#ffe4e6';
      ctx.font = '14px sans-serif';
      ctx.fillText(`${monthLabel} (${week.rangeHint}) • Quality Time Bareng`, 52, 96);

      // Table Header
      const tableTop = 152;
      const colX = {
        dayDate: 52,
        agenda: 245,
        time: 525,
        cost: 635,
      };

      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(40, tableTop, width - 80, tableHeaderHeight);

      ctx.fillStyle = '#475569';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('HARI / TANGGAL', colX.dayDate, tableTop + 28);
      ctx.fillText('AGENDA MAIN', colX.agenda, tableTop + 28);
      ctx.fillText('JAM', colX.time, tableTop + 28);
      ctx.fillText('ESTIMASI BIAYA', colX.cost, tableTop + 28);

      // Table Rows
      if (weekPlans.length === 0) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'italic 14px sans-serif';
        ctx.fillText(
          `Belum ada agenda main terjadwal untuk ${week.label}.`,
          52,
          tableTop + tableHeaderHeight + 38
        );
      } else {
        weekPlans.forEach((plan, index) => {
          const y = tableTop + tableHeaderHeight + index * rowHeight;

          // Row separator
          ctx.strokeStyle = '#f1f5f9';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(40, y + rowHeight);
          ctx.lineTo(width - 40, y + rowHeight);
          ctx.stroke();

          // Hari / Tanggal
          ctx.fillStyle = '#334155';
          ctx.font = '600 13px sans-serif';
          const dayDateText = formatDayDateFull(plan.plannedDate);
          ctx.fillText(dayDateText.slice(0, 24), colX.dayDate, y + 36);

          // Agenda Main + Kategori
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 14px sans-serif';
          const titleText =
            plan.title.length > 30 ? plan.title.slice(0, 29) + '…' : plan.title;
          ctx.fillText(titleText, colX.agenda, y + 29);

          ctx.fillStyle = '#e11d48';
          ctx.font = '600 11px sans-serif';
          ctx.fillText(plan.category, colX.agenda, y + 48);

          // Jam
          ctx.fillStyle = '#334155';
          ctx.font = '600 13px sans-serif';
          ctx.fillText(
            plan.plannedTime ? `${plan.plannedTime} WIB` : '-',
            colX.time,
            y + 36
          );

          // Estimasi Biaya
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 13px sans-serif';
          ctx.fillText(formatRupiah(plan.estimatedCost), colX.cost, y + 36);
        });
      }

      // Footer Total
      const footerTop = height - 82;
      ctx.fillStyle = '#fff1f2';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(40, footerTop, width - 80, 44, 12);
      } else {
        ctx.rect(40, footerTop, width - 80, 44);
      }
      ctx.fill();

      ctx.fillStyle = '#881337';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(`Total Estimasi ${week.label}:`, 56, footerTop + 27);

      ctx.fillStyle = '#e11d48';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(formatRupiah(totalWeekEst), colX.cost - 10, footerTop + 27);

      const fileName = `Jadwal-KitaMain-${week.label.replace(/\s+/g, '-')}-${currentMonth}.png`;
      const dataUrl = canvas.toDataURL('image/png');
      setGeneratedImageUrl(dataUrl);

      // 1. Prioritaskan Web Share API (Sangat optimal untuk iOS Safari / Add to Home Screen)
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (blob && navigator.canShare && navigator.share) {
        const file = new File([blob], fileName, { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: `Jadwal ${week.label} - KitaMain`,
            });
            showToast(`Jadwal ${week.label} siap disimpan / dibagikan!`);
            return;
          } catch (shareErr) {
            if (shareErr?.name === 'AbortError') return;
          }
        }
      }

      // 2. Fallback untuk browser desktop / Android standar
      const isIOS =
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

      if (!isIOS) {
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast(`Gambar jadwal ${week.label} berhasil diunduh!`);
      } else {
        showToast('Tekan & tahan gambar di bawah lalu pilih "Simpan ke Foto".');
      }
    } catch (err) {
      console.error('Gagal membuat gambar jadwal:', err);
      showToast('Gagal mengekspor gambar jadwal.', 'warning');
    } finally {
      setIsExportingImage(false);
    }
  };

  const handlePrintWeeklyPDF = () => {
    if (!exportModal.week) return;
    const isStandalone =
      window.navigator.standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches;

    // Pada mode Add to Home Screen iOS, window.open() diblokir sehingga gunakan window.print() langsung
    if (isStandalone) {
      window.print();
      return;
    }

    const week = exportModal.week;
    const weekPlans = monthlyPlans.filter((p) => (p.weekNumber || 1) === week.id);
    const monthLabel =
      AVAILABLE_MONTHS.find((m) => m.value === currentMonth)?.label || currentMonth;
    const totalWeekEst = weekPlans.reduce(
      (sum, item) => sum + (Number(item.estimatedCost) || 0),
      0
    );

    const rowsHtml =
      weekPlans.length === 0
        ? `<tr><td colspan="4" style="text-align:center;color:#94a3b8;padding:20px;">Belum ada agenda main terjadwal untuk ${week.label}.</td></tr>`
        : weekPlans
            .map(
              (plan) => `
          <tr>
            <td>${formatDayDateFull(plan.plannedDate)}</td>
            <td>
              <strong>${plan.title}</strong><br/>
              <span style="font-size:11px;color:#e11d48;">${plan.category}</span>
            </td>
            <td>${plan.plannedTime ? `${plan.plannedTime} WIB` : '-'}</td>
            <td style="text-align:right;font-weight:700;">${formatRupiah(plan.estimatedCost)}</td>
          </tr>`
            )
            .join('');

    const printWindow = window.open('', '_blank', 'width=800,height=650');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Jadwal ${week.label} - ${monthLabel} | KitaMain</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 32px; color: #1e293b; }
            .header { background: #e11d48; color: #fff; padding: 20px 24px; border-radius: 14px; margin-bottom: 20px; }
            .header h1 { margin: 0 0 4px 0; font-size: 20px; }
            .header p { margin: 0; font-size: 13px; opacity: 0.9; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background: #f8fafc; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; padding: 12px; border-bottom: 2px solid #e2e8f0; }
            td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; vertical-align: top; }
            .total-box { margin-top: 18px; background: #fff1f2; border: 1px solid #fecdd3; padding: 14px 18px; border-radius: 12px; display: flex; justify-content: space-between; font-weight: 700; color: #881337; }
            @media print { body { padding: 12px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>KitaMain — Rencana Main ${week.label}</h1>
            <p>${monthLabel} (${week.rangeHint}) • Quality Time Bareng</p>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width:26%;">Hari / Tanggal</th>
                <th style="width:38%;">Agenda Main</th>
                <th style="width:16%;">Jam</th>
                <th style="width:20%;text-align:right;">Estimasi Biaya</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <div class="total-box">
            <span>Total Estimasi ${week.label}</span>
            <span style="color:#e11d48;">${formatRupiah(totalWeekEst)}</span>
          </div>
          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const renderCategoryBadge = (categoryId) => {
    const found = CATEGORIES.find((c) => c.id === categoryId) || CATEGORIES[5];
    const Icon = found.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${found.color}`}>
        <Icon className="w-3 h-3" />
        {found.label}
      </span>
    );
  };

  // ==========================================================================
  // RENDER UI (MOBILE-FIRST CONTAINER)
  // ==========================================================================

  return (
    <div className="min-h-screen bg-stone-100 flex justify-center font-sans text-slate-800">
      <div className="w-full max-w-md bg-rose-50/30 min-h-screen flex flex-col shadow-2xl border-x border-rose-100 relative">
        
        {/* ====================================================================
            TOP STICKY HEADER & BUDGET MONITORING WIDGET
        ==================================================================== */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-rose-100 px-4 pt-3 pb-3.5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-sm">
                <Heart className="w-4 h-4 fill-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base font-bold tracking-tight text-slate-900 leading-none">
                    KitaMain
                  </h1>
                  {isFirebaseReady ? (
                    <span
                      title={`Terhubung Real-Time (${WORKSPACE_ID})`}
                      className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700"
                    >
                      <Cloud className="w-2.5 h-2.5" />
                      {isSyncing ? 'Sync...' : 'Live'}
                    </span>
                  ) : (
                    <span
                      title="Mode Lokal (Preview)"
                      className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600"
                    >
                      <HardDrive className="w-2.5 h-2.5" />
                      Lokal
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Quality Time & Budget Bareng</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <select
                aria-label="Pilih Bulan"
                value={currentMonth}
                onChange={(e) => setAppState((prev) => ({ ...prev, selectedMonth: e.target.value }))}
                className="text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-rose-400 cursor-pointer"
              >
                {AVAILABLE_MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>

              <button
                onClick={handleResetDemoData}
                title="Reset Data Demo"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-3.5 text-white shadow-md">
            <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-white/10">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                  Total Anggaran Bulan Ini
                </span>
                <span className="text-base font-extrabold text-white">
                  {formatRupiah(monthlyBudget)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${budgetStatus.badgeBg}`}>
                  {budgetStatus.label} ({usagePercentage}%)
                </span>
                <button
                  onClick={handleOpenBudgetModal}
                  className="inline-flex items-center gap-1 text-[11px] bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-lg transition-colors"
                >
                  <Edit3 className="w-3 h-3" />
                  Edit
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Kartu 1: Anggaran vs Rencana Main */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-semibold text-amber-200/90">
                      Sisa vs Rencana
                    </span>
                    <span className="text-[10px] font-bold text-slate-300">
                      {planUsagePercentage}%
                    </span>
                  </div>
                  <div
                    className={`text-sm sm:text-base font-extrabold tracking-tight mb-1.5 ${
                      remainingPlanBudget < 0 ? 'text-rose-400' : 'text-amber-300'
                    }`}
                  >
                    {formatRupiah(remainingPlanBudget)}
                  </div>
                </div>

                <div>
                  <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden mb-1.5">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        planUsagePercentage > 100
                          ? 'bg-rose-500'
                          : planUsagePercentage >= 80
                          ? 'bg-amber-400'
                          : 'bg-sky-400'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, planUsagePercentage))}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Terencana:</span>
                    <span className="font-semibold text-slate-200">
                      {formatRupiah(totalEstimatedPlan)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Kartu 2: Anggaran vs Pengeluaran Riil */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-semibold text-emerald-200/90">
                      Sisa vs Riil
                    </span>
                    <span className="text-[10px] font-bold text-slate-300">
                      {usagePercentage}%
                    </span>
                  </div>
                  <div
                    className={`text-sm sm:text-base font-extrabold tracking-tight mb-1.5 ${
                      remainingSafeBudget < 0 ? 'text-rose-400' : 'text-emerald-300'
                    }`}
                  >
                    {formatRupiah(remainingSafeBudget)}
                  </div>
                </div>

                <div>
                  <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden mb-1.5">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${budgetStatus.barColor}`}
                      style={{ width: `${Math.min(100, Math.max(0, usagePercentage))}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Terpakai:</span>
                    <span className="font-semibold text-slate-200">
                      {formatRupiah(totalActualExpense)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {isPlanOverBudget && (
              <div className="mt-2.5 bg-amber-500/20 border border-amber-400/40 rounded-xl px-2.5 py-1.5 flex items-center gap-2 text-[11px] text-amber-200">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>
                  Total estimasi rencana ({formatRupiah(totalEstimatedPlan)}) melebihi anggaran sebesar{' '}
                  <strong>{formatRupiah(Math.abs(remainingPlanBudget))}</strong>!
                </span>
              </div>
            )}
          </div>
        </header>

        {/* ====================================================================
            MAIN SCROLLABLE CONTENT AREA
        ==================================================================== */}
        <main className="flex-1 px-4 pt-4 pb-24 overflow-y-auto">
          
          {/* ------------------------------------------------------------------
              TAB 1: RENCANA RUTIN (WEEKLY BREAKDOWN: MINGGU 1 - 5 + JAM)
          ------------------------------------------------------------------ */}
          {activeTab === 'plans' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Rencana Rutin</h2>
                  <p className="text-xs text-slate-500">
                    {monthlyPlans.length} agenda • Breakdown per minggu
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCopyFromPreviousMonth}
                    title="Salin rencana rutin dari bulan sebelumnya"
                    className="inline-flex items-center gap-1 text-xs font-medium bg-white hover:bg-rose-50 text-slate-700 border border-slate-200 px-2.5 py-2 rounded-xl shadow-xs transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5 text-rose-500" />
                    <span>Salin Bulan Lalu</span>
                  </button>
                  <button
                    onClick={() => openAddPlanModal(1)}
                    className="inline-flex items-center gap-1 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-xl shadow-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Rencana
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {WEEKS.map((week) => {
                  const weekPlans = monthlyPlans.filter((p) => (p.weekNumber || 1) === week.id);
                  const weekSubtotal = weekPlans.reduce(
                    (sum, item) => sum + (Number(item.estimatedCost) || 0),
                    0
                  );

                  return (
                    <section
                      key={week.id}
                      className="bg-white/90 rounded-2xl border border-rose-100/90 shadow-xs overflow-hidden"
                    >
                      <div className="bg-gradient-to-r from-rose-50/90 to-pink-50/60 px-3.5 py-2.5 border-b border-rose-100 flex items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-slate-900">
                              {week.label}
                            </span>
                            <span className="text-[10px] font-medium text-slate-500 bg-white/80 px-2 py-0.5 rounded-full border border-rose-100">
                              {week.rangeHint}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Subtotal Estimasi:{' '}
                            <span className="font-bold text-rose-700">
                              {formatRupiah(weekSubtotal)}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => openAddPlanModal(week.id)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 px-2.5 py-1.5 rounded-xl transition-colors shadow-2xs shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Tambah di {week.label}
                        </button>
                      </div>

                      <div className="px-3.5 py-2 bg-white border-b border-rose-50 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-400">
                          {weekPlans.length} agenda main
                        </span>
                        <button
                          onClick={() => {
                            setGeneratedImageUrl(null);
                            setExportModal({ isOpen: true, week });
                          }}
                          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5 text-rose-500" />
                          Cetak PDF / Image
                        </button>
                      </div>

                      <div className="p-3">
                        {weekPlans.length === 0 ? (
                          <div className="py-4 px-3 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                            <p className="text-xs text-slate-400">
                              Belum ada rencana kegiatan di {week.label}.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {weekPlans.map((plan) => {
                              const isCompleted = plan.status === 'completed';
                              return (
                                <div
                                  key={plan.id}
                                  className={`rounded-xl p-3 border transition-all ${
                                    isCompleted
                                      ? 'border-emerald-200/80 bg-emerald-50/30'
                                      : 'border-slate-200/80 bg-white'
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-2 mb-1.5">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      {renderCategoryBadge(plan.category)}
                                      {plan.isSpontaneous && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                                          [Spontan]
                                        </span>
                                      )}
                                      {isCompleted ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700">
                                          <CheckCircle2 className="w-3 h-3" />
                                          Terlaksana
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
                                          <Clock className="w-3 h-3" />
                                          Terjadwal
                                        </span>
                                      )}
                                    </div>

                                    <button
                                      onClick={() => handleDeletePlan(plan)}
                                      aria-label="Hapus rencana"
                                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>

                                  <h3 className="text-sm font-bold text-slate-900 mb-1">
                                    {plan.title}
                                  </h3>

                                  {plan.notes && (
                                    <p className="text-xs text-slate-500 mb-2 line-clamp-2">
                                      {plan.notes}
                                    </p>
                                  )}

                                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                    <div>
                                      <span className="text-[10px] text-slate-400 block">
                                        Estimasi Biaya
                                      </span>
                                      <span className="text-sm font-bold text-slate-800">
                                        {formatRupiah(plan.estimatedCost)}
                                      </span>
                                      {(plan.plannedDate || plan.plannedTime) && (
                                        <span className="text-[11px] text-slate-500 ml-2 inline-flex items-center gap-1">
                                          • {plan.plannedDate ? formatDateShort(plan.plannedDate) : ''}
                                          {plan.plannedTime ? ` (${plan.plannedTime} WIB)` : ''}
                                        </span>
                                      )}
                                    </div>

                                    {!isCompleted ? (
                                      <button
                                        onClick={() => openRealizeFromPlan(plan)}
                                        className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl shadow-xs transition-colors"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                        Catat Pengeluaran
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => setActiveTab('expenses')}
                                        className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:underline"
                                      >
                                        Lihat Riil
                                        <ArrowRight className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </section>
                  );
                })}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------
              TAB 2: PENGELUARAN RIIL (ACTUAL EXPENSES - LINKED FROM PLANS)
          ------------------------------------------------------------------ */}
          {activeTab === 'expenses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Pengeluaran Riil</h2>
                  <p className="text-xs text-slate-500">
                    Terkoneksi otomatis dari Rencana Rutin
                  </p>
                </div>

                <button
                  onClick={openSpontaneousExpenseModal}
                  className="inline-flex items-center gap-1 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white px-3 py-2 rounded-xl shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Dadakan
                </button>
              </div>

              {monthlyExpenses.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 mb-1">Belum ada pengeluaran riil</h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Selesaikan agenda di menu <strong>Rencana Rutin</strong> untuk mencatat pengeluaran riil tanpa input ulang.
                  </p>
                  <button
                    onClick={() => setActiveTab('plans')}
                    className="text-xs font-semibold bg-rose-600 text-white px-4 py-2 rounded-xl"
                  >
                    Ke Rencana Rutin
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {monthlyExpenses.map((exp) => {
                    const diff = (Number(exp.estimatedCost) || 0) - (Number(exp.actualCost) || 0);
                    const linkedPlan = appState.plans.find((p) => p.id === exp.planId);
                    const weekNum = exp.weekNumber || linkedPlan?.weekNumber || 1;

                    return (
                      <div
                        key={exp.id}
                        className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                              Minggu {weekNum}
                            </span>
                            {renderCategoryBadge(exp.category)}
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {exp.isSpontaneous ? 'Link: [Spontan]' : 'Link: Rencana Rutin'}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteExpense(exp)}
                            aria-label="Hapus pengeluaran"
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 mb-1">{exp.title}</h3>

                        <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-2.5">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDateShort(exp.actualDate)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            {exp.paidBy === 'Rekening Bersama' ? (
                              <Users className="w-3 h-3 text-rose-500" />
                            ) : (
                              <User className="w-3 h-3 text-slate-500" />
                            )}
                            {exp.paidBy}
                          </span>
                        </div>

                        {exp.notes && (
                          <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-2.5 py-1.5 mb-2.5">
                            "{exp.notes}"
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Nominal Riil</span>
                            <span className="text-base font-extrabold text-slate-900">
                              {formatRupiah(exp.actualCost)}
                            </span>
                            {!exp.isSpontaneous && (
                              <span className="text-[11px] text-slate-400 block">
                                Est: {formatRupiah(exp.estimatedCost)}
                              </span>
                            )}
                          </div>

                          {!exp.isSpontaneous && (
                            <div>
                              {diff > 0 ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-xl">
                                  <TrendingDown className="w-3.5 h-3.5" />
                                  Hemat {formatRupiah(diff)}
                                </span>
                              ) : diff < 0 ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-xl">
                                  <TrendingUp className="w-3.5 h-3.5" />
                                  Lebih {formatRupiah(Math.abs(diff))}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-xl">
                                  Sesuai Estimasi
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------------------------
              TAB 3: WISHLIST (IDEA BANK & PROMOTION TO PLAN)
          ------------------------------------------------------------------ */}
          {activeTab === 'wishlist' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Wishlist Berdua</h2>
                  <p className="text-xs text-slate-500">Bank ide tempat makan & jalan-jalan</p>
                </div>

                <button
                  onClick={() => setIsWishlistModalOpen(true)}
                  className="inline-flex items-center gap-1 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-xl shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Ide Baru
                </button>
              </div>

              <div className="bg-white p-1 rounded-xl border border-slate-200 grid grid-cols-2 gap-1">
                <button
                  onClick={() => setWishlistFilter('all')}
                  className={`text-xs font-semibold py-1.5 px-2 rounded-lg transition-colors ${
                    wishlistFilter === 'all'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Semua Ide ({appState.wishlists.length})
                </button>
                <button
                  onClick={() => setWishlistFilter('affordable')}
                  className={`inline-flex items-center justify-center gap-1 text-xs font-semibold py-1.5 px-2 rounded-lg transition-colors ${
                    wishlistFilter === 'affordable'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Filter className="w-3 h-3" />
                  Sesuai Sisa Budget
                </button>
              </div>

              {displayedWishlists.length === 0 ? (
                <div className="bg-white border border-dashed border-rose-200 rounded-2xl p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 mb-1">
                    {wishlistFilter === 'affordable'
                      ? 'Belum ada wishlist di bawah sisa budget'
                      : 'Wishlist masih kosong'}
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    {wishlistFilter === 'affordable'
                      ? `Sisa budget aman bulan ini adalah ${formatRupiah(Math.max(0, remainingSafeBudget))}.`
                      : 'Simpan rekomendasi kafe viral atau tempat liburan impian kalian di sini.'}
                  </p>
                  {wishlistFilter === 'affordable' ? (
                    <button
                      onClick={() => setWishlistFilter('all')}
                      className="text-xs font-semibold bg-slate-800 text-white px-4 py-2 rounded-xl"
                    >
                      Tampilkan Semua Wishlist
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsWishlistModalOpen(true)}
                      className="text-xs font-semibold bg-rose-600 text-white px-4 py-2 rounded-xl"
                    >
                      + Tambah Wishlist
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {displayedWishlists.map((wish) => {
                    const priorityObj = PRIORITIES.find((p) => p.id === wish.priority) || PRIORITIES[1];
                    return (
                      <div
                        key={wish.id}
                        className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {renderCategoryBadge(wish.category)}
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${priorityObj.color}`}>
                              {wish.priority}
                            </span>
                            {wish.isScheduled && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-700">
                                <CheckCircle2 className="w-3 h-3" />
                                Sudah Dijadwalkan
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => handleDeleteWishlist(wish)}
                            aria-label="Hapus wishlist"
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5 mb-1">
                          <h3 className="text-sm font-bold text-slate-900">{wish.title}</h3>
                          {wish.referenceLink && (
                            <a
                              href={wish.referenceLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Buka Link Referensi"
                              className="text-rose-600 hover:text-rose-700 p-0.5"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>

                        {wish.notes && (
                          <p className="text-xs text-slate-500 mb-2.5">{wish.notes}</p>
                        )}

                        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Perkiraan Biaya</span>
                            <span className="text-sm font-bold text-slate-800">
                              {formatRupiah(wish.estimatedCost)}
                            </span>
                          </div>

                          <button
                            onClick={() => openPromoteWishlistModal(wish)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-xl shadow-xs transition-colors"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            Jadwalkan ke Rencana
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>

        {/* ====================================================================
            BOTTOM NAVIGATION BAR (3 MENU UTAMA)
        ==================================================================== */}
        <nav className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-rose-100 px-3 py-2 grid grid-cols-3 gap-1 shadow-lg">
          <button
            onClick={() => setActiveTab('plans')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-2xl transition-colors ${
              activeTab === 'plans'
                ? 'bg-rose-50 text-rose-600 font-bold'
                : 'text-slate-500 hover:bg-slate-50 font-medium'
            }`}
          >
            <Calendar className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">Rencana Rutin</span>
          </button>

          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-2xl transition-colors ${
              activeTab === 'expenses'
                ? 'bg-rose-50 text-rose-600 font-bold'
                : 'text-slate-500 hover:bg-slate-50 font-medium'
            }`}
          >
            <Wallet className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">Pengeluaran Riil</span>
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-2xl transition-colors ${
              activeTab === 'wishlist'
                ? 'bg-rose-50 text-rose-600 font-bold'
                : 'text-slate-500 hover:bg-slate-50 font-medium'
            }`}
          >
            <Heart className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">Wishlist</span>
          </button>
        </nav>

        {/* ====================================================================
            TOAST NOTIFICATION
        ==================================================================== */}
        {toast && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm">
            <div
              className={`px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 border ${
                toast.type === 'warning'
                  ? 'bg-amber-900 text-amber-100 border-amber-700'
                  : 'bg-slate-900 text-white border-slate-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toast.message}</span>
            </div>
          </div>
        )}

        {/* ====================================================================
            MODAL 1: EDIT BATAS BUDGET BULANAN
        ==================================================================== */}
        {isBudgetModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900">Atur Budget Bulanan</h3>
                <button
                  onClick={() => setIsBudgetModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSaveBudget} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Batas Maksimal Pengeluaran (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="10000"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    placeholder="Contoh: 1500000"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
                >
                  Simpan Batas Budget
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ====================================================================
            MODAL 2: TAMBAH RENCANA RUTIN (MINGGU + JAM)
        ==================================================================== */}
        {isPlanModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900">Tambah Rencana Main</h3>
                <button
                  onClick={() => setIsPlanModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddPlan} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pilih Minggu
                  </label>
                  <select
                    value={newPlanForm.weekNumber}
                    onChange={(e) =>
                      setNewPlanForm({ ...newPlanForm, weekNumber: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    {WEEKS.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.label} ({w.rangeHint})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Kegiatan / Agenda Main
                  </label>
                  <input
                    type="text"
                    required
                    value={newPlanForm.title}
                    onChange={(e) => setNewPlanForm({ ...newPlanForm, title: e.target.value })}
                    placeholder="Misal: Ngopi Sore & Beli Buku"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Kategori
                    </label>
                    <select
                      value={newPlanForm.category}
                      onChange={(e) => setNewPlanForm({ ...newPlanForm, category: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Estimasi Biaya (Rp)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="5000"
                      value={newPlanForm.estimatedCost}
                      onChange={(e) =>
                        setNewPlanForm({ ...newPlanForm, estimatedCost: e.target.value })
                      }
                      placeholder="150000"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tanggal (Opsional)
                    </label>
                    <input
                      type="date"
                      value={newPlanForm.plannedDate}
                      onChange={(e) =>
                        setNewPlanForm({ ...newPlanForm, plannedDate: e.target.value })
                      }
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Jam (Opsional)
                    </label>
                    <input
                      type="time"
                      value={newPlanForm.plannedTime}
                      onChange={(e) =>
                        setNewPlanForm({ ...newPlanForm, plannedTime: e.target.value })
                      }
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Catatan (Opsional)
                  </label>
                  <input
                    type="text"
                    value={newPlanForm.notes}
                    onChange={(e) => setNewPlanForm({ ...newPlanForm, notes: e.target.value })}
                    placeholder="Catatan tempat atau menu favorit..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
                >
                  Simpan ke Rencana Rutin
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ====================================================================
            MODAL 3: REALISASI PENGELUARAN RIIL (LINKED / SPONTAN)
        ==================================================================== */}
        {realizeModal.isOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
                    {realizeModal.isSpontaneous
                      ? 'Pengeluaran Spontan'
                      : `Terhubung dari Minggu ${realizeModal.weekNumber}`}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">Catat Pengeluaran Riil</h3>
                </div>
                <button
                  onClick={() => setRealizeModal((prev) => ({ ...prev, isOpen: false }))}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitExpense} className="space-y-3.5">
                {realizeModal.isSpontaneous ? (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nama Pengeluaran Spontan
                      </label>
                      <input
                        type="text"
                        required
                        value={realizeModal.title}
                        onChange={(e) =>
                          setRealizeModal({ ...realizeModal, title: e.target.value })
                        }
                        placeholder="Misal: Jajan Es Kopi & Roti"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Kategori
                        </label>
                        <select
                          value={realizeModal.category}
                          onChange={(e) =>
                            setRealizeModal({ ...realizeModal, category: e.target.value })
                          }
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                        >
                          {CATEGORIES.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Minggu Ke-
                        </label>
                        <select
                          value={realizeModal.weekNumber}
                          onChange={(e) =>
                            setRealizeModal({
                              ...realizeModal,
                              weekNumber: Number(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                        >
                          {WEEKS.map((w) => (
                            <option key={w.id} value={w.id}>
                              {w.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                    <div className="text-xs font-bold text-slate-900">{realizeModal.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Kategori: {realizeModal.category} • Estimasi:{' '}
                      <span className="font-semibold text-slate-700">
                        {formatRupiah(realizeModal.estimatedCost)}
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nominal Riil yang Dibayar (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1000"
                    value={realizeModal.actualCost}
                    onChange={(e) =>
                      setRealizeModal({ ...realizeModal, actualCost: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-emerald-50/50 border border-emerald-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tanggal Bayar
                    </label>
                    <input
                      type="date"
                      required
                      value={realizeModal.actualDate}
                      onChange={(e) =>
                        setRealizeModal({ ...realizeModal, actualDate: e.target.value })
                      }
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Sumber Dana
                    </label>
                    <select
                      value={realizeModal.paidBy}
                      onChange={(e) =>
                        setRealizeModal({ ...realizeModal, paidBy: e.target.value })
                      }
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    >
                      <option value="Rekening Bersama">Rekening Bersama</option>
                      <option value="Suami">Suami</option>
                      <option value="Istri">Istri</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Catatan Transaksi (Opsional)
                  </label>
                  <input
                    type="text"
                    value={realizeModal.notes}
                    onChange={(e) => setRealizeModal({ ...realizeModal, notes: e.target.value })}
                    placeholder="Misal: Dapat diskon kartu / promo..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
                >
                  Simpan ke Pengeluaran Riil
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ====================================================================
            MODAL 4: TAMBAH WISHLIST BARU
        ==================================================================== */}
        {isWishlistModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900">Tambah Ide Wishlist</h3>
                <button
                  onClick={() => setIsWishlistModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddWishlist} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Tempat / Aktivitas Impian
                  </label>
                  <input
                    type="text"
                    required
                    value={newWishlistForm.title}
                    onChange={(e) =>
                      setNewWishlistForm({ ...newWishlistForm, title: e.target.value })
                    }
                    placeholder="Misal: Staycation Vila Lembang"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Kategori
                    </label>
                    <select
                      value={newWishlistForm.category}
                      onChange={(e) =>
                        setNewWishlistForm({ ...newWishlistForm, category: e.target.value })
                      }
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Perkiraan Biaya (Rp)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="5000"
                      value={newWishlistForm.estimatedCost}
                      onChange={(e) =>
                        setNewWishlistForm({ ...newWishlistForm, estimatedCost: e.target.value })
                      }
                      placeholder="250000"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Prioritas
                  </label>
                  <select
                    value={newWishlistForm.priority}
                    onChange={(e) =>
                      setNewWishlistForm({ ...newWishlistForm, priority: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Link Referensi IG / TikTok / Maps (Opsional)
                  </label>
                  <input
                    type="url"
                    value={newWishlistForm.referenceLink}
                    onChange={(e) =>
                      setNewWishlistForm({ ...newWishlistForm, referenceLink: e.target.value })
                    }
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Catatan
                  </label>
                  <input
                    type="text"
                    value={newWishlistForm.notes}
                    onChange={(e) =>
                      setNewWishlistForm({ ...newWishlistForm, notes: e.target.value })
                    }
                    placeholder="Menu wajib atau info reservasi..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
                >
                  Simpan ke Wishlist
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ====================================================================
            MODAL 5: JADWALKAN WISHLIST KE MINGGU RENCANA
        ==================================================================== */}
        {promoteModal.isOpen && promoteModal.wish && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-slate-900">Jadwalkan ke Rencana Rutin</h3>
                <button
                  onClick={() => setPromoteModal({ isOpen: false, wish: null, weekNumber: 1 })}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-rose-50 border border-rose-100 rounded-2xl p-3 mb-4">
                <div className="text-xs font-bold text-slate-900">{promoteModal.wish.title}</div>
                <div className="text-[11px] text-rose-700 font-semibold mt-0.5">
                  Perkiraan Biaya: {formatRupiah(promoteModal.wish.estimatedCost)}
                </div>
              </div>

              <form onSubmit={handleConfirmPromoteWishlist} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Masukkan ke Minggu Ke Berapa?
                  </label>
                  <select
                    value={promoteModal.weekNumber}
                    onChange={(e) =>
                      setPromoteModal({ ...promoteModal, weekNumber: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    {WEEKS.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.label} ({w.rangeHint})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
                >
                  Konfirmasi & Masukkan ke Jadwal
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ====================================================================
            MODAL 6: CETAK / EXPORT JADWAL MINGGUAN (PDF & IMAGE)
        ==================================================================== */}
        {exportModal.isOpen && exportModal.week && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">
                    Export Rencana Mingguan
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    Pratinjau Jadwal {exportModal.week.label}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setGeneratedImageUrl(null);
                    setExportModal({ isOpen: false, week: null });
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {(() => {
                const week = exportModal.week;
                const weekPlans = monthlyPlans.filter((p) => (p.weekNumber || 1) === week.id);
                const monthLabel =
                  AVAILABLE_MONTHS.find((m) => m.value === currentMonth)?.label || currentMonth;
                const totalWeekEst = weekPlans.reduce(
                  (sum, item) => sum + (Number(item.estimatedCost) || 0),
                  0
                );

                return (
                  <div className="space-y-4">
                    {/* Kartu Pratinjau Jadwal */}
                    <div className="border border-rose-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                      <div className="bg-gradient-to-r from-rose-600 to-pink-600 px-4 py-3 text-white">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold">
                            KitaMain — {week.label}
                          </h4>
                          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-medium">
                            {monthLabel}
                          </span>
                        </div>
                        <p className="text-[11px] text-rose-100 mt-0.5">
                          Periode {week.rangeHint}
                        </p>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              <th className="py-2.5 px-3">Hari / Tanggal</th>
                              <th className="py-2.5 px-3">Agenda Main</th>
                              <th className="py-2.5 px-2.5">Jam</th>
                              <th className="py-2.5 px-3 text-right">Estimasi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs">
                            {weekPlans.length === 0 ? (
                              <tr>
                                <td
                                  colSpan="4"
                                  className="py-6 px-3 text-center text-slate-400 italic"
                                >
                                  Belum ada agenda main di {week.label}.
                                </td>
                              </tr>
                            ) : (
                              weekPlans.map((plan) => (
                                <tr key={plan.id} className="hover:bg-rose-50/30">
                                  <td className="py-2.5 px-3 text-[11px] font-medium text-slate-600 align-top">
                                    {formatDayDateFull(plan.plannedDate)}
                                  </td>
                                  <td className="py-2.5 px-3 align-top">
                                    <div className="font-bold text-slate-900 leading-snug">
                                      {plan.title}
                                    </div>
                                    <span className="text-[10px] font-semibold text-rose-600">
                                      {plan.category}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-2.5 text-[11px] font-semibold text-slate-700 whitespace-nowrap align-top">
                                    {plan.plannedTime ? `${plan.plannedTime} WIB` : '-'}
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-bold text-slate-900 whitespace-nowrap align-top">
                                    {formatRupiah(plan.estimatedCost)}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      <div className="bg-rose-50/80 px-4 py-2.5 border-t border-rose-100 flex items-center justify-between text-xs">
                        <span className="font-bold text-rose-900">
                          Total Estimasi {week.label}
                        </span>
                        <span className="font-extrabold text-rose-600">
                          {formatRupiah(totalWeekEst)}
                        </span>
                      </div>
                    </div>

                    {/* Tombol Aksi Unduh Image & Cetak PDF */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        disabled={isExportingImage}
                        onClick={handleDownloadWeeklyImage}
                        className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
                      >
                        <ImageIcon className="w-4 h-4" />
                        <span>{isExportingImage ? 'Memproses...' : 'Simpan Image (PNG)'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handlePrintWeeklyPDF}
                        className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Cetak / Simpan PDF</span>
                      </button>
                    </div>

                    {/* Pratinjau Gambar PNG Siap Simpan (Khusus iOS / Long-Press Save) */}
                    {generatedImageUrl && (
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-700">
                            Hasil Gambar Siap Simpan
                          </span>
                          <span className="text-[10px] font-semibold text-rose-600">
                            Tekan & tahan gambar → Simpan ke Foto
                          </span>
                        </div>
                        <img
                          src={generatedImageUrl}
                          alt={`Jadwal ${week.label}`}
                          className="w-full rounded-xl border border-slate-200 shadow-xs"
                        />
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* ====================================================================
            CUSTOM CONFIRMATION DIALOG (PENGGANTI WINDOW.CONFIRM)
        ==================================================================== */}
        {confirmDialog.isOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-xs rounded-3xl p-5 shadow-2xl text-center">
              <div className="w-11 h-11 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">{confirmDialog.title}</h3>
              <p className="text-xs text-slate-500 mb-5 leading-relaxed">{confirmDialog.message}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDialog.onConfirm}
                  className="flex-1 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm"
                >
                  {confirmDialog.confirmText}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
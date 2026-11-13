import React, { useRef } from 'react';
import { getProductStockStatus } from '../../utils/stockHelper';
import { 
  X, 
  LayoutDashboard, 
  Image as ImageIcon, 
  Package, 
  ShoppingBag, 
  Settings, 
  Globe, 
  LogOut,
  TrendingUp,
  DollarSign,
  Clock,
  Sparkles,
  Layers,
  Sliders,
  Tag,
  Star,
  Users,
  AlertTriangle,
  ArrowRight,
  ArrowUp,
  ArrowUpCircle,
  FileText,
  Lock,
  Search,
  CreditCard,
  Cloud,
  Store,
  RotateCcw,
  RotateCw,
  Gift
} from 'lucide-react';
import { useToast } from '../common/Toast';
import { useStore, AdminTabType } from '../../context/StoreContext';
import { HeroManager } from './HeroManager';
import { ProductManager } from './ProductManager';
import { PreOrderManager } from './PreOrderManager';
import { BuyMoreManager } from './BuyMoreManager';
import { CategoryManager } from './CategoryManager';
import { QuickCategoryManager } from './QuickCategoryManager';
import { AttributeManager } from './AttributeManager';
import { OrderManager } from './OrderManager';
import { CustomerManager } from './CustomerManager';
import { CouponManager } from './CouponManager';
import { ReviewManager } from './ReviewManager';
import { InventoryManager } from './InventoryManager';
import { StoreSettingsManager } from './StoreSettingsManager';
import { SeoManager } from './SeoManager';
import { StaticPageManager } from './StaticPageManager';
import { SecurityManager } from './SecurityManager';
import { SearchAnalyticsManager } from './SearchAnalyticsManager';
import { AccessControlManager } from './AccessControlManager';
import { MediaManager } from './MediaManager';
import { PaymentSettingsManager } from './PaymentSettingsManager';
import { OrderPolicySettingsManager } from './OrderPolicySettingsManager';
import { auth } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';

export const AdminDashboard: React.FC = () => {
  const { 
    setIsAdminModalOpen, 
    setIsAdminLoggedIn, 
    setIsAdminViewingStore,
    activeAdminTab, 
    setActiveAdminTab,
    products,
    preOrderProducts,
    preOrders,
    buyMoreOffers,
    categories,
    quickCategories,
    attributes,
    orders,
    customers,
    heroSlides,
    coupons,
    reviews,
    storeConfig,
    staticPages,
    searchLogs,
    clearSearchLogs,
    adminsList,
    loggedInAdminEmail,
    adminEmail,
    syncToCloudNow,
    seedDatabaseToFirestore,
    isCloudSynced,
    logoutAdmin,
    updateLastViewedOrderTimestamp,
    toggleOrderSeen,
    updateOrderStatus,
    setInventoryFilter,
    setInventorySearch
  } = useStore();

  const { showToast } = useToast();
  const [isSyncingCloud, setIsSyncingCloud] = React.useState(false);
  const [isSeedingDb, setIsSeedingDb] = React.useState(false);
  const [firebaseUser, setFirebaseUser] = React.useState(auth.currentUser);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setFirebaseUser(u);
    });
    return () => unsub();
  }, []);

  const isFirebaseAdmin = !!firebaseUser && firebaseUser.email?.toLowerCase().trim() === 'rycreoshop@gmail.com';

  const mainScrollRef = useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (activeAdminTab === 'orders') {
      updateLastViewedOrderTimestamp(Date.now());
    }
  }, [activeAdminTab, updateLastViewedOrderTimestamp]);

  const totalRevenue = React.useMemo(() => {
    if (!Array.isArray(orders) || orders.length === 0) return 0;
    return orders.reduce((sum, o) => {
      if (!o) return sum;
      const raw = o.totalAmount ?? (o as any).totalBill ?? (o as any).total ?? 0;
      const val = typeof raw === 'number' ? raw : parseFloat(String(raw).replace(/[^0-9.]/g, ''));
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
  }, [orders]);
  const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;
  const newOrdersCount = orders.filter(o => !o.isSeen).length;
  const pendingReviewsCount = reviews.filter(r => r.status === 'pending').length;
  const lowStockProducts = React.useMemo(() => {
    return products.filter(p => {
      if (p.trackStock === false) return false;
      const st = getProductStockStatus(p);
      return st.isLowStock || st.isOutOfStock || st.hasOutOfStockVariant || st.hasLowStockVariant;
    });
  }, [products]);
  const lowStockCount = lowStockProducts.length;

  const totalStockCount = React.useMemo(() => {
    return products.reduce((sum, p) => {
      if (p.variations && p.variations.length > 0) {
        return sum + p.variations.reduce((vSum, v) => vSum + (v.stock || 0), 0);
      }
      if (p.sizes && p.sizes.length > 0) {
        return sum + p.sizes.reduce((sSum, s) => sSum + (s.stock || 0), 0);
      }
      return sum + (p.stock || 0);
    }, 0);
  }, [products]);

  interface NavTabItem {
    id: AdminTabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    alert?: boolean;
  }

  const unseenPreOrdersCount = preOrders.filter(o => !o.isSeen).length;

  const navTabs = React.useMemo<NavTabItem[]>(() => [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package, badge: products.length },
    { id: 'pre_orders', label: 'Pre-Order Products', icon: Clock, badge: unseenPreOrdersCount > 0 ? `${unseenPreOrdersCount} New` : preOrderProducts.length, alert: unseenPreOrdersCount > 0 },
    { id: 'buy_more', label: 'Buy One Get More', icon: Gift, badge: buyMoreOffers.length },
    { id: 'categories', label: 'Categories', icon: Layers, badge: categories.length },
    { id: 'static_pages', label: 'Static Pages', icon: FileText, badge: staticPages.length },
    { id: 'order_policy', label: 'Order Policy & Settings', icon: FileText },
    { id: 'quick_categories', label: 'Category Shortcuts', icon: Sparkles, badge: quickCategories.length },
    { id: 'attributes', label: 'Attributes', icon: Sliders },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: newOrdersCount > 0 ? `${newOrdersCount} New` : orders.length, alert: newOrdersCount > 0 },
    { id: 'customers', label: 'Customers', icon: Users, badge: customers.length },
    { id: 'hero', label: '3 Banners', icon: ImageIcon, badge: heroSlides.length + 2 },
    { id: 'coupons', label: 'Coupons', icon: Tag, badge: coupons.filter(c => c.active).length },
    { id: 'reviews', label: 'Reviews', icon: Star, badge: pendingReviewsCount > 0 ? `${pendingReviewsCount} pending` : reviews.length, alert: pendingReviewsCount > 0 },
    { id: 'inventory', label: 'Inventory', icon: AlertTriangle, badge: lowStockCount > 0 ? `${lowStockCount} low` : undefined, alert: lowStockCount > 0 },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'payment_gateways', label: 'Payment Methods', icon: CreditCard },
    { id: 'seo', label: 'SEO Engine', icon: Globe },
    { id: 'media', label: 'Media (Social Links)', icon: ImageIcon },
    { id: 'security', label: 'Security Setting', icon: Lock },
    { id: 'search_analytics', label: 'Search Analytics', icon: Search, badge: searchLogs.length },
    { id: 'access_control', label: 'Access Control', icon: Users, badge: adminsList.length + 1 }
  ], [products.length, unseenPreOrdersCount, preOrderProducts.length, buyMoreOffers.length, categories.length, staticPages.length, quickCategories.length, newOrdersCount, orders.length, customers.length, heroSlides.length, coupons, pendingReviewsCount, reviews.length, lowStockCount, searchLogs.length, adminsList.length]);

  const currentAdminRecord = React.useMemo(() => {
    return adminsList.find(x => x.email.toLowerCase() === loggedInAdminEmail.toLowerCase());
  }, [adminsList, loggedInAdminEmail]);

  const isSuper = loggedInAdminEmail.toLowerCase() === adminEmail.toLowerCase() || !currentAdminRecord;

  const displayNavTabs = React.useMemo(() => {
    return navTabs.filter(tab => {
      if (isSuper) return true;
      return currentAdminRecord?.allowedTabs.includes(tab.id);
    });
  }, [isSuper, currentAdminRecord, navTabs]);

  React.useEffect(() => {
    if (!isSuper && displayNavTabs.length > 0) {
      const isAllowed = displayNavTabs.some(t => t.id === activeAdminTab);
      if (!isAllowed) {
        setActiveAdminTab(displayNavTabs[0].id);
      }
    }
  }, [isSuper, displayNavTabs, setActiveAdminTab]);

  const scrollToTop = () => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-slate-950 text-white flex flex-col h-[100dvh] max-h-[100dvh] animate-fade-in">
      {/* Top Header */}
      <div className="bg-[#1E293B] border-b border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#38BDF8] to-[#6366F1] flex items-center justify-center font-black text-lg shadow-md text-white">
            R
          </div>
          <div>
            <h2 className="font-extrabold text-base text-white leading-none font-['Outfit']">
              {storeConfig.storeName || 'RycreoShop'} Admin System
            </h2>
            <p className="text-[10px] text-amber-400 font-bold mt-0.5">Logged in as: {loggedInAdminEmail || 'rycreoshop@gmail.com'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Cloud Sync Status & Trigger */}
          <button
            onClick={async () => {
              setIsSyncingCloud(true);
              const ok = await syncToCloudNow();
              setIsSyncingCloud(false);
              if (ok) {
                showToast("Firebase Cloud Synced worldwide!", "success");
              } else {
                showToast("Cloud sync failed. Check internet connection.", "error");
              }
            }}
            disabled={isSyncingCloud}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isCloudSynced && !isSyncingCloud
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                : 'bg-amber-950/60 border-amber-500/40 text-amber-300 hover:bg-amber-900/60 animate-pulse'
            }`}
            title="Cloud Sync (Firebase Realtime Worldwide Database)"
          >
            <Cloud className={`w-3.5 h-3.5 ${isSyncingCloud ? 'animate-spin' : ''}`} />
            <span className="hidden lg:inline">{isSyncingCloud ? 'Syncing...' : (isCloudSynced ? 'Cloud Synced' : 'Sync Changes')}</span>
          </button>

          {/* View Storefront Button */}
          <button
            onClick={() => {
              setIsAdminViewingStore(true);
              setIsAdminModalOpen(false);
            }}
            className="px-3 sm:px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-all text-xs font-bold flex items-center gap-1.5 sm:gap-2 border border-slate-700 shadow-sm cursor-pointer active:scale-[0.98]"
            title="View Storefront"
          >
            <Store className="w-4 h-4 text-[#38BDF8]" />
            <span>View Store</span>
          </button>

          {/* Exit / Logout Button */}
          <button
            onClick={async () => {
              await logoutAdmin();
              showToast("Successfully logged out.", "info");
            }}
            className="px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white transition-all text-xs font-black flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-rose-500/25 cursor-pointer hover:scale-105 active:scale-[0.98] border border-rose-400/30"
            title="Exit / Logout Admin Session"
          >
            <LogOut className="w-4 h-4" />
            <span>Exit / Logout</span>
          </button>

          {/* Cross / Exit Icon Button */}
          <button
            onClick={async () => {
              await logoutAdmin();
              showToast("Successfully logged out.", "info");
            }}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer active:scale-[0.95]"
            title="Exit Admin Session"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Prominent Low Stock Alarm Indicator at the very top of Admin Dashboard */}
      {lowStockCount > 0 && (
        <div 
          onClick={() => setActiveAdminTab('inventory')}
          className="bg-gradient-to-r from-rose-950 via-red-900 to-amber-950 border-b border-rose-500/50 px-4 py-2.5 flex items-center justify-between text-xs font-bold text-rose-200 cursor-pointer hover:brightness-110 transition-all shrink-0 z-20 shadow-lg shadow-rose-950/40"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-rose-500/30 border border-rose-500/50 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            </span>
            <span>
              <strong className="text-white uppercase tracking-wider font-extrabold mr-1.5 bg-rose-600 px-2 py-0.5 rounded text-[10px] animate-pulse">Low Stock Alarm:</strong> 
              {lowStockCount} product{lowStockCount > 1 ? 's have' : ' has'} fallen below 5 units in stock. Immediate restock needed!
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-300 hover:text-white shrink-0 font-black text-[11px] underline ml-2">
            <span>Manage Inventory ({lowStockCount})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      )}

      {/* Mobile Horizontal Navigation Tabs (Prevents full-screen vertical blockage) */}
      <div className="md:hidden bg-[#0F172A] border-b border-slate-800 p-2 overflow-x-auto scrollbar-none flex items-center gap-1.5 shrink-0 z-20">
        {displayNavTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeAdminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveAdminTab(tab.id as AdminTabType);
                scrollToTop();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#38BDF8] to-[#6366F1] text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="text-[10px] bg-slate-900 px-1.5 py-0.2 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Admin Body */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Desktop Sidebar Nav */}
        <aside className="hidden md:block w-64 bg-[#0F172A] border-r border-slate-800 p-4 space-y-1.5 shrink-0 overflow-y-auto">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-3 mb-2">Commerce Core</p>

          {displayNavTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeAdminTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveAdminTab(tab.id as AdminTabType);
                  scrollToTop();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#38BDF8] to-[#6366F1] text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </div>

                {tab.badge !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isActive ? 'bg-slate-900 text-white' :
                    tab.alert ? 'bg-amber-500/30 text-amber-400 animate-pulse' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Content View */}
        <main 
          ref={mainScrollRef}
          className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 md:p-8 bg-slate-900/60 pb-52 sm:pb-60 relative touch-pan-y"
        >
          {/* Overview Dashboard Tab */}
          {activeAdminTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              {/* Analytics Metric Cards (4 Boxes) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                    <span>টোটাল স্টোর সেল (Total Store Sales)</span>
                    <DollarSign className="w-4 h-4 text-[#38BDF8]" />
                  </div>
                  <p className="text-2xl font-black text-white font-['Outfit']">৳{totalRevenue}</p>
                  <p className="text-[10px] text-emerald-400 font-bold">100% Verified Local & Cloud Sync</p>
                </div>

                <div 
                  onClick={() => setActiveAdminTab('orders')}
                  className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-2 cursor-pointer hover:border-[#6366F1] transition-all"
                >
                  <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                    <span>টোটাল অর্ডার (Total Orders)</span>
                    <ShoppingBag className="w-4 h-4 text-[#6366F1]" />
                  </div>
                  <p className="text-2xl font-black text-white font-['Outfit']">{orders.length}</p>
                  <p className="text-[10px] text-[#38BDF8] font-bold">Click to view orders</p>
                </div>

                <div 
                  onClick={() => setActiveAdminTab('inventory')}
                  className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-2 cursor-pointer hover:border-amber-500 transition-all"
                >
                  <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                    <span>টোটাল স্টক (Total Stock)</span>
                    <Package className="w-4 h-4 text-[#F59E0B]" />
                  </div>
                  <p className="text-2xl font-black text-[#F59E0B] font-['Outfit']">{totalStockCount} pcs</p>
                  <p className="text-[10px] text-amber-300 font-bold">Manage inventory</p>
                </div>

                <div 
                  onClick={() => setActiveAdminTab('products')}
                  className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-2 cursor-pointer hover:border-emerald-500 transition-all"
                >
                  <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                    <span>অ্যাক্টিভ প্রোডাক্ট (Active Products)</span>
                    <Package className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-2xl font-black text-white font-['Outfit']">{products.length}</p>
                  <p className="text-[10px] text-emerald-400 font-bold">{categories.length} Categories active</p>
                </div>
              </div>

              {/* New Orders Section (নিউ অর্ডার) */}
              <div className="bg-slate-800 rounded-3xl border border-slate-700 p-5 sm:p-6 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-md">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white font-['Outfit'] flex items-center gap-2">
                        <span>নিউ অর্ডার (New Orders Alert)</span>
                        {orders.filter(o => !o.isSeen || o.status === 'Pending').length > 0 && (
                          <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                            {orders.filter(o => !o.isSeen || o.status === 'Pending').length} Pending
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-400">Incoming customer orders. Mark as Seen (সিন) or Process (প্রসেসিং) to update inventory & remove from pending queue.</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveAdminTab('orders')}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-[#38BDF8] hover:bg-slate-700 text-xs font-bold border border-slate-700 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                  >
                    <span>View All Orders Manager</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3 pt-2">
                  {orders.filter(o => !o.isSeen || o.status === 'Pending').length === 0 ? (
                    <div className="text-center py-10 bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                      ✨ No new or pending orders right now. All orders have been processed!
                    </div>
                  ) : (
                    orders.filter(o => !o.isSeen || o.status === 'Pending').map(order => (
                      <div 
                        key={order.id}
                        className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                          !order.isSeen 
                            ? 'bg-slate-900/95 border-sky-500/40 shadow-lg shadow-sky-500/5' 
                            : 'bg-slate-900/60 border-slate-800'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="font-extrabold text-white text-xs font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                              {order.orderNumber}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                              order.status === 'Pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-sky-500/20 text-sky-400'
                            }`}>
                              {order.status}
                            </span>
                            {!order.isSeen && (
                              <span className="bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase animate-bounce">
                                UNSEEN (নতুন)
                              </span>
                            )}
                          </div>

                          <div>
                            <p className="text-sm font-bold text-white">
                              {order.customerName} • <span className="text-[#38BDF8] font-mono">{order.phone}</span>
                            </p>
                            <p className="text-xs text-slate-400 truncate max-w-lg mt-0.5">
                              📍 {order.address} ({order.cityRegion})
                            </p>
                            <p className="text-[11px] text-slate-500 mt-1 font-mono">
                              🕒 {order.orderTimeFormatted || order.createdAt} • <strong className="text-emerald-400">৳{order.totalAmount}</strong> ({order.items?.length || 0} items)
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end md:self-center shrink-0 flex-wrap">
                          {!order.isSeen && (
                            <button
                              onClick={() => toggleOrderSeen(order.id)}
                              className="px-3.5 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/35 text-[#38BDF8] font-extrabold text-xs border border-sky-500/30 cursor-pointer transition-colors flex items-center gap-1.5"
                              title="Mark order as seen"
                            >
                              <span>Seen (সিন) ✓</span>
                            </button>
                          )}

                          {order.status === 'Pending' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'Processing')}
                              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 cursor-pointer transition-all hover:scale-105 flex items-center gap-1.5"
                              title="Process order and remove from pending queue"
                            >
                              <span>Process (প্রসেসিং)</span>
                            </button>
                          )}

                          <button
                            onClick={() => setActiveAdminTab('orders')}
                            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 cursor-pointer transition-colors"
                          >
                            Full Details
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Prominent Admin Low Stock Alarm Widget */}
              <div className={`p-5 sm:p-6 rounded-3xl border transition-all shadow-xl ${
                lowStockProducts.length > 0 
                  ? 'bg-gradient-to-r from-rose-950/80 via-slate-900 to-amber-950/60 border-rose-500/50' 
                  : 'bg-slate-800/80 border-slate-700/70'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      lowStockProducts.length > 0 
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse' 
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full ${
                          lowStockProducts.length > 0 ? 'bg-rose-500 text-white animate-bounce' : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {lowStockProducts.length > 0 ? 'LOW STOCK ALARM' : 'INVENTORY HEALTHY'}
                        </span>
                        {lowStockProducts.length > 0 && (
                          <span className="text-xs font-bold text-rose-400">
                            {lowStockProducts.length} items &lt; 5 pcs
                          </span>
                        )}
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-white font-['Outfit'] mt-1">
                        {lowStockProducts.length > 0 
                          ? 'Immediate Inventory Restock Required' 
                          : 'All Product Stock Levels Optimal'}
                      </h3>
                      <p className="text-xs text-slate-300 max-w-xl mt-0.5">
                        {lowStockProducts.length > 0 
                          ? 'The following products have fallen below 5 pieces in stock. Restock immediately to prevent checkout disruptions.' 
                          : 'Every product in the catalog currently has 5 or more units available in stock.'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveAdminTab('inventory')}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-extrabold text-xs shadow-lg shadow-rose-500/20 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 shrink-0 self-start sm:self-auto"
                  >
                    <span>Manage Inventory & Restock ({lowStockProducts.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Low Stock Items Quick View */}
                {lowStockProducts.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-rose-500/20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {lowStockProducts.slice(0, 6).map(p => {
                      const totalStock = p.variations && p.variations.length > 0
                        ? p.variations.reduce((sum, v) => sum + (v.stock || 0), 0)
                        : (p.sizes && p.sizes.length > 0
                            ? p.sizes.reduce((sum, s) => sum + (s.stock || 0), 0)
                            : (p.stock ?? 0));

                      return (
                        <div 
                          key={p.id}
                          onClick={() => setActiveAdminTab('inventory')}
                          className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/90 border border-rose-500/30 hover:border-rose-400 cursor-pointer transition-all group"
                        >
                          <img 
                            src={p.images[0]} 
                            alt={p.title} 
                            className="w-10 h-10 rounded-lg object-cover bg-slate-800 border border-slate-700 shrink-0" 
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate group-hover:text-rose-300 transition-colors">{p.title}</p>
                            <p className="text-[10px] text-slate-400 font-mono">SKU: {p.sku || p.id}</p>
                          </div>
                          {(() => {
                            const st = getProductStockStatus(p);
                            const isOut = totalStock === 0 || st.isOutOfStock;
                            const hasVarOut = st.hasOutOfStockVariant;
                            return (
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black shrink-0 ${
                                isOut 
                                  ? 'bg-rose-500 text-white font-extrabold animate-pulse' 
                                  : hasVarOut 
                                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 font-bold'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              }`}>
                                {isOut ? 'Out of Stock: 0 pcs' : hasVarOut ? `${st.outOfStockVariantsCount || 1} Variant Finished` : `Low Stock: ${totalStock} pcs`}
                              </span>
                            );
                          })()}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Quick Navigation Cards */}
              <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-4">
                <h3 className="font-extrabold text-base text-white font-['Outfit'] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#38BDF8]" />
                  <span>Administrative Control Hub</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <button
                    onClick={() => setActiveAdminTab('products')}
                    className="p-4 rounded-xl bg-slate-900 border border-slate-700 hover:border-[#38BDF8] text-left transition-colors group cursor-pointer"
                  >
                    <p className="font-bold text-white text-xs group-hover:text-[#38BDF8]">Manage Products</p>
                    <p className="text-[11px] text-slate-400 mt-1">Multi-image gallery, dynamic sizes, colors, and variations.</p>
                  </button>

                  <button
                    onClick={() => setActiveAdminTab('quick_categories')}
                    className="p-4 rounded-xl bg-slate-900 border border-slate-700 hover:border-[#38BDF8] text-left transition-colors group cursor-pointer"
                  >
                    <p className="font-bold text-white text-xs group-hover:text-[#38BDF8]">Daraz Shortcuts Hub</p>
                    <p className="text-[11px] text-slate-400 mt-1">Custom circular icons, badges, and banner category links.</p>
                  </button>

                  <button
                    onClick={() => setActiveAdminTab('categories')}
                    className="p-4 rounded-xl bg-slate-900 border border-slate-700 hover:border-[#38BDF8] text-left transition-colors group cursor-pointer"
                  >
                    <p className="font-bold text-white text-xs group-hover:text-[#38BDF8]">Manage Categories</p>
                    <p className="text-[11px] text-slate-400 mt-1">Create subcategories, category icons, and banners.</p>
                  </button>

                  <button
                    onClick={() => setActiveAdminTab('coupons')}
                    className="p-4 rounded-xl bg-slate-900 border border-slate-700 hover:border-[#38BDF8] text-left transition-colors group cursor-pointer"
                  >
                    <p className="font-bold text-white text-xs group-hover:text-[#38BDF8]">Promo Coupons</p>
                    <p className="text-[11px] text-slate-400 mt-1">Configure percentage or fixed discount limits and expiry.</p>
                  </button>

                  <button
                    onClick={() => setActiveAdminTab('pre_orders')}
                    className="p-4 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 text-left transition-colors group cursor-pointer"
                  >
                    <p className="font-bold text-white text-xs group-hover:text-amber-300">
                      Pre-Order Management ({preOrders.length})
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">Upcoming products, delivery timelines &amp; pre-order bookings.</p>
                  </button>

                  <button
                    onClick={() => setActiveAdminTab('buy_more')}
                    className="p-4 rounded-xl bg-slate-900 border border-slate-700 hover:border-indigo-400 text-left transition-colors group cursor-pointer"
                  >
                    <p className="font-bold text-white text-xs group-hover:text-indigo-300">
                      Buy One Get More ({buyMoreOffers.length})
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">BOGO deals, paired free items &amp; offer voucher folders.</p>
                  </button>
                </div>
              </div>

              {/* Dynamic Live Logs Section (Top Searches & Low Stock Alerts) - Controlled by Admin Settings */}
              {((storeConfig.showSearchQueriesPanel !== false) || (storeConfig.showLowStockPanel !== false)) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. Top Searches Panel */}
                {storeConfig.showSearchQueriesPanel !== false && (
                <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-4 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-base text-white font-heading flex items-center gap-2">
                        <Globe className="w-4.5 h-4.5 text-[#38BDF8] animate-pulse" />
                        <span>Top Search Queries (Missing Products)</span>
                      </h3>
                      {searchLogs.length > 0 && (
                        <button
                          onClick={clearSearchLogs}
                          className="text-[10px] text-slate-400 hover:text-rose-400 font-bold uppercase transition-colors cursor-pointer"
                        >
                          Clear Logs
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">See what buyers are searching for. Use this list to source products you might be missing!</p>
                  </div>

                  {searchLogs.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500 font-medium bg-slate-900/50 rounded-2xl border border-slate-700/50">
                      No search logs recorded yet.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {searchLogs.map((log, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
                          <div className="flex items-center gap-2.5">
                            <span className="text-[10px] font-black text-[#38BDF8] bg-[#38BDF8]/10 w-5 h-5 rounded-full flex items-center justify-center font-mono">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-bold text-slate-200 capitalize">{log.query}</span>
                          </div>
                          <div className="flex items-center gap-3 text-right">
                            <span className="text-xs font-black text-[#F59E0B] font-mono">{log.count} searches</span>
                            <span className="text-[9px] text-slate-500 hidden sm:inline">Last: {new Date(log.lastSearched).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                )}

                {/* 2. Low Stock Alerts Panel */}
                {storeConfig.showLowStockPanel !== false && (
                <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-4 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 
                        onClick={() => {
                          setActiveAdminTab('inventory');
                          setInventoryFilter('low');
                          setInventorySearch('');
                        }}
                        className="font-extrabold text-base text-white font-heading flex items-center gap-2 cursor-pointer hover:text-amber-400 transition-colors"
                        title="Click to view all low stock products in Inventory Manager"
                      >
                        <AlertTriangle className="w-4.5 h-4.5 text-rose-500 animate-pulse" />
                        <span>Low Stock Warnings</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveAdminTab('inventory');
                          setInventoryFilter('low');
                          setInventorySearch('');
                        }}
                        className="px-2.5 py-1 rounded-full bg-rose-500/20 hover:bg-rose-500 hover:text-white text-rose-400 text-[10px] font-extrabold transition-all cursor-pointer shadow-xs"
                      >
                        Urgent Attention ({lowStockProducts.length})
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400">Products with 5 or fewer units left. Refill quickly to avoid losing orders!</p>
                  </div>

                  {lowStockProducts.length === 0 ? (
                    <div className="py-8 text-center text-xs text-emerald-400 font-bold bg-slate-900/50 rounded-2xl border border-slate-700/50 flex items-center justify-center gap-2">
                      <span>✓ All product inventories are fully stocked!</span>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {lowStockProducts.map(prod => {
                        const totalProdStock = prod.variations && prod.variations.length > 0
                          ? prod.variations.reduce((sum, v) => sum + (v.stock || 0), 0)
                          : (prod.sizes && prod.sizes.length > 0
                              ? prod.sizes.reduce((sum, s) => sum + (s.stock || 0), 0)
                              : (prod.stock ?? 0));
                        return (
                          <div 
                            key={prod.id} 
                            onClick={() => {
                              setActiveAdminTab('inventory');
                              setInventoryFilter('low');
                              setInventorySearch(prod.title || prod.sku || '');
                            }} 
                            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-rose-500/20 hover:border-amber-500/60 transition-all cursor-pointer group"
                            title="Click to manage stock in Inventory"
                          >
                            <div className="flex items-center gap-3">
                              <img src={prod.images[0]} alt="" className="w-8 h-10 object-cover rounded-lg bg-slate-950 border border-slate-800" />
                              <div>
                                <p className="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition-colors line-clamp-1">{prod.title}</p>
                                <p className="text-[9px] text-slate-500 font-mono">SKU: {prod.sku || prod.id}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                              {(() => {
                                const st = getProductStockStatus(prod);
                                const isOut = totalProdStock <= 0 || st.isOutOfStock;
                                const hasVarOut = st.hasOutOfStockVariant;
                                return (
                                  <span className={`text-[10px] font-black px-2 py-1 rounded-full border flex items-center gap-1.5 animate-pulse ${
                                    isOut ? 'text-rose-400 bg-rose-500/20 border-rose-500/40' :
                                    hasVarOut ? 'text-rose-400 bg-rose-500/20 border-rose-500/40' :
                                    'text-amber-400 bg-amber-500/10 border-amber-500/20'
                                  }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${isOut || hasVarOut ? 'bg-rose-500' : 'bg-amber-400'}`} />
                                    <span>{isOut ? 'Out of stock' : hasVarOut ? `${st.outOfStockVariantsCount || 1} Variant Finished` : `${totalProdStock} left`}</span>
                                  </span>
                                );
                              })()}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveAdminTab('inventory');
                                  setInventoryFilter('low');
                                  setInventorySearch(prod.title || prod.sku || '');
                                }}
                                className="text-[10px] text-[#38BDF8] hover:text-white hover:underline font-bold cursor-pointer px-2 py-1 rounded bg-slate-800 border border-slate-700"
                              >
                                Refill
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                )}

              </div>
              )}
            </div>
          )}

          {activeAdminTab === 'products' && <ProductManager />}
          {activeAdminTab === 'pre_orders' && <PreOrderManager />}
          {activeAdminTab === 'buy_more' && <BuyMoreManager />}
          {activeAdminTab === 'categories' && <CategoryManager />}
          {activeAdminTab === 'static_pages' && <StaticPageManager />}
          {activeAdminTab === 'order_policy' && <OrderPolicySettingsManager />}
          {activeAdminTab === 'quick_categories' && <QuickCategoryManager />}
          {activeAdminTab === 'attributes' && <AttributeManager />}
          {activeAdminTab === 'orders' && <OrderManager />}
          {activeAdminTab === 'customers' && <CustomerManager />}
          {activeAdminTab === 'hero' && <HeroManager />}
          {activeAdminTab === 'coupons' && <CouponManager />}
          {activeAdminTab === 'reviews' && <ReviewManager />}
          {activeAdminTab === 'inventory' && <InventoryManager />}
          {activeAdminTab === 'settings' && <StoreSettingsManager />}
          {activeAdminTab === 'payment_gateways' && <PaymentSettingsManager />}
          {activeAdminTab === 'seo' && <SeoManager />}
          {activeAdminTab === 'media' && <MediaManager />}
          {activeAdminTab === 'security' && <SecurityManager />}
          {activeAdminTab === 'search_analytics' && <SearchAnalyticsManager />}
          {activeAdminTab === 'access_control' && <AccessControlManager />}

          {/* Floating Shutter Up & Scroll Top Controls */}
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5">
            <button
              type="button"
              onClick={scrollToTop}
              className="p-3 rounded-full bg-slate-800/95 hover:bg-[#38BDF8] text-slate-300 hover:text-slate-950 border border-slate-700 shadow-2xl transition-all hover:scale-110 cursor-pointer backdrop-blur-md"
              title="Scroll to Top"
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => {
                setIsAdminViewingStore(true);
                setIsAdminModalOpen(false);
              }}
              className="px-4 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-2xl transition-all flex items-center gap-2 text-xs font-black cursor-pointer hover:scale-105 border border-emerald-400/40 backdrop-blur-md"
              title="Back to Website"
            >
              <Store className="w-4 h-4" />
              <span>Back to Website</span>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

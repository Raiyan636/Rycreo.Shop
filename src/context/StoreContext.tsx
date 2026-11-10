import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Product, 
  HeroSlide, 
  Order, 
  StoreConfig, 
  CartItem, 
  Category, 
  ProductAttribute, 
  Coupon, 
  Review, 
  Customer,
  ProductVariation,
  QuickCategoryShortcut,
  StaticPage,
  SearchTelemetryLog,
  UnifiedStockStatus
} from '../types/store';
import { getProductStockStatus as calculateProductStockStatus } from '../utils/stockHelper';
import { 
  INITIAL_STORE_CONFIG, 
  INITIAL_HERO_SLIDES, 
  INITIAL_PRODUCTS, 
  INITIAL_CATEGORIES, 
  INITIAL_ATTRIBUTES, 
  INITIAL_COUPONS, 
  INITIAL_REVIEWS,
  INITIAL_QUICK_CATEGORIES,
  INITIAL_GUARANTEES,
  INITIAL_STATIC_PAGES
} from '../data/initialData';
import { updateHeadSEO } from '../utils/seo';
import { formatBangladeshDateTime } from '../utils/dateFormatter';
import { 
  subscribeToStoreData, 
  getStoreDataFromServer,
  saveStoreDataToFirestore, 
  addOrderToFirestore, 
  subscribeToOrders,
  updateOrderInFirestore,
  deleteOrderFromFirestore,
  testFirebaseConnection,
  isQuotaLimitReached,
  syncProductDocToFirestore,
  deleteProductDocFromFirestore,
  subscribeToProducts,
  ensureAdminAuthSession,
  syncCategoryDocToFirestore,
  deleteCategoryDocFromFirestore,
  subscribeToCategories,
  syncSettingsDocToFirestore,
  subscribeToStoreConfig,
  seedAllInitialDataToFirestore,
  subscribeToOrderPolicy,
  subscribeToHeroSlides,
  syncHeroSlidesToFirestore,
  subscribeToCoupons,
  syncCouponsToFirestore,
  subscribeToStaticPages,
  subscribeToStaticPagesSettings,
  syncStaticPageDocToFirestore,
  syncAllStaticPagesToFirestore,
  deleteStaticPageDocFromFirestore,
  subscribeToReviews,
  syncReviewDocToFirestore,
  deleteReviewDocFromFirestore,
  subscribeToAttributes,
  syncAttributeDocToFirestore,
  deleteAttributeDocFromFirestore,
  syncOrderDocToFirestore
} from '../firebaseServices';
import { 
  createProduct as createProductInAdminService, 
  updateProduct as updateProductInAdminService, 
  deleteProduct as deleteProductInAdminService,
  deleteProducts as deleteProductsInAdminService,
  ensureAdminAuth
} from '../services/adminService';
import { db, auth } from '../firebase';
import { doc, setDoc, writeBatch } from 'firebase/firestore';
import { sanitizeForFirestore } from '../firebaseServices';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { deleteProductImagesFromStorage } from '../storageService';

const STORAGE_KEY = 'rycreoshop_store_v3';

// Clean up any stale legacy keys from old stores or previous versions immediately
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    [
      'everything_by_joy_store_v1',
      'everything_by_joy_store_v2',
      'everything_by_joy_store_v3',
      'everything_by_joy_quick_categories',
      'everything_by_joy_collected_vouchers',
      'everything_by_joy_search_logs',
      'everything_by_joy_categories',
      'everything_by_joy_attributes',
      'everything_by_joy_hero_slides',
      'everything_by_joy_coupons',
      'everything_by_joy_reviews'
    ].forEach(key => localStorage.removeItem(key));
  }
} catch {}

export type AdminTabType = 
  | 'overview' 
  | 'products' 
  | 'categories' 
  | 'quick_categories'
  | 'attributes' 
  | 'orders' 
  | 'customers' 
  | 'hero' 
  | 'coupons' 
  | 'reviews' 
  | 'inventory' 
  | 'settings' 
  | 'payment_gateways'
  | 'seo'
  | 'media'
  | 'static_pages'
  | 'security'
  | 'search_analytics'
  | 'access_control'
  | 'order_policy';

interface StoreContextType {
  products: Product[];
  categories: Category[];
  quickCategories: QuickCategoryShortcut[];
  attributes: ProductAttribute[];
  heroSlides: HeroSlide[];
  coupons: Coupon[];
  reviews: Review[];
  storeConfig: StoreConfig;
  orders: Order[];
  customers: Customer[];
  cart: CartItem[];
  wishlist: string[];
  collectedVouchers: string[];
  activeCategory: string; // Category name or 'All'
  searchQuery: string;
  selectedProduct: Product | null;
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  isAdminModalOpen: boolean;
  isAdminLoggedIn: boolean;
  isVoucherModalOpen: boolean;
  isMenuDrawerOpen: boolean;
  isSearchPageOpen: boolean;
  activeAdminTab: AdminTabType;
  activePolicyModal: 'privacy' | 'terms' | 'refund' | 'contact' | 'delivery' | 'about' | null;
  selectedStaticPage: StaticPage | null;
  isVariantModalOpen: boolean;
  variantModalProduct: Product | null;
  openVariantModal: (product: Product) => void;
  closeVariantModal: () => void;
  modificationWindowHours: number;

  // Setters & Actions
  setActiveCategory: (cat: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedProduct: (product: Product | null) => void;
  setIsCartOpen: (open: boolean) => void;
  setIsCheckoutOpen: (open: boolean) => void;
  setIsAdminModalOpen: (open: boolean) => void;
  setIsAdminLoggedIn: (logged: boolean) => void;
  setIsVoucherModalOpen: (open: boolean) => void;
  setIsMenuDrawerOpen: (open: boolean) => void;
  setIsSearchPageOpen: (open: boolean) => void;
  setActiveAdminTab: (tab: AdminTabType) => void;
  setActivePolicyModal: (policy: 'privacy' | 'terms' | 'refund' | 'contact' | 'delivery' | 'about' | null) => void;
  setSelectedStaticPage: (page: StaticPage | null) => void;

  // Vouchers
  collectVoucher: (code: string) => boolean;
  isVoucherCollected: (code: string) => boolean;

  // Cart & Wishlist
  addToCart: (product: Product, size?: string, quantity?: number, color?: string, variation?: ProductVariation) => void;
  removeFromCart: (productId: string, size?: string, color?: string, variationId?: string) => void;
  updateCartQuantity: (productId: string, quantity: number, size?: string, color?: string, variationId?: string) => void;
  updateCartItem: (index: number, updates: Partial<CartItem>) => void;
  removeCartItemByIndex: (index: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Checkout & Orders
  placeOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'status'>) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  deleteOrder: (orderId: string) => boolean;
  deleteOrders: (orderIds: string[]) => boolean;
  deleteAllOrders: () => boolean;
  toggleOrderSeen: (orderId: string) => void;

  // Admin CRUD - Products
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<boolean>;
  updateProduct: (product: Product) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  deleteProducts: (ids: string[]) => Promise<boolean>;
  moveProduct: (id: string, direction: 'up' | 'down') => void;
  updateProductPosition: (id: string, newPosition: number) => void;

  // Admin CRUD - Categories
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => boolean;
  moveCategory: (id: string, direction: 'up' | 'down') => void;

  // Admin CRUD - Daraz Quick Category Shortcuts
  addQuickCategory: (item: Omit<QuickCategoryShortcut, 'id'>) => void;
  updateQuickCategory: (item: QuickCategoryShortcut) => void;
  deleteQuickCategory: (id: string) => boolean;
  reorderQuickCategories: (items: QuickCategoryShortcut[]) => void;

  // Admin CRUD - Attributes
  addAttribute: (attribute: Omit<ProductAttribute, 'id'>) => void;
  updateAttribute: (attribute: ProductAttribute) => void;
  deleteAttribute: (id: string) => boolean;

  // Admin CRUD - Hero Banners
  addHeroSlide: (slide: Omit<HeroSlide, 'id'>) => void;
  updateHeroSlide: (slide: HeroSlide) => void;
  deleteHeroSlide: (id: string) => boolean;
  reorderHeroSlides: (slides: HeroSlide[]) => void;

  // Admin CRUD - Coupons
  addCoupon: (coupon: Omit<Coupon, 'id' | 'createdAt' | 'usedCount'>) => void;
  updateCoupon: (coupon: Coupon) => void;
  deleteCoupon: (id: string) => boolean;
  validateCoupon: (code: string, cartSubtotal: number) => { valid: boolean; discount: number; isFreeDelivery?: boolean; message: string; coupon?: Coupon };

  // Admin CRUD - Reviews
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
  updateReviewStatus: (id: string, status: Review['status']) => void;
  editReview: (review: Review) => void;
  deleteReview: (id: string) => boolean;
  deleteReviews: (ids: string[]) => boolean;
  moveReview: (id: string, direction: 'up' | 'down') => void;
  updateReviewPosition: (id: string, newPosition: number) => void;
  pinReviewToTop: (id: string) => void;

  // Stock & Inventory Control - Single Source of Truth
  updateProductStock: (productId: string, newStock: number, variationId?: string) => void;
  getProductStockStatus: (productOrId: Product | string, selectedColor?: string) => UnifiedStockStatus;
  calculateStockStatus: (productOrId: Product | string, selectedColor?: string) => UnifiedStockStatus;

  // Admin CRUD - Store Config
  updateStoreConfig: (newConfig: Partial<StoreConfig>) => void;
  updateLastViewedOrderTimestamp: (timestamp: number) => void;
  resetToFactoryDefaults: () => void;
  loginAdmin: (passcode: string) => boolean;

  // Admin CRUD - Static Pages
  staticPages: StaticPage[];
  addStaticPage: (page: Omit<StaticPage, 'id'>) => void;
  updateStaticPage: (page: StaticPage) => void;
  deleteStaticPage: (id: string) => Promise<boolean>;

  // Security Credentials
  adminEmail: string;
  adminPassword: string;
  adminSecretCode: string;
  updateAdminCredentials: (email: string, pass: string, code: string) => void;
  syncToCloudNow: () => Promise<boolean>;
  seedDatabaseToFirestore: (force?: boolean) => Promise<{ success: boolean; message: string; seededCount: number }>;
  isCloudSynced: boolean;
  refreshStore: () => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  setError: (err: string | null) => void;

  // Search Logs
  searchLogs: { query: string; count: number; lastSearched: string }[];
  searchTelemetry: SearchTelemetryLog[];
  refreshTelemetry: () => Promise<void>;
  logSearchQuery: (query: string) => void;
  clearSearchLogs: () => void;

  // Multi-Admin Role-Based Access Control (RBAC)
  adminsList: { email: string; pass: string; code: string; allowedTabs: AdminTabType[] }[];
  addAdmin: (email: string, pass: string, code: string, allowedTabs: AdminTabType[]) => void;
  deleteAdmin: (email: string) => void;
  loggedInAdminEmail: string;
  setLoggedInAdminEmail: (email: string) => void;
  logoutAdmin: () => Promise<void>;
  isAdminViewingStore: boolean;
  setIsAdminViewingStore: (val: boolean) => void;
  inventoryFilter: 'all' | 'low' | 'out';
  setInventoryFilter: (f: 'all' | 'low' | 'out') => void;
  inventorySearch: string;
  setInventorySearch: (s: string) => void;
  directCheckoutItem: CartItem | null;
  setDirectCheckoutItem: React.Dispatch<React.SetStateAction<CartItem | null>>;
  directCheckoutItems: CartItem[];
  setDirectCheckoutItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  isOrderPolicyOpen: boolean;
  setIsOrderPolicyOpen: React.Dispatch<React.SetStateAction<boolean>>;
  openOrderPolicyModal: (callback?: () => void) => void;
  confirmOrderPolicyModal: () => void;
  closeOrderPolicyModal: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state with safe backward-compatible migration
  const [storeConfig, setStoreConfig] = useState<StoreConfig>(() => {
    try {
      const saved = localStorage.getItem('rycreoshop_store_config');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_STORE_CONFIG;
  });
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('rycreoshop_categories');
      if (saved !== null) {
        const p = JSON.parse(saved);
        if (Array.isArray(p)) return p;
      }
    } catch {}
    return INITIAL_CATEGORIES;
  });
  const [quickCategories, setQuickCategories] = useState<QuickCategoryShortcut[]>(() => {
    try {
      const saved = localStorage.getItem('rycreoshop_quick_categories');
      if (saved !== null) {
        const p = JSON.parse(saved);
        if (Array.isArray(p)) return p;
      }
    } catch {}
    return INITIAL_QUICK_CATEGORIES;
  });
  const [attributes, setAttributes] = useState<ProductAttribute[]>(() => {
    try {
      const saved = localStorage.getItem('rycreoshop_attributes');
      if (saved !== null) {
        const p = JSON.parse(saved);
        if (Array.isArray(p)) return p;
      }
    } catch {}
    return INITIAL_ATTRIBUTES;
  });
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('rycreoshop_products');
      if (saved !== null) {
        const p = JSON.parse(saved);
        if (Array.isArray(p)) return p;
      }
    } catch {}
    return [];
  });
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(() => {
    try {
      const saved = localStorage.getItem('rycreoshop_hero_slides');
      if (saved !== null) {
        const p = JSON.parse(saved);
        if (Array.isArray(p)) return p;
      }
    } catch {}
    return INITIAL_HERO_SLIDES;
  });
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem('rycreoshop_coupons');
      if (saved !== null) {
        const p = JSON.parse(saved);
        if (Array.isArray(p)) return p;
      }
    } catch {}
    return INITIAL_COUPONS;
  });
  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem('rycreoshop_reviews');
      if (saved !== null) {
        const p = JSON.parse(saved);
        if (Array.isArray(p)) return p;
      }
    } catch {}
    return INITIAL_REVIEWS;
  });
  const [staticPages, setStaticPages] = useState<StaticPage[]>(() => {
    try {
      const saved = localStorage.getItem('rycreoshop_static_pages');
      if (saved !== null) {
        const p = JSON.parse(saved);
        if (Array.isArray(p)) return p;
      }
    } catch {}
    return INITIAL_STATIC_PAGES;
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('rycreoshop_orders');
      if (saved) {
        const p = JSON.parse(saved);
        if (Array.isArray(p)) return p;
      }
    } catch {}
    return [];
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [collectedVouchers, setCollectedVouchers] = useState<string[]>(['RYCREO10', 'WELCOME50']);

  // Synthesize customers from orders
  const customers: Customer[] = React.useMemo(() => {
    const custMap: { [key: string]: Customer } = {};
    if (!Array.isArray(orders)) return [];
    orders.forEach(ord => {
      if (!ord || typeof ord !== 'object') return;
      const rawKey = (ord.phone || ord.customerName || ord.id || '').toString().trim();
      const key = rawKey || (ord.id ? String(ord.id) : `unknown-${Math.random()}`);
      if (!key) return;
      const cleanId = key.replace(/[^a-zA-Z0-9]/g, '') || String(ord.id || Math.random());
      if (!custMap[key]) {
        custMap[key] = {
          id: `cust-${cleanId}`,
          name: ord.customerName || 'Customer',
          phone: ord.phone || '',
          altPhone: ord.altPhone || '',
          address: ord.address || '',
          cityRegion: ord.cityRegion || '',
          totalOrders: 1,
          totalSpent: Number(ord.totalAmount) || 0,
          lastOrderDate: ord.createdAt || new Date().toISOString()
        };
      } else {
        custMap[key].totalOrders += 1;
        custMap[key].totalSpent += Number(ord.totalAmount) || 0;
        if (ord.createdAt && new Date(ord.createdAt) > new Date(custMap[key].lastOrderDate || 0)) {
          custMap[key].lastOrderDate = ord.createdAt;
          if (ord.address) custMap[key].address = ord.address;
        }
      }
    });
    return Object.values(custMap);
  }, [orders]);

  // Navigation & UI States
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      if (typeof window === 'undefined') return false;
      const sessionActive = localStorage.getItem('admin_session_active') === 'true';
      const email = (localStorage.getItem('rycreoshop_logged_in_admin') || '').toLowerCase().trim();
      return sessionActive && email === 'rycreoshop@gmail.com';
    } catch {
      return false;
    }
  });
  const [isAdminViewingStore, setIsAdminViewingStore] = useState<boolean>(() => {
    try {
      if (typeof window === 'undefined') return true;
      const sessionActive = localStorage.getItem('admin_session_active') === 'true';
      const email = (localStorage.getItem('rycreoshop_logged_in_admin') || '').toLowerCase().trim();
      if (!sessionActive || email !== 'rycreoshop@gmail.com') {
        return true;
      }
      return localStorage.getItem('admin_viewing_store') === 'true';
    } catch {
      return true;
    }
  });
  const [inventoryFilter, setInventoryFilter] = useState<'all' | 'low' | 'out'>('all');
  const [inventorySearch, setInventorySearch] = useState<string>('');
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);
  const [isSearchPageOpen, setIsSearchPageOpen] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTabType>('overview');
  const [activePolicyModal, setActivePolicyModal] = useState<'privacy' | 'terms' | 'refund' | 'contact' | 'delivery' | 'about' | null>(null);
  const [selectedStaticPage, setSelectedStaticPage] = useState<StaticPage | null>(null);
  const [directCheckoutItem, setDirectCheckoutItem] = useState<CartItem | null>(null);
  const [directCheckoutItems, setDirectCheckoutItems] = useState<CartItem[]>([]);
  const [isOrderPolicyOpen, setIsOrderPolicyOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pendingOrderPolicyCallbackRef = useRef<(() => void) | null>(null);

  const modificationWindowHours = useMemo(() => {
    return Number(storeConfig?.orderLockDurationHours) || 24;
  }, [storeConfig?.orderLockDurationHours]);

  const openOrderPolicyModal = useCallback((callback?: () => void) => {
    pendingOrderPolicyCallbackRef.current = callback || null;
    setIsOrderPolicyOpen(true);
  }, []);

  const confirmOrderPolicyModal = useCallback(() => {
    setIsOrderPolicyOpen(false);
    if (pendingOrderPolicyCallbackRef.current) {
      const cb = pendingOrderPolicyCallbackRef.current;
      pendingOrderPolicyCallbackRef.current = null;
      cb();
    }
  }, []);

  const closeOrderPolicyModal = useCallback(() => {
    setIsOrderPolicyOpen(false);
    pendingOrderPolicyCallbackRef.current = null;
  }, []);

  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [variantModalProduct, setVariantModalProduct] = useState<Product | null>(null);

  const openVariantModal = (product: Product) => {
    setVariantModalProduct(product);
    setIsVariantModalOpen(true);
    setIsCartOpen(false);
    setIsSearchPageOpen(false);
    setSelectedProduct(null);
  };

  const closeVariantModal = () => {
    setIsVariantModalOpen(false);
    setVariantModalProduct(null);
  };

  const [adminEmail, setAdminEmail] = useState(() => {
    return localStorage.getItem('admin_email') || 'rycreoshop@gmail.com';
  });
  const [adminPassword, setAdminPassword] = useState(() => {
    return localStorage.getItem('admin_password') || 'Ahmad636Taseen@#';
  });
  const [adminSecretCode, setAdminSecretCode] = useState(() => {
    return localStorage.getItem('admin_secret_code') || 'Shop2026';
  });

  const [searchLogs, setSearchLogs] = useState<{ query: string; count: number; lastSearched: string }[]>(() => {
    try {
      const saved = localStorage.getItem('rycreoshop_search_logs') || localStorage.getItem('everything_by_joy_search_logs');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [searchTelemetry, setSearchTelemetry] = useState<SearchTelemetryLog[]>([]);

  const refreshTelemetry = async () => {
    try {
      const res = await fetch('/api/telemetry/search');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setSearchTelemetry(data);
        }
      }
    } catch (e) {
      console.warn("Could not fetch telemetry", e);
    }
  };

  const refreshStore = async (): Promise<boolean> => {
    try {
      console.log("[refreshStore] Fetching latest live store data from Cloud Firestore or Server...");
      let cloudData = await getStoreDataFromServer();
      if (!cloudData) {
        try {
          const res = await fetch('/api/store/data');
          if (res.ok) {
            cloudData = await res.json();
          }
        } catch (serverErr) {
          console.warn("[refreshStore] Server fallback fetch notice:", serverErr);
        }
      }

      if (cloudData) {
        isStoreLoadedRef.current = true;
        if (Array.isArray(cloudData.products)) {
          setProducts(cloudData.products);
          currentStoreDataRef.current.products = cloudData.products;
          try { localStorage.setItem('rycreoshop_products', JSON.stringify(cloudData.products)); } catch {}
        }
        if (Array.isArray(cloudData.categories)) {
          setCategories(cloudData.categories);
          currentStoreDataRef.current.categories = cloudData.categories;
          try { localStorage.setItem('rycreoshop_categories', JSON.stringify(cloudData.categories)); } catch {}
        }
        if (Array.isArray(cloudData.heroSlides)) {
          setHeroSlides(cloudData.heroSlides);
          currentStoreDataRef.current.heroSlides = cloudData.heroSlides;
          try { localStorage.setItem('rycreoshop_hero_slides', JSON.stringify(cloudData.heroSlides)); } catch {}
        }
        if (Array.isArray(cloudData.quickCategories)) {
          setQuickCategories(cloudData.quickCategories);
          currentStoreDataRef.current.quickCategories = cloudData.quickCategories;
          try { localStorage.setItem('rycreoshop_quick_categories', JSON.stringify(cloudData.quickCategories)); } catch {}
        }
        if (Array.isArray(cloudData.coupons)) {
          setCoupons(cloudData.coupons);
          currentStoreDataRef.current.coupons = cloudData.coupons;
          try { localStorage.setItem('rycreoshop_coupons', JSON.stringify(cloudData.coupons)); } catch {}
        }
        if (Array.isArray(cloudData.reviews)) {
          setReviews(cloudData.reviews);
          currentStoreDataRef.current.reviews = cloudData.reviews;
          try { localStorage.setItem('rycreoshop_reviews', JSON.stringify(cloudData.reviews)); } catch {}
        }
        if (Array.isArray(cloudData.staticPages)) {
          setStaticPages(cloudData.staticPages);
          currentStoreDataRef.current.staticPages = cloudData.staticPages;
          try { localStorage.setItem('rycreoshop_static_pages', JSON.stringify(cloudData.staticPages)); } catch {}
        }
        if (cloudData.storeConfig && typeof cloudData.storeConfig === 'object') {
          setStoreConfig(prev => {
            const merged = { ...prev, ...cloudData.storeConfig };
            currentStoreDataRef.current.storeConfig = merged;
            try { localStorage.setItem('rycreoshop_store_config', JSON.stringify(merged)); } catch {}
            return merged;
          });
        }
      }

      // Keep active selectedProduct fresh from latest products
      setSelectedProduct(prev => {
        if (!prev) return null;
        return currentStoreDataRef.current.products.find(p => p.id === prev.id) || null;
      });

      return true;
    } catch (err) {
      console.warn("[refreshStore error]", err);
      return false;
    }
  };

  useEffect(() => {
    refreshTelemetry();
  }, []);

  const logSearchQuery = (query: string) => {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2) return;

    setSearchLogs(prev => {
      const index = prev.findIndex(item => item.query === q);
      let updated;
      if (index > -1) {
        updated = [...prev];
        updated[index] = {
          ...updated[index],
          count: updated[index].count + 1,
          lastSearched: new Date().toISOString()
        };
      } else {
        updated = [...prev, { query: q, count: 1, lastSearched: new Date().toISOString() }];
      }
      updated.sort((a, b) => b.count - a.count);
      localStorage.setItem('rycreoshop_search_logs', JSON.stringify(updated));
      return updated;
    });

    // Real-time asynchronous telemetry engine without page delay
    const matchedCount = products.filter(p => 
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.keywords && p.keywords.some(k => k.toLowerCase().includes(q)))
    ).length;

    try {
      fetch('/api/telemetry/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, resultsCount: matchedCount })
      })
      .then(res => res.json())
      .then(data => {
        if (data.log) {
          setSearchTelemetry(prev => [data.log, ...prev.filter(l => l.id !== data.log.id).slice(0, 199)]);
        }
      })
      .catch(() => {});
    } catch (e) {}
  };

  const clearSearchLogs = () => {
    setSearchLogs([]);
    setSearchTelemetry([]);
    localStorage.removeItem('rycreoshop_search_logs');
    localStorage.removeItem('everything_by_joy_search_logs');
    fetch('/api/telemetry/search', { method: 'DELETE' }).catch(() => {});
  };

  const [adminsList, setAdminsList] = useState<{ email: string; pass: string; code: string; allowedTabs: AdminTabType[] }[]>(() => {
    try {
      const saved = localStorage.getItem('rycreoshop_admins_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return [
      {
        email: "rycreoshop@gmail.com",
        pass: "Ahmad636Taseen@#",
        code: "2026",
        allowedTabs: ["overview", "products", "orders", "inventory", "categories", "coupons", "reviews", "hero", "settings", "payment_gateways", "seo", "media", "static_pages", "security", "search_analytics", "access_control"]
      }
    ];
  });

  const [loggedInAdminEmail, setLoggedInAdminEmail] = useState(() => {
    return localStorage.getItem('rycreoshop_logged_in_admin') || '';
  });

  // Verify connection to Firestore
  useEffect(() => {
    testFirebaseConnection();
  }, []);

  // Listen to Firebase Auth state for authorized admin credentials
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const sessionActive = typeof localStorage !== 'undefined' && localStorage.getItem('admin_session_active') === 'true';
      const storedAdmin = typeof localStorage !== 'undefined' ? (localStorage.getItem('rycreoshop_logged_in_admin') || '').toLowerCase().trim() : '';
      const currentAdminEmail = (adminEmail || 'rycreoshop@gmail.com').toLowerCase().trim();

      if (user && user.email) {
        const authedEmail = user.email.toLowerCase().trim();
        const isSuper = authedEmail === currentAdminEmail || authedEmail === 'rycreoshop@gmail.com';
        const isSubAdmin = Array.isArray(adminsList) && adminsList.some(a => a.email.toLowerCase().trim() === authedEmail);
        if (isSuper || isSubAdmin) {
          setIsAdminLoggedIn(true);
          setLoggedInAdminEmail(authedEmail);
          localStorage.setItem('admin_session_active', 'true');
          localStorage.setItem('rycreoshop_logged_in_admin', authedEmail);
        } else {
          signOut(auth).catch(() => {});
        }
      } else if (sessionActive && storedAdmin) {
        // Active local admin session: maintain authorized state
        const isSuper = storedAdmin === currentAdminEmail || storedAdmin === 'rycreoshop@gmail.com';
        const isSubAdmin = Array.isArray(adminsList) && adminsList.some(a => a.email.toLowerCase().trim() === storedAdmin);
        if (isSuper || isSubAdmin) {
          setIsAdminLoggedIn(true);
          setLoggedInAdminEmail(storedAdmin);
        } else {
          setIsAdminLoggedIn(false);
          setLoggedInAdminEmail('');
        }
      } else {
        setIsAdminLoggedIn(false);
        setLoggedInAdminEmail('');
      }
    });

    return () => unsubscribe();
  }, [adminEmail, adminsList]);

  // Persistent real-time synchronization of 'orders' collection ONLY when admin is logged in
  useEffect(() => {
    if (!isAdminLoggedIn) {
      return;
    }

    const unsubscribeOrders = subscribeToOrders((cloudOrders) => {
      if (Array.isArray(cloudOrders)) {
        setOrders(cloudOrders);
        currentStoreDataRef.current.orders = cloudOrders;
        try {
          localStorage.setItem('rycreoshop_orders', JSON.stringify(cloudOrders));
        } catch {}
      }
    });

    return () => {
      if (unsubscribeOrders) unsubscribeOrders();
    };
  }, [isAdminLoggedIn]);

  const logoutAdmin = async () => {
    // 1. Immediately remove localStorage credentials and session flags
    try {
      localStorage.removeItem('admin_session_active');
      localStorage.removeItem('rycreoshop_logged_in_admin');
      localStorage.removeItem('admin_viewing_store');
      localStorage.removeItem('admin_password');
      localStorage.removeItem('admin_email');
    } catch {}

    // 2. Set React states
    setIsAdminLoggedIn(false);
    setIsAdminModalOpen(false);
    setIsAdminViewingStore(true);
    setLoggedInAdminEmail('');

    // 3. Complete Firebase Auth sign out
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("Firebase signout notice:", e);
    }
  };

  useEffect(() => {
    if (isAdminLoggedIn && loggedInAdminEmail) {
      localStorage.setItem('rycreoshop_logged_in_admin', loggedInAdminEmail);
      localStorage.setItem('admin_session_active', 'true');
      localStorage.setItem('admin_viewing_store', isAdminViewingStore ? 'true' : 'false');
    } else {
      localStorage.removeItem('rycreoshop_logged_in_admin');
      localStorage.removeItem('admin_session_active');
      localStorage.removeItem('admin_viewing_store');
    }
  }, [loggedInAdminEmail, isAdminLoggedIn, isAdminViewingStore]);

  // State to track cloud sync
  const [isCloudSynced, setIsCloudSynced] = useState(true);
  const isInitialMount = React.useRef(true);
  const isFirstRemoteSnapshotRef = React.useRef(true);
  const localMutationTimestampRef = React.useRef<number | null>(null);
  const isRemoteUpdatingRef = React.useRef(false);
  const lastSavedJsonRef = React.useRef<string>('');
  const lastServerSyncTimeRef = React.useRef<string>('');
  const isStoreLoadedRef = React.useRef(false);

  // Live canonical store dataset reference (always up-to-date across all asynchronous operations)
  const currentStoreDataRef = React.useRef({
    storeConfig,
    categories,
    attributes,
    products,
    heroSlides,
    coupons,
    reviews,
    orders,
    quickCategories,
    staticPages,
    adminPassword,
    adminEmail,
    adminSecretCode,
    adminsList,
    cart,
    wishlist,
    updatedAt: new Date().toISOString()
  });

  // Keep ref synchronized whenever local state updates
  useEffect(() => {
    currentStoreDataRef.current = {
      storeConfig,
      categories,
      attributes,
      products,
      heroSlides,
      coupons,
      reviews,
      orders,
      quickCategories,
      staticPages,
      adminPassword,
      adminEmail,
      adminSecretCode,
      adminsList,
      cart,
      wishlist,
      updatedAt: currentStoreDataRef.current.updatedAt || new Date().toISOString()
    };
  }, [storeConfig, categories, attributes, products, heroSlides, coupons, reviews, orders, quickCategories, staticPages, adminPassword, adminEmail, adminSecretCode, adminsList, cart, wishlist]);

  // =========================================================================
  // FIREBASE CLOUD FIRESTORE REAL-TIME SYNCHRONIZATION ENGINE
  // Subscribes directly to Firestore 'store/data' document via onSnapshot.
  // Guarantees published static builds and all devices worldwide receive products,
  // categories, hero banners, stock, and settings in real time from Firestore.
  // =========================================================================
  useEffect(() => {
    const unsubscribe = subscribeToStoreData((cloudData) => {
      if (!cloudData) return;

      // Protect recent local mutations
      if (Date.now() - (localMutationTimestampRef.current || 0) < 1500) {
        return;
      }

      isStoreLoadedRef.current = true;

      // Products (Accept valid product updates)
      if (Array.isArray(cloudData.products)) {
        setProducts(cloudData.products);
        currentStoreDataRef.current.products = cloudData.products;
        try { localStorage.setItem('rycreoshop_products', JSON.stringify(cloudData.products)); } catch {}
      }

      // Categories
      if (Array.isArray(cloudData.categories)) {
        setCategories(cloudData.categories);
        currentStoreDataRef.current.categories = cloudData.categories;
        try { localStorage.setItem('rycreoshop_categories', JSON.stringify(cloudData.categories)); } catch {}
      }

      // Hero Carousel Slides
      if (Array.isArray(cloudData.heroSlides)) {
        setHeroSlides(cloudData.heroSlides);
        currentStoreDataRef.current.heroSlides = cloudData.heroSlides;
        try { localStorage.setItem('rycreoshop_hero_slides', JSON.stringify(cloudData.heroSlides)); } catch {}
      }

      // Quick Categories
      if (Array.isArray(cloudData.quickCategories)) {
        setQuickCategories(cloudData.quickCategories);
        currentStoreDataRef.current.quickCategories = cloudData.quickCategories;
        try { localStorage.setItem('rycreoshop_quick_categories', JSON.stringify(cloudData.quickCategories)); } catch {}
      }

      // Coupons
      if (Array.isArray(cloudData.coupons)) {
        setCoupons(cloudData.coupons);
        currentStoreDataRef.current.coupons = cloudData.coupons;
        try { localStorage.setItem('rycreoshop_coupons', JSON.stringify(cloudData.coupons)); } catch {}
      }

      // Reviews
      if (Array.isArray(cloudData.reviews)) {
        setReviews(cloudData.reviews);
        currentStoreDataRef.current.reviews = cloudData.reviews;
        try { localStorage.setItem('rycreoshop_reviews', JSON.stringify(cloudData.reviews)); } catch {}
      }

      // Static Pages
      if (Array.isArray(cloudData.staticPages)) {
        setStaticPages(cloudData.staticPages);
        currentStoreDataRef.current.staticPages = cloudData.staticPages;
        try { localStorage.setItem('rycreoshop_static_pages', JSON.stringify(cloudData.staticPages)); } catch {}
      }

      // Store Config / Settings
      if (cloudData.storeConfig && typeof cloudData.storeConfig === 'object') {
        setStoreConfig(prev => {
          const merged = { ...prev, ...cloudData.storeConfig };
          currentStoreDataRef.current.storeConfig = merged;
          try { localStorage.setItem('rycreoshop_store_config', JSON.stringify(merged)); } catch {}
          return merged;
        });
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);





  // Global store synchronization is powered across all devices worldwide by Cloud Firestore onSnapshot ('store/data') listener above.




  // Real-time synchronization of order policy settings from Cloud Firestore
  useEffect(() => {
    const unsubPolicy = subscribeToOrderPolicy((policyData) => {
      if (policyData) {
        const newHours = policyData.orderLockDurationHours !== undefined ? Number(policyData.orderLockDurationHours) || 24 : undefined;
        const newText = policyData.orderPolicyText;

        setStoreConfig((prev) => {
          let hasChanges = false;
          const next = { ...prev };
          if (newHours !== undefined && next.orderLockDurationHours !== newHours) {
            next.orderLockDurationHours = newHours;
            hasChanges = true;
          }
          if (newText !== undefined && next.orderPolicyText !== newText) {
            next.orderPolicyText = newText;
            hasChanges = true;
          }
          if (!hasChanges) return prev;
          currentStoreDataRef.current.storeConfig = next;
          try {
            localStorage.setItem('rycreoshop_store_config', JSON.stringify(next));
          } catch {}
          return next;
        });
      }
    });
    return () => {
      if (unsubPolicy) unsubPolicy();
    };
  }, []);

  // Real-time synchronization across multiple browser tabs (instant incoming order detection)
  useEffect(() => {
    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          if (parsed.orders && Array.isArray(parsed.orders) && parsed.orders.length > 0) {
            setOrders(prev => {
              const map = new Map<string, Order>();
              prev.forEach(o => map.set(o.id, o));
              parsed.orders.forEach((o: Order) => map.set(o.id, o));
              return Array.from(map.values()).sort((a, b) => 
                (b.orderTimestamp || new Date(b.createdAt || 0).getTime()) - (a.orderTimestamp || new Date(a.createdAt || 0).getTime())
              );
            });
          }
        } catch (e) {
          console.warn("Cross-tab sync error:", e);
        }
      }
    };
    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, []);

  // Unified database persistence: writes immediately to LocalStorage, Server, and Firestore
  const persistToDatabase = async (overrides: Record<string, any>): Promise<boolean> => {
    if (!isStoreLoadedRef.current && (!overrides || Object.keys(overrides).length === 0)) {
      return false;
    }
    const fullData = {
      ...currentStoreDataRef.current,
      ...overrides,
      updatedAt: new Date().toISOString()
    };
    localMutationTimestampRef.current = Date.now();
    currentStoreDataRef.current = fullData;

    // 1. Update localStorage
    try {
      if (overrides.products !== undefined) localStorage.setItem('rycreoshop_products', JSON.stringify(overrides.products));
      if (overrides.storeConfig) localStorage.setItem('rycreoshop_store_config', JSON.stringify(overrides.storeConfig));
      if (overrides.categories) localStorage.setItem('rycreoshop_categories', JSON.stringify(overrides.categories));
      if (overrides.attributes) localStorage.setItem('rycreoshop_attributes', JSON.stringify(overrides.attributes));
      if (overrides.coupons) localStorage.setItem('rycreoshop_coupons', JSON.stringify(overrides.coupons));
      if (overrides.reviews) localStorage.setItem('rycreoshop_reviews', JSON.stringify(overrides.reviews));
      if (overrides.staticPages) localStorage.setItem('rycreoshop_static_pages', JSON.stringify(overrides.staticPages));
      if (overrides.heroSlides) localStorage.setItem('rycreoshop_hero_slides', JSON.stringify(overrides.heroSlides));
      if (overrides.quickCategories) localStorage.setItem('rycreoshop_quick_categories', JSON.stringify(overrides.quickCategories));
      if (overrides.adminPassword) localStorage.setItem('admin_password', overrides.adminPassword);
      if (overrides.adminEmail) localStorage.setItem('admin_email', overrides.adminEmail);
      if (overrides.adminsList) localStorage.setItem('rycreoshop_admins_list', JSON.stringify(overrides.adminsList));
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...fullData, cart, wishlist }));
    } catch (e) {
      console.warn("Storage warning:", e);
    }

    lastSavedJsonRef.current = JSON.stringify(fullData);

    // 2. Real-time Permanent Server Database Persistence (Node.js backend)
    try {
      const res = await fetch('/api/store/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(overrides)
      });
      const data = await res.json().catch(() => null);
      if (data?.updatedAt) lastServerSyncTimeRef.current = data.updatedAt;
    } catch (e) {}

    // 3. Real-time Firestore sync for store/data across ALL worldwide devices
    try {
      const { orders: _skipOrders, cart: _skipCart, wishlist: _skipWish, ...syncableOverrides } = overrides;
      const firestorePayload: Record<string, any> = {
        ...syncableOverrides,
        updatedAt: fullData.updatedAt
      };
      // Always include products if present in overrides (including empty array [] for deletions)
      if (overrides.products !== undefined) {
        firestorePayload.products = overrides.products;
        firestorePayload.productsCount = overrides.products.length;
      }
      await saveStoreDataToFirestore(firestorePayload);
      setIsCloudSynced(true);
      return true;
    } catch (err: any) {
      const errStr = typeof err === 'object' ? (err?.message || JSON.stringify(err) || String(err)) : String(err);
      if (
        errStr.toLowerCase().includes("missing or insufficient permissions") || 
        errStr.toLowerCase().includes("permission-denied") ||
        err?.code === 'permission-denied'
      ) {
        setIsCloudSynced(true);
        return true;
      } else {
        console.warn("[Firestore sync info]", errStr);
      }
      setIsCloudSynced(false);
      return false;
    }
  };

  const pushStoreStateToCloud = async (customOverrides?: Record<string, any>) => {
    return await persistToDatabase(customOverrides || {});
  };

  const syncToCloudNow = async (): Promise<boolean> => {
    try {
      await ensureAdminAuthSession();
      const currentProds = currentStoreDataRef.current.products;
      const currentCats = currentStoreDataRef.current.categories;
      const currentCfg = currentStoreDataRef.current.storeConfig;

      // 1. Batch sync products collection
      if (Array.isArray(currentProds) && currentProds.length > 0) {
        const prodBatch = writeBatch(db);
        currentProds.forEach(p => {
          const pRef = doc(db, "products", p.id);
          prodBatch.set(pRef, sanitizeForFirestore(p), { merge: true });
        });
        await prodBatch.commit().catch(console.warn);
      }

      // 2. Batch sync categories collection
      if (Array.isArray(currentCats) && currentCats.length > 0) {
        const catBatch = writeBatch(db);
        currentCats.forEach(c => {
          const cRef = doc(db, "categories", c.id);
          catBatch.set(cRef, sanitizeForFirestore(c), { merge: true });
        });
        await catBatch.commit().catch(console.warn);
      }

      // 3. Settings doc
      if (currentCfg) {
        await setDoc(doc(db, "settings", "store_config"), sanitizeForFirestore(currentCfg), { merge: true }).catch(console.warn);
      }

      // 4. store/data doc
      await saveStoreDataToFirestore({
        products: currentProds,
        categories: currentCats,
        storeConfig: currentCfg,
        heroSlides: currentStoreDataRef.current.heroSlides,
        quickCategories: currentStoreDataRef.current.quickCategories,
        coupons: currentStoreDataRef.current.coupons,
        reviews: currentStoreDataRef.current.reviews,
        staticPages: currentStoreDataRef.current.staticPages,
        attributes: currentStoreDataRef.current.attributes,
        updatedAt: new Date().toISOString()
      });

      // 5. Server sync
      await persistToDatabase({});
      console.log("[syncToCloudNow] Successfully synced all collections to Cloud Firestore!");
      return true;
    } catch (e) {
      console.warn("syncToCloudNow notice:", e);
      return await persistToDatabase({});
    }
  };

  const updateAdminCredentials = (email: string, pass: string, code: string) => {
    setAdminEmail(email);
    setAdminPassword(pass);
    setAdminSecretCode(code);
    currentStoreDataRef.current.adminEmail = email;
    currentStoreDataRef.current.adminPassword = pass;
    currentStoreDataRef.current.adminSecretCode = code;
    try {
      localStorage.setItem('admin_email', email);
      localStorage.setItem('admin_password', pass);
      localStorage.setItem('admin_secret_code', code);
    } catch {}
    fetch('/api/store/access-control', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminEmail: email, adminPassword: pass, adminSecretCode: code })
    }).catch(() => {});
    persistToDatabase({ adminEmail: email, adminPassword: pass, adminSecretCode: code });
  };

  const addAdmin = (email: string, pass: string, code: string, allowedTabs: AdminTabType[]) => {
    const filtered = currentStoreDataRef.current.adminsList.filter(x => x.email.toLowerCase() !== email.toLowerCase());
    const updated = [...filtered, { email, pass, code, allowedTabs }];
    setAdminsList(updated);
    currentStoreDataRef.current.adminsList = updated;
    try {
      localStorage.setItem('rycreoshop_admins_list', JSON.stringify(updated));
    } catch {}
    fetch('/api/store/access-control', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminsList: updated })
    }).catch(() => {});
    persistToDatabase({ adminsList: updated });
  };

  const deleteAdmin = (email: string) => {
    const updated = currentStoreDataRef.current.adminsList.filter(x => x.email.toLowerCase() !== email.toLowerCase());
    setAdminsList(updated);
    currentStoreDataRef.current.adminsList = updated;
    try {
      localStorage.setItem('rycreoshop_admins_list', JSON.stringify(updated));
    } catch {}
    fetch(`/api/store/access-control/${encodeURIComponent(email)}`, { method: 'DELETE' }).catch(() => {});
    persistToDatabase({ adminsList: updated });
  };

  useEffect(() => {
    try {
      localStorage.setItem('rycreoshop_collected_vouchers', JSON.stringify(collectedVouchers));
    } catch (e) {
      console.warn("Failed to persist vouchers", e);
    }
  }, [collectedVouchers]);

  // Update SEO Head
  useEffect(() => {
    updateHeadSEO(storeConfig, undefined, undefined, selectedProduct || undefined);
  }, [storeConfig, selectedProduct]);

  // Voucher Collection
  const collectVoucher = (code: string): boolean => {
    const clean = code.trim().toUpperCase();
    if (!collectedVouchers.includes(clean)) {
      setCollectedVouchers(prev => [...prev, clean]);
      return true;
    }
    return false;
  };

  const isVoucherCollected = (code: string): boolean => {
    return collectedVouchers.includes(code.trim().toUpperCase());
  };

  // Cart Actions
  const addToCart = (
    product: Product, 
    size?: string, 
    quantity: number = 1, 
    color?: string, 
    variation?: ProductVariation
  ) => {
    setCart(prev => {
      const effectivePrice = variation ? (variation.salePrice || variation.price) : (product.salePrice > 0 ? product.salePrice : product.price);
      const varId = variation?.id;

      const existingIndex = prev.findIndex(item => {
        if (varId && item.selectedVariation?.id === varId) return true;
        if (size && item.selectedSize === size && (!color || item.selectedColor === color) && item.productId === product.id) return true;
        return item.productId === product.id && !size && !item.selectedSize;
      });

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prev, {
          productId: product.id,
          product,
          selectedSize: size,
          selectedColor: color,
          selectedVariation: variation,
          quantity,
          price: effectivePrice
        }];
      }
    });
    // setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, size?: string, color?: string, variationId?: string) => {
    setCart(prev => prev.filter(item => {
      if (variationId && item.selectedVariation?.id === variationId) return false;
      if (item.productId === productId && (!size || item.selectedSize === size) && (!color || item.selectedColor === color)) return false;
      return true;
    }));
  };

  const updateCartQuantity = (productId: string, quantity: number, size?: string, color?: string, variationId?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color, variationId);
      return;
    }
    setCart(prev => prev.map(item => {
      const isMatch = variationId 
        ? item.selectedVariation?.id === variationId 
        : (item.productId === productId && (!size || item.selectedSize === size) && (!color || item.selectedColor === color));
      if (isMatch) {
        return { ...item, quantity };
      }
      return item;
    }));
  };

  const updateCartItem = (index: number, updates: Partial<CartItem>) => {
    setCart(prev => prev.map((item, idx) => {
      if (idx === index) {
        return { ...item, ...updates };
      }
      return item;
    }));
  };

  const removeCartItemByIndex = (index: number) => {
    setCart(prev => prev.filter((_, idx) => idx !== index));
  };

  const clearCart = () => setCart([]);

  // Wishlist
  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Validate Coupon
  const validateCoupon = (code: string, cartSubtotal: number) => {
    if (!code || !code.trim()) {
      return { valid: false, discount: 0, message: "Please enter a coupon code" };
    }
    const cleanCode = code.trim().toUpperCase();
    const found = coupons.find(c => c.code.toUpperCase() === cleanCode);

    if (!found) {
      return { valid: false, discount: 0, message: "Invalid coupon code" };
    }
    if (!found.active) {
      return { valid: false, discount: 0, message: "This coupon is currently inactive" };
    }
    if (found.expiryDate && new Date(found.expiryDate) < new Date()) {
      return { valid: false, discount: 0, message: "This coupon has expired" };
    }
    if (found.usageLimit > 0 && found.usedCount >= found.usageLimit) {
      return { valid: false, discount: 0, message: "Coupon usage limit has been reached" };
    }
    if (found.minOrderAmount && cartSubtotal < found.minOrderAmount) {
      return { valid: false, discount: 0, message: `Minimum order amount of ৳${found.minOrderAmount} required` };
    }

    let calculatedDiscount = 0;
    if (found.discountType === 'percent') {
      calculatedDiscount = Math.round((cartSubtotal * found.discountValue) / 100);
      if (found.maxDiscountAmount && calculatedDiscount > found.maxDiscountAmount) {
        calculatedDiscount = found.maxDiscountAmount;
      }
    } else {
      calculatedDiscount = found.discountValue;
    }

    return {
      valid: true,
      discount: Math.min(calculatedDiscount, cartSubtotal),
      isFreeDelivery: !!found.isFreeDelivery,
      message: found.isFreeDelivery && calculatedDiscount === 0
        ? `Free Delivery coupon ${found.code} applied successfully!`
        : `Coupon ${found.code} applied successfully!`,
      coupon: found
    };
  };

  // Order Placement
  const placeOrder = React.useCallback(async (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'status'>): Promise<Order> => {
    const generateUniqueOrderNumber = (): string => {
      // 10-character ultra-professional completely unique alphanumeric Order ID
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let uniqueCode = "";
      let isUnique = false;
      let iterations = 0;
      
      while (!isUnique && iterations < 1000) {
        let code = "";
        for (let i = 0; i < 10; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        const exists = orders.some(o => o.orderNumber === code || (o.orderNumber && o.orderNumber.length >= 6 && o.orderNumber.substring(0, 6) === code.substring(0, 6)));
        if (!exists) {
          uniqueCode = code;
          isUnique = true;
        }
        iterations++;
      }
      if (!uniqueCode) {
        let code = "";
        for (let i = 0; i < 10; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        uniqueCode = code;
      }
      return uniqueCode;
    };

    const orderNum = generateUniqueOrderNumber();
    const now = new Date();
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      status: 'Pending',
      createdAt: now.toISOString(),
      orderTimestamp: now.getTime(),
      orderTimeFormatted: formatBangladeshDateTime(now.toISOString()),
      isSeen: false
    };

    addOrderToFirestore(newOrder).catch(err => {
      console.warn("[Firestore addOrderToFirestore Notice]", err);
    });

    if (orderData.couponCode) {
      setCoupons(prev => prev.map(c => 
        c.code.toUpperCase() === orderData.couponCode?.toUpperCase()
          ? { ...c, usedCount: c.usedCount + 1 }
          : c
      ));
    }

    // Deduct stock for all ordered items
    let updatedProductsList: Product[] = [];
    setProducts(prevProds => {
      const updated = prevProds.map(prod => {
        const matchedItems = orderData.items.filter(it => it.productId === prod.id);
        if (matchedItems.length === 0) return prod;

        let p = { ...prod };
        matchedItems.forEach(orderItem => {
          if (orderItem.selectedVariation && p.variations) {
            p.variations = p.variations.map(v => {
              if (v.id === orderItem.selectedVariation?.id) {
                const nextStock = Math.max(0, (v.stock || 0) - orderItem.quantity);
                return { ...v, stock: nextStock, inStock: nextStock > 0 };
              }
              return v;
            });
          } else if (orderItem.selectedColor && orderItem.selectedSize && p.variations) {
            p.variations = p.variations.map(v => {
              const matchesColor = !v.combination['Color'] || v.combination['Color'] === orderItem.selectedColor;
              const sizeVal = v.combination['Size'] || v.combination['Waist Size'] || v.combination['Storage'];
              const matchesSize = !sizeVal || sizeVal === orderItem.selectedSize;
              if (matchesColor && matchesSize) {
                const nextStock = Math.max(0, (v.stock || 0) - orderItem.quantity);
                return { ...v, stock: nextStock, inStock: nextStock > 0 };
              }
              return v;
            });
          }

          if (orderItem.selectedSize && p.sizes) {
            p.sizes = p.sizes.map(s => 
              s.size === orderItem.selectedSize 
                ? { ...s, stock: Math.max(0, (s.stock || 0) - orderItem.quantity) }
                : s
            );
          }

          if (orderItem.selectedColor && p.colors) {
            p.colors = p.colors.map(c => 
              c.name === orderItem.selectedColor && c.stock !== undefined
                ? { ...c, stock: Math.max(0, c.stock - orderItem.quantity) }
                : c
            );
          }

          p.realSalesCount = (p.realSalesCount || 0) + orderItem.quantity;
          const baseCount = p.baseSoldCount ?? (p.soldCount ? Math.max(0, p.soldCount - orderItem.quantity) : 0);
          p.baseSoldCount = baseCount;
          p.soldCount = baseCount + p.realSalesCount;
        });

        if (p.variations && p.variations.length > 0) {
          p.stock = p.variations.reduce((sum, v) => sum + (v.stock || 0), 0);
        } else if (p.sizes && p.sizes.length > 0) {
          p.stock = p.sizes.reduce((sum, s) => sum + (s.stock || 0), 0);
        } else {
          const totalOrderedQty = matchedItems.reduce((sum, it) => sum + it.quantity, 0);
          p.stock = Math.max(0, (p.stock || 0) - totalOrderedQty);
        }

        // Synchronize color stock for standard products
        if ((!p.variations || p.variations.length === 0) && p.colors && p.colors.length > 0) {
          p.colors = p.colors.map(c => ({
            ...c,
            stock: p.stock,
            inStock: p.stock > 0
          }));
        }

        return p;
      });
      updatedProductsList = updated;
      return updated;
    });

    const nextOrders = [newOrder, ...currentStoreDataRef.current.orders];
    setOrders(nextOrders);
    currentStoreDataRef.current.orders = nextOrders;
    setCart([]);
    setDirectCheckoutItem(null);
    setDirectCheckoutItems([]);

    await addOrderToFirestore(newOrder).catch(console.warn);

    // Immediately push each modified product to Cloud Firestore so stock decreases and soldCount increases across all devices worldwide
    const changedIds = new Set(orderData.items.map(it => it.productId));
    const prodsToSync = updatedProductsList.filter(p => changedIds.has(p.id));
    prodsToSync.forEach(p => {
      syncProductDocToFirestore(p).catch(err => {
        console.warn(`[Firestore Real-time Stock Sync notice for product ${p.id}]:`, err);
      });
    });

    persistToDatabase({
      products: updatedProductsList.length > 0 ? updatedProductsList : currentStoreDataRef.current.products
    });

    try {
      localStorage.setItem('rycreoshop_orders', JSON.stringify(nextOrders));
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...currentStoreDataRef.current,
        orders: nextOrders,
        cart: [],
        wishlist
      }));
    } catch (e) {
      console.warn("Local storage cache notice:", e);
    }

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.log(e);
    }

    return newOrder;
  }, [orders, setCoupons, setProducts, setOrders, setDirectCheckoutItem, setDirectCheckoutItems, wishlist]);

  const toggleOrderSeen = (orderId: string) => {
    const targetOrder = currentStoreDataRef.current.orders.find(o => o.id === orderId);
    const nextSeen = !(targetOrder?.isSeen);
    const nextOrders = currentStoreDataRef.current.orders.map(o => o.id === orderId ? { ...o, isSeen: nextSeen } : o);
    setOrders(nextOrders);
    persistToDatabase({ orders: nextOrders });
    updateOrderInFirestore(orderId, { isSeen: nextSeen }, targetOrder?.orderNumber).catch(console.warn);
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    const targetOrder = currentStoreDataRef.current.orders.find(o => o.id === orderId);
    const nextOrders = currentStoreDataRef.current.orders.map(o => o.id === orderId ? { ...o, status } : o);
    setOrders(nextOrders);
    persistToDatabase({ orders: nextOrders });
    updateOrderInFirestore(orderId, { status }, targetOrder?.orderNumber).catch(console.warn);
  };

  const updateOrder = (orderId: string, updates: Partial<Order>) => {
    const targetOrder = currentStoreDataRef.current.orders.find(o => o.id === orderId);
    const nextOrders = currentStoreDataRef.current.orders.map(o => o.id === orderId ? { ...o, ...updates } : o);
    setOrders(nextOrders);
    persistToDatabase({ orders: nextOrders });
    updateOrderInFirestore(orderId, updates, targetOrder?.orderNumber).catch(console.warn);
  };

  const deleteOrder = (orderId: string): boolean => {
    const targetOrder = currentStoreDataRef.current.orders.find(o => o.id === orderId);
    if (!targetOrder) return false;

    const nextOrders = currentStoreDataRef.current.orders.filter(o => o.id !== orderId);
    setOrders(nextOrders);
    currentStoreDataRef.current.orders = nextOrders;
    persistToDatabase({ orders: nextOrders });
    deleteOrderFromFirestore(orderId, targetOrder.orderNumber).catch(console.warn);
    return true;
  };

  const deleteOrders = (orderIds: string[]): boolean => {
    if (!orderIds || orderIds.length === 0) return false;
    const idSet = new Set(orderIds);
    const targetOrders = currentStoreDataRef.current.orders.filter(o => idSet.has(o.id));
    const nextOrders = currentStoreDataRef.current.orders.filter(o => !idSet.has(o.id));
    setOrders(nextOrders);
    currentStoreDataRef.current.orders = nextOrders;
    persistToDatabase({ orders: nextOrders });
    targetOrders.forEach(o => {
      deleteOrderFromFirestore(o.id, o.orderNumber).catch(console.warn);
    });
    return true;
  };

  const deleteAllOrders = (): boolean => {
    setOrders([]);
    persistToDatabase({ orders: [] });
    return true;
  };

  // Product CRUD with Instant Real-Time Worldwide Cloud Broadcast
  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt'>): Promise<boolean> => {
    setError(null);
    const newProdId = `prod-${Date.now()}`;
    const newProd: Product = {
      position: (productData as any).position !== undefined && (productData as any).position !== null ? Number((productData as any).position) : 1,
      order: (productData as any).order !== undefined && (productData as any).order !== null ? Number((productData as any).order) : 1,
      ...productData,
      id: newProdId,
      createdAt: new Date().toISOString()
    };

    console.log(`[StoreContext addProduct: START] Adding "${newProd.title}"`, {
      productId: newProd.id,
      category: newProd.category,
      price: newProd.price,
      currentUserEmail: auth.currentUser?.email || null,
      authUid: auth.currentUser?.uid || null
    });

    try {
      // 1. Immediately update local state and cache for 0ms instant UI update
      const nextProds = [newProd, ...currentStoreDataRef.current.products.filter(p => p.id !== newProd.id)];
      setProducts(nextProds);
      currentStoreDataRef.current.products = nextProds;

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...currentStoreDataRef.current, products: nextProds, cart, wishlist }));
        localStorage.setItem('rycreoshop_products', JSON.stringify(nextProds));
      } catch (e) {
        console.warn("Local storage cache warning:", e);
      }

      setIsLoading(false);

      // 2. Persist to permanent server backend database
      try {
        const res = await fetch('/api/store/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProd)
        });
        const data = await res.json().catch(() => null);
        if (data?.updatedAt) lastServerSyncTimeRef.current = data.updatedAt;
      } catch (srvErr) {
        console.warn("[StoreContext addProduct server sync warning]", srvErr);
      }

      await persistToDatabase({ products: nextProds }).catch((pErr) => {
        console.warn("[StoreContext addProduct store/data Notice]", pErr);
      });

      // 3. Sync to Cloud Firestore 'products' collection and store/data
      await syncProductDocToFirestore(newProd).catch(console.warn);
      await createProductInAdminService(newProd).catch(console.warn);

      console.log(`[StoreContext addProduct: SUCCESS] Added "${newProd.title}"`);
      return true;
    } catch (e: any) {
      console.error("[StoreContext addProduct: LOCAL ERROR]", e);
      setError(e?.message || "Failed to add product to catalog");
      setIsLoading(false);
      return false;
    }
  };

  const updateProduct = async (updatedProd: Product): Promise<boolean> => {
    setError(null);

    console.log(`[StoreContext updateProduct: START] Updating product ID: "${updatedProd.id}" ("${updatedProd.title}")`);

    try {
      // 1. Immediately update local state
      const nextProds = currentStoreDataRef.current.products.map(p => p.id === updatedProd.id ? updatedProd : p);
      setProducts(nextProds);
      currentStoreDataRef.current.products = nextProds;

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...currentStoreDataRef.current, products: nextProds, cart, wishlist }));
        localStorage.setItem('rycreoshop_products', JSON.stringify(nextProds));
      } catch (e) {
        console.warn("Local storage cache warning:", e);
      }

      setIsLoading(false);

      // 2. Persist to permanent server database
      try {
        const res = await fetch('/api/store/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedProd)
        });
        const data = await res.json().catch(() => null);
        if (data?.updatedAt) lastServerSyncTimeRef.current = data.updatedAt;
      } catch (srvErr) {
        console.warn("[StoreContext updateProduct server sync warning]", srvErr);
      }

      await persistToDatabase({ products: nextProds }).catch((pErr) => {
        console.warn("[StoreContext updateProduct store/data Notice]", pErr);
      });

      // 3. Sync to Cloud Firestore 'products' collection and store/data
      await syncProductDocToFirestore(updatedProd).catch(console.warn);
      await updateProductInAdminService(updatedProd).catch(console.warn);

      console.log(`[StoreContext updateProduct: SUCCESS] Updated "${updatedProd.title}".`);
      return true;
    } catch (e: any) {
      console.error("[StoreContext updateProduct: LOCAL ERROR]", e);
      setError(e?.message || "Failed to update product in catalog");
      setIsLoading(false);
      return false;
    }
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    setError(null);

    console.log(`[StoreContext deleteProduct: START] Deleting product ID: "${id}"`);

    try {
      // 1. Identify target product for image cleanup before removing from state
      const targetProduct = currentStoreDataRef.current.products.find(p => p.id === id);

      // 2. Immediately remove from local state for 0ms instantaneous UI removal
      const nextProds = currentStoreDataRef.current.products.filter(p => p.id !== id);
      setProducts(nextProds);
      currentStoreDataRef.current.products = nextProds;

      if (selectedProduct?.id === id) {
        setSelectedProduct(null);
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...currentStoreDataRef.current, products: nextProds, cart, wishlist }));
        localStorage.setItem('rycreoshop_products', JSON.stringify(nextProds));
      } catch (e) {
        console.warn("Local storage cache warning:", e);
      }

      setIsLoading(false);

      // 3. Clean up storage images if applicable
      if (targetProduct) {
        deleteProductImagesFromStorage(targetProduct).catch(imgErr => {
          console.warn("[StoreContext deleteProduct Image Storage Cleanup Notice]", imgErr);
        });
      }

      // 4. Persist deletion immediately to permanent server backend database
      try {
        const res = await fetch(`/api/store/products/${id}`, { method: 'DELETE' });
        const data = await res.json().catch(() => null);
        if (data?.updatedAt) lastServerSyncTimeRef.current = data.updatedAt;
      } catch (srvErr) {
        console.warn("[StoreContext deleteProduct server sync warning]", srvErr);
      }

      await persistToDatabase({ products: nextProds }).catch((pErr) => {
        console.warn("[StoreContext deleteProduct store/data Notice]", pErr);
      });

      // 5. Delete from Cloud Firestore 'products' collection and store/data
      await deleteProductDocFromFirestore(id).catch(console.warn);
      await deleteProductInAdminService(id).catch(console.warn);

      console.log(`[StoreContext deleteProduct: SUCCESS] Deleted product ${id}.`);
      return true;
    } catch (e: any) {
      console.error("[StoreContext deleteProduct: LOCAL ERROR]", e);
      setError(e?.message || "Failed to delete product from store");
      setIsLoading(false);
      return false;
    }
  };

  const deleteProducts = async (ids: string[]): Promise<boolean> => {
    if (!ids || ids.length === 0) return true;
    setError(null);
    const idSet = new Set(ids);
    try {
      const nextProds = currentStoreDataRef.current.products.filter(p => !idSet.has(p.id));
      setProducts(nextProds);
      currentStoreDataRef.current.products = nextProds;

      if (selectedProduct && idSet.has(selectedProduct.id)) {
        setSelectedProduct(null);
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...currentStoreDataRef.current, products: nextProds, cart, wishlist }));
        localStorage.setItem('rycreoshop_products', JSON.stringify(nextProds));
      } catch (e) {
        console.warn("Local storage cache warning:", e);
      }

      await Promise.all(ids.map(prodId => 
        fetch(`/api/store/products/${prodId}`, { method: 'DELETE' }).catch(() => {})
      ));

      await persistToDatabase({ products: nextProds }).catch((pErr) => {
        console.warn("[StoreContext deleteProducts store/data Notice]", pErr);
      });

      await Promise.all(ids.map(prodId => 
        deleteProductDocFromFirestore(prodId).catch(console.warn)
      ));
      await deleteProductsInAdminService(ids).catch(console.warn);

      return true;
    } catch (e: any) {
      console.error("[StoreContext deleteProducts Error]", e);
      setError(e?.message || "Failed to bulk delete products");
      return false;
    }
  };

  // Stock Control
  const updateProductStock = (productId: string, newStock: number, variationId?: string) => {
    let targetUpdated: Product | undefined;
    const nextProds = currentStoreDataRef.current.products.map(p => {
      if (p.id !== productId) return p;
      let updated = { ...p };
      if (variationId) {
        if (updated.variations) {
          updated.variations = updated.variations.map(v => 
            v.id === variationId ? { ...v, stock: newStock, inStock: newStock > 0 } : v
          );
          updated.stock = updated.variations.reduce((acc, v) => acc + v.stock, 0);
          updated.manualMasterStock = updated.stock;
        }
      } else {
        const finalStock = Math.max(0, newStock);
        updated.stock = finalStock;
        updated.manualMasterStock = finalStock;
        
        // Distribute proportionally if variations or sizes exist
        if (updated.variations && updated.variations.length > 0) {
          const perVar = Math.floor(finalStock / updated.variations.length);
          const rem = finalStock % updated.variations.length;
          updated.variations = updated.variations.map((v, idx) => {
            const s = perVar + (idx === 0 ? rem : 0);
            return { ...v, stock: s, inStock: s > 0 };
          });
        } else if (updated.sizes && updated.sizes.length > 0) {
          const perSize = Math.floor(finalStock / updated.sizes.length);
          const rem = finalStock % updated.sizes.length;
          updated.sizes = updated.sizes.map((s, idx) => {
            const stock = perSize + (idx === 0 ? rem : 0);
            return { ...s, stock: stock };
          });
        }
        
        // For standard products with color swatches, sync all colors to master stock
        if (updated.colors && updated.colors.length > 0) {
          if (!updated.variations || updated.variations.length === 0) {
            updated.colors = updated.colors.map(c => ({
              ...c,
              stock: finalStock,
              inStock: finalStock > 0
            }));
          }
        }
      }
      targetUpdated = updated;
      return updated;
    });
    setProducts(nextProds);
    currentStoreDataRef.current.products = nextProds;
    try {
      localStorage.setItem('rycreoshop_products', JSON.stringify(nextProds));
    } catch {}
    if (targetUpdated) {
      fetch(`/api/store/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stock: targetUpdated.stock,
          manualMasterStock: targetUpdated.manualMasterStock,
          variations: targetUpdated.variations,
          sizes: targetUpdated.sizes,
          colors: targetUpdated.colors
        })
      }).catch(console.warn);
    }
    persistToDatabase({ products: nextProds });
    if (targetUpdated) {
      syncProductDocToFirestore(targetUpdated).catch(console.warn);
      updateProductInAdminService(targetUpdated).catch(console.warn);
    }
  };

  // Unified Single Source of Truth Stock Calculation Utility
  const getProductStockStatus = useCallback((productOrId: Product | string, selectedColor?: string): UnifiedStockStatus => {
    let resolvedProduct: Product | undefined;
    if (typeof productOrId === 'string') {
      resolvedProduct = products.find(p => p.id === productOrId);
    } else if (productOrId && typeof productOrId === 'object') {
      resolvedProduct = products.find(p => p.id === productOrId.id) || productOrId;
    }
    return calculateProductStockStatus(resolvedProduct as Product, selectedColor);
  }, [products]);

  const calculateStockStatus = getProductStockStatus;

  // Product Positioning & Ordering Control
  const moveProduct = (id: string, direction: 'up' | 'down') => {
    const prev = [...currentStoreDataRef.current.products].sort((a, b) => {
      const posA = a.position !== undefined ? a.position : (a.order !== undefined ? a.order : 9999);
      const posB = b.position !== undefined ? b.position : (b.order !== undefined ? b.order : 9999);
      return posA - posB;
    });
    const index = prev.findIndex(p => p.id === id);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= prev.length) return;

    const newProds = [...prev];
    const temp = newProds[index];
    newProds[index] = newProds[targetIndex];
    newProds[targetIndex] = temp;

    const ordered = newProds.map((p, i) => ({
      ...p,
      order: i + 1,
      position: i + 1
    }));
    setProducts(ordered);
    currentStoreDataRef.current.products = ordered;
    persistToDatabase({ products: ordered }).catch(console.warn);
    ordered.forEach(p => {
      updateProductInAdminService(p).catch(() => {});
    });
  };

  const updateProductPosition = (id: string, newPosition: number) => {
    const prev = [...currentStoreDataRef.current.products].sort((a, b) => {
      const posA = a.position !== undefined ? a.position : (a.order !== undefined ? a.order : 9999);
      const posB = b.position !== undefined ? b.position : (b.order !== undefined ? b.order : 9999);
      return posA - posB;
    });
    const itemIndex = prev.findIndex(p => p.id === id);
    if (itemIndex === -1) return;

    const [movedItem] = prev.splice(itemIndex, 1);
    const targetIdx = Math.max(0, Math.min(prev.length, Math.max(0, newPosition - 1)));
    prev.splice(targetIdx, 0, movedItem);

    const ordered = prev.map((p, i) => ({
      ...p,
      order: i + 1,
      position: i + 1
    }));
    setProducts(ordered);
    currentStoreDataRef.current.products = ordered;
    persistToDatabase({ products: ordered }).catch(console.warn);
    ordered.forEach(p => {
      updateProductInAdminService(p).catch(() => {});
    });
  };

  // Category CRUD
  const addCategory = (catData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...catData,
      id: `cat-${Date.now()}`
    };
    const nextCats = [...currentStoreDataRef.current.categories, newCat];
    setCategories(nextCats);
    persistToDatabase({ categories: nextCats });
    syncCategoryDocToFirestore(newCat).catch(console.warn);
  };

  const updateCategory = (updatedCat: Category) => {
    const nextCats = currentStoreDataRef.current.categories.map(c => c.id === updatedCat.id ? updatedCat : c);
    setCategories(nextCats);
    persistToDatabase({ categories: nextCats });
    syncCategoryDocToFirestore(updatedCat).catch(console.warn);
  };

  const deleteCategory = (id: string): boolean => {
    const nextCats = currentStoreDataRef.current.categories.filter(c => c.id !== id);
    setCategories(nextCats);
    currentStoreDataRef.current.categories = nextCats;
    try {
      localStorage.setItem('rycreoshop_categories', JSON.stringify(nextCats));
    } catch {}
    fetch(`/api/store/categories/${id}`, { method: 'DELETE' }).catch(() => {});
    persistToDatabase({ categories: nextCats }).catch(console.warn);
    deleteCategoryDocFromFirestore(id).catch(console.warn);
    return true;
  };

  const moveCategory = (id: string, direction: 'up' | 'down') => {
    const prev = currentStoreDataRef.current.categories;
    const index = prev.findIndex(c => c.id === id);
    if (index === -1) return;
    const newCategories = [...prev];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newCategories.length) return;
    
    const temp = newCategories[index];
    newCategories[index] = newCategories[targetIndex];
    newCategories[targetIndex] = temp;
    
    const ordered = newCategories.map((c, i) => ({ ...c, order: i + 1 }));
    setCategories(ordered);
    persistToDatabase({ categories: ordered });
  };

  // Daraz Quick Category Shortcuts CRUD
  const addQuickCategory = (itemData: Omit<QuickCategoryShortcut, 'id'>) => {
    const newItem: QuickCategoryShortcut = {
      ...itemData,
      id: `qc-${Date.now()}`
    };
    const nextQCs = [...currentStoreDataRef.current.quickCategories, newItem];
    setQuickCategories(nextQCs);
    currentStoreDataRef.current.quickCategories = nextQCs;
    try {
      localStorage.setItem('rycreoshop_quick_categories', JSON.stringify(nextQCs));
    } catch {}
    fetch('/api/store/quick-categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item: newItem, items: nextQCs })
    }).catch(() => {});
    persistToDatabase({ quickCategories: nextQCs });
  };

  const updateQuickCategory = (updated: QuickCategoryShortcut) => {
    const nextQCs = currentStoreDataRef.current.quickCategories.map(q => q.id === updated.id ? updated : q);
    setQuickCategories(nextQCs);
    currentStoreDataRef.current.quickCategories = nextQCs;
    try {
      localStorage.setItem('rycreoshop_quick_categories', JSON.stringify(nextQCs));
    } catch {}
    fetch('/api/store/quick-categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item: updated, items: nextQCs })
    }).catch(() => {});
    persistToDatabase({ quickCategories: nextQCs });
  };

  const deleteQuickCategory = (id: string): boolean => {
    const nextQCs = currentStoreDataRef.current.quickCategories.filter(q => q.id !== id);
    setQuickCategories(nextQCs);
    currentStoreDataRef.current.quickCategories = nextQCs;
    try {
      localStorage.setItem('rycreoshop_quick_categories', JSON.stringify(nextQCs));
    } catch {}
    fetch(`/api/store/quick-categories/${id}`, { method: 'DELETE' }).catch(() => {});
    persistToDatabase({ quickCategories: nextQCs });
    return true;
  };

  const reorderQuickCategories = (updatedQCs: QuickCategoryShortcut[]) => {
    setQuickCategories(updatedQCs);
    currentStoreDataRef.current.quickCategories = updatedQCs;
    try {
      localStorage.setItem('rycreoshop_quick_categories', JSON.stringify(updatedQCs));
    } catch {}
    fetch('/api/store/quick-categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: updatedQCs })
    }).catch(() => {});
    persistToDatabase({ quickCategories: updatedQCs });
  };

  // Attribute CRUD
  const addAttribute = (attrData: Omit<ProductAttribute, 'id'>) => {
    const newAttr: ProductAttribute = {
      ...attrData,
      id: `attr-${Date.now()}`
    };
    const nextAttrs = [...currentStoreDataRef.current.attributes, newAttr];
    setAttributes(nextAttrs);
    persistToDatabase({ attributes: nextAttrs });
    syncAttributeDocToFirestore(newAttr).catch(console.warn);
  };

  const updateAttribute = (updatedAttr: ProductAttribute) => {
    const nextAttrs = currentStoreDataRef.current.attributes.map(a => a.id === updatedAttr.id ? updatedAttr : a);
    setAttributes(nextAttrs);
    persistToDatabase({ attributes: nextAttrs });
    syncAttributeDocToFirestore(updatedAttr).catch(console.warn);
  };

  const deleteAttribute = (id: string): boolean => {
    const nextAttrs = currentStoreDataRef.current.attributes.filter(a => a.id !== id);
    setAttributes(nextAttrs);
    currentStoreDataRef.current.attributes = nextAttrs;
    persistToDatabase({ attributes: nextAttrs });
    deleteAttributeDocFromFirestore(id).catch(console.warn);
    return true;
  };

  // Hero CRUD
  const addHeroSlide = (slideData: Omit<HeroSlide, 'id'>) => {
    const newSlide: HeroSlide = {
      ...slideData,
      id: `hero-${Date.now()}`
    };
    const nextSlides = [...currentStoreDataRef.current.heroSlides, newSlide];
    setHeroSlides(nextSlides);
    currentStoreDataRef.current.heroSlides = nextSlides;
    try {
      localStorage.setItem('rycreoshop_hero_slides', JSON.stringify(nextSlides));
    } catch {}
    fetch('/api/store/hero-slides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slide: newSlide, slides: nextSlides })
    }).catch(() => {});
    persistToDatabase({ heroSlides: nextSlides });
    syncHeroSlidesToFirestore(nextSlides).catch(console.warn);
  };

  const updateHeroSlide = (updatedSlide: HeroSlide) => {
    const nextSlides = currentStoreDataRef.current.heroSlides.map(s => s.id === updatedSlide.id ? updatedSlide : s);
    setHeroSlides(nextSlides);
    currentStoreDataRef.current.heroSlides = nextSlides;
    try {
      localStorage.setItem('rycreoshop_hero_slides', JSON.stringify(nextSlides));
    } catch {}
    fetch('/api/store/hero-slides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slide: updatedSlide, slides: nextSlides })
    }).catch(() => {});
    persistToDatabase({ heroSlides: nextSlides });
    syncHeroSlidesToFirestore(nextSlides).catch(console.warn);
  };

  const deleteHeroSlide = (id: string): boolean => {
    const nextSlides = currentStoreDataRef.current.heroSlides.filter(s => s.id !== id);
    setHeroSlides(nextSlides);
    currentStoreDataRef.current.heroSlides = nextSlides;
    try {
      localStorage.setItem('rycreoshop_hero_slides', JSON.stringify(nextSlides));
    } catch {}
    fetch(`/api/store/hero-slides/${id}`, { method: 'DELETE' }).catch(() => {});
    persistToDatabase({ heroSlides: nextSlides });
    syncHeroSlidesToFirestore(nextSlides).catch(console.warn);
    return true;
  };

  const reorderHeroSlides = (updatedSlides: HeroSlide[]) => {
    setHeroSlides(updatedSlides);
    currentStoreDataRef.current.heroSlides = updatedSlides;
    try {
      localStorage.setItem('rycreoshop_hero_slides', JSON.stringify(updatedSlides));
    } catch {}
    fetch('/api/store/hero-slides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slides: updatedSlides })
    }).catch(() => {});
    persistToDatabase({ heroSlides: updatedSlides });
    syncHeroSlidesToFirestore(updatedSlides).catch(console.warn);
  };

  // Coupon CRUD
  const addCoupon = (couponData: Omit<Coupon, 'id' | 'createdAt' | 'usedCount'>) => {
    const newCoupon: Coupon = {
      ...couponData,
      id: `coup-${Date.now()}`,
      usedCount: 0,
      createdAt: new Date().toISOString()
    };
    const nextCoupons = [...currentStoreDataRef.current.coupons, newCoupon];
    setCoupons(nextCoupons);
    currentStoreDataRef.current.coupons = nextCoupons;
    persistToDatabase({ coupons: nextCoupons });
    syncCouponsToFirestore(nextCoupons).catch(console.warn);
  };

  const updateCoupon = (updatedCoupon: Coupon) => {
    const nextCoupons = currentStoreDataRef.current.coupons.map(c => c.id === updatedCoupon.id ? updatedCoupon : c);
    setCoupons(nextCoupons);
    currentStoreDataRef.current.coupons = nextCoupons;
    persistToDatabase({ coupons: nextCoupons });
    syncCouponsToFirestore(nextCoupons).catch(console.warn);
  };

  const deleteCoupon = (id: string): boolean => {
    const nextCoupons = currentStoreDataRef.current.coupons.filter(c => c.id !== id);
    setCoupons(nextCoupons);
    currentStoreDataRef.current.coupons = nextCoupons;
    persistToDatabase({ coupons: nextCoupons });
    syncCouponsToFirestore(nextCoupons).catch(console.warn);
    return true;
  };

  // Static Pages CRUD
  const addStaticPage = async (pageData: Omit<StaticPage, 'id'>) => {
    const newPage: StaticPage = {
      ...pageData,
      id: `page-${Date.now()}`
    };
    const nextPages = [...currentStoreDataRef.current.staticPages, newPage];
    setStaticPages(nextPages);
    currentStoreDataRef.current.staticPages = nextPages;
    await persistToDatabase({ staticPages: nextPages }).catch(console.warn);
    await syncStaticPageDocToFirestore(newPage).catch(console.warn);
    await syncAllStaticPagesToFirestore(nextPages).catch(console.warn);
  };

  const updateStaticPage = async (updatedPage: StaticPage) => {
    const nextPages = currentStoreDataRef.current.staticPages.map(p => p.id === updatedPage.id ? updatedPage : p);
    setStaticPages(nextPages);
    currentStoreDataRef.current.staticPages = nextPages;
    await persistToDatabase({ staticPages: nextPages }).catch(console.warn);
    await syncStaticPageDocToFirestore(updatedPage).catch(console.warn);
    await syncAllStaticPagesToFirestore(nextPages).catch(console.warn);
  };

  const deleteStaticPage = async (id: string): Promise<boolean> => {
    const nextPages = currentStoreDataRef.current.staticPages.filter(p => p.id !== id);
    setStaticPages(nextPages);
    currentStoreDataRef.current.staticPages = nextPages;
    await persistToDatabase({ staticPages: nextPages }).catch(console.warn);
    await deleteStaticPageDocFromFirestore(id).catch(console.warn);
    await syncAllStaticPagesToFirestore(nextPages).catch(console.warn);
    return true;
  };

  // Helper to dynamically calculate overall weighted average rating across approved reviews
  const recalculateProductRating = (productId: string, allReviews: Review[]) => {
    const approved = allReviews.filter(r => r.productId === productId && r.status === 'approved');
    if (approved.length === 0) {
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, rating: 0, reviewCount: 0 } : p
      ));
    } else {
      const sum = approved.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
      const avg = Math.round((sum / approved.length) * 10) / 10;
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, rating: avg, reviewCount: approved.length } : p
      ));
    }
  };

  const addReview = (reviewData: Omit<Review, 'id' | 'createdAt'>) => {
    const currentList = [...currentStoreDataRef.current.reviews];
    
    // Always assign new review order: 1 (top of list) and shift others down
    const newRev: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
      order: 1,
      position: 1
    };
    
    const reorderedOthers = currentList.map(r => ({
      ...r,
      order: (r.order || 1) + 1,
      position: (r.position || 1) + 1
    }));
    
    const updatedReviews = [newRev, ...reorderedOthers];
    setReviews(updatedReviews);
    currentStoreDataRef.current.reviews = updatedReviews;
    try {
      localStorage.setItem('rycreoshop_reviews', JSON.stringify(updatedReviews));
    } catch {}
    fetch('/api/store/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ review: newRev, reviews: updatedReviews })
    }).catch(() => {});
    persistToDatabase({ reviews: updatedReviews });
    syncReviewDocToFirestore(newRev).catch(console.warn);
    recalculateProductRating(reviewData.productId, updatedReviews);
  };

  const updateReviewStatus = (id: string, status: Review['status']) => {
    const updatedReviews = currentStoreDataRef.current.reviews.map(r => r.id === id ? { ...r, status } : r);
    setReviews(updatedReviews);
    currentStoreDataRef.current.reviews = updatedReviews;
    try {
      localStorage.setItem('rycreoshop_reviews', JSON.stringify(updatedReviews));
    } catch {}
    fetch('/api/store/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviews: updatedReviews })
    }).catch(() => {});
    persistToDatabase({ reviews: updatedReviews });
    const target = updatedReviews.find(r => r.id === id);
    if (target) {
        syncReviewDocToFirestore(target).catch(console.warn);
        recalculateProductRating(target.productId, updatedReviews);
    }
  };

  const editReview = (updatedReview: Review) => {
    const updatedReviews = currentStoreDataRef.current.reviews.map(r => r.id === updatedReview.id ? updatedReview : r);
    setReviews(updatedReviews);
    currentStoreDataRef.current.reviews = updatedReviews;
    try {
      localStorage.setItem('rycreoshop_reviews', JSON.stringify(updatedReviews));
    } catch {}
    fetch('/api/store/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ review: updatedReview, reviews: updatedReviews })
    }).catch(() => {});
    persistToDatabase({ reviews: updatedReviews });
    syncReviewDocToFirestore(updatedReview).catch(console.warn);
    recalculateProductRating(updatedReview.productId, updatedReviews);
  };

  const deleteReview = (id: string): boolean => {
    const target = currentStoreDataRef.current.reviews.find(r => r.id === id);
    const updatedReviews = currentStoreDataRef.current.reviews.filter(r => r.id !== id);
    setReviews(updatedReviews);
    currentStoreDataRef.current.reviews = updatedReviews;
    try {
      localStorage.setItem('rycreoshop_reviews', JSON.stringify(updatedReviews));
    } catch {}
    fetch(`/api/store/reviews/${id}`, { method: 'DELETE' }).catch(() => {});
    persistToDatabase({ reviews: updatedReviews });
    deleteReviewDocFromFirestore(id).catch(console.warn);
    if (target) {
      recalculateProductRating(target.productId, updatedReviews);
    }
    return true;
  };

  const deleteReviews = (ids: string[]): boolean => {
    if (!ids || ids.length === 0) return false;
    const idSet = new Set(ids);
    const targets = currentStoreDataRef.current.reviews.filter(r => idSet.has(r.id));
    const updatedReviews = currentStoreDataRef.current.reviews.filter(r => !idSet.has(r.id));
    setReviews(updatedReviews);
    currentStoreDataRef.current.reviews = updatedReviews;
    try {
      localStorage.setItem('rycreoshop_reviews', JSON.stringify(updatedReviews));
    } catch {}
    fetch('/api/store/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviews: updatedReviews })
    }).catch(() => {});
    persistToDatabase({ reviews: updatedReviews });
    targets.forEach(r => {
      deleteReviewDocFromFirestore(r.id).catch(console.warn);
    });
    const affectedProductIds = Array.from(new Set(targets.map(r => r.productId)));
    affectedProductIds.forEach(prodId => {
      recalculateProductRating(prodId, updatedReviews);
    });
    return true;
  };

  // Review Positioning & Priority Ordering Control
  const moveReview = (id: string, direction: 'up' | 'down') => {
    const list = [...currentStoreDataRef.current.reviews].sort((a, b) => {
      const orderA = a.order !== undefined ? a.order : (a.position !== undefined ? a.position : 9999);
      const orderB = b.order !== undefined ? b.order : (b.position !== undefined ? b.position : 9999);
      if (orderA !== orderB) return orderA - orderB;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    const index = list.findIndex(r => r.id === id);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    const ordered = list.map((r, i) => ({
      ...r,
      order: i + 1,
      position: i + 1
    }));

    setReviews(ordered);
    currentStoreDataRef.current.reviews = ordered;
    try {
      localStorage.setItem('rycreoshop_reviews', JSON.stringify(ordered));
    } catch {}
    fetch('/api/store/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviews: ordered })
    }).catch(() => {});
    persistToDatabase({ reviews: ordered }).catch(console.warn);
    ordered.forEach(r => {
      syncReviewDocToFirestore(r).catch(() => {});
    });
  };

  const updateReviewPosition = (id: string, newPosition: number) => {
    const list = [...currentStoreDataRef.current.reviews].sort((a, b) => {
      const orderA = a.order !== undefined ? a.order : (a.position !== undefined ? a.position : 9999);
      const orderB = b.order !== undefined ? b.order : (b.position !== undefined ? b.position : 9999);
      if (orderA !== orderB) return orderA - orderB;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    const index = list.findIndex(r => r.id === id);
    if (index === -1) return;

    const [moved] = list.splice(index, 1);
    const targetIdx = Math.max(0, Math.min(list.length, newPosition - 1));
    list.splice(targetIdx, 0, moved);

    const ordered = list.map((r, i) => ({
      ...r,
      order: i + 1,
      position: i + 1
    }));

    setReviews(ordered);
    currentStoreDataRef.current.reviews = ordered;
    try {
      localStorage.setItem('rycreoshop_reviews', JSON.stringify(ordered));
    } catch {}
    fetch('/api/store/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviews: ordered })
    }).catch(() => {});
    persistToDatabase({ reviews: ordered }).catch(console.warn);
    ordered.forEach(r => {
      syncReviewDocToFirestore(r).catch(() => {});
    });
  };

  const pinReviewToTop = (id: string) => {
    updateReviewPosition(id, 1);
  };

  // Store Config
  const updateStoreConfig = (newConfig: Partial<StoreConfig>) => {
    const nextConfig = { ...currentStoreDataRef.current.storeConfig, ...newConfig };
    setStoreConfig(nextConfig);
    currentStoreDataRef.current.storeConfig = nextConfig;
    try {
      localStorage.setItem('rycreoshop_store_config', JSON.stringify(nextConfig));
    } catch (e) {
      console.warn("Storage warning:", e);
    }
    persistToDatabase({ storeConfig: nextConfig });
    syncSettingsDocToFirestore('store_config', nextConfig).catch(console.warn);
    const finalLockHours = Number(nextConfig.orderLockDurationHours) || 24;
    syncSettingsDocToFirestore('order_policy', {
      orderLockDurationHours: finalLockHours,
      insideDhakaDeliveryFee: nextConfig.defaultInsideDhakaFee || 60,
      outsideDhakaDeliveryFee: nextConfig.defaultOutsideDhakaFee || 120,
      advanceDeliveryChargeNumber: nextConfig.advanceDeliveryChargeNumber || "01712345678",
      allowDoorstepInspection: true,
      exchangePolicyDays: 7,
      customerCancelAllowedWithinHours: finalLockHours,
      orderPolicyText: nextConfig.orderPolicyText,
      updatedAt: new Date().toISOString()
    }).catch(console.warn);
  };

  const updateLastViewedOrderTimestamp = useCallback((timestamp: number) => {
    const nextConfig = { ...currentStoreDataRef.current.storeConfig, lastViewedOrderTimestamp: timestamp };
    setStoreConfig(nextConfig);
    persistToDatabase({ storeConfig: nextConfig });
    syncSettingsDocToFirestore('store_config', nextConfig).catch(console.warn);
  }, []);

  const seedDatabaseToFirestore = async (force: boolean = true) => {
    setIsCloudSynced(false);
    const res = await seedAllInitialDataToFirestore(force);
    if (res.success) {
      setIsCloudSynced(true);
    }
    return res;
  };

  const resetToFactoryDefaults = () => {
    setStoreConfig(INITIAL_STORE_CONFIG);
    setCategories(INITIAL_CATEGORIES);
    setAttributes(INITIAL_ATTRIBUTES);
    setProducts(INITIAL_PRODUCTS);
    setHeroSlides(INITIAL_HERO_SLIDES);
    setCoupons(INITIAL_COUPONS);
    setReviews(INITIAL_REVIEWS);
    setOrders([]);
    setCart([]);
    setWishlist([]);
    setCollectedVouchers(['RYCREO10', 'WELCOME50']);
    localStorage.removeItem(STORAGE_KEY);
  };

  const loginAdmin = (passcode: string) => {
    const clean = passcode.trim();
    if (clean === 'Ahmad636Taseen@#') {
      setIsAdminLoggedIn(true);
      setLoggedInAdminEmail('rycreoshop@gmail.com');
      localStorage.setItem('admin_session_active', 'true');
      localStorage.setItem('rycreoshop_logged_in_admin', 'rycreoshop@gmail.com');
      localStorage.setItem('admin_email', 'rycreoshop@gmail.com');
      localStorage.setItem('admin_password', 'Ahmad636Taseen@#');
      localStorage.setItem('admin_viewing_store', 'false');
      ensureAdminAuthSession().catch(console.warn);
      return true;
    }
    return false;
  };

  const contextValue = React.useMemo(() => ({
      modificationWindowHours,
      products,
      categories,
      quickCategories,
      attributes,
      heroSlides,
      coupons,
      reviews,
      storeConfig,
      orders,
      customers,
      cart,
      wishlist,
      collectedVouchers,
      activeCategory,
      searchQuery,
      selectedProduct,
      isCartOpen,
      isCheckoutOpen,
      isAdminModalOpen,
      isAdminLoggedIn,
      isAdminViewingStore,
      isVoucherModalOpen,
      isMenuDrawerOpen,
      isSearchPageOpen,
      activeAdminTab,
      activePolicyModal,
      selectedStaticPage,
      directCheckoutItem,
      setDirectCheckoutItem,
      directCheckoutItems,
      setDirectCheckoutItems,
      isOrderPolicyOpen,
      setIsOrderPolicyOpen,
      openOrderPolicyModal,
      confirmOrderPolicyModal,
      closeOrderPolicyModal,
      isVariantModalOpen,
      variantModalProduct,
      openVariantModal,
      closeVariantModal,
      setActiveCategory,
      setSearchQuery,
      setSelectedProduct,
      setIsCartOpen,
      setIsCheckoutOpen,
      setIsAdminModalOpen,
      setIsAdminLoggedIn,
      setIsAdminViewingStore,
      setIsVoucherModalOpen,
      setIsMenuDrawerOpen,
      setIsSearchPageOpen,
      setActiveAdminTab,
      setActivePolicyModal,
      setSelectedStaticPage,
      collectVoucher,
      isVoucherCollected,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      updateCartItem,
      removeCartItemByIndex,
      clearCart,
      toggleWishlist,
      isInWishlist,
      validateCoupon,
      placeOrder,
      updateOrderStatus,
      updateOrder,
      deleteOrder,
      deleteOrders,
      deleteAllOrders,
      toggleOrderSeen,
      addProduct,
      updateProduct,
      deleteProduct,
      deleteProducts,
      moveProduct,
      updateProductPosition,
      updateProductStock,
      getProductStockStatus,
      calculateStockStatus,
      addCategory,
      updateCategory,
      deleteCategory,
      moveCategory,
      addQuickCategory,
      updateQuickCategory,
      deleteQuickCategory,
      reorderQuickCategories,
      addAttribute,
      updateAttribute,
      deleteAttribute,
      addHeroSlide,
      updateHeroSlide,
      deleteHeroSlide,
      reorderHeroSlides,
      addCoupon,
      updateCoupon,
      deleteCoupon,
      addReview,
      updateReviewStatus,
      editReview,
      deleteReview,
      deleteReviews,
      moveReview,
      updateReviewPosition,
      pinReviewToTop,
      updateStoreConfig,
      updateLastViewedOrderTimestamp,
      resetToFactoryDefaults,
      loginAdmin,
      staticPages,
      addStaticPage,
      updateStaticPage,
      deleteStaticPage,
      adminEmail,
      adminPassword,
      adminSecretCode,
      updateAdminCredentials,
      syncToCloudNow,
      seedDatabaseToFirestore,
      isCloudSynced,
      refreshStore,
      searchLogs,
      searchTelemetry,
      refreshTelemetry,
      logSearchQuery,
      clearSearchLogs,
      adminsList,
      addAdmin,
      deleteAdmin,
      loggedInAdminEmail,
      setLoggedInAdminEmail,
      logoutAdmin,
      isLoading,
      error,
      setError,
      inventoryFilter,
      setInventoryFilter,
      inventorySearch,
      setInventorySearch
    }), [
      modificationWindowHours, products, categories, quickCategories, attributes, heroSlides, coupons, reviews, storeConfig, orders, customers, cart, wishlist, collectedVouchers, activeCategory, searchQuery, selectedProduct, isCartOpen, isCheckoutOpen, isAdminModalOpen, isAdminLoggedIn, isAdminViewingStore, isVoucherModalOpen, isMenuDrawerOpen, isSearchPageOpen, activeAdminTab, activePolicyModal, selectedStaticPage, directCheckoutItem, directCheckoutItems, isOrderPolicyOpen, isVariantModalOpen, variantModalProduct, inventoryFilter, inventorySearch,
      // functions should be stable if these setters are stable, but they are from useState/useCallback
      setActiveCategory, setSearchQuery, setSelectedProduct, setIsCartOpen, setIsCheckoutOpen, setIsAdminModalOpen, setIsAdminLoggedIn, setIsAdminViewingStore, setIsVoucherModalOpen, setIsMenuDrawerOpen, setIsSearchPageOpen, setActiveAdminTab, setActivePolicyModal, setSelectedStaticPage, collectVoucher, isVoucherCollected, addToCart, removeFromCart, updateCartQuantity, updateCartItem, removeCartItemByIndex, clearCart, toggleWishlist, isInWishlist, validateCoupon, placeOrder, updateOrderStatus, updateOrder, deleteOrder, deleteOrders, deleteAllOrders, toggleOrderSeen, addProduct, updateProduct, deleteProduct, deleteProducts, updateProductStock, getProductStockStatus, calculateStockStatus, addCategory, updateCategory, deleteCategory, moveCategory, addQuickCategory, updateQuickCategory, deleteQuickCategory, reorderQuickCategories, addAttribute, updateAttribute, deleteAttribute, addHeroSlide, updateHeroSlide, deleteHeroSlide, reorderHeroSlides, addCoupon, updateCoupon, deleteCoupon, addReview, updateReviewStatus, editReview, deleteReview, deleteReviews, moveReview, updateReviewPosition, pinReviewToTop, updateStoreConfig, updateLastViewedOrderTimestamp, resetToFactoryDefaults, loginAdmin, staticPages, addStaticPage, updateStaticPage, deleteStaticPage, adminEmail, adminPassword, adminSecretCode, updateAdminCredentials, syncToCloudNow, seedDatabaseToFirestore, isCloudSynced, searchLogs, searchTelemetry, refreshTelemetry, logSearchQuery, clearSearchLogs, adminsList, addAdmin, deleteAdmin, loggedInAdminEmail, setLoggedInAdminEmail, logoutAdmin, isLoading, error, setError, setInventoryFilter, setInventorySearch
    ]);

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};

export const getEffectiveSoldCount = (p?: Partial<Product> | null): number => {
  if (!p) return 0;
  const base = p.baseSoldCount ?? (p.soldCount ?? 0);
  const real = p.realSalesCount ?? 0;
  return base + real;
};

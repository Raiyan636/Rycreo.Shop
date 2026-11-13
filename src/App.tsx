import React, { useState, useEffect, useRef } from 'react';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { StoreProvider, useStore } from './context/StoreContext';
import { ToastProvider } from './components/common/Toast';
import { Header } from './components/Header';
import { HeroCarousel } from './components/HeroCarousel';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderPolicyModal } from './components/OrderPolicyModal';
import { WhatsAppWidget } from './components/WhatsAppWidget';
import { PolicyModal } from './components/PolicyModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { MenuDrawer } from './components/MenuDrawer';
import { VoucherModal } from './components/VoucherModal';
import { Footer } from './components/Footer';
import { ScrollProgressBar } from './components/common/ScrollProgressBar';
import { TrackOrderModal } from './components/TrackOrderModal';
import { SearchPage } from './components/SearchPage';
import { PullToRefresh } from './components/common/PullToRefresh';
import { ShowcaseRowMatrix } from './components/ShowcaseRowMatrix';
import { PreOrderCard } from './components/PreOrderCard';
import { PreOrderModal } from './components/PreOrderModal';
import { BuyMoreCard } from './components/BuyMoreCard';
import { BuyMoreOfferModal } from './components/BuyMoreOfferModal';
import { SeeMorePage } from './components/SeeMorePage';
import { SectionPromoBanner } from './components/SectionPromoBanner';
import { INITIAL_STORE_CONFIG } from './data/initialData';
import { 
  Sparkles, 
  ArrowUpDown, 
  Filter, 
  Truck, 
  ShoppingBag, 
  Layers, 
  Tag, 
  Flame, 
  Zap, 
  Clock, 
  Gift,
  Ticket,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  X
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { 
    products, 
    preOrderProducts,
    buyMoreOffers,
    buyMoreVouchers,
    categories,
    activeCategory, 
    setActiveCategory, 
    searchQuery,
    setSearchQuery, 
    storeConfig,
    isMenuDrawerOpen,
    setIsMenuDrawerOpen,
    isVoucherModalOpen,
    setIsVoucherModalOpen,
    setActivePolicyModal,
    collectedVouchers,
    collectVoucher,
    quickCategories,
    selectedStaticPage,
    setSelectedStaticPage,
    isAdminLoggedIn,
    isAdminModalOpen,
    isAdminViewingStore,
    setIsAdminViewingStore,
    loggedInAdminEmail,
    logoutAdmin,
    selectedProduct,
    setSelectedProduct,
    selectedPreOrderProduct,
    setSelectedPreOrderProduct,
    selectedBuyMoreOffer,
    setSelectedBuyMoreOffer,
    isSearchPageOpen,
    setIsSearchPageOpen,
    isVariantModalOpen,
    variantModalProduct,
    closeVariantModal,
    activeSeeMoreSection,
    setActiveSeeMoreSection
  } = useStore();

  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('All');
  const [filterFreeDelivery, setFilterFreeDelivery] = useState(false);
  const [filterFeatured, setFilterFeatured] = useState(false);
  const [filterPreOrder, setFilterPreOrder] = useState(false);
  const [filterBuyMore, setFilterBuyMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [copiedOfferVoucher, setCopiedOfferVoucher] = useState<string | null>(null);
  const itemsPerPage = 20;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeCategoryPage, setActiveCategoryPage] = useState(0);
  const [itemsPerPageByCategoryView, setItemsPerPageByCategoryView] = useState(() => {
    if (typeof window === 'undefined') return 10;
    if (window.innerWidth >= 1024) return 14;
    if (window.innerWidth >= 640) return 12;
    return 10;
  });

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w >= 1024) {
        setItemsPerPageByCategoryView(14); // 7 cols x 2 rows
      } else if (w >= 640) {
        setItemsPerPageByCategoryView(12); // 6 cols x 2 rows
      } else {
        setItemsPerPageByCategoryView(10); // 5 cols x 2 rows
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCategoriesScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      if (clientWidth > 0) {
        const page = Math.round(scrollLeft / clientWidth);
        setActiveCategoryPage(page);
      }
    }
  };

  const scrollToCategoryPage = (index: number) => {
    if (scrollContainerRef.current) {
      const containerWidth = scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollTo({
        left: index * containerWidth,
        behavior: 'smooth'
      });
      setActiveCategoryPage(index);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, selectedSubcategory, searchQuery]);

  // Preserve scroll & handle browser back navigation
  const isProductModalActive = Boolean(
    selectedProduct ||
    (isVariantModalOpen && variantModalProduct) ||
    selectedPreOrderProduct ||
    selectedBuyMoreOffer
  );

  useEffect(() => {
    if (isProductModalActive) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isProductModalActive]);

  // Deep-link support for product query parameter
  const hasCheckedDeeplinkRef = React.useRef(false);
  useEffect(() => {
    if (!hasCheckedDeeplinkRef.current && products.length > 0 && !selectedProduct && !isVariantModalOpen) {
      hasCheckedDeeplinkRef.current = true;
      const urlParams = new URLSearchParams(window.location.search);
      const prodParam = urlParams.get('product');
      if (prodParam) {
        const found = products.find(p => p.id === prodParam || p.slug === prodParam);
        if (found) {
          setSelectedProduct(found);
        }
      }
    }
  }, [products, selectedProduct, isVariantModalOpen]);

  // Browser Back Button & Android navigation restoration
  useEffect(() => {
    const handlePopState = () => {
      if (activeSeeMoreSection) {
        setActiveSeeMoreSection(null);
      }
      if (selectedProduct || isVariantModalOpen) {
        setSelectedProduct(null);
        closeVariantModal();
      }
      if (selectedPreOrderProduct) {
        setSelectedPreOrderProduct(null);
      }
      if (selectedBuyMoreOffer) {
        setSelectedBuyMoreOffer(null);
      }

      const savedY = sessionStorage.getItem('rycreo_return_scroll_y');
      const savedProdId = sessionStorage.getItem('rycreo_return_product_id');
      if (savedY !== null) {
        const targetY = parseInt(savedY, 10);
        const restore = () => {
          if (savedProdId) {
            const el = document.getElementById(`product-card-${savedProdId}`);
            if (el) {
              el.scrollIntoView({ block: 'center', behavior: 'instant' });
              return;
            }
          }
          window.scrollTo({ top: targetY, behavior: 'instant' });
        };
        requestAnimationFrame(() => {
          restore();
          setTimeout(restore, 60);
          setTimeout(restore, 180);
          sessionStorage.removeItem('rycreo_return_scroll_y');
          sessionStorage.removeItem('rycreo_return_product_id');
        });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [
    activeSeeMoreSection,
    setActiveSeeMoreSection,
    selectedProduct,
    isVariantModalOpen,
    setSelectedProduct,
    closeVariantModal,
    selectedPreOrderProduct,
    setSelectedPreOrderProduct,
    selectedBuyMoreOffer,
    setSelectedBuyMoreOffer
  ]);

  // Favicon & Title Sync
  useEffect(() => {
    document.title = `${storeConfig.storeName || 'RycreoShop'} | Trusted Multi-Category Online Shopping in Bangladesh`;
    if (storeConfig.faviconUrl && storeConfig.faviconUrl !== '/favicon.ico') {
      const dynamicLink = document.getElementById('dynamic-favicon') as HTMLLinkElement | null;
      if (dynamicLink) {
        dynamicLink.href = storeConfig.faviconUrl;
      }
    }
  }, [storeConfig.storeName, storeConfig.faviconUrl]);

  // Filter & Sort Products
  const filteredProducts = products.filter(product => {
    // 1. Category filter
    const categoryMatches = activeCategory === 'All' || 
      product.category.toLowerCase() === activeCategory.toLowerCase() ||
      (activeCategory === 'Festival Special' && product.isPujaSpecial);

    // 2. Subcategory filter
    const subcategoryMatches = selectedSubcategory === 'All' ||
      (product.subcategory && product.subcategory.toLowerCase() === selectedSubcategory.toLowerCase());

    // 3. Search query filter across titles, categories, descriptions, brand, and custom keywords
    const qLower = searchQuery.toLowerCase().trim();
    const searchMatches = qLower === '' || 
      product.title.toLowerCase().includes(qLower) ||
      product.category.toLowerCase().includes(qLower) ||
      (product.subcategory && product.subcategory.toLowerCase().includes(qLower)) ||
      product.description.toLowerCase().includes(qLower) ||
      (product.brand && product.brand.toLowerCase().includes(qLower)) ||
      (product.keywords && product.keywords.some(k => k.toLowerCase().includes(qLower) || qLower.includes(k.toLowerCase())));

    // 4. Free Delivery filter
    const freeDeliveryMatches = !filterFreeDelivery || !!product.isFreeShipping;

    // 5. Featured filter
    const featuredMatches = !filterFeatured || !!product.isFeatured;

    return categoryMatches && subcategoryMatches && searchMatches && freeDeliveryMatches && featuredMatches;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.salePrice > 0 ? a.salePrice : a.price;
    const priceB = b.salePrice > 0 ? b.salePrice : b.price;

    if (sortBy === 'price-low') return priceA - priceB;
    if (sortBy === 'price-high') return priceB - priceA;
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);

    // Custom admin priority position / order sorting first (1 = Top of website)
    const orderA = a.position !== undefined ? a.position : (a.order !== undefined ? a.order : 1000);
    const orderB = b.position !== undefined ? b.position : (b.order !== undefined ? b.order : 1000);
    if (orderA !== orderB) {
      return orderA - orderB;
    }

    return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
  });

  const totalItems = sortedProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage);

  const currentCategoryObj = categories.find(c => c.name.toLowerCase() === activeCategory.toLowerCase());
  const pujaProducts = products.filter(p => p.isPujaSpecial || p.isFestiveSpecial);

  const visiblePreOrderProducts = React.useMemo(
    () =>
      preOrderProducts
        .filter(item => item.isVisible !== false)
        .sort((a, b) => (a.position ?? 999) - (b.position ?? 999)),
    [preOrderProducts]
  );

  const visibleBuyMoreOffers = React.useMemo(
    () =>
      buyMoreOffers
        .filter(item => item.isVisible !== false)
        .sort((a, b) => (a.position ?? 999) - (b.position ?? 999)),
    [buyMoreOffers]
  );

  const visibleBuyMoreVouchers = React.useMemo(
    () => buyMoreVouchers.filter(v => v.isVisible !== false),
    [buyMoreVouchers]
  );

  const showPreOrderSection = storeConfig.isPreOrderSectionVisible !== false && visiblePreOrderProducts.length > 0;
  const showBuyMoreSection = storeConfig.isBuyMoreSectionVisible !== false && visibleBuyMoreOffers.length > 0;

  const isTypeFilterActive = filterPreOrder || filterBuyMore;

  const filteredPreOrderCatalog = React.useMemo(() => {
    if (storeConfig.isPreOrderSectionVisible === false) return [];
    const qLower = searchQuery.toLowerCase().trim();
    const list = visiblePreOrderProducts.filter((item) => {
      const catMatch =
        activeCategory === 'All' ||
        (item.category || '').toLowerCase() === activeCategory.toLowerCase();
      const freeShipMatch = !filterFreeDelivery || !!item.isFreeShipping;
      const qMatch =
        qLower === '' ||
        (item.title || '').toLowerCase().includes(qLower) ||
        (item.category || '').toLowerCase().includes(qLower) ||
        (item.description || '').toLowerCase().includes(qLower) ||
        (item.seoTitle || '').toLowerCase().includes(qLower) ||
        (Array.isArray(item.keywords) && item.keywords.some((k) => (k || '').toLowerCase().includes(qLower)));
      return catMatch && freeShipMatch && qMatch;
    });
    return [...list].sort((a, b) => {
      const pA = a.salePrice > 0 ? a.salePrice : a.price;
      const pB = b.salePrice > 0 ? b.salePrice : b.price;
      if (sortBy === 'price-low') return pA - pB;
      if (sortBy === 'price-high') return pB - pA;
      return (a.position ?? 999) - (b.position ?? 999);
    });
  }, [visiblePreOrderProducts, storeConfig.isPreOrderSectionVisible, searchQuery, activeCategory, filterFreeDelivery, sortBy]);

  const filteredBuyMoreCatalog = React.useMemo(() => {
    if (storeConfig.isBuyMoreSectionVisible === false) return [];
    const qLower = searchQuery.toLowerCase().trim();
    const list = visibleBuyMoreOffers.filter((offer) => {
      const freeShipMatch = !filterFreeDelivery || !!offer.isFreeShipping;
      const qMatch =
        qLower === '' ||
        (offer.title || '').toLowerCase().includes(qLower) ||
        (offer.mainProductTitle || '').toLowerCase().includes(qLower) ||
        (offer.description || '').toLowerCase().includes(qLower) ||
        (offer.seoTitle || '').toLowerCase().includes(qLower) ||
        (Array.isArray(offer.keywords) && offer.keywords.some((k) => (k || '').toLowerCase().includes(qLower))) ||
        (Array.isArray(offer.freeItems) && offer.freeItems.some((fi) => (fi.title || '').toLowerCase().includes(qLower)));
      return freeShipMatch && qMatch;
    });
    return [...list].sort((a, b) => {
      const pA = a.price;
      const pB = b.price;
      if (sortBy === 'price-low') return pA - pB;
      if (sortBy === 'price-high') return pB - pA;
      return (a.position ?? 999) - (b.position ?? 999);
    });
  }, [visibleBuyMoreOffers, storeConfig.isBuyMoreSectionVisible, searchQuery, filterFreeDelivery, sortBy]);

  const displayedCatalogCount = isTypeFilterActive
    ? (filterPreOrder ? filteredPreOrderCatalog.length : 0) + (filterBuyMore ? filteredBuyMoreCatalog.length : 0)
    : sortedProducts.length;

  // Dynamic Daraz-style Shortcuts managed directly from Admin Dashboard
  const displayShortcuts = (quickCategories && quickCategories.length > 0)
    ? quickCategories.filter(qc => qc.active).sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];

  const categoryPages = React.useMemo(() => {
    if (!displayShortcuts || displayShortcuts.length === 0) return [];
    const pages: (typeof displayShortcuts)[] = [];
    for (let i = 0; i < displayShortcuts.length; i += itemsPerPageByCategoryView) {
      pages.push(displayShortcuts.slice(i, i + itemsPerPageByCategoryView));
    }
    return pages;
  }, [displayShortcuts, itemsPerPageByCategoryView]);

  useEffect(() => {
    if (activeCategoryPage >= categoryPages.length && categoryPages.length > 0) {
      setActiveCategoryPage(categoryPages.length - 1);
    }
  }, [categoryPages.length, activeCategoryPage]);



  // Render Admin Gateway or Dashboard on a completely separate standalone page
  if (isAdminLoggedIn && !isAdminViewingStore) {
    return <AdminDashboard />;
  }

  return (
    <>
      <PullToRefresh>
        <div className="min-h-screen flex flex-col rycreo-wave-storefront text-[#1E293B] relative overflow-x-hidden">

        {/* Layered Light-to-Deep Green Wavy ("ঢেউ ঢেউ") Backdrop Artwork behind Storefront Content */}
        <div className="pointer-events-none absolute inset-x-0 top-0 bottom-0 overflow-hidden z-0" aria-hidden="true">
          {/* Upper Soft Mint Wave */}
          <svg
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
            className="w-full h-56 sm:h-72 text-[#A7F3D0]/55 mt-[380px] sm:mt-[460px]"
          >
            <path
              fill="currentColor"
              d="M0,96L60,122.7C120,149,240,203,360,208C480,213,600,171,720,144C840,117,960,107,1080,128C1200,149,1320,203,1380,229.3L1440,256L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
            />
          </svg>

          {/* Mid Emerald Swell Wave */}
          <svg
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
            className="w-full h-64 sm:h-80 text-[#34D399]/35 mt-28"
          >
            <path
              fill="currentColor"
              d="M0,192L80,176C160,160,320,128,480,144C640,160,800,224,960,229.3C1120,235,1280,181,1360,154.7L1440,128L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
            />
          </svg>

          {/* Deep Emerald Lower Ribbon Wave */}
          <svg
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
            className="w-full h-72 sm:h-96 text-[#059669]/45 mt-32"
          >
            <path
              fill="currentColor"
              d="M0,128L60,154.7C120,181,240,235,360,229.3C480,224,600,160,720,144C840,128,960,160,1080,181.3C1200,203,1320,213,1380,218.7L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
            />
          </svg>

          {/* Deep Forest Crest Wave */}
          <svg
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
            className="w-full h-72 sm:h-96 text-[#065F46]/55 mt-20"
          >
            <path
              fill="currentColor"
              d="M0,224L80,192C160,160,320,96,480,106.7C640,117,800,203,960,218.7C1120,235,1280,181,1360,154.7L1440,128L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
            />
          </svg>
        </div>

        {/* Top Announcement Bar */}
        {(storeConfig.isTopBarNoticeActive !== false && storeConfig.topBarNotice) && (
          <div className="relative z-10 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 px-4 py-2 text-center text-xs sm:text-sm font-extrabold tracking-wide flex items-center justify-center gap-2 shadow-md">
            <Sparkles className="w-4 h-4 text-slate-950 animate-pulse shrink-0" />
            <span>{storeConfig.topBarNotice}</span>
          </div>
        )}

        {/* Header Navigation with Menu button */}
        <div className="relative z-20">
          <Header />
        </div>

      {activeSeeMoreSection ? (
        <div className="relative z-10 flex-1">
          <SeeMorePage />
        </div>
      ) : (
        <>
      {/* Hero Multi-Slide Banner Carousel (Banner #1) */}
      <div className="relative z-10">
        <HeroCarousel />
      </div>

      {/* DARAZ / GHORER BAZAR STYLE QUICK CATEGORY & VOUCHER HUB (Captivating Entrance Hook) */}
      <section className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-emerald-200/80 py-6 sm:py-8 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* 1. Live Voucher Banner Ticker (Hidden when unticked) */}
          {(storeConfig.isVouchersActive !== false) && (
            <div className="rounded-2xl bg-gradient-to-r from-[#1E293B] via-[#0F172A] to-[#1E293B] p-3.5 sm:p-4 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg border border-amber-500/30">
              <div className="flex items-center gap-3 text-center sm:text-left">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#F59E0B] to-[#D97706] flex items-center justify-center shrink-0 shadow-md">
                  <Tag className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-extrabold flex items-center gap-2 justify-center sm:justify-start">
                    <span>{storeConfig.voucherBannerTitle || 'Special Voucher Drop'}</span>
                    <span className="bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase">Instant</span>
                  </p>
                  <p className="text-[11px] text-slate-300">
                    {storeConfig.voucherBannerSubtitle || 'Flat ৳50 OFF with code WELCOME50 on your first RycreoShop order!'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsVoucherModalOpen(true)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#38BDF8] to-[#6366F1] text-white font-extrabold text-xs shadow-md hover:scale-105 transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                <span>Collect Vouchers ({collectedVouchers.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* 2. Visual Category Cards (5 on Mobile, 6-7 on Large Screens, Rounded Squircle, Scalable) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 font-['Outfit'] flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>{storeConfig.popularCollectionsTitle || "Popular Collections"}</span>
                </h3>
              </div>

              {categoryPages.length > 1 && (
                <div className="hidden sm:flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => scrollToCategoryPage(Math.max(0, activeCategoryPage - 1))}
                    disabled={activeCategoryPage === 0}
                    aria-label="Previous categories"
                    className="w-7 h-7 rounded-full border border-slate-200 bg-white shadow-2xs flex items-center justify-center text-slate-600 hover:text-sky-600 hover:border-sky-300 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToCategoryPage(Math.min(categoryPages.length - 1, activeCategoryPage + 1))}
                    disabled={activeCategoryPage === categoryPages.length - 1}
                    aria-label="Next categories"
                    className="w-7 h-7 rounded-full border border-slate-200 bg-white shadow-2xs flex items-center justify-center text-slate-600 hover:text-sky-600 hover:border-sky-300 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Paginated Category Grid: 5 cols on mobile, 6 cols on tablet, 7 cols on large desktop */}
            <div 
              ref={scrollContainerRef}
              onScroll={handleCategoriesScroll}
              className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide py-1.5 overscroll-x-contain transition-all"
            >
              {categoryPages.map((pageItems, pageIdx) => (
                <div 
                  key={`cat-page-${pageIdx}`}
                  className="w-full shrink-0 snap-start grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-7 gap-x-2 gap-y-2.5 sm:gap-x-3.5 sm:gap-y-3.5 px-0.5"
                >
                  {pageItems.map((sc) => {
                    const isActive = activeCategory.toLowerCase() === sc.targetCategory.toLowerCase();

                    return (
                      <button
                        key={sc.id}
                        type="button"
                        onClick={() => {
                          setActiveCategory(sc.targetCategory);
                          setSelectedSubcategory('All');
                          setSearchQuery('');
                          const el = document.getElementById('products');
                          el?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`w-full flex flex-col items-center text-center p-1 sm:p-1.5 rounded-2xl transition-all cursor-pointer group ${
                          isActive 
                            ? 'bg-sky-50 shadow-inner ring-1.5 ring-sky-300' 
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        {/* Rounded Squircle Container - Larger, Scalable with Screen Size, No Sharp Corners */}
                        <div className="relative w-full aspect-square max-w-[62px] sm:max-w-[76px] md:max-w-[88px] lg:max-w-[98px] flex items-center justify-center">
                          {sc.image ? (
                            <div className="w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/90 shadow-2xs group-hover:scale-105 group-hover:border-sky-400 group-hover:shadow-md transition-all duration-200 bg-white p-0.5 flex items-center justify-center">
                              <img src={sc.image} alt={sc.label} className="w-full h-full object-cover rounded-xl sm:rounded-2xl" loading="lazy" decoding="async" />
                            </div>
                          ) : (
                            <div className={`w-full h-full rounded-2xl sm:rounded-3xl bg-gradient-to-br ${sc.colorGradient || 'from-sky-500 to-indigo-600'} flex items-center justify-center text-xl sm:text-2xl lg:text-3xl shadow-2xs group-hover:scale-105 group-hover:shadow-md transition-all duration-200 text-white`}>
                              {sc.icon || '✨'}
                            </div>
                          )}
                          {sc.tag && (
                            <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-black text-[7.5px] sm:text-[8.5px] tracking-wider uppercase shadow-2xs">
                              {sc.tag}
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-[9.5px] sm:text-[11px] text-slate-700 mt-1.5 block leading-tight group-hover:text-sky-600 transition-colors truncate max-w-full px-0.5">
                          {sc.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Minimalist, Clean Pagination Indicator Dots (No Text Label) */}
            {categoryPages.length > 1 && (
              <div className="flex items-center justify-center gap-1.5 pt-2 pb-0.5">
                {categoryPages.map((_, idx) => (
                  <button
                    key={`cat-dot-${idx}`}
                    type="button"
                    onClick={() => scrollToCategoryPage(idx)}
                    aria-label={`Go to category slide ${idx + 1}`}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${
                      activeCategoryPage === idx
                        ? 'w-6 h-1.5 bg-gradient-to-r from-sky-500 to-indigo-600 shadow-xs'
                        : 'w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Catalog View */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10 sm:space-y-12">
        
        {/* Puja Special Spotlight Banner (Dynamic Festival Highlight 2026) */}
        {storeConfig.isFestivalHighlightActive !== false && activeCategory === 'All' && !searchQuery && (
          <section 
            className="relative rounded-3xl text-white p-6 sm:p-10 border border-amber-500/30 overflow-hidden shadow-2xl bg-cover bg-center"
            style={{
              backgroundImage: storeConfig.festivalHighlightImage 
                ? `linear-gradient(to right, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.75)), url(${storeConfig.festivalHighlightImage})`
                : 'linear-gradient(to right, #1E293B, #0F172A, #1E293B)'
            }}
          >
            <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white text-[11px] font-black uppercase tracking-wider shadow-lg">
                <Sparkles className="w-3 h-3" /> {storeConfig.festivalHighlightTitle || "FESTIVAL HIGHLIGHT 2026"}
              </div>

              <h2 className="text-2xl sm:text-4xl font-black font-['Outfit'] tracking-tight">
                {storeConfig.festivalHighlightSubtitle || "Puja Special Traditional Fusion Collection"}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                {storeConfig.festivalHighlightDesc || "Royal cotton-linen Kurtas and silk-touch button-downs crafted with mandarin collar embroidery for Durga Puja & Eid festivities."}
              </p>

              <button
                onClick={() => {
                  setActiveCategory(storeConfig.festivalHighlightCategory || 'Festive & Premium');
                  setSelectedSubcategory('All');
                }}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white font-extrabold text-xs shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer font-['Outfit'] tracking-wide"
              >
                {(storeConfig.festivalHighlightCtaText || "EXPLORE FESTIVAL SPECIAL").toUpperCase()} ({products.filter(p => p.category.toLowerCase() === (storeConfig.festivalHighlightCategory || 'Festive & Premium').toLowerCase()).length} ITEMS)
              </button>
            </div>
          </section>
        )}

        {/* Subcategories pill bar if active category has subcategories */}
        {currentCategoryObj && currentCategoryObj.subcategories && currentCategoryObj.subcategories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none bg-[#F8FAFC] p-3 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1 shrink-0">
              Filter:
            </span>
            <button
              onClick={() => setSelectedSubcategory('All')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedSubcategory === 'All'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All {activeCategory}
            </button>
            {currentCategoryObj.subcategories.map(sub => (
              <button
                key={sub}
                onClick={() => setSelectedSubcategory(sub)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  selectedSubcategory === sub
                    ? 'bg-[#38BDF8] text-slate-900 font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}

        {/* Catalog Header & Sort Options */}
        <div id="products" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-300/60 pb-4 bg-white/75 backdrop-blur-sm rounded-2xl p-4 sm:p-5 shadow-2xs border border-emerald-100">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] font-['Outfit'] tracking-tight flex items-center gap-2 flex-wrap">
              <span>
                {filterPreOrder && filterBuyMore
                  ? 'Pre-Order & Buy 1 Get 1 Deals'
                  : filterPreOrder
                  ? (storeConfig.preOrderSectionTitle || 'Pre-Order Products')
                  : filterBuyMore
                  ? (storeConfig.buyMoreSectionTitle || 'Buy 1 Get 1 Offers')
                  : activeCategory === 'All'
                  ? 'Curated Lifestyle Catalog'
                  : activeCategory}
                {!isTypeFilterActive && selectedSubcategory !== 'All' ? ` › ${selectedSubcategory}` : ''}
              </span>
              <span className="text-xs font-bold text-slate-500 bg-slate-200/80 px-2.5 py-1 rounded-full tabular-nums">
                {displayedCatalogCount} items
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Explore premium apparel, watches, smart electronics &amp; lifestyle items across Bangladesh.
            </p>
          </div>

          {/* Action Filters, Sort & See More Button */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Free Delivery filter button */}
            <button
              type="button"
              onClick={() => {
                setFilterFreeDelivery(!filterFreeDelivery);
                setCurrentPage(1);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border whitespace-nowrap ${
                filterFreeDelivery
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                  : 'bg-[#F8FAFC] text-slate-700 border-[#E2E8F0] hover:border-emerald-500 hover:text-emerald-700'
              }`}
              title="Filter by Free Delivery"
            >
              <Truck className={`w-3.5 h-3.5 ${filterFreeDelivery ? 'text-white' : 'text-emerald-600'}`} />
              <span>Free Delivery</span>
              {filterFreeDelivery && <X className="w-3 h-3 ml-0.5" />}
            </button>

            {/* Featured filter button */}
            <button
              type="button"
              onClick={() => {
                setFilterFeatured(!filterFeatured);
                setFilterPreOrder(false);
                setFilterBuyMore(false);
                setCurrentPage(1);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border whitespace-nowrap ${
                filterFeatured && !isTypeFilterActive
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white border-transparent shadow-md shadow-sky-500/20'
                  : 'bg-[#F8FAFC] text-slate-700 border-[#E2E8F0] hover:border-[#38BDF8] hover:text-[#38BDF8]'
              }`}
              title="Filter by Featured Products"
            >
              <Sparkles className={`w-3.5 h-3.5 ${filterFeatured && !isTypeFilterActive ? 'text-white' : 'text-amber-500'}`} />
              <span>Featured</span>
              {filterFeatured && !isTypeFilterActive && <X className="w-3 h-3 ml-0.5" />}
            </button>

            {/* Pre-Order filter pill */}
            {storeConfig.isPreOrderSectionVisible !== false && (
              <button
                type="button"
                onClick={() => {
                  setFilterPreOrder(!filterPreOrder);
                  setFilterFeatured(false);
                  setCurrentPage(1);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border whitespace-nowrap ${
                  filterPreOrder
                    ? 'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-500/20'
                    : 'bg-[#F8FAFC] text-slate-700 border-[#E2E8F0] hover:border-amber-500 hover:text-amber-700'
                }`}
                title="Filter by Pre-Order Products"
              >
                <Clock className={`w-3.5 h-3.5 ${filterPreOrder ? 'text-white' : 'text-amber-600'}`} />
                <span>Pre-Order</span>
                {filterPreOrder && <X className="w-3 h-3 ml-0.5" />}
              </button>
            )}

            {/* Buy 1 Get 1 filter pill */}
            {storeConfig.isBuyMoreSectionVisible !== false && (
              <button
                type="button"
                onClick={() => {
                  setFilterBuyMore(!filterBuyMore);
                  setFilterFeatured(false);
                  setCurrentPage(1);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border whitespace-nowrap ${
                  filterBuyMore
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
                    : 'bg-[#F8FAFC] text-slate-700 border-[#E2E8F0] hover:border-indigo-500 hover:text-indigo-700'
                }`}
                title="Filter by Buy 1 Get 1 Combo Offers"
              >
                <Gift className={`w-3.5 h-3.5 ${filterBuyMore ? 'text-white' : 'text-indigo-600'}`} />
                <span>Buy 1 Get 1</span>
                {filterBuyMore && <X className="w-3 h-3 ml-0.5" />}
              </button>
            )}

            {/* Sort dropdown */}
            <div className="flex items-center gap-2 bg-[#F8FAFC] px-3 py-2 rounded-xl border border-[#E2E8F0] shadow-2xs">
              <ArrowUpDown className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-600">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
              >
                <option value="featured">Featured First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Customer Rated</option>
              </select>
            </div>

            {/* See More Button for Active View */}
            <button
              type="button"
              onClick={() =>
                setActiveSeeMoreSection(
                  filterPreOrder && !filterBuyMore
                    ? 'pre_order'
                    : filterBuyMore && !filterPreOrder
                    ? 'buy_more'
                    : 'our_products'
                )
              }
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shadow-xs"
            >
              <span>See More</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Filtered Pre-Order / Buy 1 Get 1 Mode OR Section 1: Our Products */}
        {isTypeFilterActive ? (
          displayedCatalogCount === 0 ? (
            <div className="py-16 text-center space-y-4 bg-white rounded-3xl border border-[#E2E8F0] p-8">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Filter className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No items match your selected filter</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try clearing the Free Delivery or Pre-Order / Buy 1 Get 1 filter to explore more items.
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('All');
                  setSelectedSubcategory('All');
                  setSearchQuery('');
                  setFilterFreeDelivery(false);
                  setFilterFeatured(false);
                  setFilterPreOrder(false);
                  setFilterBuyMore(false);
                }}
                className="px-5 py-2.5 rounded-full bg-[#1E293B] text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Show All Products
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {filterPreOrder && filteredPreOrderCatalog.length > 0 && (
                <div className="space-y-4">
                  {filterBuyMore && (
                    <h3 className="text-base font-extrabold text-amber-700 flex items-center gap-2 font-['Outfit']">
                      <Clock className="w-4 h-4" />
                      <span>{storeConfig.preOrderSectionTitle || 'Pre-Order Products'} ({filteredPreOrderCatalog.length})</span>
                    </h3>
                  )}
                  <ShowcaseRowMatrix
                    items={filteredPreOrderCatalog}
                    keyExtractor={(item) => item.id}
                    renderItem={(item) => <PreOrderCard item={item} />}
                    maxRows={storeConfig.sectionLayouts?.preOrder?.maxRows ?? 3}
                    layoutConfig={storeConfig.sectionLayouts?.preOrder || INITIAL_STORE_CONFIG.sectionLayouts?.preOrder}
                  />
                </div>
              )}

              {filterBuyMore && filteredBuyMoreCatalog.length > 0 && (
                <div className="space-y-4">
                  {filterPreOrder && (
                    <h3 className="text-base font-extrabold text-indigo-700 flex items-center gap-2 font-['Outfit']">
                      <Gift className="w-4 h-4" />
                      <span>{storeConfig.buyMoreSectionTitle || 'Buy 1 Get 1 Offers'} ({filteredBuyMoreCatalog.length})</span>
                    </h3>
                  )}
                  <ShowcaseRowMatrix
                    items={filteredBuyMoreCatalog}
                    keyExtractor={(offer) => offer.id}
                    renderItem={(offer) => <BuyMoreCard offer={offer} />}
                    maxRows={storeConfig.sectionLayouts?.buyMore?.maxRows ?? 2}
                    layoutConfig={storeConfig.sectionLayouts?.buyMore || INITIAL_STORE_CONFIG.sectionLayouts?.buyMore}
                  />
                </div>
              )}
            </div>
          )
        ) : sortedProducts.length === 0 ? (
          <div className="py-16 text-center space-y-4 bg-white rounded-3xl border border-[#E2E8F0] p-8">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No products match your criteria</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try searching with another keyword or select a different category filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveCategory('All');
                setSelectedSubcategory('All');
                setSearchQuery('');
                setFilterFreeDelivery(false);
                setFilterFeatured(false);
                setFilterPreOrder(false);
                setFilterBuyMore(false);
              }}
              className="px-5 py-2.5 rounded-full bg-[#1E293B] text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Show All Products
            </button>
          </div>
        ) : (
          <ShowcaseRowMatrix
            items={sortedProducts}
            keyExtractor={(product) => product.id}
            renderItem={(product) => <ProductCard product={product} />}
            maxRows={storeConfig.sectionLayouts?.ourProducts?.maxRows ?? 4}
            layoutConfig={storeConfig.sectionLayouts?.ourProducts || INITIAL_STORE_CONFIG.sectionLayouts?.ourProducts}
          />
        )}

        {/* Banner #2: Pre-Order / Upcoming Products Banner (Admin Controlled, Slightly Narrower) */}
        {!isTypeFilterActive && showPreOrderSection && (
          <div className="pt-2">
            <SectionPromoBanner
              banner={storeConfig.upcomingBanner || INITIAL_STORE_CONFIG.upcomingBanner}
              defaultAnchor="#upcoming-products"
            />
          </div>
        )}

        {/* Section 2: Upcoming Products / Pre-Order (Admin Checkmark Controlled) */}
        {!isTypeFilterActive && showPreOrderSection && (
          <section id="upcoming-products" className="space-y-5 bg-white/85 backdrop-blur-sm rounded-3xl p-4 sm:p-6 border border-emerald-200/70 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-wider mb-1">
                  <Clock className="w-4 h-4" />
                  <span>Upcoming &amp; Pre-Order</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit'] tracking-tight">
                  {storeConfig.preOrderSectionTitle || 'Upcoming Products'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  {storeConfig.preOrderSectionSubtitle || 'Reserve upcoming drops before general release'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveSeeMoreSection('pre_order')}
                className="self-start sm:self-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shadow-xs"
              >
                <span>See More</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <ShowcaseRowMatrix
              items={visiblePreOrderProducts}
              keyExtractor={(item) => item.id}
              renderItem={(item) => <PreOrderCard item={item} />}
              maxRows={storeConfig.sectionLayouts?.preOrder?.maxRows ?? 3}
              layoutConfig={storeConfig.sectionLayouts?.preOrder || INITIAL_STORE_CONFIG.sectionLayouts?.preOrder}
            />
          </section>
        )}

        {/* Banner #3: Buy One Get More Banner (Admin Controlled, Slightly Narrower) */}
        {!isTypeFilterActive && showBuyMoreSection && (
          <div className="pt-2">
            <SectionPromoBanner
              banner={storeConfig.buyMoreBanner || INITIAL_STORE_CONFIG.buyMoreBanner}
              defaultAnchor="#buy-more-offers"
            />
          </div>
        )}

        {/* Section 3: Buy One Get More / Buy More Get More (Admin Checkmark Controlled) */}
        {!isTypeFilterActive && showBuyMoreSection && (
          <section id="buy-more-offers" className="space-y-5 bg-white/90 backdrop-blur-sm rounded-3xl p-4 sm:p-6 border border-emerald-200/80 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
                  <Gift className="w-4 h-4" />
                  <span>Combo &amp; Bonus Deals</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit'] tracking-tight">
                  {storeConfig.buyMoreSectionTitle || 'Buy One Get More'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  {storeConfig.buyMoreSectionSubtitle || 'Buy qualifying items and get extra products free'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveSeeMoreSection('buy_more')}
                className="self-start sm:self-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shadow-xs"
              >
                <span>See More</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Active Offer Vouchers Bar */}
            {visibleBuyMoreVouchers.length > 0 && (
              <div className="flex items-stretch gap-3 overflow-x-auto scrollbar-hide pb-1">
                {visibleBuyMoreVouchers.map(v => (
                  <div
                    key={v.id}
                    className="min-w-[250px] sm:min-w-[280px] p-3 rounded-2xl bg-slate-900 text-white flex items-center justify-between gap-3 border border-slate-800 shrink-0"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold">
                        <Ticket className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-mono">{v.code}</span>
                      </div>
                      <p className="text-xs font-bold truncate mt-0.5">{v.title}</p>
                      <p className="text-[11px] text-slate-300 truncate">{v.freeProductNote}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(v.code);
                        collectVoucher(v.code);
                        setCopiedOfferVoucher(v.code);
                        setTimeout(() => setCopiedOfferVoucher(null), 1800);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-white text-slate-900 text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0 whitespace-nowrap"
                    >
                      {copiedOfferVoucher === v.code ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedOfferVoucher === v.code ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <ShowcaseRowMatrix
              items={visibleBuyMoreOffers}
              keyExtractor={(offer) => offer.id}
              renderItem={(offer) => <BuyMoreCard offer={offer} />}
              maxRows={storeConfig.sectionLayouts?.buyMore?.maxRows ?? 2}
              layoutConfig={storeConfig.sectionLayouts?.buyMore || INITIAL_STORE_CONFIG.sectionLayouts?.buyMore}
            />
          </section>
        )}

      </main>
        </>
      )}

        {/* Footer */}
        <div className="relative z-10">
          <Footer />
        </div>
        </div>
      </PullToRefresh>

      {/* Scroll Progress Bar & All Floating Modals/Drawers Outside PullToRefresh Transform Layer */}
      <ScrollProgressBar />
      <CartDrawer />
      <CheckoutModal />
      {selectedPreOrderProduct && <PreOrderModal />}
      {selectedBuyMoreOffer && <BuyMoreOfferModal />}
      <OrderPolicyModal />
      <PolicyModal />
      <WhatsAppWidget />

      {/* Variant Selection Modal */}
      {isVariantModalOpen && variantModalProduct && (
        <ProductModal />
      )}

      {/* Menu Drawer Component */}
      <MenuDrawer
        isOpen={isMenuDrawerOpen}
        onClose={() => setIsMenuDrawerOpen(false)}
        onOpenVouchers={() => setIsVoucherModalOpen(true)}
        onOpenPolicy={(policy) => setActivePolicyModal(policy)}
        onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
      />

      {/* Track Order Modal Component */}
      <TrackOrderModal
        isOpen={isTrackOrderOpen}
        onClose={() => setIsTrackOrderOpen(false)}
      />

      {/* Vouchers Modal Component */}
      <VoucherModal
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
      />

      {/* Search Page Modal Component */}
      <SearchPage
        isOpen={isSearchPageOpen}
        onClose={() => setIsSearchPageOpen(false)}
      />

      {/* Static Page View Modal */}
      {selectedStaticPage && (
        <div
          className="fixed inset-0 z-[150] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fade-in"
          onClick={() => setSelectedStaticPage(null)}
        >
          <div
            className="bg-white rounded-[32px] max-w-4xl w-full h-[85vh] max-h-[85vh] flex flex-col shadow-2xl border border-slate-200/50 relative overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Elegant Header Area */}
            <div className="p-6 sm:p-8 border-b border-slate-100 flex items-center justify-between shrink-0 bg-gradient-to-r from-slate-50 to-white">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/50">
                  Information Portal
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-['Outfit'] tracking-tight animate-pulse-once">
                  {selectedStaticPage.title}
                </h2>
              </div>

              <button
                onClick={() => setSelectedStaticPage(null)}
                className="p-3 rounded-full bg-slate-100 text-slate-800 hover:bg-slate-900 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95 border border-slate-200/60"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Premium Scrollable Content */}
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-white">
              <div
                className="text-slate-800 leading-relaxed font-normal text-sm sm:text-base prose prose-slate max-w-none break-words whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: selectedStaticPage.content.replace(/\n/g, '<br />') }}
              />
            </div>

            {/* Elegant Footer Area */}
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setSelectedStaticPage(null)}
                className="px-6 py-2.5 rounded-2xl bg-slate-950 text-white font-black text-xs hover:bg-slate-800 transition-colors cursor-pointer shadow-md active:scale-95"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Login Modal (Triggered by Stealth Dot in Footer) */}
      {isAdminModalOpen && <AdminLoginModal />}

      {/* Standalone Full-Screen Modal Overlay for Product Details or Variant Modal */}
      {(selectedProduct || (isVariantModalOpen && variantModalProduct)) && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#F8FAFC]">
          <ProductModal />
        </div>
      )}
    </>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <ToastProvider>
          <MainAppContent />
        </ToastProvider>
      </StoreProvider>
    </ErrorBoundary>
  );
}

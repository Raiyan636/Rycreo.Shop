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
import { 
  Sparkles, 
  ArrowUpDown, 
  Filter, 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  ShoppingBag, 
  Layers, 
  Tag, 
  Flame, 
  Zap, 
  Clock, 
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  X
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { 
    products, 
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
    isSearchPageOpen,
    setIsSearchPageOpen,
    isVariantModalOpen,
    variantModalProduct,
    closeVariantModal
  } = useStore();

  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('All');
  const [filterFreeDelivery, setFilterFreeDelivery] = useState(false);
  const [filterFeatured, setFilterFeatured] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const itemsPerPage = 20;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeCategoryPage, setActiveCategoryPage] = useState(0);
  const [itemsPerPageByCategoryView, setItemsPerPageByCategoryView] = useState(() => {
    if (typeof window === 'undefined') return 12;
    if (window.innerWidth >= 1024) return 18;
    if (window.innerWidth >= 640) return 15;
    return 12;
  });

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w >= 1024) {
        setItemsPerPageByCategoryView(18);
      } else if (w >= 640) {
        setItemsPerPageByCategoryView(15);
      } else {
        setItemsPerPageByCategoryView(12);
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
  const isProductModalActive = Boolean(selectedProduct || (isVariantModalOpen && variantModalProduct));

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
      if (selectedProduct || isVariantModalOpen) {
        setSelectedProduct(null);
        closeVariantModal();
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
  }, [selectedProduct, isVariantModalOpen, setSelectedProduct, closeVariantModal]);

  // Favicon & Title Sync
  useEffect(() => {
    document.title = `${storeConfig.storeName} - Premium E-Commerce & Lifestyle`;
    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    const fav = storeConfig.faviconUrl || storeConfig.logoUrl || '/logo.png';
    link.href = fav;
    const appleLink: HTMLLinkElement | null = document.querySelector("link[rel='apple-touch-icon']");
    if (appleLink) {
      appleLink.href = fav;
    }
  }, [storeConfig.storeName, storeConfig.logoUrl]);

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
    <PullToRefresh>
      <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#1E293B]">
        {/* Scroll Progress Bar */}
        <ScrollProgressBar />


        {/* Top Announcement Bar */}
        {(storeConfig.isTopBarNoticeActive !== false && storeConfig.topBarNotice) && (
          <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 px-4 py-2 text-center text-xs sm:text-sm font-extrabold tracking-wide flex items-center justify-center gap-2 shadow-md">
            <Sparkles className="w-4 h-4 text-slate-950 animate-pulse shrink-0" />
            <span>{storeConfig.topBarNotice}</span>
          </div>
        )}

        {/* Header Navigation with Menu button */}
        <Header />

      {/* Hero Multi-Slide Banner Carousel */}
      <HeroCarousel />

      {/* DARAZ / GHORER BAZAR STYLE QUICK CATEGORY & VOUCHER HUB (Captivating Entrance Hook) */}
      <section className="bg-white border-b border-slate-200 py-6 sm:py-8 shadow-2xs">
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

          {/* 2. Visual Circular Category Avatars (Daraz Grid) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 font-['Outfit'] flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>{storeConfig.popularCollectionsTitle || "Popular Collections"}</span>
                </h3>
                {storeConfig.popularCollectionsSubtitle && (
                  <p className="text-[10px] text-slate-500 font-medium">{storeConfig.popularCollectionsSubtitle}</p>
                )}
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

            {/* Row-First Paginated Category Grid:
                - Mobile: 4 items per row, 3 rows max (up to 12 items per slide/page, swiping to next page if >12)
                - Tablet: 5 items per row, 2-3 rows (up to 15 items per slide/page)
                - Desktop/Laptop: 6 items per row, 2-3 rows (up to 18 items per slide/page)
            */}
            <div 
              ref={scrollContainerRef}
              onScroll={handleCategoriesScroll}
              className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide py-1.5 overscroll-x-contain transition-all"
            >
              {categoryPages.map((pageItems, pageIdx) => (
                <div 
                  key={`cat-page-${pageIdx}`}
                  className="w-full shrink-0 snap-start grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-x-2 gap-y-2.5 sm:gap-x-3 sm:gap-y-3.5 px-0.5"
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
                        className={`w-full flex flex-col items-center text-center p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer group ${
                          isActive 
                            ? 'bg-sky-50 shadow-inner ring-1 ring-sky-300' 
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="relative">
                          {sc.image ? (
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl overflow-hidden border border-slate-200 shadow-2xs group-hover:scale-105 transition-transform duration-200 bg-white">
                              <img src={sc.image} alt={sc.label} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                            </div>
                          ) : (
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br ${sc.colorGradient || 'from-amber-500 to-amber-700'} flex items-center justify-center text-lg sm:text-xl shadow-2xs group-hover:scale-105 transition-transform duration-200`}>
                              {sc.icon || '✨'}
                            </div>
                          )}
                          {sc.tag && (
                            <span className="absolute -top-1 -right-1.5 px-1 py-0.2 rounded-full bg-rose-500 text-white font-black text-[7.5px] tracking-wider uppercase shadow-2xs">
                              {sc.tag}
                            </span>
                          )}
                        </div>
                        <span className="font-semibold text-[10px] sm:text-[11px] text-slate-700 mt-1.5 block leading-tight group-hover:text-sky-600 transition-colors truncate max-w-full px-1">
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10 sm:space-y-12">
        
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
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
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
        <div id="products" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] font-['Outfit'] tracking-tight flex items-center gap-2">
              <span>
                {activeCategory === 'All' ? 'Curated Lifestyle Catalog' : activeCategory}
                {selectedSubcategory !== 'All' ? ` › ${selectedSubcategory}` : ''}
              </span>
              <span className="text-xs font-bold text-slate-500 bg-slate-200/80 px-2.5 py-1 rounded-full">
                {sortedProducts.length} items
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Explore premium apparel, watches, smart electronics & lifestyle items across Bangladesh.
            </p>
          </div>

          {/* Action Filters & Sort dropdown */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Free Delivery filter button */}
            <button
              onClick={() => {
                setFilterFreeDelivery(!filterFreeDelivery);
                setCurrentPage(1);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                filterFreeDelivery
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                  : 'bg-white text-slate-700 border-[#E2E8F0] hover:border-emerald-500 hover:text-emerald-700'
              }`}
              title="Filter by Free Delivery (ফ্রি ডেলিভারি পণ্য)"
            >
              <Truck className={`w-3.5 h-3.5 ${filterFreeDelivery ? 'text-white' : 'text-emerald-600'}`} />
              <span>Free Delivery</span>
              {filterFreeDelivery && <X className="w-3 h-3 ml-0.5" />}
            </button>

            {/* Featured filter button */}
            <button
              onClick={() => {
                setFilterFeatured(!filterFeatured);
                setCurrentPage(1);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                filterFeatured
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white border-transparent shadow-md shadow-sky-500/20'
                  : 'bg-white text-slate-700 border-[#E2E8F0] hover:border-[#38BDF8] hover:text-[#38BDF8]'
              }`}
              title="Filter by Featured Products (ফিচার্ড পণ্য)"
            >
              <Sparkles className={`w-3.5 h-3.5 ${filterFeatured ? 'text-white' : 'text-amber-500'}`} />
              <span>Featured</span>
              {filterFeatured && <X className="w-3 h-3 ml-0.5" />}
            </button>

            {/* Sort dropdown */}
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-[#E2E8F0] shadow-2xs">
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
          </div>
        </div>

        {/* Products Grid */}
        {paginatedProducts.length === 0 ? (
          <div className="py-16 text-center space-y-4 bg-white rounded-3xl border border-[#E2E8F0] p-8">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No products match your criteria</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try searching with another keyword or select a different category filter.
            </p>
            <button
              onClick={() => {
                setActiveCategory('All');
                setSelectedSubcategory('All');
                setSearchQuery('');
              }}
              className="px-5 py-2.5 rounded-full bg-[#1E293B] text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Show All Products
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-5 lg:gap-6">
              {paginatedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Daraz-style Premium Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  onClick={() => {
                    setCurrentPage(prev => Math.max(1, prev - 1));
                    const el = document.getElementById('products');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#38BDF8] disabled:opacity-50 disabled:hover:border-[#E2E8F0] text-xs font-bold text-slate-700 transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => {
                      setCurrentPage(page);
                      const el = document.getElementById('products');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`w-9 h-9 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      currentPage === page
                        ? 'bg-gradient-to-tr from-[#38BDF8] to-[#6366F1] text-white shadow-md'
                        : 'bg-white border border-[#E2E8F0] text-slate-700 hover:border-[#38BDF8]'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => {
                    setCurrentPage(prev => Math.min(totalPages, prev + 1));
                    const el = document.getElementById('products');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#38BDF8] disabled:opacity-50 disabled:hover:border-[#E2E8F0] text-xs font-bold text-slate-700 transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* Store Guarantees Banner */}
        <section className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center space-y-1.5 p-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#38BDF8] flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-sm text-slate-800">Fast Express Delivery</h4>
            <p className="text-xs text-slate-500">Inside Dhaka (৳60) in 24 hrs • Outside Dhaka (৳120) via Courier</p>
          </div>

          <div className="flex flex-col items-center space-y-1.5 p-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#10B981] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-sm text-slate-800">100% Authentic Quality</h4>
            <p className="text-xs text-slate-500">Super combed cotton & premium linen fabrics guaranteed.</p>
          </div>

          <div className="flex flex-col items-center space-y-1.5 p-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#F59E0B] flex items-center justify-center">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-sm text-slate-800">Easy Size Exchange</h4>
            <p className="text-xs text-slate-500">7-day size swap guarantee via WhatsApp support.</p>
          </div>
        </section>

      </main>

      {/* Floating Modals, Drawers & Popups */}
      <CartDrawer />
      <CheckoutModal />
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

      {/* Footer */}
      <Footer />

      {/* Standalone Full-Screen Modal Overlay for Product Details or Variant Modal */}
      {(selectedProduct || (isVariantModalOpen && variantModalProduct)) && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#F8FAFC]">
          <ProductModal />
        </div>
      )}
      </div>
    </PullToRefresh>
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

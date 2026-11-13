import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  X, 
  Search, 
  Truck, 
  ArrowRight,
  Clock,
  Trash2,
  Sparkles,
  TrendingUp,
  ShoppingBag,
  Menu,
  Gift
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, PreOrderProduct, BuyMoreOffer } from '../types/store';
import { ProductCard } from './ProductCard';
import { PreOrderCard } from './PreOrderCard';
import { BuyMoreCard } from './BuyMoreCard';
import { Footer } from './Footer';
import { StoreLogo } from './common/StoreLogo';

interface SearchPageProps {
  isOpen: boolean;
  onClose: () => void;
}

type UnifiedSearchItem =
  | {
      kind: 'product';
      id: string;
      price: number;
      title: string;
      createdAt: string;
      sold: number;
      order: number;
      featured: boolean;
      data: Product;
    }
  | {
      kind: 'preorder';
      id: string;
      price: number;
      title: string;
      createdAt: string;
      sold: number;
      order: number;
      featured: boolean;
      data: PreOrderProduct;
    }
  | {
      kind: 'buymore';
      id: string;
      price: number;
      title: string;
      createdAt: string;
      sold: number;
      order: number;
      featured: boolean;
      data: BuyMoreOffer;
    };

export const SearchPage: React.FC<SearchPageProps> = ({ isOpen, onClose }) => {
  const { 
    products, 
    preOrderProducts,
    buyMoreOffers,
    searchQuery, 
    setSearchQuery,
    searchLogs,
    clearSearchLogs,
    logSearchQuery,
    setActiveCategory,
    setSelectedProduct,
    storeConfig,
    cart,
    setIsCartOpen,
    setIsMenuDrawerOpen
  } = useStore();

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const inputRef = useRef<HTMLInputElement>(null);

  const [sortBy, setSortBy] = useState<'best-match' | 'price-low' | 'price-high' | 'best-order' | 'newest'>('best-match');
  const [filterFreeShipping, setFilterFreeShipping] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'all' | 'preorder' | 'buymore'>('all');
  const [hasSearched, setHasSearched] = useState(false);

  const visiblePreOrders = useMemo(
    () =>
      storeConfig.isPreOrderSectionVisible !== false
        ? preOrderProducts.filter((item) => item.isVisible !== false)
        : [],
    [preOrderProducts, storeConfig.isPreOrderSectionVisible]
  );

  const visibleBuyMores = useMemo(
    () =>
      storeConfig.isBuyMoreSectionVisible !== false
        ? buyMoreOffers.filter((offer) => offer.isVisible !== false)
        : [],
    [buyMoreOffers, storeConfig.isBuyMoreSectionVisible]
  );

  const handleBackToHome = () => {
    setSearchQuery('');
    setHasSearched(false);
    setTypeFilter('all');
    setFilterFreeShipping(false);
    setActiveCategory('All');
    setSelectedProduct(null);
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      setHasSearched(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const popularExamples = [
    "Polo T-Shirt",
    "Chino Pants",
    "Festival Kurta",
    "Drop-Shoulder Tee",
    "Winter Hoodie",
    "Chronograph Watch",
    "Wireless Earbuds",
    "Sneakers"
  ];

  // Auto-suggest search terms across Regular, Pre-Order, and Buy 1 Get 1 catalogs
  const searchSuggestions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q || hasSearched) return [];

    const set = new Set<string>();
    products.forEach((p) => {
      if ((p.title || '').toLowerCase().includes(q)) set.add(p.title);
      if ((p.category || '').toLowerCase().includes(q)) set.add(p.category);
      if (p.subcategory && (p.subcategory || '').toLowerCase().includes(q)) set.add(p.subcategory);
      if (Array.isArray(p.keywords)) {
        p.keywords.forEach((k) => {
          if (k && k.toLowerCase().includes(q)) set.add(k);
        });
      }
    });

    visiblePreOrders.forEach((p) => {
      if ((p.title || '').toLowerCase().includes(q)) set.add(p.title);
      if ((p.seoTitle || '').toLowerCase().includes(q)) set.add(p.seoTitle as string);
      if ((p.category || '').toLowerCase().includes(q)) set.add(p.category as string);
      if (Array.isArray(p.keywords)) {
        p.keywords.forEach((k) => {
          if (k && k.toLowerCase().includes(q)) set.add(k);
        });
      }
    });

    visibleBuyMores.forEach((o) => {
      if ((o.title || '').toLowerCase().includes(q)) set.add(o.title);
      if ((o.mainProductTitle || '').toLowerCase().includes(q)) set.add(o.mainProductTitle);
      if ((o.seoTitle || '').toLowerCase().includes(q)) set.add(o.seoTitle as string);
      if (Array.isArray(o.keywords)) {
        o.keywords.forEach((k) => {
          if (k && k.toLowerCase().includes(q)) set.add(k);
        });
      }
    });

    return Array.from(set).slice(0, 7);
  }, [searchQuery, products, visiblePreOrders, visibleBuyMores, hasSearched]);

  const handleSearchSubmit = (e?: React.FormEvent, term?: string) => {
    if (e) e.preventDefault();
    const queryToUse = term !== undefined ? term : searchQuery;
    if (queryToUse.trim() || typeFilter !== 'all') {
      setSearchQuery(queryToUse);
      if (queryToUse.trim()) {
        logSearchQuery(queryToUse);
      }
      setHasSearched(true);
    }
  };

  // Unified filtered & sorted catalog results
  const searchResults = useMemo<UnifiedSearchItem[]>(() => {
    const q = searchQuery.toLowerCase().trim();
    const activeQueryMode = hasSearched && (q.length > 0 || typeFilter !== 'all' || filterFreeShipping);
    if (!activeQueryMode) return [];

    const results: UnifiedSearchItem[] = [];

    if (typeFilter === 'all') {
      products.forEach((p) => {
        const matchesSearch =
          !q ||
          (p.title || '').toLowerCase().includes(q) ||
          (p.category || '').toLowerCase().includes(q) ||
          (Boolean(p.subcategory) && (p.subcategory || '').toLowerCase().includes(q)) ||
          (p.description || '').toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (Array.isArray(p.keywords) && p.keywords.some((k) => k && k.toLowerCase().includes(q)));
        const matchesFreeShipping = !filterFreeShipping || !!p.isFreeShipping;
        if (matchesSearch && matchesFreeShipping) {
          results.push({
            kind: 'product',
            id: `prod-${p.id}`,
            price: p.salePrice > 0 ? p.salePrice : p.price,
            title: p.title,
            createdAt: p.createdAt,
            sold: (p.baseSoldCount ?? p.soldCount ?? 0) + (p.realSalesCount ?? 0),
            order: p.position ?? p.order ?? 1000,
            featured: !!p.isFeatured,
            data: p,
          });
        }
      });
    }

    if (typeFilter === 'all' || typeFilter === 'preorder') {
      visiblePreOrders.forEach((p) => {
        const matchesSearch =
          !q ||
          (p.title || '').toLowerCase().includes(q) ||
          (p.category || '').toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q) ||
          (p.seoTitle || '').toLowerCase().includes(q) ||
          (Array.isArray(p.keywords) && p.keywords.some((k) => k && k.toLowerCase().includes(q)));
        const matchesFreeShipping = !filterFreeShipping || !!p.isFreeShipping;
        if (matchesSearch && matchesFreeShipping) {
          results.push({
            kind: 'preorder',
            id: `pre-${p.id}`,
            price: p.salePrice > 0 ? p.salePrice : p.price,
            title: p.title,
            createdAt: p.createdAt,
            sold: 0,
            order: p.position ?? 1000,
            featured: false,
            data: p,
          });
        }
      });
    }

    if (typeFilter === 'all' || typeFilter === 'buymore') {
      visibleBuyMores.forEach((o) => {
        const matchesSearch =
          !q ||
          (o.title || '').toLowerCase().includes(q) ||
          (o.mainProductTitle || '').toLowerCase().includes(q) ||
          (o.description || '').toLowerCase().includes(q) ||
          (o.seoTitle || '').toLowerCase().includes(q) ||
          (Array.isArray(o.keywords) && o.keywords.some((k) => k && k.toLowerCase().includes(q))) ||
          (Array.isArray(o.freeItems) && o.freeItems.some((fi) => (fi.title || '').toLowerCase().includes(q)));
        const matchesFreeShipping = !filterFreeShipping || !!o.isFreeShipping;
        if (matchesSearch && matchesFreeShipping) {
          results.push({
            kind: 'buymore',
            id: `bmo-${o.id}`,
            price: o.price,
            title: o.title,
            createdAt: o.createdAt,
            sold: 0,
            order: o.position ?? 1000,
            featured: false,
            data: o,
          });
        }
      });
    }

    return results.sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'best-order') return b.sold - a.sold;
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (a.order !== b.order) return a.order - b.order;
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return a.title.localeCompare(b.title);
    });
  }, [
    products,
    visiblePreOrders,
    visibleBuyMores,
    searchQuery,
    sortBy,
    filterFreeShipping,
    typeFilter,
    hasSearched,
  ]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 overflow-y-auto">
      {/* Premium Spacious Search Header with Store Navbar & Deep Slate Theme */}
      <div className="sticky top-0 bg-[#1E293B] text-white border-b border-[#334155] shadow-xl z-30 px-4 py-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-3">
          
          {/* Top Row: Store Header Navigation (Logo, Cart, Menu, Close) */}
          <div className="flex items-center justify-between border-b border-[#334155] pb-3 gap-3">
            <button
              onClick={handleBackToHome}
              className="flex items-center gap-2.5 group cursor-pointer text-left"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#38BDF8] via-[#6366F1] to-[#F59E0B] p-0.5 shadow-md shrink-0">
                <div 
                  className="w-full h-full rounded-full flex items-center justify-center font-black text-xl overflow-hidden p-0.5"
                  style={{ backgroundColor: storeConfig.logoBgColor || '#FFFFFF' }}
                >
                  {(!storeConfig.logoUrl || storeConfig.logoUrl === '/logo.svg' || storeConfig.logoUrl === '/logo.png') ? (
                    <StoreLogo className="w-full h-full object-contain scale-110" bgColor={storeConfig.logoBgColor || '#FFFFFF'} />
                  ) : (
                    <img 
                      src={storeConfig.logoUrl} 
                      alt={storeConfig.storeName} 
                      className="w-full h-full object-contain rounded-full scale-110" 
                    />
                  )}
                </div>
              </div>
              <span className="font-black text-base sm:text-lg text-white group-hover:text-[#38BDF8] transition-colors font-['Outfit'] truncate">
                {storeConfig.storeName}
              </span>
            </button>

            <div className="flex items-center gap-2">
              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-[#38BDF8] to-[#6366F1] text-white font-bold text-xs shadow-md cursor-pointer"
              >
                <div className="relative">
                  <ShoppingBag className="w-4 h-4" />
                  {totalCartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#F59E0B] text-slate-900 font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                      {totalCartCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline">Cart</span>
              </button>

              {/* Menu Button */}
              <button
                onClick={() => setIsMenuDrawerOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
                title="Menu"
              >
                <Menu className="w-4 h-4 text-[#38BDF8]" />
                <span className="text-xs font-extrabold uppercase">Menu</span>
              </button>

              {/* Close Search Page */}
              <button 
                type="button"
                onClick={handleBackToHome}
                className="p-2 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer border border-slate-700 flex items-center gap-1"
                title="Close Search"
              >
                <X className="w-4 h-4" />
                <span className="text-xs font-extrabold hidden sm:inline">Close</span>
              </button>
            </div>
          </div>

          {/* Search Input Form & Go/Search Button Side-By-Side (Completely separated!) */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <form onSubmit={(e) => handleSearchSubmit(e)} className="flex-1 flex items-center gap-3 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#38BDF8]" />
                <input 
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setHasSearched(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearchSubmit(e);
                    }
                  }}
                  enterKeyHint="search"
                  placeholder="শার্ট, polo, कुर्ता, watches... Type here and press Search/Go"
                  className="w-full pl-11 pr-11 py-3 bg-[#090D16] border-2 border-[#38BDF8]/80 text-white rounded-2xl text-xs sm:text-sm outline-none focus:border-[#38BDF8] focus:ring-4 focus:ring-[#38BDF8]/10 transition-all placeholder:text-slate-500 font-bold shadow-inner"
                />
                
                {/* Clear Input X Button (Cross 3) - Positioned beautifully on the far right of input */}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setHasSearched(false);
                    }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-1.5 rounded-full cursor-pointer transition-colors"
                    title="Clear text"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Prominent Search/Go Button - Placed side by side */}
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-[#38BDF8] hover:bg-sky-300 text-slate-950 font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-sky-500/10 shrink-0 border border-sky-400/20 active:scale-95 h-[48px]"
              >
                <span>SEARCH / GO</span>
                <ArrowRight className="w-4.5 h-4.5 stroke-[3]" />
              </button>
            </form>
          </div>

          {/* Live Suggestion Dropdown */}
          {searchSuggestions.length > 0 && (
            <div className="absolute left-4 right-4 md:left-auto md:right-auto md:w-[600px] mt-1 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-40 animate-slide-in">
              <div className="py-2">
                {searchSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSearchSubmit(undefined, suggestion)}
                    className="w-full text-left px-4 py-3 text-xs font-bold hover:bg-slate-100 flex items-center gap-3 transition-none cursor-pointer border-b border-slate-100 last:border-b-0"
                  >
                    <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{suggestion}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Sort bar (Always accessible when searching or browsing filter pills) */}
      {(hasSearched || typeFilter !== 'all' || filterFreeShipping) && (
        <div className="bg-white border-b border-slate-200 px-4 py-3 sm:px-6 shadow-2xs shrink-0">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setTypeFilter('all');
                  setHasSearched(true);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-none shrink-0 cursor-pointer border whitespace-nowrap ${
                  typeFilter === 'all'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-slate-500'
                }`}
              >
                All
              </button>

              {storeConfig.isPreOrderSectionVisible !== false && (
                <button
                  type="button"
                  onClick={() => {
                    setTypeFilter((prev) => (prev === 'preorder' ? 'all' : 'preorder'));
                    setHasSearched(true);
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-none shrink-0 cursor-pointer border whitespace-nowrap ${
                    typeFilter === 'preorder'
                      ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                      : 'bg-white text-slate-800 border-slate-300 hover:border-amber-500'
                  }`}
                >
                  <Clock className={`w-3.5 h-3.5 ${typeFilter === 'preorder' ? 'text-white' : 'text-amber-600'}`} />
                  <span>Pre-Order</span>
                </button>
              )}

              {storeConfig.isBuyMoreSectionVisible !== false && (
                <button
                  type="button"
                  onClick={() => {
                    setTypeFilter((prev) => (prev === 'buymore' ? 'all' : 'buymore'));
                    setHasSearched(true);
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-none shrink-0 cursor-pointer border whitespace-nowrap ${
                    typeFilter === 'buymore'
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                      : 'bg-white text-slate-800 border-slate-300 hover:border-indigo-500'
                  }`}
                >
                  <Gift className={`w-3.5 h-3.5 ${typeFilter === 'buymore' ? 'text-white' : 'text-indigo-600'}`} />
                  <span>Buy 1 Get 1</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setFilterFreeShipping(!filterFreeShipping);
                  setHasSearched(true);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-none shrink-0 cursor-pointer border whitespace-nowrap ${
                  filterFreeShipping
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                    : 'bg-white text-slate-800 border-slate-300 hover:border-emerald-500'
                }`}
              >
                <Truck className={`w-3.5 h-3.5 ${filterFreeShipping ? 'text-white' : 'text-emerald-600'}`} />
                <span>Free Shipping</span>
              </button>

              <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-xl px-3 py-1.5 shadow-2xs">
                <span className="text-xs font-bold text-slate-600 shrink-0">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent font-extrabold text-xs text-slate-900 outline-none cursor-pointer pr-1"
                >
                  <option value="best-match">Best Match</option>
                  <option value="best-order">Best Selling</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest Arrivals</option>
                </select>
              </div>
            </div>

            <div className="text-xs font-black text-slate-800 font-mono tabular-nums">
              {searchResults.length} Items Found
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area: Natural Document Flow so Footer is Fully Reachable at the Bottom */}
      <div className="flex flex-col min-h-[calc(100vh-80px)] justify-between">
        <div className="max-w-7xl mx-auto w-full px-4 py-8 sm:px-6 pb-20">
          {!hasSearched || (!searchQuery.trim() && typeFilter === 'all' && !filterFreeShipping) ? (
            /* INITIAL LANDING VIEW (Quick Category Type Pills, Popular Examples & History) */
            <div className="max-w-2xl mx-auto space-y-6 py-8">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-2xl bg-sky-500/10 text-[#38BDF8] flex items-center justify-center mx-auto shadow-inner">
                  <Search className="w-8 h-8" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit']">
                  Search RycreoShop Catalog
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Search across Stock Products, Pre-Order Drops &amp; Buy 1 Get 1 Combo Offers.
                </p>
              </div>

              {/* Quick Filter Shortcuts: Pre-Order & Buy 1 Get 1 */}
              {(visiblePreOrders.length > 0 || visibleBuyMores.length > 0) && (
                <div className="flex items-center justify-center flex-wrap gap-2.5">
                  {visiblePreOrders.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setTypeFilter('preorder');
                        setHasSearched(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-600 text-amber-800 hover:text-white border border-amber-200 text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Browse Pre-Order ({visiblePreOrders.length})</span>
                    </button>
                  )}
                  {visibleBuyMores.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setTypeFilter('buymore');
                        setHasSearched(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-800 hover:text-white border border-indigo-200 text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>Browse Buy 1 Get 1 ({visibleBuyMores.length})</span>
                    </button>
                  )}
                </div>
              )}

              {/* Popular Search Examples */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800">
                  <TrendingUp className="w-4 h-4 text-amber-500" />
                  <span>Popular Search Examples</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularExamples.map((ex, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSearchSubmit(undefined, ex)}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-[#38BDF8] hover:text-slate-950 text-slate-700 text-xs font-extrabold transition-none cursor-pointer flex items-center gap-1.5 shadow-2xs border border-slate-200"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>{ex}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Search History with Clear History Option */}
              {searchLogs.length > 0 && (
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800">
                      <Clock className="w-4 h-4 text-[#38BDF8]" />
                      <span>Recent Search History</span>
                    </div>
                    <button
                      onClick={clearSearchLogs}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition-none cursor-pointer border border-rose-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear Search History</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {searchLogs.map((log, idx) => (
                      <div
                        key={idx}
                        className="group flex items-center gap-2 bg-slate-50 border border-slate-200 hover:border-[#38BDF8] px-3.5 py-2 rounded-xl transition-none cursor-pointer shadow-2xs"
                        onClick={() => handleSearchSubmit(undefined, log.query)}
                      >
                        <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#38BDF8]" />
                        <span className="text-xs font-bold text-slate-800 capitalize">{log.query}</span>
                        <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold">
                          {log.count}x
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : searchResults.length > 0 ? (
            /* UNIFIED SEARCH RESULTS GRID (Regular + Pre-Order + Buy 1 Get 1) */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-6 gap-2.5 sm:gap-3.5 lg:gap-4">
              {searchResults.map((entry) => {
                if (entry.kind === 'preorder') {
                  return <PreOrderCard key={entry.id} item={entry.data} />;
                }
                if (entry.kind === 'buymore') {
                  return <BuyMoreCard key={entry.id} offer={entry.data} />;
                }
                return <ProductCard key={entry.id} product={entry.data} />;
              })}
            </div>
          ) : (
            /* NO RESULTS FOUND */
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No matching items found</h3>
              <p className="text-xs text-slate-500 max-w-xs">
                We couldn&apos;t find anything matching {searchQuery ? `"${searchQuery}"` : 'this filter'}. Try another keyword or reset filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setTypeFilter('all');
                  setFilterFreeShipping(false);
                  setHasSearched(false);
                }}
                className="px-5 py-2 bg-slate-900 text-white rounded-full text-xs font-bold hover:bg-slate-800 transition-none cursor-pointer shadow-md"
              >
                Reset Search &amp; Filters
              </button>
            </div>
          )}
        </div>

        {/* Footer fully reachable at the bottom of the page */}
        <Footer />
      </div>
    </div>
  );
};

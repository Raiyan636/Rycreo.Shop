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
  Home,
  ShoppingBag,
  Heart,
  Menu
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { Footer } from './Footer';
import { StoreLogo } from './common/StoreLogo';

interface SearchPageProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ isOpen, onClose }) => {
  const { 
    products, 
    searchQuery, 
    setSearchQuery,
    searchLogs,
    clearSearchLogs,
    logSearchQuery,
    setActiveCategory,
    setSelectedProduct,
    storeConfig,
    cart,
    wishlist,
    setIsCartOpen,
    setIsMenuDrawerOpen
  } = useStore();

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const inputRef = useRef<HTMLInputElement>(null);

  const [sortBy, setSortBy] = useState<'best-match' | 'price-low' | 'price-high' | 'best-order' | 'newest'>('best-match');
  const [filterFreeShipping, setFilterFreeShipping] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleBackToHome = () => {
    setSearchQuery('');
    setHasSearched(false);
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

  // YouTube-style auto-suggest search terms based on typing
  const searchSuggestions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q || hasSearched) return [];
    
    const set = new Set<string>();
    products.forEach(p => {
      if ((p.title || '').toLowerCase().includes(q)) set.add(p.title);
      if ((p.category || '').toLowerCase().includes(q)) set.add(p.category);
      if (p.subcategory && (p.subcategory || '').toLowerCase().includes(q)) set.add(p.subcategory);
      if (Array.isArray(p.keywords)) {
        p.keywords.forEach(k => {
          if (k && (k || '').toLowerCase().includes(q)) set.add(k);
        });
      }
    });
    return Array.from(set).slice(0, 6);
  }, [searchQuery, products, hasSearched]);

  const handleSearchSubmit = (e?: React.FormEvent, term?: string) => {
    if (e) e.preventDefault();
    const queryToUse = term !== undefined ? term : searchQuery;
    if (queryToUse.trim()) {
      setSearchQuery(queryToUse);
      logSearchQuery(queryToUse);
      setHasSearched(true);
    }
  };

  // Derived filtered and sorted products (ONLY shown after explicit search submit / Go)
  const searchResults = useMemo(() => {
    if (!hasSearched) return [];
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];

    let filtered = products.filter(p => {
      const matchesSearch = (
        (p.title || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (Boolean(p.subcategory) && (p.subcategory || '').toLowerCase().includes(q)) ||
        (p.description || '').toLowerCase().includes(q) ||
        (Array.isArray(p.keywords) && p.keywords.some(k => k && (k || '').toLowerCase().includes(q)))
      );
      
      const matchesFreeShipping = filterFreeShipping ? p.isFreeShipping : true;

      return matchesSearch && matchesFreeShipping;
    });

    // Sorting logic
    return [...filtered].sort((a, b) => {
      if (sortBy === 'price-low') {
        const priceA = a.salePrice > 0 ? a.salePrice : a.price;
        const priceB = b.salePrice > 0 ? b.salePrice : b.price;
        return priceA - priceB;
      }
      if (sortBy === 'price-high') {
        const priceA = a.salePrice > 0 ? a.salePrice : a.price;
        const priceB = b.salePrice > 0 ? b.salePrice : b.price;
        return priceB - priceA;
      }
      if (sortBy === 'best-order') {
        const soldA = (a.baseSoldCount ?? (a.soldCount ?? 0)) + (a.realSalesCount ?? 0);
        const soldB = (b.baseSoldCount ?? (b.soldCount ?? 0)) + (b.realSalesCount ?? 0);
        return soldB - soldA;
      }
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'best-match') {
        const orderA = a.order !== undefined ? a.order : 1000;
        const orderB = b.order !== undefined ? b.order : 1000;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [products, searchQuery, sortBy, filterFreeShipping, hasSearched]);

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

      {/* Filter and Sort bar (Only shown when hasSearched is true) */}
      {hasSearched && (
        <div className="bg-white border-b border-slate-200 px-4 py-3 sm:px-6 shadow-2xs shrink-0">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setFilterFreeShipping(!filterFreeShipping)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-none shrink-0 cursor-pointer ${
                  filterFreeShipping 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'bg-white text-slate-800 border border-slate-300 hover:border-emerald-500'
                }`}
              >
                <Truck className={`w-4 h-4 ${filterFreeShipping ? 'text-white' : 'text-emerald-600'}`} />
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

            <div className="text-xs font-black text-slate-800 font-mono">
              {searchResults.length} Products Found
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area: Natural Document Flow so Footer is Fully Reachable at the Bottom */}
      <div className="flex flex-col min-h-[calc(100vh-80px)] justify-between">
        <div className="max-w-7xl mx-auto w-full px-4 py-8 sm:px-6 pb-20">
          {!hasSearched || !searchQuery.trim() ? (
            /* INITIAL LANDING VIEW (No products while typing, only examples & history) */
            <div className="max-w-2xl mx-auto space-y-8 py-8">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-2xl bg-sky-500/10 text-[#38BDF8] flex items-center justify-center mx-auto shadow-inner">
                  <Search className="w-8 h-8" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit']">
                  Search RycreoShop Catalog
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Type any keyword above or click popular search tags below to find items instantly.
                </p>
              </div>

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
            /* SEARCH RESULTS GRID (Shown ONLY after Go / Submit) */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {searchResults.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            /* NO RESULTS FOUND */
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No matching products found</h3>
              <p className="text-xs text-slate-500 max-w-xs">
                We couldn't find anything matching "{searchQuery}". Try searching with another keyword or explore popular examples above.
              </p>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setHasSearched(false);
                }}
                className="px-5 py-2 bg-slate-900 text-white rounded-full text-xs font-bold hover:bg-slate-800 transition-none cursor-pointer shadow-md"
              >
                Clear Search
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

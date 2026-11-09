import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  Phone, 
  MessageSquare, 
  Sparkles, 
  UserCheck, 
  Menu, 
  X, 
  ChevronRight, 
  Lock, 
  ArrowRight
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useToast } from './common/Toast';
import { StoreLogo } from './common/StoreLogo';

interface HeaderProps {
  onOpenSearch?: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const { 
    storeConfig, 
    cart, 
    wishlist, 
    setActiveCategory, 
    searchQuery, 
    setSearchQuery,
    setIsCartOpen,
    isAdminLoggedIn,
    isAdminModalOpen,
    setIsAdminModalOpen,
    setIsAdminViewingStore,
    setActiveAdminTab,
    products,
    setSelectedProduct,
    setIsMenuDrawerOpen,
    staticPages,
    setSelectedStaticPage,
    logSearchQuery,
    setIsSearchPageOpen
  } = useStore();

  const { showToast } = useToast();
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Auto-focus input when search is expanded
  useEffect(() => {
    if (isSearchExpanded) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isSearchExpanded]);

  // Log searches debounced
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) return;
    const delayDebounceFn = setTimeout(() => {
      logSearchQuery(q);
    }, 1200);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, logSearchQuery]);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = searchQuery.trim();
    if (!q) {
      showToast("Please enter a product title or keyword to search", "info");
      return;
    }

    logSearchQuery(q);
    setActiveCategory('All');
    setIsSearchExpanded(false);
    setIsSearchFocused(false);
    
    // Smooth scroll to products
    const el = document.getElementById('products');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    showToast(`🔍 Showing results for "${q}"`, "success");
  };

  // Search autocomplete suggestions across title, category, description, and keywords
  const filteredSearchSuggestions = searchQuery.trim().length > 1
    ? products.filter(p => {
        const qLower = searchQuery.toLowerCase();
        return (p.title || '').toLowerCase().includes(qLower) || 
          (p.category || '').toLowerCase().includes(qLower) ||
          (Boolean(p.subcategory) && (p.subcategory || '').toLowerCase().includes(qLower)) ||
          (p.description || '').toLowerCase().includes(qLower) ||
          (Array.isArray(p.keywords) && p.keywords.some(k => k && (k || '').toLowerCase().includes(qLower)));
      }).slice(0, 5)
    : [];

  const activeStaticPages = (staticPages || []).filter(p => p && p.active).sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <header className="sticky top-0 z-40 bg-[#1E293B] text-white shadow-xl border-b border-[#334155]">
      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3 sm:gap-4">
        
        {/* Left Side: Brand Logo & Title */}
        <div className="flex items-center shrink-0">
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              setActiveCategory('All');
              setSearchQuery('');
              setIsSearchExpanded(false);
            }} 
            className="flex items-center gap-2.5 group"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-[#38BDF8] via-[#6366F1] to-[#F59E0B] p-0.5 shadow-xl shadow-sky-500/25 group-hover:scale-105 transition-transform duration-300 shrink-0">
              <div 
                className="w-full h-full rounded-full flex items-center justify-center font-black text-2xl overflow-hidden p-0.5 shadow-inner"
                style={{ backgroundColor: storeConfig.logoBgColor || '#FFFFFF' }}
              >
                {(!storeConfig.logoUrl || storeConfig.logoUrl === '/logo.svg' || storeConfig.logoUrl === '/logo.png') ? (
                  <StoreLogo className="w-full h-full object-contain scale-110" bgColor={storeConfig.logoBgColor || '#FFFFFF'} />
                ) : (
                  <img 
                    src={storeConfig.logoUrl} 
                    alt={storeConfig.storeName} 
                    className="w-full h-full object-contain rounded-full scale-110" 
                    style={{ backgroundColor: storeConfig.logoBgColor || '#FFFFFF' }}
                  />
                )}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg sm:text-2xl tracking-tight text-white block leading-none font-['Outfit'] group-hover:text-[#38BDF8] transition-colors">
                {storeConfig.storeName}
              </span>
            </div>
          </a>
        </div>

        {/* Right Side: Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">

          {/* SEARCH TRIGGER ICON (Placed right next to Wishlist) */}
          <button
            onClick={() => setIsSearchPageOpen(true)}
            className="p-2 sm:p-2.5 rounded-full bg-[#0F172A] border border-[#334155] text-slate-300 hover:text-[#38BDF8] hover:border-[#38BDF8]/40 transition-colors relative cursor-pointer flex items-center justify-center group"
            aria-label="Search Products"
            title="Search Products (Click to open Search Page)"
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#38BDF8] group-hover:scale-110 transition-transform" />
          </button>

          {/* Wishlist Button */}
          <button 
            onClick={() => {
              setActiveCategory('All');
              const el = document.getElementById('products');
              el?.scrollIntoView({ behavior: 'smooth' });
            }} 
            className="p-2 sm:p-2.5 rounded-full bg-[#0F172A] border border-[#334155] text-slate-300 hover:text-rose-400 hover:border-rose-500/40 transition-colors relative cursor-pointer"
            title="Wishlist"
          >
            <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Cart Drawer Trigger */}
          <button 
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-2 rounded-full bg-gradient-to-r from-[#38BDF8] to-[#6366F1] text-white font-bold text-xs shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4" />
              {totalCartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#F59E0B] text-slate-900 font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {totalCartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">My Cart</span>
          </button>


          {/* Prominent MENU Button */}
          <button 
            onClick={() => setIsMenuDrawerOpen(true)}
            className="flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/80 hover:border-[#38BDF8]/60 transition-all cursor-pointer shadow-sm group"
            aria-label="Open Store Menu"
            title="Open Store Menu"
          >
            <Menu className="w-5 h-5 text-[#38BDF8] group-hover:scale-110 transition-transform" />
            <span className="text-xs font-extrabold tracking-wide uppercase">Menu</span>
          </button>
        </div>
      </div>
    </header>
  );
};

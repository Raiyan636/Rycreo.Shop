import React, { useState, useEffect, useRef } from 'react';
import { X, Search, TrendingUp, Sparkles, ArrowRight, Tag } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useToast } from './common/Toast';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
  const { 
    searchQuery, 
    setSearchQuery, 
    products, 
    setSelectedProduct, 
    searchLogs, 
    logSearchQuery,
    setActiveCategory
  } = useStore();

  const { showToast } = useToast();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [localQuery, setLocalQuery] = useState(searchQuery);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setLocalQuery(searchQuery);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, searchQuery]);

  if (!isOpen) return null;

  // Sync back search query on changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalQuery(val);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = localQuery.trim();
    if (!query) {
      showToast("Please enter a product title or keyword to search", "info");
      return;
    }

    setSearchQuery(query);
    logSearchQuery(query);
    setActiveCategory('All');
    onClose();

    setTimeout(() => {
      const el = document.getElementById('products');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);

    showToast(`🔍 Showing results for "${query}"`, "success");
  };

  const handleSuggestionClick = (query: string) => {
    setLocalQuery(query);
    setSearchQuery(query);
    logSearchQuery(query);
    setActiveCategory('All');
    onClose();
    const el = document.getElementById('products');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    onClose();
  };

  // Multi-keyword matching across Title, Category, Subcategory, Description, Brand, and Admin Custom Keywords
  const filteredProducts = localQuery.trim().length > 1
    ? products.filter(p => {
        const q = localQuery.toLowerCase().trim();
        return (p.title || '').toLowerCase().includes(q) || 
          (p.category || '').toLowerCase().includes(q) ||
          (Boolean(p.subcategory) && (p.subcategory || '').toLowerCase().includes(q)) ||
          (p.description || '').toLowerCase().includes(q) ||
          (Boolean(p.brand) && (p.brand || '').toLowerCase().includes(q)) ||
          (Array.isArray(p.keywords) && p.keywords.some(k => k && ((k || '').toLowerCase().includes(q) || q.includes((k || '').toLowerCase()))));
      }).slice(0, 8)
    : [];

  return (
    <div className="fixed inset-0 z-50 bg-[#0F172A]/95 backdrop-blur-xl flex flex-col justify-start animate-fade-in text-white p-4 sm:p-6 md:p-12 overflow-y-auto">
      {/* Search Header Close bar */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#38BDF8]" />
          <span>Multi-Keyword Catalog Search</span>
        </span>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
          title="Close search"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="max-w-4xl w-full mx-auto space-y-6 flex-1">
        {/* Main Search Input Box with Prominent GO Button */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <Search className="w-5 h-5 sm:w-6 sm:h-6 text-[#38BDF8] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={localQuery}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearchSubmit(e);
              if (e.key === 'Escape') onClose();
            }}
            enterKeyHint="search"
            placeholder="Search by product name, category, or keyword..."
            className="w-full bg-[#1E293B] border-2 border-slate-700 focus:border-[#38BDF8] text-white text-sm sm:text-lg rounded-2xl pl-12 sm:pl-14 pr-28 sm:pr-32 py-3.5 sm:py-4.5 outline-none transition-all duration-300 placeholder:text-slate-500 focus:ring-4 focus:ring-[#38BDF8]/15 shadow-xl"
          />

          <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {localQuery && (
              <button
                type="button"
                onClick={() => setLocalQuery('')}
                className="text-slate-400 hover:text-white p-1 text-xs font-bold cursor-pointer"
                title="Clear"
              >
                ✕
              </button>
            )}

            {/* HIGH-VISIBILITY GO BUTTON */}
            <button
              type="submit"
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#38BDF8] to-[#0284C7] hover:from-[#0284C7] hover:to-[#0369A1] text-white text-xs sm:text-sm font-black tracking-wide shadow-lg shadow-sky-500/25 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
              title="Click or press Go to search"
            >
              <span>Go</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </form>

        {/* Results Banner when query typed */}
        {localQuery.trim().length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-sky-950/70 via-slate-900 to-sky-950/70 border border-[#38BDF8]/40 shadow-xl animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/20 flex items-center justify-center text-[#38BDF8] shrink-0 font-bold text-lg">
                🔍
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-white">
                  Searching: <span className="text-[#38BDF8] font-black">"{localQuery}"</span>
                </p>
                <p className="text-[11px] text-slate-400">
                  {filteredProducts.length > 0 
                    ? `Found ${filteredProducts.length} matching products. Click Go or select below:` 
                    : `Press Go to view full catalog query results.`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSearchSubmit()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#38BDF8] hover:bg-[#0284C7] text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <span>See Products Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Two column grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-2">
          {/* Left side: suggestions and popular logs */}
          <div className="md:col-span-4 space-y-6">
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 font-['Outfit']">
                <TrendingUp className="w-3.5 h-3.5 text-[#38BDF8]" /> Popular Search Queries
              </h4>
              <div className="flex flex-wrap gap-2 pt-1">
                {searchLogs && searchLogs.length > 0 ? (
                  searchLogs.slice(0, 8).map((log) => (
                    <button
                      key={log.query}
                      onClick={() => handleSuggestionClick(log.query)}
                      className="px-3 py-1.5 rounded-xl bg-[#1E293B] border border-slate-800 hover:border-[#38BDF8]/40 hover:bg-[#1E293B]/80 text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
                    >
                      {log.query}
                    </button>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">Search for polo, t-shirt, watch, or jeans.</span>
                )}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h5 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#F59E0B]" /> Multi-Keyword Query Engine
              </h5>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Our search engine searches across titles, categories, descriptions, and custom keywords in English, Banglish, and common variations.
              </p>
            </div>
          </div>

          {/* Right side: live preview results */}
          <div className="md:col-span-8 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider font-['Outfit']">
                {filteredProducts.length > 0 ? `Matching Products (${filteredProducts.length})` : 'Catalog Suggestions'}
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(filteredProducts.length > 0 ? filteredProducts : products.slice(0, 4)).map((product) => {
                const effectivePrice = product.salePrice > 0 ? product.salePrice : product.price;
                return (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-[#1E293B] hover:bg-slate-800/90 border border-slate-800 hover:border-[#38BDF8]/40 cursor-pointer transition-all group"
                  >
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white group-hover:text-[#38BDF8] transition-colors truncate">
                        {product.title}
                      </p>
                      <p className="text-[10px] text-slate-400">{product.category}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-black text-[#38BDF8]">৳{effectivePrice}</span>
                        {product.salePrice > 0 && product.salePrice < product.price && (
                          <span className="text-[10px] text-slate-500 line-through">৳{product.price}</span>
                        )}
                        {(() => {
                          const effSold = (product.baseSoldCount ?? (product.soldCount ?? 0)) + (product.realSalesCount ?? 0);
                          if (effSold > 0) {
                            return (
                              <span className="text-[9px] text-amber-400 font-bold ml-auto">
                                🔥 {effSold} Sold
                              </span>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

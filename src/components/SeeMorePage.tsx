import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Search, ArrowUpDown, Ticket, Copy, Check } from 'lucide-react';
import { ShowcaseSectionKey } from '../types/store';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { PreOrderCard } from './PreOrderCard';
import { BuyMoreCard } from './BuyMoreCard';
import { useToast } from './common/Toast';

export const SeeMorePage: React.FC = () => {
  const {
    activeSeeMoreSection,
    setActiveSeeMoreSection,
    products,
    preOrderProducts,
    buyMoreOffers,
    buyMoreVouchers,
    storeConfig,
    collectVoucher,
  } = useStore();
  const { showToast } = useToast();

  const [localSearch, setLocalSearch] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high'>('default');
  const [copiedVoucherId, setCopiedVoucherId] = useState<string | null>(null);

  useEffect(() => {
    setLocalSearch('');
    setSortBy('default');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeSeeMoreSection]);

  const showPreOrderTab = storeConfig.isPreOrderSectionVisible !== false;
  const showBuyMoreTab = storeConfig.isBuyMoreSectionVisible !== false;

  const visiblePreOrders = useMemo(
    () =>
      preOrderProducts
        .filter(p => p.isVisible !== false)
        .sort((a, b) => (a.position ?? 999) - (b.position ?? 999)),
    [preOrderProducts]
  );

  const visibleOffers = useMemo(
    () =>
      buyMoreOffers
        .filter(o => o.isVisible !== false)
        .sort((a, b) => (a.position ?? 999) - (b.position ?? 999)),
    [buyMoreOffers]
  );

  const visibleVouchers = useMemo(
    () => buyMoreVouchers.filter(v => v.isVisible !== false),
    [buyMoreVouchers]
  );

  const filteredStandardProducts = useMemo(() => {
    const q = localSearch.trim().toLowerCase();
    const list = products.filter(p =>
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q)
    );
    return [...list].sort((a, b) => {
      const pa = a.salePrice > 0 ? a.salePrice : a.price;
      const pb = b.salePrice > 0 ? b.salePrice : b.price;
      if (sortBy === 'price-low') return pa - pb;
      if (sortBy === 'price-high') return pb - pa;
      const oa = a.position ?? a.order ?? 999;
      const ob = b.position ?? b.order ?? 999;
      return oa - ob;
    });
  }, [products, localSearch, sortBy]);

  const filteredPreOrders = useMemo(() => {
    const q = localSearch.trim().toLowerCase();
    const list = visiblePreOrders.filter(p =>
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q)
    );
    return [...list].sort((a, b) => {
      const pa = a.salePrice > 0 ? a.salePrice : a.price;
      const pb = b.salePrice > 0 ? b.salePrice : b.price;
      if (sortBy === 'price-low') return pa - pb;
      if (sortBy === 'price-high') return pb - pa;
      return (a.position ?? 999) - (b.position ?? 999);
    });
  }, [visiblePreOrders, localSearch, sortBy]);

  const filteredBuyMore = useMemo(() => {
    const q = localSearch.trim().toLowerCase();
    const list = visibleOffers.filter(o =>
      !q ||
      o.title.toLowerCase().includes(q) ||
      o.mainProductTitle.toLowerCase().includes(q) ||
      (o.description || '').toLowerCase().includes(q)
    );
    return [...list].sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return (a.position ?? 999) - (b.position ?? 999);
    });
  }, [visibleOffers, localSearch, sortBy]);

  if (!activeSeeMoreSection) return null;

  const sectionMeta: Record<ShowcaseSectionKey, { title: string; subtitle: string; count: number }> = {
    our_products: {
      title: storeConfig.ourProductsSectionTitle || 'Our Products',
      subtitle: 'Full multi-category collection available for immediate delivery across Bangladesh.',
      count: filteredStandardProducts.length,
    },
    pre_order: {
      title: storeConfig.preOrderSectionTitle || 'Upcoming Products (Pre-Order)',
      subtitle: 'Reserve upcoming arrivals ahead of general release.',
      count: filteredPreOrders.length,
    },
    buy_more: {
      title: storeConfig.buyMoreSectionTitle || 'Buy One Get More',
      subtitle: 'Curated combo offers and complimentary bonus gifts.',
      count: filteredBuyMore.length,
    },
  };

  const activeMeta = sectionMeta[activeSeeMoreSection];

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setActiveSeeMoreSection(null)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F8FAFC] border border-slate-300 hover:border-slate-900 text-slate-800 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          {/* Section Switcher */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <button
              type="button"
              onClick={() => setActiveSeeMoreSection('our_products')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeSeeMoreSection === 'our_products'
                  ? 'bg-slate-900 text-white'
                  : 'bg-[#F8FAFC] border border-slate-200 text-slate-700 hover:border-slate-400'
              }`}
            >
              {storeConfig.ourProductsSectionTitle || 'Our Products'}
            </button>
            {showPreOrderTab && (
              <button
                type="button"
                onClick={() => setActiveSeeMoreSection('pre_order')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  activeSeeMoreSection === 'pre_order'
                    ? 'bg-slate-900 text-white'
                    : 'bg-[#F8FAFC] border border-slate-200 text-slate-700 hover:border-slate-400'
                }`}
              >
                {storeConfig.preOrderSectionTitle || 'Upcoming Products'}
              </button>
            )}
            {showBuyMoreTab && (
              <button
                type="button"
                onClick={() => setActiveSeeMoreSection('buy_more')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  activeSeeMoreSection === 'buy_more'
                    ? 'bg-slate-900 text-white'
                    : 'bg-[#F8FAFC] border border-slate-200 text-slate-700 hover:border-slate-400'
                }`}
              >
                {storeConfig.buyMoreSectionTitle || 'Buy One Get More'}
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-['Outfit'] tracking-tight flex items-center gap-2.5">
              <span>{activeMeta.title}</span>
              <span className="text-xs font-bold text-slate-600 tabular-nums">({activeMeta.count} items)</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">{activeMeta.subtitle}</p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search in this section..."
                className="pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-[#F8FAFC] text-xs font-semibold outline-none focus:border-sky-500 w-52 sm:w-64"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-[#F8FAFC] px-3 py-2 rounded-xl border border-slate-200">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
              >
                <option value="default">Default Order</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Active Offer Vouchers strip when viewing Buy One Get More */}
      {activeSeeMoreSection === 'buy_more' && visibleVouchers.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {visibleVouchers.map(v => (
            <div
              key={v.id}
              className="p-3.5 rounded-2xl bg-slate-900 text-white flex items-center justify-between gap-3 border border-slate-800"
            >
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold">
                  <Ticket className="w-3.5 h-3.5 shrink-0" />
                  <span className="font-mono">{v.code}</span>
                </div>
                <p className="text-xs font-bold truncate">{v.title}</p>
                <p className="text-[11px] text-slate-300 truncate">{v.freeProductNote}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(v.code);
                  collectVoucher(v.code);
                  setCopiedVoucherId(v.id);
                  showToast(`Offer voucher ${v.code} copied!`, 'success');
                  setTimeout(() => setCopiedVoucherId(null), 2000);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#F8FAFC] text-slate-900 text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0 whitespace-nowrap"
              >
                {copiedVoucherId === v.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedVoucherId === v.id ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Full Responsive Catalog Grid synced with Admin Column Settings */}
      {(() => {
        const layoutKey =
          activeSeeMoreSection === 'our_products'
            ? 'ourProducts'
            : activeSeeMoreSection === 'pre_order'
            ? 'preOrder'
            : 'buyMore';
        const desktopCols = storeConfig.sectionLayouts?.[layoutKey]?.desktopColumns ?? 4;
        const desktopGridClass: Record<number, string> = {
          2: 'grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2',
          3: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3',
          4: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4',
          5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
          6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6',
        };
        const gridClass = `grid ${desktopGridClass[desktopCols] || desktopGridClass[4]} gap-3 sm:gap-4`;

        if (activeSeeMoreSection === 'our_products') {
          return filteredStandardProducts.length === 0 ? (
            <div className="py-16 text-center bg-[#F8FAFC] rounded-2xl border border-slate-200 text-sm text-slate-500">
              No products matched your search.
            </div>
          ) : (
            <div className={gridClass}>
              {filteredStandardProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          );
        }

        if (activeSeeMoreSection === 'pre_order') {
          return filteredPreOrders.length === 0 ? (
            <div className="py-16 text-center bg-[#F8FAFC] rounded-2xl border border-slate-200 text-sm text-slate-500">
              No upcoming pre-order products available right now.
            </div>
          ) : (
            <div className={gridClass}>
              {filteredPreOrders.map(item => (
                <PreOrderCard key={item.id} item={item} />
              ))}
            </div>
          );
        }

        return filteredBuyMore.length === 0 ? (
          <div className="py-16 text-center bg-[#F8FAFC] rounded-2xl border border-slate-200 text-sm text-slate-500">
            No Buy One Get More deals available right now.
          </div>
        ) : (
          <div className={gridClass}>
            {filteredBuyMore.map(offer => (
              <BuyMoreCard key={offer.id} offer={offer} />
            ))}
          </div>
        );
      })()}
    </main>
  );
};

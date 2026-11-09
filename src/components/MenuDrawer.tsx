import React, { useState } from 'react';
import { 
  X, 
  Info, 
  ShieldCheck, 
  FileText, 
  Phone, 
  Truck, 
  Store, 
  ChevronRight,
  ChevronDown,
  Sparkles,
  Package,
  Layers,
  ArrowRight,
  Clock
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { StoreLogo } from './common/StoreLogo';
import { StaticPage } from '../types/store';
import { getWorkingHoursStatus } from '../utils/workingHours';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenVouchers?: () => void;
  onOpenPolicy?: (type: 'privacy' | 'terms' | 'refund' | 'contact' | 'delivery' | 'about') => void;
  onOpenTrackOrder?: () => void;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({
  isOpen,
  onClose,
  onOpenTrackOrder
}) => {
  const { 
    storeConfig, 
    staticPages, 
    setSelectedStaticPage,
    categories,
    setActiveCategory
  } = useStore();

  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  if (!isOpen) return null;

  // Helper to pick an appropriate Lucide icon and professional subtitle for each static page
  const getPageIconAndSubtitle = (page: StaticPage) => {
    const slug = (page.slug || '').toLowerCase();
    const title = (page.title || '').toLowerCase();

    if (slug.includes('about-store') || title.includes('about our store') || slug.includes('about-our-store')) {
      return { icon: Store, subtitle: 'Quality, Vision & Craftsmanship' };
    }
    if (slug.includes('about') || title.includes('about us')) {
      return { icon: Info, subtitle: 'Our Mission & Story' };
    }
    if (slug.includes('privacy') || title.includes('privacy')) {
      return { icon: ShieldCheck, subtitle: 'Security & Customer Privacy' };
    }
    if (slug.includes('terms') || title.includes('terms')) {
      return { icon: FileText, subtitle: 'Service Terms & Guidelines' };
    }
    if (slug.includes('shipping') || slug.includes('delivery') || title.includes('shipping')) {
      return { icon: Truck, subtitle: 'Fast Nationwide Delivery Rates' };
    }
    if (slug.includes('contact') || title.includes('contact')) {
      return { icon: Phone, subtitle: 'Direct Helpline & WhatsApp' };
    }
    return { icon: Sparkles, subtitle: 'Store Information & Guidelines' };
  };

  // Filter active pages sorted by order and robustly deduplicate by normalized title & slug keywords
  const activePages = Array.from(
    new Map(
      staticPages
        .filter(p => p.active !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(p => {
          const normTitle = (p.title || '').toLowerCase().trim();
          // Normalize terms variations into a single canonical key
          const key = (normTitle.includes('term') || (p.slug || '').toLowerCase().includes('term'))
            ? 'terms-of-service'
            : normTitle.replace(/[^a-z0-9]/g, '');
          return [key, p];
        })
    ).values()
  );

  const handlePageClick = (page: StaticPage) => {
    setSelectedStaticPage(page);
  };

  const handleCategorySelect = (categoryName: string) => {
    setActiveCategory(categoryName);
    onClose();
    const el = document.getElementById('products');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm flex animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm sm:max-w-md bg-[#0F172A] border-r border-slate-800 text-white h-full flex flex-col justify-between shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 bg-[#1E293B] border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#38BDF8] via-[#6366F1] to-[#F59E0B] p-0.5 shadow-md shrink-0">
              <div 
                className="w-full h-full rounded-full flex items-center justify-center p-0.5 overflow-hidden shadow-inner"
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
            <div>
              <h3 className="font-extrabold text-base tracking-tight font-['Outfit'] text-white">
                {storeConfig.storeName || 'RycreoShop'}
              </h3>
              <p className="text-[10px] text-[#38BDF8] font-bold">Store Menu & Navigation</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            aria-label="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* 1. Track My Order Top Action */}
          <button
            onClick={() => {
              if (onOpenTrackOrder) {
                onOpenTrackOrder();
              }
              onClose();
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-sky-500/15 via-indigo-500/15 to-purple-500/15 hover:from-sky-500/25 hover:to-purple-500/25 border border-sky-500/30 text-white transition-all cursor-pointer shadow-md group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-[#38BDF8] flex items-center justify-center border border-sky-500/40 group-hover:scale-105 transition-transform">
                <Package className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="block text-white text-xs font-black tracking-wide">
                  Track My Order
                </span>
                <span className="block text-[10px] text-sky-300 font-medium">
                  Check live order status, edit details or cancel
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-sky-400 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* 2. Categories Collapsible Accordion (Hidden by default, expands on click) */}
          <div className="border border-slate-800 rounded-2xl bg-[#1E293B]/70 overflow-hidden shadow-xs">
            <button
              onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
              className="w-full flex items-center justify-between p-3.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-[#38BDF8]">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="block text-white text-xs font-extrabold tracking-wide">
                    Categories
                  </span>
                  <span className="block text-[10px] text-slate-400 font-medium">
                    {isCategoriesOpen ? 'Click to collapse category list' : 'Click to explore all product categories'}
                  </span>
                </div>
              </div>

              <ChevronDown 
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  isCategoriesOpen ? 'rotate-180 text-[#38BDF8]' : ''
                }`} 
              />
            </button>

            {/* Expanded Categories List */}
            {isCategoriesOpen && (
              <div className="px-3 pb-3 pt-1 space-y-1 border-t border-slate-800/80 animate-fade-in bg-slate-900/50">
                <button
                  onClick={() => handleCategorySelect('All')}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-between"
                >
                  <span>All Categories</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.name)}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-between"
                  >
                    <span>{cat.name}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. Static Policies & Information */}
          <div className="space-y-2 pt-1">
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-1">
              Store Policies & Information
            </p>

            {activePages.map((page) => {
              const { icon: Icon, subtitle } = getPageIconAndSubtitle(page);

              return (
                <button
                  key={page.id}
                  onClick={() => handlePageClick(page)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold bg-[#1E293B] hover:bg-slate-800 text-white transition-all cursor-pointer border border-slate-700/60 shadow-xs hover:border-[#38BDF8]/60 group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-[#38BDF8] group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="block text-white text-xs font-extrabold tracking-wide">
                        {page.title}
                      </span>
                      <span className="block text-[10px] text-slate-400 font-medium">
                        {subtitle}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#38BDF8] group-hover:translate-x-0.5 transition-all" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-[#1E293B] border-t border-slate-800 flex items-center justify-between shrink-0 text-xs">
          <div>
            <p className="text-[11px] font-bold text-slate-300">
              {storeConfig.storeName || 'RycreoShop'}
            </p>
            {(() => {
              const whStatus = getWorkingHoursStatus(storeConfig.workingHours);
              return (
                <p className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-3 h-3" />
                  <span className={whStatus.isOpen ? 'text-emerald-400' : 'text-rose-400'}>
                    {whStatus.badgeText}
                  </span>
                </p>
              );
            })()}
          </div>
          <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Verified Secure
          </span>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { 
  Sparkles, 
  Phone, 
  Mail, 
  MapPin, 
  ExternalLink, 
  ShieldCheck, 
  MessageSquare,
  Facebook,
  Youtube,
  Instagram,
  Music2,
  Clock
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { StoreLogo } from './common/StoreLogo';
import { getWorkingHoursStatus, getWorkingHoursText } from '../utils/workingHours';

export const Footer: React.FC = () => {
  const { 
    storeConfig, 
    setActiveCategory, 
    setIsAdminModalOpen, 
    isAdminLoggedIn,
    setIsAdminViewingStore,
    setActivePolicyModal,
    setIsSearchPageOpen,
    modificationWindowHours
  } = useStore();

  const handleCategoryClick = (catName: string) => {
    setIsSearchPageOpen(false);
    setActiveCategory(catName);
  };

  const handlePolicyClick = (policyName: 'privacy' | 'terms' | 'refund' | 'contact' | 'delivery' | 'about') => {
    setIsSearchPageOpen(false);
    setActivePolicyModal(policyName);
  };

  const workingHoursStatus = getWorkingHoursStatus(storeConfig.workingHours);
  const workingHoursText = getWorkingHoursText(storeConfig.workingHours);

  return (
    <footer className="bg-[#0F172A] text-slate-300 border-t border-slate-800 pt-12 pb-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Col 1: Brand Story */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#38BDF8] via-[#6366F1] to-[#F59E0B] p-0.5 shadow-lg shrink-0">
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
              <span className="font-extrabold text-xl tracking-tight text-white font-['Outfit']">
                {storeConfig.storeName}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Bangladesh&apos;s trusted multi-category online shopping destination for premium smart gadgets, modern apparel, fine jewelry, lifestyle accessories, and daily essentials delivered nationwide.
            </p>

            {/* Operating Hours Display */}
            <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl text-xs flex items-center gap-2.5 text-slate-300">
              <Clock className="w-4 h-4 text-[#38BDF8] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-[11px]">Working Hours</p>
                <p className="text-[10px] text-slate-400 truncate">{workingHoursText}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                workingHoursStatus.isOpen 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}>
                {workingHoursStatus.badgeText}
              </span>
            </div>

            <div className="pt-1 flex items-center gap-3">
              {storeConfig.socialLinks?.facebook && (
                <a href={storeConfig.socialLinks.facebook} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-[#38BDF8] hover:bg-slate-700 transition-all hover:scale-110" title="Facebook">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {storeConfig.socialLinks?.instagram && (
                <a href={storeConfig.socialLinks.instagram} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-pink-400 hover:bg-slate-700 transition-all hover:scale-110" title="Instagram">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {storeConfig.socialLinks?.youtube && (
                <a href={storeConfig.socialLinks.youtube} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-500 hover:bg-slate-700 transition-all hover:scale-110" title="YouTube">
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {storeConfig.socialLinks?.tiktok && (
                <a href={storeConfig.socialLinks.tiktok} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all hover:scale-110" title="TikTok">
                  <Music2 className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold uppercase text-white tracking-wider font-['Outfit']">
              Store Collections
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => handleCategoryClick('Festival Special')} className="hover:text-[#F59E0B] transition-colors flex items-center gap-1 cursor-pointer">
                  <Sparkles className="w-3 h-3 text-[#F59E0B]" /> Puja Festival Special
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick('Pants')} className="hover:text-[#38BDF8] transition-colors cursor-pointer">
                  Chino Pants & Cargo Denim
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick('Drop-Shoulder')} className="hover:text-[#38BDF8] transition-colors cursor-pointer">
                  Oversized Drop-Shoulder Tees
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick('Polo T-Shirts')} className="hover:text-[#38BDF8] transition-colors cursor-pointer">
                  Luxe Pique Polo Shirts
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick('Sweaters & Hoodies')} className="hover:text-[#38BDF8] transition-colors cursor-pointer">
                  Winter Hoodies & Sweaters
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Policies & Trust */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold uppercase text-white tracking-wider font-['Outfit']">
              Policies & Support
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => handlePolicyClick('refund')} className="hover:text-[#38BDF8] transition-colors flex items-center gap-1.5 cursor-pointer text-left">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Order Policy ({modificationWindowHours || Number(storeConfig?.orderLockDurationHours) || 24}h Window)</span>
                </button>
              </li>
              <li>
                <button onClick={() => handlePolicyClick('refund')} className="hover:text-[#38BDF8] transition-colors cursor-pointer text-left">
                  7-Day Size & Item Exchange
                </button>
              </li>
              <li>
                <button onClick={() => handlePolicyClick('delivery')} className="hover:text-[#38BDF8] transition-colors cursor-pointer text-left">
                  Delivery & Inspection Rules
                </button>
              </li>
              <li>
                <button onClick={() => handlePolicyClick('privacy')} className="hover:text-[#38BDF8] transition-colors cursor-pointer text-left">
                  Privacy & Data Protection
                </button>
              </li>
              <li>
                <button onClick={() => handlePolicyClick('terms')} className="hover:text-[#38BDF8] transition-colors cursor-pointer text-left">
                  Terms of Purchase
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Hotline */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold uppercase text-white tracking-wider font-['Outfit']">
              Direct Contact
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#38BDF8]" />
                <a href={`tel:${storeConfig.contactPhone}`} className="hover:text-[#38BDF8] transition-colors">{storeConfig.contactPhone}</a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#38BDF8]" />
                <a href={`mailto:${storeConfig.contactEmail}`} className="hover:text-[#38BDF8] transition-colors">{storeConfig.contactEmail}</a>
              </p>
              <p className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <a 
                  href={`https://wa.me/${storeConfig.whatsappNumber}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-emerald-400 font-extrabold hover:underline transition-colors"
                >
                  WhatsApp: Chat Online
                </a>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#38BDF8]" />
                <span>Banani, Dhaka, Bangladesh</span>
              </p>
            </div>

            {/* Payment Badges */}
            <div className="pt-2 flex items-center gap-2">
              <span className="px-2 py-1 bg-slate-800 rounded text-[10px] font-bold text-slate-400">bKash</span>
              <span className="px-2 py-1 bg-slate-800 rounded text-[10px] font-bold text-slate-400">Nagad</span>
              <span className="px-2 py-1 bg-slate-800 rounded text-[10px] font-bold text-slate-400">COD</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Developer Credits */}
        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            {storeConfig.copyrightText ? (
              <p className="text-slate-400">{storeConfig.copyrightText}</p>
            ) : (
              <p>© {new Date().getFullYear()} <strong className="text-white">{storeConfig.storeName}</strong>. All rights reserved.</p>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Developer & Founder Attribution */}
            {storeConfig.isCreditsActive !== false && (
              <div className="flex flex-wrap items-center gap-2 text-slate-400">
                <span>Founder: <strong className="text-slate-200">{storeConfig.ownerName || "Raiyan"}</strong></span>
                {storeConfig.isCoFounderActive && storeConfig.coFounderName && (
                  <>
                    <span>•</span>
                    <span>{storeConfig.coFounderTitle || "Co-Founder"}: <strong className="text-slate-200">{storeConfig.coFounderName}</strong></span>
                  </>
                )}
                <span>•</span>
                <a 
                  href={storeConfig.creditsLink || "https://rycreoshop.com"} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[#38BDF8] font-bold hover:underline inline-flex items-center gap-1"
                >
                  <span>{storeConfig.creditsText || "Developed by RycreoShop Solutions"}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </div>
        
        {/* Tiny Stealth Dot Trigger */}
        <div className="absolute bottom-2 right-2 z-10 select-none">
          <button
            type="button"
            onClick={() => {
              if (isAdminLoggedIn) {
                setIsAdminViewingStore(false);
              } else {
                setIsAdminModalOpen(true);
              }
            }}
            className="w-2 h-2 rounded-full bg-slate-800 hover:bg-slate-600 transition-all cursor-pointer opacity-30 hover:opacity-100 block"
            title="•"
            aria-label="•"
          />
        </div>
      </div>
    </footer>
  );
};

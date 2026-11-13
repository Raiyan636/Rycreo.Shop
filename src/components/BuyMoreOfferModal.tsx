import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Gift,
  ShoppingBag,
  Copy,
  Check,
  Minus,
  Plus,
  Ticket,
  Play,
  Truck,
  MessageSquare,
  Zap,
  Clock,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductColorVariant } from '../types/store';
import { resolveStoreAssetUrl } from '../utils/clientAssetResolver';
import { getOfferCountdown } from '../utils/stockHelper';
import { Footer } from './Footer';
import { BuyMoreCard } from './BuyMoreCard';
import { ProductCard } from './ProductCard';
import { sortRelatedItems } from '../utils/relatedProducts';
import { useToast } from './common/Toast';

const FALLBACK_BUYMORE_IMG =
  'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=800';

const isPlaceholderSize = (sz?: string): boolean => {
  const s = (sz || '').trim().toLowerCase();
  return !s || s === 'standard' || s === 'standard / free size' || s === 'default';
};

export const BuyMoreOfferModal: React.FC = () => {
  const {
    selectedBuyMoreOffer,
    setSelectedBuyMoreOffer,
    buyMoreOffers,
    products,
    addBuyMoreOfferToCart,
    buyMoreOfferToCartItem,
    setDirectCheckoutItem,
    setDirectCheckoutItems,
    setIsCheckoutOpen,
    setIsCartOpen,
    collectVoucher,
    storeConfig,
  } = useStore();
  const { showToast } = useToast();

  const [quantity, setQuantity] = useState(1);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [nowMs, setNowMs] = useState(() => Date.now());
  const touchStartX = useRef<number | null>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedBuyMoreOffer?.expiresAt) return;
    const t = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(t);
  }, [selectedBuyMoreOffer?.expiresAt]);

  const countdown = useMemo(
    () => (selectedBuyMoreOffer ? getOfferCountdown(selectedBuyMoreOffer, nowMs) : null),
    [selectedBuyMoreOffer, nowMs]
  );

  const normalizedColors: ProductColorVariant[] = useMemo(() => {
    if (!selectedBuyMoreOffer?.colors) return [];
    return selectedBuyMoreOffer.colors
      .map((raw) => {
        const c = raw as unknown;
        if (typeof c === 'string') {
          return { name: c.trim(), hex: '#1E293B', enabled: true, stock: 99 };
        }
        const obj = (c || {}) as ProductColorVariant;
        return { ...obj, name: (obj.name || '').trim() };
      })
      .filter((c) => Boolean(c.name) && c.enabled !== false);
  }, [selectedBuyMoreOffer?.colors]);

  const normalizedSizes = useMemo(() => {
    if (!selectedBuyMoreOffer?.sizes) return [];
    return selectedBuyMoreOffer.sizes
      .map((raw) => {
        const s = raw as unknown;
        return typeof s === 'string'
          ? s.trim()
          : ((s as { size?: string } | null)?.size || '').trim();
      })
      .filter((sz) => !isPlaceholderSize(sz));
  }, [selectedBuyMoreOffer?.sizes]);

  const modalImages = useMemo(() => {
    if (!selectedBuyMoreOffer) return [];
    const list: string[] = [];
    const addUnique = (raw?: string) => {
      if (!raw) return;
      const resolved = resolveStoreAssetUrl(raw);
      if (resolved && !list.includes(resolved)) list.push(resolved);
    };
    addUnique(selectedBuyMoreOffer.mainProductImage);
    (selectedBuyMoreOffer.images || []).forEach(addUnique);
    normalizedColors.forEach((c) => {
      addUnique(c.image);
      (c.gallery || []).forEach(addUnique);
    });
    return list.length > 0 ? list : [FALLBACK_BUYMORE_IMG];
  }, [
    selectedBuyMoreOffer?.mainProductImage,
    selectedBuyMoreOffer?.images,
    normalizedColors,
  ]);

  useEffect(() => {
    if (!selectedBuyMoreOffer) return;
    if (modalContainerRef.current) {
      modalContainerRef.current.scrollTop = 0;
      requestAnimationFrame(() => {
        if (modalContainerRef.current) {
          modalContainerRef.current.scrollTop = 0;
        }
      });
    }
    setQuantity(1);
    setCopiedCode(false);
    setActiveMediaIndex(0);
    setShowVideoModal(false);
    setSelectedColor(normalizedColors[0]?.name || '');
    setSelectedSize(normalizedSizes[0] || '');
  }, [selectedBuyMoreOffer?.id]);

  // Switch preview image automatically whenever selectedColor updates
  useEffect(() => {
    if (!selectedColor || modalImages.length === 0) return;
    const foundCol = normalizedColors.find(
      (c) => c.name.toLowerCase() === selectedColor.toLowerCase()
    );
    const targetImg = foundCol?.image || foundCol?.gallery?.[0];
    if (targetImg) {
      const resolved = resolveStoreAssetUrl(targetImg);
      const idx = modalImages.findIndex((img) => img === resolved);
      if (idx !== -1) {
        setActiveMediaIndex(idx);
        setShowVideoModal(false);
      }
    }
  }, [selectedColor, normalizedColors, modalImages]);

  const relatedOffers = useMemo(() => {
    if (!selectedBuyMoreOffer) return [];
    const others = buyMoreOffers.filter(
      (o) => o.isVisible !== false && o.id !== selectedBuyMoreOffer.id
    );
    return sortRelatedItems(selectedBuyMoreOffer, others).slice(0, 5);
  }, [buyMoreOffers, selectedBuyMoreOffer]);

  const relatedRegularProducts = useMemo(() => {
    if (!selectedBuyMoreOffer) return [];
    const needed = Math.max(5, 10 - relatedOffers.length);
    return sortRelatedItems(selectedBuyMoreOffer, products).slice(0, needed);
  }, [products, selectedBuyMoreOffer, relatedOffers.length]);

  if (!selectedBuyMoreOffer) return null;

  const unitPrice = Number(selectedBuyMoreOffer.price) || 0;
  const regularValue = Number(selectedBuyMoreOffer.regularValue) || 0;
  const buyQty = Math.max(1, Number(selectedBuyMoreOffer.buyQuantity) || 1);
  const savings = regularValue > unitPrice ? (regularValue - unitPrice) * quantity : 0;

  const activeColorChoice = normalizedColors.length > 0 ? selectedColor || undefined : undefined;
  const activeSizeChoice = normalizedSizes.length > 0 ? selectedSize || undefined : undefined;

  const handleCopyVoucher = () => {
    if (!selectedBuyMoreOffer.voucherCode) return;
    navigator.clipboard.writeText(selectedBuyMoreOffer.voucherCode);
    collectVoucher(selectedBuyMoreOffer.voucherCode);
    setCopiedCode(true);
    showToast(
      `Voucher ${selectedBuyMoreOffer.voucherCode} copied & collected!`,
      'success'
    );
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleAdd = () => {
    if (countdown?.isExpired) {
      showToast('This limited-time offer has expired!', 'error');
      return;
    }
    addBuyMoreOfferToCart(
      selectedBuyMoreOffer,
      quantity,
      activeSizeChoice,
      activeColorChoice
    );
    showToast(`Added ${quantity}x combo deal to your cart!`, 'success');
  };

  const handleOrderNow = () => {
    if (countdown?.isExpired) {
      showToast('This limited-time offer has expired!', 'error');
      return;
    }
    const item = buyMoreOfferToCartItem(
      selectedBuyMoreOffer,
      quantity,
      activeSizeChoice,
      activeColorChoice
    );
    setDirectCheckoutItem(item);
    setDirectCheckoutItems([item]);
    setIsCartOpen(false);
    setSelectedBuyMoreOffer(null);
    setIsCheckoutOpen(true);
  };

  const handleWhatsAppOrder = () => {
    const freeSummary = (selectedBuyMoreOffer.freeItems || [])
      .map((f) => `${(Number(f.quantity) || 1) * quantity}x ${f.title}`)
      .join(', ');
    const variantStr = [activeColorChoice, activeSizeChoice].filter(Boolean).join(' / ');
    const msg = encodeURIComponent(
      `Hi ${storeConfig.storeName || 'RycreoShop'}! I want to order this Buy One Get More deal:\n\n*Deal:* ${
        selectedBuyMoreOffer.title
      }\n*Main Product:* ${buyQty * quantity}x ${
        selectedBuyMoreOffer.mainProductTitle
      }${variantStr ? ` (${variantStr})` : ''}\n*Free Items:* ${
        freeSummary || 'Included'
      }\n*Total Price:* ৳${(unitPrice * quantity).toLocaleString()}\n\nPlease confirm!`
    );
    window.open(`https://wa.me/${storeConfig.whatsappNumber}?text=${msg}`, '_blank');
  };

  const isMp4Video =
    selectedBuyMoreOffer.videoUrl &&
    /\.(mp4|webm|ogg)(\?.*)?$/i.test(selectedBuyMoreOffer.videoUrl);

  return (
    <div
      ref={modalContainerRef}
      className="fixed inset-0 z-[90] bg-[#ECF1F6] overflow-y-auto overscroll-contain"
    >
      <div className="min-h-screen w-full bg-[#ECF1F6] text-[#1E293B] flex flex-col relative">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-5 py-3 bg-[#F8FAFC]/95 backdrop-blur-md border-b border-slate-200/80 shrink-0 shadow-2xs select-none">
        <button
          type="button"
          onClick={() => setSelectedBuyMoreOffer(null)}
          className="flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[#F8FAFC] hover:bg-slate-900 hover:text-white border border-slate-200 text-xs font-extrabold text-slate-800 transition-all cursor-pointer shadow-2xs active:scale-95"
        >
          <span>← Back to Store</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-[#38BDF8] to-[#6366F1] text-white font-bold text-xs shadow-md cursor-pointer active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Cart</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedBuyMoreOffer(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 transition-all cursor-pointer text-xs font-bold active:scale-95"
          >
            <X className="w-4 h-4" />
            <span>Close</span>
          </button>
        </div>
      </div>

      {/* 12-Col Detail Split */}
      <div className="bg-[#F8FAFC] sm:rounded-3xl sm:border border-slate-200/80 p-0 sm:p-8 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-0 md:gap-8 lg:gap-10 shrink-0">
        {/* Left 7 Cols: Multi-Image & Video Gallery */}
        <div className="md:col-span-7 flex flex-col md:flex-row gap-0 md:gap-4">
          <div className="hidden md:flex flex-col gap-2.5 shrink-0 w-16 overflow-y-auto max-h-[520px] scrollbar-none">
            {modalImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setShowVideoModal(false);
                  setActiveMediaIndex(idx);
                }}
                className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 aspect-square cursor-pointer ${
                  !showVideoModal && activeMediaIndex === idx
                    ? 'border-indigo-500 ring-2 ring-indigo-400/40 shadow-sm'
                    : 'border-slate-200 opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={img}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain p-0.5 bg-slate-50"
                />
              </button>
            ))}

            {selectedBuyMoreOffer.videoUrl && (
              <button
                type="button"
                onClick={() => setShowVideoModal(true)}
                className={`w-16 h-16 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center gap-1 border-2 transition-all shrink-0 aspect-square cursor-pointer ${
                  showVideoModal
                    ? 'border-indigo-500 ring-2 ring-indigo-400/40 shadow-sm'
                    : 'border-slate-700 opacity-80 hover:opacity-100'
                }`}
              >
                <Play className="w-5 h-5 text-sky-400 fill-sky-400" />
                <span className="text-[9px] font-bold uppercase">Video</span>
              </button>
            )}
          </div>

          <div className="flex-1 w-full">
            <div
              className="relative aspect-square w-full sm:rounded-2xl bg-slate-900/5 overflow-hidden sm:border border-slate-100 group select-none"
              onTouchStart={(e) => {
                touchStartX.current = e.touches[0].clientX;
              }}
              onTouchEnd={(e) => {
                if (touchStartX.current === null) return;
                const deltaX = e.changedTouches[0].clientX - touchStartX.current;
                touchStartX.current = null;
                if (deltaX > 40 && modalImages.length > 1) {
                  setActiveMediaIndex(
                    (prev) => (prev - 1 + modalImages.length) % modalImages.length
                  );
                } else if (deltaX < -40 && modalImages.length > 1) {
                  setActiveMediaIndex((prev) => (prev + 1) % modalImages.length);
                }
              }}
            >
              {showVideoModal && selectedBuyMoreOffer.videoUrl ? (
                <div className="w-full h-full bg-black flex items-center justify-center relative">
                  {isMp4Video ? (
                    <video
                      src={selectedBuyMoreOffer.videoUrl}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <iframe
                      src={selectedBuyMoreOffer.videoUrl}
                      title={selectedBuyMoreOffer.title}
                      className="w-full h-full"
                      allow="autoplay; encrypted-media"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => setShowVideoModal(false)}
                    className="absolute top-3 left-3 bg-slate-900/80 hover:bg-slate-900 text-white px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-md z-20 cursor-pointer"
                  >
                    ← Back to Photos
                  </button>
                </div>
              ) : (
                <>
                  <img
                    key={modalImages[activeMediaIndex] || 'bm-modal-img'}
                    src={modalImages[activeMediaIndex] || modalImages[0]}
                    alt={selectedBuyMoreOffer.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain p-2 bg-slate-50/60 transition-all duration-300"
                  />

                  {modalImages.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveMediaIndex(
                            (prev) =>
                              (prev - 1 + modalImages.length) % modalImages.length
                          )
                        }
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center shadow-md cursor-pointer z-10 text-base font-bold"
                        aria-label="Previous Image"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveMediaIndex((prev) => (prev + 1) % modalImages.length)
                        }
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center shadow-md cursor-pointer z-10 text-base font-bold"
                        aria-label="Next Image"
                      >
                        ›
                      </button>
                      <div className="absolute bottom-3 right-3 bg-black/65 text-white text-[11px] font-bold px-2.5 py-1 rounded-full pointer-events-none z-10">
                        {activeMediaIndex + 1} / {modalImages.length}
                      </div>
                    </>
                  )}
                </>
              )}

              <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-indigo-600 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-lg z-10 pointer-events-none">
                {selectedBuyMoreOffer.badgeText || 'Buy One Get More'}
              </span>
            </div>

            <div className="flex items-center gap-2.5 overflow-x-auto px-4 sm:px-0 py-3 scrollbar-none">
              {modalImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setShowVideoModal(false);
                    setActiveMediaIndex(idx);
                  }}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 aspect-square cursor-pointer ${
                    !showVideoModal && activeMediaIndex === idx
                      ? 'border-indigo-500 ring-2 ring-indigo-400/40 shadow-sm'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}

              {selectedBuyMoreOffer.videoUrl && (
                <button
                  type="button"
                  onClick={() => setShowVideoModal(true)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center gap-0.5 border-2 transition-all shrink-0 aspect-square cursor-pointer ${
                    showVideoModal
                      ? 'border-indigo-500 ring-2 ring-indigo-400/40 shadow-sm'
                      : 'border-slate-700 opacity-80 hover:opacity-100'
                  }`}
                >
                  <Play className="w-4 h-4 text-sky-400 fill-sky-400" />
                  <span className="text-[8px] font-bold uppercase">Video</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Offer Details, Free Items, Optional Variants & Actions */}
        <div className="md:col-span-5 flex flex-col justify-between space-y-5 px-4 py-4 sm:px-0 sm:py-0">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold uppercase tracking-wider">
                {selectedBuyMoreOffer.offerType === 'bogo'
                  ? 'Buy 1 Get 1 Offer'
                  : selectedBuyMoreOffer.offerType === 'buy_more_get_more'
                    ? 'Buy More Get More'
                    : 'Free Gift Bundle'}
              </span>
              {selectedBuyMoreOffer.productCode && (
                <span className="text-xs text-slate-500 font-mono font-bold">
                  Code: {selectedBuyMoreOffer.productCode}
                </span>
              )}
            </div>

            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 leading-tight font-['Outfit']">
                {selectedBuyMoreOffer.title}
              </h1>
              <p className="text-xs font-bold text-slate-600 mt-1">
                Qualifying Purchase: {buyQty * quantity}×{' '}
                <span className="text-slate-900">{selectedBuyMoreOffer.mainProductTitle}</span>
              </p>
            </div>

            {countdown?.hasTimer && (
              <div
                className={`px-3.5 py-2.5 rounded-xl border text-xs font-black flex items-center justify-between gap-2 ${
                  countdown.isExpired
                    ? 'bg-rose-50 border-rose-300 text-rose-800'
                    : 'bg-amber-50 border-amber-300 text-amber-950'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Clock className={`w-4 h-4 shrink-0 ${countdown.isExpired ? 'text-rose-600' : 'text-amber-600'}`} />
                  <span>{countdown.isExpired ? 'Offer Expired — Deal Ended' : 'Limited-Time Offer Ends In:'}</span>
                </span>
                {!countdown.isExpired && (
                  <span className="px-2 py-0.5 rounded-lg bg-slate-900 text-amber-300 font-mono text-xs tracking-wider">
                    {countdown.label.replace('Ends in ', '')}
                  </span>
                )}
              </div>
            )}

            {/* Price & Savings */}
            <div className="flex items-center flex-wrap gap-3">
              {selectedBuyMoreOffer.isFreeShipping && (
                <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-300 text-xs font-black text-emerald-700">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>Free Delivery</span>
                </div>
              )}
              <span className="text-3xl font-black text-[#1E293B] tabular-nums">
                ৳{(unitPrice * quantity).toLocaleString()}
              </span>
              {regularValue > unitPrice && (
                <span className="text-base text-slate-400 line-through font-semibold tabular-nums">
                  ৳{(regularValue * quantity).toLocaleString()}
                </span>
              )}
              {savings > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-xs font-black tabular-nums">
                  Save ৳{savings.toLocaleString()}
                </span>
              )}
            </div>

            {/* Free Gift Breakdown */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-900">
                <Gift className="w-4 h-4 text-emerald-600" />
                <span>Included Free Bonus Item(s)</span>
              </div>
              <div className="space-y-2">
                {(selectedBuyMoreOffer.freeItems || []).map((fi) => (
                  <div
                    key={fi.id}
                    className="flex items-center justify-between gap-3 bg-white rounded-xl p-2 border border-emerald-100"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {fi.image && (
                        <img
                          src={resolveStoreAssetUrl(fi.image)}
                          alt={fi.title}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {(Number(fi.quantity) || 1) * quantity}× {fi.title}
                        </p>
                        {Number(fi.value) > 0 && (
                          <p className="text-[10px] text-slate-500 tabular-nums">
                            Worth ৳{(Number(fi.value) * quantity).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold uppercase shrink-0">
                      FREE
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Voucher Card */}
            {selectedBuyMoreOffer.voucherCode && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Ticket className="w-4 h-4 text-amber-600 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] font-semibold text-amber-800 block">
                      Offer Voucher Code
                    </span>
                    <span className="font-mono font-black text-xs text-slate-900">
                      {selectedBuyMoreOffer.voucherCode}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyVoucher}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode ? 'Copied' : 'Collect Voucher'}</span>
                </button>
              </div>
            )}

            {/* Optional Color Picker (shown ONLY if offer defines colors) */}
            {normalizedColors.length > 0 && (
              <div className="space-y-2 pt-1">
                <label className="text-xs font-black text-slate-800 uppercase tracking-wide block">
                  Select Color: <span className="text-indigo-600">{selectedColor}</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {normalizedColors.map((c, idx) => {
                    const isSelected = selectedColor.toLowerCase() === c.name.toLowerCase();
                    return (
                      <button
                        key={`${c.name}-${idx}`}
                        type="button"
                        onClick={() => {
                          setSelectedColor(c.name);
                          const targetImg = c.image || c.gallery?.[0];
                          if (targetImg) {
                            const resolved = resolveStoreAssetUrl(targetImg);
                            const imgIdx = modalImages.findIndex((i) => i === resolved);
                            if (imgIdx !== -1) {
                              setActiveMediaIndex(imgIdx);
                              setShowVideoModal(false);
                            }
                          }
                        }}
                        className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-indigo-400 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        <div className="relative shrink-0">
                          {c.image ? (
                            <img
                              src={resolveStoreAssetUrl(c.image)}
                              alt={c.name}
                              referrerPolicy="no-referrer"
                              className="w-8 h-8 rounded-lg object-cover border border-slate-200 bg-white"
                            />
                          ) : (
                            <div
                              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center"
                              style={{ backgroundColor: c.hex || '#1E293B' }}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                            </div>
                          )}
                          <span
                            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
                            style={{ backgroundColor: c.hex || '#1E293B' }}
                          />
                        </div>
                        <span className="font-bold text-xs truncate">{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Optional Size Picker (shown ONLY if offer defines sizes) */}
            {normalizedSizes.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-800 uppercase tracking-wide block">
                  Select Size: <span className="text-indigo-600">{selectedSize}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {normalizedSizes.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        selectedSize === sz
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Stepper */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <span className="text-xs font-black uppercase text-slate-700">Deal Quantity</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg border border-slate-300 bg-white flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-black tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-8 rounded-lg border border-slate-300 bg-white flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={Boolean(countdown?.isExpired)}
                onClick={handleOrderNow}
                className={`w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all uppercase tracking-wider whitespace-nowrap ${
                  countdown?.isExpired
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-white hover:scale-[1.01] active:scale-[0.98] cursor-pointer'
                }`}
              >
                <Zap className="w-4 h-4 text-amber-200 fill-amber-200" />
                <span>
                  {countdown?.isExpired
                    ? 'OFFER EXPIRED'
                    : `ORDER DEAL NOW (৳${(unitPrice * quantity).toLocaleString()})`}
                </span>
              </button>
              <button
                type="button"
                disabled={Boolean(countdown?.isExpired)}
                onClick={handleAdd}
                className={`w-full py-3.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all whitespace-nowrap ${
                  countdown?.isExpired
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'cursor-pointer bg-slate-900 hover:bg-slate-800 text-white hover:scale-[1.01] active:scale-[0.98]'
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-sky-400" />
                <span>{countdown?.isExpired ? 'EXPIRED' : `ADD DEAL TO CART (${quantity})`}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleWhatsAppOrder}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer active:scale-[0.98]"
            >
              <MessageSquare className="w-4.5 h-4.5 fill-white text-emerald-600" />
              <span>Order Deal via WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Description */}
      <div className="bg-[#F4F7FA] p-6 sm:p-8 border-t border-slate-200 space-y-6 shrink-0">
        <div className="max-w-4xl mx-auto space-y-4">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider font-['Outfit'] border-b border-slate-200 pb-2">
            Offer Details &amp; Highlights
          </h3>
          <div
            className="text-xs sm:text-sm text-slate-700 leading-relaxed prose prose-slate max-w-none bg-[#F8FAFC] p-5 rounded-2xl border border-slate-200 shadow-xs"
            dangerouslySetInnerHTML={{
              __html:
                selectedBuyMoreOffer.description?.replace(/\n/g, '<br />') ||
                'Exclusive Buy One Get More bundle offer.',
            }}
          />
        </div>
      </div>

      {/* Related Products & Deals Section */}
      {(relatedOffers.length > 0 || relatedRegularProducts.length > 0) && (
        <div className="bg-[#ECF1F6] p-5 sm:p-8 border-t border-slate-200 shrink-0">
          <div className="max-w-7xl mx-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h3 className="text-base sm:text-lg font-black text-slate-900 font-['Outfit'] tracking-tight">
                Related Products
              </h3>
              <span className="text-[11px] font-bold text-slate-500">
                {relatedOffers.length + relatedRegularProducts.length} Items
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {relatedOffers.map((rel) => (
                <BuyMoreCard key={`rel-bm-${rel.id}`} offer={rel} />
              ))}
              {relatedRegularProducts.map((prod) => (
                <div
                  key={`rel-reg-bm-${prod.id}`}
                  onClickCapture={() => setSelectedBuyMoreOffer(null)}
                >
                  <ProductCard product={prod} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
      </div>
    </div>
  );
};

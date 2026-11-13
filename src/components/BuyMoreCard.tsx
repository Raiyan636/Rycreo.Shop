import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Gift,
  ShoppingBag,
  Ticket,
  ChevronLeft,
  ChevronRight,
  Check,
  Play,
  Truck,
  Eye,
  Clock,
} from 'lucide-react';
import { BuyMoreOffer, ProductColorVariant } from '../types/store';
import { useStore } from '../context/StoreContext';
import { resolveStoreAssetUrl } from '../utils/clientAssetResolver';
import { getOfferCountdown } from '../utils/stockHelper';
import { useToast } from './common/Toast';

interface BuyMoreCardProps {
  offer: BuyMoreOffer;
}

const FALLBACK_BUYMORE_IMG =
  'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=800';

export const BuyMoreCard: React.FC<BuyMoreCardProps> = React.memo(({ offer }) => {
  const {
    setSelectedBuyMoreOffer,
    setIsSearchPageOpen,
    addBuyMoreOfferToCart,
    buyMoreOfferToCartItem,
    setDirectCheckoutItem,
    setDirectCheckoutItems,
    setIsCheckoutOpen,
  } = useStore();
  const { showToast } = useToast();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (!offer.expiresAt) return;
    const t = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(t);
  }, [offer.expiresAt]);

  const countdown = useMemo(() => getOfferCountdown(offer, nowMs), [offer, nowMs]);

  const normalizedColors: ProductColorVariant[] = useMemo(() => {
    return (offer.colors || [])
      .map((raw) => {
        const c = raw as unknown;
        if (typeof c === 'string') {
          return { name: c.trim(), hex: '#1E293B', enabled: true, stock: 99 };
        }
        const obj = (c || {}) as ProductColorVariant;
        return { ...obj, name: (obj.name || '').trim() };
      })
      .filter((c) => Boolean(c.name) && c.enabled !== false);
  }, [offer.colors]);

  const normalizedSizes = useMemo(() => {
    return (offer.sizes || [])
      .map((raw) => {
        const s = raw as unknown;
        return typeof s === 'string'
          ? s.trim()
          : ((s as { size?: string } | null)?.size || '').trim();
      })
      .filter(
        (sz) =>
          Boolean(sz) &&
          sz.toLowerCase() !== 'standard' &&
          sz.toLowerCase() !== 'standard / free size'
      );
  }, [offer.sizes]);

  const [selectedColorName, setSelectedColorName] = useState<string>(
    () => normalizedColors[0]?.name || ''
  );

  const offerImages = useMemo(() => {
    const list: string[] = [];
    const addUnique = (raw?: string) => {
      if (!raw) return;
      const resolved = resolveStoreAssetUrl(raw);
      if (resolved && !list.includes(resolved)) list.push(resolved);
    };
    addUnique(offer.mainProductImage);
    (offer.images || []).forEach(addUnique);
    normalizedColors.forEach((c) => {
      addUnique(c.image);
      (c.gallery || []).forEach(addUnique);
    });
    return list.length > 0 ? list : [FALLBACK_BUYMORE_IMG];
  }, [offer.mainProductImage, offer.images, normalizedColors]);

  const offerPrice = Number(offer.price) || 0;
  const regularValue = Number(offer.regularValue) || 0;
  const savings = regularValue > offerPrice ? regularValue - offerPrice : 0;

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const diffY = e.changedTouches[0].clientY - (touchStartY.current || 0);
    if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY) && offerImages.length > 1) {
      e.stopPropagation();
      if (diffX > 0) {
        setCurrentImageIndex((prev) => (prev - 1 + offerImages.length) % offerImages.length);
      } else {
        setCurrentImageIndex((prev) => (prev + 1) % offerImages.length);
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const handleSelectColor = (e: React.MouseEvent, colName: string) => {
    e.stopPropagation();
    setSelectedColorName(colName);
    const foundCol = normalizedColors.find((c) => c.name.toLowerCase() === colName.toLowerCase());
    const targetImg = foundCol?.image || foundCol?.gallery?.[0];
    if (targetImg) {
      const resolved = resolveStoreAssetUrl(targetImg);
      const imgIdx = offerImages.findIndex((img) => img === resolved);
      if (imgIdx !== -1) {
        setCurrentImageIndex(imgIdx);
      }
    }
  };

  const getDefaultVariants = () => {
    const firstColor = selectedColorName || normalizedColors[0]?.name || undefined;
    const firstSize = normalizedSizes[0] || undefined;
    return { firstColor, firstSize };
  };

  const handleOpenDetails = () => {
    setIsSearchPageOpen(false);
    setSelectedBuyMoreOffer(offer);
  };

  const handleOrderDeal = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (countdown.isExpired) {
      showToast('This limited-time offer has expired!', 'error');
      return;
    }
    const { firstColor, firstSize } = getDefaultVariants();
    const item = buyMoreOfferToCartItem(offer, 1, firstSize, firstColor);
    setIsSearchPageOpen(false);
    setSelectedBuyMoreOffer(null);
    setDirectCheckoutItem(item);
    setDirectCheckoutItems([item]);
    setIsCheckoutOpen(true);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (countdown.isExpired) {
      showToast('This limited-time offer has expired!', 'error');
      return;
    }
    const { firstColor, firstSize } = getDefaultVariants();
    addBuyMoreOfferToCart(offer, 1, firstSize, firstColor);
    setAddedAnimation(true);
    showToast(`Added "${offer.title}" combo to your cart!`, 'success');
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  return (
    <div
      id={`buymore-card-${offer.id}`}
      onClick={handleOpenDetails}
      className="group bg-[#F8FAFC] rounded-xl border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-indigo-400/60 transition-all duration-300 flex flex-col h-full overflow-hidden cursor-pointer relative active:scale-[0.99]"
    >
      {/* 4:3 Gallery */}
      <div
        className="relative aspect-[4/3] w-full bg-[#EFF3F8] flex items-center justify-center overflow-hidden select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          key={offerImages[currentImageIndex] || 'bm-img'}
          src={offerImages[currentImageIndex] || offerImages[0]}
          alt={offer.title}
          referrerPolicy="no-referrer"
          loading="lazy"
          decoding="async"
          draggable={false}
          className="w-full h-full object-contain p-1 group-hover:scale-105 transition-all duration-300 ease-in-out"
        />

        {offerImages.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImageIndex((prev) => (prev - 1 + offerImages.length) % offerImages.length);
              }}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-900/65 hover:bg-slate-900 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-md cursor-pointer z-20"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImageIndex((prev) => (prev + 1) % offerImages.length);
              }}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-900/65 hover:bg-slate-900 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-md cursor-pointer z-20"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-1.5 left-0 right-0 flex items-center justify-center gap-1 z-20"
            >
              {offerImages.slice(0, 6).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  aria-label={`Image ${idx + 1}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(idx);
                  }}
                  className={`transition-all rounded-full cursor-pointer ${
                    currentImageIndex === idx
                      ? 'w-3.5 h-1 bg-indigo-500 shadow-xs'
                      : 'w-1 h-1 bg-white/75 hover:bg-white shadow-xs'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[9.5px] font-black uppercase tracking-wider shadow-xs z-10 pointer-events-none">
          {offer.badgeText || 'Buy 1 Get More'}
        </span>

        {countdown.hasTimer && (
          <span
            className={`absolute top-2 right-2 px-2 py-0.5 rounded-md text-[8.5px] font-black uppercase tracking-tight shadow-xs z-10 pointer-events-none inline-flex items-center gap-1 font-mono ${
              countdown.isExpired
                ? 'bg-rose-600 text-white'
                : 'bg-amber-500 text-slate-950'
            }`}
          >
            <Clock className="w-2.5 h-2.5 shrink-0" />
            <span>{countdown.label}</span>
          </span>
        )}

        {offer.videoUrl && (
          <div className="absolute bottom-5 left-2 bg-slate-900/90 text-white px-1.5 py-0.5 rounded text-[9px] font-semibold flex items-center gap-1 border border-slate-700 z-10 pointer-events-none">
            <Play className="w-2.5 h-2.5 fill-white text-white" />
            <span>Video</span>
          </div>
        )}

        <div className="absolute inset-0 bg-slate-900/15 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
          <span className="px-2.5 py-1 rounded-full bg-slate-900/95 text-white text-[10px] font-bold flex items-center gap-1 shadow-lg border border-slate-700">
            <Eye className="w-3 h-3 text-sky-400" />
            <span>View Details</span>
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="p-2 sm:p-2.5 flex-1 flex flex-col justify-between gap-1.5">
        <div className="space-y-1">
          <h3 className="font-bold text-slate-900 text-[11.5px] sm:text-xs leading-snug line-clamp-2 min-h-[2.1em] group-hover:text-indigo-600 transition-colors">
            {offer.title}
          </h3>

          {/* Paired Free Items Strip */}
          {Array.isArray(offer.freeItems) && offer.freeItems.length > 0 && (
            <div className="rounded-lg bg-emerald-50/75 border border-emerald-200/80 p-1.5 space-y-0.5">
              <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-800 uppercase tracking-wide">
                <Gift className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                <span>Free With This Offer:</span>
              </div>
              {offer.freeItems.slice(0, 2).map((fi) => (
                <p key={fi.id} className="text-[10px] font-semibold text-slate-800 truncate">
                  + {fi.quantity}x {fi.title}
                </p>
              ))}
              {offer.freeItems.length > 2 && (
                <p className="text-[9px] font-semibold text-emerald-700">
                  +{offer.freeItems.length - 2} more bonus item(s)
                </p>
              )}
            </div>
          )}

          {offer.voucherCode && (
            <div className="flex items-center gap-1 text-[9.5px] font-semibold text-slate-600">
              <Ticket className="w-2.5 h-2.5 text-amber-600 shrink-0" />
              <span>Voucher:</span>
              <span className="font-mono font-bold text-slate-900">{offer.voucherCode}</span>
            </div>
          )}
        </div>

        {/* Pricing & Action Buttons */}
        <div className="pt-1 border-t border-slate-100 space-y-1">
          <div className="flex items-baseline justify-between gap-1 flex-wrap">
            <div className="flex items-baseline gap-1 flex-wrap">
              {offer.isFreeShipping && (
                <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[8.5px] font-black border border-emerald-300">
                  <Truck className="w-2.5 h-2.5 text-emerald-600" /> Free
                </span>
              )}
              <span className="text-[13px] sm:text-sm font-black text-slate-900 tabular-nums">
                ৳{offerPrice.toLocaleString()}
              </span>
              {regularValue > offerPrice && (
                <span className="text-[9.5px] text-slate-400 line-through tabular-nums">
                  ৳{regularValue.toLocaleString()}
                </span>
              )}
            </div>
            {savings > 0 && (
              <span className="text-[9px] font-bold text-emerald-700 tabular-nums whitespace-nowrap">
                Save ৳{savings.toLocaleString()}
              </span>
            )}
          </div>

          {/* Interactive Color Swatches when offer has colors */}
          {normalizedColors.length > 0 && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="pt-0.5 border-t border-slate-100 flex flex-col gap-0.5 select-none"
            >
              <div className="text-[8.5px] text-slate-500 font-semibold flex items-center gap-1">
                <span>Color:</span>
                {selectedColorName && (
                  <strong className="text-slate-900 font-bold truncate max-w-[85px]">
                    {selectedColorName}
                  </strong>
                )}
              </div>
              <div className="flex items-center flex-wrap gap-1">
                {normalizedColors.map((col, idx) => {
                  const isSelected = selectedColorName.toLowerCase() === col.name.toLowerCase();
                  return (
                    <button
                      key={`${col.name}-${idx}`}
                      type="button"
                      onClick={(e) => handleSelectColor(e, col.name)}
                      title={col.name}
                      className={`relative p-0.5 rounded-full transition-all cursor-pointer ${
                        isSelected ? 'ring-1.5 ring-indigo-500 scale-105' : 'hover:scale-105'
                      }`}
                    >
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-slate-300 overflow-hidden bg-slate-100"
                        style={{ backgroundColor: col.hex || '#1E293B' }}
                      >
                        {col.image && (
                          <img
                            src={resolveStoreAssetUrl(col.image)}
                            alt={col.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDetails();
            }}
            className="w-full py-0.5 sm:py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[9.5px] flex items-center justify-center gap-1 transition-colors cursor-pointer border border-slate-200/90 whitespace-nowrap"
          >
            <span>🔍 Details / View Details</span>
          </button>

          {countdown.isExpired ? (
            <button
              type="button"
              disabled
              className="w-full py-1.5 rounded-lg bg-rose-100 text-rose-700 border border-rose-200 font-black text-[10px] cursor-not-allowed"
            >
              Offer Expired
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={handleOrderDeal}
                className="py-1 px-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-black text-[10.5px] flex items-center justify-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>⚡ Order Deal</span>
              </button>
              <button
                type="button"
                onClick={handleAddToCart}
                className={`py-1 px-1.5 rounded-lg font-black text-[10.5px] flex items-center justify-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                  addedAnimation
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-r from-[#38BDF8] to-[#6366F1] text-white hover:shadow-xs'
                }`}
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>Added!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3 h-3" />
                    <span>Add</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

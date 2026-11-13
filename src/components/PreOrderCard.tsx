import React, { useState, useMemo, useRef } from 'react';
import {
  CalendarClock,
  Clock,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Check,
  Play,
  Truck,
  Eye,
} from 'lucide-react';
import { PreOrderProduct, ProductColorVariant } from '../types/store';
import { useStore } from '../context/StoreContext';
import { resolveStoreAssetUrl } from '../utils/clientAssetResolver';
import { getPreOrderQuotaStatus, getVariationColor, getVariationSize } from '../utils/stockHelper';
import { useToast } from './common/Toast';

interface PreOrderCardProps {
  item: PreOrderProduct;
}

const FALLBACK_PREORDER_IMG =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800';

export const PreOrderCard: React.FC<PreOrderCardProps> = React.memo(({ item }) => {
  const {
    setSelectedPreOrderProduct,
    setIsSearchPageOpen,
    preOrderProductToCartItem,
    addPreOrderToCart,
    setDirectCheckoutItem,
    setDirectCheckoutItems,
    setIsCheckoutOpen,
  } = useStore();
  const { showToast } = useToast();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const normalizedColors: ProductColorVariant[] = useMemo(() => {
    if (item.hasColorVariants === false) return [];
    return (item.colors || [])
      .map((c) =>
        typeof c === 'string'
          ? { name: c.trim(), hex: '#1E293B', enabled: true, stock: 99 }
          : { ...c, name: (c?.name || '').trim() }
      )
      .filter((c) => Boolean(c.name) && c.enabled !== false);
  }, [item.colors, item.hasColorVariants]);

  const normalizedSizes = useMemo(() => {
    return (item.sizes || [])
      .map((s) =>
        typeof s === 'string' ? { size: s.trim(), stock: 99 } : { size: (s?.size || '').trim(), stock: s?.stock ?? 99 }
      )
      .filter((s) => Boolean(s.size) && s.size.toLowerCase() !== 'standard' && s.size.toLowerCase() !== 'standard / free size');
  }, [item.sizes]);

  const [selectedColorName, setSelectedColorName] = useState<string>(
    () => normalizedColors[0]?.name || ''
  );

  const productImages = useMemo(() => {
    const list: string[] = [];
    (item.images || []).forEach((img) => {
      const resolved = resolveStoreAssetUrl(img);
      if (resolved && !list.includes(resolved)) list.push(resolved);
    });
    normalizedColors.forEach((c) => {
      if (c.image) {
        const resolved = resolveStoreAssetUrl(c.image);
        if (resolved && !list.includes(resolved)) list.push(resolved);
      }
      if (Array.isArray(c.gallery)) {
        c.gallery.forEach((g) => {
          const resolved = resolveStoreAssetUrl(g);
          if (resolved && !list.includes(resolved)) list.push(resolved);
        });
      }
    });
    return list.length > 0 ? list : [FALLBACK_PREORDER_IMG];
  }, [item.images, normalizedColors]);

  const regularPrice = Number(item.price) || 0;
  const salePrice = Number(item.salePrice) || 0;
  const effectivePrice = salePrice > 0 ? salePrice : regularPrice;
  const hasDiscount = salePrice > 0 && regularPrice > 0 && salePrice < regularPrice;
  const discountPercent = hasDiscount
    ? Math.round(((regularPrice - salePrice) / regularPrice) * 100)
    : 0;

  // Advance indicator
  const advanceLabel = useMemo(() => {
    const advVal = Number(item.advanceValue) || 0;
    const advAmt = Number(item.advanceAmount) || 0;
    if (item.advanceType === 'percent' && advVal > 0) {
      return `Adv: ${advVal}%`;
    }
    const amt =
      item.advanceType === 'fixed' && advVal > 0
        ? advVal
        : advAmt > 0
          ? advAmt
          : 0;
    return amt > 0 ? `Adv: ৳${amt.toLocaleString()}` : 'Pre-Order Active';
  }, [item.advanceType, item.advanceValue, item.advanceAmount]);

  const weWillGet = item.weWillGetText?.trim() || '';
  const youWillGet = item.youWillGetText?.trim() || '';

  // Touch swipe tracking
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
    if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY) && productImages.length > 1) {
      e.stopPropagation();
      if (diffX > 0) {
        setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
      } else {
        setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const handleOpenDetails = () => {
    setIsSearchPageOpen(false);
    setSelectedPreOrderProduct(item);
  };

  const handleSelectColor = (e: React.MouseEvent, colName: string) => {
    e.stopPropagation();
    setSelectedColorName(colName);
    const foundCol = normalizedColors.find((c) => c.name.toLowerCase() === colName.toLowerCase());
    const targetImg = foundCol?.image || foundCol?.gallery?.[0];
    if (targetImg) {
      const resolved = resolveStoreAssetUrl(targetImg);
      const imgIdx = productImages.findIndex((img) => img === resolved);
      if (imgIdx !== -1) {
        setCurrentImageIndex(imgIdx);
      }
    }
  };

  const quotaStatus = useMemo(() => getPreOrderQuotaStatus(item), [item]);
  const isFulfilled = quotaStatus.isFulfilled;

  const getDefaultSelection = () => {
    const activeCol = selectedColorName || normalizedColors[0]?.name || undefined;
    const matchedVar =
      item.variations?.find((v) => {
        const vCol = getVariationColor(v.combination);
        return (!activeCol || vCol === activeCol) && (v.stock || 0) > 0;
      }) || item.variations?.[0];
    const matchedSize =
      (matchedVar && getVariationSize(matchedVar.combination)) ||
      normalizedSizes.find((s) => (s.stock ?? 0) > 0)?.size ||
      normalizedSizes[0]?.size ||
      undefined;
    return { activeCol, matchedSize, matchedVar };
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFulfilled) {
      showToast('Pre-Order Fulfilled! Please contact us on WhatsApp.', 'error');
      return;
    }
    const { activeCol, matchedSize, matchedVar } = getDefaultSelection();
    addPreOrderToCart(item, matchedSize, 1, activeCol, matchedVar);
    setAddedAnimation(true);
    showToast(`Added pre-order "${item.title}" to cart!`, 'success');
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const handlePreOrderNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFulfilled) {
      showToast('Pre-Order Fulfilled! Please contact us on WhatsApp.', 'error');
      return;
    }
    const { activeCol, matchedSize, matchedVar } = getDefaultSelection();
    const cartItem = preOrderProductToCartItem(item, matchedSize, 1, activeCol, matchedVar);
    setIsSearchPageOpen(false);
    setSelectedPreOrderProduct(null);
    setDirectCheckoutItem(cartItem);
    setDirectCheckoutItems([cartItem]);
    setIsCheckoutOpen(true);
  };

  return (
    <div
      id={`preorder-card-${item.id}`}
      onClick={handleOpenDetails}
      className="group bg-[#F8FAFC] rounded-xl border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-sky-400/60 transition-all duration-300 flex flex-col h-full overflow-hidden cursor-pointer relative active:scale-[0.99]"
    >
      {/* 4:3 Image Slider */}
      <div
        className="relative aspect-[4/3] w-full bg-[#EFF3F8] flex items-center justify-center overflow-hidden select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          key={productImages[currentImageIndex] || 'po-img'}
          src={productImages[currentImageIndex] || productImages[0]}
          alt={item.title}
          referrerPolicy="no-referrer"
          loading="lazy"
          decoding="async"
          draggable={false}
          className="w-full h-full object-contain p-1 group-hover:scale-105 transition-all duration-300 ease-in-out"
        />

        {/* Arrows */}
        {productImages.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
              }}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-900/65 hover:bg-slate-900 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-md cursor-pointer z-20 active:scale-95"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
              }}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-900/65 hover:bg-slate-900 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-md cursor-pointer z-20 active:scale-95"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </>
        )}

        {/* Pagination Dots */}
        {productImages.length > 1 && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-1.5 left-0 right-0 flex items-center justify-center gap-1 z-20"
          >
            {productImages.slice(0, 6).map((_, idx) => (
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
                    ? 'w-3.5 h-1 bg-sky-400 shadow-xs'
                    : 'w-1 h-1 bg-white/75 hover:bg-white shadow-xs'
                }`}
              />
            ))}
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start pointer-events-none z-10">
          {isFulfilled ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-black uppercase tracking-wider shadow-xs">
              Fulfilled • Sold Out
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white text-[9.5px] font-black uppercase tracking-wider shadow-xs">
              <Clock className="w-2.5 h-2.5" />
              PRE-ORDER
            </span>
          )}
          {!isFulfilled && quotaStatus.isLowSlot && (
            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider shadow-xs">
              Low Slot ({quotaStatus.remaining} left)
            </span>
          )}
          {hasDiscount && discountPercent > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-black uppercase tracking-wider shadow-xs">
              -{discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Video badge */}
        {item.videoUrl && (
          <div className="absolute bottom-5 left-2 bg-slate-900/90 text-white px-1.5 py-0.5 rounded text-[9px] font-semibold flex items-center gap-1 border border-slate-700 z-10 pointer-events-none">
            <Play className="w-2.5 h-2.5 fill-white text-white" />
            <span>Video</span>
          </div>
        )}

        {/* Quick View Hover */}
        <div className="absolute inset-0 bg-slate-900/15 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
          <span className="px-2.5 py-1 rounded-full bg-slate-900/95 text-white text-[10px] font-bold flex items-center gap-1 shadow-lg border border-slate-700">
            <Eye className="w-3 h-3 text-sky-400" />
            <span>View Details</span>
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="p-2 sm:p-2.5 flex-1 flex flex-col justify-between space-y-1">
        <div className="space-y-0.5">
          <div className="flex items-center justify-between text-[9.5px] font-semibold text-slate-500 gap-1">
            <span className="uppercase tracking-wider truncate text-slate-700">
              {item.category}
            </span>
            <span className="text-[9px] font-extrabold text-blue-700 whitespace-nowrap tabular-nums">
              {advanceLabel}
            </span>
          </div>

          <h3 className="font-bold text-slate-800 text-[11.5px] sm:text-xs leading-snug line-clamp-2 min-h-[2.2em] group-hover:text-indigo-600 transition-colors">
            {item.title}
          </h3>

          {/* Conditional "We will get" & "You will get" — shown ONLY when non-empty */}
          {(weWillGet || youWillGet) && (
            <div className="pt-0.5 border-t border-slate-100 space-y-0.5 text-[10px] leading-tight">
              {weWillGet && (
                <div className="flex items-start gap-1 text-slate-700">
                  <Clock className="w-2.5 h-2.5 text-amber-600 shrink-0 mt-0.5" />
                  <span className="line-clamp-1">
                    <strong className="font-semibold text-slate-900">We will get:</strong> {weWillGet}
                  </span>
                </div>
              )}
              {youWillGet && (
                <div className="flex items-start gap-1 text-slate-700">
                  <CalendarClock className="w-2.5 h-2.5 text-sky-600 shrink-0 mt-0.5" />
                  <span className="line-clamp-1">
                    <strong className="font-semibold text-slate-900">You will get:</strong> {youWillGet}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Price */}
        <div className="pt-0.5 border-t border-slate-100 flex items-center flex-wrap gap-1.5">
          {item.isFreeShipping && (
            <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[8.5px] font-black border border-emerald-300">
              <Truck className="w-2.5 h-2.5 text-emerald-600" /> Free
            </span>
          )}
          <span className="text-[13px] sm:text-sm font-black text-slate-900 tabular-nums">
            ৳{effectivePrice.toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-[9.5px] text-slate-400 line-through font-semibold tabular-nums">
              ৳{regularPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Interactive Color Swatches */}
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
                      isSelected ? 'ring-1.5 ring-sky-400 scale-105' : 'hover:scale-105'
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

        {/* Action Buttons */}
        <div className="space-y-1 pt-0.5">
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

          {isFulfilled ? (
            <div className="rounded-lg bg-rose-50 border border-rose-200 p-1.5 text-center space-y-1">
              <p className="text-[9.5px] font-extrabold text-rose-700 leading-tight">
                Pre-Order Fulfilled{quotaStatus.totalQuotaDisplay > 0 ? ` — All ${quotaStatus.totalQuotaDisplay} pcs Sold!` : '!'} Please Contact Us
              </p>
              <button
                type="button"
                disabled
                className="w-full py-1 rounded-md bg-slate-200 text-slate-500 font-black text-[10px] cursor-not-allowed"
              >
                Booking Closed (Sold Out)
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={handlePreOrderNow}
                className="w-full py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-black text-[10.5px] flex items-center justify-center gap-1 transition-all shadow-2xs cursor-pointer whitespace-nowrap"
              >
                <span>⚡ Pre-Order</span>
              </button>

              <button
                type="button"
                onClick={handleQuickAdd}
                className={`w-full py-1 rounded-lg font-black text-[10.5px] flex items-center justify-center gap-1 transition-all duration-200 shadow-2xs cursor-pointer whitespace-nowrap ${
                  addedAnimation
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-r from-[#38BDF8] to-[#6366F1] text-white hover:shadow-xs active:scale-95'
                }`}
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-3 h-3 text-white" />
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

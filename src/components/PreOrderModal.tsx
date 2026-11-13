import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  X,
  ShoppingBag,
  MessageSquare,
  Play,
  Check,
  Truck,
  Plus,
  Minus,
  Trash2,
  PackageCheck,
  AlertCircle,
  Clock,
  CalendarClock,
  Zap,
  ShieldAlert,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { CartItem, ProductColorVariant, ProductVariation } from '../types/store';
import { resolveStoreAssetUrl } from '../utils/clientAssetResolver';
import { getPreOrderQuotaStatus, getVariationColor, getVariationSize } from '../utils/stockHelper';
import { Footer } from './Footer';
import { PreOrderCard } from './PreOrderCard';
import { ProductCard } from './ProductCard';
import { sortRelatedItems } from '../utils/relatedProducts';
import { useToast } from './common/Toast';

const FALLBACK_PREORDER_IMG =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800';

const isPlaceholderSize = (sz?: string): boolean => {
  const s = (sz || '').trim().toLowerCase();
  return !s || s === 'standard' || s === 'standard / free size' || s === 'default';
};

export const PreOrderModal: React.FC = () => {
  const {
    selectedPreOrderProduct,
    setSelectedPreOrderProduct,
    preOrderProducts,
    products,
    preOrderProductToCartItem,
    addPreOrderToCart,
    setIsCartOpen,
    setDirectCheckoutItem,
    setDirectCheckoutItems,
    setIsCheckoutOpen,
    storeConfig,
  } = useStore();
  const { showToast } = useToast();

  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [activeColor, setActiveColor] = useState('');
  const [variantQuantities, setVariantQuantities] = useState<Record<string, number>>({});
  const [hasCustomizedVariants, setHasCustomizedVariants] = useState(false);
  const [stockNotice, setStockNotice] = useState<string | null>(null);
  const touchStartX = useRef<number | null>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  const normalizedColors: ProductColorVariant[] = useMemo(() => {
    if (!selectedPreOrderProduct || selectedPreOrderProduct.hasColorVariants === false) return [];
    return (selectedPreOrderProduct.colors || [])
      .map((c) =>
        typeof c === 'string'
          ? { name: c.trim(), hex: '#1E293B', enabled: true, stock: 99 }
          : { ...c, name: (c?.name || '').trim() }
      )
      .filter((c) => Boolean(c.name) && c.enabled !== false);
  }, [selectedPreOrderProduct]);

  const normalizedSizes = useMemo(() => {
    if (!selectedPreOrderProduct?.sizes) return [];
    return selectedPreOrderProduct.sizes
      .map((s) =>
        typeof s === 'string'
          ? { size: s.trim(), stock: 99 }
          : { size: (s?.size || '').trim(), stock: s?.stock ?? 99 }
      )
      .filter((s) => !isPlaceholderSize(s.size));
  }, [selectedPreOrderProduct?.sizes]);

  const variations: ProductVariation[] = useMemo(
    () => selectedPreOrderProduct?.variations || [],
    [selectedPreOrderProduct?.variations]
  );
  const hasVariations = variations.length > 0;
  const showColorSection = normalizedColors.length > 0;

  const hasSizeSection = useMemo(() => {
    if (normalizedSizes.length > 0) return true;
    return variations.some((v) => !isPlaceholderSize(getVariationSize(v.combination)));
  }, [normalizedSizes, variations]);

  // Comprehensive media gallery: main images + all color thumbnails & galleries
  const modalImages = useMemo(() => {
    if (!selectedPreOrderProduct) return [];
    const list: string[] = [];
    const addUnique = (raw?: string) => {
      if (!raw) return;
      const resolved = resolveStoreAssetUrl(raw);
      if (resolved && !list.includes(resolved)) list.push(resolved);
    };
    (selectedPreOrderProduct.images || []).forEach(addUnique);
    normalizedColors.forEach((c) => {
      addUnique(c.image);
      if (Array.isArray(c.gallery)) {
        c.gallery.forEach(addUnique);
      }
    });
    variations.forEach((v) => {
      addUnique((v as any).image);
    });
    return list.length > 0 ? list : [FALLBACK_PREORDER_IMG];
  }, [selectedPreOrderProduct, normalizedColors, variations]);

  const regularPrice = Number(selectedPreOrderProduct?.price) || 0;
  const salePrice = Number(selectedPreOrderProduct?.salePrice) || 0;
  const effectiveUnitPrice = salePrice > 0 ? salePrice : regularPrice;
  const hasDiscount = salePrice > 0 && regularPrice > 0 && salePrice < regularPrice;
  const discountPercent =
    hasDiscount && regularPrice > 0
      ? Math.round(((regularPrice - salePrice) / regularPrice) * 100)
      : 0;

  const getCombinationDetails = (colName: string, szName: string) => {
    const cleanCol = colName && colName !== 'default' ? colName : '';
    const cleanSz = !isPlaceholderSize(szName) ? szName : '';
    const quota = selectedPreOrderProduct ? getPreOrderQuotaStatus(selectedPreOrderProduct) : null;

    if (hasVariations) {
      const matched = variations.find((v) => {
        const vCol = getVariationColor(v.combination) || '';
        const vSz = getVariationSize(v.combination) || '';
        const colOk = !cleanCol || !vCol || vCol.toLowerCase() === cleanCol.toLowerCase();
        const szOk = !cleanSz || !vSz || vSz.toLowerCase() === cleanSz.toLowerCase();
        return colOk && szOk;
      });
      if (matched) {
        const varSale = Number(matched.salePrice) || 0;
        const varPrice = Number(matched.price) || 0;
        return {
          stock: Math.max(0, Number(matched.stock) || 0),
          price: varSale > 0 ? varSale : varPrice > 0 ? varPrice : effectiveUnitPrice,
          variation: matched,
        };
      }
    }
    const szObj = normalizedSizes.find(
      (s) => s.size.toLowerCase() === cleanSz.toLowerCase()
    );
    const colObj = normalizedColors.find(
      (c) => c.name.toLowerCase() === cleanCol.toLowerCase()
    );
    const maxQty =
      szObj?.stock ??
      colObj?.stock ??
      (quota?.tracksQuota ? quota.remaining : 999);
    return {
      stock: Math.max(0, Number(maxQty) || 0),
      price: effectiveUnitPrice,
      variation: undefined,
    };
  };

  // Initialize state cleanly and force scroll to very top whenever product opens/changes
  useEffect(() => {
    if (!selectedPreOrderProduct) return;
    if (modalContainerRef.current) {
      modalContainerRef.current.scrollTop = 0;
      requestAnimationFrame(() => {
        if (modalContainerRef.current) {
          modalContainerRef.current.scrollTop = 0;
        }
      });
    }
    setActiveMediaIndex(0);
    setShowVideoModal(false);
    setStockNotice(null);
    setHasCustomizedVariants(false);

    const defaultCol = normalizedColors[0]?.name || '';
    setActiveColor(defaultCol);

    if (hasSizeSection) {
      if (hasVariations) {
        const colorVars = variations.filter((v) => {
          const vCol = getVariationColor(v.combination);
          return !defaultCol || !vCol || vCol.toLowerCase() === defaultCol.toLowerCase();
        });
        const firstVar =
          colorVars.find((v) => !isPlaceholderSize(getVariationSize(v.combination))) ||
          variations[0];
        const firstSz = firstVar ? getVariationSize(firstVar.combination) : '';
        if (!isPlaceholderSize(firstSz)) {
          setVariantQuantities({ [`${defaultCol || 'default'}__${firstSz}`]: 1 });
          return;
        }
      }
      if (normalizedSizes[0]?.size) {
        setVariantQuantities({
          [`${defaultCol || 'default'}__${normalizedSizes[0].size}`]: 1,
        });
        return;
      }
    }

    setVariantQuantities({ [`${defaultCol || 'default'}__default`]: 1 });
  }, [selectedPreOrderProduct?.id]);

  // Automatically switch preview image when activeColor changes
  useEffect(() => {
    if (!activeColor || modalImages.length === 0) return;
    const foundCol = normalizedColors.find(
      (c) => c.name.toLowerCase() === activeColor.toLowerCase()
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
  }, [activeColor, normalizedColors, modalImages]);

  useEffect(() => {
    if (!stockNotice) return;
    const t = setTimeout(() => setStockNotice(null), 3200);
    return () => clearTimeout(t);
  }, [stockNotice]);

  // Sizes available for active color (only populated when hasSizeSection is true)
  const currentSizes = useMemo(() => {
    if (!selectedPreOrderProduct || !hasSizeSection) return [];

    if (hasVariations) {
      const matchingVars = variations.filter((v) => {
        const vCol = getVariationColor(v.combination);
        if (!showColorSection || !activeColor) return true;
        return !vCol || vCol.toLowerCase() === activeColor.toLowerCase();
      });
      const sizeList: string[] = [];
      matchingVars.forEach((v) => {
        const s = getVariationSize(v.combination);
        if (!isPlaceholderSize(s) && !sizeList.includes(s)) {
          sizeList.push(s);
        }
      });
      if (sizeList.length > 0) {
        return sizeList.map((sz) => {
          const { stock, price, variation } = getCombinationDetails(activeColor, sz);
          return { size: sz, stock, price, variation };
        });
      }
    }

    return normalizedSizes.map((s) => {
      const { stock, price, variation } = getCombinationDetails(activeColor, s.size);
      return { size: s.size, stock, price, variation };
    });
  }, [
    selectedPreOrderProduct,
    hasSizeSection,
    activeColor,
    showColorSection,
    hasVariations,
    variations,
    normalizedSizes,
    effectiveUnitPrice,
  ]);

  const selectedLineItems: CartItem[] = useMemo(() => {
    if (!selectedPreOrderProduct) return [];
    const list: CartItem[] = [];
    Object.entries(variantQuantities).forEach(([key, qty]) => {
      if (qty > 0) {
        const [col, sz] = key.split('__');
        const cleanCol = col === 'default' || !showColorSection ? undefined : col;
        const cleanSz = isPlaceholderSize(sz) || !hasSizeSection ? undefined : sz;
        const { variation } = getCombinationDetails(cleanCol || '', cleanSz || '');
        list.push(
          preOrderProductToCartItem(
            selectedPreOrderProduct,
            cleanSz,
            qty,
            cleanCol,
            variation
          )
        );
      }
    });
    return list;
  }, [
    variantQuantities,
    selectedPreOrderProduct,
    showColorSection,
    hasSizeSection,
    preOrderProductToCartItem,
  ]);

  const advanceModeLabel = useMemo(() => {
    if (!selectedPreOrderProduct) return '';
    const advVal = Number(selectedPreOrderProduct.advanceValue) || 0;
    const advAmt = Number(selectedPreOrderProduct.advanceAmount) || 0;
    if (selectedPreOrderProduct.advanceType === 'percent' && advVal > 0) {
      return `${advVal}% Advance Required`;
    }
    const fixed =
      selectedPreOrderProduct.advanceType === 'fixed' && advVal > 0 ? advVal : advAmt;
    if (fixed > 0 && fixed < effectiveUnitPrice) {
      return `Fixed ৳${fixed.toLocaleString()} Advance Per Unit`;
    }
    return '100% Full Advance Payment Required';
  }, [selectedPreOrderProduct, effectiveUnitPrice]);

  const relatedPreOrders = useMemo(() => {
    if (!selectedPreOrderProduct) return [];
    const others = preOrderProducts.filter(
      (p) => p.isVisible !== false && p.id !== selectedPreOrderProduct.id
    );
    return sortRelatedItems(selectedPreOrderProduct, others).slice(0, 5);
  }, [preOrderProducts, selectedPreOrderProduct]);

  const relatedRegularProducts = useMemo(() => {
    if (!selectedPreOrderProduct) return [];
    const needed = Math.max(5, 10 - relatedPreOrders.length);
    return sortRelatedItems(selectedPreOrderProduct, products).slice(0, needed);
  }, [products, selectedPreOrderProduct, relatedPreOrders.length]);

  if (!selectedPreOrderProduct) return null;

  const weWillGet = selectedPreOrderProduct.weWillGetText?.trim() || '';
  const youWillGet = selectedPreOrderProduct.youWillGetText?.trim() || '';

  const handleSelectColor = (col: ProductColorVariant) => {
    setActiveColor(col.name);

    const targetImg = col.image || col.gallery?.[0];
    if (targetImg) {
      const resolved = resolveStoreAssetUrl(targetImg);
      const imgIdx = modalImages.findIndex((i) => i === resolved);
      if (imgIdx !== -1) {
        setActiveMediaIndex(imgIdx);
        setShowVideoModal(false);
      }
    }

    // If user hasn't explicitly built a multi-row basket yet, smoothly follow clicked color
    if (!hasCustomizedVariants) {
      if (hasSizeSection) {
        // Find matching size for the newly selected color
        const currentChosenSz = Object.keys(variantQuantities)[0]?.split('__')[1];
        const colorVars = variations.filter((v) => {
          const vCol = getVariationColor(v.combination);
          return !vCol || vCol.toLowerCase() === col.name.toLowerCase();
        });
        const availableSizesForColor = hasVariations && colorVars.length > 0
          ? colorVars.map((v) => getVariationSize(v.combination)).filter((s) => !isPlaceholderSize(s))
          : normalizedSizes.map((s) => s.size);

        const preferredSize =
          currentChosenSz && availableSizesForColor.includes(currentChosenSz)
            ? currentChosenSz
            : availableSizesForColor[0] || normalizedSizes[0]?.size || 'default';

        setVariantQuantities({ [`${col.name}__${preferredSize}`]: 1 });
      } else {
        setVariantQuantities({ [`${col.name}__default`]: 1 });
      }
    }
  };

  const handleSetQty = (col: string, sz: string, qty: number, maxLimit: number) => {
    setHasCustomizedVariants(true);
    const key = `${col || 'default'}__${sz || 'default'}`;
    if (qty <= 0) {
      setVariantQuantities((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      return;
    }
    if (maxLimit <= 0) {
      setStockNotice('Pre-Order Fulfilled / Out of Stock for this selection!');
      return;
    }
    const capped = Math.min(qty, maxLimit);
    if (qty > capped) {
      setStockNotice(`Only ${capped} pcs remaining for this Pre-Order slot!`);
    }
    setVariantQuantities((prev) => ({ ...prev, [key]: capped }));
  };

  const handleRemoveKey = (key: string) => {
    setHasCustomizedVariants(true);
    setVariantQuantities((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const totalSelectedUnits = selectedLineItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalBillAmount = selectedLineItems.reduce(
    (sum, i) => sum + (Number(i.price) || 0) * i.quantity,
    0
  );

  const computeUnitAdvance = (unitPrice: number) => {
    const advVal = Number(selectedPreOrderProduct.advanceValue) || 0;
    const advAmt = Number(selectedPreOrderProduct.advanceAmount) || 0;
    if (selectedPreOrderProduct.advanceType === 'percent' && advVal > 0) {
      return Math.round((unitPrice * Math.min(100, advVal)) / 100);
    }
    const fixedAmt =
      selectedPreOrderProduct.advanceType === 'fixed' && advVal > 0
        ? advVal
        : advAmt > 0
          ? advAmt
          : unitPrice;
    return Math.min(unitPrice, fixedAmt);
  };

  const displayTotalForEstimate = totalBillAmount > 0 ? totalBillAmount : effectiveUnitPrice;
  const totalAdvanceNow =
    selectedLineItems.length > 0
      ? selectedLineItems.reduce(
          (sum, i) => sum + computeUnitAdvance(Number(i.price) || 0) * i.quantity,
          0
        )
      : computeUnitAdvance(effectiveUnitPrice);
  const dueOnDelivery = Math.max(0, displayTotalForEstimate - totalAdvanceNow);

  const handleAddToCartAll = () => {
    if (selectedLineItems.length === 0) {
      setStockNotice('Please select at least 1 unit before adding to cart.');
      return;
    }
    selectedLineItems.forEach((item) => {
      addPreOrderToCart(
        selectedPreOrderProduct,
        item.selectedSize,
        item.quantity,
        item.selectedColor,
        item.selectedVariation
      );
    });
    showToast(`Added ${totalSelectedUnits} pre-order unit(s) to cart!`, 'success');
  };

  const handleProceedPreOrderCheckout = () => {
    if (selectedLineItems.length === 0) {
      setStockNotice('Please select at least 1 unit before proceeding.');
      return;
    }
    setDirectCheckoutItem(selectedLineItems[0]);
    setDirectCheckoutItems(selectedLineItems);
    setIsCartOpen(false);
    setSelectedPreOrderProduct(null);
    setIsCheckoutOpen(true);
  };

  const handleWhatsAppOrder = () => {
    const details = selectedLineItems
      .map((i) => {
        const variantStr = [i.selectedColor, i.selectedSize].filter(Boolean).join(' ');
        return `${variantStr ? `[${variantStr}]` : 'Standard'} × ${i.quantity}`;
      })
      .join(', ');
    const code = selectedPreOrderProduct.productCode || selectedPreOrderProduct.id;
    const msg = encodeURIComponent(
      `Hi ${storeConfig.storeName || 'RycreoShop'}! I want to Pre-Order:\n\n*Product:* ${
        selectedPreOrderProduct.title
      }\n*Product Code:* ${code}\n*Selections:* ${details || 'Standard × 1'}\n*Total Value:* ৳${displayTotalForEstimate.toLocaleString()}\n*Advance Payable Now:* ৳${totalAdvanceNow.toLocaleString()}\n\nPlease confirm my pre-order slot!`
    );
    window.open(`https://wa.me/${storeConfig.whatsappNumber}?text=${msg}`, '_blank');
  };

  const isMp4Video =
    selectedPreOrderProduct.videoUrl &&
    /\.(mp4|webm|ogg)(\?.*)?$/i.test(selectedPreOrderProduct.videoUrl);

  const quotaStatus = getPreOrderQuotaStatus(selectedPreOrderProduct);
  const isFulfilled = quotaStatus.isFulfilled;

  const simpleColorOnlyQty = variantQuantities[`${activeColor || 'default'}__default`] || 0;
  const activeColorDetails = getCombinationDetails(activeColor, '');

  return (
    <div
      ref={modalContainerRef}
      className="fixed inset-0 z-[90] bg-[#ECF1F6] overflow-y-auto overscroll-contain"
    >
      <div className="min-h-screen w-full bg-[#ECF1F6] text-[#1E293B] flex flex-col relative">
      {/* Top Sticky Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-5 py-3 bg-[#F8FAFC]/95 backdrop-blur-md border-b border-slate-200/80 shrink-0 shadow-2xs select-none">
        <button
          type="button"
          onClick={() => setSelectedPreOrderProduct(null)}
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
            onClick={() => setSelectedPreOrderProduct(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 transition-all cursor-pointer text-xs font-bold active:scale-95"
          >
            <X className="w-4 h-4" />
            <span>Close</span>
          </button>
        </div>
      </div>

      {/* Main 12-Col Detail Split */}
      <div className="bg-[#F8FAFC] sm:rounded-3xl sm:border border-slate-200/80 p-0 sm:p-8 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-0 md:gap-8 lg:gap-10 shrink-0">
        {/* Left 7 Cols: Media Gallery */}
        <div className="md:col-span-7 flex flex-col md:flex-row gap-0 md:gap-4">
          {/* Desktop Left Vertical Thumbnails */}
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
                    ? 'border-[#38BDF8] ring-2 ring-[#38BDF8]/40 shadow-sm'
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

            {selectedPreOrderProduct.videoUrl && (
              <button
                type="button"
                onClick={() => setShowVideoModal(true)}
                className={`w-16 h-16 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center gap-1 border-2 transition-all shrink-0 aspect-square cursor-pointer ${
                  showVideoModal
                    ? 'border-[#38BDF8] ring-2 ring-[#38BDF8]/40 shadow-sm'
                    : 'border-slate-700 opacity-80 hover:opacity-100'
                }`}
              >
                <Play className="w-5 h-5 text-[#38BDF8] fill-[#38BDF8]" />
                <span className="text-[9px] font-bold uppercase">Video</span>
              </button>
            )}
          </div>

          {/* Main Interactive Square Viewer */}
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
              {showVideoModal && selectedPreOrderProduct.videoUrl ? (
                <div className="w-full h-full bg-black flex items-center justify-center relative">
                  {isMp4Video ? (
                    <video
                      src={selectedPreOrderProduct.videoUrl}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <iframe
                      src={selectedPreOrderProduct.videoUrl}
                      title={selectedPreOrderProduct.title}
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
                    key={modalImages[activeMediaIndex] || 'po-modal-img'}
                    src={modalImages[activeMediaIndex] || modalImages[0]}
                    alt={selectedPreOrderProduct.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain p-2 bg-slate-50/60 transition-all duration-300 ease-in-out"
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
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center transition-all opacity-85 hover:opacity-100 shadow-md cursor-pointer z-10 text-base font-bold active:scale-95"
                        aria-label="Previous Image"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveMediaIndex((prev) => (prev + 1) % modalImages.length)
                        }
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center transition-all opacity-85 hover:opacity-100 shadow-md cursor-pointer z-10 text-base font-bold active:scale-95"
                        aria-label="Next Image"
                      >
                        ›
                      </button>
                    </>
                  )}

                  {modalImages.length > 1 && (
                    <div className="absolute bottom-3 right-3 bg-black/65 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full pointer-events-none select-none tracking-wider shadow-sm z-10">
                      {activeMediaIndex + 1} / {modalImages.length}
                    </div>
                  )}
                </>
              )}

              {/* Badges Overlay */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start z-10 pointer-events-none">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white text-[11px] font-extrabold uppercase shadow-lg">
                  <Clock className="w-3.5 h-3.5" /> PRE-ORDER
                </span>
                {hasDiscount && discountPercent > 0 && (
                  <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-lg">
                    -{discountPercent}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Horizontal Thumbnail Strip */}
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
                      ? 'border-[#38BDF8] ring-2 ring-[#38BDF8]/40 shadow-sm'
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

              {selectedPreOrderProduct.videoUrl && (
                <button
                  type="button"
                  onClick={() => setShowVideoModal(true)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center gap-0.5 border-2 transition-all shrink-0 aspect-square cursor-pointer ${
                    showVideoModal
                      ? 'border-[#38BDF8] ring-2 ring-[#38BDF8]/40 shadow-sm'
                      : 'border-slate-700 opacity-80 hover:opacity-100'
                  }`}
                >
                  <Play className="w-4 h-4 text-[#38BDF8] fill-[#38BDF8]" />
                  <span className="text-[8px] font-bold uppercase">Video</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Details, Schedule, Advance Policy, Variants, CTAs */}
        <div className="md:col-span-5 flex flex-col justify-between space-y-6 px-4 py-4 sm:px-0 sm:py-0">
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-slate-100 text-[#334155] text-xs font-bold uppercase tracking-wider">
                {selectedPreOrderProduct.category}
              </span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                Upcoming Pre-Order Drop
              </span>
            </div>

            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 leading-tight font-['Outfit']">
                {selectedPreOrderProduct.title}
              </h1>
              {selectedPreOrderProduct.tagline && (
                <p className="text-xs font-semibold text-sky-700 mt-1">
                  {selectedPreOrderProduct.tagline}
                </p>
              )}
              <div className="text-xs text-slate-500 font-medium mt-1.5">
                Product Code:{' '}
                <strong className="font-mono text-slate-800">
                  {selectedPreOrderProduct.productCode || selectedPreOrderProduct.id}
                </strong>
              </div>
            </div>

            {/* Conditional "We will get" & "You will get" Timeline Card — ONLY shown when filled */}
            {(weWillGet || youWillGet) && (
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2 text-xs">
                {weWillGet && (
                  <div className="flex items-start gap-2 text-slate-800">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      <strong className="font-bold">We will get:</strong> {weWillGet}
                    </span>
                  </div>
                )}
                {youWillGet && (
                  <div className="flex items-start gap-2 text-slate-800">
                    <CalendarClock className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <span>
                      <strong className="font-bold">You will get:</strong> {youWillGet}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Required Advance Payment Box */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-indigo-800 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-indigo-600" />
                  <span>{advanceModeLabel}</span>
                </span>
                <span className="text-[10px] font-extrabold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md border border-rose-200">
                  COD Disabled
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-sky-200/70 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block font-semibold">
                    Pay Now (Advance)
                  </span>
                  <span className="font-black text-indigo-700 text-sm tabular-nums">
                    ৳{totalAdvanceNow.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-semibold">
                    Due on Delivery
                  </span>
                  <span className="font-black text-slate-800 text-sm tabular-nums">
                    ৳{dueOnDelivery.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Price & Free Delivery */}
            <div className="flex items-center flex-wrap gap-3 pt-1">
              {selectedPreOrderProduct.isFreeShipping && (
                <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-300 text-xs font-black text-emerald-700 shadow-2xs">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>Free Delivery</span>
                </div>
              )}
              <span className="text-3xl font-black text-[#1E293B] tabular-nums">
                ৳{effectiveUnitPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-base text-slate-400 line-through font-semibold tabular-nums">
                  ৳{regularPrice.toLocaleString()}
                </span>
              )}
              {hasDiscount && discountPercent > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-xs font-black uppercase tracking-wider shadow-sm">
                  -{discountPercent}% OFF
                </span>
              )}
            </div>

            {quotaStatus.tracksQuota && (
              isFulfilled ? (
                <div className="p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-300 space-y-2">
                  <p className="text-xs sm:text-sm font-black text-rose-800 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>
                      Pre-Order Fulfilled
                      {quotaStatus.totalQuotaDisplay > 0
                        ? ` — All ${quotaStatus.totalQuotaDisplay} pcs Sold!`
                        : '!'}
                      {' '}Please Contact Us
                    </span>
                  </p>
                  <p className="text-[11px] text-rose-700 font-medium">
                    This batch has reached full booking capacity. Message us on WhatsApp to request restock priority.
                  </p>
                </div>
              ) : (
                <div className={`px-3 py-2 rounded-xl border text-xs font-extrabold flex items-center justify-between ${
                  quotaStatus.isLowSlot
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}>
                  <span>
                    {quotaStatus.isLowSlot
                      ? `Hurry! Low Pre-Order Slots (${quotaStatus.remaining} left)`
                      : `Pre-Order Slots Available: ${quotaStatus.remaining} pcs`}
                  </span>
                  {quotaStatus.totalQuotaDisplay > 0 && (
                    <span className="font-mono text-[10px] opacity-80">
                      Booked: {quotaStatus.bookedCount}/{quotaStatus.totalQuotaDisplay}
                    </span>
                  )}
                </div>
              )
            )}

            {stockNotice && (
              <div className="p-2.5 rounded-xl bg-rose-500 text-white font-black text-xs flex items-center gap-2 shadow-md">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-200" />
                <span>{stockNotice}</span>
              </div>
            )}

            {/* Color Selection Grid (ONLY when color variants exist) */}
            {showColorSection && (
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                    <span>1. Select Color:</span>
                    <span className="text-[#38BDF8] font-black">{activeColor || 'None'}</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-bold">
                    {normalizedColors.length} Colors
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {normalizedColors.map((col, idx) => {
                    const isActive = activeColor.toLowerCase() === col.name.toLowerCase();
                    const chosenInCol = Object.entries(variantQuantities).reduce(
                      (sum, [key, qty]) => {
                        const [c] = key.split('__');
                        return c.toLowerCase() === col.name.toLowerCase() ? sum + qty : sum;
                      },
                      0
                    );

                    return (
                      <button
                        key={`${col.name}-${idx}`}
                        type="button"
                        onClick={() => handleSelectColor(col)}
                        className={`p-2.5 rounded-2xl border text-left transition-all relative flex items-center gap-2.5 cursor-pointer ${
                          isActive
                            ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-sky-400 shadow-md'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="relative shrink-0">
                          {col.image ? (
                            <img
                              src={resolveStoreAssetUrl(col.image)}
                              alt={col.name}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 object-cover rounded-xl border border-slate-200 bg-white shadow-2xs"
                            />
                          ) : (
                            <div
                              className="w-10 h-10 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-center"
                              style={{ backgroundColor: col.hex || '#1E293B' }}
                            >
                              {isActive && <Check className="w-4 h-4 text-white" />}
                            </div>
                          )}
                          <div
                            className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs"
                            style={{ backgroundColor: col.hex || '#1E293B' }}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="font-extrabold text-xs truncate">{col.name}</p>
                          <p className="text-[9px] font-bold text-emerald-500">Available</p>
                        </div>

                        {chosenInCol > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white font-black text-[9px] w-5 h-5 rounded-full flex items-center justify-center shadow">
                            {chosenInCol}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size & Quantity Matrix Table (ONLY when product actually has sizes) */}
            {hasSizeSection ? (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wide">
                    {showColorSection
                      ? '2. Select Sizes & Quantities:'
                      : '1. Select Sizes & Quantities:'}
                  </label>
                  <span className="text-[10px] text-slate-500 font-bold">
                    {currentSizes.length} Option(s)
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-black text-[11px] uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3">Size</th>
                        <th className="py-2.5 px-3">Price</th>
                        <th className="py-2.5 px-3 text-right">Quantity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentSizes.map((rowItem, idx) => {
                        const colKey = activeColor || 'default';
                        const szKey = rowItem.size;
                        const comboKey = `${colKey}__${szKey}`;
                        const currentQty = variantQuantities[comboKey] || 0;

                        return (
                          <tr
                            key={`${comboKey}-${idx}`}
                            className={`transition-colors ${
                              currentQty > 0 ? 'bg-sky-50/70 font-semibold' : 'hover:bg-slate-50'
                            }`}
                          >
                            <td className="py-3 px-3">
                              <span className="px-2.5 py-1 rounded-lg font-extrabold text-xs bg-slate-900 text-white">
                                {rowItem.size}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-mono font-black text-rose-600 text-xs tabular-nums">
                              ৳{Number(rowItem.price || 0).toLocaleString()}
                            </td>
                            <td className="py-3 px-3 text-right">
                              {currentQty === 0 ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleSetQty(activeColor, rowItem.size, 1, rowItem.stock)
                                  }
                                  className="px-3 py-1.5 rounded-lg bg-[#38BDF8] hover:bg-sky-500 text-slate-950 font-black text-xs shadow-xs transition-all cursor-pointer inline-flex items-center gap-1"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Add</span>
                                </button>
                              ) : (
                                <div className="inline-flex items-center gap-2">
                                  <div className="inline-flex items-center bg-white border border-slate-300 rounded-lg p-0.5">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleSetQty(
                                          activeColor,
                                          rowItem.size,
                                          currentQty - 1,
                                          rowItem.stock
                                        )
                                      }
                                      className="w-6 h-6 flex items-center justify-center rounded bg-slate-100 text-slate-800 hover:bg-rose-100 hover:text-rose-600 cursor-pointer"
                                    >
                                      {currentQty === 1 ? (
                                        <Trash2 className="w-3 h-3 text-rose-500" />
                                      ) : (
                                        <Minus className="w-3 h-3" />
                                      )}
                                    </button>
                                    <span className="w-7 text-center font-black font-mono text-xs text-slate-900 tabular-nums">
                                      {currentQty}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleSetQty(
                                          activeColor,
                                          rowItem.size,
                                          currentQty + 1,
                                          rowItem.stock
                                        )
                                      }
                                      className="w-6 h-6 flex items-center justify-center rounded bg-[#38BDF8] text-slate-950 hover:bg-sky-500 cursor-pointer"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <span className="font-mono font-black text-xs text-slate-900 min-w-[48px] text-right tabular-nums">
                                    ৳{(Number(rowItem.price || 0) * currentQty).toLocaleString()}
                                  </span>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Clean Quantity Stepper when product has NO sizes (works cleanly for Color-Only AND No-Variant products) */
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <div>
                  <span className="text-xs font-black uppercase text-slate-800 block">
                    {showColorSection ? `Quantity (${activeColor || 'Selected'})` : 'Quantity'}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 font-semibold tabular-nums">
                    ৳{Number(activeColorDetails.price || effectiveUnitPrice).toLocaleString()} / unit
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleSetQty(
                        activeColor || 'default',
                        'default',
                        Math.max(1, simpleColorOnlyQty - 1),
                        activeColorDetails.stock
                      )
                    }
                    className="w-8 h-8 rounded-lg border border-slate-300 bg-white flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-black tabular-nums">
                    {simpleColorOnlyQty}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleSetQty(
                        activeColor || 'default',
                        'default',
                        simpleColorOnlyQty + 1,
                        activeColorDetails.stock
                      )
                    }
                    className="w-8 h-8 rounded-lg border border-slate-300 bg-white flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Selected Summary Chips */}
            {selectedLineItems.length > 0 && (hasSizeSection || selectedLineItems.length > 1) && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between font-extrabold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <PackageCheck className="w-4 h-4 text-emerald-600" />
                    <span>Selected Items ({totalSelectedUnits} pcs):</span>
                  </span>
                  <span className="font-mono text-rose-600 font-black text-sm tabular-nums">
                    ৳{totalBillAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedLineItems.map((item, idx) => {
                    const key = `${item.selectedColor || 'default'}__${item.selectedSize || 'default'}`;
                    return (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-1 bg-white px-2 py-1 rounded-lg text-xs border border-slate-200 shadow-2xs"
                      >
                        <span>
                          {[item.selectedColor, item.selectedSize].filter(Boolean).join(' - ') ||
                            'Standard'}
                          :
                        </span>
                        <strong className="font-mono text-rose-600">×{item.quantity}</strong>
                        <button
                          type="button"
                          onClick={() => handleRemoveKey(key)}
                          className="p-0.5 hover:bg-rose-100 rounded-full text-rose-600 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={isFulfilled}
                onClick={handleProceedPreOrderCheckout}
                className={`w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all uppercase tracking-wider whitespace-nowrap ${
                  isFulfilled
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-white hover:scale-[1.01] active:scale-[0.98] cursor-pointer'
                }`}
              >
                <Zap className="w-4 h-4 text-amber-200 fill-amber-200" />
                <span>
                  {isFulfilled
                    ? 'PRE-ORDER FULFILLED (SOLD OUT)'
                    : `PRE-ORDER NOW (৳${totalAdvanceNow.toLocaleString()})`}
                </span>
              </button>

              <button
                type="button"
                disabled={isFulfilled}
                onClick={handleAddToCartAll}
                className={`w-full py-3.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all whitespace-nowrap ${
                  isFulfilled
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'cursor-pointer bg-slate-900 hover:bg-slate-800 text-white hover:scale-[1.01] active:scale-[0.98]'
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-sky-400" />
                <span>
                  {isFulfilled
                    ? 'SOLD OUT'
                    : `ADD TO CART ${totalSelectedUnits > 0 ? `(${totalSelectedUnits})` : ''}`}
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleWhatsAppOrder}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer active:scale-[0.98]"
            >
              <MessageSquare className="w-4.5 h-4.5 fill-white text-emerald-600" />
              <span>{isFulfilled ? 'Contact Us via WhatsApp' : 'Order via WhatsApp'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Full Product Description (NO Customer Reviews per requirement) */}
      <div className="bg-[#F4F7FA] p-6 sm:p-8 border-t border-slate-200 space-y-6 shrink-0">
        <div className="max-w-4xl mx-auto space-y-4">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider font-['Outfit'] border-b border-slate-200 pb-2">
            Full Product Description &amp; Highlights
          </h3>
          <div
            className="text-xs sm:text-sm text-slate-700 leading-relaxed prose prose-slate max-w-none bg-[#F8FAFC] p-5 rounded-2xl border border-slate-200 shadow-xs"
            dangerouslySetInnerHTML={{
              __html:
                selectedPreOrderProduct.description?.replace(/\n/g, '<br />') ||
                'No detailed description provided.',
            }}
          />
        </div>
      </div>

      {/* Related Products Section */}
      {(relatedPreOrders.length > 0 || relatedRegularProducts.length > 0) && (
        <div className="bg-[#ECF1F6] p-5 sm:p-8 border-t border-slate-200 shrink-0">
          <div className="max-w-7xl mx-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h3 className="text-base sm:text-lg font-black text-slate-900 font-['Outfit'] tracking-tight">
                Related Products
              </h3>
              <span className="text-[11px] font-bold text-slate-500">
                {relatedPreOrders.length + relatedRegularProducts.length} Items
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {relatedPreOrders.map((rel) => (
                <PreOrderCard key={`rel-po-${rel.id}`} item={rel} />
              ))}
              {relatedRegularProducts.map((prod) => (
                <div
                  key={`rel-reg-${prod.id}`}
                  onClickCapture={() => setSelectedPreOrderProduct(null)}
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
